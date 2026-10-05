export const CASINO_CONFIG = Object.freeze({
  version: 'farm-casino-1', currency: 'farm-coins', chips: [10, 50, 100],
  maxRooms: 64, maxSpectators: 24, maxBet: 1000, maxRequestsPerRound: 128,
  reconnectMs: 60_000, openMs: 25_000, closedMs: 1000, shakeMs: 3000,
  revealMs: 2000, resultMs: 6000, dealMs: 2000, turnMs: 30_000, caoMs: 12_000,
  maxVisibleChips: 12,
});
export const CASINO_GAMES = Object.freeze({
  'tai-xiu': { name: 'Tài Xỉu', seats: 8, minPlayers: 1, choices: ['tai', 'xiu'], rules: 'Xỉu 4–10, Tài 11–17. Bộ ba đồng số: cả hai cửa thua. Thắng nhận lại cược + 1 lần cược.' },
  'bau-cua': { name: 'Bầu Cua', seats: 8, minPlayers: 1, choices: ['bau','cua','tom','ca','ga','nai'], rules: 'Mỗi cửa trúng n mặt: hoàn cược + n lần cược; không trúng mất cược.' },
  'bai-cao': { name: 'Bài Cào · Nhà cái', seats: 6, minPlayers: 2, choices: ['hand'], rules: 'Nhà cái hệ thống. A=1; 2–10 theo số; J/Q/K=0. Tổng lấy hàng đơn vị. Ba lá hình cao nhất. Thắng nhận 2× cược; hòa hoàn cược; thua mất cược.' },
  'tien-len': { name: 'Tiến Lên Miền Nam', seats: 4, minPlayers: 2, choices: [], rules: 'Tính điểm, không cược xu. 3<…<A<2; Bích<Chuồn<Rô<Cơ. Sảnh không có 2. Ba đôi thông/tứ quý chặt 2 lẻ; bốn đôi thông chặt 2 lẻ/đôi 2/ba đôi thông/tứ quý. Không thắng trắng, thối heo, cóng hoặc phạt xu. Người thắng +10 mỗi đối thủ, người khác −10.' },
});
export const CASINO_SYMBOLS = { bau: 'Bầu', cua: 'Cua', tom: 'Tôm', ca: 'Cá', ga: 'Gà', nai: 'Nai' };
export const QUICK_CHAT = ['Chào mọi người!', 'Chúc may mắn!', 'Ván hay quá!', 'Đợi mình một chút.', 'Cảm ơn!', 'Chơi ván nữa nhé!'];
