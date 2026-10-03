import assert from 'node:assert/strict';
import { FarmStreamingGrid } from '../src/game/world/FarmStreamingGrid.js';
import { WORLD_LAYOUT } from '../src/game/world/worldLayout.js';
import { FarmWorld } from '../src/game/world/FarmWorld.js';

const grid = new FarmStreamingGrid(WORLD_LAYOUT.farms);
const chunks = new Map();
let previous = new Set();
for (const farm of WORLD_LAYOUT.farms) {
  const position = { x: farm.x, z: farm.z - 14 };
  for (const id of previous) chunks.set(id, { wantsDetail: true });
  const selected = grid.select(position, chunks, WORLD_LAYOUT.farms[0].id);
  assert.ok(selected.has(farm.id), `nearby ${farm.id} must replace older active farms`);
  assert.ok(selected.size <= 7, 'six neighbours plus pinned owner');
  assert.ok(selected.has(WORLD_LAYOUT.farms[0].id));
  previous = selected;
}
// Negative coordinates and boundary hysteresis must work too.
const small = new FarmStreamingGrid([{ id: 'a', x: -100, z: -100 }]);
assert.equal(small.select({ x: -5, z: -100 }, new Map()).has('a'), true);
assert.equal(small.select({ x: 0, z: -100 }, new Map()).has('a'), false);
assert.equal(small.select({ x: 0, z: -100 }, new Map([['a', { wantsDetail: true }]])).has('a'), true);
assert.equal(small.select({ x: 20, z: -100 }, new Map([['a', { wantsDetail: true }]])).has('a'), false);
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
