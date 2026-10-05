import { cardRank, cardSuit, validCards, sortCards } from './cards.js';

export function classifyPlay(cards) {
  if (!validCards(cards)) return null;
  const sorted = sortCards(cards);
  const ranks = sorted.map(cardRank);
  const n = cards.length;
  const same = ranks.every(r => r === ranks[0]);

  let type = null;
  if (n === 1) type = 'single';
  else if (same && n === 2) type = 'pair';
  else if (same && n === 3) type = 'triple';
  else if (same && n === 4) type = 'quad';
  else if (n >= 3 && ranks.at(-1) < 15 && ranks.every((r, i) => !i || r === ranks[i - 1] + 1)) type = 'straight';
  else if ([6, 8].includes(n) && ranks.at(-1) < 15 && ranks.every((r, i) => i % 2 ? r === ranks[i - 1] : !i || r === ranks[i - 2] + 1)) {
    type = n === 6 ? 'three-pairs' : 'four-pairs';
  }

  return type ? { type, length: n, high: sorted.at(-1), rank: ranks.at(-1), cards: sorted } : null;
}

export function beatsPlay(next, previous) {
  if (!next) return false;
  if (!previous) return true;

  // Cùng loại và cùng số lượng lá: so lá bài lớn nhất (đã tính theo rank và chất)
  if (next.type === previous.type && next.length === previous.length) {
    return next.high > previous.high;
  }

  // Chặt 1 Heo (2 lẻ) bằng 3 đôi thông, tứ quý, 4 đôi thông
  if (previous.type === 'single' && previous.rank === 15) {
    return ['three-pairs', 'quad', 'four-pairs'].includes(next.type);
  }

  // Chặt Đôi Heo (đôi 2) bằng tứ quý, 4 đôi thông
  if (previous.type === 'pair' && previous.rank === 15) {
    return ['quad', 'four-pairs'].includes(next.type);
  }

  // Chặt 3 đôi thông bằng 3 đôi thông lớn hơn (đã bắt ở case 1) hoặc tứ quý, 4 đôi thông
  if (previous.type === 'three-pairs') {
    return ['quad', 'four-pairs'].includes(next.type);
  }

  // Chặt Tứ quý bằng 4 đôi thông hoặc tứ quý lớn hơn (đã bắt ở case 1)
  if (previous.type === 'quad') {
    return next.type === 'four-pairs';
  }

  return false;
}

export function validateTienLenPlay(hand, cards, previous, requiredFirst = null) {
  const play = classifyPlay(cards);
  if (!play || cards.some(c => !hand.includes(c))) {
    return { error: 'Bộ bài không hợp lệ hoặc không nằm trên tay.' };
  }
  if (requiredFirst !== null && !cards.includes(requiredFirst)) {
    return { error: 'Lượt mở đầu phải chứa lá nhỏ nhất của ván.' };
  }
  if (!beatsPlay(play, previous)) {
    return { error: 'Bộ bài chưa chặn được lượt trước.' };
  }
  return { play };
}

export function suggestTienLenPlay(hand, previous, requiredFirst = null) {
  const sorted = sortCards(hand);
  for (let n = 1; n <= sorted.length; n++) {
    for (let mask = 1; mask < (1 << sorted.length); mask++) {
      const cards = sorted.filter((_, i) => mask & (1 << i));
      if (cards.length === n && !validateTienLenPlay(hand, cards, previous, requiredFirst).error) {
        return cards;
      }
    }
  }
  return [];
}

/**
 * Kiểm tra Tới Trắng (Instant Win) chuẩn Tiến Lên Miền Nam
 */
export function checkInstantWin(hand) {
  if (!Array.isArray(hand) || hand.length !== 13) return null;
  const sorted = sortCards(hand);
  const ranks = sorted.map(cardRank);
  const suits = sorted.map(cardSuit);

  // 1. Tứ quý 2 (4 con heo)
  if (ranks.filter(r => r === 15).length === 4) {
    return { type: 'four_twos', label: 'Tứ Quý Heo (Tứ Quý 2)' };
  }

  // 2. Sảnh Rồng (dãy 12 hoặc 13 lá liên tiếp từ 3 đến A hoặc 3 đến 2)
  const uniqueRanks = [...new Set(ranks)];
  if (uniqueRanks.length >= 12 && uniqueRanks.every((r, i) => !i || r === uniqueRanks[i - 1] + 1)) {
    return { type: 'dragon_straight', label: 'Sảnh Rồng' };
  }

  // 3. 6 đôi bất kỳ
  const rankCounts = {};
  ranks.forEach(r => { rankCounts[r] = (rankCounts[r] || 0) + 1; });
  const pairs = Object.values(rankCounts).reduce((sum, count) => sum + Math.floor(count / 2), 0);
  if (pairs >= 6) {
    return { type: 'six_pairs', label: 'Lục Đôi (6 Đôi)' };
  }

  // 4. Đồng chất (13 lá cùng đỏ hoặc cùng đen)
  const allBlack = suits.every(s => s === 0 || s === 1);
  const allRed = suits.every(s => s === 2 || s === 3);
  if (allBlack || allRed) {
    return { type: 'same_color', label: 'Đồng Màu (13 Lá Cùng Chất)' };
  }

  return null;
}

/**
 * Xếp bài thông minh (Smart Sort): Tách rác và gom Đôi, Sám, Sảnh
 */
export function smartSortTienLen(hand) {
  const sorted = sortCards(hand);
  const ranks = sorted.map(cardRank);
  const rankCount = {};
  ranks.forEach(r => { rankCount[r] = (rankCount[r] || 0) + 1; });

  // Sắp xếp ưu tiên: Các bộ nhiều lá (Tứ quý, Sám, Đôi) xếp trước, bài rác xếp sau
  return [...sorted].sort((a, b) => {
    const ra = cardRank(a);
    const rb = cardRank(b);
    const ca = rankCount[ra];
    const cb = rankCount[rb];
    if (ca !== cb) return cb - ca; // Bộ nhiều lá hơn lên trước
    return a - b;
  });
}
