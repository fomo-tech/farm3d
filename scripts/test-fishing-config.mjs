import assert from 'node:assert/strict';
import {
  FISHING_CONFIG,
  FISHING_GEAR,
  FISHING_GEAR_ORDER,
  calculateFishSaleValue,
  fishingCapacity,
  fishingInventoryCount,
  normalizeFishingState,
  validateFishingConfig,
} from '../shared/fishingConfig.js';

assert.equal(validateFishingConfig(), true);
assert.ok(Object.keys(FISHING_CONFIG.rods).length >= 2);
assert.ok(Object.keys(FISHING_CONFIG.baits).length >= 2);
assert.ok(Object.keys(FISHING_CONFIG.fish).length >= 5);
assert.equal(FISHING_GEAR_ORDER.length, Object.keys(FISHING_GEAR).length);

const fresh = normalizeFishingState({
  ownedRods: ['rod_bamboo'],
  equippedRod: 'rod_bamboo',
  bait: { bait_worm: 3 },
  fish: { carp: 2 },
});
assert.equal(fresh.fish.carp.count, 2);
assert.equal(fresh.fish.carp.totalWeight, 2);
assert.equal(fishingInventoryCount(fresh), 2);
assert.equal(fishingCapacity(fresh), FISHING_CONFIG.defaults.coolerCapacity);

const upgraded = normalizeFishingState({ ownedTools: { cooler_box: true } });
assert.equal(upgraded.coolerCapacity, FISHING_CONFIG.tools.cooler_box.capacity);
assert.equal(fishingCapacity(upgraded), 30);

const lightCatch = calculateFishSaleValue('carp', FISHING_CONFIG.fish.carp.weight[0]);
const heavyCatch = calculateFishSaleValue('carp', FISHING_CONFIG.fish.carp.weight[1]);
assert.ok(heavyCatch > lightCatch);
assert.equal(calculateFishSaleValue('missing-fish', 1), 0);

console.log('Fishing config and economy OK.');
