import assert from 'node:assert/strict';
import {selectDailyMissions,normalizeMissions,dailyMissionList,claimMission,MAIN_MISSIONS,DAILY_COIN_BUDGET} from '../shared/missions.js';
import {missionStats} from '../shared/preLandJourney.js';
const now=Date.parse('2026-10-07T02:00:00Z');
const p={coins:100,xp:80,level:2,unlockedPlots:4,stats:{planted:0,watered:0,harvested:0,orders:1,crafted:1,animalsFed:0},onboarding:{completed:true}};
const ctx={hasLand:true,hasLivestock:true,progress:p,livestock:[{species:'chicken'}],seed:'farmer'};
const seen=new Set();
for(let day=0;day<32;day++){
 const list=selectDailyMissions(now+day*86400000,ctx);
 assert.equal(list.length,3);assert.equal(new Set(list.map(m=>m.id)).size,3);
 assert.equal(list.reduce((n,m)=>n+m.coins,0),DAILY_COIN_BUDGET);
 assert.deepEqual(selectDailyMissions(now+day*86400000,ctx),list);
 for(const m of list)seen.add(m.id);
}
for(const id of ['daily-orders-1','daily-feed-1','daily-craft-1'])assert(seen.has(id));
const beginner={...p,stats:{},level:1};
for(let day=0;day<10;day++)assert(selectDailyMissions(now+day*86400000,{hasLand:true,progress:beginner,livestock:[]}).every(m=>!['orders','crafted','animalsFed'].includes(m.stat)));
for(let day=0;day<10;day++)assert(!selectDailyMissions(now+day*86400000,{...ctx,livestock:[{species:'pig'}],progress:{...p,level:1}}).some(m=>m.stat==='animalsFed'||m.stat==='crafted'),'no unsupported care/craft assignment');
p.missions=normalizeMissions(null,missionStats(p),now,ctx);
const saved=structuredClone(p.missions);
assert.deepEqual(normalizeMissions(saved,missionStats(p),now,{hasLand:true,progress:beginner,livestock:[]}),saved,'selling herd/reconnect cannot reroll today');
for(const m of dailyMissionList(saved)){
 assert.match(claimMission(p,'daily',m.id,now,ctx),/chưa hoàn thành/);
 p.stats[m.stat]=(saved.daily.baseline[m.stat]||0)+m.goal;
 assert.equal(claimMission(p,'daily',m.id,now,ctx),null);
 assert.match(claimMission(p,'daily',m.id,now,ctx),/đã được nhận/);
}
assert.equal(p.coins,205);
const oldIds=MAIN_MISSIONS.slice(0,12).map(m=>m.id);
const veteran={...p,unlockedPlots:4,stats:{...p.stats,landTiles:999},missions:{main:{claimed:oldIds},daily:saved.daily}};
assert.match(claimMission(veteran,'main','main-land-5',now,ctx),/chưa hoàn thành/,'payload-like stat cannot spoof cleared plots');
veteran.unlockedPlots=5;assert.equal(claimMission(veteran,'main','main-land-5',now,ctx),null);
assert.match(claimMission(veteran,'main','main-land-5',now,ctx),/trước đó|đã được nhận/);
assert.equal(veteran.missions.main.claimed.length,13);
assert.equal(MAIN_MISSIONS.reduce((n,m)=>n+m.coins,0),2140);
assert.deepEqual(normalizeMissions(saved,missionStats(p),now+86400000,ctx).main.claimed,[]);
console.log('PASS: capability-based daily assignment, deterministic selection, 105 budget, stable saves, actual land milestones and legacy reward IDs.');
