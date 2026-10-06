import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { buildHumanMesh } from '../player/buildHumanMesh.js';
import { createFishingRig } from '../player/createPlayer.js';
import { FISHING_CONFIG } from '../../../shared/fishingConfig.js';
import { createPlayerNameplate } from '../player/createPlayerNameplate.js';
import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline.js';
const engine = new Engine(document.querySelector('#view'), true, {antialias:true, stencil:true});
const updateResolution = () => {
  engine.setHardwareScalingLevel(1 / Math.min(2, window.devicePixelRatio || 1));
  engine.resize();
};
updateResolution();
const scene = new Scene(engine);
scene.clearColor = new Color4(0.86, 0.91, 0.94, 1);
const params = new URLSearchParams(location.search);
const camera = new ArcRotateCamera('preview', params.get('angle') === 'back' ? -Math.PI / 2 : params.get('angle') === 'side' ? 0 : Math.PI / 2, params.get('angle') === 'game' ? 0.95 : 1.45, 4.2, new Vector3(0, 1.15, 0), scene);
camera.attachControl(document.querySelector('#view'), true);
const antiAliasing = new DefaultRenderingPipeline('avatar-antialiasing', false, scene, [camera]);
antiAliasing.imageProcessingEnabled = false;
antiAliasing.samples = engine.webGLVersion >= 2 ? Math.min(4, engine.getCaps().maxMSAASamples || 1) : 1;
antiAliasing.fxaaEnabled = antiAliasing.samples < 2;
const light = new HemisphericLight('fill', new Vector3(-0.3, 1, 0.6), scene);
light.intensity = 0.85;
light.intensity = params.get('light') === 'night' ? 0.30 : 0.85;
const avatar = buildHumanMesh(scene, 'preview', {
  outfitId: params.get('outfit') || 'starter', outfitColor: '#f4ece1',
  gender: params.get('gender') || 'male',
});
if (params.get('outfit') === 'street') avatar.applyCustomization({topId:'top_bomber_varsity', bottomId:'bot_cargo_wide', shoeId:'shoe_vintage_boots'});
if (params.get('gender') === 'female') avatar.applyCustomization({hairStyle:'hair_twintails', topId:'top_polo_preppy', bottomId:'bot_tennis_skirt', shoeId:'shoe_doll_flats'});
if (params.get('hair')) avatar.setHair(params.get('hair'));
if (params.get('top')) avatar.setTop(params.get('top'));
if (params.get('mouth')) avatar.setFaceFeatures({mouthType:params.get('mouth')});
if (params.get('lod')) avatar.setLOD(Number(params.get('lod')));
if (params.get('action')) avatar.playAction(params.get('action'));
const previewFish = FISHING_CONFIG.fish[params.get('fish')];
const fishingRig = previewFish ? createFishingRig(scene, avatar.root, avatar) : null;
const shadowPreview = Boolean(fishingRig && ['bite','waiting'].includes(params.get('phase')));
let shadowPreviewElapsed = 0;
if (fishingRig) {
  fishingRig.startCast(3, 'basic_cast', {x:0,y:.13,z:3}, params.get('size') || 'medium');
  if (shadowPreview) {
    camera.setTarget(params.get('phase')==='bite'?new Vector3(0,.13,2.7):new Vector3(0,1.1,1.2));
    camera.beta=params.get('phase')==='bite'?.28:1.12;camera.radius=5.2;
    const water=MeshBuilder.CreateGround('fishing-preview-water',{width:8,height:7},scene);
    water.position.set(0,.04,3);
    const waterMaterial=new StandardMaterial('fishing-preview-water-material',scene);
    waterMaterial.diffuseColor=Color3.FromHexString('#54b9dc');
    waterMaterial.emissiveColor=Color3.FromHexString('#2483b9').scale(.2);
    water.material=waterMaterial;
  } else fishingRig.finishCatch(true, previewFish);
}
createPlayerNameplate(scene, avatar.root, 'preview', 'Nông dân mới');
const crowd = [];
if (params.get('crowd') === '1') {
  camera.radius = 10;
  [-2.3, 2.3].forEach((x, i) => {
    const remote = buildHumanMesh(scene, `remote-preview-${i}`, {gender:i ? 'female':'male'});
    remote.root.position.x = x;
    remote.setLOD(2);
    createPlayerNameplate(scene, remote.root, `remote-preview-${i}`, i ? 'Linh · 02' : 'Minh · 01');
    crowd.push(remote);
  });
}
document.querySelector('#status').textContent = `Avatar v3 · ${params.get('gender') || 'male'} · ${params.get('outfit') || 'starter'} · ${params.get('angle') || 'front'} · ${params.get('light') || 'day'}`;
engine.runRenderLoop(() => {
  const delta = Math.min(engine.getDeltaTime() / 1000, 0.05);
  avatar.animate(delta, params.get('motion') === 'run', 4);
  if (shadowPreview) {
    shadowPreviewElapsed+=delta;
    if(shadowPreviewElapsed>1)fishingRig.setPhase(params.get('phase') === 'bite' ? 'bite' : 'waiting',params.get('phase') === 'bite' ? 0 : 2500);
  }
  fishingRig?.update(delta);
  crowd.forEach(remote => remote.animate(delta, params.get('motion') === 'run', 4));
  scene.render();
});
const stats = avatar.getRenderStats();
document.querySelector('#status').textContent += ` · ${stats.enabledMeshes} meshes · ${stats.triangles} triangles · ${antiAliasing.samples > 1 ? `${antiAliasing.samples}× MSAA` : 'FXAA'} · ${engine.getRenderWidth()}×${engine.getRenderHeight()}`;
window.addEventListener('resize', updateResolution);
