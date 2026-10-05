import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
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
 * Direction: bright social toy-town, cream surfaces, pastel districts and
 * readable signage. Keep farm warmth without darkening the entire town.
 */

export const WORLD_PALETTE = Object.freeze({
  // Shared outdoor colors: bright toy-town surfaces with warm farm accents.
  skyDay: '#7bcdf1',
  grassLight: ART.grassLight,
  grassMid: ART.grass,
  grassShade: ART.grassMid,
  roadWarm: ART.pathLight,
  roadStone: ART.path,
  sidewalkCream: '#d2c7b8',     // Đá phiến kem ngà êm dịu, không chói lóa
  waterShallow: ART.shallows,
  waterDeep: ART.water,
  // 1. Tường & Bệ móng
  wallPlaster: '#eee7d9',       // Cream toy-town walls.
  wallPlasterWarm: '#e6dbc2',   // Warm pastel frontage.
  wallTimberStucco: '#ded4b5',  // Warm muted stucco.
  stoneFoundation: '#a8aac2',   // Soft lavender foundations.
  stonePlinth: '#c6c4d8',       // Light lavender plinths.

  // 2. Mái nhà & Hiên
  roofTerracotta: '#bd8b73',    // Muted clay roofs.
  roofRidge: '#9b7774',
  roofWarmTile: '#c9a085',
  roofThatch: '#b8a077',
  awningCaramel: '#ba9a76',

  // 3. Gỗ cấu trúc & Trang trí
  woodOakDark: '#94715e',       // Warm readable structural wood.
  woodOakWarm: '#c39470',       // Honey wood trim.
  woodTeak: '#c8a27d',          // Light furniture wood.
  woodFenceWhite: '#ede6dc',    // Hàng rào gỗ sơn trắng kem sữa ngọc trai mềm
  woodPlankWeathered: '#8d6e53',// Ván gỗ bến nước mộc mạc

  // 4. Đường dạo & Quảng trường
  plazaMarbleWhite: '#f1ebdf',   // Cream plaza tiles.
  plazaMarbleCream: '#dfd9eb',   // Lavender paving border.
  pathCobblestone: '#d5c7b3',   // Lối đi sỏi nhẵn màu kem bơ
  roadHoneyEarth: '#c7a391',    // Đất nện hồng cát sáng
  curbStone: '#c5bbae',         // Viền đá bó vỉa hè

  // 5. Đèn & Ánh sáng ấm
  lampIronGraphite: '#424956',  // Sắt rèn xám graphite ấm (không đen kịt)
  lampWoodWarm: '#5c4436',      // Cột gỗ sồi ấm áp
  lanternWarmGold: '#fbbf24',   // Đèn lồng vàng ấm
  lanternAmber: '#f59e0b',      // Ánh sáng hổ phách ấm cúng
  lanternCore: '#fef08a',       // Tim đèn phát sáng dịu mắt

  // 6. Cây cỏ & Tự nhiên
  foliageOakGreen: ART.leaf,
  foliageMapleGold: '#bea572',
  foliageSakuraPink: '#c79aa9',
  waterCrystalBlue: ART.shallows,
  waterDeepBlue: ART.water,
});

/**
 * Phân chia 12 làng thành 6 nhóm nhận diện thị giác độc bản
 * Giữ nguyên 100% cấu trúc 24 lô/làng (tổng 288 lô) của server authoritative.
 */
const VILLAGE_THEME_DEFINITIONS = Object.freeze({
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
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'bamboo',
    flowerColor: '#fde047',
    signText: 'LÀNG VEN SÔNG',
    signBg: '#3d2314',
  },
  'thanh-ha': {
    name: 'Thanh Hà',
    groupLabel: 'Cụm Làng Thủy Trúc',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'bamboo',
    flowerColor: '#fde047',
    signText: 'LÀNG THANH HÀ',
    signBg: '#3d2314',
  },
  'thanh-ha-007': {
    name: 'Thanh Hà',
    groupLabel: 'Cụm Làng Thủy Trúc',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'bamboo',
    flowerColor: '#fde047',
    signText: 'LÀNG THANH HÀ',
    signBg: '#3d2314',
  },
  'doi-gio': {
    name: 'Đồi Gió',
    groupLabel: 'Cụm Làng Đồi Thông',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'pine',
    flowerColor: '#fde047',
    signText: 'LÀNG ĐỒI GIÓ',
    signBg: '#3d2314',
  },
  'hai-van': {
    name: 'Hải Vân',
    groupLabel: 'Cụm Làng Đồi Thông',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'pine',
    flowerColor: '#fde047',
    signText: 'LÀNG HẢI VÂN',
    signBg: '#3d2314',
  },
  'hai-van-010': {
    name: 'Hải Vân',
    groupLabel: 'Cụm Làng Đồi Thông',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'pine',
    flowerColor: '#fde047',
    signText: 'LÀNG HẢI VÂN',
    signBg: '#3d2314',
  },
  'an-nhien': {
    name: 'An Nhiên',
    groupLabel: 'Cụm Làng Mộc Lan',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'sakura',
    flowerColor: '#fde047',
    signText: 'LÀNG AN NHIÊN',
    signBg: '#3d2314',
  },
  'an-nhien-005': {
    name: 'An Nhiên',
    groupLabel: 'Cụm Làng Mộc Lan',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'sakura',
    flowerColor: '#fde047',
    signText: 'LÀNG AN NHIÊN',
    signBg: '#3d2314',
  },
  'moc-lan': {
    name: 'Mộc Lan',
    groupLabel: 'Cụm Làng Mộc Lan',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'sakura',
    flowerColor: '#fde047',
    signText: 'LÀNG MỘC LAN',
    signBg: '#3d2314',
  },
  'moc-lan-006': {
    name: 'Mộc Lan',
    groupLabel: 'Cụm Làng Mộc Lan',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'sakura',
    flowerColor: '#fde047',
    signText: 'LÀNG MỘC LAN',
    signBg: '#3d2314',
  },
  'phu-dien': {
    name: 'Phú Điền',
    groupLabel: 'Cụm Làng Mùa Gặt',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'oak',
    flowerColor: '#fde047',
    signText: 'LÀNG PHÚ ĐIỀN',
    signBg: '#3d2314',
  },
  'phu-dien-008': {
    name: 'Phú Điền',
    groupLabel: 'Cụm Làng Mùa Gặt',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'oak',
    flowerColor: '#fde047',
    signText: 'LÀNG PHÚ ĐIỀN',
    signBg: '#3d2314',
  },
  'tan-loc': {
    name: 'Tân Lộc',
    groupLabel: 'Cụm Làng Mùa Gặt',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'oak',
    flowerColor: '#fde047',
    signText: 'LÀNG TÂN LỘC',
    signBg: '#3d2314',
  },
  'tan-loc-009': {
    name: 'Tân Lộc',
    groupLabel: 'Cụm Làng Mùa Gặt',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'oak',
    flowerColor: '#fde047',
    signText: 'LÀNG TÂN LỘC',
    signBg: '#3d2314',
  },
  'thu-phong': {
    name: 'Thu Phong',
    groupLabel: 'Cụm Làng Thu Vàng',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'maple',
    flowerColor: '#fde047',
    signText: 'LÀNG THU PHONG',
    signBg: '#3d2314',
  },
  'thu-phong-011': {
    name: 'Thu Phong',
    groupLabel: 'Cụm Làng Thu Vàng',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'maple',
    flowerColor: '#fde047',
    signText: 'LÀNG THU PHONG',
    signBg: '#3d2314',
  },
  'huong-duong': {
    name: 'Hướng Dương',
    groupLabel: 'Cụm Làng Thu Vàng',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'maple',
    flowerColor: '#fde047',
    signText: 'LÀNG HƯỚNG DƯƠNG',
    signBg: '#3d2314',
  },
  'huong-duong-012': {
    name: 'Hướng Dương',
    groupLabel: 'Cụm Làng Thu Vàng',
    accentColor: '#f59e0b',
    roofColor: '#c2410c',
    treeType: 'maple',
    flowerColor: '#fde047',
    signText: 'LÀNG HƯỚNG DƯƠNG',
    signBg: '#3d2314',
  },
});

const DISTRICT_COLORS = Object.freeze({
  'Cụm Làng Ban Mai': ['#f3b36a', '#e78c77', '#fff1d2'],
  'Cụm Làng Thủy Trúc': ['#71cdb6', '#53a99d', '#e7f8f1'],
  'Cụm Làng Đồi Thông': ['#84bfe9', '#659dcc', '#eaf5ff'],
  'Cụm Làng Mộc Lan': ['#efa8c5', '#cf82ab', '#fff0f5'],
  'Cụm Làng Mùa Gặt': ['#b2cc7b', '#89b18b', '#f4f7df'],
  'Cụm Làng Thu Vàng': ['#c2a0e6', '#a184cd', '#f5edff'],
});

export const VILLAGE_THEME_GROUPS = Object.freeze(Object.fromEntries(
  Object.entries(VILLAGE_THEME_DEFINITIONS).map(([id, theme]) => {
    const [accentColor, roofColor, signBg] = DISTRICT_COLORS[theme.groupLabel];
    return [id, Object.freeze({ ...theme, accentColor, roofColor, signBg })];
  }),
));

/** Shared softly shaded architectural material. */
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
export function createRusticSignboard(scene, title, subtitle = '', accentColor = '#f59e0b', parent = null, width = 6.0, height = 1.8, billboard = true) {
  const signMat = new StandardMaterial(`rustic-sign-mat-${title}`, scene);
  signMat.alpha = 1;

  if (typeof document !== 'undefined' || typeof OffscreenCanvas !== 'undefined') {
    const dt = new DynamicTexture(`rustic-sign-${title}`, { width: 1024, height: 320 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
    dt.hasAlpha = true;
    dt.anisotropicFilteringLevel = 4;
    const ctx = dt.getContext();
    ctx.scale(0.5, 0.5);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, 2048, 640);

    // Nền gỗ sồi sẫm sang trọng
    ctx.fillStyle = '#fff7e7';
    ctx.beginPath();
    ctx.roundRect(32, 32, 1984, 576, 64);
    ctx.fill();

    // Khung viền chỉ vàng chạm khắc
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 20;
    ctx.stroke();

    // Chỉ viền phụ bên trong
    ctx.strokeStyle = '#e7dccb';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(64, 64, 1920, 512, 40);
    ctx.stroke();

    // Tiêu đề chữ nổi màu kem ngà
    ctx.font = '900 164px "Nunito", "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#345576';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255,255,255,0.5)';
    ctx.shadowBlur = 0;
    const titleY = subtitle ? 270 : 340;
    ctx.fillText(title, 1024, titleY, 1840);

    if (subtitle) {
      ctx.font = '800 96px "Nunito", "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#65808d';
      ctx.shadowBlur = 0;
      ctx.fillText(subtitle.toUpperCase(), 1024, 430, 1840);
    }

    dt.update();
    signMat.diffuseColor = Color3.Black();
    signMat.emissiveTexture = dt;
    signMat.opacityTexture = dt;
    signMat.disableLighting = true;
    signMat.specularColor = Color3.Black();
  } else {
    signMat.diffuseColor = Color3.FromHexString('#2c1810');
    signMat.emissiveColor = Color3.FromHexString(accentColor).scale(0.35);
  }

  const plane = MeshBuilder.CreatePlane(`rustic-sign-plane-${title}`, { width, height }, scene);
  plane.material = signMat;
  if (billboard) {
    plane.billboardMode = Mesh.BILLBOARDMODE_Y;
  }
  if (parent) plane.parent = parent;

  return plane;
}

/**
 * Tạo bảng hiệu mặt tiền 3D cao cấp (Storefront Fascia Signboard)
 * Gắn cố định trên tường mặt tiền, có khung gỗ vát cạnh, chỉ vàng, 2 đèn rọi cổ ngỗng và chữ sắc nét
 */
export function createStorefrontSignboard(scene, {
  title,
  subtitle = '',
  icon = '',
  accentColor = '#f59e0b',
  parent = null,
  width = 6.8,
  height = 1.6,
  position = new Vector3(0, 7.75, 6.45),
  rotationY = 0,
}) {
  const signRoot = new TransformNode(`storefront-sign-root-${title}`, scene);
  signRoot.position.copyFrom(position);
  signRoot.rotation.y = rotationY;
  if (parent) signRoot.parent = parent;

  // 1. Tấm gỗ nền sồi tối vát cạnh
  const plaque = MeshBuilder.CreateBox(`storefront-sign-plaque-${title}`, { width: width + 0.35, height: height + 0.25, depth: 0.16 }, scene);
  const plaqueMat = new StandardMaterial(`sign-plaque-mat-${title}`, scene);
  plaqueMat.diffuseColor = Color3.FromHexString('#fff2df');
  plaqueMat.ambientColor = plaqueMat.diffuseColor.scale(0.4);
  plaqueMat.specularColor = new Color3(0.08, 0.08, 0.08);
  plaqueMat.alpha = 1;
  plaque.material = plaqueMat;
  plaque.parent = signRoot;

  // 2. Viền kim loại mạ vàng / đồng thau nổi
  const trim = MeshBuilder.CreateBox(`storefront-sign-trim-${title}`, { width: width + 0.12, height: height + 0.1, depth: 0.20 }, scene);
  const trimMat = new StandardMaterial(`sign-trim-mat-${title}`, scene);
  trimMat.diffuseColor = Color3.FromHexString(accentColor);
  trimMat.emissiveColor = Color3.FromHexString(accentColor).scale(0.04);
  trimMat.specularColor = new Color3(0.5, 0.5, 0.5);
  trimMat.specularPower = 64;
  trimMat.alpha = 1;
  trim.material = trimMat;
  trim.parent = signRoot;

  // 3. Mặt bảng hiệu đồ họa độ phân giải cao
  const signMat = new StandardMaterial(`storefront-sign-face-mat-${title}`, scene);
  signMat.alpha = 1;
  signMat.backFaceCulling = false;

  if (typeof document !== 'undefined' || typeof OffscreenCanvas !== 'undefined') {
    const dt = new DynamicTexture(`storefront-sign-dt-${title}`, { width: 1024, height: 256 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
    dt.anisotropicFilteringLevel = 4;
    const ctx = dt.getContext();
    ctx.scale(0.5, 0.5);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Nền gỗ gụ sẫm sang trọng
    ctx.fillStyle = '#fff7e7';
    ctx.fillRect(0, 0, 2048, 512);

    // Dải hoa văn viền vàng kép chạm khắc
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 18;
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(24, 24, 2000, 464, 36);
      ctx.stroke();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(44, 44, 1960, 424, 24);
      ctx.stroke();
    } else {
      ctx.strokeRect(24, 24, 2000, 464);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 6;
      ctx.strokeRect(44, 44, 1960, 424);
    }

    // Tiêu đề chữ nổi tiếng Việt vàng rực rỡ có đổ bóng sâu
    ctx.font = '900 130px Arial, "Nunito", "Segoe UI", sans-serif';
    ctx.fillStyle = '#345576';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255,255,255,0)';
    ctx.shadowBlur = 0;
    const titleY = subtitle ? 215 : 285;
    ctx.fillText(title.toUpperCase(), 1024, titleY, 1840);

    if (subtitle) {
      ctx.font = 'bold 64px Arial, "Nunito", "Segoe UI", sans-serif';
      ctx.fillStyle = '#65808d';
      ctx.shadowBlur = 0;
      ctx.fillText(subtitle.toUpperCase(), 1024, 345, 1900);
    }

    dt.update();
    dt.uScale = -1;
    dt.uOffset = 1;
    signMat.diffuseTexture = dt;
    signMat.emissiveTexture = dt;
    signMat.diffuseColor = Color3.White();
    signMat.emissiveColor = Color3.White();
    signMat.disableLighting = true;
    signMat.specularColor = Color3.Black();
  } else {
    signMat.diffuseColor = Color3.FromHexString('#1c120c');
    signMat.emissiveColor = Color3.FromHexString('#f59e0b').scale(0.6);
  }

  const face = MeshBuilder.CreatePlane(`storefront-sign-face-${title}`, { width, height, sideOrientation: Mesh.DOUBLESIDE }, scene);
  face.position.set(0, 0, 0.12);
  face.material = signMat;
  face.parent = signRoot;

  // 4. Hai cụm đèn rọi cổ ngỗng bằng đồng thau trên đỉnh bảng hiệu
  [-width * 0.28, width * 0.28].forEach((lx, lidx) => {
    const arm = MeshBuilder.CreateCylinder(`sign-lamp-arm-${title}-${lidx}`, { diameter: 0.05, height: 0.38, tessellation: 8 }, scene);
    arm.position.set(lx, height / 2 + 0.15, 0.12);
    arm.rotation.x = -0.55;
    arm.material = trimMat;
    arm.parent = signRoot;

    const shade = MeshBuilder.CreateCylinder(`sign-lamp-shade-${title}-${lidx}`, { diameterTop: 0.08, diameterBottom: 0.28, height: 0.18, tessellation: 12 }, scene);
    shade.position.set(lx, height / 2 + 0.26, 0.25);
    shade.rotation.x = 0.55;
    shade.material = trimMat;
    shade.parent = signRoot;

    const bulbMat = new StandardMaterial(`sign-bulb-mat-${title}-${lidx}`, scene);
    bulbMat.diffuseColor = Color3.FromHexString('#fef08a');
    bulbMat.emissiveColor = Color3.FromHexString('#fef08a');
    bulbMat.disableLighting = true;
    bulbMat.alpha = 1;
    const bulb = MeshBuilder.CreateSphere(`sign-lamp-bulb-${title}-${lidx}`, { diameter: 0.14, segments: 8 }, scene);
    bulb.position.set(lx, height / 2 + 0.22, 0.23);
    bulb.material = bulbMat;
    bulb.parent = signRoot;
  });

  return signRoot;
}

/**
 * Tạo bảng hiệu vẫy 2 mặt nhô ra từ góc tường (Projecting Blade Sign)
 * Có tay đòn sắt nghệ thuật uốn cong và bảng gỗ/enamel 2 mặt với biểu tượng đặc trưng
 */
export function createProjectingBladeSign(scene, {
  parent = null,
  position = new Vector3(7.2, 5.2, 6.35),
  accentColor = '#f59e0b',
  iconLabel = 'SHOP',
}) {
  const bladeRoot = new TransformNode(`blade-sign-root-${iconLabel}`, scene);
  bladeRoot.position.copyFrom(position);
  if (parent) bladeRoot.parent = parent;

  const matIron = new StandardMaterial(`blade-iron-mat-${iconLabel}`, scene);
  matIron.diffuseColor = Color3.FromHexString('#1c1917');
  matIron.specularColor = new Color3(0.2, 0.2, 0.2);
  matIron.alpha = 1;

  // 1. Tay đỡ sắt gắn tường vuông góc vươn ra 1.4m
  const ironArm = MeshBuilder.CreateBox(`blade-iron-arm-${iconLabel}`, { width: 0.08, height: 0.12, depth: 1.35 }, scene);
  ironArm.position.set(0, 0, 0.65);
  ironArm.material = matIron;
  ironArm.parent = bladeRoot;

  // Thanh chéo trợ lực
  const brace = MeshBuilder.CreateBox(`blade-iron-brace-${iconLabel}`, { width: 0.06, height: 0.6, depth: 0.6 }, scene);
  brace.position.set(0, -0.22, 0.35);
  brace.rotation.x = Math.PI / 4;
  brace.material = matIron;
  brace.parent = bladeRoot;

  // 2. Hai móc xích treo
  [0.35, 0.95].forEach((cz, idx) => {
    const chain = MeshBuilder.CreateCylinder(`blade-chain-${iconLabel}-${idx}`, { diameter: 0.04, height: 0.22, tessellation: 6 }, scene);
    chain.position.set(0, -0.14, cz);
    chain.material = matIron;
    chain.parent = bladeRoot;
  });

  // 3. Biển vẫy tròn / bát giác 2 mặt
  const discMat = new StandardMaterial(`blade-disc-mat-${iconLabel}`, scene);
  discMat.diffuseColor = Color3.FromHexString('#291811');
  discMat.emissiveColor = Color3.FromHexString(accentColor).scale(0.3);
  discMat.specularColor = new Color3(0.3, 0.3, 0.3);
  discMat.alpha = 1;

  const plaque = MeshBuilder.CreateCylinder(`blade-plaque-${iconLabel}`, { diameter: 1.05, height: 0.10, tessellation: 24 }, scene);
  plaque.position.set(0, -0.65, 0.65);
  plaque.rotation.z = Math.PI / 2;
  plaque.material = discMat;
  plaque.parent = bladeRoot;

  const rim = MeshBuilder.CreateTorus(`blade-rim-${iconLabel}`, { diameter: 1.08, thickness: 0.08, tessellation: 24 }, scene);
  rim.position.set(0, -0.65, 0.65);
  rim.rotation.z = Math.PI / 2;
  const rimMat = new StandardMaterial(`blade-rim-mat-${iconLabel}`, scene);
  rimMat.diffuseColor = Color3.FromHexString(accentColor);
  rimMat.alpha = 1;
  rim.material = rimMat;
  rim.parent = bladeRoot;

  return bladeRoot;
}

/**
 * HỆ THỐNG QUẦNG SÁNG & VỆT SÁNG MẶT ĐẤT ĐÈN ĐƯỜNG (STREET LAMP GLOW & GROUND LIGHT POOLS)
 * Tối ưu hóa 60 FPS: Tất cả đèn đường, đèn lồng chia sẻ chung 1 Dynamic Texture & 1 Material
 */
export function getOrCreateLampMaterials(scene) {
  let haloMat = scene.getMaterialByName('ghibli-lamp-halo');
  let poolMat = scene.getMaterialByName('ghibli-ground-light-pool');

  if (!haloMat || !poolMat) {
    let haloTex = scene.getTextureByName('ghibli-lamp-halo-tex');
    if (!haloTex) {
      haloTex = new DynamicTexture('ghibli-lamp-halo-tex', { width: 128, height: 128 }, scene, false, Texture.BILINEAR_SAMPLINGMODE);
      haloTex.hasAlpha = true;
      const ctx = haloTex.getContext();
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0.00, 'rgba(255, 252, 220, 1.0)');
      grad.addColorStop(0.28, 'rgba(254, 215, 120, 0.82)');
      grad.addColorStop(0.62, 'rgba(245, 158, 11, 0.32)');
      grad.addColorStop(0.85, 'rgba(217, 119, 6, 0.10)');
      grad.addColorStop(1.00, 'rgba(180, 83, 9, 0.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      haloTex.update();
    }

    let poolTex = scene.getTextureByName('ghibli-ground-pool-tex');
    if (!poolTex) {
      poolTex = new DynamicTexture('ghibli-ground-pool-tex', { width: 128, height: 128 }, scene, false, Texture.BILINEAR_SAMPLINGMODE);
      poolTex.hasAlpha = true;
      const pctx = poolTex.getContext();
      const pgrad = pctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      pgrad.addColorStop(0.00, 'rgba(254, 225, 140, 0.70)');
      pgrad.addColorStop(0.38, 'rgba(251, 191, 36, 0.45)');
      pgrad.addColorStop(0.72, 'rgba(245, 158, 11, 0.16)');
      pgrad.addColorStop(1.00, 'rgba(245, 158, 11, 0.0)');
      pctx.fillStyle = pgrad;
      pctx.fillRect(0, 0, 128, 128);
      poolTex.update();
    }

    if (!haloMat) {
      haloMat = new StandardMaterial('ghibli-lamp-halo', scene);
      haloMat.emissiveTexture = haloTex;
      haloMat.opacityTexture = haloTex;
      haloMat.emissiveColor = Color3.FromHexString('#fef08a');
      haloMat.disableLighting = true;
      haloMat.backFaceCulling = false;
      haloMat.alpha = 0.85;
      haloMat.fogEnabled = false;
    }

    if (!poolMat) {
      poolMat = new StandardMaterial('ghibli-ground-light-pool', scene);
      poolMat.emissiveTexture = poolTex;
      poolMat.opacityTexture = poolTex;
      poolMat.emissiveColor = Color3.FromHexString('#fed7aa');
      poolMat.disableLighting = true;
      poolMat.backFaceCulling = false;
      poolMat.alpha = 0.65;
      poolMat.zOffset = -6;
      poolMat.fogEnabled = false;
    }
  }

  return { haloMat, poolMat };
}

export function createLampHaloOnly(scene, parent, position, radius = 0.85) {
  const { haloMat } = getOrCreateLampMaterials(scene);
  const key = `${Math.round(position.x * 10)}_${Math.round(position.y * 10)}_${Math.round(position.z * 10)}`;
  const halo = MeshBuilder.CreateDisc(`lamp-halo-${key}`, {
    radius,
    tessellation: 16,
  }, scene);
  // Babylon billboards discard parent rotation. A non-billboard anchor first
  // transforms the lamp's local offset, then the halo faces the camera at zero offset.
  if (parent) {
    const anchor=new TransformNode(`lamp-anchor-${key}`,scene);
    anchor.position.copyFrom(position); anchor.parent=parent;
    halo.parent=anchor;
  } else halo.position.copyFrom(position);
  halo.billboardMode = Mesh.BILLBOARDMODE_ALL;
  halo.material = haloMat;
  halo.isPickable = false;
  return halo;
}

export function createGroundLightPoolOnly(scene, parent, position, radius = 2.8) {
  const { poolMat } = getOrCreateLampMaterials(scene);
  const key = `${Math.round(position.x * 10)}_${Math.round(position.y * 10)}_${Math.round(position.z * 10)}`;
  const pool = MeshBuilder.CreateDisc(`lamp-pool-${key}`, {
    radius,
    tessellation: 20,
  }, scene);
  pool.rotation.x = Math.PI / 2;
  pool.position.copyFrom(position);
  pool.material = poolMat;
  pool.isPickable = false;
  if (parent) pool.parent = parent;
  return pool;
}

export function createLampGlowAndPool(scene, parent, bulbPos, groundY = 0.086, haloRadius = 0.85, poolRadius = 2.8) {
  const halo = createLampHaloOnly(scene, parent, bulbPos, haloRadius);
  const groundPos = new Vector3(bulbPos.x, groundY, bulbPos.z);
  const pool = createGroundLightPoolOnly(scene, parent, groundPos, poolRadius);
  return { halo, pool };
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

  // Quầng sáng sương mờ dịu mắt bao quanh đèn lồng
  createLampHaloOnly(scene, root, new Vector3(0, -0.38, 0), 0.72);

  return root;
}

