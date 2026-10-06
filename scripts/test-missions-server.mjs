import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { WebSocket } from 'ws';
import { freshDailyMissions } from '../shared/missions.js';

const databaseName = `farm_missions_test_${randomUUID().replaceAll('-', '')}`;
const port = 18879;
const mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 5000 });
let server;
let socket;
try {
  await mongo.connect();
  server = spawn(process.execPath, ['server/index.js'], { env: { ...process.env, MONGODB_DB: databaseName, MULTIPLAYER_PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server startup timeout')), 15000);
    server.stdout.on('data', chunk => { if (String(chunk).includes('MongoDB connected')) { clearTimeout(timer); resolve(); } });
    server.stderr.on('data', chunk => process.stderr.write(chunk));
    server.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited: ${code}`)); });
  });
  socket = new WebSocket(`ws://127.0.0.1:${port}`);
  const messages = [];
  const waiters = [];
  socket.on('message', raw => {
    const message = JSON.parse(raw);
    messages.push(message);
    for (const waiter of [...waiters]) if (waiter.test(message)) {
      waiters.splice(waiters.indexOf(waiter), 1);
      clearTimeout(waiter.timer);
      waiter.resolve(message);
    }
  });
  const wait = test => {
    const match = messages.find(test);
    if (match) return Promise.resolve(match);
    return new Promise((resolve, reject) => {
      const waiter = { test, resolve, timer: setTimeout(() => reject(new Error('Response timeout')), 5000) };
      waiters.push(waiter);
    });
  };
  await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  const playerId = `player_mission_${randomUUID()}`;
  socket.send(JSON.stringify({ type: 'join', playerId, name: 'Mission Tester', villageId: 'binh-minh' }));
  await wait(message => message.type === 'welcome');
  await wait(message => message.type === 'account_state');
  const action = (name, payload) => {
    const requestId = randomUUID();
    socket.send(JSON.stringify({ type: 'game_action', action: name, payload, requestId }));
    return wait(message => message.requestId === requestId && ['account_state', 'action_error'].includes(message.type));
  };
  assert.equal((await action('claim_mission', { kind: 'daily', id: 'daily-plant-2' })).type, 'action_error');
  const players = mongo.db(databaseName).collection('players');
  const stats = { planted: 10, watered: 0, harvested: 3, orders: 1, animalsFed: 0, crafted: 0 };
  await players.updateOne({ playerId }, { $set: { 'progress.onboarding.completed': true, 'progress.onboarding.step': 6, 'progress.stats': stats, 'progress.missions': { main: { claimed: [] }, daily: freshDailyMissions(stats) } } });
  assert.equal((await action('claim_mission', { kind: 'main', id: 'main-orders-2' })).type, 'action_error', 'main missions are sequential');
  const [first, second] = await Promise.all([
    action('claim_mission', { kind: 'main', id: 'main-harvest-3' }),
    action('claim_mission', { kind: 'main', id: 'main-harvest-3' }),
  ]);
  assert.equal([first, second].filter(result => result.type === 'account_state').length, 1, 'concurrent claim grants once');
  assert.equal((await action('claim_mission', { kind: 'main', id: 'main-harvest-3' })).type, 'action_error');
  assert.equal((await action('claim_mission', { kind: 'daily', id: 'daily-plant-2' })).type, 'action_error', 'old stats cannot complete daily task');
  await players.updateOne({ playerId }, { $inc: { 'progress.stats.planted': 2 } });
  assert.equal((await action('claim_mission', { kind: 'daily', id: 'daily-plant-2' })).type, 'account_state');
  assert.equal((await action('claim_mission', { kind: 'daily', id: 'daily-plant-2' })).type, 'action_error');
  const legacyClaim = await action('claim_quest', { id: 'harvest-3' });
  assert.deepEqual(legacyClaim.result?.questClaimed, { id: 'harvest-3' }, 'legacy reward animation only starts after server confirmation');
  assert.equal((await action('claim_quest', { id: 'harvest-3' })).type, 'action_error', 'legacy reward cannot be claimed twice');
  const saved = await players.findOne({ playerId });
  assert.deepEqual(saved.progress.missions.main.claimed, ['main-harvest-3']);
  assert.deepEqual(saved.progress.missions.daily.claimed, ['daily-plant-2']);
  assert.equal(saved.progress.coins, 180 + 80 + 30 + 60);
  await players.updateOne({ playerId }, { $set: { 'progress.missions.daily.dayKey': '2020-01-01' } });
  const beforeSync = messages.length;
  socket.send(JSON.stringify({ type: 'missions_sync' }));
  const refreshed = await wait(message => messages.indexOf(message) >= beforeSync && message.type === 'account_state' && message.progress?.missions?.daily?.dayKey !== '2020-01-01' && message.progress?.missions?.daily?.claimed?.length === 0);
  assert.equal(refreshed.progress.missions.main.claimed.length, 1, 'main story remains after day rollover');
  assert.equal(refreshed.progress.missions.daily.baseline.planted, 12, 'new daily baseline starts at current stats');
  console.log('PASS: server-only mission progress, sequence, concurrent claim and daily baseline.');
} finally {
  socket?.close();
  if (server && server.exitCode === null) { const ended = new Promise(resolve => server.once('exit', resolve)); server.kill('SIGTERM'); await ended; }
  try { await mongo.db(databaseName).dropDatabase(); } catch { /* Database may not have been created. */ }
  await mongo.close();
}
