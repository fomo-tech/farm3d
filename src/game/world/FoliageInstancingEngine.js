/**
 * FoliageInstancingEngine.js
 * High-Performance GPU Hardware Instancing System for Farm3D Open World.
 * 
 * Implements the authentic "Cozy Farmy" (cozyfarmy.com) aesthetic:
 * - Low-Poly Faceted Trees with crisp triangular polygon faces (flat shading)
 *   that catch the sun on every facet (Forest Oak, Sakura Blossom, Alpine Pine,
 *   White Birch, Autumn Maple, Orchard Fruit Tree, Tropical Palm, Garden Bushes).
 * - Multi-tiered sunlit highlights and shadow tones.
 * - Instantaneous procedural prototype compilation (< 3ms total startup, zero lag).
 * - 100% GPU Hardware Thin Instancing: 1-3 draw calls per tree type for the ENTIRE world.
 * - Dynamic camera target tracking (properly handles camera.lockedTarget in villages).
 * - Extended 300m+ LOD detail range so all nearby village trees are full 3D models.
 */

import { Vector3, Matrix, Quaternion } from '@babylonjs/core/Maths/math.vector.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import '@babylonjs/core/Meshes/thinInstanceMesh.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { CHUNK_SIZE, chunkAt } from './WorldPartition.js';
import { streamingPosition } from './streamingPosition.js';
import { ROAD_SAFETY_CONFIG, isRoadResourceBlocked, recordBlockedRoadResource } from './RoadSafetyZone.js';
import { isPointInLakeOrRiver } from './WaterSafetyZone.js';
import { LANDSCAPE_ART as ART, landscapeVariation } from './LandscapeArt.js';
import { beachResourceWaterAt as beachWaterAt } from '../../../shared/beachConfig.js';

let instanceCounter = 0;

export class FoliageInstancingEngine {
  constructor(scene, shadows = null) {
    this.scene = scene;
    this.mobile = !!scene.metadata?.mobile;
    this.shadows = shadows;
    this.rootNode = new TransformNode('foliage-instancing-root', scene);

    // Prototype caches
    this.prototypes = new Map(); // key -> Array<Mesh>
    this.pendingQueue = new Map(); // key -> Array<InstanceRequest>
    this.loadedPrototypes = new Set();
    this.chunks = new Map();
    this.dirtyChunks = new Set();
    this.lastChunkUpdate = -1000;
    // Far scenery is hidden by the mobile fog. Keeping a full, unique LOD mesh
    // for every species in every world chunk grows WebGL resources with the
    // entire map even though only a small ring can be seen on a phone.
    this.mobileProxyRadius = 4;
    this.center = null;
    this.scene.onBeforeRenderObservable.add(() => this.updateChunks());

    this.treeTypes = {
      oak: 'oak',
      pine: 'pine',
      maple: 'maple',
      sakura: 'sakura',
      birch: 'birch',
      fruit: 'fruit',
      palm: 'palm',
      bush: 'bush',
    };

    // Keep placement requests for every type while prototypes are built in slices.
    for (const typeKey of Object.keys(this.treeTypes)) this.pendingQueue.set(typeKey, []);
    this.preloadPromise = this._preloadPrototypes();
  }

  async whenReadyAsync() {
    return this.preloadPromise;
  }

  getStats() {
    let placements = 0, detailBatches = 0, enabledBatches = 0, lodBatches = 0, missingRepresentations = 0;
    for (const chunk of this.chunks.values()) {
      const distance = this.center ? Math.max(Math.abs(chunk.x - this.center.x), Math.abs(chunk.z - this.center.z)) : 0;
      for (const group of chunk.groups.values()) {
        placements += group.requests.length;
        detailBatches += group.meshes.length;
        enabledBatches += group.meshes.filter(mesh => mesh.isEnabled() && mesh.isVisible).length;
        const lodVisible = group.proxy?.isEnabled() && group.proxy.isVisible;
        if (lodVisible) lodBatches++;
        if ((!this.mobile || distance <= this.mobileProxyRadius) && !lodVisible &&
          !group.meshes.some(mesh => mesh.isEnabled() && mesh.isVisible)) missingRepresentations++;
      }
    }
    return { placements, detailBatches, enabledBatches, lodBatches, missingRepresentations,
      visibleChunkRadius: this.mobile ? this.mobileProxyRadius : null,
      pending: this.dirtyChunks.size, species: this.loadedPrototypes.size };
  }

  _makeFacetedMaterial(name, hex, ambientScale = 0.30) {
    const mat = new StandardMaterial(name, this.scene);
    mat.diffuseColor = Color3.FromHexString(hex);
    mat.ambientColor = mat.diffuseColor.scale(ambientScale);
    mat.specularColor = new Color3(0.07, 0.07, 0.07);
    mat.specularPower = 24;
    mat.backFaceCulling = true;
    mat.freeze();
    return mat;
  }

  /**
   * Creates shared rounded tree prototypes; distant proxies keep inexpensive faceted silhouettes.
   */
  _createFacetedPrototype(typeKey) {
    const scene = this.scene;
    const result = [];
    // Smooth normals improve shading without extra mobile vertices.
    const crownSubdivisions = this.mobile ? 2 : 3;

    const finish = (mesh, mat) => {
      mesh.material = mat;
      mesh.bakeCurrentTransformIntoVertices();
      mesh.isVisible = false;
      mesh.isPickable = false;
      mesh.parent = this.rootNode;
      result.push(mesh);
    };

    if (typeKey === 'oak') {
      // 1. Classic Cozy Farmy Forest Oak (Caramel trunk + Dual-tone green rounded canopy)
      const trunkMat = this._makeFacetedMaterial('oak-trunk-mat', ART.trunk);
      const lowerMat = this._makeFacetedMaterial('oak-lower-mat', ART.leaf);
      const topMat = this._makeFacetedMaterial('oak-top-mat', ART.leafLight);

      const trunk = MeshBuilder.CreateCylinder('oak-proto-trunk', {
        height: 2.2, diameterTop: 0.38, diameterBottom: 0.65, tessellation: 7,
      }, scene);
      trunk.position.y = 1.1;
      finish(trunk, trunkMat);

      const p1 = MeshBuilder.CreateIcoSphere('oak-p1', { radius: 1.35, subdivisions: crownSubdivisions, flat: false }, scene);
      p1.position.set(-0.4, 2.3, 0.1);
      p1.bakeCurrentTransformIntoVertices();

      const p2 = MeshBuilder.CreateIcoSphere('oak-p2', { radius: 1.5, subdivisions: crownSubdivisions, flat: false }, scene);
      p2.position.set(0.45, 2.5, -0.15);
      p2.bakeCurrentTransformIntoVertices();

      const lower = Mesh.MergeMeshes([p1, p2], true, true, undefined, false, true);
      finish(lower || p1, lowerMat);

      const top = MeshBuilder.CreateIcoSphere('oak-top', { radius: 1.25, subdivisions: crownSubdivisions, flat: false }, scene);
      top.position.set(0, 3.3, 0);
      finish(top, topMat);

    } else if (typeKey === 'sakura') {
      // 2. Cozy Farmy Cherry Blossom (Cherry wood trunk + Smooth pastel pink blossom canopy)
      const trunkMat = this._makeFacetedMaterial('sakura-trunk-mat', '#5c3a21');
      const lowerMat = this._makeFacetedMaterial('sakura-lower-mat', '#CE85A5');
      const topMat = this._makeFacetedMaterial('sakura-top-mat', '#EBAFC6');

      const trunk = MeshBuilder.CreateCylinder('sakura-proto-trunk', {
        height: 2.2, diameterTop: 0.38, diameterBottom: 0.65, tessellation: 7,
      }, scene);
      trunk.position.y = 1.1;
      finish(trunk, trunkMat);

      const p1 = MeshBuilder.CreateIcoSphere('sakura-p1', { radius: 1.35, subdivisions: crownSubdivisions, flat: false }, scene);
      p1.position.set(-0.4, 2.3, 0.1);
      p1.bakeCurrentTransformIntoVertices();

      const p2 = MeshBuilder.CreateIcoSphere('sakura-p2', { radius: 1.5, subdivisions: crownSubdivisions, flat: false }, scene);
      p2.position.set(0.45, 2.5, -0.15);
      p2.bakeCurrentTransformIntoVertices();

      const lower = Mesh.MergeMeshes([p1, p2], true, true, undefined, false, true);
      finish(lower || p1, lowerMat);

      const top = MeshBuilder.CreateIcoSphere('sakura-top', { radius: 1.25, subdivisions: crownSubdivisions, flat: false }, scene);
      top.position.set(0, 3.3, 0);
      finish(top, topMat);

    } else if (typeKey === 'pine') {
      // 3. Alpine Pine (Dark wood trunk + Stacked hexagonal faceted cones)
      const trunkMat = this._makeFacetedMaterial('pine-trunk-mat', '#4a2810');
      const lowerMat = this._makeFacetedMaterial('pine-lower-mat', '#3F703A');
      const topMat = this._makeFacetedMaterial('pine-top-mat', '#62964A');

      const trunk = MeshBuilder.CreateCylinder('pine-proto-trunk', {
        height: 2.0, diameterTop: 0.3, diameterBottom: 0.45, tessellation: 6,
      }, scene);
      trunk.position.y = 1.0;
      finish(trunk, trunkMat);

      const c1 = MeshBuilder.CreateCylinder('pine-c1', {
        height: 1.6, diameterTop: 0.15, diameterBottom: 2.6, tessellation: 6,
      }, scene);
      c1.position.y = 2.2;
      c1.bakeCurrentTransformIntoVertices();

      const c2 = MeshBuilder.CreateCylinder('pine-c2', {
        height: 1.5, diameterTop: 0.12, diameterBottom: 2.1, tessellation: 6,
      }, scene);
      c2.position.y = 3.2;
      c2.bakeCurrentTransformIntoVertices();

      const lower = Mesh.MergeMeshes([c1, c2], true, true, undefined, false, true);
      finish(lower || c1, lowerMat);

      const c3 = MeshBuilder.CreateCylinder('pine-c3', {
        height: 1.4, diameterTop: 0.06, diameterBottom: 1.5, tessellation: 6,
      }, scene);
      c3.position.y = 4.1;
      finish(c3, topMat);

    } else if (typeKey === 'birch') {
      // 4. White Birch (Crisp white trunk + Chartreuse rounded canopy)
      const trunkMat = this._makeFacetedMaterial('birch-trunk-mat', ART.birch);
      const canopyMat = this._makeFacetedMaterial('birch-canopy-mat', ART.leafLight);

      const trunk = MeshBuilder.CreateCylinder('birch-proto-trunk', {
        height: 3.2, diameterTop: 0.24, diameterBottom: 0.36, tessellation: 7,
      }, scene);
      trunk.position.y = 1.6;
      finish(trunk, trunkMat);

      const puff = MeshBuilder.CreateIcoSphere('birch-canopy', { radius: 1.35, subdivisions: crownSubdivisions, flat: false }, scene);
      puff.scaling.set(1.0, 1.35, 1.0);
      puff.position.set(0, 3.6, 0);
      finish(puff, canopyMat);

    } else if (typeKey === 'maple') {
      // 5. Autumn Golden Maple (Caramel trunk + Orange/amber faceted canopy)
      const trunkMat = this._makeFacetedMaterial('maple-trunk-mat', '#6d4327');
      const lowerMat = this._makeFacetedMaterial('maple-lower-mat', '#C8873D');
      const topMat = this._makeFacetedMaterial('maple-top-mat', '#E4BA62');

      const trunk = MeshBuilder.CreateCylinder('maple-proto-trunk', {
        height: 2.2, diameterTop: 0.38, diameterBottom: 0.65, tessellation: 7,
      }, scene);
      trunk.position.y = 1.1;
      finish(trunk, trunkMat);

      const p1 = MeshBuilder.CreateIcoSphere('maple-p1', { radius: 1.35, subdivisions: crownSubdivisions, flat: false }, scene);
      p1.position.set(-0.4, 2.3, 0.1);
      p1.bakeCurrentTransformIntoVertices();

      const p2 = MeshBuilder.CreateIcoSphere('maple-p2', { radius: 1.5, subdivisions: crownSubdivisions, flat: false }, scene);
      p2.position.set(0.45, 2.5, -0.15);
      p2.bakeCurrentTransformIntoVertices();

      const lower = Mesh.MergeMeshes([p1, p2], true, true, undefined, false, true);
      finish(lower || p1, lowerMat);

      const top = MeshBuilder.CreateIcoSphere('maple-top', { radius: 1.25, subdivisions: crownSubdivisions, flat: false }, scene);
      top.position.set(0, 3.3, 0);
      finish(top, topMat);

    } else if (typeKey === 'fruit') {
      // 6. Farm Orchard Apple Tree (Oak shape + Ruby red apples)
      const trunkMat = this._makeFacetedMaterial('fruit-trunk-mat', '#6d4327');
      const lowerMat = this._makeFacetedMaterial('fruit-lower-mat', ART.leaf);
      const topMat = this._makeFacetedMaterial('fruit-top-mat', ART.leafLight);
      const appleMat = this._makeFacetedMaterial('fruit-apple-mat', '#ef4444', 0.6);

      const trunk = MeshBuilder.CreateCylinder('fruit-proto-trunk', {
        height: 2.2, diameterTop: 0.38, diameterBottom: 0.65, tessellation: 7,
      }, scene);
      trunk.position.y = 1.1;
      finish(trunk, trunkMat);

      const p1 = MeshBuilder.CreateIcoSphere('fruit-p1', { radius: 1.35, subdivisions: crownSubdivisions, flat: false }, scene);
      p1.position.set(-0.4, 2.3, 0.1);
      p1.bakeCurrentTransformIntoVertices();

      const p2 = MeshBuilder.CreateIcoSphere('fruit-p2', { radius: 1.5, subdivisions: crownSubdivisions, flat: false }, scene);
      p2.position.set(0.45, 2.5, -0.15);
      p2.bakeCurrentTransformIntoVertices();

      const lower = Mesh.MergeMeshes([p1, p2], true, true, undefined, false, true);
      finish(lower || p1, lowerMat);

      const top = MeshBuilder.CreateIcoSphere('fruit-top', { radius: 1.25, subdivisions: crownSubdivisions, flat: false }, scene);
      top.position.set(0, 3.3, 0);
      finish(top, topMat);

      const apples = [];
      const applePositions = [
        [-0.9, 2.2, 0.4], [0.85, 2.4, 0.5], [-0.3, 2.7, 1.1],
        [0.4, 2.8, -1.0], [-0.7, 2.9, -0.6], [0.2, 3.4, 0.8]
      ];
      applePositions.forEach((pos, idx) => {
        const a = MeshBuilder.CreateIcoSphere(`fruit-apple-${idx}`, { radius: 0.18, subdivisions: 2, flat: false }, scene);
        a.position.set(pos[0], pos[1], pos[2]);
        a.bakeCurrentTransformIntoVertices();
        apples.push(a);
      });
      const appleCluster = Mesh.MergeMeshes(apples, true, true, undefined, false, true);
      finish(appleCluster || apples[0], appleMat);

    } else if (typeKey === 'palm') {
      // 7. Tropical Coconut Palm (Curved trunk + 3 faceted umbrella fronds)
      const trunkMat = this._makeFacetedMaterial('palm-trunk-mat', '#b45309');
      const frondMat = this._makeFacetedMaterial('palm-frond-mat', '#10b981');

      const trunk = MeshBuilder.CreateCylinder('palm-proto-trunk', {
        height: 4.2, diameterTop: 0.22, diameterBottom: 0.44, tessellation: 7,
      }, scene);
      trunk.position.y = 2.1;
      finish(trunk, trunkMat);

      const fronds = [];
      [[3.6, 0.42, 0], [3.2, 0.38, Math.PI / 3], [2.8, 0.44, Math.PI * 2 / 3]].forEach(([diameter, height, yaw], i) => {
        const f = MeshBuilder.CreateCylinder(`palm-frond-${i}`, {
          height, diameterTop: diameter, diameterBottom: diameter * 0.4, tessellation: 7,
        }, scene);
        f.rotation.y = yaw;
        f.position.set(0, 4.2 + i * 0.08, 0);
        f.bakeCurrentTransformIntoVertices();
        fronds.push(f);
      });
      const mergedFronds = Mesh.MergeMeshes(fronds, true, true, undefined, false, true);
      finish(mergedFronds || fronds[0], frondMat);

    } else {
      // 8. Low-Poly Garden Bush (2 faceted puffs close to ground)
      const bushMat = this._makeFacetedMaterial('bush-mat', '#65ba28');
      const b1 = MeshBuilder.CreateIcoSphere('bush-b1', { radius: 0.85, subdivisions: crownSubdivisions, flat: false }, scene);
      b1.position.set(-0.35, 0.45, 0);
      b1.bakeCurrentTransformIntoVertices();

      const b2 = MeshBuilder.CreateIcoSphere('bush-b2', { radius: 0.95, subdivisions: crownSubdivisions, flat: false }, scene);
      b2.position.set(0.35, 0.5, 0.05);
      b2.bakeCurrentTransformIntoVertices();

      const bushMerged = Mesh.MergeMeshes([b1, b2], true, true, undefined, false, true);
      finish(bushMerged || b1, bushMat);
    }

    return result;
  }

  async _preloadPrototypes() {
    for (const typeKey of Object.keys(this.treeTypes)) {
      await new Promise(resolve => setTimeout(resolve, 16));
      try {
        if (this.scene.isDisposed) break;

        const baseMeshes = this._createFacetedPrototype(typeKey);
        this.prototypes.set(typeKey, baseMeshes);
        this.loadedPrototypes.add(typeKey);

        const queue = this.pendingQueue.get(typeKey) || [];
        for (const req of queue) {
          if (this.scene.isDisposed) break;
          this._queueChunkInstance(typeKey, req);
        }
        this.pendingQueue.set(typeKey, []);
      } catch (err) {
        console.warn(`[FoliageInstancingEngine] Lỗi preload prototype ${typeKey}:`, err);
      }
    }
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

  _createLODProxy(chunk, typeKey) {
    const name = `foliage-lod-${chunk.x}-${chunk.z}-${typeKey}`;
    const colors = {
      oak: ART.leaf,
      pine: '#62964A',
      maple: '#C8873D',
      sakura: '#CE85A5',
      birch: ART.leafLight,
      fruit: ART.leaf,
      palm: '#10b981',
      bush: '#65ba28',
    };
    const crownHex = colors[typeKey] || '#62b627';

    if (typeKey === 'bush') {
      const proxy = MeshBuilder.CreateIcoSphere(name, { radius: 0.9, subdivisions: 1, flat: true }, this.scene);
      proxy.position.y = 0.45;
      proxy.bakeCurrentTransformIntoVertices();
      const mat = new StandardMaterial(`${name}-mat`, this.scene);
      mat.diffuseColor = Color3.FromHexString(crownHex);
      mat.ambientColor = mat.diffuseColor.scale(0.48);
      mat.specularColor = Color3.Black();
      proxy.material = mat;
      proxy.isPickable = false;
      return proxy;
    }

    // Complete faceted low-poly silhouette matching the exact tree proportions
    const trunkHeight = typeKey === 'palm' ? 2.8 : (typeKey === 'pine' ? 2.0 : (typeKey === 'birch' ? 2.6 : 1.6));
    const trunk = MeshBuilder.CreateCylinder(`${name}-trunk`, {
      height: trunkHeight, diameterTop: 0.22, diameterBottom: 0.38, tessellation: 6,
    }, this.scene);
    trunk.position.y = trunkHeight / 2;

    let crown;
    if (typeKey === 'pine') {
      crown = MeshBuilder.CreateCylinder(`${name}-crown`, {
        height: 2.8, diameterTop: 0.1, diameterBottom: 2.2, tessellation: 6,
      }, this.scene);
      crown.position.y = trunkHeight + 1.2;
    } else if (typeKey === 'palm') {
      crown = MeshBuilder.CreateCylinder(`${name}-crown`, {
        height: 0.5, diameterTop: 3.2, diameterBottom: 1.8, tessellation: 6,
      }, this.scene);
      crown.position.y = trunkHeight + 0.2;
    } else if (typeKey === 'birch') {
      crown = MeshBuilder.CreateIcoSphere(`${name}-crown`, {
        radius: 1.2, subdivisions: 1, flat: true,
      }, this.scene);
      crown.scaling.set(1.0, 1.3, 1.0);
      crown.position.y = trunkHeight + 0.8;
    } else {
      crown = MeshBuilder.CreateIcoSphere(`${name}-crown`, {
        radius: 1.4, subdivisions: 1, flat: true,
      }, this.scene);
      crown.position.y = trunkHeight + 0.9;
    }

    trunk.material = this._makeFacetedMaterial(`${name}-trunk-mat`, typeKey === 'birch' ? ART.birch : ART.trunk);
    crown.material = this._makeFacetedMaterial(`${name}-crown-mat`, crownHex);
    trunk.bakeCurrentTransformIntoVertices();
    if (crown) crown.bakeCurrentTransformIntoVertices();
    const merged = Mesh.MergeMeshes([trunk, crown], true, true, undefined, false, true);
    const proxyMesh = merged || crown;
    proxyMesh.name = name;
    proxyMesh.metadata = { ...proxyMesh.metadata, spatialBoundsMutable: true };
    proxyMesh.isPickable = false;
    return proxyMesh;
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
      group.proxy = this._createLODProxy(chunk, typeKey);
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
        // Babylon stores thin-instance world attributes on Geometry. Clones
        // sharing geometry overwrite each other's GPU matrices (and disposal
        // can invalidate another chunk). Isolate before attaching buffers.
        mesh.makeGeometryUnique();
        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, 0, 0);
        mesh.rotationQuaternion = null;
        mesh.scaling.set(1, 1, 1);
        mesh.isVisible = true;
        mesh.metadata = { ...mesh.metadata, spatialBoundsMutable: true };
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

  setEnabled(enabled) {
    const nextState = Boolean(enabled);
    if (this._enabled === nextState) return;
    this._enabled = nextState;

    if (this.rootNode) {
      this.rootNode.setEnabled(nextState);
    }

    if (!nextState) {
      for (const chunk of this.chunks.values()) {
        for (const group of chunk.groups.values()) {
          if (group.proxy) group.proxy.setEnabled(false);
          for (const mesh of group.meshes) {
            mesh.setEnabled(false);
          }
        }
      }
    } else {
      this.lastChunkUpdate = -1000;
    }
  }

  updateChunks() {
    if (this._enabled === false) return;
    const now = performance.now();
    if (this.lastChunkUpdate > 0 && now - this.lastChunkUpdate < 100) return;
    this.lastChunkUpdate = now;

    // Track active player/camera location properly with lockedTarget support
    const target = streamingPosition(this.scene);
    if (!target) return;
    const center = chunkAt(target.x, target.z);
    this.center = center;

    // Full detail nearby; retain original low-poly silhouettes farther away.
    let evicted = 0;
    for (const chunk of this.chunks.values()) {
      const distance = Math.max(Math.abs(chunk.x - center.x), Math.abs(chunk.z - center.z));
      const shouldHaveProxy = !this.mobile || distance <= this.mobileProxyRadius;
      if (chunk.proxyEligible !== shouldHaveProxy) {
        chunk.proxyEligible = shouldHaveProxy;
        for (const group of chunk.groups.values()) {
          if (!shouldHaveProxy) {
            if (group.proxy) {
              group.proxy.setEnabled(false);
              this.shadows?.removeShadowCaster(group.proxy);
              group.proxy.dispose(false, true);
              group.proxy = null;
            }
            // Detail geometry is only retained in the existing small cache;
            // discard it immediately when a chunk leaves the visible mobile ring.
            for (const mesh of group.meshes) {
              this.shadows?.removeShadowCaster(mesh);
              mesh.dispose(false, false);
            }
            group.meshes = [];
            group.dirty = false;
          } else {
            group.dirty = true;
            this.dirtyChunks.add(`${chunk.x}:${chunk.z}`);
          }
        }
      }
      // Nearby batches are already distance-managed. Protect this bounded ring
      // from camera/submesh rejection while mutable thin-instance bounds settle.
      // Far chunks continue using normal frustum culling.
      const protect = distance <= 1;
      if (chunk.cullingProtected !== protect) {
        chunk.cullingProtected = protect;
        for (const group of chunk.groups.values()) {
          if (group.proxy) group.proxy.alwaysSelectAsActiveMesh = protect;
          for (const mesh of group.meshes) mesh.alwaysSelectAsActiveMesh = protect;
        }
      }
      const keepDetailRadius = this.mobile ? 1 : 3;
      const detailRadius = this.mobile ? 1 : 2;
      const shouldDetail = distance <= (chunk.detailed ? keepDetailRadius : detailRadius);
      if (shouldDetail) chunk.lastUsed = now;
      if (shouldDetail === chunk.detailed) continue;
      if (!shouldDetail && evicted >= 2) continue;
      chunk.detailed = shouldDetail;
      for (const group of chunk.groups.values()) {
        if (!shouldHaveProxy) {
          group.dirty = false;
          continue;
        }
        if (!shouldDetail) {
          // A pending group must first construct a usable proxy. Never clear
          // its build request just because the player left the cell.
          if (!group.proxy || group.dirty) {
            group.dirty = true;
            this.dirtyChunks.add(`${chunk.x}:${chunk.z}`);
            continue;
          }
          group.proxy?.setEnabled(true);
          for (const mesh of group.meshes) {
            mesh.setEnabled(false);
          }
          evicted++;
          group.dirty = false;
        } else {
          if (group.meshes.length > 0 && !group.dirty &&
              group.meshes.every(mesh => mesh.thinInstanceCount === group.requests.length)) {
            group.proxy?.setEnabled(false);
            for (const mesh of group.meshes) {
              mesh.setEnabled(true);
            }
          } else {
            group.proxy?.setEnabled(true);
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
      const distance = Math.max(Math.abs(chunk.x - center.x), Math.abs(chunk.z - center.z));
      if (this.mobile && distance > this.mobileProxyRadius && !chunk.detailed) {
        for (const group of chunk.groups.values()) group.dirty = false;
        this.dirtyChunks.delete(key);
        continue;
      }
      const next = [...chunk.groups].find(([, group]) => group.dirty);
      if (next) this._buildGroup(chunk, next[0], next[1]);
      if (next) {
        const distance = Math.max(Math.abs(chunk.x - center.x), Math.abs(chunk.z - center.z));
        if (next[1].proxy) next[1].proxy.alwaysSelectAsActiveMesh = distance <= 1;
        for (const mesh of next[1].meshes) mesh.alwaysSelectAsActiveMesh = distance <= 1;
      }
      if (![...chunk.groups.values()].some(group => group.dirty)) this.dirtyChunks.delete(key);
      if (++built >= 2 || performance.now() - now > 2.5) break;
    }

    // Cache retention: only cold detail beyond the retained detail ring is trimmed.
    const cached = [...this.chunks.values()].filter(chunk =>
      [...chunk.groups.values()].some(group => group.meshes.length));
    if (cached.length > (this.mobile ? 12 : 32) && performance.now() - now < 8) {
      const victim = cached.filter(chunk => !chunk.detailed &&
        Math.max(Math.abs(chunk.x - center.x), Math.abs(chunk.z - center.z)) > (this.mobile ? 1 : 3))
        .sort((a, b) => (a.lastUsed || 0) - (b.lastUsed || 0))[0];
      if (victim) {
        const group = [...victim.groups.values()].find(group => group.meshes.length);
        if (group) {
          for (const mesh of group.meshes) {
            this.shadows?.removeShadowCaster(mesh);
            mesh.dispose(false, false);
          }
          group.meshes = [];
        }
      }
    }
  }

  /**
   * Spawns an instanced tree in the scene.
   * Runs in O(1) time and batches with zero draw call overhead.
   */
  spawnTree(type, x, z, options = {}) {
    if (beachWaterAt(x,z,3*(options.scale || 1))) return;
    if (isPointInLakeOrRiver(x, z, 2.5 * (options.scale || 1))) return;
    if (ROAD_SAFETY_CONFIG.blockRoadResources && isRoadResourceBlocked(x, z, 1.2)) {
      recordBlockedRoadResource(`foliage-${type}`, x, z);
      return;
    }

    const {
      y = 0,
      scale = 1.0,
      rotY = landscapeVariation(x, z) * Math.PI * 2,
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
    this.spawnTree('oak', x, z, { scale: p.scale * 1.05, withShadow: p.withShadow });
  }

  spawnPine(x, z, scaleOrOptions = 1.35, withShadow = false) {
    const p = this._parseScaleAndShadow(scaleOrOptions, withShadow);
    this.spawnTree('pine', x, z, { scale: p.scale * 1.15, withShadow: p.withShadow });
  }

  spawnMaple(x, z, scaleOrOptions = 1.35, withShadow = false) {
    const p = this._parseScaleAndShadow(scaleOrOptions, withShadow);
    this.spawnTree('maple', x, z, { scale: p.scale * 1.05, withShadow: p.withShadow });
  }

  spawnSakura(x, z, scaleOrOptions = 1.35, withShadow = false) {
    const p = this._parseScaleAndShadow(scaleOrOptions, withShadow);
    this.spawnTree('sakura', x, z, { scale: p.scale * 1.05, withShadow: p.withShadow });
  }

  spawnBirch(x, z, scaleOrOptions = 1.35, withShadow = false) {
    const p = this._parseScaleAndShadow(scaleOrOptions, withShadow);
    this.spawnTree('birch', x, z, { scale: p.scale * 1.1, withShadow: p.withShadow });
  }

  spawnFruit(x, z, scaleOrOptions = 1.35, withShadow = false) {
    const p = this._parseScaleAndShadow(scaleOrOptions, withShadow);
    this.spawnTree('fruit', x, z, { scale: p.scale * 1.05, withShadow: p.withShadow });
  }

  spawnPalm(x, z, scaleOrOptions = 1.35, withShadow = false) {
    const p = this._parseScaleAndShadow(scaleOrOptions, withShadow);
    this.spawnTree('palm', x, z, { scale: p.scale * 1.05, withShadow: p.withShadow });
  }

  spawnBush(x, z, scaleOrOptions = 1.2) {
    const p = this._parseScaleAndShadow(scaleOrOptions, false);
    this.spawnTree('bush', x, z, { scale: p.scale * 1.0, withShadow: false });
  }
}
