import '@babylonjs/loaders/glTF/index.js';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { MODEL_PATHS, resolveModelAsset } from './AssetRegistry.js';
import { getWorldChunkStreamer } from '../world/WorldChunkStreamer.js';
import { modelWorldPosition, modelSubtreePredicate, attachVillageHouse } from './ModelPlacement.js';
import { ModelSpawnQueue } from './ModelSpawnQueue.js';
import { ROAD_SAFETY_CONFIG, isRoadResourceBlocked, recordBlockedRoadResource } from '../world/RoadSafetyZone.js';

export { MODEL_PATHS } from './AssetRegistry.js';

const cachesByScene = new WeakMap();
const proceduralMaterialsByScene = new WeakMap();
let spawnCounter = 0;
const spawnQueues = new WeakMap();

// A GLB is not expensive only because of download size. Babylon also parses
// its JSON, creates vertex buffers and builds materials on the main thread.
// The four assets below were the source of the 1.4s+ import.then freeze seen
// in the runtime soak. Keep this policy local and explicit so a future,
// compressed/decimated replacement can opt back into the detailed models.
export const MODEL_PERFORMANCE_CONFIG = Object.freeze({
  useProceduralHeavyAssets: true,
  heavyAssetUrls: Object.freeze([
    '/models/animals/cow.glb',
    '/models/animals/alpaca.glb',
    '/models/animals/shiba.glb',
    '/models/village.glb',
  ]),
});

const HEAVY_ASSET_URLS = new Set(MODEL_PERFORMANCE_CONFIG.heavyAssetUrls);

function isHeavyAsset(idOrUrl) {
  return HEAVY_ASSET_URLS.has(String(resolveModelAsset(idOrUrl)?.url || idOrUrl));
}

function proceduralMaterial(scene, key, hex, roughness = 0.82) {
  let materials = proceduralMaterialsByScene.get(scene);
  if (!materials) {
    materials = new Map();
    proceduralMaterialsByScene.set(scene, materials);
    scene.onDisposeObservable.addOnce(() => proceduralMaterialsByScene.delete(scene));
  }
  if (materials.has(key)) return materials.get(key);
  const value = new StandardMaterial(`procedural-heavy-${key}`, scene);
  value.diffuseColor = Color3.FromHexString(hex);
  value.ambientColor = value.diffuseColor.scale(0.42);
  value.specularColor = Color3.Black();
  value.roughness = roughness;
  value.freeze();
  materials.set(key, value);
  return value;
}

function proceduralPart(scene, root, name, mesh, material, position, options = {}) {
  mesh.name = name;
  mesh.position.copyFrom(position);
  mesh.material = material;
  mesh.parent = root;
  mesh.isPickable = false;
  mesh.receiveShadows = true;
  mesh.metadata = { ...(mesh.metadata || {}), proceduralAsset: true };
  options.shadows?.addShadowCaster(mesh);
  return mesh;
}

function createProceduralAnimal(scene, root, assetUrl, options = {}) {
  const meshes = [];
  const body = proceduralMaterial(scene, 'animal-body', '#f4c98f');
  const cream = proceduralMaterial(scene, 'animal-cream', '#fff4d6');
  const dark = proceduralMaterial(scene, 'animal-dark', '#4a3027');
  const pink = proceduralMaterial(scene, 'animal-pink', '#f38ba8');
  const black = proceduralMaterial(scene, 'animal-black', '#151827');
  const part = (name, mesh, material, position) => meshes.push(proceduralPart(scene, root, name, mesh, material, position, options));

  const sphere = (name, size, position, material, segments = 8) =>
    part(name, MeshBuilder.CreateSphere(name, { diameter: size, segments }, scene), material, position);
  const box = (name, size, position, material) =>
    part(name, MeshBuilder.CreateBox(name, size, scene), material, position);
  const leg = (name, x, z, height, material) => {
    const mesh = MeshBuilder.CreateCylinder(name, { height, diameter: height * 0.32, tessellation: 6 }, scene);
    return part(name, mesh, material, new Vector3(x, height * 0.5, z));
  };

  if (/cow\.glb$/i.test(assetUrl)) {
    sphere('cow-body', 2.2, new Vector3(0, 1.35, 0), cream, 8);
    sphere('cow-head', 1.05, new Vector3(0.85, 2.05, -0.06), cream, 8);
    sphere('cow-muzzle', 0.54, new Vector3(1.27, 1.92, -0.06), pink, 8);
    [[-0.35, -0.65], [0.45, -0.65], [-0.35, 0.65], [0.45, 0.65]].forEach(([x, z], index) => leg(`cow-leg-${index}`, x, z, 0.95, cream));
    [[-0.36, -0.24], [0.34, 0.18], [-0.08, 0.5]].forEach(([x, z], index) => sphere(`cow-spot-${index}`, 0.48, new Vector3(x, 1.42, z), dark, 7));
    sphere('cow-eye', 0.13, new Vector3(1.18, 2.25, -0.4), black, 6);
    sphere('cow-horn', 0.2, new Vector3(0.76, 2.68, -0.22), dark, 6);
  } else if (/alpaca\.glb$/i.test(assetUrl)) {
    sphere('alpaca-body', 1.65, new Vector3(0, 1.2, 0), cream, 8);
    sphere('alpaca-neck', 0.78, new Vector3(0.42, 2.05, 0), cream, 8);
    sphere('alpaca-head', 0.78, new Vector3(0.7, 2.68, -0.02), cream, 8);
    [[0.48, -0.28], [0.48, 0.28], [-0.38, -0.3], [-0.38, 0.3]].forEach(([x, z], index) => leg(`alpaca-leg-${index}`, x, z, 0.86, dark));
    [[0.65, -0.34], [0.65, 0.34]].forEach(([x, z], index) => {
      const ear = MeshBuilder.CreateCylinder(`alpaca-ear-${index}`, { height: 0.32, diameter: 0.16, tessellation: 5 }, scene);
      ear.rotation.z = index ? -0.5 : 0.5;
      part(`alpaca-ear-${index}`, ear, cream, new Vector3(x, 3.15, z));
    });
    sphere('alpaca-eye', 0.1, new Vector3(0.98, 2.78, -0.31), black, 6);
  } else {
    // Shiba: compact silhouette with ears and a curled tail, intentionally
    // low-poly so it remains readable without a multi-megabyte GLB parse.
    sphere('shiba-body', 1.25, new Vector3(0, 0.9, 0), body, 8);
    sphere('shiba-head', 0.92, new Vector3(0.55, 1.62, -0.02), body, 8);
    sphere('shiba-muzzle', 0.42, new Vector3(0.9, 1.49, -0.03), cream, 8);
    [[-0.3, -0.32], [0.35, -0.32], [-0.3, 0.32], [0.35, 0.32]].forEach(([x, z], index) => leg(`shiba-leg-${index}`, x, z, 0.62, body));
    [[0.32, -0.31], [0.32, 0.31]].forEach(([x, z], index) => {
      const ear = MeshBuilder.CreateCylinder(`shiba-ear-${index}`, { height: 0.38, diameter: 0.3, tessellation: 4 }, scene);
      ear.rotation.z = index ? -0.55 : 0.55;
      part(`shiba-ear-${index}`, ear, body, new Vector3(x, 2.2, z));
    });
    sphere('shiba-eye', 0.1, new Vector3(0.8, 1.78, -0.32), black, 6);
    sphere('shiba-tail', 0.48, new Vector3(-0.7, 1.35, 0), body, 7);
  }
  return meshes;
}

function createProceduralVillageHouse(scene, root, options = {}) {
  const wall = proceduralMaterial(scene, 'house-wall', '#f4dfb7');
  const roof = proceduralMaterial(scene, 'house-roof', '#c86b47');
  const wood = proceduralMaterial(scene, 'house-wood', '#754934');
  const glass = proceduralMaterial(scene, 'house-window', '#8bd7e8');
  const meshes = [];
  const part = (name, mesh, material, position) => meshes.push(proceduralPart(scene, root, name, mesh, material, position, options));
  part('house-base', MeshBuilder.CreateBox('house-base', { width: 4.8, height: 2.8, depth: 3.8 }, scene), wall, new Vector3(0, 1.4, 0));
  part('house-roof', MeshBuilder.CreateBox('house-roof', { width: 5.4, height: 0.42, depth: 4.4 }, scene), roof, new Vector3(0, 3.05, 0));
  part('house-door', MeshBuilder.CreateBox('house-door', { width: 0.85, height: 1.55, depth: 0.12 }, scene), wood, new Vector3(0, 0.78, -1.96));
  [-1.55, 1.55].forEach((x, index) => part(`house-window-${index}`, MeshBuilder.CreateBox(`house-window-${index}`, { width: 0.92, height: 0.72, depth: 0.1 }, scene), glass, new Vector3(x, 1.75, -1.97)));
  part('house-chimney', MeshBuilder.CreateBox('house-chimney', { width: 0.48, height: 1.1, depth: 0.48 }, scene), wood, new Vector3(1.45, 3.55, 0.55));
  return meshes;
}

function createProceduralHeavyAsset(scene, root, assetUrl, options = {}) {
  if (/animals\/(cow|alpaca|shiba)\.glb$/i.test(assetUrl)) return createProceduralAnimal(scene, root, assetUrl, options);
  if (/village\.glb$/i.test(assetUrl)) return createProceduralVillageHouse(scene, root, options);
  return [createFallback(scene, root, `heavy-${assetUrl}`)];
}

function yieldModelSpawn(scene, priority, relevant, work, label) {
  let queue = spawnQueues.get(scene);
  if (!queue) {
    queue = new ModelSpawnQueue();
    spawnQueues.set(scene, queue);
    scene.onDisposeObservable.addOnce(() => { queue.dispose(); spawnQueues.delete(scene); });
  }
  return queue.run(work, priority, relevant, label);
}

export function getModelWorkStats(scene) {
  const cache = cachesByScene.get(scene);
  return {
    spawn: spawnQueues.get(scene)?.getStats(),
    activeLoads: cache?.activeLoads || 0,
    pendingLoads: cache?.loadQueue.length || 0,
    maxLoadMs: cache?.maxLoadMs || 0,
    lastLoad: cache?.lastLoad || null,
    slowLoads: cache?.slowLoads || [],
  };
}

function getSceneCache(scene) {
  let cache = cachesByScene.get(scene);
  if (!cache) {
    cache = {
      containers: new Map(), pending: new Map(), states: new Map(), loadQueue: [], activeLoads: 0,
      lastLoad: null, slowLoads: [],
    };
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
  while (!scene.isDisposed && cache.activeLoads < 1 && cache.loadQueue.length) {
    const job = cache.loadQueue.shift();
    cache.activeLoads += 1;
    Promise.resolve().then(job.run).then(job.resolve, job.reject).finally(() => {
      cache.activeLoads -= 1;
      setTimeout(() => pumpModelLoads(scene, cache), 16);
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

function createDistantProxy(scene, root, name, assetUrl) {
  const rock = /rock|cliff|boulder/i.test(assetUrl);
  const proxy = rock
    ? MeshBuilder.CreateSphere(`${name}-distant-lod`, { diameter: 1.2, segments: 6 }, scene)
    : MeshBuilder.CreateBox(`${name}-distant-lod`, { width: 1.2, height: 1.4, depth: 1.2 }, scene);
  proxy.position.y = rock ? 0.45 : 0.7;
  proxy.parent = root;
  proxy.isPickable = false;
  const material = new StandardMaterial(`${name}-distant-lod-mat`, scene);
  material.diffuseColor = Color3.FromHexString(rock ? '#8b9b96' : '#b99d77');
  material.specularColor = Color3.Black();
  proxy.material = material;
  return proxy;
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
        const loadStart = performance.now();
        const container = await withTimeout(SceneLoader.LoadAssetContainerAsync(rootUrl, filename, scene), timeoutMs, asset.url);
        const loadMs = performance.now() - loadStart;
        cache.maxLoadMs = Math.max(cache.maxLoadMs || 0, loadMs);
        cache.lastLoad = { id: asset.id, url: asset.url, ms: loadMs };
        if (loadMs > 200) {
          cache.slowLoads.push(cache.lastLoad);
          if (cache.slowLoads.length > 8) cache.slowLoads.shift();
        }
        if (scene.isDisposed) {
          container.dispose();
          return null;
        }
        if (container.textures) {
          const requestedAnisotropy = scene.metadata?.textureAnisotropy || 8;
          const maxAnisotropy = scene.getEngine?.().getCaps?.().maxAnisotropy || requestedAnisotropy;
          const anisotropy = Math.min(requestedAnisotropy, maxAnisotropy);
          container.textures.forEach(tex => { tex.anisotropicFilteringLevel = anisotropy; });
        }
        cache.containers.set(asset.url, container);
        // glTF loader owns sRGB/linear decoding; never gamma-convert textures twice.
        for (const material of container.materials || []) {
          if ('environmentIntensity' in material) material.environmentIntensity = Math.min(material.environmentIntensity, .7);
          if ('roughness' in material && Number.isFinite(material.roughness) && material.metallic < .5 && !material.subSurface?.isRefractionEnabled) material.roughness = Math.max(.3, material.roughness);
        }
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
    name = 'model-instance', parent = null, onLoaded = null, onError = null, colorTint = null, showFallback = true, streamable = false,
    allowOnRoad = false, selectNodeName = null,
  } = options;

  // Road Corridor Safety Guard: Block resource/model from spawning on road corridors
  if (!allowOnRoad && ROAD_SAFETY_CONFIG?.blockRoadResources) {
    const world = modelWorldPosition(position, parent);
    const worldX = world.x;
    const worldZ = world.z;
    if (isRoadResourceBlocked(worldX, worldZ, 0.6)) {
      recordBlockedRoadResource(name || String(idOrUrl), worldX, worldZ);
      const blockedNode = new TransformNode(`blocked-road-resource-${name}`, scene);
      blockedNode.position.copyFrom(position);
      blockedNode.setEnabled(false);
      blockedNode.isPickable = false;
      blockedNode.parent = parent;
      blockedNode.metadata = { blockedOnRoad: true, asset: idOrUrl, assetStatus: 'blocked' };
      return blockedNode;
    }
  }

  const instanceId = ++spawnCounter;
  const root = new TransformNode(`${name}_${instanceId}`, scene);
  root.position.copyFrom(position);
  root.rotation.copyFrom(rotation);
  root.scaling.copyFrom(scaling);
  root.parent = parent;
  root.metadata = { ...(root.metadata || {}), asset: idOrUrl, assetStatus: 'loading' };
  let activeInstance = null;
  let loadEpoch = 0;
  const ownedTintMaterials = new Set();
  const releaseInstance = () => {
    const instance = activeInstance;
    activeInstance = null;
    if (instance?.dispose) instance.dispose();
    else {
      instance?.rootNodes?.forEach(node => node.dispose?.(false, false));
      instance?.animationGroups?.forEach(group => group.dispose());
      instance?.skeletons?.forEach(skeleton => skeleton.dispose());
    }
    // Tint clones belong to this placement, but their textures belong to the
    // shared asset container. Never dispose those textures with the clone.
    for (const material of ownedTintMaterials) material.dispose(false, false);
    ownedTintMaterials.clear();
  };
  root.onDisposeObservable.addOnce(releaseInstance);

  // Do not let a large GLB enter Babylon's synchronous parser during play.
  // The generated low-poly silhouettes keep the object readable and preserve
  // animation/parenting behavior while avoiding the long import.then task.
  const resolvedUrl = String(resolveModelAsset(idOrUrl)?.url || idOrUrl);
  if (MODEL_PERFORMANCE_CONFIG.useProceduralHeavyAssets && isHeavyAsset(idOrUrl)) {
    const childMeshes = createProceduralHeavyAsset(scene, root, resolvedUrl, { shadows });
    root.metadata.assetStatus = 'ready';
    root.metadata.assetBackend = 'procedural-low-poly';
    root.metadata.assetSource = resolvedUrl;
    root.computeWorldMatrix(true);
    onLoaded?.({ root, instance: null, childMeshes });
    return root;
  }

  const materialize = () => {
    const epoch = loadEpoch;
    return loadModelContainer(scene, idOrUrl).then(async (container) => {
    return yieldModelSpawn(scene, selectNodeName ? 100 : (/house|barn|corral|manor/.test(name) ? 20 : 0),
      () => !root.isDisposed() && !scene.isDisposed && epoch === loadEpoch, () => {
    if (root.isDisposed() || scene.isDisposed || epoch !== loadEpoch) return false;
    if (!container) {
      root.metadata.assetStatus = 'failed';
      const fallback = showFallback ? createFallback(scene, root, `${name}_${instanceId}`) : null;
      onError?.({ root, fallback, state: getModelAssetState(scene, idOrUrl) });
      return false;
    }
    let instance;
    try {
      window.__farmDebug?.stage(`instantiate asset: ${idOrUrl}`);
      instance = container.instantiateModelsToScene(
        (sourceName) => `${sourceName}_inst_${instanceId}`, false, {
          doNotInstantiate: Boolean(colorTint),
          predicate: selectNodeName ? modelSubtreePredicate(container, selectNodeName) : undefined,
        }
      );
      instance.rootNodes.forEach((node) => { node.parent = root; });
      activeInstance = instance;
      const childMeshes = instance.rootNodes.flatMap(node => [
        ...(node.getTotalVertices?.() > 0 ? [node] : []),
        ...(node.getChildMeshes?.(false) || []),
      ]).filter(mesh => mesh.getTotalVertices?.() > 0);
      const distSq = root.position.x * root.position.x + root.position.z * root.position.z;
      const isSmallProp = /flower|flw|petal|grass|pebble|crop|carrot|pumpkin|lantern|lamp|bench|bucket|oar|duck/i.test(name) || /flower|bush|pebble/i.test(String(idOrUrl));
      const canCastShadow = shadows && !isSmallProp && distSq < 14400; // < 120m from origin
      const shadowMeshes = canCastShadow ? childMeshes.slice(0, 2) : [];

      childMeshes.forEach((mesh) => {
        mesh.isPickable = false;
        if (mesh.sourceMesh) mesh.sourceMesh.receiveShadows = true;
        else mesh.receiveShadows = true;
        mesh.doNotSyncBoundingInfo = true;
        if (typeof mesh.freezeWorldMatrix === 'function') mesh.freezeWorldMatrix();
        if (shadowMeshes.includes(mesh)) {
          shadows.addShadowCaster(mesh);
        }
        if (colorTint && mesh.material) {
          mesh.material = mesh.material.clone(`${mesh.name}_tintMat`);
          ownedTintMaterials.add(mesh.material);
          if (mesh.material.albedoColor) mesh.material.albedoColor = colorTint;
          else if (mesh.material.diffuseColor) mesh.material.diffuseColor = colorTint;
        }
      });
      root.freezeWorldMatrix();
      root.metadata.assetStatus = 'ready';
      onLoaded?.({ root, instance, childMeshes });
      return true;
    } catch (error) {
      releaseInstance();
      root.metadata.assetStatus = 'failed';
      const fallback = showFallback ? createFallback(scene, root, `${name}_${instanceId}`) : null;
      console.warn(`[ModelAssetManager] Không thể tạo instance ${idOrUrl}:`, error);
      onError?.({ root, fallback, state: { status: 'failed', error: String(error) } });
      return false;
    } finally {
      window.__farmDebug?.endStage();
    }
    }, `instantiate asset: ${idOrUrl}`);
  });
  };
  const shouldStream = streamable || /(?:rock|cliff)[^/]*\.glb$/i.test(String(resolveModelAsset(idOrUrl)?.url || ''));
  if (shouldStream) {
    root.computeWorldMatrix(true);
    const absolute = root.getAbsolutePosition();
    const proxy = createDistantProxy(scene, root, `${name}_${instanceId}`, String(idOrUrl));
    root.metadata.assetStatus = 'lod';
    const unregister = getWorldChunkStreamer(scene).register(root.name, absolute.x, absolute.z, {
      load: materialize,
      unload: () => {
        loadEpoch++;
        releaseInstance();
        root.metadata.assetStatus = 'lod';
      },
      showLod: () => proxy.setEnabled(true),
      hideLod: () => proxy.setEnabled(false),
    });
    root.onDisposeObservable.addOnce(unregister);
  } else materialize();
  return root;
}

export function spawnVillageHouse(scene, houseIdx = 0, options = {}) {
  const { position = Vector3.Zero(), rotation = Vector3.Zero(), scaling = new Vector3(3.6, 3.6, 3.6), shadows = null, name = 'village-house', parent = null } = options;
  return spawnModelSync(scene, MODEL_PATHS.village, {
    position, rotation, scaling, shadows, name, parent, selectNodeName: `house${houseIdx}`,
    onLoaded: ({ root, instance }) => {
      if (instance) attachVillageHouse(root, instance, `house${houseIdx}`);
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
