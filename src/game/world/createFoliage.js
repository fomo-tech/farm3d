import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';

function mat(scene, name, hex, emissiveHex = null) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.35);
  m.specularColor = new Color3(0.06, 0.06, 0.06);
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

import { MODEL_PATHS, spawnModelSync } from '../rendering/ModelAssetManager.js';
import {
  createMarshmallowTree,
  createCandyFlowerBush,
  createCandyPebbleRock,
} from './createPlayTogetherProps.js';

function harmonizeGreenTree({ childMeshes }) {
  const updated = new Set();
  childMeshes.forEach(mesh => {
    const material = mesh.material;
    if (!material || updated.has(material)) return;
    updated.add(material);
    if (/leaf|foliage|canopy/i.test(material.name)) {
      const green = Color3.FromHexString('#22c55e');
      if (material.albedoColor) material.albedoColor = green;
      if (material.diffuseColor) material.diffuseColor = green;
      material.metallic = 0;
      material.roughness = 0.78;
    } else if (/bark|trunk/i.test(material.name)) {
      const bark = Color3.FromHexString('#78350f');
      if (material.albedoColor) material.albedoColor = bark;
      if (material.diffuseColor) material.diffuseColor = bark;
      material.metallic = 0;
      material.roughness = 0.88;
    }
  });
}

export function createFoliageFactory(scene, shadows) {
  const materials = {
    trunk: mat(scene, 'tree-trunk-mat', '#78350f'),
    leafTop: mat(scene, 'tree-leaf-top', '#86efac'),
    leafMid: mat(scene, 'tree-leaf-mid', '#22c55e'),
    leafBot: mat(scene, 'tree-leaf-bot', '#16a34a'),
    apple: mat(scene, 'tree-apple-mat', '#f43f5e', '#be123c'),
    wood: mat(scene, 'foliage-wood-mat', '#78350f'),
    stone: mat(scene, 'well-stone-mat', '#9ca3af'),
    roof: mat(scene, 'well-roof-mat', '#e11d48'),
    water: mat(scene, 'well-water-mat', '#38bdf8', '#0284c7'),
    cloth: mat(scene, 'scarecrow-cloth', '#38bdf8'),
    straw: mat(scene, 'scarecrow-straw', '#fde047'),
    hat: mat(scene, 'scarecrow-hat', '#d97706'),
    petalColors: ['#fde047', '#fb923c', '#f43f5e', '#a855f7', '#ffffff'].map((hex, i) => mat(scene, `petal-${i}`, hex)),
    stem: mat(scene, 'flower-stem', '#4ade80'),
    bushLeaf: mat(scene, 'bush-leaf', '#16a34a'),
    ironBlack: mat(scene, 'lamp-iron', '#334155'),
  };

  return {
    createMarshmallowTree(x, z, scale = 1.0, colorVariant = 'mint') {
      return createMarshmallowTree(scene, x, z, { scale: scale * 1.5, colorVariant, shadows });
    },

    createCandyFlowerBush(x, z, scale = 1.0) {
      return createCandyFlowerBush(scene, x, z, { scale: scale * 1.4, shadows });
    },

    createCandyPebbleRock(x, z, scale = 1.0, colorHex = '#94a3b8') {
      return createCandyPebbleRock(scene, x, z, { scale: scale * 1.4, colorHex, shadows });
    },

    createCloudTree(x, z, scale = 1.0, withShadows = true) {
      const treeModel = Math.random() > 0.5 ? MODEL_PATHS.trees.oak : MODEL_PATHS.trees.detailed;
      const s = scale * 4.2;
      return spawnModelSync(scene, treeModel, {
        position: new Vector3(x, 0, z),
        rotation: new Vector3(0, Math.random() * Math.PI * 2, 0),
        scaling: new Vector3(s, s, s),
        shadows: withShadows ? shadows : null,
        name: 'cozy-tree',
        onLoaded: harmonizeGreenTree,
      });
    },

    createSakuraTree(x, z, scale = 1.0, withShadows = true) {
      const s = scale * 3.8;
      return spawnModelSync(scene, MODEL_PATHS.trees.oak, {
        position: new Vector3(x, 0, z),
        rotation: new Vector3(0, Math.random() * Math.PI * 2, 0),
        scaling: new Vector3(s, s, s),
        shadows: withShadows ? shadows : null,
        name: 'sakura-tree',
        colorTint: Color3.FromHexString('#f472b6'),
      });
    },

    /**
     * 1. Cây thông núi cao nguyên (Alpine Pine) - Vùng Hồ Pha Lê
     */
    createAlpinePine(x, z, scale = 1.0, withShadows = true) {
      const pineModel = Math.random() > 0.5 ? MODEL_PATHS.trees.pine : MODEL_PATHS.trees.pineRound;
      const s = scale * 4.6;
      return spawnModelSync(scene, pineModel, {
        position: new Vector3(x, 0, z),
        rotation: new Vector3(0, Math.random() * Math.PI * 2, 0),
        scaling: new Vector3(s, s, s),
        shadows: withShadows ? shadows : null,
        name: 'alpine-pine',
      });
    },

    createTropicalPalm(x, z, scale = 1.0, tiltAngle = 0.22, withShadows = true) {
      const palmModel = Math.random() > 0.5 ? MODEL_PATHS.trees.palmBend : MODEL_PATHS.trees.palm;
      const s = scale * 4.0;
      return spawnModelSync(scene, palmModel, {
        position: new Vector3(x, 0, z),
        rotation: new Vector3(0, Math.random() * Math.PI * 2, 0),
        scaling: new Vector3(s, s, s),
        shadows: withShadows ? shadows : null,
        name: 'tropical-palm',
      });
    },

    createGoldenMaple(x, z, scale = 1.0, withShadows = true) {
      const mapleModel = Math.random() > 0.5 ? MODEL_PATHS.trees.fall : MODEL_PATHS.trees.oakFall;
      const s = scale * 4.0;
      return spawnModelSync(scene, mapleModel, {
        position: new Vector3(x, 0, z),
        rotation: new Vector3(0, Math.random() * Math.PI * 2, 0),
        scaling: new Vector3(s, s, s),
        shadows: withShadows ? shadows : null,
        name: 'golden-maple',
      });
    },

    createHydrangeaBush(x, z, colorHex = '#a78bfa', scale = 1.0) {
      if (typeof colorHex === 'number') {
        [colorHex, scale] = [scale, colorHex];
      }
      const s = (scale || 1.0) * 2.5;
      return spawnModelSync(scene, MODEL_PATHS.foliage.bushDetailed, {
        position: new Vector3(x, 0, z),
        rotation: new Vector3(0, Math.random() * Math.PI * 2, 0),
        scaling: new Vector3(s, s, s),
        shadows,
        name: 'hydrangea-bush',
      });
    },

    createRusticBench(x, z, rotationY = 0) {
      const root = new TransformNode('rustic-bench', scene);
      root.position.set(x, 0, z);
      root.rotation.y = rotationY;

      const seat = MeshBuilder.CreateBox('bench-seat', { width: 1.8, height: 0.1, depth: 0.6 }, scene);
      seat.position.set(0, 0.5, 0);
      seat.material = materials.wood;
      seat.parent = root;

      const back = MeshBuilder.CreateBox('bench-back', { width: 1.8, height: 0.55, depth: 0.08 }, scene);
      back.position.set(0, 0.85, -0.28);
      back.rotation.x = -0.15;
      back.material = materials.wood;
      back.parent = root;

      [-0.75, 0.75].forEach((lx, idx) => {
        const leg = MeshBuilder.CreateBox(`bench-leg-${idx}`, { width: 0.08, height: 0.5, depth: 0.55 }, scene);
        leg.position.set(lx, 0.25, 0);
        leg.material = materials.ironBlack;
        leg.parent = root;
      });

      shadows?.addShadowCaster(seat);
      shadows?.addShadowCaster(back);
      return root;
    },

    createVintageStreetLamp(x, z) {
      return spawnModelSync(scene, MODEL_PATHS.town.lantern, {
        position: new Vector3(x, 0, z),
        scaling: new Vector3(1.3, 1.3, 1.3),
        shadows,
        name: 'vintage-street-lamp',
      });
    },

    createFlowerPatch(x, z, count = 9, radius = 2.4) {
      const root = new TransformNode('flower-patch', scene);
      root.position.set(x, 0, z);

      const flowerModels = [
        MODEL_PATHS.foliage.flowerRed,
        MODEL_PATHS.foliage.flowerYellow,
        MODEL_PATHS.foliage.flowerPurple,
      ];

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.35;
        const dist = 0.4 + ((i * 17) % 10) / 10 * (radius - 0.5);
        const fx = Math.cos(angle) * dist;
        const fz = Math.sin(angle) * dist;
        const model = flowerModels[i % flowerModels.length];
        const flw = spawnModelSync(scene, model, {
          position: new Vector3(fx, 0, fz),
          rotation: new Vector3(0, Math.random() * Math.PI * 2, 0),
          scaling: new Vector3(1.6, 1.6, 1.6),
          shadows,
          name: `flw-${i}`,
        });
        flw.parent = root;
      }
      return root;
    },

    createScarecrow(x, z) {
      const root = new TransformNode('farm-scarecrow', scene);
      root.position.set(x, 0, z);

      // Wooden Post & Crossbar (Gỗ sồi mộc mạc)
      const post = MeshBuilder.CreateCylinder('scarecrow-post', { height: 3.3, diameter: 0.16, tessellation: 10 }, scene);
      post.position.y = 1.65;
      post.material = materials.wood;
      post.parent = root;

      const crossbar = MeshBuilder.CreateBox('scarecrow-crossbar', { width: 2.4, height: 0.14, depth: 0.14 }, scene);
      crossbar.position.y = 2.3;
      crossbar.material = materials.wood;
      crossbar.parent = root;

      // Áo sơ mi xanh jean viền sọc
      const shirt = MeshBuilder.CreateBox('scarecrow-shirt', { width: 1.15, height: 1.35, depth: 0.65 }, scene);
      shirt.position.y = 1.85;
      shirt.material = materials.cloth;
      shirt.parent = root;

      // Cổ áo yếm đỏ tươi
      const collar = MeshBuilder.CreateBox('scarecrow-collar', { width: 0.7, height: 0.12, depth: 0.7 }, scene);
      collar.position.y = 2.45;
      collar.material = mat(scene, 'scarecrow-red-tie', '#ef4444');
      collar.parent = root;

      // Búi rơm vàng xòe 2 đầu cánh tay
      [-1.15, 1.15].forEach((px, i) => {
        const strawArm = MeshBuilder.CreateSphere(`straw-arm-${i}`, { diameter: 0.35, segments: 6 }, scene);
        strawArm.scaling.set(1.5, 0.7, 0.7);
        strawArm.position.set(px, 2.3, 0);
        strawArm.material = materials.straw;
        strawArm.parent = root;
      });

      // Đầu bao bố rơm tròn mũm mĩm có mắt cúc áo
      const head = MeshBuilder.CreateSphere('scarecrow-head', { diameter: 0.8, segments: 10 }, scene);
      head.position.y = 2.85;
      head.material = materials.straw;
      head.parent = root;

      // Mũi cà rốt cam
      const nose = MeshBuilder.CreateCylinder('scarecrow-nose', { height: 0.3, diameterTop: 0.02, diameterBottom: 0.15 }, scene);
      nose.rotation.x = Math.PI / 2;
      nose.position.set(0, 2.85, 0.45);
      nose.material = mat(scene, 'scarecrow-carrot-nose', '#f97316');
      nose.parent = root;

      // Nón rơm rộng vành có dải nơ đỏ
      const hatBrim = MeshBuilder.CreateCylinder('scarecrow-hat-brim', { height: 0.08, diameter: 1.55, tessellation: 16 }, scene);
      hatBrim.position.y = 3.15;
      hatBrim.rotation.z = 0.08;
      hatBrim.material = materials.hat;
      hatBrim.parent = root;

      const hatRibbon = MeshBuilder.CreateCylinder('scarecrow-hat-ribbon', { height: 0.14, diameter: 0.88, tessellation: 16 }, scene);
      hatRibbon.position.set(0.02, 3.25, 0);
      hatRibbon.rotation.z = 0.08;
      hatRibbon.material = mat(scene, 'scarecrow-ribbon', '#ef4444');
      hatRibbon.parent = root;

      const hatCrown = MeshBuilder.CreateCylinder('scarecrow-hat-crown', { height: 0.55, diameterTop: 0.65, diameterBottom: 0.85, tessellation: 16 }, scene);
      hatCrown.position.set(0.04, 3.5, 0);
      hatCrown.rotation.z = 0.08;
      hatCrown.material = materials.hat;
      hatCrown.parent = root;

      [post, shirt, head, hatBrim].forEach(m => shadows?.addShadowCaster(m));
      return root;
    },

    createStoneWell(x, z) {
      const root = new TransformNode('farm-well', scene);
      root.position.set(x, 0, z);

      // Bệ giếng đá tròn cổ tích ghép từ đá cuội sáng màu
      const stoneBase = MeshBuilder.CreateCylinder('well-base', { height: 1.35, diameter: 2.5, tessellation: 20 }, scene);
      stoneBase.position.y = 0.68;
      stoneBase.material = mat(scene, 'well-stone-bright', '#cbd5e1');
      stoneBase.parent = root;

      // Viền miệng giếng đá bo tròn nổi
      const rim = MeshBuilder.CreateTorus('well-rim', { diameter: 2.5, thickness: 0.22, tessellation: 20 }, scene);
      rim.position.y = 1.35;
      rim.material = mat(scene, 'well-stone-rim', '#94a3b8');
      rim.parent = root;

      // Mặt nước giếng trong veo xanh ngọc
      const water = MeshBuilder.CreateCylinder('well-water', { height: 0.08, diameter: 2.1 }, scene);
      water.position.y = 1.05;
      water.material = materials.water;
      water.parent = root;

      // 2 Cột trụ gỗ sồi mái che giếng
      [-0.98, 0.98].forEach((px, i) => {
        const p = MeshBuilder.CreateCylinder(`well-post-${i}`, { height: 2.7, diameter: 0.18, tessellation: 12 }, scene);
        p.position.set(px, 1.95, 0);
        p.material = materials.wood;
        p.parent = root;
      });

      // Mái che ngói đỏ tươi cong vút cổ tích
      const roof = MeshBuilder.CreateCylinder('well-roof', { diameter: 2.9, height: 2.7, tessellation: 4 }, scene);
      roof.rotation.z = Math.PI / 4;
      roof.rotation.y = Math.PI / 4;
      roof.scaling.set(0.72, 0.72, 1.1);
      roof.position.set(0, 3.45, 0);
      roof.material = mat(scene, 'well-roof-terracotta', '#f97316');
      roof.parent = root;

      // Trục quay & Dây thừng treo xô nước
      const axle = MeshBuilder.CreateCylinder('well-axle', { height: 1.9, diameter: 0.14 }, scene);
      axle.rotation.z = Math.PI / 2;
      axle.position.set(0, 2.35, 0);
      axle.material = materials.wood;
      axle.parent = root;

      // Xô gỗ múc nước treo lủng lẳng
      const bucket = MeshBuilder.CreateCylinder('well-bucket', { height: 0.48, diameterTop: 0.48, diameterBottom: 0.38, tessellation: 12 }, scene);
      bucket.position.set(0, 1.7, 0);
      bucket.material = materials.wood;
      bucket.parent = root;

      [stoneBase, rim, roof].forEach(m => shadows?.addShadowCaster(m));
      return root;
    },
  };
}
