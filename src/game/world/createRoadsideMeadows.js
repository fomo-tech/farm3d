import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Matrix, Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import '@babylonjs/core/Meshes/thinInstanceMesh.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { isPointOnRoadCorridor } from './RoadSafetyZone.js';
import { isPointInsideAnyFarmLot } from './FarmSafetyZone.js';

// Low, instanced ground-color patches fill the empty view from the bus routes.
// They do not add collision, cast shadows, or create hundreds of draw calls.
const CORRIDORS = [
  { z: 86, minX: -570, maxX: 570, theme: 'meadow' },
  { z: -234, minX: -570, maxX: 570, theme: 'heather' },
  { z: 406, minX: -335, maxX: 335, theme: 'dry' },
];
const COLORS = {
  // Stay close to the world grass (#5a9942); vivid props provide accents.
  meadow: ['#67a44c', '#70aa55', '#789e54'],
  heather: ['#63984d', '#739d5a', '#829a67'],
  dry: ['#779e54', '#8ba66a', '#9da777'],
};

function noise(x, z, seed) {
  const value = Math.sin(x * 12.9898 + z * 78.233 + seed * 31.817) * 43758.5453;
  return value - Math.floor(value);
}

function makeOrganicPatch(scene, name) {
  const positions = [0, 0, 0];
  const indices = [];
  for (let index = 0; index <= 12; index += 1) {
    const angle = index * Math.PI / 6;
    const radius = 0.82 + 0.16 * Math.sin(index * 2.7) + 0.08 * Math.cos(index * 4.1);
    positions.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    if (index > 0) indices.push(0, index, index + 1);
  }
  const mesh = new Mesh(name, scene);
  const data = new VertexData();
  data.positions = positions;
  data.indices = indices;
  data.normals = [];
  VertexData.ComputeNormals(positions, indices, data.normals);
  data.applyToMesh(mesh);
  return mesh;
}

export function roadsideMeadowPlacements() {
  const placements = [];
  for (const road of CORRIDORS) {
    for (let x = road.minX; x <= road.maxX; x += 22) {
      for (const side of [-1, 1]) {
        if (noise(x, road.z, side + 4) < 0.22) continue;
        const px = x + (noise(x, road.z, side + 8) - 0.5) * 9;
        const pz = road.z + side * (19 + noise(x, road.z, side + 12) * 10);
        const radius = 3.6 + noise(x, pz, 19) * 1.8;
        // Test cardinal points too: a disc must not bleed into a road or lot.
        const points = [[px, pz], [px - radius, pz], [px + radius, pz], [px, pz - radius], [px, pz + radius]];
        if (points.some(([cx, cz]) =>
          isPointOnRoadCorridor(cx, cz, 0.8) || isPointInsideAnyFarmLot(cx, cz, 1.5)
        )) continue;
        if (Math.hypot(px - 167, pz - 2) < 58) continue;
        if (pz > 320 && pz < 390 && Math.abs(px) < 125) continue;
        const variant = Math.floor(noise(px, pz, 23) * 3);
        placements.push({ x: px, z: pz, radius, depthScale: 0.6 + noise(px, pz, 29) * 0.5, theme: road.theme, variant });
      }
    }
  }
  return placements;
}

export function createRoadsideMeadows(scene, foliageInstancing = null) {
  const groups = new Map();
  let bushCount = 0;
  for (const placement of roadsideMeadowPlacements()) {
    const key = `${placement.theme}-${placement.variant}`;
    if (!groups.has(key)) groups.set(key, []);
    const scale = new Vector3(placement.radius, 1, placement.radius * placement.depthScale);
    const rotation = Quaternion.FromEulerAngles(0, noise(placement.x, placement.z, 31) * Math.PI, 0);
    const transform = Matrix.Compose(scale, rotation, new Vector3(placement.x, 0.018, placement.z));
    groups.get(key).push(...transform.m);
    if (foliageInstancing && noise(placement.x, placement.z, 41) > 0.66) {
      foliageInstancing.spawnBush(placement.x, placement.z, 0.48);
      bushCount += 1;
    }
  }

  const meshes = [];
  for (const [key, matrices] of groups) {
    if (!matrices.length) continue;
    const [theme, variantText] = key.split('-');
    const material = new StandardMaterial(`roadside-meadow-${key}`, scene);
    material.diffuseColor = Color3.FromHexString(COLORS[theme][Number(variantText)]);
    material.ambientColor = material.diffuseColor.scale(0.32);
    material.specularColor = Color3.Black();
    material.backFaceCulling = false;
    const mesh = makeOrganicPatch(scene, `roadside-meadow-patch-${key}`);
    mesh.material = material;
    mesh.isPickable = false;
    mesh.receiveShadows = false;
    mesh.thinInstanceSetBuffer('matrix', new Float32Array(matrices), 16);
    meshes.push(mesh);
  }
  return { meshes, patchCount: [...groups.values()].reduce((sum, values) => sum + values.length / 16, 0), bushCount };
}
