import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';

function makeMat(scene, name, hex, emissiveHex = null) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.35);
  m.specularColor = new Color3(0.08, 0.08, 0.08);
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

/**
 * 1. Phân Khu Hồ Pha Lê & Cao Nguyên Rừng Thông (Crystal Lake & Mountain District)
 */
export function createLakeDistrict(scene, shadows) {
  const materials = {
    timber: makeMat(scene, 'lake-pier-wood', '#5c381e'),
    weatheredWood: makeMat(scene, 'lake-pier-plank', '#8d6e53'),
    rope: makeMat(scene, 'lake-pier-rope', '#eab308'),
    boatHull: makeMat(scene, 'lake-boat-hull', '#0284c7', '#0369a1'),
    boatWood: makeMat(scene, 'lake-rowboat-wood', '#9a3412'),
    sail: makeMat(scene, 'lake-boat-sail', '#fffdf5'),
    lanternGlow: makeMat(scene, 'lake-lantern-glow', '#fef08a', '#f59e0b'),
    granite: makeMat(scene, 'waterfall-granite', '#64748b'),
    water: makeMat(scene, 'waterfall-foam', '#e0f2fe', '#38bdf8'),
    mossyRock: makeMat(scene, 'lake-mossy-rock', '#475569'),
    lilyPad: makeMat(scene, 'lake-lily-pad', '#15803d'),
    lotusPetal: makeMat(scene, 'lake-lotus-petal', '#f472b6', '#ec4899'),
    lotusCenter: makeMat(scene, 'lake-lotus-center', '#fde047', '#eab308'),
    tentCloth: makeMat(scene, 'lake-tent-cloth', '#ea580c'),
    tentInside: makeMat(scene, 'lake-tent-inside', '#431407'),
    fireEmbers: makeMat(scene, 'lake-campfire-embers', '#ef4444', '#f97316'),
    fireLog: makeMat(scene, 'lake-campfire-log', '#3e2723'),
  };
  materials.water.alpha = 0.88;

  const root = new TransformNode('landmark-lake-district', scene);

  // === 1. CẦU TÀU GỖ CÂU CÁ (LONG WOODEN FISHING PIER) ===
  const pierDeck = MeshBuilder.CreateBox('lake-pier-deck', {
    width: 32,
    height: 0.35,
    depth: 4.4,
  }, scene);
  pierDeck.position.set(126, 0.35, 2);
  pierDeck.material = materials.weatheredWood;
  pierDeck.parent = root;
  shadows?.addShadowCaster(pierDeck);

  // Cọc gỗ đóng đáy hồ quấn dây thừng
  for (let px = 112; px <= 140; px += 5.5) {
    [-2.0, 2.0].forEach((pz, i) => {
      const pile = MeshBuilder.CreateCylinder(`lake-pile-${px}-${i}`, {
        height: 2.8,
        diameter: 0.32,
        tessellation: 8,
      }, scene);
      pile.position.set(px, 0.2, 2 + pz);
      pile.material = materials.timber;
      pile.parent = root;
      shadows?.addShadowCaster(pile);

      // Cọc thừng nhô lên trên sàn cầu tàu (Mooring Bollards)
      const bollardTop = MeshBuilder.CreateCylinder(`lake-bollard-top-${px}-${i}`, {
        height: 0.5,
        diameter: 0.24,
      }, scene);
      bollardTop.position.set(px, 0.7, 2 + pz);
      bollardTop.material = materials.timber;
      bollardTop.parent = root;

      // Vòng dây thừng quấn quanh cọc
      const ropeRing = MeshBuilder.CreateTorus(`lake-rope-${px}-${i}`, {
        diameter: 0.28,
        thickness: 0.06,
        tessellation: 12,
      }, scene);
      ropeRing.position.set(px, 0.65, 2 + pz);
      ropeRing.material = materials.rope;
      ropeRing.parent = root;
    });
  }

  // Đèn lồng bão cổ điển đầu cầu tàu (Fisherman's Storm Lantern)
  const lanternPost = MeshBuilder.CreateCylinder('lake-lantern-post', { height: 2.4, diameter: 0.14 }, scene);
  lanternPost.position.set(141.5, 1.4, 3.8);
  lanternPost.material = materials.timber;
  lanternPost.parent = root;

  const lanternArm = MeshBuilder.CreateBox('lake-lantern-arm', { width: 0.6, height: 0.1, depth: 0.1 }, scene);
  lanternArm.position.set(141.2, 2.4, 3.8);
  lanternArm.material = materials.timber;
  lanternArm.parent = root;

  const lanternBulb = MeshBuilder.CreateSphere('lake-lantern-bulb', { diameter: 0.45, segments: 8 }, scene);
  lanternBulb.position.set(141.0, 2.2, 3.8);
  lanternBulb.material = materials.lanternGlow;
  lanternBulb.parent = root;

  // Cần câu cá cắm nghiêng trên thành cầu
  const fishingRod = MeshBuilder.CreateCylinder('lake-fishing-rod', { diameterTop: 0.02, diameterBottom: 0.08, height: 3.2 }, scene);
  fishingRod.position.set(138, 1.2, 0.2);
  fishingRod.rotation.z = -Math.PI / 4;
  fishingRod.rotation.y = 0.2;
  fishingRod.material = materials.timber;
  fishingRod.parent = root;

  // Thùng cá & Xô thiếc câu cá
  const fishBucket = MeshBuilder.CreateCylinder('lake-fish-bucket', { diameterTop: 0.4, diameterBottom: 0.3, height: 0.45 }, scene);
  fishBucket.position.set(137, 0.7, 1.5);
  fishBucket.material = makeMat(scene, 'lake-bucket-mat', '#94a3b8');
  fishBucket.parent = root;

  // === 2. THUYỀN BUỒM & THUYỀN GỖ CHÈO NHẤP NHÔ (BOBBING BOATS) ===
  // Thuyền buồm lớn
  const sailboatNode = new TransformNode('lake-sailboat-node', scene);
  sailboatNode.position.set(148, 0.18, 6.5);
  sailboatNode.rotation.y = 0.45;
  sailboatNode.parent = root;

  const boatHull = MeshBuilder.CreateCylinder('sailboat-hull', {
    height: 4.2,
    diameterTop: 2.0,
    diameterBottom: 1.3,
    tessellation: 8,
  }, scene);
  boatHull.rotation.z = Math.PI / 2;
  boatHull.scaling.set(0.48, 1.0, 0.75);
  boatHull.position.y = 0.15;
  boatHull.material = materials.boatHull;
  boatHull.parent = sailboatNode;
  shadows?.addShadowCaster(boatHull);

  const mast = MeshBuilder.CreateCylinder('boat-mast', { height: 4.2, diameter: 0.12 }, scene);
  mast.position.set(0, 2.1, 0);
  mast.material = materials.timber;
  mast.parent = sailboatNode;

  const sail = MeshBuilder.CreateCylinder('boat-sail', {
    diameter: 3.2,
    height: 0.05,
    tessellation: 3,
  }, scene);
  sail.rotation.x = Math.PI / 2;
  sail.position.set(0.75, 2.3, 0);
  sail.material = materials.sail;
  sail.parent = sailboatNode;
  shadows?.addShadowCaster(sail);

  // Chiếc thuyền chèo gỗ nhỏ (Rowboat) neo ở mép hồ
  const rowboatNode = new TransformNode('lake-rowboat-node', scene);
  rowboatNode.position.set(144, 0.15, -4.5);
  rowboatNode.rotation.y = -0.3;
  rowboatNode.parent = root;

  const rowboatHull = MeshBuilder.CreateCylinder('rowboat-hull', {
    height: 3.2,
    diameterTop: 1.5,
    diameterBottom: 0.9,
    tessellation: 6,
  }, scene);
  rowboatHull.rotation.z = Math.PI / 2;
  rowboatHull.scaling.set(0.4, 1.0, 0.7);
  rowboatHull.position.y = 0.12;
  rowboatHull.material = materials.boatWood;
  rowboatHull.parent = rowboatNode;
  shadows?.addShadowCaster(rowboatHull);

  // 2 Mái chèo gỗ gác ngang
  [-0.6, 0.6].forEach((ox, idx) => {
    const oar = MeshBuilder.CreateCylinder(`rowboat-oar-${idx}`, { diameter: 0.06, height: 2.2 }, scene);
    oar.position.set(ox, 0.35, 0);
    oar.rotation.z = (idx === 0 ? 0.35 : -0.35);
    oar.rotation.x = Math.PI / 2;
    oar.material = materials.timber;
    oar.parent = rowboatNode;
  });

  // === 3. HOA SÚNG NỔI & ĐÁ CUỘI VEN BỜ (WATER LILIES & PEBBLES) ===
  const lilyCoords = [
    [155, 0.12, 10], [158, 0.12, 8], [152, 0.12, 14],
    [160, 0.12, -10], [163, 0.12, -8], [148, 0.12, -12],
    [172, 0.12, 12], [175, 0.12, 15]
  ];

  lilyCoords.forEach(([lx, ly, lz], idx) => {
    // Lá sen tròn dẹt có rãnh khuyết
    const pad = MeshBuilder.CreateCylinder(`lily-pad-${idx}`, { diameter: 1.2, height: 0.03, tessellation: 16 }, scene);
    pad.position.set(lx, ly, lz);
    pad.material = materials.lilyPad;
    pad.parent = root;

    // Hoa sen/súng nở trên một số lá
    if (idx % 2 === 0) {
      for (let p = 0; p < 6; p++) {
        const pAngle = (p / 6) * Math.PI * 2;
        const petal = MeshBuilder.CreateSphere(`lotus-petal-${idx}-${p}`, {
          diameterX: 0.22,
          diameterY: 0.14,
          diameterZ: 0.32,
          segments: 4,
        }, scene);
        petal.position.set(lx + Math.sin(pAngle) * 0.18, ly + 0.08, lz + Math.cos(pAngle) * 0.18);
        petal.rotation.y = pAngle;
        petal.material = materials.lotusPetal;
        petal.parent = root;
      }
      const center = MeshBuilder.CreateSphere(`lotus-center-${idx}`, { diameter: 0.16, segments: 4 }, scene);
      center.position.set(lx, ly + 0.1, lz);
      center.material = materials.lotusCenter;
      center.parent = root;
    }
  });

  // Đá rêu ven bờ hồ
  const rockCoords = [
    [138, 0.4, 8, 1.2], [142, 0.35, 12, 0.9], [136, 0.5, -6, 1.4],
    [140, 0.4, -14, 1.1], [158, 0.45, -22, 1.3], [168, 0.55, -18, 1.5]
  ];
  rockCoords.forEach(([rx, ry, rz, rs], idx) => {
    const rock = MeshBuilder.CreateSphere(`lake-mossy-rock-${idx}`, { diameter: rs, segments: 6 }, scene);
    rock.scaling.set(1.4, 0.7, 1.1);
    rock.position.set(rx, ry, rz);
    rock.material = materials.mossyRock;
    rock.parent = root;
    shadows?.addShadowCaster(rock);
  });

  // === 4. CẦU VÒM GỖ CÔNG NỐI HAI BỜ HỒ (ARHCED WOODEN BRIDGE) ===
  const bridgeRoot = new TransformNode('lake-arch-bridge', scene);
  bridgeRoot.position.set(152, 0.5, -18);
  bridgeRoot.parent = root;

  const bridgeDeck = MeshBuilder.CreateBox('bridge-deck', {
    width: 22,
    height: 0.4,
    depth: 4.6,
  }, scene);
  bridgeDeck.position.y = 0.5;
  bridgeDeck.material = materials.timber;
  bridgeDeck.parent = bridgeRoot;
  shadows?.addShadowCaster(bridgeDeck);

  const bridgeArch = MeshBuilder.CreateCylinder('bridge-arch', {
    diameter: 8.5,
    height: 4.8,
    tessellation: 16,
  }, scene);
  bridgeArch.rotation.x = Math.PI / 2;
  bridgeArch.scaling.y = 0.4;
  bridgeArch.position.y = 0;
  bridgeArch.material = materials.weatheredWood;
  bridgeArch.parent = bridgeRoot;

  // Lan can cầu vòm hai bên
  [-2.2, 2.2].forEach((rz, rIdx) => {
    const handrail = MeshBuilder.CreateBox(`bridge-rail-${rIdx}`, { width: 22, height: 0.15, depth: 0.15 }, scene);
    handrail.position.set(0, 1.25, rz);
    handrail.material = materials.timber;
    handrail.parent = bridgeRoot;
  });

  // === 5. KHU LỬA TRẠI & CẮM TRẠI PICNIC VEN HỒ (CAMPFIRE & TENT AREA) ===
  const campNode = new TransformNode('lake-campsite', scene);
  campNode.position.set(138, 0, 18);
  campNode.parent = root;

  // Lều bạt dã ngoại chữ A (A-Frame Cozy Camping Tent)
  const tent = MeshBuilder.CreateCylinder('camp-tent', {
    diameter: 3.8,
    height: 4.2,
    tessellation: 3,
  }, scene);
  tent.rotation.z = Math.PI / 2;
  tent.rotation.y = 0.4;
  tent.scaling.set(0.65, 1.0, 0.85);
  tent.position.set(0, 1.3, 0);
  tent.material = materials.tentCloth;
  tent.parent = campNode;
  shadows?.addShadowCaster(tent);

  // Đống lửa trại đá cuội bập bùng (Campfire)
  const campfireRing = MeshBuilder.CreateTorus('camp-fire-ring', { diameter: 1.6, thickness: 0.22, tessellation: 12 }, scene);
  campfireRing.position.set(4.5, 0.15, 2.5);
  campfireRing.material = materials.mossyRock;
  campfireRing.parent = campNode;

  // Than hồng rực sáng
  const embers = MeshBuilder.CreateSphere('camp-embers', { diameter: 0.9, segments: 6 }, scene);
  embers.position.set(4.5, 0.22, 2.5);
  embers.material = materials.fireEmbers;
  embers.parent = campNode;

  // Củi xếp hình nón
  for (let l = 0; l < 4; l++) {
    const lAngle = (l / 4) * Math.PI * 2;
    const log = MeshBuilder.CreateCylinder(`camp-log-${l}`, { diameter: 0.12, height: 1.1 }, scene);
    log.position.set(4.5 + Math.sin(lAngle) * 0.25, 0.35, 2.5 + Math.cos(lAngle) * 0.25);
    log.rotation.x = Math.PI / 4;
    log.rotation.y = lAngle;
    log.material = materials.fireLog;
    log.parent = campNode;
  }

  // Khúc gỗ sồi xẻ làm ghế ngồi quanh lửa
  const logBench = MeshBuilder.CreateCylinder('camp-log-bench', { diameter: 0.45, height: 2.2 }, scene);
  logBench.rotation.z = Math.PI / 2;
  logBench.rotation.y = 0.6;
  logBench.position.set(5.8, 0.25, 4.0);
  logBench.material = materials.timber;
  logBench.parent = campNode;

  // === 6. THÁC NƯỚC NÚI & BỤI SƯƠNG MÙ (WATERFALL & MIST) ===
  const cliff = MeshBuilder.CreateBox('waterfall-cliff', {
    width: 14,
    height: 7.5,
    depth: 4.5,
  }, scene);
  cliff.position.set(196, 3.75, 30);
  cliff.material = materials.granite;
  cliff.parent = root;

  const waterFlow = MeshBuilder.CreateBox('waterfall-flow', {
    width: 7.2,
    height: 6.8,
    depth: 0.45,
  }, scene);
  waterFlow.rotation.x = -0.15;
  waterFlow.position.set(196, 3.4, 27.8);
  waterFlow.material = materials.water;
  waterFlow.parent = root;

  // Hạt bụi sương thác nước
  const mistTex = new DynamicTexture('waterfall-mist-tex', { width: 32, height: 32 }, scene, true);
  const mctx = mistTex.getContext();
  mctx.clearRect(0, 0, 32, 32);
  const grad = mctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  mctx.fillStyle = grad;
  mctx.beginPath();
  mctx.arc(16, 16, 16, 0, Math.PI * 2);
  mctx.fill();
  mistTex.update();

  const mist = new ParticleSystem('waterfall-mist', 50, scene);
  mist.particleTexture = mistTex;
  mist.emitter = new Vector3(196, 0.4, 27.5);
  mist.minEmitBox = new Vector3(-3.2, 0, -1.0);
  mist.maxEmitBox = new Vector3(3.2, 0.5, 1.0);
  mist.color1 = new Color3(1, 1, 1).toColor4(0.5);
  mist.colorDead = new Color3(1, 1, 1).toColor4(0.0);
  mist.minSize = 0.8;
  mist.maxSize = 2.4;
  mist.minLifeTime = 1.0;
  mist.maxLifeTime = 2.0;
  mist.emitRate = 25;
  mist.direction1 = new Vector3(-0.5, 1.2, -0.5);
  mist.direction2 = new Vector3(0.5, 1.8, 0.5);
  mist.minEmitPower = 0.5;
  mist.maxEmitPower = 1.2;
  mist.start();

  return {
    root,
    sailboatNode,
    rowboatNode,
    mist,
    update(time) {
      // Thuyền buồm nhấp nhô trên gợn sóng hồ
      sailboatNode.position.y = 0.18 + Math.sin(time * 0.0018) * 0.06;
      sailboatNode.rotation.z = Math.sin(time * 0.0015) * 0.05;
      sailboatNode.rotation.x = Math.cos(time * 0.0012) * 0.03;

      // Thuyền chèo gỗ dập dềnh nhẹ
      rowboatNode.position.y = 0.15 + Math.sin(time * 0.0022 + 1.0) * 0.04;
      rowboatNode.rotation.z = Math.sin(time * 0.0018 + 0.8) * 0.04;
    },
  };
}

/**
 * 2. Phân Khu Bờ Biển Hoàng Hôn & Bãi Tắm Nhiệt Đới (Sunset Beach & Tiki Bar)
 */
export function createBeachDistrict(scene, shadows) {
  const materials = {
    sandPlank: makeMat(scene, 'beach-boardwalk', '#d4a373'),
    thatchRoof: makeMat(scene, 'beach-thatch-roof', '#e9c46a'),
    bambooBar: makeMat(scene, 'beach-bamboo-bar', '#b45309'),
    umbrellaOrange: makeMat(scene, 'beach-umbrella-orange', '#f97316'),
    umbrellaBlue: makeMat(scene, 'beach-umbrella-blue', '#0ea5e9'),
    umbrellaYellow: makeMat(scene, 'beach-umbrella-yellow', '#eab308'),
    umbrellaWhite: makeMat(scene, 'beach-umbrella-white', '#ffffff'),
    loungerWood: makeMat(scene, 'beach-lounger-wood', '#fef08a'),
    palmTrunk: makeMat(scene, 'palm-trunk-wood', '#78350f'),
    palmLeaf: makeMat(scene, 'palm-frond-leaf', '#15803d'),
    coconut: makeMat(scene, 'palm-coconut', '#451a03'),
    cocktailGlass: makeMat(scene, 'beach-cocktail-glass', '#bae6fd', '#38bdf8'),
    cocktailDrink: makeMat(scene, 'beach-cocktail-drink', '#ef4444', '#dc2626'),
    surfboard1: makeMat(scene, 'beach-surfboard-1', '#06b6d4', '#0891b2'),
    surfboard2: makeMat(scene, 'beach-surfboard-2', '#f97316', '#ea580c'),
    sandcastle: makeMat(scene, 'beach-sandcastle', '#e2be79'),
    lifeguardRed: makeMat(scene, 'beach-lifeguard-red', '#ef4444'),
    lifeguardWhite: makeMat(scene, 'beach-lifeguard-white', '#f8fafc'),
  };

  const root = new TransformNode('landmark-beach-district', scene);

  // === 1. CẦU VÁN GỖ ĐI DẠO VEN BIỂN (WOODEN BOARDWALK PIER) ===
  const boardwalk = MeshBuilder.CreateBox('beach-boardwalk-pier', {
    width: 12.0,
    height: 0.35,
    depth: 64.0,
  }, scene);
  boardwalk.position.set(0, 0.3, 186);
  boardwalk.material = materials.sandPlank;
  boardwalk.parent = root;
  shadows?.addShadowCaster(boardwalk);

  // Lan can cọc thừng duyên dáng hai bên boardwalk
  for (let bz = 156; bz <= 216; bz += 8) {
    [-5.8, 5.8].forEach((bx, idx) => {
      const post = MeshBuilder.CreateCylinder(`boardwalk-post-${bz}-${idx}`, { height: 1.2, diameter: 0.16 }, scene);
      post.position.set(bx, 0.9, bz);
      post.material = materials.bambooBar;
      post.parent = root;
    });
  }

  // === 2. QUẦY BAR DỪA BIỂN NHIỆT ĐỚI (TIKI COCONUT BEACH BAR) ===
  const barNode = new TransformNode('beach-tiki-bar-node', scene);
  barNode.position.set(-18, 0, 192);
  barNode.parent = root;

  // Quầy bar gỗ tre nứa bo cong chữ U
  const bar = MeshBuilder.CreateBox('beach-juice-bar', {
    width: 6.8,
    height: 1.2,
    depth: 3.2,
  }, scene);
  bar.position.set(0, 0.6, 0);
  bar.material = materials.bambooBar;
  bar.parent = barNode;
  shadows?.addShadowCaster(bar);

  // Mái lá cọ khô nhiệt đới xòe rộng (Thatch Palm Roof)
  const roof = MeshBuilder.CreateCylinder('juice-bar-thatch-roof', {
    diameter: 8.8,
    height: 2.6,
    tessellation: 4,
  }, scene);
  roof.rotation.z = Math.PI / 4;
  roof.rotation.y = Math.PI / 4;
  roof.scaling.set(0.9, 0.75, 0.9);
  roof.position.set(0, 3.8, 0);
  roof.material = materials.thatchRoof;
  roof.parent = barNode;
  shadows?.addShadowCaster(roof);

  // 4 Cột tre đỡ mái
  [[-3.0, -1.2], [3.0, -1.2], [-3.0, 1.2], [3.0, 1.2]].forEach(([px, pz], idx) => {
    const post = MeshBuilder.CreateCylinder(`bar-post-${idx}`, { diameter: 0.22, height: 3.6 }, scene);
    post.position.set(px, 1.8, pz);
    post.material = materials.bambooBar;
    post.parent = barNode;
  });

  // Biển hiệu gỗ: 🍹 TIKI COCONUT BAR 🥥
  const dtBar = new DynamicTexture('dt-bar-sign', { width: 512, height: 128 }, scene, false);
  dtBar.hasAlpha = true;
  const ctxB = dtBar.getContext();
  ctxB.clearRect(0, 0, 512, 128);
  ctxB.fillStyle = '#451a03';
  ctxB.roundRect(8, 8, 496, 112, 18);
  ctxB.fill();
  ctxB.strokeStyle = '#f59e0b';
  ctxB.lineWidth = 8;
  ctxB.stroke();
  dtBar.drawText('🍹 TIKI COCONUT BAR 🥥', null, 76, 'bold 34px Arial', '#ffffff', null, true, true);

  const matBarSign = new StandardMaterial('bar-sign-mat', scene);
  matBarSign.diffuseTexture = dtBar;
  matBarSign.emissiveColor = new Color3(0.9, 0.6, 0.1);
  matBarSign.disableLighting = true;

  const barSignPlane = MeshBuilder.CreatePlane('bar-sign-plane', { width: 4.2, height: 1.0 }, scene);
  barSignPlane.position.set(0, 2.9, 1.7);
  barSignPlane.material = matBarSign;
  barSignPlane.parent = barNode;

  // Ly cocktail dừa cắm ô giấy trên mặt quầy
  [-1.5, 0, 1.5].forEach((cx, idx) => {
    const glass = MeshBuilder.CreateCylinder(`cocktail-${idx}`, { diameterTop: 0.22, diameterBottom: 0.14, height: 0.35 }, scene);
    glass.position.set(cx, 1.35, 1.2);
    glass.material = materials.cocktailDrink;
    glass.parent = barNode;

    // Trái dừa tươi cạnh ly
    const coco = MeshBuilder.CreateSphere(`coco-drink-${idx}`, { diameter: 0.35, segments: 6 }, scene);
    coco.position.set(cx + 0.35, 1.35, 1.2);
    coco.material = materials.coconut;
    coco.parent = barNode;
  });

  // 3 Ghế đẩu cao chân tre trước quầy
  [-1.8, 0, 1.8].forEach((sx, idx) => {
    const stoolTop = MeshBuilder.CreateCylinder(`bar-stool-${idx}`, { diameter: 0.6, height: 0.1 }, scene);
    stoolTop.position.set(sx, 0.75, 2.2);
    stoolTop.material = materials.sandPlank;
    stoolTop.parent = barNode;

    const stoolLeg = MeshBuilder.CreateCylinder(`stool-leg-${idx}`, { diameter: 0.08, height: 0.75 }, scene);
    stoolLeg.position.set(sx, 0.38, 2.2);
    stoolLeg.material = materials.bambooBar;
    stoolLeg.parent = barNode;
  });

  // 2 Ván lướt sóng (Surfboards) dựng nghiêng bên hông quầy bar
  const surfboard1 = MeshBuilder.CreateBox('surfboard-1', { width: 0.65, height: 2.8, depth: 0.1 }, scene);
  surfboard1.position.set(3.8, 1.3, 0.8);
  surfboard1.rotation.z = -0.2;
  surfboard1.rotation.y = -0.3;
  surfboard1.material = materials.surfboard1;
  surfboard1.parent = barNode;
  shadows?.addShadowCaster(surfboard1);

  const surfboard2 = MeshBuilder.CreateBox('surfboard-2', { width: 0.65, height: 2.6, depth: 0.1 }, scene);
  surfboard2.position.set(4.2, 1.2, 0.4);
  surfboard2.rotation.z = -0.22;
  surfboard2.rotation.y = -0.15;
  surfboard2.material = materials.surfboard2;
  surfboard2.parent = barNode;
  shadows?.addShadowCaster(surfboard2);

  // === 3. KHU NGHỈ DƯỠNG TẮM NẮNG (SUN LOUNGERS & STRIPED UMBRELLAS) ===
  const resortUmbrellas = [
    { x: 14, z: 184, mat: materials.umbrellaOrange },
    { x: 22, z: 184, mat: materials.umbrellaBlue },
    { x: 30, z: 184, mat: materials.umbrellaYellow },
    { x: 38, z: 184, mat: materials.umbrellaOrange },
  ];

  resortUmbrellas.forEach((umb, i) => {
    // Cột ô
    const pole = MeshBuilder.CreateCylinder(`beach-umbrella-pole-${i}`, { height: 3.2, diameter: 0.1 }, scene);
    pole.position.set(umb.x, 1.6, umb.z);
    pole.material = materials.bambooBar;
    pole.parent = root;

    // Tán dù che nắng nón xòe rộng
    const canopy = MeshBuilder.CreateCylinder(`beach-umbrella-canopy-${i}`, {
      height: 0.9,
      diameterTop: 0.1,
      diameterBottom: 3.8,
      tessellation: 14,
    }, scene);
    canopy.position.set(umb.x, 3.2, umb.z);
    canopy.material = umb.mat;
    canopy.parent = root;
    shadows?.addShadowCaster(canopy);

    // Ghế tắm nắng gỗ có đệm nằm ngửa
    const lounger = MeshBuilder.CreateBox(`beach-lounger-${i}`, { width: 1.3, height: 0.25, depth: 2.6 }, scene);
    lounger.rotation.x = -0.22;
    lounger.position.set(umb.x, 0.35, umb.z - 1.4);
    lounger.material = materials.loungerWood;
    lounger.parent = root;
    shadows?.addShadowCaster(lounger);
  });

  // Lâu đài cát 3D (Sandcastle) nhỏ trên bãi cát
  const castleBase = MeshBuilder.CreateBox('sandcastle-base', { width: 1.4, height: 0.45, depth: 1.4 }, scene);
  castleBase.position.set(18, 0.25, 178);
  castleBase.material = materials.sandcastle;
  castleBase.parent = root;

  [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].forEach(([cx, cz], idx) => {
    const tower = MeshBuilder.CreateCylinder(`sand-tower-${idx}`, { diameter: 0.35, height: 0.6 }, scene);
    tower.position.set(18 + cx, 0.6, 178 + cz);
    tower.material = materials.sandcastle;
    tower.parent = root;
  });

  // Quả bóng bay bãi biển (Beach Ball)
  const beachBall = MeshBuilder.CreateSphere('beach-ball', { diameter: 0.7, segments: 10 }, scene);
  beachBall.position.set(25, 0.45, 178);
  beachBall.material = materials.umbrellaOrange;
  beachBall.parent = root;

  // === 4. THÁP CỨU HỘ BỜ BIỂN (LIFEGUARD TOWER) ===
  const towerNode = new TransformNode('lifeguard-tower', scene);
  towerNode.position.set(-8, 0, 178);
  towerNode.parent = root;

  // 4 Cột tháp cao 3.8m
  [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].forEach(([tx, tz], idx) => {
    const leg = MeshBuilder.CreateCylinder(`lifeguard-leg-${idx}`, { diameter: 0.16, height: 3.6 }, scene);
    leg.position.set(tx, 1.8, tz);
    leg.material = materials.lifeguardWhite;
    leg.parent = towerNode;
  });

  // Sàn quan sát
  const watchFloor = MeshBuilder.CreateBox('lifeguard-floor', { width: 2.8, height: 0.2, depth: 2.8 }, scene);
  watchFloor.position.set(0, 3.6, 0);
  watchFloor.material = materials.lifeguardRed;
  watchFloor.parent = towerNode;
  shadows?.addShadowCaster(watchFloor);

  // Mái che tháp cứu hộ
  const watchRoof = MeshBuilder.CreateBox('lifeguard-roof', { width: 3.2, height: 0.2, depth: 3.2 }, scene);
  watchRoof.position.set(0, 5.4, 0);
  watchRoof.material = materials.lifeguardRed;
  watchRoof.parent = towerNode;

  // Phao cứu sinh tròn (Lifebuoy) treo bên tháp
  const lifebuoy = MeshBuilder.CreateTorus('lifebuoy-ring', { diameter: 0.75, thickness: 0.18, tessellation: 16 }, scene);
  lifebuoy.rotation.x = Math.PI / 2;
  lifebuoy.position.set(1.45, 3.2, 0);
  lifebuoy.material = materials.lifeguardRed;
  lifebuoy.parent = towerNode;

  return root;
}
