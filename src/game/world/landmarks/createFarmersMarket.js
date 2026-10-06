import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';

function makeMat(scene, name, hex, emissiveHex = null) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.35);
  m.specularColor = new Color3(0.08, 0.08, 0.08);
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

/**
 * Tạo thùng gỗ chứa nông sản
 */
function createCrate(scene, x, y, z, parent, rotY = 0, rotX = 0) {
  const crateMat = makeMat(scene, 'market-crate-mat', '#b45309');
  const box = MeshBuilder.CreateBox('produce-crate', { width: 1.1, height: 0.55, depth: 0.8 }, scene);
  box.position.set(x, y, z);
  box.rotation.y = rotY;
  box.rotation.x = rotX;
  box.material = crateMat;
  box.parent = parent;
  return box;
}

/**
 * Tạo bảng hiệu viết phấn đen sắc nét cho quầy hàng (1024x256 High-Res)
 */
function createStallSign(scene, text, colorHex, parent, width = 3.6, height = 0.75, y = 3.5) {
  const dt = new DynamicTexture(`stall-sign-${text}`, { width: 1024, height: 256 }, scene, false, Texture.TRILINEAR_SAMPLINGMODE);
  dt.anisotropicFilteringLevel = 16;
  dt.hasAlpha = true;
  const ctx = dt.getContext();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, 1024, 256);
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(12, 12, 1000, 232, 40);
  ctx.fill();
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 16;
  ctx.stroke();
  dt.drawText(text, null, 152, 'bold 72px "Segoe UI", Arial, sans-serif', '#ffffff', null, true, true);

  const mat = new StandardMaterial(`stall-sign-mat-${text}`, scene);
  mat.diffuseTexture = dt;
  mat.emissiveColor = Color3.FromHexString(colorHex).scale(0.7);
  mat.disableLighting = true;

  const plane = MeshBuilder.CreatePlane(`stall-sign-plane-${text}`, { width, height }, scene);
  plane.position.set(0, y, 1.25);
  plane.material = mat;
  plane.parent = parent;
  return plane;
}

/**
 * Tạo khung quầy hàng nông thôn với mái bạt sọc uốn cong
 */
function* createBaseStallSteps(scene, name, stripeColorHex, parent, shadows) {
  const stallRoot = new TransformNode(name, scene);
  stallRoot.parent = parent;

  const matWood = makeMat(scene, `${name}-wood`, '#78350f');
  const matCounter = makeMat(scene, `${name}-counter`, '#92400e');
  const matStripe1 = makeMat(scene, `${name}-s1`, stripeColorHex);
  const matStripe2 = makeMat(scene, `${name}-s2`, '#fefce8');

  // 1. Quầy bán hàng (Counter Table)
  const counter = MeshBuilder.CreateBox(`${name}-counter-mesh`, { width: 4.4, height: 1.15, depth: 2.2 }, scene);
  counter.position.set(0, 0.58, 0);
  counter.material = matCounter;
  counter.parent = stallRoot;
  shadows?.addShadowCaster(counter);

  // Kệ gỗ phía trước thấp hơn để đặt khay/thùng trưng bày
  const frontShelf = MeshBuilder.CreateBox(`${name}-front-shelf`, { width: 4.2, height: 0.15, depth: 0.7 }, scene);
  frontShelf.position.set(0, 0.65, 1.15);
  frontShelf.material = matWood;
  frontShelf.parent = stallRoot;
  yield;

  // 2. 4 Cột gỗ chống mái bạt
  const postCoords = [
    [-2.0, 1.05], [2.0, 1.05],
    [-2.0, -1.05], [2.0, -1.05]
  ];
  postCoords.forEach(([px, pz], idx) => {
    const post = MeshBuilder.CreateBox(`${name}-post-${idx}`, { width: 0.18, height: 2.9, depth: 0.18 }, scene);
    post.position.set(px, 1.45, pz);
    post.material = matWood;
    post.parent = stallRoot;
    shadows?.addShadowCaster(post);
  });
  yield;

  // 3. Mái bạt sọc lượn sóng (Striped Awning Roof)
  const awningSlices = 7;
  const sliceWidth = 4.8 / awningSlices;
  for (let i = 0; i < awningSlices; i++) {
    const sx = -2.4 + sliceWidth / 2 + i * sliceWidth;
    const slice = MeshBuilder.CreateBox(`${name}-awning-slice-${i}`, {
      width: sliceWidth - 0.02,
      height: 0.15,
      depth: 2.8,
    }, scene);
    slice.position.set(sx, 2.95, 0.15);
    // Dốc nhẹ về phía trước
    slice.rotation.x = 0.14;
    slice.material = (i % 2 === 0) ? matStripe1 : matStripe2;
    slice.parent = stallRoot;
    shadows?.addShadowCaster(slice);

    // Diềm bạt thả rủ phía trước (Valance)
    const valance = MeshBuilder.CreateBox(`${name}-valance-${i}`, {
      width: sliceWidth - 0.02,
      height: 0.35,
      depth: 0.08,
    }, scene);
    valance.position.set(sx, 2.7, 1.5);
    valance.material = (i % 2 === 0) ? matStripe1 : matStripe2;
    valance.parent = stallRoot;
    yield;
  }

  return { stallRoot, matWood };
}

/**
 * 1. Quầy Nông Sản Tươi Sống (Fresh Produce Stall)
 */
function* createProduceStallSteps(scene, position, parent, shadows) {
  const { stallRoot } = yield* createBaseStallSteps(scene, 'produce-stall', '#ef4444', parent, shadows);
  stallRoot.position.set(position.x, position.y, position.z);

  createStallSign(scene, 'NÔNG SẢN TƯƠI SẠCH', '#ef4444', stallRoot, 3.8, 0.75, 3.4);
  yield;

  // Thùng 1: Táo đỏ căng bóng
  const crateApple = createCrate(scene, -1.3, 0.85, 1.0, stallRoot, 0.1, 0.15);
  const matApple = makeMat(scene, 'mat-apple', '#dc2626', '#b91c1c');
  for (let ax = -0.3; ax <= 0.3; ax += 0.3) {
    for (let az = -0.2; az <= 0.2; az += 0.2) {
      const apple = MeshBuilder.CreateSphere('apple', { diameter: 0.22, segments: 6 }, scene);
      apple.position.set(-1.3 + ax, 1.1, 1.0 + az);
      apple.material = matApple;
      apple.parent = stallRoot;
      yield;
    }
  }

  // Thùng 2: Cà rốt cam tươi có cuống lá
  const crateCarrot = createCrate(scene, 0, 0.85, 1.0, stallRoot, -0.05, 0.15);
  const matCarrot = makeMat(scene, 'mat-carrot', '#f97316');
  const matLeaf = makeMat(scene, 'mat-leaf', '#16a34a');
  for (let cx = -0.35; cx <= 0.35; cx += 0.24) {
    const carrot = MeshBuilder.CreateCylinder('carrot', { diameterTop: 0.14, diameterBottom: 0.02, height: 0.45 }, scene);
    carrot.position.set(cx, 1.15, 1.0);
    carrot.rotation.x = Math.PI / 3;
    carrot.material = matCarrot;
    carrot.parent = stallRoot;

    const leaf = MeshBuilder.CreateSphere('carrot-leaf', { diameter: 0.12, segments: 4 }, scene);
    leaf.position.set(cx, 1.3, 0.85);
    leaf.material = matLeaf;
    leaf.parent = stallRoot;
    yield;
  }

  // Thùng 3: Dưa hấu to sọc xanh tròn
  const crateMelon = createCrate(scene, 1.3, 0.85, 1.0, stallRoot, 0.08, 0.15);
  const matMelon = makeMat(scene, 'mat-melon', '#15803d');
  [-0.22, 0.22].forEach((mx) => {
    const melon = MeshBuilder.CreateSphere('watermelon', { diameterX: 0.4, diameterY: 0.35, diameterZ: 0.35, segments: 8 }, scene);
    melon.position.set(1.3 + mx, 1.15, 1.0);
    melon.material = matMelon;
    melon.parent = stallRoot;
    shadows?.addShadowCaster(melon);
  });

  // Bí ngô vàng khía tròn trên mặt bàn chính
  const matPumpkin = makeMat(scene, 'mat-pumpkin', '#ea580c');
  const pumpkin = MeshBuilder.CreateSphere('pumpkin', { diameterX: 0.65, diameterY: 0.45, diameterZ: 0.65, segments: 10 }, scene);
  pumpkin.position.set(-0.8, 1.4, -0.2);
  pumpkin.material = matPumpkin;
  pumpkin.parent = stallRoot;
  shadows?.addShadowCaster(pumpkin);

  // Chiếc cân đĩa đồng thau hoài cổ
  const matBrass = makeMat(scene, 'mat-scale-brass', '#f59e0b', '#d97706');
  const scaleBase = MeshBuilder.CreateCylinder('scale-base', { diameter: 0.35, height: 0.08 }, scene);
  scaleBase.position.set(0.8, 1.2, -0.2);
  scaleBase.material = matBrass;
  scaleBase.parent = stallRoot;

  const scalePole = MeshBuilder.CreateCylinder('scale-pole', { diameter: 0.06, height: 0.5 }, scene);
  scalePole.position.set(0.8, 1.45, -0.2);
  scalePole.material = matBrass;
  scalePole.parent = stallRoot;

  const scaleBeam = MeshBuilder.CreateBox('scale-beam', { width: 0.55, height: 0.04, depth: 0.04 }, scene);
  scaleBeam.position.set(0.8, 1.7, -0.2);
  scaleBeam.material = matBrass;
  scaleBeam.parent = stallRoot;
}

/**
 * 2. Quầy Hoa Tươi & Hạt Giống Thần Kỳ (Flora & Seeds Stall)
 */
function* createFlowerStallSteps(scene, position, parent, shadows) {
  const { stallRoot } = yield* createBaseStallSteps(scene, 'flower-stall', '#eab308', parent, shadows);
  stallRoot.position.set(position.x, position.y, position.z);

  createStallSign(scene, 'HOA TƯƠI & HẠT GIỐNG', '#eab308', stallRoot, 3.8, 0.75, 3.4);
  yield;

  const matPot = makeMat(scene, 'mat-flower-pot', '#c2410c');
  const flowerColors = ['#ec4899', '#8b5cf6', '#3b82f6', '#f59e0b'];

  // Hàng chậu hoa đất nung trên kệ trước
  [-1.4, -0.5, 0.5, 1.4].forEach((px, i) => {
    const pot = MeshBuilder.CreateCylinder(`pot-${i}`, { diameterTop: 0.45, diameterBottom: 0.3, height: 0.4 }, scene);
    pot.position.set(px, 0.9, 1.05);
    pot.material = matPot;
    pot.parent = stallRoot;

    // Hoa nở trong chậu
    const flower = MeshBuilder.CreateSphere(`pot-flower-${i}`, { diameter: 0.36, segments: 6 }, scene);
    flower.position.set(px, 1.22, 1.05);
    flower.material = makeMat(scene, `pot-flower-mat-${i}`, flowerColors[i], flowerColors[i]);
    flower.parent = stallRoot;
  });

  // Bình tưới hoa vintage màu xanh rêu
  const matCan = makeMat(scene, 'mat-watering-can', '#059669');
  const canBody = MeshBuilder.CreateCylinder('can-body', { diameter: 0.32, height: 0.42 }, scene);
  canBody.position.set(-1.0, 1.4, -0.3);
  canBody.material = matCan;
  canBody.parent = stallRoot;

  const canSpout = MeshBuilder.CreateCylinder('can-spout', { diameterTop: 0.06, diameterBottom: 0.1, height: 0.35 }, scene);
  canSpout.position.set(-0.78, 1.5, -0.3);
  canSpout.rotation.z = -Math.PI / 4;
  canSpout.material = matCan;
  canSpout.parent = stallRoot;

  // Các bao tải hạt giống nhỏ buộc nơ
  const matSack = makeMat(scene, 'mat-seed-sack', '#d97706');
  [-0.1, 0.5, 1.1].forEach((sx, idx) => {
    const sack = MeshBuilder.CreateSphere(`seed-sack-${idx}`, { diameterX: 0.38, diameterY: 0.45, diameterZ: 0.38, segments: 6 }, scene);
    sack.position.set(sx, 1.35, -0.3);
    sack.material = matSack;
    sack.parent = stallRoot;
  });
}

/**
 * 3. Quầy Bánh Mì Lò Củi & Bơ Sữa (Artisan Bakery Stall)
 */
function* createBakeryStallSteps(scene, position, parent, shadows) {
  const { stallRoot } = yield* createBaseStallSteps(scene, 'bakery-stall', '#d97706', parent, shadows);
  stallRoot.position.set(position.x, position.y, position.z);

  createStallSign(scene, 'BÁNH MÌ & BƠ SỮA', '#d97706', stallRoot, 3.8, 0.75, 3.4);
  yield;

  const matBread = makeMat(scene, 'mat-bread-crust', '#b45309');
  const matCheese = makeMat(scene, 'mat-cheese-yellow', '#fde047', '#eab308');
  const matMilkCan = makeMat(scene, 'mat-milk-can', '#cbd5e1');

  // Khay bánh mì Baguette dài giòn tan
  [-1.2, -0.8].forEach((bx, idx) => {
    const baguette = MeshBuilder.CreateCylinder(`baguette-${idx}`, { diameter: 0.14, height: 0.9 }, scene);
    baguette.position.set(bx, 1.25, 0.95);
    baguette.rotation.x = Math.PI / 3;
    baguette.rotation.y = 0.2;
    baguette.material = matBread;
    baguette.parent = stallRoot;
  });

  // Tảng phô mai tam giác vàng óng
  const cheese = MeshBuilder.CreateCylinder('cheese-wedge', {
    diameter: 0.65,
    height: 0.25,
    tessellation: 3,
  }, scene);
  cheese.position.set(0.1, 1.3, 0.95);
  cheese.material = matCheese;
  cheese.parent = stallRoot;

  // Bình đựng sữa tươi béo ngậy bằng thiếc sáng bóng
  const milkCan = MeshBuilder.CreateCylinder('milk-can', {
    diameterTop: 0.3,
    diameterBottom: 0.45,
    height: 0.65,
  }, scene);
  milkCan.position.set(1.2, 1.48, -0.2);
  milkCan.material = matMilkCan;
  milkCan.parent = stallRoot;
  shadows?.addShadowCaster(milkCan);

  // Nắp bình sữa
  const milkLid = MeshBuilder.CreateCylinder('milk-lid', { diameter: 0.25, height: 0.1 }, scene);
  milkLid.position.set(1.2, 1.83, -0.2);
  milkLid.material = matMilkCan;
  milkLid.parent = stallRoot;
}

/**
 * 4. Quán Trà Sữa & Cà Phê Ngoài Trời (Sunny Cafe & Juice Bar)
 */
function* createCafeStallSteps(scene, position, parent, shadows) {
  const { stallRoot } = yield* createBaseStallSteps(scene, 'cafe-stall', '#10b981', parent, shadows);
  stallRoot.position.set(position.x, position.y, position.z);

  yield 'boot: cafe signage';
  createStallSign(scene, 'TRÀ SỮA & CÀ PHÊ', '#10b981', stallRoot, 3.8, 0.75, 3.4);
  yield 'boot: cafe furniture';

  // Ly sinh tố nhiều màu trên bàn pha chế
  const drinkColors = ['#f43f5e', '#06b6d4', '#eab308'];
  for (const [i, color] of drinkColors.entries()) {
    const cup = MeshBuilder.CreateCylinder(`drink-cup-${i}`, { diameterTop: 0.16, diameterBottom: 0.12, height: 0.32 }, scene);
    cup.position.set(-0.6 + i * 0.45, 1.32, 0.9);
    cup.material = makeMat(scene, `drink-mat-${i}`, color, color);
    cup.parent = stallRoot;

    // Ống hút
    const straw = MeshBuilder.CreateCylinder(`straw-${i}`, { diameter: 0.02, height: 0.38 }, scene);
    straw.position.set(-0.6 + i * 0.45, 1.5, 0.9);
    straw.rotation.z = 0.2;
    straw.material = makeMat(scene, `straw-mat-${i}`, '#ffffff');
    straw.parent = stallRoot;
    yield;
  }

  // Máy xay cà phê vintage
  const matEspresso = makeMat(scene, 'mat-espresso', '#334155', '#475569');
  const machine = MeshBuilder.CreateBox('espresso-machine', { width: 0.65, height: 0.55, depth: 0.45 }, scene);
  machine.position.set(1.1, 1.45, -0.2);
  machine.material = matEspresso;
  machine.parent = stallRoot;
  shadows?.addShadowCaster(machine);

  // === KHU BÀN CÀ PHÊ NGOÀI TRỜI (OUTDOOR CAFE SEATING) ===
  const cafeSeatingCoords = [
    { x: -5.5, z: 2.5, parasolColor: '#ef4444' },
    { x: 5.5, z: 2.5, parasolColor: '#0ea5e9' },
  ];

  for (const [idx, seat] of cafeSeatingCoords.entries()) {
    const seatRoot = new TransformNode(`cafe-seating-${idx}`, scene);
    seatRoot.parent = stallRoot;
    seatRoot.position.set(seat.x, 0, seat.z);

    const matWhiteWood = makeMat(scene, `cafe-table-mat-${idx}`, '#f8fafc');
    const matWoodDark = makeMat(scene, `cafe-wood-dark-${idx}`, '#78350f');

    // Bàn tròn trắng
    const tableTop = MeshBuilder.CreateCylinder(`cafe-table-${idx}`, { diameter: 1.6, height: 0.08 }, scene);
    tableTop.position.set(0, 0.85, 0);
    tableTop.material = matWhiteWood;
    tableTop.parent = seatRoot;
    shadows?.addShadowCaster(tableTop);

    const tableLeg = MeshBuilder.CreateCylinder(`cafe-leg-${idx}`, { diameter: 0.12, height: 0.85 }, scene);
    tableLeg.position.set(0, 0.42, 0);
    tableLeg.material = matWoodDark;
    tableLeg.parent = seatRoot;

    // 2 Ghế tựa bằng gỗ xung quanh bàn
    [-1.2, 1.2].forEach((cx, cIdx) => {
      const seatMesh = MeshBuilder.CreateBox(`chair-seat-${idx}-${cIdx}`, { width: 0.6, height: 0.08, depth: 0.6 }, scene);
      seatMesh.position.set(cx, 0.5, 0);
      seatMesh.material = matWhiteWood;
      seatMesh.parent = seatRoot;

      const chairBack = MeshBuilder.CreateBox(`chair-back-${idx}-${cIdx}`, { width: 0.08, height: 0.6, depth: 0.6 }, scene);
      chairBack.position.set(cx + (cx > 0 ? 0.28 : -0.28), 0.8, 0);
      chairBack.material = matWhiteWood;
      chairBack.parent = seatRoot;
    });

    // Ô Dù Che Nắng Lớn (Patio Parasol)
    const pole = MeshBuilder.CreateCylinder(`parasol-pole-${idx}`, { diameter: 0.08, height: 3.2 }, scene);
    pole.position.set(0, 1.6, 0);
    pole.material = matWoodDark;
    pole.parent = seatRoot;

    const canopy = MeshBuilder.CreateCylinder(`parasol-canopy-${idx}`, {
      diameterTop: 0.2,
      diameterBottom: 3.2,
      height: 0.7,
      tessellation: 12,
    }, scene);
    canopy.position.set(0, 3.1, 0);
    canopy.material = makeMat(scene, `parasol-mat-${idx}`, seat.parasolColor);
    canopy.parent = seatRoot;
    shadows?.addShadowCaster(canopy);
    yield;
  }
}

/**
 * Factory chính tạo Chợ Phiên Nông Sản Thị Trấn Làng Gió
 */
export function createFarmersMarket(scene, shadows, foliage, origin = { x: -92, z: 140 }) {
  const steps = createFarmersMarketSteps(scene, shadows, foliage, origin);
  let result;
  do { result = steps.next(); } while (!result.done);
  return result.value;
}

export function* createFarmersMarketSteps(scene, shadows, foliage, origin = { x: -92, z: 140 }) {
  const marketRoot = new TransformNode('farmers-market-root', scene);
  const at = (x, z) => ({ x: x + origin.x, y: 0, z: z + origin.z });

  // 1. Quầy Nông Sản Tươi tại góc Tây Bắc
  yield 'boot: produce stall';
  yield* createProduceStallSteps(scene, at(-8, -6), marketRoot, shadows);
  yield;

  // 2. Quầy Hoa Tươi & Hạt Giống tại góc Đông Bắc
  yield 'boot: flower stall';
  yield* createFlowerStallSteps(scene, at(8, -6), marketRoot, shadows);
  yield;

  // 3. Quầy Bánh Mì & Bơ Sữa tại góc Tây Nam
  yield 'boot: bakery stall';
  yield* createBakeryStallSteps(scene, at(-8, 6), marketRoot, shadows);
  yield;

  // 4. Quán Trà Sữa & Cà Phê tại góc Đông Nam
  yield 'boot: cafe stall';
  yield* createCafeStallSteps(scene, at(8, 6), marketRoot, shadows);
  yield;

  // 5. Cây cảnh & khóm hoa trang trí quảng trường chợ (bố trí nép sát các quầy hàng)
  if (foliage) {
    yield 'boot: market landscaping';
    foliage.createHydrangeaBush(origin.x - 12, origin.z - 6, 1.1, '#10b981');
    yield;
    foliage.createHydrangeaBush(origin.x + 12, origin.z - 6, 1.1, '#10b981');
    yield;
    foliage.createHydrangeaBush(origin.x - 12, origin.z + 6, 1.1, '#10b981');
    yield;
    foliage.createHydrangeaBush(origin.x + 12, origin.z + 6, 1.1, '#10b981');
    yield;
    foliage.createFlowerPatch(origin.x, origin.z + 8, 8, 2.0);
  }

  return marketRoot;
}
