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
streamer.dispose();
console.log('PASS: chunk detail, far LOD, eviction and return traversal');
