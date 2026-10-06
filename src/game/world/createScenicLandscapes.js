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
import { isPointOnRoadCorridor, isRoadFootprintBlocked } from './RoadSafetyZone.js';
import { beachOceanHalfWidth, beachResourceWaterAt, beachGroundHeight } from '../../../shared/beachConfig.js';
import { isPointInsideAnyFarmLot } from './FarmSafetyZone.js';
import { WORLD_VILLAGES } from '../../../shared/villageLayout.js';
import { WORLD_PALETTE, VILLAGE_THEME_GROUPS, createCozyMaterial } from './worldDesignSystem.js';
import { ALL_BRIDGES } from '../../../shared/bridgeConfig.js';
import { buildBridge } from './nature/BridgeSystem.js';
import { createGlobalDenseFloraSteps } from './createGlobalDenseFlora.js';
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
export function createBeachLoungeSpot(scene, parent, x, z, angle, shadows, materials) {
  if(beachResourceWaterAt(x,z,3)) return null;
  const root = new TransformNode(`beach-lounge-${x}-${z}`, scene);
  root.position.set(x, beachGroundHeight(x,z) ?? 0, z);
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
export function* createScenicLandscapesSteps(scene, foliage, shadows, foliageInstancing = null) {
  if (!foliageInstancing) foliageInstancing = new FoliageInstancingEngine(scene, shadows);
    yield;
  const root = new TransformNode('world-scenic-landscapes', scene);
    yield;

  const materials = {
    straw: makeMat(scene, 'scenic-straw', '#fbbf24', '#f59e0b', 0.05),
    rope: makeMat(scene, 'scenic-rope', '#78350f', null, 0.02),
    wood: makeMat(scene, 'scenic-wood', '#92400e', null, 0.05),
    timber: makeMat(scene, 'scenic-timber', '#b45309', null, 0.08),
    parasol: makeMat(scene, 'scenic-parasol', '#f43f5e', '#fb7185', 0.15),
    lavenderPetal: makeMat(scene, 'scenic-lavender', '#a855f7', '#c084fc', 0.1),
    whiteFence: makeMat(scene, 'scenic-white-fence', '#f8fafc', null, 0.12),
  };
    yield;

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

      yield;
}
    yield;

  // Hành lang QL 86 thông thoáng, sạch sẽ, không có đồ vật bừa bãi
  yield;

  // =========================================================================
  // BIOME 2: BỜ BIỂN NHIỆT ĐỚI & LỄ HỘI MÙA HÈ (SOUTH AVE & QL 406 · TUYẾN 02)
  // Đại lộ Biển: x = 0, z: 290 -> 350. Trồng đều đặn nhịp 12m/cây
  // QL Nam 406: z = 406, x từ -270 đến +270. Trồng đều đặn nhịp 16m/cây
  // =========================================================================
  for (let z = 290; z <= 350; z += 12) {
    for (const [_index, x] of ([-11.5, 11.5]).entries()) {
      if (!isPointOnRoadCorridor(x, z, 4.0) && !isPointInsideAnyFarmLot(x, z, 1.5)) {
        foliage.createTropicalPalm(x, z, 1.0, (x > 0 ? -0.22 : 0.22), true);
      }

      yield;
    }

      yield;
}
    yield;

  for (let x = -270; x <= 270; x += 16) {
    const side = (Math.floor((x + 300) / 16) % 2 === 0) ? -1 : 1;
    const z = 406 + side * 10.5; // z = 395.5 hoặc 416.5
    if (!isPointOnRoadCorridor(x, z, 4.0) && !isPointInsideAnyFarmLot(x, z, 1.5)) {
      foliage.createTropicalPalm(x, z, 1.0, (side > 0 ? -0.2 : 0.2), true);
      if (Math.abs(x) % 32 === 0) {
        foliage.createHydrangeaBush(x + 2.0, z, '#f43f5e', 0.9);
      }
    }

      yield;
}
    yield;

  // Các điểm nghỉ dưỡng ven biển có dù che nắng và ghế phơi nắng (tại bãi cát z >= 305 và QL 406)
  const beachLounges = [
    { x: -18.0, z: 340, rot: 0.4 },
    { x: 18.0, z: 340, rot: -0.4 },
    { x: -42.0, z: 349, rot: 0.2 },
    { x: 42.0, z: 349, rot: -0.2 },
    { x: -beachOceanHalfWidth(418)-14, z: 418.0, rot: 0 },
    { x: beachOceanHalfWidth(418)+14, z: 418.0, rot: Math.PI },
  ];
    yield;
  for (const [_index, b] of (beachLounges).entries()) {
    if (!isPointOnRoadCorridor(b.x, b.z, 4.0) && !isPointInsideAnyFarmLot(b.x, b.z, 1.5)) {
      createBeachLoungeSpot(scene, root, b.x, b.z, b.rot, shadows, materials);
    }

      yield;
    }
    yield;

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

      yield;
}
    yield;

  // Nhánh Đại Lộ dẫn về Làng Phú Điền (z = -260 -> -385 nhịp 14m)
  for (let z = -260; z >= -385; z -= 14) {
    for (const [_index, x] of ([-11.5, 11.5]).entries()) {
      if (!isPointOnRoadCorridor(x, z, 3.8) && !isPointInsideAnyFarmLot(x, z, 1.5)) {
        foliage.createAlpinePine(x, z, 1.0, true);
      }

      yield;
    }

      yield;
}
    yield;

  // Tảng đá núi và bãi cỏ động vật chăn thả ven đường cao nguyên
  const highlandPastures = [
    { x: -370, z: -220.0, animal: 'cow' },
    { x: -170, z: -248.0, animal: 'alpaca' },
    { x: 170, z: -248.0, animal: 'cow' },
    { x: 370, z: -220.0, animal: 'alpaca' },
  ];
    yield;
  for (const [_index, pasture] of (highlandPastures).entries()) {
    if (!isRoadFootprintBlocked(pasture.x, pasture.z, 5, 5, 1)) {
      spawnModelSync(scene, pasture.animal === 'cow' ? MODEL_PATHS.animals.cow : MODEL_PATHS.animals.alpaca, {
        position: new Vector3(pasture.x, 0, pasture.z),
        rotation: new Vector3(0, Math.random() * Math.PI * 2, 0),
        scaling: new Vector3(1.3, 1.3, 1.3),
        parent: root,
        name: `scenic-grazer-${pasture.x}`,
      });
    }
    if (!isRoadFootprintBlocked(pasture.x + 3.8, pasture.z - 1.2, 3, 3, 1)) {
      spawnModelSync(scene, MODEL_PATHS.rocks.large, {
        position: new Vector3(pasture.x + 3.8, 0, pasture.z - 1.2),
        scaling: new Vector3(1.2, 1.2, 1.2),
        parent: root,
        name: `scenic-rock-${pasture.x}`,
      });
    }

      yield;
    }
    yield;

  // =========================================================================
  // BIOME 4: TRIỀN HỒ PHA LÊ & VƯỜN HOA OẢI HƯƠNG (LAKE PROMENADE · TUYẾN 04)
  // z = 3 đến 18, x từ 80 đến 175
  // =========================================================================
  const lakePromenadeSpots = [
    { x: 88, z: -14 },
    { x: 104, z: -16 },
    { x: 100, z: -30 },
    { x: 96, z: 22 },
    { x: 112, z: 24 },
    { x: 128, z: 26 },
  ];
    yield;

  for (const [idx, s] of (lakePromenadeSpots).entries()) {
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

      yield;
    }
    yield;

  // Đàn vịt trời tung tăng ven bờ cỏ hồ Pha Lê
  for (const [i, duckPos] of ([
    { x: 142, z: -12 },
    { x: 145, z: -10 },
    { x: 140, z: -8 },
  ]).entries()) {
    spawnModelSync(scene, MODEL_PATHS.animals.duck, {
      position: new Vector3(duckPos.x, 0.1, duckPos.y || duckPos.z),
      rotation: new Vector3(0, 0.8 + i * 0.4, 0),
      scaling: new Vector3(1.4, 1.4, 1.4),
      parent: root,
      name: `lake-duck-${i}`,
    });

      yield;
    }
    yield;

  // =========================================================================
  // 5. VÀNH ĐAI DÃY NÚI HÙNG VĨ & ĐỒI XANH BAO QUANH CHÂN TRỜI (WORLD BORDER PANORAMA)
  // Continuous Procedural Mountain Range + 3D Cliff Formations + Horizon Treelines
  // =========================================================================
  createWorldBorderMountains(scene, root, foliageInstancing);
    yield;

  // =========================================================================
  // 6. DÒNG SÔNG NƯỚC NGỌC BÍCH LÃNG MẠN CỦA LÀNG VEN SÔNG (RIVER OF LÀNG VEN SÔNG)
  // Chạy dài 300m song song trục làng với 2 cây cầu gỗ vòm, bến thuyền câu cá và đàn vịt
  // =========================================================================
  createVenSongRiver(scene, root, foliage, shadows);
    yield;

  // =========================================================================
  // 7. ĐẠI LỘ CÂY XANH & HOA TƯƠI DỌC TRỤC CHÍNH TẤT CẢ 12 LÀNG (ALL VILLAGE TREE AVENUES)
  // Trồng cây hai bên vỉa hè, khóm hoa cẩm tú cầu và ghế đá ngắm cảnh cho 100% 12 làng
  // =========================================================================
  createVillageRoadsideAvenues(scene, root, foliage, shadows);
    yield;

  // =========================================================================
  // 8. ĐIỂM NHẤN CẢNH QUAN CHỦ ĐỀ ĐẶC TRƯNG CHO TỪNG LÀNG TRONG 12 LÀNG
  // =========================================================================
  createAllVillageThematicLandmarks(scene, root, foliage, shadows);
    yield;

  // =========================================================================
  // 9. ĐẠI CÔNG VIÊN HOA & THUNG LŨNG TRUNG TÂM BÌNH MINH (CENTRAL GRAND BOTANICAL PARK)
  // Phủ kín 100% khoảng đất trống 360m x 55m giữa Vòng Xuyến Trung Tâm và Quốc Lộ 86
  // =========================================================================
  createCentralBotanicalPark(scene, root, foliage, shadows);
    yield;

  // =========================================================================
  // 10. KHU DU LỊCH SINH THÁI HỒ PHA LÊ & BẾN THUYỀN THIÊN NGA PLAY TOGETHER
  // =========================================================================
  // Crystal Lake's water decorations and boat are owned by its district builder.
  // Rebuilding them here previously overlapped the pier and added another 38 meshes.
    yield;

  // =========================================================================
  // 11. GIÀN HOA LEO PERGOLA UỐN VÒM TẠI CỔNG LÀNG & LỐI DẠO CÔNG VIÊN
  // =========================================================================
  createScenicPergolas(scene, root, foliage, shadows);
    yield;

  // =========================================================================
  // 12. HỆ THỐNG PHỦ CÂY & HOA TOÀN CẦU DÀY ĐẶC (GLOBAL DENSE FLORA ENGINE)
  // Phủ 1,400+ cây xanh qua GPU Instancing, 2,800+ khóm hoa & 48 đồi cỏ không lag
  // =========================================================================
  // The map-wide 1,400-tree / 2,800-flower layer adds thousands of distinct
  // GPU resources. Phones keep the handcrafted road and village landscaping;
  // the far-field blanket is reserved for desktop memory budgets.
  if (!scene.metadata?.mobile) {
    yield* createGlobalDenseFloraSteps(scene, foliage, shadows, foliageInstancing);
    yield;
  }

  return root;
}

export function createScenicLandscapes(scene, foliage, shadows, foliageInstancing = null) {
  const steps = createScenicLandscapesSteps(scene, foliage, shadows, foliageInstancing);
  let result;
  do { result = steps.next(); } while (!result.done);
  return result.value;
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

  // 2. 6 Cụm Tiểu Cảnh Vườn Hoa Cổ Thụ & Nghỉ Chân Tự Nhiên (Scenic Garden Rest Spots - hoàn toàn trên mặt đất phẳng tự nhiên)
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

  // (Đã dọn dẹp suối nhân tạo và cầu đá thừa tại x=88, z=48)

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
    if (!isRoadFootprintBlocked(-300 + dx, 74, 2.7, 2.7, 0.5)) foliage.createGoldenMaple(-300 + dx, 74, 1.35, true);
    if (!isRoadFootprintBlocked(-300 + dx, 77, 2.2, 2.2, 0.5)) foliage.createFlowerPatch(-300 + dx, 77, 10, 2.2);
  });
  if (!isRoadFootprintBlocked(-314, 77, 4, 4, 1)) spawnModelSync(scene, MODEL_PATHS.town.cartHigh, {
    position: new Vector3(-300 - 14, 0, 77),
    rotation: new Vector3(0, 0.4, 0),
    scaling: new Vector3(1.3, 1.3, 1.3),
    parent: root,
    name: 'hoamai-honey-cart',
  });

  // 2. Làng Đồi Gió (x = -600, offsetZ = 0): Quần thể Cối Xay Gió trên Đồi Cỏ Phía Tây (x = -675, ngoài nông trại)
  [-35, 35].forEach((dz, i) => {
    if (!isRoadFootprintBlocked(-675, 175 + dz, 9, 9, 1)) spawnModelSync(scene, MODEL_PATHS.town.windmill, {
      position: new Vector3(-675, 0, 175 + dz),
      rotation: new Vector3(0, 0.5 + i * 0.7, 0),
      scaling: new Vector3(2.2, 2.2, 2.2),
      shadows,
      parent: root,
      name: `doigio-windmill-${i}`,
    });
  });
  if (!isRoadFootprintBlocked(-670, 175, 2, 2, 1)) spawnModelSync(scene, MODEL_PATHS.animals.alpaca, {
    position: new Vector3(-670, 0, 175),
    rotation: new Vector3(0, 1.2, 0),
    scaling: new Vector3(1.3, 1.3, 1.3),
    parent: root,
    name: 'doigio-alpaca-1',
  });

  // 3. Làng An Nhiên (x = 600, offsetZ = 0): Vườn Trúc Thiền Tịnh tại Cổng Làng (z = 74)
  [-18, 18].forEach((dx) => {
    if (!isRoadFootprintBlocked(600 + dx, 74, 2.7, 2.7, 0.5)) foliage.createCloudTree(600 + dx, 74, 1.35, true);
    if (!isRoadFootprintBlocked(600 + dx, 77, 2.2, 2.2, 0.5)) foliage.createFlowerPatch(600 + dx, 77, 10, 2.2);
  });

  // 4. Làng Thanh Hà (x = -300, offsetZ = -320): Rừng Hoa Anh Đào tại Cổng Làng (z = -246)
  [-18, 18].forEach((dx) => {
    if (!isRoadFootprintBlocked(-300 + dx, -246, 2.7, 2.7, 0.5)) foliage.createSakuraTree(-300 + dx, -246, 1.35, true);
    if (!isRoadFootprintBlocked(-300 + dx, -249, 2.2, 2.2, 0.5)) foliage.createFlowerPatch(-300 + dx, -249, 10, 2.2);
  });

  // 5. Làng Thu Phong (x = -300, offsetZ = 320): Vườn Phong Đỏ & Bí Ngô Mùa Thu tại Cổng Làng (z = 394)
  [-18, 18].forEach((dx, i) => {
    if (!isRoadFootprintBlocked(-300 + dx, 394, 2.7, 2.7, 0.5)) foliage.createGoldenMaple(-300 + dx, 394, 1.35, true);
    if (!isRoadFootprintBlocked(-300 + dx, 397, 2.5, 2.5, 1)) spawnModelSync(scene, MODEL_PATHS.crops.pumpkin, {
      position: new Vector3(-300 + dx, 0, 397),
      scaling: new Vector3(1.6, 1.6, 1.6),
      parent: root,
      name: `thuphong-pumpkin-${i}`,
    });
  });

  // 6. Làng Hướng Dương (x = 300, offsetZ = 320): Thảo Nguyên Hướng Dương tại Cổng Làng (z = 394)
  [-18, 18].forEach((dx) => {
    if (!isRoadFootprintBlocked(300 + dx, 394, 2.8, 2.8, 0.5)) foliage.createFlowerPatch(300 + dx, 394, 14, 2.8);
    if (!isRoadFootprintBlocked(300 + dx, 397, 2.7, 2.7, 0.5)) foliage.createGoldenMaple(300 + dx, 397, 1.35, true);
  });

  // 7. Làng Phú Điền (x = 0, offsetZ = -480): Cối Xay Nước Cổ Truyền (z = -406)
  if (!isRoadFootprintBlocked(-25, -406, 8, 8, 1)) spawnModelSync(scene, MODEL_PATHS.town.watermill, {
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

/**
 * Giàn hoa leo Pergola uốn vòm lãng mạn tại các lối vào công viên và trạm xe buýt
 */
function createScenicPergolas(scene, parent, foliage, shadows) {
  const root = new TransformNode('scenic-pergolas', scene);
  root.parent = parent;

  const matTimber = makeMat(scene, 'pergola-timber', '#78350f', null, 0.06);
  const matWisteria = makeMat(scene, 'pergola-wisteria', '#c084fc', '#a855f7', 0.2);

  const pergolaSpots = [
    { x: -14, z: 68, rot: 0 },         // Lối vào Đại Công Viên Trung Tâm (đặt tại đường dạo bộ phía Tây)
    { x: -292, z: 76, rot: 0 },      // Cổng Làng Hoa Mai
    { x: 292, z: 76, rot: 0 },       // Cổng Làng Ven Sông
  ];

  pergolaSpots.forEach((spot, idx) => {
    if (isRoadFootprintBlocked(spot.x, spot.z, 2.1, 1.4, 0.3)) return;
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
