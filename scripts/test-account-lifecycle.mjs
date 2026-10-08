import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
process.env.MONGODB_DB = `farm_account_test_${randomBytes(6).toString('hex')}`;
const {initGameStore,getGameStoreDatabase,authenticate,deleteGameAccount,loadPlayer} = await import('../server/GameStore.js');
await initGameStore();
const db=getGameStoreDatabase();
try {
 const id=`player_${randomBytes(16).toString('hex')}`;
 const account=await authenticate(id,'','Test account');
 const other=await authenticate(`player_${randomBytes(16).toString('hex')}`,'','Other account');
 await db.collection('farm_assignments').insertOne({playerId:id,villageId:'test',lot:1});
 await db.collection('crops').insertOne({villageId:'test',farmId:'farm_000001',tileKey:'0:0'});
 assert.ok((await deleteGameAccount(id,'wrong-token')).error);
 assert.ok(await loadPlayer(id));
 assert.equal((await deleteGameAccount(id,account.token)).deleted,true);
 assert.equal(await loadPlayer(id),null);
 assert.ok((await authenticate(id,account.token)).error);
 assert.ok((await authenticate(id,'')).error);
 assert.equal(await db.collection('farm_assignments').countDocuments({playerId:id}),0);
 assert.equal(await db.collection('crops').countDocuments({villageId:'test'}),0);
 assert.ok(await loadPlayer(other.playerId));
 console.log('PASS account deletion: token check, revoked identity, released land, crops and unrelated account preserved.');
} finally { await db.dropDatabase(); }
process.exit(0);
