import { CASINO_SYMBOLS } from './casinoConfig.js';
export function bauCuaResult(symbols) {
  if (!Array.isArray(symbols) || symbols.length!==3 || symbols.some(s=>!Object.hasOwn(CASINO_SYMBOLS,s))) throw new Error('Mặt Bầu Cua không hợp lệ.');
  return { symbols:[...symbols],hits:Object.fromEntries(Object.keys(CASINO_SYMBOLS).map(s=>[s,symbols.filter(v=>v===s).length])) };
}
export function bauCuaPayout(result,bets) {
  return Object.entries(bets).reduce((sum,[choice,amount])=>sum+(result.hits[choice]?amount*(result.hits[choice]+1):0),0);
}
