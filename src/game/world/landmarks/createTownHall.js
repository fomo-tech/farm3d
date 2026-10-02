import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { MODEL_PATHS, spawnModelSync } from '../../rendering/ModelAssetManager.js';

function makeMat(scene, name, hex, emissiveHex = null) {
  let m = scene.getMaterialByName(name);
  if (!m) {
    m = new StandardMaterial(name, scene);
    m.diffuseColor = Color3.FromHexString(hex);
    m.specularColor = new Color3(0.12, 0.12, 0.12);
    if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  }
  return m;
}

/**
 * TÒA THỊ CHÍNH & THÁP CHUÔNG ĐỒNG HỒ HOÀNG GIA (GRAND TOWN HALL & BELLTOWER)
 * Tọa lạc uy nghiêm tại tâm trục cuối đại lộ trung tâm (x: 0, z: -175).
 * - Bậc tam cấp đá hoa cương rộng lớn đón khách
 * - 4 Cột trụ La Mã cổ điển, tiền sảnh có vòm đá chạm khắc
 * - Tháp chuông 4 mặt đồng hồ kim vàng quay chuyển động
 * - Mái vòm Baroque xanh ngọc bích viền kim loại vàng
 */
export function createTownHall(scene, shadows, position = { x: 0, y: 0, z: -175 }) {
  const root = new TransformNode('landmark-town-hall', scene);
  root.position.set(position.x, position.y || 0, position.z);

  const materials = {
    granite: makeMat(scene, 'townhall-granite', '#f8fafc'), // Đá cẩm thạch trắng sáng
    stoneDark: makeMat(scene, 'townhall-stone-dark', '#cbd5e1'), // Bậc tam cấp đá sáng
    gold: makeMat(scene, 'townhall-gold', '#fbbf24', '#f59e0b'), // Mạ vàng kim hoàng gia
    clockFace: makeMat(scene, 'townhall-clock', '#fefce8', '#facc15'), // Mặt đồng hồ vàng dạ quang
    clockHands: makeMat(scene, 'townhall-hands', '#0f172a'),
    copperRoof: makeMat(scene, 'townhall-copper-roof', '#0284c7'), // Mái vòm xanh ngọc lam rực rỡ
    doorWood: makeMat(scene, 'townhall-door', '#78350f'), // Cửa gỗ sồi nâu ấm
    pillar: makeMat(scene, 'townhall-pillar', '#ffffff'), // Cột đá trắng muốt
    banner: makeMat(scene, 'townhall-banner', '#b91c1c'), // Cờ hiệu đỏ nhung
  };

  // 1. Bậc tam cấp đá hoa cương rộng lớn
  [
    { w: 16.0, d: 10.0, h: 0.35, y: 0.18 },
    { w: 14.4, d: 9.0, h: 0.35, y: 0.52 },
    { w: 12.8, d: 8.0, h: 0.35, y: 0.86 },
  ].forEach((step, i) => {
    const s = MeshBuilder.CreateBox(`townhall-step-${i}`, {
      width: step.w,
      height: step.h,
      depth: step.d,
    }, scene);
    s.position.y = step.y;
    s.material = materials.stoneDark;
    s.parent = root;
    s.receiveShadows = true;
  });

  // 2. Thân chính Tòa Thị Chính 2 tầng bề thế
  const hall = MeshBuilder.CreateBox('townhall-hall', {
    width: 12.6,
    height: 6.8,
    depth: 7.6,
  }, scene);
  hall.position.set(0, 4.4, 0);
  hall.material = materials.granite;
  hall.parent = root;

  // 4 Cột trụ La Mã cổ điển đỡ sảnh đón
  [-4.4, -1.5, 1.5, 4.4].forEach((px, i) => {
    const pillar = MeshBuilder.CreateCylinder(`townhall-pillar-${i}`, {
      height: 6.4,
      diameter: 0.75,
      tessellation: 16,
    }, scene);
    pillar.position.set(px, 4.2, 3.6);
    pillar.material = materials.pillar;
    pillar.parent = root;
  });

  // Mái hồi tam giác (Pediment) chạm khắc hoàng gia
  const pediment = MeshBuilder.CreateCylinder('townhall-pediment', {
    diameter: 13.0,
    height: 2.4,
    tessellation: 3,
  }, scene);
  pediment.rotation.z = Math.PI / 6;
  pediment.rotation.y = Math.PI / 2;
  pediment.scaling.set(0.65, 0.45, 1.0);
  pediment.position.set(0, 8.2, 2.8);
  pediment.material = materials.granite;
  pediment.parent = root;

  // Cửa gỗ sồi lớn vòm cong
  const door = MeshBuilder.CreateBox('townhall-entrance-door', {
    width: 2.8,
    height: 3.8,
    depth: 0.25,
  }, scene);
  door.position.set(0, 2.9, 3.82);
  door.material = materials.doorWood;
  door.parent = root;

  // Cặp cờ lệnh đỏ nhung hai bên sảnh đón
  [-5.6, 5.6].forEach((bx, i) => {
    const pole = MeshBuilder.CreateCylinder(`townhall-flagpole-${i}`, { height: 7.5, diameter: 0.08 }, scene);
    pole.position.set(bx, 4.5, 4.2);
    pole.material = materials.gold;
    pole.parent = root;

    const banner = MeshBuilder.CreatePlane(`townhall-banner-${i}`, { width: 1.2, height: 2.2 }, scene);
    banner.position.set(bx + (i === 0 ? 0.6 : -0.6), 6.4, 4.2);
    banner.material = materials.banner;
    banner.parent = root;
  });

  // Cặp đèn lồng đồng cổ kính
  spawnModelSync(scene, MODEL_PATHS.town.lantern, {
    position: new Vector3(position.x - 3.2, 0.9, position.z + 4.2),
    scaling: new Vector3(1.2, 1.2, 1.2),
    name: 'townhall-lantern-l',
  });
  spawnModelSync(scene, MODEL_PATHS.town.lantern, {
    position: new Vector3(position.x + 3.2, 0.9, position.z + 4.2),
    scaling: new Vector3(1.2, 1.2, 1.2),
    name: 'townhall-lantern-r',
  });

  // 3. Tháp chuông đồng hồ trung tâm (Central Clock Tower)
  const tower = MeshBuilder.CreateBox('townhall-clock-tower', {
    width: 4.8,
    height: 9.6,
    depth: 4.8,
  }, scene);
  tower.position.set(0, 11.6, 0);
  tower.material = materials.granite;
  tower.parent = root;

  // 4 Mặt đồng hồ phát sáng 4 hướng (Bắc, Nam, Đông, Tây)
  const clockHandsList = [];
  const clockFaces = [
    { x: 0, z: 2.42, rotY: 0 },
    { x: 0, z: -2.42, rotY: Math.PI },
    { x: 2.42, z: 0, rotY: Math.PI / 2 },
    { x: -2.42, z: 0, rotY: -Math.PI / 2 },
  ];

  clockFaces.forEach((f, i) => {
    // Đĩa đồng hồ tròn viền vàng
    const dial = MeshBuilder.CreateCylinder(`clock-face-${i}`, {
      height: 0.08,
      diameter: 2.8,
      tessellation: 24,
    }, scene);
    dial.rotation.x = Math.PI / 2;
    dial.rotation.y = f.rotY;
    dial.position.set(f.x, 13.6, f.z);
    dial.material = materials.clockFace;
    dial.parent = root;

    // Kim giờ & Kim phút
    const hourHand = MeshBuilder.CreateBox(`clock-hour-${i}`, {
      width: 0.12,
      height: 0.75,
      depth: 0.05,
    }, scene);
    hourHand.rotation.y = f.rotY;
    hourHand.rotation.z = 0.6;
    hourHand.position.set(f.x, 13.8, f.z + (f.z !== 0 ? (f.z > 0 ? 0.06 : -0.06) : 0));
    hourHand.material = materials.clockHands;
    hourHand.parent = root;

    const minHand = MeshBuilder.CreateBox(`clock-min-${i}`, {
      width: 0.08,
      height: 1.05,
      depth: 0.05,
    }, scene);
    minHand.rotation.y = f.rotY;
    minHand.rotation.z = -0.4;
    minHand.position.set(f.x, 13.9, f.z + (f.z !== 0 ? (f.z > 0 ? 0.06 : -0.06) : 0));
    minHand.material = materials.clockHands;
    minHand.parent = root;

    clockHandsList.push({ hourHand, minHand });
  });

  // 4. Mái vòm đồng Baroque Spire & Quả cầu vàng kim trên đỉnh
  const spire = MeshBuilder.CreateCylinder('townhall-spire', {
    height: 5.6,
    diameterTop: 0.2,
    diameterBottom: 5.2,
    tessellation: 8,
  }, scene);
  spire.position.y = 18.8;
  spire.material = materials.copperRoof;
  spire.parent = root;

  const finial = MeshBuilder.CreateSphere('townhall-finial', {
    diameter: 0.75,
    segments: 10,
  }, scene);
  finial.position.y = 21.8;
  finial.material = materials.gold;
  finial.parent = root;

  if (shadows) {
    [hall, tower, spire, pediment].forEach(m => shadows.addShadowCaster(m));
  }

  return {
    root,
    update(time) {
      clockHandsList.forEach(({ hourHand, minHand }) => {
        if (minHand) minHand.rotation.z = -(time * 0.0006);
        if (hourHand) hourHand.rotation.z = -(time * 0.0006 / 12);
      });
    }
  };
}
