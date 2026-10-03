import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { createToyMaterial } from '../../rendering/PlayTogetherTheme.js';

function makeMat(scene, name, hex, emissiveHex = null, specular = 0.25) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.42);
  m.specularColor = new Color3(specular, specular, specular);
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

/**
 * 1. BIỆT THỰ ĐỒNG QUÊ GHIBLI (GHIBLI PASTORAL COUNTRY MANOR)
 * Phong cách điền trang đồng quê ấm áp:
 * - Khối móng đá cuội sa thạch rêu phong
 * - Tường vữa vàng kem viền khung dầm gỗ sồi già (Half-timbered Fachwerk)
 * - Mái ngói đất nung ấm áp (#b84830) có ống khói đá
 * - Cửa sổ kính hoa đồng với bồn hoa phong lữ rực rỡ và rèm ca-rô
 * - Hiên nhà gỗ mộc mạc có đèn lồng dầu và ghế nghỉ
 */
export function createModernFarmhouse(scene, shadows, position = { x: -35, y: 0, z: 85 }, rotationY = 0) {
  const root = new TransformNode('ghibli-country-manor-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.rotation.y = rotationY;

  const mats = {
    stoneBase: makeMat(scene, 'manor-stone-base', '#9c8e80', null, 0.15),
    stuccoCream: makeMat(scene, 'manor-stucco-cream', '#fbf4e2', null, 0.2),
    timberDark: makeMat(scene, 'manor-timber-dark', '#422415', null, 0.2),
    terracottaRoof: makeMat(scene, 'manor-terracotta-roof', '#b84830', null, 0.35),
    timberFloor: makeMat(scene, 'manor-timber-floor', '#8d5b32', null, 0.2),
    glass: makeMat(scene, 'manor-glass', '#bae6fd', '#38bdf8', 0.8),
    flowerRed: makeMat(scene, 'manor-flower-red', '#ef4444', '#dc2626', 0.5),
    warmLight: makeMat(scene, 'manor-porch-light', '#fef08a', '#facc15', 0.9),
  };
  mats.glass.alpha = 0.82;

  // Bệ móng đá cuội sa thạch nâng cao 0.5m
  const plinth = MeshBuilder.CreateBox('farmhouse-plinth', { width: 14.4, height: 0.55, depth: 10.4 }, scene);
  plinth.position.y = 0.28;
  plinth.material = mats.stoneBase;
  plinth.parent = root;
  plinth.receiveShadows = true;

  // Thân nhà 2 tầng vách vàng kem
  const mainBody = MeshBuilder.CreateBox('farmhouse-body', { width: 13.8, height: 5.6, depth: 9.8 }, scene);
  mainBody.position.y = 3.35;
  mainBody.material = mats.stuccoCream;
  mainBody.parent = root;
  mainBody.receiveShadows = true;
  shadows?.addShadowCaster(mainBody);

  // Dầm gỗ sồi viền các góc tường (Fachwerk)
  [-6.8, 6.8].forEach((bx, i) => {
    [-4.8, 4.8].forEach((bz, j) => {
      const cornerPost = MeshBuilder.CreateBox(`manor-post-${i}-${j}`, { width: 0.35, height: 5.6, depth: 0.35 }, scene);
      cornerPost.position.set(bx, 3.35, bz);
      cornerPost.material = mats.timberDark;
      cornerPost.parent = root;
    });
  });

  // Dầm ngang giữa tầng 1 và tầng 2
  const midBeam = MeshBuilder.CreateBox('manor-mid-beam', { width: 14.0, height: 0.3, depth: 10.0 }, scene);
  midBeam.position.set(0, 3.4, 0);
  midBeam.material = mats.timberDark;
  midBeam.parent = root;

  // Mái ngói đất nung chữ A dốc ấm áp
  const roof = MeshBuilder.CreateCylinder('farmhouse-roof', {
    diameter: 11.4,
    height: 14.6,
    tessellation: 3,
  }, scene);
  roof.rotation.z = Math.PI / 2;
  roof.rotation.y = Math.PI / 2;
  roof.scaling.set(0.66, 1.0, 1.15);
  roof.position.set(0, 7.8, 0);
  roof.material = mats.terracottaRoof;
  roof.parent = root;
  shadows?.addShadowCaster(roof);

  // Ống khói đá cuội cổ kính
  const chimney = MeshBuilder.CreateBox('farmhouse-chimney', { width: 1.4, height: 4.4, depth: 1.4 }, scene);
  chimney.position.set(4.2, 8.4, 2.0);
  chimney.material = mats.stoneBase;
  chimney.parent = root;
  shadows?.addShadowCaster(chimney);

  // Hiên nhà trước (Front Porch) lát gỗ
  const porchFloor = MeshBuilder.CreateBox('farmhouse-porch-floor', { width: 10.5, height: 0.22, depth: 3.4 }, scene);
  porchFloor.position.set(0, 0.62, 5.8);
  porchFloor.material = mats.timberFloor;
  porchFloor.parent = root;

  // 4 Cột hiên bằng gỗ sồi sậm
  [-4.6, -1.5, 1.5, 4.6].forEach((cx, idx) => {
    const col = MeshBuilder.CreateBox(`porch-col-${idx}`, { width: 0.3, height: 3.2, depth: 0.3 }, scene);
    col.position.set(cx, 2.2, 7.2);
    col.material = mats.timberDark;
    col.parent = root;
  });

  // Mái che hiên ngói đất nung
  const porchRoof = MeshBuilder.CreateBox('porch-roof', { width: 11.2, height: 0.32, depth: 3.6 }, scene);
  porchRoof.position.set(0, 3.8, 5.8);
  porchRoof.rotation.x = 0.12;
  porchRoof.material = mats.terracottaRoof;
  porchRoof.parent = root;

  // Cửa chính gỗ sồi
  const door = MeshBuilder.CreateBox('farmhouse-front-door', { width: 1.8, height: 2.8, depth: 0.15 }, scene);
  door.position.set(0, 2.0, 4.95);
  door.material = mats.timberDark;
  door.parent = root;

  // Cửa sổ kính viền gỗ sồi và bồn hoa rực rỡ
  [
    [-3.4, 2.2, 4.95],
    [3.4, 2.2, 4.95],
    [-3.4, 4.6, 4.95],
    [0, 4.6, 4.95],
    [3.4, 4.6, 4.95],
  ].forEach(([wx, wy, wz], idx) => {
    const winFrame = MeshBuilder.CreateBox(`window-frame-${idx}`, { width: 1.6, height: 1.8, depth: 0.1 }, scene);
    winFrame.position.set(wx, wy, wz);
    winFrame.material = mats.timberDark;
    winFrame.parent = root;

    const winGlass = MeshBuilder.CreateBox(`window-glass-${idx}`, { width: 1.35, height: 1.55, depth: 0.12 }, scene);
    winGlass.position.set(wx, wy, wz);
    winGlass.material = mats.glass;
    winGlass.parent = root;

    // Bồn hoa dưới cửa sổ tầng 1
    if (wy < 3.0) {
      const fb = MeshBuilder.CreateBox(`manor-fb-${idx}`, { width: 1.6, height: 0.35, depth: 0.45 }, scene);
      fb.position.set(wx, wy - 1.0, wz + 0.2);
      fb.material = mats.timberDark;
      fb.parent = root;

      for (let f = 0; f < 3; f++) {
        const fl = MeshBuilder.CreateSphere(`manor-fl-${idx}-${f}`, { diameter: 0.3, segments: 6 }, scene);
        fl.position.set(wx - 0.45 + f * 0.45, wy - 0.75, wz + 0.2);
        fl.material = mats.flowerRed;
        fl.parent = root;
      }
    }
  });

  // Đèn lồng hiên nhà tỏa ánh sáng ấm áp
  const porchLamp = MeshBuilder.CreateSphere('porch-lamp-bulb', { diameter: 0.5, segments: 10 }, scene);
  porchLamp.position.set(0, 3.4, 6.2);
  porchLamp.material = mats.warmLight;
  porchLamp.parent = root;

  return root;
}

/**
 * 2. KHO THÓC ĐỎ KINH ĐIỂN NÔNG TRẠI MXH (CLASSIC RED BARN)
 * Biểu tượng số 1 của game nông trại thế giới (Hay Day / FarmVille)
 * - Tường gỗ sơn đỏ burgundy viền nẹp chữ X trắng
 * - Mái vòm Mansard 2 tầng cao ráo
 * - Cửa kho trượt lớn và cửa áp mái lộ kiện rơm vàng
 */
export function createClassicRedBarn(scene, shadows, position = { x: 42, y: 0, z: 85 }, rotationY = 0) {
  const root = new TransformNode('classic-red-barn-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.rotation.y = rotationY;

  const mats = {
    redWood: makeMat(scene, 'barn-red-wood', '#b91c1c', null, 0.25),
    whiteTrim: makeMat(scene, 'barn-white-trim', '#ffffff', null, 0.4),
    roofGray: makeMat(scene, 'barn-roof-gray', '#475569', null, 0.35),
    strawGold: makeMat(scene, 'barn-straw-gold', '#fbbf24', '#f59e0b', 0.2),
    ironTrack: makeMat(scene, 'barn-iron-track', '#1e293b', null, 0.6),
  };

  // 1. Thân nhà kho chính màu đỏ burgundy
  const body = MeshBuilder.CreateBox('barn-body', { width: 14.8, height: 6.8, depth: 11.2 }, scene);
  body.position.y = 3.4;
  body.material = mats.redWood;
  body.parent = root;
  body.receiveShadows = true;
  shadows?.addShadowCaster(body);

  // 2. Mái vòm Mansard kinh điển
  const roof = MeshBuilder.CreateCylinder('barn-mansard-roof', {
    diameter: 13.8,
    height: 15.4,
    tessellation: 6,
  }, scene);
  roof.rotation.z = Math.PI / 2;
  roof.rotation.y = Math.PI / 2;
  roof.scaling.set(0.72, 1.0, 1.08);
  roof.position.set(0, 9.2, 0);
  roof.material = mats.roofGray;
  roof.parent = root;
  shadows?.addShadowCaster(roof);

  // 3. Cửa kho lớn trượt ray kim loại
  const doorW = 4.2;
  const doorH = 4.6;
  const mainDoor = MeshBuilder.CreateBox('barn-main-door', { width: doorW, height: doorH, depth: 0.25 }, scene);
  mainDoor.position.set(0, 2.3, 5.65);
  mainDoor.material = mats.whiteTrim;
  mainDoor.parent = root;

  // Nẹp gỗ chữ X trang trí cửa kho
  [-1, 1].forEach(side => {
    const brace = MeshBuilder.CreateBox(`barn-door-x-${side}`, { width: 0.3, height: doorH * 1.15, depth: 0.32 }, scene);
    brace.position.set(0, 2.3, 5.7);
    brace.rotation.z = side * 0.72;
    brace.material = mats.redWood;
    brace.parent = root;
  });

  // Ray trượt sắt phía trên cửa
  const track = MeshBuilder.CreateBox('barn-door-track', { width: 7.2, height: 0.2, depth: 0.3 }, scene);
  track.position.set(0, 4.8, 5.75);
  track.material = mats.ironTrack;
  track.parent = root;

  // 4. Ô cửa áp mái tầng 2 (Hay Loft) hé lộ kiện rơm khô vàng
  const loftDoor = MeshBuilder.CreateBox('barn-loft-door', { width: 2.6, height: 2.6, depth: 0.3 }, scene);
  loftDoor.position.set(0, 7.4, 5.65);
  loftDoor.material = mats.whiteTrim;
  loftDoor.parent = root;

  const hayBale = MeshBuilder.CreateBox('barn-loft-hay', { width: 2.1, height: 1.8, depth: 1.2 }, scene);
  hayBale.position.set(0, 7.2, 5.4);
  hayBale.material = mats.strawGold;
  hayBale.parent = root;

  // 5. Nẹp viền trắng chữ X hai bên góc tường nhà kho
  [-7.3, 7.3].forEach((wx, i) => {
    const cornerTrim = MeshBuilder.CreateBox(`barn-corner-trim-${i}`, { width: 0.4, height: 6.8, depth: 0.4 }, scene);
    cornerTrim.position.set(wx, 3.4, 5.55);
    cornerTrim.material = mats.whiteTrim;
    cornerTrim.parent = root;
  });

  return root;
}

/**
 * 3. SẠP HÀNG GIAO THƯƠNG BÊN ĐƯỜNG (ROADSIDE SHOP STAND)
 * Nơi bạn bè ghé thăm nông trại mua sắm trực tiếp
 * - Mái che sọc trắng - cam pastel (Awning)
 * - Kệ gỗ 3 tầng trưng bày các thùng hàng nông sản thật (thùng cà chua, dưa, lúa mì)
 * - Bảng hiệu gỗ khắc "ROADSIDE SHOP"
 */
export function createRoadsideShop(scene, shadows, position = { x: -8, y: 0, z: 58 }, rotationY = 0) {
  const root = new TransformNode('roadside-shop-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.rotation.y = rotationY;
  root.metadata = { interactive: true, type: 'roadside-shop' };

  const mats = {
    standWood: makeMat(scene, 'shop-stand-wood', '#b45309', null, 0.25),
    crateWood: makeMat(scene, 'shop-crate-wood', '#d97706', null, 0.2),
    awningStripe1: makeMat(scene, 'shop-awning-orange', '#fb923c', '#ea580c', 0.4),
    awningStripe2: makeMat(scene, 'shop-awning-white', '#ffffff', null, 0.4),
    signBoard: makeMat(scene, 'shop-sign-board', '#78350f', null, 0.2),
    tomatoRed: makeMat(scene, 'shop-item-tomato', '#ef4444', '#dc2626', 0.5),
    melonGreen: makeMat(scene, 'shop-item-melon', '#22c55e', '#16a34a', 0.5),
    wheatGold: makeMat(scene, 'shop-item-wheat', '#fbbf24', '#f59e0b', 0.3),
    carrotOrange: makeMat(scene, 'shop-item-carrot', '#f97316', '#ea580c', 0.4),
  };

  // 1. Quầy bán hàng khung gỗ 3 tầng
  const counter = MeshBuilder.CreateBox('shop-counter', { width: 5.6, height: 1.35, depth: 2.2 }, scene);
  counter.position.y = 0.68;
  counter.material = mats.standWood;
  counter.parent = root;
  counter.receiveShadows = true;
  shadows?.addShadowCaster(counter);

  // Kệ gỗ vát nghiêng trưng bày thùng hàng
  const displayShelf = MeshBuilder.CreateBox('shop-shelf', { width: 5.4, height: 0.15, depth: 1.8 }, scene);
  displayShelf.position.set(0, 1.45, 0.1);
  displayShelf.rotation.x = -0.22;
  displayShelf.material = mats.standWood;
  displayShelf.parent = root;

  // 2. 4 Thùng gỗ (Wooden Crates) chứa nông sản tươi
  const crateCoords = [
    { x: -1.9, z: 0.2, mat: mats.tomatoRed, label: 'CÀ CHUA' },
    { x: -0.65, z: 0.2, mat: mats.carrotOrange, label: 'CÀ RỐT' },
    { x: 0.65, z: 0.2, mat: mats.melonGreen, label: 'DƯA HẤU' },
    { x: 1.9, z: 0.2, mat: mats.wheatGold, label: 'LÚA MÌ' },
  ];

  crateCoords.forEach((c, idx) => {
    const crate = MeshBuilder.CreateBox(`shop-crate-${idx}`, { width: 1.1, height: 0.45, depth: 0.85 }, scene);
    crate.position.set(c.x, 1.7, c.z);
    crate.rotation.x = -0.22;
    crate.material = mats.crateWood;
    crate.parent = root;

    // Sản phẩm nông sản xếp đầy bên trong thùng
    const produce = MeshBuilder.CreateBox(`shop-produce-${idx}`, { width: 0.95, height: 0.35, depth: 0.7 }, scene);
    produce.position.set(c.x, 1.8, c.z);
    produce.rotation.x = -0.22;
    produce.material = c.mat;
    produce.parent = root;
  });

  // 3. Mái che sọc (Awning) uốn vòm che nắng
  const awning = MeshBuilder.CreateCylinder('shop-awning', {
    diameter: 2.8,
    height: 5.8,
    tessellation: 16,
    arc: 0.48,
  }, scene);
  awning.rotation.z = Math.PI / 2;
  awning.rotation.y = Math.PI;
  awning.position.set(0, 3.4, 0.4);
  awning.material = mats.awningStripe1;
  awning.parent = root;

  // 2 Cột gỗ đỡ mái che
  [-2.6, 2.6].forEach((px, i) => {
    const pole = MeshBuilder.CreateCylinder(`shop-pole-${i}`, { height: 2.4, diameter: 0.16, tessellation: 10 }, scene);
    pole.position.set(px, 2.2, 0.9);
    pole.material = mats.standWood;
    pole.parent = root;
  });

  // 4. Bảng hiệu gỗ chữ nổi "ROADSIDE SHOP"
  const signDT = new DynamicTexture('roadside-sign-tex', { width: 1024, height: 256 }, scene, true);
  signDT.hasAlpha = true;
  const sctx = signDT.getContext();
  sctx.fillStyle = '#78350f';
  sctx.beginPath();
  sctx.roundRect(16, 16, 992, 224, 32);
  sctx.fill();
  sctx.strokeStyle = '#fef08a';
  sctx.lineWidth = 12;
  sctx.stroke();
  sctx.font = '900 68px "Nunito", "Segoe UI", Arial, sans-serif';
  sctx.fillStyle = '#fffdf0';
  sctx.fillText('ROADSIDE SHOP', 240, 150);
  signDT.update();

  const signMat = new StandardMaterial('roadside-sign-mat', scene);
  signMat.diffuseTexture = signDT;
  signMat.opacityTexture = signDT;
  signMat.emissiveColor = new Color3(0.3, 0.2, 0.1);
  signMat.disableLighting = true;

  const signPlane = MeshBuilder.CreatePlane('roadside-sign-mesh', { width: 4.6, height: 1.15 }, scene);
  signPlane.position.set(0, 3.8, 1.25);
  signPlane.material = signMat;
  signPlane.parent = root;

  return root;
}

/**
 * 4. BẢNG ĐƠN HÀNG XE TẢI & CHIẾC XE BÁN TẢI ĐỎ (TRUCK DELIVERY STATION)
 * Nơi giao nhận đơn hàng nông sản đổi lấy tiền vàng và sao kinh nghiệm
 * - Bảng gỗ cắm các đơn đặt hàng dán giấy
 * - Chiếc xe bán tải cổ điển màu đỏ (Vintage Red Farm Truck) đỗ cạnh đường
 */
export function createDeliveryTruckStation(scene, shadows, position = { x: 8, y: 0, z: 58 }, rotationY = 0) {
  const root = new TransformNode('delivery-station-root', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.rotation.y = rotationY;
  root.metadata = { interactive: true, type: 'delivery-truck' };

  const mats = {
    boardWood: makeMat(scene, 'truck-board-wood', '#78350f', null, 0.25),
    paperNote: makeMat(scene, 'truck-order-paper', '#fffbeb', '#fef08a', 0.2),
    truckRed: makeMat(scene, 'truck-body-red', '#dc2626', '#b91c1c', 0.6),
    truckChrome: makeMat(scene, 'truck-chrome', '#e2e8f0', null, 0.8),
    truckGlass: makeMat(scene, 'truck-glass', '#bae6fd', '#38bdf8', 0.8),
    truckTire: makeMat(scene, 'truck-tire', '#1e293b', null, 0.1),
    cargoBox: makeMat(scene, 'truck-cargo-box', '#d97706', null, 0.2),
  };

  // 1. BẢNG ĐƠN HÀNG GỖ (ORDER BULLETIN BOARD)
  const boardPostL = MeshBuilder.CreateCylinder('board-post-l', { height: 3.4, diameter: 0.22, tessellation: 12 }, scene);
  boardPostL.position.set(-1.8, 1.7, 0);
  boardPostL.material = mats.boardWood;
  boardPostL.parent = root;

  const boardPostR = MeshBuilder.CreateCylinder('board-post-r', { height: 3.4, diameter: 0.22, tessellation: 12 }, scene);
  boardPostR.position.set(1.8, 1.7, 0);
  boardPostR.material = mats.boardWood;
  boardPostR.parent = root;

  const boardPanel = MeshBuilder.CreateBox('board-panel', { width: 3.8, height: 2.2, depth: 0.2 }, scene);
  boardPanel.position.set(0, 2.2, 0);
  boardPanel.material = mats.boardWood;
  boardPanel.parent = root;
  boardPanel.receiveShadows = true;

  // 6 Mảnh giấy đơn hàng dán trên bảng
  [-1.1, 0, 1.1].forEach((px) => {
    [1.7, 2.5].forEach((py) => {
      const note = MeshBuilder.CreateBox(`order-note-${px}-${py}`, { width: 0.85, height: 0.65, depth: 0.05 }, scene);
      note.position.set(px, py, 0.12);
      note.material = mats.paperNote;
      note.parent = root;
    });
  });

  // 2. CHIẾC XE BÁN TẢI ĐỎ NÔNG TRANG (RED VINTAGE FARM TRUCK)
  const truckRoot = new TransformNode('vintage-farm-truck', scene);
  truckRoot.position.set(4.8, 0, 0.2);
  truckRoot.rotation.y = -Math.PI / 12;
  truckRoot.parent = root;

  // Thân xe cabin bo tròn
  const truckCabin = MeshBuilder.CreateBox('truck-cabin', { width: 2.8, height: 1.8, depth: 2.2 }, scene);
  truckCabin.position.set(0, 1.35, 0);
  truckCabin.material = mats.truckRed;
  truckCabin.parent = truckRoot;
  shadows?.addShadowCaster(truckCabin);

  // Kính chắn gió
  const truckWindshield = MeshBuilder.CreateBox('truck-windshield', { width: 1.9, height: 0.9, depth: 0.1 }, scene);
  truckWindshield.position.set(0, 1.6, 1.12);
  truckWindshield.material = mats.truckGlass;
  truckWindshield.parent = truckRoot;

  // Mũi xe (Hood) phía trước
  const truckHood = MeshBuilder.CreateBox('truck-hood', { width: 2.2, height: 0.9, depth: 1.8 }, scene);
  truckHood.position.set(0, 0.9, 1.8);
  truckHood.material = mats.truckRed;
  truckHood.parent = truckRoot;

  // Lưới tản nhiệt Chrome phía trước
  const grill = MeshBuilder.CreateBox('truck-grill', { width: 1.6, height: 0.6, depth: 0.1 }, scene);
  grill.position.set(0, 0.85, 2.72);
  grill.material = mats.truckChrome;
  grill.parent = truckRoot;

  // 2 Đèn pha tròn vàng
  [-0.9, 0.9].forEach((hx, idx) => {
    const lamp = MeshBuilder.CreateCylinder(`truck-headlight-${idx}`, { diameter: 0.45, height: 0.15, tessellation: 14 }, scene);
    lamp.rotation.x = Math.PI / 2;
    lamp.position.set(hx, 0.9, 2.75);
    lamp.material = makeMat(scene, `truck-hl-${idx}`, '#fef08a', '#facc15');
    lamp.parent = truckRoot;
  });

  // Thùng xe phía sau chở hàng
  const truckBed = MeshBuilder.CreateBox('truck-bed', { width: 2.6, height: 0.9, depth: 3.2 }, scene);
  truckBed.position.set(0, 0.9, -2.4);
  truckBed.material = mats.truckRed;
  truckBed.parent = truckRoot;

  // Các thùng gỗ chở hàng đầy ắp trên thùng xe
  [
    { x: -0.6, y: 1.5, z: -2.0 },
    { x: 0.6, y: 1.5, z: -2.0 },
    { x: 0, y: 1.5, z: -3.0 },
    { x: 0, y: 2.2, z: -2.5 },
  ].forEach((cpos, idx) => {
    const box = MeshBuilder.CreateBox(`cargo-crate-${idx}`, { width: 0.95, height: 0.7, depth: 0.95 }, scene);
    box.position.set(cpos.x, cpos.y, cpos.z);
    box.material = mats.cargoBox;
    box.parent = truckRoot;
  });

  // 4 Bánh xe lốp cao su mâm chrome
  [
    [-1.4, 0.5, 1.5],
    [1.4, 0.5, 1.5],
    [-1.4, 0.5, -2.6],
    [1.4, 0.5, -2.6],
  ].forEach(([wx, wy, wz], idx) => {
    const wheel = MeshBuilder.CreateCylinder(`truck-wheel-${idx}`, { diameter: 1.05, height: 0.42, tessellation: 20 }, scene);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    wheel.material = mats.truckTire;
    wheel.parent = truckRoot;
  });

  return { root, truck: truckRoot };
}

/**
 * 5. HÀNG RÀO GỖ TRẮNG NÔNG TRANG NGOẠI Ô (WHITE PICKET FENCE)
 */
export function createWhitePicketFence(scene, shadows, length = 18, position = { x: 0, y: 0, z: 0 }, rotationY = 0, parent = null) {
  const root = new TransformNode('white-picket-fence-line', scene);
  root.position.set(position.x, position.y || 0, position.z);
  root.rotation.y = rotationY;
  if (parent) root.parent = parent;

  const matFence = makeMat(scene, 'white-picket-mat', '#f8fafc', null, 0.35);

  // 2 Xà ngang gỗ đôi
  [0.45, 0.95].forEach((ry, idx) => {
    const rail = MeshBuilder.CreateBox(`fence-rail-${idx}`, { width: length, height: 0.12, depth: 0.08 }, scene);
    rail.position.set(0, ry, 0);
    rail.material = matFence;
    rail.parent = root;
  });

  // Các cọc rào đứng nhọn đầu cách mỗi 0.65m
  const half = length / 2;
  for (let px = -half + 0.35; px <= half - 0.35; px += 0.65) {
    const picket = MeshBuilder.CreateBox(`fence-picket-${px.toFixed(1)}`, { width: 0.18, height: 1.2, depth: 0.05 }, scene);
    picket.position.set(px, 0.6, 0);
    picket.material = matFence;
    picket.parent = root;
    shadows?.addShadowCaster(picket);
  }

  return root;
}
