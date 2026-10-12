import { getDefaultCustomization, normalizeCustomization, HAIR_DYES } from './fashionConfig.js';
export const STARTER_HAIR_IDS = Object.freeze({ hair_buzzcut:'hair_buzzcut', hair_high_ponytail:'hair_high_ponytail', classic:'hair_classic', twintails:'hair_twintails', bob:'hair_chic_bob', wavy:'hair_wavy_curly' });
export const STARTER_HAIR_COLORS = Object.freeze(['dye_chestnut','dye_blonde','dye_black','dye_pink','dye_mint'].map(id => HAIR_DYES.find(item => item.id === id)));
export function starterAppearance(raw = {}) {
  const defaults = getDefaultCustomization();
  const hairStyle = STARTER_HAIR_IDS[raw.hair] || (Object.values(STARTER_HAIR_IDS).includes(raw.hairStyle) ? raw.hairStyle : defaults.hairStyle);
  const dye = STARTER_HAIR_COLORS.find(item => item.hex.toLowerCase() === String(raw.hairColor).toLowerCase()) || STARTER_HAIR_COLORS[0];
  // Only creation-screen choices are accepted; outfit and accessories stay starter defaults.
  const customization = normalizeCustomization({ ...defaults, gender: raw.gender, skinTone: raw.skinTone, skinColor: undefined, hairStyle, hairColor: dye.hex });
  return { customization, ownedIds: [hairStyle, dye.id] };
}
