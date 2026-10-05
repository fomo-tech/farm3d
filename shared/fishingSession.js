import { FISHING_CONFIG, fishingInventoryCount, fishingCapacity, calculateFishSaleValue } from './fishingConfig.js';
import { fishingWaterAt } from './fishing.js';

export const FISHING_GAME = Object.freeze({ hookWindowMs: 2400, fightMs: 35000, pulseMinMs: 180, pulseMaxMs: 2000, goal: 100 });
export function fishingTimePhase(now=Date.now()) {
  return ['dawn','day','dusk','night'][Math.floor((Math.floor(now/1000)%240)/60)];
}
export function fishingMissionProgress(fishing,mission) {
  return mission.kind==='species' ? Object.values(fishing.collection||{}).filter(record=>record.count>0).length : fishing.stats?.totalCaught||0;
}
export function claimFishingMission(fishing,id) {
  const mission=FISHING_CONFIG.missions[id];
  if(!mission || fishingMissionProgress(fishing,mission)<mission.goal || fishing.claimedMissions.includes(id))throw new Error('Nhiệm vụ chưa hoàn thành hoặc đã nhận thưởng.');
  fishing.claimedMissions.push(id);return {coins:mission.coins,xp:mission.xp};
}
export function publicFishingProgress(progress) {
  if (!progress?.fishing?.pending) return progress;
  const { fishId, weight, ...pending } = progress.fishing.pending;
  return { ...progress, fishing: { ...progress.fishing, pending } };
}
export function fishResistance(pending, now) {
  return Math.floor((now - pending.hookedAt) / 1800) % 3 === 1;
}
function awardFish(fishing, session, now) {
  if (fishingInventoryCount(fishing) >= fishingCapacity(fishing)) { fishing.pending = null; return { fishEscaped: 'Thùng cá đã đầy.' }; }
  const fish = FISHING_CONFIG.fish[session.fishId];
  if (!fish) throw new Error('Loài cá không hợp lệ.');
  const entry = fishing.fish[session.fishId] ||= {count:0,totalWeight:0,maxWeight:0};
  entry.count++; entry.totalWeight += session.weight; entry.maxWeight = Math.max(entry.maxWeight,session.weight);
  const value = calculateFishSaleValue(session.fishId,session.weight);
  const record = {id:session.fishId,weight:session.weight,value,rarity:fish.rarity,caughtAt:now};
  fishing.catchLog.push(record); fishing.catchLog = fishing.catchLog.slice(-FISHING_CONFIG.defaults.maxCatchLog);
  fishing.collection ||= {};
  const collection = fishing.collection[session.fishId] ||= {count:0,maxWeight:0};
  collection.count++; collection.maxWeight = Math.max(collection.maxWeight,session.weight);
  fishing.stats.totalCaught++; if(fish.rarity!=='common')fishing.stats.rareCaught++;
  fishing.stats.largestFish = Math.max(fishing.stats.largestFish,session.weight);
  fishing.pending = null;
  return {fishCaught:session.fishId,weight:session.weight,value,rarity:fish.rarity,zone:session.zone,xp:fish.xp};
}
export function advanceFishingSession(fishing, action, payload, context, now = Date.now()) {
  const session = fishing.pending;
  if (!session || payload.sessionId !== session.id) throw new Error('Phiên câu không còn hợp lệ.');
  if (action === 'fishing_cancel') { fishing.pending = null; return { fishEscaped: now>session.expiresAt ? 'Cá đã bơi đi mất.' : 'Đã thu cần.' }; }
  if (context.venue || fishingWaterAt(context.x, context.z) !== session.zone || Math.hypot(context.x-session.x,context.z-session.z)>2.5) {
    fishing.pending = null; return { fishEscaped: 'Bạn đã rời vị trí thả câu.' };
  }
  if (now > session.expiresAt) { fishing.pending = null; return { fishEscaped: 'Cá đã bơi đi mất.' }; }
  if (action === 'fishing_reel') {
    if (session.phase === 'fighting') throw new Error('Đang kéo cá.');
    if (now < session.biteAt) throw new Error('Cá chưa cắn.');
    const rarity = FISHING_CONFIG.fish[session.fishId]?.rarity;
    if (rarity === 'common' || rarity === 'uncommon') return awardFish(fishing, session, now);
    session.phase = 'fighting'; session.hookedAt = now; session.lastPulseAt = now;
    session.expiresAt = now + FISHING_GAME.fightMs; session.tension = 40; session.pull = 0; session.sequence = 0;
    return {};
  }
  if (action !== 'fishing_pull' || session.phase !== 'fighting') throw new Error('Hãy giật cần khi cá cắn trước.');
  if (payload.sequence !== session.sequence + 1 || typeof payload.holding !== 'boolean') throw new Error('Thao tác kéo cá không hợp lệ.');
  const elapsed = now - session.lastPulseAt;
  if (elapsed < FISHING_GAME.pulseMinMs) throw new Error('Thao tác quá nhanh.');
  if (elapsed > FISHING_GAME.pulseMaxMs) { fishing.pending = null; return { fishEscaped: 'Dây bị chùng vì ngừng thao tác.' }; }
  const seconds = elapsed / 1000;
  const struggling = fishResistance(session, now);
  const rod = FISHING_CONFIG.rods[session.rodId];
  session.tension = Math.max(0, Math.min(100, session.tension + seconds * (payload.holding ? (struggling ? 42 : 12) : -28)));
  session.pull = Math.max(0, session.pull + seconds * (payload.holding ? (struggling ? 3 : 15) * Math.min(1.3, rod?.reelPower || 1) : -2));
  session.lastPulseAt = now; session.sequence = payload.sequence;
  if (session.tension >= 100 || session.tension <= 0) { fishing.pending = null; return { fishEscaped: session.tension>=100 ? 'Dây căng quá, cá đã tuột!' : 'Dây chùng quá, cá đã thoát!' }; }
  if (session.pull < FISHING_GAME.goal) return {};
  return awardFish(fishing, session, now);
}
