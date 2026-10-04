import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { VenueVisibility } from '../src/game/rendering/VenueVisibility.js';
const engine = new NullEngine(), scene = new Scene(engine);
const root = new TransformNode('outdoor', scene), player = new TransformNode('player', scene);
const visible = MeshBuilder.CreateBox('visible', {}, scene); visible.parent = root;
const lod = MeshBuilder.CreateBox('hidden-lod', {}, scene); lod.parent = root; lod.setEnabled(false);
const body = MeshBuilder.CreateBox('body', {}, scene); body.parent = player;
const room = MeshBuilder.CreateBox('room', {}, scene); room.metadata = { interiorVenue: 'fashion' };
let toggles = 0; const original = root.setEnabled.bind(root); root.setEnabled = value => { toggles++; original(value); };
const manager = new VenueVisibility(scene, () => [player]);
manager.hide();
assert.equal(toggles, 0); assert.equal(visible.isVisible, false); assert.equal(body.isVisible, true); assert.equal(room.isVisible, true);
manager.show();
assert.equal(visible.isVisible, true); assert.equal(lod.isEnabled(), false, 'LOD remains hidden after exiting');
manager.hide(); manager.show(); assert.equal(toggles, 0);
const previouslyInvisible = MeshBuilder.CreateBox('invisible', {}, scene);
previouslyInvisible.isVisible = false;
manager.hide(); manager.hide(); manager.show();
assert.equal(previouslyInvisible.isVisible, false, 'Original visibility is restored after repeated hide');
// Representative large hierarchy: transitions must not invoke propagation.
for (let i = 0; i < 15000; i++) {
  const mesh = new Mesh(`outdoor-${i}`,scene);
  mesh.parent = root;
  mesh.isVisible = i % 3 !== 0;
}
const before = performance.now();
manager.hide(); manager.show();
console.log(`15000-leaf transition: ${(performance.now() - before).toFixed(1)}ms`);
assert.equal(toggles, 0);
engine.dispose(); console.log('PASS: zero enabled propagation, protected players/interiors, restored visibility and preserved LOD.');
