import {getAttendanceStatus} from '../../shared/dailyAttendance.js';
import {missionStats} from '../../shared/preLandJourney.js';
import {missionAvailability} from '../../shared/missionEligibility.js';
import {claimLegacyQuest} from '../../shared/questRewards.js';
import {ECONOMY_REWARD_CONFIG} from '../../shared/economyRewardConfig.js';
import {MAIN_MISSIONS,DAILY_MISSIONS,claimMission,normalizeMissions,dailyMissionList} from '../../shared/missions.js';
import {applyCommunityReward} from '../../server/CommunityRewards.js';
import {FARM_CONFIG,farmBarnCapacity} from '../../shared/farmConfig.js';
import {applyLivestockAction} from '../../shared/livestockActions.js';
import {NPC_TRADING_CONFIG} from '../../shared/npcTradingConfig.js';
import {LAND_EXPANSION_CONFIG,farmTileKeys,landUnlockQuote,unlockFarmTile,validateLandExpansionConfig} from '../../shared/landExpansionConfig.js';

export function simulateCombinedFarm({sessionMinutes=30,sessions=14,actionMs=2500,initialCoins=250,initialXp=80,mode='combined',recipePrices={},expansionConfig=LAND_EXPANSION_CONFIG,animalSpecies=['chicken','cow'],includeRewards=false, initialProgress=null, schedule=null}={}) {
 for(const [key,v] of Object.entries({sessionMinutes,sessions,actionMs,initialCoins,initialXp}))if(!Number.isFinite(v)||v<0)throw new Error(`Invalid ${key}`);
 if(typeof includeRewards!=='boolean')throw new Error('Invalid reward switch');
 if(sessionMinutes<=0||sessionMinutes>1440||actionMs<=0||!Number.isInteger(sessions)||!Number.isSafeInteger(initialCoins)||!Number.isSafeInteger(initialXp)||!['crops','orders','combined'].includes(mode))throw new Error('Invalid simulation options');
 validateLandExpansionConfig(expansionConfig);
 if(animalSpecies.some(id=>!Object.hasOwn(FARM_CONFIG.animals,id))||new Set(animalSpecies).size!==animalSpecies.length)throw new Error('Invalid animals');
 for(const [id,price] of Object.entries(recipePrices))if(!Object.hasOwn(NPC_TRADING_CONFIG.recipes,id)||!Number.isSafeInteger(price)||price<=0)throw new Error('Invalid recipe price');
 const p={...(initialProgress ? structuredClone(initialProgress) : {}),coins:initialCoins,xp:initialXp,level:1,inventory:{},animalPens:{},barnLevel:0,stats:{animalsFed:0,planted:0,watered:0,harvested:0,orders:0,crafted:0},claimedQuests:[],onboarding:{completed:true},freeSeeds:initialProgress?.freeSeeds||0,unlockedTileKeys:[...expansionConfig.initialTiles]};
 if(initialProgress){p.stats={...p.stats,...initialProgress.stats};p.onboarding={...initialProgress.onboarding,completed:true};}
 p.level=Math.min(20,Math.floor(Math.sqrt(p.xp/80))+1);
 const player={progress:p,livestock:[]};
 const plots=new Map(p.unlockedTileKeys.map(key=>[key,{state:'empty'}]));
 const ledger={cropSales:0,animalSales:0,craftedSales:0,orders:0,seeds:0,pens:0,animals:0,feed:0,reset:0,expansion:0,attendance:0,legacyRewards:0,mainRewards:0,dailyRewards:0};
 const rows=[],unlocks=[];let activeMs=0,actions=0,harvests=0,crafts=0,orderCount=0,resets=0,nextAnimalId=0,minCoins=p.coins;
 const cropYield=FARM_CONFIG.security.theft.normalYield;
 const inventoryCount=()=>Object.values(p.inventory).reduce((a,b)=>a+b,0),capacity=farmBarnCapacity(p.barnLevel);
 const goodsValue=id=>FARM_CONFIG.crops[id]?.sellPrice??FARM_CONFIG.products[id]?.sellPrice??recipePrices[id]??NPC_TRADING_CONFIG.recipes[id]?.sell??0;
 const orderIds=Object.keys(NPC_TRADING_CONFIG.orders);let completed=initialProgress?.completedOrders ? [...initialProgress.completedOrders] : [];
 const has=items=>Object.entries(items).every(([id,n])=>(p.inventory[id]||0)>=n);
 const consume=items=>Object.entries(items).forEach(([id,n])=>{p.inventory[id]-=n;});
 if(schedule && (schedule.length!==sessions || schedule.some(s=>!Number.isFinite(s.startAt)||!Number.isFinite(s.minutes)||s.minutes<=0||s.minutes>1440)))throw new Error("Invalid farm schedule");
 for(let session=1;session<=sessions;session++){
  let now=schedule?.[session-1].startAt ?? Date.UTC(2026,9,6,2)+(session-1)*86400000,remaining=(schedule?.[session-1].minutes ?? sessionMinutes)*60000;
  const spendTime=ms=>{now+=ms;remaining-=ms;activeMs+=ms;};
  const act=()=>{actions++;minCoins=Math.min(minCoins,p.coins);spendTime(actionMs);};
  const livestock=(action,payload,bucket)=>{const before=p.coins;applyLivestockAction(player,action,payload,now,()=>`sim-${++nextAnimalId}`);if(bucket)ledger[bucket]+=action==='sell_animal'?p.coins-before:before-p.coins;act();};
  if(includeRewards){p.missions=normalizeMissions(p.missions,missionStats(p),now,{hasLand:true,progress:p,livestock:player.livestock,seed:'simulation'});if(remaining>=actionMs&&!getAttendanceStatus(p.communityRewards?.daily,now).claimedToday){const before=p.coins;applyCommunityReward(p,'claim_daily_reward',{},now);ledger.attendance+=p.coins-before;act();}}
  while(remaining>=actionMs){
   p.level=Math.min(20,Math.floor(Math.sqrt(p.xp/80))+1);
   if(includeRewards){
    const legacy=Object.keys(ECONOMY_REWARD_CONFIG.quests).find(id=>!p.claimedQuests.includes(id)&&p.stats[ECONOMY_REWARD_CONFIG.quests[id].stat]>=ECONOMY_REWARD_CONFIG.quests[id].goal);
    if(legacy){const before=p.coins;const error=claimLegacyQuest(p,legacy);if(error)throw new Error(error);ledger.legacyRewards+=p.coins-before;act();continue;}
    const main=MAIN_MISSIONS.find(m=>!p.missions.main.claimed.includes(m.id));
    if(main&&!missionAvailability(main,p,{hasLand:true,hasLivestock:player.livestock.length>0})&&missionStats(p)[main.stat]>=main.goal){const before=p.coins;const error=claimMission(p,'main',main.id,now,{hasLand:true,hasLivestock:player.livestock.length>0});if(error)throw new Error(error);ledger.mainRewards+=p.coins-before;act();continue;}
    const daily=dailyMissionList(p.missions).find(m=>!missionAvailability(m,p,{hasLand:true,hasLivestock:player.livestock.length>0})&&!p.missions.daily.claimed.includes(m.id)&&(missionStats(p)[m.stat]||0)-(p.missions.daily.baseline[m.stat]||0)>=m.goal);
    if(daily){const before=p.coins;const error=claimMission(p,'daily',daily.id,now,{hasLand:true,hasLivestock:player.livestock.length>0});if(error)throw new Error(error);ledger.dailyRewards+=p.coins-before;act();continue;}
   }
   const available=Object.values(FARM_CONFIG.crops).filter(c=>c.level<=p.level);
   const best=[...available].sort((a,b)=>(cropYield*b.sellPrice-b.seedCost)/(b.growMs+3*actionMs)-(cropYield*a.sellPrice-a.seedCost)/(a.growMs+3*actionMs))[0];
   const outstanding=mode==='crops'?[]:orderIds.filter(id=>!completed.includes(id));
   const readyOrder=outstanding.find(id=>has(NPC_TRADING_CONFIG.orders[id].items));
   if(readyOrder){const o=NPC_TRADING_CONFIG.orders[readyOrder];consume(o.items);p.coins+=o.coins;ledger.orders+=o.coins;p.xp+=o.xp;completed.push(readyOrder);orderCount++;p.stats.orders++;act();continue;}
   const wanted=outstanding.length?NPC_TRADING_CONFIG.orders[outstanding[0]].items:{};
   const hold=id=>wanted[id]||0;
   if(mode==='combined'){
    const pig=player.livestock.find(a=>FARM_CONFIG.animals[a.species].saleOnly&&a.productReadyAt>0&&a.productReadyAt<=now);
    if(pig){livestock('sell_animal',{id:pig.id},'animalSales');continue;}
    const recipe=Object.entries(NPC_TRADING_CONFIG.recipes).find(([id,r])=>has(r.inputs)&&Object.entries(r.inputs).every(([key,n])=>p.inventory[key]-n>=hold(key))&&(recipePrices[id]??r.sell)>Object.entries(r.inputs).reduce((v,[key,n])=>v+n*goodsValue(key),0));
    if(recipe){const [id,r]=recipe;consume(r.inputs);p.inventory[id]=(p.inventory[id]||0)+1;p.xp+=r.xp;crafts++;p.stats.crafted++;act();continue;}
   }
   const mature=[...plots.values()].find(t=>t.state==='watered'&&t.readyAt<=now);
   const animalReady=mode==='combined'?player.livestock.filter(a=>!FARM_CONFIG.animals[a.species].saleOnly&&a.productReadyAt>0&&a.productReadyAt<=now).length:0;
   const sale=Object.entries(p.inventory).find(([id,n])=>n>hold(id));
   if(sale&&(!mature||inventoryCount()+cropYield>capacity||animalReady&&inventoryCount()+animalReady>capacity)){
    const [id,n]=sale,isCrop=!!FARM_CONFIG.crops[id],amount=isCrop?Math.min(99,n-hold(id)):1,coins=goodsValue(id)*amount;
    p.inventory[id]-=amount;p.coins+=coins;ledger[isCrop?'cropSales':NPC_TRADING_CONFIG.recipes[id]?'craftedSales':'animalSales']+=coins;act();continue;
   }
   if(animalReady&&inventoryCount()+animalReady<=capacity){livestock('collect_animals',{},null);continue;}
   if(mature&&inventoryCount()+cropYield<=capacity){p.inventory[mature.crop]=(p.inventory[mature.crop]||0)+cropYield;mature.state='tilled';p.xp+=8;harvests++;p.stats.harvested++;act();continue;}
   const planted=[...plots.values()].find(t=>t.state==='planted');if(planted){planted.state='watered';planted.readyAt=now+FARM_CONFIG.crops[planted.crop].growMs;p.xp++;p.stats.watered++;act();continue;}
   if(completed.length===orderIds.length&&mode!=='crops'&&p.coins>=NPC_TRADING_CONFIG.orderResetCost){p.coins-=NPC_TRADING_CONFIG.orderResetCost;ledger.reset+=NPC_TRADING_CONFIG.orderResetCost;completed=[];resets++;act();continue;}
   const reserve=plots.size*best.seedCost;
   if(mode==='combined'){
    const hungry=player.livestock.filter(a=>!a.productReadyAt),feedCost=hungry.reduce((v,a)=>v+FARM_CONFIG.animals[a.species].feedCost,0);
    if(hungry.length&&p.coins>=feedCost+reserve){livestock('feed_animals',{},'feed');continue;}
    const species=animalSpecies.find(id=>!p.animalPens[id]&&p.coins>=FARM_CONFIG.animals[id].penCost+FARM_CONFIG.animals[id].buyCost+reserve);
    if(species){livestock('build_pen',{species},'pens');continue;}
    const buy=animalSpecies.find(id=>p.animalPens[id]&&player.livestock.filter(a=>a.species===id).length<FARM_CONFIG.animals[id].capacity&&p.coins>=FARM_CONFIG.animals[id].buyCost+FARM_CONFIG.animals[id].feedCost+reserve);
    if(buy){livestock('buy_animal',{species:buy},'animals');continue;}
   }
   const tile=farmTileKeys(expansionConfig).find(key=>!landUnlockQuote(p,key,expansionConfig).error);
   if(tile){const q=landUnlockQuote(p,tile,expansionConfig);if(p.coins-q.cost>=(plots.size+1)*best.seedCost){unlockFarmTile(p,tile,expansionConfig);ledger.expansion+=q.cost;plots.set(tile,{state:'empty'});act();unlocks.push({tiles:plots.size,session,activeMinutes:activeMs/60000,cost:q.cost,coinsAfter:p.coins,reserveRequired:(plots.size)*best.seedCost,level:p.level});continue;}}
   const empty=[...plots.values()].find(t=>t.state==='empty');if(empty){empty.state='tilled';act();continue;}
   const need=Object.entries(wanted).find(([id,n])=>(p.inventory[id]||0)<n&&!([...plots.values()].some(t=>t.crop===id&&['planted','watered'].includes(t.state)))&&available.some(c=>c.id===id));
   const crop=need?FARM_CONFIG.crops[need[0]]:best,tilled=[...plots.values()].find(t=>t.state==='tilled');
   if(tilled&&((crop.id==='carrot'&&p.freeSeeds>0)||p.coins>=crop.seedCost)){const cost=crop.id==='carrot'&&p.freeSeeds>0?0:crop.seedCost;if(cost===0)p.freeSeeds--;p.coins-=cost;ledger.seeds+=cost;p.xp+=2;p.stats.planted++;Object.assign(tilled,{state:'planted',crop:crop.id});act();continue;}
   const times=[...[...plots.values()].filter(t=>t.state==='watered'&&t.readyAt>now).map(t=>t.readyAt),...player.livestock.filter(a=>a.productReadyAt>now).map(a=>a.productReadyAt)];
   const next=Math.min(...times);spendTime(Number.isFinite(next)?Math.min(remaining,next-now):remaining);
  }
  rows.push({session,coins:p.coins,tiles:plots.size,inventoryCount:inventoryCount(),inventoryValue:Object.entries(p.inventory).reduce((v,[id,n])=>v+n*goodsValue(id),0),level:Math.min(20,Math.floor(Math.sqrt(p.xp/80))+1),animals:player.livestock.length,harvests,crafts,orderCount,resets,actions,activeMinutes:activeMs/60000,ledger:{...ledger}});
 }
 return {inputs:{sessionMinutes,sessions,actionMs,initialCoins,initialXp,mode,recipePrices,animalSpecies,includeRewards},coins:p.coins,tiles:plots.size,capacity,minCoins,ledger,rows,unlocks,progress:p,livestock:player.livestock,actions,harvests,crafts,orderCount,resets};
}
