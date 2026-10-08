import { FISHING_CONFIG } from './fishingConfig.js';
import { fishingTimePhase } from './fishingSession.js';

// Server and simulator share the same pools, time preferences and weight rounding.
// The server keeps Math.random; only offline tests inject a seeded generator.
export function pickFishingCatch(zoneId, baitId = null, random = Math.random, now = Date.now()) {
  const zone = FISHING_CONFIG.zones[zoneId];
  if (!zone) return null;
  const pool = zone.fish.map(id => FISHING_CONFIG.fish[id]).filter(Boolean);
  if (!pool.length) return null;
  const bait = baitId ? FISHING_CONFIG.baits[baitId] : null;
  const rareChance = Math.min(0.85, Math.max(0, zone.rareChance + (bait?.rareBonus || 0)));
  const rarePool = pool.filter(fish => fish.rarity !== 'common');
  const normalPool = pool.filter(fish => fish.rarity === 'common');
  const selectedPool = random() < rareChance && rarePool.length ? rarePool : (normalPool.length ? normalPool : pool);
  const preferred = new Set(bait?.preferredFish || []);
  const phase = fishingTimePhase(now);
  const weighted = selectedPool.flatMap(fish => [fish, ...(preferred.has(fish.id) ? [fish] : []), ...(FISHING_CONFIG.timePreferences[fish.id]?.includes(phase) ? [fish] : [])]);
  const fish = weighted[Math.floor(random() * weighted.length)] || selectedPool[0];
  const [minWeight, maxWeight] = fish.weight;
  const weight = Math.round((minWeight + random() * (maxWeight - minWeight)) * 100) / 100;
  return { fishId: fish.id, weight };
}
