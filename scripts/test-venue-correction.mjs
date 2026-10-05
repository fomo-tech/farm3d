import assert from 'node:assert/strict';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { FarmWorld } from '../src/game/world/FarmWorld.js';
const fake = {
  currentVenue: 'casino',
  player: { root: { position: new Vector3(210,32,-220.5) }, stop() {} },
  syncVenueFromPosition(position) { this.currentVenue = position.venue || null; },
};
FarmWorld.prototype.correctPlayerPosition.call(fake, { x:12,y:0,z:42,venue:null,accepted:false });
assert.equal(fake.currentVenue, null, 'server correction must also restore outdoor state');
assert.equal(fake.player.root.position.y, 0);
FarmWorld.prototype.correctPlayerPosition.call(fake, { x:0,y:0,z:0,venue:'casino',accepted:false });
assert.equal(fake.currentVenue, 'casino');
assert.equal(fake.player.root.position.x, 210);
assert.equal(fake.player.root.position.y, 32);
console.log('PASS: authoritative corrections synchronize coordinates and venue, including legacy room saves.');
