import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { MODEL_PATHS, spawnModelSync } from '../rendering/ModelAssetManager.js';

function createMat(scene, name, hex, emissiveHex = null) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.35);
  m.specularColor = new Color3(0.06, 0.06, 0.06);
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

/**
 * Hệ Thống Động Vật Nông Trại 3D Sống Động
 * 1. Bò Sữa 3D (Spotted Cow Model)
 * 2. Cừu Alpaca Lông Mềm 3D (Alpaca Sheep Model)
 * 3. Chó Shiba Trông Trại 3D (Shiba Inu Dog Model)
 * 4. Đàn Vịt Vàng Bơi Hồ 3D (Lake Duck Model)
 * 5. Ngựa Nông Trại 3D (Farm Horse Model)
 * 6. Đàn Bướm Cầu Vồng Bay Lượn
 */
export function createFarmAnimals(scene, shadows) {
  const animalRoot = new TransformNode('farm-animals-root', scene);

  const materials = {
    butterflyPink: createMat(scene, 'bf-pink-bright', '#f472b6', '#fb7185'),
    butterflyBlue: createMat(scene, 'bf-blue-bright', '#38bdf8', '#0284c7'),
    butterflyYellow: createMat(scene, 'bf-yellow-bright', '#fde047', '#facc15'),
  };

  const animators = [];

  // ==========================================
  // 1. TẠO BÒ SỮA 3D (3D SPOTTED COW)
  // ==========================================
  function createChibiCow(x, z, rotationY = 0) {
    const s = 0.45;
    const cow = spawnModelSync(scene, MODEL_PATHS.animals.cow, {
      position: new Vector3(x, 0, z),
      rotation: new Vector3(0, rotationY, 0),
      scaling: new Vector3(s, s, s),
      shadows,
      name: 'farm-cow-3d',
      colorTint: Color3.FromHexString('#d6a84e'),
    });
    cow.parent = animalRoot;

    // Hiệu ứng nhịp thở / lắc đầu nhẹ
    let time = Math.random() * 10;
    animators.push(dt => {
      time += dt * 1.5;
      cow.rotation.y = rotationY + Math.sin(time) * 0.08;
    });
    return cow;
  }

  // ==========================================
  // 2. TẠO CỪU ALPACA 3D (3D FLUFFY SHEEP)
  // ==========================================
  function createChibiSheep(x, z, rotationY = 0) {
    const s = 0.35;
    const sheep = spawnModelSync(scene, MODEL_PATHS.animals.alpaca, {
      position: new Vector3(x, 0, z),
      rotation: new Vector3(0, rotationY, 0),
      scaling: new Vector3(s, s, s),
      shadows,
      name: 'farm-sheep-3d',
    });
    sheep.parent = animalRoot;

    let time = Math.random() * 10;
    animators.push(dt => {
      time += dt * 2.0;
      sheep.position.y = Math.max(0, Math.sin(time) * 0.06);
    });
    return sheep;
  }

  // ==========================================
  // 3. TẠO CHÓ SHIBA 3D (3D FARM DOG)
  // ==========================================
  function createFarmDog(x, z, rotationY = 0) {
    const s = 0.32;
    const dog = spawnModelSync(scene, MODEL_PATHS.animals.shiba, {
      position: new Vector3(x, 0, z),
      rotation: new Vector3(0, rotationY, 0),
      scaling: new Vector3(s, s, s),
      shadows,
      name: 'farm-shiba-3d',
    });
    dog.parent = animalRoot;
    return dog;
  }

  // ==========================================
  // 4. TẠO NGỰA NÔNG TRẠI 3D (3D FARM HORSE)
  // ==========================================
  function createFarmHorse(x, z, rotationY = 0) {
    const s = 0.018;
    const horse = spawnModelSync(scene, MODEL_PATHS.animals.horse, {
      position: new Vector3(x, 0, z),
      rotation: new Vector3(0, rotationY, 0),
      scaling: new Vector3(s, s, s),
      shadows,
      name: 'farm-horse-3d',
    });
    horse.parent = animalRoot;
    return horse;
  }
  // ==========================================
  // 5. TẠO CÁO TINH NGHỊCH 3D (3D FOX)
  // ==========================================
  function createFarmFox(x, z, rotationY = 0) {
    const s = 0.022;
    const fox = spawnModelSync(scene, MODEL_PATHS.animals.fox, {
      position: new Vector3(x, 0, z),
      rotation: new Vector3(0, rotationY, 0),
      scaling: new Vector3(s, s, s),
      shadows,
      name: 'wild-fox-3d',
    });
    fox.parent = animalRoot;
    return fox;
  }

  // ==========================================
  // 6. TẠO ĐÀN VỊT VÀNG 3D BƠI HỒ PHA LÊ
  // ==========================================
  function createLakeDucks(lakeX, lakeZ) {
    const ducks = [];
    for (let d = 0; d < 3; d++) {
      const s = 0.015;
      const duck = spawnModelSync(scene, MODEL_PATHS.animals.duck, {
        position: new Vector3(lakeX, 0.1, lakeZ),
        scaling: new Vector3(s, s, s),
        shadows,
        name: `lake-duck-3d-${d}`,
      });
      duck.parent = animalRoot;

      ducks.push({
        node: duck,
        angle: (d * 2 * Math.PI) / 3,
        radius: 8.5 + d * 2.2,
        speed: 0.25 + d * 0.08,
        bobOffset: d * 1.5,
      });
    }

    animators.push(dt => {
      ducks.forEach(dk => {
        dk.angle += dk.speed * dt;
        const curX = lakeX + Math.cos(dk.angle) * dk.radius;
        const curZ = lakeZ + Math.sin(dk.angle) * dk.radius;
        const bobY = 0.08 + Math.sin(dk.angle * 6 + dk.bobOffset) * 0.04;
        dk.node.position.set(curX, bobY, curZ);
        dk.node.rotation.y = -dk.angle - Math.PI / 2;
      });
    });
  }

  // ==========================================
  // 7. ĐÀN BƯỚM HOA LƯỢN (BUTTERFLIES)
  // ==========================================
  function createButterflySwarm(centerX, centerZ) {
    const swarmRoot = new TransformNode('butterfly-swarm', scene);
    swarmRoot.position.set(centerX, 0, centerZ);
    swarmRoot.parent = animalRoot;

    const bMats = [materials.butterflyPink, materials.butterflyBlue, materials.butterflyYellow];
    const butterflies = [];

    for (let i = 0; i < 4; i++) {
      const bfNode = new TransformNode(`butterfly-${i}`, scene);
      bfNode.parent = swarmRoot;
      const mat = bMats[i % bMats.length];

      const wingL = MeshBuilder.CreatePlane(`wing-l-${i}`, { width: 0.18, height: 0.16 }, scene);
      wingL.position.x = -0.09;
      wingL.material = mat;
      wingL.parent = bfNode;

      const wingR = MeshBuilder.CreatePlane(`wing-r-${i}`, { width: 0.18, height: 0.16 }, scene);
      wingR.position.x = 0.09;
      wingR.material = mat;
      wingR.parent = bfNode;

      butterflies.push({
        node: bfNode,
        wingL,
        wingR,
        radius: 1.5 + i * 0.8,
        speed: 1.2 + i * 0.4,
        angle: (i * Math.PI) / 2,
        heightOffset: 0.8 + i * 0.3,
      });
    }

    animators.push((dt) => {
      butterflies.forEach((b) => {
        b.angle += dt * b.speed;
        b.node.position.set(
          Math.cos(b.angle) * b.radius,
          b.heightOffset + Math.sin(b.angle * 2.5) * 0.35,
          Math.sin(b.angle) * b.radius
        );
        b.node.rotation.y = -b.angle + Math.PI / 2;
        const flap = Math.sin(b.angle * 18) * 0.85;
        b.wingL.rotation.y = flap;
        b.wingR.rotation.y = -flap;
      });
    });
  }

  // === ĐẶT CÁC CON VẬT VÀO ĐÚNG KHU VỰC CHUỒNG TRANG TRẠI (ANIMAL PEN X:88, Z:112) ===
  // Bò sữa gặm cỏ trong chuồng trang trại đồng quê
  createChibiCow(85, 114, Math.PI / 4);
  createChibiCow(91, 116, -Math.PI / 3);

  // Cừu lông mềm trong đồng cỏ trang trại
  createChibiSheep(84, 118, Math.PI / 6);
  createChibiSheep(92, 112, -Math.PI / 4);

  // Chú chó Shiba canh cổng Nông Trại Thung Lũng
  createFarmDog(-70, 36, -Math.PI / 3);
  createFarmDog(-74, 34, Math.PI / 4);

  // Ngựa trang trại trong bãi cỏ chuồng trại (hoàn toàn an toàn khỏi trục đường x=60)
  createFarmHorse(88, 108, Math.PI / 3);
  createFarmHorse(94, 114, -Math.PI / 4);

  // Chú cáo cam lấp ló bìa rừng thông
  createFarmFox(120, -45, Math.PI / 2);

  // Đàn bướm hoa dập dờn quanh luống hoa
  createButterflySwarm(-14, -6);
  createButterflySwarm(14, 8);

  // Đàn vịt vàng 3D bơi lội nhấp nhô trên Hồ Pha Lê
  createLakeDucks(165, 2);

  const observer = scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    animators.forEach(fn => fn(dt));
  });

  return {
    root: animalRoot,
    dispose: () => {
      scene.onBeforeRenderObservable.remove(observer);
      animalRoot.dispose(false, true);
    }
  };
}
