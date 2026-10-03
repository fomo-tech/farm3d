import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';
import { Color4 } from '@babylonjs/core/Maths/math.color.js';

function makeMat(scene, name, hex, emissiveHex = null, specular = 0.25) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.42);
  m.specularColor = new Color3(specular, specular, specular);
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

/**
 * BẾN CẢNG TÀU HƠI NƯỚC XUẤT KHẨU NÔNG SẢN (CARGO STEAMBOAT PORT)
 * Chuẩn game nông trại mạng xã hội kinh điển (Hay Day Steamboat):
 * - Cầu cảng gỗ chịu lực vươn ra biển/sông
 * - Chiếc Tàu Hơi Nước 2 Tầng (Steamboat) sơn màu trắng ngọc - đỏ burgundy với bánh guồng nước tròn phía sau
 * - Ống khói tàu cổ điển phun làn khói trắng bồng bềnh
 * - Các kiện hàng thùng gỗ xuất khẩu xếp ngay ngắn trên cầu cảng
 */
export function createSteamboatPort(scene, shadows, position = { x: -35, y: 0, z: 360 }) {
  const root = new TransformNode('steamboat-cargo-port', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.metadata = { interactive: true, type: 'steamboat-port' };

  const mats = {
    pierDeck: makeMat(scene, 'port-pier-deck', '#9a3412', null, 0.2),
    pierPylon: makeMat(scene, 'port-pier-pylon', '#451a03', null, 0.15),
    hullWhite: makeMat(scene, 'steamboat-hull-white', '#f8fafc', null, 0.4),
    hullRed: makeMat(scene, 'steamboat-hull-red', '#b91c1c', null, 0.35),
    trimGold: makeMat(scene, 'steamboat-trim-gold', '#f59e0b', '#d97706', 0.6),
    chimneyBlack: makeMat(scene, 'steamboat-chimney', '#1e293b', null, 0.5),
    paddleWheel: makeMat(scene, 'steamboat-paddle-wheel', '#78350f', null, 0.2),
    glass: makeMat(scene, 'steamboat-glass', '#bae6fd', '#38bdf8', 0.8),
    cargoBox: makeMat(scene, 'port-cargo-box', '#d97706', null, 0.2),
    ropeWhite: makeMat(scene, 'port-rope-white', '#ffffff', null, 0.1),
  };
  mats.glass.alpha = 0.82;

  // ==========================================
  // 1. CẦU CẢNG GỖ XUẤT KHẨU (WOODEN CARGO PIER)
  // ==========================================
  const pierDeck = MeshBuilder.CreateBox('port-deck-mesh', { width: 8.4, height: 0.35, depth: 22.0 }, scene);
  pierDeck.position.set(0, 0.8, 0);
  pierDeck.material = mats.pierDeck;
  pierDeck.parent = root;
  pierDeck.receiveShadows = true;

  // Các cọc gỗ chịu lực cắm sâu dưới nước
  [-3.8, 3.8].forEach(px => {
    [-8, -3, 2, 7].forEach(pz => {
      const pylon = MeshBuilder.CreateCylinder(`port-pylon-${px}-${pz}`, { height: 2.8, diameter: 0.42, tessellation: 12 }, scene);
      pylon.position.set(px, 0.2, pz);
      pylon.material = mats.pierPylon;
      pylon.parent = root;
      shadows?.addShadowCaster(pylon);
    });
  });

  // Hàng thùng hàng gỗ đóng pallet xuất khẩu chờ bốc dỡ
  [
    { x: -2.4, y: 1.0, z: -4 },
    { x: -2.4, y: 1.0, z: -2.6 },
    { x: -2.4, y: 1.7, z: -3.3 },
    { x: -2.4, y: 1.0, z: 2 },
    { x: -2.4, y: 1.0, z: 3.4 },
  ].forEach((pos, idx) => {
    const crate = MeshBuilder.CreateBox(`pier-cargo-crate-${idx}`, { width: 1.15, height: 0.75, depth: 1.15 }, scene);
    crate.position.set(pos.x, pos.y + 0.38, pos.z);
    crate.material = mats.cargoBox;
    crate.parent = root;
  });

  // Cột đèn hải cảng cổ điển treo đèn vàng ấm áp
  const lampPole = MeshBuilder.CreateCylinder('port-lamp-pole', { height: 4.8, diameter: 0.22, tessellation: 12 }, scene);
  lampPole.position.set(3.4, 3.0, 9.5);
  lampPole.material = mats.chimneyBlack;
  lampPole.parent = root;

  const lampBulb = MeshBuilder.CreateSphere('port-lamp-bulb', { diameter: 0.65, segments: 10 }, scene);
  lampBulb.position.set(3.4, 5.2, 9.5);
  lampBulb.material = makeMat(scene, 'port-lamp-glow', '#fef08a', '#facc15');
  lampBulb.parent = root;

  // ==========================================
  // 2. CHIẾC TÀU HƠI NƯỚC HAI TẦNG (CARGO STEAMBOAT)
  // ==========================================
  const boatRoot = new TransformNode('cargo-steamboat-vessel', scene);
  boatRoot.position.set(12.5, 0.2, 2.0);
  boatRoot.parent = root;

  // Thân tàu tầng 1 (Lower Hull)
  const hull = MeshBuilder.CreateBox('steamboat-hull', { width: 7.2, height: 2.2, depth: 16.4 }, scene);
  hull.position.y = 1.1;
  hull.material = mats.hullWhite;
  hull.parent = boatRoot;
  hull.receiveShadows = true;
  shadows?.addShadowCaster(hull);

  // Dải sơn viền đỏ burgundy quanh thân tàu
  const hullStripe = MeshBuilder.CreateBox('steamboat-stripe', { width: 7.3, height: 0.45, depth: 16.5 }, scene);
  hullStripe.position.y = 1.6;
  hullStripe.material = mats.hullRed;
  hullStripe.parent = boatRoot;

  // Tầng 2: Cabin hành khách & phòng thuyền trưởng
  const cabin = MeshBuilder.CreateBox('steamboat-cabin', { width: 5.4, height: 2.4, depth: 11.2 }, scene);
  cabin.position.set(0, 3.4, -0.5);
  cabin.material = mats.hullWhite;
  cabin.parent = boatRoot;
  shadows?.addShadowCaster(cabin);

  // Mái che tầng 2
  const cabinRoof = MeshBuilder.CreateBox('steamboat-cabin-roof', { width: 6.2, height: 0.35, depth: 12.2 }, scene);
  cabinRoof.position.set(0, 4.7, -0.5);
  cabinRoof.material = mats.hullRed;
  cabinRoof.parent = boatRoot;

  // Lan can boong tàu mạ vàng
  const railF = MeshBuilder.CreateBox('steamboat-rail-front', { width: 6.8, height: 0.8, depth: 0.15 }, scene);
  railF.position.set(0, 2.6, 7.8);
  railF.material = mats.trimGold;
  railF.parent = boatRoot;

  // 2 Ống khói tàu cổ điển (Twin Steam Smokestacks)
  const smokestacks = [];
  [-1.2, 1.2].forEach((sx, idx) => {
    const stack = MeshBuilder.CreateCylinder(`steamboat-stack-${idx}`, {
      diameterTop: 0.75,
      diameterBottom: 0.9,
      height: 3.8,
      tessellation: 16,
    }, scene);
    stack.position.set(sx, 6.4, 1.2);
    stack.material = mats.chimneyBlack;
    stack.parent = boatRoot;
    smokestacks.push(stack);

    // Vành mạ vàng đầu ống khói
    const rim = MeshBuilder.CreateTorus(`stack-rim-${idx}`, { diameter: 0.85, thickness: 0.12, tessellation: 16 }, scene);
    rim.position.set(sx, 8.2, 1.2);
    rim.material = mats.trimGold;
    rim.parent = boatRoot;
  });

  // BÁNH GUỒNG NƯỚC TRÒN PHÍA SAU (STERN PADDLE WHEEL)
  const paddleRoot = new TransformNode('steamboat-paddle-root', scene);
  paddleRoot.position.set(0, 1.3, -9.2);
  paddleRoot.parent = boatRoot;

  const wheelCore = MeshBuilder.CreateCylinder('paddle-core', { diameter: 1.4, height: 5.6, tessellation: 16 }, scene);
  wheelCore.rotation.z = Math.PI / 2;
  wheelCore.material = mats.paddleWheel;
  wheelCore.parent = paddleRoot;

  // 8 Cánh quạt guồng nước gỗ
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const blade = MeshBuilder.CreateBox(`paddle-blade-${i}`, { width: 5.4, height: 0.12, depth: 1.2 }, scene);
    blade.position.set(0, Math.sin(angle) * 1.5, Math.cos(angle) * 1.5);
    blade.rotation.x = angle;
    blade.material = mats.paddleWheel;
    blade.parent = paddleRoot;
  }

  // Khung vỏ che bánh guồng màu đỏ
  const wheelHood = MeshBuilder.CreateCylinder('paddle-hood', {
    diameter: 4.4,
    height: 5.8,
    tessellation: 20,
    arc: 0.5,
  }, scene);
  wheelHood.rotation.z = Math.PI / 2;
  wheelHood.position.set(0, 2.0, -8.6);
  wheelHood.material = mats.hullRed;
  wheelHood.parent = boatRoot;

  // HỆ THỐNG PHUN KHÓI TRẮNG TỪ ỐNG KHÓI TÀU (Steam Smoke Particles)
  const smoke = new ParticleSystem('steamboat-smoke-particles', 36, scene);
  const smokeTex = new DynamicTexture('steamboat-smoke-tex', 32, scene, false);
  const sctx = smokeTex.getContext();
  sctx.fillStyle = '#ffffff';
  sctx.beginPath();
  sctx.arc(16, 16, 14, 0, Math.PI * 2);
  sctx.fill();
  smokeTex.update();

  smoke.particleTexture = smokeTex;
  smoke.emitter = new Vector3(position.x + 12.5, 8.4, position.z + 3.2);
  smoke.minEmitBox = new Vector3(-0.6, 0, -0.6);
  smoke.maxEmitBox = new Vector3(0.6, 0.2, 0.6);
  smoke.color1 = new Color4(0.95, 0.95, 0.95, 0.65);
  smoke.color2 = new Color4(0.85, 0.85, 0.85, 0.35);
  smoke.colorDead = new Color4(0.8, 0.8, 0.8, 0.0);
  smoke.minSize = 0.45;
  smoke.maxSize = 1.35;
  smoke.minLifeTime = 1.2;
  smoke.maxLifeTime = 2.4;
  smoke.emitRate = 18;
  smoke.gravity = new Vector3(0.4, 0.8, 0.2);
  smoke.direction1 = new Vector3(-0.2, 1.2, -0.2);
  smoke.direction2 = new Vector3(0.2, 1.8, 0.2);
  smoke.minEmitPower = 0.8;
  smoke.maxEmitPower = 1.4;
  smoke.updateSpeed = 0.015;
  smoke.start();

  // VÒNG LẶP HOẠT HÌNH: TÀU NHẤP NHÔ SÓNG NƯỚC & BÁNH GUỒNG NƯỚC QUAY
  const observer = scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    const time = Date.now() * 0.0015;

    // Tàu hơi nước bập bềnh nhẹ trên sóng
    boatRoot.position.y = 0.2 + Math.sin(time) * 0.08;
    boatRoot.rotation.z = Math.sin(time * 0.8) * 0.018;

    // Bánh guồng nước quay êm đềm
    paddleRoot.rotation.x += dt * 0.8;
  });

  return {
    root,
    boat: boatRoot,
    dispose() {
      scene.onBeforeRenderObservable.remove(observer);
      smoke.dispose();
      root.dispose(false, true);
    },
  };
}
