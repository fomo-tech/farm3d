import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { batchRigidMeshes } from '../src/game/rendering/batchRigidMeshes.js';
const engine = new NullEngine(), scene = new Scene(engine);
const root = new TransformNode('bus', scene);
root.position.set(100, 2, -60); root.rotation.y = 0.7;
const paint = new StandardMaterial('paint', scene);
const glass = new StandardMaterial('glass', scene); glass.alpha = 0.5;
const pieces = Array.from({length: 40}, (_, i) => {
  const mesh = MeshBuilder.CreateBox(`seat-${i}`, {}, scene);
  mesh.parent = root; mesh.position.set(i % 4, 1, Math.floor(i / 4)); mesh.material = paint;
  return mesh;
});
const original = pieces.flatMap(mesh => { mesh.computeWorldMatrix(true); return mesh.getBoundingInfo().boundingBox.vectorsWorld.map(v => v.clone()); });
const blinker = MeshBuilder.CreateBox('blinker', {}, scene); blinker.parent = root; blinker.material = paint;
const window = MeshBuilder.CreateBox('window', {}, scene); window.parent = root; window.material = glass;
const axle = new TransformNode('wheel-node', scene); axle.parent = root;
const wheel = MeshBuilder.CreateBox('wheel', {}, scene); wheel.parent = axle; wheel.material = paint;
const renderList = [pieces[0], wheel];
const shadows = { getShadowMap: () => ({ renderList }), removeShadowCaster(mesh) { const i = renderList.indexOf(mesh); if(i >= 0)renderList.splice(i,1); }, addShadowCaster(mesh) {renderList.push(mesh);} };
assert.equal(batchRigidMeshes(root, {exclude: new Set([blinker]), shadows}), 39);
const merged = scene.getMeshByName('bus-rigid-paint'); merged.computeWorldMatrix(true);
for (const axis of ['x','y','z']) {
  const bounds = merged.getBoundingInfo().boundingBox;
  assert.ok(Math.abs(bounds.minimumWorld[axis] - Math.min(...original.map(v => v[axis]))) < 0.001);
  assert.ok(Math.abs(bounds.maximumWorld[axis] - Math.max(...original.map(v => v[axis]))) < 0.001);
}
assert.ok(!blinker.isDisposed() && !wheel.isDisposed() && !window.isDisposed());
assert.ok(renderList.includes(merged) && renderList.includes(wheel));
const before = merged.getAbsolutePosition().clone();
root.position.x += 25; merged.computeWorldMatrix(true);
assert.ok(Math.abs(Vector3.Distance(before, merged.getAbsolutePosition()) - 25) < 0.001);
scene.dispose(); engine.dispose();
console.log('PASS: 40 rigid parts become one; moved/rotated world bounds, passenger frame, wheels, blinkers, transparency and shadows preserved');
