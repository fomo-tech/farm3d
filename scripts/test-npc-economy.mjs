import assert from 'node:assert/strict';
import { NPC_TRADING_CONFIG as config, quoteRoadsidePurchase } from '../shared/npcTradingConfig.js';
import { FARM_CONFIG } from '../shared/farmConfig.js';
import { sellFishingCatch } from '../shared/fishingSales.js';

assert.deepEqual(Object.values(config.recipes).map(r=>r.sell),[72,96,288]);
const progress = () => ({coins:5000,barnLevel:1,inventory:{carrot:0,wheat:0,tomato:0,strawberry:0}});
const context = {...config.roadside.approach};
const offers = config.roadside.offers;
for (const offer of Object.values(offers)) {
  const p=progress();
  assert.equal(quoteRoadsidePurchase(p,{crop:offer.crop,price:0},context).price,offer.price);
  assert.ok(offer.price > offer.amount * FARM_CONFIG.crops[offer.crop].sellPrice, 'Direct resale must lose coins');
  for (const amount of [1.5,0,-1,'5',NaN,Infinity]) {
    const before=structuredClone(p);
    assert.throws(()=>quoteRoadsidePurchase(p,{crop:offer.crop,amount},context));
    assert.deepEqual(p,before);
  }
}
for (const badContext of [{x:0,z:0},{...context,venue:'fishing'},{x:NaN,z:60},{}]) assert.throws(()=>quoteRoadsidePurchase(progress(),{crop:'carrot'},badContext));
for (const crop of ['toString','__proto__','missing']) assert.throws(()=>quoteRoadsidePurchase(progress(),{crop},context));
assert.throws(()=>quoteRoadsidePurchase({...progress(),coins:0},{crop:'carrot'},context));
assert.throws(()=>quoteRoadsidePurchase({...progress(),inventory:{carrot:20}},{crop:'carrot'},context));
// Fractional-pack costing is a lower bound: buying whole packs and reselling
// leftovers at lower NPC prices cannot make the complete repeatable loop cheaper.
const inputCost = items => Object.entries(items).reduce((sum,[id,n])=>sum+n*offers[id].price/offers[id].amount,0);
let orderRevenue=0,orderInputs=0;
for (const order of Object.values(config.orders)) {orderRevenue+=order.coins;orderInputs+=inputCost(order.items);}
assert.ok(orderRevenue-config.orderResetCost < orderInputs, 'Buying all ingredients then resetting orders must lose coins');
for (const recipe of Object.values(config.recipes)) {
  const rawValue=Object.entries(recipe.inputs).reduce((sum,[id,n])=>sum+n*(FARM_CONFIG.crops[id]?.sellPrice??FARM_CONFIG.products[id]?.sellPrice),0);
  assert.ok(recipe.sell>rawValue,'Self-produced ingredients must gain value when crafted');
  if (Object.keys(recipe.inputs).every(id=>offers[id])) assert.ok(recipe.sell < inputCost(recipe.inputs), 'NPC -> recipe -> sell must lose coins');
}
const fish = () => ({fish:{carp:{count:3,totalWeight:3,maxWeight:1}},lastSale:null});
for (const amount of [1.5,0,-1,'1',NaN,Infinity,4]) {
 const f=fish(),before=structuredClone(f);
 assert.throws(()=>sellFishingCatch(f,'fishing_sell',{id:'carp',amount}));
 assert.deepEqual(f,before);
}
for (const id of ['toString','missing',undefined]) assert.throws(()=>sellFishingCatch(fish(),'fishing_sell',{id}));
const f=fish();const sale=sellFishingCatch(f,'fishing_sell',{id:'carp',amount:2},100);
assert.equal(sale.count,2);assert.equal(f.fish.carp.count,1);assert.equal(f.fish.carp.totalWeight,1);assert.ok(Number.isSafeInteger(sale.coins));
const all=sellFishingCatch(f,'fishing_sell_all',{},200);assert.equal(all.count,1);assert.deepEqual(f.fish,{});
assert.throws(()=>sellFishingCatch(f,'fishing_sell_all'));
const malformed=fish();malformed.fish.perch={count:.5,totalWeight:1};const snapshot=structuredClone(malformed);
assert.throws(()=>sellFishingCatch(malformed,'fishing_sell_all'));assert.deepEqual(malformed,snapshot);
console.log('PASS NPC economy: server price, location, amount/storage guards, no profitable resale/craft/order-reset loops; integer and atomic fish sales.');
