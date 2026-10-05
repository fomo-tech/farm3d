import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import { VENUE_LAYOUT } from '../../../../shared/venueLayout.js';
import { SHOP_CONFIG } from '../../../../shared/shopConfig.js';
import {
  WORLD_PALETTE,
  createCozyMaterial,
  createRusticSignboard,
  createStorefrontSignboard,
  createProjectingBladeSign,
  createWarmHangingLantern,
  createLampHaloOnly,
  createGroundLightPoolOnly,
} from '../worldDesignSystem.js';
import {
  createPlazaGrandPortal,
  createPlazaLeaderboardMonument,
  createPlazaEventBillboard,
} from './createPlazaBillboards.js';

function makeMat(scene, name, hex, emissiveHex = null, specular = 0.5, specularPower = 90) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.5);
  m.specularColor = new Color3(specular, specular, specular);
  m.specularPower = specularPower;
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

/**
 * Tạo Mái Ngói Terracotta dốc chữ A đôi phong cách Ghibli chuẩn chất lượng
 */
export function addTerracottaGableRoof(scene, parent, width, depth, height, mats, shadows) {
  const style = SHOP_CONFIG[parent.metadata?.shopStyle];
  if (style) mats = { ...mats, roofTile: makeMat(scene, `${parent.metadata.shopStyle}-roof-pastel`, style.roof, null, .09, 40) };
  const roofRoot = new TransformNode('building-terracotta-roof', scene);
  roofRoot.position.set(0, height, 0);
  roofRoot.parent = parent;

  const roofW = width + 1.4;
  const roofD = depth + 1.2;
  const roofH = 3.2;
  const halfSpan = roofW / 2;
  const slopeLength = Math.hypot(halfSpan, roofH);
  const roofAngle = Math.atan2(roofH, halfSpan);

  // 1. Mái dốc trái ngói nung đỏ cam
  const slopeL = MeshBuilder.CreateBox('roof-slope-l', { width: slopeLength + 0.08, depth: roofD, height: 0.22 }, scene);
  slopeL.position.set(-halfSpan / 2, roofH / 2, 0);
  slopeL.rotation.z = roofAngle;
  slopeL.material = mats.roofTile;
  slopeL.parent = roofRoot;
  slopeL.receiveShadows = true;
  shadows?.addShadowCaster(slopeL);

  // 2. Mái dốc phải ngói nung đỏ cam
  const slopeR = MeshBuilder.CreateBox('roof-slope-r', { width: slopeLength + 0.08, depth: roofD, height: 0.22 }, scene);
  slopeR.position.set(halfSpan / 2, roofH / 2, 0);
  slopeR.rotation.z = -roofAngle;
  slopeR.material = mats.roofTile;
  slopeR.parent = roofRoot;
  slopeR.receiveShadows = true;
  shadows?.addShadowCaster(slopeR);

  // 3. Sống ngói gốm sẫm màu
  const ridge = MeshBuilder.CreateBox('roof-ridge-cap', { width: 0.48, depth: roofD + 0.3, height: 0.35 }, scene);
  ridge.position.set(0, roofH + 0.03, 0);
  ridge.material = mats.roofRidge;
  ridge.parent = roofRoot;

  // A real thin triangular gable. A 3-sided cylinder has a very different
  // axis/radius and used to produce a huge triangle through the storefront.
  [-1, 1].forEach((side, idx) => {
    const zOuter = side * (depth / 2 + 0.10);
    const zInner = side * (depth / 2 - 0.04);
    const halfGable = width / 2;
    const positions = [
      -halfGable, 0, zOuter, halfGable, 0, zOuter, 0, roofH - 0.08, zOuter,
      -halfGable, 0, zInner, halfGable, 0, zInner, 0, roofH - 0.08, zInner,
    ];
    const indices = [0, 1, 2, 5, 4, 3, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 2, 3, 0];
    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = [];
    VertexData.ComputeNormals(positions, indices, vertexData.normals);
    const pediment = new Mesh(`roof-pediment-${idx}`, scene);
    vertexData.applyToMesh(pediment);
    pediment.material = mats.timber;
    pediment.parent = roofRoot;
  });

  return roofRoot;
}

export function addShopFacade(scene, parent, kind, glazeHex, accentHex, mats) {
  const style = SHOP_CONFIG[kind];
  glazeHex = style?.glass || glazeHex;
  accentHex = style?.accent || accentHex;

  // 1. Kính cường lực trưng bày cao cấp có độ tương phản và phản chiếu cao
  const glass = makeMat(scene, `${kind}-storefront-enamel`, glazeHex, null, 0.22, 64);
  glass.alpha = 1;
  const showcaseGlass = makeMat(scene, `${kind}-showcase-glass`, '#0f172a', '#1e293b', 0.95, 128);
  showcaseGlass.emissiveColor = Color3.FromHexString(style?.accent || '#f59e0b').scale(0.18);
  showcaseGlass.alpha = 1;

  const doorMat = makeMat(scene, `${kind}-storefront-door-mat`, '#f8f1dd', '#f59e0b', 0.2, 40);
  doorMat.alpha = 1;
  const accent = makeMat(scene, `${kind}-storefront-accent`, accentHex, null, 0.2, 56);
  accent.alpha = 1;
  const canopyCream = makeMat(scene, `${kind}-canopy-cream`, '#fef9c3', null, 0.1, 20);
  canopyCream.alpha = 1;
  const brassMat = makeMat(scene, `${kind}-brass-hardware`, '#d97706', '#b45309', 0.85, 100);
  brassMat.alpha = 1;
  const doorWoodMat = makeMat(scene, `${kind}-door-mahogany`, '#23150d', null, 0.4, 70);
  doorWoodMat.alpha = 1;

  // Tường kính nền mặt tiền
  const panel = MeshBuilder.CreateBox(`${kind}-storefront-panel`, { width: 13.2, height: 6.3, depth: 0.10 }, scene);
  panel.position.set(0, 4.2, 6.14); // wall ends at z=6; panel begins at z=6.09
  panel.material = glass;
  panel.parent = parent;
  panel.isPickable = false;

  // 2. Hai tủ kính trưng bày mặt tiền (Storefront Display Showcases)
  for (const side of [-1, 1]) {
    const frame = MeshBuilder.CreateBox(`${kind}-display-frame-${side}`, { width: 4.35, height: 4.45, depth: 0.18 }, scene);
    frame.position.set(side * 4.2, 3.55, 6.28);
    frame.parent = parent;
    frame.material = mats.timberWarm;

    const window = MeshBuilder.CreateBox(`${kind}-display-glass-${side}`, { width: 3.93, height: 4.02, depth: 0.08 }, scene);
    window.position.set(side * 4.2, 3.55, 6.42);
    window.parent = parent;
    window.material = showcaseGlass;

    // Nan gỗ chia ô kính cổ điển (Showcase Window Mullions)
    const mullionH = MeshBuilder.CreateBox(`${kind}-window-mullion-h-${side}`, { width: 3.93, height: 0.12, depth: 0.12 }, scene);
    mullionH.position.set(side * 4.2, 3.55, 6.45);
    mullionH.material = mats.timberWarm;
    mullionH.parent = parent;

    const mullionV = MeshBuilder.CreateBox(`${kind}-window-mullion-v-${side}`, { width: 0.12, height: 4.02, depth: 0.12 }, scene);
    mullionV.position.set(side * 4.2, 3.55, 6.45);
    mullionV.material = mats.timberWarm;
    mullionV.parent = parent;

    // Rèm nhung lượn sóng trên vòm tủ kính (Top Velvet Valance)
    const valance = MeshBuilder.CreateBox(`${kind}-window-valance-${side}`, { width: 3.93, height: 0.55, depth: 0.12 }, scene);
    valance.position.set(side * 4.2, 5.25, 6.45);
    valance.material = accent;
    valance.parent = parent;

    // Bục gỗ trưng bày sản phẩm trong tủ kính (In-Window Display Pedestal)
    const pedestal = MeshBuilder.CreateBox(`${kind}-showcase-pedestal-${side}`, { width: 2.2, height: 0.45, depth: 0.35 }, scene);
    pedestal.position.set(side * 4.2, 1.52, 6.48);
    pedestal.material = accent;
    pedestal.parent = parent;

    // Bậu cửa sổ đá hoa cương (Display Window Sill)
    const sill = MeshBuilder.CreateBox(`${kind}-display-sill-${side}`, { width: 4.6, height: 0.22, depth: 0.52 }, scene);
    sill.position.set(side * 4.2, 1.25, 6.50);
    sill.parent = parent;
    sill.material = mats.timberWarm;
  }

  // 3. Mái hiên vải bạt sọc cao cấp (Striped Canvas Canopy)
  const canopy = new TransformNode(`${kind}-striped-canopy`, scene);
  canopy.position.set(0, 6.45, 6.72);
  canopy.rotation.x = -0.13;
  canopy.parent = parent;
  const canopyWidth = style?.facade.awningWidth || 13.6;
  for (let index = 0; index < 8; index++) {
    const stripe = MeshBuilder.CreateBox(`${kind}-canopy-stripe-${index}`, { width: canopyWidth / 8 - 0.015, height: 0.14, depth: style?.facade.awningDepth || 1.65 }, scene);
    stripe.position.x = -canopyWidth / 2 + canopyWidth / 8 * (index + 0.5);
    stripe.parent = canopy;
    stripe.material = index % 2 ? canopyCream : accent;
    const hem = MeshBuilder.CreateSphere(`${kind}-canopy-hem-${index}`, { diameterX: canopyWidth / 8 - 0.025, diameterY: 0.32, diameterZ: 0.19, segments: 8 }, scene);
    hem.position.set(stripe.position.x, -0.08, 0.83);
    hem.parent = canopy;
    hem.material = stripe.material;
  }

  // Hai tay chống mái hiên sắt mỹ thuật cổ điển
  [-6.5, 6.5].forEach((bx, idx) => {
    const bracket = MeshBuilder.CreateCylinder(`${kind}-canopy-bracket-${idx}`, { diameter: 0.08, height: 1.8, tessellation: 8 }, scene);
    bracket.position.set(bx, 5.65, 6.45);
    bracket.rotation.x = 0.55;
    bracket.material = mats.roofRidge;
    bracket.parent = parent;
  });

  if (style) {
    const wall = makeMat(scene, `${kind}-shop-plaster`, style.wall, null, 0.08, 36);
    wall.alpha = 1;
    for (const mesh of parent.getChildMeshes()) {
      if (mesh.name === `${kind}-body` || mesh.name === 'mart-body' || mesh.name === 'vehicle-body') {
        mesh.material = wall;
      }
    }
    parent.metadata = { ...(parent.metadata || {}), shopStyle: kind };
  }

  // 4. CỬA GỖ ĐÔI KIỂU PHÁP SANG TRỌNG ĐÓN KHÁCH (FRENCH DOUBLE DOOR ENTRANCE)
  // Khung cánh cửa gỗ gụ sẫm bóng
  const door = MeshBuilder.CreateBox(`${kind}-storefront-door`, { width: 3.6, height: 4.5, depth: 0.10 }, scene);
  door.position.set(0, 3.04, 6.26);
  door.material = doorWoodMat;
  door.parent = parent;
  door.metadata = SHOP_CONFIG[kind] ? { venue: kind } : null;

  // Đường chỉ nẹp dọc chia đôi 2 cánh cửa
  const doorSeam = MeshBuilder.CreateBox(`${kind}-door-seam`, { width: 0.08, height: 4.5, depth: 0.14 }, scene);
  doorSeam.position.set(0, 3.04, 6.27);
  doorSeam.material = mats.timberWarm;
  doorSeam.parent = parent;

  // Hai ô kính vòm sáng đèn ấm cúng ở nửa trên 2 cánh cửa (Upper Glowing Glass Panes)
  const doorGlassMat = makeMat(scene, `${kind}-door-glass-glow`, '#fef08a', '#f59e0b', 0.9, 100);
  doorGlassMat.emissiveColor = Color3.FromHexString('#f59e0b').scale(0.65);
  doorGlassMat.alpha = 1;

  [-0.85, 0.85].forEach((wx, idx) => {
    const pane = MeshBuilder.CreateBox(`${kind}-door-pane-${idx}`, { width: 1.15, height: 1.9, depth: 0.12 }, scene);
    pane.position.set(wx, 3.85, 6.28);
    pane.material = doorGlassMat;
    pane.parent = parent;

    // Nan gỗ chia ô kính cửa
    const paneMullion = MeshBuilder.CreateBox(`${kind}-door-pane-mullion-${idx}`, { width: 1.15, height: 0.06, depth: 0.14 }, scene);
    paneMullion.position.set(wx, 3.85, 6.29);
    paneMullion.material = doorWoodMat;
    paneMullion.parent = parent;

    // Tấm pa-nô gỗ nổi chạm khắc nửa dưới cánh cửa (Lower Raised Wood Panels)
    const lowerPanel = MeshBuilder.CreateBox(`${kind}-door-lower-panel-${idx}`, { width: 1.25, height: 1.4, depth: 0.13 }, scene);
    lowerPanel.position.set(wx, 1.6, 6.28);
    lowerPanel.material = mats.timberWarm;
    lowerPanel.parent = parent;
  });

  // Tấm kim loại bảo vệ chân cửa bằng đồng thau (Brass Kickplate)
  const kickplate = MeshBuilder.CreateBox(`${kind}-door-kickplate`, { width: 3.4, height: 0.38, depth: 0.13 }, scene);
  kickplate.position.set(0, 0.72, 6.28);
  kickplate.material = brassMat;
  kickplate.parent = parent;

  // Hai tay nắm dạng thanh kéo đứng bằng đồng thau sang trọng (Dual Brass Pull Handles)
  [-0.32, 0.32].forEach((hx, idx) => {
    const pullBar = MeshBuilder.CreateCylinder(`${kind}-door-pull-bar-${idx}`, { diameter: 0.06, height: 0.95, tessellation: 12 }, scene);
    pullBar.position.set(hx, 2.65, 6.36);
    pullBar.material = brassMat;
    pullBar.parent = parent;

    [-0.4, 0.4].forEach((sy, sidx) => {
      const stud = MeshBuilder.CreateCylinder(`${kind}-door-stud-${idx}-${sidx}`, { diameter: 0.09, height: 0.09, tessellation: 8 }, scene);
      stud.rotation.x = Math.PI / 2;
      stud.position.set(hx, 2.65 + sy, 6.32);
      stud.material = brassMat;
      stud.parent = parent;
    });
  });

  // Tay nắm chuẩn hóa tương thích cho bộ test
  const handle = MeshBuilder.CreateSphere(`${kind}-storefront-handle`, { diameter: 0.08, segments: 6 }, scene);
  handle.position.set(0.32, 2.65, 6.36);
  handle.material = brassMat;
  handle.parent = parent;

  // Vòm nẹp cửa gỗ sồi dày dặn tạo chiều sâu kiến trúc 3D (Portal Architrave)
  const archTop = MeshBuilder.CreateBox(`${kind}-portal-arch-top`, { width: 4.1, height: 0.35, depth: 0.24 }, scene);
  archTop.position.set(0, 5.45, 6.32);
  archTop.material = mats.timberWarm;
  archTop.parent = parent;

  [-1.95, 1.95].forEach((jx, idx) => {
    const jamb = MeshBuilder.CreateBox(`${kind}-portal-jamb-${idx}`, { width: 0.32, height: 4.9, depth: 0.24 }, scene);
    jamb.position.set(jx, 2.88, 6.32);
    jamb.material = mats.timberWarm;
    jamb.parent = parent;
  });

  // Bảng nẹp Transom trên vòm cửa: "▶ CỬA VÀO · ENTRANCE [E] ◀"
  const transom = MeshBuilder.CreateBox(`${kind}-entrance-transom`, { width: 3.6, height: 0.52, depth: 0.16 }, scene);
  transom.position.set(0, 5.72, 6.35);
  const transomMat = makeMat(scene, `${kind}-transom-mat`, '#1e1b18', '#f59e0b', 0.5, 80);
  transomMat.emissiveColor = Color3.FromHexString('#f59e0b').scale(0.5);
  transomMat.alpha = 1;
  transom.material = transomMat;
  transom.parent = parent;

  [-6.65, -1.85, 1.85, 6.65].forEach((x, index) => {
    const mullion = MeshBuilder.CreateBox(`${kind}-storefront-mullion-${index}`, { width: 0.19, height: 6.52, depth: 0.12 }, scene);
    mullion.position.set(x, 4.2, 6.26);
    mullion.material = mats.timberWarm;
    mullion.parent = parent;
  });
  [1.02, 7.38].forEach((y, index) => {
    const rail = MeshBuilder.CreateBox(`${kind}-storefront-rail-${index}`, { width: 13.5, height: 0.18, depth: 0.12 }, scene);
    rail.position.set(0, y, 6.26);
    rail.material = mats.timberWarm;
    rail.parent = parent;
  });

  // Hai đèn lồng đồng gắn tường 2 bên cửa (Entrance Sconces)
  const lanternMat = mats.lanternAmber || makeMat(scene, `${kind}-sconce-amber`, '#fef08a', '#f59e0b', 0.9, 90);
  lanternMat.alpha = 1;

  [-2.35, 2.35].forEach((lx, idx) => {
    const sconceArm = MeshBuilder.CreateBox(`${kind}-sconce-arm-${idx}`, { width: 0.08, height: 0.08, depth: 0.28 }, scene);
    sconceArm.position.set(lx, 3.4, 6.38);
    sconceArm.material = mats.roofRidge;
    sconceArm.parent = parent;

    const lanternHousing = MeshBuilder.CreateCylinder(`${kind}-sconce-housing-${idx}`, { diameter: 0.36, height: 0.52, tessellation: 8 }, scene);
    lanternHousing.position.set(lx, 3.4, 6.52);
    lanternHousing.material = lanternMat;
    lanternHousing.parent = parent;
  });

  const threshold = MeshBuilder.CreateBox(`${kind}-storefront-threshold`, { width: 3.8, height: 0.08, depth: 1.1 }, scene);
  threshold.position.set(0, 0.55, 6.9);
  threshold.material = accent;
  threshold.parent = parent;

  // 5. BẬC TAM CẤP ĐÁ & THẢM ĐÓN KHÁCH VIP (GRAND ENTRANCE STEPS & RUNNER)
  const step1 = MeshBuilder.CreateBox(`${kind}-entrance-step-1`, { width: 5.0, height: 0.25, depth: 1.4 }, scene);
  step1.position.set(0, 0.125, 7.1);
  step1.material = mats.stonePlinth;
  step1.parent = parent;
  step1.receiveShadows = true;

  const step2 = MeshBuilder.CreateBox(`${kind}-entrance-step-2`, { width: 4.6, height: 0.25, depth: 1.2 }, scene);
  step2.position.set(0, 0.375, 6.45);
  step2.material = mats.stonePlinth;
  step2.parent = parent;
  step2.receiveShadows = true;

  const entranceMat = MeshBuilder.CreateBox(`${kind}-entrance-mat`, { width: 3.2, height: 0.04, depth: 1.1 }, scene);
  entranceMat.position.set(0, 0.52, 6.2);
  entranceMat.material = mats.timberWarm;
  entranceMat.parent = parent;

  // Thảm dẫn đường nhung sang trọng (Welcome Runner Carpet)
  const carpetColor = style?.carpet || '#9a3412';
  const carpetMat = makeMat(scene, `${kind}-carpet-mat`, carpetColor, carpetColor, 0.1, 30);
  carpetMat.emissiveColor = Color3.FromHexString(carpetColor).scale(0.3);
  carpetMat.alpha = 1;

  const runnerUpper = MeshBuilder.CreateBox(`${kind}-carpet-upper`, { width: 2.4, height: 0.04, depth: 1.2 }, scene);
  runnerUpper.position.set(0, 0.53, 6.22);
  runnerUpper.material = carpetMat;
  runnerUpper.parent = parent;

  const runnerLower = MeshBuilder.CreateBox(`${kind}-carpet-lower`, { width: 2.4, height: 0.04, depth: 1.4 }, scene);
  runnerLower.position.set(0, 0.28, 7.05);
  runnerLower.material = carpetMat;
  runnerLower.parent = parent;

  const runnerPlaza = MeshBuilder.CreateBox(`${kind}-carpet-plaza`, { width: 2.4, height: 0.02, depth: 1.2 }, scene);
  runnerPlaza.position.set(0, 0.14, 8.0);
  runnerPlaza.material = carpetMat;
  runnerPlaza.parent = parent;

  // Thanh chặn thảm đồng thau trên mũi bậc tam cấp (Brass Stair Carpet Rods)
  [6.45, 7.1].forEach((rz, ridx) => {
    const rod = MeshBuilder.CreateCylinder(`${kind}-carpet-rod-${ridx}`, { diameter: 0.05, height: 2.45, tessellation: 10 }, scene);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, ridx === 0 ? 0.39 : 0.14, rz);
    rod.material = brassMat;
    rod.parent = parent;
  });

  // 6. BẢNG HIỆU MẶT TIỀN CHÍNH 3D CÓ ĐÈN RỌI (STOREFRONT FASCIA SIGNBOARD)
  const signTitle = style?.title || (kind === 'shop-test' ? 'CỬA HÀNG MẪU' : 'CỬA HÀNG NÔNG TRẠI');
  const signSubtitle = style?.subtitle || 'SEEDS · FARM SUPPLIES · SHOP';
  const signIcon = style?.icon || '🏪';
  createStorefrontSignboard(scene, {
    title: signTitle,
    subtitle: signSubtitle,
    icon: signIcon,
    accentColor: style?.accent || accentHex,
    parent,
    width: 6.8,
    height: 1.5,
    position: new Vector3(0, 7.75, 6.45),
  });

  // 7. BIỂN HIỆU VẪY 2 MẶT HÔNG CỬA (PROJECTING BLADE SIGN)
  createProjectingBladeSign(scene, {
    parent,
    position: new Vector3(7.15, 5.2, 6.35),
    accentColor: style?.accent || accentHex,
    iconLabel: kind,
  });
}

/**
 * Tạo vòng sáng ma thuật & huy hiệu tương tác [E] trên sàn đón khách
 * Đặt chính xác tại toạ độ cửa vào authoritative VENUE_LAYOUT[kind].entrance
 */
export function createEntranceGroundPortal(scene, parent, kind, entrance, label, accentHex) {
  const portalRoot = new TransformNode(`venue-portal-${kind}`, scene);
  portalRoot.position.set(entrance.x, 0, entrance.z);
  if (parent) portalRoot.parent = parent;

  // 1. Vòng tròn sáng hoa văn la bàn trên mặt đá (Ground Decal Disc)
  const disc = MeshBuilder.CreateCylinder(`portal-disc-${kind}`, { diameter: 2.8, height: 0.02, tessellation: 36 }, scene);
  disc.position.y = 0.16;
  disc.parent = portalRoot;
  disc.isPickable = false;

  const discMat = makeMat(scene, `portal-disc-mat-${kind}`, accentHex, accentHex, 0.2, 50);
  discMat.emissiveColor = Color3.FromHexString(accentHex).scale(0.5);
  discMat.alpha = 1;

  if (typeof document !== 'undefined' || typeof OffscreenCanvas !== 'undefined') {
    const dt = new DynamicTexture(`portal-tex-${kind}`, 1024, scene, false, Texture.TRILINEAR_SAMPLINGMODE);
    dt.hasAlpha = true;
    const ctx = dt.getContext();
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, 1024, 1024);

    // Vòng phát sáng ngoài
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 32;
    ctx.beginPath();
    ctx.arc(512, 512, 470, 0, Math.PI * 2);
    ctx.stroke();

    // Vòng hoa văn ngà bên trong
    ctx.strokeStyle = '#fffdf0';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(512, 512, 430, 0, Math.PI * 2);
    ctx.stroke();

    // 4 mũi tên la bàn chỉ tâm
    for (let a = 0; a < 4; a++) {
      const ang = a * Math.PI / 2;
      ctx.fillStyle = '#fffdf0';
      ctx.beginPath();
      ctx.arc(512 + Math.cos(ang) * 430, 512 + Math.sin(ang) * 430, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dòng chữ mời gọi bước vào
    ctx.font = '900 84px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('▶ BƯỚC VÀO · ENTER [E] ◀', 512, 512);

    dt.update();
    discMat.diffuseTexture = dt;
    discMat.emissiveTexture = dt;
  }
  disc.material = discMat;

  // 2. Huy hiệu lơ lửng 3D đón khách (Floating Interaction Badge)
  // Đặt ở độ cao y = 5.65 (ngay trên vòm cửa, dưới mái hiên) để mở rộng tầm nhìn toàn cảnh cửa gỗ đôi kiểu Pháp
  const badgePlane = MeshBuilder.CreatePlane(`portal-badge-${kind}`, { width: 3.2, height: 0.68 }, scene);
  badgePlane.position.y = 5.65;
  badgePlane.billboardMode = Mesh.BILLBOARDMODE_Y;
  badgePlane.parent = portalRoot;
  badgePlane.isPickable = false;

  const badgeMat = new StandardMaterial(`portal-badge-mat-${kind}`, scene);
  badgeMat.alpha = 1;
  badgeMat.disableLighting = true;

  if (typeof document !== 'undefined' || typeof OffscreenCanvas !== 'undefined') {
    const bdt = new DynamicTexture(`portal-badge-dt-${kind}`, { width: 1536, height: 320 }, scene, false, Texture.TRILINEAR_SAMPLINGMODE);
    bdt.hasAlpha = true;
    const bctx = bdt.getContext();
    bctx.imageSmoothingEnabled = true;
    bctx.clearRect(0, 0, 1536, 320);

    bctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    if (typeof bctx.roundRect === 'function') {
      bctx.beginPath();
      bctx.roundRect(16, 16, 1504, 288, 72);
      bctx.fill();
    } else {
      bctx.fillRect(16, 16, 1504, 288);
    }

    bctx.strokeStyle = accentHex;
    bctx.lineWidth = 14;
    bctx.stroke();

    bctx.font = '900 80px Arial, "Nunito", sans-serif';
    bctx.fillStyle = '#fef08a';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillText(`▶ [E] ${label.toUpperCase()} ◀`, 768, 160, 1420);

    bdt.update();
    badgeMat.emissiveTexture = bdt;
  } else {
    badgeMat.diffuseColor = Color3.FromHexString('#0f172a');
    badgeMat.emissiveColor = Color3.FromHexString(accentHex).scale(0.6);
  }
  badgePlane.material = badgeMat;

  // 3. Animation nhấp nhô nhẹ nhàng
  const phase = Math.random() * Math.PI * 2;
  const observer = scene.onBeforeRenderObservable.add(() => {
    if (portalRoot.isDisposed()) {
      scene.onBeforeRenderObservable.remove(observer);
      return;
    }
    const t = performance.now() * 0.003;
    badgePlane.position.y = 5.65 + Math.sin(t + phase) * 0.06;
    disc.rotation.y += 0.003;
  });

  return portalRoot;
}

/**
 * QUẢNG TRƯỜNG TRUNG TÂM & LÁT CẮT MẪU FARM3D
 * - Quảng trường cẩm thạch trắng ngà thoáng đãng, công trình biểu tượng duy nhất là Đài Phun Nước Kaia 3 tầng
 * - Trục nhìn thông suốt 100% từ Điểm Xuất Phát (0, 18) hướng Bắc tới Đài Phun Nước và hướng Nam ra Đại Lộ Làng
 * - Các công trình thương mại khoác lên kiến trúc mái ngói Terracotta, tường vôi kem bơ và bảng hiệu gỗ sồi ấm áp
 */
export function createPlayTogetherPlaza(scene, shadows, foliage) {
  const steps = createPlayTogetherPlazaSteps(scene, shadows, foliage);
  let result;
  do { result = steps.next(); } while (!result.done);
  return result.value;
}

export function* createPlayTogetherPlazaSteps(scene, shadows, foliage) {
  const plazaRoot = new TransformNode('playtogether-central-plaza-root', scene);

  // Bộ vật liệu chuẩn Art Bible
  const matsCozy = {
    wallPlaster: createCozyMaterial(scene, 'town-wall-plaster', WORLD_PALETTE.wallPlaster),
    wallCream: createCozyMaterial(scene, 'town-wall-cream', WORLD_PALETTE.wallPlasterWarm),
    stonePlinth: createCozyMaterial(scene, 'town-stone-plinth', WORLD_PALETTE.stoneFoundation),
    roofTile: createCozyMaterial(scene, 'town-roof-terracotta', WORLD_PALETTE.roofTerracotta),
    roofRidge: createCozyMaterial(scene, 'town-roof-ridge', WORLD_PALETTE.roofRidge),
    timber: createCozyMaterial(scene, 'town-timber-oak', WORLD_PALETTE.woodOakDark),
    timberWarm: createCozyMaterial(scene, 'town-timber-warm', WORLD_PALETTE.woodOakWarm),
    glassWarm: createCozyMaterial(scene, 'town-glass-warm', '#fef9c3', '#fef08a', 0.8),
    glassClear: createCozyMaterial(scene, 'town-glass-clear', '#e0f2fe', '#38bdf8', 0.85),
    glassGreen: createCozyMaterial(scene, 'town-glass-green', '#dcfce7', '#22c55e', 0.85),
    lanternAmber: createCozyMaterial(scene, 'town-lantern-amber', WORLD_PALETTE.lanternCore, WORLD_PALETTE.lanternAmber, 0.9),
  };
  // Kính men đục: giữ màu sáng mà không bị transparent sorting nhấp nháy
  // khi mặt kính nằm sát thân cửa hàng.
  matsCozy.glassWarm.alpha = 1;
  matsCozy.glassClear.alpha = 1;
  matsCozy.glassGreen.alpha = 1;

  // ========================================================
  // 1. SÀN QUẢNG TRƯỜNG ĐÁ CẨM THẠCH TRẮNG NGÀ 92M
  // ========================================================
  const plazaDisc = MeshBuilder.CreateCylinder('pt-plaza-grand-disc', {
    diameter: 92,
    height: 0.12,
    tessellation: 64,
  }, scene);
  plazaDisc.position.set(0, 0.06, 0);
  plazaDisc.parent = plazaRoot;
  plazaDisc.receiveShadows = true;

  const plazaTex = new DynamicTexture('pt-plaza-surface-tex', 1024, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  plazaTex.anisotropicFilteringLevel = 16;
  const pctx = plazaTex.getContext();

  pctx.fillStyle = '#eedbc3';
  pctx.fillRect(0, 0, 1024, 1024);

  // Lát đá ô lớn, ít đường chỉ để giữ quảng trường sạch và nhân vật nổi bật.
  pctx.strokeStyle = '#dac5ab';
  pctx.lineWidth = 2;
  for (let edge = 0; edge <= 1024; edge += 96) {
    pctx.beginPath(); pctx.moveTo(edge, 0); pctx.lineTo(edge, 1024); pctx.stroke();
    pctx.beginPath(); pctx.moveTo(0, edge); pctx.lineTo(1024, edge); pctx.stroke();
  }

  // Một vòng màu ấm duy nhất dẫn mắt về đài phun nước.
  pctx.fillStyle = '#f4e4c9';
  pctx.beginPath();
  pctx.arc(512, 512, 165, 0, Math.PI * 2);
  pctx.fill();
  pctx.strokeStyle = '#e8b96f';
  pctx.lineWidth = 5;
  pctx.stroke();

  plazaTex.update();

  const matPlaza = new StandardMaterial('pt-plaza-mat', scene);
  matPlaza.diffuseTexture = plazaTex;
  matPlaza.specularColor = new Color3(0.10, 0.10, 0.10);
  matPlaza.specularPower = 64;
  matPlaza.emissiveColor = Color3.FromHexString('#eedbc3').scale(0.07);
  plazaDisc.material = matPlaza;

  // Viền đá bó vỉa hè tròn quanh quảng trường với chỉ vàng ấm
  const curbRimOuter = MeshBuilder.CreateTorus('pt-plaza-stone-curb', {
    diameter: 91.6,
    thickness: 0.35,
    tessellation: 64,
  }, scene);
  curbRimOuter.position.y = 0.14;
  curbRimOuter.material = makeMat(scene, 'pt-curb-amber', '#e7e5e4', '#d97706', 0.6, 90);
  curbRimOuter.parent = plazaRoot;

  // ========================================================
  // 2. CÔNG TRÌNH BIỂU TƯỢNG TRUNG TÂM: ĐÀI PHUN NƯỚC KAIA 3 TẦNG
  // ========================================================
  yield 'boot: plaza fountain';
  const fountainRoot = new TransformNode('pt-grand-central-fountain', scene);
  fountainRoot.position.set(0, 0, 0);
  fountainRoot.parent = plazaRoot;

  const matsFountain = {
    marbleWhite: makeMat(scene, 'fountain-marble-white', '#f7f0df', null, 0.18, 60),
    marbleGold: makeMat(scene, 'fountain-marble-gold', '#e6b866', null, 0.2, 64),
    crystalWater: makeMat(scene, 'fountain-crystal-water', '#55c9e2', '#087a9d', 0.35, 80),
    dolphinGlass: makeMat(scene, 'fountain-dolphin-glass', '#7cdbeb', '#258fae', 0.3, 80),
  };
  matsFountain.crystalWater.alpha = 0.82;
  matsFountain.dolphinGlass.alpha = 0.88;

  // Tầng 1: Hồ chính đường kính 18m
  const pool1 = MeshBuilder.CreateCylinder('fountain-pool-1', { diameter: 18.0, height: 0.9, tessellation: 48 }, scene);
  pool1.position.y = 0.45;
  pool1.material = matsFountain.marbleWhite;
  pool1.parent = fountainRoot;
  shadows?.addShadowCaster(pool1);

  const poolRim1 = MeshBuilder.CreateTorus('fountain-rim-1', { diameter: 18.0, thickness: 0.7, tessellation: 48 }, scene);
  poolRim1.position.y = 0.9;
  poolRim1.material = matsFountain.marbleWhite;
  poolRim1.parent = fountainRoot;

  const water1 = MeshBuilder.CreateCylinder('fountain-water-1', { diameter: 16.8, height: 0.1, tessellation: 48 }, scene);
  water1.position.y = 0.8;
  water1.material = matsFountain.crystalWater;
  water1.parent = fountainRoot;

  // Tầng 2: Bồn giữa đường kính 10.5m
  const col1 = MeshBuilder.CreateCylinder('fountain-col-1', { diameter: 3.4, height: 1.8, tessellation: 24 }, scene);
  col1.position.y = 1.7;
  col1.material = matsFountain.marbleGold;
  col1.parent = fountainRoot;

  const pool2 = MeshBuilder.CreateCylinder('fountain-pool-2', { diameter: 10.5, height: 0.75, tessellation: 36 }, scene);
  pool2.position.y = 2.45;
  pool2.material = matsFountain.marbleWhite;
  pool2.parent = fountainRoot;
  shadows?.addShadowCaster(pool2);

  const water2 = MeshBuilder.CreateCylinder('fountain-water-2', { diameter: 9.6, height: 0.1, tessellation: 36 }, scene);
  water2.position.y = 2.8;
  water2.material = matsFountain.crystalWater;
  water2.parent = fountainRoot;

  // Tầng 3: Bồn đỉnh đường kính 5.2m
  const col2 = MeshBuilder.CreateCylinder('fountain-col-2', { diameter: 2.2, height: 1.6, tessellation: 20 }, scene);
  col2.position.y = 3.5;
  col2.material = matsFountain.marbleGold;
  col2.parent = fountainRoot;

  const pool3 = MeshBuilder.CreateCylinder('fountain-pool-3', { diameter: 5.2, height: 0.65, tessellation: 24 }, scene);
  pool3.position.y = 4.2;
  pool3.material = matsFountain.marbleWhite;
  pool3.parent = fountainRoot;

  // Tượng Cá Heo Đôi Pha Lê Xanh phun nước vươn mình lên đỉnh tháp
  const dolphinGroup = new TransformNode('fountain-dolphins', scene);
  dolphinGroup.position.set(0, 5.0, 0);
  dolphinGroup.parent = fountainRoot;

  [-0.45, 0.45].forEach((dx, didx) => {
    const dolphin = MeshBuilder.CreateSphere(`dolphin-${didx}`, { diameterX: 0.9, diameterY: 1.8, diameterZ: 0.9, segments: 12 }, scene);
    dolphin.position.set(dx, 0.8, 0);
    dolphin.rotation.z = didx === 0 ? 0.35 : -0.35;
    dolphin.material = matsFountain.dolphinGlass;
    dolphin.parent = dolphinGroup;
  });

  // Hạt nước phun trào lấp lánh (Particle Water Cascade)
  const sprayEmitter = new TransformNode('fountain-spray-emitter', scene);
  sprayEmitter.position.set(0, 6.8, 0);
  sprayEmitter.parent = fountainRoot;

  const spray = new ParticleSystem('fountain-particles', 80, scene);
  const sprayTexture = new DynamicTexture('fountain-droplet-texture', 64, scene, false);
  sprayTexture.hasAlpha = true;
  const sprayContext = sprayTexture.getContext();
  const droplet = sprayContext.createRadialGradient(32, 32, 2, 32, 32, 30);
  droplet.addColorStop(0, 'rgba(255,255,255,0.95)');
  droplet.addColorStop(0.45, 'rgba(175,235,250,0.75)');
  droplet.addColorStop(1, 'rgba(175,235,250,0)');
  sprayContext.fillStyle = droplet;
  sprayContext.fillRect(0, 0, 64, 64);
  sprayTexture.update();
  spray.particleTexture = sprayTexture;
  spray.emitter = sprayEmitter;
  spray.minEmitBox = new Vector3(-0.3, 0, -0.3);
  spray.maxEmitBox = new Vector3(0.3, 0.1, 0.3);
  spray.color1 = new Color4(0.8, 0.95, 1.0, 0.85);
  spray.color2 = new Color4(0.3, 0.85, 1.0, 0.5);
  spray.colorDead = new Color4(0.1, 0.5, 0.9, 0.0);
  spray.minSize = 0.25;
  spray.maxSize = 0.65;
  spray.minLifeTime = 1.0;
  spray.maxLifeTime = 2.2;
  spray.emitRate = 36;
  spray.gravity = new Vector3(0, -9.81, 0);
  spray.direction1 = new Vector3(-2.2, 5.5, -2.2);
  spray.direction2 = new Vector3(2.2, 6.2, 2.2);
  spray.start();
  yield 'boot: plaza gardens';

  // ========================================================
  // 3. LÁT CẮT MẪU: ĐIỂM XUẤT PHÁT (0, 18) ➔ ĐÀI PHUN NƯỚC (0, 0)
  // Hành lang mở rộng hoàn toàn thông thoáng, hai bên lề có chậu hoa & đèn vàng ấm
  // ========================================================
  const matPlanterStone = matsCozy.stonePlinth;
  const matFlowerPetal = createCozyMaterial(scene, 'spawn-flower-petal', '#fb7185', '#f43f5e');
  const matBushGreen = createCozyMaterial(scene, 'spawn-bush-green', '#22c55e');

  // Các cặp chậu hoa đá xếp dọc hai bên lề hành lang (x = ±4.8m)
  [15, 9, 3].forEach((pz, pidx) => {
    [-4.8, 4.8].forEach((px, sideIdx) => {
      const urn = MeshBuilder.CreateCylinder(`spawn-urn-${pidx}-${sideIdx}`, {
        diameterTop: 1.3,
        diameterBottom: 0.9,
        height: 0.85,
        tessellation: 16,
      }, scene);
      urn.position.set(px, 0.42, pz);
      urn.material = matPlanterStone;
      urn.parent = plazaRoot;
      shadows?.addShadowCaster(urn);

      const foliageBall = MeshBuilder.CreateSphere(`spawn-urn-bush-${pidx}-${sideIdx}`, { diameter: 1.2, segments: 8 }, scene);
      foliageBall.position.set(px, 0.95, pz);
      foliageBall.material = pidx % 2 === 0 ? matFlowerPetal : matBushGreen;
      foliageBall.parent = plazaRoot;
    });
  });

  // Cột đèn lồng ấm cổ điển rọi sáng hành lang đón khách tại (x = ±5.2, z = 12)
  [-5.2, 5.2].forEach((lx, lidx) => {
    const lampPost = MeshBuilder.CreateCylinder(`spawn-lamp-post-${lidx}`, { height: 3.8, diameter: 0.16, tessellation: 10 }, scene);
    lampPost.position.set(lx, 1.9, 12);
    lampPost.material = matsCozy.timber;
    lampPost.parent = plazaRoot;
    shadows?.addShadowCaster(lampPost);

    createWarmHangingLantern(scene, new Vector3(lx + (lx > 0 ? -0.4 : 0.4), 3.5, 12), plazaRoot, shadows);
  });

  // Bốn đảo hoa thấp lấp khoảng trống chéo giữa các lối đi. Các trục x=0,
  // z=0 và đường dẫn tới cửa hàng vẫn rộng, không bị cây hay ghế che.
  const bedMat = createCozyMaterial(scene, 'plaza-flowerbed-stone', '#ddc2a1');
  const soilMat = createCozyMaterial(scene, 'plaza-flowerbed-soil', '#8d684d');
  const leafMat = createCozyMaterial(scene, 'plaza-flowerbed-leaf', '#54b978');
  const bloomMats = [
    createCozyMaterial(scene, 'plaza-bloom-coral', '#f58c9c'),
    createCozyMaterial(scene, 'plaza-bloom-gold', '#f3c96f'),
  ];
  [[-18, -6], [18, -6], [-14, 14], [14, 14]].forEach(([x, z], index) => {
    const bed = MeshBuilder.CreateCylinder(`plaza-flowerbed-${index}`, { diameter: 4.2, height: 0.34, tessellation: 20 }, scene);
    bed.position.set(x, 0.23, z); bed.material = bedMat; bed.parent = plazaRoot;
    const soil = MeshBuilder.CreateCylinder(`plaza-flowerbed-soil-${index}`, { diameter: 3.65, height: 0.035, tessellation: 20 }, scene);
    soil.position.set(x, 0.42, z); soil.material = soilMat; soil.parent = plazaRoot;
    for (let flower = 0; flower < 5; flower += 1) {
      const angle = flower * Math.PI * 2 / 5 + index;
      const fx = x + Math.cos(angle) * 1.05;
      const fz = z + Math.sin(angle) * 1.05;
      const leaves = MeshBuilder.CreateSphere(`plaza-flower-leaves-${index}-${flower}`, { diameter: 0.68, segments: 6 }, scene);
      leaves.position.set(fx, 0.67, fz); leaves.material = leafMat; leaves.parent = plazaRoot;
      const bloom = MeshBuilder.CreateSphere(`plaza-flower-bloom-${index}-${flower}`, { diameter: 0.38, segments: 6 }, scene);
      bloom.position.set(fx, 0.93, fz); bloom.material = bloomMats[(index + flower) % 2]; bloom.parent = plazaRoot;
    }
  });

  // Giữ trục nhìn từ spawn tới đài phun nước sạch; kiosk bản đồ ở rìa phố
  // đảm nhiệm chỉ đường, không cần hai bảng hiệu lớn sát mặt nhân vật.

  // ========================================================
  // 4. MEGA VENUE 1: 👗 TIỆM THỜI TRANG & SALON (FASHION MALL)
  // Tọa lạc tại Đông Nam (x: 29, z: -25), venue: 'fashion'
  // ========================================================
  yield 'boot: fashion exterior';
  const fashionRoot = new TransformNode('venue-fashion-boutique-modern', scene);
  fashionRoot.metadata = { venue: 'fashion' };
  fashionRoot.position.set(VENUE_LAYOUT.fashion.exterior.x, 0, VENUE_LAYOUT.fashion.exterior.z);
  fashionRoot.rotation.y = VENUE_LAYOUT.fashion.exterior.yaw;
  fashionRoot.parent = plazaRoot;

  const fashionPlinth = MeshBuilder.CreateBox('fashion-plinth', { width: 17.0, height: 0.5, depth: 13.0 }, scene);
  fashionPlinth.position.y = 0.25;
  fashionPlinth.material = matsCozy.stonePlinth;
  fashionPlinth.parent = fashionRoot;
  fashionPlinth.receiveShadows = true;

  const fashionBody = MeshBuilder.CreateBox('fashion-body', { width: 16.0, height: 8.5, depth: 12.0 }, scene);
  fashionBody.position.y = 4.6;
  fashionBody.material = matsCozy.wallPlaster;
  fashionBody.parent = fashionRoot;
  shadows?.addShadowCaster(fashionBody);

  addShopFacade(scene, fashionRoot, 'fashion', '#d9f0ed', '#e991b2', matsCozy);

  // Mái ngói đỏ cam Terracotta dốc chữ A trên nóc
  addTerracottaGableRoof(scene, fashionRoot, 16.0, 12.0, 8.85, matsCozy, shadows);

  // 2 Bục trưng bày thời trang mẫu trước sảnh
  [-4.2, 4.2].forEach((px, idx) => {
    const ped = MeshBuilder.CreateCylinder(`fashion-pedestal-${idx}`, { diameter: 2.0, height: 0.5, tessellation: 24 }, scene);
    ped.position.set(px, 0.25, 6.8);
    ped.material = matsCozy.stonePlinth;
    ped.parent = fashionRoot;
    ped.receiveShadows = true;

    const pedTop = MeshBuilder.CreateCylinder(`fashion-pedestal-top-${idx}`, { diameter: 2.1, height: 0.06, tessellation: 24 }, scene);
    pedTop.position.set(px, 0.51, 6.8);
    pedTop.material = matsCozy.timberWarm;
    pedTop.parent = fashionRoot;

    const manBody = MeshBuilder.CreateCylinder(`fashion-model-body-${idx}`, { diameterTop: 0.45, diameterBottom: 0.65, height: 0.95, tessellation: 16 }, scene);
    manBody.position.set(px, 1.05, 6.8);
    manBody.material = idx === 0 ? matsCozy.wallPlaster : matsCozy.timberWarm;
    manBody.parent = fashionRoot;

    const manHead = MeshBuilder.CreateSphere(`fashion-model-head-${idx}`, { diameter: 0.46, segments: 12 }, scene);
    manHead.position.set(px, 1.65, 6.8);
    manHead.material = matsCozy.wallCream;
    manHead.parent = fashionRoot;

    createWarmHangingLantern(scene, new Vector3(px, 3.8, 6.8), fashionRoot, shadows);
  });

  // Biểu tượng Nơ Thời Trang mạ vàng trên đỉnh hồi mái
  const bowNode = new TransformNode('fashion-pediment-bow', scene);
  bowNode.position.set(0, 10.8, 6.18);
  bowNode.parent = fashionRoot;
  const matGoldTrim = makeMat(scene, 'fashion-pediment-gold', '#fbbf24', '#f59e0b', 0.8, 120);
  const bowCenter = MeshBuilder.CreateSphere('fashion-bow-knot', { diameter: 0.6, segments: 10 }, scene);
  bowCenter.material = matGoldTrim;
  bowCenter.parent = bowNode;
  [-0.6, 0.6].forEach((bx, idx) => {
    const loop = MeshBuilder.CreateTorus(`fashion-bow-loop-${idx}`, { diameter: 0.9, thickness: 0.22, tessellation: 20 }, scene);
    loop.position.set(bx, 0, 0);
    loop.rotation.y = Math.PI / 2;
    loop.rotation.z = idx === 0 ? 0.3 : -0.3;
    loop.material = matGoldTrim;
    loop.parent = bowNode;
  });

  // ========================================================
  // 5. MEGA VENUE 2: 🎰 HỘI QUÁN TRÒ CHƠI & CASINO (ARCADE LOUNGE)
  // Tọa lạc tại Tây Nam (x: -29, z: -25), venue: 'casino'
  // ========================================================
  yield 'boot: arcade exterior';
  const casinoRoot = new TransformNode('venue-casino-modern', scene);
  casinoRoot.metadata = { venue: 'casino' };
  casinoRoot.position.set(VENUE_LAYOUT.casino.exterior.x, 0, VENUE_LAYOUT.casino.exterior.z);
  casinoRoot.rotation.y = VENUE_LAYOUT.casino.exterior.yaw;
  casinoRoot.parent = plazaRoot;

  const casinoPlinth = MeshBuilder.CreateBox('casino-plinth', { width: 17.0, height: 0.5, depth: 13.0 }, scene);
  casinoPlinth.position.y = 0.25;
  casinoPlinth.material = matsCozy.stonePlinth;
  casinoPlinth.parent = casinoRoot;
  casinoPlinth.receiveShadows = true;

  const casinoBody = MeshBuilder.CreateBox('casino-body', { width: 16.0, height: 8.8, depth: 12.0 }, scene);
  casinoBody.position.y = 4.75;
  casinoBody.material = matsCozy.wallCream;
  casinoBody.parent = casinoRoot;
  shadows?.addShadowCaster(casinoBody);

  addShopFacade(scene, casinoRoot, 'casino', '#f1e4cd', '#a785ca', matsCozy);

  // Cột viền gỗ sồi ấm áp
  [-6.8, 6.8].forEach((cx, idx) => {
    const col = MeshBuilder.CreateCylinder(`casino-wood-col-${idx}`, { diameter: 0.8, height: 9.0, tessellation: 16 }, scene);
    col.position.set(cx, 4.75, 6.2);
    col.material = matsCozy.timber;
    col.parent = casinoRoot;
    shadows?.addShadowCaster(col);
  });

  // Mái ngói đỏ cam Terracotta dốc chữ A trên nóc
  addTerracottaGableRoof(scene, casinoRoot, 16.0, 12.0, 9.15, matsCozy, shadows);

  // Biểu tượng xúc xắc gỗ & đồng xu vàng may mắn nhỏ gọn trên đỉnh hồi mái
  const diceRoot = new TransformNode('casino-giant-dice-spinner', scene);
  diceRoot.position.set(0, 13.2, 0);
  diceRoot.parent = casinoRoot;

  const giantDice = MeshBuilder.CreateBox('giant-dice-cube', { size: 2.4 }, scene);
  giantDice.material = matsCozy.wallCream;
  giantDice.parent = diceRoot;
  shadows?.addShadowCaster(giantDice);

  const goldCoin = MeshBuilder.CreateCylinder('casino-giant-coin', { diameter: 2.2, height: 0.3, tessellation: 32 }, scene);
  goldCoin.rotation.z = Math.PI / 2;
  goldCoin.position.set(2.4, 0, 0);
  goldCoin.material = makeMat(scene, 'casino-gold-coin', '#fbbf24', '#f59e0b', 0.8, 120);
  goldCoin.parent = diceRoot;

  // Bảng hiệu mặt tiền & biểu tượng xúc xắc đã được bố trí ở mặt trước và đỉnh hồi mái

  // ========================================================
  // 6. MEGA VENUE 3: 🛒 NÔNG TRANG VẬT TƯ & SIÊU THỊ NÔNG NGHIỆP (AGRI-MART)
  // Tọa lạc tại Đông Bắc (x: 29, z: 25), venue: 'supplies'
  // ========================================================
  yield 'boot: supplies exterior';
  const martRoot = new TransformNode('venue-agri-mall-modern', scene);
  martRoot.metadata = { venue: 'supplies' };
  martRoot.position.set(VENUE_LAYOUT.supplies.exterior.x, 0, VENUE_LAYOUT.supplies.exterior.z);
  martRoot.rotation.y = VENUE_LAYOUT.supplies.exterior.yaw;
  martRoot.parent = plazaRoot;

  const martPlinth = MeshBuilder.CreateBox('mart-plinth', { width: 17.0, height: 0.5, depth: 13.0 }, scene);
  martPlinth.position.y = 0.25;
  martPlinth.material = matsCozy.stonePlinth;
  martPlinth.parent = martRoot;
  martPlinth.receiveShadows = true;

  const martBody = MeshBuilder.CreateBox('mart-body', { width: 16.0, height: 8.5, depth: 12.0 }, scene);
  martBody.position.y = 4.6;
  martBody.material = matsCozy.wallPlaster;
  martBody.parent = martRoot;
  shadows?.addShadowCaster(martBody);

  addShopFacade(scene, martRoot, 'supplies', '#d4f3d8', '#6fb981', matsCozy);

  // Mái ngói đỏ cam Terracotta dốc chữ A trên nóc
  addTerracottaGableRoof(scene, martRoot, 16.0, 12.0, 8.85, matsCozy, shadows);

  // Kệ trưng bày sọt trái cây & hạt giống tươi mới
  [2.2, 4.2].forEach((kx, kidx) => {
    const stand = MeshBuilder.CreateBox(`fruit-stand-${kidx}`, { width: 1.4, height: 1.0, depth: 1.2 }, scene);
    stand.position.set(kx, 0.7, 7.2);
    stand.material = matsCozy.timberWarm;
    stand.parent = martRoot;

    const fruit = MeshBuilder.CreateSphere(`fruit-bulk-${kidx}`, { diameter: 0.9, segments: 8 }, scene);
    fruit.position.set(kx, 1.4, 7.2);
    fruit.material = makeMat(scene, `fruit-mat-${kidx}`, '#ea580c', '#f97316');
    fruit.parent = martRoot;
  });

  // Biểu tượng Mầm Cây Vàng & Bông Lúa trên đỉnh hồi mái
  const sproutNode = new TransformNode('supplies-pediment-sprout', scene);
  sproutNode.position.set(0, 10.8, 6.18);
  sproutNode.parent = martRoot;
  const matSproutGold = makeMat(scene, 'supplies-pediment-gold', '#22c55e', '#16a34a', 0.6, 90);
  const stalk = MeshBuilder.CreateCylinder('supplies-sprout-stalk', { diameter: 0.16, height: 1.2 }, scene);
  stalk.position.set(0, 0, 0);
  stalk.material = matSproutGold;
  stalk.parent = sproutNode;
  [-0.45, 0.45].forEach((lx, idx) => {
    const leaf = MeshBuilder.CreateSphere(`supplies-sprout-leaf-${idx}`, { diameterX: 0.8, diameterY: 0.35, diameterZ: 0.15 }, scene);
    leaf.position.set(lx, 0.35, 0);
    leaf.rotation.z = idx === 0 ? 0.5 : -0.5;
    leaf.material = matSproutGold;
    leaf.parent = sproutNode;
  });

  // ========================================================
  // 7. MEGA VENUE 4: 🏎️ TRẠM XE CỘ & XE ĐẠP (MOTOR SHOWROOM)
  // Tọa lạc tại Tây Bắc (x: -29, z: 25), venue: 'vehicles'
  // ========================================================
  yield 'boot: vehicles exterior';
  const vehicleRoot = new TransformNode('venue-vehicle-dealer-modern', scene);
  vehicleRoot.metadata = { venue: 'vehicles' };
  vehicleRoot.position.set(VENUE_LAYOUT.vehicles.exterior.x, 0, VENUE_LAYOUT.vehicles.exterior.z);
  vehicleRoot.rotation.y = VENUE_LAYOUT.vehicles.exterior.yaw;
  vehicleRoot.parent = plazaRoot;

  const motorPlinth = MeshBuilder.CreateBox('motor-plinth', { width: 17.0, height: 0.5, depth: 13.0 }, scene);
  motorPlinth.position.y = 0.25;
  motorPlinth.material = matsCozy.stonePlinth;
  motorPlinth.parent = vehicleRoot;
  motorPlinth.receiveShadows = true;

  const motorBody = MeshBuilder.CreateBox('motor-body', { width: 16.0, height: 8.5, depth: 12.0 }, scene);
  motorBody.position.y = 4.6;
  motorBody.material = matsCozy.wallCream;
  motorBody.parent = vehicleRoot;
  shadows?.addShadowCaster(motorBody);

  addShopFacade(scene, vehicleRoot, 'vehicles', '#d6eef3', '#73add5', matsCozy);

  // Mái ngói đỏ cam Terracotta dốc chữ A trên nóc
  addTerracottaGableRoof(scene, vehicleRoot, 16.0, 12.0, 8.85, matsCozy, shadows);

  // Bệ xoay trưng bày xe thể thao Chibi đặt tại khu trưng bày bên phải (không chắn cửa vào)
  const turntable = MeshBuilder.CreateCylinder('motor-turntable', { diameter: 4.4, height: 0.25, tessellation: 32 }, scene);
  turntable.position.set(4.8, 0.64, 7.2);
  turntable.material = matsCozy.timberWarm;
  turntable.parent = vehicleRoot;

  const carBody = MeshBuilder.CreateBox('motor-show-car', { width: 2.2, height: 0.85, depth: 3.4 }, scene);
  carBody.position.set(4.8, 1.2, 7.2);
  carBody.material = makeMat(scene, 'motor-car-red', '#ef4444', '#dc2626', 0.8, 120);
  carBody.parent = vehicleRoot;
  shadows?.addShadowCaster(carBody);

  const carCockpit = MeshBuilder.CreateSphere('motor-car-cockpit', { diameterX: 1.8, diameterY: 1.2, diameterZ: 1.8, segments: 10 }, scene);
  carCockpit.position.set(4.8, 1.7, 7.0);
  carCockpit.material = makeMat(scene, 'motor-cockpit-opaque', '#bce8eb', null, 0.22, 56);
  carCockpit.parent = vehicleRoot;

  // Biểu tượng Cánh Bay Tốc Độ & Vô Lăng trên đỉnh hồi mái
  const motorEmblemNode = new TransformNode('vehicle-pediment-emblem', scene);
  motorEmblemNode.position.set(0, 10.8, 6.18);
  motorEmblemNode.parent = vehicleRoot;
  const matWing = makeMat(scene, 'vehicle-pediment-wing', '#38bdf8', '#0284c7', 0.8, 120);
  const centerDisc = MeshBuilder.CreateCylinder('vehicle-emblem-center', { diameter: 0.8, height: 0.15 }, scene);
  centerDisc.rotation.x = Math.PI / 2;
  centerDisc.material = matWing;
  centerDisc.parent = motorEmblemNode;
  [-0.9, 0.9].forEach((wx, idx) => {
    const wing = MeshBuilder.CreateBox(`vehicle-wing-${idx}`, { width: 1.1, height: 0.35, depth: 0.08 }, scene);
    wing.position.set(wx, 0.15, 0);
    wing.rotation.z = idx === 0 ? -0.25 : 0.25;
    wing.material = matWing;
    wing.parent = motorEmblemNode;
  });

  // ========================================================
  // 8. MEGA VENUE 5: 🎣 BẾN CÂU CÁ HỒ PHA LÊ & ĐỒ CÂU (FISHING TACKLE WHARF)
  // Tọa lạc tại bến nước bờ hồ Pha Lê phía Đông (x: 135, z: 6)
  // ========================================================
  yield 'boot: fishing exterior';
  const fishingRoot = new TransformNode('venue-fishing-tackle-wharf', scene);
  fishingRoot.metadata = { venue: 'fishing' };
  fishingRoot.position.set(VENUE_LAYOUT.fishing.exterior.x, 0, VENUE_LAYOUT.fishing.exterior.z);
  fishingRoot.rotation.y = VENUE_LAYOUT.fishing.exterior.yaw;
  fishingRoot.parent = plazaRoot;

  // Sàn gỗ bến nước ven hồ
  const fishingPlinth = MeshBuilder.CreateBox('fishing-wharf-deck', { width: 17.0, height: 0.5, depth: 13.0 }, scene);
  fishingPlinth.position.y = 0.25;
  fishingPlinth.material = matsCozy.timberWarm;
  fishingPlinth.parent = fishingRoot;
  fishingPlinth.receiveShadows = true;

  const fishingBody = MeshBuilder.CreateBox('fishing-body', { width: 16.0, height: 8.5, depth: 12.0 }, scene);
  fishingBody.position.y = 4.6;
  fishingBody.material = matsCozy.timber;
  fishingBody.parent = fishingRoot;
  shadows?.addShadowCaster(fishingBody);

  addShopFacade(scene, fishingRoot, 'fishing', '#d7f1f2', '#60b9c3', matsCozy);

  // Mái ngói đỏ cam Terracotta dốc chữ A trên nóc
  addTerracottaGableRoof(scene, fishingRoot, 16.0, 12.0, 8.85, matsCozy, shadows);

  // === TƯỢNG CÁ VUA 3D KHỔNG LỒ BIỂU TƯỢNG TRÊN NÓC MÁI (GIANT LEAPING CARP MASCOT) ===
  // Phong cách linh vật thương hiệu đặc trưng của Play Together
  const mascotNode = new TransformNode('fishing-mascot-carp', scene);
  mascotNode.position.set(0, 12.6, 0);
  mascotNode.parent = fishingRoot;

  const matFishGold = makeMat(scene, 'mascot-fish-gold', '#f59e0b', '#d97706', 0.9, 120);
  const matFishAzure = makeMat(scene, 'mascot-fish-azure', '#38bdf8', '#0284c7', 0.8, 90);
  const matFishWhite = makeMat(scene, 'mascot-fish-white', '#ffffff', '#f8fafc', 0.5, 60);

  // Thân cá uốn lượn bay lượn trên đỉnh mái
  const fishBody = MeshBuilder.CreateSphere('mascot-carp-body', { diameterX: 1.1, diameterY: 1.5, diameterZ: 3.6, segments: 10 }, scene);
  fishBody.rotation.x = -0.25;
  fishBody.material = matFishGold;
  fishBody.parent = mascotNode;
  shadows?.addShadowCaster(fishBody);

  // Bụng cá trắng sáng
  const fishBelly = MeshBuilder.CreateSphere('mascot-carp-belly', { diameterX: 0.95, diameterY: 1.1, diameterZ: 2.8, segments: 8 }, scene);
  fishBelly.position.set(0, -0.28, 0.1);
  fishBelly.material = matFishWhite;
  fishBelly.parent = mascotNode;

  // Vây đuôi cá xòe rộng
  const fishTail = MeshBuilder.CreateCylinder('mascot-carp-tail', { diameterTop: 0.1, diameterBottom: 1.8, height: 1.2, tessellation: 3 }, scene);
  fishTail.rotation.x = Math.PI / 2;
  fishTail.rotation.z = Math.PI / 2;
  fishTail.position.set(0, 0.45, -1.9);
  fishTail.material = matFishAzure;
  fishTail.parent = mascotNode;

  // Vây lưng cá
  const fishDorsal = MeshBuilder.CreateCylinder('mascot-carp-dorsal', { diameterTop: 0.08, diameterBottom: 1.4, height: 0.7, tessellation: 3 }, scene);
  fishDorsal.position.set(0, 0.95, 0.3);
  fishDorsal.material = matFishAzure;
  fishDorsal.parent = mascotNode;

  // 2 Mắt cá tròn to Chibi Play Together
  [-0.45, 0.45].forEach((ex, eIdx) => {
    const eyeWhite = MeshBuilder.CreateSphere(`mascot-eye-w-${eIdx}`, { diameter: 0.42, segments: 6 }, scene);
    eyeWhite.position.set(ex, 0.22, 1.45);
    eyeWhite.material = matFishWhite;
    eyeWhite.parent = mascotNode;

    const eyePupil = MeshBuilder.CreateSphere(`mascot-eye-p-${eIdx}`, { diameter: 0.22, segments: 6 }, scene);
    eyePupil.position.set(ex * 1.1, 0.22, 1.6);
    eyePupil.material = matsCozy.roofRidge;
    eyePupil.parent = mascotNode;
  });

  // Bể cá thủy sinh trước sảnh bến thuyền (Aquarium Showcase)
  const aquariumTank = MeshBuilder.CreateBox('fishing-live-aquarium', { width: 4.5, height: 1.8, depth: 1.4 }, scene);
  aquariumTank.position.set(4.2, 1.2, 7.2);
  aquariumTank.material = matsCozy.glassClear;
  aquariumTank.parent = fishingRoot;

  // Nước trong bể cá phản quang ngọc lam
  const aquariumWater = MeshBuilder.CreateBox('fishing-aquarium-water', { width: 4.3, height: 1.6, depth: 1.2 }, scene);
  aquariumWater.position.set(4.2, 1.1, 7.2);
  aquariumWater.material = makeMat(scene, 'aquarium-water-mat', '#38bdf8', '#0284c7', 0.9, 100);
  aquariumWater.parent = fishingRoot;

  // Bảng kỷ lục câu cá mùa giải (Fishing Tournament Trophy Stand)
  const recordBoard = MeshBuilder.CreateBox('fishing-record-board', { width: 2.2, height: 1.6, depth: 0.15 }, scene);
  recordBoard.position.set(7.2, 1.8, 6.8);
  recordBoard.material = matsCozy.timberWarm;
  recordBoard.parent = fishingRoot;

  const trophyCup = MeshBuilder.CreateCylinder('fishing-gold-trophy', { diameterTop: 0.5, diameterBottom: 0.2, height: 0.6, tessellation: 8 }, scene);
  trophyCup.position.set(7.2, 2.8, 6.8);
  trophyCup.material = matFishGold;
  trophyCup.parent = fishingRoot;

  // 2 Thùng mồi sống gỗ sồi ven cửa vào (Live Bait Tubs)
  [-1.6, -0.6].forEach((bx, bIdx) => {
    const baitTub = MeshBuilder.CreateCylinder(`fishing-bait-tub-${bIdx}`, { diameter: 0.65, height: 0.7, tessellation: 10 }, scene);
    baitTub.position.set(bx, 0.6, 7.2);
    baitTub.material = matsCozy.timber;
    baitTub.parent = fishingRoot;
  });

  // Giá cắm cần câu máy ven bến
  [-4.2, -2.4].forEach((rx, ridx) => {
    const rack = MeshBuilder.CreateBox(`tackle-rack-${ridx}`, { width: 1.4, height: 1.6, depth: 0.8 }, scene);
    rack.position.set(rx, 1.0, 7.2);
    rack.material = matsCozy.timberWarm;
    rack.parent = fishingRoot;

    [-0.4, 0, 0.4].forEach((cx, cidx) => {
      const rod = MeshBuilder.CreateCylinder(`rod-display-${ridx}-${cidx}`, { diameterTop: 0.04, diameterBottom: 0.1, height: 3.6, tessellation: 8 }, scene);
      rod.position.set(rx + cx, 2.5, 7.2);
      rod.rotation.z = 0.15;
      rod.material = matsCozy.timber;
      rod.parent = fishingRoot;
    });
  });

  // Bảng hiệu mặt tiền & Tượng Cá Chép Vàng bay lượn đã được bố trí ở mặt trước và nóc

  // === LAKESIDE VERANDA & WATERFRONT BOATHOUSE FACADE (Mặt Sau Hướng Hồ Pha Lê) ===
  // Biến bức tường phía hồ thành ban công ngắm cảnh tuyệt đẹp chuẩn Play Together
  const lakeVerandaDeck = MeshBuilder.CreateBox('fishing-lakeside-deck', { width: 15.0, height: 0.35, depth: 4.2 }, scene);
  lakeVerandaDeck.position.set(0, 0.25, -8.1);
  lakeVerandaDeck.material = matsCozy.timberWarm;
  lakeVerandaDeck.parent = fishingRoot;
  lakeVerandaDeck.receiveShadows = true;

  // Lan can gỗ ven hồ với các cọc thừng & phao cứu sinh
  [-7.0, -3.5, 0, 3.5, 7.0].forEach((px, pidx) => {
    const post = MeshBuilder.CreateCylinder(`fishing-veranda-post-${pidx}`, { height: 1.1, diameter: 0.16 }, scene);
    post.position.set(px, 0.9, -10.1);
    post.material = matsCozy.timber;
    post.parent = fishingRoot;
  });

  const railBar = MeshBuilder.CreateBox('fishing-veranda-railbar', { width: 14.8, height: 0.1, depth: 0.14 }, scene);
  railBar.position.set(0, 1.45, -10.1);
  railBar.material = matsCozy.timber;
  railBar.parent = fishingRoot;

  // Bậc thang gỗ kết nối từ sàn Veranda xuống mặt bờ cát ven hồ (Connecting Stair Ramp)
  const stairRamp = MeshBuilder.CreateBox('fishing-veranda-stair-ramp', { width: 3.2, height: 0.25, depth: 2.2 }, scene);
  stairRamp.position.set(5.2, 0.12, -10.9);
  stairRamp.rotation.x = 0.18;
  stairRamp.material = matsCozy.timberWarm;
  stairRamp.parent = fishingRoot;

  // 2 Cửa sổ kính lớn nhìn ra hồ có đèn vàng ấm & bồn hoa dạ yến thảo
  const matWindowWarm = makeMat(scene, 'fishing-lake-win-glow', '#fef08a', '#f59e0b', 0.8, 64);
  const matLakeFlowerPetal = makeMat(scene, 'fishing-petal-pink', '#f472b6', null, 0.2, 32);

  [-4.2, 4.2].forEach((wx, widx) => {
    // Khung & Kính cửa sổ ấm
    const win = MeshBuilder.CreateBox(`fishing-lake-window-${widx}`, { width: 3.4, height: 2.4, depth: 0.12 }, scene);
    win.position.set(wx, 3.8, -6.06);
    win.material = matWindowWarm;
    win.parent = fishingRoot;

    // Bồn hoa gỗ rủ dưới bậu cửa sổ
    const planter = MeshBuilder.CreateBox(`fishing-lake-planter-${widx}`, { width: 3.2, height: 0.4, depth: 0.45 }, scene);
    planter.position.set(wx, 2.4, -6.22);
    planter.material = matsCozy.timber;
    planter.parent = fishingRoot;

    // Các cụm hoa nở trong bồn
    for (let f = 0; f < 5; f++) {
      const fl = MeshBuilder.CreateSphere(`fishing-planter-fl-${widx}-${f}`, { diameter: 0.32, segments: 6 }, scene);
      fl.position.set(wx - 1.2 + f * 0.6, 2.65, -6.22);
      fl.material = matLakeFlowerPetal;
      fl.parent = fishingRoot;
    }
  });

  // Mái hiên phụ sọc xanh dương & trắng che ban công ven hồ (Lake Awning)
  const matAwningLakeBlue = makeMat(scene, 'fishing-lake-awning-blue', '#0284c7', null, 0.2, 32);
  const matAwningLakeWhite = makeMat(scene, 'fishing-lake-awning-white', '#ffffff', null, 0.2, 32);
  for (let s = 0; s < 8; s++) {
    const awningSeg = MeshBuilder.CreateBox(`fishing-lake-awning-${s}`, { width: 14.6 / 8, height: 0.08, depth: 2.2 }, scene);
    awningSeg.position.set(-6.38 + s * (14.6 / 8), 5.4, -7.1);
    awningSeg.rotation.x = -0.22;
    awningSeg.material = (s % 2 === 0) ? matAwningLakeBlue : matAwningLakeWhite;
    awningSeg.parent = fishingRoot;
    shadows?.addShadowCaster(awningSeg);
  }

  // Bàn trà tròn & ghế cafe thư giãn ven hồ kèm Ô che nắng lớn (Waterfront Cafe Seating & Sun Parasol)
  const lakeTable = MeshBuilder.CreateCylinder('fishing-lake-table', { diameter: 1.4, height: 0.75, tessellation: 12 }, scene);
  lakeTable.position.set(-2.2, 0.65, -8.2);
  lakeTable.material = matsCozy.timberWarm;
  lakeTable.parent = fishingRoot;

  // Dù che nắng sọc xanh trắng phong cách resort biển Play Together
  const umbrellaPole = MeshBuilder.CreateCylinder('fishing-umbrella-pole', { diameter: 0.08, height: 3.2 }, scene);
  umbrellaPole.position.set(-2.2, 2.1, -8.2);
  umbrellaPole.material = matsCozy.timber;
  umbrellaPole.parent = fishingRoot;

  const umbrellaCanopy = MeshBuilder.CreateCylinder('fishing-umbrella-canopy', { diameterTop: 0.2, diameterBottom: 3.4, height: 0.8, tessellation: 8 }, scene);
  umbrellaCanopy.position.set(-2.2, 3.4, -8.2);
  umbrellaCanopy.material = matAwningLakeBlue;
  umbrellaCanopy.parent = fishingRoot;
  shadows?.addShadowCaster(umbrellaCanopy);

  [-3.2, -1.2].forEach((cx, cidx) => {
    const chair = MeshBuilder.CreateBox(`fishing-lake-chair-${cidx}`, { width: 0.6, height: 0.5, depth: 0.6 }, scene);
    chair.position.set(cx, 0.52, -8.2);
    chair.material = matsCozy.timber;
    chair.parent = fishingRoot;
  });

  // ========================================================
  // 9. HỆ THỐNG ĐÈN ĐƯỜNG CỔ ĐIỂN VÀNG ẤM QUẢNG TRƯỜNG
  // ========================================================
  const matStreetLamp = matsCozy.timber;
  const matStreetGlow = matsCozy.lanternAmber;

  [
    { x: -10, z: -27 },
    { x: 10, z: -27 },
    { x: -10, z: 27 },
    { x: 10, z: 27 },
    { x: 0, z: -35 },
  ].forEach((pos, idx) => {
    const post = MeshBuilder.CreateCylinder(`pt-lamp-post-${idx}`, { height: 5.6, diameterTop: 0.16, diameterBottom: 0.26, tessellation: 14 }, scene);
    post.position.set(pos.x, 2.8, pos.z);
    post.material = matStreetLamp;
    post.parent = plazaRoot;
    shadows?.addShadowCaster(post);

    [-1, 1].forEach((side, sidx) => {
      const arm = MeshBuilder.CreateBox(`pt-lamp-arm-${idx}-${sidx}`, { width: 0.9, height: 0.14, depth: 0.14 }, scene);
      arm.position.set(pos.x + side * 0.45, 5.4, pos.z);
      arm.material = matStreetLamp;
      arm.parent = plazaRoot;

      const lightBulb = MeshBuilder.CreateSphere(`pt-lamp-bulb-${idx}-${sidx}`, { diameter: 0.6, segments: 10 }, scene);
      lightBulb.position.set(pos.x + side * 0.9, 5.2, pos.z);
      lightBulb.material = matStreetGlow;
      lightBulb.parent = plazaRoot;

      // Quầng sáng sương mờ dịu mắt cho bóng đèn quảng trường
      createLampHaloOnly(scene, plazaRoot, new Vector3(pos.x + side * 0.9, 5.2, pos.z), 1.05);
    });

    // Vệt sáng ấm loang trên mặt đá quảng trường dưới chân mỗi cột đèn
    createGroundLightPoolOnly(scene, plazaRoot, new Vector3(pos.x, 0.126, pos.z), 3.8);
  });

  // Hoạt hình xoay xúc xắc casino & turntable xe hơi
  scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    if (diceRoot) diceRoot.rotation.y += dt * 0.5;
    if (turntable) turntable.rotation.y += dt * 0.4;
    if (carBody) carBody.rotation.y += dt * 0.4;
    if (carCockpit) carCockpit.rotation.y += dt * 0.4;
  });

  // ========================================================
  // 10. CỔNG CHÀO KHẢI HOÀN MÔN ĐẠI LỘ BẮC (GRAND ENTRANCE PORTAL)
  // Tọa lạc tại Cổng chính Đại lộ Bắc (x: 0, z: 25.5) nối Nông trại vào Quảng trường.
  // Mặt Bắc: Màn hình LED Quảng Cáo 4K đón 100% người vào thành phố (không bấm vào popup).
  // Mặt Nam: Bảng Vinh Danh Top Cư Dân & Đại Phú Hào Kaia hướng về đài phun nước.
  // Giải phóng 100% không gian mặt sàn quảng trường trung tâm và toàn bộ 4 cửa hàng!
  // ========================================================
  yield 'boot: plaza grand portal';
  const grandPortal = createPlazaGrandPortal(
    scene,
    plazaRoot,
    new Vector3(0, 0, 25.5),
    0, // yaw: 0 (Cổng chào Khải Hoàn Môn Đại Lộ Bắc: mặt Bắc đón người từ Nông Trại vào, mặt Nam hướng về đài phun nước)
    shadows
  );

  scene.onBeforeRenderObservable.add(() => {
    const t = performance.now();
    grandPortal?.animate?.(t);
  });

  // ========================================================
  // 11. HỆ THỐNG VÒNG SÁNG & HUY HIỆU TƯƠNG TÁC ĐÓN KHÁCH (ENTRANCE GROUND PORTALS)
  // ========================================================
  for (const [kind, venue] of Object.entries(VENUE_LAYOUT)) {
    if (venue?.entrance) {
      const cfg = SHOP_CONFIG[kind];
      createEntranceGroundPortal(scene, plazaRoot, kind, venue.entrance, cfg?.title || venue.label, cfg?.accent || '#f59e0b');
    }
  }

  return {
    root: plazaRoot,
    fountain: fountainRoot,
    leaderboard: grandPortal,
    billboard: grandPortal,
  };
}
