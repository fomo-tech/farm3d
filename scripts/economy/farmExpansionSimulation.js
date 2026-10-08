import { CROPS, FARM_CONFIG, farmBarnCapacity } from '../../shared/farmConfig.js';
import { LAND_EXPANSION_CONFIG, farmTileKeys, landUnlockQuote, unlockFarmTile } from '../../shared/landExpansionConfig.js';

// Post-onboarding baseline: normal yield, no tutorial acceleration or reward grants.
export function simulateFarmExpansion({sessionMinutes=30, sessions=56, initialCoins=20, initialXp=80, freeSeeds=0, actionMs=2500, strategy='reserve', cropStrategy='profit', occupiedTiles=0, expansionConfig=LAND_EXPANSION_CONFIG}={}) {
  for(const [k,v] of Object.entries({sessionMinutes,sessions,initialCoins,initialXp,freeSeeds,actionMs,occupiedTiles})) if(!Number.isFinite(v)||v<0)throw new Error(`Invalid ${k}`);
  if(sessionMinutes<=0||actionMs<=0||!Number.isInteger(sessions)||!Number.isInteger(freeSeeds)||!Number.isInteger(occupiedTiles)||occupiedTiles>=expansionConfig.initialTiles.length)throw new Error('Invalid simulation dimensions');
  if(occupiedTiles!==0)throw new Error('Crop tiles are not occupied by pens or workshops');
  if(!['reserve','greedy'].includes(strategy)||!['profit','carrot'].includes(cropStrategy))throw new Error('Invalid strategy');
  const startingFreeSeeds=freeSeeds;
  const p={coins:initialCoins,xp:initialXp,level:1,unlockedTileKeys:[...expansionConfig.initialTiles]};
  const plots=new Map(p.unlockedTileKeys.map(k=>[k,{state:'empty'}]));
  const inventory={},events=[],rows=[];
  let activeMs=0,seedCost=0,sales=0,expansionCost=0,harvests=0,seedlessSessions=0,minCoins=p.coins;
  const countInventory=()=>Object.values(inventory).reduce((a,b)=>a+b,0);
  const log=(type,at,data={})=>events.push({type,at,activeMinutes:activeMs/60000,...data});
  const capacity=farmBarnCapacity(0);
  for(let session=1;session<=sessions;session++) {
    let now=(session-1)*86400000,remaining=sessionMinutes*60000,plantedThisSession=0;
    const advance=ms=>{now+=ms;remaining-=ms;activeMs+=ms;};
    while(remaining>=actionMs) {
      p.level=Math.min(20,Math.floor(Math.sqrt(p.xp/80))+1);
      const available=Object.values(CROPS).filter(c=>c.level<=p.level);
      const crop=cropStrategy==='carrot'?CROPS.carrot:available.sort((a,b)=>(b.sellPrice*FARM_CONFIG.security.theft.normalYield-b.seedCost)/(b.growMs+3*actionMs)-(a.sellPrice*FARM_CONFIG.security.theft.normalYield-a.seedCost)/(a.growMs+3*actionMs))[0];
      const productive=[...plots.entries()].slice(occupiedTiles);
      const mature=productive.find(([,t])=>t.state==='watered'&&t.readyAt<=now);
      if(countInventory() && (!mature || countInventory()+FARM_CONFIG.security.theft.normalYield>capacity)) {
        const [id,amount]=Object.entries(inventory).find(([,n])=>n>0);const sold=Math.min(99,amount),coins=sold*CROPS[id].sellPrice;
        inventory[id]-=sold;p.coins+=coins;sales+=coins;advance(actionMs);continue;
      }
      if(mature && countInventory()+FARM_CONFIG.security.theft.normalYield<=capacity) {
        const [,t]=mature;inventory[t.crop]=(inventory[t.crop]||0)+FARM_CONFIG.security.theft.normalYield;t.state='tilled';p.xp+=8;harvests++;advance(actionMs);continue;
      }
      const watering=productive.find(([,t])=>t.state==='planted');
      if(watering){const t=watering[1];t.state='watered';advance(actionMs);t.readyAt=now+CROPS[t.crop].growMs;p.xp++;continue;}
      const target=farmTileKeys(expansionConfig).find(k=>!landUnlockQuote(p,k,expansionConfig).error);
      if(target) {
        const cost=landUnlockQuote(p,target,expansionConfig).cost;
        const reserve=(productive.length+1)*crop.seedCost;
        if(strategy==='greedy'||p.coins-cost>=reserve) {
          unlockFarmTile(p,target,expansionConfig);plots.set(target,{state:'empty'});expansionCost+=cost;advance(actionMs);
          log('unlock',now,{tileKey:target,tiles:plots.size,cost,coins:p.coins,level:p.level});minCoins=Math.min(minCoins,p.coins);continue;
        }
      }
      const empty=productive.find(([,t])=>t.state==='empty');
      if(empty){empty[1].state='tilled';advance(actionMs);continue;}
      const seedCrop=freeSeeds>0?CROPS.carrot:crop;
      const tilled=productive.find(([,t])=>t.state==='tilled');
      if(tilled&&(freeSeeds>0||p.coins>=seedCrop.seedCost)) {
        if(freeSeeds>0)freeSeeds--;else{p.coins-=seedCrop.seedCost;seedCost+=seedCrop.seedCost;}
        Object.assign(tilled[1],{state:'planted',crop:seedCrop.id});p.xp+=2;plantedThisSession++;minCoins=Math.min(minCoins,p.coins);advance(actionMs);continue;
      }
      const next=Math.min(...productive.filter(([,t])=>t.state==='watered').map(([,t])=>t.readyAt));
      if(Number.isFinite(next)&&next>now){advance(Math.min(remaining,next-now));continue;}
      advance(remaining);break;
    }
    if(!plantedThisSession&&!productivePending(plots)&&countInventory()===0&&p.coins<CROPS.carrot.seedCost)seedlessSessions++;
    rows.push({session,tiles:plots.size,coins:p.coins,xp:p.xp,level:Math.min(20,Math.floor(Math.sqrt(p.xp/80))+1),inventory:countInventory(),harvests,sales,seedCost,expansionCost,activeMinutes:activeMs/60000});
  }
  return {inputs:{sessionMinutes,sessions,initialCoins,initialXp,freeSeeds:startingFreeSeeds,actionMs,strategy,cropStrategy,occupiedTiles},tiles:plots.size,coins:p.coins,minCoins,seedCost,sales,expansionCost,harvests,seedlessSessions,capacity,events,rows};
}
function productivePending(plots){return [...plots.values()].some(t=>['planted','watered'].includes(t.state));}
