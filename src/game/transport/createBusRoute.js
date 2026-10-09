import { batchRigidMeshes } from '../rendering/batchRigidMeshes.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial } from '../rendering/PlayTogetherTheme.js';
import { MODEL_PATHS, spawnModelSync } from '../rendering/ModelAssetManager.js';
import { getScenicPoiDescriptor } from '../world/createScenicLandscapes.js';
import { COASTAL_BUS_CONFIG } from '../../../shared/beachConfig.js';
import { getTerrainHeight } from '../world/TerrainHeightSystem.js';
import { LAKE_CONFIG } from '../../../shared/lakeConfig.js';

function makeMat(scene, name, hex, emissiveHex = null) {
  return createToyMaterial(scene, name, hex, { emissiveHex });
}

/**
 * Draws a sharp vector bus silhouette onto 2D canvas context without emojis.
 */
function drawBusIcon(ctx, cx, cy, size = 64, color = '#ffffff') {
  ctx.save();
  ctx.translate(cx, cy);
  const s = size / 100;
  ctx.scale(s, s);

  // Main chassis rounded box
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-42, -26, 84, 52, 10);
  ctx.fill();

  // Glass windows
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-36, -20, 22, 20, 4);
  ctx.roundRect(-8, -20, 20, 20, 4);
  ctx.roundRect(18, -20, 20, 20, 4);
  ctx.fill();

  // Headlights
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(-36, 14, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Wheels
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(-22, 26, 9, 0, Math.PI * 2);
  ctx.arc(22, 26, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(-22, 26, 4, 0, Math.PI * 2);
  ctx.arc(22, 26, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Creates a European/Ghibli wooden bus stop shelter with bench, timetable sign and lantern.
 * Local -Z is the OPEN FRONT facing the street.
 * Local +Z is the BACK WALL.
 */
function createBusStopShelter(scene, x, z, label, routeBadges, materials, rotationY = 0) {
  const root = new TransformNode(`bus-stop-${label}`, scene);
  root.position.set(x, 0, z);
  root.rotation.y = rotationY;

  // 1. Sàn gỗ nâng cao
  const platform = MeshBuilder.CreateBox(`stop-plat-${label}`, { width: 5.6, height: 0.22, depth: 3.2 }, scene);
  platform.position.set(0, 0.11, 0);
  platform.material = materials.timber;
  platform.parent = root;

  // Vạch kẻ vàng đón xe trên lề đường (y = 0.09 chống z-fighting, nằm ở mép trước đón xe)
  const curbLine = MeshBuilder.CreatePlane(`stop-curb-${label}`, { width: 6.2, height: 0.4 }, scene);
  curbLine.rotation.x = Math.PI / 2;
  curbLine.position.set(0, 0.09, -1.75);
  curbLine.material = materials.signYellow;
  curbLine.parent = root;

  // 2. 4 cột trụ gỗ tròn
  [[-2.2, -1.1], [2.2, -1.1], [-2.2, 1.1], [2.2, 1.1]].forEach(([px, pz], i) => {
    const post = MeshBuilder.CreateCylinder(`stop-post-${label}-${i}`, { height: 3.2, diameter: 0.22, tessellation: 12 }, scene);
    post.position.set(px, 1.6, pz);
    post.material = materials.timber;
    post.parent = root;
  });

  // Vách kính & gỗ chắn gió phía sau (ở +Z)
  const backPanel = MeshBuilder.CreateBox(`stop-back-${label}`, { width: 4.4, height: 2.2, depth: 0.08 }, scene);
  backPanel.position.set(0, 1.8, 1.1);
  backPanel.material = materials.bench;
  backPanel.parent = root;

  // 3. Mái ngói đôi chữ V ấm cúng
  const roofL = MeshBuilder.CreateBox(`stop-roof-l-${label}`, { width: 5.8, height: 0.12, depth: 2.0 }, scene);
  roofL.position.set(0, 3.42, -0.65);
  roofL.rotation.x = -0.32;
  roofL.material = materials.tileRoof;
  roofL.parent = root;

  const roofR = MeshBuilder.CreateBox(`stop-roof-r-${label}`, { width: 5.8, height: 0.12, depth: 2.0 }, scene);
  roofR.position.set(0, 3.42, 0.65);
  roofR.rotation.x = 0.32;
  roofR.material = materials.tileRoof;
  roofR.parent = root;

  const roofRidge = MeshBuilder.CreateBox(`stop-roof-ridge-${label}`, { width: 6.0, height: 0.18, depth: 0.32 }, scene);
  roofRidge.position.set(0, 3.75, 0);
  roofRidge.material = materials.timber;
  roofRidge.parent = root;

  // 4. Băng ghế gỗ (tựa lưng vào vách sau +Z, nhìn ra mặt đường -Z)
  const benchSeat = MeshBuilder.CreateBox(`stop-bench-${label}`, { width: 3.6, height: 0.14, depth: 0.72 }, scene);
  benchSeat.position.set(0, 0.65, 0.6);
  benchSeat.material = materials.bench;
  benchSeat.parent = root;

  // 5. Cột biển báo dừng xe buýt cổ điển
  const signPole = MeshBuilder.CreateCylinder(`stop-sign-pole-${label}`, { height: 3.2, diameter: 0.12 }, scene);
  signPole.position.set(-2.8, 1.6, -1.0);
  signPole.material = materials.timber;
  signPole.parent = root;

  // Bảng hiệu tròn xe buýt vector không emoji
  const badgeDT = new DynamicTexture(`dt-bus-sign-${label}`, { width: 256, height: 256 }, scene, false);
  const bCtx = badgeDT.getContext();
  bCtx.fillStyle = '#f59e0b';
  bCtx.beginPath();
  bCtx.arc(128, 128, 120, 0, Math.PI * 2);
  bCtx.fill();
  bCtx.strokeStyle = '#ffffff';
  bCtx.lineWidth = 10;
  bCtx.stroke();

  // Vẽ biểu tượng xe buýt vector
  drawBusIcon(bCtx, 128, 92, 70, '#ffffff');

  // Tên trạm và tuyến
  bCtx.fillStyle = '#1e293b';
  bCtx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
  bCtx.textAlign = 'center';
  bCtx.textBaseline = 'middle';
  bCtx.fillText(label, 128, 168);

  bCtx.fillStyle = '#0f766e';
  bCtx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  bCtx.fillText(routeBadges || 'BUS STOP', 128, 202);
  badgeDT.update();

  const badgeMat = new StandardMaterial(`mat-bus-sign-${label}`, scene);
  badgeMat.diffuseTexture = badgeDT;
  badgeMat.emissiveColor = new Color3(0.4, 0.3, 0.1);

  const signBadge = MeshBuilder.CreateCylinder(`stop-sign-badge-${label}`, { height: 0.08, diameter: 1.25, tessellation: 24 }, scene);
  signBadge.rotation.x = Math.PI / 2;
  signBadge.position.set(-2.8, 2.7, -1.0);
  signBadge.material = badgeMat;
  signBadge.parent = root;

  // 6. Đèn lồng treo 3D cổ điển
  spawnModelSync(scene, MODEL_PATHS.town.lantern, {
    position: new Vector3(0, 2.7, 0),
    scaling: new Vector3(1.1, 1.1, 1.1),
    parent: root,
    name: `bus-stop-lantern-${label}`,
  });

  return root;
}

/**
 * Creates an electronic LED destination board texture (Phong cách xe buýt Việt Nam).
 */
function createLedSignTexture(scene, id, text, routeNum, colorHex = '#38bdf8') {
  const dt = new DynamicTexture(`dt-led-${id}`, { width: 512, height: 128 }, scene, false);
  const ctx = dt.getContext();
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, 512, 128);

  // Viền LED ma trận
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 5;
  ctx.strokeRect(4, 4, 504, 120);

  // Khung số tuyến xe buýt Việt Nam
  ctx.fillStyle = colorHex;
  ctx.beginPath();
  ctx.roundRect(14, 14, 112, 100, 14);
  ctx.fill();

  ctx.fillStyle = '#020617';
  ctx.font = '900 46px "Segoe UI", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(routeNum, 70, 64);

  // Tên điểm đến in hoa rõ nét
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 33px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(text.toUpperCase(), 140, 50);

  // Dòng phụ City Tour Việt Nam
  ctx.fillStyle = colorHex;
  ctx.font = 'bold 18px "Segoe UI", sans-serif';
  ctx.fillText('VIETNAM CITY TOUR · XE MUI TRẦN', 140, 92);

  dt.update();
  return dt;
}

/**
 * Biển số xe vận tải hành khách màu vàng nghệ đặc trưng Việt Nam (VD: 29B - 888.68)
 */
function createVietnamLicensePlateTexture(scene, id, plateText) {
  const dt = new DynamicTexture(`dt-plate-${id}`, { width: 256, height: 96 }, scene, false);
  const ctx = dt.getContext();
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 0, 256, 96);

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 248, 88);

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 36px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(plateText, 128, 50);

  dt.update();
  return dt;
}

/**
 * Cờ đỏ sao vàng 5 cánh Tổ quốc Việt Nam
 */
function createVietnamFlagTexture(scene, id) {
  const dt = new DynamicTexture(`dt-flag-${id}`, { width: 300, height: 200 }, scene, false);
  const ctx = dt.getContext();
  // Nền đỏ thắm
  ctx.fillStyle = '#da251d';
  ctx.fillRect(0, 0, 300, 200);

  // Ngôi sao vàng 5 cánh chuẩn tỉ lệ
  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  const cx = 150, cy = 100, outerR = 54, innerR = 21;
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  dt.update();
  return dt;
}

/**
 * Tem Decal sườn xe du lịch City Tour Việt Nam
 */
function createVietnamSideLiveryTexture(scene, id, routeNum, routeName) {
  const dt = new DynamicTexture(`dt-livery-${id}`, { width: 512, height: 64 }, scene, false);
  const ctx = dt.getContext();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 64);

  // Dải lượn sóng cờ đỏ sao vàng
  ctx.fillStyle = '#da251d';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(120, 0);
  ctx.lineTo(80, 64);
  ctx.lineTo(0, 64);
  ctx.fill();

  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(110, 0);
  ctx.lineTo(135, 0);
  ctx.lineTo(95, 64);
  ctx.lineTo(70, 64);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 24px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`VIETNAM CITY TOUR · ${routeName.toUpperCase()}`, 148, 33);

  dt.update();
  return dt;
}

/**
 * Creates one Chibi Retro Bus for the fleet.
 */
function createChibiBus(scene, shadows, config, materials) {
  const root = new TransformNode(config.id, scene);
  const bodyMat = makeMat(scene, `mat-body-${config.id}`, config.bodyColor);
  const accentMat = makeMat(scene, `mat-accent-${config.id}`, config.accentColor);
  const ledDT = createLedSignTexture(scene, config.id, config.routeName, config.routeCode, config.ledColor || '#38bdf8');
  const ledMat = new StandardMaterial(`mat-led-${config.id}`, scene);
  ledMat.diffuseTexture = ledDT;
  ledMat.emissiveTexture = ledDT;
  ledMat.emissiveColor = new Color3(0.9, 0.9, 0.9);

  // 1. Lower Body Chassis (Tầng 1 - Khoang máy lạnh và buồng lái)
  const lowerBody = MeshBuilder.CreateBox(`${config.id}-lower-body`, { width: 3.4, height: 1.55, depth: 7.8 }, scene);
  lowerBody.position.set(0, 1.25, 0);
  lowerBody.material = bodyMat;
  lowerBody.parent = root;

  // Ốp sườn gầm xe màu xám đen thể thao (Chassis Lower Skirt)
  const chassisSkirt = MeshBuilder.CreateBox(`${config.id}-chassis-skirt`, { width: 3.46, height: 0.30, depth: 7.84 }, scene);
  chassisSkirt.position.set(0, 0.65, 0);
  chassisSkirt.material = materials.vnGrille;
  chassisSkirt.parent = root;

  // 2. Tầng 1 Buồng lái: Kính chắn gió lớn buồng lái tầng 1 (Lower Driver Windshield)
  const lowerWindshield = MeshBuilder.CreateBox(`${config.id}-lower-windshield`, { width: 3.12, height: 0.82, depth: 0.12 }, scene);
  lowerWindshield.position.set(0, 1.50, 3.92);
  lowerWindshield.rotation.x = -0.10;
  lowerWindshield.material = materials.glass;
  lowerWindshield.parent = root;

  // Táp-lô & Vô-lăng lái xe buýt bên trong tầng 1
  const lowerDash = MeshBuilder.CreateBox(`${config.id}-lower-dash`, { width: 2.8, height: 0.35, depth: 0.75 }, scene);
  lowerDash.position.set(0, 1.20, 3.45);
  lowerDash.material = materials.vnGrille;
  lowerDash.parent = root;

  const steeringWheel = MeshBuilder.CreateTorus(`${config.id}-steering-wheel`, { diameter: 0.38, thickness: 0.04, tessellation: 16 }, scene);
  steeringWheel.rotation.x = 0.55;
  steeringWheel.position.set(-0.75, 1.45, 3.4);
  steeringWheel.material = materials.vnGrille;
  steeringWheel.parent = root;

  // Cần gạt nước đôi Inox trên kính lái tầng 1
  [-0.6, 0.6].forEach((wx, wIdx) => {
    const wiper = MeshBuilder.CreateBox(`${config.id}-wiper-${wIdx}`, { width: 0.035, height: 0.42, depth: 0.03 }, scene);
    wiper.position.set(wx, 1.45, 3.98);
    wiper.rotation.z = -0.38;
    wiper.material = materials.chrome;
    wiper.parent = root;
  });

  // Bảng LED điện tử Lộ Trình Xe Buýt trên trán kính tầng 1 (Quay mặt ra phía trước +Z đón khách)
  const frontSign = MeshBuilder.CreatePlane(`${config.id}-front-sign`, { width: 2.3, height: 0.38 }, scene);
  frontSign.position.set(0, 1.96, 3.94);
  frontSign.rotation.y = Math.PI; // Xoay 180 độ để chữ LED hướng ra mặt trước xe
  frontSign.material = ledMat;
  frontSign.parent = root;

  // Dãy cửa sổ kính đen tầng 1 (4 ô cửa sổ mỗi bên)
  [-1.71, 1.71].forEach((wx, wIdx) => {
    [-2.2, -0.9, 0.4, 1.7].forEach((wz, zIdx) => {
      // Bên hông phải tại Z=1.7 để làm cửa lên xuống xe buýt
      if (wIdx === 1 && zIdx === 3) return;
      const win = MeshBuilder.CreateBox(`${config.id}-t1-win-${wIdx}-${zIdx}`, { width: 0.08, height: 0.65, depth: 1.15 }, scene);
      win.position.set(wx, 1.55, wz);
      win.material = materials.tintedGlass;
      win.parent = root;

      const frame = MeshBuilder.CreateBox(`${config.id}-t1-frame-${wIdx}-${zIdx}`, { width: 0.09, height: 0.70, depth: 1.20 }, scene);
      frame.position.set(wx, 1.55, wz);
      frame.material = materials.chrome;
      frame.parent = root;
    });
  });

  // Cửa lên xuống tự động xe buýt Việt Nam (bên hông phải X = 1.71, Z = 1.75)
  const doorFrame = MeshBuilder.CreateBox(`${config.id}-door-frame`, { width: 0.12, height: 1.35, depth: 1.20 }, scene);
  doorFrame.position.set(1.70, 1.25, 1.75);
  doorFrame.material = materials.chrome;
  doorFrame.parent = root;

  const doorGlass = MeshBuilder.CreateBox(`${config.id}-door-glass`, { width: 0.06, height: 1.22, depth: 1.08 }, scene);
  doorGlass.position.set(1.72, 1.25, 1.75);
  doorGlass.material = materials.glass;
  doorGlass.parent = root;

  // Bậc lên xuống màu vàng đen chống trượt & Tay vịn đón khách
  const stepStripe = MeshBuilder.CreateBox(`${config.id}-door-step`, { width: 0.35, height: 0.12, depth: 1.12 }, scene);
  stepStripe.position.set(1.72, 0.65, 1.75);
  stepStripe.material = materials.stepYellow;
  stepStripe.parent = root;

  const doorHandrail = MeshBuilder.CreateCylinder(`${config.id}-door-handrail`, { height: 1.2, diameter: 0.05, tessellation: 8 }, scene);
  doorHandrail.position.set(1.72, 1.25, 2.28);
  doorHandrail.material = materials.goldRail;
  doorHandrail.parent = root;

  // 3. Tầng 2: Sàn mui trần ngắm cảnh lộ thiên chạy suốt chiều dài xe (Full-Length Observation Deck)
  // Sàn gỗ Teak sang trọng từ Z = -3.8 đến Z = +3.8
  const deckFloor = MeshBuilder.CreateBox(`${config.id}-deck-floor`, { width: 3.16, height: 0.10, depth: 7.6 }, scene);
  deckFloor.position.set(0, 2.08, 0);
  deckFloor.material = materials.deckTeak;
  deckFloor.parent = root;

  // Nẹp nhôm phân chia khoang sàn gỗ sang trọng
  [-2.0, -0.8, 0.4, 1.6, 2.8].forEach((nz, nIdx) => {
    const strip = MeshBuilder.CreateBox(`${config.id}-floor-strip-${nIdx}`, { width: 3.12, height: 0.015, depth: 0.04 }, scene);
    strip.position.set(0, 2.14, nz);
    strip.material = materials.chrome;
    strip.parent = root;
  });

  // Thành be bo thấp bảo vệ quanh tầng 2 (Coaming Walls)
  const leftWall = MeshBuilder.CreateBox(`${config.id}-left-wall`, { width: 0.16, height: 0.38, depth: 7.6 }, scene);
  leftWall.position.set(-1.54, 2.28, 0);
  leftWall.material = accentMat;
  leftWall.parent = root;

  const rightWall = MeshBuilder.CreateBox(`${config.id}-right-wall`, { width: 0.16, height: 0.38, depth: 7.6 }, scene);
  rightWall.position.set(1.54, 2.28, 0);
  rightWall.material = accentMat;
  rightWall.parent = root;

  const rearWall = MeshBuilder.CreateBox(`${config.id}-rear-wall`, { width: 3.24, height: 0.38, depth: 0.16 }, scene);
  rearWall.position.set(0, 2.28, -3.8);
  rearWall.material = accentMat;
  rearWall.parent = root;

  // Vòm bo đầu xe tầng 2 thấp nhẹ nhàng (Hoàn toàn không cản tầm nhìn)
  const frontCowl = MeshBuilder.CreateBox(`${config.id}-front-cowl`, { width: 3.24, height: 0.38, depth: 0.16 }, scene);
  frontCowl.position.set(0, 2.28, 3.8);
  frontCowl.material = accentMat;
  frontCowl.parent = root;

  // 4. Lan can an toàn Inox 304 sáng bóng (Chrome Safety Railings)
  const leftRail = MeshBuilder.CreateCylinder(`${config.id}-left-rail`, { height: 7.6, diameter: 0.08, tessellation: 10 }, scene);
  leftRail.rotation.x = Math.PI / 2;
  leftRail.position.set(-1.52, 2.70, 0);
  leftRail.material = materials.chrome;
  leftRail.parent = root;

  const rightRail = MeshBuilder.CreateCylinder(`${config.id}-right-rail`, { height: 7.6, diameter: 0.08, tessellation: 10 }, scene);
  rightRail.rotation.x = Math.PI / 2;
  rightRail.position.set(1.52, 2.70, 0);
  rightRail.material = materials.chrome;
  rightRail.parent = root;

  const rearRail = MeshBuilder.CreateCylinder(`${config.id}-rear-rail`, { height: 3.12, diameter: 0.08, tessellation: 10 }, scene);
  rearRail.rotation.z = Math.PI / 2;
  rearRail.position.set(0, 2.70, -3.8);
  rearRail.material = materials.chrome;
  rearRail.parent = root;

  // Thanh vịn ngắm cảnh mạ vàng đầu xe tầng 2 (Front Observation Safety Crossbar)
  const frontDeckRail = MeshBuilder.CreateCylinder(`${config.id}-front-deck-rail`, { height: 3.12, diameter: 0.08, tessellation: 10 }, scene);
  frontDeckRail.rotation.z = Math.PI / 2;
  frontDeckRail.position.set(0, 2.70, 3.78);
  frontDeckRail.material = materials.goldRail;
  frontDeckRail.parent = root;

  // Kính chắn gió tầng 2 trong suốt bảo vệ hành khách (Upper Deck Windscreen)
  const frontDeckGlass = MeshBuilder.CreateBox(`${config.id}-deck-front-glass`, { width: 3.12, height: 0.50, depth: 0.08 }, scene);
  frontDeckGlass.position.set(0, 2.54, 3.80);
  frontDeckGlass.material = materials.glass;
  frontDeckGlass.parent = root;

  // Trụ đứng lan can Inox (Vertical Chrome Stanchion Posts)
  [-1.52, 1.52].forEach((sx, i) => {
    [-3.8, -2.2, -0.6, 1.0, 2.6, 3.78].forEach((sz, j) => {
      const stanchion = MeshBuilder.CreateCylinder(`${config.id}-stanchion-${i}-${j}`, { height: 0.44, diameter: 0.07, tessellation: 8 }, scene);
      stanchion.position.set(sx, 2.48, sz);
      stanchion.material = materials.chrome;
      stanchion.parent = root;
    });
  });

  // Tấm chắn gió mica trong suốt 2 bên tầng 2 (Acrylic Deflectors)
  const leftDeflector = MeshBuilder.CreateBox(`${config.id}-left-deflector`, { width: 0.05, height: 0.32, depth: 7.4 }, scene);
  leftDeflector.position.set(-1.52, 2.52, 0);
  leftDeflector.material = materials.glass;
  leftDeflector.parent = root;

  const rightDeflector = MeshBuilder.CreateBox(`${config.id}-right-deflector`, { width: 0.05, height: 0.32, depth: 7.4 }, scene);
  rightDeflector.position.set(1.52, 2.52, 0);
  rightDeflector.material = materials.glass;
  rightDeflector.parent = root;

  // 5. Cột tay vịn đứng Inox mạ vàng & Quai móc nắm tay phong cách xe buýt
  [-0.5, 0.5].forEach((gx, idx) => {
    [0.2, 1.8].forEach((gz, zIdx) => {
      const grabPole = MeshBuilder.CreateCylinder(`${config.id}-grab-pole-${idx}-${zIdx}`, { height: 1.40, diameter: 0.07, tessellation: 8 }, scene);
      grabPole.position.set(gx, 2.75, gz);
      grabPole.material = materials.goldRail;
      grabPole.parent = root;

      const ringGrip = MeshBuilder.CreateTorus(`${config.id}-ring-grip-${idx}-${zIdx}`, { diameter: 0.20, thickness: 0.03, tessellation: 12 }, scene);
      ringGrip.position.set(gx, 3.22, gz);
      ringGrip.material = materials.goldRail;
      ringGrip.parent = root;
    });
  });

  // 6. Hàng ghế đôi City Tour Việt Nam (4 hàng ghế nệm nhung đỏ đô mỗi bên sàn xe)
  [-0.92, 0.92].forEach((bx, idx) => {
    [-2.4, -1.2, 0.0, 1.2].forEach((bz, rIdx) => {
      // Chân ghế Inox
      const leg = MeshBuilder.CreateCylinder(`${config.id}-seat-leg-${idx}-${rIdx}`, { height: 0.28, diameter: 0.06, tessellation: 8 }, scene);
      leg.position.set(bx, 2.22, bz);
      leg.material = materials.chrome;
      leg.parent = root;

      // Nệm ghế nhung đỏ đô cao cấp
      const seatCushion = MeshBuilder.CreateBox(`${config.id}-seat-cushion-${idx}-${rIdx}`, { width: 0.88, height: 0.16, depth: 0.65 }, scene);
      seatCushion.position.set(bx, 2.36, bz);
      seatCushion.material = materials.cushionRed;
      seatCushion.parent = root;

      // Tựa lưng ghế đệm đỏ
      const seatBack = MeshBuilder.CreateBox(`${config.id}-seat-back-${idx}-${rIdx}`, { width: 0.88, height: 0.42, depth: 0.12 }, scene);
      seatBack.position.set(bx, 2.60, bz - 0.28);
      seatBack.material = materials.cushionRed;
      seatBack.parent = root;

      // Viền nẹp vàng sau tựa lưng
      const backTrim = MeshBuilder.CreateBox(`${config.id}-seat-trim-${idx}-${rIdx}`, { width: 0.90, height: 0.04, depth: 0.13 }, scene);
      backTrim.position.set(bx, 2.80, bz - 0.28);
      backTrim.material = materials.goldRail;
      backTrim.parent = root;

      // Gối tựa đầu da đỏ thẫm êm ái
      const headrest = MeshBuilder.CreateBox(`${config.id}-seat-headrest-${idx}-${rIdx}`, { width: 0.84, height: 0.16, depth: 0.14 }, scene);
      headrest.position.set(bx, 2.88, bz - 0.28);
      headrest.material = materials.cushionHeadrest;
      headrest.parent = root;
    });
  });

  // 7. Cột cờ Inox & Cờ Đỏ Sao Vàng Tổ Quốc Việt Nam (Vietnam National Flag)
  const flagPole = MeshBuilder.CreateCylinder(`${config.id}-flag-pole`, { height: 1.4, diameter: 0.04, tessellation: 8 }, scene);
  flagPole.position.set(-1.46, 3.35, -3.75);
  flagPole.material = materials.chrome;
  flagPole.parent = root;

  const flagTopper = MeshBuilder.CreateSphere(`${config.id}-flag-topper`, { diameter: 0.12, segments: 8 }, scene);
  flagTopper.position.set(-1.46, 4.07, -3.75);
  flagTopper.material = materials.goldRail;
  flagTopper.parent = root;

  const flagDT = createVietnamFlagTexture(scene, config.id);
  const flagMat = new StandardMaterial(`mat-flag-${config.id}`, scene);
  flagMat.diffuseTexture = flagDT;
  flagMat.emissiveColor = new Color3(0.5, 0.1, 0.1);
  flagMat.backFaceCulling = false;

  const vnFlagMesh = MeshBuilder.CreatePlane(`${config.id}-vn-flag`, { width: 0.72, height: 0.48 }, scene);
  vnFlagMesh.position.set(-1.46, 3.75, -3.37);
  vnFlagMesh.rotation.y = Math.PI / 2;
  vnFlagMesh.material = flagMat;
  vnFlagMesh.parent = root;

  // 8. Mặt Ca-Lăng Tản Nhiệt Tổ Ong & Huy Hiệu Ngôi Sao Vàng Việt Nam (Thaco/Universe Style)
  const grilleBox = MeshBuilder.CreateBox(`${config.id}-grille`, { width: 2.3, height: 0.55, depth: 0.12 }, scene);
  grilleBox.position.set(0, 1.15, 3.96);
  grilleBox.material = materials.vnGrille;
  grilleBox.parent = root;

  [-0.15, 0, 0.15].forEach((slatY, sIdx) => {
    const slat = MeshBuilder.CreateBox(`${config.id}-grille-slat-${sIdx}`, { width: 2.25, height: 0.035, depth: 0.13 }, scene);
    slat.position.set(0, 1.15 + slatY, 3.97);
    slat.material = materials.chrome;
    slat.parent = root;
  });

  // Huy hiệu Ngôi Sao Vàng dập nổi 3D
  const starMedallion = MeshBuilder.CreateCylinder(`${config.id}-star-medallion`, { diameter: 0.44, height: 0.04, tessellation: 20 }, scene);
  starMedallion.rotation.x = Math.PI / 2;
  starMedallion.position.set(0, 1.15, 4.04);
  starMedallion.material = materials.goldRail;
  starMedallion.parent = root;

  const goldenStar = MeshBuilder.CreateCylinder(`${config.id}-golden-star-3d`, { diameter: 0.32, height: 0.06, tessellation: 5 }, scene);
  goldenStar.rotation.x = Math.PI / 2;
  goldenStar.position.set(0, 1.15, 4.07);
  goldenStar.material = materials.vnStarYellow;
  goldenStar.parent = root;

  // 9. Cặp Gương Chiếu Hậu "Tai Thỏ" Xe Khách / Xe Buýt Việt Nam (Bunny-ear Mirrors)
  [-1, 1].forEach((dir) => {
    const mx = dir * 1.88;
    // Cần gương uốn cong từ cột A tầng 1
    const mirrorArm = MeshBuilder.CreateCylinder(`${config.id}-mirror-arm-${dir}`, { height: 0.75, diameter: 0.045, tessellation: 8 }, scene);
    mirrorArm.rotation.z = dir * 0.42;
    mirrorArm.rotation.x = 0.28;
    mirrorArm.position.set(dir * 1.76, 2.50, 3.65);
    mirrorArm.material = materials.vnGrille;
    mirrorArm.parent = root;

    // Củ gương hình chữ nhật đứng bo góc
    const mirrorHousing = MeshBuilder.CreateBox(`${config.id}-mirror-housing-${dir}`, { width: 0.22, height: 0.54, depth: 0.12 }, scene);
    mirrorHousing.position.set(mx, 2.30, 3.75);
    mirrorHousing.material = materials.vnGrille;
    mirrorHousing.parent = root;

    // Dải LED xi-nhan vàng trên ốp trước gương
    const mirrorBlinker = MeshBuilder.CreateBox(`${config.id}-mirror-blinker-${dir}`, { width: 0.18, height: 0.06, depth: 0.04 }, scene);
    mirrorBlinker.position.set(mx, 2.30, 3.82);
    mirrorBlinker.material = materials.blinkerOn;
    mirrorBlinker.parent = root;

    // Mặt kính gương phản chiếu hướng về đuôi xe
    const mirrorGlass = MeshBuilder.CreatePlane(`${config.id}-mirror-glass-${dir}`, { width: 0.18, height: 0.48 }, scene);
    mirrorGlass.rotation.y = Math.PI;
    mirrorGlass.position.set(mx, 2.30, 3.68);
    mirrorGlass.material = materials.mirrorGlass;
    mirrorGlass.parent = root;
  });

  // 10. Cặp Loa Phát Thanh Thuyết Minh Du Lịch Mini Trên Lan Can (PA Tour Speakers)
  [-0.95, 0.95].forEach((spkX, sIdx) => {
    const speaker = MeshBuilder.CreateCylinder(`${config.id}-speaker-${sIdx}`, { diameterTop: 0.16, diameterBottom: 0.06, height: 0.22, tessellation: 12 }, scene);
    speaker.rotation.x = -Math.PI / 2.3;
    speaker.position.set(spkX, 2.80, 1.46);
    speaker.material = materials.speakerMat;
    speaker.parent = root;
  });

  // 11. Biển Số Xe Vận Tải Màu Vàng Nghệ Việt Nam (Trước & Sau)
  const plateNumber = config.plateNumber || '29B - 888.68';
  const plateDT = createVietnamLicensePlateTexture(scene, config.id, plateNumber);
  const plateMat = new StandardMaterial(`mat-plate-${config.id}`, scene);
  plateMat.diffuseTexture = plateDT;
  plateMat.emissiveColor = new Color3(0.3, 0.3, 0.1);

  // Biển số trước (Z = 4.20)
  const frontPlateHolder = MeshBuilder.CreateBox(`${config.id}-f-plate-holder`, { width: 1.40, height: 0.42, depth: 0.04 }, scene);
  frontPlateHolder.position.set(0, 0.68, 4.18);
  frontPlateHolder.material = materials.vnGrille;
  frontPlateHolder.parent = root;

  const frontPlate = MeshBuilder.CreatePlane(`${config.id}-f-plate`, { width: 1.34, height: 0.36 }, scene);
  frontPlate.position.set(0, 0.68, 4.21);
  frontPlate.material = plateMat;
  frontPlate.parent = root;

  // Biển số sau (Z = -3.98)
  const rearPlateHolder = MeshBuilder.CreateBox(`${config.id}-r-plate-holder`, { width: 1.40, height: 0.42, depth: 0.04 }, scene);
  rearPlateHolder.position.set(0, 0.68, -3.96);
  rearPlateHolder.material = materials.vnGrille;
  rearPlateHolder.parent = root;

  const rearPlate = MeshBuilder.CreatePlane(`${config.id}-r-plate`, { width: 1.34, height: 0.36 }, scene);
  rearPlate.rotation.y = Math.PI;
  rearPlate.position.set(0, 0.68, -3.99);
  rearPlate.material = plateMat;
  rearPlate.parent = root;

  // 12. Decal Tem Sườn Xe Du Lịch City Tour Việt Nam (Hai bên hông xe)
  const liveryDT = createVietnamSideLiveryTexture(scene, config.id, config.routeCode, config.routeName);
  const liveryMat = new StandardMaterial(`mat-livery-${config.id}`, scene);
  liveryMat.diffuseTexture = liveryDT;
  liveryMat.emissiveColor = new Color3(0.4, 0.4, 0.4);

  [-1.71, 1.71].forEach((lx, lIdx) => {
    const sideLivery = MeshBuilder.CreatePlane(`${config.id}-side-livery-${lIdx}`, { width: 5.2, height: 0.48 }, scene);
    sideLivery.rotation.y = lIdx === 0 ? -Math.PI / 2 : Math.PI / 2;
    sideLivery.position.set(lx, 1.48, -0.4);
    sideLivery.material = liveryMat;
    sideLivery.parent = root;
  });

  // 13. Ống xả kép thể thao mạ crom
  [-0.9, 0.9].forEach((exX, eIdx) => {
    const exhaust = MeshBuilder.CreateCylinder(`${config.id}-exhaust-${eIdx}`, { height: 0.35, diameter: 0.14, tessellation: 12 }, scene);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(exX, 0.58, -3.95);
    exhaust.material = materials.exhaustChrome;
    exhaust.parent = root;
  });

  // 14. Cản trước & cản sau thể thao Chrome Bumpers
  const frontBumper = MeshBuilder.CreateBox(`${config.id}-f-bumper`, { width: 3.55, height: 0.34, depth: 0.38 }, scene);
  frontBumper.position.set(0, 0.72, 3.98);
  frontBumper.material = materials.chrome;
  frontBumper.parent = root;

  const rearBumper = MeshBuilder.CreateBox(`${config.id}-r-bumper`, { width: 3.55, height: 0.34, depth: 0.38 }, scene);
  rearBumper.position.set(0, 0.72, -3.88);
  rearBumper.material = materials.chrome;
  rearBumper.parent = root;

  // 15. Đèn Pha Projector Mắt Đại Bàng & Đèn Sương Mù Vàng Chanh
  [-1.25, 1.25].forEach((hx, i) => {
    const headlight = MeshBuilder.CreateSphere(`${config.id}-headlight-${i}`, { diameter: 0.50, segments: 8 }, scene);
    headlight.position.set(hx, 1.15, 3.96);
    headlight.material = materials.headlight;
    headlight.parent = root;

    const taillight = MeshBuilder.CreateSphere(`${config.id}-taillight-${i}`, { diameter: 0.42, segments: 6 }, scene);
    taillight.position.set(hx, 1.15, -3.88);
    taillight.material = materials.taillight;
    taillight.parent = root;
  });

  // Đèn sương mù vàng chanh hai bên cản trước
  [-1.35, 1.35].forEach((fx, i) => {
    const foglight = MeshBuilder.CreateSphere(`${config.id}-foglight-${i}`, { diameter: 0.28, segments: 6 }, scene);
    foglight.position.set(fx, 0.78, 4.05);
    foglight.material = materials.foglight;
    foglight.parent = root;
  });

  // 16. Hazard Blinker Lights (Amber)
  const blinkers = [];
  [-1.5, 1.5].forEach((bx, i) => {
    [-3.7, 3.7].forEach((bz, j) => {
      const bl = MeshBuilder.CreateSphere(`${config.id}-blinker-${i}-${j}`, { diameter: 0.28, segments: 6 }, scene);
      bl.position.set(bx, 1.6, bz);
      bl.material = materials.blinkerOff;
      bl.parent = root;
      blinkers.push(bl);
    });
  });

  // 17. 4 Rolling Rubber Tires
  const wheels = [];
  [-1.65, 1.65].forEach(wx => {
    [-2.3, 2.3].forEach(wz => {
      const wheelNode = new TransformNode(`${config.id}-wheel-node`, scene);
      wheelNode.position.set(wx, 0.65, wz);
      wheelNode.parent = root;

      const tire = MeshBuilder.CreateCylinder(`${config.id}-tire`, { height: 0.42, diameter: 1.28, tessellation: 16 }, scene);
      tire.rotation.z = Math.PI / 2;
      tire.material = materials.tire;
      tire.parent = wheelNode;

      const hubcap = MeshBuilder.CreateCylinder(`${config.id}-hubcap`, { height: 0.45, diameter: 0.65, tessellation: 12 }, scene);
      hubcap.rotation.z = Math.PI / 2;
      hubcap.material = materials.chrome;
      hubcap.parent = wheelNode;

      wheels.push(tire);
    });
  });

  // 18. Passenger Sightseeing Deck Node (Player stands upright on the open observation deck)
  // Đặt tại Z = 2.8: Đứng sát thanh vịn mạ vàng đầu xe tầng 2, tầm nhìn 360° bao la lộng gió!
  const passengerSeatNode = new TransformNode(`${config.id}-seat`, scene);
  passengerSeatNode.position.set(0.0, 2.14, 2.8);
  passengerSeatNode.parent = root;

  if (shadows) {
    [lowerBody, frontBumper].forEach(m => shadows.addShadowCaster(m));
  }

  // Seats, trim and chassis move together: hundreds of parts become a few
  // material draws. Wheels and hazard lights retain independent animation.
  batchRigidMeshes(root, { exclude: new Set(blinkers), shadows });

  // Pre-calculate segment lengths for route
  const waypoints = config.waypoints;
  const segmentLengths = [];
  for (let i = 0; i < waypoints.length; i++) {
    const nextIdx = (i + 1) % waypoints.length;
    const len = Vector3.Distance(waypoints[i], waypoints[nextIdx]);
    segmentLengths.push(len);
  }

  // Initial placement offset so buses are spaced out nicely
  let currentSegment = config.initialSegment || 0;
  let segmentProgress = config.initialProgress || 0;
  root.position.copyFrom(waypoints[currentSegment]);

  // Bus FSM State
  // 'CRUISING' | 'BRAKING' | 'DWELLING' | 'ACCELERATING'
  let state = 'CRUISING';
  const CRUISE_SPEED = config.cruiseSpeed || 48.0; // 48 m/s (~173 km/h express speed)
  let currentSpeed = CRUISE_SPEED;
  let dwellTimer = 0;
  const maxDwellTime = 2.4; // 2.4s dwell at stations for rapid transit & minimal waiting
  let currentStation = null;
  let nextStation = config.stops[0] || null;
  let blinkerPulse = 0;

  return {
    id: config.id,
    routeCode: config.routeCode,
    routeName: config.routeName,
    bodyColor: config.bodyColor,
    root,
    passengerSeatNode,
    getCurrentStation: () => currentStation,
    getNextStation: () => nextStation,
    getCurrentSpeed: () => currentSpeed,
    getState: () => state,
    getDwellRemaining: () => Math.max(0, maxDwellTime - dwellTimer),
    isDwelling: () => state === 'DWELLING',

    update(delta) {
      const segLen = segmentLengths[currentSegment] || 1;

      // Check upcoming station along route
      const upcomingStop = config.stops.find(s => s.waypointIndex === (currentSegment + 1) % waypoints.length);

      if (state === 'CRUISING') {
        currentSpeed = CRUISE_SPEED;
        // Turn off blinkers
        blinkers.forEach(b => { b.material = materials.blinkerOff; });

        // If approaching a scheduled stop within 28m, start smooth braking
        if (upcomingStop) {
          const distToEnd = (1 - segmentProgress) * segLen;
          if (distToEnd <= 28.0) {
            state = 'BRAKING';
          }
        }
      } else if (state === 'BRAKING') {
        const distToEnd = Math.max(0.1, (1 - segmentProgress) * segLen);
        currentSpeed = Math.max(4.0, CRUISE_SPEED * Math.sqrt(distToEnd / 28.0));
      } else if (state === 'DWELLING') {
        currentSpeed = 0;
        dwellTimer += delta;

        // Pulse amber hazard blinkers
        blinkerPulse += delta * 8;
        const blinkerOn = Math.sin(blinkerPulse) > 0;
        blinkers.forEach(b => { b.material = blinkerOn ? materials.blinkerOn : materials.blinkerOff; });

        if (dwellTimer >= maxDwellTime) {
          dwellTimer = 0;
          state = 'ACCELERATING';
          currentStation = null;
        }
      } else if (state === 'ACCELERATING') {
        currentSpeed = Math.min(CRUISE_SPEED, currentSpeed + delta * 26.0);
        if (currentSpeed >= CRUISE_SPEED * 0.95) {
          state = 'CRUISING';
        }
      }

      // Progress along route
      if (state !== 'DWELLING') {
        const moveDist = currentSpeed * delta;
        segmentProgress += moveDist / segLen;

        if (segmentProgress >= 1.0) {
          segmentProgress = 0;
          currentSegment = (currentSegment + 1) % waypoints.length;

          // Check if arrived at a station stop
          const arrivedStop = config.stops.find(s => s.waypointIndex === currentSegment);
          if (arrivedStop && state === 'BRAKING') {
            state = 'DWELLING';
            dwellTimer = 0;
            currentStation = arrivedStop;
            // Update next station target
            const stopIdx = config.stops.findIndex(s => s.id === arrivedStop.id);
            nextStation = config.stops[(stopIdx + 1) % config.stops.length];
          }
        }
      }

      // Update position & rotation
      const curStart = waypoints[currentSegment];
      const curEnd = waypoints[(currentSegment + 1) % waypoints.length];
      Vector3.LerpToRef(curStart, curEnd, segmentProgress, root.position);
      root.position.y=getTerrainHeight(root.position.x,root.position.z);

      const targetYaw = Math.atan2(curEnd.x - curStart.x, curEnd.z - curStart.z);
      // Smooth yaw rotation
      let diff = targetYaw - root.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      root.rotation.y += diff * Math.min(1, delta * 12);

      // Rotate wheels with actual transit speed
      if (currentSpeed > 0.1) {
        wheels.forEach(w => {
          w.rotation.x += delta * (currentSpeed * 1.8);
        });
      }
    },
  };
}

/**
 * Creates the entire 8-bus inter-village fleet and 16 correctly oriented shelters.
 */
export function createBusRoute(scene, shadows) {
  const steps = createBusRouteSteps(scene, shadows);
  let result;
  do { result = steps.next(); } while (!result.done);
  return result.value;
}

export function* createBusRouteSteps(scene, shadows) {
  const materials = {
    timber: makeMat(scene, 'bus-stop-timber', '#543621'),
    bench: makeMat(scene, 'bus-stop-bench', '#8b5a2b'),
    tileRoof: makeMat(scene, 'bus-stop-roof', '#b93b2a'),
    signYellow: makeMat(scene, 'bus-stop-sign', '#f59e0b', '#d97706'),
    chrome: makeMat(scene, 'bus-chrome', '#f8fafc'),
    glass: makeMat(scene, 'bus-glass', '#bae6fd', '#38bdf8'),
    tire: makeMat(scene, 'bus-tire', '#1e293b'),
    headlight: makeMat(scene, 'bus-headlight', '#ffffff', '#fef08a'),
    taillight: makeMat(scene, 'bus-taillight', '#ef4444', '#b91c1c'),
    blinkerOff: makeMat(scene, 'bus-blinker-off', '#78350f'),
    blinkerOn: makeMat(scene, 'bus-blinker-on', '#f59e0b', '#fbbf24'),
    deckTeak: makeMat(scene, 'bus-deck-teak', '#a26b38', '#78350f'),
    goldRail: makeMat(scene, 'bus-gold-rail', '#fcd34d', '#f59e0b'),
    pennant: makeMat(scene, 'bus-pennant', '#f43f5e', '#fb7185'),
    vnGrille: makeMat(scene, 'bus-vn-grille', '#0f172a', '#020617'),
    vnStarYellow: makeMat(scene, 'bus-vn-star', '#ffea00', '#f59e0b'),
    mirrorGlass: makeMat(scene, 'bus-mirror', '#e2e8f0', '#94a3b8'),
    foglight: makeMat(scene, 'bus-foglight', '#fef08a', '#facc15'),
    cushionRed: makeMat(scene, 'bus-cushion-red', '#b91c1c', '#7f1d1d'),
    cushionHeadrest: makeMat(scene, 'bus-headrest', '#991b1b', '#7f1d1d'),
    speakerMat: makeMat(scene, 'bus-speaker', '#1e293b', '#0f172a'),
    tintedGlass: makeMat(scene, 'bus-tinted-glass', '#0f172a', '#1e293b'),
    stepYellow: makeMat(scene, 'bus-step-yellow', '#facc15', '#b45309'),
    exhaustChrome: makeMat(scene, 'bus-exhaust', '#f8fafc', '#94a3b8'),
  };
  materials.glass.alpha = 0.55;
  materials.tintedGlass.alpha = 0.85;

  // 19 Chibi Ghibli Bus Stop Shelters - 100% CORRECTLY FACING ROADS:
  // 4 Trạm cuối (Gateway Terminals) tại 4 cửa ngõ giáp Quảng trường trung tâm (Bắc, Nam, Đông, Tây)
  // Xe buýt từ các làng chạy đến các trạm này dừng đón/trả khách rồi quay đầu, tuyệt đối không vào quảng trường.
  const shelters = [
    // 1. Bốn trạm cuối Gateway Terminals tại 4 cửa ngõ Quảng trường (trên vỉa hè rộng 2.6m, cách mép đường 4.25m):
    { x: 6.2, z: 54, name: 'Trạm Cửa Nam - Quảng Trường', badge: 'Tuyến 01 · 02', rot: Math.PI / 2 },
    { x: 6.2, z: -54, name: 'Trạm Cửa Bắc - Tòa Thị Chính', badge: 'Tuyến 03', rot: Math.PI / 2 },
    { x: -54, z: 6.2, name: 'Trạm Cửa Tây - Phố Chợ', badge: 'Tuyến 04A', rot: 0 },
    { x: 54, z: 6.2, name: 'Trạm Cửa Đông - Hồ Pha Lê', badge: 'Tuyến 04B', rot: 0 },

    // 2. Trục Đại lộ Nam (x = 0):
    // Bình Minh already has the smart shelter at (9.6, 80). A second wooden
    // shelter at (6.2, 98) occupied the farm crossroad in front of lot 3.
    { ...COASTAL_BUS_CONFIG.shelter, name: 'Bãi Biển Bình Minh', badge: 'Tuyến 02', rot: Math.PI },
    { x: 6.0, z: -380, name: 'Làng Phú Điền', badge: 'Tuyến 03', rot: Math.PI / 2 },

    // 3. Trục Quốc Lộ 86 (z = 86): trạm đặt bên lề cạnh cổng làng, không chắn ngã ba cổng làng
    { x: -282, z: 80.8, name: 'Làng Hoa Mai', badge: 'Tuyến 01', rot: Math.PI },
    { x: -582, z: 80.8, name: 'Làng Đồi Gió', badge: 'Tuyến 01', rot: Math.PI },
    { x: 318, z: 80.8, name: 'Làng Ven Sông', badge: 'T1 · T4', rot: Math.PI },
    { x: 582, z: 80.8, name: 'Làng An Nhiên', badge: 'Tuyến 01', rot: Math.PI },

    // 4. Trục Quốc Lộ Nam 406 (z = 406):
    { x: -282, z: 400.8, name: 'Làng Thu Phong', badge: 'Tuyến 02', rot: Math.PI },
    { x: 318, z: 400.8, name: 'Làng Hướng Dương', badge: 'Tuyến 02', rot: Math.PI },

    // 5. Trục Quốc Lộ Bắc -234 (z = -234):
    { x: -282, z: -239.2, name: 'Làng Thanh Hà', badge: 'Tuyến 03', rot: Math.PI },
    { x: -582, z: -239.2, name: 'Làng Mộc Lan', badge: 'Tuyến 03', rot: Math.PI },
    { x: 318, z: -239.2, name: 'Làng Tân Lộc', badge: 'Tuyến 03', rot: Math.PI },
    { x: 582, z: -239.2, name: 'Làng Hải Vân', badge: 'Tuyến 03', rot: Math.PI },

    // 6. Trục Phố Chợ & Vùng Hồ:
    { x: -118, z: 6.2, name: 'Phố Chợ Phía Tây', badge: 'Tuyến 04A', rot: 0 },
    { x: LAKE_CONFIG.busStop.x, z: LAKE_CONFIG.busStop.z, name: 'Hồ Pha Lê', badge: 'Tuyến 04B', rot: 0 },
  ];

  for (const s of shelters) {
    createBusStopShelter(scene, s.x, s.z, s.name, s.badge, materials, s.rot);
    yield;
  }

  // Fleet Waypoints & Stops:
  // Tốc độ Siêu Tốc Express: 48.0 m/s (~173 km/h - di chuyển cực nhanh qua các làng mà vẫn 100% vật lý 3D)
  const CRUISE_SPEED = 48.0;

  // ROUTE 01: Hoa Mai Express - Highway 86 (Bến cuối tại Trạm Cửa Nam z = 54, quay đầu tại z = 50)
  const route01Waypoints = [
    new Vector3(0, 0, 54),    // 0: Trạm Cửa Nam - Quảng Trường
    new Vector3(0, 0, 50),    // 1: Quay đầu Cửa Nam
    new Vector3(0, 0, 86),    // 2: Trạm Bình Minh
    new Vector3(-300, 0, 86), // 3: Trạm Hoa Mai
    new Vector3(-594, 0, 86), // 4: Trạm Đồi Gió
    new Vector3(-612, 0, 86), // 5: Turnaround Tây
    new Vector3(-594, 0, 86), // 6: Trạm Đồi Gió
    new Vector3(-300, 0, 86), // 7: Trạm Hoa Mai
    new Vector3(0, 0, 86),    // 8: Trạm Bình Minh
    new Vector3(300, 0, 86),  // 9: Trạm Ven Sông
    new Vector3(594, 0, 86),  // 10: Trạm An Nhiên
    new Vector3(612, 0, 86),  // 11: Turnaround Đông
    new Vector3(594, 0, 86),  // 12: Trạm An Nhiên
    new Vector3(300, 0, 86),  // 13: Trạm Ven Sông
    new Vector3(0, 0, 86),    // 14: Trạm Bình Minh
  ];
  const route01Stops = [
    { id: 'stop-south-gate', name: 'Trạm Cửa Nam - Quảng Trường', waypointIndex: 0 },
    { id: 'stop-bm', name: 'Làng Bình Minh', waypointIndex: 2 },
    { id: 'stop-hm', name: 'Làng Hoa Mai', waypointIndex: 3 },
    { id: 'stop-dg', name: 'Làng Đồi Gió', waypointIndex: 4 },
    { id: 'stop-vs', name: 'Làng Ven Sông', waypointIndex: 9 },
    { id: 'stop-an', name: 'Làng An Nhiên', waypointIndex: 10 },
  ];

  // ROUTE 02: Biển Xanh Coastal - Highway 406 (Bến cuối tại Trạm Cửa Nam z = 54, quay đầu tại z = 50)
  const route02Waypoints = COASTAL_BUS_CONFIG.waypoints.map(([x,z])=>new Vector3(x,0,z));
  const route02Stops = [
    { id: 'stop-south-gate', name: 'Trạm Cửa Nam - Quảng Trường', waypointIndex: 0 },
    { id: 'stop-bm', name: 'Làng Bình Minh', waypointIndex: 2 },
    { id: 'stop-beach', name: 'Bãi Biển Bình Minh', waypointIndex: COASTAL_BUS_CONFIG.stops.beach },
    { id: 'stop-tp', name: 'Làng Thu Phong', waypointIndex: COASTAL_BUS_CONFIG.stops.thuPhong },
    { id: 'stop-hd', name: 'Làng Hướng Dương', waypointIndex: COASTAL_BUS_CONFIG.stops.huongDuong },
  ];

  // ROUTE 03: Cao Nguyên Highland - Northern Highway -234 & Phu Dien (Bến cuối tại Trạm Cửa Bắc z = -54, quay đầu tại z = -50)
  const route03Waypoints = [
    new Vector3(0, 0, -54),    // 0: Trạm Cửa Bắc - Tòa Thị Chính
    new Vector3(0, 0, -50),    // 1: Quay đầu Cửa Bắc
    new Vector3(0, 0, -90),    // 2: Tòa Thị Chính
    new Vector3(0, 0, -234),   // 3: Ngã tư QL -234
    new Vector3(-300, 0, -234),// 4: Trạm Thanh Hà
    new Vector3(-594, 0, -234),// 5: Trạm Mộc Lan
    new Vector3(-612, 0, -234),// 6: Turnaround Tây
    new Vector3(-300, 0, -234),// 7: Trạm Thanh Hà
    new Vector3(0, 0, -234),   // 8: Ngã tư QL -234
    new Vector3(0, 0, -394),   // 9: Trạm Phú Điền
    new Vector3(0, 0, -408),   // 10: Turnaround Phú Điền
    new Vector3(0, 0, -234),   // 11: Ngã tư QL -234
    new Vector3(300, 0, -234), // 12: Trạm Tân Lộc
    new Vector3(594, 0, -234), // 13: Trạm Hải Vân
    new Vector3(612, 0, -234), // 14: Turnaround Đông
    new Vector3(300, 0, -234), // 15: Trạm Tân Lộc
    new Vector3(0, 0, -234),   // 16: Ngã tư QL -234
    new Vector3(0, 0, -90),    // 17: Tòa Thị Chính
  ];
  const route03Stops = [
    { id: 'stop-north-gate', name: 'Trạm Cửa Bắc - Tòa Thị Chính', waypointIndex: 0 },
    { id: 'stop-th', name: 'Làng Thanh Hà', waypointIndex: 4 },
    { id: 'stop-ml', name: 'Làng Mộc Lan', waypointIndex: 5 },
    { id: 'stop-pd', name: 'Làng Phú Điền', waypointIndex: 9 },
    { id: 'stop-tl', name: 'Làng Tân Lộc', waypointIndex: 12 },
    { id: 'stop-hv', name: 'Làng Hải Vân', waypointIndex: 13 },
  ];

  // ROUTE 04A: Phố Chợ Phía Tây Shuttle (Bến cuối tại Trạm Cửa Tây x = -54, quay đầu tại x = -50)
  const route04AWaypoints = [
    new Vector3(-54, 0, 0),    // 0: Trạm Cửa Tây - Phố Chợ
    new Vector3(-50, 0, 0),    // 1: Quay đầu Cửa Tây
    new Vector3(-84, 0, 0),    // 2: Đại lộ Tây
    new Vector3(-118, 0, 0),   // 3: Trạm Phố Chợ Phía Tây
    new Vector3(-130, 0, 0),   // 4: Turnaround Chợ Tây
    new Vector3(-118, 0, 0),   // 5: Trạm Phố Chợ Phía Tây
    new Vector3(-84, 0, 0),    // 6: Đại lộ Tây
  ];
  const route04AStops = [
    { id: 'stop-west-gate', name: 'Trạm Cửa Tây - Phố Chợ', waypointIndex: 0 },
    { id: 'stop-market', name: 'Phố Chợ Phía Tây', waypointIndex: 3 },
  ];

  // ROUTE 04B: Hồ Pha Lê & Bến Câu Cá Shuttle (Bến cuối tại Trạm Cửa Đông x = 54, quay đầu tại x = 50)
  const route04BWaypoints = [
    new Vector3(54, 0, 0),     // 0: Trạm Cửa Đông - Hồ Pha Lê
    new Vector3(50, 0, 0),     // 1: Quay đầu Cửa Đông
    new Vector3(84, 0, 0),     // 2: Đại lộ Đông
    new Vector3(LAKE_CONFIG.busStop.x, 0, 0), // 3: Trạm trên đất liền
    new Vector3(LAKE_CONFIG.busStop.turnX, 0, 0), // 4: Quay đầu trước lối bộ hành
    new Vector3(LAKE_CONFIG.busStop.x, 0, 0), // 5: Trạm Hồ Pha Lê
    new Vector3(84, 0, 0),     // 6: Đại lộ Đông
  ];
  const route04BStops = [
    { id: 'stop-east-gate', name: 'Trạm Cửa Đông - Hồ Pha Lê', waypointIndex: 0 },
    { id: 'stop-lake', name: 'Hồ Pha Lê', waypointIndex: 3 },
  ];

  // === ĐỘI HÌNH 16 XE BUÝT CHIBI VIỆT NAM CHẠY LIÊN TỤC SONG SONG (SLA CHỜ 5S - 10S) ===
  // Tuyến 01: 4 xe chia đều 25% lộ trình trục QL 86 (Hà Nội City Tour Đỏ Cờ)
  const bus1A = createChibiBus(scene, shadows, {
    id: 'bus-01A',
    routeCode: '01A',
    routeName: 'Hoa Mai Express',
    plateNumber: '29B - 018.88',
    bodyColor: '#dc2626',
    accentColor: '#fef08a',
    ledColor: '#facc15',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route01Waypoints,
    stops: route01Stops,
    initialSegment: 0,
    initialProgress: 0.1,
  }, materials);

  yield;
  const bus1B = createChibiBus(scene, shadows, {
    id: 'bus-01B',
    routeCode: '01B',
    routeName: 'Hoa Mai Express',
    plateNumber: '29B - 019.99',
    bodyColor: '#b91c1c',
    accentColor: '#fef08a',
    ledColor: '#fbbf24',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route01Waypoints,
    stops: route01Stops,
    initialSegment: 4,
    initialProgress: 0.2,
  }, materials);

  yield;
  const bus1C = createChibiBus(scene, shadows, {
    id: 'bus-01C',
    routeCode: '01C',
    routeName: 'Hoa Mai Express',
    plateNumber: '29B - 018.11',
    bodyColor: '#dc2626',
    accentColor: '#fef08a',
    ledColor: '#facc15',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route01Waypoints,
    stops: route01Stops,
    initialSegment: 8,
    initialProgress: 0.4,
  }, materials);

  yield;
  const bus1D = createChibiBus(scene, shadows, {
    id: 'bus-01D',
    routeCode: '01D',
    routeName: 'Hoa Mai Express',
    plateNumber: '29B - 018.22',
    bodyColor: '#b91c1c',
    accentColor: '#fef08a',
    ledColor: '#fbbf24',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route01Waypoints,
    stops: route01Stops,
    initialSegment: 12,
    initialProgress: 0.3,
  }, materials);

  // Tuyến 02: 4 xe chia đều 25% lộ trình trục Biển & Làng Nam (Sài Gòn Coastal Xanh Ngọc Biển)
  yield;
  const bus2A = createChibiBus(scene, shadows, {
    id: 'bus-02A',
    routeCode: '02A',
    routeName: 'Biển Xanh Coastal',
    plateNumber: '51B - 028.68',
    bodyColor: '#0284c7',
    accentColor: '#ffffff',
    ledColor: '#38bdf8',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route02Waypoints,
    stops: route02Stops,
    initialSegment: 0,
    initialProgress: 0.1,
  }, materials);

  yield;
  const bus2B = createChibiBus(scene, shadows, {
    id: 'bus-02B',
    routeCode: '02B',
    routeName: 'Biển Xanh Coastal',
    plateNumber: '51B - 029.86',
    bodyColor: '#0891b2',
    accentColor: '#ffffff',
    ledColor: '#22d3ee',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route02Waypoints,
    stops: route02Stops,
    initialSegment: 5,
    initialProgress: 0.2,
  }, materials);

  yield;
  const bus2C = createChibiBus(scene, shadows, {
    id: 'bus-02C',
    routeCode: '02C',
    routeName: 'Biển Xanh Coastal',
    plateNumber: '51B - 029.33',
    bodyColor: '#0284c7',
    accentColor: '#ffffff',
    ledColor: '#38bdf8',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route02Waypoints,
    stops: route02Stops,
    initialSegment: 10,
    initialProgress: 0.3,
  }, materials);

  yield;
  const bus2D = createChibiBus(scene, shadows, {
    id: 'bus-02D',
    routeCode: '02D',
    routeName: 'Biển Xanh Coastal',
    plateNumber: '51B - 029.77',
    bodyColor: '#0891b2',
    accentColor: '#ffffff',
    ledColor: '#22d3ee',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route02Waypoints,
    stops: route02Stops,
    initialSegment: 15,
    initialProgress: 0.4,
  }, materials);

  // Tuyến 03: 4 xe chia đều 25% lộ trình trục Cao Nguyên & Phú Điền (VinBus Xanh Lục Bảo)
  yield;
  const bus3A = createChibiBus(scene, shadows, {
    id: 'bus-03A',
    routeCode: '03A',
    routeName: 'Cao Nguyên Line',
    plateNumber: '43B - 036.78',
    bodyColor: '#16a34a',
    accentColor: '#ffffff',
    ledColor: '#4ade80',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route03Waypoints,
    stops: route03Stops,
    initialSegment: 0,
    initialProgress: 0.1,
  }, materials);

  yield;
  const bus3B = createChibiBus(scene, shadows, {
    id: 'bus-03B',
    routeCode: '03B',
    routeName: 'Cao Nguyên Line',
    plateNumber: '43B - 038.99',
    bodyColor: '#15803d',
    accentColor: '#ffffff',
    ledColor: '#86efac',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route03Waypoints,
    stops: route03Stops,
    initialSegment: 4,
    initialProgress: 0.2,
  }, materials);

  yield;
  const bus3C = createChibiBus(scene, shadows, {
    id: 'bus-03C',
    routeCode: '03C',
    routeName: 'Cao Nguyên Line',
    plateNumber: '43B - 036.11',
    bodyColor: '#16a34a',
    accentColor: '#ffffff',
    ledColor: '#4ade80',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route03Waypoints,
    stops: route03Stops,
    initialSegment: 9,
    initialProgress: 0.3,
  }, materials);

  yield;
  const bus3D = createChibiBus(scene, shadows, {
    id: 'bus-03D',
    routeCode: '03D',
    routeName: 'Cao Nguyên Line',
    plateNumber: '43B - 038.22',
    bodyColor: '#15803d',
    accentColor: '#ffffff',
    ledColor: '#86efac',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route03Waypoints,
    stops: route03Stops,
    initialSegment: 13,
    initialProgress: 0.4,
  }, materials);

  // Tuyến 04A: 2 xe chạy con thoi đối xứng Phố Chợ Phía Tây
  yield;
  const bus4A_1 = createChibiBus(scene, shadows, {
    id: 'bus-04A-1',
    routeCode: '04A',
    routeName: 'Phố Chợ Tây',
    plateNumber: '29B - 046.88',
    bodyColor: '#ea580c',
    accentColor: '#fef08a',
    ledColor: '#fb923c',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route04AWaypoints,
    stops: route04AStops,
    initialSegment: 0,
    initialProgress: 0.1,
  }, materials);

  yield;
  const bus4A_2 = createChibiBus(scene, shadows, {
    id: 'bus-04A-2',
    routeCode: '04A',
    routeName: 'Phố Chợ Tây',
    plateNumber: '29B - 046.99',
    bodyColor: '#c2410c',
    accentColor: '#fef08a',
    ledColor: '#fb923c',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route04AWaypoints,
    stops: route04AStops,
    initialSegment: 3,
    initialProgress: 0.5,
  }, materials);

  // Tuyến 04B: 2 xe chạy con thoi đối xứng Hồ Pha Lê & Bến Câu Cá
  yield;
  const bus4B_1 = createChibiBus(scene, shadows, {
    id: 'bus-04B-1',
    routeCode: '04B',
    routeName: 'Hồ Pha Lê',
    plateNumber: '51B - 048.66',
    bodyColor: '#4f46e5',
    accentColor: '#ffffff',
    ledColor: '#818cf8',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route04BWaypoints,
    stops: route04BStops,
    initialSegment: 0,
    initialProgress: 0.1,
  }, materials);

  yield;
  const bus4B_2 = createChibiBus(scene, shadows, {
    id: 'bus-04B-2',
    routeCode: '04B',
    routeName: 'Hồ Pha Lê',
    plateNumber: '51B - 048.88',
    bodyColor: '#4338ca',
    accentColor: '#ffffff',
    ledColor: '#818cf8',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route04BWaypoints,
    stops: route04BStops,
    initialSegment: 3,
    initialProgress: 0.5,
  }, materials);

  yield;
  const buses = [
    bus1A, bus1B, bus1C, bus1D,
    bus2A, bus2B, bus2C, bus2D,
    bus3A, bus3B, bus3C, bus3D,
    bus4A_1, bus4A_2,
    bus4B_1, bus4B_2,
  ];

  // Transit Management State
  let activeRidingBusId = null;
  let boardingPosition = null;

  return {
    buses,

    getNearbyBoardableBus(playerPos, radius = 6.5) {
      if (activeRidingBusId) return null;
      for (const bus of buses) {
        if (bus.isDwelling()) {
          const dist = Vector3.Distance(bus.root.position, playerPos);
          if (dist <= radius) {
            return {
              bus,
              dist,
              station: bus.getCurrentStation(),
              dwellRemaining: bus.getDwellRemaining(),
            };
          }
        }
      }
      return null;
    },

    boardBus(busId, playerRoot) {
      const bus = buses.find(b => b.id === busId);
      if (!bus || !playerRoot || activeRidingBusId || !bus.isDwelling() || Vector3.Distance(bus.root.position, playerRoot.position) > 6.5) return false;
      boardingPosition = playerRoot.position.clone();
      activeRidingBusId = busId;
      // Snap player into bus cabin
      playerRoot.position.copyFrom(bus.passengerSeatNode.getAbsolutePosition());
      playerRoot.rotation.y = bus.root.rotation.y;
      return true;
    },

    alightBus(playerRoot, force = false) {
      if (!activeRidingBusId) return false;
      const bus = buses.find(b => b.id === activeRidingBusId);
      if (!force && !bus?.isDwelling()) return false;
      activeRidingBusId = null;
      if (bus && playerRoot) {
        if (force && boardingPosition) {
          playerRoot.position.copyFrom(boardingPosition);
          boardingPosition = null;
          return true;
        }
        // Drop player safely onto the sidewalk platform beside the bus door
        const forward = bus.root.forward;
        const right = new Vector3(forward.z, 0, -forward.x);
        const exitPos = bus.root.position.add(right.scale(3.4));
        exitPos.y = getTerrainHeight(exitPos.x, exitPos.z);
        playerRoot.position.copyFrom(exitPos);
      }
      boardingPosition = null;
      return true;
    },

    getActiveRide() {
      if (!activeRidingBusId) return null;
      const bus = buses.find(b => b.id === activeRidingBusId);
      if (!bus) return null;
      return {
        busId: bus.id,
        routeCode: bus.routeCode,
        routeName: bus.routeName,
        bodyColor: bus.bodyColor,
        speed: Math.round(bus.getCurrentSpeed()),
        isDwelling: bus.isDwelling(),
        dwellRemaining: Math.ceil(bus.getDwellRemaining()),
        currentStation: bus.getCurrentStation()?.name || null,
        nextStation: bus.getNextStation()?.name || null,
        scenicPoi: getScenicPoiDescriptor(bus.root.position),
        busRoot: bus.root,
        passengerSeatNode: bus.passengerSeatNode,
      };
    },

    isPlayerRiding() {
      return Boolean(activeRidingBusId);
    },

    update(delta, playerPos) {
      // Update each bus in the 8-bus fleet
      buses.forEach(b => b.update(delta));

      const activeRide = this.getActiveRide();
      const nearbyBoardable = playerPos ? this.getNearbyBoardableBus(playerPos) : null;

      return {
        activeRide,
        nearbyBoardable: nearbyBoardable ? {
          busId: nearbyBoardable.bus.id,
          routeCode: nearbyBoardable.bus.routeCode,
          routeName: nearbyBoardable.bus.routeName,
          bodyColor: nearbyBoardable.bus.bodyColor,
          stationName: nearbyBoardable.station?.name || 'Trạm xe buýt',
          dwellRemaining: Math.ceil(nearbyBoardable.dwellRemaining),
        } : null,
      };
    },
  };
}
