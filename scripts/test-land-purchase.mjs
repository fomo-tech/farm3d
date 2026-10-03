import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { WebSocket } from 'ws';

// Only an isolated, generated test database is used; never touches live player data.
const databaseName = `farm_land_test_${randomUUID().replaceAll('-', '')}`;
const port = 18877;
const mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 5000 });
const clients = [];
let server;
function startServer() {
  server = spawn(process.execPath, ['server/index.js'], { env: { ...process.env, MONGODB_DB: databaseName, MULTIPLAYER_PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Test server startup timed out')), 15000);
    server.stderr.on('data', data => process.stderr.write(data));
    server.stdout.on('data', data => { if (String(data).includes('MongoDB connected')) { clearTimeout(timer); resolve(); } });
    server.once('exit', code => { clearTimeout(timer); reject(new Error(`Test server exited: ${code}`)); });
  });
}
async function stopServer() {
  if (!server || server.exitCode !== null) return;
  const exited = new Promise(resolve => server.once('exit', resolve));
  server.kill('SIGTERM'); await exited;
}
async function connect(playerId = `player_${randomUUID()}`, token) {
  const socket = new WebSocket(`ws://127.0.0.1:${port}`);
  const messages = []; const waiters = [];
  socket.on('message', raw => { const m = JSON.parse(raw); messages.push(m); for (const w of [...waiters]) if (w.test(m)) { waiters.splice(waiters.indexOf(w), 1); clearTimeout(w.timer); w.resolve(m); } });
  const wait = test => {
    const found = messages.find(test); if (found) return Promise.resolve(found);
    return new Promise((resolve, reject) => { const w = { test, resolve, timer: setTimeout(() => { waiters.splice(waiters.indexOf(w), 1); reject(new Error('WebSocket response timeout')); }, 5000) }; waiters.push(w); });
  };
  await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  socket.send(JSON.stringify({ type: 'join', playerId, sessionToken: token, name: 'Test buyer', villageId: 'binh-minh', requestedFarmId: 'farm_000001' }));
  const welcome = await wait(m => m.type === 'welcome');
  const account = await wait(m => m.type === 'account_state');
  const c = { socket, playerId, token: account.sessionToken, welcome, account, wait,
    action: async (action, payload = {}, requestId = randomUUID()) => {
      socket.send(JSON.stringify({ type: 'game_action', action, payload, requestId }));
      return wait(m => m.requestId === requestId && ['account_state', 'action_error'].includes(m.type));
    },
  };
  clients.push(c); return c;
}
try {
  await mongo.connect(); await startServer();
  const db = mongo.db(databaseName);
  const a = await connect(); const b = await connect();
  assert.equal(a.welcome.farmId, null); assert.equal(a.welcome.spawn.x, 0); assert.equal(a.welcome.spawn.z, 18);
  assert.equal(a.account.progress.unlockedPlots, 0); assert.deepEqual(a.account.progress.ownedHomes, []);
  assert.equal(await db.collection('farm_assignments').countDocuments(), 0);
  const initialMarket = await a.wait(m => m.type === 'farm_scope' && m.lots);
  const cheapBeforeCreation = initialMarket.lots.find(l => l.price === 150);
  assert.equal((await a.action('buy_land', { farmId: cheapBeforeCreation.farmId })).type, 'action_error');
  assert.equal(await db.collection('farm_assignments').countDocuments(), 0);
  assert.equal((await a.action('claim_seeds')).type, 'action_error');
  assert.equal((await a.action('character_create', { name: 'Buyer A' })).type, 'account_state');
  await b.action('character_create', { name: 'Buyer B' });
  const { lots } = await a.wait(m => m.type === 'farm_scope' && m.lots?.length === 288);
  assert.equal(new Set(lots.map(l => l.farmId)).size, 288);
  const ordered = [...lots].sort((x, y) => Math.hypot(x.x, x.z) - Math.hypot(y.x, y.z));
  for (let i = 1; i < ordered.length; i++) assert.ok(ordered[i - 1].price >= ordered[i].price);
  const cheapest = ordered.at(-1); assert.equal(cheapest.price, 150);
  assert.equal((await a.action('buy_land', { farmId: ordered[0].farmId, price: 0 })).type, 'action_error');
  assert.equal((await a.action('buy_land', { farmId: 'farm_999999', price: 0 })).type, 'action_error');
  const race = await Promise.all([a.action('buy_land', { farmId: cheapest.farmId, price: 0 }), b.action('buy_land', { farmId: cheapest.farmId, price: 0 })]);
  assert.equal(race.filter(r => r.type === 'account_state').length, 1);
  assert.equal(race.filter(r => r.type === 'action_error').length, 1);
  const winner = race[0].type === 'account_state' ? a : b;
  const loser = winner === a ? b : a;
  const owner = await db.collection('farm_assignments').findOne({ playerId: winner.playerId });
  assert.equal(owner.status, 'owned'); assert.equal(owner.purchasePrice, 150);
  const winnerDoc = await db.collection('players').findOne({ playerId: winner.playerId });
  const loserDoc = await db.collection('players').findOne({ playerId: loser.playerId });
  assert.equal(winnerDoc.progress.coins, 30); assert.equal(loserDoc.progress.coins, 180);
  assert.equal(winnerDoc.progress.unlockedPlots, 12); assert.equal(winnerDoc.progress.homeTier, 1);
  assert.equal((await winner.action('buy_land', { farmId: ordered[1].farmId })).type, 'action_error');
  assert.equal((await winner.action('claim_seeds')).type, 'account_state');
  const rejoined = await connect(winner.playerId, winner.token);
  assert.equal(rejoined.welcome.farmId, cheapest.farmId);
  assert.equal(rejoined.account.progress.coins, 80);
  const scope = await rejoined.wait(m => m.type === 'farm_scope' && m.lots);
  assert.equal(scope.lots.find(l => l.farmId === cheapest.farmId).userName, winner === a ? 'Buyer A' : 'Buyer B');
  // Crash recovery: a paid reservation must finalize; an unpaid one must release.
  await db.collection('farm_assignments').updateOne({ playerId: winner.playerId }, { $set: { status: 'pending' } });
  await db.collection('farm_assignments').insertOne({ playerId: loser.playerId, villageId: ordered[0].villageId, lot: ordered[0].lot, status: 'pending', purchaseId: 'unpaid' });
  clients.forEach(c => c.socket.terminate());
  await stopServer(); await startServer();
  assert.equal((await db.collection('farm_assignments').findOne({ playerId: winner.playerId })).status, 'owned');
  assert.equal(await db.collection('farm_assignments').countDocuments({ playerId: loser.playerId }), 0);
  // Legacy ownership has no purchase receipt/status and must be preserved.
  await db.collection('farm_assignments').insertOne({ playerId: loser.playerId, villageId: ordered[0].villageId, lot: ordered[0].lot });
  const legacy = await connect(loser.playerId, loser.token);
  assert.equal(legacy.welcome.farmId, ordered[0].farmId);
  assert.equal(legacy.account.progress.coins, 180);
  assert.equal((await legacy.action('buy_land', { farmId: ordered[1].farmId })).type, 'action_error');
  console.log('PASS: no free farm, 288 priced parcels, server price, insufficient funds, competing buyers, ownership/name, reconnect, farming gate, crash recovery.');
} finally {
  clients.forEach(c => c.socket.terminate()); await stopServer();
  if (!/^farm_land_test_[a-f0-9]{32}$/.test(databaseName)) throw new Error('Unsafe test database name');
  await mongo.db(databaseName).dropDatabase(); await mongo.close();
}
