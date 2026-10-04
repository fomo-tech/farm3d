import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { BEACH_CONFIG, beachWaterAt, beachRoadAt, beachRoadSegments } from '../shared/beachConfig.js';
import { isRoadResourceBlocked, isPointOnRoadCorridor } from '../src/game/world/RoadSafetyZone.js';
for(const s of beachRoadSegments()) {
  for(let d=-s.length/2;d<=s.length/2;d+=2) {
    const x=s.x+(s.isNorthSouth?0:d), z=s.z+(s.isNorthSouth?d:0);
    assert.equal(beachWaterAt(x,z,BEACH_CONFIG.road.width/2+1.2),false,`${s.id} at ${x},${z}`);
    assert.equal(beachRoadAt(x,z),true);
  }
}
assert.equal(isPointOnRoadCorridor(0,406),false);
assert.equal(isPointOnRoadCorridor(0,310),true);
for(const [x,z] of [[0,406],[130,440],[160,530],[400,850]]) assert.equal(isRoadResourceBlocked(x,z,3),true);
for(const [x,z] of BEACH_CONFIG.palms) assert.equal(beachWaterAt(x,z,3),false);
assert.equal(beachWaterAt(-300,406),false,'Southern village stays on land');
assert.equal(beachWaterAt(-240,600),false,'Southern village farms stay on land');
assert.equal(isRoadResourceBlocked(220,540,3),true,'No foliage inside the relocated river');
const source=await readFile(new URL('../src/game/world/FarmWorld.js',import.meta.url),'utf8');
assert.match(source,/for \(const segment of beachRoadSegments\(\)\)/,'World must actually build configured coast roads');
assert.doesNotMatch(source,/id:\s*'regional-highway-south'/,'Old road crossing ocean must not be built');
console.log('PASS: coastal road footprint dry, offshore resources blocked, palms on dry sand');
