/**
 * StylizedWaterEngine.js
 * 
 * Ultra High-End 3D Water System (Play Together x Animal Crossing x Ghibli Aesthetic).
 * Provides:
 * 1. Procedural Multi-Octave Toon Caustics & Water Textures (Lake, River, Ocean).
 * 2. Concentric Radiating Water Ripple System (boat wakes, dock pilings, lily pads).
 * 3. Scalloped Shoreline Foam with natural breathing cycles.
 * 4. Pure Mathematical Buoyancy Physics for floating objects (boats, lily pads, buoys).
 * 5. Nautical Buoy props with realistic wave tilt.
 */

import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { FresnelParameters } from '@babylonjs/core/Materials/fresnelParameters.js';

function canCreateCanvas() {
  return typeof OffscreenCanvas !== 'undefined' || (typeof document !== 'undefined' && typeof document.createElement === 'function');
}

/**
 * Mathematical buoyancy wave evaluation (Zero GC, 60 FPS).
 */
export function getWaterWaveHeight(x, z, time, bodyType = 'lake') {
  if (bodyType === 'lake') {
    // Hồ tĩnh lặng: dao động nhẹ nhàng êm ái
    return 0.032 * Math.sin(x * 0.14 + time * 1.6) * Math.cos(z * 0.16 + time * 1.3);
  }
  if (bodyType === 'river') {
    // Sông chảy xuôi dòng: bước sóng dài xuôi theo trục Z
    return 0.038 * Math.sin(x * 0.20 + z * 0.08 - time * 2.6);
  }
  if (bodyType === 'ocean') {
    // Biển sóng lớn: sóng cuộn dạt vào bờ cát (z = 361)
    const waveDist = (z - 361);
    const mainWave = Math.sin(waveDist * 0.075 - time * 1.6);
    const crossWave = Math.cos(x * 0.045 + time * 1.1) * 0.03;
    return 0.09 * mainWave + crossWave;
  }
  return 0;
}

/**
 * Áp dụng vật lý bồng bềnh dập dềnh cho thuyền, lá sen, phao câu cá.
 */
export function applyBuoyancyToObject(node, basePos, baseRot, time, options = {}) {
  const amp = options.amplitude ?? 0.035;
  const freq = options.frequency ?? 1.8;
  const rollAmp = options.rollAmplitude ?? 0.045; // ~2.5 độ
  const pitchAmp = options.pitchAmplitude ?? 0.030; // ~1.7 độ
  const phase = options.phase ?? (basePos.x * 0.08 + basePos.z * 0.08);

  const waveY = amp * Math.sin(time * freq + phase);
  node.position.y = basePos.y + waveY;
  node.rotation.x = baseRot.x + pitchAmp * Math.cos(time * freq * 0.85 + phase);
  node.rotation.z = baseRot.z + rollAmp * Math.sin(time * freq * 0.75 + phase);
}

/**
 * VÒNG SÓNG LAN TỎA (Concentric Radiating Water Ripples).
 * Tạo các vòng bọt nước mở rộng dần từ tâm và mờ dần (chuẩn Play Together / Animal Crossing).
 */
export function createWaterRippleRingSystem(scene, parent, options = {}) {
  const count = options.count ?? 3;
  const maxRadius = options.maxRadius ?? 2.4;
  const minRadius = options.minRadius ?? 0.35;
  const speed = options.speed ?? 0.75;
  const y = options.y ?? 0.075;
  const color = options.color ?? '#ffffff';
  const prefix = options.prefix ?? `ripple-${Math.round(options.center?.x || 0)}_${Math.round(options.center?.z || 0)}`;

  const mat = new StandardMaterial(`${prefix}-mat`, scene);
  mat.diffuseColor = Color3.FromHexString(color);
  mat.emissiveColor = Color3.FromHexString(color).scale(0.85);
  mat.specularColor = Color3.Black();
  mat.disableLighting = true;
  mat.backFaceCulling = false;

  const root = new TransformNode(`${prefix}-root`, scene);
  if (options.center) {
    root.position.copyFrom(options.center);
  }
  if (parent) root.parent = parent;

  const rings = [];
  for (let i = 0; i < count; i++) {
    const ring = MeshBuilder.CreateTorus(`${prefix}-ring-${i}`, {
      diameter: maxRadius * 2,
      thickness: 0.032,
      tessellation: 32,
    }, scene);
    ring.position.y = y;
    ring.scaling.set(0.01, 1, 0.01);
    ring.material = mat;
    ring.isPickable = false;
    ring.parent = root;
    rings.push({
      mesh: ring,
      phaseOffset: i / count,
    });
  }

  return {
    root,
    update(timeSec) {
      rings.forEach(({ mesh, phaseOffset }) => {
        const progress = ((timeSec * speed + phaseOffset) % 1.0);
        const radius = minRadius + progress * (maxRadius - minRadius);
        const scale = radius / maxRadius;
        mesh.scaling.set(scale, 1, scale);
        // Alpha mở rộng: bắt đầu rõ, khi to ra thì tan biến nhẹ nhàng vào nước
        const alpha = Math.sin((1.0 - progress) * Math.PI * 0.5) * 0.70;
        mesh.visibility = Math.max(0, Math.min(1, alpha));
      });
    },
    dispose() {
      rings.forEach(r => r.mesh.dispose());
      mat.dispose();
      root.dispose();
    },
  };
}

/**
 * PHAO BIỂN NAUTICAL BUOY ĐÁNG YÊU (Play Together Floating Marker).
 * Phao nổi sọc đỏ trắng nhấp nhô theo sóng biển với cột ăng-ten nhỏ.
 */
export function createNauticalBuoy(scene, parent, position) {
  const buoyRoot = new TransformNode(`nautical-buoy-${Math.round(position.x)}_${Math.round(position.z)}`, scene);
  buoyRoot.position.copyFrom(position);
  if (parent) buoyRoot.parent = parent;

  const matRed = new StandardMaterial('buoy-red-mat', scene);
  matRed.diffuseColor = Color3.FromHexString('#ef4444');
  matRed.specularColor = new Color3(0.2, 0.2, 0.2);

  const matWhite = new StandardMaterial('buoy-white-mat', scene);
  matWhite.diffuseColor = Color3.FromHexString('#f8fafc');
  matWhite.specularColor = new Color3(0.2, 0.2, 0.2);

  const matYellow = new StandardMaterial('buoy-yellow-mat', scene);
  matYellow.diffuseColor = Color3.FromHexString('#f59e0b');
  matYellow.emissiveColor = Color3.FromHexString('#f59e0b').scale(0.3);

  // Thân phao hình chuông nổi
  const lowerHull = MeshBuilder.CreateCylinder('buoy-lower', {
    diameterTop: 1.1,
    diameterBottom: 0.65,
    height: 0.65,
    tessellation: 16,
  }, scene);
  lowerHull.position.y = 0.22;
  lowerHull.material = matRed;
  lowerHull.parent = buoyRoot;

  const upperRing = MeshBuilder.CreateTorus('buoy-ring', {
    diameter: 1.15,
    thickness: 0.22,
    tessellation: 20,
  }, scene);
  upperRing.position.y = 0.45;
  upperRing.material = matWhite;
  upperRing.parent = buoyRoot;

  // Cột tháp cảnh báo
  const tower = MeshBuilder.CreateCylinder('buoy-tower', {
    diameterTop: 0.12,
    diameterBottom: 0.28,
    height: 1.2,
    tessellation: 8,
  }, scene);
  tower.position.y = 1.1;
  tower.material = matRed;
  tower.parent = buoyRoot;

  const beacon = MeshBuilder.CreateSphere('buoy-beacon', { diameter: 0.28, segments: 8 }, scene);
  beacon.position.y = 1.75;
  beacon.material = matYellow;
  beacon.parent = buoyRoot;

  const basePos = position.clone();
  const baseRot = new Vector3(0, 0, 0);

  return {
    root: buoyRoot,
    update(timeSec) {
      applyBuoyancyToObject(buoyRoot, basePos, baseRot, timeSec, {
        amplitude: 0.08,
        frequency: 1.6,
        rollAmplitude: 0.09,
        pitchAmplitude: 0.07,
      });
    },
    dispose() {
      buoyRoot.dispose();
      matRed.dispose();
      matWhite.dispose();
      matYellow.dispose();
    },
  };
}

/**
 * 1. HỒ PHA LÊ (Romantic Lake Toon Caustics Texture)
 * Nền xanh ngọc lam chuyển dần sang ngọc bích, vân caustics mạng lụa hữu cơ và đốm sao lấp lánh chuẩn Ghibli.
 */
export function createLakeWaterTexture(scene, size = 256) {
  if (!canCreateCanvas()) {
    return { uOffset: 0, vOffset: 0, dispose() {} };
  }
  const dt = new DynamicTexture('lake-crystal-water-tex', { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.anisotropicFilteringLevel = 16;
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.WRAP_ADDRESSMODE;
  const ctx = dt.getContext();

  // 1. Nền nước ngọc lam Play Together phẳng mịn, đồng nhất 100% (Seamless Tropical Cyan)
  // Màu nền đồng nhất tuyệt đối để triệt tiêu 100% đường nối gạch men khi wrap texture
  ctx.fillStyle = '#00b4d8';
  ctx.fillRect(0, 0, size, size);

  // 2. Các vùng nước ngọc lam sáng tươi loang mềm mại (Seamless Aqua Bloom Sheen)
  let seed = 12345;
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

  for (let i = 0; i < 8; i++) {
    const cx = rnd() * size;
    const cy = rnd() * size;
    const r = 45 + rnd() * 55;

    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const x = cx + ox;
        const y = cy + oy;
        if (x + r < 0 || x - r > size || y + r < 0 || y - r > size) continue;

        const rad = ctx.createRadialGradient(x, y, 0, x, y, r);
        rad.addColorStop(0.0, 'rgba(56, 225, 234, 0.40)');
        rad.addColorStop(0.6, 'rgba(34, 211, 238, 0.18)');
        rad.addColorStop(1.0, 'rgba(0, 180, 216, 0.0)');

        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 3. Các vệt nắng lướt nhẹ mềm mại (Soft Organic Luminous Sheen)
  for (let i = 0; i < 12; i++) {
    const cx = rnd() * size;
    const cy = rnd() * size;
    const rx = 36 + rnd() * 45;
    const ry = 18 + rnd() * 24;
    const rot = rnd() * Math.PI;

    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const x = cx + ox;
        const y = cy + oy;
        if (x + rx < 0 || x - rx > size || y + ry < 0 || y - ry > size) continue;

        const rad = ctx.createRadialGradient(x, y, 0, x, y, rx);
        rad.addColorStop(0.0, 'rgba(255, 255, 255, 0.20)');
        rad.addColorStop(0.5, 'rgba(224, 242, 254, 0.08)');
        rad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  dt.update();
  return dt;
}

/**
 * 2. ĐẠI DƯƠNG & BỜ BIỂN (Seamless Tropical Ocean Depth Gradient & Caustics Texture)
 * Nền chuyển sắc độ sâu tuyệt đối (Continuous Depth Gradient):
 * - Vùng nước nông: Ngọc lam sáng bừng (Turquoise / Aquamarine) ven bờ sang Cerulean Azure (#0284c7)
 * - Vùng nước sâu: Bắt đầu chính xác từ #0284c7 (triệt tiêu 100% đường lằn chia cắt) sang Royal Sapphire (#1e40af)
 * - Tích hợp mạng lưới khúc xạ ánh nắng (Luminous Organic Caustics) lung linh chân thật 100%.
 */
export function createOceanDepthTexture(scene, size = 512, options = {}) {
  if (!canCreateCanvas()) {
    return { uOffset: 0, vOffset: 0, dispose() {} };
  }
  const isMid = options.depth === 'mid';
  const name = isMid ? 'ocean-mid-depth-tex' : 'ocean-shallow-depth-tex';
  const dt = new DynamicTexture(name, { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.anisotropicFilteringLevel = 16;
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.CLAMP_ADDRESSMODE;
  const ctx = dt.getContext();

  // Màu nước biển phẳng mịn, tươi sáng, thuần khiết chuẩn Play Together (100% như mẫu)
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(0, 0, size, size);

  dt.update();
  return dt;
}

export function createOceanSurfTexture(scene, size = 512, options = {}) {
  return createOceanDepthTexture(scene, size, options);
}

/**
 * 3. ĐẠI SÔNG UỐN LƯỢN (Grand River Flow Texture)
 * Nước chảy êm đềm lững lờ chuẩn Play Together, đồng bộ màu sắc và họa tiết 100% với Hồ Pha Lê.
 * Bờ Tây (trái) thông suốt sang Hồ Pha Lê không tì vết, bờ Đông (phải) viền bọt mỏng êm ái.
 */
export function createRiverStreamTexture(scene, size = 256) {
  if (!canCreateCanvas()) {
    return { uOffset: 0, vOffset: 0, dispose() {} };
  }
  const dt = new DynamicTexture('river-toon-stream-tex', { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.anisotropicFilteringLevel = 16;
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.WRAP_ADDRESSMODE;
  const ctx = dt.getContext();

  // 1. Nền chuyển sắc nước ngọt ngọc lam Play Together đồng bộ 100% với Hồ Pha Lê
  // Chuyển sắc từ bờ Tây sang lòng sông và bờ Đông
  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0.0, '#00b4d8');  // Bờ Tây (giáp Hồ Pha Lê)
  grad.addColorStop(0.25, '#22d3ee'); // Nước ngọc lam tươi sáng
  grad.addColorStop(0.50, '#38bdf8'); // Luồng nước giữa sông phản chiếu nắng
  grad.addColorStop(0.75, '#22d3ee'); // Nước trong mát
  grad.addColorStop(1.0, '#00b4d8');  // Bờ Đông
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // 2. Dải luồng chảy xuôi dòng dọc theo trục V (Longitudinal Flow Streaks - KHÔNG Ô VUÔNG, KHÔNG VẠCH NGANG)
  // Các vệt nước mềm mại uốn lượn thon dài xuôi theo dòng sông
  let seed = 54321;
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

  for (let i = 0; i < 18; i++) {
    const cx = rnd() * size;
    const cy = rnd() * size;
    const rx = 12 + rnd() * 18; // Hẹp theo chiều ngang sông (U)
    const ry = 42 + rnd() * 55; // Dài thon thả dọc theo chiều dòng chảy (V)

    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const x = cx + ox;
        const y = cy + oy;
        if (x + rx < 0 || x - rx > size || y + ry < 0 || y - ry > size) continue;

        const rad = ctx.createRadialGradient(x, y, 0, x, y, ry);
        rad.addColorStop(0.0, 'rgba(255, 255, 255, 0.20)');
        rad.addColorStop(0.5, 'rgba(224, 242, 254, 0.08)');
        rad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 3. Mép bọt nước tan êm ái viền bờ phải (Bờ trái thông suốt 100% sang Hồ Pha Lê)
  const foamGradR = ctx.createLinearGradient(size * 0.94, 0, size, 0);
  foamGradR.addColorStop(0, 'rgba(255, 255, 255, 0)');
  foamGradR.addColorStop(1, 'rgba(255, 255, 255, 0.40)');
  ctx.fillStyle = foamGradR;
  ctx.fillRect(size * 0.94, 0, size * 0.06, size);

  dt.update();
  return dt;
}

/**
 * 4. THÁC NƯỚC NÚI (Mountain Waterfall Rapid Flow Texture)
 * Nước đổ cuồn cuộn từ trên cao xuống với bọt trắng xối xả và vệt dòng chảy xiết.
 */
export function createWaterfallFlowTexture(scene, size = 512) {
  if (!canCreateCanvas()) {
    return { uOffset: 0, vOffset: 0, dispose() {} };
  }
  const dt = new DynamicTexture('waterfall-toon-flow-tex', { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.anisotropicFilteringLevel = 16;
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.WRAP_ADDRESSMODE;
  const ctx = dt.getContext();

  // Nền xanh ngọc lam của nước thác
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#e0f2fe');   // Bọt trắng đầu nguồn
  grad.addColorStop(0.2, '#38bdf8'); // Nước ngọc lam trong vắt
  grad.addColorStop(0.6, '#0284c7'); // Dòng chảy sâu
  grad.addColorStop(0.9, '#bae6fd'); // Bọt trắng đáy thác
  grad.addColorStop(1.0, '#ffffff'); // Bọt xối xả chân thác
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Vệt dòng nước chảy xiết theo phương thẳng đứng (Vertical torrent streaks)
  ctx.lineWidth = 3.2;
  for (let i = 0; i < 28; i++) {
    const x = (i * size) / 28 + (i % 3) * 2;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.75)' : 'rgba(186, 230, 253, 0.60)';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + 6, size * 0.33, x - 6, size * 0.66, x, size);
    ctx.stroke();
  }

  // Mảng bọt trắng xối xả (White foam churning patches)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (let p = 0; p < 36; p++) {
    const px = (p * 47) % size;
    const py = (p * 89) % size;
    const pw = 16 + (p % 4) * 8;
    const ph = 6 + (p % 3) * 4;
    ctx.beginPath();
    ctx.ellipse(px, py, pw, ph, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  dt.update();
  return dt;
}

/**
 * 5. CÁ KOI 3D CHIBI ĐÁNG YÊU (Play Together Stylized Swimming Koi Fish).
 * Thân thoi tròn cute, vây mang, và đuôi ve vẩy sống động theo nhịp bơi.
 */
export function createChibiKoiFish(scene, parent, options = {}) {
  const variety = options.variety || 'kohaku'; // 'kohaku', 'ogon', 'sanke'
  const sizeScale = options.scale || 1.0;
  const prefix = options.prefix || `chibi-koi-${Math.round((options.initialPos?.x || 0) * 10)}`;

  const root = new TransformNode(`${prefix}-root`, scene);
  if (options.initialPos) root.position.copyFrom(options.initialPos);
  if (parent) root.parent = parent;

  // Vật liệu cá Koi
  const matBody = new StandardMaterial(`${prefix}-mat-body`, scene);
  const matAccent = new StandardMaterial(`${prefix}-mat-accent`, scene);
  const matFin = new StandardMaterial(`${prefix}-mat-fin`, scene);
  const matEye = new StandardMaterial(`${prefix}-mat-eye`, scene);
  matEye.diffuseColor = Color3.FromHexString('#0f172a');
  matEye.specularColor = new Color3(0.5, 0.5, 0.5);

  if (variety === 'kohaku') {
    // Kohaku: Thân trắng tuyết, khoang đỏ cam rực rỡ
    matBody.diffuseColor = Color3.FromHexString('#f8fafc');
    matAccent.diffuseColor = Color3.FromHexString('#ea580c');
    matFin.diffuseColor = Color3.FromHexString('#fed7aa');
  } else if (variety === 'ogon') {
    // Yamabuki Ogon: Toàn thân vàng kim óng ánh
    matBody.diffuseColor = Color3.FromHexString('#f59e0b');
    matAccent.diffuseColor = Color3.FromHexString('#fbbf24');
    matFin.diffuseColor = Color3.FromHexString('#fde68a');
  } else {
    // Taisho Sanke: Thân trắng khoang đen & đỏ
    matBody.diffuseColor = Color3.FromHexString('#f1f5f9');
    matAccent.diffuseColor = Color3.FromHexString('#dc2626');
    matFin.diffuseColor = Color3.FromHexString('#cbd5e1');
  }
  matBody.specularColor = new Color3(0.35, 0.35, 0.35);
  matBody.specularPower = 48;
  matFin.alpha = 0.88;

  // A. Thân cá thoi tròn Chibi
  const body = MeshBuilder.CreateSphere(`${prefix}-body`, {
    diameterX: 0.72 * sizeScale,
    diameterY: 0.28 * sizeScale,
    diameterZ: 0.34 * sizeScale,
    segments: 6,
  }, scene);
  body.material = matBody;
  body.isPickable = false;
  body.parent = root;

  // B. Mảng khoang màu trên lưng cá
  const crest = MeshBuilder.CreateSphere(`${prefix}-crest`, {
    diameterX: 0.42 * sizeScale,
    diameterY: 0.22 * sizeScale,
    diameterZ: 0.28 * sizeScale,
    segments: 4,
  }, scene);
  crest.position.set(0.04 * sizeScale, 0.08 * sizeScale, 0);
  crest.material = matAccent;
  crest.isPickable = false;
  crest.parent = root;

  // C. 2 Mắt tròn Chibi đen nhánh
  [-1, 1].forEach(side => {
    const eye = MeshBuilder.CreateSphere(`${prefix}-eye-${side}`, {
      diameter: 0.07 * sizeScale,
      segments: 4,
    }, scene);
    eye.position.set(0.24 * sizeScale, 0.06 * sizeScale, side * 0.12 * sizeScale);
    eye.material = matEye;
    eye.isPickable = false;
    eye.parent = root;
  });

  // D. 2 Vây mang trái phải
  [-1, 1].forEach(side => {
    const fin = MeshBuilder.CreateCylinder(`${prefix}-fin-${side}`, {
      diameter: 0.22 * sizeScale,
      height: 0.02 * sizeScale,
      tessellation: 4,
    }, scene);
    fin.rotation.z = Math.PI / 4;
    fin.rotation.y = side * 0.45;
    fin.position.set(0.10 * sizeScale, -0.04 * sizeScale, side * 0.18 * sizeScale);
    fin.material = matFin;
    fin.isPickable = false;
    fin.parent = root;
  });

  // E. Khớp đuôi & Vây đuôi ve vẩy (Animated Tail Node)
  const tailNode = new TransformNode(`${prefix}-tail-joint`, scene);
  tailNode.position.set(-0.32 * sizeScale, 0, 0);
  tailNode.parent = root;

  const tailFin = MeshBuilder.CreateCylinder(`${prefix}-tail-fin`, {
    diameter: 0.38 * sizeScale,
    height: 0.02 * sizeScale,
    tessellation: 5,
  }, scene);
  tailFin.rotation.z = Math.PI / 2;
  tailFin.position.set(-0.16 * sizeScale, 0, 0);
  tailFin.scaling.set(0.45, 1.0, 1.2);
  tailFin.material = matFin;
  tailFin.isPickable = false;
  tailFin.parent = tailNode;

  return {
    root,
    tailNode,
    options,
    update(timeSec, dt) {
      // Vẫy đuôi nhịp nhàng: tốc độ vẫy tỷ lệ với nhịp bơi
      const tailWag = Math.sin(timeSec * 7.5 + (options.phase || 0)) * 0.42;
      tailNode.rotation.y = tailWag;

      // Độ lắc nhẹ của thân khi đẩy nước
      root.rotation.z = Math.cos(timeSec * 7.5 + (options.phase || 0)) * 0.06;
    },
    dispose() {
      root.dispose(false, true);
      matBody.dispose();
      matAccent.dispose();
      matFin.dispose();
      matEye.dispose();
    },
  };
}

/**
 * 6. ĐIỂM SÁNG QUANG HỌC ÁNH DƯƠNG TRÊN MẶT NƯỚC (Subtle Optical Sunlight Flecks).
 * Hạt ánh sáng quang học siêu nhỏ mềm mại, lấp lánh tự nhiên trên mặt nước.
 * Tuyệt đối KHÔNG ghép hộp chữ thập tạo hình vẽ hoạt hình giả tạo.
 */
export function createWaterSunSparkles(scene, parent, count = 12, bounds = {}) {
  const root = new TransformNode('water-sun-sparkles-root', scene);
  if (parent) root.parent = parent;

  return {
    root,
    update() {},
    dispose() {
      root.dispose(false, true);
    },
  };
}

/**
 * 7. BẢN ĐỒ NORMAL MAP SÓNG NƯỚC 3D NỘI SUY (Procedural Tangent-Space Wave Normal Map).
 * Tính toán độ dốc vi mô bề mặt nước qua các octave sóng hài, khúc xạ ánh nắng tạo độ lấp lánh 3D thật 100%.
 */
export function createWaterWaveNormalTexture(scene, size = 256) {
  if (!canCreateCanvas()) {
    return { uOffset: 0, vOffset: 0, level: 1, dispose() {} };
  }
  const dt = new DynamicTexture('water-wave-normal-tex', { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.anisotropicFilteringLevel = 16;
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.WRAP_ADDRESSMODE;
  const ctx = dt.getContext();

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  const twoPi = Math.PI * 2;

  let idx = 0;
  for (let y = 0; y < size; y++) {
    const v = (y / size) * twoPi;
    for (let x = 0; x < size; x++) {
      const u = (x / size) * twoPi;

      // 4 Octaves sóng hài liên tục mượt mà tuần hoàn vô tận
      const d1u = 2 * Math.cos(2 * u + v) * 0.36;
      const d1v = 1 * Math.cos(2 * u + v) * 0.36;

      const d2u = -3 * Math.sin(3 * u - 2 * v) * 0.24;
      const d2v = 2 * Math.sin(3 * u - 2 * v) * 0.24;

      const d3u = 5 * Math.cos(5 * u + 4 * v) * 0.16;
      const d3v = 4 * Math.cos(5 * u + 4 * v) * 0.16;

      const d4u = -7 * Math.sin(7 * u - 5 * v) * 0.10;
      const d4v = 5 * Math.sin(7 * u - 5 * v) * 0.10;

      const dHdu = d1u + d2u + d3u + d4u;
      const dHdv = d1v + d2v + d3v + d4v;

      const nx = -dHdu * 1.25;
      const ny = -dHdv * 1.25;
      const nz = 1.0;
      const invLen = 1.0 / Math.hypot(nx, ny, nz);

      data[idx]     = Math.min(255, Math.max(0, Math.round(((nx * invLen) * 0.5 + 0.5) * 255)));
      data[idx + 1] = Math.min(255, Math.max(0, Math.round(((ny * invLen) * 0.5 + 0.5) * 255)));
      data[idx + 2] = Math.min(255, Math.max(0, Math.round(((nz * invLen) * 0.5 + 0.5) * 255)));
      data[idx + 3] = 255;
      idx += 4;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  dt.update();
  return dt;
}

/**
 * 8. KẾT CẤU BỜ CÁT & SỎI TỰ NHIÊN (Natural Riverbank Sand & Pebble Texture).
 * Cát sông ấm hạt mịn, dải cát ướt sẫm màu giáp mép nước, sỏi suối mài mòn tự nhiên và rêu mịn.
 */
export function createRiverbankTexture(scene, size = 512) {
  if (!canCreateCanvas()) {
    return { uOffset: 0, vOffset: 0, dispose() {} };
  }
  const dt = new DynamicTexture('riverbank-sand-pebble-tex', { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.anisotropicFilteringLevel = 16;
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.WRAP_ADDRESSMODE;
  const ctx = dt.getContext();

  // 1. Chuyển sắc bãi cát từ mép nước ướt (U=0) sang cát khô vàng mịn (U=1)
  const baseGrad = ctx.createLinearGradient(0, 0, size, 0);
  baseGrad.addColorStop(0, '#85663f');    // Cát ướt sẫm màu sát mép nước
  baseGrad.addColorStop(0.20, '#a58557'); // Cát ẩm mềm
  baseGrad.addColorStop(0.50, '#deb887'); // Cát bờ sông tự nhiên
  baseGrad.addColorStop(0.85, '#e6c89c'); // Cát vàng óng ánh nắng
  baseGrad.addColorStop(1.0, '#dfc499');  // Bờ đất khô
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  // 2. Hạt cát vi mô ngẫu nhiên (Granular noise)
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  let seed = 42;
  function rnd() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  for (let i = 0; i < data.length; i += 4) {
    const grain = (rnd() - 0.5) * 16;
    data[i]     = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain * 0.9));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain * 0.7));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Sỏi suối mài tròn tự nhiên rải rác trên bãi cát
  const pebbleColors = ['#94a3b8', '#64748b', '#cbd5e1', '#78716c', '#a8a29e', '#57534e'];
  for (let p = 0; p < 72; p++) {
    const px = (rnd() * (size - 30)) + 15;
    const py = (rnd() * size);
    const rx = 3 + rnd() * 6;
    const ry = 2 + rnd() * 4;
    const rot = rnd() * Math.PI;

    // Bóng đổ sỏi trên cát
    ctx.fillStyle = 'rgba(30, 20, 10, 0.35)';
    ctx.beginPath();
    ctx.ellipse(px + 1.5, py + 1.8, rx + 0.8, ry + 0.8, rot, 0, Math.PI * 2);
    ctx.fill();

    // Thân viên sỏi
    ctx.fillStyle = pebbleColors[p % pebbleColors.length];
    ctx.beginPath();
    ctx.ellipse(px, py, rx, ry, rot, 0, Math.PI * 2);
    ctx.fill();

    // Điểm sáng phản chiếu nắng trên mặt sỏi
    ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.beginPath();
    ctx.ellipse(px - rx * 0.25, py - ry * 0.25, rx * 0.45, ry * 0.45, rot, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Mảng rêu ẩm tự nhiên gần mép nước
  for (let m = 0; m < 14; m++) {
    const mx = 20 + rnd() * (size * 0.38);
    const my = rnd() * size;
    const mr = 6 + rnd() * 12;
    const mossGrad = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
    mossGrad.addColorStop(0, 'rgba(101, 163, 13, 0.40)');
    mossGrad.addColorStop(0.6, 'rgba(77, 124, 15, 0.18)');
    mossGrad.addColorStop(1.0, 'rgba(77, 124, 15, 0)');
    ctx.fillStyle = mossGrad;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();
  }

  dt.update();
  return dt;
}

/**
 * 9. KẾT CẤU GỜ ĐÁ CUỘI BỜ SÔNG (Natural River Stone Curb Texture).
 * Đá khối tự nhiên phong hóa, vân rãnh tự nhiên thay thế các dải màu đơn điệu.
 */
export function createRiverStoneCurbTexture(scene, size = 256) {
  if (!canCreateCanvas()) {
    return { uOffset: 0, vOffset: 0, dispose() {} };
  }
  const dt = new DynamicTexture('river-stone-curb-tex', { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.WRAP_ADDRESSMODE;
  const ctx = dt.getContext();

  ctx.fillStyle = '#b7a896';
  ctx.fillRect(0, 0, size, size);

  let seed = 123;
  function rnd() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  const rows = 8;
  const cols = 8;
  const cw = size / cols;
  const ch = size / rows;

  for (let r = 0; r < rows; r++) {
    const shift = (r % 2 === 0 ? 0 : cw * 0.5);
    for (let c = -1; c <= cols; c++) {
      const cx = c * cw + shift;
      const cy = r * ch;
      const stoneColor = (rnd() > 0.5) ? '#c2b3a1' : (rnd() > 0.5 ? '#a89885' : '#cfc1b0');

      ctx.fillStyle = '#6b5d4f';
      ctx.fillRect(cx + 1, cy + 1, cw - 2, ch - 2);

      ctx.fillStyle = stoneColor;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(cx + 2, cy + 2, cw - 4, ch - 4, 3) : ctx.fillRect(cx + 2, cy + 2, cw - 4, ch - 4);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(cx + 3, cy + 3, cw - 6, 2);
    }
  }

  dt.update();
  return dt;
}

/**
 * 10. KẾT CẤU BỌT NƯỚC MỀM MỎNG TRONG SUỐT (Natural Translucent River Foam Texture).
 * Dải bọt li ti tan nhẹ nhàng giáp bờ cát, mềm mại tự nhiên thay vì dải trắng bệt.
 */
export function createRiverFoamTexture(scene, size = 256) {
  if (!canCreateCanvas()) {
    return { uOffset: 0, vOffset: 0, dispose() {} };
  }
  const dt = new DynamicTexture('river-foam-tex', { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.WRAP_ADDRESSMODE;
  const ctx = dt.getContext();

  ctx.clearRect(0, 0, size, size);

  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
  grad.addColorStop(0.35, 'rgba(240, 249, 255, 0.48)');
  grad.addColorStop(0.70, 'rgba(224, 242, 254, 0.18)');
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  let seed = 77;
  function rnd() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  for (let i = 0; i < 85; i++) {
    const bx = rnd() * size * 0.65;
    const by = rnd() * size;
    const br = 1.2 + rnd() * 3.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + rnd() * 0.45})`;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  dt.update();
  return dt;
}

/**
 * Tạo vật liệu mặt nước 3D Chân Thật (Realistic 3D Water Material).
 * Kết hợp Bản đồ Normal Map vi sóng 3D, Phản xạ Fresnel vật lý và Điểm lấp lánh quang học.
 */
export function createStylizedWaterMaterial(scene, name, texture, options = {}) {
  const mat = new StandardMaterial(name, scene);
  const primaryColor = options.diffuseColor || Color3.FromHexString('#00b4d8');
  mat.diffuseColor = primaryColor;
  if (texture && typeof texture.getClassName === 'function' && texture.getClassName() === 'DynamicTexture') {
    mat.diffuseTexture = texture;
  }
  mat.ambientColor = (options.ambientColor || primaryColor).scale(0.42);
  mat.emissiveColor = options.emissiveColor || primaryColor.scale(0.32);
  mat.specularColor = options.specularColor || new Color3(0.35, 0.45, 0.55);
  mat.specularPower = options.specularPower || 48; // Phản xạ ánh nắng mặt trời mềm mại, không bị chói gắt hay aliasing
  mat.alpha = options.alpha ?? 1.0;
  mat.backFaceCulling = options.backFaceCulling ?? false;

  // Bản đồ Normal Map vi sóng 3D: Mặt nước gợn sóng khúc xạ ánh nắng chân thật (mức dịu 0.12 - 0.18)
  if (options.bumpTexture) {
    mat.bumpTexture = options.bumpTexture;
    mat.bumpTexture.level = options.bumpLevel ?? 0.15;
  }

  // Khúc xạ góc nhìn Fresnel: chỉ bật khi options.useFresnel === true (mặc định false để giữ màu nước ngọc lam rực rỡ và vững chắc)
  if (options.useFresnel === true) {
    const fresnel = new FresnelParameters();
    fresnel.bias = options.fresnelBias ?? 0.85;
    fresnel.power = options.fresnelPower ?? 2.0;
    fresnel.leftColor = new Color3(1, 1, 1);
    fresnel.rightColor = new Color3(0.9, 0.95, 1.0);
    mat.opacityFresnelParameters = fresnel;
  }

  if (mat.alpha >= 0.95) {
    mat.needDepthPrePass = true;
    mat.forceDepthWrite = true;
  }
  return mat;
}

/**
 * 11. KẾT CẤU CÁT BIỂN NHIỆT ĐỚI MỊN & VỎ SÒ (Natural Tropical Ocean Sand Texture).
 * Cát biển hạt mịn vàng óng ánh nắng, vân sóng cát gió biển thoai thoải,
 * vỏ sò điệp ngũ sắc và sỏi san hô biển tự nhiên rải rác.
 */
export function createOceanSandTexture(scene, size = 512) {
  if (!canCreateCanvas()) {
    return { uOffset: 0, vOffset: 0, dispose() {} };
  }
  const dt = new DynamicTexture('ocean-sand-fine-tex', { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.anisotropicFilteringLevel = 16;
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.WRAP_ADDRESSMODE;
  const ctx = dt.getContext();

  // 1. Nền cát vàng kem nhiệt đới mềm mại
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#f2dfbe');
  grad.addColorStop(0.5, '#edd2a4');
  grad.addColorStop(1.0, '#e4c896');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // 2. Vân gợn sóng cát gió biển (Subtle Wind-Blown Sand Dune Ripples)
  ctx.strokeStyle = 'rgba(215, 185, 140, 0.35)';
  ctx.lineWidth = 3;
  for (let r = 0; r < 14; r++) {
    const ry = (r * size) / 14 + 10;
    ctx.beginPath();
    ctx.moveTo(0, ry);
    ctx.bezierCurveTo(size * 0.25, ry + 12, size * 0.75, ry - 12, size, ry);
    ctx.stroke();

    // Vệt sáng viền gợn sóng
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, ry - 2);
    ctx.bezierCurveTo(size * 0.25, ry + 10, size * 0.75, ry - 14, size, ry - 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(215, 185, 140, 0.35)';
    ctx.lineWidth = 3;
  }

  // 3. Nhiễu hạt cát vi mô ngẫu nhiên (Granular Sand Noise)
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  let seed = 101;
  function rnd() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  for (let i = 0; i < data.length; i += 4) {
    const grain = (rnd() - 0.5) * 14;
    data[i]     = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain * 0.85));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain * 0.65));
  }
  ctx.putImageData(imgData, 0, 0);

  // 4. Vỏ sò điệp ngũ sắc & vụn san hô biển rải rác tự nhiên
  const shellColors = ['#fce7f3', '#fff1f2', '#fef9c3', '#fed7aa', '#f1f5f9'];
  for (let s = 0; s < 42; s++) {
    const sx = (rnd() * (size - 30)) + 15;
    const sy = (rnd() * size);
    const rad = 2.5 + rnd() * 4.5;
    const rot = rnd() * Math.PI * 2;

    // Bóng đổ vỏ sò
    ctx.fillStyle = 'rgba(60, 45, 30, 0.28)';
    ctx.beginPath();
    ctx.ellipse(sx + 1.2, sy + 1.4, rad, rad * 0.65, rot, 0, Math.PI * 2);
    ctx.fill();

    // Thân vỏ sò (hình quạt vòm)
    ctx.fillStyle = shellColors[s % shellColors.length];
    ctx.beginPath();
    ctx.ellipse(sx, sy, rad, rad * 0.7, rot, 0, Math.PI * 2);
    ctx.fill();

    // Rãnh khía vân vỏ sò
    ctx.strokeStyle = 'rgba(160, 120, 90, 0.25)';
    ctx.lineWidth = 0.8;
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      const angle = rot + (k * 0.28);
      ctx.lineTo(sx + Math.cos(angle) * rad, sy + Math.sin(angle) * (rad * 0.7));
      ctx.stroke();
    }

    // Điểm phản chiếu xà cừ óng ánh
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.arc(sx - rad * 0.25, sy - rad * 0.2, rad * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  dt.update();
  return dt;
}

/**
 * 12. KẾT CẤU CÁT ƯỚT PHẢN CHIẾU GƯƠNG (Wet Mirror Sand Shoreline Texture).
 * Cát ướt bão hòa nước biển sẫm màu, rãnh nước rút phân nhánh (recession rills),
 * độ bóng phản chiếu gương cao cấp và sỏi biển mài nhẵn.
 */
export function createWetMirrorSandTexture(scene, size = 512) {
  if (!canCreateCanvas()) {
    return { uOffset: 0, vOffset: 0, dispose() {} };
  }
  const dt = new DynamicTexture('ocean-wet-mirror-sand-tex', { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.anisotropicFilteringLevel = 16;
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.WRAP_ADDRESSMODE;
  const ctx = dt.getContext();

  // 1. Nền cát ẩm ướt chuyển sắc đậm đà
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#9e8156'); // Sát mép nước biển (rất ướt)
  grad.addColorStop(0.5, '#b0946b');
  grad.addColorStop(1.0, '#c2a87e'); // Giáp cát khô
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // 2. Màng nước tráng gương óng ánh (Glossy Sheen Layer)
  const sheenGrad = ctx.createLinearGradient(0, 0, size, size);
  sheenGrad.addColorStop(0, 'rgba(224, 242, 254, 0.15)');
  sheenGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.22)');
  sheenGrad.addColorStop(0.7, 'rgba(186, 230, 253, 0.10)');
  sheenGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.18)');
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(0, 0, size, size);

  // 3. Rãnh dòng nước rút phân nhánh (Recession Rills & Swash Marks)
  let seed = 202;
  function rnd() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  ctx.lineWidth = 1.4;
  for (let r = 0; r < 24; r++) {
    const rx = (r * size) / 24 + (rnd() - 0.5) * 12;
    ctx.strokeStyle = 'rgba(110, 85, 55, 0.28)';
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.bezierCurveTo(rx + 8, size * 0.35, rx - 6, size * 0.7, rx + 4, size);
    ctx.stroke();

    // Điểm sáng đọng nước mép rãnh
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(rx + 1.2, 0);
    ctx.bezierCurveTo(rx + 9.2, size * 0.35, rx - 4.8, size * 0.7, rx + 5.2, size);
    ctx.stroke();
    ctx.lineWidth = 1.4;
  }

  // 4. Mảnh thủy tinh biển mài nhẵn (Sea Glass) và sỏi biển bóng nước
  const seaGlassColors = ['#a7f3d0', '#67e8f9', '#bae6fd', '#cbd5e1'];
  for (let p = 0; p < 36; p++) {
    const px = (rnd() * (size - 20)) + 10;
    const py = (rnd() * size);
    const pr = 1.8 + rnd() * 3.2;

    ctx.fillStyle = 'rgba(40, 30, 20, 0.35)';
    ctx.beginPath();
    ctx.arc(px + 1, py + 1.2, pr, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = seaGlassColors[p % seaGlassColors.length];
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(px - pr * 0.3, py - pr * 0.3, pr * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  dt.update();
  return dt;
}

/**
 * 13. BẢN ĐỒ NORMAL MAP SÓNG ĐẠI DƯƠNG 3D (Procedural Ocean Wave Normal Map).
 * Khác với hồ và sông, đại dương có bước sóng dài (ocean swell), biên độ lớn và sóng gió vi mô.
 * Phản chiếu ánh nắng mặt trời tạo dải lấp lánh (Sun Glint) rực rỡ chân thật 100%.
 */
export function createOceanWaveNormalTexture(scene, size = 256) {
  if (!canCreateCanvas()) {
    return { uOffset: 0, vOffset: 0, level: 1, dispose() {} };
  }
  const dt = new DynamicTexture('ocean-wave-normal-tex', { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.anisotropicFilteringLevel = 16;
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.WRAP_ADDRESSMODE;
  const ctx = dt.getContext();

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  const twoPi = Math.PI * 2;

  let idx = 0;
  for (let y = 0; y < size; y++) {
    const v = (y / size) * twoPi;
    for (let x = 0; x < size; x++) {
      const u = (x / size) * twoPi;

      // Sóng lừng đại dương êm đềm tuần hoàn hoàn hảo (100% Seamless Periodic Harmonics)
      // Sử dụng bội số nguyên chuẩn xác k_u, k_v ∈ Z để triệt tiêu hoàn toàn đường giáp mí (seam)
      // và hiện tượng nhấp nháy (specular flicker/flashing) khi cuộn texture trên GPU.
      // H(u, v) = 0.28 * sin(u + v) + 0.12 * cos(2u - v) + 0.06 * sin(u - 2v)
      // Đạo hàm dH/du:
      const d1u = 0.28 * Math.cos(u + v);
      const d2u = -0.24 * Math.sin(2 * u - v);
      const d3u = 0.06 * Math.cos(u - 2 * v);

      // Đạo hàm dH/dv:
      const d1v = 0.28 * Math.cos(u + v);
      const d2v = 0.12 * Math.sin(2 * u - v);
      const d3v = -0.12 * Math.cos(u - 2 * v);

      const dHdu = d1u + d2u + d3u;
      const dHdv = d1v + d2v + d3v;

      // Hệ số dốc vi mô êm dịu chuẩn lụa (0.22) tạo độ bóng mượt mà, triệt tiêu hoàn toàn nhấp nháy
      const nx = -dHdu * 0.22;
      const ny = -dHdv * 0.22;
      const nz = 1.0;
      const invLen = 1.0 / Math.hypot(nx, ny, nz);

      data[idx]     = Math.min(255, Math.max(0, Math.round(((nx * invLen) * 0.5 + 0.5) * 255)));
      data[idx + 1] = Math.min(255, Math.max(0, Math.round(((ny * invLen) * 0.5 + 0.5) * 255)));
      data[idx + 2] = Math.min(255, Math.max(0, Math.round(((nz * invLen) * 0.5 + 0.5) * 255)));
      data[idx + 3] = 255;
      idx += 4;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  dt.update();
  return dt;
}

/**
 * 14. KẾT CẤU BỌT SÓNG REN ĐẠI DƯƠNG (Lacy Surf Ocean Foam Texture).
 * Cấu trúc màng ren bọt biển hữu cơ (cellular froth), đa kích thước bong bóng
 * với gradient tan mềm mại, loại bỏ hoàn toàn các dải màu trắng đục nhân tạo.
 */
export function createOceanFoamTexture(scene, size = 256) {
  if (!canCreateCanvas()) {
    return { uOffset: 0, vOffset: 0, dispose() {} };
  }
  const dt = new DynamicTexture('ocean-foam-lacy-tex', { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.CLAMP_ADDRESSMODE;
  dt.hasAlpha = true;
  const ctx = dt.getContext();

  ctx.clearRect(0, 0, size, size);

  // Gradient bọt từ ngọn sóng trước mặt (Y = 0, trắng kem nổi bật) xuôi về sau đuôi sóng (Y = size, tan biến 100% trong suốt)
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.98)');
  grad.addColorStop(0.18, 'rgba(255, 255, 255, 0.88)');
  grad.addColorStop(0.42, 'rgba(240, 253, 250, 0.52)');
  grad.addColorStop(0.72, 'rgba(224, 242, 254, 0.18)');
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Viền bọt sò điệp uốn lượn sắc sảo ở mũi ngọn sóng (Scalloped Foam Crest Border)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  for (let s = 0; s < 16; s++) {
    const sx = (s * size) / 16;
    const sw = size / 16;
    ctx.beginPath();
    ctx.arc(sx + sw * 0.5, 4, sw * 0.65, 0, Math.PI);
    ctx.fill();
  }

  // Mạng lưới bọt khí ren tổ ong hữu cơ (Cellular Froth Bubbles)
  let seed = 303;
  function rnd() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  for (let b = 0; b < 180; b++) {
    const bx = rnd() * size;
    const by = rnd() * size * 0.68;
    const br = 1.6 + rnd() * 4.6;
    const alphaFade = Math.max(0, 1.0 - by / (size * 0.75));

    // Vành bọt trắng
    ctx.strokeStyle = `rgba(255, 255, 255, ${alphaFade * (0.45 + rnd() * 0.45)})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.stroke();

    // Hạt bọt nhỏ li ti bên trong
    ctx.fillStyle = `rgba(255, 255, 255, ${alphaFade * (0.35 + rnd() * 0.35)})`;
    ctx.beginPath();
    ctx.arc(bx, by, br * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  dt.update();
  return dt;
}

/**
 * 15. KẾT CẤU GẠCH LÁT PHỐ ĐI BỘ VEN BIỂN (Coastal Promenade Stone Paver Texture).
 * Gạch lát đá phiến tự nhiên phong cách resort biển cao cấp, kẽ cát tự nhiên.
 */
export function createPromenadePaverTexture(scene, size = 256) {
  if (!canCreateCanvas()) {
    return { uOffset: 0, vOffset: 0, dispose() {} };
  }
  const dt = new DynamicTexture('promenade-paver-stone-tex', { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.WRAP_ADDRESSMODE;
  const ctx = dt.getContext();

  // Nền kẽ mạch cát vôi ấm áp
  ctx.fillStyle = '#8f806e';
  ctx.fillRect(0, 0, size, size);

  let seed = 404;
  function rnd() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  // Lát gạch so le chữ nhật
  const rows = 6;
  const cols = 4;
  const rh = size / rows;
  const cw = size / cols;
  const stoneColors = ['#d8cebe', '#c9bea9', '#ded6ca', '#cfc4b2', '#e2dacf'];

  for (let r = 0; r < rows; r++) {
    const shift = (r % 2 === 0 ? 0 : cw * 0.5);
    for (let c = -1; c <= cols; c++) {
      const cx = c * cw + shift;
      const cy = r * rh;
      const col = stoneColors[Math.floor(rnd() * stoneColors.length)];

      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(cx + 2, cy + 2, cw - 4, rh - 4, 3) : ctx.fillRect(cx + 2, cy + 2, cw - 4, rh - 4);
      ctx.fill();

      // Vệt sáng viền trên viên gạch
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(cx + 3, cy + 3, cw - 6, 2);

      // Bóng đổ mép dưới viên gạch
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(cx + 3, cy + rh - 4, cw - 6, 2);
    }
  }

  dt.update();
  return dt;
}

/**
 * 16. KẾT CẤU CHÂN TRỜI BIỂN XA XĂM (Ocean Horizon Depth Texture).
 * Hòa tan mượt mà từ đáy biển sâu sang màu sương mù chân trời.
 */
export function createOceanHorizonTexture(scene, size = 256) {
  if (!canCreateCanvas()) {
    return { uOffset: 0, vOffset: 0, dispose() {} };
  }
  const dt = new DynamicTexture('ocean-horizon-depth-tex', { width: size, height: size }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.wrapU = Texture.WRAP_ADDRESSMODE;
  dt.wrapV = Texture.CLAMP_ADDRESSMODE;
  const ctx = dt.getContext();
  // Màu nước biển phẳng mịn, tươi sáng, thuần khiết chuẩn Play Together (100% đồng nhất)
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(0, 0, size, size);
  dt.update();
  return dt;
}


