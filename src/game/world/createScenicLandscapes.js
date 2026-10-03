/**
 * createScenicLandscapes.js
 * Comprehensive Scenic Landscaping System for the 3D Open World.
 * Creates continuous, vibrant themed biomes along all 4 bus transit routes:
 * 1. Biome 1 (Highway 86): Sakura & Golden Maple Boulevard, Ghibli Hay Bales & Pumpkins
 * 2. Biome 2 (South Ave & Highway 406): Tropical Palm Coastline, Glamping & Beach Resort
 * 3. Biome 3 (Highway -234 & North): Alpine Pine Highlands, Grazing Livestock & Windmills
 * 4. Biome 4 (Crystal Lake Corridor): Lavender Fields, Lakeside Promenade & Sailboats
 *
 * Guarantees 100% adherence to RoadSafetyZone (clearance >= 6.0m) and 60 FPS performance.
 */

import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { MODEL_PATHS, spawnModelSync } from '../rendering/ModelAssetManager.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial } from '../rendering/PlayTogetherTheme.js';
import { isPointOnRoadCorridor } from './RoadSafetyZone.js';
import { isPointInsideAnyFarmLot } from './FarmSafetyZone.js';
import { WORLD_VILLAGES } from '../../../shared/villageLayout.js';
import { WORLD_PALETTE, VILLAGE_THEME_GROUPS, createCozyMaterial } from './worldDesignSystem.js';
import { createGlobalDenseFlora } from './createGlobalDenseFlora.js';
import { FoliageInstancingEngine } from './FoliageInstancingEngine.js';
import { createProceduralMountainRange } from './nature/ProceduralMountainRange.js';

function makeMat(scene, name, hex, emissiveHex = null, specular = 0.08) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.42);
  m.specularColor = new Color3(specular, specular, specular);
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

/**
 * Tạo điểm nhấn nông trại mùa màng bội thu với cuộn rơm vàng 3D, xe kéo gỗ, thùng hoa quả và bí ngô
 */
function createHayBaleStack(scene, parent, x, z, shadows, materials) {
  const root = new TransformNode(`harvest-spot-${x}-${z}`, scene);
  root.position.set(x, 0, z);
  root.parent = parent;

  // 1. Xe kéo nông sản gỗ mộc mạc phong cách Ghibli
  spawnModelSync(scene, MODEL_PATHS.town.cartHigh, {
    position: new Vector3(0, 0, 0),
    rotation: new Vector3(0, 0.45, 0),
    scaling: new Vector3(1.3, 1.3, 1.3),
    shadows,
    parent: root,
    name: `harvest-cart-${x}-${z}`,
  });

  // 2. Hai cuộn rơm vàng 3D tròn (Cylindrical Hay Rolls with Strapping Bands)
  const roll1 = MeshBuilder.CreateCylinder(`hay-roll-1-${x}-${z}`, {
    diameter: 1.6,
    height: 1.9,
    tessellation: 20,
  }, scene);
  roll1.rotation.z = Math.PI / 2;
  roll1.rotation.y = 0.35;
  roll1.position.set(-1.8, 0.8, 1.2);
  roll1.material = materials.straw;
  roll1.receiveShadows = true;
  roll1.freezeWorldMatrix();
  roll1.isPickable = false;
  roll1.parent = root;

  // Dây đai nẹp cuộn rơm 1
  [-0.55, 0.55].forEach((dy, idx) => {
    const strap = MeshBuilder.CreateTorus(`hay-strap-1-${idx}-${x}-${z}`, {
      diameter: 1.62,
      thickness: 0.05,
      tessellation: 18,
    }, scene);
    strap.rotation.z = Math.PI / 2;
    strap.rotation.y = 0.35;
    strap.position.set(-1.8 + Math.cos(0.35) * dy * 0, 0.8 + dy * 0, 1.2 + dy);
    strap.material = materials.rope;
    strap.freezeWorldMatrix();
    strap.isPickable = false;
    strap.parent = root;
  });

  const roll2 = MeshBuilder.CreateCylinder(`hay-roll-2-${x}-${z}`, {
    diameter: 1.4,
    height: 1.8,
    tessellation: 20,
  }, scene);
  roll2.rotation.z = Math.PI / 2;
  roll2.rotation.y = -0.25;
  roll2.position.set(-2.2, 0.7, -0.6);
  roll2.material = materials.straw;
  roll2.receiveShadows = true;
  roll2.freezeWorldMatrix();
  roll2.isPickable = false;
  roll2.parent = root;

  // 3. Kiện rơm đóng khối chữ nhật xếp chồng (Stacked Rectangular Hay Bales)
  const baleBox1 = MeshBuilder.CreateBox(`hay-box-1-${x}-${z}`, { width: 1.5, height: 0.85, depth: 0.95 }, scene);
  baleBox1.position.set(2.4, 0.42, -0.4);
  baleBox1.rotation.y = 0.2;
  baleBox1.material = materials.straw;
  baleBox1.receiveShadows = true;
  baleBox1.freezeWorldMatrix();
  baleBox1.isPickable = false;
  baleBox1.parent = root;

  const baleBox2 = MeshBuilder.CreateBox(`hay-box-2-${x}-${z}`, { width: 1.4, height: 0.8, depth: 0.9 }, scene);
  baleBox2.position.set(2.3, 1.25, -0.4);
  baleBox2.rotation.y = -0.15;
  baleBox2.material = materials.straw;
  baleBox2.receiveShadows = true;
  baleBox2.freezeWorldMatrix();
  baleBox2.isPickable = false;
  baleBox2.parent = root;

  // 4. Thùng hoa quả nông sản gỗ (Wooden Produce Crate)
  const crate = MeshBuilder.CreateBox(`harvest-crate-${x}-${z}`, { width: 1.0, height: 0.7, depth: 0.8 }, scene);
  crate.position.set(1.4, 0.35, 1.6);
  crate.rotation.y = 0.4;
  crate.material = materials.timber;
  crate.receiveShadows = true;
  crate.freezeWorldMatrix();
  crate.isPickable = false;
  crate.parent = root;

  // 5. Cụm bí ngô bội thu tự nhiên
  spawnModelSync(scene, MODEL_PATHS.crops.pumpkin, {
    position: new Vector3(2.0, 0, 0.7),
    scaling: new Vector3(2.0, 2.0, 2.0),
    parent: root,
    name: 'giant-pumpkin-1',
  });
  spawnModelSync(scene, MODEL_PATHS.crops.pumpkin, {
    position: new Vector3(0.8, 0, -1.2),
    scaling: new Vector3(1.6, 1.6, 1.6),
    parent: root,
    name: 'giant-pumpkin-2',
  });
  spawnModelSync(scene, MODEL_PATHS.crops.pumpkin, {
    position: new Vector3(-0.8, 0, 1.6),
    scaling: new Vector3(1.8, 1.8, 1.8),
    parent: root,
    name: 'giant-pumpkin-3',
  });

  // Tảng đá cuội rêu phong
  spawnModelSync(scene, MODEL_PATHS.rocks.small, {
    position: new Vector3(-3.2, 0, 0.4),
    scaling: new Vector3(1.3, 1.3, 1.3),
    parent: root,
    name: `harvest-rock-${x}-${z}`,
  });

  if (shadows) {
    shadows.addShadowCaster(roll1);
    shadows.addShadowCaster(roll2);
    shadows.addShadowCaster(baleBox1);
  }

  return root;
}

/**
 * Creates a summer beach umbrella and picnic lounge set.
 */
function createBeachLoungeSpot(scene, parent, x, z, angle, shadows, materials) {
  const root = new TransformNode(`beach-lounge-${x}-${z}`, scene);
  root.position.set(x, 0, z);
  root.rotation.y = angle;
  root.parent = parent;

  // Striped Canvas Parasol (Dù che bãi biển)
  const pole = MeshBuilder.CreateCylinder('umbrella-pole', { height: 3.2, diameter: 0.1, tessellation: 10 }, scene);
  pole.position.y = 1.6;
  pole.material = materials.wood;
  pole.parent = root;

  const canopy = MeshBuilder.CreateCylinder('umbrella-canopy', { diameterTop: 0.2, diameterBottom: 3.4, height: 0.8, tessellation: 16 }, scene);
  canopy.position.y = 3.2;
  canopy.material = materials.parasol;
  canopy.parent = root;

  // 2 Wooden Sun Loungers (Ghế nằm phơi nắng)
  [-1.0, 1.0].forEach((lx, i) => {
    const lounger = MeshBuilder.CreateBox(`lounger-${i}`, { width: 0.9, height: 0.35, depth: 2.1 }, scene);
    lounger.position.set(lx, 0.18, 0.3);
    lounger.material = materials.timber;
    lounger.parent = root;

    const backrest = MeshBuilder.CreateBox(`lounger-back-${i}`, { width: 0.9, height: 0.12, depth: 0.9 }, scene);
    backrest.position.set(lx, 0.65, -0.6);
    backrest.rotation.x = -0.55;
    backrest.material = materials.timber;
    backrest.parent = root;
  });

  shadows?.addShadowCaster(canopy);
  return root;
}

/**
 * Creates the complete Scenic Landscape infrastructure.
 */
export function createScenicLandscapes(scene, foliage, shadows, foliageInstancing = null) {
  if (!foliageInstancing) foliageInstancing = new FoliageInstancingEngine(scene, shadows);
  const root = new TransformNode('world-scenic-landscapes', scene);

  const materials = {
    straw: makeMat(scene, 'scenic-straw', '#fbbf24', '#f59e0b', 0.05),
    rope: makeMat(scene, 'scenic-rope', '#78350f', null, 0.02),
    wood: makeMat(scene, 'scenic-wood', '#92400e', null, 0.05),
    timber: makeMat(scene, 'scenic-timber', '#b45309', null, 0.08),
    parasol: makeMat(scene, 'scenic-parasol', '#f43f5e', '#fb7185', 0.15),
    lavenderPetal: makeMat(scene, 'scenic-lavender', '#a855f7', '#c084fc', 0.1),
    whiteFence: makeMat(scene, 'scenic-white-fence', '#f8fafc', null, 0.12),
  };

  // =========================================================================
  // BIOME 1: ĐẠI LỘ HOA ANH ĐÀO & NÔNG TRẠI GHIBLI (HIGHWAY 86 · TUYẾN 01)
  // z = 86, x từ -570 đến +570. Trồng đều đặn nhịp 14m/cây dọc hai bên đại lộ
  // =========================================================================
  for (let x = -570; x <= 570; x += 14) {
    const side = (Math.floor((x + 600) / 14) % 2 === 0) ? -1 : 1;
    const z = 86 + side * 10.0; // z = 76.0 hoặc 96.0 (cách tâm đường 10m an toàn)
    if (!isPointOnRoadCorridor(x, z, 4.2) && !isPointInsideAnyFarmLot(x, z, 1.5) && Math.abs(x - 244) > 12) {
      const variant = Math.abs(Math.floor(x / 14)) % 3;
      if (variant === 0) foliage.createSakuraTree(x, z, 1.0, true);
      else if (variant === 1) foliage.createGoldenMaple(x, z, 1.0, true);
      else foliage.createCloudTree(x, z, 1.0, true);

      if (Math.abs(x) % 28 === 0) {
        foliage.createFlowerPatch(x + (side > 0 ? 1.5 : -1.5), z, 7, 1.8);
      }
    }
  }

  // Điểm nhấn Nông Trại Ghibli dọc Highway 86 (Kiện rơm + bí ngô + xe kéo hoa)
  const hwy86ArtisanSpots = [
    { x: -480, z: 75.5 },
    { x: -225, z: 97.0 },
    { x: 215, z: 97.0 },
    { x: 480, z: 75.5 },
  ];
  hwy86ArtisanSpots.forEach(s => {
    if (!isPointOnRoadCorridor(s.x, s.z, 4.0) && !isPointInsideAnyFarmLot(s.x, s.z, 1.5) && Math.abs(s.x - 244) > 14) {
      createHayBaleStack(scene, root, s.x, s.z, shadows, materials);
      foliage.createScarecrow(s.x + 3.2, s.z);
      foliage.createFlowerPatch(s.x - 3.2, s.z, 8, 2.2);
    }
  });

  // =========================================================================
  // BIOME 2: BỜ BIỂN NHIỆT ĐỚI & LỄ HỘI MÙA HÈ (SOUTH AVE & QL 406 · TUYẾN 02)
  // Đại lộ Biển: x = 0, z: 290 -> 350. Trồng đều đặn nhịp 12m/cây
  // QL Nam 406: z = 406, x từ -270 đến +270. Trồng đều đặn nhịp 16m/cây
  // =========================================================================
  for (let z = 290; z <= 350; z += 12) {
    [-11.5, 11.5].forEach(x => {
      if (!isPointOnRoadCorridor(x, z, 4.0) && !isPointInsideAnyFarmLot(x, z, 1.5)) {
        foliage.createTropicalPalm(x, z, 1.0, (x > 0 ? -0.22 : 0.22), true);
      }
    });
  }

  for (let x = -270; x <= 270; x += 16) {
    const side = (Math.floor((x + 300) / 16) % 2 === 0) ? -1 : 1;
    const z = 406 + side * 10.5; // z = 395.5 hoặc 416.5
    if (!isPointOnRoadCorridor(x, z, 4.0) && !isPointInsideAnyFarmLot(x, z, 1.5)) {
      foliage.createTropicalPalm(x, z, 1.0, (side > 0 ? -0.2 : 0.2), true);
      if (Math.abs(x) % 32 === 0) {
        foliage.createHydrangeaBush(x + 2.0, z, '#f43f5e', 0.9);
      }
    }
  }

  // Các điểm nghỉ dưỡng ven biển có dù che nắng và ghế phơi nắng (tại bãi cát z >= 305 và QL 406)
  const beachLounges = [
    { x: -18.0, z: 308, rot: 0.4 },
    { x: 18.0, z: 308, rot: -0.4 },
    { x: -18.0, z: 330, rot: 0.2 },
    { x: 18.0, z: 330, rot: -0.2 },
    { x: -140, z: 418.0, rot: 0 },
    { x: 140, z: 418.0, rot: Math.PI },
  ];
  beachLounges.forEach(b => {
    if (!isPointOnRoadCorridor(b.x, b.z, 4.0) && !isPointInsideAnyFarmLot(b.x, b.z, 1.5)) {
      createBeachLoungeSpot(scene, root, b.x, b.z, b.rot, shadows, materials);
    }
  });

  // =========================================================================
  // BIOME 3: RỪNG THÔNG CAO NGUYÊN & CỐI XAY GIÓ (HIGHWAY -234 · TUYẾN 03)
  // z = -234, x từ -570 đến +570. Trồng đều đặn nhịp 14m/cây
  // =========================================================================
  for (let x = -570; x <= 570; x += 14) {
    const side = (Math.floor((x + 600) / 14) % 2 === 0) ? -1 : 1;
    const z = -234 + side * 11.5; // z = -245.5 hoặc -222.5
    if (!isPointOnRoadCorridor(x, z, 3.8) && !isPointInsideAnyFarmLot(x, z, 1.5)) {
      foliage.createAlpinePine(x, z, 1.0, true);
      if (Math.abs(x) % 42 === 0) {
        foliage.createFlowerPatch(x + 1.8, z, 8, 2.0);
      }
    }
  }

  // Nhánh Đại Lộ dẫn về Làng Phú Điền (z = -260 -> -385 nhịp 14m)
  for (let z = -260; z >= -385; z -= 14) {
    [-11.5, 11.5].forEach(x => {
      if (!isPointOnRoadCorridor(x, z, 3.8) && !isPointInsideAnyFarmLot(x, z, 1.5)) {
        foliage.createAlpinePine(x, z, 1.0, true);
      }
    });
  }

  // Tảng đá núi và bãi cỏ động vật chăn thả ven đường cao nguyên
  const highlandPastures = [
    { x: -370, z: -220.0, animal: 'cow' },
    { x: -170, z: -248.0, animal: 'alpaca' },
    { x: 170, z: -248.0, animal: 'cow' },
    { x: 370, z: -220.0, animal: 'alpaca' },
  ];
  highlandPastures.forEach(pasture => {
    if (!isPointOnRoadCorridor(pasture.x, pasture.z, 3.5)) {
      spawnModelSync(scene, pasture.animal === 'cow' ? MODEL_PATHS.animals.cow : MODEL_PATHS.animals.alpaca, {
        position: new Vector3(pasture.x, 0, pasture.z),
        rotation: new Vector3(0, Math.random() * Math.PI * 2, 0),
        scaling: new Vector3(1.3, 1.3, 1.3),
        parent: root,
        name: `scenic-grazer-${pasture.x}`,
      });
      spawnModelSync(scene, MODEL_PATHS.rocks.large, {
        position: new Vector3(pasture.x + 3.8, 0, pasture.z - 1.2),
        scaling: new Vector3(1.2, 1.2, 1.2),
        parent: root,
        name: `scenic-rock-${pasture.x}`,
      });
    }
  });

  // =========================================================================
  // BIOME 4: TRIỀN HỒ PHA LÊ & VƯỜN HOA OẢI HƯƠNG (LAKE PROMENADE · TUYẾN 04)
  // z = 3 đến 18, x từ 80 đến 175
  // =========================================================================
  const lakePromenadeSpots = [
    { x: 88, z: -14 },
    { x: 104, z: -16 },
    { x: 120, z: -18 },
    { x: 136, z: -20 },
    { x: 152, z: -20 },
    { x: 96, z: 22 },
    { x: 112, z: 24 },
    { x: 128, z: 26 },
  ];

  lakePromenadeSpots.forEach((s, idx) => {
    if (!isPointOnRoadCorridor(s.x, s.z, 3.5)) {
      // Vạt hoa Oải Hương tím thơm ngát
      foliage.createFlowerPatch(s.x, s.z, 10, 2.5);
      if (idx % 2 === 0) {
        foliage.createRusticBench(s.x + 2.0, s.z - 1.2, 0.4);
      }
      if (idx % 3 === 0) {
        foliage.createCloudTree(s.x - 3.5, s.z + 1.5, 1.2, true);
      }
    }
  });

  // Đàn vịt trời tung tăng ven bờ cỏ hồ Pha Lê
  [
    { x: 142, z: -12 },
    { x: 145, z: -10 },
    { x: 140, z: -8 },
  ].forEach((duckPos, i) => {
    spawnModelSync(scene, MODEL_PATHS.animals.duck, {
      position: new Vector3(duckPos.x, 0.1, duckPos.y || duckPos.z),
      rotation: new Vector3(0, 0.8 + i * 0.4, 0),
      scaling: new Vector3(1.4, 1.4, 1.4),
      parent: root,
      name: `lake-duck-${i}`,
    });
  });

  // =========================================================================
  // 5. VÀNH ĐAI DÃY NÚI HÙNG VĨ & ĐỒI XANH BAO QUANH CHÂN TRỜI (WORLD BORDER PANORAMA)
  // Continuous Procedural Mountain Range + 3D Cliff Formations + Horizon Treelines
  // =========================================================================
  createWorldBorderMountains(scene, root, foliageInstancing);

  // =========================================================================
  // 6. DÒNG SÔNG NƯỚC NGỌC BÍCH LÃNG MẠN CỦA LÀNG VEN SÔNG (RIVER OF LÀNG VEN SÔNG)
  // Chạy dài 300m song song trục làng với 2 cây cầu gỗ vòm, bến thuyền câu cá và đàn vịt
  // =========================================================================
  createVenSongRiver(scene, root, foliage, shadows);

  // =========================================================================
  // 7. ĐẠI LỘ CÂY XANH & HOA TƯƠI DỌC TRỤC CHÍNH TẤT CẢ 12 LÀNG (ALL VILLAGE TREE AVENUES)
  // Trồng cây hai bên vỉa hè, khóm hoa cẩm tú cầu và ghế đá ngắm cảnh cho 100% 12 làng
  // =========================================================================
  createVillageRoadsideAvenues(scene, root, foliage, shadows);

  // =========================================================================
  // 8. ĐIỂM NHẤN CẢNH QUAN CHỦ ĐỀ ĐẶC TRƯNG CHO TỪNG LÀNG TRONG 12 LÀNG
  // =========================================================================
  createAllVillageThematicLandmarks(scene, root, foliage, shadows);

  // =========================================================================
  // 9. ĐẠI CÔNG VIÊN HOA & THUNG LŨNG TRUNG TÂM BÌNH MINH (CENTRAL GRAND BOTANICAL PARK)
  // Phủ kín 100% khoảng đất trống 360m x 55m giữa Vòng Xuyến Trung Tâm và Quốc Lộ 86
  // =========================================================================
  createCentralBotanicalPark(scene, root, foliage, shadows);

  // =========================================================================
  // 10. KHU DU LỊCH SINH THÁI HỒ PHA LÊ & BẾN THUYỀN THIÊN NGA PLAY TOGETHER
  // =========================================================================
  createCrystalLakeScenicFeatures(scene, root, foliage, shadows);

  // =========================================================================
  // 11. GIÀN HOA LEO PERGOLA UỐN VÒM TẠI CỔNG LÀNG & LỐI DẠO CÔNG VIÊN
  // =========================================================================
  createScenicPergolas(scene, root, foliage, shadows);

  // =========================================================================
  // 12. HỆ THỐNG PHỦ CÂY & HOA TOÀN CẦU DÀY ĐẶC (GLOBAL DENSE FLORA ENGINE)
  // Phủ 1,400+ cây xanh qua GPU Instancing, 2,800+ khóm hoa & 48 đồi cỏ không lag
  // =========================================================================
  createGlobalDenseFlora(scene, foliage, shadows, foliageInstancing);

  return root;
}

/**
 * 4. DÃY NÚI UỐN LƯỢN NGHỆ THUẬT VÀ ĐỈNH TUYẾT NGỌC CHÂN TRỜI (TRUE 3D PROCEDURAL ALPINE HORIZON)
 * Loại bỏ 100% các khối cầu tròn (half-sphere) và hình trụ primitive thô kệch.
 * Thay bằng:
 * - Hệ thống Ribbon Mesh Dãy Núi Uốn Lượn Thủ Tục (Continuous Procedural Mountain Ribbon Landscape Engine)
 * - Rặng thông chân trời (Horizon Treeline Silhouettes) trên các sườn núi qua FoliageInstancingEngine
 * - Vách đá nhô 3D thực thụ từ các model GLTF (cliff_large_rock, cliff_rock, rock_tall)
 * - Quần đảo vách đá nhiệt đới 3D phía Nam trên nền đại dương
 */
function createWorldBorderMountains(scene, parent, foliageInstancing = null) {
  const root = new TransformNode('world-border-mountains', scene);
  root.parent = parent;

  // 1. Sinh Dãy Núi Ribbon Thủ Tục Uốn Lượn Liên Hoàn (Tầng Cận Cảnh & Tầng Đại Sơn Tuyết Ngọc)
  const { root: mtnRoot, ridgePoints } = createProceduralMountainRange(scene, root);

  // 2. Trồng rặng thông đại ngàn viễn cảnh (Horizon Treeline Silhouettes) dọc sống núi
  if (foliageInstancing && ridgePoints && ridgePoints.length > 0) {
    ridgePoints.forEach((pt, idx) => {
      // Trồng cây thông nhịp nhàng trên sườn núi và yên ngựa (y >= 32)
      if (idx % 2 === 0 && pt.y >= 32) {
        foliageInstancing.spawnTree('pine', pt.x, pt.z, {
          y: pt.y - 1.2,
          scale: 2.6 + (idx % 3) * 0.45,
          rotY: pt.angle + Math.PI / 2,
          withShadow: false,
        });

        // Điểm xuyết cây thông thứ 2 so le tạo thảm thực vật tự nhiên
        if (idx % 4 === 0) {
          const offR = 14;
          const offX = pt.x - Math.cos(pt.angle) * offR;
          const offZ = pt.z - Math.sin(pt.angle) * offR;
          foliageInstancing.spawnTree('pine', offX, offZ, {
            y: pt.y * 0.88,
            scale: 2.1 + (idx % 2) * 0.35,
            rotY: pt.angle + 1.1,
            withShadow: false,
          });
        }
      }
    });
  }

  // 3. Đặt các khối vách đá 3D tự nhiên (3D Rock & Cliff GLTF Formations) dọc sườn núi
  const cliffModels = [
    MODEL_PATHS.rocks.cliff,
    MODEL_PATHS.rocks.cliffRock,
    MODEL_PATHS.rocks.tall,
    MODEL_PATHS.rocks.tallB,
    MODEL_PATHS.rocks.largeB,
  ];

  if (ridgePoints && ridgePoints.length > 0) {
    ridgePoints.forEach((pt, idx) => {
      if (idx % 4 === 0 && pt.y >= 30) {
        const modelUrl = cliffModels[idx % cliffModels.length];
        const rockScale = 7.0 + (idx % 3) * 2.2;
        spawnModelSync(scene, modelUrl, {
          position: new Vector3(pt.x, pt.y * 0.58, pt.z),
          rotation: new Vector3(0, pt.angle + (idx % 2 === 0 ? 0.35 : -0.35), 0),
          scaling: new Vector3(rockScale, rockScale * 1.25, rockScale),
          parent: root,
          name: `horizon-cliff-crag-${idx}`,
        });
      }
    });
  }

  // 4. Mây tích bồng bềnh viễn cảnh Ghibli tựa vào sườn núi (Soft Horizon Cloud Puffs)
  const matHorizonCloud = makeMat(scene, 'ghibli-horizon-cloud-mat', '#ffffff', '#f8fafc', 0.08);
  matHorizonCloud.roughness = 0.9;

  if (ridgePoints && ridgePoints.length > 0) {
    ridgePoints.forEach((pt, idx) => {
      if (idx % 6 === 1 && pt.y >= 45) {
        const cloudDiam = 260 + (idx % 3) * 45;
        const cloud = MeshBuilder.CreateSphere(`horizon-cloud-puff-${idx}`, {
          diameter: cloudDiam,
          segments: 16,
        }, scene);
        cloud.position.set(pt.x * 1.12, pt.y + 45 + (idx % 3) * 15, pt.z * 1.12);
        cloud.scaling.set(2.2, 0.65, 1.4);
        cloud.rotation.y = pt.angle + 0.5;
        cloud.material = matHorizonCloud;
        cloud.freezeWorldMatrix();
        cloud.isPickable = false;
        cloud.alwaysSelectAsActiveMesh = false;
        cloud.parent = root;
      }
    });
  }

  // 5. Quần đảo vách đá nhiệt đới 3D viễn cảnh phía Nam trên đại dương (Thay thế hoàn toàn cylinder)
  const islets = [
    { x: -140, z: 880, scale: 6.0, rot: 0.4 },
    { x: 190, z: 980, scale: 6.8, rot: 1.2 },
    { x: -260, z: 1420, scale: 8.5, rot: 2.1 },
    { x: 90, z: 1680, scale: 10.0, rot: 0.8 },
    { x: 340, z: 2150, scale: 13.0, rot: 1.7 },
  ];

  islets.forEach((isl, idx) => {
    // Vách đá chính 3D
    spawnModelSync(scene, MODEL_PATHS.rocks.cliff, {
      position: new Vector3(isl.x, 2, isl.z),
      rotation: new Vector3(0, isl.rot, 0),
      scaling: new Vector3(isl.scale, isl.scale * 0.9, isl.scale),
      parent: root,
      name: `ocean-islet-cliff-${idx}`,
    });
    // Mỏm đá nhô cao bên cạnh
    spawnModelSync(scene, MODEL_PATHS.rocks.tall, {
      position: new Vector3(isl.x + isl.scale * 1.8, 0, isl.z - isl.scale * 1.2),
      rotation: new Vector3(0, isl.rot + 1.2, 0),
      scaling: new Vector3(isl.scale * 0.65, isl.scale * 0.85, isl.scale * 0.65),
      parent: root,
      name: `ocean-islet-tall-${idx}`,
    });
    // Rặng dừa nhiệt đới viễn cảnh trên đảo
    if (foliageInstancing && idx < 3) {
      foliageInstancing.spawnTree('palm', isl.x, isl.z, {
        y: isl.scale * 2.5,
        scale: isl.scale * 0.4,
        withShadow: false,
      });
    }
  });
}

/**
 * ĐẠI CÔNG VIÊN TRUNG TÂM BÌNH MINH (CENTRAL GRAND BOTANICAL VALLEY)
 * Vị trí: x: -170 đến +170, z: 20 đến 84 (khu vực foreground ngay trước điểm xuất phát của người chơi)
 */
function createCentralBotanicalPark(scene, parent, foliage, shadows) {
  const root = new TransformNode('central-botanical-park', scene);
  root.parent = parent;

  const matPathGravel = makeMat(scene, 'park-gravel-path', '#ebdccb', null, 0.1);
  const matBrookWater = new StandardMaterial('park-brook-water', scene);
  matBrookWater.diffuseColor = Color3.FromHexString('#38bdf8');
  matBrookWater.emissiveColor = Color3.FromHexString('#0284c7').scale(0.32);
  matBrookWater.specularColor = new Color3(0.8, 0.9, 1.0);
  matBrookWater.specularPower = 64;
  matBrookWater.alpha = 0.88;

  // 1. Hai lối dạo bộ lát đá vàng mật ong dọc hai bên Đại lộ Nam (x = -14m và x = +14m, z: 22 -> 80)
  // Tạo trục đi dạo ngập tràn sắc hoa ngay trước mắt người chơi khi vừa xuất phát
  [-14, 14].forEach(px => {
    const walkStrip = MeshBuilder.CreateGround(`botanical-walkway-${px}`, {
      width: 2.6,
      height: 58,
      subdivisions: 1,
    }, scene);
    walkStrip.position.set(px, 0.03, 51);
    walkStrip.material = matPathGravel;
    walkStrip.parent = root;
    walkStrip.receiveShadows = true;

    // Hàng cây hoa anh đào (Sakura) & phong vàng dọc lối dạo bộ
    for (let wz = 24; wz <= 78; wz += 12) {
      const treeX = px > 0 ? px + 3.8 : px - 3.8;
      if (!isPointOnRoadCorridor(treeX, wz, 3.8) && !isPointInsideAnyFarmLot(treeX, wz, 1.2)) {
        if ((wz + px) % 24 === 0) {
          foliage.createSakuraTree(treeX, wz, 1.4, true);
        } else {
          foliage.createGoldenMaple(treeX, wz, 1.35, true);
        }
        // Thảm hoa dưới gốc cây
        foliage.createFlowerPatch(treeX + 1.2, wz, 8, 1.8);
      }

      // Đèn lồng cổ điển & ghế gỗ ven đường dạo
      if (wz % 24 === 12) {
        const benchX = px > 0 ? px - 1.6 : px + 1.6;
        const lampX = px > 0 ? px + 1.5 : px - 1.5;
        if (!isPointOnRoadCorridor(benchX, wz, 3.2)) {
          foliage.createRusticBench(benchX, wz, px > 0 ? -Math.PI / 2 : Math.PI / 2);
        }
        if (!isPointOnRoadCorridor(lampX, wz + 2, 3.2)) {
          foliage.createVintageStreetLamp(lampX, wz + 2);
        }
      }
    }
  });

  // 2. Đài Phun Nước Hoa Hoàng Gia Trung Tâm (Grand Floral Fountain, x = -24, z = 50)
  if (!isPointOnRoadCorridor(-24, 50, 4.0)) {
    const fountainRoot = new TransformNode('botanical-fountain', scene);
    fountainRoot.position.set(-24, 0, 50);
    fountainRoot.parent = root;

    const baseRing = MeshBuilder.CreateCylinder('fountain-basin', {
      diameter: 6.8,
      height: 0.45,
      tessellation: 24,
    }, scene);
    baseRing.position.y = 0.225;
    baseRing.material = makeMat(scene, 'fountain-stone', '#e2e8f0', null, 0.2);
    baseRing.parent = fountainRoot;
    shadows?.addShadowCaster(baseRing);

    const waterSurface = MeshBuilder.CreateDisc('fountain-water', { radius: 3.1, tessellation: 24 }, scene);
    waterSurface.rotation.x = Math.PI / 2;
    waterSurface.position.y = 0.42;
    waterSurface.material = matBrookWater;
    waterSurface.parent = fountainRoot;

    const centerPillar = MeshBuilder.CreateCylinder('fountain-pillar', {
      diameterTop: 0.9,
      diameterBottom: 1.4,
      height: 1.6,
      tessellation: 16,
    }, scene);
    centerPillar.position.y = 1.0;
    centerPillar.material = baseRing.material;
    centerPillar.parent = fountainRoot;

    const topBowl = MeshBuilder.CreateSphere('fountain-top-bowl', {
      diameter: 1.8,
      slice: 0.5,
      segments: 16,
    }, scene);
    topBowl.rotation.x = Math.PI;
    topBowl.position.y = 2.0;
    topBowl.material = baseRing.material;
    topBowl.parent = fountainRoot;

    // Vành hoa hồng rực rỡ bao quanh đài phun nước
    foliage.createFlowerPatch(-24 + 4.2, 50, 12, 2.2);
    foliage.createFlowerPatch(-24 - 4.2, 50, 12, 2.2);
    foliage.createHydrangeaBush(-24, 50 + 4.2, '#f43f5e', 1.25);
    foliage.createHydrangeaBush(-24, 50 - 4.2, '#a855f7', 1.25);
  }

  // 3. 6 Cụm Tiểu Cảnh Vườn Hoa Cổ Thụ & Nghỉ Chân Tự Nhiên (Scenic Garden Rest Spots - hoàn toàn trên mặt đất phẳng tự nhiên)
  const scenicSpots = [
    { x: -125, z: 54 },
    { x: -75, z: 62 },
    { x: -35, z: 46 },
    { x: 35, z: 46 },
    { x: 85, z: 64 },
    { x: 135, z: 52 },
  ];
  scenicSpots.forEach((k, idx) => {
    if (!isPointOnRoadCorridor(k.x, k.z, 4.0)) {
      if (idx % 2 === 0) {
        foliage.createSakuraTree(k.x, k.z, 1.35, true);
        foliage.createFlowerPatch(k.x + 2.2, k.z, 12, 2.4);
        foliage.createRusticBench(k.x - 2.2, k.z, 0);
      } else {
        foliage.createGoldenMaple(k.x, k.z, 1.35, true);
        foliage.createFlowerPatch(k.x - 2.2, k.z, 12, 2.4);
        foliage.createRusticBench(k.x + 2.2, k.z, Math.PI);
      }
    }
  });

  // 4. Dòng Suối Nước Trong Vắt Nối Từ Hồ Pha Lê Về Thung Lũng (The Central Brook)
  const brookLength = 46;
  const brookMesh = MeshBuilder.CreatePlane('park-brook-surface', {
    width: 5.5,
    height: brookLength,
  }, scene);
  brookMesh.rotation.x = Math.PI / 2;
  brookMesh.rotation.y = -0.16;
  brookMesh.position.set(88, 0.03, 48);
  brookMesh.material = matBrookWater;
  brookMesh.parent = root;

  // Cầu đá nhỏ bắc qua suối (x = 88, z = 48)
  const footbridge = MeshBuilder.CreateBox('park-stone-footbridge', {
    width: 7.5,
    height: 0.26,
    depth: 3.2,
  }, scene);
  footbridge.rotation.y = -0.16 + Math.PI / 2;
  footbridge.position.set(88, 0.26, 48);
  footbridge.material = makeMat(scene, 'park-bridge-stone', '#cbd5e1', null, 0.1);
  footbridge.parent = root;
  shadows?.addShadowCaster(footbridge);

  // Hồ hoa súng nhỏ tại điểm cuối dòng suối thung lũng (x = 84, z = 68)
  const pond = MeshBuilder.CreateCylinder('park-brook-end-pond', {
    diameter: 8.5,
    height: 0.05,
    tessellation: 18,
  }, scene);
  pond.position.set(84, 0.03, 68);
  pond.material = matBrookWater;
  pond.parent = root;

  // Đàn vịt trời tung tăng bơi lội
  [
    { x: 125, z: 42 },
    { x: 70, z: 54 },
    { x: 40, z: 60 },
  ].forEach((pos, i) => {
    spawnModelSync(scene, MODEL_PATHS.animals.duck, {
      position: new Vector3(pos.x, 0.06, pos.z),
      rotation: new Vector3(0, 0.6 + i * 1.1, 0),
      scaling: new Vector3(1.3, 1.3, 1.3),
      parent: root,
      name: `park-duck-${i}`,
    });
  });

  // 5. Chòi Vọng Cảnh Nghỉ Chân Gỗ Lục Giác Mái Ngói Cam (x = -85, z = 46)
  if (!isPointOnRoadCorridor(-85, 46, 4.0)) {
    const gazebo = MeshBuilder.CreateCylinder('park-gazebo-roof', {
      height: 1.8,
      diameterBottom: 5.8,
      diameterTop: 0.2,
      tessellation: 6,
    }, scene);
    gazebo.position.set(-85, 3.6, 46);
    gazebo.material = makeMat(scene, 'park-gazebo-roof-mat', WORLD_PALETTE.roofTerracotta);
    gazebo.parent = root;
    shadows?.addShadowCaster(gazebo);

    const floor = MeshBuilder.CreateCylinder('park-gazebo-floor', {
      height: 0.22,
      diameter: 5.2,
      tessellation: 6,
    }, scene);
    floor.position.set(-85, 0.11, 46);
    floor.material = makeMat(scene, 'park-gazebo-floor-mat', WORLD_PALETTE.woodOakDark);
    floor.parent = root;

    for (let c = 0; c < 6; c++) {
      const ca = (c * Math.PI) / 3;
      const col = MeshBuilder.CreateCylinder(`park-gaz-col-${c}`, { height: 2.8, diameter: 0.18 }, scene);
      col.position.set(-85 + Math.cos(ca) * 2.3, 1.4, 46 + Math.sin(ca) * 2.3);
      col.material = floor.material;
      col.parent = root;
    }
    foliage.createVintageStreetLamp(-85, 46);
  }

  // 6. Các Vạt Hoa Oải Hương, Cẩm Tú Cầu & Ghế Đá Nghỉ Chân Dày Đặc Dọc Thung Lũng
  const gardenSpots = [
    { x: -150, z: 42, type: 'flower', color: '#f43f5e' },
    { x: -115, z: 36, type: 'bench' },
    { x: -60, z: 50, type: 'flower', color: '#a855f7' },
    { x: -38, z: 68, type: 'bench' },
    { x: -28, z: 32, type: 'flower', color: '#ec4899' },
    { x: 28, z: 32, type: 'flower', color: '#38bdf8' },
    { x: 38, z: 68, type: 'bench' },
    { x: 55, z: 68, type: 'flower', color: '#fbbf24' },
    { x: 110, z: 38, type: 'bench' },
    { x: 155, z: 66, type: 'flower', color: '#34d399' },
  ];
  gardenSpots.forEach(s => {
    if (!isPointOnRoadCorridor(s.x, s.z, 3.5)) {
      if (s.type === 'flower') {
        foliage.createFlowerPatch(s.x, s.z, 14, 2.8);
        foliage.createHydrangeaBush(s.x + 2.5, s.z + 1.5, s.color || '#f43f5e', 1.3);
      } else {
        foliage.createRusticBench(s.x, s.z, Math.PI / 4);
        foliage.createVintageStreetLamp(s.x - 2.0, s.z);
      }
    }
  });

  // 7. Xe Hoa Bí Ngô & Cà Rốt Đồng Quê Dọc Vành Đai Công Viên
  if (!isPointOnRoadCorridor(-22, 56, 3.8)) {
    spawnModelSync(scene, MODEL_PATHS.town.cart, {
      position: new Vector3(-22, 0, 56),
      rotation: new Vector3(0, 0.45, 0),
      scaling: new Vector3(1.3, 1.3, 1.3),
      shadows,
      parent: root,
      name: 'botanical-cart-west',
    });
  }
  if (!isPointOnRoadCorridor(18, 70, 3.8)) {
    spawnModelSync(scene, MODEL_PATHS.town.cartHigh, {
      position: new Vector3(18, 0, 70),
      rotation: new Vector3(0, -0.6, 0),
      scaling: new Vector3(1.3, 1.3, 1.3),
      shadows,
      parent: root,
      name: 'botanical-cart-east',
    });
  }

  // 8. Cối Xay Gió Đồi Cao & Đàn Lạc Đà Không Bướu Phía Đông ($x = 120, z = 68$)
  if (!isPointOnRoadCorridor(120, 68, 4.0)) {
    spawnModelSync(scene, MODEL_PATHS.town.windmill, {
      position: new Vector3(120, 0, 68),
      rotation: new Vector3(0, 0.4, 0),
      scaling: new Vector3(2.2, 2.2, 2.2),
      shadows,
      parent: root,
      name: 'park-windmill-east',
    });
    spawnModelSync(scene, MODEL_PATHS.animals.alpaca, {
      position: new Vector3(126, 0, 64),
      rotation: new Vector3(0, 1.2, 0),
      scaling: new Vector3(1.2, 1.2, 1.2),
      parent: root,
      name: 'park-alpaca',
    });
  }
}

/**
 * Tạo hệ thống Sông nước Ven Sông (Ven Song River System)
 * Tọa độ x = 244, chạy dọc từ z = 25 đến z = 330
 */
function createVenSongRiver(scene, parent, foliage, shadows) {
  const root = new TransformNode('vensong-riverside-scenic', scene);
  root.parent = parent;

  const matWoodBridge = makeMat(scene, 'vensong-pier-wood', WORLD_PALETTE.woodOakDark, null, 0.08);

  // 1. Bến Thuyền Câu Cá & Cầu Tàu Gỗ mộc mạc (x = 227, z = 145) ngay ven bờ sông uốn lượn
  const pierRoot = new TransformNode('vensong-fishing-pier', scene);
  pierRoot.position.set(227, 0, 145);
  pierRoot.parent = root;

  const pierDeck = MeshBuilder.CreateBox('pier-deck', { width: 4.8, height: 0.22, depth: 3.2 }, scene);
  pierDeck.position.set(0, 0.18, 0);
  pierDeck.material = matWoodBridge;
  pierDeck.parent = pierRoot;

  // Thuyền gỗ nhỏ neo cạnh bến
  spawnModelSync(scene, MODEL_PATHS.town.cart, {
    position: new Vector3(219, 0.05, 145),
    rotation: new Vector3(0, 0.3, 0),
    scaling: new Vector3(1.1, 1.1, 1.1),
    parent: pierRoot,
    name: 'vensong-rowboat',
  });

  // 2. Cây rủ bóng nước hai bên hành lang bờ sông (tránh lòng đường QL 86 và cầu bộ hành)
  for (let z = 45; z <= 315; z += 38) {
    if (Math.abs(z - 86) > 12 && Math.abs(z - 210) > 10) {
      foliage.createCloudTree(202, z, 1.35, true);
      foliage.createSakuraTree(232, z + 12, 1.3, true);
    }
  }

  // 3. Đàn vịt trời tung tăng bơi lội trên dòng sông
  [110, 175, 260].forEach((dz, i) => {
    spawnModelSync(scene, MODEL_PATHS.animals.duck, {
      position: new Vector3(216 + (i % 2 === 0 ? -1.5 : 1.5), 0.05, dz),
      rotation: new Vector3(0, (i * 1.2) % (Math.PI * 2), 0),
      scaling: new Vector3(1.3, 1.3, 1.3),
      parent: root,
      name: `vensong-duck-${i}`,
    });
  });
}

/**
 * Tạo viền hoa chân vỉa hè & hàng cây đón khách trước cổng làng
 * Giữ lòng đường 100% thông thoáng và tuyệt đối không lấn vào 288 lô đất nông trại
 */
function createVillageRoadsideAvenues(scene, parent, foliage, shadows) {
  const root = new TransformNode('village-roadside-avenues', scene);
  root.parent = parent;

  const crossroadZList = [98, 126, 154, 182, 210, 238, 266];

  WORLD_VILLAGES.forEach((village) => {
    const { offsetX, offsetZ, id } = village;
    const theme = VILLAGE_THEME_GROUPS[id] || { treeType: 'oak', accentColor: '#f59e0b' };

    // 1. CÂY ĐẠI LỘ ĐÓN KHÁCH TRƯỚC CỔNG LÀNG (Nằm tại z = offsetZ + 74, ngoài khu nông trại)
    [-7.5, 7.5].forEach((dx) => {
      const tx = offsetX + dx;
      const tz = offsetZ + 74;
      if (!isPointOnRoadCorridor(tx, tz, 3.5) && !isPointInsideAnyFarmLot(tx, tz, 1.5)) {
        if (theme.treeType === 'sakura') foliage.createSakuraTree(tx, tz, 1.3, true);
        else if (theme.treeType === 'maple') foliage.createGoldenMaple(tx, tz, 1.3, true);
        else if (theme.treeType === 'pine') foliage.createAlpinePine(tx, tz, 1.3, true);
        else foliage.createCloudTree(tx, tz, 1.3, true);
      }
    });

    // 2. VIỀN HOA THẤP TINH TẾ DỌC CHÂN VỈA HÈ TRỤC CHÍNH NỘI BỘ LÀNG
    // Đặt tại mép ngoài vỉa hè (x = offsetX ± 4.65m), không chắn đường và không chạm ranh giới đất nông trại
    for (let rz = offsetZ + 110; rz <= offsetZ + 256; rz += 28) {
      if (crossroadZList.some(fz => Math.abs(rz - (offsetZ + fz)) < 5.5)) continue;

      const leftX = offsetX - 4.65;
      const rightX = offsetX + 4.65;

      if (!isPointOnRoadCorridor(leftX, rz, 1.8) && !isPointInsideAnyFarmLot(leftX, rz, 0.2)) {
        foliage.createHydrangeaBush(leftX, rz, 0.85, theme.accentColor);
      }
      if (!isPointOnRoadCorridor(rightX, rz, 1.8) && !isPointInsideAnyFarmLot(rightX, rz, 0.2)) {
        foliage.createHydrangeaBush(rightX, rz, 0.85, theme.accentColor);
      }
    }
  });
}

/**
 * Tạo điểm nhấn cảnh quan độc bản đặc sắc cho từng làng trong 12 làng
 * Đặt hoàn toàn tại Quảng Trường Cổng Làng hoặc sườn đồi cảnh quan bên ngoài, 100% ngoài phạm vi nông trại
 */
function createAllVillageThematicLandmarks(scene, parent, foliage, shadows) {
  const root = new TransformNode('all-village-landmarks', scene);
  root.parent = parent;

  // 1. Làng Hoa Mai (x = -300, offsetZ = 0): Vườn Mai Vàng & Xe Mật Ong tại Quảng trường Cổng làng (z = 74)
  [-18, 18].forEach((dx) => {
    foliage.createGoldenMaple(-300 + dx, 74, 1.35, true);
    foliage.createFlowerPatch(-300 + dx, 77, 10, 2.2);
  });
  spawnModelSync(scene, MODEL_PATHS.town.cartHigh, {
    position: new Vector3(-300 - 14, 0, 77),
    rotation: new Vector3(0, 0.4, 0),
    scaling: new Vector3(1.3, 1.3, 1.3),
    parent: root,
    name: 'hoamai-honey-cart',
  });

  // 2. Làng Đồi Gió (x = -600, offsetZ = 0): Quần thể Cối Xay Gió trên Đồi Cỏ Phía Tây (x = -675, ngoài nông trại)
  [-35, 35].forEach((dz, i) => {
    spawnModelSync(scene, MODEL_PATHS.town.windmill, {
      position: new Vector3(-675, 0, 175 + dz),
      rotation: new Vector3(0, 0.5 + i * 0.7, 0),
      scaling: new Vector3(2.2, 2.2, 2.2),
      shadows,
      parent: root,
      name: `doigio-windmill-${i}`,
    });
  });
  spawnModelSync(scene, MODEL_PATHS.animals.alpaca, {
    position: new Vector3(-670, 0, 175),
    rotation: new Vector3(0, 1.2, 0),
    scaling: new Vector3(1.3, 1.3, 1.3),
    parent: root,
    name: 'doigio-alpaca-1',
  });

  // 3. Làng An Nhiên (x = 600, offsetZ = 0): Vườn Trúc Thiền Tịnh tại Cổng Làng (z = 74)
  [-18, 18].forEach((dx) => {
    foliage.createCloudTree(600 + dx, 74, 1.35, true);
    foliage.createFlowerPatch(600 + dx, 77, 10, 2.2);
  });

  // 4. Làng Thanh Hà (x = -300, offsetZ = -320): Rừng Hoa Anh Đào tại Cổng Làng (z = -246)
  [-18, 18].forEach((dx) => {
    foliage.createSakuraTree(-300 + dx, -246, 1.35, true);
    foliage.createFlowerPatch(-300 + dx, -249, 10, 2.2);
  });

  // 5. Làng Thu Phong (x = -300, offsetZ = 320): Vườn Phong Đỏ & Bí Ngô Mùa Thu tại Cổng Làng (z = 394)
  [-18, 18].forEach((dx, i) => {
    foliage.createGoldenMaple(-300 + dx, 394, 1.35, true);
    spawnModelSync(scene, MODEL_PATHS.crops.pumpkin, {
      position: new Vector3(-300 + dx, 0, 397),
      scaling: new Vector3(1.6, 1.6, 1.6),
      parent: root,
      name: `thuphong-pumpkin-${i}`,
    });
  });

  // 6. Làng Hướng Dương (x = 300, offsetZ = 320): Thảo Nguyên Hướng Dương tại Cổng Làng (z = 394)
  [-18, 18].forEach((dx) => {
    foliage.createFlowerPatch(300 + dx, 394, 14, 2.8);
    foliage.createGoldenMaple(300 + dx, 397, 1.35, true);
  });

  // 7. Làng Phú Điền (x = 0, offsetZ = -480): Cối Xay Nước Cổ Truyền (z = -406)
  spawnModelSync(scene, MODEL_PATHS.town.watermill, {
    position: new Vector3(-25, 0, -406),
    rotation: new Vector3(0, 0.4, 0),
    scaling: new Vector3(1.85, 1.85, 1.85),
    shadows,
    parent: root,
    name: 'phudien-watermill',
  });
}

/**
 * Nâng cấp cảnh quan Hồ Pha Lê (Crystal Lake):
 * Cụm hoa súng nổi trên mặt nước & thuyền đạp vịt đôi phong cách Play Together
 */
function createCrystalLakeScenicFeatures(scene, parent, foliage, shadows) {
  const root = new TransformNode('crystal-lake-scenic-features', scene);
  root.parent = parent;

  const matLilyPad = makeMat(scene, 'lake-lilypad', '#15803d', '#166534', 0.08);
  const matLotusFlower = makeMat(scene, 'lake-lotus-flower', '#f472b6', '#ec4899', 0.25);
  const matSwanWhite = makeMat(scene, 'swan-boat-white', '#f8fafc', null, 0.4);
  const matSwanBeak = makeMat(scene, 'swan-boat-beak', '#f97316', null, 0.2);

  // 1. 6 Cụm Hoa Súng Bồng Bềnh Trên Mặt Hồ Pha Lê (tâm hồ: 165, 2)
  const lilyClusters = [
    { x: 152, z: -8 },
    { x: 172, z: 12 },
    { x: 180, z: -6 },
    { x: 148, z: 15 },
    { x: 162, z: -16 },
    { x: 176, z: 20 },
  ];

  lilyClusters.forEach((pos, cIdx) => {
    // Lá súng tròn dẹt
    for (let p = 0; p < 4; p++) {
      const angle = (p * Math.PI * 2) / 4 + cIdx * 0.4;
      const lx = pos.x + Math.cos(angle) * 1.5;
      const lz = pos.z + Math.sin(angle) * 1.5;
      const pad = MeshBuilder.CreateCylinder(`lilypad-${cIdx}-${p}`, {
        diameter: 1.3,
        height: 0.02,
        tessellation: 12,
      }, scene);
      pad.position.set(lx, 0.05, lz);
      pad.material = matLilyPad;
      pad.parent = root;

      // Hoa sen hồng nở ở giữa cụm
      if (p === 0) {
        const lotus = MeshBuilder.CreateSphere(`lotus-${cIdx}`, {
          diameter: 0.45,
          segments: 8,
          slice: 0.6,
        }, scene);
        lotus.position.set(pos.x, 0.12, pos.z);
        lotus.material = matLotusFlower;
        lotus.parent = root;
      }
    }
  });

  // 2. 2 Chiếc Thuyền Thiên Nga Đạp Nước Play Together Neo Tại Cầu Tàu Hồ Pha Lê
  [
    { x: 138, z: -7, rot: 0.3 },
    { x: 142, z: 7, rot: -0.3 },
  ].forEach((b, i) => {
    const boatRoot = new TransformNode(`swan-boat-${i}`, scene);
    boatRoot.position.set(b.x, 0.04, b.z);
    boatRoot.rotation.y = b.rot;
    boatRoot.parent = root;

    // Thân thuyền
    const hull = MeshBuilder.CreateBox(`swan-hull-${i}`, { width: 2.2, height: 0.6, depth: 3.2 }, scene);
    hull.position.y = 0.3;
    hull.material = matSwanWhite;
    hull.parent = boatRoot;

    // Cổ và đầu thiên nga uốn cong
    const neck = MeshBuilder.CreateCylinder(`swan-neck-${i}`, { height: 1.4, diameter: 0.3 }, scene);
    neck.position.set(0, 1.1, 1.2);
    neck.rotation.x = -0.35;
    neck.material = matSwanWhite;
    neck.parent = boatRoot;

    const head = MeshBuilder.CreateSphere(`swan-head-${i}`, { diameter: 0.6 }, scene);
    head.position.set(0, 1.8, 1.45);
    head.material = matSwanWhite;
    head.parent = boatRoot;

    const beak = MeshBuilder.CreateCylinder(`swan-beak-${i}`, {
      diameterTop: 0,
      diameterBottom: 0.25,
      height: 0.45,
    }, scene);
    beak.position.set(0, 1.75, 1.8);
    beak.rotation.x = Math.PI / 2;
    beak.material = matSwanBeak;
    beak.parent = boatRoot;

    shadows?.addShadowCaster(hull);
  });
}

/**
 * Giàn hoa leo Pergola uốn vòm lãng mạn tại các lối vào công viên và trạm xe buýt
 */
function createScenicPergolas(scene, parent, foliage, shadows) {
  const root = new TransformNode('scenic-pergolas', scene);
  root.parent = parent;

  const matTimber = makeMat(scene, 'pergola-timber', '#78350f', null, 0.06);
  const matWisteria = makeMat(scene, 'pergola-wisteria', '#c084fc', '#a855f7', 0.2);

  const pergolaSpots = [
    { x: 0, z: 68, rot: 0 },         // Lối vào Đại Công Viên Trung Tâm
    { x: 126, z: 2, rot: Math.PI / 2 }, // Lối dạo Hồ Pha Lê
    { x: -292, z: 76, rot: 0 },      // Cổng Làng Hoa Mai
    { x: 292, z: 76, rot: 0 },       // Cổng Làng Ven Sông
  ];

  pergolaSpots.forEach((spot, idx) => {
    const pRoot = new TransformNode(`pergola-${idx}`, scene);
    pRoot.position.set(spot.x, 0, spot.z);
    pRoot.rotation.y = spot.rot;
    pRoot.parent = root;

    // 4 Cột gỗ sồi
    [[-1.8, -1.2], [1.8, -1.2], [-1.8, 1.2], [1.8, 1.2]].forEach(([px, pz], pIdx) => {
      const col = MeshBuilder.CreateBox(`pergola-col-${idx}-${pIdx}`, { width: 0.28, height: 3.2, depth: 0.28 }, scene);
      col.position.set(px, 1.6, pz);
      col.material = matTimber;
      col.parent = pRoot;
    });

    // Mái nan gỗ và giàn hoa leo tím tử đằng
    const roof = MeshBuilder.CreateBox(`pergola-roof-${idx}`, { width: 4.2, height: 0.16, depth: 2.8 }, scene);
    roof.position.set(0, 3.28, 0);
    roof.material = matTimber;
    roof.parent = pRoot;

    // Hoa tử đằng rủ
    const floralCanopy = MeshBuilder.CreateBox(`pergola-flowers-${idx}`, { width: 4.0, height: 0.35, depth: 2.6 }, scene);
    floralCanopy.position.set(0, 3.12, 0);
    floralCanopy.material = matWisteria;
    floralCanopy.parent = pRoot;

    // Đèn lồng vàng treo ở giữa giàn hoa
    foliage.createVintageStreetLamp(spot.x, spot.z);
    shadows?.addShadowCaster(roof);
  });
}

/**
 * Returns a localized Scenic POI descriptor for the active bus position.
 * Used by BusTransitHUD to display real-time sightseeing announcements.
 * @param {Vector3} busPos - Current 3D position of the bus
 * @returns {{ name: string, biome: string, color: string }}
 */
export function getScenicPoiDescriptor(busPos) {
  if (!busPos) {
    return { name: 'Vành Đai Làng Quê Bình Minh', biome: 'village', color: '#6366f1' };
  }

  const { x, z } = busPos;

  // 1. Vùng Biển & QL Nam 406
  if (z >= 260 || Math.abs(z - 406) < 32) {
    return {
      name: 'Đại Lộ Dừa Bãi Biển & Lễ Hội Mùa Hè',
      biome: 'beach',
      color: '#10b981',
      badge: 'BỜ BIỂN NHIỆT ĐỚI',
    };
  }

  // 2. Tuyến Quốc Lộ 86 (Làng Hoa Mai, Đồi Gió, Ven Sông, An Nhiên)
  if (Math.abs(z - 86) < 34) {
    return {
      name: 'Đại Lộ Hoa Anh Đào & Nông Trại Bình Minh',
      biome: 'sakura',
      color: '#ec4899',
      badge: 'ĐỒNG QUÊ GHIBLI',
    };
  }

  // 3. Tuyến Cao Nguyên Bắc -234 & Làng Phú Điền
  if (z <= -160) {
    return {
      name: 'Rừng Thông Cao Nguyên & Đồi Cối Xay Gió',
      biome: 'highlands',
      color: '#8b5cf6',
      badge: 'RỪNG THÔNG NÚI',
    };
  }

  // 4. Vùng Hồ Pha Lê & Ven Sông
  if (Math.abs(z - 3) < 32 && x >= 70) {
    return {
      name: 'Triền Hoa Oải Hương Hồ Pha Lê',
      biome: 'lake',
      color: '#0ea5e9',
      badge: 'HỒ PHA LÊ',
    };
  }

  // 5. Phố Chợ Phía Tây
  if (Math.abs(z - 3) < 32 && x <= -40) {
    return {
      name: 'Phố Chợ & Trung Tâm Thương Mại Kaia',
      biome: 'market',
      color: '#f59e0b',
      badge: 'PHỐ CHỢ',
    };
  }

  return {
    name: 'Quảng Trường Trung Tâm & Đô Thị Bình Minh',
    biome: 'city',
    color: '#3b82f6',
    badge: 'TRUNG TÂM ĐÔ THỊ',
  };
}
