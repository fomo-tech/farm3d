/**
 * RoadSafetyZone.js
 * Centralized spatial safety validator ensuring zero trees, buildings, fences, or props
 * ever spawn within active road corridors, sidewalks, intersections, or plazas across
 * ALL 12 villages and inter-regional highways.
 */

import { WORLD_VILLAGES } from '../../../shared/villageLayout.js';
import { beachWaterAt, beachResourceWaterAt, beachRoadAt, beachPromenadeAt } from '../../../shared/beachConfig.js';
import { lakeWaterAt, lakeWalkwayAt } from '../../../shared/lakeConfig.js';

const FARM_CROSSROAD_ROWS = [0, 1, 2, 3, 4, 5, 6];

/**
 * Cấu hình toàn cục cho hệ thống kiểm soát hành lang an toàn giao thông
 */
export const ROAD_SAFETY_CONFIG = {
  // Flag chặn hiển thị tài nguyên/công trình/vật thể trên đường
  blockRoadResources: true,
  // Độ hở an toàn mặc định (mét) ngoài ranh giới lòng đường
  defaultClearance: 1.5,
  // Bật/tắt log cảnh báo khi một tài nguyên bị chặn trên đường
  debugLogBlocked: true,
};

let blockedResourcesCount = 0;

/**
 * Thay đổi trạng thái flag chặn tài nguyên trên đường
 * @param {boolean} enabled 
 */
export function setBlockRoadResources(enabled) {
  ROAD_SAFETY_CONFIG.blockRoadResources = Boolean(enabled);
}

/**
 * Lấy số lượng tài nguyên đã bị chặn hiển thị trên đường
 * @returns {number}
 */
export function getBlockedRoadResourcesCount() {
  return blockedResourcesCount;
}

/**
 * Ghi nhận một tài nguyên bị chặn trên đường
 * @param {string} resourceName 
 * @param {number} x 
 * @param {number} z 
 */
export function recordBlockedRoadResource(resourceName, x, z) {
  blockedResourcesCount += 1;
  if (ROAD_SAFETY_CONFIG.debugLogBlocked && typeof console !== 'undefined') {
    console.warn(`[RoadSafetyZone] [BLOCKED] Đã chặn tài nguyên '${resourceName}' tại (${x.toFixed(1)}, ${z.toFixed(1)}) vì xâm lấn hành lang đường giao thông.`);
  }
}

/**
 * Kiểm tra xem một tài nguyên có bị chặn hiển thị tại tọa độ (x, z) hay không
 * @param {number} x 
 * @param {number} z 
 * @param {number} [clearance] 
 * @returns {boolean} True nếu tài nguyên bị chặn
 */
export function isRoadResourceBlocked(x, z, clearance = ROAD_SAFETY_CONFIG.defaultClearance) {
  if (lakeWaterAt(x, z) || lakeWalkwayAt(x, z, -clearance)) return true;
  if (beachResourceWaterAt(x,z,clearance)) return true;
  if (!ROAD_SAFETY_CONFIG.blockRoadResources) return false;
  return isPointOnRoadCorridor(x, z, clearance);
}

/** Reserve the whole ground footprint, not just an object's pivot. */
export function isRoadFootprintBlocked(x, z, halfWidth = 0, halfDepth = halfWidth, clearance = 0) {
  if (![x, z, halfWidth, halfDepth, clearance].every(Number.isFinite)) return true;
  if (halfWidth < 0 || halfDepth < 0 || clearance < 0) return true;
  const sample = (center, halfExtent) => {
    if (!halfExtent) return [center];
    const count = Math.ceil(halfExtent * 2 / 2);
    return Array.from({ length: count + 1 }, (_, index) => center - halfExtent + index * halfExtent * 2 / count);
  };
  const xs = sample(x, halfWidth);
  const zs = sample(z, halfDepth);
  return xs.some(px => zs.some(pz => isPointOnRoadCorridor(px, pz, clearance)));
}

/**
 * Checks if a 2D world coordinate (x, z) infringes on any road, highway, spine, or intersection corridor.
 * @param {number} x - World X position
 * @param {number} z - World Z position
 * @param {number} clearance - Safety buffer in meters outside the road boundary (default 4.0m)
 * @returns {boolean} True if point is on or too close to a road corridor
 */
export function isPointOnRoadCorridor(x, z, clearance = 4.0) {
  if (beachWaterAt(x,z)) return false;
  if (beachRoadAt(x,z,clearance)) return true;
  if (beachPromenadeAt(x,z,clearance)) return true;
  // 1. Trục Đại lộ Bắc - Nam (x = 0): xuyên suốt từ z = -660 đến z = 415 (Lòng đường 8.5m + vỉa hè)
  if (Math.abs(x) < (4.6 + clearance) && z >= -660 && z <= 310) {
    return true;
  }

  // 2. Tuyến Quốc Lộ 86 (z = 86): kết nối 5 làng hàng giữa từ x = -685 đến x = 685 (Lòng đường 6.0m)
  if (Math.abs(z - 86) < (3.6 + clearance) && Math.abs(x) <= 690) {
    return true;
  }

  // 3. Tuyến Quốc Lộ Bắc -234 (z = -234): kết nối 4 làng hàng Bắc từ x = -685 đến x = 685 (Lòng đường 6.0m)
  if (Math.abs(z - (-234)) < (3.6 + clearance) && Math.abs(x) <= 690) {
    return true;
  }

  // 4. Tuyến Quốc Lộ Nam 406 (z = 406): kết nối Thu Phong - Biển - Hướng Dương (Lòng đường 6.0m)
  if (Math.abs(z - 406) < (3.6 + clearance) && Math.abs(x) >= 240 && Math.abs(x) <= 620) {
    return true;
  }

  // 5. Tuyến Vành Đai Cực Bắc (z = -650)
  if (Math.abs(z - (-650)) < (3.6 + clearance) && Math.abs(x) <= 690) {
    return true;
  }

  // Turnaround pads extend beyond the ends of the inter-village highways.
  if ([-680, 680].some(cx => [86, -234, -650].some(cz => Math.hypot(x - cx, z - cz) < 6.8 + clearance))) return true;

  // 6. Tuyến Đại lộ Đông - Tây (z = 0) & Trục Phố Chợ Phía Tây & Hồ Pha Lê (z = 3, x từ -140 đến 160)
  if ((Math.abs(z) < (4.6 + clearance) || Math.abs(z - 3) < (4.2 + clearance)) && x >= -140 && x <= 160) {
    return true;
  }
  if (Math.hypot(x + 122, z) < 7.2 + clearance) return true;

  // 6b. Hai trục nối Cửa Tây & Cửa Đông Đô thị xuống Quốc Lộ 86 (x = ±122, z từ 0 đến 86)
  if (Math.abs(Math.abs(x) - 122) < (4.2 + clearance) && z >= -2 && z <= 88) {
    return true;
  }

  // 7. Lối rẽ vào bến tàu hơi nước (z = 322)
  if (Math.abs(z - 322) < (4.0 + clearance) && x >= -50 && x <= 10) {
    return true;
  }

  // 8. Hai trục dọc Nông trại Bình Minh: farm-spine-west (x = -60) và farm-spine-east (x = 60), z từ 84 đến 278
  if ((Math.abs(x - (-60)) < (4.2 + clearance) || Math.abs(x - 60) < (4.2 + clearance)) && z >= 84 && z <= 278) {
    return true;
  }

  // 9. Siêu Quảng Trường Play Together & Vòng Xuyến Trung Tâm (Bán kính 48m)
  if (Math.hypot(x, z) < (48.0 + clearance * 0.5)) {
    return true;
  }

  // 10. Kiểm tra mạng lưới giao thông của TẤT CẢ 12 LÀNG (Spines, Cul-de-sacs, Crossroads, Rings, Links)
  for (let i = 0; i < WORLD_VILLAGES.length; i++) {
    const v = WORLD_VILLAGES[i];
    const dx = Math.abs(x - v.offsetX);

    // a. Trục nhánh từ vành đai cực Bắc (-650) nối vào cổng làng
    if (dx < (3.4 + clearance) && z >= -655 && z <= (v.gate.z + 5)) {
      return true;
    }

    // b. Trục đường chính xuyên tâm làng (Spine road: width 5.5m + sidewalk 1.6m each side = 8.7m)
    if (dx < (4.8 + clearance) && z >= (v.offsetZ + 80) && z <= (v.offsetZ + 288)) {
      return true;
    }

    // c. Bùng binh quay đầu xe cul-de-sac tại cuối làng (bán kính 6.8m)
    const culZ = v.offsetZ + 280;
    if (Math.hypot(x - v.offsetX, z - culZ) < (7.5 + clearance)) {
      return true;
    }

    // d. 7 tuyến đường ngang phân lô nội bộ mỗi làng (chiều dài 120m, rộng 5m -> half-span 60m)
    if (dx <= (64 + clearance)) {
      for (let r = 0; r < FARM_CROSSROAD_ROWS.length; r++) {
        const laneZ = v.offsetZ + 98 + FARM_CROSSROAD_ROWS[r] * 28;
        if (Math.abs(z - laneZ) < (3.2 + clearance)) {
          return true;
        }
      }
    }

    // e. Hai trục vành đai biên Tây và Đông mỗi làng (x = offsetX ± 60, chạy liền mạch từ Quốc Lộ cổng làng đến lane 6)
    if (Math.abs(dx - 60) < (3.2 + clearance) && z >= (v.offsetZ + 82) && z <= (v.offsetZ + 274)) {
      return true;
    }

    // f. Bến đón trả khách xe buýt trước cổng làng
    if (Math.abs(x - v.gate.x) < (6.5 + clearance) && Math.abs(z - v.gate.z) < (12 + clearance)) {
      return true;
    }
  }

  return false;
}

// Global debug exposure in browser environment
if (typeof window !== 'undefined') {
  window.__farmRoadSafety = {
    config: ROAD_SAFETY_CONFIG,
    getBlockedCount: getBlockedRoadResourcesCount,
    isPointOnRoadCorridor,
    isRoadResourceBlocked,
    isRoadFootprintBlocked,
    setBlockRoadResources,
  };
}

