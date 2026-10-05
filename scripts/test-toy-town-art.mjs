import assert from 'node:assert/strict';
import { VILLAGE_THEME_GROUPS, WORLD_PALETTE } from '../src/game/world/worldDesignSystem.js';
import { SHOP_CONFIG } from '../shared/shopConfig.js';
import { CHARACTER_RENDER_CONFIG } from '../shared/characterConfig.js';

const luminance = hex => {
  const channels = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
};
assert.equal(new Set(Object.values(VILLAGE_THEME_GROUPS).map(theme => theme.accentColor)).size, 6);
for (const theme of Object.values(VILLAGE_THEME_GROUPS)) {
  assert.ok(luminance(theme.signBg) > .8, `${theme.name}: readable cream sign`);
  assert.ok(Object.isFrozen(theme));
}
for (const kind of ['supplies', 'fashion', 'vehicles', 'fishing', 'casino']) {
  assert.ok(luminance(SHOP_CONFIG[kind].wall) > .85, `${kind}: bright frontage`);
  for (const field of ['roof', 'accent']) {
    const channels = SHOP_CONFIG[kind][field].slice(1).match(/../g).map(value => parseInt(value, 16) / 255);
    const saturation = (Math.max(...channels) - Math.min(...channels)) / Math.max(...channels);
    assert.ok(saturation < .4, `${kind} ${field}: muted rather than neon`);
  }
}
assert.ok(luminance(WORLD_PALETTE.wallPlaster) > .85);
assert.ok(CHARACTER_RENDER_CONFIG.proportions.headScale >= .7);
console.log('PASS: six distinct pastel districts, bright storefronts and shared avatar art proportions.');
