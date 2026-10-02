import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { spawnVillageHouse, MODEL_PATHS, spawnModelSync } from '../rendering/ModelAssetManager.js';

function createSmokeTexture(scene) {
  const dt = new DynamicTexture('farmhouse-smoke-tex', 64, scene, false);
  const ctx = dt.getContext();
  ctx.clearRect(0, 0, 64, 64);
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(0.5, 'rgba(235, 240, 245, 0.45)');
  grad.addColorStop(1, 'rgba(220, 230, 240, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  ctx.fill();
  dt.update();
  return dt;
}

/**
 * Nhà Nông Trại Cấp 1 3D: Ngôi nhà Nông Trại Đồng Quê Mái Ngói Mềm Mại (Cozy Country Cottage)
 */
export function createStarterFarmhouse(scene, shadowGenerator, position) {
  const root = new TransformNode('starter-farmhouse-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.metadata = { type: 'player-home', tier: 1, homeId: 'starter-cabin' };

  // Nạp mô hình nhà 3D vẽ tay chính gốc (Triệt tiêu 100% dạng khối)
  const houseModel = spawnVillageHouse(scene, 0, {
    position: new Vector3(0, 0, 0),
    scaling: new Vector3(4.2, 4.2, 4.2),
    rotation: new Vector3(0, Math.PI, 0),
    shadows: shadowGenerator,
    name: 'starter-cottage-3d',
  });
  houseModel.parent = root;

  // Đèn lồng treo trước cửa nhà
  const porchLantern = spawnModelSync(scene, MODEL_PATHS.town.lantern, {
    position: new Vector3(1.8, 0, 3.2),
    scaling: new Vector3(1.2, 1.2, 1.2),
    shadows: shadowGenerator,
    name: 'starter-lantern-3d',
  });
  porchLantern.parent = root;

  // Hiệu ứng khói bếp chiều ấm áp bốc lên từ ống khói
  const smokeEmitter = new TransformNode('starter-smoke-emitter', scene);
  smokeEmitter.position.set(1.6, 7.2, -0.8);
  smokeEmitter.parent = root;

  const smokeSystem = new ParticleSystem('starter-smoke', 40, scene);
  smokeSystem.particleTexture = createSmokeTexture(scene);
  smokeSystem.emitter = smokeEmitter;
  smokeSystem.minEmitBox = new Vector3(-0.15, 0, -0.15);
  smokeSystem.maxEmitBox = new Vector3(0.15, 0.2, 0.15);
  smokeSystem.color1 = new Color4(0.95, 0.95, 0.92, 0.6);
  smokeSystem.color2 = new Color4(0.88, 0.88, 0.85, 0.35);
  smokeSystem.colorDead = new Color4(0.8, 0.85, 0.8, 0.0);
  smokeSystem.minSize = 0.6;
  smokeSystem.maxSize = 1.8;
  smokeSystem.minLifeTime = 2.0;
  smokeSystem.maxLifeTime = 3.6;
  smokeSystem.emitRate = 3.5;
  smokeSystem.direction1 = new Vector3(-0.25, 2.0, 0.2);
  smokeSystem.direction2 = new Vector3(0.25, 2.8, 0.5);
  smokeSystem.start();

  return {
    root,
    smokeSystem,
    dispose() {
      smokeSystem.dispose();
      root.dispose(false, false);
    },
  };
}

/**
 * Biệt Thự Nông Trại Cấp 2 3D: Dinh Thự Điền Trang Châu Âu (Charming Farm Manor)
 */
export function createUpgradedFarmhouse(scene, shadowGenerator, position) {
  const root = new TransformNode('upgraded-farmhouse-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.metadata = { type: 'player-home', tier: 2, homeId: 'country-manor' };

  // Nạp mô hình nhà 3D Dinh thự lớn 2 gian
  const manorModel = spawnVillageHouse(scene, 4, {
    position: new Vector3(0, 0, 0),
    scaling: new Vector3(4.8, 4.8, 4.8),
    rotation: new Vector3(0, Math.PI, 0),
    shadows: shadowGenerator,
    name: 'manor-house-3d',
  });
  manorModel.parent = root;

  // Hai đèn lồng hai bên cổng vào
  [-2.2, 2.2].forEach((offset, idx) => {
    const lantern = spawnModelSync(scene, MODEL_PATHS.town.lantern, {
      position: new Vector3(offset, 0, 3.6),
      scaling: new Vector3(1.3, 1.3, 1.3),
      shadows: shadowGenerator,
      name: `manor-lantern-3d-${idx}`,
    });
    lantern.parent = root;
  });

  // Xe kéo nông sản bằng gỗ trước sân
  const cart = spawnModelSync(scene, MODEL_PATHS.town.cart, {
    position: new Vector3(-5.2, 0, 2.5),
    rotation: new Vector3(0, Math.PI / 4, 0),
    scaling: new Vector3(1.5, 1.5, 1.5),
    shadows: shadowGenerator,
    name: 'manor-cart-3d',
  });
  cart.parent = root;

  // Khói bếp bốc lên từ ống khói lớn
  const smokeEmitter = new TransformNode('manor-smoke-emitter', scene);
  smokeEmitter.position.set(2.4, 9.2, -1.2);
  smokeEmitter.parent = root;

  const smokeSystem = new ParticleSystem('manor-smoke', 50, scene);
  smokeSystem.particleTexture = createSmokeTexture(scene);
  smokeSystem.emitter = smokeEmitter;
  smokeSystem.minEmitBox = new Vector3(-0.2, 0, -0.2);
  smokeSystem.maxEmitBox = new Vector3(0.2, 0.25, 0.2);
  smokeSystem.color1 = new Color4(0.96, 0.95, 0.92, 0.7);
  smokeSystem.color2 = new Color4(0.88, 0.88, 0.85, 0.4);
  smokeSystem.colorDead = new Color4(0.8, 0.85, 0.8, 0.0);
  smokeSystem.minSize = 0.8;
  smokeSystem.maxSize = 2.4;
  smokeSystem.minLifeTime = 2.5;
  smokeSystem.maxLifeTime = 4.2;
  smokeSystem.emitRate = 4.5;
  smokeSystem.direction1 = new Vector3(-0.3, 2.4, 0.25);
  smokeSystem.direction2 = new Vector3(0.3, 3.2, 0.6);
  smokeSystem.start();

  return {
    root,
    smokeSystem,
    dispose() {
      smokeSystem.dispose();
      root.dispose(false, false);
    },
  };
}

export { createUpgradedFarmhouse as createFarmhouse };

