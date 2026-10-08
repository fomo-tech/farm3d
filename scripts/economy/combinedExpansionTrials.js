import {LAND_EXPANSION_CONFIG,validateLandExpansionConfig} from '../../shared/landExpansionConfig.js';
import {simulateCombinedFarm} from './combinedFarmSimulation.js';
import {CRAFTING_PRICE_POLICIES,evaluateCraftingPrices} from './craftingPriceTrials.js';

const baseConfig={...structuredClone(LAND_EXPANSION_CONFIG),tiers:[{through:8,cost:350,level:1},{through:12,cost:700,level:2},{through:18,cost:1400,level:4},{through:24,cost:2400,level:6}]};
// Offline candidates only: prices/levels of production are never mutated.
export const EXPANSION_PRICE_TRIALS=Object.freeze([
 {id:'previous',prices:baseConfig.tiers.map(t=>t.cost)},
 {id:'paced',prices:[6000,20000,60000,120000]},
 {id:'long',prices:[12000,40000,120000,240000]},
]);
export function expansionTrialConfig(policy) {
 if(!policy||!Array.isArray(policy.prices)||policy.prices.length!==baseConfig.tiers.length)throw new Error('Invalid price trial');
 const tiers=baseConfig.tiers.map((tier,i)=>({...tier,cost:policy.prices[i]}));
 if(policy.earlyPrices!==undefined){
  if(!Array.isArray(policy.earlyPrices)||policy.earlyPrices.length!==4||policy.earlyPrices.some((v,i)=>!Number.isSafeInteger(v)||v<=0||(i>0&&v<policy.earlyPrices[i-1])))throw new Error('Invalid early prices');
  tiers.splice(0,1,...policy.earlyPrices.map((cost,i)=>({through:5+i,cost,level:baseConfig.tiers[0].level})));
 }
 return validateLandExpansionConfig({...structuredClone(LAND_EXPANSION_CONFIG),tiers});
}
const premiumPrices=Object.fromEntries(evaluateCraftingPrices(CRAFTING_PRICE_POLICIES[2]).recipes.map(r=>[r.id,r.sell]));
export const EXPANSION_PLAY_PROFILES=[{id:'crops',mode:'crops'},{id:'orders',mode:'orders'},{id:'combined-current',mode:'combined'},{id:'combined-premium20',mode:'combined',recipePrices:premiumPrices},{id:'all-animals',mode:'combined',animalSpecies:['chicken','duck','pig','cow','sheep']}];
export function summarizeExpansionTrial(result) {
 let previous=0;
 const unlocks=result.unlocks.map(e=>{const gap=e.activeMinutes-previous;previous=e.activeMinutes;return {...e,gapMinutes:gap,group:e.tiles<=8?'5-8':e.tiles<=12?'9-12':e.tiles<=18?'13-18':'19-24'};});
 const groups=['5-8','9-12','13-18','19-24'].map((id,i)=>{
  const events=unlocks.filter(e=>e.group===id),expected=[4,4,6,6][i],bounds=i===0?[15,30]:i===1?[30,60]:null;
  return {id,observed:events.length,expected,complete:events.length===expected,minMinutes:events.length?Math.min(...events.map(e=>e.gapMinutes)):null,maxMinutes:events.length?Math.max(...events.map(e=>e.gapMinutes)):null,withinTarget:bounds?events.filter(e=>e.gapMinutes>=bounds[0]&&e.gapMinutes<=bounds[1]).length:null};
 });
 const milestones=Object.fromEntries([8,12,18,24].map(n=>{const e=unlocks.find(e=>e.tiles===n);return [n,e?{minutes:e.activeMinutes,session:e.session}:null];}));
 return {tiles:result.tiles,coins:result.coins,minCoins:result.minCoins,milestones,groups,unlocks,reserveViolations:unlocks.filter(e=>e.coinsAfter<e.reserveRequired).length};
}
export function runExpansionTrial(policy,options={}) {
 const config=expansionTrialConfig(policy);
 const simulation=simulateCombinedFarm({...options,expansionConfig:config});
 return {policy:policy.id,inputs:simulation.inputs,prices:policy.prices,earlyPrices:policy.earlyPrices??null,summary:summarizeExpansionTrial(simulation),ledger:simulation.ledger,rows:simulation.rows};
}
