import assert from 'node:assert/strict';
import {createCityTrafficFleet,stepCityTrafficFleet,fleetVehiclePose,projectCityPatrolTarget} from '../shared/cityTrafficFleet.js';
import {advanceCityWanted} from '../shared/cityTraffic.js';
import {createCityCollision} from '../server/CityWorldPolicy.js';
assert.equal(projectCityPatrolTarget({x:NaN,z:1}),null);
const projection=projectCityPatrolTarget({x:100,z:-43});assert.equal(projection.error,0);
const collision=createCityCollision();
// Isolate the patrol so red lights or other cars cannot hide its chase behaviour.
const car={...createCityTrafficFleet()[3],distance:10};const fleet=[car];
const target={x:110,z:-43};const initial=Math.hypot(fleetVehiclePose(car).x-target.x,fleetVehiclePose(car).z-target.z);
for(let i=0;i<160;i++){
 const prev=fleetVehiclePose(car);stepCityTrafficFleet(fleet,i*50,.05,[],{target,phase:'pursuit'});const pose=fleetVehiclePose(car);
 assert.equal(collision.isColliding(pose.x,pose.z,.9),false);
 assert.ok(Math.hypot(pose.x-prev.x,pose.z-prev.z)<=.551,'Patrol teleports');
}
const arrived=fleetVehiclePose(car);assert.ok(Math.hypot(arrived.x-target.x,arrived.z-target.z)<initial/2);assert.equal(arrived.mode,'pursuit');assert.equal(arrived.siren,true);
assert.ok(arrived.x<=target.x-3.99,'Patrol must not drive through its stopping target');
stepCityTrafficFleet(fleet,9000,.05,[],{target,phase:'search'});assert.equal(fleetVehiclePose(car).mode,'search');assert.equal(fleetVehiclePose(car).siren,false);
stepCityTrafficFleet(fleet,10000,.05);assert.equal(fleetVehiclePose(car).mode,'patrol');
let wanted=advanceCityWanted(null,{now:1000,x:100,z:-43,vehicle:'convertible',speed:6,hit:true,visible:false});
assert.deepEqual(wanted.lastKnown,{x:100,z:-43});
wanted=advanceCityWanted(wanted,{now:10000,x:900,z:900,vehicle:'walk',speed:0,visible:false});
assert.equal(wanted.phase,'search');assert.deepEqual(wanted.lastKnown,{x:100,z:-43},'Unseen player must not update chase target');
wanted=advanceCityWanted(wanted,{now:27000,x:900,z:900,vehicle:'walk',speed:0,visible:false});assert.equal(wanted.stars,0);
// Ten minutes of pursuit around the circuit must stay clear of static geometry.
const full=createCityTrafficFleet();
for(let i=0;i<12000;i++){
 stepCityTrafficFleet(full,i*50,.05,[],{target:{x:128,z:25},phase:i%800<400?'pursuit':'search'});
 for(const vehicle of full){const p=fleetVehiclePose(vehicle);assert.equal(collision.isColliding(p.x,p.z,.9),false);}
}
console.log('PASS police: road-projected pursuit, safe stopping, no teleport/building cuts, siren states, last-known-only search, escape and return to patrol');
