import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { PointLight } from '@babylonjs/core/Lights/pointLight.js';

function makeMat(scene, name, hex, emissiveHex = null, specular = 0.15, specularPower = 32) {
  let m = scene.getMaterialByName(name);
  if (!m) {
    m = new StandardMaterial(name, scene);
    m.diffuseColor = Color3.FromHexString(hex);
    m.ambientColor = m.diffuseColor.scale(0.35);
    m.specularColor = new Color3(specular, specular, specular);
    m.specularPower = specularPower;
    if (emissiveHex) {
      // Colored furniture must retain shading; only lamps emit appreciably.
      m.emissiveColor = Color3.FromHexString(emissiveHex).scale(name === 'casino-int-bulb' ? 0.45 : 0.06);
    } else {
      m.emissiveColor = Color3.Black();
    }
  }
  return m;
}

function createTextSign(scene, name, text, parent, position, options = {}) {
  const width = options.width || 3.2;
  const height = options.height || 0.72;
  const texture = new DynamicTexture(`${name}-texture`, { width: 768, height: 192 }, scene, true);
  const ctx = texture.getContext();
  ctx.fillStyle = options.background || '#173f4a';
  ctx.fillRect(0, 0, 768, 192);
  ctx.strokeStyle = options.border || '#ffe29a';
  ctx.lineWidth = 12;
  ctx.strokeRect(8, 8, 752, 176);
  ctx.fillStyle = options.color || '#fff8e7';
  ctx.font = '900 58px "Arial Rounded MT Bold", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 384, 98, 700);
  texture.update();

  const material = new StandardMaterial(`${name}-material`, scene);
  material.diffuseTexture = texture;
  material.emissiveColor = Color3.FromHexString(options.emissive || options.color || '#fff8e7').scale(options.emissiveStrength || 0.18);
  material.specularColor = Color3.Black();

  const sign = MeshBuilder.CreatePlane(name, { width, height }, scene);
  sign.position.copyFrom(position);
  sign.billboardMode = options.billboard ? Mesh.BILLBOARDMODE_Y : Mesh.BILLBOARDMODE_NONE;
  sign.material = material;
  sign.parent = parent;
  sign.isPickable = false;
  return sign;
}

function createNeonStrip(scene, name, parent, position, dimensions, material) {
  const strip = MeshBuilder.CreateBox(name, dimensions, scene);
  strip.position.copyFrom(position);
  strip.material = material;
  strip.parent = parent;
  strip.isPickable = false;
  return strip;
}

function createFloorPod(scene, parent, name, material, diameter = 6.0) {
  const pod = MeshBuilder.CreateCylinder(name, { diameter, height: 0.06, tessellation: 32 }, scene);
  pod.position.y = 0.055;
  pod.material = material;
  pod.parent = parent;
  pod.isPickable = false;
  return pod;
}

function createGameSurface(scene, parent, game, width, depth, color) {
  if (game !== 'bau-cua') {
    const felt = MeshBuilder.CreateCylinder(`casino-felt-inset-${game}`, {
      diameter: game === 'tai-xiu' ? 4.85 : game === 'bai-cao' ? 4.25 : 3.85,
      height: 0.015, tessellation: 40,
    }, scene);
    felt.parent = parent;
    felt.position.y = 1.355;
    felt.material = makeMat(scene, `casino-felt-base-${game}`, color, null, 0, 16);
    felt.isPickable = false;
  }
  const texture = new DynamicTexture(`casino-felt-${game}`, { width: 768, height: 512 }, scene, true);
  const ctx = texture.getContext();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 768, 512);
  ctx.strokeStyle = '#ead9ac';
  ctx.lineWidth = 5;
  ctx.strokeRect(24, 24, 720, 464);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 34px "Segoe UI", sans-serif';
  const labels = game === 'bau-cua' ? ['BẦU', 'CUA', 'TÔM', 'CÁ', 'GÀ', 'NAI']
    : game === 'tai-xiu' ? ['TÀI', 'CHẴN', 'XỈU', '11–17', 'BÃO', '4–10']
      : ['♠', '♥', '♦', '♣'];
  const columns = labels.length === 6 ? 3 : 4;
  (game === 'bau-cua' ? [] : labels).forEach((label, index) => {
    const px = 48 + (index % columns) * (672 / columns);
    const py = labels.length === 6 ? 64 + Math.floor(index / columns) * 206 : 312;
    ctx.fillStyle = '#fff6dc';
    ctx.strokeRect(px, py, 672 / columns - 12, labels.length === 6 ? 178 : 120);
    ctx.fillText(label, px + (672 / columns - 12) / 2, py + (labels.length === 6 ? 89 : 60));
  });
  texture.update();
  texture.anisotropicFilteringLevel = 8;
  const material = new StandardMaterial(`casino-felt-material-${game}`, scene);
  material.diffuseTexture = texture;
  material.specularColor = Color3.Black();
  const surface = MeshBuilder.CreatePlane(`casino-felt-surface-${game}`, { width, height: depth }, scene);
  surface.parent = parent;
  surface.position.y = 1.365;
  surface.rotation.x = Math.PI / 2;
  surface.material = material;
  surface.isPickable = false;
  return surface;
}

function createArcadeCabinet(scene, parent, name, position, bodyMaterial, accentMaterial, screenMaterial, shadows, rotation = 0) {
  const root = new TransformNode(name, scene);
  root.position.copyFrom(position);
  root.rotation.y = rotation;
  root.parent = parent;

  const body = MeshBuilder.CreateBox(`${name}-body`, { width: 1.28, height: 2.15, depth: 0.82 }, scene);
  body.position.y = 1.08;
  body.material = bodyMaterial;
  body.parent = root;
  body.isPickable = false;

  const marquee = MeshBuilder.CreateBox(`${name}-marquee`, { width: 1.42, height: 0.34, depth: 0.88 }, scene);
  marquee.position.set(0, 2.3, -0.02);
  marquee.material = accentMaterial;
  marquee.parent = root;
  marquee.isPickable = false;

  const screen = MeshBuilder.CreateBox(`${name}-screen`, { width: 0.9, height: 0.62, depth: 0.05 }, scene);
  screen.position.set(0, 1.66, -0.44);
  screen.material = screenMaterial;
  screen.parent = root;
  screen.isPickable = false;

  const control = MeshBuilder.CreateBox(`${name}-control`, { width: 1.1, height: 0.12, depth: 0.48 }, scene);
  control.position.set(0, 1.17, -0.33);
  control.rotation.x = -0.22;
  control.material = accentMaterial;
  control.parent = root;
  control.isPickable = false;

  for (let i = 0; i < 2; i++) {
    const button = MeshBuilder.CreateSphere(`${name}-button-${i}`, { diameter: 0.11, segments: 8 }, scene);
    button.position.set(-0.23 + i * 0.3, 1.25, -0.61);
    button.material = screenMaterial;
    button.parent = root;
    button.isPickable = false;
  }
  shadows?.addShadowCaster(body);
  return root;
}

/**
 * Tạo sảnh Game Lounge 3D phong cách Play Together cho Hội Quán Trò Chơi.
 * Tọa độ trung tâm: interior: { x: 210, y: 32, z: -215 }
 * Bao gồm:
 * 1. Game lounge sáng màu: sàn gỗ, tường teal, đèn panel, neon và photo spot.
 * 2. Bàn 3D Xúc Xắc Vui Sic Bo (Bán nguyệt, nỉ đỏ, bát đĩa 3D, xúc xắc ruby).
 * 3. Bàn 3D Vườn Linh Vật Tôm Cá (Nỉ xanh ngọc, 6 ô linh vật, đĩa lắc).
 * 4. Bàn 3D Bộ Ba Kỳ Diệu 3 Lá (Nỉ xanh lục, phỉnh sứ, bộ bài hoàng gia).
 * 5. Bàn 3D Tiến Lên Miền Nam (Bàn tròn gỗ sẫm, 4 ghế da cao cấp).
 * 6. Quầy tiếp tân NPC Chú Lộc và Cửa thoát hiểm ra quảng trường.
 */
export function* createCasinoLoungeInterior(scene, config, shadows) {
  const { x, y, z } = config.interior;
  yield;

  // 1. Bảng màu game lounge sáng kiểu Play Together: gỗ sáng, pastel và neon mềm.
  const matFloorWood = makeMat(scene, 'casino-int-floor-wood', '#e4c9a9', null, 0.12, 32);
  matFloorWood.backFaceCulling = false;
  const matFloorBorder = makeMat(scene, 'casino-int-floor-marble', '#f6c95b', '#f4b942', 0.45, 64);
  const matFloorInset = makeMat(scene, 'casino-int-floor-inset', '#f0ddc3', null, 0.08, 32);
  const matWall = makeMat(scene, 'casino-int-wall-teal', '#e0f2ee', null, 0.1, 24);
  matWall.backFaceCulling = false;
  const matWallAccent = makeMat(scene, 'casino-int-wall-accent', '#4f8d95', '#2dd4bf', 0.12, 32);
  const matGoldTrim = makeMat(scene, 'casino-int-gold-trim', '#ffd166', '#ffb703', 0.6, 96);
  const matRedFelt = makeMat(scene, 'casino-int-felt-red', '#e77b83', '#c75b69', 0.08, 16);
  const matGreenFelt = makeMat(scene, 'casino-int-felt-green', '#68c79d', '#3ba77c', 0.08, 16);
  const matBlueFelt = makeMat(scene, 'casino-int-felt-blue', '#75b9df', '#4a91c2', 0.08, 16);
  const matPurpleFelt = makeMat(scene, 'casino-int-felt-purple', '#b79be8', '#8966ce', 0.08, 16);
  const matPodCoral = makeMat(scene, 'casino-pod-coral', '#d78a8f', null, 0.08, 16);
  const matPodMint = makeMat(scene, 'casino-pod-mint', '#6da98d', null, 0.08, 16);
  const matPodSky = makeMat(scene, 'casino-pod-sky', '#6d9fbe', null, 0.08, 16);
  const matPodLilac = makeMat(scene, 'casino-pod-lilac', '#9277bb', null, 0.08, 16);
  const matDarkOak = makeMat(scene, 'casino-int-dark-oak', '#9ebec7', null, 0.12, 32);
  const matLeather = makeMat(scene, 'casino-int-leather', '#e5c6ac', null, 0.12, 24);
  const matBulb = makeMat(scene, 'casino-int-bulb', '#fff8d6', '#ffe082', 0.8, 64);
  const matAquaGlow = makeMat(scene, 'casino-int-aqua-glow', '#7ee8dc', '#20d9c3', 0.2, 32);
  const matCoralGlow = makeMat(scene, 'casino-int-coral-glow', '#ff9b8f', '#ff6f61', 0.2, 32);
  const matPurpleGlow = makeMat(scene, 'casino-int-purple-glow', '#d1b7ff', '#a979ff', 0.2, 32);
  const matPlateGold = makeMat(scene, 'casino-int-plate-gold', '#ffd166', '#f59e0b', 0.7, 80);
  yield;

  // 2. Vỏ hộp cản quang tuyệt đối 90m x 42m x 90m
  const matOuter = makeMat(scene, 'casino-outer-mat', '#172d36', '#173943', 0, 0);
  matOuter.backFaceCulling = false;
  matOuter.disableLighting = true;

  const outerBox = MeshBuilder.CreateBox('casino-int-outer-box', { width: 90, height: 42, depth: 90 }, scene);
  outerBox.position.set(x, y + 10, z - 4);
  outerBox.material = matOuter;
  outerBox.isPickable = false;
  yield;

  // Sàn nhà và trần nhà
  const floorBorder = MeshBuilder.CreateBox('casino-int-floor-border', { width: 28.8, height: 0.18, depth: 32.8 }, scene);
  floorBorder.position.set(x, y - 0.04, z - 3);
  floorBorder.material = matFloorBorder;
  floorBorder.receiveShadows = true;
  yield;

  const floor = MeshBuilder.CreateBox('casino-int-floor', { width: 28.0, height: 0.6, depth: 32.0 }, scene);
  floor.position.set(x, y - 0.3, z - 3);
  floor.material = matFloorWood;
  floor.receiveShadows = true;
  yield;

  const floorInset = MeshBuilder.CreateBox('casino-int-floor-inset', { width: 25.8, height: 0.08, depth: 29.8 }, scene);
  floorInset.position.set(x, y + 0.02, z - 3);
  floorInset.material = matFloorInset;
  floorInset.receiveShadows = true;
  yield;

  const ceiling = MeshBuilder.CreateBox('casino-int-ceiling', { width: 28.0, height: 0.6, depth: 32.0 }, scene);
  ceiling.position.set(x, y + 7.6, z - 3);
  ceiling.material = matWall;
  yield;

  // Tường bao quanh phòng (Back, Left, Right, Front)
  const wallBack = MeshBuilder.CreateBox('casino-int-wall-back', { width: 28.0, height: 7.6, depth: 0.8 }, scene);
  wallBack.position.set(x, y + 3.8, z + 12.6);
  wallBack.material = matWall;
  yield;

  const wallLeft = MeshBuilder.CreateBox('casino-int-wall-left', { width: 0.8, height: 7.6, depth: 32.0 }, scene);
  wallLeft.position.set(x - 13.6, y + 3.8, z - 3);
  wallLeft.material = matWall;
  yield;

  const wallRight = MeshBuilder.CreateBox('casino-int-wall-right', { width: 0.8, height: 7.6, depth: 32.0 }, scene);
  wallRight.position.set(x + 13.6, y + 3.8, z - 3);
  wallRight.material = matWall;
  yield;

  // Tường trước và Cửa ra vào
  const wallFrontL = MeshBuilder.CreateBox('casino-int-wall-fl', { width: 11.2, height: 7.6, depth: 0.8 }, scene);
  wallFrontL.position.set(x - 8.0, y + 3.8, z - 18.6);
  wallFrontL.material = matWall;
  yield;

  const wallFrontR = MeshBuilder.CreateBox('casino-int-wall-fr', { width: 11.2, height: 7.6, depth: 0.8 }, scene);
  wallFrontR.position.set(x + 8.0, y + 3.8, z - 18.6);
  wallFrontR.material = matWall;
  yield;

  // Các dải màu giúp căn phòng có chiều sâu thay vì một khối tường phẳng.
  const wallBands = [
    ['back', new Vector3(x, y + 6.25, z + 12.12), { width: 24.0, height: 0.18, depth: 0.08 }, matAquaGlow],
  ];
  wallBands.forEach(([side, position, dimensions, material]) => createNeonStrip(scene, `casino-wall-band-${side}`, null, position, dimensions, material));

  // Trần đèn panel: emissive, nhẹ hơn point light và ổn định trên mobile.
  [-7, 0, 7].forEach((offset, index) => {
    const panel = MeshBuilder.CreateBox(`casino-ceiling-panel-${index}`, { width: 4.6, height: 0.08, depth: 1.2 }, scene);
    panel.position.set(x + offset, y + 7.25, z - 3);
    panel.material = index === 1 ? matBulb : matAquaGlow;
    panel.isPickable = false;
  });

  // Đèn cục bộ chỉ bật khi đang ở casino; FarmWorld quản lý lifecycle theo venue.
  const loungeLights = [
    ['casino-lounge-key', new Vector3(x, y + 6.4, z - 3), '#fff1c1', 0.9],
    ['casino-lounge-aqua', new Vector3(x - 9, y + 3.2, z + 2), '#7ee8dc', 0.55],
    ['casino-lounge-coral', new Vector3(x + 9, y + 3.0, z - 7), '#ff9b8f', 0.45],
  ];
  loungeLights.forEach(([name, position, color, intensity]) => {
    const light = new PointLight(name, position, scene);
    light.diffuse = Color3.FromHexString(color);
    light.specular = light.diffuse;
    light.intensity = intensity;
    light.range = 24;
    light.metadata = { interiorVenue: 'casino' };
    light.setEnabled(false);
  });
  yield;

  // Đèn chùm pha lê trung tâm (Grand Chandelier)
  const chandelierRoot = new TransformNode('casino-int-chandelier', scene);
  chandelierRoot.position.set(x, y + 6.8, z - 2);
  const chCenter = MeshBuilder.CreateCylinder('ch-center', { diameter: 3.2, height: 0.35, tessellation: 24 }, scene);
  chCenter.material = matGoldTrim;
  chCenter.parent = chandelierRoot;
  for (let ci = 0; ci < 8; ci++) {
    const angle = (ci / 8) * Math.PI * 2;
    const bulb = MeshBuilder.CreateSphere(`ch-bulb-${ci}`, { diameter: 0.4 }, scene);
    bulb.position.set(Math.cos(angle) * 1.4, -0.2, Math.sin(angle) * 1.4);
    bulb.material = matBulb;
    bulb.parent = chandelierRoot;
  }
  yield;

  // 2b. Sảnh đón khách: một điểm chụp ảnh và bảng hiệu lớn tạo focal point ngay
  // khi người chơi bước vào, thay cho cảm giác căn phòng trống và tối.
  const photoRoot = new TransformNode('casino-photo-spot', scene);
  photoRoot.position.set(x - 9, y, z - 12.0);

  const photoRug = MeshBuilder.CreateCylinder('casino-photo-rug', { diameter: 7.0, height: 0.08, tessellation: 32 }, scene);
  photoRug.position.y = 0.07;
  photoRug.material = matPurpleGlow;
  photoRug.parent = photoRoot;

  const photoRing = MeshBuilder.CreateTorus('casino-photo-ring', { diameter: 5.8, thickness: 0.12, tessellation: 32 }, scene);
  photoRing.position.y = 0.16;
  photoRing.material = matGoldTrim;
  photoRing.parent = photoRoot;

  [-2.0, 2.0].forEach((offset, index) => {
    const post = MeshBuilder.CreateBox(`casino-photo-post-${index}`, { width: 0.34, height: 3.8, depth: 0.34 }, scene);
    post.position.set(offset, 1.9, 0.35);
    post.material = index ? matAquaGlow : matCoralGlow;
    post.parent = photoRoot;
  });
  const photoHeader = MeshBuilder.CreateBox('casino-photo-header', { width: 4.4, height: 0.36, depth: 0.38 }, scene);
  photoHeader.position.set(0, 3.72, 0.35);
  photoHeader.material = matGoldTrim;
  photoHeader.parent = photoRoot;
  createTextSign(scene, 'casino-photo-sign', 'GÓC BẠN BÈ', photoRoot, new Vector3(0, 3.0, 0.12), {
    width: 3.6,
    height: 0.82,
    background: '#7545b8',
    border: '#ffe29a',
    color: '#fff8e7',
    emissive: '#d1b7ff',
  });
  yield;

  // Chỉ giữ hai máy arcade ở cuối phòng; phần giữa để trống cho camera và
  // tạo một trục di chuyển rõ ràng từ cửa vào tới quầy Chú Lộc.
  createArcadeCabinet(scene, null, 'casino-arcade-claw', new Vector3(x - 10.8, y, z + 7.0), matDarkOak, matCoralGlow, matPurpleGlow, shadows, Math.PI / 2);
  yield;
  createArcadeCabinet(scene, null, 'casino-arcade-lucky', new Vector3(x + 10.8, y, z + 7.0), matDarkOak, matAquaGlow, matCoralGlow, shadows, -Math.PI / 2);
  yield;

  // Thảm đỏ và Điểm thoát cửa (Exit Pad)
  const exitPad = MeshBuilder.CreateCylinder('casino-int-exit-pad', { diameter: 3.4, height: 0.05, tessellation: 24 }, scene);
  exitPad.position.set(x, y + 0.04, z - 16.5);
  exitPad.material = matGoldTrim;
  exitPad.metadata = { cityAction: 'exit', label: 'Cửa ra Quảng Trường' };
  yield;

  // Quầy Lễ Tân / Đổi Thưởng của Chú Lộc
  const counter = MeshBuilder.CreateBox('casino-int-counter', { width: 10.0, height: 1.65, depth: 2.2 }, scene);
  counter.position.set(x, y + 1.0, z + 9.5);
  counter.material = matDarkOak;
  counter.metadata = { cityAction: 'casino', label: 'Quầy Tiếp Tân Chú Lộc' };
  shadows?.addShadowCaster(counter);
  yield;

  // Biển hiệu Chú Lộc
  const keeperNameTexture = new DynamicTexture('casino-keeper-name', { width: 1024, height: 224 }, scene, true);
  const knCtx = keeperNameTexture.getContext();
  knCtx.fillStyle = '#356d78';
  knCtx.fillRect(0, 0, 1024, 224);
  knCtx.fillStyle = '#fff8e7';
  knCtx.strokeStyle = '#ffe29a';
  knCtx.lineWidth = 12;
  knCtx.strokeRect(10, 10, 1004, 204);
  knCtx.font = 'bold 64px "Baloo 2", Arial, sans-serif';
  knCtx.textAlign = 'center';
  knCtx.textBaseline = 'middle';
  knCtx.fillText('CHÚ LỘC · GAME HOST', 512, 112);
  keeperNameTexture.update();

  const knMat = new StandardMaterial('casino-keeper-mat', scene);
  knMat.diffuseTexture = keeperNameTexture;
  knMat.emissiveColor = Color3.FromHexString('#7ee8dc').scale(0.2);

  const keeperSign = MeshBuilder.CreatePlane('casino-keeper-sign', { width: 6.8, height: 1.5 }, scene);
  keeperSign.position.set(x, y + 4.2, z + 12.0);
  keeperSign.material = knMat;
  yield;

  const backFeature = MeshBuilder.CreateBox('casino-back-feature-panel', { width: 22.0, height: 2.25, depth: 0.16 }, scene);
  backFeature.position.set(x, y + 5.8, z + 12.14);
  backFeature.material = matWallAccent;
  backFeature.isPickable = false;
  createTextSign(scene, 'casino-hub-sign', 'GAME LOUNGE', null, new Vector3(x, y + 5.8, z + 12.0), {
    width: 5.6,
    height: 0.9,
    background: '#356d78',
    border: '#ffe29a',
    color: '#fff8e7',
    emissive: '#7ee8dc',
  });
  yield;

  // =========================================================================
  // 3. BỐN KHU BÀN CHƠI 3D THỰC THỤ TRONG PHÒNG CASINO
  // =========================================================================

  // Helper tạo ghế ngồi 3D Play Together
  const createChair = (name, cx, cz, angleY) => {
    const chairRoot = new TransformNode(name, scene);
    chairRoot.position.set(cx, y, cz);
    chairRoot.rotation.y = angleY;

    // Chân kim loại
    const leg = MeshBuilder.CreateCylinder(`${name}-leg`, { diameterTop: 0.2, diameterBottom: 0.65, height: 0.95, tessellation: 16 }, scene);
    leg.position.y = 0.5;
    leg.material = matDarkOak;
    leg.parent = chairRoot;

    // Đệm ngồi da đỏ
    const seat = MeshBuilder.CreateCylinder(`${name}-seat`, { diameter: 0.85, height: 0.18 }, scene);
    seat.position.y = 1.05;
    seat.material = matLeather;
    seat.parent = chairRoot;

    // Tựa lưng
    const back = MeshBuilder.CreateSphere(`${name}-back`, { diameter: 1, segments: 12 }, scene);
    back.scaling.set(0.8, 0.7, 0.22);
    back.position.set(0, 1.45, -0.38);
    back.material = matLeather;
    back.parent = chairRoot;

    return chairRoot;
  };

  // -------------------------------------------------------------------------
  // BÀN 1: XÚC XẮC VUI SIC BO 3D (Tây Nam: x - 6.5, z - 3.5)
  // -------------------------------------------------------------------------
  const txTableRoot = new TransformNode('casino-table-3d-tai-xiu', scene);
  txTableRoot.position.set(x - 6.5, y, z - 3.5);
  txTableRoot.metadata = { casinoTable: 'tai-xiu', label: 'Bàn Xúc Xắc Vui' };
  createFloorPod(scene, txTableRoot, 'casino-pod-tai-xiu', matPodCoral, 6.8);

  // Khối bàn nỉ đỏ bán nguyệt
  const txTableMesh = MeshBuilder.CreateCylinder('table-mesh-tx', { diameter: 5.2, height: 1.35, tessellation: 24 }, scene);
  txTableMesh.position.y = 0.68;
  txTableMesh.material = matDarkOak;
  txTableMesh.parent = txTableRoot;
  txTableMesh.metadata = { casinoTable: 'tai-xiu', label: 'Bàn Xúc Xắc Vui' };
  shadows?.addShadowCaster(txTableMesh);
  const txTrim = MeshBuilder.CreateTorus('table-trim-tx', { diameter: 4.9, thickness: 0.1, tessellation: 24 }, scene);
  txTrim.position.y = 1.38;
  txTrim.material = matGoldTrim;
  txTrim.parent = txTableRoot;
  createGameSurface(scene, txTableRoot, 'tai-xiu', 3.55, 3.1, '#9b5063');
  yield;

  // Đĩa vàng & Bát 3D trên bàn
  const txDish = MeshBuilder.CreateCylinder('tx-3d-dish', { diameter: 1.4, height: 0.08, tessellation: 24 }, scene);
  txDish.position.set(0, 1.38, 0);
  txDish.material = matPlateGold;
  txDish.parent = txTableRoot;

  const txBowl = MeshBuilder.CreateSphere('tx-3d-bowl', { diameter: 1.2, segments: 20 }, scene);
  txBowl.scaling.y = 0.65;
  txBowl.position.set(0, 1.42, 0);
  txBowl.rotation.x = Math.PI;
  txBowl.material = makeMat(scene, 'casino-int-ceramic-bowl', '#e8dfcd', null, 0.12, 32);
  txBowl.parent = txTableRoot;
  txBowl.metadata = { spatialBoundsMutable: true };

  // Biển hiệu 3D nổi trên bàn
  createTextSign(scene, 'tx-3d-sign-label', 'XÚC XẮC VUI', txTableRoot, new Vector3(0, 2.6, 0), {
    width: 2.5,
    height: 0.68,
    background: '#d95d6c',
    border: '#ffe29a',
    color: '#fff8e7',
    emissive: '#ff9b8f',
  });

  // Ghế ngồi xung quanh bàn Xúc Xắc Vui
  [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].forEach((ang, i) => {
    createChair(`tx-chair-${i}`, x - 6.5 + Math.cos(ang) * 3.4, z - 3.5 + Math.sin(ang) * 3.4, ang + Math.PI / 2);
  });
  yield;

  // -------------------------------------------------------------------------
  // BÀN 2: VƯỜN LINH VẬT TÔM CÁ 3D (Đông Nam: x + 6.5, z - 3.5)
  // -------------------------------------------------------------------------
  const bcTableRoot = new TransformNode('casino-table-3d-bau-cua', scene);
  bcTableRoot.position.set(x + 6.5, y, z - 3.5);
  bcTableRoot.metadata = { casinoTable: 'bau-cua', label: 'Bàn Vườn Linh Vật' };
  createFloorPod(scene, bcTableRoot, 'casino-pod-bau-cua', matPodMint, 6.8);

  const bcTableMesh = MeshBuilder.CreateBox('table-mesh-bc', { width: 4.8, height: 1.35, depth: 3.6 }, scene);
  bcTableMesh.position.y = 0.68;
  bcTableMesh.material = matDarkOak;
  bcTableMesh.parent = bcTableRoot;
  bcTableMesh.metadata = { casinoTable: 'bau-cua', label: 'Bàn Vườn Linh Vật' };
  shadows?.addShadowCaster(bcTableMesh);
  const bcTrim = MeshBuilder.CreateBox('table-trim-bc', { width: 4.45, height: 0.1, depth: 3.25 }, scene);
  bcTrim.position.y = 1.38;
  bcTrim.material = matGreenFelt;
  bcTrim.parent = bcTableRoot;
  createGameSurface(scene, bcTableRoot, 'bau-cua', 4.2, 3.05, '#367968').position.y = 1.44;
  yield;

  // Đĩa gỗ Vườn Linh Vật trên bàn
  const bcDish = MeshBuilder.CreateCylinder('bc-3d-dish', { diameter: 1.5, height: 0.1, tessellation: 20 }, scene);
  bcDish.position.set(0, 1.4, 0);
  bcDish.material = matDarkOak;
  bcDish.parent = bcTableRoot;

  createTextSign(scene, 'bc-3d-sign-label', 'VƯỜN LINH VẬT', bcTableRoot, new Vector3(0, 2.6, 0), {
    width: 2.5,
    height: 0.68,
    background: '#4cae86',
    border: '#eaffd0',
    color: '#fff8e7',
    emissive: '#7ee8dc',
  });

  [-1.8, 0, 1.8].forEach((ox, i) => {
    createChair(`bc-chair-top-${i}`, x + 6.5 + ox, z - 3.5 - 2.5, 0);
    createChair(`bc-chair-bot-${i}`, x + 6.5 + ox, z - 3.5 + 2.5, Math.PI);
  });
  yield;

  // -------------------------------------------------------------------------
  // BÀN 3: BỘ BA KỲ DIỆU 3 LÁ (Tây Bắc: x - 6.5, z + 4.5)
  // -------------------------------------------------------------------------
  const caTableRoot = new TransformNode('casino-table-3d-bai-cao', scene);
  caTableRoot.position.set(x - 6.5, y, z + 4.5);
  caTableRoot.metadata = { casinoTable: 'bai-cao', label: 'Bàn Bộ Ba Kỳ Diệu' };
  createFloorPod(scene, caTableRoot, 'casino-pod-bai-cao', matPodSky, 6.0);

  const caTableMesh = MeshBuilder.CreateCylinder('table-mesh-ca', { diameter: 4.6, height: 1.35, tessellation: 24 }, scene);
  caTableMesh.position.y = 0.68;
  caTableMesh.material = matDarkOak;
  caTableMesh.parent = caTableRoot;
  caTableMesh.metadata = { casinoTable: 'bai-cao', label: 'Bàn Bộ Ba Kỳ Diệu' };
  shadows?.addShadowCaster(caTableMesh);
  const caTrim = MeshBuilder.CreateTorus('table-trim-ca', { diameter: 4.3, thickness: 0.1, tessellation: 24 }, scene);
  caTrim.position.y = 1.38;
  caTrim.material = matGoldTrim;
  caTrim.parent = caTableRoot;
  createGameSurface(scene, caTableRoot, 'bai-cao', 3.1, 2.9, '#466d8f');
  yield;

  createTextSign(scene, 'ca-3d-sign-label', 'BỘ BA KỲ DIỆU', caTableRoot, new Vector3(0, 2.6, 0), {
    width: 2.5,
    height: 0.68,
    background: '#4a91c2',
    border: '#e0f5ff',
    color: '#fff8e7',
    emissive: '#75b9df',
  });

  [0, (Math.PI * 2) / 5, (Math.PI * 4) / 5, (Math.PI * 6) / 5, (Math.PI * 8) / 5].forEach((ang, i) => {
    createChair(`ca-chair-${i}`, x - 6.5 + Math.cos(ang) * 3.0, z + 4.5 + Math.sin(ang) * 3.0, ang + Math.PI / 2);
  });
  yield;

  // -------------------------------------------------------------------------
  // The fourth corner is a social lounge while Tien Len is hidden.
  // -------------------------------------------------------------------------
  const loungeRoot = new TransformNode('casino-social-lounge', scene);
  loungeRoot.position.set(x + 6.5, y, z + 4.5);
  createFloorPod(scene, loungeRoot, 'casino-social-pod', matPodLilac, 5.8);
  const coffeeTable=MeshBuilder.CreateCylinder('casino-coffee-table',{diameter:1.6,height:.6,tessellation:16},scene);
  coffeeTable.position.y=.3;coffeeTable.material=matDarkOak;coffeeTable.parent=loungeRoot;
  createTextSign(scene,'casino-social-sign','GÓC GIAO LƯU',loungeRoot,new Vector3(0,2.6,0),{
    width:2.8,height:.68,background:'#71628e',border:'#f0e7ff',color:'#fff8e7',emissive:'#d1b7ff',
  });
  [0,Math.PI/2,Math.PI,Math.PI*1.5].forEach((angle,i)=>{
    createChair(`lounge-chair-${i}`,x+6.5+Math.cos(angle)*2,z+4.5+Math.sin(angle)*2,angle+Math.PI/2);
  });
  yield;
}
