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
assert.equal(calculateRenderDpr({ quality: 'eco', nativeDpr: 2, width: 1280, height: 720, scale: .85, allowBelowNative: true }), .85, 'weak PCs retain a lightweight adaptive preset');
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
for (let i = 0; i < 91; i++) overloadedPhone.sample(45);
assert.equal(overloadedPhone.effects, 'eco', 'sustained frame misses trigger the safety profile');
for (let i = 0; i < 91; i++) overloadedPhone.sample(45);
assert.equal(overloadedPhone.scale, .95, 'mobile safety profile reduces render scale after sustained low FPS');

for (const quality of ['auto', 'ultra', 'balanced', 'eco']) {
  const width = 2400, height = 1080;
  const dpr = calculateRenderDpr({ quality, nativeDpr: 3, width, height, mobile: true });
  assert.ok(dpr <= 2, 'mobile DPR remains capped even in Ultra');
  assert.ok(width * height * dpr * dpr <= 1800001, 'mobile framebuffer stays within memory budget');
}
console.log('PASS: mobile framebuffer budget across quality presets');

assert.equal(calculateRenderDpr({ quality: 'auto', nativeDpr: 3, width: 390, height: 844, mobile: true }), 1.5, 'iPhone Auto uses the mobile density cap');
assert.equal(calculateRenderDpr({ quality: 'auto', nativeDpr: 3, width: 844, height: 390, mobile: true }), 1.5, 'rotation keeps the same pixel density');

assert.ok(Math.abs(calculateRenderDpr({ quality: 'auto', nativeDpr: 3, width: 844, height: 390, mobile: true, scale: .85 }) - 1.275) < 1e-9, 'mobile Auto may lower render scale to protect the GPU');

assert.ok(Math.abs(calculateRenderDpr({ quality: "auto", nativeDpr: 3, width: 844, height: 390, mobile: true, scale: .7 }) - 1.25) < 1e-9, "mobile Auto can shed GPU load under sustained pressure");

assert.equal(calculateRenderDpr({ quality:'balanced', nativeDpr:3, width:390, height:844, mobile:true }), 1.5);
assert.equal(calculateRenderDpr({ quality:'ultra', nativeDpr:3, width:390, height:844, mobile:true }), 2);

const slowPhone = new AutoGraphicsController(true);
for (let i=0;i<31;i++) slowPhone.sample(100);
assert.equal(slowPhone.effects,'eco');
for (let i=0;i<31;i++) slowPhone.sample(100);
assert.equal(slowPhone.scale,.9,'10 FPS phones shed pixel load within two short windows');
console.log('PASS: mobile adaptation responds within three seconds');

const desktopReport = { quality: 'auto', nativeDpr: 1.8, width: 1422, height: 753 };
assert.equal(calculateRenderDpr({ ...desktopReport, scale: .95 }), 1.71, 'desktop Auto must apply its advertised safety scale');
assert.equal(calculateRenderDpr({ ...desktopReport, scale: .7 }), 1.26);
const slowDesktop = new AutoGraphicsController();
for (let i = 0; i < 3000; i++) slowDesktop.sample(53);
assert.equal(slowDesktop.effects, 'eco');
assert.equal(slowDesktop.scale, .7, '19 FPS desktops can reduce framebuffer load beyond the old ineffective cap');
console.log('PASS: desktop report regression, Auto scale applies while manual presets retain native density');

const { applyWorldPowerPolicy } = await import('../src/game/rendering/GraphicsSettings.js');
const stablePhone = new AutoGraphicsController(true);
for (let i = 0; i < 1200; i++) stablePhone.sample(1000 / 30);
assert.equal(stablePhone.scale, 1, 'intentional 30 FPS must not repeatedly reduce resolution');
for (const refreshRate of [60, 120]) {
  const paced = new NullEngine();
  applyWorldPowerPolicy(paced, true);
  assert.equal(paced.renderEvenInBackground, false);
  let rendered = 0;
  for (let i = 1; i <= refreshRate * 10; i++) {
    if (!paced._isOverFrameTime(i * 1000 / refreshRate)) rendered++;
  }
  assert.ok(rendered >= 299 && rendered <= 301, `${refreshRate} Hz display stays at 30 FPS: ${rendered}`);
  applyWorldPowerPolicy(paced, false);
  assert.equal(paced.maxFPS, 60);
  paced.dispose();
}
for (const [width, height] of [[390,844],[844,390],[1024,1366]]) {
  const dpr = calculateRenderDpr({ quality:'auto', nativeDpr:3, width, height, mobile:true });
  assert.ok(width * height * dpr * dpr <= 1800001);
}
console.log('PASS: actual Babylon frame pacing at 60/120 Hz, stable capped adaptation and phone/tablet pixel budgets');
