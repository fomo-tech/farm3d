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

/**
 * createAtmosphere.js - GHIBLI CHILL & COZY ATMOSPHERIC HORIZON SYSTEM
 * 
 * Nâng cấp toàn diện bầu khí quyển & vùng chân trời đạt cảm giác thư thái, mơ màng:
 * 1. Vòm trời màu nước 5 tầng (5-Stop Hermite Gradient SkyDome) với dải sáng viền chân trời (Atmospheric Haze Rim).
 * 2. Đĩa Mặt Trời Anime mềm mại (Stylized Sun Disc & Atmospheric Corona) chuyển động theo quỹ đạo chân trời.
 * 3. Vầng trăng ngọc trai & Quầng hào quang dịu mắt (Glowing Pearl Moon & Soft Aura).
 * 4. Dải mây lụa tầng cao (Cirrus Ribbon Bands) trôi chậm rãi bao la + Cụm mây tích Ghibli khổng lồ (Cumulus Giants).
 * 5. Đàn chim viễn cảnh bay lượn lững lờ ngang đường chân trời (Flock of Distant Horizon Birds).
 * 6. Rèm cực quang phương Bắc (Northern Aurora Borealis) huyền ảo & Vệt sao băng rơi chậm ban đêm.
 * 7. Bụi nắng vàng, cánh hoa đào bay bổng, đom đóm dạ quang đa vùng và đèn đêm ấm cúng.
 * 8. Hiệu năng đỉnh cao 60 FPS (Texture 256x512 cập nhật nhịp nhàng, zero garbage collection).
 */
const _tmpNormDir = new Vector3();

export function createAtmosphere(scene, ambientLight, sunLight, shadows = null, cinematic = null) {
  const atmosphereRoot = new TransformNode('world-atmosphere-root', scene);

  // =========================================================================
  // 1. VÒM TRỜI MÀU NƯỚC 5 TẦNG (5-STOP PAINTERLY SKY DOME)
  // =========================================================================
  const skyDome = MeshBuilder.CreateSphere('ghibli-chill-skydome', {
    diameter: 6000,
    segments: 24,
    sideOrientation: Mesh.BACKSIDE,
  }, scene);
  skyDome.position.set(0, 0, 0);
  skyDome.parent = atmosphereRoot;
  skyDome.infiniteDistance = true;
  skyDome.isPickable = false;

  const skyMat = new StandardMaterial('ghibli-skydome-mat', scene);
  skyMat.disableLighting = true;
  skyMat.diffuseColor = Color3.Black();
  skyMat.backFaceCulling = false;
  skyMat.fogEnabled = false;

  const skyTex = new DynamicTexture('ghibli-skydome-canvas', { width: 256, height: 512 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  skyTex.wrapU = Texture.CLAMP_ADDRESSMODE;
  skyTex.wrapV = Texture.CLAMP_ADDRESSMODE;
  const sctx = skyTex.getContext();

  function renderSkyGradient(cZenith, cUpper, cTrans, cHaze, cGround) {
    sctx.clearRect(0, 0, 256, 512);
    const grad = sctx.createLinearGradient(0, 0, 0, 512);
    // 5 tầng hòa sắc từ đỉnh trời xuống chân trời và mặt đất
    grad.addColorStop(0.00, cZenith);   // Đỉnh vòm (Zenith)
    grad.addColorStop(0.42, cUpper);    // Vòm trời trên (Upper Sky)
    grad.addColorStop(0.70, cTrans);    // Tầng mây phấn (Peach/Lilac Horizon Transition)
    grad.addColorStop(0.88, cHaze);     // Dải sáng viền chân trời (Atmospheric Haze Rim)
    grad.addColorStop(1.00, cGround);   // Hòa sắc viền mặt đất (Ground Blend)
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 256, 512);
    if (typeof window !== 'undefined' && window.__farmDebug) {
      window.__farmDebug.measure('clock: sky texture upload', () => skyTex.update(false));
    } else skyTex.update(false);
  }

  skyMat.emissiveTexture = skyTex;
  skyMat.emissiveColor = Color3.White();
  skyDome.material = skyMat;

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
  sunMat.fogEnabled = false;

  const sunDisc = MeshBuilder.CreateDisc('anime-sun-disc', { radius: 55, tessellation: 32 }, scene);
  sunDisc.parent = sunRoot;
  sunDisc.billboardMode = Mesh.BILLBOARDMODE_ALL;
  sunDisc.material = sunMat;

  const sunCorona = MeshBuilder.CreateDisc('anime-sun-corona', { radius: 120, tessellation: 32 }, scene);
  sunCorona.parent = sunRoot;
  sunCorona.billboardMode = Mesh.BILLBOARDMODE_ALL;
  const coronaMat = new StandardMaterial('anime-sun-corona-mat', scene);
  coronaMat.emissiveTexture = sunTex;
  coronaMat.opacityTexture = sunTex;
  coronaMat.emissiveColor = new Color3(1.0, 0.85, 0.5);
  coronaMat.alpha = 0.45;
  coronaMat.disableLighting = true;
  coronaMat.fogEnabled = false;
  sunCorona.material = coronaMat;

  // =========================================================================
  // 3. MẶT TRĂNG DẠ QUANG NGỌC TRAI & VẦNG HÀO QUANG (3D GLOWING MOON)
  // =========================================================================
  const moonRoot = new TransformNode('moon-root', scene);
  moonRoot.parent = atmosphereRoot;

  const moonSphere = MeshBuilder.CreateSphere('moon-sphere', { diameter: 38, segments: 16 }, scene);
  moonSphere.parent = moonRoot;
  const moonMat = new StandardMaterial('moon-mat', scene);
  moonMat.diffuseColor = Color3.FromHexString('#fffbe8');
  moonMat.emissiveColor = Color3.FromHexString('#fffae0');
  moonMat.disableLighting = true;
  moonMat.fogEnabled = false;
  moonSphere.material = moonMat;

  const moonGlow = MeshBuilder.CreateDisc('moon-glow', { radius: 46, tessellation: 24 }, scene);
  moonGlow.parent = moonRoot;
  moonGlow.billboardMode = Mesh.BILLBOARDMODE_ALL;
  const moonGlowMat = new StandardMaterial('moon-glow-mat', scene);
  moonGlowMat.emissiveTexture = sunTex;
  moonGlowMat.opacityTexture = sunTex;
  moonGlowMat.emissiveColor = Color3.FromHexString('#fef08a');
  moonGlowMat.alpha = 0.55;
  moonGlowMat.disableLighting = true;
  moonGlowMat.fogEnabled = false;
  moonGlow.material = moonGlowMat;

  // Hào quang sương mờ dịu mắt tầng rộng của vầng trăng ngọc trai (Ghibli Moon Corona)
  const moonGlowOuter = MeshBuilder.CreateDisc('moon-glow-outer', { radius: 78, tessellation: 24 }, scene);
  moonGlowOuter.parent = moonRoot;
  moonGlowOuter.billboardMode = Mesh.BILLBOARDMODE_ALL;
  const moonGlowOuterMat = new StandardMaterial('moon-glow-outer-mat', scene);
  moonGlowOuterMat.emissiveTexture = sunTex;
  moonGlowOuterMat.opacityTexture = sunTex;
  moonGlowOuterMat.emissiveColor = Color3.FromHexString('#c7d2fe');
  moonGlowOuterMat.alpha = 0.32;
  moonGlowOuterMat.disableLighting = true;
  moonGlowOuterMat.fogEnabled = false;
  moonGlowOuter.material = moonGlowOuterMat;

  // =========================================================================
  // 4. VÒM SAO TRỜI ĐÊM LẤP LÁNH (TWINKLING STARFIELD DOME)
  // =========================================================================
  const starsRoot = new TransformNode('stars-root', scene);
  starsRoot.parent = atmosphereRoot;
  const masterStar = MeshBuilder.CreateSphere('master-star', { diameter: 1.2, segments: 4 }, scene);
  masterStar.parent = starsRoot;
  const starMat = new StandardMaterial('star-mat', scene);
  starMat.diffuseColor = Color3.FromHexString('#ffffff');
  starMat.emissiveColor = Color3.FromHexString('#fef08a');
  starMat.disableLighting = true;
  starMat.fogEnabled = false;
  starMat.alpha = 0;
  masterStar.material = starMat;

  const starMatrices = [];
  const sPos = new Vector3();
  const sMat = Matrix.Identity();
  for (let i = 0; i < 220; i++) {
    const theta = (i * 0.42) % (Math.PI * 2);
    const phi = 0.15 + ((i * 1.37) % 1) * 0.95;
    const rad = 2300 + (i % 35);
    const sx = Math.sin(phi) * Math.cos(theta) * rad;
    const sy = Math.cos(phi) * rad;
    const sz = Math.sin(phi) * Math.sin(theta) * rad;
    const sScale = 0.8 + ((i * 7) % 10) / 10 * 1.2;
    sPos.set(sx, sy, sz);
    Matrix.ComposeToRef(new Vector3(sScale, sScale, sScale), Quaternion.Identity(), sPos, sMat);
    starMatrices.push(...sMat.asArray());
  }
  masterStar.thinInstanceSetBuffer('matrix', new Float32Array(starMatrices), 16, true);

  // =========================================================================
  // 5. RÈM CỰC QUANG PHƯƠNG BẮC (NORTHERN AURORA BOREALIS)
  // =========================================================================
  const auroraRoot = new TransformNode('aurora-root', scene);
  auroraRoot.parent = atmosphereRoot;

  const auroraMat = new StandardMaterial('aurora-mat', scene);
  auroraMat.disableLighting = true;
  auroraMat.fogEnabled = false;
  auroraMat.emissiveColor = Color3.FromHexString('#10b981');
  auroraMat.alpha = 0;
  auroraMat.backFaceCulling = false;

  const auroraRibbon = MeshBuilder.CreateRibbon('aurora-ribbon', {
    pathArray: [
      [
        new Vector3(-800, 160, -2100),
        new Vector3(-400, 210, -2150),
        new Vector3(0, 175, -2100),
        new Vector3(400, 220, -2150),
        new Vector3(800, 180, -2100),
      ],
      [
        new Vector3(-800, 310, -2100),
        new Vector3(-400, 360, -2150),
        new Vector3(0, 330, -2100),
        new Vector3(400, 370, -2150),
        new Vector3(800, 320, -2100),
      ],
    ],
    closeArray: false,
    closePath: false,
  }, scene);
  auroraRibbon.parent = auroraRoot;
  auroraRibbon.material = auroraMat;
  auroraRibbon.freezeWorldMatrix();

  // =========================================================================
  // 6. VỆT SAO BĂNG RƠI CHẬM BAN ĐÊM (GENTLE SHOOTING STARS)
  // =========================================================================
  const shootingStar = MeshBuilder.CreateCylinder('shooting-star', {
    height: 38,
    diameterTop: 0.1,
    diameterBottom: 1.8,
    tessellation: 6,
  }, scene);
  shootingStar.parent = atmosphereRoot;
  const shootMat = new StandardMaterial('shooting-star-mat', scene);
  shootMat.emissiveColor = Color3.FromHexString('#fef08a');
  shootMat.disableLighting = true;
  shootMat.fogEnabled = false;
  shootMat.alpha = 0;
  shootingStar.material = shootMat;
  shootingStar.rotation.z = Math.PI / 4;
  shootingStar.rotation.x = Math.PI / 6;

  let shootingStarTimer = 0;
  let shootingStarProgress = -1;

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
  cirrusMat.fogEnabled = false;

  const cirrusBands = [];
  const cirrusConfigs = [
    { x: -900, y: 135, z: -1600, w: 420, h: 16, speed: 0.22 },
    { x: -300, y: 150, z: -1750, w: 520, h: 22, speed: 0.18 },
    { x: 450, y: 140, z: -1650, w: 480, h: 18, speed: 0.20 },
    { x: -1100, y: 130, z: 400, w: 460, h: 20, speed: 0.24 },
    { x: 1200, y: 145, z: 200, w: 500, h: 18, speed: 0.21 },
    { x: -200, y: 125, z: 1700, w: 540, h: 24, speed: 0.25 },
    { x: 600, y: 138, z: 1800, w: 450, h: 18, speed: 0.22 },
  ];

  cirrusConfigs.forEach((cfg, idx) => {
    const band = MeshBuilder.CreateBox(`cirrus-band-${idx}`, { width: cfg.w, height: cfg.h, depth: 35 }, scene);
    band.position.set(cfg.x, cfg.y, cfg.z);
    band.material = cirrusMat;
    band.parent = cirrusRoot;
    band.freezeWorldMatrix();
    cirrusBands.push({ node: band, speed: cfg.speed, initialX: cfg.x });
  });

  // 3 Cụm mây tích Ghibli khổng lồ đón hoàng hôn (Cumulus Giants)
  const cumulusRoot = new TransformNode('cumulus-giants-root', scene);
  cumulusRoot.parent = atmosphereRoot;

  const cumulusMat = new StandardMaterial('cumulus-giant-mat', scene);
  cumulusMat.diffuseColor = Color3.White();
  cumulusMat.emissiveColor = new Color3(0.94, 0.96, 1.0);
  cumulusMat.alpha = 0.88;
  cumulusMat.disableLighting = true;
  cumulusMat.fogEnabled = false;

  function createCumulusGiant(name, cx, cy, cz, scale = 1.0) {
    const gNode = new TransformNode(name, scene);
    gNode.position.set(cx, cy, cz);
    gNode.parent = cumulusRoot;

    const puffs = [
      { x: 0, y: 0, z: 0, d: 130 },
      { x: -65, y: -18, z: 0, d: 95 },
      { x: 65, y: -12, z: 0, d: 105 },
      { x: -35, y: 35, z: 0, d: 85 },
      { x: 35, y: 32, z: 0, d: 90 },
      { x: 0, y: 55, z: 0, d: 75 },
    ];
    puffs.forEach((p, idx) => {
      const s = MeshBuilder.CreateSphere(`${name}-puff-${idx}`, { diameter: p.d * scale, segments: 10 }, scene);
      s.position.set(p.x * scale, p.y * scale, p.z * scale);
      s.scaling.y = 0.62;
      s.material = cumulusMat;
      s.parent = gNode;
      s.freezeWorldMatrix();
    });
  }

  // Đông (x: 1450, z: -200), Tây (x: -1450, z: 350), Bắc (x: 200, z: -1750)
  createCumulusGiant('cumulus-east', 1450, 95, -200, 1.25);
  createCumulusGiant('cumulus-west', -1450, 105, 350, 1.35);
  createCumulusGiant('cumulus-north', 200, 115, -1750, 1.4);

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

  const cloudPositions = [
    { x: -620, y: 56, z: 180, s: 1.4 }, { x: -480, y: 52, z: 90, s: 1.2 }, { x: -350, y: 60, z: 220, s: 1.3 },
    { x: -200, y: 54, z: 80, s: 1.1 }, { x: -60, y: 58, z: -40, s: 1.4 }, { x: 40, y: 50, z: 120, s: 1.2 },
    { x: 180, y: 56, z: 60, s: 1.3 }, { x: 300, y: 52, z: 190, s: 1.5 }, { x: 450, y: 58, z: 90, s: 1.2 },
    { x: 600, y: 54, z: 210, s: 1.4 }, { x: 720, y: 56, z: 70, s: 1.3 },
    { x: -580, y: 62, z: -220, s: 1.4 }, { x: -420, y: 55, z: -150, s: 1.2 }, { x: -280, y: 58, z: -240, s: 1.3 },
    { x: -120, y: 52, z: -320, s: 1.5 }, { x: 0, y: 64, z: -440, s: 1.4 }, { x: 140, y: 56, z: -250, s: 1.2 },
    { x: 280, y: 60, z: -180, s: 1.4 }, { x: 440, y: 54, z: -260, s: 1.3 }, { x: 620, y: 58, z: -190, s: 1.5 },
    { x: -400, y: 56, z: 420, s: 1.3 }, { x: -250, y: 60, z: 480, s: 1.4 }, { x: -80, y: 52, z: 380, s: 1.2 },
    { x: 80, y: 58, z: 400, s: 1.3 }, { x: 250, y: 54, z: 460, s: 1.4 }, { x: 420, y: 62, z: 430, s: 1.3 },
    { x: 580, y: 56, z: 490, s: 1.2 }, { x: -160, y: 54, z: 260, s: 1.1 }
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
      clearColor: new Color4(0.98, 0.88, 0.80, 1),
      fogColor: new Color3(0.98, 0.84, 0.72),
      // 5-Stop Sky Gradient
      zenith: Color3.FromHexString('#4f86c6'),
      upper: Color3.FromHexString('#82a4d4'),
      trans: Color3.FromHexString('#f472b6'),
      haze: Color3.FromHexString('#fde047'),
      ground: Color3.FromHexString('#fed7aa'),
      ambIntensity: 0.48,
      ambColor: Color3.FromHexString('#fdf2e9'),
      ambGround: Color3.FromHexString('#9bb698'),
      sunIntensity: 0.54,
      sunColor: Color3.FromHexString('#ffe5bc'),
      sunDir: new Vector3(-0.82, -0.32, -0.25),
      sunDiscAlpha: 0.85,
      starAlpha: 0.0,
      moonAlpha: 0.0,
      auroraAlpha: 0.0,
      sunDustRate: 18,
      petalRate: 16,
      fireflyRate: 0,
      shadowDarkness: 0.22,
      lampIntensity: 0.15,
      cloudTint: Color3.FromHexString('#fed7aa'),
    },
    {
      time: 60,
      name: 'day',
      clearColor: new Color4(0.85, 0.93, 0.99, 1),
      fogColor: new Color3(0.88, 0.94, 0.99),
      // 5-Stop Sky Gradient: Bầu trời trong trẻo tươi mát không cháy chói
      zenith: Color3.FromHexString('#1e40af'),
      upper: Color3.FromHexString('#38bdf8'),
      trans: Color3.FromHexString('#bae6fd'),
      haze: Color3.FromHexString('#f0f9ff'),
      ground: Color3.FromHexString('#f8fafc'),
      ambIntensity: 0.50,
      ambColor: Color3.FromHexString('#e0f2fe'),
      ambGround: Color3.FromHexString('#9bb698'),
      sunIntensity: 0.60,
      sunColor: Color3.FromHexString('#fff7ed'),
      sunDir: new Vector3(-0.45, -0.85, -0.32),
      sunDiscAlpha: 1.0,
      starAlpha: 0,
      moonAlpha: 0,
      auroraAlpha: 0.0,
      sunDustRate: 22,
      petalRate: 16,
      fireflyRate: 0,
      shadowDarkness: 0.20,
      lampIntensity: 0.0,
      cloudTint: Color3.White(),
    },
    {
      time: 120,
      name: 'dusk',
      clearColor: new Color4(0.98, 0.72, 0.58, 1),
      fogColor: new Color3(0.98, 0.68, 0.55),
      // 5-Stop Sky Gradient
      zenith: Color3.FromHexString('#4c1d95'),
      upper: Color3.FromHexString('#7c3aed'),
      trans: Color3.FromHexString('#f43f5e'),
      haze: Color3.FromHexString('#fb923c'),
      ground: Color3.FromHexString('#fed7aa'),
      ambIntensity: 0.48,
      ambColor: Color3.FromHexString('#fef3c7'),
      ambGround: Color3.FromHexString('#c2aa88'),
      sunIntensity: 0.54,
      sunColor: Color3.FromHexString('#ffdab9'),
      sunDir: new Vector3(0.85, -0.22, 0.22),
      sunDiscAlpha: 0.95,
      starAlpha: 0.35,
      moonAlpha: 0.55,
      auroraAlpha: 0.0,
      sunDustRate: 14,
      petalRate: 12,
      fireflyRate: 18,
      shadowDarkness: 0.22,
      lampIntensity: 0.95,
      cloudTint: Color3.FromHexString('#fbcfe8'),
    },
    {
      time: 180,
      name: 'night',
      clearColor: new Color4(0.06, 0.09, 0.18, 1),
      fogColor: new Color3(0.07, 0.10, 0.20),
      // 5-Stop Sky Gradient: Bầu trời đêm Ghibli thơ mộng (Deep Indigo -> Sapphire -> Lavender Violet)
      zenith: Color3.FromHexString('#0a0e27'),
      upper: Color3.FromHexString('#151b4a'),
      trans: Color3.FromHexString('#2a1b54'),
      haze: Color3.FromHexString('#1e3a8a'),
      ground: Color3.FromHexString('#0f172a'),
      ambIntensity: 0.50,
      ambColor: Color3.FromHexString('#b4c6ff'),
      ambGround: Color3.FromHexString('#3b3765'),
      sunIntensity: 0.58,
      sunColor: Color3.FromHexString('#dbeafe'),
      sunDir: new Vector3(-0.55, -0.65, 0.52),
      sunDiscAlpha: 0.0,
      starAlpha: 1.0,
      moonAlpha: 1.0,
      auroraAlpha: 0.65,
      sunDustRate: 0,
      petalRate: 4,
      fireflyRate: 48,
      shadowDarkness: 0.20,
      lampIntensity: 1.85,
      cloudTint: Color3.FromHexString('#474e68'),
    },
  ];

  let lastGradFactor = -999;
  let lastPhaseName = '';

  return {
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

      // Cập nhật DynamicTexture 5-Stop Gradient khi factor thay đổi
      if (Math.abs(factor - lastGradFactor) > 0.02 || currentPhase !== lastPhaseName) {
        lastGradFactor = factor;
        lastPhaseName = currentPhase;
        const curZenith = Color3.Lerp(k1.zenith, k2.zenith, s).toHexString();
        const curUpper = Color3.Lerp(k1.upper, k2.upper, s).toHexString();
        const curTrans = Color3.Lerp(k1.trans, k2.trans, s).toHexString();
        const curHaze = Color3.Lerp(k1.haze, k2.haze, s).toHexString();
        const curGround = Color3.Lerp(k1.ground, k2.ground, s).toHexString();
        renderSkyGradient(curZenith, curUpper, curTrans, curHaze, curGround);
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
        const emissiveBoost = 0.5 + curLamp * 0.65;
        gaslightMat.emissiveColor = new Color3(1.0 * emissiveBoost, 0.72 * emissiveBoost, 0.22 * emissiveBoost);
      }
      const townGlassWarmMat = scene.getMaterialByName('town-glass-warm');
      if (townGlassWarmMat) {
        const windowBoost = 0.4 + curLamp * 0.6;
        townGlassWarmMat.emissiveColor = new Color3(0.98 * windowBoost, 0.86 * windowBoost, 0.48 * windowBoost);
      }
      const lanternAmberMat = scene.getMaterialByName('town-lantern-amber');
      if (lanternAmberMat) {
        const amberBoost = 0.5 + curLamp * 0.65;
        lanternAmberMat.emissiveColor = new Color3(0.98 * amberBoost, 0.62 * amberBoost, 0.12 * amberBoost);
      }
      const lanternWarmGlowMat = scene.getMaterialByName('lantern-warm-glow');
      if (lanternWarmGlowMat) {
        const glowBoost = 0.5 + curLamp * 0.65;
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
      starMat.alpha = starVisibility;

      // Cập nhật Cực Quang
      const curAurora = k1.auroraAlpha + (k2.auroraAlpha - k1.auroraAlpha) * s;
      auroraMat.alpha = curAurora;
      });

      // Cập nhật mây
      const curCloudTint = Color3.Lerp(k1.cloudTint, k2.cloudTint, s);
      cloudMat.diffuseColor = curCloudTint;
      cirrusMat.diffuseColor = curCloudTint;
      cumulusMat.diffuseColor = curCloudTint;

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
        skyDome.position.x = cam.position.x;
        skyDome.position.z = cam.position.z;

        // Định vị Mặt Trời Anime theo hướng ngược lại với sunLight.direction tại khoảng cách viễn cảnh 2200m
        const sunDist = 2200;
        sunLight.direction.normalizeToRef(_tmpNormDir);
        sunRoot.position.set(
          cam.position.x - _tmpNormDir.x * sunDist,
          Math.max(120, cam.position.y - _tmpNormDir.y * sunDist),
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
          Math.max(220, cam.position.y + _tmpNormDir.y * sunDist * 0.95),
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
        if (b.node.position.x > 1800) {
          b.node.position.x = -1800;
        }
      });

      // Trôi dải sương mù thung lũng viễn cảnh
      mistMeshes.forEach(m => {
        m.mesh.rotation.y += dt * m.speed * 0.05;
      });



      // Sao băng rơi ban đêm
      if (currentPhase === 'night') {
        shootingStarTimer += dt;
        if (shootingStarTimer > 18.0 && shootingStarProgress < 0) {
          shootingStarTimer = 0;
          shootingStarProgress = 0;
          // Xuất phát ngẫu nhiên trên vòm trời cao
          const startX = (Math.random() - 0.5) * 800;
          const startZ = -600 - Math.random() * 600;
          shootingStar.position.set(startX, 420, startZ);
        }

        if (shootingStarProgress >= 0) {
          shootingStarProgress += dt * 1.35;
          shootingStar.position.x += dt * 380;
          shootingStar.position.y -= dt * 260;
          shootingStar.position.z += dt * 180;

          // Alpha mờ dần ở hai đầu
          if (shootingStarProgress < 0.25) {
            shootMat.alpha = shootingStarProgress / 0.25;
          } else if (shootingStarProgress > 0.75) {
            shootMat.alpha = Math.max(0, (1.0 - shootingStarProgress) / 0.25);
          } else {
            shootMat.alpha = 1.0;
          }

          if (shootingStarProgress >= 1.0) {
            shootingStarProgress = -1;
            shootMat.alpha = 0;
          }
        }
      } else {
        shootMat.alpha = 0;
        shootingStarProgress = -1;
      }
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
      firefliesFountain.dispose();
      glowTex.dispose();
      petalTex.dispose();
      skyTex.dispose();
      sunTex.dispose();
      atmosphereRoot.dispose();
      villageNightLight.dispose();
      plazaNightLight.dispose();
      northMallNightLight.dispose();
      southGatewayNightLight.dispose();
      northGatewayNightLight.dispose();
    },
  };
}
