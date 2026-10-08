import assert from 'node:assert/strict';
import {MongoClient} from 'mongodb';
import {randomUUID} from 'node:crypto';
import {FarmSecurity} from '../server/FarmSecurity.js';
import {livestockTheftPosition} from '../shared/livestockTheft.js';
import {FARM_CONFIG} from '../shared/farmConfig.js';
const mongo=new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017',{serverSelectionTimeoutMS:5000});
await mongo.connect();const db=mongo.db(`livestock_theft_test_${randomUUID().replaceAll('-','')}`);
let now=1e9;
const players=db.collection('players'),assignments=db.collection('farm_assignments'),crops=db.collection('crops');
const security=new FarmSecurity({players,assignments,crops,now:()=>now});
const animal={id:'hen',species:'chicken',productReadyAt:1,productYield:4,stolenAmount:0};
const assignment={playerId:'owner',villageId:'binh-minh',lot:1,status:'owned',claimedAt:0,gateOpen:true};
assignment._id=(await assignments.insertOne(assignment)).insertedId;
const farmId='farm_000001',point=livestockTheftPosition(farmId,[animal],animal.id);
const args=id=>({assignment,farmId,animalId:animal.id,playerId:id,position:{...point},phase:'start'});
const start=async id=>{const result=await security.stealLivestock(args(id));assert.ok(result.pending,JSON.stringify(result));return result.pending;};
const finish=(id,p)=>security.stealLivestock({...args(id),phase:'finish',token:p.token});
try{
 for(const id of ['owner','a','b'])await players.insertOne({playerId:id,revision:0,progress:{inventory:{},barnLevel:1},livestock:id==='owner'?[animal]:[]});
 await security.init();
 assert.ok((await security.stealLivestock(args('owner'))).error);
 let p=await start('a');assert.ok((await finish('a',p)).error);
 p=await start('a');security.observeMovement('a',{x:point.x+1,z:point.z},()=>null);now+=3100;assert.ok((await finish('a',p)).error);
 p=await start('a');await assignments.updateOne({_id:assignment._id},{$set:{gateOpen:false}});now+=3100;assert.ok((await finish('a',p)).error);await assignments.updateOne({_id:assignment._id},{$set:{gateOpen:true}});
 const a=await start('a'),b=await start('b');now+=3100;
 const results=await Promise.all([finish('a',a),finish('b',b)]);assert.equal(results.filter(r=>!r.error).length,1);
 const owner=await players.findOne({playerId:'owner'});assert.equal(owner.livestock[0].productReadyAt,0);
 const credited=await players.findOne({playerId:'a'});assert.equal(credited.progress.inventory.egg,4);
 assert.ok((await finish('a',a)).error);assert.ok((await security.stealLivestock(args('b'))).error);
 // Full warehouse must not cost the owner any product.
 await players.updateOne({playerId:'owner'},{$set:{'livestock.0.stolenAmount':0,'livestock.0.productReadyAt':2}});
 await players.updateOne({playerId:'b'},{$set:{'progress.inventory.wheat':20}});
 p=await start('b');now+=3100;assert.match((await finish('b',p)).error,/Kho/);
 assert.equal((await players.findOne({playerId:'owner'})).livestock[0].stolenAmount,0);
 // Recovery before and after payment; receipts make counters idempotent.
 const day=new Date(now).toISOString().slice(0,10);
 let claim={id:randomUUID(),assignmentId:assignment._id,animalId:'hen',cycle:2,playerId:'b',day,product:'egg',amount:1,at:now};
 await players.updateOne({playerId:'owner'},{$set:{livestockTheftClaim:claim}});
 await security.init();assert.equal((await players.findOne({playerId:'owner'})).livestockTheftClaim,undefined);
 claim={...claim,id:randomUUID()};await players.updateOne({playerId:'owner'},{$set:{livestockTheftClaim:claim}});
 await players.updateOne({playerId:'b'},{$addToSet:{farmTheftReceipts:claim.id},$inc:{'progress.inventory.egg':1}});
 await security.init();await security.init();
 assert.equal((await players.findOne({playerId:'owner'})).livestock[0].productReadyAt,0);
 assert.equal((await assignments.findOne({_id:assignment._id})).theftCounts[day],2);
 // Shared farm quota blocks a new animal cycle too.
 await players.updateOne({playerId:'owner'},{$set:{'livestock.0.stolenAmount':0,'livestock.0.productReadyAt':3}});
 await assignments.updateOne({_id:assignment._id},{$set:{[`theftCounts.${day}`]:FARM_CONFIG.security.theft.dailyFarmLimit}});
 assert.ok((await security.stealLivestock(args('a'))).error);
 console.log('PASS Mongo livestock theft: timer, movement, gate, concurrent winner, consumed product batch, replay, capacity, shared quota and crash recovery');
}finally{await db.dropDatabase();await mongo.close();}
