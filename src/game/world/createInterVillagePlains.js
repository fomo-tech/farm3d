/**
 * createInterVillagePlains.js
 * 6 Major Inter-Village Scenic Buffer Landscapes.
 * Completely eliminates empty, flat, barren expanses between villages across the entire 1400m x 1200m world map.
 *
 * 1. West Windmill & Sheep Pasture (between Hoa Mai & Đồi Gió, x ~ -450)
 * 2. Golden Maple & Apple Valley (between Bình Minh & Ven Sông, x ~ 150)
 * 3. Sunny Sunflower Prairie & Orange Grove (between Ven Sông & An Nhiên, x ~ 450)
 * 4. Highland Pine Forest & Granite Rock Valley (Northern Plateau, z ~ -180)
 * 5. North Tea Hills & Rural Retreat (around Phú Điền, z ~ -440)
 * 6. Southern Summer Plains & Camping Grounds (between Thu Phong & Hướng Dương, z ~ 480)
 */

import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { MODEL_PATHS, spawnModelSync } from '../rendering/ModelAssetManager.js';
import { WORLD_PALETTE, createCozyMaterial } from './worldDesignSystem.js';
import { isPointOnRoadCorridor } from './RoadSafetyZone.js';
import { isPointInsideAnyFarmLot } from './FarmSafetyZone.js';

function mat(scene, name, hex, emissiveHex = null, specular = 0.08) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.42);
  m.specularColor = new Color3(specular, specular, specular);
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

/**
 * Creates the 6 Major Inter-Village Landscapes.
 */
export function createInterVillagePlains(scene, foliage, shadows) {
  const root = new TransformNode('world-inter-village-plains', scene);

  const materials = {
    timber: createCozyMaterial(scene, 'plains-timber', WORLD_PALETTE.woodOakDark),
    stone: createCozyMaterial(scene, 'plains-stone', WORLD_PALETTE.stoneFoundation),
    straw: mat(scene, 'plains-straw', '#fde047', null, 0.05),
    water: mat(scene, 'plains-water', WORLD_PALETTE.waterDeepBlue, WORLD_PALETTE.waterCrystalBlue, 0.5),
  };

  // =========================================================================
  // 1. THẢO NGUYÊN CỐI XAY GIÓ & ĐÀN CỪU (WEST WINDMILL & SHEEP PASTURE)
  // Giữa Hoa Mai (x = -300) và Đồi Gió (x = -600): x = -520 -> -380, z = 125 -> 235
  // =========================================================================
  const westCenter = { x: -450, z: 180 };

  // 2 Cối xay gió gỗ Hà Lan khổng lồ trên đồi cỏ cao (Scale 2.2x uy nghi)
  [-32, 32].forEach((dx, i) => {
    const wx = westCenter.x + dx;
    const wz = westCenter.z + (i === 0 ? -28 : 28);
    if (!isPointOnRoadCorridor(wx, wz, 4.0) && !isPointInsideAnyFarmLot(wx, wz, 2.0)) {
      spawnModelSync(scene, MODEL_PATHS.town.windmill, {
        position: new Vector3(wx, 0, wz),
        rotation: new Vector3(0, 0.4 + i * 0.8, 0),
        scaling: new Vector3(2.2, 2.2, 2.2),
        shadows,
        parent: root,
        name: `west-windmill-${i}`,
      });
    }
  });

  // Hàng rào gỗ bao quanh ô đồng cỏ tự nhiên: đàn cừu & bò sữa gặm cỏ
  const westAnimals = [
    { x: westCenter.x - 22, z: westCenter.z - 12, type: 'alpaca' },
    { x: westCenter.x + 18, z: westCenter.z - 10, type: 'cow' },
    { x: westCenter.x - 12, z: westCenter.z + 22, type: 'alpaca' },
    { x: westCenter.x + 24, z: westCenter.z + 24, type: 'cow' },
  ];
  westAnimals.forEach((a, idx) => {
    if (!isPointOnRoadCorridor(a.x, a.z, 4.0) && !isPointInsideAnyFarmLot(a.x, a.z, 2.0)) {
      spawnModelSync(scene, a.type === 'cow' ? MODEL_PATHS.animals.cow : MODEL_PATHS.animals.alpaca, {
        position: new Vector3(a.x, 0, a.z),
        rotation: new Vector3(0, Math.random() * Math.PI * 2, 0),
        scaling: new Vector3(1.4, 1.4, 1.4),
        parent: root,
        name: `west-animal-${idx}`,
      });
    }
  });

  // Xe kéo nông sản cổ & cuộn rơm vàng
  if (!isPointOnRoadCorridor(westCenter.x, westCenter.z, 4.0) && !isPointInsideAnyFarmLot(westCenter.x, westCenter.z, 2.0)) {
    spawnModelSync(scene, MODEL_PATHS.town.cartHigh, {
      position: new Vector3(westCenter.x, 0, westCenter.z),
      rotation: new Vector3(0, 0.6, 0),
      scaling: new Vector3(1.4, 1.4, 1.4),
      parent: root,
      name: 'west-cart',
    });
  }

  // Lưới rừng cây phong vàng & sồi đại thụ bao bọc thảo nguyên (Lưới đều đặn 26m)
  for (let gx = -520; gx <= -380; gx += 26) {
    for (let gz = 125; gz <= 235; gz += 26) {
      const offsetX = ((gx * 17) % 7) - 3.5;
      const offsetZ = ((gz * 23) % 7) - 3.5;
      const px = gx + offsetX;
      const pz = gz + offsetZ;
      if (!isPointOnRoadCorridor(px, pz, 4.0) && !isPointInsideAnyFarmLot(px, pz, 2.0) && Math.hypot(px - westCenter.x, pz - westCenter.z) > 18) {
        const isMaple = (Math.abs(gx + gz) % 2 === 0);
        if (isMaple) foliage.createGoldenMaple(px, pz, 1.0, true);
        else foliage.createCloudTree(px, pz, 1.0, true);
        foliage.createFlowerPatch(px + 2.5, pz, 8, 2.2);
        if ((gx + gz) % 52 === 0) foliage.createHydrangeaBush(px - 3.2, pz, 1.0, '#fde047');
      }
    }
  }

  // =========================================================================
  // 2. THUNG LŨNG CÂY LÁ VÀNG & VƯỜN TÁO (GOLDEN MAPLE & APPLE VALLEY)
  // Giữa Bình Minh (x = 0) và Ven Sông (x = 300): x = 90 -> 210, z = 125 -> 235
  // =========================================================================
  const valleyCenter = { x: 150, z: 180 };

  // Suối đá cuội tự nhiên có cầu gỗ uốn cong
  if (!isPointOnRoadCorridor(valleyCenter.x, valleyCenter.z, 4.0) && !isPointInsideAnyFarmLot(valleyCenter.x, valleyCenter.z, 2.0)) {
    spawnModelSync(scene, MODEL_PATHS.town.bridgeWood, {
      position: new Vector3(valleyCenter.x, 0.05, valleyCenter.z),
      rotation: new Vector3(0, Math.PI / 4, 0),
      scaling: new Vector3(1.6, 1.6, 1.6),
      parent: root,
      name: 'valley-wood-bridge',
    });
    foliage.createRusticBench(valleyCenter.x - 5.5, valleyCenter.z - 3.8, 0.8);
  }

  // Lưới rừng cây phong lá vàng & sồi đại thụ (Lưới đều đặn 24m)
  for (let gx = 90; gx <= 210; gx += 24) {
    for (let gz = 125; gz <= 235; gz += 24) {
      const offsetX = ((gx * 19) % 6) - 3;
      const offsetZ = ((gz * 31) % 6) - 3;
      const px = gx + offsetX;
      const pz = gz + offsetZ;
      if (!isPointOnRoadCorridor(px, pz, 4.0) && !isPointInsideAnyFarmLot(px, pz, 2.0) && Math.hypot(px - valleyCenter.x, pz - valleyCenter.z) > 14) {
        const isMaple = ((gx + gz) % 2 === 0);
        if (isMaple) foliage.createGoldenMaple(px, pz, 1.0, true);
        else foliage.createCloudTree(px, pz, 1.0, true);
        foliage.createHydrangeaBush(px + 3.0, pz, 1.0, '#f59e0b');
        foliage.createFlowerPatch(px - 2.5, pz, 8, 2.2);
      }
    }
  }

  // =========================================================================
  // 3. THẢO NGUYÊN HOA HƯỚNG DƯƠNG & VƯỜN CAM (SUNNY SUNFLOWER PRAIRIE)
  // Giữa Ven Sông (x = 300) và An Nhiên (x = 600): x = 390 -> 510, z = 125 -> 235
  // =========================================================================
  const eastCenter = { x: 450, z: 180 };

  // Cối xay nước cổ truyền ven đồi cỏ (Scale 1.85x)
  if (!isPointOnRoadCorridor(eastCenter.x - 22, eastCenter.z, 4.0) && !isPointInsideAnyFarmLot(eastCenter.x - 22, eastCenter.z, 2.0)) {
    spawnModelSync(scene, MODEL_PATHS.town.watermill, {
      position: new Vector3(eastCenter.x - 22, 0, eastCenter.z),
      rotation: new Vector3(0, -0.3, 0),
      scaling: new Vector3(1.85, 1.85, 1.85),
      shadows,
      parent: root,
      name: 'east-watermill',
    });
  }

  // Rừng cây & vạt hoa hướng dương vàng rực rỡ + bù nhìn rơm (Lưới đều đặn 24m)
  for (let gx = 390; gx <= 510; gx += 24) {
    for (let gz = 125; gz <= 235; gz += 24) {
      const offsetX = ((gx * 23) % 6) - 3;
      const offsetZ = ((gz * 13) % 6) - 3;
      const px = gx + offsetX;
      const pz = gz + offsetZ;
      if (!isPointOnRoadCorridor(px, pz, 4.0) && !isPointInsideAnyFarmLot(px, pz, 2.0)) {
        if ((gx + gz) % 48 === 0) foliage.createScarecrow(px, pz);
        foliage.createFlowerPatch(px + 2.5, pz, 10, 2.6);
        foliage.createCloudTree(px - 3.5, pz, 1.0, true);
        foliage.createGoldenMaple(px + 3.0, pz + 3.0, 0.95, true);
      }
    }
  }

  // =========================================================================
  // 4. CAO NGUYÊN ĐỒI THÔNG & THUNG LŨNG ĐÁ (HIGHLAND PINE FOREST & ROCKS)
  // Dọc trục Bắc: x từ -520 đến +520, z = -175 đến -195
  // =========================================================================
  for (let hx = -520; hx <= 520; hx += 28) {
    const hz = -185 + ((hx * 13) % 9) - 4.5;
    if (!isPointOnRoadCorridor(hx, hz, 4.0) && !isPointInsideAnyFarmLot(hx, hz, 2.0)) {
      // Rừng thông Alpine sừng sững
      foliage.createAlpinePine(hx, hz, 1.0, true);

      // Xen kẽ các vách đá hoa cương tự nhiên
      if (Math.abs(hx) % 56 === 0) {
        spawnModelSync(scene, MODEL_PATHS.rocks.large, {
          position: new Vector3(hx + 4.5, 0, hz + 2.0),
          scaling: new Vector3(1.4, 1.4, 1.4),
          parent: root,
          name: `highland-rock-${hx}`,
        });
      }


    }
  }

  // =========================================================================
  // 5. THUNG LŨNG ĐỒI CHÈ & LÀNG PHÚ ĐIỀN (NORTH TEA HILLS & RETREAT)
  // Xung quanh Phú Điền: x = -140 đến +140, z = -425 đến -485
  // =========================================================================
  for (let tx = -140; tx <= 140; tx += 26) {
    for (let tz = -425; tz >= -485; tz -= 26) {
      if (!isPointOnRoadCorridor(tx, tz, 4.0) && !isPointInsideAnyFarmLot(tx, tz, 2.0)) {
        foliage.createCloudTree(tx, tz, 1.0, true);
        foliage.createHydrangeaBush(tx + 3.2, tz, 1.0, '#10b981');
        if ((tx + tz) % 52 === 0) {
          foliage.createRusticBench(tx - 3.0, tz, 0.4);
        }
      }
    }
  }

  // =========================================================================
  // 6. BÌNH NGUYÊN DÃ NGOẠI MÙA HÈ PHƯƠNG NAM (SOUTHERN SUMMER PLAINS)
  // Giữa Thu Phong (x = -300) và Hướng Dương (x = 300): z = 460 đến 530
  // =========================================================================
  for (let sx = -240; sx <= 240; sx += 26) {
    const sz = 485 + ((sx * 17) % 25) - 12;
    if (!isPointOnRoadCorridor(sx, sz, 4.0) && !isPointInsideAnyFarmLot(sx, sz, 2.0)) {
      foliage.createTropicalPalm(sx, sz, 1.0, 0.2, true);
      foliage.createFlowerPatch(sx + 3.0, sz, 8, 2.4);
      if (Math.abs(sx) % 78 === 0) {
        spawnModelSync(scene, MODEL_PATHS.animals.alpaca, {
          position: new Vector3(sx - 4.5, 0, sz),
          rotation: new Vector3(0, Math.random() * Math.PI * 2, 0),
          scaling: new Vector3(1.4, 1.4, 1.4),
          parent: root,
          name: `south-alpaca-${sx}`,
        });
      }
      if (Math.abs(sx) % 52 === 0) {
        foliage.createRusticBench(sx, sz - 3.5, 0.3);
      }
    }
  }

  return root;
}
