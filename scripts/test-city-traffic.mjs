import assert from 'node:assert/strict';
import {trafficPose,CITY_TRAFFIC_OFFSETS,advanceCityWanted,cityPatrolCanSee} from '../shared/cityTraffic.js';
import {createCityCollision} from '../server/CityWorldPolicy.js';
const collision=createCityCollision();
assert.equal(cityPatrolCanSee({x:0,z:0},{x:10,z:0},()=>false),true);
assert.equal(cityPatrolCanSee({x:0,z:0},{x:10,z:0},x=>x>4&&x<6),false,'Buildings block police sight');
assert.equal(cityPatrolCanSee({x:0,z:0},{x:50,z:0},()=>false),false);
for(const offset of CITY_TRAFFIC_OFFSETS)for(let t=0;t<90000;t+=50){
 const p=trafficPose(t,offset);assert.ok([p.x,p.z,p.yaw].every(Number.isFinite));
 assert.equal(collision.isColliding(p.x,p.z,.9),false,`Traffic inside obstacle at ${p.x},${p.z}`);
 const next=trafficPose(t+50,offset);assert.ok(Math.hypot(next.x-p.x,next.z-p.z)<=.301,'Traffic teleport');
}
let s=advanceCityWanted(null,{now:10000,x:500,z:500,vehicle:'walk',speed:4,hit:true});assert.equal(s.stars,0);
s=advanceCityWanted(s,{now:11000,x:500,z:500,vehicle:'convertible',speed:8,hit:true});assert.equal(s.stars,1);assert.equal(s.phase,'pursuit');
s=advanceCityWanted(s,{now:11500,x:500,z:500,vehicle:'convertible',speed:8,hit:true});assert.equal(s.stars,1,'One incident must not spam stars');
s=advanceCityWanted(s,{now:20000,x:500,z:500,vehicle:'walk',speed:0});assert.equal(s.phase,'search');
const patrol=trafficPose(21000,42);s=advanceCityWanted(s,{now:21000,...patrol,vehicle:'walk',speed:0});assert.equal(s.phase,'pursuit');
s=advanceCityWanted(s,{now:47000,x:500,z:500,vehicle:'walk',speed:0});assert.equal(s.stars,0);assert.equal(s.phase,'clear');
for(let i=0;i<6;i++)s=advanceCityWanted(s,{now:60000+i*6000,x:500,z:500,vehicle:'convertible',speed:8,hit:true});assert.equal(s.stars,3);
console.log('PASS traffic: circuit clearance, continuous motion, junction stops, server wanted debounce, cap, search/reacquire/escape');
