import {networkWaterAt} from '../../../shared/waterNetwork.js';
/**
 * WaterSafetyZone.js
 * Centralized spatial safety validator ensuring ZERO trees, bushes, rocks, or terrestrial props
 * ever spawn inside Crystal Lake or the Grand Winding River waterways.
 */

/**
 * Checks if a 2D world coordinate (x, z) falls inside Crystal Lake or the Grand Winding River.
 * @param {number} x - World X position
 * @param {number} z - World Z position
 * @param {number} margin - Safety buffer in meters outside the waterline (default 3.0m)
 * @returns {boolean} True if point is inside or too close to water bodies
 */
export function isPointInLakeOrRiver(x, z, margin = 3.0) {
  if (networkWaterAt(x,z,margin)) return true;
  // 1. Crystal Lake (Hồ Pha Lê mở rộng - Tọa độ tâm ~167, 2, bán kính trục X: 54m, trục Z: 68m)
  // Bao trọn 100% lòng hồ, bãi cát vàng bao quanh và thềm đảo Vọng Lâu
  const lakeMinX = 126.0 - margin;
  const lakeMaxX = 228.0 + margin;
  const lakeMinZ = -74.0 - margin;
  const lakeMaxZ = 78.0 + margin;

  if (x >= lakeMinX && x <= lakeMaxX && z >= lakeMinZ && z <= lakeMaxZ) {
    // Elliptical boundary check for natural curved margin
    const dx = (x - 167.0) / (55.0 + margin);
    const dz = (z - 2.0) / (68.0 + margin);
    if (dx * dx + dz * dz <= 1.08) {
      return true;
    }
  }

  // 2. Grand Winding River (Đại Sông Uốn Lượn chạy từ cực Bắc z=-600 đến cực Nam z=740)
  // Hành lang sông chạy dọc dải X: 195 - 240
  if (z >= -600.0 && z <= 740.0) {
    if (x >= (194.0 - margin) && x <= (242.0 + margin)) {
      return true;
    }
    // Cửa sông phía Nam mở rộng đổ ra biển (z > 640)
    if (z >= 640.0 && x >= (135.0 - margin) && x <= (245.0 + margin)) {
      return true;
    }
  }

  return false;
}
