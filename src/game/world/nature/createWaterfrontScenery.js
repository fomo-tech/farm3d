import {TransformNode} from '@babylonjs/core/Meshes/transformNode.js';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder.js';
import {Mesh} from '@babylonjs/core/Meshes/mesh.js';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial.js';
import {Color3} from '@babylonjs/core/Maths/math.color.js';
import {buildWaterfrontSceneryLayout} from './waterfrontSceneryLayout.js';
import {getWorldChunkStreamer} from '../WorldChunkStreamer.js';
import {NETWORK_LAKES,networkLakeOutline} from '../../../../shared/waterNetwork.js';

export function* createWaterfrontScenerySteps(scene,parent,shadows=null,{stream=true}={}){
 const root=new TransformNode('shore-scenery',scene);root.parent=parent;
 const palette={bark:'#8a6950',wood:'#ba9265',leaf:'#6d9b68',light:'#90b877',pine:'#517f67',willow:'#82a975',blossom:'#e3b7be',grass:'#9cab6b',reed:'#b5ac7c',stone:'#a3aaa0',moss:'#7d916c',lavender:'#b2a5cf',cream:'#eaddb5',pink:'#d8a3b4',metal:'#667c70',lantern:'#ffe2a1'};
 const materials=Object.fromEntries(Object.entries(palette).map(([key,color])=>{
  const m=new StandardMaterial('shore-'+key,scene);m.diffuseColor=Color3.FromHexString(color);m.ambientColor=m.diffuseColor.scale(.3);m.specularColor=Color3.Black();return [key,m];
 }));
 materials.lantern.emissiveColor=Color3.FromHexString(palette.lantern).scale(.25);
 const cells=new Map(),records=buildWaterfrontSceneryLayout();root.metadata={waterfrontScenery:true,placements:records};
 let current,record;
 const make=(type,name,options,x,y,z,key,rotation=0,scale=null)=>{
  const mesh=MeshBuilder[type](`shore-${name}`,options,scene);
  // Rotate individual pieces around the object center, facing the water.
  const c=Math.cos(record.yaw),s=Math.sin(record.yaw);
  mesh.position.set(record.x+x*c+z*s,y,record.z-x*s+z*c);mesh.rotation.y=record.yaw+rotation;
  if(scale)mesh.scaling.set(...scale);
  mesh.material=materials[key];mesh.isPickable=false;mesh.receiveShadows=true;
  if(!current.has(key))current.set(key,[]);current.get(key).push(mesh);return mesh;
 };
 const ball=(name,x,y,z,size,key,scale=null)=>make('CreateIcoSphere',name,{radius:size,subdivisions:/canopy|crown/.test(name)?2:1,flat:false},x,y,z,key,0,scale);
 const box=(name,x,y,z,w,h,d,key)=>make('CreateBox',name,{width:w,height:h,depth:d},x,y,z,key);
 const rod=(name,x,y,z,h,diameter,key)=>make('CreateCylinder',name,{height:h,diameterTop:diameter*.65,diameterBottom:diameter,tessellation:6},x,y,z,key);
 for(let i=0;i<records.length;i++){
  record=records[i];const cell=`${Math.floor(record.x/96)}:${Math.floor(record.z/96)}`;
  if(!cells.has(cell))cells.set(cell,new Map());current=cells.get(cell);
  const scale=record.scale;
  if(record.kind==='tree'){
   const pine=record.theme==='pine',willow=record.theme==='willow',height=(pine?8.8:willow?7:6.5)*scale;
   rod('trunk',0,height*.4,0,height*.8,.48*scale,'bark');
   if(pine){
    for(let j=0;j<3;j++)make('CreateCylinder','pine',{height:3.6*scale,diameterTop:0,diameterBottom:(5.5-j*.85)*scale,tessellation:7},0,height*.51+j*1.25*scale,0,j===2?'leaf':'pine');
   }else{
    const color=record.theme==='blossom'?'blossom':record.theme==='mist'?'lavender':willow?'willow':'leaf';
    for(let j=0;j<4;j++){
     const a=j*2.39,r=j===3?0:1.1*scale;
     ball('canopy',Math.sin(a)*r,height*.8+(j===3?1.1:0)*scale,Math.cos(a)*r,1.85*scale,j===3&&color!=='blossom'&&color!=='lavender'?'light':color,[1,willow?1.18:.9,1]);
    }
   }
   if(i%3===0){
    const offset=i%2?2.7:-2.7;rod('young-trunk',offset,1.9,1,3.8,.24,'bark');
    if(pine)make('CreateCylinder','young-pine',{height:3.6,diameterTop:0,diameterBottom:2.8,tessellation:7},offset,4,1,'pine');
    else ball('tree-crown',offset,3.9,1,1.2,record.theme==='blossom'?'blossom':record.theme==='mist'?'lavender':'leaf',[1,1.1,1]);
   }
   ball('roots',0,.08,0,.75*scale,'moss',[1,.22,1]);
  }else if(record.kind==='shrub'){
   for(let j=0;j<3;j++)ball('bush',(j-1)*.4,.35+(j%2)*.12,Math.sin(j*2)*.25,.5,'leaf',[1,.8,1]);
   if(record.theme==='reed'){
    for(let j=0;j<5;j++){const h=.85+(j%3)*.2;const stalk=rod('reed',(j-2)*.17,h/2,.4,h,.045,'grass');stalk.rotation.z=.12*Math.sin(j);rod('reed-head',(j-2)*.17,h,.4,.25,.065,'reed');}
   }else{
    const flower=record.theme==='blossom'?'pink':record.theme==='pine'?'cream':record.theme==='mist'?'lavender':'lavender';
    for(let j=0;j<5;j++){const x=Math.sin(j*2.4)*.62,z=Math.cos(j*2.4)*.52;rod('flower-stem',x,.43,z,.75,.025,'grass');ball('flower',x,.84,z,.21,flower,[1,.65,1]);}
   }
  }else if(record.kind==='stone'){
   ball('stone',-.28,.24,0,.65,'stone',[1,.55,.8]);ball('moss-stone',.48,.18,.25,.43,'moss',[1,.5,.85]);
   for(let j=0;j<3;j++){const blade=rod('grass',-.5+j*.18,.27,.55,.5,.035,'grass');blade.rotation.z=(j-1)*.28;}
  }else{
   // A shaded rest corner faces the water, leaving the shoreline itself open.
   rod('rest-tree-trunk',-3.1,2.45,1.8,4.9,.45,'bark');
   for(let j=0;j<4;j++)ball('rest-canopy',-3.1+Math.sin(j*2.4)*.85,5.3+(j===3?.8:0),1.8+Math.cos(j*2.4)*.75,1.7,record.theme==='blossom'?'blossom':record.theme==='mist'?'lavender':j===3?'light':'willow',[1,1.05,1]);
   for(let j=0;j<4;j++)ball('stepping-stone',-.2+(j%2)*.13,.026,-1-j*.72,.3,'stone',[1,.10,.75]);
   for(let j=0;j<6;j++){const x=-2.3+Math.sin(j*2.4)*.6,z=.2+Math.cos(j*2.4)*.55;rod('rest-flower-stem',x,.36,z,.7,.03,'grass');ball('rest-flower',x,.75,z,.19,j%2?'lavender':'cream',[1,.7,1]);}
   for(let j=0;j<3;j++)box('bench-seat',0,.55,(j-1)*.2,2.4,.11,.16,'wood');
   for(let j=0;j<2;j++)box('bench-back',0,.92+j*.2,.32,2.4,.14,.09,'wood');
   for(const x of [-.9,.9]){box('bench-leg',x,.28,0,.12,.55,.6,'metal');box('bench-post',x,.7,.32,.1,1.1,.1,'metal');}
   rod('lantern-post',1.85,.48,.3,.9,.12,'bark');box('lantern',1.85,1.04,.3,.32,.32,.32,'lantern');box('lantern-cap',1.85,1.24,.3,.46,.12,.46,'wood');
   ball('seat-side-bush',-1.9,.38,.65,.7,'leaf',[1,.8,1]);
  }
  if(i%12===11)yield 'waterfront: scenery clusters';
 }
 const lotus=NETWORK_LAKES.find(l=>l.id==='lotus'),lotusEdge=networkLakeOutline(lotus);
 root.metadata.waterAccents=[];
 for(let i=5;i<lotusEdge.length;i+=11){
  const edge=lotusEdge[i];record={x:lotus.x+(edge.x-lotus.x)*.89,z:lotus.z+(edge.z-lotus.z)*.89,yaw:i*.4};
  const cell=`${Math.floor(record.x/96)}:${Math.floor(record.z/96)}`;if(!cells.has(cell))cells.set(cell,new Map());current=cells.get(cell);
  root.metadata.waterAccents.push({...record});
  for(let j=0;j<3;j++){const x=Math.sin(j*2.4)*.85,z=Math.cos(j*2.4)*.85;ball('lotus-pad',x,.18,z,.65,'willow',[1,.045,1]);}
  for(let j=0;j<5;j++)ball('lotus-petal',Math.sin(j*Math.PI*.4)*.16,.27,Math.cos(j*Math.PI*.4)*.16,.13,'pink',[1,.6,1]);
  ball('lotus-center',0,.29,0,.10,'cream');
 }
 const reedLake=NETWORK_LAKES.find(l=>l.id==='reed'),reedEdge=networkLakeOutline(reedLake);
 for(let i=3;i<reedEdge.length;i+=14){
  const edge=reedEdge[i];record={x:reedLake.x+(edge.x-reedLake.x)*.92,z:reedLake.z+(edge.z-reedLake.z)*.92,yaw:i*.3};
  const cell=`${Math.floor(record.x/96)}:${Math.floor(record.z/96)}`;if(!cells.has(cell))cells.set(cell,new Map());current=cells.get(cell);
  root.metadata.waterAccents.push({...record});
  for(let j=0;j<4;j++){const h=.9+(j%2)*.35;rod('water-reed',(j-1.5)*.25,h/2,.2,h,.05,'grass');rod('water-reed-head',(j-1.5)*.25,h,.2,.26,.07,'reed');}
 }
 const streamer=stream?getWorldChunkStreamer(scene):null;
 let mergedCount=0;
 for(const [cell,groups] of cells){
  const node=new TransformNode('shore-cell-'+cell,scene);node.parent=root;
  for(const [key,meshes] of groups){
   const mesh=Mesh.MergeMeshes(meshes,true,true);if(!mesh)continue;
   mesh.name=`shore-batch-${cell}-${key}`;mesh.parent=node;mesh.material=materials[key];mesh.isPickable=false;mesh.receiveShadows=true;
   if(['bark','wood','leaf','light','pine','willow','blossom'].includes(key))shadows?.addShadowCaster(mesh);
   mesh.onDisposeObservable.add(()=>shadows?.removeShadowCaster(mesh));mergedCount++;
  }
  if(streamer){
   const [x,z]=cell.split(':').map(Number);node.setEnabled(false);
   const unregister=streamer.register(`shore-${node.uniqueId}`,x*96+48,z*96+48,{detailDistance:280,keepDistance:360,load:()=>{if(!node.isDisposed())node.setEnabled(true);},unload:()=>{if(!node.isDisposed())node.setEnabled(false);}});
   node.onDisposeObservable.addOnce(unregister);
  }
  yield 'waterfront: merged scenery';
 }
 root.metadata.batches=mergedCount;root.metadata.cells=cells.size;
 root.onDisposeObservable.add(()=>Object.values(materials).forEach(m=>m.dispose()));
 return root;
}
export function createWaterfrontScenery(scene,parent,shadows=null,options){const steps=createWaterfrontScenerySteps(scene,parent,shadows,options);let step;do{step=steps.next();}while(!step.done);return step.value;}
