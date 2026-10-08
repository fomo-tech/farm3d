import '@babylonjs/core/Culling/Octrees/octreeSceneComponent.js';
import { Octree } from '@babylonjs/core/Culling/Octrees/octree.js';
import { OctreeSceneComponent } from '@babylonjs/core/Culling/Octrees/octreeSceneComponent.js';
import { SceneComponentConstants } from '@babylonjs/core/sceneComponent.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';

export function installWorldRenderIndex(scene) {
  const dynamic = mesh => {
    // Tree batches grow as scenic generators append placements. Their bounding
    // boxes are not immutable: an octree inserted before that growth can hide
    // whole forests when the camera moves to the newly populated part.
    if (mesh.metadata?.spatialBoundsMutable) return true;
    if (mesh.skeleton || mesh.animations?.length) return true;
    for (let node = mesh; node; node = node.parent) {
      // Vegetation/detail batches are static after their thin-instance buffer
      // is built. They already carry spatialBoundsMutable while that buffer
      // is changing; keeping the name-based tree/foliage fallback here makes
      // thousands of immutable scenery meshes dynamic forever and forces a
      // full dynamic-content scan every frame.
      if (node.metadata?.dynamicLivestock || node.metadata?.playerId || /player|bus|vehicle|animal|cow|alpaca|npc|elder|cloud|marker|crop|boat|river|water|lake|ocean|bridge/i.test(node.name || '')) return true;
    }
    return false;
  };

  // Build a detached octree in small slices. The previous all-at-once call
  // blocked the main thread for more than a second on a 14k-mesh world.
  const tree = new Octree(Octree.CreationFuncForMeshes, 64, 2);
  tree.update(new Vector3(-4096, -512, -4096), new Vector3(4096, 512, 4096), []);
  const queue = [...scene.meshes];
  const known = new WeakSet(queue);
  const dynamicMeshes = [];
  const staticMeshes = new WeakSet();
  const temporaryMeshes = new WeakSet();
  let cursor = 0;
  let indexed = 0;
  let ready = false;
  let cancelled = false;
  let timer = null;
  let resolveReady;
  const readyPromise = new Promise(resolve => { resolveReady = resolve; });

  const add = mesh => {
    if (!mesh || mesh.isDisposed()) return;
    mesh.computeWorldMatrix(true);
    if (dynamic(mesh)) dynamicMeshes.push(mesh);
    else {
      tree.addMesh(mesh);
      staticMeshes.add(mesh);
      indexed++;
    }
  };

  const finalize = () => {
    if (cancelled || scene.isDisposed) return;
    let component = scene._getComponent?.(SceneComponentConstants.NAME_OCTREE);
    if (!component) {
      component = new OctreeSceneComponent(scene);
      scene._addComponent(component);
    }
    tree.dynamicContent = dynamicMeshes;
    scene._selectionOctree = tree;
    ready = true;
    resolveReady();
  };

  const schedule = () => {
    if (cancelled) return;
    const run = () => {
      timer = null;
      const started = performance.now();
      let handled = 0;
      while (cursor < queue.length && handled < 512) {
        add(queue[cursor++]);
        queue[cursor - 1] = null;
        handled++;
        if (performance.now() - started >= 4) break;
      }
      if (cursor < queue.length) schedule();
      else finalize();
    };
    // Timers make steady progress even when requestIdleCallback is starved by
    // continuous rendering. Every slice still yields after four milliseconds.
    timer = setTimeout(run, 0);
  };

  const pendingAdded = [];
  let pendingCursor = 0;
  let pendingTimer = null;

  const processPendingAdded = () => {
    pendingTimer = null;
    if (cancelled || scene.isDisposed) return;
    const start = performance.now();
    while (pendingCursor < pendingAdded.length) {
      const mesh = pendingAdded[pendingCursor];
      pendingAdded[pendingCursor++] = null;
      if (!mesh || mesh.isDisposed()) continue;
      if (temporaryMeshes.has(mesh)) {
        const index = tree.dynamicContent.indexOf(mesh);
        if (index >= 0) tree.dynamicContent.splice(index, 1);
        temporaryMeshes.delete(mesh);
      }
      if (dynamic(mesh)) {
        tree.dynamicContent.push(mesh);
      } else {
        mesh.computeWorldMatrix(true);
        tree.addMesh(mesh);
        staticMeshes.add(mesh);
        indexed++;
      }
      if (performance.now() - start >= 1.5) break;
    }
    if (pendingCursor < pendingAdded.length) {
      pendingTimer = setTimeout(processPendingAdded, 4);
    } else {
      pendingAdded.length = 0;
      pendingCursor = 0;
    }
  };

  const added = scene.onNewMeshAddedObservable.add(mesh => {
    if (known.has(mesh) || mesh.isDisposed()) return;
    known.add(mesh);
    if (!ready) queue.push(mesh);
    else {
      // New meshes must remain renderable while waiting for their final
      // parent/transforms and spatial index insertion.
      tree.dynamicContent.push(mesh);
      temporaryMeshes.add(mesh);
      pendingAdded.push(mesh);
      if (pendingTimer === null) {
        pendingTimer = setTimeout(processPendingAdded, 4);
      }
    }
  });
  const removed = scene.onMeshRemovedObservable.add(mesh => {
    const index = dynamicMeshes.indexOf(mesh);
    if (index >= 0) dynamicMeshes.splice(index, 1);
    temporaryMeshes.delete(mesh);
    if (staticMeshes.has(mesh)) {
      tree.removeMesh(mesh);
      staticMeshes.delete(mesh);
      indexed--;
    }
  });
  schedule();

  return {
    ready: readyPromise,
    getStats: () => ({
      indexedMeshes: indexed,
      dynamicCandidates: ready ? tree.dynamicContent.length : scene.meshes.length - indexed,
      spatialIndexReady: ready,
      spatialIndexPending: Math.max(0, queue.length - cursor) + pendingAdded.length - pendingCursor,
    }),
    dispose() {
      cancelled = true;
      if (timer !== null) {
        clearTimeout(timer);
      }
      if (pendingTimer !== null) {
        clearTimeout(pendingTimer);
      }
      scene.onNewMeshAddedObservable.remove(added);
      scene.onMeshRemovedObservable.remove(removed);
      queue.length = 0;
      pendingAdded.length = 0;
      dynamicMeshes.length = 0;
      if (scene._selectionOctree === tree) scene._selectionOctree = null;
      resolveReady();
    },
  };
}
