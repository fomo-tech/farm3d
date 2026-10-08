import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';

// Small, actual Babylon objects for inventory goods that have no world asset yet.
export const INVENTORY_OBJECT_IDS = ['apple', 'egg', 'duckEgg', 'milk', 'wool', 'maturePig', 'flour', 'cheese', 'jam',
  'rod_bamboo', 'rod_carbon', 'bait_worm', 'bait_lure', 'fish_chum', 'cooler_box'];

export function createInventoryObjectMesh(scene, id) {
  if (!INVENTORY_OBJECT_IDS.includes(id)) return null;
  const root = new TransformNode(`inventory-object-${id}`, scene);
  const material = (name, hex, metallic = false) => {
    const mat = new StandardMaterial(`inventory-${id}-${name}`, scene);
    mat.diffuseColor = Color3.FromHexString(hex);
    mat.specularColor = metallic ? new Color3(.75, .75, .75) : new Color3(.12, .12, .12);
    mat.specularPower = metallic ? 96 : 32;
    return mat;
  };
  const colors = {
    cream: material('cream', '#fff3d6'), white: material('white', '#f8faf3'), blue: material('blue', '#4ba8ce'),
    gold: material('gold', '#eab943'), brown: material('brown', '#9b5c31'), green: material('green', '#3b9b55'),
    pink: material('pink', '#ed9aa8'), red: material('red', '#c84b48'), steel: material('steel', '#849aab', true),
    black: material('black', '#263946'), orange: material('orange', '#ec853f'), purple: material('purple', '#864c91'),
  };
  const add = (type, name, options, at, mat, rotation) => {
    const mesh = MeshBuilder[type](`inventory-${id}-${name}`, options, scene);
    mesh.parent = root;
    mesh.position.set(...at);
    if (rotation) mesh.rotation.set(...rotation);
    mesh.material = mat;
    return mesh;
  };
  const sphere = (name, at, scale, mat) => {
    const mesh = add('CreateSphere', name, { diameter: 1, segments: 18 }, at, mat);
    mesh.scaling.set(...scale);
    return mesh;
  };
  const box = (name, at, size, mat) => add('CreateBox', name, { width: size[0], height: size[1], depth: size[2] }, at, mat);
  const cylinder = (name, at, diameter, height, mat, rotation) => add('CreateCylinder', name,
    { diameter, height, tessellation: 18 }, at, mat, rotation);
  const rod = (name, from, to, radius, mat) => {
    const start = Vector3.FromArray(from), end = Vector3.FromArray(to);
    const mesh = cylinder(name, Vector3.Center(start, end).asArray(), radius * 2, Vector3.Distance(start, end), mat);
    const direction = end.subtract(start).normalize();
    mesh.rotation.x = Math.atan2(direction.z, direction.y);
    mesh.rotation.z = -Math.atan2(direction.x, Math.sqrt(direction.y ** 2 + direction.z ** 2));
    return mesh;
  };

  if(id==='apple'){
    sphere('apple-left',[-.16,0,0],[.65,.72,.72],colors.red);
    sphere('apple-right',[.16,0,0],[.65,.72,.72],colors.red);
    cylinder('apple-stem',[0,.43,0],.065,.25,colors.brown);
    sphere('apple-leaf',[.14,.47,0],[.3,.055,.15],colors.green);
  } else if (id === 'egg' || id === 'duckEgg') {
    sphere('egg', [0, .12, 0], [.62, .88, .62], id === 'egg' ? colors.cream : colors.blue);
  } else if (id === 'milk') {
    cylinder('bottle', [0, 0, 0], .68, 1.05, colors.white);
    cylinder('neck', [0, .61, 0], .34, .25, colors.white);
    cylinder('cap', [0, .78, 0], .39, .11, colors.blue);
    box('label', [0, .02, -.345], [.48, .43, .045], colors.blue);
  } else if (id === 'wool') {
    for (const [i, x, y, z] of [[0, -.28, 0, 0], [1, .28, 0, 0], [2, 0, .26, 0], [3, 0, -.15, -.23], [4, 0, -.15, .23]])
      sphere(`fleece-${i}`, [x, y, z], [.63, .6, .63], colors.white);
  } else if (id === 'maturePig') {
    sphere('body', [0, 0, 0], [1.12, .72, .75], colors.pink);
    sphere('head', [-.56, .22, 0], [.6, .58, .58], colors.pink);
    sphere('snout', [-.89, .14, -.04], [.16, .27, .32], colors.red);
    for (const z of [-.22, .22]) {
      sphere(`eye-${z}`, [-.77, .39, z], [.075, .075, .075], colors.black);
      sphere(`ear-${z}`, [-.55, .6, z], [.22, .27, .18], colors.pink);
    }
    for (const x of [-.35, .35]) for (const z of [-.24, .24]) cylinder(`leg-${x}-${z}`, [x, -.44, z], .15, .36, colors.pink);
  } else if (id === 'flour' || id === 'fish_chum') {
    box('sack', [0, 0, 0], [.7, .95, .48], id === 'flour' ? colors.cream : colors.gold);
    cylinder('tied-top', [0, .54, 0], .37, .19, colors.brown);
    box('front-label', [0, -.08, -.253], [.43, .37, .025], id === 'flour' ? colors.gold : colors.green);
  } else if (id === 'cheese') {
    add('CreateCylinder', 'wedge', { diameterTop: .12, diameterBottom: 1.13, height: .57, tessellation: 3 }, [0, 0, 0], colors.gold, [0, Math.PI / 6, 0]);
    for (const [i, x, z] of [[0, -.15, -.15], [1, .19, -.08], [2, .03, .2]]) sphere(`hole-${i}`, [x, .293, z], [.075, .022, .075], colors.cream);
  } else if (id === 'jam') {
    cylinder('jar', [0, -.08, 0], .7, .85, colors.red);
    cylinder('glass-rim', [0, .39, 0], .73, .09, colors.white);
    cylinder('lid', [0, .48, 0], .76, .14, colors.gold);
    box('label', [0, -.08, -.355], [.46, .33, .035], colors.cream);
    sphere('berry', [0, -.08, -.38], [.13, .13, .04], colors.red);
  } else if (id.startsWith('rod_')) {
    const carbon = id === 'rod_carbon';
    rod('handle', [-.54, -.48, 0], [-.26, -.04, 0], .1, carbon ? colors.black : colors.brown);
    rod('shaft', [-.27, -.08, 0], [.62, .62, 0], .033, carbon ? colors.steel : colors.gold);
    for (const [i, x, y] of [[0, .06, .2], [1, .37, .44], [2, .6, .62]]) add('CreateTorus', `guide-${i}`,
      { diameter: .17 - i * .03, thickness: .02, tessellation: 12 }, [x, y, 0], colors.steel, [Math.PI / 2, 0, 0]);
    sphere('reel', [-.23, -.2, .16], [.23, .23, .15], carbon ? colors.blue : colors.steel);
  } else if (id === 'bait_worm') {
    cylinder('tin', [0, -.25, 0], .88, .35, colors.brown);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) sphere(`worm-${i}-${j}`,
      [-.28 + i * .28 + j * .03, -.02 + Math.sin(j * 1.4 + i) * .14, -.23 + i * .2], [.13, .12, .13], colors.red);
  } else if (id === 'bait_lure') {
    sphere('body', [0, 0, 0], [.72, .3, .24], colors.blue);
    sphere('eye', [-.29, .06, -.2], [.06, .06, .04], colors.black);
    rod('hook-shank', [.21, -.11, 0], [.31, -.46, 0], .022, colors.steel);
    sphere('feather', [.41, .12, 0], [.42, .18, .16], colors.orange);
  } else if (id === 'cooler_box') {
    box('body', [0, -.1, 0], [1.12, .77, .7], colors.blue);
    box('lid', [0, .34, 0], [1.23, .16, .79], colors.white);
    add('CreateTorus', 'handle', { diameter: .57, thickness: .055, tessellation: 18, arc: .5 },
      [0, .6, 0], colors.steel);
    box('latch', [0, .19, -.405], [.19, .25, .06], colors.gold);
  }
  return root;
}
