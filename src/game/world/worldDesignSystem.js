import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { LANDSCAPE_ART as ART } from './LandscapeArt.js';

/**
 * WORLD ART BIBLE & DESIGN SYSTEM
 * Bộ quy chuẩn vật liệu, màu sắc, kiểu mái và nhận diện không gian cho Farm3D.
 * Định hướng: Phong cách đồng quê ấm cúng (Warm Countryside / Ghibli Aesthetic),
 * loại bỏ hoàn toàn các khối hộp neon lòe loẹt, mang lại không gian trong lành, mộc mạc và sang trọng.
 */

export const WORLD_PALETTE = Object.freeze({
  // Shared outdoor colors: bright toy-town surfaces with warm farm accents.
  skyDay: '#7bcdf1',
  grassLight: ART.grassLight,
  grassMid: ART.grass,
  grassShade: ART.grassMid,
  roadWarm: ART.pathLight,
  roadStone: ART.path,
  sidewalkCream: '#C9B58B',
  waterShallow: ART.shallows,
  waterDeep: ART.water,
  // 1. Tường & Bệ móng
  wallPlaster: '#f1e8d8',       // Vôi kem vẫn rõ chi tiết dưới nắng mạnh
  wallPlasterWarm: '#f7ebd2',   // Vôi vàng nhạt nắng sớm
  wallTimberStucco: '#fef08a',  // Vữa trát vàng ấm
  stoneFoundation: '#78716c',   // Đá cuội móng kiên cố
  stonePlinth: '#a8a29e',       // Đá granit xám ấm

  // 2. Mái nhà & Hiên
  roofTerracotta: '#f28a65',    // Mái cam san hô tươi, nổi bật trên tường kem
  roofRidge: '#9a3412',         // Sống ngói gốm sẫm màu
  roofWarmTile: '#b45309',      // Ngói gốm đất nung vàng hổ phách
  roofThatch: '#d97706',        // Mái rạ vàng quê hương
  awningCaramel: '#d97706',     // Mái che vải bạt sọc caramel

  // 3. Gỗ cấu trúc & Trang trí
  woodOakDark: '#5c381e',       // Gỗ sồi nâu sẫm chịu lực
  woodOakWarm: '#78350f',       // Gỗ sồi đỏ ấm áp
  woodTeak: '#92400e',          // Gỗ tếch bóng mộc
  woodFenceWhite: '#f8fafc',    // Hàng rào gỗ sơn trắng ngà
  woodPlankWeathered: '#8d6e53',// Ván gỗ bến nước mộc mạc

  // 4. Đường dạo & Quảng trường
  plazaMarbleWhite: '#ebe7df',   // Đá sáng nhưng không cháy trắng
  plazaMarbleCream: '#e9d6b7',   // Đá lát viền kem ngà hoa cúc
  pathCobblestone: '#ebd9bd',   // Lối đi sỏi nhẵn màu kem bơ
  roadHoneyEarth: '#d5aa96',    // Đất nện hồng cát sáng
  curbStone: '#e7e5e4',         // Viền đá bó vỉa hè

  // 5. Đèn & Ánh sáng ấm
  lanternWarmGold: '#fbbf24',   // Đèn lồng vàng ấm
  lanternAmber: '#f59e0b',      // Ánh sáng hổ phách ấm cúng
  lanternCore: '#fef08a',       // Tim đèn phát sáng dịu mắt

  // 6. Cây cỏ & Tự nhiên
  foliageOakGreen: '#61965b',   // Tán lá xanh dịu, tách khỏi cỏ nhưng không neon
  foliageMapleGold: '#f59e0b',  // Lá phong vàng rực rỡ
  foliageSakuraPink: '#f472b6', // Hoa anh đào / mộc lan
  waterCrystalBlue: '#61d5e8',  // Nước hồ trong vắt xanh ngọc lam
  waterDeepBlue: '#258fc6',     // Nước hồ sâu
});

/**
 * Phân chia 12 làng thành 6 nhóm nhận diện thị giác độc bản
 * Giữ nguyên 100% cấu trúc 24 lô/làng (tổng 288 lô) của server authoritative.
 */
export const VILLAGE_THEME_GROUPS = Object.freeze({
  'binh-minh': {
    name: 'Bình Minh',
    groupLabel: 'Cụm Làng Ban Mai',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'maple',
    flowerColor: '#fde047',
    signText: 'LÀNG BÌNH MINH',
    signBg: '#3d2314',
  },
  'hoa-mai': {
    name: 'Hoa Mai',
    groupLabel: 'Cụm Làng Ban Mai',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'maple',
    flowerColor: '#fde047',
    signText: 'LÀNG HOA MAI',
    signBg: '#3d2314',
  },
  'ven-song': {
    name: 'Ven Sông',
    groupLabel: 'Cụm Làng Thủy Trúc',
    accentColor: '#0ea5e9',
    roofColor: '#9a3412',
    treeType: 'bamboo',
    flowerColor: '#38bdf8',
    signText: 'LÀNG VEN SÔNG',
    signBg: '#1e293b',
  },
  'thanh-ha': {
    name: 'Thanh Hà',
    groupLabel: 'Cụm Làng Thủy Trúc',
    accentColor: '#0ea5e9',
    roofColor: '#9a3412',
    treeType: 'bamboo',
    flowerColor: '#38bdf8',
    signText: 'LÀNG THANH HÀ',
    signBg: '#1e293b',
  },
  'thanh-ha-007': {
    name: 'Thanh Hà',
    groupLabel: 'Cụm Làng Thủy Trúc',
    accentColor: '#0ea5e9',
    roofColor: '#9a3412',
    treeType: 'bamboo',
    flowerColor: '#38bdf8',
    signText: 'LÀNG THANH HÀ',
    signBg: '#1e293b',
  },
  'doi-gio': {
    name: 'Đồi Gió',
    groupLabel: 'Cụm Làng Đồi Thông',
    accentColor: '#8b5cf6',
    roofColor: '#7c2d12',
    treeType: 'pine',
    flowerColor: '#c084fc',
    signText: 'LÀNG ĐỒI GIÓ',
    signBg: '#2e1065',
  },
  'hai-van': {
    name: 'Hải Vân',
    groupLabel: 'Cụm Làng Đồi Thông',
    accentColor: '#8b5cf6',
    roofColor: '#7c2d12',
    treeType: 'pine',
    flowerColor: '#c084fc',
    signText: 'LÀNG HẢI VÂN',
    signBg: '#2e1065',
  },
  'hai-van-010': {
    name: 'Hải Vân',
    groupLabel: 'Cụm Làng Đồi Thông',
    accentColor: '#8b5cf6',
    roofColor: '#7c2d12',
    treeType: 'pine',
    flowerColor: '#c084fc',
    signText: 'LÀNG HẢI VÂN',
    signBg: '#2e1065',
  },
  'an-nhien-005': {
    name: 'An Nhiên',
    groupLabel: 'Cụm Làng Mộc Lan',
    accentColor: '#ec4899',
    roofColor: '#b45309',
    treeType: 'sakura',
    flowerColor: '#f472b6',
    signText: 'LÀNG AN NHIÊN',
    signBg: '#4a044e',
  },
  'moc-lan-006': {
    name: 'Mộc Lan',
    groupLabel: 'Cụm Làng Mộc Lan',
    accentColor: '#ec4899',
    roofColor: '#b45309',
    treeType: 'sakura',
    flowerColor: '#f472b6',
    signText: 'LÀNG MỘC LAN',
    signBg: '#4a044e',
  },
  'phu-dien-008': {
    name: 'Phú Điền',
    groupLabel: 'Cụm Làng Mùa Gặt',
    accentColor: '#ea580c',
    roofColor: '#c2410c',
    treeType: 'oak',
    flowerColor: '#fb923c',
    signText: 'LÀNG PHÚ ĐIỀN',
    signBg: '#431407',
  },
  'tan-loc-009': {
    name: 'Tân Lộc',
    groupLabel: 'Cụm Làng Mùa Gặt',
    accentColor: '#ea580c',
    roofColor: '#c2410c',
    treeType: 'oak',
    flowerColor: '#fb923c',
    signText: 'LÀNG TÂN LỘC',
    signBg: '#431407',
  },
  'thu-phong-011': {
    name: 'Thu Phong',
    groupLabel: 'Cụm Làng Thu Vàng',
    accentColor: '#eab308',
    roofColor: '#b45309',
    treeType: 'maple',
    flowerColor: '#facc15',
    signText: 'LÀNG THU PHONG',
    signBg: '#3d2314',
  },
  'huong-duong-012': {
    name: 'Hướng Dương',
    groupLabel: 'Cụm Làng Thu Vàng',
    accentColor: '#eab308',
    roofColor: '#b45309',
    treeType: 'maple',
    flowerColor: '#facc15',
    signText: 'LÀNG HƯỚNG DƯƠNG',
    signBg: '#3d2314',
  },
});

/**
 * Tạo vật liệu chuẩn đồng quê nhanh chóng với bóng râm dịu
 */
export function createCozyMaterial(scene, name, hex, emissiveHex = null, specular = 0.08) {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = Color3.FromHexString(hex);
  mat.ambientColor = mat.diffuseColor.scale(0.45);
  mat.specularColor = new Color3(specular, specular, specular);
  if (emissiveHex) mat.emissiveColor = Color3.FromHexString(emissiveHex);
  return mat;
}

/**
 * Tạo bảng hiệu gỗ khắc chữ nổi thanh lịch viền vàng ấm
 */
export function createRusticSignboard(scene, title, subtitle = '', accentColor = '#f59e0b', parent = null, width = 6.0, height = 1.8) {
  const dt = new DynamicTexture(`rustic-sign-${title}`, { width: 2048, height: 640 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.hasAlpha = true;
  dt.anisotropicFilteringLevel = 16;
  const ctx = dt.getContext();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, 2048, 640);

  // Nền gỗ sồi sẫm sang trọng
  ctx.fillStyle = '#2c1810';
  ctx.beginPath();
  ctx.roundRect(32, 32, 1984, 576, 64);
  ctx.fill();

  // Khung viền chỉ vàng chạm khắc
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 20;
  ctx.stroke();

  // Chỉ viền phụ bên trong
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(64, 64, 1920, 512, 40);
  ctx.stroke();

  // Tiêu đề chữ nổi màu kem ngà
  ctx.font = '900 164px "Nunito", "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#fffdf0';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 5;
  const titleY = subtitle ? 270 : 340;
  ctx.fillText(title, 1024, titleY, 1840);

  if (subtitle) {
    ctx.font = '800 96px "Nunito", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#ffe2ae';
    ctx.shadowBlur = 4;
    ctx.fillText(subtitle.toUpperCase(), 1024, 430, 1840);
  }

  dt.update();

  const signMat = new StandardMaterial(`rustic-sign-mat-${title}`, scene);
  signMat.diffuseColor = Color3.Black();
  signMat.emissiveTexture = dt;
  signMat.opacityTexture = dt;
  signMat.disableLighting = true;
  signMat.specularColor = Color3.Black();

  const plane = MeshBuilder.CreatePlane(`rustic-sign-plane-${title}`, { width, height }, scene);
  plane.material = signMat;
  plane.billboardMode = Mesh.BILLBOARDMODE_Y;
  if (parent) plane.parent = parent;

  return plane;
}

/**
 * Đèn treo lồng gỗ vàng ấm (Hanging Warm Amber Lantern)
 */
export function createWarmHangingLantern(scene, position, parent = null, shadows = null) {
  const root = new TransformNode('warm-lantern-root', scene);
  if (position) root.position.copyFrom(position);
  if (parent && typeof parent.isEnabled === 'function') root.parent = parent;

  const matIron = createCozyMaterial(scene, 'lantern-iron', '#1e293b');
  const matGlassWarm = createCozyMaterial(scene, 'lantern-warm-glow', '#fef08a', '#f59e0b', 0.8);
  matGlassWarm.alpha = 0.92;

  // Dây xích treo
  const chain = MeshBuilder.CreateCylinder('lantern-chain', { height: 0.6, diameter: 0.04 }, scene);
  chain.position.y = 0.3;
  chain.material = matIron;
  chain.parent = root;

  // Nắp chụp đèn
  const cap = MeshBuilder.CreateCylinder('lantern-cap', { diameterTop: 0.2, diameterBottom: 0.65, height: 0.22, tessellation: 8 }, scene);
  cap.position.y = -0.05;
  cap.material = matIron;
  cap.parent = root;

  // Thân đèn thủy tinh tỏa sáng ấm
  const bulb = MeshBuilder.CreateCylinder('lantern-glass-body', { diameter: 0.42, height: 0.55, tessellation: 8 }, scene);
  bulb.position.y = -0.38;
  bulb.material = matGlassWarm;
  bulb.parent = root;
  shadows?.addShadowCaster(bulb);

  // Đáy đèn
  const base = MeshBuilder.CreateCylinder('lantern-base', { diameter: 0.5, height: 0.1, tessellation: 8 }, scene);
  base.position.y = -0.68;
  base.material = matIron;
  base.parent = root;

  return root;
}
