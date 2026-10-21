import assert from 'node:assert/strict';
import {createCityTrafficFleet,stepCityTrafficFleet,fleetVehiclePose,citySignalPhase} from '../shared/cityTrafficFleet.js';
import {createCityCollision} from '../server/CityWorldPolicy.js';
const collision=createCityCollision(),fleet=createCityTrafficFleet();
for(let tick=0;tick<12000;tick++){
 const previous=fleet.map(fleetVehiclePose);stepCityTrafficFleet(fleet,tick*50,.05);
 const poses=fleet.map(fleetVehiclePose);
 for(let i=0;i<poses.length;i++){
  const p=poses[i];assert.equal(collision.isColliding(p.x,p.z,.9),false,'Fleet enters building');
  assert.ok(Math.hypot(p.x-previous[i].x,p.z-previous[i].z)<=.301,'Fleet teleports');
  for(let j=i+1;j<poses.length;j++)assert.ok(Math.hypot(p.x-poses[j].x,p.z-poses[j].z)>3.5,'Fleet rear-end collision');
 }
}
for(let time=0;time<64000;time+=100){const s=citySignalPhase(time);assert.ok(!(s.eastWest==='green'&&s.northSouth==='green'),'Conflicting green phases');}
// A car approaching a player must stop at a safe following distance.
const blocked=createCityTrafficFleet();blocked[0].distance=20;const obstacle={x:77,z:-43};
for(let tick=0;tick<100;tick++)stepCityTrafficFleet(blocked,0,.05,[obstacle]);
const stopped=fleetVehiclePose(blocked[0]);assert.ok(stopped.x<=72.001);assert.ok(stopped.speed<.01);
// At time zero north/south is red: westbound car must wait short of the turn south.
const red=createCityTrafficFleet();red[0].distance=76;
for(let tick=0;tick<100;tick++)stepCityTrafficFleet(red,0,.05);
assert.ok(fleetVehiclePose(red[0]).x<=126.001);
console.log('PASS server traffic fleet: ten-minute simulation, building clearance, following gaps, red lights, player obstacle braking, finite continuous motion');
