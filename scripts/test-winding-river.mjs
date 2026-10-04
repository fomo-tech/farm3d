/**
 * test-winding-river.mjs
 * Rigorous automated validation test for the Grand Winding River & Bridge Infrastructure.
 */

import { RIVER_CONTROL_POINTS, RIVER_BRIDGES } from '../src/game/world/nature/GrandWindingRiver.js';
import { isPointInsideAnyFarmLot } from '../src/game/world/FarmSafetyZone.js';
import { isPointOnRoadCorridor } from '../src/game/world/RoadSafetyZone.js';
import { WorldCollisionSystem } from '../src/game/physics/WorldCollisionSystem.js';

console.log('=== RUNNING TESTS: THE GRAND WINDING RIVER & BRIDGES ===\n');

// 1. Test Control Points & Spline Clearance from all 288 Farm Parcels
console.log('1. Testing River Trajectory vs 288 Farm Parcels (Safety Clearance >= 12m)...');
let farmViolations = 0;

// Catmull-Rom interpolation for test
function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const x = 0.5 * (
    (2 * p1.x) +
    (-p0.x + p2.x) * t +
    (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
    (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
  );
  const z = 0.5 * (
    (2 * p1.z) +
    (-p0.z + p2.z) * t +
    (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
    (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3
  );
  const w = p1.w + (p2.w - p1.w) * t;
  return { x, z, w };
}

const pts = RIVER_CONTROL_POINTS;
const numSteps = 200;
const sampledPoints = [];
const numSections = pts.length - 1;

for (let i = 0; i < numSections; i++) {
  const p0 = i > 0 ? pts[i - 1] : pts[0];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p3 = i < pts.length - 2 ? pts[i + 2] : p2;
  const stepsPerSec = Math.ceil(numSteps / numSections);

  for (let s = 0; s < stepsPerSec; s++) {
    const t = s / stepsPerSec;
    const pt = catmullRom(p0, p1, p2, p3, t);
    sampledPoints.push(pt);

    // Check center and both banks (+/- half width)
    const halfW = pt.w / 2;
    const testPoints = [
      { x: pt.x, z: pt.z },
      { x: pt.x - halfW - 2, z: pt.z },
      { x: pt.x + halfW + 2, z: pt.z },
    ];

    for (const tp of testPoints) {
      if (isPointInsideAnyFarmLot(tp.x, tp.z, 6.0)) {
        console.error(`VIOLATION: River point (${tp.x.toFixed(1)}, ${tp.z.toFixed(1)}) encroaches on a farm parcel!`);
        farmViolations++;
      }
    }
  }
}

if (farmViolations === 0) {
  console.log(`✓ 100% CLEAR: All ${sampledPoints.length * 3} river test points have ZERO encroachment on all 288 farm parcels.`);
} else {
  console.error(`FAILED: Found ${farmViolations} farm encroachments!`);
  process.exit(1);
}

// 2. Test All Road Crossings have a Corresponding Bridge
console.log('\n2. Testing Road Intersections vs Bridge Infrastructure...');
const highwayCrossings = [
  { name: 'Highway -234', z: -234, expectedBridge: 'bridge-highway-234' },
  { name: 'Highway 86', z: 86, expectedBridge: 'bridge-highway-86' },
  { name: 'Coastal highway 310', z: 310, expectedBridge: 'bridge-highway-406' },
];

highwayCrossings.forEach(hc => {
  const bridge = RIVER_BRIDGES.find(b => b.id === hc.expectedBridge);
  if (!bridge) {
    console.error(`FAILED: Missing bridge for ${hc.name}!`);
    process.exit(1);
  }
  if (Math.abs(bridge.cz - hc.z) > 0.1) {
    console.error(`FAILED: Bridge ${bridge.name} is misaligned with ${hc.name}! (cz=${bridge.cz}, expected=${hc.z})`);
    process.exit(1);
  }
  console.log(`✓ ${hc.name} crossing at z=${hc.z} is 100% spanned by "${bridge.name}" (width=${bridge.widthZ}m, span=${bridge.spanX}m).`);
});

// Pedestrian bridge
const pedBridge = RIVER_BRIDGES.find(b => b.id === 'bridge-vensong-pedestrian');
if (pedBridge) {
  console.log(`✓ Scenic Pedestrian Crossing at z=${pedBridge.cz} is spanned by "${pedBridge.name}".`);
} else {
  console.error('FAILED: Missing pedestrian bridge!');
  process.exit(1);
}

// 3. Test WorldCollisionSystem River Blocking & Bridge Passage
console.log('\n3. Testing River Physics & Collision Engine...');
const collisionSystem = new WorldCollisionSystem();

// Generate test river collision boxes like GrandWindingRiver does
const riverBoxes = [];
const stepSize = 2;
for (let i = 0; i < sampledPoints.length - stepSize; i += stepSize) {
  const pStart = sampledPoints[i];
  const pEnd = sampledPoints[i + stepSize];
  const segMinZ = Math.min(pStart.z, pEnd.z);
  const segMaxZ = Math.max(pStart.z, pEnd.z);
  const maxW = Math.max(pStart.w, pEnd.w);

  const isBridgeCorridor = RIVER_BRIDGES.some(b => {
    const bridgeMinZ = b.cz - b.widthZ / 2 - 1.2;
    const bridgeMaxZ = b.cz + b.widthZ / 2 + 1.2;
    return segMinZ <= bridgeMaxZ && segMaxZ >= bridgeMinZ;
  });

  if (!isBridgeCorridor) {
    riverBoxes.push({
      id: `test-river-barrier-${i}`,
      minX: Math.min(pStart.x, pEnd.x) - maxW / 2 - 0.5,
      maxX: Math.max(pStart.x, pEnd.x) + maxW / 2 + 0.5,
      minZ: segMinZ - 0.2,
      maxZ: segMaxZ + 0.2,
    });
  }
}

collisionSystem.initRiverColliders(riverBoxes);
console.log(`✓ Initialized ${riverBoxes.length} river barrier colliders in WorldCollisionSystem.`);

// Test Case A: Player tries to walk/drive into river where there is NO bridge (e.g., at z = 140, river center x ~ 218)
// Player starts at x = 200, z = 140, attempts dx = +18m towards river
function walkAcross(x, z, distance) {
  let result = { x, z };
  for (let travelled = 0; travelled < distance; travelled++) {
    result = collisionSystem.resolveMovement(result.x, result.z, Math.min(1, distance - travelled), 0);
  }
  return result;
}
const blockedResult = walkAcross(200, 140, 18);
if (blockedResult.x < 210) {
  console.log(`✓ Vehicle/Player blocked at riverbank (target x=218, stopped at x=${blockedResult.x.toFixed(2)})! Cannot enter water without bridge.`);
} else {
  console.error(`FAILED: Vehicle/Player was able to walk into water without bridge at x=${blockedResult.x}!`);
  process.exit(1);
}

// Test Case B: Player crosses river ON BRIDGE 2 (Highway 86 at z = 86)
// Player moves from x = 200, z = 86 to x = 224, z = 86
const bridgeCrossResult = walkAcross(200, 86, 24);
if (bridgeCrossResult.x >= 223) {
  console.log(`✓ Vehicle/Player successfully drove across Bridge 2 on Highway 86 (final x=${bridgeCrossResult.x.toFixed(2)})!`);
} else {
  console.error(`FAILED: Bridge corridor blocked movement at x=${bridgeCrossResult.x}!`);
  process.exit(1);
}

// Test Case C: Player crosses river ON BRIDGE 1 (Highway -234 at z = -234)
const bridge1Result = walkAcross(195, -234, 20);
if (bridge1Result.x >= 214) {
  console.log(`✓ Vehicle/Player successfully drove across Bridge 1 on Highway -234 (final x=${bridge1Result.x.toFixed(2)})!`);
} else {
  console.error(`FAILED: Bridge 1 corridor blocked movement at x=${bridge1Result.x}!`);
  process.exit(1);
}

console.log('\n=== ALL GRAND WINDING RIVER & BRIDGE INFRASTRUCTURE TESTS PASSED! ===');
