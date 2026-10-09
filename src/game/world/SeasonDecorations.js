import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder.js';
import {Mesh} from '@babylonjs/core/Meshes/mesh.js';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode.js';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial.js';
import {Color3} from '@babylonjs/core/Maths/math.color.js';
import {WORLD_LAYOUT} from './worldLayout.js';
import {getTerrainHeight} from './TerrainHeightSystem.js';

export function seasonalSites(){return [
 ...[[-23,-20],[23,-20],[-23,20],[23,20]].map(([x,z],i)=>({id:`plaza-${i}`,x,z,kind:'plaza'})),
 // Offset from the four main approaches; leave the fountain and arrival lane open.
 ...Array.from({length:8},(_,i)=>{
  const angle=Math.PI/8+i*Math.PI/4;
  return {id:`plaza-ring-${i}`,x:Math.sin(angle)*16,z:Math.cos(angle)*16,kind:'plaza'};
 }),
 ...WORLD_LAYOUT.villages.flatMap(v=>[-1,1].map(side=>({id:`gate-${v.id}-${side}`,x:v.gate.x+side*8,z:v.gate.z+3,kind:'gate'}))),
 ...WORLD_LAYOUT.farms.map(f=>({id:`farm-${f.id}`,x:f.x+10,z:f.z-10,kind:'farm'}))
];}

export function createHalloweenCluster(scene,site,materials){
 const root=new TransformNode(`halloween-${site.id}`,scene),pieces=[];
 root.position.set(site.x,getTerrainHeight(site.x,site.z),site.z);
 const scale=site.kind==='plaza'?1.65:site.kind==='gate'?1.3:1.1;
 root.scaling.setAll(scale);
 root.rotation.y=site.kind==='plaza'?Math.atan2(site.x,site.z):0;
 const own=(m,mat,x,y,z)=>{m.material=materials[mat];m.position.set(x,y,z);m.isPickable=false;m.metadata={seasonDecoration:true};pieces.push(m);return m;};
 const box=(name,x,y,z,w,h,d,mat)=>own(MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene),mat,x,y,z);
 const pumpkin=(x,z,size,lift=0)=>{
  const first=pieces.length;
  for(let i=0;i<10;i++){const a=i*Math.PI/5;own(MeshBuilder.CreateSphere('pumpkin-rib',{diameter:1,segments:12},scene),'orange',x+Math.cos(a)*size*.24,size*.48,z+Math.sin(a)*size*.24).scaling.set(size*.6,size*.85,size*.6);}
  own(MeshBuilder.CreateCylinder('pumpkin-stem',{height:size*.23,diameter:size*.12,tessellation:6},scene),'wood',x,size*.95,z).rotation.z=.15;
  // A warm carved face, built as simple triangular eyes and a smile.
  for(const side of [-1,1]){
   const socket=own(MeshBuilder.CreateCylinder('pumpkin-eye-socket',{height:.035,diameter:size*.31,tessellation:3},scene),'purple',x+side*size*.18,size*.6,z-size*.49);socket.rotation.x=Math.PI/2;
   const eye=own(MeshBuilder.CreateCylinder('pumpkin-eye',{height:.04,diameter:size*.21,tessellation:3},scene),'glow',x+side*size*.18,size*.6,z-size*.515);eye.rotation.x=Math.PI/2;
  }
  box('pumpkin-mouth-carving',x,size*.34,z-size*.49,size*.49,size*.18,size*.06,'purple');
  for(let i=-2;i<=2;i++)box('pumpkin-grin',x+i*size*.085,size*(.32+Math.abs(i)*.025),z-size*.53,size*.07,size*(i%2===0?.08:.12),size*.025,'glow');
  for(const mesh of pieces.slice(first))mesh.position.y+=lift;
 };
 box('season-crate',-.6,.3,.2,.85,.6,.7,'wood');
 for(let i=0;i<3;i++)box('crate-slat',-.6,.13+i*.19,-.17,.88,.08,.05,'trim');
 pumpkin(-.6,.2,.7,.6);pumpkin(.45,-.25,1);pumpkin(1,.35,.48);
 box('lantern-post',-1.3,1.2,.35,.1,2.4,.1,'wood');
 box('lantern-arm',-1.04,2.36,.35,.6,.1,.1,'wood');
 box('lantern-frame',-.8,1.96,.35,.4,.54,.4,'purple');
 box('lantern-window',-.8,1.96,.13,.28,.35,.03,'glow');
 box('lantern-window-back',-.8,1.96,.57,.28,.35,.03,'glow');
 for(const side of [-1,1])box('lantern-window-side',-.8+side*.22,1.96,.35,.03,.35,.28,'glow');
 box('lantern-crossbar',-.8,1.96,.1,.035,.38,.04,'purple');
 own(MeshBuilder.CreateCylinder('lantern-roof',{height:.18,diameterTop:0,diameterBottom:.58,tessellation:4},scene),'purple',-.8,2.3,.35);
 if(site.kind!=='farm'){
  // A tall, readable silhouette remains visible from the normal game camera.
  box('festival-plinth',.1,.07,.15,3.25,.14,1.9,'purple');
  const ghost=own(MeshBuilder.CreateSphere('ghost-head',{diameter:.65,segments:12},scene),'trim',.65,2.55,.65);ghost.scaling.y=1.15;
  own(MeshBuilder.CreateCylinder('ghost-body',{height:.7,diameterTop:.59,diameterBottom:.85,tessellation:12},scene),'trim',.65,2.15,.65);
  for(const side of [-1,1]){
   own(MeshBuilder.CreateSphere('ghost-eye',{diameter:.11,segments:8},scene),'purple',.65+side*.13,2.57,.34).scaling.z=.4;
   const wing=box('ghost-arm',.65+side*.43,2.35,.65,.36,.14,.16,'trim');wing.rotation.z=side*.35;
  }
  own(MeshBuilder.CreateSphere('ghost-mouth',{diameter:.13,segments:8},scene),'purple',.65,2.37,.33).scaling.set(.8,1.3,.4);
  for(let i=0;i<4;i++)own(MeshBuilder.CreateSphere('ghost-hem',{diameter:.25,segments:8},scene),'trim',.35+i*.2,1.8,.65);
  box('festival-standard',-1.3,2.7,.35,.08,1.05,.08,'wood');
  const flag=box('festival-pennant',-.9,2.91,.35,.7,.39,.06,'purple');flag.rotation.z=-.12;
  const badge=own(MeshBuilder.CreateCylinder('festival-moon',{height:.07,diameter:.25,tessellation:16},scene),'glow',-.9,2.91,.3);badge.rotation.x=Math.PI/2;
 }
 if(site.kind==='farm'){
  box('scarecrow-post',1.65,1,.7,.09,2,.09,'wood');
  const arms=box('scarecrow-arms',1.65,1.42,.7,1.05,.16,.16,'trim');arms.rotation.z=.1;
  own(MeshBuilder.CreateCylinder('scarecrow-coat',{height:.65,diameterTop:.33,diameterBottom:.58,tessellation:6},scene),'purple',1.65,1.15,.7);
  own(MeshBuilder.CreateSphere('scarecrow-head',{diameter:.4,segments:8},scene),'trim',1.65,1.8,.7);
  own(MeshBuilder.CreateCylinder('scarecrow-hat',{height:.34,diameterTop:0,diameterBottom:.62,tessellation:8},scene),'purple',1.65,2.07,.7);
 }
 // Batch by material: no lights, particles, physics bodies or individual draw calls.
 for(const mat of Object.values(materials)){
  const group=pieces.filter(m=>m.material===mat);if(!group.length)continue;
  const mesh=Mesh.MergeMeshes(group,true,true,undefined,false,false);mesh.parent=root;mesh.material=mat;mesh.isPickable=false;mesh.receiveShadows=true;mesh.metadata={seasonDecoration:true};mesh.freezeWorldMatrix();
 }
 return root;
}

export class SeasonDecorations {
 constructor(scene,getPosition,{mobile=false}={}){
  this.scene=scene;this.getPosition=getPosition;this.radius=mobile?85:135;this.limit=mobile?14:24;this.roots=new Map();this.sites=seasonalSites();this.last=0;
  this.materials={};for(const [id,color] of Object.entries({orange:'#ff781b',wood:'#63402c',trim:'#fff0d5',purple:'#251337',glow:'#ffcf57'})){
   const m=new StandardMaterial(`halloween-${id}`,scene);m.diffuseColor=Color3.FromHexString(color);m.specularColor=Color3.Black();if(id==='glow'){m.emissiveColor=m.diffuseColor;m.disableLighting=true;}if(id==='orange')m.emissiveColor=m.diffuseColor.scale(.12);this.materials[id]=m;
  }
  this.observer=scene.onBeforeRenderObservable.add(()=>this.update());
 }
 update(){
  const now=performance.now();if(now-this.last<350)return;this.last=now;
  const p=this.getPosition();if(!p)return;
  const nearby=this.sites.map(s=>({...s,d:Math.hypot(s.x-p.x,s.z-p.z)})).filter(s=>s.d<this.radius).sort((a,b)=>a.d-b.d).slice(0,this.limit);
  const wanted=new Set(nearby.map(s=>s.id));
  for(const [id,root] of this.roots)if(!wanted.has(id)){root.dispose();this.roots.delete(id);}
  const next=nearby.find(s=>!this.roots.has(s.id));if(next)this.roots.set(next.id,createHalloweenCluster(this.scene,next,this.materials));
 }
 dispose(){this.scene.onBeforeRenderObservable.remove(this.observer);for(const root of this.roots.values())root.dispose();this.roots.clear();for(const m of Object.values(this.materials))m.dispose();}
}
