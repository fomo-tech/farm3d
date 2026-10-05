import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
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

function makeMat(scene, name, hex, emissiveHex = null, specular = 0.35, specularPower = 64) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.5);
  m.specularColor = new Color3(specular, specular, specular);
  m.specularPower = specularPower;
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex).scale(0.05);
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
 * CẤU HÌNH QUẢNG CÁO THƯƠNG MẠI
 */
export const PLAZA_BILLBOARD_SPONSOR = {
  headerTag: 'KAIA METROPOLIS MEDIA · 4K BROADCAST',
  mainHeadline: 'VỊ TRÍ ĐẶT QUẢNG CÁO VIP 24/7',
  subHeadline: 'ĐÓN ĐẦU 100% CƯ DÂN & DU KHÁCH NGAY TẠI CỔNG CHÍNH VÀO THÀNH PHỐ',
  bullet1: 'Phát sóng TVC, Banner & Slogan thương hiệu 24/7 toàn cảnh sắc nét',
  bullet2: 'Tích hợp đường link Web / Shop / Fanpage và Tặng Giftcode độc quyền',
  bullet3: 'Hệ thống Loa Thông Báo tự động phát thông điệp toàn server định kỳ',
  bullet4: 'Miễn phí thiết kế 3D chuyên nghiệp & Đặt NPC đại sứ thương hiệu riêng',
  contactHotline: 'HOTLINE / ZALO BOOKING: 0988.888.XXX',
  brandName: 'THƯƠNG HIỆU CỦA BẠN',
  promoBadge: 'GIẢM 30% HÔM NAY',
  tickerNotice: '★ LIÊN HỆ ĐẶT QUẢNG CÁO THEO HOTLINE & ZALO TRÊN BẢNG · CHÀO MỪNG CÁC THƯƠNG HIỆU & DOANH NGHIỆP TÀI TRỢ ★',
};

// =============================================================================
// CỔNG CHÀO KHẢI HOÀN MÔN ĐẠI LỘ BẮC (GRAND ENTRANCE PORTAL OF KAIA TOWN)
// Vị trí: Đặt tại Cổng vào Đại lộ Bắc (x: 0, z: 25.5).
// - Hai trụ tháp cẩm thạch đôi uy nghi hai bên lề đường (x = ±5.8m), lòng đường 9.4m thông thoáng.
// - Vòm cổng Khải Hoàn Môn cao 12.2m bắc ngang qua đại lộ, tĩnh không 4.8m cho xe cộ qua lại.
// - MẶT BẮC (hướng ra nông trại): MÀN HÌNH LED QUẢNG CÁO 4K (ai vào thành phố cũng thấy 100%).
//   => Không bấm vào hiển thị popup (hiển thị đầy đủ thông tin trực tiếp trên bảng 3D).
// - MẶT NAM (hướng vào đài phun nước): BẢNG VINH DANH TOP CƯ DÂN (người trong quảng trường thấy rõ).
// =============================================================================
export function createPlazaGrandPortal(scene, parent, position = { x: 0, y: 0, z: 25.5 }, yaw = 0, shadows = null, adConfig = PLAZA_BILLBOARD_SPONSOR) {
  const root = new TransformNode('plaza-grand-entrance-portal', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.rotation.y = yaw;
  if (parent) root.parent = parent;

  const matLimestone = makeMat(scene, 'portal-limestone', '#f7f2e8', '#dfd7c8', 0.25, 45);
  const matFoundation = makeMat(scene, 'portal-found', '#8c857b', '#6b655d', 0.2, 40);
  const matGoldTrim = makeMat(scene, 'portal-gold', '#f59e0b', '#d97706', 0.85, 110);
  const matBezelWood = makeMat(scene, 'portal-bezel-wood', '#2d1810', '#1c0f0a', 0.4, 60);

  // 1. Hai trụ tháp cẩm thạch La Mã đôi hai bên đại lộ (x = ±5.8m, thông thủy lòng đường 9.4m)
  [-5.8, 5.8].forEach((px, idx) => {
    // Chân bệ móng đá kiên cố (2.4m rộng × 3.2m sâu × 1.2m cao)
    const pedestalFound = MeshBuilder.CreateBox(`portal-ped-found-${idx}`, { width: 2.6, depth: 3.4, height: 0.4 }, scene);
    pedestalFound.position.set(px, 0.2, 0);
    pedestalFound.material = matFoundation;
    pedestalFound.parent = root;
    pedestalFound.receiveShadows = true;

    const pedestalPlinth = MeshBuilder.CreateBox(`portal-ped-plinth-${idx}`, { width: 2.3, depth: 3.1, height: 0.8 }, scene);
    pedestalPlinth.position.set(px, 0.8, 0);
    pedestalPlinth.material = matLimestone;
    pedestalPlinth.parent = root;
    pedestalPlinth.receiveShadows = true;

    // Đai vàng kim chân cột
    const pedRing = MeshBuilder.CreateBox(`portal-ped-ring-${idx}`, { width: 2.4, depth: 3.2, height: 0.12 }, scene);
    pedRing.position.set(px, 1.25, 0);
    pedRing.material = matGoldTrim;
    pedRing.parent = root;

    // Thân trụ tháp cẩm thạch đôi vươn cao
    [-0.7, 0.7].forEach((colZ, cidx) => {
      const col = MeshBuilder.CreateCylinder(`portal-col-${idx}-${cidx}`, {
        diameterTop: 1.1,
        diameterBottom: 1.25,
        height: 5.6,
        tessellation: 18,
      }, scene);
      col.position.set(px, 4.1, colZ);
      col.material = matLimestone;
      col.parent = root;
      shadows?.addShadowCaster(col);

      // Đai vàng quanh thân cột
      [2.5, 4.2, 6.2].forEach((ry, ridx) => {
        const ring = MeshBuilder.CreateTorus(`portal-c-ring-${idx}-${cidx}-${ridx}`, { diameter: 1.3, thickness: 0.12, tessellation: 18 }, scene);
        ring.position.set(px, ry, colZ);
        ring.material = matGoldTrim;
        ring.parent = root;
      });
    });

    // Khối tường đệm giữa 2 cột tròn
    const colWall = MeshBuilder.CreateBox(`portal-col-wall-${idx}`, { width: 1.4, depth: 1.8, height: 5.4 }, scene);
    colWall.position.set(px, 4.1, 0);
    colWall.material = matLimestone;
    colWall.parent = root;

    // Đèn lồng cổ điển chiếu sáng cổng vào
    createWarmHangingLantern(scene, new Vector3(px + (px > 0 ? -1.3 : 1.3), 5.4, 0), root, shadows);

    // Chậu hoa hồng trang trí dưới chân trụ tháp
    const urn = MeshBuilder.CreateCylinder(`portal-urn-${idx}`, { diameterTop: 0.9, diameterBottom: 0.6, height: 0.7, tessellation: 12 }, scene);
    urn.position.set(px + (px > 0 ? 1.4 : -1.4), 0.75, 1.2);
    urn.material = matLimestone;
    urn.parent = root;

    const roseBush = MeshBuilder.CreateSphere(`portal-bush-${idx}`, { diameter: 0.85, segments: 6 }, scene);
    roseBush.position.set(px + (px > 0 ? 1.4 : -1.4), 1.3, 1.2);
    roseBush.material = makeMat(scene, `portal-rose-${idx}`, '#f43f5e', '#e11d48', 0.3, 30);
    roseBush.parent = root;

    // Vệt sáng ấm loang chân trụ
    createGroundLightPoolOnly(scene, root, new Vector3(px, 0.126, 0), 4.5);
  });

  // 2. Khối Nhịp Cầu Cổng Khải Hoàn Môn (Bridge Entablature) bắc qua đại lộ
  // Tĩnh không thông thủy cho nhân vật đi dưới: y = 4.8m (rất thoáng)
  const archUnderbeam = MeshBuilder.CreateBox('portal-arch-beam', { width: 13.8, height: 0.6, depth: 2.6 }, scene);
  archUnderbeam.position.set(0, 5.0, 0);
  archUnderbeam.material = matLimestone;
  archUnderbeam.parent = root;

  // Hộp kiến trúc chứa 2 màn hình LED (Width: 13.2m, Height: 6.8m, Depth: 2.2m)
  const archHousing = MeshBuilder.CreateBox('portal-arch-housing', { width: 13.2, height: 6.6, depth: 2.2 }, scene);
  archHousing.position.set(0, 8.4, 0);
  archHousing.material = matLimestone;
  archHousing.parent = root;
  shadows?.addShadowCaster(archHousing);

  // Viền gờ gỗ & vàng cổ điển bao quanh nhịp cổng
  const archGoldRim = MeshBuilder.CreateBox('portal-arch-gold-rim', { width: 13.4, height: 0.25, depth: 2.3 }, scene);
  archGoldRim.position.set(0, 11.75, 0);
  archGoldRim.material = matGoldTrim;
  archGoldRim.parent = root;

  // ===========================================================================
  // 3. MẶT BẮC: MÀN HÌNH LED QUẢNG CÁO 4K (NORTH COMMERCIAL ADVERTISING SCREEN)
  // Quay mặt ra phía Bắc (+Z): 100% người từ nông trại vào thành phố đều thấy ngay!
  // Tuyệt đối không hiện popup khi bấm vào (hiển thị thông tin trực tiếp 100% trên bảng)
  // ===========================================================================
  const screenW = 11.2;
  const screenH = 5.8;
  const screenCenterY = 8.3;

  // Viền màn hình Bắc
  const adBorder = MeshBuilder.CreateBox('portal-ad-border', { width: screenW + 0.35, height: screenH + 0.35, depth: 0.15 }, scene);
  adBorder.position.set(0, screenCenterY, 1.15);
  adBorder.material = matGoldTrim;
  adBorder.parent = root;

  const adPlane = MeshBuilder.CreatePlane('portal-ad-screen-plane', {
    width: screenW,
    height: screenH,
    sideOrientation: Mesh.FRONTSIDE,
  }, scene);
  adPlane.position.set(0, screenCenterY, 1.25);
  adPlane.rotation.y = Math.PI; // Quay mặt về phía Bắc (+Z), đọc chữ từ trái sang phải chuẩn xác 100%
  adPlane.parent = root;
  // Hiển thị trực tiếp 100% trên bảng 3D, không bấm vào hiển thị popup theo đúng yêu cầu
  adPlane.metadata = { label: 'Bảng Quảng Cáo Thương Mại Kaia' };

  const adScreenMat = new StandardMaterial('portal-ad-mat', scene);
  adScreenMat.disableLighting = true;
  adScreenMat.diffuseColor = Color3.White();
  adScreenMat.emissiveColor = Color3.White();
  adScreenMat.specularColor = Color3.Black();

  if (typeof document !== 'undefined' || typeof OffscreenCanvas !== 'undefined') {
    // Keep the logical artwork at 2048x1152 but upload a 1024x576 texture;
    // the old pair of large canvas uploads caused a synchronous 60-70ms boot
    // hitch before the first playable frame.
    const sdtAd = new DynamicTexture('portal-ad-texture', { width: 1024, height: 576 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
    sdtAd.anisotropicFilteringLevel = 4;
    sdtAd.hasAlpha = false;
    const ctx = sdtAd.getContext();
    ctx.save();
    ctx.scale(0.5, 0.5);

    // Nền Dark Sapphire & Sunset Modern sang trọng
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1152);
    bgGrad.addColorStop(0, '#0a1628');
    bgGrad.addColorStop(0.5, '#122b54');
    bgGrad.addColorStop(1, '#0a1628');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 2048, 1152);

    // Lưới neon công nghệ
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= 2048; x += 64) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1152); ctx.stroke();
    }
    for (let y = 0; y <= 1152; y += 64) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(2048, y); ctx.stroke();
    }

    // Viền LED phát sáng rực rỡ
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 2008, 1112);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(34, 34, 1980, 1084);

    // TOP BROADCAST HEADER (Cao 125px)
    const headerGrad = ctx.createLinearGradient(0, 0, 2048, 0);
    headerGrad.addColorStop(0, '#991b1b');
    headerGrad.addColorStop(0.25, '#e11d48');
    headerGrad.addColorStop(0.5, '#f59e0b');
    headerGrad.addColorStop(0.75, '#e11d48');
    headerGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(40, 40, 1968, 115);

    ctx.font = '900 52px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 8;
    ctx.fillText(`★  ${adConfig.headerTag}  ★`, 1024, 82);

    ctx.font = '800 24px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('★ MÀN HÌNH LED 4K KHỔNG LỒ 24/7 · TIẾP CẬN 100,000+ LƯỢT CƯ DÂN & DU KHÁCH ★', 1024, 128);
    ctx.shadowBlur = 0;

    // PHẦN THÂN: KHU VỰC QUẢNG CÁO THƯƠNG MẠI
    // 1. Khung Quảng Cáo Lớn Bên Trái (Width: 1320px)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    drawSafeRoundRect(ctx, 55, 180, 1320, 810, 28);
    ctx.fill();
    ctx.stroke();

    // Huy hiệu Vị Trí Kim Cương
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    drawSafeRoundRect(ctx, 85, 208, 380, 48, 16);
    ctx.fill();

    ctx.font = '900 26px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText('★ VỊ TRÍ ĐẶT QUẢNG CÁO VIP SỐ 1 ★', 275, 234);

    // Tiêu đề Quảng Cáo Chính Cực To
    ctx.font = '900 66px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(adConfig.mainHeadline, 85, 315);

    // Slogan phụ nổi bật
    ctx.font = '800 32px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(adConfig.subHeadline, 85, 370);

    // 4 Dòng Lợi Ích Nổi Bật Khi Đặt Quảng Cáo
    const bullets = [
      `✔  ${adConfig.bullet1}`,
      `✔  ${adConfig.bullet2}`,
      `✔  ${adConfig.bullet3}`,
      `✔  ${adConfig.bullet4 || 'Hỗ trợ thiết kế 3D chuyên nghiệp & Đặt NPC đại sứ thương hiệu'}`,
    ];
    bullets.forEach((b, bIdx) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.beginPath();
      drawSafeRoundRect(ctx, 85, 415 + bIdx * 76, 1260, 64, 14);
      ctx.fill();

      ctx.font = '700 28px Arial, "Nunito", sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(b, 110, 450 + bIdx * 76);
    });

    // GIANT CALL-TO-ACTION HOTLINE BOX
    const boxGrad = ctx.createLinearGradient(85, 0, 1345, 0);
    boxGrad.addColorStop(0, '#f59e0b');
    boxGrad.addColorStop(1, '#ea580c');
    ctx.fillStyle = boxGrad;
    ctx.beginPath();
    drawSafeRoundRect(ctx, 85, 735, 1260, 230, 24);
    ctx.fill();

    ctx.font = '900 50px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText(adConfig.contactHotline, 715, 795);

    ctx.font = '800 28px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#78350f';
    ctx.fillText('HỖ TRỢ DOANH NGHIỆP, SHOP GAME, STREAMER & CÁ NHÂN QUẢNG BÁ', 715, 855);

    ctx.font = '700 24px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#451a03';
    ctx.fillText('TELEGRAM: @KaiaAdsMedia · FANPAGE: fb.com/KaiaOnline3D · BQT KAIA', 715, 915);

    // 2. Khung Poster Mockup / QR Code Bên Phải (Width: 590px)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    drawSafeRoundRect(ctx, 1400, 180, 590, 810, 28);
    ctx.fill();
    ctx.stroke();

    // Header Poster QR
    ctx.font = '900 34px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText('QUÉT MÃ ĐẶT CHỖ & TƯ VẤN', 1695, 230);

    // Khung trắng chứa QR Code sắc nét
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1465, 260, 460, 460);

    // Vẽ mô phỏng QR Code sắc nét
    ctx.fillStyle = '#0f172a';
    [[1485, 280], [1825, 280], [1485, 620]].forEach(([qx, qy]) => {
      ctx.fillRect(qx, qy, 80, 80);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qx + 16, qy + 16, 48, 48);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(qx + 28, qy + 28, 24, 24);
    });
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if ((r + c) % 3 === 0 || (r * c) % 5 === 0) {
          ctx.fillRect(1585 + c * 24, 380 + r * 24, 20, 20);
        }
      }
    }

    // Logo ở tâm QR
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    drawSafeRoundRect(ctx, 1640, 435, 110, 110, 16);
    ctx.fill();
    ctx.font = '900 24px Arial';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('KAIA', 1695, 480);
    ctx.fillText('ADS', 1695, 510);

    // Badge khuyến mãi góc dưới
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    drawSafeRoundRect(ctx, 1465, 745, 460, 75, 18);
    ctx.fill();

    ctx.font = '900 36px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(adConfig.promoBadge || 'GIẢM 30% HÔM NAY', 1695, 792);

    ctx.font = '700 24px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Dành riêng cho 3 đối tác liên hệ đầu tuần', 1695, 860);

    ctx.font = '800 22px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText('Quét Zalo hoặc gọi Hotline để booking', 1695, 920);

    // FOOTER TICKER BANNER (Cao 90px)
    ctx.fillStyle = 'rgba(10, 15, 30, 0.95)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    drawSafeRoundRect(ctx, 55, 1010, 1935, 90, 20);
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
  // 4. MẶT NAM: BẢNG VINH DANH TOP CƯ DÂN (SOUTH LEADERBOARD SCREEN)
  // Quay mặt vào phía Nam (-Z): người đứng trong quảng trường nhìn thấy toàn bộ!
  // Nhấn phím [E] hoặc chạm vào để mở Bảng Xếp Hạng chi tiết
  // ===========================================================================
  const ldBorder = MeshBuilder.CreateBox('portal-ld-border', { width: screenW + 0.35, height: screenH + 0.35, depth: 0.15 }, scene);
  ldBorder.position.set(0, screenCenterY, -1.15);
  ldBorder.material = matGoldTrim;
  ldBorder.parent = root;

  const ldPlane = MeshBuilder.CreatePlane('portal-ld-screen-plane', {
    width: screenW,
    height: screenH,
    sideOrientation: Mesh.FRONTSIDE,
  }, scene);
  ldPlane.position.set(0, screenCenterY, -1.25);
  ldPlane.rotation.y = 0; // Quay mặt về phía Nam (-Z), đọc chữ từ trái sang phải chuẩn xác 100%
  ldPlane.parent = root;
  ldPlane.metadata = { interactive: 'leaderboard', label: 'Bảng Vinh Danh Kaia' };

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

    // Nền Dark Royal Sapphire
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1152);
    bgGrad.addColorStop(0, '#061026');
    bgGrad.addColorStop(0.5, '#0e224d');
    bgGrad.addColorStop(1, '#061026');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 2048, 1152);

    // Lưới công nghệ vàng kim
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= 2048; x += 64) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1152); ctx.stroke();
    }
    for (let y = 0; y <= 1152; y += 64) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(2048, y); ctx.stroke();
    }

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 2008, 1112);

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 4;
    ctx.strokeRect(34, 34, 1980, 1084);

    // HEADER BANNER HOÀNG GIA (Cao 125px)
    const headerGrad = ctx.createLinearGradient(0, 0, 2048, 0);
    headerGrad.addColorStop(0, '#78350f');
    headerGrad.addColorStop(0.25, '#f59e0b');
    headerGrad.addColorStop(0.5, '#fef08a');
    headerGrad.addColorStop(0.75, '#f59e0b');
    headerGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(40, 40, 1968, 115);

    ctx.font = '900 62px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText('★ BẢNG VINH DANH TOP CƯ DÂN & ĐẠI PHÚ HÀO KAIA ★', 1024, 98);
    ctx.shadowBlur = 0;

    // CỘT TRÁI: TOP 3 HUYỀN THOẠI (Width: 940px)
    const top3 = [
      {
        rank: '[1] HẠNG 1', crown: '★', name: 'ĐẠI PHÚ HÀO KAIA',
        lv: 'Cấp 50 · Dinh Thự Hoàng Gia · Thần Nông VIP', xp: '2,850,000 XP',
        border: '#f59e0b', h: 240,
      },
      {
        rank: '[2] HẠNG 2', crown: '✦', name: 'NÔNG TRẠI VUI VẺ',
        lv: 'Cấp 46 · Biệt Thự Gỗ Sang Trọng', xp: '2,180,000 XP',
        border: '#cbd5e1', h: 200,
      },
      {
        rank: '[3] HẠNG 3', crown: '◆', name: 'THẦN NÔNG XỨ SỞ',
        lv: 'Cấp 43 · Trang Trại Cây Ăn Quả', xp: '1,790,000 XP',
        border: '#d97706', h: 200,
      },
    ];

    let leftY = 185;
    top3.forEach((t) => {
      ctx.fillStyle = '#172554';
      ctx.strokeStyle = t.border;
      ctx.lineWidth = 4;
      ctx.beginPath();
      drawSafeRoundRect(ctx, 60, leftY, 940, t.h, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = t.border;
      ctx.beginPath();
      drawSafeRoundRect(ctx, 85, leftY + 18, 220, 50, 14);
      ctx.fill();

      ctx.font = '900 28px Arial, "Nunito", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(t.rank, 195, leftY + 44);

      ctx.font = '52px Arial';
      ctx.fillText(t.crown, 340, leftY + 45);

      ctx.font = '900 46px Arial, "Nunito", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(t.name, 85, leftY + (t.h === 240 ? 120 : 110));

      ctx.font = '700 28px Arial, "Nunito", sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.fillText(t.lv, 85, leftY + (t.h === 240 ? 175 : 158));

      ctx.font = '900 40px Arial, "Nunito", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'right';
      ctx.fillText(t.xp, 970, leftY + (t.h === 240 ? 175 : 158));

      leftY += t.h + 24;
    });

    // CỘT PHẢI: TOP 4 ĐẾN TOP 10 (Width: 960px)
    const top4to10 = [
      { r: '4', name: 'Hải Tặc Hồ Pha Lê', lv: 'Lv.40 · Cao Thủ Câu Cá', xp: '1,420,000 XP' },
      { r: '5', name: 'Nông Dân Chăm Chỉ', lv: 'Lv.37 · Bậc Thầy Trồng Trọt', xp: '1,150,000 XP' },
      { r: '6', name: 'Bé Mầm Đáng Yêu', lv: 'Lv.34 · Trang Trại Hoa Hồng', xp: '980,000 XP' },
      { r: '7', name: 'Vua Đua Xe Tốc Độ', lv: 'Lv.31 · Đại Gia Xe Thể Thao', xp: '820,000 XP' },
      { r: '8', name: 'Kẹo Ngọt Marshmallow', lv: 'Lv.28 · Tiệm Bánh Ngọt', xp: '690,000 XP' },
      { r: '9', name: 'Gió Mùa Thu Xanh', lv: 'Lv.25 · Nông Dân Cần Mẫn', xp: '540,000 XP' },
      { r: '10', name: 'Cư Dân Thị Trấn Mới', lv: 'Lv.22 · Tân Binh Tiềm Năng', xp: '410,000 XP' },
    ];

    let rightY = 185;
    top4to10.forEach((row) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      drawSafeRoundRect(ctx, 1030, rightY, 955, 80, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(1075, rightY + 40, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '900 28px Arial, "Nunito", sans-serif';
      ctx.fillStyle = '#0f172a';
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
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'right';
      ctx.fillText(row.xp, 1960, rightY + 42);

      rightY += 95;
    });

    // FOOTER TICKER BANNER (Cao 90px)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    drawSafeRoundRect(ctx, 60, 1010, 1928, 90, 20);
    ctx.fill();
    ctx.stroke();

    ctx.font = '800 30px Arial, "Nunito", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText('★ DỮ LIỆU ĐỒNG BỘ TRỰC TIẾP · BƯỚC LẠI GẦN VÀ NHẤN [E] HOẶC CHẠM ĐỂ MỞ BẢNG CHI TIẾT ★', 1024, 1056);

    sdtLd.update();
    ctx.restore();
    ldScreenMat.diffuseTexture = sdtLd;
    ldScreenMat.emissiveTexture = sdtLd;
  }
  ldPlane.material = ldScreenMat;

  // ===========================================================================
  // 5. ĐỈNH CỔNG KHẢI HOÀN MÔN (PORTAL CROWN & MEDALLION)
  // Biểu tượng Huy Hiệu Mặt Trời Hoàng Gia Kaia xoay nhẹ trên đỉnh (y = 12.5m)
  // ===========================================================================
  const crownRoot = new TransformNode('portal-crown-root', scene);
  crownRoot.position.set(0, 12.3, 0);
  crownRoot.parent = root;

  const pediment = MeshBuilder.CreateBox('portal-pediment-top', { width: 8.5, height: 0.6, depth: 2.4 }, scene);
  pediment.material = matLimestone;
  pediment.parent = crownRoot;

  const sunMedallion = MeshBuilder.CreateCylinder('portal-sun-medallion', { diameter: 2.2, height: 0.28, tessellation: 8 }, scene);
  sunMedallion.position.set(0, 1.2, 0);
  sunMedallion.rotation.x = Math.PI / 2;
  sunMedallion.material = matGoldTrim;
  sunMedallion.parent = crownRoot;
  shadows?.addShadowCaster(sunMedallion);

  const starCore = MeshBuilder.CreateCylinder('portal-star-core', { diameter: 1.4, height: 0.32, tessellation: 5 }, scene);
  starCore.position.set(0, 1.2, 0);
  starCore.rotation.x = Math.PI / 2;
  starCore.material = makeMat(scene, 'portal-star-ruby', '#fef08a', '#f59e0b', 0.9, 120);
  starCore.parent = crownRoot;

  // Dàn đèn rọi LED cao áp chiếu xuống 2 mặt màn hình
  [-3.8, 0, 3.8].forEach((lx, lidx) => {
    // Rọi xuống mặt Bắc (Quảng Cáo)
    const lampNorth = MeshBuilder.CreateBox(`portal-flood-n-${lidx}`, { width: 0.75, height: 0.3, depth: 0.35 }, scene);
    lampNorth.position.set(lx, 11.9, 1.35);
    lampNorth.rotation.x = 0.55;
    lampNorth.material = makeMat(scene, `portal-flood-mat-n-${lidx}`, '#fef08a', '#f59e0b', 0.9, 120);
    lampNorth.parent = root;

    // Rọi xuống mặt Nam (Bảng Vinh Danh)
    const lampSouth = MeshBuilder.CreateBox(`portal-flood-s-${lidx}`, { width: 0.75, height: 0.3, depth: 0.35 }, scene);
    lampSouth.position.set(lx, 11.9, -1.35);
    lampSouth.rotation.x = -0.55;
    lampSouth.material = makeMat(scene, `portal-flood-mat-s-${lidx}`, '#fef08a', '#f59e0b', 0.9, 120);
    lampSouth.parent = root;
  });

  return {
    root,
    adPlane,
    ldPlane,
    animate: (t) => {
      starCore.rotation.y = t * 0.002;
    },
  };
}

// =============================================================================
// BACKWARD-COMPATIBLE WRAPPERS (Nếu có module nào import hàm cũ)
// =============================================================================
export function createPlazaLeaderboardMonument(scene, parent, position, yaw = 0, shadows = null) {
  // Trả về đối tượng giữ nguyên interface cũ
  return createPlazaGrandPortal(scene, parent, position, yaw, shadows);
}

export function createPlazaEventBillboard(scene, parent, position, yaw = 0, shadows = null, adConfig = PLAZA_BILLBOARD_SPONSOR) {
  return createPlazaGrandPortal(scene, parent, position, yaw, shadows, adConfig);
}
