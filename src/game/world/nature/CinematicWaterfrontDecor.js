/**
 * CinematicWaterfrontDecor.js
 *
 * Cinematic Waterfront Scenery System for Lake & River Environments.
 * Inspired by Ghibli Studio × Animal Crossing: New Horizons × Ghost of Tsushima × Play Together.
 * 
 * Features:
 * 1. Wet Sand Specular Sheen (Dải cát ẩm có độ bóng nước phản chiếu)
 * 2. Clustered River Boulders & Smooth Mossy Pebbles (Cụm đá cuội suối & rêu phong)
 * 3. Weeping Willows (Cây liễu rủ bóng nước đung đưa theo gió)
 * 4. Vintage Moored Rowing Boat (Thuyền gỗ chèo tay bồng bềnh dập dềnh theo sóng)
 * 5. Chibi River Stepping Stones (Bậc đá tròn bước qua suối với gợn sóng)
 * 6. Romantic Tree Swing (Xích đu gỗ dưới tán liễu ven hồ)
 * 7. Low-Lying River Mist (Dải sương mù mềm là đà trôi dọc lòng sông)
 * 8. Bioluminescent Fireflies (Bầy đom đóm dạ quang bay lượn ban đêm)
 */

import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';

/**
 * 1. Creates wet sand specular material with high sun reflection sheen.
 */
export function createWetSandMaterial(scene, name = 'waterfront-wet-sand-mat') {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = Color3.FromHexString('#be9b60');
  mat.ambientColor = Color3.FromHexString('#544222');
  mat.specularColor = new Color3(0.85, 0.92, 0.98); // High sun glint reflection
  mat.specularPower = 48; // Wet glass-like sheen
  mat.backFaceCulling = false;
  mat.zOffset = -2;
  return mat;
}

/**
 * 2. Clustered River Boulders & Smooth Mossy Pebbles.
 * Places natural clusters of smooth rounded boulders along water banks.
 */
export function createClusteredShorePebbles(scene, parent, clusters = [], shadows = null) {
  const root = new TransformNode('clustered-shore-pebbles-root', scene);
  if (parent) root.parent = parent;

  const matPebbleGrey = new StandardMaterial('pebble-grey-mat', scene);
  matPebbleGrey.diffuseColor = Color3.FromHexString('#64748b');
  matPebbleGrey.ambientColor = Color3.FromHexString('#334155');
  matPebbleGrey.specularColor = new Color3(0.12, 0.12, 0.12);
  matPebbleGrey.specularPower = 32;

  const matPebbleSlate = new StandardMaterial('pebble-slate-mat', scene);
  matPebbleSlate.diffuseColor = Color3.FromHexString('#475569');
  matPebbleSlate.ambientColor = Color3.FromHexString('#1e293b');
  matPebbleSlate.specularColor = new Color3(0.15, 0.15, 0.15);
  matPebbleSlate.specularPower = 36;

  const matPebbleMoss = new StandardMaterial('pebble-moss-mat', scene);
  matPebbleMoss.diffuseColor = Color3.FromHexString('#4d7c0f');
  matPebbleMoss.ambientColor = Color3.FromHexString('#365314');
  matPebbleMoss.specularColor = new Color3(0.06, 0.06, 0.06);

  clusters.forEach((cl, clIdx) => {
    const clNode = new TransformNode(`pebble-cluster-${clIdx}`, scene);
    clNode.position.set(cl.x, cl.y ?? 0.078, cl.z);
    clNode.parent = root;

    const count = cl.count || (3 + (clIdx % 3));
    const baseRadius = cl.radius || 1.8;

    for (let p = 0; p < count; p++) {
      const angle = (p / count) * Math.PI * 2 + (clIdx * 0.7);
      const dist = (0.25 + (p % 2) * 0.45) * baseRadius;
      const px = Math.cos(angle) * dist;
      const pz = Math.sin(angle) * dist;

      const sizeScale = 0.5 + ((p * 7 + clIdx * 11) % 10) * 0.08;
      const diamX = (cl.scale || 1.0) * sizeScale * (0.8 + (p % 2) * 0.3);
      const diamY = (cl.scale || 1.0) * sizeScale * 0.45;
      const diamZ = (cl.scale || 1.0) * sizeScale * (0.7 + ((p + 1) % 2) * 0.3);

      const pebble = MeshBuilder.CreateSphere(`pebble-${clIdx}-${p}`, {
        diameterX: diamX,
        diameterY: diamY,
        diameterZ: diamZ,
        segments: 4,
      }, scene);

      // Embedded partially in sand/water
      pebble.position.set(px, diamY * 0.38, pz);
      pebble.rotation.y = (p * 1.3 + clIdx) * Math.PI;
      pebble.rotation.z = ((p % 3) - 1) * 0.08;

      const matChoice = (p + clIdx) % 3;
      pebble.material = matChoice === 0 ? matPebbleMoss : (matChoice === 1 ? matPebbleGrey : matPebbleSlate);
      pebble.parent = clNode;
      pebble.isPickable = false;
      pebble.receiveShadows = true;
      if (diamX > 1.0 && shadows) shadows.addShadowCaster(pebble);
    }
  });

  return root;
}

/**
 * 3. Scenic Fishing Rock Perch (Mỏm đá phẳng câu cá ven hồ).
 */
export function createScenicFishingPerch(scene, parent, { x, y = 0.075, z, rotationY = 0, scale = 1.0 }, shadows = null) {
  const node = new TransformNode(`scenic-perch-${x.toFixed(0)}-${z.toFixed(0)}`, scene);
  node.position.set(x, y, z);
  node.rotation.y = rotationY;
  if (parent) node.parent = parent;

  const matFlatRock = new StandardMaterial('fishing-perch-rock-mat', scene);
  matFlatRock.diffuseColor = Color3.FromHexString('#64748b');
  matFlatRock.ambientColor = Color3.FromHexString('#334155');
  matFlatRock.specularColor = new Color3(0.18, 0.18, 0.18);
  matFlatRock.specularPower = 38;

  // Main flat slab extending into water
  const slab = MeshBuilder.CreateCylinder('perch-slab', {
    diameterTop: 2.8 * scale,
    diameterBottom: 3.2 * scale,
    height: 0.35 * scale,
    tessellation: 8,
  }, scene);
  slab.position.set(0, 0.15 * scale, 0);
  slab.material = matFlatRock;
  slab.parent = node;
  slab.receiveShadows = true;
  if (shadows) shadows.addShadowCaster(slab);

  // Secondary lower step stone
  const step = MeshBuilder.CreateCylinder('perch-step', {
    diameterTop: 1.6 * scale,
    diameterBottom: 1.8 * scale,
    height: 0.22 * scale,
    tessellation: 7,
  }, scene);
  step.position.set(1.1 * scale, 0.08 * scale, -0.6 * scale);
  step.material = matFlatRock;
  step.parent = node;

  // Bamboo Fishing Rod resting on stone
  const matBamboo = new StandardMaterial('perch-bamboo-mat', scene);
  matBamboo.diffuseColor = Color3.FromHexString('#84cc16');
  matBamboo.ambientColor = Color3.FromHexString('#4d7c0f');

  const rod = MeshBuilder.CreateCylinder('perch-rod', {
    height: 2.6 * scale,
    diameterTop: 0.02 * scale,
    diameterBottom: 0.05 * scale,
    tessellation: 4,
  }, scene);
  rod.position.set(0.6 * scale, 0.65 * scale, 0.5 * scale);
  rod.rotation.x = 0.55;
  rod.rotation.z = -0.42;
  rod.material = matBamboo;
  rod.parent = node;

  // Woven Wicker Creel (Giỏ cá đan tre)
  const matBasket = new StandardMaterial('perch-basket-mat', scene);
  matBasket.diffuseColor = Color3.FromHexString('#d97706');
  matBasket.ambientColor = Color3.FromHexString('#92400e');

  const basket = MeshBuilder.CreateCylinder('perch-basket', {
    diameterTop: 0.38 * scale,
    diameterBottom: 0.46 * scale,
    height: 0.42 * scale,
    tessellation: 8,
  }, scene);
  basket.position.set(-0.65 * scale, 0.44 * scale, -0.4 * scale);
  basket.material = matBasket;
  basket.parent = node;
  if (shadows) shadows.addShadowCaster(basket);

  return node;
}

/**
 * 4. Weeping Willow Tree (Cây liễu rủ bóng nước phong cách Ghibli & Play Together).
 * Features a gnarled organic trunk, spreading canopy branches, and lush layered
 * cloud foliage clusters with hanging weeping tendrils that sway gently in the breeze.
 */
export function createWeepingWillow(scene, parent, { x, y = 0.09, z, scale = 1.0, rotationY = 0 }, shadows = null) {
  const treeNode = new TransformNode(`weeping-willow-${x.toFixed(0)}-${z.toFixed(0)}`, scene);
  treeNode.position.set(x, y, z);
  treeNode.rotation.y = rotationY;
  if (parent) treeNode.parent = parent;

  const matBark = new StandardMaterial(`willow-bark-${x.toFixed(0)}-${z.toFixed(0)}`, scene);
  matBark.diffuseColor = Color3.FromHexString('#5c3d28');
  matBark.ambientColor = Color3.FromHexString('#382314');
  matBark.specularColor = new Color3(0.04, 0.04, 0.04);

  const matFoliageSun = new StandardMaterial('willow-foliage-sun', scene);
  matFoliageSun.diffuseColor = Color3.FromHexString('#a3e635'); // Sunlit chartreuse
  matFoliageSun.ambientColor = Color3.FromHexString('#4d7c0f').scale(0.5);
  matFoliageSun.specularColor = Color3.Black();

  const matFoliageMid = new StandardMaterial('willow-foliage-mid', scene);
  matFoliageMid.diffuseColor = Color3.FromHexString('#84cc16'); // Spring lime
  matFoliageMid.ambientColor = Color3.FromHexString('#3f6212').scale(0.5);
  matFoliageMid.specularColor = Color3.Black();

  const matFoliageDeep = new StandardMaterial('willow-foliage-deep', scene);
  matFoliageDeep.diffuseColor = Color3.FromHexString('#4ade80'); // Mint jade
  matFoliageDeep.ambientColor = Color3.FromHexString('#15803d').scale(0.5);
  matFoliageDeep.specularColor = Color3.Black();

  // Root flare into ground
  const rootFlare = MeshBuilder.CreateCylinder('willow-roots', {
    height: 0.6 * scale,
    diameterBottom: 1.4 * scale,
    diameterTop: 0.8 * scale,
    tessellation: 8,
  }, scene);
  rootFlare.position.set(0, 0.25 * scale, 0);
  rootFlare.material = matBark;
  rootFlare.parent = treeNode;
  if (shadows) shadows.addShadowCaster(rootFlare);

  // Lower trunk: leaning organically
  const trunkLower = MeshBuilder.CreateCylinder('willow-trunk-lower', {
    height: 3.2 * scale,
    diameterBottom: 0.85 * scale,
    diameterTop: 0.62 * scale,
    tessellation: 8,
  }, scene);
  trunkLower.position.set(0, 1.6 * scale, 0);
  trunkLower.rotation.z = -0.16;
  trunkLower.rotation.x = 0.08;
  trunkLower.material = matBark;
  trunkLower.parent = treeNode;
  if (shadows) shadows.addShadowCaster(trunkLower);

  // Upper trunk bending outward toward water
  const trunkUpper = MeshBuilder.CreateCylinder('willow-trunk-upper', {
    height: 2.6 * scale,
    diameterBottom: 0.60 * scale,
    diameterTop: 0.42 * scale,
    tessellation: 7,
  }, scene);
  trunkUpper.position.set(0.45 * scale, 3.6 * scale, 0.20 * scale);
  trunkUpper.rotation.z = -0.32;
  trunkUpper.rotation.x = 0.12;
  trunkUpper.material = matBark;
  trunkUpper.parent = treeNode;
  if (shadows) shadows.addShadowCaster(trunkUpper);

  // Crown sway node for wind physics
  const crownNode = new TransformNode('willow-crown-node', scene);
  crownNode.position.set(0.8 * scale, 4.6 * scale, 0.3 * scale);
  crownNode.parent = treeNode;

  // Central Lush Cloud Canopy Domes
  const mainDome1 = MeshBuilder.CreateSphere('willow-dome-main1', {
    diameter: 3.8 * scale,
    segments: 5,
  }, scene);
  mainDome1.scaling.set(1.25, 0.82, 1.15);
  mainDome1.position.set(0, 0.6 * scale, 0);
  mainDome1.material = matFoliageSun;
  mainDome1.parent = crownNode;
  if (shadows) shadows.addShadowCaster(mainDome1);

  const mainDome2 = MeshBuilder.CreateSphere('willow-dome-main2', {
    diameter: 3.4 * scale,
    segments: 5,
  }, scene);
  mainDome2.scaling.set(1.15, 0.78, 1.25);
  mainDome2.position.set(0.8 * scale, 0.4 * scale, -0.4 * scale);
  mainDome2.material = matFoliageMid;
  mainDome2.parent = crownNode;
  if (shadows) shadows.addShadowCaster(mainDome2);

  // 4 Arching Canopy Branches with Weeping Foliage Tendrils
  const branchConfigs = [
    { angle: 0.1, dist: 2.2, height: -0.2, scaleLobe: 2.4, dropLen: 2.2 },
    { angle: 1.6, dist: 2.0, height: -0.1, scaleLobe: 2.2, dropLen: 2.0 },
    { angle: 3.2, dist: 2.4, height: -0.3, scaleLobe: 2.6, dropLen: 2.5 },
    { angle: 4.8, dist: 2.1, height: -0.2, scaleLobe: 2.3, dropLen: 2.1 },
  ];

  branchConfigs.forEach((bc, bIdx) => {
    const bx = Math.cos(bc.angle) * bc.dist * scale;
    const bz = Math.sin(bc.angle) * bc.dist * scale;

    // Wooden branch limb
    const limb = MeshBuilder.CreateCylinder(`willow-limb-${bIdx}`, {
      height: bc.dist * scale,
      diameterBottom: 0.32 * scale,
      diameterTop: 0.16 * scale,
      tessellation: 6,
    }, scene);
    limb.position.set(bx * 0.5, bc.height * scale + 0.3 * scale, bz * 0.5);
    limb.rotation.y = -bc.angle;
    limb.rotation.z = -0.55;
    limb.material = matBark;
    limb.parent = crownNode;

    // Outer drooping canopy lobe (soft leafy cloud)
    const lobe = MeshBuilder.CreateSphere(`willow-lobe-${bIdx}`, {
      diameter: bc.scaleLobe * scale,
      segments: 5,
    }, scene);
    lobe.scaling.set(1.2, 0.75, 1.1);
    lobe.position.set(bx, bc.height * scale, bz);
    lobe.material = (bIdx % 2 === 0) ? matFoliageMid : matFoliageDeep;
    lobe.parent = crownNode;
    if (shadows) shadows.addShadowCaster(lobe);

    // Cascading hanging weeping tendril (soft drooping leafy teardrop)
    const drop = MeshBuilder.CreateSphere(`willow-drop-${bIdx}`, {
      diameterX: 1.1 * scale,
      diameterY: bc.dropLen * scale,
      diameterZ: 1.1 * scale,
      segments: 4,
    }, scene);
    drop.position.set(bx * 1.05, bc.height * scale - (bc.dropLen * 0.45 * scale), bz * 1.05);
    drop.material = (bIdx % 2 === 0) ? matFoliageDeep : matFoliageMid;
    drop.parent = crownNode;
    if (shadows) shadows.addShadowCaster(drop);
  });

  // Gentle ambient wind swaying observer
  let animT = 0;
  const windObserver = scene.onBeforeRenderObservable.add(() => {
    if (scene.isDisposed || treeNode.isDisposed()) {
      scene.onBeforeRenderObservable.remove(windObserver);
      return;
    }
    animT += 0.016;
    crownNode.rotation.z = Math.sin(animT * 1.2) * 0.024;
    crownNode.rotation.x = Math.cos(animT * 0.9) * 0.018;
  });

  return treeNode;
}

/**
 * 5. Vintage Wooden Rowing Boat with Buoyancy Animation.
 * Placed gently moored next to the fishing pier.
 */
export function createVintageRowingBoat(scene, parent, { x = 156, y = 0.076, z = -4.5, rotationY = 0.3 }, shadows = null) {
  const boatRoot = new TransformNode('vintage-rowboat-root', scene);
  boatRoot.position.set(x, y, z);
  boatRoot.rotation.y = rotationY;
  if (parent) boatRoot.parent = parent;

  const matHullWood = new StandardMaterial('boat-hull-wood-mat', scene);
  matHullWood.diffuseColor = Color3.FromHexString('#9a3412');
  matHullWood.ambientColor = Color3.FromHexString('#431407');
  matHullWood.specularColor = new Color3(0.12, 0.12, 0.12);

  const matSeatWood = new StandardMaterial('boat-seat-wood-mat', scene);
  matSeatWood.diffuseColor = Color3.FromHexString('#d97706');
  matSeatWood.ambientColor = Color3.FromHexString('#78350f');

  const matOarWood = new StandardMaterial('boat-oar-wood-mat', scene);
  matOarWood.diffuseColor = Color3.FromHexString('#fbbf24');
  matOarWood.ambientColor = Color3.FromHexString('#92400e');

  const matRope = new StandardMaterial('boat-rope-mat', scene);
  matRope.diffuseColor = Color3.FromHexString('#fef08a');
  matRope.ambientColor = Color3.FromHexString('#a16207');

  // Boat Hull: Tapered curved vessel
  const hullBottom = MeshBuilder.CreateBox('boat-hull-bottom', {
    width: 2.8,
    height: 0.16,
    depth: 1.15,
  }, scene);
  hullBottom.position.set(0, 0.08, 0);
  hullBottom.material = matHullWood;
  hullBottom.parent = boatRoot;
  if (shadows) shadows.addShadowCaster(hullBottom);

  // Bow (Mũi thuyền vát nhọn)
  const bow = MeshBuilder.CreateCylinder('boat-bow', {
    height: 0.38,
    diameterTop: 0.04,
    diameterBottom: 1.15,
    tessellation: 3,
  }, scene);
  bow.position.set(1.65, 0.22, 0);
  bow.rotation.z = Math.PI / 2;
  bow.material = matHullWood;
  bow.parent = boatRoot;

  // Stern (Đuôi thuyền)
  const stern = MeshBuilder.CreateBox('boat-stern', {
    width: 0.14,
    height: 0.38,
    depth: 1.12,
  }, scene);
  stern.position.set(-1.42, 0.22, 0);
  stern.material = matHullWood;
  stern.parent = boatRoot;

  // Port and Starboard gunwales (Mạn thuyền)
  [-0.56, 0.56].forEach((gz, sideIdx) => {
    const gunwale = MeshBuilder.CreateBox(`boat-gunwale-${sideIdx}`, {
      width: 2.85,
      height: 0.36,
      depth: 0.12,
    }, scene);
    gunwale.position.set(0, 0.22, gz);
    gunwale.material = matHullWood;
    gunwale.parent = boatRoot;
  });

  // 2 Wooden Bench Thwarts (Ghế ngồi gỗ)
  [-0.5, 0.5].forEach((bx, bIdx) => {
    const bench = MeshBuilder.CreateBox(`boat-bench-${bIdx}`, {
      width: 0.32,
      height: 0.08,
      depth: 1.05,
    }, scene);
    bench.position.set(bx, 0.24, 0);
    bench.material = matSeatWood;
    bench.parent = boatRoot;
  });

  // Pair of Oars resting inside (Cặp mái chèo)
  [-0.15, 0.15].forEach((oz, oIdx) => {
    const oar = MeshBuilder.CreateCylinder(`boat-oar-${oIdx}`, {
      height: 2.2,
      diameter: 0.05,
      tessellation: 4,
    }, scene);
    oar.position.set(0, 0.34, oz);
    oar.rotation.z = 1.48;
    oar.rotation.y = 0.12 * (oIdx === 0 ? 1 : -1);
    oar.material = matOarWood;
    oar.parent = boatRoot;
  });

  // Mooring rope connecting bow to pier post
  const rope = MeshBuilder.CreateTube('boat-mooring-rope', {
    path: [
      new Vector3(1.8, 0.32, 0),
      new Vector3(2.5, 0.45, 0.6),
      new Vector3(3.2, 0.58, 1.2),
    ],
    radius: 0.025,
    tessellation: 4,
  }, scene);
  rope.material = matRope;
  rope.parent = boatRoot;

  // Gentle idle buoyancy animation (nhấp nhô & lắc nhẹ theo sóng)
  let animTime = 0;
  const baseY = boatRoot.position.y;
  scene.onBeforeRenderObservable.add(() => {
    animTime += 0.024;
    boatRoot.position.y = baseY + Math.sin(animTime) * 0.016;
    boatRoot.rotation.z = Math.sin(animTime * 0.8) * 0.022;
    boatRoot.rotation.x = Math.cos(animTime * 0.6) * 0.015;
  });

  return boatRoot;
}

/**
 * 6. Chibi River Stepping Stones (Bậc đá tròn bước qua suối).
 */
export function createChibiSteppingStones(scene, parent, startPoint, endPoint, count = 5) {
  const root = new TransformNode('stepping-stones-root', scene);
  if (parent) root.parent = parent;

  const matStone = new StandardMaterial('stepping-stone-mat', scene);
  matStone.diffuseColor = Color3.FromHexString('#94a3b8');
  matStone.ambientColor = Color3.FromHexString('#475569');
  matStone.specularColor = new Color3(0.12, 0.12, 0.12);
  matStone.specularPower = 28;

  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1);
    const sx = startPoint.x + (endPoint.x - startPoint.x) * t;
    const sz = startPoint.z + (endPoint.z - startPoint.z) * t;

    // Slight organic zigzag
    const zig = ((i % 2) - 0.5) * 0.45;
    const px = sx - (endPoint.z - startPoint.z) * 0.05 * zig;
    const pz = sz + (endPoint.x - startPoint.x) * 0.05 * zig;

    const stone = MeshBuilder.CreateCylinder(`stepping-stone-${i}`, {
      diameterTop: 0.95 + (i % 2) * 0.2,
      diameterBottom: 1.15,
      height: 0.28,
      tessellation: 8,
    }, scene);

    stone.position.set(px, 0.10, pz);
    stone.rotation.y = i * 1.1;
    stone.material = matStone;
    stone.parent = root;
    stone.receiveShadows = true;
  }

  return root;
}

/**
 * 7. Romantic Tree Swing hanging from a willow tree.
 */
export function createRomanticTreeSwing(scene, parent, { x, y = 0.08, z, rotationY = 0 }) {
  const node = new TransformNode(`tree-swing-${x.toFixed(0)}-${z.toFixed(0)}`, scene);
  node.position.set(x, y, z);
  node.rotation.y = rotationY;
  if (parent) node.parent = parent;

  const matWood = new StandardMaterial('swing-wood-mat', scene);
  matWood.diffuseColor = Color3.FromHexString('#b45309');
  matWood.ambientColor = Color3.FromHexString('#78350f');

  const matRope = new StandardMaterial('swing-rope-mat', scene);
  matRope.diffuseColor = Color3.FromHexString('#fde047');
  matRope.ambientColor = Color3.FromHexString('#ca8a04');

  // Wooden Seat Plank
  const seat = MeshBuilder.CreateBox('swing-seat', {
    width: 0.92,
    height: 0.08,
    depth: 0.36,
  }, scene);
  seat.position.set(0, 0.52, 0);
  seat.material = matWood;
  seat.parent = node;

  // 2 Ropes going up to tree branch
  [-0.38, 0.38].forEach((rx, idx) => {
    const rope = MeshBuilder.CreateCylinder(`swing-rope-${idx}`, {
      height: 2.8,
      diameter: 0.025,
      tessellation: 4,
    }, scene);
    rope.position.set(rx, 1.92, 0);
    rope.material = matRope;
    rope.parent = node;
  });

  return node;
}

/**
 * 8. Low-Lying River Mist Ribbon (Dải sương mù là đà ven sông/hồ).
 * Ultra-lightweight billboard ribbon with scrolling mist transparency.
 */
export function createLowLyingRiverMist(scene, parent, { path = [], width = 5.0, y = 0.14 }) {
  if (path.length < 2) return null;

  const root = new TransformNode('river-mist-root', scene);
  if (parent) root.parent = parent;

  // Dynamic texture with soft procedural smoke clouds
  let tex = null;
  try {
    tex = new DynamicTexture('river-mist-tex', { width: 128, height: 128 }, scene, false);
    const ctx = tex.getContext?.();
    if (ctx) {
      ctx.clearRect(0, 0, 128, 128);
      const grad = ctx.createLinearGradient(0, 0, 0, 128);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.35, 'rgba(235, 248, 255, 0.42)');
      grad.addColorStop(0.65, 'rgba(235, 248, 255, 0.42)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      tex.update();
    }
  } catch (err) {
    tex = null;
  }

  const matMist = new StandardMaterial('river-mist-mat', scene);
  if (tex) matMist.diffuseTexture = tex;
  matMist.diffuseColor = Color3.White();
  matMist.emissiveColor = Color3.FromHexString('#e0f2fe').scale(0.8);
  matMist.alpha = 0.38;
  matMist.disableLighting = true;
  matMist.backFaceCulling = false;
  matMist.zOffset = -3;

  const leftPath = [];
  const rightPath = [];

  for (let i = 0; i < path.length; i++) {
    const cur = path[i];
    const prev = i > 0 ? path[i - 1] : cur;
    const next = i < path.length - 1 ? path[i + 1] : cur;

    let tx = next.x - prev.x;
    let tz = next.z - prev.z;
    const len = Math.hypot(tx, tz) || 1;
    tx /= len;
    tz /= len;

    const nx = -tz;
    const nz = tx;
    const halfW = width * 0.5;

    leftPath.push(new Vector3(cur.x + nx * halfW, y, cur.z + nz * halfW));
    rightPath.push(new Vector3(cur.x - nx * halfW, y, cur.z - nz * halfW));
  }

  const ribbon = MeshBuilder.CreateRibbon('river-mist-ribbon', {
    pathArray: [leftPath, rightPath],
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  ribbon.material = matMist;
  ribbon.parent = root;
  ribbon.isPickable = false;

  // Gentle UV drift animation
  let driftOffset = 0;
  scene.onBeforeRenderObservable.add(() => {
    driftOffset += 0.0006;
    if (tex.uOffset !== undefined) tex.uOffset = driftOffset;
  });

  return root;
}

/**
 * 9. Bioluminescent Fireflies along riparian vegetation.
 */
export function createBioluminescentFireflies(scene, parent, { count = 18, center = { x: 170, z: 2 }, radius = 40, y = 0.6 }) {
  const root = new TransformNode('fireflies-system-root', scene);
  if (parent) root.parent = parent;

  const matGlow = new StandardMaterial('firefly-biolum-mat', scene);
  matGlow.diffuseColor = Color3.FromHexString('#bef264');
  matGlow.emissiveColor = Color3.FromHexString('#a3e635');
  matGlow.disableLighting = true;

  const fireflies = [];

  for (let i = 0; i < count; i++) {
    const ff = MeshBuilder.CreateSphere(`biolum-firefly-${i}`, {
      diameter: 0.14,
      segments: 3,
    }, scene);
    ff.material = matGlow;
    ff.parent = root;
    ff.isPickable = false;

    const baseAngle = (i / count) * Math.PI * 2;
    const baseDist = 12 + ((i * 17) % Math.round(radius - 12));
    const bx = center.x + Math.cos(baseAngle) * baseDist;
    const bz = center.z + Math.sin(baseAngle) * baseDist;

    fireflies.push({
      mesh: ff,
      bx,
      bz,
      by: y + (i % 3) * 0.35,
      phase: i * 0.6,
      speed: 0.5 + (i % 4) * 0.25,
    });
  }

  let time = 0;
  scene.onBeforeRenderObservable.add(() => {
    time += 0.018;
    for (let i = 0; i < fireflies.length; i++) {
      const f = fireflies[i];
      const t = time * f.speed + f.phase;
      f.mesh.position.x = f.bx + Math.sin(t * 0.7) * 1.6;
      f.mesh.position.z = f.bz + Math.cos(t * 0.5) * 1.6;
      f.mesh.position.y = f.by + Math.sin(t * 1.2) * 0.35;
      f.mesh.scaling.setAll(0.65 + Math.sin(t * 2.5) * 0.45);
    }
  });

  return root;
}

/**
 * 10. Lakeside Wildflower Meadow Clusters (Khóm hoa dại ven bờ hồ & thềm cỏ).
 * Multi-tiered floral accents: daisies, bellflowers, buttercups & lavender.
 */
export function createLakesideWildflowerMeadow(scene, parent, clusters = []) {
  const root = new TransformNode('lakeside-wildflowers-root', scene);
  if (parent) root.parent = parent;

  const matDaisyWhite = new StandardMaterial('wf-daisy-white', scene);
  matDaisyWhite.diffuseColor = Color3.White();
  matDaisyWhite.ambientColor = new Color3(0.5, 0.5, 0.5);

  const matDaisyYellow = new StandardMaterial('wf-daisy-yellow', scene);
  matDaisyYellow.diffuseColor = Color3.FromHexString('#facc15');

  const matFlowerPink = new StandardMaterial('wf-flower-pink', scene);
  matFlowerPink.diffuseColor = Color3.FromHexString('#f472b6');

  const matFlowerLavender = new StandardMaterial('wf-flower-lavender', scene);
  matFlowerLavender.diffuseColor = Color3.FromHexString('#c084fc');

  const matStem = new StandardMaterial('wf-stem-green', scene);
  matStem.diffuseColor = Color3.FromHexString('#65a30d');

  clusters.forEach((cl, cIdx) => {
    const clNode = new TransformNode(`wf-cluster-${cIdx}`, scene);
    clNode.position.set(cl.x, cl.y ?? 0.095, cl.z);
    clNode.parent = root;

    const count = cl.count || 5;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (cIdx * 0.8);
      const dist = 0.3 + ((i * 7) % 5) * 0.22;
      const fx = Math.cos(angle) * dist;
      const fz = Math.sin(angle) * dist;
      const h = 0.25 + (i % 3) * 0.10;

      // Stem
      const stem = MeshBuilder.CreateCylinder(`wf-stem-${cIdx}-${i}`, {
        height: h,
        diameter: 0.03,
        tessellation: 4,
      }, scene);
      stem.position.set(fx, h * 0.5, fz);
      stem.material = matStem;
      stem.parent = clNode;
      stem.isPickable = false;

      // Flower blossom
      const matChoice = (i + cIdx) % 3;
      const bloomMat = matChoice === 0 ? matDaisyWhite : (matChoice === 1 ? matFlowerPink : matFlowerLavender);
      const bloom = MeshBuilder.CreateSphere(`wf-bloom-${cIdx}-${i}`, {
        diameterX: 0.26,
        diameterY: 0.08,
        diameterZ: 0.26,
        segments: 4,
      }, scene);
      bloom.position.set(fx, h + 0.03, fz);
      bloom.material = bloomMat;
      bloom.parent = clNode;
      bloom.isPickable = false;

      // Yellow center
      const center = MeshBuilder.CreateSphere(`wf-center-${cIdx}-${i}`, { diameter: 0.10, segments: 3 }, scene);
      center.position.set(fx, h + 0.06, fz);
      center.material = matDaisyYellow;
      center.parent = clNode;
      center.isPickable = false;
    }
  });

  return root;
}

/**
 * 11. Chibi Dragonflies Gliding Over Water (Chuồn chuồn kim lướt mặt nước hồ).
 * Iridescent jewel-toned wings flutter rapidly as they hover above the shallows.
 */
export function createChibiDragonflies(scene, parent, count = 3, center = { x: 162, z: 6 }) {
  const root = new TransformNode('dragonflies-root', scene);
  if (parent) root.parent = parent;

  const matBody = new StandardMaterial('df-body-mat', scene);
  matBody.diffuseColor = Color3.FromHexString('#06b6d4'); // Cyan jade
  matBody.emissiveColor = Color3.FromHexString('#0891b2').scale(0.5);

  const matWing = new StandardMaterial('df-wing-mat', scene);
  matWing.diffuseColor = Color3.White();
  matWing.emissiveColor = Color3.FromHexString('#e0f2fe').scale(0.8);
  matWing.alpha = 0.55;
  matWing.backFaceCulling = false;

  const dragonflies = [];

  for (let d = 0; d < count; d++) {
    const dNode = new TransformNode(`dragonfly-${d}`, scene);
    dNode.parent = root;

    // Body
    const body = MeshBuilder.CreateCylinder(`df-body-${d}`, {
      height: 0.55,
      diameterTop: 0.05,
      diameterBottom: 0.02,
      tessellation: 6,
    }, scene);
    body.rotation.x = Math.PI / 2;
    body.material = matBody;
    body.parent = dNode;

    // Head
    const head = MeshBuilder.CreateSphere(`df-head-${d}`, { diameter: 0.10, segments: 4 }, scene);
    head.position.z = 0.28;
    head.material = matBody;
    head.parent = dNode;

    // Wings
    const wingsNode = new TransformNode(`df-wings-${d}`, scene);
    wingsNode.position.set(0, 0.03, 0.08);
    wingsNode.parent = dNode;

    [-1, 1].forEach((dir) => {
      const wing = MeshBuilder.CreateBox(`df-wing-${d}-${dir}`, { width: 0.36, height: 0.01, depth: 0.10 }, scene);
      wing.position.set(dir * 0.20, 0, 0);
      wing.material = matWing;
      wing.parent = wingsNode;
    });

    dragonflies.push({
      node: dNode,
      wings: wingsNode,
      baseX: center.x + (d - 1) * 8.5,
      baseZ: center.z + (d % 2 === 0 ? 6 : -6),
      speed: 0.7 + d * 0.25,
      phase: d * 1.8,
    });
  }

  let animT = 0;
  scene.onBeforeRenderObservable.add(() => {
    animT += 0.022;
    for (let i = 0; i < dragonflies.length; i++) {
      const df = dragonflies[i];
      const t = animT * df.speed + df.phase;

      const px = df.baseX + Math.sin(t * 0.9) * 4.2;
      const pz = df.baseZ + Math.cos(t * 0.7) * 4.2;
      const py = 0.35 + Math.sin(t * 1.5) * 0.12;

      // Heading direction
      const vx = Math.cos(t * 0.9) * 0.9;
      const vz = -Math.sin(t * 0.7) * 0.7;
      const heading = Math.atan2(vx, vz);

      df.node.position.set(px, py, pz);
      df.node.rotation.y = heading;

      // Wing flutter animation
      df.wings.rotation.z = Math.sin(animT * 42.0) * 0.35;
    }
  });

  return root;
}

/**
 * 12. Drifting Petals on Water Surface (Cánh hoa sen/đào bồng bềnh trôi).
 */
export function createDriftingPetals(scene, parent, count = 16, bounds = { minX: 145, maxX: 210, minZ: -40, maxZ: 40 }) {
  const root = new TransformNode('drifting-petals-root', scene);
  if (parent) root.parent = parent;

  const matPetal = new StandardMaterial('drifting-petal-mat', scene);
  matPetal.diffuseColor = Color3.FromHexString('#fbcfe8'); // Soft sakura pink
  matPetal.emissiveColor = Color3.FromHexString('#f472b6').scale(0.35);
  matPetal.backFaceCulling = false;

  const petals = [];

  for (let p = 0; p < count; p++) {
    const petal = MeshBuilder.CreateSphere(`petal-${p}`, {
      diameterX: 0.22,
      diameterY: 0.02,
      diameterZ: 0.32,
      segments: 3,
    }, scene);
    petal.material = matPetal;
    petal.parent = root;
    petal.isPickable = false;

    const px = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
    const pz = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);
    petal.position.set(px, 0.083, pz);

    petals.push({
      mesh: petal,
      baseX: px,
      baseZ: pz,
      driftSpeed: 0.15 + Math.random() * 0.12,
      rotSpeed: 0.3 + Math.random() * 0.5,
      bobPhase: Math.random() * Math.PI * 2,
    });
  }

  let timeSec = 0;
  scene.onBeforeRenderObservable.add(() => {
    timeSec += 0.016;
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.mesh.position.z += p.driftSpeed * 0.016 * 1.8;
      p.mesh.position.x += Math.sin(timeSec + p.bobPhase) * 0.004;
      p.mesh.rotation.y += p.rotSpeed * 0.016;

      // Wrap around bounds
      if (p.mesh.position.z > bounds.maxZ) {
        p.mesh.position.z = bounds.minZ;
      }
    }
  });

  return root;
}

/**
 * 13. Lakeside Rustic Bench & Warm Lantern (Ghế gỗ mộc & đèn bão ngắm cảnh).
 */
export function createLakesideRusticBench(scene, parent, { x, y = 0.095, z, rotationY = 0 }, shadows = null) {
  const node = new TransformNode(`rustic-bench-${x.toFixed(0)}-${z.toFixed(0)}`, scene);
  node.position.set(x, y, z);
  node.rotation.y = rotationY;
  if (parent) node.parent = parent;

  const matWood = new StandardMaterial('bench-wood-mat', scene);
  matWood.diffuseColor = Color3.FromHexString('#92400e');
  matWood.ambientColor = Color3.FromHexString('#451a03');

  const matPost = new StandardMaterial('bench-post-mat', scene);
  matPost.diffuseColor = Color3.FromHexString('#78350f');

  const matLanternGlow = new StandardMaterial('bench-lantern-glow', scene);
  matLanternGlow.diffuseColor = Color3.FromHexString('#fef08a');
  matLanternGlow.emissiveColor = Color3.FromHexString('#f59e0b').scale(0.9);
  matLanternGlow.disableLighting = true;

  // Seat
  const seat = MeshBuilder.CreateBox('bench-seat-mesh', { width: 1.8, height: 0.08, depth: 0.55 }, scene);
  seat.position.set(0, 0.42, 0);
  seat.material = matWood;
  seat.parent = node;
  if (shadows) shadows.addShadowCaster(seat);

  // Backrest
  const back = MeshBuilder.CreateBox('bench-back-mesh', { width: 1.8, height: 0.50, depth: 0.08 }, scene);
  back.position.set(0, 0.72, -0.24);
  back.material = matWood;
  back.parent = node;
  if (shadows) shadows.addShadowCaster(back);

  // 4 Legs
  [[-0.75, -0.2], [0.75, -0.2], [-0.75, 0.2], [0.75, 0.2]].forEach(([lx, lz], idx) => {
    const leg = MeshBuilder.CreateCylinder(`bench-leg-${idx}`, { height: 0.45, diameter: 0.09 }, scene);
    leg.position.set(lx, 0.22, lz);
    leg.material = matPost;
    leg.parent = node;
  });

  // Lantern post beside bench
  const lPost = MeshBuilder.CreateCylinder('bench-lantern-post', { height: 1.5, diameter: 0.08 }, scene);
  lPost.position.set(1.2, 0.75, 0);
  lPost.material = matPost;
  lPost.parent = node;

  const lantern = MeshBuilder.CreateSphere('bench-lantern-lamp', { diameter: 0.32, segments: 6 }, scene);
  lantern.position.set(1.2, 1.45, 0);
  lantern.material = matLanternGlow;
  lantern.parent = node;

  return node;
}

/**
 * 14. Riverside Scenic Wooden Lookout Platform (Sàn gỗ ngắm cảnh ven sông).
 */
export function createRiversideScenicDeck(scene, parent, { x, y = 0.12, z, rotationY = 0 }, shadows = null) {
  const root = new TransformNode(`river-scenic-deck-${x.toFixed(0)}-${z.toFixed(0)}`, scene);
  root.position.set(x, y, z);
  root.rotation.y = rotationY;
  if (parent) root.parent = parent;

  const matDeck = new StandardMaterial('scenic-deck-wood', scene);
  matDeck.diffuseColor = Color3.FromHexString('#b45309');
  matDeck.ambientColor = Color3.FromHexString('#78350f');

  const matPost = new StandardMaterial('scenic-deck-post', scene);
  matPost.diffuseColor = Color3.FromHexString('#78350f');

  // Deck platform 4.2m x 3.2m
  const deck = MeshBuilder.CreateBox('scenic-deck-floor', { width: 4.2, height: 0.14, depth: 3.2 }, scene);
  deck.position.set(0, 0.07, 0);
  deck.material = matDeck;
  deck.parent = root;
  if (shadows) shadows.addShadowCaster(deck);

  // Perimeter handrails along 3 sides
  [-2.0, 2.0].forEach((px, idx) => {
    const post = MeshBuilder.CreateCylinder(`deck-post-${idx}`, { height: 1.05, diameter: 0.14 }, scene);
    post.position.set(px, 0.55, 1.5);
    post.material = matPost;
    post.parent = root;
  });

  const rail = MeshBuilder.CreateBox('deck-front-rail', { width: 4.2, height: 0.10, depth: 0.12 }, scene);
  rail.position.set(0, 1.02, 1.5);
  rail.material = matPost;
  rail.parent = root;

  // Mooring bollard with rope
  const bollard = MeshBuilder.CreateCylinder('deck-bollard', { height: 0.75, diameter: 0.24 }, scene);
  bollard.position.set(1.8, 0.45, 1.3);
  bollard.material = matPost;
  bollard.parent = root;

  return root;
}

