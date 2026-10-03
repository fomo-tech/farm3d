import assert from 'node:assert/strict';
import { transitHudSnapshot, sameTransitHud, recordReactCommit } from '../src/game/rendering/HudRuntime.js';
assert.equal(transitHudSnapshot({ activeRide: null, nearbyBoardable: null }), null);
const ride = { busId: 'bus1', routeName: 'Test', speed: 14, nextStation: 'Lake',
  get busRoot() { throw new Error('HUD must never read the engine graph'); },
  get passengerSeatNode() { throw new Error('HUD must never read engine nodes'); } };
const a = transitHudSnapshot({ activeRide: ride });
const b = transitHudSnapshot({ activeRide: { ...a.activeRide } });
assert.equal(sameTransitHud(a, b), true);
assert.equal(sameTransitHud(a, transitHudSnapshot({ activeRide: { ...a.activeRide, speed: 15 } })), false);
assert.equal('busRoot' in a.activeRide, false);
const reports = [];
globalThis.window = { __farmDebug: { report: (...args) => reports.push(args) } };
for (let i = 0; i < 100; i++) recordReactCommit('HUD', 'update', 150, 180);
assert.equal(window.__farmReactMetrics.slow.length, 40);
assert.equal(window.__farmReactMetrics.commits, 100);
assert.equal(reports.at(-1)[1], 'SLOW REACT COMMIT');
delete globalThis.window;
console.log('PASS: idle HUD dedup, engine graph isolation, displayed-field changes and bounded React attribution');
