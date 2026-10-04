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
assert.ok(scene.fogEnd <= 160, 'loading keeps a bounded horizon');
assert.ok(camera.maxZ <= 200, 'far clip must hide distant geometry');

stats = { pendingNear: 0, loading: false };
for (let i = 0; i < 80; i++) controller.update(0.1);
assert.equal(controller.getState().mode, 'clear');
assert.ok(scene.fogEnd > 170 && scene.fogEnd <= 180, 'clear mode opens the desktop horizon');

fps = 10;
for (let i = 0; i < 5; i++) controller.update(0.1);
assert.equal(controller.getState().mode, 'clear', 'a short stall must not pump the fog');

fps = 15;
for (let i = 0; i < 150; i++) controller.update(0.1);
assert.equal(controller.getState().mode, 'performance');
assert.ok(scene.fogEnd < 155, 'sustained pressure reduces the rendered horizon');
const mobileScene = {};
const mobile = new FogStreamingController(mobileScene, { maxZ: 500 }, { mobile: true });
for (let i = 0; i < 200; i++) mobile.update(.1);
assert.ok(mobileScene.fogEnd > 144 && mobileScene.fogEnd <= 145);
console.log('PASS: streaming fog closes, opens and reacts to FPS pressure');
