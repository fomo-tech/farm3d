import assert from 'node:assert/strict';
import {applyCityAction,cityState,CITY_GARAGE,CITY_CONTRACTS} from '../shared/cityGameplay.js';
const p={coins:500,xp:0,vehicle:'walk',ownedVehicles:['walk']},context={worldMode:'city',...CITY_GARAGE};
const act=(action,payload={},time=10000,c=context)=>applyCityAction(p,action,payload,c,time);
act('city_enter');act('city_vehicle');
const job=CITY_CONTRACTS.find(j=>j.id==='south-delivery');
act('city_contract_start',{id:job.id});act('city_contract_finish',{},100000,{...context,...job.target});
assert.equal(p.city.history.length,1);assert.equal(p.city.totalEarned,job.reward);
act('city_vehicle',{},101000,{...context,...job.target});assert.equal(p.city.history.length,1,'Other actions do not duplicate mission results');
p.vehicle='convertible';
for(let i=0;i<25;i++){
 act('city_contract_start',{id:job.id},200000+i*2000);act('city_contract_cancel',{},201000+i*2000);
}
assert.equal(p.city.history.length,20);assert.equal(p.city.history[0].at,211000);assert.equal(p.city.totalEarned,job.reward);
const saved=JSON.parse(JSON.stringify(p)),restored=cityState(saved);assert.equal(restored.history.length,20);assert.equal(restored.history.at(-1).status,'cancelled');
assert.deepEqual(cityState({}).history,[]);assert.equal(cityState({}).totalEarned,0);
const timed=CITY_CONTRACTS.find(j=>j.timeLimit);act('city_contract_start',{id:timed.id},300000);act('city_contract_timeout',{},500000);assert.equal(p.city.history.at(-1).status,'failed');
console.log('PASS phone history: persisted results, earned total, no duplicate entries, bounded 20 records, cancel, timeout and old-save defaults');
