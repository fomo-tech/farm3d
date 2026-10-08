import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {lotteryDay,LOTTERY_CONFIG} from '../shared/lotteryConfig.js';
import {lotteryDraw} from '../server/LotteryStore.js';
process.env.MONGODB_DB=`lottery_authority_test_${randomBytes(6).toString('hex')}`;
const {initGameStore,getGameStoreDatabase,authenticate,performAction,loadPlayer}=await import('../server/GameStore.js');
await initGameStore();const db=getGameStoreDatabase();
try{
 const id=`player_${randomBytes(16).toString('hex')}`,account=await authenticate(id,'','Lottery tester');
 const day=lotteryDay(Date.now()-86400000),draw=await lotteryDraw(db,day);
 await db.collection('players').updateOne({playerId:id},{$set:{'progress.coins':1000,'progress.lottery':{tickets:[{id:'winning-test-ticket',day,number:draw.winner,claimed:false}]}}});
 const results=await Promise.all(Array.from({length:4},()=>performAction(id,'lottery_claim',{ticketId:'winning-test-ticket'},{...LOTTERY_CONFIG.npc})));
 assert.equal(results.filter(r=>!r.error).length,1);
 const player=await loadPlayer(id);assert.equal(player.progress.coins,51000);assert.equal(player.progress.lottery.tickets[0].claimed,true);
 const before=player.progress.coins;
 assert.ok((await performAction(id,'lottery_buy',{number:'000123'},{x:0,z:42})).error);
 assert.equal((await loadPlayer(id)).progress.coins,before);
 console.log('PASS lottery authority: concurrent claim pays once; remote purchase never deducts coins.');
}finally{await db.dropDatabase();}
process.exit(0);
