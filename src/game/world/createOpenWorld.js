import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { createMeadowTexture, createWaterTexture, createCobblePathTexture, createSandTexture, createHoneyPathTexture } from './createStylizedTextures.js';
import { createFoliageFactory } from './createFoliage.js';
import { buildHumanMesh } from '../player/buildHumanMesh.js';

// Landmark imports
import { createWindmill } from './landmarks/createWindmill.js';
import { createGrainSilo, createArtisanWorkshop } from './landmarks/createSiloAndWorkshop.js';
import { createTownHall } from './landmarks/createTownHall.js';
import { createMajesticFountain } from './landmarks/createFountain.js';
import { createLighthouse } from './landmarks/createLighthouse.js';
import { createLakeDistrict, createBeachDistrict } from './landmarks/createWaterBody.js';
import { createCentralRoundabout } from './landmarks/createCentralRoundabout.js';
import { createFarmersMarket } from './landmarks/createFarmersMarket.js';
import { createPlayTogetherPlaza } from './landmarks/createPlayTogetherPlaza.js';
import { createSteamboatPort } from './landmarks/createSteamboatPort.js';
import {
  createModernFarmhouse,
  createClassicRedBarn,
  createRoadsideShop,
  createDeliveryTruckStation,
} from './landmarks/createSocialFarmstead.js';
import {
  createModernBoulevard,
  createZebraCrosswalk,
} from './createModernRoadSystem.js';
import {
  createConcertStage,
  createVintageCoffeeVan,
  createSmartBusShelter,
  createLuckyWheel3D,
  createClawMachine3D,
  createDowntownSkatePark,
  createTownDirectoryKiosk,
  createSkateboardRack,
} from './landmarks/createPlazaAmenities.js';
import { MODEL_PATHS, spawnModelSync } from '../rendering/ModelAssetManager.js';

function mat(scene, name, hex, emissive = null) {
  const value = new StandardMaterial(name, scene);
  value.diffuseColor = Color3.FromHexString(hex);
  value.ambientColor = value.diffuseColor.scale(0.35);
  value.specularColor = new Color3(0.06, 0.06, 0.06);
  if (emissive) value.emissiveColor = Color3.FromHexString(emissive);
  return value;
}

function box(scene, name, size, position, material, parent = null) {
  const mesh = MeshBuilder.CreateBox(name, size, scene);
  mesh.position.copyFrom(position);
  mesh.material = material;
  mesh.parent = parent;
  mesh.receiveShadows = true;
  return mesh;
}


function createSteppingStoneTrail(scene, startPos, endPos, materials, count = 7) {
  const root = new TransformNode(`stepping-stones-${startPos.x}-${startPos.z}`, scene);
  const p1 = new Vector3(startPos.x, 0.025, startPos.z);
  const p2 = new Vector3(endPos.x, 0.025, endPos.z);

  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const curPos = Vector3.Lerp(p1, p2, t);
    // Độ so le so le nhẹ tạo nét tự nhiên đồng quê
    const zigZag = (i % 2 === 0 ? 0.22 : -0.22);
    curPos.x += zigZag;

    const stone = MeshBuilder.CreateCylinder(`step-stone-${i}`, {
      diameter: 0.75 + (i % 3) * 0.1,
      height: 0.035,
      tessellation: 8,
    }, scene);
    stone.position.copyFrom(curPos);
    stone.rotation.y = (i * 0.65);
    stone.scaling.set(1.0, 1.0, 0.75 + (i % 2) * 0.2); // Dạng phiến đá dẹt elip
    stone.material = materials.sidewalk;
    stone.parent = root;
    stone.receiveShadows = true;
  }
  return root;
}

function citizen(scene, x, z, hex, shadows) {
  const human = buildHumanMesh(scene, `citizen-${x}-${z}`, {
    outfitColor: hex,
    skinColor: '#fcd5b5',
    hairColor: '#4a2c11',
    pantsColor: '#2b4162',
    bootsColor: '#5c381e',
    shadows,
  });
  human.root.position.set(x, 0, z);
  human.animate(0, false, 0);
  return human;
}

function market(scene, x, z, hex, materials, shadows) {
  const stallModel = Math.random() > 0.5 ? MODEL_PATHS.town.stallRed : MODEL_PATHS.town.stallGreen;
  return spawnModelSync(scene, stallModel, {
    position: new Vector3(x, 0, z),
    scaling: new Vector3(2.0, 2.0, 2.0),
    shadows,
    name: `market-stall-3d-${x}-${z}`,
  });
}

function lamp(scene, x, z, materials) {
  return spawnModelSync(scene, MODEL_PATHS.town.lantern, {
    position: new Vector3(x, 0, z),
    scaling: new Vector3(1.3, 1.3, 1.3),
    name: `town-lamp-3d-${x}-${z}`,
  });
}

function terrainPatch(scene, name, x, z, width, depth, material) {
  const patch = MeshBuilder.CreateGround(name, { width, height: depth, subdivisions: 4 }, scene);
  patch.position.set(x, 0.04, z);
  patch.material = material;
  patch.receiveShadows = true;
  return patch;
}

function hill(scene, x, z, scale, material, shadows) {
  const value = MeshBuilder.CreateSphere('landscape-hill', { diameter: 10, segments: 10 }, scene);
  value.scaling.set(scale * 1.7, scale * 0.55, scale);
  value.position.set(x, -1 + scale * 1.3, z);
  value.material = material;
  value.receiveShadows = true;
  // Các quả đồi nền không đổ bóng để tránh tạo vệt bóng đen khổng lồ đè lên camera và người chơi
}

function zoneGate(scene, x, z, rotation, label, color, materials, shadows) {
  const root = new TransformNode(`zone-gate-${label}`, scene);
  root.position.set(x, 0, z);
  root.rotation.y = rotation;

  const matStoneBase = mat(scene, `gate-stone-${label}`, '#64748b');
  const matBeamWood = mat(scene, `gate-wood-${label}`, '#5c381e');

  const halfSpan = 9.2; // Độ rộng thông thủy 18.4m, bao trọn đại lộ 8.5m và 2 bên vỉa hè an toàn tuyệt đối
  const postHeight = 5.2; // Chiều cao 5.2m thông thoáng cho mọi phương tiện di chuyển

  // 1. Hai trụ cổng gỗ phong cách đồng quê mộc mạc
  [-halfSpan, halfSpan].forEach(px => {
    // Chân bệ đá
    const stoneBase = MeshBuilder.CreateCylinder(`gate-stone-base-${label}-${px}`, {
      height: 0.7,
      diameter: 0.85,
      tessellation: 14,
    }, scene);
    stoneBase.position.set(px, 0.35, 0);
    stoneBase.material = matStoneBase;
    stoneBase.parent = root;
    stoneBase.receiveShadows = true;
    shadows?.addShadowCaster(stoneBase);

    // Thân cột gỗ tròn thanh lịch
    const post = MeshBuilder.CreateCylinder(`gate-timber-post-${label}-${px}`, {
      height: postHeight,
      diameter: 0.44,
      tessellation: 16,
    }, scene);
    post.position.set(px, postHeight / 2 + 0.35, 0);
    post.material = matBeamWood;
    post.parent = root;
    post.receiveShadows = true;
    shadows?.addShadowCaster(post);

    // Mũ chụp đá trên đầu cột
    const cap = MeshBuilder.CreateCylinder(`gate-cap-${label}-${px}`, {
      height: 0.16,
      diameter: 0.65,
      tessellation: 12,
    }, scene);
    cap.position.set(px, postHeight + 0.42, 0);
    cap.material = matStoneBase;
    cap.parent = root;

    // Đèn lồng treo 3D tỏa ánh sáng ấm áp
    spawnModelSync(scene, MODEL_PATHS.town.lantern, {
      position: new Vector3(px + (px > 0 ? -0.5 : 0.5), postHeight - 0.2, 0),
      scaling: new Vector3(1.0, 1.0, 1.0),
      parent: root,
      name: `gate-lantern-${label}-${px}`,
    });

    // Kèo chống chéo thanh nhã
    const brace = MeshBuilder.CreateBox(`gate-brace-${label}-${px}`, { width: 0.2, height: 1.1, depth: 0.2 }, scene);
    brace.position.set(px + (px > 0 ? -0.4 : 0.4), postHeight - 0.1, 0);
    brace.rotation.z = px > 0 ? 0.6 : -0.6;
    brace.material = matBeamWood;
    brace.parent = root;
  });

  // 2. Hệ xà ngang vòm gỗ Pergola đồng quê
  const beamY = postHeight + 0.15;
  const mainBeam = box(scene, 'gate-main-beam', { width: halfSpan * 2 + 1.2, height: 0.32, depth: 0.48 }, new Vector3(0, beamY, 0), matBeamWood, root);
  mainBeam.receiveShadows = true;
  shadows?.addShadowCaster(mainBeam);

  const topBeam = box(scene, 'gate-top-beam', { width: halfSpan * 2 + 1.8, height: 0.18, depth: 0.64 }, new Vector3(0, beamY + 0.25, 0), matBeamWood, root);
  topBeam.receiveShadows = true;

  // Rui mè trang trí pergola phía trên
  for (let rx = -halfSpan + 0.4; rx <= halfSpan - 0.4; rx += 1.2) {
    const rafter = box(scene, `gate-rafter-${rx}`, { width: 0.14, height: 0.12, depth: 0.9 }, new Vector3(rx, beamY + 0.4, 0), matBeamWood, root);
  }

  // 3. Bảng hiệu khắc tên khu vực treo bằng xích sắt
  worldLabel(scene, label, root, color, beamY - 0.7);
}

function worldLabel(scene, text, parent, color, posY = 3.5) {
  const texture = new DynamicTexture(`label-${text}`, { width: 1024, height: 256 }, scene, true);
  texture.hasAlpha = true;
  const context = texture.getContext();
  context.clearRect(0, 0, 1024, 256);
  // Khung viền gỗ hoàng gia bo góc mềm mại
  context.fillStyle = 'rgba(28, 20, 14, 0.92)';
  context.roundRect(16, 20, 992, 216, 32);
  context.fill();
  context.strokeStyle = color;
  context.lineWidth = 12;
  context.stroke();
  texture.drawText(text, null, 152, 'bold 64px "Nunito", "Segoe UI", Arial, sans-serif', '#fffdf0', null, true, true);
  
  const labelMaterial = new StandardMaterial(`label-material-${text}`, scene);
  labelMaterial.diffuseTexture = texture;
  labelMaterial.opacityTexture = texture;
  labelMaterial.emissiveColor = Color3.FromHexString(color).scale(0.65);
  labelMaterial.backFaceCulling = false; // Đọc được từ cả 2 phía

  // Bảng chính gắn thanh nhã dưới xà ngang
  const labelMesh = MeshBuilder.CreatePlane(`label-plane-${text}`, { width: 5.0, height: 1.25 }, scene);
  labelMesh.position.set(0, posY, 0);
  labelMesh.material = labelMaterial;
  labelMesh.isPickable = false;
  labelMesh.parent = parent;

  // Dây xích sắt treo biển vào xà ngang
  const matChain = mat(scene, `label-chain-mat-${text}`, '#475569');
  [-1.8, 1.8].forEach(cx => {
    const chain = MeshBuilder.CreateCylinder(`label-chain-${text}-${cx}`, { height: 0.45, diameter: 0.04 }, scene);
    chain.position.set(cx, posY + 0.75, 0);
    chain.material = matChain;
    chain.parent = parent;
  });
}

export function createOpenWorld(scene, shadows) {
  const meadowTex = createMeadowTexture(scene);
  const honeyPathTex = createHoneyPathTexture(scene);
  const waterTex = createWaterTexture(scene);
  const cobbleTex = createCobblePathTexture(scene);
  const sandTex = createSandTexture(scene);

  const materials = {
    path: mat(scene, 'warm-path', '#eec784'),
    road: mat(scene, 'stone-road', '#ebc784'), // Đường đất nện mật ong làng quê cổ tích
    sidewalk: mat(scene, 'road-sidewalk', '#faecd3'), // Viền sỏi nhẵn màu kem bơ ấm áp
    marking: mat(scene, 'road-marking', '#deb977'),
    town: mat(scene, 'town-green', '#fdecc8'), // Gạch quảng trường thị trấn màu kem bơ châu Âu cổ điển
    sand: mat(scene, 'beach-sand', '#fde087'), // Bãi cát biển vàng ươm nắng
    water: mat(scene, 'world-water', '#38bdf8', '#0284c7'), // Nước biển/hồ xanh ngọc lam trong vắt
    wood: mat(scene, 'world-wood', '#93633e'), // Gỗ sồi mộc mạc ấm áp
    glow: mat(scene, 'lamp-glow-material', '#fef08a', '#eab308'),
    flower: mat(scene, 'flowers', '#fb7185'),
    meadow: mat(scene, 'meadow-ground', '#8fe052'), // Đồng cỏ xanh mạ non tươi tắn
    cityGround: mat(scene, 'city-ground', '#fbf3e4'), // Nền phố thị lát đá hoa cúc sáng bóng sang trọng
    lakeGround: mat(scene, 'lake-ground', '#6ad18a'), // Thảm cỏ xanh ngọc ven hồ
    coastGround: mat(scene, 'coast-ground', '#fed7aa'), // Cát duyên hải vàng mịn
    hill: mat(scene, 'hill-ground', '#6ec63b'), // Đồi núi xanh nõn chuối rạng rỡ nắng mai
    rock: mat(scene, 'cliff-rock', '#95a898'), // Vách đá tự nhiên phủ nhẹ rêu
  };

  materials.meadow.diffuseColor = Color3.White();
  materials.meadow.diffuseTexture = meadowTex;
  materials.road.diffuseTexture = honeyPathTex;
  materials.path.diffuseTexture = cobbleTex;
  materials.sidewalk.diffuseTexture = cobbleTex;
  materials.town.diffuseTexture = cobbleTex;
  materials.sand.diffuseTexture = sandTex;
  materials.water.diffuseTexture = waterTex;
  materials.water.alpha = 0.88;
  materials.sidewalk.diffuseColor = Color3.White();
  materials.sidewalk.diffuseTexture = honeyPathTex;
  materials.road.diffuseColor = Color3.White();
  materials.road.diffuseTexture = honeyPathTex;
  materials.sand.diffuseColor = Color3.White();
  materials.sand.diffuseTexture = sandTex;
  materials.coastGround.diffuseColor = Color3.White();
  materials.coastGround.diffuseTexture = sandTex;


  // Nhà riêng và lô ruộng được FarmWorld dựng hoàn toàn từ dữ liệu server.
  const foliage = createFoliageFactory(scene, shadows);


  // === BIOME 3: HỒ PHA LÊ & CAO NGUYÊN (Rừng thông núi cao vút) ===
  const pineCoords = [
    [142, 28, 1.3], [152, 36, 1.4], [178, 26, 1.2], [188, 14, 1.35],
    [195, -15, 1.25], [172, -30, 1.4], [145, -25, 1.2], [130, -10, 1.1],
    [165, 45, 1.5], [202, 32, 1.3], [138, 8, 1.2], [182, -2, 1.25],
  ];
  pineCoords.forEach(([px, pz, ps]) => foliage.createAlpinePine(px, pz, ps));
  foliage.createRusticBench(154, 12, -Math.PI / 4);
  foliage.createRusticBench(168, 18, 0);
  foliage.createFlowerPatch(160, 24, 12, 3.0);
  foliage.createFlowerPatch(146, -16, 10, 2.8);

  // === BIOME 2: CẢNH QUAN NGOẠI VI THỊ TRẤN (Bố trí hoàn toàn ngoài phạm vi đường và quảng trường) ===
  // Đã giải phóng 100% diện tích quảng trường 92m và đại lộ trục tâm để giữ tầm nhìn đô thị thoáng đãng
  const mapleCoords = [
    [-52, 18, 1.2], [-52, -18, 1.25], [52, 18, 1.2], [52, -18, 1.25],
    [-54, 42, 1.1], [54, 42, 1.1],
  ];
  mapleCoords.forEach(([mx, mz, ms]) => foliage.createGoldenMaple(mx, mz, ms));

  // === BIOME 4: BỜ BIỂN BÌNH MINH (Hàng dừa nghiêng nhiệt đới) ===
  const palmCoords = [
    [-68, 334, 1.2, 0.25], [-45, 330, 1.15, -0.2], [-18, 327, 1.3, 0.22],
    [15, 328, 1.25, -0.25], [45, 332, 1.2, 0.28], [65, 337, 1.1, -0.22],
    [82, 327, 1.35, 0.3], [-32, 331, 1.2, 0.18], [32, 329, 1.25, -0.2],
  ];
  palmCoords.forEach(([px, pz, ps, pt]) => foliage.createTropicalPalm(px, pz, ps, pt));

  // Danh sách 7 trục ngang Nông Trại
  const farmCrossroadZList = [98, 126, 154, 182, 210, 238, 266];

  // === ĐẠI LỘ HUYẾT MẠCH ĐÔ THỊ: HÀNG CÂY SỒI & PHONG RỢP BÓNG (NGOÀI VỈA HÈ, KHÔNG CHẮN LÒNG ĐƯỜNG) ===
  // 1. Hàng cây đại lộ Bắc - Nam (Chỉ trồng ngoài phạm vi quảng trường |z| > 50, dạt ra |px| = 11.0m)
  for (let z = -90; z <= 150; z += 18) {
    if (Math.abs(z) < 52) continue; // Giữ quảng trường trung tâm 92m hoàn toàn thông thoáng
    // Tuyệt đối không trồng cây hoặc đặt ghế chắn các ngã 4 đường ngang nông trại (z = 98, 126, 154, ...)
    if (farmCrossroadZList.some(fz => Math.abs(z - fz) < 7.5)) continue;

    [-11.0, 11.0].forEach((px, sideIdx) => {
      if ((Math.abs(z) + sideIdx) % 2 === 0) {
        foliage.createCloudTree(px, z, 1.25);
      } else {
        foliage.createGoldenMaple(px, z, 1.2);
      }
      if (Math.abs(z) % 36 === 0) {
        foliage.createHydrangeaBush(px + (px > 0 ? 1.4 : -1.4), z, 1.1, '#10b981');
        foliage.createFlowerPatch(px, z + 2.2, 6, 1.5);
      }
    });

    // Ghế gỗ nghỉ chân dưới bóng mát ngoài lề vỉa hè
    if (Math.abs(z) % 36 === 18 && (z < -55 || (z > 55 && z < 140))) {
      foliage.createRusticBench(-10.2, z, Math.PI / 2);
      foliage.createRusticBench(10.2, z, -Math.PI / 2);
    }
  }

  // 2. Hàng cây đại lộ Đông - Tây (Ngoài phạm vi quảng trường |x| > 50, dạt ra |pz| = 9.8m)
  for (let x = -130; x <= 130; x += 22) {
    if (Math.abs(x) > 50) {
      foliage.createAlpinePine(x, -9.8, 1.2);
      foliage.createCloudTree(x, 9.8, 1.15);
    }
  }

  // 3. Hàng rào gỗ & Xe kéo nông sản cổ điển dọc đường làng Nông Trại (z: 35)
  for (let rx = -146; rx <= -74; rx += 14) {
    spawnModelSync(scene, MODEL_PATHS.town.fence, {
      position: new Vector3(rx, 0, 39.2),
      scaling: new Vector3(1.2, 1.2, 1.2),
      shadows,
      name: `village-fence-${rx}`,
    });
  }
  // Xe kéo nông sản chở bí ngô & cà rốt đỗ cạnh lối rẽ vào làng
  spawnModelSync(scene, MODEL_PATHS.town.cart, {
    position: new Vector3(-68, 0, 31),
    rotation: new Vector3(0, 0.45, 0),
    scaling: new Vector3(1.4, 1.4, 1.4),
    shadows,
    name: 'village-farm-cart',
  });

  // === HỆ THỐNG ĐƯỜNG ĐÔ THỊ & NÔNG TRẠI MXH ĐỒNG BỘ 100% CHUẨN PLAY TOGETHER ===
  const farmIntersections = farmCrossroadZList.map(pos => ({ pos, width: 7.5 }));

  // 1. Đại lộ Bắc - Nam (Nối Tòa Thị Chính qua Quảng trường xuống hết Thung Lũng Nông Trại)
  createModernBoulevard(scene, { id: 'blvd-north', x: 0, z: -68, length: 44, width: 9.0, sidewalkWidth: 2.8, isNorthSouth: true, shadows, lampInterval: 28 });
  createModernBoulevard(scene, {
    id: 'blvd-south',
    x: 0,
    z: 162,
    length: 232,
    width: 8.5,
    sidewalkWidth: 2.6,
    isNorthSouth: true,
    shadows,
    lampInterval: 32,
    intersections: farmIntersections,
  });

  // 2. Đại lộ Đông - Tây (Nối Ngoại Ô Bình Minh qua Quảng trường sang Hồ Pha Lê)
  createModernBoulevard(scene, { id: 'blvd-west', x: -84, z: 0, length: 76, width: 8.5, sidewalkWidth: 2.4, isNorthSouth: false, shadows, lampInterval: 28 });
  createModernBoulevard(scene, { id: 'blvd-east', x: 84, z: 0, length: 76, width: 8.5, sidewalkWidth: 2.4, isNorthSouth: false, shadows, lampInterval: 28 });
  createModernBoulevard(scene, { id: 'blvd-east-lake', x: 130, z: 0, length: 36, width: 7.5, sidewalkWidth: 2.2, isNorthSouth: false, shadows, lampInterval: 28 });

  // 3. Hai trục dọc Nông trại phía Tây & phía Đông (Bao bọc 24 lô nông trang)
  createModernBoulevard(scene, {
    id: 'farm-spine-west',
    x: -60,
    z: 184,
    length: 176,
    width: 7.5,
    sidewalkWidth: 2.2,
    isNorthSouth: true,
    shadows,
    lampInterval: 32,
    intersections: farmIntersections,
  });
  createModernBoulevard(scene, {
    id: 'farm-spine-east',
    x: 60,
    z: 184,
    length: 176,
    width: 7.5,
    sidewalkWidth: 2.2,
    isNorthSouth: true,
    shadows,
    lampInterval: 32,
    intersections: farmIntersections,
  });

  // 4. Bảy trục ngang Nông trại phân ô 24 lô đất (Nối liền 100% không khe hở với Đại lộ Nam)
  farmCrossroadZList.forEach((z, index) => {
    // Nhánh Tây (chạy chính xác từ x = -68 đến x = -4.25, chạm khít lòng Đại lộ Nam)
    createModernBoulevard(scene, {
      id: `farm-row-west-${index + 1}`,
      x: -36.125,
      z: z,
      length: 63.75,
      width: 7.5,
      sidewalkWidth: 2.2,
      isNorthSouth: false,
      shadows,
      lampInterval: 30,
      hasCenterDashes: true,
      hasEdgeLines: true,
      hasStopLines: true,
      sidewalkEndOffset: 3.0,
      intersections: [{ pos: -60, width: 7.5 }],
    });
    // Nhánh Đông (chạy chính xác từ x = 4.25 đến x = 68, chạm khít lòng Đại lộ Nam)
    createModernBoulevard(scene, {
      id: `farm-row-east-${index + 1}`,
      x: 36.125,
      z: z,
      length: 63.75,
      width: 7.5,
      sidewalkWidth: 2.2,
      isNorthSouth: false,
      shadows,
      lampInterval: 30,
      hasCenterDashes: true,
      hasEdgeLines: true,
      hasStopLines: true,
      sidewalkStartOffset: 3.0,
      intersections: [{ pos: 60, width: 7.5 }],
    });

    // Vạch sang đường cho người đi bộ trên vỉa hè băng qua miệng 2 nhánh đường Nông trại
    createZebraCrosswalk(scene, { id: `crosswalk-farm-west-side-${z}`, x: -5.9, z: z, width: 7.5, depth: 2.2, isNorthSouth: false });
    createZebraCrosswalk(scene, { id: `crosswalk-farm-east-side-${z}`, x: 5.9, z: z, width: 7.5, depth: 2.2, isNorthSouth: false });

    // Vạch sang đường cho người đi bộ băng qua Đại lộ Nam tại ngã 4
    createZebraCrosswalk(scene, { id: `crosswalk-farm-blvd-${z}`, x: 0, z: z - 5.5, width: 8.5, depth: 2.4, isNorthSouth: true });
  });

  // 5. Tuyến đường nối xuống Bãi Biển Bình Minh & Cảng Tàu Hơi Nước Steamboat Port
  createModernBoulevard(scene, { id: 'blvd-beach-connector', x: 0, z: 300, length: 44, width: 8.5, sidewalkWidth: 2.4, isNorthSouth: true, shadows, lampInterval: 28 });
  createModernBoulevard(scene, { id: 'blvd-steamboat-port', x: -22, z: 322, length: 40, width: 7.5, sidewalkWidth: 2.2, isNorthSouth: false, shadows, lampInterval: 28 });

  // 6. Hệ thống vạch sang đường đá ngà (Stone Crosswalks) tại 4 cửa ngõ Quảng trường
  createZebraCrosswalk(scene, { id: 'crosswalk-north', x: 0, z: -46, width: 9.0, isNorthSouth: true });
  createZebraCrosswalk(scene, { id: 'crosswalk-south', x: 0, z: 46, width: 9.0, isNorthSouth: true });
  createZebraCrosswalk(scene, { id: 'crosswalk-west', x: -46, z: 0, width: 8.5, isNorthSouth: false });
  createZebraCrosswalk(scene, { id: 'crosswalk-east', x: 46, z: 0, width: 8.5, isNorthSouth: false });

  // 7. Hệ thống Cột đá cản xe & Chậu hoa bảo vệ Phố Đi Bộ 100% tại 4 cửa ngõ (Xe buýt & cơ giới tuyệt đối không vào)
  const matBollardStone = materials.stone || materials.town;
  const matIronChain = materials.roof;
  const matFlowerPetal = materials.flower;

  const gatewayEntries = [
    { x: 0, z: -45.5, rotY: 0, label: 'CỬA BẮC' },
    { x: 0, z: 45.5, rotY: Math.PI, label: 'CỬA NAM' },
    { x: -45.5, z: 0, rotY: -Math.PI / 2, label: 'CỬA TÂY' },
    { x: 45.5, z: 0, rotY: Math.PI / 2, label: 'CỬA ĐÔNG' },
  ];

  gatewayEntries.forEach((gw, gidx) => {
    const gwRoot = new TransformNode(`pedestrian-gate-${gidx}`, scene);
    gwRoot.position.set(gw.x, 0, gw.z);
    gwRoot.rotation.y = gw.rotY;

    // 4 Cột trụ đá cản xe bo tròn với xích sắt uốn cong
    [-3.3, -1.1, 1.1, 3.3].forEach((bx, bidx) => {
      const bollard = MeshBuilder.CreateCylinder(`gate-bollard-${gidx}-${bidx}`, {
        diameterTop: 0.38,
        diameterBottom: 0.52,
        height: 0.95,
        tessellation: 16,
      }, scene);
      bollard.position.set(bx, 0.48, 0);
      bollard.material = matBollardStone;
      bollard.parent = gwRoot;
      shadows?.addShadowCaster(bollard);

      // Chóp cầu đá trên đỉnh cột
      const cap = MeshBuilder.CreateSphere(`gate-cap-${gidx}-${bidx}`, { diameter: 0.42, segments: 10 }, scene);
      cap.position.set(bx, 1.05, 0);
      cap.material = matBollardStone;
      cap.parent = gwRoot;
    });

    // Xích sắt rèn nối giữa các cột đá
    [-2.2, 0, 2.2].forEach((cx, cidx) => {
      const chain = MeshBuilder.CreateTorus(`gate-chain-${gidx}-${cidx}`, {
        diameter: 1.8,
        thickness: 0.06,
        tessellation: 16,
      }, scene);
      chain.position.set(cx, 0.55, 0);
      chain.rotation.x = Math.PI / 2;
      chain.scaling.set(1.1, 0.35, 1.0);
      chain.material = matIronChain;
      chain.parent = gwRoot;
    });

    // 2 Chậu hoa đá lớn uy nghiêm hai bên lối vào
    [-4.6, 4.6].forEach((px, pidx) => {
      const planter = MeshBuilder.CreateCylinder(`gate-planter-${gidx}-${pidx}`, {
        diameterTop: 1.4,
        diameterBottom: 1.0,
        height: 1.1,
        tessellation: 16,
      }, scene);
      planter.position.set(px, 0.55, 0);
      planter.material = matBollardStone;
      planter.parent = gwRoot;
      shadows?.addShadowCaster(planter);

      const bush = MeshBuilder.CreateSphere(`gate-flower-${gidx}-${pidx}`, { diameter: 1.5, segments: 8 }, scene);
      bush.position.set(px, 1.25, 0);
      bush.scaling.set(1.0, 0.7, 1.0);
      bush.material = matFlowerPetal;
      bush.parent = gwRoot;
    });
  });

  // 8. Trạm dừng cỗ xe ngựa & xe buýt gỗ cổ điển Ghibli NGOẠI VI (đặt bên ngoài quảng trường z = ±68)
  createSmartBusShelter(scene, shadows, { x: -9.2, y: 0, z: -68 }, 0);
  createSmartBusShelter(scene, shadows, { x: 9.2, y: 0, z: 68 }, Math.PI);

  // Cổng ranh giới — phân định các phân khu thế giới mở mạng xã hội
  zoneGate(scene, 0, 62, 0, 'THUNG LŨNG GREEN VALLEY', '#67a65b', materials, shadows);
  zoneGate(scene, -82, 3, Math.PI / 2, 'NGOẠI Ô BÌNH MINH', '#67a65b', materials, shadows);
  zoneGate(scene, 105, 3, Math.PI / 2, 'HỒ PHA LÊ', '#64c4df', materials, shadows);
  zoneGate(scene, 0, 292, 0, 'BIỂN BÌNH MINH', '#f0c05f', materials, shadows);

  // === TỔ HỢP ĐIỀN TRANG NÔNG TRẠI GHIBLI (GHIBLI SOCIAL FARMSTEAD) ===
  // Nhà chính Ghibli Manor, Kho thóc đỏ Classic Red Barn, Sạp hàng Roadside Shop & Trạm xe tải giao hàng
  const modernFarmhouse = createModernFarmhouse(scene, shadows, { x: -38, y: 0, z: 82 });
  const classicRedBarn = createClassicRedBarn(scene, shadows, { x: 42, y: 0, z: 82 });
  const roadsideShop = createRoadsideShop(scene, shadows, { x: -9.8, y: 0, z: 58 });
  const deliveryTruckStation = createDeliveryTruckStation(scene, shadows, { x: 9.8, y: 0, z: 58 });

  // === TRUNG TÂM THỊ TRẤN ĐÔ THỊ PLAY TOGETHER (PLAY TOGETHER METAVERSE PLAZA) ===
  // Quảng trường bộ hành 92m đá cẩm thạch trắng viền LED Neon Cyan & Magenta, Đài Phun Nước Kaia 3 tầng,
  // 5 Mega Venues (Fashion Mall, Casino Arcade, Agri-Mart, Motor Showroom, Fishing Wharf) & 2 Lô đất mở rộng sau này
  const playTogetherPlaza = createPlayTogetherPlaza(scene, shadows, foliage);

  // === TIỆN ÍCH & CẢNH QUAN MẠNG XÃ HỘI PLAY TOGETHER ===
  // 1. Sân khấu DJ Concert Stage & Sàn nhảy Disco Dance Floor (với dàn đèn xoay tia laser, loa line array & màn LED)
  const concertStage = createConcertStage(scene, shadows, { x: 24, y: 0, z: 0 }, -Math.PI / 2);
  // 2. Outdoor Cafe Lounge hiện đại (Xe Airstream, dù che resort & bàn ghế lounge thư giãn ngoài trời)
  const coffeeVan = createVintageCoffeeVan(scene, shadows, { x: -24, y: 0, z: 0 }, Math.PI / 2);
  // 3. Vòng quay may mắn 3D Neon Arcade (Lucky Spin Wheel Kiosk)
  const luckyWheel = createLuckyWheel3D(scene, shadows, { x: -18, y: 0, z: -16 }, Math.PI / 4);
  // 4. Máy gắp thú bông Neon Arcade 3D (Kaia Claw Machine)
  const clawMachine = createClawMachine3D(scene, shadows, { x: 18, y: 0, z: 16 }, -Math.PI / 4);
  // 5. Sân trượt ván Downtown Skatepark & Quarterpipe dốc thoai thoải
  const skatePark = createDowntownSkatePark(scene, shadows, { x: -16, y: 0, z: -34 }, Math.PI / 4);
  // 6. Bảng chỉ dẫn Kiosk Holographic Town Directory định vị thị trấn
  const directoryKiosk = createTownDirectoryKiosk(scene, shadows, { x: -6.4, y: 0, z: 38 });
  // 7. Giá trưng bày ván trượt & xe Scooter điện Neon
  const skateboardRack = createSkateboardRack(scene, shadows, { x: 18, y: 0, z: -16 }, -Math.PI / 4);

  // 4. Tòa Thị Chính Đô Thị Hiện Đại & Tháp Đồng Hồ 28m (Metropolis Civic City Hall at z = -98)
  const townHall = createTownHall(scene, shadows, { x: 0, y: 0, z: -98 });

  // 7. Chợ Phiên Nông Sản Thị Trấn Làng Gió (Bố trí gọn gàng tại khu thương mại ngoại ô x: -92, z: 140, hoàn toàn tách biệt khỏi lòng đường)
  const farmersMarket = createFarmersMarket(scene, shadows, foliage, { x: -92, z: 140 });

  // 7. Town Citizens (Now Beautiful 3D Humanoid Models)
  const townCitizens = [
    citizen(scene, -5, 4, '#e7894f', shadows),
    citizen(scene, 5, 7, '#738ed4', shadows),
    citizen(scene, 11, -5, '#be6d9b', shadows),
    citizen(scene, -12, 326, '#ed7185', shadows),
    citizen(scene, -124, 7, '#71a866', shadows),
    citizen(scene, -110, 25, '#db835e', shadows),
  ];

  // 8. Lake & Mountain District (Fishing pier, sailboat, arched bridge, waterfall)
  const lakeWater = MeshBuilder.CreateDisc('crystal-lake', { radius: 24, tessellation: 48 }, scene);
  lakeWater.rotation.x = Math.PI / 2;
  lakeWater.position.set(165, 0.08, 2);
  lakeWater.scaling.set(1.35, 1.35, 0.82);
  lakeWater.material = materials.water;

  const island = MeshBuilder.CreateCylinder('lake-island', { diameter: 7, height: 0.35, tessellation: 20 }, scene);
  island.position.set(167, 0.23, 2);
  island.material = materials.town;

  const lakeDistrict = createLakeDistrict(scene, shadows);
  [[133, -34, 2.4], [151, -42, 3.2], [190, -35, 2.8], [206, 20, 3.6], [192, 42, 2.6]].forEach(([x, z, s]) =>
    hill(scene, x, z, s, materials.hill, shadows)
  );

  // 9. Seaside Beach District (Boardwalk, coconut bar, loungers, palms)
  box(scene, 'beach', { width: 155, height: 0.12, depth: 44 }, new Vector3(0, 0.07, 340), materials.sand);
  box(scene, 'sea', { width: 230, height: 0.08, depth: 55 }, new Vector3(0, 0.1, 386), materials.water);

  const beachDistrict = createBeachDistrict(scene, shadows);
  beachDistrict.position.z = 142;
  const lighthouse = createLighthouse(scene, shadows, { x: 73, y: 0, z: 345 });
  const steamboatPort = createSteamboatPort(scene, shadows, { x: -38, y: 0, z: 358 });

  [[-83, 332, 2.2], [-67, 362, 1.8], [58, 366, 2.4], [87, 326, 1.6]].forEach(([x, z, s]) =>
    hill(scene, x, z, s, materials.rock, shadows)
  );

  // 10. Farmsteads: Animated Dutch Windmill, Grain Silo, Artisan Workshop
  const windmill = createWindmill(scene, shadows, { x: -92, y: 0, z: 108 });
  createGrainSilo(scene, shadows, { x: 88, y: 0, z: 112 });
  createArtisanWorkshop(scene, shadows, { x: 88, y: 0, z: 136 });

  [[-181, -4, 2.1], [-190, 73, 2.8], [-150, 103, 2.4]].forEach(([x, z, s]) =>
    hill(scene, x, z, s, materials.hill, shadows)
  );

  return {
    windmill,
    fountain: playTogetherPlaza.fountain,
    lighthouse,
    lakeDistrict,
    playTogetherPlaza,
    farmersMarket,
    townCitizens,
    townHall,
    modernFarmhouse,
    classicRedBarn,
    roadsideShop,
    deliveryTruckStation,
    steamboatPort,
    concertStage,
    coffeeVan,
    luckyWheel,
    clawMachine,
    skatePark,
    directoryKiosk,
    skateboardRack,
    update(time, delta) {
      windmill?.update(time, delta);
      lighthouse?.update(time, delta);
      lakeDistrict?.update(time);
      townHall?.update(time);

      // Animation sinh động cho toàn bộ cư dân thị trấn
      if (townCitizens) {
        townCitizens.forEach((c, idx) => {
          c.animate(delta, false, 0);
          // Thỉnh thoảng vẫy tay chào người chơi
          if (!c.isPerformingAction() && Math.sin(time * 0.0008 + idx * 2.3) > 0.98) {
            c.playAction('wave');
          }
        });
      }
    },
  };
}
