import assert from 'node:assert/strict';
import {applyCityAction,CITY_GARAGE,CITY_CONTRACTS,cityContractObjective} from '../shared/cityGameplay.js';
import {createCityCollision} from '../server/CityWorldPolicy.js';
const job=CITY_CONTRACTS.find(j=>j.id==='waterfront-run');
const setup=()=>{const p={coins:180,xp:0,vehicle:'walk',ownedVehicles:['walk']};const c={worldMode:'city',...CITY_GARAGE};applyCityAction(p,'city_enter',{},c,1000);applyCityAction(p,'city_vehicle',{},c,1000);applyCityAction(p,'city_contract_start',{id:job.id},c,1000);return p;};
const action=(p,name,point,time,payload={})=>applyCityAction(p,name,payload,{worldMode:'city',...point},time);
let p=setup();
assert.throws(()=>action(p,'city_contract_finish',job.target,100000),/checkpoint/);
assert.throws(()=>action(p,'city_contract_checkpoint',job.checkpoints[1],10000,{index:1}),/Checkpoint/);
assert.throws(()=>action(p,'city_contract_checkpoint',{x:999,z:999},10000,{index:0}));
assert.throws(()=>action(p,'city_contract_checkpoint',job.checkpoints[0],1001,{index:0}),/nhanh/);
for(let i=0;i<job.checkpoints.length;i++){
 assert.equal(cityContractObjective(p.city.contract).checkpoint,true);
 action(p,'city_contract_checkpoint',job.checkpoints[i],10000+i*20000,{index:i});
 assert.throws(()=>action(p,'city_contract_checkpoint',job.checkpoints[i],11000+i*20000,{index:i}));
 p=JSON.parse(JSON.stringify(p));assert.equal(p.city.contract.checkpoint,i+1,'Reload preserves checkpoint');
}
assert.equal(cityContractObjective(p.city.contract).checkpoint,false);
p.vehicle='walk';assert.throws(()=>action(p,'city_contract_finish',job.target,80000));p.vehicle='convertible';
action(p,'city_contract_finish',job.target,80000);assert.equal(p.coins,360);assert.equal(p.xp,25);assert.equal(p.city.lastResult.status,'success');
assert.throws(()=>action(p,'city_contract_finish',job.target,81000));assert.equal(p.coins,360);
p=setup();assert.throws(()=>action(p,'city_contract_timeout',CITY_GARAGE,2000));
action(p,'city_contract_timeout',CITY_GARAGE,181000);assert.equal(p.city.contract,null);assert.equal(p.city.lastResult.status,'failed');assert.equal(p.coins,180);
action(p,'city_contract_start',CITY_GARAGE,182000,{id:job.id});assert.equal(p.city.contract.checkpoint,0);
action(p,'city_contract_cancel',CITY_GARAGE,183000);assert.equal(p.city.lastResult.status,'cancelled');assert.equal(p.coins,180);
p=setup();action(p,'city_contract_finish',job.target,181001);assert.equal(p.city.lastResult.status,'failed');assert.equal(p.coins,180);
const collision=createCityCollision();collision.playerRadius=1.7;
// Sweep the actual authored route, including each checkpoint and the delivery bay.
let position={...CITY_GARAGE};
for(const target of [...job.checkpoints,job.target]){
 while(Math.hypot(position.x-target.x,position.z-target.z)>1e-6){
  const distance=Math.hypot(target.x-position.x,target.z-position.z),step=Math.min(.2,distance);
  const next=collision.resolveMovement(position.x,position.z,(target.x-position.x)/distance*step,(target.z-position.z)/distance*step);
  assert.ok(Math.hypot(next.x-position.x,next.z-position.z)>step*.99,'Mission route blocked');position=next;
 }
}
console.log('PASS mission lifecycle: ordered checkpoints, anti-skip/time checks, reload, single reward, expiry, retry, cancel and swept route');
