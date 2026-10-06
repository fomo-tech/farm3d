import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { distantCitizen } from '../src/game/world/createOpenWorld.js';

const engine = new NullEngine();
const scene = new Scene(engine);
const before = scene.meshes.length;
const citizen = distantCitizen(scene, 112, -11, '#db835e');
citizen.animate(0.016);
assert.equal(scene.meshes.length - before, 7, 'Distant citizens should stay at seven meshes');
assert.equal(citizen.root.position.x, 112);
assert.equal(citizen.root.position.z, -11);
assert.equal(citizen.isPerformingAction(), true);
scene.dispose();
engine.dispose();
console.log('PASS: distant citizen stays lightweight and supports world update');
