import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { buildHumanMesh } from '../src/game/player/buildHumanMesh.js';

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
const engine = new NullEngine();
const fullScene = new Scene(engine), fixedScene = new Scene(engine);
const full = buildHumanMesh(fullScene, 'citizen', {});
const fixed = buildHumanMesh(fixedScene, 'citizen', { fixedAppearance: true });
const visible = rig => rig.root.getChildMeshes().filter(mesh => mesh.isEnabled())
  .map(mesh => [mesh.name, mesh.getTotalVertices(), mesh.getTotalIndices()]).sort();
assert.deepEqual(visible(fixed), visible(full), 'pruning must preserve the displayed citizen');
assert.ok(fixedScene.meshes.length < fullScene.meshes.length * 0.5, 'fixed citizen must release the hidden wardrobe');
fixed.playAction('wave');
for (let i = 0; i < 120; i++) fixed.animate(1 / 60, false, 0);
assert.deepEqual(visible(fixed), visible(full), 'waving must retain the visible geometry');
console.log(`PASS: fixed citizen ${fullScene.meshes.length} -> ${fixedScene.meshes.length} meshes; appearance and wave animation preserved`);
fullScene.dispose(); fixedScene.dispose(); engine.dispose();
