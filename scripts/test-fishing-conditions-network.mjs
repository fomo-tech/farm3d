import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {MongoClient} from 'mongodb';
import {WebSocket} from 'ws';
import {getFishingConditions} from '../shared/fishingConditions.js';
const databaseName=`farm_density_test_${randomUUID().replaceAll('-','')}`;
const mongo=new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017',{serverSelectionTimeoutMS:5000});
const sockets=[];let server;
try{
 await mongo.connect();
 server=spawn(process.execPath,['server/index.js'],{env:{...process.env,MONGODB_DB:databaseName,MULTIPLAYER_PORT:'18881'},stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Startup timeout')),15000);server.stdout.on('data',data=>{if(String(data).includes('MongoDB connected')){clearTimeout(timer);resolve();}});server.stderr.on('data',data=>process.stderr.write(data));server.once('exit',code=>{clearTimeout(timer);reject(new Error(`Server exit ${code}`));});});
 const join=async()=>{
  const socket=new WebSocket('ws://127.0.0.1:18881');sockets.push(socket);const messages=[];
  const received=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Conditions delivery timeout')),7000);socket.on('message',raw=>{messages.push(JSON.parse(raw));if(['account_state','fishing_conditions','world_state'].every(type=>messages.some(message=>message.type===type))){clearTimeout(timer);resolve(messages);}});socket.on('error',reject);});
  await new Promise((resolve,reject)=>{socket.once('open',resolve);socket.once('error',reject);});
  socket.send(JSON.stringify({type:'join',playerId:`player_density_${randomUUID()}`,name:'Density Test',villageId:'binh-minh'}));return received;
 };
 const [first,second]=await Promise.all([join(),join()]);
 for(const messages of [first,second]){
  const account=messages.find(message=>message.type==='account_state');
  const bulletin=messages.find(message=>message.type==='fishing_conditions');
  assert.deepEqual(account.fishingConditions,getFishingConditions(account.serverNow));
  assert.deepEqual(bulletin.fishingConditions,account.fishingConditions);
  const world=messages.find(message=>message.type==='world_state');
  for(const player of world.players)assert.equal('fishingDay' in player,false);
 }
 assert.deepEqual(first.find(message=>message.type==='account_state').fishingConditions,second.find(message=>message.type==='account_state').fishingConditions);
 console.log('PASS network: two players share server daily conditions, account/broadcast delivery, internal stamp hidden.');
}finally{
 for(const socket of sockets)socket.terminate();
 if(server&&server.exitCode===null){const ended=new Promise(resolve=>server.once('exit',resolve));server.kill('SIGTERM');await ended;}
 try{await mongo.db(databaseName).dropDatabase();}catch{}
 await mongo.close();
}
