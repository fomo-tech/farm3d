import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { createFaceTexture } from './createFaceTexture.js';

function makeMat(scene, name, hex, emissiveHex = null, specular = 0.14, specularPower = 48) {
  let m = scene.getMaterialByName(name);
  if (!m) {
    m = new StandardMaterial(name, scene);
    m.diffuseColor = Color3.FromHexString(hex);
    m.ambientColor = m.diffuseColor.scale(0.44);
    m.specularColor = new Color3(specular, specular, specular);
    m.specularPower = specularPower;
    if (emissiveHex) {
      m.emissiveColor = Color3.FromHexString(emissiveHex);
    } else {
      // A small local fill keeps the avatar readable when the key light is behind it.
      m.emissiveColor = m.diffuseColor.scale(0.10);
    }
  }
  return m;
}

/** Original Bình Minh chibi avatar. Keep transform nodes stable for tools and animations. */
export function buildHumanMesh(scene, idPrefix, options = {}) {
  const outfitId = options.outfitId || 'starter';
  const outfitColor = options.outfitColor || '#f8fafc';
  const skinColor = options.skinColor || '#fde8d7';       // Làn da trắng hồng búp bê
  const hairColor = options.hairColor || '#76503b';       // Nâu hạt dẻ sáng, rõ dưới nắng
  const overallsColor = options.overallsColor || options.pantsColor || '#2563eb'; // Quần yếm denim xanh
  const bootsColor = options.bootsColor || '#ffffff';     // Sneaker trắng sứ
  const hasHat = Boolean(options.hasHat ?? false);
  const shadowGenerator = options.shadows || null;

  const materials = {
    skin: makeMat(scene, `${idPrefix}-pt-skin`, skinColor, null, 0.08, 32),
    hair: makeMat(scene, `${idPrefix}-pt-hair`, hairColor, null, 0.18, 48),
    hairGlint: makeMat(scene, `${idPrefix}-pt-hair-glint`, '#b98968', null, 0.12, 48),
    sproutGreen: makeMat(scene, `${idPrefix}-pt-sprout`, '#4ade80', '#22c55e', 0.25, 48),
    shirt: makeMat(scene, `${idPrefix}-pt-shirt`, outfitColor, null, 0.10, 32),
    shirtTrim: makeMat(scene, `${idPrefix}-pt-trim`, '#ffffff', null, 0.12, 32),
    hoodieCords: makeMat(scene, `${idPrefix}-pt-cords`, '#f8fafc', null, 0.15, 32),
    overalls: makeMat(scene, `${idPrefix}-pt-overalls`, overallsColor, null, 0.08, 24),
    brass: makeMat(scene, `${idPrefix}-pt-brass`, '#f59e0b', '#b45309', 0.65, 96),
    sneakerBody: makeMat(scene, `${idPrefix}-pt-sneaker-body`, bootsColor, null, 0.2, 48),
    sneakerSole: makeMat(scene, `${idPrefix}-pt-sneaker-sole`, '#f1f5f9', null, 0.08, 24),
    sneakerAccent: makeMat(scene, `${idPrefix}-pt-sneaker-accent`, '#3b82f6', null, 0.25, 48),
    packCanvas: makeMat(scene, `${idPrefix}-pack-canvas`, '#e8ae6b', null, 0.08, 32),
    packFlap: makeMat(scene, `${idPrefix}-pack-flap`, '#b9794e', null, 0.08, 32),
    packStrap: makeMat(scene, `${idPrefix}-pack-strap`, '#8d6646', null, 0.06, 32),
    packLeaf: makeMat(scene, `${idPrefix}-pack-leaf`, '#55a66e', null, 0.08, 32),
    hatStraw: makeMat(scene, `${idPrefix}-pt-hat`, '#fde047', null, 0.08, 32),
    hatRibbon: makeMat(scene, `${idPrefix}-pt-ribbon`, '#ef4444', null, 0.18, 48),
    catEarInner: makeMat(scene, `${idPrefix}-pt-catear-in`, '#fda4af', null, 0.12, 32),
    catEarOuter: makeMat(scene, `${idPrefix}-pt-catear-out`, '#f8fafc', null, 0.18, 48),
  };
  // Keep the face and rear hair legible under the world's strong overhead sun.
  materials.skin.emissiveColor = materials.skin.diffuseColor.scale(0.38);
  materials.hair.emissiveColor = materials.hair.diffuseColor.scale(0.26);
  materials.shirt.emissiveColor = materials.shirt.diffuseColor.scale(0.32);

  const root = new TransformNode(`${idPrefix}-pt-root`, scene);

  // ========================================================
  // 1. TORSO NODE (Thân giọt nước Chibi mũm mĩm & Áo Hoodie)
  // ========================================================
  const torsoNode = new TransformNode(`${idPrefix}-torso-node`, scene);
  torsoNode.position.y = 0.60;
  torsoNode.parent = root;

  // Tapered fabric torso, with a clean hem instead of a spherical belly.
  const shirtBody = MeshBuilder.CreateCylinder(`${idPrefix}-shirt-body`, {
    height: 0.43, diameterTop: 0.47, diameterBottom: 0.55, tessellation: 24,
  }, scene);
  shirtBody.position.y = 0.22;
  shirtBody.material = materials.shirt;
  shirtBody.parent = torsoNode;

  const teeHem = MeshBuilder.CreateTorus(`${idPrefix}-tee-hem`, {
    diameter: 0.54, thickness: 0.022, tessellation: 24,
  }, scene);
  teeHem.position.y = 0.01;
  teeHem.material = materials.shirt;
  teeHem.parent = torsoNode;

  // Bo gấu áo hoodie mềm mại
  const shirtHem = MeshBuilder.CreateTorus(`${idPrefix}-shirt-hem`, {
    diameter: 0.50,
    thickness: 0.045,
    tessellation: 18,
  }, scene);
  shirtHem.scaling.z = 0.86;
  shirtHem.position.y = 0.03;
  shirtHem.material = materials.shirtTrim;
  shirtHem.parent = torsoNode;

  // Mũ trùm đầu Hoodie vắt sau gáy (Back Hood Puff)
  const backHood = MeshBuilder.CreateSphere(`${idPrefix}-back-hood`, { diameter: 0.36, segments: 12 }, scene);
  backHood.scaling.set(1.2, 0.55, 0.75);
  backHood.position.set(0, 0.40, -0.22);
  backHood.material = materials.shirt;
  backHood.parent = torsoNode;

  // Cổ áo tròn Peter Pan phong cách Chibi đáng yêu
  const collar = MeshBuilder.CreateTorus(`${idPrefix}-collar`, {
    diameter: 0.26,
    thickness: 0.042,
    tessellation: 16,
  }, scene);
  collar.position.y = 0.44;
  collar.material = materials.shirtTrim;
  collar.parent = torsoNode;

  const hoodieDetails = [backHood, shirtHem];
  // Hoodie details are only visible with the farmer outfit.
  [-0.065, 0.065].forEach((dx, i) => {
    const cord = MeshBuilder.CreateCylinder(`${idPrefix}-cord-${i}`, {
      height: 0.16,
      diameter: 0.015,
      tessellation: 6,
    }, scene);
    cord.position.set(dx, 0.32, 0.23);
    cord.rotation.x = -0.15;
    cord.material = materials.hoodieCords;
    cord.parent = torsoNode;
    hoodieDetails.push(cord);

    const cordTip = MeshBuilder.CreateSphere(`${idPrefix}-cord-tip-${i}`, { diameter: 0.028, segments: 6 }, scene);
    cordTip.position.set(dx, 0.23, 0.245);
    cordTip.material = materials.shirtTrim;
    cordTip.parent = torsoNode;
    hoodieDetails.push(cordTip);
  });

  // Rounded overalls keep a clean silhouette from the gameplay camera.
  const dungareesBib = MeshBuilder.CreateSphere(`${idPrefix}-dungarees-bib`, { diameter: 0.54, segments: 16 }, scene);
  dungareesBib.scaling.set(1, 0.60, 0.89);
  dungareesBib.position.set(0, 0.08, 0.07);
  dungareesBib.material = materials.overalls;
  dungareesBib.parent = torsoNode;

  // Simple front pocket, deliberately larger than micro-details.
  const bibPocket = MeshBuilder.CreateBox(`${idPrefix}-bib-pocket`, {
    width: 0.18,
    height: 0.13,
    depth: 0.025,
  }, scene);
  bibPocket.position.set(0, 0.14, 0.31);
  bibPocket.material = materials.overalls;
  bibPocket.parent = torsoNode;

  // 2 Quai yếm có khuy đồng tròn mạ bóng
  const overallDetails = [dungareesBib, bibPocket];
  [-0.13, 0.13].forEach((sx, idx) => {
    const strap = MeshBuilder.CreateBox(`${idPrefix}-strap-${idx}`, {
      width: 0.05,
      height: 0.30,
      depth: 0.022,
    }, scene);
    strap.position.set(sx, 0.27, 0.27);
    strap.material = materials.overalls;
    strap.parent = torsoNode;
    overallDetails.push(strap);

    const button = MeshBuilder.CreateCylinder(`${idPrefix}-button-${idx}`, {
      height: 0.02,
      diameter: 0.042,
      tessellation: 10,
    }, scene);
    button.rotation.x = Math.PI / 2;
    button.position.set(sx, 0.23, 0.29);
    button.material = materials.brass;
    button.parent = torsoNode;
    overallDetails.push(button);
  });

  // ========================================================
  // 2. TÚI HẠT GIỐNG BÌNH MINH - recognizable from the rear camera
  // ========================================================
  const backpackNode = new TransformNode(`${idPrefix}-backpack-node`, scene);
  backpackNode.position.set(0, 0.18, -0.26);
  backpackNode.parent = torsoNode;

  const packBody = MeshBuilder.CreateSphere(`${idPrefix}-seed-pack-body`, { diameter: 0.34, segments: 12 }, scene);
  packBody.scaling.set(1.05, 1.12, 0.72);
  packBody.material = materials.packCanvas;
  packBody.parent = backpackNode;

  const packFlap = MeshBuilder.CreateSphere(`${idPrefix}-seed-pack-flap`, { diameter: 0.31, segments: 10 }, scene);
  packFlap.scaling.set(1.05, 0.40, 0.72);
  packFlap.position.set(0, 0.12, -0.04);
  packFlap.material = materials.packFlap;
  packFlap.parent = backpackNode;

  [-0.12, 0.12].forEach((sx, i) => {
    const strap = MeshBuilder.CreateBox(`${idPrefix}-seed-pack-strap-${i}`, { width: 0.035, height: 0.32, depth: 0.025 }, scene);
    strap.position.set(sx, 0.06, 0.12);
    strap.material = materials.packStrap;
    strap.parent = backpackNode;
  });

  const seedBadge = MeshBuilder.CreateSphere(`${idPrefix}-seed-pack-badge`, { diameter: 0.12, segments: 10 }, scene);
  seedBadge.scaling.set(0.7, 1, 0.25);
  seedBadge.position.set(0, 0.01, -0.13);
  seedBadge.material = materials.packLeaf;
  seedBadge.parent = backpackNode;

  // ========================================================
  // 3. HEAD & CURVED FACE MESH (Ôm khít hộp sọ, 0% bay lơ lửng)
  // ========================================================
  const headNode = new TransformNode(`${idPrefix}-head-node`, scene);
  headNode.position.y = 0.50;
  headNode.scaling.setAll(0.91);
  headNode.parent = torsoNode;

  // Khối đầu búp bê tròn bầu bĩnh má bánh bao
  const head = MeshBuilder.CreateSphere(`${idPrefix}-head`, {
    diameter: 0.96,
    segments: 24,
  }, scene);
  head.scaling.set(1.06, 0.94, 1.0);
  head.position.y = 0.39;
  head.material = materials.skin;
  head.parent = headNode;

  // KHUÔN MẶT 2D CANVAS PLAY TOGETHER CHUYÊN NGHIỆP
  const faceSystem = createFaceTexture(scene, idPrefix, {
    eyeColor: '#3b2b28',
    irisColor: '#785242',
    blushColor: '#ef9e94',
    smileColor: '#8d5450',
  });

  const faceMat = new StandardMaterial(`${idPrefix}-face-mat`, scene);
  faceMat.diffuseColor = Color3.Black();
  faceMat.emissiveTexture = faceSystem.texture;
  faceMat.opacityTexture = faceSystem.texture;
  faceMat.specularColor = Color3.Black();
  faceMat.backFaceCulling = false;
  faceMat.disableLighting = true;
  faceMat.zOffset = -2;

  // MẶT NẠ CONG CURVED FACE MESH: Uốn cong theo mặt cầu hộp sọ
  const faceGround = MeshBuilder.CreateGround(`${idPrefix}-curved-face`, {
    width: 0.70,
    height: 0.60,
    subdivisionsX: 12,
    subdivisionsY: 12,
  }, scene);

  // Ground rotates -90 degrees: negative local height becomes the FRONT (+Z).
  // Match the scaled head ellipsoid so the face cannot float or hide behind it.
  const fPos = faceGround.getVerticesData('position');
  const faceRadiusX = 0.96 * 1.06 / 2;
  const faceRadiusY = 0.96 * 0.94 / 2;
  const faceRadiusZ = 0.96 / 2;
  for (let i = 0; i < fPos.length; i += 3) {
    const vx = fPos[i];
    const vy = fPos[i + 2];
    const radial = Math.max(0, 1 - (vx / faceRadiusX) ** 2 - (vy / faceRadiusY) ** 2);
    fPos[i + 1] = -(faceRadiusZ * Math.sqrt(radial) + 0.012);
  }
  faceGround.setVerticesData('position', fPos);
  faceGround.rotation.x = -Math.PI / 2;
  faceGround.position.set(0, 0.39, 0);
  faceGround.material = faceMat;
  faceGround.parent = headNode;

  // 2 Tai tròn xinh xắn hai bên đầu
  [-0.49, 0.49].forEach((tx, idx) => {
    const ear = MeshBuilder.CreateSphere(`${idPrefix}-ear-${idx}`, { diameter: 0.17, segments: 10 }, scene);
    ear.scaling.set(0.58, 0.9, 0.62);
    ear.position.set(tx, 0.36, 0.01);
    ear.material = materials.skin;
    ear.parent = headNode;
  });

  // ========================================================
  // 4. MÁI TÓC SCULPTED CHUNKY ANIME BANGS (Lọn tóc uốn vát nhọn)
  // ========================================================
  const hairRoot = new TransformNode(`${idPrefix}-hair-root`, scene);
  hairRoot.parent = headNode;

  // Khối tóc sau gáy & đỉnh đầu mượt mà
  const hairDome = MeshBuilder.CreateSphere(`${idPrefix}-hair-dome`, { diameter: 1.0, segments: 20 }, scene);
  hairDome.scaling.set(1.06, 1.0, 0.90);
  hairDome.position.set(0, 0.48, -0.07);
  hairDome.material = materials.hair;
  hairDome.parent = hairRoot;

  // CỌNG MẦM CÂY KAIA ĐUNG ĐƯA (SPROUT AHOGE)
  const sproutNode = new TransformNode(`${idPrefix}-sprout-node`, scene);
  sproutNode.position.set(0, 0.82, 0.02);
  sproutNode.parent = hairRoot;

  const sproutStem = MeshBuilder.CreateCylinder(`${idPrefix}-sprout-stem`, {
    height: 0.15,
    diameterTop: 0.02,
    diameterBottom: 0.035,
    tessellation: 8,
  }, scene);
  sproutStem.position.y = 0.075;
  sproutStem.material = materials.sproutGreen;
  sproutStem.parent = sproutNode;

  // 2 Chiếc lá mầm xanh biếc xòe ra hai bên
  [-0.055, 0.055].forEach((lx, i) => {
    const leaf = MeshBuilder.CreateSphere(`${idPrefix}-sprout-leaf-${i}`, { diameter: 0.095, segments: 8 }, scene);
    leaf.scaling.set(1.25, 0.35, 0.65);
    leaf.rotation.z = i === 0 ? 0.55 : -0.55;
    leaf.position.set(lx, 0.15, 0);
    leaf.material = materials.sproutGreen;
    leaf.parent = sproutNode;
  });

  // Curved scalp-following fringe: no detached rounded bangs or visor silhouette.
  const fringePaths = [];
  for (let ix = 0; ix <= 14; ix++) {
    const t = ix / 14;
    const x = (t - 0.5) * 0.78;
    const edge = Math.abs(t - 0.5) * 2;
    const lower = 0.61 + 0.045 * Math.sin(Math.PI * t) + 0.018 * (t - 0.5);
    const upper = 0.79 - 0.15 * edge * edge;
    const path = [];
    for (let iy = 0; iy <= 4; iy++) {
      const y = lower + (upper - lower) * iy / 4;
      const radial = Math.max(0.012, 1 - (x / 0.509) ** 2 - ((y - 0.39) / 0.451) ** 2);
      path.push(new Vector3(x, y, 0.48 * Math.sqrt(radial) + 0.014));
    }
    fringePaths.push(path);
  }
  const fringe = MeshBuilder.CreateRibbon(`${idPrefix}-sculpted-fringe`, {
    pathArray: fringePaths, sideOrientation: 2,
  }, scene);
  // The fringe sits very close to the hair cap. A small depth bias prevents
  // the GPU from alternating which surface wins as the camera moves.
  const fringeMaterial = materials.hair.clone(`${idPrefix}-fringe-mat`);
  fringeMaterial.zOffset = -1;
  fringe.material = fringeMaterial;
  fringe.parent = hairRoot;

  // Short, subtle temples frame the face without hanging below the ears.
  [-0.43, 0.43].forEach((lx, idx) => {
    const lock = MeshBuilder.CreateSphere(`${idPrefix}-sidelock-${idx}`, { diameter: 0.24, segments: 12 }, scene);
    lock.scaling.set(0.48, 0.78, 0.55);
    lock.rotation.z = idx === 0 ? -0.1 : 0.1;
    lock.position.set(lx, 0.51, 0.06);
    lock.material = materials.hair;
    lock.parent = hairRoot;
  });

  // BĂNG ĐÔ TAI MÈO THỜI TRANG (CAT EARS HEADBAND)
  const catEarsNode = new TransformNode(`${idPrefix}-cat-ears-node`, scene);
  catEarsNode.parent = headNode;
  catEarsNode.setEnabled(false);

  const headband = MeshBuilder.CreateTorus(`${idPrefix}-headband-mesh`, {
    diameter: 0.86,
    thickness: 0.026,
    tessellation: 18,
  }, scene);
  headband.scaling.set(1.0, 0.35, 0.85);
  headband.position.set(0, 0.72, -0.02);
  headband.material = materials.catEarOuter;
  headband.parent = catEarsNode;

  [-0.26, 0.26].forEach((ex, idx) => {
    const earOuter = MeshBuilder.CreateCylinder(`${idPrefix}-catear-out-${idx}`, {
      height: 0.18,
      diameterTop: 0.02,
      diameterBottom: 0.14,
      tessellation: 3,
    }, scene);
    earOuter.rotation.z = idx === 0 ? 0.35 : -0.35;
    earOuter.rotation.y = Math.PI / 2;
    earOuter.position.set(ex, 0.88, 0.02);
    earOuter.material = materials.catEarOuter;
    earOuter.parent = catEarsNode;

    const earInner = MeshBuilder.CreateCylinder(`${idPrefix}-catear-in-${idx}`, {
      height: 0.14,
      diameterTop: 0.015,
      diameterBottom: 0.09,
      tessellation: 3,
    }, scene);
    earInner.rotation.z = idx === 0 ? 0.35 : -0.35;
    earInner.rotation.y = Math.PI / 2;
    earInner.position.set(ex, 0.87, 0.04);
    earInner.material = materials.catEarInner;
    earInner.parent = catEarsNode;
  });

  // Mũ cói nông dân truyền thống
  const hatNode = new TransformNode(`${idPrefix}-hat-node`, scene);
  hatNode.parent = headNode;
  hatNode.setEnabled(hasHat);

  const hatBrim = MeshBuilder.CreateCylinder(`${idPrefix}-hat-brim`, { height: 0.04, diameter: 1.28, tessellation: 18 }, scene);
  hatBrim.position.set(0, 0.75, -0.05);
  hatBrim.rotation.x = -0.08;
  hatBrim.material = materials.hatStraw;
  hatBrim.parent = hatNode;

  const hatCrown = MeshBuilder.CreateCylinder(`${idPrefix}-hat-crown`, { height: 0.22, diameterTop: 0.74, diameterBottom: 0.86, tessellation: 16 }, scene);
  hatCrown.position.set(0, 0.86, -0.06);
  hatCrown.rotation.x = -0.08;
  hatCrown.material = materials.hatStraw;
  hatCrown.parent = hatNode;

  const ribbon = MeshBuilder.CreateTorus(`${idPrefix}-hat-ribbon`, { diameter: 0.88, thickness: 0.035, tessellation: 16 }, scene);
  ribbon.position.set(0, 0.77, -0.05);
  ribbon.rotation.x = -0.08;
  ribbon.material = materials.hatRibbon;
  ribbon.parent = hatNode;

  // ========================================================
  // 5. BÀN TAY BÁNH MOCHI & GIÀY SNEAKER CHUNKY ĐẾ BÁNH MÌ
  // ========================================================
  function createArm(isLeft) {
    const side = isLeft ? 1 : -1;
    const armRoot = new TransformNode(`${idPrefix}-arm-root-${isLeft ? 'l' : 'r'}`, scene);
    armRoot.position.set(side * 0.31, 0.36, 0);
    armRoot.parent = torsoNode;

    // Tay áo hoodie phồng to
    const sleeve = MeshBuilder.CreateCylinder(`${idPrefix}-sleeve-${isLeft ? 'l' : 'r'}`, {
      height: 0.18, diameterTop: 0.20, diameterBottom: 0.19, tessellation: 16,
    }, scene);
    sleeve.rotation.z = side * 0.16;
    sleeve.position.set(0, -0.06, 0);
    sleeve.material = materials.shirt;
    sleeve.parent = armRoot;

    // Cổ tay áo bo chun gấu phồng (Ribbed Cuff)
    const cuff = MeshBuilder.CreateTorus(`${idPrefix}-cuff-${isLeft ? 'l' : 'r'}`, {
      diameter: 0.16,
      thickness: 0.032,
      tessellation: 14,
    }, scene);
    cuff.position.set(0, -0.19, 0);
    cuff.material = materials.shirtTrim;
    cuff.parent = armRoot;
    hoodieDetails.push(cuff);

    // Cánh tay Chibi ngắn mũm mĩm
    const arm = MeshBuilder.CreateCylinder(`${idPrefix}-arm-${isLeft ? 'l' : 'r'}`, {
      height: 0.30,
      diameterTop: 0.14,
      diameterBottom: 0.12,
      tessellation: 12,
    }, scene);
    arm.position.y = -0.24;
    arm.material = materials.skin;
    arm.parent = armRoot;

    // Bàn tay bánh Mochi tròn nhẵn cực kỳ đáng yêu (Mitten Style)
    const hand = MeshBuilder.CreateSphere(`${idPrefix}-hand-${isLeft ? 'l' : 'r'}`, { diameter: 0.155, segments: 10 }, scene);
    hand.position.set(0, -0.37, 0.02);
    hand.material = materials.skin;
    hand.parent = armRoot;

    const thumb = MeshBuilder.CreateSphere(`${idPrefix}-thumb-${isLeft ? 'l' : 'r'}`, { diameter: 0.065, segments: 8 }, scene);
    thumb.position.set(-side * 0.05, -0.35, 0.05);
    thumb.material = materials.skin;
    thumb.parent = armRoot;

    return armRoot;
  }

  const leftArm = createArm(true);
  const rightArm = createArm(false);

  const shortsSeat = MeshBuilder.CreateSphere(`${idPrefix}-shorts-seat`, { diameter: 0.49, segments: 18 }, scene);
  shortsSeat.scaling.set(1, 0.39, 0.78);
  shortsSeat.position.y = -0.03;
  shortsSeat.material = materials.overalls;
  shortsSeat.parent = torsoNode;

  const legOutfitParts = [];
  function createLeg(isLeft) {
    const side = isLeft ? 1 : -1;
    const legRoot = new TransformNode(`${idPrefix}-leg-root-${isLeft ? 'l' : 'r'}`, scene);
    legRoot.position.set(side * 0.15, -0.02, 0);
    legRoot.parent = torsoNode;

    // Ống quần yếm ngắn mập có gấu xắn
    const pantLeg = MeshBuilder.CreateCylinder(`${idPrefix}-pant-leg-${isLeft ? 'l' : 'r'}`, {
      height: 0.22,
      diameterTop: 0.22,
      diameterBottom: 0.21,
      tessellation: 14,
    }, scene);
    pantLeg.position.y = -0.14;
    pantLeg.material = materials.overalls;
    pantLeg.parent = legRoot;

    // Gấu quần xắn bo tròn
    const pantCuff = MeshBuilder.CreateTorus(`${idPrefix}-pant-cuff-${isLeft ? 'l' : 'r'}`, {
      diameter: 0.21,
      thickness: 0.03,
      tessellation: 14,
    }, scene);
    pantCuff.position.y = -0.29;
    pantCuff.material = materials.overalls;
    pantCuff.parent = legRoot;

    const calf = MeshBuilder.CreateCylinder(`${idPrefix}-calf-${isLeft ? 'l' : 'r'}`, {
      height: 0.17, diameterTop: 0.12, diameterBottom: 0.10, tessellation: 12,
    }, scene);
    calf.position.y = -0.27;
    calf.material = materials.skin;
    calf.parent = legRoot;
    legOutfitParts.push({ pantLeg, pantCuff, calf });

    // GIÀY SNEAKER CHUNKY ĐẾ BÁNH MÌ THỜI THƯỢNG (PLAY TOGETHER KICKS)
    const sneakerGroup = new TransformNode(`${idPrefix}-sneaker-${isLeft ? 'l' : 'r'}`, scene);
    sneakerGroup.position.set(0, -0.38, 0.04);
    sneakerGroup.parent = legRoot;

    // Thân giày bo tròn mập mạp
    const sneakerUpper = MeshBuilder.CreateSphere(`${idPrefix}-sneaker-up-${isLeft ? 'l' : 'r'}`, { diameter: 0.29, segments: 12 }, scene);
    sneakerUpper.scaling.set(0.80, 0.60, 1.12);
    sneakerUpper.position.y = -0.02;
    sneakerUpper.material = materials.sneakerBody;
    sneakerUpper.parent = sneakerGroup;

    // Mũi giày cao su tròn trắng
    const sneakerCap = MeshBuilder.CreateSphere(`${idPrefix}-sneaker-cap-${isLeft ? 'l' : 'r'}`, { diameter: 0.21, segments: 10 }, scene);
    sneakerCap.scaling.set(1.0, 0.8, 1.0);
    sneakerCap.position.set(0, -0.03, 0.10);
    sneakerCap.material = materials.sneakerSole;
    sneakerCap.parent = sneakerGroup;

    // Dải sọc thể thao trang trí hông giày
    const sneakerStripe = MeshBuilder.CreateBox(`${idPrefix}-sneaker-str-${isLeft ? 'l' : 'r'}`, {
      width: 0.22,
      height: 0.04,
      depth: 0.16,
    }, scene);
    sneakerStripe.position.set(0, -0.01, -0.02);
    sneakerStripe.material = materials.sneakerAccent;
    sneakerStripe.parent = sneakerGroup;

    // Đế cao su bánh mì kép dày dặn màu trắng sứ (Chunky Platform Sole)
    const sneakerPlatform = MeshBuilder.CreateSphere(`${idPrefix}-sneaker-sol-${isLeft ? 'l' : 'r'}`, { diameter: 0.30, segments: 12 }, scene);
    sneakerPlatform.scaling.set(0.85, 0.27, 1.1);
    sneakerPlatform.position.y = -0.12;
    sneakerPlatform.material = materials.sneakerSole;
    sneakerPlatform.parent = sneakerGroup;

    return legRoot;
  }

  const leftLeg = createLeg(true);
  const rightLeg = createLeg(false);

  function applyOutfit(id, color) {
    if (color) {
      materials.shirt.diffuseColor = Color3.FromHexString(color);
      materials.shirt.ambientColor = materials.shirt.diffuseColor.scale(0.44);
      materials.shirt.emissiveColor = materials.shirt.diffuseColor.scale(0.32);
    }
    const farmer = id === 'farmer';
    teeHem.setEnabled(!farmer);
    const shortsColors = { starter: '#4778b6', farmer: '#2563eb', rose: '#ad6d8d', lake: '#395e98', royal: '#63528b' };
    materials.overalls.diffuseColor = Color3.FromHexString(shortsColors[id] || shortsColors.starter);
    materials.overalls.ambientColor = materials.overalls.diffuseColor.scale(0.44);
    materials.overalls.emissiveColor = materials.overalls.diffuseColor.scale(0.10);
    overallDetails.forEach(mesh => mesh.setEnabled(farmer));
    hoodieDetails.forEach(mesh => mesh.setEnabled(farmer));
    backpackNode.setEnabled(farmer);
    sproutNode.setEnabled(farmer);
    legOutfitParts.forEach(({ pantLeg, pantCuff, calf }) => {
      pantLeg.scaling.y = farmer ? 1 : 0.65;
      pantLeg.position.y = farmer ? -0.14 : -0.10;
      pantCuff.position.y = farmer ? -0.29 : -0.20;
      calf.setEnabled(!farmer);
    });
    hatNode.setEnabled(farmer);
    catEarsNode.setEnabled(id === 'cat' || id === 'party');
  }

  applyOutfit(outfitId, outfitColor);

  // ========================================================
  // 6. CÔNG CỤ NÔNG TRẠI 3D (Handheld Tool Props)
  // ========================================================
  const toolMatWood = makeMat(scene, 'tool-mat-wood', '#78350f');
  const toolMatIron = makeMat(scene, 'tool-mat-iron', '#94a3b8');
  const toolMatCan = makeMat(scene, 'tool-mat-can', '#38bdf8', '#0284c7');
  const toolMatPouch = makeMat(scene, 'tool-mat-pouch', '#d97706');
  const toolMatBasket = makeMat(scene, 'tool-mat-basket', '#b45309');

  const toolsNode = new TransformNode(`${idPrefix}-tools-root`, scene);
  toolsNode.parent = rightArm;
  toolsNode.position.set(0, -0.40, 0.06);

  // Cuốc (Hoe)
  const hoeNode = new TransformNode(`${idPrefix}-tool-hoe`, scene);
  hoeNode.parent = toolsNode;
  const hoeHandle = MeshBuilder.CreateCylinder(`${idPrefix}-hoe-handle`, { height: 0.85, diameter: 0.045 }, scene);
  hoeHandle.position.set(0, -0.15, 0.15);
  hoeHandle.rotation.x = Math.PI / 4;
  hoeHandle.material = toolMatWood;
  hoeHandle.parent = hoeNode;

  const hoeBlade = MeshBuilder.CreateBox(`${idPrefix}-hoe-blade`, { width: 0.22, height: 0.04, depth: 0.18 }, scene);
  hoeBlade.position.set(0, 0.15, 0.45);
  hoeBlade.rotation.x = Math.PI / 2.5;
  hoeBlade.material = toolMatIron;
  hoeBlade.parent = hoeNode;
  hoeNode.setEnabled(false);

  // Bình tưới (Water Can)
  const waterCanNode = new TransformNode(`${idPrefix}-tool-watercan`, scene);
  waterCanNode.parent = toolsNode;
  const canBody = MeshBuilder.CreateCylinder(`${idPrefix}-can-body`, { height: 0.24, diameter: 0.22 }, scene);
  canBody.position.set(0, -0.05, 0.10);
  canBody.material = toolMatCan;
  canBody.parent = waterCanNode;

  const canSpout = MeshBuilder.CreateCylinder(`${idPrefix}-can-spout`, { height: 0.28, diameterTop: 0.04, diameterBottom: 0.07 }, scene);
  canSpout.position.set(0, 0.07, 0.22);
  canSpout.rotation.x = -Math.PI / 3.5;
  canSpout.material = toolMatCan;
  canSpout.parent = waterCanNode;
  waterCanNode.setEnabled(false);

  // Túi hạt giống (Seed Pouch)
  const seedBagNode = new TransformNode(`${idPrefix}-tool-seedbag`, scene);
  seedBagNode.parent = toolsNode;
  const pouch = MeshBuilder.CreateSphere(`${idPrefix}-pouch`, { diameterX: 0.22, diameterY: 0.26, diameterZ: 0.22, segments: 6 }, scene);
  pouch.position.set(0, -0.08, 0.06);
  pouch.material = toolMatPouch;
  pouch.parent = seedBagNode;
  seedBagNode.setEnabled(false);

  // Giỏ mây thu hoạch (Basket)
  const basketNode = new TransformNode(`${idPrefix}-tool-basket`, scene);
  basketNode.parent = toolsNode;
  const basket = MeshBuilder.CreateCylinder(`${idPrefix}-basket`, { height: 0.24, diameterTop: 0.34, diameterBottom: 0.22, tessellation: 8 }, scene);
  basket.position.set(0, -0.06, 0.10);
  basket.material = toolMatBasket;
  basket.parent = basketNode;
  basketNode.setEnabled(false);

  if (shadowGenerator) {
    [head, shirtBody, dungareesBib, packBody].forEach(m => shadowGenerator.addShadowCaster(m));
  }

  // Animation cycle & Action State Machine
  let animTimer = 0;
  let activeToolId = 'hand';
  let currentAction = null;
  let actionTime = 0;
  let actionDuration = 0.65;
  let onActionHit = null;
  let onActionEnd = null;
  let actionHitFired = false;

  function updateToolVisibility() {
    const effective = currentAction;
    hoeNode.setEnabled(effective === 'hoe' || effective === 'till');
    waterCanNode.setEnabled(effective === 'water');
    seedBagNode.setEnabled(effective === 'seed');
    basketNode.setEnabled(effective === 'harvest' || effective === 'celebrate');
  }

  return {
    root,
    materials,
    torsoNode,
    headNode,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    hatNode,
    backpackNode,
    catEarsNode,
    sproutNode,
    faceSystem,

    setOutfitColor(color) {
      materials.shirt.diffuseColor = Color3.FromHexString(color);
      materials.shirt.emissiveColor = materials.shirt.diffuseColor.scale(0.32);
    },
    setOutfit(id, color) {
      applyOutfit(id, color);
    },
    setHatVisible(visible) {
      if (hatNode) hatNode.setEnabled(visible);
    },
    setCatEarsVisible(visible) {
      if (catEarsNode) catEarsNode.setEnabled(visible);
    },
    setExpression(expr) {
      faceSystem.setExpression(expr);
    },
    setActiveTool(toolId) {
      activeToolId = toolId;
      updateToolVisibility();
    },
    playAction(actionType, onHitCallback = null, onEndCallback = null) {
      currentAction = actionType;
      actionTime = 0;
      actionHitFired = false;
      onActionHit = onHitCallback;
      onActionEnd = onEndCallback;
      actionDuration = actionType === 'water' ? 0.8 : (actionType === 'harvest' ? 0.75 : 0.65);

      if (actionType === 'harvest' || actionType === 'celebrate') {
        faceSystem.setExpression('excited');
      } else if (actionType === 'wave') {
        faceSystem.setExpression('wink');
      } else {
        faceSystem.setExpression('happy');
      }

      updateToolVisibility();
    },
    isPerformingAction() {
      return Boolean(currentAction);
    },
    animate(delta, isMoving = false, speed = 1.0) {
      animTimer += delta;

      // Cập nhật biểu cảm khuôn mặt
      faceSystem.update(delta);

      // Cọng mầm cây đung đưa trên đỉnh đầu
      sproutNode.rotation.z = Math.sin(animTimer * 4.5) * 0.18;

      // 1. Xử lý Action Animation chuyên biệt
      if (currentAction) {
        actionTime += delta;
        const p = Math.min(1.0, actionTime / actionDuration);

        if (currentAction === 'till' || currentAction === 'hoe') {
          if (p < 0.4) {
            const windUp = p / 0.4;
            rightArm.rotation.x = -0.5 - windUp * 1.6;
            rightArm.rotation.y = -0.2;
            leftArm.rotation.x = -0.3 - windUp * 1.3;
            torsoNode.position.y = 0.60 + windUp * 0.05;
            torsoNode.rotation.x = -windUp * 0.15;
          } else if (p < 0.7) {
            const strike = (p - 0.4) / 0.3;
            rightArm.rotation.x = -2.1 + strike * 3.1;
            leftArm.rotation.x = -1.6 + strike * 2.4;
            torsoNode.position.y = 0.65 - strike * 0.18;
            torsoNode.rotation.x = strike * 0.35;

            if (p >= 0.55 && !actionHitFired) {
              actionHitFired = true;
              onActionHit?.();
            }
          } else {
            const recover = (p - 0.7) / 0.3;
            rightArm.rotation.x = 1.0 - recover * 1.0;
            leftArm.rotation.x = 0.8 - recover * 0.8;
            torsoNode.position.y = 0.47 + recover * 0.13;
            torsoNode.rotation.x = 0.35 - recover * 0.35;
          }
        } else if (currentAction === 'water') {
          const tilt = Math.sin(p * Math.PI);
          rightArm.rotation.x = -0.85 * tilt;
          rightArm.rotation.z = -0.35 * tilt;
          rightArm.rotation.y = 0.25 * tilt;
          leftArm.rotation.x = -0.3 * tilt;
          torsoNode.rotation.x = 0.20 * tilt;

          if (p >= 0.3 && !actionHitFired) {
            actionHitFired = true;
            onActionHit?.();
          }
        } else if (currentAction === 'seed') {
          const sweep = Math.sin(p * Math.PI);
          rightArm.rotation.x = -0.6 * sweep;
          rightArm.rotation.y = -0.5 * sweep;
          rightArm.rotation.z = 0.4 * sweep;
          torsoNode.rotation.y = 0.2 * sweep;

          if (p >= 0.45 && !actionHitFired) {
            actionHitFired = true;
            onActionHit?.();
          }
        } else if (currentAction === 'harvest' || currentAction === 'celebrate') {
          if (p < 0.4) {
            const bend = p / 0.4;
            torsoNode.position.y = 0.60 - bend * 0.18;
            torsoNode.rotation.x = bend * 0.45;
            leftArm.rotation.x = bend * 0.7;
            rightArm.rotation.x = bend * 0.7;
            if (p >= 0.35 && !actionHitFired) {
              actionHitFired = true;
              onActionHit?.();
            }
          } else {
            const jump = (p - 0.4) / 0.6;
            torsoNode.position.y = 0.42 + Math.sin(jump * Math.PI) * 0.35;
            torsoNode.rotation.x = 0;
            leftArm.rotation.x = -2.5;
            leftArm.rotation.z = -0.35;
            rightArm.rotation.x = -2.5;
            rightArm.rotation.z = 0.35;
            headNode.rotation.x = -0.25;
          }
        } else if (currentAction === 'wave') {
          const wave = Math.sin(actionTime * 14);
          rightArm.rotation.x = -2.3;
          rightArm.rotation.z = -0.5 + wave * 0.4;
          headNode.rotation.z = wave * 0.08;
        }

        leftLeg.rotation.x *= 0.8;
        rightLeg.rotation.x *= 0.8;

        if (actionTime >= actionDuration) {
          currentAction = null;
          updateToolVisibility();
          faceSystem.setExpression('happy');
          rightArm.rotation.set(0, 0, 0);
          leftArm.rotation.set(0, 0, 0);
          torsoNode.position.y = 0.60;
          torsoNode.rotation.set(0, 0, 0);
          headNode.rotation.set(0, 0, 0);
          onActionEnd?.();
        }
        return;
      }

      // 2. DÁNG CHẠY WADDLE RUN PLAY TOGETHER (Lắc lư chim cánh cụt nhí nhảnh)
      if (isMoving) {
        const walkCycle = animTimer * 10.5 * Math.max(0.6, speed / 4);

        // Chân bước nhanh nhí nhảnh
        leftLeg.rotation.x = Math.sin(walkCycle) * 0.68;
        rightLeg.rotation.x = -Math.sin(walkCycle) * 0.68;

        // Tay xòe nhẹ cân bằng nhí nhảnh kiểu Chibi Play Together
        leftArm.rotation.x = -Math.sin(walkCycle) * 0.48;
        leftArm.rotation.z = -0.20 - Math.abs(Math.sin(walkCycle)) * 0.14;
        leftArm.rotation.y = 0;

        rightArm.rotation.x = Math.sin(walkCycle) * 0.48;
        rightArm.rotation.z = 0.20 + Math.abs(Math.sin(walkCycle)) * 0.14;
        rightArm.rotation.y = 0;

        // ĐẶC TRƯNG PLAY TOGETHER: BODY WADDLE ROLL (Lắc lư thân người sang 2 bên)
        torsoNode.rotation.z = Math.sin(walkCycle) * 0.08;
        headNode.rotation.z = -Math.sin(walkCycle) * 0.06; // Đầu nghiêng đối trọng siêu cưng

        // Hiệu ứng nhún đàn hồi Chibi (Squash & Stretch)
        torsoNode.position.y = 0.60 + Math.abs(Math.sin(walkCycle)) * 0.06;
        torsoNode.scaling.y = 1.0 - Math.abs(Math.sin(walkCycle)) * 0.035;
        torsoNode.scaling.x = 1.0 + Math.abs(Math.sin(walkCycle)) * 0.02;
        torsoNode.scaling.z = 1.0 + Math.abs(Math.sin(walkCycle)) * 0.02;

        torsoNode.rotation.x = 0.05;
        headNode.rotation.x = 0.03;

        // Hair is rigidly attached to the head. Rotating the complete cap
        // independently made it intersect the scalp on every step.
        hairRoot.rotation.set(0, 0, 0);

        // Balo chú vịt vàng lắc lư vui vẻ theo nhịp chạy
        backpackNode.rotation.x = Math.sin(walkCycle * 2) * 0.14;
        backpackNode.rotation.z = Math.sin(walkCycle) * 0.08;
      } else {
        // ĐỨNG THỞ IDLE DỊU DÀNG
        const idleCycle = animTimer * 2.5;

        torsoNode.position.y = 0.60 + Math.sin(idleCycle) * 0.012;
        torsoNode.scaling.set(1.0, 1.0, 1.0);
        torsoNode.rotation.set(0, 0, 0);

        headNode.rotation.z = Math.sin(idleCycle * 0.5) * 0.035;
        headNode.rotation.x = 0;
        hairRoot.rotation.set(0, 0, 0);
        backpackNode.rotation.set(0, 0, 0);

        leftLeg.rotation.x *= 0.85;
        rightLeg.rotation.x *= 0.85;

        leftArm.rotation.x *= 0.85;
        leftArm.rotation.z *= 0.85;
        leftArm.rotation.y = 0;

        rightArm.rotation.x *= 0.85;
        rightArm.rotation.z *= 0.85;
        rightArm.rotation.y = 0;
      }
    },
  };
}
