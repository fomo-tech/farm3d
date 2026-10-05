import { normalizeCustomization, HAIR_STYLES, HAIR_DYES, TOPS, BOTTOMS, SHOES, EARS_OPTIONS, EYES_OPTIONS, EYE_COLORS, NOSE_OPTIONS, MOUTH_OPTIONS, BLUSH_OPTIONS, FULL_SETS } from './fashionConfig.js';

export function validateEquippedCustomization(raw, ownedIds = []) {
  const custom = normalizeCustomization(raw);
  const owned = new Set(ownedIds);
  const setColors={hairColor:new Set(),eyeColor:new Set()};
  const setParts={};
  for (const set of FULL_SETS) if (owned.has(set.id)) {
    const contents = normalizeCustomization(set.customization || { hairStyle:set.hair, topId:set.top, bottomId:set.bottom, shoeId:set.shoes, ears:set.ears, hairColor:set.hairColor });
    for (const key of ['hairStyle','topId','bottomId','shoeId','ears','eyeType','noseType','mouthType','blushType']) { owned.add(contents[key]);(setParts[key] ||= new Set()).add(contents[key]); }
    for (const field of Object.keys(setColors)) setColors[field].add(contents[field].toLowerCase());
    for (const item of [...HAIR_DYES,...EYE_COLORS]) if ([contents.hairColor,contents.eyeColor].includes(item.hex)) owned.add(item.id);
  }
  const fields = { hairStyle:HAIR_STYLES, topId:TOPS, bottomId:BOTTOMS, shoeId:SHOES, ears:EARS_OPTIONS, eyeType:EYES_OPTIONS, noseType:NOSE_OPTIONS, mouthType:MOUTH_OPTIONS, blushType:BLUSH_OPTIONS };
  for (const [field, items] of Object.entries(fields)) {
    const item=items.find(item=>item.id===custom[field]);
    if (setParts[field]?.has(custom[field])) continue;
    if (!item || (item.cost>0 && !owned.has(item.id))) throw new Error(`Bạn chưa sở hữu trang bị: ${field}.`);
  }
  for (const [field,items] of [['hairColor',HAIR_DYES],['eyeColor',EYE_COLORS]]) {
    if (setColors[field].has(custom[field].toLowerCase())) continue;
    const item=items.find(item=>item.hex.toLowerCase()===custom[field].toLowerCase());
    if (!item || (item.cost>0 && !owned.has(item.id))) throw new Error(`Màu chưa được mở khóa: ${field}.`);
  }
  return custom;
}
