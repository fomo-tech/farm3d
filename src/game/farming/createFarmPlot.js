import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { FARM_CONFIG } from '../config.js';
import { createSoilTexture } from '../world/createStylizedTextures.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial } from '../rendering/PlayTogetherTheme.js';

/**
 * Tạo khuôn viên đất nông trại gọn gàng phong cách Play Together:
 * - Hàng rào trắng sứ bo tròn mập mạp (Chunky White Picket Fence)
 * - 4 Trụ góc tròn có quả cầu đỉnh và đèn lồng ấm áp
 * - Nền cát kem bánh mềm mại và ô đất sô-cô-la tơi xốp
 */
export function createFarmPlot(scene, origin = { x: 0, z: 0 }, shadows = null) {
  const root = new TransformNode(`farm-estate-${origin.farmId || 'plot'}`, scene);
  root.position.set(origin.x, 0, origin.z);

  const isOwner = Boolean(origin.isOwner);
  const lotNum = origin.lotNumber || 1;
  const ownerName = origin.owner || (isOwner ? 'Bạn' : 'Hàng xóm');

  // 1. Materials phong cách Play Together
  let soilMat = scene.getMaterialByName('mat-soil-base-rich');
  if (!soilMat) {
    soilMat = new StandardMaterial('mat-soil-base-rich', scene);
    soilMat.diffuseTexture = createSoilTexture(scene, 512, false);
    soilMat.ambientColor = new Color3(0.45, 0.45, 0.45);
    soilMat.specularColor = new Color3(0.08, 0.08, 0.08);
  }

  const borderMat = createToyMaterial(scene, isOwner ? 'mat-toy-border-owner' : 'mat-toy-border-neighbor', isOwner ? PLAY_TOGETHER_PALETTE.farm.honeyWood : '#94a3b8', {
    specularPower: 64,
    specularLevel: 0.35,
    ambientScale: 0.48,
  });
  const pathMat = createToyMaterial(scene, 'mat-toy-estate-path', PLAY_TOGETHER_PALETTE.farm.ceramicCream, {
    specularPower: 32,
    specularLevel: 0.15,
    ambientScale: 0.52,
  });
  const fenceMat = createToyMaterial(scene, isOwner ? 'mat-toy-fence-owner' : 'mat-toy-fence-neighbor', isOwner ? PLAY_TOGETHER_PALETTE.farm.fenceWhite : '#f1f5f9', {
    specularPower: 80,
    specularLevel: 0.45,
    ambientScale: 0.55,
  });
  const lanternMat = createToyMaterial(scene, 'mat-toy-plot-lantern', PLAY_TOGETHER_PALETTE.pastels.butterYellow, {
    emissiveHex: '#fbbf24',
    specularPower: 96,
    specularLevel: 0.7,
  });

  const width = FARM_CONFIG.plotColumns * FARM_CONFIG.tileSize;
  const depth = FARM_CONFIG.plotRows * FARM_CONFIG.tileSize;

  // 2. Nền khuôn viên nông trại (Estate Base Plate) - Nâng nhẹ tạo rãnh thoát nước tự nhiên
  const estateWidth = width + 2.8;
  const estateDepth = depth + 2.8;

  const basePlate = MeshBuilder.CreateBox('estate-base', {
    width: estateWidth,
    depth: estateDepth,
    height: 0.12,
  }, scene);
  basePlate.position.set(0, 0.05, 0);
  basePlate.material = pathMat;
  basePlate.receiveShadows = true;
  basePlate.parent = root;

  // Viền bao quanh khuôn viên phân định ranh giới đất
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

  // 3. Các ô ruộng đất canh tác (Cultivation Tiles)
  const tiles = [];
  if (origin.renderTiles === false) {
    const dormantSoil = MeshBuilder.CreateBox(`dormant-soil-${origin.farmId}`, {
      width: width - 0.25,
      depth: depth - 0.25,
      height: 0.16,
    }, scene);
    dormantSoil.position.set(0, 0.13, 0);
    dormantSoil.material = soilMat;
    dormantSoil.receiveShadows = true;
    dormantSoil.parent = root;
  } else for (let row = 0; row < FARM_CONFIG.plotRows; row += 1) {
    for (let column = 0; column < FARM_CONFIG.plotColumns; column += 1) {
      const tile = MeshBuilder.CreateBox(`soil-${origin.farmId}-${column}-${row}`, {
        width: FARM_CONFIG.tileSize - 0.16,
        depth: FARM_CONFIG.tileSize - 0.16,
        height: 0.14,
      }, scene);
      tile.position.set(
        column * FARM_CONFIG.tileSize - width / 2 + FARM_CONFIG.tileSize / 2,
        0.08,
        row * FARM_CONFIG.tileSize - depth / 2 + FARM_CONFIG.tileSize / 2,
      );
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

  // 4. Hàng rào gỗ cọc tròn sơn trắng sứ bo vòm (Chunky White Picket Fence)
  const halfW = estateWidth / 2;
  const halfD = estateDepth / 2;
  const fenceHeight = 0.72;
  const railRadius = 0.06;

  // Hàm tạo thanh ray ngang bo tròn
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

  // Hàm rải các cọc rào tròn đầu vòm
  function createPickets(startPos, endPos, count) {
    for (let i = 0; i <= count; i++) {
      const frac = count === 0 ? 0.5 : i / count;
      const px = startPos.x + (endPos.x - startPos.x) * frac;
      const pz = startPos.z + (endPos.z - startPos.z) * frac;

      const picketPost = MeshBuilder.CreateCylinder(`picket-post-${i}`, {
        height: fenceHeight,
        diameter: 0.1,
        tessellation: 10,
      }, scene);
      picketPost.position.set(px, fenceHeight / 2 + 0.08, pz);
      picketPost.material = fenceMat;
      picketPost.parent = root;

      // Đầu cọc bo bán cầu tròn xinh xắn
      const cap = MeshBuilder.CreateSphere(`picket-cap-${i}`, {
        diameter: 0.12,
        segments: 8,
      }, scene);
      cap.position.set(px, fenceHeight + 0.08, pz);
      cap.material = fenceMat;
      cap.parent = root;

      if (shadows && i % 2 === 0) shadows.addShadowCaster(picketPost);
    }
  }

  // Cạnh sau
  createRoundRail('fence-back-top', estateWidth, new Vector3(0, fenceHeight * 0.8 + 0.08, halfD));
  createRoundRail('fence-back-bot', estateWidth, new Vector3(0, fenceHeight * 0.35 + 0.08, halfD));
  createPickets(new Vector3(-halfW + 0.4, 0, halfD), new Vector3(halfW - 0.4, 0, halfD), 12);

  // Cạnh trái
  createRoundRail('fence-left-top', estateDepth, new Vector3(-halfW, fenceHeight * 0.8 + 0.08, 0), true);
  createRoundRail('fence-left-bot', estateDepth, new Vector3(-halfW, fenceHeight * 0.35 + 0.08, 0), true);
  createPickets(new Vector3(-halfW, 0, -halfD + 0.4), new Vector3(-halfW, 0, halfD - 0.4), 10);

  // Cạnh phải
  createRoundRail('fence-right-top', estateDepth, new Vector3(halfW, fenceHeight * 0.8 + 0.08, 0), true);
  createRoundRail('fence-right-bot', estateDepth, new Vector3(halfW, fenceHeight * 0.35 + 0.08, 0), true);
  createPickets(new Vector3(halfW, 0, -halfD + 0.4), new Vector3(halfW, 0, halfD - 0.4), 10);

  // Mặt trước chừa cửa rộng ở giữa
  const frontWing = (estateWidth - 5.5) / 2;
  if (frontWing > 0.5) {
    createRoundRail('fence-front-l-top', frontWing, new Vector3(-halfW + frontWing / 2, fenceHeight * 0.8 + 0.08, -halfD));
    createRoundRail('fence-front-l-bot', frontWing, new Vector3(-halfW + frontWing / 2, fenceHeight * 0.35 + 0.08, -halfD));
    createPickets(new Vector3(-halfW + 0.4, 0, -halfD), new Vector3(-halfW + frontWing - 0.2, 0, -halfD), 3);

    createRoundRail('fence-front-r-top', frontWing, new Vector3(halfW - frontWing / 2, fenceHeight * 0.8 + 0.08, -halfD));
    createRoundRail('fence-front-r-bot', frontWing, new Vector3(halfW - frontWing / 2, fenceHeight * 0.35 + 0.08, -halfD));
    createPickets(new Vector3(halfW - frontWing + 0.2, 0, -halfD), new Vector3(halfW - 0.4, 0, -halfD), 3);
  }

  // 5. Bốn cột trụ góc hình trụ tròn có quả cầu đỉnh và đèn lồng ấm áp
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

    // Quả cầu đỉnh (Ball finial)
    const finial = MeshBuilder.CreateSphere(`estate-finial-${i}`, { diameter: 0.38, segments: 10 }, scene);
    finial.position.set(cx, 1.25, cz);
    finial.material = borderMat;
    finial.parent = root;

    // Đèn lồng tròn ấm áp
    const lantern = MeshBuilder.CreateSphere(`estate-lantern-${i}`, { diameter: 0.3, segments: 8 }, scene);
    lantern.position.set(cx, 1.55, cz);
    lantern.material = lanternMat;
    lantern.parent = root;

    if (shadows) {
      shadows.addShadowCaster(post);
      shadows.addShadowCaster(finial);
    }
  });

  // 6. Floating 3D Farm Banner (Biển hiệu 3D nổi trên cao luôn xoay về người chơi)
  const bannerPlane = MeshBuilder.CreatePlane(`farm-banner-${origin.farmId}`, { width: 5.2, height: 1.35 }, scene);
  bannerPlane.position.set(0, 4.0, -halfD - 0.4);
  bannerPlane.billboardMode = Mesh.BILLBOARDMODE_Y;
  bannerPlane.parent = root;

  const bannerTex = new DynamicTexture(`banner-tex-${origin.farmId}`, { width: 512, height: 140 }, scene, true);
  const bctx = bannerTex.getContext();

  function renderBannerText(name, owned) {
    bctx.clearRect(0, 0, 512, 140);

    // Bo góc nền thẻ
    bctx.fillStyle = owned ? '#d97706' : '#475569';
    bctx.beginPath();
    bctx.roundRect(8, 8, 496, 124, 20);
    bctx.fill();

    bctx.fillStyle = owned ? '#fef3c7' : '#f8fafc';
    bctx.beginPath();
    bctx.roundRect(14, 14, 484, 112, 16);
    bctx.fill();

    // Dòng 1: Tiêu đề quyền sở hữu
    bctx.fillStyle = owned ? '#b45309' : '#334155';
    bctx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillText(owned ? `🌾 NÔNG TRẠI CỦA BẠN · LÔ ${lotNum}` : `🏡 NÔNG TRẠI LÔ ${lotNum}`, 256, 46);

    // Dòng 2: Tên chủ đất
    bctx.fillStyle = owned ? '#92400e' : '#1e293b';
    bctx.font = '600 28px "Segoe UI", Arial, sans-serif';
    bctx.fillText(name || 'Nông Dân', 256, 92);
    bannerTex.update();
  }

  renderBannerText(ownerName, isOwner);

  const bannerMat = new StandardMaterial(`banner-mat-${origin.farmId}`, scene);
  bannerMat.diffuseTexture = bannerTex;
  bannerMat.emissiveTexture = bannerTex;
  bannerMat.specularColor = Color3.Black();
  bannerMat.backFaceCulling = false;
  bannerPlane.material = bannerMat;

  // Gắn handler cập nhật banner khi chủ nhân đổi
  root.metadata = {
    detailed: origin.renderTiles !== false,
    updateBanner: (newName, newIsOwner) => renderBannerText(newName, newIsOwner),
  };

  return tiles;
}
