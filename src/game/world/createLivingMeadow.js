import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import { Matrix, Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import '@babylonjs/core/Meshes/thinInstanceMesh.js';
import { WORLD_VILLAGES } from '../../../shared/villageLayout.js';
import { landscapeVariation } from './LandscapeArt.js';
import { isPointOnRoadCorridor } from './RoadSafetyZone.js';
import { isPointInsideAnyFarmLot } from './FarmSafetyZone.js';
import { isPointInLakeOrRiver } from './WaterSafetyZone.js';

// Public woodland margins only. Nothing decorative can block parcels or roads.
export function* livingMeadowPlacements() {
  for (const village of WORLD_VILLAGES) {
    for (const side of [-1, 1]) for (let row = 0; row < 80; row++) {
      for (let column = 0; column < 12; column++) {
        const x = village.offsetX + side * (64 + column * 2.2 + landscapeVariation(row, column, 3));
        const z = village.offsetZ + 102 + row * 2.2 + landscapeVariation(row, column, 6);
        if (isPointOnRoadCorridor(x, z, 3) || isPointInsideAnyFarmLot(x, z, 2)) continue;
        if (isPointInLakeOrRiver(x, z, 3.0)) continue;
        const noise = landscapeVariation(x, z, 23);
        if (noise < .22) continue; // Irregular open pockets, not a carpet grid.
        yield { x, z, kind: noise > .93 ? 'pink' : noise > .86 ? 'cream' : 'grass', scale: .6 + noise * .5 };
      }
    }
  }
}

function makeBatch(scene, key, kind, material) {
  const mesh = new Mesh(`living-meadow-${key}-${kind}`, scene);
  const data = new VertexData();
  // Three low-poly blades. Flowers are small crossed diamond heads, not billboards.
  data.positions = kind === 'grass'
    ? [-.12,0,0, .10,0,0, .05,.48,.02, 0,0,-.12, 0,0,.12, -.03,.38,.05, -.1,0,-.08, .1,0,.08, .08,.28,-.08]
    : [-.13,.24,0, .13,.24,0, 0,.40,0, 0,.11,0, 0,.24,-.13, 0,.24,.13, 0,.40,0, 0,.11,0];
  data.indices = kind === 'grass' ? [0,1,2,3,4,5,6,7,8] : [0,1,2,1,0,3,4,5,6,5,4,7];
  data.normals = [];
  VertexData.ComputeNormals(data.positions, data.indices, data.normals);
  data.applyToMesh(mesh);
  mesh.material = material;
  mesh.isPickable = false;
  mesh.checkCollisions = false;
  mesh.receiveShadows = false;
  mesh.metadata = { meadow: true };
  mesh.setEnabled(false);
  return mesh;
}

export function* createLivingMeadowSteps(scene, { mobile = false } = {}) {
  const groups = new Map();
  let count = 0;
  for (const item of livingMeadowPlacements()) {
    if (mobile && landscapeVariation(item.x, item.z, 51) < .5) continue;
    const cx = Math.floor(item.x / 48), cz = Math.floor(item.z / 48);
    const key = `${cx}:${cz}:${item.kind}`;
    if (!groups.has(key)) groups.set(key, { cx, cz, kind: item.kind, items: [] });
    groups.get(key).items.push(item);
    if (++count % 32 === 0) yield;
  }
  const materials = {};
  for (const [kind, color] of Object.entries({ grass: '#61965b', pink: '#EB8FB5', cream: '#F4D789' })) {
    const material = new StandardMaterial(`living-meadow-${kind}`, scene);
    material.diffuseColor = Color3.FromHexString(color);
    material.ambientColor = material.diffuseColor.scale(.35);
    material.specularColor = Color3.Black();
    material.backFaceCulling = false;
    material.freeze();
    materials[kind] = material;
    yield;
  }
  const batches = [];
  for (const [key, group] of groups) {
    const mesh = makeBatch(scene, key, group.kind, materials[group.kind]);
    mesh.position.set(group.cx * 48, .055, group.cz * 48);
    const matrices = new Float32Array(group.items.length * 16);
    for (let i = 0; i < group.items.length; i++) {
      const item = group.items[i];
      Matrix.Compose(new Vector3(item.scale,item.scale,item.scale), Quaternion.RotationAxis(Vector3.Up(), landscapeVariation(item.x,item.z,31) * Math.PI * 2),
        new Vector3(item.x-mesh.position.x,0,item.z-mesh.position.z)).copyToArray(matrices,i*16);
    }
    mesh.thinInstanceSetBuffer('matrix', matrices, 16, true);
    mesh.thinInstanceRefreshBoundingInfo();
    batches.push({ mesh, x: group.cx * 48 + 24, z: group.cz * 48 + 24, count: group.items.length });
    yield;
  }
  let elapsed = 1;
  let isEnabled = true;
  return {
    update(dt, position) {
      if (!isEnabled) return;
      elapsed += dt;
      if (!position || elapsed < .25) return;
      elapsed = 0;
      for (const batch of batches) {
        // Cache behind the fog with generous hysteresis; zero popping in camera view
        const radius = (mobile ? 140 : 185) + (batch.mesh.isEnabled() ? 30 : 0);
        batch.mesh.setEnabled(Math.hypot(position.x-batch.x,position.z-batch.z) < radius);
      }
    },
    setEnabled(enabled) {
      isEnabled = Boolean(enabled);
      if (!isEnabled) {
        for (const batch of batches) {
          batch.mesh.setEnabled(false);
        }
      }
    },
    getStats: () => ({ instances: count, batches: batches.length, visibleBatches: batches.filter(b => b.mesh.isEnabled()).length }),
    dispose() { batches.forEach(b => b.mesh.dispose()); Object.values(materials).forEach(m => m.dispose()); },
  };
}
