export const MAIN_MISSIONS = Object.freeze([
  { id: 'main-harvest-3', title: 'Vụ mùa đầu tiên', description: 'Thu hoạch tổng cộng 3 ô cây.', stat: 'harvested', goal: 3, coins: 80, xp: 40 },
  { id: 'main-orders-2', title: 'Người giao hàng', description: 'Giao tổng cộng 2 đơn hàng.', stat: 'orders', goal: 2, coins: 120, xp: 60 },
  { id: 'main-feed-2', title: 'Chăm sóc vật nuôi', description: 'Cho vật nuôi ăn tổng cộng 2 lần.', stat: 'animalsFed', goal: 2, coins: 150, xp: 75 },
]);

export const DAILY_MISSIONS = Object.freeze([
  { id: 'daily-plant-2', title: 'Gieo hạt', description: 'Gieo 2 hạt giống hôm nay.', stat: 'planted', goal: 2, coins: 30, xp: 15 },
  { id: 'daily-harvest-2', title: 'Mùa thu hoạch', description: 'Thu hoạch 2 ô cây hôm nay.', stat: 'harvested', goal: 2, coins: 40, xp: 20 },
  { id: 'daily-water-2', title: 'Chăm luống rau', description: 'Tưới 2 ô cây hôm nay.', stat: 'watered', goal: 2, coins: 35, xp: 20 },
]);

export function missionDayKey(now = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = type => parts.find(item => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function freshDailyMissions(stats = {}, now = Date.now()) {
  return { dayKey: missionDayKey(now), baseline: Object.fromEntries(DAILY_MISSIONS.map(mission => [mission.stat, Math.max(0, Number(stats[mission.stat]) || 0)])), claimed: [] };
}

export function normalizeMissions(missions, stats = {}, now = Date.now()) {
  const main = Array.isArray(missions?.main?.claimed) ? missions.main.claimed.filter(id => MAIN_MISSIONS.some(mission => mission.id === id)) : [];
  const daily = missions?.daily?.dayKey === missionDayKey(now) && missions.daily.baseline && Array.isArray(missions.daily.claimed)
    ? { dayKey: missions.daily.dayKey, baseline: missions.daily.baseline, claimed: missions.daily.claimed.filter(id => DAILY_MISSIONS.some(mission => mission.id === id)) }
    : freshDailyMissions(stats, now);
  return { main: { claimed: main }, daily };
}

export function missionProgress(mission, stats = {}, missions = {}, kind = 'main') {
  const baseline = kind === 'daily' ? Math.max(0, Number(missions.daily?.baseline?.[mission.stat]) || 0) : 0;
  return Math.min(mission.goal, Math.max(0, (Number(stats[mission.stat]) || 0) - baseline));
}

export function activeMainMission(missions = {}) {
  return MAIN_MISSIONS.find(mission => !missions.main?.claimed?.includes(mission.id)) || null;
}

export function claimMission(progress, kind, id, now = Date.now()) {
  progress.missions = normalizeMissions(progress.missions, progress.stats, now);
  if (!progress.onboarding?.completed) return 'Hãy hoàn thành hướng dẫn tân thủ trước.';
  const list = kind === 'main' ? MAIN_MISSIONS : kind === 'daily' ? DAILY_MISSIONS : null;
  const mission = list?.find(item => item.id === id);
  if (!mission) return 'Nhiệm vụ không hợp lệ.';
  if (kind === 'main' && activeMainMission(progress.missions)?.id !== id) return 'Hãy hoàn thành nhiệm vụ chính tuyến trước đó.';
  if (progress.missions[kind].claimed.includes(id)) return 'Phần thưởng đã được nhận.';
  if (missionProgress(mission, progress.stats, progress.missions, kind) < mission.goal) return 'Nhiệm vụ chưa hoàn thành.';
  progress.missions[kind].claimed.push(id);
  progress.coins += mission.coins;
  progress.xp += mission.xp;
  return null;
}
