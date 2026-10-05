import { randomInt } from 'node:crypto';
import { taiXiuResult,taiXiuPayout } from '../../shared/casino/taiXiuRules.js';
import { bauCuaResult,bauCuaPayout } from '../../shared/casino/bauCuaRules.js';
import { baiCaoPayout } from '../../shared/casino/baiCaoRules.js';
import { CASINO_GAMES } from '../../shared/casino/casinoConfig.js';
export function shuffledDeck() {
  const deck=Array.from({length:52},(_,i)=>i);
  for(let i=51;i>0;i--) {const j=randomInt(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}
  return deck;
}
export function drawDice(game) {
  if(game==='tai-xiu') return taiXiuResult(Array.from({length:3},()=>randomInt(1,7)));
  const choices=CASINO_GAMES['bau-cua'].choices;
  return bauCuaResult(Array.from({length:3},()=>choices[randomInt(6)]));
}
export function settlementPlan(room) {
  const round=room.round;
  return Object.entries(round.bets).map(([playerId,bets])=>({playerId,roundId:round.id,
    amount:Object.values(bets).reduce((a,b)=>a+b,0),
    reward:room.game==='tai-xiu'?taiXiuPayout(round.result,bets):room.game==='bau-cua'?bauCuaPayout(round.result,bets):baiCaoPayout(round.hands[playerId],round.banker,bets.hand).reward,
  }));
}
