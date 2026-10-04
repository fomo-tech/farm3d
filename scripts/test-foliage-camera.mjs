import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { FoliageInstancingEngine } from '../src/game/world/FoliageInstancingEngine.js';
const engine = new NullEngine();
const scene = new Scene(engine);
const player = new TransformNode('player', scene);
player.position.set(-69, 0, 122);
player.computeWorldMatrix(true);
scene.metadata = { streamingPlayer: player };
const camera = new FreeCamera('camera', new Vector3(-69, 10, 100), scene);
const foliage = Object.create(FoliageInstancingEngine.prototype);
Object.assign(foliage, { scene, shadows: null, chunks: new Map(), dirtyChunks: new Set(),
  lastChunkUpdate: 0, prototypes: new Map() });
foliage.prototypes.set('oak', foliage._createFacetedPrototype('oak'));
foliage._queueChunkInstance('oak', { x: -71, y: 0, z: 121, scale: 1.9, rotY: 0 });
foliage.updateChunks();
const group = foliage.chunks.get('-1:1').groups.get('oak');
for (let i = 0; i < 20; i++) {
  camera.setTarget(new Vector3(i % 2 ? -69 : -71, 3, i % 2 ? 70 : 121));
  scene.render();
  for (const mesh of group.meshes) {
    assert.ok(scene.isActiveMesh(mesh), 'near tree parts must survive camera reversal');
    const bounds = mesh.getBoundingInfo().boundingBox;
    assert.ok(bounds.minimumWorld.x < -69 && bounds.maximumWorld.z > 120,
      'real prototype bounds must cover the reported tree placement');
  }
}
player.position.set(600, 0, 600); player.computeWorldMatrix(true);
foliage.lastChunkUpdate = -1000; foliage.updateChunks();
assert.ok(group.meshes.every(mesh => !mesh.alwaysSelectAsActiveMesh), 'far culling remains enabled');
assert.ok(group.proxy.isEnabled(), 'far silhouette replaces detail');
scene.dispose(); engine.dispose();
console.log('PASS: real oak geometry at -69,122, 20 camera reversals, bounded near culling');
