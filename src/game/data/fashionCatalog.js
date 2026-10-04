/**
 * src/game/data/fashionCatalog.js
 * Adapter layer re-exporting from shared/fashionConfig.js for backward-compatibility.
 * To update prices or items, edit `shared/fashionConfig.js`.
 */

export {
  FASHION_RARITY,
  FASHION_CATEGORIES,
  CHARACTER_GENDERS,
  SKIN_TONES,
  CHARACTER_ANIMATION_CONFIG,
  CHARACTER_LOD_CONFIG,
  CHARACTER_RENDER_CONFIG,
  normalizeCharacterAppearance,
  safeCharacterHex,
  HAIR_STYLES,
  HAIR_DYES,
  TOPS,
  BOTTOMS,
  SHOES,
  EARS_OPTIONS,
  EYES_OPTIONS,
  EYE_COLORS,
  NOSE_OPTIONS,
  MOUTH_OPTIONS,
  BLUSH_OPTIONS,
  FULL_SETS,
  ALL_FASHION_ITEMS_MAP,
  getFashionItem,
  getDefaultCustomization,
  normalizeCustomization,
  calculateVerifiedCustomizationCost,
} from '../../../shared/fashionConfig.js';
