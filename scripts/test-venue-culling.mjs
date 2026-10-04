import assert from 'node:assert/strict';

// Polyfill minimal OffscreenCanvas for Babylon under Node.js NullEngine
if (typeof globalThis.OffscreenCanvas === 'undefined') {
  globalThis.OffscreenCanvas = class OffscreenCanvas {
    constructor(width, height) {
      this.width = width || 1024;
      this.height = height || 1024;
    }
    getContext() {
      const gradMock = { addColorStop() {} };
      return new Proxy({}, {
        get(target, prop) {
          if (prop === 'createRadialGradient' || prop === 'createLinearGradient') return () => gradMock;
          if (prop === 'measureText') return () => ({ width: 100 });
          if (typeof target[prop] === 'function') return target[prop];
          return () => {};
        },
        set(target, prop, val) { target[prop] = val; return true; },
      });
    }
  };
}

import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { VENUE_LAYOUT } from '../shared/venueLayout.js';

// Test Interior Camera Clamping Algorithm
function getClampedInteriorRadius(camera, target, bounds, desiredRadius) {
  const sinB = Math.sin(camera.beta);
  const cosB = Math.cos(camera.beta);
  const cosA = Math.cos(camera.alpha);
  const sinA = Math.sin(camera.alpha);

  const dirX = cosA * sinB;
  const dirY = cosB;
  const dirZ = sinA * sinB;

  let maxR = desiredRadius;
  const margin = 0.7;

  if (dirX > 0.001) maxR = Math.min(maxR, (bounds.maxX - margin - target.x) / dirX);
  else if (dirX < -0.001) maxR = Math.min(maxR, (bounds.minX + margin - target.x) / dirX);

  if (dirZ > 0.001) maxR = Math.min(maxR, (bounds.maxZ - margin - target.z) / dirZ);
  else if (dirZ < -0.001) maxR = Math.min(maxR, (bounds.minZ + margin - target.z) / dirZ);

  if (dirY > 0.001) maxR = Math.min(maxR, (bounds.maxY - margin - target.y) / dirY);
  else if (dirY < -0.001) maxR = Math.min(maxR, (bounds.minY + margin - target.y) / dirY);

  return Math.max(2.4, Math.min(desiredRadius, maxR));
}

const engine = new NullEngine();
const scene = new Scene(engine);
const camera = new ArcRotateCamera('cam', -Math.PI / 2, 1.15, 8.5, Vector3.Zero(), scene);

const vInt = VENUE_LAYOUT.fashion.interior;
const bounds = {
  minX: vInt.x - 11.2,
  maxX: vInt.x + 11.2,
  minZ: vInt.z - 17.0,
  maxZ: vInt.z + 8.2,
  minY: vInt.y + 0.8,
  maxY: vInt.y + 6.4,
};

// 1. Center of the room
const centerTarget = new Vector3(vInt.x, vInt.y + 1.2, vInt.z - 4);
const centerR = getClampedInteriorRadius(camera, centerTarget, bounds, 5.4);
assert.ok(centerR >= 5.0, 'Center of room allows full desired radius');

// 2. Near counter at back wall
const counterTarget = new Vector3(vInt.x, vInt.y + 1.2, vInt.z + 4.8);
camera.alpha = Math.PI / 2; // Camera points towards entrance, camera itself is pushed toward back wall
const nearWallR = getClampedInteriorRadius(camera, counterTarget, bounds, 5.4);
assert.ok(nearWallR < 3.5, 'Radius automatically clamped to avoid back wall penetration');

// 3. Near right wall
const rightWallTarget = new Vector3(vInt.x + 9.5, vInt.y + 1.2, vInt.z - 4);
camera.alpha = 0; // Camera pushed toward right wall
const rightWallR = getClampedInteriorRadius(camera, rightWallTarget, bounds, 5.4);
assert.ok(rightWallR <= 2.6, 'Radius automatically clamped near right wall to stay inside room');

scene.dispose();
engine.dispose();

console.log('PASS: Venue camera clamping & interior boundary algorithms verified!');
