export function taiXiuResult(dice) {
  if (!Array.isArray(dice) || dice.length !== 3 || dice.some(d => !Number.isInteger(d) || d < 1 || d > 6)) {
    throw new Error('Xúc xắc không hợp lệ.');
  }
  const total = dice.reduce((a, b) => a + b, 0);
  const triple = dice.every(d => d === dice[0]);
  const winner = triple ? null : total <= 10 ? 'xiu' : 'tai';
  const isEven = total % 2 === 0;
  const parity = triple ? null : isEven ? 'chan' : 'le';

  return {
    dice: [...dice],
    total,
    triple,
    winner,
    parity,
    isEven,
  };
}

export function taiXiuPayout(result, bets) {
  if (!bets || typeof bets !== 'object') return 0;
  let totalReward = 0;

  for (const [choice, amount] of Object.entries(bets)) {
    if (!amount || amount <= 0) continue;

    // Cửa chính: Tài / Xỉu (thua khi ra Bão)
    if (choice === 'tai' || choice === 'xiu') {
      if (result.winner === choice) {
        totalReward += amount * 2;
      }
    }
    // Cửa Chẵn / Lẻ (thua khi ra Bão)
    else if (choice === 'chan' || choice === 'le') {
      if (result.parity === choice) {
        totalReward += amount * 2;
      }
    }
    // Cược Bão Bất Kỳ (Any Triple) - Tỉ lệ ăn 1:30 (nhận về 31x)
    else if (choice === 'any_triple') {
      if (result.triple) {
        totalReward += amount * 31;
      }
    }
    // Cược Bão Cụ Thể (triple_1 .. triple_6) - Ăn 1:180 (nhận về 181x)
    else if (choice.startsWith('triple_')) {
      const targetVal = Number(choice.slice(7));
      if (result.triple && result.dice[0] === targetVal) {
        totalReward += amount * 181;
      }
    }
    // Cược Điểm Chính Xác (score_4 .. score_17)
    else if (choice.startsWith('score_')) {
      const targetScore = Number(choice.slice(6));
      if (result.total === targetScore) {
        // Tỉ lệ trả thưởng chuẩn xác suất Sic Bo
        const multiplier = (targetScore === 4 || targetScore === 17) ? 60
          : (targetScore === 5 || targetScore === 16) ? 30
          : (targetScore === 6 || targetScore === 15) ? 18
          : (targetScore === 7 || targetScore === 14) ? 12
          : (targetScore === 8 || targetScore === 13) ? 8
          : 6; // 9, 10, 11, 12 ăn 1:6
        totalReward += amount * (multiplier + 1);
      }
    }
  }

  return totalReward;
}

/**
 * Tạo lịch sử soi cầu mẫu nếu phòng mới khởi tạo
 */
export function generateSampleHistory(count = 20) {
  const history = [];
  let d1 = 3, d2 = 4, d3 = 4;
  for (let i = 0; i < count; i++) {
    d1 = ((d1 * 7 + i) % 6) + 1;
    d2 = ((d2 * 5 + i * 2) % 6) + 1;
    d3 = ((d3 * 3 + i * 3) % 6) + 1;
    const res = taiXiuResult([d1, d2, d3]);
    history.push({
      id: `sample-${i}`,
      result: res,
      at: Date.now() - (count - i) * 30000,
    });
  }
  return history;
}
