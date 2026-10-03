import assert from 'node:assert/strict';
import { ModelSpawnQueue } from '../src/game/rendering/ModelSpawnQueue.js';
const scheduled = [];
const queue = new ModelSpawnQueue(callback => scheduled.push(callback));
const order = [];
const jobs = [];
for (let i = 0; i < 20; i++) jobs.push(queue.request(0).then(ok => { if (ok) order.push('flower'); }));
jobs.push(queue.request(100).then(ok => { if (ok) order.push('house'); }));
scheduled.shift()(); await Promise.resolve();
assert.deepEqual(order, ['house'], 'nearby house must bypass decorative backlog');
scheduled.shift()(); await Promise.resolve();
assert.equal(order.length, 5, 'small props are bounded to four per tick');
while (scheduled.length) { scheduled.shift()(); await Promise.resolve(); }
await Promise.all(jobs);
let cancelled = 0;
for (let i = 0; i < 10; i++) queue.request(0, () => false).then(ok => { if (!ok) cancelled++; });
const valid = queue.request(20);
while (scheduled.length) { scheduled.shift()(); await Promise.resolve(); }
assert.equal(await valid, true); assert.equal(cancelled, 10);
const pending = queue.request(); queue.dispose();
assert.equal(await pending, false);
assert.equal(await queue.request(), false);
console.log('PASS: critical model priority, four-small-prop budget, stale job skip and disposal');
