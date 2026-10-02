import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3, Matrix, Quaternion } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';
import { PointLight } from '@babylonjs/core/Lights/pointLight.js';

/**
 * Creates dynamic 4-phase day/dusk/night atmosphere with smooth continuous lerp:
 * - Smooth lerping directional & ambient lighting, clearColor
 * - 3D Stylized Puffy Clouds floating smoothly across the sky
 * - Glowing Moon with crescent aura
 * - Twinkling Starfield Dome on night sky
 * - Cozy Amber Night Lights at village & plaza
 * - Giai đoạn 5 Cinematic Polish:
 *   1. Golden Sun Dust Motes (Hạt bụi nắng ban ngày lơ lửng bồng bềnh)
 *   2. Drifting Spring Flower Petals (Cánh hoa rơi bồng bềnh lượn theo gió)
 *   3. Multi-zone Summer Fireflies (Đom đóm dạ quang bay lập lòe ban đêm)
 * - Tối ưu hóa hiệu năng 60 FPS (Shared textures, low draw call, zero garbage collection)
 */
export function createAtmosphere(scene, ambientLight, sunLight, shadows = null, cinematic = null) {
  // === 1. MẶT TRĂNG DẠ QUANG & VẦNG HÀO QUANG (3D GLOWING MOON) ===
  const moonRoot = new TransformNode('moon-root', scene);
  moonRoot.position.set(120, 68, -140);

  const moonSphere = MeshBuilder.CreateSphere('moon-sphere', { diameter: 14, segments: 16 }, scene);
  moonSphere.parent = moonRoot;
  const moonMat = new StandardMaterial('moon-mat', scene);
  moonMat.diffuseColor = Color3.FromHexString('#fffbe8');
  moonMat.emissiveColor = Color3.FromHexString('#fffae0');
  moonMat.disableLighting = true;
  moonSphere.material = moonMat;

  const moonGlow = MeshBuilder.CreateDisc('moon-glow', { radius: 11, tessellation: 24 }, scene);
  moonGlow.parent = moonRoot;
  moonGlow.billboardMode = 7; // BILLBOARDMODE_ALL
  const moonGlowMat = new StandardMaterial('moon-glow-mat', scene);
  moonGlowMat.diffuseColor = Color3.FromHexString('#ffeaa7');
  moonGlowMat.emissiveColor = Color3.FromHexString('#f9ca24');
  moonGlowMat.alpha = 0.35;
  moonGlowMat.disableLighting = true;
  moonGlow.material = moonGlowMat;

  // === 1.1 VÒM SAO TRỜI ĐÊM LẤP LÁNH (TWINKLING STARFIELD DOME) ===
  const starsRoot = new TransformNode('stars-root', scene);
  const masterStar = MeshBuilder.CreateSphere('master-star', { diameter: 0.85, segments: 4 }, scene);
  masterStar.parent = starsRoot;
  const starMat = new StandardMaterial('star-mat', scene);
  starMat.diffuseColor = Color3.FromHexString('#ffffff');
  starMat.emissiveColor = Color3.FromHexString('#fef08a');
  starMat.disableLighting = true;
  starMat.alpha = 0;
  masterStar.material = starMat;

  const starMatrices = [];
  const sPos = new Vector3();
  const sMat = Matrix.Identity();
  for (let i = 0; i < 180; i++) {
    const theta = (i * 0.42) % (Math.PI * 2);
    const phi = 0.2 + ((i * 1.37) % 1) * 0.95; // Nửa bán cầu trên
    const rad = 210 + (i % 25);
    const sx = Math.sin(phi) * Math.cos(theta) * rad;
    const sy = Math.cos(phi) * rad;
    const sz = Math.sin(phi) * Math.sin(theta) * rad;
    const sScale = 0.65 + ((i * 7) % 10) / 10 * 0.8;
    sPos.set(sx, sy, sz);
    Matrix.ComposeToRef(new Vector3(sScale, sScale, sScale), Quaternion.Identity(), sPos, sMat);
    starMatrices.push(...sMat.asArray());
  }
  masterStar.thinInstanceSetBuffer('matrix', new Float32Array(starMatrices), 16, true);

  // === 1.2 ĐÈN LỒNG & ÁNH LỬA ĐÊM LÀNG QUÊ ẤM ÁP (COZY NIGHT POINT LIGHTS) ===
  const villageNightLight = new PointLight('village-night-light', new Vector3(-112, 5.0, 35), scene);
  villageNightLight.diffuse = Color3.FromHexString('#f59e0b');
  villageNightLight.intensity = 0;
  villageNightLight.range = 85;

  const plazaNightLight = new PointLight('plaza-night-light', new Vector3(0, 5.0, -135), scene);
  plazaNightLight.diffuse = Color3.FromHexString('#fbbf24');
  plazaNightLight.intensity = 0;
  plazaNightLight.range = 95;

  // === 2. MÂY 3D BỒNG BỀNH LỮNG LỜ TRÔI (STYLED PUFFY CLOUDS) ===
  const cloudsRoot = new TransformNode('clouds-root', scene);
  const cloudMat = new StandardMaterial('stylized-cloud-mat', scene);
  cloudMat.diffuseColor = Color3.White();
  cloudMat.emissiveColor = new Color3(0.9, 0.94, 1.0);
  cloudMat.alpha = 0.92;

  const clouds = [];
  function createPuffyCloud(name, x, y, z, scale) {
    const cloud = new TransformNode(name, scene);
    cloud.position.set(x, y, z);
    cloud.parent = cloudsRoot;

    const parts = [
      { dx: 0, dy: 0, dz: 0, d: 8 },
      { dx: -4.5, dy: -1.2, dz: 0, d: 6.2 },
      { dx: 4.8, dy: -0.8, dz: 0, d: 6.5 },
      { dx: -2.0, dy: 2.2, dz: 0, d: 5.5 },
      { dx: 2.2, dy: 1.8, dz: 0, d: 5.8 },
    ];

    parts.forEach((p, idx) => {
      const s = MeshBuilder.CreateSphere(`${name}-part-${idx}`, { diameter: p.d, segments: 8 }, scene);
      s.position.set(p.dx * scale, p.dy * scale, p.dz * scale);
      s.scaling.y = 0.55;
      s.material = cloudMat;
      s.parent = cloud;
    });

    clouds.push({ node: cloud, speed: 1.2 + Math.random() * 0.8, initialX: x });
  }

  createPuffyCloud('cloud-1', -160, 52, 60, 1.2);
  createPuffyCloud('cloud-2', -60, 58, -40, 1.4);
  createPuffyCloud('cloud-3', 40, 50, 120, 1.1);
  createPuffyCloud('cloud-4', 120, 56, -90, 1.3);
  createPuffyCloud('cloud-5', -220, 54, -130, 1.0);

  // === 3. SHARED PARTICLE TEXTURES (TỐI ƯU HÓA HIỆU NĂNG 60 FPS) ===
  // Texture 1: Hạt tròn hào quang mềm (Soft Radial Glow Texture)
  const glowTex = new DynamicTexture('shared-glow-particle-tex', { width: 32, height: 32 }, scene, true);
  const gctx = glowTex.getContext();
  gctx.clearRect(0, 0, 32, 32);
  const ggrad = gctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  ggrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  ggrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.85)');
  ggrad.addColorStop(0.7, 'rgba(250, 204, 21, 0.3)');
  ggrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
  gctx.fillStyle = ggrad;
  gctx.beginPath();
  gctx.arc(16, 16, 16, 0, Math.PI * 2);
  gctx.fill();
  glowTex.update();

  // Texture 2: Cánh hoa mềm mại hình giọt nước / elip (Soft Petal Texture)
  const petalTex = new DynamicTexture('shared-petal-particle-tex', { width: 32, height: 32 }, scene, true);
  const pctx = petalTex.getContext();
  pctx.clearRect(0, 0, 32, 32);
  pctx.fillStyle = '#f472b6';
  pctx.beginPath();
  pctx.ellipse(16, 16, 12, 6, Math.PI / 4, 0, Math.PI * 2);
  pctx.fill();
  pctx.fillStyle = '#fbcfe8';
  pctx.beginPath();
  pctx.ellipse(15, 15, 8, 4, Math.PI / 4, 0, Math.PI * 2);
  pctx.fill();
  petalTex.update();

  // === 4. HỆ THỐNG HẠT BỤI NẮNG BAN NGÀY (GOLDEN SUN DUST MOTES) ===
  const sunDust = new ParticleSystem('cinematic-sun-dust', 36, scene);
  sunDust.particleTexture = glowTex;
  sunDust.emitter = new Vector3(-20, 2.5, 0);
  sunDust.minEmitBox = new Vector3(-65, 0, -65);
  sunDust.maxEmitBox = new Vector3(65, 5.5, 65);

  sunDust.color1 = new Color3(1.0, 0.95, 0.65).toColor4(0.65);
  sunDust.color2 = new Color3(1.0, 0.85, 0.55).toColor4(0.45);
  sunDust.colorDead = new Color3(1.0, 0.85, 0.55).toColor4(0.0);

  sunDust.minSize = 0.12;
  sunDust.maxSize = 0.28;
  sunDust.minLifeTime = 3.5;
  sunDust.maxLifeTime = 6.0;
  sunDust.direction1 = new Vector3(-0.15, 0.1, -0.15);
  sunDust.direction2 = new Vector3(0.15, 0.25, 0.15);
  sunDust.minEmitPower = 0.08;
  sunDust.maxEmitPower = 0.25;
  sunDust.updateSpeed = 0.008;
  sunDust.emitRate = 24;
  sunDust.start();

  // === 5. HỆ THỐNG CÁNH HOA RƠI BỒNG BỀNH THEO GIÓ (DRIFTING FLOWER PETALS) ===
  const fallingPetals = new ParticleSystem('cinematic-drifting-petals', 28, scene);
  fallingPetals.particleTexture = petalTex;
  fallingPetals.emitter = new Vector3(-20, 7.5, 10);
  fallingPetals.minEmitBox = new Vector3(-60, 0, -60);
  fallingPetals.maxEmitBox = new Vector3(60, 2.0, 60);

  fallingPetals.color1 = new Color3(1.0, 0.8, 0.9).toColor4(0.85);
  fallingPetals.color2 = new Color3(0.96, 0.55, 0.75).toColor4(0.75);
  fallingPetals.colorDead = new Color3(0.96, 0.55, 0.75).toColor4(0.0);

  fallingPetals.minSize = 0.18;
  fallingPetals.maxSize = 0.36;
  fallingPetals.minLifeTime = 4.0;
  fallingPetals.maxLifeTime = 7.5;
  // Cánh hoa chao đảo bay nhẹ xuôi theo chiều gió Đông Nam
  fallingPetals.direction1 = new Vector3(0.4, -0.5, 0.2);
  fallingPetals.direction2 = new Vector3(1.1, -0.8, 0.6);
  fallingPetals.minAngularSpeed = -1.2;
  fallingPetals.maxAngularSpeed = 1.2;
  fallingPetals.minEmitPower = 0.4;
  fallingPetals.maxEmitPower = 0.9;
  fallingPetals.updateSpeed = 0.012;
  fallingPetals.emitRate = 16;
  fallingPetals.start();

  // === 6. HỆ THỐNG ĐOM ĐÓM DẠ QUANG BAN ĐÊM (MULTI-ZONE FIREFLIES) ===
  // Cụm 1: Thung lũng nông trại (-112, 1.2, 35)
  const firefliesFarm = new ParticleSystem('fireflies-farm', 32, scene);
  firefliesFarm.particleTexture = glowTex;
  firefliesFarm.emitter = new Vector3(-112, 1.2, 35);
  firefliesFarm.minEmitBox = new Vector3(-28, 0, -28);
  firefliesFarm.maxEmitBox = new Vector3(28, 3.5, 28);
  firefliesFarm.color1 = new Color3(0.85, 0.98, 0.3).toColor4(0.9);
  firefliesFarm.color2 = new Color3(0.4, 0.95, 0.4).toColor4(0.7);
  firefliesFarm.colorDead = new Color3(0.4, 0.95, 0.4).toColor4(0.0);
  firefliesFarm.minSize = 0.18;
  firefliesFarm.maxSize = 0.42;
  firefliesFarm.minLifeTime = 2.5;
  firefliesFarm.maxLifeTime = 5.0;
  firefliesFarm.direction1 = new Vector3(-0.25, 0.3, -0.25);
  firefliesFarm.direction2 = new Vector3(0.25, 0.5, 0.25);
  firefliesFarm.minEmitPower = 0.1;
  firefliesFarm.maxEmitPower = 0.4;
  firefliesFarm.updateSpeed = 0.012;
  firefliesFarm.start();

  // Cụm 2: Vòng xuyến hoa trung tâm & Đại lộ (0, 1.2, 3)
  const firefliesPlaza = new ParticleSystem('fireflies-plaza', 24, scene);
  firefliesPlaza.particleTexture = glowTex;
  firefliesPlaza.emitter = new Vector3(0, 1.2, 3);
  firefliesPlaza.minEmitBox = new Vector3(-14, 0, -14);
  firefliesPlaza.maxEmitBox = new Vector3(14, 3.2, 14);
  firefliesPlaza.color1 = new Color3(0.95, 0.95, 0.35).toColor4(0.9);
  firefliesPlaza.color2 = new Color3(0.5, 0.95, 0.5).toColor4(0.7);
  firefliesPlaza.colorDead = new Color3(0.5, 0.95, 0.5).toColor4(0.0);
  firefliesPlaza.minSize = 0.16;
  firefliesPlaza.maxSize = 0.38;
  firefliesPlaza.minLifeTime = 2.2;
  firefliesPlaza.maxLifeTime = 4.5;
  firefliesPlaza.direction1 = new Vector3(-0.2, 0.25, -0.2);
  firefliesPlaza.direction2 = new Vector3(0.2, 0.45, 0.2);
  firefliesPlaza.minEmitPower = 0.1;
  firefliesPlaza.maxEmitPower = 0.35;
  firefliesPlaza.updateSpeed = 0.012;
  firefliesPlaza.start();

  let currentPhase = 'day';

  // 4 Keyframes cho chu kỳ ngày/đêm điện ảnh chuẩn Zelda: Breath of the Wild & Studio Ghibli
  // - Ban đêm: Bầu trời Midnight Indigo xanh chàm thẳm, vòm sao lấp lánh, ánh trăng ngọc trai,
  //            đèn lồng làng quê vàng cam ấm áp, bóng râm mềm mại 0.22 không hề đen kịt
  // === 0. VÒM TRỜI PASTEL HOẠT HÌNH PLAY TOGETHER (3D CANDY SKY DOME) ===
  const skyDome = MeshBuilder.CreateSphere('play-together-skydome', {
    diameter: 720,
    segments: 16,
    sideOrientation: Mesh.BACKSIDE,
  }, scene);
  skyDome.position.set(0, 0, 0);

  const skyMat = new StandardMaterial('play-together-skydome-mat', scene);
  skyMat.disableLighting = true;
  skyMat.backFaceCulling = false;

  const skyTex = new DynamicTexture('candy-skydome-tex', { width: 512, height: 512 }, scene, true);
  const sctx = skyTex.getContext();
  // Linear vertical gradient: Top là xanh thiên thanh kẹo ngọt, chân trời là vàng kem bơ ấm áp
  const skyGrad = sctx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0, '#38bdf8');   // Xanh thiên thanh Play Together
  skyGrad.addColorStop(0.55, '#7dd3fc'); // Xanh baby blue trong vắt
  skyGrad.addColorStop(0.85, '#bae6fd'); // Xanh phấn nhạt
  skyGrad.addColorStop(1.0, '#fffbeb');  // Kem bơ ấm chân trời
  sctx.fillStyle = skyGrad;
  sctx.fillRect(0, 0, 512, 512);
  skyTex.update();

  skyMat.emissiveTexture = skyTex;
  skyDome.material = skyMat;

  // 4 Keyframes cho chu kỳ ngày/đêm điện ảnh chuẩn Play Together (High-Key Candy Pastel)
  // Triệt tiêu 100% màu tím bầm/xỉn tối, thế giới luôn rực rỡ vui tươi tràn ngập sức sống
  const PHASES = [
    {
      time: 0,
      name: 'dawn',
      clearColor: new Color4(0.82, 0.90, 0.98, 1),
      fogColor: new Color3(0.82, 0.90, 0.98),
      ambIntensity: 0.88,
      ambColor: Color3.FromHexString('#fbcfe8'), // Hồng phấn ban mai kẹo ngọt
      ambGround: Color3.FromHexString('#86efac'), // Cỏ non mint pastel
      sunIntensity: 1.05,
      sunColor: Color3.FromHexString('#fef08a'), // Vàng chanh tươi sáng
      sunDir: new Vector3(-0.65, -0.45, -0.32),
      starAlpha: 0.0,
      moonAlpha: 0.05,
      sunDustRate: 16,
      petalRate: 14,
      fireflyRate: 0,
      shadowDarkness: 0.20,
      lampIntensity: 0.15,
    },
    {
      time: 60,
      name: 'day',
      clearColor: new Color4(0.48, 0.80, 0.98, 1), // Bầu trời xanh thiên thanh trong vắt Play Together
      fogColor: new Color3(0.58, 0.84, 0.98),
      ambIntensity: 0.96, // Nâng sáng toàn diện, không có bất kỳ góc tối nào
      ambColor: Color3.FromHexString('#bae6fd'), // Xanh ngọc vòm trời trong veo
      ambGround: Color3.FromHexString('#a7f3d0'), // Phản xạ cỏ mint tươi sáng hắt lên
      sunIntensity: 1.18, // Ánh nắng vàng mật ong ấm áp rạng rỡ
      sunColor: Color3.FromHexString('#fffbeb'),
      sunDir: new Vector3(-0.45, -0.85, -0.32),
      starAlpha: 0,
      moonAlpha: 0,
      sunDustRate: 20,
      petalRate: 16,
      fireflyRate: 0,
      shadowDarkness: 0.22, // Bóng râm mỏng tang, pastel dịu êm
      lampIntensity: 0.0,
    },
    {
      time: 120,
      name: 'dusk',
      clearColor: new Color4(0.96, 0.72, 0.78, 1), // Hồng đào pastel hoàng hôn mộng mơ hoạt hình
      fogColor: new Color3(0.96, 0.72, 0.78),
      ambIntensity: 0.85,
      ambColor: Color3.FromHexString('#fbcfe8'), // Hồng dâu phấn ngọt ngào (không dùng tím bầm)
      ambGround: Color3.FromHexString('#fed7aa'), // Nền đất màu caramel ấm cúng
      sunIntensity: 1.02,
      sunColor: Color3.FromHexString('#fde047'), // Vàng cam ấm áp
      sunDir: new Vector3(-0.82, -0.28, -0.2),
      starAlpha: 0.25,
      moonAlpha: 0.45,
      sunDustRate: 12,
      petalRate: 10,
      fireflyRate: 18,
      shadowDarkness: 0.18,
      lampIntensity: 0.95,
    },
    {
      time: 180,
      name: 'night',
      clearColor: new Color4(0.12, 0.16, 0.28, 1), // Xanh chàm dạ quang lãng mạn
      fogColor: new Color3(0.12, 0.16, 0.28),
      ambIntensity: 0.82, // Đêm sáng rõ rực rỡ đèn hoa, không bị tối mò mẫm
      ambColor: Color3.FromHexString('#38bdf8'), // Vòm trời xanh ngọc bích hắt sáng lung linh
      ambGround: Color3.FromHexString('#10b981'), // Cỏ ngọc bích mát mắt
      sunIntensity: 0.75, // Ánh trăng ngọc trai rõ khối 3D nhân vật
      sunColor: Color3.FromHexString('#e0e7ff'),
      sunDir: new Vector3(-0.62, -0.45, 0.65),
      starAlpha: 1.0, // Ngàn sao lấp lánh rực rỡ
      moonAlpha: 1.0,
      sunDustRate: 0,
      petalRate: 4,
      fireflyRate: 36,
      shadowDarkness: 0.16, // Bóng trăng mờ êm
      lampIntensity: 1.55, // Đèn lồng & phố thị bừng sáng lung linh
    },
  ];

  return {
    setTime(clockSeconds) {
      const cycleTime = clockSeconds % 240;

      let k1 = PHASES[0];
      let k2 = PHASES[1];
      let factor = 0;

      if (cycleTime < 60) {
        k1 = PHASES[0];
        k2 = PHASES[1];
        factor = cycleTime / 60;
        currentPhase = 'dawn';
      } else if (cycleTime < 120) {
        k1 = PHASES[1];
        k2 = PHASES[2];
        factor = (cycleTime - 60) / 60;
        currentPhase = 'day';
      } else if (cycleTime < 180) {
        k1 = PHASES[2];
        k2 = PHASES[3];
        factor = (cycleTime - 120) / 60;
        currentPhase = 'dusk';
      } else {
        k1 = PHASES[3];
        k2 = PHASES[0];
        factor = (cycleTime - 180) / 60;
        currentPhase = 'night';
      }

      // Smooth Hermite smoothstep factor
      const s = factor * factor * (3 - 2 * factor);

      // Lerp ClearColor (Clean Anime Sky) & Fog
      scene.clearColor = Color4.Lerp(k1.clearColor, k2.clearColor, s);
      if (scene.fogColor) {
        scene.fogColor = Color3.Lerp(k1.fogColor, k2.fogColor, s);
      }

      // Lerp Lights
      ambientLight.intensity = k1.ambIntensity + (k2.ambIntensity - k1.ambIntensity) * s;
      ambientLight.diffuse = Color3.Lerp(k1.ambColor, k2.ambColor, s);
      if (ambientLight.groundColor) {
        ambientLight.groundColor = Color3.Lerp(k1.ambGround, k2.ambGround, s);
      }

      sunLight.intensity = k1.sunIntensity + (k2.sunIntensity - k1.sunIntensity) * s;
      sunLight.diffuse = Color3.Lerp(k1.sunColor, k2.sunColor, s);
      sunLight.direction = Vector3.Lerp(k1.sunDir, k2.sunDir, s);

      // Cập nhật độ mềm của bóng râm (Ban đêm bóng trăng mờ êm 0.22, không đen kịt)
      if (shadows) {
        shadows.darkness = k1.shadowDarkness + (k2.shadowDarkness - k1.shadowDarkness) * s;
      }

      // Cập nhật đèn lồng & ánh lửa đêm ấm áp
      const curLamp = k1.lampIntensity + (k2.lampIntensity - k1.lampIntensity) * s;
      villageNightLight.intensity = curLamp;
      plazaNightLight.intensity = curLamp;

      // Celestial bodies & Twinkling Starfield
      const moonVisibility = k1.moonAlpha + (k2.moonAlpha - k1.moonAlpha) * s;
      moonSphere.visibility = moonVisibility;
      moonGlow.visibility = moonVisibility;

      const starVisibility = k1.starAlpha + (k2.starAlpha - k1.starAlpha) * s;
      starMat.alpha = starVisibility;

      // Cập nhật preset điện ảnh
      cinematic?.setCinematicPreset(currentPhase);

      // Cloud tinting with time of day
      if (currentPhase === 'dusk') {
        cloudMat.diffuseColor = Color3.Lerp(Color3.White(), Color3.FromHexString('#fda4af'), s);
      } else if (currentPhase === 'night') {
        cloudMat.diffuseColor = Color3.Lerp(Color3.FromHexString('#fda4af'), Color3.FromHexString('#c7d2fe'), s);
      } else {
        cloudMat.diffuseColor = Color3.White();
      }

      // Hạt bụi nắng (Sun Dust) & Cánh hoa (Falling Petals)
      const curDustRate = Math.round(k1.sunDustRate + (k2.sunDustRate - k1.sunDustRate) * s);
      sunDust.emitRate = curDustRate;

      const curPetalRate = Math.round(k1.petalRate + (k2.petalRate - k1.petalRate) * s);
      fallingPetals.emitRate = curPetalRate;

      // Đom đóm ban đêm (Fireflies)
      const curFireflyRate = Math.round(k1.fireflyRate + (k2.fireflyRate - k1.fireflyRate) * s);
      firefliesFarm.emitRate = curFireflyRate;
      firefliesPlaza.emitRate = Math.round(curFireflyRate * 0.75);
    },

    update(dt = 0.016) {
      // Drift clouds slowly across the world
      clouds.forEach(c => {
        c.node.position.x += dt * c.speed;
        if (c.node.position.x > 260) {
          c.node.position.x = -260;
        }
      });
    },

    getPhase() {
      return currentPhase;
    },

    isNight() {
      return currentPhase === 'night';
    },

    dispose() {
      sunDust.dispose();
      fallingPetals.dispose();
      firefliesFarm.dispose();
      firefliesPlaza.dispose();
      glowTex.dispose();
      petalTex.dispose();
      cloudsRoot.dispose();
      moonRoot.dispose();
      starsRoot.dispose();
      villageNightLight.dispose();
      plazaNightLight.dispose();
    },
  };
}
