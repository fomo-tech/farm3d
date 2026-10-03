import assert from 'node:assert/strict';
import { fishingWaterAt } from '../shared/fishing.js';

assert.equal(fishingWaterAt(126, 2), 'lake');
assert.equal(fishingWaterAt(167, 26), 'lake');
assert.equal(fishingWaterAt(220, -380), 'river');
assert.equal(fishingWaterAt(0, 360), 'sea');
assert.equal(fishingWaterAt(89, 68), 'pond');
assert.equal(fishingWaterAt(0, 0), null);
assert.equal(fishingWaterAt(210, -380), null);
assert.equal(fishingWaterAt(0, 310), null);
console.log('Fishing water zones OK.');
