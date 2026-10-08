import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { createCozyBeach } from '../src/game/world/landmarks/createCozyBeach.js';
import { installWorldRenderIndex } from '../src/game/rendering/WorldRenderIndex.js';
const engine=new NullEngine(),scene=new Scene(engine);
const beach=createCozyBeach(scene,null);
const index=installWorldRenderIndex(scene);await index.ready;
const birds=scene.transformNodes.filter(n=>/^seagull-\d+$/.test(n.name));
assert.equal(birds.length,4);
for(let frame=0;frame<20;frame++) {
 scene.onBeforeRenderObservable.notifyObservers(scene);
 for(const bird of birds) {
  assert.ok(bird.position.z>300 && bird.position.z<400,'birds remain above the sea');
  for(const mesh of bird.getChildMeshes()) {
   assert.equal(mesh.getClassName(),'Mesh','animated birds have independent geometry');
   assert.ok(scene.selectionOctree.dynamicContent.includes(mesh),'moving parts must not use static bounds');
   mesh.computeWorldMatrix(true);
   const {minimumWorld:min,maximumWorld:max}=mesh.getBoundingInfo().boundingBox;
   assert.ok([min.x,min.y,min.z,max.x,max.y,max.z].every(Number.isFinite));
   assert.ok(max.subtract(min).length()<2,'no stretched world-space bird geometry');
  }
 }
}
index.dispose();beach.dispose();scene.dispose();engine.dispose();
console.log('PASS: independent seagull geometry, moving octree bounds and bounded coastal flight');
