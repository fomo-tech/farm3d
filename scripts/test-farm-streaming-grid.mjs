import assert from 'node:assert/strict';
import { FarmStreamingGrid } from '../src/game/world/FarmStreamingGrid.js';
import { WORLD_LAYOUT } from '../src/game/world/worldLayout.js';
import { FarmWorld } from '../src/game/world/FarmWorld.js';
import { readFileSync } from 'node:fs';

// Exercise the actual render-loop visibility block even before parcel roots
// exist; this previously crashed cold mobile boots with an undefined estate.
const source = readFileSync(new URL('../src/game/world/FarmWorld.js',import.meta.url),'utf8');
const visibility = source.slice(source.indexOf('WORLD_LAYOUT.farms.forEach(farm => {',source.indexOf("stage('farm visibility')")));
const block = visibility.slice(visibility.indexOf('{')+1, visibility.indexOf('const chunk ='));
const execute = new Function('farm','player',block);
const visibleRoot = {enabled:true,isEnabled(){return this.enabled;},setEnabled(value){this.enabled=value;}};
const visibilityWorld = {isMobile:false,playerFarmId:null,farmEstateRoots:new Map()};
execute.call(visibilityWorld,{id:'none',x:0,z:0},{root:{position:{x:0,z:0}}});
visibilityWorld.farmEstateRoots.set('farm',visibleRoot);
execute.call(visibilityWorld,{id:'farm',x:0,z:0},{root:{position:{x:1000,z:0}}});
assert.equal(visibleRoot.enabled,false);
execute.call(visibilityWorld,{id:'farm',x:0,z:0},{root:{position:{x:0,z:0}}});
assert.equal(visibleRoot.enabled,true);

const grid = new FarmStreamingGrid(WORLD_LAYOUT.farms);
const chunks = new Map();
let previous = new Set();
for (const farm of WORLD_LAYOUT.farms) {
  const position = { x: farm.x, z: farm.z - 14 };
  for (const id of previous) chunks.set(id, { wantsDetail: true });
  const selected = grid.select(position, chunks, WORLD_LAYOUT.farms[0].id);
  assert.ok(selected.has(farm.id), `nearby ${farm.id} must replace older active farms`);
  assert.ok(selected.size <= 17, 'sixteen nearby detailed estates plus cached owner');
  assert.ok(selected.has(WORLD_LAYOUT.farms[0].id));
  previous = selected;
}
// Negative coordinates and boundary hysteresis must work too.
const small = new FarmStreamingGrid([{ id: 'a', x: -100, z: -100 }]);
assert.equal(small.select({ x: -21, z: -100 }, new Map()).has('a'), true);
assert.equal(small.select({ x: -15, z: -100 }, new Map()).has('a'), false);
assert.equal(small.select({ x: -15, z: -100 }, new Map([['a', { wantsDetail: true }]])).has('a'), true);
assert.equal(small.select({ x: 1, z: -100 }, new Map([['a', { wantsDetail: true }]])).has('a'), false);
const phoneGrid = new FarmStreamingGrid([{ id: 'a', x: 0, z: 0 }], 64, { mobile: true });
assert.equal(phoneGrid.select({ x: 61, z: 0 }, new Map()).size, 0);
assert.equal(phoneGrid.select({ x: 59, z: 0 }, new Map()).size, 1);
const built = [];
const fakeWorld = {
  playerFarmId: 'own', farmChunks: new Map([['near', { wantsDetail: true }], ['far', { wantsDetail: false }]]),
  ensureDetailedFarm: () => {}, ensureFarmBuildings: (...args) => built.push(args),
  updateFarmSigns: () => {}, applyRemoteFarmSync: () => {},
};
FarmWorld.prototype.applyPublicFarmScope.call(fakeWorld,
  [{ farmId: 'near', userName: 'Neighbour', homeTier: 2 }, { farmId: 'far', userName: 'Far' }], {});
assert.deepEqual(built, [['near', 2, 1, 'Neighbour']], 'late network scope populates active buildings only');
console.log('PASS: all 288 farm approaches promote detail, old farms cannot block nearby lots, bounded selection and hysteresis');
