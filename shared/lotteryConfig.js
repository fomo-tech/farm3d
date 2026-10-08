export const LOTTERY_CONFIG = Object.freeze({price:100,dailyLimit:5,npc:{x:18,z:14,radius:5},prizes:[{digits:6,coins:50000,label:'Đặc biệt'},{digits:3,coins:3000,label:'Ba số cuối'},{digits:2,coins:300,label:'Hai số cuối'}]});
export function lotteryDay(now=Date.now()){return new Date(now+7*3600000).toISOString().slice(0,10);}
export function lotteryDrawAt(day){if(!/^\d{4}-\d{2}-\d{2}$/.test(day))throw new Error('Kỳ quay không hợp lệ.');return Date.parse(`${day}T20:00:00+07:00`);}
export function lotterySaleDay(now=Date.now()){const day=lotteryDay(now);return now>=lotteryDrawAt(day)?lotteryDay(now+86400000):day;}
export function lotteryPrize(number,winner){if(!/^\d{6}$/.test(number)||!/^\d{6}$/.test(winner))return 0;return LOTTERY_CONFIG.prizes.find(p=>number.slice(-p.digits)===winner.slice(-p.digits))?.coins||0;}
