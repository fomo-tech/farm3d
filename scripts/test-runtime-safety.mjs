import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { WorldCollisionSystem } from '../src/game/physics/WorldCollisionSystem.js';

const collision = new WorldCollisionSystem();
assert.throws(() => collision.resolveMovement(0, 0, Infinity, 0), /không hợp lệ/);
assert.throws(() => collision.resolveMovement(0, 0, 1000000, 0), /vượt 8m/);
assert.ok(Number.isFinite(collision.resolveMovement(0, 18, .1, 0).x));

let now = 100000;
const timers = [];
const storage = new Map();
class TestDate extends Date {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return now; }
}
const context = {
  Date: TestDate, URLSearchParams, Error,
  performance: { now() { return now; } },
  location: { search: '', hostname: 'localhost', href: 'http://localhost/' },
  navigator: { onLine: true },
  document: { body: null, visibilityState: 'visible', addEventListener() {} },
  innerWidth: 1920, innerHeight: 1080, devicePixelRatio: 1,
  localStorage: { setItem(key, value) { storage.set(key, value); } },
  setInterval(callback) { timers.push(callback); }, setTimeout() {},
  window: { addEventListener() {} },
};
vm.runInNewContext(readFileSync(new URL('../public/mobile-debug.js', import.meta.url), 'utf8'), context);
const debug = context.window.__farmDebug;
debug.stage('farm detail: regression');
debug.snapshot({ fps: 10, meshes: 5000 });
debug.frame();
now += 9000;
timers[0]();
assert.ok(debug.getReport().entries.some(entry => entry.type === 'MAIN THREAD STALL'));
assert.ok(storage.has('farm.lastDiagnostic'));
now += 25000;
debug.frame();
assert.ok(debug.getReport().entries.some(entry => entry.type === 'FRAME GAP'));
assert.equal(debug.getReport().entries.find(entry => entry.type === 'FRAME GAP')?.type, 'FRAME GAP');
debug.snapshot({ x: 1, z: 2, fps: 60, movement: { input: true, speed: 0, collided: true } });
for (let i = 0; i < 15; i++) { now += 2000; debug.frame(); timers[0](); }
assert.ok(debug.getReport().entries.some(entry => entry.type === 'MOVEMENT BLOCKED'));
debug.stopFrames();
console.log('PASS: bounded collision, freeze watchdog, persisted reports and blocked-movement diagnostics');
