import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const properties = new Map(), classes = new Set(), events = new Map(), viewportEvents = new Map();
let viewportContent;
const viewportMeta = { setAttribute: (name, value) => { viewportContent = value; } };
let frame;
const timers = new Map(); let timerId = 0;
const viewport = { width: 844, height: 290, offsetLeft: 0, offsetTop: 0, scale: 1,
  addEventListener: (type, callback) => viewportEvents.set(type, callback) };
const root = { style: { setProperty: (name, value) => properties.set(name, value) }, classList: {
  add: (...values) => values.forEach(value => classes.add(value)),
  remove: (...values) => values.forEach(value => classes.delete(value)),
  toggle: (value, enabled) => enabled ? classes.add(value) : classes.delete(value),
} };
const context = { clearTimeout: id => timers.delete(id), setTimeout: callback => { timers.set(++timerId, callback); return timerId; }, navigator: { userAgent: 'iPhone CriOS', maxTouchPoints: 5 },
  screen: { width: 390, height: 844 }, matchMedia: query => ({ matches: query === '(pointer: coarse)' }),
  document: { documentElement: root, getElementById: () => null, querySelector: selector => selector === 'meta[name="viewport"]' ? viewportMeta : null,
    addEventListener: () => {} }, requestAnimationFrame: callback => { frame = callback; return 1; },
  addEventListener: (type, callback) => events.set(type, callback) };
context.window = { screen: context.screen, innerWidth: 844, innerHeight: 290, visualViewport: viewport };
vm.runInNewContext(readFileSync(new URL('../public/orientation.js', import.meta.url), 'utf8'), context);
assert.equal(properties.get('--game-viewport-width'), '844px');
assert.equal(properties.get('--game-viewport-height'), '290px');
assert.ok(classes.has('mobile-landscape'));
assert.ok(classes.has('chrome-ios-contained'));
assert.match(viewportContent, /viewport-fit=contain/);
context.window.innerHeight = 350; viewport.height = 350; viewportEvents.get('resize')(); frame();
assert.equal(properties.get('--game-viewport-height'), '350px', 'toolbar collapse updates the visible height');
viewport.offsetTop = 12; viewportEvents.get('scroll')(); frame();
assert.equal(properties.size, 2, 'viewport offsets must not be applied twice');
assert.equal(properties.get('--game-viewport-height'), '350px');
viewport.scale = 2; viewport.height = 175; viewportEvents.get('resize')(); frame();
assert.equal(properties.get('--game-viewport-height'), '350px', 'pinch zoom does not resize the game');
context.window.innerWidth = 390; context.window.innerHeight = 700; viewport.scale = 1; viewport.width = 390; viewport.height = 700; events.get('orientationchange')(); frame();
assert.ok(classes.has('mobile-portrait'));
assert.equal(properties.get('--game-viewport-width'), '390px');
assert.equal(properties.get('--game-viewport-height'), '700px');
context.window.innerWidth = 844; context.window.innerHeight = 290; viewport.width = 844; viewport.height = 290; events.get('orientationchange')(); frame();
assert.ok(classes.has('mobile-landscape'));
assert.equal(properties.get('--game-viewport-width'), '844px');
assert.equal(properties.get('--game-viewport-height'), '290px');
context.window.innerHeight = 345; viewport.height = 345; viewportEvents.get('resize')(); frame();
assert.equal(properties.get('--game-viewport-height'), '345px', 'late iOS rotation dimensions replace the transient size');
viewport.width = 390; viewport.height = 700; events.get('orientationchange')(); frame();
assert.equal(properties.get('--game-viewport-width'), '844px', 'stale portrait visual viewport cannot override settled landscape layout');
assert.equal(properties.get('--game-viewport-height'), '345px');
context.window.innerWidth = 390; context.window.innerHeight = 700; events.get('orientationchange')(); frame();
context.window.innerWidth = 844; context.window.innerHeight = 345;
for (const callback of [...timers.values()]) { callback(); frame(); }
assert.equal(properties.get('--game-viewport-width'), '844px', 'settling timers recover rotation without another resize event');
assert.ok(classes.has('mobile-landscape'));
console.log('PASS: iPhone toolbar, visible viewport offsets, rotation and pinch zoom');

// Landscape Chrome's content rectangle can be narrower than both published viewports.
root.clientWidth = 760;
context.window.innerWidth = 844; context.window.innerHeight = 345;
viewport.width = 844; viewport.height = 345;
events.get('orientationchange')(); frame();
assert.equal(properties.get('--game-viewport-width'), '760px', 'Chrome native side controls cannot clip the HUD');
root.clientWidth = 390;
events.get('orientationchange')(); frame();
assert.equal(properties.get('--game-viewport-width'), '844px', 'ignore stale portrait document width while rotating');
root.clientWidth = 844;
viewport.width = 797; viewportEvents.get('resize')(); frame();
assert.equal(properties.get('--game-viewport-width'), '797px', 'respect the narrower visual viewport');
root.clientWidth = undefined;

classes.clear(); viewportContent = undefined;
context.navigator.standalone = true; viewport.height = 650; context.window.innerWidth = 390; context.window.innerHeight = 844; viewport.width = 390;
vm.runInNewContext(readFileSync(new URL('../public/orientation.js', import.meta.url), 'utf8'), context);
assert.equal(properties.get('--game-viewport-height'), '844px', 'standalone canvas fills layout viewport including home indicator');
assert.ok(!classes.has('chrome-ios-contained'), 'installed PWA keeps cover even with a Chrome user agent');
assert.equal(viewportContent, undefined);
console.log('PASS: PWA uses the full layout viewport');

classes.clear(); context.navigator.standalone = false; context.navigator.userAgent = 'iPhone Version/18 Safari';
root.clientWidth = 760; context.window.innerWidth = 844; context.window.innerHeight = 345; viewport.width = 844; viewport.height = 345;
vm.runInNewContext(readFileSync(new URL('../public/orientation.js', import.meta.url), 'utf8'), context);
assert.equal(properties.get('--game-viewport-width'), '844px', 'Safari retains its edge-to-edge viewport');
assert.ok(!classes.has('chrome-ios-contained'));
console.log('PASS: Chrome contained width, stale rotation metrics and Safari isolation');
