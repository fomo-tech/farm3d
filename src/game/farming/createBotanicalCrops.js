import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial, triggerToyBounce } from '../rendering/PlayTogetherTheme.js';

/**
 * HỆ THỐNG MÔ HÌNH CÂY TRỒNG NÔNG TRẠI CHUẨN KÍCH THƯỚC & ĐẶC TRƯNG THỰC VẬT
 * - Chuẩn tỉ lệ ô đất 1.88m × 1.58m
 * - 4 giai đoạn sinh trưởng trực quan:
 *     0.00 - 0.24: Mầm non (Sprout)
 *     0.25 - 0.74: Thân lá phát triển (Bush / Vegetative)
 *     0.75 - 0.99: Ra hoa & Quả non (Flowering / Unripe)
 *     1.00:        Chín rộ thu hoạch (Mature / Ready)
 * - Tách biệt 100% 7 loại cây trồng: Carrot, Wheat, Tomato, Strawberry, Pumpkin, Melon, Turnip.
 * - Hoạt ảnh đung đưa theo gió tự nhiên + hiệu ứng nhún nhảy Squash & Stretch khi chín.
 */

// Ụ đất mùn sô-cô-la tơi xốp tiêu chuẩn cho mọi luống cây
function createSoilMound(scene, parent, key, { diameter = 1.15, height = 0.24, ringColor = null } = {}) {
  const soilMat = createToyMaterial(scene, 'mat-botanical-soil', PLAY_TOGETHER_PALETTE.farm.chocolateSoil, {
    specularPower: 24,
    specularLevel: 0.12,
    ambientScale: 0.42,
  });

  const mound = MeshBuilder.CreateSphere(`soil-mound-${key}`, {
    diameterX: diameter,
    diameterY: height,
    diameterZ: diameter,
    segments: 10,
  }, scene);
  mound.position.y = height * 0.32;
  mound.material = soilMat;
  mound.parent = parent;

  // Vành cỏ xanh non viền nhẹ chân ụ đất
  const ringMat = createToyMaterial(scene, 'mat-botanical-soil-rim', ringColor || PLAY_TOGETHER_PALETTE.farm.freshSprout, {
    specularPower: 32,
    specularLevel: 0.15,
  });
  const grassRing = MeshBuilder.CreateTorus(`soil-ring-${key}`, {
    diameter: diameter * 0.92,
    thickness: 0.08,
    tessellation: 12,
  }, scene);
  grassRing.position.y = 0.04;
  grassRing.material = ringMat;
  grassRing.parent = parent;

  return mound;
}

/**
 * Biểu tượng Ngôi sao vàng 3D lơ lửng khi cây chín (Harvest Ready Star)
 * Tinh gọn, vừa vặn tầm mắt, xoay chậm và nhấp nhô nhẹ nhàng
 */
export function createHarvestStar(scene, parent, key, options = {}) {
  const { height = 1.48, scale = 0.75 } = options;
  const starRoot = new TransformNode(`harvest-star-root-${key}`, scene);
  starRoot.position.set(0, height, 0);
  starRoot.scaling.set(scale, scale, scale);
  starRoot.parent = parent;

  const starMat = createToyMaterial(scene, 'mat-toy-gold-star', PLAY_TOGETHER_PALETTE.fx.goldStar, {
    emissiveHex: '#f59e0b',
    specularPower: 128,
    specularLevel: 0.75,
  });

  // Ngôi sao 5 cánh 3D
  const starMesh = MeshBuilder.CreateCylinder(`gold-star-mesh-${key}`, {
    height: 0.14,
    diameter: 0.44,
    tessellation: 5,
  }, scene);
  starMesh.rotation.x = Math.PI / 2;
  starMesh.material = starMat;
  starMesh.parent = starRoot;

  // Vòng hào quang sáng bao quanh
  const haloRing = MeshBuilder.CreateTorus(`gold-star-halo-${key}`, {
    diameter: 0.58,
    thickness: 0.035,
    tessellation: 16,
  }, scene);
  haloRing.rotation.x = Math.PI / 2;
  haloRing.material = starMat;
  haloRing.parent = starRoot;

  return starRoot;
}

// =============================================================================
// 1. CÀ RỐT (CARROT) — Cây thân củ mọc ngầm, lá lông chim xòe mềm
// =============================================================================
export function createChibiCarrotMesh(scene, key, progress, options = {}) {
  const root = new TransformNode(`crop-carrot-root-${key}`, scene);
  const shadows = options.shadows || null;
  createSoilMound(scene, root, key, { diameter: 1.12, height: 0.24 });

  const bodyGroup = new TransformNode(`carrot-body-group-${key}`, scene);
  bodyGroup.parent = root;

  const leafMat = createToyMaterial(scene, 'mat-carrot-leaf', PLAY_TOGETHER_PALETTE.farm.leafGreen, {
    specularPower: 64,
    specularLevel: 0.35,
    ambientScale: 0.5,
  });
  const leafLightMat = createToyMaterial(scene, 'mat-carrot-leaf-light', PLAY_TOGETHER_PALETTE.farm.freshSprout, {
    specularPower: 64,
    specularLevel: 0.35,
  });
  const carrotMat = createToyMaterial(scene, 'mat-carrot-body', PLAY_TOGETHER_PALETTE.farm.carrotOrange, {
    specularPower: 80,
    specularLevel: 0.48,
    ambientScale: 0.45,
  });
  const carrotRingMat = createToyMaterial(scene, 'mat-carrot-ring', PLAY_TOGETHER_PALETTE.farm.carrotHighlight, {
    specularPower: 60,
    specularLevel: 0.3,
  });

  const isMature = progress >= 1.0;

  if (progress < 0.25) {
    // Giai đoạn 0: Mầm non đôi lá xanh múp míp
    const grow = 0.65 + progress * 1.4;
    bodyGroup.scaling.set(grow, grow, grow);
    [-0.09, 0.09].forEach((lx, i) => {
      const sprout = MeshBuilder.CreateSphere(`carrot-sprout-${key}-${i}`, {
        diameterX: 0.16,
        diameterY: 0.28,
        diameterZ: 0.1,
        segments: 8,
      }, scene);
      sprout.rotation.z = lx > 0 ? -0.32 : 0.32;
      sprout.position.set(lx, 0.16, 0);
      sprout.material = leafMat;
      sprout.parent = bodyGroup;
    });
  } else if (progress < 0.75) {
    // Giai đoạn 1: Bụi lá lông chim vươn cao, chưa lộ củ
    const grow = 0.75 + (progress - 0.25) * 0.5;
    bodyGroup.scaling.set(grow, grow, grow);

    // 4 nhánh lá lông chim uốn cong
    [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach((ang, idx) => {
      const stem = new TransformNode(`carrot-stem-${key}-${idx}`, scene);
      stem.rotation.y = ang + 0.2;
      stem.parent = bodyGroup;

      const stalk = MeshBuilder.CreateCylinder(`carrot-stalk-${key}-${idx}`, {
        height: 0.38,
        diameterTop: 0.03,
        diameterBottom: 0.05,
        tessellation: 6,
      }, scene);
      stalk.position.set(0.04, 0.22, 0.06);
      stalk.rotation.x = 0.35;
      stalk.material = leafMat;
      stalk.parent = stem;

      // Các túm lá lông chim
      [-0.05, 0, 0.05].forEach((offX, lIdx) => {
        const leaflet = MeshBuilder.CreateSphere(`carrot-leaf-${key}-${idx}-${lIdx}`, {
          diameterX: 0.12,
          diameterY: 0.22,
          diameterZ: 0.08,
          segments: 6,
        }, scene);
        leaflet.position.set(offX, 0.36 + lIdx * 0.04, 0.12);
        leaflet.rotation.x = 0.45;
        leaflet.material = lIdx === 1 ? leafLightMat : leafMat;
        leaflet.parent = stem;
      });
    });
  } else {
    // Giai đoạn 2 & 3: Cụm 3 củ cà rốt mập mạp cắm tự nhiên vào đất + tán lá xum xuê
    const grow = progress < 1.0 ? 0.92 : 1.0;
    bodyGroup.scaling.set(grow, grow, grow);

    // 3 Củ cà rốt: 1 củ lớn ở giữa + 2 củ nhỏ bên cạnh
    const carrots = [
      { x: 0, z: 0, rY: 0, rZ: 0.05, dia: 0.22, len: 0.36, topY: 0.22 },
      { x: -0.14, z: 0.08, rY: 0.8, rZ: 0.18, dia: 0.18, len: 0.3, topY: 0.18 },
      { x: 0.13, z: -0.06, rY: -0.9, rZ: -0.16, dia: 0.17, len: 0.28, topY: 0.17 },
    ];

    carrots.forEach((c, cIdx) => {
      const cNode = new TransformNode(`carrot-c-${key}-${cIdx}`, scene);
      cNode.position.set(c.x, c.topY, c.z);
      cNode.rotation.y = c.rY;
      cNode.rotation.z = c.rZ;
      cNode.parent = bodyGroup;

      // Vai củ bo tròn múp míp nhô khỏi đất
      const topDome = MeshBuilder.CreateSphere(`carrot-top-${key}-${cIdx}`, {
        diameterX: c.dia,
        diameterY: c.dia * 0.7,
        diameterZ: c.dia,
        segments: 10,
      }, scene);
      topDome.position.y = 0.04;
      topDome.material = carrotMat;
      topDome.parent = cNode;
      if (shadows) shadows.addShadowCaster(topDome);

      // Thân củ cắm vào lòng đất
      const cone = MeshBuilder.CreateCylinder(`carrot-cone-${key}-${cIdx}`, {
        height: c.len,
        diameterTop: c.dia * 0.95,
        diameterBottom: c.dia * 0.3,
        tessellation: 10,
      }, scene);
      cone.position.y = -c.len * 0.38;
      cone.material = carrotMat;
      cone.parent = cNode;

      // Ngấn củ cà rốt tự nhiên
      const ridge = MeshBuilder.CreateTorus(`carrot-ridge-${key}-${cIdx}`, {
        diameter: c.dia * 0.88,
        thickness: 0.024,
        tessellation: 12,
      }, scene);
      ridge.position.y = 0.02;
      ridge.material = carrotRingMat;
      ridge.parent = cNode;
    });

    // Chùm lá lông chim mềm mại vươn cao trên củ trung tâm
    [0, 1.25, 2.5, 3.75, 5.0].forEach((ang, idx) => {
      const stem = new TransformNode(`carrot-crown-${key}-${idx}`, scene);
      stem.position.set(0, 0.24, 0);
      stem.rotation.y = ang;
      stem.parent = bodyGroup;

      const stalk = MeshBuilder.CreateCylinder(`carrot-stalk-${key}-${idx}`, {
        height: 0.34,
        diameterTop: 0.025,
        diameterBottom: 0.04,
        tessellation: 6,
      }, scene);
      stalk.position.set(0, 0.17, 0.05);
      stalk.rotation.x = 0.32;
      stalk.material = leafMat;
      stalk.parent = stem;

      // Phiến lá hình lông chim xòe
      const leafFan = MeshBuilder.CreateSphere(`carrot-leaf-fan-${key}-${idx}`, {
        diameterX: 0.16,
        diameterY: 0.28,
        diameterZ: 0.06,
        segments: 6,
      }, scene);
      leafFan.position.set(0, 0.32, 0.1);
      leafFan.rotation.x = 0.55;
      leafFan.material = idx % 2 === 0 ? leafMat : leafLightMat;
      leafFan.parent = stem;
    });
  }

  let starIcon = null;
  if (isMature) {
    starIcon = createHarvestStar(scene, root, key, { height: 1.42 });
    triggerToyBounce(scene, bodyGroup, { bounceFactor: 1.15 });
  }

  return {
    root,
    bodyGroup,
    animate: (t) => {
      const wave = Math.sin(t * 0.003 + (key.charCodeAt(0) || 0));
      bodyGroup.rotation.z = wave * 0.035;
      bodyGroup.rotation.x = Math.cos(t * 0.0025 + (key.charCodeAt(0) || 0)) * 0.025;
      if (starIcon && !starIcon.isDisposed()) {
        starIcon.position.y = 1.42 + Math.sin(t * 0.004) * 0.08;
        starIcon.rotation.y = t * 0.0025;
      }
    },
  };
}

// =============================================================================
// 2. LÚA MÌ (WHEAT) — Bó lúa vàng uốn cong trĩu hạt, đung đưa theo gió
// =============================================================================
export function createChibiWheatMesh(scene, key, progress, options = {}) {
  const root = new TransformNode(`crop-wheat-root-${key}`, scene);
  const shadows = options.shadows || null;
  createSoilMound(scene, root, key, { diameter: 1.1, height: 0.22 });

  const bodyGroup = new TransformNode(`wheat-body-group-${key}`, scene);
  bodyGroup.parent = root;

  const sproutMat = createToyMaterial(scene, 'mat-wheat-sprout', PLAY_TOGETHER_PALETTE.farm.freshSprout);
  const stalkMat = createToyMaterial(scene, 'mat-wheat-stalk', progress < 0.75 ? '#84cc16' : '#eab308');
  const grainMat = createToyMaterial(scene, 'mat-wheat-grain', progress < 0.75 ? '#a3e635' : '#fbbf24', {
    specularPower: 64,
    specularLevel: 0.45,
    ambientScale: 0.48,
  });
  const awnMat = createToyMaterial(scene, 'mat-wheat-awn', '#fef08a', {
    specularPower: 32,
    specularLevel: 0.2,
  });

  const isMature = progress >= 1.0;

  if (progress < 0.25) {
    // Giai đoạn 0: 3 dải mạ non xanh ngọc vươn thẳng
    const grow = 0.6 + progress * 1.5;
    bodyGroup.scaling.set(grow, grow, grow);
    [-0.08, 0, 0.08].forEach((lx, i) => {
      const blade = MeshBuilder.CreateCylinder(`wheat-sprout-${key}-${i}`, {
        height: 0.32,
        diameterTop: 0.015,
        diameterBottom: 0.04,
        tessellation: 6,
      }, scene);
      blade.position.set(lx, 0.2, (i - 1) * 0.04);
      blade.rotation.z = (i - 1) * 0.18;
      blade.material = sproutMat;
      blade.parent = bodyGroup;
    });
  } else if (progress < 0.75) {
    // Giai đoạn 1: Khóm lá lúa xanh mướt cao 0.75m
    const grow = 0.75 + (progress - 0.25) * 0.5;
    bodyGroup.scaling.set(grow, grow, grow);

    [0, 1.2, 2.4, 3.6, 4.8].forEach((ang, idx) => {
      const stalk = MeshBuilder.CreateCylinder(`wheat-veg-${key}-${idx}`, {
        height: 0.72,
        diameterTop: 0.03,
        diameterBottom: 0.05,
        tessellation: 6,
      }, scene);
      stalk.position.set(Math.cos(ang) * 0.12, 0.38, Math.sin(ang) * 0.12);
      stalk.rotation.z = Math.cos(ang) * 0.18;
      stalk.rotation.x = Math.sin(ang) * 0.18;
      stalk.material = stalkMat;
      stalk.parent = bodyGroup;
    });
  } else {
    // Giai đoạn 2 & 3: Khóm 6 bông lúa uốn cong cánh cung trĩu hạt vàng (cao 1.25m)
    const grow = progress < 1.0 ? 0.9 : 1.0;
    bodyGroup.scaling.set(grow, grow, grow);

    // Bố trí 6 bông lúa tỏa tròn tự nhiên
    const stalks = [
      { r: 0.12, ang: 0.2, tilt: 0.14, len: 1.15 },
      { r: 0.14, ang: 1.2, tilt: 0.16, len: 1.22 },
      { r: 0.11, ang: 2.3, tilt: 0.13, len: 1.18 },
      { r: 0.15, ang: 3.4, tilt: 0.17, len: 1.26 },
      { r: 0.12, ang: 4.5, tilt: 0.15, len: 1.20 },
      { r: 0.05, ang: 5.6, tilt: 0.06, len: 1.28 }, // Bông chính giữa cao nhất
    ];

    stalks.forEach((st, sIdx) => {
      const stemNode = new TransformNode(`wheat-stem-${key}-${sIdx}`, scene);
      stemNode.position.set(Math.cos(st.ang) * st.r, 0.1, Math.sin(st.ang) * st.r);
      stemNode.rotation.y = st.ang;
      stemNode.rotation.z = st.tilt;
      stemNode.parent = bodyGroup;

      // Thân lúa thon thả
      const stalk = MeshBuilder.CreateCylinder(`wheat-culm-${key}-${sIdx}`, {
        height: st.len,
        diameterTop: 0.032,
        diameterBottom: 0.055,
        tessellation: 8,
      }, scene);
      stalk.position.y = st.len * 0.5;
      stalk.material = stalkMat;
      stalk.parent = stemNode;
      if (shadows) shadows.addShadowCaster(stalk);

      // Bông lúa trĩu hạt (5 tầng hạt so le vảy cá)
      const earBaseY = st.len * 0.72;
      for (let g = 0; g < 6; g++) {
        const side = g % 2 === 0 ? 1 : -1;
        const grain = MeshBuilder.CreateSphere(`wheat-grain-${key}-${sIdx}-${g}`, {
          diameterX: 0.13,
          diameterY: 0.16,
          diameterZ: 0.11,
          segments: 6,
        }, scene);
        grain.position.set(side * 0.045, earBaseY + g * 0.06, 0);
        grain.rotation.z = side * -0.35;
        grain.material = grainMat;
        grain.parent = stemNode;
      }

      // Râu lúa mảnh (Awns) trên đỉnh bông
      const awn = MeshBuilder.CreateCylinder(`wheat-awn-${key}-${sIdx}`, {
        height: 0.22,
        diameterTop: 0.008,
        diameterBottom: 0.02,
        tessellation: 4,
      }, scene);
      awn.position.set(0, st.len + 0.08, 0);
      awn.rotation.z = 0.15;
      awn.material = awnMat;
      awn.parent = stemNode;
    });
  }

  let starIcon = null;
  if (isMature) {
    starIcon = createHarvestStar(scene, root, key, { height: 1.58 });
    triggerToyBounce(scene, bodyGroup, { bounceFactor: 1.15 });
  }

  return {
    root,
    bodyGroup,
    animate: (t) => {
      // Lúa mì thân cao mềm: đung đưa nhịp nhàng biên độ lớn theo gió
      const wave = Math.sin(t * 0.0032 + (key.charCodeAt(0) || 0));
      bodyGroup.rotation.z = wave * 0.065;
      bodyGroup.rotation.x = Math.cos(t * 0.0028 + (key.charCodeAt(0) || 0)) * 0.04;
      if (starIcon && !starIcon.isDisposed()) {
        starIcon.position.y = 1.58 + Math.sin(t * 0.004) * 0.08;
        starIcon.rotation.y = t * 0.0025;
      }
    },
  };
}

// =============================================================================
// 3. CÀ CHUA (TOMATO) — Cọc tre đỡ thân leo, chùm quả đỏ mọng có cuống sao
// =============================================================================
export function createChibiTomatoMesh(scene, key, progress, options = {}) {
  const root = new TransformNode(`crop-tomato-root-${key}`, scene);
  const shadows = options.shadows || null;
  createSoilMound(scene, root, key, { diameter: 1.15, height: 0.24 });

  const bodyGroup = new TransformNode(`tomato-body-group-${key}`, scene);
  bodyGroup.parent = root;

  const stakeMat = createToyMaterial(scene, 'mat-tomato-stake', PLAY_TOGETHER_PALETTE.farm.honeyWood, {
    specularPower: 32,
    specularLevel: 0.2,
  });
  const leafMat = createToyMaterial(scene, 'mat-tomato-leaf', PLAY_TOGETHER_PALETTE.farm.leafGreen, {
    specularPower: 64,
    specularLevel: 0.38,
    ambientScale: 0.48,
  });
  const calyxMat = createToyMaterial(scene, 'mat-tomato-calyx', PLAY_TOGETHER_PALETTE.farm.leafDark);
  const redTomatoMat = createToyMaterial(scene, 'mat-tomato-red', '#ef4444', {
    specularPower: 128,
    specularLevel: 0.65,
    ambientScale: 0.46,
  });
  const orangeTomatoMat = createToyMaterial(scene, 'mat-tomato-orange', '#f97316', {
    specularPower: 110,
    specularLevel: 0.55,
  });
  const greenTomatoMat = createToyMaterial(scene, 'mat-tomato-green', '#86efac', {
    specularPower: 64,
    specularLevel: 0.4,
  });
  const flowerMat = createToyMaterial(scene, 'mat-tomato-flower', PLAY_TOGETHER_PALETTE.pastels.butterYellow);

  const isMature = progress >= 1.0;

  if (progress < 0.25) {
    // Giai đoạn 0: Mầm cây cà chua non mập mạp
    const grow = 0.65 + progress * 1.4;
    bodyGroup.scaling.set(grow, grow, grow);
    const sprout = MeshBuilder.CreateSphere(`tomato-sprout-${key}`, {
      diameterX: 0.26,
      diameterY: 0.35,
      diameterZ: 0.18,
      segments: 8,
    }, scene);
    sprout.position.y = 0.2;
    sprout.material = leafMat;
    sprout.parent = bodyGroup;
  } else {
    // Giai đoạn 1, 2, 3: Có cọc tre mộc mạc cao 1.15m + thân leo
    const grow = progress < 0.75 ? (0.75 + (progress - 0.25) * 0.4) : (progress < 1.0 ? 0.92 : 1.0);
    bodyGroup.scaling.set(grow, grow, grow);

    // Cọc tre cắm nghiêng nhẹ tự nhiên
    const stake = MeshBuilder.CreateCylinder(`tomato-stake-${key}`, {
      height: 1.18,
      diameterTop: 0.05,
      diameterBottom: 0.065,
      tessellation: 8,
    }, scene);
    stake.position.set(-0.06, 0.59, 0);
    stake.rotation.z = -0.04;
    stake.material = stakeMat;
    stake.parent = bodyGroup;
    if (shadows) shadows.addShadowCaster(stake);

    // Thân leo quấn quanh cọc
    const vineHeight = progress < 0.75 ? 0.7 : 1.05;
    const vine = MeshBuilder.CreateCylinder(`tomato-vine-${key}`, {
      height: vineHeight,
      diameterTop: 0.035,
      diameterBottom: 0.055,
      tessellation: 8,
    }, scene);
    vine.position.set(-0.02, vineHeight * 0.5, 0.02);
    vine.rotation.z = 0.05;
    vine.material = leafMat;
    vine.parent = bodyGroup;

    // Các cụm lá xẻ thùy đặc trưng
    const leafNodes = [
      { y: 0.35, x: 0.16, z: 0.1, ry: 0.4, s: 0.26 },
      { y: 0.58, x: -0.2, z: -0.08, ry: -0.8, s: 0.28 },
      { y: 0.82, x: 0.18, z: -0.06, ry: 1.2, s: 0.25 },
    ];
    leafNodes.forEach((ln, lIdx) => {
      const leaf = MeshBuilder.CreateSphere(`tomato-leaf-${key}-${lIdx}`, {
        diameterX: ln.s * 1.2,
        diameterY: ln.s * 0.5,
        diameterZ: ln.s,
        segments: 6,
      }, scene);
      leaf.position.set(ln.x, ln.y, ln.z);
      leaf.rotation.y = ln.ry;
      leaf.rotation.x = 0.3;
      leaf.material = leafMat;
      leaf.parent = bodyGroup;
    });

    if (progress >= 0.75 && progress < 1.0) {
      // Giai đoạn 2: Hoa vàng nhỏ + quả non xanh
      [0.45, 0.72].forEach((fy, fIdx) => {
        const flower = MeshBuilder.CreateCylinder(`tomato-flower-${key}-${fIdx}`, {
          height: 0.03,
          diameter: 0.16,
          tessellation: 5,
        }, scene);
        flower.position.set(0.18, fy, 0.14 * (fIdx === 0 ? 1 : -1));
        flower.rotation.x = Math.PI / 2;
        flower.material = flowerMat;
        flower.parent = bodyGroup;
      });

      const greenFruit = MeshBuilder.CreateSphere(`tomato-green-${key}`, {
        diameter: 0.22,
        segments: 10,
      }, scene);
      greenFruit.position.set(0.16, 0.5, 0.12);
      greenFruit.material = greenTomatoMat;
      greenFruit.parent = bodyGroup;
    } else if (isMature) {
      // Giai đoạn 3: Chùm 4 quả cà chua chín đỏ mọng căng bóng + 1 quả ửng cam
      const tomatoes = [
        { x: 0.18, y: 0.42, z: 0.14, r: 0.26, mat: redTomatoMat },
        { x: -0.16, y: 0.52, z: 0.16, r: 0.24, mat: redTomatoMat },
        { x: 0.14, y: 0.72, z: -0.12, r: 0.22, mat: redTomatoMat },
        { x: -0.12, y: 0.85, z: -0.1, r: 0.2, mat: orangeTomatoMat },
      ];

      tomatoes.forEach((t, tIdx) => {
        const fruit = MeshBuilder.CreateSphere(`tomato-fruit-${key}-${tIdx}`, {
          diameterX: t.r,
          diameterY: t.r * 0.92,
          diameterZ: t.r,
          segments: 12,
        }, scene);
        fruit.position.set(t.x, t.y, t.z);
        fruit.material = t.mat;
        fruit.parent = bodyGroup;
        if (shadows) shadows.addShadowCaster(fruit);

        // Đài hoa ngôi sao 5 cánh ôm quả
        const calyx = MeshBuilder.CreateCylinder(`tomato-calyx-${key}-${tIdx}`, {
          height: 0.025,
          diameter: t.r * 0.65,
          tessellation: 5,
        }, scene);
        calyx.position.set(t.x, t.y + t.r * 0.45, t.z);
        calyx.material = calyxMat;
        calyx.parent = bodyGroup;
      });
    }
  }

  let starIcon = null;
  if (isMature) {
    starIcon = createHarvestStar(scene, root, key, { height: 1.54 });
    triggerToyBounce(scene, bodyGroup, { bounceFactor: 1.15 });
  }

  return {
    root,
    bodyGroup,
    animate: (t) => {
      const wave = Math.sin(t * 0.003 + (key.charCodeAt(0) || 0));
      bodyGroup.rotation.z = wave * 0.045;
      bodyGroup.rotation.x = Math.cos(t * 0.0024 + (key.charCodeAt(0) || 0)) * 0.03;
      if (starIcon && !starIcon.isDisposed()) {
        starIcon.position.y = 1.54 + Math.sin(t * 0.004) * 0.08;
        starIcon.rotation.y = t * 0.0025;
      }
    },
  };
}

// =============================================================================
// 4. DÂU TÂY (STRAWBERRY) — Bụi hoa thị 3 thùy bò sát đất, quả nón hạt vàng
// =============================================================================
export function createChibiStrawberryMesh(scene, key, progress, options = {}) {
  const root = new TransformNode(`crop-strawberry-root-${key}`, scene);
  const shadows = options.shadows || null;
  createSoilMound(scene, root, key, { diameter: 1.12, height: 0.22 });

  const bodyGroup = new TransformNode(`strawberry-body-group-${key}`, scene);
  bodyGroup.parent = root;

  const leafMat = createToyMaterial(scene, 'mat-straw-leaf', '#15803d', {
    specularPower: 64,
    specularLevel: 0.35,
    ambientScale: 0.45,
  });
  const berryMat = createToyMaterial(scene, 'mat-straw-berry', '#e11d48', {
    specularPower: 120,
    specularLevel: 0.6,
    ambientScale: 0.45,
  });
  const seedMat = createToyMaterial(scene, 'mat-straw-seed', '#fde047', {
    specularPower: 40,
    specularLevel: 0.3,
  });
  const flowerWhiteMat = createToyMaterial(scene, 'mat-straw-flower-w', '#ffffff');
  const flowerYellowMat = createToyMaterial(scene, 'mat-straw-flower-y', '#facc15');

  const isMature = progress >= 1.0;

  if (progress < 0.25) {
    // Giai đoạn 0: Mầm non 2 phiến lá xòe sát đất
    const grow = 0.65 + progress * 1.4;
    bodyGroup.scaling.set(grow, grow, grow);
    [-0.1, 0.1].forEach((lx, i) => {
      const sp = MeshBuilder.CreateSphere(`straw-sprout-${key}-${i}`, {
        diameterX: 0.18,
        diameterY: 0.12,
        diameterZ: 0.24,
        segments: 8,
      }, scene);
      sproutShape(sp, lx, i);
      sp.material = leafMat;
      sp.parent = bodyGroup;
    });
  } else {
    // Giai đoạn 1, 2, 3: Bụi hoa thị tròn xòe rộng (Rosette)
    const grow = progress < 0.75 ? (0.75 + (progress - 0.25) * 0.4) : (progress < 1.0 ? 0.92 : 1.0);
    bodyGroup.scaling.set(grow, grow, grow);

    // 5 cụm lá 3 thùy (Trifoliate leaves) xòe bao quanh luống
    [0, 1.25, 2.5, 3.75, 5.0].forEach((ang, idx) => {
      const cluster = new TransformNode(`straw-leaf-cluster-${key}-${idx}`, scene);
      cluster.position.set(Math.cos(ang) * 0.22, 0.14, Math.sin(ang) * 0.22);
      cluster.rotation.y = ang;
      cluster.parent = bodyGroup;

      // 3 thùy lá của 1 chùm
      [-0.08, 0, 0.08].forEach((lx, lIdx) => {
        const leaf = MeshBuilder.CreateSphere(`straw-leaf-${key}-${idx}-${lIdx}`, {
          diameterX: 0.14,
          diameterY: 0.04,
          diameterZ: 0.18,
          segments: 6,
        }, scene);
        leaf.position.set(lx, 0.02, lIdx === 1 ? 0.08 : 0.04);
        leaf.rotation.x = 0.25;
        leaf.rotation.y = (lIdx - 1) * 0.35;
        leaf.material = leafMat;
        leaf.parent = cluster;
      });
    });

    if (progress >= 0.75 && progress < 1.0) {
      // Giai đoạn 2: Nở 3 bông hoa dâu tây trắng muốt nhụy vàng
      [0.6, 2.7, 4.8].forEach((ang, fIdx) => {
        const flower = MeshBuilder.CreateCylinder(`straw-flower-${key}-${fIdx}`, {
          height: 0.02,
          diameter: 0.16,
          tessellation: 5,
        }, scene);
        flower.position.set(Math.cos(ang) * 0.25, 0.22, Math.sin(ang) * 0.25);
        flower.rotation.x = 0.3;
        flower.material = flowerWhiteMat;
        flower.parent = bodyGroup;

        const center = MeshBuilder.CreateSphere(`straw-center-${key}-${fIdx}`, {
          diameter: 0.06,
          segments: 6,
        }, scene);
        center.position.set(flower.position.x, flower.position.y + 0.015, flower.position.z);
        center.material = flowerYellowMat;
        center.parent = bodyGroup;
      });
    } else if (isMature) {
      // Giai đoạn 3: 4 quả dâu tây đỏ mọng hình nón có hạt vàng + núm lá xanh
      const berries = [
        { x: 0.22, z: 0.12, rY: 0.4, scale: 1.0 },
        { x: -0.2, z: 0.16, rY: 2.1, scale: 0.95 },
        { x: -0.16, z: -0.2, rY: 3.6, scale: 0.9 },
        { x: 0.18, z: -0.18, rY: 5.1, scale: 0.88 },
      ];

      berries.forEach((b, bIdx) => {
        const berryNode = new TransformNode(`straw-fruit-node-${key}-${bIdx}`, scene);
        berryNode.position.set(b.x, 0.12, b.z);
        berryNode.rotation.y = b.rY;
        berryNode.scaling.set(b.scale, b.scale, b.scale);
        berryNode.parent = bodyGroup;

        // Quả hình nón (cone) ngược tròn đầu
        const cone = MeshBuilder.CreateCylinder(`straw-cone-${key}-${bIdx}`, {
          height: 0.24,
          diameterTop: 0.18,
          diameterBottom: 0.06,
          tessellation: 10,
        }, scene);
        cone.position.set(0, 0.08, 0.04);
        cone.rotation.x = 0.55;
        cone.material = berryMat;
        cone.parent = berryNode;
        if (shadows) shadows.addShadowCaster(cone);

        // Đài lá xanh ôm cuống dâu
        const calyx = MeshBuilder.CreateCylinder(`straw-calyx-${key}-${bIdx}`, {
          height: 0.02,
          diameter: 0.2,
          tessellation: 5,
        }, scene);
        calyx.position.set(0, 0.18, 0.09);
        calyx.rotation.x = 0.55;
        calyx.material = leafMat;
        calyx.parent = berryNode;

        // Vài hạt dâu vàng lấm tấm
        [-0.04, 0.04].forEach((sx, sIdx) => {
          const seed = MeshBuilder.CreateSphere(`straw-seed-${key}-${bIdx}-${sIdx}`, {
            diameter: 0.03,
            segments: 4,
          }, scene);
          seed.position.set(sx, 0.08, 0.13);
          seed.material = seedMat;
          seed.parent = berryNode;
        });
      });
    }
  }

  let starIcon = null;
  if (isMature) {
    starIcon = createHarvestStar(scene, root, key, { height: 1.38 });
    triggerToyBounce(scene, bodyGroup, { bounceFactor: 1.15 });
  }

  return {
    root,
    bodyGroup,
    animate: (t) => {
      const wave = Math.sin(t * 0.003 + (key.charCodeAt(0) || 0));
      bodyGroup.rotation.z = wave * 0.028;
      if (starIcon && !starIcon.isDisposed()) {
        starIcon.position.y = 1.38 + Math.sin(t * 0.004) * 0.08;
        starIcon.rotation.y = t * 0.0025;
      }
    },
  };
}

function sproutShape(mesh, lx, i) {
  mesh.rotation.z = lx > 0 ? -0.28 : 0.28;
  mesh.rotation.x = 0.2;
  mesh.position.set(lx, 0.16, (i - 0.5) * 0.04);
}

// =============================================================================
// 5. BÍ NGÔ (PUMPKIN) — Dây leo bò, quả múi dẹt có khía rãnh + cuống xoắn
// =============================================================================
export function createChibiPumpkinMesh(scene, key, progress, options = {}) {
  const root = new TransformNode(`crop-pumpkin-root-${key}`, scene);
  const shadows = options.shadows || null;
  createSoilMound(scene, root, key, { diameter: 1.25, height: 0.26 });

  const bodyGroup = new TransformNode(`pumpkin-body-group-${key}`, scene);
  bodyGroup.parent = root;

  const pumpkinMat = createToyMaterial(scene, 'mat-bot-pumpkin', PLAY_TOGETHER_PALETTE.farm.pumpkinGold, {
    specularPower: 72,
    specularLevel: 0.45,
    ambientScale: 0.46,
  });
  const stemMat = createToyMaterial(scene, 'mat-bot-pumpkin-stem', PLAY_TOGETHER_PALETTE.farm.leafDark, {
    specularPower: 64,
    specularLevel: 0.35,
  });
  const leafMat = createToyMaterial(scene, 'mat-bot-pumpkin-leaf', PLAY_TOGETHER_PALETTE.farm.leafGreen, {
    specularPower: 48,
    specularLevel: 0.3,
  });
  const flowerMat = createToyMaterial(scene, 'mat-bot-pumpkin-flower', '#f59e0b');

  const isMature = progress >= 1.0;

  if (progress < 0.25) {
    // Giai đoạn 0: Mầm hạt bí ngô to tròn nứt vỏ
    const grow = 0.65 + progress * 1.4;
    bodyGroup.scaling.set(grow, grow, grow);
    const sprout = MeshBuilder.CreateSphere(`pumpkin-sprout-${key}`, {
      diameterX: 0.32,
      diameterY: 0.24,
      diameterZ: 0.32,
      segments: 8,
    }, scene);
    sprout.position.y = 0.2;
    sprout.material = leafMat;
    sprout.parent = bodyGroup;
  } else if (progress < 0.75) {
    // Giai đoạn 1: Dây leo bò quanh luống + lá to bản hình chân vịt
    const grow = 0.75 + (progress - 0.25) * 0.45;
    bodyGroup.scaling.set(grow, grow, grow);

    // Dây leo uốn quanh
    const vine = MeshBuilder.CreateTorus(`pumpkin-vine-${key}`, {
      diameter: 0.62,
      thickness: 0.04,
      tessellation: 16,
    }, scene);
    vine.position.set(0.04, 0.16, 0.04);
    vine.material = stemMat;
    vine.parent = bodyGroup;

    // 2 Lá bí ngô to xòe
    [-0.22, 0.24].forEach((lx, idx) => {
      const leaf = MeshBuilder.CreateCylinder(`pumpkin-leaf-${key}-${idx}`, {
        height: 0.03,
        diameter: 0.36,
        tessellation: 7,
      }, scene);
      leaf.position.set(lx, 0.22, idx === 0 ? 0.14 : -0.12);
      leaf.rotation.x = 0.3;
      leaf.rotation.z = (idx - 0.5) * 0.4;
      leaf.material = leafMat;
      leaf.parent = bodyGroup;
    });
  } else {
    // Giai đoạn 2 & 3: Quả bí ngô đầm chắc có múi lượn sóng tự nhiên
    const grow = progress < 1.0 ? 0.88 : 1.0;
    bodyGroup.scaling.set(grow, grow, grow);

    // Tạo hình quả bí ngô dẹt chuẩn: 6 múi tròn xòe tạo rãnh tự nhiên
    const lobeCount = 6;
    const lobeRadius = 0.22;
    for (let i = 0; i < lobeCount; i++) {
      const ang = (i * Math.PI * 2) / lobeCount;
      const lobe = MeshBuilder.CreateSphere(`pumpkin-lobe-${key}-${i}`, {
        diameterX: 0.52,
        diameterY: 0.48,
        diameterZ: 0.52,
        segments: 10,
      }, scene);
      lobe.position.set(Math.cos(ang) * lobeRadius, 0.32, Math.sin(ang) * lobeRadius);
      lobe.material = pumpkinMat;
      lobe.parent = bodyGroup;
      if (shadows) shadows.addShadowCaster(lobe);
    }

    // Phần rốn quả bí ngô ở giữa
    const centerCore = MeshBuilder.CreateSphere(`pumpkin-core-${key}`, {
      diameterX: 0.62,
      diameterY: 0.5,
      diameterZ: 0.62,
      segments: 10,
    }, scene);
    centerCore.position.set(0, 0.32, 0);
    centerCore.material = pumpkinMat;
    centerCore.parent = bodyGroup;

    // Cuống bí ngô uốn cong trên đỉnh
    const stem = MeshBuilder.CreateCylinder(`pumpkin-stem-${key}`, {
      height: 0.28,
      diameterTop: 0.08,
      diameterBottom: 0.14,
      tessellation: 8,
    }, scene);
    stem.position.set(0.04, 0.62, 0);
    stem.rotation.z = 0.28;
    stem.material = stemMat;
    stem.parent = bodyGroup;

    // Tua cuốn xoắn ốc (Tendril)
    const tendril = MeshBuilder.CreateTorus(`pumpkin-tendril-${key}`, {
      diameter: 0.16,
      thickness: 0.025,
      tessellation: 12,
    }, scene);
    tendril.position.set(0.12, 0.56, 0.06);
    tendril.rotation.x = Math.PI / 3;
    tendril.material = stemMat;
    tendril.parent = bodyGroup;

    // Lá chân vịt cạnh quả
    const leaf = MeshBuilder.CreateCylinder(`pumpkin-side-leaf-${key}`, {
      height: 0.03,
      diameter: 0.34,
      tessellation: 6,
    }, scene);
    leaf.position.set(-0.35, 0.24, -0.15);
    leaf.rotation.x = 0.4;
    leaf.rotation.z = -0.3;
    leaf.material = leafMat;
    leaf.parent = bodyGroup;

    if (progress < 1.0) {
      // Hoa bí ngô vàng cam chuông khi chưa chín hẳn
      const flower = MeshBuilder.CreateCylinder(`pumpkin-flower-${key}`, {
        height: 0.14,
        diameterTop: 0.22,
        diameterBottom: 0.08,
        tessellation: 5,
      }, scene);
      flower.position.set(0.34, 0.28, 0.18);
      flower.rotation.z = -0.6;
      flower.material = flowerMat;
      flower.parent = bodyGroup;
    }
  }

  let starIcon = null;
  if (isMature) {
    starIcon = createHarvestStar(scene, root, key, { height: 1.46 });
    triggerToyBounce(scene, bodyGroup, { bounceFactor: 1.15 });
  }

  return {
    root,
    bodyGroup,
    animate: (t) => {
      const wave = Math.sin(t * 0.003 + (key.charCodeAt(0) || 0));
      bodyGroup.rotation.z = wave * 0.024;
      if (starIcon && !starIcon.isDisposed()) {
        starIcon.position.y = 1.46 + Math.sin(t * 0.004) * 0.08;
        starIcon.rotation.y = t * 0.0025;
      }
    },
  };
}

// =============================================================================
// 6. DƯA HẤU (MELON) — Quả bầu dục căng bóng có sọc lượn sóng & dây leo
// =============================================================================
export function createChibiMelonMesh(scene, key, progress, options = {}) {
  const root = new TransformNode(`crop-melon-root-${key}`, scene);
  const shadows = options.shadows || null;
  createSoilMound(scene, root, key, { diameter: 1.25, height: 0.25 });

  const bodyGroup = new TransformNode(`melon-body-group-${key}`, scene);
  bodyGroup.parent = root;

  const melonMat = createToyMaterial(scene, 'mat-bot-melon-green', PLAY_TOGETHER_PALETTE.farm.sweetMelon, {
    specularPower: 96,
    specularLevel: 0.55,
    ambientScale: 0.45,
  });
  const stripeMat = createToyMaterial(scene, 'mat-bot-melon-stripe', '#065f46', {
    specularPower: 72,
    specularLevel: 0.35,
  });
  const vineMat = createToyMaterial(scene, 'mat-bot-melon-vine', PLAY_TOGETHER_PALETTE.farm.leafDark);
  const leafMat = createToyMaterial(scene, 'mat-bot-melon-leaf', PLAY_TOGETHER_PALETTE.farm.leafGreen);

  const isMature = progress >= 1.0;

  if (progress < 0.25) {
    // Giai đoạn 0: Mầm non dưa tròn với đôi lá mầm
    const grow = 0.65 + progress * 1.4;
    bodyGroup.scaling.set(grow, grow, grow);
    const sprout = MeshBuilder.CreateSphere(`melon-sprout-${key}`, {
      diameterX: 0.28,
      diameterY: 0.2,
      diameterZ: 0.24,
      segments: 8,
    }, scene);
    sprout.position.y = 0.18;
    sprout.material = leafMat;
    sprout.parent = bodyGroup;
  } else if (progress < 0.75) {
    // Giai đoạn 1: Dây dưa bò lan với tua cuốn và lá xẻ thùy
    const grow = 0.75 + (progress - 0.25) * 0.45;
    bodyGroup.scaling.set(grow, grow, grow);

    const runner = MeshBuilder.CreateTorus(`melon-runner-${key}`, {
      diameter: 0.65,
      thickness: 0.035,
      tessellation: 16,
    }, scene);
    runner.position.set(0, 0.15, 0);
    runner.material = vineMat;
    runner.parent = bodyGroup;

    [-0.2, 0.2].forEach((lx, idx) => {
      const leaf = MeshBuilder.CreateSphere(`melon-leaf-${key}-${idx}`, {
        diameterX: 0.28,
        diameterY: 0.06,
        diameterZ: 0.22,
        segments: 6,
      }, scene);
      leaf.position.set(lx, 0.2, idx === 0 ? 0.18 : -0.15);
      leaf.material = leafMat;
      leaf.parent = bodyGroup;
    });
  } else {
    // Giai đoạn 2 & 3: Quả dưa hấu hình bầu dục tròn căng bóng, có sọc dọc tự nhiên
    const grow = progress < 1.0 ? 0.88 : 1.0;
    bodyGroup.scaling.set(grow, grow, grow);

    // Thân quả hình bầu dục căng tròn (Oblong ellipsoid)
    const melonBall = MeshBuilder.CreateSphere(`melon-ball-${key}`, {
      diameterX: 0.86,
      diameterY: 0.58,
      diameterZ: 0.64,
      segments: 14,
    }, scene);
    melonBall.position.set(0, 0.32, 0);
    melonBall.material = melonMat;
    melonBall.parent = bodyGroup;
    if (shadows) shadows.addShadowCaster(melonBall);

    // 5 Dải sọc xanh rêu lượn sóng chạy dọc thân dưa
    [-0.24, -0.12, 0, 0.12, 0.24].forEach((offsetZ, sIdx) => {
      const stripe = MeshBuilder.CreateTorus(`melon-stripe-${key}-${sIdx}`, {
        diameter: Math.sqrt(Math.max(0.1, 0.84 * 0.84 - offsetZ * offsetZ * 2)),
        thickness: 0.038,
        tessellation: 16,
      }, scene);
      stripe.position.set(0, 0.32, offsetZ);
      stripe.rotation.x = Math.PI / 2;
      stripe.rotation.y = (sIdx - 2) * 0.12;
      stripe.material = stripeMat;
      stripe.parent = bodyGroup;
    });

    // Cuống xoăn tít như đuôi heo trên đầu quả
    const stem = MeshBuilder.CreateTorus(`melon-stem-${key}`, {
      diameter: 0.16,
      thickness: 0.035,
      tessellation: 12,
    }, scene);
    stem.position.set(0.42, 0.34, 0);
    stem.rotation.y = Math.PI / 3;
    stem.material = vineMat;
    stem.parent = bodyGroup;

    // Dây leo và lá ôm lấy quả
    const sideLeaf = MeshBuilder.CreateSphere(`melon-side-leaf-${key}`, {
      diameterX: 0.32,
      diameterY: 0.05,
      diameterZ: 0.24,
      segments: 6,
    }, scene);
    sideLeaf.position.set(-0.35, 0.18, 0.18);
    sideLeaf.rotation.x = 0.3;
    sideLeaf.material = leafMat;
    sideLeaf.parent = bodyGroup;
  }

  let starIcon = null;
  if (isMature) {
    starIcon = createHarvestStar(scene, root, key, { height: 1.45 });
    triggerToyBounce(scene, bodyGroup, { bounceFactor: 1.15 });
  }

  return {
    root,
    bodyGroup,
    animate: (t) => {
      const wave = Math.sin(t * 0.003 + (key.charCodeAt(0) || 0));
      bodyGroup.rotation.z = wave * 0.022;
      if (starIcon && !starIcon.isDisposed()) {
        starIcon.position.y = 1.45 + Math.sin(t * 0.004) * 0.08;
        starIcon.rotation.y = t * 0.0025;
      }
    },
  };
}

// =============================================================================
// 7. CỦ CẢI ĐƯỜNG / CỦ CẢI TÍM (TURNIP) — Củ tròn chuyển sắc, chùm lá cải thìa
// =============================================================================
export function createChibiTurnipMesh(scene, key, progress, options = {}) {
  const root = new TransformNode(`crop-turnip-root-${key}`, scene);
  const shadows = options.shadows || null;
  createSoilMound(scene, root, key, { diameter: 1.15, height: 0.24 });

  const bodyGroup = new TransformNode(`turnip-body-group-${key}`, scene);
  bodyGroup.parent = root;

  const purpleCrownMat = createToyMaterial(scene, 'mat-bot-turnip-purple', '#c026d3', {
    specularPower: 96,
    specularLevel: 0.55,
    ambientScale: 0.45,
  });
  const whiteRootMat = createToyMaterial(scene, 'mat-bot-turnip-white', '#fffbeb', {
    specularPower: 80,
    specularLevel: 0.4,
    ambientScale: 0.48,
  });
  const leafMat = createToyMaterial(scene, 'mat-bot-turnip-leaf', PLAY_TOGETHER_PALETTE.farm.freshSprout, {
    specularPower: 64,
    specularLevel: 0.4,
    ambientScale: 0.5,
  });
  const darkLeafMat = createToyMaterial(scene, 'mat-bot-turnip-leaf-dark', PLAY_TOGETHER_PALETTE.farm.leafGreen);

  const isMature = progress >= 1.0;

  if (progress < 0.25) {
    // Giai đoạn 0: Mầm non 2 lá thìa nhỏ
    const grow = 0.65 + progress * 1.4;
    bodyGroup.scaling.set(grow, grow, grow);
    const sprout = MeshBuilder.CreateSphere(`turnip-sprout-${key}`, {
      diameterX: 0.24,
      diameterY: 0.3,
      diameterZ: 0.16,
      segments: 8,
    }, scene);
    sprout.position.y = 0.18;
    sprout.material = leafMat;
    sprout.parent = bodyGroup;
  } else if (progress < 0.75) {
    // Giai đoạn 1: Bụi lá cải thìa xòe rộng hình hoa thị
    const grow = 0.75 + (progress - 0.25) * 0.45;
    bodyGroup.scaling.set(grow, grow, grow);

    [0, 1.25, 2.5, 3.75, 5.0].forEach((ang, idx) => {
      const leafStem = new TransformNode(`turnip-stem-${key}-${idx}`, scene);
      leafStem.position.set(0, 0.15, 0);
      leafStem.rotation.y = ang;
      leafStem.parent = bodyGroup;

      const leafBlade = MeshBuilder.CreateSphere(`turnip-blade-${key}-${idx}`, {
        diameterX: 0.18,
        diameterY: 0.36,
        diameterZ: 0.08,
        segments: 6,
      }, scene);
      leafBlade.position.set(0, 0.22, 0.12);
      leafBlade.rotation.x = 0.45;
      leafBlade.material = idx % 2 === 0 ? leafMat : darkLeafMat;
      leafBlade.parent = leafStem;
    });
  } else {
    // Giai đoạn 2 & 3: Củ cải tròn múp míp chuyển sắc tím sen - trắng sứ + chùm lá xanh
    const grow = progress < 1.0 ? 0.88 : 1.0;
    bodyGroup.scaling.set(grow, grow, grow);

    // Nửa trên của củ: Vòm cầu màu tím sen tươi tắn
    const upperBulb = MeshBuilder.CreateSphere(`turnip-upper-${key}`, {
      diameterX: 0.62,
      diameterY: 0.42,
      diameterZ: 0.62,
      segments: 12,
    }, scene);
    upperBulb.position.y = 0.28;
    upperBulb.material = purpleCrownMat;
    upperBulb.parent = bodyGroup;
    if (shadows) shadows.addShadowCaster(upperBulb);

    // Nửa dưới của củ: Chóp thon màu trắng sứ cắm vào đất
    const lowerBulb = MeshBuilder.CreateCylinder(`turnip-lower-${key}`, {
      height: 0.28,
      diameterTop: 0.58,
      diameterBottom: 0.14,
      tessellation: 12,
    }, scene);
    lowerBulb.position.y = 0.12;
    lowerBulb.material = whiteRootMat;
    lowerBulb.parent = bodyGroup;

    // Chùm lá cải thìa bóng mượt xòe trên ngọn củ
    [0, 1.05, 2.1, 3.15, 4.2, 5.25].forEach((ang, idx) => {
      const leafStem = new TransformNode(`turnip-crown-stem-${key}-${idx}`, scene);
      leafStem.position.set(0, 0.44, 0);
      leafStem.rotation.y = ang;
      leafStem.parent = bodyGroup;

      const leafBlade = MeshBuilder.CreateSphere(`turnip-crown-blade-${key}-${idx}`, {
        diameterX: 0.22,
        diameterY: 0.42,
        diameterZ: 0.08,
        segments: 8,
      }, scene);
      leafBlade.position.set(0, 0.24, 0.14);
      leafBlade.rotation.x = 0.42;
      leafBlade.material = idx % 2 === 0 ? leafMat : darkLeafMat;
      leafBlade.parent = leafStem;
    });
  }

  let starIcon = null;
  if (isMature) {
    starIcon = createHarvestStar(scene, root, key, { height: 1.48 });
    triggerToyBounce(scene, bodyGroup, { bounceFactor: 1.15 });
  }

  return {
    root,
    bodyGroup,
    animate: (t) => {
      const wave = Math.sin(t * 0.003 + (key.charCodeAt(0) || 0));
      bodyGroup.rotation.z = wave * 0.032;
      if (starIcon && !starIcon.isDisposed()) {
        starIcon.position.y = 1.48 + Math.sin(t * 0.004) * 0.08;
        starIcon.rotation.y = t * 0.0025;
      }
    },
  };
}
