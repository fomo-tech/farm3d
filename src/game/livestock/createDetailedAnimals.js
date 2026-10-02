import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';

function getMat(scene, name, hex, emissiveHex = null) {
  let mat = scene.getMaterialByName(name);
  if (!mat) {
    mat = new StandardMaterial(name, scene);
    mat.diffuseColor = Color3.FromHexString(hex);
    mat.specularColor = new Color3(0.08, 0.08, 0.08);
    if (emissiveHex) mat.emissiveColor = Color3.FromHexString(emissiveHex);
  }
  return mat;
}

/**
 * BÒ SỮA HÀ LAN (HOLSTEIN COW) 3D CHUẨN NÔNG TRẠI
 */
export function buildHolsteinCow(scene, name, shadows = null) {
  const root = new TransformNode(name, scene);

  const whiteMat = getMat(scene, 'mat-cow-white', '#fdfefe');
  const blackMat = getMat(scene, 'mat-cow-black', '#212121');
  const pinkMat = getMat(scene, 'mat-cow-pink', '#f8bbd0');
  const hornMat = getMat(scene, 'mat-cow-horn', '#fff9c4');
  const bellMat = getMat(scene, 'mat-cow-bell', '#ffd54f');
  const collarMat = getMat(scene, 'mat-cow-collar', '#8d6e63');
  const hoofMat = getMat(scene, 'mat-cow-hoof', '#37474f');

  // 1. Thân bò (Barrel Body)
  const body = MeshBuilder.CreateSphere(`${name}-body`, {
    diameterX: 1.35,
    diameterY: 1.25,
    diameterZ: 2.1,
    segments: 10,
  }, scene);
  body.position.y = 1.25;
  body.material = whiteMat;
  body.parent = root;
  shadows?.addShadowCaster(body);

  // Đốm đen lớn trên lưng và sườn
  const spotBack = MeshBuilder.CreateSphere(`${name}-spot-1`, {
    diameterX: 0.95,
    diameterY: 0.75,
    diameterZ: 1.15,
    segments: 8,
  }, scene);
  spotBack.position.set(0.25, 1.45, 0.1);
  spotBack.material = blackMat;
  spotBack.parent = root;

  const spotSide = MeshBuilder.CreateSphere(`${name}-spot-2`, {
    diameterX: 0.85,
    diameterY: 0.7,
    diameterZ: 0.9,
    segments: 8,
  }, scene);
  spotSide.position.set(-0.35, 1.25, -0.35);
  spotSide.material = blackMat;
  spotSide.parent = root;

  // 2. Bầu sữa hồng dưới bụng
  const udder = MeshBuilder.CreateSphere(`${name}-udder`, {
    diameterX: 0.65,
    diameterY: 0.45,
    diameterZ: 0.65,
    segments: 8,
  }, scene);
  udder.position.set(0, 0.75, 0.35);
  udder.material = pinkMat;
  udder.parent = root;

  // 4 núm sữa nhỏ
  [[-0.15, 0.25], [0.15, 0.25], [-0.15, 0.45], [0.15, 0.45]].forEach(([nx, nz], i) => {
    const teat = MeshBuilder.CreateCylinder(`${name}-teat-${i}`, {
      height: 0.12,
      diameter: 0.05,
      tessellation: 6,
    }, scene);
    teat.position.set(nx, 0.58, nz);
    teat.material = pinkMat;
    teat.parent = root;
  });

  // 3. Cổ và Đầu bò (Head & Neck Node)
  const neckNode = new TransformNode(`${name}-neck-node`, scene);
  neckNode.position.set(0, 1.35, -0.9);
  neckNode.parent = root;

  const head = MeshBuilder.CreateSphere(`${name}-head`, {
    diameterX: 0.85,
    diameterY: 0.82,
    diameterZ: 0.95,
    segments: 8,
  }, scene);
  head.position.set(0, 0.25, -0.45);
  head.material = whiteMat;
  head.parent = neckNode;
  shadows?.addShadowCaster(head);

  // Đốm đen trên mắt trái của bò
  const eyePatch = MeshBuilder.CreateSphere(`${name}-eye-patch`, {
    diameterX: 0.48,
    diameterY: 0.45,
    diameterZ: 0.48,
    segments: 7,
  }, scene);
  eyePatch.position.set(-0.25, 0.38, -0.55);
  eyePatch.material = blackMat;
  eyePatch.parent = neckNode;

  // 2 Mắt bò đen láy to tròn
  [-0.32, 0.32].forEach((ex, idx) => {
    const eye = MeshBuilder.CreateSphere(`${name}-eye-${idx}`, {
      diameter: 0.16,
      segments: 6,
    }, scene);
    eye.position.set(ex, 0.35, -0.75);
    eye.material = blackMat;
    eye.parent = neckNode;

    const eyeHighlight = MeshBuilder.CreateSphere(`${name}-eye-hl-${idx}`, {
      diameter: 0.05,
      segments: 4,
    }, scene);
    eyeHighlight.position.set(ex + (idx === 0 ? -0.03 : 0.03), 0.39, -0.81);
    eyeHighlight.material = whiteMat;
    eyeHighlight.parent = neckNode;
  });

  // Mõm bò hồng (Snout)
  const snout = MeshBuilder.CreateSphere(`${name}-snout`, {
    diameterX: 0.72,
    diameterY: 0.45,
    diameterZ: 0.52,
    segments: 8,
  }, scene);
  snout.position.set(0, 0.12, -0.85);
  snout.material = pinkMat;
  snout.parent = neckNode;

  // 2 lỗ mũi đen
  [-0.14, 0.14].forEach((nx, idx) => {
    const nostril = MeshBuilder.CreateSphere(`${name}-nostril-${idx}`, {
      diameterX: 0.07,
      diameterY: 0.1,
      diameterZ: 0.05,
      segments: 5,
    }, scene);
    nostril.position.set(nx, 0.12, -1.1);
    nostril.material = blackMat;
    nostril.parent = neckNode;
  });

  // Cặp sừng vàng ngà uốn cong
  [-0.32, 0.32].forEach((hx, idx) => {
    const horn = MeshBuilder.CreateCylinder(`${name}-horn-${idx}`, {
      height: 0.32,
      diameterBottom: 0.14,
      diameterTop: 0.04,
      tessellation: 7,
    }, scene);
    horn.rotation.z = (idx === 0 ? 0.45 : -0.45);
    horn.rotation.x = -0.25;
    horn.position.set(hx, 0.65, -0.45);
    horn.material = hornMat;
    horn.parent = neckNode;
  });

  // 2 Tai vểnh mềm mại
  const leftEarNode = new TransformNode(`${name}-ear-left`, scene);
  leftEarNode.position.set(-0.45, 0.45, -0.42);
  leftEarNode.parent = neckNode;
  const leftEar = MeshBuilder.CreateSphere(`${name}-ear-mesh-l`, {
    diameterX: 0.38,
    diameterY: 0.16,
    diameterZ: 0.22,
    segments: 6,
  }, scene);
  leftEar.rotation.z = 0.35;
  leftEar.material = blackMat;
  leftEar.parent = leftEarNode;

  const rightEarNode = new TransformNode(`${name}-ear-right`, scene);
  rightEarNode.position.set(0.45, 0.45, -0.42);
  rightEarNode.parent = neckNode;
  const rightEar = MeshBuilder.CreateSphere(`${name}-ear-mesh-r`, {
    diameterX: 0.38,
    diameterY: 0.16,
    diameterZ: 0.22,
    segments: 6,
  }, scene);
  rightEar.rotation.z = -0.35;
  rightEar.material = whiteMat;
  rightEar.parent = rightEarNode;

  // Vòng cổ da & Chuông đồng lắc lư
  const collar = MeshBuilder.CreateTorus(`${name}-collar`, {
    diameter: 0.85,
    thickness: 0.1,
    tessellation: 12,
  }, scene);
  collar.position.set(0, 0.05, -0.22);
  collar.rotation.x = Math.PI / 3;
  collar.material = collarMat;
  collar.parent = neckNode;

  const bellNode = new TransformNode(`${name}-bell-node`, scene);
  bellNode.position.set(0, -0.28, -0.3);
  bellNode.parent = neckNode;
  const bell = MeshBuilder.CreateCylinder(`${name}-bell`, {
    height: 0.22,
    diameterTop: 0.1,
    diameterBottom: 0.2,
    tessellation: 8,
  }, scene);
  bell.material = bellMat;
  bell.parent = bellNode;

  // 4. 4 Chân vững chắc
  const legPositions = [
    [-0.45, -0.58], [0.45, -0.58], // Chân trước
    [-0.45, 0.62], [0.45, 0.62],   // Chân sau
  ];
  const legNodes = legPositions.map(([lx, lz], idx) => {
    const legRoot = new TransformNode(`${name}-leg-${idx}`, scene);
    legRoot.position.set(lx, 0.8, lz);
    legRoot.parent = root;

    const leg = MeshBuilder.CreateCylinder(`${name}-leg-mesh-${idx}`, {
      height: 0.85,
      diameter: 0.24,
      tessellation: 8,
    }, scene);
    leg.position.y = -0.42;
    leg.material = idx % 2 === 0 ? blackMat : whiteMat;
    leg.parent = legRoot;

    const hoof = MeshBuilder.CreateCylinder(`${name}-hoof-${idx}`, {
      height: 0.15,
      diameter: 0.26,
      tessellation: 8,
    }, scene);
    hoof.position.y = -0.78;
    hoof.material = hoofMat;
    hoof.parent = legRoot;

    return legRoot;
  });

  // 5. Đuôi bò có túm lông phe phẩy
  const tailNode = new TransformNode(`${name}-tail-node`, scene);
  tailNode.position.set(0, 1.45, 1.05);
  tailNode.parent = root;

  const tailStem = MeshBuilder.CreateCylinder(`${name}-tail-stem`, {
    height: 0.75,
    diameter: 0.08,
  }, scene);
  tailStem.position.set(0, -0.35, 0.1);
  tailStem.rotation.x = 0.25;
  tailStem.material = whiteMat;
  tailStem.parent = tailNode;

  const tailBrush = MeshBuilder.CreateSphere(`${name}-tail-brush`, {
    diameterX: 0.16,
    diameterY: 0.28,
    diameterZ: 0.16,
    segments: 6,
  }, scene);
  tailBrush.position.set(0, -0.72, 0.18);
  tailBrush.material = blackMat;
  tailBrush.parent = tailNode;

  return {
    root,
    animate: (time, isMoving = false) => {
      // Cúi đầu gặm cỏ rồi ngước lên nhai nhai
      const grazeCycle = Math.sin(time * 0.001);
      neckNode.rotation.x = 0.25 + grazeCycle * 0.35;
      neckNode.position.y = 1.35 - Math.max(0, grazeCycle) * 0.35;

      // Chuông lắc lư
      bellNode.rotation.z = Math.sin(time * 0.003) * 0.3;
      bellNode.rotation.x = Math.cos(time * 0.0025) * 0.2;

      // Tai ve vẩy thỉnh thoảng
      leftEarNode.rotation.z = Math.sin(time * 0.004) * 0.2;
      rightEarNode.rotation.z = -Math.sin(time * 0.0035 + 1) * 0.2;

      // Đuôi phe phẩy xua ruồi
      tailNode.rotation.y = Math.sin(time * 0.005) * 0.45;
      tailNode.rotation.z = Math.cos(time * 0.004) * 0.2;

      // Nhịp chân khi di chuyển
      if (isMoving) {
        const legWalk = Math.sin(time * 0.005) * 0.35;
        legNodes[0].rotation.x = legWalk;
        legNodes[1].rotation.x = -legWalk;
        legNodes[2].rotation.x = -legWalk;
        legNodes[3].rotation.x = legWalk;
      } else {
        legNodes.forEach(leg => { leg.rotation.x = 0; });
      }
    },
  };
}

/**
 * CỪU BÔNG LÔNG LEN XÙ (FLUFFY CLOUD SHEEP) 3D
 */
export function buildFluffySheep(scene, name, shadows = null) {
  const root = new TransformNode(name, scene);

  const woolMat = getMat(scene, 'mat-sheep-wool', '#fdfefe');
  const skinMat = getMat(scene, 'mat-sheep-skin', '#263238'); // Khuôn mặt đen hoặc xám than
  const earMat = getMat(scene, 'mat-sheep-ear', '#37474f');
  const hoofMat = getMat(scene, 'mat-sheep-hoof', '#1a237e');

  // Thân cừu như một cụm mây len trắng bồng bềnh
  const bodyRoot = new TransformNode(`${name}-body-root`, scene);
  bodyRoot.position.y = 0.95;
  bodyRoot.parent = root;

  // Khối thân chính
  const mainBody = MeshBuilder.CreateSphere(`${name}-wool-main`, {
    diameterX: 1.1,
    diameterY: 1.05,
    diameterZ: 1.45,
    segments: 8,
  }, scene);
  mainBody.material = woolMat;
  mainBody.parent = bodyRoot;
  shadows?.addShadowCaster(mainBody);

  // 6 khối phồng len xù quanh thân
  const cloudPuffs = [
    [-0.45, 0.15, -0.2, 0.7],
    [0.45, 0.15, -0.2, 0.7],
    [-0.4, 0.1, 0.35, 0.65],
    [0.4, 0.1, 0.35, 0.65],
    [0, 0.45, 0.05, 0.8],
    [0, -0.15, 0.55, 0.6],
  ];
  cloudPuffs.forEach(([px, py, pz, diam], idx) => {
    const puff = MeshBuilder.CreateSphere(`${name}-puff-${idx}`, {
      diameter: diam,
      segments: 7,
    }, scene);
    puff.position.set(px, py, pz);
    puff.material = woolMat;
    puff.parent = bodyRoot;
  });

  // Đầu cừu
  const headNode = new TransformNode(`${name}-head-node`, scene);
  headNode.position.set(0, 1.1, -0.75);
  headNode.parent = root;

  const headFace = MeshBuilder.CreateSphere(`${name}-face`, {
    diameterX: 0.55,
    diameterY: 0.58,
    diameterZ: 0.65,
    segments: 8,
  }, scene);
  headFace.material = skinMat;
  headFace.parent = headNode;
  shadows?.addShadowCaster(headFace);

  // Mũ len trên đầu cừu
  const headWool = MeshBuilder.CreateSphere(`${name}-head-wool`, {
    diameterX: 0.6,
    diameterY: 0.38,
    diameterZ: 0.55,
    segments: 7,
  }, scene);
  headWool.position.set(0, 0.28, -0.05);
  headWool.material = woolMat;
  headWool.parent = headNode;

  // 2 Mắt cừu to sáng
  [-0.18, 0.18].forEach((ex, idx) => {
    const eye = MeshBuilder.CreateSphere(`${name}-eye-${idx}`, {
      diameter: 0.11,
      segments: 6,
    }, scene);
    eye.position.set(ex, 0.12, -0.3);
    eye.material = woolMat;
    eye.parent = headNode;

    const pupil = MeshBuilder.CreateSphere(`${name}-pupil-${idx}`, {
      diameter: 0.06,
      segments: 5,
    }, scene);
    pupil.position.set(ex, 0.12, -0.35);
    pupil.material = getMat(scene, 'mat-sheep-pupil', '#000000');
    pupil.parent = headNode;
  });

  // 2 Tai cừu rủ dài mềm mại
  const ears = [-0.32, 0.32].map((ex, idx) => {
    const earNode = new TransformNode(`${name}-ear-${idx}`, scene);
    earNode.position.set(ex, 0.15, -0.05);
    earNode.parent = headNode;

    const earMesh = MeshBuilder.CreateSphere(`${name}-ear-m-${idx}`, {
      diameterX: 0.32,
      diameterY: 0.14,
      diameterZ: 0.18,
      segments: 6,
    }, scene);
    earMesh.rotation.z = (idx === 0 ? 0.6 : -0.6);
    earMesh.rotation.y = (idx === 0 ? -0.2 : 0.2);
    earMesh.material = earMat;
    earMesh.parent = earNode;

    return earNode;
  });

  // 4 cẳng chân đen nhỏ xinh xắn
  const legPositions = [
    [-0.32, -0.35], [0.32, -0.35],
    [-0.32, 0.35], [0.32, 0.35],
  ];
  const legNodes = legPositions.map(([lx, lz], idx) => {
    const legRoot = new TransformNode(`${name}-leg-${idx}`, scene);
    legRoot.position.set(lx, 0.55, lz);
    legRoot.parent = root;

    const leg = MeshBuilder.CreateCylinder(`${name}-leg-${idx}`, {
      height: 0.6,
      diameter: 0.14,
      tessellation: 8,
    }, scene);
    leg.position.y = -0.3;
    leg.material = skinMat;
    leg.parent = legRoot;

    const hoof = MeshBuilder.CreateCylinder(`${name}-hoof-${idx}`, {
      height: 0.12,
      diameter: 0.16,
      tessellation: 8,
    }, scene);
    hoof.position.y = -0.54;
    hoof.material = hoofMat;
    hoof.parent = legRoot;

    return legRoot;
  });

  return {
    root,
    animate: (time, isMoving = false) => {
      // Hoạt ảnh cừu thỉnh thoảng nhảy tưng tưng nhẹ
      const hopPhase = (time * 0.003) % (Math.PI * 4);
      let hopY = 0;
      if (hopPhase < Math.PI) {
        hopY = Math.sin(hopPhase) * 0.18;
      }
      bodyRoot.position.y = 0.95 + hopY;
      headNode.position.y = 1.1 + hopY;

      // Tai đung đưa nhịp nhàng
      ears[0].rotation.z = Math.sin(time * 0.0035) * 0.18;
      ears[1].rotation.z = -Math.sin(time * 0.0035) * 0.18;

      // Gật đầu
      headNode.rotation.x = Math.sin(time * 0.0018) * 0.15;

      if (isMoving) {
        const legWalk = Math.sin(time * 0.006) * 0.4;
        legNodes[0].rotation.x = legWalk;
        legNodes[1].rotation.x = -legWalk;
        legNodes[2].rotation.x = -legWalk;
        legNodes[3].rotation.x = legWalk;
      } else {
        legNodes.forEach(leg => { leg.rotation.x = 0; });
      }
    },
  };
}

/**
 * GÀ MÁI MẸ & ĐÀN GÀ CON (HEN & CHICKS) 3D
 */
export function buildHenWithChicks(scene, name, shadows = null) {
  const root = new TransformNode(name, scene);

  const featherWhite = getMat(scene, 'mat-hen-white', '#ffffff');
  const combRed = getMat(scene, 'mat-hen-comb', '#e53935');
  const beakYellow = getMat(scene, 'mat-hen-beak', '#fbc02d');
  const legOrange = getMat(scene, 'mat-hen-leg', '#fb8c00');
  const chickYellow = getMat(scene, 'mat-chick-yellow', '#fff176');
  const eyeBlack = getMat(scene, 'mat-hen-eye', '#212121');

  // === 1. GÀ MÁI MẸ ===
  const henRoot = new TransformNode(`${name}-hen`, scene);
  henRoot.parent = root;

  // Thân gà mẹ hình giọt nước bo tròn
  const henBody = MeshBuilder.CreateSphere(`${name}-hen-body`, {
    diameterX: 0.72,
    diameterY: 0.68,
    diameterZ: 0.92,
    segments: 8,
  }, scene);
  henBody.position.y = 0.65;
  henBody.material = featherWhite;
  henBody.parent = henRoot;
  shadows?.addShadowCaster(henBody);

  // 2 Cánh gà xếp bên hông (có thể vỗ nhẹ)
  const leftWing = new TransformNode(`${name}-left-wing`, scene);
  leftWing.position.set(-0.36, 0.68, -0.05);
  leftWing.parent = henRoot;
  const leftWingMesh = MeshBuilder.CreateSphere(`${name}-l-wing-m`, {
    diameterX: 0.12,
    diameterY: 0.42,
    diameterZ: 0.65,
    segments: 6,
  }, scene);
  leftWingMesh.material = featherWhite;
  leftWingMesh.parent = leftWing;

  const rightWing = new TransformNode(`${name}-right-wing`, scene);
  rightWing.position.set(0.36, 0.68, -0.05);
  rightWing.parent = henRoot;
  const rightWingMesh = MeshBuilder.CreateSphere(`${name}-r-wing-m`, {
    diameterX: 0.12,
    diameterY: 0.42,
    diameterZ: 0.65,
    segments: 6,
  }, scene);
  rightWingMesh.material = featherWhite;
  rightWingMesh.parent = rightWing;

  // Đuôi gà mẹ xòe vểnh
  const tailFeathers = MeshBuilder.CreateCylinder(`${name}-tail`, {
    height: 0.45,
    diameterTop: 0.45,
    diameterBottom: 0.1,
    tessellation: 6,
  }, scene);
  tailFeathers.position.set(0, 0.82, 0.45);
  tailFeathers.rotation.x = -0.75;
  tailFeathers.material = featherWhite;
  tailFeathers.parent = henRoot;

  // Cổ & Đầu gà mẹ
  const headNode = new TransformNode(`${name}-head-node`, scene);
  headNode.position.set(0, 0.92, -0.32);
  headNode.parent = henRoot;

  const head = MeshBuilder.CreateSphere(`${name}-head`, {
    diameter: 0.45,
    segments: 7,
  }, scene);
  head.material = featherWhite;
  head.parent = headNode;
  shadows?.addShadowCaster(head);

  // Mào đỏ răng cưa trên đỉnh đầu
  const comb = MeshBuilder.CreateBox(`${name}-comb`, {
    width: 0.08,
    height: 0.24,
    depth: 0.38,
  }, scene);
  comb.position.set(0, 0.28, -0.02);
  comb.material = combRed;
  comb.parent = headNode;

  // Yếm thịt đỏ dưới cằm
  const wattle = MeshBuilder.CreateSphere(`${name}-wattle`, {
    diameterX: 0.1,
    diameterY: 0.18,
    diameterZ: 0.14,
    segments: 5,
  }, scene);
  wattle.position.set(0, -0.16, -0.18);
  wattle.material = combRed;
  wattle.parent = headNode;

  // Mỏ nhọn vàng
  const beak = MeshBuilder.CreateCylinder(`${name}-beak`, {
    height: 0.22,
    diameterBottom: 0.14,
    diameterTop: 0.02,
    tessellation: 5,
  }, scene);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0, -0.32);
  beak.material = beakYellow;
  beak.parent = headNode;

  // 2 Mắt tròn đen
  [-0.16, 0.16].forEach((ex, idx) => {
    const eye = MeshBuilder.CreateSphere(`${name}-eye-${idx}`, {
      diameter: 0.08,
      segments: 5,
    }, scene);
    eye.position.set(ex, 0.06, -0.16);
    eye.material = eyeBlack;
    eye.parent = headNode;
  });

  // 2 Chân vàng cam
  [-0.18, 0.18].forEach((lx, idx) => {
    const leg = MeshBuilder.CreateCylinder(`${name}-leg-${idx}`, {
      height: 0.35,
      diameter: 0.06,
    }, scene);
    leg.position.set(lx, 0.2, 0);
    leg.material = legOrange;
    leg.parent = henRoot;

    const foot = MeshBuilder.CreateBox(`${name}-foot-${idx}`, {
      width: 0.14,
      height: 0.03,
      depth: 0.2,
    }, scene);
    foot.position.set(lx, 0.02, -0.05);
    foot.material = legOrange;
    foot.parent = henRoot;
  });

  // === 2. ĐÀN GÀ CON (2 CHICKS) ===
  const chicks = [-0.65, 0.65].map((cx, idx) => {
    const chickRoot = new TransformNode(`${name}-chick-${idx}`, scene);
    chickRoot.position.set(cx, 0, 0.35 + idx * 0.2);
    chickRoot.parent = root;

    // Thân tròn lông tơ vàng
    const cBody = MeshBuilder.CreateSphere(`chick-body-${idx}`, {
      diameter: 0.28,
      segments: 6,
    }, scene);
    cBody.position.y = 0.2;
    cBody.material = chickYellow;
    cBody.parent = chickRoot;

    // Đầu nhỏ
    const cHead = MeshBuilder.CreateSphere(`chick-head-${idx}`, {
      diameter: 0.2,
      segments: 5,
    }, scene);
    cHead.position.set(0, 0.32, -0.1);
    cHead.material = chickYellow;
    cHead.parent = chickRoot;

    // Mỏ tí hon
    const cBeak = MeshBuilder.CreateCylinder(`chick-beak-${idx}`, {
      height: 0.08,
      diameterBottom: 0.06,
      diameterTop: 0.01,
      tessellation: 4,
    }, scene);
    cBeak.rotation.x = Math.PI / 2;
    cBeak.position.set(0, 0.3, -0.22);
    cBeak.material = legOrange;
    cBeak.parent = chickRoot;

    // 2 Chân tí xíu
    [-0.06, 0.06].forEach((cxp, j) => {
      const cLeg = MeshBuilder.CreateCylinder(`chick-leg-${idx}-${j}`, {
        height: 0.1,
        diameter: 0.025,
      }, scene);
      cLeg.position.set(cxp, 0.06, 0);
      cLeg.material = legOrange;
      cLeg.parent = chickRoot;
    });

    return { chickRoot, head: cHead };
  });

  return {
    root,
    animate: (time) => {
      // Gà mẹ gật gù mổ thóc
      const peck = Math.sin(time * 0.005);
      headNode.rotation.x = 0.2 + peck * 0.35;

      // Cánh vỗ nhẹ khi thích thú
      const wingFlap = Math.sin(time * 0.008);
      leftWing.rotation.z = wingFlap * 0.25;
      rightWing.rotation.z = -wingFlap * 0.25;

      // Đàn gà con líu ríu mổ thóc theo mẹ
      chicks.forEach((chick, idx) => {
        const chickPeck = Math.sin(time * 0.007 + idx * 1.5);
        chick.chickRoot.position.y = Math.max(0, Math.sin(time * 0.006 + idx) * 0.05);
        chick.head.rotation.x = 0.2 + chickPeck * 0.4;
      });
    },
  };
}
