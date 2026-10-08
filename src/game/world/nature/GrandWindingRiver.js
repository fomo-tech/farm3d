import {createWaterfrontScenerySteps} from './createWaterfrontScenery.js';
import {clipShoreAtWaterways} from './clipShoreAtWaterways.js';
import {WATER_PALETTE as WATER,seaWaterColor} from '../../../../shared/waterPalette.js';
import {createWaterNetwork,createLandscapeWaterMaterial} from './createWaterNetwork.js';
/**
 * GrandWindingRiver.js
 * The Grand Animated Winding River & Highway Bridge Infrastructure.
 *
 * Creates a continuous, beautiful, animated winding river across the entire 3D world:
 * - Starts at the North Mountain Waterfall (z = -580)
 * - Traverses the highlands, merges with Crystal Lake (z = 0)
 * - Meanders along Làng Ven Sông, flows south to the Ocean (z = 540)
 * - 100% of road crossings have solid Highway Arch Bridges (Bridge 1, 2, 4) or Footbridge (Bridge 3)
 * - 100% CLEAR of all 288 player farm lots (buffer >= 14m to 150m)
 * - Impassable river colliders registered with WorldCollisionSystem to prevent vehicles/players
 *   from driving or walking into the water without a bridge.
 */

import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3, Vector2 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { MODEL_PATHS, spawnModelSync } from '../../rendering/ModelAssetManager.js';
import { WORLD_PALETTE } from '../worldDesignSystem.js';
import {
  createRiverStreamTexture,
  createStylizedWaterMaterial,
  createWaterRippleRingSystem,
  createWaterSunSparkles,
  createRiverbankTexture,
  createRiverStoneCurbTexture,
  createRiverFoamTexture,
} from './StylizedWaterEngine.js';
import {
  createLowLyingRiverMist,
  createChibiSteppingStones,
  createRiversideScenicDeck,
  createDriftingPetals,
  createBioluminescentFireflies,
} from './CinematicWaterfrontDecor.js';

/**
 * 18 Control Points defining the gentle winding trajectory of the river from North to South.
 * Strictly avoids all 288 farm parcels, town centres, and village residential spines.
 */
export { RIVER_CONTROL_POINTS } from '../../../../shared/riverLayout.js';
import { RIVER_CONTROL_POINTS, sampleRiverSpline } from '../../../../shared/riverLayout.js';

/**
 * Bảng tra cứu spline chính xác 100% của bờ Tây Sông Uốn Lượn tại khu vực Hồ Pha Lê & Vịnh Hòa Lưu.
 */
export { RIVER_WEST_SPLINE_LUT, getRiverWestBankX } from '../../../../shared/riverBank.js';
import { getRiverWestBankX } from '../../../../shared/riverBank.js';
import { ALL_BRIDGES } from '../../../../shared/bridgeConfig.js';
import { buildBridge } from './BridgeSystem.js';

/**
 * Metadata for the 4 Bridges spanning the river (synchronized with shared/bridgeConfig.js).
 */
export const RIVER_BRIDGES = Object.freeze(
  ALL_BRIDGES.filter(b => b.id.startsWith('bridge-highway-') || b.id === 'bridge-vensong-pedestrian')
);

/**
 * Pure mathematical Catmull-Rom spline evaluator.
 * Passes precisely through all control points with continuous C1 tangents.
 */

/**
 * Creates dynamic stylized water ripple texture for flow animation.
 */
function createRiverWaterTexture(scene, size = 512) {
  const dt = new DynamicTexture('river-water-anim-tex', { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.anisotropicFilteringLevel = 16;
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.WRAP_ADDRESSMODE;
  const ctx = dt.getContext();

  // Luminous cyan jade gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#06b6d4'); // Vibrant luminous cyan
  grad.addColorStop(0.35, '#38bdf8'); // Sky aqua
  grad.addColorStop(0.7, '#0284c7'); // Crystal deep blue
  grad.addColorStop(1, '#0369a1');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Organic caustics & soft water foam ribbons
  ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
  ctx.lineWidth = 4;
  for (let i = 0; i < 16; i++) {
    const y = (i * size) / 16;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.25, y + 22, size * 0.75, y - 22, size, y);
    ctx.stroke();
  }

  // Shoreline foam edges along left (U=0) and right (U=size)
  const foamGradL = ctx.createLinearGradient(0, 0, size * 0.16, 0);
  foamGradL.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
  foamGradL.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = foamGradL;
  ctx.fillRect(0, 0, size * 0.16, size);

  const foamGradR = ctx.createLinearGradient(size * 0.84, 0, size, 0);
  foamGradR.addColorStop(0, 'rgba(255, 255, 255, 0)');
  foamGradR.addColorStop(1, 'rgba(255, 255, 255, 0.75)');
  ctx.fillStyle = foamGradR;
  ctx.fillRect(size * 0.84, 0, size * 0.16, size);

  dt.update();
  return dt;
}

/**
 * Builds the 4 bridges spanning the river using the unified BridgeSystem architecture.
 */
function* createBridgesSteps(scene, root, shadows) {
  const bridgeMeshes = [];
  for (const b of RIVER_BRIDGES) {
    const bridgeNode = buildBridge(scene, b, root, shadows);
    bridgeMeshes.push(bridgeNode);
    yield;
  }
  return bridgeMeshes;
}

/**
 * Creates the complete Grand Winding River System.
 */
export function* createGrandWindingRiverSteps(scene, parent = null, shadows = null) {
  const root = new TransformNode('grand-winding-river-system', scene);
    yield;
  if (parent) root.parent = parent;
    yield;

  // 1. Evaluate Spline Ribbon Paths
  const sampledSpline = sampleRiverSpline(RIVER_CONTROL_POINTS, 110);
    yield;
  const leftPath = [];
  const rightPath = [];
  const centerPath = [];
  const leftUvs = [];
  const rightUvs = [];
  let accumulatedDist = 0;

  for (let i = 0; i < sampledSpline.length; i++) {
    const cur = sampledSpline[i];
    centerPath.push(new Vector3(cur.x, 0.08, cur.z));

    if (i > 0) {
      const prev = sampledSpline[i - 1];
      accumulatedDist += Math.hypot(cur.x - prev.x, cur.z - prev.z);
    }

    // Tangent calculation
    const prev = i > 0 ? sampledSpline[i - 1] : cur;
    const next = i < sampledSpline.length - 1 ? sampledSpline[i + 1] : cur;
    let tx = next.x - prev.x;
    let tz = next.z - prev.z;
    const len = Math.hypot(tx, tz) || 1;
    tx /= len;
    tz /= len;

    // Normal vector perpendicular to river flow
    const nx = -tz;
    const nz = tx;
    const halfW = cur.w / 2;

    const pLeft = new Vector3(cur.x + nx * halfW, 0.082, cur.z + nz * halfW);
    const pRight = new Vector3(cur.x - nx * halfW, 0.082, cur.z - nz * halfW);
    leftPath.push(pLeft);
    rightPath.push(pRight);

    // Natural Streamflow UV: U across river channel [0 (left bank) to 1 (right bank)], V along length
    const vCoord = accumulatedDist / 16.0;
    leftUvs.push(new Vector2(0.0, vCoord));
    rightUvs.push(new Vector2(1.0, vCoord));
  }
  yield;

  // Flatten UVs into single 1D array of Vector2 ordered by path vertices for Babylon.js CreateRibbon
  const ribbonUvs = [...leftUvs, ...rightUvs];

  // 2. Animated River Water Material (Silky Smooth Play Together Streamflow)
  const matWater=createLandscapeWaterMaterial(scene,root,false);
  const riverTex=matWater.diffuseTexture;
  matWater.zOffset=0;
  yield;

  // 3. Create Parametric Ribbon Mesh for River Surface
  const riverMesh = MeshBuilder.CreateRibbon('grand-river-surface', {
    pathArray: [leftPath, centerPath, rightPath],
    uvs: [...leftUvs,...leftUvs.map(uv=>new Vector2(.5,uv.y)),...rightUvs],
    sideOrientation: 0, // FRONTSIDE (Upward facing only, triệt tiêu Z-fighting)
  }, scene);

  // Set explicit upward normals and tangents for rock-solid GPU lighting
  const riverVertexCount = riverMesh.getTotalVertices();
  const riverNormals = new Float32Array(riverVertexCount * 3);
  for (let i = 1; i < riverNormals.length; i += 3) riverNormals[i] = 1;
  riverMesh.setVerticesData('normal', riverNormals);
  const riverColors=[],riverWorldUvs=[],positions=riverMesh.getVerticesData('position');
  const tones=[WATER.edge,WATER.body,WATER.edge];
  for(let i=0;i<riverVertexCount;i++){const c=Color3.FromHexString(tones[Math.floor(i/leftPath.length)]);const z=positions[i*3+2],sea=seaWaterColor(positions[i*3],z),t=Math.max(0,Math.min(1,(z-540)/100));riverColors.push(c.r+(sea[0]-c.r)*t,c.g+(sea[1]-c.g)*t,c.b+(sea[2]-c.b)*t,1);riverWorldUvs.push(positions[i*3]/48,positions[i*3+2]/48);}
  riverMesh.setVerticesData('color',riverColors);riverMesh.setVerticesData('uv',riverWorldUvs);riverMesh.useVertexColors=true;


  const riverTangents = new Float32Array(riverVertexCount * 4);
  for (let i = 0; i < riverTangents.length; i += 4) {
    riverTangents[i] = 1;
    riverTangents[i + 3] = 1;
  }
  riverMesh.setVerticesData('tangent', riverTangents);

  riverMesh.material = matWater;
  riverMesh.parent = root;
  riverMesh.renderingGroupId = 0;
  riverMesh.metadata = { ...riverMesh.metadata, spatialBoundsMutable: true };
  riverMesh.receiveShadows = false;
  riverMesh.isPickable = false;
  yield;

  // 4. BỜ KÈ VÀ BÃI CÁT SỎI ĐA TẦNG TỰ NHIÊN (MULTI-TIERED NATURAL RIVERBANKS)
  // Vân cát sông tự nhiên, sỏi đá suối và gờ đá cuội mài mòn thay thế dải màu phẳng
  const bankSandTex = createRiverbankTexture(scene, 256);
  if (bankSandTex && bankSandTex.uScale !== undefined) {
    bankSandTex.uScale = 2;
    bankSandTex.vScale = 24;
  }
  const matSandBank = new StandardMaterial('grand-river-sand-mat', scene);
  if (bankSandTex && typeof bankSandTex.getClassName === 'function') {
    matSandBank.diffuseTexture = bankSandTex;
    matSandBank.diffuseColor = Color3.White();
  } else {
    matSandBank.diffuseColor = Color3.FromHexString('#dfc499');
  }
  matSandBank.ambientColor = new Color3(0.55, 0.55, 0.55);
  matSandBank.specularColor = new Color3(0.55, 0.60, 0.65); // Wet sand glistening reflection
  matSandBank.specularPower = 44;
  matSandBank.zOffset = 1;

  const bankStoneTex = createRiverStoneCurbTexture(scene, 256);
  if (bankStoneTex && bankStoneTex.uScale !== undefined) {
    bankStoneTex.uScale = 1;
    bankStoneTex.vScale = 24;
  }
  const matBank = new StandardMaterial('grand-river-bank-mat', scene);
  if (bankStoneTex && typeof bankStoneTex.getClassName === 'function') {
    matBank.diffuseTexture = bankStoneTex;
    matBank.diffuseColor = Color3.White();
  } else {
    matBank.diffuseColor = Color3.FromHexString('#b7a896');
  }
  matBank.ambientColor = new Color3(0.5, 0.5, 0.5);
  matBank.specularColor = new Color3(0.06, 0.06, 0.06);
  matBank.zOffset = 0;

  // Dải bọt trắng mép bờ sông nhịp thở (Breathing River Shoreline Foam)
  const riverFoamTex = createRiverFoamTexture(scene, 256);
  if (riverFoamTex && riverFoamTex.uScale !== undefined) {
    riverFoamTex.uScale = 1;
    riverFoamTex.vScale = 16;
  }
  const matRiverFoam = new StandardMaterial('grand-river-foam-mat', scene);
  if (riverFoamTex && typeof riverFoamTex.getClassName === 'function') {
    matRiverFoam.diffuseTexture = riverFoamTex;
    matRiverFoam.diffuseColor = Color3.White();
  } else {
    matRiverFoam.diffuseColor = Color3.White();
  }
  matRiverFoam.emissiveColor = Color3.White().scale(0.85);
  matRiverFoam.specularColor = Color3.Black();
  matRiverFoam.disableLighting = true;
  matRiverFoam.alpha = 0.72;
  matRiverFoam.zOffset = -2;

  // Dải cát vàng (Sand Shelf: 1.1m) và gờ đá (Stone Curb: 1.0m)
  const sandWidth = 1.1;
  const curbWidth = 1.0;

  // Bờ Tây (left) chia 2 đoạn Bắc & Nam để để hở hoàn toàn Vịnh Hòa Lưu sang Hồ Pha Lê (z in [-36, 44])
  const leftSandNorthInner = [];
  const leftSandNorthOuter = [];
  const leftCurbNorthOuter = [];
  const leftFoamNorthInner = [];
  const leftFoamNorthOuter = [];

  const leftSandSouthInner = [];
  const leftSandSouthOuter = [];
  const leftCurbSouthOuter = [];
  const leftFoamSouthInner = [];
  const leftFoamSouthOuter = [];

  // Bờ Đông (right) chạy liên tục suốt dọc sông
  const rightSandInner = [];
  const rightSandOuter = [];
  const rightCurbOuter = [];
  const rightFoamInner = [];
  const rightFoamOuter = [];

  for (let i = 0; i < sampledSpline.length; i++) {
    const cur = sampledSpline[i];
    const prev = i > 0 ? sampledSpline[i - 1] : cur;
    const next = i < sampledSpline.length - 1 ? sampledSpline[i + 1] : cur;
    let tx = next.x - prev.x;
    let tz = next.z - prev.z;
    const len = Math.hypot(tx, tz) || 1;
    tx /= len;
    tz /= len;
    const nx = -tz;
    const nz = tx;
    const halfW = cur.w / 2;

    // Thềm cát bắt đầu tại mép ngoài bờ sông (y = 0.084 > y_water 0.082) triệt tiêu hoàn toàn Z-fighting
    const pSandInL = new Vector3(cur.x + nx * (halfW + 0.02), 0.084, cur.z + nz * (halfW + 0.02));
    const pSandLeft = new Vector3(cur.x + nx * (halfW + sandWidth), 0.105, cur.z + nz * (halfW + sandWidth));
    const pCurbLeft = new Vector3(cur.x + nx * (halfW + sandWidth + curbWidth), 0.145, cur.z + nz * (halfW + sandWidth + curbWidth));

    const pFoamInL = new Vector3(cur.x + nx * (halfW - 0.20), 0.084, cur.z + nz * (halfW - 0.20));
    const pFoamOutL = new Vector3(cur.x + nx * (halfW + 0.35), 0.086, cur.z + nz * (halfW + 0.35));

    if (cur.z <= -36) {
      leftSandNorthInner.push(pSandInL);
      leftSandNorthOuter.push(pSandLeft);
      leftCurbNorthOuter.push(pCurbLeft);
      leftFoamNorthInner.push(pFoamInL);
      leftFoamNorthOuter.push(pFoamOutL);
    } else if (cur.z >= 44) {
      leftSandSouthInner.push(pSandInL);
      leftSandSouthOuter.push(pSandLeft);
      leftCurbSouthOuter.push(pCurbLeft);
      leftFoamSouthInner.push(pFoamInL);
      leftFoamSouthOuter.push(pFoamOutL);
    }

    const pSandInR = new Vector3(cur.x - nx * (halfW + 0.02), 0.084, cur.z - nz * (halfW + 0.02));
    const pSandRight = new Vector3(cur.x - nx * (halfW + sandWidth), 0.105, cur.z - nz * (halfW + sandWidth));
    const pCurbRight = new Vector3(cur.x - nx * (halfW + sandWidth + curbWidth), 0.145, cur.z - nz * (halfW + sandWidth + curbWidth));

    const pFoamInR = new Vector3(cur.x - nx * (halfW - 0.20), 0.084, cur.z - nz * (halfW - 0.20));
    const pFoamOutR = new Vector3(cur.x - nx * (halfW + 0.35), 0.086, cur.z - nz * (halfW + 0.35));

    rightSandInner.push(pSandInR);
    rightSandOuter.push(pSandRight);
    rightCurbOuter.push(pCurbRight);
    rightFoamInner.push(pFoamInR);
    rightFoamOuter.push(pFoamOutR);
  }
  yield;

  // A. Tạo các ribbon thềm cát & gờ đá bờ Tây (Bắc & Nam)
  if (leftSandNorthInner.length >= 2) {
    const leftSandNorthMesh = MeshBuilder.CreateRibbon('grand-river-sand-left-north', {
      pathArray: [leftSandNorthInner, leftSandNorthOuter],
      sideOrientation: Mesh.DOUBLESIDE,
    }, scene);
    leftSandNorthMesh.material = matSandBank;
    leftSandNorthMesh.parent = root;
    leftSandNorthMesh.freezeWorldMatrix();

    const leftBankNorthMesh = MeshBuilder.CreateRibbon('grand-river-bank-left-north', {
      pathArray: [leftSandNorthOuter, leftCurbNorthOuter],
      sideOrientation: Mesh.DOUBLESIDE,
    }, scene);
    leftBankNorthMesh.material = matBank;
    leftBankNorthMesh.parent = root;
    leftBankNorthMesh.freezeWorldMatrix();

    const leftFoamNorthMesh = MeshBuilder.CreateRibbon('grand-river-foam-left-north', {
      pathArray: [leftFoamNorthInner, leftFoamNorthOuter],
      sideOrientation: Mesh.DOUBLESIDE,
    }, scene);
    leftFoamNorthMesh.material = matRiverFoam;
    leftFoamNorthMesh.parent = root;
    leftFoamNorthMesh.freezeWorldMatrix();
  }

  if (leftSandSouthInner.length >= 2) {
    const leftSandSouthMesh = MeshBuilder.CreateRibbon('grand-river-sand-left-south', {
      pathArray: [leftSandSouthInner, leftSandSouthOuter],
      sideOrientation: Mesh.DOUBLESIDE,
    }, scene);
    leftSandSouthMesh.material = matSandBank;
    leftSandSouthMesh.parent = root;
    leftSandSouthMesh.freezeWorldMatrix();

    const leftBankSouthMesh = MeshBuilder.CreateRibbon('grand-river-bank-left-south', {
      pathArray: [leftSandSouthOuter, leftCurbSouthOuter],
      sideOrientation: Mesh.DOUBLESIDE,
    }, scene);
    leftBankSouthMesh.material = matBank;
    leftBankSouthMesh.parent = root;
    leftBankSouthMesh.freezeWorldMatrix();

    const leftFoamSouthMesh = MeshBuilder.CreateRibbon('grand-river-foam-left-south', {
      pathArray: [leftFoamSouthInner, leftFoamSouthOuter],
      sideOrientation: Mesh.DOUBLESIDE,
    }, scene);
    leftFoamSouthMesh.material = matRiverFoam;
    leftFoamSouthMesh.parent = root;
    leftFoamSouthMesh.freezeWorldMatrix();
  }

  // B. Tạo ribbon thềm cát & gờ đá bờ Đông (Right Bank)
  const rightSandMesh = MeshBuilder.CreateRibbon('grand-river-sand-right', {
    pathArray: [rightSandInner, rightSandOuter],
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  rightSandMesh.material = matSandBank;
  rightSandMesh.parent = root;
  rightSandMesh.freezeWorldMatrix();

  const rightBankMesh = MeshBuilder.CreateRibbon('grand-river-bank-right', {
    pathArray: [rightSandOuter, rightCurbOuter],
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  rightBankMesh.material = matBank;
  rightBankMesh.parent = root;
  rightBankMesh.freezeWorldMatrix();

  const rightFoamMesh = MeshBuilder.CreateRibbon('grand-river-foam-right', {
    pathArray: [rightFoamInner, rightFoamOuter],
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  rightFoamMesh.material = matRiverFoam;
  rightFoamMesh.parent = root;
  rightFoamMesh.freezeWorldMatrix();
  yield;

  // ========================================================
  // 4B. TIỂU CẢNH THIÊN NHIÊN 2 BÊN BỜ SÔNG (RIVERSIDE GHIBLI SCENERY)
  // Thực vật, hoa dại, sậy nước, đá cuội rêu phong và đèn bão ven sông
  // Tuyệt đối an toàn: Toàn bộ nằm trên bờ đất khô ráo, không mọc trên nước và không lấn vào nông trại
  // ========================================================
  let matPebble = null;
  let matMossRock = null;
  let matReedStalk = null;
  let matReedHead = null;
  let matFlowerWhite = null;
  let matFlowerYellow = null;
  let matLanternPost = null;
  let matLanternGlow = null;
  if (!scene.metadata?.mobile) {
    matPebble = new StandardMaterial('river-pebble-mat', scene);
    matPebble.diffuseColor = Color3.FromHexString('#e2e8f0');
    matPebble.ambientColor = matPebble.diffuseColor.scale(0.5);

    matMossRock = new StandardMaterial('river-mossy-rock-mat', scene);
    matMossRock.diffuseColor = Color3.FromHexString('#86efac');
    matMossRock.ambientColor = Color3.FromHexString('#15803d').scale(0.4);

    matReedStalk = new StandardMaterial('river-reed-stalk-mat', scene);
    matReedStalk.diffuseColor = Color3.FromHexString('#65a30d');

    matReedHead = new StandardMaterial('river-reed-head-mat', scene);
    matReedHead.diffuseColor = Color3.FromHexString('#78350f');

    matFlowerWhite = new StandardMaterial('river-flower-white-mat', scene);
    matFlowerWhite.diffuseColor = Color3.White();

    matFlowerYellow = new StandardMaterial('river-flower-yellow-mat', scene);
    matFlowerYellow.diffuseColor = Color3.FromHexString('#facc15');

    matLanternPost = new StandardMaterial('river-lantern-wood', scene);
    matLanternPost.diffuseColor = Color3.FromHexString('#78350f');

    matLanternGlow = new StandardMaterial('river-lantern-glow', scene);
    matLanternGlow.diffuseColor = Color3.FromHexString('#fef08a');
    matLanternGlow.emissiveColor = Color3.FromHexString('#f59e0b').scale(0.9);
    matLanternGlow.disableLighting = true;

    // Lặp qua các mốc spline để bố trí tiểu cảnh ven bờ một cách nhịp nhàng
    for (let p = 2; p < sampledSpline.length - 2; p += 3) {
      const cur = sampledSpline[p];
      const prev = sampledSpline[p - 1];
      const next = sampledSpline[p + 1];
      let tx = next.x - prev.x;
      let tz = next.z - prev.z;
      const len = Math.hypot(tx, tz) || 1;
      tx /= len;
      tz /= len;
      const nx = -tz;
      const nz = tx;
      const halfW = cur.w / 2;

      // Kiểm tra không trùng với các nhịp cầu
      const isBridge = RIVER_BRIDGES.some(b => Math.abs(cur.z - b.cz) < b.widthZ + 3.0);
      if (isBridge) continue;

      // Trải đều 2 bên bờ (side = 1: Bờ Tây, side = -1: Bờ Đông)
      for (const side of [1, -1]) {
        // Bờ Tây trong khoảng Vịnh Hòa Lưu Hồ (-38 đến 44) giữ thông thoáng tối đa
        if (side === 1 && cur.z >= -38 && cur.z <= 44) continue;

        const baseOffset = halfW + sandWidth + curbWidth;
        const typeChoice = (p + (side === 1 ? 0 : 3)) % 5;

        if (typeChoice === 0 || typeChoice === 2) {
          // 1. CỤM SẬY NƯỚC & BÔNG LAU NÂU (Water Cattails & Reeds)
          const clX = cur.x + side * nx * (baseOffset + 0.45);
          const clZ = cur.z + side * nz * (baseOffset + 0.45);
          for (let r = 0; r < 3; r++) {
            const rH = 1.1 + (r % 2) * 0.3;
            const stalk = MeshBuilder.CreateCylinder(`river-reed-${p}-${side}-${r}`, {
              height: rH,
              diameter: 0.045,
              tessellation: 4,
            }, scene);
            stalk.position.set(clX + (r - 1) * 0.25, 0.15 + rH * 0.5, clZ + (r % 2 === 0 ? 0.15 : -0.15));
            stalk.material = matReedStalk;
            stalk.parent = root;
            stalk.freezeWorldMatrix();

            const head = MeshBuilder.CreateCylinder(`river-reed-head-${p}-${side}-${r}`, {
              height: 0.28,
              diameter: 0.085,
              tessellation: 6,
            }, scene);
            head.position.set(stalk.position.x, 0.15 + rH + 0.05, stalk.position.z);
            head.material = matReedHead;
            head.parent = root;
            head.freezeWorldMatrix();
          }
        } else if (typeChoice === 1) {
          // 2. KHÓM HOA DẠI VEN SÔNG GHIBLI (Chibi Wildflowers)
          const flX = cur.x + side * nx * (baseOffset + 0.55);
          const flZ = cur.z + side * nz * (baseOffset + 0.55);
          for (let f = 0; f < 4; f++) {
            const petal = MeshBuilder.CreateSphere(`river-fl-${p}-${side}-${f}`, {
              diameterX: 0.28,
              diameterY: 0.06,
              diameterZ: 0.28,
              segments: 3,
            }, scene);
            petal.position.set(flX + (f % 2 === 0 ? 0.25 : -0.25), 0.18, flZ + (f > 1 ? 0.22 : -0.22));
            petal.material = matFlowerWhite;
            petal.parent = root;
            petal.freezeWorldMatrix();

            const center = MeshBuilder.CreateSphere(`river-flc-${p}-${side}-${f}`, {
              diameter: 0.12,
              segments: 3,
            }, scene);
            center.position.set(petal.position.x, 0.21, petal.position.z);
            center.material = matFlowerYellow;
            center.parent = root;
            center.freezeWorldMatrix();
          }
        } else if (typeChoice === 3) {
          // 3. ĐÁ CUỘI TỰ NHIÊN & TẢNG ĐÁ RÊU PHONG (Mossy Boulders & River Rocks)
          const rkX = cur.x + side * nx * (baseOffset + 0.35);
          const rkZ = cur.z + side * nz * (baseOffset + 0.35);
          const rock = MeshBuilder.CreateSphere(`river-rock-${p}-${side}`, {
            diameterX: 0.85 + (p % 2) * 0.35,
            diameterY: 0.42,
            diameterZ: 0.75 + (p % 3) * 0.25,
            segments: 4,
          }, scene);
          rock.position.set(rkX, 0.20, rkZ);
          rock.rotation.y = (p * 53) % Math.PI;
          rock.material = (p % 2 === 0) ? matPebble : matMossRock;
          rock.parent = root;
          rock.receiveShadows = true;
          rock.freezeWorldMatrix();
        } else if (typeChoice === 4 && (p % 6 === 0)) {
          // 4. CỘT ĐÈN BÃO CỔ ĐIỂN VEN SÔNG (Fairytale Riverside Lantern)
          const lX = cur.x + side * nx * (baseOffset + 0.85);
          const lZ = cur.z + side * nz * (baseOffset + 0.85);

          const post = MeshBuilder.CreateCylinder(`river-post-${p}-${side}`, {
            height: 1.85,
            diameter: 0.12,
            tessellation: 6,
          }, scene);
          post.position.set(lX, 0.15 + 0.92, lZ);
          post.material = matLanternPost;
          post.parent = root;
          post.freezeWorldMatrix();

          const arm = MeshBuilder.CreateBox(`river-arm-${p}-${side}`, {
            width: 0.45,
            height: 0.08,
            depth: 0.08,
          }, scene);
          arm.position.set(lX - side * 0.18, 0.15 + 1.75, lZ);
          arm.material = matLanternPost;
          arm.parent = root;
          arm.freezeWorldMatrix();

          const bulb = MeshBuilder.CreateSphere(`river-bulb-${p}-${side}`, {
            diameter: 0.36,
            segments: 6,
          }, scene);
          bulb.position.set(lX - side * 0.32, 0.15 + 1.55, lZ);
          bulb.material = matLanternGlow;
          bulb.parent = root;
          bulb.freezeWorldMatrix();
        }
      }
    }
    yield;
  }

  // 5. Build the 4 Solid Bridges
  yield* createBridgesSteps(scene, root, shadows);
  yield;

  // 6. Bọt nước rẽ sóng ở chân các trụ cầu đá (Bridge Pier Water Wakes)
  const pierWakes = [];
  for (const b of RIVER_BRIDGES) {
    const pierOffsets = b.type === 'highway' ? [-b.spanX * 0.40, b.spanX * 0.40] : [-b.spanX * 0.35, b.spanX * 0.35];
    pierOffsets.forEach((px, pIdx) => {
      const wake = createWaterRippleRingSystem(scene, root, {
        count: 2,
        minRadius: 0.6,
        maxRadius: 1.9,
        speed: 0.85,
        y: 0.083,
        color: '#e0f2fe',
        center: new Vector3(b.cx + px, 0, b.cz),
        prefix: `river-pier-wake-${b.id}-${pIdx}`,
      });
      pierWakes.push(wake);
    });
  }
  yield;

  // 7. Đốm nắng lấp lánh phản chiếu mặt sông (Scenic River Sun Sparkles)
  const riverSparkles = createWaterSunSparkles(scene, root, {
    count: 14,
    bounds: { minX: 172, maxX: 218, minZ: -20, maxZ: 110 },
    y: 0.084,
    color: '#ffffff',
  });
  yield;

  // 7B. Dải sương mù là đà ven sông phong cách Ghibli (Low-Lying River Mist)
  if (!scene.metadata?.mobile) {
    const mistSpline = sampledSpline.filter(p => p.z >= -160 && p.z <= 160);
    createLowLyingRiverMist(scene, root, {
      path: mistSpline,
      width: 6.8,
      y: 0.14,
    });
    yield;

    // 7C. Bậc đá tròn chibi bước qua suối nông (Chibi River Stepping Stones)
    // Bố trí tại khúc uốn nông cao nguyên z = -175 (giữa Cầu 1 và Cầu 2)
    createChibiSteppingStones(
      scene,
      root,
      new Vector3(199.5, 0, -175),
      new Vector3(212.5, 0, -175),
      5
    );
    yield;

    // 7D. Sàn gỗ ngắm cảnh ven sông Làng Ven Sông (Riverside Scenic Lookout Platform)
    createRiversideScenicDeck(scene, root, {
      x: 227.5,
      y: 0.12,
      z: 140,
      rotationY: -Math.PI / 2,
    }, shadows);
    yield;

    // 7E. Cánh hoa bồng bềnh trôi xuôi dòng sông (Drifting River Petals)
    createDriftingPetals(scene, root, 18, {
      minX: 202,
      maxX: 226,
      minZ: -120,
      maxZ: 220,
    });
    yield;

    // 7F. Đom đóm dạ quang ven rặng lau sậy bờ sông (Bioluminescent River Fireflies)
    createBioluminescentFireflies(scene, root, {
      count: 16,
      center: { x: 216, z: 210 },
      radius: 22,
      y: 0.6,
    });
    yield;

    // 7G. Hàng cây thu vàng & sồi cổ thụ ven bờ Đông sông (Grand River East Bank Tree Avenue)
    // Tạo chiều sâu điện ảnh ngoạn mục khi nhìn từ bờ hồ sang bờ sông phía Đông
    const eastRiverTrees = [
      { x: 228.0, z: -55.0, model: MODEL_PATHS.trees.fall, scale: 2.6, rot: 0.5 },
      { x: 228.5, z: -25.0, model: MODEL_PATHS.trees.oak, scale: 2.5, rot: -0.8 },
      { x: 228.0, z: 8.0, model: MODEL_PATHS.trees.fall, scale: 2.7, rot: 1.2 },
      { x: 228.5, z: 35.0, model: MODEL_PATHS.trees.oakFall, scale: 2.4, rot: -0.4 },
      { x: 228.0, z: 65.0, model: MODEL_PATHS.trees.fall, scale: 2.6, rot: 0.9 },
    ];

    eastRiverTrees.forEach((t, idx) => {
      spawnModelSync(scene, t.model, {
        name: `river-east-tree-${idx}`,
        position: new Vector3(t.x, 0.10, t.z),
        scaling: new Vector3(t.scale, t.scale, t.scale),
        rotation: new Vector3(0, t.rot, 0),
        shadows,
        parent: root,
      });
    });
    yield;

    // 7H. Đàn cò trắng đứng rỉa cánh ven bãi bồi cao nguyên & hạ lưu
    const riverStorks = [
      { x: 218.5, z: -375.0, rot: 0.8 },
      { x: 202.0, z: -85.0, rot: -1.2 },
      { x: 219.0, z: 275.0, rot: 1.5 },
    ];
    riverStorks.forEach((st, sIdx) => {
      spawnModelSync(scene, MODEL_PATHS.animals.stork, {
        name: `river-stork-${sIdx}`,
        position: new Vector3(st.x, 0.10, st.z),
        scaling: new Vector3(1.25, 1.25, 1.25),
        rotation: new Vector3(0, st.rot, 0),
        shadows,
        parent: root,
      });
    });
    yield;
  }

  // 8. Compute River Collision Boxes for WorldCollisionSystem (Excluding bridge corridors & Lake Confluence)
  const collisionBoxes = [];
  const stepSize = 2; // Tighter bounding step
  for (let i = 0; i < sampledSpline.length - stepSize; i += stepSize) {
    const pStart = sampledSpline[i];
    const pEnd = sampledSpline[i + stepSize];
    const segMinZ = Math.min(pStart.z, pEnd.z);
    const segMaxZ = Math.max(pStart.z, pEnd.z);
    const maxW = Math.max(pStart.w, pEnd.w);

    // Check if this segment's Z interval overlaps any bridge corridor
    const isBridgeCorridor = RIVER_BRIDGES.some(b => {
      const bridgeMinZ = b.cz - b.widthZ / 2 - 1.2;
      const bridgeMaxZ = b.cz + b.widthZ / 2 + 1.2;
      return segMinZ <= bridgeMaxZ && segMaxZ >= bridgeMinZ;
    });

    // Check if this segment is part of Crystal Lake Confluence Bay (seamless waterway)
    const isLakeConfluence = (segMinZ >= -38 && segMaxZ <= 38);

    if (!isBridgeCorridor && !isLakeConfluence) {
      collisionBoxes.push({
        id: `river-barrier-${i}`,
        minX: Math.min(pStart.x, pEnd.x) - maxW / 2 - 0.5,
        maxX: Math.max(pStart.x, pEnd.x) + maxW / 2 + 0.5,
        minZ: segMinZ - 0.2,
        maxZ: segMaxZ + 0.2,
      });
    }
  }
  yield;

  for(const mesh of root.getChildMeshes()){
    if(/^grand-river-(sand|bank|foam)-/.test(mesh.name))mesh.dispose();
  }
  collisionBoxes.push(...createWaterNetwork(scene,root,matWater,matSandBank,shadows));
  yield* createWaterfrontScenerySteps(scene,root,shadows);
  yield;

  // 9. Vòng lặp hoạt ảnh tự vận hành (Autonomous 60 FPS Render Observer)
  // Đảm bảo dòng sông luôn luôn cuộn chảy mượt mà ngay cả khi không có hàm update gọi từ ngoài
  let lastTime = performance.now();
  const animObserver = scene.onBeforeRenderObservable.add(() => {
    if (scene.isDisposed || root.isDisposed?.()) {
      if (animObserver) scene.onBeforeRenderObservable.remove(animObserver);
      return;
    }
    const now = performance.now();
    const nowSec = now * 0.001;
    const dt = Math.min(0.05, (now - lastTime) * 0.001);
    lastTime = now;
    // B. Dòng chảy êm đềm lững lờ cực kỳ chill chuẩn Play Together
    if (riverTex && riverTex.vOffset !== undefined) {
      riverTex.vOffset -= dt * 0.020;
    }

    // C. Vi sóng gợn nhẹ ngang mặt nước (Gentle Ripple Oscillation)
    if (riverTex && riverTex.uOffset !== undefined) {
      riverTex.uOffset = Math.sin(nowSec * 0.45) * 0.010;
    }

    // D. Cập nhật các vòng bọt nước rẽ sóng ở chân cầu
    pierWakes.forEach(wake => wake.update(nowSec));

    // E. Cập nhật các điểm sáng quang học trên mặt sông
    riverSparkles?.update(nowSec);

    // F. Nhịp thở êm đềm của dải bọt mép bờ sông (Breathing Shoreline Foam)
    matRiverFoam.alpha = 0.65 + 0.18 * Math.sin(nowSec * 1.8);
  });

  return {
    root,
    riverMesh,
    bridges: RIVER_BRIDGES,
    getCollisionBoxes: () => collisionBoxes,
    update(dt) {
      // Giữ lại hàm update thủ công cho backward compatibility
      if (riverTex && riverTex.vOffset !== undefined) {
        riverTex.vOffset -= dt * 0.020;
      }
    },
    dispose() {
      if (animObserver) scene.onBeforeRenderObservable.remove(animObserver);
      pierWakes.forEach(wake => wake.dispose());
      riverSparkles?.dispose();
      riverTex.dispose();
      bankSandTex.dispose();
      bankStoneTex.dispose();
      riverFoamTex.dispose();
      matWater.dispose();
      matSandBank.dispose();
      matBank.dispose();
      matRiverFoam.dispose();
      matRiverBed.dispose();
      matPebble?.dispose();
      matMossRock?.dispose();
      matReedStalk?.dispose();
      matReedHead?.dispose();
      matFlowerWhite?.dispose();
      matFlowerYellow?.dispose();
      matLanternPost?.dispose();
      matLanternGlow?.dispose();
      root.dispose(false, true);
    },
  };
}

export function createGrandWindingRiver(scene, parent = null, shadows = null) {
  const steps = createGrandWindingRiverSteps(scene, parent, shadows);
  let result;
  do { result = steps.next(); } while (!result.done);
  return result.value;
}
