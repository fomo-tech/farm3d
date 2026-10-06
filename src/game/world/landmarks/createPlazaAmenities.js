import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { createToyMaterial } from '../../rendering/PlayTogetherTheme.js';
import { createRusticSignboard } from '../worldDesignSystem.js';

function makeMat(scene, name, hex, emissiveHex = null, specular = 0.5, specularPower = 64) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.5);
  m.specularColor = new Color3(specular, specular, specular);
  m.specularPower = specularPower;
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

export function createCafeDeck(scene, root, deckMaterial) {
  // Plaza top is y=0.12. Keep the cafe's entire upper surface above it;
  // the old deck top was also y=0.12 and z-fought with the plaza disc.
  const deck = MeshBuilder.CreateBox('cafe-outdoor-deck', { width: 11.5, height: 0.18, depth: 8.2 }, scene);
  deck.position.set(0, 0.23, 0); // bottom .14, top .32
  deck.material = deckMaterial;
  deck.parent = root;
  deck.receiveShadows = true;
  return deck;
}

/**
 * 1. SÂN KHẤU DJ CONCERT STAGE & SÀN NHẢY DISCO DANCE FLOOR (PLAY TOGETHER SOCIAL METAVERSE)
 * - Bục sân khấu nâng cao vát cong hiện đại phủ carbon đen & viền chrome
 * - Màn hình LED cong khổng lồ hiển thị sóng âm Equalizer phát sáng rực rỡ "KAIA LIVE STAGE"
 * - Bàn DJ hiện đại: Console mixer đa kênh, 2 mâm xoay đĩa than phát sáng neon, tai nghe DJ, laptop
 * - Hệ thống âm thanh Line Array công suất lớn hai bên cánh sân khấu + 4 loa Subwoofer
 * - 4 Đèn pha Moving Head / Laser Beam xoay quét ánh sáng lên bầu trời đêm (cyan, magenta, gold, violet)
 * - Sàn nhảy Disco Dance Floor 5x5 ô gạch kính phát sáng đa sắc màu phía trước sân khấu cho cư dân tụ tập
 */
export function createConcertStage(scene, shadows, position = { x: 28, y: 0, z: 0 }, rotationY = -Math.PI / 2) {
  const root = new TransformNode('pt-concert-stage-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.rotation.y = rotationY;

  const mats = {
    carbonBase: makeMat(scene, 'stage-carbon-dark', '#0f172a', null, 0.4, 90),
    stageFloor: makeMat(scene, 'stage-floor-black', '#1e293b', null, 0.6, 120),
    chromeTrim: makeMat(scene, 'stage-chrome', '#f8fafc', null, 0.9, 128),
    trussMetal: makeMat(scene, 'stage-truss-metal', '#475569', null, 0.5, 60),
    neonCyan: makeMat(scene, 'stage-neon-cyan', '#00f2fe', '#38bdf8', 0.9, 128),
    neonPink: makeMat(scene, 'stage-neon-pink', '#f43f5e', '#fb7185', 0.9, 128),
    neonGold: makeMat(scene, 'stage-neon-gold', '#fbbf24', '#f59e0b', 0.95, 128),
    speakerBlack: makeMat(scene, 'stage-speaker-black', '#020617', null, 0.3, 40),
    speakerCone: makeMat(scene, 'stage-speaker-cone', '#334155', null, 0.6, 80),
    acrylicGlow: makeMat(scene, 'stage-acrylic-glow', '#bae6fd', '#38bdf8', 0.85, 120),
  };
  mats.acrylicGlow.alpha = 0.88;

  // 1. Khối đế bục sân khấu vát góc nâng cao 1.1m (12m x 7m)
  const basePlinth = MeshBuilder.CreateBox('stage-main-plinth', {
    width: 12.0,
    height: 1.1,
    depth: 7.0,
  }, scene);
  basePlinth.position.y = 0.55;
  basePlinth.material = mats.carbonBase;
  basePlinth.parent = root;
  basePlinth.receiveShadows = true;

  // Sàn diễn bóng loáng phản chiếu ánh sáng
  const stageDeck = MeshBuilder.CreateBox('stage-deck', {
    width: 11.6,
    height: 0.12,
    depth: 6.6,
  }, scene);
  stageDeck.position.y = 1.16;
  stageDeck.material = mats.stageFloor;
  stageDeck.parent = root;

  // Dải LED Neon Cyan chạy viền toàn bộ mép trước sân khấu
  const frontNeonStrip = MeshBuilder.CreateBox('stage-front-neon', {
    width: 11.8,
    height: 0.16,
    depth: 0.16,
  }, scene);
  frontNeonStrip.position.set(0, 1.12, 3.52);
  frontNeonStrip.material = mats.neonCyan;
  frontNeonStrip.parent = root;

  // Bậc tam cấp acrylic phát sáng hai bên đón nghệ sĩ lên sàn
  [-6.2, 6.2].forEach((sx, sidx) => {
    for (let st = 0; st < 3; st++) {
      const step = MeshBuilder.CreateBox(`stage-step-${sidx}-${st}`, {
        width: 0.9,
        height: 0.28,
        depth: 1.6,
      }, scene);
      step.position.set(sx + (sidx === 0 ? -st * 0.45 : st * 0.45), 0.14 + st * 0.32, 1.5);
      step.material = mats.acrylicGlow;
      step.parent = root;
    }
  });

  // 2. Khung giàn không gian nhôm (Overhead Aluminum Truss Rig)
  const trussWidth = 12.2;
  const trussHeight = 6.4;
  const trussDepth = 6.8;

  const pillarCols = [
    [-trussWidth / 2, -trussDepth / 2],
    [trussWidth / 2, -trussDepth / 2],
    [-trussWidth / 2, trussDepth / 2],
    [trussWidth / 2, trussDepth / 2],
  ];

  pillarCols.forEach(([px, pz], pidx) => {
    const col = MeshBuilder.CreateBox(`stage-truss-col-${pidx}`, {
      width: 0.45,
      height: trussHeight,
      depth: 0.45,
    }, scene);
    col.position.set(px, trussHeight / 2 + 1.1, pz);
    col.material = mats.trussMetal;
    col.parent = root;
    shadows?.addShadowCaster(col);
  });

  // Dầm ngang truss trên cao
  const topBeamFront = MeshBuilder.CreateBox('stage-truss-top-front', { width: trussWidth, height: 0.4, depth: 0.4 }, scene);
  topBeamFront.position.set(0, trussHeight + 1.1, trussDepth / 2);
  topBeamFront.material = mats.trussMetal;
  topBeamFront.parent = root;

  const topBeamBack = MeshBuilder.CreateBox('stage-truss-top-back', { width: trussWidth, height: 0.4, depth: 0.4 }, scene);
  topBeamBack.position.set(0, trussHeight + 1.1, -trussDepth / 2);
  topBeamBack.material = mats.trussMetal;
  topBeamBack.parent = root;

  // 3. MÀN HÌNH LED CONG KHỔNG LỒ PHÍA SAU SÂN KHẤU (CURVED LED BACKDROP SCREEN - 2048x1024 High-Res)
  const ledScale = scene.metadata?.mobile ? 0.5 : 1;
  const ledTex = new DynamicTexture('stage-led-screen-tex', { width: 2048 * ledScale, height: 1024 * ledScale }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  ledTex.anisotropicFilteringLevel = 16;
  const ledCtx = ledTex.getContext();
  ledCtx.scale(ledScale, ledScale);
  ledCtx.imageSmoothingEnabled = true;
  ledCtx.imageSmoothingQuality = 'high';

  // Vẽ nền sậm & hiệu ứng Equalizer sóng âm sống động
  ledCtx.fillStyle = '#020617';
  ledCtx.fillRect(0, 0, 2048, 1024);

  // Gradient ánh sáng sân khấu
  const ledGrad = ledCtx.createLinearGradient(0, 0, 2048, 0);
  ledGrad.addColorStop(0, '#3b0764');
  ledGrad.addColorStop(0.5, '#0284c7');
  ledGrad.addColorStop(1, '#831843');
  ledCtx.fillStyle = ledGrad;
  ledCtx.fillRect(32, 32, 1984, 960);

  // Vẽ các cột sóng âm Equalizer phát sáng
  const numBars = 32;
  const barWidth = 48;
  const barGap = 12;
  const startX = (2048 - (numBars * (barWidth + barGap))) / 2;

  for (let b = 0; b < numBars; b++) {
    const barHeight = 160 + Math.sin(b * 0.4) * 120 + Math.cos(b * 0.9) * 90;
    const bx = startX + b * (barWidth + barGap);
    const by = 840 - barHeight;

    const barGrad = ledCtx.createLinearGradient(0, by, 0, 840);
    barGrad.addColorStop(0, '#f43f5e');
    barGrad.addColorStop(0.4, '#fbbf24');
    barGrad.addColorStop(0.8, '#00f2fe');
    barGrad.addColorStop(1, '#38bdf8');

    ledCtx.fillStyle = barGrad;
    ledCtx.beginPath();
    ledCtx.roundRect(bx, by, barWidth, barHeight, 12);
    ledCtx.fill();
  }

  // Tiêu đề chữ nổi phát sáng "KAIA LIVE CONCERT"
  ledCtx.font = '900 128px "Montserrat", "Segoe UI", Arial, sans-serif';
  ledCtx.fillStyle = '#ffffff';
  ledCtx.textAlign = 'center';
  ledCtx.shadowColor = '#00f2fe';
  ledCtx.shadowBlur = 48;
  ledCtx.fillText('★ KAIA LIVE STAGE ★', 1024, 260);

  ledCtx.font = 'bold 56px "Montserrat", "Segoe UI", Arial, sans-serif';
  ledCtx.fillStyle = '#facc15';
  ledCtx.shadowColor = '#f59e0b';
  ledCtx.shadowBlur = 28;
  ledCtx.fillText('METAVERSE SOCIAL CONCERT · DANCE & VIBE', 1024, 370);

  ledTex.update();

  const ledMat = new StandardMaterial('stage-led-mat', scene);
  ledMat.diffuseTexture = ledTex;
  ledMat.emissiveTexture = ledTex;
  ledMat.emissiveColor = new Color3(0.9, 0.9, 0.9);
  ledMat.specularColor = Color3.Black();

  const ledScreen = MeshBuilder.CreatePlane('stage-led-screen', { width: 10.5, height: 4.8 }, scene);
  ledScreen.position.set(0, 3.8, -3.2);
  ledScreen.material = ledMat;
  ledScreen.parent = root;

  // 4. BÀN DJ HIỆN ĐẠI (DJ BOOTH & AUDIO GEAR)
  const djTable = MeshBuilder.CreateBox('stage-dj-table', { width: 3.2, height: 1.05, depth: 1.2 }, scene);
  djTable.position.set(0, 1.65, 0.8);
  djTable.material = mats.carbonBase;
  djTable.parent = root;
  shadows?.addShadowCaster(djTable);

  // Mâm đĩa than DJ phát sáng 2 bên bàn
  [-0.9, 0.9].forEach((dx, didx) => {
    const turntable = MeshBuilder.CreateCylinder(`stage-turntable-${didx}`, { diameter: 0.65, height: 0.08, tessellation: 24 }, scene);
    turntable.position.set(dx, 2.22, 0.8);
    turntable.material = mats.neonCyan;
    turntable.parent = root;

    const vinyl = MeshBuilder.CreateCylinder(`stage-vinyl-${didx}`, { diameter: 0.55, height: 0.04, tessellation: 24 }, scene);
    vinyl.position.set(dx, 2.26, 0.8);
    vinyl.material = mats.carbonBase;
    vinyl.parent = root;
  });

  // Mixer âm thanh trung tâm
  const mixer = MeshBuilder.CreateBox('stage-dj-mixer', { width: 0.8, height: 0.06, depth: 0.6 }, scene);
  mixer.position.set(0, 2.22, 0.8);
  mixer.material = mats.chromeTrim;
  mixer.parent = root;

  // Laptop DJ siêu mỏng
  const laptop = MeshBuilder.CreateBox('stage-dj-laptop', { width: 0.55, height: 0.38, depth: 0.04 }, scene);
  laptop.position.set(0.65, 2.45, 1.2);
  laptop.rotation.x = -0.3;
  laptop.material = mats.neonPink;
  laptop.parent = root;

  // 5. DÀN LOA LINE ARRAY ĐẲNG CẤP HAI BÊN CÁNH SÂN KHẤU
  [-5.6, 5.6].forEach((lx, lidx) => {
    // Cột treo loa
    for (let c = 0; c < 4; c++) {
      const boxSpk = MeshBuilder.CreateBox(`stage-line-array-${lidx}-${c}`, { width: 1.1, height: 0.42, depth: 0.75 }, scene);
      boxSpk.position.set(lx, 4.8 - c * 0.48, 1.8);
      boxSpk.rotation.x = 0.12 * (c + 1);
      boxSpk.material = mats.speakerBlack;
      boxSpk.parent = root;
      shadows?.addShadowCaster(boxSpk);
    }

    // Loa Subwoofer kép đặt dưới chân sân khấu
    const sub = MeshBuilder.CreateBox(`stage-subwoofer-${lidx}`, { width: 1.6, height: 1.1, depth: 1.2 }, scene);
    sub.position.set(lx, 0.55, 3.2);
    sub.material = mats.speakerBlack;
    sub.parent = root;
    shadows?.addShadowCaster(sub);

    // Màng loa phát âm trầm
    [-0.45, 0.45].forEach((sx, sidx) => {
      const cone = MeshBuilder.CreateCylinder(`stage-subcone-${lidx}-${sidx}`, { diameter: 0.45, height: 0.05, tessellation: 16 }, scene);
      cone.rotation.x = Math.PI / 2;
      cone.position.set(lx + sx, 0.55, 3.82);
      cone.material = mats.speakerCone;
      cone.parent = root;
    });
  });

  // 6. 4 ĐÈN PHA MOVING HEAD / LASER BEAMS QUÉT BẦU TRỜI ĐÊM (MOVING SEARCHLIGHTS)
  const beamColors = [
    { name: 'cyan', hex: '#00f2fe', x: -4.5 },
    { name: 'pink', hex: '#f43f5e', x: -1.5 },
    { name: 'gold', hex: '#fbbf24', x: 1.5 },
    { name: 'violet', hex: '#a855f7', x: 4.5 },
  ];

  const searchlightNodes = [];
  beamColors.forEach((b, idx) => {
    // Chân đèn Moving Head
    const baseLight = MeshBuilder.CreateCylinder(`stage-head-base-${idx}`, { diameter: 0.45, height: 0.35, tessellation: 16 }, scene);
    baseLight.position.set(b.x, trussHeight + 1.3, trussDepth / 2 - 0.2);
    baseLight.material = mats.speakerBlack;
    baseLight.parent = root;

    // Trụ xoay tia sáng
    const pivot = new TransformNode(`stage-beam-pivot-${idx}`, scene);
    pivot.position.set(b.x, trussHeight + 1.5, trussDepth / 2 - 0.2);
    pivot.parent = root;
    searchlightNodes.push({ node: pivot, phase: idx * 1.5 });

    // Luồng sáng laser hình nón ngược vươn cao 26m
    const beam = MeshBuilder.CreateCylinder(`stage-laser-beam-${idx}`, {
      diameterTop: 3.2,
      diameterBottom: 0.15,
      height: 26,
      tessellation: 12,
    }, scene);
    beam.position.y = 13;
    beam.rotation.x = 0.35; // Hướng nghiêng về phía trước khán giả
    beam.parent = pivot;

    const beamMat = new StandardMaterial(`stage-beam-mat-${idx}`, scene);
    beamMat.diffuseColor = Color3.FromHexString(b.hex);
    beamMat.emissiveColor = Color3.FromHexString(b.hex);
    beamMat.alpha = 0.22;
    beamMat.specularColor = Color3.Black();
    beam.material = beamMat;
  });

  // 7. SÀN NHẢY DISCO DANCE FLOOR 5x5 Ô GẠCH KÍNH PHÁT SÁNG PHÍA TRƯỚC SÂN KHẤU
  const discoTiles = [];
  const palette = ['#00f2fe', '#f43f5e', '#fbbf24', '#22c55e', '#a855f7', '#38bdf8'];
  const tileSize = 1.4;
  const tileSpacing = 0.15;
  const startTileZ = 4.8;

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const tx = (col - 2) * (tileSize + tileSpacing);
      const tz = startTileZ + row * (tileSize + tileSpacing);

      const tile = MeshBuilder.CreateBox(`stage-disco-tile-${row}-${col}`, {
        width: tileSize,
        height: 0.08,
        depth: tileSize,
      }, scene);
      tile.position.set(tx, 0.05, tz);
      tile.parent = root;
      tile.receiveShadows = true;

      const tileColor = palette[(row + col) % palette.length];
      const tMat = new StandardMaterial(`stage-tile-mat-${row}-${col}`, scene);
      tMat.diffuseColor = Color3.FromHexString(tileColor);
      tMat.emissiveColor = Color3.FromHexString(tileColor).scale(0.45);
      tMat.specularColor = new Color3(0.8, 0.8, 0.8);
      tMat.specularPower = 120;
      tile.material = tMat;

      discoTiles.push({ mesh: tile, mat: tMat, baseIndex: (row * 5 + col) });
    }
  }

  // Hoạt hình tia đèn quét & sàn nhảy chuyển màu
  scene.onBeforeRenderObservable.add(() => {
    const time = performance.now() * 0.0015;
    searchlightNodes.forEach(({ node, phase }) => {
      node.rotation.y = Math.sin(time + phase) * 0.45;
      node.rotation.z = Math.cos(time * 0.8 + phase) * 0.25;
    });

    // Nhịp đổi màu ô gạch Disco nhẹ nhàng
    const colorStep = Math.floor(time * 1.8);
    discoTiles.forEach(({ mat, baseIndex }) => {
      const c = palette[(baseIndex + colorStep) % palette.length];
      mat.emissiveColor = Color3.FromHexString(c).scale(0.55 + Math.sin(time * 3 + baseIndex) * 0.25);
    });
  });

  return root;
}

/**
 * 2. OUTDOOR CAFE LOUNGE HIỆN ĐẠI (PLAY TOGETHER AIRSTREAM & RESORT PATIO)
 * - Xe cà phê Airstream thép không gỉ bo tròn thời thượng
 * - Mái che Awning sọc caramel hiện đại có dây đèn LED bóng tròn Edison ấm cúng
 * - Quầy bar inox có máy pha cà phê Espresso chuyên nghiệp & menu điện tử
 * - Khu vực bàn ghế ngoài trời: Bàn kính tròn, ghế mây đan ngoài trời cao cấp (Lounge Armchairs)
 * - Cây dù che resort cỡ lớn (Square Cantilever Parasols) viền LED thanh mảnh
 * - Chậu cây cảnh nhiệt đới hiện đại tô điểm không gian thư giãn
 */
export function createVintageCoffeeVan(scene, shadows, position = { x: -28, y: 0, z: 0 }, rotationY = Math.PI / 2) {
  const root = new TransformNode('pt-coffee-lounge-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.rotation.y = rotationY;

  const mats = {
    deckFloor: makeMat(scene, 'cafe-deck-floor', '#c7a783', null, 0.12, 36),
    airstreamChrome: makeMat(scene, 'cafe-airstream-chrome', '#e9f2ed', null, 0.25, 64),
    awningStripe: makeMat(scene, 'cafe-awning-stripe', '#f7c957', null, 0.15, 48),
    glassTable: makeMat(scene, 'cafe-glass-table', '#c9f1ec', null, 0.22, 64),
    serviceGlaze: makeMat(scene, 'cafe-service-glaze', '#b9e9e5', null, 0.18, 56),
    loungeWoven: makeMat(scene, 'cafe-lounge-woven', '#6b8990', null, 0.16, 40),
    cushionCream: makeMat(scene, 'cafe-cushion-cream', '#fff0d1', null, 0.12),
    parasolFabric: makeMat(scene, 'cafe-parasol-fabric', '#f9f5e9', null, 0.12),
    parasolMast: makeMat(scene, 'cafe-parasol-mast', '#567481', null, 0.2, 60),
    edisonWarm: makeMat(scene, 'cafe-edison-bulb', '#fef08a', '#facc15', 0.95, 128),
    plantGreen: makeMat(scene, 'cafe-plant-green', '#10b981', null, 0.2),
  };
  // 1. Raised patio, visually separate from the plaza paving.
  createCafeDeck(scene, root, mats.deckFloor);

  // 2. Xe Cà Phê Airstream Hiện Đại (5.4m x 2.4m x 2.6m)
  const vanRoot = new TransformNode('cafe-van-body-root', scene);
  vanRoot.position.set(0, 0.20, -2.4);
  vanRoot.parent = root;

  const vanBody = MeshBuilder.CreateBox('cafe-van-chassis', { width: 5.4, height: 2.5, depth: 2.3 }, scene);
  vanBody.position.y = 1.4;
  vanBody.material = mats.airstreamChrome;
  vanBody.parent = vanRoot;
  shadows?.addShadowCaster(vanBody);

  // Mui xe vòm cong khí động học
  const vanRoof = MeshBuilder.CreateCylinder('cafe-van-roof-cap', {
    diameter: 2.3,
    height: 5.4,
    tessellation: 24,
  }, scene);
  vanRoof.rotation.z = Math.PI / 2;
  vanRoof.scaling.set(0.45, 1.0, 1.0);
  vanRoof.position.set(0, 2.65, 0);
  vanRoof.material = mats.airstreamChrome;
  vanRoof.parent = vanRoot;

  // Cửa sổ kính bán cà phê mở rộng
  const serviceWindow = MeshBuilder.CreateBox('cafe-service-window', { width: 3.4, height: 1.3, depth: 0.12 }, scene);
  serviceWindow.position.set(0, 1.6, 1.27); // back 1.21, van face 1.15
  serviceWindow.material = mats.serviceGlaze;
  serviceWindow.parent = vanRoot;

  // Quầy bar inox phục vụ
  const counterLedge = MeshBuilder.CreateBox('cafe-counter-ledge', { width: 3.6, height: 0.1, depth: 0.45 }, scene);
  counterLedge.position.set(0, 0.95, 1.35);
  counterLedge.material = mats.airstreamChrome;
  counterLedge.parent = vanRoot;

  // Máy pha cà phê Espresso 2 cần bằng inox trên quầy
  const espressoMachine = MeshBuilder.CreateBox('cafe-espresso-machine', { width: 0.85, height: 0.55, depth: 0.4 }, scene);
  espressoMachine.position.set(-0.8, 1.25, 1.2);
  espressoMachine.material = mats.airstreamChrome;
  espressoMachine.parent = vanRoot;

  // Mái bạt Awning vươn ra che nắng
  const awning = MeshBuilder.CreateBox('cafe-awning', { width: 3.8, height: 0.1, depth: 1.8 }, scene);
  awning.position.set(0, 2.55, 1.6);
  awning.rotation.x = 0.22;
  awning.material = mats.awningStripe;
  awning.parent = vanRoot;

  // Dãy đèn LED Edison vàng ấm buông nhẹ dưới mép mái che
  for (let b = 0; b < 6; b++) {
    const bulb = MeshBuilder.CreateSphere(`cafe-edison-bulb-${b}`, { diameter: 0.18, segments: 8 }, scene);
    bulb.position.set(-1.5 + b * 0.6, 2.25, 2.35);
    bulb.material = mats.edisonWarm;
    bulb.parent = vanRoot;
  }

  // Biển hiệu gỗ sồi chữ nổi vàng ấm "CÀ PHÊ BÌNH MINH"
  createRusticSignboard(scene, 'CÀ PHÊ BÌNH MINH', 'Fresh Brew & Pastries', '#f59e0b', vanRoot, 3.4, 1.2)
    .position.set(0, 3.25, 0);

  // 3. KHU VỰC BÀN GHẾ NGOÀI TRỜI (3 BỘ BÀN KÍNH & GHẾ LOUNGE)
  const seatingPositions = [
    { x: -3.4, z: 1.8 },
    { x: 0.0, z: 2.2 },
    { x: 3.4, z: 1.8 },
  ];

  seatingPositions.forEach((pos, sidx) => {
    const setRoot = new TransformNode(`cafe-table-set-${sidx}`, scene);
    setRoot.position.set(pos.x, 0.32, pos.z);
    setRoot.parent = root;

    // Bàn tròn kính chân kim loại
    const tableBase = MeshBuilder.CreateCylinder(`cafe-tbl-base-${sidx}`, { diameter: 0.7, height: 0.05, tessellation: 16 }, scene);
    tableBase.position.y = 0.025;
    tableBase.material = mats.parasolMast;
    tableBase.parent = setRoot;

    const tableLeg = MeshBuilder.CreateCylinder(`cafe-tbl-leg-${sidx}`, { diameter: 0.08, height: 0.75, tessellation: 12 }, scene);
    tableLeg.position.y = 0.38;
    tableLeg.material = mats.parasolMast;
    tableLeg.parent = setRoot;

    const tableTop = MeshBuilder.CreateCylinder(`cafe-tbl-top-${sidx}`, { diameter: 1.35, height: 0.06, tessellation: 24 }, scene);
    tableTop.position.y = 0.78;
    tableTop.material = mats.glassTable;
    tableTop.parent = setRoot;

    // 2 Ghế tựa mây đan sang trọng
    [-0.9, 0.9].forEach((cx, cidx) => {
      const chairSeat = MeshBuilder.CreateCylinder(`cafe-chair-seat-${sidx}-${cidx}`, { diameter: 0.65, height: 0.1, tessellation: 16 }, scene);
      chairSeat.position.set(cx, 0.42, 0);
      chairSeat.material = mats.cushionCream;
      chairSeat.parent = setRoot;

      const chairBack = MeshBuilder.CreateCylinder(`cafe-chair-back-${sidx}-${cidx}`, { diameter: 0.65, height: 0.5, tessellation: 16 }, scene);
      chairBack.position.set(cx + (cidx === 0 ? -0.2 : 0.2), 0.65, 0);
      chairBack.scaling.set(0.2, 1.0, 1.0);
      chairBack.material = mats.loungeWoven;
      chairBack.parent = setRoot;
    });

    // Cây dù che resort vuông Cantilever (ở 2 bàn cánh ngoài)
    if (sidx !== 1) {
      const parasolMast = MeshBuilder.CreateCylinder(`cafe-para-mast-${sidx}`, { diameter: 0.1, height: 3.2, tessellation: 10 }, scene);
      parasolMast.position.set(pos.x > 0 ? 1.4 : -1.4, 1.6, -0.6);
      parasolMast.material = mats.parasolMast;
      parasolMast.parent = setRoot;

      const parasolArm = MeshBuilder.CreateBox(`cafe-para-arm-${sidx}`, { width: 1.6, height: 0.1, depth: 0.1 }, scene);
      parasolArm.position.set(pos.x > 0 ? 0.7 : -0.7, 3.1, 0);
      parasolArm.material = mats.parasolMast;
      parasolArm.parent = setRoot;

      const canopy = MeshBuilder.CreateCylinder(`cafe-para-canopy-${sidx}`, {
        diameterTop: 0.2,
        diameterBottom: 2.8,
        height: 0.45,
        tessellation: 4,
      }, scene);
      canopy.position.set(0, 2.9, 0);
      canopy.rotation.y = Math.PI / 4;
      canopy.material = mats.parasolFabric;
      canopy.parent = setRoot;
      shadows?.addShadowCaster(canopy);
    }
  });

  return root;
}

/**
 * 3. VÒNG QUAY MAY MẮN 3D NEON ARCADE (LUCKY SPIN WHEEL)
 * - Tủ máy Arcade đứng màu tím hoàng gia & xanh Electric Neon
 * - Vòng quay 12 nan đa sắc (Ruby, Gold, Emerald, Azure, Purple) có các chấu kim loại vàng
 * - Kim chỉ vàng kim phản quang trên đỉnh và viền LED bóng tròn nhấp nháy
 * - Bảng hiệu Neon chữ nổi 3D "LUCKY SPIN" phát sáng rực rỡ
 * - Nút ấn kích hoạt Spin đỏ phát sáng trên bệ điều khiển
 */
export function createLuckyWheel3D(scene, shadows, position = { x: -22, y: 0, z: -18 }, rotationY = Math.PI / 4) {
  const root = new TransformNode('pt-lucky-wheel-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.rotation.y = rotationY;

  const mats = {
    cabinetDark: makeMat(scene, 'wheel-cab-dark', '#1e1b4b', null, 0.6, 90),
    goldChrome: makeMat(scene, 'wheel-gold', '#fbbf24', '#f59e0b', 0.95, 128),
    cyanElectric: makeMat(scene, 'wheel-cyan', '#00f2fe', '#38bdf8', 0.9, 128),
    hotPink: makeMat(scene, 'wheel-pink', '#f43f5e', '#ec4899', 0.9, 128),
    wheelFace: makeMat(scene, 'wheel-face-white', '#ffffff', null, 0.7, 100),
    buttonRed: makeMat(scene, 'wheel-btn-red', '#ef4444', '#dc2626', 0.9, 128),
  };

  // 1. Chân đế kiosk vát cạnh
  const basePlinth = MeshBuilder.CreateBox('wheel-base-plinth', { width: 2.2, height: 0.35, depth: 1.8 }, scene);
  basePlinth.position.y = 0.18;
  basePlinth.material = mats.cabinetDark;
  basePlinth.parent = root;
  basePlinth.receiveShadows = true;

  // Cột trụ đứng nâng đỡ đĩa quay
  const pillar = MeshBuilder.CreateBox('wheel-pillar', { width: 0.8, height: 2.6, depth: 0.7 }, scene);
  pillar.position.y = 1.45;
  pillar.material = mats.cabinetDark;
  pillar.parent = root;
  shadows?.addShadowCaster(pillar);

  // Viền LED chạy dọc cột
  [-0.41, 0.41].forEach((lx, idx) => {
    const strip = MeshBuilder.CreateBox(`wheel-pillar-led-${idx}`, { width: 0.08, height: 2.5, depth: 0.72 }, scene);
    strip.position.set(lx, 1.45, 0);
    strip.material = mats.cyanElectric;
    strip.parent = root;
  });

  // 2. ĐĨA VÒNG QUAY 12 PHÂN VÙNG ĐA SẮC
  const wheelSpinner = new TransformNode('wheel-spinner-node', scene);
  wheelSpinner.position.set(0, 2.9, 0.45);
  wheelSpinner.parent = root;

  const wheelDisc = MeshBuilder.CreateCylinder('wheel-main-disc', {
    diameter: 2.4,
    height: 0.15,
    tessellation: 36,
  }, scene);
  wheelDisc.rotation.x = Math.PI / 2;
  wheelDisc.parent = wheelSpinner;

  // Dynamic Texture với 12 nan màu rực rỡ
  const dt = new DynamicTexture('wheel-tex', { width: 512, height: 512 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  const ctx = dt.getContext();
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#ec4899', '#f97316', '#eab308', '#14b8a6', '#3b82f6', '#8b5cf6', '#d946ef'];

  for (let i = 0; i < 12; i++) {
    const startAng = (i * Math.PI * 2) / 12;
    const endAng = ((i + 1) * Math.PI * 2) / 12;
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.arc(256, 256, 240, startAng, endAng);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Số điểm thưởng trên từng nan
    ctx.save();
    ctx.translate(256, 256);
    ctx.rotate((startAng + endAng) / 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Arial';
    ctx.fillText(`${(i + 1) * 100}`, 140, 8);
    ctx.restore();
  }
  dt.update();

  const discMat = new StandardMaterial('wheel-disc-mat', scene);
  discMat.diffuseTexture = dt;
  discMat.specularColor = new Color3(0.5, 0.5, 0.5);
  wheelDisc.material = discMat;

  // Vành viền kim loại vàng kim có bóng LED nhấp nháy
  const rim = MeshBuilder.CreateTorus('wheel-rim-gold', { diameter: 2.5, thickness: 0.14, tessellation: 36 }, scene);
  rim.position.set(0, 2.9, 0.45);
  rim.rotation.x = Math.PI / 2;
  rim.material = mats.goldChrome;
  rim.parent = root;

  // Kim chỉ vàng trên đỉnh (Pointer)
  const pointer = MeshBuilder.CreateCylinder('wheel-pointer', { diameterTop: 0.05, diameterBottom: 0.35, height: 0.5, tessellation: 3 }, scene);
  pointer.position.set(0, 4.15, 0.52);
  pointer.rotation.x = Math.PI / 2;
  pointer.rotation.z = Math.PI;
  pointer.material = mats.goldChrome;
  pointer.parent = root;

  // 3. Biển hiệu Neon trên nóc "LUCKY WHEEL"
  const signMarquee = MeshBuilder.CreateBox('wheel-neon-header', { width: 2.2, height: 0.55, depth: 0.15 }, scene);
  signMarquee.position.set(0, 4.6, 0.35);
  signMarquee.material = mats.hotPink;
  signMarquee.parent = root;

  // Bệ điều khiển & Nút Spin phía trước
  const consoleDesk = MeshBuilder.CreateBox('wheel-console-desk', { width: 1.4, height: 0.85, depth: 0.75 }, scene);
  consoleDesk.position.set(0, 0.75, 0.85);
  consoleDesk.material = mats.cabinetDark;
  consoleDesk.parent = root;

  const spinBtn = MeshBuilder.CreateCylinder('wheel-spin-btn', { diameter: 0.35, height: 0.12, tessellation: 16 }, scene);
  spinBtn.position.set(0, 1.2, 0.85);
  spinBtn.material = mats.buttonRed;
  spinBtn.parent = root;

  // Hoạt hình đĩa quay nhẹ nhàng sẵn sàng quay
  scene.onBeforeRenderObservable.add(() => {
    const dtTime = scene.getEngine().getDeltaTime() / 1000;
    wheelSpinner.rotation.z += dtTime * 0.35;
  });

  return root;
}

/**
 * 4. MÁY GẮP THÚ BÔNG NEON ARCADE 3D (KAIA CLAW MACHINE)
 * - Tủ máy Arcade đứng hiện đại màu hồng Magenta & xanh Cyan rực rỡ
 * - 3 Mặt kính acrylic trong suốt thấy trọn bộ sưu tập gấu bông, ngôi sao may mắn và kim cương
 * - Tay gắp 3 chấu kim loại mạ chrome treo trên thanh ray trượt
 * - Bảng điều khiển gồm cần gạt Joystick đỏ và nút bấm phát sáng
 * - Hộc lấy quà có cửa đóng mở và khe nhét xu vàng
 */
export function createClawMachine3D(scene, shadows, position = { x: 22, y: 0, z: 18 }, rotationY = -Math.PI / 4) {
  const root = new TransformNode('pt-claw-machine-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.rotation.y = rotationY;

  const mats = {
    arcadePink: makeMat(scene, 'claw-pink', '#ec4899', '#db2777', 0.8, 100),
    arcadeCyan: makeMat(scene, 'claw-cyan', '#06b6d4', '#0891b2', 0.8, 100),
    glassClear: makeMat(scene, 'claw-glass', '#e0f2fe', '#38bdf8', 0.95, 128),
    chromeMetal: makeMat(scene, 'claw-chrome', '#f8fafc', null, 0.9, 128),
    plushGold: makeMat(scene, 'claw-plush-gold', '#fbbf24', '#f59e0b', 0.6),
    plushBlue: makeMat(scene, 'claw-plush-blue', '#38bdf8', '#0284c7', 0.6),
    plushRed: makeMat(scene, 'claw-plush-red', '#ef4444', '#dc2626', 0.6),
    btnGreen: makeMat(scene, 'claw-btn-green', '#22c55e', '#16a34a', 0.9, 120),
  };
  mats.glassClear.alpha = 0.8;

  // 1. Thân đế máy tủ (1.6m x 1.4m x 0.9m)
  const baseBox = MeshBuilder.CreateBox('claw-base-cabinet', { width: 1.6, height: 0.95, depth: 1.4 }, scene);
  baseBox.position.y = 0.48;
  baseBox.material = mats.arcadePink;
  baseBox.parent = root;
  baseBox.receiveShadows = true;

  // Cửa hộc lấy quà ở góc dưới bên trái
  const prizeChute = MeshBuilder.CreateBox('claw-prize-chute', { width: 0.5, height: 0.5, depth: 0.15 }, scene);
  prizeChute.position.set(-0.4, 0.45, 0.72);
  prizeChute.material = mats.arcadeCyan;
  prizeChute.parent = root;

  // 2. Buồng kính trong suốt chứa quà (1.5m x 1.3m x 1.5m)
  const glassChamber = MeshBuilder.CreateBox('claw-glass-chamber', { width: 1.5, height: 1.5, depth: 1.3 }, scene);
  glassChamber.position.set(0, 1.7, 0);
  glassChamber.material = mats.glassClear;
  glassChamber.parent = root;

  // 4 Cột kim loại neon góc máy
  [
    [-0.75, -0.65],
    [0.75, -0.65],
    [-0.75, 0.65],
    [0.75, 0.65],
  ].forEach(([cx, cz], idx) => {
    const col = MeshBuilder.CreateBox(`claw-corner-col-${idx}`, { width: 0.12, height: 1.55, depth: 0.12 }, scene);
    col.position.set(cx, 1.7, cz);
    col.material = mats.arcadeCyan;
    col.parent = root;
  });

  // Nóc hộp đèn phát sáng "KAIA CLAW"
  const topCap = MeshBuilder.CreateBox('claw-top-cap', { width: 1.65, height: 0.45, depth: 1.45 }, scene);
  topCap.position.y = 2.68;
  topCap.material = mats.arcadePink;
  topCap.parent = root;
  shadows?.addShadowCaster(topCap);

  // 3. Cơ cấu tay gắp kim loại 3 chấu (Claw Mechanism)
  const gantryRail = MeshBuilder.CreateBox('claw-rail', { width: 1.2, height: 0.08, depth: 0.08 }, scene);
  gantryRail.position.set(0, 2.35, 0);
  gantryRail.material = mats.chromeMetal;
  gantryRail.parent = root;

  const clawDropCable = MeshBuilder.CreateCylinder('claw-cable', { diameter: 0.03, height: 0.6, tessellation: 8 }, scene);
  clawDropCable.position.set(0.1, 2.05, 0);
  clawDropCable.material = mats.chromeMetal;
  clawDropCable.parent = root;

  const clawHub = MeshBuilder.CreateSphere('claw-hub', { diameter: 0.22, segments: 10 }, scene);
  clawHub.position.set(0.1, 1.75, 0);
  clawHub.material = mats.chromeMetal;
  clawHub.parent = root;

  // 3 Chấu gắp cong
  for (let p = 0; p < 3; p++) {
    const ang = (p * Math.PI * 2) / 3;
    const prong = MeshBuilder.CreateBox(`claw-prong-${p}`, { width: 0.05, height: 0.25, depth: 0.05 }, scene);
    prong.position.set(0.1 + Math.cos(ang) * 0.12, 1.62, Math.sin(ang) * 0.12);
    prong.rotation.z = Math.cos(ang) * 0.4;
    prong.material = mats.chromeMetal;
    prong.parent = root;
  }

  // 4. Các thú bông & quà tặng bên trong (Plushies & Stars)
  const prizes = [
    { x: -0.3, z: -0.2, mat: mats.plushGold, type: 'star' },
    { x: 0.25, z: -0.3, mat: mats.plushBlue, type: 'gem' },
    { x: -0.1, z: 0.25, mat: mats.plushRed, type: 'bear' },
    { x: 0.35, z: 0.2, mat: mats.plushGold, type: 'star' },
    { x: -0.35, z: 0.3, mat: mats.plushBlue, type: 'gem' },
  ];

  prizes.forEach((pz, idx) => {
    const plush = MeshBuilder.CreateSphere(`claw-prize-${idx}`, { diameter: 0.36, segments: 10 }, scene);
    plush.position.set(pz.x, 1.15, pz.z);
    plush.material = pz.mat;
    plush.parent = root;
  });

  // 5. Bảng điều khiển phía trước (Console Shelf)
  const consoleShelf = MeshBuilder.CreateBox('claw-console-shelf', { width: 1.2, height: 0.15, depth: 0.35 }, scene);
  consoleShelf.position.set(0, 0.95, 0.85);
  consoleShelf.rotation.x = 0.2;
  consoleShelf.material = mats.arcadeCyan;
  consoleShelf.parent = root;

  // Cần Joystick đỏ
  const stick = MeshBuilder.CreateCylinder('claw-joystick-stem', { diameter: 0.03, height: 0.18, tessellation: 8 }, scene);
  stick.position.set(-0.25, 1.12, 0.85);
  stick.material = mats.chromeMetal;
  stick.parent = root;

  const stickBall = MeshBuilder.CreateSphere('claw-joystick-ball', { diameter: 0.12, segments: 8 }, scene);
  stickBall.position.set(-0.25, 1.22, 0.85);
  stickBall.material = mats.plushRed;
  stickBall.parent = root;

  // Nút bấm xanh Push Button
  const btn = MeshBuilder.CreateCylinder('claw-action-btn', { diameter: 0.14, height: 0.06, tessellation: 12 }, scene);
  btn.position.set(0.25, 1.05, 0.85);
  btn.material = mats.btnGreen;
  btn.parent = root;

  return root;
}

/**
 * 5. SÂN TRƯỢT VÁN DOWNTOWN SKATEPARK & CHILL ZONE (PLAY TOGETHER SKATEPARK)
 * - Sàn bê tông mài nhẵn mịn màu xám sáng viền nẹp kim loại
 * - 2 Đường dốc Quarterpipe và Halfpipe trượt ván uốn cong thoai thoải
 * - Thanh ray kim loại mạ chrome (Grind Rail) chạy dọc giữa sân
 * - Bục trượt Funbox bậc thang có viền thép chống mài mòn
 * - 2 Ván trượt Skateboard màu sắc nổi bật với bánh xe PU nằm tựa trên thành dốc
 */
export function createDowntownSkatePark(scene, shadows, position = { x: -34, y: 0, z: -34 }, rotationY = Math.PI / 4) {
  const root = new TransformNode('pt-skatepark-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.rotation.y = rotationY;

  const mats = {
    concretePad: makeMat(scene, 'skate-concrete', '#94a3b8', null, 0.35, 50),
    rampWood: makeMat(scene, 'skate-ramp-surface', '#cbd5e1', null, 0.5, 80),
    steelCoping: makeMat(scene, 'skate-coping-steel', '#f8fafc', null, 0.9, 128),
    railChrome: makeMat(scene, 'skate-rail-chrome', '#e2e8f0', null, 0.95, 128),
    neonOrange: makeMat(scene, 'skate-board-orange', '#f97316', '#ea580c', 0.8),
    neonCyan: makeMat(scene, 'skate-board-cyan', '#06b6d4', '#0891b2', 0.8),
    wheelBlack: makeMat(scene, 'skate-wheel-black', '#0f172a', null, 0.4),
  };

  // 1. Sàn bê tông mài phẳng (13.5m x 11m x 0.12m)
  const pad = MeshBuilder.CreateBox('skate-pad', { width: 13.5, height: 0.12, depth: 11.0 }, scene);
  pad.position.set(0, 0.06, 0);
  pad.material = mats.concretePad;
  pad.parent = root;
  pad.receiveShadows = true;

  // 2. Dốc trượt Quarterpipe cong (ở cạnh sau z: -3.8m)
  const rampRoot = new TransformNode('skate-quarterpipe', scene);
  rampRoot.position.set(0, 0, -3.8);
  rampRoot.parent = root;

  // Bục dốc nghiêng
  const rampWedge = MeshBuilder.CreateCylinder('skate-ramp-curve', {
    diameter: 6.4,
    height: 7.5,
    tessellation: 36,
  }, scene);
  rampWedge.rotation.z = Math.PI / 2;
  rampWedge.scaling.set(0.45, 1.0, 0.8);
  rampWedge.position.set(0, 0.8, -0.6);
  rampWedge.material = mats.rampWood;
  rampWedge.parent = rampRoot;
  shadows?.addShadowCaster(rampWedge);

  // Thành bo ống thép trên đỉnh dốc (Coping Rail)
  const coping = MeshBuilder.CreateCylinder('skate-coping', { diameter: 0.16, height: 7.6, tessellation: 16 }, scene);
  coping.rotation.z = Math.PI / 2;
  coping.position.set(0, 1.6, -1.8);
  coping.material = mats.steelCoping;
  coping.parent = rampRoot;

  // Sàn đứng trên đỉnh dốc (Deck Platform)
  const topDeck = MeshBuilder.CreateBox('skate-top-deck', { width: 7.6, height: 0.15, depth: 1.4 }, scene);
  topDeck.position.set(0, 1.55, -2.5);
  topDeck.material = mats.concretePad;
  topDeck.parent = rampRoot;

  // 3. Bục trượt Funbox bậc thang trung tâm
  const funbox = MeshBuilder.CreateBox('skate-funbox', { width: 3.8, height: 0.55, depth: 2.4 }, scene);
  funbox.position.set(0, 0.35, 1.2);
  funbox.material = mats.rampWood;
  funbox.parent = root;
  funbox.receiveShadows = true;
  shadows?.addShadowCaster(funbox);

  // Viền thép chống va đập hai bên funbox
  [-1.2, 1.2].forEach((fz, fidx) => {
    const edge = MeshBuilder.CreateBox(`skate-funbox-edge-${fidx}`, { width: 3.85, height: 0.08, depth: 0.08 }, scene);
    edge.position.set(0, 0.62, 1.2 + fz);
    edge.material = mats.steelCoping;
    edge.parent = root;
  });

  // 4. Thanh ray mài trượt kim loại (Grind Rail 5.4m)
  const grindRail = MeshBuilder.CreateCylinder('skate-grind-rail', { diameter: 0.1, height: 5.4, tessellation: 16 }, scene);
  grindRail.rotation.z = Math.PI / 2;
  grindRail.position.set(0, 0.52, 3.8);
  grindRail.material = mats.railChrome;
  grindRail.parent = root;
  shadows?.addShadowCaster(grindRail);

  // Chân đỡ ray hàn xuống sàn
  [-2.2, 0, 2.2].forEach((rx, ridx) => {
    const post = MeshBuilder.CreateCylinder(`skate-rail-post-${ridx}`, { diameter: 0.08, height: 0.45, tessellation: 10 }, scene);
    post.position.set(rx, 0.28, 3.8);
    post.material = mats.railChrome;
    post.parent = root;
  });

  // 5. Hai chiếc ván trượt Skateboard phong cách Play Together tựa trên mép dốc
  const boards = [
    { x: -1.6, rotZ: 0.3, mat: mats.neonOrange },
    { x: 1.8, rotZ: -0.25, mat: mats.neonCyan },
  ];

  boards.forEach((b, bidx) => {
    const boardRoot = new TransformNode(`skate-board-${bidx}`, scene);
    boardRoot.position.set(b.x, 0.55, -2.6);
    boardRoot.rotation.z = b.rotZ;
    boardRoot.parent = rampRoot;

    // Mặt ván gỗ ép uốn cong
    const deckPlank = MeshBuilder.CreateBox(`skate-deck-${bidx}`, { width: 1.1, height: 0.04, depth: 0.32 }, scene);
    deckPlank.material = b.mat;
    deckPlank.parent = boardRoot;

    // 4 Bánh xe PU
    [
      [-0.4, -0.15],
      [0.4, -0.15],
      [-0.4, 0.15],
      [0.4, 0.15],
    ].forEach(([wx, wz], widx) => {
      const wheel = MeshBuilder.CreateCylinder(`skate-whl-${bidx}-${widx}`, { diameter: 0.12, height: 0.06, tessellation: 12 }, scene);
      wheel.position.set(wx, -0.06, wz);
      wheel.rotation.x = Math.PI / 2;
      wheel.material = mats.wheelBlack;
      wheel.parent = boardRoot;
    });
  });

  return root;
}

/**
 * 6. BẢNG CHỈ DẪN KIOSK HOLOGRAPHIC TOWN DIRECTORY
 * - Trụ đứng kim loại đen than chì viền LED Cyan Neon
 * - Màn hình cảm ứng lớn hiển thị bản đồ định vị thị trấn với các biểu tượng Venue rực rỡ:
 *   ★ Fashion · ★ Casino · ★ Agri-Mart · ★ Showroom · ★ Fishing Wharf · ★ City Hall
 */
export function createTownDirectoryKiosk(scene, shadows, position = { x: -6.4, y: 0, z: 42 }) {
  const root = new TransformNode('pt-directory-kiosk-root', scene);
  root.position.set(position.x, position.y || 0, position.z);

  const matPillar = makeMat(scene, 'kiosk-pillar-dark', '#0f172a', null, 0.7, 90);
  const matNeonCyan = makeMat(scene, 'kiosk-neon-cyan', '#00f2fe', '#38bdf8', 0.95, 128);

  // 1. Đế trụ Kiosk tròn với vành LED âm sàn
  const baseRing = MeshBuilder.CreateCylinder('kiosk-base-ring', { diameter: 2.2, height: 0.12, tessellation: 24 }, scene);
  baseRing.position.y = 0.06;
  baseRing.material = matNeonCyan;
  baseRing.parent = root;

  // Thân trụ vát cạnh
  const pillar = MeshBuilder.CreateBox('kiosk-main-post', { width: 1.8, height: 3.4, depth: 0.4 }, scene);
  pillar.position.y = 1.75;
  pillar.material = matPillar;
  pillar.parent = root;
  shadows?.addShadowCaster(pillar);

  // Viền LED phát sáng hai bên
  [-0.92, 0.92].forEach((sx, sidx) => {
    const strip = MeshBuilder.CreateBox(`kiosk-edge-strip-${sidx}`, { width: 0.06, height: 3.4, depth: 0.42 }, scene);
    strip.position.set(sx, 1.75, 0);
    strip.material = matNeonCyan;
    strip.parent = root;
  });

  // 2. Màn hình Holographic 3D hiển thị bản đồ thị trấn
  const dt = new DynamicTexture('kiosk-map-tex', { width: 512, height: 512 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  const ctx = dt.getContext();

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 512, 512);

  // Khung viền bản đồ
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, 480, 480);

  // Tiêu đề
  ctx.font = '900 36px "Montserrat", Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#00f2fe';
  ctx.shadowBlur = 18;
  ctx.fillText('KAIA METROPOLIS', 256, 68);

  ctx.font = 'bold 20px "Montserrat", Arial, sans-serif';
  ctx.fillStyle = '#facc15';
  ctx.shadowBlur = 10;
  ctx.fillText('INTERACTIVE PLAZA DIRECTORY', 256, 105);

  // Danh sách các địa điểm
  const venues = [
    { name: '★ FASHION MALL', color: '#f43f5e' },
    { name: '★ GAME & CASINO', color: '#fbbf24' },
    { name: '★ AGRI-MART', color: '#22c55e' },
    { name: '★ MOTOR SHOWROOM', color: '#38bdf8' },
    { name: '★ FISHING WHARF', color: '#06b6d4' },
    { name: '★ CIVIC CITY HALL', color: '#c084fc' },
  ];

  ctx.font = 'bold 24px Arial';
  venues.forEach((v, vidx) => {
    const vy = 160 + vidx * 48;
    ctx.fillStyle = v.color;
    ctx.shadowColor = v.color;
    ctx.shadowBlur = 8;
    ctx.fillText(v.name, 256, vy);
  });

  ctx.font = '16px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('100% PEDESTRIAN SOCIAL ZONE', 256, 465);

  dt.update();

  const mapMat = new StandardMaterial('kiosk-map-mat', scene);
  mapMat.diffuseTexture = dt;
  mapMat.emissiveTexture = dt;
  mapMat.emissiveColor = new Color3(0.8, 0.8, 0.8);

  const screenPlane = MeshBuilder.CreatePlane('kiosk-screen-plane', { width: 1.6, height: 2.2 }, scene);
  screenPlane.position.set(0, 1.85, 0.22);
  screenPlane.material = mapMat;
  screenPlane.parent = root;

  return root;
}

/**
 * 7. GIÁ TRƯNG BÀY VÁN TRƯỢT & XE SCOOTER ĐIỆN NEON (SKATEBOARD & SCOOTER STAND)
 * - Khung inox mạ chrome thanh lịch
 * - 3 Ván trượt Skateboard họa tiết đồ họa neon bắt mắt
 * - 1 Chiếc xe Scooter điện mini có dải LED gầm phát sáng màu Cyan
 */
export function createSkateboardRack(scene, shadows, position = { x: 22, y: 0, z: -18 }, rotationY = -Math.PI / 4) {
  const root = new TransformNode('pt-skateboard-rack-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.rotation.y = rotationY;

  const mats = {
    chrome: makeMat(scene, 'rack-chrome', '#f8fafc', null, 0.95, 128),
    boardCyan: makeMat(scene, 'rack-board-cyan', '#00f2fe', '#38bdf8', 0.8),
    boardPink: makeMat(scene, 'rack-board-pink', '#f43f5e', '#ec4899', 0.8),
    boardGold: makeMat(scene, 'rack-board-gold', '#fbbf24', '#f59e0b', 0.8),
    scooterBlack: makeMat(scene, 'rack-scooter-black', '#0f172a', null, 0.6, 90),
    scooterLED: makeMat(scene, 'rack-scooter-led', '#38bdf8', '#00f2fe', 0.95, 128),
  };

  // Khung giá để xe bằng ống inox tròn uốn chữ U
  const rackPipe = MeshBuilder.CreateBox('rack-frame-bar', { width: 2.8, height: 0.85, depth: 0.12 }, scene);
  rackPipe.position.set(0, 0.45, 0);
  rackPipe.material = mats.chrome;
  rackPipe.parent = root;
  shadows?.addShadowCaster(rackPipe);

  // 3 Ván trượt cắm trên giá
  const rackBoards = [
    { x: -0.9, mat: mats.boardCyan, tilt: 0.15 },
    { x: -0.3, mat: mats.boardPink, tilt: -0.12 },
    { x: 0.3, mat: mats.boardGold, tilt: 0.1 },
  ];

  rackBoards.forEach((rb, idx) => {
    const board = MeshBuilder.CreateBox(`rack-board-item-${idx}`, { width: 0.28, height: 1.15, depth: 0.05 }, scene);
    board.position.set(rb.x, 0.65, 0.12);
    board.rotation.y = rb.tilt;
    board.material = rb.mat;
    board.parent = root;
  });

  // 1 Xe Scooter Điện Mini Đỗ Cạnh Giá (Electric Kick-Scooter)
  const scooterRoot = new TransformNode('rack-scooter', scene);
  scooterRoot.position.set(1.0, 0, 0.15);
  scooterRoot.parent = root;

  // Sàn xe mỏng có dải LED gầm
  const scDeck = MeshBuilder.CreateBox('scooter-deck', { width: 0.2, height: 0.08, depth: 0.9 }, scene);
  scDeck.position.set(0, 0.12, 0);
  scDeck.material = mats.scooterBlack;
  scDeck.parent = scooterRoot;

  const scLED = MeshBuilder.CreateBox('scooter-led-strip', { width: 0.22, height: 0.03, depth: 0.85 }, scene);
  scLED.position.set(0, 0.08, 0);
  scLED.material = mats.scooterLED;
  scLED.parent = scooterRoot;

  // Cột tay lái cao
  const scStem = MeshBuilder.CreateCylinder('scooter-stem', { diameter: 0.04, height: 1.15, tessellation: 8 }, scene);
  scStem.position.set(0, 0.68, 0.38);
  scStem.rotation.x = -0.1;
  scStem.material = mats.scooterBlack;
  scStem.parent = scooterRoot;

  // Ghi-đông tay lái
  const scBar = MeshBuilder.CreateCylinder('scooter-handlebar', { diameter: 0.04, height: 0.55, tessellation: 8 }, scene);
  scBar.rotation.z = Math.PI / 2;
  scBar.position.set(0, 1.25, 0.34);
  scBar.material = mats.scooterBlack;
  scBar.parent = scooterRoot;

  // 2 Bánh xe cao su nhỏ
  [-0.4, 0.4].forEach((wz, widx) => {
    const wheel = MeshBuilder.CreateCylinder(`scooter-whl-${widx}`, { diameter: 0.22, height: 0.08, tessellation: 12 }, scene);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(0, 0.11, wz);
    wheel.material = mats.scooterBlack;
    wheel.parent = scooterRoot;
  });

  return root;
}

/**
 * 8. TRẠM DỪNG XE BUÝT THÔNG MINH NGOẠI VI (SMART TRANSIT GLASS SHELTER)
 * Bố trí nghiêm ngặt tại đường ngoại vi (z = ±68), đảm bảo xe buýt không bao giờ xâm nhập vào quảng trường:
 * - Mái che vòm kính cường lực uốn cong khí động học
 * - Trụ thép sơn tĩnh điện màu đen than chì
 * - Bảng điện tử LED hiển thị lịch trình xe buýt "BUS 01 - METAVERSE EXPRESS"
 * - Băng ghế chờ kim loại công thái học và bảng poster điện tử quảng cáo
 */
export function createSmartBusShelter(scene, shadows, position = { x: -9.2, y: 0, z: -52 }, rotationY = 0) {
  const root = new TransformNode('pt-smart-transit-shelter-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.rotation.y = rotationY;

  const mats = {
    graniteBase: makeMat(scene, 'bus-granite-base', '#1e293b', null, 0.3, 60),
    steelAnthracite: makeMat(scene, 'bus-steel-dark', '#0f172a', null, 0.6, 90),
    tintedGlass: makeMat(scene, 'bus-tinted-glass', '#bae6fd', '#38bdf8', 0.9, 128),
    displayLED: makeMat(scene, 'bus-display-led', '#fbbf24', '#f59e0b', 0.95, 128),
    chromeTrim: makeMat(scene, 'bus-chrome-trim', '#f8fafc', null, 0.9, 128),
    benchWood: makeMat(scene, 'bus-bench-wood', '#d97706', null, 0.4, 60),
  };
  mats.tintedGlass.alpha = 0.82;

  // 1. Nền bệ đá granite nâng cao 0.15m (6.5m x 3.6m)
  const platform = MeshBuilder.CreateBox('bus-shelter-platform', { width: 6.5, height: 0.15, depth: 3.6 }, scene);
  platform.position.y = 0.075;
  platform.material = mats.graniteBase;
  platform.parent = root;
  platform.receiveShadows = true;

  // 2. 4 Cột thép kết cấu đỡ mái
  const colPositions = [
    [-2.8, -1.4],
    [2.8, -1.4],
    [-2.8, 1.4],
    [2.8, 1.4],
  ];

  colPositions.forEach(([cx, cz], idx) => {
    const col = MeshBuilder.CreateBox(`bus-shelter-col-${idx}`, { width: 0.22, height: 3.2, depth: 0.22 }, scene);
    col.position.set(cx, 1.68, cz);
    col.material = mats.steelAnthracite;
    col.parent = root;
    shadows?.addShadowCaster(col);
  });

  // 3. Vách kính cường lực phía sau và vách hông che gió
  const backGlass = MeshBuilder.CreateBox('bus-shelter-back-glass', { width: 5.6, height: 2.4, depth: 0.08 }, scene);
  backGlass.position.set(0, 1.6, -1.4);
  backGlass.material = mats.tintedGlass;
  backGlass.parent = root;

  const sideGlass = MeshBuilder.CreateBox('bus-shelter-side-glass', { width: 0.08, height: 2.4, depth: 2.6 }, scene);
  sideGlass.position.set(-2.8, 1.6, 0);
  sideGlass.material = mats.tintedGlass;
  sideGlass.parent = root;

  // 4. Mái che vòm kính uốn cong khí động học
  const curvedCanopy = MeshBuilder.CreateCylinder('bus-shelter-roof-canopy', {
    diameter: 4.8,
    height: 6.8,
    tessellation: 36,
  }, scene);
  curvedCanopy.rotation.z = Math.PI / 2;
  curvedCanopy.scaling.set(0.3, 1.0, 0.9);
  curvedCanopy.position.set(0, 3.4, 0.1);
  curvedCanopy.material = mats.tintedGlass;
  curvedCanopy.parent = root;
  shadows?.addShadowCaster(curvedCanopy);

  // 5. Bảng hiển thị kỹ thuật số lộ trình xe buýt (Smart Timetable Screen - 1024x256 High-Res)
  const dt = new DynamicTexture('bus-schedule-tex', { width: 1024, height: 256 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.anisotropicFilteringLevel = 16;
  const ctx = dt.getContext();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, 1024, 256);

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 1008, 240);

  ctx.font = 'bold 64px Arial';
  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 24;
  ctx.fillText('BUS 01 : METAVERSE EXP', 48, 100);

  ctx.font = 'bold 56px Arial';
  ctx.fillStyle = '#00f2fe';
  ctx.shadowColor = '#00f2fe';
  ctx.shadowBlur = 18;
  ctx.fillText('ARRIVING IN 2 MINS', 48, 190);

  dt.update();

  const ledMat = new StandardMaterial('bus-led-mat', scene);
  ledMat.diffuseTexture = dt;
  ledMat.emissiveTexture = dt;
  ledMat.emissiveColor = new Color3(0.9, 0.9, 0.9);

  const scheduleSign = MeshBuilder.CreatePlane('bus-schedule-board', { width: 2.8, height: 0.75 }, scene);
  scheduleSign.position.set(0, 2.95, 1.45);
  scheduleSign.material = ledMat;
  scheduleSign.parent = root;

  // 6. Băng ghế chờ công thái học hiện đại
  const bench = MeshBuilder.CreateBox('bus-waiting-bench', { width: 4.2, height: 0.12, depth: 0.65 }, scene);
  bench.position.set(0, 0.55, -0.9);
  bench.material = mats.benchWood;
  bench.parent = root;

  // Chân ghế thép
  [-1.6, 1.6].forEach((bx, bidx) => {
    const leg = MeshBuilder.CreateBox(`bus-bench-leg-${bidx}`, { width: 0.12, height: 0.45, depth: 0.55 }, scene);
    leg.position.set(bx, 0.28, -0.9);
    leg.material = mats.steelAnthracite;
    leg.parent = root;
  });

  return root;
}
