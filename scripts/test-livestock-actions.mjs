import assert from 'node:assert/strict';
import { applyLivestockAction as act } from '../shared/livestockActions.js';
import { FARM_CONFIG } from '../shared/farmConfig.js';
const player = () => ({ progress: { coins: 5000, xp: 0, stats: { animalsFed: 0 }, inventory: {}, barnLevel: 1 }, livestock: [] });
const p = player(); let serial = 0;
for (const species of Object.keys(FARM_CONFIG.animals)) {
  assert.throws(() => act(p, 'buy_animal', { species }), /xây chuồng/);
  act(p, 'build_pen', { species });
  act(p, 'buy_animal', { species }, 100, () => String(++serial));
}
act(p, 'feed_animals', {}, 100);
const times = p.livestock.map(a => a.productReadyAt);
assert.throws(() => act(p, 'feed_animals', {}, 200), /thu sản phẩm/);
assert.deepEqual(p.livestock.map(a => a.productReadyAt), times);
assert.throws(() => act(p, 'sell_animal', { id: '3' }, 101), /chưa trưởng/);
act(p, 'collect_animals', {}, 700000);
assert.deepEqual(p.progress.inventory, { egg: 1, duckEgg: 1, milk: 1, wool: 1 });
const coins = p.progress.coins;
act(p, 'sell_animal', { id: '3' }, 700000);
assert.equal(p.progress.coins, coins + FARM_CONFIG.products.maturePig.sellPrice);
assert.throws(() => act(p, 'sell_animal', { id: '3' }, 700000));
for (let i=0;i<2;i++) act(p, 'buy_animal', { species:'chicken' }, 100, () => String(++serial));
assert.throws(() => act(p, 'buy_animal', { species:'chicken' }), /đầy/);
const poor = player(); poor.progress.coins = 0;
assert.throws(() => act(poor, 'build_pen', { species:'cow' }), /xu/);
assert.equal(poor.progress.animalPens, undefined);
console.log('PASS livestock: five species, pens, prices, capacity, preserved production, collect and pig sale');
