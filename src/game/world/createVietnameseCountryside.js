import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { MODEL_PATHS, spawnModelSync } from '../rendering/ModelAssetManager.js';
import { createWhitePicketFence } from './landmarks/createSocialFarmstead.js';

function mat(scene, name, hex, emissive = null) {
  const value = new StandardMaterial(name, scene);
  value.diffuseColor = Color3.FromHexString(hex);
  value.ambientColor = value.diffuseColor.scale(0.42);
  value.specularColor = new Color3(0.12, 0.12, 0.12);
  if (emissive) value.emissiveColor = Color3.FromHexString(emissive);
  return value;
}

/**
 * Kiện Rơm Vàng Đóng Khối Vuông Chuẩn Game Nông Trại MXH (Rectangular Hay Bale)
 */
function createHayBale(scene, x, y, z, parent, materials, rotationY = 0) {
  const bale = MeshBuilder.CreateBox(`hay-bale-${x}-${z}`, { width: 1.6, height: 0.9, depth: 1.0 }, scene);
  bale.position.set(x, y + 0.45, z);
  bale.rotation.y = rotationY;
  bale.material = materials.straw;
  bale.parent = parent;

  // 2 Sợi dây thừng trắng bện quanh kiện rơm
  [-0.45, 0.45].forEach((rx, idx) => {
    const rope = MeshBuilder.CreateBox(`bale-rope-${x}-${z}-${idx}`, { width: 0.04, height: 0.92, depth: 1.02 }, scene);
    rope.position.set(x + rx, y + 0.45, z);
    rope.rotation.y = rotationY;
    rope.material = materials.rope;
    rope.parent = parent;
  });
  return bale;
}


/**
 * Khu Lều Cắm Trại Glamping & Nghỉ Dưỡng Bờ Biển (Glamping Beach Park)
 * Thay thế giàn phơi cá khô dân dã
 */
function createGlampingPark(scene, parent, materials, shadows) {
  const campRoot = new TransformNode('glamping-beach-park', scene);
  // Đặt trên bãi cát phía Đông x = 38 để giải phóng 100% trục đại lộ bãi biển x = 0
  campRoot.position.set(38, 0, 345);
  campRoot.parent = parent;

  // 2 Lều Glamping hình chóp nón vải Canvas cao cấp
  [-24, 24].forEach((tx, idx) => {
    const tentPlatform = MeshBuilder.CreateBox(`tent-platform-${idx}`, { width: 6.8, height: 0.35, depth: 6.8 }, scene);
    tentPlatform.position.set(tx, 0.18, 0);
    tentPlatform.material = materials.timber;
    tentPlatform.parent = campRoot;

    const tentCone = MeshBuilder.CreateCylinder(`glamping-tent-${idx}`, {
      diameterTop: 0.2,
      diameterBottom: 5.4,
      height: 4.2,
      tessellation: 16,
    }, scene);
    tentCone.position.set(tx, 2.3, 0);
    tentCone.material = materials.canvas;
    tentCone.parent = campRoot;
    shadows?.addShadowCaster(tentCone);

    // Cửa lều hé mở
    const tentDoor = MeshBuilder.CreateBox(`tent-door-${idx}`, { width: 1.4, height: 2.2, depth: 0.2 }, scene);
    tentDoor.position.set(tx, 1.2, 2.6);
    tentDoor.material = materials.timber;
    tentDoor.parent = campRoot;
  });

  // Vòng Lửa Trại Đá Hoa Cương Bo Tròn (Modern Firepit)
  const pitRim = MeshBuilder.CreateTorus('modern-firepit-rim', { diameter: 2.8, thickness: 0.45, tessellation: 24 }, scene);
  pitRim.position.set(0, 0.25, 0);
  pitRim.material = materials.stoneRing;
  pitRim.parent = campRoot;

  const fire = MeshBuilder.CreateCylinder('coastal-campfire-flame', { diameterTop: 0.3, diameterBottom: 1.2, height: 1.6, tessellation: 12 }, scene);
  fire.position.set(0, 0.9, 0);
  fire.material = materials.fire;
  fire.parent = campRoot;

  // 6 Ghế Dã Ngoại Đá Cẩm Thạch / Gỗ quây quanh lửa trại
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const seat = MeshBuilder.CreateCylinder(`campfire-stool-${i}`, { diameter: 1.1, height: 0.5, tessellation: 16 }, scene);
    seat.position.set(Math.cos(angle) * 3.4, 0.25, Math.sin(angle) * 3.4);
    seat.material = materials.timber;
    seat.parent = campRoot;
  }
}

/**
 * KHU VỰC ĐIỀN TRANG NGOẠI Ô MẠNG XÃ HỘI (SUBURBAN SOCIAL FARMLAND)
 * Đã loại bỏ hoàn toàn các yếu tố dân dã cũ (cầu khỉ tre, thuyền thúng, trâu bùn, lúa nước đắp bùn).
 */
export function* createVietnameseCountrysideSteps(scene, shadows) {
  const root = new TransformNode('suburban-social-countryside', scene);
    yield;
  const materials = {
    straw: mat(scene, 'suburban-hay-bale', '#fbbf24', '#f59e0b'),
    rope: mat(scene, 'bale-rope-white', '#f8fafc'),
    timber: mat(scene, 'suburban-timber', '#b45309'),
    woodDark: mat(scene, 'suburban-wood-dark', '#451a03'),
    canvas: mat(scene, 'glamping-canvas', '#f8fafc'),
    stoneRing: mat(scene, 'firepit-stone', '#94a3b8'),
    fire: mat(scene, 'suburban-fire-glow', '#f97316', '#fbbf24'),
    grassPasture: mat(scene, 'pasture-green-grass', '#86efac'),
  };
    yield;
  materials.grassPasture.zOffset = -1;
    yield;

  // 1. HÀNG RÀO GỖ TRẮNG NÔNG TRANG NGOẠI Ô (WHITE PICKET FENCES)
  // Đã giải phóng hoàn toàn hành lang Quốc Lộ 86 (z = 86) để các tuyến xe buýt và phương tiện thông suốt 100%

  // 2. (Đã dọn dẹp chuồng trại và rào chắn tại x=88, z=112 theo yêu cầu)
    yield;

  // 3. CÁC KIỆN RƠM VÀNG ĐÓNG KHỐI (HAY BALES) XẾP TẦNG CẠNH TRANG TRẠI (TUYỆT ĐỐI KHÔNG CHẮN ĐƯỜNG)
  for (const [_index, b] of ([
    // Cụm kiện rơm phía Tây (sân trang trại)
    { x: -72, y: 0, z: 102, r: 0 },
    { x: -70.3, y: 0, z: 102, r: 0 },
    { x: -71.1, y: 0.9, z: 102, r: 0 },
    // Cụm kiện rơm phía Đông (dời khỏi ngã 4 z = 126 vào khuôn viên x: 74, z: 136)
    { x: 74, y: 0, z: 136, r: Math.PI / 4 },
    { x: 75.5, y: 0, z: 137.2, r: Math.PI / 4 },
    { x: 74.8, y: 0.9, z: 136.6, r: Math.PI / 4 },
    // Cụm kiện rơm ven ngoại ô
    { x: -72, y: 0, z: 254, r: 0.2 },
    { x: 72, y: 0, z: 254, r: -0.2 },
  ]).entries()) { createHayBale(scene, b.x, b.y, b.z, root, materials, b.r); yield; }
    yield;

  // 4. BẾN THUYỀN BUỒM & CANO THỂ THAO VEN HỒ
    yield;

  // 5. CÔNG VIÊN GLAMPING & NGHỈ DƯỠNG BỜ BIỂN
  createGlampingPark(scene, root, materials, shadows);
    yield;

  return {
    root,
    dispose() {
      root.dispose(false, true);
    },
  };
}

export function createVietnameseCountryside(scene, shadows) {
  const steps = createVietnameseCountrysideSteps(scene, shadows);
  let result;
  do { result = steps.next(); } while (!result.done);
  return result.value;
}
