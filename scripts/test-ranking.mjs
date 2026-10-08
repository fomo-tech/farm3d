import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
process.env.MONGODB_DB=`ranking_test_${randomBytes(6).toString('hex')}`;
const {initGameStore,getGameStoreDatabase,loadSocialState}=await import('../server/GameStore.js');
await initGameStore();const db=getGameStoreDatabase();
try{
 const people=Array.from({length:25},(_,i)=>({playerId:`player_rank_${String(i).padStart(10,'0')}`,name:`Farmer ${i}`,progress:{xp:25000-i*100,level:1+i%7,homeTier:1+i%5,coins:(i%9)*1000,profileAvatar:'data:image/jpeg;base64,/9j/2Q=='}}));
 await db.collection('players').insertMany([...people,{playerId:'player_deleted_ranking',name:'Deleted player',deletedAt:Date.now(),progress:{xp:999999,level:999,homeTier:999,coins:999999}}]);
 const me=people[24],state=await loadSocialState(me.playerId);
 for(const [kind,field] of [['xp','xp'],['level','level'],['home','homeTier'],['wealth','coins']]){
  const expected=[...people].sort((a,b)=>b.progress[field]-a.progress[field]||(a.playerId<b.playerId?-1:1));
  assert.deepEqual(state.leaderboards[kind].map(p=>p.playerId),expected.slice(0,20).map(p=>p.playerId));
  assert.equal(state.myRanks[kind],expected.findIndex(p=>p.playerId===me.playerId)+1);
 }
 assert.equal(state.myRanks.xp,25);
 assert.equal(state.leaderboards.wealth[0].progress.profileAvatar,people[0].progress.profileAvatar);
 assert.notEqual(state.leaderboards.wealth[0].playerId,state.leaderboards.xp[0].playerId);
 assert.notEqual(state.leaderboards.home[0].playerId,state.leaderboards.xp[0].playerId);
 assert.deepEqual(state.leaderboard,state.leaderboards.xp);
 console.log('PASS ranking: independent global top 20, consistent ties, own rank outside top 20, deleted accounts excluded.');
}finally{await db.dropDatabase();}
process.exit(0);
