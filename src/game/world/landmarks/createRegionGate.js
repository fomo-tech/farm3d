import { batchRigidMeshes } from '../../rendering/batchRigidMeshes.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';

// Shared architecture for public region entrances; all decoration stays off the road.
export function createRegionGate(scene, {name='region-gate', position, yaw=0, label, accent='#edaa57', halfSpan=6.4, shadows=null, parent=null}) {
 const root=new TransformNode(name,scene);root.position.set(position.x,position.y||0,position.z);root.rotation.y=yaw;root.parent=parent;
 const materials=[];
 const material=(key,hex)=>{const m=new StandardMaterial(`${name}-${key}`,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=new Color3(.08,.08,.08);materials.push(m);return m;};
 const wood=material('cedar','#bb8656'), cream=material('limestone','#f4e7cd'), roof=material('roof','#438d88'), trim=material('trim','#326b69'), color=material('accent',accent), leaf=material('leaf','#6ca769'), soil=material('soil','#745539');
 const box=(key,x,y,z,w,h,d,mat)=>{const mesh=MeshBuilder.CreateBox(`${name}-${key}`,{width:w,height:h,depth:d},scene);mesh.parent=root;mesh.position.set(x,y,z);mesh.material=mat;mesh.receiveShadows=true;mesh.isPickable=false;shadows?.addShadowCaster(mesh);return mesh;};
 for(const side of [-1,1]){
  const x=side*halfSpan;
  box(`foot-${side}`,x,.22,0,1.65,.44,1.7,cream);
  box(`post-${side}`,x,3.42,0,.9,6.4,.95,wood);
  box(`post-inlay-${side}`,x,3.6,-.49,.5,4.6,.045,cream);
  box(`collar-${side}`,x,1.0,0,1.02,.22,1.07,color);
  box(`cap-${side}`,x,6.55,0,1.35,.22,1.4,cream);
  const brace=box(`brace-${side}`,x-side*.48,5.92,0,.24,1.3,.55,wood);brace.rotation.z=side*.68;
  box(`planter-${side}`,x+side*1.75,.42,0,1.35,.84,1.35,cream);
  box(`planter-soil-${side}`,x+side*1.75,.84,0,1.12,.04,1.12,soil);
  for(let i=0;i<3;i++){
   const bush=MeshBuilder.CreateSphere(`${name}-shrub-${side}-${i}`,{diameter:1,segments:8},scene);bush.parent=root;bush.position.set(x+side*1.75+(i-1)*.28,1.2+(i===1?.2:0),0);bush.scaling.set(.8,.9,.85);bush.material=leaf;bush.isPickable=false;shadows?.addShadowCaster(bush);
  }
  box(`lamp-arm-${side}`,x-side*.55,5.2,0,.75,.12,.16,trim);
  box(`lamp-cap-${side}`,x-side*.85,4.96,0,.42,.13,.42,trim);
  box(`lamp-${side}`,x-side*.85,4.72,0,.32,.36,.32,cream);
 }
 box('beam',0,6.6,0,halfSpan*2+1.5,.42,.95,wood);
 const slope=.20, roofWidth=halfSpan*2+2.5;
 for(const side of [-1,1]){const panel=box(`roof-${side}`,0,6.91,side*.58,roofWidth,.18,1.28,roof);panel.rotation.x=side*slope;box(`eave-${side}`,0,6.78,side*1.2,roofWidth+.1,.14,.14,trim);}
 box('ridge',0,7.05,0,roofWidth+.2,.16,.2,trim);
 const signWidth=Math.min(10.8,halfSpan*2-2.4);
 box('name-frame',0,5.85,0,signWidth+.24,1.24,.64,wood);
 box('accent-line',0,5.25,-.34,signWidth,.07,.04,color);
 const texture=new DynamicTexture(`${name}-name`,{width:1024,height:128},scene,true);texture.hasAlpha=false;
 const signMat=material('name','#ffffff');signMat.diffuseTexture=texture;signMat.emissiveColor=new Color3(.18,.18,.18);signMat.specularColor=Color3.Black();
 function updateName(value){const ctx=texture.getContext();ctx.clearRect(0,0,1024,128);ctx.fillStyle='#fff6e5';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#284c4a';ctx.textAlign='center';ctx.textBaseline='middle';let size=72;ctx.font=`800 ${size}px Nunito, sans-serif`;while(ctx.measureText(value).width>920&&size>30){size-=2;ctx.font=`800 ${size}px Nunito, sans-serif`;}ctx.fillText(value,512,68);texture.update();}
 for(const side of [-1,1]){const panel=MeshBuilder.CreatePlane(`${name}-name-${side}`,{width:signWidth,height:1.05},scene);panel.parent=root;panel.position.set(0,5.85,side*.331);panel.rotation.y=side===1?Math.PI:0;panel.material=signMat;panel.isPickable=false;}
 updateName(label);
 // Keep the named beam/sign planes for layout checks and editable lettering.
 // All other solid gate parts share a handful of material draw calls.
 const preserve=new Set(root.getChildMeshes().filter(mesh=>mesh.name.endsWith('-beam')||mesh.name.includes('-name-')));
 batchRigidMeshes(root,{exclude:preserve,shadows});
 root.metadata={regionGate:true,halfSpan,clearance:5.23,label};
 return {root,updateName,dispose(){texture.dispose();root.dispose(false,false);materials.forEach(m=>m.dispose());}};
}
