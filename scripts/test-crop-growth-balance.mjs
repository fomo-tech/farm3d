import assert from 'node:assert/strict';
import {FARM_CONFIG,CROPS} from '../shared/farmConfig.js';
import {theftPolicy} from '../shared/farmSecurity.js';
const minutes={carrot:30,wheat:45,tomato:60,pumpkin:90,strawberry:120,melon:180,turnip:240};
const now=Date.now(),cfg=FARM_CONFIG.security.theft;
for(const [id,crop] of Object.entries(CROPS)){
 assert.equal(crop.growMs,minutes[id]*60000);
 assert.ok(crop.growMs>=30*60000);
 const row={state:'watered',crop:id,wateredAt:now-crop.growMs,yield:cfg.normalYield,stolenAmount:0};
 const args={gateOpen:true,row,now,claimedAt:0};
 assert.ok(theftPolicy({...args,now:now-1}).error,'Unripe cannot be stolen');
 const result=theftPolicy(args);assert.equal(result.amount,1);
 assert.ok((row.yield-result.amount)*crop.sellPrice-crop.seedCost>0,'Owner stays profitable after theft');
 assert.ok(theftPolicy({...args,row:{...row,stolenAmount:1}}).error,'Cannot repeat theft this season');
 assert.ok(theftPolicy({...args,playerCount:cfg.dailyPlayerLimit}).error);
 assert.ok(theftPolicy({...args,farmCount:cfg.dailyFarmLimit}).error);
 assert.ok(theftPolicy({...args,claimedAt:now-cfg.newFarmProtectionMs+1}).error);
 assert.equal(theftPolicy({...args,claimedAt:now-cfg.newFarmProtectionMs}).amount,1);
 assert.ok(theftPolicy({...args,row:{...row,tutorialFastGrowth:true}}).error);
 const hourly=(4*crop.sellPrice-crop.seedCost)*3600000/crop.growMs;
 console.log(`${crop.name}: ${minutes[id]} min, ${Math.round(hourly)} coins/plot/hour, after theft ${Math.round((3*crop.sellPrice-crop.seedCost)*3600000/crop.growMs)}`);
}
assert.equal(FARM_CONFIG.care.tutorialGrowMs,8000);
console.log('PASS crop growth/theft: maturity boundaries, owner profit, quotas and newcomer protection');
