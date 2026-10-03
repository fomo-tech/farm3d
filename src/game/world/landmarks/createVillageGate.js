import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';

export function createVillageGate(scene, position, villageName = 'LÀNG HOA MAI', shadows = null) {
  const root = new TransformNode('village-named-gate', scene);
  root.position.set(position.x, position.y || 0, position.z);
  const wood = new StandardMaterial('village-gate-wood', scene);
  wood.diffuseColor = Color3.FromHexString('#8b5e34');
  wood.ambientColor = new Color3(0.42, 0.3, 0.18);
  const trim = new StandardMaterial('village-gate-trim', scene);
  trim.diffuseColor = Color3.FromHexString('#f4c95d');
  trim.emissiveColor = Color3.FromHexString('#7c5414');
  [-6.2, 6.2].forEach(x => {
    const post = MeshBuilder.CreateCylinder('village-gate-post', { height: 5.8, diameter: 0.7, tessellation: 12 }, scene);
    post.position.set(x, 2.9, 0); post.material = wood; post.parent = root; shadows?.addShadowCaster(post);
    const cap = MeshBuilder.CreateSphere('village-gate-cap', { diameter: 1.05, segments: 12 }, scene);
    cap.position.set(x, 6.0, 0); cap.material = trim; cap.parent = root;
  });
  const beam = MeshBuilder.CreateBox('village-gate-beam', { width: 14, height: 1.0, depth: 0.7 }, scene);
  beam.position.set(0, 5.0, 0); beam.material = wood; beam.parent = root; shadows?.addShadowCaster(beam);
  const texture = new DynamicTexture('village-gate-sign-texture', { width: 1024, height: 190 }, scene, true);
  const sign = MeshBuilder.CreatePlane('village-gate-name-sign', { width: 8.8, height: 1.65 }, scene);
  sign.position.set(0, 4.9, -0.42); sign.billboardMode = 7; sign.parent = root;
  const material = new StandardMaterial('village-gate-name-material', scene);
  material.diffuseTexture = texture; material.emissiveTexture = texture; material.specularColor = Color3.Black(); material.backFaceCulling = false; sign.material = material;
  const render = name => {
    const ctx = texture.getContext(); ctx.clearRect(0, 0, 1024, 190);
    ctx.fillStyle = '#fff7d6'; ctx.beginPath(); ctx.roundRect(12, 12, 1000, 166, 26); ctx.fill();
    ctx.strokeStyle = '#d4932f'; ctx.lineWidth = 10; ctx.stroke();
    ctx.fillStyle = '#5b351c'; ctx.font = '900 60px "Segoe UI", Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(name || 'Làng mới').toUpperCase(), 512, 95); texture.update();
  };
  render(villageName);
  return { root, updateName: render, dispose: () => { texture.dispose(); root.dispose(false, false); } };
}
