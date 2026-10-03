import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';

// Keep the coast in the central district. The two villages at x=+/-294, z=399
// remain on land; only the distant, fogged horizon spreads out behind them.
const COAST_HALF_WIDTH = 118;
const SAMPLES = 32;

export function seasideShoreZ(x) {
  return 361 + 2.5 * Math.sin(x * 0.035) + 1.2 * Math.sin(x * 0.083);
}

function surfaceMaterial(scene, name, hex, specular = 0.08) {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(hex);
  material.ambientColor = material.diffuseColor.scale(0.42);
  material.specularColor = new Color3(specular, specular, specular);
  material.specularPower = 72;
  material.backFaceCulling = false;
  return material;
}

function strip(scene, name, start, end, material, y, count = SAMPLES) {
  const paths = [[], []];
  for (let index = 0; index <= count; index += 1) {
    const t = index / count;
    paths[0].push(new Vector3(...start(t, y)));
    paths[1].push(new Vector3(...end(t, y)));
  }
  const mesh = MeshBuilder.CreateRibbon(name, { pathArray: paths, sideOrientation: 2 }, scene);
  mesh.material = material;
  mesh.receiveShadows = false;
  mesh.isPickable = false;
  return mesh;
}

export function createSeasideOcean(scene) {
  const sand = surfaceMaterial(scene, 'seaside-warm-sand', '#f4d79c', 0.025);
  const shallows = surfaceMaterial(scene, 'seaside-shallows', '#61d9d9', 0.12);
  const middle = surfaceMaterial(scene, 'seaside-midwater', '#3bbbd6', 0.10);
  const horizon = surfaceMaterial(scene, 'seaside-horizon', '#43a8cb', 0.05);
  const foam = surfaceMaterial(scene, 'seaside-foam', '#d6f8eb', 0.01);
  foam.disableLighting = true;

  const coast = (t, y) => {
    const x = (2 * t - 1) * COAST_HALF_WIDTH;
    return [x, y, seasideShoreZ(x)];
  };
  const landward = (t, y) => [(2 * t - 1) * COAST_HALF_WIDTH, y, 318];
  const nearEnd = (t, y) => [(2 * t - 1) * 176, y, 474];
  const middleEnd = (t, y) => [(2 * t - 1) * 244, y, 550];
  const farEnd = (t, y) => [(2 * t - 1) * 550, y, 970];

  const meshes = [
    strip(scene, 'beach-natural-shore', landward, coast, sand, 0.145),
    strip(scene, 'sea-shallow-water', coast, nearEnd, shallows, 0.16),
    strip(scene, 'sea-mid-water', nearEnd, middleEnd, middle, 0.16),
    strip(scene, 'sea-fog-horizon', middleEnd, farEnd, horizon, 0.16, 12),
  ];

  // Narrow opaque highlights: no transparent sorting or coplanar water boxes.
  for (let wave = 0; wave < 3; wave += 1) {
    const offset = 0.65 + wave * 3.6;
    const line = (t, y, extra) => {
      const x = (2 * t - 1) * 104;
      return [x, y, seasideShoreZ(x) + offset + extra + 0.32 * Math.sin(x * 0.14 + wave)];
    };
    meshes.push(strip(scene, `sea-shore-foam-${wave}`, (t, y) => line(t, y, 0), (t, y) => line(t, y, 0.22), foam, 0.185));
  }

  return { meshes, shoreZ: seasideShoreZ };
}
