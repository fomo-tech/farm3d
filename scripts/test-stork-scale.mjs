import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MODEL_PATHS, modelUnitScale } from '../src/game/rendering/AssetRegistry.js';
const bytes=readFileSync(new URL('../public/models/animals/stork.glb',import.meta.url));
const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
const primitive=json.meshes[0].primitives[0];
const position=json.accessors[primitive.attributes.POSITION];
assert.ok(position.max[0]-position.min[0]>190,'test the actual oversized source asset');
assert.equal(modelUnitScale('animals.stork'),.01);
assert.equal(modelUnitScale(MODEL_PATHS.animals.stork),.01);
assert.equal(modelUnitScale('animals.duck'),1,'other animals retain authored units');
for(const placementScale of [1.2,1.25]) {
 const wingspan=(position.max[0]-position.min[0])*modelUnitScale('animals.stork')*placementScale;
 assert.ok(wingspan>2 && wingspan<2.5,'river birds have a metre-scale wingspan');
}
// All morph targets must remain bounded as well, including the extreme wing poses.
for(const target of primitive.targets || []) {
 const delta=json.accessors[target.POSITION];
 for(let axis=0;axis<3;axis++) {
  const span=(position.max[axis]+Math.max(0,delta.max[axis])-position.min[axis]-Math.min(0,delta.min[axis]))*.0125;
  assert.ok(Number.isFinite(span)&&span<4,'animated wing poses remain below four metres');
 }
}
console.log('PASS: real stork GLB source and morph bounds, both river placement scales and asset-ID parity');

const {NullEngine}=await import('@babylonjs/core/Engines/nullEngine.js');
const {Scene}=await import('@babylonjs/core/scene.js');
const {AssetContainer}=await import('@babylonjs/core/assetContainer.js');
const {SceneLoader}=await import('@babylonjs/core/Loading/sceneLoader.js');
const {MeshBuilder}=await import('@babylonjs/core/Meshes/meshBuilder.js');
const {Vector3}=await import('@babylonjs/core/Maths/math.vector.js');
const {spawnModelSync}=await import('../src/game/rendering/ModelAssetManager.js');
globalThis.window={addEventListener(){},removeEventListener(){}};
const engine=new NullEngine(),scene=new Scene(engine);
const source=MeshBuilder.CreateBox('source-bird-bounds',{width:position.max[0]-position.min[0],height:position.max[1]-position.min[1],depth:position.max[2]-position.min[2]},scene);
const container=new AssetContainer(scene);container.meshes=[source];container.populateRootNodes();container.removeAllFromScene();
const loader=SceneLoader.LoadAssetContainerAsync;SceneLoader.LoadAssetContainerAsync=async()=>container;
try {
 for(const size of [1.2,1.25]) {
  let root;
  await new Promise((resolve,reject)=>{root=spawnModelSync(scene,'animals.stork',{name:'river-stork-regression',position:new Vector3(219,.1,275),scaling:new Vector3(size,size,size),allowOnRoad:true,onLoaded:resolve,onError:reject});});
  assert.equal(root.scaling.x,size*.01,'production placement applies centimetre-to-metre conversion');
  const mesh=root.getChildMeshes()[0];mesh.computeWorldMatrix(true);
  const box=mesh.getBoundingInfo().boundingBox;
  assert.ok(box.maximumWorld.subtract(box.minimumWorld).length()<4,'actual instance stays bounded');
  root.dispose();
 }
} finally {SceneLoader.LoadAssetContainerAsync=loader;scene.dispose();engine.dispose();}
console.log('PASS: production model placement normalizes storks before instancing');
