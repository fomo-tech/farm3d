export const ATTENDANCE_REWARDS = Object.freeze([200, 250, 300, 350, 400, 500, 1000]);

const dayKey = now => new Date(now).toISOString().slice(0, 10);
const previousDay = key => dayKey(Date.parse(`${key}T00:00:00.000Z`) - 86400000);

export function getAttendanceStatus(dates = [], now = Date.now()) {
  const today = dayKey(now);
  const claimed = new Set(Array.isArray(dates) ? dates : []);
  const claimedToday = claimed.has(today);
  let cursor = claimedToday ? today : previousDay(today);
  let streak = 0;
  while (claimed.has(cursor) && streak < 32) {
    streak++;
    cursor = previousDay(cursor);
  }
  const day = claimedToday ? (streak - 1) % 7 + 1 : streak % 7 + 1;
  return { today, claimedToday, streak, day, coins: ATTENDANCE_REWARDS[day - 1] };
}
