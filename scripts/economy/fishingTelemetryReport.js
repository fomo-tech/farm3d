import { PLAY_PROFILES } from './preLandSimulation.js';

const median=values=>quantile(values,.5);
function quantile(values,q) {
  const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);
  return sorted.length?sorted[Math.floor((sorted.length-1)*q)]:null;
}
function unionMs(intervals) {
  let total=0,end=-Infinity;
  for(const [a,b]of intervals.sort((x,y)=>x[0]-y[0])){if(b<=a)continue;total+=Math.max(0,b-Math.max(a,end));end=Math.max(end,b);}
  return total;
}
export function buildFishingTelemetryReport(rawEvents,{now=Date.now(),minimumSamples=20,droppedEvents=0,pendingEvents=0}={}) {
  droppedEvents += rawEvents.filter(e=>e.type==='health').reduce((sum,e)=>sum+(e.data?.droppedPresence||0),0);
  const unique=new Map(rawEvents.filter(e=>e.version===1&&Number.isFinite(e.at)).map(e=>[e._id,e]));
  const events=[...unique.values()].sort((a,b)=>a.at-b.at||a._id.localeCompare(b._id));
  const grouped=new Map(),casts=new Map();
  for(const event of events) {
    if(!grouped.has(event.sessionId))grouped.set(event.sessionId,[]);
    grouped.get(event.sessionId).push(event);
    const castKey=event.data?.castKey;
    if(castKey){const cast=casts.get(castKey)||{cast:null,hook:null,terminal:null};
      if(event.type==='cast')cast.cast=event;
      if(event.type==='hook')cast.hook=event;
      if(['catch','escape'].includes(event.type)&&!cast.terminal)cast.terminal=event;
      casts.set(castKey,cast);
    }
  }
  const sessions=[],initialTravel=[],returnTravel=[],saleDelays=[],interCast=[],reactions=[];
  let incompleteSessions=0,unobserved=0,orphanOutcomes=0;
  for(const [sessionId,list]of grouped) {
    if (!list.some(e=>!e.hasLand && ['cast','hook','catch','escape','gear_purchase','sale','mission'].includes(e.type))) continue;
    const start=list.find(e=>e.type==='session_start'),endEvent=list.find(e=>e.type==='session_end');
    const first=start?.at??list[0].at,last=endEvent?.at??Math.min(now,list.at(-1).at+15000);
    if(!start||!endEvent)incompleteSessions++;
    const active=unionMs(list.map(e=>[Math.max(first,e.at),Math.min(last,e.data?.activeUntil??e.at)]));
    const relevant=list.filter(e=>!e.hasLand);
    const purchases=relevant.filter(e=>e.type==='gear_purchase'),sales=relevant.filter(e=>e.type==='sale'),missions=relevant.filter(e=>e.type==='mission');
    const ownCasts=relevant.filter(e=>e.type==='cast').map(e=>casts.get(e.data.castKey));
    const count=type=>ownCasts.filter(c=>c.terminal?.type===type).length;
    const unknown=ownCasts.filter(c=>!c.terminal).length;unobserved+=unknown;
    let area=null,shopEntry=null,bankLeft=null,shopLeft=null,lastTerminal=null;
    const firstCast=relevant.find(e=>e.type==='cast');
    if(start&&firstCast&&purchases.some(e=>e.data.kind==='rod'&&e.at<=firstCast.at))initialTravel.push(firstCast.at-start.at);
    // Region changes come from validated server positions, not claimed client timing.
    for(const event of relevant) {
      if(event.area!==area) {
        if(area?.startsWith('bank:')&&event.area==='other')bankLeft=event.at;
        if(area==='shop'&&event.area!=='shop')shopLeft=event.at;
        if(event.area==='shop'){
          shopEntry=event.at;
          if(bankLeft!==null&&event.at-bankLeft<=300000)returnTravel.push(event.at-bankLeft);
          bankLeft=null;
        }
        if(event.area?.startsWith('bank:')&&shopLeft!==null){
          if(firstCast&&event.at>firstCast.at&&event.at-shopLeft<=300000)returnTravel.push(event.at-shopLeft);
          shopLeft=null;
        }
        // Don't assign travel/menu time to the delay between fishing attempts.
        if(!event.area?.startsWith('bank:'))lastTerminal=null;
        area=event.area;
      }
      if(event.type==='sale'&&shopEntry!==null&&event.at-shopEntry<=120000)saleDelays.push(event.at-shopEntry);
      if(['catch','escape'].includes(event.type))lastTerminal=event;
      if(event.type==='cast'&&lastTerminal&&event.area===lastTerminal.area){
        const gap=event.at-lastTerminal.at;
        if(gap>=0&&gap<=60000)interCast.push(gap);
        lastTerminal=null;
      }
    }
    const salesCoins=sales.reduce((sum,e)=>sum+e.data.coins,0);
    const costs=kind=>-purchases.filter(e=>e.data.kind===kind).reduce((sum,e)=>sum+e.data.coinDelta,0);
    const missionCoins=missions.reduce((sum,e)=>sum+e.data.coinDelta,0);
    const row={sessionId,playerKey:list[0].playerKey,startAt:new Date(first).toISOString(),closed:Boolean(endEvent),hasStart:Boolean(start),
      connectedMinutes:+((last-first)/60000).toFixed(2),activeEstimateMinutes:+(active/60000).toFixed(2),
      durationBucket:last-first<15*60000?'under-15':last-first<30*60000?'15-30':last-first<60*60000?'30-60':'60-plus',
      casts:ownCasts.length,caught:count('catch'),escaped:count('escape'),cancelled:ownCasts.filter(c=>c.terminal?.data.reason==='cancelled').length,
      unobserved:unknown,sold:sales.reduce((sum,e)=>sum+e.data.count,0),salesCoins,rodCost:costs('rod'),baitCost:costs('bait'),toolCost:costs('tool'),missionCoins,
      netFishingCoins:salesCoins+missionCoins-costs('rod')-costs('bait')-costs('tool'),
      baitUsed:ownCasts.filter(c=>c.cast.data.baitId).length,fishAtLastSale:sales.at(-1)?.data.inventoryCount??null};
    sessions.push(row);
  }
  const hooked=[],rare=[];
  for(const cast of casts.values()) {
    if(!cast.cast){if(cast.terminal&&!cast.terminal.hasLand)orphanOutcomes++;continue;}
    if(cast.cast.hasLand)continue;
    if(cast.hook){hooked.push(cast);if(Number.isFinite(cast.hook.data.reactionMs)&&cast.hook.data.reactionMs>=0)reactions.push(cast.hook.data.reactionMs);}
    if(cast.hook&&['rare','legendary'].includes(cast.hook.data.rarity)&&cast.terminal)rare.push(cast);
  }
  const completed=[...casts.values()].filter(c=>c.cast&&!c.cast.hasLand&&c.terminal&&c.terminal.data.reason!=='cancelled');
  const stats={initialTravelMs:{samples:initialTravel.length,p50:median(initialTravel)},returnTravelMs:{samples:returnTravel.length,p50:median(returnTravel)},
    saleMs:{samples:saleDelays.length,p50:median(saleDelays)},betweenCastsMs:{samples:interCast.length,p50:median(interCast)},
    reactionMs:{samples:reactions.length,p50:median(reactions)},hookSuccess:{samples:completed.length,value:completed.length?completed.filter(c=>c.hook).length/completed.length:null},
    rareFightSuccess:{samples:rare.length,value:rare.length?rare.filter(c=>c.terminal.type==='catch').length/rare.length:null}};
  const overlaps=new Set();
  for(let i=0;i<sessions.length;i++)for(let j=i+1;j<sessions.length;j++){
    const a=sessions[i],b=sessions[j];
    if(a.playerKey!==b.playerKey)continue;
    if(Date.parse(a.startAt)+a.connectedMinutes*60000>Date.parse(b.startAt)&&Date.parse(b.startAt)+b.connectedMinutes*60000>Date.parse(a.startAt)){overlaps.add(a.sessionId);overlaps.add(b.sessionId);}
  }
  // Telemetry incompleteness and overlapping tabs prevent automatic calibration.
  const sufficient=Object.values(stats).every(s=>s.samples>=minimumSamples&&Number.isFinite(s.p50??s.value));
  const trustworthy=sufficient&&!droppedEvents&&!pendingEvents&&!orphanOutcomes&&!overlaps.size&&!incompleteSessions&&!unobserved;
  const measuredProfile=trustworthy?{...PLAY_PROFILES.regular,
    initialTravelMs:stats.initialTravelMs.p50,returnTravelMs:stats.returnTravelMs.p50,saleMs:stats.saleMs.p50,
    castOverheadMs:0,betweenCastsMs:stats.betweenCastsMs.p50,reactionMs:stats.reactionMs.p50,
    hookSuccess:stats.hookSuccess.value,rareFightSuccess:stats.rareFightSuccess.value}:null;
  return {version:1,generatedAt:new Date(now).toISOString(),scope:'pre-land fishing',uniqueEvents:events.length,sessions,
    metrics:stats,measuredProfile,quality:{minimumSamples,sufficient,calibrationReady:trustworthy,droppedEvents,pendingEvents,
      incompleteSessions,unobservedCasts:unobserved,orphanOutcomes,overlappingSessions:overlaps.size},
    caveats:[
      'Server timestamps measure accepted actions and verified region transitions; cast windup cannot be separated from between-attempt interaction time.',
      'Connected time is separate from an activity estimate using accepted input + 60 seconds grace; this does not measure browser focus.',
      'Reconnect creates a separate session. A catch is attributed to the session where its cast started; sales belong to the session where payment committed.',
      'Timeouts not finalized by an accepted action remain unobserved, not successful or failed samples. Raw data expires after 30 days.',
      'Travel samples over 5 minutes and between-cast gaps over 60 seconds are excluded from calibration as potential pauses.',
      'Automatic profiles require enough samples for every field and no dropped/pending events, orphan outcomes or overlapping tabs.',
    ]};
}
