import { applyWorldDelta } from '../shared/worldDelta.js';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { monitorEventLoopDelay, performance } from 'node:perf_hooks';
import { MongoClient } from 'mongodb';
import { WebSocket } from 'ws';

const lan = process.argv.includes('--lan');
const args = process.argv.slice(2).filter(arg => arg !== '--lan');
if (args.includes('--help')) {
  console.log('npm run test:load -- --bots 500 --duration 900 --ramp 60 --port 18787 --hz 10 [--lan]\nStarts an isolated loopback server and temporary local MongoDB database. Duration is the hold time AFTER ramp-up. Ctrl+C writes a partial report and cleans up.');
  process.exit(0);
}
const options = { bots: 500, duration: 900, ramp: 60, port: 18787, hz: 10 };
for (let i = 0; i < args.length; i += 2) {
  const key = args[i]?.replace(/^--/, '');
  if (!Object.hasOwn(options, key) || args[i + 1] === undefined) throw new Error(`Unknown or incomplete option: ${args[i]}`);
  options[key] = Number(args[i + 1]);
}
for (const [key, value] of Object.entries(options)) {
  if (!Number.isFinite(value) || value <= 0 || (['bots', 'port', 'hz'].includes(key) && !Number.isInteger(value))) throw new Error(`Invalid --${key}`);
}
if (options.bots > 2000 || options.hz > 30 || options.port > 65535) throw new Error('Limits: bots <= 2000, hz <= 30, port <= 65535');
// Deliberately ignore MONGODB_URI from .env: load tests must not write to a remote database.
const mongo = new MongoClient('mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 5000 });
const databaseName = `farm_load_test_${randomUUID().replaceAll('-', '')}`;
const url = `ws://127.0.0.1:${options.port}`;
const bots = [];
const timers = [];
const histogram = () => ({ buckets: new Uint32Array(60001), count: 0, max: 0, sum: 0 });
const joins = histogram(), moves = histogram(), pings = histogram();
function record(h, ms) { h.buckets[Math.min(60000, Math.floor(ms))]++; h.count++; h.max = Math.max(h.max, ms); h.sum += ms; }
function summary(h) {
  const percentile = p => { let n = 0; for (let i = 0; i < h.buckets.length; i++) { n += h.buckets[i]; if (n >= Math.ceil(h.count * p)) return h.count ? i : null; } };
  return { count: h.count, meanMs: h.count ? Math.round(h.sum / h.count) : null, p95Ms: percentile(.95), p99Ms: percentile(.99), maxMs: Math.round(h.max) };
}
const metrics = { joined: 0, peakOnline: 0, unexpectedDisconnects: 0, errors: 0, rejectedMoves: 0, moveTimeouts: 0, pingTimeouts: 0, backpressureSkips: 0, sentMoves: 0, receivedBytes: 0, worldStates: 0 };
const errorSamples = [];
const samples = [];
const probeWorld = new Map();
let child, interrupted = false, shuttingDown = false, completed = false, databaseReady = false;
const started = Date.now();
const loop = monitorEventLoopDelay({ resolution: 20 }); loop.enable();
const stop = () => { interrupted = true; };
process.on('SIGINT', stop); process.on('SIGTERM', stop);
function error(message) { metrics.errors++; if (errorSamples.length < 10) errorSamples.push(String(message)); }
function connect(index) {
  return new Promise(resolveJoin => {
    const begin = performance.now();
    const socket = new WebSocket(url);
    const bot = { socket, online: false, x: 0, y: 0, z: 0, phase: index, pendingMove: null, pendingPing: null, lastWorld: 0 };
    bots.push(bot);
    let settled = false;
    const finish = () => { if (!settled) { settled = true; clearTimeout(timeout); resolveJoin(); } };
    const timeout = setTimeout(() => { error(`Bot ${index}: join timeout`); socket.terminate(); finish(); }, 30000);
    socket.on('open', () => socket.send(JSON.stringify({ type: 'join', worldDelta: 1, presenceLimit: 48, playerId: `player_load_${randomUUID()}`, name: `Load ${index}` })));
    socket.on('error', e => { error(e.message); finish(); });
    socket.on('close', () => { if (bot.online && !shuttingDown) metrics.unexpectedDisconnects++; bot.online = false; finish(); });
    socket.on('message', raw => {
      metrics.receivedBytes += raw.length;
      let message; try { message = JSON.parse(String(raw)); } catch { error('Invalid JSON'); return; }
      if (message.type === 'welcome') {
        bot.online = true; bot.lastWorld = Date.now(); Object.assign(bot, message.spawn); metrics.joined++; record(joins, performance.now() - begin); finish();
      } else if (message.type === 'auth_error') { error(message.message); socket.close(); }
      else if ((message.type === 'world_state' || message.type === 'world_delta')) { metrics.worldStates++; bot.lastWorld = Date.now(); if (index === 0) { if (message.type === 'world_delta') applyWorldDelta(probeWorld, message); else { probeWorld.clear(); for (const player of message.players) probeWorld.set(player.playerId, player); } } }
      else if (message.type === 'move_ack' && bot.pendingMove !== null) {
        record(moves, performance.now() - bot.pendingMove); bot.pendingMove = null;
        if (!message.accepted) metrics.rejectedMoves++;
        bot.x = message.x; bot.y = message.y; bot.z = message.z;
      } else if (message.type === 'pong' && message.sentAt === bot.pendingPing) {
        record(pings, Date.now() - message.sentAt); bot.pendingPing = null;
      }
    });
  });
}
try {
  await mongo.connect(); databaseReady = true;
  child = spawn(process.execPath, ['server/index.js'], {
    env: { ...process.env, MONGODB_URI: 'mongodb://127.0.0.1:27017', MONGODB_DB: databaseName, MULTIPLAYER_PORT: String(options.port), LOCAL_LOAD_TEST: '1', LOCAL_LOAD_TEST_LAN: lan ? '1' : '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stderr.on('data', data => { process.stderr.write(data); });
  await new Promise((resolveReady, reject) => {
    const timer = setTimeout(() => reject(new Error('Server startup timeout')), 30000);
    child.once('error', e => { clearTimeout(timer); reject(e); });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited: ${code}`)); });
    child.stdout.on('data', data => { if (String(data).includes('MongoDB connected')) { clearTimeout(timer); resolveReady(); } });
  });
  console.log(`Local load test: ${options.bots} bots, ramp ${options.ramp}s, hold ${options.duration}s, ${options.hz} moves/s/bot\nServer: ${url}\nTemporary DB: ${databaseName}\nTo view in game: VITE_MULTIPLAYER_URL=${url} npm run dev:client`);
  timers.push(setInterval(() => {
    for (const bot of bots) {
      if (!bot.online || bot.socket.readyState !== WebSocket.OPEN) continue;
      if (bot.socket.bufferedAmount > 65536) { metrics.backpressureSkips++; continue; }
      if (bot.pendingMove !== null) {
        if (performance.now() - bot.pendingMove > 10000) { metrics.moveTimeouts++; bot.socket.terminate(); }
        continue;
      }
      bot.phase += .08;
      bot.pendingMove = performance.now(); metrics.sentMoves++;
      bot.socket.send(JSON.stringify({ type: 'move', x: bot.x + Math.sin(bot.phase) * .15, y: bot.y, z: bot.z, rotation: bot.phase, venue: null }));
    }
  }, 1000 / options.hz));
  timers.push(setInterval(() => {
    for (const bot of bots) if (bot.online && bot.socket.readyState === WebSocket.OPEN) {
      if (bot.pendingPing !== null) { if (Date.now() - bot.pendingPing > 10000) { metrics.pingTimeouts++; bot.socket.terminate(); } continue; }
      bot.pendingPing = Date.now(); bot.socket.send(JSON.stringify({ type: 'ping', sentAt: bot.pendingPing }));
    }
  }, 1000));
  timers.push(setInterval(() => {
    const online = bots.filter(b => b.online).length;
    metrics.peakOnline = Math.max(metrics.peakOnline, online);
    const sample = { elapsedSeconds: Math.round((Date.now() - started) / 1000), online, staleWorld: bots.filter(b => b.online && Date.now() - b.lastWorld > 5000).length, moveP95Ms: summary(moves).p95Ms, generatorRssMB: Math.round(process.memoryUsage().rss / 1048576) };
    samples.push(sample); console.log(JSON.stringify(sample));
  }, 5000));
  const rampStart = performance.now(), pending = [];
  for (let i = 0; i < options.bots && !interrupted; i++) {
    if (child.exitCode !== null) throw new Error('Server stopped during ramp');
    pending.push(connect(i));
    const next = rampStart + (i + 1) * options.ramp * 1000 / options.bots;
    while (!interrupted && performance.now() < next) await delay(Math.max(1, Math.min(next - performance.now(), 250)));
  }
  await Promise.all(pending);
  const onlineAtHold = bots.filter(b => b.online).length;
  metrics.peakOnline = Math.max(metrics.peakOnline, onlineAtHold);
  console.log(`Hold phase: ${onlineAtHold}/${options.bots} bots online`);
  const end = Date.now() + options.duration * 1000;
  while (Date.now() < end && !interrupted) {
    if (child.exitCode !== null) throw new Error('Server stopped during hold');
    await delay(Math.min(250, end - Date.now()));
  }
  completed = !interrupted;
} catch (e) { error(e.message); console.error(e.message); }
finally {
  shuttingDown = true; timers.forEach(clearInterval); loop.disable();
  const online = bots.filter(b => b.online).length;
  const staleWorld = bots.filter(b => b.online && Date.now() - b.lastWorld > 5000).length;
  metrics.peakOnline = Math.max(metrics.peakOnline, online);
  const pass = completed && metrics.joined === options.bots && online === options.bots && !staleWorld && !metrics.errors && !metrics.unexpectedDisconnects && !metrics.moveTimeouts && !metrics.pingTimeouts && !metrics.rejectedMoves && moves.count > 0 && pings.count > 0 && probeWorld.size >= Math.min(options.bots, 48);
  const report = { pass, completed, interrupted, options, lan, elapsedSeconds: (Date.now() - started) / 1000, onlineAtEnd: online, probeVisiblePlayers: probeWorld.size, staleWorldAtEnd: staleWorld, metrics, joinLatency: summary(joins), moveLatency: summary(moves), pingLatency: summary(pings), generatorEventLoopP99Ms: Math.round(loop.percentile(99) / 1e6), errorSamples, samples, scope: '48 nearby players per connection, matching game clients. Local backend connections, movement and presence in town. No browser rendering, gameplay actions or reconnect simulation. Latencies are from this shared machine; histogram percentiles capped at 60000ms.' };
  bots.forEach(b => b.socket.terminate());
  if (child && child.exitCode === null && child.signalCode === null) {
    await new Promise(resolveExit => {
      const killTimer = setTimeout(() => child.kill('SIGKILL'), 5000);
      child.once('exit', () => { clearTimeout(killTimer); resolveExit(); }); child.kill('SIGTERM');
    });
  }
  if (databaseReady) {
    try { await mongo.db(databaseName).dropDatabase(); } catch (e) { report.cleanupError = e.message; }
  }
  await mongo.close();
  const directory = resolve('artifacts/load-tests'); await mkdir(directory, { recursive: true });
  const path = resolve(directory, `${new Date().toISOString().replaceAll(':', '-')}.json`);
  await writeFile(path, JSON.stringify(report, null, 2));
  console.log(`${pass ? 'PASS' : 'INCOMPLETE/FAIL'} · online ${online}/${options.bots} · move p95 ${report.moveLatency.p95Ms}ms · ping p95 ${report.pingLatency.p95Ms}ms\nReport: ${path}`);
  process.exitCode = pass && !report.cleanupError ? 0 : 1;
}
