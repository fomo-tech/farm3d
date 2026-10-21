import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder.js';
import {Mesh} from '@babylonjs/core/Meshes/mesh.js';

export function* createCityStreetFurnitureSteps(scene,root,materials,colliders=[]){
 const groups=new Map();let count=0;
 const add=(id,size,x,y,z,material)=>{
  const mesh=MeshBuilder.CreateBox(`city-street-${id}`,size,scene);mesh.position.set(x,y,z);mesh.material=material;mesh.isPickable=false;
  const key=`${Math.floor(x/256)}:${Math.floor(z/256)}:${material.uniqueId}`;
  if(!groups.has(key))groups.set(key,[]);groups.get(key).push(mesh);count++;return mesh;
 };
 const junctions=[[-130,-130],[-45,-45],[45,-45],[130,-130],[-130,45],[130,45],[-45,130],[45,130],[45,45],[130,-45]];
 for(const [index,[x,z]] of junctions.entries()){
  const offset=Math.abs(x)===130?8.5:7.5;
  for(const side of [-1,1]){
   const px=x+side*offset,pz=z-side*offset;
   add(`signal-pole-${index}-${side}`,{width:.16,height:4.2,depth:.16},px,2.1,pz,materials.metal);
   add(`signal-arm-${index}-${side}`,{width:2.4,height:.12,depth:.12},px-side*1.1,4.1,pz,materials.metal);
   add(`signal-case-${index}-${side}`,{width:.38,height:1.05,depth:.3},px-side*2.2,3.7,pz,materials.metal);
   for(let lamp=0;lamp<3;lamp++){
    // Lamps stay separate from static batches so the server's phase can drive them.
    const mesh=MeshBuilder.CreateBox(`city-signal-light-${index}-${side}-${lamp}`,{width:.21,height:.21,depth:.035},scene);
    mesh.position.set(px-side*2.2,4-lamp*.3,pz-.17);mesh.parent=root;mesh.material=materials.tire;mesh.isPickable=false;
    mesh.metadata={citySignal:{axis:side<0?'northSouth':'eastWest',color:['red','amber','green'][lamp]}};
   }
  }
  yield 'city: signalized intersections';
 }
 // Curbside furniture stays off the carriageway and the spawn plaza.
 for(const [index,[x,z]] of [[-33,-61],[33,-61],[-112,-38],[112,-38],[-112,38],[112,38],[-33,111],[33,111]].entries()){
  add(`bench-seat-${index}`,{width:2,height:.15,depth:.65},x,.55,z,materials.wood);
  add(`bench-back-${index}`,{width:2,height:.6,depth:.12},x,.95,z+.3,materials.wood);
  for(const side of [-1,1])add(`bench-leg-${index}-${side}`,{width:.12,height:.5,depth:.5},x+side*.75,.25,z,materials.metal);
  add(`bin-${index}`,{width:.5,height:.85,depth:.5},x+1.8,.425,z,materials.metal);
  yield 'city: sidewalks and street furniture';
 }
 // Bus shelters and marked lay-bys establish recognizable street destinations.
 for(const [index,[x,z]] of [[-22,-138],[22,138]].entries()){
  add(`bus-shelter-roof-${index}`,{width:5,height:.2,depth:1.7},x,2.8,z,materials.silver);
  for(const side of [-1,1])add(`bus-shelter-frame-${index}-${side}`,{width:.12,height:2.7,depth:.12},x+side*2.2,1.35,z+.55,materials.metal);
  add(`bus-shelter-glass-${index}`,{width:4.5,height:1.9,depth:.07},x,1.65,z+.6,materials.glass);
  add(`bus-shelter-bench-${index}`,{width:3,height:.18,depth:.5},x,.65,z+.2,materials.silver);
  yield 'city: bus stops';
 }
 // Palm-lined boulevards give the central streets a coastal urban silhouette.
 for(let index=0;index<24;index++){
  const x=-114+(index%8)*32,z=index<8?-139:index<16?139:-54;
  if(Math.abs(x)<10)continue;
  add(`palm-trunk-${index}`,{width:.34,height:7,depth:.34},x,3.5,z,materials.wood);
  for(let frond=0;frond<7;frond++){
   const angle=frond*Math.PI*2/7,leaf=add(`palm-frond-${index}-${frond}`,{width:3.1,height:.09,depth:.65},x+Math.cos(angle)*1.15,6.8,z+Math.sin(angle)*1.15,materials.leaf);
   leaf.rotation.y=-angle;leaf.rotation.z=.2;
  }
  if(index%4===3)yield 'city: coastal boulevard palms';
 }
 // Cargo stacks at East Docks, with contrasting vertical ribs.
 for(let i=0;i<16;i++){
  const x=885+(i%4)*8,z=220+Math.floor(i/4)*14;
  add(`cargo-${i}`,{width:5.8,height:2.6,depth:10},x,1.3,z,i%2?materials.brick:materials.navy);
  colliders.push({id:`city-cargo-${i}`,minX:x-2.9,maxX:x+2.9,minZ:z-5,maxZ:z+5});
  for(const side of [-1,1])for(let rib=0;rib<6;rib++)add(`cargo-rib-${i}-${side}-${rib}`,{width:.09,height:2.55,depth:.08},x+side*2.94,1.3,z-4+rib*1.6,materials.silver);
  if(i%4===3)yield 'city: freight terminal';
 }
 for(const [key,meshes] of groups){const merged=Mesh.MergeMeshes(meshes,true,true);merged.name=`city-street-furniture-${key}`;merged.parent=root;merged.isPickable=false;merged.receiveShadows=true;yield 'city: streetscape batches';}
 root.metadata.streetFurnitureParts=count;
}
