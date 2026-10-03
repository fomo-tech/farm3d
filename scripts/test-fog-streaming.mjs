import assert from 'node:assert/strict';
import { FogStreamingController } from '../src/game/world/FogStreamingController.js';

const scene = { fogStart: 350, fogEnd: 1750 };
const camera = { maxZ: 3500 };
let stats = { pendingNear: 3, loading: true };
let fps = 60;
const controller = new FogStreamingController(scene, camera, {
  getStreamingStats: () => stats,
  getFps: () => fps,
});

for (let i = 0; i < 30; i++) controller.update(0.1);
assert.equal(controller.getState().mode, 'streaming');
assert.ok(scene.fogEnd < 370, 'fog must close while nearby chunks load');
assert.ok(camera.maxZ < 530, 'far clip must hide unloaded geometry');

stats = { pendingNear: 0, loading: false };
for (let i = 0; i < 80; i++) controller.update(0.1);
assert.equal(controller.getState().mode, 'clear');
assert.ok(scene.fogEnd > 600, 'view must open after streaming finishes');

fps = 15;
for (let i = 0; i < 30; i++) controller.update(0.1);
assert.equal(controller.getState().mode, 'performance');
assert.ok(scene.fogEnd < 300, 'low FPS must reduce the rendered horizon');
console.log('PASS: streaming fog closes, opens and reacts to FPS pressure');
