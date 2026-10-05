import assert from 'node:assert/strict';
import { fishingWaterAt } from '../shared/fishing.js';

assert.equal(fishingWaterAt(153, 2), 'lake');
assert.equal(fishingWaterAt(167, 26), null, 'deep water is not a reachable fishing bank');
assert.equal(fishingWaterAt(220, -380), 'river');
assert.equal(fishingWaterAt(0, 360), 'sea');
assert.equal(fishingWaterAt(89, 68), 'pond');
assert.equal(fishingWaterAt(0, 0), null);
assert.equal(fishingWaterAt(210, -380), null);
assert.equal(fishingWaterAt(0, 310), null);
console.log('Fishing water zones OK.');
