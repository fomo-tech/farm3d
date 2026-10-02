import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { MODEL_PATHS, spawnModelSync } from '../../rendering/ModelAssetManager.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial } from '../../rendering/PlayTogetherTheme.js';

function makeMat(scene, name, hex, emissiveHex = null) {
  return createToyMaterial(scene, name, hex, { emissiveHex, specularPower: 80, specularLevel: 0.5 });
}

function worldLabel(scene, text, parent, color, subtitle = '') {
  const texture = new DynamicTexture(`label-venue-${text}`, { width: 1024, height: 280 }, scene, true);
  texture.hasAlpha = true;
  const ctx = texture.getContext();
  ctx.clearRect(0, 0, 1024, 280);

  // Biển hiệu Pop-art Play Together trắng sứ viền màu kẹo ngọt bo tròn múp míp
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(16, 16, 992, 248, 56);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 16;
  ctx.stroke();

  // Viền chỉ phụ bên trong
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 4;
  ctx.strokeRect(34, 34, 956, 212);

  // Tiêu đề chính đậm màu than hiện đại
  texture.drawText(text, null, 142, '900 68px "Segoe UI", Arial, sans-serif', '#0f172a', null, true, true);
  if (subtitle) {
    texture.drawText(subtitle, null, 215, 'bold 36px "Segoe UI", Arial, sans-serif', color, null, true, true);
  }

  const labelMat = new StandardMaterial(`venue-label-mat-${text}`, scene);
  labelMat.diffuseTexture = texture;
  labelMat.opacityTexture = texture;
  labelMat.emissiveColor = Color3.FromHexString(color).scale(0.35);
  labelMat.disableLighting = true;

  const plane = MeshBuilder.CreatePlane(`venue-plane-${text}`, { width: 8.6, height: 2.35 }, scene);
  plane.position.set(0, 8.8, 0);
  plane.material = labelMat;
  plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
  plane.isPickable = false;
  plane.parent = parent;

  return plane;
}

export function createVenues3DFactory(scene, shadows) {
  return {
    /**
     * 1. CỬA HÀNG NÔNG VỤ & HẠT GIỐNG ĐỒNG QUÊ (FARM SUPPLIES SHOP)
     * Kiến trúc nhà gỗ 2 tầng mộc mạc phong cách Anh Quốc với hiên che, thùng táo, bao lúa mì
     */
    createSupplies(position = { x: -26, y: 0, z: -135 }) {
      const root = new TransformNode('venue-supplies', scene);
      root.metadata = { venue: 'supplies' };
      root.position.set(position.x, position.y || 0, position.z);
      root.rotation.y = Math.PI / 4; // Hướng nghiêng đón người chơi từ đại lộ

      const matStoneBase = makeMat(scene, 'supplies-stone-base', '#64748b');
      const matTimber = makeMat(scene, 'supplies-timber-warm', '#78350f');
      const matWallPlank = makeMat(scene, 'supplies-wall-plank', '#fef3c7');
      const matRoofTile = makeMat(scene, 'supplies-roof-moss', '#15803d'); // Ngói rêu xanh đồng quê
      const matAwning = makeMat(scene, 'supplies-awning-stripes', '#16a34a');

      // 1. Đế móng đá hoa cương
      const base = MeshBuilder.CreateBox('supplies-base-plinth', { width: 11.2, height: 0.6, depth: 8.4 }, scene);
      base.position.set(0, 0.3, 0);
      base.material = matStoneBase;
      base.parent = root;

      // 2. Thân nhà 2 tầng ốp gỗ ấm cúng
      const groundFloor = MeshBuilder.CreateBox('supplies-floor-1', { width: 10.4, height: 4.4, depth: 7.6 }, scene);
      groundFloor.position.set(0, 2.6, 0);
      groundFloor.material = matWallPlank;
      groundFloor.parent = root;

      // Xà gỗ định hình phong cách Tudor (Half-timber beams)
      [-5.0, 0, 5.0].forEach(bx => {
        const beam = MeshBuilder.CreateBox(`supplies-beam-${bx}`, { width: 0.45, height: 4.4, depth: 7.8 }, scene);
        beam.position.set(bx, 2.6, 0);
        beam.material = matTimber;
        beam.parent = root;
      });

      // 3. Mái ngói dốc phong cách cổ tích Châu Âu
      const roof = MeshBuilder.CreateCylinder('supplies-gable-roof', {
        diameter: 11.4,
        height: 8.4,
        tessellation: 3,
      }, scene);
      roof.rotation.z = Math.PI / 6;
      roof.rotation.y = Math.PI / 2;
      roof.scaling.set(0.85, 0.6, 1.0);
      roof.position.set(0, 6.6, 0);
      roof.material = matRoofTile;
      roof.parent = root;

      // 4. Hiên che cửa hàng & Bậc thang gỗ đón khách
      spawnModelSync(scene, MODEL_PATHS.town.stairsWood, {
        position: new Vector3(0, 0, 4.4),
        rotation: new Vector3(0, Math.PI, 0),
        scaling: new Vector3(1.2, 1.2, 1.2),
        shadows,
        name: 'supplies-entrance-stairs',
      });

      const awning = MeshBuilder.CreateBox('supplies-front-awning', { width: 7.2, height: 0.25, depth: 2.2 }, scene);
      awning.position.set(0, 3.6, 4.8);
      awning.rotation.x = 0.22;
      awning.material = matAwning;
      awning.parent = root;

      // 5. Đạo cụ trưng bày nông sản trước hiên
      // Xe cút kít gỗ chở bí ngô và nông sản
      spawnModelSync(scene, MODEL_PATHS.town.cart, {
        position: new Vector3(-4.4, 0.4, 4.6),
        rotation: new Vector3(0, 0.35, 0),
        scaling: new Vector3(1.2, 1.2, 1.2),
        shadows,
        name: 'supplies-cart-produce',
      });

      // Đèn lồng cổ kính trước hiên
      spawnModelSync(scene, MODEL_PATHS.town.lantern, {
        position: new Vector3(3.6, 0.4, 4.6),
        scaling: new Vector3(1.15, 1.15, 1.15),
        name: 'supplies-front-lantern',
      });

      // Củ cà rốt Chibi khổng lồ trên nóc
      const roofCarrot = new TransformNode('supplies-roof-carrot', scene);
      roofCarrot.position.set(0, 9.2, 0);
      roofCarrot.parent = root;

      const cBody = MeshBuilder.CreateCylinder('supplies-carrot-cone', { height: 2.2, diameterTop: 0.95, diameterBottom: 0.2 }, scene);
      cBody.position.y = 0.9;
      cBody.material = createToyMaterial(scene, 'mat-toy-roof-carrot', PLAY_TOGETHER_PALETTE.farm.carrotOrange, { specularPower: 96 });
      cBody.parent = roofCarrot;

      const cTop = MeshBuilder.CreateSphere('supplies-carrot-top', { diameter: 0.95 }, scene);
      cTop.position.y = 2.0;
      cTop.material = cBody.material;
      cTop.parent = roofCarrot;

      [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((ang, idx) => {
        const cLeaf = MeshBuilder.CreateSphere(`supplies-leaf-${idx}`, { diameterX: 0.35, diameterY: 0.9, diameterZ: 0.15 }, scene);
        cLeaf.position.set(Math.cos(ang) * 0.25, 2.4, Math.sin(ang) * 0.25);
        cLeaf.rotation.x = 0.45;
        cLeaf.rotation.y = ang;
        cLeaf.material = createToyMaterial(scene, 'mat-toy-roof-leaf', PLAY_TOGETHER_PALETTE.farm.leafGreen);
        cLeaf.parent = roofCarrot;
      });

      scene.onBeforeRenderObservable.add(() => {
        if (!roofCarrot.isDisposed()) {
          roofCarrot.rotation.y = performance.now() * 0.0012;
        }
      });

      worldLabel(scene, 'SIÊU THỊ NÔNG VỤ', root, '#16a34a', 'HẠT GIỐNG & VẬT TƯ MART');

      root.getChildMeshes().forEach(mesh => {
        mesh.metadata = { ...(mesh.metadata || {}), venue: 'supplies' };
        shadows?.addShadowCaster(mesh);
      });
      return root;
    },

    /**
     * 2. SALON THỜI TRANG & MAY MẶC PARISIENNE (BOUTIQUE FASHION SALON)
     * Biệt thự Pháp cổ điển thanh lịch, cửa sổ kính vòm lớn, ban công hoa hồng
     */
    createFashion(position = { x: 26, y: 0, z: -135 }) {
      const root = new TransformNode('venue-fashion', scene);
      root.metadata = { venue: 'fashion' };
      root.position.set(position.x, position.y || 0, position.z);
      root.rotation.y = -Math.PI / 4; // Hướng nghiêng đón người chơi từ đại lộ

      const matStoneWall = makeMat(scene, 'fashion-stone-cream', '#fff1f2'); // Đá trắng hồng ngà Paris
      const matTrim = makeMat(scene, 'fashion-trim-gold', '#fbcfe8', '#f43f5e');
      const matMansardRoof = makeMat(scene, 'fashion-mansard-blue', '#0284c7'); // Mái Mansard xanh đá phiến Pháp
      const matAwning = makeMat(scene, 'fashion-awning-striped', '#ec4899');
      const matGlass = makeMat(scene, 'fashion-glass-crystal', '#e0f2fe', '#38bdf8');
      const matDress = makeMat(scene, 'fashion-dress-silk', '#db2777', '#f43f5e');

      // 1. Đế móng đá hoa cương
      const base = MeshBuilder.CreateBox('fashion-base', { width: 11.0, height: 0.5, depth: 8.2 }, scene);
      base.position.set(0, 0.25, 0);
      base.material = makeMat(scene, 'fashion-plinth', '#94a3b8');
      base.parent = root;

      // 2. Tầng 1: Showroom trưng bày cửa kính lớn
      const body = MeshBuilder.CreateBox('fashion-main-body', { width: 10.2, height: 5.6, depth: 7.4 }, scene);
      body.position.set(0, 3.1, 0);
      body.material = matStoneWall;
      body.parent = root;

      // Mái vòm Mansard Pháp cổ điển
      const roof = MeshBuilder.CreateCylinder('fashion-mansard', {
        diameter: 11.2,
        height: 7.6,
        tessellation: 4,
      }, scene);
      roof.rotation.z = Math.PI / 4;
      roof.rotation.y = Math.PI / 4;
      roof.scaling.set(0.65, 0.52, 0.95);
      roof.position.set(0, 6.8, 0);
      roof.material = matMansardRoof;
      roof.parent = root;

      // 3. Bậc thang đá hoa cương dẫn vào salon
      spawnModelSync(scene, MODEL_PATHS.town.stairsStone, {
        position: new Vector3(0, 0, 4.3),
        rotation: new Vector3(0, Math.PI, 0),
        scaling: new Vector3(1.2, 1.2, 1.2),
        shadows,
        name: 'fashion-stone-stairs',
      });

      // Mái hiên lụa hồng Parisienne
      const awning = MeshBuilder.CreateBox('fashion-silk-awning', { width: 8.4, height: 0.35, depth: 2.2 }, scene);
      awning.rotation.x = 0.28;
      awning.position.set(0, 3.8, 4.4);
      awning.material = matAwning;
      awning.parent = root;

      // Cửa sổ kính lớn trưng bày trang phục
      [-2.6, 2.6].forEach((wx, i) => {
        const win = MeshBuilder.CreateBox(`fashion-win-${i}`, { width: 2.8, height: 3.2, depth: 0.25 }, scene);
        win.position.set(wx, 2.4, 3.75);
        win.material = matGlass;
        win.parent = root;
      });

      // Ma-nơ-canh diện váy dạ hội lộng lẫy
      const mannequin = MeshBuilder.CreateCylinder('fashion-mannequin', {
        height: 2.2,
        diameterTop: 0.45,
        diameterBottom: 1.4,
        tessellation: 14,
      }, scene);
      mannequin.position.set(-2.6, 1.9, 3.2);
      mannequin.material = matDress;
      mannequin.parent = root;

      // Đèn lồng đôi hoàng gia
      spawnModelSync(scene, MODEL_PATHS.town.lantern, {
        position: new Vector3(3.8, 0.4, 4.4),
        scaling: new Vector3(1.15, 1.15, 1.15),
        name: 'fashion-lantern',
      });

      // Chiếc nơ bướm 3D hồng pastel khổng lồ trên nóc
      const bowRoot = new TransformNode('fashion-roof-bow', scene);
      bowRoot.position.set(0, 9.2, 0);
      bowRoot.parent = root;

      const matBow = createToyMaterial(scene, 'mat-toy-roof-bow', PLAY_TOGETHER_PALETTE.pastels.strawberryPink, {
        specularPower: 96,
        emissiveHex: '#fb7185',
        emissiveScale: 0.15,
      });
      const bowCenter = MeshBuilder.CreateSphere('bow-center', { diameter: 0.45 }, scene);
      bowCenter.material = matBow;
      bowCenter.parent = bowRoot;

      [-0.65, 0.65].forEach((bx, i) => {
        const wing = MeshBuilder.CreateSphere(`bow-wing-${i}`, { diameterX: 0.7, diameterY: 0.5, diameterZ: 0.3 }, scene);
        wing.position.set(bx, 0.05, 0);
        wing.rotation.z = i === 0 ? 0.2 : -0.2;
        wing.material = matBow;
        wing.parent = bowRoot;
      });

      scene.onBeforeRenderObservable.add(() => {
        if (!bowRoot.isDisposed()) {
          bowRoot.rotation.y = performance.now() * 0.0012;
        }
      });

      worldLabel(scene, 'TIỆM THỜI TRANG', root, '#f472b6', 'BOUTIQUE & PHỤ KIỆN CHIBI');

      root.getChildMeshes().forEach(mesh => {
        mesh.metadata = { ...(mesh.metadata || {}), venue: 'fashion' };
        shadows?.addShadowCaster(mesh);
      });
      return root;
    },

    /**
     * 3. SÒNG BẠC HOÀNG GIA MONTE CARLO (ROYAL LUCKY CASINO)
     * Cung điện giải trí cổ điển lộng lẫy, 4 cột đá hoa cương, thảm đỏ nhung và xúc xắc may mắn
     */
    createCasino(position = { x: -26, y: 0, z: -158 }) {
      const root = new TransformNode('venue-casino', scene);
      root.metadata = { venue: 'casino' };
      root.position.set(position.x, position.y || 0, position.z);
      root.rotation.y = Math.PI / 4;

      const matMarble = makeMat(scene, 'casino-marble-white', '#f8fafc');
      const matWall = makeMat(scene, 'casino-wall-royal', '#991b1b'); // Đỏ nhung hoàng gia
      const matGold = makeMat(scene, 'casino-gold-trim', '#fbbf24', '#f59e0b'); // Mạ vàng kim
      const matRoof = makeMat(scene, 'casino-roof-slate', '#1e293b');
      const matDice = makeMat(scene, 'casino-dice-ivory', '#ffffff', '#fefce8');
      const matPip = makeMat(scene, 'casino-pip-ruby', '#ef4444', '#dc2626');

      // 1. Thềm đá hoa cương và thảm đỏ đón khách
      const base = MeshBuilder.CreateBox('casino-base-plinth', { width: 12.2, height: 0.6, depth: 8.8 }, scene);
      base.position.set(0, 0.3, 0);
      base.material = matMarble;
      base.parent = root;

      // Thảm đỏ nhung trải dài
      const carpet = MeshBuilder.CreateBox('casino-red-carpet', { width: 3.4, height: 0.08, depth: 5.6 }, scene);
      carpet.position.set(0, 0.64, 4.4);
      carpet.material = matWall;
      carpet.parent = root;

      // 2. Tòa sảnh chính đỏ nhung
      const hall = MeshBuilder.CreateBox('casino-main-hall', { width: 11.4, height: 6.2, depth: 7.8 }, scene);
      hall.position.set(0, 3.4, 0);
      hall.material = matWall;
      hall.parent = root;

      // 3. Mái vòm hoàng gia mạ vàng
      const roof = MeshBuilder.CreateCylinder('casino-arch-dome', {
        diameter: 12.4,
        height: 8.2,
        tessellation: 16,
      }, scene);
      roof.rotation.z = Math.PI / 2;
      roof.rotation.y = Math.PI / 2;
      roof.scaling.set(0.48, 0.95, 1.0);
      roof.position.set(0, 6.8, 0);
      roof.material = matRoof;
      roof.parent = root;

      // 4 Cột trụ đá hoa cương uy nghiêm
      [-4.8, -1.6, 1.6, 4.8].forEach((cx, i) => {
        const pillar = MeshBuilder.CreateCylinder(`casino-pillar-${i}`, { height: 6.2, diameter: 0.75 }, scene);
        pillar.position.set(cx, 3.4, 4.0);
        pillar.material = matGold;
        pillar.parent = root;
      });

      // 4. Bậc thang đá hoa cương dẫn lên tiền sảnh
      spawnModelSync(scene, MODEL_PATHS.town.stairsStone, {
        position: new Vector3(0, 0, 4.6),
        rotation: new Vector3(0, Math.PI, 0),
        scaling: new Vector3(1.3, 1.2, 1.2),
        shadows,
        name: 'casino-stone-stairs',
      });

      // 5. Lát bánh Pizza 3D khổng lồ quay chậm trên nóc nhà (Giant Spinning Pizza Slice)
      const pizzaRoot = new TransformNode('casino-giant-pizza', scene);
      pizzaRoot.position.set(0, 8.8, 1.4);
      pizzaRoot.parent = root;

      const matCrust = createToyMaterial(scene, 'mat-toy-pizza-crust', '#d97706');
      const matCheese = createToyMaterial(scene, 'mat-toy-pizza-cheese', '#facc15', { emissiveHex: '#f59e0b', emissiveScale: 0.2 });
      const matPepp = createToyMaterial(scene, 'mat-toy-pizza-pepperoni', '#ef4444');

      const pizzaBase = MeshBuilder.CreateCylinder('pizza-slice-base', {
        height: 0.25,
        diameter: 3.2,
        tessellation: 3,
      }, scene);
      pizzaBase.rotation.x = Math.PI / 2;
      pizzaBase.material = matCheese;
      pizzaBase.parent = pizzaRoot;

      const crust = MeshBuilder.CreateCylinder('pizza-crust-rim', {
        height: 0.38,
        diameter: 0.42,
      }, scene);
      crust.rotation.z = Math.PI / 2;
      crust.position.set(0, 1.4, 0);
      crust.scaling.x = 4.2;
      crust.material = matCrust;
      crust.parent = pizzaRoot;

      [
        { x: -0.4, y: 0.6 },
        { x: 0.4, y: 0.6 },
        { x: 0, y: 0 },
        { x: 0, y: -0.6 },
      ].forEach((pp, i) => {
        const pepp = MeshBuilder.CreateCylinder(`pepp-${i}`, { height: 0.28, diameter: 0.48 }, scene);
        pepp.rotation.x = Math.PI / 2;
        pepp.position.set(pp.x, pp.y, 0.05);
        pepp.material = matPepp;
        pepp.parent = pizzaRoot;
      });

      scene.onBeforeRenderObservable.add(() => {
        if (!pizzaRoot.isDisposed()) {
          pizzaRoot.rotation.y = performance.now() * 0.0012;
        }
      });

      worldLabel(scene, 'TIỆM PIZZA & ARCADE', root, '#ef4444', 'PIZZA PARTY & GAME CENTER');

      root.getChildMeshes().forEach(mesh => {
        mesh.metadata = { ...(mesh.metadata || {}), venue: 'casino' };
        shadows?.addShadowCaster(mesh);
      });
      return root;
    },

    /**
     * 4. GARA CƠ KHÍ & ĐẠI LÝ XE CỘ (VEHICLES & STEAM GARAGE)
     * Nhà xưởng công nghiệp Victoria, bánh răng quay êm ái, xe kéo và ván trượt
     */
    createVehicles(position = { x: 26, y: 0, z: -158 }) {
      const root = new TransformNode('venue-vehicles', scene);
      root.metadata = { venue: 'vehicles' };
      root.position.set(position.x, position.y || 0, position.z);
      root.rotation.y = -Math.PI / 4;

      const matSteel = makeMat(scene, 'vehicles-steel-slate', '#334155');
      const matRoof = makeMat(scene, 'vehicles-roof-cobalt', '#0284c7');
      const matBrass = makeMat(scene, 'vehicles-brass-gold', '#d97706', '#f59e0b');
      const matRed = makeMat(scene, 'vehicles-tractor-red', '#ef4444', '#dc2626');
      const matTire = makeMat(scene, 'vehicles-tire-rubber', '#0f172a');

      // 1. Đế xưởng cơ khí chịu lực
      const base = MeshBuilder.CreateBox('vehicles-workshop-base', { width: 12.0, height: 0.6, depth: 8.8 }, scene);
      base.position.set(0, 0.3, 0);
      base.material = matSteel;
      base.parent = root;

      // 2. Thân gara kim loại & gạch công nghiệp
      const body = MeshBuilder.CreateBox('vehicles-garage-body', { width: 11.2, height: 6.0, depth: 7.8 }, scene);
      body.position.set(0, 3.3, 0);
      body.material = matSteel;
      body.parent = root;

      // Mái vòm thép công nghiệp uốn cong
      const roof = MeshBuilder.CreateCylinder('vehicles-vault-roof', {
        diameter: 12.6,
        height: 8.2,
        tessellation: 16,
      }, scene);
      roof.rotation.z = Math.PI / 2;
      roof.rotation.y = Math.PI / 2;
      roof.scaling.set(0.48, 0.95, 1.0);
      roof.position.set(0, 6.6, 0);
      roof.material = matRoof;
      roof.parent = root;

      // 3. Cổng xưởng gara cánh rộng
      const doorway = MeshBuilder.CreateBox('vehicles-doorway', { width: 5.6, height: 4.2, depth: 0.3 }, scene);
      doorway.position.set(0, 2.4, 3.95);
      doorway.material = matBrass;
      doorway.parent = root;

      // 4. Bánh răng cơ khí chuyển động trên mặt tiền xưởng
      const gearWheel = spawnModelSync(scene, MODEL_PATHS.town.wheel, {
        position: new Vector3(0, 6.8, 4.1),
        scaling: new Vector3(1.4, 1.4, 1.4),
        shadows,
        name: 'vehicles-gear-wheel',
      });

      // 5. Xe kéo nông thôn trưng bày trước gara
      spawnModelSync(scene, MODEL_PATHS.town.cartHigh, {
        position: new Vector3(4.4, 0.4, 4.6),
        rotation: new Vector3(0, -0.3, 0),
        scaling: new Vector3(1.3, 1.3, 1.3),
        shadows,
        name: 'vehicles-cart-display',
      });

      // Mô hình xe ô tô mui trần đồ chơi mini màu vàng chuối xoay trên bục tròn
      const carPlatform = MeshBuilder.CreateCylinder('car-showroom-turntable', { height: 0.25, diameter: 4.2 }, scene);
      carPlatform.position.set(-3.8, 0.5, 4.4);
      carPlatform.material = createToyMaterial(scene, 'mat-toy-turntable', '#f8fafc', { specularPower: 96 });
      carPlatform.parent = root;

      const miniCar = new TransformNode('showroom-chibi-car', scene);
      miniCar.position.set(-3.8, 0.75, 4.4);
      miniCar.parent = root;

      // Thân xe bo tròn múp míp
      const carBody = MeshBuilder.CreateSphere('car-chibi-body', {
        diameterX: 1.4,
        diameterY: 0.8,
        diameterZ: 2.2,
        segments: 10,
      }, scene);
      carBody.position.y = 0.4;
      carBody.material = createToyMaterial(scene, 'mat-toy-car-yellow', PLAY_TOGETHER_PALETTE.pastels.bananaYellow, { specularPower: 96 });
      carBody.parent = miniCar;

      // Kính chắn gió hoạt hình
      const carWindshield = MeshBuilder.CreateBox('car-chibi-glass', { width: 1.2, height: 0.45, depth: 0.08 }, scene);
      carWindshield.position.set(0, 0.85, 0.2);
      carWindshield.rotation.x = 0.35;
      carWindshield.material = createToyMaterial(scene, 'mat-toy-car-glass', '#bae6fd', { alpha: 0.6 });
      carWindshield.parent = miniCar;

      // Đèn pha tròn
      [-0.45, 0.45].forEach((hx, i) => {
        const hl = MeshBuilder.CreateSphere(`car-hl-${i}`, { diameter: 0.28 }, scene);
        hl.position.set(hx, 0.45, 1.05);
        hl.material = createToyMaterial(scene, 'mat-toy-car-hl', '#ffffff', { emissiveHex: '#facc15' });
        hl.parent = miniCar;
      });

      // Bánh xe đồ chơi
      [-0.72, 0.72].forEach((wx, xi) => {
        [-0.6, 0.6].forEach((wz, zi) => {
          const w = MeshBuilder.CreateCylinder(`car-w-${xi}-${zi}`, { height: 0.22, diameter: 0.48 }, scene);
          w.rotation.z = Math.PI / 2;
          w.position.set(wx, 0.24, wz);
          w.material = createToyMaterial(scene, 'mat-toy-car-tire', '#1e293b');
          w.parent = miniCar;
        });
      });

      scene.onBeforeRenderObservable.add(() => {
        if (!miniCar.isDisposed()) {
          miniCar.rotation.y = performance.now() * 0.001;
        }
      });

      worldLabel(scene, 'ĐẠI LÝ XE ĐỒ CHƠI', root, '#0284c7', 'SCOOTER, SKATEBOARD & XE HƠI');

      root.getChildMeshes().forEach(mesh => {
        mesh.metadata = { ...(mesh.metadata || {}), venue: 'vehicles' };
        shadows?.addShadowCaster(mesh);
      });
      return root;
    },
  };
}
