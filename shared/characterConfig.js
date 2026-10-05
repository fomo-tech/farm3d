/**
 * Shared character appearance rules.
 *
 * Keep the palette deliberately away from absolute black/white. Babylon's
 * stylized lighting can otherwise crush dark skin/hair or clip pale clothes
 * when the camera enters a bright outdoor area.
 */

export const CHARACTER_GENDERS = Object.freeze([
  { id: 'female', label: 'Nữ', icon: '♀', profile: 'soft' },
  { id: 'male', label: 'Nam', icon: '♂', profile: 'sport' },
  { id: 'neutral', label: 'Trung tính', icon: '●', profile: 'balanced' },
]);

export const SKIN_TONES = Object.freeze([
  { id: 'porcelain', label: 'Sứ ấm', hex: '#efc2ad', shadow: '#d89c83' },
  { id: 'peach', label: 'Đào sáng', hex: '#e6b08f', shadow: '#c98569' },
  { id: 'honey', label: 'Mật ong', hex: '#c88962', shadow: '#a86649' },
  { id: 'caramel', label: 'Caramel', hex: '#9a6547', shadow: '#774634' },
  { id: 'cocoa', label: 'Cacao', hex: '#6b4435', shadow: '#4f3029' },
]);

export const CHARACTER_LOD_CONFIG = Object.freeze({
  highDistance: 14,
  mediumDistance: 32,
  lowDistance: 60,
  hideHighDetailAt: 2,
  remoteDistance: 80,
  maxVisibleRemoteCharacters: 24,
  maxShadowCasters: 6,
});

/**
 * Shared art-direction and budget contract for every avatar variant.
 * Keep these values in config so art tuning never requires editing the mesh
 * assembler or the network player code.
 */
export const CHARACTER_RENDER_CONFIG = Object.freeze({
  version: 3,
  style: 'stylized-social-avatar',
  target: 'play-together-inspired',
  proportions: Object.freeze({
    headToBody: 0.92,
    shoulderWidth: 0.31,
    hipWidth: 0.30,
    eyeScale: 1.0,
    headScale: 0.74,
    torsoHeightScale: 1.24,
    hipHeight: 1.0,
    headAnchor: 0.59,
    shoulderHeight: 0.50,
    upperArmLength: 0.32,
    forearmLength: 0.30,
    thighLength: 0.40,
    shinLength: 0.36,
    shoeScale: 0.80,
  }),
  material: Object.freeze({
    skinAmbient: 0.32,
    skinEmissive: 0.24,
    hairAmbient: 0.20,
    clothingAmbient: 0.28,
    highlightFloor: 0.06,
    highlightCeiling: 0.92,
  }),
  geometryBudget: Object.freeze({
    localMeshes: 72,
    remoteMeshes: 34,
    faceTextureSize: 512,
  }),
});

export const CHARACTER_ANIMATION_CONFIG = Object.freeze({
  idleBreathSpeed: 2.5,
  walkCycleSpeed: 10.5,
  actionBlendSeconds: 0.14,
  gestureHoldSeconds: 0.8,
  locomotionBlendSeconds: 0.12,
  facialBlinkMinSeconds: 2.5,
  facialBlinkMaxSeconds: 5.5,
  actionDurations: Object.freeze({
    till: 0.82,
    hoe: 0.82,
    water: 0.8,
    seed: 0.68,
    harvest: 0.75,
    celebrate: 0.95,
    wave: 0.8,
    fashion_pose: 1.6,
    heart_pose: 1.5,
    cheer: 1.4,
    shy: 1.5,
    spin: 1.2,
    default: 0.65,
  }),
});

const DEFAULT_SKIN_TONE = SKIN_TONES.find(tone => tone.id === 'peach') || SKIN_TONES[0];

function clampChannel(value, min = 0.04, max = 0.96) {
  return Math.min(max, Math.max(min, value));
}

/** Return a render-safe #RRGGBB value even when a config contains extremes. */
export function safeCharacterHex(value, fallback = '#e6b08f') {
  const source = typeof value === 'string' ? value.trim() : '';
  const match = source.match(/^#?([0-9a-f]{6})$/i);
  const fallbackMatch = String(fallback).match(/^#?([0-9a-f]{6})$/i);
  const hex = match ? match[1] : fallbackMatch ? fallbackMatch[1] : 'e6b08f';
  const channels = [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  return `#${channels.map(channel => Math.round(clampChannel(channel) * 255).toString(16).padStart(2, '0')).join('')}`;
}

export function getSkinTone(id) {
  return SKIN_TONES.find(tone => tone.id === id) || DEFAULT_SKIN_TONE;
}

export function normalizeCharacterAppearance(value = {}) {
  const gender = CHARACTER_GENDERS.some(item => item.id === value.gender)
    ? value.gender
    : 'female';
  const toneId = value.skinTone || value.skin || value.skinToneId || DEFAULT_SKIN_TONE.id;
  const skinTone = getSkinTone(toneId);
  return {
    gender,
    skinTone: skinTone.id,
    skinColor: safeCharacterHex(value.skinColor || skinTone.hex, skinTone.hex),
  };
}

