import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';

export function modelWorldPosition(position, parent) {
  return parent ? Vector3.TransformCoordinates(position, parent.computeWorldMatrix(true)) : position;
}

export function modelSubtreePredicate(container, name) {
  const target = [...container.transformNodes, ...container.meshes].find(node => node.name === name);
  if (!target) return undefined;
  return node => node === target || node.isDescendantOf?.(target) || target.isDescendantOf(node);
}

export function attachVillageHouse(root, instance, targetName) {
  let target = null;
  const visit = node => {
    if (node.name === targetName || node.name.startsWith(`${targetName}_inst_`)) target = node;
    node.getChildren?.().forEach(visit);
  };
  instance.rootNodes.forEach(visit);
  if (!target) return null;
  for (const node of instance.rootNodes) {
    if (node !== target && !node.isDescendantOf?.(target)) node.setEnabled(false);
  }
  // ModelAssetManager freezes loaded transforms. Reparenting a frozen mesh
  // without invalidating its matrix left upgraded houses at the GLB's old pose.
  const meshes = target.getChildMeshes?.() || [];
  target.unfreezeWorldMatrix?.();
  meshes.forEach(mesh => mesh.unfreezeWorldMatrix?.());
  target.computeWorldMatrix(true);
  target.setParent(root); // Preserve glTF ancestor handedness/scale, not its translation.
  target.position.set(0, 0, 0);
  target.setEnabled(true);
  target.computeWorldMatrix(true);
  target.freezeWorldMatrix?.();
  for (const mesh of meshes) { mesh.computeWorldMatrix(true); mesh.freezeWorldMatrix?.(); }
  // Track reparented nodes as part of the instance for correct unload/disposal.
  if (!instance.rootNodes.includes(target)) instance.rootNodes.push(target);
  return target;
}
