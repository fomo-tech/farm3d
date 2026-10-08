import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { installWorldRenderIndex } from '../src/game/rendering/WorldRenderIndex.js';
const engine = new NullEngine();
const scene = new Scene(engine);
MeshBuilder.CreateBox('static-house', {}, scene);
const player = new TransformNode('local-player', scene);
const body = MeshBuilder.CreateBox('body', {}, scene);
body.parent = player;
const index = installWorldRenderIndex(scene);
await index.ready;
assert.ok(scene.selectionOctree.dynamicContent.includes(body));
const later = MeshBuilder.CreateBox('new-farm', {}, scene);
const foliage = MeshBuilder.CreateBox('expanding-forest-batch', {}, scene);
foliage.metadata = { spatialBoundsMutable: true };
await new Promise(resolve => setTimeout(resolve, 20));
assert.ok(!scene.selectionOctree.dynamicContent.includes(later));
assert.equal(index.getStats().indexedMeshes, 2);
assert.ok(scene.selectionOctree.dynamicContent.includes(foliage), 'expanding foliage cannot be hidden by stale static bounds');
index.dispose(); scene.dispose(); engine.dispose();
console.log('PASS: static spatial index, moving character and late mesh preservation');

// Livestock is created AFTER world indexing, then reparented into a streamed
// corral. Every species must remain dynamically culled at its current position.
const {OwnedHerd}=await import('../src/game/livestock/OwnedHerd.js');
const {createOpenAirCorral}=await import('../src/game/farming/createOpenAirCorral.js');
const {FarmChunk}=await import('../src/game/farming/FarmChunk.js');
const {StandardMaterial}=await import('@babylonjs/core/Materials/standardMaterial.js');
const {Vector3}=await import('@babylonjs/core/Maths/math.vector.js');
const e=new NullEngine(),s=new Scene(e);
new StandardMaterial('mat-soil-base-rich',s);new StandardMaterial('mat-estate-meadow-grass',s);
const renderIndex=installWorldRenderIndex(s);await renderIndex.ready;
const chunk=new FarmChunk(s,{id:'farm_000001',x:147,z:-70});
chunk.showDetail();
const corral=createOpenAirCorral(s,null,{x:151.8,z:-64.8},{farmId:'farm_000001',showDecorativeAnimal:false});
const herd=new OwnedHerd(s,corral.root);
const animals=['chicken','duck','pig','cow','sheep'].map((species,i)=>({id:`buy-${i}`,species,lifeVersion:1,createdAt:Date.now()}));
herd.sync(animals);chunk.setBuildings(null,corral);
await new Promise(resolve=>setTimeout(resolve,40));
for(const member of herd.members.values()){
 member.root.computeWorldMatrix(true);
 assert.ok(member.root.isEnabled(),`${member.species} streamed corral is enabled`);
 assert.ok(Vector3.Distance(member.root.getAbsolutePosition(),new Vector3(151.8,.16,-64.8))<3,`${member.species} is inside actual world corral`);
 for(const mesh of member.root.getChildMeshes())assert.ok(s.selectionOctree.dynamicContent.includes(mesh),`${member.species}/${mesh.name} remains renderable after spatial indexing`);
}
herd.sync([...animals,{id:'buy-late',species:'chicken',lifeVersion:1,createdAt:Date.now()}]);
await new Promise(resolve=>setTimeout(resolve,40));
assert.ok(herd.members.get('buy-late').root.getChildMeshes().every(mesh=>s.selectionOctree.dynamicContent.includes(mesh)),'New purchase appears after indexing');
renderIndex.dispose();herd.dispose();chunk.dispose();s.dispose();e.dispose();
console.log('PASS all five livestock species: real streamed corral, world position, active geometry and late purchase');
