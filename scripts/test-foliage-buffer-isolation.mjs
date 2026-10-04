import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { FoliageInstancingEngine } from '../src/game/world/FoliageInstancingEngine.js';
const engine = new NullEngine();
const scene = new Scene(engine);
const base = MeshBuilder.CreateBox('oak-source', {}, scene);
base.isVisible = false;
const foliage = Object.create(FoliageInstancingEngine.prototype);
Object.assign(foliage, { scene, shadows: null, prototypes: new Map([['oak', [base]]]),
  chunks: new Map(), dirtyChunks: new Set() });
function build(x, z) {
  foliage._queueChunkInstance('oak', { x, y: 0, z, scale: 1, rotY: 0 });
  const chunk = [...foliage.chunks.values()].at(-1);
  chunk.detailed = true;
  const group = chunk.groups.get('oak');
  foliage._buildGroup(chunk, 'oak', group);
  return group.meshes[0];
}
const near = build(-71, 121);
const original = Array.from(near.getVertexBuffer('world0').getData());
const far = build(600, 600);
assert.ok(near.geometry !== far.geometry, 'separate chunks must not share writable GPU geometry');
assert.deepEqual(Array.from(near.getVertexBuffer('world0').getData()), original,
  'building another chunk must not overwrite the first chunk GPU matrices');
far.dispose(false, false);
assert.deepEqual(Array.from(near.getVertexBuffer('world0').getData()), original,
  'evicting another chunk must not dispose the near GPU buffer');
assert.ok(!base.getVertexBuffer('world0'), 'prototype must not acquire a chunk matrix buffer');
scene.dispose(); engine.dispose();
console.log('PASS: foliage GPU vertex buffer isolation across build and eviction');
