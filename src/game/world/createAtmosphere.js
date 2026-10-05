import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3, Matrix, Quaternion } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';
import { PointLight } from '@babylonjs/core/Lights/pointLight.js';
import { WORLD_PALETTE } from './worldDesignSystem.js';
import { FresnelParameters } from '@babylonjs/core/Materials/fresnelParameters.js';
import { createProceduralSkyDome } from './nature/ProceduralSkyDome.js';
import { createMilkyWaySystem } from './nature/MilkyWaySystem.js';

/**
 * createAtmosphere.js - GHIBLI CHILL & COZY ATMOSPHERIC HORIZON SYSTEM
 * 
 * Nâng cấp toàn diện bầu khí quyển & vùng chân trời đạt cảm giác thư thái, mơ màng:
 * 1. Vòm trời màu nước 5 tầng (5-Stop Procedural SkyDome Shader - 6400m, 48 Segments).
 * 2. Đĩa Mặt Trời Anime mềm mại & Quầng tán xạ Mie Scattering động tỏa nắng.
 * 3. Vầng trăng ngọc trai & Quầng hào quang dịu mắt (Glowing Pearl Moon & Soft Aura).
 * 4. Dải mây lụa tầng cao (Cirrus Ribbon Bands) trôi chậm rãi bao la + Cụm mây tích Ghibli khổng lồ (Cumulus Giants).
 * 5. Đàn chim viễn cảnh bay lượn lững lờ ngang đường chân trời (Flock of Distant Horizon Birds).
 * 6. Rèm cực quang phương Bắc (Northern Aurora Borealis) huyền ảo & Vệt sao băng rơi chậm ban đêm.
 * 7. Bụi nắng vàng, cánh hoa đào bay bổng, đom đóm dạ quang đa vùng và đèn đêm ấm cúng.
 * 8. Hiệu năng đỉnh cao 60 FPS (Shader GPU tính toán, zero canvas upload, zero garbage collection).
 */
const _tmpNormDir = new Vector3();
const _tmpSunSkyDir = new Vector3();

export function createAtmosphere(scene, ambientLight, sunLight, shadows = null, cinematic = null) {
  const atmosphereRoot = new TransformNode('world-atmosphere-root', scene);

  // =========================================================================
  // 1. VÒM TRỜI MÀU NƯỚC 5 TẦNG PROCEDURAL GPU SHADER (6400m, 48 SEGMENTS)
  // =========================================================================
  const proceduralSky = createProceduralSkyDome(scene, atmosphereRoot);
  const skyDome = proceduralSky.mesh;

  // =========================================================================
  // 2. ĐĨA MẶT TRỜI ANIME & VẦNG HÀO QUANG (STYLIZED SUN DISC & CORONA)
  // =========================================================================
  const sunRoot = new TransformNode('anime-sun-root', scene);
  sunRoot.parent = atmosphereRoot;

  // Texture vầng mặt trời gradient tròn mềm mịn
  const sunTex = new DynamicTexture('anime-sun-tex', { width: 128, height: 128 }, scene, true);
  const sunCtx = sunTex.getContext();
  const sunGrad = sunCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
  sunGrad.addColorStop(0.0, 'rgba(255, 255, 240, 1.0)');
  sunGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.95)');
  sunGrad.addColorStop(0.70, 'rgba(251, 146, 60, 0.45)');
  sunGrad.addColorStop(1.0, 'rgba(251, 146, 60, 0.0)');
  sunCtx.fillStyle = sunGrad;
  sunCtx.fillRect(0, 0, 128, 128);
  sunTex.update();

  const sunMat = new StandardMaterial('anime-sun-mat', scene);
  sunMat.emissiveTexture = sunTex;
  sunMat.opacityTexture = sunTex;
  sunMat.emissiveColor = Color3.White();
  sunMat.disableLighting = true;
  sunMat.disableDepthWrite = true;
  sunMat.fogEnabled = false;

  const sunDisc = MeshBuilder.CreateDisc('anime-sun-disc', { radius: 11, tessellation: 32 }, scene);
  sunDisc.parent = sunRoot;
  sunDisc.billboardMode = Mesh.BILLBOARDMODE_ALL;
  sunDisc.material = sunMat;
  sunDisc.alwaysSelectAsActiveMesh = true;
  sunDisc.ignoreCameraMaxZ = true;

  const sunCorona = MeshBuilder.CreateDisc('anime-sun-corona', { radius: 24, tessellation: 32 }, scene);
  sunCorona.parent = sunRoot;
  sunCorona.billboardMode = Mesh.BILLBOARDMODE_ALL;
  const coronaMat = new StandardMaterial('anime-sun-corona-mat', scene);
  coronaMat.emissiveTexture = sunTex;
  coronaMat.opacityTexture = sunTex;
  coronaMat.emissiveColor = new Color3(1.0, 0.85, 0.5);
  coronaMat.alpha = 0.45;
  coronaMat.disableLighting = true;
  coronaMat.disableDepthWrite = true;
  coronaMat.fogEnabled = false;
  sunCorona.material = coronaMat;
  sunCorona.alwaysSelectAsActiveMesh = true;
  sunCorona.ignoreCameraMaxZ = true;

  // =========================================================================
  // 3. MẶT TRĂNG DẠ QUANG NGỌC TRAI & VẦNG HÀO QUANG (3D GLOWING MOON)
  // =========================================================================
  const moonRoot = new TransformNode('moon-root', scene);
  moonRoot.parent = atmosphereRoot;

  const moonSphere = MeshBuilder.CreateSphere('moon-sphere', { diameter: 12, segments: 16 }, scene);
  moonSphere.parent = moonRoot;
  const moonMat = new StandardMaterial('moon-mat', scene);
  moonMat.diffuseColor = Color3.FromHexString('#fffbe8');
  moonMat.emissiveColor = Color3.FromHexString('#fffae0');
  moonMat.disableLighting = true;
  moonMat.disableDepthWrite = true;
  moonMat.fogEnabled = false;
  moonSphere.material = moonMat;
  moonSphere.alwaysSelectAsActiveMesh = true;
  moonSphere.ignoreCameraMaxZ = true;

  const moonGlow = MeshBuilder.CreateDisc('moon-glow', { radius: 15, tessellation: 24 }, scene);
  moonGlow.parent = moonRoot;
  moonGlow.billboardMode = Mesh.BILLBOARDMODE_ALL;
  const moonGlowMat = new StandardMaterial('moon-glow-mat', scene);
  moonGlowMat.emissiveTexture = sunTex;
  moonGlowMat.opacityTexture = sunTex;
  moonGlowMat.emissiveColor = Color3.FromHexString('#fef08a');
  moonGlowMat.alpha = 0.55;
  moonGlowMat.disableLighting = true;
  moonGlowMat.disableDepthWrite = true;
  moonGlowMat.fogEnabled = false;
  moonGlow.material = moonGlowMat;
  moonGlow.alwaysSelectAsActiveMesh = true;
  moonGlow.ignoreCameraMaxZ = true;

  // Hào quang sương mờ dịu mắt tầng rộng của vầng trăng ngọc trai (Ghibli Moon Corona)
  const moonGlowOuter = MeshBuilder.CreateDisc('moon-glow-outer', { radius: 25, tessellation: 24 }, scene);
  moonGlowOuter.parent = moonRoot;
  moonGlowOuter.billboardMode = Mesh.BILLBOARDMODE_ALL;
  const moonGlowOuterMat = new StandardMaterial('moon-glow-outer-mat', scene);
  moonGlowOuterMat.emissiveTexture = sunTex;
  moonGlowOuterMat.opacityTexture = sunTex;
  moonGlowOuterMat.emissiveColor = Color3.FromHexString('#c7d2fe');
  moonGlowOuterMat.alpha = 0.32;
  moonGlowOuterMat.disableLighting = true;
  moonGlowOuterMat.disableDepthWrite = true;
  moonGlowOuterMat.fogEnabled = false;
  moonGlowOuter.material = moonGlowOuterMat;
  moonGlowOuter.alwaysSelectAsActiveMesh = true;
  moonGlowOuter.ignoreCameraMaxZ = true;

  // =========================================================================
  // 4. DẢI NGÂN HÀ, 720+ SAO NHẤP NHÁY ĐA TẦN & 16 CHÒM SAO HÀO QUANG (MILKY WAY)
  // =========================================================================
  const milkyWaySystem = createMilkyWaySystem(scene, atmosphereRoot);



  // =========================================================================
  // 7. MÂY LỤA TẦNG CAO (CIRRUS RIBBONS) & CỤM MÂY TÍCH KHỔNG LỒ (CUMULUS GIANTS)
  // =========================================================================
  const cirrusRoot = new TransformNode('cirrus-cloud-root', scene);
  cirrusRoot.parent = atmosphereRoot;

  const cirrusMat = new StandardMaterial('cirrus-cloud-mat', scene);
  cirrusMat.diffuseColor = Color3.White();
  cirrusMat.emissiveColor = new Color3(0.92, 0.95, 1.0);
  cirrusMat.alpha = 0.42;
  cirrusMat.disableLighting = true;
  cirrusMat.disableDepthWrite = true;
  cirrusMat.fogEnabled = false;

  const cirrusBands = [];
  const cirrusConfigs = [
    { x: -160, y: 195, z: -250, w: 220, h: 8, speed: 0.18 },
    { x: -50, y: 210, z: -260, w: 260, h: 10, speed: 0.15 },
    { x: 80, y: 202, z: -245, w: 230, h: 8, speed: 0.17 },
    { x: -180, y: 190, z: 140, w: 240, h: 9, speed: 0.19 },
    { x: 190, y: 205, z: 110, w: 250, h: 8, speed: 0.16 },
    { x: -40, y: 198, z: 260, w: 270, h: 10, speed: 0.20 },
    { x: 110, y: 206, z: 265, w: 230, h: 9, speed: 0.18 },
  ];

  cirrusConfigs.forEach((cfg, idx) => {
    const band = MeshBuilder.CreateBox(`cirrus-band-${idx}`, { width: cfg.w, height: cfg.h, depth: 8 }, scene);
    band.position.set(cfg.x, cfg.y, cfg.z);
    band.material = cirrusMat;
    band.parent = cirrusRoot;
    band.alwaysSelectAsActiveMesh = true;
    band.ignoreCameraMaxZ = true;
    band.freezeWorldMatrix();
    cirrusBands.push({ node: band, speed: cfg.speed, initialX: cfg.x });
  });

  // 3 Cụm mây tích Ghibli khổng lồ đón hoàng hôn (Cumulus Giants với Two-Tone shading & Rim Light)
  const cumulusRoot = new TransformNode('cumulus-giants-root', scene);
  cumulusRoot.parent = atmosphereRoot;

  // Fresnel viền sáng dịu mát phong cách Studio Ghibli (Tâm sáng rực rỡ, viền hào quang vàng ấm, KHÔNG BAO GIỜ BỊ ĐEN)
  const cloudRimFresnel = new FresnelParameters();
  cloudRimFresnel.bias = 0.55;
  cloudRimFresnel.power = 1.4;
  cloudRimFresnel.leftColor = Color3.FromHexString('#fffbeb');
  cloudRimFresnel.rightColor = Color3.White();

  // Đỉnh mây đón ánh sáng trực tiếp từ Mặt Trời
  const cumulusTopMat = new StandardMaterial('cumulus-top-mat', scene);
  cumulusTopMat.diffuseColor = Color3.White();
  cumulusTopMat.emissiveColor = Color3.White();
  cumulusTopMat.specularColor = Color3.Black();
  cumulusTopMat.emissiveFresnelParameters = cloudRimFresnel;
  cumulusTopMat.alpha = 0.96;
  cumulusTopMat.disableLighting = true;
  cumulusTopMat.disableDepthWrite = true;
  cumulusTopMat.fogEnabled = false;

  // Đáy mây chìm trong bóng râm khí quyển mộng mơ
  const cumulusBaseMat = new StandardMaterial('cumulus-base-mat', scene);
  cumulusBaseMat.diffuseColor = Color3.FromHexString('#f0f9ff');
  cumulusBaseMat.emissiveColor = Color3.FromHexString('#e0f2fe');
  cumulusBaseMat.specularColor = Color3.Black();
  cumulusBaseMat.emissiveFresnelParameters = cloudRimFresnel;
  cumulusBaseMat.alpha = 0.94;
  cumulusBaseMat.disableLighting = true;
  cumulusBaseMat.disableDepthWrite = true;
  cumulusBaseMat.fogEnabled = false;

  function createCumulusGiant(name, cx, cy, cz, scale = 1.0) {
    const gNode = new TransformNode(name, scene);
    gNode.position.set(cx, cy, cz);
    gNode.parent = cumulusRoot;

    const puffs = [
      { x: 0, y: 0, z: 0, d: 55, isTop: false },
      { x: -28, y: -8, z: 0, d: 42, isTop: false },
      { x: 28, y: -5, z: 0, d: 46, isTop: false },
      { x: -15, y: 15, z: 0, d: 38, isTop: true },
      { x: 15, y: 14, z: 0, d: 40, isTop: true },
      { x: 0, y: 24, z: 0, d: 34, isTop: true },
    ];
    puffs.forEach((p, idx) => {
      const s = MeshBuilder.CreateSphere(`${name}-puff-${idx}`, { diameter: p.d * scale, segments: 10 }, scene);
      s.position.set(p.x * scale, p.y * scale, p.z * scale);
      s.scaling.y = 0.62;
      s.material = p.isTop ? cumulusTopMat : cumulusBaseMat;
      s.parent = gNode;
      s.alwaysSelectAsActiveMesh = true;
      s.ignoreCameraMaxZ = true;
      s.freezeWorldMatrix();
    });
  }

  // Đưa các cụm mây tích khổng lồ ra đường chân trời xa và cao (y: 125-145m, r: 450-480m)
  createCumulusGiant('cumulus-east', 460, 125, -160, 1.6);
  createCumulusGiant('cumulus-west', -480, 135, 180, 1.8);
  createCumulusGiant('cumulus-north', 90, 145, -460, 2.0);

  // =========================================================================
  // 8B. VÀNH ĐAI SƯƠNG MÙ THUNG LŨNG BỒNG BỀNH (GHIBLI ETHEREAL VALLEY MIST)
  // Các dải sương mù mỏng manh lững lờ sát chân núi, hòa quyện không gian chill mơ màng
  // =========================================================================
  const valleyMistRoot = new TransformNode('valley-mist-root', scene);
  valleyMistRoot.parent = atmosphereRoot;

  const mistMat = new StandardMaterial('valley-mist-mat', scene);
  mistMat.diffuseColor = Color3.FromHexString('#e0f2fe');
  mistMat.emissiveColor = Color3.FromHexString('#dbeafe').scale(0.8);
  mistMat.alpha = 0.32;
  mistMat.disableLighting = true;
  mistMat.backFaceCulling = false;
  mistMat.fogEnabled = true;

  const mistBands = [
    { r: 840, y: 12, h: 22, steps: 36, speed: 0.015 },
    { r: 1080, y: 22, h: 32, steps: 42, speed: -0.012 },
    { r: 1360, y: 35, h: 42, steps: 48, speed: 0.018 },
  ];

  const mistMeshes = mistBands.map((mb, idx) => {
    const bottomPath = [];
    const topPath = [];
    const startA = 0.82 * Math.PI;
    const endA = 2.18 * Math.PI;
    for (let i = 0; i <= mb.steps; i++) {
      const a = startA + (i / mb.steps) * (endA - startA);
      const radMod = Math.sin(a * 4) * 45;
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      bottomPath.push(new Vector3(cosA * (mb.r + radMod), mb.y - mb.h * 0.5, sinA * (mb.r + radMod)));
      topPath.push(new Vector3(cosA * (mb.r + radMod), mb.y + mb.h * 0.5, sinA * (mb.r + radMod)));
    }
    const ribbon = MeshBuilder.CreateRibbon(`valley-mist-ribbon-${idx}`, {
      pathArray: [bottomPath, topPath],
      sideOrientation: Mesh.DOUBLESIDE,
    }, scene);
    ribbon.material = mistMat;
    ribbon.isPickable = false;
    ribbon.parent = valleyMistRoot;
    return { mesh: ribbon, speed: mb.speed };
  });



  // =========================================================================
  // 9. MÂY 3D CẬN TRUNG CẢNH BỒNG BỀNH (STYLED PUFFY CLOUDS)
  // =========================================================================
  const cloudsRoot = new TransformNode('clouds-root', scene);
  cloudsRoot.parent = atmosphereRoot;

  const cloudMat = new StandardMaterial('stylized-cloud-mat', scene);
  cloudMat.diffuseColor = Color3.White();
  cloudMat.emissiveColor = Color3.White();
  cloudMat.specularColor = Color3.Black();
  cloudMat.emissiveFresnelParameters = cloudRimFresnel;
  cloudMat.alpha = 0.96;
  cloudMat.disableLighting = true;
  cloudMat.disableDepthWrite = true;
  cloudMat.fogEnabled = false;

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
      const s = MeshBuilder.CreateSphere(`${name}-part-${idx}`, { diameter: p.d, segments: 10 }, scene);
      s.position.set(p.dx * scale, p.dy * scale, p.dz * scale);
      s.scaling.y = 0.55;
      s.material = cloudMat;
      s.parent = cloud;
      s.alwaysSelectAsActiveMesh = true;
      s.ignoreCameraMaxZ = true;
    });
    clouds.push({ node: cloud, speed: 1.2 + Math.random() * 0.8, initialX: x });
  }

  // Tọa độ mây 3D bồng bềnh ở tầng cao (y: 135m - 165m) thoáng đãng, trôi dạt nhẹ nhàng
  const cloudPositions = [
    { x: -620, y: 145, z: 180, s: 2.2 }, { x: -480, y: 138, z: 90, s: 2.0 }, { x: -350, y: 152, z: 220, s: 2.1 },
    { x: -220, y: 140, z: 140, s: 1.9 }, { x: -140, y: 148, z: -160, s: 2.2 }, { x: 120, y: 135, z: 150, s: 2.0 },
    { x: 220, y: 142, z: 80, s: 2.1 }, { x: 340, y: 138, z: 190, s: 2.3 }, { x: 480, y: 146, z: 90, s: 2.0 },
    { x: 620, y: 140, z: 210, s: 2.2 }, { x: 740, y: 144, z: 70, s: 2.1 },
    { x: -580, y: 155, z: -220, s: 2.2 }, { x: -420, y: 142, z: -150, s: 1.9 }, { x: -280, y: 146, z: -240, s: 2.1 },
    { x: -120, y: 138, z: -320, s: 2.3 }, { x: 0, y: 158, z: -440, s: 2.2 }, { x: 140, y: 144, z: -250, s: 2.0 },
    { x: 280, y: 150, z: -180, s: 2.2 }, { x: 440, y: 142, z: -260, s: 2.1 }, { x: 620, y: 148, z: -190, s: 2.3 },
    { x: -400, y: 144, z: 420, s: 2.1 }, { x: -250, y: 150, z: 480, s: 2.2 }, { x: -80, y: 138, z: 380, s: 1.9 },
    { x: 80, y: 146, z: 400, s: 2.1 }, { x: 250, y: 140, z: 460, s: 2.2 }, { x: 420, y: 154, z: 430, s: 2.1 },
    { x: 580, y: 144, z: 490, s: 2.0 }, { x: -180, y: 142, z: 280, s: 1.9 }
  ];
  cloudPositions.forEach((cp, idx) => {
    createPuffyCloud(`world-cloud-${idx}`, cp.x, cp.y, cp.z, cp.s);
  });

  // =========================================================================
  // 10. HẠT KHÍ QUYỂN (SUN DUST, PETALS, FIREFLIES) & ĐÈN ĐÊM LÀNG QUÊ
  // =========================================================================
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
  fallingPetals.direction1 = new Vector3(0.4, -0.5, 0.2);
  fallingPetals.direction2 = new Vector3(1.1, -0.8, 0.6);
  fallingPetals.minAngularSpeed = -1.2;
  fallingPetals.maxAngularSpeed = 1.2;
  fallingPetals.minEmitPower = 0.4;
  fallingPetals.maxEmitPower = 0.9;
  fallingPetals.updateSpeed = 0.012;
  fallingPetals.emitRate = 16;
  fallingPetals.start();

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

  // Đom đóm dạ quang bay lượn quanh đài phun nước trung tâm
  const firefliesFountain = new ParticleSystem('fireflies-fountain', 28, scene);
  firefliesFountain.particleTexture = glowTex;
  firefliesFountain.emitter = new Vector3(0, 1.5, 0);
  firefliesFountain.minEmitBox = new Vector3(-8, 0, -8);
  firefliesFountain.maxEmitBox = new Vector3(8, 3.5, 8);
  firefliesFountain.color1 = new Color3(0.75, 1.0, 0.4).toColor4(0.95);
  firefliesFountain.color2 = new Color3(0.35, 0.95, 0.65).toColor4(0.75);
  firefliesFountain.colorDead = new Color3(0.35, 0.95, 0.65).toColor4(0.0);
  firefliesFountain.minSize = 0.16;
  firefliesFountain.maxSize = 0.40;
  firefliesFountain.minLifeTime = 2.4;
  firefliesFountain.maxLifeTime = 5.0;
  firefliesFountain.direction1 = new Vector3(-0.25, 0.25, -0.25);
  firefliesFountain.direction2 = new Vector3(0.25, 0.5, 0.25);
  firefliesFountain.minEmitPower = 0.1;
  firefliesFountain.maxEmitPower = 0.35;
  firefliesFountain.updateSpeed = 0.012;
  firefliesFountain.start();

  const villageNightLight = new PointLight('village-night-light', new Vector3(-112, 5.0, 35), scene);
  villageNightLight.diffuse = Color3.FromHexString('#f59e0b');
  villageNightLight.intensity = 0;
  villageNightLight.range = 85;

  // Đài phun nước trung tâm Quảng trường: x = 0, z = 0
  const plazaNightLight = new PointLight('plaza-night-light', new Vector3(0, 4.5, 0), scene);
  plazaNightLight.diffuse = Color3.FromHexString('#fbbf24');
  plazaNightLight.intensity = 0;
  plazaNightLight.range = 55;

  // Khu thương mại & vui chơi phía Bắc: x = 0, z = -135
  const northMallNightLight = new PointLight('north-mall-night-light', new Vector3(0, 5.0, -135), scene);
  northMallNightLight.diffuse = Color3.FromHexString('#f59e0b');
  northMallNightLight.intensity = 0;
  northMallNightLight.range = 65;

  // Cửa ngõ trung chuyển phía Nam: x = 0, z = 54
  const southGatewayNightLight = new PointLight('south-gateway-night-light', new Vector3(0, 3.8, 54), scene);
  southGatewayNightLight.diffuse = Color3.FromHexString('#fbbf24');
  southGatewayNightLight.intensity = 0;
  southGatewayNightLight.range = 42;

  // Cửa ngõ trung chuyển phía Bắc: x = 0, z = -54
  const northGatewayNightLight = new PointLight('north-gateway-night-light', new Vector3(0, 3.8, -54), scene);
  northGatewayNightLight.diffuse = Color3.FromHexString('#fbbf24');
  northGatewayNightLight.intensity = 0;
  northGatewayNightLight.range = 42;

  let currentPhase = 'day';

  // =========================================================================
  // 11. BẢNG PHỐI MÀU 4 PHA ĐIỆN ẢNH CHUẨN GHIBLI & MAKOTO SHINKAI
  // =========================================================================
  const PHASES = [
    {
      time: 0,
      name: 'dawn',
      clearColor: new Color4(0.98, 0.88, 0.82, 1),
      fogColor: new Color3(0.98, 0.86, 0.78),
      // 5-Stop Sky Gradient: Bình minh pastel ngọt ngào
      zenith: Color3.FromHexString('#0284c7'),
      upper: Color3.FromHexString('#60a5fa'),
      trans: Color3.FromHexString('#f472b6'),
      haze: Color3.FromHexString('#fde68a'),
      ground: Color3.FromHexString('#fed7aa'),
      ambIntensity: 0.52,
      ambColor: Color3.FromHexString('#fdf2e9'),
      ambGround: Color3.FromHexString('#9bb698'),
      sunIntensity: 0.54,
      sunColor: Color3.FromHexString('#ffe5bc'),
      sunDir: new Vector3(-0.82, -0.32, -0.25),
      sunDiscAlpha: 0.85,
      sunGlowIntensity: 1.15,
      sunGlowExponent: 16.0,
      starAlpha: 0.0,
      moonAlpha: 0.0,
      auroraAlpha: 0.0,
      sunDustRate: 18,
      petalRate: 16,
      fireflyRate: 0,
      shadowDarkness: 0.22,
      lampIntensity: 0.15,
      cloudTint: Color3.FromHexString('#fff7ed'),
      cloudRimColor: Color3.FromHexString('#fef08a'),
      cloudTopTint: Color3.FromHexString('#fff7ed'),
      cloudBaseTint: Color3.FromHexString('#fbcfe8'),
    },
    {
      time: 60,
      name: 'day',
      clearColor: new Color4(0.85, 0.93, 0.99, 1),
      fogColor: new Color3(0.88, 0.94, 0.99),
      // 5-Stop Sky Gradient: Bầu trời trong xanh tươi mát rực rỡ phong cách Ghibli
      zenith: Color3.FromHexString('#0284c7'),
      upper: Color3.FromHexString('#38bdf8'),
      trans: Color3.FromHexString('#7dd3fc'),
      haze: Color3.FromHexString('#e0f2fe'),
      ground: Color3.FromHexString('#f0f9ff'),
      ambIntensity: 0.62,
      ambColor: Color3.FromHexString('#edf0eb'),
      ambGround: Color3.FromHexString('#9bb698'),
      sunIntensity: 0.52,
      sunColor: Color3.FromHexString('#fffbeb'),
      sunDir: new Vector3(-0.45, -0.85, -0.32),
      sunDiscAlpha: 1.0,
      sunGlowIntensity: 0.85,
      sunGlowExponent: 28.0,
      starAlpha: 0,
      moonAlpha: 0,
      auroraAlpha: 0.0,
      sunDustRate: 22,
      petalRate: 16,
      fireflyRate: 0,
      shadowDarkness: 0.20,
      lampIntensity: 0.0,
      cloudTint: Color3.White(),
      cloudRimColor: Color3.FromHexString('#fef9c3'),
      cloudTopTint: Color3.White(),
      cloudBaseTint: Color3.FromHexString('#e0f2fe'),
    },
    {
      time: 120,
      name: 'dusk',
      clearColor: new Color4(0.98, 0.72, 0.58, 1),
      fogColor: new Color3(0.98, 0.68, 0.55),
      // 5-Stop Sky Gradient: Hoàng hôn tím hồng rực rỡ phong cách Makoto Shinkai
      zenith: Color3.FromHexString('#311042'),
      upper: Color3.FromHexString('#6b21a8'),
      trans: Color3.FromHexString('#db2777'),
      haze: Color3.FromHexString('#f97316'),
      ground: Color3.FromHexString('#fed7aa'),
      ambIntensity: 0.50,
      ambColor: Color3.FromHexString('#fef3c7'),
      ambGround: Color3.FromHexString('#c2aa88'),
      sunIntensity: 0.54,
      sunColor: Color3.FromHexString('#ffdab9'),
      sunDir: new Vector3(0.85, -0.22, 0.22),
      sunDiscAlpha: 0.95,
      sunGlowIntensity: 1.35,
      sunGlowExponent: 14.0,
      starAlpha: 0.35,
      moonAlpha: 0.55,
      auroraAlpha: 0.0,
      sunDustRate: 14,
      petalRate: 12,
      fireflyRate: 18,
      shadowDarkness: 0.22,
      lampIntensity: 0.95,
      cloudTint: Color3.FromHexString('#fbcfe8'),
      cloudRimColor: Color3.FromHexString('#fb923c'),
      cloudTopTint: Color3.FromHexString('#fef08a'),
      cloudBaseTint: Color3.FromHexString('#c084fc'),
    },
    {
      time: 180,
      name: 'night',
      clearColor: new Color4(0.04, 0.07, 0.15, 1),
      fogColor: new Color3(0.05, 0.08, 0.18),
      // 5-Stop Sky Gradient: Bầu trời đêm vũ trụ sâu thẳm (Cosmic Navy & Sapphire)
      zenith: Color3.FromHexString('#050816'),
      upper: Color3.FromHexString('#0c1033'),
      trans: Color3.FromHexString('#1e1b4b'),
      haze: Color3.FromHexString('#172554'),
      ground: Color3.FromHexString('#0f172a'),
      ambIntensity: 0.50,
      ambColor: Color3.FromHexString('#b4c6ff'),
      ambGround: Color3.FromHexString('#3b3765'),
      sunIntensity: 0.58,
      sunColor: Color3.FromHexString('#dbeafe'),
      sunDir: new Vector3(-0.55, -0.65, 0.52),
      sunDiscAlpha: 0.0,
      sunGlowIntensity: 0.0,
      sunGlowExponent: 32.0,
      moonAlpha: 1.0,
      auroraAlpha: 0.65,
      sunDustRate: 0,
      petalRate: 4,
      fireflyRate: 48,
      shadowDarkness: 0.20,
      lampIntensity: 1.85,
      cloudTint: Color3.FromHexString('#334155'),
      cloudRimColor: Color3.FromHexString('#93c5fd').scale(0.35),
      cloudTopTint: Color3.FromHexString('#475569'),
      cloudBaseTint: Color3.FromHexString('#1e293b'),
    },
  ];

  let lastGradFactor = -999;
  let lastPhaseName = '';

  const atmosphere = {
    setTime(clockSeconds) {
      const trace = (label, action) => typeof window !== 'undefined' && window.__farmDebug
        ? window.__farmDebug.measure(`clock: ${label}`, action) : action();
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

      // Hermite smoothstep lerp
      const s = factor * factor * (3 - 2 * factor);

      // Cập nhật Procedural Sky Shader thông số thời gian thực trên GPU (zero CPU canvas draw)
      if (Math.abs(factor - lastGradFactor) > 0.015 || currentPhase !== lastPhaseName) {
        lastGradFactor = factor;
        lastPhaseName = currentPhase;
        const curZenith = Color3.Lerp(k1.zenith, k2.zenith, s);
        const curUpper = Color3.Lerp(k1.upper, k2.upper, s);
        const curTrans = Color3.Lerp(k1.trans, k2.trans, s);
        const curHaze = Color3.Lerp(k1.haze, k2.haze, s);
        const curGround = Color3.Lerp(k1.ground, k2.ground, s);
        const curSunColor = Color3.Lerp(k1.sunColor, k2.sunColor, s);
        const curGlowInt = (k1.sunGlowIntensity ?? 0.75) + ((k2.sunGlowIntensity ?? 0.75) - (k1.sunGlowIntensity ?? 0.75)) * s;
        const curGlowExp = (k1.sunGlowExponent ?? 28.0) + ((k2.sunGlowExponent ?? 28.0) - (k1.sunGlowExponent ?? 28.0)) * s;

        const curFogColor = Color3.Lerp(k1.fogColor, k2.fogColor, s);
        const curCloudTint = Color3.Lerp(k1.cloudTint, k2.cloudTint, s);
        const curTopTint = Color3.Lerp(k1.cloudTopTint || curCloudTint, k2.cloudTopTint || curCloudTint, s);
        const curBaseTint = Color3.Lerp(k1.cloudBaseTint || curCloudTint, k2.cloudBaseTint || curCloudTint, s);

        // Vector hướng tới vị trí Mặt Trời trên vòm trời (ngược chiều vector chiếu sáng sunLight)
        _tmpSunSkyDir.copyFrom(sunLight.direction).scaleInPlace(-1).normalize();

        proceduralSky.setSkyParameters({
          zenith: curZenith,
          upper: curUpper,
          trans: curTrans,
          haze: curHaze,
          ground: curGround,
          fogColor: curFogColor,
          sunDir: _tmpSunSkyDir,
          sunColor: curSunColor,
          sunGlowIntensity: curGlowInt,
          sunGlowExponent: curGlowExp,
          cloudTopColor: curTopTint,
          cloudBaseColor: curBaseTint,
          cloudAlpha: currentPhase === 'night' ? 0.35 : 0.85,
        });
      }

      trace('clear / fog', () => {
      // Lerp ClearColor & Fog
      scene.clearColor = Color4.Lerp(k1.clearColor, k2.clearColor, s);
      if (scene.fogColor) {
        scene.fogColor = Color3.Lerp(k1.fogColor, k2.fogColor, s);
      }
      });

      trace('lights / shadows', () => {
      // Lerp Lights
      ambientLight.intensity = k1.ambIntensity + (k2.ambIntensity - k1.ambIntensity) * s;
      ambientLight.diffuse = Color3.Lerp(k1.ambColor, k2.ambColor, s);
      if (ambientLight.groundColor) {
        ambientLight.groundColor = Color3.Lerp(k1.ambGround, k2.ambGround, s);
      }

      sunLight.intensity = k1.sunIntensity + (k2.sunIntensity - k1.sunIntensity) * s;
      sunLight.diffuse = Color3.Lerp(k1.sunColor, k2.sunColor, s);
      sunLight.direction = Vector3.Lerp(k1.sunDir, k2.sunDir, s);

      if (shadows) {
        shadows.darkness = k1.shadowDarkness + (k2.shadowDarkness - k1.shadowDarkness) * s;
      }

      // Cập nhật đèn đêm ấm áp
      const curLamp = k1.lampIntensity + (k2.lampIntensity - k1.lampIntensity) * s;
      villageNightLight.intensity = curLamp;
      plazaNightLight.intensity = curLamp * 1.35;
      northMallNightLight.intensity = curLamp * 0.9;
      southGatewayNightLight.intensity = curLamp * 0.85;
      northGatewayNightLight.intensity = curLamp * 0.85;

      // Cập nhật độ sáng vật liệu đèn đường, quầng sáng sương mờ & vệt sáng loang theo thời gian
      const lampHaloMat = scene.getMaterialByName('ghibli-lamp-halo');
      if (lampHaloMat) {
        lampHaloMat.alpha = Math.min(0.95, curLamp * 0.52);
      }
      const groundPoolMat = scene.getMaterialByName('ghibli-ground-light-pool');
      if (groundPoolMat) {
        groundPoolMat.alpha = Math.min(0.72, curLamp * 0.40);
      }
      const gaslightMat = scene.getMaterialByName('ghibli-lamp-glow');
      if (gaslightMat) {
        const emissiveBoost = 0.06 + curLamp * 0.9;
        gaslightMat.emissiveColor = new Color3(1.0 * emissiveBoost, 0.72 * emissiveBoost, 0.22 * emissiveBoost);
      }
      const townGlassWarmMat = scene.getMaterialByName('town-glass-warm');
      if (townGlassWarmMat) {
        const windowBoost = 0.06 + curLamp * 0.9;
        townGlassWarmMat.emissiveColor = new Color3(0.98 * windowBoost, 0.86 * windowBoost, 0.48 * windowBoost);
      }
      const lanternAmberMat = scene.getMaterialByName('town-lantern-amber');
      if (lanternAmberMat) {
        const amberBoost = 0.06 + curLamp * 0.9;
        lanternAmberMat.emissiveColor = new Color3(0.98 * amberBoost, 0.62 * amberBoost, 0.12 * amberBoost);
      }
      const lanternWarmGlowMat = scene.getMaterialByName('lantern-warm-glow');
      if (lanternWarmGlowMat) {
        const glowBoost = 0.06 + curLamp * 0.9;
        lanternWarmGlowMat.emissiveColor = new Color3(0.98 * glowBoost, 0.62 * glowBoost, 0.12 * glowBoost);
      }
      });

      trace('celestial alpha', () => {
      // Cập nhật Mặt Trời Anime
      const sunAlpha = k1.sunDiscAlpha + (k2.sunDiscAlpha - k1.sunDiscAlpha) * s;
      sunMat.alpha = sunAlpha;
      coronaMat.alpha = sunAlpha * 0.45;

      // Cập nhật Mặt Trăng & Sao
      const moonVisibility = k1.moonAlpha + (k2.moonAlpha - k1.moonAlpha) * s;
      moonSphere.visibility = moonVisibility;
      moonGlow.visibility = moonVisibility;
      moonGlowOuter.visibility = moonVisibility;

      const starVisibility = k1.starAlpha + (k2.starAlpha - k1.starAlpha) * s;
      milkyWaySystem.setVisibility(starVisibility);
      });

      // Cập nhật mây nghệ thuật Ghibli (Two-Tone Shading & Golden Rim Light)
      const curCloudTint = Color3.Lerp(k1.cloudTint, k2.cloudTint, s);
      const curCloudRim = Color3.Lerp(k1.cloudRimColor || Color3.White(), k2.cloudRimColor || Color3.White(), s);
      const curTopTint = Color3.Lerp(k1.cloudTopTint || curCloudTint, k2.cloudTopTint || curCloudTint, s);
      const curBaseTint = Color3.Lerp(k1.cloudBaseTint || curCloudTint, k2.cloudBaseTint || curCloudTint, s);

      cloudRimFresnel.leftColor.copyFrom(curCloudRim);
      cloudRimFresnel.rightColor.copyFrom(curTopTint);

      cumulusTopMat.diffuseColor.copyFrom(curTopTint);
      cumulusTopMat.emissiveColor.copyFrom(curTopTint);

      cumulusBaseMat.diffuseColor.copyFrom(curBaseTint);
      cumulusBaseMat.emissiveColor.copyFrom(curBaseTint);

      cloudMat.diffuseColor.copyFrom(curTopTint);
      cloudMat.emissiveColor.copyFrom(curTopTint);

      cirrusMat.diffuseColor.copyFrom(curTopTint);
      cirrusMat.emissiveColor.copyFrom(curTopTint);

      // Cập nhật preset điện ảnh
      if (typeof window !== 'undefined' && window.__farmDebug) {
        window.__farmDebug.measure('clock: cinematic preset', () => cinematic?.setCinematicPreset(currentPhase));
      } else cinematic?.setCinematicPreset(currentPhase);

      // Hạt khí quyển
      const curDustRate = Math.round(k1.sunDustRate + (k2.sunDustRate - k1.sunDustRate) * s);
      sunDust.emitRate = curDustRate;

      const curPetalRate = Math.round(k1.petalRate + (k2.petalRate - k1.petalRate) * s);
      fallingPetals.emitRate = curPetalRate;

      const curFireflyRate = Math.round(k1.fireflyRate + (k2.fireflyRate - k1.fireflyRate) * s);
      firefliesFarm.emitRate = curFireflyRate;
      firefliesPlaza.emitRate = Math.round(curFireflyRate * 0.75);
      firefliesFountain.emitRate = Math.round(curFireflyRate * 0.85);
    },

    update(dt = 0.016) {
      const cam = scene.activeCamera;
      if (cam) {
        // Vòm trời bám theo camera để luôn bao bọc thế giới không bao giờ bị cắt
        proceduralSky.updateCamera(cam);

        // Định vị Mặt Trời Anime theo hướng ngược lại với sunLight.direction tại khoảng cách viễn cảnh 210m
        const sunDist = 210;
        sunLight.direction.normalizeToRef(_tmpNormDir);
        sunRoot.position.set(
          cam.position.x - _tmpNormDir.x * sunDist,
          Math.max(45, cam.position.y - _tmpNormDir.y * sunDist),
          cam.position.z - _tmpNormDir.z * sunDist
        );

        // Định vị nguồn sáng Directional Sun luôn bám sát theo vị trí mục tiêu/nhân vật (chuẩn Cozy Farmy 56m)
        const centerPos = cam.target || cam.position;
        sunLight.position.set(
          centerPos.x - _tmpNormDir.x * 65,
          centerPos.y - _tmpNormDir.y * 65,
          centerPos.z - _tmpNormDir.z * 65
        );

        // Định vị Mặt Trăng ở hướng đối diện
        moonRoot.position.set(
          cam.position.x + _tmpNormDir.x * sunDist * 0.95,
          Math.max(65, cam.position.y + _tmpNormDir.y * sunDist * 0.95),
          cam.position.z + _tmpNormDir.z * sunDist * 0.95
        );
      }

      // Trôi mây cận cảnh
      clouds.forEach(c => {
        c.node.position.x += dt * c.speed;
        if (c.node.position.x > 820) {
          c.node.position.x = -820;
        }
      });

      // Trôi mây lụa viễn cảnh cực kỳ êm ái
      cirrusBands.forEach(b => {
        b.node.position.x += dt * b.speed;
        if (b.node.position.x > 260) {
          b.node.position.x = -260;
        }
      });

      // Trôi dải sương mù thung lũng viễn cảnh
      mistMeshes.forEach(m => {
        m.mesh.rotation.y += dt * m.speed * 0.05;
      });

      // Cập nhật mây GPU động trên vòm trời
      proceduralSky.updateTime(dt);

      // Cập nhật Dải Ngân Hà, Sao nhấp nháy đa tần & Sao băng
      milkyWaySystem.update(dt, cam?.position);
    },

    getPhase() {
      return currentPhase;
    },

    isNight() {
      return currentPhase === 'night';
    },

    dispose() {
      cumulusTopMat.dispose();
      cumulusBaseMat.dispose();
      sunDust.dispose();
      fallingPetals.dispose();
      firefliesFarm.dispose();
      firefliesPlaza.dispose();
      firefliesFountain.dispose();
      glowTex.dispose();
      petalTex.dispose();
      proceduralSky.dispose();
      milkyWaySystem.dispose();
      sunTex.dispose();
      atmosphereRoot.dispose();
      villageNightLight.dispose();
      plazaNightLight.dispose();
      northMallNightLight.dispose();
      southGatewayNightLight.dispose();
      northGatewayNightLight.dispose();
    },
  };

  // Khởi tạo ngay trạng thái bầu trời ban ngày mặc định (frame 0) không cần chờ timer
  atmosphere.setTime(60);

  return atmosphere;
}
