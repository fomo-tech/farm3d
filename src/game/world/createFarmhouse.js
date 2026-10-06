import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { createToyMaterial } from '../rendering/PlayTogetherTheme.js';

/**
 * Tạo texture khói mềm mại cho khói lam chiều bếp quê
 */
function createSmokeTexture(scene) {
  if (typeof document === 'undefined' && typeof OffscreenCanvas === 'undefined') {
    return null;
  }
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
 * Tạo khối lăng trụ tam giác đặc kín 100% cho đầu hồi bít đốc truyền thống
 * Toán học chuẩn xác, khớp 100% với góc dốc của mái ngói, không tạo khe hở hay mặt phẳng trùng lặp.
 */
function createSolidGablePrism(name, depthZ, heightY, thicknessX, material, scene, parent) {
  const mesh = new Mesh(name, scene);
  const halfZ = depthZ / 2;
  const halfX = thicknessX / 2;

  // 6 Đỉnh của lăng trụ tam giác đặc (2 mặt tam giác ở -X và +X)
  // 0: (-halfX, 0, -halfZ)       3: (+halfX, 0, -halfZ)
  // 1: (-halfX, 0, +halfZ)       4: (+halfX, 0, +halfZ)
  // 2: (-halfX, heightY, 0)      5: (+halfX, heightY, 0)
  const positions = [
    -halfX, 0, -halfZ,
    -halfX, 0, +halfZ,
    -halfX, heightY, 0,
    +halfX, 0, -halfZ,
    +halfX, 0, +halfZ,
    +halfX, heightY, 0,
  ];

  const indices = [
    // Mặt tam giác bên trái (-X)
    0, 2, 1,
    // Mặt tam giác bên phải (+X)
    3, 4, 5,
    // Mặt dốc phía trước (-Z)
    0, 3, 2,
    3, 5, 2,
    // Mặt dốc phía sau (+Z)
    2, 5, 1,
    5, 4, 1,
    // Mặt đáy (y = 0)
    0, 1, 3,
    1, 4, 3,
  ];

  const normals = [];
  VertexData.ComputeNormals(positions, indices, normals);

  const uvs = [
    0, 0,  1, 0,  0.5, 1,
    0, 0,  1, 0,  0.5, 1,
  ];

  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.uvs = uvs;
  vertexData.applyToMesh(mesh);

  mesh.material = material;
  if (parent) mesh.parent = parent;
  return mesh;
}

/**
 * Biển hoành phi gỗ sơn mài thếp vàng truyền thống Việt Nam
 */
function createLacqueredSignboard(scene, text, width, height) {
  if (typeof document === 'undefined' && typeof OffscreenCanvas === 'undefined') {
    return null;
  }
  const dt = new DynamicTexture(`sign-${text}`, { width: 1024, height: 256 }, scene, false, Texture.TRILINEAR_SAMPLINGMODE);
  dt.hasAlpha = false;
  const ctx = dt.getContext();

  // Nền gỗ gụ sơn then bóng
  ctx.fillStyle = '#2a0c04';
  ctx.fillRect(0, 0, 1024, 256);

  // Khung viền chỉ vàng chạm triện
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 12;
  ctx.strokeRect(16, 16, 992, 224);

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 960, 192);

  // Chữ vàng son đúc nổi
  ctx.font = '900 88px "Nunito", "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Bóng đổ chữ
  ctx.fillStyle = '#78350f';
  ctx.fillText(text, 514, 130, 900);

  // Mặt chữ thếp vàng
  const grad = ctx.createLinearGradient(0, 70, 0, 180);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, '#fef08a');
  grad.addColorStop(0.7, '#f59e0b');
  grad.addColorStop(1, '#d97706');
  ctx.fillStyle = grad;
  ctx.fillText(text, 512, 126, 900);

  dt.update();
  return dt;
}

/**
 * ============================================================================
 * NHÀ NÔNG TRẠI CẤP 1 3D: NHÀ BA GIAN MÁI NGÓI ĐỎ NÔNG THÔN VIỆT NAM
 * ============================================================================
 * Triệt tiêu hoàn toàn Z-fighting (nhấp nháy mesh):
 * - Tường, cột, dầm, cửa sổ đều có độ giật cấp phân tầng rõ ràng (offset >= 2cm).
 * - Mái ngói và đầu hồi tam giác khớp góc dốc chính xác theo tỉ lệ toán học.
 * - Mái hiên độc lập hạ cấp duyên dáng, không cắt mặt nhau.
 * - Không còn ống khói phương Tây, không còn cửa sổ chớp pastel.
 */
export function createStarterFarmhouse(scene, shadowGenerator, position) {
  const root = new TransformNode('starter-farmhouse-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.metadata = { type: 'player-home', tier: 1, homeId: 'starter-cabin' };

  // 1. Hệ thống Vật Liệu Chuẩn Phong Cách Làng Quê Việt Nam
  const mats = {
    lateritePlinth: createToyMaterial(scene, 'mat-vn-laterite-plinth', '#5c2411', { specularPower: 24, specularLevel: 0.15, ambientScale: 0.55 }),
    brickFloor: createToyMaterial(scene, 'mat-vn-brick-floor', '#993b1d', { specularPower: 32, specularLevel: 0.2, ambientScale: 0.6 }),
    wallOchre: createToyMaterial(scene, 'mat-vn-wall-ochre', '#fde68a', { specularPower: 16, ambientScale: 0.75 }),
    woodLimDark: createToyMaterial(scene, 'mat-vn-wood-lim-dark', '#3b1604', { specularPower: 40, specularLevel: 0.3, ambientScale: 0.5 }),
    woodWarm: createToyMaterial(scene, 'mat-vn-wood-warm', '#78350f', { specularPower: 30, specularLevel: 0.25, ambientScale: 0.55 }),
    roofTile: createToyMaterial(scene, 'mat-vn-roof-tile', '#b91c1c', { specularPower: 36, specularLevel: 0.25, ambientScale: 0.6 }),
    roofRidge: createToyMaterial(scene, 'mat-vn-roof-ridge', '#7c2d12', { specularPower: 45, specularLevel: 0.3, ambientScale: 0.5 }),
    stoneLotus: createToyMaterial(scene, 'mat-vn-stone-lotus', '#64748b', { specularPower: 28, specularLevel: 0.2, ambientScale: 0.6 }),
    doorWood: createToyMaterial(scene, 'mat-vn-door-wood', '#451a03', { specularPower: 45, specularLevel: 0.35, ambientScale: 0.5 }),
    windowGlow: createToyMaterial(scene, 'mat-vn-window-glow', '#fef08a', { emissiveHex: '#f59e0b', specularPower: 96, specularLevel: 0.7 }),
    ceramicJar: createToyMaterial(scene, 'mat-vn-ceramic-jar', '#381207', { specularPower: 75, specularLevel: 0.6, ambientScale: 0.5 }),
    lanternSilk: createToyMaterial(scene, 'mat-vn-lantern-silk', '#dc2626', { emissiveHex: '#ef4444', specularPower: 60, ambientScale: 0.8 }),
    cornYellow: createToyMaterial(scene, 'mat-vn-corn-yellow', '#eab308', { specularPower: 20 }),
    chiliRed: createToyMaterial(scene, 'mat-vn-chili-red', '#ef4444', { specularPower: 35 }),
    marigoldGold: createToyMaterial(scene, 'mat-vn-marigold', '#f59e0b', { specularPower: 16 }),
    potClay: createToyMaterial(scene, 'mat-vn-pot-clay', '#9a3412', { specularPower: 20 }),
  };

  // Ánh sáng cửa sổ ban đêm giữ độ sáng ấm áp liên tục, không tính toán lại nguồn sáng bên ngoài
  mats.windowGlow.disableLighting = true;

  // Đảm bảo toàn bộ vật liệu có thể nhận tới 6 nguồn sáng ban đêm mà không bị đảo nguồn gây nhấp nháy
  Object.values(mats).forEach((mat) => {
    if (mat) mat.maxSimultaneousLights = 6;
  });

  // Kích thước chuẩn nhà 3 gian Việt Nam
  const houseW = 6.4;   // Chiều rộng nhà
  const houseD = 4.2;   // Chiều sâu thân nhà (từ z = -2.1 đến +2.1)
  const wallH = 2.6;    // Chiều cao tường
  const plinthH = 0.32; // Chiều cao bệ móng
  const porchD = 1.45;  // Chiều sâu hiên nhà

  // =========================================================================
  // 1. MÓNG BỆ ĐÁ ONG & SÂN HIÊN NHÀ (Laterite Plinth Foundation)
  // =========================================================================
  // Móng thân nhà và hiên: dừng chính xác tại ranh giới trước hiên (không lấn bậc thang)
  const totalD = houseD + porchD; // 5.65m
  const foundation = MeshBuilder.CreateBox('vn-house-foundation', {
    width: houseW + 0.3,
    depth: totalD,
    height: plinthH,
  }, scene);
  foundation.position.set(0, plinthH / 2, -porchD / 2);
  foundation.material = mats.lateritePlinth;
  foundation.parent = root;
  foundation.receiveShadows = true;

  // Lớp gạch Bát Tràng lát nền hiên nhà (nhô cao 4cm so với móng chống Z-fighting)
  const porchFloor = MeshBuilder.CreateBox('vn-house-porch-floor', {
    width: houseW + 0.15,
    depth: porchD - 0.04,
    height: 0.06,
  }, scene);
  porchFloor.position.set(0, plinthH + 0.03, -houseD / 2 - porchD / 2);
  porchFloor.material = mats.brickFloor;
  porchFloor.parent = root;
  porchFloor.receiveShadows = true;

  // 3 Bậc tam cấp bằng đá ong dẫn lên hiên nhà (đặt hoàn toàn phía trước móng)
  const stepFrontStart = -houseD / 2 - porchD;
  [
    { offZ: -0.18, h: plinthH * 0.75, w: 2.4 },
    { offZ: -0.52, h: plinthH * 0.50, w: 2.2 },
    { offZ: -0.86, h: plinthH * 0.25, w: 2.0 },
  ].forEach((st, sidx) => {
    const step = MeshBuilder.CreateBox(`vn-house-step-${sidx}`, {
      width: st.w,
      depth: 0.34,
      height: st.h,
    }, scene);
    step.position.set(0, st.h / 2, stepFrontStart + st.offZ);
    step.material = mats.lateritePlinth;
    step.parent = root;
    step.receiveShadows = true;
  });

  // =========================================================================
  // 2. KHỐI TƯỜNG VÔI VÀNG NGHỆ & CỘT GỖ LIM (Ochre Walls & Ironwood Pillars)
  // =========================================================================
  // Tường nhà thu hẹp nhẹ 8cm để các cột gỗ góc nhà nhô nổi 4cm, loại bỏ hoàn toàn hiện tượng nhấp nháy
  const wallBodyW = houseW - 0.08;
  const wallBodyD = houseD - 0.08;
  const walls = MeshBuilder.CreateBox('vn-house-body-walls', {
    width: wallBodyW,
    depth: wallBodyD,
    height: wallH,
  }, scene);
  walls.position.set(0, plinthH + wallH / 2, 0);
  walls.material = mats.wallOchre;
  walls.parent = root;
  walls.receiveShadows = true;
  shadowGenerator?.addShadowCaster(walls);

  // 4 Cột gỗ lim góc nhà (kích thước 0.22m, nhô hẳn ra ngoài tường 4cm)
  const colSize = 0.22;
  const colHalfW = houseW / 2 - colSize / 2;
  const colHalfD = houseD / 2 - colSize / 2;
  [
    [-colHalfW, -colHalfD],
    [colHalfW, -colHalfD],
    [-colHalfW, colHalfD],
    [colHalfW, colHalfD],
  ].forEach(([cx, cz], idx) => {
    const cornerCol = MeshBuilder.CreateBox(`vn-corner-col-${idx}`, {
      width: colSize,
      depth: colSize,
      height: wallH + 0.04,
    }, scene);
    cornerCol.position.set(cx, plinthH + wallH / 2 + 0.02, cz);
    cornerCol.material = mats.woodLimDark;
    cornerCol.parent = root;
  });

  // Xà dầm ngang trên đỉnh tường trước và sau (nhô ra 2cm phía trước)
  const topBeamFront = MeshBuilder.CreateBox('vn-beam-top-front', {
    width: houseW,
    depth: 0.18,
    height: 0.16,
  }, scene);
  topBeamFront.position.set(0, plinthH + wallH - 0.08, -houseD / 2 - 0.02);
  topBeamFront.material = mats.woodLimDark;
  topBeamFront.parent = root;

  const topBeamBack = MeshBuilder.CreateBox('vn-beam-top-back', {
    width: houseW,
    depth: 0.18,
    height: 0.16,
  }, scene);
  topBeamBack.position.set(0, plinthH + wallH - 0.08, houseD / 2 + 0.02);
  topBeamBack.material = mats.woodLimDark;
  topBeamBack.parent = root;

  // =========================================================================
  // 3. HIÊN NHÀ 3 GIAN & HÀNG CỘT GỖ LIM CHÂN ĐÁ HOA SEN (Veranda Pillars)
  // =========================================================================
  const pillarX = [-2.55, -0.92, 0.92, 2.55];
  const pillarZ = -houseD / 2 - porchD + 0.22;
  const pillarH = 2.22;

  pillarX.forEach((px, idx) => {
    // Chân tảng đá chạm hoa sen
    const baseStone = MeshBuilder.CreateCylinder(`vn-pillar-base-${idx}`, {
      diameter: 0.38,
      height: 0.14,
      tessellation: 16,
    }, scene);
    baseStone.position.set(px, plinthH + 0.06 + 0.07, pillarZ);
    baseStone.material = mats.stoneLotus;
    baseStone.parent = root;
    baseStone.receiveShadows = true;

    // Thân cột gỗ lim tròn tiện
    const pillar = MeshBuilder.CreateCylinder(`vn-veranda-pillar-${idx}`, {
      diameter: 0.22,
      height: pillarH,
      tessellation: 16,
    }, scene);
    pillar.position.set(px, plinthH + 0.20 + pillarH / 2, pillarZ);
    pillar.material = mats.woodLimDark;
    pillar.parent = root;

    // Kẻ hiên con bọ đỡ mái
    const bracket = MeshBuilder.CreateBox(`vn-pillar-bracket-${idx}`, {
      width: 0.20,
      depth: 0.50,
      height: 0.15,
    }, scene);
    bracket.position.set(px, plinthH + 0.20 + pillarH - 0.08, pillarZ + 0.15);
    bracket.rotation.x = -0.22;
    bracket.material = mats.woodLimDark;
    bracket.parent = root;
  });

  // Xà hiên ngang kết nối 4 cột
  const verandaBeam = MeshBuilder.CreateBox('vn-veranda-tie-beam', {
    width: houseW + 0.1,
    depth: 0.20,
    height: 0.16,
  }, scene);
  verandaBeam.position.set(0, plinthH + 0.20 + pillarH, pillarZ);
  verandaBeam.material = mats.woodLimDark;
  verandaBeam.parent = root;

  // =========================================================================
  // 4. MẶT TIỀN: CỬA BỨC BÀN & CỬA SỔ CHẤN SONG GỖ (Traditional Doors & Windows)
  // =========================================================================
  // Đặt toàn bộ chi tiết mặt tiền ở z = -houseD / 2 - 0.06 (cách mặt tường 6cm) để triệt tiêu Z-fighting
  const facadeZ = -houseD / 2 - 0.06;

  // A. Gian giữa: Bộ cửa bức bàn 4 cánh gỗ gụ
  const mainDoorW = 2.1;
  const mainDoorH = 2.15;
  const mainDoorY = plinthH + mainDoorH / 2;

  const doorFrame = MeshBuilder.CreateBox('vn-main-door-frame', {
    width: mainDoorW + 0.18,
    height: mainDoorH + 0.12,
    depth: 0.08,
  }, scene);
  doorFrame.position.set(0, mainDoorY + 0.04, facadeZ);
  doorFrame.material = mats.woodLimDark;
  doorFrame.parent = root;

  // 4 Cánh cửa bức bàn (nhô ra thêm 2cm)
  const panelW = mainDoorW / 4;
  [-1.5 * panelW, -0.5 * panelW, 0.5 * panelW, 1.5 * panelW].forEach((px, idx) => {
    const panel = MeshBuilder.CreateBox(`vn-door-panel-${idx}`, {
      width: panelW - 0.03,
      height: mainDoorH - 0.04,
      depth: 0.06,
    }, scene);
    panel.position.set(px, mainDoorY, facadeZ - 0.03);
    panel.material = mats.doorWood;
    panel.parent = root;

    // Chỉ nổi pano gỗ
    const panelTrim = MeshBuilder.CreateBox(`vn-door-trim-${idx}`, {
      width: panelW - 0.1,
      height: mainDoorH * 0.42,
      depth: 0.04,
    }, scene);
    panelTrim.position.set(px, mainDoorY - 0.35, facadeZ - 0.06);
    panelTrim.material = mats.woodWarm;
    panelTrim.parent = root;
  });

  // Ô thoáng con tiện gỗ phía trên cửa chính
  // Ô thoáng con tiện gỗ phía trên cửa chính (đặt cao hơn khung cửa, không giao cắt)
  const transomH = 0.22;
  const transom = MeshBuilder.CreateBox('vn-door-transom', {
    width: mainDoorW - 0.08,
    height: transomH,
    depth: 0.02,
  }, scene);
  transom.position.set(0, plinthH + mainDoorH + transomH / 2 + 0.08, facadeZ + 0.02);
  transom.material = mats.windowGlow;
  transom.parent = root;

  // Hoành phi gỗ mạ vàng trang trọng trên cửa chính
  const signboardMesh = MeshBuilder.CreatePlane('vn-house-signboard', { width: 1.8, height: 0.45 }, scene);
  signboardMesh.position.set(0, plinthH + mainDoorH + 0.24, facadeZ - 0.07);
  const signDT = createLacqueredSignboard(scene, 'AN GIA · THÔN VIỆT', 1.8, 0.45);
  const signMat = createToyMaterial(scene, 'mat-vn-signboard', '#451a03');
  if (signDT) {
    signMat.diffuseTexture = signDT;
    signMat.emissiveTexture = signDT;
    signMat.disableLighting = true;
  }
  signboardMesh.material = signMat;
  signboardMesh.parent = root;

  // B. Hai gian chái hai bên: Cửa sổ chấn song gỗ truyền thống
  // Thiết kế khung viền rỗng 4 cạnh + kính phát sáng lùi sâu + chấn song gỗ nhô phía trước (KHÔNG GIAO CẮT MẶT)
  [-1.95, 1.95].forEach((wx, sidx) => {
    const winW = 1.15;
    const winH = 1.25;
    const winY = plinthH + 1.45;
    const winZ = facadeZ; // -2.16m
    const fThick = 0.08;
    const fDepth = 0.08;

    // 1. Khung gỗ 4 cạnh bao quanh ô cửa (khung rỗng 3D thật, không dùng khối đặc)
    const topBar = MeshBuilder.CreateBox(`vn-win-top-${sidx}`, { width: winW + fThick * 2, height: fThick, depth: fDepth }, scene);
    topBar.position.set(wx, winY + winH / 2 + fThick / 2, winZ);
    topBar.material = mats.woodLimDark;
    topBar.parent = root;

    const botBar = MeshBuilder.CreateBox(`vn-win-bot-${sidx}`, { width: winW + fThick * 2 + 0.06, height: fThick, depth: fDepth + 0.02 }, scene);
    botBar.position.set(wx, winY - winH / 2 - fThick / 2, winZ - 0.01);
    botBar.material = mats.woodLimDark;
    botBar.parent = root;

    [-winW / 2 - fThick / 2, winW / 2 + fThick / 2].forEach((jx, jidx) => {
      const jamb = MeshBuilder.CreateBox(`vn-win-jamb-${sidx}-${jidx}`, { width: fThick, height: winH, depth: fDepth }, scene);
      jamb.position.set(wx + jx, winY, winZ);
      jamb.material = mats.woodLimDark;
      jamb.parent = root;
    });

    // 2. Mặt kính phát sáng ấm cúng (lùi sâu vào trong khung 2cm, độ dày chỉ 1cm)
    const winBack = MeshBuilder.CreateBox(`vn-win-back-${sidx}`, {
      width: winW - 0.02,
      height: winH - 0.02,
      depth: 0.01,
    }, scene);
    winBack.position.set(wx, winY, winZ + 0.02);
    winBack.material = mats.windowGlow;
    winBack.parent = root;

    // 3. 5 Thanh chấn song gỗ tròn đứng (nhô ra phía trước, có khoảng hở không khí 1.5cm so với kính)
    [-0.38, -0.19, 0, 0.19, 0.38].forEach((barX, bidx) => {
      const bar = MeshBuilder.CreateCylinder(`vn-win-bar-${sidx}-${bidx}`, {
        diameter: 0.045,
        height: winH - 0.02,
        tessellation: 12,
      }, scene);
      bar.position.set(wx + barX, winY, winZ - 0.02);
      bar.material = mats.woodWarm;
      bar.parent = root;
    });
  });

  // =========================================================================
  // 5. MÁI NGÓI MŨI HÀI ĐỎ NUNG & ĐẦU HỒI BÍT ĐỐC ĐẶC KÍN 100%
  // =========================================================================
  // Chiều cao đỉnh nóc mái tính từ đỉnh tường
  const wallTopY = plinthH + wallH;
  const roofApexH = 1.55;
  const halfD = houseD / 2; // 2.1m
  const ridgeY = wallTopY + roofApexH; // 4.47m

  // Độ dốc chuẩn xác khớp giữa mái và đầu hồi: tan(pitch) = roofApexH / halfD = 1.55 / 2.1
  const pitch = Math.atan(roofApexH / halfD); // ~0.63587 rad (~36.43°)
  const hypotenuse = Math.sqrt(roofApexH * roofApexH + halfD * halfD); // 2.61m
  const overhang = 0.35;
  const slopeLength = hypotenuse + overhang; // 2.96m
  const roofW = houseW + 0.7; // 7.1m (đua sang hai bên đầu hồi 0.35m mỗi bên)

  // A. Hai đầu hồi bít đốc kín khít bằng lăng trụ tam giác đặc (Khớp 100% góc dốc mái)
  const gableThickness = 0.20;
  [-houseW / 2 + 0.12, houseW / 2 - 0.12].forEach((gx, idx) => {
    const gable = createSolidGablePrism(
      `vn-house-solid-gable-${idx}`,
      houseD,
      roofApexH,
      gableThickness,
      mats.wallOchre,
      scene,
      root,
    );
    gable.position.set(gx, wallTopY, 0);
    gable.receiveShadows = false;
  });

  // B. Mái chính hai dốc: Trước và Sau đối xứng chuẩn xác toán học
  const roofThick = 0.14;
  const midSlopeDist = slopeLength / 2;
  const midZ = midSlopeDist * Math.cos(pitch);
  const midY = midSlopeDist * Math.sin(pitch);
  // Hiệu chỉnh bù trừ theo pháp tuyến độ dày mái
  const normY = (roofThick / 2) * Math.cos(pitch);
  const normZ = (roofThick / 2) * Math.sin(pitch);

  // Mái trước
  const frontRoof = MeshBuilder.CreateBox('vn-house-roof-slope-front', {
    width: roofW,
    depth: slopeLength,
    height: roofThick,
  }, scene);
  frontRoof.position.set(0, ridgeY - midY - normY, -midZ - normZ);
  frontRoof.rotation.x = -pitch;
  frontRoof.material = mats.roofTile;
  frontRoof.receiveShadows = false;
  frontRoof.parent = root;
  shadowGenerator?.addShadowCaster(frontRoof);

  // Mái sau
  const backRoof = MeshBuilder.CreateBox('vn-house-roof-slope-back', {
    width: roofW,
    depth: slopeLength,
    height: roofThick,
  }, scene);
  backRoof.position.set(0, ridgeY - midY - normY, midZ + normZ);
  backRoof.rotation.x = pitch;
  backRoof.material = mats.roofTile;
  backRoof.receiveShadows = false;
  backRoof.parent = root;
  shadowGenerator?.addShadowCaster(backRoof);

  // C. Bờ nóc đắp chỉ thẳng & hai đầu kìm nóc (bọc kín đỉnh nóc, chống hở đỉnh)
  const ridgeBeam = MeshBuilder.CreateBox('vn-house-roof-ridge-beam', {
    width: roofW + 0.15,
    depth: 0.24,
    height: 0.24,
  }, scene);
  ridgeBeam.position.set(0, ridgeY + 0.04, 0);
  ridgeBeam.material = mats.roofRidge;
  ridgeBeam.receiveShadows = false;
  ridgeBeam.parent = root;

  [-roofW / 2 - 0.05, roofW / 2 + 0.05].forEach((kx, idx) => {
    const finial = MeshBuilder.CreateCylinder(`vn-ridge-finial-${idx}`, {
      diameterTop: 0.10,
      diameterBottom: 0.22,
      height: 0.42,
      tessellation: 12,
    }, scene);
    finial.position.set(kx, ridgeY + 0.22, 0);
    finial.rotation.z = idx === 0 ? 0.45 : -0.45;
    finial.material = mats.roofRidge;
    finial.parent = root;
  });

  // D. MÁI HIÊN HẠ CẤP DUYÊN DÁNG (Traditional Veranda Awning Roof)
  // Nối tiếp tự nhiên dưới giọt gianh mái chính, che trọn hiên nhà mà không giao cắt mặt phẳng
  const porchRoofStart = -houseD / 2; // -2.1m
  const porchRoofEnd = -houseD / 2 - porchD - 0.20; // -3.75m
  const porchRoofDeltaZ = Math.abs(porchRoofEnd - porchRoofStart); // 1.65m
  const porchRoofDeltaY = 0.52; // chênh lệch độ cao từ đỉnh hiên xuống dầm trước
  const porchPitch = Math.atan(porchRoofDeltaY / porchRoofDeltaZ); // ~0.304 rad (~17.4°)
  const porchSlopeLen = Math.sqrt(porchRoofDeltaZ * porchRoofDeltaZ + porchRoofDeltaY * porchRoofDeltaY); // ~1.73m

  const porchRoof = MeshBuilder.CreateBox('vn-porch-awning-roof', {
    width: houseW + 0.5,
    depth: porchSlopeLen,
    height: 0.12,
  }, scene);
  porchRoof.position.set(
    0,
    (wallTopY - 0.25 + plinthH + 0.20 + pillarH + 0.18) / 2,
    (porchRoofStart + porchRoofEnd) / 2,
  );
  porchRoof.rotation.x = -porchPitch;
  porchRoof.material = mats.roofTile;
  porchRoof.receiveShadows = false;
  porchRoof.parent = root;

  // Diềm mái hiên gỗ lim bảo vệ mép ngói
  const eavesFascia = MeshBuilder.CreateBox('vn-eaves-fascia', {
    width: houseW + 0.52,
    depth: 0.06,
    height: 0.14,
  }, scene);
  eavesFascia.position.set(0, plinthH + 0.20 + pillarH + 0.14, porchRoofEnd);
  eavesFascia.material = mats.woodLimDark;
  eavesFascia.parent = root;

  // =========================================================================
  // 6. VẬT DỤNG & CHI TIẾT BẢN SẮC NÔNG THÔN VIỆT ĐÍCH THỰC
  // =========================================================================

  // A. Chum sành hứng nước mưa Bát Tràng & gáo dừa
  const jarRoot = new TransformNode('vn-water-jar-root', scene);
  jarRoot.position.set(-2.6, plinthH + 0.06, -houseD / 2 - porchD * 0.5);
  jarRoot.parent = root;

  const jarBody = MeshBuilder.CreateCylinder('vn-jar-body', {
    diameterTop: 0.58,
    diameterBottom: 0.45,
    height: 0.72,
    tessellation: 20,
  }, scene);
  jarBody.position.set(0, 0.36, 0);
  jarBody.material = mats.ceramicJar;
  jarBody.parent = jarRoot;

  const jarRim = MeshBuilder.CreateTorus('vn-jar-rim', {
    diameter: 0.62,
    thickness: 0.08,
    tessellation: 20,
  }, scene);
  jarRim.position.set(0, 0.72, 0);
  jarRim.material = mats.ceramicJar;
  jarRim.parent = jarRoot;

  // Gáo dừa mộc mạc
  const ladleBowl = MeshBuilder.CreateSphere('vn-ladle-bowl', { diameter: 0.18, segments: 10 }, scene);
  ladleBowl.position.set(0.12, 0.78, 0.08);
  ladleBowl.material = mats.woodWarm;
  ladleBowl.parent = jarRoot;

  const ladleHandle = MeshBuilder.CreateCylinder('vn-ladle-handle', {
    diameter: 0.03,
    height: 0.42,
    tessellation: 6,
  }, scene);
  ladleHandle.position.set(0.24, 0.84, 0.22);
  ladleHandle.rotation.x = 0.5;
  ladleHandle.rotation.y = 0.5;
  ladleHandle.material = mats.woodWarm;
  ladleHandle.parent = jarRoot;

  // B. Bàn chõng tre / sập gỗ thưởng trà ở góc hiên
  const benchRoot = new TransformNode('vn-tea-bench-root', scene);
  benchRoot.position.set(2.0, plinthH + 0.06, -houseD / 2 - porchD * 0.5);
  benchRoot.parent = root;

  const benchTop = MeshBuilder.CreateBox('vn-bench-top', { width: 1.15, depth: 0.65, height: 0.08 }, scene);
  benchTop.position.set(0, 0.35, 0);
  benchTop.material = mats.woodWarm;
  benchTop.parent = benchRoot;

  [-0.45, 0.45].forEach((bx) => {
    [-0.24, 0.24].forEach((bz) => {
      const leg = MeshBuilder.CreateCylinder(`vn-bench-leg-${bx}-${bz}`, {
        diameter: 0.08,
        height: 0.35,
        tessellation: 8,
      }, scene);
      leg.position.set(bx, 0.175, bz);
      leg.material = mats.woodLimDark;
      leg.parent = benchRoot;
    });
  });

  // Ấm tích & chén sứ
  const teapot = MeshBuilder.CreateSphere('vn-tea-pot', { diameter: 0.16, segments: 8 }, scene);
  teapot.position.set(0, 0.46, 0);
  teapot.material = mats.ceramicJar;
  teapot.parent = benchRoot;

  [-0.14, 0.14].forEach((cx, idx) => {
    const cup = MeshBuilder.CreateCylinder(`vn-tea-cup-${idx}`, { diameter: 0.07, height: 0.06, tessellation: 8 }, scene);
    cup.position.set(cx, 0.42, 0.08);
    cup.material = mats.stoneLotus;
    cup.parent = benchRoot;
  });

  // C. Dây ớt hiểm đỏ & Chùm bắp ngô vàng phơi dưới xà hiên
  [-2.1, -1.95, -1.8].forEach((cx, idx) => {
    const corn = MeshBuilder.CreateCylinder(`vn-eaves-corn-${idx}`, {
      diameterTop: 0.03,
      diameterBottom: 0.09,
      height: 0.28,
      tessellation: 8,
    }, scene);
    corn.position.set(cx, plinthH + 0.20 + pillarH - 0.2 - idx * 0.05, pillarZ + 0.04);
    corn.material = mats.cornYellow;
    corn.parent = root;
  });

  [1.8, 1.95, 2.1].forEach((cx, idx) => {
    const chili = MeshBuilder.CreateCylinder(`vn-eaves-chili-${idx}`, {
      diameterTop: 0.02,
      diameterBottom: 0.06,
      height: 0.22,
      tessellation: 6,
    }, scene);
    chili.position.set(cx, plinthH + 0.20 + pillarH - 0.22 - idx * 0.04, pillarZ + 0.04);
    chili.rotation.z = (idx % 2 === 0 ? 0.2 : -0.2);
    chili.material = mats.chiliRed;
    chili.parent = root;
  });

  // D. Đôi đèn lồng Hội An vải lụa đỏ treo hai bên hiên (nối tiếp chuẩn xác, không xuyên cắt hình học)
  [-1.25, 1.25].forEach((lx, idx) => {
    const lanternRoot = new TransformNode(`vn-lantern-${idx}`, scene);
    lanternRoot.position.set(lx, plinthH + 0.20 + pillarH - 0.05, pillarZ + 0.08);
    lanternRoot.parent = root;

    const cordH = 0.12;
    const cord = MeshBuilder.CreateCylinder(`vn-lantern-cord-${idx}`, { diameter: 0.02, height: cordH, tessellation: 6 }, scene);
    cord.position.set(0, -cordH / 2, 0);
    cord.material = mats.woodLimDark;
    cord.parent = lanternRoot;

    const bodyH = 0.36;
    const lanternBody = MeshBuilder.CreateSphere(`vn-lantern-silk-${idx}`, {
      diameterX: 0.30,
      diameterY: bodyH,
      diameterZ: 0.30,
      segments: 12,
    }, scene);
    lanternBody.position.set(0, -cordH - bodyH / 2, 0);
    lanternBody.material = mats.lanternSilk;
    lanternBody.parent = lanternRoot;

    const tasselH = 0.18;
    const tassel = MeshBuilder.CreateCylinder(`vn-lantern-tassel-${idx}`, {
      diameterTop: 0.07,
      diameterBottom: 0.02,
      height: tasselH,
      tessellation: 8,
    }, scene);
    tassel.position.set(0, -cordH - bodyH - tasselH / 2, 0);
    tassel.material = mats.cornYellow;
    tassel.parent = lanternRoot;
  });

  // E. Đôi chậu gốm cúc vạn thọ vàng đặt hai bên thềm bậc tam cấp
  [-1.4, 1.4].forEach((px, idx) => {
    const pot = MeshBuilder.CreateCylinder(`vn-flower-pot-${idx}`, {
      diameterTop: 0.42,
      diameterBottom: 0.28,
      height: 0.35,
      tessellation: 12,
    }, scene);
    pot.position.set(px, 0.175, stepFrontStart - 0.52);
    pot.material = mats.potClay;
    pot.parent = root;

    const flowerDome = MeshBuilder.CreateSphere(`vn-flower-dome-${idx}`, {
      diameter: 0.45,
      segments: 10,
    }, scene);
    flowerDome.position.set(px, 0.42, stepFrontStart - 0.52);
    flowerDome.material = mats.marigoldGold;
    flowerDome.parent = root;
  });

  // =========================================================================
  // 7. KHÓI LAM CHIỀU TỎA RA TỪ SAU MÁI BẾP (Evening Mist Kitchen Smoke)
  // =========================================================================
  const smokeEmitter = new TransformNode('vn-kitchen-smoke-emitter', scene);
  // Đặt khói hoàn toàn phía sau nhà, ngoài ranh giới mái ngói để không xuyên cắt hình học mái
  smokeEmitter.position.set(houseW * 0.28, wallTopY + 0.3, houseD / 2 + 0.45);
  smokeEmitter.parent = root;

  const smokeSystem = new ParticleSystem('vn-starter-smoke', 20, scene);
  smokeSystem.particleTexture = createSmokeTexture(scene);
  smokeSystem.emitter = smokeEmitter;
  smokeSystem.minEmitBox = new Vector3(-0.08, 0, -0.08);
  smokeSystem.maxEmitBox = new Vector3(0.08, 0.1, 0.08);
  smokeSystem.color1 = new Color4(0.92, 0.92, 0.90, 0.30);
  smokeSystem.color2 = new Color4(0.85, 0.85, 0.82, 0.15);
  smokeSystem.colorDead = new Color4(0.80, 0.82, 0.80, 0.0);
  smokeSystem.minSize = 0.35;
  smokeSystem.maxSize = 0.95;
  smokeSystem.minLifeTime = 2.0;
  smokeSystem.maxLifeTime = 3.6;
  smokeSystem.emitRate = 2.0;
  smokeSystem.direction1 = new Vector3(-0.1, 1.5, 0.15);
  smokeSystem.direction2 = new Vector3(0.1, 2.2, 0.35);
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

/**
 * ============================================================================
 * NHÀ NÔNG TRẠI CẤP 2 3D: DINH THỰ NHÀ VƯỜN RƯỜNG 5 GIAN VIỆT NAM (GRAND ESTATE)
 * ============================================================================
 */
export function createUpgradedFarmhouse(scene, shadowGenerator, position) {
  const root = new TransformNode('upgraded-farmhouse-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.metadata = { type: 'player-home', tier: 2, homeId: 'country-manor' };

  // Dựng nhà chính 3 gian truyền thống nâng cao
  const mainCottage = createStarterFarmhouse(scene, shadowGenerator, new Vector3(0, 0, 0));
  mainCottage.root.parent = root;

  const mats = {
    laterite: createToyMaterial(scene, 'mat-manor-laterite', '#5c2411', { specularPower: 24, ambientScale: 0.55 }),
    wallOchre: createToyMaterial(scene, 'mat-manor-wall', '#fde68a', { ambientScale: 0.7 }),
    woodLim: createToyMaterial(scene, 'mat-manor-lim', '#3b1604', { specularPower: 45, specularLevel: 0.35 }),
    roofTile: createToyMaterial(scene, 'mat-manor-roof', '#b91c1c', { specularPower: 36, specularLevel: 0.25 }),
  };

  // 2 Gian chái hai bên cánh mở rộng (Wings) đặt ngoài tường nhà chính
  [-4.5, 4.5].forEach((wingX, idx) => {
    const wingW = 1.8;
    const wingD = 3.4;
    const wingH = 2.4;

    const wingPlinth = MeshBuilder.CreateBox(`vn-wing-plinth-${idx}`, { width: wingW, depth: wingD, height: 0.32 }, scene);
    wingPlinth.position.set(wingX, 0.16, 0.1);
    wingPlinth.material = mats.laterite;
    wingPlinth.parent = root;

    const wingBody = MeshBuilder.CreateBox(`vn-wing-body-${idx}`, { width: wingW - 0.08, depth: wingD - 0.08, height: wingH }, scene);
    wingBody.position.set(wingX, 0.32 + wingH / 2, 0.1);
    wingBody.material = mats.wallOchre;
    wingBody.parent = root;
    shadowGenerator?.addShadowCaster(wingBody);

    const wingRoof = MeshBuilder.CreateBox(`vn-wing-roof-${idx}`, { width: wingW + 0.4, depth: wingD + 0.4, height: 0.12 }, scene);
    wingRoof.position.set(wingX, 0.32 + wingH + 0.35, 0.1);
    wingRoof.rotation.z = idx === 0 ? 0.30 : -0.30;
    wingRoof.material = mats.roofTile;
    wingRoof.parent = root;
    shadowGenerator?.addShadowCaster(wingRoof);
  });

  return {
    root,
    smokeSystem: mainCottage.smokeSystem,
    dispose() {
      mainCottage.dispose();
      root.dispose(false, false);
    },
  };
}

export { createUpgradedFarmhouse as createFarmhouse };
