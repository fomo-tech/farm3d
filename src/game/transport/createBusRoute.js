import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial } from '../rendering/PlayTogetherTheme.js';
import { MODEL_PATHS, spawnModelSync } from '../rendering/ModelAssetManager.js';

const ROUTE = [
  new Vector3(0, 0, -118),
  new Vector3(0, 0, 3),
  new Vector3(-118, 0, 3),
  new Vector3(0, 0, 3),
  new Vector3(132, 0, 3),
  new Vector3(0, 0, 3),
  new Vector3(0, 0, 180),
  new Vector3(0, 0, 3),
];

function makeMat(scene, name, hex, emissiveHex = null) {
  return createToyMaterial(scene, name, hex, { emissiveHex });
}

/**
 * Creates a charming European wooden bus stop shelter with bench and lantern.
 */
function createBusStopShelter(scene, x, z, label, materials) {
  const root = new TransformNode(`bus-stop-${label}`, scene);
  root.position.set(x, 0, z);

  // 1. Sàn gỗ tự nhiên
  const platform = MeshBuilder.CreateBox(`stop-platform-${label}`, { width: 5.6, height: 0.22, depth: 3.4 }, scene);
  platform.position.set(2.2, 0.11, 1.2);
  platform.material = materials.timber;
  platform.parent = root;

  // 2. 4 cột trụ gỗ tròn vững chãi
  [[0, 0], [4.4, 0], [0, 2.4], [4.4, 2.4]].forEach(([px, pz], i) => {
    const post = MeshBuilder.CreateCylinder(`stop-post-${label}-${i}`, { height: 3.2, diameter: 0.22, tessellation: 12 }, scene);
    post.position.set(px, 1.6, pz);
    post.material = materials.timber;
    post.parent = root;
  });

  // Vách gỗ chắn gió phía sau
  const backPanel = MeshBuilder.CreateBox(`stop-back-${label}`, { width: 4.4, height: 2.2, depth: 0.08 }, scene);
  backPanel.position.set(2.2, 1.8, 2.38);
  backPanel.material = materials.bench;
  backPanel.parent = root;

  // 3. Mái ngói đôi chữ V ấm cúng (Loại bỏ hoàn toàn khối lăng trụ tam giác thô)
  const roofL = MeshBuilder.CreateBox(`stop-roof-l-${label}`, { width: 5.8, height: 0.12, depth: 2.1 }, scene);
  roofL.position.set(2.2, 3.45, 0.45);
  roofL.rotation.x = -0.32;
  roofL.material = materials.tileRoof;
  roofL.parent = root;

  const roofR = MeshBuilder.CreateBox(`stop-roof-r-${label}`, { width: 5.8, height: 0.12, depth: 2.1 }, scene);
  roofR.position.set(2.2, 3.45, 1.95);
  roofR.rotation.x = 0.32;
  roofR.material = materials.tileRoof;
  roofR.parent = root;

  const roofRidge = MeshBuilder.CreateBox(`stop-roof-ridge-${label}`, { width: 6.0, height: 0.18, depth: 0.35 }, scene);
  roofRidge.position.set(2.2, 3.82, 1.2);
  roofRidge.material = materials.timber;
  roofRidge.parent = root;

  // 4. Băng ghế gỗ nghỉ chân
  const benchSeat = MeshBuilder.CreateBox(`stop-bench-${label}`, { width: 3.6, height: 0.14, depth: 0.75 }, scene);
  benchSeat.position.set(2.2, 0.65, 1.8);
  benchSeat.material = materials.bench;
  benchSeat.parent = root;

  // 5. Cột biển báo dừng xe buýt cổ điển có bảng tên trạm
  const signPole = MeshBuilder.CreateCylinder(`stop-sign-pole-${label}`, { height: 3.2, diameter: 0.12 }, scene);
  signPole.position.set(-0.8, 1.6, 0);
  signPole.material = materials.timber;
  signPole.parent = root;

  // Bảng hiệu tròn xe buýt phong cách Châu Âu
  const badgeDT = new DynamicTexture(`dt-bus-sign-${label}`, { width: 256, height: 256 }, scene, false);
  const bCtx = badgeDT.getContext();
  bCtx.fillStyle = '#f59e0b';
  bCtx.beginPath();
  bCtx.arc(128, 128, 120, 0, Math.PI * 2);
  bCtx.fill();
  bCtx.strokeStyle = '#ffffff';
  bCtx.lineWidth = 10;
  bCtx.stroke();
  badgeDT.drawText('🚌', null, 115, 'bold 72px "Segoe UI", Arial', '#ffffff', null, true, true);
  badgeDT.drawText(label, null, 185, 'bold 36px "Segoe UI", Arial', '#1e293b', null, true, true);

  const badgeMat = new StandardMaterial(`mat-bus-sign-${label}`, scene);
  badgeMat.diffuseTexture = badgeDT;
  badgeMat.emissiveColor = new Color3(0.3, 0.2, 0.05);

  const signBadge = MeshBuilder.CreateCylinder(`stop-sign-badge-${label}`, { height: 0.08, diameter: 1.1, tessellation: 24 }, scene);
  signBadge.rotation.x = Math.PI / 2;
  signBadge.position.set(-0.8, 2.7, 0);
  signBadge.material = badgeMat;
  signBadge.parent = root;

  // 6. Đèn lồng treo 3D cổ điển ấm áp
  spawnModelSync(scene, MODEL_PATHS.town.lantern, {
    position: new Vector3(2.2, 2.7, 1.2),
    scaling: new Vector3(1.1, 1.1, 1.1),
    parent: root,
    name: `bus-stop-lantern-${label}`,
  });

  return root;
}

/**
 * Creates the Vintage Retro 3D Bus with rolling wheels, chrome bumpers, and headlights.
 */
export function createBusRoute(scene, shadows) {
  const materials = {
    timber: makeMat(scene, 'bus-stop-timber', '#543621'),
    bench: makeMat(scene, 'bus-stop-bench', '#8b5a2b'),
    tileRoof: makeMat(scene, 'bus-stop-roof', '#b93b2a'),
    signYellow: makeMat(scene, 'bus-stop-sign', '#f59e0b', '#d97706'),
    lanternGlow: makeMat(scene, 'bus-stop-glow', '#fef08a', '#eab308'),

    // Bus Materials (Play Together Chibi Yellow School Bus)
    creamBody: makeMat(scene, 'bus-cream', PLAY_TOGETHER_PALETTE.pastels.creamyVanilla),
    yellowBody: makeMat(scene, 'bus-yellow', PLAY_TOGETHER_PALETTE.pastels.bananaYellow),
    chrome: makeMat(scene, 'bus-chrome', '#f8fafc'),
    glass: makeMat(scene, 'bus-glass', '#bae6fd', '#38bdf8'),
    tire: makeMat(scene, 'bus-tire', '#1e293b'),
    headlight: makeMat(scene, 'bus-headlight', '#ffffff', '#facc15'),
    taillight: makeMat(scene, 'bus-taillight', '#ef4444', '#b91c1c'),
  };
  materials.glass.alpha = 0.55;

  // Create 4 Sheltered Bus Stops
  createBusStopShelter(scene, 7, -118, 'Thị Trấn', materials);
  createBusStopShelter(scene, -118, 10, 'Nông Thôn', materials);
  createBusStopShelter(scene, 132, 10, 'Vùng Hồ', materials);
  createBusStopShelter(scene, 7, 180, 'Bãi Biển', materials);

  // Root Node for Moving Bus
  const root = new TransformNode('vintage-valley-bus', scene);

  // 1. Lower Body (Play Together Banana Yellow)
  const lowerBody = MeshBuilder.CreateBox('bus-lower-body', {
    width: 3.4,
    height: 1.4,
    depth: 7.6,
  }, scene);
  lowerBody.position.y = 1.3;
  lowerBody.material = materials.yellowBody;
  lowerBody.parent = root;

  // 2. Upper Body & Roof (Cream White)
  const upperBody = MeshBuilder.CreateBox('bus-upper-body', {
    width: 3.2,
    height: 1.3,
    depth: 7.2,
  }, scene);
  upperBody.position.y = 2.65;
  upperBody.material = materials.creamBody;
  upperBody.parent = root;

  // Rounded Dome Roof Cap
  const roof = MeshBuilder.CreateCylinder('bus-roof-dome', {
    diameter: 3.6,
    height: 7.4,
    tessellation: 16,
  }, scene);
  roof.rotation.x = Math.PI / 2;
  roof.scaling.set(0.28, 1.0, 0.95);
  roof.position.y = 3.35;
  roof.material = materials.creamBody;
  roof.parent = root;

  // 3. Panoramic Windows (Front curved windshield & side windows)
  const frontWindshield = MeshBuilder.CreateBox('bus-windshield', {
    width: 2.8,
    height: 1.1,
    depth: 0.2,
  }, scene);
  frontWindshield.rotation.x = 0.15;
  frontWindshield.position.set(0, 2.6, 3.62);
  frontWindshield.material = materials.glass;
  frontWindshield.parent = root;

  const rearWindow = MeshBuilder.CreateBox('bus-rear-window', {
    width: 2.6,
    height: 1.0,
    depth: 0.2,
  }, scene);
  rearWindow.position.set(0, 2.6, -3.62);
  rearWindow.material = materials.glass;
  rearWindow.parent = root;

  [-1.62, 1.62].forEach((sx, i) => {
    const sideWin = MeshBuilder.CreateBox(`bus-side-win-${i}`, {
      width: 0.15,
      height: 1.0,
      depth: 5.6,
    }, scene);
    sideWin.position.set(sx, 2.6, 0);
    sideWin.material = materials.glass;
    sideWin.parent = root;
  });

  // 4. Chrome Bumpers (Front & Rear)
  const frontBumper = MeshBuilder.CreateBox('bus-front-bumper', { width: 3.6, height: 0.35, depth: 0.4 }, scene);
  frontBumper.position.set(0, 0.8, 3.9);
  frontBumper.material = materials.chrome;
  frontBumper.parent = root;

  const rearBumper = MeshBuilder.CreateBox('bus-rear-bumper', { width: 3.6, height: 0.35, depth: 0.4 }, scene);
  rearBumper.position.set(0, 0.8, -3.9);
  rearBumper.material = materials.chrome;
  rearBumper.parent = root;

  // 5. Round Glowing Headlights & Red Taillights
  [-1.2, 1.2].forEach((hx, i) => {
    const headlight = MeshBuilder.CreateSphere(`bus-headlight-${i}`, { diameter: 0.55, segments: 8 }, scene);
    headlight.position.set(hx, 1.4, 3.8);
    headlight.material = materials.headlight;
    headlight.parent = root;

    const taillight = MeshBuilder.CreateSphere(`bus-taillight-${i}`, { diameter: 0.45, segments: 6 }, scene);
    taillight.position.set(hx, 1.4, -3.8);
    taillight.material = materials.taillight;
    taillight.parent = root;
  });

  // 6. 4 Rolling Rubber Tires with Chrome Hubcaps
  const wheels = [];
  [-1.65, 1.65].forEach(wx => {
    [-2.3, 2.3].forEach(wz => {
      const wheelNode = new TransformNode('bus-wheel-node', scene);
      wheelNode.position.set(wx, 0.65, wz);
      wheelNode.parent = root;

      const tire = MeshBuilder.CreateCylinder('bus-tire-mesh', {
        height: 0.42,
        diameter: 1.28,
        tessellation: 16,
      }, scene);
      tire.rotation.z = Math.PI / 2;
      tire.material = materials.tire;
      tire.parent = wheelNode;

      const hubcap = MeshBuilder.CreateCylinder('bus-hubcap-mesh', {
        height: 0.45,
        diameter: 0.65,
        tessellation: 12,
      }, scene);
      hubcap.rotation.z = Math.PI / 2;
      hubcap.material = materials.chrome;
      hubcap.parent = wheelNode;

      wheels.push(tire);
    });
  });

  if (shadows) {
    [lowerBody, upperBody, frontBumper].forEach(m => shadows.addShadowCaster(m));
  }

  let segment = 0;
  let progress = 0;
  root.position.copyFrom(ROUTE[0]);

  return {
    root,
    update(delta) {
      const start = ROUTE[segment];
      const end = ROUTE[(segment + 1) % ROUTE.length];
      const length = Vector3.Distance(start, end);

      progress += (15 * delta) / length;
      if (progress >= 1) {
        progress = 0;
        segment = (segment + 1) % ROUTE.length;
      }

      const currentStart = ROUTE[segment];
      const currentEnd = ROUTE[(segment + 1) % ROUTE.length];
      Vector3.LerpToRef(currentStart, currentEnd, progress, root.position);
      root.rotation.y = Math.atan2(currentEnd.x - currentStart.x, currentEnd.z - currentStart.z);

      // Rotate wheels as bus travels
      wheels.forEach(w => {
        w.rotation.x += delta * 12;
      });
    },
  };
}
