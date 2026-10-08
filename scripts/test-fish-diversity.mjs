import assert from 'node:assert/strict';
import {FISHING_CONFIG,normalizeFishingState} from '../shared/fishingConfig.js';
import {publicFishAppearance,fishForm,FISH_FORMS,caughtFishScale} from '../shared/fishAppearance.js';
import {pickFishingCatch} from '../shared/fishingCatch.js';
import {advanceFishingSession,publicFishingProgress,FISHING_GAME,fishResistance} from '../shared/fishingSession.js';
assert.equal(Object.keys(FISHING_CONFIG.fish).length,21);
assert.ok(new Set(Object.values(FISHING_CONFIG.fish).map(fishForm)).size>=8);
for(const fish of Object.values(FISHING_CONFIG.fish)){
 assert.ok(FISH_FORMS[fishForm(fish)]);
 assert.ok(fish.zones.every(zone=>FISHING_CONFIG.zones[zone].fish.includes(fish.id)),fish.id);
 assert.ok(caughtFishScale({...fish,caughtWeight:fish.weight[1]})>caughtFishScale({...fish,caughtWeight:fish.weight[0]}));
 const weight=(fish.weight[0]+fish.weight[1])/2;
 const f=normalizeFishingState({pending:{id:'diverse',x:162,z:2,zone:'lake',rodId:'rod_bamboo',phase:'waiting',biteAt:1000,expiresAt:1000+FISHING_GAME.hookWindowMs,fishId:fish.id,weight}});
 const publicState=publicFishingProgress({fishing:f}).fishing.pending;
 assert.equal(publicState.fishId,undefined);assert.equal(publicState.weight,undefined);
 assert.deepEqual({shadowSize:publicState.shadowSize,shadowShape:publicState.shadowShape},publicFishAppearance(fish.id,weight));
 advanceFishingSession(f,'fishing_reel',{sessionId:'diverse'},{x:162,z:2},1200);
 let result;
 for(let now=1600;now<36200&&f.pending;now+=400){const holding=(!fishResistance(f.pending,now)&&f.pending.tension<73)||f.pending.tension<23;result=advanceFishingSession(f,'fishing_pull',{sessionId:'diverse',sequence:f.pending.sequence+1,holding},{x:162,z:2},now);}
 assert.equal(result.fishCaught,fish.id,`${fish.id} catchable with bamboo`);
}
let seed=7;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
for(const zone of Object.keys(FISHING_CONFIG.zones)){
 const seen=new Set();for(let i=0;i<5000;i++)seen.add(pickFishingCatch(zone,null,random,0).fishId);
 for(const id of FISHING_CONFIG.zones[zone].fish)assert.ok(seen.has(id),`${zone}: ${id} reachable in catch pool`);
}
console.log('PASS fish diversity: 21 reachable species, 8 body forms, weight sizes, hidden species, all catchable.');
