import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';

function makeMat(scene, name, hex, emissiveHex = null) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.35);
  m.specularColor = new Color3(0.08, 0.08, 0.08);
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

function createDirectionalSign(scene, text, directionAngle, colorHex, parent, yOffset) {
  const signNode = new TransformNode(`sign-${text}`, scene);
  signNode.parent = parent;
  signNode.position.y = yOffset;
  signNode.rotation.y = directionAngle;

  // Thanh gỗ ngang
  const plankMat = makeMat(scene, `plank-mat-${text}`, '#78350f');
  const arm = MeshBuilder.CreateBox(`sign-arm-${text}`, { width: 3.2, height: 0.6, depth: 0.12 }, scene);
  arm.position.set(1.4, 0, 0);
  arm.material = plankMat;
  arm.parent = signNode;

  // Mũi tên tam giác ở đầu biển
  const arrowTip = MeshBuilder.CreateCylinder(`sign-tip-${text}`, {
    diameterTop: 0,
    diameterBottom: 0.85,
    height: 0.12,
    tessellation: 3,
  }, scene);
  arrowTip.rotation.z = -Math.PI / 2;
  arrowTip.position.set(3.2, 0, 0);
  arrowTip.material = plankMat;
  arrowTip.parent = signNode;

  // Dynamic texture cho chữ chỉ hướng
  const dt = new DynamicTexture(`dt-sign-${text}`, { width: 512, height: 128 }, scene, false);
  dt.hasAlpha = true;
  const ctx = dt.getContext();
  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = '#1e293b';
  ctx.roundRect(8, 8, 496, 112, 16);
  ctx.fill();
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 8;
  ctx.stroke();
  dt.drawText(text, null, 78, 'bold 36px "Segoe UI", Arial, sans-serif', '#ffffff', null, true, true);

  const textMat = new StandardMaterial(`text-mat-${text}`, scene);
  textMat.diffuseTexture = dt;
  textMat.emissiveColor = Color3.FromHexString(colorHex).scale(0.85);
  textMat.disableLighting = true;

  // Biển chữ 2 mặt trước và sau
  const textPlaneFront = MeshBuilder.CreatePlane(`text-front-${text}`, { width: 3.0, height: 0.55 }, scene);
  textPlaneFront.position.set(1.35, 0, 0.07);
  textPlaneFront.material = textMat;
  textPlaneFront.parent = signNode;

  const textPlaneBack = MeshBuilder.CreatePlane(`text-back-${text}`, { width: 3.0, height: 0.55 }, scene);
  textPlaneBack.position.set(1.35, 0, -0.07);
  textPlaneBack.rotation.y = Math.PI;
  textPlaneBack.material = textMat;
  textPlaneBack.parent = signNode;

  return signNode;
}

export function createCentralRoundabout(scene, shadows, foliage, cobbleTexture, position = { x: 0, y: 0, z: 3 }) {
  const root = new TransformNode('central-roundabout-root', scene);
  root.position.set(position.x, position.y || 0, position.z);

  // Materials
  const matCobble = new StandardMaterial('roundabout-cobble-mat', scene);
  matCobble.diffuseTexture = cobbleTexture;
  matCobble.ambientColor = new Color3(0.35, 0.35, 0.35);

  const matCurb = makeMat(scene, 'roundabout-curb-mat', '#e2e8f0');
  const matGrass = makeMat(scene, 'roundabout-grass-mat', '#4ade80');
  const matFlowerWall = makeMat(scene, 'roundabout-flower-wall-mat', '#b45309');
  const matSoil = makeMat(scene, 'roundabout-soil-mat', '#543d2b');
  const matStoneBase = makeMat(scene, 'roundabout-stone-base-mat', '#64748b');
  const matWoodPole = makeMat(scene, 'roundabout-wood-pole-mat', '#3e2723');
  const matBrassGold = makeMat(scene, 'roundabout-gold-mat', '#f59e0b', '#d97706');
  const matIronDark = makeMat(scene, 'roundabout-iron-mat', '#1e293b');

  // 1. Đảo giao lộ tròn đường kính 17.5m (bán kính 8.75m)
  const islandBase = MeshBuilder.CreateCylinder('roundabout-island-base', {
    diameter: 17.5,
    height: 0.16,
    tessellation: 48,
  }, scene);
  islandBase.position.y = 0.08;
  islandBase.material = matCobble;
  islandBase.receiveShadows = true;
  islandBase.parent = root;

  // Viền đá hoa cương ngoài cùng bo tròn
  const curbRing = MeshBuilder.CreateTorus('roundabout-curb-ring', {
    diameter: 17.5,
    thickness: 0.35,
    tessellation: 48,
  }, scene);
  curbRing.position.y = 0.16;
  curbRing.material = matCurb;
  curbRing.parent = root;
  shadows?.addShadowCaster(curbRing);

  // 2. Bồn hoa tròn tầng 1 (Đường kính 9.5m, bệ cỏ nhô cao)
  const flowerBedT1 = MeshBuilder.CreateCylinder('roundabout-bed-t1', {
    diameter: 9.5,
    height: 0.28,
    tessellation: 36,
  }, scene);
  flowerBedT1.position.y = 0.22;
  flowerBedT1.material = matGrass;
  flowerBedT1.parent = root;

  // Viền đá tầng 1
  const curbT1 = MeshBuilder.CreateTorus('roundabout-curb-t1', {
    diameter: 9.5,
    thickness: 0.25,
    tessellation: 36,
  }, scene);
  curbT1.position.y = 0.35;
  curbT1.material = matCurb;
  curbT1.parent = root;

  // Trồng vòng hoa cúc & cẩm tú cầu tầng 1
  const flowerColors = ['#f43f5e', '#a855f7', '#3b82f6', '#f59e0b', '#ec4899', '#10b981'];
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const fx = Math.cos(angle) * 3.8;
    const fz = Math.sin(angle) * 3.8;
    const fColor = flowerColors[i % flowerColors.length];
    
    // Cẩm tú cầu xen kẽ
    if (i % 2 === 0 && foliage) {
      foliage.createHydrangeaBush(position.x + fx, position.z + fz, 0.75, fColor);
    } else {
      const daisy = MeshBuilder.CreateSphere(`bed-flower-${i}`, { diameter: 0.42, segments: 6 }, scene);
      daisy.position.set(fx, 0.45, fz);
      daisy.material = makeMat(scene, `bed-flower-mat-${i}`, fColor, fColor);
      daisy.parent = root;
    }
  }

  // 3. Bồn hoa tròn tầng 2 (Đường kính 4.6m, tường gạch nung đỏ rực rỡ)
  const flowerBedT2Wall = MeshBuilder.CreateCylinder('roundabout-bed-t2-wall', {
    diameter: 4.8,
    height: 0.55,
    tessellation: 28,
  }, scene);
  flowerBedT2Wall.position.y = 0.55;
  flowerBedT2Wall.material = matFlowerWall;
  flowerBedT2Wall.parent = root;
  shadows?.addShadowCaster(flowerBedT2Wall);

  const flowerBedT2Soil = MeshBuilder.CreateCylinder('roundabout-bed-t2-soil', {
    diameter: 4.4,
    height: 0.52,
    tessellation: 28,
  }, scene);
  flowerBedT2Soil.position.y = 0.58;
  flowerBedT2Soil.material = matSoil;
  flowerBedT2Soil.parent = root;

  // Hoa tulip vàng & đỏ vươn cao ở tầng 2
  const tulipColors = ['#f59e0b', '#ef4444', '#f97316', '#e11d48'];
  for (let j = 0; j < 10; j++) {
    const angle = (j / 10) * Math.PI * 2;
    const tx = Math.cos(angle) * 1.6;
    const tz = Math.sin(angle) * 1.6;
    
    // Cuống hoa xanh
    const stem = MeshBuilder.CreateCylinder(`tulip-stem-${j}`, { diameter: 0.04, height: 0.45 }, scene);
    stem.position.set(tx, 0.95, tz);
    stem.material = matGrass;
    stem.parent = root;

    // Búp hoa tulip
    const blossom = MeshBuilder.CreateSphere(`tulip-blossom-${j}`, { diameterX: 0.28, diameterY: 0.38, diameterZ: 0.28, segments: 6 }, scene);
    blossom.position.set(tx, 1.2, tz);
    blossom.material = makeMat(scene, `tulip-mat-${j}`, tulipColors[j % tulipColors.length], tulipColors[j % tulipColors.length]);
    blossom.parent = root;
    shadows?.addShadowCaster(blossom);
  }

  // 4. Bệ đá trung tâm đỡ Cột Mốc Chỉ Hướng (Square Stone Plinth)
  const stonePlinth = MeshBuilder.CreateBox('waymarker-stone-plinth', { width: 1.5, height: 0.65, depth: 1.5 }, scene);
  stonePlinth.position.set(0, 1.05, 0);
  stonePlinth.material = matStoneBase;
  stonePlinth.parent = root;
  shadows?.addShadowCaster(stonePlinth);

  // Đệm đá bo viền đồng
  const stoneTrim = MeshBuilder.CreateBox('waymarker-stone-trim', { width: 1.65, height: 0.15, depth: 1.65 }, scene);
  stoneTrim.position.set(0, 1.42, 0);
  stoneTrim.material = matBrassGold;
  stoneTrim.parent = root;

  // 5. Cột Mốc Chỉ Hướng 4 Phương (The Grand Waymarker Signpost)
  const mainPillar = MeshBuilder.CreateCylinder('waymarker-main-pillar', {
    diameterTop: 0.26,
    diameterBottom: 0.35,
    height: 4.4,
    tessellation: 16,
  }, scene);
  mainPillar.position.set(0, 3.65, 0);
  mainPillar.material = matWoodPole;
  mainPillar.parent = root;
  shadows?.addShadowCaster(mainPillar);

  // Các đai đồng mạ vàng trang trí dọc thân cột
  [1.7, 2.5, 3.3, 4.1, 4.9, 5.7].forEach((py, idx) => {
    const ring = MeshBuilder.CreateTorus(`waymarker-ring-${idx}`, { diameter: 0.36, thickness: 0.05, tessellation: 16 }, scene);
    ring.position.set(0, py, 0);
    ring.material = matBrassGold;
    ring.parent = root;
  });

  // Chóp đồng và Quả cầu La Bàn Mạ Vàng ở đỉnh (Sphere & Weather Vane)
  const topOrb = MeshBuilder.CreateSphere('waymarker-top-orb', { diameter: 0.72, segments: 16 }, scene);
  topOrb.position.set(0, 5.95, 0);
  topOrb.material = matBrassGold;
  topOrb.parent = root;
  shadows?.addShadowCaster(topOrb);

  const vaneSpire = MeshBuilder.CreateCylinder('waymarker-vane-spire', { diameterTop: 0.02, diameterBottom: 0.12, height: 0.9 }, scene);
  vaneSpire.position.set(0, 6.7, 0);
  vaneSpire.material = matBrassGold;
  vaneSpire.parent = root;

  // Mũi tên la bàn gió
  const weatherArrow = MeshBuilder.CreateBox('weather-arrow-bar', { width: 1.2, height: 0.08, depth: 0.08 }, scene);
  weatherArrow.position.set(0, 6.9, 0);
  weatherArrow.material = matIronDark;
  weatherArrow.parent = root;

  // Chữ N-S-E-W la bàn nhỏ
  const compassRing = MeshBuilder.CreateTorus('compass-ring', { diameter: 1.0, thickness: 0.04, tessellation: 20 }, scene);
  compassRing.position.set(0, 6.4, 0);
  compassRing.material = matBrassGold;
  compassRing.parent = root;

  // 6. 4 Biển Chỉ Đường 4 Phương Bằng Gỗ & Đồng (4 Directional Wooden Signs)
  // BẮC (+Z: z = 90 độ so với trục x) -> Biển & Hải Đăng
  createDirectionalSign(scene, 'BIỂN HOÀNG HÔN (180m)', Math.PI / 2, '#38bdf8', root, 4.8);

  // TÂY (-X: angle = Math.PI) -> Thung Lũng Nông Trại
  createDirectionalSign(scene, 'THUNG LŨNG NÔNG TRẠI (45m)', Math.PI, '#34d399', root, 4.1);

  // NAM (-Z: angle = -Math.PI / 2) -> Thị Trấn & Chợ Phiên
  createDirectionalSign(scene, 'THỊ TRẤN & CHỢ PHIÊN (140m)', -Math.PI / 2, '#fbbf24', root, 3.4);

  // ĐÔNG (+X: angle = 0) -> Hồ Pha Lê & Núi Thông
  createDirectionalSign(scene, 'HỒ PHA LÊ & BẾN THUYỀN (120m)', 0, '#67e8f9', root, 2.7);

  // 7. 4 Ghế gỗ tựa bo cong quanh đảo tròn để người chơi ngồi thư giãn
  if (foliage) {
    const benchDist = 6.8;
    foliage.createRusticBench(position.x + benchDist, position.z, -Math.PI / 2);
    foliage.createRusticBench(position.x - benchDist, position.z, Math.PI / 2);
    foliage.createRusticBench(position.x, position.z + benchDist, Math.PI);
    foliage.createRusticBench(position.x, position.z - benchDist, 0);

    // 4 Cột đèn đường cổ điển thắp sáng lung linh tại 4 góc
    const lampDist = 7.6;
    const diag = lampDist * 0.707;
    foliage.createVintageStreetLamp(position.x + diag, position.z + diag);
    foliage.createVintageStreetLamp(position.x - diag, position.z + diag);
    foliage.createVintageStreetLamp(position.x + diag, position.z - diag);
    foliage.createVintageStreetLamp(position.x - diag, position.z - diag);
  }

  return {
    root,
    update(time) {
      if (weatherArrow) {
        // Nhẹ nhàng đung đưa chỉ hướng gió
        weatherArrow.rotation.y = Math.sin(time * 0.6) * 0.35 + 0.5;
      }
    }
  };
}
