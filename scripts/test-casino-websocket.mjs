import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import {MongoClient} from 'mongodb';
import WebSocket from 'ws';
import {VENUE_LAYOUT} from '../shared/venueLayout.js';
import {FARM_LOT_SPEC} from '../shared/farmLayout.js';
const mongo=new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017');await mongo.connect();
const dbName=`casino_ws_test_${randomUUID().replaceAll('-','')}`,db=mongo.db(dbName),port=19000+Math.floor(Math.random()*1000);
const ids=[0,1,2].map(i=>`player_casinotest_${i}_${randomUUID().slice(0,8)}`),token='isolated-test-token';
await db.collection('players').insertMany(ids.map((playerId,i)=>({playerId,name:`WS Test ${i}`,revision:0,sessionIssuedAt:Date.now(),sessionTokenHash:createHash('sha256').update(`farm-online-3d:${token}`).digest('hex'),progress:{coins:1000},position:{...VENUE_LAYOUT.casino.interior,venue:'casino',villageId:'town',layoutVersion:FARM_LOT_SPEC.version}})));
let server=spawn(process.execPath,['server/index.js'],{env:{...process.env,MONGODB_DB:dbName,MULTIPLAYER_PORT:String(port)},stdio:['ignore','pipe','pipe']});
let output='';server.stdout.on('data',b=>output+=b);server.stderr.on('data',b=>output+=b);
const sockets=[];let request=0;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function waitFor(fn,ms=20000){const end=Date.now()+ms;while(Date.now()<end){const value=fn();if(value)return value;await delay(50);}throw new Error(`Timeout: ${output.slice(-1000)}`);}
async function connect(i){const ws=new WebSocket(`ws://127.0.0.1:${port}`),messages=[];ws.on('message',b=>messages.push(JSON.parse(String(b))));await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j);});ws.send(JSON.stringify({type:'join',playerId:ids[i],sessionToken:token,name:`WS Test ${i}`}));await waitFor(()=>messages.find(m=>m.type==='welcome'));const handle={ws,messages};sockets.push(handle);return handle;}
async function action(client,payload){const requestId=`ws_${++request}`;client.ws.send(JSON.stringify({type:'game_action',action:'casino',requestId,payload}));const response=await waitFor(()=>client.messages.find(m=>m.requestId===requestId));assert.notEqual(response.type,'action_error',response.message);return response;}
try {
 await waitFor(()=>output.includes('multiplayer listening'));
 const [a,b,watcher]=await Promise.all([connect(0),connect(1),connect(2)]);
 const room=a.messages.find(m=>m.type==='casino_state').rooms.find(r=>r.game==='bai-cao');
 for(const [i,c] of [a,b,watcher].entries()){await action(c,{kind:'join',roomId:room.id});if(i<2){await action(c,{kind:'seat',seat:i});await action(c,{kind:'ready',ready:true});}}
 const views=await Promise.all([a,b,watcher].map(c=>waitFor(()=>c.messages.find(m=>m.type==='casino_state'&&m.mine?.round?.hand?.length===(c===watcher?0:3)&&m.mine.round.phase==='playing'))));
 for(const v of views){assert.equal(v.mine.round.hands,undefined);assert.equal(v.mine.round.banker,undefined);assert.equal(v.mine.round.result,null);}
 assert.notDeepEqual(views[0].mine.round.hand,views[1].mine.round.hand);
 await action(a,{kind:'reveal'});await action(b,{kind:'reveal'});
 const results=await Promise.all([a,b,watcher].map(c=>waitFor(()=>c.messages.find(m=>m.type==='casino_state'&&m.mine?.round?.phase==='result'))));
 assert.deepEqual(results[0].mine.round.result,results[2].mine.round.result);
 const pays=results[0].mine.round.result.players;
 for(let i=0;i<2;i++){const doc=await db.collection('players').findOne({playerId:ids[i]});assert.equal(doc.progress.coins,990+pays.find(p=>p.playerId===ids[i]).reward);}
 assert.equal(await db.collection('casino_ledger').countDocuments({mode:'settle'}),2);
 console.log('WebSocket casino: 3 real clients, private hands, spectator, shared banker reveal, Mongo payouts passed.');
}finally{for(const s of sockets)s.ws.close();server.kill('SIGTERM');await new Promise(r=>server.once('exit',r));await db.dropDatabase();await mongo.close();}
