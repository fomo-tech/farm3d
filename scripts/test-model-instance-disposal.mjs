import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { AssetContainer } from '@babylonjs/core/assetContainer.js';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Animation } from '@babylonjs/core/Animations/animation.js';
import { AnimationGroup } from '@babylonjs/core/Animations/animationGroup.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { spawnModelSync } from '../src/game/rendering/ModelAssetManager.js';
globalThis.window = { addEventListener() {}, removeEventListener() {}, __farmDebug: { stage() {}, endStage() {} } };
const engine = new NullEngine(), scene = new Scene(engine);
const source = MeshBuilder.CreateBox('shared-source', {}, scene);
const shared = new StandardMaterial('shared-model-material', scene);
source.material = shared;
let sharedDisposals = 0;
shared.onDisposeObservable.add(() => sharedDisposals++);
const animation = new Animation('move', 'position.x', 30, Animation.ANIMATIONTYPE_FLOAT);
animation.setKeys([{frame:0,value:0},{frame:30,value:1}]);
const group = new AnimationGroup('shared-motion', scene);
group.addTargetedAnimation(animation, source);
const container = new AssetContainer(scene);
container.meshes = [source]; container.materials = [shared]; container.animationGroups = [group];
container.populateRootNodes(); container.removeAllFromScene();
SceneLoader.LoadAssetContainerAsync = async () => container;
for (let i = 0; i < 20; i++) {
  let root;
  await new Promise((resolve, reject) => {
    root = spawnModelSync(scene, '/models/test-tinted.glb', { allowOnRoad: true, showFallback: false,
      colorTint: Color3.Red(), onLoaded: resolve, onError: reject });
  });
  const clone = root.getChildMeshes().find(mesh => mesh.material?.name.endsWith('_tintMat')).material;
  assert.notEqual(clone, shared);
  assert.equal(scene.animationGroups.length, 1, 'placement owns a cloned animation group');
  root.dispose(false, false);
  assert.equal(scene.animationGroups.length, 0, 'placement disposal releases animation groups');
  assert.equal(sharedDisposals, 0, 'placement disposal must preserve shared material ownership');
  assert.ok(!scene.materials.includes(clone), 'placement disposal must release its tint material');
  assert.ok(!scene.materials.some(mat => mat.name.endsWith('_tintMat')), 'repeated visits must not accumulate tint clones');
  assert.equal(shared.diffuseColor.r, 1, 'shared asset material remains valid');
}
scene.dispose(); engine.dispose();
console.log('PASS: 20 load/dispose cycles release private materials and preserve the shared model container');
