import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {cityActionAllowed,CITY_PANELS,REMOVED_WORLD_MESSAGES} from '../shared/cityOnlyPolicy.js';
import {performAction} from '../server/GameStore.js';
import {GAME_WORLD_MODE,IS_CITY_MODE} from '../src/game/world/gameMode.js';
assert.equal(GAME_WORLD_MODE,'city');assert.equal(IS_CITY_MODE,true);
const retired=['buy_land','farm_gate','select_crop','sell_item','deliver_order','claim_quest','claim_mission','craft','sell_product','unlock_plot','upgrade_land','upgrade_barn','upgrade_home','harvest_apples','claim_seeds','advance_onboarding','complete_onboarding','reset_onboarding','build_pen','buy_animal','feed_animals','collect_animals','steal_livestock_start','fishing_cast','fishing_equip','lottery_buy'];
for(const action of retired){
 assert.equal(cityActionAllowed(action),false,action);
 const result=await performAction('test-retired-gameplay',action,{},{});
 assert.ok(result.error,`${action} must fail before touching database`);
}
for(const panel of ['farm','land','shop','orders','factory','upgrade','livestock','fishing','quests'])assert.equal(CITY_PANELS.has(panel),false);
for(const type of ['farm_action','land_market','mailbox_heart'])assert.ok(REMOVED_WORLD_MESSAGES.has(type));
const world=await readFile(new URL('../src/game/world/createOpenWorld.js',import.meta.url),'utf8');
assert.ok(world.includes('createVibeCityMapSteps'));assert.equal(/createFarmersMarket|createModernFarmhouse|createRomanticLake/.test(world),false);
const store=await readFile(new URL('../server/GameStore.js',import.meta.url),'utf8');
assert.equal(/action === '(select_crop|deliver_order|claim_seeds|unlock_plot|fishing_cast)'/.test(store),false);
console.log('PASS city-only: retired actions fail without DB, retired menus/RPCs disabled, no farm fallback or legacy world builder');
