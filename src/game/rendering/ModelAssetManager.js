import '@babylonjs/loaders/glTF';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { MODEL_PATHS, resolveModelAsset } from './AssetRegistry.js';

export { MODEL_PATHS } from './AssetRegistry.js';

const cachesByScene = new WeakMap();
let spawnCounter = 0;

function getSceneCache(scene) {
  let cache = cachesByScene.get(scene);
  if (!cache) {
    cache = { containers: new Map(), pending: new Map(), states: new Map() };
    cachesByScene.set(scene, cache);
    scene.onDisposeObservable.addOnce(() => {
      cache.containers.forEach((container) => container.dispose());
      cache.containers.clear();
      cache.pending.clear();
      cache.states.clear();
      cachesByScene.delete(scene);
    });
  }
  return cache;
}

function withTimeout(promise, timeoutMs, url) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`Quá thời gian tải asset: ${url}`)), timeoutMs); }),
  ]).finally(() => clearTimeout(timer));
}

function splitModelUrl(url) {
  const slash = url.lastIndexOf('/');
  if (slash < 0) return { rootUrl: '', filename: url };
  return { rootUrl: url.slice(0, slash + 1), filename: url.slice(slash + 1) };
}

function createFallback(scene, root, name) {
  const mesh = MeshBuilder.CreateBox(`${name}-fallback`, { width: 1.2, height: 1.4, depth: 1.2 }, scene);
  mesh.position.y = 0.7;
  mesh.parent = root;
  mesh.isPickable = false;
  mesh.metadata = { assetFallback: true };
  const material = new StandardMaterial(`${name}-fallback-mat`, scene);
  material.diffuseColor = Color3.FromHexString('#f59e0b');
  material.emissiveColor = Color3.FromHexString('#7c2d12').scale(0.12);
  material.specularColor = Color3.Black();
  mesh.material = material;
  return mesh;
}

export function getModelAssetState(scene, idOrUrl) {
  const asset = resolveModelAsset(idOrUrl);
  if (!asset) return { status: 'invalid', error: 'Asset không hợp lệ' };
  return getSceneCache(scene).states.get(asset.url) || { status: 'idle', error: null };
}

export async function loadModelContainer(scene, idOrUrl, options = {}) {
  const asset = resolveModelAsset(idOrUrl);
  if (!asset || !scene || scene.isDisposed) return null;
  const { timeoutMs = 15000, retries = 1 } = options;
  const cache = getSceneCache(scene);
  if (cache.containers.has(asset.url)) return cache.containers.get(asset.url);
  if (cache.pending.has(asset.url)) return cache.pending.get(asset.url);

  const run = async () => {
    cache.states.set(asset.url, { status: 'loading', error: null });
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const { rootUrl, filename } = splitModelUrl(asset.url);
        const container = await withTimeout(SceneLoader.LoadAssetContainerAsync(rootUrl, filename, scene), timeoutMs, asset.url);
        if (scene.isDisposed) {
          container.dispose();
          return null;
        }
        cache.containers.set(asset.url, container);
        cache.states.set(asset.url, { status: 'ready', error: null });
        return container;
      } catch (error) {
        lastError = error;
      }
    }
    const message = lastError instanceof Error ? lastError.message : String(lastError);
    cache.states.set(asset.url, { status: 'failed', error: message });
    console.warn(`[ModelAssetManager] Không tải được ${asset.id} (${asset.url}):`, lastError);
    return null;
  };

  const promise = run().finally(() => cache.pending.delete(asset.url));
  cache.pending.set(asset.url, promise);
  return promise;
}

export function spawnModelSync(scene, idOrUrl, options = {}) {
  const {
    position = Vector3.Zero(), rotation = Vector3.Zero(), scaling = new Vector3(1, 1, 1), shadows = null,
    name = 'model-instance', parent = null, onLoaded = null, onError = null, colorTint = null, showFallback = true,
  } = options;
  const instanceId = ++spawnCounter;
  const root = new TransformNode(`${name}_${instanceId}`, scene);
  root.position.copyFrom(position);
  root.rotation.copyFrom(rotation);
  root.scaling.copyFrom(scaling);
  root.parent = parent;
  root.metadata = { ...(root.metadata || {}), asset: idOrUrl, assetStatus: 'loading' };

  loadModelContainer(scene, idOrUrl).then((container) => {
    if (root.isDisposed()) return;
    if (!container) {
      root.metadata.assetStatus = 'failed';
      const fallback = showFallback ? createFallback(scene, root, `${name}_${instanceId}`) : null;
      onError?.({ root, fallback, state: getModelAssetState(scene, idOrUrl) });
      return;
    }
    try {
      const instance = container.instantiateModelsToScene(
        (sourceName) => `${sourceName}_inst_${instanceId}`, false, { doNotInstantiate: true }
      );
      instance.rootNodes.forEach((node) => { node.parent = root; });
      const childMeshes = root.getChildMeshes();
      childMeshes.forEach((mesh) => {
        mesh.isPickable = false;
        mesh.receiveShadows = true;
        shadows?.addShadowCaster(mesh);
        if (colorTint && mesh.material) {
          mesh.material = mesh.material.clone(`${mesh.name}_tintMat`);
          if (mesh.material.albedoColor) mesh.material.albedoColor = colorTint;
          else if (mesh.material.diffuseColor) mesh.material.diffuseColor = colorTint;
        }
      });
      root.metadata.assetStatus = 'ready';
      onLoaded?.({ root, instance, childMeshes });
    } catch (error) {
      root.metadata.assetStatus = 'failed';
      const fallback = showFallback ? createFallback(scene, root, `${name}_${instanceId}`) : null;
      console.warn(`[ModelAssetManager] Không thể tạo instance ${idOrUrl}:`, error);
      onError?.({ root, fallback, state: { status: 'failed', error: String(error) } });
    }
  });
  return root;
}

export function spawnVillageHouse(scene, houseIdx = 0, options = {}) {
  const { position = Vector3.Zero(), rotation = Vector3.Zero(), scaling = new Vector3(3.6, 3.6, 3.6), shadows = null, name = 'village-house' } = options;
  return spawnModelSync(scene, MODEL_PATHS.village, {
    position, rotation, scaling, shadows, name,
    onLoaded: ({ root, instance }) => {
      const targetName = `house${houseIdx}`;
      let targetNode = null;
      instance.rootNodes.forEach((node) => {
        if (node.name.toLowerCase().includes('ground')) node.setEnabled(false);
        const visit = (child) => {
          if (child.name.includes(targetName)) targetNode = child;
          child.getChildren?.().forEach(visit);
        };
        visit(node);
      });
      if (!targetNode) return;
      instance.rootNodes.forEach((node) => {
        if (node !== targetNode && !node.isDescendantOf?.(targetNode)) node.setEnabled(false);
      });
      targetNode.parent = root;
      targetNode.position.set(0, 0, 0);
    },
  });
}
