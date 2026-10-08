import { publicFishAppearance } from './fishAppearance.js';
import { FISHING_CONFIG, fishingInventoryCount, fishingCapacity, calculateFishSaleValue } from './fishingConfig.js';
import { fishingWaterAt } from './fishing.js';

export const FISHING_GAME = Object.freeze({ hookWindowMs: 5000, fightMs: 35000, pulseMinMs: 180, pulseMaxMs: 2000, goal: 100 });
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
  // A visual size class is public; the species and exact weight remain server-only.
  const appearance = publicFishAppearance(fishId,weight);
  return { ...progress, fishing: { ...progress.fishing, pending: { ...pending, ...appearance } } };
}
// Public motion describes the fight, never the species or exact weight.
const FIGHT_STYLES = {
 carp:{pullRate:30,rushRate:32,restMs:2200,rushMs:650},
 perch:{pullRate:32,rushRate:37,restMs:1800,rushMs:750},
 river_barb:{pullRate:28,rushRate:35,restMs:2000,rushMs:850},
 river_catfish:{pullRate:23,rushRate:40,restMs:2100,rushMs:1000},
 sea_mackerel:{pullRate:24,rushRate:43,restMs:1700,rushMs:1000},
 sea_snapper:{pullRate:16,rushRate:45,restMs:1700,rushMs:1200},
 golden_carp:{pullRate:13,rushRate:48,restMs:1800,rushMs:1400},
};
export function fishingFightProfile(session) {
 const style=FIGHT_STYLES[session.fishId]||({common:FIGHT_STYLES.perch,uncommon:FIGHT_STYLES.river_catfish,rare:FIGHT_STYLES.sea_snapper,epic:FIGHT_STYLES.golden_carp,legendary:FIGHT_STYLES.golden_carp}[FISHING_CONFIG.fish[session.fishId]?.rarity])||FIGHT_STYLES.carp;
 // Quantize size so public fight coefficients cannot reveal exact hidden weight.
 const weightRatio=session.weight<1?0:session.weight<3?.5:1;
 let seed=0;for(const char of String(session.id||''))seed=(Math.imul(seed,31)+char.charCodeAt(0))>>>0;
 return {...style,slackGraceMs:style.pullRate>=28?1000:600,pullRate:style.pullRate/(1+weightRatio*.2),restMs:style.restMs+seed%401,warningMs:650+seed%251,rushMs:style.rushMs+seed%301,cruiseMs:650+seed%451,direction:seed%2?1:-1};
}
export function fishingFightState(pending,now) {
 const profile=pending.fightProfile||FIGHT_STYLES.golden_carp;
 const elapsed=Math.max(0,now-(pending.hookedAt??now));
 const rest=profile.restMs,warning=profile.warningMs||750,rush=profile.rushMs,cruise=profile.cruiseMs||900;
 const cycle=rest+warning+rush+cruise,position=elapsed%cycle;
 const phase=position<rest?'rest':position<rest+warning?'warning':position<rest+warning+rush?'rush':'cruise';
 return {phase,fatigue:Math.min(1,elapsed/22000),direction:(profile.direction||1)*(Math.floor(elapsed/cycle)%2?-1:1)};
}
export function fishResistance(pending,now){return fishingFightState(pending,now).phase==='rush';}
export function normalizeCastInput(payload={}) {
 const power=payload.power === undefined ? .75 : payload.power,aim=payload.aim===undefined?0:payload.aim;
 if(typeof power!=='number'||!Number.isFinite(power)||power<.25||power>1||![-1,0,1].includes(aim))throw new Error('Lực hoặc hướng ném không hợp lệ.');
 return {power,aim};
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
    const reaction=now-session.biteAt;
    session.hookQuality=reaction<=1000?'perfect':reaction<=3000?'good':'late';
    session.fightProfile=fishingFightProfile(session);
    session.phase = 'fighting'; session.hookedAt = now; session.lastPulseAt = now;
    session.expiresAt = now + FISHING_GAME.fightMs; session.tension = 40; session.pull = session.hookQuality==='perfect'?12:session.hookQuality==='good'?6:0; session.sequence = 0;
    return {};
  }
  if (action !== 'fishing_pull' || session.phase !== 'fighting') throw new Error('Hãy giật cần khi cá cắn trước.');
  if (payload.sequence !== session.sequence + 1 || typeof payload.holding !== 'boolean') throw new Error('Thao tác kéo cá không hợp lệ.');
  const elapsed = now - session.lastPulseAt;
  if (elapsed < FISHING_GAME.pulseMinMs) throw new Error('Thao tác quá nhanh.');
  if (elapsed > FISHING_GAME.pulseMaxMs) { fishing.pending = null; return { fishEscaped: 'Dây bị chùng vì ngừng thao tác.' }; }
  // Integrate in bounded substeps so a delayed pulse cannot skip an entire rush.
  const rod=FISHING_CONFIG.rods[session.rodId];
  const profile=session.fightProfile||fishingFightProfile(session);
  session.fightProfile=profile;
  let cursor=session.lastPulseAt;
  while(cursor<now){
    const step=Math.min(100,now-cursor),seconds=step/1000;
    const motion=fishingFightState(session,cursor+step/2);
    const resistance=motion.phase==='rush',calm=motion.phase==='rest';
    const rise=resistance?profile.rushRate*(1-motion.fatigue*.35):calm?7:14;
    session.tension=Math.max(0,Math.min(100,session.tension+seconds*(payload.holding?rise:cursor-session.hookedAt<(profile.slackGraceMs||0)?0:-20)));
    const rate=(resistance?profile.pullRate*.18:profile.pullRate*(calm?1: .7))*(1+motion.fatigue*.3)*Math.min(1.3,rod?.reelPower||1);
    session.pull=Math.max(0,session.pull+seconds*(payload.holding?rate:-1));
    cursor+=step;
    if(session.tension>=100||session.tension<=0){fishing.pending=null;return {fishEscaped:session.tension>=100?'Dây căng quá, cá đã tuột!':'Dây chùng quá, cá đã thoát!'};}
    if(session.pull>=FISHING_GAME.goal)return awardFish(fishing,session,now);
  }
  session.lastPulseAt = now; session.sequence = payload.sequence;
  if (session.tension >= 100 || session.tension <= 0) { fishing.pending = null; return { fishEscaped: session.tension>=100 ? 'Dây căng quá, cá đã tuột!' : 'Dây chùng quá, cá đã thoát!' }; }
  if (session.pull < FISHING_GAME.goal) return {};
  return awardFish(fishing, session, now);
}
