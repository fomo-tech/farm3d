import { applyWorldDelta } from '../shared/worldDelta.js';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { MongoClient } from 'mongodb';
import { WebSocket } from 'ws';
import { ECONOMY_REWARD_CONFIG } from '../shared/economyRewardConfig.js';
import { TOWN_SPAWN } from '../shared/playerSpawn.js';

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
  const worldPlayers = new Map();
  const waiters = [];
  socket.on('message', raw => {
    const message = JSON.parse(String(raw));
    if (message.type === 'world_delta') {
      message.players = applyWorldDelta(worldPlayers, message);
      message.type = 'world_state';
    }
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
        reject(new Error(`Client ${index}: timeout waiting for message; received ${JSON.stringify(messages.slice(-5).map(m=>({type:m.type,message:m.message})))}`));
      }, timeoutMs) };
      waiters.push(waiter);
    });
  };
  return new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.once('open', async () => {
      try {
        socket.send(JSON.stringify({ type: 'join', worldDelta: index === 0 ? 1 : undefined, playerId, name: `Tester ${index}` }));
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
  const rewardRequest={type:'game_action',requestId:randomUUID(),action:'claim_daily_reward',payload:{coins:999999}};
  players[0].socket.send(JSON.stringify(rewardRequest));
  const reward=await players[0].waitFor(message=>message.type==='account_state'&&message.requestId===rewardRequest.requestId);
  assert.equal(reward.result.communityReward.coins,100);
  assert.equal(reward.progress.coins,ECONOMY_REWARD_CONFIG.initial.coins + 100);
  players[0].socket.send(JSON.stringify({...rewardRequest,requestId:randomUUID()}));
  await players[0].waitFor(message=>message.type==='action_error'&&message.message.includes('đã nhận thưởng'));
  const persisted=await mongo.db(databaseName).collection('players').findOne({playerId:players[0].playerId});
  assert.equal(persisted.progress.coins,ECONOMY_REWARD_CONFIG.initial.coins + 100,'network retries cannot duplicate daily reward');
  await Promise.all(players.map(player => player.waitFor(message =>
    message.type === 'world_state' && message.players.length === 8 &&
    new Set(message.players.map(other => other.playerId)).size === 8)));

  const sessionTokens = await Promise.all(players.map(async player => {
    const account = await player.waitFor(message => message.type === 'account_state' && message.sessionToken);
    return account.sessionToken;
  }));
  for (const receiver of players) {
    const publicMessages = receiver.messages.filter(message => message.type === 'world_state');
    assert.ok(publicMessages.length > 0);
    for (const message of publicMessages) {
      const wire = JSON.stringify(message);
      assert.ok(!wire.includes('sessionToken'), 'world_state contains no authentication field');
      for (const token of sessionTokens) assert.ok(!wire.includes(token), 'no viewer can receive another session credential');
      assert.ok(message.players.every(player => !Object.hasOwn(player, 'messages') && !Object.hasOwn(player, 'telemetrySessionId')));
    }
  }

  const start = Date.now();
  await Promise.all(players.map((player, index) => {
    const x = TOWN_SPAWN.x + index * 0.1;
    player.socket.send(JSON.stringify({ type: 'move', x, y: 0, z: TOWN_SPAWN.z, rotation: index * 0.1 }));
    return player.waitFor(message => message.type === 'move_ack' && message.accepted === true && message.x === x);
  }));
  const moveAckMs = Date.now() - start;
  const synchronized = await players[0].waitFor(message =>
    message.type === 'world_state' && message.players.length === 8 &&
    message.players.some(other => other.playerId === players[7].playerId && Math.abs(other.x-TOWN_SPAWN.x-.7)<.0001));
  assert.equal(synchronized.players.length, 8);
  const persistDeadline = Date.now() + 5000;
  let savedPositions = [];
  do {
    savedPositions = await mongo.db(databaseName).collection('players').find({playerId:{$in:players.map(p=>p.playerId)}}).toArray();
    if (savedPositions.every(doc => Math.abs(doc.position?.x - (TOWN_SPAWN.x + players.findIndex(p=>p.playerId===doc.playerId)*.1)) < .0001)) break;
    await new Promise(resolve=>setTimeout(resolve,50));
  } while (Date.now() < persistDeadline);
  assert.equal(savedPositions.length,8);
  assert.ok(savedPositions.every(doc => Math.abs(doc.position?.x - (TOWN_SPAWN.x + players.findIndex(p=>p.playerId===doc.playerId)*.1)) < .0001), 'batched movement writes persist every player');


  players[7].socket.close();
  await players[0].waitFor(message => message.type === 'world_state' && message.players.length === 7);
  const health = await fetch(`http://127.0.0.1:${port}/health`).then(response => response.json());
  assert.equal(health.players, 7);
  players[6].socket.send(JSON.stringify({ type: 'account_delete', confirm: 'DELETE_ACCOUNT' }));
  await players[6].waitFor(message => message.type === 'google_auth_result' && message.status === 'deleted');
  await players[0].waitFor(message => message.type === 'world_state' && message.players.length === 6);
  assert.equal(await mongo.db(databaseName).collection('players').countDocuments({ playerId: players[6].playerId, deletedAt: { $exists: false } }), 0, 'private token store still authorizes owner account deletion');
  await mongo.db(databaseName).collection('players').updateOne({ playerId: players[5].playerId }, { $set: { googleSub: 'test-only-google-sub' } });
  players[5].socket.send(JSON.stringify({ type: 'google_logout' }));
  await players[5].waitFor(message => message.type === 'google_auth_result' && message.status === 'logged-out');
  const loggedOut = await mongo.db(databaseName).collection('players').findOne({ playerId: players[5].playerId });
  assert.equal(loggedOut.sessionTokenHash, undefined, 'private token store still supports session revocation');

  console.log(`PASS: 8 clients connected together (mixed full/delta protocol); 8-player presence without session credential disclosure; parallel movement ACK ${moveAckMs}ms; movement sync; disconnect leaves 7 clients.`);
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
