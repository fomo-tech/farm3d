import { unlockedFarmTiles } from './landExpansionConfig.js';
import { LAND_CONFIG } from './landConfig.js';
export const PRE_LAND_JOURNEY_VERSION = 1;
// Checkpoints are instructional, with no additional coin or XP reward.
export function preLandJourney(progress = {}) {
  const fishing = progress.fishing || {};
  if (!fishing.ownedRods?.length) return { id: 'gear', step: 1, title: 'Chuẩn bị cần câu', description: 'Đến tiệm đồ câu, mua cần tre. Cần cơ bản dùng được không cần mồi.', target: 'shop' };
  if (!(fishing.stats?.totalCaught > 0)) return { id: 'catch', step: 2, title: 'Câu con cá đầu tiên', description: 'Đến hồ, thả câu và kéo khi cá cắn. Cá hiếm có thể cần kéo nhiều lần.', target: 'lake' };
  if (!(fishing.stats?.totalSold > 0 || fishing.lastSale?.count > 0)) return { id: 'sell', step: 3, title: 'Bán cá đầu tiên', description: 'Mang cá tới tiệm đồ câu hoặc Lão Ngư để nhận xu.', target: 'shop' };
  const missing = Math.max(0, LAND_CONFIG.minPrice - (progress.coins || 0));
  return { id: 'land', step: 4, title: 'Lập nghiệp với lô đất đầu', description: missing ? `Lô từ ${LAND_CONFIG.minPrice.toLocaleString('vi-VN')} xu; còn thiếu ${missing.toLocaleString('vi-VN')} xu. Tiếp tục câu và bán cá.` : 'Đủ tiền cho lô rẻ nhất. Xem giá lô bạn chọn; mua xong nhận 4 ô trồng.', target: 'land' };
}
export function missionStats(progress = {}) {
  return { ...progress.stats, landTiles: unlockedFarmTiles(progress).length, fishCaught: progress.fishing?.stats?.totalCaught || 0, fishSold: progress.fishing?.stats?.totalSold || 0 };
}
