import assert from 'node:assert/strict';
import {normalizeFishingState} from '../shared/fishingConfig.js';
import {advanceFishingSession,publicFishingProgress,fishResistance,claimFishingMission,fishingTimePhase} from '../shared/fishingSession.js';
import {lakeDeepWaterAt} from '../shared/lakeConfig.js';
import {fishingCastTarget} from '../shared/fishing.js';
const context={x:162,z:2};
const fresh=()=>normalizeFishingState({pending:{id:'test',x:162,z:2,zone:'lake',rodId:'rod_bamboo',phase:'waiting',biteAt:1000,expiresAt:3400,fishId:'carp',weight:1.2}});
const call=(f,action,time,payload={})=>advanceFishingSession(f,action,{sessionId:'test',...payload},context,time);
const f=fresh();
f.pending.fishId='golden_carp';
assert.equal(publicFishingProgress({fishing:f}).fishing.pending.fishId,undefined);
assert.equal(publicFishingProgress({fishing:f}).fishing.pending.weight,undefined);
assert.equal(publicFishingProgress({fishing:f}).fishing.pending.shadowSize,'medium');
assert.equal(f.pending.fishId,'golden_carp');
assert.throws(()=>call(f,'fishing_reel',999));
assert.throws(()=>call(f,'fishing_reel',1000,{sessionId:'wrong'}));
call(f,'fishing_reel',1000);assert.equal(f.pending.phase,'fighting');assert.equal(f.stats.totalCaught,0);
assert.throws(()=>call(f,'fishing_pull',1050,{sequence:1,holding:true}));
assert.throws(()=>call(f,'fishing_pull',1400,{sequence:3,holding:true}));
let result;
for(let now=1400;now<35000&&f.pending;now+=400){
  const holding= !fishResistance(f.pending,now) && f.pending.tension<73 || f.pending.tension<23;
  result=call(f,'fishing_pull',now,{sequence:f.pending.sequence+1,holding});
}
assert.equal(result.fishCaught,'golden_carp');assert.equal(f.stats.totalCaught,1);assert.equal(f.fish.golden_carp.count,1);assert.equal(f.collection.golden_carp.count,1);
const normal=fresh();assert.throws(()=>call(normal,'fishing_reel',999));
assert.equal(call(normal,'fishing_reel',1000).fishCaught,'carp');
assert.equal(normal.pending,null);assert.equal(normal.stats.totalCaught,1);
assert.throws(()=>call(normal,'fishing_reel',1001));
assert.throws(()=>call(f,'fishing_pull',36000,{sequence:99,holding:true}));
const late=fresh();assert.ok(call(late,'fishing_reel',3401).fishEscaped);assert.equal(late.pending,null);
const moved=fresh();assert.ok(advanceFishingSession(moved,'fishing_reel',{sessionId:'test'},{x:153,z:2},1000).fishEscaped);
for(const holding of [true,false]){
 const fail=fresh();fail.pending.fishId='golden_carp';call(fail,'fishing_reel',1000);
 for(let now=1400;now<10000&&fail.pending;now+=400)result=call(fail,'fishing_pull',now,{sequence:fail.pending.sequence+1,holding});
 assert.ok(result.fishEscaped);assert.equal(fail.stats.totalCaught,0);
}
const disconnect=fresh();disconnect.pending.fishId='golden_carp';call(disconnect,'fishing_reel',1000);assert.ok(call(disconnect,'fishing_pull',3100,{sequence:1,holding:true}).fishEscaped);
const reload=normalizeFishingState(JSON.parse(JSON.stringify(f)));assert.equal(reload.collection.golden_carp.count,1);
for(const x of [142,153,162]){const target=fishingCastTarget(x,2,'lake',8);assert.ok(lakeDeepWaterAt(target.x,target.z,.5));assert.ok(Math.hypot(target.x-x,target.z-2)<=8.001);}
assert.equal(claimFishingMission(f,'first_fish').coins,20);assert.throws(()=>claimFishingMission(f,'first_fish'));assert.throws(()=>claimFishingMission(f,'collector'));
assert.equal(fishingTimePhase(180000),'night');
console.log('PASS fishing: timed hook, server tension, successful full fight, slack/snap, moved/expired/disconnected, replay rejection, secret filtering, durable collection');
