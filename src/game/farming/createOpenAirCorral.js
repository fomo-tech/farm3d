import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { createToyMaterial } from '../rendering/PlayTogetherTheme.js';

/**
 * Chuồng Lộ Thiên Nông Trại Chăn Nuôi 3D (Spacious Pastoral Livestock Corral)
 * Phong cách: Casual Low-Poly Chibi / Play Together / Animal Crossing
 * - Tuyệt đối không bị Z-fighting (nhấp nháy texture) nhờ hệ phân tầng độ cao chuẩn:
 *   + Nền đất viền: Top = 0.12 (cao hơn thảm cỏ nông trại 0.11)
 *   + Mặt cỏ chuồng: Top = 0.16 (cao hơn lối đi đá 0.15)
 *   + Thảm rơm & Đá bước: Top = 0.19 với zOffset = -2
 * - Không gian rộng rãi, thoáng đãng, ngập tràn ánh nắng
 * - Hàng rào gỗ sồi mật ong bo góc tròn mềm mại, cổng gỗ mở hờ thân thiện
 * - 2 đèn lồng cổ tích phát sáng ấm áp ở 2 cọc góc sau
 * - Máng nước đá & máng rơm vàng tươi gọn gàng sát vách sau
 */
export function createOpenAirCorral(scene, shadows, position = { x: 0, y: 0, z: 0 }, options = {}) {
  if (!scene?.onBeforeRenderObservable) {
    throw new TypeError('createOpenAirCorral cần Babylon Scene hợp lệ.');
  }
  const {
    farmId = 'lot',
    ownerName = 'Nông dân',
    tier = 1,
    animalType = 'cow',
    width = 6.4,
    depth = 5.6,
  } = options;

  const root = new TransformNode(`open-air-corral-${farmId}`, scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.metadata = { farmId, ownerName, type: 'farm-corral', tier };

  // 1. Materials phong cách Play Together / Chibi tươi sáng
  const mats = {
    timberPost: createToyMaterial(scene, 'mat-corral-post-chunky', '#a27a50', { specularPower: 28, ambientScale: 0.6 }),
    timberRail: createToyMaterial(scene, 'mat-corral-rail-honey', '#c39965', { specularPower: 24, ambientScale: 0.62 }),
    groundEarth: createToyMaterial(scene, 'mat-corral-earth-soft', '#937652', { specularPower: 16, ambientScale: 0.52 }),
    paddockGrass: createToyMaterial(scene, 'mat-corral-grass-lush', '#91b56d', { specularPower: 18, ambientScale: 0.72 }),
    strawBedding: createToyMaterial(scene, 'mat-corral-straw-soft', '#e3c778', { specularPower: 20, ambientScale: 0.68, zOffset: -2 }),
    troughWood: createToyMaterial(scene, 'mat-corral-trough-wood', '#57300a', { specularPower: 26, ambientScale: 0.5 }),
    feedGrain: createToyMaterial(scene, 'mat-corral-grain-rich', '#f59e0b', { specularPower: 16, ambientScale: 0.65 }),
    waterPool: createToyMaterial(scene, 'mat-corral-water-azure', '#76bfc3', {
      specularPower: 96,
      specularLevel: 0.85,
      emissiveHex: '#143638',
      ambientScale: 0.75,
      zOffset: -1,
    }),
    warmLantern: createToyMaterial(scene, 'mat-corral-lantern-amber', '#fef08a', {
      emissiveHex: '#fbbf24',
      specularPower: 96,
    }),
    lanternCap: createToyMaterial(scene, 'mat-corral-lantern-dark', '#334155', { specularPower: 48 }),
    steppingStone: createToyMaterial(scene, 'mat-corral-step-stone', '#e2e8f0', { specularPower: 20, ambientScale: 0.65, zOffset: -2 }),

    // Pet materials (cho decorative pet nếu bật)
    cowBody: createToyMaterial(scene, 'mat-cow-body-cream', '#fffdf2', { specularPower: 38, ambientScale: 0.7 }),
    cowSpot: createToyMaterial(scene, 'mat-cow-spot-caramel', '#937652', { specularPower: 32, ambientScale: 0.55 }),
    cowNose: createToyMaterial(scene, 'mat-cow-nose-pink', '#fbcfe8', { emissiveHex: '#f472b6', specularPower: 45 }),
    cowHorn: createToyMaterial(scene, 'mat-cow-horn-ivory', '#fef3c7', { specularPower: 50, ambientScale: 0.6 }),
    cowBell: createToyMaterial(scene, 'mat-cow-bell-gold', '#facc15', { emissiveHex: '#eab308', specularPower: 96 }),
    cowEye: createToyMaterial(scene, 'mat-cow-eye-dark', '#1e293b', { specularPower: 96 }),
  };

  const halfW = width / 2;
  const halfD = depth / 2;

  // 2. Nền chuồng thoáng đãng (Spacious Pastoral Ground) - Triệt tiêu 100% Z-Fighting
  // Lớp viền đất ấm áp bên dưới (Top = 0.12, cao hơn thảm cỏ nông trại 0.11)
  const earthTrim = MeshBuilder.CreateBox(`corral-earth-trim-${farmId}`, {
    width: width + 0.15,
    depth: depth + 0.15,
    height: 0.08,
  }, scene);
  earthTrim.position.set(0, 0.08, 0);
  earthTrim.material = mats.groundEarth;
  earthTrim.receiveShadows = true;
  earthTrim.parent = root;

  // Lớp cỏ xanh mướt bên trong (Top = 0.16, cao hơn lối đi đá 0.15)
  const paddockLawn = MeshBuilder.CreateBox(`corral-lawn-${farmId}`, {
    width: width - 0.2,
    depth: depth - 0.2,
    height: 0.08,
  }, scene);
  paddockLawn.position.set(0, 0.12, 0);
  paddockLawn.material = mats.paddockGrass;
  paddockLawn.receiveShadows = true;
  paddockLawn.parent = root;

  // Mặt sàn chuẩn của chuồng
  const floorLevel = 0.16;

  // Đệm rơm nghỉ ngơi bo tròn dịu nhẹ góc sau phải (nằm nổi hẳn trên mặt cỏ 0.16)
  const strawPad = MeshBuilder.CreateCylinder(`corral-straw-pad-${farmId}`, {
    diameter: 2.1,
    height: 0.025,
    tessellation: 18,
  }, scene);
  strawPad.position.set(halfW - 1.5, floorLevel + 0.015, halfD - 1.4);
  strawPad.material = mats.strawBedding;
  strawPad.receiveShadows = false; // Tắt shadow để không bị shadow acne
  strawPad.parent = root;

  // Đá cuội bước chân dẫn lối từ cổng gỗ vào trong chuồng (nổi trên mặt cỏ 0.16)
  [
    { x: -0.15, z: -halfD + 0.35, d: 0.44 },
    { x: 0.15, z: -halfD + 0.85, d: 0.48 },
    { x: -0.05, z: -halfD + 1.35, d: 0.42 },
  ].forEach((step, idx) => {
    const pebble = MeshBuilder.CreateCylinder(`corral-pebble-${idx}-${farmId}`, {
      diameter: step.d,
      height: 0.03,
      tessellation: 12,
    }, scene);
    pebble.position.set(step.x, floorLevel + 0.016, step.z);
    pebble.material = mats.steppingStone;
    pebble.receiveShadows = false;
    pebble.parent = root;
  });

  // 3. Hệ thống Cọc rào gỗ tròn mộc & Thanh ray đôi (Charming Rustic Fence)
  const fenceHeight = 1.1;
  const postRadius = 0.085;
  const railRadius = 0.042;

  function createPost(name, px, pz, hasLantern = false) {
    const post = MeshBuilder.CreateCylinder(`corral-post-${name}`, {
      height: fenceHeight,
      diameter: postRadius * 2,
      tessellation: 12,
    }, scene);
    post.position.set(px, fenceHeight / 2 + floorLevel, pz);
    post.material = mats.timberPost;
    post.parent = root;

    // Chóp cọc tròn vo mềm mại phong cách Chibi
    const cap = MeshBuilder.CreateSphere(`corral-cap-${name}`, {
      diameter: postRadius * 2.2,
      segments: 8,
    }, scene);
    cap.position.set(px, fenceHeight + floorLevel, pz);
    cap.material = mats.timberPost;
    cap.parent = root;

    shadows?.addShadowCaster(post);

    // Đèn lồng cổ tích treo trên 2 cọc góc sau
    if (hasLantern) {
      const lanternRoot = new TransformNode(`lantern-${name}`, scene);
      lanternRoot.position.set(px, fenceHeight + floorLevel + 0.06, pz);
      lanternRoot.parent = root;

      // Quai treo sắt
      const bracket = MeshBuilder.CreateTorus(`lantern-bracket-${name}`, {
        diameter: 0.16,
        thickness: 0.03,
        tessellation: 10,
      }, scene);
      bracket.position.set(0, 0.12, 0);
      bracket.material = mats.lanternCap;
      bracket.parent = lanternRoot;

      // Nắp chụp đèn lồng
      const capMesh = MeshBuilder.CreateCylinder(`lantern-cap-${name}`, {
        diameterTop: 0.08,
        diameterBottom: 0.28,
        height: 0.09,
        tessellation: 10,
      }, scene);
      capMesh.position.set(0, 0.06, 0);
      capMesh.material = mats.lanternCap;
      capMesh.parent = lanternRoot;

      // Quả cầu phát sáng ấm áp
      const bulb = MeshBuilder.CreateSphere(`lantern-bulb-${name}`, {
        diameter: 0.22,
        segments: 10,
      }, scene);
      bulb.position.set(0, -0.06, 0);
      bulb.material = mats.warmLantern;
      bulb.parent = lanternRoot;
    }

    return post;
  }

  function createRail(name, length, startPos, endPos) {
    const rail = MeshBuilder.CreateCylinder(`corral-rail-${name}`, {
      height: length,
      diameter: railRadius * 2,
      tessellation: 10,
    }, scene);

    const midX = (startPos.x + endPos.x) / 2;
    const midY = (startPos.y + endPos.y) / 2;
    const midZ = (startPos.z + endPos.z) / 2;
    rail.position.set(midX, midY, midZ);

    const dx = endPos.x - startPos.x;
    const dz = endPos.z - startPos.z;
    if (Math.abs(dx) > Math.abs(dz)) {
      rail.rotation.z = Math.PI / 2;
    } else {
      rail.rotation.x = Math.PI / 2;
    }

    rail.material = mats.timberRail;
    rail.parent = root;
    shadows?.addShadowCaster(rail);
    return rail;
  }

  // 4 Cọc góc (2 cọc góc sau có đèn lồng cổ tích)
  createPost('c-fl', -halfW, -halfD);
  createPost('c-fr', halfW, -halfD);
  createPost('c-bl', -halfW, halfD, true);
  createPost('c-br', halfW, halfD, true);

  // Cọc trung gian
  createPost('mid-l', -halfW, 0);
  createPost('mid-r', halfW, 0);
  createPost('mid-b1', -halfW * 0.33, halfD);
  createPost('mid-b2', halfW * 0.33, halfD);

  const railTopY = fenceHeight * 0.82 + floorLevel;
  const railBotY = fenceHeight * 0.42 + floorLevel;

  // Rào cạnh Trái (-halfW)
  createRail('left-top', depth, new Vector3(-halfW, railTopY, -halfD), new Vector3(-halfW, railTopY, halfD));
  createRail('left-bot', depth, new Vector3(-halfW, railBotY, -halfD), new Vector3(-halfW, railBotY, halfD));

  // Rào cạnh Phải (+halfW)
  createRail('right-top', depth, new Vector3(halfW, railTopY, -halfD), new Vector3(halfW, railTopY, halfD));
  createRail('right-bot', depth, new Vector3(halfW, railBotY, -halfD), new Vector3(halfW, railBotY, halfD));

  // Rào cạnh Sau (+halfD)
  createRail('back-top', width, new Vector3(-halfW, railTopY, halfD), new Vector3(halfW, railTopY, halfD));
  createRail('back-bot', width, new Vector3(-halfW, railBotY, halfD), new Vector3(halfW, railBotY, halfD));

  // Mặt trước chừa cửa rộng 1.9m để người chơi bước vào
  const gateW = 1.9;
  createPost('gate-l', -gateW / 2, -halfD);
  createPost('gate-r', gateW / 2, -halfD);

  const frontWingLeft = -gateW / 2 - (-halfW);
  if (frontWingLeft > 0.4) {
    createRail('front-l-top', frontWingLeft, new Vector3(-halfW, railTopY, -halfD), new Vector3(-gateW / 2, railTopY, -halfD));
    createRail('front-l-bot', frontWingLeft, new Vector3(-halfW, railBotY, -halfD), new Vector3(-gateW / 2, railBotY, -halfD));
  }

  const frontWingRight = halfW - gateW / 2;
  if (frontWingRight > 0.4) {
    createRail('front-r-top', frontWingRight, new Vector3(gateW / 2, railTopY, -halfD), new Vector3(halfW, railTopY, -halfD));
    createRail('front-r-bot', frontWingRight, new Vector3(gateW / 2, railBotY, -halfD), new Vector3(halfW, railBotY, -halfD));
  }

  // Cổng gỗ mộc có bản lề mở hờ -35 độ chào đón (Rustic Welcoming Swing Gate)
  const gateSwingRoot = new TransformNode(`corral-gate-swing-${farmId}`, scene);
  gateSwingRoot.position.set(-gateW / 2, floorLevel, -halfD);
  gateSwingRoot.rotation.y = -Math.PI / 2;
  gateSwingRoot.parent = root;

  const gateBarTop = MeshBuilder.CreateCylinder('gate-bar-top', { height: gateW * 0.95, diameter: railRadius * 2 }, scene);
  gateBarTop.position.set(gateW * 0.48, fenceHeight * 0.78, 0);
  gateBarTop.rotation.z = Math.PI / 2;
  gateBarTop.material = mats.timberRail;
  gateBarTop.parent = gateSwingRoot;

  const gateBarBot = MeshBuilder.CreateCylinder('gate-bar-bot', { height: gateW * 0.95, diameter: railRadius * 2 }, scene);
  gateBarBot.position.set(gateW * 0.48, fenceHeight * 0.38, 0);
  gateBarBot.rotation.z = Math.PI / 2;
  gateBarBot.material = mats.timberRail;
  gateBarBot.parent = gateSwingRoot;

  const gateBrace = MeshBuilder.CreateBox('gate-brace', { width: 0.08, height: fenceHeight * 0.88, depth: 0.06 }, scene);
  gateBrace.position.set(gateW * 0.48, fenceHeight * 0.58, 0);
  gateBrace.rotation.z = -0.72;
  gateBrace.material = mats.timberPost;
  gateBrace.parent = gateSwingRoot;

  // 4. Tiện nghi tối giản & Tinh tế sát vách rào sau (KHÔNG chắn tầm nhìn, KHÔNG cản bước)
  // Máng nước đá xanh trong vắt sát hàng rào sau bên trái
  const waterTroughRoot = new TransformNode(`corral-trough-root-${farmId}`, scene);
  waterTroughRoot.position.set(-halfW + 1.4, floorLevel, halfD - 0.32);
  waterTroughRoot.parent = root;

  const waterTroughBox = MeshBuilder.CreateBox(`corral-trough-wood-${farmId}`, {
    width: 1.45,
    depth: 0.42,
    height: 0.32,
  }, scene);
  waterTroughBox.position.set(0, 0.16, 0);
  waterTroughBox.material = mats.troughWood;
  waterTroughBox.parent = waterTroughRoot;
  shadows?.addShadowCaster(waterTroughBox);

  const waterTroughSurface = MeshBuilder.CreateBox(`corral-trough-water-${farmId}`, {
    width: 1.35,
    depth: 0.34,
    height: 0.05,
  }, scene);
  waterTroughSurface.position.set(0, 0.28, 0);
  waterTroughSurface.material = mats.waterPool;
  waterTroughSurface.parent = waterTroughRoot;

  // Máng rơm tươi vàng óng sát hàng rào sau bên phải
  const hayMangerRoot = new TransformNode(`corral-manger-root-${farmId}`, scene);
  hayMangerRoot.position.set(halfW - 1.4, floorLevel, halfD - 0.32);
  hayMangerRoot.parent = root;

  const hayMangerBox = MeshBuilder.CreateBox(`corral-manger-wood-${farmId}`, {
    width: 1.25,
    depth: 0.38,
    height: 0.3,
  }, scene);
  hayMangerBox.position.set(0, 0.15, 0);
  hayMangerBox.material = mats.troughWood;
  hayMangerBox.parent = hayMangerRoot;
  shadows?.addShadowCaster(hayMangerBox);

  const hayMangerFill = MeshBuilder.CreateBox(`corral-manger-hay-${farmId}`, {
    width: 1.15,
    depth: 0.3,
    height: 0.08,
  }, scene);
  hayMangerFill.position.set(0, 0.26, 0);
  hayMangerFill.material = mats.feedGrain;
  hayMangerFill.parent = hayMangerRoot;

  root.getChildMeshes().forEach(mesh => {
    mesh.isPickable = true;
    mesh.metadata = { ...(mesh.metadata || {}), type: 'livestock-interact', farmId };
  });

  if (options.showDecorativeAnimal === false) {
    return {
      root,
      dispose() {
        root.dispose(false, false);
      },
    };
  }

  // 5. Chú Bò Sữa Chibi Đáng Yêu Đeo Chuông Vàng (Stylized Procedural Farm Pet - khi bật)
  const petRoot = new TransformNode(`corral-pet-chibi-${farmId}`, scene);
  petRoot.position.set(0.3, floorLevel, 0.2);
  petRoot.rotation.y = -0.55;
  petRoot.parent = root;

  const cowBody = MeshBuilder.CreateSphere('cow-body', { diameterX: 1.1, diameterY: 0.9, diameterZ: 1.35, segments: 12 }, scene);
  cowBody.position.set(0, 0.65, 0);
  cowBody.material = mats.cowBody;
  cowBody.parent = petRoot;
  shadows?.addShadowCaster(cowBody);

  const spot1 = MeshBuilder.CreateSphere('cow-spot1', { diameter: 0.5, segments: 8 }, scene);
  spot1.scaling.set(1.2, 0.6, 1.0);
  spot1.position.set(-0.32, 0.82, 0.15);
  spot1.material = mats.cowSpot;
  spot1.parent = petRoot;

  [
    [-0.3, -0.38],
    [0.3, -0.38],
    [-0.3, 0.38],
    [0.3, 0.38],
  ].forEach(([lx, lz], idx) => {
    const leg = MeshBuilder.CreateCylinder(`cow-leg-${idx}`, { height: 0.42, diameter: 0.18, tessellation: 10 }, scene);
    leg.position.set(lx, 0.21, lz);
    leg.material = mats.cowBody;
    leg.parent = petRoot;
    shadows?.addShadowCaster(leg);
  });

  const headRoot = new TransformNode('cow-head-root', scene);
  headRoot.position.set(0, 0.9, -0.7);
  headRoot.parent = petRoot;

  const headMesh = MeshBuilder.CreateSphere('cow-head', { diameterX: 0.7, diameterY: 0.62, diameterZ: 0.68, segments: 10 }, scene);
  headMesh.material = mats.cowBody;
  headMesh.parent = headRoot;

  const snout = MeshBuilder.CreateSphere('cow-snout', { diameterX: 0.5, diameterY: 0.32, diameterZ: 0.36, segments: 8 }, scene);
  snout.position.set(0, -0.14, -0.3);
  snout.material = mats.cowNose;
  snout.parent = headRoot;

  [-0.22, 0.22].forEach((hx, idx) => {
    const horn = MeshBuilder.CreateCylinder(`cow-horn-${idx}`, { height: 0.2, diameterTop: 0.05, diameterBottom: 0.11, tessellation: 8 }, scene);
    horn.position.set(hx, 0.32, -0.05);
    horn.rotation.z = idx === 0 ? 0.35 : -0.35;
    horn.material = mats.cowHorn;
    horn.parent = headRoot;
  });

  [-0.35, 0.35].forEach((ex, idx) => {
    const ear = MeshBuilder.CreateSphere(`cow-ear-${idx}`, { diameterX: 0.2, diameterY: 0.12, diameterZ: 0.12, segments: 6 }, scene);
    ear.position.set(ex, 0.16, 0.02);
    ear.rotation.z = idx === 0 ? 0.4 : -0.4;
    ear.material = mats.cowSpot;
    ear.parent = headRoot;
  });

  [-0.16, 0.16].forEach((eyeX, idx) => {
    const eye = MeshBuilder.CreateSphere(`cow-eye-${idx}`, { diameter: 0.08, segments: 6 }, scene);
    eye.position.set(eyeX, 0.04, -0.3);
    eye.material = mats.cowEye;
    eye.parent = headRoot;
  });

  const bell = MeshBuilder.CreateSphere('cow-bell', { diameter: 0.16, segments: 8 }, scene);
  bell.position.set(0, -0.32, -0.1);
  bell.material = mats.cowBell;
  bell.parent = headRoot;

  const tail = MeshBuilder.CreateCylinder('cow-tail', { height: 0.42, diameter: 0.05, tessellation: 6 }, scene);
  tail.position.set(0, 0.55, 0.68);
  tail.rotation.x = -0.55;
  tail.material = mats.cowSpot;
  tail.parent = petRoot;

  let animTime = Math.random() * 10;
  const animObserver = scene.onBeforeRenderObservable.add(() => {
    if (!root.isEnabled()) return;
    const dt = scene.getEngine().getDeltaTime() / 1000;
    animTime += dt * 1.8;
    headRoot.rotation.x = Math.sin(animTime) * 0.08;
    headRoot.rotation.y = Math.cos(animTime * 0.7) * 0.1;
    cowBody.scaling.y = 1.0 + Math.sin(animTime * 2.0) * 0.02;
    tail.rotation.z = Math.sin(animTime * 3.0) * 0.22;
    bell.rotation.z = Math.sin(animTime * 2.0) * 0.18;
  });

  return {
    root,
    petRoot,
    dispose() {
      if (animObserver) scene.onBeforeRenderObservable.remove(animObserver);
      root.dispose(false, false);
    },
  };
}
