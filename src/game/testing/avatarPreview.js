import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color4 } from '@babylonjs/core/Maths/math.color.js';
import { buildHumanMesh } from '../player/buildHumanMesh.js';
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
  crowd.forEach(remote => remote.animate(delta, params.get('motion') === 'run', 4));
  scene.render();
});
const stats = avatar.getRenderStats();
document.querySelector('#status').textContent += ` · ${stats.enabledMeshes} meshes · ${stats.triangles} triangles · ${antiAliasing.samples > 1 ? `${antiAliasing.samples}× MSAA` : 'FXAA'} · ${engine.getRenderWidth()}×${engine.getRenderHeight()}`;
window.addEventListener('resize', updateResolution);
