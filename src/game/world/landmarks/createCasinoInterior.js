import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';

function makeMat(scene, name, hex, emissiveHex = null, specular = 0.15, specularPower = 32) {
  let m = scene.getMaterialByName(name);
  if (!m) {
    m = new StandardMaterial(name, scene);
    m.diffuseColor = Color3.FromHexString(hex);
    m.ambientColor = m.diffuseColor.scale(0.35);
    m.specularColor = new Color3(specular, specular, specular);
    m.specularPower = specularPower;
    if (emissiveHex) {
      m.emissiveColor = Color3.FromHexString(emissiveHex);
    } else {
      m.emissiveColor = Color3.Black();
    }
  }
  return m;
}

/**
 * Tạo Sảnh Nội Thất 3D Hoàng Gia cho Hội Quán Trò Chơi & Casino
 * Tọa độ trung tâm: interior: { x: 210, y: 32, z: -215 }
 * Bao gồm:
 * 1. Không gian phòng hộp sang trọng: sàn gỗ bóng viền đá, tường navy/teal viền vàng kim, đèn chùm.
 * 2. Bàn 3D Tài Xỉu Sic Bo (Bán nguyệt, nỉ đỏ, bát đĩa 3D, xúc xắc ruby).
 * 3. Bàn 3D Bầu Cua Tôm Cá (Nỉ xanh ngọc, 6 ô linh vật, đĩa lắc).
 * 4. Bàn 3D Bài Cào 3 Lá (Nỉ xanh lục, phỉnh sứ, bộ bài hoàng gia).
 * 5. Bàn 3D Tiến Lên Miền Nam (Bàn tròn gỗ sẫm, 4 ghế da cao cấp).
 * 6. Quầy tiếp tân NPC Chú Lộc và Cửa thoát hiểm ra quảng trường.
 */
export function* createCasinoLoungeInterior(scene, config, shadows) {
  const { x, y, z } = config.interior;
  yield;

  // 1. Vật liệu nội thất sòng bài hoàng gia
  const matFloorWood = makeMat(scene, 'casino-int-floor-wood', '#2d1810', null, 0.25, 48);
  matFloorWood.backFaceCulling = false;
  const matFloorBorder = makeMat(scene, 'casino-int-floor-marble', '#d4af37', null, 0.45, 64);
  const matWall = makeMat(scene, 'casino-int-wall-teal', '#0f292f', null, 0.1, 24);
  matWall.backFaceCulling = false;
  const matGoldTrim = makeMat(scene, 'casino-int-gold-trim', '#f59e0b', '#d97706', 0.6, 96);
  const matRedFelt = makeMat(scene, 'casino-int-felt-red', '#991b1b', null, 0.08, 16);
  const matGreenFelt = makeMat(scene, 'casino-int-felt-green', '#065f46', null, 0.08, 16);
  const matBlueFelt = makeMat(scene, 'casino-int-felt-blue', '#1e3a8a', null, 0.08, 16);
  const matDarkOak = makeMat(scene, 'casino-int-dark-oak', '#1c120c', null, 0.2, 32);
  const matLeather = makeMat(scene, 'casino-int-leather', '#3b1d11', null, 0.15, 24);
  const matBulb = makeMat(scene, 'casino-int-bulb', '#fffbeb', '#fef08a', 0.8, 64);
  const matPlateGold = makeMat(scene, 'casino-int-plate-gold', '#fbbf24', '#f59e0b', 0.7, 80);
  yield;

  // 2. Vỏ hộp cản quang tuyệt đối 90m x 42m x 90m
  const matOuter = makeMat(scene, 'casino-outer-mat', '#080d14', '#080d14', 0, 0);
  matOuter.backFaceCulling = false;
  matOuter.disableLighting = true;

  const outerBox = MeshBuilder.CreateBox('casino-int-outer-box', { width: 90, height: 42, depth: 90 }, scene);
  outerBox.position.set(x, y + 10, z - 4);
  outerBox.material = matOuter;
  outerBox.isPickable = false;
  yield;

  // Sàn nhà và trần nhà
  const floor = MeshBuilder.CreateBox('casino-int-floor', { width: 28.0, height: 0.6, depth: 32.0 }, scene);
  floor.position.set(x, y - 0.3, z - 3);
  floor.material = matFloorWood;
  floor.receiveShadows = true;
  yield;

  const ceiling = MeshBuilder.CreateBox('casino-int-ceiling', { width: 28.0, height: 0.6, depth: 32.0 }, scene);
  ceiling.position.set(x, y + 7.6, z - 3);
  ceiling.material = matWall;
  yield;

  // Tường bao quanh phòng (Back, Left, Right, Front)
  const wallBack = MeshBuilder.CreateBox('casino-int-wall-back', { width: 28.0, height: 7.6, depth: 0.8 }, scene);
  wallBack.position.set(x, y + 3.8, z + 12.6);
  wallBack.material = matWall;
  yield;

  const wallLeft = MeshBuilder.CreateBox('casino-int-wall-left', { width: 0.8, height: 7.6, depth: 32.0 }, scene);
  wallLeft.position.set(x - 13.6, y + 3.8, z - 3);
  wallLeft.material = matWall;
  yield;

  const wallRight = MeshBuilder.CreateBox('casino-int-wall-right', { width: 0.8, height: 7.6, depth: 32.0 }, scene);
  wallRight.position.set(x + 13.6, y + 3.8, z - 3);
  wallRight.material = matWall;
  yield;

  // Tường trước và Cửa ra vào
  const wallFrontL = MeshBuilder.CreateBox('casino-int-wall-fl', { width: 11.2, height: 7.6, depth: 0.8 }, scene);
  wallFrontL.position.set(x - 8.0, y + 3.8, z - 18.6);
  wallFrontL.material = matWall;
  yield;

  const wallFrontR = MeshBuilder.CreateBox('casino-int-wall-fr', { width: 11.2, height: 7.6, depth: 0.8 }, scene);
  wallFrontR.position.set(x + 8.0, y + 3.8, z - 18.6);
  wallFrontR.material = matWall;
  yield;

  // Đèn chùm pha lê trung tâm (Grand Chandelier)
  const chandelierRoot = new TransformNode('casino-int-chandelier', scene);
  chandelierRoot.position.set(x, y + 6.8, z - 2);
  const chCenter = MeshBuilder.CreateCylinder('ch-center', { diameter: 3.2, height: 0.35, tessellation: 24 }, scene);
  chCenter.material = matGoldTrim;
  chCenter.parent = chandelierRoot;
  for (let ci = 0; ci < 8; ci++) {
    const angle = (ci / 8) * Math.PI * 2;
    const bulb = MeshBuilder.CreateSphere(`ch-bulb-${ci}`, { diameter: 0.4 }, scene);
    bulb.position.set(Math.cos(angle) * 1.4, -0.2, Math.sin(angle) * 1.4);
    bulb.material = matBulb;
    bulb.parent = chandelierRoot;
  }
  yield;

  // Thảm đỏ và Điểm thoát cửa (Exit Pad)
  const exitPad = MeshBuilder.CreateCylinder('casino-int-exit-pad', { diameter: 3.4, height: 0.05, tessellation: 24 }, scene);
  exitPad.position.set(x, y + 0.04, z - 16.5);
  exitPad.material = matGoldTrim;
  exitPad.metadata = { cityAction: 'exit', label: 'Cửa ra Quảng Trường' };
  yield;

  // Quầy Lễ Tân / Đổi Thưởng của Chú Lộc
  const counter = MeshBuilder.CreateBox('casino-int-counter', { width: 12.0, height: 2.0, depth: 2.6 }, scene);
  counter.position.set(x, y + 1.0, z + 9.5);
  counter.material = matDarkOak;
  counter.metadata = { cityAction: 'casino', label: 'Quầy Tiếp Tân Chú Lộc' };
  shadows?.addShadowCaster(counter);
  yield;

  // Biển hiệu Chú Lộc
  const keeperNameTexture = new DynamicTexture('casino-keeper-name', { width: 1024, height: 224 }, scene, true);
  const knCtx = keeperNameTexture.getContext();
  knCtx.fillStyle = '#1c120c';
  knCtx.fillRect(0, 0, 1024, 224);
  knCtx.fillStyle = '#f59e0b';
  knCtx.strokeStyle = '#fef08a';
  knCtx.lineWidth = 12;
  knCtx.strokeRect(10, 10, 1004, 204);
  knCtx.font = 'bold 64px "Baloo 2", Arial, sans-serif';
  knCtx.textAlign = 'center';
  knCtx.textBaseline = 'middle';
  knCtx.fillText('👑 CHÚ LỘC · QUẢN LÝ HỘI QUÁN', 512, 112);
  keeperNameTexture.update();

  const knMat = new StandardMaterial('casino-keeper-mat', scene);
  knMat.diffuseTexture = keeperNameTexture;
  knMat.emissiveColor = Color3.FromHexString('#f59e0b').scale(0.35);

  const keeperSign = MeshBuilder.CreatePlane('casino-keeper-sign', { width: 6.8, height: 1.5 }, scene);
  keeperSign.position.set(x, y + 4.2, z + 12.0);
  keeperSign.material = knMat;
  yield;

  // =========================================================================
  // 3. BỐN KHU BÀN CHƠI 3D THỰC THỤ TRONG PHÒNG CASINO
  // =========================================================================

  // Helper tạo ghế ngồi 3D Play Together
  const createChair = (name, cx, cz, angleY) => {
    const chairRoot = new TransformNode(name, scene);
    chairRoot.position.set(cx, y, cz);
    chairRoot.rotation.y = angleY;

    // Chân kim loại
    const leg = MeshBuilder.CreateCylinder(`${name}-leg`, { diameter: 0.08, height: 1.0 }, scene);
    leg.position.y = 0.5;
    leg.material = matGoldTrim;
    leg.parent = chairRoot;

    // Đệm ngồi da đỏ
    const seat = MeshBuilder.CreateCylinder(`${name}-seat`, { diameter: 0.85, height: 0.18 }, scene);
    seat.position.y = 1.05;
    seat.material = matLeather;
    seat.parent = chairRoot;

    // Tựa lưng
    const back = MeshBuilder.CreateBox(`${name}-back`, { width: 0.75, height: 0.65, depth: 0.12 }, scene);
    back.position.set(0, 1.45, -0.38);
    back.material = matLeather;
    back.parent = chairRoot;

    return chairRoot;
  };

  // -------------------------------------------------------------------------
  // BÀN 1: TÀI XỈU SIC BO 3D (Tây Nam: x - 6.5, z - 3.5)
  // -------------------------------------------------------------------------
  const txTableRoot = new TransformNode('casino-table-3d-tai-xiu', scene);
  txTableRoot.position.set(x - 6.5, y, z - 3.5);
  txTableRoot.metadata = { casinoTable: 'tai-xiu', label: 'Bàn Tài Xỉu Sic Bo 3D' };

  // Khối bàn nỉ đỏ bán nguyệt
  const txTableMesh = MeshBuilder.CreateCylinder('table-mesh-tx', { diameter: 5.2, height: 1.35, tessellation: 24 }, scene);
  txTableMesh.position.y = 0.68;
  txTableMesh.material = matRedFelt;
  txTableMesh.parent = txTableRoot;
  txTableMesh.metadata = { casinoTable: 'tai-xiu', label: 'Bàn Tài Xỉu Sic Bo 3D' };
  shadows?.addShadowCaster(txTableMesh);

  // Đĩa vàng & Bát 3D trên bàn
  const txDish = MeshBuilder.CreateCylinder('tx-3d-dish', { diameter: 1.4, height: 0.08, tessellation: 24 }, scene);
  txDish.position.set(0, 1.38, 0);
  txDish.material = matPlateGold;
  txDish.parent = txTableRoot;

  const txBowl = MeshBuilder.CreateSphere('tx-3d-bowl', { diameter: 1.2, segments: 14, slice: 0.5 }, scene);
  txBowl.position.set(0, 1.42, 0);
  txBowl.rotation.x = Math.PI;
  txBowl.material = matBulb;
  txBowl.parent = txTableRoot;

  // Biển hiệu 3D nổi trên bàn
  const txSign = MeshBuilder.CreatePlane('tx-3d-sign', { width: 2.4, height: 0.7 }, scene);
  txSign.position.set(0, 2.6, 0);
  txSign.billboardMode = Mesh.BILLBOARDMODE_ALL;
  txSign.material = makeMat(scene, 'mat-tx-sign', '#ef4444', '#dc2626');
  txSign.parent = txTableRoot;

  // Ghế ngồi xung quanh bàn Tài Xỉu
  [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].forEach((ang, i) => {
    createChair(`tx-chair-${i}`, x - 6.5 + Math.cos(ang) * 3.4, z - 3.5 + Math.sin(ang) * 3.4, ang + Math.PI / 2);
  });
  yield;

  // -------------------------------------------------------------------------
  // BÀN 2: BẦU CUA TÔM CÁ 3D (Đông Nam: x + 6.5, z - 3.5)
  // -------------------------------------------------------------------------
  const bcTableRoot = new TransformNode('casino-table-3d-bau-cua', scene);
  bcTableRoot.position.set(x + 6.5, y, z - 3.5);
  bcTableRoot.metadata = { casinoTable: 'bau-cua', label: 'Bàn Bầu Cua Tôm Cá 3D' };

  const bcTableMesh = MeshBuilder.CreateBox('table-mesh-bc', { width: 4.8, height: 1.35, depth: 3.6 }, scene);
  bcTableMesh.position.y = 0.68;
  bcTableMesh.material = matGreenFelt;
  bcTableMesh.parent = bcTableRoot;
  bcTableMesh.metadata = { casinoTable: 'bau-cua', label: 'Bàn Bầu Cua Tôm Cá 3D' };
  shadows?.addShadowCaster(bcTableMesh);

  // Đĩa gỗ Bầu Cua trên bàn
  const bcDish = MeshBuilder.CreateCylinder('bc-3d-dish', { diameter: 1.5, height: 0.1, tessellation: 20 }, scene);
  bcDish.position.set(0, 1.4, 0);
  bcDish.material = matDarkOak;
  bcDish.parent = bcTableRoot;

  const bcSign = MeshBuilder.CreatePlane('bc-3d-sign', { width: 2.4, height: 0.7 }, scene);
  bcSign.position.set(0, 2.6, 0);
  bcSign.billboardMode = Mesh.BILLBOARDMODE_ALL;
  bcSign.material = makeMat(scene, 'mat-bc-sign', '#10b981', '#059669');
  bcSign.parent = bcTableRoot;

  [-1.8, 0, 1.8].forEach((ox, i) => {
    createChair(`bc-chair-top-${i}`, x + 6.5 + ox, z - 3.5 - 2.5, 0);
    createChair(`bc-chair-bot-${i}`, x + 6.5 + ox, z - 3.5 + 2.5, Math.PI);
  });
  yield;

  // -------------------------------------------------------------------------
  // BÀN 3: BÀI CÀO 3 LÁ (Tây Bắc: x - 6.5, z + 4.5)
  // -------------------------------------------------------------------------
  const caTableRoot = new TransformNode('casino-table-3d-bai-cao', scene);
  caTableRoot.position.set(x - 6.5, y, z + 4.5);
  caTableRoot.metadata = { casinoTable: 'bai-cao', label: 'Bàn Bài Cào 3 Lá' };

  const caTableMesh = MeshBuilder.CreateCylinder('table-mesh-ca', { diameter: 4.6, height: 1.35, tessellation: 24 }, scene);
  caTableMesh.position.y = 0.68;
  caTableMesh.material = matBlueFelt;
  caTableMesh.parent = caTableRoot;
  caTableMesh.metadata = { casinoTable: 'bai-cao', label: 'Bàn Bài Cào 3 Lá' };
  shadows?.addShadowCaster(caTableMesh);

  const caSign = MeshBuilder.CreatePlane('ca-3d-sign', { width: 2.4, height: 0.7 }, scene);
  caSign.position.set(0, 2.6, 0);
  caSign.billboardMode = Mesh.BILLBOARDMODE_ALL;
  caSign.material = makeMat(scene, 'mat-ca-sign', '#3b82f6', '#1d4ed8');
  caSign.parent = caTableRoot;

  [0, (Math.PI * 2) / 5, (Math.PI * 4) / 5, (Math.PI * 6) / 5, (Math.PI * 8) / 5].forEach((ang, i) => {
    createChair(`ca-chair-${i}`, x - 6.5 + Math.cos(ang) * 3.0, z + 4.5 + Math.sin(ang) * 3.0, ang + Math.PI / 2);
  });
  yield;

  // -------------------------------------------------------------------------
  // BÀN 4: TIẾN LÊN MIỀN NAM (Đông Bắc: x + 6.5, z + 4.5)
  // -------------------------------------------------------------------------
  const tlTableRoot = new TransformNode('casino-table-3d-tien-len', scene);
  tlTableRoot.position.set(x + 6.5, y, z + 4.5);
  tlTableRoot.metadata = { casinoTable: 'tien-len', label: 'Bàn Tiến Lên Miền Nam' };

  const tlTableMesh = MeshBuilder.CreateCylinder('table-mesh-tl', { diameter: 4.2, height: 1.35, tessellation: 24 }, scene);
  tlTableMesh.position.y = 0.68;
  tlTableMesh.material = matDarkOak;
  tlTableMesh.parent = tlTableRoot;
  tlTableMesh.metadata = { casinoTable: 'tien-len', label: 'Bàn Tiến Lên Miền Nam' };
  shadows?.addShadowCaster(tlTableMesh);

  const tlSign = MeshBuilder.CreatePlane('tl-3d-sign', { width: 2.6, height: 0.7 }, scene);
  tlSign.position.set(0, 2.6, 0);
  tlSign.billboardMode = Mesh.BILLBOARDMODE_ALL;
  tlSign.material = makeMat(scene, 'mat-tl-sign', '#8b5cf6', '#6d28d9');
  tlSign.parent = tlTableRoot;

  [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((ang, i) => {
    createChair(`tl-chair-${i}`, x + 6.5 + Math.cos(ang) * 2.8, z + 4.5 + Math.sin(ang) * 2.8, ang + Math.PI / 2);
  });
  yield;
}
