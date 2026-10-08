import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID, createHash } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { WebSocket } from 'ws';
import { farmTilePosition } from '../shared/farmLayout.js';

const databaseName = `farm_security_net_test_${randomUUID().replaceAll('-', '')}`;
const port = 18479, mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017');
const sockets = []; let server;
await mongo.connect(); const db = mongo.db(databaseName);
async function connect(playerId) {
  const socket = new WebSocket(`ws://127.0.0.1:${port}`), messages = [], waiters = [];
  sockets.push(socket);
  socket.on('message', raw => { const m = JSON.parse(raw); messages.push(m); for (const w of [...waiters]) if (w.test(m)) { waiters.splice(waiters.indexOf(w), 1); clearTimeout(w.timer); w.resolve(m); } });
  function wait(test) {
    const found = messages.find(test); if (found) return Promise.resolve(found);
    return new Promise((resolve, reject) => { const w = { test, resolve, timer: setTimeout(() => reject(new Error('Network security test timeout')), 7000) }; waiters.push(w); });
  }
  await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  socket.send(JSON.stringify({ type: 'join', playerId, sessionToken: `test-${playerId}`, name: playerId }));
  await wait(m => m.type === 'welcome');
  return { socket, wait, request: async payload => {
    const requestId = randomUUID(); socket.send(JSON.stringify({ ...payload, requestId }));
    return wait(m => m.requestId === requestId && ['farm_gate', 'action_error', 'theft_pending', 'account_state'].includes(m.type));
  }, move: async (x, z) => {
    messages.splice(0, messages.length);
    socket.send(JSON.stringify({ type: 'move', x, y: 0, z, rotation: 0 }));
    return wait(m => m.type === 'move_ack');
  } };
}
try {
  const now = Date.now();
  for (const [playerId, lot, z] of [['player_security_ownertest', 1, 100], ['player_security_thieftest', 2, 101]]) {
    await db.collection('players').insertOne({ playerId, name: playerId, revision: 0, sessionTokenHash: createHash('sha256').update(`farm-online-3d:test-${playerId}`).digest('hex'), sessionIssuedAt: now,
      position: { x: -45, y: 0, z, rotation: 0, villageId: 'binh-minh', layoutVersion: 7 },
      progress: { barnLevel: 2, homeTier: 1, unlockedPlots: 12, inventory: { carrot: 0 }, onboarding: { characterCreated: true, completed: true, step: 6 } } });
    await db.collection('farm_assignments').insertOne({ playerId, villageId: 'binh-minh', lot, status: 'owned', claimedAt: 1, gateOpen: false });
  }
  await db.collection('crops').insertOne({ villageId: 'binh-minh', farmId: 'farm_000001', tileKey: '0:0', state: 'watered', crop: 'carrot', plantedAt: now - 1820000, wateredAt: now - 1801000, yield: 4, stolenAmount: 0 });
  server = spawn(process.execPath, ['server/index.js'], { env: { ...process.env, MONGODB_DB: databaseName, MULTIPLAYER_PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Test server startup timeout')), 15000);
    server.stdout.on('data', data => { if (String(data).includes('MongoDB connected')) { clearTimeout(timer); resolve(); } });
    server.stderr.on('data', data => process.stderr.write(data));
    server.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited ${code}`)); });
  });
  const owner = await connect('player_security_ownertest'), thief = await connect('player_security_thieftest');
  const gate = open => owner.request({ type: 'game_action', action: 'farm_gate', payload: { farmId: 'farm_000001', open } });
  const theft = (action, token) => thief.request({ type: 'farm_action', farmId: 'farm_000001', tileKey: '0:0', action, token });
  assert.equal((await thief.move(-45, 103)).accepted, false, 'server rejects crossing closed gate');
  assert.equal((await thief.request({ type: 'game_action', action: 'farm_gate', payload: { farmId: 'farm_000001', open: true } })).type, 'action_error');
  assert.equal((await gate(true)).type, 'farm_gate');
  assert.equal((await thief.wait(m => m.type === 'farm_gate' && m.open)).open, true, 'gate broadcast reaches other account');
  for (const [x, z] of [[-45, 103], [-46, 105], [-48.15, 107.2]]) {
    // Respect the real server speed budget instead of teleporting the fixture.
    await new Promise(resolve => setTimeout(resolve, 400));
    assert.equal((await thief.move(x, z)).accepted, true);
  }
  let pending = await theft('steal_start'); assert.equal(pending.type, 'theft_pending');
  assert.equal((await gate(false)).type, 'farm_gate');
  await new Promise(resolve => setTimeout(resolve, 3100));
  assert.equal((await theft('steal_finish', pending.token)).type, 'action_error');
  assert.equal((await db.collection('players').findOne({ playerId: 'player_security_thieftest' })).progress.inventory.carrot, 0);
  await gate(true);
  pending = await theft('steal_start'); assert.equal(pending.type, 'theft_pending');
  await new Promise(resolve => setTimeout(resolve, 3100));
  const rewarded = await theft('steal_finish', pending.token);
  assert.equal(rewarded.type, 'account_state'); assert.equal(rewarded.progress.inventory.carrot, 1);
  assert.equal((await db.collection('crops').findOne({ tileKey: '0:0' })).stolenAmount, 1);
  assert.equal((await theft('steal_finish', pending.token)).type, 'action_error');
  console.log('PASS: two-account WebSocket gate sync, authoritative closed-gate movement, unauthorized toggle, timed theft, gate cancellation, crop transfer and replay denial.');
} finally {
  sockets.forEach(socket => socket.close());
  if (server && server.exitCode === null) { const stopped = new Promise(resolve => server.once('exit', resolve)); server.kill('SIGTERM'); await stopped; }
  await db.dropDatabase(); await mongo.close();
}
