import assert from 'node:assert/strict';
import { MongoClient } from 'mongodb';
import { randomUUID } from 'node:crypto';
const databaseName = `farm_livestock_test_${randomUUID().replaceAll('-', '')}`;
process.env.MONGODB_DB = databaseName;
const mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 5000 });
let failed = false;
try {
  await mongo.connect();
  const store = await import('../server/GameStore.js'); await store.initGameStore();
  await store.authenticate('owner', null); await store.authenticate('visitor', null);
  const db = mongo.db(databaseName);
  await db.collection('players').updateOne({ playerId:'owner' }, { $set: { 'progress.coins': 5000, 'progress.barnLevel': 2 } });
  await db.collection('farm_assignments').insertOne({ playerId:'owner', villageId:'binh-minh', lot:1, status:'owned' });
  const context = { farmId:'farm_000001', villageId:'binh-minh' };
  assert.ok((await store.performAction('visitor','build_pen',{species:'cow'},context)).error);
  for (const species of ['chicken','duck','pig','cow']) {
    assert.ok(!(await store.performAction('owner','build_pen',{species},context)).error);
    assert.ok(!(await store.performAction('owner','buy_animal',{species, price:0},context)).error);
  }
  assert.ok(!(await store.performAction('owner','feed_animals',{},context)).error);
  assert.ok((await store.performAction('owner','feed_animals',{},context)).error);
  const before = await db.collection('players').findOne({playerId:'owner'});
  await db.collection('players').updateOne({playerId:'owner'},{$set:{livestock:before.livestock.map(a=>({...a,productReadyAt:Date.now()-1}))}});
  const collected = await store.performAction('owner','collect_animals',{},context);
  assert.equal(collected.player.progress.inventory.duckEgg,1);
  assert.equal(collected.player.progress.inventory.maturePig,undefined);
  const pig = collected.player.livestock.find(a=>a.species==='pig');
  assert.ok(!(await store.performAction('owner','sell_animal',{id:pig.id},context)).error);
  assert.ok((await store.performAction('owner','sell_animal',{id:pig.id},context)).error);
  assert.ok(!(await store.performAction('owner','sell_livestock_product',{id:'duckEgg'},context)).error);
  const profiles = await store.loadPublicFarmProfiles(['owner']);
  assert.equal(profiles[0].livestock.length,3);
  console.log('PASS live Mongo livestock: ownership, durable purchase/feed/collect/sale, public herd');
} catch (error) { failed=true; console.error(error); }
finally { if (mongo.topology?.isConnected()) await mongo.db(databaseName).dropDatabase(); await mongo.close(); }
process.exit(failed ? 1 : 0);
