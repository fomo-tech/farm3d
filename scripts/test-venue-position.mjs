import assert from 'node:assert/strict';
import { normalizeVenuePosition } from '../shared/venuePosition.js';
import { VENUE_LAYOUT } from '../shared/venueLayout.js';
for (const [venue, { interior }] of Object.entries(VENUE_LAYOUT)) {
  const restored = normalizeVenuePosition({ x: 0, y: 0, z: 0, venue });
  assert.equal(restored.x, interior.x);
  assert.equal(restored.y, interior.y);
  assert.equal(restored.z, interior.z - 5.5);
  assert.equal(normalizeVenuePosition(restored), restored);
}
const outdoor = { x: 12, y: 0, z: 42, venue: null };
assert.equal(normalizeVenuePosition(outdoor), outdoor);
assert.equal(normalizeVenuePosition({ ...outdoor, venue: 'unknown' }).venue, null);
console.log('PASS: stale indoor saves restore inside the correct room; outdoor positions stay unchanged.');
