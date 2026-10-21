import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder.js';
import {Mesh} from '@babylonjs/core/Meshes/mesh.js';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial.js';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import {Color3} from '@babylonjs/core/Maths/math.color.js';
import {CITY_LANDMARK_BUILDINGS} from './cityUrbanLayout.js';

// One authored street kit, rather than adding more undifferentiated city blocks.
export function createCitySampleDistrict(scene,root,materials){
 const batches=new Map();
 function piece(name,w,h,d,x,y,z,material){
  const mesh=MeshBuilder.CreateBox(`sample-${name}`,{width:w,height:h,depth:d},scene);
  mesh.position.set(x,y,z);mesh.material=material;mesh.isPickable=false;
  if(!batches.has(material))batches.set(material,[]);batches.get(material).push(mesh);
  return mesh;
 }
 const fronts=[['shopping-a','PACIFIC COFFEE'],['shopping-b','RECORDS & VINYL'],['shopping-c','WESTSIDE MARKET'],['entertainment-a','STUDIO 24'],['entertainment-b','CITY HOTEL'],['entertainment-c','CORNER DELI'],['city-metro-station','CENTRAL STATION'],['civic-services','MOTOR SERVICES']];
 for(const [id,label] of fronts){
  const b=CITY_LANDMARK_BUILDINGS.find(item=>item.id===id);if(!b)continue;
  const face=b.z-b.depth/2;
  // All frontage is attached to the existing footprint: no invisible new barriers.
  piece(`${id}-fascia`,b.width-.8,.7,.18,b.x,3.65,face-.12,materials.roof);
  piece(`${id}-cornice`,b.width+.3,.18,.4,b.x,4.12,face-.16,materials.concrete);
  for(let offset=-b.width/2+2.4;offset<b.width/2-1;offset+=4){
   const x=b.x+offset;
   piece(`${id}-shopglass`,3.25,2.45,.12,x,1.65,face-.14,materials.window);
   for(const side of [-1,1])piece(`${id}-jamb`,.12,2.7,.2,x+side*1.66,1.65,face-.23,materials.silver);
   piece(`${id}-sill`,3.45,.16,.24,x,.36,face-.23,materials.concrete);
   piece(`${id}-transom`,3.45,.12,.2,x,2.95,face-.23,materials.silver);
   piece(`${id}-awning`,3.6,.16,1.1,x,3.18,face-.5,materials[id==='shopping-a'?'green':'roof']);
  }
  for(let y=6;y<b.height-1;y+=3.2)piece(`${id}-floorband`,b.width+.16,.14,.2,b.x,y,face-.08,materials.concrete);
  const sign=MeshBuilder.CreatePlane(`sample-sign-${id}`,{width:Math.min(10,b.width-2),height:.55,sideOrientation:Mesh.DOUBLESIDE},scene);
  sign.position.set(b.x,3.66,face-.23);sign.parent=root;sign.isPickable=false;
  sign.metadata={sampleDistrict:true,label};sign.material=materials.silver;
  if(typeof document!=='undefined'||typeof OffscreenCanvas!=='undefined'){
   const texture=new DynamicTexture(`sample-lettering-${id}`,{width:1024,height:64},scene,false);
   texture.drawText(label,null,46,'bold 40px sans-serif','#f4ead5','#202a30',true);
   const material=new StandardMaterial(`sample-sign-material-${id}`,scene);
   material.diffuseTexture=texture;material.emissiveColor=new Color3(.25,.25,.25);sign.material=material;
  }
 }
 // Low contrast scored paving stays outside the 16 m central carriageways.
 for(const sx of [-1,1])for(const sz of [-1,1])for(let offset=10;offset<=22;offset+=2){
  piece('paving-joint-x',.035,.008,14,sx*offset,.138,sz*16,materials.curb);
  piece('paving-joint-z',14,.008,.035,sx*16,.138,sz*offset,materials.curb);
 }
 // The first usable car gets a clearly bounded, unobstructed pickup bay.
 for(const x of [17.8,22.2])piece('garage-bay',.09,.012,5.5,x,.18,13,materials.crosswalk);
 piece('garage-bay-end',4.5,.012,.09,20,.18,15.75,materials.crosswalk);
 for(const [material,meshes] of batches){
  const merged=Mesh.MergeMeshes(meshes,true,true);
  if(merged){merged.name=`sample-street-kit-${material.name}`;merged.parent=root;merged.receiveShadows=true;merged.isPickable=false;merged.metadata={sampleDistrict:true};}
 }
}
