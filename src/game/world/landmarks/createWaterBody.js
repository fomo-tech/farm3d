import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { createLakeSceneScope } from '../../rendering/LakeSceneScope.js';
import { mergeLakeStaticsSteps } from '../../rendering/mergeLakeStatics.js';

function makeMat(scene, name, hex, emissiveHex = null) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.35);
  m.specularColor = new Color3(0.08, 0.08, 0.08);
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

/**
 * 1. Phân Khu Hồ Pha Lê & Cao Nguyên Rừng Thông (Crystal Lake & Mountain District)
 */
export function* createLakeDistrictSteps(scene, shadows) {
  const scope=createLakeSceneScope(scene,'landmark-lake-district',shadows);
  const {root,detail}=scope;
  const wood=scope.material('lake-rowboat-wood','#aa7e56');
  const trim=scope.material('lake-rowboat-trim','#e9d8b3');
  const metal=scope.material('lake-fishing-metal','#8aa5aa');
  const flower=scope.material('lake-meadow-flower','#d995b6');
  const grass=scope.material('lake-meadow-grass','#769b59');
  yield 'lake: district materials';
  // One moored rowboat beside the pier, outside every walking corridor.
  const rowboatNode=new TransformNode('lake-rowboat-node',scene);
  rowboatNode.position.set(156,.20,-4.7);rowboatNode.rotation.y=-.22;rowboatNode.parent=detail;
  const box=(name,size,x,y,z,mat,parent=detail)=>{
    const mesh=scope.own(MeshBuilder.CreateBox(name,size,scene),mat,parent);
    mesh.position.set(x,y,z);return mesh;
  };
  box('rowboat-floor',{width:3.4,height:.14,depth:1.1},0,0,0,wood,rowboatNode);
  for(const sign of [-1,1]) {
    box('rowboat-side-'+sign,{width:3.6,height:.48,depth:.14},0,.25,sign*.55,wood,rowboatNode);
    const end=scope.own(MeshBuilder.CreateCylinder('rowboat-end-'+sign,{diameter:1.2,height:.45,tessellation:6},scene),wood,rowboatNode);
    end.scaling.set(.5,1,1);end.position.set(sign*1.65,.23,0);
    box('rowboat-seat-'+sign,{width:.28,height:.10,depth:1.05},sign*.65,.39,0,trim,rowboatNode);
  }
  const bucket=scope.own(MeshBuilder.CreateCylinder('lake-fish-bucket',{height:.4,diameterTop:.4,diameterBottom:.3,tessellation:8},scene),metal,detail);
  bucket.position.set(159,.52,3.1);
  yield 'lake: moored boat';
  // Small meadow accents on the rest bank rather than props across the pier.
  for(let i=0;i<18;i++) {
    const x=124+(i%6)*1.6,z=26+Math.floor(i/6)*1.8;
    const tuft=scope.own(MeshBuilder.CreateCylinder('lake-meadow-tuft-'+i,{diameterTop:0,diameterBottom:.2,height:.35,tessellation:4},scene),grass,detail);
    tuft.position.set(x,.18,z);
    if(i%3===0) {
      const bloom=scope.own(MeshBuilder.CreateIcoSphere('lake-meadow-bloom-'+i,{radius:.12,subdivisions:1,flat:true},scene),flower,detail);
      bloom.position.set(x,.36,z);
    }
    if(i%6===5)yield 'lake: rest meadow';
  }
  scope.animate(time=>{
    rowboatNode.position.y=.20+Math.sin(time*1.4)*.025;
    rowboatNode.rotation.z=Math.sin(time*1.1)*.025;
  });
  const before=root.getChildMeshes().length;
  const removed=yield* mergeLakeStaticsSteps(root,shadows);
  root.metadata={...root.metadata,layoutVersion:2,meshesBeforeBatch:before,removedStaticMeshes:removed,meshesAfterBatch:root.getChildMeshes().length};
  return {root,rowboatNode,dispose:scope.dispose,update() {}};
}

export function createLakeDistrict(scene,shadows=null) {
  const steps=createLakeDistrictSteps(scene,shadows);let result=steps.next();
  while(!result.done)result=steps.next();
  return result.value;
}

/**
 * 2. Phân Khu Bờ Biển Hoàng Hôn & Bãi Tắm Nhiệt Đới (Sunset Beach & Tiki Bar)
 */
export function createBeachDistrict(scene, shadows) {
  const materials = {
    sandPlank: makeMat(scene, 'beach-boardwalk', '#d4a373'),
    thatchRoof: makeMat(scene, 'beach-thatch-roof', '#e9c46a'),
    bambooBar: makeMat(scene, 'beach-bamboo-bar', '#b45309'),
    umbrellaOrange: makeMat(scene, 'beach-umbrella-orange', '#f97316'),
    umbrellaBlue: makeMat(scene, 'beach-umbrella-blue', '#0ea5e9'),
    umbrellaYellow: makeMat(scene, 'beach-umbrella-yellow', '#eab308'),
    umbrellaWhite: makeMat(scene, 'beach-umbrella-white', '#ffffff'),
    loungerWood: makeMat(scene, 'beach-lounger-wood', '#fef08a'),
    palmTrunk: makeMat(scene, 'palm-trunk-wood', '#78350f'),
    palmLeaf: makeMat(scene, 'palm-frond-leaf', '#15803d'),
    coconut: makeMat(scene, 'palm-coconut', '#451a03'),
    cocktailGlass: makeMat(scene, 'beach-cocktail-glass', '#bae6fd', '#38bdf8'),
    cocktailDrink: makeMat(scene, 'beach-cocktail-drink', '#ef4444', '#dc2626'),
    surfboard1: makeMat(scene, 'beach-surfboard-1', '#06b6d4', '#0891b2'),
    surfboard2: makeMat(scene, 'beach-surfboard-2', '#f97316', '#ea580c'),
    sandcastle: makeMat(scene, 'beach-sandcastle', '#e2be79'),
    lifeguardRed: makeMat(scene, 'beach-lifeguard-red', '#ef4444'),
    lifeguardWhite: makeMat(scene, 'beach-lifeguard-white', '#f8fafc'),
  };

  const root = new TransformNode('landmark-beach-district', scene);

  // === 1. CẦU VÁN GỖ ĐI DẠO VEN BIỂN (WOODEN BOARDWALK PIER) ===
  const boardwalk = MeshBuilder.CreateBox('beach-boardwalk-pier', {
    width: 12.0,
    height: 0.35,
    depth: 64.0,
  }, scene);
  boardwalk.position.set(0, 0.3, 186);
  boardwalk.material = materials.sandPlank;
  boardwalk.parent = root;
  shadows?.addShadowCaster(boardwalk);

  // Lan can cọc thừng duyên dáng hai bên boardwalk
  for (let bz = 156; bz <= 216; bz += 8) {
    [-5.8, 5.8].forEach((bx, idx) => {
      const post = MeshBuilder.CreateCylinder(`boardwalk-post-${bz}-${idx}`, { height: 1.2, diameter: 0.16 }, scene);
      post.position.set(bx, 0.9, bz);
      post.material = materials.bambooBar;
      post.parent = root;
    });
  }

  // === 2. QUẦY BAR DỪA BIỂN NHIỆT ĐỚI (TIKI COCONUT BEACH BAR) ===
  const barNode = new TransformNode('beach-tiki-bar-node', scene);
  barNode.position.set(-18, 0, 192);
  barNode.parent = root;

  // Quầy bar gỗ tre nứa bo cong chữ U
  const bar = MeshBuilder.CreateBox('beach-juice-bar', {
    width: 6.8,
    height: 1.2,
    depth: 3.2,
  }, scene);
  bar.position.set(0, 0.6, 0);
  bar.material = materials.bambooBar;
  bar.parent = barNode;
  shadows?.addShadowCaster(bar);

  // Mái lá cọ khô nhiệt đới xòe rộng (Thatch Palm Roof)
  const roof = MeshBuilder.CreateCylinder('juice-bar-thatch-roof', {
    diameter: 8.8,
    height: 2.6,
    tessellation: 4,
  }, scene);
  roof.rotation.z = Math.PI / 4;
  roof.rotation.y = Math.PI / 4;
  roof.scaling.set(0.9, 0.75, 0.9);
  roof.position.set(0, 3.8, 0);
  roof.material = materials.thatchRoof;
  roof.parent = barNode;
  shadows?.addShadowCaster(roof);

  // 4 Cột tre đỡ mái
  [[-3.0, -1.2], [3.0, -1.2], [-3.0, 1.2], [3.0, 1.2]].forEach(([px, pz], idx) => {
    const post = MeshBuilder.CreateCylinder(`bar-post-${idx}`, { diameter: 0.22, height: 3.6 }, scene);
    post.position.set(px, 1.8, pz);
    post.material = materials.bambooBar;
    post.parent = barNode;
  });

  // Biển hiệu gỗ: 🍹 TIKI COCONUT BAR 🥥 (1024x256 High-Res)
  const dtBar = new DynamicTexture('dt-bar-sign', { width: 1024, height: 256 }, scene, false, Texture.TRILINEAR_SAMPLINGMODE);
  dtBar.anisotropicFilteringLevel = 16;
  dtBar.hasAlpha = true;
  const ctxB = dtBar.getContext();
  ctxB.imageSmoothingEnabled = true;
  ctxB.imageSmoothingQuality = 'high';
  ctxB.clearRect(0, 0, 1024, 256);
  ctxB.fillStyle = '#451a03';
  ctxB.beginPath();
  ctxB.roundRect(16, 16, 992, 224, 36);
  ctxB.fill();
  ctxB.strokeStyle = '#f59e0b';
  ctxB.lineWidth = 16;
  ctxB.stroke();
  dtBar.drawText('🍹 TIKI COCONUT BAR 🥥', null, 152, 'bold 68px Arial', '#ffffff', null, true, true);

  const matBarSign = new StandardMaterial('bar-sign-mat', scene);
  matBarSign.diffuseTexture = dtBar;
  matBarSign.emissiveColor = new Color3(0.9, 0.6, 0.1);
  matBarSign.disableLighting = true;

  const barSignPlane = MeshBuilder.CreatePlane('bar-sign-plane', { width: 4.2, height: 1.0 }, scene);
  barSignPlane.position.set(0, 2.9, 1.7);
  barSignPlane.material = matBarSign;
  barSignPlane.parent = barNode;

  // Ly cocktail dừa cắm ô giấy trên mặt quầy
  [-1.5, 0, 1.5].forEach((cx, idx) => {
    const glass = MeshBuilder.CreateCylinder(`cocktail-${idx}`, { diameterTop: 0.22, diameterBottom: 0.14, height: 0.35 }, scene);
    glass.position.set(cx, 1.35, 1.2);
    glass.material = materials.cocktailDrink;
    glass.parent = barNode;

    // Trái dừa tươi cạnh ly
    const coco = MeshBuilder.CreateSphere(`coco-drink-${idx}`, { diameter: 0.35, segments: 6 }, scene);
    coco.position.set(cx + 0.35, 1.35, 1.2);
    coco.material = materials.coconut;
    coco.parent = barNode;
  });

  // 3 Ghế đẩu cao chân tre trước quầy
  [-1.8, 0, 1.8].forEach((sx, idx) => {
    const stoolTop = MeshBuilder.CreateCylinder(`bar-stool-${idx}`, { diameter: 0.6, height: 0.1 }, scene);
    stoolTop.position.set(sx, 0.75, 2.2);
    stoolTop.material = materials.sandPlank;
    stoolTop.parent = barNode;

    const stoolLeg = MeshBuilder.CreateCylinder(`stool-leg-${idx}`, { diameter: 0.08, height: 0.75 }, scene);
    stoolLeg.position.set(sx, 0.38, 2.2);
    stoolLeg.material = materials.bambooBar;
    stoolLeg.parent = barNode;
  });

  // 2 Ván lướt sóng (Surfboards) dựng nghiêng bên hông quầy bar
  const surfboard1 = MeshBuilder.CreateBox('surfboard-1', { width: 0.65, height: 2.8, depth: 0.1 }, scene);
  surfboard1.position.set(3.8, 1.3, 0.8);
  surfboard1.rotation.z = -0.2;
  surfboard1.rotation.y = -0.3;
  surfboard1.material = materials.surfboard1;
  surfboard1.parent = barNode;
  shadows?.addShadowCaster(surfboard1);

  const surfboard2 = MeshBuilder.CreateBox('surfboard-2', { width: 0.65, height: 2.6, depth: 0.1 }, scene);
  surfboard2.position.set(4.2, 1.2, 0.4);
  surfboard2.rotation.z = -0.22;
  surfboard2.rotation.y = -0.15;
  surfboard2.material = materials.surfboard2;
  surfboard2.parent = barNode;
  shadows?.addShadowCaster(surfboard2);

  // === 3. KHU NGHỈ DƯỠNG TẮM NẮNG (SUN LOUNGERS & STRIPED UMBRELLAS) ===
  const resortUmbrellas = [
    { x: 14, z: 184, mat: materials.umbrellaOrange },
    { x: 22, z: 184, mat: materials.umbrellaBlue },
    { x: 30, z: 184, mat: materials.umbrellaYellow },
    { x: 38, z: 184, mat: materials.umbrellaOrange },
  ];

  resortUmbrellas.forEach((umb, i) => {
    // Cột ô
    const pole = MeshBuilder.CreateCylinder(`beach-umbrella-pole-${i}`, { height: 3.2, diameter: 0.1 }, scene);
    pole.position.set(umb.x, 1.6, umb.z);
    pole.material = materials.bambooBar;
    pole.parent = root;

    // Tán dù che nắng nón xòe rộng
    const canopy = MeshBuilder.CreateCylinder(`beach-umbrella-canopy-${i}`, {
      height: 0.9,
      diameterTop: 0.1,
      diameterBottom: 3.8,
      tessellation: 14,
    }, scene);
    canopy.position.set(umb.x, 3.2, umb.z);
    canopy.material = umb.mat;
    canopy.parent = root;
    shadows?.addShadowCaster(canopy);

    // Ghế tắm nắng gỗ có đệm nằm ngửa
    const lounger = MeshBuilder.CreateBox(`beach-lounger-${i}`, { width: 1.3, height: 0.25, depth: 2.6 }, scene);
    lounger.rotation.x = -0.22;
    lounger.position.set(umb.x, 0.35, umb.z - 1.4);
    lounger.material = materials.loungerWood;
    lounger.parent = root;
    shadows?.addShadowCaster(lounger);
  });

  // Lâu đài cát 3D (Sandcastle) nhỏ trên bãi cát
  const castleBase = MeshBuilder.CreateBox('sandcastle-base', { width: 1.4, height: 0.45, depth: 1.4 }, scene);
  castleBase.position.set(18, 0.25, 178);
  castleBase.material = materials.sandcastle;
  castleBase.parent = root;

  [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].forEach(([cx, cz], idx) => {
    const tower = MeshBuilder.CreateCylinder(`sand-tower-${idx}`, { diameter: 0.35, height: 0.6 }, scene);
    tower.position.set(18 + cx, 0.6, 178 + cz);
    tower.material = materials.sandcastle;
    tower.parent = root;
  });

  // Quả bóng bay bãi biển (Beach Ball)
  const beachBall = MeshBuilder.CreateSphere('beach-ball', { diameter: 0.7, segments: 10 }, scene);
  beachBall.position.set(25, 0.45, 178);
  beachBall.material = materials.umbrellaOrange;
  beachBall.parent = root;

  // === 4. THÁP CỨU HỘ BỜ BIỂN (LIFEGUARD TOWER) ===
  const towerNode = new TransformNode('lifeguard-tower', scene);
  towerNode.position.set(-8, 0, 178);
  towerNode.parent = root;

  // 4 Cột tháp cao 3.8m
  [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].forEach(([tx, tz], idx) => {
    const leg = MeshBuilder.CreateCylinder(`lifeguard-leg-${idx}`, { diameter: 0.16, height: 3.6 }, scene);
    leg.position.set(tx, 1.8, tz);
    leg.material = materials.lifeguardWhite;
    leg.parent = towerNode;
  });

  // Sàn quan sát
  const watchFloor = MeshBuilder.CreateBox('lifeguard-floor', { width: 2.8, height: 0.2, depth: 2.8 }, scene);
  watchFloor.position.set(0, 3.6, 0);
  watchFloor.material = materials.lifeguardRed;
  watchFloor.parent = towerNode;
  shadows?.addShadowCaster(watchFloor);

  // Mái che tháp cứu hộ
  const watchRoof = MeshBuilder.CreateBox('lifeguard-roof', { width: 3.2, height: 0.2, depth: 3.2 }, scene);
  watchRoof.position.set(0, 5.4, 0);
  watchRoof.material = materials.lifeguardRed;
  watchRoof.parent = towerNode;

  // Phao cứu sinh tròn (Lifebuoy) treo bên tháp
  const lifebuoy = MeshBuilder.CreateTorus('lifebuoy-ring', { diameter: 0.75, thickness: 0.18, tessellation: 16 }, scene);
  lifebuoy.rotation.x = Math.PI / 2;
  lifebuoy.position.set(1.45, 3.2, 0);
  lifebuoy.material = materials.lifeguardRed;
  lifebuoy.parent = towerNode;

  // === 5. KHU NGHỈ DƯỠNG GLAMPING VEN BIỂN (COZY SEASIDE GLAMPING RESORT) ===
  const glampingNode = new TransformNode('beach-glamping-resort', scene);
  glampingNode.position.set(-36, 0, 194);
  glampingNode.parent = root;

  const matCanvas = makeMat(scene, 'glamping-canvas-mat', '#fefce8');
  const matDeck = materials.sandPlank;
  const matEmber = makeMat(scene, 'glamping-ember-mat', '#ef4444', '#f97316');
  const matLog = makeMat(scene, 'glamping-log-mat', '#451a03');

  // 2 Lều Glamping Bell nón chóp cao sang trọng có sàn gỗ ngắm biển
  [-6, 6].forEach((tx, idx) => {
    // Sàn gỗ nâng chân chống cát
    const deck = MeshBuilder.CreateCylinder(`glamping-deck-${idx}`, { diameter: 5.6, height: 0.25, tessellation: 20 }, scene);
    deck.position.set(tx, 0.12, 0);
    deck.material = matDeck;
    deck.parent = glampingNode;
    deck.receiveShadows = true;

    // Lều vải nón chóp cao ấm cúng
    const tent = MeshBuilder.CreateCylinder(`glamping-tent-${idx}`, { diameterTop: 0.2, diameterBottom: 5.0, height: 3.4, tessellation: 16 }, scene);
    tent.position.set(tx, 1.8, 0);
    tent.material = matCanvas;
    tent.parent = glampingNode;
    shadows?.addShadowCaster(tent);

    // Mái che cửa lều chữ V
    const awning = MeshBuilder.CreateCylinder(`glamping-entry-${idx}`, { diameter: 2.2, height: 1.4, tessellation: 3 }, scene);
    awning.rotation.z = Math.PI / 2;
    awning.rotation.y = Math.PI / 2;
    awning.position.set(tx, 1.1, 2.3);
    awning.material = matCanvas;
    awning.parent = glampingNode;

    // Đèn lồng ấm treo trước cửa lều
    const lantern = MeshBuilder.CreateSphere(`glamping-lantern-${idx}`, { diameter: 0.35, segments: 8 }, scene);
    lantern.position.set(tx, 1.9, 2.6);
    lantern.material = makeMat(scene, `glamping-lantern-mat-${idx}`, '#fef08a', '#fbbf24');
    lantern.parent = glampingNode;
  });

  // Đống lửa trại bờ cát nướng kẹo dẻo giữa 2 lều
  const campRing = MeshBuilder.CreateTorus('glamping-fire-ring', { diameter: 1.8, thickness: 0.25, tessellation: 12 }, scene);
  campRing.position.set(0, 0.12, -4.5);
  campRing.material = materials.sandcastle;
  campRing.parent = glampingNode;

  const campEmber = MeshBuilder.CreateSphere('glamping-fire-ember', { diameter: 0.9, segments: 8 }, scene);
  campEmber.position.set(0, 0.22, -4.5);
  campEmber.material = matEmber;
  campEmber.parent = glampingNode;

  // Ghế thân cây trôi dạt (Driftwood Benches) quây quanh lửa
  [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((ang, bIdx) => {
    const bench = MeshBuilder.CreateCylinder(`glamping-driftwood-${bIdx}`, { diameter: 0.42, height: 1.8 }, scene);
    bench.rotation.z = Math.PI / 2;
    bench.rotation.y = ang;
    bench.position.set(Math.sin(ang) * 1.8, 0.22, -4.5 + Math.cos(ang) * 1.8);
    bench.material = matLog;
    bench.parent = glampingNode;
  });

  return root;
}
