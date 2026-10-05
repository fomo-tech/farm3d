import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import '@babylonjs/core/Meshes/Builders/capsuleBuilder.js';
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
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex).scale(0.05);
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
  const ridge = MeshBuilder.CreateCapsule('roof-ridge-cap', { radius: 0.24, height: roofD + 0.3, tessellation: 12, subdivisions: 1 }, scene);
  ridge.rotation.x = Math.PI / 2;
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

  // === VẬT LIỆU KIẾN TRÚC NHÀ RƯỜNG & CHỢ QUÊ NÔNG THÔN VIỆT NAM ===
  const matLimDark = makeMat(scene, `${kind}-lim-dark`, '#3a2314', '#1f130b', 0.28, 48); // Gỗ lim sẫm bóng dầu
  matLimDark.alpha = 1;
  const matLimWarm = makeMat(scene, `${kind}-lim-warm`, '#68432b', '#3d2516', 0.20, 40); // Gỗ lim nâu đỏ ấm cúng
  matLimWarm.alpha = 1;
  const matStonePlinth = makeMat(scene, `${kind}-stone-plinth`, '#78716c', '#57534e', 0.15, 30); // Đá tảng xanh cổ truyền
  matStonePlinth.alpha = 1;
  const matBamboo = makeMat(scene, `${kind}-bamboo-rattan`, '#d4a373', '#b48356', 0.15, 24); // Tre nứa tự nhiên
  matBamboo.alpha = 1;
  const matTerracottaEaves = makeMat(scene, `${kind}-terracotta-eaves`, '#c2410c', '#9a3412', 0.25, 40); // Ngói mũi hài đất nung
  matTerracottaEaves.alpha = 1;
  const matTerracottaEavesAccent = makeMat(scene, `${kind}-terracotta-accent`, '#ea580c', '#c2410c', 0.28, 50); // Viền gờ ngói đất nung
  matTerracottaEavesAccent.alpha = 1;
  const matClayUrn = makeMat(scene, `${kind}-clay-urn`, '#7c2d12', '#451a03', 0.40, 60); // Gốm sành da lươn Bát Tràng
  matClayUrn.alpha = 1;
  const matLanternSilk = makeMat(scene, `${kind}-hoian-lantern-silk`, '#dc2626', '#b91c1c', 0.60, 60); // Lụa đỏ thắm Hội An
  matLanternSilk.emissiveColor = Color3.FromHexString('#7f1d1d');
  matLanternSilk.alpha = 1;
  const matGoldTrim = makeMat(scene, `${kind}-gold-trim`, '#f59e0b', '#d97706', 0.85, 90); // Dát vàng son
  matGoldTrim.alpha = 1;
  const matWarmPaperGlow = makeMat(scene, `${kind}-paper-glow`, '#fef3c7', '#fde68a', 0.25, 30); // Giấy dó / ánh sáng đèn lồng ấm
  matWarmPaperGlow.emissiveColor = Color3.FromHexString('#fbbf24').scale(0.18);
  matWarmPaperGlow.alpha = 1;
  const matJuteSack = makeMat(scene, `${kind}-jute-sack`, '#d6c7a1', '#a89874', 0.10, 16); // Bao đay / bao cói nông sản
  matJuteSack.alpha = 1;
  const matBrickFloor = makeMat(scene, `${kind}-brick-floor`, '#9a3412', '#7c2d12', 0.18, 30); // Gạch Bát Tràng đỏ gạch
  matBrickFloor.alpha = 1;

  // 1. TƯỜNG VÁCH GỖ LIM MỘC MẠC MẶT TIỀN (TRADITIONAL TIMBER PARTITION WALL)
  const panel = MeshBuilder.CreateBox(`${kind}-storefront-panel`, { width: 13.2, height: 6.3, depth: 0.10 }, scene);
  panel.position.set(0, 4.2, 6.14); // z=6.14 satisfies z - .05 > 6
  panel.material = matLimWarm;
  panel.parent = parent;
  panel.isPickable = false;

  // 2. 4 CỘT GỖ LIM TRÒN & CHÂN TẢNG ĐÁ XANH KÊ CỘT (4 SOLID LIM TEAK PILLARS ON CARVED STONE BASES)
  [-6.0, -2.0, 2.0, 6.0].forEach((colX, idx) => {
    // Chân tảng đá xanh kê cột
    const stoneBase = MeshBuilder.CreateCylinder(`${kind}-col-base-${idx}`, { diameter: 0.65, height: 0.40, tessellation: 8 }, scene);
    stoneBase.position.set(colX, 0.70, 6.38);
    stoneBase.material = matStonePlinth;
    stoneBase.parent = parent;

    // Thân cột gỗ lim tròn vững chãi
    const pillar = MeshBuilder.CreateCylinder(`${kind}-col-pillar-${idx}`, { diameter: 0.38, height: 5.6, tessellation: 16 }, scene);
    pillar.position.set(colX, 3.65, 6.38);
    pillar.material = matLimDark;
    pillar.parent = parent;

    // Đầu cột chạm đấu củng gỗ đỡ quá giang
    const capital = MeshBuilder.CreateBox(`${kind}-col-capital-${idx}`, { width: 0.55, height: 0.22, depth: 0.55 }, scene);
    capital.position.set(colX, 6.52, 6.38);
    capital.material = matLimDark;
    capital.parent = parent;
  });

  // Xà hiên (quá giang) gỗ lim chạy suốt mặt tiền nối các đầu cột
  const verandaBeam = MeshBuilder.CreateBox(`${kind}-veranda-beam`, { width: 13.6, height: 0.28, depth: 0.32 }, scene);
  verandaBeam.position.set(0, 6.42, 6.38);
  verandaBeam.material = matLimDark;
  verandaBeam.parent = parent;

  // 3. MÁI HIÊN NGÓI MŨI HÀI ĐẤT NUNG VƯƠN RỘNG CHE HIÊN (TERRACOTTA TILED EAVES VERANDA)
  const canopy = new TransformNode(`${kind}-striped-canopy`, scene);
  canopy.position.set(0, 6.62, 6.42);
  canopy.rotation.x = 0.22; // góc nghiêng dốc nhẹ thoát nước mưa
  canopy.parent = parent;
  const canopyWidth = style?.facade?.awningWidth || 13.6;
  const eaveDepth = style?.facade?.awningDepth || 2.1;

  for (let index = 0; index < 8; index++) {
    // 8 dải ngói lợp máng đất nung âm dương / mũi hài
    const stripe = MeshBuilder.CreateBox(`${kind}-canopy-stripe-${index}`, {
      width: canopyWidth / 8 - 0.015,
      height: 0.16,
      depth: eaveDepth,
    }, scene);
    stripe.position.x = -canopyWidth / 2 + (canopyWidth / 8) * (index + 0.5);
    stripe.position.z = eaveDepth / 2;
    stripe.parent = canopy;
    stripe.material = (index % 2 === 0) ? matTerracottaEaves : matTerracottaEavesAccent;

    // Diềm ngói giọt sương ngọc trích thủy hình hoa cúc
    const hem = MeshBuilder.CreateSphere(`${kind}-canopy-hem-${index}`, {
      diameterX: canopyWidth / 8 - 0.025,
      diameterY: 0.32,
      diameterZ: 0.20,
      segments: 8,
    }, scene);
    hem.position.set(stripe.position.x, -0.06, eaveDepth);
    hem.parent = canopy;
    hem.material = stripe.material;
  }

  // 2 Kèo gỗ lim chạm vân mây đỡ hai đầu mái hiên
  [-6.0, 6.0].forEach((bx, idx) => {
    const bracket = MeshBuilder.CreateCylinder(`${kind}-canopy-bracket-${idx}`, { diameter: 0.12, height: 2.1, tessellation: 10 }, scene);
    bracket.position.set(bx, 5.85, 6.95);
    bracket.rotation.x = 0.65;
    bracket.material = matLimDark;
    bracket.parent = parent;
  });

  // Áp vật liệu tường màu vôi truyền thống cho khối thân nhà
  if (style) {
    const wall = makeMat(scene, `${kind}-shop-plaster`, style.wall, null, 0.08, 36);
    wall.alpha = 1;
    for (const mesh of parent.getChildMeshes()) {
      if (mesh.name === `${kind}-body` || mesh.name === 'mart-body' || mesh.name === 'vehicle-body' || mesh.name === 'motor-body') {
        mesh.material = wall;
      }
    }
    parent.metadata = { ...(parent.metadata || {}), shopStyle: kind };
  }

  // 4. MÀNH TRE TRÚC CUỘN LƯNG CHỪNG ĐÓN GIÓ HIÊN (ROLLED BAMBOO BLINDS)
  [-4.0, 4.0].forEach((blindX, bIdx) => {
    const blind = MeshBuilder.CreateBox(`${kind}-bamboo-blind-${bIdx}`, { width: 3.4, height: 1.8, depth: 0.04 }, scene);
    blind.position.set(blindX, 5.35, 6.30);
    blind.material = matBamboo;
    blind.parent = parent;

    const roll = MeshBuilder.CreateCylinder(`${kind}-bamboo-roll-${bIdx}`, { diameter: 0.22, height: 3.44, tessellation: 12 }, scene);
    roll.rotation.z = Math.PI / 2;
    roll.position.set(blindX, 4.45, 6.31);
    roll.material = matBamboo;
    roll.parent = parent;

    // Dây thừng thắt cuộn mành
    [-0.9, 0.9].forEach((cordX, cIdx) => {
      const cord = MeshBuilder.CreateBox(`${kind}-blind-cord-${bIdx}-${cIdx}`, { width: 0.05, height: 1.95, depth: 0.06 }, scene);
      cord.position.set(blindX + cordX, 5.35, 6.32);
      cord.material = matLimDark;
      cord.parent = parent;
    });
  });

  // 5. CỬA BỨC BÀN 4 CÁNH CỔ TRUYỀN VIỆT NAM (TRADITIONAL 4-PANEL WOODEN FOLDING DOORS)
  // Cánh cửa trung tâm giữ metadata để tương tác
  const door = MeshBuilder.CreateBox(`${kind}-storefront-door`, { width: 3.6, height: 4.5, depth: 0.10 }, scene);
  door.position.set(0, 3.04, 6.26);
  door.material = matLimDark;
  door.parent = parent;
  door.metadata = SHOP_CONFIG[kind] ? { venue: kind } : null;

  // Nẹp dọc chia 4 cánh cửa bức bàn
  [-0.9, 0, 0.9].forEach((sx, sIdx) => {
    const doorSeam = MeshBuilder.CreateBox(`${kind}-door-seam-${sIdx}`, { width: 0.07, height: 4.5, depth: 0.14 }, scene);
    doorSeam.position.set(sx, 3.04, 6.27);
    doorSeam.material = matLimWarm;
    doorSeam.parent = parent;
  });

  // Cấu trúc "Thượng song - Hạ bản" trên từng cánh
  [-1.35, -0.45, 0.45, 1.35].forEach((panelX, pIdx) => {
    // Khung thượng song lồng ánh sáng ấm
    const upperBackdrop = MeshBuilder.CreateBox(`${kind}-door-upper-glow-${pIdx}`, { width: 0.76, height: 2.1, depth: 0.12 }, scene);
    upperBackdrop.position.set(panelX, 3.88, 6.28);
    upperBackdrop.material = matWarmPaperGlow;
    upperBackdrop.parent = parent;

    // Hàng chấn song con tiện gỗ đứng
    [-0.24, 0, 0.24].forEach((slatX, sIdx) => {
      const slat = MeshBuilder.CreateCylinder(`${kind}-door-slat-${pIdx}-${sIdx}`, { diameter: 0.05, height: 2.05, tessellation: 8 }, scene);
      slat.position.set(panelX + slatX, 3.88, 6.30);
      slat.material = matLimWarm;
      slat.parent = parent;
    });

    // Pa-nô gỗ lim nửa dưới (Hạ bản)
    const lowerPanel = MeshBuilder.CreateBox(`${kind}-door-lower-panel-${pIdx}`, { width: 0.78, height: 1.45, depth: 0.14 }, scene);
    lowerPanel.position.set(panelX, 1.62, 6.28);
    lowerPanel.material = matLimDark;
    lowerPanel.parent = parent;

    const innerTrim = MeshBuilder.CreateBox(`${kind}-door-lower-trim-${pIdx}`, { width: 0.62, height: 1.25, depth: 0.16 }, scene);
    innerTrim.position.set(panelX, 1.62, 6.29);
    innerTrim.material = matLimWarm;
    innerTrim.parent = parent;
  });

  // Then cài cửa gỗ mun ngang cổ truyền
  const bolt = MeshBuilder.CreateBox(`${kind}-door-wooden-bolt`, { width: 1.8, height: 0.14, depth: 0.18 }, scene);
  bolt.position.set(0, 2.65, 6.35);
  bolt.material = matLimDark;
  bolt.parent = parent;

  // Núm then cài / tay nắm vòng đồng
  const handle = MeshBuilder.CreateSphere(`${kind}-storefront-handle`, { diameter: 0.10, segments: 8 }, scene);
  handle.position.set(0.32, 2.65, 6.36);
  handle.material = matGoldTrim;
  handle.parent = parent;

  // Khuôn cửa gỗ lim bao quanh
  const archTop = MeshBuilder.CreateCapsule(`${kind}-portal-arch-top`, { height: 4.1, radius: 0.20, tessellation: 12, subdivisions: 1 }, scene);
  archTop.rotation.z = Math.PI / 2;
  archTop.scaling.z = 0.65;
  archTop.position.set(0, 5.45, 6.32);
  archTop.material = matLimDark;
  archTop.parent = parent;

  [-1.95, 1.95].forEach((jx, idx) => {
    const jamb = MeshBuilder.CreateCapsule(`${kind}-portal-jamb-${idx}`, { height: 4.9, radius: 0.18, tessellation: 12, subdivisions: 1 }, scene);
    jamb.scaling.z = 0.7;
    jamb.position.set(jx, 2.88, 6.32);
    jamb.material = matLimDark;
    jamb.parent = parent;
  });

  // 6. GIAN HÀNG SẠP GỖ & CHÕNG TRE TRƯNG BÀY SẢN VẬT NÔNG THÔN (THEMATIC AGRARIAN DISPLAYS)
  for (const side of [-1, 1]) {
    const bench = MeshBuilder.CreateBox(`${kind}-display-bench-${side}`, { width: 3.4, height: 0.60, depth: 0.90 }, scene);
    bench.position.set(side * 4.0, 1.15, 6.45);
    bench.material = matBamboo;
    bench.parent = parent;

    [-1.5, 1.5].forEach((bx, bIdx) => {
      const leg = MeshBuilder.CreateCylinder(`${kind}-bench-leg-${side}-${bIdx}`, { diameter: 0.12, height: 0.85, tessellation: 8 }, scene);
      leg.position.set(side * 4.0 + bx, 0.72, 6.45);
      leg.material = matLimDark;
      leg.parent = parent;
    });

    if (kind === 'supplies' || kind === 'shop-test') {
      // Nông Trang Vật Tư: Thúng thóc giống vàng & bao cói nông sản
      const basket = MeshBuilder.CreateCylinder(`${kind}-seed-basket-${side}`, { diameterTop: 0.85, diameterBottom: 0.60, height: 0.40, tessellation: 16 }, scene);
      basket.position.set(side * 4.0 - side * 0.7, 1.65, 6.45);
      basket.material = matBamboo;
      basket.parent = parent;

      const grains = MeshBuilder.CreateCylinder(`${kind}-seed-grains-${side}`, { diameter: 0.78, height: 0.10, tessellation: 16 }, scene);
      grains.position.set(side * 4.0 - side * 0.7, 1.82, 6.45);
      grains.material = matGoldTrim;
      grains.parent = parent;

      const sack = MeshBuilder.CreateBox(`${kind}-grain-sack-${side}`, { width: 0.75, height: 0.95, depth: 0.65 }, scene);
      sack.position.set(side * 4.0 + side * 0.7, 1.85, 6.45);
      sack.material = matJuteSack;
      sack.parent = parent;
    } else if (kind === 'fishing') {
      // Tiệm Đồ Câu Lão Ngư: Nơm bắt cá đan tre & giỏ cá nan tre
      const trap = MeshBuilder.CreateCylinder(`${kind}-fish-trap-${side}`, { diameterTop: 0.20, diameterBottom: 0.85, height: 0.90, tessellation: 12 }, scene);
      trap.position.set(side * 4.0 - side * 0.6, 1.90, 6.45);
      trap.material = matBamboo;
      trap.parent = parent;

      const creel = MeshBuilder.CreateSphere(`${kind}-fish-creel-${side}`, { diameterX: 0.70, diameterY: 0.55, diameterZ: 0.70, segments: 8 }, scene);
      creel.position.set(side * 4.0 + side * 0.7, 1.70, 6.45);
      creel.material = matLimWarm;
      creel.parent = parent;

      const rod = MeshBuilder.CreateCylinder(`${kind}-bamboo-rod-${side}`, { diameterTop: 0.03, diameterBottom: 0.08, height: 3.2, tessellation: 8 }, scene);
      rod.position.set(side * 4.0 + side * 1.3, 2.70, 6.40);
      rod.rotation.z = side * 0.18;
      rod.material = matBamboo;
      rod.parent = parent;
    } else if (kind === 'fashion') {
      // Tiệm May Tơ Lụa: Cuộn lụa tơ tằm ngũ sắc & nón lá
      const silkRoll1 = MeshBuilder.CreateCylinder(`${kind}-silk-roll-1-${side}`, { diameter: 0.35, height: 1.1, tessellation: 12 }, scene);
      silkRoll1.rotation.z = Math.PI / 2;
      silkRoll1.position.set(side * 4.0 - side * 0.5, 1.62, 6.45);
      silkRoll1.material = matLanternSilk;
      silkRoll1.parent = parent;

      const silkRoll2 = MeshBuilder.CreateCylinder(`${kind}-silk-roll-2-${side}`, { diameter: 0.32, height: 1.1, tessellation: 12 }, scene);
      silkRoll2.rotation.z = Math.PI / 2;
      silkRoll2.position.set(side * 4.0 - side * 0.5, 1.92, 6.45);
      silkRoll2.material = matGoldTrim;
      silkRoll2.parent = parent;

      const hat = MeshBuilder.CreateCylinder(`${kind}-conical-hat-${side}`, { diameterTop: 0.02, diameterBottom: 0.90, height: 0.38, tessellation: 16 }, scene);
      hat.position.set(side * 4.0 + side * 0.7, 1.65, 6.45);
      hat.rotation.x = 0.25;
      hat.material = matBamboo;
      hat.parent = parent;
    } else if (kind === 'vehicles') {
      // Trạm Cơ Giới: Bánh xe bò gỗ nan hoa & can dầu máy
      const wheel = MeshBuilder.CreateTorus(`${kind}-cart-wheel-${side}`, { diameter: 1.25, thickness: 0.16, tessellation: 20 }, scene);
      wheel.position.set(side * 4.0 - side * 0.4, 2.05, 6.45);
      wheel.rotation.y = Math.PI / 2;
      wheel.material = matLimDark;
      wheel.parent = parent;

      const oilCan = MeshBuilder.CreateCylinder(`${kind}-oil-can-${side}`, { diameter: 0.45, height: 0.75, tessellation: 10 }, scene);
      oilCan.position.set(side * 4.0 + side * 0.8, 1.82, 6.45);
      oilCan.material = matStonePlinth;
      oilCan.parent = parent;
    } else if (kind === 'casino') {
      // Hội Quán Dân Gian: Bàn cờ tướng gỗ & ấm chén trà đất nung
      const board = MeshBuilder.CreateBox(`${kind}-chess-board-${side}`, { width: 0.85, height: 0.08, depth: 0.85 }, scene);
      board.position.set(side * 4.0 - side * 0.5, 1.50, 6.45);
      board.material = matLimDark;
      board.parent = parent;

      const teapot = MeshBuilder.CreateSphere(`${kind}-tea-pot-${side}`, { diameter: 0.32, segments: 8 }, scene);
      teapot.position.set(side * 4.0 + side * 0.6, 1.62, 6.45);
      teapot.material = matClayUrn;
      teapot.parent = parent;
    }
  }

  // 7. CHUM SÀNH ĐẤT NUNG NƯỚC MƯA & GÁO DỪA ĐÓN KHÁCH (TRADITIONAL WATER URN & COCONUT LADLE)
  const urn = MeshBuilder.CreateSphere(`${kind}-water-urn`, { diameterX: 0.80, diameterY: 0.95, diameterZ: 0.80, segments: 12 }, scene);
  urn.position.set(-6.1, 0.78, 7.15);
  urn.material = matClayUrn;
  urn.parent = parent;

  const urnRim = MeshBuilder.CreateTorus(`${kind}-urn-rim`, { diameter: 0.52, thickness: 0.08, tessellation: 16 }, scene);
  urnRim.position.set(-6.1, 1.25, 7.15);
  urnRim.material = matClayUrn;
  urnRim.parent = parent;

  const ladle = MeshBuilder.CreateCylinder(`${kind}-urn-ladle`, { diameter: 0.04, height: 0.75 }, scene);
  ladle.position.set(-6.15, 1.45, 7.15);
  ladle.rotation.z = 0.55;
  ladle.material = matBamboo;
  ladle.parent = parent;

  // Đôi đèn lồng Hội An hình quả trám lụa đỏ thắm treo dưới rui mái
  [-2.2, 2.2].forEach((lx, idx) => {
    const lanternCord = MeshBuilder.CreateCylinder(`${kind}-lantern-cord-${idx}`, { diameter: 0.03, height: 0.65 }, scene);
    lanternCord.position.set(lx, 6.05, 6.85);
    lanternCord.material = matLimDark;
    lanternCord.parent = parent;

    const lantern = MeshBuilder.CreateSphere(`${kind}-hoian-lantern-${idx}`, { diameterX: 0.45, diameterY: 0.62, diameterZ: 0.45, segments: 12 }, scene);
    lantern.position.set(lx, 5.50, 6.85);
    lantern.material = matLanternSilk;
    lantern.parent = parent;

    const tassel = MeshBuilder.CreateCylinder(`${kind}-lantern-tassel-${idx}`, { diameterTop: 0.08, diameterBottom: 0.18, height: 0.35, tessellation: 8 }, scene);
    tassel.position.set(lx, 5.05, 6.85);
    tassel.material = matGoldTrim;
    tassel.parent = parent;
  });

  // 8. BẬC TAM CẤP GẠCH BÁT TRÀNG ĐỎ GẠCH MỘC MẠC (BAT TRANG BRICK ENTRANCE STEPS)
  const step1 = MeshBuilder.CreateBox(`${kind}-entrance-step-1`, { width: 5.2, height: 0.22, depth: 1.4 }, scene);
  step1.position.set(0, 0.11, 7.1);
  step1.material = matBrickFloor;
  step1.parent = parent;
  step1.receiveShadows = true;

  const step2 = MeshBuilder.CreateBox(`${kind}-entrance-step-2`, { width: 4.8, height: 0.22, depth: 1.2 }, scene);
  step2.position.set(0, 0.33, 6.45);
  step2.material = matBrickFloor;
  step2.parent = parent;
  step2.receiveShadows = true;

  const threshold = MeshBuilder.CreateBox(`${kind}-storefront-threshold`, { width: 3.8, height: 0.08, depth: 0.9 }, scene);
  threshold.position.set(0, 0.52, 6.3);
  threshold.material = matLimDark;
  threshold.parent = parent;

  // 9. BẢNG HIỆU HOÀNH PHI GỖ KHẮC CHỮ VÀNG (VIETNAMESE CALLIGRAPHIC LACQUER SIGNBOARD)
  const signTitle = style?.title || (kind === 'shop-test' ? 'CỬA HÀNG MẪU' : 'CỬA HÀNG NÔNG TRẠI');
  const signSubtitle = style?.subtitle || 'HẠT GIỐNG · VẬT TƯ · CỬA HÀNG';
  const signIcon = style?.icon || '🌾';
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

  // 10. BIỂN HIỆU VẪY GỖ KHẮC CHỮ (PROJECTING WOODEN BLADE SIGN)
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
  discMat.emissiveColor = Color3.FromHexString(accentHex).scale(0.04);
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
    ctx.fillText('BƯỚC VÀO · NHẤN E', 512, 512, 820);

    dt.update();
    discMat.diffuseTexture = dt;
    discMat.emissiveTexture = dt;
  }
  disc.material = discMat;

  // 2. Huy hiệu lơ lửng 3D đón khách (Floating Interaction Badge)
  // Anchor to the actual facade, not the approximate entrance trigger.
  // Keep the whole label in front of the door hardware at every camera angle.
  const badgePlane = MeshBuilder.CreatePlane(`portal-badge-${kind}`, { width: 4.5, height: 0.95 }, scene);
  const exterior = VENUE_LAYOUT[kind]?.exterior;
  const facadeYaw = exterior?.yaw || 0;
  badgePlane.position.set(
    exterior ? exterior.x + Math.sin(facadeYaw) * 7.6 - entrance.x : 0,
    4.7,
    exterior ? exterior.z + Math.cos(facadeYaw) * 7.6 - entrance.z : 0,
  );
  // Babylon planes face local -Z. The facade faces +Z, so turn the plane
  // outward instead of showing its mirrored back face to arriving players.
  badgePlane.rotation.y = facadeYaw + Math.PI;
  badgePlane.parent = portalRoot;
  badgePlane.isPickable = true;
  badgePlane.metadata = { venue: kind };

  const badgeMat = new StandardMaterial(`portal-badge-mat-${kind}`, scene);
  badgeMat.alpha = 1;
  badgeMat.disableLighting = true;
  badgeMat.backFaceCulling = true;

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
    bctx.fillText('VÀO CỬA HÀNG · NHẤN E', 768, 160, 1420);

    bdt.update();
    badgeMat.emissiveTexture = bdt;
  } else {
    badgeMat.diffuseColor = Color3.FromHexString('#0f172a');
    badgeMat.emissiveColor = Color3.FromHexString(accentHex).scale(0.04);
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
    badgePlane.position.y = 4.7 + Math.sin(t + phase) * 0.025;
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
    lanternAmber: makeMat(scene, 'town-lantern-amber', '#e6d5a8', '#c8ab72', 0.12, 48),
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
  matPlaza.emissiveColor = Color3.Black();
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
    marbleWhite: makeMat(scene, 'fountain-marble-white', '#dddcd0', null, 0.12, 60),
    marbleGold: makeMat(scene, 'fountain-marble-gold', '#bba77e', null, 0.12, 64),
    crystalWater: makeMat(scene, 'fountain-crystal-water', '#75b6c4', null, 0.20, 64),
    dolphinGlass: makeMat(scene, 'fountain-dolphin-glass', '#8ec1c9', null, 0.20, 64),
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
  spray.minSize = 0.06;
  spray.maxSize = 0.18;
  spray.minLifeTime = 1.0;
  spray.maxLifeTime = 2.2;
  spray.emitRate = 18;
  spray.gravity = new Vector3(0, -9.81, 0);
  spray.direction1 = new Vector3(-2.2, 5.5, -2.2);
  spray.direction2 = new Vector3(2.2, 6.2, 2.2);
  spray.start();
  yield 'boot: plaza gardens';

  // ========================================================
  // 3. LÁT CẮT MẪU: ĐIỂM XUẤT PHÁT (0, 18) ➔ ĐÀI PHUN NƯỚC (0, 0)
  // Hành lang mở rộng hoàn toàn thông thoáng, hai bên lề có chậu hoa & đèn vàng ấm
  // ========================================================
  // Hành lang mở rộng hoàn toàn thông suốt từ Spawn Point (0, 18) tới Đài Phun Nước (0, 0)
  // Giữ lại 2 cột đèn lồng ấm hai bên lề để tạo điểm nhấn chào đón sang trọng
  [-5.8, 5.8].forEach((lx, lidx) => {
    const lampPost = MeshBuilder.CreateCylinder(`spawn-lamp-post-${lidx}`, { height: 3.8, diameter: 0.16, tessellation: 10 }, scene);
    lampPost.position.set(lx, 1.9, 12);
    lampPost.material = matsCozy.timber;
    lampPost.parent = plazaRoot;
    shadows?.addShadowCaster(lampPost);

    createWarmHangingLantern(scene, new Vector3(lx + (lx > 0 ? -0.4 : 0.4), 3.5, 12), plazaRoot, shadows);
  });

  // Giữ trục nhìn từ spawn tới đài phun nước sạch; kiosk bản đồ ở rìa phố
  // đảm nhiệm chỉ đường, không cần hai bảng hiệu lớn sát mặt nhân vật.

  // ========================================================
  // 4. MEGA VENUE 1: TIỆM THỜI TRANG & SALON (FASHION MALL)
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

  // Đèn lồng ấm treo hiên sảnh thời trang sang trọng, thông thoáng mặt tiền
  [-4.2, 4.2].forEach((px) => {
    createWarmHangingLantern(scene, new Vector3(px, 3.8, 6.8), fashionRoot, shadows);
  });

  // Biểu tượng Hoa Sen & Nơ Lụa Vàng trên đỉnh hồi mái (Vietnamese Lotus & Silk Ribbon Crest)
  const bowNode = new TransformNode('fashion-pediment-bow', scene);
  bowNode.position.set(0, 10.8, 6.18);
  bowNode.parent = fashionRoot;
  const matGoldTrim = makeMat(scene, 'fashion-pediment-gold', '#fbbf24', '#f59e0b', 0.8, 120);
  const bowCenter = MeshBuilder.CreateSphere('fashion-bow-knot', { diameter: 0.65, segments: 10 }, scene);
  bowCenter.material = matGoldTrim;
  bowCenter.parent = bowNode;
  [-0.65, 0.65].forEach((bx, idx) => {
    const loop = MeshBuilder.CreateTorus(`fashion-bow-loop-${idx}`, { diameter: 0.95, thickness: 0.22, tessellation: 20 }, scene);
    loop.position.set(bx, 0, 0);
    loop.rotation.y = Math.PI / 2;
    loop.rotation.z = idx === 0 ? 0.3 : -0.3;
    loop.material = matGoldTrim;
    loop.parent = bowNode;
  });
  // 3 Cánh hoa sen vàng tỏa ngát
  [0, 0.45, -0.45].forEach((rotZ, idx) => {
    const petal = MeshBuilder.CreateSphere(`fashion-lotus-petal-${idx}`, { diameterX: 0.32, diameterY: 0.85, diameterZ: 0.12, segments: 8 }, scene);
    petal.position.set(0, 0.52, 0);
    petal.rotation.z = rotZ;
    petal.material = matGoldTrim;
    petal.parent = bowNode;
  });

  // ========================================================
  // 5. MEGA VENUE 2: HỘI QUÁN TRÒ CHƠI & CASINO (ARCADE LOUNGE)
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

  const matLimDice = makeMat(scene, 'casino-dice-wood', '#451a03', '#270e02', 0.4, 40);
  matLimDice.alpha = 1;
  const giantDice = MeshBuilder.CreateBox('giant-dice-cube', { size: 2.4 }, scene);
  giantDice.material = matLimDice;
  giantDice.parent = diceRoot;
  shadows?.addShadowCaster(giantDice);

  // Đồng xu cổ Cảnh Hưng / Khang Hy tròn có lỗ vuông ở giữa
  const goldCoin = MeshBuilder.CreateCylinder('casino-giant-coin', { diameter: 2.2, height: 0.3, tessellation: 32 }, scene);
  goldCoin.rotation.z = Math.PI / 2;
  goldCoin.position.set(2.4, 0, 0);
  const matCoinGold = makeMat(scene, 'casino-gold-coin', '#fbbf24', '#f59e0b', 0.8, 120);
  matCoinGold.alpha = 1;
  goldCoin.material = matCoinGold;
  goldCoin.parent = diceRoot;

  // Lỗ vuông đen giữa đồng tiền cổ
  const coinHole = MeshBuilder.CreateBox('casino-coin-hole', { width: 0.32, height: 0.65, depth: 0.65 }, scene);
  coinHole.position.set(2.4, 0, 0);
  const matHole = makeMat(scene, 'casino-coin-hole-mat', '#1c1917', '#0c0a09', 0.1, 10);
  matHole.alpha = 1;
  coinHole.material = matHole;
  coinHole.parent = diceRoot;

  // Bảng hiệu mặt tiền & biểu tượng xúc xắc đã được bố trí ở mặt trước và đỉnh hồi mái

  // ========================================================
  // 6. MEGA VENUE 3: NÔNG TRANG VẬT TƯ & SIÊU THỊ NÔNG NGHIỆP (AGRI-MART)
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


  // Biểu tượng Bó Lúa Vàng Nặng Hạt Thần Nông trên đỉnh hồi mái
  const sproutNode = new TransformNode('supplies-pediment-sprout', scene);
  sproutNode.position.set(0, 10.8, 6.18);
  sproutNode.parent = martRoot;
  const matSproutGold = makeMat(scene, 'supplies-pediment-gold', '#f59e0b', '#d97706', 0.8, 110);
  matSproutGold.alpha = 1;
  const stalk = MeshBuilder.CreateCylinder('supplies-sprout-stalk', { diameter: 0.18, height: 1.3 }, scene);
  stalk.position.set(0, 0, 0);
  stalk.material = matSproutGold;
  stalk.parent = sproutNode;
  [-0.45, 0.45].forEach((lx, idx) => {
    const leaf = MeshBuilder.CreateSphere(`supplies-sprout-leaf-${idx}`, { diameterX: 0.85, diameterY: 0.38, diameterZ: 0.18 }, scene);
    leaf.position.set(lx, 0.38, 0);
    leaf.rotation.z = idx === 0 ? 0.5 : -0.5;
    leaf.material = matSproutGold;
    leaf.parent = sproutNode;
  });
  // Hạt thóc vàng nặng trĩu trên đỉnh
  const riceEar = MeshBuilder.CreateSphere('supplies-rice-ear', { diameterX: 0.55, diameterY: 0.85, diameterZ: 0.25, segments: 8 }, scene);
  riceEar.position.set(0, 0.85, 0);
  riceEar.material = matSproutGold;
  riceEar.parent = sproutNode;

  // ========================================================
  // 7. MEGA VENUE 4: TRẠM XE CỘ & XE ĐẠP (MOTOR SHOWROOM)
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


  // Biểu tượng Bánh Răng Cơ Giới Nông Nghiệp trên đỉnh hồi mái
  const motorEmblemNode = new TransformNode('vehicle-pediment-emblem', scene);
  motorEmblemNode.position.set(0, 10.8, 6.18);
  motorEmblemNode.parent = vehicleRoot;
  const matWing = makeMat(scene, 'vehicle-pediment-wing', '#0284c7', '#0369a1', 0.8, 120);
  matWing.alpha = 1;
  const matBrassGear = makeMat(scene, 'vehicle-pediment-gear', '#f59e0b', '#d97706', 0.85, 90);
  matBrassGear.alpha = 1;
  const centerDisc = MeshBuilder.CreateCylinder('vehicle-emblem-center', { diameter: 0.9, height: 0.18, tessellation: 16 }, scene);
  centerDisc.rotation.x = Math.PI / 2;
  centerDisc.material = matBrassGear;
  centerDisc.parent = motorEmblemNode;
  [-0.9, 0.9].forEach((wx, idx) => {
    const wing = MeshBuilder.CreateBox(`vehicle-wing-${idx}`, { width: 1.1, height: 0.35, depth: 0.08 }, scene);
    wing.position.set(wx, 0.15, 0);
    wing.rotation.z = idx === 0 ? -0.25 : 0.25;
    wing.material = matWing;
    wing.parent = motorEmblemNode;
  });

  // ========================================================
  // 8. MEGA VENUE 5: BẾN CÂU CÁ HỒ PHA LÊ & ĐỒ CÂU (FISHING TACKLE WHARF)
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
  // 9. HỆ THỐNG ĐÈN ĐƯỜNG CỔ ĐIỂN VÀNG ẤM QUẢNG TRƯỜNG (HERITAGE CAST-IRON POSTS)
  // Bố trí đối xứng quanh chu vi quảng trường (North, South, East, West)
  // ========================================================
  const matStreetLamp = makeMat(scene, 'pt-street-lamp-iron', '#1e293b', null, 0.75, 120);
  const matStreetBrass = makeMat(scene, 'pt-street-lamp-brass', '#f59e0b', '#d97706', 0.85, 120);
  const matStreetGlow = matsCozy.lanternAmber;

  [
    { x: -15, z: 24 },  // Lối vào cổng Khải Hoàn Môn phía Tây
    { x: 15, z: 24 },   // Lối vào cổng Khải Hoàn Môn phía Đông
    { x: -28, z: 0 },   // Cánh Tây quảng trường
    { x: 28, z: 0 },    // Cánh Đông quảng trường
    { x: -15, z: -24 }, // Lối Nam Tây (gần Casino)
    { x: 15, z: -24 },  // Lối Nam Đông (gần Fashion)
    { x: 0, z: -35 },   // Cổng Nam hướng ra đại lộ
  ].forEach((pos, idx) => {
    // Đế cột đèn phong cách Châu Âu
    const base = MeshBuilder.CreateCylinder(`pt-lamp-base-${idx}`, { height: 0.6, diameterTop: 0.45, diameterBottom: 0.65, tessellation: 16 }, scene);
    base.position.set(pos.x, 0.3, pos.z);
    base.material = matStreetLamp;
    base.parent = plazaRoot;

    // Vòng chỉ đồng chân cột
    const baseCollar = MeshBuilder.CreateTorus(`pt-lamp-collar-b-${idx}`, { diameter: 0.48, thickness: 0.06, tessellation: 16 }, scene);
    baseCollar.position.set(pos.x, 0.58, pos.z);
    baseCollar.material = matStreetBrass;
    baseCollar.parent = plazaRoot;

    // Thân cột thon cao
    const post = MeshBuilder.CreateCylinder(`pt-lamp-post-${idx}`, { height: 5.2, diameterTop: 0.16, diameterBottom: 0.24, tessellation: 16 }, scene);
    post.position.set(pos.x, 3.1, pos.z);
    post.material = matStreetLamp;
    post.parent = plazaRoot;
    shadows?.addShadowCaster(post);

    // Vòng chỉ đồng đỉnh cột
    const topCollar = MeshBuilder.CreateTorus(`pt-lamp-collar-t-${idx}`, { diameter: 0.26, thickness: 0.05, tessellation: 16 }, scene);
    topCollar.position.set(pos.x, 5.2, pos.z);
    topCollar.material = matStreetBrass;
    topCollar.parent = plazaRoot;

    // 2 tay đèn uốn lượn cổ điển hai bên
    [-1, 1].forEach((side, sidx) => {
      const arm = MeshBuilder.CreateBox(`pt-lamp-arm-${idx}-${sidx}`, { width: 0.9, height: 0.12, depth: 0.12 }, scene);
      arm.position.set(pos.x + side * 0.45, 5.4, pos.z);
      arm.material = matStreetLamp;
      arm.parent = plazaRoot;

      const lanternCap = MeshBuilder.CreateCylinder(`pt-lamp-cap-${idx}-${sidx}`, { diameterTop: 0.1, diameterBottom: 0.7, height: 0.25, tessellation: 16 }, scene);
      lanternCap.position.set(pos.x + side * 0.9, 5.5, pos.z);
      lanternCap.material = matStreetLamp;
      lanternCap.parent = plazaRoot;

      const lightBulb = MeshBuilder.CreateSphere(`pt-lamp-bulb-${idx}-${sidx}`, { diameter: 0.58, segments: 10 }, scene);
      lightBulb.position.set(pos.x + side * 0.9, 5.2, pos.z);
      lightBulb.material = matStreetGlow;
      lightBulb.parent = plazaRoot;

      // Quầng sáng sương mờ dịu mắt cho bóng đèn quảng trường
      createLampHaloOnly(scene, plazaRoot, new Vector3(pos.x + side * 0.9, 5.2, pos.z), 1.1);
    });

    // Vệt sáng ấm loang trên mặt đá quảng trường dưới chân mỗi cột đèn
    createGroundLightPoolOnly(scene, plazaRoot, new Vector3(pos.x, 0.126, pos.z), 4.2);
  });

  // Hoạt hình xoay xúc xắc casino trên đỉnh mái
  scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    if (diceRoot) diceRoot.rotation.y += dt * 0.5;
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
