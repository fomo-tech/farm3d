import assert from 'node:assert/strict';
import {CRAFTING_PRICE_POLICIES,evaluateCraftingPrices} from './economy/craftingPriceTrials.js';
import {NPC_TRADING_CONFIG} from '../shared/npcTradingConfig.js';
const snapshot=JSON.stringify(NPC_TRADING_CONFIG);
for(const p of CRAFTING_PRICE_POLICIES){const r=evaluateCraftingPrices(p);assert(r.verifiedNoNpcProfit);assert(r.orderCycleMargin<0);for(const a of r.recipes){if(a.npcCost!==null){assert(a.npcMargin<0);assert(a.wholePackMaxProfit<0);}if(p.premium!==null)assert(a.margin>0);}}
assert.deepEqual(evaluateCraftingPrices(CRAFTING_PRICE_POLICIES[2]).recipes.map(r=>r.sell),[72,96,288]);
assert.throws(()=>evaluateCraftingPrices({id:'bad',premium:NaN}));
assert.equal(JSON.stringify(NPC_TRADING_CONFIG),snapshot);
console.log('PASS price trials: positive production margin, fractional/whole pack NPC bounds, order-reset loss and unchanged production config.');
