import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';
import {
  applyBuoyancyToObject,
  createWaterfallFlowTexture,
  createStylizedWaterMaterial,
  createWaterRippleRingSystem,
} from '../nature/StylizedWaterEngine.js';

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
    timber: makeMat(scene, 'lake-pier-wood', '#6f4e37'),
    weatheredWood: makeMat(scene, 'lake-pier-plank', '#a78b71'),
    rope: makeMat(scene, 'lake-pier-rope', '#f59e0b'),
    boatHull: makeMat(scene, 'lake-boat-hull', '#0284c7', '#0369a1'),
    boatTrim: makeMat(scene, 'lake-boat-trim', '#f8fafc'),
    boatWood: makeMat(scene, 'lake-rowboat-wood', '#b45309'),
    sail: makeMat(scene, 'lake-boat-sail', '#fffdf5'),
    flagRed: makeMat(scene, 'lake-boat-flag', '#ef4444', '#dc2626'),
    lanternGlow: makeMat(scene, 'lake-lantern-glow', '#fef08a', '#f59e0b'),
    granite: makeMat(scene, 'waterfall-granite', '#788896'),
    graniteDark: makeMat(scene, 'waterfall-granite-dark', '#64748b'),
    pineFoliage: makeMat(scene, 'waterfall-pine-foliage', '#15803d'),
    pineFoliageDark: makeMat(scene, 'waterfall-pine-dark', '#166534'),
    pineTrunk: makeMat(scene, 'waterfall-pine-trunk', '#451a03'),
    water: makeMat(scene, 'waterfall-foam', '#e0f2fe', '#38bdf8'),
    mossyRock: makeMat(scene, 'lake-mossy-rock', '#86efac', '#15803d'),
    pebbleGrey: makeMat(scene, 'lake-pebble-grey', '#94a3b8'),
    lilyPad: makeMat(scene, 'lake-lily-pad', '#16a34a'),
    lotusPetal: makeMat(scene, 'lake-lotus-petal', '#f472b6', '#fbcfe8'),
    lotusCenter: makeMat(scene, 'lake-lotus-center', '#fde047', '#eab308'),
    tentCloth: makeMat(scene, 'lake-tent-cloth', '#f97316'),
    tentStripe: makeMat(scene, 'lake-tent-stripe', '#fffbeb'),
    fireEmbers: makeMat(scene, 'lake-campfire-embers', '#ef4444', '#f97316'),
    fireLog: makeMat(scene, 'lake-campfire-log', '#451a03'),
    whiteTrim: makeMat(scene, 'lake-white-trim', '#f8fafc'),
  };
  materials.water.alpha = 0.88;

  const root = new TransformNode('landmark-lake-district', scene);

  // === 1. PHỤ KIỆN BẾN CÂU CÁ TRÊN CẦU TÀU GỖ COZY FARMY ===
  // Đèn lồng bão cổ điển đầu cầu tàu (Fisherman's Storm Lantern)
  const lanternPost = MeshBuilder.CreateCylinder('lake-lantern-post', { height: 2.4, diameter: 0.14 }, scene);
  lanternPost.position.set(155.5, 1.4, 3.8);
  lanternPost.material = materials.timber;
  lanternPost.parent = root;

  const lanternArm = MeshBuilder.CreateBox('lake-lantern-arm', { width: 0.6, height: 0.1, depth: 0.1 }, scene);
  lanternArm.position.set(155.2, 2.4, 3.8);
  lanternArm.material = materials.timber;
  lanternArm.parent = root;

  const lanternBulb = MeshBuilder.CreateSphere('lake-lantern-bulb', { diameter: 0.45, segments: 8 }, scene);
  lanternBulb.position.set(155.0, 2.2, 3.8);
  lanternBulb.material = materials.lanternGlow;
  lanternBulb.material.disableLighting = true;
  lanternBulb.parent = root;

  // Cần câu cá cắm nghiêng trên thành cầu
  const fishingRod = MeshBuilder.CreateCylinder('lake-fishing-rod', { diameterTop: 0.02, diameterBottom: 0.08, height: 3.2 }, scene);
  fishingRod.position.set(152, 1.2, 0.2);
  fishingRod.rotation.z = -Math.PI / 4;
  fishingRod.rotation.y = 0.2;
  fishingRod.material = materials.timber;
  fishingRod.parent = root;

  // Thùng cá & Xô thiếc câu cá
  const fishBucket = MeshBuilder.CreateCylinder('lake-fish-bucket', { diameterTop: 0.4, diameterBottom: 0.3, height: 0.45 }, scene);
  fishBucket.position.set(151, 0.7, 1.5);
  fishBucket.material = materials.pebbleGrey;
  fishBucket.parent = root;

  // === 2. THUYỀN BUỒM & THUYỀN GỖ CHÈO NHẤP NHÔ (CHIBI BOATS) ===
  // Thuyền buồm lớn neo giữa lòng hồ nước sâu
  const sailboatNode = new TransformNode('lake-sailboat-node', scene);
  sailboatNode.position.set(175, 0.18, 12.0);
  sailboatNode.rotation.y = 0.52;
  sailboatNode.parent = root;

  // Thân thuyền buồm Chibi bo cong tròn xinh xắn
  const boatHull = MeshBuilder.CreateCylinder('sailboat-hull', {
    height: 4.8,
    diameterTop: 2.4,
    diameterBottom: 1.6,
    tessellation: 12,
  }, scene);
  boatHull.rotation.z = Math.PI / 2;
  boatHull.scaling.set(0.48, 1.0, 0.75);
  boatHull.position.y = 0.15;
  boatHull.material = materials.boatHull;
  boatHull.parent = sailboatNode;
  shadows?.addShadowCaster(boatHull);

  // Viền mạn thuyền trắng tinh tế (White Gunwale Rim)
  const boatRim = MeshBuilder.CreateTorus('sailboat-rim', {
    diameter: 2.3,
    thickness: 0.14,
    tessellation: 16,
  }, scene);
  boatRim.rotation.x = Math.PI / 2;
  boatRim.scaling.set(0.76, 1.0, 2.05);
  boatRim.position.y = 0.38;
  boatRim.material = materials.boatTrim;
  boatRim.parent = sailboatNode;

  // Phao cứu sinh móc sau lái thuyền
  const buoy = MeshBuilder.CreateTorus('sailboat-lifebuoy', { diameter: 0.65, thickness: 0.16, tessellation: 12 }, scene);
  buoy.rotation.y = Math.PI / 2;
  buoy.position.set(-2.3, 0.28, 0);
  buoy.material = materials.flagRed;
  buoy.parent = sailboatNode;

  // Cột buồm gỗ vươn cao
  const mast = MeshBuilder.CreateCylinder('boat-mast', { height: 5.2, diameter: 0.14 }, scene);
  mast.position.set(0.2, 2.6, 0);
  mast.material = materials.timber;
  mast.parent = sailboatNode;

  // Xà ngang đỡ buồm chính (Boom)
  const boom = MeshBuilder.CreateCylinder('boat-boom', { height: 2.8, diameter: 0.08 }, scene);
  boom.rotation.z = Math.PI / 2;
  boom.position.set(-1.1, 1.4, 0);
  boom.material = materials.timber;
  boom.parent = sailboatNode;

  // Cánh buồm chính màu kem mềm mại (Mainsail)
  const sail = MeshBuilder.CreateCylinder('boat-sail', {
    diameter: 3.8,
    height: 0.05,
    tessellation: 3,
  }, scene);
  sail.rotation.x = Math.PI / 2;
  sail.rotation.z = -0.15;
  sail.position.set(-1.1, 2.8, 0);
  sail.material = materials.sail;
  sail.parent = sailboatNode;
  shadows?.addShadowCaster(sail);

  // Buồm tam giác phụ phía trước (Jib Sail)
  const jib = MeshBuilder.CreateCylinder('boat-jib', {
    diameter: 2.8,
    height: 0.04,
    tessellation: 3,
  }, scene);
  jib.rotation.x = Math.PI / 2;
  jib.rotation.z = 0.55;
  jib.position.set(1.1, 2.3, 0);
  jib.material = materials.sail;
  jib.parent = sailboatNode;

  // Cờ hiệu tam giác đỏ tung bay trên đỉnh cột buồm (Pennant Flag)
  const flag = MeshBuilder.CreateCylinder('boat-flag', {
    diameter: 0.6,
    height: 0.03,
    tessellation: 3,
  }, scene);
  flag.rotation.x = Math.PI / 2;
  flag.position.set(-0.32, 5.1, 0);
  flag.material = materials.flagRed;
  flag.parent = sailboatNode;

  // Chiếc thuyền chèo gỗ nhỏ (Rowboat) neo ở mạn bến tàu dài trong nước sâu
  const rowboatNode = new TransformNode('lake-rowboat-node', scene);
  rowboatNode.position.set(157, 0.15, -4.5);
  rowboatNode.rotation.y = -0.28;
  rowboatNode.parent = root;

  const rowboatHull = MeshBuilder.CreateCylinder('rowboat-hull', {
    height: 3.4,
    diameterTop: 1.6,
    diameterBottom: 1.0,
    tessellation: 8,
  }, scene);
  rowboatHull.rotation.z = Math.PI / 2;
  rowboatHull.scaling.set(0.4, 1.0, 0.7);
  rowboatHull.position.y = 0.12;
  rowboatHull.material = materials.boatWood;
  rowboatHull.parent = rowboatNode;
  shadows?.addShadowCaster(rowboatHull);

  // Ghế ngồi ngang thuyền chèo
  const rowSeat = MeshBuilder.CreateBox('rowboat-seat', { width: 0.45, height: 0.08, depth: 1.0 }, scene);
  rowSeat.position.set(0, 0.22, 0);
  rowSeat.material = materials.timber;
  rowSeat.parent = rowboatNode;

  // 2 Mái chèo gỗ gác ngang
  [-0.6, 0.6].forEach((ox, idx) => {
    const oar = MeshBuilder.CreateCylinder(`rowboat-oar-${idx}`, { diameter: 0.06, height: 2.2 }, scene);
    oar.position.set(ox, 0.35, 0);
    oar.rotation.z = (idx === 0 ? 0.35 : -0.35);
    oar.rotation.x = Math.PI / 2;
    oar.material = materials.timber;
    oar.parent = rowboatNode;
  });

  // Hiệu ứng dập dềnh bồng bềnh Play Together cho thuyền buồm và thuyền chèo
  const sailboatBase = new Vector3(175, 0.18, 12.0);
  const sailboatRot = new Vector3(0, 0.52, 0);
  const rowboatBase = new Vector3(157, 0.15, -4.5);
  const rowboatRot = new Vector3(0, -0.28, 0);

  scene.onBeforeRenderObservable.add(() => {
    if (scene.isDisposed || sailboatNode.isDisposed() || rowboatNode.isDisposed()) return;
    const t = performance.now() * 0.001;
    applyBuoyancyToObject(sailboatNode, sailboatBase, sailboatRot, t, {
      amplitude: 0.038,
      frequency: 1.5,
      rollAmplitude: 0.035,
      pitchAmplitude: 0.025,
      phase: 0.2,
    });
    applyBuoyancyToObject(rowboatNode, rowboatBase, rowboatRot, t, {
      amplitude: 0.030,
      frequency: 1.7,
      rollAmplitude: 0.040,
      pitchAmplitude: 0.030,
      phase: 1.8,
    });
  });

  // === 3. HOA SÚNG NỔI & ĐÁ CUỘI VEN BỜ (WATER LILIES & PEBBLES) ===
  const lilyCoords = [
    [155, 0.12, 10], [158, 0.12, 8], [152, 0.12, 14],
    [160, 0.12, -10], [163, 0.12, -8], [148, 0.12, -12],
    [172, 0.12, 12], [175, 0.12, 15]
  ];

  lilyCoords.forEach(([lx, ly, lz], idx) => {
    const pad = MeshBuilder.CreateCylinder(`lily-pad-${idx}`, { diameter: 1.2, height: 0.03, tessellation: 16 }, scene);
    pad.position.set(lx, ly, lz);
    pad.material = materials.lilyPad;
    pad.parent = root;

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

  // Đá cuội mịn tự nhiên ven bờ hồ
  const rockCoords = [
    [138, 0.35, 8, 1.2], [142, 0.30, 12, 0.9], [136, 0.40, -6, 1.4],
    [140, 0.35, -14, 1.1], [158, 0.40, -22, 1.3], [168, 0.45, -18, 1.5]
  ];
  rockCoords.forEach(([rx, ry, rz, rs], idx) => {
    const rock = MeshBuilder.CreateSphere(`lake-mossy-rock-${idx}`, { diameter: rs, segments: 6 }, scene);
    rock.scaling.set(1.4, 0.65, 1.1);
    rock.position.set(rx, ry, rz);
    rock.material = (idx % 2 === 0) ? materials.pebbleGrey : materials.mossyRock;
    rock.parent = root;
    shadows?.addShadowCaster(rock);
  });

  // === 4. CẦU VÒM GỖ UỐN CONG NGHỆ THUẬT PLAY TOGETHER (CURVED TIMBER ARCH FOOTBRIDGE) ===
  // Nối liền mạch vững chãi từ bờ Nam đất liền khô ráo (165.6, -70.8) sang thềm Đảo Vọng Lâu Trà Thất (196.0, -10.0)
  // Có mố cầu đá vững chãi hai đầu, bậc thềm dẫn dốc êm từ mặt đất lên sàn vòm cao 2.45m vượt hoàn toàn trên mặt nước, triệt tiêu 100% lỗi cầu cụt
  const bridgeRoot = new TransformNode('lake-arch-bridge', scene);
  bridgeRoot.position.set(180.8, 0.22, -40.4);
  bridgeRoot.rotation.y = -1.107;
  bridgeRoot.parent = root;

  const spanX = 68.0;
  const numPlanks = 82;
  const archRise = 2.45; // Vòm cong thanh thoát cao 2.45m giữa nhịp, cano & thuyền lướt êm bên dưới
  const plankWidth = 0.80;
  const bridgeWidth = 3.8;

  // Hàm tính chiều cao y parabol: y(x) = archRise * (1 - (x / (spanX/2))^2)
  const calcArchY = (x) => archRise * (1 - Math.pow(x / (spanX * 0.5), 2));
  const calcArchSlope = (x) => -2 * archRise * x / Math.pow(spanX * 0.5, 2);

  // 82 tấm ván sàn uốn lượn liên tục theo cung vòm
  for (let i = 0; i < numPlanks; i++) {
    const px = -spanX * 0.5 + (i + 0.5) * (spanX / numPlanks);
    const py = calcArchY(px) + 0.14;
    const slope = calcArchSlope(px);
    const rotZ = -Math.atan(slope);

    const plank = MeshBuilder.CreateBox(`bridge-plank-${i}`, {
      width: plankWidth,
      height: 0.16,
      depth: bridgeWidth,
    }, scene);
    plank.position.set(px, py, 0);
    plank.rotation.z = rotZ;
    plank.material = (i % 2 === 0) ? materials.timber : materials.weatheredWood;
    plank.checkCollisions = true;
    plank.parent = bridgeRoot;
    shadows?.addShadowCaster(plank);
  }

  // Mố cầu đá hoa cương & bậc thềm dẫn hai đầu cầu (Solid Stone Abutments & Steps)
  // Kết nối êm thuận từ mặt đường đất liền lên sàn cầu, triệt tiêu hoàn toàn hiện tượng bước hụt xuống nước
  [-1, 1].forEach((endDir, endIdx) => {
    const endX = endDir * (spanX * 0.5 + 2.0);
    const abutment = MeshBuilder.CreateBox(`bridge-stone-abutment-${endIdx}`, {
      width: 4.2,
      height: 0.48,
      depth: bridgeWidth + 0.4,
    }, scene);
    abutment.position.set(endX, 0.08, 0);
    abutment.material = materials.pebbleGrey;
    abutment.checkCollisions = true;
    abutment.parent = bridgeRoot;
    shadows?.addShadowCaster(abutment);

    // Bậc thềm đá dẫn tiếp cận cắm sâu vào đất liền và sân đảo
    const stepX = endDir * (spanX * 0.5 + 3.8);
    const step = MeshBuilder.CreateBox(`bridge-stone-step-${endIdx}`, {
      width: 2.2,
      height: 0.24,
      depth: bridgeWidth + 0.2,
    }, scene);
    step.position.set(stepX, -0.02, 0);
    step.material = materials.pebbleGrey;
    step.checkCollisions = true;
    step.parent = bridgeRoot;

    // Tại đầu bờ đất liền (endDir = -1), bổ sung các phiến đá bước dạo dẫn từ thềm cỏ tự nhiên vào cầu
    if (endDir === -1) {
      [-39.5, -41.5, -43.5].forEach((stoneX, sIdx) => {
        const stone = MeshBuilder.CreateCylinder(`bridge-approach-stone-${sIdx}`, {
          height: 0.14,
          diameter: 1.8 - sIdx * 0.2,
          tessellation: 8,
        }, scene);
        stone.scaling.set(1.0, 1.0, 1.25);
        stone.position.set(stoneX, 0.05, (sIdx % 2 === 0 ? 0.2 : -0.2));
        stone.material = materials.pebbleGrey;
        stone.checkCollisions = true;
        stone.parent = bridgeRoot;
      });
    }

    // Cột trụ đá hoa cương đầu cầu có đèn đá ấm
    [-bridgeWidth * 0.5 - 0.1, bridgeWidth * 0.5 + 0.1].forEach((pz, pSide) => {
      const stonePillar = MeshBuilder.CreateCylinder(`bridge-head-stone-pillar-${endIdx}-${pSide}`, {
        height: 1.35,
        diameter: 0.42,
        tessellation: 8,
      }, scene);
      stonePillar.position.set(endDir * (spanX * 0.5 + 0.2), 0.75, pz);
      stonePillar.material = materials.pebbleGrey;
      stonePillar.parent = bridgeRoot;
      shadows?.addShadowCaster(stonePillar);

      const lampGlow = MeshBuilder.CreateSphere(`bridge-head-lamp-${endIdx}-${pSide}`, { diameter: 0.36, segments: 6 }, scene);
      lampGlow.position.set(endDir * (spanX * 0.5 + 0.2), 1.55, pz);
      lampGlow.material = materials.lanternGlow;
      lampGlow.material.disableLighting = true;
      lampGlow.parent = bridgeRoot;
    });
  });

  // 6 Cặp trụ cọc gỗ cắm đáy hồ có dầm giằng ngang chịu lực
  [-25.0, -15.0, -5.0, 5.0, 15.0, 25.0].forEach((px, idx) => {
    const py = calcArchY(px);
    [-1.9, 1.9].forEach((pz, side) => {
      const pile = MeshBuilder.CreateCylinder(`bridge-pile-${idx}-${side}`, {
        height: py + 1.6,
        diameter: 0.32,
        tessellation: 8,
      }, scene);
      pile.position.set(px, (py - 1.6) * 0.5, pz);
      pile.material = materials.timber;
      pile.parent = bridgeRoot;
      shadows?.addShadowCaster(pile);
    });

    const crossBeam = MeshBuilder.CreateBox(`bridge-crossbeam-${idx}`, {
      width: 0.26,
      height: 0.26,
      depth: bridgeWidth - 0.2,
    }, scene);
    crossBeam.position.set(px, py - 0.05, 0);
    crossBeam.material = materials.timber;
    crossBeam.parent = bridgeRoot;
  });

  // Lan can uốn lượn hai bên cầu với các cột con & tay vịn gỗ
  [-bridgeWidth * 0.5 + 0.12, bridgeWidth * 0.5 - 0.12].forEach((pz, side) => {
    const numPosts = 34;
    for (let p = 0; p <= numPosts; p++) {
      const px = -spanX * 0.5 + p * (spanX / numPosts);
      const py = calcArchY(px);
      const post = MeshBuilder.CreateCylinder(`bridge-post-${side}-${p}`, {
        height: 1.15,
        diameter: 0.15,
        tessellation: 8,
      }, scene);
      post.position.set(px, py + 0.70, pz);
      post.material = materials.timber;
      post.parent = bridgeRoot;
      shadows?.addShadowCaster(post);
    }

    for (let p = 0; p < numPosts; p++) {
      const x1 = -spanX * 0.5 + p * (spanX / numPosts);
      const x2 = -spanX * 0.5 + (p + 1) * (spanX / numPosts);
      const mx = (x1 + x2) * 0.5;
      const my = calcArchY(mx) + 1.22;
      const slope = calcArchSlope(mx);
      const segLen = Math.hypot(x2 - x1, calcArchY(x2) - calcArchY(x1));

      const railSeg = MeshBuilder.CreateBox(`bridge-handrail-${side}-${p}`, {
        width: segLen + 0.04,
        height: 0.12,
        depth: 0.14,
      }, scene);
      railSeg.position.set(mx, my, pz);
      railSeg.rotation.z = -Math.atan(slope);
      railSeg.material = materials.weatheredWood;
      railSeg.parent = bridgeRoot;

      const midRail = MeshBuilder.CreateBox(`bridge-midrail-${side}-${p}`, {
        width: segLen + 0.02,
        height: 0.06,
        depth: 0.06,
      }, scene);
      midRail.position.set(mx, my - 0.48, pz);
      midRail.rotation.z = -Math.atan(slope);
      midRail.material = materials.rope;
      midRail.parent = bridgeRoot;
    }
  });

  // 4 Đèn lồng bão cổ điển tỏa ánh sáng vàng ấm ở 4 góc lan can gỗ
  [
    { x: -spanX * 0.5 + 0.2, z: -bridgeWidth * 0.5 + 0.12 },
    { x: -spanX * 0.5 + 0.2, z: bridgeWidth * 0.5 - 0.12 },
    { x: spanX * 0.5 - 0.2, z: -bridgeWidth * 0.5 + 0.12 },
    { x: spanX * 0.5 - 0.2, z: bridgeWidth * 0.5 - 0.12 },
  ].forEach((lp, lIdx) => {
    const lPost = MeshBuilder.CreateCylinder(`bridge-corner-post-${lIdx}`, { height: 1.6, diameter: 0.20 }, scene);
    lPost.position.set(lp.x, 0.95, lp.z);
    lPost.material = materials.timber;
    lPost.parent = bridgeRoot;

    const lantern = MeshBuilder.CreateSphere(`bridge-lantern-glow-${lIdx}`, { diameter: 0.38, segments: 6 }, scene);
    lantern.position.set(lp.x, 1.82, lp.z);
    lantern.material = materials.lanternGlow;
    lantern.material.disableLighting = true;
    lantern.parent = bridgeRoot;
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
  campfireRing.material = materials.pebbleGrey;
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

  // === 6. THÁC NƯỚC NÚI ĐÔI TẦNG BẬC TỰ NHIÊN & RỪNG THÔNG ĐỈNH NÚI (PLAY TOGETHER TIERED ALPINE WATERFALL) ===
  // Không dùng khối hộp vuông góc Aztec, dùng các phiến đá hoa cương bo góc đa diện mềm mại tự nhiên
  const cliffNode = new TransformNode('waterfall-mountain-group', scene);
  cliffNode.position.set(196, 0, 30);
  cliffNode.parent = root;

  // Tầng 1: Chân núi đá tự nhiên rộng lớn (Base Natural Mountain Bluff)
  const baseTerrace = MeshBuilder.CreateCylinder('waterfall-base-rock', {
    diameterTop: 18.0,
    diameterBottom: 22.0,
    height: 4.0,
    tessellation: 8,
  }, scene);
  baseTerrace.scaling.set(1.15, 1.0, 0.65);
  baseTerrace.position.set(0, 2.0, 3.2);
  baseTerrace.material = materials.granite;
  baseTerrace.parent = cliffNode;
  shadows?.addShadowCaster(baseTerrace);

  // Tầng 2: Vách núi tầng giữa lùi sâu (Mid Mountain Escarpment)
  const midEscarpment = MeshBuilder.CreateCylinder('waterfall-mid-rock', {
    diameterTop: 14.0,
    diameterBottom: 17.5,
    height: 4.4,
    tessellation: 7,
  }, scene);
  midEscarpment.scaling.set(1.1, 1.0, 0.62);
  midEscarpment.position.set(0, 5.4, 4.2);
  midEscarpment.material = materials.graniteDark;
  midEscarpment.parent = cliffNode;
  shadows?.addShadowCaster(midEscarpment);

  // Tầng 3: Đỉnh sườn núi cao nguyên (Upper Mountain Crest)
  const topCrest = MeshBuilder.CreateCylinder('waterfall-top-crest', {
    diameterTop: 9.5,
    diameterBottom: 13.5,
    height: 3.2,
    tessellation: 7,
  }, scene);
  topCrest.scaling.set(1.1, 1.0, 0.60);
  topCrest.position.set(0, 8.2, 5.0);
  topCrest.material = materials.granite;
  topCrest.parent = cliffNode;
  shadows?.addShadowCaster(topCrest);

  // Sườn núi phụ hai bên hẻm đá bo tròn tự nhiên (Left & Right Flanking Mountain Buttes)
  const shoulderLeft = MeshBuilder.CreateCylinder('waterfall-shoulder-left', {
    diameterTop: 7.2,
    diameterBottom: 10.5,
    height: 6.8,
    tessellation: 6,
  }, scene);
  shoulderLeft.position.set(-9.2, 3.4, 1.5);
  shoulderLeft.rotation.y = 0.25;
  shoulderLeft.material = materials.granite;
  shoulderLeft.parent = cliffNode;
  shadows?.addShadowCaster(shoulderLeft);

  const shoulderRight = MeshBuilder.CreateCylinder('waterfall-shoulder-right', {
    diameterTop: 7.2,
    diameterBottom: 10.5,
    height: 6.8,
    tessellation: 6,
  }, scene);
  shoulderRight.position.set(9.2, 3.4, 1.5);
  shoulderRight.rotation.y = -0.25;
  shoulderRight.material = materials.graniteDark;
  shoulderRight.parent = cliffNode;
  shadows?.addShadowCaster(shoulderRight);

  // Thềm đá tầng giữa đón dòng nước trên dội xuống (Mid Splash Shelf)
  const midShelf = MeshBuilder.CreateCylinder('waterfall-mid-shelf', {
    diameterTop: 9.0,
    diameterBottom: 10.5,
    height: 0.85,
    tessellation: 8,
  }, scene);
  midShelf.scaling.set(1.2, 1.0, 0.55);
  midShelf.position.set(0, 3.6, -1.0);
  midShelf.material = materials.granite;
  midShelf.parent = cliffNode;

  // 5 Cây thông núi Alpine trên đỉnh vách đá (Mountain Pine Ridge Framing)
  const pineCoords = [
    { x: -5.5, z: 4.8, h: 4.2 },
    { x: -2.8, z: 5.4, h: 4.8 },
    { x: 0.2, z: 5.8, h: 5.2 },
    { x: 3.2, z: 5.2, h: 4.6 },
    { x: 6.0, z: 4.6, h: 4.0 },
  ];
  pineCoords.forEach((p, pIdx) => {
    const pTrunk = MeshBuilder.CreateCylinder(`waterfall-pine-trunk-${pIdx}`, {
      height: 1.6,
      diameter: 0.32,
      tessellation: 6,
    }, scene);
    pTrunk.position.set(p.x, 8.8 + 0.8, p.z);
    pTrunk.material = materials.pineTrunk;
    pTrunk.parent = cliffNode;

    // 3 tầng tán lá thông nón đặc trưng Play Together
    for (let t = 0; t < 3; t++) {
      const cone = MeshBuilder.CreateCylinder(`waterfall-pine-cone-${pIdx}-${t}`, {
        diameterTop: 0.2,
        diameterBottom: 2.2 - t * 0.45,
        height: 1.4,
        tessellation: 7,
      }, scene);
      cone.position.set(p.x, 9.6 + t * 0.95, p.z);
      cone.material = (pIdx % 2 === 0) ? materials.pineFoliage : materials.pineFoliageDark;
      cone.parent = cliffNode;
      shadows?.addShadowCaster(cone);
    }
  });

  // Đá hoa cương tự nhiên rải rác quanh chân hồ đón nước thác & đá bước chân
  [
    { name: 'waterfall-boulder-l1', x: -4.5, y: 0.8, z: -2.8, s: 1.8 },
    { name: 'waterfall-boulder-r1', x: 4.5, y: 0.8, z: -2.8, s: 1.8 },
    { name: 'waterfall-boulder-l2', x: -6.2, y: 0.5, z: -4.2, s: 1.4 },
    { name: 'waterfall-boulder-r2', x: 6.2, y: 0.5, z: -4.2, s: 1.4 },
    { name: 'waterfall-step-stone-1', x: -1.8, y: 0.18, z: -4.5, s: 1.1 },
    { name: 'waterfall-step-stone-2', x: 1.8, y: 0.18, z: -4.5, s: 1.1 },
  ].forEach(b => {
    const rock = MeshBuilder.CreateSphere(b.name, { diameter: b.s, segments: 6 }, scene);
    rock.scaling.set(1.2, 0.6, 1.1);
    rock.position.set(b.x, b.y, b.z);
    rock.material = materials.granite;
    rock.parent = cliffNode;
    shadows?.addShadowCaster(rock);
  });

  // Texture và vật liệu dòng nước thác cuồn cuộn Play Together
  const waterfallTex = createWaterfallFlowTexture(scene, 512);
  const matWaterfallFlow = createStylizedWaterMaterial(scene, 'waterfall-stream-mat', waterfallTex, {
    diffuseColor: Color3.FromHexString('#e0f2fe'),
    specularColor: new Color3(1.0, 1.0, 1.0),
    specularPower: 80,
    alpha: 0.94,
  });

  const matFoam = makeMat(scene, 'waterfall-foam-shelf-mat', '#ffffff', '#e0f2fe');
  matFoam.disableLighting = true;

  // Tầng thác trên (Upper Tier Cascade Sheet)
  const waterFlowUpper = MeshBuilder.CreateBox('waterfall-flow-upper', {
    width: 6.8,
    height: 4.2,
    depth: 0.35,
  }, scene);
  waterFlowUpper.rotation.x = -0.10;
  waterFlowUpper.position.set(0, 5.8, -0.6);
  waterFlowUpper.material = matWaterfallFlow;
  waterFlowUpper.parent = cliffNode;

  // Dải bọt trắng xóa va đập trên thềm đá tầng giữa (Mid-shelf Churning Foam)
  const midFroth = MeshBuilder.CreateBox('waterfall-mid-froth', {
    width: 7.2,
    height: 0.35,
    depth: 1.2,
  }, scene);
  midFroth.position.set(0, 3.8, -1.4);
  midFroth.material = matFoam;
  midFroth.parent = cliffNode;

  // Tầng thác dưới (Lower Cataract Plunging Sheet)
  const waterFlow = MeshBuilder.CreateBox('waterfall-flow', {
    width: 7.5,
    height: 3.6,
    depth: 0.38,
  }, scene);
  waterFlow.rotation.x = -0.16;
  waterFlow.position.set(0, 1.8, -2.4);
  waterFlow.material = matWaterfallFlow;
  waterFlow.parent = cliffNode;

  // Vành bọt trắng sủi tăm cuồn cuộn chân thác (Plunge Pool Boiling Froth Ring)
  const plungeFroth = MeshBuilder.CreateTorus('waterfall-plunge-froth', {
    diameter: 7.8,
    thickness: 0.55,
    tessellation: 24,
  }, scene);
  plungeFroth.position.set(0, 0.15, -3.4);
  plungeFroth.scaling.set(1.15, 0.45, 0.85);
  plungeFroth.material = matFoam;
  plungeFroth.parent = cliffNode;

  // Hệ thống vòng sóng nước lan tỏa từ chân thác ra khắp lòng hồ
  const waterfallRipple = createWaterRippleRingSystem(scene, root, {
    center: new Vector3(196, 0.14, 26.6),
    maxRadius: 5.8,
    minRadius: 1.0,
    speed: 0.85,
    count: 3,
    color: '#ffffff',
    prefix: 'waterfall-plunge-ripple',
  });

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
  mist.emitter = new Vector3(196, 0.4, 26.6);
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

  // Animation thác nước cuồn cuộn đổ từ trên cao & vòng sóng lan tỏa
  let lastWTime = performance.now();
  const waterfallObserver = scene.onBeforeRenderObservable.add(() => {
    if (scene.isDisposed || root.isDisposed()) {
      scene.onBeforeRenderObservable.remove(waterfallObserver);
      return;
    }
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastWTime) * 0.001);
    lastWTime = now;
    const nowSec = now * 0.001;

    // Cuộn UV nước thác chảy xiết xuống dưới
    if (waterfallTex.vOffset !== undefined) {
      waterfallTex.vOffset -= dt * 2.2;
    }

    // Vành bọt chân thác co giãn sủi bọt
    const frothPulse = Math.sin(nowSec * 3.6) * 0.06;
    plungeFroth.scaling.set(1.15 + frothPulse, 0.45, 0.85 + frothPulse);

    // Cập nhật vòng sóng nước lan tỏa từ chân thác
  });

  return {
    root,
    sailboatNode,
    rowboatNode,
    mist,
    waterfallRipple,
    dispose() {
      scene.onBeforeRenderObservable.remove(waterfallObserver);
      waterfallRipple.dispose();
      waterfallTex.dispose();
      matWaterfallFlow.dispose();
      matFoam.dispose();
      root.dispose(false, true);
    },
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

  // Biển hiệu gỗ: 🍹 TIKI COCONUT BAR 🥥 (1024x256 High-Res)
  const dtBar = new DynamicTexture('dt-bar-sign', { width: 1024, height: 256 }, scene, false, Texture.TRILINEAR_SAMPLINGMODE);
  dtBar.anisotropicFilteringLevel = 16;
  dtBar.hasAlpha = true;
  const ctxB = dtBar.getContext();
  ctxB.imageSmoothingEnabled = true;
  ctxB.imageSmoothingQuality = 'high';
  ctxB.clearRect(0, 0, 1024, 256);
  ctxB.fillStyle = '#451a03';
  ctxB.beginPath();
  ctxB.roundRect(16, 16, 992, 224, 36);
  ctxB.fill();
  ctxB.strokeStyle = '#f59e0b';
  ctxB.lineWidth = 16;
  ctxB.stroke();
  dtBar.drawText('🍹 TIKI COCONUT BAR 🥥', null, 152, 'bold 68px Arial', '#ffffff', null, true, true);

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

  // === 5. KHU NGHỈ DƯỠNG GLAMPING VEN BIỂN (COZY SEASIDE GLAMPING RESORT) ===
  const glampingNode = new TransformNode('beach-glamping-resort', scene);
  glampingNode.position.set(-36, 0, 194);
  glampingNode.parent = root;

  const matCanvas = makeMat(scene, 'glamping-canvas-mat', '#fefce8');
  const matDeck = materials.sandPlank;
  const matEmber = makeMat(scene, 'glamping-ember-mat', '#ef4444', '#f97316');
  const matLog = makeMat(scene, 'glamping-log-mat', '#451a03');

  // 2 Lều Glamping Bell nón chóp cao sang trọng có sàn gỗ ngắm biển
  [-6, 6].forEach((tx, idx) => {
    // Sàn gỗ nâng chân chống cát
    const deck = MeshBuilder.CreateCylinder(`glamping-deck-${idx}`, { diameter: 5.6, height: 0.25, tessellation: 20 }, scene);
    deck.position.set(tx, 0.12, 0);
    deck.material = matDeck;
    deck.parent = glampingNode;
    deck.receiveShadows = true;

    // Lều vải nón chóp cao ấm cúng
    const tent = MeshBuilder.CreateCylinder(`glamping-tent-${idx}`, { diameterTop: 0.2, diameterBottom: 5.0, height: 3.4, tessellation: 16 }, scene);
    tent.position.set(tx, 1.8, 0);
    tent.material = matCanvas;
    tent.parent = glampingNode;
    shadows?.addShadowCaster(tent);

    // Mái che cửa lều chữ V
    const awning = MeshBuilder.CreateCylinder(`glamping-entry-${idx}`, { diameter: 2.2, height: 1.4, tessellation: 3 }, scene);
    awning.rotation.z = Math.PI / 2;
    awning.rotation.y = Math.PI / 2;
    awning.position.set(tx, 1.1, 2.3);
    awning.material = matCanvas;
    awning.parent = glampingNode;

    // Đèn lồng ấm treo trước cửa lều
    const lantern = MeshBuilder.CreateSphere(`glamping-lantern-${idx}`, { diameter: 0.35, segments: 8 }, scene);
    lantern.position.set(tx, 1.9, 2.6);
    lantern.material = makeMat(scene, `glamping-lantern-mat-${idx}`, '#fef08a', '#fbbf24');
    lantern.parent = glampingNode;
  });

  // Đống lửa trại bờ cát nướng kẹo dẻo giữa 2 lều
  const campRing = MeshBuilder.CreateTorus('glamping-fire-ring', { diameter: 1.8, thickness: 0.25, tessellation: 12 }, scene);
  campRing.position.set(0, 0.12, -4.5);
  campRing.material = materials.sandcastle;
  campRing.parent = glampingNode;

  const campEmber = MeshBuilder.CreateSphere('glamping-fire-ember', { diameter: 0.9, segments: 8 }, scene);
  campEmber.position.set(0, 0.22, -4.5);
  campEmber.material = matEmber;
  campEmber.parent = glampingNode;

  // Ghế thân cây trôi dạt (Driftwood Benches) quây quanh lửa
  [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((ang, bIdx) => {
    const bench = MeshBuilder.CreateCylinder(`glamping-driftwood-${bIdx}`, { diameter: 0.42, height: 1.8 }, scene);
    bench.rotation.z = Math.PI / 2;
    bench.rotation.y = ang;
    bench.position.set(Math.sin(ang) * 1.8, 0.22, -4.5 + Math.cos(ang) * 1.8);
    bench.material = matLog;
    bench.parent = glampingNode;
  });

  return root;
}
