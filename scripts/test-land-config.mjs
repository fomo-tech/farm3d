import assert from 'node:assert/strict';
import { LAND_CONFIG, validateLandConfig, calculateLandPrice, firstLandPurchasePrice, landPricingRadius } from '../shared/landConfig.js';
import { WORLD_VILLAGES, worldFarmId } from '../shared/villageLayout.js';
import { farmLotPosition } from '../shared/farmLayout.js';
const lots = WORLD_VILLAGES.flatMap(v => Array.from({ length: 24 }, (_, index) => ({
  farmId: worldFarmId(v.order, index + 1), villageId: v.id, ...farmLotPosition(v.order * 24 + index + 1),
})));
const radius = landPricingRadius(lots);
assert.equal(lots.length, 288);
for (const lot of lots) assert.equal(calculateLandPrice(lot, radius), 150 + Math.round(1850 * (1 - Math.hypot(lot.x, lot.z) / radius) / 50) * 50, `legacy price ${lot.farmId}`);
const lot = lots[0];
let config = structuredClone(LAND_CONFIG);
config.villageMultipliers[lot.villageId] = 1.2;
assert.equal(calculateLandPrice(lot, radius, config), Math.min(config.maxPrice, Math.round(calculateLandPrice(lot, radius) * 1.2 / 50) * 50));
config.overrides[lot.farmId] = 1234;
assert.equal(calculateLandPrice(lot, radius, config), 1234, 'exact override takes precedence');
assert.equal(calculateLandPrice({ ...lot, x: radius * 10 }, radius), LAND_CONFIG.minPrice);
assert.equal(calculateLandPrice({ ...lot, x: 0, z: 0 }, radius), LAND_CONFIG.maxPrice);
assert.equal(landPricingRadius([]), 1);
assert.equal(firstLandPurchasePrice(150), 150, 'starter land still has an entry cost');
assert.equal(firstLandPurchasePrice(500), 150, 'starter assistance makes a 500-xu lot affordable on day one');
assert.equal(firstLandPurchasePrice(1700), 1350, 'premium land retains a substantial premium');
assert.ok(lots.filter(l => firstLandPurchasePrice(calculateLandPrice(l, radius)) <= 180).length > 100, 'new players have many affordable choices');
for (const change of [{ minPrice: -1 }, { maxPrice: 100 }, { roundingStep: 0 }, { center: { x: NaN, z: 0 } }, { villageMultipliers: { test: 0 } }, { overrides: { farm_000001: -10 } }]) {
  assert.throws(() => validateLandConfig({ ...structuredClone(LAND_CONFIG), ...change }), /Land config/);
}
assert.ok(Object.isFrozen(LAND_CONFIG.overrides));
console.log('PASS: identical prices on 288 parcels, village factors, exact overrides, bounds and invalid configuration.');
