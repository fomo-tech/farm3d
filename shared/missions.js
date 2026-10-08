import { FARM_CONFIG } from './farmConfig.js';
import { NPC_TRADING_CONFIG } from './npcTradingConfig.js';
import { missionStats } from './preLandJourney.js';
import { missionAvailability } from './missionEligibility.js';
export const MISSION_VERSION = 4;
const defineMission = mission => Object.freeze({ ...mission, progressMode: mission.progressMode || 'lifetime', requirements: Object.freeze(mission.requirements || (mission.stat === 'animalsFed' ? ['land', 'onboarding', 'livestock'] : ['land', 'onboarding'])) });

export const MAIN_CHAPTERS = Object.freeze(['Vụ mùa đầu tiên', 'Giao hàng và chế biến', 'Chăm đàn vật nuôi', 'Nông trại ổn định', 'Khai hoang đất trồng']);

export const MAIN_MISSIONS = Object.freeze([
  { id: 'main-harvest-3', title: 'Vụ mùa đầu tiên', description: 'Thu hoạch tổng cộng 3 ô cây.', stat: 'harvested', goal: 3, coins: 80, xp: 40 },
  { id: 'main-plant-5', title: 'Thêm một luống mới', description: 'Gieo tổng cộng 5 hạt giống.', stat: 'planted', goal: 5, coins: 90, xp: 45 },
  { id: 'main-water-5', title: 'Giữ vườn xanh tốt', description: 'Tưới tổng cộng 5 ô cây.', stat: 'watered', goal: 5, coins: 100, xp: 50 },
  { id: 'main-harvest-6', title: 'Mùa rau bội thu', description: 'Thu hoạch tổng cộng 6 ô cây.', stat: 'harvested', goal: 6, coins: 120, xp: 60 },
  { id: 'main-orders-2', title: 'Người giao hàng', description: 'Giao tổng cộng 2 đơn hàng.', stat: 'orders', goal: 2, coins: 120, xp: 60 },
  { id: 'main-craft-1', title: 'Vào bếp thử tài', description: 'Chế biến 1 sản phẩm tại xưởng.', stat: 'crafted', goal: 1, coins: 130, xp: 65 },
  { id: 'main-feed-2', title: 'Chăm sóc vật nuôi', description: 'Cho ăn tổng cộng 2 lượt vật nuôi; mỗi con được tính một lượt.', stat: 'animalsFed', goal: 2, coins: 150, xp: 75 },
  { id: 'main-feed-4', title: 'Đàn vật nuôi khỏe mạnh', description: 'Cho ăn tổng cộng 4 lượt vật nuôi; mỗi con được tính một lượt.', stat: 'animalsFed', goal: 4, coins: 170, xp: 85 },
  { id: 'main-orders-3', title: 'Quen mặt ở thị trấn', description: 'Giao tổng cộng 3 đơn hàng.', stat: 'orders', goal: 3, coins: 160, xp: 80 },
  { id: 'main-harvest-10', title: 'Nông trại vào vụ', description: 'Thu hoạch tổng cộng 10 ô cây.', stat: 'harvested', goal: 10, coins: 180, xp: 90 },
  { id: 'main-craft-3', title: 'Tay nghề lên cao', description: 'Chế biến tổng cộng 3 sản phẩm.', stat: 'crafted', goal: 3, coins: 190, xp: 95 },
  { id: 'main-plant-15', title: 'Người gieo mùa mới', description: 'Gieo tổng cộng 15 hạt giống.', stat: 'planted', goal: 15, coins: 200, xp: 100 },
  { id:'main-land-5', title:'Luống trồng mới', description:'Khai hoang để có tổng cộng 5 ô trồng.', stat:'landTiles', goal:5, coins:100, xp:50 },
  { id:'main-land-8', title:'Mở thêm lựa chọn', description:'Khai hoang để có tổng cộng 8 ô trồng.', stat:'landTiles', goal:8, coins:150, xp:75 },
  { id:'main-land-12', title:'Nông trại rộng mở', description:'Khai hoang để có tổng cộng 12 ô trồng. Chuồng vẫn ở khu riêng.', stat:'landTiles', goal:12, coins:200, xp:100 },
].map(defineMission));

export const DAILY_MISSIONS = Object.freeze([
  { id: 'daily-plant-2', title: 'Gieo hạt', description: 'Gieo 2 hạt giống hôm nay.', stat: 'planted', goal: 2, coins: 30, xp: 15 },
  { id: 'daily-harvest-2', title: 'Mùa thu hoạch', description: 'Thu hoạch 2 ô cây hôm nay.', stat: 'harvested', goal: 2, coins: 40, xp: 20 },
  { id: 'daily-water-2', title: 'Chăm luống rau', description: 'Tưới 2 ô cây hôm nay.', stat: 'watered', goal: 2, coins: 35, xp: 20 },
].map(mission => defineMission({ ...mission, progressMode: 'daily' })));

export const FISHING_DAILY_MISSIONS = Object.freeze([
  { id:'daily-fish-3', title:'Một buổi bên hồ', description:'Câu 3 con cá hôm nay.', stat:'fishCaught', goal:3, coins:30, xp:15 },
  { id:'daily-fish-sell-3', title:'Mang cá ra chợ', description:'Bán 3 con cá hôm nay.', stat:'fishSold', goal:3, coins:40, xp:20 },
  { id:'daily-fish-6', title:'Tay câu chăm chỉ', description:'Câu 6 con cá hôm nay.', stat:'fishCaught', goal:6, coins:35, xp:20 },
].map(mission => defineMission({...mission, progressMode:'daily', requirements:['rod','fishingIntro']})));
export const ACTIVITY_DAILY_MISSIONS = Object.freeze([
  {id:'daily-orders-1', title:'Giao hàng cho thị trấn', description:'Giao 1 đơn hàng hôm nay.', stat:'orders', goal:1, coins:40, xp:20},
  {id:'daily-feed-1', title:'Chăm đàn vật nuôi', description:'Cho 1 vật nuôi ăn hôm nay.', stat:'animalsFed', goal:1, coins:35, xp:20},
  {id:'daily-craft-1', title:'Một mẻ chế biến', description:'Chế biến 1 sản phẩm hôm nay.', stat:'crafted', goal:1, coins:35, xp:20},
].map(mission => defineMission({...mission, progressMode:'daily'})));
export const ALL_DAILY_MISSIONS = Object.freeze([...DAILY_MISSIONS, ...FISHING_DAILY_MISSIONS, ...ACTIVITY_DAILY_MISSIONS]);
export const DAILY_COIN_BUDGET = 105;
function validDailyIds(ids) {
  if (!Array.isArray(ids) || ids.length !== 3 || new Set(ids).size !== 3) return false;
  const list = ids.map(id => ALL_DAILY_MISSIONS.find(m => m.id === id));
  return list.every(Boolean) && list.reduce((n,m)=>n+m.coins,0) <= DAILY_COIN_BUDGET;
}
export function selectDailyMissions(now, context = {}) {
  if (context.hasLand === false) return FISHING_DAILY_MISSIONS;
  const p = context.progress;
  if (!p?.onboarding?.completed) return DAILY_MISSIONS;
  // Stable selection for one account/day. Assets are checked only when assigning.
  let hash = 0;
  for (const char of `${missionDayKey(now)}:${context.seed || ''}`) hash = (Math.imul(hash,31)+char.charCodeAt(0)) >>> 0;
  const deliveries = [DAILY_MISSIONS[1]];
  if (p.stats?.orders > 0) deliveries.push(ACTIVITY_DAILY_MISSIONS[0]);
  const care = [DAILY_MISSIONS[2]];
  const herd = context.livestock || [];
  if (herd.some(a=>FARM_CONFIG.animals[a.species] && !FARM_CONFIG.animals[a.species].saleOnly)) care.push(ACTIVITY_DAILY_MISSIONS[1]);
  const canProduce = id => (FARM_CONFIG.crops[id]?.level <= p.level) || herd.some(a=>FARM_CONFIG.animals[a.species]?.product === id);
  if (p.stats?.crafted > 0 && Object.values(NPC_TRADING_CONFIG.recipes).some(r=>Object.keys(r.inputs).every(canProduce))) care.push(ACTIVITY_DAILY_MISSIONS[2]);
  return [DAILY_MISSIONS[0], deliveries[hash % deliveries.length], care[Math.floor(hash / deliveries.length) % care.length]];
}
export function dailyMissionList(missions = {}) {
  return (missions.daily?.ids || DAILY_MISSIONS.map(m => m.id)).map(id => ALL_DAILY_MISSIONS.find(m => m.id === id)).filter(Boolean);
}

export function missionDayKey(now = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = type => parts.find(item => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function freshDailyMissions(stats = {}, now = Date.now(), context = {}) {
  const list = selectDailyMissions(now, context);
  return { ids: list.map(m => m.id), dayKey: missionDayKey(now), baseline: Object.fromEntries(list.map(mission => [mission.stat, Math.max(0, Number(stats[mission.stat]) || 0)])), claimed: [] };
}

export function normalizeMissions(missions, stats = {}, now = Date.now(), context = {}) {
  const main = Array.isArray(missions?.main?.claimed) ? missions.main.claimed.filter(id => MAIN_MISSIONS.some(mission => mission.id === id)) : [];
  const daily = missions?.daily?.dayKey === missionDayKey(now) && missions.daily.baseline && Array.isArray(missions.daily.claimed)
    ? { ids: validDailyIds(missions.daily.ids) ? [...missions.daily.ids] : DAILY_MISSIONS.map(m => m.id), dayKey: missions.daily.dayKey, baseline: missions.daily.baseline, claimed: missions.daily.claimed.filter(id => ALL_DAILY_MISSIONS.some(mission => mission.id === id)) }
    : freshDailyMissions(stats, now, context);
  return { version: MISSION_VERSION, main: { claimed: [...new Set(main)] }, daily };
}

export function missionProgress(mission, stats = {}, missions = {}, kind = 'main') {
  const baseline = kind === 'daily' ? Math.max(0, Number(missions.daily?.baseline?.[mission.stat]) || 0) : 0;
  return Math.min(mission.goal, Math.max(0, (Number(stats[mission.stat]) || 0) - baseline));
}

export function activeMainMission(missions = {}) {
  return MAIN_MISSIONS.find(mission => !missions.main?.claimed?.includes(mission.id)) || null;
}

export function claimMission(progress, kind, id, now = Date.now(), context = {}) {
  progress.missions = normalizeMissions(progress.missions, missionStats(progress), now, context);
  const list = kind === 'main' ? MAIN_MISSIONS : kind === 'daily' ? dailyMissionList(progress.missions) : null;
  const mission = list?.find(item => item.id === id);
  if (!mission) return 'Nhiệm vụ không hợp lệ.';
  const unavailable = missionAvailability(mission, progress, context);
  if (unavailable) return unavailable;
  if (!Number.isSafeInteger(missionStats(progress)[mission.stat]) || missionStats(progress)[mission.stat] < 0) return 'Tiến độ nhiệm vụ không hợp lệ.';
  if (kind === 'main' && activeMainMission(progress.missions)?.id !== id) return 'Hãy hoàn thành nhiệm vụ chính tuyến trước đó.';
  if (progress.missions[kind].claimed.includes(id)) return 'Phần thưởng đã được nhận.';
  if (missionProgress(mission, missionStats(progress), progress.missions, kind) < mission.goal) return 'Nhiệm vụ chưa hoàn thành.';
  progress.missions[kind].claimed.push(id);
  progress.coins += mission.coins;
  progress.xp += mission.xp;
  return null;
}
