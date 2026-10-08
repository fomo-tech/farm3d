import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight.js';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color3,Color4 } from '@babylonjs/core/Maths/math.color.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { OwnedHerd } from '../livestock/OwnedHerd.js';
import { createLivestockAnimal } from '../livestock/createLivestockAnimal.js';
import { createOpenAirCorral } from '../farming/createOpenAirCorral.js';
import { createToyMaterial } from '../rendering/PlayTogetherTheme.js';
import { FARM_CONFIG } from '../../../shared/farmConfig.js';
const engine=new Engine(document.getElementById('view'),true);engine.setHardwareScalingLevel(1/Math.min(devicePixelRatio,1.5));
const scene=new Scene(engine);scene.clearColor=new Color4(.82,.89,.84,1);
const view=new URLSearchParams(location.search).get('view')||'herd',single=Object.hasOwn(FARM_CONFIG.animals,view);
const camera=new ArcRotateCamera('camera',-Math.PI/2-.5,1.05,single?2.8:10,new Vector3(0,single?.65:.4,0),scene);camera.attachControl(document.getElementById('view'),true);camera.lowerRadiusLimit=single?1.7:6;camera.upperRadiusLimit=single?6:15;
new HemisphericLight('fill',new Vector3(0,1,0),scene).intensity=.8;
const sun=new DirectionalLight('sun',new Vector3(.5,-1,.6),scene);sun.position.set(-8,12,-10);sun.intensity=.65;
const shadows=new ShadowGenerator(1024,sun);shadows.useBlurExponentialShadowMap=true;shadows.blurKernel=16;shadows.bias=.002;shadows.normalBias=.02;shadows.setDarkness(.2);
const floor=MeshBuilder.CreateGround('floor',{width:60,height:60},scene);const grass=new StandardMaterial('grass',scene);grass.diffuseColor=Color3.FromHexString('#a5bc87');grass.specularColor=Color3.Black();floor.material=grass;floor.receiveShadows=true;
if(single){const root=new TransformNode('animal-preview',scene);const animal=createLivestockAnimal(scene,root,view,hex=>createToyMaterial(scene,`preview-${hex}`,hex,{specularLevel:.16,emissiveScale:.1}));root.getChildMeshes().forEach(m=>shadows.addShadowCaster(m));let time=0;scene.onBeforeRenderObservable.add(()=>{time+=Math.min(.05,engine.getDeltaTime()/1000);animal.head.rotation.x=Math.sin(time*1.5)*.07;animal.tail.rotation.y=Math.sin(time*3)*.2;});}
else{const corral=createOpenAirCorral(scene,shadows,{x:0,y:0,z:0},{farmId:'preview',width:6.4,depth:5.6,showDecorativeAnimal:false});const herd=new OwnedHerd(scene,corral.root);herd.sync(Object.keys(FARM_CONFIG.animals).flatMap(species=>[0,1].map(i=>({id:`${species}-${i}`,species}))),Object.fromEntries(Object.keys(FARM_CONFIG.animals).map(k=>[k,true])));corral.root.getChildMeshes().forEach(m=>shadows.addShadowCaster(m));}
engine.runRenderLoop(()=>scene.render());addEventListener('resize',()=>engine.resize());
