import assert from 'node:assert/strict';
import {simulateCombinedFarm} from './economy/combinedFarmSimulation.js';
const incomes=['cropSales','animalSales','craftedSales','orders','attendance','legacyRewards','mainRewards','dailyRewards'],expenses=['seeds','pens','animals','feed','reset','expansion'];
for(const mode of ['crops','orders','combined']){
 const r=simulateCombinedFarm({mode,sessions:3,recipePrices:{flour:72,cheese:96,jam:288}});
 const net=keys=>keys.reduce((n,k)=>n+r.ledger[k],0);
 assert.equal(r.coins,250+net(incomes)-net(expenses));
 for(const row of r.rows)assert.equal(row.coins,250+incomes.reduce((n,k)=>n+row.ledger[k],0)-expenses.reduce((n,k)=>n+row.ledger[k],0));
 assert(r.minCoins>=0);assert(r.rows.every(s=>s.inventoryCount<=r.capacity));
 assert(r.actions*2500<=3*30*60000);
 assert.equal(r.progress.unlockedTileKeys.length,r.tiles);
 assert.deepEqual(r,simulateCombinedFarm({mode,sessions:3,recipePrices:{flour:72,cheese:96,jam:288}}));
 if(mode==='crops'){assert.equal(r.orderCount,0);assert.equal(r.livestock.length,0);}else assert(r.orderCount>0);
 if(mode==='combined'){assert(r.livestock.length>0);assert(r.ledger.feed>0);assert(r.crafts>0);}
}
const short=simulateCombinedFarm({mode:'crops',sessions:1,sessionMinutes:.5});assert.equal(short.harvests,0);
const offline=simulateCombinedFarm({mode:'crops',sessions:2,sessionMinutes:.5});assert.equal(offline.harvests,4);
const broke=simulateCombinedFarm({initialCoins:0,sessions:2});assert.equal(broke.coins,0);assert.equal(broke.harvests,0);
const herd=simulateCombinedFarm({animalSpecies:['pig'],sessions:3});assert(herd.ledger.animalSales>0);assert(herd.ledger.animals>0);
assert.throws(()=>simulateCombinedFarm({recipePrices:{flour:-1}}));assert.throws(()=>simulateCombinedFarm({actionMs:0}));
console.log('PASS combined economy: shared money/time/storage, actual livestock rules, craft/order/reset, expansion gates, reproducibility and offline single harvest.');
