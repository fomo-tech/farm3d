import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { createCinematicRenderingPipeline, resolveAntialiasSamples } from '../src/game/rendering/CinematicRenderingPipeline.js';

assert.equal(resolveAntialiasSamples('ultra', 8), 4);
assert.equal(resolveAntialiasSamples('balanced', 8), 2);
assert.equal(resolveAntialiasSamples('eco', 8), 1);
assert.equal(resolveAntialiasSamples('ultra', 1), 1);

const engine = new NullEngine();
const scene = new Scene(engine);
const camera = new FreeCamera('test', Vector3.Zero(), scene);
const cinematic = createCinematicRenderingPipeline(scene, camera, { quality: 'balanced' });
assert.ok(cinematic.pipeline);
assert.equal(cinematic.pipeline.sharpenEnabled, false);
const initial = cinematic.pipeline.imageProcessing;
for (let i = 0; i < 20; i++) cinematic.setQuality('balanced');
assert.equal(cinematic.pipeline.imageProcessing, initial, 'resolution-only updates must not recreate grading');
cinematic.setQuality('eco');
assert.equal(cinematic.pipeline.sharpenEnabled, false);
assert.equal(cinematic.pipeline.fxaaEnabled, true, 'fallback AA for low-end hardware');
const eco = cinematic.pipeline.imageProcessing;
for (let i = 0; i < 20; i++) cinematic.setQuality('eco');
assert.equal(cinematic.pipeline.imageProcessing, eco);
assert.notEqual(eco.imageProcessingConfiguration, scene.imageProcessingConfiguration);
scene.dispose(); engine.dispose();
const autoEngine = new NullEngine();
const autoScene = new Scene(autoEngine);
const autoCamera = new FreeCamera('auto', Vector3.Zero(), autoScene);
const auto = createCinematicRenderingPipeline(autoScene, autoCamera, { quality: 'balanced', stableSamples: true });
const processing = auto.pipeline.imageProcessing;
const originalSamples = auto.pipeline.samples;
for (let i = 0; i < 20; i++) {
  auto.setQuality(i % 2 ? 'balanced' : 'eco', true);
  assert.equal(auto.pipeline.samples, originalSamples, 'Auto preserves the sample count supported by the engine');
  assert.equal(auto.pipeline.imageProcessing, processing, 'Auto must not rebuild grading between effect levels');
}
autoScene.dispose(); autoEngine.dispose();
console.log('PASS: repeated Auto effect levels preserve pipeline identity and isolated grading');

const mobileEngine = new NullEngine();
const mobileScene = new Scene(mobileEngine);
const mobileCamera = new FreeCamera('mobile', Vector3.Zero(), mobileScene);
const mobile = createCinematicRenderingPipeline(mobileScene, mobileCamera, { quality: 'ultra', lightweight: true });
assert.equal(mobile.pipeline, null, 'mobile must not allocate a full-screen render target');
assert.equal(mobileScene.imageProcessingConfiguration.applyByPostProcess, false);
const mobileConfig = mobileScene.imageProcessingConfiguration;
const mobileUpdates = [];
mobileConfig.onUpdateParameters.add(() => mobileUpdates.push(1));
for (const quality of ['balanced', 'ultra', 'eco']) {
  mobile.setQuality(quality);
  mobile.setCinematicPreset('night');
  assert.equal(mobile.pipeline, null);
  assert.equal(mobileScene.imageProcessingConfiguration, mobileConfig);
}
assert.equal(mobileUpdates.length, 0, 'mobile quality/day-night updates must not dirty world materials');
mobileScene.dispose(); mobileEngine.dispose();
console.log('PASS: mobile uses direct grading without render targets or recurring material invalidation');
