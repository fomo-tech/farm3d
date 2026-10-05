import { cardRank, cardSuit, validCards } from './cards.js';

export function baiCaoScore(cards) {
  if (!validCards(cards) || cards.length !== 3) {
    throw new Error('Bài Cào cần ba lá khác nhau.');
  }

  const ranks = cards.map(cardRank);
  const suits = cards.map(cardSuit);
  const faces = ranks.every(r => r >= 11 && r <= 13);
  
  // Tính điểm thông thường: A=1, 2-10 theo số, J/Q/K=0. Modulo 10
  const point = ranks.reduce((sum, r) => sum + (r === 14 ? 1 : r === 15 ? 2 : r >= 11 ? 0 : r), 0) % 10;

  // Kiểm tra Sáp (3 lá cùng Rank)
  const isSap = ranks[0] === ranks[1] && ranks[1] === ranks[2];

  // Kiểm tra Liêng (Sảnh 3 lá liên tiếp: ví dụ Q-K-A, 10-J-Q... A-2-3)
  const sortedRanks = [...ranks].sort((a, b) => a - b);
  const isNormalStraight = sortedRanks[1] === sortedRanks[0] + 1 && sortedRanks[2] === sortedRanks[1] + 1;
  // A-2-3: rank 14, 15, 3
  const isAce23Straight = sortedRanks.includes(3) && sortedRanks.includes(14) && sortedRanks.includes(15);
  const isLieng = isNormalStraight || isAce23Straight;

  // Xếp hạng ván bài
  let rankName = `${point} nút`;
  let rankTier = 0; // 0: điểm thường, 1: ba tây, 2: liêng, 3: sáp

  if (isSap) {
    rankName = 'Sáp';
    rankTier = 3;
  } else if (isLieng) {
    rankName = 'Liêng';
    rankTier = 2;
  } else if (faces) {
    rankName = 'Ba Tây';
    rankTier = 1;
  } else if (point === 9) {
    rankName = '9 Nút (Trời)';
  } else if (point === 0) {
    rankName = '0 Điểm (Bù)';
  }

  // Chuẩn Bài Cào truyền thống: Ba Tây (faces) = 10 điểm (cao nhất), còn lại là điểm (point 0-9)
  const value = faces ? 10 : point;

  return {
    point,
    faces,
    sap: isSap,
    lieng: isLieng,
    rankName,
    rankTier,
    value,
    highCard: Math.max(...cards),
  };
}

export function baiCaoPayout(hand, banker, stake) {
  const handScore = baiCaoScore(hand);
  const bankerScore = baiCaoScore(banker);
  
  const difference = handScore.value - bankerScore.value;
  const outcome = difference > 0 ? 'win' : difference === 0 ? 'tie' : 'lose';
  const reward = difference > 0 ? stake * 2 : difference === 0 ? stake : 0;

  return {
    reward,
    outcome,
    score: handScore,
    bankerScore,
  };
}
