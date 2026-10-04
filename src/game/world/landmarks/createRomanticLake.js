/**
 * createRomanticLake.js
 * 
 * Authentic "Cozy Farmy" (cozyfarmy.com) Teardrop Lagoon & Sandy Shore Pier.
 * Features:
 * - Organic Teardrop / Heart-like mathematical lagoon contour.
 * - Multi-tiered water gradient: Light turquoise cyan shallows (#67e8f9) -> Deep azure core (#0284c7).
 * - Wide warm sandy beach shoreline (#f6d59b) hugging the perimeter.
 * - Sandy path spur connecting the road directly to the dock.
 * - Charming rustic wooden plank pier with dual mooring bollards & coiled ropes.
 * - Scattered flat-shaded low-poly river pebbles & smooth boulders (#94a3b8, #64748b, #cbd5e1).
 * - Floating round lily pads with pie notches and blooming pink/white lotus flowers.
 * - Swimming fish silhouettes gently gliding under the turquoise water.
 * - Delicate water reeds and cattails along the sandy bank.
 */

import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import {
  createLakeWaterTexture,
  createStylizedWaterMaterial,
  applyBuoyancyToObject,
  createWaterRippleRingSystem,
  createChibiKoiFish,
  createWaterSunSparkles,
  createRiverbankTexture,
  createRiverFoamTexture,
} from '../nature/StylizedWaterEngine.js';
import { getRiverWestBankX } from '../nature/GrandWindingRiver.js';
import {
  createWetSandMaterial,
  createClusteredShorePebbles,
  createScenicFishingPerch,
  createWeepingWillow,
  createRomanticTreeSwing,
  createBioluminescentFireflies,
  createLakesideWildflowerMeadow,
  createChibiDragonflies,
  createDriftingPetals,
  createLakesideRusticBench,
  createVintageRowingBoat,
} from '../nature/CinematicWaterfrontDecor.js';
import { MODEL_PATHS, spawnModelSync } from '../../rendering/ModelAssetManager.js';

export const LAKE_CENTER = Object.freeze({ x: 167, z: 2 });
const SEGMENTS = 96;

export { getRiverWestBankX };

/**
 * Mathematical Teardrop / Grand Heart Lagoon contour (Play Together & Cozy Ghibli).
 * - Mở rộng quy mô diện tích Hồ Pha Lê lớn hơn rõ rệt (rz = 66m)
 * - Mép phía Đông được SNAP chính xác 100% vào bờ Tây của Sông Uốn Lượn,
 *   triệt tiêu 100% hiện tượng đĩa bán nguyệt đè lên sông và triệt tiêu hoàn toàn Z-fighting nhấp nháy!
 * - Bờ Tây vịnh nước bao la ôm trọn Bến Câu Cá & Veranda
 */
export function lakeEdge(angle, scale = 1) {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const shape = 1.0
    + 0.10 * Math.sin(angle)
    - 0.06 * Math.cos(2 * angle)
    + 0.04 * Math.sin(2 * angle + 0.45);

  const rz = 66;
  const outerZ = LAKE_CENTER.z + sinA * rz * shape;
  let outerX;

  if (cosA >= 0) {
    // Phía Đông tiếp giáp Sông Uốn Lượn
    if (outerZ >= -36.0 && outerZ <= 44.0) {
      // Cửa Vịnh Hòa Lưu: Khớp mộng tuyệt đối 100% vào bờ Tây của Sông (Diff: 0.000m)
      outerX = getRiverWestBankX(outerZ);
    } else if (outerZ < -36.0 && outerZ >= -52.0) {
      // Mũi Nam: Chuyển tiếp mượt mà dạng Hermite từ đường bờ sông sang đường cong bờ hồ
      const t = (outerZ - (-52.0)) / (-36.0 - (-52.0));
      const smoothT = t * t * (3 - 2 * t);
      const ellX = LAKE_CENTER.x + cosA * 48 * shape;
      const rivX = getRiverWestBankX(outerZ);
      outerX = ellX + (rivX - ellX) * smoothT;
    } else if (outerZ > 44.0 && outerZ <= 60.0) {
      // Mũi Bắc: Chuyển tiếp mượt mà dạng Hermite từ đường bờ sông sang đường cong bờ hồ
      const t = (60.0 - outerZ) / (60.0 - 44.0);
      const smoothT = t * t * (3 - 2 * t);
      const ellX = LAKE_CENTER.x + cosA * 48 * shape;
      const rivX = getRiverWestBankX(outerZ);
      outerX = ellX + (rivX - ellX) * smoothT;
    } else {
      outerX = LAKE_CENTER.x + cosA * 48 * shape;
    }
  } else {
    // Phía Tây (Bến câu cá & Sandy Shore Promenade)
    outerX = LAKE_CENTER.x + cosA * (48 + 16 * cosA) * shape;
  }

  // Nội suy hướng tâm chuẩn xác cho các vòng đĩa đồng tâm bên trong
  if (scale === 1.0) {
    return { x: outerX, z: outerZ };
  }
  return {
    x: LAKE_CENTER.x + (outerX - LAKE_CENTER.x) * scale,
    z: LAKE_CENTER.z + (outerZ - LAKE_CENTER.z) * scale,
  };
}

function createMat(scene, name, diffuseHex, ambientHex = null, specularHex = null, alpha = 1.0) {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = Color3.FromHexString(diffuseHex);
  mat.ambientColor = ambientHex ? Color3.FromHexString(ambientHex) : mat.diffuseColor.scale(0.38);
  mat.specularColor = specularHex ? Color3.FromHexString(specularHex) : new Color3(0.04, 0.04, 0.04);
  mat.specularPower = 32;
  mat.alpha = alpha;
  mat.backFaceCulling = false;
  return mat;
}

function createLakeRing(scene, name, innerScale, outerScale, yInner, yOuter, mat, segments = SEGMENTS) {
  // Dải bờ cát mở hình móng ngựa ôm từ Mũi Bắc (angle = 0.65, z ≈ 44.5) vòng qua Tây xuống Mũi Nam (angle = 5.58, z ≈ -36.5)
  // Cửa hòa lưu phía Đông (z in [-36, 44]) hoàn toàn thông suốt 100% không có cát chắn ngang
  const angleStart = 0.65;
  const angleEnd = Math.PI * 2 - 0.70;
  const totalSteps = Math.round(segments * ((angleEnd - angleStart) / (Math.PI * 2)));

  const paths = [[], []];
  for (let i = 0; i <= totalSteps; i++) {
    const angle = angleStart + (i / totalSteps) * (angleEnd - angleStart);
    const a = lakeEdge(angle, innerScale);
    const b = lakeEdge(angle, outerScale);
    paths[0].push(new Vector3(a.x, yInner, a.z));
    paths[1].push(new Vector3(b.x, yOuter, b.z));
  }
  const mesh = MeshBuilder.CreateRibbon(name, {
    pathArray: paths,
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  mesh.material = mat;
  mesh.isPickable = false;
  return mesh;
}

function createScallopedLakeFoam(scene, name, innerScale, outerScale, y, mat, segments = SEGMENTS) {
  // Dải bọt sóng bờ hồ chạy dọc theo bờ cát từ 0.65 đến 2*PI - 0.70, để hở hoàn toàn cửa hòa lưu
  const angleStart = 0.65;
  const angleEnd = Math.PI * 2 - 0.70;
  const totalSteps = Math.round(segments * ((angleEnd - angleStart) / (Math.PI * 2)));

  const paths = [[], []];
  for (let i = 0; i <= totalSteps; i++) {
    const tFrac = i / totalSteps;
    const angle = angleStart + tFrac * (angleEnd - angleStart);
    // Tapering fade: Thu nhọn độ dày bọt về 0 ở 2 đầu mép cửa hòa lưu để bọt tan êm dịu vào dòng nước
    const taper = Math.sin(tFrac * Math.PI);
    const scallop = 1.0 + (0.016 * Math.sin(angle * 32) + 0.008 * Math.cos(angle * 64)) * taper;
    const currentOuter = innerScale + (outerScale - innerScale) * taper;
    const a = lakeEdge(angle, innerScale * scallop);
    const b = lakeEdge(angle, currentOuter * scallop);
    paths[0].push(new Vector3(a.x, y, a.z));
    paths[1].push(new Vector3(b.x, y, b.z));
  }
  const mesh = MeshBuilder.CreateRibbon(name, {
    pathArray: paths,
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  mesh.material = mat;
  mesh.isPickable = false;
  return mesh;
}

export function* createRomanticLakeSteps(scene, shadows = null) {
  const root = new TransformNode('cozy-teardrop-lake-root', scene);
  const meshes = [];

  // ==========================================
  // 1. VẬT LIỆU MẶT NƯỚC 3D CHÂN THẬT (REALISTIC 3D WATER MATERIAL)
  // ==========================================
  const lakeTex = createLakeWaterTexture(scene, 256);
  const matWaterToon = createStylizedWaterMaterial(scene, 'lake-toon-water-mat', lakeTex, {
    diffuseColor: Color3.White(),
    emissiveColor: Color3.FromHexString('#0096c7').scale(0.28),
    specularColor: new Color3(0.65, 0.80, 0.95),
    specularPower: 48,
    bumpTexture: null,
    alpha: 1.0,
    useFresnel: false,
  });
  matWaterToon.useVertexColors = false;
  matWaterToon.needDepthPrePass = false;
  matWaterToon.forceDepthWrite = false;
  matWaterToon.backFaceCulling = false;
  matWaterToon.zOffset = 0;

  const matWaterDeep = createMat(scene, 'lake-deep-water-mat', '#0284c7', '#0369a1', '#67e8f9', 1.0);
  matWaterDeep.specularPower = 64;

  // Dải bọt trắng mép bờ mềm mại tự nhiên
  const lakeFoamTex = createRiverFoamTexture(scene, 256);
  const matLakeFoam = createMat(scene, 'lake-shore-foam-mat', '#ffffff', '#ffffff', '#ffffff', 0.80);
  if (lakeFoamTex && typeof lakeFoamTex.getClassName === 'function') {
    matLakeFoam.diffuseTexture = lakeFoamTex;
  }
  matLakeFoam.disableLighting = true;

  // Cát bờ hồ tự nhiên (kết hợp cát ẩm, sỏi suối mài nhẵn)
  const lakeSandTex = createRiverbankTexture(scene, 256);
  if (lakeSandTex && lakeSandTex.uScale !== undefined) {
    lakeSandTex.uScale = 8;
    lakeSandTex.vScale = 8;
  }
  const matSandShore = createMat(scene, 'lake-sand-shore-mat', '#ffffff', '#ffffff', '#ffffff', 1.0);
  if (lakeSandTex && typeof lakeSandTex.getClassName === 'function') {
    matSandShore.diffuseTexture = lakeSandTex;
  }
  matSandShore.ambientColor = new Color3(0.55, 0.55, 0.55);
  matSandShore.specularPower = 28;

  const matSandSpur = createMat(scene, 'lake-sand-spur-mat', '#ffffff', '#ffffff', '#ffffff', 1.0);
  if (lakeSandTex && typeof lakeSandTex.getClassName === 'function') {
    matSandSpur.diffuseTexture = lakeSandTex;
  }
  matSandSpur.ambientColor = new Color3(0.55, 0.55, 0.55);
  matSandSpur.specularPower = 28;

  const matWoodDeck = createMat(scene, 'lake-pier-wood-deck', '#b45309', '#92400e');
  const matWoodPlankAlt = createMat(scene, 'lake-pier-wood-alt', '#a16207', '#78350f');
  const matWoodPost = createMat(scene, 'lake-pier-post-mat', '#78350f', '#451a03');
  const matRope = createMat(scene, 'lake-pier-rope-mat', '#fbbf24', '#f59e0b');

  // Màu sắc vọng lâu trà thất phong cách Nordic / Ghibli Play Together
  const matPavilionRoof = createMat(scene, 'lake-pavilion-roof-mat', '#0d9488', '#0f766e');
  const matPavilionRoofTrim = createMat(scene, 'lake-pavilion-trim-mat', '#ffffff', '#f1f5f9');
  const matPavilionPillars = createMat(scene, 'lake-pavilion-pillar-mat', '#fdfbf7', '#f1f5f9');
  const matPavilionRailing = createMat(scene, 'lake-pavilion-railing-mat', '#d4a373', '#b45309');
  const matPlinthStone = createMat(scene, 'lake-pavilion-plinth-stone', '#e2e8f0', '#cbd5e1');

  // Màu sắc ki-ốt bến câu cá & sọc bạt che (Play Together Fishing Kiosk Stripes)
  const matAwningBlue = createMat(scene, 'lake-kiosk-awning-blue', '#0284c7', '#0369a1');
  const matAwningWhite = createMat(scene, 'lake-kiosk-awning-white', '#ffffff', '#f8fafc');
  const matLifebuoyRed = createMat(scene, 'lake-pier-lifebuoy-red', '#ef4444', '#dc2626');
  const matFlowerPetalPink = createMat(scene, 'lake-flower-petal-pink', '#f472b6', '#ec4899');
  const matFlowerPetalWhite = createMat(scene, 'lake-flower-petal-white', '#ffffff', '#f8fafc');

  // Sỏi suối mài nhẵn xám pastel, loại bỏ màu xanh chuối chói
  const matPebble1 = createMat(scene, 'lake-pebble-1', '#94a3b8');
  const matPebble2 = createMat(scene, 'lake-pebble-2', '#64748b');
  const matPebble3 = createMat(scene, 'lake-pebble-3', '#cbd5e1');
  const matPebbleMoss = createMat(scene, 'lake-pebble-moss', '#94a3b8', '#64748b');

  const matLilyPad = createMat(scene, 'lake-lily-pad-mat', '#22c55e', '#15803d');
  const matLotusPetal = createMat(scene, 'lake-lotus-petal-mat', '#f472b6', '#fbcfe8');
  const matLotusCenter = createMat(scene, 'lake-lotus-center-mat', '#facc15', '#eab308');

  const matFish = createMat(scene, 'lake-fish-shadow-mat', '#0e7490', '#155e75', null, 0.75);
  const matReedStalk = createMat(scene, 'lake-reed-stalk-mat', '#65a30d');
  const matReedHead = createMat(scene, 'lake-reed-head-mat', '#78350f');
  yield;

  // ==========================================
  // 2. MẶT NƯỚC HỒ PHA LÊ HỢP NHẤT TOÀN DIỆN (UNIFIED POLAR GRID WATER)
  // Đỉnh cao đồ họa Ghibli & Play Together:
  // - 1 Mesh duy nhất liền mạch 100%, 0 phân mảng, 0 giật cấp, 0 vết nứt
  // - 5 Vòng đĩa đồng tâm đa tầng kết hợp Vertex Colors chuyển sắc liên tục:
  //   + Tâm hồ: Xanh ngọc bích sẫm sâu lắng (#0077b6 -> #023e8a)
  //   + Vùng nước trung gian: Xanh cerulean (#0ea5e9)
  //   + Thềm nước nông: Ngọc lam tươi sáng (#38bdf8 -> #67e8f9)
  //   + Mép bờ cát: Trong suốt bừng ánh dương (#a5f3fc)
  // - Toàn bộ bề mặt hiển thị trọn vẹn mạng caustics lụa hữu cơ và đốm sao ánh dương 4 cánh
  // - Snap khớp mộng 100% vào bờ Tây của Sông Uốn Lượn tại Vịnh Hòa Lưu
  // 2. Mặt Nước Hồ Pha Lê Lưới Đĩa Đồng Tâm (Unified Polar Grid, y = 0.082m)
  const lakeRings = [0.25, 0.50, 0.72, 0.88, 1.0]; // Vành ngoài cùng chạm 100% mép bờ sông

  const lakePositions = [LAKE_CENTER.x, 0.082, LAKE_CENTER.z];
  const lakeUvs = [LAKE_CENTER.x / 16.0, LAKE_CENTER.z / 16.0];
  const lakeIndices = [];

  for (let k = 0; k < lakeRings.length; k++) {
    const rScale = lakeRings[k];
    for (let i = 0; i < SEGMENTS; i++) {
      const angle = (i / SEGMENTS) * Math.PI * 2;
      const pt = lakeEdge(angle, rScale);
      lakePositions.push(pt.x, 0.082, pt.z);
      lakeUvs.push(pt.x / 16.0, pt.z / 16.0);
    }
  }

  // Quạt tâm (Center fan) - Chuẩn CCW để Normal Y dương hướng thẳng đứng lên trời (+Y)
  for (let i = 0; i < SEGMENTS; i++) {
    lakeIndices.push(0, 1 + i, 1 + ((i + 1) % SEGMENTS));
  }

  // Các dải vành đồng tâm (Concentric ring quads) - Chuẩn CCW để Normal Y dương hướng thẳng đứng lên trời (+Y)
  for (let k = 1; k < lakeRings.length; k++) {
    const startCur = 1 + (k - 1) * SEGMENTS;
    const startNext = 1 + k * SEGMENTS;
    for (let i = 0; i < SEGMENTS; i++) {
      const iCur0 = startCur + i;
      const iCur1 = startCur + ((i + 1) % SEGMENTS);
      const iNext0 = startNext + i;
      const iNext1 = startNext + ((i + 1) % SEGMENTS);
      lakeIndices.push(iCur0, iNext0, iCur1);
      lakeIndices.push(iCur1, iNext0, iNext1);
    }
  }

  const water = new Mesh('crystal-lake', scene);
  const lakeGeom = new VertexData();
  lakeGeom.positions = lakePositions;
  lakeGeom.indices = lakeIndices;
  lakeGeom.uvs = lakeUvs;

  // Tangents & Normals thẳng đứng (+Y) để nhận ánh nắng mặt trời rực rỡ chuẩn Ghibli
  const lakeNormals = new Float32Array(lakePositions.length);
  for (let i = 1; i < lakeNormals.length; i += 3) lakeNormals[i] = 1;
  lakeGeom.normals = lakeNormals;

  const lakeTangents = new Float32Array((lakePositions.length / 3) * 4);
  for (let i = 0; i < lakeTangents.length; i += 4) {
    lakeTangents[i] = 1;
    lakeTangents[i + 3] = 1;
  }
  lakeGeom.tangents = lakeTangents;

  lakeGeom.applyToMesh(water);
  water.material = matWaterToon;
  water.isPickable = false;
  water.parent = root;
  meshes.push(water);

  // D. Dải bọt trắng mép bờ cát có hiệu ứng nhịp thở (y = 0.086m, zOffset = -3)
  const lakeFoamRing = createScallopedLakeFoam(scene, 'lake-shoreline-foam', 0.975, 1.018, 0.086, matLakeFoam);
  matLakeFoam.zOffset = -3;
  lakeFoamRing.parent = root;
  meshes.push(lakeFoamRing);
  yield;

  // ==========================================
  // 3. BỜ CÁT VÀNG MỊN (SANDY SHORELINE)
  // ==========================================
  // Vành cát vàng ấm bao bọc trọn vẹn mép hồ, thoải từ mép nước 0.083m lên bờ cỏ 0.095m
  const sandShore = createLakeRing(scene, 'lake-sandy-shore', 1.001, 1.18, 0.083, 0.095, matSandShore);
  sandShore.parent = root;
  meshes.push(sandShore);

  // Dải cát vàng nối từ đường đất chính sang đầu bến tàu (Sand Spur to Pier)
  const sandSpur = MeshBuilder.CreateBox('lake-sand-spur-path', {
    width: 18,
    height: 0.03,
    depth: 4.8,
  }, scene);
  sandSpur.position.set(133, 0.084, 2);
  sandSpur.material = matSandSpur;
  sandSpur.isPickable = false;
  sandSpur.parent = root;
  meshes.push(sandSpur);

  // ==========================================
  // 3B. ĐỊA CHẤT ĐA TẦNG & CẢNH QUAN ĐIỆN ẢNH BỜ HỒ (CINEMATIC WATERFRONT DECOR)
  // ==========================================

  // B. Bãi đá cuội suối tự nhiên ven bờ (Clustered Shore Pebbles)
  const shorePebbles = createClusteredShorePebbles(scene, root, [
    { x: 142.0, y: 0.085, z: 12.0, count: 4, radius: 2.2, scale: 1.1 },
    { x: 144.5, y: 0.085, z: -26.0, count: 5, radius: 2.5, scale: 1.0 },
    { x: 172.0, y: 0.090, z: 66.0, count: 4, radius: 2.0, scale: 1.2 },
    { x: 161.0, y: 0.088, z: -52.0, count: 4, radius: 2.2, scale: 1.1 },
  ], shadows);
  meshes.push(shorePebbles);

  // C. Mỏm đá phẳng câu cá ngắm cảnh mộc mạc (Scenic Fishing Rock Perch)
  const fishingPerch = createScenicFishingPerch(scene, root, {
    x: 140.5,
    y: 0.085,
    z: -18.0,
    rotationY: 0.45,
    scale: 1.15,
  }, shadows);
  meshes.push(fishingPerch);

  // D. Hàng cây liễu rủ bóng nước Ghibli (Weeping Willows on Dry Shoreline)
  // Toàn bộ gốc cây cắm vững chắc 100% trên bờ cỏ khô ráo (scale 1.25 - 1.30, ngoài mép cát),
  // tuyệt đối không có cây nào dựng dưới nước!
  const willowConfigs = [
    { x: 131.7, y: 0.095, z: 56.1, scale: 1.25, rotY: -0.5 },  // Tây Bắc (NW)
    { x: 132.3, y: 0.095, z: -43.7, scale: 1.25, rotY: 0.8, withSwing: true }, // Tây Nam (WS - có xích đu)
    { x: 160.8, y: 0.095, z: -76.5, scale: 1.30, rotY: 1.6 },  // Bờ Nam (S)
    { x: 193.0, y: 0.095, z: -64.5, scale: 1.25, rotY: 2.4 },  // Đông Nam (SE)
    { x: 178.8, y: 0.095, z: 96.3, scale: 1.30, rotY: -1.2 },  // Bờ Bắc (N)
  ];

  willowConfigs.forEach((wc, wIdx) => {
    const willow = createWeepingWillow(scene, root, {
      x: wc.x,
      y: wc.y,
      z: wc.z,
      scale: wc.scale,
      rotationY: wc.rotY,
    }, shadows);
    meshes.push(willow);

    if (wc.withSwing) {
      // Xích đu gỗ lãng mạn dưới tán liễu hướng về phía hoàng hôn
      const swing = createRomanticTreeSwing(scene, root, {
        x: wc.x + 1.8,
        y: wc.y,
        z: wc.z + 0.8,
        rotationY: wc.rotY,
      });
      meshes.push(swing);
    }
  });

  // E. Thảm hoa dại đa sắc ven hồ & chân gốc liễu (Lakeside Wildflower Meadow)
  const lakesideFlowers = createLakesideWildflowerMeadow(scene, root, [
    { x: 133.5, y: 0.095, z: 54.0, count: 6 },  // Gốc liễu Tây Bắc
    { x: 134.2, y: 0.095, z: -41.5, count: 6 }, // Gốc liễu Tây Nam
    { x: 159.0, y: 0.095, z: -74.0, count: 5 }, // Bờ Nam hồ
    { x: 191.0, y: 0.095, z: -62.0, count: 5 }, // Đông Nam hồ
    { x: 176.5, y: 0.095, z: 93.5, count: 6 },  // Bờ Bắc hồ
    { x: 138.0, y: 0.095, z: 2.0, count: 4 },   // Lối dẫn ra bến tàu
  ]);
  meshes.push(lakesideFlowers);

  // F. Ghế dài gỗ mộc & đèn bão ngắm cảnh hồ (Scenic Lakeside Benches)
  const benchWest = createLakesideRusticBench(scene, root, {
    x: 135.2,
    y: 0.095,
    z: -14.0,
    rotationY: 0.40,
  }, shadows);
  meshes.push(benchWest);

  const benchNorth = createLakesideRusticBench(scene, root, {
    x: 170.5,
    y: 0.095,
    z: 90.0,
    rotationY: Math.PI - 0.15,
  }, shadows);
  meshes.push(benchNorth);

  // G. Thuyền gỗ chèo tay mộc mạc neo bên cầu tàu (Vintage Moored Rowing Boat)
  const vintageBoat = createVintageRowingBoat(scene, root, {
    x: 156.5,
    y: 0.076,
    z: -5.2,
    rotationY: 0.32,
  }, shadows);
  meshes.push(vintageBoat);

  // H. Chuồn chuồn kim lướt sóng & Cánh hoa bồng bềnh (Dragonflies & Petals)
  const dragonflies = createChibiDragonflies(scene, root, 4, { x: 164, z: 6 });
  meshes.push(dragonflies);

  const driftingPetals = createDriftingPetals(scene, root, 22, {
    minX: 145,
    maxX: 205,
    minZ: -35,
    maxZ: 35,
  });
  meshes.push(driftingPetals);

  // I. CÂY ĐẠI THỤ THU VÀNG & ĐÈN BÃO ĐẦU CẦU VÒM PHÍA NAM (SOUTH BRIDGE ENTRANCE FLORA)
  // Hai cây đại thụ rợp bóng 2 bên đầu cầu nơi người chơi đi qua, khung cảnh rực rỡ chuẩn Ghibli
  spawnModelSync(scene, MODEL_PATHS.trees.fall, {
    name: 'lake-bridge-fall-tree-west',
    position: new Vector3(146.0, 0.10, -57.5),
    scaling: new Vector3(2.6, 2.6, 2.6),
    rotation: new Vector3(0, 0.4, 0),
    shadows,
    parent: root,
  });
  spawnModelSync(scene, MODEL_PATHS.trees.detailed, {
    name: 'lake-bridge-oak-tree-east',
    position: new Vector3(158.5, 0.10, -60.0),
    scaling: new Vector3(2.5, 2.5, 2.5),
    rotation: new Vector3(0, -0.6, 0),
    shadows,
    parent: root,
  });
  spawnModelSync(scene, MODEL_PATHS.town.lantern, {
    name: 'lake-bridge-lamp-west',
    position: new Vector3(148.2, 0.10, -56.0),
    scaling: new Vector3(1.2, 1.2, 1.2),
    shadows,
    parent: root,
  });
  spawnModelSync(scene, MODEL_PATHS.town.lantern, {
    name: 'lake-bridge-lamp-east',
    position: new Vector3(154.2, 0.10, -58.0),
    scaling: new Vector3(1.2, 1.2, 1.2),
    shadows,
    parent: root,
  });

  // J. CÂY BỜ TÂY & LỐI DẪN RA CẦU TÀU (WEST PROMENADE TREES)
  spawnModelSync(scene, MODEL_PATHS.trees.fall, {
    name: 'lake-west-pier-tree-north',
    position: new Vector3(131.0, 0.10, 16.0),
    scaling: new Vector3(2.4, 2.4, 2.4),
    rotation: new Vector3(0, 1.1, 0),
    shadows,
    parent: root,
  });
  spawnModelSync(scene, MODEL_PATHS.trees.detailed, {
    name: 'lake-west-pier-tree-south',
    position: new Vector3(130.5, 0.10, -18.0),
    scaling: new Vector3(2.4, 2.4, 2.4),
    rotation: new Vector3(0, -0.9, 0),
    shadows,
    parent: root,
  });

  // ==========================================
  // 4. BẾN CÂU CÁ PLAY TOGETHER & KI-ỐT BÁN MỒI CÂU (FISHING DOCK & BAIT KIOSK)
  // Tọa lạc tại bến nước bờ Tây hồ Pha Lê, vươn dài ra vùng nước sâu
  // ==========================================
  const pierRoot = new TransformNode('lake-rustic-pier-root', scene);
  pierRoot.position.set(153, 0.22, 2);
  pierRoot.parent = root;

  // Khung dầm chịu lực dưới sàn cầu tàu dài 18.2m
  const beamNorth = MeshBuilder.CreateBox('pier-beam-n', { width: 18.2, height: 0.24, depth: 0.28 }, scene);
  beamNorth.position.set(0, -0.12, 1.45);
  beamNorth.material = matWoodPost;
  beamNorth.parent = pierRoot;

  const beamSouth = MeshBuilder.CreateBox('pier-beam-s', { width: 18.2, height: 0.24, depth: 0.28 }, scene);
  beamSouth.position.set(0, -0.12, -1.45);
  beamSouth.material = matWoodPost;
  beamSouth.parent = pierRoot;

  // 6 Cặp cọc gỗ cắm đáy hồ đỡ thân cầu tàu
  [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5].forEach((ox, idx) => {
    [1.45, -1.45].forEach((oz, sIdx) => {
      const p = MeshBuilder.CreateCylinder(`pier-under-pile-${idx}-${sIdx}`, {
        height: 1.8,
        diameter: 0.28,
        tessellation: 8,
      }, scene);
      p.position.set(ox, -0.72, oz);
      p.material = matWoodPost;
      p.parent = pierRoot;
      shadows?.addShadowCaster(p);
    });
  });

  // 28 Tấm ván gỗ lát sàn cầu tàu với màu sắc ấm áp tự nhiên
  const plankCount = 28;
  const plankLength = 17.8;
  const step = plankLength / plankCount;
  for (let i = 0; i < plankCount; i++) {
    const px = -plankLength * 0.5 + i * step + step * 0.5;
    const plank = MeshBuilder.CreateBox(`pier-plank-${i}`, {
      width: step * 0.88,
      height: 0.12,
      depth: 3.4,
    }, scene);
    plank.position.set(px, 0.06, 0);
    plank.material = (i % 3 === 0) ? matWoodPlankAlt : matWoodDeck;
    plank.parent = pierRoot;
    shadows?.addShadowCaster(plank);
  }

  // Ki-ốt bến câu cá với mái bạt sọc xanh trắng Play Together (Fishing Bait Kiosk)
  const kioskGroup = new TransformNode('pier-fishing-kiosk', scene);
  kioskGroup.position.set(-6.8, 0, 0);
  kioskGroup.parent = pierRoot;

  // Quầy gỗ tính tiền & trưng bày đồ câu
  const kioskCounter = MeshBuilder.CreateBox('kiosk-counter', { width: 2.2, height: 0.95, depth: 1.1 }, scene);
  kioskCounter.position.set(0, 0.52, -0.9);
  kioskCounter.material = matWoodDeck;
  kioskCounter.parent = kioskGroup;
  shadows?.addShadowCaster(kioskCounter);

  // 4 Cột đỡ mái che sọc
  [[-0.95, -1.35], [0.95, -1.35], [-0.95, -0.45], [0.95, -0.45]].forEach(([cx, cz], cIdx) => {
    const post = MeshBuilder.CreateCylinder(`kiosk-post-${cIdx}`, { height: 2.3, diameter: 0.10 }, scene);
    post.position.set(cx, 1.25, cz);
    post.material = matWoodPost;
    post.parent = kioskGroup;
  });

  // Mái bạt sọc xanh dương & trắng uốn cong đặc trưng Play Together (Striped Canvas Awning)
  for (let s = 0; s < 6; s++) {
    const stripe = MeshBuilder.CreateBox(`kiosk-awning-stripe-${s}`, {
      width: 2.1 / 6,
      height: 0.08,
      depth: 1.35,
    }, scene);
    stripe.position.set(-0.875 + s * (2.1 / 6), 2.35, -0.9);
    stripe.rotation.x = 0.15;
    stripe.material = (s % 2 === 0) ? matAwningBlue : matAwningWhite;
    stripe.parent = kioskGroup;
    shadows?.addShadowCaster(stripe);
  }

  // Biển hiệu gỗ "TIỆM CÂU CÁ" với biểu tượng cá
  const kioskSign = MeshBuilder.CreateBox('kiosk-signboard', { width: 1.6, height: 0.42, depth: 0.08 }, scene);
  kioskSign.position.set(0, 2.58, -0.25);
  kioskSign.material = matWoodPlankAlt;
  kioskSign.parent = kioskGroup;

  // Phao cứu sinh móc bên thành ki-ốt
  const pierBuoy = MeshBuilder.CreateTorus('pier-kiosk-lifebuoy', { diameter: 0.55, thickness: 0.14, tessellation: 12 }, scene);
  pierBuoy.rotation.y = Math.PI / 2;
  pierBuoy.position.set(-1.02, 1.3, -0.9);
  pierBuoy.material = matLifebuoyRed;
  pierBuoy.parent = kioskGroup;

  // Thùng gỗ chứa dụng cụ câu cá & mồi giun
  const tackleCrate = MeshBuilder.CreateBox('pier-tackle-crate', { width: 0.65, height: 0.45, depth: 0.55 }, scene);
  tackleCrate.position.set(0.65, 0.28, 1.0);
  tackleCrate.material = matWoodDeck;
  tackleCrate.parent = pierRoot;

  // Ghế câu cá gấp di động ven mép nước (Fisherman's Foldable Chair)
  const fishChair = MeshBuilder.CreateBox('pier-fisherman-chair', { width: 0.65, height: 0.42, depth: 0.65 }, scene);
  fishChair.position.set(4.8, 0.28, -0.95);
  fishChair.material = matAwningBlue;
  fishChair.parent = pierRoot;
  shadows?.addShadowCaster(fishChair);

  // Cần câu cá thứ 2 cắm hướng ra lòng hồ sâu
  const rod2 = MeshBuilder.CreateCylinder('pier-fishing-rod-2', { diameterTop: 0.02, diameterBottom: 0.06, height: 3.4 }, scene);
  rod2.position.set(7.5, 0.9, -1.2);
  rod2.rotation.z = -Math.PI / 5;
  rod2.rotation.y = -0.35;
  rod2.material = matWoodPost;
  rod2.parent = pierRoot;

  // Phao câu nổi đỏ trắng trên mặt nước (Fishing Bobber)
  const bobber = MeshBuilder.CreateSphere('pier-fishing-bobber', { diameter: 0.22, segments: 6 }, scene);
  bobber.position.set(10.2, -0.15, -2.4);
  bobber.material = matLifebuoyRed;
  bobber.parent = pierRoot;

  // 2 Cọc gỗ buộc thuyền nhô cao ở đầu bến tàu (Mooring Bollards)
  const bollardPositions = [
    { x: 8.8, z: 1.45 },
    { x: 8.8, z: -1.45 },
  ];
  bollardPositions.forEach((bp, idx) => {
    const post = MeshBuilder.CreateCylinder(`pier-mooring-post-${idx}`, {
      height: 1.15,
      diameterTop: 0.32,
      diameterBottom: 0.38,
      tessellation: 8,
    }, scene);
    post.position.set(bp.x, 0.50, bp.z);
    post.material = matWoodPost;
    post.parent = pierRoot;
    shadows?.addShadowCaster(post);

    const cap = MeshBuilder.CreateSphere(`pier-post-cap-${idx}`, { diameter: 0.36, segments: 6 }, scene);
    cap.position.set(bp.x, 1.08, bp.z);
    cap.scaling.y = 0.45;
    cap.material = matWoodPost;
    cap.parent = pierRoot;

    const rope = MeshBuilder.CreateTorus(`pier-post-rope-${idx}`, { diameter: 0.42, thickness: 0.09, tessellation: 12 }, scene);
    rope.position.set(bp.x, 0.38, bp.z);
    rope.material = matRope;
    rope.parent = pierRoot;
  });

  // Ghế gỗ dài bến câu cá ngắm hồ (Fisherman's Lake-view Bench)
  const benchSeat = MeshBuilder.CreateBox('pier-bench-seat', { width: 2.0, height: 0.08, depth: 0.55 }, scene);
  benchSeat.position.set(2.5, 0.38, -1.15);
  benchSeat.material = matWoodDeck;
  benchSeat.parent = pierRoot;
  shadows?.addShadowCaster(benchSeat);

  const benchBack = MeshBuilder.CreateBox('pier-bench-back', { width: 2.0, height: 0.55, depth: 0.08 }, scene);
  benchBack.position.set(2.5, 0.65, -1.40);
  benchBack.material = matWoodDeck;
  benchBack.parent = pierRoot;
  shadows?.addShadowCaster(benchBack);

  // 4C. MỞ RỘNG CẦU TÀU HÌNH CHỮ T (GRAND T-SHAPED FISHING PROMENADE)
  // Hai cánh cầu tàu vươn rộng ra vùng nước sâu phía Bắc & Nam, tạo không gian câu cá & ngắm cảnh hồ bao la
  [-1, 1].forEach((dir, tIdx) => {
    // Sàn gỗ vươn ngang 3.8m mỗi bên
    const tWing = MeshBuilder.CreateBox(`pier-t-wing-${tIdx}`, { width: 3.4, height: 0.12, depth: 3.8 }, scene);
    tWing.position.set(8.2, 0.06, dir * 3.4);
    tWing.material = matWoodDeck;
    tWing.parent = pierRoot;
    shadows?.addShadowCaster(tWing);

    // Dầm đỡ dưới cánh chữ T
    const tBeam = MeshBuilder.CreateBox(`pier-t-beam-${tIdx}`, { width: 0.28, height: 0.24, depth: 3.8 }, scene);
    tBeam.position.set(8.2, -0.12, dir * 3.4);
    tBeam.material = matWoodPost;
    tBeam.parent = pierRoot;

    // Cọc cắm đáy hồ cho cánh chữ T
    const tPile = MeshBuilder.CreateCylinder(`pier-t-pile-${tIdx}`, { height: 1.8, diameter: 0.28, tessellation: 8 }, scene);
    tPile.position.set(8.2, -0.72, dir * 5.0);
    tPile.material = matWoodPost;
    tPile.parent = pierRoot;
    shadows?.addShadowCaster(tPile);

    // Cọc buộc thuyền ở 2 đầu cánh chữ T
    const wingBollard = MeshBuilder.CreateCylinder(`pier-wing-bollard-${tIdx}`, { height: 1.15, diameter: 0.30, tessellation: 8 }, scene);
    wingBollard.position.set(8.2, 0.50, dir * 5.1);
    wingBollard.material = matWoodPost;
    wingBollard.parent = pierRoot;

    const wingRope = MeshBuilder.CreateTorus(`pier-wing-rope-${tIdx}`, { diameter: 0.40, thickness: 0.08, tessellation: 10 }, scene);
    wingRope.position.set(8.2, 0.38, dir * 5.1);
    wingRope.material = matRope;
    wingRope.parent = pierRoot;
  });

  // ==========================================
  // 5. VỌNG LÂU TRÀ THẤT NORDIC / GHIBLI & ĐẢO NGỌC GIỮA HỒ (EMERALD PAVILION ISLE)
  // Đảo cỏ xanh nổi giữa mặt nước hồ mở rộng, nâng đỡ vọng lâu trà thất, bãi sỏi cuội và rặng phong vàng
  // ==========================================
  const gazeboRoot = new TransformNode('lake-moonlight-gazebo-root', scene);
  gazeboRoot.position.set(196, 0.18, -10);
  gazeboRoot.parent = root;

  // Bệ đĩa cỏ xanh tự nhiên của Đảo Ngọc (Bán kính 8.8m x 8.0m, nhô cao y = 0.16m trên mặt nước 0.065m)
  const matIsleGrass = createMat(scene, 'lake-isle-grass-mat', '#4ade80', '#22c55e', '#ffffff', 1.0);
  matIsleGrass.zOffset = -1;
  const matIsleSand = createMat(scene, 'lake-isle-sand-mat', '#fef3c7', '#fde68a', '#ffffff', 1.0);
  matIsleSand.zOffset = -1;

  const isleGrassMesh = MeshBuilder.CreateCylinder('lake-emerald-isle-grass', {
    diameterTop: 17.6,
    diameterBottom: 19.4,
    height: 0.22,
    tessellation: 28,
  }, scene);
  isleGrassMesh.position.set(0, 0.02, 0);
  isleGrassMesh.scaling.set(1.0, 1.0, 0.92);
  isleGrassMesh.material = matIsleGrass;
  isleGrassMesh.parent = gazeboRoot;
  isleGrassMesh.receiveShadows = true;

  // Viền bãi cát vàng thoai thoải mép đảo tiếp giáp mặt nước
  const isleSandMesh = MeshBuilder.CreateCylinder('lake-emerald-isle-sand', {
    diameterTop: 19.6,
    diameterBottom: 22.8,
    height: 0.12,
    tessellation: 28,
  }, scene);
  isleSandMesh.position.set(0, -0.06, 0);
  isleSandMesh.scaling.set(1.0, 1.0, 0.92);
  isleSandMesh.material = matIsleSand;
  isleSandMesh.parent = gazeboRoot;

  // Tiểu cảnh đá cuội & khóm hoa thấp ven thềm cỏ đảo (giữ không gian thoáng đãng, mở rộng tầm nhìn 360 độ cho Vọng Lâu)
  const matIslePebble = createMat(scene, 'lake-isle-pebble-mat', '#cbd5e1', '#94a3b8');
  [
    { dx: 6.2, dz: 3.2, s: 0.72 },
    { dx: -6.4, dz: 2.8, s: 0.65 },
    { dx: 5.8, dz: -4.2, s: 0.58 },
  ].forEach((rock, rIdx) => {
    const pebble = MeshBuilder.CreateSphere(`lake-isle-rock-${rIdx}`, {
      diameter: rock.s,
      segments: 5,
    }, scene);
    pebble.scaling.set(1.3, 0.55, 1.1);
    pebble.position.set(rock.dx, 0.14, rock.dz);
    pebble.material = matIslePebble;
    pebble.parent = gazeboRoot;
  });

  // Bệ móng đá hoa cương bát giác nâng cao 2 bậc (Tiered Sandstone Plinth)
  const gazeboPlinthBase = MeshBuilder.CreateCylinder('gazebo-plinth-base', {
    diameter: 8.4,
    height: 0.22,
    tessellation: 8,
  }, scene);
  gazeboPlinthBase.position.y = 0.11;
  gazeboPlinthBase.material = matPlinthStone;
  gazeboPlinthBase.parent = gazeboRoot;
  shadows?.addShadowCaster(gazeboPlinthBase);

  const gazeboPlinth = MeshBuilder.CreateCylinder('gazebo-plinth', {
    diameter: 7.6,
    height: 0.24,
    tessellation: 8,
  }, scene);
  gazeboPlinth.position.y = 0.30;
  gazeboPlinth.material = matPlinthStone;
  gazeboPlinth.parent = gazeboRoot;
  shadows?.addShadowCaster(gazeboPlinth);

  // Sàn gỗ bát giác màu gỗ ấm
  const gazeboFloor = MeshBuilder.CreateCylinder('gazebo-floor', {
    diameter: 7.2,
    height: 0.12,
    tessellation: 8,
  }, scene);
  gazeboFloor.position.y = 0.44;
  gazeboFloor.material = matWoodDeck;
  gazeboFloor.parent = gazeboRoot;

  // 6 Cột gỗ sơn kem trắng tinh tế với mộng đỡ mái cong (Nordic White Timber Posts)
  const pillarRadius = 3.1;
  for (let c = 0; c < 6; c++) {
    const cAngle = (c / 6) * Math.PI * 2 + Math.PI / 6;
    const cx = Math.sin(cAngle) * pillarRadius;
    const cz = Math.cos(cAngle) * pillarRadius;

    // Cột chính
    const pillar = MeshBuilder.CreateCylinder(`gazebo-pillar-${c}`, {
      height: 2.9,
      diameter: 0.24,
      tessellation: 8,
    }, scene);
    pillar.position.set(cx, 1.9, cz);
    pillar.material = matPavilionPillars;
    pillar.parent = gazeboRoot;
    shadows?.addShadowCaster(pillar);

    // Mộng đỡ góc mái xòe
    const corbel = MeshBuilder.CreateBox(`gazebo-corbel-${c}`, { width: 0.45, height: 0.35, depth: 0.24 }, scene);
    corbel.position.set(cx * 0.94, 3.2, cz * 0.94);
    corbel.material = matPavilionPillars;
    corbel.parent = gazeboRoot;

    // Đèn lồng giấy ấm áp treo dưới mỗi đầu cột (Cozy Glowing Paper Lantern)
    const lantern = MeshBuilder.CreateSphere(`gazebo-lantern-${c}`, { diameter: 0.42, segments: 8 }, scene);
    lantern.position.set(cx * 0.88, 2.9, cz * 0.88);
    lantern.material = createMat(scene, `gazebo-lantern-mat-${c}`, '#fef08a', '#f59e0b', null, 0.95);
    lantern.material.disableLighting = true;
    lantern.parent = gazeboRoot;

    // Lan can chữ X (X-brace balustrade) giữa các cột (chừa cửa hướng Tây Bắc ngắm hồ)
    if (c !== 2) {
      const nextAngle = ((c + 1) / 6) * Math.PI * 2 + Math.PI / 6;
      const nx = Math.sin(nextAngle) * pillarRadius;
      const nz = Math.cos(nextAngle) * pillarRadius;
      const mx = (cx + nx) * 0.5;
      const mz = (cz + nz) * 0.5;
      const bDist = Math.hypot(nx - cx, nz - cz);
      const bAngle = Math.atan2(nz - cz, nx - cx);

      const railBottom = MeshBuilder.CreateBox(`gazebo-rail-b-${c}`, { width: bDist - 0.2, height: 0.08, depth: 0.10 }, scene);
      railBottom.position.set(mx, 0.65, mz);
      railBottom.rotation.y = -bAngle;
      railBottom.material = matPavilionRailing;
      railBottom.parent = gazeboRoot;

      const railTop = MeshBuilder.CreateBox(`gazebo-rail-t-${c}`, { width: bDist - 0.2, height: 0.10, depth: 0.14 }, scene);
      railTop.position.set(mx, 1.25, mz);
      railTop.rotation.y = -bAngle;
      railTop.material = matPavilionRailing;
      railTop.parent = gazeboRoot;

      // Thanh chéo chữ X
      const diag1 = MeshBuilder.CreateBox(`gazebo-diag-1-${c}`, { width: bDist - 0.25, height: 0.06, depth: 0.06 }, scene);
      diag1.position.set(mx, 0.95, mz);
      diag1.rotation.y = -bAngle;
      diag1.rotation.z = 0.35;
      diag1.material = matPavilionRailing;
      diag1.parent = gazeboRoot;

      const diag2 = MeshBuilder.CreateBox(`gazebo-diag-2-${c}`, { width: bDist - 0.25, height: 0.06, depth: 0.06 }, scene);
      diag2.position.set(mx, 0.95, mz);
      diag2.rotation.y = -bAngle;
      diag2.rotation.z = -0.35;
      diag2.material = matPavilionRailing;
      diag2.parent = gazeboRoot;
    }
  }

  // Mái ngói xòe 2 tầng phong cách Nordic Pavilion (Flared Eave Pagoda Roof)
  // Tầng mái dưới xòe rộng với ngói ngọc bích / sage teal
  const roofLower = MeshBuilder.CreateCylinder('gazebo-roof-lower', {
    diameterTop: 3.2,
    diameterBottom: 8.6,
    height: 1.6,
    tessellation: 8,
  }, scene);
  roofLower.position.y = 4.1;
  roofLower.material = matPavilionRoof;
  roofLower.parent = gazeboRoot;
  shadows?.addShadowCaster(roofLower);

  // Viền mái trắng tinh khôi (White Eave Fascia)
  const roofTrim = MeshBuilder.CreateCylinder('gazebo-roof-trim', {
    diameterTop: 8.6,
    diameterBottom: 8.8,
    height: 0.12,
    tessellation: 8,
  }, scene);
  roofTrim.position.y = 3.35;
  roofTrim.material = matPavilionRoofTrim;
  roofTrim.parent = gazeboRoot;

  // Cổ tháp tầng trên với ô cửa gió gỗ (Upper Cupola Lantern Turret)
  const cupolaWalls = MeshBuilder.CreateCylinder('gazebo-cupola-walls', {
    diameter: 2.8,
    height: 0.85,
    tessellation: 8,
  }, scene);
  cupolaWalls.position.y = 5.25;
  cupolaWalls.material = matPavilionPillars;
  cupolaWalls.parent = gazeboRoot;

  // Mái chóp nhỏ tầng trên (Upper Cupola Cap)
  const roofUpper = MeshBuilder.CreateCylinder('gazebo-roof-upper', {
    diameterTop: 0.2,
    diameterBottom: 3.6,
    height: 1.2,
    tessellation: 8,
  }, scene);
  roofUpper.position.y = 6.2;
  roofUpper.material = matPavilionRoof;
  roofUpper.parent = gazeboRoot;
  shadows?.addShadowCaster(roofUpper);

  // Đỉnh tháp chóp kim loại mạ vàng sang trọng (Golden Spire & Finial)
  const spire = MeshBuilder.CreateCylinder('gazebo-spire', {
    diameterTop: 0.04,
    diameterBottom: 0.28,
    height: 1.4,
    tessellation: 8,
  }, scene);
  spire.position.y = 7.3;
  spire.material = matRope;
  spire.parent = gazeboRoot;

  const finialBall = MeshBuilder.CreateSphere('gazebo-finial-ball', { diameter: 0.38, segments: 8 }, scene);
  finialBall.position.y = 8.0;
  finialBall.material = matRope;
  finialBall.parent = gazeboRoot;

  // Bàn trà gỗ sồi tròn và ấm chén bên trong vọng lâu
  const teaTable = MeshBuilder.CreateCylinder('gazebo-tea-table', { diameter: 1.5, height: 0.72, tessellation: 12 }, scene);
  teaTable.position.set(0, 0.8, 0);
  teaTable.material = matWoodDeck;
  teaTable.parent = gazeboRoot;

  // Bình trà & 2 chén sứ trên bàn
  const teapot = MeshBuilder.CreateSphere('gazebo-teapot', { diameter: 0.28, segments: 6 }, scene);
  teapot.position.set(0, 1.25, 0);
  teapot.material = matPavilionRoofTrim;
  teapot.parent = gazeboRoot;

  [-0.35, 0.35].forEach((tx, tIdx) => {
    const cup = MeshBuilder.CreateCylinder(`gazebo-cup-${tIdx}`, { diameter: 0.12, height: 0.10 }, scene);
    cup.position.set(tx, 1.2, 0.2);
    cup.material = matPavilionRoofTrim;
    cup.parent = gazeboRoot;
  });

  // 2 Ghế gỗ bọc đệm êm ái
  [-1.1, 1.1].forEach((sx, sIdx) => {
    const chair = MeshBuilder.CreateCylinder(`gazebo-chair-${sIdx}`, { diameter: 0.65, height: 0.50, tessellation: 8 }, scene);
    chair.position.set(sx, 0.68, 0);
    chair.material = matPavilionPillars;
    chair.parent = gazeboRoot;

    const cushion = MeshBuilder.CreateCylinder(`gazebo-cushion-${sIdx}`, { diameter: 0.62, height: 0.12, tessellation: 8 }, scene);
    cushion.position.set(sx, 0.95, 0);
    cushion.material = matAwningBlue;
    cushion.parent = gazeboRoot;
  });

  // ==========================================
  // 5B. RẶNG CÂY THU VÀNG & ĐÈN LỒNG CỔ NGHỈNH ĐẢO NGỌC (ISLAND AUTUMN TREES & LANTERNS)
  // Hai cây đại thụ thu vàng Ghibli rợp bóng 2 bên Vọng Lâu, tuyệt đối 100% trên bờ cỏ đảo
  // ==========================================
  spawnModelSync(scene, MODEL_PATHS.trees.fall, {
    name: 'lake-isle-fall-tree-east',
    position: new Vector3(4.6, 0.02, 2.2),
    scaling: new Vector3(2.5, 2.5, 2.5),
    rotation: new Vector3(0, 0.8, 0),
    shadows,
    parent: gazeboRoot,
  });

  spawnModelSync(scene, MODEL_PATHS.trees.oakFall, {
    name: 'lake-isle-fall-tree-west',
    position: new Vector3(-4.6, 0.02, -2.4),
    scaling: new Vector3(2.3, 2.3, 2.3),
    rotation: new Vector3(0, -1.1, 0),
    shadows,
    parent: gazeboRoot,
  });

  // Đèn lồng truyền thống đón khách trước thềm Vọng Lâu
  spawnModelSync(scene, MODEL_PATHS.town.lantern, {
    name: 'lake-isle-lantern-l',
    position: new Vector3(-2.2, 0.26, 3.2),
    scaling: new Vector3(1.15, 1.15, 1.15),
    shadows,
    parent: gazeboRoot,
  });
  spawnModelSync(scene, MODEL_PATHS.town.lantern, {
    name: 'lake-isle-lantern-r',
    position: new Vector3(2.2, 0.26, 3.2),
    scaling: new Vector3(1.15, 1.15, 1.15),
    shadows,
    parent: gazeboRoot,
  });

  // Khóm cây hoa bụi xum xuê bên thềm đảo
  spawnModelSync(scene, MODEL_PATHS.foliage.bushLarge, {
    name: 'lake-isle-bush-east',
    position: new Vector3(5.2, 0.02, -1.2),
    scaling: new Vector3(1.3, 1.3, 1.3),
    shadows,
    parent: gazeboRoot,
  });
  spawnModelSync(scene, MODEL_PATHS.foliage.bushDetailed, {
    name: 'lake-isle-bush-west',
    position: new Vector3(-5.2, 0.02, 1.2),
    scaling: new Vector3(1.3, 1.3, 1.3),
    shadows,
    parent: gazeboRoot,
  });

  // ==========================================
  // 6. SỎI CUỘI XÁM VÀ ĐÁ RÊU PASTEL TỰ NHIÊN VEN BỜ (PEBBLES & BOULDERS)
  // Không dùng đá đen sì thô ráp, dùng các tông xám mịn, rêu ngọc và cát ấm
  // ==========================================
  const pebbleAngles = [
    0.05, 0.22, 0.42, 0.62, 0.85, 1.08, 1.28, 1.48, 1.68, 1.88, 2.08, 2.28, 2.48, 2.68, 2.88,
    3.05, 3.25, 3.45, 3.65, 3.85, 4.05, 4.25, 4.45, 4.65, 4.85, 5.05, 5.25, 5.45, 5.65, 5.85, 6.05, 6.22
  ];

  pebbleAngles.forEach((angle, idx) => {
    // Bỏ qua vị trí bến tàu ở phía Tây (khoảng góc PI ~ 3.14)
    if (Math.abs(angle - Math.PI) < 0.28) return;
    // Bỏ qua cửa hòa lưu Đông nối thông sang Sông (angle < 0.55 hoặc angle > 5.75)
    if (angle < 0.55 || angle > Math.PI * 2 - 0.55) return;

    const pt = lakeEdge(angle, 1.02);
    const s = 0.55 + ((idx * 37) % 60) * 0.012;
    const pebble = MeshBuilder.CreateIcoSphere(`lake-pebble-${idx}`, {
      radius: s * 0.5,
      subdivisions: 1,
      flat: true,
    }, scene);

    pebble.position.set(pt.x, 0.08 + s * 0.10, pt.z);
    pebble.scaling.set(1.2, 0.55, 0.9);
    pebble.rotation.y = angle + idx;
    pebble.material = (idx % 4 === 0) ? matPebbleMoss : (idx % 3 === 0 ? matPebble1 : (idx % 3 === 1 ? matPebble2 : matPebble3));
    pebble.isPickable = false;
    pebble.parent = root;
    shadows?.addShadowCaster(pebble);
    meshes.push(pebble);
  });
  yield;

  // ==========================================
  // 7. CÁC QUẦẦN THỂ LÁ SEN & HOA SÚNG NỞ (4 LILY PAD SANCTUARIES)
  // ==========================================
  const lilyLocations = [
    // Cụm 1: Vịnh phía Tây gần bến câu cá trong vùng nước sâu
    { x: 153, z: 9, scale: 1.15, hasFlower: true },
    { x: 155.5, z: 11, scale: 0.95, hasFlower: false },
    { x: 151, z: 12, scale: 1.05, hasFlower: false },
    { x: 152, z: 6.5, scale: 0.85, hasFlower: true },

    // Cụm 2: Vịnh phía Nam gần cầu vòm
    { x: 158, z: -18, scale: 1.20, hasFlower: true },
    { x: 161, z: -20.5, scale: 0.90, hasFlower: false },
    { x: 154, z: -16, scale: 1.10, hasFlower: true },
    { x: 157, z: -23, scale: 0.80, hasFlower: false },

    // Cụm 3: Bờ phía Bắc dưới đồi thông
    { x: 170, z: 24, scale: 1.15, hasFlower: true },
    { x: 173, z: 26, scale: 0.90, hasFlower: false },
    { x: 167, z: 27, scale: 1.05, hasFlower: true },
    { x: 175, z: 22, scale: 0.85, hasFlower: false },

    // Cụm 4: Vịnh phía Đông gần vọng lâu
    { x: 186, z: -16, scale: 1.10, hasFlower: true },
    { x: 189, z: -18, scale: 0.85, hasFlower: false },
    { x: 183, z: -14, scale: 1.00, hasFlower: false },
    { x: 188, z: -12, scale: 0.95, hasFlower: true },
  ];

  const lilyFloatingNodes = [];
  lilyLocations.forEach((loc, idx) => {
    const lilyGroup = new TransformNode(`lily-group-${idx}`, scene);
    lilyGroup.position.set(loc.x, 0.075, loc.z);
    lilyGroup.parent = root;
    lilyFloatingNodes.push({
      node: lilyGroup,
      basePos: new Vector3(loc.x, 0.075, loc.z),
      baseRot: new Vector3(0, 0, 0),
    });

    const pad = MeshBuilder.CreateCylinder(`cozy-lily-pad-${idx}`, {
      diameter: 1.4 * loc.scale,
      height: 0.02,
      tessellation: 14,
    }, scene);
    pad.position.set(0, 0, 0);
    pad.material = matLilyPad;
    pad.isPickable = false;
    pad.parent = lilyGroup;
    meshes.push(pad);

    if (loc.hasFlower) {
      const flowerGroup = new TransformNode(`lotus-bloom-${idx}`, scene);
      flowerGroup.position.set(0, 0.01, 0);
      flowerGroup.parent = lilyGroup;

      for (let p = 0; p < 6; p++) {
        const pAngle = (p / 6) * Math.PI * 2;
        const petal = MeshBuilder.CreateSphere(`lotus-p-${idx}-${p}`, {
          diameterX: 0.24,
          diameterY: 0.12,
          diameterZ: 0.34,
          segments: 4,
        }, scene);
        petal.position.set(Math.sin(pAngle) * 0.16, 0.04, Math.cos(pAngle) * 0.16);
        petal.rotation.y = pAngle;
        petal.material = matLotusPetal;
        petal.parent = flowerGroup;
      }

      const center = MeshBuilder.CreateSphere(`lotus-c-${idx}`, { diameter: 0.16, segments: 4 }, scene);
      center.position.set(0, 0.06, 0);
      center.material = matLotusCenter;
      center.parent = flowerGroup;
    }
  });

  // ==========================================
  // 8. ĐÀN CÁ KOI 3D CHIBI BƠI LƯỢN SỐNG ĐỘNG (PLAY TOGETHER SWIMMING KOI)
  // ==========================================
  const fishNodes = [];
  const fishParams = [
    // Vòng bơi trong (Lagoon & Bến câu cá bờ Tây)
    { radius: 15, speed: 0.00058, baseAngle: 0.4, depth: 0.040, variety: 'kohaku', scale: 1.15, phase: 0 },
    { radius: 19, speed: 0.00048, baseAngle: 2.1, depth: 0.038, variety: 'ogon', scale: 1.05, phase: 1.2 },
    { radius: 24, speed: 0.00042, baseAngle: 3.8, depth: 0.042, variety: 'sanke', scale: 1.25, phase: 2.5 },
    { radius: 17, speed: 0.00052, baseAngle: 5.2, depth: 0.045, variety: 'kohaku', scale: 1.10, phase: 3.8 },
    // Vòng trung tâm & Quanh Đảo Vọng Lâu
    { radius: 30, speed: 0.00035, baseAngle: 1.2, depth: 0.042, variety: 'kohaku', scale: 1.35, phase: 4.5 },
    { radius: 36, speed: 0.00030, baseAngle: 2.8, depth: 0.040, variety: 'ogon', scale: 1.30, phase: 0.8 },
    { radius: 32, speed: 0.00032, baseAngle: 4.4, depth: 0.044, variety: 'sanke', scale: 1.25, phase: 2.0 },
    { radius: 28, speed: 0.00038, baseAngle: 5.9, depth: 0.039, variety: 'ogon', scale: 1.18, phase: 3.4 },
    // Vòng vịnh mở rộng phía Đông (Chân núi tuyết & Thác nước Alpine)
    { radius: 44, speed: 0.00028, baseAngle: 0.8, depth: 0.043, variety: 'kohaku', scale: 1.45, phase: 5.1 },
    { radius: 50, speed: 0.00024, baseAngle: 2.5, depth: 0.041, variety: 'sanke', scale: 1.40, phase: 1.6 },
    { radius: 46, speed: 0.00026, baseAngle: 4.1, depth: 0.045, variety: 'ogon', scale: 1.35, phase: 3.1 },
    { radius: 40, speed: 0.00031, baseAngle: 5.5, depth: 0.040, variety: 'kohaku', scale: 1.28, phase: 4.2 },
  ];

  fishParams.forEach((f, idx) => {
    const koi = createChibiKoiFish(scene, root, {
      variety: f.variety,
      scale: f.scale,
      phase: f.phase,
      prefix: `lake-koi-${idx}`,
    });
    fishNodes.push({ koi, ...f });
  });

  // ==========================================
  // 9. HỆ THỐNG VÒNG SÓNG NƯỚC LAN TỎA (CONCENTRIC RIPPLE RINGS)
  // ==========================================
  const rippleSystems = [
    createWaterRippleRingSystem(scene, root, { center: new Vector3(162, 0.076, 2.0), maxRadius: 3.2, minRadius: 0.4, speed: 0.65, count: 3, color: '#ffffff', prefix: 'lake-pier-ripple' }),
    createWaterRippleRingSystem(scene, root, { center: new Vector3(156, 0.076, -4.5), maxRadius: 2.4, minRadius: 0.35, speed: 0.70, count: 3, color: '#e0f2fe', prefix: 'lake-rowboat-ripple' }),
    createWaterRippleRingSystem(scene, root, { center: new Vector3(175, 0.076, 12.0), maxRadius: 3.5, minRadius: 0.50, speed: 0.60, count: 3, color: '#e0f2fe', prefix: 'lake-sailboat-ripple' }),
    createWaterRippleRingSystem(scene, root, { center: new Vector3(196, 0.076, -10.0), maxRadius: 3.0, minRadius: 0.40, speed: 0.55, count: 3, color: '#fef08a', prefix: 'lake-gazebo-ripple' }),
    createWaterRippleRingSystem(scene, root, { center: new Vector3(153, 0.076, 9.0), maxRadius: 2.0, minRadius: 0.30, speed: 0.55, count: 2, color: '#dcfce7', prefix: 'lake-lily1-ripple' }),
    createWaterRippleRingSystem(scene, root, { center: new Vector3(158, 0.076, -18.0), maxRadius: 2.0, minRadius: 0.30, speed: 0.55, count: 2, color: '#dcfce7', prefix: 'lake-lily2-ripple' }),
    createWaterRippleRingSystem(scene, root, { center: new Vector3(170, 0.076, 24.0), maxRadius: 2.0, minRadius: 0.30, speed: 0.55, count: 2, color: '#dcfce7', prefix: 'lake-lily3-ripple' }),
  ];

  // ==========================================
  // 10. ĐỐM SAO ÁNH NẮNG LẤP LÁNH & ĐOM ĐÓM PHÁT SÁNG (SUN SPARKLES & FIREFLIES)
  // ==========================================
  const sunSparkles = createWaterSunSparkles(scene, root, 38, {
    minX: 142,
    maxX: 262,
    minZ: -58,
    maxZ: 74,
    y: 0.082,
  });

  // Đom đóm vàng ấm lượn lờ ven hồ ban đêm (Fairytale Lake Fireflies)
  const fireflyNodes = [];
  const matFirefly = createMat(scene, 'lake-firefly-glow-mat', '#fef08a', '#eab308');
  matFirefly.disableLighting = true;
  for (let f = 0; f < 8; f++) {
    const ff = MeshBuilder.CreateSphere(`lake-firefly-${f}`, { diameter: 0.16, segments: 4 }, scene);
    ff.material = matFirefly;
    ff.isPickable = false;
    ff.parent = root;
    fireflyNodes.push({
      mesh: ff,
      baseX: 152 + (f % 4) * 14,
      baseZ: -14 + Math.floor(f / 4) * 26,
      phase: f * 0.8,
      speed: 0.6 + (f % 3) * 0.3,
    });
  }

  // Bầy đom đóm dạ quang bay lượn ban đêm (Bioluminescent Fireflies)
  const biolumFireflies = createBioluminescentFireflies(scene, root, { count: 20, center: { x: 167, z: 2 }, radius: 38, y: 0.55 });
  meshes.push(biolumFireflies);

  // ==========================================
  // 11. BỤI CỎ SẬY VEN BỜ (CATTAILS & REEDS)
  // ==========================================
  const reedClusters = [
    { x: 144, z: 18 },
    { x: 140, z: 12 },
    { x: 146, z: -16 },
    { x: 198, z: 16 },
    { x: 202, z: -18 },
    { x: 172, z: 36 },
  ];

  reedClusters.forEach((cl, cIdx) => {
    for (let r = 0; r < 4; r++) {
      const rox = (r % 2 === 0 ? 0.35 : -0.35) + r * 0.1;
      const roz = (r < 2 ? 0.3 : -0.3);
      const stalkHeight = 1.1 + (r % 3) * 0.25;

      const stalk = MeshBuilder.CreateCylinder(`reed-stalk-${cIdx}-${r}`, {
        height: stalkHeight,
        diameter: 0.04,
        tessellation: 4,
      }, scene);
      stalk.position.set(cl.x + rox, stalkHeight * 0.5 + 0.04, cl.z + roz);
      stalk.material = matReedStalk;
      stalk.parent = root;

      const head = MeshBuilder.CreateCylinder(`reed-head-${cIdx}-${r}`, {
        height: 0.32,
        diameter: 0.09,
        tessellation: 6,
      }, scene);
      head.position.set(cl.x + rox, stalkHeight + 0.02, cl.z + roz);
      head.material = matReedHead;
      head.parent = root;
    }
  });

  // ==========================================
  // 11B. TIỂU CẢNH THIÊN NHIÊN 2 MŨI VỊNH HÒA LƯU (CONFLUENCE ESTUARY CAPES)
  // Tạo điểm nhấn cảnh quan thơ mộng tại 2 góc tiếp giáp giữa Hồ Pha Lê và Sông Uốn Lượn:
  // - Mũi Nam (z ≈ -28): Cụm đá cuội tròn nhẵn Ghibli, khóm hoa súng hồng & sậy nước
  // - Mũi Bắc (z ≈ 44): Cụm đá cuội tròn nhẵn Ghibli, hoa súng trắng & sậy nước
  // ==========================================
  const matCapeBoulder1 = createMat(scene, 'cape-boulder-mat-1', '#cbd5e1', '#94a3b8');
  const matCapeBoulder2 = createMat(scene, 'cape-boulder-mat-2', '#94a3b8', '#64748b');

  // Mũi Nam Vịnh Hòa Lưu (South Confluence Cape at z ≈ -36.5)
  const southCapeRocks = [
    { x: 207.8, y: 0.28, z: -36.5, sx: 1.4, sy: 0.75, sz: 1.3, mat: matCapeBoulder1 },
    { x: 207.0, y: 0.20, z: -35.2, sx: 1.0, sy: 0.55, sz: 0.95, mat: matCapeBoulder2 },
    { x: 208.4, y: 0.16, z: -37.8, sx: 0.8, sy: 0.42, sz: 0.75, mat: matCapeBoulder1 },
  ];
  southCapeRocks.forEach((rk, idx) => {
    const rock = MeshBuilder.CreateSphere(`south-cape-rock-${idx}`, {
      diameter: 1.0,
      segments: 4,
    }, scene);
    rock.position.set(rk.x, rk.y, rk.z);
    rock.scaling.set(rk.sx, rk.sy, rk.sz);
    rock.material = rk.mat;
    rock.isPickable = false;
    rock.parent = root;
    shadows?.addShadowCaster(rock);
  });

  // Mũi Bắc Vịnh Hòa Lưu (North Confluence Cape)
  const northCapeRocks = [
    { x: 208.6, y: 0.28, z: 44.0, sx: 1.35, sy: 0.72, sz: 1.25, mat: matCapeBoulder1 },
    { x: 207.8, y: 0.20, z: 45.4, sx: 0.95, sy: 0.52, sz: 0.90, mat: matCapeBoulder2 },
    { x: 209.2, y: 0.16, z: 42.6, sx: 0.75, sy: 0.40, sz: 0.70, mat: matCapeBoulder2 },
  ];
  northCapeRocks.forEach((rk, idx) => {
    const rock = MeshBuilder.CreateSphere(`north-cape-rock-${idx}`, {
      diameter: 1.0,
      segments: 4,
    }, scene);
    rock.position.set(rk.x, rk.y, rk.z);
    rock.scaling.set(rk.sx, rk.sy, rk.sz);
    rock.material = rk.mat;
    rock.isPickable = false;
    rock.parent = root;
    shadows?.addShadowCaster(rock);
  });

  // Animation mặt nước Play Together: caustics, bọt mép bờ, lá sen, cá koi, đom đóm & sparkles
  let lastTime = performance.now();
  const animObserver = scene.onBeforeRenderObservable.add(() => {
    if (scene.isDisposed) {
      scene.onBeforeRenderObservable.remove(animObserver);
      return;
    }
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastTime) * 0.001);
    lastTime = now;
    const nowSec = now * 0.001;


    // 1. Vân sóng caustics chuyển động trôi êm ả đồng điệu 100% với Sông Uốn Lượn
    lakeTex.vOffset -= dt * 0.022; // Trôi nhẹ xuôi theo dòng chảy của thế giới
    lakeTex.uOffset = Math.sin(nowSec * 0.45) * 0.012; // Vi sóng gợn nhẹ ngang mặt nước

    // 2. Nhịp thở êm đềm của dải bọt mép bờ cát (Breathing Shoreline Foam Alpha Oscillation)
    matLakeFoam.alpha = 0.74 + 0.16 * Math.sin(nowSec * 1.6);

    // 3. Cụm lá sen & hoa súng dập dềnh bập bênh theo sóng nước
    lilyFloatingNodes.forEach(({ node, basePos, baseRot }) => {
      applyBuoyancyToObject(node, basePos, baseRot, nowSec, {
        amplitude: 0.014,
        frequency: 1.8,
        rollAmplitude: 0.025,
        pitchAmplitude: 0.020,
      });
    });

    // 4. Đàn 8 cá Koi 3D ve vẩy đuôi bơi lượn dưới tầng nước
    fishNodes.forEach(f => {
      f.baseAngle += f.speed * (dt * 1000);
      const fx = LAKE_CENTER.x + Math.cos(f.baseAngle) * f.radius;
      const fz = LAKE_CENTER.z + Math.sin(f.baseAngle) * (f.radius * 0.72);
      const heading = -f.baseAngle + Math.PI / 2;
      f.koi.root.position.set(fx, f.depth, fz);
      f.koi.root.rotation.y = heading;
      f.koi.update(nowSec, dt);
    });

    // 5. Cập nhật các vòng sóng nước lan tỏa (Concentric Ripples)
    rippleSystems.forEach(rs => rs.update(nowSec));

    // 6. Cập nhật đốm sáng quang học ánh dương (Sun Sparkles)
    sunSparkles.update(nowSec);

    // 7. Đom đóm lượn lờ bập bùng ánh sáng
    fireflyNodes.forEach(ff => {
      const px = ff.baseX + Math.sin(nowSec * ff.speed + ff.phase) * 2.4;
      const py = 0.45 + Math.sin(nowSec * 2.2 + ff.phase) * 0.22;
      const pz = ff.baseZ + Math.cos(nowSec * ff.speed + ff.phase) * 2.4;
      ff.mesh.position.set(px, py, pz);
      ff.mesh.visibility = 0.35 + 0.65 * Math.sin(nowSec * 3.2 + ff.phase);
    });
  });

  return {
    water,
    meshes,
    root,
    dispose() {
      scene.onBeforeRenderObservable.remove(animObserver);
      rippleSystems.forEach(rs => rs.dispose());
      sunSparkles.dispose();
      fishNodes.forEach(f => f.koi.dispose());
      lakeTex.dispose();
      lakeSandTex.dispose();
      lakeFoamTex.dispose();
      matWaterToon.dispose();
      matCapeBoulder1.dispose();
      matCapeBoulder2.dispose();
      matLakeFoam.dispose();
      root.dispose(false, true);
    },
  };
}

export function createRomanticLake(scene, shadows = null) {
  const gen = createRomanticLakeSteps(scene, shadows);
  let res = gen.next();
  while (!res.done) {
    res = gen.next();
  }
  return res.value;
}
