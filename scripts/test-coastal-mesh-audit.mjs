import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Matrix } from '@babylonjs/core/Maths/math.vector.js';
import '@babylonjs/core/Meshes/thinInstanceMesh.js';
import { auditCoastalMeshes } from '../src/game/testing/auditCoastalMeshes.js';
import { createBeachLoungeSpot } from '../src/game/world/createScenicLandscapes.js';
import { beachOceanHalfWidth } from '../shared/beachConfig.js';
const engine=new NullEngine(),scene=new Scene(engine);
const road=MeshBuilder.CreateBox('road-old',{width:1240,depth:6,height:.1},scene);road.position.z=406;
const tree=MeshBuilder.CreateBox('foliage-test',{},scene);
tree.thinInstanceSetBuffer('matrix',new Float32Array(Matrix.Translation(0,0,406).asArray()),16,true);
let result=auditCoastalMeshes(scene);
assert.equal(result.count,2);assert.equal(result.thinPlacementsChecked,1);
road.position.z=310;
tree.thinInstanceSetBuffer('matrix',new Float32Array(Matrix.Translation(0,0,340).asArray()),16,true);
assert.equal(auditCoastalMeshes(scene).count,0);
assert.equal(createBeachLoungeSpot(scene,null,140,418,0,null,{}),null,'Old lounge position must be refused');
for(const side of [-1,1]) {
  assert.ok(createBeachLoungeSpot(scene,null,side*(beachOceanHalfWidth(418)+14),418,side<0?0:Math.PI,null,{}));
}
assert.equal(auditCoastalMeshes(scene).count,0,'Actual relocated umbrella/chair geometry stays outside water');
scene.dispose();engine.dispose();console.log('PASS: audit detects road footprints and thin foliage inside ocean');
