import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {MongoClient} from 'mongodb';
import WebSocket from 'ws';
const database=`city_connection_test_${randomUUID().replaceAll('-','')}`;
const port=18787;
const child=spawn(process.execPath,['server/index.js'],{cwd:new URL('../',import.meta.url),env:{...process.env,MONGODB_DB:database,MULTIPLAYER_PORT:String(port)},stdio:['ignore','pipe','pipe'],windowsHide:true});
let log='',ws,token;child.stdout.on('data',b=>log+=b);child.stderr.on('data',b=>log+=b);
try{
 let ready=false;
 for(let i=0;i<100;i++){
  if(child.exitCode!==null)throw Error(log);
  try{const response=await fetch(`http://127.0.0.1:${port}/health`);if(response.ok){ready=true;break;}}catch{}
  await new Promise(r=>setTimeout(r,100));
 }
 assert.ok(ready,`Startup timed out: ${log}`);
 const playerId=`player_probe_${randomUUID().replaceAll('-','')}`;
 const welcome=await new Promise((resolve,reject)=>{
  ws=new WebSocket(`ws://127.0.0.1:${port}`);
  const timer=setTimeout(()=>reject(Error(`Join timeout: ${log}`)),10000);
  ws.on('open',()=>ws.send(JSON.stringify({type:'join',playerId,name:'City Probe',worldDelta:1})));
  ws.on('message',data=>{const m=JSON.parse(data);if(m.type==='account_state')token=m.sessionToken;if(m.type==='auth_error')reject(Error(m.message));if(m.type==='welcome'){clearTimeout(timer);resolve(m);}});
  ws.on('error',reject);
 });
 assert.equal(welcome.farmId,null);assert.equal(welcome.farmLayout,null);assert.ok(token);
 const reply=await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error(`City action timeout: ${log}`)),10000);
  ws.on('message',data=>{const m=JSON.parse(data);if(m.requestId==='probe-city-enter'){clearTimeout(timer);resolve(m);}});
  ws.send(JSON.stringify({type:'game_action',requestId:'probe-city-enter',action:'city_enter',payload:{}}));
 });
 assert.equal(reply.type,'account_state',JSON.stringify(reply));assert.equal(reply.progress.city.initialized,true);
 const request=(message,predicate)=>new Promise((resolve,reject)=>{
  const handler=data=>{const m=JSON.parse(data);if(predicate(m)){clearTimeout(timer);ws.off('message',handler);resolve(m);}};
  const timer=setTimeout(()=>{ws.off('message',handler);reject(Error(`Request timeout: ${log}`));},7000);
  ws.on('message',handler);ws.send(JSON.stringify(message));
 });
 for(let step=1;step<=12;step++){
  await new Promise(r=>setTimeout(r,120));
  const x=welcome.spawn.x+(6-welcome.spawn.x)*step/12,z=welcome.spawn.z+(13-welcome.spawn.z)*step/12;
  const move=await request({type:'move',x,y:.08,z,rotation:0,venue:null},m=>m.type==='move_ack');assert.equal(move.accepted,true,JSON.stringify(move));
 }
 const painted=await request({type:'game_action',requestId:'probe-paint',action:'city_garage_paint',payload:{color:'#d1c8b5'}},m=>m.requestId==='probe-paint');
 assert.equal(painted.type,'account_state',JSON.stringify(painted));assert.equal(painted.progress.city.garage.paints.roadster,'#d1c8b5');assert.equal(painted.progress.coins,reply.progress.coins-60);
 const dbProbe=new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017');
 try{
  await dbProbe.connect();const players=dbProbe.db(database).collection('players');
  const saved=await players.findOne({playerId});assert.equal(saved.progress.city.garage.paints.roadster,'#d1c8b5');
  await players.updateOne({playerId},{$set:{'progress.city.garage.health.roadster':50}});
  const repaired=await request({type:'game_action',requestId:'probe-repair',action:'city_garage_repair',payload:{}},m=>m.requestId==='probe-repair');
  assert.equal(repaired.type,'account_state',JSON.stringify(repaired));assert.equal(repaired.progress.city.garage.health.roadster,100);assert.equal(repaired.progress.coins,painted.progress.coins-100);
  const forbidden=await request({type:'game_action',requestId:'probe-forged-impact',action:'city_vehicle_impact',payload:{trustedCityImpact:true}},m=>m.requestId==='probe-forged-impact');assert.equal(forbidden.type,'action_error');
  await players.updateOne({playerId},{$set:{'progress.city.vitals':{health:0,downedAt:Date.now()-6000,protectedUntil:0},'progress.vehicle':'walk'}});
  const respawned=await request({type:'game_action',requestId:'probe-respawn',action:'city_respawn',payload:{}},m=>m.requestId==='probe-respawn');
  assert.equal(respawned.type,'account_state',JSON.stringify(respawned));assert.equal(respawned.progress.city.vitals.health,100);
  const persisted=await players.findOne({playerId});assert.equal(persisted.position.x,1.9);assert.equal(persisted.position.z,13);assert.equal(persisted.progress.city.vitals.health,100);
 }finally{await dbProbe.close();}
 console.log('PASS actual garage RPC: authoritative proximity, paid paint, persisted MongoDB garage');
 console.log('PASS actual server startup + MongoDB + WebSocket new-player join + welcome + city_enter');
}finally{
 ws?.terminate();child.kill();await new Promise(resolve=>{if(child.exitCode!==null)resolve();else child.once('exit',resolve);});
 const mongo=new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017');
 try{await mongo.connect();assert.match(database,/^city_connection_test_[a-f0-9]{32}$/);await mongo.db(database).dropDatabase();}finally{await mongo.close();}
}
