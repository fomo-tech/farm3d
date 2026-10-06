import {
  getDefaultCustomization, getFashionItem, EARS_OPTIONS, EYES_OPTIONS,
  EYE_COLORS, NOSE_OPTIONS, MOUTH_OPTIONS, BLUSH_OPTIONS,
} from '../../shared/fashionConfig.js';

export function applyFashionInventoryItem(avatar, item) {
  const id = item.itemId;
  const defaults = getDefaultCustomization();
  if (item.id.startsWith('fashion:')) {
    avatar.applyCustomization(defaults);
    avatar.setOutfit(id);
    return 'outfit';
  }
  const spec = getFashionItem(id);
  if (!spec) return null;
  const look = { ...defaults };
  let type;
  if (spec.customization) { Object.assign(look, spec.customization); type = 'outfit'; }
  else if (id.startsWith('top_')) { look.topId = id; look.topColor = spec.color; type = 'top'; }
  else if (id.startsWith('bot_')) { look.bottomId = id; look.bottomColor = spec.color; type = 'bottom'; }
  else if (id.startsWith('shoe_')) { look.shoeId = id; look.shoeColor = spec.color; type = 'shoes'; }
  else if (id.startsWith('hair_')) { look.hairStyle = id; type = 'hair'; }
  else if (id.startsWith('dye_')) { look.hairColor = spec.hex; type = 'hair'; }
  else if (EARS_OPTIONS.some(entry => entry.id === id)) { look.ears = id; type = 'accessory'; }
  else if (EYE_COLORS.some(entry => entry.id === id)) { look.eyeColor = spec.hex; type = 'face'; }
  else if (EYES_OPTIONS.some(entry => entry.id === id)) { look.eyeType = id; type = 'face'; }
  else if (NOSE_OPTIONS.some(entry => entry.id === id)) { look.noseType = id; type = 'face'; }
  else if (MOUTH_OPTIONS.some(entry => entry.id === id)) { look.mouthType = id; type = 'face'; }
  else if (BLUSH_OPTIONS.some(entry => entry.id === id)) { look.blushType = id; type = 'face'; }
  else return null;
  avatar.applyCustomization(look);
  return type;
}

export function isFashionObjectMesh(name, type, itemId) {
  const n = name.toLowerCase();
  const top = /shirt|hood|bomber|knit|vest|sailor|tech|prince|vamp|kimono|aodai|blazer|kpop|corset|sleeve|collar|polo|tuxedo|neckline/.test(n);
  const bottom = /(?:^|-)shorts(?:-|$)|pant|skirt|denim|cargo|belt|buckle|waist|pleat|gown|overall/.test(n);
  const shoes = /shoe|sneaker|boot|slide|loafer|sandal|sock|sole|skate|heel/.test(n);
  const hair = /hair|bang|pony|curl|bob|strand|fringe|headband/.test(n);
  if (type === 'top') return top;
  if (type === 'bottom') return bottom;
  if (type === 'shoes') return shoes;
  if (type === 'hair') return hair;
  if (type === 'outfit') return top || bottom || shoes;
  if (type === 'face') return /head|eye|nose|mouth|blush|cheek|face/.test(n);
  if (type === 'accessory') {
    if (itemId.includes('backpack')) return /frog|backpack|pack|strap/.test(n);
    if (itemId.includes('wings')) return /wing|feather|bat-w/.test(n);
    if (itemId.includes('ears')) return /ear|headband/.test(n);
    if (itemId.includes('glasses') || itemId.includes('goggles')) return /glass|goggle/.test(n);
    return !/shirt|short|pant|shoe|sneaker|arm|leg|hand|foot|neck/.test(n);
  }
  return false;
}

export function selectFashionObjectMeshes(avatar, type, itemId, baselineEnabledNames = new Set()) {
  return avatar.root.getChildMeshes().filter(mesh => {
    if (!mesh.isEnabled()) return false;
    if (type === 'accessory' && itemId !== 'human') return !baselineEnabledNames.has(mesh.name);
    return isFashionObjectMesh(mesh.name, type, itemId);
  });
}
