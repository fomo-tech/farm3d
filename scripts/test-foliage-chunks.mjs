import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { FoliageInstancingEngine } from '../src/game/world/FoliageInstancingEngine.js';

const engine = new NullEngine();
const scene = new Scene(engine);
scene.activeCamera = { target: new Vector3(0, 0, 0) };
const base = MeshBuilder.CreateBox('oak-source', { size: 1 }, scene);
base.isVisible = false;
const foliage = Object.create(FoliageInstancingEngine.prototype);
foliage.scene = scene;
foliage.shadows = null;
foliage.prototypes = new Map([['oak', [base]]]);
foliage.chunks = new Map();
foliage.dirtyChunks = new Set();
foliage.lastChunkUpdate = 0;
for (let i = 0; i < 100; i++) foliage._queueChunkInstance('oak', {
  x: 1 + i % 10, y: 0, z: 1 + Math.floor(i / 10), scale: 1, rotY: 0, withShadow: false,
});
foliage.updateChunks();
assert.equal(foliage.chunks.size, 1);
assert.equal(foliage.chunks.get('0:0').groups.get('oak').requests.length, 100);
assert.ok(scene.meshes.length < 5, '100 trees should use a prototype, one chunk mesh and LOD');
assert.equal(foliage.chunks.get('0:0').groups.get('oak').meshes[0].thinInstanceCount, 100);
scene.activeCamera.target.set(600, 0, 600);
foliage.lastChunkUpdate = -1000;
foliage.updateChunks();
const group = foliage.chunks.get('0:0').groups.get('oak');
assert.equal(group.proxy.isEnabled(), true);
assert.equal(group.meshes.length, 1, 'recent detail stays cached');
assert.equal(group.meshes[0].isEnabled(), false);
const cachedMesh = group.meshes[0];
scene.activeCamera.target.set(0, 0, 0);
foliage.lastChunkUpdate = -1000;
foliage.updateChunks();
assert.equal(group.meshes[0].thinInstanceCount, 100, 'returning restores the same tree assets');
assert.equal(group.meshes[0], cachedMesh, 'returning reuses GPU buffers');
// Visit more cells than the cache budget, then leave all of them.
for (let i = 1; i <= 40; i++) {
  const x = i * 1000;
  foliage._queueChunkInstance('oak', { x, y: 0, z: 0, scale: 1, rotY: 0 });
  scene.activeCamera.target.set(x, 0, 0);
  for (let step = 0; step < 4; step++) { foliage.lastChunkUpdate = -1000; foliage.updateChunks(); }
}
scene.activeCamera.target.set(100000, 0, 100000);
for (let step = 0; step < 100; step++) { foliage.lastChunkUpdate = -1000; foliage.updateChunks(); }
assert.ok([...foliage.chunks.values()].filter(chunk => [...chunk.groups.values()].some(g => g.meshes.length)).length <= 32,
  'cold foliage detail respects the cache limit');
assert.equal(group.requests.length, 100, 'eviction preserves tree placements');
scene.activeCamera = null;
scene.dispose();
engine.dispose();
console.log('PASS: foliage chunk batching, 100 exact instances, distant LOD');
