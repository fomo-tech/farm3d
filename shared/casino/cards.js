export const SUITS = ['♠','♣','♦','♥'];
export function cardRank(card) {
  if (!Number.isInteger(card) || card<0 || card>51) throw new Error('Lá bài không hợp lệ.');
  return Math.floor(card/4)+3;
}
export const cardSuit = card => { cardRank(card); return card%4; };
export const cardLabel = card => `${({11:'J',12:'Q',13:'K',14:'A',15:'2'})[cardRank(card)]||cardRank(card)}${SUITS[cardSuit(card)]}`;
export const sortCards = cards => [...cards].sort((a,b)=>a-b);
export function validCards(cards) {
  return Array.isArray(cards) && cards.length>0 && cards.length<=13 && new Set(cards).size===cards.length && cards.every(c=>Number.isInteger(c)&&c>=0&&c<52);
}
