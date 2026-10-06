import assert from 'node:assert/strict';
import { getAttendanceStatus } from '../shared/dailyAttendance.js';
import { applyCommunityReward } from '../server/CommunityRewards.js';

const at = day => Date.parse(`${day}T12:00:00.000Z`);
const player = { coins: 0, communityRewards: { daily: [], codes: [] } };
for (let day = 1; day <= 7; day++) {
  const date = `2026-10-${String(day).padStart(2, '0')}`;
  const before = getAttendanceStatus(player.communityRewards.daily, at(date));
  assert.equal(before.day, day);
  const reward = applyCommunityReward(player, 'claim_daily_reward', {}, at(date)).communityReward;
  assert.equal(reward.coins, before.coins);
  assert.equal(getAttendanceStatus(player.communityRewards.daily, at(date)).claimedToday, true);
  assert.throws(() => applyCommunityReward(player, 'claim_daily_reward', {}, at(date)));
}
assert.equal(player.coins, 3000);
assert.equal(getAttendanceStatus(player.communityRewards.daily, at('2026-10-08')).day, 1);
assert.equal(getAttendanceStatus(player.communityRewards.daily, at('2026-10-09')).day, 1, 'a missed day resets the streak');
assert.equal(applyCommunityReward(player, 'claim_daily_reward', {}, at('2026-10-09')).communityReward.coins, 200);
console.log('PASS: seven-day rewards, duplicate protection, cycle rollover and missed-day reset.');
