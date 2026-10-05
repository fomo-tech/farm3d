import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Polyfill minimal OffscreenCanvas for Babylon DynamicTexture under Node.js NullEngine
if (typeof globalThis.OffscreenCanvas === 'undefined') {
  globalThis.OffscreenCanvas = class OffscreenCanvas {
    constructor(width, height) {
      this.width = width || 1024;
      this.height = height || 1024;
    }
    getContext() {
      const gradMock = { addColorStop() {} };
      return new Proxy({}, {
        get(target, prop) {
          if (prop === 'createRadialGradient' || prop === 'createLinearGradient') {
            return () => gradMock;
          }
          if (prop === 'measureText') {
            return () => ({ width: 100 });
          }
          if (typeof target[prop] === 'function') {
            return target[prop];
          }
          return () => {};
        },
        set(target, prop, val) {
          target[prop] = val;
          return true;
        },
      });
    }
  };
}

import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { createModernBoulevard, createModernBoulevardSteps } from '../src/game/world/createModernRoadSystem.js';
import { FrameBudgetScheduler } from '../src/game/engine/FrameBudgetScheduler.js';

const engine = new NullEngine();
const options = { id: 'parity', length: 232, intersections: [{ pos: 20, width: 7.5 }] };
const direct = new Scene(engine);
const sliced = new Scene(engine);
createModernBoulevard(direct, options);
const steps = createModernBoulevardSteps(sliced, options);
let result, yields = 0, previous = 0, largest = 0;
do {
  result = steps.next();
  largest = Math.max(largest, sliced.meshes.length - previous);
  previous = sliced.meshes.length;
  if (!result.done) yields++;
} while (!result.done);
assert.ok(yields > 30, 'road construction must cooperate, not drain its generator synchronously');
assert.ok(largest <= 12, 'a road slice must not build the entire street');
const signature = scene => scene.meshes.map(mesh => {
  mesh.computeWorldMatrix(true);
  return [mesh.name, mesh.getTotalVertices(), mesh.getTotalIndices(), ...mesh.getWorldMatrix().m];
});
assert.deepEqual(signature(sliced), signature(direct), 'slicing must preserve exact road geometry and transforms');
const world = await readFile(new URL('../src/game/world/FarmWorld.js', import.meta.url), 'utf8');
assert.ok(world.indexOf('if (!this.bootReady && !this.bootFrameRequested)') < world.indexOf('this.scene.render();'), 'covered loading canvas must not draw partially-built world every frame');
const pipeline = world.slice(world.indexOf('async startWorldBootPipeline()'),world.indexOf('async populateBackgroundScenery()'));
assert.ok(pipeline.indexOf('await this.renderIndex.ready') < pipeline.indexOf('await waitForRenderedFrame();'), 'first visible draw must wait for spatial index');
assert.equal((world.match(/= installNearbyShadows\(/g)||[]).length,1,'shadow observer must only be installed once');
for (const name of ['createBusRoute', 'createFarmAnimals', 'createGrandWindingRiver']) {
  assert.match(world, new RegExp(`yield\\* ${name}Steps\\(`));
  assert.ok(!new RegExp(`= ${name}\\(`).test(world), `boot must not call synchronous ${name}`);
}
const openWorld = await readFile(new URL('../src/game/world/createOpenWorld.js', import.meta.url), 'utf8');
for (const name of ['createPlayTogetherPlaza', 'createFarmersMarket']) {
  assert.match(openWorld, new RegExp(`yield\\* ${name}Steps\\(`));
  assert.ok(!new RegExp(`= ${name}\\(`).test(openWorld));
}
assert.ok(!/\bcreateModernBoulevard\(/.test(openWorld), 'all urban road call sites must use the sliced builder');
const scheduler = new FrameBudgetScheduler(1);
function* tagged() { yield 'precise boot stage'; return true; }
scheduler.enqueue(tagged(), 1, 'generic boot');
while (scheduler.getPendingCount()) scheduler.update();
assert.ok(scheduler.getStats().slowestStep?.label);
direct.dispose(); sliced.dispose(); engine.dispose();
console.log(`PASS: ${yields} road slices, <=${largest} meshes/slice, exact geometry parity and cooperative boot wiring`);
