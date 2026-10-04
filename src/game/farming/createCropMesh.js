import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { FARM_CONFIG } from '../../../shared/farmConfig.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { MODEL_PATHS, spawnModelSync } from '../rendering/ModelAssetManager.js';
import {
  createChibiCarrotMesh,
  createChibiPumpkinMesh,
  createChibiTurnipMesh,
  createChibiMelonMesh,
  createChibiTomatoMesh,
  createChibiWheatMesh,
} from '../world/createPlayTogetherProps.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial } from '../rendering/PlayTogetherTheme.js';

function getSoilMaterial(scene) {
  return createToyMaterial(scene, 'mat-toy-soil-choc-mound', PLAY_TOGETHER_PALETTE.farm.chocolateSoil, {
    specularPower: 24,
    specularLevel: 0.15,
    ambientScale: 0.45,
  });
}

/**
 * Tạo mô hình cây trồng 3D Stylized Chibi phong cách Play Together
 * @param {Scene} scene
 * @param {string} cropId 'carrot' | 'wheat' | 'pumpkin' | 'tomato' | 'strawberry' | 'melon' | 'turnip'
 * @param {number} progress 0.0 -> 1.0
 * @param {string} key Unique key for naming
 * @param {ShadowGenerator} shadows
 */
export function createCropMesh(scene, cropId, progress, key, shadows = null) {
  const crop = buildCropMesh(scene, cropId, progress, key, shadows);
  crop.root.scaling.scaleInPlace(FARM_CONFIG.visuals.cropScale);
  return crop;
}

function buildCropMesh(scene, cropId, progress, key, shadows = null) {
  // Bộ mô hình Chibi Play Together độc quyền thế hệ mới
  switch (cropId) {
    case 'carrot':
      return createChibiCarrotMesh(scene, key, progress, { shadows });
    case 'pumpkin':
      return createChibiPumpkinMesh(scene, key, progress, { shadows });
    case 'turnip':
      return createChibiTurnipMesh(scene, key, progress, { shadows });
    case 'melon':
      return createChibiMelonMesh(scene, key, progress, { shadows });
    case 'tomato':
    case 'strawberry':
      return createChibiTomatoMesh(scene, key, progress, { shadows });
    case 'wheat':
      return createChibiWheatMesh(scene, key, progress, { shadows });
    default:
      break;
  }

  const root = new TransformNode(`crop-root-${key}`, scene);

  // Ụ đất sô-cô-la tơi xốp bo tròn mềm mại
  const mound = MeshBuilder.CreateSphere(`mound-${key}`, {
    diameterX: 1.05,
    diameterY: 0.28,
    diameterZ: 1.05,
    segments: 10,
  }, scene);
  mound.position.y = 0.06;
  mound.material = getSoilMaterial(scene);
  mound.parent = root;

  // Chọn model theo từng giai đoạn và loại cây trồng
  let modelPath;
  let baseScale = 1.6;

  if (progress < 0.35) {
    // Giai đoạn 1: Mầm lá xanh non mới nhú
    modelPath = MODEL_PATHS.crops.leafsA;
    baseScale = 0.8 + progress * 2.2;
  } else if (progress < 0.75) {
    // Giai đoạn 2: Cây lá đang lớn xum xuê
    modelPath = MODEL_PATHS.crops.leafsB;
    baseScale = 1.2 + (progress - 0.35) * 1.0;
  } else {
    // Giai đoạn 3: Cây trưởng thành chín mọng thu hoạch được
    switch (cropId) {
      case 'wheat':
        modelPath = MODEL_PATHS.crops.wheatB;
        baseScale = 1.9;
        break;
      case 'pumpkin':
      case 'tomato':
        modelPath = MODEL_PATHS.crops.pumpkin;
        baseScale = 1.6;
        break;
      case 'melon':
      case 'strawberry':
        modelPath = MODEL_PATHS.crops.melon;
        baseScale = 1.7;
        break;
      case 'turnip':
        modelPath = MODEL_PATHS.crops.turnip;
        baseScale = 1.7;
        break;
      default:
        modelPath = MODEL_PATHS.crops.leafsB;
        baseScale = 1.6;
        break;
    }
  }

  const cropModel = spawnModelSync(scene, modelPath, {
    position: new Vector3(0, 0.08, 0),
    rotation: new Vector3(0, ((key.charCodeAt(0) || 1) * 0.7) % (Math.PI * 2), 0),
    scaling: new Vector3(baseScale, baseScale, baseScale),
    shadows,
    name: `crop-3d-${key}`,
  });
  cropModel.parent = root;

  // Hiệu ứng ngôi sao vàng 3D xoay tít nếu đã chín sẵn sàng thu hoạch (progress >= 1.0)
  let starIcon = null;
  if (progress >= 1.0) {
    const starRoot = new TransformNode(`crop-star-${key}`, scene);
    starRoot.position.set(0, 1.65, 0);
    starRoot.parent = root;

    const starMat = createToyMaterial(scene, 'mat-toy-gold-star', PLAY_TOGETHER_PALETTE.fx.goldStar, {
      emissiveHex: '#f59e0b',
      specularPower: 128,
      specularLevel: 0.8,
    });

    const starMesh = MeshBuilder.CreateCylinder(`gold-star-mesh-${key}`, {
      height: 0.1,
      diameter: 0.52,
      tessellation: 5,
    }, scene);
    starMesh.rotation.x = Math.PI / 2;
    starMesh.material = starMat;
    starMesh.parent = starRoot;

    const halo = MeshBuilder.CreateTorus(`crop-halo-${key}`, {
      diameter: 0.72,
      thickness: 0.03,
      tessellation: 16,
    }, scene);
    halo.material = starMat;
    halo.parent = starRoot;

    starIcon = starRoot;
  }

  return {
    root,
    animate: (t) => {
      root.rotation.z = Math.sin(t * 0.003 + (key.charCodeAt(0) || 0)) * 0.04;
      if (starIcon && !starIcon.isDisposed()) {
        starIcon.position.y = 1.65 + Math.sin(t * 0.004) * 0.1;
        starIcon.rotation.y = t * 0.0025;
      }
    },
  };
}

/**
 * Hiệu ứng hạt thu hoạch mùa màng lấp lánh (Harvest sparkle particles)
 */
export function spawnHarvestParticles(scene, position, colorHex = '#facc15') {
  const emitter = new TransformNode('harvest-sparkle-emitter', scene);
  emitter.position.copyFrom(position);
  emitter.position.y += 0.5;

  setTimeout(() => {
    if (!emitter.isDisposed()) emitter.dispose();
  }, 1500);
}

/**
 * Hiệu ứng bụi đất tung bay khi cuốc đất (Dirt dig particles)
 */
export function spawnDirtDigParticles(scene, position) {
  const emitter = new TransformNode('dirt-dig-emitter', scene);
  emitter.position.copyFrom(position);
  emitter.position.y += 0.2;

  setTimeout(() => {
    if (!emitter.isDisposed()) emitter.dispose();
  }, 1200);
}

/**
 * Hiệu ứng tia nước tưới mát lành (Water splash particles)
 */
export function spawnWaterSplash(scene, position) {
  const emitter = new TransformNode('water-splash-emitter', scene);
  emitter.position.copyFrom(position);
  emitter.position.y += 0.3;

  setTimeout(() => {
    if (!emitter.isDisposed()) emitter.dispose();
  }, 1200);
}

