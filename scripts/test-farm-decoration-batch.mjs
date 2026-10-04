import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { batchFarmDecorationSteps } from '../src/game/farming/batchFarmDecoration.js';
const engine = new NullEngine(), scene = new Scene(engine);
const root = new TransformNode('farm',scene); root.position.set(-300,0,112);
const material = new StandardMaterial('fence',scene);
const original = [];
for (let i=0;i<10;i++) {
  const mesh = MeshBuilder.CreateBox(`detail-fence-${i}`,{},scene);
  mesh.position.set(i,1,0); mesh.parent = root; mesh.material = material;
  mesh.computeWorldMatrix(true);
  original.push(mesh.getBoundingInfo().boundingBox.minimumWorld.clone(),mesh.getBoundingInfo().boundingBox.maximumWorld.clone());
}
const tile = MeshBuilder.CreateBox('soil',{ },scene); tile.parent = root;
tile.metadata = {interactive:true};
const steps = batchFarmDecorationSteps(root,'a'); let result;
do {result=steps.next();} while(!result.done);
assert.equal(result.value,9);
assert.equal(scene.meshes.length,2);
assert.ok(!tile.isDisposed());
const merged = scene.getMeshByName('farm-decor-batch-a-fence');
merged.computeWorldMatrix(true);
const box=merged.getBoundingInfo().boundingBox;
for (const axis of ['x','y','z']) {
  assert.ok(Math.abs(box.minimumWorld[axis]-Math.min(...original.map(v=>v[axis])))<.001);
  assert.ok(Math.abs(box.maximumWorld[axis]-Math.max(...original.map(v=>v[axis])))<.001);
}
root.setEnabled(false); assert.ok(!merged.isEnabled());
scene.dispose();engine.dispose();
console.log('PASS: ten farm decorations become one draw mesh; exact negative-coordinate bounds and interactive tiles preserved');
