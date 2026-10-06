import assert from 'node:assert/strict';
import { buildInventoryView } from '../shared/inventoryView.js';

const fresh = buildInventoryView({ barnLevel: 0, inventory: { carrot: 0, milk: 0 }, ownedOutfits: ['starter'] });
assert.equal(fresh.used, 0);
assert.equal(fresh.capacity, 20);
assert.deepEqual(fresh.entries.map(item => item.id), ['fashion:starter']);
const player = buildInventoryView({ barnLevel: 1, inventory: { carrot: 3, milk: 2 }, ownedOutfits: ['starter'],
  fishing: { ownedRods: ['rod_bamboo'], bait: { bait_worm: 4 }, fish: { carp: { count: 2 } } } });
assert.equal(player.used, 5, 'gear, clothes and fish do not consume barn capacity');
assert.equal(player.capacity, 20);
assert.equal(player.entries.find(item => item.id === 'produce:carrot').count, 3);
assert.equal(player.entries.find(item => item.id === 'fish:carp').count, 2);
const customization = buildInventoryView({ barnLevel: 0, ownedCustomization: ['unknown-owned-item'] });
assert.equal(customization.entries.find(item => item.id === 'customization:unknown-owned-item').count, 1);
assert.equal(customization.used, 0);
assert.ok(!player.entries.some(item => ['watering_can', 'wood_chair', 'blue_fish'].includes(item.itemId)), 'demo inventory is absent');
console.log('PASS: inventory shows only owned items and correct barn capacity.');
