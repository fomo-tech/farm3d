import assert from 'node:assert/strict';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { FarmWorld } from '../src/game/world/FarmWorld.js';

globalThis.window = { __farmDebug: { report() {} } };
let stops = 0;
const fake = {
  currentVenue: null,
  player: { root: { position: new Vector3(12.2, 0, 42), rotation: {} }, stop() { stops++; } },
};
const correct = state => FarmWorld.prototype.correctPlayerPosition.call(fake, state);
correct({ accepted: false, x: 12, y: 0, z: 42, venue: null });
assert.equal(fake.player.root.position.x, 12, 'Small rejected displacement must not be ignored');
fake.player.root.position.x = 14;
correct({ accepted: false, x: 12, y: 0, z: 42, venue: null });
assert.equal(fake.player.root.position.x, 12, 'Rejects must not leave a partially invalid position');
fake.player.root.position.x = 13;
correct({ accepted: true, x: 12, y: 0, z: 42, venue: null });
assert.equal(fake.player.root.position.x, 13, 'Accepted delayed echoes do not rewind local movement');
assert.equal(stops, 0, 'Same-space corrections keep held WASD active');
console.log('PASS: small/large rejection recovery, accepted echoes and held movement preservation');
