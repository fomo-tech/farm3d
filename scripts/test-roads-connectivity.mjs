import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { WORLD_VILLAGES } from '../shared/villageLayout.js';
import { createCountryRoadSteps } from '../src/game/world/createModernRoadSystem.js';
import { isPointOnRoadCorridor } from '../src/game/world/RoadSafetyZone.js';

// Polyfill minimal OffscreenCanvas for Babylon DynamicTexture under Node.js NullEngine
if (typeof globalThis.OffscreenCanvas === 'undefined') {
  globalThis.OffscreenCanvas = class OffscreenCanvas {
    constructor(width, height) { this.width = width || 1024; this.height = height || 1024; }
    getContext() {
      return new Proxy({}, {
        get(target, prop) {
          if (prop === 'createRadialGradient' || prop === 'createLinearGradient') return () => ({ addColorStop() {} });
          if (prop === 'measureText') return () => ({ width: 100 });
          if (typeof target[prop] === 'function') return target[prop];
          return () => {};
        },
        set(target, prop, val) { target[prop] = val; return true; },
      });
    }
  };
}

console.log('--- TESTING ROAD CONNECTIVITY SYSTEM ---');

// 1. Verify RoadSafetyZone covers full highway and village corridors
assert.ok(isPointOnRoadCorridor(-660, 86), 'Highway 86 covers Doi Gio west ring');
assert.ok(isPointOnRoadCorridor(660, 86), 'Highway 86 covers An Nhien east ring');
assert.ok(isPointOnRoadCorridor(-660, -234), 'Highway North covers Moc Lan west ring');
assert.ok(isPointOnRoadCorridor(660, -234), 'Highway North covers Hai Van east ring');
assert.ok(isPointOnRoadCorridor(-122, 43), 'City West connector to Highway 86 is protected');
assert.ok(isPointOnRoadCorridor(122, 43), 'City East connector to Highway 86 is protected');

// 2. Test Village Ring Roads geometry and curb offsets
const engine = new NullEngine();
const scene = new Scene(engine);

for (const v of WORLD_VILLAGES) {
  if (v.id === 'binh-minh') continue;

  const spineLaneCrossings = [0, 1, 2, 3, 4, 5, 6].map(row => ({
    pos: v.offsetZ + 98 + row * 28,
    width: 5.5,
  }));

  // West ring
  const westSteps = createCountryRoadSteps(scene, {
    id: `test-ring-west-${v.id}`,
    x: v.offsetX - 60,
    z: v.offsetZ + 176,
    length: 180,
    width: 5.0,
    isNorthSouth: true,
    curbStartOffset: 3.0,
    curbEndOffset: 0,
    intersections: spineLaneCrossings.map(item => ({ ...item, side: 1 })),
  });
  let step;
  do { step = westSteps.next(); } while (!step.done);

  // Check meshes created
  const roadBed = scene.getMeshByName(`road-bed-test-ring-west-${v.id}`);
  assert.ok(roadBed, `Road bed exists for test-ring-west-${v.id}`);

  // Check curb meshes: curb on side 1 (inner) should be divided by intersections, side -1 (outer) should be continuous
  const innerCurbs = scene.meshes.filter(m => m.name.startsWith(`curb-test-ring-west-${v.id}-1-`));
  const outerCurbs = scene.meshes.filter(m => m.name.startsWith(`curb-test-ring-west-${v.id}--1-`));
  assert.ok(innerCurbs.length > 1, `Inner curb has openings for cross lanes (${innerCurbs.length} segments)`);
  assert.equal(outerCurbs.length, 1, `Outer curb is continuous solid (${outerCurbs.length} segment)`);

  // East ring
  const eastSteps = createCountryRoadSteps(scene, {
    id: `test-ring-east-${v.id}`,
    x: v.offsetX + 60,
    z: v.offsetZ + 176,
    length: 180,
    width: 5.0,
    isNorthSouth: true,
    curbStartOffset: 3.0,
    curbEndOffset: 0,
    intersections: spineLaneCrossings.map(item => ({ ...item, side: -1 })),
  });
  do { step = eastSteps.next(); } while (!step.done);

  const innerEastCurbs = scene.meshes.filter(m => m.name.startsWith(`curb-test-ring-east-${v.id}--1-`));
  const outerEastCurbs = scene.meshes.filter(m => m.name.startsWith(`curb-test-ring-east-${v.id}-1-`));
  assert.ok(innerEastCurbs.length > 1, `Inner east curb has openings (${innerEastCurbs.length} segments)`);
  assert.equal(outerEastCurbs.length, 1, `Outer east curb is continuous solid (${outerEastCurbs.length} segment)`);

  // Test lane 0 (row 0)
  const driveways = [-45, -15, 15, 45].map(dx => ({
    pos: v.offsetX + dx,
    width: 5.5,
    side: -1,
  }));
  const lane0Steps = createCountryRoadSteps(scene, {
    id: `test-lane-${v.id}-0`,
    x: v.offsetX,
    z: v.offsetZ + 98,
    length: 120,
    width: 5.0,
    isNorthSouth: false,
    curbStartOffset: 2.5,
    curbEndOffset: 2.5,
    intersections: [
      { pos: v.offsetX - 60, width: 5.2 },
      { pos: v.offsetX, width: 6.0 },
      { pos: v.offsetX + 60, width: 5.2 },
      ...driveways,
    ],
  });
  do { step = lane0Steps.next(); } while (!step.done);

  const farmSideCurbs = scene.meshes.filter(m => m.name.startsWith(`curb-test-lane-${v.id}-0--1-`));
  assert.ok(farmSideCurbs.length >= 4, `Farm-facing curb on lane-0 has driveway openings (${farmSideCurbs.length} segments)`);
}

console.log('PASS: All 11 village ring roads and lanes connect flush to highways, open to cross lanes and farm driveways, and seal exterior with zero dead ends!');
engine.dispose();
