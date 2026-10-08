import { NPC_TRADING_CONFIG } from '../shared/npcTradingConfig.js';
import { ECONOMY_REWARD_CONFIG } from '../shared/economyRewardConfig.js';
import { FARM_CONFIG } from '../shared/farmConfig.js';
import { LAND_CONFIG } from '../shared/landConfig.js';
import { LAND_EXPANSION_CONFIG } from '../shared/landExpansionConfig.js';
import { FISHING_CONFIG, calculateFishSaleValue } from '../shared/fishingConfig.js';
import { COMMUNITY_CODES, applyCommunityReward } from '../server/CommunityRewards.js';
import { ATTENDANCE_REWARDS } from '../shared/dailyAttendance.js';
const recipes=NPC_TRADING_CONFIG.recipes, orders=NPC_TRADING_CONFIG.orders;
const roadside=NPC_TRADING_CONFIG.roadside.offers;
const crops=Object.values(FARM_CONFIG.crops).map(c=>{
 const net=FARM_CONFIG.security.theft.normalYield*c.sellPrice-c.seedCost;
 return {id:c.id,level:c.level,minutes:c.growMs/60000,netPerTile:net,netPerTileHour:+(net*3600000/c.growMs).toFixed(1)};
});
const crafts=Object.entries(recipes).map(([id,r])=>{
 const raw=Object.entries(r.inputs).reduce((sum,[key,n])=>sum+n*(FARM_CONFIG.crops[key]||FARM_CONFIG.products[key]).sellPrice,0);
 return {id,rawValue:raw,sell:r.sell,valueChange:r.sell-raw};
});
const flips=Object.entries(roadside).map(([id,o])=>({id,cost:o.price,resale:o.amount*FARM_CONFIG.crops[id].sellPrice,profit:o.amount*FARM_CONFIG.crops[id].sellPrice-o.price}));
const roadsideUnitCost = id => roadside[id] ? roadside[id].price / roadside[id].amount : null;
const orderCycle = { revenue: Object.values(orders).reduce((sum,o)=>sum+o.coins,0), resetCost: NPC_TRADING_CONFIG.orderResetCost,
  minimumInputCost: Object.values(orders).reduce((sum,o)=>sum+Object.entries(o.items).reduce((subtotal,[id,n])=>subtotal+n*roadsideUnitCost(id),0),0) };
orderCycle.profitUpperBound = +(orderCycle.revenue-orderCycle.resetCost-orderCycle.minimumInputCost).toFixed(2);
const animals=Object.values(FARM_CONFIG.animals).map(a=>{
 const net=FARM_CONFIG.products[a.product].sellPrice-a.feedCost-(a.saleOnly?a.buyCost:0);
 return {id:a.id,initialPenAndAnimal:a.penCost+a.buyCost,cycleMinutes:a.productMs/60000,netPerAnimalCycle:net,netPerAnimalHour:net*3600000/a.productMs};
});
const p={coins:ECONOMY_REWARD_CONFIG.initial.coins};
const initial=p.coins;
for(const [code,c] of Object.entries(COMMUNITY_CODES))if(c.enabled)applyCommunityReward(p,'redeem_giftcode',{code},Date.UTC(2026,9,6));
applyCommunityReward(p,'claim_daily_reward',{},Date.UTC(2026,9,6));
const tiers=LAND_EXPANSION_CONFIG.tiers;
let previous=LAND_EXPANSION_CONFIG.initialTiles.length;
const expansion=tiers.map(t=>{const count=t.through-previous;previous=t.through;return {...t,count,total:count*t.cost};});
const carrot=crops.find(c=>c.id==='carrot');
const stageTimes=[4,8,12,18,24].map(n=>{
 const tier=tiers.find(t=>n<t.through);
 return {tiles:n,carrotNetPerMinute:n*carrot.netPerTile,...(tier?{nextTileCost:tier.cost,idealMinutesForNextTile:+(tier.cost/(n*carrot.netPerTile)).toFixed(2)}:{})};
});
const fishing=[];
for(const zone of ['lake','river'])for(const baitId of [null,'bait_worm','bait_lure','fish_chum']){
 const z=FISHING_CONFIG.zones[zone],bait=FISHING_CONFIG.baits[baitId];
 const pool=z.fish.map(id=>FISHING_CONFIG.fish[id]);
 const rare=z.rareChance+(bait?.rareBonus||0);
 const meanFish=f=>{let sum=0;for(let i=0;i<1000;i++)sum+=calculateFishSaleValue(f.id,f.weight[0]+(f.weight[1]-f.weight[0])*(i+.5)/1000);return sum/1000;};
 const meanPool=(items,phase)=>{let sum=0,n=0;for(const f of items){const w=1+(bait?.preferredFish.includes(f.id)?1:0)+(FISHING_CONFIG.timePreferences[f.id]?.includes(phase)?1:0);sum+=w*meanFish(f);n+=w;}return sum/n;};
 const expected=['dawn','day','dusk','night'].reduce((sum,phase)=>sum+(1-rare)*meanPool(pool.filter(f=>f.rarity==='common'),phase)+rare*meanPool(pool.filter(f=>f.rarity!=='common'),phase),0)/4;
 fishing.push({zone,bait:baitId,baitPerCast:bait?bait.cost/bait.quantity:0,meanBiteSeconds:4.5/(bait?.biteSpeed||1),expectedSale:+expected.toFixed(2),expectedNetPerSuccessfulCast:+(expected-(bait?bait.cost/bait.quantity:0)).toFixed(2)});
}
console.log(JSON.stringify({assumptions:'Static code audit; crops exclude actions/travel/storage/theft; fish assume all catches succeed and time phases equally weighted; no live DB access.',initial,dayOneWithCodesAndAttendance:p.coins,minLand:LAND_CONFIG.minPrice,maxLand:LAND_CONFIG.maxPrice,attendanceWeek:ATTENDANCE_REWARDS.reduce((a,b)=>a+b,0),crops,crafts,roadsideFlips:flips,orders,orderCycle,animals,expansion,expansionTotal:expansion.reduce((s,t)=>s+t.total,0),stageTimes,fishing},null,2));
