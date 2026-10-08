import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PUBLIC_TRAVEL_DESTINATIONS,resolveTravelDestination} from '../shared/travelDestinations.js';
import {ALL_MAP_DESTINATIONS,worldMapDestinations} from '../src/game/world/worldMapDestinations.js';
import {WorldCollisionSystem} from '../src/game/physics/WorldCollisionSystem.js';
import {networkWaterAt} from '../shared/waterNetwork.js';
import {travelCost} from '../shared/travelConfig.js';
const collision=new WorldCollisionSystem();
const lakes=PUBLIC_TRAVEL_DESTINATIONS.filter(p=>p.id.startsWith('lake'));
assert.equal(lakes.length,5);
for(const point of lakes){
 assert.deepEqual(resolveTravelDestination(point.x,point.z),{x:point.x,z:point.z});
 assert.deepEqual(ALL_MAP_DESTINATIONS.find(p=>p.id===point.id).x,point.x);
 assert.equal(networkWaterAt(point.x,point.z),null);
 assert.equal(collision.isColliding(point.x,point.z),false,`${point.id} must land on walkable shore`);
 for(const [dx,dz] of [[.2,0],[-.2,0],[0,.2],[0,-.2]])assert.equal(collision.resolveMovement(point.x,point.z,dx,dz).collided,false,`${point.id} can move away from arrival point`);
}
assert.equal(resolveTravelDestination(9000,9000),null);assert.equal(resolveTravelDestination(NaN,0),null);
for(const farmId of ['farm_000001','farm_000027','farm_000288']){
 const p=worldMapDestinations(farmId).find(p=>p.id==='farm');assert.deepEqual(resolveTravelDestination(p.x,p.z,farmId),{x:p.x,z:p.z});
}
// Execute the production travel handler with in-memory transport/payment doubles.
const source=readFileSync(new URL('../server/index.js',import.meta.url),'utf8');
const body=source.slice(source.indexOf("    if (message.type === 'travel') {"),source.indexOf("    if(message.type==='bus_board')"));
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const handler=new AsyncFunction('message','client','socket','resolveTravelDestination','travelCost','chargeTravel','safeSend','movementAuthority','fishingTelemetry','roomKey','savePosition','MAP_LAYOUT_VERSION','publicFarmScope','broadcastPresence',body);
let charges=0,persisted=[],messages=[];
const client={playerId:'test',x:1.9,z:13,y:0,venue:'fishing',villageId:'town',roomId:'fishing',channelId:'test',rotation:0};
const execute=async point=>handler({type:'travel',...point},client,{},resolveTravelDestination,travelCost,async()=>{charges++;return {player:{progress:{coins:1000},livestock:[]}};},(_,m)=>messages.push(m),{reset(){}},{observe(){}},()=> 'town',(_,p)=>persisted.push(p),1,async()=>{},()=>{});
for(const point of lakes){
 messages=[];await execute(point);const ack=messages.find(m=>m.type==='move_ack');
 assert.ok(ack,`${point.id} must receive server movement confirmation`);assert.equal(ack.x,point.x);assert.equal(ack.z,point.z);assert.equal(ack.venue,null);
 assert.equal(persisted.at(-1).x,point.x);
}
const before=charges;messages=[];await execute({x:9000,z:9000});assert.equal(charges,before);assert.equal(messages[0].type,'action_error');
console.log('PASS all 5 lake destinations: shared authorization, walkable shores, farm parity, server arrival acknowledgements, persistence and no charge on invalid target');
