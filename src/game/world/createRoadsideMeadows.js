/**
 * createRoadsideMeadows.js
 * 
 * Clean, uncluttered roadside meadow buffers for Cozy Farmy aesthetic.
 * - Removed 150+ flat muddy 12-sided polygonal patches (makeOrganicPatch)
 *   that created discolored blotches on the grass.
 * - Retains clean roadside bushes placed via GPU Thin Instancing.
 * - Returns clean, lightweight telemetry without cluttering the scene graph.
 */

import { isPointOnRoadCorridor } from './RoadSafetyZone.js';
import { isPointInsideAnyFarmLot } from './FarmSafetyZone.js';
import { isPointInLakeOrRiver } from './WaterSafetyZone.js';

const CORRIDORS = [
  { z: 86, minX: -570, maxX: 570, theme: 'meadow' },
  { z: -234, minX: -570, maxX: 570, theme: 'heather' },
  { z: 406, minX: -335, maxX: 335, theme: 'dry' },
];

function noise(x, z, seed) {
  const value = Math.sin(x * 12.9898 + z * 78.233 + seed * 31.817) * 43758.5453;
  return value - Math.floor(value);
}

export function roadsideMeadowPlacements() {
  const placements = [];
  for (const road of CORRIDORS) {
    for (let x = road.minX; x <= road.maxX; x += 28) {
      for (const side of [-1, 1]) {
        if (noise(x, road.z, side + 4) < 0.35) continue;
        const px = x + (noise(x, road.z, side + 8) - 0.5) * 8;
        const pz = road.z + side * (18 + noise(x, road.z, side + 12) * 8);

        // Clearance checks: bushes must never intersect roads, farm lots, lake, or river
        if (isPointOnRoadCorridor(px, pz, 1.2) || isPointInsideAnyFarmLot(px, pz, 2.0)) continue;
        if (isPointInLakeOrRiver(px, pz, 3.0)) continue;
        if (pz > 320 && pz < 390 && Math.abs(px) < 125) continue;

        placements.push({ x: px, z: pz, theme: road.theme });
      }
    }
  }
  return placements;
}

export function* createRoadsideMeadowsSteps(scene, foliageInstancing = null) {
  yield;
  let bushCount = 0;
  const placements = roadsideMeadowPlacements();

  // Spawn tidy roadside bushes via GPU Thin Instancing (clean, non-cluttering)
  for (const placement of placements) {
    if (foliageInstancing && noise(placement.x, placement.z, 41) > 0.60) {
      foliageInstancing.spawnBush(placement.x, placement.z, 0.45);
      bushCount += 1;
    }
    yield;
  }

  // All 150+ flat muddy polygon patches removed - zero ground clutter!
  return { meshes: [], patchCount: 0, bushCount };
}

export function createRoadsideMeadows(scene, foliageInstancing = null) {
  const steps = createRoadsideMeadowsSteps(scene, foliageInstancing);
  let result;
  do { result = steps.next(); } while (!result.done);
  return result.value;
}
