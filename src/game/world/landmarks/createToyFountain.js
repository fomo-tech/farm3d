import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { createToyMaterial } from '../../rendering/PlayTogetherTheme.js';

// A readable toy silhouette: rounded pool, one raised bowl and a duck mascot.
export function createToyFountain(scene, parent, shadows) {
  const root = new TransformNode('pt-grand-central-fountain', scene);
  root.parent = parent;
  const mat = (name, color) => createToyMaterial(scene, `toy-fountain-${name}`, color, { specularLevel: 0.24, specularPower: 64 });
  const cream = mat('cream', '#fff0ce');
  const mint = mat('mint', '#73cbbd');
  const water = mat('water', '#42bfee');
  const foam = mat('foam', '#c6f6ff');
  const yellow = mat('duck', '#ffda57');
  const orange = mat('beak', '#ff9748');
  const eye = mat('eye', '#32475a');
  const pink = mat('cheek', '#ffad92');
  water.emissiveColor = Color3.FromHexString('#42bfee').scale(0.08);
  const own = (mesh, material, x = 0, y = 0, z = 0, owner = root) => {
    mesh.parent = owner;
    mesh.position.set(x, y, z);
    mesh.material = material;
    mesh.isPickable = false;
    mesh.receiveShadows = material !== water && material !== foam;
    return mesh;
  };
  const cylinder = (name, top, bottom, height, y, material) => own(MeshBuilder.CreateCylinder(name, {
    diameterTop: top, diameterBottom: bottom, height, tessellation: 48,
  }, scene), material, 0, y);
  const ring = (name, diameter, thickness, y, material) => own(MeshBuilder.CreateTorus(name, {
    diameter, thickness, tessellation: 48,
  }, scene), material, 0, y);
  const ball = (name, size, material, x, y, z, owner = root) => own(MeshBuilder.CreateSphere(name, {
    diameterX: size[0], diameterY: size[1], diameterZ: size[2], segments: 16,
  }, scene), material, x, y, z, owner);

  cylinder('fountain-soft-base', 17.7, 17.4, 0.45, 0.225, mint);
  cylinder('fountain-pool-1', 17.5, 17.2, 0.55, 0.65, cream);
  ring('fountain-bottom-roll', 17.35, 0.45, 0.38, mint);
  // The opaque water sits above the pool floor, avoiding transparent sorting artifacts.
  cylinder('fountain-water-1', 16.65, 16.65, 0.06, 0.97, water);
  ring('fountain-rim-1', 17.25, 0.85, 1.02, cream);
  ring('fountain-mint-lip', 17.22, 0.26, 1.37, mint);
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    const button = ball(`fountain-rim-button-${i}`, [0.4, 0.4, 0.16], mint, Math.sin(a) * 8.72, 0.73, Math.cos(a) * 8.72);
    button.rotation.y = a;
  }
  cylinder('fountain-pedestal', 2.1, 3.5, 1.8, 1.85, mint);
  ring('fountain-pedestal-foot', 3.1, 0.4, 1.18, cream);
  cylinder('fountain-pool-2', 7.5, 4.5, 0.8, 2.85, cream);
  ring('fountain-rim-2', 7.35, 0.48, 3.25, mint);
  cylinder('fountain-water-2', 6.95, 6.95, 0.06, 3.29, water);
  cylinder('fountain-mascot-island', 2.6, 3, 0.42, 3.5, cream);

  const duck = new TransformNode('fountain-duck-mascot', scene);
  duck.parent = root;
  // Face the default arrival point on the south approach.
  ball('fountain-duck-body', [2.5, 1.75, 2.65], yellow, 0, 4.42, -0.2, duck);
  ball('fountain-duck-head', [1.9, 1.85, 1.8], yellow, 0, 5.5, 0.5, duck);
  ball('fountain-duck-beak', [1.15, 0.38, 0.8], orange, 0, 5.22, 1.38, duck);
  for (const side of [-1, 1]) {
    ball(`fountain-duck-eye-${side}`, [0.21, 0.29, 0.12], eye, side * 0.51, 5.64, 1.25, duck);
    ball(`fountain-duck-eye-shine-${side}`, [0.065, 0.08, 0.045], foam, side * 0.51 - 0.035, 5.7, 1.31, duck);
    ball(`fountain-duck-cheek-${side}`, [0.32, 0.16, 0.1], pink, side * 0.67, 5.33, 1.18, duck);
    const wing = ball(`fountain-duck-wing-${side}`, [0.45, 0.95, 1.45], yellow, side * 1.13, 4.48, -0.25, duck);
    wing.rotation.x = -0.25;
  }
  const tail = ball('fountain-duck-tail', [0.85, 0.9, 1.2], yellow, 0, 4.5, -1.4, duck);
  tail.rotation.x = -0.5;
  for (const mesh of duck.getChildMeshes()) shadows?.addShadowCaster(mesh);

  const ripples = [];
  // Four thick, smooth arcs are legible at the normal game camera distance.
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2;
    const path = Array.from({ length: 25 }, (_, j) => {
      const t = j / 24;
      const r = 3.45 + 3.1 * t;
      return new Vector3(Math.sin(a) * r, 3.35 + 2.8 * t - 5.12 * t * t, Math.cos(a) * r);
    });
    own(MeshBuilder.CreateTube(`fountain-water-arc-${i}`, { path, radius: 0.14, tessellation: 8 }, scene), foam);
    const x = Math.sin(a) * 6.55, z = Math.cos(a) * 6.55;
    const ripple = ring(`fountain-ripple-${i}`, 0.9, 0.055, 1.03, foam);
    ripple.position.x = x; ripple.position.z = z;
    ripple.metadata = { spatialBoundsDynamic: true };
    ripples.push(ripple);
    for (let j = 0; j < 3; j++) {
      const angle = j * Math.PI * 2 / 3;
      ball(`fountain-splash-${i}-${j}`, [0.16, 0.4, 0.16], foam, x + Math.sin(angle) * 0.28, 1.22, z + Math.cos(angle) * 0.28);
    }
  }
  let time = 0;
  const observer = scene.onBeforeRenderObservable.add(() => {
    if (!root.isEnabled()) return;
    time += Math.min(scene.getEngine().getDeltaTime(), 100) / 1000;
    ripples.forEach((ripple, i) => {
      const scale = 0.8 + 0.25 * Math.sin(time * 2.5 + i);
      ripple.scaling.set(scale, 1, scale);
    });
  });
  root.onDisposeObservable.addOnce(() => scene.onBeforeRenderObservable.remove(observer));
  return root;
}
