import '@babylonjs/core/Culling/Octrees/octreeSceneComponent.js';

export function installWorldRenderIndex(scene) {
  const dynamic = mesh => {
    if (mesh.skeleton || mesh.animations?.length) return true;
    for (let node = mesh; node; node = node.parent) {
      if (node.metadata?.playerId || /player|bus|vehicle|animal|cow|alpaca|npc|elder|cloud|marker|crop|boat/i.test(node.name || '')) return true;
    }
    return false;
  };
  // Spatial selection replaces the default full-scene scan. Movers remain
  // candidates regardless of their original indexed bounds.
  const tree = scene.createOrUpdateSelectionOctree(64, 4);
  const known = new WeakSet(scene.meshes);
  for (const mesh of scene.meshes) if (dynamic(mesh)) tree.dynamicContent.push(mesh);
  const added = scene.onNewMeshAddedObservable.add(mesh => {
    if (known.has(mesh) || mesh.isDisposed()) return;
    known.add(mesh);
    mesh.computeWorldMatrix(true);
    if (dynamic(mesh)) tree.dynamicContent.push(mesh);
    else tree.addMesh(mesh);
  });
  return {
    getStats: () => ({ indexedMeshes: scene.meshes.length - tree.dynamicContent.length, dynamicCandidates: tree.dynamicContent.length }),
    dispose() { scene.onNewMeshAddedObservable.remove(added); },
  };
}
