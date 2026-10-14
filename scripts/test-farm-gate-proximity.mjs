import assert from 'node:assert/strict';
import { farmOrigin, nearFarmGate } from '../shared/farmSecurity.js';
import { FARM_LOT_SPEC } from '../shared/farmLayout.js';
import { FarmSecurity } from '../server/FarmSecurity.js';
const id = 'farm_000001', origin = farmOrigin(id);
const z = origin.z + FARM_LOT_SPEC.anchors.gate.z;
for (const x of [-4.35, -2.75, 0, 2.75, 4.35]) {
  assert.equal(nearFarmGate(id, {x: origin.x+x, z: z-1}), true, 'Gate leaves and adjacent sign expose interaction');
}
assert.equal(nearFarmGate(id, {x:origin.x,z:z-3.01}),false);
assert.equal(nearFarmGate(id, {x:origin.x+6,z}),false);
assert.equal(nearFarmGate(id, {x:origin.x,z,venue:'casino'}),false);
assert.equal(nearFarmGate('invalid', {x:0,z:0}),false);
const service = new FarmSecurity({assignments:{updateOne:async()=>({matchedCount:1})},now:()=>100});
const assignment = {_id:'test',playerId:'owner',villageId:'test',lot:1};
const besideSign = {x:origin.x-4.35,z:z-1};
assert.equal((await service.toggle(assignment,id,'owner',false,besideSign)).open,false,'Server accepts closing beside the visible sign');
assert.ok((await service.toggle(assignment,id,'visitor',false,besideSign)).error,'Ownership remains enforced');
assert.ok((await service.toggle(assignment,id,'owner',false,{x:origin.x,z:z-4})).error,'Server rejects remote control');
console.log('PASS gate proximity: visible leaves/sign reachable; remote and indoor actions denied');
