import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { avatarAppearance, OUTFIT_COLORS } from '../shared/avatarAppearance.js';
for (const outfit of Object.keys(OUTFIT_COLORS)) {
  assert.equal(avatarAppearance(outfit).outfitColor, OUTFIT_COLORS[outfit]);
  assert.equal(avatarAppearance(outfit).skinColor, '#e6b08f');
}
const custom = { skinColor: '#a57355', hairColor: '#123456', topColor: '#000000' };
assert.equal(avatarAppearance('starter', custom).customization, custom);
assert.equal(avatarAppearance('starter', custom).skinColor, custom.skinColor);
assert.equal(avatarAppearance('unknown').outfitId, 'starter');
const world = readFileSync(new URL('../src/game/world/FarmWorld.js', import.meta.url), 'utf8');
assert.ok(!world.includes('REMOTE_COLORS'), 'No connection-order random clothing');
assert.ok(world.includes('avatarAppearance(player.outfit, player.customization)'));
const server = readFileSync(new URL('../server/index.js', import.meta.url), 'utf8');
assert.ok(server.includes("client.outfit = account.progress?.outfit || 'starter'"));
console.log('PASS: shared local/remote defaults, outfit colors, customization and server join appearance');
