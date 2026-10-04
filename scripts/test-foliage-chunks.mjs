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
foliage.loadedPrototypes = new Set(['oak']);
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
// Move away before a queued group's first build: the previous transition
// cleared dirty and left neither detail nor a proxy.
foliage._queueChunkInstance('oak', { x: 20, y: 0, z: 20, scale: 1, rotY: 0 });
group.proxy.dispose();
group.proxy = null;
foliage.chunks.get('0:0').detailed = true;
foliage.lastChunkUpdate = -1000;
foliage.updateChunks();
assert.ok(group.proxy?.isEnabled(), 'leaving during construction must build a visible far proxy');
assert.equal(group.proxy.thinInstanceCount, 101, 'new placements survive transition');
scene.activeCamera.target.set(0, 0, 0);
foliage.lastChunkUpdate = -1000;
foliage.updateChunks();
assert.equal(group.meshes[0].thinInstanceCount, 101, 'returning updates cached buffers with new placements');
assert.equal(group.meshes[0], cachedMesh, 'returning reuses GPU buffers');
assert.equal(cachedMesh.alwaysSelectAsActiveMesh, true, 'near detail is protected from camera rejection');
for (let visit = 0; visit < 10; visit++) {
  for (const x of [600, 0]) {
    scene.activeCamera.target.set(x, 0, x);
    foliage.lastChunkUpdate = -1000;
    foliage.updateChunks();
    assert.equal(cachedMesh.alwaysSelectAsActiveMesh, x === 0,
      'camera rejection bypass must be bounded to nearby chunks');
    assert.ok(group.proxy.isEnabled() || group.meshes.some(mesh => mesh.isEnabled()),
      'at least one representation must remain enabled');
  }
}
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
assert.equal(group.requests.length, 101, 'eviction preserves tree placements');
assert.equal(foliage.getStats().missingRepresentations, 0,
  'after pending work finishes every group retains a detail or LOD representation');
scene.activeCamera = null;
scene.dispose();
engine.dispose();
console.log('PASS: foliage chunk batching, 100 exact instances, distant LOD');
