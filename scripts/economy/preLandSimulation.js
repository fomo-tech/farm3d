import {fishingBiteBounds} from '../../shared/fishingConditions.js';
import { missionStats } from '../../shared/preLandJourney.js';
import { normalizeMissions, dailyMissionList, missionProgress, claimMission } from '../../shared/missions.js';
import { missionAvailability } from '../../shared/missionEligibility.js';
import { ECONOMY_REWARD_CONFIG } from '../../shared/economyRewardConfig.js';
import { FISHING_CONFIG, normalizeFishingState, fishingInventoryCount, fishingCapacity } from '../../shared/fishingConfig.js';
import { pickFishingCatch } from '../../shared/fishingCatch.js';
import { FISHING_GAME, advanceFishingSession, fishResistance, claimFishingMission } from '../../shared/fishingSession.js';
import { sellFishingCatch } from '../../shared/fishingSales.js';
import { ATTENDANCE_REWARDS, getAttendanceStatus } from '../../shared/dailyAttendance.js';
import { applyCommunityReward, COMMUNITY_CODES } from '../../server/CommunityRewards.js';
import { LAND_CONFIG } from '../../shared/landConfig.js';
import { FARM_CONFIG } from '../../shared/farmConfig.js';
import { MAIN_MISSIONS, DAILY_MISSIONS } from '../../shared/missions.js';
import { NPC_TRADING_CONFIG } from '../../shared/npcTradingConfig.js';

export const CURRENT_POLICY = {
  id: 'current', initialCoins: ECONOMY_REWARD_CONFIG.initial.coins,
  codes: COMMUNITY_CODES, attendance: [...ATTENDANCE_REWARDS],
  landPrice: Math.max(LAND_CONFIG.minPrice, LAND_CONFIG.minPrice - LAND_CONFIG.starterDiscount),
};

// Proposed future reward budget, simulated only. Existing issued codes stay intact.
export const TRIAL_POLICY = {
  ...CURRENT_POLICY, id: 'trial', landPrice: 6000,
  codes: {
    TRIAL_WELCOME: { coins: 100, enabled: true, expiresAt: null },
    TRIAL_COMMUNITY: { coins: 100, enabled: true, expiresAt: null },
    TRIAL_NEW_FARMER: { coins: 100, enabled: true, expiresAt: null },
  },
  attendance: [100, 120, 140, 160, 180, 220, 300],
};

// All timing/success inputs are hypotheses, not observed player telemetry.
export const PLAY_PROFILES = {
  fast: { initialTravelMs: 60000, returnTravelMs: 15000, saleMs: 3000, castOverheadMs: 1200, betweenCastsMs: 1200, reactionMs: 300, hookSuccess: .98, rareFightSuccess: .95 },
  regular: { initialTravelMs: 180000, returnTravelMs: 45000, saleMs: 6000, castOverheadMs: 2500, betweenCastsMs: 3000, reactionMs: 750, hookSuccess: .90, rareFightSuccess: .80 },
  relaxed: { initialTravelMs: 240000, returnTravelMs: 75000, saleMs: 10000, castOverheadMs: 5000, betweenCastsMs: 6000, reactionMs: 1200, hookSuccess: .75, rareFightSuccess: .60 },
};

export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let n = Math.imul(state ^ state >>> 15, state | 1);
    n ^= n + Math.imul(n ^ n >>> 7, n | 61);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}

export function rewardCatalog(now = Date.UTC(2026, 9, 6, 2)) {
  const entries = [
    { id: 'initial', kind: 'initial', coins: ECONOMY_REWARD_CONFIG.initial.coins, availableBeforeLand: true },
    ...Object.entries(COMMUNITY_CODES).map(([id,c]) => ({ id, kind: 'giftcode', ...c, availableBeforeLand: c.enabled && (c.expiresAt === null || now < c.expiresAt) })),
    { id: 'neighbor-water', kind: 'repeatable-help', coins: 5, availableBeforeLand: true, reason: 'Requires another owned farm, open gate and planted/unwatered crop; excluded from fishing-only strategy' },
    { id: 'attendance', kind: 'daily', coinsByDay: [...ATTENDANCE_REWARDS], availableBeforeLand: true, reset: 'UTC, 07:00 Vietnam' },
    ...Object.entries(FISHING_CONFIG.missions).map(([id,m]) => ({ id, kind: 'fishing-mission', coins: m.coins, goal: m.goal, availableBeforeLand: true })),
    { id: 'tutorial-seeds', kind: 'onboarding', ...ECONOMY_REWARD_CONFIG.onboarding.seeds, availableBeforeLand: false },
    { id: 'tutorial-completion', kind: 'onboarding', ...ECONOMY_REWARD_CONFIG.onboarding.completion, availableBeforeLand: false },
    ...Object.entries(ECONOMY_REWARD_CONFIG.quests).map(([id,m]) => ({ id, kind: 'legacy-quest', coins:m.coins, goal:m.goal, availableBeforeLand:false })),
    ...MAIN_MISSIONS.map(m => ({ id:m.id, kind:'main-mission', coins:m.coins, goal:m.goal, availableBeforeLand:false, reason:'Requires completed farm onboarding' })),
    ...DAILY_MISSIONS.map(m => ({ id:m.id, kind:'daily-mission', coins:m.coins, goal:m.goal, availableBeforeLand:false, reason:'Requires completed farm onboarding', reset:'UTC+7' })),
    ...Object.entries(NPC_TRADING_CONFIG.orders).map(([id,m]) => ({ id, kind:'order', coins:m.coins, inputs:m.items, availableBeforeLand:true, reason:'Requires actual goods; not a free reward and not modeled as fishing income' })),
  ];
  return { entries, totals: {
    initial: ECONOMY_REWARD_CONFIG.initial.coins,
    activeCodes: entries.filter(e=>e.kind==='giftcode'&&e.availableBeforeLand).reduce((sum,e)=>sum+e.coins,0),
    attendanceWeek: ATTENDANCE_REWARDS.reduce((a,b)=>a+b,0),
    fishingOneTime: Object.values(FISHING_CONFIG.missions).reduce((sum,m)=>sum+m.coins,0),
    onboardingOneTime: ECONOMY_REWARD_CONFIG.onboarding.seeds.coins+ECONOMY_REWARD_CONFIG.onboarding.completion.coins,
    legacyOneTime: Object.values(ECONOMY_REWARD_CONFIG.quests).reduce((sum,m)=>sum+m.coins,0),
    mainOneTime: MAIN_MISSIONS.reduce((sum,m)=>sum+m.coins,0),
    dailyFarm: DAILY_MISSIONS.reduce((sum,m)=>sum+m.coins,0),
  } };
}

const BANKS = { lake: {x:162,z:2}, pond:{x:89,z:68}, river:{x:220,z:-380}, sea:{x:0,z:360} };

function planCatch(fishing, zone, baitId, now, profile, random, serial) {
  const config = FISHING_CONFIG;
  const bait = config.baits[baitId];
  const catchData = pickFishingCatch(zone, baitId, random, now + profile.castOverheadMs);
  const bounds=fishingBiteBounds(zone,baitId,'rod_bamboo',now+profile.castOverheadMs);
  const biteMs=Math.floor(bounds.minMs+random()*(bounds.maxMs-bounds.minMs));
  const durationBeforeHook = profile.castOverheadMs + biteMs;
  if (random() >= profile.hookSuccess || profile.reactionMs > FISHING_GAME.hookWindowMs) {
    return { duration: durationBeforeHook + FISHING_GAME.hookWindowMs + profile.betweenCastsMs, next: null, caught: false, reason:'missed-hook' };
  }
  const next = {
    ...fishing,
    fish: Object.fromEntries(Object.entries(fishing.fish).map(([id,entry]) => [id,{...entry}])),
    collection: Object.fromEntries(Object.entries(fishing.collection).map(([id,entry]) => [id,{...entry}])),
    stats: {...fishing.stats}, catchLog: [...fishing.catchLog],
    // The session engine appends records but does not mutate past log entries.
  };
  const context = BANKS[zone];
  const id = `simulation-${serial}`;
  next.pending = {id,phase:'waiting',...context,zone,rodId:'rod_bamboo',fishId:catchData.fishId,weight:catchData.weight,
    biteAt:now+durationBeforeHook,expiresAt:now+durationBeforeHook+FISHING_GAME.hookWindowMs};
  let time = now + durationBeforeHook + profile.reactionMs;
  let result = advanceFishingSession(next,'fishing_reel',{sessionId:id},context,time);
  if (next.pending) {
    const competent = random() < profile.rareFightSuccess;
    // Use the actual server tension/pull model, with a repeatable control strategy.
    while (next.pending) {
      time += 400;
      const holding = competent
        ? ((!fishResistance(next.pending,time) && next.pending.tension < 73) || next.pending.tension < 23)
        : true;
      result = advanceFishingSession(next,'fishing_pull',{sessionId:id,sequence:next.pending.sequence+1,holding},context,time);
    }
  }
  return {duration:time-now+profile.betweenCastsMs,next,caught:Boolean(result.fishCaught),reason:result.fishEscaped || null,xp:result.xp||0};
}

export function simulatePreLand({seed=1, sessionMinutes=30, sessions=4, profile='regular', useCodes=false,
  baitId=null, zone='lake', policy=CURRENT_POLICY, measuredProfiles={}, startAt=Date.UTC(2026,9,6,2), attendance=true, includeDaily=true, stopAtLand=false} = {}) {
  if (!Number.isSafeInteger(sessionMinutes)||sessionMinutes<1||!Number.isSafeInteger(sessions)||sessions<1) throw new Error('Invalid session schedule');
  if (!PLAY_PROFILES[profile] || !BANKS[zone] || (baitId!==null&&!Object.hasOwn(FISHING_CONFIG.baits,baitId))) throw new Error('Invalid strategy');
  if (!Number.isSafeInteger(policy.landPrice)||policy.landPrice<1 || !Number.isSafeInteger(policy.initialCoins)||policy.initialCoins<0
    || policy.attendance.length!==7 || policy.attendance.some(n=>!Number.isSafeInteger(n)||n<0)) throw new Error('Invalid economy policy');
  const timing={...PLAY_PROFILES[profile],...measuredProfiles[profile]}, random=seededRandom(seed);
  for (const [key,value] of Object.entries(timing)) {
    if (!Number.isFinite(value) || value < 0 || (['hookSuccess','rareFightSuccess'].includes(key) && value > 1)) throw new Error('Invalid measured profile');
  }
  const progress={coins:policy.initialCoins,xp:0,stats:{},onboarding:{completed:false},fishing:normalizeFishingState()};
  let totalActiveMs=0, attempts=0, caught=0, escaped=0, sold=0, trips=0, fallbackCasts=0;
  let firstAffordable=null, firstWithReserve=null, location='shop', travelRemaining=0, travelTo=null, initialArrival=true;
  let rodOwned=false;
  const ledger=[], summaries=[];
  const seedReserve=4*FARM_CONFIG.crops.carrot.seedCost;
  const milestone=(session,now)=>{
    const record={activeMinutes:+(totalActiveMs/60000).toFixed(3),calendarHours:+((now-startAt)/3600000).toFixed(3),session,
      coins:progress.coins,walletAfterLand:progress.coins-policy.landPrice,
      nextTutorialCoins:ECONOMY_REWARD_CONFIG.onboarding.seeds.coins,
      nextTutorialFreeSeeds:ECONOMY_REWARD_CONFIG.onboarding.seeds.seeds, at:now};
    if (!firstAffordable&&progress.coins>=policy.landPrice) firstAffordable={...record, ...(stopAtLand ? {progress:structuredClone(progress)} : {})};
    if (!firstWithReserve&&progress.coins>=policy.landPrice+seedReserve) firstWithReserve={...record};
  };
  const add=(source,delta,session,now)=>{
    progress.coins+=delta;
    if (!Number.isSafeInteger(progress.coins)||progress.coins<0) throw new Error('Invalid balance during simulation');
    ledger.push({source,delta,session,activeMs:totalActiveMs,at:now});milestone(session,now);
  };
  for(let session=1;session<=sessions;session++) {
    // 09:00 and 19:00 UTC+7, two sessions per day; money/inventory persist offline.
    let now=startAt+Math.floor((session-1)/2)*86400000+((session-1)%2)*36000000;
    const end=now+sessionMinutes*60000, startingCoins=progress.coins, ledgerStart=ledger.length;
    const startCaught=caught,startAttempts=attempts,startSold=sold,startTrips=trips;
    progress.missions=normalizeMissions(progress.missions,missionStats(progress),now,{hasLand:false});
    milestone(session,now);
    const claim=(action,payload,source)=>{
      const before=progress.coins;
      const result=applyCommunityReward(progress,action,payload,now,policy.codes,policy.attendance);
      progress.coins=before;add(source,result.communityReward.coins,session,now);
    };
    if(useCodes&&session===1)for(const [code,c]of Object.entries(policy.codes))if(c.enabled&&(c.expiresAt===null||now<c.expiresAt))claim('redeem_giftcode',{code},'giftcode');
    if(attendance&&!getAttendanceStatus(progress.communityRewards?.daily,now,policy.attendance).claimedToday)claim('claim_daily_reward',{},'attendance');
    const spendTime=ms=>{const spent=Math.min(ms,end-now);now+=spent;totalActiveMs+=spent;return spent;};
    while(now<end && !(stopAtLand && firstAffordable)) {
      const daily = includeDaily && dailyMissionList(progress.missions).find(m => !progress.missions.daily.claimed.includes(m.id) && !missionAvailability(m,progress,{hasLand:false}) && missionProgress(m,missionStats(progress),progress.missions,'daily') >= m.goal);
      if (daily && end-now >= 2000) {
        spendTime(2000);
        const before=progress.coins;
        const error=claimMission(progress,'daily',daily.id,now,{hasLand:false});
        if(error)throw new Error(error);
        const reward=progress.coins-before;progress.coins=before;add('daily-mission',reward,session,now);
        continue;
      }

      if(travelTo!==null) {
        travelRemaining-=spendTime(travelRemaining);
        if(travelRemaining===0) {location=travelTo;travelTo=null;}
        continue;
      }
      if(location==='shop') {
        if(fishingInventoryCount(progress.fishing)) {
          if(end-now<timing.saleMs) {spendTime(end-now);break;}
          spendTime(timing.saleMs);
          const sale=sellFishingCatch(progress.fishing,'fishing_sell_all',{},now);sold+=sale.count;
          add('fish-sale',sale.coins,session,now);
        }
        if(!rodOwned) {
          const price=FISHING_CONFIG.rods.rod_bamboo.cost;
          if(progress.coins<price) {spendTime(end-now);break;}
          add('rod',-price,session,now);rodOwned=true;
          progress.fishing.ownedRods=['rod_bamboo'];progress.fishing.equippedRod='rod_bamboo';
        }
        if(baitId&&progress.fishing.bait[baitId]===0&&progress.coins>=FISHING_CONFIG.baits[baitId].cost) {
          const bait=FISHING_CONFIG.baits[baitId];add('bait',-bait.cost,session,now);progress.fishing.bait[baitId]+=bait.quantity;
        }
        travelRemaining=initialArrival?timing.initialTravelMs:timing.returnTravelMs;
        initialArrival=false;travelTo='bank';continue;
      }
      if(fishingInventoryCount(progress.fishing)>=fishingCapacity(progress.fishing)
        || (baitId&&progress.fishing.bait[baitId]===0&&progress.coins>=FISHING_CONFIG.baits[baitId].cost)) {
        travelRemaining=timing.returnTravelMs;travelTo='shop';trips++;continue;
      }
      const chosenBait=baitId&&progress.fishing.bait[baitId]>0?baitId:null;
      if(baitId&&!chosenBait)fallbackCasts++;
      if(chosenBait)progress.fishing.bait[chosenBait]--;
      attempts++;
      const planned=planCatch(progress.fishing,zone,chosenBait,now,timing,random,attempts);
      if(planned.duration>end-now) {
        // Logout cancels the unfinished cast/fight; bait stays spent, no fish awarded.
        spendTime(end-now);escaped++;break;
      }
      spendTime(planned.duration);
      if(planned.next)progress.fishing=planned.next;
      if(planned.caught){caught++;progress.xp+=planned.xp||0;}else escaped++;
      for(const id of Object.keys(FISHING_CONFIG.missions)) {
        if(progress.fishing.claimedMissions.includes(id))continue;
        const mission=FISHING_CONFIG.missions[id];
        const achieved=mission.kind==='caught'?progress.fishing.stats.totalCaught:Object.keys(progress.fishing.collection).length;
        if(achieved>=mission.goal){const reward=claimFishingMission(progress.fishing,id);progress.xp+=reward.xp;add('fishing-mission',reward.coins,session,now);}
      }
    }
    const cashflow={};for(const item of ledger.slice(ledgerStart))cashflow[item.source]=(cashflow[item.source]||0)+item.delta;
    summaries.push({session,day:Math.floor((session-1)/2)+1,startingCoins,endingCoins:progress.coins,netCoins:progress.coins-startingCoins,
      cashflow,caught:caught-startCaught,attempts:attempts-startAttempts,sold:sold-startSold,saleTrips:trips-startTrips,
      unsoldFish:fishingInventoryCount(progress.fishing),remainingBait:baitId?progress.fishing.bait[baitId]:0});
    if(stopAtLand && firstAffordable)break;
  }
  const cashflow={initial:policy.initialCoins};for(const item of ledger)cashflow[item.source]=(cashflow[item.source]||0)+item.delta;
  return {seed,sessionMinutes,sessions,profile,useCodes,includeDaily,baitId,zone,policy:policy.id,landPrice:policy.landPrice,
    firstAffordable,firstWithReserve,coins:progress.coins,seedReserve,cashflow,attempts,caught,escaped,sold,saleTrips:trips,fallbackCasts,
    unsoldFish:fishingInventoryCount(progress.fishing),claimedFishingMissions:[...progress.fishing.claimedMissions],sessionsDetail:summaries,ledger};
}

export function percentile(values, fraction) {
  const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);
  if(!sorted.length)return null;
  return +sorted[Math.floor((sorted.length-1)*fraction)].toFixed(2);
}

export function summarizeRuns(runs) {
  const milestone=r=>r.firstAffordable;
  const completed=runs.filter(milestone);
  const times=completed.map(r=>milestone(r).activeMinutes);
  const reserve=runs.filter(r=>r.firstWithReserve);
  const mean=values=>+(values.reduce((a,b)=>a+b,0)/values.length).toFixed(2);
  return {samples:runs.length,reached:completed.length,reachedFraction:completed.length/runs.length,
    // Percentiles describe reached runs only; the explicit reach rate handles censoring.
    activeMinutes:{p10:percentile(times,.1),p50:percentile(times,.5),p90:percentile(times,.9)},
    sessionAtPurchaseP50:percentile(completed.map(r=>r.firstAffordable.session),.5),
    reserveActiveMinutesP50:percentile(reserve.map(r=>r.firstWithReserve.activeMinutes),.5),
    walletAfterLandP50:percentile(completed.map(r=>r.firstAffordable.walletAfterLand),.5),
    caughtMean:mean(runs.map(r=>r.caught)),escapedMean:mean(runs.map(r=>r.escaped)),saleTripsMean:mean(runs.map(r=>r.saleTrips)),
    firstSessionNetP50:percentile(runs.map(r=>r.sessionsDetail[0].netCoins),.5),
    finalCoinsP50:percentile(runs.map(r=>r.coins),.5),
    cashflowMean:Object.fromEntries([...new Set(runs.flatMap(r=>Object.keys(r.cashflow)))].map(key=>[key,mean(runs.map(r=>r.cashflow[key]||0))]))};
}
