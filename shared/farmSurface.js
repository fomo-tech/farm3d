import { FARM_LOT_SPEC, farmLotPosition } from './farmLayout.js';
import { WORLD_VILLAGES, LOTS_PER_WORLD_VILLAGE } from './villageLayout.js';

// Top faces of the walkable farm meshes. Houses/fences remain solid colliders.
const surfaces = [
  [0, 0, FARM_LOT_SPEC.estateWidth, FARM_LOT_SPEC.estateDepth, .11, 0],
  [0, -7.8, 4.6, 3.8, .17, 0],
  [0, -11.2, 3.8, 3.2, .13, 0],
  [0, .8, 14.8, 1.8, .19, 0],
  [-4.8, 2, 2.4, 2.4, .21, 0],
  [4.8, 2, 2.4, 2.4, .21, 0],
  ...[-9.2, -8, -6.8].map((z, i) => [0, z, 1.6, .72, .22, i % 2 ? .06 : -.06]),
];
const bucketSize = 32, buckets = new Map();
for (let lot = 1; lot <= WORLD_VILLAGES.length * LOTS_PER_WORLD_VILLAGE; lot++) {
  const origin = farmLotPosition(lot);
  for (let bx = Math.floor((origin.x - 10) / bucketSize); bx <= Math.floor((origin.x + 10) / bucketSize); bx++) {
    for (let bz = Math.floor((origin.z - 13) / bucketSize); bz <= Math.floor((origin.z + 10) / bucketSize); bz++) {
      const key = `${bx}:${bz}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(origin);
    }
  }
}
export function farmSurfaceHeight(x, z) {
  let height = null;
  for (const origin of buckets.get(`${Math.floor(x / bucketSize)}:${Math.floor(z / bucketSize)}`) || []) {
    const lx = x - origin.x, lz = z - origin.z;
    for (const [cx, cz, width, depth, top, yaw] of surfaces) {
      const dx = lx - cx, dz = lz - cz;
      const rx = dx * Math.cos(yaw) - dz * Math.sin(yaw);
      const rz = dx * Math.sin(yaw) + dz * Math.cos(yaw);
      if (Math.abs(rx) <= width / 2 && Math.abs(rz) <= depth / 2) height = Math.max(height ?? 0, top);
    }
    const { columns, rows, tileSpacingX: sx, tileSpacingZ: sz, anchors } = FARM_LOT_SPEC;
    const col = Math.round((lx - anchors.crops.x) / sx + (columns - 1) / 2);
    const row = Math.round((lz - anchors.crops.z) / sz + (rows - 1) / 2);
    if (col >= 0 && col < columns && row >= 0 && row < rows
      && Math.abs(lx - anchors.crops.x - (col - (columns - 1) / 2) * sx) <= (sx - .22) / 2
      && Math.abs(lz - anchors.crops.z - (row - (rows - 1) / 2) * sz) <= (sz - .22) / 2) height = Math.max(height ?? 0, .15);
  }
  return height;
}
