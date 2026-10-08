import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder.js';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode.js';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial.js';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import {Color3} from '@babylonjs/core/Maths/math.color.js';
import {Vector3} from '@babylonjs/core/Maths/math.vector.js';
import {LOTTERY_CONFIG} from '../../../shared/lotteryConfig.js';
export function createFortuneNPC(scene,shadows,position=LOTTERY_CONFIG.npc){
 const root=new TransformNode('fortune-npc',scene);root.position.set(position.x,0,position.z);
 const mats={};for(const [name,color] of Object.entries({skin:'#efc49b',red:'#cb6550',gold:'#e7b859',ink:'#382c2d',white:'#fff6df',wood:'#c39363',teal:'#71a79a',blush:'#df9178'})){const m=new StandardMaterial(`fortune-${name}`,scene);m.diffuseColor=Color3.FromHexString(color);m.specularColor=new Color3(.08,.08,.08);mats[name]=m;}
 const figure=new TransformNode('fortune-figure',scene);figure.parent=root;
 const part=(name,kind,options,xyz,material,parent=figure)=>{const m=MeshBuilder[kind](`fortune-${name}`,options,scene);m.position.set(...xyz);m.parent=parent;m.material=mats[material];m.metadata={type:'npc',npcId:'fortune_god',npcName:'Thần Tài',interactive:true};shadows?.addShadowCaster(m);return m;};
 for(const x of [-.28,.28])part(`shoe-${x}`,'CreateSphere',{diameter:.48,segments:16},[x,.22,.15],'ink').scaling.set(1,.65,1.3);
 part('robe','CreateSphere',{diameter:1.2,segments:24},[0,.95,0],'red').scaling.set(.9,1.2,.75);
 part('belt','CreateCylinder',{height:.16,diameter:1.06,tessellation:32},[0,.83,0],'gold');
 for(const y of [1.05,1.3])part(`button-${y}`,'CreateSphere',{diameter:.12,segments:12},[0,y,.48],'gold');
 part('head','CreateSphere',{diameter:1.38,segments:32},[0,2.05,0],'skin').scaling.set(1,.92,.9);
 for(const x of [-.67,.67])part(`ear-${x}`,'CreateSphere',{diameter:.26,segments:16},[x,2.03,0],'skin');
 for(const x of [-.24,.24]){
  part(`eye-${x}`,'CreateSphere',{diameter:.14,segments:16},[x,2.1,.598],'ink').scaling.y=1.22;
  part(`glint-${x}`,'CreateSphere',{diameter:.04,segments:10},[x-.025,2.14,.669],'white');
  part(`brow-${x}`,'CreateTube',{path:[new Vector3(x-.11,2.29,.56),new Vector3(x,2.33,.57),new Vector3(x+.11,2.29,.56)],radius:.035,tessellation:12},[0,0,0],'ink');
  part(`cheek-${x}`,'CreateSphere',{diameter:.2,segments:16},[x*1.75,1.93,.52],'blush').scaling.z=.22;
  const moustache=part(`moustache-${x}`,'CreateSphere',{diameter:.26,segments:16},[x*.65,1.86,.61],'ink');moustache.scaling.set(1.25,.38,.5);moustache.rotation.z=x<0?.18:-.18;
 }
 part('nose','CreateSphere',{diameter:.19,segments:16},[0,1.98,.64],'skin');
 part('beard','CreateCylinder',{height:.34,diameterTop:.34,diameterBottom:.12,tessellation:24},[0,1.58,.49],'ink');
 part('smile','CreateSphere',{diameter:.26,segments:16},[0,1.78,.62],'ink').scaling.set(1,.42,.3);
 part('smile-teeth','CreateSphere',{diameter:.18,segments:12},[0,1.81,.65],'white').scaling.set(1,.2,.25);
 part('hat-band','CreateCylinder',{height:.16,diameter:1.38,tessellation:32},[0,2.56,0],'gold');
 part('hat','CreateSphere',{diameter:1.29,segments:24},[0,2.66,0],'red').scaling.y=.5;
 part('hat-jewel','CreateSphere',{diameter:.24,segments:16},[0,2.76,.57],'gold');
 for(const x of [-.86,.86]){const wing=part(`hat-wing-${x}`,'CreateSphere',{diameter:.5,segments:16},[x,2.64,0],'gold');wing.scaling.set(1,.35,.45);wing.rotation.z=x*.35;}
 const arm=new TransformNode('fortune-wave',scene);arm.parent=figure;arm.position.set(-.62,1.43,0);
 part('wave-sleeve','CreateCapsule',{height:.6,radius:.2,tessellation:16},[-.15,.15,.06],'red',arm).rotation.z=-.45;
 part('wave-hand','CreateSphere',{diameter:.33,segments:16},[-.28,.48,.12],'skin',arm);
 part('offer-sleeve','CreateCapsule',{height:.6,radius:.21,tessellation:16},[.63,1.12,.18],'red').rotation.z=.8;
 part('offer-hand','CreateSphere',{diameter:.3,segments:16},[.76,1.13,.43],'skin');
 const ingot=part('ingot','CreateSphere',{diameter:.6,segments:20},[.76,1.32,.47],'gold');ingot.scaling.set(1.3,.42,.65);
 for(const x of [.44,1.08])part(`ingot-end-${x}`,'CreateSphere',{diameter:.23,segments:16},[x,1.43,.47],'gold');
 const gift=part('handed-ticket','CreateBox',{width:.38,height:.035,depth:.25},[.78,1.17,.75],'white');gift.isVisible=false;
 const offerParts=figure.getChildMeshes().filter(m=>m.name.includes('offer-')||m.name.includes('ingot')||m===gift).map(mesh=>({mesh,z:mesh.position.z}));
 let givingUntil=0;
 // A compact stall behind the character, with physically legible hanging sign.
 part('counter','CreateBox',{width:2.7,height:.85,depth:.9},[2.1,.5,-.6],'wood',root);
 part('counter-top','CreateBox',{width:2.9,height:.12,depth:1.1},[2.1,.99,-.6],'white',root);
 for(const x of [.7,3.5])part(`post-${x}`,'CreateCylinder',{height:3.2,diameter:.09,tessellation:12},[x,1.6,-1],'wood',root);
 part('awning','CreateBox',{width:3.3,height:.17,depth:1.8},[2.1,3.25,-.55],'red',root);
 part('sign-frame','CreateBox',{width:2.28,height:.56,depth:.08},[2.1,2.87,.2],'gold',root);
 const texture=new DynamicTexture('fortune-sign-text',{width:512,height:128},scene,false);texture.drawText('VÉ MAY MẮN',null,85,'bold 45px sans-serif','#536a53','#fff6df',true);
 const signMaterial=new StandardMaterial('fortune-sign',scene);signMaterial.diffuseTexture=texture;signMaterial.specularColor=Color3.Black();
 const sign=part('sign','CreatePlane',{width:2.15,height:.48,sideOrientation:2},[2.1,2.87,.251],'white',root);sign.material=signMaterial;sign.rotation.y=Math.PI;
 for(let i=0;i<3;i++){const t=part(`ticket-${i}`,'CreateBox',{width:.45,height:.025,depth:.24},[1.5+i*.5,1.07,-.4],'gold',root);t.rotation.y=.15*i;}
 return {root,position:new Vector3(position.x,0,position.z),giveTicket(){givingUntil=performance.now()+1400;},update(time){const giving=time<givingUntil;gift.isVisible=giving;for(const {mesh,z} of offerParts)mesh.position.z=z+(giving?.2*Math.sin((1400-(givingUntil-time))/1400*Math.PI):0);figure.position.y=Math.sin(time*.002)*.025;arm.rotation.z=Math.sin(time*.0025)*.14;},dispose(){root.dispose(false,true);Object.values(mats).forEach(m=>m.dispose());texture.dispose();}};
}
