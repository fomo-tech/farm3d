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
  { id: 'body', label: 'Cơ thể', iconKey: 'body' },
  { id: 'hair', label: 'Tóc & Màu', iconKey: 'hair' },
  { id: 'top', label: 'Áo', iconKey: 'top' },
  { id: 'bottom', label: 'Quần & Váy', iconKey: 'bottom' },
  { id: 'shoes', label: 'Giày dép', iconKey: 'shoes' },
  { id: 'ears', label: 'Tai thú', iconKey: 'ears' },
  { id: 'face', label: 'Khuôn mặt', iconKey: 'face' },
  { id: 'sets', label: 'Set trọn bộ', iconKey: 'sets' },
  { id: 'wardrobe', label: 'Tủ đồ của tôi', iconKey: 'wardrobe' },
]);

export const HAIR_STYLES = Object.freeze([
  { id: 'hair_ponytail', name: 'Đuôi Ngựa Năng Động', desc: 'Tóc buộc sau gáy với mái mềm', cost: 260, rarity: 'rare', tag: 'NEW' },
  { id: 'hair_classic', name: 'Tóc Chibi Cổ Điển', desc: 'Tóc tròn chibi mộc mạc ôm sát đầu', cost: 0, rarity: 'common', tag: null },
  { id: 'hair_anime_bangs', name: 'Mái Ngố Anime Chunky', desc: 'Tóc mái tỉa layer bồng bềnh chuẩn manga', cost: 150, rarity: 'rare', tag: 'HOT' },
  { id: 'hair_twintails', name: 'Buộc Hai Chùm Đáng Yêu', desc: 'Tóc 2 chùm nhí nhảnh đung đưa khi chạy', cost: 250, rarity: 'epic', tag: 'POPULAR' },
  { id: 'hair_chic_bob', name: 'Tóc Bob Ngắn Cá Tính', desc: 'Kiểu tóc bob ôm cằm thời thượng hiện đại', cost: 220, rarity: 'rare', tag: null },
  { id: 'hair_wavy_curly', name: 'Sóng Nước Lãng Tử', desc: 'Lọn tóc uốn gợn sóng lãng mạn dạo phố', cost: 320, rarity: 'epic', tag: 'NEW' },
  { id: 'hair_slick_side', name: 'Rẽ Ngôi Quý Phái', desc: 'Rẽ ngôi vuốt nếp bóng mượt lịch lãm', cost: 380, rarity: 'legendary', tag: 'VIP' },
  { id: 'hair_wolf_cut', name: 'Tóc Wolf Cut Học Đường', desc: 'Tỉa layer sói cá tính chuẩn thần tượng K-Pop', cost: 340, rarity: 'epic', tag: 'TREND' },
  { id: 'hair_beach_surfer', name: 'Tóc Lướt Sóng Mùa Hè', desc: 'Lọn tóc vàng bồng bềnh lộng gió biển Hawaii', cost: 290, rarity: 'rare', tag: 'SUMMER' },
  { id: 'hair_celestial_flow', name: 'Tóc Bạch Kim Tiên Tử', desc: 'Dải tóc suôn mượt huyền ảo thánh thiện', cost: 450, rarity: 'legendary', tag: 'MYTHIC' },
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
  { id: 'dye_matcha', name: 'Xanh Matcha Trà Sữa', hex: '#84cc16', cost: 160, rarity: 'rare' },
  { id: 'dye_sunset_gold', name: 'Vàng Nắng Hoàng Hôn', hex: '#f59e0b', cost: 150, rarity: 'rare' },
  { id: 'dye_ocean_teal', name: 'Xanh Ngọc Biển Sâu', hex: '#0d9488', cost: 190, rarity: 'epic' },
]);

export const TOPS = Object.freeze([
  { id: 'top_tank_basic', name: 'Áo Sát Nách Basic', desc: 'Form gọn, để lộ vai và cánh tay', color: '#f4ece1', cost: 0, rarity: 'common', tag: null },
  { id: 'top_tee_white', name: 'Áo Phông Trắng Basic', desc: 'Áo thun cotton cổ tròn mát mẻ', color: '#f8fafc', cost: 0, rarity: 'common', tag: null },
  { id: 'top_hoodie_cozy', name: 'Áo Hoodie Mũ Phồng', desc: 'Hoodie form rộng ấm áp có dây rút', color: '#fbcfe8', cost: 220, rarity: 'rare', tag: 'HOT' },
  { id: 'top_bomber_varsity', name: 'Áo Khoác Bóng Chày', desc: 'Bomber 2 màu viền gấu thể thao đường phố', color: '#3b82f6', cost: 350, rarity: 'epic', tag: 'NEW' },
  { id: 'top_croptop_sport', name: 'Croptop Năng Động', desc: 'Áo ngắn năng động khoe vòng eo đáng yêu', color: '#f43f5e', cost: 280, rarity: 'rare', tag: 'POPULAR' },
  { id: 'top_polo_preppy', name: 'Áo Polo Học Viện', desc: 'Áo thun cổ bẻ lịch sự phong cách học sinh', color: '#10b981', cost: 260, rarity: 'rare', tag: null },
  { id: 'top_knit_sweater', name: 'Áo Len Vặn Thừng', desc: 'Áo len dệt kim ấm áp phong cách mùa thu', color: '#f59e0b', cost: 400, rarity: 'legendary', tag: 'LIMITED' },
  { id: 'top_school_blazer', name: 'Áo Blazer Học Viện', desc: 'Blazer đồng phục xanh navy cài cà vạt kẻ sọc', color: '#1e3a8a', cost: 380, rarity: 'epic', tag: 'ACADEMY' },
  { id: 'top_hawaii_shirt', name: 'Sơ Mi Hawaii Nhiệt Đới', desc: 'Áo cộc tay hoa lá rực rỡ kỳ nghỉ biển', color: '#06b6d4', cost: 310, rarity: 'rare', tag: 'SUMMER' },
  { id: 'top_duck_hoodie', name: 'Áo Phao Vịt Vàng', desc: 'Áo phao lông vịt vàng ươm mập mạp', color: '#facc15', cost: 420, rarity: 'epic', tag: 'CUTE' },
  { id: 'top_angel_tunic', name: 'Áo Choàng Bạch Y Thánh', desc: 'Áo lụa trắng viền chỉ vàng kim thánh thiện', color: '#ffffff', cost: 520, rarity: 'legendary', tag: 'HOLY' },
  { id: 'top_suit_vest_luxury', name: 'Bộ Vest Quý Tộc Tuxedo', desc: 'Gile ôm dáng, sơ mi trắng cổ bẻ thắt nơ đỏ quý phái chuẩn tiệc dạ hội Play Together', color: '#1e293b', cost: 580, rarity: 'legendary', tag: 'VIP' },
  { id: 'top_school_vest', name: 'Áo Gile Len Học Viện', desc: 'Gile dệt kim phong cách quý tộc Anh Quốc kèm nơ cổ đỏ', color: '#831843', cost: 360, rarity: 'epic', tag: 'ACADEMY' },
  { id: 'top_cat_ear_hoodie', name: 'Hoodie Mèo Đen Streetwear', desc: 'Hoodie form rộng túi kangaroo cá tính bồng bềnh sau lưng', color: '#18181b', cost: 420, rarity: 'epic', tag: 'HOT' },
  { id: 'top_dino_hoodie', name: 'Áo Hoodie Khủng Long Dino', desc: 'Hoodie xanh lá nhạt siêu đáng yêu với form rộng phồng to', color: '#22c55e', cost: 450, rarity: 'epic', tag: 'CUTE' },
  { id: 'top_pastel_cloud_hoodie', name: 'Hoodie Mây Bồng Pastel', desc: 'Hoodie phồng kẹo bông màu tím phấn ombre siêu ngọt ngào', color: '#c084fc', cost: 390, rarity: 'rare', tag: 'SWEET' },
  { id: 'top_sailor_uniform', name: 'Đồng Phục Nữ Sinh Thủy Thủ', desc: 'Áo thủy thủ cổ sen rộng viền sọc đôi, nơ lụa đỏ thắm chuẩn anime', color: '#ffffff', cost: 480, rarity: 'legendary', tag: 'ANIME' },
  { id: 'top_cyber_jacket', name: 'Áo Khoác Techwear Tương Lai', desc: 'Áo khoác đai khóa chiến thuật phong cách Neon Cyberpunk cực ngầu', color: '#09090b', cost: 540, rarity: 'legendary', tag: 'CYBER' },
  { id: 'top_royal_prince', name: 'Áo Hoàng Tử Bạch Mã', desc: 'Áo quân phục hoàng gia trắng muốt viền vàng, cầu vai tua rua danh dự', color: '#ffffff', cost: 680, rarity: 'legendary', tag: 'MYTHIC' },
  { id: 'top_ballgown_corset', name: 'Corset Dạ Hội Công Chúa', desc: 'Áo corset dạ hội công chúa thắt eo quý phái đính viền ren ngọc trai', color: '#fbcfe8', cost: 620, rarity: 'legendary', tag: 'MYTHIC' },
  { id: 'top_vampire_count', name: 'Áo Bá Tước Ma Cà Rồng', desc: 'Cổ áo dựng nhọn uy quyền, áo gile nhung đỏ thẫm đính huân chương dơi bạc', color: '#7f1d1d', cost: 590, rarity: 'legendary', tag: 'GOTHIC' },
  { id: 'top_kimono_sakura', name: 'Yukata Hoa Anh Đào', desc: 'Trang phục kimono truyền thống vạt chéo, đai lưng Obi vàng hoa rực rỡ', color: '#f472b6', cost: 520, rarity: 'epic', tag: 'FESTIVAL' },
  { id: 'top_teddy_mascot', name: 'Áo Gấu Bông Teddy Khổng Lồ', desc: 'Áo bông lông xù tròn xoe ấm áp phong cách linh vật mascot Play Together', color: '#92400e', cost: 580, rarity: 'legendary', tag: 'MASCOT' },
  // Áo dài Việt Nam Nam & Nữ
  { id: 'top_aodai_nu_sen', name: 'Áo Dài Nữ Hoa Sen Hồng', desc: 'Áo dài lụa truyền thống dáng ôm tôn nét duyên, cổ cao 3 phân, hai tà áo thướt tha mềm mại', color: '#f472b6', cost: 580, rarity: 'legendary', tag: 'VIETNAM' },
  { id: 'top_aodai_nu_trang', name: 'Áo Dài Trắng Nữ Sinh Tinh Khôi', desc: 'Áo dài lụa trắng thanh khiết, cổ tàu truyền thống duyên dáng tà áo bay nhẹ trong gió', color: '#ffffff', cost: 480, rarity: 'epic', tag: 'VIETNAM' },
  { id: 'top_aodai_nam_gam', name: 'Áo Dài Nam Cách Tân Gấm Rồng', desc: 'Áo dài nam ngũ thân cách tân chất gấm xanh hoàng gia, vạt chéo đính khuy đồng vương giả', color: '#1e3a8a', cost: 580, rarity: 'legendary', tag: 'VIETNAM' },
  { id: 'top_aodai_nam_gold', name: 'Áo Dài Nam Hoàng Triều Gấm Vàng', desc: 'Áo dài nam cách tân gấm vàng thêu họa tiết mây hoàng cung, tôn phong thái đĩnh đạc uy nghiêm', color: '#eab308', cost: 620, rarity: 'legendary', tag: 'VIETNAM' },
  // Thời trang Học Đường & K-Pop Streetwear
  { id: 'top_kpop_streetwear', name: 'Áo Thun K-Pop Idol Streetwear', desc: 'Áo thun đen form rộng layering cổ lọ trắng, phối dây xích bạc và quai chéo sân khấu cực chất', color: '#18181b', cost: 490, rarity: 'epic', tag: 'KPOP' },
  { id: 'top_kpop_harness_crop', name: 'Croptop K-Pop Dây Đai Idol', desc: 'Croptop đen cá tính phối harness đai da và xích kim loại biểu diễn sân khấu', color: '#09090b', cost: 520, rarity: 'legendary', tag: 'KPOP' },
  { id: 'top_kpop_cardigan_school', name: 'Áo Cardigan Học Đường Idol', desc: 'Cardigan dệt kim kẻ sọc cổ V phong cách học sinh K-Drama, phối sơ mi trắng cà vạt lỏng', color: '#334155', cost: 450, rarity: 'epic', tag: 'ACADEMY' },
  // Áo Vest & Blazers
  { id: 'top_blazer_luxury', name: 'Áo Vest Blazer Doanh Nhân Sang Trọng', desc: 'Áo vest blazer xanh navy may đo cao cấp, ve áo sắc sảo, cúc mạ vàng và khăn lụa cài túi ngực', color: '#0f172a', cost: 580, rarity: 'legendary', tag: 'SUIT' },
  { id: 'top_vest_tuxedo_white', name: 'Áo Vest Tuxedo Dạ Hội Bạch Kim', desc: 'Bộ Tuxedo trắng muốt quý phái, ve áo satin đen tương phản kèm nơ bướm đen lịch lãm', color: '#f8fafc', cost: 620, rarity: 'legendary', tag: 'VIP' },
  { id: 'top_vest_pinstripe', name: 'Áo Vest Kẻ Sọc Quý Tộc Anh Quốc', desc: 'Vest hai hàng khuy kẻ sọc pinstripe cổ điển đậm chất quý tộc thành London', color: '#1e293b', cost: 600, rarity: 'legendary', tag: 'SUIT' },
]);

export const BOTTOMS = Object.freeze([
  { id: 'bot_denim_shorts', name: 'Quần Shorts Jeans Xắn Gấu', desc: 'Quần bò cộc năng động thoải mái chạy nhảy', color: '#4778b6', cost: 0, rarity: 'common', tag: null },
  { id: 'bot_overalls_bib', name: 'Quần Yếm Denim Khuy Đồng', desc: 'Quần yếm nông dân kinh điển có túi ngực', color: '#2563eb', cost: 180, rarity: 'rare', tag: 'HOT' },
  { id: 'bot_tennis_skirt', name: 'Váy Tennis Xếp Ly', desc: 'Chân váy xếp ly xòe điệu đà chuẩn thần tượng', color: '#ffffff', cost: 320, rarity: 'epic', tag: 'POPULAR' },
  { id: 'bot_cargo_wide', name: 'Quần Hộp Ống Rộng', desc: 'Quần túi hộp streetwear phong cách baggy cá tính', color: '#475569', cost: 360, rarity: 'epic', tag: 'NEW' },
  { id: 'bot_jogger_sport', name: 'Quần Jogger Bo Gấu', desc: 'Quần thể thao nỉ êm ái có sọc kẻ hông', color: '#8b5cf6', cost: 240, rarity: 'rare', tag: null },
  { id: 'bot_school_uniform', name: 'Váy Kẻ Caro Học Đường', desc: 'Váy xếp ly họa tiết kẻ caro nữ sinh thanh lịch', color: '#1e3a8a', cost: 340, rarity: 'epic', tag: 'ACADEMY' },
  { id: 'bot_swim_trunks', name: 'Quần Bơi Biển Nhiệt Đới', desc: 'Quần đùi bơi họa tiết sóng biển thoáng mát', color: '#0284c7', cost: 220, rarity: 'rare', tag: 'SUMMER' },
  { id: 'bot_duck_pants', name: 'Quần Yếm Vịt Lông Xốp', desc: 'Quần yếm vàng ươm xốp mềm có đuôi vịt', color: '#eab308', cost: 360, rarity: 'epic', tag: 'CUTE' },
  { id: 'bot_angel_pants', name: 'Quần Lụa Trắng Thần Tiên', desc: 'Quần ống suông mềm mại đính ngọc trai', color: '#f8fafc', cost: 480, rarity: 'legendary', tag: 'HOLY' },
  { id: 'bot_suit_slacks', name: 'Quần Tây Quý Tộc Ly Thẳng', desc: 'Quần âu đen tuyền may đo thanh lịch, tôn dáng chuẩn quý ông lịch lãm', color: '#1e293b', cost: 420, rarity: 'epic', tag: 'VIP' },
  { id: 'bot_plaid_pleated_pink', name: 'Váy Tennis Caro Hồng Phấn', desc: 'Chân váy xếp ly họa tiết kẻ caro pastel ngọt ngào tung bay khi nhảy', color: '#f472b6', cost: 360, rarity: 'epic', tag: 'CUTE' },
  { id: 'bot_sailor_skirt', name: 'Chân Váy Xếp Ly Thủy Thủ', desc: 'Váy xòe xanh thẫm viền ruy băng trắng đồng điệu áo thủy thủ', color: '#1e3a8a', cost: 380, rarity: 'epic', tag: 'ANIME' },
  { id: 'bot_tech_straps', name: 'Quần Hộp Đai Dây Cyberpunk', desc: 'Quần jogger đa túi hộp phối đai khóa chiến thuật đen huyền bí', color: '#18181b', cost: 460, rarity: 'legendary', tag: 'CYBER' },
  { id: 'bot_ballgown_princess', name: 'Váy Dạ Hội Công Chúa Bồng Bềnh', desc: 'Chân váy chuông khổng lồ bồng bềnh viền ren lụa hoàng gia', color: '#fbcfe8', cost: 720, rarity: 'legendary', tag: 'MYTHIC' },
  { id: 'bot_royal_prince_pants', name: 'Quần Lụa Hoàng Tử Viền Vàng', desc: 'Quần tây trắng kẻ sọc vàng hoàng gia đồng điệu áo hoàng tử', color: '#ffffff', cost: 480, rarity: 'epic', tag: 'MYTHIC' },
  { id: 'bot_gothic_lolita_skirt', name: 'Chân Váy Gothic Lolita Ren Đen', desc: 'Váy xòe phồng ren đen ma mị phong cách quý tộc gothic', color: '#18181b', cost: 560, rarity: 'epic', tag: 'GOTHIC' },
  { id: 'bot_teddy_pants', name: 'Quần Gấu Bông Mập Mạp', desc: 'Quần lông gấu nâu phồng to tròn xoe đồng bộ mascot', color: '#92400e', cost: 460, rarity: 'epic', tag: 'MASCOT' },
  // Áo dài Việt Nam - Quần lụa
  { id: 'bot_aodai_pants_silk', name: 'Quần Lụa Trắng Thướt Tha Áo Dài', desc: 'Quần lụa trắng ống rộng mềm mại kết hợp hài hòa cùng tà áo dài truyền thống', color: '#fdfbf7', cost: 380, rarity: 'epic', tag: 'VIETNAM' },
  { id: 'bot_aodai_pants_black', name: 'Quần Lụa Đen Truyền Thống', desc: 'Quần lụa đen óng ả phong cách cổ điển truyền thống tôn dáng tà áo dài', color: '#1e293b', cost: 340, rarity: 'epic', tag: 'VIETNAM' },
  // K-Pop Streetwear
  { id: 'bot_kpop_cargo_chains', name: 'Quần Hộp K-Pop Dây Xích Streetwear', desc: 'Quần túi hộp baggy đen đính xích kim loại và đai rủ phong cách thần tượng K-Pop', color: '#18181b', cost: 420, rarity: 'epic', tag: 'KPOP' },
]);

export const SHOES = Object.freeze([
  { id: 'shoe_chunky_white', name: 'Sneaker Chunky Trắng Sứ', desc: 'Giày thể thao đế bánh mì mập mạp', color: '#ffffff', soleColor: '#f1f5f9', accentColor: '#3b82f6', cost: 0, rarity: 'common', tag: null },
  { id: 'shoe_running_neon', name: 'Giày Chạy Phối Màu Neon', desc: 'Sneaker thể thao phản quang năng động', color: '#10b981', soleColor: '#ffffff', accentColor: '#fbbf24', cost: 200, rarity: 'rare', tag: 'HOT' },
  { id: 'shoe_vintage_boots', name: 'Boots Da Cổ Lửng', desc: 'Đôi bốt da nâu phong trần ôm sát chân', color: '#78350f', soleColor: '#451a03', accentColor: '#b45309', cost: 340, rarity: 'epic', tag: null },
  { id: 'shoe_puffy_slides', name: 'Dép Bánh Bao Quai Ngang', desc: 'Dép đi chơi êm ái xốp phồng đi dạo biển', color: '#f472b6', soleColor: '#fbcfe8', accentColor: '#ffffff', cost: 160, rarity: 'rare', tag: 'CUTE' },
  { id: 'shoe_doll_flats', name: 'Giày Búp Bê Dây Cài', desc: 'Giày đế bệt tiểu thư có quai ngang ngọt ngào', color: '#e11d48', soleColor: '#881337', accentColor: '#ffffff', cost: 280, rarity: 'epic', tag: 'NEW' },
  { id: 'shoe_school_loafers', name: 'Giày Loafer Da Tất Cao', desc: 'Giày da học đường cổ điển kèm tất trắng', color: '#0f172a', soleColor: '#1e293b', accentColor: '#ffffff', cost: 320, rarity: 'epic', tag: 'ACADEMY' },
  { id: 'shoe_beach_sandals', name: 'Dép Xỏ Ngón Sao Biển', desc: 'Dép tông đi biển đính charm sao biển xanh', color: '#06b6d4', soleColor: '#fef08a', accentColor: '#ffffff', cost: 180, rarity: 'rare', tag: 'SUMMER' },
  { id: 'shoe_duck_feet', name: 'Dép Màng Chân Vịt', desc: 'Đôi chân vịt cam bẹp bẹp lạch bạch ngộ nghĩnh', color: '#f97316', soleColor: '#ea580c', accentColor: '#ffedd5', cost: 360, rarity: 'epic', tag: 'CUTE' },
  { id: 'shoe_celestial_heels', name: 'Sandal Thần Thoại Mạ Vàng', desc: 'Quai sandal quấn ánh kim thiên sứ lấp lánh', color: '#facc15', soleColor: '#ffffff', accentColor: '#ca8a04', cost: 490, rarity: 'legendary', tag: 'HOLY' },
  { id: 'shoe_oxford_wingtip', name: 'Giày Da Oxford Brogue', desc: 'Giày da bóng mũi khắc hoa văn quý tộc Anh Quốc', color: '#3f1a0e', soleColor: '#1c1917', accentColor: '#d97706', cost: 380, rarity: 'epic', tag: 'VIP' },
  { id: 'shoe_dino_claws', name: 'Dép Bông Vuốt Khủng Long', desc: 'Đôi dép bông xanh lá có 3 móng vuốt cưng xỉu bước đi lộc cộc', color: '#22c55e', soleColor: '#15803d', accentColor: '#fde047', cost: 320, rarity: 'rare', tag: 'CUTE' },
  { id: 'shoe_mary_jane', name: 'Giày Búp Bê Nữ Sinh Tất Cao', desc: 'Giày Mary Jane da bóng cài khuy ngang kèm tất trắng cao cổ tiểu thư', color: '#0f172a', soleColor: '#ffffff', accentColor: '#e2e8f0', cost: 340, rarity: 'epic', tag: 'ANIME' },
  { id: 'shoe_roller_skates', name: 'Giày Trượt Patin 4 Bánh Retro', desc: 'Giày patin thể thao 4 bánh xe neon dạ quang lướt gió siêu tốc', color: '#ec4899', soleColor: '#06b6d4', accentColor: '#facc15', cost: 490, rarity: 'legendary', tag: 'SPEED' },
  { id: 'shoe_glass_slippers', name: 'Hài Pha Lê Lọ Lem', desc: 'Đôi giày thủy tinh trong suốt lấp lánh như ngàn vì sao', color: '#e0f2fe', soleColor: '#ffffff', accentColor: '#38bdf8', cost: 650, rarity: 'legendary', tag: 'MYTHIC' },
  { id: 'shoe_royal_prince_boots', name: 'Boots Hoàng Gia Kỵ Sĩ Trắng', desc: 'Đôi bốt da trắng cao cổ mạ vàng kỵ sĩ hoàng cung', color: '#f8fafc', soleColor: '#1e293b', accentColor: '#fbbf24', cost: 420, rarity: 'epic', tag: 'MYTHIC' },
  { id: 'shoe_geta_wood', name: 'Guốc Gỗ Geta Quai Đỏ', desc: 'Đôi guốc gỗ mộc truyền thống bước đi lách cách vui tai', color: '#78350f', soleColor: '#451a03', accentColor: '#ef4444', cost: 280, rarity: 'rare', tag: 'FESTIVAL' },
]);

export const EARS_OPTIONS = Object.freeze([
  { id: 'human', name: 'Tai Tròn Chibi', desc: 'Đôi tai nhỏ nhắn xinh xắn nguyên bản', cost: 0, rarity: 'common', tag: null },
  { id: 'cat_ears', name: 'Tai Mèo Vểnh Xinh', desc: 'Đôi tai mèo lông trắng hồng vểnh đáng yêu', cost: 250, rarity: 'epic', tag: 'POPULAR' },
  { id: 'rabbit_ears', name: 'Tai Thỏ Dài Cụp', desc: 'Tai thỏ mềm mại đung đưa khi chạy', cost: 280, rarity: 'epic', tag: 'CUTE' },
  { id: 'bear_ears', name: 'Tai Gấu Tròn Xốp', desc: 'Tai gấu bông tròn xoe ngộ nghĩnh', cost: 260, rarity: 'rare', tag: null },
  { id: 'elf_ears', name: 'Tai Yêu Tinh Elf', desc: 'Đôi tai nhọn phép thuật huyền bí', cost: 320, rarity: 'legendary', tag: 'VIP' },
  { id: 'shiba_ears', name: 'Tai Cún Shiba Vàng', desc: 'Đôi tai chó Shiba tròn xoe nhí nhảnh', cost: 310, rarity: 'epic', tag: 'PUPPY' },
  { id: 'duck_beak', name: 'Mũ Vịt Mỏ Cam Quack', desc: 'Mỏ vịt con kêu cạp cạp đáng yêu', cost: 350, rarity: 'epic', tag: 'CUTE' },
  { id: 'halo_crown', name: 'Vòng Hào Quang Thiên Thần', desc: 'Vòng thánh vàng kim phát sáng bay lượn', cost: 580, rarity: 'legendary', tag: 'HOLY' },
  { id: 'duck_floatie', name: 'Phao Vịt Vàng Quanh Eo', desc: 'Vòng phao bơi vịt con lắc lư siêu cưng', cost: 480, rarity: 'legendary', tag: 'TREND' },
  { id: 'frog_backpack', name: 'Balo Ếch Xanh Mắt Lồi', desc: 'Balo ếch xanh ngộ nghĩnh đung đưa sau lưng', cost: 390, rarity: 'epic', tag: 'CUTE' },
  { id: 'cat_headphones', name: 'Tai Nghe Mèo RGB', desc: 'Tai nghe gaming chụp tai phát sáng cá tính', cost: 420, rarity: 'epic', tag: 'HOT' },
  { id: 'round_glasses', name: 'Kính Cận Tròn Nobita', desc: 'Kính gọng tròn ngố trí thức học đường', cost: 180, rarity: 'rare', tag: 'ACADEMY' },
  { id: 'angel_wings', name: 'Cánh Thiên Thần Lông Vũ', desc: 'Đôi cánh thiên sứ trắng muốt đập cánh lơ lửng', cost: 650, rarity: 'legendary', tag: 'FLY' },
  { id: 'fox_tail', name: 'Đuôi Cáo Lông Xù Lắc Lư', desc: 'Chiếc đuôi cáo cam vẫy đung đưa sống động theo từng bước chạy', cost: 520, rarity: 'legendary', tag: 'ANIMATED' },
  { id: 'devil_horns', name: 'Cặp Sừng Ác Ma Tiểu Quỷ', desc: 'Cặp sừng nhọn màu đỏ rực phát sáng phong cách Halloween Play Together', cost: 440, rarity: 'epic', tag: 'HOT' },
  { id: 'toast_mouth', name: 'Bánh Mì Nướng Ngậm Miệng', desc: 'Lát bánh mì nướng bơ vàng ruộm ngậm vội khi chạy đến trường chuẩn anime', cost: 320, rarity: 'epic', tag: 'NEW' },
  { id: 'lollipop_sweet', name: 'Kẹo Mút Xoắn Cầu Vồng', desc: 'Cây kẹo que kẹo mút khổng lồ ngọt lịm ngậm bên khóe miệng', cost: 260, rarity: 'rare', tag: 'SWEET' },
  { id: 'steampunk_goggles', name: 'Kính Phi Công Da Bò Đội Đầu', desc: 'Kính phi công retro tròng ngọc viền đồng thau phong cách phiêu lưu', cost: 380, rarity: 'epic', tag: 'ADVENTURE' },
  { id: 'crown_royal', name: 'Vương Miện Hoàng Kim Ruby', desc: 'Vương miện vàng ròng 5 đỉnh nạm ngọc ruby đỏ quyền quý hoàng tộc', cost: 750, rarity: 'legendary', tag: 'ROYAL' },
  { id: 'aura_stars', name: 'Hào Quang Sao Bay Quanh Đầu', desc: '3 ngôi sao hoàng kim bay lơ lửng tự xoay vòng quanh đầu cực chất', cost: 880, rarity: 'legendary', tag: 'VIP' },
  { id: 'cape_royal', name: 'Áo Choàng Hoàng Gia Viền Lông', desc: 'Áo choàng nhung đỏ thẫm viền lông trắng phấp phới khi chạy', cost: 690, rarity: 'legendary', tag: 'ROYAL' },
  { id: 'wings_faerie', name: 'Cánh Bướm Tiên Nữ Tinh Vân', desc: 'Đôi cánh bướm dạ quang phát sáng tự động vỗ cánh lơ lửng', cost: 790, rarity: 'legendary', tag: 'GLOW' },
  { id: 'wings_bat', name: 'Đôi Cánh Dơi Quỷ Dracula', desc: 'Cánh dơi Gothic đen tím vẫy đập huyền bí trong đêm', cost: 680, rarity: 'legendary', tag: 'GOTHIC' },
  // Phụ kiện truyền thống Việt Nam
  { id: 'non_la_vietnam', name: 'Nón Lá Việt Nam Truyền Thống', desc: 'Nón lá chóp nón đan nan tre tự nhiên mộc mạc, kèm quai nón lụa mềm mại', cost: 420, rarity: 'legendary', tag: 'VIETNAM' },
  { id: 'khan_dong_truyenthong', name: 'Khăn Đóng Mấn Gấm Hoàng Gia', desc: 'Khăn đóng quấn nếp gấm xanh hoàng tộc truyền thống sang trọng đồng bộ áo dài', cost: 360, rarity: 'epic', tag: 'VIETNAM' },
  // Phụ kiện K-Pop
  { id: 'kpop_beret', name: 'Mũ Beret Idol K-Pop Thời Thượng', desc: 'Mũ nồi beret dạ đen đính huy hiệu kim loại chuẩn phong cách thần tượng dạo phố', cost: 380, rarity: 'epic', tag: 'KPOP' },
  { id: 'kpop_idol_mic', name: 'Mic Cài Tai Thần Tượng Sân Khấu', desc: 'Microphone headset nhỏ gọn chuyên nghiệp của thần tượng khi biểu diễn', cost: 350, rarity: 'rare', tag: 'KPOP' },
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
  {
    id: 'set_academy_scholar',
    name: 'Hội Học Sinh Ưu Tú',
    desc: 'Blazer xanh navy cài cà vạt, chân váy caro xếp ly và giày loafer học viện',
    hair: 'hair_wolf_cut', hairColor: '#1e293b',
    top: 'top_school_blazer', bottom: 'bot_school_uniform',
    shoes: 'shoe_school_loafers', ears: 'cat_ears',
    cost: 1150,
    rarity: 'epic',
    customization: {
      hairStyle: 'hair_wolf_cut', hairColor: '#1e293b',
      topId: 'top_school_blazer', topColor: '#1e3a8a',
      bottomId: 'bot_school_uniform', bottomColor: '#1e3a8a',
      shoeId: 'shoe_school_loafers', shoeColor: '#0f172a',
      ears: 'cat_ears', eyeType: 'sparkle', eyeColor: '#0284c7',
      noseType: 'dot', mouthType: 'smile', blushType: 'peach',
    },
  },
  {
    id: 'set_seaside_vacation',
    name: 'Kỳ Nghỉ Biển Hawaii',
    desc: 'Sơ mi cộc tay hoa lá nhiệt đới, quần bơi biển và dép xỏ ngón sao biển',
    hair: 'hair_beach_surfer', hairColor: '#f59e0b',
    top: 'top_hawaii_shirt', bottom: 'bot_swim_trunks',
    shoes: 'shoe_beach_sandals', ears: 'human',
    cost: 890,
    rarity: 'rare',
    customization: {
      hairStyle: 'hair_beach_surfer', hairColor: '#f59e0b',
      topId: 'top_hawaii_shirt', topColor: '#06b6d4',
      bottomId: 'bot_swim_trunks', bottomColor: '#0284c7',
      shoeId: 'shoe_beach_sandals', shoeColor: '#06b6d4',
      ears: 'human', eyeType: 'smile_arc', eyeColor: '#785242',
      noseType: 'dot', mouthType: 'beaming', blushType: 'drunk',
    },
  },
  {
    id: 'set_yellow_duck',
    name: 'Vịt Vàng Lạch Bạch',
    desc: 'Bộ đồ linh vật vịt vàng mỏ cam kêu cạp cạp siêu ngộ nghĩnh Play Together',
    hair: 'hair_classic', hairColor: '#facc15',
    top: 'top_duck_hoodie', bottom: 'bot_duck_pants',
    shoes: 'shoe_duck_feet', ears: 'duck_beak',
    cost: 1350,
    rarity: 'epic',
    customization: {
      hairStyle: 'hair_classic', hairColor: '#facc15',
      topId: 'top_duck_hoodie', topColor: '#facc15',
      bottomId: 'bot_duck_pants', bottomColor: '#eab308',
      shoeId: 'shoe_duck_feet', shoeColor: '#f97316',
      ears: 'duck_beak', eyeType: 'surprised', eyeColor: '#0f172a',
      noseType: 'none', mouthType: 'cat_mouth', blushType: 'peach',
    },
  },
  {
    id: 'set_shiba_pup',
    name: 'Cún Shiba Tinh Nghịch',
    desc: 'Bộ đồ cosplay cún Shiba lông vàng nhí nhảnh tai vểnh đáng yêu',
    hair: 'hair_chic_bob', hairColor: '#d97706',
    top: 'top_hoodie_cozy', bottom: 'bot_cargo_wide',
    shoes: 'shoe_chunky_white', ears: 'shiba_ears',
    cost: 1220,
    rarity: 'epic',
    customization: {
      hairStyle: 'hair_chic_bob', hairColor: '#d97706',
      topId: 'top_hoodie_cozy', topColor: '#fef3c7',
      bottomId: 'bot_cargo_wide', bottomColor: '#d97706',
      shoeId: 'shoe_chunky_white', shoeColor: '#ffffff',
      ears: 'shiba_ears', eyeType: 'cat_eyes', eyeColor: '#785242',
      noseType: 'cat_nose', mouthType: 'tongue', blushType: 'heart',
    },
  },
  {
    id: 'set_angel_celestial',
    name: 'Thiên Thần Ánh Sáng',
    desc: 'Bộ cánh thiên sứ bạch y viền vàng lấp lánh với vòng hào quang thánh thiện',
    hair: 'hair_celestial_flow', hairColor: '#f1f5f9',
    top: 'top_angel_tunic', bottom: 'bot_angel_pants',
    shoes: 'shoe_celestial_heels', ears: 'halo_crown',
    cost: 1850,
    rarity: 'legendary',
    customization: {
      hairStyle: 'hair_celestial_flow', hairColor: '#f1f5f9',
      topId: 'top_angel_tunic', topColor: '#ffffff',
      bottomId: 'bot_angel_pants', bottomColor: '#f8fafc',
      shoeId: 'shoe_celestial_heels', shoeColor: '#facc15',
      ears: 'halo_crown', eyeType: 'sparkle', eyeColor: '#7c3aed',
      noseType: 'none', mouthType: 'smile', blushType: 'peach',
    },
  },
  {
    id: 'set_royal_tuxedo',
    name: 'Bá Tước Dạ Hội Quý Tộc',
    desc: 'Set Vest dạ hội Tuxedo đen tuyền, nơ đỏ, quần âu ly thẳng và giày da Oxford lịch lãm',
    hair: 'hair_slick_side', hairColor: '#1e293b',
    top: 'top_suit_vest_luxury', bottom: 'bot_suit_slacks',
    shoes: 'shoe_oxford_wingtip', ears: 'round_glasses',
    cost: 1350,
    rarity: 'legendary',
    customization: {
      hairStyle: 'hair_slick_side', hairColor: '#1e293b',
      topId: 'top_suit_vest_luxury', topColor: '#1e293b',
      bottomId: 'bot_suit_slacks', bottomColor: '#1e293b',
      shoeId: 'shoe_oxford_wingtip', shoeColor: '#3f1a0e',
      ears: 'round_glasses', eyeType: 'classic', eyeColor: '#0f172a',
      noseType: 'dot', mouthType: 'smile', blushType: 'none',
    },
  },
  {
    id: 'set_sailor_idol',
    name: 'Nữ Sinh Thủy Thủ Anime',
    desc: 'Đồng phục áo thủy thủ nơ đỏ, chân váy xếp ly, giày Mary Jane và bánh mì bơ ngậm miệng',
    hair: 'hair_twintails', hairColor: '#76503b',
    top: 'top_sailor_uniform', bottom: 'bot_sailor_skirt',
    shoes: 'shoe_mary_jane', ears: 'toast_mouth',
    cost: 1420,
    rarity: 'legendary',
    customization: {
      hairStyle: 'hair_twintails', hairColor: '#76503b',
      topId: 'top_sailor_uniform', topColor: '#ffffff',
      bottomId: 'bot_sailor_skirt', bottomColor: '#1e3a8a',
      shoeId: 'shoe_mary_jane', shoeColor: '#0f172a',
      ears: 'toast_mouth', eyeType: 'sparkle', eyeColor: '#0284c7',
      noseType: 'none', mouthType: 'smile', blushType: 'peach',
    },
  },
  {
    id: 'set_dino_hoodie_cutie',
    name: 'Khủng Long Nhí Tinh Nghịch',
    desc: 'Hoodie khủng long Dino siêu to, dép móng vuốt và đuôi cáo lông xù ngộ nghĩnh',
    hair: 'hair_anime_bangs', hairColor: '#f59e0b',
    top: 'top_dino_hoodie', bottom: 'bot_denim_shorts',
    shoes: 'shoe_dino_claws', ears: 'fox_tail',
    cost: 1280,
    rarity: 'epic',
    customization: {
      hairStyle: 'hair_anime_bangs', hairColor: '#f59e0b',
      topId: 'top_dino_hoodie', topColor: '#22c55e',
      bottomId: 'bot_denim_shorts', bottomColor: '#4778b6',
      shoeId: 'shoe_dino_claws', shoeColor: '#22c55e',
      ears: 'fox_tail', eyeType: 'smile_arc', eyeColor: '#785242',
      noseType: 'dot', mouthType: 'beaming', blushType: 'drunk',
    },
  },
  {
    id: 'set_cyber_ninja',
    name: 'Chiến Binh Techwear Cyber',
    desc: 'Áo khoác đai khóa chiến thuật, quần hộp dây rút, patin 4 bánh và sừng ác ma',
    hair: 'hair_wolf_cut', hairColor: '#f1f5f9',
    top: 'top_cyber_jacket', bottom: 'bot_tech_straps',
    shoes: 'shoe_roller_skates', ears: 'devil_horns',
    cost: 1550,
    rarity: 'legendary',
    customization: {
      hairStyle: 'hair_wolf_cut', hairColor: '#f1f5f9',
      topId: 'top_cyber_jacket', topColor: '#09090b',
      bottomId: 'bot_tech_straps', bottomColor: '#18181b',
      shoeId: 'shoe_roller_skates', shoeColor: '#ec4899',
      ears: 'devil_horns', eyeType: 'cat_eyes', eyeColor: '#7c3aed',
      noseType: 'cat_nose', mouthType: 'cat_mouth', blushType: 'heart',
    },
  },
  {
    id: 'set_royal_princess',
    name: 'Công Chúa Dạ Hội Lọ Lem',
    desc: 'Vương miện vàng ruby, váy dạ hội bồng bềnh khổng lồ, hài pha lê và hào quang sao bay quanh đầu',
    hair: 'hair_wavy_curly', hairColor: '#d9a852',
    top: 'top_ballgown_corset', bottom: 'bot_ballgown_princess',
    shoes: 'shoe_glass_slippers', ears: 'crown_royal',
    cost: 2150,
    rarity: 'legendary',
    customization: {
      hairStyle: 'hair_wavy_curly', hairColor: '#d9a852',
      topId: 'top_ballgown_corset', topColor: '#fbcfe8',
      bottomId: 'bot_ballgown_princess', bottomColor: '#fbcfe8',
      shoeId: 'shoe_glass_slippers', shoeColor: '#e0f2fe',
      ears: 'crown_royal', eyeType: 'sparkle', eyeColor: '#0284c7',
      noseType: 'none', mouthType: 'smile', blushType: 'peach',
    },
  },
  {
    id: 'set_royal_prince',
    name: 'Hoàng Tử Bạch Mã Cổ Tích',
    desc: 'Áo quân phục hoàng gia cầu vai vàng, quần lụa trắng, boots kỵ sĩ và áo choàng nhung viền lông',
    hair: 'hair_slick_side', hairColor: '#d97706',
    top: 'top_royal_prince', bottom: 'bot_royal_prince_pants',
    shoes: 'shoe_royal_prince_boots', ears: 'cape_royal',
    cost: 1980,
    rarity: 'legendary',
    customization: {
      hairStyle: 'hair_slick_side', hairColor: '#d97706',
      topId: 'top_royal_prince', topColor: '#ffffff',
      bottomId: 'bot_royal_prince_pants', bottomColor: '#ffffff',
      shoeId: 'shoe_royal_prince_boots', shoeColor: '#f8fafc',
      ears: 'cape_royal', eyeType: 'classic', eyeColor: '#0f172a',
      noseType: 'dot', mouthType: 'smile', blushType: 'none',
    },
  },
  {
    id: 'set_vampire_dracula',
    name: 'Bá Tước Ma Cà Rồng Dracula',
    desc: 'Áo cổ dựng nhọn gothic, váy lolita ren đen, boots da bóng và đôi cánh dơi quỷ huyền bí',
    hair: 'hair_slick_back', hairColor: '#1e293b',
    top: 'top_vampire_count', bottom: 'bot_gothic_lolita_skirt',
    shoes: 'shoe_vintage_boots', ears: 'wings_bat',
    cost: 1890,
    rarity: 'legendary',
    customization: {
      hairStyle: 'hair_slick_back', hairColor: '#1e293b',
      topId: 'top_vampire_count', topColor: '#7f1d1d',
      bottomId: 'bot_gothic_lolita_skirt', bottomColor: '#18181b',
      shoeId: 'shoe_vintage_boots', shoeColor: '#18181b',
      ears: 'wings_bat', eyeType: 'cat_eyes', eyeColor: '#b91c42',
      noseType: 'cat_nose', mouthType: 'cat_mouth', blushType: 'drunk',
    },
  },
  {
    id: 'set_sakura_festival',
    name: 'Lễ Hội Hoa Anh Đào Sakura',
    desc: 'Yukata truyền thống hoa anh đào, đai Obi vàng, guốc gỗ Geta và cánh bướm tiên nữ dạ quang',
    hair: 'hair_ponytail', hairColor: '#1e293b',
    top: 'top_kimono_sakura', bottom: 'bot_tennis_skirt',
    shoes: 'shoe_geta_wood', ears: 'wings_faerie',
    cost: 1750,
    rarity: 'epic',
    customization: {
      hairStyle: 'hair_ponytail', hairColor: '#1e293b',
      topId: 'top_kimono_sakura', topColor: '#f472b6',
      bottomId: 'bot_tennis_skirt', bottomColor: '#fbcfe8',
      shoeId: 'shoe_geta_wood', shoeColor: '#78350f',
      ears: 'wings_faerie', eyeType: 'smile_arc', eyeColor: '#785242',
      noseType: 'dot', mouthType: 'beaming', blushType: 'peach',
    },
  },
  {
    id: 'set_giant_teddy',
    name: 'Gấu Teddy Bông Khổng Lồ',
    desc: 'Bộ đồ mascot gấu bông nâu phồng to tròn xoe siêu cưng chuẩn linh vật Play Together',
    hair: 'hair_classic', hairColor: '#92400e',
    top: 'top_teddy_mascot', bottom: 'bot_teddy_pants',
    shoes: 'shoe_puffy_slides', ears: 'bear_ears',
    cost: 1680,
    rarity: 'epic',
    customization: {
      hairStyle: 'hair_classic', hairColor: '#92400e',
      topId: 'top_teddy_mascot', topColor: '#92400e',
      bottomId: 'bot_teddy_pants', bottomColor: '#92400e',
      shoeId: 'shoe_puffy_slides', shoeColor: '#b45309',
      ears: 'bear_ears', eyeType: 'surprised', eyeColor: '#0f172a',
      noseType: 'dot', mouthType: 'cat_mouth', blushType: 'heart',
    },
  },
  {
    id: 'set_aodai_nu_vietnam',
    name: 'Hương Sắc Áo Dài Việt Nam',
    desc: 'Trọn bộ áo dài lụa hồng hoa sen, quần lụa trắng thướt tha và nón lá truyền thống',
    hair: 'hair_ponytail', hairColor: '#1e293b',
    top: 'top_aodai_nu_sen', bottom: 'bot_aodai_pants_silk',
    shoes: 'shoe_doll_flats', ears: 'non_la_vietnam',
    cost: 1450,
    rarity: 'legendary',
    customization: {
      hairStyle: 'hair_ponytail', hairColor: '#1e293b',
      topId: 'top_aodai_nu_sen', topColor: '#f472b6',
      bottomId: 'bot_aodai_pants_silk', bottomColor: '#fdfbf7',
      shoeId: 'shoe_doll_flats', shoeColor: '#e11d48',
      ears: 'non_la_vietnam', eyeType: 'smile_arc', eyeColor: '#785242',
      noseType: 'dot', mouthType: 'smile', blushType: 'peach',
    },
  },
  {
    id: 'set_aodai_nam_vietnam',
    name: 'Áo Dài Nam Khăn Đóng Hoàng Triều',
    desc: 'Trọn bộ áo dài nam cách tân gấm rồng, quần lụa, khăn đóng vương giả và giày da Oxford',
    hair: 'hair_slick_side', hairColor: '#1e293b',
    top: 'top_aodai_nam_gam', bottom: 'bot_aodai_pants_silk',
    shoes: 'shoe_oxford_wingtip', ears: 'khan_dong_truyenthong',
    cost: 1480,
    rarity: 'legendary',
    customization: {
      hairStyle: 'hair_slick_side', hairColor: '#1e293b',
      topId: 'top_aodai_nam_gam', topColor: '#1e3a8a',
      bottomId: 'bot_aodai_pants_silk', bottomColor: '#fdfbf7',
      shoeId: 'shoe_oxford_wingtip', shoeColor: '#3f1a0e',
      ears: 'khan_dong_truyenthong', eyeType: 'classic', eyeColor: '#0f172a',
      noseType: 'dot', mouthType: 'smile', blushType: 'none',
    },
  },
  {
    id: 'set_kpop_stage_idol',
    name: 'Thần Tượng Sân Khấu K-Pop',
    desc: 'Set trang phục biểu diễn sân khấu gồm áo layering xích kim loại, quần hộp dây rủ, mũ beret và sneaker chunky',
    hair: 'hair_wolf_cut', hairColor: '#1e293b',
    top: 'top_kpop_streetwear', bottom: 'bot_kpop_cargo_chains',
    shoes: 'shoe_chunky_white', ears: 'kpop_beret',
    cost: 1550,
    rarity: 'legendary',
    customization: {
      hairStyle: 'hair_wolf_cut', hairColor: '#1e293b',
      topId: 'top_kpop_streetwear', topColor: '#18181b',
      bottomId: 'bot_kpop_cargo_chains', bottomColor: '#18181b',
      shoeId: 'shoe_chunky_white', shoeColor: '#ffffff',
      ears: 'kpop_beret', eyeType: 'cat_eyes', eyeColor: '#0284c7',
      noseType: 'dot', mouthType: 'smile', blushType: 'peach',
    },
  },
  {
    id: 'set_kpop_kdrama_academy',
    name: 'Nam Thần Học Đường K-Drama',
    desc: 'Áo cardigan dệt kim phối sơ mi cà vạt, quần tây ống suông, giày loafer và kính tròn trí thức',
    hair: 'hair_slick_side', hairColor: '#451a03',
    top: 'top_kpop_cardigan_school', bottom: 'bot_suit_slacks',
    shoes: 'shoe_school_loafers', ears: 'round_glasses',
    cost: 1390,
    rarity: 'epic',
    customization: {
      hairStyle: 'hair_slick_side', hairColor: '#451a03',
      topId: 'top_kpop_cardigan_school', topColor: '#334155',
      bottomId: 'bot_suit_slacks', bottomColor: '#1e293b',
      shoeId: 'shoe_school_loafers', shoeColor: '#0f172a',
      ears: 'round_glasses', eyeType: 'classic', eyeColor: '#0f172a',
      noseType: 'dot', mouthType: 'smile', blushType: 'none',
    },
  },
  {
    id: 'set_executive_blazer',
    name: 'Quý Ông Doanh Nhân Thành Đạt',
    desc: 'Trọn bộ vest blazer xanh navy, sơ mi trắng cà vạt, quần tây ly thẳng và giày da Oxford Brogue',
    hair: 'hair_slick_side', hairColor: '#1e293b',
    top: 'top_blazer_luxury', bottom: 'bot_suit_slacks',
    shoes: 'shoe_oxford_wingtip', ears: 'round_glasses',
    cost: 1600,
    rarity: 'legendary',
    customization: {
      hairStyle: 'hair_slick_side', hairColor: '#1e293b',
      topId: 'top_blazer_luxury', topColor: '#0f172a',
      bottomId: 'bot_suit_slacks', bottomColor: '#1e293b',
      shoeId: 'shoe_oxford_wingtip', shoeColor: '#3f1a0e',
      ears: 'round_glasses', eyeType: 'classic', eyeColor: '#0f172a',
      noseType: 'dot', mouthType: 'smile', blushType: 'none',
    },
  },
  {
    id: 'set_white_tuxedo_gala',
    name: 'Bạch Mã Tuxedo Dạ Tiệc Hoàng Gia',
    desc: 'Bộ tuxedo trắng tinh khôi ve đen satin, nơ bướm lịch thiệp, quần tây đen và giày da Oxford',
    hair: 'hair_slick_side', hairColor: '#0f172a',
    top: 'top_vest_tuxedo_white', bottom: 'bot_suit_slacks',
    shoes: 'shoe_oxford_wingtip', ears: 'human',
    cost: 1650,
    rarity: 'legendary',
    customization: {
      hairStyle: 'hair_slick_side', hairColor: '#0f172a',
      topId: 'top_vest_tuxedo_white', topColor: '#f8fafc',
      bottomId: 'bot_suit_slacks', bottomColor: '#1e293b',
      shoeId: 'shoe_oxford_wingtip', shoeColor: '#1c1917',
      ears: 'human', eyeType: 'classic', eyeColor: '#0f172a',
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
    if (!Object.hasOwn(ALL_FASHION_ITEMS_MAP,id)) throw new Error('Trang phục không hợp lệ.');
    const item = ALL_FASHION_ITEMS_MAP[id];
    ownedSet.add(id);

    const cost = Math.max(0, Number(item.cost) || 0);
    if (cost > 0) {
      verifiedCost += cost;
    }
    validNewItemIds.push(id);
  }

  return { verifiedCost, validNewItemIds };
}
