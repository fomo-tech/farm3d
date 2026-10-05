import assert from 'node:assert/strict';
import {TOWN_SPAWN,recoverTownSpawn,insideTownFountain} from '../shared/playerSpawn.js';
import {WorldCollisionSystem} from '../src/game/physics/WorldCollisionSystem.js';
const collision=new WorldCollisionSystem();
for(const position of [{x:0,y:0,z:0},{x:8,y:0,z:0},{x:0,y:6,z:0},{x:0,y:0,z:18}]){
 const fixed=recoverTownSpawn(position);assert.equal(fixed.z,TOWN_SPAWN.z);assert.ok(!collision.isColliding(fixed.x,fixed.z));
}
const interior={x:0,y:32,z:0,venue:'casino'};assert.equal(recoverTownSpawn(interior),interior);
const saved={x:53,y:0,z:-273.1};assert.equal(recoverTownSpawn(saved),saved);
const walking={x:0,y:0,z:18};assert.equal(recoverTownSpawn(walking,{legacyDefault:false}),walking,'live movement past legacy spawn must not teleport');
const rim={x:0,y:0,z:10};assert.equal(recoverTownSpawn(rim,{legacyDefault:false,clearance:.45}),rim,'live movement outside physical rim remains valid');
assert.equal(insideTownFountain(0,0),true);
for(const [dx,dz] of [[.1,0],[-.1,0],[0,.1],[0,-.1]]){
 const fixed=collision.resolveMovement(0,0,dx,dz);assert.equal(fixed.recovered,true);
 const next=collision.resolveMovement(fixed.x,fixed.z,dx,dz);assert.equal(next.collided,false);
}
assert.equal(collision.resolveMovement(0,10,0,-.5).collided,true,'walking into fountain remains blocked');
console.log('PASS: fountain save recovery, elevated fountain positions, four-direction unstuck and movement, safe spawn, unaffected interiors/valid saves');
