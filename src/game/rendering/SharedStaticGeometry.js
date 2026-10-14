import { SubMesh } from '@babylonjs/core/Meshes/subMesh.js';

// Mesh visibility does not release vertex buffers. Repeated rigid primitives
// can share buffers while retaining independent transforms and materials.
export function installSharedStaticGeometry(scene, { budgetMs = 1.5, batchSize = 16 } = {}) {
  const queue = [...scene.meshes], buckets = new Map();
  let cursor = 0, saved = 0;
  const added = scene.onNewMeshAddedObservable.add(mesh => queue.push(mesh));
  const words = new Float32Array(1), bits = new Uint32Array(words.buffer);
  function describe(geometry) {
    const kinds = geometry.getVerticesDataKinds().sort();
    if (kinds.some(kind => geometry.getVertexBuffer(kind).isUpdatable())) return null;
    const arrays = kinds.map(kind => geometry.getVerticesData(kind));
    arrays.push(geometry.getIndices());
    if (arrays.some(data => !data)) return null;
    let hash = 2166136261;
    for (const data of arrays) for (const value of data) {
      words[0] = value;
      hash = Math.imul(hash ^ bits[0], 16777619);
    }
    return { key: `${kinds.join(',')}:${arrays.map(data => data.length).join(',')}:${hash}`, arrays };
  }
  function processMesh(mesh) {
    const geometry = mesh.geometry;
    if (!geometry || geometry.isDisposed() || geometry.getTotalVertices() > 10000 || geometry.meshes.length !== 1 || mesh.skeleton ||
      mesh.morphTargetManager || mesh.hasThinInstances || mesh.animations?.length ||
      /local-player|remote-|avatar|foliage/i.test(mesh.name)) return;
    const description = describe(geometry);
    if (!description) return;
    const bucket = (buckets.get(description.key) || []).filter(candidate => !candidate.isDisposed());
    const match = bucket.find(candidate => {
      const other = describe(candidate);
      return other && other.arrays.every((data, index) => data.every((value, offset) =>
        value === description.arrays[index][offset]));
    });
    if (match) {
      // Preserve multi-material ranges; applying geometry may recreate them.
      const ranges = mesh.subMeshes.map(sub => [sub.materialIndex, sub.verticesStart,
        sub.verticesCount, sub.indexStart, sub.indexCount]);
      match.applyToMesh(mesh);
      if (ranges.length > 1) {
        mesh.releaseSubMeshes();
        for (const range of ranges) new SubMesh(...range, mesh);
      }
      geometry.dispose();
      saved++;
    } else bucket.push(geometry);
    buckets.set(description.key, bucket);
  }
  function drain() {
    const start = performance.now();
    let count = 0;
    while (cursor < queue.length && count++ < batchSize && performance.now() - start < budgetMs) {
      const mesh = queue[cursor++];
      if (!mesh.isDisposed()) processMesh(mesh);
    }
    if (cursor === queue.length) { queue.length = 0; cursor = 0; }
  }
  const render = scene.onBeforeRenderObservable.add(drain);
  scene.onDisposeObservable.addOnce(() => {
    scene.onNewMeshAddedObservable.remove(added);
    scene.onBeforeRenderObservable.remove(render);
    queue.length = 0; buckets.clear();
  });
  return { drain, getStats: () => ({ saved, pending: queue.length - cursor }) };
}
