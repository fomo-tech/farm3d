import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { createLampHaloOnly } from '../src/game/world/worldDesignSystem.js';
const engine=new NullEngine(),scene=new Scene(engine);
// Position regression does not need a browser canvas/halo bitmap.
new StandardMaterial('ghibli-lamp-halo',scene);
new StandardMaterial('ghibli-ground-light-pool',scene);
scene.activeCamera=new FreeCamera('camera',new Vector3(0,20,0),scene);
for(const rotation of [0,Math.PI/2,-Math.PI/2,Math.PI]) {
  const parent=new TransformNode('road',scene);
  parent.position.set(0,0,310);parent.rotation.y=rotation;
  const position=new Vector3(3.6,3.9,180);
  const halo=createLampHaloOnly(scene,parent,position,.75);
  parent.computeWorldMatrix(true);halo.computeWorldMatrix(true);
  const expected=Vector3.TransformCoordinates(position,parent.getWorldMatrix());
  assert.ok(Vector3.Distance(halo.getAbsolutePosition(),expected)<.001,'Halo must remain at the rotated lamp position');
}
scene.dispose();engine.dispose();
console.log('PASS: lamp billboard position follows rotated road parent');
