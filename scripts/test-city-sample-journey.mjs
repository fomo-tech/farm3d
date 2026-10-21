import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {createVibeCityMap} from '../src/game/world/createVibeCityMap.js';
import {WorldCollisionSystem} from '../src/game/physics/WorldCollisionSystem.js';
import {MovementAuthority} from '../server/MovementAuthority.js';
import {applyCityAction} from '../shared/cityGameplay.js';
import {vehicleCollisionRadius} from '../shared/vehicleCollision.js';
const engine=new NullEngine(),scene=new Scene(engine);
try{
 const city=createVibeCityMap(scene),collision=new WorldCollisionSystem({cityMode:true});
 for(const b of city.collisionBoxes)collision.addBox(b.id,b.minX,b.maxX,b.minZ,b.maxZ);
 assert.equal(scene.meshes.filter(m=>m.name.startsWith('sample-sign-')).length,8,'All authored storefronts exist');
 assert.equal(scene.getMeshByName('city-civic-plaza'),null,'No full square covering central roads');
 for(const mesh of scene.meshes.filter(m=>m.name.startsWith('city-civic-plaza-'))){
  mesh.computeWorldMatrix(true);const b=mesh.getBoundingInfo().boundingBox;
  assert.ok(b.minimumWorld.x>=8||b.maximumWorld.x<=-8);
  assert.ok(b.minimumWorld.z>=8||b.maximumWorld.z<=-8);
 }
 for(const fps of [30,60,120]){
  const p={x:1.9,z:13,y:.08,vehicle:'walk',venue:null,coins:180,xp:0,ownedVehicles:['walk']};
  const authority=new MovementAuthority({cityMode:true});let now=100000;authority.reset(p,now);
  const context=()=>({worldMode:'city',x:p.x,z:p.z});
  applyCityAction(p,'city_enter',{},context(),now);
  function travel(x,z){
   collision.playerRadius=vehicleCollisionRadius(p.vehicle);
   for(let count=0;Math.hypot(x-p.x,z-p.z)>1e-6;count++){
    assert.ok(count<20000,'Journey cannot finish');
    const distance=Math.hypot(x-p.x,z-p.z),step=Math.min(distance,(p.vehicle==='walk'?5:12)/fps);
    const next=collision.resolveMovement(p.x,p.z,(x-p.x)/distance*step,(z-p.z)/distance*step);
    assert.ok(Math.hypot(next.x-p.x,next.z-p.z)>step*.99,`Blocked ${p.vehicle} at ${p.x},${p.z}`);
    now+=1000/fps;const target={x:next.x,z:next.z,y:.08};
    assert.equal(authority.accepts(p,target,now),true,`Server rejection at ${p.x},${p.z}`);Object.assign(p,target);
   }
  }
  travel(20,13);applyCityAction(p,'city_vehicle',{},context(),now);assert.equal(p.vehicle,'convertible');
  // Leave garage, cross four intersections and the user's problem bridge, return.
  for(const [x,z] of [[20,0],[147.5,0],[200,0],[200,45],[45,45],[45,0],[20,0],[20,13]])travel(x,z);
  applyCityAction(p,'city_vehicle',{},context(),now);assert.equal(p.vehicle,'walk');
  const saved=JSON.parse(JSON.stringify(p));assert.deepEqual(saved.city.carPosition,{x:p.x,z:p.z});
  travel(16,13);
  console.log(`PASS sample journey ${fps}FPS: initialize, walk to garage, enter, drive intersections/bridge, exit, persisted car, walk away`);
 }
 city.cityMasterplan.dispose();
}finally{scene.dispose();engine.dispose();}
