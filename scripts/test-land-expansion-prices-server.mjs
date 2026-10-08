import assert from 'node:assert/strict';
import {MongoClient} from 'mongodb';
import {randomUUID} from 'node:crypto';
import {LAND_EXPANSION_CONFIG} from '../shared/landExpansionConfig.js';
const name=`land_price_test_${randomUUID().replaceAll('-','')}`;
process.env.MONGODB_DB=name;
const mongo=new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017',{serverSelectionTimeoutMS:5000});
let failed=false;
try{
 await mongo.connect();const store=await import('../server/GameStore.js');await store.initGameStore();await store.authenticate('price-owner',null);
 const db=mongo.db(name);await db.collection('players').updateOne({playerId:'price-owner'},{$set:{'progress.coins':10000,'progress.xp':80,'progress.unlockedTileKeys':[...LAND_EXPANSION_CONFIG.initialTiles]}});
 await db.collection('farm_assignments').insertOne({playerId:'price-owner',villageId:'binh-minh',lot:1,status:'owned'});
 const context={farmId:'farm_000001',villageId:'binh-minh'};
 const first=await store.performAction('price-owner','unlock_plot',{tileKey:'4:0',cost:0},context);assert(!first.error);assert.equal(first.player.progress.coins,7500);
 const duplicate=await store.performAction('price-owner','unlock_plot',{tileKey:'4:0'},context);assert(duplicate.error);
 const second=await store.performAction('price-owner','unlock_plot',{tileKey:'5:0'},context);assert(!second.error);assert.equal(second.player.progress.coins,1000);
 const insufficient=await store.performAction('price-owner','unlock_plot',{tileKey:'0:1'},context);assert(insufficient.error);
 const saved=await store.loadPlayer('price-owner');assert.equal(saved.progress.coins,1000);assert.equal(saved.progress.unlockedTileKeys.length,6);
 console.log('PASS Mongo land prices: authoritative charges, duplicate/insufficient guards and durable tiles/balance.');
}catch(error){failed=true;console.error(error);}finally{if(mongo.topology?.isConnected())await mongo.db(name).dropDatabase();await mongo.close();}
process.exit(failed?1:0);
