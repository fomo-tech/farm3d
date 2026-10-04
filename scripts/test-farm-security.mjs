import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { FarmSecurity } from '../server/FarmSecurity.js';
import { farmOrigin, farmGatePosition, farmBoundaryBlocked, theftPolicy } from '../shared/farmSecurity.js';
import { FARM_CONFIG } from '../shared/farmConfig.js';
import { WorldCollisionSystem } from '../src/game/physics/WorldCollisionSystem.js';

const farmId = 'farm_000001', o = farmOrigin(farmId), g = farmGatePosition(farmId);
const outside = { x: g.x, z: g.z - 2 }, inside = { x: g.x, z: g.z + 2 };
assert.equal(farmBoundaryBlocked(farmId, false, outside, inside), true);
assert.equal(farmBoundaryBlocked(farmId, true, outside, inside), false);
assert.equal(farmBoundaryBlocked(farmId, false, inside, outside), false, 'trapped guest can exit');
assert.equal(farmBoundaryBlocked(farmId, true, { x: o.x - 12, z: o.z }, { x: o.x + 12, z: o.z }), true, 'long step cannot bypass fences');
assert.equal(farmBoundaryBlocked(farmId, true, { x: o.x + 8, z: g.z - 2 }, { x: o.x + 8, z: g.z + 2 }), true);
const collision = new WorldCollisionSystem();
collision.setFarmGate(farmId, false);
assert.equal(collision.resolveMovement(outside.x, outside.z, 0, 4).collided, true);
collision.setFarmGate(farmId, true);
assert.equal(collision.resolveMovement(outside.x, outside.z, 0, 4).collided, false);
const nowBase = Date.now();
const mature = { state: 'watered', crop: 'carrot', plantedAt: nowBase - 120000, wateredAt: nowBase - 100000, yield: 4, stolenAmount: 0 };
assert.equal(theftPolicy({ gateOpen: false, row: mature, now: nowBase, claimedAt: 0 }).error.includes('đóng'), true);
assert.equal(theftPolicy({ gateOpen: true, row: { ...mature, yield: 1 }, now: nowBase, claimedAt: 0 }).error.includes('bảo vệ'), true);
assert.equal(theftPolicy({ gateOpen: true, row: mature, now: nowBase, claimedAt: nowBase }).error.includes('mới'), true);

// Live Mongo tests use ONLY a generated temporary database.
const mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 5000 });
const databaseName = `farm_security_test_${randomUUID().replaceAll('-', '')}`;
await mongo.connect();
const db = mongo.db(databaseName);
let now = nowBase;
const stores = { assignments: db.collection('farm_assignments'), crops: db.collection('crops'), players: db.collection('players'), now: () => now };
const service = new FarmSecurity(stores);
const assignment = { playerId: 'owner', villageId: 'binh-minh', lot: 1, claimedAt: 0, gateOpen: false, status: 'owned' };
const row = { ...mature, villageId: 'binh-minh', farmId, tileKey: '0:0' };
const position = { x: o.x, z: o.z - 3 };
const args = playerId => ({ assignment, farmId, storageFarmId: farmId, tileKey: '0:0', playerId, position, tilePosition: position });
async function start(id = 'thief') {
  const result = await service.steal({ ...args(id), phase: 'start' });
  assert.ok(result.pending, JSON.stringify(result)); return result.pending;
}
async function resetCrop(tileKey = '0:0') {
  await stores.crops.replaceOne({ farmId, tileKey }, { ...row, tileKey, plantedAt: now - 120000, wateredAt: now - 100000 }, { upsert: true });
}
try {
  assignment._id = (await stores.assignments.insertOne(assignment)).insertedId;
  await stores.crops.insertOne(row);
  for (const playerId of ['thief', 'second', 'owner']) await stores.players.insertOne({ playerId, revision: 0, progress: { inventory: { carrot: 0 }, barnLevel: 2 } });
  await service.init();
  assert.equal(service.blocksMovement(outside, inside), true);
  assert.ok((await service.toggle(assignment, farmId, 'thief', true, outside)).error);
  assert.ok((await service.steal({ ...args('thief'), phase: 'start' })).error);
  assert.ok(!(await service.toggle(assignment, farmId, 'owner', true, outside)).error);
  assert.equal(service.blocksMovement(outside, inside), false);
  assert.ok((await service.toggle(assignment, farmId, 'owner', false, outside, [g])).error, 'closing on an occupant is refused');
  let pending = await start();
  assert.ok((await service.steal({ ...args('thief'), phase: 'finish', token: pending.token })).error, 'early finish denied');
  pending = await start();
  await service.toggle(assignment, farmId, 'owner', false, outside);
  now += 3100;
  assert.ok((await service.steal({ ...args('thief'), phase: 'finish', token: pending.token })).error, 'closed gate cancels');
  await service.toggle(assignment, farmId, 'owner', true, outside);
  pending = await start();
  service.observeMovement('thief', { x: position.x + 1, z: position.z }, () => position);
  now += 3100;
  assert.ok((await service.steal({ ...args('thief'), phase: 'finish', token: pending.token })).error, 'move away and back cancels');
  const first = await start(), second = await start('second');
  now += 3100;
  const winners = await Promise.all([
    service.steal({ ...args('thief'), phase: 'finish', token: first.token }),
    service.steal({ ...args('second'), phase: 'finish', token: second.token }),
  ]);
  assert.equal(winners.filter(result => !result.error).length, 1, 'one winner per crop');
  const crop = await stores.crops.findOne({ farmId, tileKey: '0:0' });
  assert.equal(crop.yield - crop.stolenAmount, 3, 'owner keeps 75%');
  assert.equal((await stores.players.findOne({ playerId: 'thief' })).progress.inventory.carrot, 1);
  assert.ok((await service.steal({ ...args('thief'), phase: 'finish', token: first.token })).error, 'replay denied');
  // No loss when receiver has insufficient inventory capacity.
  await resetCrop();
  await stores.players.updateOne({ playerId: 'second' }, { $set: { 'progress.inventory.carrot': 40 } });
  pending = await start('second'); now += 3100;
  assert.ok((await service.steal({ ...args('second'), phase: 'finish', token: pending.token })).error.includes('Kho'));
  assert.equal((await stores.crops.findOne({ farmId, tileKey: '0:0' })).stolenAmount, 0);
  await stores.players.updateOne({ playerId: 'second' }, { $set: { 'progress.inventory.carrot': 0 } });
  // Simulate process death after reservation and after reward commit.
  const day = new Date(now).toISOString().slice(0, 10);
  let claim = { id: randomUUID(), playerId: 'second', day, amount: 1, counterPath: `theftCounts.${day}` };
  await stores.crops.updateOne({ farmId, tileKey: '0:0' }, { $set: { theftClaim: claim } });
  let recovered = new FarmSecurity(stores); await recovered.init();
  assert.equal((await stores.crops.findOne({ farmId, tileKey: '0:0' })).theftClaim, undefined, 'unpaid claim rolled back');
  claim = { ...claim, id: randomUUID() };
  await stores.crops.updateOne({ farmId, tileKey: '0:0' }, { $set: { theftClaim: claim } });
  await stores.players.updateOne({ playerId: 'second' }, { $addToSet: { farmTheftReceipts: claim.id }, $inc: { 'progress.inventory.carrot': 1 } });
  recovered = new FarmSecurity(stores); await recovered.init(); await recovered.init();
  assert.equal((await stores.crops.findOne({ farmId, tileKey: '0:0' })).stolenAmount, 1);
  assert.equal((await stores.assignments.findOne({ _id: assignment._id })).theftCounts[day], 2, 'recovery counts once');
  assert.equal((await stores.players.findOne({ playerId: 'second' })).progress.inventory.carrot, 1, 'recovery never duplicates credit');
  await resetCrop(); pending = await start(); now += 3100;
  assert.ok(!(await service.steal({ ...args('thief'), phase: 'finish', token: pending.token })).error);
  await resetCrop();
  assert.ok((await service.steal({ ...args('second'), phase: 'start' })).error, 'aggregate farm daily limit');
  now += 86400000;
  assert.ok((await service.steal({ ...args('second'), phase: 'start' })).pending, 'next UTC day resets limits');
  await stores.players.updateOne({ playerId: 'second' }, { $set: { [`farmTheftCounts.${new Date(now).toISOString().slice(0, 10)}`]: FARM_CONFIG.security.theft.dailyPlayerLimit } });
  assert.ok((await service.steal({ ...args('second'), phase: 'start' })).error, 'account daily limit');
  await service.toggle(assignment, farmId, 'owner', false, outside);
  recovered = new FarmSecurity(stores); await recovered.init();
  assert.equal(recovered.blocksMovement(outside, inside), true, 'closed state survives restart');
  console.log('PASS: gate ownership/collision/exit, closed-gate theft denial, timed cancellation, concurrency, yield protection, full barn, replay, daily limits and crash recovery (isolated MongoDB).');
} finally {
  await db.dropDatabase(); await mongo.close();
}
