import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight.js';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator.js';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { SceneInstrumentation } from '@babylonjs/core/Instrumentation/sceneInstrumentation.js';
import { createRomanticLake } from '../world/landmarks/createRomanticLake.js';
import { createLakeDistrict } from '../world/landmarks/createWaterBody.js';

const canvas = document.querySelector('#game');
const engine = new Engine(canvas, true);
engine.setHardwareScalingLevel(1 / Math.min(devicePixelRatio, 1.5));
const scene = new Scene(engine);
scene.clearColor = new Color4(.79,.87,.91,1);
scene.ambientColor = new Color3(.2,.2,.2);
const camera = new ArcRotateCamera('lake-qa-camera', Math.PI, .65, 155, new Vector3(166, 0, 2), scene);
camera.attachControl(canvas, true); camera.minZ = .1; camera.maxZ = 700;
const fill = new HemisphericLight('fill', new Vector3(0,1,0), scene); fill.intensity=.8;
const sun = new DirectionalLight('sun', new Vector3(.5,-1,.3), scene); sun.position.set(100,120,-90); sun.intensity=.75;
const shadows = new ShadowGenerator(1024, sun); shadows.usePercentageCloserFiltering = true;
const ground = MeshBuilder.CreateGround('qa-ground', {width:800,height:800}, scene);
const grass = new StandardMaterial('qa-grass', scene); grass.diffuseColor=Color3.FromHexString('#83ad61'); grass.specularColor=Color3.Black();
ground.material=grass; ground.receiveShadows=true;
const instrumentation = new SceneInstrumentation(scene); instrumentation.captureFrameTime=true;
let lake, district, cycles=0;
function build() { lake=createRomanticLake(scene, shadows); district=createLakeDistrict(scene, shadows); }
build();
function view(x,z,radius,beta=.65) { camera.setTarget(new Vector3(x,0,z)); camera.radius=radius;camera.beta=beta;camera.alpha=Math.PI; }
document.querySelector('#overview').onclick=()=>view(166,2,155);
document.querySelector('#dock').onclick=()=>view(151,2,35);
document.querySelector('#shop').onclick=()=>view(123,-16,35);
document.querySelector('#far').onclick=()=>view(-100,0,35);
document.querySelector('#cycle').onclick=()=>{lake.dispose();district.dispose();build();cycles++;};
let last=0;
engine.runRenderLoop(()=>{
  district.update?.(performance.now());scene.render();
  if(performance.now()-last<1000)return;last=performance.now();
  document.querySelector('#metrics').textContent=JSON.stringify({
    fps:Math.round(engine.getFps()),drawCalls:instrumentation.drawCallsCounter.current,
    frameMs:Number(instrumentation.frameTimeCounter.current.toFixed(2)),
    meshes:scene.meshes.length,activeMeshes:scene.getActiveMeshes().length,
    triangles:scene.getActiveIndices()/3,materials:scene.materials.length,textures:scene.textures.length,
    observers:scene.onBeforeRenderObservable.observers.length,cycles,
    render:`${engine.getRenderWidth()}×${engine.getRenderHeight()}`,
    lake:lake.root.metadata,district:district.root.metadata,
  },null,2);
});
addEventListener('resize',()=>engine.resize());
addEventListener('pagehide',()=>{lake.dispose();district.dispose();instrumentation.dispose();scene.dispose();engine.dispose();},{once:true});
