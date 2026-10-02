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
import { createRuralHousesFactory } from './landmarks/createRuralHouses.js';
import { createTownHall } from './landmarks/createTownHall.js';
import { createMajesticFountain } from './landmarks/createFountain.js';
import { createVenues3DFactory } from './landmarks/createVenues3D.js';
import { createLighthouse } from './landmarks/createLighthouse.js';
import { createLakeDistrict, createBeachDistrict } from './landmarks/createWaterBody.js';
import { createCentralRoundabout } from './landmarks/createCentralRoundabout.js';
import { createFarmersMarket } from './landmarks/createFarmersMarket.js';
import { createPlayTogetherPlaza } from './landmarks/createPlayTogetherPlaza.js';
import { createCityMasterplan } from './createCityMasterplan.js';
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

function road(scene, name, x, z, width, depth, materials) {
  // Lòng đường đất nện mịn màng tiệp phẳng tự nhiên với mặt đất (dùng CreateGround phẳng ở y = 0.02, không tạo gờ hộp chữ nhật thô)
  const roadMesh = MeshBuilder.CreateGround(name, { width, height: depth, subdivisions: 2 }, scene);
  roadMesh.position.set(x, 0.02, z);
  roadMesh.material = materials.road;
  roadMesh.receiveShadows = true;

  const vertical = depth > width;
  const edgeOffset = (vertical ? width : depth) / 2 + 0.35;
  // Mép sỏi đá mềm mại hai bên lề đường
  [-1, 1].forEach(side => {
    const edge = MeshBuilder.CreateGround(
      `${name}-edge-${side}`,
      vertical ? { width: 0.7, height: depth, subdivisions: 2 } : { width, height: 0.7, subdivisions: 2 },
      scene
    );
    edge.position.set(
      vertical ? x + side * edgeOffset : x,
      0.022,
      vertical ? z : z + side * edgeOffset
    );
    edge.material = materials.sidewalk;
    edge.receiveShadows = true;
  });
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

  const halfSpan = 3.2; // Độ rộng thông thủy 6.4m, rộng rãi thoáng đãng
  const postHeight = 3.8;

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
  const ruralHouses = createRuralHousesFactory(scene, shadows);


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

  // === BIOME 2: THỊ TRẤN BÌNH MINH (Cây phong vàng mùa thu, hoa cẩm tú cầu & ghế đá) ===
  const mapleCoords = [
    [-35, 8, 1.2], [-35, -12, 1.25], [35, 8, 1.2], [35, -12, 1.25],
    [-20, 22, 1.1], [20, 22, 1.1], [0, 30, 1.25],
  ];
  mapleCoords.forEach(([mx, mz, ms]) => foliage.createGoldenMaple(mx, mz, ms));

  foliage.createHydrangeaBush(-12, 0, '#a78bfa', 1.05);
  foliage.createHydrangeaBush(12, 0, '#f472b6', 1.05);
  foliage.createHydrangeaBush(-18, 8, '#60a5fa', 1.0);
  foliage.createHydrangeaBush(18, 8, '#c084fc', 1.0);

  foliage.createRusticBench(-8, -4, Math.PI / 2);
  foliage.createRusticBench(8, -4, -Math.PI / 2);
  foliage.createRusticBench(0, -12, 0);

  // === BIOME 4: BỜ BIỂN BÌNH MINH (Hàng dừa nghiêng nhiệt đới) ===
  const palmCoords = [
    [-68, 334, 1.2, 0.25], [-45, 330, 1.15, -0.2], [-18, 327, 1.3, 0.22],
    [15, 328, 1.25, -0.25], [45, 332, 1.2, 0.28], [65, 337, 1.1, -0.22],
    [82, 327, 1.35, 0.3], [-32, 331, 1.2, 0.18], [32, 329, 1.25, -0.2],
  ];
  palmCoords.forEach(([px, pz, ps, pt]) => foliage.createTropicalPalm(px, pz, ps, pt));

  // === ĐẠI LỘ HUYẾT MẠCH 540M: HÀNG CÂY SỒI & PHONG RỢP BÓNG, CỘT ĐÈN & GHẾ NGHỈ CHÂN ===
  // 1. Hàng cây đại lộ Bắc - Nam (Hai bên đường x = -7.8 và x = 7.8, cách mỗi 18m)
  for (let z = -90; z <= 150; z += 18) {
    if (Math.abs(z - 3) < 14) continue; // Tránh giao lộ ngã tư vòng xuyến
    [-7.8, 7.8].forEach((px, sideIdx) => {
      // Cây sồi đại thụ & cây phong lá vàng rợp bóng mát
      if ((Math.abs(z) + sideIdx) % 2 === 0) {
        foliage.createCloudTree(px, z, 1.25);
      } else {
        foliage.createGoldenMaple(px, z, 1.2);
      }
      // Khóm hoa cẩm tú cầu & hoa dại chân cây
      if (Math.abs(z) % 36 === 0) {
        foliage.createHydrangeaBush(px + (px > 0 ? 1.4 : -1.4), z, 1.1, (z > 0 ? 'pink' : 'blue'));
        foliage.createFlowerPatch(px, z + 2.2, 6, 1.5);
      }
    });

    // Ghế gỗ nghỉ chân dưới bóng mát râm ran cách mỗi 36m
    if (Math.abs(z) % 36 === 18 && z > -80 && z < 140) {
      foliage.createRusticBench(-7.2, z, Math.PI / 2);
      foliage.createRusticBench(7.2, z, -Math.PI / 2);
    }
  }

  // 2. Đèn đường cổ điển đại lộ Bắc - Nam (x = -6.4 và x = 6.4)
  for (let z = -90; z <= 150; z += 36) {
    foliage.createVintageStreetLamp(-6.4, z);
    foliage.createVintageStreetLamp(6.4, z);
  }

  // 3. Hàng cây & Đèn đường đại lộ Đông - Tây (Nối Làng Hoa Mai sang Vùng Hồ Pha Lê)
  for (let x = -130; x <= 130; x += 22) {
    if (Math.abs(x) > 16) { // Tránh ngã tư
      // Cây thông Alpine & cây sồi xanh mát hai bên đường
      foliage.createAlpinePine(x, -5.5, 1.2);
      foliage.createCloudTree(x, 12.5, 1.15);
      foliage.createVintageStreetLamp(x, 6.5);
    }
  }

  // 4. Hàng rào gỗ & Xe kéo nông sản cổ điển dọc đường làng Nông Trại (z: 35)
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

  // === ĐẠI LỘ HUYẾT MẠCH KẾT NỐI CÁC KHU VỰC THẾ GIỚI MỞ ===
  road(scene, 'north-south-road', 0, 152, 9, 390, materials);
  road(scene, 'east-west-road', 0, 3, 340, 9, materials);
  [-60, 0, 60].forEach((x, index) => road(scene, `farm-spine-${index + 1}`, x, 181, 6.5, 178, materials));
  [98, 126, 154, 182, 210, 238, 266].forEach((z, index) => {
    road(scene, `farm-row-${index + 1}`, 0, z, 128, 6.5, materials);
  });

  // Cổng ranh giới — tên gọi mô tả hướng đến, không đặt biển "trung tâm" ngay giữa thành phố.
  zoneGate(scene, 0, 62, 0, 'ĐỒNG QUÊ HOA MAI', '#67a65b', materials, shadows);
  zoneGate(scene, -82, 3, Math.PI / 2, 'LÀNG PHÍA TÂY', '#67a65b', materials, shadows);
  zoneGate(scene, 105, 3, Math.PI / 2, 'HỒ PHA LÊ', '#64c4df', materials, shadows);
  zoneGate(scene, 0, 292, 0, 'BIỂN BÌNH MINH', '#f0c05f', materials, shadows);

  // === SIÊU QUẢNG TRƯỜNG PLAY TOGETHER (CENTRAL PLAZA REDESIGN) ===
  // Đĩa tròn kem bơ 86m, Đài phun nước bánh kem 3 tầng ngôi sao vàng, 4 Tòa nhà Chibi Toy
  const cityMasterplan = createCityMasterplan(scene, shadows);
  const playTogetherPlaza = createPlayTogetherPlaza(scene, shadows, foliage);

  // 4. Biệt thự cổ điển hai bên lối vào đại lộ thị trấn
  ruralHouses.createSwissChalet(-132, -20, 1.05, true);
  ruralHouses.createCottageHouse(-132, 20, 1.05);

  // 5. Tòa Thị Chính & Tháp Chuông Hoàng Gia tọa lạc uy nghiêm tại tâm trục cuối đại lộ (z = -65)
  const townHall = createTownHall(scene, shadows, { x: 0, y: 0, z: -55 });

  // 7. Chợ Phiên Nông Sản Thị Trấn Làng Gió (4 Quầy hàng chuyên biệt & Cafe ngoài trời)
  const farmersMarket = createFarmersMarket(scene, shadows, foliage, { x: 0, z: 145 });

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
    cityMasterplan,
    farmersMarket,
    townCitizens,
    townHall,
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
