import assert from 'node:assert/strict';
import { WorldChunkStreamer } from '../src/game/world/WorldChunkStreamer.js';

const events = [];
const streamer = new WorldChunkStreamer({ detailRadius: 1, keepRadius: 2, maxDetailed: 2 });
streamer.register('near', 10, 10, {
  load: () => { events.push('load near'); return true; },
  unload: () => events.push('unload near'),
  showLod: () => events.push('lod near'),
  hideLod: () => events.push('detail near'),
});
streamer.register('far', 500, 500, {
  load: () => { events.push('load far'); return true; },
  unload: () => events.push('unload far'),
  showLod: () => events.push('lod far'),
  hideLod: () => events.push('detail far'),
});
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
streamer.update({ x: 0, z: 0 }, { x: 1, z: 0 }, 1000);
await flush();
assert.equal(streamer.entries.get('near').state, 'ready');
assert.equal(streamer.entries.get('far').state, 'unloaded');
assert.ok(events.includes('detail near'));
streamer.update({ x: 500, z: 500 }, { x: 1, z: 1 }, 1200);
await flush();
assert.equal(streamer.entries.get('near').state, 'unloaded');
assert.equal(streamer.entries.get('far').state, 'ready');
assert.ok(events.includes('unload near'));
assert.ok(events.includes('lod near'));

// A slow model load must not replace the visible proxy after the player leaves.
let finishSlowLoad;
const slow = new WorldChunkStreamer({ detailRadius: 0, keepRadius: 1 });
const slowEvents = [];
slow.register('slow', 0, 0, {
  load: () => new Promise(resolve => { finishSlowLoad = resolve; }),
  unload: () => slowEvents.push('unload'),
  showLod: () => slowEvents.push('proxy'),
  hideLod: () => slowEvents.push('detail'),
});
slow.update({ x: 0, z: 0 }, undefined, 1000);
await flush();
slow.update({ x: 500, z: 500 }, undefined, 1200);
finishSlowLoad(true);
await flush();
assert.equal(slow.entries.get('slow').state, 'unloaded');
assert.equal(slowEvents.at(-1), 'proxy');
slow.dispose();
streamer.dispose();
console.log('PASS: chunk detail, far LOD, eviction and return traversal');
