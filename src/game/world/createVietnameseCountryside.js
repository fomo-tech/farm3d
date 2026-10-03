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
 * Bến Thuyền & Cano Thể Thao Ven Hồ (Suburban Lake Pier & Boat Dock)
 * Thay thế cho cầu khỉ tre và thuyền thúng cũ
 */
function createLakePier(scene, parent, materials, shadows) {
  const pierRoot = new TransformNode('suburban-lake-pier', scene);
  pierRoot.position.set(164, 0.1, -8);
  pierRoot.rotation.y = 0.1;
  pierRoot.parent = parent;

  // Cầu tàu sàn gỗ sạch sẽ vươn ra lòng hồ
  const deck = MeshBuilder.CreateBox('pier-wood-deck', { width: 4.2, height: 0.25, depth: 12.0 }, scene);
  deck.position.set(0, 0.8, 6.0);
  deck.material = materials.timber;
  deck.parent = pierRoot;
  deck.receiveShadows = true;

  // Các cọc trụ bê tông / gỗ chịu lực cắm dưới nước
  [-1.8, 1.8].forEach(px => {
    [1.5, 5.5, 9.5].forEach(pz => {
      const pylon = MeshBuilder.CreateCylinder(`pier-pylon-${px}-${pz}`, { height: 2.2, diameter: 0.35, tessellation: 12 }, scene);
      pylon.position.set(px, 0.2, pz);
      pylon.material = materials.woodDark;
      pylon.parent = pierRoot;
      shadows?.addShadowCaster(pylon);
    });
  });

  // Chiếc Thuyền Buồm Dã Ngoại (Pleasure Sailboat) neo đậu cạnh cầu tàu
  const boat = MeshBuilder.CreateBox('docked-boat-hull', { width: 2.4, height: 1.2, depth: 5.6 }, scene);
  boat.position.set(4.2, 0.5, 6.5);
  boat.material = materials.whiteHull;
  boat.parent = pierRoot;

  // Cột buồm và cánh buồm trắng
  const mast = MeshBuilder.CreateCylinder('boat-mast', { height: 5.4, diameter: 0.14, tessellation: 10 }, scene);
  mast.position.set(4.2, 3.4, 6.5);
  mast.material = materials.woodDark;
  mast.parent = pierRoot;

  const sail = MeshBuilder.CreateCylinder('boat-sail', {
    diameter: 3.4,
    height: 3.8,
    tessellation: 3,
  }, scene);
  sail.rotation.z = Math.PI / 2;
  sail.scaling.set(0.08, 1.0, 0.9);
  sail.position.set(4.2, 3.2, 7.4);
  sail.material = materials.canvas;
  sail.parent = pierRoot;
}

/**
 * Khu Lều Cắm Trại Glamping & Nghỉ Dưỡng Bờ Biển (Glamping Beach Park)
 * Thay thế giàn phơi cá khô dân dã
 */
function createGlampingPark(scene, parent, materials, shadows) {
  const campRoot = new TransformNode('glamping-beach-park', scene);
  campRoot.position.set(0, 0, 350);
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
export function createVietnameseCountryside(scene, shadows) {
  const root = new TransformNode('suburban-social-countryside', scene);
  const materials = {
    straw: mat(scene, 'suburban-hay-bale', '#fbbf24', '#f59e0b'),
    rope: mat(scene, 'bale-rope-white', '#f8fafc'),
    timber: mat(scene, 'suburban-timber', '#b45309'),
    woodDark: mat(scene, 'suburban-wood-dark', '#451a03'),
    canvas: mat(scene, 'glamping-canvas', '#f8fafc'),
    whiteHull: mat(scene, 'sailboat-white', '#ffffff'),
    stoneRing: mat(scene, 'firepit-stone', '#94a3b8'),
    fire: mat(scene, 'suburban-fire-glow', '#f97316', '#fbbf24'),
    grassPasture: mat(scene, 'pasture-green-grass', '#86efac'),
  };

  // 1. HÀNG RÀO GỖ TRẮNG NÔNG TRANG NGOẠI Ô (WHITE PICKET FENCES)
  // Phân chia ranh giới trang trại và đường đi bộ (chừa trọn vẹn lòng đại lộ trung tâm x = -10 .. 10)
  createWhitePicketFence(scene, shadows, 36, { x: -28, y: 0, z: 88 }, 0, root);
  createWhitePicketFence(scene, shadows, 36, { x: 28, y: 0, z: 88 }, 0, root);
  // (Đã xóa bỏ hoàn toàn 2 hàng rào 140m tại x = ±66 từng cắt ngang qua 5 ngã tư giao lộ)

  // 2. KHU ĐỒNG CỎ CHĂN THẢ BÒ SỮA SẠCH ĐẸP (DAIRY COW PASTURE)
  // Bố trí tại khuôn viên đồng quê (x: 88, z: 112) - Hoàn toàn nằm ngoài hành lang an toàn của mọi trục đường
  const pastureGrass = MeshBuilder.CreateDisc('dairy-pasture-green', { radius: 10, tessellation: 36 }, scene);
  pastureGrass.rotation.x = Math.PI / 2;
  pastureGrass.position.set(88, 0.05, 112);
  pastureGrass.material = materials.grassPasture;
  pastureGrass.parent = root;

  // Hàng rào gỗ trắng bao quanh bãi chăn thả an toàn
  createWhitePicketFence(scene, shadows, 20, { x: 88, y: 0, z: 102 }, 0, root);
  createWhitePicketFence(scene, shadows, 20, { x: 88, y: 0, z: 122 }, 0, root);
  createWhitePicketFence(scene, shadows, 20, { x: 78, y: 0, z: 112 }, Math.PI / 2, root);
  createWhitePicketFence(scene, shadows, 20, { x: 98, y: 0, z: 112 }, Math.PI / 2, root);

  // Máng cỏ gỗ sạch sẽ cho bò sữa
  const feedTrough = MeshBuilder.CreateBox('cow-feed-trough', { width: 3.8, height: 0.6, depth: 1.1 }, scene);
  feedTrough.position.set(88, 0.3, 104);
  feedTrough.material = materials.timber;
  feedTrough.parent = root;

  const troughHay = MeshBuilder.CreateBox('cow-trough-hay', { width: 3.5, height: 0.3, depth: 0.9 }, scene);
  troughHay.position.set(88, 0.5, 104);
  troughHay.material = materials.straw;
  troughHay.parent = root;

  // Đàn bò sữa Holstein 3D thảnh thơi nhai cỏ
  const cow1 = spawnModelSync(scene, MODEL_PATHS.animals.cow, {
    position: new Vector3(86, 0, 110),
    rotation: new Vector3(0, 0.4, 0),
    scaling: new Vector3(0.48, 0.48, 0.48),
    shadows,
    name: 'pasture-cow-1',
  });
  if (cow1) cow1.parent = root;

  const cow2 = spawnModelSync(scene, MODEL_PATHS.animals.cow, {
    position: new Vector3(91, 0, 115),
    rotation: new Vector3(0, -1.8, 0),
    scaling: new Vector3(0.45, 0.45, 0.45),
    shadows,
    name: 'pasture-cow-2',
  });
  if (cow2) cow2.parent = root;

  // 3. CÁC KIỆN RƠM VÀNG ĐÓNG KHỐI (HAY BALES) XẾP TẦNG CẠNH TRANG TRẠI (TUYỆT ĐỐI KHÔNG CHẮN ĐƯỜNG)
  [
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
  ].forEach(b => createHayBale(scene, b.x, b.y, b.z, root, materials, b.r));

  // 4. BẾN THUYỀN BUỒM & CANO THỂ THAO VEN HỒ
  createLakePier(scene, root, materials, shadows);

  // 5. CÔNG VIÊN GLAMPING & NGHỈ DƯỠNG BỜ BIỂN
  createGlampingPark(scene, root, materials, shadows);

  return {
    root,
    dispose() {
      root.dispose(false, true);
    },
  };
}
