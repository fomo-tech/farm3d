/**
 * FarmSafetyZone.js
 * Comprehensive spatial safety validator ensuring zero trees, rocks, gazebos,
 * wells, or thematic landmarks ever spawn inside player-owned farm parcels.
 *
 * Each village has 24 parcels (total 288 lots across 12 villages), each exactly 20m x 20m.
 */

import { WORLD_VILLAGES } from '../../../shared/villageLayout.js';
import { FARM_LOT_SPEC, farmLotPosition } from '../../../shared/farmLayout.js';

// Pre-calculate all 288 parcel bounding boxes for ultra-fast collision queries
const ALL_FARM_LOT_BOUNDS = [];

for (let lotNum = 1; lotNum <= 288; lotNum++) {
  const pos = farmLotPosition(lotNum);
  ALL_FARM_LOT_BOUNDS.push({
    lotNumber: lotNum,
    cx: pos.x,
    cz: pos.z,
    halfW: FARM_LOT_SPEC.estateWidth / 2, // 10m
    halfD: FARM_LOT_SPEC.estateDepth / 2, // 10m
  });
}

/**
 * Checks if a 2D world coordinate (x, z) infringes on any of the 288 player farm lots.
 * @param {number} x - World X position
 * @param {number} z - World Z position
 * @param {number} padding - Safety margin in meters outside the estate boundary (default 0.5m)
 * @returns {boolean} True if point is inside any farm parcel
 */
export function isPointInsideAnyFarmLot(x, z, padding = 0.5) {
  // Quick village bounding box check first for high performance
  for (let v = 0; v < WORLD_VILLAGES.length; v++) {
    const village = WORLD_VILLAGES[v];
    // Village farm sector extends from offsetX - 58 to offsetX + 58, and offsetZ + 100 to offsetZ + 265
    if (
      Math.abs(x - village.offsetX) <= (58 + padding) &&
      z >= (village.offsetZ + 100 - padding) &&
      z <= (village.offsetZ + 265 + padding)
    ) {
      // Point is within this village's farm sector; check individual parcels (24 per village)
      const startLot = v * 24;
      const endLot = startLot + 24;
      for (let i = startLot; i < endLot; i++) {
        const lot = ALL_FARM_LOT_BOUNDS[i];
        if (
          Math.abs(x - lot.cx) < (lot.halfW + padding) &&
          Math.abs(z - lot.cz) < (lot.halfD + padding)
        ) {
          return true;
        }
      }
      return false;
    }
  }

  return false;
}
