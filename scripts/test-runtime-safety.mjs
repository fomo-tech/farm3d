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
const performanceObservers = new Map();
const documentListeners = new Map();
class TestPerformanceObserver {
  static supportedEntryTypes = ['longtask', 'long-animation-frame'];
  constructor(callback) { this.callback = callback; }
  observe({ type }) { performanceObservers.set(type, this.callback); }
}
class TestDate extends Date {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return now; }
}
const context = {
  Date: TestDate, URLSearchParams, Error, PerformanceObserver: TestPerformanceObserver,
  performance: { now() { return now; } },
  location: { search: '', hostname: 'localhost', href: 'http://localhost/' },
  navigator: { onLine: true },
  document: { body: null, visibilityState: 'visible', hasFocus() { return true; },
    addEventListener(name, handler) { documentListeners.set(name, handler); } },
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
debug.measure('slow network callback', () => { now += 1200; });
performanceObservers.get('longtask')({ getEntries: () => [{ startTime: now - 1200, duration: 1200 }] });
assert.ok(debug.getReport().entries.some(entry => entry.type === 'LONG MAIN THREAD TASK' && /slow network callback/.test(entry.message)));
performanceObservers.get('long-animation-frame')({ getEntries: () => [{ startTime: now, duration: 1300,
  scripts: [{ duration: 1200, invoker: 'timer', sourceURL: '/src/example.js',
    sourceFunctionName: 'expensiveCallback', sourceCharPosition: 42, forcedStyleAndLayoutDuration: 0 }] }] });
assert.equal(debug.getReport().animationFrames[0].scripts[0].sourceFunctionName, 'expensiveCallback');
assert.ok(debug.getReport().entries.some(entry => entry.type === 'SLOW FRAME SOURCE'));
const gapsBeforeBackground = debug.getReport().metrics.frameGapsOver1000;
context.document.visibilityState = 'hidden';
documentListeners.get('visibilitychange')();
now += 130000;
context.document.visibilityState = 'visible';
documentListeners.get('visibilitychange')();
debug.frame();
assert.equal(debug.getReport().metrics.frameGapsOver1000, gapsBeforeBackground,
  'Intentional background pause must not become a foreground freeze');
documentListeners.get('webglcontextlost')();
assert.match(debug.getReport().system, /"webglContextLost":true/);
documentListeners.get('webglcontextrestored')();
assert.match(debug.getReport().system, /"webglContextLost":false/);
debug.stopFrames();
console.log('PASS: bounded collision, freeze watchdog, persisted reports and blocked-movement diagnostics');
