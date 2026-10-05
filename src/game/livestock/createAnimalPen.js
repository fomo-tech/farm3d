import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { buildHolsteinCow, buildFluffySheep, buildHenWithChicks } from './createDetailedAnimals.js';

function material(scene, name, color, emissive = null) {
  let value = scene.getMaterialByName(name);
  if (!value) {
    value = new StandardMaterial(name, scene);
    value.diffuseColor = Color3.FromHexString(color);
    value.specularColor = Color3.Black();
    if (emissive) value.emissiveColor = Color3.FromHexString(emissive);
  }
  return value;
}

function createHayBale(scene, x, y, z, rotationY, materials) {
  const root = new TransformNode('hay-bale', scene);
  root.position.set(x, y, z);
  root.rotation.y = rotationY;

  // Round Golden Bale
  const bale = MeshBuilder.CreateCylinder('hay-roll', {
    height: 1.2,
    diameter: 1.05,
    tessellation: 12,
  }, scene);
  bale.rotation.z = Math.PI / 2;
  bale.position.y = 0.52;
  bale.material = materials.straw;
  bale.parent = root;

  // Straps (rope bands)
  [-0.32, 0.32].forEach((sx, i) => {
    const strap = MeshBuilder.CreateCylinder(`hay-strap-${i}`, {
      height: 0.08,
      diameter: 1.08,
      tessellation: 12,
    }, scene);
    strap.rotation.z = Math.PI / 2;
    strap.position.set(sx, 0.52, 0);
    strap.material = materials.strap;
    strap.parent = root;
  });

  return root;
}

function createFeedTrough(scene, x, z, materials) {
  const root = new TransformNode('feed-trough', scene);
  root.position.set(x, 0, z);

  // Wooden trough box
  const box = MeshBuilder.CreateBox('trough-box', { width: 2.2, height: 0.5, depth: 0.8 }, scene);
  box.position.y = 0.35;
  box.material = materials.wood;
  box.parent = root;

  // Golden corn & fresh clover feed inside
  const feed = MeshBuilder.CreateBox('trough-feed', { width: 2.0, height: 0.12, depth: 0.65 }, scene);
  feed.position.y = 0.52;
  feed.material = materials.yellow;
  feed.parent = root;

  // 4 chân máng cỏ
  [[-0.95, -0.3], [0.95, -0.3], [-0.95, 0.3], [0.95, 0.3]].forEach(([px, pz], idx) => {
    const leg = MeshBuilder.CreateCylinder(`trough-leg-${idx}`, { height: 0.25, diameter: 0.12 }, scene);
    leg.position.set(px, 0.12, pz);
    leg.material = materials.wood;
    leg.parent = root;
  });

  return root;
}

function createWaterTrough(scene, x, z, materials) {
  const root = new TransformNode('water-trough', scene);
  root.position.set(x, 0, z);

  const tub = MeshBuilder.CreateCylinder('water-tub', {
    height: 0.55,
    diameter: 1.1,
    tessellation: 12,
  }, scene);
  tub.position.y = 0.28;
  tub.material = materials.wood;
  tub.parent = root;

  const waterSurface = MeshBuilder.CreateCylinder('water-surface', {
    height: 0.05,
    diameter: 0.98,
    tessellation: 12,
  }, scene);
  waterSurface.position.y = 0.5;
  waterSurface.material = materials.water;
  waterSurface.parent = root;

  return root;
}

function createChickenCoopHouse(scene, x, z, materials, shadows) {
  const root = new TransformNode('chicken-coop-house', scene);
  root.position.set(x, 0, z);

  // 4 Cọc nhà chuồng nâng cao tránh ẩm ướt
  [[-0.7, -0.6], [0.7, -0.6], [-0.7, 0.6], [0.7, 0.6]].forEach(([px, pz], idx) => {
    const stilt = MeshBuilder.CreateCylinder(`coop-stilt-${idx}`, { height: 0.6, diameter: 0.14 }, scene);
    stilt.position.set(px, 0.3, pz);
    stilt.material = materials.wood;
    stilt.parent = root;
  });

  // Coop raised body
  const body = MeshBuilder.CreateBox('coop-body', { width: 1.8, height: 1.35, depth: 1.5 }, scene);
  body.position.y = 1.25;
  body.material = materials.coopWall;
  body.parent = root;

  // Cửa tổ gà tròn nhỏ
  const doorHole = MeshBuilder.CreateCylinder('coop-door-hole', { height: 0.05, diameter: 0.55, tessellation: 8 }, scene);
  doorHole.rotation.x = Math.PI / 2;
  doorHole.position.set(0, 0.95, 0.76);
  doorHole.material = materials.wood;
  doorHole.parent = root;

  // Red Steep Roof
  const roof = MeshBuilder.CreateCylinder('coop-roof', { diameter: 2.1, height: 1.95, tessellation: 3 }, scene);
  roof.rotation.z = Math.PI / 6;
  roof.rotation.y = Math.PI / 2;
  roof.position.y = 2.2;
  roof.material = materials.coopRoof;
  roof.parent = root;

  // Cầu thang leo nhỏ cho đàn gà
  const ramp = MeshBuilder.CreateBox('coop-ramp', { width: 0.5, height: 0.06, depth: 1.4 }, scene);
  ramp.rotation.x = -0.52;
  ramp.position.set(0, 0.38, 1.15);
  ramp.material = materials.wood;
  ramp.parent = root;

  // Nấc thang chống trượt
  for (let s = 0; s < 4; s++) {
    const rung = MeshBuilder.CreateBox(`coop-rung-${s}`, { width: 0.44, height: 0.04, depth: 0.05 }, scene);
    rung.position.set(0, 0.2 + s * 0.12, 0.8 + s * 0.2);
    rung.material = materials.wood;
    rung.parent = root;
  }

  [body, roof].forEach(m => shadows?.addShadowCaster(m));
  return root;
}

export function createAnimalPen(scene, origin, shadows) {
  // Đã xóa chuồng gia súc tại (88, 112) theo yêu cầu người dùng
  return {
    update() {},
    dispose() {},
  };
  const materials = {
    wood: material(scene, 'pen-wood-deep', '#795548'),
    postWood: material(scene, 'pen-post-wood', '#5d4037'),
    coopWall: material(scene, 'pen-coop-wall', '#d7ccc8'),
    coopRoof: material(scene, 'pen-coop-roof', '#d32f2f'),
    grass: material(scene, 'pen-grass-lush', '#7cb342'),
    yellow: material(scene, 'pen-feed-yellow', '#fdd835'),
    straw: material(scene, 'pen-straw-gold', '#fbc02d'),
    strap: material(scene, 'pen-strap-brown', '#4e342e'),
    water: material(scene, 'pen-water-blue', '#4fc3f7', '#0288d1'),
    flowerWhite: material(scene, 'pen-flower-white', '#ffffff'),
    flowerPink: material(scene, 'pen-flower-pink', '#f48fb1'),
  };

  // Nền cỏ chuồng xanh tươi
  const floor = MeshBuilder.CreateGround('animal-pen', { width: 14, height: 10 }, scene);
  floor.position.set(origin.x, 0.12, origin.z);
  floor.material = materials.grass;
  floor.receiveShadows = true;

  // Hàng rào gỗ mộc có cọc trụ đầu bo tròn
  const fencePosts = [];
  const addFenceSegment = (x1, z1, x2, z2) => {
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const angle = Math.atan2(x2 - x1, z2 - z1);
    const midX = (x1 + x2) / 2;
    const midZ = (z1 + z2) / 2;

    // 2 thanh giằng ngang
    [0.35, 0.65].forEach((ry, rIdx) => {
      const rail = MeshBuilder.CreateBox(`pen-rail-${rIdx}`, {
        width: 0.12,
        height: 0.12,
        depth: dist,
      }, scene);
      rail.position.set(midX, ry, midZ);
      rail.rotation.y = angle;
      rail.material = materials.wood;
      shadows?.addShadowCaster(rail);
    });

    // Cọc rào
    const numPosts = Math.max(2, Math.round(dist / 2.2));
    for (let p = 0; p <= numPosts; p++) {
      const t = p / numPosts;
      const px = x1 + (x2 - x1) * t;
      const pz = z1 + (z2 - z1) * t;

      const post = MeshBuilder.CreateCylinder(`pen-post-${px.toFixed(1)}-${pz.toFixed(1)}`, {
        height: 0.95,
        diameter: 0.2,
        tessellation: 8,
      }, scene);
      post.position.set(px, 0.47, pz);
      post.material = materials.postWood;
      post.parent = null;
      shadows?.addShadowCaster(post);
      fencePosts.push(post);
    }
  };

  const halfW = 6.8;
  const halfD = 4.8;
  addFenceSegment(origin.x - halfW, origin.z - halfD, origin.x + halfW, origin.z - halfD); // Cạnh trên
  addFenceSegment(origin.x - halfW, origin.z + halfD, origin.x + halfW, origin.z + halfD); // Cạnh dưới
  addFenceSegment(origin.x - halfW, origin.z - halfD, origin.x - halfW, origin.z + halfD); // Cạnh trái
  addFenceSegment(origin.x + halfW, origin.z - halfD, origin.x + halfW, origin.z + halfD); // Cạnh phải

  // Đống cuộn rơm vàng chất góc chuồng
  createHayBale(scene, origin.x - 5.0, 0, origin.z + 3.0, 0.25, materials);
  createHayBale(scene, origin.x - 4.8, 0, origin.z + 1.6, 1.15, materials);
  createHayBale(scene, origin.x - 4.9, 0.95, origin.z + 2.3, 0.65, materials);

  // Máng thức ăn gia súc
  createFeedTrough(scene, origin.x - 1.2, origin.z - 3.2, materials);

  // Máng nước uống cho vật nuôi
  createWaterTrough(scene, origin.x + 1.8, origin.z - 3.2, materials);

  // Chuồng gà mái ngói đỏ
  createChickenCoopHouse(scene, origin.x - 4.2, origin.z - 2.6, materials, shadows);

  // Khóm hoa dại mọc điểm xuyết bên góc rào
  const flowerColors = [materials.flowerWhite, materials.flowerPink];
  [[-5.8, 3.8], [-5.5, 4.2], [5.8, 3.8], [5.5, -4.0]].forEach(([fx, fz], fIdx) => {
    const flower = MeshBuilder.CreateSphere(`pen-flower-${fIdx}`, { diameter: 0.22, segments: 4 }, scene);
    flower.position.set(origin.x + fx, 0.2, origin.z + fz);
    flower.material = flowerColors[fIdx % flowerColors.length];
  });

  // === ĐỘNG VẬT NÔNG TRẠI 3D SỐNG ĐỘNG ===
  // 1. Bò sữa Hà Lan (Holstein Dairy Cow)
  const cowObj = buildHolsteinCow(scene, 'pen-cow-holstein', shadows);
  cowObj.root.position.set(origin.x + 3.4, 0, origin.z + 0.8);
  cowObj.root.rotation.y = -Math.PI / 4;

  // 2. Cừu bông lông len xù (Fluffy Cloud Sheep)
  const sheepObj = buildFluffySheep(scene, 'pen-sheep-fluffy', shadows);
  sheepObj.root.position.set(origin.x + 1.2, 0, origin.z + 1.8);
  sheepObj.root.rotation.y = Math.PI / 3;

  // 3. Gà mẹ & đàn gà con
  const henObj = buildHenWithChicks(scene, 'pen-hen-family', shadows);
  henObj.root.position.set(origin.x - 2.2, 0, origin.z + 0.5);

  const cowOrigin = { x: cowObj.root.position.x, z: cowObj.root.position.z };
  const sheepOrigin = { x: sheepObj.root.position.x, z: sheepObj.root.position.z };
  const henOrigin = { x: henObj.root.position.x, z: henObj.root.position.z };

  return {
    update(time) {
      // Bò sữa di chuyển nhẹ nhàng, gặm cỏ, phe phẩy đuôi
      const cowMoveT = time * 0.0003;
      const cowX = cowOrigin.x + Math.sin(cowMoveT) * 0.7;
      const cowZ = cowOrigin.z + Math.cos(cowMoveT * 0.8) * 0.5;
      const cowDX = cowX - cowObj.root.position.x;
      const cowDZ = cowZ - cowObj.root.position.z;
      cowObj.root.position.x = cowX;
      cowObj.root.position.z = cowZ;
      if (cowDX * cowDX + cowDZ * cowDZ > 0.00001) {
        cowObj.root.rotation.y = Math.atan2(cowDX, cowDZ);
      }
      cowObj.animate(time, true);

      // Cừu bông tung tăng nhong nhong
      const sheepMoveT = time * 0.0004 + 1.5;
      const sheepX = sheepOrigin.x + Math.sin(sheepMoveT) * 0.85;
      const sheepZ = sheepOrigin.z + Math.cos(sheepMoveT * 0.7) * 0.6;
      const sheepDX = sheepX - sheepObj.root.position.x;
      const sheepDZ = sheepZ - sheepObj.root.position.z;
      sheepObj.root.position.x = sheepX;
      sheepObj.root.position.z = sheepZ;
      if (sheepDX * sheepDX + sheepDZ * sheepDZ > 0.00001) {
        sheepObj.root.rotation.y = Math.atan2(sheepDX, sheepDZ);
      }
      sheepObj.animate(time, true);

      // Gà mẹ và đàn con loanh quanh mổ hạt
      const henMoveT = time * 0.0005 + 3.0;
      henObj.root.position.x = henOrigin.x + Math.sin(henMoveT) * 0.5;
      henObj.root.position.z = henOrigin.z + Math.cos(henMoveT * 0.9) * 0.4;
      henObj.animate(time);
    },
  };
}
