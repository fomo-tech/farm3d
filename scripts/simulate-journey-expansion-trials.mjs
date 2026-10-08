import {writeFileSync} from 'node:fs';
import {simulateNewPlayerJourney} from './economy/newPlayerJourney.js';
import {LAND_EXPANSION_CONFIG} from '../shared/landExpansionConfig.js';
import {percentile} from './economy/preLandSimulation.js';
const rows=[];
for(const prices of [[2500,5000,6500,8000],[2500,6500,7000,8000],[2500,7000,8000,9000]]){
 const config=structuredClone(LAND_EXPANSION_CONFIG);prices.forEach((cost,i)=>config.tiers[i].cost=cost);
 const runs=Array.from({length:16},(_,i)=>simulateNewPlayerJourney({seed:i+1,minutesPerDay:60,expansionConfig:config}));
 rows.push({prices,perCell:Object.fromEntries([5,6,7,8].map(n=>[n,{p50:percentile(runs.map(r=>r.milestones[n].activeMinutes-(n===5?r.purchase.activeMinutes+r.tutorial.minutes:r.milestones[n-1].activeMinutes)),.5),p90:percentile(runs.map(r=>r.milestones[n].activeMinutes-(n===5?r.purchase.activeMinutes+r.tutorial.minutes:r.milestones[n-1].activeMinutes)),.9)}])),to8:percentile(runs.map(r=>r.milestones[8].activeMinutes-r.purchase.activeMinutes),.5)});
}
writeFileSync('docs/new-player-journey/expansion-trials.json',JSON.stringify(rows,null,2)+'\n');console.log(JSON.stringify(rows,null,2));
