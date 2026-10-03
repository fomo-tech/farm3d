import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial } from '../rendering/PlayTogetherTheme.js';

/**
 * Chuồng Lộ Thiên Nông Trại 3D Bản Nâng Cấp Mạnh Mẽ (Chunky Rustic Livestock Corral)
 * - Cọc gỗ to tròn chắc khỏe (diameter 0.22m), thanh ray đôi gỗ sồi mật ong
 * - Mái chái che râm rộng rãi góc sau chuồng (Spacious Shelter Lean-to)
 * - Thảm rơm vàng dày dặn, máng ăn ngũ cốc dài, bồn nước đá xanh biếc
 * - 3 kiện rơm vuông buộc dây thừng, xe cút kít chở cỏ và bình sữa thiếc
 * - Chú bò sữa chibi đốm đáng yêu đeo chuông vàng lục lạc gật gù nhai cỏ
 */
export function createOpenAirCorral(scene, shadows, position = { x: 0, y: 0, z: 0 }, options = {}) {
  if (!scene?.onBeforeRenderObservable) {
    throw new TypeError('createOpenAirCorral cần Babylon Scene hợp lệ.');
  }
  const {
    farmId = 'lot',
    ownerName = 'Nông dân',
    tier = 1,
    animalType = 'cow', // 'cow' | 'alpaca'
    width = 6.4,
    depth = 5.6,
  } = options;

  const root = new TransformNode(`open-air-corral-${farmId}`, scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.metadata = { farmId, ownerName, type: 'farm-corral', tier };

  // 1. Materials phong cách Ghibli x Play Together ấm áp
  const mats = {
    timberPost: createToyMaterial(scene, 'mat-corral-post-chunky', '#854d0e', { specularPower: 32, ambientScale: 0.55 }),
    timberRail: createToyMaterial(scene, 'mat-corral-rail-chunky', '#a16207', { specularPower: 26, ambientScale: 0.58 }),
    groundEarth: createToyMaterial(scene, 'mat-corral-earth-rich', '#78350f', { specularPower: 16, ambientScale: 0.52 }),
    strawBedding: createToyMaterial(scene, 'mat-corral-straw-rich', '#f59e0b', { specularPower: 22, specularLevel: 0.22, ambientScale: 0.65 }),
    strawBale: createToyMaterial(scene, 'mat-corral-straw-bale-rich', '#fbbf24', { specularPower: 18, ambientScale: 0.6 }),
    roofShake: createToyMaterial(scene, 'mat-corral-roof-shake-rich', '#713f12', { specularPower: 28, ambientScale: 0.5 }),
    feedGrain: createToyMaterial(scene, 'mat-corral-grain-gold', '#d97706', { specularPower: 14, ambientScale: 0.6 }),
    troughWood: createToyMaterial(scene, 'mat-corral-trough-wood-rich', '#57300a', { specularPower: 24, ambientScale: 0.45 }),
    waterPool: createToyMaterial(scene, 'mat-corral-water-azure', '#38bdf8', { specularPower: 96, specularLevel: 0.85, emissiveHex: '#0284c7', ambientScale: 0.7 }),
    warmLantern: createToyMaterial(scene, 'mat-corral-lantern-amber', '#fef08a', { emissiveHex: '#fbbf24', specularPower: 96 }),
    ironHardware: createToyMaterial(scene, 'mat-corral-iron-dark', '#334155', { specularPower: 64, specularLevel: 0.4 }),
    tinMetal: createToyMaterial(scene, 'mat-corral-tin-silver', '#94a3b8', { specularPower: 80, specularLevel: 0.6, ambientScale: 0.55 }),
    grassGreen: createToyMaterial(scene, 'mat-corral-grass-green', '#22c55e', { ambientScale: 0.6 }),

    // Pet materials
    cowBody: createToyMaterial(scene, 'mat-cow-body-cream', '#fffbeb', { specularPower: 40, ambientScale: 0.65 }),
    cowSpot: createToyMaterial(scene, 'mat-cow-spot-caramel', '#92400e', { specularPower: 32, ambientScale: 0.55 }),
    cowNose: createToyMaterial(scene, 'mat-cow-nose-pink', '#fbcfe8', { emissiveHex: '#f472b6', specularPower: 45 }),
    cowHorn: createToyMaterial(scene, 'mat-cow-horn-ivory', '#fef3c7', { specularPower: 60, ambientScale: 0.6 }),
    cowBell: createToyMaterial(scene, 'mat-cow-bell-gold', '#facc15', { emissiveHex: '#eab308', specularPower: 96, specularLevel: 0.8 }),
    cowEye: createToyMaterial(scene, 'mat-cow-eye-dark', '#1e293b', { specularPower: 96 }),
  };

  const halfW = width / 2;
  const halfD = depth / 2;

  // 2. Nền đất nện chuồng (Earth Paddock Base)
  const paddockFloor = MeshBuilder.CreateBox(`corral-floor-${farmId}`, {
    width: width - 0.15,
    depth: depth - 0.15,
    height: 0.09,
  }, scene);
  paddockFloor.position.set(0, 0.045, 0);
  paddockFloor.material = mats.groundEarth;
  paddockFloor.receiveShadows = true;
  paddockFloor.parent = root;

  // Thảm rơm vàng êm ái dày dặn (Straw Bedding Patch)
  const strawPatch = MeshBuilder.CreateBox(`corral-straw-${farmId}`, {
    width: width * 0.65,
    depth: depth * 0.62,
    height: 0.12,
  }, scene);
  strawPatch.position.set(0.5, 0.08, 0.35);
  strawPatch.material = mats.strawBedding;
  strawPatch.receiveShadows = true;
  strawPatch.parent = root;

  // 3. Hệ thống Cọc rào gỗ to tròn chắc nịch & Thanh ray đôi (Chunky Post-and-Rail)
  const fenceHeight = 1.15;
  const postRadius = 0.11; // Đường kính 0.22m to khỏe
  const railRadius = 0.055; // Đường kính 0.11m chắc chắn

  function createPost(name, px, pz) {
    const post = MeshBuilder.CreateCylinder(`corral-post-${name}`, {
      height: fenceHeight,
      diameter: postRadius * 2,
      tessellation: 12,
    }, scene);
    post.position.set(px, fenceHeight / 2 + 0.04, pz);
    post.material = mats.timberPost;
    post.parent = root;

    // Chóp cọc bo tròn mềm mại
    const cap = MeshBuilder.CreateSphere(`corral-cap-${name}`, {
      diameter: postRadius * 2.15,
      segments: 8,
    }, scene);
    cap.position.set(px, fenceHeight + 0.04, pz);
    cap.material = mats.timberPost;
    cap.parent = root;

    shadows?.addShadowCaster(post);
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

  // 4 Cọc góc
  createPost('c-fl', -halfW, -halfD);
  createPost('c-fr', halfW, -halfD);
  createPost('c-bl', -halfW, halfD);
  createPost('c-br', halfW, halfD);

  // Cọc trung gian
  createPost('mid-l', -halfW, 0);
  createPost('mid-r', halfW, 0);
  createPost('mid-b1', -halfW * 0.33, halfD);
  createPost('mid-b2', halfW * 0.33, halfD);

  // Rào cạnh Trái (-halfW)
  createRail('left-top', depth, new Vector3(-halfW, fenceHeight * 0.82 + 0.04, -halfD), new Vector3(-halfW, fenceHeight * 0.82 + 0.04, halfD));
  createRail('left-bot', depth, new Vector3(-halfW, fenceHeight * 0.42 + 0.04, -halfD), new Vector3(-halfW, fenceHeight * 0.42 + 0.04, halfD));

  // Rào cạnh Phải (+halfW)
  createRail('right-top', depth, new Vector3(halfW, fenceHeight * 0.82 + 0.04, -halfD), new Vector3(halfW, fenceHeight * 0.82 + 0.04, halfD));
  createRail('right-bot', depth, new Vector3(halfW, fenceHeight * 0.42 + 0.04, -halfD), new Vector3(halfW, fenceHeight * 0.42 + 0.04, halfD));

  // Rào cạnh Sau (+halfD)
  createRail('back-top', width, new Vector3(-halfW, fenceHeight * 0.82 + 0.04, halfD), new Vector3(halfW, fenceHeight * 0.82 + 0.04, halfD));
  createRail('back-bot', width, new Vector3(-halfW, fenceHeight * 0.42 + 0.04, halfD), new Vector3(halfW, fenceHeight * 0.42 + 0.04, halfD));

  // Mặt trước chừa cửa rộng 1.9m ở bên trái để người chơi bước vào
  const gateW = 1.9;
  createPost('gate-l', -gateW / 2, -halfD);
  createPost('gate-r', gateW / 2, -halfD);

  const frontWingLeft = -gateW / 2 - (-halfW);
  if (frontWingLeft > 0.4) {
    createRail('front-l-top', frontWingLeft, new Vector3(-halfW, fenceHeight * 0.82 + 0.04, -halfD), new Vector3(-gateW / 2, fenceHeight * 0.82 + 0.04, -halfD));
    createRail('front-l-bot', frontWingLeft, new Vector3(-halfW, fenceHeight * 0.42 + 0.04, -halfD), new Vector3(-gateW / 2, fenceHeight * 0.42 + 0.04, -halfD));
  }

  const frontWingRight = halfW - gateW / 2;
  if (frontWingRight > 0.4) {
    createRail('front-r-top', frontWingRight, new Vector3(gateW / 2, fenceHeight * 0.82 + 0.04, -halfD), new Vector3(halfW, fenceHeight * 0.82 + 0.04, -halfD));
    createRail('front-r-bot', frontWingRight, new Vector3(gateW / 2, fenceHeight * 0.42 + 0.04, -halfD), new Vector3(halfW, fenceHeight * 0.42 + 0.04, -halfD));
  }

  // Cổng gỗ mộc có bản lề xoay nhẹ mở hờ (Rustic Swing Gate)
  const gateSwingRoot = new TransformNode(`corral-gate-swing-${farmId}`, scene);
  gateSwingRoot.position.set(-gateW / 2, 0.04, -halfD);
  gateSwingRoot.rotation.y = -0.42;
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

  const gateBrace = MeshBuilder.CreateBox('gate-brace', { width: 0.1, height: fenceHeight * 0.9, depth: 0.08 }, scene);
  gateBrace.position.set(gateW * 0.48, fenceHeight * 0.58, 0);
  gateBrace.rotation.z = -0.72;
  gateBrace.material = mats.timberPost;
  gateBrace.parent = gateSwingRoot;

  // 4. Mái chái che râm ở góc sau chuồng (Spacious Rustic Shelter Lean-to)
  const shelterW = 3.1;
  const shelterD = 2.5;
  const shelterH = 2.4;
  const shelterRoot = new TransformNode(`corral-shelter-${farmId}`, scene);
  shelterRoot.position.set(halfW - shelterW / 2 - 0.15, 0, halfD - shelterD / 2 - 0.15);
  shelterRoot.parent = root;

  // 4 Cột trụ mái chái to khỏe
  [
    [-shelterW / 2 + 0.12, -shelterD / 2 + 0.12],
    [shelterW / 2 - 0.12, -shelterD / 2 + 0.12],
    [-shelterW / 2 + 0.12, shelterD / 2 - 0.12],
    [shelterW / 2 - 0.12, shelterD / 2 - 0.12],
  ].forEach(([colX, colZ], idx) => {
    const colHeight = colZ > 0 ? shelterH + 0.4 : shelterH;
    const col = MeshBuilder.CreateCylinder(`shelter-col-${idx}`, {
      height: colHeight,
      diameter: 0.18,
      tessellation: 12,
    }, scene);
    col.position.set(colX, colHeight / 2, colZ);
    col.material = mats.timberPost;
    col.parent = shelterRoot;
    shadows?.addShadowCaster(col);
  });

  // Mái ngói ván dốc che nắng mưa
  const shelterRoof = MeshBuilder.CreateBox(`shelter-roof-${farmId}`, {
    width: shelterW + 0.5,
    depth: shelterD + 0.5,
    height: 0.14,
  }, scene);
  shelterRoof.position.set(0, shelterH + 0.28, 0);
  shelterRoof.rotation.x = 0.16;
  shelterRoof.material = mats.roofShake;
  shelterRoof.parent = shelterRoot;
  shadows?.addShadowCaster(shelterRoof);

  // Vách gỗ phía sau mái chái ngăn gió
  const backWall = MeshBuilder.CreateBox(`shelter-back-wall-${farmId}`, {
    width: shelterW - 0.1,
    height: shelterH * 0.78,
    depth: 0.1,
  }, scene);
  backWall.position.set(0, shelterH * 0.44, shelterD / 2 - 0.12);
  backWall.material = mats.timberRail;
  backWall.parent = shelterRoot;

  // Đèn lồng treo ấm áp ở góc mái chái
  const lanternPost = MeshBuilder.CreateSphere(`shelter-lantern-${farmId}`, { diameter: 0.32, segments: 10 }, scene);
  lanternPost.position.set(-shelterW / 2 + 0.15, shelterH - 0.18, -shelterD / 2 + 0.15);
  lanternPost.material = mats.warmLantern;
  lanternPost.parent = shelterRoot;

  // 5. Máng ăn gỗ & Bồn nước đá
  // Máng ăn ngũ cốc dài
  const feedTrough = MeshBuilder.CreateBox(`corral-feed-trough-${farmId}`, {
    width: 1.8,
    depth: 0.58,
    height: 0.42,
  }, scene);
  feedTrough.position.set(-halfW + 1.25, 0.23, halfD - 0.7);
  feedTrough.material = mats.troughWood;
  feedTrough.parent = root;
  shadows?.addShadowCaster(feedTrough);

  const grainHay = MeshBuilder.CreateBox(`corral-grain-${farmId}`, {
    width: 1.68,
    depth: 0.48,
    height: 0.1,
  }, scene);
  grainHay.position.set(-halfW + 1.25, 0.4, halfD - 0.7);
  grainHay.material = mats.feedGrain;
  grainHay.parent = root;

  // Bồn nước đá tròn
  const waterTub = MeshBuilder.CreateCylinder(`corral-water-tub-${farmId}`, {
    diameter: 0.95,
    height: 0.44,
    tessellation: 14,
  }, scene);
  waterTub.position.set(-halfW + 1.1, 0.23, 0.6);
  waterTub.material = mats.timberPost;
  waterTub.parent = root;
  shadows?.addShadowCaster(waterTub);

  const waterSurface = MeshBuilder.CreateCylinder(`corral-water-surf-${farmId}`, {
    diameter: 0.88,
    height: 0.05,
    tessellation: 14,
  }, scene);
  waterSurface.position.set(-halfW + 1.1, 0.4, 0.6);
  waterSurface.material = mats.waterPool;
  waterSurface.parent = root;

  // 6. Kiện rơm vàng xếp lớp (3 Straw Bales)
  [
    { x: -halfW + 0.75, z: -halfD + 1.2, rotY: 0.12 },
    { x: -halfW + 0.75, z: -halfD + 1.9, rotY: -0.15 },
    { x: -halfW + 0.73, z: -halfD + 1.55, y: 0.48, rotY: 0.24 },
  ].forEach((bale, idx) => {
    const strawBale = MeshBuilder.CreateBox(`corral-bale-${idx}-${farmId}`, {
      width: 0.92,
      depth: 0.58,
      height: 0.46,
    }, scene);
    strawBale.position.set(bale.x, bale.y || 0.25, bale.z);
    strawBale.rotation.y = bale.rotY;
    strawBale.material = mats.strawBale;
    strawBale.parent = root;
    shadows?.addShadowCaster(strawBale);
  });

  // Xe cút kít gỗ (Wooden Wheelbarrow) chở cỏ tươi đỗ cạnh rào
  const barrowRoot = new TransformNode(`wheelbarrow-${farmId}`, scene);
  barrowRoot.position.set(halfW - 0.9, 0.04, -halfD + 1.2);
  barrowRoot.rotation.y = -0.65;
  barrowRoot.parent = root;

  const barrowBox = MeshBuilder.CreateBox('barrow-box', { width: 0.9, depth: 0.6, height: 0.3 }, scene);
  barrowBox.position.set(0, 0.35, 0);
  barrowBox.material = mats.troughWood;
  barrowBox.parent = barrowRoot;

  const barrowGrass = MeshBuilder.CreateBox('barrow-grass', { width: 0.82, depth: 0.52, height: 0.12 }, scene);
  barrowGrass.position.set(0, 0.46, 0);
  barrowGrass.material = mats.grassGreen;
  barrowGrass.parent = barrowRoot;

  const barrowWheel = MeshBuilder.CreateCylinder('barrow-wheel', { height: 0.1, diameter: 0.42, tessellation: 12 }, scene);
  barrowWheel.position.set(0, 0.22, 0.45);
  barrowWheel.rotation.z = Math.PI / 2;
  barrowWheel.material = mats.timberPost;
  barrowWheel.parent = barrowRoot;

  // Bình sữa thiếc vintage (Tin Milk Can)
  const milkCan = MeshBuilder.CreateCylinder('milk-can', { height: 0.55, diameterTop: 0.24, diameterBottom: 0.32, tessellation: 10 }, scene);
  milkCan.position.set(halfW - 0.5, 0.28, -halfD + 1.9);
  milkCan.material = mats.tinMetal;
  milkCan.parent = root;

  // 7. Chú Bò Sữa Chibi Đáng Yêu Đeo Chuông Vàng (Stylized Procedural Farm Pet)
  // Tạo mô hình thủ công 100% hiển thị độc lập, không sợ thiếu asset glTF!
  const petRoot = new TransformNode(`corral-pet-chibi-${farmId}`, scene);
  petRoot.position.set(0.3, 0, 0.2);
  petRoot.rotation.y = -0.55;
  petRoot.parent = root;

  // Thân bò tròn mập (Chubby Cow Body)
  const cowBody = MeshBuilder.CreateSphere('cow-body', { diameterX: 1.15, diameterY: 0.92, diameterZ: 1.45, segments: 12 }, scene);
  cowBody.position.set(0, 0.68, 0);
  cowBody.material = mats.cowBody;
  cowBody.parent = petRoot;
  shadows?.addShadowCaster(cowBody);

  // Đốm bò caramel
  const spot1 = MeshBuilder.CreateSphere('cow-spot1', { diameter: 0.55, segments: 8 }, scene);
  spot1.scaling.set(1.2, 0.6, 1.0);
  spot1.position.set(-0.35, 0.85, 0.15);
  spot1.material = mats.cowSpot;
  spot1.parent = petRoot;

  const spot2 = MeshBuilder.CreateSphere('cow-spot2', { diameter: 0.48, segments: 8 }, scene);
  spot2.scaling.set(0.9, 0.6, 1.1);
  spot2.position.set(0.38, 0.72, -0.25);
  spot2.material = mats.cowSpot;
  spot2.parent = petRoot;

  // 4 Chân ngắn mập đáng yêu (Stubby Legs)
  [
    [-0.32, -0.42],
    [0.32, -0.42],
    [-0.32, 0.42],
    [0.32, 0.42],
  ].forEach(([lx, lz], idx) => {
    const leg = MeshBuilder.CreateCylinder(`cow-leg-${idx}`, { height: 0.45, diameter: 0.2, tessellation: 10 }, scene);
    leg.position.set(lx, 0.23, lz);
    leg.material = mats.cowBody;
    leg.parent = petRoot;
    shadows?.addShadowCaster(leg);
  });

  // Đầu bò (Chibi Head)
  const headRoot = new TransformNode('cow-head-root', scene);
  headRoot.position.set(0, 0.95, -0.75);
  headRoot.parent = petRoot;

  const headMesh = MeshBuilder.CreateSphere('cow-head', { diameterX: 0.72, diameterY: 0.65, diameterZ: 0.72, segments: 10 }, scene);
  headMesh.material = mats.cowBody;
  headMesh.parent = headRoot;

  // Mõm hồng tròn xinh (Pink Snout)
  const snout = MeshBuilder.CreateSphere('cow-snout', { diameterX: 0.52, diameterY: 0.35, diameterZ: 0.38, segments: 8 }, scene);
  snout.position.set(0, -0.15, -0.32);
  snout.material = mats.cowNose;
  snout.parent = headRoot;

  // Hai sừng nhỏ xíu
  [-0.24, 0.24].forEach((hx, idx) => {
    const horn = MeshBuilder.CreateCylinder(`cow-horn-${idx}`, { height: 0.22, diameterTop: 0.05, diameterBottom: 0.12, tessellation: 8 }, scene);
    horn.position.set(hx, 0.35, -0.05);
    horn.rotation.z = idx === 0 ? 0.35 : -0.35;
    horn.material = mats.cowHorn;
    horn.parent = headRoot;
  });

  // Hai tai vểnh mềm
  [-0.38, 0.38].forEach((ex, idx) => {
    const ear = MeshBuilder.CreateSphere(`cow-ear-${idx}`, { diameterX: 0.22, diameterY: 0.14, diameterZ: 0.14, segments: 6 }, scene);
    ear.position.set(ex, 0.18, 0.02);
    ear.rotation.z = idx === 0 ? 0.4 : -0.4;
    ear.material = mats.cowSpot;
    ear.parent = headRoot;
  });

  // Mắt đen long lanh
  [-0.18, 0.18].forEach((eyeX, idx) => {
    const eye = MeshBuilder.CreateSphere(`cow-eye-${idx}`, { diameter: 0.09, segments: 6 }, scene);
    eye.position.set(eyeX, 0.05, -0.32);
    eye.material = mats.cowEye;
    eye.parent = headRoot;
  });

  // Vòng cổ đỏ & Chuông vàng lục lạc (Golden Bell Collar)
  const collar = MeshBuilder.CreateTorus('cow-collar', { diameter: 0.52, thickness: 0.08, tessellation: 12 }, scene);
  collar.position.set(0, -0.18, 0.05);
  collar.rotation.x = Math.PI / 3;
  collar.material = mats.cowSpot;
  collar.parent = headRoot;

  const bell = MeshBuilder.CreateSphere('cow-bell', { diameter: 0.18, segments: 8 }, scene);
  bell.position.set(0, -0.35, -0.1);
  bell.material = mats.cowBell;
  bell.parent = headRoot;

  // Đuôi bò lắc lư
  const tail = MeshBuilder.CreateCylinder('cow-tail', { height: 0.45, diameter: 0.06, tessellation: 6 }, scene);
  tail.position.set(0, 0.58, 0.72);
  tail.rotation.x = -0.55;
  tail.material = mats.cowSpot;
  tail.parent = petRoot;

  // Hiệu ứng thở & gật gù nhai cỏ của chú bò
  let animTime = Math.random() * 10;
  const animObserver = scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    animTime += dt * 1.8;
    headRoot.rotation.x = Math.sin(animTime) * 0.09;
    headRoot.rotation.y = Math.cos(animTime * 0.7) * 0.12;
    cowBody.scaling.y = 1.0 + Math.sin(animTime * 2.0) * 0.025;
    tail.rotation.z = Math.sin(animTime * 3.0) * 0.25;
    bell.rotation.z = Math.sin(animTime * 2.0) * 0.2;
  });

  return {
    root,
    petRoot,
    dispose() {
      if (animObserver) scene.onBeforeRenderObservable.remove(animObserver);
      root.dispose(false, true);
    },
  };
}
