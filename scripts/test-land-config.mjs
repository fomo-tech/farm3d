import assert from 'node:assert/strict';
import { LAND_CONFIG, validateLandConfig, calculateLandPrice, firstLandPurchasePrice, landPricingRadius } from '../shared/landConfig.js';
import { WORLD_VILLAGES, worldFarmId } from '../shared/villageLayout.js';
import { farmLotPosition } from '../shared/farmLayout.js';
const lots = WORLD_VILLAGES.flatMap(v => Array.from({ length: 24 }, (_, index) => ({
  farmId: worldFarmId(v.order, index + 1), villageId: v.id, ...farmLotPosition(v.order * 24 + index + 1),
})));
const radius = landPricingRadius(lots);
assert.equal(lots.length, 288);
for (const lot of lots) assert.equal(calculateLandPrice(lot, radius), 6000 + Math.round(6000 * (1 - Math.hypot(lot.x, lot.z) / radius) / 50) * 50, `configured price ${lot.farmId}`);
const lot = lots[0];
let config = structuredClone(LAND_CONFIG);
config.villageMultipliers[lot.villageId] = 1.2;
assert.equal(calculateLandPrice(lot, radius, config), Math.min(config.maxPrice, Math.round(calculateLandPrice(lot, radius) * 1.2 / 50) * 50));
config.overrides[lot.farmId] = 1234;
assert.equal(calculateLandPrice(lot, radius, config), 1234, 'exact override takes precedence');
assert.equal(calculateLandPrice({ ...lot, x: radius * 10 }, radius), LAND_CONFIG.minPrice);
assert.equal(calculateLandPrice({ ...lot, x: 0, z: 0 }, radius), LAND_CONFIG.maxPrice);
assert.equal(landPricingRadius([]), 1);
assert.equal(firstLandPurchasePrice(6000), 6000);
assert.equal(firstLandPurchasePrice(12000), 12000);
assert.ok(lots.every(l => firstLandPurchasePrice(calculateLandPrice(l, radius)) >= 6000));
assert.ok(180 + 1800 + 100 < LAND_CONFIG.minPrice, 'issued gifts cannot bypass the entry price');
for (const change of [{ minPrice: -1 }, { maxPrice: 100 }, { roundingStep: 0 }, { center: { x: NaN, z: 0 } }, { villageMultipliers: { test: 0 } }, { overrides: { farm_000001: -10 } }]) {
  assert.throws(() => validateLandConfig({ ...structuredClone(LAND_CONFIG), ...change }), /Land config/);
}
assert.ok(Object.isFrozen(LAND_CONFIG.overrides));
console.log('PASS: identical prices on 288 parcels, village factors, exact overrides, bounds and invalid configuration.');

const byDistance=[...lots].sort((a,b)=>Math.hypot(a.x-LAND_CONFIG.center.x,a.z-LAND_CONFIG.center.z)-Math.hypot(b.x-LAND_CONFIG.center.x,b.z-LAND_CONFIG.center.z));
for(let i=1;i<byDistance.length;i++)assert.ok(calculateLandPrice(byDistance[i-1],radius)>=calculateLandPrice(byDistance[i],radius),'nearer town center must never cost less');
console.log('PASS: prices decrease with distance across all 288 parcels.');
