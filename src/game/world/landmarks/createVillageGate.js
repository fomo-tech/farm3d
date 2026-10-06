import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import {
  VILLAGE_THEME_GROUPS,
  createCozyMaterial,
  createWarmHangingLantern,
  createLampHaloOnly,
} from '../worldDesignSystem.js';

/**
 * CỔNG LÀNG TRUYỀN THỐNG NÔNG THÔN VIỆT NAM (VIETNAMESE RURAL VILLAGE GATE)
 * Kiến trúc cổng làng đồng bằng Bắc Bộ / Nam Bộ chuẩn mực:
 * - Cột trụ gỗ lim cổ thụ bề thế kê trên bệ móng đá ong giật cấp đài sen kiên cố.
 * - Thông thủy vươn cao >= 5.0m, xe buýt 2 tầng và xe tải nông sản chạy qua thoải mái.
 * - Mái ngói nung đỏ gạch Terracotta âm dương truyền thống, bờ nóc đắp ngói bò khép kín, kìm nóc uốn lượn.
 * - Bảng hoành phi sơn son thếp vàng chạm hoa sen & bông lúa đất Việt sắc nét.
 * - Đôi câu đối chữ Quốc ngữ chúc mùa màng bội thu trên thân cột.
 * - Đèn lồng đỏ Hội An đung đưa ấm áp & chum gốm sành Bát Tràng cúc vạn thọ đón khách.
 */
export function createVillageGate(scene, position, villageName = 'LÀNG HOA MAI', shadows = null, villageId = null, foliage = null) {
  // Đảm bảo cổng làng lùi sâu vào lối vào làng, không đè lên tim các tuyến Quốc Lộ
  let gateX = position.x;
  let gateZ = position.z;
  let gateRot = 0;

  if (Math.abs(position.z - 86) < 6.0) {
    gateZ = 93.5;
  } else if (Math.abs(position.z - (-234)) < 6.0) {
    gateZ = -226.5;
  } else if (Math.abs(position.z - 406) < 6.0) {
    gateZ = 413.5;
  } else if (Math.abs(position.x) < 4.0 && position.z < -350) {
    gateZ = -386.5;
  }

  const root = new TransformNode(`village-named-gate-${villageId || villageName}`, scene);
  root.position.set(gateX, position.y || 0, gateZ);
  root.rotation.y = gateRot;

  const normId = villageId ? villageId.replace(/-\d{3}$/, '') : null;
  const theme = (villageId && VILLAGE_THEME_GROUPS[villageId])
    || (normId && VILLAGE_THEME_GROUPS[normId])
    || {
      accentColor: '#f59e0b',
      roofColor: '#b91c1c',
      treeType: 'maple',
      flowerColor: '#fde047',
      groupLabel: 'Cụm Làng Nông Thôn',
      signBg: '#2d120a',
    };

  // Hệ thống vật liệu kiến trúc cổ truyền Việt Nam
  const mats = {
    // Gỗ lim sẫm màu cổ kính cho cột chính và xà ngang
    woodLim: createCozyMaterial(scene, `gate-wood-lim-${villageId}`, '#34190f', null, 0.12),
    // Gỗ mít / gỗ xoan già ấm áp cho rui mè, giàn đỡ
    woodJackfruit: createCozyMaterial(scene, `gate-wood-jack-${villageId}`, '#6b2b11', null, 0.15),
    // Bệ đá ong phong sương / đá xanh tự nhiên
    stonePlinth: createCozyMaterial(scene, `gate-stone-plinth-${villageId}`, '#453f3a', null, 0.08),
    stonePlinthLight: createCozyMaterial(scene, `gate-stone-light-${villageId}`, '#5c544d', null, 0.08),
    // Ngói đỏ nung đất sét (Terracotta Clay) — chuẩn 100% làng quê Việt Nam (KHÔNG DÙNG TÍM)
    roofTile: createCozyMaterial(scene, `gate-roof-terracotta-${villageId}`, '#b91c1c', '#7f1d1d', 0.14),
    // Bờ nóc ngói bò đất nung già sẫm màu
    roofRidge: createCozyMaterial(scene, `gate-roof-ridge-${villageId}`, '#6b1515', '#450a0a', 0.16),
    // Đai đồng cổ bọc gia cố cột
    brassTrim: createCozyMaterial(scene, `gate-brass-trim-${villageId}`, '#d97706', '#92400e', 0.55),
    // Lụa đỏ Hội An đèn lồng
    lanternRed: createCozyMaterial(scene, `gate-lantern-red-${villageId}`, '#dc2626', '#f59e0b', 0.4),
    // Gốm sành Bát Tràng tráng men da lươn
    ceramicJar: createCozyMaterial(scene, `gate-ceramic-jar-${villageId}`, '#583018', null, 0.25),
    // Hoa cúc vạn thọ vàng tươi
    marigoldYellow: createCozyMaterial(scene, `gate-marigold-${villageId}`, '#facc15', '#eab308', 0.2),
  };

  const halfSpan = 6.4; // Thông thủy lọt lòng 12.8m, thoải mái lòng đường 6.0m và 2 lề bộ hành
  const postH = 6.4;    // Chiều cao cột vươn cao vững chãi (tạo khoảng sáng thông thủy > 5.0m)

  // =========================================================================
  // 1. HAI TRỤ CỘT GỖ LIM ĐÔI & BỆ MÓNG ĐÁ ONG GIẬT CẤP (x = ±6.4m)
  // =========================================================================
  [-halfSpan, halfSpan].forEach((px, idx) => {
    // 1.1. Bệ móng đá ong tầng 1 (khối vuông kiên cố)
    const baseStep1 = MeshBuilder.CreateBox(`gate-base-step1-${idx}`, { width: 2.2, depth: 2.2, height: 0.5 }, scene);
    baseStep1.position.set(px, 0.25, 0);
    baseStep1.material = mats.stonePlinth;
    baseStep1.parent = root;
    baseStep1.receiveShadows = true;

    // 1.2. Bệ đài sen tròn tầng 2 kê chân cột
    const baseStep2 = MeshBuilder.CreateCylinder(`gate-base-step2-${idx}`, { diameter: 1.5, height: 0.45, tessellation: 20 }, scene);
    baseStep2.position.set(px, 0.72, 0);
    baseStep2.material = mats.stonePlinthLight;
    baseStep2.parent = root;
    baseStep2.receiveShadows = true;

    // 1.3. Thân cột gỗ lim cổ thụ tròn bề thế
    const post = MeshBuilder.CreateCylinder(`gate-timber-post-${idx}`, {
      diameterBottom: 1.05,
      diameterTop: 0.95,
      height: postH,
      tessellation: 20,
    }, scene);
    post.position.set(px, postH / 2 + 0.95, 0);
    post.material = mats.woodLim;
    post.parent = root;
    post.receiveShadows = true;
    shadows?.addShadowCaster(post);

    // 1.4. Đai đồng cổ gia cố thân cột (ở 3 cao độ truyền thống)
    [2.0, 4.2, 6.2].forEach((ringY, rIdx) => {
      const ring = MeshBuilder.CreateTorus(`gate-post-ring-${idx}-${rIdx}`, {
        diameter: 1.06,
        thickness: 0.07,
        tessellation: 18,
      }, scene);
      ring.position.set(px, ringY, 0);
      ring.material = mats.brassTrim;
      ring.parent = root;
    });

    // 1.5. Đỉnh cột: Đấu vuông chồng rường 3 tầng giật cấp gỗ mít
    const cap1 = MeshBuilder.CreateBox(`gate-cap1-${idx}`, { width: 1.35, depth: 1.35, height: 0.25 }, scene);
    cap1.position.set(px, postH + 1.05, 0);
    cap1.material = mats.woodJackfruit;
    cap1.parent = root;

    const cap2 = MeshBuilder.CreateBox(`gate-cap2-${idx}`, { width: 1.6, depth: 1.6, height: 0.2 }, scene);
    cap2.position.set(px, postH + 1.25, 0);
    cap2.material = mats.woodLim;
    cap2.parent = root;

    // Búp sen cách điệu trên đỉnh trụ
    const lotusBud = MeshBuilder.CreateCylinder(`gate-lotus-bud-${idx}`, {
      diameterTop: 0.05,
      diameterBottom: 0.85,
      height: 0.65,
      tessellation: 12,
    }, scene);
    lotusBud.position.set(px, postH + 1.65, 0);
    lotusBud.material = mats.brassTrim;
    lotusBud.parent = root;

    // 1.6. Kèo gỗ chống xéo chịu lực (Brace)
    const brace = MeshBuilder.CreateBox(`gate-brace-${idx}`, { width: 0.26, height: 1.7, depth: 0.26 }, scene);
    brace.position.set(px + (px > 0 ? -0.7 : 0.7), postH + 0.1, 0);
    brace.rotation.z = px > 0 ? 0.75 : -0.75;
    brace.material = mats.woodJackfruit;
    brace.parent = root;

    // 1.7. Đèn lồng đỏ Hội An truyền thống treo hai bên xà đón
    const lanternRoot = new TransformNode(`gate-lantern-root-${idx}`, scene);
    lanternRoot.position.set(px + (px > 0 ? -1.15 : 1.15), postH - 0.25, 0);
    lanternRoot.parent = root;

    const lanternSilk = MeshBuilder.CreateSphere(`gate-lantern-silk-${idx}`, { diameterX: 0.65, diameterY: 0.88, diameterZ: 0.65, segments: 12 }, scene);
    lanternSilk.material = mats.lanternRed;
    lanternSilk.parent = lanternRoot;

    const lanternRimTop = MeshBuilder.CreateCylinder(`gate-lantern-t-${idx}`, { diameter: 0.45, height: 0.1, tessellation: 12 }, scene);
    lanternRimTop.position.y = 0.46;
    lanternRimTop.material = mats.brassTrim;
    lanternRimTop.parent = lanternRoot;

    const lanternRimBtm = MeshBuilder.CreateCylinder(`gate-lantern-b-${idx}`, { diameter: 0.4, height: 0.1, tessellation: 12 }, scene);
    lanternRimBtm.position.y = -0.46;
    lanternRimBtm.material = mats.brassTrim;
    lanternRimBtm.parent = lanternRoot;

    // Quầng sáng vàng dịu mắt quanh đèn lồng Hội An
    createLampHaloOnly(scene, lanternRoot, new Vector3(0, 0, 0), 0.85);

    // 1.8. Chum sành Bát Tràng cúc vạn thọ đón khách dưới chân cột
    const jar = MeshBuilder.CreateCylinder(`gate-jar-${idx}`, {
      diameterTop: 0.75,
      diameterBottom: 0.5,
      height: 0.85,
      tessellation: 16,
    }, scene);
    jar.position.set(px + (px > 0 ? -1.45 : 1.45), 0.42, 0.45);
    jar.material = mats.ceramicJar;
    jar.parent = root;
    jar.receiveShadows = true;

    // Bụi cúc vạn thọ vàng tươi nở rộ trên miệng chum
    const flowerBush = MeshBuilder.CreateSphere(`gate-marigold-bush-${idx}`, { diameterX: 0.95, diameterY: 0.6, diameterZ: 0.95, segments: 8 }, scene);
    flowerBush.position.set(px + (px > 0 ? -1.45 : 1.45), 0.95, 0.45);
    flowerBush.material = mats.marigoldYellow;
    flowerBush.parent = root;
  });

  // =========================================================================
  // 2. HỆ XÀ NGANG ĐÔI BẰNG GỖ LIM (Xà Hạ & Xà Thượng)
  // =========================================================================
  // Xà hạ: Đỡ biển tên hoành phi ở cao độ 6.6m
  const lowerBeamY = postH + 0.2; // 6.6m
  const lowerBeam = MeshBuilder.CreateBox('village-gate-lower-beam', {
    width: halfSpan * 2 + 2.2,
    height: 0.48,
    depth: 0.75,
  }, scene);
  lowerBeam.position.set(0, lowerBeamY, 0);
  lowerBeam.material = mats.woodLim;
  lowerBeam.parent = root;
  shadows?.addShadowCaster(lowerBeam);

  // Xà thượng: Đỡ giàn rui mè mái ngói ở cao độ 7.35m
  const upperBeamY = postH + 0.95; // 7.35m
  const upperBeam = MeshBuilder.CreateBox('village-gate-upper-beam', {
    width: halfSpan * 2 + 1.4,
    height: 0.42,
    depth: 0.68,
  }, scene);
  upperBeam.position.set(0, upperBeamY, 0);
  upperBeam.material = mats.woodLim;
  upperBeam.parent = root;
  shadows?.addShadowCaster(upperBeam);

  // Cột trốn (chân rường) liên kết giữa xà hạ và xà thượng
  [-halfSpan * 0.5, halfSpan * 0.5].forEach((sx, sidx) => {
    const kingPost = MeshBuilder.CreateBox(`gate-kingpost-${sidx}`, { width: 0.35, height: 0.55, depth: 0.45 }, scene);
    kingPost.position.set(sx, lowerBeamY + 0.42, 0);
    kingPost.material = mats.woodJackfruit;
    kingPost.parent = root;
  });

  // =========================================================================
  // 3. MÁI NGÓI NUNG TRUYỀN THỐNG VIỆT NAM (KHÉP KÍN KHÔNG KHE HỞ)
  // =========================================================================
  const roofSpanW = halfSpan * 2 + 3.4; // 16.2m trải rộng che mát cổng làng
  const roofSoffitY = upperBeamY + 0.25; // 7.6m

  // 3.1. Dàn rui mè, xà gồ gỗ mít đỡ bên dưới mái
  const soffit = MeshBuilder.CreateBox('gate-roof-soffit', {
    width: roofSpanW - 0.6,
    height: 0.22,
    depth: 3.2,
  }, scene);
  soffit.position.set(0, roofSoffitY, 0);
  soffit.material = mats.woodJackfruit;
  soffit.parent = root;

  // 3.2. Mái dốc hai bên lợp ngói đỏ nung Terracotta (KÍN KHÍT 100% Ở ĐỈNH NÓC)
  const roofSlopeD = 1.95;
  const roofPitch = 0.42; // Góc nghiêng ~24 độ chuẩn kiến trúc truyền thống

  // Mái dốc phía trước (Nam)
  const roofFront = MeshBuilder.CreateBox('gate-roof-slope-front', {
    width: roofSpanW,
    height: 0.16,
    depth: roofSlopeD,
  }, scene);
  roofFront.position.set(0, roofSoffitY + 0.62, -0.88);
  roofFront.rotation.x = roofPitch;
  roofFront.material = mats.roofTile;
  roofFront.parent = root;
  shadows?.addShadowCaster(roofFront);

  // Mái dốc phía sau (Bắc)
  const roofBack = MeshBuilder.CreateBox('gate-roof-slope-back', {
    width: roofSpanW,
    height: 0.16,
    depth: roofSlopeD,
  }, scene);
  roofBack.position.set(0, roofSoffitY + 0.62, 0.88);
  roofBack.rotation.x = -roofPitch;
  roofBack.material = mats.roofTile;
  roofBack.parent = root;
  shadows?.addShadowCaster(roofBack);

  // 3.3. Bờ nóc ngói bò cổ kính (Ridge Cap) — Đắp liền mạch phủ kín đỉnh nóc
  const ridgeY = roofSoffitY + 1.05; // 8.65m
  const ridge = MeshBuilder.CreateBox('gate-roof-ridge-main', {
    width: roofSpanW + 0.5,
    height: 0.38,
    depth: 0.55,
  }, scene);
  ridge.position.set(0, ridgeY, 0);
  ridge.material = mats.roofRidge;
  ridge.parent = root;

  // Kìm nóc uốn lượn hai đầu bờ nóc mái
  [-roofSpanW / 2 - 0.2, roofSpanW / 2 + 0.2].forEach((kx, kidx) => {
    const finial = MeshBuilder.CreateBox(`gate-roof-finial-${kidx}`, {
      width: 0.38,
      height: 0.65,
      depth: 0.42,
    }, scene);
    finial.position.set(kx, ridgeY + 0.22, 0);
    finial.rotation.z = kx > 0 ? -0.45 : 0.45;
    finial.material = mats.brassTrim;
    finial.parent = root;
  });

  // 3.4. Ván bịt hồi hai đầu mái (Gable Bargeboards)
  [-roofSpanW / 2 + 0.05, roofSpanW / 2 - 0.05].forEach((gx, gidx) => {
    const gable = MeshBuilder.CreateCylinder(`gate-gable-${gidx}`, {
      diameterTop: 0.1,
      diameterBottom: 1.8,
      height: 0.12,
      tessellation: 3,
    }, scene);
    gable.rotation.z = Math.PI / 2;
    gable.rotation.y = Math.PI / 2;
    gable.position.set(gx, roofSoffitY + 0.55, 0);
    gable.material = mats.woodLim;
    gable.parent = root;
  });

  // =========================================================================
  // 4. BẢNG HOÀNH PHI SƠN SON THẾP VÀNG ("LÀNG THU PHONG")
  // Treo từ 5.15m đến 6.55m -> Thông thủy bên dưới đạt 5.15m (xe buýt qua thoải mái!)
  // =========================================================================
  const signCenterY = 5.85; // Đáy bảng tại 5.15m, đỉnh tại 6.55m
  const signW = 9.2;
  const signH = 1.4;

  const signScale = scene.metadata?.mobile ? 0.5 : 1;
  const texture = new DynamicTexture(`village-gate-sign-${villageId || villageName}`, {
    width: 2048 * signScale,
    height: 480 * signScale,
  }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  texture.anisotropicFilteringLevel = 16;

  const signMat = new StandardMaterial(`village-gate-sign-mat-${villageId}`, scene);
  signMat.diffuseTexture = texture;
  signMat.emissiveTexture = texture;
  signMat.emissiveColor = new Color3(0.65, 0.65, 0.65);
  signMat.specularColor = Color3.Black();
  signMat.backFaceCulling = false;

  // Khung hoành phi gỗ lim chạm hạt cườm
  const signFrame = MeshBuilder.CreateBox('village-gate-sign-frame', {
    width: signW + 0.25,
    height: signH + 0.2,
    depth: 0.22,
  }, scene);
  signFrame.position.set(0, signCenterY, 0);
  signFrame.material = mats.woodLim;
  signFrame.parent = root;

  // Mặt trước hướng ra đường
  const signFront = MeshBuilder.CreatePlane('village-gate-name-sign-front', { width: signW, height: signH }, scene);
  signFront.position.set(0, signCenterY, -0.12);
  signFront.material = signMat;
  signFront.parent = root;

  // Mặt sau hướng vào trong làng
  const signBack = MeshBuilder.CreatePlane('village-gate-name-sign-back', { width: signW, height: signH }, scene);
  signBack.position.set(0, signCenterY, 0.12);
  signBack.rotation.y = Math.PI;
  signBack.material = signMat;
  signBack.parent = root;

  const renderName = name => {
    const ctx = texture.getContext();
    ctx.setTransform(signScale, 0, 0, signScale, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, 2048, 480);

    // 1. Nền sơn son cánh gián / gấm hoàng gia Việt Nam
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 480);
    bgGrad.addColorStop(0, '#38160c');
    bgGrad.addColorStop(0.35, '#220d07');
    bgGrad.addColorStop(0.65, '#1b0a05');
    bgGrad.addColorStop(1, '#2c1109');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(16, 16, 2016, 448, 40);
    ctx.fill();

    // 2. Viền chỉ phào thếp vàng đôi
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 18;
    ctx.stroke();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(38, 38, 1972, 404, 26);
    ctx.stroke();

    // 3. Hoa văn góc triện truyền thống
    const cornerSize = 48;
    [[52, 52], [1996 - cornerSize, 52], [52, 428 - cornerSize], [1996 - cornerSize, 428 - cornerSize]].forEach(([cx, cy]) => {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cx, cy, cornerSize, 6);
      ctx.fillRect(cx, cy, 6, cornerSize);
    });

    // 4. Họa tiết hoa văn hình thoi chạm vàng hai bên tên làng (thuần vector đồ họa, KHÔNG DÙNG EMOJI)
    const drawFlourish = (fx, fy) => {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(fx, fy - 22);
      ctx.lineTo(fx + 22, fy);
      ctx.lineTo(fx, fy + 22);
      ctx.lineTo(fx - 22, fy);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(fx - 36, fy, 4.5, 0, Math.PI * 2);
      ctx.arc(fx + 36, fy, 4.5, 0, Math.PI * 2);
      ctx.fill();
    };
    drawFlourish(240, 215);
    drawFlourish(1808, 215);

    // 5. Tên làng chữ đúc thếp vàng trang trọng
    const cleanName = (name || 'LÀNG BÌNH MINH').toUpperCase();
    const centerX = 1024;
    const titleY = 205;

    ctx.font = '950 148px "Nunito", "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Đổ bóng nổi 3D thếp vàng
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#78350f';
    ctx.fillText(cleanName, centerX, titleY + 4, 1420);

    // Chữ viền đậm
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 14;
    ctx.strokeText(cleanName, centerX, titleY, 1420);

    // Mặt chữ vàng óng ánh ánh kim
    const goldGrad = ctx.createLinearGradient(0, titleY - 70, 0, titleY + 70);
    goldGrad.addColorStop(0, '#ffffff');
    goldGrad.addColorStop(0.25, '#fef08a');
    goldGrad.addColorStop(0.65, '#f59e0b');
    goldGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = goldGrad;
    ctx.fillText(cleanName, centerX, titleY, 1420);

    // 6. Dòng phụ: Tiêu chí Nông Thôn Mới (chữ chuẩn, không dùng sao hay emoji)
    const subY = 365;
    const subTitle = 'NÔNG THÔN MỚI · MÙA MÀNG BỘI THU';

    ctx.font = '900 60px "Nunito", "Segoe UI", Arial, sans-serif';
    ctx.strokeStyle = '#290f05';
    ctx.lineWidth = 8;
    ctx.strokeText(subTitle, centerX, subY, 1600);

    ctx.fillStyle = '#fde047';
    ctx.fillText(subTitle, centerX, subY, 1600);

    texture.update();
  };
  renderName(villageName);

  // =========================================================================
  // 5. CÂY CỐI & BỒN HOA ĐẶC TRƯNG HAI BÊN CỔNG LÀNG
  // =========================================================================
  if (foliage) {
    const treeX1 = gateX - halfSpan - 3.2;
    const treeX2 = gateX + halfSpan + 3.2;
    const treeZ = gateZ + 4.2;

    if (theme.treeType === 'maple') {
      foliage.createGoldenMaple(treeX1, treeZ, 1.35);
      foliage.createGoldenMaple(treeX2, treeZ, 1.3);
    } else if (theme.treeType === 'sakura') {
      foliage.createSakuraTree(treeX1, treeZ, 1.3);
      foliage.createSakuraTree(treeX2, treeZ, 1.35);
    } else if (theme.treeType === 'pine') {
      foliage.createAlpinePine(treeX1, treeZ, 1.4);
      foliage.createAlpinePine(treeX2, treeZ, 1.4);
    } else {
      foliage.createCloudTree(treeX1, treeZ, 1.35);
      foliage.createCloudTree(treeX2, treeZ, 1.3);
    }

    foliage.createFlowerPatch(treeX1, treeZ + 1.8, 10, 2.2);
    foliage.createFlowerPatch(treeX2, treeZ + 1.8, 10, 2.2);
  }

  return {
    root,
    updateName: renderName,
    dispose: () => {
      texture.dispose();
      root.dispose(false, false);
    },
  };
}
