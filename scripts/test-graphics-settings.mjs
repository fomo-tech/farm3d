import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { calculateRenderDpr, RenderResolutionController, readGraphicsQuality, AutoGraphicsController } from '../src/game/rendering/GraphicsSettings.js';
import { createToyMaterial } from '../src/game/rendering/PlayTogetherTheme.js';

assert.equal(readGraphicsQuality(), 'auto');
assert.equal(calculateRenderDpr({ nativeDpr: 2, width: 1280, height: 720 }), 2);
assert.equal(calculateRenderDpr({ quality: 'ultra', nativeDpr: 1, width: 1920, height: 1080, scale: .75 }), 1);
for (const quality of ['ultra', 'balanced']) {
  assert.equal(calculateRenderDpr({ quality, nativeDpr: 1.5, width: 1920, height: 1080, scale: .85, allowBelowNative: true }), 1.5, 'manual quality preserves native pixels under pressure');
}
const comfortable = new AutoGraphicsController();
for (let i = 0; i < 800; i++) comfortable.sample(30);
assert.equal(comfortable.scale, 1, 'stable 33 FPS must not blur Auto');
assert.equal(comfortable.effects, 'balanced');
assert.equal(calculateRenderDpr({ quality: 'eco', nativeDpr: 2, width: 1280, height: 720, scale: .85 }), .85, 'weak PCs retain a lightweight adaptive preset');
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
assert.equal(first.specularColor.r, .12);
const secondScene = new Scene(engine);
assert.notEqual(first, createToyMaterial(secondScene, 'test', '#68b88a'));
first.dispose();
assert.notEqual(first, createToyMaterial(scene, 'test', '#68b88a'));
scene.dispose();
secondScene.dispose();
engine.dispose();
console.log('PASS: render resolution, adaptive hysteresis, material variants and scene/disposal isolation');
const auto = new AutoGraphicsController();
for (let i = 0; i < 200; i++) auto.sample(40);
assert.equal(auto.effects, 'eco'); assert.equal(auto.scale, 1, 'reduce effects before native resolution');
for (let i = 0; i < 200; i++) auto.sample(40);
assert.equal(auto.scale, .95);
auto.sample(5000); assert.equal(auto.scale, .95, 'ignore suspended/loading frames');
for (let i = 0; i < 1000; i++) auto.sample(16);
assert.equal(auto.scale, 1); assert.equal(auto.effects, 'balanced');
assert.equal(calculateRenderDpr({ quality: 'auto', nativeDpr: 1.8, width: 1422, height: 753 }), 1.8);
console.log('PASS: Auto preserves native DPR first, effects-first pressure and slow recovery.');
const overloaded = new AutoGraphicsController();
for (let i = 0; i < 80; i++) overloaded.sample(120);
assert.equal(overloaded.effects, 'eco', 'sustained sub-10 FPS must still trigger adaptation');

const overloadedPhone = new AutoGraphicsController(true);
for (let i = 0; i < 250; i++) overloadedPhone.sample(33.3);
assert.equal(overloadedPhone.effects, 'eco', '30 FPS mobile rendering triggers the safety profile');
for (let i = 0; i < 250; i++) overloadedPhone.sample(33.3);
assert.equal(overloadedPhone.scale, .95, 'mobile safety profile reduces render scale after sustained low FPS');

for (const quality of ['auto', 'ultra', 'balanced', 'eco']) {
  const width = 2400, height = 1080;
  const dpr = calculateRenderDpr({ quality, nativeDpr: 3, width, height, mobile: true });
  assert.ok(dpr <= 2, 'mobile DPR remains capped even in Ultra');
  assert.ok(width * height * dpr * dpr <= 1800001, 'mobile framebuffer stays within memory budget');
}
console.log('PASS: mobile framebuffer budget across quality presets');

assert.equal(calculateRenderDpr({ quality: 'auto', nativeDpr: 3, width: 390, height: 844, mobile: true }), 2, 'iPhone portrait retains Retina-sharp rendering');
assert.equal(calculateRenderDpr({ quality: 'auto', nativeDpr: 3, width: 844, height: 390, mobile: true }), 2, 'rotation keeps the same pixel density');

assert.equal(calculateRenderDpr({ quality: 'auto', nativeDpr: 3, width: 844, height: 390, mobile: true, scale: .85 }), 1.7, 'mobile Auto may lower render scale to protect the GPU');

assert.equal(calculateRenderDpr({ quality: "auto", nativeDpr: 3, width: 844, height: 390, mobile: true, scale: .7 }), 1.6, "mobile preserves foreground clarity under sustained pressure");
