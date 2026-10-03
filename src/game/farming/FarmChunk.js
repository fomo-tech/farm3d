/**
 * FarmChunk.js
 * High-Performance 3-Tier Farm Chunk Architecture (Zero-Dispose LOD).
 * 
 * Replaces the destructive dispose() -> recreate() pattern with fast setEnabled toggling:
 * - Tier 1: hlodRoot (5-7 low-poly meshes for distance > 90m)
 * - Tier 2: detailRoot (stone paths, white fences, apple tree, planters, decors)
 * - Tier 3: interactiveRoot (12 soil cultivation tiles & crops)
 * - Tier 4: buildingRoot (farmhouse, corral, farm gate)
 * 
 * When player moves:
 * - Near (< 90m): hlodRoot.setEnabled(false), detailRoot.setEnabled(true) (0.01ms, 0 GC)
 * - Far (> 110m): detailRoot.setEnabled(false), hlodRoot.setEnabled(true) (0.01ms, 0 GC)
 */

import { Vector3, Matrix, Quaternion } from '@babylonjs/core/Maths/math.vector.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import '@babylonjs/core/Meshes/thinInstanceMesh.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { FARM_CONFIG } from '../config.js';
import { createSoilTexture, createMeadowTexture } from '../world/createStylizedTextures.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial } from '../rendering/PlayTogetherTheme.js';

export class FarmChunk {
  constructor(scene, farm, shadows = null, options = {}) {
    this.scene = scene;
    this.farm = farm;
    this.farmId = farm.id;
    this.shadows = shadows;
    this.isOwner = Boolean(options.isOwner);
    this.ownerName = options.ownerName || farm.owner;
    this.lotNumber = farm.lotNumber || 1;

    // Root Node for the entire farm lot
    this.root = new TransformNode(`farm-estate-${this.farmId}`, scene);
    this.root.position.set(farm.x, 0, farm.z);
    this.root.metadata = {
      farmId: this.farmId,
      lotNumber: this.lotNumber,
      owner: this.ownerName,
      lightweight: true,
      detailed: false,
      farmLayoutVersion: FARM_CONFIG.layoutVersion,
      footprint: { width: FARM_CONFIG.estateWidth, depth: FARM_CONFIG.estateDepth },
    };

    // Tiers
    this.hlodRoot = new TransformNode(`farm-hlod-${this.farmId}`, scene);
    this.hlodRoot.parent = this.root;

    this.detailRoot = new TransformNode(`farm-detail-${this.farmId}`, scene);
    this.detailRoot.parent = this.root;
    this.detailRoot.setEnabled(false);

    this.interactiveRoot = new TransformNode(`farm-interactive-${this.farmId}`, scene);
    this.interactiveRoot.parent = this.root;
    this.interactiveRoot.setEnabled(false);

    this.buildingRoot = new TransformNode(`farm-buildings-${this.farmId}`, scene);
    this.buildingRoot.parent = this.root;
    this.buildingRoot.setEnabled(false);

    this.tiles = [];
    this.detailReady = false;
    this.buildingInProgress = false;
    this.state = 'hlod'; // 'hlod' | 'detail' | 'hidden'
    this.wantsDetail = false;
    this.lastUsed = performance.now();
    this.gate = null;
    this.home = null;
    this.barn = null;

    // Shared materials cached on scene
    this.materials = this._initMaterials();

    // Build lightweight HLOD immediately (< 0.1ms)
    this._buildHLOD();
  }

  _initMaterials() {
    const scene = this.scene;
    const isOwner = this.isOwner;

    let soilMat = scene.getMaterialByName('mat-soil-base-rich');
    if (!soilMat) {
      soilMat = new StandardMaterial('mat-soil-base-rich', scene);
      soilMat.diffuseTexture = createSoilTexture(scene, 512, false);
      soilMat.ambientColor = new Color3(0.5, 0.5, 0.5);
      soilMat.specularColor = new Color3(0.08, 0.08, 0.08);
    }

    let grassMat = scene.getMaterialByName('mat-estate-meadow-grass');
    if (!grassMat) {
      grassMat = new StandardMaterial('mat-estate-meadow-grass', scene);
      const tex = createMeadowTexture(scene, 1024);
      tex.anisotropicFilteringLevel = 16;
      const estateW = FARM_CONFIG.estateWidth || 28;
      const estateD = FARM_CONFIG.estateDepth || 28;
      tex.uScale = Number((estateW / 12).toFixed(2));
      tex.vScale = Number((estateD / 12).toFixed(2));
      grassMat.diffuseTexture = tex;
      grassMat.ambientColor = new Color3(0.55, 0.55, 0.55);
      grassMat.specularColor = new Color3(0.04, 0.04, 0.04);
    }

    const borderMat = createToyMaterial(scene, isOwner ? 'mat-toy-border-owner' : 'mat-toy-border-neighbor', isOwner ? PLAY_TOGETHER_PALETTE.farm.honeyWood : '#c5a07a', {
      specularPower: 64,
      specularLevel: 0.35,
      ambientScale: 0.52,
    });

    const stonePathMat = createToyMaterial(scene, 'mat-toy-flagstone-road', '#ded3c2', {
      specularPower: 26,
      specularLevel: 0.12,
      ambientScale: 0.65,
    });

    const fenceMat = createToyMaterial(scene, isOwner ? 'mat-toy-fence-owner' : 'mat-toy-fence-neighbor', isOwner ? PLAY_TOGETHER_PALETTE.farm.fenceWhite : '#f1f5f9', {
      specularPower: 80,
      specularLevel: 0.45,
      ambientScale: 0.58,
    });

    const lanternMat = createToyMaterial(scene, 'mat-toy-lantern-glow', '#fef08a', {
      emissiveHex: '#fde047',
      specularPower: 32,
    });

    const planterMat = createToyMaterial(scene, 'mat-toy-planter', '#b7794f', {
      specularPower: 24,
      ambientScale: 0.58,
    });

    const flowerMat = createToyMaterial(scene, 'mat-toy-planter-flower', isOwner ? '#f472b6' : '#a78bfa', {
      emissiveHex: isOwner ? '#fb7185' : '#8b5cf6',
      specularPower: 28,
    });

    const leafBright = createToyMaterial(scene, 'mat-tree-leaf-bright', '#79aa63', { ambientScale: 0.4 });
    const leafMid = createToyMaterial(scene, 'mat-tree-leaf-mid', '#52864e', { ambientScale: 0.4 });
    const appleRed = createToyMaterial(scene, 'mat-tree-apple-red', '#ef4444', { emissiveHex: '#dc2626', specularPower: 96 });

    return { soilMat, grassMat, borderMat, stonePathMat, fenceMat, lanternMat, planterMat, flowerMat, leafBright, leafMid, appleRed };
  }

  _buildHLOD() {
    const scene = this.scene;
    const estateWidth = FARM_CONFIG.estateWidth;
    const estateDepth = FARM_CONFIG.estateDepth;
    const halfW = estateWidth / 2;
    const halfD = estateDepth / 2;

    // 1. Nền cỏ xanh mượt mà
    const basePlate = MeshBuilder.CreateBox(`hlod-base-${this.farmId}`, {
      width: estateWidth,
      depth: estateDepth,
      height: 0.12,
    }, scene);
    basePlate.position.set(0, 0.05, 0);
    basePlate.material = this.materials.grassMat;
    basePlate.receiveShadows = false;
    basePlate.isPickable = false;
    basePlate.parent = this.hlodRoot;

    // 2. Viền phân ranh giới thửa đất (shared 1 draw call qua thin instances)
    const curb = MeshBuilder.CreateBox(`hlod-curbs-${this.farmId}`, { size: 1 }, scene);
    curb.material = this.materials.borderMat;
    curb.parent = this.hlodRoot;
    curb.isPickable = false;
    const curbParts = [
      [halfW - 2.4, 0.14, 0.16, -halfW / 2 - 1.2, 0.08, -halfD],
      [halfW - 2.4, 0.14, 0.16, halfW / 2 + 1.2, 0.08, -halfD],
      [estateWidth, 0.14, 0.16, 0, 0.08, halfD],
      [0.16, 0.14, estateDepth, -halfW, 0.08, 0],
      [0.16, 0.14, estateDepth, halfW, 0.08, 0],
    ];
    const curbMatrices = new Float32Array(curbParts.length * 16);
    curbParts.forEach(([w, h, d, x, y, z], i) => curbMatrices.set(
      Matrix.Compose(new Vector3(w, h, d), Quaternion.Identity(), new Vector3(x, y, z)).m, i * 16,
    ));
    curb.thinInstanceSetBuffer('matrix', curbMatrices, 16, true);

    // 3. Ram dốc trước cổng
    const apron = MeshBuilder.CreateBox(`hlod-apron-${this.farmId}`, { width: 4.4, height: 0.08, depth: 3.2 }, scene);
    apron.position.set(0, 0.075, -halfD + 1.5);
    apron.material = this.materials.stonePathMat;
    apron.isPickable = false;
    apron.parent = this.hlodRoot;

    // 4. Khối tượng trưng nhà và ruộng
    const field = MeshBuilder.CreateBox(`hlod-field-${this.farmId}`, { width: 7.2, height: 0.08, depth: 4.8 }, scene);
    field.position.set(0, 0.13, -1.5);
    field.material = this.materials.soilMat;
    field.isPickable = false;
    field.parent = this.hlodRoot;

    const cabin = MeshBuilder.CreateBox(`hlod-cabin-${this.farmId}`, { width: 3.1, height: 2.1, depth: 2.7 }, scene);
    cabin.position.set(-5.2, 1.1, 3.8);
    cabin.material = createToyMaterial(scene, 'hlod-house-cream', '#dccdb4', { specularLevel: 0.04 });
    cabin.isPickable = false;
    cabin.parent = this.hlodRoot;
    // A tiny gabled silhouette rather than a white debug cube, even before
    // detail is ready. One 8-triangle mesh, shared roof material, no texture.
    const roof = new Mesh(`hlod-roof-${this.farmId}`, scene);
    const data = new VertexData();
    data.positions = [-1.8,0,-1.6, 1.8,0,-1.6, 0,0.9,-1.6,
      -1.8,0,1.6, 1.8,0,1.6, 0,0.9,1.6];
    // Babylon's default left-handed front faces use clockwise winding.
    data.indices = [0,1,2, 3,5,4, 0,5,3, 0,2,5, 1,5,2, 1,4,5, 0,4,1, 0,3,4];
    data.normals = [];
    VertexData.ComputeNormals(data.positions, data.indices, data.normals);
    data.applyToMesh(roof);
    roof.position.set(-5.2, 2.15, 3.8);
    roof.material = createToyMaterial(scene, 'hlod-roof-terracotta', '#bd8063', { specularLevel: 0.03 });
    roof.isPickable = false;
    roof.parent = this.hlodRoot;
  }

  *buildDetailIncrementalGenerator(onComplete) {
    const scene = this.scene;
    const estateWidth = FARM_CONFIG.estateWidth;
    const estateDepth = FARM_CONFIG.estateDepth;
    const halfW = estateWidth / 2;
    const halfD = estateDepth / 2;

    // STEP 1: Ground Plate & Paths
    const basePlate = MeshBuilder.CreateBox(`detail-base-${this.farmId}`, {
      width: estateWidth, depth: estateDepth, height: 0.12,
    }, scene);
    basePlate.position.set(0, 0.05, 0);
    basePlate.material = this.materials.grassMat;
    basePlate.receiveShadows = true;
    basePlate.parent = this.detailRoot;

    const entryPath = MeshBuilder.CreateBox(`detail-entry-${this.farmId}`, { width: 4.6, depth: 3.8, height: 0.08 }, scene);
    entryPath.position.set(0, 0.11, -7.8);
    entryPath.material = this.materials.stonePathMat;
    entryPath.receiveShadows = true;
    entryPath.parent = this.detailRoot;

    const drivewayApron = MeshBuilder.CreateBox(`detail-driveway-${this.farmId}`, { width: 3.8, depth: 3.2, height: 0.07 }, scene);
    drivewayApron.position.set(0, 0.075, -11.2);
    drivewayApron.material = this.materials.stonePathMat;
    drivewayApron.receiveShadows = true;
    drivewayApron.parent = this.detailRoot;

    const midWalkway = MeshBuilder.CreateBox(`detail-midwalk-${this.farmId}`, { width: 14.8, depth: 1.8, height: 0.08 }, scene);
    midWalkway.position.set(0, 0.11, 0.8);
    midWalkway.material = this.materials.stonePathMat;
    midWalkway.receiveShadows = true;
    midWalkway.parent = this.detailRoot;

    const homePath = MeshBuilder.CreateBox(`detail-homepath-${this.farmId}`, { width: 2.4, depth: 2.4, height: 0.08 }, scene);
    homePath.position.set(-4.8, 0.11, 2.0);
    homePath.material = this.materials.stonePathMat;
    homePath.parent = this.detailRoot;

    const corralPath = MeshBuilder.CreateBox(`detail-corralpath-${this.farmId}`, { width: 2.4, depth: 2.4, height: 0.08 }, scene);
    corralPath.position.set(4.8, 0.11, 2.0);
    corralPath.material = this.materials.stonePathMat;
    corralPath.parent = this.detailRoot;

    yield; // Yield to next frame (~1.2ms spent)

    // STEP 2: Stepping Stones, Planters with Flowers, Perimeter Borders
    [-9.2, -8.0, -6.8].forEach((z, index) => {
      const stone = MeshBuilder.CreateBox(`detail-step-${this.farmId}-${index}`, { width: 1.6, depth: 0.72, height: 0.1 }, scene);
      stone.position.set(0, 0.17, z);
      stone.rotation.y = index % 2 ? 0.06 : -0.06;
      stone.material = this.materials.stonePathMat;
      stone.parent = this.detailRoot;
    });

    [-7.2, 7.2].forEach((x, index) => {
      const planter = MeshBuilder.CreateCylinder(`detail-planter-${this.farmId}-${index}`, {
        diameter: 1.55, height: 0.24, tessellation: 12,
      }, scene);
      planter.position.set(x, 0.22, -7.2);
      planter.material = this.materials.planterMat;
      planter.parent = this.detailRoot;

      const flower = MeshBuilder.CreateSphere(`detail-planter-flower-${this.farmId}-${index}`, {
        diameter: 0.76, segments: 10,
      }, scene);
      flower.scaling.y = 0.72;
      flower.position.set(x, 0.75, -7.2);
      flower.material = this.materials.flowerMat;
      flower.parent = this.detailRoot;
    });

    const borderGirth = 0.24;
    const borderHeight = 0.18;
    const borderY = borderHeight / 2 + 0.03;
    [
      { name: 'back', width: estateWidth + borderGirth, depth: borderGirth, x: 0, z: halfD },
      { name: 'front', width: estateWidth + borderGirth, depth: borderGirth, x: 0, z: -halfD },
      { name: 'left', width: borderGirth, depth: estateDepth, x: -halfW, z: 0 },
      { name: 'right', width: borderGirth, depth: estateDepth, x: halfW, z: 0 },
    ].forEach(edge => {
      const borderRim = MeshBuilder.CreateBox(`detail-rim-${this.farmId}-${edge.name}`, {
        width: edge.width, depth: edge.depth, height: borderHeight,
      }, scene);
      borderRim.position.set(edge.x, borderY, edge.z);
      borderRim.material = this.materials.borderMat;
      borderRim.parent = this.detailRoot;
    });

    yield; // Yield to next frame (~1.5ms spent)

    // STEP 3: Apple Tree & 4 Corner Lantern Posts
    const treeRoot = new TransformNode(`detail-tree-${this.farmId}`, scene);
    treeRoot.position.set(-7.2, 0, -3.0);
    treeRoot.parent = this.detailRoot;
    const trunk = MeshBuilder.CreateCylinder(`detail-trunk-${this.farmId}`, { height: 2.8, diameterTop: 0.35, diameterBottom: 0.55, tessellation: 10 }, scene);
    trunk.position.set(0, 1.4, 0);
    trunk.material = this.materials.borderMat;
    trunk.parent = treeRoot;
    this.shadows?.addShadowCaster(trunk);

    [
      { x: 0, y: 3.2, z: 0, s: 2.2, mat: this.materials.leafBright },
      { x: -0.6, y: 2.7, z: 0.4, s: 1.6, mat: this.materials.leafMid },
      { x: 0.7, y: 2.8, z: -0.3, s: 1.7, mat: this.materials.leafMid },
      { x: 0.2, y: 3.7, z: 0.2, s: 1.5, mat: this.materials.leafBright },
    ].forEach((clump, idx) => {
      const leaf = MeshBuilder.CreateSphere(`detail-leaf-${this.farmId}-${idx}`, { diameter: clump.s, segments: 8 }, scene);
      leaf.position.set(clump.x, clump.y, clump.z);
      leaf.material = clump.mat;
      leaf.parent = treeRoot;
      this.shadows?.addShadowCaster(leaf);
    });

    [
      { x: -0.6, y: 2.3, z: 0.8 },
      { x: 0.5, y: 2.4, z: 0.7 },
      { x: -0.8, y: 2.8, z: -0.3 },
      { x: 0.8, y: 2.6, z: -0.5 },
      { x: 0.1, y: 2.2, z: -0.9 },
    ].forEach((apple, idx) => {
      const ap = MeshBuilder.CreateSphere(`detail-apple-${this.farmId}-${idx}`, { diameter: 0.24, segments: 8 }, scene);
      ap.position.set(apple.x, apple.y, apple.z);
      ap.material = this.materials.appleRed;
      ap.parent = treeRoot;
    });

    // 4 Corner Lantern Posts
    [
      [-halfW, -halfD],
      [halfW, -halfD],
      [-halfW, halfD],
      [halfW, halfD],
    ].forEach(([cx, cz], i) => {
      const post = MeshBuilder.CreateCylinder(`detail-post-${this.farmId}-${i}`, { height: 1.15, diameter: 0.32, tessellation: 10 }, scene);
      post.position.set(cx, 0.58, cz);
      post.material = this.materials.borderMat;
      post.parent = this.detailRoot;

      const finial = MeshBuilder.CreateSphere(`detail-finial-${this.farmId}-${i}`, { diameter: 0.38, segments: 8 }, scene);
      finial.position.set(cx, 1.25, cz);
      finial.material = this.materials.borderMat;
      finial.parent = this.detailRoot;

      const lantern = MeshBuilder.CreateSphere(`detail-lantern-${this.farmId}-${i}`, { diameter: 0.3, segments: 8 }, scene);
      lantern.position.set(cx, 1.55, cz);
      lantern.material = this.materials.lanternMat;
      lantern.parent = this.detailRoot;
    });

    yield; // Yield to next frame (~1.6ms spent)

    // STEP 4: Perimeter Fences with Thin-Instance Pickets
    const fenceHeight = 0.92;
    const railRadius = 0.075;
    const picketMatrices = [];
    const capMatrices = [];

    const createRoundRail = (name, length, pos, isZ = false) => {
      const rail = MeshBuilder.CreateCylinder(`detail-${name}-${this.farmId}`, { height: length, diameter: railRadius * 2, tessellation: 8 }, scene);
      rail.position.copyFrom(pos);
      if (isZ) rail.rotation.x = Math.PI / 2;
      else rail.rotation.z = Math.PI / 2;
      rail.material = this.materials.fenceMat;
      rail.parent = this.detailRoot;
      return rail;
    };

    const createPickets = (startPos, endPos, count) => {
      for (let i = 0; i <= count; i++) {
        const frac = count === 0 ? 0.5 : i / count;
        const px = startPos.x + (endPos.x - startPos.x) * frac;
        const pz = startPos.z + (endPos.z - startPos.z) * frac;
        picketMatrices.push(Matrix.Translation(px, fenceHeight / 2 + 0.08, pz));
        capMatrices.push(Matrix.Translation(px, fenceHeight + 0.08, pz));
      }
    };

    // Back Fence
    createRoundRail('fence-back-top', estateWidth, new Vector3(0, fenceHeight * 0.8 + 0.08, halfD));
    createRoundRail('fence-back-bot', estateWidth, new Vector3(0, fenceHeight * 0.35 + 0.08, halfD));
    createPickets(new Vector3(-halfW + 0.4, 0, halfD), new Vector3(halfW - 0.4, 0, halfD), 18);

    // Left Fence
    createRoundRail('fence-left-top', estateDepth, new Vector3(-halfW, fenceHeight * 0.8 + 0.08, 0), true);
    createRoundRail('fence-left-bot', estateDepth, new Vector3(-halfW, fenceHeight * 0.35 + 0.08, 0), true);
    createPickets(new Vector3(-halfW, 0, -halfD + 0.4), new Vector3(-halfW, 0, halfD - 0.4), 16);

    // Right Fence
    createRoundRail('fence-right-top', estateDepth, new Vector3(halfW, fenceHeight * 0.8 + 0.08, 0), true);
    createRoundRail('fence-right-bot', estateDepth, new Vector3(halfW, fenceHeight * 0.35 + 0.08, 0), true);
    createPickets(new Vector3(halfW, 0, -halfD + 0.4), new Vector3(halfW, 0, halfD - 0.4), 16);

    // Front Fence with Gate Opening
    const frontWing = (estateWidth - 5.5) / 2;
    if (frontWing > 0.5) {
      createRoundRail('fence-front-l-top', frontWing, new Vector3(-halfW + frontWing / 2, fenceHeight * 0.8 + 0.08, -halfD));
      createRoundRail('fence-front-l-bot', frontWing, new Vector3(-halfW + frontWing / 2, fenceHeight * 0.35 + 0.08, -halfD));
      createPickets(new Vector3(-halfW + 0.4, 0, -halfD), new Vector3(-halfW + frontWing - 0.2, 0, -halfD), 3);

      createRoundRail('fence-front-r-top', frontWing, new Vector3(halfW - frontWing / 2, fenceHeight * 0.8 + 0.08, -halfD));
      createRoundRail('fence-front-r-bot', frontWing, new Vector3(halfW - frontWing / 2, fenceHeight * 0.35 + 0.08, -halfD));
      createPickets(new Vector3(halfW - frontWing + 0.2, 0, -halfD), new Vector3(halfW - 0.4, 0, -halfD), 3);
    }

    if (picketMatrices.length > 0) {
      const picketPost = MeshBuilder.CreateCylinder(`detail-pickets-${this.farmId}`, { height: fenceHeight, diameter: 0.14, tessellation: 8 }, scene);
      picketPost.material = this.materials.fenceMat;
      picketPost.parent = this.detailRoot;
      const picketData = new Float32Array(picketMatrices.length * 16);
      picketMatrices.forEach((m, idx) => picketData.set(m.m, idx * 16));
      picketPost.thinInstanceSetBuffer('matrix', picketData, 16, true);

      const cap = MeshBuilder.CreateSphere(`detail-caps-${this.farmId}`, { diameter: 0.18, segments: 6 }, scene);
      cap.material = this.materials.fenceMat;
      cap.parent = this.detailRoot;
      const capData = new Float32Array(capMatrices.length * 16);
      capMatrices.forEach((m, idx) => capData.set(m.m, idx * 16));
      cap.thinInstanceSetBuffer('matrix', capData, 16, true);
    }

    yield; // Yield to next frame (~1.4ms spent)

    // STEP 5: 12 Cultivation Soil Beds (Interactive Tier)
    const colSpacing = FARM_CONFIG.tileSpacingX || 2.1;
    const rowSpacing = FARM_CONFIG.tileSpacingZ || 1.8;
    const totalW = (FARM_CONFIG.plotColumns - 1) * colSpacing;
    const totalD = (FARM_CONFIG.plotRows - 1) * rowSpacing;
    const cropsX = FARM_CONFIG.anchors?.crops?.x ?? 0.0;
    const cropsZ = FARM_CONFIG.anchors?.crops?.z ?? -3.0;

    // Viền bao quanh khu đất trồng
    const bedWidth = totalW + colSpacing;
    const bedDepth = totalD + rowSpacing;
    [
      { width: bedWidth + 0.24, depth: 0.12, x: cropsX, z: cropsZ - bedDepth / 2 - 0.06 },
      { width: bedWidth + 0.24, depth: 0.12, x: cropsX, z: cropsZ + bedDepth / 2 + 0.06 },
      { width: 0.12, depth: bedDepth, x: cropsX - bedWidth / 2 - 0.06, z: cropsZ },
      { width: 0.12, depth: bedDepth, x: cropsX + bedWidth / 2 + 0.06, z: cropsZ },
    ].forEach((edge, index) => {
      const rim = MeshBuilder.CreateBox(`detail-crop-rim-${this.farmId}-${index}`, { width: edge.width, depth: edge.depth, height: 0.12 }, scene);
      rim.position.set(edge.x, 0.13, edge.z);
      rim.material = this.materials.borderMat;
      rim.parent = this.detailRoot;
    });

    this.tiles = [];
    for (let row = 0; row < FARM_CONFIG.plotRows; row += 1) {
      for (let column = 0; column < FARM_CONFIG.plotColumns; column += 1) {
        const plotIndex = row * FARM_CONFIG.plotColumns + column;
        const posX = cropsX + (column * colSpacing - totalW / 2);
        const posZ = cropsZ + (row * rowSpacing - totalD / 2);

        const tile = MeshBuilder.CreateBox(`soil-${this.farmId}-${column}-${row}`, {
          width: colSpacing - 0.22,
          depth: rowSpacing - 0.22,
          height: 0.14,
        }, scene);
        tile.position.set(posX, 0.08, posZ);
        tile.material = this.materials.soilMat;
        tile.receiveShadows = true;
        tile.parent = this.interactiveRoot;

        tile.metadata = {
          type: 'farm-tile',
          tile: true,
          column,
          row,
          index: plotIndex,
          plotIndex,
          state: 'empty',
          farmId: this.farmId,
          interactive: true,
        };
        this.tiles.push(tile);
      }
    }

    this.detailReady = true;
    this.buildingInProgress = false;
    this.root.metadata.detailed = true;
    this.root.metadata.lightweight = false;
    onComplete?.(this.tiles);
  }

  buildDetailSynchronous(onComplete) {
    if (this.detailReady) {
      onComplete?.(this.tiles);
      return;
    }
    const generator = this.buildDetailIncrementalGenerator(onComplete);
    let step = generator.next();
    while (!step.done) {
      step = generator.next();
    }
  }

  showDetail(scheduler = null, onReady = null) {
    if (this.evicting) return;
    this.wantsDetail = true;
    this.lastUsed = performance.now();
    if (this.state === 'detail') {
      return;
    }

    if (this.detailReady) {
      this.hlodRoot.setEnabled(false);
      this.interactiveRoot.setEnabled(true);
      this.buildingRoot.setEnabled(true);
      this.detailRoot.setEnabled(true);
      this.state = 'detail';
      this.root.metadata.detailed = true;
      this.root.metadata.lightweight = false;
      onReady?.(this.tiles);
      return;
    }

    if (!this.buildingInProgress) {
      this.buildingInProgress = true;
      const generator = this.buildDetailIncrementalGenerator((tiles) => {
        onReady?.(tiles);
        if (this.wantsDetail) {
          this.hlodRoot.setEnabled(false);
          this.detailRoot.setEnabled(true);
          this.interactiveRoot.setEnabled(true);
          this.buildingRoot.setEnabled(true);
          this.state = 'detail';
        } else {
          this.showHLOD();
        }
      });

      if (scheduler) {
        scheduler.enqueue(generator, 10, `farm-build-${this.farmId}`);
      } else {
        let res = generator.next();
        while (!res.done) res = generator.next();
      }
    }
  }

  showHLOD() {
    this.wantsDetail = false;
    this.detailRoot.setEnabled(false);
    this.interactiveRoot.setEnabled(false);
    this.buildingRoot.setEnabled(false);
    this.hlodRoot.setEnabled(true);
    this.state = 'hlod';
    this.root.metadata.detailed = false;
    this.root.metadata.lightweight = true;
  }

  setBuildings(home, barn) {
    this.home = home;
    this.barn = barn;
    if (home?.root) home.root.setParent(this.buildingRoot);
    if (barn?.root) barn.root.setParent(this.buildingRoot);
  }

  setGate(gate) {
    this.gate = gate;
    if (gate?.root) gate.root.setParent(this.buildingRoot);
  }

  *evictDetail() {
    this.evicting = true;
    this.showHLOD();
    // Keep the inexpensive HLOD and shared materials. Dispose individual
    // detailed meshes across scheduler steps, preserving original asset files.
    for (const root of [this.detailRoot, this.interactiveRoot]) {
      for (const mesh of root.getChildMeshes()) {
        this.shadows?.removeShadowCaster(mesh);
        if (!mesh.isDisposed()) mesh.dispose(false, false);
        yield;
      }
      for (const node of root.getChildTransformNodes(true)) node.dispose();
    }
    this.tiles = [];
    this.detailReady = false;
    this.buildingInProgress = false;
    this.evicting = false;
  }

  dispose() {
    this.root.dispose();
  }
}
