import assert from 'node:assert/strict';
import {MongoClient} from 'mongodb';
import {randomUUID} from 'node:crypto';
import {CasinoRoomManager} from '../server/casino/CasinoRoomManager.js';
const client=new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017',{serverSelectionTimeoutMS:3000});
await client.connect();
const db=client.db(`casino_test_${randomUUID().replaceAll('-','')}`);
let now=100000,seq=0;
const options={clock:()=>now,config:{openMs:10,closedMs:10,shakeMs:10,revealMs:10,dealMs:10,caoMs:10,resultMs:10,turnMs:10}};
const players=[0,1,2,3].map(i=>({playerId:`test_${i}`,name:`Tester ${i}`,revision:0,progress:{coins:1000}}));
let manager=new CasinoRoomManager(db,options);
const act=(p,payload,id=`request_${++seq}`)=>manager.action(players[p],payload,id);
const balance=async p=>(await db.collection('players').findOne({playerId:players[p].playerId})).progress.coins;
async function join(game,count=2) {const room=[...manager.rooms.values()].find(r=>r.game===game&&r.system);for(let p=0;p<count;p++){await act(p,{kind:'join',roomId:room.id});assert.equal(manager.view(players[p].playerId).mine.seatList[p]?.playerId,players[p].playerId,'joining automatically assigns a unique place');await act(p,{kind:'ready',ready:true});}await manager.tick();return room;}
async function finish(room){for(let i=0;i<500&&room.round?.phase!=='result';i++){now+=11;await manager.tick();}assert.equal(room.round?.phase,'result');}
async function leave(count=2){for(let p=0;p<count;p++)await act(p,{kind:'leave'});}
try {
 await db.collection('players').insertMany(players);await manager.init();assert.equal(manager.rooms.size,4);
 let room=await join('tai-xiu');let id=room.round.id;
 const bet={kind:'bet',choice:'tai',amount:100,roundId:id};
 await act(0,bet,'duplicate');await act(0,bet,'duplicate');assert.equal(await balance(0),900);
 await assert.rejects(act(0,{...bet,choice:'xiu'},'duplicate'));
 await act(0,{kind:'cancel',roundId:id});assert.equal(await balance(0),1000);
 await act(0,bet);await finish(room);const receipt=room.round.plan[0];assert.equal(await balance(0),900+receipt.reward);
 await manager.finishSettlement(room);assert.equal(await balance(0),900+receipt.reward);await leave();
 room=await join('bai-cao');assert.equal(manager.view(players[0].playerId).mine.round.hand.length,3);assert.equal(manager.view(players[0].playerId).mine.round.result,null);
 const snapshot=manager.view(players[0].playerId);assert.equal(snapshot.mine.round.hands,undefined);assert.equal(snapshot.mine.round.banker,undefined);
 await act(2,{kind:'join',roomId:room.id});assert.deepEqual(manager.view(players[2].playerId).mine.round.hand,[]);
 await finish(room);assert.equal(room.round.plan.length,2);await leave();await act(2,{kind:'leave'});
 room=await join('tien-len',4);const before=await Promise.all(players.map((_,p)=>balance(p)));await finish(room);assert.equal(room.round.ranking.length,4);assert.equal(new Set(room.round.ranking).size,4);assert.deepEqual(await Promise.all(players.map((_,p)=>balance(p))),before);await leave(4);
 room=await join('bau-cua');id=room.round.id;const pre=await balance(0);await act(0,{kind:'bet',choice:'bau',amount:50,roundId:id});assert.equal(await balance(0),pre-50);
 manager=new CasinoRoomManager(db,options);await manager.init();assert.equal(await balance(0),pre);assert.equal((await manager.wallet.escrows()).length,0);
 await leave();
 await act(0,{kind:'create',game:'bai-cao',name:'Private test',password:'test-only-password'});
 const privateId=manager.view(players[0].playerId).mine.id;
 await assert.rejects(act(1,{kind:'join',roomId:privateId,password:'incorrect'}));
 await act(1,{kind:'join',roomId:privateId,password:'test-only-password'});
 assert.equal(manager.view(players[1].playerId).mine.password,undefined);await leave();
 const savedBalance=await balance(0);
 await Promise.all(Array.from({length:8},()=>manager.wallet.hold(players[0].playerId,'concurrent',100,{tai:100},'concurrent-request')));
 assert.equal(await balance(0),savedBalance-100);
 await Promise.all(Array.from({length:8},()=>manager.wallet.settle(players[0].playerId,'concurrent',200)));
 assert.equal(await balance(0),savedBalance+100);
 assert.equal(await db.collection('casino_ledger').countDocuments({playerId:players[0].playerId,roundId:'concurrent'}),2);
 await manager.wallet.hold(players[3].playerId,'orphan',100,{tai:100},'orphan-request');manager=new CasinoRoomManager(db,options);await manager.init();assert.equal(await balance(3),before[3]);
 console.log('Mongo casino: replay protection, cancel, payouts, private cards, spectators, full four-player round, restart/orphan refunds passed.');
}finally{await db.dropDatabase();await client.close();}
