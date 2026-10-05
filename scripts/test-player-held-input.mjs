import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { createPlayer } from '../src/game/player/createPlayer.js';
import { cameraMovementBasis } from '../src/game/player/cameraMovementBasis.js';
import { WorldCollisionSystem } from '../src/game/physics/WorldCollisionSystem.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';

class MockElement { closest() { return null; } }
globalThis.Element = MockElement;
const listeners = new Map();
const listenerOptions = new Map();
globalThis.window = {
  addEventListener: (name, callback, options) => { listeners.set(name, callback); listenerOptions.set(name, options); },
  removeEventListener: name => listeners.delete(name),
};
// Drawing is stubbed only; the real player movement and animation run below.
const context = new Proxy({}, { get: (target, key) => target[key] ?? (key.startsWith('create') ? () => ({ addColorStop() {} }) : () => {}), set: (target, key, value) => { target[key] = value; return true; } });
globalThis.document = { hidden: false, addEventListener() {}, removeEventListener() {}, createElement: () => ({ width: 1024, height: 1024, getContext: () => context }) };
const engine = new NullEngine();
const scene = new Scene(engine);
// Check screen directions with Babylon's actual view matrix, not assumed
// world-X signs (which reverse when the camera rotates to the other side).
const camera = new ArcRotateCamera('movement-test', 0, 1, 20, Vector3.Zero(), scene);
for (const alpha of [-Math.PI / 2, 0, Math.PI / 2, Math.PI, 2.3]) {
  for (const beta of [0.15, 0.76, 1.35]) {
    camera.alpha = alpha;
    camera.beta = beta;
    const view = camera.getViewMatrix(true);
    const origin = Vector3.TransformCoordinates(Vector3.Zero(), view);
    const basis = cameraMovementBasis(alpha);
    const screenD = Vector3.TransformCoordinates(basis.right, view);
    const screenA = Vector3.TransformCoordinates(basis.right.scale(-1), view);
    assert.ok(screenD.x > origin.x, `D must move screen-right: alpha=${alpha}, beta=${beta}`);
    assert.ok(screenA.x < origin.x, `A must move screen-left: alpha=${alpha}, beta=${beta}`);
  }
}
let collision;
const player = createPlayer(scene, null, { x: 0, z: 0 }, {
  getSpeed: () => 7,
  getCameraBasis: () => cameraMovementBasis(Math.PI / 2),
  resolveMovement: (x, z, dx, dz) => collision?.resolveMovement(x, z, dx, dz) || { x: x + dx, z: z + dz },
});
const press = (code, repeat = false) => listeners.get('keydown')({ code, repeat, target: null, preventDefault() {} });
const release = code => listeners.get('keyup')({ code });
assert.equal(listenerOptions.get('keydown'), true, 'movement receives keys before bubbling HUD handlers');
assert.equal(listenerOptions.get('keyup'), true, 'release cannot be swallowed by a HUD handler');
player.root.position.set(0, 0, 0);
let prevented = false;
listeners.get('keydown')({ code: 'KeyW', target: new MockElement(), preventDefault() { prevented = true; } });
player.update(1 / 60);
assert.ok(player.root.position.z < 0, 'first keydown moves immediately without clicks or repeat');
assert.equal(prevented, true);
release('KeyW');
for (const selector of ['input', '[role="dialog"]']) {
  const target = new MockElement();
  target.closest = query => query.includes(selector) ? target : null;
  const before = player.root.position.clone();
  listeners.get('keydown')({ code: 'KeyW', target, preventDefault() {} });
  player.update(1 / 60);
  assert.equal(player.root.position.z, before.z, `${selector} must retain keyboard control`);
}
for (const [key, axis, sign] of [['KeyW', 'z', -1], ['KeyS', 'z', 1], ['KeyA', 'x', 1], ['KeyD', 'x', -1]]) {
  player.root.position.set(0, 0, 0);
  press(key);
  for (let frame = 0; frame < 240; frame++) {
    const before = player.root.position[axis];
    if (frame === 60) player.stop();
    if (frame === 120) player.moveTo({ x: 100, z: 100 });
    player.update(1 / 60);
    assert.ok((player.root.position[axis] - before) * sign > 0, `${key} stalled at frame ${frame}`);
  }
  assert.ok(Math.abs(Math.abs(player.root.position[axis]) - 28) < 1e-6);
  release(key);
  const before = player.root.position.clone();
  player.update(1 / 60);
  assert.equal(player.root.position.x, before.x);
  assert.equal(player.root.position.z, before.z);
}
press('KeyW'); press('KeyD');
player.update(1 / 60);
assert.ok(Math.abs(player.getDiagnostics().speed - 7) < 1e-6, 'diagonal speed stays normalized');
listeners.get('blur')();
player.update(1 / 60);
assert.equal(player.getDiagnostics().input, false, 'blur clears held input');
collision = new WorldCollisionSystem();
player.root.position.set(0, 0, 35);
press('KeyS');
for (let frame = 0; frame < 120; frame++) {
  const before = player.root.position.z;
  player.update(frame % 2 ? 1 / 30 : 1 / 60);
  assert.ok(player.root.position.z > before, `road movement stalled at frame ${frame}`);
  assert.equal(player.getDiagnostics().collided, false);
}
release('KeyS');
collision = null;
for (const vehicle of ['bike', 'scooter', 'tractor', 'skateboard', 'kart', 'convertible', 'hoverboard']) {
  player.root.position.set(0, 0, 0);
  player.setVehicle(vehicle);
  press('KeyW');
  for (let frame = 0; frame < 120; frame++) {
    const before = player.root.position.z;
    player.setVehicle(vehicle); // Account snapshots must not reset acceleration.
    player.update(1 / 60);
    assert.ok(player.root.position.z < before, `${vehicle} stalled at frame ${frame}`);
  }
  release('KeyW');
  const position = player.root.position.clone();
  player.update(1 / 60);
  assert.equal(player.root.position.z, position.z, 'release stops vehicle, no unwanted drift');
  player.setVehicle('walk');
  player.update(1 / 60);
  assert.equal(player.human.torsoNode.position.z, 0, 'dismount restores walking pose');
}
player.dispose(); scene.dispose(); engine.dispose();
console.log('PASS: WASD held 240 frames each, correct directions, stop/autowalk priority, release, diagonal and blur');
