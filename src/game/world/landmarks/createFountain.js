import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';

function makeMat(scene, name, hex, emissiveHex = null) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.specularColor = new Color3(0.1, 0.1, 0.1);
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

/**
 * Creates the Majestic 3-Tier Plaza Stone Fountain with active water spray particles.
 */
export function createMajesticFountain(scene, shadows, position = { x: 0, y: 0, z: -148 }) {
  const root = new TransformNode('landmark-plaza-fountain', scene);
  root.position.set(position.x, position.y || 0, position.z);

  const materials = {
    carvedStone: makeMat(scene, 'fountain-stone-cream', '#fefce8'), // Cẩm thạch trắng kem sáng ngời
    goldTrim: makeMat(scene, 'fountain-trim-gold', '#f59e0b', '#fbbf24'), // Viền chỉ phào mạ vàng kim hoàng gia
    water: makeMat(scene, 'fountain-water-crystal', '#38bdf8', '#0284c7'), // Nước pha lê xanh ngọc lam
  };
  materials.water.alpha = 0.88;

  // 1. Đế đài phun nước tròn rộng rãi
  const outerBasin = MeshBuilder.CreateCylinder('fountain-outer-basin', {
    height: 0.95,
    diameter: 7.2,
    tessellation: 28,
  }, scene);
  outerBasin.position.y = 0.48;
  outerBasin.material = materials.carvedStone;
  outerBasin.parent = root;

  // Viền hoa văn vàng mạ miệng bể đáy
  const basinRim = MeshBuilder.CreateTorus('fountain-basin-rim', {
    diameter: 7.2,
    thickness: 0.28,
    tessellation: 28,
  }, scene);
  basinRim.position.y = 0.95;
  basinRim.material = materials.goldTrim;
  basinRim.parent = root;

  // Mặt nước hồ đáy
  const basinWater = MeshBuilder.CreateCylinder('fountain-water-surface', {
    height: 0.1,
    diameter: 6.6,
    tessellation: 28,
  }, scene);
  basinWater.position.y = 0.85;
  basinWater.material = materials.water;
  basinWater.parent = root;

  // 2. Trụ cột hoa văn Baroque đỡ tầng giữa
  const pillar = MeshBuilder.CreateCylinder('fountain-pillar', {
    height: 2.8,
    diameterTop: 0.9,
    diameterBottom: 1.4,
    tessellation: 20,
  }, scene);
  pillar.position.y = 1.65;
  pillar.material = materials.carvedStone;
  pillar.parent = root;

  const pillarRing = MeshBuilder.CreateTorus('fountain-pillar-ring', {
    diameter: 1.3,
    thickness: 0.22,
    tessellation: 20,
  }, scene);
  pillarRing.position.y = 1.3;
  pillarRing.material = materials.goldTrim;
  pillarRing.parent = root;

  // Tầng bát giữa (Middle Tier Bowl) có viền lượn sóng
  const midBowl = MeshBuilder.CreateCylinder('fountain-mid-bowl', {
    height: 0.6,
    diameterTop: 4.2,
    diameterBottom: 2.6,
    tessellation: 24,
  }, scene);
  midBowl.position.y = 2.05;
  midBowl.material = materials.carvedStone;
  midBowl.parent = root;

  const midRim = MeshBuilder.CreateTorus('fountain-mid-rim', {
    diameter: 4.2,
    thickness: 0.22,
    tessellation: 24,
  }, scene);
  midRim.position.y = 2.35;
  midRim.material = materials.goldTrim;
  midRim.parent = root;

  // Nước tầng giữa
  const midWater = MeshBuilder.CreateCylinder('fountain-mid-water', {
    height: 0.08,
    diameter: 3.9,
    tessellation: 24,
  }, scene);
  midWater.position.y = 2.28;
  midWater.material = materials.water;
  midWater.parent = root;

  // 3. Tầng bát trên cùng (Top Tier Spout Bowl)
  const topBowl = MeshBuilder.CreateCylinder('fountain-top-bowl', {
    height: 0.5,
    diameterTop: 2.3,
    diameterBottom: 1.3,
    tessellation: 20,
  }, scene);
  topBowl.position.y = 3.05;
  topBowl.material = materials.carvedStone;
  topBowl.parent = root;

  const topRim = MeshBuilder.CreateTorus('fountain-top-rim', {
    diameter: 2.3,
    thickness: 0.18,
    tessellation: 20,
  }, scene);
  topRim.position.y = 3.3;
  topRim.material = materials.goldTrim;
  topRim.parent = root;

  // Nước tầng trên
  const topWater = MeshBuilder.CreateCylinder('fountain-top-water', {
    height: 0.06,
    diameter: 2.1,
    tessellation: 20,
  }, scene);
  topWater.position.y = 3.24;
  topWater.material = materials.water;
  topWater.parent = root;

  // Đỉnh tượng ngọc phát sáng phun trào (Crystal Orb Finial)
  const nozzle = MeshBuilder.CreateSphere('fountain-nozzle', {
    diameter: 0.55,
    segments: 12,
  }, scene);
  nozzle.position.y = 3.55;
  nozzle.material = materials.goldTrim;
  nozzle.parent = root;

  // 4. Water Spray Particle System
  const dropTex = new DynamicTexture('water-drop-particle-tex', { width: 32, height: 32 }, scene, true);
  const ctx = dropTex.getContext();
  ctx.clearRect(0, 0, 32, 32);
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  grad.addColorStop(0.5, 'rgba(125, 211, 252, 0.7)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(16, 16, 16, 0, Math.PI * 2);
  ctx.fill();
  dropTex.update();

  const spray = new ParticleSystem('fountain-spray-system', 60, scene);
  spray.particleTexture = dropTex;
  spray.emitter = new Vector3(position.x, (position.y || 0) + 3.3, position.z);
  spray.minEmitBox = new Vector3(-0.05, 0, -0.05);
  spray.maxEmitBox = new Vector3(0.05, 0, 0.05);

  spray.color1 = new Color3(0.85, 0.95, 1.0).toColor4(0.85);
  spray.color2 = new Color3(0.55, 0.85, 1.0).toColor4(0.7);
  spray.colorDead = new Color3(0.35, 0.75, 1.0).toColor4(0.0);

  spray.minSize = 0.12;
  spray.maxSize = 0.28;
  spray.minLifeTime = 1.0;
  spray.maxLifeTime = 1.6;

  spray.emitRate = 45;
  spray.gravity = new Vector3(0, -9.81, 0);

  spray.direction1 = new Vector3(-0.4, 3.8, -0.4);
  spray.direction2 = new Vector3(0.4, 4.4, 0.4);

  spray.minEmitPower = 1.2;
  spray.maxEmitPower = 2.0;
  spray.updateSpeed = 0.018;

  spray.start();

  if (shadows) {
    [outerBasin, midBowl, topBowl].forEach(m => shadows.addShadowCaster(m));
  }

  return {
    root,
    spray,
    dispose() {
      spray.dispose();
      root.dispose();
    },
  };
}
