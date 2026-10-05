import assert from 'node:assert/strict';
import { GameClient } from '../src/game/network/GameClient.js';
let tick;
let now = 1000;
const originalNow = Date.now;
Date.now = () => now;
globalThis.window = { location: { protocol: 'http:', hostname: 'localhost' }, setInterval(fn) { tick = fn; return 1; }, clearInterval() {}, clearTimeout() {} };
globalThis.document = { visibilityState: 'visible' };
let closes = 0, probes = 0;
const client = new GameClient();
client.socket = { close() { closes++; } };
client.sendNow = () => { probes++; };
client.lastPongAt = now;
try {
  client.startHeartbeat();
  document.visibilityState = 'hidden';
  now += 120000; tick();
  assert.equal(closes, 0, 'Hidden idle tabs must not be disconnected');
  document.visibilityState = 'visible';
  client.handleVisibility();
  now += 10000; tick();
  assert.equal(closes, 0, 'Resume gets a fresh pong window');
  now += 180000; tick();
  assert.equal(closes, 0, 'Suspended timers do not imply a broken socket');
  for (let i = 0; i < 3; i++) { now += 10000; tick(); }
  assert.equal(closes, 1, 'A genuinely unresponsive foreground socket still reconnects');
  assert.ok(probes > 0);
  let disconnected = 0;
  client.disconnect = () => { disconnected++; };
  client.handlePageHide({ persisted: true });
  assert.equal(disconnected, 0);
  client.handlePageHide({ persisted: false });
  assert.equal(disconnected, 1);
} finally { Date.now = originalNow; }
console.log('PASS: idle/background/sleep resume, dead socket detection and page exit');
