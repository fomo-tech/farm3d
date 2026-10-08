import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { Camera } from '@babylonjs/core/Cameras/camera.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color4 } from '@babylonjs/core/Maths/math.color.js';
import { buildHumanMesh } from '../player/buildHumanMesh.js';
export async function renderAvatarPortrait(customization) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const engine = new Engine(canvas, true, {alpha:true,preserveDrawingBuffer:true});
  try {
    engine.setSize(128,128);
    const scene = new Scene(engine);scene.clearColor = new Color4(0,0,0,0);
    const avatar = buildHumanMesh(scene,'hud-portrait',{gender:customization.gender});
    avatar.applyCustomization(customization);
    const head = scene.getTransformNodeByName('hud-portrait-head-node');
    scene.updateTransformMatrix(true);
    avatar.root.computeWorldMatrix(true);head?.computeWorldMatrix(true);
    const target = head ? head.getAbsolutePosition().add(new Vector3(0,.30,0)) : new Vector3(0,1.7,0);
    const camera = new ArcRotateCamera('portrait', Math.PI/2,1.43,3,target,scene);
    camera.mode=Camera.ORTHOGRAPHIC_CAMERA;camera.orthoLeft=camera.orthoBottom=-.65;camera.orthoRight=camera.orthoTop=.65;
    const light = new HemisphericLight('portrait-fill',new Vector3(-.4,1,1),scene);light.intensity=.95;
    await scene.whenReadyAsync();scene.render();return canvas.toDataURL('image/png');
  } finally { engine.dispose(); }
}
