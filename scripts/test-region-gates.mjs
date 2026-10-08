import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {createVillageGate} from '../src/game/world/landmarks/createVillageGate.js';
import {createRegionGate} from '../src/game/world/landmarks/createRegionGate.js';
globalThis.OffscreenCanvas=class {constructor(w,h){this.width=w;this.height=h;}getContext(){return new Proxy({measureText:v=>({width:v.length*35})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});}};
const engine=new NullEngine();const scene=new Scene(engine);
for(const halfSpan of [6.4,9.2]){
 const gate=createRegionGate(scene,{position:{x:0,z:0},label:'Hồ Pha Lê',halfSpan});
 assert.ok(gate.root.metadata.clearance>5);
 for(const mesh of gate.root.getChildMeshes()){
  mesh.computeWorldMatrix(true);const b=mesh.getBoundingInfo().boundingBox;
  if(b.minimumWorld.y<5 && mesh.name.includes('shrub')) assert.ok(Math.abs(mesh.position.x)>halfSpan);
  for(const v of mesh.getVerticesData('position')||[])assert.ok(Number.isFinite(v));
 }
 const frame=gate.root.getChildMeshes().find(x=>x.name.endsWith('beam'));const sign=gate.root.getChildMeshes().find(x=>x.name.endsWith('name--1'));
 assert.ok(frame.getBoundingInfo().boundingBox.minimumWorld.y>=sign.getBoundingInfo().boundingBox.maximumWorld.y,'beam must not cover lettering');
 gate.updateName('Làng Hướng Dương');gate.dispose();
 assert.equal(scene.meshes.length,0);assert.equal(scene.materials.filter(m=>m.name!=='default material').length,0);
}
const village=createVillageGate(scene,{x:60,z:86},'Làng Bình Minh',null,'binh-minh');assert.equal(village.root.position.z,93.5);village.dispose();engine.dispose();
console.log('PASS: gate clearance, sign visibility, finite geometry, village road setback and disposal');
