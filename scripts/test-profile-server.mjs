import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { WebSocket } from 'ws';

const databaseName = `farm_profile_test_${randomUUID().replaceAll('-', '')}`;
const port = 18883;
const mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 5000 });
let server;
const sockets = [];
try {
  await mongo.connect();
  server = spawn(process.execPath, ['server/index.js'], { env: { ...process.env, MONGODB_DB: databaseName, MULTIPLAYER_PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server startup timeout')), 15000);
    server.stdout.on('data', chunk => { if (String(chunk).includes('MongoDB connected')) { clearTimeout(timeout); resolve(); } });
    server.stderr.on('data', chunk => process.stderr.write(chunk));
    server.once('exit', code => { clearTimeout(timeout); reject(new Error(`Server exited: ${code}`)); });
  });
  const connect = async (name) => {
    const socket = new WebSocket(`ws://127.0.0.1:${port}`);
    sockets.push(socket);
    const messages = [];
    const waiters = [];
    socket.on('message', raw => {
      const msg = JSON.parse(raw);
      messages.push(msg);
      for (const pending of [...waiters]) if (pending.test(msg)) {
        waiters.splice(waiters.indexOf(pending), 1);
        clearTimeout(pending.timeout);
        pending.resolve(msg);
      }
    });
    const wait = test => {
      const match = messages.find(test);
      if (match) return Promise.resolve(match);
      return new Promise((resolve, reject) => {
        const pending = { test, resolve, timeout: setTimeout(() => reject(new Error('Response timeout')), 5000) };
        waiters.push(pending);
      });
    };
    await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
    const playerId = `player_${randomUUID()}`;
    socket.send(JSON.stringify({ type: 'join', playerId, name, villageId: 'binh-minh' }));
    await wait(msg => msg.type === 'welcome');
    const action = (actionName, payload) => {
      const requestId = randomUUID();
      socket.send(JSON.stringify({ type: 'game_action', action: actionName, payload, requestId }));
      return wait(msg => msg.requestId === requestId && ['account_state', 'action_error'].includes(msg.type));
    };
    const profile = target => {
      socket.send(JSON.stringify({ type: 'get_profile', playerId: target }));
      return wait(msg => msg.type === 'profile_state' && msg.requestedId === target);
    };
    return { socket, playerId, action, profile, wait };
  };
  const a = await connect('Hồ Sơ A');
  const b = await connect('Hồ Sơ B');
  assert.equal((await a.profile(b.playerId)).profile, null, 'unfinished character must not have a public profile');
  assert.equal((await a.action('character_create', { name: 'Minh Một' })).type, 'account_state');
  assert.equal((await b.action('character_create', { name: 'Minh Hai' })).type, 'account_state');
  assert.equal((await a.action('profile_update', { name: 'Minh Mới', bio: 'Trồng cà rốt và câu cá' })).type, 'account_state');
  const visible = (await b.profile(a.playerId)).profile;
  assert.equal(visible.name, 'Minh Mới');
  assert.equal(visible.bio, 'Trồng cà rốt và câu cá');
  assert.equal(visible.stats.fish, 0);
  for (const privateKey of ['coins', 'gems', 'inventory', 'sessionToken', 'position', 'email']) assert.equal(Object.hasOwn(visible, privateKey), false, `${privateKey} must stay private`);
  assert.equal((await b.action('profile_update', { name: 'Minh Mới', bio: 'Không trùng' })).type, 'action_error');
  assert.equal((await b.action('profile_update', { name: 'Minh Hai', bio: 'x'.repeat(81) })).type, 'action_error');
  b.socket.send(JSON.stringify({ type: 'social_action', action: 'add_friend', friendId: a.playerId }));
  const social = await b.wait(msg => msg.type === 'social_state' && msg.friends?.some(friend => friend.playerId === a.playerId));
  assert.equal(social.friends[0].name, 'Minh Mới');
  console.log('PASS: two-account public profile, private-field filtering, name uniqueness, bio limit, friend state.');
} finally {
  for (const socket of sockets) socket.close();
  if (server && server.exitCode === null) { const ended = new Promise(resolve => server.once('exit', resolve)); server.kill('SIGTERM'); await ended; }
  try { await mongo.db(databaseName).dropDatabase(); } catch { /* no test data */ }
  await mongo.close();
}
