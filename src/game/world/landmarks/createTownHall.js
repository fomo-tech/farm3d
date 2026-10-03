import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { createToyMaterial } from '../../rendering/PlayTogetherTheme.js';

function makeMat(scene, name, hex, emissiveHex = null, specular = 0.5, specularPower = 64) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.5);
  m.specularColor = new Color3(specular, specular, specular);
  m.specularPower = specularPower;
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

/**
 * TÒA THỊ CHÍNH ĐÔ THỊ HIỆN ĐẠI PLAY TOGETHER (MODERN CIVIC CENTER & METROPOLIS CITY HALL)
 * Tọa lạc trang trọng tại điểm cuối đại lộ Bắc (x: 0, z: -98):
 * - Bậc tam cấp cẩm thạch trắng sứ nhiều tầng rộng lớn với viền LED âm sàn sang trọng
 * - Đại sảnh Atrium kính cường lực Panoramic 3 tầng với hệ khung thép Titan đen bóng & Chrome
 * - Mái đón Canopy bay vòm cong hiện đại có đèn downlight âm trần
 * - Tháp đồng hồ đô thị hiện đại (Modern Illuminated Civic Clock Tower) vươn cao 28m:
 *   + 4 Mặt đồng hồ kính phát sáng đèn LED trắng/xanh ngọc, kim giờ & phút xoay chính xác
 *   + Vương miện đỉnh tháp Crown Spire phát chùm sáng định vị đô thị
 * - Bảng hiệu Holographic Neon "KAIA CITY HALL · METROPOLIS CIVIC CENTER"
 * - Hai cánh ban công check-in và bồn hoa cảnh quan đô thị hiện đại hai bên đại sảnh
 */
export function createTownHall(scene, shadows, position = { x: 0, y: 0, z: -98 }) {
  const root = new TransformNode('pt-metropolis-city-hall', scene);
  root.position.set(position.x, position.y || 0, position.z);

  const mats = {
    marbleWhite: makeMat(scene, 'th-marble-white', '#f8fafc', null, 0.7, 100),
    graniteDark: makeMat(scene, 'th-granite-dark', '#0f172a', null, 0.5, 90),
    titaniumFrame: makeMat(scene, 'th-titanium-frame', '#1e293b', null, 0.6, 90),
    glassFacade: makeMat(scene, 'th-glass-facade', '#bae6fd', '#38bdf8', 0.9, 128),
    glassBalcony: makeMat(scene, 'th-glass-balcony', '#e0f2fe', '#00f2fe', 0.9, 128),
    chromeTrim: makeMat(scene, 'th-chrome-trim', '#ffffff', null, 0.95, 128),
    neonCyan: makeMat(scene, 'th-neon-cyan', '#00f2fe', '#38bdf8', 0.95, 128),
    neonGold: makeMat(scene, 'th-neon-gold', '#fbbf24', '#f59e0b', 0.95, 128),
    clockFace: makeMat(scene, 'th-clock-face', '#ffffff', '#e0f2fe', 0.8, 100),
    clockHands: makeMat(scene, 'th-clock-hands', '#0284c7', '#00f2fe', 0.9, 120),
    plantGreen: makeMat(scene, 'th-plant-green', '#10b981', null, 0.25),
    flowerAccent: makeMat(scene, 'th-flower-accent', '#f43f5e', '#fb7185', 0.5),
  };
  mats.glassFacade.alpha = 0.85;
  mats.glassBalcony.alpha = 0.75;

  // ========================================================
  // 1. BẬC TAM CẤP CẨM THẠCH TRẮNG SỨ & KHỐI ĐẾ HOÀNH TRÁNG
  // ========================================================
  const stepConfigs = [
    { w: 26.0, d: 8.5, h: 0.35, y: 0.18, zOffset: 6.5 },
    { w: 23.5, d: 7.2, h: 0.35, y: 0.52, zOffset: 5.8 },
    { w: 21.0, d: 6.0, h: 0.35, y: 0.86, zOffset: 5.0 },
  ];

  stepConfigs.forEach((step, idx) => {
    const s = MeshBuilder.CreateBox(`th-marble-step-${idx}`, {
      width: step.w,
      height: step.h,
      depth: step.d,
    }, scene);
    s.position.set(0, step.y, step.zOffset);
    s.material = mats.marbleWhite;
    s.parent = root;
    s.receiveShadows = true;

    // Dải LED âm sàn phát sáng màu Cyan ở mép mỗi bậc
    const led = MeshBuilder.CreateBox(`th-step-led-${idx}`, {
      width: step.w,
      height: 0.05,
      depth: 0.08,
    }, scene);
    led.position.set(0, step.y + 0.15, step.zOffset + step.d / 2);
    led.material = mats.neonCyan;
    led.parent = root;
  });

  // Khối móng sàn sảnh chính (24m x 16m x 1.2m)
  const plinth = MeshBuilder.CreateBox('th-main-podium', {
    width: 24.0,
    height: 1.2,
    depth: 16.0,
  }, scene);
  plinth.position.set(0, 1.45, 0);
  plinth.material = mats.graniteDark;
  plinth.parent = root;
  plinth.receiveShadows = true;
  shadows?.addShadowCaster(plinth);

  // ========================================================
  // 2. KHỐI ĐẠI SẢNH ATRIUM 3 TẦNG KÍNH PANORAMIC
  // ========================================================
  const mainBuilding = MeshBuilder.CreateBox('th-atrium-building', {
    width: 22.5,
    height: 9.8,
    depth: 15.0,
  }, scene);
  mainBuilding.position.set(0, 6.95, 0);
  mainBuilding.material = mats.marbleWhite;
  mainBuilding.parent = root;
  shadows?.addShadowCaster(mainBuilding);

  // Mặt tiền vách kính Atrium khổng lồ (20m x 8m)
  const glassFacade = MeshBuilder.CreateBox('th-glass-facade-front', {
    width: 20.0,
    height: 8.2,
    depth: 0.35,
  }, scene);
  glassFacade.position.set(0, 6.8, 7.6);
  glassFacade.material = mats.glassFacade;
  glassFacade.parent = root;

  // Hệ khung đố kính Titan dọc thanh lịch (Vertical Mullions)
  [-8, -4, 0, 4, 8].forEach((mx, midx) => {
    const mullion = MeshBuilder.CreateBox(`th-glass-mullion-${midx}`, {
      width: 0.35,
      height: 8.4,
      depth: 0.45,
    }, scene);
    mullion.position.set(mx, 6.8, 7.65);
    mullion.material = mats.titaniumFrame;
    mullion.parent = root;
    shadows?.addShadowCaster(mullion);
  });

  // Mái đón Canopy bay vòm cong hiện đại nhô ra 3.5m trên cửa chính
  const canopy = MeshBuilder.CreateBox('th-entrance-canopy', {
    width: 12.0,
    height: 0.45,
    depth: 4.8,
  }, scene);
  canopy.position.set(0, 5.8, 9.2);
  canopy.material = mats.titaniumFrame;
  canopy.parent = root;
  shadows?.addShadowCaster(canopy);

  // Viền LED vàng Gold phát sáng quanh mép Canopy
  const canopyGlow = MeshBuilder.CreateBox('th-canopy-led', {
    width: 12.2,
    height: 0.12,
    depth: 0.12,
  }, scene);
  canopyGlow.position.set(0, 5.75, 11.6);
  canopyGlow.material = mats.neonGold;
  canopyGlow.parent = root;

  // Cửa kính xoay 3D chính giữa sảnh (Revolving Door)
  const doorCylinder = MeshBuilder.CreateCylinder('th-revolving-door', {
    diameter: 3.2,
    height: 3.4,
    tessellation: 24,
  }, scene);
  doorCylinder.position.set(0, 3.75, 7.6);
  doorCylinder.material = mats.glassFacade;
  doorCylinder.parent = root;

  // ========================================================
  // 3. THÁP ĐỒNG HỒ ĐÔ THỊ HIỆN ĐẠI (METROPOLITAN CLOCK TOWER 28M)
  // ========================================================
  const towerShaft = MeshBuilder.CreateBox('th-tower-shaft', {
    width: 6.8,
    height: 16.0,
    depth: 6.8,
  }, scene);
  towerShaft.position.set(0, 19.8, 0);
  towerShaft.material = mats.graniteDark;
  towerShaft.parent = root;
  shadows?.addShadowCaster(towerShaft);

  // 4 Nẹp nhôm mạ chrome góc tháp
  [-3.3, 3.3].forEach((tx, ti) => {
    [-3.3, 3.3].forEach((tz, tj) => {
      const rib = MeshBuilder.CreateBox(`th-tower-rib-${ti}-${tj}`, {
        width: 0.35,
        height: 16.2,
        depth: 0.35,
      }, scene);
      rib.position.set(tx, 19.8, tz);
      rib.material = mats.chromeTrim;
      rib.parent = root;
    });
  });

  // 4 Mặt đồng hồ kính LED phát sáng (Clock Faces)
  const clockHandsList = [];
  const clockFaces = [
    { x: 0, z: 3.48, rotY: 0 },
    { x: 0, z: -3.48, rotY: Math.PI },
    { x: 3.48, z: 0, rotY: Math.PI / 2 },
    { x: -3.48, z: 0, rotY: -Math.PI / 2 },
  ];

  clockFaces.forEach((f, i) => {
    // Đĩa mặt đồng hồ kính phát sáng
    const dial = MeshBuilder.CreateCylinder(`th-clock-dial-${i}`, {
      height: 0.1,
      diameter: 4.2,
      tessellation: 36,
    }, scene);
    dial.rotation.x = Math.PI / 2;
    dial.rotation.y = f.rotY;
    dial.position.set(f.x, 22.0, f.z);
    dial.material = mats.clockFace;
    dial.parent = root;

    // Vành bezel LED Cyan xung quanh
    const bezel = MeshBuilder.CreateTorus(`th-clock-bezel-${i}`, {
      diameter: 4.25,
      thickness: 0.18,
      tessellation: 36,
    }, scene);
    bezel.rotation.x = Math.PI / 2;
    bezel.rotation.y = f.rotY;
    bezel.position.set(f.x, 22.0, f.z);
    bezel.material = mats.neonCyan;
    bezel.parent = root;

    // Kim giờ Neon
    const hourHand = MeshBuilder.CreateBox(`th-clock-hour-${i}`, {
      width: 0.16,
      height: 1.2,
      depth: 0.08,
    }, scene);
    hourHand.rotation.y = f.rotY;
    hourHand.rotation.z = 0.6;
    hourHand.position.set(f.x, 22.4, f.z + (f.z !== 0 ? (f.z > 0 ? 0.09 : -0.09) : 0));
    hourHand.material = mats.clockHands;
    hourHand.parent = root;

    // Kim phút Neon
    const minHand = MeshBuilder.CreateBox(`th-clock-min-${i}`, {
      width: 0.1,
      height: 1.6,
      depth: 0.08,
    }, scene);
    minHand.rotation.y = f.rotY;
    minHand.rotation.z = -0.4;
    minHand.position.set(f.x, 22.5, f.z + (f.z !== 0 ? (f.z > 0 ? 0.09 : -0.09) : 0));
    minHand.material = mats.clockHands;
    minHand.parent = root;

    clockHandsList.push({ hourHand, minHand });
  });

  // Vương miện đỉnh tháp (Crown Halo Spire)
  const crownRing = MeshBuilder.CreateTorus('th-crown-halo', {
    diameter: 6.2,
    thickness: 0.35,
    tessellation: 36,
  }, scene);
  crownRing.position.y = 28.2;
  crownRing.material = mats.neonCyan;
  crownRing.parent = root;

  // Cột phát sóng Spire đỉnh tháp
  const spire = MeshBuilder.CreateCylinder('th-beacon-spire', {
    diameterTop: 0.08,
    diameterBottom: 0.45,
    height: 5.5,
    tessellation: 12,
  }, scene);
  spire.position.y = 31.0;
  spire.material = mats.chromeTrim;
  spire.parent = root;

  // Đèn Beacon phát sáng đỏ an toàn hàng không trên đỉnh chóp
  const beacon = MeshBuilder.CreateSphere('th-beacon-bulb', { diameter: 0.4, segments: 10 }, scene);
  beacon.position.y = 33.8;
  beacon.material = mats.flowerAccent;
  beacon.parent = root;

  // ========================================================
  // 4. BẢNG HIỆU HOLOGRAPHIC NEON MARQUEE
  // ========================================================
  const dt = new DynamicTexture('th-marquee-tex', { width: 1024, height: 256 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  const ctx = dt.getContext();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(12, 12, 1000, 232, 28);
  ctx.fill();

  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.font = '900 68px "Montserrat", Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#00f2fe';
  ctx.shadowBlur = 24;
  ctx.fillText('KAIA CITY HALL', 512, 115);

  ctx.font = 'bold 26px "Montserrat", Arial, sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 12;
  ctx.fillText('METROPOLIS SOCIAL CIVIC CENTER', 512, 185);

  dt.update();

  const signMat = new StandardMaterial('th-marquee-mat', scene);
  signMat.diffuseTexture = dt;
  signMat.emissiveTexture = dt;
  signMat.emissiveColor = new Color3(0.85, 0.85, 0.85);

  const signPlane = MeshBuilder.CreatePlane('th-marquee-board', { width: 10.5, height: 2.6 }, scene);
  signPlane.position.set(0, 10.8, 7.8);
  signPlane.material = signMat;
  signPlane.parent = root;

  // ========================================================
  // 5. BỒN HOA & CÂY XANH ĐÔ THỊ HIỆN ĐẠI (MODERN CIVIC PLANTERS)
  // ========================================================
  [-14.5, 14.5].forEach((px, pidx) => {
    // Bồn hoa đá granite chữ nhật
    const planter = MeshBuilder.CreateBox(`th-planter-${pidx}`, {
      width: 4.8,
      height: 0.75,
      depth: 4.8,
    }, scene);
    planter.position.set(px, 0.38, 5.0);
    planter.material = mats.graniteDark;
    planter.parent = root;
    shadows?.addShadowCaster(planter);

    // Cây cắt tỉa khối hình học hiện đại
    const treeTrunk = MeshBuilder.CreateCylinder(`th-tree-trunk-${pidx}`, {
      diameter: 0.28,
      height: 2.2,
      tessellation: 12,
    }, scene);
    treeTrunk.position.set(px, 1.6, 5.0);
    treeTrunk.material = mats.graniteDark;
    treeTrunk.parent = root;

    const foliageBall = MeshBuilder.CreateSphere(`th-tree-foliage-${pidx}`, { diameter: 2.8, segments: 12 }, scene);
    foliageBall.position.set(px, 3.4, 5.0);
    foliageBall.material = mats.plantGreen;
    foliageBall.parent = root;
    shadows?.addShadowCaster(foliageBall);
  });

  // Hai cột cờ đô thị mạ chrome (Civic Flagpoles)
  [-9.5, 9.5].forEach((fx, fidx) => {
    const pole = MeshBuilder.CreateCylinder(`th-flagpole-${fidx}`, { diameter: 0.1, height: 8.5, tessellation: 10 }, scene);
    pole.position.set(fx, 4.4, 8.8);
    pole.material = mats.chromeTrim;
    pole.parent = root;

    const flag = MeshBuilder.CreateBox(`th-flag-banner-${fidx}`, { width: 1.8, height: 1.1, depth: 0.04 }, scene);
    flag.position.set(fx + 0.9, 7.8, 8.8);
    flag.material = mats.neonCyan;
    flag.parent = root;
  });

  return {
    root,
    update(time) {
      clockHandsList.forEach(({ hourHand, minHand }) => {
        if (minHand) minHand.rotation.z = -(time * 0.0006);
        if (hourHand) hourHand.rotation.z = -(time * 0.0006 / 12);
      });
    },
  };
}
