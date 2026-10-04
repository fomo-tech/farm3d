import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { FARM_CONFIG } from '../shared/farmConfig.js';
import { createCropMesh } from '../src/game/farming/createCropMesh.js';
import { OwnedHerd } from '../src/game/livestock/OwnedHerd.js';

const engine = new NullEngine();
const scene = new Scene(engine);

for (const cropId of Object.keys(FARM_CONFIG.crops)) {
  for (const [index, progress] of [0.05, 0.25, 0.75, 1].entries()) {
    const crop = createCropMesh(scene, cropId, progress, `${cropId}-${index}`);
    assert.ok(crop.root, `${cropId} must create a root node`);
    assert.ok(crop.root.getChildMeshes().length > 0, `${cropId} must create renderable meshes`);
    crop.root.dispose();
  }
}

const parent = new TransformNode('visual-test-pen', scene);
const herd = new OwnedHerd(scene, parent);
const animals = Object.keys(FARM_CONFIG.animals).map((species, index) => ({ id: String(index), species }));
herd.sync(animals);
assert.equal(herd.members.size, animals.length, 'every configured animal needs a visual representation');
scene.onBeforeRenderObservable.notifyObservers(scene);
herd.dispose();
parent.dispose();
scene.dispose();
engine.dispose();

console.log(`PASS farm visuals: ${Object.keys(FARM_CONFIG.crops).length} crop types × 4 stages and ${animals.length} livestock meshes`);
