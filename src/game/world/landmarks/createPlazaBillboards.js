import { drawWealthLeaderboard } from './drawWealthLeaderboard.js';
import { drawSponsorBanner } from './drawSponsorBanner.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import {
  WORLD_PALETTE,
  createCozyMaterial,
  createWarmHangingLantern,
  createGroundLightPoolOnly,
} from '../worldDesignSystem.js';

function makeMat(scene, name, hex, emissiveHex = null, specular = 0.2, specularPower = 32) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.5);
  m.specularColor = new Color3(specular, specular, specular);
  m.specularPower = specularPower;
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex).scale(0.08);
  return m;
}

/**
 * Helper vẽ hình chữ nhật bo tròn góc an toàn tuyệt đối trên mọi trình duyệt
 */
function drawSafeRoundRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * CẤU HÌNH THÔNG TIN NÔNG TRẠI VIỆT NAM (BẢNG TIN HỢP TÁC XÃ LÀNG)
 */
export const PLAZA_BILLBOARD_SPONSOR = {
  brandName: 'Bagbily',
  mainHeadline: 'Mua sắm shopee qua Bagbily để hỗ trợ phát triển game',
  logoPath: '/assets/brands/bagbily-logo.png',
  destinationUrl: 'https://bagbily.com/hoantien-shopee',
};

// =============================================================================
// CỔNG LÀNG NÔNG THÔN & BẢNG TIN HỢP TÁC XÃ VIỆT NAM
// Kiến trúc truyền thống:
// - Bệ đá ong tự nhiên, rường cột gỗ lim cổ thụ trầm ấm có đai đồng cổ bọc gia cố.
// - Mái ngói đỏ đất nung âm dương truyền thống uốn cong nhẹ cổ kính che mưa nắng.
// - Treo đèn lồng đỏ Hội An ấm áp, chum gốm sành cúc vạn thọ dưới chân cột.
// - Hoành phi sơn son thếp vàng chạm nổi Bông Lúa Vàng / Hoa Sen Đất Việt.
// =============================================================================
export function createPlazaGrandPortal(scene, parent, position = { x: 0, y: 0, z: 25.5 }, yaw = 0, shadows = null, adConfig = PLAZA_BILLBOARD_SPONSOR) {
  const root = new TransformNode('plaza-grand-entrance-portal', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.rotation.y = yaw;
  if (parent) root.parent = parent;

  // Bảng vật liệu kiến trúc nông thôn Việt Nam cao cấp
  const matLimTeak = makeMat(scene, 'portal-lim-teak', '#3e2115', '#241209', 0.15, 24); // Gỗ lim sẫm màu
  const matWarmWood = makeMat(scene, 'portal-warm-wood', '#78350f', '#522306', 0.18, 28); // Gỗ mít / sồi già
  const matRoofTiles = makeMat(scene, 'portal-roof-tiles', '#b91c1c', '#7f1d1d', 0.12, 20); // Ngói đỏ đất nung
  const matStonePlinth = makeMat(scene, 'portal-stone-plinth', '#57534e', '#3c3836', 0.08, 16); // Bệ đá ong rêu phong
  const matBrass = makeMat(scene, 'portal-brass-trim', '#d97706', '#92400e', 0.65, 80); // Đồng cổ đúc
  const matLanternRed = makeMat(scene, 'portal-lantern-silk', '#dc2626', '#f59e0b', 0.35, 40); // Lụa đỏ Hội An

  // 1. Hai trụ cột gỗ lim cổ thụ đôi hai bên đại lộ (x = ±5.8m, thông thủy lòng đường 9.4m)
  [-5.8, 5.8].forEach((px, idx) => {
    // Chân bệ móng đá ong kiên cố (2.4m rộng × 3.2m sâu × 0.45m cao)
    const pedestalFound = MeshBuilder.CreateBox(`portal-ped-found-${idx}`, { width: 2.6, depth: 3.4, height: 0.45 }, scene);
    pedestalFound.position.set(px, 0.22, 0);
    pedestalFound.material = matStonePlinth;
    pedestalFound.parent = root;
    pedestalFound.receiveShadows = true;

    // Tảng đá xanh tròn chạm cánh sen kê chân cột gỗ
    [-0.75, 0.75].forEach((colZ, cidx) => {
      const plinthDisc = MeshBuilder.CreateCylinder(`portal-plinth-disc-${idx}-${cidx}`, {
        diameter: 1.5,
        height: 0.55,
        tessellation: 20,
      }, scene);
      plinthDisc.position.set(px, 0.65, colZ);
      plinthDisc.material = matStonePlinth;
      plinthDisc.parent = root;
      plinthDisc.receiveShadows = true;

      // Cột gỗ lim tròn cổ thụ vươn cao vững chãi
      const col = MeshBuilder.CreateCylinder(`portal-col-${idx}-${cidx}`, {
        diameterTop: 1.05,
        diameterBottom: 1.2,
        height: 5.6,
        tessellation: 20,
      }, scene);
      col.position.set(px, 3.7, colZ);
      col.material = matLimTeak;
      col.parent = root;
      shadows?.addShadowCaster(col);

      // Đai đồng cổ bọc gia cố thân cột
      [1.3, 3.8, 5.8].forEach((ry, ridx) => {
        const ring = MeshBuilder.CreateTorus(`portal-c-ring-${idx}-${cidx}-${ridx}`, {
          diameter: 1.25,
          thickness: 0.08,
          tessellation: 18,
        }, scene);
        ring.position.set(px, ry, colZ);
        ring.material = matBrass;
        ring.parent = root;
      });
    });

    // Bức giáp vách gỗ lim rường cột đệm giữa 2 trụ
    const colWall = MeshBuilder.CreateBox(`portal-col-wall-${idx}`, { width: 1.35, depth: 1.6, height: 5.2 }, scene);
    colWall.position.set(px, 3.7, 0);
    colWall.material = matWarmWood;
    colWall.parent = root;

    // Đèn lồng đỏ Hội An truyền thống treo bên cột
    const lanternRoot = new TransformNode(`portal-lantern-${idx}`, scene);
    lanternRoot.position.set(px + (px > 0 ? -1.35 : 1.35), 5.2, 0);
    lanternRoot.parent = root;

    const lanternBody = MeshBuilder.CreateSphere(`portal-lantern-body-${idx}`, { diameterX: 0.65, diameterY: 0.9, diameterZ: 0.65, segments: 12 }, scene);
    lanternBody.material = matLanternRed;
    lanternBody.parent = lanternRoot;

    const lanternCapTop = MeshBuilder.CreateCylinder(`portal-lantern-cap-t-${idx}`, { diameter: 0.45, height: 0.1, tessellation: 12 }, scene);
    lanternCapTop.position.y = 0.48;
    lanternCapTop.material = matBrass;
    lanternCapTop.parent = lanternRoot;

    const lanternCapBtm = MeshBuilder.CreateCylinder(`portal-lantern-cap-b-${idx}`, { diameter: 0.4, height: 0.1, tessellation: 12 }, scene);
    lanternCapBtm.position.y = -0.48;
    lanternCapBtm.material = matBrass;
    lanternCapBtm.parent = lanternRoot;

    // Chum sành Bát Tràng cúc vạn thọ trang trí chân cổng
    const clayJar = MeshBuilder.CreateCylinder(`portal-jar-${idx}`, {
      diameterTop: 0.8,
      diameterBottom: 0.5,
      height: 0.85,
      tessellation: 16,
    }, scene);
    clayJar.position.set(px + (px > 0 ? 1.4 : -1.4), 0.85, 1.2);
    clayJar.material = matWarmWood;
    clayJar.parent = root;

    const flowerCluster = MeshBuilder.CreateSphere(`portal-marigold-${idx}`, { diameter: 0.95, segments: 8 }, scene);
    flowerCluster.position.set(px + (px > 0 ? 1.4 : -1.4), 1.35, 1.2);
    flowerCluster.material = makeMat(scene, `portal-flower-${idx}`, '#f59e0b', '#d97706', 0.2, 20);
    flowerCluster.parent = root;

    // Vệt sáng ấm loang chân trụ
    createGroundLightPoolOnly(scene, root, new Vector3(px, 0.126, 0), 4.5);
  });

  // 2. Khối Xà Thượng Rường Cột Gỗ Lim bắc ngang đại lộ (Clearance y = 4.85m)
  const archUnderbeam = MeshBuilder.CreateBox('portal-arch-beam', { width: 14.2, height: 0.7, depth: 2.4 }, scene);
  archUnderbeam.position.set(0, 5.0, 0);
  archUnderbeam.material = matLimTeak;
  archUnderbeam.parent = root;

  // Hộp khung bao bảng thông tin bằng gỗ sồi dày dặn
  const archHousing = MeshBuilder.CreateBox('portal-arch-housing', { width: 13.2, height: 6.6, depth: 2.0 }, scene);
  archHousing.position.set(0, 8.4, 0);
  archHousing.material = matWarmWood;
  archHousing.parent = root;
  shadows?.addShadowCaster(archHousing);

  // Thanh xà gồ gỗ nẹp chỉ đồng cổ viền bảng
  const archGoldRim = MeshBuilder.CreateBox('portal-arch-gold-rim', { width: 13.4, height: 0.35, depth: 2.15 }, scene);
  archGoldRim.position.set(0, 11.75, 0);
  archGoldRim.material = matBrass;
  archGoldRim.parent = root;

  // ===========================================================================
  // 3. MẶT BẮC: BẢNG TIN NÔNG TRẠI & HỢP TÁC XÃ (NORTH FARMSTEAD NOTICE BOARD)
  // Hướng ra phía Bắc (+Z): 100% người từ nông trại bước vào thị trấn đều thấy ngay!
  // ===========================================================================
  const screenW = 11.2;
  const screenH = 5.8;
  const screenCenterY = 8.3;

  // Khung viền gỗ chạm chỉ đồng
  const adBorder = MeshBuilder.CreateBox('portal-ad-border', { width: screenW + 0.35, height: screenH + 0.35, depth: 0.15 }, scene);
  adBorder.position.set(0, screenCenterY, 1.05);
  adBorder.material = matLimTeak;
  adBorder.parent = root;

  const adPlane = MeshBuilder.CreatePlane('portal-ad-screen-plane', {
    width: screenW,
    height: screenH,
    sideOrientation: Mesh.FRONTSIDE,
  }, scene);
  adPlane.position.set(0, screenCenterY, 1.15);
  adPlane.rotation.y = Math.PI; // Quay mặt về phía Bắc (+Z)
  adPlane.parent = root;
  adPlane.metadata = { interactive: 'sponsor', label: adConfig.mainHeadline, destinationUrl: adConfig.destinationUrl };

  const adScreenMat = new StandardMaterial('portal-ad-mat', scene);
  adScreenMat.disableLighting = true;
  adScreenMat.diffuseColor = Color3.White();
  adScreenMat.emissiveColor = Color3.White();
  adScreenMat.specularColor = Color3.Black();

  if (typeof document !== 'undefined' || typeof OffscreenCanvas !== 'undefined') {
    const sdtAd = new DynamicTexture('portal-ad-texture', { width: 1024, height: 576 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
    sdtAd.anisotropicFilteringLevel = 4;
    sdtAd.hasAlpha = false;
    const ctx = sdtAd.getContext();
    const renderAd = logo => {
      if (root.isDisposed()) return;
      drawSponsorBanner(ctx, adConfig, logo);
      sdtAd.update();
    };
    renderAd(null);
    if (typeof Image !== 'undefined') {
      const logo = new Image();
      logo.onload = () => renderAd(logo);
      logo.src = adConfig.logoPath || PLAZA_BILLBOARD_SPONSOR.logoPath;
    }
    adScreenMat.diffuseTexture = sdtAd;
    adScreenMat.emissiveTexture = sdtAd;
  }
  adPlane.material = adScreenMat;

  // ===========================================================================
  // 4. MẶT NAM: BẢNG VÀNG DANH DỰ THẦN NÔNG (SOUTH LEADERBOARD SCREEN)
  // Hướng vào đài phun nước trung tâm: cư dân dạo phố đều nhìn thấy vinh danh!
  // ===========================================================================
  const ldBorder = MeshBuilder.CreateBox('portal-ld-border', { width: screenW + 0.35, height: screenH + 0.35, depth: 0.15 }, scene);
  ldBorder.position.set(0, screenCenterY, -1.05);
  ldBorder.material = matLimTeak;
  ldBorder.parent = root;

  const ldPlane = MeshBuilder.CreatePlane('portal-ld-screen-plane', {
    width: screenW,
    height: screenH,
    sideOrientation: Mesh.FRONTSIDE,
  }, scene);
  ldPlane.position.set(0, screenCenterY, -1.15);
  ldPlane.rotation.y = 0; // Quay mặt về phía Nam (-Z)
  ldPlane.parent = root;
  ldPlane.metadata = { interactive: 'leaderboard', label: 'Bảng Vàng Thần Nông' };

  const ldScreenMat = new StandardMaterial('portal-ld-mat', scene);
  ldScreenMat.disableLighting = true;
  ldScreenMat.diffuseColor = Color3.White();
  ldScreenMat.emissiveColor = Color3.White();
  ldScreenMat.specularColor = Color3.Black();

  let refreshLeaderboard = () => {};
  if (typeof document !== 'undefined' || typeof OffscreenCanvas !== 'undefined') {
    const sdtLd = new DynamicTexture('portal-ld-texture', { width: 1024, height: 576 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
    sdtLd.anisotropicFilteringLevel = 4;
    sdtLd.hasAlpha = false;
    const ctx = sdtLd.getContext();
    let previousRows;
    let dirty = true;
    const emptyRows = [];
    const portraits = new Map();
    let fallback = null;
    if (typeof Image !== 'undefined') {
      const image = new Image();
      image.onload = () => { fallback = image; dirty = true; };
      image.src = '/assets/hud/farmer-avatar.webp';
    }
    refreshLeaderboard = () => {
      const rows = scene.metadata?.portalLeaderboard || emptyRows;
      if (rows === previousRows && !dirty) return;
      previousRows = rows;
      dirty = false;
      const top = [...rows].sort((a, b) =>
        (Number(b.progress?.coins) || 0) - (Number(a.progress?.coins) || 0)
        || String(a.playerId).localeCompare(String(b.playerId))).slice(0, 10);
      const active = new Set(top.map(player => player.playerId));
      for (const id of portraits.keys()) if (!active.has(id)) portraits.delete(id);
      for (const player of top) {
        const src = player.progress?.profileAvatar || '';
        if (portraits.get(player.playerId)?.src === src) continue;
        const entry = { src, image: null };
        portraits.set(player.playerId, entry);
        if (src && typeof Image !== 'undefined') {
          const image = new Image();
          image.onload = () => {
            if (root.isDisposed() || portraits.get(player.playerId) !== entry) return;
            entry.image = image;
            dirty = true;
          };
          image.src = src;
        }
      }
      drawWealthLeaderboard(ctx, top, player => portraits.get(player.playerId)?.image || fallback);
      sdtLd.update();
    };
    refreshLeaderboard();
    ldScreenMat.diffuseTexture = sdtLd;
    ldScreenMat.emissiveTexture = sdtLd;
  }
  ldPlane.material = ldScreenMat;

  // ===========================================================================
  // 5. MÁI NGÓI ĐỎ ĐẤT NUNG TRUYỀN THỐNG VIỆT NAM (CURVED TERRACOTTA ROOF)
  // Che mưa nắng trên đỉnh bảng thông tin giống kiến trúc đình làng & cổng làng
  // ===========================================================================
  const roofRoot = new TransformNode('portal-roof-root', scene);
  roofRoot.position.set(0, 12.0, 0);
  roofRoot.parent = root;

  // Khối xà gồ đỡ rui mè gỗ lim
  const roofRafters = MeshBuilder.CreateBox('portal-roof-rafters', { width: 14.8, height: 0.45, depth: 3.6 }, scene);
  roofRafters.position.set(0, 0.2, 0);
  roofRafters.material = matWarmWood;
  roofRafters.parent = roofRoot;

  // Mái ngói dốc 2 tầng đất nung
  // Mái chính (Mặt trước + Mặt sau nghiêng 32 độ)
  const roofMainNorth = MeshBuilder.CreateBox('portal-roof-slope-n', { width: 15.6, height: 0.22, depth: 2.3 }, scene);
  roofMainNorth.position.set(0, 1.15, 0.95);
  roofMainNorth.rotation.x = 0.56; // Nghiêng về mặt Bắc
  roofMainNorth.material = matRoofTiles;
  roofMainNorth.parent = roofRoot;
  shadows?.addShadowCaster(roofMainNorth);

  const roofMainSouth = MeshBuilder.CreateBox('portal-roof-slope-s', { width: 15.6, height: 0.22, depth: 2.3 }, scene);
  roofMainSouth.position.set(0, 1.15, -0.95);
  roofMainSouth.rotation.x = -0.56; // Nghiêng về mặt Nam
  roofMainSouth.material = matRoofTiles;
  roofMainSouth.parent = roofRoot;
  shadows?.addShadowCaster(roofMainSouth);

  // Bờ nóc đắp ngói nóc truyền thống (Roof Ridge)
  const roofRidge = MeshBuilder.CreateCylinder('portal-roof-ridge', {
    diameter: 0.6,
    height: 15.8,
    tessellation: 12,
  }, scene);
  roofRidge.rotation.z = Math.PI / 2;
  roofRidge.position.set(0, 1.95, 0);
  roofRidge.material = matRoofTiles;
  roofRidge.parent = roofRoot;

  // Hai đầu bờ nóc chạm Kìm Nóc đúc đồng uốn lượn phong cách cổ truyền
  [-7.9, 7.9].forEach((rx, ridx) => {
    const kimNoc = MeshBuilder.CreateTorus(`portal-kim-noc-${ridx}`, {
      diameter: 0.9,
      thickness: 0.22,
      tessellation: 16,
    }, scene);
    kimNoc.position.set(rx, 2.35, 0);
    kimNoc.rotation.y = Math.PI / 2;
    kimNoc.rotation.x = ridx === 0 ? 0.35 : -0.35;
    kimNoc.material = matBrass;
    kimNoc.parent = roofRoot;
  });

  // Tấm hoành phi gỗ sơn son thếp vàng ở chính giữa bờ nóc
  const signBoard = MeshBuilder.CreateBox('portal-crest-board', { width: 4.8, height: 1.1, depth: 0.3 }, scene);
  signBoard.position.set(0, 2.5, 0);
  signBoard.material = makeMat(scene, 'portal-crest-bg', '#991b1b', '#7f1d1d', 0.4, 40);
  signBoard.parent = roofRoot;

  const signBorder = MeshBuilder.CreateBox('portal-crest-border', { width: 5.1, height: 1.35, depth: 0.22 }, scene);
  signBorder.position.set(0, 2.5, 0);
  signBorder.material = matBrass;
  signBorder.parent = roofRoot;

  // Huy hiệu Bông Lúa Vàng đúc đồng ở trung tâm hoành phi
  const riceEmblem = MeshBuilder.CreateCylinder('portal-rice-emblem', { diameter: 1.6, height: 0.35, tessellation: 24 }, scene);
  riceEmblem.position.set(0, 2.5, 0.2);
  riceEmblem.rotation.x = Math.PI / 2;
  riceEmblem.material = matBrass;
  riceEmblem.parent = roofRoot;
  shadows?.addShadowCaster(riceEmblem);

  const emblemCore = MeshBuilder.CreateCylinder('portal-emblem-core', { diameter: 1.1, height: 0.38, tessellation: 8 }, scene);
  emblemCore.position.set(0, 2.5, 0.22);
  emblemCore.rotation.x = Math.PI / 2;
  emblemCore.material = makeMat(scene, 'portal-emblem-gold-glow', '#fef08a', '#f59e0b', 0.9, 120);
  emblemCore.parent = roofRoot;

  // 3 Đèn Lồng Hội An rọi sáng mặt bảng dưới mái ngói
  [-3.8, 0, 3.8].forEach((lx, lidx) => {
    // Đèn lồng mặt Bắc
    const lNorth = MeshBuilder.CreateSphere(`portal-eave-lantern-n-${lidx}`, { diameterX: 0.55, diameterY: 0.75, diameterZ: 0.55, segments: 10 }, scene);
    lNorth.position.set(lx, 11.4, 1.45);
    lNorth.material = matLanternRed;
    lNorth.parent = root;

    // Đèn lồng mặt Nam
    const lSouth = MeshBuilder.CreateSphere(`portal-eave-lantern-s-${lidx}`, { diameterX: 0.55, diameterY: 0.75, diameterZ: 0.55, segments: 10 }, scene);
    lSouth.position.set(lx, 11.4, -1.45);
    lSouth.material = matLanternRed;
    lSouth.parent = root;
  });

  return {
    root,
    adPlane,
    ldPlane,
    animate: (t) => {
      refreshLeaderboard();
      emblemCore.rotation.y = t * 0.0015;
    },
  };
}

// =============================================================================
// BACKWARD-COMPATIBLE WRAPPERS
// =============================================================================
export function createPlazaLeaderboardMonument(scene, parent, position, yaw = 0, shadows = null) {
  return createPlazaGrandPortal(scene, parent, position, yaw, shadows);
}

export function createPlazaEventBillboard(scene, parent, position, yaw = 0, shadows = null, adConfig = PLAZA_BILLBOARD_SPONSOR) {
  return createPlazaGrandPortal(scene, parent, position, yaw, shadows, adConfig);
}
