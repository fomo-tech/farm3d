import { FISHING_CONFIG, calculateFishSaleValue } from './fishingConfig.js';

// Validate the entire sale before changing inventory; no partial sale on failure.
export function sellFishingCatch(fishing, action, payload = {}, now = Date.now()) {
  const sellAll = action === 'fishing_sell_all';
  if (!sellAll && action !== 'fishing_sell') throw new Error('Giao dịch cá không hợp lệ.');
  if (!sellAll && !Object.hasOwn(FISHING_CONFIG.fish, payload.id)) throw new Error('Loài cá không hợp lệ.');
  const requestedAmount = payload.amount ?? 1;
  if (!sellAll && (!Number.isSafeInteger(requestedAmount) || requestedAmount < 1)) throw new Error('Số lượng cá phải là số nguyên dương.');
  const entries = sellAll ? Object.entries(fishing.fish) : [[payload.id, fishing.fish[payload.id]]];
  const sales = [];
  let count = 0, coins = 0;
  for (const [id, entry] of entries) {
    if (!Object.hasOwn(FISHING_CONFIG.fish, id) || !entry) continue;
    if (!Number.isSafeInteger(entry.count) || entry.count < 0 || !Number.isFinite(entry.totalWeight) || entry.totalWeight < 0) throw new Error('Tồn kho cá không hợp lệ.');
    if (!entry.count) continue;
    const amount = sellAll ? entry.count : requestedAmount;
    if (amount > entry.count) throw new Error('Không đủ cá để bán.');
    const averageWeight = entry.totalWeight / entry.count || FISHING_CONFIG.fish[id].weight[0];
    const value = calculateFishSaleValue(id, averageWeight) * amount;
    count += amount; coins += value;
    sales.push({ id, entry, amount, averageWeight });
  }
  if (!count) throw new Error('Bạn không có cá để bán.');
  if (!Number.isSafeInteger(count) || !Number.isSafeInteger(coins)) throw new Error('Giá trị giao dịch cá không hợp lệ.');
  for (const { id, entry, amount, averageWeight } of sales) {
    entry.count -= amount;
    entry.totalWeight = Math.max(0, entry.totalWeight - averageWeight * amount);
    if (!entry.count) delete fishing.fish[id];
  }
  fishing.stats = { ...fishing.stats, totalSold: (Number.isSafeInteger(fishing.stats?.totalSold) ? fishing.stats.totalSold : 0) + count };
  fishing.lastSale = { count, coins, at: now };
  return { count, coins };
}
