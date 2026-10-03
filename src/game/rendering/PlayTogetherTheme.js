import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Animation } from '@babylonjs/core/Animations/animation.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { WORLD_PALETTE } from '../world/worldDesignSystem.js';

/**
 * BẢNG MÀU QUY CHUẨN THIẾT KẾ PLAY TOGETHER (Design System Palette)
 * Phong cách Pastel Candy, High-Key, Đồ Chơi Vinyl Cao Cấp
 */
export const PLAY_TOGETHER_PALETTE = {
  pastels: {
    skyBlue: WORLD_PALETTE.skyDay,
    mintGreen: WORLD_PALETTE.foliageOakGreen,
    butterYellow: '#ffea79',
    coralOrange: '#ff9770',
    strawberryPink: '#ff70a6',
    lavender: '#c77dff',
    creamyVanilla: '#fffdf2',
    milkWhite: '#ffffff',
    bananaYellow: '#fde047',
    peachBlush: '#fbcfe8',
    turquoise: '#48cae4',
  },
  farm: {
    chocolateSoil: '#5c3826',
    richMound: '#6b3e26',
    wetSoil: '#3d2314',
    freshSprout: WORLD_PALETTE.grassLight,
    leafGreen: WORLD_PALETTE.foliageOakGreen,
    leafDark: WORLD_PALETTE.grassShade,
    carrotOrange: '#ff781f',
    carrotHighlight: '#ffaa44',
    radishPink: '#f43f5e',
    pumpkinGold: '#fb923c',
    sweetMelon: '#34d399',
    honeyWood: '#d97706',
    caramelWood: '#92400e',
    fenceWhite: WORLD_PALETTE.woodFenceWhite,
    ceramicCream: '#fef3c7',
  },
  fx: {
    goldStar: '#facc15',
    starGlow: '#fef08a',
    sparkleWhite: '#ffffff',
    popPink: '#fb7185',
    neonCyan: '#38bdf8',
  },
};

const materialCache = new WeakMap();

/**
 * Tạo vật liệu Đồ Chơi (Toy Vinyl / Plastic) đặc trưng phong cách Play Together
 * - Bề mặt bóng nhẹ, có điểm sáng tròn (specular shine)
 * - Màu sắc tươi sáng, ambient color cao giúp không bị bóng đen thô ráp
 * - Tự động tái sử dụng cache theo name để tối ưu 60 FPS
 */
export function createToyMaterial(scene, name, hexColor, options = {}) {
  if (!scene) {
    console.warn(`[createToyMaterial] scene is undefined for material "${name}"`);
    return null;
  }
  // Không dùng chung material giữa các Babylon Scene/Engine khác nhau.
  let cache = materialCache.get(scene);
  if (!cache) {
    cache = new Map();
    materialCache.set(scene, cache);
    scene.onDisposeObservable.addOnce(() => cache.clear());
  }
  const cacheKey = JSON.stringify([name, hexColor, options.ambientScale ?? 0.42,
    options.specularLevel ?? 0.18, options.specularPower ?? 64,
    options.emissiveHex ?? null, options.emissiveScale ?? 0,
    options.alpha ?? 1, options.backFaceCulling ?? true]);
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  // Never mutate another mesh's material merely because its display name matches.
  const mat = new StandardMaterial(name, scene);
  mat.onDisposeObservable.addOnce(() => cache.delete(cacheKey));

  const baseCol = Color3.FromHexString(hexColor);
  mat.diffuseColor = baseCol;

  // Ambient boost: nâng sáng hốc bóng đổ, màu sắc luôn tươi vui như ban ngày
  const ambientScale = options.ambientScale ?? 0.42;
  mat.ambientColor = baseCol.scale(ambientScale);

  // Điểm sáng phản chiếu Specular bóng dẻo đồ chơi (Toy Sheen)
  const specLevel = options.specularLevel ?? 0.18;
  mat.specularColor = new Color3(specLevel, specLevel, specLevel);
  mat.specularPower = options.specularPower ?? 64;

  if (options.emissiveHex) {
    mat.emissiveColor = Color3.FromHexString(options.emissiveHex);
  } else if (options.emissiveScale) {
    mat.emissiveColor = baseCol.scale(options.emissiveScale);
  } else {
    mat.emissiveColor = Color3.Black();
  }

  if (options.alpha !== undefined) {
    mat.alpha = options.alpha;
  }

  if (options.backFaceCulling !== undefined) {
    mat.backFaceCulling = options.backFaceCulling;
  }

  cache.set(cacheKey, mat);
  return mat;
}

/**
 * Tạo texture gradient 2 tông màu mềm mại cho các khối đồ chơi (Stylized Gradient)
 */
export function createToyGradientTexture(scene, name, topHex, bottomHex, size = 256) {
  const existing = scene.getTextureByName(name);
  if (existing) return existing;

  const dt = new DynamicTexture(name, { width: size, height: size }, scene, false);
  const ctx = dt.getContext();
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, topHex);
  grad.addColorStop(1, bottomHex);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  dt.update();
  return dt;
}

/**
 * Hiệu ứng nhún nhảy Bouncy Squash & Stretch đặc trưng Play Together
 * Khi người chơi tương tác hoặc đồ vật xuất hiện (Pop-in)
 */
export function triggerToyBounce(scene, targetNode, options = {}) {
  if (!targetNode || targetNode.isDisposed?.()) return;

  const baseScale = options.baseScale || targetNode.scaling.clone();
  const bounceFactor = options.bounceFactor ?? 1.22;
  const fps = 30;

  const anim = new Animation(
    `toy-bounce-${Math.random().toString(36).substring(2, 7)}`,
    'scaling',
    fps,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const keys = [
    { frame: 0, value: baseScale.clone() },
    { frame: 4, value: new Vector3(baseScale.x * bounceFactor, baseScale.y * (2 - bounceFactor), baseScale.z * bounceFactor) }, // Đè dẹt
    { frame: 8, value: new Vector3(baseScale.x * (2 - bounceFactor * 0.9), baseScale.y * (bounceFactor * 1.1), baseScale.z * (2 - bounceFactor * 0.9)) }, // Kéo dãn vươn cao
    { frame: 12, value: new Vector3(baseScale.x * 1.05, baseScale.y * 0.96, baseScale.z * 1.05) },
    { frame: 16, value: baseScale.clone() }, // Về cân bằng
  ];

  anim.setKeys(keys);
  targetNode.animations = targetNode.animations || [];
  targetNode.animations.push(anim);
  scene.beginAnimation(targetNode, 0, 16, false, 1.2, () => {
    targetNode.scaling.copyFrom(baseScale);
  });
}
