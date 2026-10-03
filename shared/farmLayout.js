// Shared farm geometry used by the Babylon client and the authoritative server.
// Keeping these values in one module prevents a client/server tile mismatch and
// gives us a deterministic footprint to validate before a map is rendered.

import { villageGeometry } from './villageLayout.js';

export const FARM_LOT_SPEC = Object.freeze({
  version: 7,
  columns: 4,
  rows: 3,
  tileSize: 2.1,
  tileSpacingX: 2.1,
  tileSpacingZ: 1.8,
  lotSpacingX: 30,
  lotSpacingZ: 28,
  firstLot: { x: -45, z: 112 },
  // The estate is intentionally smaller than the 30x28 parcel cell. The gap
  // is a real service lane, so fences and props can never touch neighbouring lots.
  estateWidth: 20,
  estateDepth: 20,
  fenceGap: 5.5,
  anchors: Object.freeze({
    home: Object.freeze({ x: -4.8, z: 5.2, width: 5.8, depth: 5.2 }),
    corral: Object.freeze({ x: 4.8, z: 5.2, width: 6.4, depth: 5.6 }),
    barn: Object.freeze({ x: 4.8, z: 5.2, width: 6.4, depth: 5.6 }),
    crops: Object.freeze({ x: 0.0, z: -3.0, width: 8.4, depth: 5.4 }),
    gate: Object.freeze({ x: 0, z: -9.0, width: 5.5, depth: 1.8 }),
    nameBoard: Object.freeze({ x: 0, z: -9.8, width: 5.0, depth: 0.5 }),
    path: Object.freeze({ x: 0, z: 0.5, width: 8.0, depth: 2.2 }),
  }),
});

export const FARM_ACTIVE_PLOTS = FARM_LOT_SPEC.columns * FARM_LOT_SPEC.rows;
export const FARM_TILE_KEY_PATTERN = /^[0-3]:[0-2]$/;

export function farmLotPosition(lot) {
  const globalIndex = Math.max(0, Number(lot) - 1);
  const index = globalIndex % 24;
  const village = villageGeometry(Math.floor(globalIndex / 24));
  return {
    x: village.offsetX + FARM_LOT_SPEC.firstLot.x + (index % 4) * FARM_LOT_SPEC.lotSpacingX,
    z: village.offsetZ + FARM_LOT_SPEC.firstLot.z + Math.floor(index / 4) * FARM_LOT_SPEC.lotSpacingZ,
  };
}

export function farmTilePosition(lot, tileKey) {
  if (!FARM_TILE_KEY_PATTERN.test(String(tileKey))) return null;
  const [column, row] = String(tileKey).split(':').map(Number);
  const origin = farmLotPosition(lot);
  const colSpacing = FARM_LOT_SPEC.tileSpacingX || 2.1;
  const rowSpacing = FARM_LOT_SPEC.tileSpacingZ || 1.8;
  const totalW = (FARM_LOT_SPEC.columns - 1) * colSpacing;
  const totalD = (FARM_LOT_SPEC.rows - 1) * rowSpacing;
  const cropsZ = FARM_LOT_SPEC.anchors.crops ? FARM_LOT_SPEC.anchors.crops.z : -3.0;
  const cropsX = FARM_LOT_SPEC.anchors.crops ? FARM_LOT_SPEC.anchors.crops.x : 0;
  return {
    x: origin.x + cropsX + (column * colSpacing - totalW / 2),
    z: origin.z + cropsZ + (row * rowSpacing - totalD / 2),
  };
}

function rectFor(origin, anchor) {
  return {
    minX: origin.x + anchor.x - anchor.width / 2,
    maxX: origin.x + anchor.x + anchor.width / 2,
    minZ: origin.z + anchor.z - anchor.depth / 2,
    maxZ: origin.z + anchor.z + anchor.depth / 2,
  };
}

function overlaps(a, b, padding = 0) {
  return a.minX < b.maxX + padding && a.maxX + padding > b.minX
    && a.minZ < b.maxZ + padding && a.maxZ + padding > b.minZ;
}

/**
 * Validate all parcel footprints without Babylon. This is used in CI/server
 * startup and can also be called by the client debug panel.
 */
export function validateFarmLayout(lotCount = 24) {
  const errors = [];
  const lots = Array.from({ length: lotCount }, (_, index) => ({
    lot: index + 1,
    ...farmLotPosition(index + 1),
  }));
  const halfW = FARM_LOT_SPEC.estateWidth / 2;
  const halfD = FARM_LOT_SPEC.estateDepth / 2;
  lots.forEach(lot => {
    const estate = { minX: lot.x - halfW, maxX: lot.x + halfW, minZ: lot.z - halfD, maxZ: lot.z + halfD };
    const contents = Object.entries(FARM_LOT_SPEC.anchors)
      .filter(([name]) => ['home', 'barn', 'crops'].includes(name))
      .map(([name, anchor]) => [name, rectFor(lot, anchor)]);
    for (let index = 0; index < contents.length; index += 1) {
      for (let next = index + 1; next < contents.length; next += 1) {
        const [name, a] = contents[index];
        const [otherName, b] = contents[next];
        if (overlaps(a, b, 0.15)) errors.push(`lot ${lot.lot}: ${name} overlaps ${otherName}`);
      }
    }
    contents.forEach(([name, rect]) => {
      if (rect.minX < estate.minX || rect.maxX > estate.maxX || rect.minZ < estate.minZ || rect.maxZ > estate.maxZ) {
        errors.push(`lot ${lot.lot}: ${name} leaves estate bounds`);
      }
    });
  });
  for (let index = 0; index < lots.length; index += 1) {
    const a = lots[index];
    const aRect = { minX: a.x - halfW, maxX: a.x + halfW, minZ: a.z - halfD, maxZ: a.z + halfD };
    for (let next = index + 1; next < lots.length; next += 1) {
      const b = lots[next];
      const bRect = { minX: b.x - halfW, maxX: b.x + halfW, minZ: b.z - halfD, maxZ: b.z + halfD };
      if (overlaps(aRect, bRect, 0.01)) errors.push(`lot ${a.lot} overlaps lot ${b.lot}`);
    }
  }
  return { valid: errors.length === 0, errors, lotCount, activePlots: FARM_ACTIVE_PLOTS, version: FARM_LOT_SPEC.version };
}
