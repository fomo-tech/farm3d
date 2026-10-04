import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { FoliageInstancingEngine } from '../src/game/world/FoliageInstancingEngine.js';
import { LANDSCAPE_ART, landscapeVariation } from '../src/game/world/LandscapeArt.js';
import { lakeEdge, createRomanticLake } from '../src/game/world/landmarks/createRomanticLake.js';
import { villageWoodlandPlacements } from '../src/game/world/createVillageWoodlands.js';
import { isPointOnRoadCorridor } from '../src/game/world/RoadSafetyZone.js';
import { isPointInsideAnyFarmLot } from '../src/game/world/FarmSafetyZone.js';

const engine = new NullEngine();
const woodlands = villageWoodlandPlacements();
assert.ok(woodlands.length > 100 && woodlands.length <= 12 * 2 * 16 * 3);
assert.deepEqual(woodlands, villageWoodlandPlacements());
for (const tree of woodlands) {
  assert.equal(isPointOnRoadCorridor(tree.x, tree.z, 5), false);
  assert.equal(isPointInsideAnyFarmLot(tree.x, tree.z, 5), false);
}
const scene = new Scene(engine);
scene.activeCamera = { target: new Vector3(0, 0, 0) };
const foliage = new FoliageInstancingEngine(scene);
// A request for a not-yet-built species must not disappear during sliced boot.
foliage.spawnTree('birch', 2000, 2000);
assert.equal(foliage.pendingQueue.get('birch').length, 1);
await foliage.whenReadyAsync();
assert.ok([...foliage.chunks.values()].some(chunk => chunk.groups.get('birch')?.requests.length === 1));
assert.equal(foliage.prototypes.size, 8);
for (const [type, prototypes] of foliage.prototypes) {
  assert.ok(prototypes.length >= (type === 'bush' ? 1 : 2));
  for (const mesh of prototypes) {
    assert.ok(mesh.getTotalVertices() > 0);
    assert.equal(mesh.isPickable, false);
    assert.equal(mesh.material.emissiveColor.r, 0);
  }
}
const proxy = foliage._createLODProxy({ x: 0, z: 0 }, 'oak');
assert.equal(proxy.material.subMaterials.length, 2, 'LOD keeps distinct bark and crown');
assert.notDeepEqual(proxy.material.subMaterials[0].diffuseColor, proxy.material.subMaterials[1].diffuseColor);
assert.equal(landscapeVariation(123, -53), landscapeVariation(123, -53));
assert.notEqual(landscapeVariation(123, -53), landscapeVariation(124, -53));
for (const color of Object.values(LANDSCAPE_ART)) assert.match(color, /^#[0-9A-F]{6}$/);
const lake = createRomanticLake(scene);
assert.ok(scene.getMeshByName('crystal-lake'));
for (let i = 0; i < 96; i++) {
  const edge = lakeEdge(i * Math.PI / 48);
  assert.ok(Number.isFinite(edge.x) && Number.isFinite(edge.z));
}
scene.activeCamera = null;
scene.dispose(); engine.dispose();
console.log('PASS: eight faceted tree prototypes, two-color LOD, stable variation and natural lake geometry');
