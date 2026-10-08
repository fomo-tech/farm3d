import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { createAvatarHair } from '../src/game/player/createAvatarHair.js';
import { HAIR_STYLES } from '../shared/fashionConfig.js';
const engine = new NullEngine();
const scene = new Scene(engine);
const head = new TransformNode('head', scene);
const rig = createAvatarHair(scene, 'test', head, { hair: new StandardMaterial('hair', scene), tieRed: new StandardMaterial('ties', scene) });
const stats = [];
for (const gender of ['male', 'female']) for (const { id } of HAIR_STYLES) {
  let previous = Infinity;
  for (let lod = 0; lod < 3; lod++) {
    rig.setStyle(id, gender, lod);
    const meshes = rig.root.getChildMeshes().filter(m => m.isEnabled());
    assert.ok(meshes.length > 0 && meshes.length <= 3, `${id}: merged draw calls`);
    const crownNormals = meshes.find(mesh => mesh.name.includes('-body-')).getVerticesData('normal');
    assert.ok(crownNormals[1] > 0, 'Crown faces outward rather than disappearing under backface culling');
    const triangles = meshes.reduce((sum, m) => sum + m.getTotalIndices() / 3, 0);
    assert.ok(triangles < previous, `${id}: LOD reduces triangles`);
    previous = triangles;
    for (const mesh of meshes) {
      for (const kind of ['position', 'normal']) assert.ok(mesh.getVerticesData(kind).every(Number.isFinite), `${id}: finite ${kind}`);
      assert.ok(mesh.getIndices().every(i => i < mesh.getTotalVertices() && i >= 0));
    }
    const positions = meshes.flatMap(m => Array.from(m.getVerticesData('position')));
    if (['hair_chic_bob','hair_celestial_flow','hair_twintails'].includes(id)) assert.ok(Math.min(...positions.filter((_, i) => i % 3 === 1)) < .2, `${id}: length survives LOD`);
    if (gender === 'male') stats.push({ id, lod, triangles, draws: meshes.length });
    assert.ok(scene.meshes.length <= 3, 'Switching styles disposes old geometry');
  }
}
rig.setStyle('unknown', 'female', 0);
assert.equal(rig.root.metadata.style, 'bob');
rig.setStyle('hair_ponytail', 'male', 0);
assert.ok(rig.ponytail.isEnabled() && rig.ponytail.getChildMeshes().length > 0);
rig.setStyle('hair_high_ponytail', 'female', 2);
assert.equal(rig.root.metadata.style, 'high_ponytail');
assert.ok(rig.ponytail.isEnabled() && rig.ponytail.position.y > .7);
rig.setStyle('hair_buzzcut', 'male', 0);
assert.equal(rig.root.metadata.style, 'buzzcut');
const buzz = rig.root.getChildMeshes().find(mesh => mesh.name.includes('-body-'));
const buzzPositions = buzz.getVerticesData('position');
assert.ok(Math.max(...buzzPositions.filter((_, i) => i % 3 === 1)) < .87, 'Buzzcut stays close to the skull');
assert.ok(!rig.ponytail.isEnabled());
console.table(stats);
scene.dispose(); engine.dispose();
console.log('PASS: all catalog styles, both genders, LOD silhouettes, bounded geometry and ponytail rig');
