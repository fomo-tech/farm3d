import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { createHighwayBridge } from '../src/game/world/nature/BridgeSystem.js';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader.js';
import { ALL_BRIDGES } from '../shared/bridgeConfig.js';
globalThis.OffscreenCanvas ||= class {
  constructor(width, height) { this.width = width; this.height = height; }
  getContext() {
    return new Proxy({}, { get: (target, key) => {
      if (key in target) return target[key];
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (key === 'measureText') return () => ({ width: 100 });
      return () => {};
    }, set: (target, key, value) => { target[key] = value; return true; } });
  }
};
// Imported lantern assets are outside this sign-allocation test.
SceneLoader.LoadAssetContainerAsync = async () => ({ textures: [], materials: [], dispose() {} });
const engine = new NullEngine();
for (const mobile of [false, true]) {
  const scene = new Scene(engine); scene.metadata = { mobile };
  const bridge = ALL_BRIDGES.find(b => b.type === 'highway');
  createHighwayBridge(scene, bridge, null, null);
  const signs = scene.textures.filter(t => t.name === `${bridge.id}-dt-sign`);
  assert.equal(signs.length, 1, 'both entrances share one sign allocation');
  const canvas = signs[0]._canvas;
  assert.equal(canvas.width, mobile ? 1024 : 2048);
  assert.equal(canvas.height, mobile ? 512 : 1024);
  const faces = scene.meshes.filter(m => m.name === `${bridge.id}-sign-front`);
  assert.equal(faces.length, 2, 'both entrance signs remain present');
  assert.equal(faces[0].material.diffuseTexture, faces[1].material.diffuseTexture);
  scene.dispose();
}
engine.dispose();
console.log('PASS: both bridge signs share a texture; mobile allocates 1/8 of the previous bridge-sign pixels');
