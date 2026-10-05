/**
 * WorldCollisionSystem.js
 * 2.5D Continuous Wall & Building Collision Engine with Smooth Wall Sliding.
 * Prevents player from walking through walls, houses, barns, Town Hall, windmills, and fences
 * while maintaining 60 FPS performance and zero snagging on paths or curbs.
 */

import { WORLD_LAYOUT } from '../world/worldLayout.js';
import { BEACH_CONFIG, beachDeepWaterAt } from '../../../shared/beachConfig.js';
import { VENUE_LAYOUT } from '../../../shared/venueLayout.js';
import { farmBoundaryBlocked } from '../../../shared/farmSecurity.js';
import { lakeDeepWaterAt } from '../../../shared/lakeConfig.js';
import { TOWN_FOUNTAIN, TOWN_SPAWN, insideTownFountain } from '../../../shared/playerSpawn.js';

export class WorldCollisionSystem {
  constructor() {
    this.staticBoxes = [];
    this.staticCircles = [];
    this.venueWalls = [];
    this.interiorBoxes = new Map();
    this.farmColliders = [];
    this.farmGateStates = new Map();
    this.playerRadius = 0.45; // meters

    this.initStaticColliders();
    this.initVenueColliders();
    this.initFarmColliders();
    this.initMountainColliders();
  }

  initVenueColliders() {
    for (const [kind, venue] of Object.entries(VENUE_LAYOUT)) {
      const { x, z, yaw } = venue.exterior;
      const addWall = (part, localX, localZ, halfWidth, halfDepth) => {
        this.venueWalls.push({
          id: `${kind}-${part}`, x: x + localX * Math.cos(yaw) + localZ * Math.sin(yaw),
          z: z - localX * Math.sin(yaw) + localZ * Math.cos(yaw),
          cos: Math.cos(yaw), sin: Math.sin(yaw), halfWidth, halfDepth,
        });
      };
      // Body meshes are 16 x 12. Solid building body + front entrance alcove.
      addWall('body-core', 0, -0.6, 7.8, 5.4);
      addWall('front-left', -4.9, 5.8, 3.1, 0.4);
      addWall('front-right', 4.9, 5.8, 3.1, 0.4);
      addWall('door-stop', 0, 4.6, 2.0, 0.3);
      addWall('left', -7.8, 0, 0.4, 6);
      addWall('right', 7.8, 0, 0.4, 6);
      addWall('back', 0, -5.8, 8, 0.4);

      const room = venue.interior;
      const box = (part, lx, lz, halfWidth, halfDepth) => ({
        id: `${kind}-interior-${part}`, minX: room.x + lx - halfWidth,
        maxX: room.x + lx + halfWidth, minZ: room.z + lz - halfDepth,
        maxZ: room.z + lz + halfDepth,
      });
      const obstacles = [
        box('back-wall', 0, 9, 12, 0.2),
        box('front-wall', 0, -17.8, 12, 0.2),
        box('left-wall', -12, -4, 0.2, 14),
        box('right-wall', 12, -4, 0.2, 14),
        box('counter', 0, 4.8, 5, 1.2),
        box('shelf-left', -8, 2, 1.6, 0.7),
        box('shelf-right', 8, 2, 1.6, 0.7),
        box('display-left', -4.5, -0.2, kind === 'casino' ? 1.5 : 1.2, kind === 'casino' ? 1.5 : 0.65),
        box('display-right', 4.5, -0.2, kind === 'casino' ? 1.5 : 1.2, kind === 'casino' ? 1.5 : 0.65),
      ];
      if (kind === 'fashion') {
        obstacles.push(
          box('fashion-sofa', 6.0, -8.5, 1.8, 1.8),
          box('fashion-booth-0', -8.5, -1.5, 1.6, 1.5),
          box('fashion-booth-1', -8.5, 2.5, 1.6, 1.5),
          box('fashion-mirror', 7.5, 8.4, 2.0, 0.6)
        );
      }
      this.interiorBoxes.set(kind, obstacles);
    }
  }
  setFarmGate(farmId, open, owned = true) {
    if (owned) this.farmGateStates.set(farmId, open);
    else this.farmGateStates.delete(farmId);
  }

  attachSceneObstacles(scene) {
    const pending = [];
    const known = new WeakSet();
    const queue = mesh => {
      if (!known.has(mesh) && /^(?:c-)?lamp-base-/.test(mesh.name)) { known.add(mesh); pending.push(mesh); }
    };
    scene.meshes.forEach(queue);
    scene.onNewMeshAddedObservable.add(queue);
    this.flushSceneObstacles = () => {
      for (const mesh of pending.splice(0)) {
        if (mesh.isDisposed()) continue;
        mesh.computeWorldMatrix(true);
        const bounds = mesh.getBoundingInfo().boundingBox;
        const center = bounds.centerWorld;
        const extent = bounds.extendSizeWorld;
        this.addCircle(mesh.name, center.x, center.z, Math.max(extent.x, extent.z));
      }
    };
  }

  /**
   * Initializes static landmark and municipal building colliders.
   */
  initStaticColliders() {
    // 0. Đài phun nước trung tâm (Central Fountain) tại (0, 0)
    // Đường kính hồ 18m, vành đá torus dày 0.7m => bán kính r = 9.35m
    this.addCircle('plaza-central-fountain', TOWN_FOUNTAIN.x, TOWN_FOUNTAIN.z, TOWN_FOUNTAIN.radius);
    // 1. Tòa Thị Chính (Town Hall) tại (-38, -98): khối đế & thân nhà
    this.addBox('town-hall-main', -50.5, -25.5, -106.0, -92.5);
    this.addBox('town-hall-tower', -42.0, -34.0, -104.0, -96.0);

    // 2. Nhà Nông Trang Ghibli (Modern Farmhouse) tại (-38, 62)
    this.addBox('modern-farmhouse', -43.5, -32.5, 57.5, 66.5);

    // 3. Chuồng Ngựa Đỏ (Classic Red Barn) tại (42, 62)
    this.addBox('classic-red-barn', 35.5, 48.5, 56.5, 67.5);

    // 4. Tiệm Tạp Hóa Ven Đường & Trạm Giao Hàng tại (-11.5, 60) và (11.5, 60)
    this.addBox('roadside-shop', -14.2, -8.8, 57.5, 62.5);
    this.addBox('delivery-station', 8.8, 14.2, 57.5, 62.5);

    // 4b. Trạm dừng xe buýt thông minh ngoại vi (Smart Bus Shelters)
    this.addBox('bus-shelter-south', 7.5, 11.8, 78.0, 82.0);
    this.addBox('bus-shelter-north', -11.5, -7.2, -70.0, -66.0);

    // 4c. Kiosk nghỉ chân của Bác Trưởng Làng Ba (Village Elder)
    this.addBox('village-elder-kiosk', -8.8, -6.0, 75.0, 78.2);

    // 5. Cối Xay Gió Hà Lan (Windmill) tại (-92, 108)
    this.addCircle('windmill-base', -92, 108, 5.0);

    // 6. Xưởng Thủ Công tại (88, 136)
    this.addBox('artisan-workshop', 83.5, 92.5, 132.5, 139.5);

    // (Đã dọn dẹp hàng rào bãi chăn thả tại x=88, z=112)

    // 8. Sân Khấu Nghệ Thuật tại (38, -6)
    this.addBox('concert-stage', 31.5, 44.5, -10.5, -1.5);

    // 9. Quán Cà Phê Airstream tại (-34, 6)
    this.addBox('coffee-van', -37.0, -31.0, 4.5, 7.5);

    // 10. Quầy Nông Sản Chợ Phiên Tây tại (-62, 2)
    this.addBox('farmers-market-stalls', -66.5, -57.5, -0.5, 4.5);

    // 11. Ngọn Hải Đăng tại (73, 345)
    this.addCircle('lighthouse-base', 73, 345, 4.4);

    // 12. Bến Tàu Hơi Nước tại (-38, 358)
    this.addBox('steamboat-port-building', -44.0, -32.0, 353.5, 362.5);

    // 13. Công viên Glamping Bãi Biển tại (38, 345) - 2 chóp lều canvas
    for (const item of BEACH_CONFIG.colliders) this.addBox(item.id, item.minX, item.maxX, item.minZ, item.maxZ);
    BEACH_CONFIG.palms.forEach(([x,z],i)=>this.addCircle(`beach-palm-${i}`,x,z,.22));

    // Lake water and the clear pier corridor use shared/lakeConfig.js.
  }

  /**
   * Initializes collision footprints for all 288 farm parcels.
   * Includes house, barn, and parcel perimeter fences (preserving 5.5m open front gate).
   */
  initFarmColliders() {
    if (!WORLD_LAYOUT.farms) return;

    WORLD_LAYOUT.farms.forEach(farm => {
      const fx = farm.x;
      const fz = farm.z;

      // 1. Nhà chính nông dân (x: -4.8, z: 5.2, width: 5.8, depth: 5.2)
      this.farmColliders.push({
        id: `farm-home-${farm.id}`,
        type: 'box',
        minX: fx - 4.8 - 3.0,
        maxX: fx - 4.8 + 3.0,
        minZ: fz + 5.2 - 2.7,
        maxZ: fz + 5.2 + 2.7,
        cx: fx - 4.8,
        cz: fz + 5.2,
      });

      // 2. Chuồng gia súc / trang trại phụ (x: 4.8, z: 5.2, width: 6.4, depth: 5.6)
      this.farmColliders.push({
        id: `farm-barn-${farm.id}`,
        type: 'box',
        minX: fx + 4.8 - 3.3,
        maxX: fx + 4.8 + 3.3,
        minZ: fz + 5.2 - 2.9,
        maxZ: fz + 5.2 + 2.9,
        cx: fx + 4.8,
        cz: fz + 5.2,
      });

      // 3. Hàng rào bao quanh lô đất 20m x 20m (chừa cổng 5.5m ở mặt trước z = fz - 9.0)
      // Hàng rào Tây (x = fx - 10)
      this.farmColliders.push({
        id: `farm-fence-w-${farm.id}`,
        type: 'box',
        minX: fx - 10.3,
        maxX: fx - 9.7,
        minZ: fz - 10.2,
        maxZ: fz + 10.2,
        cx: fx - 10,
        cz: fz,
      });

      // Hàng rào Đông (x = fx + 10)
      this.farmColliders.push({
        id: `farm-fence-e-${farm.id}`,
        type: 'box',
        minX: fx + 9.7,
        maxX: fx + 10.3,
        minZ: fz - 10.2,
        maxZ: fz + 10.2,
        cx: fx + 10,
        cz: fz,
      });

      // Hàng rào Sau (z = fz + 10)
      this.farmColliders.push({
        id: `farm-fence-back-${farm.id}`,
        type: 'box',
        minX: fx - 10.2,
        maxX: fx + 10.2,
        minZ: fz + 9.7,
        maxZ: fz + 10.3,
        cx: fx,
        cz: fz + 10,
      });

      // Hàng rào Trước cánh Trái (x từ fx - 10 đến fx - 2.75)
      this.farmColliders.push({
        id: `farm-fence-fl-${farm.id}`,
        type: 'box',
        minX: fx - 10.2,
        maxX: fx - 2.75,
        minZ: fz - 9.3,
        maxZ: fz - 8.7,
        cx: fx - 6.3,
        cz: fz - 9.0,
      });

      // Hàng rào Trước cánh Phải (x từ fx + 2.75 đến fx + 10)
      this.farmColliders.push({
        id: `farm-fence-fr-${farm.id}`,
        type: 'box',
        minX: fx + 2.75,
        maxX: fx + 10.2,
        minZ: fz - 9.3,
        maxZ: fz - 8.7,
        cx: fx + 6.3,
        cz: fz - 9.0,
      });
      // Lối cổng vào ở giữa [fx - 2.75, fx + 2.75] hoàn toàn mở thông thoáng!
    });
  }

  addBox(id, minX, maxX, minZ, maxZ) {
    this.staticBoxes.push({
      id,
      type: 'box',
      minX,
      maxX,
      minZ,
      maxZ,
      cx: (minX + maxX) / 2,
      cz: (minZ + maxZ) / 2,
    });
  }

  /**
   * Registers impassable river bounding boxes (excluding bridge safe corridors)
   * to strictly prevent players, bikes, scooters, and tractors from driving into water.
   */
  initRiverColliders(riverBoxes) {
    if (!riverBoxes || !Array.isArray(riverBoxes)) return;
    riverBoxes.forEach(b => {
      this.addBox(b.id, b.minX, b.maxX, b.minZ, b.maxZ);
    });
  }

  /**
   * Initializes impassable mountain base colliders for all Tier 1 horizon mountains.
   * Prevents player from penetrating into hollow mountain meshes.
   */
  initMountainColliders() {
    this.mountainColliders = [];
    const countTier1 = 26;
    for (let i = 0; i < countTier1; i++) {
      const angle = (i * Math.PI * 2) / countTier1;
      const sinA = Math.sin(angle);
      if (sinA > 0.45) continue; // Mở rộng hướng biển Nam

      const radius = 880 + (i % 5) * 45;
      const mx = Math.cos(angle) * radius;
      const mz = sinA * radius;
      const diam = 520 + (i % 4) * 60;
      const solidRadius = diam * 0.5 * 0.65; // Mountain solid core perimeter
      this.mountainColliders.push({
        id: `mtn-core-tier1-${i}`,
        x: mx,
        z: mz,
        radius: solidRadius,
      });
    }
  }

  addCircle(id, x, z, radius) {
    this.staticCircles.push({
      id,
      type: 'circle',
      x,
      z,
      radius,
      cx: x,
      cz: z,
    });
  }

  /**
   * Fast collision test for a circle at (cx, cz) with radius r against all nearby colliders.
   * @returns {boolean} True if point collides with any solid obstacle.
   */
  isColliding(cx, cz, r = this.playerRadius, venue = null) {
    if (!venue && lakeDeepWaterAt(cx, cz, r)) return true;
    if(!venue && beachDeepWaterAt(cx,cz)) return true;
    if (venue && this.interiorBoxes.has(venue)) {
      const room = VENUE_LAYOUT[venue]?.interior;
      if (room) {
        if (cx - r < room.x - 11.5 || cx + r > room.x + 11.5 || cz - r < room.z - 17.5 || cz + r > room.z + 8.5) {
          return true;
        }
      }
      return this.interiorBoxes.get(venue).some(box => this.circleHitsBox(cx, cz, r, box));
    }
    const searchRadiusSq = 35 * 35; // 35m search window

    // 1. Check static boxes
    for (let i = 0; i < this.staticBoxes.length; i++) {
      const b = this.staticBoxes[i];
      const dsq = (cx - b.cx) * (cx - b.cx) + (cz - b.cz) * (cz - b.cz);
      if (dsq > searchRadiusSq) continue;

      // Closest point on box
      if (this.circleHitsBox(cx, cz, r, b)) {
        return true;
      }
    }

    for (const wall of this.venueWalls) {
      if ((cx - wall.x) ** 2 + (cz - wall.z) ** 2 > 22 * 22) continue;
      const dx = cx - wall.x;
      const dz = cz - wall.z;
      const localX = dx * wall.cos - dz * wall.sin;
      const localZ = dx * wall.sin + dz * wall.cos;
      const nearX = Math.max(-wall.halfWidth, Math.min(localX, wall.halfWidth));
      const nearZ = Math.max(-wall.halfDepth, Math.min(localZ, wall.halfDepth));
      if ((localX - nearX) ** 2 + (localZ - nearZ) ** 2 < r * r) return true;
    }

    // 2. Check static circles
    for (let i = 0; i < this.staticCircles.length; i++) {
      const c = this.staticCircles[i];
      const dsq = (cx - c.x) * (cx - c.x) + (cz - c.z) * (cz - c.z);
      const combinedR = r + c.radius;
      if (dsq < combinedR * combinedR) {
        return true;
      }
    }

    // 2b. Check mountain base colliders
    if (this.mountainColliders) {
      for (let i = 0; i < this.mountainColliders.length; i++) {
        const m = this.mountainColliders[i];
        const dsq = (cx - m.x) * (cx - m.x) + (cz - m.z) * (cz - m.z);
        const combinedR = r + m.radius;
        if (dsq < combinedR * combinedR) {
          return true;
        }
      }
    }

    // 3. Check farm colliders (filtered by 30m distance)
    for (let i = 0; i < this.farmColliders.length; i++) {
      const fb = this.farmColliders[i];
      const dsq = (cx - fb.cx) * (cx - fb.cx) + (cz - fb.cz) * (cz - fb.cz);
      if (dsq > 22 * 22) continue;

      if (this.circleHitsBox(cx, cz, r, fb)) {
        return true;
      }
    }

    // 4. World Border Perimeter & Procedural Mountain Base Colliders
    if (!venue) {
      // The ocean is in the central coastal corridor only. Southern villages
      // at x≈±300 extend past z=450 and must remain reachable on land.
      if (cz > 450 && Math.abs(cx) < 180) {
        return true;
      }

      const distSq = cx * cx + cz * cz;
      // Procedural mountain inner boundary (radius 820m with harmonic undulations)
      if (distSq > 790 * 790) {
        const angle = Math.atan2(cz, cx);
        const sinA = Math.sin(angle);
        // North, East, and West are bordered by the procedural alpine mountain range
        if (sinA <= 0.45) {
          const radMod0 = Math.sin(angle * 3.0) * 25;
          const baseMountainR = 810 + radMod0;
          if (distSq > baseMountainR * baseMountainR) {
            return true;
          }
        } else if (distSq > 850 * 850) {
          // Open ocean boundary to the South
          return true;
        }
      }
    }

    return false;
  }

  circleHitsBox(cx, cz, r, box) {
    const nx = Math.max(box.minX, Math.min(cx, box.maxX));
    const nz = Math.max(box.minZ, Math.min(cz, box.maxZ));
    return (cx - nx) ** 2 + (cz - nz) ** 2 < r * r;
  }

  /**
   * Resolves player movement with smooth Wall-Sliding physics and anti-tunneling substeps.
   * If direct movement collides, tries sliding along horizontal wall (X only) or vertical wall (Z only).
   * @param {number} curX - Current player X
   * @param {number} curZ - Current player Z
   * @param {number} dx - Proposed delta X
   * @param {number} dz - Proposed delta Z
   * @returns {{ x: number, z: number, collided: boolean }} Resolved safe position
   */
  resolveMovement(curX, curZ, dx, dz, venue = null) {
    this.flushSceneObstacles?.();
    if (!venue) for (const [id, open] of this.farmGateStates) {
      if (farmBoundaryBlocked(id, open, { x: curX, z: curZ }, { x: curX + dx, z: curZ + dz })) return { x: curX, z: curZ, collided: true };
    }
    if (![curX, curZ, dx, dz].every(Number.isFinite)) {
      throw new Error(`Collision: tọa độ không hợp lệ (${curX}, ${curZ}, ${dx}, ${dz})`);
    }
    if (Math.hypot(dx, dz) > 8) {
      throw new Error('Collision: bước di chuyển vượt 8m/khung hình; chặn vòng lặp quá tải.');
    }
    if (!venue && insideTownFountain(curX,curZ,this.playerRadius)) {
      return {x:TOWN_SPAWN.x,z:TOWN_SPAWN.z,collided:false,recovered:true};
    }
    if (dx === 0 && dz === 0) {
      return { x: curX, z: curZ, collided: false };
    }

    const dist = Math.hypot(dx, dz);
    const maxStep = 0.25; // 25cm max substep prevents tunneling through any thin fence or wall
    if (dist > maxStep) {
      const steps = Math.ceil(dist / maxStep);
      const stepDx = dx / steps;
      const stepDz = dz / steps;
      let currentX = curX;
      let currentZ = curZ;
      let anyCollided = false;

      for (let s = 0; s < steps; s++) {
        const prevX = currentX;
        const prevZ = currentZ;
        const sub = this._resolveSingleStep(currentX, currentZ, stepDx, stepDz, venue);
        currentX = sub.x;
        currentZ = sub.z;
        if (sub.collided) {
          anyCollided = true;
          // If completely stopped on both axes, cannot proceed further
          if (sub.x === prevX && sub.z === prevZ) {
            break;
          }
        }
      }
      return { x: currentX, z: currentZ, collided: anyCollided };
    }

    return this._resolveSingleStep(curX, curZ, dx, dz, venue);
  }

  _resolveSingleStep(curX, curZ, dx, dz, venue) {
    const targetX = curX + dx;
    const targetZ = curZ + dz;

    // 1. Direct move test (ideal path)
    if (!this.isColliding(targetX, targetZ, this.playerRadius, venue)) {
      return { x: targetX, z: targetZ, collided: false };
    }

    // 2. Wall-sliding along horizontal wall (move X only)
    if (dx !== 0 && !this.isColliding(targetX, curZ, this.playerRadius, venue)) {
      return { x: targetX, z: curZ, collided: true };
    }

    // 3. Wall-sliding along vertical wall (move Z only)
    if (dz !== 0 && !this.isColliding(curX, targetZ, this.playerRadius, venue)) {
      return { x: curX, z: targetZ, collided: true };
    }

    // 4. Blocked in a corner: stay at current position smoothly without penetration
    return { x: curX, z: curZ, collided: true };
  }
}
