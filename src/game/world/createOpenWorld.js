import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { createMeadowTexture, createWaterTexture, createCobblePathTexture, createSandTexture, createHoneyPathTexture } from './createStylizedTextures.js';
import { WORLD_PALETTE } from './worldDesignSystem.js';
import { createFoliageFactory } from './createFoliage.js';
import { buildHumanMesh } from '../player/buildHumanMesh.js';

// Landmark imports
import { createWindmill } from './landmarks/createWindmill.js';
import { createArtisanWorkshop } from './landmarks/createSiloAndWorkshop.js';
import { createTownHall } from './landmarks/createTownHall.js';
import { createMajesticFountain } from './landmarks/createFountain.js';
import { createLighthouse } from './landmarks/createLighthouse.js';
import { createLakeDistrictSteps } from './landmarks/createWaterBody.js';
import { createCozyBeach } from './landmarks/createCozyBeach.js';
import { createRomanticLake, createRomanticLakeSteps } from './landmarks/createRomanticLake.js';
import { createSeasideOcean } from './landmarks/createSeasideOcean.js';
import { createCentralRoundabout } from './landmarks/createCentralRoundabout.js';
import { createFarmersMarketSteps } from './landmarks/createFarmersMarket.js';
import { createPlayTogetherPlazaSteps } from './landmarks/createPlayTogetherPlaza.js';
import { createSteamboatPort } from './landmarks/createSteamboatPort.js';
import {
  createModernFarmhouse,
  createClassicRedBarn,
  createRoadsideShop,
  createDeliveryTruckStation,
} from './landmarks/createSocialFarmstead.js';
import {
  createModernBoulevardSteps,
  createZebraCrosswalk,
  createCulDeSac,
} from './createModernRoadSystem.js';
import {
  createConcertStage,
  createVintageCoffeeVan,
  createSmartBusShelter,
  createLuckyWheel3D,
  createClawMachine3D,
  createSkateboardRack,
} from './landmarks/createPlazaAmenities.js';
import { isPointOnRoadCorridor } from './RoadSafetyZone.js';
import { isPointInsideAnyFarmLot } from './FarmSafetyZone.js';
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
    fixedAppearance: !!scene.metadata?.mobile,
    outfitColor: hex,
    skinColor: '#fcd5b5',
    hairColor: '#76503b',
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

function hill() {
  // Xóa bỏ hoàn toàn các khối đồi hình cầu xanh (landscape-hill) gây cản trở và choán tầm nhìn cảnh quan hồ
  return null;
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
  const signScale = scene.metadata?.mobile ? 0.5 : 1;
  const texture = new DynamicTexture(`label-${text}`, { width: 2048 * signScale, height: 512 * signScale }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  texture.anisotropicFilteringLevel = 16;
  texture.hasAlpha = true;
  const context = texture.getContext();
  context.scale(signScale, signScale);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.clearRect(0, 0, 2048, 512);
  // Khung viền gỗ hoàng gia bo góc mềm mại
  context.fillStyle = 'rgba(28, 20, 14, 0.92)';
  context.beginPath();
  context.roundRect(32, 40, 1984, 432, 64);
  context.fill();
  context.strokeStyle = color;
  context.lineWidth = 24;
  context.stroke();
  context.font = 'bold 128px "Nunito", "Segoe UI", Arial, sans-serif';
  context.textAlign = 'center';
  context.fillStyle = '#fffdf0';
  context.fillText(text, 1024, 304);
  texture.update();

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

export function* createOpenWorldSteps(scene, shadows, scheduler = null) {
  const meadowTex = createMeadowTexture(scene);
    yield;
  const honeyPathTex = createHoneyPathTexture(scene);
    yield;
  const waterTex = createWaterTexture(scene);
    yield;
  const cobbleTex = createCobblePathTexture(scene);
    yield;
  const sandTex = createSandTexture(scene);
    yield;

  const materials = {
    path: mat(scene, 'warm-path', '#eec784'),
    road: mat(scene, 'stone-road', WORLD_PALETTE.roadWarm),
    sidewalk: mat(scene, 'road-sidewalk', WORLD_PALETTE.sidewalkCream),
    marking: mat(scene, 'road-marking', '#f8ead8'),
    town: mat(scene, 'town-green', '#fdecc8'), // Gạch quảng trường thị trấn màu kem bơ châu Âu cổ điển
    sand: mat(scene, 'beach-sand', '#fde087'), // Bãi cát biển vàng ươm nắng
    water: mat(scene, 'world-water', WORLD_PALETTE.waterShallow, WORLD_PALETTE.waterDeep),
    wood: mat(scene, 'world-wood', '#93633e'), // Gỗ sồi mộc mạc ấm áp
    glow: mat(scene, 'lamp-glow-material', '#fef08a', '#eab308'),
    flower: mat(scene, 'flowers', '#fb7185'),
    meadow: mat(scene, 'meadow-ground', WORLD_PALETTE.grassMid),
    cityGround: mat(scene, 'city-ground', '#fbf3e4'), // Nền phố thị lát đá hoa cúc sáng bóng sang trọng
    lakeGround: mat(scene, 'lake-ground', '#8ed6a0'),
    coastGround: mat(scene, 'coast-ground', '#fed7aa'), // Cát duyên hải vàng mịn
    hill: mat(scene, 'hill-ground', WORLD_PALETTE.grassShade),
    rock: mat(scene, 'cliff-rock', '#95a898'), // Vách đá tự nhiên phủ nhẹ rêu
  };
    yield;

  materials.meadow.diffuseColor = Color3.White();
    yield;
  materials.meadow.diffuseTexture = meadowTex;
    yield;
  materials.road.diffuseTexture = honeyPathTex;
    yield;
  materials.path.diffuseTexture = cobbleTex;
    yield;
  materials.sidewalk.diffuseTexture = cobbleTex;
    yield;
  materials.town.diffuseTexture = cobbleTex;
    yield;
  materials.sand.diffuseTexture = sandTex;
    yield;
  materials.water.diffuseTexture = waterTex;
    yield;
  materials.water.alpha = 0.88;
    yield;
  materials.sidewalk.diffuseColor = Color3.White();
    yield;
  materials.sidewalk.diffuseTexture = honeyPathTex;
    yield;
  materials.road.diffuseColor = Color3.White();
    yield;
  materials.road.diffuseTexture = honeyPathTex;
    yield;
  materials.sand.diffuseColor = Color3.White();
    yield;
  materials.sand.diffuseTexture = sandTex;
    yield;
  materials.coastGround.diffuseColor = Color3.White();
    yield;
  materials.coastGround.diffuseTexture = sandTex;
    yield;

  // Micro-specular depth cho bề mặt tự nhiên & vật liệu (Phase 3)
  materials.meadow.specularColor = new Color3(0.04, 0.045, 0.035);
    yield;
  materials.meadow.specularPower = 48;
    yield;
  materials.road.specularColor = new Color3(0.05, 0.05, 0.04);
    yield;
  materials.road.specularPower = 48;
    yield;
  materials.sidewalk.specularColor = new Color3(0.06, 0.06, 0.05);
    yield;
  materials.sidewalk.specularPower = 64;
    yield;
  materials.town.specularColor = new Color3(0.08, 0.08, 0.07);
    yield;
  materials.town.specularPower = 64;
    yield;
  materials.sand.specularColor = new Color3(0.05, 0.045, 0.035);
    yield;
  materials.sand.specularPower = 32;
    yield;
  materials.water.specularColor = new Color3(0.4, 0.45, 0.5);
    yield;
  materials.water.specularPower = 128;
    yield;


  // Nhà riêng và lô ruộng được FarmWorld dựng hoàn toàn từ dữ liệu server.
  const foliage = createFoliageFactory(scene, shadows);
    yield;


  // === BIOME 3: HỒ PHA LÊ & CAO NGUYÊN (Rừng thông núi cao vút) ===
  const pineCoords = [
    [142, 32, 1.3], [152, 39, 1.4], [178, 34, 1.2], [209, 20, 1.35],
    [211, -19, 1.25], [172, -37, 1.4], [145, -32, 1.2], [127, -17, 1.1],
    [165, 45, 1.5], [212, 35, 1.3], [124, 15, 1.2], [215, -3, 1.25],
  ];
    yield;
  pineCoords.forEach(([px, pz, ps]) => foliage.createAlpinePine(px, pz, ps));
    yield;
  foliage.createRusticBench(150, 31, -Math.PI / 4);
    yield;
  foliage.createRusticBench(181, 31, 0);
    yield;
  foliage.createFlowerPatch(159, 36, 12, 3.0);
    yield;
  foliage.createFlowerPatch(148, -36, 10, 2.8);
    yield;

  // === BIOME 2: CẢNH QUAN NGOẠI VI THỊ TRẤN (Bố trí hoàn toàn ngoài phạm vi đường và quảng trường) ===
  // Đã giải phóng 100% diện tích quảng trường 92m và đại lộ trục tâm để giữ tầm nhìn đô thị thoáng đãng
  const mapleCoords = [
    [-52, 18, 1.2], [-52, -18, 1.25], [52, 18, 1.2], [52, -18, 1.25],
    [-54, 42, 1.1], [54, 42, 1.1],
  ];
    yield;
  mapleCoords.forEach(([mx, mz, ms]) => foliage.createGoldenMaple(mx, mz, ms));
    yield;

  // === BIOME 4: BỜ BIỂN BÌNH MINH (Hàng dừa nghiêng nhiệt đới) ===
  const palmCoords = [
    [-68, 334, 1.2, 0.25], [-45, 330, 1.15, -0.2], [-18, 327, 1.3, 0.22],
    [15, 328, 1.25, -0.25], [45, 332, 1.2, 0.28], [65, 337, 1.1, -0.22],
    [82, 327, 1.35, 0.3], [-32, 331, 1.2, 0.18], [32, 329, 1.25, -0.2],
  ];
    yield;
  palmCoords.forEach(([px, pz, ps, pt]) => foliage.createTropicalPalm(px, pz, ps, pt));
    yield;

  // Danh sách 7 trục ngang Nông Trại
  const farmCrossroadZList = [98, 126, 154, 182, 210, 238, 266];
    yield;

  // === ĐẠI LỘ HUYẾT MẠCH ĐÔ THỊ: HÀNG CÂY SỒI & PHONG RỢP BÓNG (NGOÀI VỈA HÈ, KHÔNG CHẮN LÒNG ĐƯỜNG) ===
  // 1. Hàng cây đại lộ Bắc - Nam (Chỉ trồng từ z = -90 đến z = 72 ngoài phạm vi quảng trường |z| > 50, dạt ra |px| = 11.0m)
  for (let z = -90; z <= 72; z += 18) {
    if (Math.abs(z) < 52) continue; // Giữ quảng trường trung tâm 92m hoàn toàn thông thoáng
    if (Math.abs(z - 86) < 8.0) continue; // Tuyệt đối không chắn Quốc Lộ 86

    for (const [sideIdx, px] of ([-11.0, 11.0]).entries()) {
      if (isPointOnRoadCorridor(px, z, 3.0) || isPointInsideAnyFarmLot(px, z, 1.0)) continue;
      if ((Math.abs(z) + sideIdx) % 2 === 0) {
        foliage.createCloudTree(px, z, 1.25);
      } else {
        foliage.createGoldenMaple(px, z, 1.2);
      }
      if (Math.abs(z) % 36 === 0) {
        foliage.createHydrangeaBush(px + (px > 0 ? 1.4 : -1.4), z, 1.1, '#10b981');
        foliage.createFlowerPatch(px, z + 2.2, 6, 1.5);
      }

      yield;
    }

    // Ghế gỗ nghỉ chân dưới bóng mát ngoài lề vỉa hè
    if (Math.abs(z) % 36 === 18 && (z < -55 || (z > 55 && z < 72))) {
      if (!isPointOnRoadCorridor(-10.2, z, 2.0) && !isPointInsideAnyFarmLot(-10.2, z, 1.0)) foliage.createRusticBench(-10.2, z, Math.PI / 2);
      if (!isPointOnRoadCorridor(10.2, z, 2.0) && !isPointInsideAnyFarmLot(10.2, z, 1.0)) foliage.createRusticBench(10.2, z, -Math.PI / 2);
    }

      yield;
}
    yield;

  // 2. Hàng cây đại lộ Đông - Tây (Ngoài phạm vi quảng trường |x| > 50, dạt ra |pz| = 9.8m)
  for (let x = -130; x <= 130; x += 22) {
    if (Math.abs(x) > 50) {
      if (!isPointOnRoadCorridor(x, -9.8, 3.0)) foliage.createAlpinePine(x, -9.8, 1.2);
      if (!isPointOnRoadCorridor(x, 9.8, 3.0)) foliage.createCloudTree(x, 9.8, 1.15);
    }

      yield;
}
    yield;

  // 3. Hàng rào gỗ & Xe kéo nông sản cổ điển dọc đường làng Nông Trại (z: 35)
  for (let rx = -146; rx <= -74; rx += 14) {
    spawnModelSync(scene, MODEL_PATHS.town.fence, {
      position: new Vector3(rx, 0, 39.2),
      scaling: new Vector3(1.2, 1.2, 1.2),
      shadows,
      name: `village-fence-${rx}`,
    });

      yield;
}
    yield;
  // Xe kéo nông sản chở bí ngô & cà rốt đỗ cạnh lối rẽ vào làng
  spawnModelSync(scene, MODEL_PATHS.town.cart, {
    position: new Vector3(-68, 0, 31),
    rotation: new Vector3(0, 0.45, 0),
    scaling: new Vector3(1.4, 1.4, 1.4),
    shadows,
    name: 'village-farm-cart',
  });
    yield;

  // === HỆ THỐNG ĐƯỜNG ĐÔ THỊ & NÔNG TRẠI MXH ĐỒNG BỘ 100% CHUẨN PLAY TOGETHER ===
  const farmIntersections = [
    { pos: 86, width: 6.0 }, // Nối thẳng Quốc lộ 86 liên làng
    ...farmCrossroadZList.map(pos => ({ pos, width: 7.5 })),
  ];
    yield;

  // 1. Đại lộ Bắc - Nam (Nối Tòa Thị Chính qua Quảng trường xuống hết Thung Lũng Nông Trại)
  yield* createModernBoulevardSteps(scene, { id: 'blvd-north', x: 0, z: -68, length: 44, width: 8.5, sidewalkWidth: 2.6, isNorthSouth: true, shadows, lampInterval: 28 });
    yield;
  yield* createModernBoulevardSteps(scene, {
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
    yield;

  // 2. Đại lộ Đông - Tây (Nối Ngoại Ô Bình Minh qua Quảng trường sang Hồ Pha Lê)
  yield* createModernBoulevardSteps(scene, {
    id: 'blvd-west',
    x: -84,
    z: 0,
    length: 76,
    width: 8.5,
    sidewalkWidth: 2.4,
    isNorthSouth: false,
    shadows,
    lampInterval: 28,
    intersections: [{ pos: -122, width: 7.5, side: -1 }],
  });
    yield;
  // Bùng binh Cửa Tây kết nối phố chợ và ngoại ô Mộc Lan (loại bỏ hoàn toàn đường cụt)
  createCulDeSac(scene, { id: 'cul-blvd-west', x: -122, z: 0, radius: 7.2, shadows });
    yield;

  yield* createModernBoulevardSteps(scene, {
    id: 'blvd-east',
    x: 84,
    z: 0,
    length: 76,
    width: 8.5,
    sidewalkWidth: 2.4,
    isNorthSouth: false,
    shadows,
    lampInterval: 28,
    intersections: [{ pos: 122, width: 7.5, side: -1 }],
  });
    yield;

  // 2b. Tuyến nối trực tiếp từ 2 cánh Đông - Tây Đô Thị Trung Tâm xuống Quốc Lộ 86
  // Trục nối Tây Đô Thị (x = -122) chạy thẳng xuống QL86 (z = 86)
  yield* createModernBoulevardSteps(scene, {
    id: 'link-city-west-highway',
    x: -122,
    z: 43,
    length: 86,
    width: 7.0,
    sidewalkWidth: 2.0,
    isNorthSouth: true,
    shadows,
    lampInterval: 32,
    sidewalkStartOffset: 4.25,
    sidewalkEndOffset: 3.0,
    intersections: [
      { pos: 0, width: 8.5 },
      { pos: 86, width: 6.5 },
    ],
  });
    yield;

  // Trục nối Đông Đô Thị (x = 122) chạy thẳng xuống QL86 (z = 86)
  yield* createModernBoulevardSteps(scene, {
    id: 'link-city-east-highway',
    x: 122,
    z: 43,
    length: 86,
    width: 7.0,
    sidewalkWidth: 2.0,
    isNorthSouth: true,
    shadows,
    lampInterval: 32,
    sidewalkStartOffset: 4.25,
    sidewalkEndOffset: 3.0,
    intersections: [
      { pos: 0, width: 8.5 },
      { pos: 86, width: 6.5 },
    ],
  });
    yield;

  // 3. Hai trục dọc Nông trại phía Tây & phía Đông (Bao bọc 24 lô nông trang, nối liền từ QL86 đến đường ngang số 7)
  // Chiều dài 180m: chạy liền mạch từ z = 86 (giao QL86) đến z = 266 (đường ngang số 7)
  const spineWestIntersections = [
    { pos: 86, width: 6.0, side: 1 },
    ...farmCrossroadZList.map(pos => ({ pos, width: 7.5, side: 1 })),
  ];
  yield* createModernBoulevardSteps(scene, {
    id: 'farm-spine-west',
    x: -60,
    z: 176,
    length: 180,
    width: 7.5,
    sidewalkWidth: 2.2,
    isNorthSouth: true,
    shadows,
    lampInterval: 32,
    sidewalkStartOffset: { [-1]: 0, [1]: 3.0 },
    sidewalkEndOffset: { [-1]: 0, [1]: 3.75 },
    intersections: spineWestIntersections,
  });
    yield;

  const spineEastIntersections = [
    { pos: 86, width: 6.0, side: -1 },
    ...farmCrossroadZList.map(pos => ({ pos, width: 7.5, side: -1 })),
  ];
  yield* createModernBoulevardSteps(scene, {
    id: 'farm-spine-east',
    x: 60,
    z: 176,
    length: 180,
    width: 7.5,
    sidewalkWidth: 2.2,
    isNorthSouth: true,
    shadows,
    lampInterval: 32,
    sidewalkStartOffset: { [-1]: 3.0, [1]: 0 },
    sidewalkEndOffset: { [-1]: 3.75, [1]: 0 },
    intersections: spineEastIntersections,
  });
    yield;

  // 4. Bảy trục ngang Nông trại phân ô 24 lô đất (Nối khép kín 100% giữa Trục Tây x = -60, Đại lộ Nam x = 0 và Trục Đông x = 60)
  for (const [index, z] of (farmCrossroadZList).entries()) {
    // Nhánh Tây: chạy chính xác từ x = -60 (tim Trục Tây) đến x = -4.25 (mép Đại lộ Nam)
    yield* createModernBoulevardSteps(scene, {
      id: `farm-row-west-${index + 1}`,
      x: -32.125,
      z: z,
      length: 55.75,
      width: 7.5,
      sidewalkWidth: 2.2,
      isNorthSouth: false,
      shadows,
      lampInterval: 30,
      hasCenterDashes: true,
      hasEdgeLines: true,
      hasStopLines: true,
      sidewalkStartOffset: 3.75, // Khớp chuẩn xác mép trong Trục Tây x = -60
      sidewalkEndOffset: 0,
    });
    // Nhánh Đông: chạy chính xác từ x = 4.25 (mép Đại lộ Nam) đến x = 60 (tim Trục Đông)
    yield* createModernBoulevardSteps(scene, {
      id: `farm-row-east-${index + 1}`,
      x: 32.125,
      z: z,
      length: 55.75,
      width: 7.5,
      sidewalkWidth: 2.2,
      isNorthSouth: false,
      shadows,
      lampInterval: 30,
      hasCenterDashes: true,
      hasEdgeLines: true,
      hasStopLines: true,
      sidewalkStartOffset: 0,
      sidewalkEndOffset: 3.75, // Khớp chuẩn xác mép trong Trục Đông x = 60
    });

    // Vạch sang đường cho người đi bộ trên vỉa hè băng qua miệng 2 nhánh đường Nông trại
    createZebraCrosswalk(scene, { id: `crosswalk-farm-west-side-${z}`, x: -5.9, z: z, width: 7.5, depth: 2.2, isNorthSouth: false });
    createZebraCrosswalk(scene, { id: `crosswalk-farm-east-side-${z}`, x: 5.9, z: z, width: 7.5, depth: 2.2, isNorthSouth: false });

    // Vạch sang đường cho người đi bộ băng qua Đại lộ Nam tại ngã 4
    createZebraCrosswalk(scene, { id: `crosswalk-farm-blvd-${z}`, x: 0, z: z - 5.5, width: 8.5, depth: 2.4, isNorthSouth: true });

    yield;
  }
  yield;

  // Vạch sang đường tại điểm giao Quốc lộ 86 với Đại lộ Nam
  createZebraCrosswalk(scene, { id: 'crosswalk-blvd-highway-86', x: 0, z: 86, width: 8.5, depth: 2.6, isNorthSouth: true });
  yield;

  // 5. Tuyến đường nối xuống Bãi Biển Bình Minh & Cảng Tàu Hơi Nước Steamboat Port
  yield* createModernBoulevardSteps(scene, { id: 'blvd-beach-connector', x: 0, z: 300, length: 44, width: 8.5, sidewalkWidth: 2.4, isNorthSouth: true, shadows, lampInterval: 28 });
    yield;
  yield* createModernBoulevardSteps(scene, { id: 'blvd-steamboat-port', x: -22, z: 322, length: 40, width: 7.5, sidewalkWidth: 2.2, isNorthSouth: false, shadows, lampInterval: 28 });
    yield;
  // Bùng binh quay đầu cảng tàu kết nối bến phà & hải đăng (không để đường cụt)
  createCulDeSac(scene, { id: 'cul-steamboat-port', x: -42, z: 322, radius: 6.5, shadows });
    yield;

  // 6. Hệ thống vạch sang đường đá ngà (Stone Crosswalks) tại 4 cửa ngõ Quảng trường
  createZebraCrosswalk(scene, { id: 'crosswalk-north', x: 0, z: -46, width: 8.5, isNorthSouth: true });
    yield;
  createZebraCrosswalk(scene, { id: 'crosswalk-south', x: 0, z: 46, width: 8.5, isNorthSouth: true });
    yield;
  createZebraCrosswalk(scene, { id: 'crosswalk-west', x: -46, z: 0, width: 8.5, isNorthSouth: false });
    yield;
  createZebraCrosswalk(scene, { id: 'crosswalk-east', x: 46, z: 0, width: 8.5, isNorthSouth: false });
    yield;

  // 7. Hệ thống Cột đá cản xe & Chậu hoa bảo vệ Phố Đi Bộ 100% tại 4 cửa ngõ (Xe buýt & cơ giới tuyệt đối không vào)
  const matBollardStone = materials.stone || materials.town;
    yield;
  const matIronChain = materials.roof;
    yield;
  const matFlowerPetal = materials.flower;
    yield;

  const gatewayEntries = [
    { x: 0, z: -45.5, rotY: 0, label: 'CỬA BẮC' },
    { x: 0, z: 45.5, rotY: Math.PI, label: 'CỬA NAM' },
    { x: -45.5, z: 0, rotY: -Math.PI / 2, label: 'CỬA TÂY' },
    { x: 45.5, z: 0, rotY: Math.PI / 2, label: 'CỬA ĐÔNG' },
  ];
    yield;

  for (const [gidx, gw] of (gatewayEntries).entries()) {
    const gwRoot = new TransformNode(`pedestrian-gate-${gidx}`, scene);
    gwRoot.position.set(gw.x, 0, gw.z);
    gwRoot.rotation.y = gw.rotY;

    // Cột trụ đá cản xe bố trí ở hai bên mép vỉa hè (|bx| > 4.2m), chừa thông thủy đại lộ chính 8.4m ở giữa
    for (const [bidx, bx] of ([-5.6, -4.4, 4.4, 5.6]).entries()) {
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

      yield;
    }

    // Xích sắt rèn nối giữa các cặp cột đá ở hai bên vỉa hè, không chắn giữa lòng đường
    for (const [cidx, cx] of ([-5.0, 5.0]).entries()) {
      const chain = MeshBuilder.CreateTorus(`gate-chain-${gidx}-${cidx}`, {
        diameter: 1.4,
        thickness: 0.06,
        tessellation: 16,
      }, scene);
      chain.position.set(cx, 0.55, 0);
      chain.rotation.x = Math.PI / 2;
      chain.scaling.set(1.0, 0.35, 1.0);
      chain.material = matIronChain;
      chain.parent = gwRoot;

      yield;
    }

    // 2 Chậu hoa đá lớn uy nghiêm hai bên lề đường
    for (const [pidx, px] of ([-6.8, 6.8]).entries()) {
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

      yield;
    }

      yield;
    }
    yield;

  // 8. Trạm dừng cỗ xe ngựa & xe buýt gỗ cổ điển Ghibli NGOẠI VI (đặt bên ngoài quảng trường)
  createSmartBusShelter(scene, shadows, { x: -9.2, y: 0, z: -68 }, 0);
    yield;
  createSmartBusShelter(scene, shadows, { x: 9.6, y: 0, z: 80 }, Math.PI);
    yield;

  // Cổng ranh giới — phân định các phân khu thế giới mở ngoại vi (cổng trung tâm đã gỡ bỏ để tầm nhìn đại lộ thông thoáng)
  zoneGate(scene, -82, 3, Math.PI / 2, 'PHỐ CHỢ PHÍA TÂY', '#e28743', materials, shadows);
    yield;
  zoneGate(scene, 105, 3, Math.PI / 2, 'HỒ PHA LÊ & BẾN CÂU CÁ', '#64c4df', materials, shadows);
    yield;
  zoneGate(scene, 0, 292, 0, 'BIỂN BÌNH MINH', '#f0c05f', materials, shadows);
    yield;

  // === TỔ HỢP ĐIỀN TRANG NÔNG TRẠI GHIBLI (GHIBLI SOCIAL FARMSTEAD) ===
  // Đặt lùi về hai bên đại lộ thông thoáng, giải phóng 100% vỉa hè & tầm nhìn thẳng vào quảng trường
  const modernFarmhouse = createModernFarmhouse(scene, shadows, { x: -38, y: 0, z: 62 });
    yield;
  const classicRedBarn = createClassicRedBarn(scene, shadows, { x: 42, y: 0, z: 62 });
    yield;
  const roadsideShop = createRoadsideShop(scene, shadows, { x: -11.5, y: 0, z: 60 }, Math.PI / 2);
    yield;
  const deliveryTruckStation = createDeliveryTruckStation(scene, shadows, { x: 11.5, y: 0, z: 60 }, -Math.PI / 2);
    yield;
  // Lối đá bước chân từ vỉa hè đại lộ vào quầy hàng & trạm xe tải
  createSteppingStoneTrail(scene, { x: -6.8, z: 60 }, { x: -10.5, z: 60 }, materials, 3);
    yield;
  createSteppingStoneTrail(scene, { x: 6.8, z: 60 }, { x: 10.5, z: 60 }, materials, 3);
    yield;

  // === TRUNG TÂM THỊ TRẤN ĐÔ THỊ PLAY TOGETHER (PLAY TOGETHER METAVERSE PLAZA) ===
  yield 'boot: town plaza';
  const playTogetherPlaza = yield* createPlayTogetherPlazaSteps(scene, shadows, foliage);
    yield;

  // === TIỆN ÍCH & CẢNH QUAN MẠNG XÃ HỘI THEO QUY HOẠCH MỚI ===
  // Phía Đông: Sân khấu nghệ thuật chuyển sang cánh Đông (x: 38)
  const concertStage = createConcertStage(scene, shadows, { x: 38, y: 0, z: -6 }, -Math.PI / 2);
    yield;
  // Phía Tây: Quán cà phê Airstream & sân vườn thư giãn (x: -34, z: 6)
  const coffeeVan = createVintageCoffeeVan(scene, shadows, { x: -34, y: 0, z: 6 }, Math.PI / 2);
    yield;
  // Phía Tây: Vòng quay may mắn & Máy gắp thú dời vào khu giải trí Tây
  const luckyWheel = createLuckyWheel3D(scene, shadows, { x: -36, y: 0, z: -18 }, Math.PI / 4);
    yield;
  const clawMachine = createClawMachine3D(scene, shadows, { x: -36, y: 0, z: -12 }, -Math.PI / 4);
    yield;
  // Removed the skatepark ramp/funbox/rails at the user's request.
  // Preserve the scene result shape for existing callers.
  const skatePark = null;
  // Phía Tây: Giá ván trượt Downtown (vật thể riêng, giữ nguyên).
  const skateboardRack = createSkateboardRack(scene, shadows, { x: -28, y: 0, z: -36 }, -Math.PI / 4);
    yield;
  // Removed the black/cyan directory kiosk near the western plaza entrance.
  const directoryKiosk = null;

  // 4. Tòa Thị Chính Đô Thị Hiện Đại & Tháp Đồng Hồ 28m (Metropolis Civic City Hall)
  // Di dời sang khuôn viên công quyền phía Tây x: -38 để giải phóng 100% trục đường Bắc x: 0
  yield 'boot: town hall';
  const townHall = createTownHall(scene, shadows, { x: -38, y: 0, z: -98 });
    yield;

  // 7. Chợ Phiên Nông Sản Phố Chợ Phía Tây (Bố trí tại quảng trường thương mại x: -62, z: 24 ngoài lòng Đại lộ Tây)
  yield 'boot: farmers market';
  const farmersMarket = yield* createFarmersMarketSteps(scene, shadows, foliage, { x: -62, z: 24 });
    yield;

  // 7. Town Citizens (Cư dân 3D dạo phố, thưởng thức cà phê và mua sắm nông sản - đã xóa 2 đứa bé ở đài phun nước theo yêu cầu)
  const townCitizens = [];
  for (const [x, z, color] of [
    [-36, 4, '#be6d9b'],
    [-64, 26, '#71a866'], [-12, 326, '#ed7185'], [112, -11, '#db835e'],
  ]) {
    yield `boot: town citizen ${x}:${z}`;
    townCitizens.push(citizen(scene, x, z, color, shadows));
    yield;
  }

  // 8. Lake & Mountain District (Cozy Farmy Teardrop Lagoon, sandy shore, rustic wooden pier)
  yield 'boot: romantic lake';
  const romanticLake = yield* createRomanticLakeSteps(scene, shadows);
  yield;


  yield 'boot: lake district';
  const lakeDistrict = yield* createLakeDistrictSteps(scene, shadows);
    yield;
  terrainPatch(scene, 'lake-shop-access', 113, -11, 3.2, 14, materials.sidewalk);
  yield;
  // Rest-bank path terminates on land and stays clear of the fishing shop.
  createSteppingStoneTrail(scene, { x: 113, z: 8 }, { x: 129, z: 22 }, materials, 7);
  yield;

  // 9. Seaside Beach District (Boardwalk, coconut bar, loungers, palms)
  // Lối nối lát đá phiến từ đại lộ bờ biển xuống Cầu ván gỗ Boardwalk
  terrainPatch(scene, 'beach-boardwalk-connector', 0, 324, 8.5, 6, materials.sidewalk);
    yield;
  yield 'boot: seaside ocean';
  createSeasideOcean(scene);
    yield;

  yield 'boot: beach district';
  createCozyBeach(scene, shadows, scheduler);
    yield;
    yield;
  const lighthouse = createLighthouse(scene, shadows, { x: 73, y: 0, z: 345 });
    yield;
  const steamboatPort = createSteamboatPort(scene, shadows, { x: -38, y: 0, z: 358 });
    yield;

  // 10. Farmsteads: Animated Dutch Windmill, Artisan Workshop (đã xóa tháp silo ở 88, 112 theo yêu cầu)
  const windmill = createWindmill(scene, shadows, { x: -92, y: 0, z: 108 });
    yield;
  createArtisanWorkshop(scene, shadows, { x: 88, y: 0, z: 136 });
    yield;

    yield;

  return {
    windmill,
    fountain: playTogetherPlaza.fountain,
    lighthouse,
    lakeDistrict,
    romanticLake,
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

export function createOpenWorld(scene, shadows) {
  const steps = createOpenWorldSteps(scene, shadows);
  let result;
  do { result = steps.next(); } while (!result.done);
  return result.value;
}
