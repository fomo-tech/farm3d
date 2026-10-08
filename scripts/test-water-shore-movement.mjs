import assert from 'node:assert/strict';
import {WorldCollisionSystem} from '../src/game/physics/WorldCollisionSystem.js';
import {networkCollisionBoxes,NETWORK_LAKES,NETWORK_BRIDGES} from '../shared/waterNetwork.js';
const collision=new WorldCollisionSystem();collision.initRiverColliders(networkCollisionBoxes());
// This dry bank used to be trapped by a raster box beginning at x=148.
for(const x of [147,147.5,147.8])for(const [dx,dz] of [[.1,0],[-.1,0],[0,.1],[0,-.1]]){
 const next=collision.resolveMovement(x,-70,dx,dz);
 assert.equal(next.collided,false,`dry bank ${x},-70 must remain walkable`);
 assert.ok(Math.hypot(next.x-x,next.z+70)>.09);
}
for(const lake of NETWORK_LAKES)assert.equal(collision.isColliding(lake.x,lake.z),true,'deep water remains blocked even far from box centre');
for(const b of NETWORK_BRIDGES)assert.equal(collision.isColliding(b.cx,b.cz),false,'bridge remains passable');
console.log('PASS: four directions at 147,-70 and adjacent dry bank, deep water protection, five passable bridges');
