import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { BEACH_CONFIG, beachShoreZ, beachFishingAt, validateBeachConfig } from '../shared/beachConfig.js';
import { fishingWaterAt } from '../shared/fishing.js';
import { createCozyBeach } from '../src/game/world/landmarks/createCozyBeach.js';
import { createSeasideOcean } from '../src/game/world/landmarks/createSeasideOcean.js';
import { getWorldChunkStreamer } from '../src/game/world/WorldChunkStreamer.js';
import { WorldCollisionSystem } from '../src/game/physics/WorldCollisionSystem.js';
import { getTerrainHeight } from '../src/game/world/TerrainHeightSystem.js';
assert.ok(Object.isFrozen(BEACH_CONFIG.zones));
assert.throws(()=>validateBeachConfig({...BEACH_CONFIG,streaming:{detailDistance:200,keepDistance:150}}));
for(const x of [-100,-40,0,50,100]) assert.equal(fishingWaterAt(x,beachShoreZ(x)-2),'sea');
assert.equal(beachFishingAt(-63,364),true); assert.equal(fishingWaterAt(-63,364),'sea');
assert.equal(beachFishingAt(0,328),false);
const collision=new WorldCollisionSystem();
assert.equal(collision.isColliding(-22,331),true); assert.equal(collision.isColliding(-70,343),true);
assert.equal(collision.isColliding(0,328),false); assert.equal(collision.isColliding(-63,363),false);
assert.equal(collision.isColliding(0,370),true);
assert.equal(getTerrainHeight(-63,363),BEACH_CONFIG.fishingPier.deckY);
assert.equal(getTerrainHeight(0,328),.21);
const engine=new NullEngine(); const scene=new Scene(engine);
const ocean=createSeasideOcean(scene); assert.equal(ocean.shoreZ(55),beachShoreZ(55));
for(const side of [-1,1]) for(const kind of ['wet','dry','path']) {
  const mesh=scene.getMeshByName(`beach-side-${kind}-${side}`);
  assert.ok(mesh,`Both bay edges need ${kind}`);
  assert.ok(mesh.getTotalVertices()>100);
  assert.equal(mesh.getVerticesData('normal')[1],1,'Bank surface must face upward');
}
for(const name of ['seaside-wet-sand','sea-shallow-water-mat','sea-mid-water-mat']) assert.equal(scene.getMaterialByName(name).alpha,1);
scene.activeCamera={target:new Vector3(0,0,350)}; scene.onBeforeRenderObservable.notifyObservers(scene); scene.activeCamera=null;
for(const mesh of ocean.meshes.filter(m=>m.name.startsWith('sea-shore-foam'))) assert.equal(mesh.scaling.z,1);
const beach=createCozyBeach(scene,null); const streamer=getWorldChunkStreamer(scene);
const wait=()=>new Promise(resolve=>setTimeout(resolve,60));
let tick=performance.now();
async function arrive() {
  for(let i=0;i<40;i++){streamer.update({x:0,z:345},{x:0,z:1},tick+=200);await wait();if(streamer.getStats().ready===6)return;}
  assert.fail(`All beach zones should load: ${JSON.stringify(streamer.getStats())}`);
}
await arrive();
assert.equal(scene.meshes.filter(m=>m.name==='cozy-beach-palm-trunk' && !m.parent?.metadata?.lod).length,BEACH_CONFIG.palms.length);
const nearCount=scene.meshes.length, mats=scene.materials.length;
for(let round=0;round<3;round++) {
  for(let i=0;i<3;i++)streamer.update({x:900,z:900},{x:0,z:0},tick+=200);
  assert.equal(streamer.getStats().ready,0);
  assert.ok([...streamer.entries.values()].every(e=>e.state==='unloaded'));
  for(const lod of scene.transformNodes.filter(n=>n.name.startsWith('beach-')&&n.name.endsWith('-lod')))assert.ok(lod.isEnabled());
  await arrive(); assert.equal(scene.meshes.length,nearCount); assert.equal(scene.materials.length,mats);
}
beach.dispose(); assert.equal(streamer.entries.size,0); ocean.dispose();
scene.dispose();engine.dispose();
console.log('PASS beach: shared coast/fishing, collision, opaque water, six streamed zones, repeated unload/reload, stable meshes/materials');
