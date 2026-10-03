import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { calculateRenderDpr, RenderResolutionController, readGraphicsQuality } from '../src/game/rendering/GraphicsSettings.js';
import { createToyMaterial } from '../src/game/rendering/PlayTogetherTheme.js';

assert.equal(readGraphicsQuality(), 'ultra');
assert.equal(calculateRenderDpr({ nativeDpr: 2, width: 1280, height: 720 }), 2);
assert.equal(calculateRenderDpr({ quality: 'ultra', nativeDpr: 1, width: 1920, height: 1080, scale: .75 }), 1);
for (const quality of ['ultra', 'balanced', 'eco']) {
  const dpr = calculateRenderDpr({ quality, nativeDpr: 3, width: 1920, height: 1080 });
  assert.ok(dpr >= .5 && dpr <= 2);
}
const adaptive = new RenderResolutionController();
for (let i = 0; i < 200; i++) adaptive.sample(30);
// Current crisp-render policy preserves native scale above 30 FPS.
assert.equal(adaptive.scale, 1);
for (let i = 0; i < 125; i++) adaptive.sample(40);
assert.equal(adaptive.scale, .95);
adaptive.sample(5000);
assert.equal(adaptive.scale, .95);
for (let i = 0; i < 2000; i++) adaptive.sample(40);
assert.equal(adaptive.scale, .85);
for (let i = 0; i < 4000; i++) adaptive.sample(16);
assert.equal(adaptive.scale, 1);

const engine = new NullEngine();
const scene = new Scene(engine);
const first = createToyMaterial(scene, 'test', '#68b88a');
assert.equal(first, createToyMaterial(scene, 'test', '#68b88a'));
const variant = createToyMaterial(scene, 'test', '#68b88a', { specularLevel: .5 });
assert.notEqual(first, variant);
assert.equal(first.specularColor.r, .18);
const secondScene = new Scene(engine);
assert.notEqual(first, createToyMaterial(secondScene, 'test', '#68b88a'));
first.dispose();
assert.notEqual(first, createToyMaterial(scene, 'test', '#68b88a'));
scene.dispose();
secondScene.dispose();
engine.dispose();
console.log('PASS: render resolution, adaptive hysteresis, material variants and scene/disposal isolation');
