import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { LAKE_CONFIG, lakeEdge, lakeDeepWaterAt, lakeGroundHeight, lakeMovementBlocked, recoverLakePosition } from '../shared/lakeConfig.js';
import { fishingWaterAt } from '../shared/fishing.js';
import { VENUE_LAYOUT } from '../shared/venueLayout.js';
import { WorldCollisionSystem } from '../src/game/physics/WorldCollisionSystem.js';
import { getTerrainHeight } from '../src/game/world/TerrainHeightSystem.js';
import { createRomanticLake } from '../src/game/world/landmarks/createRomanticLake.js';
import { createLakeDistrict } from '../src/game/world/landmarks/createWaterBody.js';

const collision=new WorldCollisionSystem();
for(let x=112;x<=163;x+=.25) {
  assert.equal(collision.isColliding(x,2),false,`lake approach blocked at ${x},2`);
  if(x>=143) {
    assert.equal(fishingWaterAt(x,2),'lake');
    assert.equal(getTerrainHeight(x,2),LAKE_CONFIG.pier.deckY);
  }
}
for(let z=-2.4;z<=6.4;z+=.25)assert.equal(collision.isColliding(162,z),false,'T pier walkable');
const door=VENUE_LAYOUT.fishing.entrance;
assert.equal(collision.isColliding(door.x,door.z),false,'shop entrance open');
assert.equal(collision.isColliding(LAKE_CONFIG.shop.x,LAKE_CONFIG.shop.z),true,'shop body solid');
for(const point of [[167,26],[196,-10],[181,-40],[143,12]])assert.equal(lakeDeepWaterAt(...point),true,'all deep water is blocked');
assert.equal(lakeMovementBlocked({x:133,z:2},{x:163,z:2}),false);
assert.equal(lakeMovementBlocked({x:162,z:2},{x:162,z:15}),true);
assert.equal(lakeMovementBlocked({x:130,z:20},{x:205,z:20}),true,'cannot skip across water');
assert.equal(lakeMovementBlocked({x:-1e7,z:20},{x:1e7,z:20}),true,'large requests still check the lake with bounded work');
assert.equal(lakeGroundHeight(196,-10),null,'removed island has no ghost ground');
const old={x:196,y:.18,z:-10,layoutVersion:7};
assert.equal(recoverLakePosition(old).x,LAKE_CONFIG.approach.x);
assert.equal(recoverLakePosition({...old,venue:'fishing'}).x,196);
for(let i=0;i<96;i++)assert.ok(Number.isFinite(lakeEdge(i*Math.PI/48).x));

const engine=new NullEngine(),scene=new Scene(engine);
scene.activeCamera={target:new Vector3(153,0,2)};
const baseline={meshes:scene.meshes.length,materials:scene.materials.length,observers:scene.onBeforeRenderObservable.observers.length};
let counts;
for(let i=0;i<5;i++) {
  const lake=createRomanticLake(scene),district=createLakeDistrict(scene);
  assert.equal(scene.meshes.filter(mesh=>mesh.name==='crystal-lake').length,1);
  assert.equal(scene.getTransformNodeByName('lake-arch-bridge'),null);
  const current={meshes:scene.meshes.length,materials:scene.materials.length,observers:scene.onBeforeRenderObservable.observers.length};
  counts??=current;assert.deepEqual(current,counts,'rebuild must not grow resources');
  assert.ok(current.meshes<90,`lake budget exceeded: ${current.meshes}`);
  scene.onBeforeRenderObservable.notifyObservers(scene);
  assert.ok(lake.root.metadata.animationFrames>0);
  lake.dispose();district.dispose();
  // Babylon removes observers at the next event-loop turn after marking them
  // inactive. Count after that flush rather than treating pending removal as a leak.
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.deepEqual({meshes:scene.meshes.length,materials:scene.materials.length,observers:scene.onBeforeRenderObservable.observers.length},baseline,'dispose must release owned resources');
}
scene.activeCamera=null;scene.dispose();engine.dispose();
console.log('PASS lake: clear approach/shop/T pier, shared collision/fishing/heights, no ghost island, five stable rebuilds',counts);
