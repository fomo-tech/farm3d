import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { createCinematicRenderingPipeline } from '../src/game/rendering/CinematicRenderingPipeline.js';
import { isolateColorGrading, applyColorPreset } from '../src/game/rendering/IsolatedColorGrading.js';

const engine = new NullEngine();
const scene = new Scene(engine);
const shared = scene.imageProcessingConfiguration;
shared.applyByPostProcess = true;
shared.contrast = 1.16;
shared.exposure = 1.05;
let dirtyScans = 0;
for (let i = 0; i < 200; i++) {
  const material = new StandardMaterial(`test-${i}`, scene);
  material._markAllSubMeshesAsImageProcessingDirty = () => dirtyScans++;
}
// Control proves the installed Babylon API really broadcasts to materials.
shared.exposure = 1.02;
assert.equal(dirtyScans, 200);
dirtyScans = 0;
const post = { imageProcessingConfiguration: shared };
const isolated = isolateColorGrading(scene, post);
assert.notEqual(isolated, shared);
assert.equal(isolateColorGrading(scene, post), isolated);
for (let i = 0; i < 100; i++) {
  for (const phase of ['dawn', 'day', 'dusk', 'night']) applyColorPreset(isolated, phase);
}
assert.equal(dirtyScans, 0, 'phase changes must not scan world materials');
assert.equal(isolated.exposure, 0.95);
assert.equal(shared.exposure, 1.02);
assert.equal(shared.applyByPostProcess, true);
// A quality rebuild can attach the scene config to a new postprocess.
const rebuilt = { imageProcessingConfiguration: shared };
applyColorPreset(isolateColorGrading(scene, rebuilt), 'dusk');
assert.equal(rebuilt.imageProcessingConfiguration.contrast, 1.05);
assert.equal(dirtyScans, 0);
assert.equal(isolateColorGrading(scene, null), null);
applyColorPreset(null, 'night');
const camera = new FreeCamera('test-camera', Vector3.Zero(), scene);
const grading = createCinematicRenderingPipeline(scene, camera);
assert.ok(grading.pipeline, 'exercise real DefaultRenderingPipeline, not fallback');
dirtyScans = 0;
for (const phase of ['day', 'dusk', 'night', 'dawn', 'day']) grading.setCinematicPreset(phase);
assert.equal(dirtyScans, 0);
for (const quality of ['eco', 'balanced', 'ultra']) {
  grading.setCinematicPreset('night');
  grading.setQuality(quality);
  assert.notEqual(grading.pipeline.imageProcessing.imageProcessingConfiguration, shared);
  assert.equal(grading.pipeline.imageProcessing.exposure, 0.95);
  // NullEngine has no HDR framebuffer, so Babylon legitimately uses direct
  // processing. Presets must preserve whichever path the engine selected.
  const processingPath = shared.applyByPostProcess;
  dirtyScans = 0; // Quality changes may legitimately rebuild material defines.
  grading.setCinematicPreset('dawn');
  assert.equal(shared.applyByPostProcess, processingPath);
  assert.equal(dirtyScans, 0, 'phase updates after quality changes must remain isolated');
}
scene.dispose();
engine.dispose();
console.log('PASS: 400 phase changes, zero world-material dirty scans; quality rebuild and fallback safe');
