import {spawn} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import {MongoClient} from 'mongodb';
import WebSocket from 'ws';
import {VENUE_LAYOUT} from '../shared/venueLayout.js';
import {FARM_LOT_SPEC} from '../shared/farmLayout.js';
import {suggestTienLenPlay} from '../shared/casino/tienLenRules.js';
const mongo=new MongoClient('mongodb://127.0.0.1:27017');await mongo.connect();
const db=mongo.db(`casino_visual_test_${randomUUID().replaceAll('-','')}`),token='isolated-casino-playtest';
const ids=['player_casino_playtest_main','player_casino_playtest_peer_one','player_casino_playtest_peer_two'];
await db.collection('players').insertMany(ids.map((playerId,i)=>({playerId,name:['Playtest','Minh · Test','An · Test'][i],revision:0,sessionIssuedAt:Date.now(),sessionTokenHash:createHash('sha256').update(`farm-online-3d:${token}`).digest('hex'),progress:{coins:1000},position:{...VENUE_LAYOUT.casino.interior,venue:'casino',villageId:'town',layoutVersion:FARM_LOT_SPEC.version}})));
const child=spawn(process.execPath,['server/index.js'],{env:{...process.env,MULTIPLAYER_PORT:'18991',MONGODB_DB:db.databaseName},stdio:['ignore','pipe','inherit']});
const peers=[];let started=false;
child.stdout.on('data',chunk=>{
 process.stdout.write(chunk);if(started||!String(chunk).includes('multiplayer listening'))return;started=true;
 for(let i=1;i<3;i++){
  const ws=new WebSocket('ws://127.0.0.1:18991');peers.push(ws);let mine=null,pending=false;const decisions=new Set();
  const send=payload=>ws.send(JSON.stringify({type:'game_action',action:'casino',requestId:randomUUID(),payload}));
  ws.on('open',()=>ws.send(JSON.stringify({type:'join',playerId:ids[i],sessionToken:token})));
  ws.on('message',raw=>{
   const m=JSON.parse(raw);if(m.type!=='casino_state')return;mine=m.mine;
   if(!mine&&!pending){const room=m.rooms.find(r=>r.occupied===1&&['bai-cao','tien-len'].includes(r.game));if(room){pending=true;send({kind:'join',roomId:room.id});}}
   else if(mine){
    pending=false;const seat=mine.seatList.find(s=>s?.playerId===ids[i]),main=mine.seatList.find(s=>s?.playerId===ids[0]);
    if(!main&&(!mine.round||mine.round.phase==='result'))send({kind:'leave',roomId:mine.id});
    else if(!seat&&!mine.round)send({kind:'seat',roomId:mine.id,seat:i});
    else if(seat&&!seat.ready&&!mine.round&&main?.ready)send({kind:'ready',roomId:mine.id,ready:true});
    else if(mine.game==='tien-len'&&mine.round?.phase==='playing'&&mine.round.turn===ids[i]) {
      const key=JSON.stringify([mine.round.id,mine.round.hand,mine.round.table]);
      if(!decisions.has(key)){decisions.add(key);const cards=suggestTienLenPlay(mine.round.hand,mine.round.table,mine.round.requiredFirst);send({kind:cards.length?'play':'pass',roomId:mine.id,...(cards.length?{cards}:{})});}
    }
   }
  });
 }
});
console.log('ISOLATED VISUAL TEST ONLY. Open http://localhost:4177/casino-playtest.html . Ctrl-C cleans only its random test database.');
let stopping=false;async function stop(){if(stopping)return;stopping=true;peers.forEach(ws=>ws.close());child.kill('SIGTERM');await new Promise(r=>child.once('exit',r));await db.dropDatabase();await mongo.close();process.exit(0);}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
