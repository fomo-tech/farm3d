import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';

export function createPlayerNameplate(scene, parent, id, initialName) {
  const texture = new DynamicTexture(
    `player-name-texture-${id}`,
    { width: 1024, height: 224 },
    scene,
    true,
    Texture.TRILINEAR_SAMPLINGMODE
  );
  texture.hasAlpha = true;
  texture.anisotropicFilteringLevel = 8;
  const material = new StandardMaterial(`player-name-material-${id}`, scene);
  material.diffuseTexture = texture;
  material.useAlphaFromDiffuseTexture = true;
  material.emissiveColor = Color3.White();
  material.disableLighting = true;
  material.backFaceCulling = false;
  material.specularColor = Color3.Black();

  const plate = MeshBuilder.CreatePlane(`player-nameplate-${id}`, { width: 1.8, height: 0.39 }, scene);
  plate.parent = parent;
  plate.position.y = 2.52;
  plate.billboardMode = Mesh.BILLBOARDMODE_ALL;
  plate.material = material;
  plate.isPickable = false;
  plate.receiveShadows = false;
  const observer = scene.onBeforeRenderObservable.add(() => {
    const camera = scene.activeCamera;
    if (!camera) return;
    const distance = Vector3.Distance(camera.globalPosition, plate.getAbsolutePosition());
    plate.scaling.setAll(Math.max(0.85, Math.min(3, distance / 12)));
  });

  let currentName = '';
  const setName = value => {
    const nextName = String(value || 'Nông dân').trim().slice(0, 24) || 'Nông dân';
    if (nextName === currentName) return;
    currentName = nextName;
    const ctx = texture.getContext();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, 1024, 224);
    let size = 96;
    ctx.font = `700 ${size}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    while (ctx.measureText(nextName).width > 890 && size > 50) {
      size -= 4;
      ctx.font = `700 ${size}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 16;
    ctx.strokeStyle = 'rgba(20, 27, 37, 0.9)';
    ctx.strokeText(nextName, 512, 112, 904);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(nextName, 512, 112, 904);
    texture.update();
  };
  setName(initialName);
  return { mesh: plate, setName, dispose: () => { scene.onBeforeRenderObservable.remove(observer); plate.dispose(); material.dispose(); texture.dispose(); } };
}
