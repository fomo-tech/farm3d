import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { createFarmPlot } from '../src/game/farming/createFarmPlot.js';

const engine = new NullEngine();
const scene = new Scene(engine);
// NullEngine has no canvas; reuse the materials normally initialized by the world.
new StandardMaterial('mat-soil-base-rich', scene);
new StandardMaterial('mat-estate-meadow-grass', scene);
createFarmPlot(scene, { farmId: 'test-farm-lod', x: 200, z: 0, lightweight: true, isOwner: false });
const root = scene.getNodeByName('farm-estate-test-farm-lod');
assert.equal(root.metadata.lightweight, true);
assert.ok(root.getChildMeshes().some(mesh => mesh.name === 'lw-field-lod'));
assert.ok(root.getChildMeshes().some(mesh => mesh.name === 'lw-farmhouse-lod'));
assert.equal(scene.getMeshByName('lw-curbs-lod').thinInstanceGetWorldMatrices().length, 5);
assert.ok(root.getChildMeshes().length <= 8, 'distant plot should remain compact');
scene.dispose();
engine.dispose();
console.log('PASS: far farm HLOD stays visible with five batched curbs');
