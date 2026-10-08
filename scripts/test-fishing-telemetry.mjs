import assert from 'node:assert/strict';
import { FishingTelemetry, fishingArea } from '../server/FishingTelemetry.js';
import { buildFishingTelemetryReport } from './economy/fishingTelemetryReport.js';
import { simulatePreLand } from './economy/preLandSimulation.js';

const fakeDb={collection:()=>({})};
let now=100000;
const service=new FishingTelemetry(fakeDb,{now:()=>now});
assert.equal(fishingArea({venue:'fishing'}),'shop');assert.equal(fishingArea({x:162,z:2}),'bank:lake');
const id=service.startSession('private-player',{venue:'fishing'});
service.observe(id,{venue:'fishing'},{now:now+1000});assert.equal(service.buffer.length,1,'presence is throttled');
service.observe(id,{x:162,z:2},{now:now+3000,meaningful:true});assert.equal(service.buffer.length,2);
const pending={id:'opaque-cast',zone:'lake',rodId:'rod_bamboo',baitId:null,phase:'waiting',castAt:now+4000,biteAt:now+5000,expiresAt:now+7400,fishId:'carp',weight:1};
const player={playerId:'private-player',revision:1,progress:{coins:30,fishing:{pending,fish:{},coolerCapacity:10}}};
const ctx={telemetrySessionId:id,x:162,z:2};
const cast=service.committedEvents(player,{coins:30,pending:null},'fishing_cast',{},null,ctx,now+4000);
assert.equal(cast.length,1);assert.equal(cast[0].type,'cast');assert.equal(cast[0].data.castAt,now+4000);
assert.ok(!JSON.stringify(cast).includes('private-player'));assert.ok(!JSON.stringify(cast).includes('opaque-cast'));
const same=service.committedEvents(player,{coins:30,pending:null},'fishing_cast',{},null,ctx,now+4000);
assert.equal(cast[0]._id,same[0]._id,'same commit yields same receipt identity');
player.revision=2;player.progress.fishing.pending=null;player.progress.fishing.fish={carp:{count:1,totalWeight:1}};
const complete=service.committedEvents(player,{coins:30,pending},'fishing_reel',{},{fishCaught:'carp',weight:1},ctx,now+5500);
assert.deepEqual(complete.map(e=>e.type),['hook','catch']);assert.equal(complete[0].data.reactionMs,500);
now+=65000;service.endSession(id,ctx);
const report=buildFishingTelemetryReport([...service.buffer,...cast,...complete,...cast],{now});
assert.equal(report.sessions[0].casts,1);assert.equal(report.sessions[0].caught,1);assert.equal(report.sessions[0].unobserved,0);
assert.equal(report.metrics.reactionMs.p50,500);assert.equal(report.quality.sufficient,false);assert.equal(report.measuredProfile,null);
assert.ok(report.sessions[0].activeEstimateMinutes<=report.sessions[0].connectedMinutes);
const censored=buildFishingTelemetryReport([...service.buffer,...cast],{now});
assert.equal(censored.sessions[0].unobserved,1);assert.equal(censored.metrics.hookSuccess.samples,0);
assert.equal(buildFishingTelemetryReport([]).measuredProfile,null);
// A complete manufactured fixture checks the report math; it is not real player data.
let serial=0;
const ev=(type,time,data={},area='other')=>({_id:String(++serial),version:1,type,sessionId:'fixture',playerKey:'fixture-player',at:time,hasLand:false,area,data:{activeUntil:time+60000,...data}});
const fixture=[ev('session_start',0),ev('gear_purchase',100,{kind:'rod',coinDelta:-150},'shop'),ev('presence',1000,{},'other'),ev('presence',11000,{},'bank:lake'),
 ev('cast',12000,{castKey:'c1',baitId:null,rarity:'legendary'},'bank:lake'),ev('hook',15000,{castKey:'c1',rarity:'legendary',reactionMs:1000},'bank:lake'),
 ev('catch',17000,{castKey:'c1',rarity:'legendary'},'bank:lake'),ev('cast',20000,{castKey:'c2',baitId:null,rarity:'common'},'bank:lake'),
 ev('hook',23000,{castKey:'c2',rarity:'common',reactionMs:500},'bank:lake'),ev('catch',24000,{castKey:'c2',rarity:'common'},'bank:lake'),
 ev('presence',25000,{},'other'),ev('presence',35000,{},'shop'),ev('sale',37000,{count:2,coins:100,coinDelta:100,inventoryCount:0},'shop'),
 ev('mission',37500,{coinDelta:20},'shop'),ev('presence',38000,{},'other'),ev('presence',48000,{},'bank:lake'),ev('session_end',50000,{},'bank:lake')];
const calibrated=buildFishingTelemetryReport(fixture,{minimumSamples:1,now:50000});
assert.ok(calibrated.quality.calibrationReady, JSON.stringify({metrics:calibrated.metrics,quality:calibrated.quality}));assert.equal(calibrated.measuredProfile.returnTravelMs,10000);
assert.equal(calibrated.measuredProfile.castOverheadMs,0);assert.equal(calibrated.measuredProfile.betweenCastsMs,3000);
assert.equal(calibrated.sessions[0].netFishingCoins,-30);
assert.equal(buildFishingTelemetryReport(fixture,{minimumSamples:1,droppedEvents:1,now:50000}).measuredProfile,null);
assert.equal(buildFishingTelemetryReport(fixture,{minimumSamples:1,pendingEvents:1,now:50000}).measuredProfile,null);
const replay=[...fixture,...fixture];assert.equal(buildFishingTelemetryReport(replay,{minimumSamples:1,now:50000}).uniqueEvents,fixture.length);
const measured=simulatePreLand({sessions:1,measuredProfiles:{regular:calibrated.measuredProfile}});assert.ok(Number.isSafeInteger(measured.coins));
assert.throws(()=>simulatePreLand({measuredProfiles:{regular:{hookSuccess:2}}}));
const zeroTravel=simulatePreLand({sessions:1,sessionMinutes:1,profile:'fast',measuredProfiles:{fast:{initialTravelMs:0,returnTravelMs:0,saleMs:0}}});
assert.ok(zeroTravel.attempts>0,'zero-duration measured travel must not hang');
console.log('PASS telemetry: server-only fields, throttling, commit identities, cast/hook/catch linkage, report deduplication, missing-data gates, finance totals and measured simulation profiles.');
