import {clipShoreAtWaterways} from './clipShoreAtWaterways.js';
import {WATER_PALETTE as WATER} from '../../../../shared/waterPalette.js';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import {Texture} from '@babylonjs/core/Materials/Textures/texture.js';
import {Color3} from '@babylonjs/core/Maths/math.color.js';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial.js';
import {Mesh} from '@babylonjs/core/Meshes/mesh.js';
import {VertexBuffer} from '@babylonjs/core/Buffers/buffer.js';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder.js';
import {Vector3} from '@babylonjs/core/Maths/math.vector.js';
import {NETWORK_LAKES,NETWORK_STREAMS,pointInWaterPolygon,networkLakeOutline,streamBanks,networkCollisionBoxes,NETWORK_BRIDGES,networkWaterAt} from '../../../../shared/waterNetwork.js';
// Shared landscape geometry for the world and its review scene.
export function createLandscapeWaterMaterial(scene,parent,animate=true){
 // A restrained surface avoids the bright vertical bands of the main river texture.
 const texture=new DynamicTexture('network-water-ripples',{width:256,height:256},scene,false);
 texture.wrapU=texture.wrapV=Texture.WRAP_ADDRESSMODE;
 const ctx=texture.getContext();ctx.fillStyle='#f1ffff';ctx.fillRect(0,0,256,256);
 for(let i=0;i<18;i++){const x=(i*73)%256,y=(i*47)%256;ctx.strokeStyle=i%3?'#f7ffff':'#ffffff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+8,y+2,x+18,y);ctx.stroke();}
 texture.update();
 const waterMaterial=new StandardMaterial('network-calm-water',scene);waterMaterial.diffuseTexture=texture;waterMaterial.diffuseColor=Color3.White();waterMaterial.emissiveColor=Color3.FromHexString('#2b7680').scale(.16);waterMaterial.specularColor=new Color3(.12,.18,.18);waterMaterial.specularPower=48;waterMaterial.backFaceCulling=false;waterMaterial.needDepthPrePass=true;waterMaterial.forceDepthWrite=true;
 waterMaterial.metadata={landscapeWater:true};
 const observer=animate?scene.onBeforeRenderObservable.add(()=>{texture.uOffset+=scene.getEngine().getDeltaTime()*.000002;}):null;
 parent.onDisposeObservable.add(()=>{if(observer)scene.onBeforeRenderObservable.remove(observer);texture.dispose();waterMaterial.dispose();});
 return waterMaterial;
}
export function createWaterNetwork(scene,parent,waterMaterial,bankMaterial,shadows=null){
 if(!waterMaterial?.metadata?.landscapeWater)waterMaterial=createLandscapeWaterMaterial(scene,parent);
 const path=(points,y)=>points.map(p=>new Vector3(p.x,y,p.z));
 const ribbon=(name,paths,material,closePath=false,tones=null)=>{const mesh=MeshBuilder.CreateRibbon(name,{pathArray:paths,closePath,sideOrientation:2},scene);mesh.parent=parent;mesh.material=material;mesh.isPickable=false;const positions=mesh.getVerticesData(VertexBuffer.PositionKind),normals=[],uvs=[];for(let i=0;i<positions.length;i+=3){normals.push(0,1,0);uvs.push(positions[i]/48,positions[i+2]/48);}mesh.setVerticesData(VertexBuffer.NormalKind,normals);mesh.setVerticesData(VertexBuffer.UVKind,uvs);if(tones){const colors=[],perPath=positions.length/3/2/paths.length,base=perPath*paths.length;for(let i=0;i<positions.length/3;i++){const row=Math.floor((i%base)/perPath),c=Color3.FromHexString(tones[row]);colors.push(c.r,c.g,c.b,1);}mesh.setVerticesData(VertexBuffer.ColorKind,colors);mesh.useVertexColors=true;}mesh.metadata={waterNetwork:true};if(material===bankMaterial)clipShoreAtWaterways(mesh,name.replace(/-shore.*$/,''));return mesh;};
 const lakeEdges=NETWORK_LAKES.map(l=>networkLakeOutline(l));
 for(const stream of NETWORK_STREAMS){
  const onLake=p=>lakeEdges.some(outline=>pointInWaterPolygon(p.x,p.z,outline));
  let start=stream.samples.findIndex(p=>!onLake(p)),end=stream.samples.length-1;
  while(end>=0&&onLake(stream.samples[end]))end--;
  if(start<0)continue;start=Math.max(0,start-1);end=Math.min(stream.samples.length-1,end+1);
  const samples=stream.samples.slice(start,end+1),banks=stream.banks.map(b=>b.slice(start,end+1)),outer=streamBanks(samples,2);

  ribbon(`${stream.id}-water`,[path(banks[0],.08),path(samples,.08),path(banks[1],.08)],waterMaterial,false,[WATER.edge,WATER.body,WATER.edge]);
 }
 for(const lake of NETWORK_LAKES){
  const outline=networkLakeOutline(lake),center=outline.map(()=>new Vector3(lake.x,.12,lake.z));

  const inner=f=>outline.map(p=>new Vector3(lake.x+(p.x-lake.x)*f,.12,lake.z+(p.z-lake.z)*f));
  ribbon(`${lake.id}-water`,[path(outline,.12),inner(.86),inner(.5),center],waterMaterial,true,[WATER.edge,WATER.shallow,WATER.body,WATER.deep]);
 }
 const material=(name,color)=>{const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(color);m.specularColor=Color3.Black();return m;};
 const wood=material('network-bridge-wood','#b49068');
 const box=(name,x,y,z,width,height,depth)=>{const m=MeshBuilder.CreateBox(name,{width,height,depth},scene);m.position.set(x,y,z);m.parent=parent;m.material=wood;return m;};
 for(const b of NETWORK_BRIDGES){
  const across=b.axis==='x';
  box(`${b.id}-deck`,b.cx,b.deckY-.09,b.cz,across?b.span:b.width,.18,across?b.width:b.span);
  for(const side of [-1,1]){
   const offset=side*(b.width/2-.15);
   box(`${b.id}-rail`,b.cx+(across?0:offset),.92,b.cz+(across?offset:0),across?b.span:.18,.16,across?.18:b.span);
   for(let t=-b.span/2;t<=b.span/2;t+=6)box(`${b.id}-post`,b.cx+(across?t:offset),.55,b.cz+(across?offset:t),.28,1,.28);
  }
 }
 return networkCollisionBoxes();
}
