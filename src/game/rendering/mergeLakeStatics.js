import { Mesh } from '@babylonjs/core/Meshes/mesh.js';

// Only immutable decoration, never water, interaction targets or animated nodes.
export function* mergeLakeStaticsSteps(root, shadows) {
  const groups = new Map();
  const eligible = /^(pier-plank-|pier-under-pile-|reed-stalk-|reed-head-|lake-pebble-|south-cape-rock-|north-cape-rock-)/;
  for (const mesh of root.getChildMeshes()) {
    if (!(mesh.metadata?.lakeStatic === true || eligible.test(mesh.name)) || mesh.metadata?.interactive || !mesh.material || mesh.skeleton) continue;
    const casts = shadows?.getShadowMap()?.renderList?.includes(mesh) ?? false;
    const key = `${mesh.parent.uniqueId}:${mesh.material.uniqueId}:${casts}:${mesh.receiveShadows}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(mesh);
  }
  let removed = 0;
  for (const meshes of groups.values()) {
    if (meshes.length < 2) continue;
    meshes.forEach(mesh => mesh.computeWorldMatrix(true));
    const merged = Mesh.MergeMeshes(meshes, false, true, undefined, false, false);
    if (!merged) continue;
    merged.name = `lake-static-batch-${meshes[0].name}`;
    // MergeMeshes bakes world coordinates. setParent preserves those world
    // coordinates even if the district root has moved or rotated.
    merged.setParent(meshes[0].parent);
    merged.isPickable = false;
    merged.receiveShadows = meshes[0].receiveShadows;
    merged.metadata = { lakeStatic: true, district: 'crystal-lake' };
    const casts = meshes.some(mesh => shadows?.getShadowMap()?.renderList?.includes(mesh));
    for (const mesh of meshes) { shadows?.removeShadowCaster(mesh); mesh.dispose(false, false); }
    if (casts) shadows.addShadowCaster(merged);
    removed += meshes.length - 1;
    yield 'lake: merge static group';
  }
  return removed;
}

export function mergeLakeStatics(root, shadows) {
  const steps=mergeLakeStaticsSteps(root,shadows);
  let result=steps.next();
  while(!result.done)result=steps.next();
  return result.value;
}
