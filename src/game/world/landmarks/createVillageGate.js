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
  WORLD_PALETTE,
  createCozyMaterial,
  createWarmHangingLantern,
} from '../worldDesignSystem.js';

/**
 * CỔNG LÀNG TRUYỀN THỐNG MÁI NGÓI NUNG CHO 12 LÀNG NÔNG TRẠI
 * - Kiến trúc cổng tam quan đồng quê: 2 cột gỗ sồi già chân bệ đá, xà ngang kèo gỗ
 * - Mái ngói dốc chữ A Terracotta gốm đỏ nung trên đỉnh cổng làng
 * - Biển tên làng bằng gỗ sồi khắc chữ nổi viền màu nhận diện riêng của cụm làng
 * - Đèn lồng vàng ấm treo 2 bên cột cổng
 * - Cây trồng và bồn hoa đặc trưng hai bên cổng đón khách
 */
export function createVillageGate(scene, position, villageName = 'LÀNG HOA MAI', shadows = null, villageId = null, foliage = null) {
  // Đảm bảo cổng làng và cây cối lùi sâu vào lối vào làng, không đè lên tim các tuyến Quốc Lộ
  let gateX = position.x;
  let gateZ = position.z;
  let gateRot = 0;

  if (Math.abs(position.z - 86) < 6.0) {
    // QL 86: làng nằm ở phía Nam -> lùi vào vỉa hè lối vào làng z = 93.5
    gateZ = 93.5;
  } else if (Math.abs(position.z - (-234)) < 6.0) {
    // QL Bắc: lùi vào lối vào làng phía Nam z = -226.5
    gateZ = -226.5;
  } else if (Math.abs(position.z - 406) < 6.0) {
    // QL Nam: lùi vào lối vào làng phía Nam z = 413.5
    gateZ = 413.5;
  } else if (Math.abs(position.x) < 4.0 && position.z < -350) {
    // Phú Điền: lùi vào lối vào làng phía Nam z = -386.5
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
      roofColor: '#c2410c',
      treeType: 'maple',
      flowerColor: '#fde047',
      groupLabel: 'Cụm Làng Ban Mai',
      signBg: '#3d2314',
    };

  const mats = {
    woodPillar: createCozyMaterial(scene, `gate-wood-${villageId}`, WORLD_PALETTE.woodOakDark),
    woodBracket: createCozyMaterial(scene, `gate-bracket-${villageId}`, WORLD_PALETTE.woodOakWarm),
    stoneBase: createCozyMaterial(scene, `gate-stone-${villageId}`, WORLD_PALETTE.stoneFoundation),
    roofTile: createCozyMaterial(scene, `gate-roof-${villageId}`, theme.roofColor || WORLD_PALETTE.roofTerracotta),
    roofRidge: createCozyMaterial(scene, `gate-ridge-${villageId}`, WORLD_PALETTE.roofRidge),
    trimGold: createCozyMaterial(scene, `gate-trim-${villageId}`, theme.accentColor, theme.accentColor, 0.4),
  };

  const halfSpan = 6.4; // Thông thủy 12.8m, thoải mái cho đường làng 5.5m và 2 lề đường
  const postH = 5.2;

  // 1. Hai cột trụ gỗ chân đế đá hai bên cổng
  [-halfSpan, halfSpan].forEach((px, idx) => {
    // Chân đế đá cuội đẽo mộc
    const base = MeshBuilder.CreateCylinder(`gate-stone-base-${idx}`, { diameter: 1.1, height: 0.8, tessellation: 16 }, scene);
    base.position.set(px, 0.4, 0);
    base.material = mats.stoneBase;
    base.parent = root;
    base.receiveShadows = true;
    shadows?.addShadowCaster(base);

    // Thân cột gỗ sồi tròn
    const post = MeshBuilder.CreateCylinder(`gate-timber-post-${idx}`, { diameter: 0.65, height: postH, tessellation: 16 }, scene);
    post.position.set(px, postH / 2 + 0.4, 0);
    post.material = mats.woodPillar;
    post.parent = root;
    post.receiveShadows = true;
    shadows?.addShadowCaster(post);

    // Mũ chụp đầu cột có chỉ màu nhấn riêng của cụm làng
    const cap = MeshBuilder.CreateSphere(`gate-post-cap-${idx}`, { diameter: 0.95, segments: 12 }, scene);
    cap.position.set(px, postH + 0.5, 0);
    cap.material = mats.trimGold;
    cap.parent = root;

    // Kèo gỗ chống xéo chịu lực
    const brace = MeshBuilder.CreateBox(`gate-brace-${idx}`, { width: 0.22, height: 1.4, depth: 0.22 }, scene);
    brace.position.set(px + (px > 0 ? -0.55 : 0.55), postH - 0.2, 0);
    brace.rotation.z = px > 0 ? 0.65 : -0.65;
    brace.material = mats.woodBracket;
    brace.parent = root;

    // Đèn lồng vàng ấm treo bên dưới xà đón
    createWarmHangingLantern(scene, new Vector3(px + (px > 0 ? -0.8 : 0.8), postH - 0.2, 0), root, shadows);
  });

  // 2. Hệ xà ngang đôi liên kết
  const beamY = postH + 0.15;
  const beam = MeshBuilder.CreateBox('village-gate-beam', { width: halfSpan * 2 + 1.8, height: 0.6, depth: 0.7 }, scene);
  beam.position.set(0, beamY, 0);
  beam.material = mats.woodPillar;
  beam.parent = root;
  shadows?.addShadowCaster(beam);

  // 3. Mái ngói nung Terracotta truyền thống trên đỉnh cổng làng
  const roofW = halfSpan * 2 + 3.2;
  const roofD = 2.4;
  const roofH = 1.4;
  const roofBaseY = beamY + 0.3;

  const roofL = MeshBuilder.CreateBox('gate-roof-slope-l', { width: roofW / 2 + 0.4, depth: roofD, height: 0.18 }, scene);
  roofL.position.set(-roofW * 0.25, roofBaseY + roofH * 0.45, 0);
  roofL.rotation.z = 0.52;
  roofL.material = mats.roofTile;
  roofL.parent = root;
  shadows?.addShadowCaster(roofL);

  const roofR = MeshBuilder.CreateBox('gate-roof-slope-r', { width: roofW / 2 + 0.4, depth: roofD, height: 0.18 }, scene);
  roofR.position.set(roofW * 0.25, roofBaseY + roofH * 0.45, 0);
  roofR.rotation.z = -0.52;
  roofR.material = mats.roofTile;
  roofR.parent = root;
  shadows?.addShadowCaster(roofR);

  const ridge = MeshBuilder.CreateBox('gate-roof-ridge', { width: roofW + 0.4, depth: 0.35, height: 0.22 }, scene);
  ridge.position.set(0, roofBaseY + roofH + 0.05, 0);
  ridge.material = mats.roofRidge;
  ridge.parent = root;

  // 4. Bảng tên làng bằng gỗ sồi chạm chữ nổi viền vàng hổ phách
  // 4. Bảng tên làng sơn son thếp vàng truyền thống Việt Nam (2048x440 Ultra High-Res Sharp Texture)
  const signScale = scene.metadata?.mobile ? 0.5 : 1;
  const texture = new DynamicTexture(`village-gate-sign-${villageId || villageName}`, { width: 2048 * signScale, height: 440 * signScale }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  texture.anisotropicFilteringLevel = 16;
  const signMat = new StandardMaterial(`village-gate-sign-mat-${villageId}`, scene);
  signMat.diffuseTexture = texture;
  signMat.emissiveTexture = texture;
  signMat.emissiveColor = new Color3(0.5, 0.5, 0.5); // Tự phát sáng 50% giúp chữ luôn rực rỡ, sắc nét rõ mồn một bất kể ngày đêm
  signMat.specularColor = Color3.Black();
  signMat.backFaceCulling = false;

  // Khung gỗ sồi đỡ bảng tên
  const signFrame = MeshBuilder.CreateBox('village-gate-sign-frame', { width: 9.0, height: 2.0, depth: 0.18 }, scene);
  signFrame.position.set(0, beamY - 0.75, 0);
  signFrame.material = mats.woodPillar;
  signFrame.parent = root;

  // Mặt trước hướng ra đại lộ
  const sign = MeshBuilder.CreatePlane('village-gate-name-sign', { width: 8.8, height: 1.8 }, scene);
  sign.position.set(0, beamY - 0.75, -0.1);
  sign.material = signMat;
  sign.parent = root;

  // Mặt sau hướng về phía trong làng
  const signBack = MeshBuilder.CreatePlane('village-gate-name-sign-back', { width: 8.8, height: 1.8 }, scene);
  signBack.position.set(0, beamY - 0.75, 0.1);
  signBack.rotation.y = Math.PI;
  signBack.material = signMat;
  signBack.parent = root;

  const renderName = name => {
    const ctx = texture.getContext();
    ctx.setTransform(signScale, 0, 0, signScale, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, 2048, 440);

    // 1. Nền gỗ lim/gỗ sồi sẫm màu sang trọng (Aged Timber Lacquer), tạo độ tương phản đỉnh cao
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 440);
    bgGrad.addColorStop(0, '#2e170d');
    bgGrad.addColorStop(0.5, '#190d07');
    bgGrad.addColorStop(1, '#25130a');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(18, 18, 2012, 404, 46);
    ctx.fill();

    // 2. Viền ngoài thếp vàng / chỉ phào truyền thống
    const accent = theme.accentColor || '#f59e0b';
    ctx.strokeStyle = accent;
    ctx.lineWidth = 18;
    ctx.stroke();

    // 3. Viền chỉ trong tinh xảo
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(44, 44, 1960, 352, 30);
    ctx.stroke();

    // 4. Họa tiết hoa văn góc (Corner motifs)
    const corners = [
      [68, 68], [1980, 68], [68, 372], [1980, 372]
    ];
    ctx.fillStyle = '#fde047';
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. TÊN LÀNG CHÍNH: Chữ khắc thếp vàng nổi 3D siêu sắc nét (Gold Leaf 3D Emboss)
    const villageTitle = String(name || 'LÀNG NÔNG TRẠI').toUpperCase();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 138px "Baloo 2", "Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    const textY = 182;
    const centerX = 1024;

    // Lớp đổ bóng khắc chìm (Deep Carved Shadow)
    ctx.fillStyle = '#060301';
    ctx.fillText(villageTitle, centerX, textY + 7);
    ctx.fillText(villageTitle, centerX + 3, textY + 6);

    // Lớp viền đen định hình nét chữ cực kỳ sắc sảo (Bold Definition Outline)
    ctx.strokeStyle = '#0a0502';
    ctx.lineWidth = 18;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(villageTitle, centerX, textY);

    // Lớp mặt chữ: Thếp vàng lấp lánh (Brilliant Gold Leaf Gradient)
    const goldGrad = ctx.createLinearGradient(0, textY - 70, 0, textY + 70);
    goldGrad.addColorStop(0, '#ffffff');    // Vệt sáng lấp lánh trên đỉnh
    goldGrad.addColorStop(0.28, '#fef08a'); // Vàng chanh rực rỡ
    goldGrad.addColorStop(0.68, '#f59e0b'); // Vàng hổ phách
    goldGrad.addColorStop(1, '#b45309');    // Đồng thau ấm
    ctx.fillStyle = goldGrad;
    ctx.fillText(villageTitle, centerX, textY);

    // 6. TÊN CỤM LÀNG (SUBTITLE): Sắc sảo, sáng rõ
    const subTitle = String(theme.groupLabel || 'CỤM LÀNG BAN MAI').toUpperCase();
    ctx.font = '800 48px "Nunito", "Baloo 2", "Segoe UI", sans-serif';
    const subY = 324;

    // Viền đen chữ phụ
    ctx.strokeStyle = '#060301';
    ctx.lineWidth = 12;
    ctx.lineJoin = 'round';
    ctx.strokeText(subTitle, centerX, subY);

    // Mặt chữ phụ màu vàng óng nổi bật
    ctx.fillStyle = '#fde047';
    ctx.fillText(subTitle, centerX, subY);

    texture.update();
  };
  renderName(villageName);

  // 5. Cây trồng & bồn hoa đặc trưng theo cụm làng hai bên cổng đón khách (ngoài vỉa hè, lùi sâu vào khuôn viên làng)
  if (foliage) {
    const treeX1 = gateX - halfSpan - 2.8;
    const treeX2 = gateX + halfSpan + 2.8;
    const treeZOffset = 4.0;
    const treeZ = gateZ + treeZOffset;

    if (theme.treeType === 'maple') {
      foliage.createGoldenMaple(treeX1, treeZ, 1.25);
      foliage.createGoldenMaple(treeX2, treeZ, 1.2);
    } else if (theme.treeType === 'sakura') {
      foliage.createSakuraTree(treeX1, treeZ, 1.2);
      foliage.createSakuraTree(treeX2, treeZ, 1.25);
    } else if (theme.treeType === 'pine') {
      foliage.createAlpinePine(treeX1, treeZ, 1.3);
      foliage.createAlpinePine(treeX2, treeZ, 1.35);
    } else {
      foliage.createCloudTree(treeX1, treeZ, 1.25);
      foliage.createCloudTree(treeX2, treeZ, 1.2);
    }

    foliage.createFlowerPatch(treeX1, treeZ + 1.5, 8, 2.0);
    foliage.createFlowerPatch(treeX2, treeZ + 1.5, 8, 2.0);
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
