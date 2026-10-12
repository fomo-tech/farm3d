import assert from 'node:assert/strict';
import { resolveGroundedHeight } from '../src/game/player/groundContact.js';
import { getTerrainHeight } from '../src/game/world/TerrainHeightSystem.js';
for (const dt of [1/120,1/60,1/30,.1]) {
 let y = 0;
 for (const surface of [0,.08,.12,.5,1,.9,.4,0]) {
   y=resolveGroundedHeight(y,surface,dt);
   assert.ok(y >= surface, 'walking uphill must never sink below support');
 }
}
let y=0;
for(let z=60;z>=40;z-=.1){let surface=getTerrainHeight(0,z);y=resolveGroundedHeight(y,surface,1/60);assert.ok(y>=surface);}
assert.equal(resolveGroundedHeight(NaN,.12,1/60),.12);
assert.equal(resolveGroundedHeight(0,.12,0),.12);
assert.ok(resolveGroundedHeight(1,0,1/60)>0,'downhill retains smoothing');
console.log('PASS: grounded height stays above uphill surfaces at 30/60/120 FPS and town plaza transition');
