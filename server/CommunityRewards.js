export const COMMUNITY_CODES=Object.freeze({
  KAIAFARM:{coins:500,enabled:true,expiresAt:null},
  PLAYTOGETHER:{coins:1000,enabled:true,expiresAt:null},
  CHAOCUDAN:{coins:300,enabled:true,expiresAt:null},
});
export function applyCommunityReward(progress, action, payload = {}, now = Date.now(), codes = COMMUNITY_CODES) {
  const claims=progress.communityRewards ||= { daily:[], codes:[] };
  claims.daily ||= []; claims.codes ||= [];
  let coins, key;
  if (action==='claim_daily_reward') {
    const attendance = getAttendanceStatus(claims.daily, now);
    key=attendance.today;
    if(attendance.claimedToday)throw new Error('Hôm nay bạn đã nhận thưởng (ngày UTC).');
    coins=attendance.coins;claims.daily.push(key);claims.daily=claims.daily.slice(-32);
  } else {
    key=String(payload.code||'').trim().toUpperCase();
    if(!Object.hasOwn(codes,key) || !codes[key].enabled || (codes[key].expiresAt!==null && now>=codes[key].expiresAt))throw new Error('Giftcode không hợp lệ hoặc đã hết hạn.');
    if(claims.codes.includes(key))throw new Error('Bạn đã sử dụng giftcode này.');
    coins=codes[key].coins;claims.codes.push(key);
  }
  progress.coins+=coins;
  return { communityReward:{action,coins,key} };
}
import { getAttendanceStatus } from '../shared/dailyAttendance.js';

