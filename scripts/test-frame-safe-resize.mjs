import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FrameSafeResize } from '../src/game/rendering/FrameSafeResize.js';
const canvas = { clientWidth: 832, clientHeight: 289, width: 1664, height: 578 };
let dpr = 2, scale = .5, buffer = 'game frame', clears = 0;
const engine = {
  getHardwareScalingLevel: () => scale,
  resize() { canvas.width = canvas.clientWidth / scale | 0; canvas.height = canvas.clientHeight / scale | 0; buffer = 'blank'; clears++; },
  setHardwareScalingLevel(value) { scale = value; this.resize(); },
};
const resize = new FrameSafeResize(engine, canvas, () => dpr);
assert.equal(resize.flush(), false, 'matching dimensions do not clear the canvas');
// Adaptive quality runs after scene.render. It must leave the presented frame intact.
dpr = 1.6; resize.request();
assert.equal(buffer, 'game frame'); assert.equal(clears, 0);
resize.flush(); buffer = 'game frame';
assert.equal(clears, 1, 'scale setter performs exactly one resize');
assert.equal(canvas.width, 1331);
// A burst of toolbar/rotation callbacks collapses to one change before drawing.
canvas.clientWidth = 390; canvas.clientHeight = 700;
for (let i = 0; i < 5; i++) resize.request();
assert.equal(buffer, 'game frame');
resize.flush(); buffer = 'portrait frame';
assert.equal(clears, 2);
resize.request(); assert.equal(resize.flush(), false); assert.equal(buffer, 'portrait frame');
canvas.clientWidth = 0; resize.request(); assert.equal(resize.flush(), false);
canvas.clientWidth = 832; canvas.clientHeight = 345; resize.flush(); buffer = 'landscape frame';
assert.equal(canvas.width, 1331); assert.equal(canvas.height, 552);
const source = readFileSync(new URL('../src/game/world/FarmWorld.js', import.meta.url), 'utf8');
assert.match(source, /this\.frameResize\.flush\(\);\s*this\.scene\.render\(\);/, 'resize is applied before drawing');
assert.equal((source.match(/setHardwareScalingLevel\(/g) || []).length, 1, 'only initial engine setup resizes directly');
console.log('PASS: adaptive quality and rotation preserve presented frames; resize batches before drawing');
