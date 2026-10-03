import assert from 'node:assert/strict';
import { selectNearbyShadowCasters } from '../src/game/rendering/NearbyShadowCasters.js';
const mesh = (x, z, enabled = true, radius = 1) => ({
  isDisposed: () => false, isEnabled: () => enabled, isVisible: true,
  getBoundingInfo: () => ({ boundingSphere: { centerWorld: { x, y: 0, z }, radiusWorld: radius } }),
});
const near = mesh(5, 0), far = mesh(500, 0), disabled = mesh(0, 0, false), large = mesh(100, 0, true, 15);
assert.deepEqual(selectNearbyShadowCasters([near, far, disabled, large], { x: 0, y: 0, z: 0 }), [near, large]);
assert.deepEqual(selectNearbyShadowCasters([near, far], { x: 500, y: 0, z: 0 }), [far]);
console.log('PASS: nearby shadow casters, disabled objects, large bounds and moved player');
