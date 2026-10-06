import assert from 'node:assert/strict';
import { isPointOnRoadCorridor, isRoadFootprintBlocked } from '../src/game/world/RoadSafetyZone.js';

assert.equal(isPointOnRoadCorridor(18, 70), false, 'the center of an off-road landmark is clear');
assert.equal(isRoadFootprintBlocked(18, 70, 5, 5, 1), false, 'an off-road landmark footprint stays clear');
assert.equal(isRoadFootprintBlocked(5, 70, 2, 2, 0), true, 'a footprint can overlap the avenue even when its center does not');
assert.equal(isRoadFootprintBlocked(-680, 93, 1, 1, 0), true, 'highway turnaround pads are reserved');
assert.equal(isRoadFootprintBlocked(-122, 7, 1, 1, 0), true, 'town turnaround pad is reserved');
assert.equal(isRoadFootprintBlocked(123, 43, 4, 4, 0), true, 'buildings cannot cover the town connector');
assert.equal(isRoadFootprintBlocked(100, 145, 2, 2, 0), false, 'unrelated meadow remains placeable');
assert.equal(isRoadFootprintBlocked(NaN, 0, 1, 1), true, 'invalid positions fail closed');
console.log('PASS: road footprint covers edges, turnarounds and connecting roads.');
