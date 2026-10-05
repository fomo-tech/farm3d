import assert from 'node:assert/strict';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { FarmWorld } from '../src/game/world/FarmWorld.js';
let stops = 0;
let enabled = true;
const fake = {
  currentVenue: 'casino', casinoVisible: true, casinoScreenActive: true,
  camera: {},
  player: { root: { position: new Vector3(), rotation: {}, setEnabled(value) { enabled = value; } }, stop() { stops++; }, setVirtualInput() {} },
  casinoTable: { update() {}, setEnabled() {} },
  focusCasinoTable(game) { FarmWorld.prototype.focusCasinoTable.call(this, game); },
};
const room = { game: 'tai-xiu' };
FarmWorld.prototype.setCasinoRoom.call(fake, room);
assert.equal(stops, 1);
FarmWorld.prototype.setCasinoRoom.call(fake, room);
assert.equal(stops, 1, 'repeated server snapshots must not clear held movement keys');
FarmWorld.prototype.setCasinoScreenActive.call(fake, false);
assert.equal(enabled, true);
assert.equal(fake.focusedCasinoTable, null);
const position = fake.player.root.position.clone();
FarmWorld.prototype.setCasinoRoom.call(fake, room);
assert.equal(stops, 1, 'closed casino screen must not stop movement');
assert.ok(position.equals(fake.player.root.position), 'closed screen must not teleport player');
assert.equal(fake.camera.upperBetaLimit, 1.35);
console.log('PASS: server snapshots preserve held WASD; closing table restores avatar and exploration camera.');
