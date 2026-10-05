import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { mergeLakeStatics } from '../src/game/rendering/mergeLakeStatics.js';
const engine = new NullEngine();
const scene = new Scene(engine);
const root = new TransformNode('lake', scene);
const pier = new TransformNode('pier', scene); pier.parent = root; pier.position.x = 153;
const material = new StandardMaterial('wood', scene);
for (let i = 0; i < 20; i++) {
  const mesh = MeshBuilder.CreateBox(`pier-plank-${i}`, {}, scene);
  mesh.parent = pier; mesh.position.x = i; mesh.material = material;
}
const water = MeshBuilder.CreateGround('crystal-lake', {}, scene); water.parent = root;
assert.equal(mergeLakeStatics(root), 19);
assert.equal(water.isDisposed(), false);
const batch = scene.meshes.find(mesh => mesh.name.startsWith('lake-static-batch'));
batch.computeWorldMatrix(true);
assert.equal(batch.getBoundingInfo().boundingBox.minimumWorld.x, 152.5);
assert.equal(batch.getBoundingInfo().boundingBox.maximumWorld.x, 172.5);
assert.equal(batch.getTotalIndices(), 20 * 36);
scene.dispose(); engine.dispose();
console.log('PASS: 20 static meshes become 1; exact world bounds/triangles preserved; water untouched');
