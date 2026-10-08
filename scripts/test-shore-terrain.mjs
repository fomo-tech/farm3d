import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode.js';
import {createShoreTerrain} from '../src/game/world/nature/createShoreTerrain.js';
import {otherWaterAt} from '../src/game/world/nature/clipShoreAtWaterways.js';
import {isRoadResourceBlocked} from '../src/game/world/RoadSafetyZone.js';
const engine=new NullEngine(),scene=new Scene(engine),root=new TransformNode('shore-test',scene);
const meshes=createShoreTerrain(scene,root);
const {shoreTerrainHeight}=await import('../src/game/world/nature/ShoreTerrain.js');
const {getTerrainHeight}=await import('../src/game/world/TerrainHeightSystem.js');
assert.equal(meshes.length,17,'five lakes and both banks of six rivers');
for(const m of meshes){
 assert.ok(m.getIndices().length>0,m.name);
 const positions=m.getVerticesData('position'),indices=m.getIndices();
 assert.ok(positions.every(Number.isFinite));
 const normals=m.getVerticesData('normal');assert.ok(normals.filter((_,i)=>i%3===1).every(y=>y>=0),'both banks face daylight');
 assert.equal(m.isPickable,false);
 for(let i=0;i<indices.length;i+=3){
  const tri=indices.slice(i,i+3),x=tri.reduce((sum,k)=>sum+positions[k*3],0)/3,z=tri.reduce((sum,k)=>sum+positions[k*3+2],0)/3;
  const y=tri.reduce((sum,k)=>sum+positions[k*3+1],0)/3;
  assert.ok(shoreTerrainHeight(x,z)>=y-1e-5,'walking height matches bank triangles');
  assert.ok(getTerrainHeight(x,z)>=y-1e-5,'avatar feet follow the new bank');
  assert.equal(otherWaterAt(x,z,m.metadata.waterBody),false,'junctions remain open water');
  assert.equal(isRoadResourceBlocked(x,z,.25),false,'no earth shelf crosses a road');
 }
 assert.ok(Math.max(...positions.filter((_,i)=>i%3===1))<.85,'earth bank stays below a metre');
}
root.dispose();assert.equal(scene.getMaterialByName('shore-earth-slope'),null);
scene.dispose();engine.dispose();console.log('PASS: natural banks for all lakes/rivers, clear confluences/roads, low slopes and disposal');
