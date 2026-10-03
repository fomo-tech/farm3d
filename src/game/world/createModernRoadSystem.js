import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { WORLD_PALETTE } from './worldDesignSystem.js';

function freezeSubtree(node) {
  if (!node) return;
  if (typeof node.freezeWorldMatrix === 'function') node.freezeWorldMatrix();
  if (node.doNotSyncBoundingInfo !== undefined) node.doNotSyncBoundingInfo = true;
  if (node.isPickable !== undefined) node.isPickable = false;
  const children = node.getChildren ? node.getChildren() : [];
  for (let i = 0; i < children.length; i++) {
    freezeSubtree(children[i]);
  }
}

function getOrCreateMat(scene, name, hex, emissiveHex = null, specular = 0.15) {
  let m = scene.getMaterialByName(name);
  if (!m) {
    m = new StandardMaterial(name, scene);
    m.diffuseColor = Color3.FromHexString(hex);
    m.ambientColor = m.diffuseColor.scale(0.45);
    m.specularColor = new Color3(specular, specular, specular);
    if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  }
  return m;
}

/**
 * HỆ THỐNG ĐƯỜNG ĐẠI LỘ ĐÁ CUỘI CỔ ĐIỂN PHONG CÁCH STUDIO GHIBLI
 * Lấy cảm hứng từ những con phố lát đá ngập nắng thị trấn Koriko & Colmar:
 * - Mặt đường lát đá cuội sa thạch màu đất nung ấm (#8e8375)
 * - Vỉa hè lát đá phiến vàng mật ong & gạch cổ (#c2ab95) viền rêu xanh
 * - Gờ đá tảng tự nhiên đẽo gọt mộc mạc (#7d7367)
 * - Tim đường là dải hoa văn đá sa thạch vàng nhẹ (#d4b28c) thay vì vạch sơn nhựa đường hiện đại
 * - Vạch sang đường là các phiến đá cẩm thạch ngà đẽo phẳng (#ded6c8) kiểu châu Âu
 * - Đèn đường cột sắt rèn uốn lượn cổ điển (Victorian Wrought Iron Lanterns) ánh lửa vàng hổ phách ấm áp
 */
export function createModernBoulevard(scene, options = {}) {
  const {
    id = 'boulevard',
    x = 0,
    z = 0,
    length = 120,
    width = 8.5, // Chiều rộng lòng đường
    sidewalkWidth = 2.4, // Chiều rộng mỗi bên vỉa hè
    isNorthSouth = true,
    shadows = null,
    hasStreetLamps = true,
    lampInterval = 32,
    hasCenterDashes = true,
    hasEdgeLines = true,
    hasStopLines = true,
    intersections = [],
    hasSidewalk = true,
    sidewalkStartOffset = 0,
    sidewalkEndOffset = 0,
  } = options;

  const root = new TransformNode(`ghibli-road-${id}`, scene);
  root.position.set(x, 0, z);
  if (!isNorthSouth) {
    root.rotation.y = Math.PI / 2;
  }

  const mats = {
    // Mặt đường lát đá cuội sa thạch ấm áp
    roadCobble: getOrCreateMat(scene, 'ghibli-road-cobble', WORLD_PALETTE.roadStone, null, 0.1),
    // Gờ đá tự nhiên đẽo mộc mạc
    curbStone: getOrCreateMat(scene, 'ghibli-road-curb', '#d4b8a8', null, 0.2),
    // Vỉa hè lát đá phiến vàng mật ong
    sidewalkStone: getOrCreateMat(scene, 'ghibli-road-sidewalk', WORLD_PALETTE.sidewalkCream, null, 0.18),
    // Tim đường hoa văn đá sa thạch màu cát ấm
    centerInlay: getOrCreateMat(scene, 'ghibli-road-inlay', '#f6ddbd', null, 0.25),
    // Viền mép đá sa thạch sáng
    edgeInlay: getOrCreateMat(scene, 'ghibli-road-edge-stone', '#eed5be', null, 0.2),
    // Cột đèn sắt rèn châu Âu cổ điển
    wroughtIron: getOrCreateMat(scene, 'ghibli-lamp-iron', '#2b2621', null, 0.35),
    // Đèn khí ga vàng hổ phách ấm áp
    gaslightGlow: getOrCreateMat(scene, 'ghibli-lamp-glow', '#fef08a', '#f59e0b', 0.9),
  };
  mats.roadCobble.zOffset = -1;
  mats.curbStone.zOffset = -1;
  mats.sidewalkStone.zOffset = -2;
  mats.centerInlay.zOffset = -4;
  mats.edgeInlay.zOffset = -3;

  // 1. Lòng đường đá cuội xe chạy (mặt trên ở y = 0.08m)
  const roadMesh = MeshBuilder.CreateBox(`road-bed-${id}`, {
    width: width,
    height: 0.08,
    depth: length,
  }, scene);
  roadMesh.position.y = 0.04;
  roadMesh.material = mats.roadCobble;
  roadMesh.receiveShadows = true;
  roadMesh.parent = root;

  // Chuẩn hóa danh sách các khoảng mở giao lộ (openings) trong hệ tọa độ Local Z
  const halfL = length / 2;
  const openings = [];

  intersections.forEach(item => {
    const worldPos = typeof item === 'object' ? item.pos : item;
    const openWidth = (typeof item === 'object' && item.width) ? item.width : 7.5;
    const localPos = isNorthSouth ? (worldPos - z) : (worldPos - x);
    const startZ = localPos - openWidth / 2;
    const endZ = localPos + openWidth / 2;

    if (endZ > -halfL && startZ < halfL) {
      openings.push({
        center: localPos,
        start: Math.max(-halfL, startZ),
        end: Math.min(halfL, endZ),
        width: openWidth,
      });
    }
  });

  openings.sort((a, b) => a.start - b.start);

  const walkStartBoundary = -halfL + sidewalkStartOffset;
  const walkEndBoundary = halfL - sidewalkEndOffset;

  const segments = [];
  let curZ = walkStartBoundary;

  for (const op of openings) {
    if (op.start > curZ + 0.4) {
      segments.push({ start: curZ, end: Math.min(walkEndBoundary, op.start) });
    }
    curZ = Math.max(curZ, op.end);
  }
  if (curZ < walkEndBoundary - 0.4) {
    segments.push({ start: curZ, end: walkEndBoundary });
  }

  if (openings.length === 0 && walkEndBoundary > walkStartBoundary + 0.4) {
    segments.push({ start: walkStartBoundary, end: walkEndBoundary });
  }

  // 2. Tim đường phân làn: Dải đá sa thạch hoa văn cổ điển (Inlaid Sandstone Ribbons)
  if (hasCenterDashes && length >= 8) {
    const dashLength = 2.4;
    const dashGap = 3.6;
    const stride = dashLength + dashGap;
    const count = Math.floor((length - 2) / stride);
    const startZ = -((count - 1) * stride) / 2;

    for (let i = 0; i < count; i++) {
      const dz = startZ + i * stride;
      const inIntersection = openings.some(op => dz >= op.start - 0.8 && dz <= op.end + 0.8);
      if (inIntersection) continue;

      const dash = MeshBuilder.CreateBox(`dash-${id}-${i}`, {
        width: 0.28,
        height: 0.016,
        depth: dashLength,
      }, scene);
      dash.position.set(0, 0.089, dz);
      dash.material = mats.centerInlay;
      dash.parent = root;
    }
  }

  // 3. Hai đường viền đá sa thạch chạy dọc mép lề đường
  if (hasEdgeLines && segments.length > 0) {
    [-1, 1].forEach(side => {
      const edgeX = side * (width / 2 - 0.35);

      segments.forEach((seg, sidx) => {
        const segLen = seg.end - seg.start;
        if (segLen <= 0.4) return;
        const segMid = (seg.start + seg.end) / 2;

        const edge = MeshBuilder.CreateBox(`edgestone-${id}-${side}-${sidx}`, {
          width: 0.22,
          height: 0.016,
          depth: segLen,
        }, scene);
        edge.position.set(edgeX, 0.089, segMid);
        edge.material = mats.edgeInlay;
        edge.parent = root;
      });
    });
  }

  // 4. Vạch dừng xe trước giao lộ bằng đá sa thạch đẽo phẳng
  if (hasStopLines && openings.length > 0) {
    openings.forEach((op, opIdx) => {
      [op.start, op.end].forEach((stopZ, stIdx) => {
        const stopLine = MeshBuilder.CreateBox(`stopline-${id}-${opIdx}-${stIdx}`, {
          width: width - 0.8,
          height: 0.016,
          depth: 0.42,
        }, scene);
        const offsetZ = stIdx === 0 ? -3.0 : 0.25;
        stopLine.position.set(0, 0.089, stopZ + offsetZ);
        stopLine.material = mats.edgeInlay;
        stopLine.parent = root;
      });
    });
  }

  // 5. Vỉa hè đá phiến vàng mật ong & Gờ đá tự nhiên ở CẢ 2 BÊN
  if (hasSidewalk) {
    [-1, 1].forEach(side => {
      const curbX = side * (width / 2 + 0.18);
      const walkX = side * (width / 2 + 0.36 + sidewalkWidth / 2);

      segments.forEach((seg, sidx) => {
        const segLen = seg.end - seg.start;
        if (segLen <= 0.3) return;
        const segMid = (seg.start + seg.end) / 2;

        // Gờ đá bo viền tự nhiên
        const curb = MeshBuilder.CreateBox(`curb-${id}-${side}-${sidx}`, {
          width: 0.36,
          height: 0.18,
          depth: segLen,
        }, scene);
        curb.position.set(curbX, 0.09, segMid);
        curb.material = mats.curbStone;
        curb.parent = root;

        // Vỉa hè lát đá phiến ấm áp
        const sidewalk = MeshBuilder.CreateBox(`sidewalk-${id}-${side}-${sidx}`, {
          width: sidewalkWidth,
          height: 0.15,
          depth: segLen,
        }, scene);
        sidewalk.position.set(walkX, 0.075, segMid);
        sidewalk.material = mats.sidewalkStone;
        sidewalk.receiveShadows = true;
        sidewalk.parent = root;

        // Gờ chân mép ngoài tiếp giáp đồng cỏ
        const outerTrim = MeshBuilder.CreateBox(`sidewalk-outer-${id}-${side}-${sidx}`, {
          width: 0.18,
          height: 0.16,
          depth: segLen,
        }, scene);
        outerTrim.position.set(side * (width / 2 + 0.36 + sidewalkWidth + 0.09), 0.08, segMid);
        outerTrim.material = mats.curbStone;
        outerTrim.parent = root;
      });
    });
  }

  // 6. Cột đèn sắt rèn phong cách châu Âu cổ điển (Victorian Gas Streetlamps)
  if (hasStreetLamps && length >= 16) {
    const numLamps = Math.max(1, Math.floor(length / lampInterval));
    const actualInterval = length / (numLamps + 1);

    for (let i = 1; i <= numLamps; i++) {
      const pz = -halfL + i * actualInterval;
      const nearIntersection = openings.some(op => pz >= op.start - 2.5 && pz <= op.end + 2.5);
      if (nearIntersection) continue;

      [-1, 1].forEach(side => {
        const lx = side * (width / 2 + sidewalkWidth * 0.7);

        // Bệ chân cột đèn bát giác bằng gang đúc
        const base = MeshBuilder.CreateCylinder(`lamp-base-${id}-${i}-${side}`, {
          diameter: 0.55,
          height: 0.65,
          tessellation: 8,
        }, scene);
        base.position.set(lx, 0.42, pz);
        base.material = mats.wroughtIron;
        base.parent = root;

        // Thân cột sắt tròn vuốt thon
        const pole = MeshBuilder.CreateCylinder(`lamp-pole-${id}-${i}-${side}`, {
          diameterTop: 0.14,
          diameterBottom: 0.22,
          height: 4.8,
          tessellation: 12,
        }, scene);
        pole.position.set(lx, 2.8, pz);
        pole.material = mats.wroughtIron;
        pole.parent = root;
        shadows?.addShadowCaster(pole);

        // Tay uốn sắt rèn cong điệu đà hướng về lòng đường
        const arm = MeshBuilder.CreateBox(`lamp-arm-${id}-${i}-${side}`, {
          width: 1.1,
          height: 0.12,
          depth: 0.12,
        }, scene);
        arm.position.set(lx - side * 0.45, 5.0, pz);
        arm.rotation.z = side * 0.22;
        arm.material = mats.wroughtIron;
        arm.parent = root;

        // Đèn lồng sắt rèn lục giác cổ kính
        const lanternCage = MeshBuilder.CreateCylinder(`lamp-cage-${id}-${i}-${side}`, {
          height: 0.85,
          diameterTop: 0.48,
          diameterBottom: 0.32,
          tessellation: 6,
        }, scene);
        lanternCage.position.set(lx - side * 0.9, 4.8, pz);
        lanternCage.material = mats.wroughtIron;
        lanternCage.parent = root;

        // Ngọn lửa khí ga vàng ấm rực rỡ bên trong lồng kính
        const lanternFlame = MeshBuilder.CreateSphere(`lamp-flame-${id}-${i}-${side}`, {
          diameter: 0.32,
          segments: 8,
        }, scene);
        lanternFlame.position.set(lx - side * 0.9, 4.8, pz);
        lanternFlame.material = mats.gaslightGlow;
        lanternFlame.parent = root;
      });
    }
  }

  freezeSubtree(root);
  return root;
}

/**
 * VẠCH SANG ĐƯỜNG ĐÁ CẨM THẠCH NGÀ ĐẼO PHẲNG (GHIBLI IVORY STONE CROSSWALK)
 * Thay thế vạch sơn nhựa đường màu trắng bằng các phiến đá phẳng đặt so le mộc mạc
 */
export function createZebraCrosswalk(scene, options = {}) {
  const {
    id = 'crosswalk',
    x = 0,
    z = 0,
    width = 8.5,
    depth = 3.2,
    isNorthSouth = true,
  } = options;

  const root = new TransformNode(`ghibli-crosswalk-${id}`, scene);
  root.position.set(x, 0.091, z);
  if (!isNorthSouth) {
    root.rotation.y = Math.PI / 2;
  }

  const matStripe = getOrCreateMat(scene, 'ghibli-crosswalk-stone', '#ded6c8', '#faf5ee', 0.25);
  matStripe.zOffset = -4;

  const stripeWidth = 0.58;
  const gap = 0.42;
  const numStripes = Math.floor((width - 0.4) / (stripeWidth + gap));
  const startX = -((numStripes - 1) * (stripeWidth + gap)) / 2;

  for (let i = 0; i < numStripes; i++) {
    const sx = startX + i * (stripeWidth + gap);
    const stripe = MeshBuilder.CreateBox(`cross-stone-${id}-${i}`, {
      width: stripeWidth,
      height: 0.012,
      depth: depth,
    }, scene);
    stripe.position.set(sx, 0, 0);
    stripe.material = matStripe;
    stripe.parent = root;
  }

  freezeSubtree(root);
  return root;
}

/**
 * TUYẾN ĐƯỜNG NÔNG THÔN & LIÊN LÀNG ĐỒNG BỘ PHONG CÁCH GHIBLI X PLAY TOGETHER
 * Đồng bộ 100% vật liệu và ngôn ngữ thiết kế với Đại lộ Trung tâm:
 * - Lòng đường đá cuội sa thạch ấm áp (roadCobble) dày 0.08m nổi khối 3D
 * - Gờ đá sa thạch tự nhiên bo viền 2 bên lề cỏ (curbStone) dày 0.12m
 * - Vạch tim đường đá sa thạch vàng nhẹ (centerInlay) phân làn
 * - Đèn lồng sắt rèn Victorian chiếu sáng ấm cúng
 */
export function createCountryRoad(scene, options = {}) {
  const {
    id = 'country-road',
    x = 0,
    z = 0,
    length = 100,
    width = 5.5,
    isNorthSouth = true,
    shadows = null,
    hasCenterDashes = true,
    hasEdgeCurbs = true,
    curbWidth = 0.28,
    hasSidewalk = false,
    sidewalkWidth = 1.6,
    hasStreetLamps = false,
    lampInterval = 48,
    intersections = [],
  } = options;

  const root = new TransformNode(`ghibli-country-road-${id}`, scene);
  root.position.set(x, 0, z);
  if (!isNorthSouth) {
    root.rotation.y = Math.PI / 2;
  }

  const mats = {
    roadCobble: getOrCreateMat(scene, 'ghibli-road-cobble', WORLD_PALETTE.roadStone, null, 0.1),
    curbStone: getOrCreateMat(scene, 'ghibli-road-curb', '#d4b8a8', null, 0.2),
    sidewalkStone: getOrCreateMat(scene, 'ghibli-road-sidewalk', WORLD_PALETTE.sidewalkCream, null, 0.18),
    centerInlay: getOrCreateMat(scene, 'ghibli-road-inlay', '#f6ddbd', null, 0.25),
    wroughtIron: getOrCreateMat(scene, 'ghibli-lamp-iron', '#2b2621', null, 0.35),
    gaslightGlow: getOrCreateMat(scene, 'ghibli-lamp-glow', '#fef08a', '#f59e0b', 0.9),
  };
  mats.roadCobble.zOffset = -1;
  mats.curbStone.zOffset = -1;
  mats.sidewalkStone.zOffset = -2;
  mats.centerInlay.zOffset = -4;

  // 1. Mặt đường đá cuội sa thạch nổi khối 3D (dày 8cm, đỉnh ở y = 0.08m)
  const roadMesh = MeshBuilder.CreateBox(`road-bed-${id}`, {
    width,
    height: 0.08,
    depth: length,
  }, scene);
  roadMesh.position.y = 0.04;
  roadMesh.material = mats.roadCobble;
  roadMesh.receiveShadows = true;
  roadMesh.parent = root;

  // Tính toán các khoảng mở giao lộ (openings) để ngắt gờ đá & vỉa hè
  const halfL = length / 2;
  const openings = [];

  intersections.forEach(item => {
    const worldPos = typeof item === 'object' ? item.pos : item;
    const openWidth = (typeof item === 'object' && item.width) ? item.width : (width + 1.2);
    const localPos = isNorthSouth ? (worldPos - z) : (worldPos - x);
    const startZ = localPos - openWidth / 2;
    const endZ = localPos + openWidth / 2;

    if (endZ > -halfL && startZ < halfL) {
      openings.push({
        center: localPos,
        start: Math.max(-halfL, startZ),
        end: Math.min(halfL, endZ),
        width: openWidth,
      });
    }
  });

  openings.sort((a, b) => a.start - b.start);

  const segments = [];
  let curZ = -halfL;
  for (const op of openings) {
    if (op.start > curZ + 0.3) {
      segments.push({ start: curZ, end: Math.min(halfL, op.start) });
    }
    curZ = Math.max(curZ, op.end);
  }
  if (curZ < halfL - 0.3) {
    segments.push({ start: curZ, end: halfL });
  }
  if (openings.length === 0) {
    segments.push({ start: -halfL, end: halfL });
  }

  // 2. Gờ đá tự nhiên bo viền 2 bên tiếp giáp thảm cỏ (được ngắt tại ngã tư)
  if (hasEdgeCurbs) {
    [-1, 1].forEach(side => {
      segments.forEach((seg, sidx) => {
        const segLen = seg.end - seg.start;
        if (segLen <= 0.3) return;
        const segMid = (seg.start + seg.end) / 2;
        const curb = MeshBuilder.CreateBox(`curb-${id}-${side}-${sidx}`, {
          width: curbWidth,
          height: 0.12,
          depth: segLen,
        }, scene);
        curb.position.set(side * (width / 2 + curbWidth / 2), 0.06, segMid);
        curb.material = mats.curbStone;
        curb.receiveShadows = true;
        curb.parent = root;
      });
    });
  }

  // 3. Vỉa hè đi bộ đá phiến mật ong (tùy chọn cho trục chính làng)
  if (hasSidewalk) {
    [-1, 1].forEach(side => {
      segments.forEach((seg, sidx) => {
        const segLen = seg.end - seg.start;
        if (segLen <= 0.3) return;
        const segMid = (seg.start + seg.end) / 2;
        const walkX = side * (width / 2 + curbWidth + sidewalkWidth / 2);
        const sidewalk = MeshBuilder.CreateBox(`sidewalk-${id}-${side}-${sidx}`, {
          width: sidewalkWidth,
          height: 0.11,
          depth: segLen,
        }, scene);
        sidewalk.position.set(walkX, 0.055, segMid);
        sidewalk.material = mats.sidewalkStone;
        sidewalk.receiveShadows = true;
        sidewalk.parent = root;
      });
    });
  }

  // 4. Tim đường phân làn đá sa thạch
  if (hasCenterDashes && length >= 12) {
    const dashLength = 2.4;
    const dashGap = 4.2;
    const stride = dashLength + dashGap;
    const count = Math.floor((length - 2) / stride);
    const startZ = -((count - 1) * stride) / 2;

    for (let i = 0; i < count; i++) {
      const dz = startZ + i * stride;
      const inIntersection = openings.some(op => dz >= op.start - 0.5 && dz <= op.end + 0.5);
      if (inIntersection) continue;

      const dash = MeshBuilder.CreateBox(`dash-${id}-${i}`, {
        width: 0.26,
        height: 0.016,
        depth: dashLength,
      }, scene);
      dash.position.set(0, 0.089, dz);
      dash.material = mats.centerInlay;
      dash.parent = root;
    }
  }

  // 5. Cột đèn lồng sắt rèn Victorian
  if (hasStreetLamps && length >= 32) {
    const numLamps = Math.max(1, Math.floor(length / lampInterval));
    const actualInterval = length / (numLamps + 1);

    for (let i = 1; i <= numLamps; i++) {
      const pz = -length / 2 + i * actualInterval;
      const nearIntersection = openings.some(op => pz >= op.start - 2.5 && pz <= op.end + 2.5);
      if (nearIntersection) continue;

      const side = (i % 2 === 0) ? 1 : -1; // So le 2 bên đường
      const lx = side * (width / 2 + curbWidth + (hasSidewalk ? sidewalkWidth : 0) + 0.35);

      const base = MeshBuilder.CreateCylinder(`c-lamp-base-${id}-${i}`, {
        diameter: 0.42,
        height: 0.45,
        tessellation: 8,
      }, scene);
      base.position.set(lx, 0.28, pz);
      base.material = mats.wroughtIron;
      base.parent = root;

      const pole = MeshBuilder.CreateCylinder(`c-lamp-pole-${id}-${i}`, {
        diameterTop: 0.12,
        diameterBottom: 0.18,
        height: 3.8,
        tessellation: 10,
      }, scene);
      pole.position.set(lx, 2.1, pz);
      pole.material = mats.wroughtIron;
      pole.parent = root;
      shadows?.addShadowCaster(pole);

      const cage = MeshBuilder.CreateCylinder(`c-lamp-cage-${id}-${i}`, {
        diameterTop: 0.38,
        diameterBottom: 0.26,
        height: 0.65,
        tessellation: 6,
      }, scene);
      cage.position.set(lx, 3.9, pz);
      cage.material = mats.wroughtIron;
      cage.parent = root;

      const flame = MeshBuilder.CreateSphere(`c-lamp-flame-${id}-${i}`, {
        diameter: 0.24,
        segments: 6,
      }, scene);
      flame.position.set(lx, 3.9, pz);
      flame.material = mats.gaslightGlow;
      flame.parent = root;
    }
  }

  freezeSubtree(root);
  return root;
}

/**
 * BÙNG BINH QUAY ĐẦU XE CUỐI ĐƯỜNG (CUL-DE-SAC TURNING CIRCLE)
 * Bố trí tại điểm cuối của 12 trục đường chính làng:
 * - Đĩa đá cuội tròn sa thạch (diameter: 14m)
 * - Vòng gờ đá tự nhiên bo viền quanh bùng binh
 * - Bồn hoa trung tâm bo tròn có hoa dại hoặc trụ đèn hoa cương
 */
export function createCulDeSac(scene, options = {}) {
  const {
    id = 'cul-de-sac',
    x = 0,
    z = 0,
    radius = 6.5,
    shadows = null,
  } = options;

  const root = new TransformNode(`cul-de-sac-${id}`, scene);
  root.position.set(x, 0, z);

  const mats = {
    roadCobble: getOrCreateMat(scene, 'ghibli-road-cobble', WORLD_PALETTE.roadStone, null, 0.1),
    curbStone: getOrCreateMat(scene, 'ghibli-road-curb', '#d4b8a8', null, 0.2),
    centerGrass: getOrCreateMat(scene, 'ghibli-cul-grass', '#86efac', null, 0.05),
    flowerWhite: getOrCreateMat(scene, 'ghibli-flower-white', '#ffffff', '#fef08a', 0.5),
    flowerPink: getOrCreateMat(scene, 'ghibli-flower-pink', '#f472b6', '#fb7185', 0.5),
    lanternGold: getOrCreateMat(scene, 'ghibli-lamp-glow', '#fef08a', '#f59e0b', 0.9),
    wroughtIron: getOrCreateMat(scene, 'ghibli-lamp-iron', '#2b2621', null, 0.35),
  };
  mats.roadCobble.zOffset = -1;
  mats.curbStone.zOffset = -1;
  mats.centerGrass.zOffset = -1;

  // 1. Mặt đĩa đá sa thạch cho xe quay đầu (dày 0.08m, y = 0.04m)
  const plate = MeshBuilder.CreateCylinder(`plate-${id}`, {
    diameter: radius * 2,
    height: 0.08,
    tessellation: 32,
  }, scene);
  plate.position.y = 0.04;
  plate.material = mats.roadCobble;
  plate.receiveShadows = true;
  plate.parent = root;

  // 2. Vành gờ đá tự nhiên bo viền ngoài
  const outerRim = MeshBuilder.CreateTorus(`rim-${id}`, {
    diameter: radius * 2,
    thickness: 0.35,
    tessellation: 32,
  }, scene);
  outerRim.position.y = 0.07;
  outerRim.material = mats.curbStone;
  outerRim.parent = root;

  // 3. Đảo hoa trung tâm (Central Roundabout Island - diameter 3.8m)
  const island = MeshBuilder.CreateCylinder(`island-${id}`, {
    diameter: 3.8,
    height: 0.22,
    tessellation: 24,
  }, scene);
  island.position.y = 0.11;
  island.material = mats.centerGrass;
  island.parent = root;

  const islandRim = MeshBuilder.CreateTorus(`island-rim-${id}`, {
    diameter: 3.8,
    thickness: 0.32,
    tessellation: 24,
  }, scene);
  islandRim.position.y = 0.18;
  islandRim.material = mats.curbStone;
  islandRim.parent = root;

  // 4. Cột đèn trung tâm
  const pole = MeshBuilder.CreateCylinder(`island-lamp-${id}`, {
    diameterTop: 0.15,
    diameterBottom: 0.26,
    height: 4.2,
    tessellation: 12,
  }, scene);
  pole.position.y = 2.2;
  pole.material = mats.wroughtIron;
  pole.parent = root;
  shadows?.addShadowCaster(pole);

  // Chùm đèn tỏa sáng ấm áp
  const cage = MeshBuilder.CreateSphere(`island-lantern-${id}`, {
    diameter: 0.58,
    segments: 8,
  }, scene);
  cage.position.y = 4.2;
  cage.material = mats.lanternGold;
  cage.parent = root;

  // Khóm hoa cúc dại điểm xuyết quanh đảo
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const fl = MeshBuilder.CreateSphere(`island-flower-${id}-${i}`, { diameter: 0.28, segments: 6 }, scene);
    fl.position.set(Math.cos(angle) * 1.3, 0.28, Math.sin(angle) * 1.3);
    fl.material = (i % 2 === 0) ? mats.flowerWhite : mats.flowerPink;
    fl.parent = root;
  }

  freezeSubtree(root);
  return root;
}

