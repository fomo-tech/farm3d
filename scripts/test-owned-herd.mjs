import { FARM_CONFIG } from '../shared/farmConfig.js';
import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { OwnedHerd } from '../src/game/livestock/OwnedHerd.js';
const engine=new NullEngine(); const scene=new Scene(engine); const parent=new TransformNode('pen',scene);
const herd=new OwnedHerd(scene,parent);
const animals=['chicken','duck','pig','cow','sheep'].map((species,id)=>({species,id:String(id)}));
herd.sync(animals); assert.equal(herd.members.size,5); assert.equal(herd.pens.size,5);
// Erroneous saved footprints must be ignored: animals remain in the existing corral.
herd.sync(animals,{}, {'pen:chicken':{tiles:['0:0','1:0']},workshop:{tiles:['2:0','3:0']}},'farm_000001');
const [x,z]=FARM_CONFIG.livestockVisuals.slots.chicken;
assert.equal(herd.pens.get('chicken').position.x,x);assert.equal(herd.pens.get('chicken').position.z,z);
assert.equal(herd.workshop,undefined);
const count=scene.meshes.length; herd.sync(animals); assert.equal(scene.meshes.length,count);
parent.setEnabled(false); scene.onBeforeRenderObservable.notifyObservers(scene); assert.equal(herd.time,0);
parent.setEnabled(true); scene.onBeforeRenderObservable.notifyObservers(scene);
herd.sync(animals.slice(0,3)); assert.equal(herd.members.size,3);
herd.dispose(); assert.equal(scene.meshes.length,0); scene.dispose(); engine.dispose();
console.log('PASS owned herd: five species, stable sync, streamed visibility, removal/disposal');

// Geometry and animation contract for all five live game models.
const meshEngine=new NullEngine(),meshScene=new Scene(meshEngine),meshParent=new TransformNode('geometry-pen',meshScene);
meshParent.metadata={farmId:'my-farm'};
const meshHerd=new OwnedHerd(meshScene,meshParent);meshHerd.sync(animals);
for(const member of meshHerd.members.values()){
 assert.equal(member.root.metadata.meshVersion,2);
 assert.equal(member.legs.length,member.isBird?2:4);
 let vertices=0;
 for(const mesh of member.root.getChildMeshes()){
  const positions=mesh.getVerticesData('position');assert.ok(positions.every(Number.isFinite));vertices+=mesh.getTotalVertices();
  assert.equal(mesh.isPickable,true,'animal mesh opens the livestock interaction');
  assert.equal(mesh.metadata.type,'livestock-interact');
  assert.equal(mesh.metadata.species,member.species);
  assert.equal(mesh.metadata.farmId,'my-farm');
 }
 assert.ok(vertices<24000,`${member.species} vertex budget: ${vertices}`);
 const feet=member.root.getChildMeshes().filter(m=>/hoof|webbed-foot|toe/.test(m.name));
 assert.ok(feet.length>=2,`${member.species} has recognizable feet`);
}
const cowMember=Array.from(meshHerd.members.values()).find(m=>m.species==='cow');
const patches=cowMember.root.getChildMeshes().filter(m=>/flank-spot|back-spot/.test(m.name));
assert.equal(patches.length,3);assert.ok(patches.every(m=>m.getTotalVertices()>60),'cow patches follow body with radial surface tessellation');
meshScene.onBeforeRenderObservable.notifyObservers(meshScene);
meshHerd.sync(animals.map(a=>({...a,productReadyAt:1})));
meshScene.onBeforeRenderObservable.notifyObservers(meshScene);
assert.ok([...meshHerd.members.values()].every(m=>m.readyMarker.isEnabled()),'ready product appears above animal');
const stableCount=meshScene.meshes.length;meshHerd.sync(animals);assert.equal(meshScene.meshes.length,stableCount);
meshHerd.dispose();assert.equal(meshScene.meshes.length,0);meshScene.dispose();meshEngine.dispose();
console.log('PASS livestock v2: grounded foot shapes, articulated legs, finite geometry, surface spots, vertex budget and cleanup');

// A server-confirmed purchase creates the baby mesh immediately, before the
// area profile refresh; subsequent accounts updates reuse the same root.
const lifeEngine=new NullEngine(),lifeScene=new Scene(lifeEngine),lifeParent=new TransformNode('life-pen',lifeScene);
const lifeHerd=new OwnedHerd(lifeScene,lifeParent),born=Date.now();
const baby={id:'bought-now',species:'chicken',createdAt:born,lifeVersion:1,fedAt:0,productReadyAt:0};
lifeHerd.sync([baby],{chicken:true});
const babyRoot=lifeHerd.members.get(baby.id).root;
assert.ok(babyRoot.isEnabled());assert.equal(babyRoot.scaling.x,.62*.55);
lifeHerd.sync([{...baby,matureAt:born-1}],{chicken:true});
lifeScene.onBeforeRenderObservable.notifyObservers(lifeScene);
assert.equal(lifeHerd.members.get(baby.id).root,babyRoot);assert.equal(babyRoot.scaling.x,.62);
lifeHerd.dispose();lifeScene.dispose();lifeEngine.dispose();
console.log('PASS confirmed purchase visible immediately; baby-to-adult scale updates without mesh recreation');
