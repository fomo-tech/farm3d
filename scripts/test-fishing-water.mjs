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

const {fishingCastTarget,fishingSurfaceAt}=await import('../shared/fishing.js');
const east=fishingCastTarget(158,2,'lake',10,0,Math.PI/2);
assert.ok(east&&east.x>158&&Math.abs(east.z-2)<1e-8,'cast follows facing east');
assert.ok(fishingSurfaceAt(east.x,east.z,'lake'),'target lies in water');
assert.equal(fishingCastTarget(158,2,'lake',10,0,-Math.PI/2),null,'facing land never auto-turns cast into water');
const pond=fishingCastTarget(89,68,'pond',6,0,-Math.PI/2);
assert.ok(pond&&pond.x<89&&Math.abs(pond.z-68)<1e-8,'pond cast follows facing west');
console.log('PASS: facing ray, water validation and away-from-water rejection');
