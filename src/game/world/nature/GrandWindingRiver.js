/**
 * GrandWindingRiver.js
 * The Grand Animated Winding River & Highway Bridge Infrastructure.
 * 
 * Creates a continuous, beautiful, animated winding river across the entire 3D world:
 * - Starts at the North Mountain Waterfall (z = -580)
 * - Traverses the highlands, merges with Crystal Lake (z = 0)
 * - Meanders along Làng Ven Sông, flows south to the Ocean (z = 540)
 * - 100% of road crossings have solid Highway Arch Bridges (Bridge 1, 2, 4) or Footbridge (Bridge 3)
 * - 100% CLEAR of all 288 player farm lots (buffer >= 14m to 150m)
 * - Impassable river colliders registered with WorldCollisionSystem to prevent vehicles/players
 *   from driving or walking into the water without a bridge.
 */

import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3, Vector2 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { MODEL_PATHS, spawnModelSync } from '../../rendering/ModelAssetManager.js';
import { WORLD_PALETTE } from '../worldDesignSystem.js';

/**
 * 18 Control Points defining the gentle winding trajectory of the river from North to South.
 * Strictly avoids all 288 farm parcels, town centres, and village residential spines.
 */
export const RIVER_CONTROL_POINTS = Object.freeze([
  { x: 220, z: -580, w: 15 }, // 0: Thượng nguồn thác tuyết Bắc
  { x: 215, z: -480, w: 15 }, // 1: Vùng đồi giữa Phú Điền và Tân Lộc
  { x: 210, z: -380, w: 16 }, // 2: Thung lũng đồi thông cao nguyên
  { x: 205, z: -280, w: 16 }, // 3: Tiếp cận QL -234
  { x: 205, z: -234, w: 16 }, // 4: [CẦU 1: QL BẮC -234]
  { x: 200, z: -175, w: 16 }, // 5: Uốn khúc chữ S cao nguyên
  { x: 190, z: -90,  w: 17 }, // 6: Đồi hoa phong vàng
  { x: 175, z: -15,  w: 18 }, // 7: Vịnh hòa lưu Hồ Pha Lê (Crystal Lake cove)
  { x: 175, z: 20,   w: 18 }, // 8: Hạ lưu Hồ Pha Lê
  { x: 195, z: 52,   w: 17 }, // 9: Thung lũng Công Viên Trung Tâm
  { x: 212, z: 86,   w: 17 }, // 10: [CẦU 2: ĐẠI CẦU QL 86]
  { x: 218, z: 140,  w: 16 }, // 11: Meander phía Tây Làng Ven Sông
  { x: 214, z: 210,  w: 16 }, // 12: [CẦU 3: CẦU VÒM GỖ VEN SÔNG]
  { x: 218, z: 270,  w: 16 }, // 13: Vòng cung Nam Làng Ven Sông
  { x: 205, z: 330,  w: 17 }, // 14: Thảo nguyên ven biển
  { x: 180, z: 406,  w: 18 }, // 15: [CẦU 4: QL NAM 406]
  { x: 165, z: 470,  w: 20 }, // 16: Cửa sông ven biển
  { x: 155, z: 540,  w: 24 }, // 17: Vịnh đại dương phía Nam
]);

/**
 * Metadata for the 4 Bridges spanning the river.
 */
export const RIVER_BRIDGES = Object.freeze([
  {
    id: 'bridge-highway-234',
    name: 'Cầu Bắc Tân Lộc (QL -234)',
    type: 'highway',
    cx: 205,
    cz: -234,
    spanX: 24, // Length across river along East-West road
    widthZ: 9.4, // Width along road corridor North-South
    deckY: 0.10,
    deckColor: '#334155',
    stoneColor: '#cbd5e1',
  },
  {
    id: 'bridge-highway-86',
    name: 'Đại Cầu Bình Minh - Ven Sông (QL 86)',
    type: 'highway',
    cx: 212,
    cz: 86,
    spanX: 26,
    widthZ: 9.6,
    deckY: 0.10,
    deckColor: '#334155',
    stoneColor: '#e2e8f0',
  },
  {
    id: 'bridge-vensong-pedestrian',
    name: 'Cầu Vòm Gỗ Ven Sông',
    type: 'pedestrian',
    cx: 214,
    cz: 210,
    spanX: 20,
    widthZ: 4.4,
    deckY: 0.35,
    woodColor: '#854d0e',
  },
  {
    id: 'bridge-highway-406',
    name: 'Cầu Nam Hướng Dương (QL 406)',
    type: 'highway',
    cx: 180,
    cz: 406,
    spanX: 24,
    widthZ: 9.4,
    deckY: 0.10,
    deckColor: '#334155',
    stoneColor: '#e2e8f0',
  },
]);

/**
 * Pure mathematical Catmull-Rom spline evaluator.
 * Passes precisely through all control points with continuous C1 tangents.
 */
function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const x = 0.5 * (
    (2 * p1.x) +
    (-p0.x + p2.x) * t +
    (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
    (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
  );
  const z = 0.5 * (
    (2 * p1.z) +
    (-p0.z + p2.z) * t +
    (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
    (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3
  );
  const w = p1.w + (p2.w - p1.w) * t;
  return { x, z, w };
}

/**
 * Evaluates the full smooth river spline at N sample steps.
 */
function sampleRiverSpline(controlPoints, totalSamples = 120) {
  const pts = controlPoints;
  const samples = [];
  const numSections = pts.length - 1;
  const samplesPerSection = Math.ceil(totalSamples / numSections);

  for (let i = 0; i < numSections; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[0];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

    for (let s = 0; s < samplesPerSection; s++) {
      if (i === numSections - 1 && s === samplesPerSection - 1) {
        samples.push({ x: p2.x, z: p2.z, w: p2.w });
        break;
      }
      const t = s / samplesPerSection;
      samples.push(catmullRom(p0, p1, p2, p3, t));
    }
  }

  return samples;
}

/**
 * Creates dynamic stylized water ripple texture for flow animation.
 */
function createRiverWaterTexture(scene, size = 512) {
  const dt = new DynamicTexture('river-water-anim-tex', { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.anisotropicFilteringLevel = 16;
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.WRAP_ADDRESSMODE;
  const ctx = dt.getContext();

  // Luminous cyan jade gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#06b6d4'); // Vibrant luminous cyan
  grad.addColorStop(0.35, '#38bdf8'); // Sky aqua
  grad.addColorStop(0.7, '#0284c7'); // Crystal deep blue
  grad.addColorStop(1, '#0369a1');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Organic caustics & soft water foam ribbons
  ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
  ctx.lineWidth = 4;
  for (let i = 0; i < 16; i++) {
    const y = (i * size) / 16;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.25, y + 22, size * 0.75, y - 22, size, y);
    ctx.stroke();
  }

  // Shoreline foam edges along left (U=0) and right (U=size)
  const foamGradL = ctx.createLinearGradient(0, 0, size * 0.16, 0);
  foamGradL.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
  foamGradL.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = foamGradL;
  ctx.fillRect(0, 0, size * 0.16, size);

  const foamGradR = ctx.createLinearGradient(size * 0.84, 0, size, 0);
  foamGradR.addColorStop(0, 'rgba(255, 255, 255, 0)');
  foamGradR.addColorStop(1, 'rgba(255, 255, 255, 0.75)');
  ctx.fillStyle = foamGradR;
  ctx.fillRect(size * 0.84, 0, size * 0.16, size);

  dt.update();
  return dt;
}

/**
 * Builds the 4 bridges spanning the river with paved road decks, stone balustrades, and lanterns.
 */
function createBridges(scene, root, shadows) {
  const bridgeMeshes = [];
  const matAsphalt = new StandardMaterial('bridge-asphalt-mat', scene);
  matAsphalt.diffuseColor = Color3.FromHexString('#334155');
  matAsphalt.specularColor = new Color3(0.04, 0.04, 0.04);

  const matStoneParapet = new StandardMaterial('bridge-stone-parapet-mat', scene);
  matStoneParapet.diffuseColor = Color3.FromHexString('#cbd5e1');
  matStoneParapet.ambientColor = matStoneParapet.diffuseColor.scale(0.4);
  matStoneParapet.specularColor = new Color3(0.08, 0.08, 0.08);

  const matWoodDeck = new StandardMaterial('bridge-wood-deck-mat', scene);
  matWoodDeck.diffuseColor = Color3.FromHexString('#854d0e');
  matWoodDeck.ambientColor = matWoodDeck.diffuseColor.scale(0.35);

  const matWoodRail = new StandardMaterial('bridge-wood-rail-mat', scene);
  matWoodRail.diffuseColor = Color3.FromHexString('#a16207');

  RIVER_BRIDGES.forEach(b => {
    const bNode = new TransformNode(b.id, scene);
    bNode.position.set(b.cx, 0, b.cz);
    bNode.parent = root;

    if (b.type === 'highway') {
      // 1. Paved Road Deck: Flush with highway grade (y = 0.09m) for smooth transit
      const deck = MeshBuilder.CreateBox(`${b.id}-deck`, {
        width: b.spanX,
        height: 0.18,
        depth: b.widthZ,
      }, scene);
      deck.position.set(0, 0.09, 0);
      deck.material = matAsphalt;
      deck.parent = bNode;
      deck.receiveShadows = true;
      bridgeMeshes.push(deck);

      // Smooth approach ramps at both ends (East and West)
      [-b.spanX / 2 - 2.5, b.spanX / 2 + 2.5].forEach((rx, idx) => {
        const ramp = MeshBuilder.CreateBox(`${b.id}-ramp-${idx}`, {
          width: 5.0,
          height: 0.12,
          depth: b.widthZ,
        }, scene);
        ramp.position.set(rx, 0.06, 0);
        ramp.material = matAsphalt;
        ramp.parent = bNode;
        ramp.receiveShadows = true;
      });

      // 2. Solid Stone Balustrades / Parapets along North and South edges
      [-b.widthZ / 2, b.widthZ / 2].forEach((dz, sideIdx) => {
        const parapet = MeshBuilder.CreateBox(`${b.id}-parapet-${sideIdx}`, {
          width: b.spanX + 8.0,
          height: 0.95,
          depth: 0.55,
        }, scene);
        parapet.position.set(0, 0.55, dz);
        parapet.material = matStoneParapet;
        parapet.parent = bNode;
        shadows?.addShadowCaster(parapet);

        // Classical Baluster Posts along the parapet
        for (let px = -b.spanX / 2 - 2.0; px <= b.spanX / 2 + 2.0; px += 2.8) {
          const post = MeshBuilder.CreateBox(`${b.id}-post-${sideIdx}-${px}`, {
            width: 0.38,
            height: 1.15,
            depth: 0.65,
          }, scene);
          post.position.set(px, 0.65, dz);
          post.material = matStoneParapet;
          post.parent = bNode;
        }
      });

      // 3. Under-Deck Heavy Stone Piers
      [-b.spanX * 0.28, b.spanX * 0.28].forEach((px, pIdx) => {
        const pier = MeshBuilder.CreateBox(`${b.id}-pier-${pIdx}`, {
          width: 2.4,
          height: 3.5,
          depth: b.widthZ + 1.2,
        }, scene);
        pier.position.set(px, -1.0, 0);
        pier.material = matStoneParapet;
        pier.parent = bNode;
      });

      // 4. Vintage Street Lanterns at 4 corners of the bridge
      [[-b.spanX / 2 - 1.5, -b.widthZ / 2 - 0.6],
       [b.spanX / 2 + 1.5, -b.widthZ / 2 - 0.6],
       [-b.spanX / 2 - 1.5, b.widthZ / 2 + 0.6],
       [b.spanX / 2 + 1.5, b.widthZ / 2 + 0.6]].forEach(([lx, lz], lIdx) => {
        spawnModelSync(scene, MODEL_PATHS.town.lantern, {
          position: new Vector3(b.cx + lx, 0.95, b.cz + lz),
          scaling: new Vector3(1.3, 1.3, 1.3),
          shadows,
          parent: bNode,
          name: `${b.id}-lamp-${lIdx}`,
        });
      });
    } else {
      // Pedestrian Romantic Arched Wooden Bridge
      const pedDeck = MeshBuilder.CreateBox(`${b.id}-deck`, {
        width: b.spanX,
        height: 0.24,
        depth: b.widthZ,
      }, scene);
      pedDeck.position.set(0, 0.28, 0);
      pedDeck.material = matWoodDeck;
      pedDeck.parent = bNode;
      shadows?.addShadowCaster(pedDeck);

      // Wooden Railings along sides
      [-b.widthZ / 2 + 0.15, b.widthZ / 2 - 0.15].forEach((dz, sideIdx) => {
        const rail = MeshBuilder.CreateCylinder(`${b.id}-rail-${sideIdx}`, {
          height: b.spanX,
          diameter: 0.15,
        }, scene);
        rail.rotation.z = Math.PI / 2;
        rail.position.set(0, 1.15, dz);
        rail.material = matWoodRail;
        rail.parent = bNode;

        for (let px = -b.spanX / 2 + 1.5; px <= b.spanX / 2 - 1.5; px += 2.2) {
          const post = MeshBuilder.CreateCylinder(`${b.id}-wpost-${sideIdx}-${px}`, {
            height: 1.1,
            diameter: 0.12,
          }, scene);
          post.position.set(px, 0.65, dz);
          post.material = matWoodRail;
          post.parent = bNode;
        }
      });

      // Warm fairy lanterns at bridge entries
      [[-b.spanX / 2, -b.widthZ / 2 - 0.4], [b.spanX / 2, b.widthZ / 2 + 0.4]].forEach(([lx, lz], lIdx) => {
        spawnModelSync(scene, MODEL_PATHS.town.lantern, {
          position: new Vector3(b.cx + lx, 0, b.cz + lz),
          scaling: new Vector3(1.2, 1.2, 1.2),
          shadows,
          parent: bNode,
          name: `${b.id}-ped-lamp-${lIdx}`,
        });
      });
    }
  });

  return bridgeMeshes;
}

/**
 * Creates the complete Grand Winding River System.
 */
export function createGrandWindingRiver(scene, parent = null, shadows = null) {
  const root = new TransformNode('grand-winding-river-system', scene);
  if (parent) root.parent = parent;

  // 1. Evaluate Spline Ribbon Paths
  const sampledSpline = sampleRiverSpline(RIVER_CONTROL_POINTS, 110);
  const leftPath = [];
  const rightPath = [];
  const centerPath = [];
  const leftUvs = [];
  const rightUvs = [];

  let accumulatedDist = 0;

  for (let i = 0; i < sampledSpline.length; i++) {
    const cur = sampledSpline[i];
    centerPath.push(new Vector3(cur.x, 0.03, cur.z));

    if (i > 0) {
      const prev = sampledSpline[i - 1];
      accumulatedDist += Math.hypot(cur.x - prev.x, cur.z - prev.z);
    }

    // Tangent calculation
    const prev = i > 0 ? sampledSpline[i - 1] : cur;
    const next = i < sampledSpline.length - 1 ? sampledSpline[i + 1] : cur;
    let tx = next.x - prev.x;
    let tz = next.z - prev.z;
    const len = Math.hypot(tx, tz) || 1;
    tx /= len;
    tz /= len;

    // Normal vector perpendicular to river flow
    const nx = -tz;
    const nz = tx;
    const halfW = cur.w / 2;

    leftPath.push(new Vector3(cur.x + nx * halfW, 0.03, cur.z + nz * halfW));
    rightPath.push(new Vector3(cur.x - nx * halfW, 0.03, cur.z - nz * halfW));

    // UV coordinates: U across river, V along flow
    const vCoord = accumulatedDist / 14.0;
    leftUvs.push(new Vector2(0, vCoord));
    rightUvs.push(new Vector2(1, vCoord));
  }

  // 2. Animated River Water Material
  const riverTex = createRiverWaterTexture(scene, 512);
  const matWater = new StandardMaterial('grand-river-water-mat', scene);
  matWater.diffuseColor = Color3.FromHexString('#22d3ee');
  matWater.diffuseTexture = riverTex;
  matWater.emissiveColor = Color3.FromHexString('#0891b2').scale(0.36);
  matWater.specularColor = new Color3(0.9, 0.98, 1.0);
  matWater.specularPower = 72;
  matWater.alpha = 0.88;
  matWater.backFaceCulling = false;

  // 3. Create Parametric Ribbon Mesh
  const riverMesh = MeshBuilder.CreateRibbon('grand-river-surface', {
    pathArray: [leftPath, rightPath],
    uvs: [leftUvs, rightUvs],
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  riverMesh.material = matWater;
  riverMesh.parent = root;
  riverMesh.receiveShadows = false;
  riverMesh.isPickable = false;

  // 4. Stone Cobble Riverbanks along left and right borders (Warm Natural Sandstone)
  const matBank = new StandardMaterial('grand-river-bank-mat', scene);
  matBank.diffuseColor = Color3.FromHexString('#d4b896');
  matBank.ambientColor = matBank.diffuseColor.scale(0.5);
  matBank.specularColor = new Color3(0.04, 0.04, 0.04);

  // Generate riverbank retaining curb ribbons
  const bankOffset = 0.8;
  const leftBankOuter = [];
  const rightBankOuter = [];
  for (let i = 0; i < sampledSpline.length; i++) {
    const cur = sampledSpline[i];
    const prev = i > 0 ? sampledSpline[i - 1] : cur;
    const next = i < sampledSpline.length - 1 ? sampledSpline[i + 1] : cur;
    let tx = next.x - prev.x;
    let tz = next.z - prev.z;
    const len = Math.hypot(tx, tz) || 1;
    tx /= len;
    tz /= len;
    const nx = -tz;
    const nz = tx;
    const halfW = cur.w / 2;

    leftBankOuter.push(new Vector3(cur.x + nx * (halfW + bankOffset), 0.16, cur.z + nz * (halfW + bankOffset)));
    rightBankOuter.push(new Vector3(cur.x - nx * (halfW + bankOffset), 0.16, cur.z - nz * (halfW + bankOffset)));
  }

  const leftBankMesh = MeshBuilder.CreateRibbon('grand-river-bank-left', {
    pathArray: [leftPath, leftBankOuter],
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  leftBankMesh.material = matBank;
  leftBankMesh.parent = root;
  leftBankMesh.freezeWorldMatrix();

  const rightBankMesh = MeshBuilder.CreateRibbon('grand-river-bank-right', {
    pathArray: [rightPath, rightBankOuter],
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  rightBankMesh.material = matBank;
  rightBankMesh.parent = root;
  rightBankMesh.freezeWorldMatrix();

  // 5. Build the 4 Solid Bridges
  createBridges(scene, root, shadows);

  // 6. Compute River Collision Boxes for WorldCollisionSystem (Excluding bridge corridors)
  const collisionBoxes = [];
  const stepSize = 2; // Tighter bounding step
  for (let i = 0; i < sampledSpline.length - stepSize; i += stepSize) {
    const pStart = sampledSpline[i];
    const pEnd = sampledSpline[i + stepSize];
    const segMinZ = Math.min(pStart.z, pEnd.z);
    const segMaxZ = Math.max(pStart.z, pEnd.z);
    const maxW = Math.max(pStart.w, pEnd.w);

    // Check if this segment's Z interval overlaps any bridge corridor
    const isBridgeCorridor = RIVER_BRIDGES.some(b => {
      const bridgeMinZ = b.cz - b.widthZ / 2 - 1.2;
      const bridgeMaxZ = b.cz + b.widthZ / 2 + 1.2;
      return segMinZ <= bridgeMaxZ && segMaxZ >= bridgeMinZ;
    });

    if (!isBridgeCorridor) {
      collisionBoxes.push({
        id: `river-barrier-${i}`,
        minX: Math.min(pStart.x, pEnd.x) - maxW / 2 - 0.5,
        maxX: Math.max(pStart.x, pEnd.x) + maxW / 2 + 0.5,
        minZ: segMinZ - 0.2,
        maxZ: segMaxZ + 0.2,
      });
    }
  }

  return {
    root,
    riverMesh,
    bridges: RIVER_BRIDGES,
    getCollisionBoxes: () => collisionBoxes,
    update(dt) {
      // Smooth 60 FPS water flow animation along river curves
      riverTex.vOffset -= dt * 0.12;
    },
    dispose() {
      riverTex.dispose();
      root.dispose();
    },
  };
}
