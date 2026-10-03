import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { MongoClient } from 'mongodb';
import { WebSocket } from 'ws';

const databaseName = `farm_multiplayer_test_${randomUUID().replaceAll('-', '')}`;
const mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 5000 });
const sockets = [];
let server;

const port = await new Promise((resolve, reject) => {
  const probe = createServer();
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', () => {
    const selected = probe.address().port;
    probe.close(() => resolve(selected));
  });
});

function connectPlayer(index) {
  const playerId = `player_test_${randomUUID().replaceAll('-', '')}`;
  const socket = new WebSocket(`ws://127.0.0.1:${port}`);
  sockets.push(socket);
  const messages = [];
  const waiters = [];
  socket.on('message', raw => {
    const message = JSON.parse(String(raw));
    messages.push(message);
    for (const waiter of [...waiters]) {
      if (!waiter.match(message)) continue;
      waiters.splice(waiters.indexOf(waiter), 1);
      clearTimeout(waiter.timer);
      waiter.resolve(message);
    }
  });
  const waitFor = (match, timeoutMs = 8000) => {
    const existing = messages.find(match);
    if (existing) return Promise.resolve(existing);
    return new Promise((resolve, reject) => {
      const waiter = { match, resolve, timer: setTimeout(() => {
        waiters.splice(waiters.indexOf(waiter), 1);
        reject(new Error(`Client ${index}: timeout waiting for message`));
      }, timeoutMs) };
      waiters.push(waiter);
    });
  };
  return new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.once('open', async () => {
      try {
        socket.send(JSON.stringify({ type: 'join', playerId, name: `Tester ${index}` }));
        const welcome = await waitFor(message => message.type === 'welcome');
        assert.equal(welcome.playerId, playerId);
        resolve({ playerId, socket, waitFor, messages });
      } catch (error) { reject(error); }
    });
  });
}

try {
  await mongo.connect();
  server = spawn(process.execPath, ['server/index.js'], {
    env: { ...process.env, MONGODB_DB: databaseName, MULTIPLAYER_PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server startup timeout')), 15000);
    server.stdout.on('data', data => {
      if (!String(data).includes('MongoDB connected')) return;
      clearTimeout(timer); resolve();
    });
    server.stderr.on('data', data => process.stderr.write(data));
    server.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited: ${code}`)); });
  });

  const players = await Promise.all(Array.from({ length: 8 }, (_, index) => connectPlayer(index)));
  assert.equal(new Set(players.map(player => player.playerId)).size, 8);
  await Promise.all(players.map(player => player.waitFor(message =>
    message.type === 'world_state' && message.players.length === 8 &&
    new Set(message.players.map(other => other.playerId)).size === 8)));

  const start = Date.now();
  await Promise.all(players.map((player, index) => {
    const x = index * 0.5;
    player.socket.send(JSON.stringify({ type: 'move', x, y: 0, z: 18, rotation: index * 0.1 }));
    return player.waitFor(message => message.type === 'move_ack' && message.accepted === true && message.x === x);
  }));
  const moveAckMs = Date.now() - start;
  const synchronized = await players[0].waitFor(message =>
    message.type === 'world_state' && message.players.length === 8 &&
    message.players.some(other => other.playerId === players[7].playerId && other.x === 3.5));
  assert.equal(synchronized.players.length, 8);

  players[7].socket.close();
  await players[0].waitFor(message => message.type === 'world_state' && message.players.length === 7);
  const health = await fetch(`http://127.0.0.1:${port}/health`).then(response => response.json());
  assert.equal(health.players, 7);
  console.log(`PASS: 8 clients connected together; 8-player presence; parallel movement ACK ${moveAckMs}ms; movement sync; disconnect leaves 7 clients.`);
} finally {
  sockets.forEach(socket => socket.terminate());
  if (server && server.exitCode === null) {
    const exited = new Promise(resolve => server.once('exit', resolve));
    server.kill('SIGTERM');
    await exited;
  }
  if (!/^farm_multiplayer_test_[a-f0-9]{32}$/.test(databaseName)) throw new Error('Unsafe test database name');
  await mongo.db(databaseName).dropDatabase();
  await mongo.close();
}
