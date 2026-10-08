import assert from 'node:assert/strict';
import {LAND_EXPANSION_CONFIG} from '../shared/landExpansionConfig.js';
import {EXPANSION_PRICE_TRIALS,expansionTrialConfig,runExpansionTrial,summarizeExpansionTrial} from './economy/combinedExpansionTrials.js';
const saved=JSON.stringify(LAND_EXPANSION_CONFIG);
for(const p of EXPANSION_PRICE_TRIALS){const r=runExpansionTrial(p,{sessions:3});assert.equal(r.summary.reserveViolations,0);assert.equal(r.ledger.expansion,r.summary.unlocks.reduce((sum,event)=>sum+event.cost,0));assert(r.summary.unlocks.every(event=>event.coinsAfter>=event.reserveRequired));assert(r.summary.minCoins>=0);assert.deepEqual(r,runExpansionTrial(p,{sessions:3}));assert(r.summary.groups.every(g=>g.observed<=g.expected));}
const current=runExpansionTrial(EXPANSION_PRICE_TRIALS[0],{sessions:14});
const paced=runExpansionTrial(EXPANSION_PRICE_TRIALS[1],{sessions:14});
assert.equal(current.summary.tiles,24);assert.equal(paced.summary.milestones[24],null);assert(paced.summary.milestones[8].minutes>current.summary.milestones[8].minutes);
const fixture=summarizeExpansionTrial({tiles:6,coins:10,minCoins:0,unlocks:[{tiles:5,activeMinutes:20,coinsAfter:10,reserveRequired:5},{tiles:6,activeMinutes:45,coinsAfter:10,reserveRequired:5}]});
assert.equal(fixture.groups[0].withinTarget,2);assert.equal(fixture.groups[0].complete,false);assert.equal(fixture.milestones[8],null);
assert.throws(()=>expansionTrialConfig({prices:[1]}));assert.throws(()=>expansionTrialConfig({prices:[1,-2,3,4]}));assert.equal(JSON.stringify(LAND_EXPANSION_CONFIG),saved);


const stepped={id:'early-test',prices:[6000,20000,60000,120000],earlyPrices:[2500,5000,6500,8000]};
const config=expansionTrialConfig(stepped);
assert.deepEqual(config.tiers.slice(0,4).map(t=>[t.through,t.cost]),[[5,2500],[6,5000],[7,6500],[8,8000]]);
assert.deepEqual(config.tiers.slice(4).map(t=>t.cost),[20000,60000,120000]);
const refined=runExpansionTrial(stepped,{sessions:14});assert.equal(refined.summary.groups[0].withinTarget,4);assert.equal(refined.summary.reserveViolations,0);
assert.throws(()=>expansionTrialConfig({...stepped,earlyPrices:[1,2,3]}));assert.throws(()=>expansionTrialConfig({...stepped,earlyPrices:[2,1,3,4]}));
assert.equal(JSON.stringify(LAND_EXPANSION_CONFIG),saved);

console.log('PASS expansion trials: config isolation, determinism, capital reserve, slower expansion, missing milestones and per-tile target accounting.');
