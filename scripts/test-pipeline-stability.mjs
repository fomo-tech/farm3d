import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { createCinematicRenderingPipeline, resolveAntialiasSamples, resolveMobileAntialiasSamples } from '../src/game/rendering/CinematicRenderingPipeline.js';

assert.equal(resolveAntialiasSamples('ultra', 8), 4);
assert.equal(resolveAntialiasSamples('balanced', 8), 4);
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
auto.setQuality('eco', false);
assert.equal(auto.pipeline.samples, 1, 'adaptive desktop safety profile disables expensive MSAA');
assert.equal(auto.pipeline.fxaaEnabled, true, 'adaptive desktop retains lightweight antialiasing');
const adaptiveProcessing = auto.pipeline.imageProcessing;
for (let i = 0; i < 20; i++) auto.setQuality('eco', false);
assert.equal(auto.pipeline.imageProcessing, adaptiveProcessing, 'scale-only changes do not rebuild postprocessing');
autoScene.dispose(); autoEngine.dispose();
console.log('PASS: repeated Auto effect levels preserve pipeline identity and isolated grading');

const mobileEngine = new NullEngine();
mobileEngine.getCaps().maxMSAASamples = 4;
mobileEngine._webGLVersion = 2;
const mobileScene = new Scene(mobileEngine);
const mobileCamera = new FreeCamera('mobile', Vector3.Zero(), mobileScene);
const mobile = createCinematicRenderingPipeline(mobileScene, mobileCamera, { quality: 'ultra', lightweight: true });
assert.equal(mobile.pipeline, null, 'mobile must not allocate the HDR/MSAA default pipeline');
assert.equal(mobileScene.imageProcessingConfiguration.applyByPostProcess, false);
assert.ok(mobile.fxaa, 'mobile retains antialiasing even in its lightweight profile');
assert.equal(mobileCamera._postProcesses.filter(Boolean).length, 1, 'mobile allocates only one AA pass');
const mobileAA = mobile.fxaa;
const mobileConfig = mobileScene.imageProcessingConfiguration;
const mobileUpdates = [];
mobileConfig.onUpdateParameters.add(() => mobileUpdates.push(1));
for (const quality of ['balanced', 'ultra', 'eco']) {
  mobile.setQuality(quality);
  assert.equal(mobile.fxaa.samples, quality === 'eco' ? 1 : 2);
  mobile.setCinematicPreset('night');
  assert.equal(mobile.pipeline, null);
  assert.equal(mobile.fxaa, mobileAA);
  assert.equal(mobileScene.imageProcessingConfiguration, mobileConfig);
}
assert.equal(mobileUpdates.length, 0, 'mobile quality/day-night updates must not dirty world materials');
mobileScene.dispose(); mobileEngine.dispose();
console.log('PASS: mobile uses direct grading with one stable FXAA pass and no recurring material invalidation');

assert.equal(resolveMobileAntialiasSamples('balanced', 4), 2);
assert.equal(resolveMobileAntialiasSamples('ultra', 4), 2);
assert.equal(resolveMobileAntialiasSamples('eco', 4), 1);
assert.equal(resolveMobileAntialiasSamples('balanced', 1), 1);
