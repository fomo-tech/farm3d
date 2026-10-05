import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { createCinematicRenderingPipeline } from '../src/game/rendering/CinematicRenderingPipeline.js';

const engine = new NullEngine();
const scene = new Scene(engine);
const camera = new FreeCamera('test', Vector3.Zero(), scene);
const cinematic = createCinematicRenderingPipeline(scene, camera, { quality: 'balanced' });
assert.ok(cinematic.pipeline);
const initial = cinematic.pipeline.imageProcessing;
for (let i = 0; i < 20; i++) cinematic.setQuality('balanced');
assert.equal(cinematic.pipeline.imageProcessing, initial, 'resolution-only updates must not recreate grading');
cinematic.setQuality('eco');
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
