import { randomInt, randomUUID } from 'node:crypto';
import { casinoPlaceBet, casinoSettleBet } from './GameStore.js';

export const CASINO_CHOICES = Object.freeze({
  'tai-xiu': ['tai', 'xiu'],
  'bau-cua': ['bau', 'cua', 'tom', 'ca', 'ga', 'nai'],
});
const OPEN_MS = 25_000;
const RESULT_MS = 6_000;

function newRound(game) {
  return { game, id: randomUUID(), phase: 'open', closesAt: Date.now() + OPEN_MS, resultUntil: 0, result: null, bets: new Map(), playerCount: 0, inflight: new Set() };
}
const rounds = Object.fromEntries(Object.keys(CASINO_CHOICES).map(game => [game, newRound(game)]));

export function casinoState() {
  return Object.fromEntries(Object.entries(rounds).map(([game, round]) => [game, {
    id: round.id, phase: round.phase, closesAt: round.closesAt,
    resultUntil: round.resultUntil, result: round.result, playerCount: round.playerCount,
  }]));
}

export async function placeCasinoBet(playerId, game, choice, amount, roundId) {
  const round = rounds[game];
  if (!round || !CASINO_CHOICES[game].includes(choice) || ![10, 50, 100].includes(amount)) return { error: 'Lựa chọn cược không hợp lệ.' };
  if (round.id !== roundId || round.phase !== 'open' || Date.now() >= round.closesAt) return { error: 'Ván này đã khóa cược.' };
  if (round.bets.has(playerId)) return { error: 'Bạn đã cược trong ván này.' };
  const task = casinoPlaceBet(playerId, round.id, game, choice, amount);
  round.inflight.add(task);
  try {
    const result = await task;
    if (!result.error) { round.bets.set(playerId, { choice, amount }); round.playerCount += 1; }
    return result.error ? result : { ...result, roundId: round.id };
  } finally {
    round.inflight.delete(task);
  }
}

function draw(game) {
  if (game === 'tai-xiu') {
    const dice = Array.from({ length: 3 }, () => randomInt(1, 7));
    const total = dice.reduce((sum, value) => sum + value, 0);
    return { dice, total, winner: total >= 11 ? 'tai' : 'xiu' };
  }
  const symbols = CASINO_CHOICES['bau-cua'];
  return { symbols: Array.from({ length: 3 }, () => symbols[randomInt(symbols.length)]) };
}

export function casinoPayout(game, result, bet) {
  if (game === 'tai-xiu') return result.winner === bet.choice ? bet.amount * 2 : 0;
  const hits = result.symbols.filter(symbol => symbol === bet.choice).length;
  return hits ? bet.amount * (hits + 1) : 0;
}

// Called by the socket server's timer. Settlement is idempotent in GameStore.
export async function tickCasino(onSettlement) {
  let changed = false;
  for (const game of Object.keys(rounds)) {
    const round = rounds[game];
    if (round.phase === 'open' && Date.now() >= round.closesAt) {
      round.phase = 'settling';
      await Promise.allSettled([...round.inflight]);
      round.result = draw(game);
      changed = true;
    }
    if (round.phase === 'settling') {
      for (const [playerId, bet] of round.bets) {
        const reward = casinoPayout(game, round.result, bet);
        const settled = await casinoSettleBet(playerId, round.id, reward);
        round.bets.delete(playerId);
        if (settled) onSettlement({ playerId, game, roundId: round.id, choice: bet.choice, amount: bet.amount, reward, result: round.result, player: settled.player });
      }
      round.phase = 'result';
      round.resultUntil = Date.now() + RESULT_MS;
      changed = true;
    }
    if (round.phase === 'result' && Date.now() >= round.resultUntil) {
      rounds[game] = newRound(game);
      changed = true;
    }
  }
  return changed;
}
