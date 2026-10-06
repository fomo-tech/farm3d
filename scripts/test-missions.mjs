import assert from 'node:assert/strict';
import { MAIN_MISSIONS, DAILY_MISSIONS, activeMainMission, claimMission, freshDailyMissions, missionDayKey, missionProgress, normalizeMissions } from '../shared/missions.js';

const beforeMidnight = Date.parse('2026-10-05T16:59:59Z');
const afterMidnight = Date.parse('2026-10-05T17:00:01Z');
assert.equal(missionDayKey(beforeMidnight), '2026-10-05');
assert.equal(missionDayKey(afterMidnight), '2026-10-06');

const progress = {
  coins: 100, xp: 0, stats: { planted: 20, harvested: 10, orders: 1, animalsFed: 0 },
  onboarding: { completed: true },
  missions: { main: { claimed: [] }, daily: freshDailyMissions({ planted: 20, harvested: 10, orders: 1 }, afterMidnight) },
};
assert.equal(missionProgress(DAILY_MISSIONS[0], progress.stats, progress.missions, 'daily'), 0, 'old lifetime stats do not complete a new day');
assert.match(claimMission(progress, 'daily', DAILY_MISSIONS[0].id, afterMidnight), /chưa hoàn thành/);
progress.stats.planted += 2;
assert.equal(claimMission(progress, 'daily', DAILY_MISSIONS[0].id, afterMidnight), null);
assert.equal(progress.coins, 130);
assert.match(claimMission(progress, 'daily', DAILY_MISSIONS[0].id, afterMidnight), /đã được nhận/);
assert.equal(progress.coins, 130, 'repeat claim cannot duplicate coins');
assert.equal(activeMainMission(progress.missions).id, MAIN_MISSIONS[0].id);
assert.match(claimMission(progress, 'main', MAIN_MISSIONS[1].id, afterMidnight), /trước đó/);
assert.equal(claimMission(progress, 'main', MAIN_MISSIONS[0].id, afterMidnight), null);
assert.equal(activeMainMission(progress.missions).id, MAIN_MISSIONS[1].id);
const nextDay = normalizeMissions(progress.missions, progress.stats, afterMidnight + 86_400_000);
assert.equal(nextDay.main.claimed.length, 1, 'main story persists');
assert.equal(nextDay.daily.claimed.length, 0, 'daily rewards reset');
assert.equal(missionProgress(DAILY_MISSIONS[0], progress.stats, nextDay, 'daily'), 0);
assert.equal(MAIN_MISSIONS.length, 12, 'main story has four chapters of three missions');
assert.equal(new Set(MAIN_MISSIONS.map(mission => mission.id)).size, MAIN_MISSIONS.length, 'mission IDs stay unique');
assert.deepEqual(MAIN_MISSIONS.slice(0, 3).map(mission => mission.id), ['main-harvest-3', 'main-orders-2', 'main-feed-2'], 'existing mission IDs stay compatible');
const journey = {
  coins: 0, xp: 0, stats: { planted: 0, watered: 0, harvested: 0, orders: 0, animalsFed: 0, crafted: 0 },
  onboarding: { completed: true }, missions: { main: { claimed: [] }, daily: freshDailyMissions() },
};
let expectedCoins = 0;
for (const mission of MAIN_MISSIONS) {
  assert.ok(Object.hasOwn(journey.stats, mission.stat), `server tracks ${mission.stat}`);
  assert.equal(activeMainMission(journey.missions)?.id, mission.id);
  journey.stats[mission.stat] = Math.max(journey.stats[mission.stat], mission.goal);
  assert.equal(claimMission(journey, 'main', mission.id, afterMidnight), null, `claim ${mission.id}`);
  expectedCoins += mission.coins;
  assert.equal(journey.coins, expectedCoins, 'each chapter pays exactly once');
}
assert.equal(activeMainMission(journey.missions), null, 'full journey has an ending');
assert.equal(journey.missions.main.claimed.length, MAIN_MISSIONS.length);
progress.onboarding.completed = false;
assert.match(claimMission(progress, 'daily', DAILY_MISSIONS[1].id, afterMidnight), /tân thủ/);
console.log('PASS: main story order, daily rollover, baseline progress and one-time rewards.');
