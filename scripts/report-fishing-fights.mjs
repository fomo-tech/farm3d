import {writeFileSync} from 'node:fs';
import {FISHING_CONFIG,normalizeFishingState} from '../shared/fishingConfig.js';
import {advanceFishingSession,fishResistance} from '../shared/fishingSession.js';
const rows=[];
for(const rod of Object.values(FISHING_CONFIG.rods))for(const fish of Object.values(FISHING_CONFIG.fish)){
 const durations=[];let failures=0;
 for(let sample=0;sample<100;sample++){
  const id=`balance-${fish.id}-${sample}`,context={x:162,z:2};
  const state=normalizeFishingState({pending:{id,...context,zone:'lake',phase:'waiting',rodId:rod.id,fishId:fish.id,weight:fish.weight[0]+(fish.weight[1]-fish.weight[0])*sample/99,biteAt:1000,expiresAt:3400}});
  const hook=1750;advanceFishingSession(state,'fishing_reel',{sessionId:id},context,hook);
  let result,time=hook;
  while(state.pending){time+=400;const holding=(!fishResistance(state.pending,time)&&state.pending.tension<73)||state.pending.tension<23;result=advanceFishingSession(state,'fishing_pull',{sessionId:id,sequence:state.pending.sequence+1,holding},context,time);}
  if(result.fishCaught)durations.push(time-hook);else failures++;
 }
 durations.sort((a,b)=>a-b);
 rows.push({rod:rod.id,fish:fish.id,samples:100,failures,minMs:durations[0],medianMs:durations[Math.floor(durations.length*.5)],p95Ms:durations[Math.floor(durations.length*.95)],maxMs:durations.at(-1)});
}
const report={description:'Simulation with a competent hold/release policy, 750 ms reaction, 400 ms pulses; not measured player telemetry.',pricesChanged:false,hookWindowMs:2400,biteRangeMs:[FISHING_CONFIG.defaults.biteMinMs,FISHING_CONFIG.defaults.biteMaxMs],rows};
const output=process.argv[2]||'docs/fishing-gameplay-v3/balance.json';writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(rows));
if(rows.some(r=>r.failures))process.exitCode=1;
