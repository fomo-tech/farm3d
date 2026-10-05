/**
 * Crystal Lake: one continuous lagoon, an unobstructed town entrance and a
 * single fishing pier. The east edge shares the river's bank coordinates.
 */
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { LAKE_CENTER, LAKE_CONFIG, lakeEdge, lakeWaterAt } from '../../../../shared/lakeConfig.js';
import { createLakeSceneScope } from '../../rendering/LakeSceneScope.js';
import { mergeLakeStaticsSteps } from '../../rendering/mergeLakeStatics.js';

export { LAKE_CENTER, lakeEdge } from '../../../../shared/lakeConfig.js';
export { getRiverWestBankX } from '../../../../shared/riverBank.js';

function surface(scene, scope, name, rings, colors, material, {start=0,end=Math.PI*2,y=.09,closed=true}={}) {
  const positions=[],indices=[],normals=[],vertexColors=[];
  const segments=Math.max(24,Math.round(LAKE_CONFIG.segments*(end-start)/(Math.PI*2)));
  const count=closed ? segments : segments+1;
  rings.forEach((scale,k)=>{
    const color=Color3.FromHexString(colors[k]);
    for(let i=0;i<count;i++) {
      const p=lakeEdge(start+i*(end-start)/segments,scale);
      positions.push(p.x,y,p.z);normals.push(0,1,0);vertexColors.push(color.r,color.g,color.b,1);
    }
  });
  for(let k=1;k<rings.length;k++)for(let i=0;i<segments;i++) {
    const a=(k-1)*count+i,b=(k-1)*count+(i+1)%count,c=k*count+i,d=k*count+(i+1)%count;
    // Upward winding: no black reverse-facing shoreline.
    indices.push(a,b,c,b,d,c);
  }
  const mesh=new Mesh(name,scene),data=new VertexData();
  data.positions=positions;data.indices=indices;data.normals=normals;data.colors=vertexColors;
  data.applyToMesh(mesh);
  scope.own(mesh,material,scope.root,{staticMesh:false});
  return mesh;
}

function box(scene,scope,name,size,position,material,parent=scope.root,castShadow=false) {
  const mesh=scope.own(MeshBuilder.CreateBox(name,size,scene),material,parent,{castShadow});
  mesh.position.set(...position);return mesh;
}

function tree(scene,scope,x,z,index,bark,leaves,lightLeaves) {
  if(lakeWaterAt(x,z))return;
  const root=new TransformNode('lake-bank-tree-'+index,scene);
  root.position.set(x,0,z);root.parent=scope.root;
  const trunk=scope.own(MeshBuilder.CreateCylinder('lake-tree-trunk-'+index,{height:4.1,diameterTop:.3,diameterBottom:.65,tessellation:7},scene),bark,root,{castShadow:true});
  trunk.position.y=2.05;
  for(let i=0;i<5;i++) {
    const leaf=scope.own(MeshBuilder.CreateIcoSphere('lake-tree-leaf-'+index+'-'+i,{radius:1.7,subdivisions:1,flat:true},scene),i%2?leaves:lightLeaves,root,{castShadow:true});
    const angle=i*Math.PI*2/5;
    leaf.position.set(Math.cos(angle)*1.2,4.8+(i%2)*.8,Math.sin(angle)*1.2);
    leaf.scaling.set(1.1,.9,1.1);
  }
}

function bench(scene,scope,x,z,index,wood,metal) {
  const root=new TransformNode('lake-rest-bench-'+index,scene);
  root.position.set(x,.1,z);root.parent=scope.root;
  box(scene,scope,'lake-bench-seat-'+index,{width:2.8,height:.12,depth:.65},[0,.52,0],wood,root,true);
  box(scene,scope,'lake-bench-back-'+index,{width:2.8,height:.55,depth:.10},[0,.91,.30],wood,root,true);
  for(const dx of [-1,1])box(scene,scope,'lake-bench-leg-'+index+'-'+dx,{width:.12,height:.52,depth:.6},[dx,.26,0],metal,root);
}

export function* createRomanticLakeSteps(scene, shadows=null) {
  const scope=createLakeSceneScope(scene,'cozy-teardrop-lake-root',shadows);
  const {root,detail}=scope;
  const waterMat=scope.material('lake-water-mat','#ffffff');
  waterMat.backFaceCulling=false;
  waterMat.specularColor=new Color3(.10,.16,.18);waterMat.specularPower=32;
  const shoreMat=scope.material('lake-shore-mat','#ffffff');shoreMat.backFaceCulling=false;
  const pathMat=scope.material('lake-path-mat','#e8d8b6');
  const wood=scope.material('lake-pier-wood','#b58b62');
  const alternate=scope.material('lake-pier-wood-alt','#a67e59');
  const posts=scope.material('lake-pier-posts','#78604a');
  const stone=scope.material('lake-bank-stone','#a8b3ad');
  const bark=scope.material('lake-tree-bark','#987655');
  const leaves=scope.material('lake-tree-leaves','#4d8e54');
  const lightLeaves=scope.material('lake-tree-leaves-light','#7eaf65');
  const reedMat=scope.material('lake-reeds','#728e4e');
  const lilyMat=scope.material('lake-lilies','#59996d');
  const pink=scope.material('lake-lotus','#e3a4ba');
  yield 'lake: materials';

  const water=surface(scene,scope,'crystal-lake',[0,.35,.72,.91,1],
    ['#3e8eae','#499fb5','#63b6c3','#86ccd0','#b2dfe0'],waterMat,{y:.082});
  const shore=surface(scene,scope,'lake-sandy-shore',[1.002,1.055,1.16],
    ['#c6b99d','#dbcba9','#e8d8b6'],shoreMat,{start:.65,end:Math.PI*2-.70,closed:false,y:.096});
  yield 'lake: shoreline';

  const a=LAKE_CONFIG.approach,p=LAKE_CONFIG.pier,h=LAKE_CONFIG.pierHead;
  box(scene,scope,'lake-town-approach',{width:a.width,height:.04,depth:a.depth},
    [a.x,a.y-.02,a.z],pathMat);
  // Connector overlaps the first plank, so the entry has no gap or water step.
  const pierRoot=new TransformNode('lake-rustic-pier-root',scene);
  pierRoot.position.set(p.x,p.deckY-.06,p.z);pierRoot.parent=root;
  const planks=24,step=p.length/planks;
  for(let i=0;i<planks;i++) {
    box(scene,scope,'pier-plank-'+i,{width:step*.98,height:.12,depth:p.width},
      [-p.length/2+(i+.5)*step,0,0],i%3?wood:alternate,pierRoot);
    if(i%6===5)yield 'lake: pier planks';
  }
  // Solid wood head provides four clear fishing positions.
  box(scene,scope,'pier-head',{width:h.width,height:.12,depth:h.depth},
    [h.x-p.x,0,h.z-p.z],wood,pierRoot);
  for(const dx of [-9,-3,3,9])for(const dz of [-p.width/2+.2,p.width/2-.2]) {
    const pile=scope.own(MeshBuilder.CreateCylinder('pier-under-pile-'+dx+'-'+dz,{height:1.3,diameter:.23,tessellation:6},scene),posts,pierRoot);
    pile.position.set(dx,-.65,dz);
  }
  for(const dz of [-1.7,1.7]) {
    box(scene,scope,'pier-rail-'+dz,{width:11,height:.10,depth:.1},[-5,1.0,dz],posts,pierRoot,true);
    for(const dx of [-10,-5,0]) {
      box(scene,scope,'pier-rail-post-'+dx+'-'+dz,{width:.15,height:1.0,depth:.15},[dx,.5,dz],posts,pierRoot,true);
    }
  }
  for(const dz of [-4.8,4.8])box(scene,scope,'pier-head-bollard-'+dz,{width:.22,height:.9,depth:.22},[9,.45,dz],posts,pierRoot,true);
  yield 'lake: dock';

  // Rest bank stays on land, with room between trees, benches and the path.
  bench(scene,scope,129,22,0,wood,posts);
  bench(scene,scope,131,32,1,wood,posts);
  for(const [index,[x,z]] of [[127,34],[127,-33],[140,58],[163,-76],[181,84],[197,-68]].entries()) {
    tree(scene,scope,x,z,index,bark,leaves,lightLeaves);
    yield 'lake: bank tree '+index;
  }

  // Six restrained rock clusters on the shoreline; none on the approach.
  for(let i=0;i<18;i++) {
    const angle=.78+i*(Math.PI*2-1.55)/17;
    if(Math.abs(angle-Math.PI)<.28)continue;
    const pt=lakeEdge(angle,1.05);
    const rock=scope.own(MeshBuilder.CreateIcoSphere('lake-pebble-'+i,{radius:.35+(i%3)*.12,subdivisions:1,flat:true},scene),stone);
    rock.position.set(pt.x,.13,pt.z);rock.scaling.set(1.3,.55,1.0);
    if(i%6===5)yield 'lake: bank rocks';
  }
  // Reeds and lotus details are grouped under the nearby-only root.
  for(let i=0;i<4;i++) {
    const pt=lakeEdge(1.4+i*1.1,.98);
    for(let j=0;j<4;j++) {
      const reed=scope.own(MeshBuilder.CreateCylinder('reed-stalk-'+i+'-'+j,{height:.8+(j%2)*.3,diameter:.045,tessellation:4},scene),reedMat,detail);
      reed.position.set(pt.x+(j%2)*.3,.5,pt.z+Math.floor(j/2)*.3);
    }
  }
  for(let i=0;i<8;i++) {
    const angle=.9+i*.64,pt=lakeEdge(angle,.8);
    const pad=scope.own(MeshBuilder.CreateCylinder('lake-lily-'+i,{diameter:1.0,height:.025,tessellation:10},scene),lilyMat,detail);
    pad.position.set(pt.x,.108,pt.z);
    if(i%2===0) {
      const bloom=scope.own(MeshBuilder.CreateIcoSphere('lake-lotus-'+i,{radius:.22,subdivisions:1,flat:true},scene),pink,detail);
      bloom.position.set(pt.x,.22,pt.z);bloom.scaling.y=.5;
    }
  }
  yield 'lake: water detail';
  // One group of subtle wave ribbons, never a duplicate opaque water disk.
  const rippleMat=scope.material('lake-wave-mat','#cee8e7');rippleMat.alpha=.3;
  const waves=[];
  for(let i=0;i<3;i++) {
    const wave=scope.own(MeshBuilder.CreateTorus('lake-wave-'+i,{diameter:2.8+i,thickness:.025,tessellation:24},scene),rippleMat,detail,{staticMesh:false});
    wave.position.set(174+i*7,.118,10+i*9);wave.scaling.y=.2;waves.push(wave);
  }
  scope.animate(time=>{
    for(let i=0;i<waves.length;i++) {
      const scale=1+Math.sin(time*.5+i)*.12;waves[i].scaling.x=scale;waves[i].scaling.z=scale;
    }
  });
  const before=root.getChildMeshes().length;
  const removed=yield* mergeLakeStaticsSteps(root,shadows);
  root.metadata={...root.metadata,layoutVersion:2,meshesBeforeBatch:before,removedStaticMeshes:removed,meshesAfterBatch:root.getChildMeshes().length};
  return {root,water,shore,meshes:root.getChildMeshes(),dispose:scope.dispose};
}

export function createRomanticLake(scene,shadows=null) {
  const steps=createRomanticLakeSteps(scene,shadows);let result=steps.next();
  while(!result.done)result=steps.next();
  return result.value;
}
