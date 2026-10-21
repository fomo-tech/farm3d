import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode.js';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial.js';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder.js';
import {createCityRoadSurface} from '../src/game/world/cityRoadSurface.js';
import {subtractRoadPolygon,polygonArea,roadFootprint} from '../src/game/world/roadPolygon.js';
const square=[[-10,-5],[10,-5],[10,5],[-10,5]],cut=[[-5,-10],[5,-10],[5,10],[-5,10]];
assert.ok(Math.abs(subtractRoadPolygon(square,cut).reduce((s,p)=>s+polygonArea(p),0)-100)<1e-6);
assert.equal(subtractRoadPolygon(square,[[-20,-20],[20,-20],[20,20],[-20,20]]).length,0);
const bend=[{id:'bend-a',route:'bend',x1:0,z1:0,x2:20,z2:0,width:10},{id:'bend-b',route:'bend',x1:20,z1:0,x2:20,z2:20,width:10}];
const fa=roadFootprint(bend[0],bend),fb=roadFootprint(bend[1],bend);
for(const [a,b] of [[fa[1],fb[0]],[fa[2],fb[3]]])assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-8,'Both road segments must share the exact miter edge');
assert.ok(Math.abs(polygonArea(fa)+polygonArea(fb)-400)<1e-6);
const engine=new NullEngine(),scene=new Scene(engine);
try{
 const parent=new TransformNode('roads',scene),materials={};
 for(const name of ['road','walk','curb','lane','crosswalk'])materials[name]=new StandardMaterial(name,scene);
 const network=[{id:'horizontal',x:0,z:0,length:20,width:10,northSouth:false},{id:'vertical',x:0,z:0,length:20,width:10,northSouth:true}];
 const a=createCityRoadSurface(scene,parent,materials,{id:'horizontal',axis:'x',coordinate:0,length:20,width:10},network);
 const b=createCityRoadSurface(scene,parent,materials,{id:'vertical',axis:'z',coordinate:0,length:20,width:10},network);
 function area(mesh){const p=mesh.getVerticesData('position'),idx=mesh.getIndices();let sum=0;for(let i=0;i<idx.length;i+=3){const a=idx[i]*3,b=idx[i+1]*3,c=idx[i+2]*3;const up=(p[b+2]-p[a+2])*(p[c]-p[a])-(p[b]-p[a])*(p[c+2]-p[a+2]);assert.ok(up<0,'Asphalt winding must match Babylon CreateGround');sum-=up/2;}return sum;}
 assert.equal(area(a),200);assert.equal(area(b),100);
 assert.equal(area(a)+area(b),300,'Crossing union must have no duplicate asphalt or missing surface');
 const reference=MeshBuilder.CreateGround('engine-reference',{width:10,height:10},scene);
 assert.equal(area(reference),100,'Reference winding must be taken from engine geometry');
 for(const mesh of scene.meshes.filter(m=>m.metadata?.roadSurface)){
  const p=mesh.getVerticesData('position'),idx=mesh.getIndices();
  for(let i=0;i<idx.length;i+=3){const a=idx[i]*3,b=idx[i+1]*3,c=idx[i+2]*3;if(Math.abs(p[a+1]-p[b+1])>1e-6||Math.abs(p[a+1]-p[c+1])>1e-6)continue;const winding=(p[b+2]-p[a+2])*(p[c]-p[a])-(p[b]-p[a])*(p[c+2]-p[a+2]);assert.ok(winding<0,`Top surface is back-facing: ${mesh.name}`);}
 }
 for(const mesh of scene.meshes){const p=mesh.getVerticesData('position');assert.ok(p.every(Number.isFinite));assert.ok(mesh.getIndices().every(i=>i>=0&&i<p.length/3));}
 console.log('PASS road mesh: exact crossing union, no duplicate asphalt, upward faces and finite indexed geometry');
}finally{scene.dispose();engine.dispose();}
