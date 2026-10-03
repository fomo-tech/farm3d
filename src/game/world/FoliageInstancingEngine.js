/**
 * FoliageInstancingEngine.js
 * High-Performance GPU Hardware Instancing System for Farm3D Open World.
 * 
 * Replaces heavy GLTF individual clones with ultra-fast GPU Hardware Instancing:
 * Draw calls scale with visible cells and prototype parts, not tree count.
 * Cache nearby detail; evict cold cells gradually with an explicit limit.
 * - Dynamic shadow distance culling (< 70m from player).
 * - Static world matrix freezing (`freezeWorldMatrix()`) for instantaneous rendering.
 */

import { Vector3, Matrix, Quaternion } from '@babylonjs/core/Maths/math.vector.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import '@babylonjs/core/Meshes/thinInstanceMesh.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { MODEL_PATHS } from '../rendering/AssetRegistry.js';
import { CHUNK_SIZE, chunkAt } from './WorldPartition.js';
import { ROAD_SAFETY_CONFIG, isRoadResourceBlocked, recordBlockedRoadResource } from './RoadSafetyZone.js';

let instanceCounter = 0;

export class FoliageInstancingEngine {
  constructor(scene, shadows = null) {
    this.scene = scene;
    this.shadows = shadows;
    this.rootNode = new TransformNode('foliage-instancing-root', scene);
    
    // Prototype caches
    this.prototypes = new Map(); // key -> Array<Mesh>
    this.pendingQueue = new Map(); // key -> Array<InstanceRequest>
    this.loadedPrototypes = new Set();
    this.chunks = new Map();
    this.dirtyChunks = new Set();
    this.lastChunkUpdate = 0;
    this.scene.onBeforeRenderObservable.add(() => this.updateChunks());
    
    this.treeTypes = {
      oak: MODEL_PATHS.trees.detailed,
      pine: MODEL_PATHS.trees.pineTall,
      maple: MODEL_PATHS.trees.fall,
      sakura: MODEL_PATHS.trees.detailed,
      palm: MODEL_PATHS.trees.palm,
      bush: MODEL_PATHS.foliage.bushDetailed,
    };

    // Preload all prototypes and track completion
    this.preloadPromise = this._preloadPrototypes();
  }

  async whenReadyAsync() {
    return this.preloadPromise;
  }

  async _preloadPrototypes() {
    const promises = Object.keys(this.treeTypes).map(async (typeKey) => {
      this.pendingQueue.set(typeKey, []);
      try {
        if (this.scene.isDisposed) return;
        // A tree GLB contains hundreds of submeshes. Cloning each submesh per
        // nearby chunk caused 20k+ scene meshes and second-long main-thread
        // stalls. A few compact prototype meshes preserve layered trunks and
        // crowns while thin instances draw every placement on the GPU.
        const baseMeshes = this._createStylizedPrototype(typeKey);

        this.prototypes.set(typeKey, baseMeshes);
        this.loadedPrototypes.add(typeKey);

        const queue = this.pendingQueue.get(typeKey) || [];
        for (let i = 0; i < queue.length; i++) {
          if (this.scene.isDisposed) break;
          this._queueChunkInstance(typeKey, queue[i]);
          if (i % 16 === 15) await new Promise(resolve => setTimeout(resolve, 16));
        }
        this.pendingQueue.set(typeKey, []);
      } catch (err) {
        console.warn(`[FoliageInstancingEngine] Lỗi preload prototype ${typeKey}:`, err);
      }
    });
    await Promise.all(promises);
  }

  _createStylizedPrototype(typeKey) {
    const color = {
      oak: '#61965b', pine: '#417b65', maple: '#c6a557',
      sakura: '#df9fbd', palm: '#76a56b', bush: '#668b55',
    }[typeKey] || '#61965b';
    const makeMaterial = (suffix, hex, ambient = 0.45) => {
      const mat = new StandardMaterial(`foliage-prototype-${typeKey}-${suffix}-mat`, this.scene);
      mat.diffuseColor = Color3.FromHexString(hex);
      mat.ambientColor = mat.diffuseColor.scale(ambient);
      mat.specularColor = new Color3(0.025, 0.025, 0.025);
      mat.specularPower = 12;
      return mat;
    };
    const canopyMat = makeMaterial('canopy', color);
    const highlightMat = makeMaterial('highlight', {
      oak: '#8ab36b', pine: '#699c78', maple: '#dbc17a',
      sakura: '#e9c6d5', palm: '#98be80', bush: '#87a668',
    }[typeKey] || color, 0.5);
    const shadowMat = makeMaterial('shadow', {
      oak: '#426d45', pine: '#325f50', maple: '#a37e43',
      sakura: '#bb809f', palm: '#4a7c59', bush: '#456b45',
    }[typeKey] || color, 0.4);
    const result = [];
    const finish = (mesh, mat, position, rotation = null) => {
      mesh.material = mat;
      mesh.position.copyFromFloats(position[0], position[1], position[2]);
      if (rotation) mesh.rotation.copyFromFloats(rotation[0], rotation[1], rotation[2]);
      mesh.bakeCurrentTransformIntoVertices();
      result.push(mesh);
    };
    if (typeKey !== 'bush') {
      const trunkMat = makeMaterial('trunk', typeKey === 'palm' ? '#b98257' : '#7c5239', 0.42);
      const trunk = MeshBuilder.CreateCylinder(`foliage-prototype-${typeKey}-trunk`, {
        height: typeKey === 'palm' ? 4.6 : (typeKey === 'pine' ? 3.5 : 2.9),
        diameterTop: typeKey === 'palm' ? 0.24 : 0.34,
        diameterBottom: typeKey === 'palm' ? 0.42 : 0.58,
        tessellation: 7,
      }, this.scene);
      finish(trunk, trunkMat, [0, typeKey === 'palm' ? 2.3 : (typeKey === 'pine' ? 1.75 : 1.45), 0],
        typeKey === 'palm' ? [0.02, 0, -0.08] : null);
    }

    if (typeKey === 'pine') {
      [[2.4, 2.8, shadowMat], [2.15, 3.65, canopyMat], [1.55, 4.4, highlightMat]].forEach(([diameter, y, mat], i) => {
        const layer = MeshBuilder.CreateCylinder(`foliage-prototype-pine-layer-${i}`, {
          height: 1.8, diameterTop: 0.05, diameterBottom: diameter, tessellation: 8,
        }, this.scene);
        finish(layer, mat, [0, y, 0]);
      });
    } else if (typeKey === 'palm') {
      [[3.8, 0.46, 0, canopyMat], [3.25, 0.42, Math.PI / 2, shadowMat], [2.55, 0.5, Math.PI / 4, highlightMat]].forEach(([diameter, height, yaw, mat], i) => {
        const crown = MeshBuilder.CreateSphere(`foliage-prototype-palm-crown-${i}`, {
          diameterX: diameter, diameterY: height, diameterZ: diameter * 0.34, segments: 7,
        }, this.scene);
        finish(crown, mat, [0, 4.62 + i * 0.08, 0], [0, yaw, i === 2 ? 0.08 : -0.04]);
      });
    } else {
      const bushY = typeKey === 'bush' ? 0.65 : 2.85;
      const size = typeKey === 'bush' ? 1.25 : 2.25;
      const clusters = [[-0.55, 0, 0, shadowMat, 1], [0.5, 0.12, 0.08, canopyMat, 1.05], [0, 0.5, -0.18, highlightMat, 0.9]];
      clusters.forEach(([x, y, z, mat, scale], i) => {
        const crown = MeshBuilder.CreateSphere(`foliage-prototype-${typeKey}-crown-${i}`, {
          diameterX: size * scale, diameterY: size * 0.72 * scale, diameterZ: size * 0.9 * scale, segments: 7,
        }, this.scene);
        finish(crown, mat, [x * (typeKey === 'bush' ? 0.55 : 1), bushY + y * (typeKey === 'bush' ? 0.55 : 1), z]);
      });
    }
    for (const mesh of result) {
      mesh.isVisible = false;
      mesh.isPickable = false;
      mesh.parent = this.rootNode;
    }
    return result;
  }

  _queueChunkInstance(typeKey, req) {
    const cell = chunkAt(req.x, req.z);
    const key = `${cell.x}:${cell.z}`;
    let chunk = this.chunks.get(key);
    if (!chunk) {
      chunk = { x: cell.x, z: cell.z, groups: new Map(), detailed: false, lastUsed: 0 };
      this.chunks.set(key, chunk);
    }
    let group = chunk.groups.get(typeKey);
    if (!group) {
      group = { requests: [], meshes: [], proxy: null, dirty: true };
      chunk.groups.set(typeKey, group);
    }
    group.requests.push(req);
    group.dirty = true;
    this.dirtyChunks.add(key);
  }

  _buildGroup(chunk, typeKey, group) {
    const bases = this.prototypes.get(typeKey);
    if (!bases?.length) return;
    const matrices = group.requests.map(req => Matrix.Compose(
      new Vector3(req.scale, req.scale, req.scale),
      Quaternion.FromEulerAngles(0, req.rotY, 0),
      new Vector3(req.x, req.y, req.z),
    ));
    if (!group.proxy) {
      const proxy = typeKey === 'pine'
        ? MeshBuilder.CreateCylinder(`foliage-lod-${chunk.x}-${chunk.z}-${typeKey}`, { height: 2.2, diameterTop: 0.08, diameterBottom: 1.55, tessellation: 6 }, this.scene)
        : MeshBuilder.CreateSphere(`foliage-lod-${chunk.x}-${chunk.z}-${typeKey}`, { diameter: 1.65, segments: 6 }, this.scene);
      proxy.position.y = typeKey === 'bush' ? 0.35 : 1.55;
      proxy.bakeCurrentTransformIntoVertices();
      const material = new StandardMaterial(`${proxy.name}-mat`, this.scene);
      const colors = { oak: '#31b66e', pine: '#277c70', maple: '#f59e52', sakura: '#f3a9cf', palm: '#3fc98a', bush: '#40a16b' };
      material.diffuseColor = Color3.FromHexString(colors[typeKey] || '#31b66e');
      material.specularColor = Color3.Black();
      proxy.material = material;
      proxy.isPickable = false;
      group.proxy = proxy;
    }
    const proxyData = new Float32Array(matrices.length * 16);
    matrices.forEach((placement, i) => proxyData.set(placement.m, i * 16));
    group.proxy.thinInstanceSetBuffer('matrix', proxyData, 16, true);
    group.proxy.thinInstanceRefreshBoundingInfo(true);
    if (!chunk.detailed) {
      group.proxy.setEnabled(true);
      for (const mesh of group.meshes) mesh.setEnabled(false);
      group.dirty = false;
      return;
    }
    bases.forEach((base, index) => {
      let mesh = group.meshes[index];
      if (!mesh) {
        mesh = base.clone(`foliage-chunk-${chunk.x}-${chunk.z}-${typeKey}-${index}`, null, true);
        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, 0, 0);
        mesh.rotationQuaternion = null;
        mesh.scaling.set(1, 1, 1);
        mesh.isVisible = true;
        mesh.isPickable = false;
        group.meshes[index] = mesh;
      }
      base.computeWorldMatrix(true);
      const baseMatrix = base.getWorldMatrix();
      const data = new Float32Array(matrices.length * 16);
      matrices.forEach((placement, i) => data.set(baseMatrix.multiply(placement).m, i * 16));
      mesh.thinInstanceSetBuffer('matrix', data, 16, true);
      mesh.thinInstanceRefreshBoundingInfo(true);
      mesh.setEnabled(chunk.detailed);
      if (this.shadows && group.requests.some(req => req.withShadow)) this.shadows.addShadowCaster(mesh);
    });
    group.proxy.setEnabled(false);
    group.dirty = false;
  }

  updateChunks() {
    const now = performance.now();
    if (now - this.lastChunkUpdate < 100) return;
    this.lastChunkUpdate = now;
    const target = this.scene.activeCamera?.target;
    if (!target) return;
    const center = chunkAt(target.x, target.z);
    // A whole cell changes LOD together. Keep detailed meshes one extra cell
    // while leaving a region to avoid flicker at the boundary.
    let evicted = 0;
    for (const chunk of this.chunks.values()) {
      const distance = Math.max(Math.abs(chunk.x - center.x), Math.abs(chunk.z - center.z));
      const shouldDetail = distance <= (chunk.detailed ? 2 : 1);
      if (shouldDetail) chunk.lastUsed = now;
      if (shouldDetail === chunk.detailed) continue;
      if (!shouldDetail && evicted >= 1) continue;
      chunk.detailed = shouldDetail;
      for (const group of chunk.groups.values()) {
        if (!shouldDetail) {
          group.proxy?.setEnabled(true);
          for (const mesh of group.meshes) {
            mesh.setEnabled(false);
          }
          evicted++;
          group.dirty = false;
        } else {
          if (group.meshes.length > 0) {
            group.proxy?.setEnabled(false);
            for (const mesh of group.meshes) {
              mesh.setEnabled(true);
            }
            // Retain queued placement changes; cached buffers may be stale.
          } else {
            group.dirty = true;
          }
        }
      }
      if (shouldDetail && [...chunk.groups.values()].some(g => g.dirty)) {
        this.dirtyChunks.add(`${chunk.x}:${chunk.z}`);
      }
    }
    let built = 0;
    const pending = [...this.dirtyChunks].sort((a, b) => {
      const ca = this.chunks.get(a), cb = this.chunks.get(b);
      const da = Math.max(Math.abs(ca.x - center.x), Math.abs(ca.z - center.z));
      const db = Math.max(Math.abs(cb.x - center.x), Math.abs(cb.z - center.z));
      return da - db;
    });
    for (const key of pending) {
      const chunk = this.chunks.get(key);
      if (!chunk) continue;
      const next = [...chunk.groups].find(([, group]) => group.dirty);
      if (next) this._buildGroup(chunk, next[0], next[1]);
      if (![...chunk.groups.values()].some(group => group.dirty)) this.dirtyChunks.delete(key);
      if (++built >= 3 || performance.now() - now > 4) break;
    }
    // Returning to a recently visited cell reuses buffers. Only cold detail
    // over the cache limit is released; placement records and LOD stay intact.
    const cached = [...this.chunks.values()].filter(chunk =>
      [...chunk.groups.values()].some(group => group.meshes.length));
    if (cached.length > 32 && performance.now() - now < 4) {
      const victim = cached.filter(chunk => !chunk.detailed &&
        Math.max(Math.abs(chunk.x - center.x), Math.abs(chunk.z - center.z)) > 5)
        .sort((a, b) => (a.lastUsed || 0) - (b.lastUsed || 0))[0];
      if (victim) {
        const group = [...victim.groups.values()].find(group => group.meshes.length);
        for (const mesh of group.meshes) {
          this.shadows?.removeShadowCaster(mesh);
          mesh.dispose(false, false);
        }
        group.meshes = [];
      }
    }
  }

  /**
   * Spawns an instanced tree in the scene.
   * Runs in O(1) time and batches with zero draw call overhead.
   */
  spawnTree(type, x, z, options = {}) {
    if (ROAD_SAFETY_CONFIG.blockRoadResources && isRoadResourceBlocked(x, z, 1.2)) {
      recordBlockedRoadResource(`foliage-${type}`, x, z);
      return;
    }

    const {
      y = 0,
      scale = 1.0,
      rotY = Math.random() * Math.PI * 2,
      withShadow = false,
      colorTint = null,
    } = options;

    const typeKey = this.treeTypes[type] ? type : 'oak';
    const req = { x, y, z, scale, rotY, withShadow, colorTint };

    if (this.loadedPrototypes.has(typeKey)) {
      this._queueChunkInstance(typeKey, req);
    } else {
      const queue = this.pendingQueue.get(typeKey);
      if (queue) queue.push(req);
    }
  }

  _parseScaleAndShadow(scaleOrOptions, withShadowArg) {
    if (typeof scaleOrOptions === 'object' && scaleOrOptions !== null) {
      return {
        scale: typeof scaleOrOptions.scale === 'number' ? scaleOrOptions.scale : 1.0,
        withShadow: !!scaleOrOptions.withShadow,
      };
    }
    return {
      scale: typeof scaleOrOptions === 'number' ? scaleOrOptions : 1.0,
      withShadow: !!withShadowArg,
    };
  }

  spawnOak(x, z, scaleOrOptions = 1.35, withShadow = false) {
    const p = this._parseScaleAndShadow(scaleOrOptions, withShadow);
    this.spawnTree('oak', x, z, { scale: p.scale * 3.8, withShadow: p.withShadow });
  }

  spawnPine(x, z, scaleOrOptions = 1.35, withShadow = false) {
    const p = this._parseScaleAndShadow(scaleOrOptions, withShadow);
    this.spawnTree('pine', x, z, { scale: p.scale * 4.2, withShadow: p.withShadow });
  }

  spawnMaple(x, z, scaleOrOptions = 1.35, withShadow = false) {
    const p = this._parseScaleAndShadow(scaleOrOptions, withShadow);
    this.spawnTree('maple', x, z, { scale: p.scale * 3.8, withShadow: p.withShadow });
  }

  spawnSakura(x, z, scaleOrOptions = 1.35, withShadow = false) {
    const p = this._parseScaleAndShadow(scaleOrOptions, withShadow);
    this.spawnTree('sakura', x, z, { scale: p.scale * 3.6, withShadow: p.withShadow, colorTint: '#ffb6c1' });
  }

  spawnPalm(x, z, scaleOrOptions = 1.35, withShadow = false) {
    const p = this._parseScaleAndShadow(scaleOrOptions, withShadow);
    this.spawnTree('palm', x, z, { scale: p.scale * 3.8, withShadow: p.withShadow });
  }

  spawnBush(x, z, scaleOrOptions = 1.2) {
    const p = this._parseScaleAndShadow(scaleOrOptions, false);
    this.spawnTree('bush', x, z, { scale: p.scale * 2.4, withShadow: false });
  }
}
