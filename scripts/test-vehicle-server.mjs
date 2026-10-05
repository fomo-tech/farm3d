import assert from 'node:assert/strict';
import { MongoClient } from 'mongodb';
import { randomUUID } from 'node:crypto';
import { VEHICLE_LIST } from '../shared/vehicleConfig.js';
const databaseName = `farm_vehicle_test_${randomUUID().replaceAll('-', '')}`;
process.env.MONGODB_DB = databaseName;
const mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 5000 });
let failed = false;
try {
  await mongo.connect();
  const store = await import('../server/GameStore.js'); await store.initGameStore();
  await store.authenticate('vehicle-test', null);
  const players = mongo.db(databaseName).collection('players');
  await players.updateOne({ playerId: 'vehicle-test' }, { $set: { 'progress.coins': 20000 } });
  let coins = 20000;
  for (const vehicle of VEHICLE_LIST) {
    const purchase = await store.performAction('vehicle-test', 'buy_vehicle', { id: vehicle.id, cost: 0 });
    assert.ok(!purchase.error, purchase.error);
    coins -= vehicle.cost;
    assert.equal(purchase.player.progress.coins, coins, 'server uses catalogue price');
    assert.equal(purchase.player.progress.vehicle, vehicle.id);
    const equip = await store.performAction('vehicle-test', 'buy_vehicle', { id: vehicle.id });
    assert.equal(equip.player.progress.coins, coins, 'owned vehicle is not charged twice');
  }
  assert.ok((await store.performAction('vehicle-test', 'buy_vehicle', { id: 'toString' })).error);
  assert.equal((await store.loadPlayer('vehicle-test')).progress.ownedVehicles.length, VEHICLE_LIST.length);
  console.log('PASS: Mongo vehicle purchase, authoritative prices, re-equip without charges, persistence and invalid IDs');
} catch (error) { failed = true; console.error(error); }
finally { if (mongo.topology?.isConnected()) await mongo.db(databaseName).dropDatabase(); await mongo.close(); }
process.exit(failed ? 1 : 0);
