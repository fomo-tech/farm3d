import '@babylonjs/loaders/glTF/index.js';
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
    cache = { containers: new Map(), pending: new Map(), states: new Map(), loadQueue: [], activeLoads: 0 };
    cachesByScene.set(scene, cache);
    scene.onDisposeObservable.addOnce(() => {
      cache.containers.forEach((container) => container.dispose());
      cache.containers.clear();
      cache.pending.clear();
      cache.loadQueue.splice(0).forEach(job => job.resolve(null));
      cache.states.clear();
      cachesByScene.delete(scene);
    });
  }
  return cache;
}

function pumpModelLoads(scene, cache) {
  while (!scene.isDisposed && cache.activeLoads < 4 && cache.loadQueue.length) {
    const job = cache.loadQueue.shift();
    cache.activeLoads += 1;
    Promise.resolve().then(job.run).then(job.resolve, job.reject).finally(() => {
      cache.activeLoads -= 1;
      pumpModelLoads(scene, cache);
    });
  }
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
        if (container.textures) {
          container.textures.forEach(tex => {
            tex.anisotropicFilteringLevel = 16;
          });
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

  const promise = new Promise((resolve, reject) => {
    cache.loadQueue.push({ run, resolve, reject });
    pumpModelLoads(scene, cache);
  }).finally(() => cache.pending.delete(asset.url));
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
    let instance;
    try {
      instance = container.instantiateModelsToScene(
        (sourceName) => `${sourceName}_inst_${instanceId}`, false, { doNotInstantiate: true }
      );
      instance.rootNodes.forEach((node) => { node.parent = root; });
      const childMeshes = instance.rootNodes.flatMap(node => [
        ...(node.getTotalVertices?.() > 0 ? [node] : []),
        ...(node.getChildMeshes?.(false) || []),
      ]).filter(mesh => mesh.getTotalVertices?.() > 0);
      const distSq = root.position.x * root.position.x + root.position.z * root.position.z;
      const canCastShadow = shadows && distSq < 48400; // < 220m from origin

      childMeshes.forEach((mesh) => {
        mesh.isPickable = false;
        mesh.receiveShadows = true;
        mesh.doNotSyncBoundingInfo = true;
        if (typeof mesh.freezeWorldMatrix === 'function') mesh.freezeWorldMatrix();
        if (canCastShadow) {
          shadows.addShadowCaster(mesh);
        }
        if (colorTint && mesh.material) {
          mesh.material = mesh.material.clone(`${mesh.name}_tintMat`);
          if (mesh.material.albedoColor) mesh.material.albedoColor = colorTint;
          else if (mesh.material.diffuseColor) mesh.material.diffuseColor = colorTint;
        }
      });
      root.freezeWorldMatrix();
      root.metadata.assetStatus = 'ready';
      onLoaded?.({ root, instance, childMeshes });
    } catch (error) {
      instance?.rootNodes?.forEach(node => node.dispose?.(false, true));
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

export const ESSENTIAL_WORLD_ASSETS = Object.freeze([
  // Cây cối & Thực vật
  MODEL_PATHS.trees.oak,
  MODEL_PATHS.trees.fall,
  MODEL_PATHS.trees.pine,
  MODEL_PATHS.trees.palm,
  MODEL_PATHS.trees.detailed,
  MODEL_PATHS.trees.oakFall,
  MODEL_PATHS.trees.palmBend,
  MODEL_PATHS.trees.pineRound,
  MODEL_PATHS.foliage.bushDetailed,
  MODEL_PATHS.foliage.flowerRed,
  MODEL_PATHS.foliage.flowerYellow,
  MODEL_PATHS.foliage.flowerPurple,
  // Động vật
  MODEL_PATHS.animals.cow,
  MODEL_PATHS.animals.alpaca,
  MODEL_PATHS.animals.duck,
  MODEL_PATHS.animals.fox,
  MODEL_PATHS.animals.horse,
  MODEL_PATHS.animals.shiba,
  // Công trình & Tiện ích làng mạc
  MODEL_PATHS.town.windmill,
  MODEL_PATHS.town.watermill,
  MODEL_PATHS.town.cart,
  MODEL_PATHS.town.cartHigh,
  MODEL_PATHS.town.lantern,
  MODEL_PATHS.town.fence,
  MODEL_PATHS.town.stairsWood,
  MODEL_PATHS.town.stairsStone,
  MODEL_PATHS.town.stallGreen,
  MODEL_PATHS.town.stallRed,
  MODEL_PATHS.town.wheel,
  MODEL_PATHS.town.bridgeWood,
  MODEL_PATHS.village,
  // Cây trồng & Đá tự nhiên
  MODEL_PATHS.crops.pumpkin,
  MODEL_PATHS.crops.melon,
  MODEL_PATHS.crops.turnip,
  MODEL_PATHS.crops.wheatB,
  MODEL_PATHS.crops.leafsA,
  MODEL_PATHS.crops.leafsB,
  MODEL_PATHS.rocks.large,
  MODEL_PATHS.rocks.small,
]);

export const ASSET_FRIENDLY_NAMES = Object.freeze({
  [MODEL_PATHS.town.windmill]: 'Cối Xay Gió Khổng Lồ',
  [MODEL_PATHS.town.watermill]: 'Guồng Nước Thủy Điện',
  [MODEL_PATHS.town.cart]: 'Xe Kéo Nông Sản',
  [MODEL_PATHS.town.cartHigh]: 'Xe Chở Kiện Rơm',
  [MODEL_PATHS.town.lantern]: 'Đèn Lồng Phố Cổ',
  [MODEL_PATHS.town.fence]: 'Hàng Rào Gỗ Sơn Trắng',
  [MODEL_PATHS.town.stairsWood]: 'Bậc Thang Gỗ Làng',
  [MODEL_PATHS.town.stairsStone]: 'Cầu Thang Đá',
  [MODEL_PATHS.town.stallGreen]: 'Gian Hàng Nông Phẩm',
  [MODEL_PATHS.town.stallRed]: 'Tiệm Tạp Hóa Xanh',
  [MODEL_PATHS.town.wheel]: 'Bánh Răng Cơ Khí',
  [MODEL_PATHS.town.bridgeWood]: 'Cầu Gỗ Ven Sông',
  [MODEL_PATHS.village]: 'Khu Nhà Phố Làng Kaia',
  [MODEL_PATHS.trees.oak]: 'Cây Sồi Cổ Thụ',
  [MODEL_PATHS.trees.fall]: 'Cây Phong Mùa Thu',
  [MODEL_PATHS.trees.pine]: 'Cây Thông Thung Lũng',
  [MODEL_PATHS.trees.palm]: 'Cây Dừa Bờ Hồ',
  [MODEL_PATHS.trees.detailed]: 'Cây Tán Rộng Tươi Mát',
  [MODEL_PATHS.trees.oakFall]: 'Cây Lá Đỏ Ven Sông',
  [MODEL_PATHS.trees.palmBend]: 'Cây Dừa Uốn Lượn',
  [MODEL_PATHS.trees.pineRound]: 'Cây Thông Tròn',
  [MODEL_PATHS.foliage.bushDetailed]: 'Bụi Cây Hoa Cảnh',
  [MODEL_PATHS.foliage.flowerRed]: 'Khóm Hoa Hồng Tươi',
  [MODEL_PATHS.foliage.flowerYellow]: 'Vạt Hoa Cúc Vàng',
  [MODEL_PATHS.foliage.flowerPurple]: 'Cánh Đồng Hoa Oải Hương',
  [MODEL_PATHS.animals.cow]: 'Đàn Bò Sữa Đốm Trắng',
  [MODEL_PATHS.animals.alpaca]: 'Lạc Đà Lông Cừu Alpaca',
  [MODEL_PATHS.animals.duck]: 'Đàn Vịt Trắng Bơi Sông',
  [MODEL_PATHS.animals.fox]: 'Cáo Cam Rừng Thông',
  [MODEL_PATHS.animals.horse]: 'Ngựa Nâu Thảo Nguyên',
  [MODEL_PATHS.animals.shiba]: 'Cún Cưng Shiba Vui Vẻ',
  [MODEL_PATHS.crops.pumpkin]: 'Vườn Bí Ngô Khổng Lồ',
  [MODEL_PATHS.crops.melon]: 'Ruộng Dưa Hấu Ngọt Lịm',
  [MODEL_PATHS.crops.turnip]: 'Củ Cải Trắng Vụ Đông',
  [MODEL_PATHS.crops.wheatB]: 'Cánh Đồng Lúa Mì Vàng Óng',
  [MODEL_PATHS.crops.leafsA]: 'Rau Xanh Tươi Mát',
  [MODEL_PATHS.crops.leafsB]: 'Vạt Cây Gia Vị',
  [MODEL_PATHS.rocks.large]: 'Khối Đá Cảnh Quan',
  [MODEL_PATHS.rocks.small]: 'Đá Cuội Ven Suối',
});

export async function preloadAssetCatalog(scene, assetList = ESSENTIAL_WORLD_ASSETS, onProgress = null) {
  if (!scene || scene.isDisposed) return;
  const list = Array.from(new Set(assetList));
  const total = list.length;
  let loadedCount = 0;

  onProgress?.({
    current: 0,
    total,
    percentage: 0,
    currentAsset: list[0] || '',
    friendlyName: ASSET_FRIENDLY_NAMES[list[0]] || 'Khởi tạo tài nguyên',
  });

  // Babylon already fetches these assets. A second parallel fetch for every
  // model doubles memory pressure during startup on low-memory browsers.
  const concurrency = Math.min(4, total);
  let currentIndex = 0;

  const loadWorker = async () => {
    while (currentIndex < list.length) {
      const idx = currentIndex++;
      const assetUrl = list[idx];
      const friendlyName = ASSET_FRIENDLY_NAMES[assetUrl] || assetUrl.split('/').pop().replace(/\.(glb|gltf)$/, '');

      try {
        await loadModelContainer(scene, assetUrl);
      } catch (err) {
        console.warn(`[ModelAssetManager] Không thể nạp trước model ${assetUrl}:`, err);
      }

      loadedCount++;
      const percentage = Math.round((loadedCount / total) * 100);
      onProgress?.({
        current: loadedCount,
        total,
        percentage,
        currentAsset: assetUrl,
        friendlyName,
      });
    }
  };

  const workers = Array.from({ length: concurrency }, () => loadWorker());
  await Promise.all(workers);
}
