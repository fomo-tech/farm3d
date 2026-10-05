// Babylon 9 dirty callbacks scan every scene mesh for each material. In a
// streamed world this becomes quadratic. Keep its draw-wrapper semantics,
// but use Babylon's maintained material/mesh map in this scene only.
export function installMaterialDirtyIndex(scene) {
  const optimize = material => {
    if (!material || material.__farmDirtyIndexed) return;
    material.__farmDirtyIndexed = true;
    const originalDirty = material._markAllSubMeshesAsDirty;
    const originalReady = material.markDirty;
    const candidates = () => {
      if (!scene.useMaterialMeshMap || !material.meshMap
        || (scene._hasDefaultMaterial && material === scene.defaultMaterial)) return scene.meshes;
      const meshes = new Set(material.getBindedMeshes());
      // glTF primitives can use MultiMaterial: its meshes belong to the parent
      // material's map. Include those without reverting to a full-scene scan.
      const parents = new Set([material]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const multi of scene.multiMaterials) {
          if (parents.has(multi) || !multi.subMaterials.some(child => parents.has(child))) continue;
          parents.add(multi);
          for (const mesh of multi.getBindedMeshes()) meshes.add(mesh);
          changed = true;
        }
      }
      return meshes;
    };
    material._markAllSubMeshesAsDirty = function (callback) {
      if (scene.blockMaterialDirtyMechanism || this.blockDirtyMechanism) return;
      for (const mesh of candidates()) {
        for (const sub of mesh.subMeshes || []) {
          const bound = sub.getMaterial() || (scene._hasDefaultMaterial ? scene.defaultMaterial : null);
          if (bound !== this) continue;
          for (const wrapper of sub._drawWrappers) {
            if (wrapper?.defines?.markAllAsDirty && this._materialContext === wrapper.materialContext) callback(wrapper.defines);
          }
        }
      }
    };
    material.markDirty = function (force = false) {
      for (const mesh of candidates()) {
        for (const sub of mesh.subMeshes || []) {
          if (sub.getMaterial() !== this) continue;
          for (const wrapper of sub._drawWrappers) {
            if (!wrapper || this._materialContext !== wrapper.materialContext) continue;
            wrapper._wasPreviouslyReady = false;
            wrapper._wasPreviouslyUsingInstances = null;
            wrapper._forceRebindOnNextCall = force;
          }
        }
      }
      if (force) this.markAsDirty(127);
    };
    // Retain originals for diagnostics; no global prototype is modified.
    material.__farmOriginalDirty = originalDirty;
    material.__farmOriginalReady = originalReady;
  };
  scene.materials.forEach(optimize);
  // Babylon's new-material observable is deferred through TimingTools. Install
  // synchronously too, before glTF's promise continuation touches materials.
  const addMaterial = scene.addMaterial;
  scene.addMaterial = function (material) {
    addMaterial.call(this, material);
    optimize(material);
  };
  const observer = scene.onNewMaterialAddedObservable.add(optimize);
  scene.onDisposeObservable.addOnce(() => {
    scene.addMaterial = addMaterial;
    scene.onNewMaterialAddedObservable.remove(observer);
  });
}
