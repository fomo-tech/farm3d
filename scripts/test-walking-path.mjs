import assert from 'node:assert/strict';
import {findWalkingPath} from '../src/game/physics/findWalkingPath.js';
const wall=(x,z)=>x>=4&&x<=6&&z>=-3&&z<=3;
const start={x:0,z:0},target={x:10,z:0};
const path=findWalkingPath(start,target,wall);assert(path&&path.length>1);assert.deepEqual(path.at(-1),target);
let from=start;for(const p of path){for(let i=1;i<=100;i++)assert(!wall(from.x+(p.x-from.x)*i/100,from.z+(p.z-from.z)*i/100));from=p;}
assert.deepEqual(findWalkingPath(start,target,()=>false),[target]);
assert.equal(findWalkingPath(start,target,()=>true,{maxNodes:10}),null);
const gate=(x,z)=>x>=4&&x<=6&&Math.abs(z)>.8;
assert.deepEqual(findWalkingPath(start,target,gate),[target]);
console.log('PASS walking path: clear route, obstacle detour, passable gate and bounded unreachable search.');

const {WorldCollisionSystem}=await import('../src/game/physics/WorldCollisionSystem.js');
const collision=new WorldCollisionSystem();
const actual=findWalkingPath({x:0,z:42},{x:116.9,z:-16},(x,z)=>collision.isColliding(x,z));
assert(actual);assert(actual.length>1);
let prev={x:0,z:42};for(const point of actual){const n=Math.ceil(Math.hypot(point.x-prev.x,point.z-prev.z)/.1);for(let i=1;i<=n;i++)assert(!collision.isColliding(prev.x+(point.x-prev.x)*i/n,prev.z+(point.z-prev.z)*i/n));prev=point;}
console.log('PASS: town spawn to fishing shop avoids actual world colliders.');

const {farmTilePosition}=await import('../shared/farmLayout.js');
collision.setFarmGate('farm_000001',true,true);
const firstTile=farmTilePosition(1,'0:0');
const elderApproach={x:-7.4,z:73.5};
assert.equal(findWalkingPath(firstTile,{x:-7.4,z:76},(x,z)=>collision.isColliding(x,z)),null);
assert(findWalkingPath(firstTile,elderApproach,(x,z)=>collision.isColliding(x,z)));
assert(findWalkingPath(elderApproach,firstTile,(x,z)=>collision.isColliding(x,z)));
console.log('PASS: first unlocked crop cell ↔ Oliver approach; blocked kiosk target rejected.');

const {findWalkingPathAsync}=await import('../src/game/physics/findWalkingPath.js');
let yields=0;
const asyncPath=await findWalkingPathAsync(start,target,wall,{budgetMs:0,yieldFrame:async()=>{yields++;}});
assert.deepEqual(asyncPath,path,'yielded search retains collision-safe route');
assert.ok(yields>0,'search releases the event loop before completing');
let cancelled=false,checks=0;
const aborted=await findWalkingPathAsync(start,{x:200,z:0},()=>{checks++;return false;},{budgetMs:0,cancelled:()=>cancelled,yieldFrame:async()=>{cancelled=true;}});
assert.equal(aborted,null);assert.ok(checks<600,'cancelled search does not continue');
console.log('PASS: async route matches sync route, yields and cancels obsolete work.');
