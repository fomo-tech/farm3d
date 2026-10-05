import assert from 'node:assert/strict';
import { travelCost } from '../shared/travelConfig.js';
const start = { x: 0, z: 0 };
assert.equal(travelCost(start, start), 0);
assert.equal(travelCost(start, { x: 10, z: 0 }), 12);
assert.equal(travelCost(start, { x: 100, z: 0 }), 30);
assert.equal(travelCost(start, { x: 300, z: 400 }), 110);
assert.throws(() => travelCost(start, { x: NaN, z: 0 }));
console.log('PASS: travel distance pricing and invalid coordinates');
