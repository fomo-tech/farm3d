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
  headerTag: 'BẢNG TIN LÀNG BÌNH MINH · HỢP TÁC XÃ NÔNG SẢN VIỆT',
  mainHeadline: 'CỔNG THÔNG TIN & QUẢNG BÁ NÔNG SẢN',
  subHeadline: 'KẾT NỐI BÀ CON NHÀ VƯỜN · GIAO THƯƠNG NÔNG SẢN · ĐÓN ĐẦU DU KHÁCH',
  bullet1: 'Bản tin thời tiết mùa vụ, giá nông sản & lịch gieo trồng rau củ quả hữu cơ',
  bullet2: 'Khu giao thương chợ quê: Mua bán sỉ lúa vàng, bắp ngô, dưa hấu & sữa tươi',
  bullet3: 'Hệ thống Loa Phát Thanh xã: Điểm tin mùa màng bội thu & văn nghệ làng quê',
  bullet4: 'Hỗ trợ mở gian hàng chợ quê 3D & dựng biển hiệu quảng bá nông trại xanh',
  contactHotline: 'BAN QUẢN LÝ NÔNG TRẠI · HOTLINE: 0988.888.XXX',
  brandName: 'NÔNG SẢN BÌNH MINH',
  promoBadge: 'ƯU ĐÃI NÔNG DÂN MỚI -30%',
  tickerNotice: 'CHÚC BÀ CON & DU KHÁCH MỘT MÙA MÀNG BỘI THU · MƯA THUẬN GIÓ HÒA · VẠN SỰ HANH THÔNG',
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
  adPlane.metadata = { label: 'Bảng Tin Nông Trại Bình Minh' };

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
    ctx.save();
    ctx.scale(0.5, 0.5);

    // Nền gỗ sồi già & giấy điệp dân gian truyền thống ấm cúng
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1152);
    bgGrad.addColorStop(0, '#2b1408');
    bgGrad.addColorStop(0.5, '#451f0b');
    bgGrad.addColorStop(1, '#2b1408');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 2048, 1152);

    // Hoa văn phên tre / thoi dệt lúa nước dân gian chìm nhẹ
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.12)';
    ctx.lineWidth = 1.5;
    for (let x = -1152; x <= 2048 + 1152; x += 64) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 1152, 1152); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, 1152); ctx.lineTo(x + 1152, 0); ctx.stroke();
    }

    // Khung viền chỉ đồng & hoa văn thổ cẩm
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 2008, 1112);

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 4;
    ctx.strokeRect(34, 34, 1980, 1084);

    // 1. BANNER TIÊU ĐỀ TRUYỀN THỐNG (Đỏ thắm viền vàng)
    const headerGrad = ctx.createLinearGradient(0, 0, 2048, 0);
    headerGrad.addColorStop(0, '#7f1d1d');
    headerGrad.addColorStop(0.3, '#b91c1c');
    headerGrad.addColorStop(0.5, '#dc2626');
    headerGrad.addColorStop(0.7, '#b91c1c');
    headerGrad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(40, 40, 1968, 125);

    ctx.font = '900 48px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText(adConfig.headerTag || 'BẢNG TIN LÀNG BÌNH MINH · HỢP TÁC XÃ NÔNG SẢN VIỆT', 1024, 102);
    ctx.shadowBlur = 0;

    // 2. KHU VỰC THÔNG TIN BÊN TRÁI (Width: 1260px)
    ctx.fillStyle = '#fef08a';
    ctx.font = '900 60px Arial, "Nunito", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(adConfig.mainHeadline || 'CỔNG THÔNG TIN & QUẢNG BÁ NÔNG SẢN', 85, 235);

    ctx.fillStyle = '#fed7aa';
    ctx.font = '800 30px Arial, "Nunito", sans-serif';
    ctx.fillText(adConfig.subHeadline || 'KẾT NỐI BÀ CON NHÀ VƯỜN · GIAO THƯƠNG NÔNG SẢN · ĐÓN ĐẦU DU KHÁCH', 85, 290);

    // Đường gân vàng rơm chia phân cách
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(85, 325);
    ctx.lineTo(1345, 325);
    ctx.stroke();

    // 4 DÒNG BẢN TIN NÔNG TRẠI
    const bullets = [
      `•  ${adConfig.bullet1}`,
      `•  ${adConfig.bullet2}`,
      `•  ${adConfig.bullet3}`,
      `•  ${adConfig.bullet4 || 'Hỗ trợ mở gian hàng chợ quê 3D & dựng biển hiệu riêng'}`,
    ];
    bullets.forEach((b, bIdx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      drawSafeRoundRect(ctx, 85, 365 + bIdx * 82, 1260, 68, 14);
      ctx.fill();

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '700 28px Arial, "Nunito", sans-serif';
      ctx.fillStyle = '#fef3c7';
      ctx.fillText(b, 110, 408 + bIdx * 82);
    });

    // HỘP LIÊN HỆ BAN QUẢN LÝ NÔNG TRẠI (Nền vàng lúa mật ong)
    const boxGrad = ctx.createLinearGradient(85, 0, 1345, 0);
    boxGrad.addColorStop(0, '#f59e0b');
    boxGrad.addColorStop(0.5, '#fbbf24');
    boxGrad.addColorStop(1, '#ea580c');
    ctx.fillStyle = boxGrad;
    ctx.beginPath();
    drawSafeRoundRect(ctx, 85, 725, 1260, 235, 24);
    ctx.fill();

    ctx.font = '900 48px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#451a03';
    ctx.textAlign = 'center';
    ctx.fillText(adConfig.contactHotline, 715, 785);

    ctx.font = '800 27px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#78350f';
    ctx.fillText('HỖ TRỢ BÀ CON NÔNG DÂN, NHÀ TÀI TRỢ & DOANH NGHIỆP NÔNG SẢN SẠCH', 715, 845);

    ctx.font = '700 24px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#451a03';
    ctx.fillText('ĐIỆN THOẠI / ZALO HỢP TÁC XÃ · HÒM THƯ GÓP Ý LÀNG QUÊ BÌNH MINH', 715, 905);

    // 3. KHUNG QR KẾT NỐI BÊN PHẢI (Width: 590px - Kiểu Mành Tre Mộc Mạc)
    ctx.fillStyle = 'rgba(20, 10, 5, 0.85)';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.beginPath();
    drawSafeRoundRect(ctx, 1400, 190, 590, 770, 24);
    ctx.fill();
    ctx.stroke();

    // Tiêu đề khung QR
    ctx.font = '900 32px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText('QUÉT MÃ KẾT NỐI HỢP TÁC XÃ', 1695, 245);

    // Nền trắng chứa QR code
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    drawSafeRoundRect(ctx, 1475, 275, 440, 440, 18);
    ctx.fill();

    // Mô phỏng QR Code sắc nét
    ctx.fillStyle = '#1c1917';
    [[1495, 295], [1835, 295], [1495, 635]].forEach(([qx, qy]) => {
      ctx.fillRect(qx, qy, 76, 76);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qx + 14, qy + 14, 48, 48);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(qx + 26, qy + 26, 24, 24);
    });
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if ((r + c) % 3 === 0 || (r * c) % 5 === 0) {
          ctx.fillRect(1595 + c * 23, 390 + r * 23, 19, 19);
        }
      }
    }

    // Logo Bông Lúa ở tâm QR
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    drawSafeRoundRect(ctx, 1640, 440, 110, 110, 16);
    ctx.fill();
    ctx.font = '900 26px Arial';
    ctx.fillStyle = '#451a03';
    ctx.fillText('NÔNG', 1695, 485);
    ctx.fillText('TRẠI', 1695, 520);

    // Badge đỏ ưu đãi nông dân
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    drawSafeRoundRect(ctx, 1465, 745, 460, 75, 18);
    ctx.fill();

    ctx.font = '900 34px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(adConfig.promoBadge || 'ƯU ĐÃI NÔNG DÂN MỚI -30%', 1695, 792);

    ctx.font = '700 23px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#fed7aa';
    ctx.fillText('Quét Zalo kết nối BQL & nhận sạp hàng đẹp', 1695, 860);

    ctx.font = '800 22px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('Hotline hỗ trợ 24/7 toàn thể bà con', 1695, 915);

    // 4. DẢI HOA VĂN TICKER CHÂN BẢNG (Cao 90px)
    ctx.fillStyle = 'rgba(35, 15, 6, 0.95)';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    drawSafeRoundRect(ctx, 55, 1005, 1935, 95, 20);
    ctx.fill();
    ctx.stroke();

    ctx.font = '800 28px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText(adConfig.tickerNotice, 1024, 1056);

    sdtAd.update();
    ctx.restore();
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

  if (typeof document !== 'undefined' || typeof OffscreenCanvas !== 'undefined') {
    const sdtLd = new DynamicTexture('portal-ld-texture', { width: 1024, height: 576 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
    sdtLd.anisotropicFilteringLevel = 4;
    sdtLd.hasAlpha = false;
    const ctx = sdtLd.getContext();
    ctx.save();
    ctx.scale(0.5, 0.5);

    // Nền gỗ gụ nâu đỏ sang trọng ấm áp
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1152);
    bgGrad.addColorStop(0, '#261107');
    bgGrad.addColorStop(0.5, '#3d1c0c');
    bgGrad.addColorStop(1, '#261107');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 2048, 1152);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 2008, 1112);

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 4;
    ctx.strokeRect(34, 34, 1980, 1084);

    // HEADER BANNER BẢNG VÀNG THẦN NÔNG
    const headerGrad = ctx.createLinearGradient(0, 0, 2048, 0);
    headerGrad.addColorStop(0, '#78350f');
    headerGrad.addColorStop(0.25, '#d97706');
    headerGrad.addColorStop(0.5, '#fef08a');
    headerGrad.addColorStop(0.75, '#d97706');
    headerGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(40, 40, 1968, 115);

    ctx.font = '900 56px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#451a03';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText('BẢNG VÀNG DANH DỰ · THẦN NÔNG XUẤT SẮC LÀNG BÌNH MINH', 1024, 98);
    ctx.shadowBlur = 0;

    // CỘT TRÁI: TOP 3 THẦN NÔNG TIÊU BIỂU
    const top3 = [
      {
        rank: 'HẠNG 1 · VÀNG', crown: '◆', name: 'ĐẠI PHÚ HÀO LÀNG NÔNG',
        lv: 'Cấp 50 · Dinh Thự Nông Trang · Thần Nông VIP', xp: '2,850,000 XP',
        border: '#f59e0b', h: 240,
      },
      {
        rank: 'HẠNG 2 · BẠC', crown: '◆', name: 'NÔNG DÂN TIÊU BIỂU',
        lv: 'Cấp 46 · Trang Trại Cây Ăn Trái Trù Phú', xp: '2,180,000 XP',
        border: '#cbd5e1', h: 200,
      },
      {
        rank: 'HẠNG 3 · ĐỒNG', crown: '▲', name: 'NÔNG TRẠI CHĂM CHỈ',
        lv: 'Cấp 43 · Vườn Rau Củ Quả Hữu Cơ', xp: '1,790,000 XP',
        border: '#d97706', h: 200,
      },
    ];

    let leftY = 185;
    top3.forEach((t) => {
      ctx.fillStyle = 'rgba(20, 10, 5, 0.85)';
      ctx.strokeStyle = t.border;
      ctx.lineWidth = 4;
      ctx.beginPath();
      drawSafeRoundRect(ctx, 60, leftY, 940, t.h, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = t.border;
      ctx.beginPath();
      drawSafeRoundRect(ctx, 85, leftY + 18, 250, 50, 14);
      ctx.fill();

      ctx.font = '900 26px Arial, "Nunito", sans-serif';
      ctx.fillStyle = '#451a03';
      ctx.textAlign = 'center';
      ctx.fillText(t.rank, 210, leftY + 44);

      ctx.font = '36px Arial';
      ctx.fillText(t.crown, 370, leftY + 45);

      ctx.font = '900 44px Arial, "Nunito", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(t.name, 85, leftY + (t.h === 240 ? 120 : 110));

      ctx.font = '700 26px Arial, "Nunito", sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.fillText(t.lv, 85, leftY + (t.h === 240 ? 175 : 158));

      ctx.font = '900 38px Arial, "Nunito", sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'right';
      ctx.fillText(t.xp, 970, leftY + (t.h === 240 ? 175 : 158));

      leftY += t.h + 24;
    });

    // CỘT PHẢI: TOP 4 ĐẾN TOP 10
    const top4to10 = [
      { r: '4', name: 'Hải Tặc Bến Câu Cá', lv: 'Lv.40 · Cao Thủ Săn Cá Hồ Pha Lê', xp: '1,420,000 XP' },
      { r: '5', name: 'Nông Dân Cần Mẫn', lv: 'Lv.37 · Bậc Thầy Trồng Lúa Vàng', xp: '1,150,000 XP' },
      { r: '6', name: 'Bé Mầm Xanh Tươi', lv: 'Lv.34 · Trang Trại Dâu Tây Đỏ', xp: '980,000 XP' },
      { r: '7', name: 'Vua Xe Kéo Làng Quê', lv: 'Lv.31 · Đội Trưởng Giao Nông Sản', xp: '820,000 XP' },
      { r: '8', name: 'Hương Vị Đồng Quê', lv: 'Lv.28 · Tiệm Bánh Ngô Nướng', xp: '690,000 XP' },
      { r: '9', name: 'Gió Mùa Vàng Lúa', lv: 'Lv.25 · Nông Dân Cần Cù', xp: '540,000 XP' },
      { r: '10', name: 'Cư Dân Xóm Mới', lv: 'Lv.22 · Tân Binh Tiềm Năng', xp: '410,000 XP' },
    ];

    let rightY = 185;
    top4to10.forEach((row) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.strokeStyle = '#522306';
      ctx.lineWidth = 2;
      ctx.beginPath();
      drawSafeRoundRect(ctx, 1030, rightY, 955, 80, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(1075, rightY + 40, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '900 28px Arial, "Nunito", sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText(row.r, 1075, rightY + 42);

      ctx.font = '800 32px Arial, "Nunito", sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.fillText(row.name, 1125, rightY + 42);

      ctx.font = '700 24px Arial, "Nunito", sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.fillText(row.lv, 1530, rightY + 42);

      ctx.font = '900 30px Arial, "Nunito", sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'right';
      ctx.fillText(row.xp, 1960, rightY + 42);

      rightY += 95;
    });

    // FOOTER TICKER
    ctx.fillStyle = 'rgba(25, 12, 5, 0.95)';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    drawSafeRoundRect(ctx, 60, 1010, 1928, 90, 20);
    ctx.fill();
    ctx.stroke();

    ctx.font = '800 30px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText('DỮ LIỆU ĐỒNG BỘ TRỰC TIẾP · BƯỚC LẠI GẦN VÀ NHẤN [E] ĐỂ XEM CHI TIẾT BẢNG VÀNG', 1024, 1056);

    sdtLd.update();
    ctx.restore();
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
