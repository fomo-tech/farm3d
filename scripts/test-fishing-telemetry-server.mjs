import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { FishingTelemetry, TELEMETRY_OUTBOX_LIMIT } from '../server/FishingTelemetry.js';
const databaseName=`farm_fishing_telemetry_test_${randomUUID().replaceAll('-','')}`;
process.env.MONGODB_DB=databaseName;
const mongo=new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017',{serverSelectionTimeoutMS:5000});
let failed=false;
try {
 await mongo.connect();const store=await import('../server/GameStore.js');await store.initGameStore();
 const db=mongo.db(databaseName),players=db.collection('players'),events=db.collection('fishing_telemetry'),telemetry=store.fishingTelemetry;
 await store.authenticate('angler',null);
 const id=telemetry.startSession('angler',{venue:'fishing'}),shop={venue:'fishing',telemetrySessionId:id},bank={x:162,z:2,telemetrySessionId:id};
 assert.ok(!(await store.performAction('angler','fishing_buy',{id:'rod_bamboo'},shop)).error);
 let row=await players.findOne({playerId:'angler'});assert.equal(row.progress.coins,30);assert.equal(row.fishingTelemetryOutbox.length,1);
 const write=telemetry.write.bind(telemetry);telemetry.write=async()=>{throw new Error('injected projection failure');};
 await assert.rejects(()=>telemetry.flush(),/injected/);
 assert.equal((await players.findOne({playerId:'angler'})).fishingTelemetryOutbox.length,1,'projection failure preserves committed receipt');
 telemetry.write=write;await telemetry.flush();await telemetry.flush();
 assert.equal(await events.countDocuments({type:'gear_purchase'}),1);assert.equal((await players.findOne({playerId:'angler'})).fishingTelemetryOutbox.length,0);
 const beforeCount=await events.countDocuments();
 assert.ok((await store.performAction('angler','fishing_buy',{id:'rod_bamboo'},shop)).error);await telemetry.flush();
 assert.equal(await events.countDocuments(),beforeCount,'failed economic action must not create a purchase event');
 const cast=await store.performAction('angler','fishing_cast',{},bank);assert.ok(!cast.error);
 const castId=cast.player.progress.fishing.pending.id;
 await players.updateOne({playerId:'angler'},{$set:{'progress.fishing.pending.fishId':'carp','progress.fishing.pending.biteAt':Date.now()-20,'progress.fishing.pending.expiresAt':Date.now()+2000}});
 const finishes=await Promise.all([1,2].map(()=>store.performAction('angler','fishing_reel',{sessionId:castId},bank)));
 assert.equal(finishes.filter(r=>!r.error).length,1);
 await players.updateOne({playerId:'angler'},{$set:{'progress.fishing.pending.pull':99,'progress.fishing.pending.lastPulseAt':Date.now()-450}});
 const pulled=await store.performAction('angler','fishing_pull',{sessionId:castId,sequence:1,holding:true},bank);assert.ok(!pulled.error&&pulled.result.fishCaught);
 assert.ok(!(await store.performAction('angler','fishing_sell_all',{},shop)).error);
 // Recovery needs only durable receipts, not the original in-memory session map.
 const recovery=new FishingTelemetry(db);await recovery.init();await recovery.flush();await recovery.flush();
 assert.equal(await events.countDocuments({type:'cast'}),1);assert.equal(await events.countDocuments({type:'hook'}),1);assert.equal(await events.countDocuments({type:'catch'}),1);assert.equal(await events.countDocuments({type:'sale'}),1);
 const catches=await events.find({type:'catch'}).toArray();assert.ok(!JSON.stringify(catches).includes(castId));
 assert.ok(!JSON.stringify(catches).includes('sessionToken'));assert.ok(!JSON.stringify(catches).includes('angler'));
 const index=(await events.listIndexes().toArray()).find(i=>i.key.expiresAt===1);assert.equal(index.expireAfterSeconds,0);
 // A full telemetry queue drops instrumentation, not the committed game action.
 await players.updateOne({playerId:'angler'},{$set:{'progress.coins':1000,fishingTelemetryOutbox:Array.from({length:TELEMETRY_OUTBOX_LIMIT},(_,n)=>({_id:`fixture-${n}`,expiresAt:new Date(0)}))}});
 const buy=await store.performAction('angler','fishing_buy',{id:'bait_worm'},shop);assert.ok(!buy.error);assert.equal(buy.player.progress.coins,950);
 row=await players.findOne({playerId:'angler'});assert.equal(row.fishingTelemetryDropped,1);assert.ok(row.fishingTelemetryLossAt>0);
 await telemetry.flush();telemetry.endSession(id,bank);await telemetry.flush();
 assert.equal(await events.countDocuments({type:'session_end'}),1);
 assert.equal((await players.findOne({playerId:'angler'})).fishingTelemetryOutbox.length,0);
 console.log('PASS Mongo telemetry: atomic economic receipts, no records on failure/conflict, idempotent projection, crash recovery, retention, hidden fields and nonblocking bounded queue.');
} catch(error){failed=true;console.error(error);}
finally {if(mongo.topology?.isConnected())await mongo.db(databaseName).dropDatabase();await mongo.close();}
process.exit(failed?1:0);
