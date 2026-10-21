import assert from 'node:assert/strict';
import {stepCityDriving} from '../src/game/player/cityDriving.js';
import {canExitCityVehicle} from '../shared/cityVehicleInteraction.js';
import {createCityCollision} from '../server/CityWorldPolicy.js';
import {MovementAuthority} from '../server/MovementAuthority.js';
for(const fps of [30,60,120]){
 const dt=1/fps,c=createCityCollision(),authority=new MovementAuthority({cityMode:true});
 c.playerRadius=1.7;
 const p={x:147.5,z:0,y:.08,vehicle:'convertible',venue:null};let speed=0,yaw=Math.PI/2,now=100000;
 authority.reset(p,now);
 function frame(throttle,steering,brake){
  const motion=stepCityDriving(speed,yaw,throttle,steering,brake,dt);speed=motion.speed;yaw=motion.yaw;
  const next=c.resolveMovement(p.x,p.z,Math.sin(yaw)*speed*dt,Math.cos(yaw)*speed*dt);
  assert.ok(Math.abs(next.x-p.x-Math.sin(yaw)*speed*dt)<1e-5,'Unexpected blockage');
  now+=dt*1000;const target={x:next.x,z:next.z,y:.08};assert.equal(authority.accepts(p,target,now),true);Object.assign(p,target);
 }
 for(let i=0;i<fps*4;i++)frame(1,0,false);
 assert.ok(p.x>195,'Actual throttle must carry car across bridge');assert.equal(canExitCityVehicle(speed),false);
 for(let i=0;i<fps;i++)frame(0,0,true);
 assert.equal(speed,0);assert.equal(canExitCityVehicle(speed),true);
 const stopped=p.x;for(let i=0;i<fps;i++)frame(-1,0,false);
 assert.ok(p.x<stopped,'Reverse must move backwards');
 const turn=stepCityDriving(8,0,1,1,false,dt);assert.ok(turn.yaw>0);
 assert.equal(stepCityDriving(0,0,0,1,false,dt).yaw,0,'No rotation at standstill');
 console.log(`PASS real driving controller ${fps}FPS: throttle + collision + server bridge crossing, braking, reverse, steering, exit-speed guard`);
}
for(const invalid of [NaN,Infinity,undefined])assert.equal(canExitCityVehicle(invalid),false);
