import '@babylonjs/core/Culling/Octrees/octreeSceneComponent.js';
import { Octree } from '@babylonjs/core/Culling/Octrees/octree.js';
import { OctreeSceneComponent } from '@babylonjs/core/Culling/Octrees/octreeSceneComponent.js';
import { SceneComponentConstants } from '@babylonjs/core/sceneComponent.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';

export function installWorldRenderIndex(scene) {
  const dynamic = mesh => {
    if (mesh.skeleton || mesh.animations?.length) return true;
    for (let node = mesh; node; node = node.parent) {
      if (node.metadata?.playerId || /player|bus|vehicle|animal|cow|alpaca|npc|elder|cloud|marker|crop|boat/i.test(node.name || '')) return true;
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
  let pendingTimer = null;

  const processPendingAdded = () => {
    pendingTimer = null;
    if (cancelled || scene.isDisposed) return;
    const start = performance.now();
    while (pendingAdded.length > 0) {
      const mesh = pendingAdded.shift();
      if (!mesh || mesh.isDisposed()) continue;
      if (dynamic(mesh)) {
        tree.dynamicContent.push(mesh);
      } else {
        mesh.computeWorldMatrix(true);
        tree.addMesh(mesh);
        indexed++;
      }
      if (performance.now() - start >= 1.5) break;
    }
    if (pendingAdded.length > 0) {
      pendingTimer = setTimeout(processPendingAdded, 4);
    }
  };

  const added = scene.onNewMeshAddedObservable.add(mesh => {
    if (known.has(mesh) || mesh.isDisposed()) return;
    known.add(mesh);
    if (!ready) queue.push(mesh);
    else {
      pendingAdded.push(mesh);
      if (pendingTimer === null) {
        pendingTimer = setTimeout(processPendingAdded, 4);
      }
    }
  });
  schedule();

  return {
    ready: readyPromise,
    getStats: () => ({
      indexedMeshes: indexed,
      dynamicCandidates: ready ? tree.dynamicContent.length : scene.meshes.length - indexed,
      spatialIndexReady: ready,
      spatialIndexPending: Math.max(0, queue.length - cursor) + pendingAdded.length,
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
      if (scene._selectionOctree === tree) scene._selectionOctree = null;
      resolveReady();
    },
  };
}
