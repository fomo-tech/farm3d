import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer.js';
import { buildHumanMesh } from '../src/game/player/buildHumanMesh.js';
import { createFishingRig } from '../src/game/player/createPlayer.js';

globalThis.OffscreenCanvas ||= class {
  constructor(width, height) { this.width = width; this.height = height; }
  getContext() { return new Proxy({}, { get: (_, key) => key === 'measureText' ? () => ({ width: 100 }) : key === 'createRadialGradient' || key === 'createLinearGradient' ? () => ({ addColorStop() {} }) : () => {} }); }
};
const engine = new NullEngine();
const scene = new Scene(engine);
const root = new TransformNode('angler', scene);
const human = buildHumanMesh(scene, 'local-player');
human.root.parent = root;
const rig = createFishingRig(scene, root, human);
const rod = human.root.getChildMeshes().filter(mesh => mesh.name.includes('-fishing-rod-'));
assert.equal(rod.length, 4);
const visible = expected => rod.forEach(mesh => assert.equal(mesh.isEnabled(), expected, mesh.name));
const tick = () => { for (let i = 0; i < 120; i++) { human.animate(1 / 60, false, 0); rig.update(1 / 60); } };
visible(false);
rig.startCast(8);
visible(true);
tick();
visible(true);
human.fishingLineOrigin.computeWorldMatrix(true);
const line = scene.getMeshByName('local-fishing-line');
const visibleLine = scene.getMeshByName('local-fishing-line-visible');
const caughtFishBody = scene.getMeshByName('caught-fish-body');
const linePoints = line.getVerticesData(VertexBuffer.PositionKind);
assert.ok(visibleLine, 'Fishing line has a visible overlay for opaque water');
assert.equal(visibleLine.isEnabled(), true, 'Visible fishing line overlay is enabled during a cast');
assert.equal(visibleLine.metadata?.spatialBoundsDynamic, true, 'Fishing line stays in the dynamic render set while the camera rotates');
assert.equal(caughtFishBody.metadata?.spatialBoundsDynamic, true, 'Caught fish stays in the dynamic render set while the camera rotates');
assert.ok(linePoints[1] > 1, 'Fishing line starts at the raised rod tip');
assert.ok(Math.abs(linePoints[1] - human.fishingLineOrigin.getAbsolutePosition().y) < .01, 'Fishing line follows the animated rod tip');
for (const phase of ['waiting', 'bite', 'reel']) {
  rig.setPhase(phase);
  tick();
  visible(true);
}
human.fishingLineOrigin.computeWorldMatrix(true);
assert.ok(human.fishingLineOrigin.getAbsolutePosition().y > 1, 'Rod tip stays above the water while fishing');
rig.finishCatch(true, { color: '#ffcc66' });
tick();
visible(false);
rig.clear();
visible(false);
rig.startCast(8);
tick();
visible(true);
rig.clear();
visible(false);
assert.equal(visibleLine.isEnabled(), false, 'Visible fishing line overlay is hidden after clearing the cast');
rig.startCast(8, 'basic_cast', { x: 0, y: .13, z: 4 }, 'medium', 'sea');
rig.update(1);
assert.ok(scene.getMeshByName('local-fishing-bobber').position.y > .2, 'Sea bobber is lifted above the ocean surface');
rig.clear();
assert.equal(visibleLine.isEnabled(), false, 'Visible fishing line overlay is hidden after the sea cast is cleared');
rig.dispose();
scene.dispose();
engine.dispose();
console.log('PASS actual avatar rod visibility: cast, wait, bite, reel, catch, cancel and recast');
