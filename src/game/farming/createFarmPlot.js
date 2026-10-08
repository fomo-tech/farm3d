import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3, Matrix, Quaternion } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import '@babylonjs/core/Meshes/thinInstanceMesh.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { FARM_CONFIG } from '../config.js';
import { createSoilTexture, createMeadowTexture } from '../world/createStylizedTextures.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial } from '../rendering/PlayTogetherTheme.js';
import { LANDSCAPE_ART as ART } from '../world/LandscapeArt.js';

/**
 * Tạo khuôn viên nông trại người chơi chuẩn Ghibli x Play Together:
 * - Nền thảm cỏ xanh mượt mà (Lush Meadow Grass có cỏ 3 lá & hoa cúc dại)
 * - Tuyến đường lát đá phiến tự nhiên kết nối cổng, ruộng, nhà và chuồng
 * - 12 ô luống đất tơi xốp viền gỗ sồi ngăn nắp
 * - Cây táo trĩu quả ở góc vườn đón nắng
 * - Hàng rào trắng sứ bo tròn mập mạp và 4 trụ đèn lồng ấm áp
 */
export function createFarmPlot(scene, origin = { x: 0, z: 0 }, shadows = null) {
  const root = new TransformNode(`farm-estate-${origin.farmId || 'plot'}`, scene);
  root.position.set(origin.x, 0, origin.z);

  const isOwner = Boolean(origin.isOwner);

  // 1. Materials phong cách Ghibli x Play Together
  let soilMat = scene.getMaterialByName('mat-soil-base-rich');
  if (!soilMat) {
    soilMat = new StandardMaterial('mat-soil-base-rich', scene);
    soilMat.diffuseTexture = createSoilTexture(scene, 512, false);
    soilMat.ambientColor = new Color3(0.5, 0.5, 0.5);
    soilMat.specularColor = new Color3(0.08, 0.08, 0.08);
  }

  // Thảm cỏ xanh mượt mà Ghibli Meadow cho nền nông trại (thay thế hoàn toàn màu hồng cũ)
  let grassMat = scene.getMaterialByName('mat-estate-meadow-grass');
  if (!grassMat) {
    grassMat = new StandardMaterial('mat-estate-meadow-grass', scene);
    const tex = createMeadowTexture(scene, 1024);
    tex.anisotropicFilteringLevel = 16;
    const estateW = FARM_CONFIG.estateWidth || 28;
    const estateD = FARM_CONFIG.estateDepth || 28;
    tex.uScale = Number((estateW / 12).toFixed(2));
    tex.vScale = Number((estateD / 12).toFixed(2));
    grassMat.diffuseTexture = tex;
    grassMat.ambientColor = new Color3(0.55, 0.55, 0.55);
    grassMat.specularColor = new Color3(0.04, 0.04, 0.04);
  }

  const borderMat = createToyMaterial(scene, isOwner ? 'mat-toy-border-owner' : 'mat-toy-border-neighbor', isOwner ? PLAY_TOGETHER_PALETTE.farm.honeyWood : '#c5a07a', {
    specularPower: 64,
    specularLevel: 0.35,
    ambientScale: 0.52,
  });

  const stonePathMat = createToyMaterial(scene, 'mat-toy-flagstone-road', ART.pathLight, {
    specularPower: 26,
    specularLevel: 0.12,
    ambientScale: 0.65,
  });

  const fenceMat = createToyMaterial(scene, isOwner ? 'mat-toy-fence-owner' : 'mat-toy-fence-neighbor', isOwner ? PLAY_TOGETHER_PALETTE.farm.fenceWhite : '#e5dfd5', {
    specularPower: 40,
    specularLevel: 0.08,
    ambientScale: 0.58,
  });

  const lanternMat = createToyMaterial(scene, 'mat-toy-plot-lantern', PLAY_TOGETHER_PALETTE.pastels.butterYellow, {
    emissiveHex: '#fbbf24',
    specularPower: 96,
    specularLevel: 0.8,
  });

  const estateWidth = FARM_CONFIG.estateWidth;
  const estateDepth = FARM_CONFIG.estateDepth;

  // 2. Nền khuôn viên nông trại: Thảm cỏ xanh ngát rực rỡ (Lush Meadow Base)
  const basePlate = MeshBuilder.CreateBox('estate-base', {
    width: estateWidth,
    depth: estateDepth,
    height: 0.12,
  }, scene);
  basePlate.position.set(0, 0.05, 0);
  basePlate.material = grassMat;
  basePlate.receiveShadows = !origin.lightweight;
  basePlate.parent = root;

  if (origin.lightweight) {
    root.metadata = { detailed: false, lightweight: true };
    const halfW = estateWidth / 2;
    const halfD = estateDepth / 2;

    // Five curbs share one source mesh and one draw call in the distant LOD.
    const curb = MeshBuilder.CreateBox('lw-curbs-lod', { size: 1 }, scene);
    curb.material = borderMat;
    curb.parent = root;
    const curbParts = [
      [halfW - 2.4, 0.14, 0.16, -halfW / 2 - 1.2, 0.08, -halfD],
      [halfW - 2.4, 0.14, 0.16, halfW / 2 + 1.2, 0.08, -halfD],
      [estateWidth, 0.14, 0.16, 0, 0.08, halfD],
      [0.16, 0.14, estateDepth, -halfW, 0.08, 0],
      [0.16, 0.14, estateDepth, halfW, 0.08, 0],
    ];
    const curbMatrices = new Float32Array(curbParts.length * 16);
    curbParts.forEach(([w, h, d, x, y, z], i) => curbMatrices.set(
      Matrix.Compose(new Vector3(w, h, d), Quaternion.Identity(), new Vector3(x, y, z)).m, i * 16,
    ));
    curb.thinInstanceSetBuffer('matrix', curbMatrices, 16, true);
    curb.thinInstanceRefreshBoundingInfo(true);

    // Lối vào cổng lát đá phiến tự nhiên nối từ lề đường
    const apron = MeshBuilder.CreateBox('lw-apron', { width: 4.4, height: 0.08, depth: 3.2 }, scene);
    apron.position.set(0, 0.075, -halfD + 1.5);
    apron.material = stonePathMat;
    apron.parent = root;

    // Biển gỗ cắm mốc thông tin lô đất đang mở bán
    const signPost = MeshBuilder.CreateCylinder('lw-sign-post', { height: 1.1, diameter: 0.1, tessellation: 8 }, scene);
    signPost.position.set(2.6, 0.55, -halfD + 1.2);
    signPost.material = borderMat;
    signPost.parent = root;

    const signBoard = MeshBuilder.CreateBox('lw-sign-board', { width: 1.1, height: 0.5, depth: 0.08 }, scene);
    signBoard.position.set(2.6, 0.95, -halfD + 1.2);
    signBoard.material = stonePathMat;
    signBoard.parent = root;

    // Distant farm HLOD: keep the recognizable field and small farmhouse in
    // sight until the original detailed plot is ready. It is never a blank lot.
    const field = MeshBuilder.CreateBox('lw-field-lod', { width: 7.2, height: 0.08, depth: 4.8 }, scene);
    field.position.set(0, 0.13, -1.5);
    field.material = borderMat;
    field.parent = root;
    const cabin = MeshBuilder.CreateBox('lw-farmhouse-lod', { width: 3.1, height: 2.1, depth: 2.7 }, scene);
    cabin.position.set(-5.2, 1.1, 3.8);
    cabin.material = stonePathMat;
    cabin.parent = root;

    // 100% diện tích bên trong là thảm cỏ phẳng sạch sẽ, không cắm cây hay luống cày giả lấn đất của người chơi
    return [];
  }

  root.metadata = { detailed: true, lightweight: false };

  // 3. Tuyến đường đá phiến tự nhiên (Natural Cobblestone Flagstone Paths)
  // Lối đi chính từ cổng vào đến trước ruộng
  const entryPath = MeshBuilder.CreateBox(`estate-entry-path-${origin.farmId}`, {
    width: 4.6,
    depth: 3.8,
    height: 0.08,
  }, scene);
  entryPath.position.set(0, 0.13, -7.8);
  entryPath.material = stonePathMat;
  entryPath.parent = root;
  entryPath.receiveShadows = true;

  // Ram dốc lát đá phiến nối từ mép đường giao thông vào thẳng cổng trang trại (Driveway Apron)
  const drivewayApron = MeshBuilder.CreateBox(`estate-driveway-${origin.farmId}`, {
    width: 3.8,
    depth: 3.2,
    height: 0.07,
  }, scene);
  drivewayApron.position.set(0, 0.095, -11.2);
  drivewayApron.material = stonePathMat;
  drivewayApron.receiveShadows = true;
  drivewayApron.parent = root;

  // Hành lang đá ngang kết nối ruộng sang Nhà và Chuồng
  const midWalkway = MeshBuilder.CreateBox(`estate-mid-walkway-${origin.farmId}`, {
    width: 14.8,
    depth: 1.8,
    height: 0.08,
  }, scene);
  midWalkway.position.set(0, 0.15, 0.8);
  midWalkway.material = stonePathMat;
  midWalkway.parent = root;
  midWalkway.receiveShadows = true;

  // Lối rẽ đá vào hiên Nhà cấp 1 (Bên trái)
  const homePath = MeshBuilder.CreateBox(`estate-home-path-${origin.farmId}`, {
    width: 2.4,
    depth: 2.4,
    height: 0.08,
  }, scene);
  homePath.position.set(-4.8, 0.17, 2.0);
  homePath.material = stonePathMat;
  homePath.parent = root;
  homePath.receiveShadows = true;

  // Lối rẽ đá vào cổng Chuồng lộ thiên (Bên phải)
  const corralPath = MeshBuilder.CreateBox(`estate-corral-path-${origin.farmId}`, {
    width: 2.4,
    depth: 2.4,
    height: 0.08,
  }, scene);
  corralPath.position.set(4.8, 0.17, 2.0);
  corralPath.material = stonePathMat;
  corralPath.parent = root;
  corralPath.receiveShadows = true;

  // Các phiến đá cuội bước chân (Stepping Stones) điểm xuyết trên đường cỏ
  const pathStoneMat = createToyMaterial(scene, 'mat-toy-step-stone', '#cfc2ad', {
    specularPower: 22,
    specularLevel: 0.1,
    ambientScale: 0.65,
  });
  [-9.2, -8.0, -6.8].forEach((z, index) => {
    const stone = MeshBuilder.CreateBox(`estate-step-${origin.farmId}-${index}`, {
      width: 1.6,
      depth: 0.72,
      height: 0.1,
    }, scene);
    stone.position.set(0, 0.17, z);
    stone.rotation.y = index % 2 ? 0.06 : -0.06;
    stone.material = pathStoneMat;
    stone.parent = root;
  });


  // 4. Cây Táo Đỏ Trĩu Quả ở Góc Vườn Sân Trước (Fruit-bearing Apple Tree)
  const treeRoot = new TransformNode(`estate-tree-${origin.farmId}`, scene);
  treeRoot.position.set(-7.2, 0, -3.0);
  treeRoot.parent = root;

  const trunk = MeshBuilder.CreateCylinder('tree-trunk', {
    height: 2.8,
    diameterTop: 0.35,
    diameterBottom: 0.55,
    tessellation: 12,
  }, scene);
  trunk.position.set(0, 1.4, 0);
  trunk.material = borderMat;
  trunk.parent = treeRoot;
  shadows?.addShadowCaster(trunk);

  const foliageMats = [
    createToyMaterial(scene, 'mat-tree-leaf-bright', ART.leafLight, { ambientScale: 0.3, specularLevel: 0.03 }),
    createToyMaterial(scene, 'mat-tree-leaf-mid', ART.leaf, { ambientScale: 0.3, specularLevel: 0.03 }),
    createToyMaterial(scene, 'mat-tree-apple-red', '#D95660', { specularLevel: 0.03 }),
  ];

  // Các tán lá tròn mập bồng bềnh
  [
    { x: 0, y: 3.2, z: 0, s: 2.2, mat: foliageMats[0] },
    { x: -0.6, y: 2.7, z: 0.4, s: 1.6, mat: foliageMats[1] },
    { x: 0.7, y: 2.8, z: -0.3, s: 1.7, mat: foliageMats[1] },
    { x: 0.2, y: 3.7, z: 0.2, s: 1.5, mat: foliageMats[0] },
  ].forEach((clump, idx) => {
    const leaf = MeshBuilder.CreateIcoSphere(`tree-foliage-${idx}`, { radius: clump.s / 2, subdivisions: 2, flat: true }, scene);
    leaf.position.set(clump.x, clump.y, clump.z);
    leaf.material = clump.mat;
    leaf.parent = treeRoot;
    shadows?.addShadowCaster(leaf);
  });

  // Trái táo đỏ mọng trĩu cành
  [
    { x: -0.6, y: 2.3, z: 0.8 },
    { x: 0.5, y: 2.4, z: 0.7 },
    { x: -0.8, y: 2.8, z: -0.3 },
    { x: 0.8, y: 2.6, z: -0.5 },
    { x: 0.1, y: 2.2, z: -0.9 },
    { x: -0.2, y: 3.1, z: 0.9 },
  ].forEach((apple, idx) => {
    const ap = MeshBuilder.CreateSphere(`tree-apple-${idx}`, { diameter: 0.24, segments: 8 }, scene);
    ap.position.set(apple.x, apple.y, apple.z);
    ap.material = foliageMats[2];
    ap.parent = treeRoot;
  });

  // 5. Viền bao quanh khuôn viên phân định ranh giới đất
  const borderGirth = 0.24;
  const borderHeight = 0.18;
  const borderY = borderHeight / 2 + 0.03;
  [
    { name: 'back', width: estateWidth + borderGirth, depth: borderGirth, x: 0, z: estateDepth / 2 },
    { name: 'front', width: estateWidth + borderGirth, depth: borderGirth, x: 0, z: -estateDepth / 2 },
    { name: 'left', width: borderGirth, depth: estateDepth, x: -estateWidth / 2, z: 0 },
    { name: 'right', width: borderGirth, depth: estateDepth, x: estateWidth / 2, z: 0 },
  ].forEach(edge => {
    const borderRim = MeshBuilder.CreateBox(`estate-border-rim-${edge.name}`, {
      width: edge.width,
      depth: edge.depth,
      height: borderHeight,
    }, scene);
    borderRim.position.set(edge.x, borderY, edge.z);
    borderRim.material = borderMat;
    borderRim.parent = root;
  });

  // 6. Các Ô Ruộng Đất Canh Tác (12 Cultivation Tiles)
  const colSpacing = FARM_CONFIG.tileSpacingX || 2.1;
  const rowSpacing = FARM_CONFIG.tileSpacingZ || 1.8;
  const totalW = (FARM_CONFIG.plotColumns - 1) * colSpacing;
  const totalD = (FARM_CONFIG.plotRows - 1) * rowSpacing;
  const cropsX = FARM_CONFIG.anchors?.crops?.x ?? 0.0;
  const cropsZ = FARM_CONFIG.anchors?.crops?.z ?? -3.0;

  // An open perimeter, not a solid beige slab behind/over the soil beds.
  const bedWidth = totalW + colSpacing;
  const bedDepth = totalD + rowSpacing;
  [
    { width: bedWidth + 0.24, depth: 0.12, x: cropsX, z: cropsZ - bedDepth / 2 - 0.06 },
    { width: bedWidth + 0.24, depth: 0.12, x: cropsX, z: cropsZ + bedDepth / 2 + 0.06 },
    { width: 0.12, depth: bedDepth, x: cropsX - bedWidth / 2 - 0.06, z: cropsZ },
    { width: 0.12, depth: bedDepth, x: cropsX + bedWidth / 2 + 0.06, z: cropsZ },
  ].forEach((edge, index) => {
    const rim = MeshBuilder.CreateBox(`crops-frame-edge-${origin.farmId}-${index}`, { width: edge.width, depth: edge.depth, height: 0.12 }, scene);
    rim.position.set(edge.x, 0.13, edge.z);
    rim.material = borderMat;
    rim.parent = root;
  });

  // Cọc gỗ tiêu cắm đầu bờ ruộng xinh xắn
  const cropStake = MeshBuilder.CreateCylinder(`crops-stake-${origin.farmId}`, { height: 0.95, diameter: 0.1, tessellation: 8 }, scene);
  cropStake.position.set(cropsX + totalW / 2 + 0.6, 0.48, cropsZ - totalD / 2 - 0.2);
  cropStake.material = borderMat;
  cropStake.parent = root;

  const cropSignBoard = MeshBuilder.CreateBox(`crops-sign-${origin.farmId}`, { width: 0.65, height: 0.35, depth: 0.08 }, scene);
  cropSignBoard.position.set(cropsX + totalW / 2 + 0.6, 0.85, cropsZ - totalD / 2 - 0.2);
  cropSignBoard.material = borderMat;
  cropSignBoard.parent = root;

  const tiles = [];
  if (origin.renderTiles === false) {
    const previewSoil = createToyMaterial(scene, 'mat-estate-preview-soil', '#9c7458', {
      ambientScale: 0.48, specularLevel: 0.06, specularPower: 24,
    });
    for (let row = 0; row < FARM_CONFIG.plotRows; row += 1) {
      for (let column = 0; column < FARM_CONFIG.plotColumns; column += 1) {
        const bed = MeshBuilder.CreateBox(`preview-bed-soil-${origin.farmId}-${column}-${row}`, {
          width: colSpacing - 0.22, depth: rowSpacing - 0.22, height: 0.12,
        }, scene);
        bed.position.set(cropsX + column * colSpacing - totalW / 2, 0.17, cropsZ + row * rowSpacing - totalD / 2);
        bed.material = previewSoil;
        bed.receiveShadows = true;
        bed.parent = root;
      }
    }
  } else for (let row = 0; row < FARM_CONFIG.plotRows; row += 1) {
    for (let column = 0; column < FARM_CONFIG.plotColumns; column += 1) {
      const tile = MeshBuilder.CreateBox(`soil-${origin.farmId}-${column}-${row}`, {
        width: colSpacing - 0.22,
        depth: rowSpacing - 0.22,
        height: 0.14,
      }, scene);
      const posX = cropsX + (column * colSpacing - totalW / 2);
      const posZ = cropsZ + (row * rowSpacing - totalD / 2);
      tile.position.set(posX, 0.08, posZ);
      tile.material = soilMat;
      tile.metadata = {
        type: 'farm-tile',
        column,
        row,
        index: row * FARM_CONFIG.plotColumns + column,
        state: 'empty',
        farmId: origin.farmId,
        interactive: Boolean(origin.interactive),
      };
      tile.receiveShadows = true;
      tile.parent = root;
      tiles.push(tile);
    }
  }

  // 7. Low, warm picket fence; the entrance remains an unobstructed gap.
  const halfW = estateWidth / 2;
  const halfD = estateDepth / 2;
  const fenceHeight = 0.92;
  const railRadius = 0.075;
  const picketMatrices = [];
  const capMatrices = [];

  function createRoundRail(name, length, pos, isZ = false) {
    const rail = MeshBuilder.CreateCylinder(name, {
      height: length,
      diameter: railRadius * 2,
      tessellation: 12,
    }, scene);
    rail.position.copyFrom(pos);
    if (isZ) {
      rail.rotation.x = Math.PI / 2;
    } else {
      rail.rotation.z = Math.PI / 2;
    }
    rail.material = fenceMat;
    rail.parent = root;
    if (shadows) shadows.addShadowCaster(rail);
    return rail;
  }

  function createPickets(startPos, endPos, count) {
    for (let i = 0; i <= count; i++) {
      const frac = count === 0 ? 0.5 : i / count;
      const px = startPos.x + (endPos.x - startPos.x) * frac;
      const pz = startPos.z + (endPos.z - startPos.z) * frac;

      picketMatrices.push(Matrix.Translation(px, fenceHeight / 2 + 0.08, pz));
      capMatrices.push(Matrix.Translation(px, fenceHeight + 0.08, pz));
    }
  }

  // Cạnh sau
  createRoundRail('fence-back-top', estateWidth, new Vector3(0, fenceHeight * 0.8 + 0.08, halfD));
  createRoundRail('fence-back-bot', estateWidth, new Vector3(0, fenceHeight * 0.35 + 0.08, halfD));
  createPickets(new Vector3(-halfW + 0.4, 0, halfD), new Vector3(halfW - 0.4, 0, halfD), 18);

  // Cạnh trái
  createRoundRail('fence-left-top', estateDepth, new Vector3(-halfW, fenceHeight * 0.8 + 0.08, 0), true);
  createRoundRail('fence-left-bot', estateDepth, new Vector3(-halfW, fenceHeight * 0.35 + 0.08, 0), true);
  createPickets(new Vector3(-halfW, 0, -halfD + 0.4), new Vector3(-halfW, 0, halfD - 0.4), 16);

  // Cạnh phải
  createRoundRail('fence-right-top', estateDepth, new Vector3(halfW, fenceHeight * 0.8 + 0.08, 0), true);
  createRoundRail('fence-right-bot', estateDepth, new Vector3(halfW, fenceHeight * 0.35 + 0.08, 0), true);
  createPickets(new Vector3(halfW, 0, -halfD + 0.4), new Vector3(halfW, 0, halfD - 0.4), 16);

  // Mặt trước chừa cửa rộng ở giữa (5.5m)
  const frontWing = (estateWidth - 5.5) / 2;
  if (frontWing > 0.5) {
    createRoundRail('fence-front-l-top', frontWing, new Vector3(-halfW + frontWing / 2, fenceHeight * 0.8 + 0.08, -halfD));
    createRoundRail('fence-front-l-bot', frontWing, new Vector3(-halfW + frontWing / 2, fenceHeight * 0.35 + 0.08, -halfD));
    createPickets(new Vector3(-halfW + 0.4, 0, -halfD), new Vector3(-halfW + frontWing - 0.2, 0, -halfD), 3);

    createRoundRail('fence-front-r-top', frontWing, new Vector3(halfW - frontWing / 2, fenceHeight * 0.8 + 0.08, -halfD));
    createRoundRail('fence-front-r-bot', frontWing, new Vector3(halfW - frontWing / 2, fenceHeight * 0.35 + 0.08, -halfD));
    createPickets(new Vector3(halfW - frontWing + 0.2, 0, -halfD), new Vector3(halfW - 0.4, 0, -halfD), 3);
  }

  // One mesh per shape instead of more than one hundred Babylon meshes per lot.
  const picketPost = MeshBuilder.CreateCylinder('picket-post-batch', {
    height: fenceHeight, diameter: 0.14, tessellation: 10,
  }, scene);
  picketPost.material = fenceMat;
  picketPost.parent = root;
  const picketData = new Float32Array(picketMatrices.length * 16);
  picketMatrices.forEach((matrix, index) => picketData.set(matrix.m, index * 16));
  picketPost.thinInstanceSetBuffer('matrix', picketData, 16, true);
  picketPost.thinInstanceRefreshBoundingInfo(true);

  const cap = MeshBuilder.CreateSphere('picket-cap-batch', { diameter: 0.18, segments: 8 }, scene);
  cap.material = fenceMat;
  cap.parent = root;
  const capData = new Float32Array(capMatrices.length * 16);
  capMatrices.forEach((matrix, index) => capData.set(matrix.m, index * 16));
  cap.thinInstanceSetBuffer('matrix', capData, 16, true);
  cap.thinInstanceRefreshBoundingInfo(true);
  if (shadows) shadows.addShadowCaster(picketPost);

  // 8. Bốn Cột Trụ Góc Hình Trụ Tròn Có Quả Cầu Đỉnh Và Đèn Lồng Ấm Áp
  [
    [-halfW, -halfD],
    [halfW, -halfD],
    [-halfW, halfD],
    [halfW, halfD],
  ].forEach(([cx, cz], i) => {
    const post = MeshBuilder.CreateCylinder(`estate-post-${i}`, {
      height: 1.15,
      diameter: 0.32,
      tessellation: 14,
    }, scene);
    post.position.set(cx, 0.58, cz);
    post.material = borderMat;
    post.parent = root;

    const finial = MeshBuilder.CreateSphere(`estate-finial-${i}`, { diameter: 0.38, segments: 10 }, scene);
    finial.position.set(cx, 1.25, cz);
    finial.material = borderMat;
    finial.parent = root;

    const lantern = MeshBuilder.CreateSphere(`estate-lantern-${i}`, { diameter: 0.3, segments: 8 }, scene);
    lantern.position.set(cx, 1.55, cz);
    lantern.material = lanternMat;
    lantern.parent = root;

    if (shadows) {
      shadows.addShadowCaster(post);
      shadows.addShadowCaster(finial);
    }
  });

  root.metadata = {
    detailed: origin.renderTiles !== false,
    farmLayoutVersion: FARM_CONFIG.layoutVersion,
    footprint: { width: estateWidth, depth: estateDepth },
  };

  return tiles;
}
