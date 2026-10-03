import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { Vector3, Matrix } from '@babylonjs/core/Maths/math.vector.js';
import { Viewport } from '@babylonjs/core/Maths/math.viewport.js';
import { RENDER_CONFIG as config } from '../src/game/world/worldLayout.js';

for (const [width, height] of [[1280, 720], [844, 390]]) {
  const engine = new NullEngine({ renderWidth: width, renderHeight: height });
  const scene = new Scene(engine);
  const camera = new ArcRotateCamera('test-camera', config.cameraAlpha, config.cameraBeta, config.cameraRadius, new Vector3(0, config.cameraTargetHeight, config.cameraLookAhead), scene);
  camera.fov = config.cameraFov;
  camera.maxZ = config.cameraFarClip;
  const project = point => Vector3.Project(point, Matrix.Identity(), camera.getViewMatrix(true).multiply(camera.getProjectionMatrix(true)), new Viewport(0, 0, width, height));
  const inside = point => { const p = project(point); assert(p.x > 0 && p.x < width && p.y > 0 && p.y < height && p.z > 0 && p.z < 1, `Outside ${width}x${height}: ${point}`); };
  // Unlike the former steep camera, distant ground and the horizon stay visible.
  assert(config.cameraBeta + config.cameraFov / 2 > Math.PI / 2);
  for (const distance of [100, 300, 600]) inside(new Vector3(0, 0, distance));
  inside(new Vector3(0, 1.5, 0));
  camera.setTarget(new Vector3(-config.cameraLookAhead, config.cameraTargetHeight, 0));
  camera.alpha = 0; camera.beta = config.cameraBeta; camera.radius = config.cameraRadius;
  inside(new Vector3(-300, 0, 0));
  camera.setTarget(new Vector3(0, config.cameraTargetHeight, config.farmCameraLookAhead));
  camera.alpha = config.cameraAlpha;
  camera.beta = config.farmCameraBeta;
  camera.radius = config.farmCameraRadius;
  for (const x of [-4.2, 4.2]) for (const z of [-5.7, -0.3]) inside(new Vector3(x, 0, z));
  engine.dispose();
}
console.log('PASS: desktop/mobile landscape horizon, ground at 100–600m, rotated view, player, and full farming footprint.');
