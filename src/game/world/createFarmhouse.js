import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { spawnVillageHouse, MODEL_PATHS, spawnModelSync } from '../rendering/ModelAssetManager.js';
import { createToyMaterial } from '../rendering/PlayTogetherTheme.js';

function createSmokeTexture(scene) {
  const dt = new DynamicTexture('farmhouse-smoke-tex', 64, scene, false);
  const ctx = dt.getContext();
  ctx.clearRect(0, 0, 64, 64);
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(0.5, 'rgba(235, 240, 245, 0.45)');
  grad.addColorStop(1, 'rgba(220, 230, 240, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  ctx.fill();
  dt.update();
  return dt;
}

/**
 * Nhà Nông Trại Cấp 1 3D: Ngôi Nhà Đồng Quê Ghibli Độc Lập 100% (Cozy Country Cottage)
 * Tự dựng trực tiếp bằng Babylon hình học chi tiết cao, màu sắc ấm áp, không phụ thuộc file ngoài.
 */
export function createStarterFarmhouse(scene, shadowGenerator, position) {
  const root = new TransformNode('starter-farmhouse-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.metadata = { type: 'player-home', tier: 1, homeId: 'starter-cabin' };

  // 1. Materials phong cách Ghibli ấm áp
  const mats = {
    stoneBase: createToyMaterial(scene, 'mat-cottage-stone-base', '#78716c', { specularPower: 20, ambientScale: 0.55 }),
    wallPlaster: createToyMaterial(scene, 'mat-cottage-wall-plaster', '#fefce8', { specularPower: 16, ambientScale: 0.65 }),
    timberDark: createToyMaterial(scene, 'mat-cottage-timber-dark', '#78350f', { specularPower: 32, ambientScale: 0.5 }),
    timberWarm: createToyMaterial(scene, 'mat-cottage-timber-warm', '#92400e', { specularPower: 28, ambientScale: 0.55 }),
    roofTile: createToyMaterial(scene, 'mat-cottage-roof-tile', '#c2410c', { specularPower: 36, specularLevel: 0.25, ambientScale: 0.55 }),
    roofRidge: createToyMaterial(scene, 'mat-cottage-roof-ridge', '#9a3412', { specularPower: 40, ambientScale: 0.5 }),
    doorWood: createToyMaterial(scene, 'mat-cottage-door-wood', '#57300a', { specularPower: 45, specularLevel: 0.3, ambientScale: 0.5 }),
    windowGlow: createToyMaterial(scene, 'mat-cottage-window-glow', '#fef08a', { emissiveHex: '#fbbf24', specularPower: 96, specularLevel: 0.8 }),
    shutterBlue: createToyMaterial(scene, 'mat-cottage-shutter-blue', '#38bdf8', { specularPower: 32, ambientScale: 0.6 }),
    flowerPink: createToyMaterial(scene, 'mat-cottage-fl-pink', '#f43f5e', { emissiveHex: '#fb7185' }),
    flowerYellow: createToyMaterial(scene, 'mat-cottage-fl-yellow', '#fde047', { emissiveHex: '#facc15' }),
    leafGreen: createToyMaterial(scene, 'mat-cottage-leaf-green', '#22c55e', { ambientScale: 0.55 }),
    lanternAmber: createToyMaterial(scene, 'mat-cottage-lantern-glow', '#fef3c7', { emissiveHex: '#f59e0b', specularPower: 96 }),
    barrelWood: createToyMaterial(scene, 'mat-cottage-barrel-wood', '#854d0e', { specularPower: 24, ambientScale: 0.5 }),
  };

  const houseW = 5.2;
  const houseD = 4.4;
  const wallH = 2.8;

  // 2. Móng đá cuội kiên cố (Stone Plinth Foundation)
  const foundation = MeshBuilder.CreateBox('cottage-foundation', { width: houseW + 0.3, depth: houseD + 0.3, height: 0.36 }, scene);
  foundation.position.set(0, 0.18, 0);
  foundation.material = mats.stoneBase;
  foundation.parent = root;
  foundation.receiveShadows = true;

  // 3. Khối tường nhà chính vôi trắng kem (Whitewashed Plaster Body)
  const walls = MeshBuilder.CreateBox('cottage-walls', { width: houseW, depth: houseD, height: wallH }, scene);
  walls.position.set(0, wallH / 2 + 0.36, 0);
  walls.material = mats.wallPlaster;
  walls.parent = root;
  walls.receiveShadows = true;
  shadowGenerator?.addShadowCaster(walls);

  // 4. Hệ dầm gỗ sồi ốp tường phong cách Ghibli (Half-Timbered Beams)
  const beamThick = 0.14;
  const beamY = wallH / 2 + 0.36;

  // 4 Cột gỗ đứng ở 4 góc nhà
  [
    [-houseW / 2, -houseD / 2],
    [houseW / 2, -houseD / 2],
    [-houseW / 2, houseD / 2],
    [houseW / 2, houseD / 2],
  ].forEach(([cx, cz], idx) => {
    const col = MeshBuilder.CreateBox(`cottage-col-${idx}`, { width: beamThick * 1.5, depth: beamThick * 1.5, height: wallH }, scene);
    col.position.set(cx, beamY, cz);
    col.material = mats.timberDark;
    col.parent = root;
    shadowGenerator?.addShadowCaster(col);
  });

  // Dầm gỗ ngang tầng giữa & chân mái
  [-houseD / 2, houseD / 2].forEach((cz, idx) => {
    const beamMid = MeshBuilder.CreateBox(`cottage-beam-mid-${idx}`, { width: houseW, depth: beamThick, height: beamThick }, scene);
    beamMid.position.set(0, wallH * 0.55 + 0.36, cz);
    beamMid.material = mats.timberDark;
    beamMid.parent = root;

    const beamTop = MeshBuilder.CreateBox(`cottage-beam-top-${idx}`, { width: houseW, depth: beamThick, height: beamThick }, scene);
    beamTop.position.set(0, wallH + 0.36, cz);
    beamTop.material = mats.timberDark;
    beamTop.parent = root;
  });

  // 5. Mái dốc chữ A đôi lớp ngói nung đỏ cam (Steep Terracotta Gable Roof)
  const roofW = houseW + 0.8;
  const roofD = houseD + 0.8;
  const roofH = 2.2;
  const roofBaseY = wallH + 0.36;

  // Mái chữ A tạo bằng lăng trụ tam giác vát dốc
  const roofL = MeshBuilder.CreateBox('cottage-roof-slope-l', { width: roofW / 2 + 0.4, depth: roofD, height: 0.18 }, scene);
  roofL.position.set(-roofW * 0.25, roofBaseY + roofH * 0.46, 0);
  roofL.rotation.z = 0.65; // Dốc về bên trái
  roofL.material = mats.roofTile;
  roofL.parent = root;
  shadowGenerator?.addShadowCaster(roofL);

  const roofR = MeshBuilder.CreateBox('cottage-roof-slope-r', { width: roofW / 2 + 0.4, depth: roofD, height: 0.18 }, scene);
  roofR.position.set(roofW * 0.25, roofBaseY + roofH * 0.46, 0);
  roofR.rotation.z = -0.65; // Dốc về bên phải
  roofR.material = mats.roofTile;
  roofR.parent = root;
  shadowGenerator?.addShadowCaster(roofR);

  // Đỉnh bờ nóc mái (Roof Ridge Beam)
  const ridgeBeam = MeshBuilder.CreateBox('cottage-roof-ridge', { width: 0.26, depth: roofD + 0.1, height: 0.26 }, scene);
  ridgeBeam.position.set(0, roofBaseY + roofH - 0.05, 0);
  ridgeBeam.material = mats.roofRidge;
  ridgeBeam.parent = root;

  // Đầu hồi mái trước & sau hình tam giác (Gable End Walls)
  [-houseD / 2 + 0.05, houseD / 2 - 0.05].forEach((cz, idx) => {
    const gable = MeshBuilder.CreateCylinder(`cottage-gable-${idx}`, {
      height: 0.12,
      diameter: houseW * 0.98,
      tessellation: 3,
    }, scene);
    gable.rotation.z = Math.PI / 2;
    gable.rotation.x = Math.PI / 2;
    gable.position.set(0, roofBaseY + roofH * 0.38, cz);
    gable.material = mats.wallPlaster;
    gable.parent = root;
  });

  // 6. Cửa sổ áp mái tam giác (Cute Dormer Window)
  const dormerRoot = new TransformNode('cottage-dormer', scene);
  dormerRoot.position.set(0, roofBaseY + 0.7, -houseD * 0.28);
  dormerRoot.parent = root;

  const dormerBody = MeshBuilder.CreateBox('dormer-body', { width: 1.2, depth: 1.1, height: 0.9 }, scene);
  dormerBody.position.set(0, 0.45, 0);
  dormerBody.material = mats.wallPlaster;
  dormerBody.parent = dormerRoot;

  const dormerRoof = MeshBuilder.CreateBox('dormer-roof', { width: 1.4, depth: 1.3, height: 0.12 }, scene);
  dormerRoof.position.set(0, 0.95, 0);
  dormerRoof.rotation.x = 0.35;
  dormerRoof.material = mats.roofRidge;
  dormerRoof.parent = dormerRoot;

  const dormerPane = MeshBuilder.CreateBox('dormer-pane', { width: 0.65, depth: 0.08, height: 0.55 }, scene);
  dormerPane.position.set(0, 0.48, -0.56);
  dormerPane.material = mats.windowGlow;
  dormerPane.parent = dormerRoot;

  // 7. Hiên đón gỗ có bậc thềm (Charming Front Porch)
  const porchW = 3.6;
  const porchD = 1.7;
  const porchH = 0.26;
  const porchY = 0.13;
  const porchZ = -houseD / 2 - porchD / 2;

  const porchDeck = MeshBuilder.CreateBox('cottage-porch-deck', { width: porchW, depth: porchD, height: porchH }, scene);
  porchDeck.position.set(0, porchY, porchZ);
  porchDeck.material = mats.timberWarm;
  porchDeck.parent = root;
  porchDeck.receiveShadows = true;

  // Bậc tam cấp bước xuống sân
  [-0.6, -1.1].forEach((offZ, idx) => {
    const step = MeshBuilder.CreateBox(`cottage-porch-step-${idx}`, { width: 2.0 - idx * 0.25, depth: 0.55, height: 0.1 }, scene);
    step.position.set(0, 0.05 + (1 - idx) * 0.08, porchZ - porchD / 2 + offZ);
    step.material = mats.timberWarm;
    step.parent = root;
  });

  // 2 Cột gỗ tròn đỡ mái hiên
  [-porchW / 2 + 0.2, porchW / 2 - 0.2].forEach((px, idx) => {
    const pillar = MeshBuilder.CreateCylinder(`porch-pillar-${idx}`, {
      height: 2.3,
      diameter: 0.18,
      tessellation: 12,
    }, scene);
    pillar.position.set(px, 1.15 + porchH, porchZ - porchD / 2 + 0.2);
    pillar.material = mats.timberDark;
    pillar.parent = root;
    shadowGenerator?.addShadowCaster(pillar);
  });

  // Mái che hiên đón (Porch Canopy)
  const porchRoof = MeshBuilder.CreateBox('cottage-porch-roof', { width: porchW + 0.3, depth: porchD + 0.4, height: 0.12 }, scene);
  porchRoof.position.set(0, 2.3 + porchH, porchZ);
  porchRoof.rotation.x = -0.15; // Dốc nhẹ ra trước
  porchRoof.material = mats.roofTile;
  porchRoof.parent = root;
  shadowGenerator?.addShadowCaster(porchRoof);

  // Đèn lồng sắt uốn treo hiên nhà tỏa ánh vàng ấm
  const porchLantern = MeshBuilder.CreateSphere('cottage-porch-lantern', { diameter: 0.32, segments: 10 }, scene);
  porchLantern.position.set(1.4, 2.1, porchZ);
  porchLantern.material = mats.lanternAmber;
  porchLantern.parent = root;

  // 8. Cửa chính bằng gỗ vòm (Rustic Arched Front Door)
  const doorW = 1.3;
  const doorH = 2.1;
  const doorZ = -houseD / 2 - 0.02;

  const door = MeshBuilder.CreateBox('cottage-door', { width: doorW, depth: 0.12, height: doorH }, scene);
  door.position.set(0, doorH / 2 + 0.36, doorZ);
  door.material = mats.doorWood;
  door.parent = root;

  // Khung viền cửa
  const doorFrame = MeshBuilder.CreateBox('cottage-door-frame', { width: doorW + 0.2, depth: 0.14, height: doorH + 0.1 }, scene);
  doorFrame.position.set(0, doorH / 2 + 0.38, doorZ - 0.01);
  doorFrame.material = mats.timberDark;
  doorFrame.parent = root;

  // 9. Hai Cửa Sổ Mặt Tiền Kính Caro & Bồn Hoa Rực Rỡ
  [-1.75, 1.75].forEach((wx, idx) => {
    // Kính cửa sổ phát sáng vàng ấm cúng
    const winPane = MeshBuilder.CreateBox(`cottage-win-${idx}`, { width: 1.0, depth: 0.06, height: 1.15 }, scene);
    winPane.position.set(wx, 1.6, doorZ);
    winPane.material = mats.windowGlow;
    winPane.parent = root;

    // Cánh chớp cửa sổ màu xanh pastel
    [-0.58, 0.58].forEach((sx, sidx) => {
      const shutter = MeshBuilder.CreateBox(`cottage-shutter-${idx}-${sidx}`, { width: 0.24, depth: 0.08, height: 1.15 }, scene);
      shutter.position.set(wx + sx, 1.6, doorZ - 0.03);
      shutter.material = mats.shutterBlue;
      shutter.parent = root;
    });

    // Bồn hoa gỗ dưới bậu cửa sổ
    const flowerBox = MeshBuilder.CreateBox(`cottage-flbox-${idx}`, { width: 1.15, depth: 0.36, height: 0.28 }, scene);
    flowerBox.position.set(wx, 0.92, doorZ - 0.18);
    flowerBox.material = mats.timberWarm;
    flowerBox.parent = root;

    // Cụm hoa nở rộ sặc sỡ
    const flClusters = [
      { col: mats.flowerPink, x: -0.3 },
      { col: mats.flowerYellow, x: 0.0 },
      { col: mats.flowerPink, x: 0.3 },
    ];
    flClusters.forEach((fc, fidx) => {
      const flSphere = MeshBuilder.CreateSphere(`cottage-fl-${idx}-${fidx}`, { diameter: 0.32, segments: 8 }, scene);
      flSphere.position.set(wx + fc.x, 1.12, doorZ - 0.18);
      flSphere.material = fc.col;
      flSphere.parent = root;
    });
  });

  // 10. Ống Khói Đá & Khói Lam Chiều Ấm Áp (Stone Chimney & Smoke)
  const chimneyW = 0.95;
  const chimneyD = 0.95;
  const chimneyH = 4.8;
  const chimneyX = houseW / 2 - 0.3;
  const chimneyZ = 0.8;

  const chimney = MeshBuilder.CreateBox('cottage-chimney', { width: chimneyW, depth: chimneyD, height: chimneyH }, scene);
  chimney.position.set(chimneyX, chimneyH / 2 + 0.36, chimneyZ);
  chimney.material = mats.stoneBase;
  chimney.parent = root;
  shadowGenerator?.addShadowCaster(chimney);

  const chimneyPot = MeshBuilder.CreateCylinder('cottage-chimney-pot', { height: 0.5, diameter: 0.45, tessellation: 12 }, scene);
  chimneyPot.position.set(chimneyX, chimneyH + 0.5, chimneyZ);
  chimneyPot.material = mats.roofRidge;
  chimneyPot.parent = root;

  // Hiệu ứng khói bếp chiều bốc lên nhẹ nhàng
  const smokeEmitter = new TransformNode('starter-smoke-emitter', scene);
  smokeEmitter.position.set(chimneyX, chimneyH + 0.75, chimneyZ);
  smokeEmitter.parent = root;

  const smokeSystem = new ParticleSystem('starter-smoke', 40, scene);
  smokeSystem.particleTexture = createSmokeTexture(scene);
  smokeSystem.emitter = smokeEmitter;
  smokeSystem.minEmitBox = new Vector3(-0.12, 0, -0.12);
  smokeSystem.maxEmitBox = new Vector3(0.12, 0.2, 0.12);
  smokeSystem.color1 = new Color4(0.96, 0.96, 0.94, 0.65);
  smokeSystem.color2 = new Color4(0.88, 0.88, 0.85, 0.35);
  smokeSystem.colorDead = new Color4(0.8, 0.85, 0.8, 0.0);
  smokeSystem.minSize = 0.6;
  smokeSystem.maxSize = 1.9;
  smokeSystem.minLifeTime = 2.2;
  smokeSystem.maxLifeTime = 3.8;
  smokeSystem.emitRate = 3.5;
  smokeSystem.direction1 = new Vector3(-0.2, 2.0, 0.15);
  smokeSystem.direction2 = new Vector3(0.2, 2.8, 0.45);
  smokeSystem.start();

  // 11. Đống Củi Xẻ & Thùng Nước Mưa Đồng Quê
  // Củi xẻ xếp bên sườn nhà
  [-0.4, -0.1, 0.2].forEach((cz, lidx) => {
    const log = MeshBuilder.CreateCylinder(`cottage-firewood-${lidx}`, { height: 1.1, diameter: 0.24, tessellation: 8 }, scene);
    log.position.set(-houseW / 2 - 0.35, 0.14, cz);
    log.rotation.x = Math.PI / 2;
    log.material = mats.timberWarm;
    log.parent = root;
  });
  [-0.25, 0.05].forEach((cz, lidx) => {
    const logTop = MeshBuilder.CreateCylinder(`cottage-firewood-top-${lidx}`, { height: 1.0, diameter: 0.22, tessellation: 8 }, scene);
    logTop.position.set(-houseW / 2 - 0.34, 0.32, cz);
    logTop.rotation.x = Math.PI / 2;
    logTop.material = mats.timberWarm;
    logTop.parent = root;
  });

  // Thùng gỗ hứng nước mưa (Rainwater Barrel)
  const rainBarrel = MeshBuilder.CreateCylinder('cottage-rain-barrel', { height: 1.1, diameterTop: 0.72, diameterBottom: 0.62, tessellation: 12 }, scene);
  rainBarrel.position.set(-houseW / 2 - 0.4, 0.55, -houseD / 2 + 0.6);
  rainBarrel.material = mats.barrelWood;
  rainBarrel.parent = root;
  shadowGenerator?.addShadowCaster(rainBarrel);

  return {
    root,
    smokeSystem,
    dispose() {
      smokeSystem.dispose();
      root.dispose(false, false);
    },
  };
}

/**
 * Biệt Thự Nông Trại Cấp 2 3D: Dinh Thự Điền Trang Châu Âu (Charming Farm Manor)
 */
export function createUpgradedFarmhouse(scene, shadowGenerator, position) {
  const root = new TransformNode('upgraded-farmhouse-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.metadata = { type: 'player-home', tier: 2, homeId: 'country-manor' };

  // Nạp mô hình nhà 3D Dinh thự lớn 2 gian
  const manorModel = spawnVillageHouse(scene, 4, {
    position: new Vector3(0, 0, 0),
    scaling: new Vector3(4.8, 4.8, 4.8),
    rotation: new Vector3(0, Math.PI, 0),
    shadows: shadowGenerator,
    name: 'manor-house-3d',
    parent: root,
  });
  manorModel.parent = root;

  // Hai đèn lồng hai bên cổng vào
  [-2.2, 2.2].forEach((offset, idx) => {
    const lantern = spawnModelSync(scene, MODEL_PATHS.town.lantern, {
      position: new Vector3(offset, 0, 3.6),
      scaling: new Vector3(1.3, 1.3, 1.3),
      shadows: shadowGenerator,
      name: `manor-lantern-3d-${idx}`,
      parent: root,
    });
    lantern.parent = root;
  });

  // Xe kéo nông sản bằng gỗ trước sân
  const cart = spawnModelSync(scene, MODEL_PATHS.town.cart, {
    position: new Vector3(-5.2, 0, 2.5),
    rotation: new Vector3(0, Math.PI / 4, 0),
    scaling: new Vector3(1.5, 1.5, 1.5),
    shadows: shadowGenerator,
    name: 'manor-cart-3d',
    parent: root,
  });
  cart.parent = root;

  // Khói bếp bốc lên từ ống khói lớn
  const smokeEmitter = new TransformNode('manor-smoke-emitter', scene);
  smokeEmitter.position.set(2.4, 9.2, -1.2);
  smokeEmitter.parent = root;

  const smokeSystem = new ParticleSystem('manor-smoke', 50, scene);
  smokeSystem.particleTexture = createSmokeTexture(scene);
  smokeSystem.emitter = smokeEmitter;
  smokeSystem.minEmitBox = new Vector3(-0.2, 0, -0.2);
  smokeSystem.maxEmitBox = new Vector3(0.2, 0.25, 0.2);
  smokeSystem.color1 = new Color4(0.96, 0.95, 0.92, 0.7);
  smokeSystem.color2 = new Color4(0.88, 0.88, 0.85, 0.4);
  smokeSystem.colorDead = new Color4(0.8, 0.85, 0.8, 0.0);
  smokeSystem.minSize = 0.8;
  smokeSystem.maxSize = 2.4;
  smokeSystem.minLifeTime = 2.5;
  smokeSystem.maxLifeTime = 4.2;
  smokeSystem.emitRate = 4.5;
  smokeSystem.direction1 = new Vector3(-0.3, 2.4, 0.25);
  smokeSystem.direction2 = new Vector3(0.3, 3.2, 0.6);
  smokeSystem.start();

  return {
    root,
    smokeSystem,
    dispose() {
      smokeSystem.dispose();
      root.dispose(false, false);
    },
  };
}

export { createUpgradedFarmhouse as createFarmhouse };

