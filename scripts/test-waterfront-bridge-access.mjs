import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {createVibeCityMap} from '../src/game/world/createVibeCityMap.js';
import {WorldCollisionSystem} from '../src/game/physics/WorldCollisionSystem.js';
import {createCityCollision} from '../server/CityWorldPolicy.js';
import {MovementAuthority} from '../server/MovementAuthority.js';
import {vehicleCollisionRadius} from '../shared/vehicleCollision.js';
const engine=new NullEngine(),scene=new Scene(engine);
try{
 const city=createVibeCityMap(scene),client=new WorldCollisionSystem({cityMode:true});
 for(const b of city.collisionBoxes)client.addBox(b.id,b.minX,b.maxX,b.minZ,b.maxZ);
 const deck=scene.getMeshByName('city-bridge-waterfront-deck');deck.computeWorldMatrix(true);
 const bounds=deck.getBoundingInfo().boundingBox;
 assert.ok(Math.abs(bounds.maximumWorld.y-.08)<1e-6,'Bridge must meet road height without step');
 assert.ok(bounds.minimumWorld.x<=140&&bounds.maximumWorld.x>=198,'Bridge must reach both banks');
 for(const name of ['city-waterfront-quay-north','city-waterfront-quay-south']){
  const mesh=scene.getMeshByName(name);mesh.computeWorldMatrix(true);const b=mesh.getBoundingInfo().boundingBox;
  assert.ok(b.maximumWorld.z<=39.001||b.minimumWorld.z>=50.999,'Raised quay must leave bridge approach clear');
 }
 const central=scene.getMeshByName('city-bridge-waterfront-central-deck');central.computeWorldMatrix(true);
 assert.ok(Math.abs(central.getBoundingInfo().boundingBox.maximumWorld.y-.08)<1e-6);
 for(const collision of [client,createCityCollision()])for(const vehicle of ['walk','convertible'])for(const z of [-5,-2,0,2,5,43.8,45,46.2])for(const direction of [-1,1]){
  collision.playerRadius=vehicleCollisionRadius(vehicle);
  let x=direction>0?138:200;
  for(let i=0;i<248;i++){
   const next=collision.resolveMovement(x,z,direction*.25,0);
   assert.ok(Math.abs(next.x-x-direction*.25)<1e-6&&Math.abs(next.z-z)<1e-6,`${vehicle} blocked at ${x},${z}`);x=next.x;
  }
 }
 for(const vehicle of ['walk','convertible'])for(const direction of [-1,1])for(const z of [0,45]){
  const authority=new MovementAuthority({cityMode:true}),player={x:direction>0?138:200,z,y:.08,vehicle,venue:null};let now=10000;authority.reset(player,now);
  for(let i=0;i<124;i++){now+=100;const target={x:player.x+direction*.5,z,y:.08};assert.equal(authority.accepts(player,target,now),true,`Server rejected ${vehicle} crossing at ${player.x},${z}`);Object.assign(player,target);}
 }
 assert.equal(client.isColliding(169,30,.45),true,'Water outside bridge must remain blocked');
 // Reproduce the user's exact debug position, not a nearby approach point.
 for(const vehicle of ['walk','convertible'])for(const fps of [30,60,120]){
  const authority=new MovementAuthority({cityMode:true});
  const player={x:147.5,z:0,y:.08,vehicle,venue:null};
  client.playerRadius=vehicleCollisionRadius(vehicle);
  assert.equal(client.isColliding(player.x,player.z,client.playerRadius),false,`${vehicle} starts inside obstacle`);
  let now=100000;authority.reset(player,now);
  const speed=vehicle==='walk'?7:18,dt=1/fps;
  for(const destination of [200,147.5]){
   const direction=Math.sign(destination-player.x);let steps=0;
   while(Math.abs(destination-player.x)>1e-7){
    assert.ok(++steps<3000,'Crossing did not finish');
    const dx=direction*Math.min(speed*dt,Math.abs(destination-player.x));
    const next=client.resolveMovement(player.x,player.z,dx,0);
    assert.equal(next.collided,false,`${vehicle}/${fps}FPS collision at ${player.x},${player.z}`);
    assert.ok(Math.abs(next.x-player.x-dx)<1e-6&&Math.abs(next.z)<1e-6,'Movement blocked or diverted');
    now+=dt*1000;
    const target={x:next.x,z:next.z,y:.08};
    assert.equal(authority.accepts(player,target,now),true,`${vehicle}/${fps}FPS server rejected exact-position crossing`);
    Object.assign(player,target);
   }
  }
  console.log(`PASS exact X=147.5 Z=0: ${vehicle}, ${fps} FPS, to X=200 and back, zero client blocks/server rejections`);
 }
 console.log('PASS waterfront bridge: flush deck, clear quay, both lanes/directions, walk/car swept movement and server authority');
 city.cityMasterplan.dispose();
}finally{scene.dispose();engine.dispose();}
