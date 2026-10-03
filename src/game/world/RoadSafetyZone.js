/**
 * RoadSafetyZone.js
 * Centralized spatial safety validator ensuring zero trees, buildings, fences, or props
 * ever spawn within active road corridors, sidewalks, intersections, or plazas across
 * ALL 12 villages and inter-regional highways.
 */

import { WORLD_VILLAGES } from '../../../shared/villageLayout.js';

const FARM_CROSSROAD_ROWS = [0, 1, 2, 3, 4, 5, 6];

/**
 * Checks if a 2D world coordinate (x, z) infringes on any road, highway, spine, or intersection corridor.
 * @param {number} x - World X position
 * @param {number} z - World Z position
 * @param {number} clearance - Safety buffer in meters outside the road boundary (default 4.0m)
 * @returns {boolean} True if point is on or too close to a road corridor
 */
export function isPointOnRoadCorridor(x, z, clearance = 4.0) {
  // 1. Trục Đại lộ Bắc - Nam (x = 0): xuyên suốt từ z = -660 đến z = 415
  if (Math.abs(x) < (4.6 + clearance) && z >= -660 && z <= 415) {
    return true;
  }

  // 2. Tuyến Quốc Lộ 86 (z = 86): kết nối 5 làng hàng giữa từ x = -640 đến x = 640
  if (Math.abs(z - 86) < (3.6 + clearance) && Math.abs(x) <= 640) {
    return true;
  }

  // 3. Tuyến Quốc Lộ Bắc -234 (z = -234): kết nối 4 làng hàng Bắc từ x = -640 đến x = 640
  if (Math.abs(z - (-234)) < (3.6 + clearance) && Math.abs(x) <= 640) {
    return true;
  }

  // 4. Tuyến Quốc Lộ Nam 406 (z = 406): kết nối Thu Phong - Biển - Hướng Dương
  if (Math.abs(z - 406) < (3.6 + clearance) && Math.abs(x) <= 340) {
    return true;
  }

  // 5. Tuyến Vành Đai Cực Bắc (z = -650)
  if (Math.abs(z - (-650)) < (3.6 + clearance) && Math.abs(x) <= 640) {
    return true;
  }

  // 6. Tuyến Trục Phố Chợ Phía Tây & Hồ Pha Lê (z = 3)
  if (Math.abs(z - 3) < (3.6 + clearance) && x >= -140 && x <= 160) {
    return true;
  }

  // 7. Lối rẽ vào bến tàu hơi nước (z = 322)
  if (Math.abs(z - 322) < (4.0 + clearance) && x >= -50 && x <= 10) {
    return true;
  }

  // 8. Siêu Quảng Trường Play Together & Vòng Xuyến Trung Tâm (Bán kính 48m)
  if (Math.hypot(x, z) < (48.0 + clearance * 0.5)) {
    return true;
  }

  // 9. Kiểm tra mạng lưới giao thông của TẤT CẢ 12 LÀNG (Spines, Cul-de-sacs, Crossroads, Links)
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

    // d. 7 tuyến đường ngang phân lô nội bộ mỗi làng (chiều dài 124m, rộng 5m)
    if (dx <= (64 + clearance)) {
      for (let r = 0; r < FARM_CROSSROAD_ROWS.length; r++) {
        const laneZ = v.offsetZ + 98 + FARM_CROSSROAD_ROWS[r] * 28;
        if (Math.abs(z - laneZ) < (3.2 + clearance)) {
          return true;
        }
      }
    }

    // e. Bến đón trả khách xe buýt trước cổng làng
    if (Math.abs(x - v.gate.x) < (6.5 + clearance) && Math.abs(z - v.gate.z) < (12 + clearance)) {
      return true;
    }
  }

  return false;
}

