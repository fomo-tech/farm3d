/**
 * createRomanticLake.js
 * 
 * Authentic "Cozy Farmy" (cozyfarmy.com) Teardrop Lagoon & Sandy Shore Pier.
 * Features:
 * - Organic Teardrop / Heart-like mathematical lagoon contour.
 * - Multi-tiered water gradient: Light turquoise cyan shallows (#67e8f9) -> Deep azure core (#0284c7).
 * - Wide warm sandy beach shoreline (#f6d59b) hugging the perimeter.
 * - Sandy path spur connecting the road directly to the dock.
 * - Charming rustic wooden plank pier with dual mooring bollards & coiled ropes.
 * - Scattered flat-shaded low-poly river pebbles & smooth boulders (#94a3b8, #64748b, #cbd5e1).
 * - Floating round lily pads with pie notches and blooming pink/white lotus flowers.
 * - Swimming fish silhouettes gently gliding under the turquoise water.
 * - Delicate water reeds and cattails along the sandy bank.
 */

import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';

export const LAKE_CENTER = Object.freeze({ x: 167, z: 2 });
const SEGMENTS = 96;

/**
 * Mathematical Teardrop / Heart-like lagoon contour matching Cozy Farmy reference.
 * - Asymmetrical: wider on East (0) & South (-PI/2), gentle curve on North (PI/2),
 *   and a soft cove inlet on West (PI) where the rustic dock is moored.
 */
export function lakeEdge(angle, scale = 1) {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const shape = 1.0
    + 0.13 * Math.sin(angle)
    - 0.09 * Math.cos(2 * angle)
    + 0.05 * Math.sin(2 * angle + 0.45)
    - 0.07 * Math.cos(angle);

  return {
    x: LAKE_CENTER.x + cosA * 34 * shape * scale,
    z: LAKE_CENTER.z + sinA * 24 * shape * scale,
  };
}

function createMat(scene, name, diffuseHex, ambientHex = null, specularHex = null, alpha = 1.0) {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = Color3.FromHexString(diffuseHex);
  mat.ambientColor = ambientHex ? Color3.FromHexString(ambientHex) : mat.diffuseColor.scale(0.38);
  mat.specularColor = specularHex ? Color3.FromHexString(specularHex) : new Color3(0.04, 0.04, 0.04);
  mat.specularPower = 32;
  mat.alpha = alpha;
  mat.backFaceCulling = false;
  return mat;
}

function createLakeRing(scene, name, innerScale, outerScale, y, mat, segments = SEGMENTS) {
  const paths = [[], []];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const a = lakeEdge(angle, innerScale);
    const b = lakeEdge(angle, outerScale);
    paths[0].push(new Vector3(a.x, y, a.z));
    paths[1].push(new Vector3(b.x, y, b.z));
  }
  const mesh = MeshBuilder.CreateRibbon(name, {
    pathArray: paths,
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  mesh.material = mat;
  mesh.isPickable = false;
  return mesh;
}

export function createRomanticLake(scene, shadows = null) {
  const root = new TransformNode('cozy-teardrop-lake-root', scene);
  const meshes = [];

  // ==========================================
  // 1. VẬT LIỆU CHUẨN COZY FARMY
  // ==========================================
  const matWaterDeep = createMat(scene, 'lake-deep-water-mat', '#0284c7', '#0369a1', '#67e8f9', 0.94);
  matWaterDeep.specularPower = 64;

  const matWaterShallow = createMat(scene, 'lake-shallow-water-mat', '#67e8f9', '#a5f3fc', '#ffffff', 0.82);
  matWaterShallow.specularPower = 72;

  const matSandShore = createMat(scene, 'lake-sand-shore-mat', '#f6d59b', '#fde68a', '#fef3c7', 1.0);
  const matSandSpur = createMat(scene, 'lake-sand-spur-mat', '#f5cb8a', '#fef08a', '#fef3c7', 1.0);

  const matWoodDeck = createMat(scene, 'lake-pier-wood-deck', '#b45309', '#92400e');
  const matWoodPlankAlt = createMat(scene, 'lake-pier-wood-alt', '#a16207', '#78350f');
  const matWoodPost = createMat(scene, 'lake-pier-post-mat', '#78350f', '#451a03');
  const matRope = createMat(scene, 'lake-pier-rope-mat', '#fbbf24', '#f59e0b');

  const matPebble1 = createMat(scene, 'lake-pebble-1', '#94a3b8');
  const matPebble2 = createMat(scene, 'lake-pebble-2', '#64748b');
  const matPebble3 = createMat(scene, 'lake-pebble-3', '#cbd5e1');

  const matLilyPad = createMat(scene, 'lake-lily-pad-mat', '#22c55e', '#15803d');
  const matLotusPetal = createMat(scene, 'lake-lotus-petal-mat', '#f472b6', '#fbcfe8');
  const matLotusCenter = createMat(scene, 'lake-lotus-center-mat', '#facc15', '#eab308');

  const matFish = createMat(scene, 'lake-fish-shadow-mat', '#0e7490', '#155e75', null, 0.75);
  const matReedStalk = createMat(scene, 'lake-reed-stalk-mat', '#65a30d');
  const matReedHead = createMat(scene, 'lake-reed-head-mat', '#78350f');

  // ==========================================
  // 2. MẶT NƯỚC HỒ TRÁI TIM / GIỌT NƯỚC (TEARDROP LAGOON)
  // ==========================================
  // A. Lòng hồ nước sâu (Opaque fan đa diện không bị cỏ xuyên thấu)
  const deepPositions = [LAKE_CENTER.x, 0.065, LAKE_CENTER.z];
  const deepIndices = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const angle = (i / SEGMENTS) * Math.PI * 2;
    const pt = lakeEdge(angle, 0.88);
    deepPositions.push(pt.x, 0.065, pt.z);
    if (i > 0) deepIndices.push(0, i, i + 1);
  }

  const water = new Mesh('crystal-lake', scene);
  const deepGeom = new VertexData();
  deepGeom.positions = deepPositions;
  deepGeom.indices = deepIndices;
  deepGeom.normals = [];
  VertexData.ComputeNormals(deepPositions, deepIndices, deepGeom.normals);
  deepGeom.applyToMesh(water);
  water.material = matWaterDeep;
  water.isPickable = false;
  water.parent = root;
  meshes.push(water);

  // B. Dải nước nông ngọc lam (Shallow Turquoise Rim)
  const shallowRim = createLakeRing(scene, 'lake-shallow-edge', 0.86, 1.00, 0.07, matWaterShallow);
  shallowRim.parent = root;
  meshes.push(shallowRim);

  // ==========================================
  // 3. BỜ CÁT VÀNG MỊN (SANDY SHORELINE)
  // ==========================================
  // Vành cát vàng ấm bao bọc trọn vẹn mép hồ
  const sandShore = createLakeRing(scene, 'lake-sandy-shore', 0.98, 1.22, 0.05, matSandShore);
  sandShore.parent = root;
  meshes.push(sandShore);

  // Dải cát vàng nối từ đường đất chính sang đầu bến tàu (Sand Spur to Pier)
  const sandSpur = MeshBuilder.CreateBox('lake-sand-spur-path', {
    width: 14,
    height: 0.03,
    depth: 4.8,
  }, scene);
  sandSpur.position.set(127, 0.055, 2);
  sandSpur.material = matSandSpur;
  sandSpur.isPickable = false;
  sandSpur.parent = root;
  meshes.push(sandSpur);

  // ==========================================
  // 4. CẦU TÀU GỖ MỘC MẠC (RUSTIC WOODEN PIER & DOCK)
  // ==========================================
  const pierRoot = new TransformNode('lake-rustic-pier-root', scene);
  pierRoot.position.set(136, 0.22, 2);
  pierRoot.parent = root;

  // Khung dầm chịu lực dưới sàn cầu tàu
  const beamNorth = MeshBuilder.CreateBox('pier-beam-n', { width: 11.5, height: 0.22, depth: 0.28 }, scene);
  beamNorth.position.set(0, -0.12, 1.4);
  beamNorth.material = matWoodPost;
  beamNorth.parent = pierRoot;

  const beamSouth = MeshBuilder.CreateBox('pier-beam-s', { width: 11.5, height: 0.22, depth: 0.28 }, scene);
  beamSouth.position.set(0, -0.12, -1.4);
  beamSouth.material = matWoodPost;
  beamSouth.parent = pierRoot;

  // Các cọc gỗ cắm đáy hồ đỡ thân cầu tàu
  [-5.2, -1.8, 1.8, 5.2].forEach((ox, idx) => {
    [1.4, -1.4].forEach((oz, sIdx) => {
      const p = MeshBuilder.CreateCylinder(`pier-under-pile-${idx}-${sIdx}`, {
        height: 1.6,
        diameter: 0.24,
        tessellation: 8,
      }, scene);
      p.position.set(ox, -0.65, oz);
      p.material = matWoodPost;
      p.parent = pierRoot;
      shadows?.addShadowCaster(p);
    });
  });

  // Từng tấm ván gỗ lát sàn cầu tàu (Planks với vân so le tự nhiên)
  const plankCount = 20;
  const plankLength = 11.2;
  const step = plankLength / plankCount;
  for (let i = 0; i < plankCount; i++) {
    const px = -plankLength * 0.5 + i * step + step * 0.5;
    const plank = MeshBuilder.CreateBox(`pier-plank-${i}`, {
      width: step * 0.88,
      height: 0.12,
      depth: 3.2,
    }, scene);
    plank.position.set(px, 0.06, 0);
    plank.material = (i % 3 === 0) ? matWoodPlankAlt : matWoodDeck;
    plank.parent = pierRoot;
    shadows?.addShadowCaster(plank);
  }

  // 2 Cọc gỗ buộc thuyền nhô cao ở đầu bến tàu (Mooring Bollards)
  const bollardPositions = [
    { x: 5.4, z: 1.35 },
    { x: 5.4, z: -1.35 },
  ];
  bollardPositions.forEach((bp, idx) => {
    // Cọc gỗ
    const post = MeshBuilder.CreateCylinder(`pier-mooring-post-${idx}`, {
      height: 1.05,
      diameterTop: 0.32,
      diameterBottom: 0.36,
      tessellation: 8,
    }, scene);
    post.position.set(bp.x, 0.45, bp.z);
    post.material = matWoodPost;
    post.parent = pierRoot;
    shadows?.addShadowCaster(post);

    // Vành chóp cọc bo nhẹ
    const cap = MeshBuilder.CreateSphere(`pier-post-cap-${idx}`, {
      diameter: 0.34,
      segments: 6,
    }, scene);
    cap.position.set(bp.x, 0.98, bp.z);
    cap.scaling.y = 0.45;
    cap.material = matWoodPost;
    cap.parent = pierRoot;

    // Cuộn dây thừng vàng quấn quanh cọc
    const rope = MeshBuilder.CreateTorus(`pier-post-rope-${idx}`, {
      diameter: 0.38,
      thickness: 0.08,
      tessellation: 12,
    }, scene);
    rope.position.set(bp.x, 0.35, bp.z);
    rope.material = matRope;
    rope.parent = pierRoot;
  });

  // ==========================================
  // 5. SỎI CUỘI XÁM LOW-POLY VEN BỜ (PEBBLES & BOULDERS)
  // ==========================================
  // Rải đều 24 viên sỏi cuội đa giác phẳng dọc theo mép nước
  const pebbleAngles = [
    0.05, 0.28, 0.52, 0.78, 1.08, 1.38, 1.65, 1.95, 2.22, 2.50, 2.78,
    3.02, 3.25, 3.55, 3.85, 4.15, 4.45, 4.75, 5.05, 5.35, 5.65, 5.95, 6.18
  ];

  pebbleAngles.forEach((angle, idx) => {
    // Bỏ qua vị trí bến tàu ở phía Tây (khoảng góc PI ~ 3.14)
    if (Math.abs(angle - Math.PI) < 0.35) return;

    const pt = lakeEdge(angle, 1.02);
    const s = 0.55 + ((idx * 37) % 60) * 0.012; // 0.55m -> 1.25m
    const pebble = MeshBuilder.CreateIcoSphere(`lake-pebble-${idx}`, {
      radius: s * 0.5,
      subdivisions: 1,
      flat: true,
    }, scene);

    pebble.position.set(pt.x, 0.08 + s * 0.12, pt.z);
    pebble.scaling.set(1.2, 0.55, 0.9);
    pebble.rotation.y = angle + idx;
    pebble.material = (idx % 3 === 0) ? matPebble1 : (idx % 3 === 1 ? matPebble2 : matPebble3);
    pebble.isPickable = false;
    pebble.parent = root;
    shadows?.addShadowCaster(pebble);
    meshes.push(pebble);
  });

  // ==========================================
  // 6. LÁ SEN & HOA SÚNG NỞ TRÊN MẶT NƯỚC (LILY PADS & LOTUS)
  // ==========================================
  const lilyLocations = [
    { x: 156, z: 8, scale: 1.1, hasFlower: true },
    { x: 158.5, z: 9.8, scale: 0.9, hasFlower: false },
    { x: 154, z: 12, scale: 1.0, hasFlower: false },
    { x: 172, z: 12, scale: 1.2, hasFlower: true },
    { x: 175, z: 14, scale: 0.85, hasFlower: false },
    { x: 162, z: -10, scale: 1.15, hasFlower: true },
    { x: 165, z: -11.5, scale: 0.95, hasFlower: false },
    { x: 148, z: -8, scale: 1.0, hasFlower: true },
    { x: 178, z: -2, scale: 1.05, hasFlower: false },
    { x: 182, z: 1, scale: 0.8, hasFlower: false },
  ];

  lilyLocations.forEach((loc, idx) => {
    // Lá sen dẹt tròn có góc khuyết hình chữ V
    const pad = MeshBuilder.CreateCylinder(`cozy-lily-pad-${idx}`, {
      diameter: 1.4 * loc.scale,
      height: 0.02,
      tessellation: 14,
    }, scene);
    pad.position.set(loc.x, 0.075, loc.z);
    pad.material = matLilyPad;
    pad.isPickable = false;
    pad.parent = root;
    meshes.push(pad);

    // Hoa súng nở hồng phấn với nhụy vàng
    if (loc.hasFlower) {
      const flowerGroup = new TransformNode(`lotus-bloom-${idx}`, scene);
      flowerGroup.position.set(loc.x, 0.085, loc.z);
      flowerGroup.parent = root;

      for (let p = 0; p < 6; p++) {
        const pAngle = (p / 6) * Math.PI * 2;
        const petal = MeshBuilder.CreateSphere(`lotus-p-${idx}-${p}`, {
          diameterX: 0.24,
          diameterY: 0.12,
          diameterZ: 0.34,
          segments: 4,
        }, scene);
        petal.position.set(Math.sin(pAngle) * 0.16, 0.04, Math.cos(pAngle) * 0.16);
        petal.rotation.y = pAngle;
        petal.material = matLotusPetal;
        petal.parent = flowerGroup;
      }

      const center = MeshBuilder.CreateSphere(`lotus-c-${idx}`, { diameter: 0.16, segments: 4 }, scene);
      center.position.set(0, 0.06, 0);
      center.material = matLotusCenter;
      center.parent = flowerGroup;
    }
  });

  // ==========================================
  // 7. BÓNG CÁ BƠI LẶNG LẼ DƯỚI NƯỚC (SWIMMING FISH SILHOUETTES)
  // ==========================================
  const fishNodes = [];
  const fishParams = [
    { radius: 10, speed: 0.00065, baseAngle: 0.4, depth: 0.045 },
    { radius: 14, speed: 0.00050, baseAngle: 2.1, depth: 0.040 },
    { radius: 18, speed: 0.00042, baseAngle: 3.8, depth: 0.042 },
    { radius: 8, speed: 0.00075, baseAngle: 5.2, depth: 0.048 },
    { radius: 12, speed: 0.00058, baseAngle: 1.3, depth: 0.043 },
  ];

  fishParams.forEach((f, idx) => {
    const fish = MeshBuilder.CreateSphere(`lake-fish-${idx}`, {
      diameterX: 0.65,
      diameterY: 0.08,
      diameterZ: 0.22,
      segments: 4,
    }, scene);
    fish.material = matFish;
    fish.isPickable = false;
    fish.parent = root;
    fishNodes.push({ mesh: fish, ...f });
    meshes.push(fish);
  });

  // ==========================================
  // 8. BỤI CỎ SẬY VEN BỜ (CATTAILS & REEDS)
  // ==========================================
  const reedClusters = [
    { x: 148, z: 15 },
    { x: 142, z: 11 },
    { x: 145, z: -12 },
    { x: 186, z: 12 },
    { x: 188, z: -8 },
  ];

  reedClusters.forEach((cl, cIdx) => {
    for (let r = 0; r < 4; r++) {
      const rox = (r % 2 === 0 ? 0.35 : -0.35) + r * 0.1;
      const roz = (r < 2 ? 0.3 : -0.3);
      const stalkHeight = 1.1 + (r % 3) * 0.25;

      const stalk = MeshBuilder.CreateCylinder(`reed-stalk-${cIdx}-${r}`, {
        height: stalkHeight,
        diameter: 0.04,
        tessellation: 4,
      }, scene);
      stalk.position.set(cl.x + rox, stalkHeight * 0.5 + 0.04, cl.z + roz);
      stalk.material = matReedStalk;
      stalk.parent = root;

      const head = MeshBuilder.CreateCylinder(`reed-head-${cIdx}-${r}`, {
        height: 0.32,
        diameter: 0.09,
        tessellation: 6,
      }, scene);
      head.position.set(cl.x + rox, stalkHeight + 0.02, cl.z + roz);
      head.material = matReedHead;
      head.parent = root;
    }
  });

  // Animation cá bơi nhịp nhàng theo thời gian
  let lastTime = performance.now();
  const animObserver = scene.onBeforeRenderObservable.add(() => {
    if (scene.isDisposed) {
      scene.onBeforeRenderObservable.remove(animObserver);
      return;
    }
    const now = performance.now();
    const dt = now - lastTime;
    lastTime = now;

    fishNodes.forEach(f => {
      f.baseAngle += f.speed * dt;
      const fx = LAKE_CENTER.x + Math.cos(f.baseAngle) * f.radius;
      const fz = LAKE_CENTER.z + Math.sin(f.baseAngle) * (f.radius * 0.72);
      f.mesh.position.set(fx, f.depth, fz);
      f.mesh.rotation.y = -f.baseAngle + Math.PI / 2 + Math.sin(now * 0.005) * 0.08;
    });
  });

  return {
    water,
    meshes,
    root,
    dispose() {
      scene.onBeforeRenderObservable.remove(animObserver);
      root.dispose(false, true);
    },
  };
}
