import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { applyGrainRows } from '../src/game/world/TextureGrain.js';
const width = 64, height = 64;
const base = new Uint8ClampedArray(width * height * 4).fill(140);
const expected = base.slice();
applyGrainRows(expected, width, height);
const sliced = base.slice();
for (let y = 0; y < height; y += 2) applyGrainRows(sliced, width, height, y, y + 2);
assert.deepEqual(sliced, expected);
for (let i = 3; i < expected.length; i += 4) assert.equal(expected[i], 140, 'alpha unchanged');
// Execute the production grain algorithm on an actual background thread.
const url = new URL('../src/game/world/TextureGrain.js', import.meta.url).href;
const worker = new Worker(new URL(`data:text/javascript,${encodeURIComponent(`
  import { parentPort } from 'node:worker_threads';
  import { applyGrainRows } from '${url}';
  parentPort.on('message', ({buffer,width,height}) => {
    applyGrainRows(new Uint8ClampedArray(buffer),width,height);
    parentPort.postMessage(buffer,[buffer]);
  });` )}`), { type: 'module' });
try {
  const result = new Promise((resolve, reject) => { worker.once('message', resolve); worker.once('error', reject); });
  const input = base.slice();
  worker.postMessage({ buffer: input.buffer, width, height }, [input.buffer]);
  assert.equal(input.byteLength, 0, 'transfer avoids duplicate pixel buffer');
  assert.deepEqual(new Uint8ClampedArray(await result), expected);
} finally { await worker.terminate(); }
console.log('PASS: worker transfer, deterministic pixel output and cooperative fallback parity');
