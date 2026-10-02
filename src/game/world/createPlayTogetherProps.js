import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial, triggerToyBounce } from '../rendering/PlayTogetherTheme.js';

let propCounter = 0;

/**
 * TẠO CÂY KẸO BÔNG PHÚNG PHÍNH (Fluffy Marshmallow / Lollipop Tree)
 * Phong cách Play Together:
 * - Thân cây hình ống bo tròn màu caramel/mật ong bóng mịn
 * - Tán lá hình đám mây kẹo dẻo gồm các khối cầu phồng xếp tầng mềm mại
 * - Rải các viên kẹo quả mọng ngọt ngào (Candy Sprinkles)
 * - Hiệu ứng đung đưa idle nhẹ nhàng theo gió
 */
export function createMarshmallowTree(scene, x, z, options = {}) {
  const {
    scale = 1.0,
    colorVariant = 'mint', // 'mint' | 'sakura' | 'honey' | 'lavender'
    shadows = null,
    hasCandies = true,
    name = 'marshmallow-tree',
  } = options;

  const id = ++propCounter;
  const root = new TransformNode(`${name}-${id}`, scene);
  root.position.set(x, 0, z);
  root.scaling.set(scale, scale, scale);

  // Chọn bộ màu tán lá theo variant
  let canopyMainHex = PLAY_TOGETHER_PALETTE.pastels.mintGreen;
  let canopyTopHex = '#bbf7d0';
  if (colorVariant === 'sakura') {
    canopyMainHex = PLAY_TOGETHER_PALETTE.pastels.strawberryPink;
    canopyTopHex = PLAY_TOGETHER_PALETTE.pastels.peachBlush;
  } else if (colorVariant === 'honey') {
    canopyMainHex = PLAY_TOGETHER_PALETTE.pastels.butterYellow;
    canopyTopHex = '#fef08a';
  } else if (colorVariant === 'lavender') {
    canopyMainHex = PLAY_TOGETHER_PALETTE.pastels.lavender;
    canopyTopHex = '#e9d5ff';
  }

  const trunkMat = createToyMaterial(scene, 'mat-toy-trunk-caramel', PLAY_TOGETHER_PALETTE.farm.honeyWood, {
    specularPower: 48,
    specularLevel: 0.28,
  });

  const canopyMat = createToyMaterial(scene, `mat-canopy-${colorVariant}`, canopyMainHex, {
    specularPower: 72,
    specularLevel: 0.4,
    ambientScale: 0.48,
  });

  const canopyTopMat = createToyMaterial(scene, `mat-canopy-top-${colorVariant}`, canopyTopHex, {
    specularPower: 80,
    specularLevel: 0.45,
    ambientScale: 0.52,
  });

  // 1. Thân cây đồ chơi: Trụ tròn vuốt nhẹ lên trên, có rễ gốc bo tròn êm
  const trunk = MeshBuilder.CreateCylinder(`tree-trunk-${id}`, {
    height: 3.2,
    diameterTop: 0.52,
    diameterBottom: 0.82,
    tessellation: 16,
  }, scene);
  trunk.position.y = 1.6;
  trunk.material = trunkMat;
  trunk.parent = root;

  // Vòng gốc rễ tròn mềm mại (cushion base)
  const baseRing = MeshBuilder.CreateTorus(`tree-base-ring-${id}`, {
    diameter: 0.95,
    thickness: 0.26,
    tessellation: 16,
  }, scene);
  baseRing.position.y = 0.13;
  baseRing.material = trunkMat;
  baseRing.parent = root;

  // 2. Tán lá Kẹo Bông (Fluffy Marshmallow Cloud): Cụm 5 khối cầu phồng lồng nhau
  const canopyRoot = new TransformNode(`canopy-root-${id}`, scene);
  canopyRoot.position.y = 3.2;
  canopyRoot.parent = root;

  // Cầu chính trung tâm
  const centerPuff = MeshBuilder.CreateSphere(`puff-center-${id}`, {
    diameterX: 3.4,
    diameterY: 2.6,
    diameterZ: 3.4,
    segments: 14,
  }, scene);
  centerPuff.position.set(0, 0.4, 0);
  centerPuff.material = canopyMat;
  centerPuff.parent = canopyRoot;

  // Chóp bồng bềnh trên đỉnh (màu sáng hơn)
  const topPuff = MeshBuilder.CreateSphere(`puff-top-${id}`, {
    diameterX: 2.4,
    diameterY: 1.8,
    diameterZ: 2.4,
    segments: 12,
  }, scene);
  topPuff.position.set(0, 1.45, 0);
  topPuff.material = canopyTopMat;
  topPuff.parent = canopyRoot;

  // 3 Búi phồng xung quanh tạo dáng marshmallow nhấp nhô
  const sideOffsets = [
    { x: 1.1, y: 0.2, z: 0.4, r: 2.0 },
    { x: -1.0, y: 0.3, z: 0.5, r: 1.9 },
    { x: 0.1, y: 0.1, z: -1.1, r: 2.1 },
  ];

  const sidePuffs = sideOffsets.map((p, idx) => {
    const puff = MeshBuilder.CreateSphere(`puff-side-${id}-${idx}`, {
      diameterX: p.r,
      diameterY: p.r * 0.85,
      diameterZ: p.r,
      segments: 12,
    }, scene);
    puff.position.set(p.x, p.y, p.z);
    puff.material = canopyMat;
    puff.parent = canopyRoot;
    return puff;
  });

  // 3. Kẹo quả mọng ngọt ngào (Candy Berry Sprinkles)
  if (hasCandies) {
    const berryColors = [
      PLAY_TOGETHER_PALETTE.pastels.strawberryPink,
      PLAY_TOGETHER_PALETTE.pastels.butterYellow,
      PLAY_TOGETHER_PALETTE.pastels.skyBlue,
    ];
    const berryCoords = [
      { x: 1.4, y: 0.7, z: 0.8, c: berryColors[0] },
      { x: -1.3, y: 0.6, z: 0.6, c: berryColors[1] },
      { x: 0.7, y: 1.5, z: 0.9, c: berryColors[2] },
      { x: -0.6, y: 1.6, z: -0.8, c: berryColors[0] },
      { x: 0.2, y: 0.5, z: 1.7, c: berryColors[1] },
      { x: -0.8, y: 0.4, z: -1.4, c: berryColors[2] },
    ];

    berryCoords.forEach((bc, bIdx) => {
      const berry = MeshBuilder.CreateSphere(`candy-berry-${id}-${bIdx}`, {
        diameter: 0.34,
        segments: 8,
      }, scene);
      berry.position.set(bc.x, bc.y, bc.z);
      berry.material = createToyMaterial(scene, `mat-candy-berry-${bc.c}`, bc.c, {
        specularPower: 96,
        specularLevel: 0.6,
        emissiveScale: 0.12,
      });
      berry.parent = canopyRoot;
    });
  }

  // Đổ bóng mềm
  if (shadows) {
    shadows.addShadowCaster(trunk);
    shadows.addShadowCaster(centerPuff);
    shadows.addShadowCaster(topPuff);
    sidePuffs.forEach(p => shadows.addShadowCaster(p));
  }

  // Chuyển động đung đưa nhịp nhàng (Gentle Wind Sway)
  const swayOffset = (x * 3.7 + z * 5.1) % 100;
  const animObserver = scene.onBeforeRenderObservable.add(() => {
    if (root.isDisposed()) {
      scene.onBeforeRenderObservable.remove(animObserver);
      return;
    }
    const t = (performance.now() * 0.0015) + swayOffset;
    canopyRoot.rotation.z = Math.sin(t) * 0.035;
    canopyRoot.rotation.x = Math.cos(t * 0.8) * 0.025;
  });

  return root;
}

/**
 * TẠO LUỐNG NÔNG SẢN & CỦ CÀ RỐT CHIBI PLAY TOGETHER
 * - Ụ đất mùn tơi xốp bo tròn mềm màu sô-cô-la ấm áp
 * - Củ cà rốt mập lùn nhô lên mặt đất với làn da cam tươi bóng bẩy
 * - Mắt hoạt hình catchlights đáng yêu và 3 cánh lá chong chóng kẹo
 * - Ngôi sao vàng 3D xoay tít khi chín mời gọi thu hoạch
 */
export function createChibiCarrotMesh(scene, key, progress, options = {}) {
  const root = new TransformNode(`chibi-carrot-root-${key}`, scene);
  const shadows = options.shadows || null;

  // 1. Ụ đất sô-cô-la bánh bông lan bo tròn (Rounded Chocolate Soil Mound)
  const soilMat = createToyMaterial(scene, 'mat-toy-soil-choc', PLAY_TOGETHER_PALETTE.farm.chocolateSoil, {
    specularPower: 24,
    specularLevel: 0.12,
    ambientScale: 0.42,
  });

  const mound = MeshBuilder.CreateSphere(`soil-mound-${key}`, {
    diameterX: 1.15,
    diameterY: 0.32,
    diameterZ: 1.15,
    segments: 10,
  }, scene);
  mound.position.y = 0.08;
  mound.material = soilMat;
  mound.parent = root;

  // Vành cỏ xanh non viền nhẹ chân ụ đất
  const rimMat = createToyMaterial(scene, 'mat-toy-soil-rim', PLAY_TOGETHER_PALETTE.farm.freshSprout, {
    specularPower: 32,
    specularLevel: 0.15,
  });
  const grassRing = MeshBuilder.CreateTorus(`soil-ring-${key}`, {
    diameter: 1.05,
    thickness: 0.12,
    tessellation: 12,
  }, scene);
  grassRing.position.y = 0.05;
  grassRing.material = rimMat;
  grassRing.parent = root;

  const carrotGroup = new TransformNode(`carrot-body-group-${key}`, scene);
  carrotGroup.parent = root;

  // Tính toán scale và trạng thái theo độ trưởng thành
  const isMature = progress >= 1.0;
  const isMid = progress >= 0.4;
  const growScale = progress < 0.35 ? (0.65 + progress * 0.9) : (0.95 + (progress - 0.35) * 0.4);
  carrotGroup.scaling.set(growScale, growScale, growScale);

  // Vật liệu củ cà rốt: Cam tươi rói, phản chiếu bóng bẩy đồ chơi
  const carrotMat = createToyMaterial(scene, 'mat-toy-carrot-body', PLAY_TOGETHER_PALETTE.farm.carrotOrange, {
    specularPower: 80,
    specularLevel: 0.5,
    ambientScale: 0.45,
  });

  // Vật liệu lá: Xanh ngọc bích tươi sáng
  const leafMat = createToyMaterial(scene, 'mat-toy-carrot-leaf', PLAY_TOGETHER_PALETTE.farm.leafGreen, {
    specularPower: 64,
    specularLevel: 0.38,
    ambientScale: 0.5,
  });

  if (progress < 0.25) {
    // Giai đoạn 1: Mầm xanh hạt non mới nhú (Twin Cute Sprouts)
    [-0.12, 0.12].forEach((lx, i) => {
      const sprout = MeshBuilder.CreateSphere(`sprout-${key}-${i}`, {
        diameterX: 0.22,
        diameterY: 0.38,
        diameterZ: 0.14,
        segments: 8,
      }, scene);
      sprout.rotation.z = lx > 0 ? -0.35 : 0.35;
      sprout.position.set(lx, 0.2, 0);
      sprout.material = leafMat;
      sprout.parent = carrotGroup;
    });
  } else {
    // Giai đoạn 2 & 3: Thân củ cà rốt mập ú nhô lên
    const carrotBody = MeshBuilder.CreateCylinder(`carrot-cone-${key}`, {
      height: 0.95,
      diameterTop: 0.65,
      diameterBottom: 0.28,
      tessellation: 14,
    }, scene);
    carrotBody.position.y = 0.38;
    carrotBody.material = carrotMat;
    carrotBody.parent = carrotGroup;

    // Chóp đầu củ bo tròn mập
    const carrotTop = MeshBuilder.CreateSphere(`carrot-top-${key}`, {
      diameterX: 0.65,
      diameterY: 0.35,
      diameterZ: 0.65,
      segments: 10,
    }, scene);
    carrotTop.position.y = 0.82;
    carrotTop.material = carrotMat;
    carrotTop.parent = carrotGroup;

    // 3 Cánh lá chong chóng bo tròn xoè rộng phúng phính
    const leafAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
    leafAngles.forEach((ang, idx) => {
      const leafStem = new TransformNode(`leaf-stem-${key}-${idx}`, scene);
      leafStem.position.set(0, 0.9, 0);
      leafStem.rotation.y = ang;
      leafStem.parent = carrotGroup;

      const leafBlade = MeshBuilder.CreateSphere(`leaf-blade-${key}-${idx}`, {
        diameterX: 0.26,
        diameterY: 0.62,
        diameterZ: 0.12,
        segments: 8,
      }, scene);
      leafBlade.rotation.x = 0.55; // Xoè nghiêng hoạt hình
      leafBlade.position.set(0, 0.26, 0.22);
      leafBlade.material = leafMat;
      leafBlade.parent = leafStem;
    });

    // Điểm nhấn Anime Catchlights hoặc Mắt cười khi trưởng thành (Mature Face)
    if (isMature) {
      const eyeMat = createToyMaterial(scene, 'mat-toy-eye-dark', '#1e293b', {
        specularPower: 96,
        specularLevel: 0.7,
      });
      const hlMat = createToyMaterial(scene, 'mat-toy-hl-white', '#ffffff', {
        emissiveHex: '#ffffff',
      });
      const blushMat = createToyMaterial(scene, 'mat-toy-blush-pink', PLAY_TOGETHER_PALETTE.pastels.peachBlush, {
        emissiveScale: 0.25,
      });

      // Đôi mắt hạt tròn
      [-0.14, 0.14].forEach((ex, i) => {
        const eye = MeshBuilder.CreateSphere(`carrot-eye-${key}-${i}`, {
          diameter: 0.09,
          segments: 6,
        }, scene);
        eye.position.set(ex, 0.54, 0.3);
        eye.material = eyeMat;
        eye.parent = carrotGroup;

        // Điểm sáng catchlight long lanh
        const hl = MeshBuilder.CreateSphere(`carrot-hl-${key}-${i}`, {
          diameter: 0.038,
          segments: 4,
        }, scene);
        hl.position.set(ex + 0.018, 0.56, 0.33);
        hl.material = hlMat;
        hl.parent = carrotGroup;
      });

      // Hai bên má hồng phúng phính (Cute Blush)
      [-0.22, 0.22].forEach((bx, i) => {
        const blush = MeshBuilder.CreateDisc(`carrot-blush-${key}-${i}`, {
          radius: 0.07,
          tessellation: 10,
        }, scene);
        blush.position.set(bx, 0.44, 0.28);
        blush.rotation.y = bx > 0 ? 0.25 : -0.25;
        blush.material = blushMat;
        blush.parent = carrotGroup;
      });
    }

    if (shadows) {
      shadows.addShadowCaster(carrotBody);
    }
  }

  // 3. Biểu tượng Ngôi Sao Vàng 3D Lơ Lửng khi Chín (Spinning Star Quest/Harvest Icon)
  let starIcon = null;
  if (isMature) {
    const starRoot = new TransformNode(`star-root-${key}`, scene);
    starRoot.position.set(0, 1.85, 0);
    starRoot.parent = root;

    // Ngôi sao vàng 3D ghép từ 2 hình chóp kim cương nổi bật
    const starMat = createToyMaterial(scene, 'mat-toy-gold-star', PLAY_TOGETHER_PALETTE.fx.goldStar, {
      emissiveHex: '#f59e0b',
      specularPower: 128,
      specularLevel: 0.8,
    });

    const starMesh = MeshBuilder.CreateCylinder(`gold-star-${key}`, {
      height: 0.12,
      diameter: 0.58,
      tessellation: 5,
    }, scene);
    starMesh.rotation.x = Math.PI / 2;
    starMesh.material = starMat;
    starMesh.parent = starRoot;

    // Vòng hào quang sáng mỏng quanh ngôi sao
    const haloRing = MeshBuilder.CreateTorus(`star-halo-${key}`, {
      diameter: 0.75,
      thickness: 0.03,
      tessellation: 16,
    }, scene);
    haloRing.material = starMat;
    haloRing.parent = starRoot;

    starIcon = starRoot;

    // Kích hoạt nảy nhún Squash & Stretch nhẹ khi vừa chín
    triggerToyBounce(scene, carrotGroup, { bounceFactor: 1.18 });
  }

  return {
    root,
    carrotGroup,
    animate: (t) => {
      // Hiệu ứng idle đung đưa nhẹ
      const wave = Math.sin(t * 0.003 + (key.charCodeAt(0) || 0));
      carrotGroup.rotation.z = wave * 0.04;
      if (starIcon && !starIcon.isDisposed()) {
        starIcon.position.y = 1.85 + Math.sin(t * 0.004) * 0.12;
        starIcon.rotation.y = t * 0.0025;
      }
    },
  };
}

/**
 * TẠO KHU VƯỜN TRƯNG BÀY MẪU PLAY TOGETHER (Showcase Vignette)
 * Đặt ngay tại khuôn viên gần nông trại người chơi để chiêm ngưỡng chất lượng visual
 */
export function createPlayTogetherShowcase(scene, origin, shadows = null) {
  const showcaseRoot = new TransformNode('playtogether-phase1-showcase', scene);
  showcaseRoot.position.set(origin.x, origin.y || 0, origin.z);

  // 1. Cặp Cây Kẹo Bông Marshmallow (1 Cây Xanh Mint + 1 Cây Hoa Anh Đào Sakura Hồng)
  const mintTree = createMarshmallowTree(scene, -4.5, 3.2, {
    scale: 1.15,
    colorVariant: 'mint',
    shadows,
    name: 'showcase-mint-tree',
  });
  mintTree.parent = showcaseRoot;

  const sakuraTree = createMarshmallowTree(scene, 4.8, 2.8, {
    scale: 1.25,
    colorVariant: 'sakura',
    shadows,
    name: 'showcase-sakura-tree',
  });
  sakuraTree.parent = showcaseRoot;

  // 2. Cây Honey Butter vàng chanh ở góc phía sau
  const honeyTree = createMarshmallowTree(scene, 0.2, 7.5, {
    scale: 1.05,
    colorVariant: 'honey',
    shadows,
    name: 'showcase-honey-tree',
  });
  honeyTree.parent = showcaseRoot;

  // 3. Biển hiệu Chào mừng Phong cách Pop-Art Play Together
  const signMat = createToyMaterial(scene, 'mat-toy-sign-wood', PLAY_TOGETHER_PALETTE.farm.honeyWood);
  const signBoardMat = createToyMaterial(scene, 'mat-toy-sign-board', PLAY_TOGETHER_PALETTE.pastels.butterYellow, {
    emissiveHex: '#fef08a',
    emissiveScale: 0.15,
  });

  const signPost = MeshBuilder.CreateCylinder('showcase-sign-post', {
    height: 1.8,
    diameter: 0.14,
    tessellation: 12,
  }, scene);
  signPost.position.set(-2.2, 0.9, -1.8);
  signPost.material = signMat;
  signPost.parent = showcaseRoot;

  const signBoard = MeshBuilder.CreateBox('showcase-sign-board', {
    width: 2.2,
    height: 0.9,
    depth: 0.14,
  }, scene);
  signBoard.position.set(-2.2, 1.6, -1.8);
  signBoard.material = signBoardMat;
  signBoard.parent = showcaseRoot;

  if (shadows) {
    shadows.addShadowCaster(signPost);
    shadows.addShadowCaster(signBoard);
  }

  return showcaseRoot;
}

/**
 * Tạo Icon Ngôi Sao Vàng 3D Lơ Lửng (Quest / Harvest Star)
 */
function createHarvestStar(scene, parent, key) {
  const starRoot = new TransformNode(`star-root-${key}`, scene);
  starRoot.position.set(0, 1.85, 0);
  starRoot.parent = parent;

  const starMat = createToyMaterial(scene, 'mat-toy-gold-star', PLAY_TOGETHER_PALETTE.fx.goldStar, {
    emissiveHex: '#f59e0b',
    specularPower: 128,
    specularLevel: 0.8,
  });

  const starMesh = MeshBuilder.CreateCylinder(`gold-star-${key}`, {
    height: 0.12,
    diameter: 0.58,
    tessellation: 5,
  }, scene);
  starMesh.rotation.x = Math.PI / 2;
  starMesh.material = starMat;
  starMesh.parent = starRoot;

  const haloRing = MeshBuilder.CreateTorus(`star-halo-${key}`, {
    diameter: 0.75,
    thickness: 0.03,
    tessellation: 16,
  }, scene);
  haloRing.material = starMat;
  haloRing.parent = starRoot;

  return starRoot;
}

/**
 * TẠO BÍ NGÔ CHIBI PLAY TOGETHER (Chibi Pumpkin)
 * - Quả phồng tròn xoe gồm các múi bí ngô mập mạp màu vàng cam mật ong
 * - Cuống xanh xoắn hoạt hình
 * - Gương mặt cười tít mắt ngộ nghĩnh khi chín
 */
export function createChibiPumpkinMesh(scene, key, progress, options = {}) {
  const root = new TransformNode(`chibi-pumpkin-root-${key}`, scene);
  const shadows = options.shadows || null;

  // Ụ đất sô-cô-la bo tròn
  const soilMat = createToyMaterial(scene, 'mat-toy-soil-choc', PLAY_TOGETHER_PALETTE.farm.chocolateSoil);
  const mound = MeshBuilder.CreateSphere(`pumpkin-mound-${key}`, {
    diameterX: 1.25,
    diameterY: 0.3,
    diameterZ: 1.25,
    segments: 10,
  }, scene);
  mound.position.y = 0.08;
  mound.material = soilMat;
  mound.parent = root;

  const bodyGroup = new TransformNode(`pumpkin-body-group-${key}`, scene);
  bodyGroup.parent = root;

  const isMature = progress >= 1.0;
  const growScale = progress < 0.35 ? (0.6 + progress * 0.9) : (0.9 + (progress - 0.35) * 0.45);
  bodyGroup.scaling.set(growScale, growScale, growScale);

  const pumpkinMat = createToyMaterial(scene, 'mat-toy-pumpkin', PLAY_TOGETHER_PALETTE.farm.pumpkinGold, {
    specularPower: 72,
    specularLevel: 0.45,
    ambientScale: 0.46,
  });
  const stemMat = createToyMaterial(scene, 'mat-toy-pumpkin-stem', PLAY_TOGETHER_PALETTE.farm.leafDark, {
    specularPower: 64,
    specularLevel: 0.35,
  });

  if (progress < 0.25) {
    // Mầm non
    const sprout = MeshBuilder.CreateSphere(`pumpkin-sprout-${key}`, { diameter: 0.35, segments: 8 }, scene);
    sprout.position.y = 0.22;
    sprout.material = stemMat;
    sprout.parent = bodyGroup;
  } else {
    // Quả bí ngô: Ghép 5 múi tròn xoe lồng nhau
    const lobeAngles = [0, (Math.PI * 2) / 5, (Math.PI * 4) / 5, (Math.PI * 6) / 5, (Math.PI * 8) / 5];
    lobeAngles.forEach((ang, idx) => {
      const lobe = MeshBuilder.CreateSphere(`pumpkin-lobe-${key}-${idx}`, {
        diameterX: 0.65,
        diameterY: 0.72,
        diameterZ: 0.65,
        segments: 10,
      }, scene);
      lobe.position.set(Math.cos(ang) * 0.22, 0.42, Math.sin(ang) * 0.22);
      lobe.material = pumpkinMat;
      lobe.parent = bodyGroup;
      if (shadows) shadows.addShadowCaster(lobe);
    });

    // Cuống bí ngô uốn cong trên đỉnh
    const stem = MeshBuilder.CreateCylinder(`pumpkin-stem-${key}`, {
      height: 0.38,
      diameterTop: 0.1,
      diameterBottom: 0.18,
      tessellation: 8,
    }, scene);
    stem.position.set(0.04, 0.88, 0);
    stem.rotation.z = 0.25;
    stem.material = stemMat;
    stem.parent = bodyGroup;

    // Mặt cười Chibi khi chín
    if (isMature) {
      const eyeMat = createToyMaterial(scene, 'mat-toy-eye-dark', '#1e293b');
      [-0.18, 0.18].forEach((ex, i) => {
        const eye = MeshBuilder.CreateSphere(`pumpkin-eye-${key}-${i}`, { diameter: 0.1, segments: 6 }, scene);
        eye.position.set(ex, 0.46, 0.42);
        eye.material = eyeMat;
        eye.parent = bodyGroup;
      });
      const smile = MeshBuilder.CreateTorus(`pumpkin-smile-${key}`, {
        diameter: 0.18,
        thickness: 0.035,
        tessellation: 10,
      }, scene);
      smile.rotation.x = Math.PI / 2;
      smile.position.set(0, 0.35, 0.44);
      smile.material = eyeMat;
      smile.parent = bodyGroup;
    }
  }

  let starIcon = null;
  if (isMature) {
    starIcon = createHarvestStar(scene, root, key);
    triggerToyBounce(scene, bodyGroup, { bounceFactor: 1.18 });
  }

  return {
    root,
    animate: (t) => {
      bodyGroup.rotation.z = Math.sin(t * 0.003 + (key.charCodeAt(0) || 0)) * 0.04;
      if (starIcon && !starIcon.isDisposed()) {
        starIcon.position.y = 1.85 + Math.sin(t * 0.004) * 0.12;
        starIcon.rotation.y = t * 0.0025;
      }
    },
  };
}

/**
 * TẠO CỦ CẢI ĐỎ CHIBI PLAY TOGETHER (Chibi Radish / Turnip)
 * - Dáng giọt nước tròn ú mũm mĩm, màu hồng cánh sen tươi tắn
 * - 3 phiến lá to bản hình thìa kẹo
 */
export function createChibiTurnipMesh(scene, key, progress, options = {}) {
  const root = new TransformNode(`chibi-turnip-root-${key}`, scene);
  const shadows = options.shadows || null;

  const soilMat = createToyMaterial(scene, 'mat-toy-soil-choc', PLAY_TOGETHER_PALETTE.farm.chocolateSoil);
  const mound = MeshBuilder.CreateSphere(`turnip-mound-${key}`, {
    diameterX: 1.15,
    diameterY: 0.28,
    diameterZ: 1.15,
    segments: 10,
  }, scene);
  mound.position.y = 0.08;
  mound.material = soilMat;
  mound.parent = root;

  const bodyGroup = new TransformNode(`turnip-body-group-${key}`, scene);
  bodyGroup.parent = root;

  const isMature = progress >= 1.0;
  const growScale = progress < 0.35 ? (0.6 + progress * 0.9) : (0.9 + (progress - 0.35) * 0.4);
  bodyGroup.scaling.set(growScale, growScale, growScale);

  const turnipMat = createToyMaterial(scene, 'mat-toy-turnip-pink', PLAY_TOGETHER_PALETTE.farm.radishPink, {
    specularPower: 80,
    specularLevel: 0.5,
    ambientScale: 0.48,
  });
  const leafMat = createToyMaterial(scene, 'mat-toy-turnip-leaf', PLAY_TOGETHER_PALETTE.farm.freshSprout, {
    specularPower: 64,
    specularLevel: 0.4,
    ambientScale: 0.5,
  });

  if (progress < 0.25) {
    const sprout = MeshBuilder.CreateSphere(`turnip-sprout-${key}`, { diameter: 0.32, segments: 8 }, scene);
    sprout.position.y = 0.2;
    sprout.material = leafMat;
    sprout.parent = bodyGroup;
  } else {
    // Thân củ cải tròn phồng hình quả lê ngược
    const bulb = MeshBuilder.CreateSphere(`turnip-bulb-${key}`, {
      diameterX: 0.85,
      diameterY: 0.95,
      diameterZ: 0.85,
      segments: 12,
    }, scene);
    bulb.position.y = 0.48;
    bulb.material = turnipMat;
    bulb.parent = bodyGroup;
    if (shadows) shadows.addShadowCaster(bulb);

    // 3 Cánh lá hình thìa bo tròn múp míp
    [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((ang, idx) => {
      const leafNode = new TransformNode(`turnip-leaf-node-${key}-${idx}`, scene);
      leafNode.position.set(0, 0.95, 0);
      leafNode.rotation.y = ang;
      leafNode.parent = bodyGroup;

      const blade = MeshBuilder.CreateSphere(`turnip-blade-${key}-${idx}`, {
        diameterX: 0.28,
        diameterY: 0.65,
        diameterZ: 0.12,
        segments: 8,
      }, scene);
      blade.rotation.x = 0.5;
      blade.position.set(0, 0.28, 0.22);
      blade.material = leafMat;
      blade.parent = leafNode;
    });

    if (isMature) {
      const eyeMat = createToyMaterial(scene, 'mat-toy-eye-dark', '#1e293b');
      [-0.14, 0.14].forEach((ex, i) => {
        const eye = MeshBuilder.CreateSphere(`turnip-eye-${key}-${i}`, { diameter: 0.08, segments: 6 }, scene);
        eye.position.set(ex, 0.56, 0.38);
        eye.material = eyeMat;
        eye.parent = bodyGroup;
      });
    }
  }

  let starIcon = null;
  if (isMature) {
    starIcon = createHarvestStar(scene, root, key);
    triggerToyBounce(scene, bodyGroup, { bounceFactor: 1.18 });
  }

  return {
    root,
    animate: (t) => {
      bodyGroup.rotation.z = Math.sin(t * 0.003 + (key.charCodeAt(0) || 0)) * 0.04;
      if (starIcon && !starIcon.isDisposed()) {
        starIcon.position.y = 1.85 + Math.sin(t * 0.004) * 0.12;
        starIcon.rotation.y = t * 0.0025;
      }
    },
  };
}

/**
 * TẠO DƯA HẤU CHIBI PLAY TOGETHER (Chibi Melon)
 * - Quả tròn lăn lóc bóng loáng màu xanh ngọc tươi với sọc xanh sẫm
 */
export function createChibiMelonMesh(scene, key, progress, options = {}) {
  const root = new TransformNode(`chibi-melon-root-${key}`, scene);
  const shadows = options.shadows || null;

  const soilMat = createToyMaterial(scene, 'mat-toy-soil-choc', PLAY_TOGETHER_PALETTE.farm.chocolateSoil);
  const mound = MeshBuilder.CreateSphere(`melon-mound-${key}`, {
    diameterX: 1.25,
    diameterY: 0.3,
    diameterZ: 1.25,
    segments: 10,
  }, scene);
  mound.position.y = 0.08;
  mound.material = soilMat;
  mound.parent = root;

  const bodyGroup = new TransformNode(`melon-body-group-${key}`, scene);
  bodyGroup.parent = root;

  const isMature = progress >= 1.0;
  const growScale = progress < 0.35 ? (0.6 + progress * 0.9) : (0.9 + (progress - 0.35) * 0.45);
  bodyGroup.scaling.set(growScale, growScale, growScale);

  const melonMat = createToyMaterial(scene, 'mat-toy-melon-green', PLAY_TOGETHER_PALETTE.farm.sweetMelon, {
    specularPower: 96,
    specularLevel: 0.55,
    ambientScale: 0.45,
  });
  const stripeMat = createToyMaterial(scene, 'mat-toy-melon-stripe', '#065f46', {
    specularPower: 72,
    specularLevel: 0.35,
  });
  const leafMat = createToyMaterial(scene, 'mat-toy-melon-leaf', PLAY_TOGETHER_PALETTE.farm.leafGreen);

  if (progress < 0.25) {
    const sprout = MeshBuilder.CreateSphere(`melon-sprout-${key}`, { diameter: 0.32, segments: 8 }, scene);
    sprout.position.y = 0.2;
    sprout.material = leafMat;
    sprout.parent = bodyGroup;
  } else {
    // Quả dưa hấu tròn xoe
    const melonBall = MeshBuilder.CreateSphere(`melon-ball-${key}`, {
      diameterX: 0.92,
      diameterY: 0.88,
      diameterZ: 0.92,
      segments: 14,
    }, scene);
    melonBall.position.y = 0.46;
    melonBall.material = melonMat;
    melonBall.parent = bodyGroup;
    if (shadows) shadows.addShadowCaster(melonBall);

    // 4 Sọc xanh hoạt hình viền quanh thân dưa
    [0, Math.PI / 4, Math.PI / 2, (Math.PI * 3) / 4].forEach((ang, idx) => {
      const ring = MeshBuilder.CreateTorus(`melon-stripe-${key}-${idx}`, {
        diameter: 0.93,
        thickness: 0.045,
        tessellation: 16,
      }, scene);
      ring.position.y = 0.46;
      ring.rotation.y = ang;
      ring.rotation.x = Math.PI / 2;
      ring.material = stripeMat;
      ring.parent = bodyGroup;
    });

    // Cuống xoăn hoạt họa trên đỉnh
    const stem = MeshBuilder.CreateTorus(`melon-stem-${key}`, {
      diameter: 0.2,
      thickness: 0.04,
      tessellation: 12,
    }, scene);
    stem.position.set(0, 0.92, 0);
    stem.rotation.x = Math.PI / 3;
    stem.material = leafMat;
    stem.parent = bodyGroup;
  }

  let starIcon = null;
  if (isMature) {
    starIcon = createHarvestStar(scene, root, key);
    triggerToyBounce(scene, bodyGroup, { bounceFactor: 1.18 });
  }

  return {
    root,
    animate: (t) => {
      bodyGroup.rotation.z = Math.sin(t * 0.003 + (key.charCodeAt(0) || 0)) * 0.04;
      if (starIcon && !starIcon.isDisposed()) {
        starIcon.position.y = 1.85 + Math.sin(t * 0.004) * 0.12;
        starIcon.rotation.y = t * 0.0025;
      }
    },
  };
}

/**
 * TẠO CÀ CHUA / DÂU TÂY CHIBI PLAY TOGETHER (Chibi Tomato & Strawberry)
 * - Quả tròn căng mọng màu đỏ tươi bọc đường, đài hoa 5 cánh ngôi sao
 */
export function createChibiTomatoMesh(scene, key, progress, options = {}) {
  const root = new TransformNode(`chibi-tomato-root-${key}`, scene);
  const shadows = options.shadows || null;

  const soilMat = createToyMaterial(scene, 'mat-toy-soil-choc', PLAY_TOGETHER_PALETTE.farm.chocolateSoil);
  const mound = MeshBuilder.CreateSphere(`tomato-mound-${key}`, {
    diameterX: 1.15,
    diameterY: 0.28,
    diameterZ: 1.15,
    segments: 10,
  }, scene);
  mound.position.y = 0.08;
  mound.material = soilMat;
  mound.parent = root;

  const bodyGroup = new TransformNode(`tomato-body-group-${key}`, scene);
  bodyGroup.parent = root;

  const isMature = progress >= 1.0;
  const growScale = progress < 0.35 ? (0.6 + progress * 0.9) : (0.9 + (progress - 0.35) * 0.45);
  bodyGroup.scaling.set(growScale, growScale, growScale);

  const tomatoMat = createToyMaterial(scene, 'mat-toy-tomato-red', '#ef4444', {
    specularPower: 128,
    specularLevel: 0.65,
    ambientScale: 0.45,
  });
  const calyxMat = createToyMaterial(scene, 'mat-toy-calyx', PLAY_TOGETHER_PALETTE.farm.leafDark);

  if (progress < 0.25) {
    const sprout = MeshBuilder.CreateSphere(`tomato-sprout-${key}`, { diameter: 0.3, segments: 8 }, scene);
    sprout.position.y = 0.2;
    sprout.material = calyxMat;
    sprout.parent = bodyGroup;
  } else {
    // Quả cà chua tròn căng mọng
    const fruit = MeshBuilder.CreateSphere(`tomato-fruit-${key}`, {
      diameterX: 0.82,
      diameterY: 0.74,
      diameterZ: 0.82,
      segments: 12,
    }, scene);
    fruit.position.y = 0.44;
    fruit.material = tomatoMat;
    fruit.parent = bodyGroup;
    if (shadows) shadows.addShadowCaster(fruit);

    // Đài hoa 5 cánh ngôi sao ôm trên đỉnh
    const calyx = MeshBuilder.CreateCylinder(`tomato-calyx-${key}`, {
      height: 0.04,
      diameter: 0.48,
      tessellation: 5,
    }, scene);
    calyx.position.y = 0.82;
    calyx.material = calyxMat;
    calyx.parent = bodyGroup;

    // Cuống nhỏ
    const stem = MeshBuilder.CreateCylinder(`tomato-stem-${key}`, {
      height: 0.18,
      diameter: 0.06,
    }, scene);
    stem.position.y = 0.92;
    stem.material = calyxMat;
    stem.parent = bodyGroup;
  }

  let starIcon = null;
  if (isMature) {
    starIcon = createHarvestStar(scene, root, key);
    triggerToyBounce(scene, bodyGroup, { bounceFactor: 1.18 });
  }

  return {
    root,
    animate: (t) => {
      bodyGroup.rotation.z = Math.sin(t * 0.003 + (key.charCodeAt(0) || 0)) * 0.04;
      if (starIcon && !starIcon.isDisposed()) {
        starIcon.position.y = 1.85 + Math.sin(t * 0.004) * 0.12;
        starIcon.rotation.y = t * 0.0025;
      }
    },
  };
}

/**
 * TẠO LÚA MÌ CHIBI PLAY TOGETHER (Chibi Wheat)
 * - 3 Bông lúa vàng óng bo cong nhẹ, các hạt lúa múp míp xếp tầng xốp mềm
 */
export function createChibiWheatMesh(scene, key, progress, options = {}) {
  const root = new TransformNode(`chibi-wheat-root-${key}`, scene);
  const shadows = options.shadows || null;

  const soilMat = createToyMaterial(scene, 'mat-toy-soil-choc', PLAY_TOGETHER_PALETTE.farm.chocolateSoil);
  const mound = MeshBuilder.CreateSphere(`wheat-mound-${key}`, {
    diameterX: 1.1,
    diameterY: 0.28,
    diameterZ: 1.1,
    segments: 10,
  }, scene);
  mound.position.y = 0.08;
  mound.material = soilMat;
  mound.parent = root;

  const bodyGroup = new TransformNode(`wheat-body-group-${key}`, scene);
  bodyGroup.parent = root;

  const isMature = progress >= 1.0;
  const growScale = progress < 0.35 ? (0.6 + progress * 0.8) : (0.85 + (progress - 0.35) * 0.45);
  bodyGroup.scaling.set(growScale, growScale, growScale);

  const wheatStemMat = createToyMaterial(scene, 'mat-toy-wheat-stem', '#eab308');
  const grainMat = createToyMaterial(scene, 'mat-toy-wheat-grain', '#fbbf24', {
    specularPower: 64,
    specularLevel: 0.45,
    ambientScale: 0.5,
  });

  const offsets = [
    { x: -0.15, z: 0.08, rotZ: 0.14 },
    { x: 0.15, z: 0.05, rotZ: -0.12 },
    { x: 0, z: -0.14, rotX: 0.15 },
  ];

  offsets.forEach((off, sIdx) => {
    const stalk = MeshBuilder.CreateCylinder(`wheat-stalk-${key}-${sIdx}`, {
      height: 1.4,
      diameterTop: 0.05,
      diameterBottom: 0.08,
      tessellation: 8,
    }, scene);
    stalk.position.set(off.x, 0.7, off.z);
    if (off.rotZ) stalk.rotation.z = off.rotZ;
    if (off.rotX) stalk.rotation.x = off.rotX;
    stalk.material = wheatStemMat;
    stalk.parent = bodyGroup;

    // Hạt lúa mập mạp xếp tầng trên ngọn
    for (let g = 0; g < 4; g++) {
      const grain = MeshBuilder.CreateSphere(`wheat-grain-${key}-${sIdx}-${g}`, {
        diameterX: 0.18,
        diameterY: 0.22,
        diameterZ: 0.18,
        segments: 6,
      }, scene);
      grain.position.set(off.x + (g % 2 === 0 ? 0.06 : -0.06), 0.95 + g * 0.14, off.z);
      grain.material = grainMat;
      grain.parent = bodyGroup;
    }
  });

  let starIcon = null;
  if (isMature) {
    starIcon = createHarvestStar(scene, root, key);
    triggerToyBounce(scene, bodyGroup, { bounceFactor: 1.15 });
  }

  return {
    root,
    animate: (t) => {
      bodyGroup.rotation.z = Math.sin(t * 0.003 + (key.charCodeAt(0) || 0)) * 0.05;
      if (starIcon && !starIcon.isDisposed()) {
        starIcon.position.y = 1.85 + Math.sin(t * 0.004) * 0.12;
        starIcon.rotation.y = t * 0.0025;
      }
    },
  };
}

/**
 * TẠO BỤI HOA KẸO PLAY TOGETHER (Candy Flower Bush)
 * - Tán lá hình đám mây mini màu mint/lục tươi phúng phính
 * - 5-7 Bông hoa cánh tròn rực rỡ với nhụy kẹo M&M
 */
export function createCandyFlowerBush(scene, x, z, options = {}) {
  const { scale = 1.0, shadows = null } = options;
  const id = ++propCounter;
  const root = new TransformNode(`candy-bush-${id}`, scene);
  root.position.set(x, 0, z);
  root.scaling.set(scale, scale, scale);

  const bushMat = createToyMaterial(scene, 'mat-toy-bush-mint', PLAY_TOGETHER_PALETTE.pastels.mintGreen, {
    specularPower: 64,
    specularLevel: 0.35,
    ambientScale: 0.48,
  });

  // 3 Khối cầu tạo bụi lá đám mây
  [-0.45, 0.45, 0].forEach((bx, idx) => {
    const b = MeshBuilder.CreateSphere(`bush-puff-${id}-${idx}`, {
      diameterX: idx === 2 ? 1.4 : 1.1,
      diameterY: idx === 2 ? 0.95 : 0.8,
      diameterZ: 1.1,
      segments: 10,
    }, scene);
    b.position.set(bx, idx === 2 ? 0.48 : 0.38, idx === 2 ? 0.15 : -0.1);
    b.material = bushMat;
    b.parent = root;
    if (shadows) shadows.addShadowCaster(b);
  });

  // Đính các bông hoa kẹo rực rỡ
  const flowerColors = [
    PLAY_TOGETHER_PALETTE.pastels.strawberryPink,
    PLAY_TOGETHER_PALETTE.pastels.butterYellow,
    PLAY_TOGETHER_PALETTE.pastels.lavender,
    PLAY_TOGETHER_PALETTE.pastels.coralOrange,
  ];

  const flowerSpots = [
    { x: -0.4, y: 0.65, z: 0.3, c: flowerColors[0] },
    { x: 0.35, y: 0.68, z: 0.35, c: flowerColors[1] },
    { x: 0, y: 0.88, z: 0.15, c: flowerColors[2] },
    { x: -0.2, y: 0.55, z: -0.35, c: flowerColors[3] },
    { x: 0.4, y: 0.58, z: -0.25, c: flowerColors[0] },
  ];

  flowerSpots.forEach((f, fIdx) => {
    const flwNode = new TransformNode(`flw-node-${id}-${fIdx}`, scene);
    flwNode.position.set(f.x, f.y, f.z);
    flwNode.parent = root;

    // Cánh hoa tròn
    const petalMat = createToyMaterial(scene, `mat-toy-petal-${f.c}`, f.c, {
      specularPower: 80,
      specularLevel: 0.5,
    });
    for (let p = 0; p < 5; p++) {
      const ang = (p * Math.PI * 2) / 5;
      const petal = MeshBuilder.CreateSphere(`petal-${id}-${fIdx}-${p}`, {
        diameterX: 0.14,
        diameterY: 0.14,
        diameterZ: 0.08,
        segments: 6,
      }, scene);
      petal.position.set(Math.cos(ang) * 0.08, Math.sin(ang) * 0.08, 0);
      petal.material = petalMat;
      petal.parent = flwNode;
    }

    // Nhụy hoa kẹo vàng tròn lồi
    const center = MeshBuilder.CreateSphere(`flw-core-${id}-${fIdx}`, { diameter: 0.12, segments: 6 }, scene);
    center.position.z = 0.03;
    center.material = createToyMaterial(scene, 'mat-toy-core-yellow', '#facc15', { emissiveHex: '#fbbf24' });
    center.parent = flwNode;
  });

  return root;
}

/**
 * TẠO ĐÁ KẸO SỎI PLAY TOGETHER (Candy Pebble Rock)
 * - Viên đá cuội tròn nhẵn như thạch rau câu, có đốm highlight tròn ngộ nghĩnh
 */
export function createCandyPebbleRock(scene, x, z, options = {}) {
  const { scale = 1.0, colorHex = '#94a3b8', shadows = null } = options;
  const id = ++propCounter;
  const root = new TransformNode(`candy-rock-${id}`, scene);
  root.position.set(x, 0, z);
  root.scaling.set(scale, scale, scale);

  const rockMat = createToyMaterial(scene, `mat-candy-rock-${colorHex}`, colorHex, {
    specularPower: 64,
    specularLevel: 0.35,
    ambientScale: 0.46,
  });

  const rock = MeshBuilder.CreateSphere(`rock-pebble-${id}`, {
    diameterX: 1.4,
    diameterY: 0.75,
    diameterZ: 1.1,
    segments: 10,
  }, scene);
  rock.position.y = 0.32;
  rock.material = rockMat;
  rock.parent = root;

  // Đốm highlight trắng tròn trên đỉnh đá
  const spot = MeshBuilder.CreateDisc(`rock-spot-${id}`, { radius: 0.22, tessellation: 12 }, scene);
  spot.position.set(0.18, 0.68, 0.15);
  spot.rotation.x = Math.PI / 3;
  spot.material = createToyMaterial(scene, 'mat-toy-rock-hl', '#ffffff', { alpha: 0.65 });
  spot.parent = root;

  if (shadows) shadows.addShadowCaster(rock);
  return root;
}

