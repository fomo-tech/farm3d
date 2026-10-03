import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { createToyMaterial } from '../../rendering/PlayTogetherTheme.js';

function makeMat(scene, name, hex, emissiveHex = null, specular = 0.5, specularPower = 90) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.5);
  m.specularColor = new Color3(specular, specular, specular);
  m.specularPower = specularPower;
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

/**
 * Biển hiệu LED Neon 3D phong cách Play Together Metaverse
 */
function createNeonMarqueeSign(scene, title, subtitle, accentColor, parent, yPos = 8.8) {
  const dt = new DynamicTexture(`pt-marquee-tex-${title}`, { width: 1024, height: 320 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  dt.anisotropicFilteringLevel = 16;
  dt.hasAlpha = true;
  const ctx = dt.getContext();
  ctx.clearRect(0, 0, 1024, 320);

  // Khung biển hiệu màu than chì bóng viền bo tròn
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(16, 16, 992, 288, 36);
  ctx.fill();

  // Viền Neon phát sáng
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 14;
  ctx.stroke();

  // Nền gradient tinh tế
  const grad = ctx.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0, '#1e293b');
  grad.addColorStop(0.5, '#334155');
  grad.addColorStop(1, '#1e293b');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(28, 28, 968, 264, 24);
  ctx.fill();

  // Tiêu đề chữ nổi phát sáng phong cách Metaverse
  ctx.font = '900 68px "Montserrat", "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 24;
  ctx.fillText(title, 512, 145);

  // Phụ đề chữ nhỏ phong cách Social Game
  ctx.font = 'bold 30px "Montserrat", "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = accentColor;
  ctx.shadowBlur = 12;
  ctx.fillText(subtitle.toUpperCase(), 512, 215);

  dt.update();

  const signMat = new StandardMaterial(`pt-marquee-mat-${title}`, scene);
  signMat.diffuseTexture = dt;
  signMat.opacityTexture = dt;
  signMat.emissiveColor = Color3.FromHexString(accentColor).scale(0.35);
  signMat.specularColor = Color3.Black();

  const signPlane = MeshBuilder.CreatePlane(`pt-marquee-plane-${title}`, { width: 8.4, height: 2.7 }, scene);
  signPlane.position.set(0, yPos, 0);
  signPlane.material = signMat;
  signPlane.billboardMode = Mesh.BILLBOARDMODE_Y;
  signPlane.parent = parent;

  return signPlane;
}

/**
 * QUẢNG TRƯỜNG TRUNG TÂM THÀNH PHỐ PLAY TOGETHER (PREMIUM SOCIAL METAVERSE PLAZA)
 * - Quảng trường bộ hành 92m đá cẩm thạch trắng sứ viền LED Neon Cyan & Magenta
 * - Trái tim: Đài Phun Nước Trung Tâm Kaia 3 tầng có hồ bơi cẩm thạch, câu cá & nhảy múa
 * - 5 Mega Venues chuẩn Game Mạng Xã Hội:
 *   1. 👗 Trendy Fashion Mall (venue: 'fashion')
 *   2. 🎰 Grand Neon Arcade & Casino Lounge (venue: 'casino')
 *   3. 🛒 Super Agri-Mart & Green Center (venue: 'supplies')
 *   4. 🏎️ Motors & Mobility Showroom (venue: 'vehicles')
 *   5. 🎣 Marina Pro Fishing Tackle & Aquarium (venue: 'fishing')
 * - 2 Phân khu đất mở rộng tương lai (Future Expansion Plots) ở hai cánh Đông - Tây
 */
export function createPlayTogetherPlaza(scene, shadows, foliage) {
  const plazaRoot = new TransformNode('playtogether-central-plaza-root', scene);

  // ========================================================
  // 1. QUẢNG TRƯỜNG ĐÁ CẨM THẠCH TRẮNG SỨ 92M VIỀN LED NEON
  // ========================================================
  const plazaDisc = MeshBuilder.CreateCylinder('pt-plaza-grand-disc', {
    diameter: 92,
    height: 0.12,
    tessellation: 64,
  }, scene);
  plazaDisc.position.set(0, 0.06, 0);
  plazaDisc.parent = plazaRoot;
  plazaDisc.receiveShadows = true;

  const plazaTex = new DynamicTexture('pt-plaza-surface-tex', 1024, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  plazaTex.anisotropicFilteringLevel = 16;
  const pctx = plazaTex.getContext();

  // Nền đá cẩm thạch trắng ngọc trai bóng mịn
  pctx.fillStyle = '#f8fafc';
  pctx.fillRect(0, 0, 1024, 1024);

  // Vành đai hoa văn đá hoa cương xám khói & vàng gold
  pctx.strokeStyle = '#e2e8f0';
  pctx.lineWidth = 4;
  for (let r = 80; r < 500; r += 50) {
    pctx.beginPath();
    pctx.arc(512, 512, r, 0, Math.PI * 2);
    pctx.stroke();
  }

  // 12 nan hoa hướng tâm lát đá cẩm thạch sang trọng
  for (let a = 0; a < 12; a++) {
    const rad = (a * Math.PI * 2) / 12;
    pctx.beginPath();
    pctx.moveTo(512, 512);
    pctx.lineTo(512 + Math.cos(rad) * 490, 512 + Math.sin(rad) * 490);
    pctx.stroke();
  }

  // Vòng xuyến hoa văn ngôi sao trung tâm (Kaia Star Emblem)
  pctx.fillStyle = '#fef08a';
  pctx.beginPath();
  pctx.arc(512, 512, 140, 0, Math.PI * 2);
  pctx.fill();
  pctx.strokeStyle = '#f59e0b';
  pctx.lineWidth = 8;
  pctx.stroke();

  plazaTex.update();

  const matPlaza = new StandardMaterial('pt-plaza-mat', scene);
  matPlaza.diffuseTexture = plazaTex;
  matPlaza.specularColor = new Color3(0.4, 0.4, 0.45);
  matPlaza.specularPower = 90;
  plazaDisc.material = matPlaza;

  // Dải LED Neon Cyan viền ngoài cùng quảng trường 92m
  const neonRimOuter = MeshBuilder.CreateTorus('pt-plaza-neon-rim', {
    diameter: 91.6,
    thickness: 0.35,
    tessellation: 64,
  }, scene);
  neonRimOuter.position.y = 0.14;
  neonRimOuter.material = makeMat(scene, 'pt-neon-cyan', '#38bdf8', '#00f2fe', 0.8, 128);
  neonRimOuter.parent = plazaRoot;

  // ========================================================
  // 2. TRÁI TIM METAVERSE: ĐÀI PHUN NƯỚC TRUNG TÂM KAIA (GRAND SOCIAL FOUNTAIN)
  // Đường kính 18m, 3 tầng cẩm thạch, tượng cá heo đôi phun nước, bệ đá cho người chơi ngồi câu cá & tụ họp
  // ========================================================
  const fountainRoot = new TransformNode('pt-grand-central-fountain', scene);
  fountainRoot.position.set(0, 0, 0);
  fountainRoot.parent = plazaRoot;

  const matsFountain = {
    marbleWhite: makeMat(scene, 'fountain-marble-white', '#ffffff', null, 0.6, 90),
    marbleGold: makeMat(scene, 'fountain-marble-gold', '#fbbf24', '#f59e0b', 0.7, 100),
    crystalWater: makeMat(scene, 'fountain-crystal-water', '#38bdf8', '#0284c7', 0.85, 120),
    dolphinGlass: makeMat(scene, 'fountain-dolphin-glass', '#67e8f9', '#06b6d4', 0.9, 128),
  };
  matsFountain.crystalWater.alpha = 0.82;
  matsFountain.dolphinGlass.alpha = 0.88;

  // Tầng 1: Hồ chính đường kính 18m
  const pool1 = MeshBuilder.CreateCylinder('fountain-pool-1', { diameter: 18.0, height: 0.9, tessellation: 48 }, scene);
  pool1.position.y = 0.45;
  pool1.material = matsFountain.marbleWhite;
  pool1.parent = fountainRoot;
  shadows?.addShadowCaster(pool1);

  // Bệ đá tròn viền hồ để người chơi ngồi câu cá & trò chuyện
  const poolRim1 = MeshBuilder.CreateTorus('fountain-rim-1', { diameter: 18.0, thickness: 0.7, tessellation: 48 }, scene);
  poolRim1.position.y = 0.9;
  poolRim1.material = matsFountain.marbleWhite;
  poolRim1.parent = fountainRoot;

  const water1 = MeshBuilder.CreateCylinder('fountain-water-1', { diameter: 16.8, height: 0.1, tessellation: 48 }, scene);
  water1.position.y = 0.8;
  water1.material = matsFountain.crystalWater;
  water1.parent = fountainRoot;

  // Tầng 2: Bồn giữa đường kính 10.5m
  const col1 = MeshBuilder.CreateCylinder('fountain-col-1', { diameter: 3.4, height: 1.8, tessellation: 24 }, scene);
  col1.position.y = 1.7;
  col1.material = matsFountain.marbleGold;
  col1.parent = fountainRoot;

  const pool2 = MeshBuilder.CreateCylinder('fountain-pool-2', { diameter: 10.5, height: 0.75, tessellation: 36 }, scene);
  pool2.position.y = 2.45;
  pool2.material = matsFountain.marbleWhite;
  pool2.parent = fountainRoot;
  shadows?.addShadowCaster(pool2);

  const water2 = MeshBuilder.CreateCylinder('fountain-water-2', { diameter: 9.6, height: 0.1, tessellation: 36 }, scene);
  water2.position.y = 2.8;
  water2.material = matsFountain.crystalWater;
  water2.parent = fountainRoot;

  // Tầng 3: Bồn đỉnh đường kính 5.2m
  const col2 = MeshBuilder.CreateCylinder('fountain-col-2', { diameter: 2.2, height: 1.6, tessellation: 20 }, scene);
  col2.position.y = 3.5;
  col2.material = matsFountain.marbleGold;
  col2.parent = fountainRoot;

  const pool3 = MeshBuilder.CreateCylinder('fountain-pool-3', { diameter: 5.2, height: 0.65, tessellation: 24 }, scene);
  pool3.position.y = 4.2;
  pool3.material = matsFountain.marbleWhite;
  pool3.parent = fountainRoot;

  // Tượng Cá Heo Đôi Pha Lê Xanh phun nước vươn mình lên đỉnh tháp
  const dolphinGroup = new TransformNode('fountain-dolphins', scene);
  dolphinGroup.position.set(0, 5.0, 0);
  dolphinGroup.parent = fountainRoot;

  [-0.45, 0.45].forEach((dx, didx) => {
    const dolphin = MeshBuilder.CreateSphere(`dolphin-${didx}`, { diameterX: 0.9, diameterY: 1.8, diameterZ: 0.9, segments: 12 }, scene);
    dolphin.position.set(dx, 0.8, 0);
    dolphin.rotation.z = didx === 0 ? 0.35 : -0.35;
    dolphin.material = matsFountain.dolphinGlass;
    dolphin.parent = dolphinGroup;
  });

  // Hạt nước phun trào lấp lánh (Particle Water Cascade)
  const sprayEmitter = new TransformNode('fountain-spray-emitter', scene);
  sprayEmitter.position.set(0, 6.8, 0);
  sprayEmitter.parent = fountainRoot;

  const spray = new ParticleSystem('fountain-particles', 120, scene);
  spray.particleTexture = new Texture('/models/nature/plant_bush.glb', scene);
  spray.emitter = sprayEmitter;
  spray.minEmitBox = new Vector3(-0.3, 0, -0.3);
  spray.maxEmitBox = new Vector3(0.3, 0.1, 0.3);
  spray.color1 = new Color4(0.8, 0.95, 1.0, 0.85);
  spray.color2 = new Color4(0.3, 0.85, 1.0, 0.5);
  spray.colorDead = new Color4(0.1, 0.5, 0.9, 0.0);
  spray.minSize = 0.25;
  spray.maxSize = 0.65;
  spray.minLifeTime = 1.0;
  spray.maxLifeTime = 2.2;
  spray.emitRate = 60;
  spray.gravity = new Vector3(0, -9.81, 0);
  spray.direction1 = new Vector3(-2.2, 5.5, -2.2);
  spray.direction2 = new Vector3(2.2, 6.2, 2.2);
  spray.start();

  // ========================================================
  // 3. MEGA VENUE 1: 👗 TRENDY FASHION MALL (THIÊN ĐƯỜNG THỜI TRANG & CATWALK)
  // Tọa lạc tại Đông Nam (x: 29, z: -25), venue: 'fashion'
  // ========================================================
  const fashionRoot = new TransformNode('venue-fashion-boutique-modern', scene);
  fashionRoot.metadata = { venue: 'fashion' };
  fashionRoot.position.set(29, 0, -25);
  fashionRoot.rotation.y = -Math.PI * 0.25 - 0.1;
  fashionRoot.parent = plazaRoot;

  const matsFashion = {
    facadeWhite: makeMat(scene, 'fashion-white', '#ffffff', null, 0.6, 90),
    roseGold: makeMat(scene, 'fashion-rose-gold', '#fb7185', '#f43f5e', 0.8, 120),
    glassPink: makeMat(scene, 'fashion-glass-pink', '#fce7f3', '#f43f5e', 0.9, 128),
    catwalkGlow: makeMat(scene, 'fashion-catwalk-glow', '#f472b6', '#ec4899', 0.8, 100),
    trimChrome: makeMat(scene, 'fashion-chrome', '#f1f5f9', null, 0.85, 120),
  };
  matsFashion.glassPink.alpha = 0.85;

  // Khối đế đá hoa cương nâng cao 0.5m
  const fashionPlinth = MeshBuilder.CreateBox('fashion-plinth', { width: 17.0, height: 0.5, depth: 13.0 }, scene);
  fashionPlinth.position.y = 0.25;
  fashionPlinth.material = matsFashion.facadeWhite;
  fashionPlinth.parent = fashionRoot;
  fashionPlinth.receiveShadows = true;

  // Thân chính 2 tầng kính cong thời thượng
  const fashionBody = MeshBuilder.CreateBox('fashion-body', { width: 16.0, height: 8.5, depth: 12.0 }, scene);
  fashionBody.position.y = 4.6;
  fashionBody.material = matsFashion.facadeWhite;
  fashionBody.parent = fashionRoot;
  shadows?.addShadowCaster(fashionBody);

  // Đại sảnh vách kính Panoramic màu hồng cánh sen phát sáng
  const fashionGlass = MeshBuilder.CreateBox('fashion-glass-facade', { width: 13.5, height: 6.8, depth: 0.3 }, scene);
  fashionGlass.position.set(0, 4.2, 6.1);
  fashionGlass.material = matsFashion.glassPink;
  fashionGlass.parent = fashionRoot;

  // Mái đón Canopy bay vòm cong khí động học viền Rose Gold
  const fashionCanopy = MeshBuilder.CreateCylinder('fashion-canopy', { diameter: 10.5, height: 0.45, tessellation: 36 }, scene);
  fashionCanopy.scaling.set(1.4, 1.0, 0.8);
  fashionCanopy.position.set(0, 6.2, 7.5);
  fashionCanopy.material = matsFashion.roseGold;
  fashionCanopy.parent = fashionRoot;
  shadows?.addShadowCaster(fashionCanopy);

  // Sàn Catwalk phát sáng dẫn thẳng vào cửa
  const catwalk = MeshBuilder.CreateBox('fashion-catwalk', { width: 4.8, height: 0.22, depth: 7.5 }, scene);
  catwalk.position.set(0, 0.28, 7.8);
  catwalk.material = matsFashion.catwalkGlow;
  catwalk.parent = fashionRoot;

  // 2 Bệ kính tròn xoay 3D trưng bày ma-nơ-canh thời trang hai bên
  [-4.2, 4.2].forEach((px, idx) => {
    const ped = MeshBuilder.CreateCylinder(`fashion-pedestal-${idx}`, { diameter: 2.4, height: 0.6, tessellation: 24 }, scene);
    ped.position.set(px, 0.55, 6.8);
    ped.material = matsFashion.trimChrome;
    ped.parent = fashionRoot;

    // Ma-nơ-canh Chibi cách điệu trên bệ xoay
    const mannequin = MeshBuilder.CreateSphere(`fashion-model-${idx}`, { diameterX: 0.8, diameterY: 1.6, diameterZ: 0.8, segments: 10 }, scene);
    mannequin.position.set(px, 1.7, 6.8);
    mannequin.material = matsFashion.roseGold;
    mannequin.parent = fashionRoot;
  });

  createNeonMarqueeSign(scene, 'FASHION MALL', 'Trendy Outfits & Salon', '#f43f5e', fashionRoot, 10.4);

  // ========================================================
  // 4. MEGA VENUE 2: 🎰 GRAND NEON ARCADE & CASINO LOUNGE (CUNG ĐIỆN TRÒ CHƠI)
  // Tọa lạc tại Tây Nam (x: -29, z: -25), venue: 'casino'
  // ========================================================
  const casinoRoot = new TransformNode('venue-casino-modern', scene);
  casinoRoot.metadata = { venue: 'casino' };
  casinoRoot.position.set(-29, 0, -25);
  casinoRoot.rotation.y = Math.PI * 0.25 + 0.1;
  casinoRoot.parent = plazaRoot;

  const matsCasino = {
    purpleRoyal: makeMat(scene, 'casino-purple', '#4c1d95', '#6d28d9', 0.7, 90),
    goldChrome: makeMat(scene, 'casino-gold', '#facc15', '#f59e0b', 0.9, 128),
    glassNeon: makeMat(scene, 'casino-glass-cyan', '#0284c7', '#38bdf8', 0.85, 120),
    diceWhite: makeMat(scene, 'casino-dice-white', '#ffffff', '#fef08a', 0.8, 100),
    diceDot: makeMat(scene, 'casino-dice-dot', '#dc2626', '#b91c1c', 0.9),
  };
  matsCasino.glassNeon.alpha = 0.85;

  const casinoPlinth = MeshBuilder.CreateBox('casino-plinth', { width: 17.0, height: 0.5, depth: 13.0 }, scene);
  casinoPlinth.position.y = 0.25;
  casinoPlinth.material = matsCasino.purpleRoyal;
  casinoPlinth.parent = casinoRoot;
  casinoPlinth.receiveShadows = true;

  const casinoBody = MeshBuilder.CreateBox('casino-body', { width: 16.0, height: 8.8, depth: 12.0 }, scene);
  casinoBody.position.y = 4.75;
  casinoBody.material = matsCasino.purpleRoyal;
  casinoBody.parent = casinoRoot;
  shadows?.addShadowCaster(casinoBody);

  // Vòm cửa kính Cyber-Deco cao lớn
  const casinoGlass = MeshBuilder.CreateBox('casino-glass-facade', { width: 13.5, height: 7.0, depth: 0.3 }, scene);
  casinoGlass.position.set(0, 4.4, 6.1);
  casinoGlass.material = matsCasino.glassNeon;
  casinoGlass.parent = casinoRoot;

  // Cột viền kim loại vàng kim hoàng gia
  [-6.8, 6.8].forEach((cx, idx) => {
    const col = MeshBuilder.CreateCylinder(`casino-gold-col-${idx}`, { diameter: 0.8, height: 9.0, tessellation: 16 }, scene);
    col.position.set(cx, 4.75, 6.2);
    col.material = matsCasino.goldChrome;
    col.parent = casinoRoot;
    shadows?.addShadowCaster(col);
  });

  // KHỐI XÚC XẮC 3D NEON KHỔNG LỒ XOAY TRÊN NÓC
  const diceRoot = new TransformNode('casino-giant-dice-spinner', scene);
  diceRoot.position.set(0, 11.8, 0);
  diceRoot.parent = casinoRoot;

  const giantDice = MeshBuilder.CreateBox('giant-dice-cube', { size: 3.4 }, scene);
  giantDice.material = matsCasino.diceWhite;
  giantDice.parent = diceRoot;
  shadows?.addShadowCaster(giantDice);

  // Các chấm tròn đỏ nổi bật trên mặt xúc xắc
  const dot1 = MeshBuilder.CreateSphere('dice-dot-front', { diameter: 0.8, segments: 10 }, scene);
  dot1.position.set(0, 0, 1.72);
  dot1.material = matsCasino.diceDot;
  dot1.parent = giantDice;

  // Đồng xu vàng kim xoay tròn bên cạnh xúc xắc
  const goldCoin = MeshBuilder.CreateCylinder('casino-giant-coin', { diameter: 2.8, height: 0.4, tessellation: 32 }, scene);
  goldCoin.rotation.z = Math.PI / 2;
  goldCoin.position.set(3.4, 0, 0);
  goldCoin.material = matsCasino.goldChrome;
  goldCoin.parent = diceRoot;

  createNeonMarqueeSign(scene, 'GAME & CASINO', 'Lucky Spin · Dice · Arcades', '#fbbf24', casinoRoot, 10.4);

  // ========================================================
  // 5. MEGA VENUE 3: 🛒 SUPER AGRI-MART & GREEN CENTER (SIÊU THỊ VẬT TƯ & HẠT GIỐNG)
  // Tọa lạc tại Đông Bắc (x: 29, z: 25), venue: 'supplies'
  // ========================================================
  const martRoot = new TransformNode('venue-agri-mall-modern', scene);
  martRoot.metadata = { venue: 'supplies' };
  martRoot.position.set(29, 0, 25);
  martRoot.rotation.y = -Math.PI * 0.75 + 0.1;
  martRoot.parent = plazaRoot;

  const matsMart = {
    pureWhite: makeMat(scene, 'mart-white', '#ffffff', null, 0.5, 80),
    mintGreen: makeMat(scene, 'mart-mint-green', '#22c55e', '#4ade80', 0.7, 100),
    glassGreen: makeMat(scene, 'mart-glass-green', '#dcfce7', '#22c55e', 0.85, 120),
    metalChrome: makeMat(scene, 'mart-chrome', '#e2e8f0', null, 0.85, 120),
    orangeFruit: makeMat(scene, 'mart-orange-crate', '#ea580c', '#f97316', 0.4),
  };
  matsMart.glassGreen.alpha = 0.85;

  const martPlinth = MeshBuilder.CreateBox('mart-plinth', { width: 17.0, height: 0.5, depth: 13.0 }, scene);
  martPlinth.position.y = 0.25;
  martPlinth.material = matsMart.pureWhite;
  martPlinth.parent = martRoot;
  martPlinth.receiveShadows = true;

  const martBody = MeshBuilder.CreateBox('mart-body', { width: 16.0, height: 8.5, depth: 12.0 }, scene);
  martBody.position.y = 4.6;
  martBody.material = matsMart.pureWhite;
  martBody.parent = martRoot;
  shadows?.addShadowCaster(martBody);

  const martGlass = MeshBuilder.CreateBox('mart-glass-facade', { width: 13.5, height: 6.8, depth: 0.3 }, scene);
  martGlass.position.set(0, 4.2, 6.1);
  martGlass.material = matsMart.glassGreen;
  martGlass.parent = martRoot;

  // Dải LED xanh Mint chạy viền quanh mái
  const martRoofBand = MeshBuilder.CreateBox('mart-roof-band', { width: 16.6, height: 0.6, depth: 12.6 }, scene);
  martRoofBand.position.set(0, 8.8, 0);
  martRoofBand.material = matsMart.mintGreen;
  martRoofBand.parent = martRoot;

  // Hàng xe đẩy siêu thị mạ chrome xếp hàng trước cửa (Shopping Carts)
  [-3.8, -2.4, -1.0].forEach((cx, idx) => {
    const cart = MeshBuilder.CreateBox(`shopping-cart-${idx}`, { width: 0.9, height: 0.9, depth: 1.2 }, scene);
    cart.position.set(cx, 0.65, 7.2);
    cart.material = matsMart.metalChrome;
    cart.parent = martRoot;
  });

  // Kệ trưng bày sọt trái cây & hạt giống tươi mới
  [2.2, 4.2].forEach((kx, kidx) => {
    const stand = MeshBuilder.CreateBox(`fruit-stand-${kidx}`, { width: 1.4, height: 1.0, depth: 1.2 }, scene);
    stand.position.set(kx, 0.7, 7.2);
    stand.material = matsMart.mintGreen;
    stand.parent = martRoot;

    const fruit = MeshBuilder.CreateSphere(`fruit-bulk-${kidx}`, { diameter: 0.9, segments: 8 }, scene);
    fruit.position.set(kx, 1.4, 7.2);
    fruit.material = matsMart.orangeFruit;
    fruit.parent = martRoot;
  });

  createNeonMarqueeSign(scene, 'SUPER AGRI-MART', 'Seeds · Supplies · Produce', '#22c55e', martRoot, 10.4);

  // ========================================================
  // 6. MEGA VENUE 4: 🏎️ MOTORS & MOBILITY SHOWROOM (SHOWROOM SIÊU XE & XE ĐẠP)
  // Tọa lạc tại Tây Bắc (x: -29, z: 25), venue: 'vehicles'
  // ========================================================
  const vehicleRoot = new TransformNode('venue-vehicle-dealer-modern', scene);
  vehicleRoot.metadata = { venue: 'vehicles' };
  vehicleRoot.position.set(-29, 0, 25);
  vehicleRoot.rotation.y = Math.PI * 0.75 - 0.1;
  vehicleRoot.parent = plazaRoot;

  const matsMotor = {
    darkCharcoal: makeMat(scene, 'motor-charcoal', '#0f172a', null, 0.6, 90),
    cyanElectric: makeMat(scene, 'motor-cyan', '#00f2fe', '#38bdf8', 0.9, 128),
    glassBlue: makeMat(scene, 'motor-glass', '#bae6fd', '#0284c7', 0.9, 128),
    carRed: makeMat(scene, 'motor-car-red', '#ef4444', '#dc2626', 0.8, 120),
  };
  matsMotor.glassBlue.alpha = 0.85;

  const motorPlinth = MeshBuilder.CreateBox('motor-plinth', { width: 17.0, height: 0.5, depth: 13.0 }, scene);
  motorPlinth.position.y = 0.25;
  motorPlinth.material = matsMotor.darkCharcoal;
  motorPlinth.parent = vehicleRoot;
  motorPlinth.receiveShadows = true;

  const motorBody = MeshBuilder.CreateBox('motor-body', { width: 16.0, height: 8.5, depth: 12.0 }, scene);
  motorBody.position.y = 4.6;
  motorBody.material = matsMotor.darkCharcoal;
  motorBody.parent = vehicleRoot;
  shadows?.addShadowCaster(motorBody);

  const motorGlass = MeshBuilder.CreateBox('motor-glass-facade', { width: 13.5, height: 6.8, depth: 0.3 }, scene);
  motorGlass.position.set(0, 4.2, 6.1);
  motorGlass.material = matsMotor.glassBlue;
  motorGlass.parent = vehicleRoot;

  // Dải cánh gió thể thao trên mái viền LED Cyan
  const spoilerWing = MeshBuilder.CreateBox('motor-spoiler', { width: 16.6, height: 0.5, depth: 2.2 }, scene);
  spoilerWing.position.set(0, 9.2, 5.2);
  spoilerWing.material = matsMotor.cyanElectric;
  spoilerWing.parent = vehicleRoot;

  // BỆ XOAY TURNTABLE 3D TRƯNG BÀY XE HƠI THỂ THAO
  const turntable = MeshBuilder.CreateCylinder('motor-turntable', { diameter: 4.8, height: 0.25, tessellation: 32 }, scene);
  turntable.position.set(0, 0.3, 7.5);
  turntable.material = matsMotor.cyanElectric;
  turntable.parent = vehicleRoot;

  // Mô hình xe thể thao Chibi khí động học trên bệ xoay
  const carBody = MeshBuilder.CreateBox('motor-show-car', { width: 2.2, height: 0.85, depth: 3.4 }, scene);
  carBody.position.set(0, 0.85, 7.5);
  carBody.material = matsMotor.carRed;
  carBody.parent = vehicleRoot;
  shadows?.addShadowCaster(carBody);

  const carCockpit = MeshBuilder.CreateSphere('motor-car-cockpit', { diameterX: 1.8, diameterY: 1.2, diameterZ: 1.8, segments: 10 }, scene);
  carCockpit.position.set(0, 1.35, 7.3);
  carCockpit.material = matsMotor.glassBlue;
  carCockpit.parent = vehicleRoot;

  createNeonMarqueeSign(scene, 'MOTOR SHOWROOM', 'Supercars · Scooters · Rides', '#00f2fe', vehicleRoot, 10.4);

  // ========================================================
  // 7. MEGA VENUE 5: 🎣 MARINA PRO FISHING TACKLE & AQUARIUM (CỬA HÀNG ĐỒ CÂU BẾN THUYỀN)
  // Tọa lạc tại bến nước Nam (x: 0, z: 32), venue: 'fishing'
  // ========================================================
  const fishingRoot = new TransformNode('venue-fishing-tackle-wharf', scene);
  fishingRoot.metadata = { venue: 'fishing' };
  fishingRoot.position.set(0, 0, 32);
  fishingRoot.rotation.y = Math.PI;
  fishingRoot.parent = plazaRoot;

  const matsFishing = {
    marineTeak: makeMat(scene, 'fishing-teak', '#b45309', null, 0.4, 60),
    oceanBlue: makeMat(scene, 'fishing-ocean-blue', '#0284c7', '#38bdf8', 0.8, 110),
    neonMarlin: makeMat(scene, 'fishing-neon-marlin', '#00f2fe', '#38bdf8', 0.95, 128),
    tankGlass: makeMat(scene, 'fishing-aquarium-glass', '#bae6fd', '#0284c7', 0.9, 128),
    tackleChrome: makeMat(scene, 'fishing-rod-chrome', '#f8fafc', null, 0.85, 120),
  };
  matsFishing.tankGlass.alpha = 0.82;

  // Sàn gỗ du thuyền Teak nâng cao 0.5m
  const fishingPlinth = MeshBuilder.CreateBox('fishing-wharf-deck', { width: 17.0, height: 0.5, depth: 13.0 }, scene);
  fishingPlinth.position.y = 0.25;
  fishingPlinth.material = matsFishing.marineTeak;
  fishingPlinth.parent = fishingRoot;
  fishingPlinth.receiveShadows = true;

  const fishingBody = MeshBuilder.CreateBox('fishing-body', { width: 16.0, height: 8.5, depth: 12.0 }, scene);
  fishingBody.position.y = 4.6;
  fishingBody.material = matsFishing.oceanBlue;
  fishingBody.parent = fishingRoot;
  shadows?.addShadowCaster(fishingBody);

  const fishingGlass = MeshBuilder.CreateBox('fishing-glass-facade', { width: 13.5, height: 6.8, depth: 0.3 }, scene);
  fishingGlass.position.set(0, 4.2, 6.1);
  fishingGlass.material = matsFishing.tankGlass;
  fishingGlass.parent = fishingRoot;

  // TƯỢNG CÁ KIẾM (MARLIN) 3D PHÁT SÁNG NEON KHỔNG LỒ TRÊN NÓC
  const marlinRoot = new TransformNode('marlin-statue-root', scene);
  marlinRoot.position.set(0, 10.6, 5.0);
  marlinRoot.parent = fishingRoot;

  const marlinBody = MeshBuilder.CreateCylinder('marlin-body', { diameterTop: 0.3, diameterBottom: 1.4, height: 4.8, tessellation: 16 }, scene);
  marlinBody.rotation.z = Math.PI / 3;
  marlinBody.material = matsFishing.neonMarlin;
  marlinBody.parent = marlinRoot;

  const marlinSword = MeshBuilder.CreateCylinder('marlin-sword', { diameterTop: 0.05, diameterBottom: 0.3, height: 2.2, tessellation: 10 }, scene);
  marlinSword.rotation.z = Math.PI / 3;
  marlinSword.position.set(2.4, 1.4, 0);
  marlinSword.material = matsFishing.tackleChrome;
  marlinSword.parent = marlinRoot;

  // BỂ CÁ THỦY SINH ĐẠI DƯƠNG TRƯỚC SẢNH BẾN THUYỀN
  const aquariumTank = MeshBuilder.CreateBox('fishing-live-aquarium', { width: 4.5, height: 1.8, depth: 1.4 }, scene);
  aquariumTank.position.set(4.2, 1.2, 7.2);
  aquariumTank.material = matsFishing.tankGlass;
  aquariumTank.parent = fishingRoot;

  // Giá cắm các dòng cần câu máy Carbon Pro
  [-4.2, -2.4].forEach((rx, ridx) => {
    const rack = MeshBuilder.CreateBox(`tackle-rack-${ridx}`, { width: 1.4, height: 1.6, depth: 0.8 }, scene);
    rack.position.set(rx, 1.0, 7.2);
    rack.material = matsFishing.marineTeak;
    rack.parent = fishingRoot;

    // 3 Cần câu máy vươn cao
    [-0.4, 0, 0.4].forEach((cx, cidx) => {
      const rod = MeshBuilder.CreateCylinder(`rod-display-${ridx}-${cidx}`, { diameterTop: 0.04, diameterBottom: 0.1, height: 3.6, tessellation: 8 }, scene);
      rod.position.set(rx + cx, 2.5, 7.2);
      rod.rotation.z = 0.15;
      rod.material = matsFishing.tackleChrome;
      rod.parent = fishingRoot;
    });
  });

  createNeonMarqueeSign(scene, 'PRO FISHING TACKLE', 'Rods · Baits · Live Marine Fish', '#38bdf8', fishingRoot, 10.4);

  // ========================================================
  // 8. QUY HOẠCH CÁC LÔ ĐẤT MỞ RỘNG TƯƠNG LAI (FUTURE EXPANSION LOTS)
  // Hai phân khu đối xứng Đông - Tây (x: ±42, z: 0) lát granite, viền LED âm sàn, bảng holographic
  // ========================================================
  const matExpFloor = makeMat(scene, 'exp-floor-granite', '#1e293b', null, 0.5, 80);
  const matExpNeon = makeMat(scene, 'exp-neon-amber', '#f59e0b', '#fbbf24', 0.85, 120);
  const matExpBollard = makeMat(scene, 'exp-bollard-chrome', '#f8fafc', null, 0.8, 120);

  [-42, 42].forEach((ex, eidx) => {
    const expRoot = new TransformNode(`expansion-lot-${eidx}`, scene);
    expRoot.position.set(ex, 0, 0);
    expRoot.parent = plazaRoot;

    // Sàn mặt bằng san nền đá hoa cương hiện đại
    const groundPlot = MeshBuilder.CreateCylinder(`exp-ground-${eidx}`, { diameter: 16.0, height: 0.1, tessellation: 36 }, scene);
    groundPlot.position.y = 0.05;
    groundPlot.material = matExpFloor;
    groundPlot.receiveShadows = true;
    groundPlot.parent = expRoot;

    // Vành đai LED âm sàn phát sáng màu vàng hổ phách
    const ringNeon = MeshBuilder.CreateTorus(`exp-neon-ring-${eidx}`, { diameter: 15.6, thickness: 0.22, tessellation: 36 }, scene);
    ringNeon.position.y = 0.12;
    ringNeon.material = matExpNeon;
    ringNeon.parent = expRoot;

    // Hàng cột trụ mạ chrome thông minh bảo vệ chỉ giới quy hoạch
    const numBollards = 8;
    for (let b = 0; b < numBollards; b++) {
      const angle = (b * Math.PI * 2) / numBollards;
      const bx = Math.cos(angle) * 7.5;
      const bz = Math.sin(angle) * 7.5;

      const bollard = MeshBuilder.CreateCylinder(`exp-bollard-${eidx}-${b}`, { diameter: 0.25, height: 1.0, tessellation: 12 }, scene);
      bollard.position.set(bx, 0.55, bz);
      bollard.material = matExpBollard;
      bollard.parent = expRoot;
      shadows?.addShadowCaster(bollard);
    }

    createNeonMarqueeSign(
      scene,
      eidx === 0 ? 'TÂY METAVERSE' : 'ĐÔNG METAVERSE',
      'Khu Quy Hoạch Mở Rộng Sau Này',
      '#fbbf24',
      expRoot,
      3.8
    );
  });

  // ========================================================
  // 9. HỆ THỐNG ĐÈN ĐƯỜNG ĐÔ THỊ HIỆN ĐẠI (TWIN MODERN STREETLAMPS)
  // ========================================================
  const matStreetLamp = makeMat(scene, 'pt-street-lamp-post', '#0f172a', null, 0.6, 90);
  const matStreetGlow = makeMat(scene, 'pt-street-lamp-glow', '#fef08a', '#facc15', 0.95, 128);

  [
    { x: -18, z: -18 },
    { x: 18, z: -18 },
    { x: -18, z: 18 },
    { x: 18, z: 18 },
    { x: 0, z: -32 },
  ].forEach((pos, idx) => {
    const post = MeshBuilder.CreateCylinder(`pt-lamp-post-${idx}`, { height: 5.6, diameterTop: 0.16, diameterBottom: 0.26, tessellation: 14 }, scene);
    post.position.set(pos.x, 2.8, pos.z);
    post.material = matStreetLamp;
    post.parent = plazaRoot;
    shadows?.addShadowCaster(post);

    // Cánh tay đôi uốn cong mạ đen bóng
    [-1, 1].forEach((side, sidx) => {
      const arm = MeshBuilder.CreateBox(`pt-lamp-arm-${idx}-${sidx}`, { width: 0.9, height: 0.14, depth: 0.14 }, scene);
      arm.position.set(pos.x + side * 0.45, 5.4, pos.z);
      arm.material = matStreetLamp;
      arm.parent = plazaRoot;

      const lightBulb = MeshBuilder.CreateSphere(`pt-lamp-bulb-${idx}-${sidx}`, { diameter: 0.6, segments: 10 }, scene);
      lightBulb.position.set(pos.x + side * 0.9, 5.2, pos.z);
      lightBulb.material = matStreetGlow;
      lightBulb.parent = plazaRoot;
    });
  });

  // Hoạt hình xoay xúc xắc casino & turntable xe hơi
  scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    if (diceRoot) diceRoot.rotation.y += dt * 0.5;
    if (turntable) turntable.rotation.y += dt * 0.4;
    if (carBody) carBody.rotation.y += dt * 0.4;
    if (carCockpit) carCockpit.rotation.y += dt * 0.4;
  });

  return {
    root: plazaRoot,
    fountain: fountainRoot,
  };
}
