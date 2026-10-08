import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { NPC_TRADING_CONFIG as config } from '../shared/npcTradingConfig.js';
import { FARM_CONFIG } from '../shared/farmConfig.js';
import { calculateFishSaleValue } from '../shared/fishingConfig.js';

// This test creates and deletes only its own isolated generated database.
const databaseName=`farm_npc_economy_test_${randomUUID().replaceAll('-','')}`;
process.env.MONGODB_DB=databaseName;
const mongo=new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017',{serverSelectionTimeoutMS:5000});
let failed=false;
try {
 await mongo.connect();
 const store=await import('../server/GameStore.js');await store.initGameStore();
 const db=mongo.db(databaseName),players=db.collection('players');
 await store.authenticate('trader',null);
 const context={...config.roadside.approach};
 const reset=async(extra={})=>players.updateOne({playerId:'trader'},{$set:{'progress.coins':5000,'progress.inventory':{},'progress.completedOrders':[],...extra}});
 const act=(action,payload={},ctx=context)=>store.performAction('trader',action,payload,ctx);
 const unchanged=async(action,payload,ctx=context)=>{
  const before=await players.findOne({playerId:'trader'});
  assert.ok((await act(action,payload,ctx)).error,`${action} must reject invalid request`);
  assert.deepEqual(await players.findOne({playerId:'trader'}),before);
 };
 await reset();
 await unchanged('roadside_buy',{crop:'carrot'},{x:0,z:0});
 await unchanged('roadside_buy',{crop:'carrot'},{...context,venue:'fishing'});
 for(const amount of [1.5,-1,0,'5'])await unchanged('roadside_buy',{crop:'carrot',amount});
 for(const id of ['toString','__proto__']){
  await unchanged('roadside_buy',{crop:id});await unchanged('sell_item',{id,amount:1});
  await unchanged('craft',{id});await unchanged('deliver_order',{id});
 }
 for(const offer of Object.values(config.roadside.offers)){
  await reset();
  const bought=await act('roadside_buy',{crop:offer.crop,amount:offer.amount,price:0});
  assert.ok(!bought.error,bought.error);assert.equal(bought.player.progress.coins,5000-offer.price);
  assert.equal(bought.result.roadsidePurchase.price,offer.price);
  for(const amount of [1.5,-1,0,'1',offer.amount+1])await unchanged('sell_item',{id:offer.crop,amount});
  const sold=await act('sell_item',{id:offer.crop,amount:offer.amount});
  assert.equal(sold.player.progress.coins,5000-offer.price+offer.amount*FARM_CONFIG.crops[offer.crop].sellPrice);
  assert.ok(sold.player.progress.coins<5000);await unchanged('sell_item',{id:offer.crop,amount:1});
 }
 await reset({'progress.coins':0});await unchanged('roadside_buy',{crop:'carrot'});
 await reset({'progress.inventory':{carrot:20}});await unchanged('roadside_buy',{crop:'carrot'});
 // Actual repeatable full-order cycle, including resale of leftover carrots.
 await reset();
 for(const crop of ['carrot','wheat','tomato'])assert.ok(!(await act('roadside_buy',{crop})).error);
 for(const id of Object.keys(config.orders))assert.ok(!(await act('deliver_order',{id})).error);
 assert.ok(!(await act('reset_orders')).error);
 const cycle=await act('sell_item',{id:'carrot',amount:2});assert.ok(cycle.player.progress.coins<5000);
 for(const [recipeId,crop,amount] of [['flour','wheat',4],['jam','strawberry',2]]){
  await reset();assert.ok(!(await act('roadside_buy',{crop})).error);
  const crafts=amount/2;
  for(let i=0;i<crafts;i++){assert.ok(!(await act('craft',{id:recipeId})).error);assert.ok(!(await act('sell_product',{id:recipeId})).error);}
  assert.ok((await store.loadPlayer('trader')).progress.coins<5000);
 }
 // All three recipes use authoritative prices and preserve stock on rejected retries.
 for(const [id,recipe] of Object.entries(config.recipes)) {
  await reset({'progress.inventory':{...recipe.inputs}});
  const crafted=await act('craft',{id,sell:999999,price:0});assert.ok(!crafted.error,crafted.error);
  assert.equal(crafted.player.progress.coins,5000);assert.equal(crafted.player.progress.inventory[id],1);
  for(const key of Object.keys(recipe.inputs))assert.equal(crafted.player.progress.inventory[key],0);
  await unchanged('craft',{id});
  const sold=await act('sell_product',{id,price:999999});assert.ok(!sold.error);
  assert.equal(sold.player.progress.coins,5000+recipe.sell);await unchanged('sell_product',{id});
 }
 await reset({'progress.inventory':{milk:2}});
 const craftRace=await Promise.all([act('craft',{id:'cheese'}),act('craft',{id:'cheese'})]);
 assert.equal(craftRace.filter(r=>!r.error).length,1);
 assert.equal((await store.loadPlayer('trader')).progress.inventory.cheese,1);
 const saleRace=await Promise.all([act('sell_product',{id:'cheese'}),act('sell_product',{id:'cheese'})]);
 assert.equal(saleRace.filter(r=>!r.error).length,1);
 const afterRace=await store.loadPlayer('trader');assert.equal(afterRace.progress.coins,5000+config.recipes.cheese.sell);assert.equal(afterRace.progress.inventory.cheese,0);
 const fishingContext={venue:'fishing'};
 await reset({'progress.fishing.fish':{carp:{count:3,totalWeight:3,maxWeight:1}}});
 for(const amount of [1.5,-1,0,'1',4])await unchanged('fishing_sell',{id:'carp',amount},fishingContext);
 await unchanged('fishing_sell',{id:'toString'},fishingContext);
 const soldFish=await act('fishing_sell',{id:'carp',amount:2},fishingContext);
 assert.equal(soldFish.player.progress.coins,5000+calculateFishSaleValue('carp',1)*2);
 assert.equal(soldFish.player.progress.fishing.fish.carp.count,1);
 assert.ok(!(await act('fishing_sell_all',{},fishingContext)).error);
 await unchanged('fishing_sell_all',{},fishingContext);
 // Optimistic revisions reject competing writes against the same one-item stock.
 await reset({'progress.inventory':{carrot:1}});
 const race=await Promise.all([act('sell_item',{id:'carrot'}),act('sell_item',{id:'carrot'})]);
 assert.equal(race.filter(r=>!r.error).length,1);
 const persisted=await store.loadPlayer('trader');assert.equal(persisted.progress.coins,5012);assert.equal(persisted.progress.inventory.carrot,0);
 console.log('PASS Mongo NPC economy: authoritative purchase, no mutation on invalid actions, unprofitable resale/order/craft cycles, fish quantity, competing sales and durable balances.');
} catch(error){failed=true;console.error(error);}
finally {if(mongo.topology?.isConnected())await mongo.db(databaseName).dropDatabase();await mongo.close();}
process.exit(failed?1:0);
