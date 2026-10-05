import { FARM_CONFIG } from './farmConfig.js';
import { FARM_LOT_SPEC, farmLotPosition } from './farmLayout.js';
import { decodeFarmId } from './villageLayout.js';
export function farmGateOpen(assignment) {
  return typeof assignment?.gateOpen === 'boolean' ? assignment.gateOpen : FARM_CONFIG.security.gate.defaultOpen;
}
export function cropYield(row) {
  const cfg = FARM_CONFIG.security.theft;
  if (row?.tutorialFastGrowth) return row.yield || cfg.tutorialYield;
  // Older ordinary crops predate the four-item yield schema.
  return !row?.yield || row.yield === 1 ? cfg.normalYield : row.yield;
}

export function farmOrigin(farmId) {
  const decoded = decodeFarmId(farmId);
  return decoded ? farmLotPosition(decoded.order * 24 + decoded.lot) : null;
}
export function farmGatePosition(farmId) {
  const p = farmOrigin(farmId);
  return p && { x: p.x, z: p.z - FARM_LOT_SPEC.estateDepth / 2 };
}
export function insideFarm(farmId, p, padding = 0) {
  const o = farmOrigin(farmId);
  return Boolean(o && p && Math.abs(p.x - o.x) < FARM_LOT_SPEC.estateWidth / 2 + padding && Math.abs(p.z - o.z) < FARM_LOT_SPEC.estateDepth / 2 + padding);
}
// Segment vs perimeter: rejects jumping, long steps and corner cutting. Only
// the front gate opening is traversable; guests already inside can leave it.
export function farmBoundaryBlocked(farmId, open, from, to) {
  const o = farmOrigin(farmId);
  if (!o) return false;
  const hw = FARM_LOT_SPEC.estateWidth / 2, hd = FARM_LOT_SPEC.estateDepth / 2;
  const dx = to.x - from.x, dz = to.z - from.z;
  const hits = [];
  for (const x of [o.x - hw, o.x + hw]) if (dx) {
    const t = (x - from.x) / dx, z = from.z + dz * t;
    if (t >= 0 && t <= 1 && z >= o.z - hd && z <= o.z + hd) hits.push({ front: false });
  }
  for (const z of [o.z - hd, o.z + hd]) if (dz) {
    const t = (z - from.z) / dz, x = from.x + dx * t;
    if (t >= 0 && t <= 1 && x >= o.x - hw && x <= o.x + hw) hits.push({ front: z === o.z - hd, x });
  }
  return hits.some(hit => !hit.front || Math.abs(hit.x - o.x) > FARM_LOT_SPEC.fenceGap / 2 - .45 || (!open && !(FARM_CONFIG.security.gate.allowGuestExit && insideFarm(farmId, from) && !insideFarm(farmId, to))));
}
export function theftPolicy({ owner, gateOpen, row, now, claimedAt, playerCount = 0, farmCount = 0 }) {
  const cfg = FARM_CONFIG.security.theft;
  if (!cfg.enabled || owner) return { error: 'Không thể ăn trộm tại nông trại này.' };
  if (cfg.requireOpenGate && !gateOpen) return { error: 'Cổng đã đóng. Không thể ăn trộm.' };
  if (cfg.newFarmProtectionMs > 0 && now - claimedAt < cfg.newFarmProtectionMs) return { error: 'Nông trại mới đang được bảo vệ.' };
  if (cfg.dailyLimitsEnabled && (playerCount >= cfg.dailyPlayerLimit || farmCount >= cfg.dailyFarmLimit)) return { error: 'Đã hết lượt ăn trộm hôm nay.' };
  const crop = FARM_CONFIG.crops[row?.crop];
  if (!crop || row.state !== 'watered' || row.tutorialFastGrowth || now - row.wateredAt < crop.growMs) return { error: 'Chỉ được lấy cây chín, không phải cây hướng dẫn.' };
  if (row.stolenAmount || row.theftClaim) return { error: 'Cây này đã bị lấy trong vụ hiện tại.' };
  const amount = Math.floor(cropYield(row) * (1 - cfg.ownerRetainedRatio));
  return amount > 0 ? { amount, crop: row.crop } : { error: 'Sản lượng cây này được bảo vệ toàn bộ.' };
}
