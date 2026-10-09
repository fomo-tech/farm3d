// Construction jobs can interleave between yields. Observe only the meshes
// created synchronously by this iterator, never a slice of the shared scene.
export function* collectVenueMeshes(scene, kind, steps) {
  const meshes = [];
  let completed = false;
  try {
    while (true) {
      const added = [];
      const originalAddMesh = scene.addMesh;
      scene.addMesh = function(mesh, ...args) {
        const value = originalAddMesh.call(this, mesh, ...args);
        added.push(mesh);
        return value;
      };
      let result;
      try { result = steps.next(); }
      finally {
        scene.addMesh = originalAddMesh;
        for (const mesh of added) {
          mesh.metadata = { ...(mesh.metadata || {}), interiorVenue: kind };
          mesh.setEnabled(false);
          meshes.push(mesh);
        }
      }
      if (result.done) { completed = true; return meshes; }
      yield result.value;
    }
  } finally {
    if (!completed) steps.return?.();
  }
}
