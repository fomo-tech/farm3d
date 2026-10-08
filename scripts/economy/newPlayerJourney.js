import {simulatePreLand,CURRENT_POLICY} from './preLandSimulation.js';
import {LAND_EXPANSION_CONFIG} from '../../shared/landExpansionConfig.js';
import {simulateCombinedFarm} from './combinedFarmSimulation.js';
import {ECONOMY_REWARD_CONFIG} from '../../shared/economyRewardConfig.js';
import {NPC_TRADING_CONFIG} from '../../shared/npcTradingConfig.js';

export function simulateNewPlayerJourney({seed=1,minutesPerDay=60,days=14,profile='regular',mode='combined',tutorialMinutes=10,expansionConfig=LAND_EXPANSION_CONFIG}={}){
 if(![30,60,120].includes(minutesPerDay)||!Number.isSafeInteger(days)||days<1||days>28||!Number.isFinite(tutorialMinutes)||tutorialMinutes<0)throw new Error('Invalid journey schedule');
 const startAt=Date.UTC(2026,9,7,2),sessionMinutes=minutesPerDay/2;
 const pre=simulatePreLand({seed,profile,sessionMinutes,sessions:days*2,startAt,policy:CURRENT_POLICY,useCodes:false,stopAtLand:true});
 const purchase=pre.firstAffordable;
 if(!purchase)return {seed,minutesPerDay,profile,mode,purchase:null,pre,farm:null};
 const schedule=Array.from({length:days*2},(_,i)=>({startAt:startAt+Math.floor(i/2)*86400000+(i%2)*36000000,minutes:sessionMinutes})).slice(purchase.session-1);
 schedule[0].minutes=(schedule[0].startAt+sessionMinutes*60000-purchase.at)/60000;
 schedule[0].startAt=purchase.at;
 let remaining=tutorialMinutes,completedAt=purchase.at;
 while(schedule.length&&remaining>0){const slot=schedule[0],used=Math.min(slot.minutes,remaining);slot.startAt+=used*60000;slot.minutes-=used;remaining-=used;completedAt=slot.startAt;if(slot.minutes<1/60000)schedule.shift();}
 if(remaining>0||!schedule.length)return {seed,minutesPerDay,profile,mode,purchase,pre,farm:null};
 const p=structuredClone(purchase.progress),order=NPC_TRADING_CONFIG.orders.starter,reward=ECONOMY_REWARD_CONFIG.onboarding;
 p.coins=purchase.walletAfterLand+reward.seeds.coins+order.coins+reward.completion.coins;
 p.xp+=2+1+8+order.xp+reward.completion.xp;
 p.stats={planted:1,watered:1,harvested:1,orders:1,animalsFed:0,crafted:0};
 p.freeSeeds=reward.seeds.seeds-1;p.completedOrders=['starter'];
 p.onboarding={completed:true,freeSeedsReceived:true,bicycleAwarded:true};
 const farm=simulateCombinedFarm({sessionMinutes,sessions:schedule.length,schedule,initialCoins:p.coins,initialXp:p.xp,initialProgress:p,includeRewards:true,mode,expansionConfig});
 const timeTo=n=>{const event=farm.unlocks.find(e=>e.tiles===n);if(!event)return null;const slot=schedule[event.session-1];const previous=farm.rows[event.session-2]?.activeMinutes||0;const at=slot.startAt+(event.activeMinutes-previous)*60000;return {activeMinutes:+(purchase.activeMinutes+tutorialMinutes+event.activeMinutes).toFixed(2),calendarDay:Math.floor((at-startAt)/86400000)+1,coinsAfter:event.coinsAfter};};
 return {seed,minutesPerDay,profile,mode,purchase,pre,tutorial:{minutes:tutorialMinutes,completedAt,coins:reward.seeds.coins+order.coins+reward.completion.coins,xp:2+1+8+order.xp+reward.completion.xp,coinsAfter:p.coins,freeSeeds:p.freeSeeds},farm,milestones:Object.fromEntries([5,6,7,8].map(n=>[n,timeTo(n)]))};
}
