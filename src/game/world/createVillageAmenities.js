/**
 * createVillageAmenities.js
 * Village Amenities, Community Squares, and Greenbelt Windbreak Forest System for all 12 Villages.
 *
 * Implements:
 * 1. createVillageWell: Ghibli-style mossy stone well with wood canopy and rope bucket.
 * 2. createVillageGazebo: Hexagonal wooden community pavilion with terracotta tile roof & warm lantern.
 * 3. createVillageNoticeBoard: Rustic agricultural signboard with flowerbed base.
 * 4. createVillageGreenbelt: 3-tier windbreak forest enclosing each of the 12 villages,
 *    giving each village a distinctive cozy fairytale atmosphere and eliminating empty border plains.
 */

import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { WORLD_PALETTE, VILLAGE_THEME_GROUPS, createCozyMaterial, createWarmHangingLantern } from './worldDesignSystem.js';
import { WORLD_VILLAGES } from '../../../shared/villageLayout.js';
import { isPointOnRoadCorridor } from './RoadSafetyZone.js';
import { isPointInsideAnyFarmLot } from './FarmSafetyZone.js';
import { MODEL_PATHS, spawnModelSync } from '../rendering/ModelAssetManager.js';
import { FoliageInstancingEngine } from './FoliageInstancingEngine.js';

let amenityIdCounter = 0;

function mat(scene, name, hex, emissiveHex = null, specular = 0.08) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.42);
  m.specularColor = new Color3(specular, specular, specular);
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

/**
 * Creates an ancient stone water well with wooden posts and terracotta roof.
 */
export function createVillageWell(scene, x, z, shadows = null, parent = null) {
  const id = ++amenityIdCounter;
  const root = new TransformNode(`village-well-${id}`, scene);
  root.position.set(x, 0, z);
  if (parent) root.parent = parent;

  const stoneMat = createCozyMaterial(scene, `well-stone-${id}`, WORLD_PALETTE.stoneFoundation);
  const woodMat = createCozyMaterial(scene, `well-wood-${id}`, WORLD_PALETTE.woodOakDark);
  const roofMat = createCozyMaterial(scene, `well-roof-${id}`, WORLD_PALETTE.roofTerracotta);
  const waterMat = mat(scene, `well-water-${id}`, WORLD_PALETTE.waterDeepBlue, WORLD_PALETTE.waterCrystalBlue, 0.4);

  // 1. Bệ giếng đá rêu phong hình tròn kiên cố
  const wellCurb = MeshBuilder.CreateCylinder(`well-curb-${id}`, {
    height: 0.85,
    diameter: 2.2,
    tessellation: 18,
  }, scene);
  wellCurb.position.y = 0.425;
  wellCurb.material = stoneMat;
  wellCurb.parent = root;
  wellCurb.receiveShadows = true;

  // Lòng giếng nước trong vắt lấp lánh
  const waterDisc = MeshBuilder.CreateDisc(`well-water-disc-${id}`, { radius: 0.88, tessellation: 18 }, scene);
  waterDisc.rotation.x = Math.PI / 2;
  waterDisc.position.y = 0.55;
  waterDisc.material = waterMat;
  waterDisc.parent = root;

  // 2. Hai cột trụ gỗ hai bên đỡ mái
  [-0.95, 0.95].forEach((px, i) => {
    const post = MeshBuilder.CreateCylinder(`well-post-${id}-${i}`, { height: 2.4, diameter: 0.16, tessellation: 10 }, scene);
    post.position.set(px, 1.2, 0);
    post.material = woodMat;
    post.parent = root;
  });

  // Xà ngang gỗ trên đỉnh đỡ trục quay dây thừng
  const crossbar = MeshBuilder.CreateBox(`well-crossbar-${id}`, { width: 2.1, height: 0.14, depth: 0.14 }, scene);
  crossbar.position.set(0, 2.25, 0);
  crossbar.material = woodMat;
  crossbar.parent = root;

  // Trục quay dây thừng & thùng gỗ múc nước
  const spool = MeshBuilder.CreateCylinder(`well-spool-${id}`, { height: 0.7, diameter: 0.22, tessellation: 10 }, scene);
  spool.rotation.z = Math.PI / 2;
  spool.position.set(0, 2.1, 0);
  spool.material = mat(scene, `spool-mat-${id}`, '#fde047');
  spool.parent = root;

  const bucket = MeshBuilder.CreateCylinder(`well-bucket-${id}`, { height: 0.4, diameterTop: 0.35, diameterBottom: 0.28, tessellation: 10 }, scene);
  bucket.position.set(0.2, 1.1, 0);
  bucket.material = woodMat;
  bucket.parent = root;

  // 3. Mái ngói đôi chữ A đất nung ấm áp
  const roofL = MeshBuilder.CreateBox(`well-roof-l-${id}`, { width: 2.4, height: 0.1, depth: 1.4 }, scene);
  roofL.position.set(0, 2.7, -0.48);
  roofL.rotation.x = -0.45;
  roofL.material = roofMat;
  roofL.parent = root;

  const roofR = MeshBuilder.CreateBox(`well-roof-r-${id}`, { width: 2.4, height: 0.1, depth: 1.4 }, scene);
  roofR.position.set(0, 2.7, 0.48);
  roofR.rotation.x = 0.45;
  roofR.material = roofMat;
  roofR.parent = root;

  shadows?.addShadowCaster(wellCurb);
  shadows?.addShadowCaster(roofL);
  shadows?.addShadowCaster(roofR);
  return root;
}

/**
 * Creates a hexagonal wooden gazebo pavilion for villagers to relax and socialize.
 */
export function createVillageGazebo(scene, x, z, shadows = null, parent = null) {
  const id = ++amenityIdCounter;
  const root = new TransformNode(`village-gazebo-${id}`, scene);
  root.position.set(x, 0, z);
  if (parent) root.parent = parent;

  const timberMat = createCozyMaterial(scene, `gazebo-timber-${id}`, WORLD_PALETTE.woodOakDark);
  const floorMat = createCozyMaterial(scene, `gazebo-floor-${id}`, WORLD_PALETTE.woodTeak);
  const roofMat = createCozyMaterial(scene, `gazebo-roof-${id}`, WORLD_PALETTE.roofTerracotta);

  // 1. Sàn gỗ nâng cao hình lục giác (diameter: 4.8m)
  const floor = MeshBuilder.CreateCylinder(`gazebo-floor-${id}`, {
    height: 0.24,
    diameter: 4.8,
    tessellation: 6,
  }, scene);
  floor.position.y = 0.12;
  floor.material = floorMat;
  floor.parent = root;
  floor.receiveShadows = true;

  // Bậc bước lên chòi (ở hướng mặt trước z = -2.2)
  const step = MeshBuilder.CreateBox(`gazebo-step-${id}`, { width: 1.6, height: 0.12, depth: 0.6 }, scene);
  step.position.set(0, 0.06, -2.4);
  step.material = floorMat;
  step.parent = root;

  // 2. 6 Cột gỗ tròn ở 6 góc lục giác
  const radius = 2.15;
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const px = Math.cos(angle) * radius;
    const pz = Math.sin(angle) * radius;

    const column = MeshBuilder.CreateCylinder(`gazebo-col-${id}-${i}`, { height: 2.8, diameter: 0.18, tessellation: 12 }, scene);
    column.position.set(px, 1.4, pz);
    column.material = timberMat;
    column.parent = root;
  }

  // 3. Ghế băng gỗ cong quanh các vách (trừ lối vào mặt trước)
  for (let i = 0; i < 6; i++) {
    if (i === 4 || i === 5) continue; // chừa lối vào mặt trước
    const a1 = (i * Math.PI) / 3;
    const a2 = ((i + 1) * Math.PI) / 3;
    const mx = (Math.cos(a1) + Math.cos(a2)) * 0.5 * (radius - 0.35);
    const mz = (Math.sin(a1) + Math.sin(a2)) * 0.5 * (radius - 0.35);

    const bench = MeshBuilder.CreateBox(`gazebo-bench-${id}-${i}`, { width: 1.7, height: 0.08, depth: 0.45 }, scene);
    bench.position.set(mx, 0.45, mz);
    bench.rotation.y = -Math.atan2(Math.sin(a2) - Math.sin(a1), Math.cos(a2) - Math.cos(a1));
    bench.material = timberMat;
    bench.parent = root;
  }

  // 4. Mái ngói chóp nón lục giác Terracotta ấm cúng
  const roof = MeshBuilder.CreateCylinder(`gazebo-roof-${id}`, {
    height: 1.6,
    diameterBottom: 5.4,
    diameterTop: 0.2,
    tessellation: 6,
  }, scene);
  roof.position.y = 3.6;
  roof.material = roofMat;
  roof.parent = root;

  // Đỉnh chóp ngói nhọn trang nhã
  const finial = MeshBuilder.CreateSphere(`gazebo-finial-${id}`, { diameter: 0.35, segments: 8 }, scene);
  finial.position.y = 4.5;
  finial.material = timberMat;
  finial.parent = root;

  // Đèn lồng vàng ấm treo giữa trần chòi
  createWarmHangingLantern(scene, new Vector3(0, 2.65, 0), root, shadows);

  shadows?.addShadowCaster(floor);
  shadows?.addShadowCaster(roof);
  return root;
}

/**
 * Creates a rustic village notice board with a welcoming floral base.
 */
export function createVillageNoticeBoard(scene, x, z, villageName = 'LÀNG HOA MAI', parent = null) {
  const id = ++amenityIdCounter;
  const root = new TransformNode(`village-notice-${id}`, scene);
  root.position.set(x, 0, z);
  if (parent) root.parent = parent;

  const woodMat = createCozyMaterial(scene, `notice-wood-${id}`, WORLD_PALETTE.woodOakDark);

  // 2 Cột gỗ cắm đất
  [-0.9, 0.9].forEach((px, i) => {
    const post = MeshBuilder.CreateCylinder(`notice-post-${id}-${i}`, { height: 2.2, diameter: 0.12, tessellation: 8 }, scene);
    post.position.set(px, 1.1, 0);
    post.material = woodMat;
    post.parent = root;
  });

  // Bảng gỗ lớn có viền
  const board = MeshBuilder.CreateBox(`notice-board-${id}`, { width: 2.1, height: 1.1, depth: 0.1 }, scene);
  board.position.set(0, 1.45, 0);
  board.material = woodMat;
  board.parent = root;

  // Mái che mưa dốc nhỏ trên bảng
  const awning = MeshBuilder.CreateBox(`notice-awning-${id}`, { width: 2.3, height: 0.08, depth: 0.35 }, scene);
  awning.position.set(0, 2.05, 0.05);
  awning.rotation.x = 0.25;
  awning.material = createCozyMaterial(scene, `notice-roof-${id}`, WORLD_PALETTE.roofWarmTile);
  awning.parent = root;

  // Dynamic texture cho nội dung bảng tin
  const dt = new DynamicTexture(`dt-notice-${id}`, { width: 512, height: 256 }, scene, false);
  const ctx = dt.getContext();
  ctx.fillStyle = '#fdf6e2';
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 240);

  ctx.fillStyle = '#78350f';
  ctx.font = 'bold 30px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(villageName, 256, 48);

  ctx.fillStyle = '#475569';
  ctx.font = '600 20px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('• Thời vụ mùa màng: Năng suất +20%', 36, 100);
  ctx.fillText('• Bến xe buýt đón khách: Tuyến siêu tốc', 36, 140);
  ctx.fillText('• Chợ đầu mối: Giao thương nông sản', 36, 180);
  ctx.fillText('• Bình minh an lành · Cư dân đoàn kết', 36, 220);
  dt.update();

  const textMat = new StandardMaterial(`notice-text-mat-${id}`, scene);
  textMat.diffuseTexture = dt;
  textMat.emissiveColor = new Color3(0.3, 0.25, 0.18);

  const display = MeshBuilder.CreatePlane(`notice-display-${id}`, { width: 1.9, height: 0.95 }, scene);
  display.position.set(0, 1.45, -0.06);
  display.material = textMat;
  display.parent = root;

  return root;
}

/**
 * Creates the complete Village Greenbelt Windbreaks and Common Greens for all 12 Villages.
 */
export function createVillageAmenitiesAndGreenbelts(scene, foliage, shadows, foliageInstancing = null) {
  if (!foliageInstancing) foliageInstancing = new FoliageInstancingEngine(scene, shadows);
  const root = new TransformNode('world-village-amenities-and-greenbelts', scene);

  WORLD_VILLAGES.forEach((village) => {
    const { offsetX, offsetZ, name, id } = village;
    const theme = VILLAGE_THEME_GROUPS[id] || {
      treeType: 'oak',
      accentColor: '#f59e0b',
      flowerColor: '#fde047',
    };

    // =========================================================================
    // 1. CÔNG VIÊN & QUẢNG TRƯỜNG SINH HOẠT CỔNG LÀNG (VILLAGE COMMONS PARKLET)
    // Tọa độ trung tâm: (offsetX, offsetZ + 74) tại trạm xe buýt và giếng làng
    // =========================================================================
    const plazaZ = offsetZ + 74;
    const wellX = offsetX - 18.0;
    const gazeboX = offsetX + 18.0;
    const noticeX = offsetX - 12.0;
    const flowerX = offsetX + 12.0;

    if (!isPointOnRoadCorridor(wellX, plazaZ, 3.2) && !isPointInsideAnyFarmLot(wellX, plazaZ, 1.0)) {
      createVillageWell(scene, wellX, plazaZ, shadows, root);
    }
    if (!isPointOnRoadCorridor(gazeboX, plazaZ, 3.2) && !isPointInsideAnyFarmLot(gazeboX, plazaZ, 1.0)) {
      createVillageGazebo(scene, gazeboX, plazaZ, shadows, root);
    }
    if (!isPointOnRoadCorridor(noticeX, plazaZ, 3.2) && !isPointInsideAnyFarmLot(noticeX, plazaZ, 1.0)) {
      createVillageNoticeBoard(scene, noticeX, plazaZ, name, root);
    }

    // 2 Cây bóng mát cổ thụ che chở cho nhà chờ xe buýt và giếng làng
    const treeShadeL = offsetX - 14.0;
    const treeShadeR = offsetX + 14.0;
    if (!isPointOnRoadCorridor(treeShadeL, plazaZ, 3.8) && !isPointInsideAnyFarmLot(treeShadeL, plazaZ, 1.0)) {
      foliageInstancing.spawnTree(theme.treeType, treeShadeL, plazaZ, { scale: 1.45, withShadow: true });
    }
    if (!isPointOnRoadCorridor(treeShadeR, plazaZ, 3.8) && !isPointInsideAnyFarmLot(treeShadeR, plazaZ, 1.0)) {
      foliageInstancing.spawnTree(theme.treeType === 'pine' ? 'oak' : 'pine', treeShadeR, plazaZ, { scale: 1.45, withShadow: true });
    }

    // Luống hoa và bụi cẩm tú cầu ôm chân cột biển báo, giếng làng
    if (!isPointOnRoadCorridor(flowerX, plazaZ, 3.2) && !isPointInsideAnyFarmLot(flowerX, plazaZ, 1.0)) {
      foliage.createFlowerPatch(flowerX, plazaZ, 10, 2.4);
      foliageInstancing.spawnBush(flowerX + 2.0, plazaZ, 1.25);
    }
    if (!isPointOnRoadCorridor(wellX - 2.5, plazaZ + 1.5, 3.0) && !isPointInsideAnyFarmLot(wellX - 2.5, plazaZ + 1.5, 1.0)) {
      foliageInstancing.spawnBush(wellX - 2.5, plazaZ + 1.5, 1.2);
    }

    // Xe kéo nông sản chở bí ngô đỗ bên cạnh lối vào cổng làng
    const cartX = offsetX - 10.0;
    const cartZ = offsetZ + 68;
    if (!isPointOnRoadCorridor(cartX, cartZ, 3.8) && !isPointInsideAnyFarmLot(cartX, cartZ, 1.2)) {
      spawnModelSync(scene, MODEL_PATHS.town.cart, {
        position: new Vector3(cartX, 0, cartZ),
        rotation: new Vector3(0, 0.45, 0),
        scaling: new Vector3(1.2, 1.2, 1.2),
        parent: root,
        name: `village-cart-${id}`,
      });
    }

    // =========================================================================
    // 2. HÀNG CÂY BÓNG MÁT DỌC ĐƯỜNG DẪN VÀO CỔNG LÀNG
    // (x = offsetX ± 9.5m, z: offsetZ + 20 -> offsetZ + 60)
    // =========================================================================
    [offsetZ + 28, offsetZ + 48].forEach(pz => {
      [-9.5, 9.5].forEach(dx => {
        const tx = offsetX + dx;
        if (!isPointOnRoadCorridor(tx, pz, 3.8) && !isPointInsideAnyFarmLot(tx, pz, 1.5)) {
          foliageInstancing.spawnTree(theme.treeType, tx, pz, { scale: 1.35, withShadow: false });
        }
      });
    });

    // =========================================================================
    // 3. VÀNH ĐAI XANH CHẮN GIÓ 3 TẦNG BAO QUANH LƯNG VÀ HAI BÊN HÔNG LÀNG
    // Đặt sát hơn (x = offsetX ± 62m) để người chơi đứng trong làng luôn nhìn thấy rợp bóng cây
    // =========================================================================
    const perimeterTrees = [];

    // Hàng cây phía Tây (x = offsetX - 69m): 8 cây dọc theo hông làng
    for (let r = 0; r < 8; r++) {
      const pz = offsetZ + 95 + r * 22;
      perimeterTrees.push({ x: offsetX - 69, z: pz, scale: 1.35 + (r % 3) * 0.1 });
    }

    // Hàng cây phía Đông (x = offsetX + 69m): 8 cây dọc theo hông làng
    for (let r = 0; r < 8; r++) {
      const pz = offsetZ + 95 + r * 22;
      perimeterTrees.push({ x: offsetX + 69, z: pz, scale: 1.35 + (r % 3) * 0.1 });
    }

    // Hàng cây phía Sau làng (z = offsetZ + 276m): ngang qua lưng làng (chừa bùng binh quay đầu c = 2)
    for (let c = 0; c < 5; c++) {
      if (c === 2) continue; // Tránh trục quay đầu bùng binh
      const px = offsetX - 52 + c * 26;
      perimeterTrees.push({ x: px, z: offsetZ + 276, scale: 1.40 + (c % 3) * 0.1 });
    }

    // Trồng toàn bộ vành đai qua GPU Instancing
    perimeterTrees.forEach((t) => {
      if (!isPointOnRoadCorridor(t.x, t.z, 3.8) && !isPointInsideAnyFarmLot(t.x, t.z, 1.5)) {
        foliageInstancing.spawnTree(theme.treeType, t.x, t.z, { scale: t.scale, withShadow: false });
      }
    });
  });

  return root;
}
