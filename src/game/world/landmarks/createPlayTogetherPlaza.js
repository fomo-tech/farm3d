import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial } from '../../rendering/PlayTogetherTheme.js';
import {
  createMarshmallowTree,
  createCandyFlowerBush,
  createCandyPebbleRock,
} from '../createPlayTogetherProps.js';

/**
 * Tạo nhãn biển hiệu Pop-art chuẩn Play Together
 */
function createPopArtVenueSign(scene, title, icon, colorHex, parent, yPos = 8.4) {
  const dt = new DynamicTexture(`sign-tex-${title}`, { width: 1024, height: 280 }, scene, true);
  dt.hasAlpha = true;
  const ctx = dt.getContext();
  ctx.clearRect(0, 0, 1024, 280);

  // Khung biển hiệu màu trắng kem bo tròn góc lớn (Chunky Pill Shape)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(16, 16, 992, 248, 56);
  ctx.fill();

  // Viền ngoài màu kẹo neon nổi bật
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 16;
  ctx.stroke();

  // Viền chỉ vàng lót phía trong
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(36, 36, 952, 208, 42);
  ctx.stroke();

  // Icon và Tên cửa hàng
  dt.drawText(`${icon} ${title}`, null, 172, '900 76px "Segoe UI", "Nunito", Arial, sans-serif', '#1e293b', null, true, true);

  const mat = new StandardMaterial(`sign-mat-${title}`, scene);
  mat.diffuseTexture = dt;
  mat.opacityTexture = dt;
  mat.emissiveColor = Color3.FromHexString(colorHex).scale(0.35);
  mat.disableLighting = true;

  const plane = MeshBuilder.CreatePlane(`sign-plane-${title}`, { width: 9.6, height: 2.6 }, scene);
  plane.position.set(0, yPos, 0);
  plane.material = mat;
  plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
  plane.isPickable = false;
  plane.parent = parent;

  return plane;
}

/**
 * TẠO TOÀN DIỆN QUẢNG TRƯỜNG PLAY TOGETHER (CENTRAL PLAZA REDESIGN)
 */
export function createPlayTogetherPlaza(scene, shadows, foliage) {
  const plazaRoot = new TransformNode('play-together-central-plaza', scene);

  // ========================================================
  // 1. MẶT BẰNG QUẢNG TRƯỜNG TRÒN KHỔNG LỒ (GRAND PLAZA DISC)
  // ========================================================
  // Đĩa tròn đường kính 86m lát gạch hoa cúc màu kem pastel, viền xanh mint và caramel
  const plazaDisc = MeshBuilder.CreateCylinder('plaza-grand-disc', {
    diameter: 86,
    height: 0.05,
    tessellation: 64,
  }, scene);
  plazaDisc.position.set(0, 0.025, 0);
  plazaDisc.parent = plazaRoot;
  plazaDisc.receiveShadows = true;

  const plazaMat = createToyMaterial(scene, 'plaza-biscuit-mat', '#fffdf5', {
    specularPower: 48,
    specularLevel: 0.35,
    ambientBoost: 0.55,
  });

  // Vẽ họa tiết hoa cúc và vòng tròn đồng tâm pastel lên mặt sàn quảng trường
  const plazaTex = new DynamicTexture('plaza-pattern-tex', 1024, scene, true);
  const pctx = plazaTex.getContext();
  pctx.fillStyle = '#fffdf0'; // Nền kem bơ tươi sáng
  pctx.fillRect(0, 0, 1024, 1024);

  // Vành đai ngoài màu xanh mint pastel
  pctx.strokeStyle = '#a7f3d0';
  pctx.lineWidth = 36;
  pctx.beginPath();
  pctx.arc(512, 512, 480, 0, Math.PI * 2);
  pctx.stroke();

  // Vành đai giữa màu cam đào pastel
  pctx.strokeStyle = '#fed7aa';
  pctx.lineWidth = 20;
  pctx.beginPath();
  pctx.arc(512, 512, 380, 0, Math.PI * 2);
  pctx.stroke();

  // Vòng tròn trong màu hồng phấn
  pctx.strokeStyle = '#fbcfe8';
  pctx.lineWidth = 14;
  pctx.beginPath();
  pctx.arc(512, 512, 240, 0, Math.PI * 2);
  pctx.stroke();

  // Họa tiết hoa cúc pastel 8 cánh quanh tâm
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const hx = 512 + Math.cos(angle) * 310;
    const hy = 512 + Math.sin(angle) * 310;

    pctx.fillStyle = '#fef08a';
    pctx.beginPath();
    pctx.arc(hx, hy, 28, 0, Math.PI * 2);
    pctx.fill();

    pctx.fillStyle = '#f59e0b';
    pctx.beginPath();
    pctx.arc(hx, hy, 12, 0, Math.PI * 2);
    pctx.fill();
  }

  plazaTex.update();
  plazaMat.diffuseTexture = plazaTex;
  plazaDisc.material = plazaMat;

  // ========================================================
  // 2. ĐÀI PHUN NƯỚC BÁNH KEM 3 TẦNG CHUẨN PLAY TOGETHER
  // ========================================================
  const fountainRoot = new TransformNode('sweet-cake-fountain', scene);
  fountainRoot.position.set(0, 0, 0);
  fountainRoot.parent = plazaRoot;

  const matCream = createToyMaterial(scene, 'fountain-cream', '#ffffff');
  const matStrawberry = createToyMaterial(scene, 'fountain-strawberry', '#f472b6');
  const matVanilla = createToyMaterial(scene, 'fountain-vanilla', '#fef08a');
  const matWaterCyan = createToyMaterial(scene, 'fountain-water-cyan', '#38bdf8', {
    emissiveHex: '#0284c7',
    specularPower: 96,
  });
  matWaterCyan.alpha = 0.85;

  // Tầng 1: Đáy bể tròn đường kính 10.5m
  const basePool = MeshBuilder.CreateCylinder('fountain-base-pool', {
    diameter: 10.5,
    height: 0.7,
    tessellation: 48,
  }, scene);
  basePool.position.y = 0.35;
  basePool.material = matCream;
  basePool.parent = fountainRoot;
  basePool.receiveShadows = true;
  shadows?.addShadowCaster(basePool);

  // Gờ vòm bo tròn mềm mại cho miệng bể (Torus Rim)
  const poolRim = MeshBuilder.CreateTorus('fountain-pool-rim', {
    diameter: 10.5,
    thickness: 0.35,
    tessellation: 40,
  }, scene);
  poolRim.position.y = 0.7;
  poolRim.material = matStrawberry;
  poolRim.parent = fountainRoot;

  // Mặt nước hồ đáy xanh ngọc lam
  const poolWater = MeshBuilder.CreateCylinder('fountain-pool-water', {
    diameter: 9.8,
    height: 0.1,
    tessellation: 40,
  }, scene);
  poolWater.position.y = 0.62;
  poolWater.material = matWaterCyan;
  poolWater.parent = fountainRoot;

  // Tầng 2: Bánh kem dâu hồng pastel (Đường kính 6.2m)
  const tier2 = MeshBuilder.CreateCylinder('fountain-tier-2', {
    diameter: 6.2,
    height: 0.85,
    tessellation: 36,
  }, scene);
  tier2.position.y = 1.15;
  tier2.material = matStrawberry;
  tier2.parent = fountainRoot;
  tier2.receiveShadows = true;

  const tier2Rim = MeshBuilder.CreateTorus('fountain-tier-2-rim', {
    diameter: 6.2,
    thickness: 0.28,
    tessellation: 32,
  }, scene);
  tier2Rim.position.y = 1.58;
  tier2Rim.material = matCream;
  tier2Rim.parent = fountainRoot;

  const tier2Water = MeshBuilder.CreateCylinder('fountain-tier-2-water', {
    diameter: 5.6,
    height: 0.08,
    tessellation: 32,
  }, scene);
  tier2Water.position.y = 1.52;
  tier2Water.material = matWaterCyan;
  tier2Water.parent = fountainRoot;

  // Kẹo hạt rắc M&M trang trí quanh tầng 2
  const candyColors = ['#f43f5e', '#38bdf8', '#facc15', '#a855f7', '#4ade80'];
  for (let c = 0; c < 12; c++) {
    const angle = (c * Math.PI * 2) / 12;
    const dot = MeshBuilder.CreateSphere(`fountain-candy-${c}`, { diameter: 0.32, segments: 8 }, scene);
    dot.position.set(Math.cos(angle) * 3.12, 1.15, Math.sin(angle) * 3.12);
    dot.material = createToyMaterial(scene, `candy-color-${c}`, candyColors[c % candyColors.length]);
    dot.parent = fountainRoot;
  }

  // Tầng 3: Bánh kem vani vàng kem (Đường kính 3.4m)
  const tier3 = MeshBuilder.CreateCylinder('fountain-tier-3', {
    diameter: 3.4,
    height: 0.8,
    tessellation: 32,
  }, scene);
  tier3.position.y = 1.95;
  tier3.material = matVanilla;
  tier3.parent = fountainRoot;

  const tier3Rim = MeshBuilder.CreateTorus('fountain-tier-3-rim', {
    diameter: 3.4,
    thickness: 0.22,
    tessellation: 28,
  }, scene);
  tier3Rim.position.y = 2.35;
  tier3Rim.material = matCream;
  tier3Rim.parent = fountainRoot;

  // Đỉnh đài phun nước: NGÔI SAO VÀNG 3D KHỔNG LỒ XOAY TÍT (Chibi Golden Star)
  const starNode = new TransformNode('fountain-star-spinner', scene);
  starNode.position.set(0, 3.4, 0);
  starNode.parent = fountainRoot;

  const starCore = MeshBuilder.CreateSphere('fountain-star-center', { diameter: 1.1, segments: 12 }, scene);
  starCore.material = createToyMaterial(scene, 'fountain-gold-star', '#facc15', { emissiveHex: '#f59e0b' });
  starCore.parent = starNode;

  // 5 Cánh sao mập mạp tròn trĩnh
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const cone = MeshBuilder.CreateCylinder(`fountain-star-point-${i}`, {
      diameterTop: 0.05,
      diameterBottom: 0.65,
      height: 0.85,
      tessellation: 12,
    }, scene);
    cone.rotation.z = angle - Math.PI / 2;
    cone.position.set(Math.cos(angle) * 0.72, Math.sin(angle) * 0.72, 0);
    cone.material = starCore.material;
    cone.parent = starNode;
  }

  // 2 Mắt chớp hoạt hình đáng yêu cho Ngôi sao vàng
  const starEyeL = MeshBuilder.CreateSphere('star-eye-l', { diameter: 0.2, segments: 8 }, scene);
  starEyeL.position.set(-0.22, 0.08, 0.48);
  starEyeL.scaling.set(0.7, 1.2, 0.3);
  starEyeL.material = createToyMaterial(scene, 'star-eye-mat', '#0f172a');
  starEyeL.parent = starNode;

  const starEyeR = MeshBuilder.CreateSphere('star-eye-r', { diameter: 0.2, segments: 8 }, scene);
  starEyeR.position.set(0.22, 0.08, 0.48);
  starEyeR.scaling.set(0.7, 1.2, 0.3);
  starEyeR.material = starEyeL.material;
  starEyeR.parent = starNode;

  // Hệ thống hạt nước phun bồng bềnh lấp lánh (Water Spray Particles)
  const spray = new ParticleSystem('fountain-water-spray', 32, scene);
  const ptex = new DynamicTexture('water-drop-tex', 32, scene, false);
  const pctxDrop = ptex.getContext();
  pctxDrop.fillStyle = '#38bdf8';
  pctxDrop.beginPath();
  pctxDrop.arc(16, 16, 14, 0, Math.PI * 2);
  pctxDrop.fill();
  ptex.update();

  spray.particleTexture = ptex;
  spray.emitter = new Vector3(0, 3.8, 0);
  spray.minEmitBox = new Vector3(-0.3, 0, -0.3);
  spray.maxEmitBox = new Vector3(0.3, 0.2, 0.3);
  spray.color1 = new Color4(0.7, 0.92, 1.0, 0.85);
  spray.color2 = new Color4(0.35, 0.8, 1.0, 0.65);
  spray.colorDead = new Color4(0.35, 0.8, 1.0, 0.0);
  spray.minSize = 0.16;
  spray.maxSize = 0.35;
  spray.minLifeTime = 1.0;
  spray.maxLifeTime = 1.6;
  spray.emitRate = 28;
  spray.gravity = new Vector3(0, -9.81, 0);
  spray.direction1 = new Vector3(-1.2, 3.8, -1.2);
  spray.direction2 = new Vector3(1.2, 4.5, 1.2);
  spray.minEmitPower = 1.5;
  spray.maxEmitPower = 2.5;
  spray.updateSpeed = 0.018;
  spray.start();

  // ========================================================
  // 3. TÒA NHÀ 1: 🍕 TIỆM PIZZA & TRÒ CHƠI (PIZZA & ARCADE)
  // ========================================================
  const pizzaShopRoot = new TransformNode('venue-pizza-shop', scene);
  pizzaShopRoot.metadata = { venue: 'casino' }; // Gắn vào minigame cược / casino
  pizzaShopRoot.position.set(-27, 0, 20);
  pizzaShopRoot.rotation.y = Math.PI / 4 + 0.15; // Hướng vào tâm quảng trường
  pizzaShopRoot.parent = plazaRoot;

  // Thân nhà bo cong màu vàng phô mai ấm áp
  const pizzaBody = MeshBuilder.CreateBox('pizza-shop-body', { width: 11.2, height: 5.2, depth: 8.4 }, scene);
  pizzaBody.position.y = 2.6;
  pizzaBody.material = createToyMaterial(scene, 'pizza-body-mat', '#fef08a');
  pizzaBody.parent = pizzaShopRoot;
  pizzaBody.receiveShadows = true;
  shadows?.addShadowCaster(pizzaBody);

  // Chân tường trắng sữa bảo vệ
  const pizzaPlinth = MeshBuilder.CreateBox('pizza-plinth', { width: 11.6, height: 0.6, depth: 8.8 }, scene);
  pizzaPlinth.position.y = 0.3;
  pizzaPlinth.material = createToyMaterial(scene, 'pizza-plinth-mat', '#ffffff');
  pizzaPlinth.parent = pizzaShopRoot;

  // Mái hiên vòm sọc đỏ - vàng phô mai bo tròn (Awning)
  const pizzaAwning = MeshBuilder.CreateCylinder('pizza-awning', {
    diameter: 3.2,
    height: 10.6,
    tessellation: 18,
    arc: 0.5,
  }, scene);
  pizzaAwning.rotation.z = Math.PI / 2;
  pizzaAwning.rotation.y = Math.PI;
  pizzaAwning.position.set(0, 3.6, 4.5);
  pizzaAwning.material = createToyMaterial(scene, 'pizza-awning-mat', '#ef4444');
  pizzaAwning.parent = pizzaShopRoot;

  // Cửa kính lớn tròn mắt mèo
  const pizzaDoor = MeshBuilder.CreateBox('pizza-door', { width: 2.6, height: 3.2, depth: 0.2 }, scene);
  pizzaDoor.position.set(0, 1.6, 4.25);
  pizzaDoor.material = createToyMaterial(scene, 'pizza-door-glass', '#bae6fd', { emissiveHex: '#38bdf8' });
  pizzaDoor.parent = pizzaShopRoot;

  // NÓC NHÀ: MIẾNG BÁNH PIZZA PHÔ MAI 3D KHỔNG LỒ XOAY TÍT
  const pizzaSpinner = new TransformNode('pizza-giant-slice', scene);
  pizzaSpinner.position.set(0, 7.2, 0);
  pizzaSpinner.parent = pizzaShopRoot;

  const slice = MeshBuilder.CreateCylinder('pizza-crust-slice', {
    diameter: 6.4,
    height: 0.85,
    tessellation: 24,
    arc: 0.16, // Lát bánh tam giác 60 độ
  }, scene);
  slice.rotation.x = Math.PI / 2;
  slice.material = createToyMaterial(scene, 'pizza-cheese-mat', '#facc15', { emissiveHex: '#eab308' });
  slice.parent = pizzaSpinner;

  // Viền bánh nướng phồng nâu vàng (Crust rim)
  const crust = MeshBuilder.CreateTorus('pizza-crust-rim', {
    diameter: 6.4,
    thickness: 0.65,
    tessellation: 20,
  }, scene);
  crust.rotation.x = Math.PI / 2;
  crust.material = createToyMaterial(scene, 'pizza-crust-mat', '#d97706');
  crust.parent = pizzaSpinner;

  // Các lát xúc xích Pepperoni đỏ mọng
  for (let p = 0; p < 4; p++) {
    const pep = MeshBuilder.CreateCylinder(`pizza-pep-${p}`, { diameter: 0.65, height: 0.15, tessellation: 12 }, scene);
    pep.position.set(0.4 + (p % 2) * 0.9, 0.48, 1.2 + p * 0.7);
    pep.material = createToyMaterial(scene, `pep-mat-${p}`, '#dc2626');
    pep.parent = pizzaSpinner;
  }

  // Biển hiệu Pop-art
  createPopArtVenueSign(scene, 'TIỆM PIZZA & GAMES', '🍕', '#ef4444', pizzaShopRoot, 8.8);

  // ========================================================
  // 4. TÒA NHÀ 2: 🥕 SIÊU THỊ TIỆN LỢI CHIBI (KAIA MART)
  // ========================================================
  const martRoot = new TransformNode('venue-fresh-mart', scene);
  martRoot.metadata = { venue: 'supplies' }; // Mua hạt giống / vật tư nông nghiệp
  martRoot.position.set(27, 0, 20);
  martRoot.rotation.y = -Math.PI / 4 - 0.15;
  martRoot.parent = plazaRoot;

  const martBody = MeshBuilder.CreateBox('mart-body', { width: 11.2, height: 5.2, depth: 8.4 }, scene);
  martBody.position.y = 2.6;
  martBody.material = createToyMaterial(scene, 'mart-body-mat', '#a7f3d0'); // Xanh mint pastel
  martBody.parent = martRoot;
  martBody.receiveShadows = true;
  shadows?.addShadowCaster(martBody);

  const martPlinth = MeshBuilder.CreateBox('mart-plinth', { width: 11.6, height: 0.6, depth: 8.8 }, scene);
  martPlinth.position.y = 0.3;
  martPlinth.material = pizzaPlinth.material;
  martPlinth.parent = martRoot;

  // Mái vòm tròn kem dâu
  const martRoof = MeshBuilder.CreateSphere('mart-roof-dome', { diameter: 9.2, segments: 16 }, scene);
  martRoof.scaling.set(1.1, 0.45, 0.85);
  martRoof.position.set(0, 5.2, 0);
  martRoof.material = createToyMaterial(scene, 'mart-roof-mat', '#34d399');
  martRoof.parent = martRoot;

  // Cửa kính siêu thị
  const martDoor = MeshBuilder.CreateBox('mart-door', { width: 3.2, height: 3.2, depth: 0.2 }, scene);
  martDoor.position.set(0, 1.6, 4.25);
  martDoor.material = pizzaDoor.material;
  martDoor.parent = martRoot;

  // NÓC NHÀ: CỦ CÀ RỐT CHIBI 3D MẬP MẠP MẮT CƯỜI XOAY NHẸ
  const carrotSpinner = new TransformNode('mart-giant-carrot', scene);
  carrotSpinner.position.set(0, 7.0, 0);
  carrotSpinner.parent = martRoot;

  const carrotRootMesh = MeshBuilder.CreateCylinder('mart-carrot-cone', {
    diameterTop: 2.2,
    diameterBottom: 0.4,
    height: 4.2,
    tessellation: 20,
  }, scene);
  carrotRootMesh.rotation.z = Math.PI / 6; // Hơi nghiêng điệu đà
  carrotRootMesh.material = createToyMaterial(scene, 'mart-carrot-orange', '#fb923c', { emissiveHex: '#ea580c' });
  carrotRootMesh.parent = carrotSpinner;

  // Tán lá xanh tròn múp míp
  for (let leaf = 0; leaf < 3; leaf++) {
    const l = MeshBuilder.CreateSphere(`mart-carrot-leaf-${leaf}`, { diameter: 1.1, segments: 10 }, scene);
    l.scaling.set(0.6, 1.6, 0.6);
    l.position.set(Math.cos(leaf * 2.1) * 0.6 - 0.6, 2.4, Math.sin(leaf * 2.1) * 0.6);
    l.rotation.z = -0.3;
    l.material = createToyMaterial(scene, 'mart-carrot-leaf-mat', '#22c55e');
    l.parent = carrotSpinner;
  }

  // Mắt cười Chibi
  const cEyeL = MeshBuilder.CreateSphere('mart-ceye-l', { diameter: 0.28, segments: 8 }, scene);
  cEyeL.position.set(0.2, 0.4, 1.05);
  cEyeL.scaling.set(0.7, 1.3, 0.3);
  cEyeL.material = starEyeL.material;
  cEyeL.parent = carrotSpinner;

  const cEyeR = MeshBuilder.CreateSphere('mart-ceye-r', { diameter: 0.28, segments: 8 }, scene);
  cEyeR.position.set(0.9, 0.05, 0.95);
  cEyeR.scaling.set(0.7, 1.3, 0.3);
  cEyeR.material = starEyeL.material;
  cEyeR.parent = carrotSpinner;

  // Biển hiệu Pop-art
  createPopArtVenueSign(scene, 'SIÊU THỊ NÔNG VỤ', '🥕', '#10b981', martRoot, 9.2);

  // ========================================================
  // 5. TÒA NHÀ 3: 🎀 TIỆM THỜI TRANG PHẤN HỒNG (PINK BOUTIQUE)
  // ========================================================
  const fashionRoot = new TransformNode('venue-fashion-boutique', scene);
  fashionRoot.metadata = { venue: 'fashion' };
  fashionRoot.position.set(27, 0, -20);
  fashionRoot.rotation.y = -Math.PI * 0.75;
  fashionRoot.parent = plazaRoot;

  const fashionBody = MeshBuilder.CreateBox('fashion-body', { width: 11.2, height: 5.2, depth: 8.4 }, scene);
  fashionBody.position.y = 2.6;
  fashionBody.material = createToyMaterial(scene, 'fashion-body-mat', '#fbcfe8'); // Hồng pastel
  fashionBody.parent = fashionRoot;
  fashionBody.receiveShadows = true;
  shadows?.addShadowCaster(fashionBody);

  const fashionPlinth = MeshBuilder.CreateBox('fashion-plinth', { width: 11.6, height: 0.6, depth: 8.8 }, scene);
  fashionPlinth.position.y = 0.3;
  fashionPlinth.material = pizzaPlinth.material;
  fashionPlinth.parent = fashionRoot;

  const fashionRoof = MeshBuilder.CreateBox('fashion-roof', { width: 11.8, height: 0.9, depth: 9.0 }, scene);
  fashionRoof.position.y = 5.4;
  fashionRoof.material = createToyMaterial(scene, 'fashion-roof-mat', '#f43f5e');
  fashionRoof.parent = fashionRoot;

  // NÓC NHÀ: CHIẾC NƠ BƯỚM HỒNG 3D KHỔNG LỒ PHÁT SÁNG
  const bowSpinner = new TransformNode('fashion-giant-bow', scene);
  bowSpinner.position.set(0, 7.2, 0);
  bowSpinner.parent = fashionRoot;

  const matBow = createToyMaterial(scene, 'bow-glow-pink', '#f43f5e', {
    emissiveHex: '#fb7185',
    specularPower: 128,
  });

  const bowCenter = MeshBuilder.CreateSphere('bow-center', { diameter: 1.1, segments: 12 }, scene);
  bowCenter.material = matBow;
  bowCenter.parent = bowSpinner;

  [-1, 1].forEach(side => {
    const wing = MeshBuilder.CreateTorus(`bow-wing-${side}`, {
      diameter: 2.2,
      thickness: 0.55,
      tessellation: 20,
    }, scene);
    wing.position.set(side * 1.5, 0.2, 0);
    wing.rotation.y = Math.PI / 2;
    wing.rotation.z = side * 0.3;
    wing.material = matBow;
    wing.parent = bowSpinner;
  });

  createPopArtVenueSign(scene, 'TIỆM THỜI TRANG', '🎀', '#ec4899', fashionRoot, 8.8);

  // ========================================================
  // 6. TÒA NHÀ 4: 🚗 SHOWROOM XE ĐỒ CHƠI & SKATE (SPEEDY MOTORS)
  // ========================================================
  const vehicleRoot = new TransformNode('venue-vehicle-dealer', scene);
  vehicleRoot.metadata = { venue: 'vehicles' };
  vehicleRoot.position.set(-27, 0, -20);
  vehicleRoot.rotation.y = Math.PI * 0.75;
  vehicleRoot.parent = plazaRoot;

  const vehicleBody = MeshBuilder.CreateBox('vehicle-body', { width: 11.2, height: 5.2, depth: 8.4 }, scene);
  vehicleBody.position.y = 2.6;
  vehicleBody.material = createToyMaterial(scene, 'vehicle-body-mat', '#bae6fd'); // Xanh baby blue
  vehicleBody.parent = vehicleRoot;
  vehicleBody.receiveShadows = true;
  shadows?.addShadowCaster(vehicleBody);

  const vehiclePlinth = MeshBuilder.CreateBox('vehicle-plinth', { width: 11.6, height: 0.6, depth: 8.8 }, scene);
  vehiclePlinth.position.y = 0.3;
  vehiclePlinth.material = pizzaPlinth.material;
  vehiclePlinth.parent = vehicleRoot;

  // NÓC NHÀ: BỤC XOAY TRƯNG BÀY CHIẾC XE HƠI MUI TRẦN CHIBI MINI
  const carTurnTable = new TransformNode('car-turntable', scene);
  carTurnTable.position.set(0, 6.4, 0);
  carTurnTable.parent = vehicleRoot;

  const carPlinth = MeshBuilder.CreateCylinder('car-plinth', { diameter: 4.8, height: 0.4, tessellation: 32 }, scene);
  carPlinth.material = createToyMaterial(scene, 'car-plinth-mat', '#fef08a');
  carPlinth.parent = carTurnTable;

  // Chiếc xe hơi Chibi màu vàng chuối
  const carBody = MeshBuilder.CreateBox('mini-chibi-car-body', { width: 2.8, height: 1.1, depth: 1.8 }, scene);
  carBody.position.y = 0.8;
  carBody.material = createToyMaterial(scene, 'chibi-car-paint', '#facc15');
  carBody.parent = carTurnTable;

  const carCabin = MeshBuilder.CreateBox('mini-chibi-car-cabin', { width: 1.6, height: 0.85, depth: 1.5 }, scene);
  carCabin.position.set(-0.2, 1.45, 0);
  carCabin.material = pizzaDoor.material;
  carCabin.parent = carTurnTable;

  // 4 Bánh xe đen viền chrome
  [
    [-1.0, 0.4, -0.9],
    [-1.0, 0.4, 0.9],
    [1.0, 0.4, -0.9],
    [1.0, 0.4, 0.9],
  ].forEach(([wx, wy, wz], widx) => {
    const wheel = MeshBuilder.CreateCylinder(`chibi-car-wheel-${widx}`, { diameter: 0.75, height: 0.35, tessellation: 16 }, scene);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    wheel.material = starEyeL.material;
    wheel.parent = carTurnTable;
  });

  createPopArtVenueSign(scene, 'ĐẠI LÝ XE & SKATE', '🚗', '#0284c7', vehicleRoot, 8.8);

  // ========================================================
  // 7. CÂY KẸO BÔNG & KHÓM HOA ĐỒ CHƠI QUANH QUẢNG TRƯỜNG
  // ========================================================
  const plazaTrees = [
    { x: -32, z: 0, color: 'mint', scale: 1.35 },
    { x: 32, z: 0, color: 'sakura', scale: 1.35 },
    { x: 0, z: 34, color: 'honey', scale: 1.3 },
    { x: 0, z: -34, color: 'lavender', scale: 1.3 },
    { x: -24, z: 32, color: 'sakura', scale: 1.25 },
    { x: 24, z: 32, color: 'mint', scale: 1.25 },
    { x: -24, z: -32, color: 'honey', scale: 1.25 },
    { x: 24, z: -32, color: 'lavender', scale: 1.25 },
  ];

  plazaTrees.forEach(t => {
    createMarshmallowTree(scene, t.x, t.z, {
      scale: t.scale,
      colorVariant: t.color,
      shadows,
    });
    createCandyFlowerBush(scene, t.x + 2.0, t.z + 1.5, { scale: 1.15, shadows });
    createCandyPebbleRock(scene, t.x - 1.8, t.z + 1.2, { scale: 1.1, shadows });
  });

  // ========================================================
  // 8. GHẾ NGHỈ CHÂN & CỘT ĐÈN HOẠT HÌNH BO TRÒN
  // ========================================================
  const benchPositions = [
    { x: -16, z: 0, rot: Math.PI / 2 },
    { x: 16, z: 0, rot: -Math.PI / 2 },
    { x: 0, z: 16, rot: 0 },
    { x: 0, z: -16, rot: Math.PI },
  ];

  benchPositions.forEach((b, bidx) => {
    // Ghế gỗ kem bơ bo tròn pastel
    const bench = MeshBuilder.CreateBox(`plaza-bench-${bidx}`, { width: 3.4, height: 0.5, depth: 1.1 }, scene);
    bench.position.set(b.x, 0.45, b.z);
    bench.rotation.y = b.rot;
    bench.material = createToyMaterial(scene, `bench-mat-${bidx}`, '#fed7aa');
    bench.parent = plazaRoot;

    // Cột đèn đường hoạt hình bóng tròn vàng
    const lampPost = MeshBuilder.CreateCylinder(`plaza-lamp-post-${bidx}`, { diameter: 0.22, height: 4.8, tessellation: 12 }, scene);
    lampPost.position.set(b.x * 1.35, 2.4, b.z * 1.35);
    lampPost.material = createToyMaterial(scene, `lamp-post-mat-${bidx}`, '#475569');
    lampPost.parent = plazaRoot;

    const lampBulb = MeshBuilder.CreateSphere(`plaza-lamp-bulb-${bidx}`, { diameter: 0.85, segments: 12 }, scene);
    lampBulb.position.set(b.x * 1.35, 4.8, b.z * 1.35);
    lampBulb.material = createToyMaterial(scene, `lamp-bulb-mat-${bidx}`, '#fef08a', { emissiveHex: '#facc15' });
    lampBulb.parent = plazaRoot;
  });

  // VÒNG LẶP XOAY HOẠT HÌNH CHO CÁC ICON 3D TRÊN NÓC
  scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    // Ngôi sao vàng đài phun xoay tít và nhấp nhô
    starNode.rotation.y += dt * 1.2;
    starNode.position.y = 3.4 + Math.sin(Date.now() * 0.003) * 0.12;

    // Lát Pizza xoay chậm
    pizzaSpinner.rotation.y += dt * 0.85;

    // Cà Rốt Chibi lắc lư
    carrotSpinner.rotation.y += dt * 0.95;

    // Chiếc Nơ Hồng xoay
    bowSpinner.rotation.y += dt * 0.9;

    // Bục xe hơi xoay trưng bày
    carTurnTable.rotation.y += dt * 0.75;
  });

  return {
    root: plazaRoot,
    fountain: fountainRoot,
  };
}
