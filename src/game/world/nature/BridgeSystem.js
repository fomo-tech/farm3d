/**
 * BridgeSystem.js
 * Unified Architectural Bridge Construction Engine for Farm3D.
 *
 * Implements the 3-Tier Bridge Design System:
 * 1. Grand Highway Bridges (Cầu Xa Lộ Liên Xã) - Dual-lane asphalt, double yellow lines,
 *    granite sidewalks, neoclassical stone balustrades, monument pillars, and high-readability signs.
 * 2. Romantic Timber Arch Bridges (Cầu Vòm Gỗ Thơ Mộng) - Smooth parabolic glulam arches,
 *    staggered oak planks, rustic rope & wood railings, and warm fairy lanterns.
 * 3. Rustic Stone Footbridges (Cầu Đá Hoa Viên) - Cobblestone arches, curved parapets,
 *    natural transition ramps, and riverside florals.
 *
 * High-Readability & Anti-Flicker Engineering:
 * - High-resolution 2048x1024 DynamicTexture with bold outlines and high-contrast colorways.
 * - Dedicated sign monuments placed at bridge entrances, angled for optimal player line-of-sight.
 * - Strict geometric elevation offsets and material zOffset to eliminate 100% of Z-fighting/flicker.
 */

import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { MODEL_PATHS, spawnModelSync } from '../../rendering/ModelAssetManager.js';
import { ALL_BRIDGES, BRIDGE_TYPES } from '../../../../shared/bridgeConfig.js';

/**
 * Tạo Bảng Tên Cầu Độc Lập (Dedicated Bridge Sign Monument).
 * Đặt trang trọng ở 2 đầu lối vào cầu, chữ to rõ nét, tương phản cao,
 * có khung viền bảo vệ, hướng góc nhìn trực diện vào người chơi, triệt tiêu 100% Z-fighting.
 */
function createBridgeSignMonument(scene, bridge, parent, position, rotationY = 0) {
  const isTimber = bridge.type === BRIDGE_TYPES.PEDESTRIAN_TIMBER;
  const isStone = bridge.type === BRIDGE_TYPES.PEDESTRIAN_STONE;

  const monumentNode = new TransformNode(`${bridge.id}-sign-node`, scene);
  monumentNode.position.copyFrom(position);
  monumentNode.rotation.y = rotationY;
  monumentNode.parent = parent;

  // 1. Chân đế trụ đỡ (Pedestal)
  const matBase = new StandardMaterial(`${bridge.id}-sign-base-mat`, scene);
  matBase.diffuseColor = Color3.FromHexString(isTimber ? '#451a03' : '#334155');
  matBase.ambientColor = matBase.diffuseColor.scale(0.35);
  matBase.specularColor = new Color3(0.08, 0.08, 0.08);

  const pedestal = MeshBuilder.CreateBox(`${bridge.id}-sign-pedestal`, {
    width: 0.38,
    height: 1.15,
    depth: 0.28,
  }, scene);
  pedestal.position.set(0, 0.575, 0);
  pedestal.material = matBase;
  pedestal.parent = monumentNode;

  // 2. Khung viền bảng (Sign Frame)
  const signWidth = 2.1;
  const signHeight = 1.1;
  const frameThickness = 0.12;

  const frameMesh = MeshBuilder.CreateBox(`${bridge.id}-sign-frame`, {
    width: signWidth,
    height: signHeight,
    depth: frameThickness,
  }, scene);
  frameMesh.position.set(0, 1.40, 0);
  frameMesh.material = matBase;
  frameMesh.parent = monumentNode;

  // 3. Texture chữ siêu nét độ phân giải 2048x1024
  const dt = new DynamicTexture(
    `${bridge.id}-dt-sign`,
    { width: 2048, height: 1024 },
    scene,
    false,
    Texture.TRILINEAR_SAMPLINGMODE
  );
  dt.anisotropicFilteringLevel = 16;
  const ctx = dt.getContext();

  // Nền bảng sang trọng, độ tương phản cực cao
  const grad = ctx.createLinearGradient(0, 0, 2048, 1024);
  if (isTimber) {
    grad.addColorStop(0.0, '#2d1305');
    grad.addColorStop(0.5, '#4a210a');
    grad.addColorStop(1.0, '#2d1305');
  } else if (isStone) {
    grad.addColorStop(0.0, '#1e293b');
    grad.addColorStop(0.5, '#334155');
    grad.addColorStop(1.0, '#1e293b');
  } else {
    // Đại cầu xa lộ: Xanh navy sẫm kết hợp đen sang trọng chuẩn biển chỉ dẫn cao cấp
    grad.addColorStop(0.0, '#091e3a');
    grad.addColorStop(0.5, '#0f2b48');
    grad.addColorStop(1.0, '#091e3a');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Viền bo góc đôi mạ vàng hoàng gia
  ctx.strokeStyle = isTimber ? '#fbbf24' : '#f59e0b';
  ctx.lineWidth = 28;
  ctx.strokeRect(36, 36, 1976, 952);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 8;
  ctx.strokeRect(60, 60, 1928, 904);

  // Header huy hiệu nhận diện
  ctx.fillStyle = isTimber ? '#fde68a' : '#38bdf8';
  ctx.font = 'bold 54px Arial, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 10;
  const badgeText = isTimber ? '★ CẦU VÒM GỖ CẢNH QUAN ★' : (isStone ? '★ CẦU ĐÁ TIỂU CẢNH ★' : '★ ĐẠI CẦU GIAO THÔNG XA LỘ ★');
  ctx.fillText(badgeText, 1024, 180);

  // Tên cầu chính (Font to 132px, cực đậm, viền đen dày chống chìm màu)
  ctx.font = '900 132px Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.lineWidth = 26;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(bridge.name.toUpperCase(), 1024, 480);
  ctx.fillStyle = isTimber ? '#fef08a' : '#ffffff';
  ctx.fillText(bridge.name.toUpperCase(), 1024, 480);

  // Dải phân cách trang trí
  ctx.strokeStyle = isTimber ? '#d97706' : '#0284c7';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(350, 620);
  ctx.lineTo(1698, 620);
  ctx.stroke();

  // Tuyến đường / phụ đề (Font to 74px rõ ràng)
  ctx.font = 'bold 74px Arial, -apple-system, sans-serif';
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(bridge.subtitle || '', 1024, 760);
  ctx.fillStyle = isTimber ? '#fed7aa' : '#e0f2fe';
  ctx.fillText(bridge.subtitle || '', 1024, 760);

  dt.update();

  const matSign = new StandardMaterial(`${bridge.id}-sign-mat`, scene);
  matSign.diffuseTexture = dt;
  matSign.emissiveTexture = dt;
  matSign.emissiveColor = new Color3(0.25, 0.25, 0.25);
  matSign.specularColor = Color3.Black();
  matSign.backFaceCulling = false;
  matSign.zOffset = -3; // Khắc phục tuyệt đối Z-fighting

  // Mặt trước (cách khung +0.025m, xoay Math.PI để hiển thị thuận chiều nhìn từ ngoài)
  const frontPlane = MeshBuilder.CreatePlane(`${bridge.id}-sign-front`, {
    width: signWidth - 0.08,
    height: signHeight - 0.08,
  }, scene);
  frontPlane.position.set(0, 1.40, frameThickness / 2 + 0.025);
  frontPlane.rotation.y = Math.PI;
  frontPlane.material = matSign;
  frontPlane.parent = monumentNode;

  // Mặt sau (cách khung -0.025m, rotation.y = 0 để hiển thị thuận chiều nhìn từ phía sau)
  const backPlane = MeshBuilder.CreatePlane(`${bridge.id}-sign-back`, {
    width: signWidth - 0.08,
    height: signHeight - 0.08,
  }, scene);
  backPlane.position.set(0, 1.40, -frameThickness / 2 - 0.025);
  backPlane.rotation.y = 0;
  backPlane.material = matSign;
  backPlane.parent = monumentNode;

  return monumentNode;
}

/**
 * Xây dựng Đại Cầu Xa Lộ (Grand Highway Bridge).
 * 2 làn xe nhựa đường cao cấp + vạch tim vàng kép + 2 vỉa hè người đi bộ +
 * vòm chịu lực đôi + lan can đá tân cổ điển + trụ mốc đại + đèn đôi + biển tên độc lập.
 */
export function createHighwayBridge(scene, bridge, parent, shadows) {
  const root = new TransformNode(bridge.id, scene);
  root.position.set(bridge.cx, 0, bridge.cz);
  root.parent = parent;

  const halfSpan = bridge.spanX / 2;
  const halfWidth = bridge.widthZ / 2;
  const roadwayWidth = bridge.widthZ - 2.4; // Lòng đường 7.2m cho 2 làn xe
  const sidewalkWidth = 1.2; // Vỉa hè mỗi bên 1.2m

  // --- 1. Vật liệu chuẩn mực ---
  const matAsphalt = new StandardMaterial(`${bridge.id}-mat-asphalt`, scene);
  matAsphalt.diffuseColor = Color3.FromHexString('#252e3d');
  matAsphalt.ambientColor = matAsphalt.diffuseColor.scale(0.35);
  matAsphalt.specularColor = new Color3(0.04, 0.04, 0.04);
  matAsphalt.zOffset = -3; // Luôn ưu tiên hiển thị phía trên cốt nền đường cũ

  const matYellowLine = new StandardMaterial(`${bridge.id}-mat-yellow`, scene);
  matYellowLine.diffuseColor = Color3.FromHexString('#f59e0b');
  matYellowLine.emissiveColor = new Color3(0.2, 0.14, 0.02);
  matYellowLine.zOffset = -6; // Ngăn ngừa triệt để Z-fighting với vạch kẻ đường cũ

  const matWhiteLine = new StandardMaterial(`${bridge.id}-mat-white-edge`, scene);
  matWhiteLine.diffuseColor = Color3.FromHexString('#e2e8f0');
  matWhiteLine.emissiveColor = new Color3(0.12, 0.12, 0.12);
  matWhiteLine.zOffset = -6;

  const matGranite = new StandardMaterial(`${bridge.id}-mat-granite`, scene);
  matGranite.diffuseColor = Color3.FromHexString(bridge.stoneColor || '#f1f5f9');
  matGranite.ambientColor = matGranite.diffuseColor.scale(0.4);
  matGranite.specularColor = new Color3(0.08, 0.08, 0.08);

  const matPiers = new StandardMaterial(`${bridge.id}-mat-piers`, scene);
  matPiers.diffuseColor = Color3.FromHexString('#cbd5e1');
  matPiers.ambientColor = matPiers.diffuseColor.scale(0.35);
  matPiers.specularColor = new Color3(0.05, 0.05, 0.05);

  // --- 2. Bản mặt lòng đường xe chạy (Roadway Deck) ---
  // Rút gọn bề ngang 6cm (-0.06m) để triệt tiêu Z-fighting mặt bên với vỉa hè đá
  const roadDeck = MeshBuilder.CreateBox(`${bridge.id}-road-deck`, {
    width: bridge.spanX,
    height: 0.22,
    depth: roadwayWidth - 0.06,
  }, scene);
  roadDeck.position.set(0, bridge.deckY, 0);
  roadDeck.material = matAsphalt;
  roadDeck.parent = root;
  roadDeck.receiveShadows = true;

  // Vạch tim đường đôi màu vàng (Double Yellow Line)
  // Mặt đường ở cao độ Y = bridge.deckY + 0.11; đặt vạch ở Y = bridge.deckY + 0.118 + zOffset
  [-0.14, 0.14].forEach((dz, idx) => {
    const yellowStripe = MeshBuilder.CreateBox(`${bridge.id}-stripe-${idx}`, {
      width: bridge.spanX + bridge.rampLen * 1.5,
      height: 0.012,
      depth: 0.12,
    }, scene);
    yellowStripe.position.set(0, bridge.deckY + 0.118, dz);
    yellowStripe.material = matYellowLine;
    yellowStripe.parent = root;
  });

  // Vạch chỉ giới trắng mép lòng đường
  [-roadwayWidth / 2 + 0.25, roadwayWidth / 2 - 0.25].forEach((dz, idx) => {
    const whiteLine = MeshBuilder.CreateBox(`${bridge.id}-edge-line-${idx}`, {
      width: bridge.spanX,
      height: 0.012,
      depth: 0.14,
    }, scene);
    whiteLine.position.set(0, bridge.deckY + 0.118, dz);
    whiteLine.material = matWhiteLine;
    whiteLine.parent = root;
  });

  // --- 3. Dốc chuyển tiếp tiếp đất mượt mà ở 2 mố cầu (Approach Ramps) ---
  [-halfSpan - bridge.rampLen / 2, halfSpan + bridge.rampLen / 2].forEach((rx, idx) => {
    const ramp = MeshBuilder.CreateBox(`${bridge.id}-ramp-${idx}`, {
      width: bridge.rampLen,
      height: 0.14,
      depth: roadwayWidth - 0.06,
    }, scene);
    ramp.position.set(rx, 0.07, 0);
    ramp.material = matAsphalt;
    ramp.parent = root;
    ramp.receiveShadows = true;
  });

  // --- 4. Vỉa hè đá người đi bộ 2 bên (Granite Pedestrian Sidewalks) ---
  [-halfWidth + sidewalkWidth / 2, halfWidth - sidewalkWidth / 2].forEach((sz, sideIdx) => {
    const sidewalk = MeshBuilder.CreateBox(`${bridge.id}-sidewalk-${sideIdx}`, {
      width: bridge.spanX + bridge.rampLen * 1.2,
      height: 0.32,
      depth: sidewalkWidth,
    }, scene);
    // Nâng cao hơn mặt lòng đường +0.10m
    sidewalk.position.set(0, bridge.deckY + 0.06, sz);
    sidewalk.material = matGranite;
    sidewalk.parent = root;
    sidewalk.receiveShadows = true;
    shadows?.addShadowCaster(sidewalk);

    // Gờ vát đá vỉa hè (Curb edge stone)
    const curbZ = sideIdx === 0 ? sz + sidewalkWidth / 2 - 0.08 : sz - sidewalkWidth / 2 + 0.08;
    const curb = MeshBuilder.CreateBox(`${bridge.id}-curb-${sideIdx}`, {
      width: bridge.spanX + bridge.rampLen * 1.2,
      height: 0.36,
      depth: 0.18,
    }, scene);
    curb.position.set(0, bridge.deckY + 0.08, curbZ);
    curb.material = matPiers;
    curb.parent = root;
  });

  // --- 5. Lan can đá Tân Cổ Điển (Neoclassical Balustrades) ---
  [-halfWidth + 0.15, halfWidth - 0.15].forEach((dz, sideIdx) => {
    // A. Bệ chân lan can (Plinth)
    const plinth = MeshBuilder.CreateBox(`${bridge.id}-plinth-${sideIdx}`, {
      width: bridge.spanX + 1.2,
      height: 0.28,
      depth: 0.36,
    }, scene);
    plinth.position.set(0, bridge.deckY + 0.30, dz);
    plinth.material = matGranite;
    plinth.parent = root;

    // B. Tay vịn đá bo tròn đỉnh (Coping Handrail)
    const handrail = MeshBuilder.CreateBox(`${bridge.id}-handrail-${sideIdx}`, {
      width: bridge.spanX + 1.2,
      height: 0.20,
      depth: 0.38,
    }, scene);
    handrail.position.set(0, bridge.deckY + 1.05, dz);
    handrail.material = matGranite;
    handrail.parent = root;
    shadows?.addShadowCaster(handrail);

    // C. Con tiện đá (Balusters) cách đều 1.7m
    for (let px = -halfSpan + 1.2; px <= halfSpan - 1.2; px += 1.7) {
      const baluster = MeshBuilder.CreateCylinder(`${bridge.id}-baluster-${sideIdx}-${px.toFixed(1)}`, {
        height: 0.62,
        diameterTop: 0.20,
        diameterBottom: 0.22,
        tessellation: 12,
      }, scene);
      baluster.position.set(px, bridge.deckY + 0.68, dz);
      baluster.material = matGranite;
      baluster.parent = root;
    }
  });

  // --- 6. Bốn Trụ Mốc Đại Cổ Điển (Grand Monument Pillars) tại 4 góc ---
  const cornerCoords = [
    [-halfSpan - 0.2, -halfWidth + 0.2],
    [halfSpan + 0.2, -halfWidth + 0.2],
    [-halfSpan - 0.2, halfWidth - 0.2],
    [halfSpan + 0.2, halfWidth - 0.2],
  ];

  cornerCoords.forEach(([px, pz], cIdx) => {
    const pillar = MeshBuilder.CreateBox(`${bridge.id}-pillar-${cIdx}`, {
      width: 0.95,
      height: 1.45,
      depth: 0.95,
    }, scene);
    pillar.position.set(px, bridge.deckY + 0.72, pz);
    pillar.material = matGranite;
    pillar.parent = root;
    shadows?.addShadowCaster(pillar);

    // Mũ chóp quả cầu cẩm thạch (Marble Sphere Cap)
    const sphereCap = MeshBuilder.CreateSphere(`${bridge.id}-sphere-${cIdx}`, {
      diameter: 0.48,
      segments: 16,
    }, scene);
    sphereCap.position.set(px, bridge.deckY + 1.55, pz);
    sphereCap.material = matGranite;
    sphereCap.parent = root;

    // Đèn đường tân cổ điển mạ đen vàng
    spawnModelSync(scene, MODEL_PATHS.town.lantern, {
      position: new Vector3(bridge.cx + px, bridge.deckY + 1.45, bridge.cz + pz),
      scaling: new Vector3(1.35, 1.35, 1.35),
      shadows,
      parent: root,
      name: `${bridge.id}-lamp-${cIdx}`,
    });
  });

  // --- 7. Bảng Tên Cầu Độc Lập Siêu Nét Đặt ở 2 Đầu Lối Vào Cầu ---
  // Đầu phía Tây (Lối vào theo chiều đi sang Đông): Đặt bên phải lề đường, quay góc hướng đón người đi tới
  createBridgeSignMonument(
    scene,
    bridge,
    root,
    new Vector3(-halfSpan - 2.8, bridge.deckY, -halfWidth - 1.4),
    -Math.PI / 2 + 0.25
  );

  // Đầu phía Đông (Lối vào theo chiều đi sang Tây): Đặt bên phải lề đường, quay góc hướng đón người đi tới
  createBridgeSignMonument(
    scene,
    bridge,
    root,
    new Vector3(halfSpan + 2.8, bridge.deckY, halfWidth + 1.4),
    Math.PI / 2 + 0.25
  );

  // --- 8. Hai Trụ Cầu Đá Hoa Cương & Mũi Xé Nước Dưới Lòng Sông (Heavy Piers & Cutwaters) ---
  // Đảm bảo toàn bộ trụ ngập chìm 100% dưới đáy cầu (Y <= -0.15m), KHÔNG BAO GIỜ trồi lên mặt đường
  [-halfSpan * 0.40, halfSpan * 0.40].forEach((px, pIdx) => {
    // Thân trụ chính dưới nước (đỉnh ở Y = -0.15m, dưới bản mặt cầu Y = 0.0m)
    const pierBody = MeshBuilder.CreateBox(`${bridge.id}-pier-body-${pIdx}`, {
      width: 2.4,
      height: 2.8,
      depth: bridge.widthZ + 1.2,
    }, scene);
    pierBody.position.set(px, -1.55, 0);
    pierBody.material = matPiers;
    pierBody.parent = root;

    // Mũi xé nước hình nêm ở 2 đầu trụ ngoài mép nước (đỉnh ở Y = -0.15m)
    [-halfWidth - 0.6, halfWidth + 0.6].forEach((cz, cutIdx) => {
      const cutwater = MeshBuilder.CreateCylinder(`${bridge.id}-cutwater-${pIdx}-${cutIdx}`, {
        height: 2.8,
        diameter: 2.4,
        tessellation: 16,
      }, scene);
      cutwater.position.set(px, -1.55, cz);
      cutwater.material = matPiers;
      cutwater.parent = root;
    });
  });

  return root;
}

/**
 * Xây dựng Cầu Vòm Gỗ Cảnh Quan Thơ Mộng (Romantic Timber Arch Bridge).
 * Độ uốn cong Parabol đỉnh cao + ván sồi đan khít + xà dầm vòm uốn lượn +
 * lan can gỗ tiện mộc mạc + đèn lồng đom đóm + bảng tên gỗ siêu nét độc lập.
 */
export function createPedestrianTimberBridge(scene, bridge, parent, shadows) {
  const root = new TransformNode(bridge.id, scene);
  root.position.set(bridge.cx, 0, bridge.cz);
  root.parent = parent;

  const halfSpan = bridge.spanX / 2;
  const halfWidth = bridge.widthZ / 2;
  const archHeight = bridge.archPeakY - bridge.deckY; // Độ vồng đỉnh cầu (khoảng 0.63m)

  // Vật liệu gỗ sồi cao cấp
  const matWoodDeck = new StandardMaterial(`${bridge.id}-mat-wood-deck`, scene);
  matWoodDeck.diffuseColor = Color3.FromHexString(bridge.woodColor || '#854d0e');
  matWoodDeck.ambientColor = matWoodDeck.diffuseColor.scale(0.4);
  matWoodDeck.specularColor = new Color3(0.06, 0.05, 0.03);

  const matGlulamBeam = new StandardMaterial(`${bridge.id}-mat-glulam`, scene);
  matGlulamBeam.diffuseColor = Color3.FromHexString('#5c2c0e');
  matGlulamBeam.ambientColor = matGlulamBeam.diffuseColor.scale(0.35);

  const matWoodRailing = new StandardMaterial(`${bridge.id}-mat-wood-rail`, scene);
  matWoodRailing.diffuseColor = Color3.FromHexString(bridge.railColor || '#a16207');
  matWoodRailing.ambientColor = matWoodRailing.diffuseColor.scale(0.4);

  // --- 1. Bản Mặt Cầu Ván Gỗ Uốn Cong Parabol (Staggered Arched Timber Deck) ---
  const plankSegments = 24;
  const segmentWidth = bridge.spanX / plankSegments;

  for (let i = 0; i < plankSegments; i++) {
    const xLeft = -halfSpan + i * segmentWidth;
    const xMid = xLeft + segmentWidth / 2;
    const t = (xMid + halfSpan) / bridge.spanX;
    // Parabol y = deckY + 4 * h * t * (1 - t)
    const yMid = bridge.deckY + 4 * archHeight * t * (1 - t);
    // Độ dốc tiếp tuyến dy/dx = 4 * h * (1 - 2*t) / spanX
    const slope = (4 * archHeight * (1 - 2 * t)) / bridge.spanX;
    const angleZ = -Math.atan(slope);

    const plank = MeshBuilder.CreateBox(`${bridge.id}-plank-${i}`, {
      width: segmentWidth * 0.94, // Có khe hở 6% giữa các thanh ván tạo độ mộc mạc và ngăn Z-fighting
      height: 0.16,
      depth: bridge.widthZ - 0.04,
    }, scene);
    plank.position.set(xMid, yMid, 0);
    plank.rotation.z = angleZ;
    plank.material = matWoodDeck;
    plank.parent = root;
    plank.receiveShadows = true;
    shadows?.addShadowCaster(plank);
  }

  // --- 2. Hai Dầm Gỗ Vòm Uốn Cong Lớn Đỡ Đáy Cầu (Curved Glulam Ribs) ---
  [-halfWidth + 0.25, halfWidth - 0.25].forEach((beamZ, bIdx) => {
    for (let i = 0; i < plankSegments; i++) {
      const xMid = -halfSpan + (i + 0.5) * segmentWidth;
      const t = (xMid + halfSpan) / bridge.spanX;
      const yMid = bridge.deckY + 4 * archHeight * t * (1 - t) - 0.18;
      const slope = (4 * archHeight * (1 - 2 * t)) / bridge.spanX;
      const angleZ = -Math.atan(slope);

      const rib = MeshBuilder.CreateBox(`${bridge.id}-rib-${bIdx}-${i}`, {
        width: segmentWidth * 1.02,
        height: 0.28,
        depth: 0.28,
      }, scene);
      rib.position.set(xMid, yMid, beamZ);
      rib.rotation.z = angleZ;
      rib.material = matGlulamBeam;
      rib.parent = root;
    }
  });

  // --- 3. Trụ Cọc Gỗ Cắm Sâu Xuống Nước & Mố Hai Bờ ---
  [-halfSpan * 0.35, halfSpan * 0.35].forEach((px, pIdx) => {
    [-halfWidth + 0.25, halfWidth - 0.25].forEach((pz, sideIdx) => {
      const pile = MeshBuilder.CreateCylinder(`${bridge.id}-pile-${pIdx}-${sideIdx}`, {
        height: 4.2,
        diameter: 0.38,
        tessellation: 12,
      }, scene);
      const t = (px + halfSpan) / bridge.spanX;
      const deckYAtPile = bridge.deckY + 4 * archHeight * t * (1 - t);
      pile.position.set(px, deckYAtPile - 2.1, pz);
      pile.material = matGlulamBeam;
      pile.parent = root;
    });

    // Xà giằng ngang bắt chéo giữa 2 cọc
    const crossBeam = MeshBuilder.CreateBox(`${bridge.id}-crossbeam-${pIdx}`, {
      width: 0.24,
      height: 0.24,
      depth: bridge.widthZ - 0.2,
    }, scene);
    crossBeam.position.set(px, 0.0, 0);
    crossBeam.material = matGlulamBeam;
    crossBeam.parent = root;
  });

  // --- 4. Lan Can Gỗ Uốn Cong & Dây Thừng (Arched Timber Railings) ---
  [-halfWidth + 0.15, halfWidth - 0.15].forEach((dz, sideIdx) => {
    // Các cột con tiện gỗ dọc theo độ dốc vòm
    const postStep = segmentWidth * 2; // Cách mỗi 2 đốt ván đặt 1 cột
    for (let px = -halfSpan + 0.8; px <= halfSpan - 0.8; px += postStep) {
      const t = (px + halfSpan) / bridge.spanX;
      const yBase = bridge.deckY + 4 * archHeight * t * (1 - t);

      const post = MeshBuilder.CreateCylinder(`${bridge.id}-post-${sideIdx}-${px.toFixed(1)}`, {
        height: 0.95,
        diameter: 0.16,
        tessellation: 10,
      }, scene);
      post.position.set(px, yBase + 0.48, dz);
      post.material = matWoodRailing;
      post.parent = root;
      shadows?.addShadowCaster(post);
    }

    // Tay vịn trên cùng cong theo nhịp cầu
    for (let i = 0; i < plankSegments; i++) {
      const xMid = -halfSpan + (i + 0.5) * segmentWidth;
      const t = (xMid + halfSpan) / bridge.spanX;
      const yMid = bridge.deckY + 4 * archHeight * t * (1 - t) + 0.92;
      const slope = (4 * archHeight * (1 - 2 * t)) / bridge.spanX;
      const angleZ = -Math.atan(slope);

      const topRail = MeshBuilder.CreateBox(`${bridge.id}-toprail-${sideIdx}-${i}`, {
        width: segmentWidth * 1.02,
        height: 0.10,
        depth: 0.16,
      }, scene);
      topRail.position.set(xMid, yMid, dz);
      topRail.rotation.z = angleZ;
      topRail.material = matWoodRailing;
      topRail.parent = root;
    }
  });

  // --- 5. Bốn Cột Trụ Lớn Ở 2 Đầu Mố Cầu Có Đèn Lồng ---
  const timberCorners = [
    [-halfSpan - 0.3, -halfWidth + 0.2],
    [halfSpan + 0.3, -halfWidth + 0.2],
    [-halfSpan - 0.3, halfWidth - 0.2],
    [halfSpan + 0.3, halfWidth - 0.2],
  ];

  timberCorners.forEach(([px, pz], cIdx) => {
    const postMaster = MeshBuilder.CreateBox(`${bridge.id}-master-${cIdx}`, {
      width: 0.45,
      height: 1.5,
      depth: 0.45,
    }, scene);
    postMaster.position.set(px, bridge.deckY + 0.65, pz);
    postMaster.material = matGlulamBeam;
    postMaster.parent = root;
    shadows?.addShadowCaster(postMaster);

    // Đèn lồng ấm áp phong cách Play Together
    spawnModelSync(scene, MODEL_PATHS.town.lantern, {
      position: new Vector3(bridge.cx + px, bridge.deckY + 1.25, bridge.cz + pz),
      scaling: new Vector3(1.25, 1.25, 1.25),
      shadows,
      parent: root,
      name: `${bridge.id}-ped-lamp-${cIdx}`,
    });
  });

  // --- 6. Bảng Tên Gỗ Độc Lập Ở Đầu Cầu ---
  createBridgeSignMonument(
    scene,
    bridge,
    root,
    new Vector3(-halfSpan - 2.2, bridge.deckY, -halfWidth - 1.1),
    -Math.PI / 2 + 0.22
  );
  createBridgeSignMonument(
    scene,
    bridge,
    root,
    new Vector3(halfSpan + 2.2, bridge.deckY, halfWidth + 1.1),
    Math.PI / 2 + 0.22
  );

  // Dốc tiếp đất bằng sỏi tự nhiên
  [-halfSpan - bridge.rampLen / 2, halfSpan + bridge.rampLen / 2].forEach((rx, idx) => {
    const ramp = MeshBuilder.CreateBox(`${bridge.id}-ramp-${idx}`, {
      width: bridge.rampLen,
      height: 0.12,
      depth: bridge.widthZ,
    }, scene);
    ramp.position.set(rx, bridge.deckY - 0.04, 0);
    ramp.material = matWoodDeck;
    ramp.parent = root;
  });

  return root;
}

/**
 * Xây dựng Cầu Đá Cổ / Suối Tự Nhiên (Rustic Stone Footbridge).
 * Đá phiến rêu phong + vòm cong thấp + lan can đá cuội mộc mạc + biển tên đá độc lập.
 */
export function createPedestrianStoneBridge(scene, bridge, parent, shadows) {
  const root = new TransformNode(bridge.id, scene);
  root.position.set(bridge.cx, 0, bridge.cz);
  root.parent = parent;

  const halfSpan = bridge.spanX / 2;
  const halfWidth = bridge.widthZ / 2;
  const archHeight = bridge.archPeakY - bridge.deckY;

  const matStone = new StandardMaterial(`${bridge.id}-mat-stone`, scene);
  matStone.diffuseColor = Color3.FromHexString(bridge.stoneColor || '#cbd5e1');
  matStone.ambientColor = matStone.diffuseColor.scale(0.4);
  matStone.specularColor = new Color3(0.06, 0.06, 0.06);

  const matRailing = new StandardMaterial(`${bridge.id}-mat-stone-rail`, scene);
  matRailing.diffuseColor = Color3.FromHexString(bridge.railColor || '#94a3b8');
  matRailing.ambientColor = matRailing.diffuseColor.scale(0.35);

  const segments = 16;
  const segW = bridge.spanX / segments;

  for (let i = 0; i < segments; i++) {
    const xMid = -halfSpan + (i + 0.5) * segW;
    const t = (xMid + halfSpan) / bridge.spanX;
    const yMid = bridge.deckY + 4 * archHeight * t * (1 - t);
    const slope = (4 * archHeight * (1 - 2 * t)) / bridge.spanX;
    const angleZ = -Math.atan(slope);

    const stoneBlock = MeshBuilder.CreateBox(`${bridge.id}-block-${i}`, {
      width: segW * 0.96,
      height: 0.22,
      depth: bridge.widthZ,
    }, scene);
    stoneBlock.position.set(xMid, yMid, 0);
    stoneBlock.rotation.z = angleZ;
    stoneBlock.material = matStone;
    stoneBlock.parent = root;
    stoneBlock.receiveShadows = true;
    shadows?.addShadowCaster(stoneBlock);
  }

  // Lan can đá cuội xếp lớp hai bên
  [-halfWidth + 0.15, halfWidth - 0.15].forEach((dz, sideIdx) => {
    for (let i = 0; i < segments; i++) {
      const xMid = -halfSpan + (i + 0.5) * segW;
      const t = (xMid + halfSpan) / bridge.spanX;
      const yMid = bridge.deckY + 4 * archHeight * t * (1 - t) + 0.40;
      const slope = (4 * archHeight * (1 - 2 * t)) / bridge.spanX;
      const angleZ = -Math.atan(slope);

      const railStone = MeshBuilder.CreateBox(`${bridge.id}-rail-${sideIdx}-${i}`, {
        width: segW * 1.02,
        height: 0.55,
        depth: 0.32,
      }, scene);
      railStone.position.set(xMid, yMid, dz);
      railStone.rotation.z = angleZ;
      railStone.material = matRailing;
      railStone.parent = root;
      shadows?.addShadowCaster(railStone);
    }
  });

  // Bảng tên đá độc lập đầu cầu
  createBridgeSignMonument(
    scene,
    bridge,
    root,
    new Vector3(-halfSpan - 1.8, bridge.deckY, -halfWidth - 0.9),
    -Math.PI / 2 + 0.22
  );

  return root;
}

/**
 * Xây dựng cây cầu theo đúng kiểu dáng và thông số metadata trong bridgeConfig.
 */
export function buildBridge(scene, bridge, parent, shadows) {
  switch (bridge.type) {
    case BRIDGE_TYPES.HIGHWAY:
      return createHighwayBridge(scene, bridge, parent, shadows);
    case BRIDGE_TYPES.PEDESTRIAN_TIMBER:
      return createPedestrianTimberBridge(scene, bridge, parent, shadows);
    case BRIDGE_TYPES.PEDESTRIAN_STONE:
      return createPedestrianStoneBridge(scene, bridge, parent, shadows);
    default:
      return createHighwayBridge(scene, bridge, parent, shadows);
  }
}
