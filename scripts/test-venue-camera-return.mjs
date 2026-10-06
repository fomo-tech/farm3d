import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const { FarmWorld } = await vite.ssrLoadModule('/src/game/world/FarmWorld.js');

const engine = new NullEngine();
const scene = new Scene(engine);
const camera = new ArcRotateCamera('camera', 0.7, 1.04, 19, Vector3.Zero(), scene);
const world = {
  scene, camera, casinoRoom: null, remotePlayers: new Map(),
  currentVenueMeshes: null, venueMeshesMap: new Map([['fashion', []]]),
  setCasinoRoom() {}, setOutdoorWorldEnabled() {},
};
const before = { alpha: camera.alpha, beta: camera.beta, radius: camera.radius };
FarmWorld.prototype.setVenueView.call(world, 'fashion');
assert.equal(camera.alpha, before.alpha, 'entering a shop must not rotate the camera');
assert.equal(camera.beta, before.beta, 'entering a shop must not change its tilt');
assert.equal(camera.radius, before.radius, 'entry does not force a close-up');
camera.radius = 4; // The room's wall clamp can shorten it while inside.
FarmWorld.prototype.setVenueView.call(world, null);
assert.equal(camera.alpha, before.alpha);
assert.equal(camera.beta, before.beta);
assert.equal(camera.radius, before.radius, "leaving restores the player's outdoor distance");
assert.equal(world.outdoorCameraView, null);
scene.dispose();
engine.dispose();
await vite.close();
console.log('PASS: shop entry preserves camera angle; exit restores the outdoor view.');
