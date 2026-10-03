import assert from 'node:assert/strict';
import { VENUE_LAYOUT } from '../shared/venueLayout.js';
import { CASINO_CHOICES, casinoPayout, casinoState, placeCasinoBet, tickCasino } from '../server/CasinoRooms.js';

for (const [name, venue] of Object.entries(VENUE_LAYOUT)) {
  assert.ok(Number.isFinite(venue.entrance.x) && Number.isFinite(venue.entrance.z), `${name}: entrance`);
  assert.ok(Math.hypot(venue.exit.x - venue.entrance.x, venue.exit.z - venue.entrance.z) < 3, `${name}: exit near same door`);
  assert.ok(venue.interior.y > 20, `${name}: separate interior`);
}
const facades = {
  casino: [-29, -25, Math.PI * .25 + .1],
  fashion: [29, -25, -Math.PI * .25 - .1],
  vehicles: [-29, 25, Math.PI * .75 - .1],
  supplies: [29, 25, -Math.PI * .75 + .1],
  fishing: [135, 6, -Math.PI / 2],
};
for (const [name, [x, z, rotation]] of Object.entries(facades)) {
  const expected = { x: x + Math.sin(rotation) * 6.5, z: z + Math.cos(rotation) * 6.5 };
  assert.ok(Math.hypot(VENUE_LAYOUT[name].entrance.x - expected.x, VENUE_LAYOUT[name].entrance.z - expected.z) < .6, `${name}: door aligns with facade`);
}
assert.deepEqual(CASINO_CHOICES['tai-xiu'], ['tai', 'xiu']);
assert.equal(CASINO_CHOICES['bau-cua'].length, 6);
assert.equal(casinoPayout('tai-xiu', { winner: 'tai' }, { choice: 'tai', amount: 50 }), 100);
assert.equal(casinoPayout('tai-xiu', { winner: 'xiu' }, { choice: 'tai', amount: 50 }), 0);
assert.equal(casinoPayout('bau-cua', { symbols: ['bau', 'cua', 'bau'] }, { choice: 'bau', amount: 10 }), 30);
assert.equal(casinoPayout('bau-cua', { symbols: ['bau', 'cua', 'bau'] }, { choice: 'ga', amount: 10 }), 0);
assert.match((await placeCasinoBet('test', 'tai-xiu', 'tai', 10, 'old-round')).error, /khóa cược/);
assert.match((await placeCasinoBet('test', 'bau-cua', 'invalid', 10, 'old-round')).error, /không hợp lệ/);
const first = casinoState();
assert.equal(first['tai-xiu'].phase, 'open');
assert.equal(first['bau-cua'].phase, 'open');
const actualNow = Date.now;
try {
  Date.now = () => Math.max(first['tai-xiu'].closesAt, first['bau-cua'].closesAt) + 1;
  assert.equal(await tickCasino(() => {}), true);
  const settled = casinoState();
  assert.equal(settled['tai-xiu'].phase, 'result');
  assert.equal(settled['bau-cua'].phase, 'result');
  assert.equal(settled['tai-xiu'].result.dice.length, 3);
  assert.equal(settled['bau-cua'].result.symbols.length, 3);
  Date.now = () => Math.max(settled['tai-xiu'].resultUntil, settled['bau-cua'].resultUntil) + 1;
  await tickCasino(() => {});
  assert.notEqual(casinoState()['tai-xiu'].id, first['tai-xiu'].id);
} finally { Date.now = actualNow; }
console.log('PASS: shared shop doors and online casino payout rules.');
