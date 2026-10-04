import { WORLD_VILLAGES } from '../../../shared/villageLayout.js';
import { isPointOnRoadCorridor } from './RoadSafetyZone.js';
import { isPointInsideAnyFarmLot } from './FarmSafetyZone.js';
import { isPointInLakeOrRiver } from './WaterSafetyZone.js';
import { landscapeVariation } from './LandscapeArt.js';

// Forest pockets frame residential areas; the playable parcels remain untouched.
export function villageWoodlandPlacements() {
  const placements = [];
  for (const village of WORLD_VILLAGES) {
    for (const side of [-1, 1]) for (let row = 0; row < 16; row++) {
      for (let depth = 0; depth < 3; depth++) {
        const x = village.offsetX + side * (66 + depth * 5 + landscapeVariation(row, depth, 5) * 3);
        const z = village.offsetZ + 110 + row * 10 + landscapeVariation(row, depth, 9) * 4;
        if (isPointOnRoadCorridor(x, z, 5) || isPointInsideAnyFarmLot(x, z, 5)) continue;
        if (isPointInLakeOrRiver(x, z, 4.0)) continue;
        const v = landscapeVariation(x, z, 7);
        placements.push({ x, z, type: v < .12 ? 'birch' : 'oak', scale: 1.7 + v * .3 });
      }
    }
  }
  return placements;
}

export function* createVillageWoodlandsSteps(foliage) {
  for (const tree of villageWoodlandPlacements()) {
    foliage.spawnTree(tree.type, tree.x, tree.z, { scale: tree.scale, withShadow: false });
    if (landscapeVariation(tree.x, tree.z, 19) < .3) {
      foliage.spawnBush(tree.x, tree.z, .65);
    }
    yield;
  }
}
