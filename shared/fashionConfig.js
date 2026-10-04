import {
  CHARACTER_ANIMATION_CONFIG,
  CHARACTER_GENDERS,
  CHARACTER_LOD_CONFIG,
  CHARACTER_RENDER_CONFIG,
  SKIN_TONES,
  normalizeCharacterAppearance,
  safeCharacterHex,
} from './characterConfig.js';

export {
  CHARACTER_ANIMATION_CONFIG,
  CHARACTER_GENDERS,
  CHARACTER_LOD_CONFIG,
  CHARACTER_RENDER_CONFIG,
  SKIN_TONES,
  normalizeCharacterAppearance,
  safeCharacterHex,
} from './characterConfig.js';

/**
 * shared/fashionConfig.js
 * Single Source of Truth for Sophie's Boutique & Salon (Play Together Style).
 * Shared across Client (UI, 3D Engine) and Server (GameStore, Anti-cheat Validation).
 * No prices or item definitions should be hardcoded in React components.
 */

export const FASHION_RARITY = Object.freeze({
  COMMON: { id: 'common', label: 'Phổ thông', color: '#94a3b8', stars: 1 },
  RARE: { id: 'rare', label: 'Hiếm', color: '#3b82f6', stars: 2 },
  EPIC: { id: 'epic', label: 'Cao cấp', color: '#a855f7', stars: 3 },
  LEGENDARY: { id: 'legendary', label: 'Huyền thoại', color: '#eab308', stars: 4 },
});

export const FASHION_CATEGORIES = Object.freeze([
  { id: 'body', label: 'Cơ thể', icon: '🧍' },
  { id: 'hair', label: 'Tóc & Màu', icon: '💇' },
  { id: 'top', label: 'Áo', icon: '👗' },
  { id: 'bottom', label: 'Quần & Váy', icon: '👖' },
  { id: 'shoes', label: 'Giày dép', icon: '👟' },
  { id: 'ears', label: 'Tai thú', icon: '🐱' },
  { id: 'face', label: 'Khuôn mặt', icon: '👀' },
  { id: 'sets', label: 'Set trọn bộ', icon: '🎁' },
  { id: 'wardrobe', label: 'Tủ đồ của tôi', icon: '🎒' },
]);

export const HAIR_STYLES = Object.freeze([
  { id: 'hair_ponytail', name: 'Đuôi Ngựa Năng Động', desc: 'Tóc buộc sau gáy với mái mềm', cost: 260, rarity: 'rare', tag: 'NEW' },
  { id: 'hair_classic', name: 'Tóc Chibi Cổ Điển', desc: 'Tóc tròn chibi mộc mạc ôm sát đầu', cost: 0, rarity: 'common', tag: null },
  { id: 'hair_anime_bangs', name: 'Mái Ngố Anime Chunky', desc: 'Tóc mái tỉa layer bồng bềnh chuẩn manga', cost: 150, rarity: 'rare', tag: 'HOT' },
  { id: 'hair_twintails', name: 'Buộc Hai Chùm Đáng Yêu', desc: 'Tóc 2 chùm nhí nhảnh đung đưa khi chạy', cost: 250, rarity: 'epic', tag: 'POPULAR' },
  { id: 'hair_chic_bob', name: 'Tóc Bob Ngắn Cá Tính', desc: 'Kiểu tóc bob ôm cằm thời thượng hiện đại', cost: 220, rarity: 'rare', tag: null },
  { id: 'hair_wavy_curly', name: 'Sóng Nước Lãng Tử', desc: 'Lọn tóc uốn gợn sóng lãng mạn dạo phố', cost: 320, rarity: 'epic', tag: 'NEW' },
  { id: 'hair_slick_side', name: 'Rẽ Ngôi Quý Phái', desc: 'Rẽ ngôi vuốt nếp bóng mượt lịch lãm', cost: 380, rarity: 'legendary', tag: 'VIP' },
]);

export const HAIR_DYES = Object.freeze([
  { id: 'dye_chestnut', name: 'Nâu Hạt Dẻ', hex: '#76503b', cost: 0, rarity: 'common' },
  { id: 'dye_black', name: 'Đen Tuyền', hex: '#1e293b', cost: 50, rarity: 'common' },
  { id: 'dye_blonde', name: 'Vàng Mật Ong', hex: '#d9a852', cost: 90, rarity: 'rare' },
  { id: 'dye_platinum', name: 'Bạch Kim Sứ', hex: '#f1f5f9', cost: 120, rarity: 'rare' },
  { id: 'dye_pink', name: 'Hồng Đào Pastel', hex: '#d97096', cost: 140, rarity: 'epic' },
  { id: 'dye_lavender', name: 'Tím Khói Lavender', hex: '#9d7ec4', cost: 160, rarity: 'epic' },
  { id: 'dye_mint', name: 'Xanh Mint Bạc Hà', hex: '#38a89d', cost: 150, rarity: 'rare' },
  { id: 'dye_coral', name: 'Cam San Hô', hex: '#cf794c', cost: 130, rarity: 'rare' },
  { id: 'dye_coffee', name: 'Nâu Cà Phê Đậm', hex: '#451a03', cost: 70, rarity: 'common' },
  { id: 'dye_ruby', name: 'Đỏ Rượu Ruby', hex: '#b91c42', cost: 180, rarity: 'epic' },
  { id: 'dye_cyan', name: 'Xanh Biển Pha Lê', hex: '#298da8', cost: 150, rarity: 'rare' },
  { id: 'dye_midnight', name: 'Xanh Đêm Huyền Bí', hex: '#1e3a8a', cost: 170, rarity: 'epic' },
]);

export const TOPS = Object.freeze([
  { id: 'top_tank_basic', name: 'Áo Sát Nách Basic', desc: 'Form gọn, để lộ vai và cánh tay', color: '#f4ece1', cost: 0, rarity: 'common', tag: null },
  { id: 'top_tee_white', name: 'Áo Phông Trắng Basic', desc: 'Áo thun cotton cổ tròn mát mẻ', color: '#f8fafc', cost: 0, rarity: 'common', tag: null },
  { id: 'top_hoodie_cozy', name: 'Áo Hoodie Mũ Phồng', desc: 'Hoodie form rộng ấm áp có dây rút', color: '#fbcfe8', cost: 220, rarity: 'rare', tag: 'HOT' },
  { id: 'top_bomber_varsity', name: 'Áo Khoác Bóng Chày', desc: 'Bomber 2 màu viền gấu thể thao đường phố', color: '#3b82f6', cost: 350, rarity: 'epic', tag: 'NEW' },
  { id: 'top_croptop_sport', name: 'Croptop Năng Động', desc: 'Áo ngắn năng động khoe vòng eo đáng yêu', color: '#f43f5e', cost: 280, rarity: 'rare', tag: 'POPULAR' },
  { id: 'top_polo_preppy', name: 'Áo Polo Học Viện', desc: 'Áo thun cổ bẻ lịch sự phong cách học sinh', color: '#10b981', cost: 260, rarity: 'rare', tag: null },
  { id: 'top_knit_sweater', name: 'Áo Len Vặn Thừng', desc: 'Áo len dệt kim ấm áp phong cách mùa thu', color: '#f59e0b', cost: 400, rarity: 'legendary', tag: 'LIMITED' },
]);

export const BOTTOMS = Object.freeze([
  { id: 'bot_denim_shorts', name: 'Quần Shorts Jeans Xắn Gấu', desc: 'Quần bò cộc năng động thoải mái chạy nhảy', color: '#4778b6', cost: 0, rarity: 'common', tag: null },
  { id: 'bot_overalls_bib', name: 'Quần Yếm Denim Khuy Đồng', desc: 'Quần yếm nông dân kinh điển có túi ngực', color: '#2563eb', cost: 180, rarity: 'rare', tag: 'HOT' },
  { id: 'bot_tennis_skirt', name: 'Váy Tennis Xếp Ly', desc: 'Chân váy xếp ly xòe điệu đà chuẩn thần tượng', color: '#ffffff', cost: 320, rarity: 'epic', tag: 'POPULAR' },
  { id: 'bot_cargo_wide', name: 'Quần Hộp Ống Rộng', desc: 'Quần túi hộp streetwear phong cách baggy cá tính', color: '#475569', cost: 360, rarity: 'epic', tag: 'NEW' },
  { id: 'bot_jogger_sport', name: 'Quần Jogger Bo Gấu', desc: 'Quần thể thao nỉ êm ái có sọc kẻ hông', color: '#8b5cf6', cost: 240, rarity: 'rare', tag: null },
]);

export const SHOES = Object.freeze([
  { id: 'shoe_chunky_white', name: 'Sneaker Chunky Trắng Sứ', desc: 'Giày thể thao đế bánh mì mập mạp', color: '#ffffff', soleColor: '#f1f5f9', accentColor: '#3b82f6', cost: 0, rarity: 'common', tag: null },
  { id: 'shoe_running_neon', name: 'Giày Chạy Phối Màu Neon', desc: 'Sneaker thể thao phản quang năng động', color: '#10b981', soleColor: '#ffffff', accentColor: '#fbbf24', cost: 200, rarity: 'rare', tag: 'HOT' },
  { id: 'shoe_vintage_boots', name: 'Boots Da Cổ Lửng', desc: 'Đôi bốt da nâu phong trần ôm sát chân', color: '#78350f', soleColor: '#451a03', accentColor: '#b45309', cost: 340, rarity: 'epic', tag: null },
  { id: 'shoe_puffy_slides', name: 'Dép Bánh Bao Quai Ngang', desc: 'Dép đi chơi êm ái xốp phồng đi dạo biển', color: '#f472b6', soleColor: '#fbcfe8', accentColor: '#ffffff', cost: 160, rarity: 'rare', tag: 'CUTE' },
  { id: 'shoe_doll_flats', name: 'Giày Búp Bê Dây Cài', desc: 'Giày đế bệt tiểu thư có quai ngang ngọt ngào', color: '#e11d48', soleColor: '#881337', accentColor: '#ffffff', cost: 280, rarity: 'epic', tag: 'NEW' },
]);

export const EARS_OPTIONS = Object.freeze([
  { id: 'human', name: 'Tai Tròn Chibi', desc: 'Đôi tai nhỏ nhắn xinh xắn nguyên bản', cost: 0, rarity: 'common', tag: null },
  { id: 'cat_ears', name: 'Tai Mèo Vểnh Xinh', desc: 'Đôi tai mèo lông trắng hồng vểnh đáng yêu', cost: 250, rarity: 'epic', tag: 'POPULAR' },
  { id: 'rabbit_ears', name: 'Tai Thỏ Dài Cụp', desc: 'Tai thỏ mềm mại đung đưa khi chạy', cost: 280, rarity: 'epic', tag: 'CUTE' },
  { id: 'bear_ears', name: 'Tai Gấu Tròn Xốp', desc: 'Tai gấu bông tròn xoe ngộ nghĩnh', cost: 260, rarity: 'rare', tag: null },
  { id: 'elf_ears', name: 'Tai Yêu Tinh Elf', desc: 'Đôi tai nhọn phép thuật huyền bí', cost: 320, rarity: 'legendary', tag: 'VIP' },
]);

export const EYES_OPTIONS = Object.freeze([
  { id: 'classic', name: 'Mắt Búp Bê Kinh Điển', desc: 'Đôi mắt to tròn trong sáng Play Together', cost: 0, rarity: 'common' },
  { id: 'sparkle', name: 'Mắt Anime Lung Linh', desc: 'Đôi mắt chứa cả ngàn vì sao lấp lánh', cost: 160, rarity: 'rare' },
  { id: 'smile_arc', name: 'Mắt Cười Híp Tít', desc: 'Mắt cong hình trăng khuyết cười rạng rỡ', cost: 120, rarity: 'rare' },
  { id: 'cat_eyes', name: 'Mắt Mèo Kiêu Kỳ', desc: 'Đuôi mắt xếch nhẹ cá tính và sắc sảo', cost: 180, rarity: 'epic' },
  { id: 'surprised', name: 'Mắt Tròn Xoe Ngơ Ngác', desc: 'Biểu cảm tròn xoe ngạc nhiên ngộ nghĩnh', cost: 140, rarity: 'rare' },
]);

export const EYE_COLORS = Object.freeze([
  { id: 'eyecolor_brown', name: 'Nâu Hổ Phách', hex: '#785242', cost: 0 },
  { id: 'eyecolor_black', name: 'Đen Láy', hex: '#0f172a', cost: 40 },
  { id: 'eyecolor_ocean', name: 'Xanh Biển Sâu', hex: '#0284c7', cost: 80 },
  { id: 'eyecolor_amethyst', name: 'Tím Thạch Anh', hex: '#7c3aed', cost: 110 },
  { id: 'eyecolor_emerald', name: 'Xanh Ngọc Lục Bảo', hex: '#059669', cost: 110 },
]);

export const NOSE_OPTIONS = Object.freeze([
  { id: 'dot', name: 'Nốt Chấm Mờ Xinh', cost: 0 },
  { id: 'cat_nose', name: 'Mũi Mèo Tam Giác', cost: 80 },
  { id: 'none', name: 'Ẩn Mũi Tối Giản', cost: 0 },
]);

export const MOUTH_OPTIONS = Object.freeze([
  { id: 'smile', name: 'Cười Mỉm Chúm Chím', cost: 0 },
  { id: 'beaming', name: 'Cười Tít Mắt Hở Răng', cost: 90 },
  { id: 'cat_mouth', name: 'Miệng Mèo Chu Môi :3', cost: 130 },
  { id: 'surprised_o', name: 'Miệng Tròn Ngạc Nhiên', cost: 90 },
  { id: 'tongue', name: 'Thè Lưỡi Nhí Nhảnh', cost: 150 },
]);

export const BLUSH_OPTIONS = Object.freeze([
  { id: 'peach', name: 'Phấn Đào Ombre Tự Nhiên', cost: 0 },
  { id: 'heart', name: 'Trái Tim Má Hồng', cost: 120 },
  { id: 'drunk', name: 'Má Đỏ Say Nắng', cost: 100 },
  { id: 'none', name: 'Không Dùng Má Hồng', cost: 0 },
]);

export const FULL_SETS = Object.freeze([
  {
    id: 'set_farmer_hero',
    name: 'Nông Dân Triệu Phú',
    desc: 'Set đồ làm vườn cao cấp kết hợp mũ cói và yếm denim',
    hair: 'hair_classic', hairColor: '#76503b',
    top: 'top_hoodie_cozy', bottom: 'bot_overalls_bib',
    shoes: 'shoe_chunky_white', ears: 'human',
    cost: 380,
    rarity: 'rare',
    customization: {
      hairStyle: 'hair_classic', hairColor: '#76503b',
      topId: 'top_hoodie_cozy', topColor: '#e06c35',
      bottomId: 'bot_overalls_bib', bottomColor: '#3b82f6',
      shoeId: 'shoe_chunky_white', shoeColor: '#ffffff',
      ears: 'human', eyeType: 'classic', eyeColor: '#785242',
      noseType: 'dot', mouthType: 'smile', blushType: 'peach',
    },
  },
  {
    id: 'set_kpop_star',
    name: 'Idol K-Pop Dạo Phố',
    desc: 'Tóc 2 chùm hồng pastel, váy tennis xếp ly và tai mèo',
    hair: 'hair_twintails', hairColor: '#f472b6',
    top: 'top_croptop_sport', bottom: 'bot_tennis_skirt',
    shoes: 'shoe_running_neon', ears: 'cat_ears',
    cost: 950,
    rarity: 'epic',
    customization: {
      hairStyle: 'hair_twintails', hairColor: '#f472b6',
      topId: 'top_croptop_sport', topColor: '#f43f5e',
      bottomId: 'bot_tennis_skirt', bottomColor: '#ffffff',
      shoeId: 'shoe_running_neon', shoeColor: '#22c55e',
      ears: 'cat_ears', eyeType: 'cat_eyes', eyeColor: '#0284c7',
      noseType: 'cat_nose', mouthType: 'cat_mouth', blushType: 'heart',
    },
  },
  {
    id: 'set_streetwear_king',
    name: 'Streetwear Đường Phố',
    desc: 'Áo khoác bóng chày, quần túi hộp và sneaker bánh mì',
    hair: 'hair_wavy_curly', hairColor: '#1e293b',
    top: 'top_bomber_varsity', bottom: 'bot_cargo_wide',
    shoes: 'shoe_chunky_white', ears: 'human',
    cost: 890,
    rarity: 'epic',
    customization: {
      hairStyle: 'hair_wavy_curly', hairColor: '#1e293b',
      topId: 'top_bomber_varsity', topColor: '#1e293b',
      bottomId: 'bot_cargo_wide', bottomColor: '#475569',
      shoeId: 'shoe_chunky_white', shoeColor: '#ffffff',
      ears: 'human', eyeType: 'smile_arc', eyeColor: '#1e293b',
      noseType: 'dot', mouthType: 'beaming', blushType: 'drunk',
    },
  },
  {
    id: 'set_bunny_dream',
    name: 'Thỏ Con Mộng Mơ',
    desc: 'Len dệt ấm áp, tai thỏ cụp đáng yêu và má phấn đào',
    hair: 'hair_anime_bangs', hairColor: '#fbcfe8',
    top: 'top_knit_sweater', bottom: 'bot_tennis_skirt',
    shoes: 'shoe_puffy_slides', ears: 'rabbit_ears',
    cost: 820,
    rarity: 'legendary',
    customization: {
      hairStyle: 'hair_anime_bangs', hairColor: '#fbcfe8',
      topId: 'top_knit_sweater', topColor: '#fb7185',
      bottomId: 'bot_tennis_skirt', bottomColor: '#ffe4e6',
      shoeId: 'shoe_puffy_slides', shoeColor: '#fef08a',
      ears: 'rabbit_ears', eyeType: 'sparkle', eyeColor: '#ec4899',
      noseType: 'none', mouthType: 'cat_mouth', blushType: 'peach',
    },
  },
  {
    id: 'set_elf_ranger',
    name: 'Du Hiệp Rừng Xanh',
    desc: 'Trang phục kiểm lâm thanh lịch với đôi tai elf kỳ ảo',
    hair: 'hair_slick_back', hairColor: '#d97706',
    top: 'top_polo_preppy', bottom: 'bot_cargo_wide',
    shoes: 'shoe_boots_vintage', ears: 'elf_ears',
    cost: 880,
    rarity: 'legendary',
    customization: {
      hairStyle: 'hair_slick_back', hairColor: '#d97706',
      topId: 'top_polo_preppy', topColor: '#059669',
      bottomId: 'bot_cargo_wide', bottomColor: '#064e3b',
      shoeId: 'shoe_boots_vintage', shoeColor: '#78350f',
      ears: 'elf_ears', eyeType: 'cat_eyes', eyeColor: '#10b981',
      noseType: 'dot', mouthType: 'smile', blushType: 'none',
    },
  },
]);

/**
 * Fast lookup registry mapping all purchasable item IDs to their item definition.
 */
export const ALL_FASHION_ITEMS_MAP = Object.freeze(
  [
    ...HAIR_STYLES,
    ...HAIR_DYES,
    ...TOPS,
    ...BOTTOMS,
    ...SHOES,
    ...EARS_OPTIONS,
    ...EYES_OPTIONS,
    ...EYE_COLORS,
    ...NOSE_OPTIONS,
    ...MOUTH_OPTIONS,
    ...BLUSH_OPTIONS,
    ...FULL_SETS,
  ].reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {})
);

/**
 * Retrieve item by ID safely.
 */
export function getFashionItem(id) {
  return ALL_FASHION_ITEMS_MAP[id] || null;
}

/**
 * Default avatar customization state for newly registered players.
 */
export function getDefaultCustomization() {
  return {
    gender: 'female',
    skinTone: 'peach',
    skinColor: '#e6b08f',
    hairStyle: 'hair_classic',
    hairColor: '#76503b',
    topId: 'top_tee_white',
    topStyle: 'top_tee_white',
    topColor: '#f8fafc',
    bottomId: 'bot_denim_shorts',
    bottomStyle: 'bot_denim_shorts',
    bottomColor: '#4778b6',
    shoeId: 'shoe_chunky_white',
    shoeStyle: 'shoe_chunky_white',
    shoeColor: '#ffffff',
    ears: 'human',
    earType: 'human',
    eyeType: 'classic',
    eyeColor: '#785242',
    noseType: 'dot',
    mouthType: 'smile',
    blushType: 'peach',
  };
}

/**
 * Normalizes customization state ensuring default fallbacks and property aliases.
 */
export function normalizeCustomization(custom = {}) {
  const defaults = getDefaultCustomization();
  const appearance = normalizeCharacterAppearance(custom);
  const hairStyle = custom.hairStyle || custom.hair || defaults.hairStyle;
  const hairColor = safeCharacterHex(custom.hairColor || defaults.hairColor, defaults.hairColor);
  const topId = custom.topId || custom.topStyle || custom.top || defaults.topId;
  const topColor = safeCharacterHex(custom.topColor || defaults.topColor, defaults.topColor);
  const bottomId = custom.bottomId || custom.bottomStyle || custom.bottom || defaults.bottomId;
  const bottomColor = safeCharacterHex(custom.bottomColor || defaults.bottomColor, defaults.bottomColor);
  const shoeId = custom.shoeId || custom.shoeStyle || custom.shoe || custom.shoes || defaults.shoeId;
  const shoeColor = safeCharacterHex(custom.shoeColor || defaults.shoeColor, defaults.shoeColor);
  const ears = custom.ears || custom.earType || defaults.ears;
  const eyeType = custom.eyeType || defaults.eyeType;
  const eyeColor = safeCharacterHex(custom.eyeColor || defaults.eyeColor, defaults.eyeColor);
  const noseType = custom.noseType || defaults.noseType;
  const mouthType = custom.mouthType || defaults.mouthType;
  const blushType = custom.blushType || defaults.blushType;

  return {
    gender: appearance.gender,
    skinTone: appearance.skinTone,
    skinColor: appearance.skinColor,
    hairStyle,
    hairColor,
    topId,
    topStyle: topId,
    topColor,
    bottomId,
    bottomStyle: bottomId,
    bottomColor,
    shoeId,
    shoeStyle: shoeId,
    shoeColor,
    ears,
    earType: ears,
    eyeType,
    eyeColor,
    noseType,
    mouthType,
    blushType,
  };
}

/**
 * Calculate the verified total coin cost and list of unowned items.
 * Used on Server-Side to guarantee price integrity and anti-cheat.
 * @param {string[]} ownedItemIds - IDs already owned by the player
 * @param {string[]} requestedItemIds - IDs of items the player wants to acquire
 * @returns {{ verifiedCost: number, validNewItemIds: string[] }}
 */
export function calculateVerifiedCustomizationCost(ownedItemIds = [], requestedItemIds = []) {
  const ownedSet = new Set(ownedItemIds || []);
  const validNewItemIds = [];
  let verifiedCost = 0;

  for (const id of requestedItemIds) {
    if (!id || ownedSet.has(id)) continue;
    const item = ALL_FASHION_ITEMS_MAP[id];
    if (!item) continue;

    const cost = Math.max(0, Number(item.cost) || 0);
    if (cost > 0) {
      verifiedCost += cost;
    }
    validNewItemIds.push(id);
  }

  return { verifiedCost, validNewItemIds };
}
