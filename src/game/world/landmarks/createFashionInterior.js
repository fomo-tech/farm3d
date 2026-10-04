import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';

function makeMat(scene, name, hex, emissiveHex = null, specular = 0.10, specularPower = 32) {
  let m = scene.getMaterialByName(name);
  if (!m) {
    m = new StandardMaterial(name, scene);
    m.diffuseColor = Color3.FromHexString(hex);
    m.ambientColor = m.diffuseColor.scale(0.32);
    m.specularColor = new Color3(specular, specular, specular);
    m.specularPower = specularPower;
    if (emissiveHex) {
      m.emissiveColor = Color3.FromHexString(emissiveHex);
    } else {
      m.emissiveColor = Color3.Black(); // Không tự phát sáng, tránh chói lóa và cháy trắng
    }
  }
  return m;
}

/**
 * Creates the high-end Play Together style interior for Sophie's Fashion Boutique & Salon.
 * Includes Runway catwalk, Hollywood mirror, fitting booths, sneaker wall, and VIP lounge.
 */
export function* createFashionBoutiqueInterior(scene, config, shadows) {
  const { x, y, z } = config.interior;
  yield;

  // 1. Vật liệu nội thất cao cấp (Luxury Boutique Materials - Calibrated & Glare-Free)
  const matFloor = makeMat(scene, 'fashion-boutique-floor', '#cbb69d', null, 0.15, 32);
  matFloor.backFaceCulling = false;
  const matRug = makeMat(scene, 'fashion-boutique-rug', '#9f697c', null, 0.04, 16);
  const matWall = makeMat(scene, 'fashion-boutique-wall', '#d9cfc4', null, 0.06, 24);
  matWall.backFaceCulling = false;
  const matMolding = makeMat(scene, 'fashion-boutique-gold', '#a68344', null, 0.35, 64);
  const matMarble = makeMat(scene, 'fashion-boutique-marble', '#e8dfd5', null, 0.28, 48);
  const matVelvetPink = makeMat(scene, 'fashion-boutique-velvet', '#8b324d', null, 0.08, 24);
  const matVelvetCurtain = makeMat(scene, 'fashion-boutique-curtain', '#532738', null, 0.06, 20);
  const matRunwayGlass = makeMat(scene, 'fashion-runway-glass', '#ded4dc', '#140e14', 0.6, 96);
  const matMirrorGlass = makeMat(scene, 'fashion-mirror-glass', '#b8d5e5', null, 0.85, 128);
  const matBulb = makeMat(scene, 'fashion-mirror-bulb', '#fffdf5', '#fae8b4', 0.8, 64);
  const matDarkWood = makeMat(scene, 'fashion-boutique-wood', '#4a2c1b', null, 0.15, 32);
  const matChrMetal = makeMat(scene, 'fashion-boutique-chrome', '#94a3b8', null, 0.6, 64);
  yield;

  // 2. Kiến trúc phòng hộp khép kín 6 mặt & Hộp cản quang tuyệt đối (Enclosed Room & Total Occlusion Shell)
  const matOuterOcclusion = makeMat(scene, 'fashion-outer-occlusion-mat', '#120d18', '#120d18', 0, 0);
  matOuterOcclusion.backFaceCulling = false;
  matOuterOcclusion.disableLighting = true;

  // Hộp vỏ ngoài khổng lồ 90m x 42m x 90m bọc kín 100% không gian cửa hàng (không thể thấy ngoại cảnh)
  const outerOcclusion = MeshBuilder.CreateBox('fashion-outer-occlusion-box', { width: 90, height: 42, depth: 90 }, scene);
  outerOcclusion.position.set(x, y + 10, z - 4);
  outerOcclusion.material = matOuterOcclusion;
  outerOcclusion.isPickable = false;
  yield;

  const floor = MeshBuilder.CreateBox('fashion-floor', { width: 25.2, height: 0.6, depth: 29.2 }, scene);
  floor.position.set(x, y - 0.3, z - 4);
  floor.material = matFloor;
  floor.receiveShadows = true;
  yield;

  const ceiling = MeshBuilder.CreateBox('fashion-ceiling', { width: 25.2, height: 0.6, depth: 29.2 }, scene);
  ceiling.position.set(x, y + 7.2, z - 4);
  ceiling.material = matWall;
  yield;

  // 8 Đèn downlight âm trần tỏa ánh sáng ấm áp
  for (let ci = 0; ci < 8; ci++) {
    const row = Math.floor(ci / 4);
    const col = ci % 4;
    const lx = -7.5 + col * 5.0;
    const lz = -12.0 + row * 10.0;
    const downlight = MeshBuilder.CreateCylinder(`fashion-downlight-${ci}`, { diameter: 0.65, height: 0.05, tessellation: 16 }, scene);
    downlight.position.set(x + lx, y + 6.82, z + lz);
    downlight.material = matBulb;
  }
  yield;

  // Tường sau (Back Wall) - tăng độ dày và viền phủ kín góc nối
  const wallBack = MeshBuilder.CreateBox('fashion-wall-back', { width: 25.2, height: 7.4, depth: 0.8 }, scene);
  wallBack.position.set(x, y + 3.6, z + 9);
  wallBack.material = matWall;
  yield;

  // Tường trái & Tường phải (Left & Right Walls)
  const wallLeft = MeshBuilder.CreateBox('fashion-wall-left', { width: 0.8, height: 7.4, depth: 29.2 }, scene);
  wallLeft.position.set(x - 12.2, y + 3.6, z - 4);
  wallLeft.material = matWall;
  yield;

  const wallRight = MeshBuilder.CreateBox('fashion-wall-right', { width: 0.8, height: 7.4, depth: 29.2 }, scene);
  wallRight.position.set(x + 12.2, y + 3.6, z - 4);
  wallRight.material = matWall;
  yield;

  // Tường mặt trước khép kín có ô cửa ra vào (Front Wall with Door Opening)
  const wallFrontLeft = MeshBuilder.CreateBox('fashion-wall-front-l', { width: 10.2, height: 7.4, depth: 0.8 }, scene);
  wallFrontLeft.position.set(x - 7.3, y + 3.6, z - 17.8);
  wallFrontLeft.material = matWall;
  yield;

  const wallFrontRight = MeshBuilder.CreateBox('fashion-wall-front-r', { width: 10.2, height: 7.4, depth: 0.8 }, scene);
  wallFrontRight.position.set(x + 7.3, y + 3.6, z - 17.8);
  wallFrontRight.material = matWall;
  yield;

  const wallFrontTop = MeshBuilder.CreateBox('fashion-wall-front-top', { width: 5.4, height: 2.6, depth: 0.8 }, scene);
  wallFrontTop.position.set(x, y + 6.0, z - 17.8);
  wallFrontTop.material = matWall;
  yield;

  // Bức tường tiền sảnh cản sáng sau cửa ra vào (Vestibule Foyer Backing Wall)
  const foyerBacking = MeshBuilder.CreateBox('fashion-exit-foyer-backing', { width: 14.0, height: 7.4, depth: 0.6 }, scene);
  foyerBacking.position.set(x, y + 3.6, z - 18.4);
  foyerBacking.material = matWall;
  yield;

  // Viền phào chỉ vàng kim loại dọc chân tường và trần (Crown & Baseboard Moldings)
  [-11.8, 11.8].forEach((wx, i) => {
    const moldingBottom = MeshBuilder.CreateBox(`fashion-molding-b-${i}`, { width: 0.2, height: 0.35, depth: 27.6 }, scene);
    moldingBottom.position.set(x + wx, y + 0.17, z - 4);
    moldingBottom.material = matMolding;

    const moldingTop = MeshBuilder.CreateBox(`fashion-molding-t-${i}`, { width: 0.2, height: 0.3, depth: 27.6 }, scene);
    moldingTop.position.set(x + wx, y + 6.85, z - 4);
    moldingTop.material = matMolding;
  });
  yield;

  // 3. Thảm nhung hồng phấn lớn sang trọng ở trung tâm
  const centralRug = MeshBuilder.CreateCylinder('fashion-central-rug', { diameter: 14.5, height: 0.04, tessellation: 36 }, scene);
  centralRug.position.set(x, y + 0.02, z - 1.5);
  centralRug.material = matRug;
  centralRug.receiveShadows = true;
  yield;

  // 4. SÀN RUNWAY CHIC & BỤC THỬ ĐỒ TRUNG TÂM (Interactive Runway Catwalk)
  const runwayBase = MeshBuilder.CreateCylinder('fashion-runway-base', { diameter: 5.3, height: 0.12, tessellation: 32 }, scene);
  runwayBase.position.set(x, y + 0.06, z - 1.5);
  runwayBase.material = matMolding;
  runwayBase.receiveShadows = true;
  yield;

  const runwayTop = MeshBuilder.CreateCylinder('fashion-runway-glass', { diameter: 5.15, height: 0.08, tessellation: 32 }, scene);
  runwayTop.position.set(x, y + 0.14, z - 1.5);
  runwayTop.material = matRunwayGlass;
  runwayTop.metadata = { cityAction: 'fashion' };
  yield;

  // Đèn spotlight rọi sàn Catwalk từ trần
  const runwayChandelier = MeshBuilder.CreateTorus('fashion-runway-ring-light', { diameter: 4.8, thickness: 0.07, tessellation: 32 }, scene);
  runwayChandelier.position.set(x, y + 6.6, z - 1.5);
  runwayChandelier.material = matMolding;
  yield;

  // 5. CỤM GƯƠNG SOI HOLLYWOOD TOÀN THÂN (Hollywood Vanity Mirror Station)
  const mirrorStation = new TransformNode('fashion-mirror-station', scene);
  mirrorStation.position.set(x + 7.5, y, z + 8.4);
  yield;

  const mirrorFrame = MeshBuilder.CreateBox('fashion-mirror-frame', { width: 3.8, height: 5.4, depth: 0.22 }, scene);
  mirrorFrame.position.set(0, 2.7, 0);
  mirrorFrame.material = matMolding;
  mirrorFrame.parent = mirrorStation;
  mirrorFrame.metadata = { cityAction: 'fashion' };
  yield;

  const mirrorGlass = MeshBuilder.CreateBox('fashion-mirror-glass-pane', { width: 3.3, height: 4.9, depth: 0.05 }, scene);
  mirrorGlass.position.set(0, 2.7, 0.1);
  mirrorGlass.material = matMirrorGlass;
  mirrorGlass.parent = mirrorStation;
  mirrorGlass.metadata = { cityAction: 'fashion' };
  yield;

  // Bóng đèn LED viền tròn quanh khung gương (Hollywood bulbs)
  const bulbCoords = [
    [-1.7, 0.6], [-1.7, 1.6], [-1.7, 2.7], [-1.7, 3.8], [-1.7, 4.8],
    [1.7, 0.6], [1.7, 1.6], [1.7, 2.7], [1.7, 3.8], [1.7, 4.8],
    [-0.9, 5.1], [0, 5.1], [0.9, 5.1],
  ];
  bulbCoords.forEach(([bx, by], bi) => {
    const bulb = MeshBuilder.CreateSphere(`fashion-bulb-${bi}`, { diameter: 0.14, segments: 8 }, scene);
    bulb.position.set(bx, by, 0.14);
    bulb.material = matBulb;
    bulb.parent = mirrorStation;
  });
  yield;

  // 6. PHÒNG THỬ ĐỒ VIP RÈM NHUNG (Fitting Rooms)
  [-7.8, -4.5].forEach((rx, fi) => {
    const booth = new TransformNode(`fashion-booth-${fi}`, scene);
    booth.position.set(x + rx, y, z + 7.4);

    const boothFrame = MeshBuilder.CreateBox(`fashion-booth-frame-${fi}`, { width: 2.8, height: 4.8, depth: 2.6 }, scene);
    boothFrame.position.set(0, 2.4, 0);
    boothFrame.material = matWall;
    boothFrame.parent = booth;
    shadows?.addShadowCaster(boothFrame);

    // Vòm rèm nhung buông rủ
    const curtain = MeshBuilder.CreateCylinder(`fashion-curtain-${fi}`, { diameterTop: 1.6, diameterBottom: 2.1, height: 4.2, tessellation: 16 }, scene);
    curtain.position.set(0, 2.1, -1.25);
    curtain.scaling.set(1.2, 1.0, 0.35);
    curtain.material = matVelvetCurtain;
    curtain.parent = booth;
    curtain.metadata = { cityAction: 'fashion' };

    // Bảng tên phòng VIP
    const sign = MeshBuilder.CreateBox(`fashion-booth-sign-${fi}`, { width: 1.4, height: 0.35, depth: 0.08 }, scene);
    sign.position.set(0, 4.5, -1.32);
    sign.material = matMolding;
    sign.parent = booth;
  });
  yield;

  // 7. BỨC TƯỜNG SNEAKER WALL ÂM TƯỜNG (The Sneaker Wall)
  const sneakerWall = new TransformNode('fashion-sneaker-wall', scene);
  sneakerWall.position.set(x - 11.6, y, z - 3.5);
  yield;

  const sneakerPanel = MeshBuilder.CreateBox('fashion-sneaker-backing', { width: 0.3, height: 5.2, depth: 9.0 }, scene);
  sneakerPanel.position.set(0, 2.7, 0);
  sneakerPanel.material = matMarble;
  sneakerPanel.parent = sneakerWall;
  yield;

  // 3 Hàng kệ kính trưng bày sneaker
  [-1.5, 0, 1.5].forEach((shelfY, si) => {
    const shelf = MeshBuilder.CreateBox(`fashion-sneaker-shelf-${si}`, { width: 0.9, height: 0.08, depth: 8.2 }, scene);
    shelf.position.set(0.4, 2.2 + shelfY, 0);
    shelf.material = matMolding;
    shelf.parent = sneakerWall;
    shelf.metadata = { cityAction: 'fashion' };

    // Đặt 4 đôi sneaker / boots mẫu trên mỗi kệ
    [-3.0, -1.0, 1.0, 3.0].forEach((shoeZ, di) => {
      const shoeColor = ['#38bdf8', '#f43f5e', '#ffffff', '#fbbf24', '#a855f7', '#22c55e'][(si * 4 + di) % 6];
      const matShoe = makeMat(scene, `shoe-display-${si}-${di}`, shoeColor, null, 0.4, 48);

      const shoe = MeshBuilder.CreateSphere(`shoe-model-${si}-${di}`, { diameter: 0.42, segments: 8 }, scene);
      shoe.scaling.set(0.65, 0.45, 1.15);
      shoe.position.set(0.5, 2.45 + shelfY, shoeZ);
      shoe.rotation.y = 0.35;
      shoe.material = matShoe;
      shoe.parent = sneakerWall;
      shoe.metadata = { cityAction: 'fashion' };
    });
  });
  yield;

  // 8. DÃY GIÁ TREO QUẦN ÁO MẠ VÀNG (Designer Clothing Racks)
  const rackRight = new TransformNode('fashion-rack-right', scene);
  rackRight.position.set(x + 10.5, y, z - 3.5);
  yield;

  const rackBar = MeshBuilder.CreateCylinder('fashion-rack-bar', { height: 7.8, diameter: 0.06 }, scene);
  rackBar.rotation.x = Math.PI / 2;
  rackBar.position.set(0, 2.8, 0);
  rackBar.material = matMolding;
  rackBar.parent = rackRight;

  [-3.8, 3.8].forEach((pz, pi) => {
    const leg = MeshBuilder.CreateCylinder(`fashion-rack-leg-${pi}`, { height: 2.8, diameter: 0.06 }, scene);
    leg.position.set(0, 1.4, pz);
    leg.material = matMolding;
    leg.parent = rackRight;
  });

  // Móc treo các mẫu áo thun, hoodie, đầm dạ hội đủ sắc màu
  [-3.0, -2.0, -1.0, 0, 1.0, 2.0, 3.0].forEach((clothesZ, ci) => {
    const clothColor = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'][ci % 7];
    const matCloth = makeMat(scene, `hanger-cloth-${ci}`, clothColor, null, 0.15, 32);

    const hanger = MeshBuilder.CreateBox(`hanger-${ci}`, { width: 0.22, height: 1.4, depth: 0.65 }, scene);
    hanger.position.set(0, 2.0, clothesZ);
    hanger.material = matCloth;
    hanger.parent = rackRight;
    hanger.metadata = { cityAction: 'fashion' };
  });
  yield;

  // 9. SOFA TRÒN VIP LOUNGE & BÀN TRÀ THỜI TRANG (VIP Lounge)
  const lounge = new TransformNode('fashion-lounge', scene);
  lounge.position.set(x - 7.5, y, z - 11.5);
  yield;

  const sofaSeat = MeshBuilder.CreateCylinder('fashion-sofa-seat', { diameter: 3.4, height: 0.55, tessellation: 24 }, scene);
  sofaSeat.position.set(0, 0.28, 0);
  sofaSeat.material = matVelvetPink;
  sofaSeat.parent = lounge;

  const sofaBack = MeshBuilder.CreateTorus('fashion-sofa-back', { diameter: 3.2, thickness: 0.45, tessellation: 24 }, scene);
  sofaBack.position.set(0, 0.65, 0);
  sofaBack.material = matVelvetPink;
  sofaBack.parent = lounge;

  const loungeTable = MeshBuilder.CreateCylinder('fashion-lounge-table', { diameter: 1.4, height: 0.42, tessellation: 18 }, scene);
  loungeTable.position.set(0, 0.21, 2.2);
  loungeTable.material = matMarble;
  loungeTable.parent = lounge;
  yield;

  // 10. MA-NƠ-CANH THỜI TRANG TẠO DÁNG (Chic Mannequins on Pedestals)
  [-3.8, 3.8].forEach((mx, mi) => {
    const pedestal = MeshBuilder.CreateCylinder(`fashion-mannequin-ped-${mi}`, { diameter: 1.6, height: 0.45, tessellation: 20 }, scene);
    pedestal.position.set(x + mx, y + 0.22, z + 3.2);
    pedestal.material = matMarble;

    const manBody = MeshBuilder.CreateCylinder(`fashion-mannequin-body-${mi}`, { diameterTop: 0.5, diameterBottom: 0.72, height: 1.1, tessellation: 16 }, scene);
    manBody.position.set(x + mx, y + 1.15, z + 3.2);
    manBody.material = mi === 0 ? matVelvetPink : matVelvetCurtain;
    manBody.metadata = { cityAction: 'fashion' };

    const manHead = MeshBuilder.CreateSphere(`fashion-mannequin-head-${mi}`, { diameter: 0.52, segments: 12 }, scene);
    manHead.position.set(x + mx, y + 1.95, z + 3.2);
    manHead.material = matMarble;
    manHead.metadata = { cityAction: 'fashion' };
  });
  yield;

  // 11. QUẦY THU NGÂN CÔ SOPHIE (Sophie's Cashier & Styling Counter)
  const counter = MeshBuilder.CreateBox('fashion-service-counter', { width: 9.0, height: 1.9, depth: 2.4 }, scene);
  counter.position.set(x, y + 0.95, z + 4.8);
  counter.material = matMarble;
  counter.metadata = { cityAction: 'fashion' };
  shadows?.addShadowCaster(counter);
  yield;

  const counterTop = MeshBuilder.CreateBox('fashion-counter-top', { width: 9.3, height: 0.12, depth: 2.6 }, scene);
  counterTop.position.set(x, y + 1.94, z + 4.8);
  counterTop.material = matDarkWood;
  counterTop.metadata = { cityAction: 'fashion' };
  yield;

  const posMachine = MeshBuilder.CreateBox('fashion-pos-terminal', { width: 0.6, height: 0.45, depth: 0.55 }, scene);
  posMachine.position.set(x - 2.8, y + 2.25, z + 4.8);
  posMachine.material = matChrMetal;

  const vase = MeshBuilder.CreateCylinder('fashion-flower-vase', { diameterTop: 0.45, diameterBottom: 0.25, height: 0.75 }, scene);
  vase.position.set(x + 3.2, y + 2.35, z + 4.8);
  vase.material = matMolding;

  const bouquet = MeshBuilder.CreateSphere('fashion-flower-bouquet', { diameter: 0.7, segments: 8 }, scene);
  bouquet.position.set(x + 3.2, y + 2.85, z + 4.8);
  bouquet.material = matVelvetPink;
  yield;

  // 12. BIỂN HIỆU NEON NGHỆ THUẬT SOPHIE BOUTIQUE TRÊN TƯỜNG (Neon Signboard)
  const signDT = new DynamicTexture('fashion-neon-dt', { width: 2048, height: 512 }, scene, true);
  const sCtx = signDT.getContext();
  sCtx.fillStyle = '#0f172a';
  sCtx.fillRect(0, 0, 2048, 512);

  sCtx.strokeStyle = '#f472b6';
  sCtx.lineWidth = 14;
  sCtx.strokeRect(40, 40, 1968, 432);

  sCtx.font = 'bold 100px "Baloo 2", cursive, sans-serif';
  sCtx.textAlign = 'center';
  sCtx.textBaseline = 'middle';
  sCtx.fillStyle = '#fdf2f8';
  sCtx.shadowColor = '#ec4899';
  sCtx.shadowBlur = 35;
  sCtx.fillText('★ SOPHIE BOUTIQUE & SALON ★', 1024, 210);

  sCtx.font = '700 52px system-ui, sans-serif';
  sCtx.fillStyle = '#fde68a';
  sCtx.shadowColor = '#f59e0b';
  sCtx.shadowBlur = 20;
  sCtx.fillText('THỜI TRANG CAO CẤP · PHÒNG THỬ ĐỒ 3D · SALON TÓC & LÀM ĐẸP', 1024, 340);
  signDT.update();

  const signMat = new StandardMaterial('fashion-neon-sign-mat', scene);
  signMat.emissiveTexture = signDT;
  signMat.diffuseColor = Color3.Black();
  signMat.disableLighting = true;

  const signPlane = MeshBuilder.CreatePlane('fashion-neon-sign-plane', { width: 9.6, height: 2.4 }, scene);
  signPlane.position.set(x, y + 5.2, z + 8.7);
  signPlane.rotation.y = Math.PI;
  signPlane.material = signMat;
  signPlane.metadata = { cityAction: 'fashion' };
  yield;

  // 13. CÔ SOPHIE (Shopkeeper NPC Cô Sophie - Tông màu ấm thanh lịch, không chói)
  const sophieSkin = makeMat(scene, 'sophie-skin', '#f6d8c4', null, 0.08, 32);
  const sophieHair = makeMat(scene, 'sophie-hair', '#8b3d5b', null, 0.18, 32);
  const sophieDress = makeMat(scene, 'sophie-dress', '#5c2236', null, 0.15, 32);

  const keeperBody = MeshBuilder.CreateCylinder('fashion-sophie-body', { height: 1.45, diameterTop: 0.65, diameterBottom: 0.88, tessellation: 16 }, scene);
  keeperBody.position.set(x, y + 1.7, z + 6.6);
  keeperBody.material = sophieDress;
  keeperBody.metadata = { cityAction: 'fashion' };

  const keeperHead = MeshBuilder.CreateSphere('fashion-sophie-head', { diameter: 0.86, segments: 16 }, scene);
  keeperHead.position.set(x, y + 2.76, z + 6.6);
  keeperHead.material = sophieSkin;
  keeperHead.metadata = { cityAction: 'fashion' };

  const keeperHair = MeshBuilder.CreateSphere('fashion-sophie-hair', { diameter: 0.92, segments: 16 }, scene);
  keeperHair.position.set(x, y + 3.05, z + 6.65);
  keeperHair.material = sophieHair;
  keeperHair.metadata = { cityAction: 'fashion' };

  const hairBun = MeshBuilder.CreateSphere('fashion-sophie-hair-bun', { diameter: 0.52, segments: 12 }, scene);
  hairBun.position.set(x, y + 3.45, z + 6.8);
  hairBun.material = sophieHair;
  hairBun.metadata = { cityAction: 'fashion' };

  [-0.17, 0.17].forEach((ex, idx) => {
    const eye = MeshBuilder.CreateSphere(`fashion-sophie-eye-${idx}`, { diameter: 0.09, segments: 8 }, scene);
    eye.position.set(x + ex, y + 2.78, z + 6.15);
    eye.material = makeMat(scene, 'sophie-eye', '#0f172a');
    eye.metadata = { cityAction: 'fashion' };
  });

  const nameTexture = new DynamicTexture('fashion-sophie-name-dt', { width: 1024, height: 224 }, scene, true);
  const nCtx = nameTexture.getContext();
  nCtx.fillStyle = '#fce7f3';
  nCtx.fillRect(0, 0, 1024, 224);
  nCtx.fillStyle = '#831843';
  nCtx.textAlign = 'center';
  nCtx.textBaseline = 'middle';
  nCtx.font = 'bold 64px "Baloo 2", Segoe UI, sans-serif';
  nCtx.fillText('👗 CÔ SOPHIE · THỜI TRANG & SALON', 512, 112, 950);
  nameTexture.update();

  const nameMat = new StandardMaterial('fashion-sophie-name-mat', scene);
  nameMat.emissiveTexture = nameTexture;
  nameMat.diffuseColor = Color3.Black();
  nameMat.disableLighting = true;

  const namePlane = MeshBuilder.CreatePlane('fashion-sophie-name-plate', { width: 5.8, height: 1.26 }, scene);
  namePlane.position.set(x, y + 4.3, z + 8.47);
  namePlane.rotation.y = Math.PI;
  namePlane.material = nameMat;
  namePlane.metadata = { cityAction: 'fashion' };
  yield;

  // 14. CỬA RA VÀO LỚN & THẢM DỊCH CHUYỂN CHUẨN PLAY TOGETHER (Grand Exit Portal)
  const exitPortal = new TransformNode('fashion-exit-portal', scene);
  exitPortal.position.set(x, y, z - 17.6);

  // Vòm khung kim loại mạ vàng sang trọng
  const archLeft = MeshBuilder.CreateCylinder('fashion-exit-arch-l', { height: 4.8, diameter: 0.2 }, scene);
  archLeft.position.set(-2.4, 2.4, 0);
  archLeft.material = matMolding;
  archLeft.parent = exitPortal;

  const archRight = MeshBuilder.CreateCylinder('fashion-exit-arch-r', { height: 4.8, diameter: 0.2 }, scene);
  archRight.position.set(2.4, 2.4, 0);
  archRight.material = matMolding;
  archRight.parent = exitPortal;

  const archTop = MeshBuilder.CreateBox('fashion-exit-arch-top', { width: 5.0, height: 0.22, depth: 0.24 }, scene);
  archTop.position.set(0, 4.8, 0);
  archTop.material = matMolding;
  archTop.parent = exitPortal;

  // Cửa kính đôi trong suốt có viền
  const doorLeft = MeshBuilder.CreateBox('fashion-exit-door-l', { width: 2.3, height: 4.6, depth: 0.08 }, scene);
  doorLeft.position.set(-1.18, 2.35, 0);
  doorLeft.material = matMirrorGlass;
  doorLeft.parent = exitPortal;
  doorLeft.metadata = { cityAction: 'exit' };

  const doorRight = MeshBuilder.CreateBox('fashion-exit-door-r', { width: 2.3, height: 4.6, depth: 0.08 }, scene);
  doorRight.position.set(1.18, 2.35, 0);
  doorRight.material = matMirrorGlass;
  doorRight.parent = exitPortal;
  doorRight.metadata = { cityAction: 'exit' };

  // Tay nắm cửa kim loại mạ vàng
  [-0.15, 0.15].forEach((hx, hi) => {
    const handle = MeshBuilder.CreateCylinder(`fashion-exit-handle-${hi}`, { height: 1.2, diameter: 0.06 }, scene);
    handle.position.set(hx, 2.2, 0.09);
    handle.material = matMolding;
    handle.parent = exitPortal;
    handle.metadata = { cityAction: 'exit' };
  });

  // Biển hiệu neon EXIT phát sáng rực rỡ trên vòm cửa
  const exitSignDT = new DynamicTexture('fashion-exit-sign-dt', { width: 1024, height: 256 }, scene, true);
  const esCtx = exitSignDT.getContext();
  esCtx.fillStyle = '#064e3b';
  esCtx.fillRect(0, 0, 1024, 256);
  esCtx.lineWidth = 14;
  esCtx.strokeStyle = '#34d399';
  esCtx.strokeRect(10, 10, 1004, 236);
  esCtx.fillStyle = '#6ee7b7';
  esCtx.textAlign = 'center';
  esCtx.textBaseline = 'middle';
  esCtx.font = 'bold 84px "Baloo 2", Segoe UI, sans-serif';
  esCtx.fillText('✦ LỐI RA · EXIT ✦', 512, 128);
  exitSignDT.update();

  const exitSignMat = new StandardMaterial('fashion-exit-sign-mat', scene);
  exitSignMat.emissiveTexture = exitSignDT;
  exitSignMat.diffuseColor = Color3.Black();
  exitSignMat.disableLighting = true;

  const exitSignPlane = MeshBuilder.CreatePlane('fashion-exit-sign-plane', { width: 4.2, height: 1.05 }, scene);
  exitSignPlane.position.set(0, 5.38, 0.16);
  exitSignPlane.material = exitSignMat;
  exitSignPlane.parent = exitPortal;
  exitSignPlane.metadata = { cityAction: 'exit' };

  // Thảm phát sáng tròn Luminous Exit Portal Pad trên mặt sàn
  const exitPadRing = MeshBuilder.CreateCylinder('fashion-exit-pad-ring', { diameter: 3.6, height: 0.04, tessellation: 32 }, scene);
  exitPadRing.position.set(x, y + 0.03, z - 16.2);
  exitPadRing.material = matMolding;

  const matExitPad = makeMat(scene, 'fashion-exit-pad-mat', '#047857', '#065f46', 0.3, 32);
  const exitPad = MeshBuilder.CreateCylinder('fashion-exit-pad', { diameter: 3.2, height: 0.05, tessellation: 32 }, scene);
  exitPad.position.set(x, y + 0.04, z - 16.2);
  exitPad.material = matExitPad;
  exitPad.metadata = { cityAction: 'exit' };

  // Mũi tên 3D phát sáng nhấp nhô lơ lửng trên không
  const exitArrow = MeshBuilder.CreateCylinder('fashion-exit-arrow', { diameterTop: 0, diameterBottom: 0.8, height: 0.9, tessellation: 4 }, scene);
  exitArrow.position.set(x, y + 1.8, z - 16.2);
  exitArrow.rotation.x = Math.PI / 2;
  exitArrow.material = matMolding;
  exitArrow.metadata = { cityAction: 'exit' };

  // Main exit door box for tests and backwards compatibility
  const exitDoor = MeshBuilder.CreateBox('fashion-exit-door', { width: 4.6, height: 4.6, depth: 0.4 }, scene);
  exitDoor.position.set(x, y + 2.3, z - 17.6);
  exitDoor.material = matVelvetPink;
  exitDoor.visibility = 0.01;
  exitDoor.metadata = { cityAction: 'exit' };
  yield;
}
