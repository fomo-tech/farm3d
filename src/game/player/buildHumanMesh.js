import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';

function makeMat(scene, name, hex, emissiveHex = null) {
  let m = scene.getMaterialByName(name);
  if (!m) {
    m = new StandardMaterial(name, scene);
    m.diffuseColor = Color3.FromHexString(hex);
    m.ambientColor = m.diffuseColor.scale(0.38);
    m.specularColor = new Color3(0.06, 0.06, 0.06);
    if (emissiveHex) {
      m.emissiveColor = Color3.FromHexString(emissiveHex);
    }
  }
  return m;
}

/**
 * AVATAR CHIBI ANIME THẾ HỆ MỚI (Cozy AAA Game Standard)
 * Lấy cảm hứng từ Animal Crossing: New Horizons, Genshin Chibi & Pop Mart:
 * - Tỉ lệ vàng Chibi 2.3 đầu siêu đáng yêu, má bánh bao phúng phính
 * - Đôi mắt Anime 3D to tròn long lanh với 3 điểm sáng phản chiếu (Catchlights)
 * - Mắt tự động chớp nhịp nhàng, biểu cảm sinh động
 * - Mái tóc 3D bồng bềnh có lọn tỉa mềm mại, có cọng tóc ngố (Ahoge) đung đưa
 * - Thời trang Nông Trại Quần Yếm Denim (Classic Dungarees) với khuy đồng và túi ngực
 * - Balo Da Mini phiêu lưu đeo sau lưng cắm hoa dại, nhún nảy theo bước chạy
 * - Hiệu ứng Squash & Stretch đàn hồi mềm mại cho từng bước chân
 */
export function buildHumanMesh(scene, idPrefix, options = {}) {
  const outfitId = options.outfitId || 'farmer';
  const outfitColor = options.outfitColor || '#fef3c7'; // Áo sơ mi vàng bơ ấm áp
  const skinColor = options.skinColor || '#fce7d2';   // Làn da sáng hồng hào tươi tắn
  const hairColor = options.hairColor || '#4a2c1d';   // Tóc hạt dẻ bóng mượt
  const overallsColor = options.overallsColor || '#2563eb'; // Quần yếm bò xanh denim
  const bootsColor = options.bootsColor || '#78350f'; // Bốt da bò vintage
  const hasHat = Boolean(options.hasHat ?? false);    // Mũ cói (mặc định ẩn để khoe tóc)
  const shadowGenerator = options.shadows || null;

  const materials = {
    skin: makeMat(scene, `${idPrefix}-chibi-skin`, skinColor),
    blush: makeMat(scene, `${idPrefix}-chibi-blush`, '#fb7185', '#f43f5e'),
    eyeLiner: makeMat(scene, `${idPrefix}-chibi-eyeliner`, '#2b1810'),
    eyeIris: makeMat(scene, `${idPrefix}-chibi-eye-iris`, '#1e3a8a', '#172554'),
    eyeHighlight: makeMat(scene, `${idPrefix}-chibi-eye-hl`, '#ffffff', '#ffffff'),
    smile: makeMat(scene, `${idPrefix}-chibi-smile`, '#9f1239'),
    hair: makeMat(scene, `${idPrefix}-chibi-hair`, hairColor),
    hairGlint: makeMat(scene, `${idPrefix}-chibi-hair-glint`, '#fef08a', '#eab308'),
    shirt: makeMat(scene, `${idPrefix}-chibi-shirt`, outfitColor),
    shirtCollar: makeMat(scene, `${idPrefix}-chibi-collar`, '#ffffff'),
    overalls: makeMat(scene, `${idPrefix}-chibi-overalls`, overallsColor),
    overallsPocket: makeMat(scene, `${idPrefix}-chibi-pocket`, '#1d4ed8'),
    brass: makeMat(scene, `${idPrefix}-chibi-brass`, '#f59e0b', '#b45309'),
    leather: makeMat(scene, `${idPrefix}-chibi-leather`, '#854d0e'),
    boots: makeMat(scene, `${idPrefix}-chibi-boots`, bootsColor),
    bootSole: makeMat(scene, `${idPrefix}-chibi-sole`, '#f1f5f9'),
    hatStraw: makeMat(scene, `${idPrefix}-chibi-hat`, '#fde047'),
    hatRibbon: makeMat(scene, `${idPrefix}-chibi-ribbon`, '#ef4444'),
  };

  const root = new TransformNode(`${idPrefix}-chibi-root`, scene);

  // ==========================================
  // 1. TORSO NODE (Thân hình quả lê Chibi mũm mĩm)
  // ==========================================
  const torsoNode = new TransformNode(`${idPrefix}-torso-node`, scene);
  torsoNode.position.y = 0.68;
  torsoNode.parent = root;

  // Thân áo sơ mi bên trong
  const shirtBody = MeshBuilder.CreateCylinder(`${idPrefix}-shirt-body`, {
    height: 0.48,
    diameterTop: 0.48,
    diameterBottom: 0.54,
    tessellation: 16,
  }, scene);
  shirtBody.scaling.z = 0.84;
  shirtBody.position.y = 0.24;
  shirtBody.material = materials.shirt;
  shirtBody.parent = torsoNode;

  // Cổ áo tròn Peter Pan phong cách Chibi đáng yêu
  const collar = MeshBuilder.CreateTorus(`${idPrefix}-collar`, {
    diameter: 0.28,
    thickness: 0.038,
    tessellation: 16,
  }, scene);
  collar.position.y = 0.47;
  collar.material = materials.shirtCollar;
  collar.parent = torsoNode;

  // Cổ người nhỏ nhắn
  const neck = MeshBuilder.CreateCylinder(`${idPrefix}-neck`, {
    height: 0.12,
    diameter: 0.20,
    tessellation: 12,
  }, scene);
  neck.position.y = 0.50;
  neck.material = materials.skin;
  neck.parent = torsoNode;

  // QUẦN YẾM DENIM (Iconic Dungarees):
  // Thân yếm bao quanh ngực bụng
  const dungareesBib = MeshBuilder.CreateCylinder(`${idPrefix}-dungarees-bib`, {
    height: 0.38,
    diameterTop: 0.50,
    diameterBottom: 0.56,
    tessellation: 16,
  }, scene);
  dungareesBib.scaling.z = 0.86;
  dungareesBib.position.y = 0.18;
  dungareesBib.material = materials.overalls;
  dungareesBib.parent = torsoNode;

  // Chiếc túi vuông trước bụng
  const bibPocket = MeshBuilder.CreateBox(`${idPrefix}-bib-pocket`, {
    width: 0.18,
    height: 0.14,
    depth: 0.03,
  }, scene);
  bibPocket.position.set(0, 0.24, 0.22);
  bibPocket.material = materials.overallsPocket;
  bibPocket.parent = torsoNode;

  // 2 Quai đeo vai quần yếm với khuy đồng
  [-0.14, 0.14].forEach((sx, idx) => {
    const strap = MeshBuilder.CreateBox(`${idPrefix}-strap-${idx}`, {
      width: 0.055,
      height: 0.36,
      depth: 0.024,
    }, scene);
    strap.position.set(sx, 0.32, 0.21);
    strap.material = materials.overalls;
    strap.parent = torsoNode;

    // Khuy đồng tròn lấp lánh
    const button = MeshBuilder.CreateCylinder(`${idPrefix}-button-${idx}`, {
      height: 0.02,
      diameter: 0.045,
      tessellation: 8,
    }, scene);
    button.rotation.x = Math.PI / 2;
    button.position.set(sx, 0.27, 0.23);
    button.material = materials.brass;
    button.parent = torsoNode;
  });

  // BALO DA MINI PHIÊU LƯU ĐEO SAU LƯNG (Vintage Leather Satchel)
  const backpackNode = new TransformNode(`${idPrefix}-backpack-node`, scene);
  backpackNode.position.set(0, 0.24, -0.24);
  backpackNode.parent = torsoNode;

  const bagBody = MeshBuilder.CreateBox(`${idPrefix}-bag-body`, {
    width: 0.28,
    height: 0.26,
    depth: 0.14,
  }, scene);
  bagBody.material = materials.leather;
  bagBody.parent = backpackNode;

  const bagFlap = MeshBuilder.CreateBox(`${idPrefix}-bag-flap`, {
    width: 0.29,
    height: 0.12,
    depth: 0.15,
  }, scene);
  bagFlap.position.set(0, 0.10, 0.01);
  bagFlap.material = materials.leather;
  bagFlap.parent = backpackNode;

  const bagBuckle = MeshBuilder.CreateBox(`${idPrefix}-bag-buckle`, {
    width: 0.06,
    height: 0.05,
    depth: 0.04,
  }, scene);
  bagBuckle.position.set(0, 0.04, -0.07);
  bagBuckle.material = materials.brass;
  bagBuckle.parent = backpackNode;

  // Đóa hoa dại cúc trắng cắm bên hông balo
  const bagFlower = MeshBuilder.CreateSphere(`${idPrefix}-bag-flower`, { diameter: 0.07, segments: 6 }, scene);
  bagFlower.position.set(0.12, 0.16, 0.02);
  bagFlower.material = materials.shirtCollar;
  bagFlower.parent = backpackNode;

  // ==========================================
  // 2. HEAD & FACE NODE (Đầu tròn má bánh bao Anime)
  // ==========================================
  const headNode = new TransformNode(`${idPrefix}-head-node`, scene);
  headNode.position.y = 0.60;
  headNode.parent = torsoNode;

  // Khối đầu Chibi tròn bầu bĩnh
  const head = MeshBuilder.CreateSphere(`${idPrefix}-head`, {
    diameter: 0.92,
    segments: 18,
  }, scene);
  head.scaling.set(1.06, 0.96, 1.0);
  head.position.y = 0.36;
  head.material = materials.skin;
  head.parent = headNode;

  // 2 Má bánh bao phúng phính (Chubby Cheek Bulges)
  [-0.32, 0.32].forEach((cx, idx) => {
    const cheek = MeshBuilder.CreateSphere(`${idPrefix}-cheek-bulge-${idx}`, {
      diameter: 0.32,
      segments: 10,
    }, scene);
    cheek.scaling.set(1.0, 0.85, 0.8);
    cheek.position.set(cx, 0.28, 0.20);
    cheek.material = materials.skin;
    cheek.parent = headNode;
  });

  // ĐÔI MẮT ANIME LONG LANH (Soulful Anime Sparkle Eyes)
  const eyeMeshes = [];
  const eyeHighlights = [];

  [-0.19, 0.19].forEach((ex, i) => {
    // Tròng mắt lớn hình hạt dẹt cong
    const eyeIris = MeshBuilder.CreateSphere(`${idPrefix}-eye-${i}`, {
      diameter: 0.18,
      segments: 12,
    }, scene);
    eyeIris.scaling.set(0.88, 1.25, 0.25);
    eyeIris.position.set(ex, 0.37, 0.44);
    eyeIris.material = materials.eyeIris;
    eyeIris.parent = headNode;
    eyeMeshes.push(eyeIris);

    // Viền mi mắt trên cong mềm mại (Anime Eyelash Arc)
    const lash = MeshBuilder.CreateTorus(`${idPrefix}-lash-${i}`, {
      diameter: 0.17,
      thickness: 0.024,
      tessellation: 12,
    }, scene);
    lash.scaling.set(0.9, 0.4, 0.4);
    lash.rotation.x = -Math.PI * 0.45;
    lash.position.set(ex, 0.47, 0.45);
    lash.material = materials.eyeLiner;
    lash.parent = headNode;

    // Đốm sáng lớn hình ngôi sao/giọt nước góc trên
    const hlBig = MeshBuilder.CreateSphere(`${idPrefix}-hl1-${i}`, {
      diameter: 0.065,
      segments: 8,
    }, scene);
    hlBig.position.set(ex + 0.032, 0.42, 0.465);
    hlBig.material = materials.eyeHighlight;
    hlBig.parent = headNode;
    eyeHighlights.push(hlBig);

    // Đốm sáng nhỏ phụ góc dưới
    const hlSmall = MeshBuilder.CreateSphere(`${idPrefix}-hl2-${i}`, {
      diameter: 0.032,
      segments: 6,
    }, scene);
    hlSmall.position.set(ex - 0.028, 0.33, 0.465);
    hlSmall.material = materials.eyeHighlight;
    hlSmall.parent = headNode;
    eyeHighlights.push(hlSmall);

    // Vệt sáng trăng khuyết ở đáy mắt (Tạo độ trong trẻo long lanh)
    const hlGlint = MeshBuilder.CreateTorus(`${idPrefix}-hl-glint-${i}`, {
      diameter: 0.08,
      thickness: 0.012,
      tessellation: 8,
    }, scene);
    hlGlint.scaling.set(1.0, 0.3, 0.3);
    hlGlint.position.set(ex, 0.30, 0.465);
    hlGlint.material = materials.eyeHighlight;
    hlGlint.parent = headNode;
    eyeHighlights.push(hlGlint);

    // Đôi lông mày mảnh đáng yêu
    const brow = MeshBuilder.CreateTorus(`${idPrefix}-brow-${i}`, {
      diameter: 0.12,
      thickness: 0.016,
      tessellation: 8,
    }, scene);
    brow.scaling.set(1.1, 0.25, 0.3);
    brow.rotation.x = -Math.PI * 0.4;
    brow.rotation.z = i === 0 ? 0.08 : -0.08;
    brow.position.set(ex, 0.52, 0.44);
    brow.material = materials.eyeLiner;
    brow.parent = headNode;

    // Đôi má ửng hồng phấn đào cam Chibi
    const blush = MeshBuilder.CreateSphere(`${idPrefix}-blush-${i}`, {
      diameter: 0.14,
      segments: 8,
    }, scene);
    blush.scaling.set(1.3, 0.65, 0.2);
    blush.position.set(ex * 1.65, 0.26, 0.41);
    blush.material = materials.blush;
    blush.parent = headNode;
  });

  // Nụ cười mỉm nhỏ nhắn xinh xắn
  const smile = MeshBuilder.CreateTorus(`${idPrefix}-smile`, {
    diameter: 0.11,
    thickness: 0.022,
    tessellation: 12,
  }, scene);
  smile.rotation.x = Math.PI * 0.68;
  smile.scaling.set(1.1, 0.32, 0.5);
  smile.position.set(0, 0.23, 0.465);
  smile.material = materials.smile;
  smile.parent = headNode;

  // 2 Tai nhỏ hai bên
  [-0.46, 0.46].forEach((tx, idx) => {
    const ear = MeshBuilder.CreateSphere(`${idPrefix}-ear-${idx}`, {
      diameter: 0.14,
      segments: 6,
    }, scene);
    ear.scaling.set(0.4, 0.85, 0.6);
    ear.position.set(tx, 0.35, 0.04);
    ear.material = materials.skin;
    ear.parent = headNode;
  });

  // ==========================================
  // 3. VOLUMETRIC ANIME HAIR (Mái tóc 3D bồng bềnh có lọn)
  // ==========================================
  const hairRoot = new TransformNode(`${idPrefix}-hair-root`, scene);
  hairRoot.parent = headNode;

  // Khối tóc sau gáy và đỉnh đầu (nằm sâu phía sau, hoàn toàn không che mặt)
  const hairDome = MeshBuilder.CreateSphere(`${idPrefix}-hair-dome`, {
    diameter: 0.88,
    segments: 14,
  }, scene);
  hairDome.scaling.set(1.04, 1.0, 0.72);
  hairDome.position.set(0, 0.45, -0.16);
  hairDome.material = materials.hair;
  hairDome.parent = hairRoot;

  // Vòng hào quang tóc (Angel Ring Highlight) óng ả trên đỉnh đầu
  const angelRing = MeshBuilder.CreateTorus(`${idPrefix}-angel-ring`, {
    diameter: 0.64,
    thickness: 0.035,
    tessellation: 16,
  }, scene);
  angelRing.scaling.set(1.0, 0.3, 0.8);
  angelRing.position.set(0, 0.76, -0.06);
  angelRing.material = materials.hairGlint;
  angelRing.parent = hairRoot;

  // Cọng tóc ngố Chibi (Ahoge) đung đưa trên đỉnh đầu
  const ahogeNode = new TransformNode(`${idPrefix}-ahoge-node`, scene);
  ahogeNode.position.set(0, 0.82, 0.05);
  ahogeNode.parent = hairRoot;

  const ahoge = MeshBuilder.CreateCylinder(`${idPrefix}-ahoge-mesh`, {
    height: 0.22,
    diameterTop: 0.02,
    diameterBottom: 0.07,
    tessellation: 6,
  }, scene);
  ahoge.position.set(0.04, 0.10, 0);
  ahoge.rotation.z = -0.35;
  ahoge.material = materials.hair;
  ahoge.parent = ahogeNode;

  // Lọn tóc mái (Bangs) tỉa mềm mại trên trán, rẽ ngôi 7:3
  const bangs = [
    [-0.22, 0.65, 0.32, 0.19, 0.18],
    [-0.08, 0.68, 0.34, 0.22, 0.05],
    [0.06, 0.68, 0.34, 0.21, -0.05],
    [0.20, 0.65, 0.32, 0.19, -0.15],
  ];
  bangs.forEach(([bx, by, bz, diam, rotZ], idx) => {
    const bang = MeshBuilder.CreateSphere(`${idPrefix}-bang-${idx}`, {
      diameter: diam,
      segments: 8,
    }, scene);
    bang.scaling.set(0.9, 1.15, 0.65);
    bang.rotation.z = rotZ;
    bang.position.set(bx, by, bz);
    bang.material = materials.hair;
    bang.parent = hairRoot;
  });

  // 2 Lọn tóc mai ôm lấy hai bên má
  [-0.42, 0.42].forEach((lx, idx) => {
    const lock = MeshBuilder.CreateSphere(`${idPrefix}-sidelock-${idx}`, {
      diameter: 0.18,
      segments: 8,
    }, scene);
    lock.scaling.set(0.5, 1.45, 0.7);
    lock.position.set(lx, 0.35, 0.08);
    lock.material = materials.hair;
    lock.parent = hairRoot;
  });

  // ==========================================
  // 4. MŨ CÓI NÔNG DÂN (Farmer Straw Hat)
  // ==========================================
  const hatNode = new TransformNode(`${idPrefix}-hat-node`, scene);
  hatNode.parent = headNode;
  hatNode.setEnabled(hasHat);

  const hatBrim = MeshBuilder.CreateCylinder(`${idPrefix}-hat-brim`, {
    height: 0.04,
    diameter: 1.30,
    tessellation: 18,
  }, scene);
  hatBrim.position.set(0, 0.76, -0.05);
  hatBrim.rotation.x = -0.08;
  hatBrim.material = materials.hatStraw;
  hatBrim.parent = hatNode;

  const hatCrown = MeshBuilder.CreateCylinder(`${idPrefix}-hat-crown`, {
    height: 0.24,
    diameterTop: 0.75,
    diameterBottom: 0.88,
    tessellation: 16,
  }, scene);
  hatCrown.position.set(0, 0.88, -0.06);
  hatCrown.rotation.x = -0.08;
  hatCrown.material = materials.hatStraw;
  hatCrown.parent = hatNode;

  const ribbon = MeshBuilder.CreateTorus(`${idPrefix}-hat-ribbon`, {
    diameter: 0.90,
    thickness: 0.035,
    tessellation: 16,
  }, scene);
  ribbon.position.set(0, 0.78, -0.05);
  ribbon.rotation.x = -0.08;
  ribbon.material = materials.hatRibbon;
  ribbon.parent = hatNode;

  // ==========================================
  // 5. CHÂN TAY MŨM MĨM & BỐT DA CHIBI
  // ==========================================
  function createArm(isLeft) {
    const side = isLeft ? 1 : -1;
    const armRoot = new TransformNode(`${idPrefix}-arm-root-${isLeft ? 'l' : 'r'}`, scene);
    armRoot.position.set(side * 0.32, 0.38, 0);
    armRoot.parent = torsoNode;

    // Tay áo cộc bồng bềnh
    const sleeve = MeshBuilder.CreateSphere(`${idPrefix}-sleeve-${isLeft ? 'l' : 'r'}`, {
      diameter: 0.22,
      segments: 8,
    }, scene);
    sleeve.scaling.set(0.9, 1.1, 0.9);
    sleeve.position.set(0, -0.05, 0);
    sleeve.material = materials.shirt;
    sleeve.parent = armRoot;

    // Cánh tay Chibi mũm mĩm
    const arm = MeshBuilder.CreateCylinder(`${idPrefix}-arm-${isLeft ? 'l' : 'r'}`, {
      height: 0.32,
      diameterTop: 0.16,
      diameterBottom: 0.13,
      tessellation: 12,
    }, scene);
    arm.position.y = -0.22;
    arm.material = materials.skin;
    arm.parent = armRoot;

    // Bàn tay bánh mochi tròn xinh xắn có ngón cái
    const hand = MeshBuilder.CreateSphere(`${idPrefix}-hand-${isLeft ? 'l' : 'r'}`, {
      diameter: 0.15,
      segments: 8,
    }, scene);
    hand.position.set(0, -0.40, 0.02);
    hand.material = materials.skin;
    hand.parent = armRoot;

    const thumb = MeshBuilder.CreateSphere(`${idPrefix}-thumb-${isLeft ? 'l' : 'r'}`, {
      diameter: 0.065,
      segments: 6,
    }, scene);
    thumb.position.set(-side * 0.05, -0.38, 0.06);
    thumb.material = materials.skin;
    thumb.parent = armRoot;

    return armRoot;
  }

  const leftArm = createArm(true);
  const rightArm = createArm(false);

  function createLeg(isLeft) {
    const side = isLeft ? 1 : -1;
    const legRoot = new TransformNode(`${idPrefix}-leg-root-${isLeft ? 'l' : 'r'}`, scene);
    legRoot.position.set(side * 0.16, -0.02, 0);
    legRoot.parent = torsoNode;

    // Ống quần yếm ngắn
    const pantLeg = MeshBuilder.CreateCylinder(`${idPrefix}-pant-leg-${isLeft ? 'l' : 'r'}`, {
      height: 0.28,
      diameterTop: 0.22,
      diameterBottom: 0.20,
      tessellation: 12,
    }, scene);
    pantLeg.position.y = -0.14;
    pantLeg.material = materials.overalls;
    pantLeg.parent = legRoot;

    // Bốt da Chibi mũm mĩm cổ ngắn
    const boot = MeshBuilder.CreateCylinder(`${idPrefix}-boot-${isLeft ? 'l' : 'r'}`, {
      height: 0.26,
      diameterTop: 0.20,
      diameterBottom: 0.24,
      tessellation: 12,
    }, scene);
    boot.position.set(0, -0.32, 0.04);
    boot.scaling.z = 1.25;
    boot.material = materials.boots;
    boot.parent = legRoot;

    // Đế cao su dày chắc nịch
    const sole = MeshBuilder.CreateCylinder(`${idPrefix}-sole-${isLeft ? 'l' : 'r'}`, {
      height: 0.06,
      diameter: 0.25,
      tessellation: 12,
    }, scene);
    sole.position.set(0, -0.45, 0.04);
    sole.scaling.z = 1.28;
    sole.material = materials.bootSole;
    sole.parent = legRoot;

    return legRoot;
  }

  const leftLeg = createLeg(true);
  const rightLeg = createLeg(false);

  // ==========================================
  // 6. CÔNG CỤ NÔNG TRẠI 3D (Handheld Tool Props)
  // ==========================================
  const toolMatWood = makeMat(scene, 'tool-mat-wood', '#78350f');
  const toolMatIron = makeMat(scene, 'tool-mat-iron', '#94a3b8');
  const toolMatCan = makeMat(scene, 'tool-mat-can', '#38bdf8', '#0284c7');
  const toolMatPouch = makeMat(scene, 'tool-mat-pouch', '#d97706');
  const toolMatBasket = makeMat(scene, 'tool-mat-basket', '#b45309');

  const toolsNode = new TransformNode(`${idPrefix}-tools-root`, scene);
  toolsNode.parent = rightArm;
  toolsNode.position.set(0, -0.42, 0.06);

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
    [head, shirtBody, dungareesBib].forEach(m => shadowGenerator.addShadowCaster(m));
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
  let blinkTimer = Math.random() * 2;

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
    setOutfitColor(color) {
      materials.shirt.diffuseColor = Color3.FromHexString(color);
    },
    setOutfit(id, color) {
      if (color) materials.shirt.diffuseColor = Color3.FromHexString(color);
      if (hatNode) hatNode.setEnabled(id === 'farmer');
    },
    setHatVisible(visible) {
      if (hatNode) hatNode.setEnabled(visible);
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
      updateToolVisibility();
    },
    isPerformingAction() {
      return Boolean(currentAction);
    },
    animate(delta, isMoving = false, speed = 1.0) {
      animTimer += delta;

      // 0. Chớp mắt Anime tự nhiên (Blinking Eyes System)
      blinkTimer += delta;
      if (blinkTimer > 3.2) {
        eyeMeshes.forEach(e => { e.scaling.y = 0.06; });
        eyeHighlights.forEach(h => h.setEnabled(false));
        if (blinkTimer > 3.34) {
          eyeMeshes.forEach(e => { e.scaling.y = 1.25; });
          eyeHighlights.forEach(h => h.setEnabled(true));
          blinkTimer = (Math.random() - 0.5) * 1.5;
        }
      }

      // Cọng tóc ngố (Ahoge) đung đưa nhẹ
      ahogeNode.rotation.z = Math.sin(animTimer * 4) * 0.15;

      // 1. Xử lý Action Animation chuyên biệt (Cuốc đất, Tưới nước, Gieo hạt, Thu hoạch, Vẫy tay)
      if (currentAction) {
        actionTime += delta;
        const p = Math.min(1.0, actionTime / actionDuration);

        if (currentAction === 'till' || currentAction === 'hoe') {
          // Cuốc đất: Nhấc cuốc cao ngã nhẹ ra sau rồi dồn lực bổ mạnh xuống
          if (p < 0.4) {
            const windUp = p / 0.4;
            rightArm.rotation.x = -0.5 - windUp * 1.6;
            rightArm.rotation.y = -0.2;
            leftArm.rotation.x = -0.3 - windUp * 1.3;
            torsoNode.position.y = 0.68 + windUp * 0.05;
            torsoNode.rotation.x = -windUp * 0.15;
          } else if (p < 0.7) {
            const strike = (p - 0.4) / 0.3;
            rightArm.rotation.x = -2.1 + strike * 3.1;
            leftArm.rotation.x = -1.6 + strike * 2.4;
            torsoNode.position.y = 0.73 - strike * 0.18;
            torsoNode.rotation.x = strike * 0.35;

            if (p >= 0.55 && !actionHitFired) {
              actionHitFired = true;
              onActionHit?.();
            }
          } else {
            const recover = (p - 0.7) / 0.3;
            rightArm.rotation.x = 1.0 - recover * 1.0;
            leftArm.rotation.x = 0.8 - recover * 0.8;
            torsoNode.position.y = 0.55 + recover * 0.13;
            torsoNode.rotation.x = 0.35 - recover * 0.35;
          }
        } else if (currentAction === 'water') {
          // Tưới nước: Hai tay ôm bình nghiêng dốc nước
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
          // Gieo hạt: Vung tay nhẹ nhàng rải hạt giống
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
          // Thu hoạch: Cúi xuống nhặt nông sản rồi giơ 2 tay nhảy cẫng ăn mừng
          if (p < 0.4) {
            const bend = p / 0.4;
            torsoNode.position.y = 0.68 - bend * 0.18;
            torsoNode.rotation.x = bend * 0.45;
            leftArm.rotation.x = bend * 0.7;
            rightArm.rotation.x = bend * 0.7;
            if (p >= 0.35 && !actionHitFired) {
              actionHitFired = true;
              onActionHit?.();
            }
          } else {
            const jump = (p - 0.4) / 0.6;
            torsoNode.position.y = 0.50 + Math.sin(jump * Math.PI) * 0.35;
            torsoNode.rotation.x = 0;
            leftArm.rotation.x = -2.5;
            leftArm.rotation.z = -0.35;
            rightArm.rotation.x = -2.5;
            rightArm.rotation.z = 0.35;
            headNode.rotation.x = -0.25;
          }
        } else if (currentAction === 'wave') {
          // Vẫy tay chào: Giơ tay cao vẫy qua lại
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
          rightArm.rotation.set(0, 0, 0);
          leftArm.rotation.set(0, 0, 0);
          torsoNode.position.y = 0.68;
          torsoNode.rotation.set(0, 0, 0);
          headNode.rotation.set(0, 0, 0);
          onActionEnd?.();
        }
        return;
      }

      // 2. Di chuyển bước chân (Walk Cycle) hoặc Đứng thở (Idle Cycle)
      if (isMoving) {
        const walkCycle = animTimer * 10 * Math.max(0.6, speed / 4);

        leftLeg.rotation.x = Math.sin(walkCycle) * 0.65;
        rightLeg.rotation.x = -Math.sin(walkCycle) * 0.65;

        leftArm.rotation.x = -Math.sin(walkCycle) * 0.55;
        leftArm.rotation.y = 0;
        leftArm.rotation.z = 0;

        rightArm.rotation.x = Math.sin(walkCycle) * 0.55;
        rightArm.rotation.y = 0;
        rightArm.rotation.z = 0;

        // Độ nảy đàn hồi bước chân Chibi (Squash & Stretch)
        torsoNode.position.y = 0.68 + Math.abs(Math.sin(walkCycle)) * 0.06;
        torsoNode.scaling.y = 1.0 - Math.abs(Math.sin(walkCycle)) * 0.04;
        torsoNode.scaling.x = 1.0 + Math.abs(Math.sin(walkCycle)) * 0.025;
        torsoNode.scaling.z = 1.0 + Math.abs(Math.sin(walkCycle)) * 0.025;

        torsoNode.rotation.x = 0.04;
        headNode.rotation.z = Math.sin(walkCycle) * 0.04;
        headNode.rotation.x = 0.04;

        hairRoot.rotation.x = Math.sin(walkCycle) * 0.04;
        hairRoot.rotation.z = Math.cos(walkCycle) * 0.03;

        // Balo sau lưng nhún nảy theo nhịp chạy
        backpackNode.rotation.x = Math.sin(walkCycle * 2) * 0.08;
      } else {
        const idleCycle = animTimer * 2.5;

        torsoNode.position.y = 0.68 + Math.sin(idleCycle) * 0.015;
        torsoNode.scaling.set(1.0, 1.0, 1.0);
        torsoNode.rotation.set(0, 0, 0);

        // Thỉnh thoảng nghiêng nhẹ đầu sang một bên tò mò
        headNode.rotation.z = Math.sin(idleCycle * 0.5) * 0.035;
        headNode.rotation.x = 0;
        hairRoot.rotation.set(0, 0, 0);
        backpackNode.rotation.x = 0;

        leftLeg.rotation.x *= 0.85;
        rightLeg.rotation.x *= 0.85;

        leftArm.rotation.x *= 0.85;
        leftArm.rotation.y = 0;
        leftArm.rotation.z = 0;

        rightArm.rotation.x *= 0.85;
        rightArm.rotation.y = 0;
        rightArm.rotation.z = 0;
      }
    },
  };
}
