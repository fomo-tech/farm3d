import { Mesh } from '@babylonjs/core/Meshes/mesh.js';

// Only immutable decoration. Soil, crops, name boards, animals and thin-instance
// pickets must remain independent for interaction and streaming.
export function* batchFarmDecorationSteps(root, farmId) {
  const groups = new Map();
  for (const mesh of root.getChildMeshes()) {
    if (mesh.hasThinInstances || mesh.metadata?.interactive || mesh.skeleton || mesh.animations?.length) continue;
    if (!/^detail-(?:fence-|rim-|crop-rim-|post-|finial-|step-|entry-|driveway-|midwalk-|homepath-|corralpath-)/.test(mesh.name)) continue;
    if (!mesh.material) continue;
    if (!groups.has(mesh.material)) groups.set(mesh.material,[]);
    groups.get(mesh.material).push(mesh);
  }
  let saved = 0;
  for (const [material, meshes] of groups) {
    if (meshes.length < 2) continue;
    const receivesShadows = meshes.some(m => m.receiveShadows);
    const merged = Mesh.MergeMeshes(meshes, true, true, undefined, false, false);
    if (merged) {
      merged.name = `farm-decor-batch-${farmId}-${material.name}`;
      merged.material = material;
      // Merge bakes absolute transforms; setParent preserves that world transform.
      merged.setParent(root);
      merged.isPickable = false;
      merged.checkCollisions = false;
      merged.receiveShadows = receivesShadows;
      saved += meshes.length - 1;
    }
    yield;
  }
  return saved;
}
