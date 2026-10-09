import { Mesh } from '@babylonjs/core/Meshes/mesh.js';

// Merge rigid parts in one moving coordinate frame, preserving animated parts
// and transparent sorting. Never merge across independent visibility roots.
export function batchRigidMeshes(root, { exclude = new Set(), shadows = null } = {}) {
  const groups = new Map();
  const casters = new Set(shadows?.getShadowMap?.()?.renderList || []);
  for (const mesh of root.getChildMeshes(true)) {
    if (exclude.has(mesh) || !mesh.material || mesh.material.alpha < 1 || mesh.material.needAlphaBlendingForMesh?.(mesh)
      || mesh.skeleton || mesh.animations?.length || mesh.hasThinInstances || mesh.getTotalVertices() === 0) continue;
    if (!groups.has(mesh.material)) groups.set(mesh.material, []);
    groups.get(mesh.material).push(mesh);
  }
  let saved = 0;
  for (const [material, meshes] of groups) {
    if (meshes.length < 2) continue;
    const cast = meshes.some(mesh => casters.has(mesh));
    const receive = meshes.some(mesh => mesh.receiveShadows);
    // MergeMeshes bakes world-space vertices. Put them back in the owner's
    // frame so animation and proximity-based shadow selection share its origin.
    const merged = Mesh.MergeMeshes(meshes, false, true, undefined, false, false);
    if (!merged) continue;
    merged.name = `${root.name}-rigid-${material.name}`;
    merged.material = material;
    merged.bakeTransformIntoVertices(root.getWorldMatrix().clone().invert());
    merged.parent = root;
    merged.isPickable = false;
    merged.receiveShadows = receive;
    for (const mesh of meshes) { shadows?.removeShadowCaster(mesh); mesh.dispose(); }
    if (cast) shadows?.addShadowCaster(merged);
    saved += meshes.length - 1;
  }
  return saved;
}
