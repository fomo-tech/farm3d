import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial } from '../rendering/PlayTogetherTheme.js';
import { MODEL_PATHS, spawnModelSync } from '../rendering/ModelAssetManager.js';
import { getScenicPoiDescriptor } from '../world/createScenicLandscapes.js';
import { COASTAL_BUS_CONFIG } from '../../../shared/beachConfig.js';
import { getTerrainHeight } from '../world/TerrainHeightSystem.js';
import { LAKE_CONFIG } from '../../../shared/lakeConfig.js';

function makeMat(scene, name, hex, emissiveHex = null) {
  return createToyMaterial(scene, name, hex, { emissiveHex });
}

/**
 * Draws a sharp vector bus silhouette onto 2D canvas context without emojis.
 */
function drawBusIcon(ctx, cx, cy, size = 64, color = '#ffffff') {
  ctx.save();
  ctx.translate(cx, cy);
  const s = size / 100;
  ctx.scale(s, s);

  // Main chassis rounded box
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-42, -26, 84, 52, 10);
  ctx.fill();

  // Glass windows
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-36, -20, 22, 20, 4);
  ctx.roundRect(-8, -20, 20, 20, 4);
  ctx.roundRect(18, -20, 20, 20, 4);
  ctx.fill();

  // Headlights
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(-36, 14, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Wheels
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(-22, 26, 9, 0, Math.PI * 2);
  ctx.arc(22, 26, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(-22, 26, 4, 0, Math.PI * 2);
  ctx.arc(22, 26, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Creates a European/Ghibli wooden bus stop shelter with bench, timetable sign and lantern.
 * Local -Z is the OPEN FRONT facing the street.
 * Local +Z is the BACK WALL.
 */
function createBusStopShelter(scene, x, z, label, routeBadges, materials, rotationY = 0) {
  const root = new TransformNode(`bus-stop-${label}`, scene);
  root.position.set(x, 0, z);
  root.rotation.y = rotationY;

  // 1. Sàn gỗ nâng cao
  const platform = MeshBuilder.CreateBox(`stop-plat-${label}`, { width: 5.6, height: 0.22, depth: 3.2 }, scene);
  platform.position.set(0, 0.11, 0);
  platform.material = materials.timber;
  platform.parent = root;

  // Vạch kẻ vàng đón xe trên lề đường (y = 0.09 chống z-fighting, nằm ở mép trước đón xe)
  const curbLine = MeshBuilder.CreatePlane(`stop-curb-${label}`, { width: 6.2, height: 0.4 }, scene);
  curbLine.rotation.x = Math.PI / 2;
  curbLine.position.set(0, 0.09, -1.75);
  curbLine.material = materials.signYellow;
  curbLine.parent = root;

  // 2. 4 cột trụ gỗ tròn
  [[-2.2, -1.1], [2.2, -1.1], [-2.2, 1.1], [2.2, 1.1]].forEach(([px, pz], i) => {
    const post = MeshBuilder.CreateCylinder(`stop-post-${label}-${i}`, { height: 3.2, diameter: 0.22, tessellation: 12 }, scene);
    post.position.set(px, 1.6, pz);
    post.material = materials.timber;
    post.parent = root;
  });

  // Vách kính & gỗ chắn gió phía sau (ở +Z)
  const backPanel = MeshBuilder.CreateBox(`stop-back-${label}`, { width: 4.4, height: 2.2, depth: 0.08 }, scene);
  backPanel.position.set(0, 1.8, 1.1);
  backPanel.material = materials.bench;
  backPanel.parent = root;

  // 3. Mái ngói đôi chữ V ấm cúng
  const roofL = MeshBuilder.CreateBox(`stop-roof-l-${label}`, { width: 5.8, height: 0.12, depth: 2.0 }, scene);
  roofL.position.set(0, 3.42, -0.65);
  roofL.rotation.x = -0.32;
  roofL.material = materials.tileRoof;
  roofL.parent = root;

  const roofR = MeshBuilder.CreateBox(`stop-roof-r-${label}`, { width: 5.8, height: 0.12, depth: 2.0 }, scene);
  roofR.position.set(0, 3.42, 0.65);
  roofR.rotation.x = 0.32;
  roofR.material = materials.tileRoof;
  roofR.parent = root;

  const roofRidge = MeshBuilder.CreateBox(`stop-roof-ridge-${label}`, { width: 6.0, height: 0.18, depth: 0.32 }, scene);
  roofRidge.position.set(0, 3.75, 0);
  roofRidge.material = materials.timber;
  roofRidge.parent = root;

  // 4. Băng ghế gỗ (tựa lưng vào vách sau +Z, nhìn ra mặt đường -Z)
  const benchSeat = MeshBuilder.CreateBox(`stop-bench-${label}`, { width: 3.6, height: 0.14, depth: 0.72 }, scene);
  benchSeat.position.set(0, 0.65, 0.6);
  benchSeat.material = materials.bench;
  benchSeat.parent = root;

  // 5. Cột biển báo dừng xe buýt cổ điển
  const signPole = MeshBuilder.CreateCylinder(`stop-sign-pole-${label}`, { height: 3.2, diameter: 0.12 }, scene);
  signPole.position.set(-2.8, 1.6, -1.0);
  signPole.material = materials.timber;
  signPole.parent = root;

  // Bảng hiệu tròn xe buýt vector không emoji
  const badgeDT = new DynamicTexture(`dt-bus-sign-${label}`, { width: 256, height: 256 }, scene, false);
  const bCtx = badgeDT.getContext();
  bCtx.fillStyle = '#f59e0b';
  bCtx.beginPath();
  bCtx.arc(128, 128, 120, 0, Math.PI * 2);
  bCtx.fill();
  bCtx.strokeStyle = '#ffffff';
  bCtx.lineWidth = 10;
  bCtx.stroke();

  // Vẽ biểu tượng xe buýt vector
  drawBusIcon(bCtx, 128, 92, 70, '#ffffff');

  // Tên trạm và tuyến
  bCtx.fillStyle = '#1e293b';
  bCtx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
  bCtx.textAlign = 'center';
  bCtx.textBaseline = 'middle';
  bCtx.fillText(label, 128, 168);

  bCtx.fillStyle = '#0f766e';
  bCtx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  bCtx.fillText(routeBadges || 'BUS STOP', 128, 202);
  badgeDT.update();

  const badgeMat = new StandardMaterial(`mat-bus-sign-${label}`, scene);
  badgeMat.diffuseTexture = badgeDT;
  badgeMat.emissiveColor = new Color3(0.4, 0.3, 0.1);

  const signBadge = MeshBuilder.CreateCylinder(`stop-sign-badge-${label}`, { height: 0.08, diameter: 1.25, tessellation: 24 }, scene);
  signBadge.rotation.x = Math.PI / 2;
  signBadge.position.set(-2.8, 2.7, -1.0);
  signBadge.material = badgeMat;
  signBadge.parent = root;

  // 6. Đèn lồng treo 3D cổ điển
  spawnModelSync(scene, MODEL_PATHS.town.lantern, {
    position: new Vector3(0, 2.7, 0),
    scaling: new Vector3(1.1, 1.1, 1.1),
    parent: root,
    name: `bus-stop-lantern-${label}`,
  });

  return root;
}

/**
 * Creates an electronic LED destination board texture.
 */
function createLedSignTexture(scene, id, text, routeNum, colorHex = '#38bdf8') {
  const dt = new DynamicTexture(`dt-led-${id}`, { width: 512, height: 128 }, scene, false);
  const ctx = dt.getContext();
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, 512, 128);

  // Viền LED
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 116);

  // Badge tuyến
  ctx.fillStyle = colorHex;
  ctx.beginPath();
  ctx.roundRect(16, 16, 100, 96, 12);
  ctx.fill();

  ctx.fillStyle = '#020617';
  ctx.font = '900 44px "Segoe UI", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(routeNum, 66, 66);

  // Tên điểm đến
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 36px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(text, 130, 66);

  dt.update();
  return dt;
}

/**
 * Creates one Chibi Retro Bus for the fleet.
 */
function createChibiBus(scene, shadows, config, materials) {
  const root = new TransformNode(config.id, scene);
  const bodyMat = makeMat(scene, `mat-body-${config.id}`, config.bodyColor);
  const accentMat = makeMat(scene, `mat-accent-${config.id}`, config.accentColor);
  const ledDT = createLedSignTexture(scene, config.id, config.routeName, config.routeCode, config.ledColor || '#38bdf8');
  const ledMat = new StandardMaterial(`mat-led-${config.id}`, scene);
  ledMat.diffuseTexture = ledDT;
  ledMat.emissiveTexture = ledDT;
  ledMat.emissiveColor = new Color3(0.9, 0.9, 0.9);

  // 1. Lower Body Chassis
  const lowerBody = MeshBuilder.CreateBox(`${config.id}-lower-body`, { width: 3.4, height: 1.45, depth: 7.6 }, scene);
  lowerBody.position.y = 1.35;
  lowerBody.material = bodyMat;
  lowerBody.parent = root;

  // 2. Upper Body
  const upperBody = MeshBuilder.CreateBox(`${config.id}-upper-body`, { width: 3.2, height: 1.35, depth: 7.2 }, scene);
  upperBody.position.y = 2.7;
  upperBody.material = accentMat;
  upperBody.parent = root;

  // Rounded Dome Roof Cap
  const roof = MeshBuilder.CreateCylinder(`${config.id}-roof`, { diameter: 3.6, height: 7.4, tessellation: 16 }, scene);
  roof.rotation.x = Math.PI / 2;
  roof.scaling.set(0.28, 1.0, 0.95);
  roof.position.y = 3.42;
  roof.material = accentMat;
  roof.parent = root;

  // 3. Panoramic Windows
  const frontWindshield = MeshBuilder.CreateBox(`${config.id}-windshield`, { width: 2.8, height: 1.15, depth: 0.15 }, scene);
  frontWindshield.rotation.x = 0.14;
  frontWindshield.position.set(0, 2.65, 3.62);
  frontWindshield.material = materials.glass;
  frontWindshield.parent = root;

  const rearWindow = MeshBuilder.CreateBox(`${config.id}-rear-window`, { width: 2.6, height: 1.0, depth: 0.15 }, scene);
  rearWindow.position.set(0, 2.65, -3.62);
  rearWindow.material = materials.glass;
  rearWindow.parent = root;

  [-1.62, 1.62].forEach((sx, i) => {
    const sideWin = MeshBuilder.CreateBox(`${config.id}-side-win-${i}`, { width: 0.12, height: 1.05, depth: 5.6 }, scene);
    sideWin.position.set(sx, 2.65, 0);
    sideWin.material = materials.glass;
    sideWin.parent = root;
  });

  // 4. LED Route Displays (Front & Sides)
  const frontSign = MeshBuilder.CreatePlane(`${config.id}-front-sign`, { width: 2.4, height: 0.5 }, scene);
  frontSign.position.set(0, 3.25, 3.68);
  frontSign.material = ledMat;
  frontSign.parent = root;

  // 5. Chrome Bumpers
  const frontBumper = MeshBuilder.CreateBox(`${config.id}-f-bumper`, { width: 3.6, height: 0.35, depth: 0.4 }, scene);
  frontBumper.position.set(0, 0.8, 3.9);
  frontBumper.material = materials.chrome;
  frontBumper.parent = root;

  const rearBumper = MeshBuilder.CreateBox(`${config.id}-r-bumper`, { width: 3.6, height: 0.35, depth: 0.4 }, scene);
  rearBumper.position.set(0, 0.8, -3.9);
  rearBumper.material = materials.chrome;
  rearBumper.parent = root;

  // 6. Round Glowing Headlights & Red Taillights
  [-1.2, 1.2].forEach((hx, i) => {
    const headlight = MeshBuilder.CreateSphere(`${config.id}-headlight-${i}`, { diameter: 0.55, segments: 8 }, scene);
    headlight.position.set(hx, 1.4, 3.82);
    headlight.material = materials.headlight;
    headlight.parent = root;

    const taillight = MeshBuilder.CreateSphere(`${config.id}-taillight-${i}`, { diameter: 0.45, segments: 6 }, scene);
    taillight.position.set(hx, 1.4, -3.82);
    taillight.material = materials.taillight;
    taillight.parent = root;
  });

  // 7. Hazard Blinker Lights (Amber)
  const blinkers = [];
  [-1.5, 1.5].forEach((bx, i) => {
    [-3.7, 3.7].forEach((bz, j) => {
      const bl = MeshBuilder.CreateSphere(`${config.id}-blinker-${i}-${j}`, { diameter: 0.3, segments: 6 }, scene);
      bl.position.set(bx, 1.7, bz);
      bl.material = materials.blinkerOff;
      bl.parent = root;
      blinkers.push(bl);
    });
  });

  // 8. 4 Rolling Rubber Tires
  const wheels = [];
  [-1.65, 1.65].forEach(wx => {
    [-2.3, 2.3].forEach(wz => {
      const wheelNode = new TransformNode(`${config.id}-wheel-node`, scene);
      wheelNode.position.set(wx, 0.65, wz);
      wheelNode.parent = root;

      const tire = MeshBuilder.CreateCylinder(`${config.id}-tire`, { height: 0.42, diameter: 1.28, tessellation: 16 }, scene);
      tire.rotation.z = Math.PI / 2;
      tire.material = materials.tire;
      tire.parent = wheelNode;

      const hubcap = MeshBuilder.CreateCylinder(`${config.id}-hubcap`, { height: 0.45, diameter: 0.65, tessellation: 12 }, scene);
      hubcap.rotation.z = Math.PI / 2;
      hubcap.material = materials.chrome;
      hubcap.parent = wheelNode;

      wheels.push(tire);
    });
  });

  // 9. Passenger Seating Node (where player sits inside bus)
  const passengerSeatNode = new TransformNode(`${config.id}-seat`, scene);
  passengerSeatNode.position.set(0.7, 1.35, -0.6);
  passengerSeatNode.parent = root;

  // Passenger Cabin Interior Bench
  const seatMesh = MeshBuilder.CreateBox(`${config.id}-cabin-seat`, { width: 1.4, height: 0.45, depth: 1.8 }, scene);
  seatMesh.position.set(0.7, 1.05, -0.6);
  seatMesh.material = materials.bench;
  seatMesh.parent = root;

  if (shadows) {
    [lowerBody, upperBody, frontBumper].forEach(m => shadows.addShadowCaster(m));
  }

  // Pre-calculate segment lengths for route
  const waypoints = config.waypoints;
  const segmentLengths = [];
  for (let i = 0; i < waypoints.length; i++) {
    const nextIdx = (i + 1) % waypoints.length;
    const len = Vector3.Distance(waypoints[i], waypoints[nextIdx]);
    segmentLengths.push(len);
  }

  // Initial placement offset so buses are spaced out nicely
  let currentSegment = config.initialSegment || 0;
  let segmentProgress = config.initialProgress || 0;
  root.position.copyFrom(waypoints[currentSegment]);

  // Bus FSM State
  // 'CRUISING' | 'BRAKING' | 'DWELLING' | 'ACCELERATING'
  let state = 'CRUISING';
  const CRUISE_SPEED = config.cruiseSpeed || 48.0; // 48 m/s (~173 km/h express speed)
  let currentSpeed = CRUISE_SPEED;
  let dwellTimer = 0;
  const maxDwellTime = 4.0; // 4.0s dwell at stations (snappy, no long waiting)
  let currentStation = null;
  let nextStation = config.stops[0] || null;
  let blinkerPulse = 0;

  return {
    id: config.id,
    routeCode: config.routeCode,
    routeName: config.routeName,
    bodyColor: config.bodyColor,
    root,
    passengerSeatNode,
    getCurrentStation: () => currentStation,
    getNextStation: () => nextStation,
    getCurrentSpeed: () => currentSpeed,
    getState: () => state,
    getDwellRemaining: () => Math.max(0, maxDwellTime - dwellTimer),
    isDwelling: () => state === 'DWELLING',

    update(delta) {
      const segLen = segmentLengths[currentSegment] || 1;

      // Check upcoming station along route
      const upcomingStop = config.stops.find(s => s.waypointIndex === (currentSegment + 1) % waypoints.length);

      if (state === 'CRUISING') {
        currentSpeed = CRUISE_SPEED;
        // Turn off blinkers
        blinkers.forEach(b => { b.material = materials.blinkerOff; });

        // If approaching a scheduled stop within 28m, start smooth braking
        if (upcomingStop) {
          const distToEnd = (1 - segmentProgress) * segLen;
          if (distToEnd <= 28.0) {
            state = 'BRAKING';
          }
        }
      } else if (state === 'BRAKING') {
        const distToEnd = Math.max(0.1, (1 - segmentProgress) * segLen);
        currentSpeed = Math.max(4.0, CRUISE_SPEED * Math.sqrt(distToEnd / 28.0));
      } else if (state === 'DWELLING') {
        currentSpeed = 0;
        dwellTimer += delta;

        // Pulse amber hazard blinkers
        blinkerPulse += delta * 8;
        const blinkerOn = Math.sin(blinkerPulse) > 0;
        blinkers.forEach(b => { b.material = blinkerOn ? materials.blinkerOn : materials.blinkerOff; });

        if (dwellTimer >= maxDwellTime) {
          dwellTimer = 0;
          state = 'ACCELERATING';
          currentStation = null;
        }
      } else if (state === 'ACCELERATING') {
        currentSpeed = Math.min(CRUISE_SPEED, currentSpeed + delta * 26.0);
        if (currentSpeed >= CRUISE_SPEED * 0.95) {
          state = 'CRUISING';
        }
      }

      // Progress along route
      if (state !== 'DWELLING') {
        const moveDist = currentSpeed * delta;
        segmentProgress += moveDist / segLen;

        if (segmentProgress >= 1.0) {
          segmentProgress = 0;
          currentSegment = (currentSegment + 1) % waypoints.length;

          // Check if arrived at a station stop
          const arrivedStop = config.stops.find(s => s.waypointIndex === currentSegment);
          if (arrivedStop && state === 'BRAKING') {
            state = 'DWELLING';
            dwellTimer = 0;
            currentStation = arrivedStop;
            // Update next station target
            const stopIdx = config.stops.findIndex(s => s.id === arrivedStop.id);
            nextStation = config.stops[(stopIdx + 1) % config.stops.length];
          }
        }
      }

      // Update position & rotation
      const curStart = waypoints[currentSegment];
      const curEnd = waypoints[(currentSegment + 1) % waypoints.length];
      Vector3.LerpToRef(curStart, curEnd, segmentProgress, root.position);
      root.position.y=getTerrainHeight(root.position.x,root.position.z);

      const targetYaw = Math.atan2(curEnd.x - curStart.x, curEnd.z - curStart.z);
      // Smooth yaw rotation
      let diff = targetYaw - root.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      root.rotation.y += diff * Math.min(1, delta * 12);

      // Rotate wheels with actual transit speed
      if (currentSpeed > 0.1) {
        wheels.forEach(w => {
          w.rotation.x += delta * (currentSpeed * 1.8);
        });
      }
    },
  };
}

/**
 * Creates the entire 8-bus inter-village fleet and 16 correctly oriented shelters.
 */
export function createBusRoute(scene, shadows) {
  const steps = createBusRouteSteps(scene, shadows);
  let result;
  do { result = steps.next(); } while (!result.done);
  return result.value;
}

export function* createBusRouteSteps(scene, shadows) {
  const materials = {
    timber: makeMat(scene, 'bus-stop-timber', '#543621'),
    bench: makeMat(scene, 'bus-stop-bench', '#8b5a2b'),
    tileRoof: makeMat(scene, 'bus-stop-roof', '#b93b2a'),
    signYellow: makeMat(scene, 'bus-stop-sign', '#f59e0b', '#d97706'),
    chrome: makeMat(scene, 'bus-chrome', '#f8fafc'),
    glass: makeMat(scene, 'bus-glass', '#bae6fd', '#38bdf8'),
    tire: makeMat(scene, 'bus-tire', '#1e293b'),
    headlight: makeMat(scene, 'bus-headlight', '#ffffff', '#fef08a'),
    taillight: makeMat(scene, 'bus-taillight', '#ef4444', '#b91c1c'),
    blinkerOff: makeMat(scene, 'bus-blinker-off', '#78350f'),
    blinkerOn: makeMat(scene, 'bus-blinker-on', '#f59e0b', '#fbbf24'),
  };
  materials.glass.alpha = 0.55;

  // 19 Chibi Ghibli Bus Stop Shelters - 100% CORRECTLY FACING ROADS:
  // 4 Trạm cuối (Gateway Terminals) tại 4 cửa ngõ giáp Quảng trường trung tâm (Bắc, Nam, Đông, Tây)
  // Xe buýt từ các làng chạy đến các trạm này dừng đón/trả khách rồi quay đầu, tuyệt đối không vào quảng trường.
  const shelters = [
    // 1. Bốn trạm cuối Gateway Terminals tại 4 cửa ngõ Quảng trường:
    { x: 5.4, z: 54, name: 'Trạm Cửa Nam - Quảng Trường', badge: 'Tuyến 01 · 02', rot: Math.PI / 2 },
    { x: 5.4, z: -54, name: 'Trạm Cửa Bắc - Tòa Thị Chính', badge: 'Tuyến 03', rot: Math.PI / 2 },
    { x: -54, z: 5.4, name: 'Trạm Cửa Tây - Phố Chợ', badge: 'Tuyến 04A', rot: 0 },
    { x: 54, z: 5.4, name: 'Trạm Cửa Đông - Hồ Pha Lê', badge: 'Tuyến 04B', rot: 0 },

    // 2. Trục Đại lộ Nam (x = 0):
    { x: 5.2, z: 86, name: 'Làng Bình Minh', badge: 'T1 · T2', rot: Math.PI / 2 },
    { ...COASTAL_BUS_CONFIG.shelter, name: 'Bãi Biển Bình Minh', badge: 'Tuyến 02', rot: Math.PI },
    { x: 5.2, z: -394, name: 'Làng Phú Điền', badge: 'Tuyến 03', rot: Math.PI / 2 },

    // 3. Trục Quốc Lộ 86 (z = 86):
    { x: -300, z: 80.8, name: 'Làng Hoa Mai', badge: 'Tuyến 01', rot: Math.PI },
    { x: -594, z: 80.8, name: 'Làng Đồi Gió', badge: 'Tuyến 01', rot: Math.PI },
    { x: 300, z: 80.8, name: 'Làng Ven Sông', badge: 'T1 · T4', rot: Math.PI },
    { x: 594, z: 80.8, name: 'Làng An Nhiên', badge: 'Tuyến 01', rot: Math.PI },

    // 4. Trục Quốc Lộ Nam 406 (z = 406):
    { x: -300, z: 400.8, name: 'Làng Thu Phong', badge: 'Tuyến 02', rot: Math.PI },
    { x: 300, z: 400.8, name: 'Làng Hướng Dương', badge: 'Tuyến 02', rot: Math.PI },

    // 5. Trục Quốc Lộ Bắc -234 (z = -234):
    { x: -300, z: -239.2, name: 'Làng Thanh Hà', badge: 'Tuyến 03', rot: Math.PI },
    { x: -594, z: -239.2, name: 'Làng Mộc Lan', badge: 'Tuyến 03', rot: Math.PI },
    { x: 300, z: -239.2, name: 'Làng Tân Lộc', badge: 'Tuyến 03', rot: Math.PI },
    { x: 594, z: -239.2, name: 'Làng Hải Vân', badge: 'Tuyến 03', rot: Math.PI },

    // 6. Trục Phố Chợ & Vùng Hồ:
    { x: -118, z: 5.4, name: 'Phố Chợ Phía Tây', badge: 'Tuyến 04A', rot: 0 },
    { x: LAKE_CONFIG.busStop.x, z: LAKE_CONFIG.busStop.z, name: 'Hồ Pha Lê', badge: 'Tuyến 04B', rot: 0 },
  ];

  for (const s of shelters) {
    createBusStopShelter(scene, s.x, s.z, s.name, s.badge, materials, s.rot);
    yield;
  }

  // Fleet Waypoints & Stops:
  // Tốc độ Siêu Tốc Express: 48.0 m/s (~173 km/h - di chuyển cực nhanh qua các làng mà vẫn 100% vật lý 3D)
  const CRUISE_SPEED = 48.0;

  // ROUTE 01: Hoa Mai Express - Highway 86 (Bến cuối tại Trạm Cửa Nam z = 54, quay đầu tại z = 50)
  const route01Waypoints = [
    new Vector3(0, 0, 54),    // 0: Trạm Cửa Nam - Quảng Trường
    new Vector3(0, 0, 50),    // 1: Quay đầu Cửa Nam
    new Vector3(0, 0, 86),    // 2: Trạm Bình Minh
    new Vector3(-300, 0, 86), // 3: Trạm Hoa Mai
    new Vector3(-594, 0, 86), // 4: Trạm Đồi Gió
    new Vector3(-612, 0, 86), // 5: Turnaround Tây
    new Vector3(-594, 0, 86), // 6: Trạm Đồi Gió
    new Vector3(-300, 0, 86), // 7: Trạm Hoa Mai
    new Vector3(0, 0, 86),    // 8: Trạm Bình Minh
    new Vector3(300, 0, 86),  // 9: Trạm Ven Sông
    new Vector3(594, 0, 86),  // 10: Trạm An Nhiên
    new Vector3(612, 0, 86),  // 11: Turnaround Đông
    new Vector3(594, 0, 86),  // 12: Trạm An Nhiên
    new Vector3(300, 0, 86),  // 13: Trạm Ven Sông
    new Vector3(0, 0, 86),    // 14: Trạm Bình Minh
  ];
  const route01Stops = [
    { id: 'stop-south-gate', name: 'Trạm Cửa Nam - Quảng Trường', waypointIndex: 0 },
    { id: 'stop-bm', name: 'Làng Bình Minh', waypointIndex: 2 },
    { id: 'stop-hm', name: 'Làng Hoa Mai', waypointIndex: 3 },
    { id: 'stop-dg', name: 'Làng Đồi Gió', waypointIndex: 4 },
    { id: 'stop-vs', name: 'Làng Ven Sông', waypointIndex: 9 },
    { id: 'stop-an', name: 'Làng An Nhiên', waypointIndex: 10 },
  ];

  // ROUTE 02: Biển Xanh Coastal - Highway 406 (Bến cuối tại Trạm Cửa Nam z = 54, quay đầu tại z = 50)
  const route02Waypoints = COASTAL_BUS_CONFIG.waypoints.map(([x,z])=>new Vector3(x,0,z));
  const route02Stops = [
    { id: 'stop-south-gate', name: 'Trạm Cửa Nam - Quảng Trường', waypointIndex: 0 },
    { id: 'stop-bm', name: 'Làng Bình Minh', waypointIndex: 2 },
    { id: 'stop-beach', name: 'Bãi Biển Bình Minh', waypointIndex: COASTAL_BUS_CONFIG.stops.beach },
    { id: 'stop-tp', name: 'Làng Thu Phong', waypointIndex: COASTAL_BUS_CONFIG.stops.thuPhong },
    { id: 'stop-hd', name: 'Làng Hướng Dương', waypointIndex: COASTAL_BUS_CONFIG.stops.huongDuong },
  ];

  // ROUTE 03: Cao Nguyên Highland - Northern Highway -234 & Phu Dien (Bến cuối tại Trạm Cửa Bắc z = -54, quay đầu tại z = -50)
  const route03Waypoints = [
    new Vector3(0, 0, -54),    // 0: Trạm Cửa Bắc - Tòa Thị Chính
    new Vector3(0, 0, -50),    // 1: Quay đầu Cửa Bắc
    new Vector3(0, 0, -90),    // 2: Tòa Thị Chính
    new Vector3(0, 0, -234),   // 3: Ngã tư QL -234
    new Vector3(-300, 0, -234),// 4: Trạm Thanh Hà
    new Vector3(-594, 0, -234),// 5: Trạm Mộc Lan
    new Vector3(-612, 0, -234),// 6: Turnaround Tây
    new Vector3(-300, 0, -234),// 7: Trạm Thanh Hà
    new Vector3(0, 0, -234),   // 8: Ngã tư QL -234
    new Vector3(0, 0, -394),   // 9: Trạm Phú Điền
    new Vector3(0, 0, -408),   // 10: Turnaround Phú Điền
    new Vector3(0, 0, -234),   // 11: Ngã tư QL -234
    new Vector3(300, 0, -234), // 12: Trạm Tân Lộc
    new Vector3(594, 0, -234), // 13: Trạm Hải Vân
    new Vector3(612, 0, -234), // 14: Turnaround Đông
    new Vector3(300, 0, -234), // 15: Trạm Tân Lộc
    new Vector3(0, 0, -234),   // 16: Ngã tư QL -234
    new Vector3(0, 0, -90),    // 17: Tòa Thị Chính
  ];
  const route03Stops = [
    { id: 'stop-north-gate', name: 'Trạm Cửa Bắc - Tòa Thị Chính', waypointIndex: 0 },
    { id: 'stop-th', name: 'Làng Thanh Hà', waypointIndex: 4 },
    { id: 'stop-ml', name: 'Làng Mộc Lan', waypointIndex: 5 },
    { id: 'stop-pd', name: 'Làng Phú Điền', waypointIndex: 9 },
    { id: 'stop-tl', name: 'Làng Tân Lộc', waypointIndex: 12 },
    { id: 'stop-hv', name: 'Làng Hải Vân', waypointIndex: 13 },
  ];

  // ROUTE 04A: Phố Chợ Phía Tây Shuttle (Bến cuối tại Trạm Cửa Tây x = -54, quay đầu tại x = -50)
  const route04AWaypoints = [
    new Vector3(-54, 0, 0),    // 0: Trạm Cửa Tây - Phố Chợ
    new Vector3(-50, 0, 0),    // 1: Quay đầu Cửa Tây
    new Vector3(-84, 0, 0),    // 2: Đại lộ Tây
    new Vector3(-118, 0, 0),   // 3: Trạm Phố Chợ Phía Tây
    new Vector3(-130, 0, 0),   // 4: Turnaround Chợ Tây
    new Vector3(-118, 0, 0),   // 5: Trạm Phố Chợ Phía Tây
    new Vector3(-84, 0, 0),    // 6: Đại lộ Tây
  ];
  const route04AStops = [
    { id: 'stop-west-gate', name: 'Trạm Cửa Tây - Phố Chợ', waypointIndex: 0 },
    { id: 'stop-market', name: 'Phố Chợ Phía Tây', waypointIndex: 3 },
  ];

  // ROUTE 04B: Hồ Pha Lê & Bến Câu Cá Shuttle (Bến cuối tại Trạm Cửa Đông x = 54, quay đầu tại x = 50)
  const route04BWaypoints = [
    new Vector3(54, 0, 0),     // 0: Trạm Cửa Đông - Hồ Pha Lê
    new Vector3(50, 0, 0),     // 1: Quay đầu Cửa Đông
    new Vector3(84, 0, 0),     // 2: Đại lộ Đông
    new Vector3(LAKE_CONFIG.busStop.x, 0, 0), // 3: Trạm trên đất liền
    new Vector3(LAKE_CONFIG.busStop.turnX, 0, 0), // 4: Quay đầu trước lối bộ hành
    new Vector3(LAKE_CONFIG.busStop.x, 0, 0), // 5: Trạm Hồ Pha Lê
    new Vector3(84, 0, 0),     // 6: Đại lộ Đông
  ];
  const route04BStops = [
    { id: 'stop-east-gate', name: 'Trạm Cửa Đông - Hồ Pha Lê', waypointIndex: 0 },
    { id: 'stop-lake', name: 'Hồ Pha Lê', waypointIndex: 3 },
  ];

  // === ĐỘI HÌNH 8 XE BUÝT CHIBI CHẠY LIÊN TỤC SONG SONG (Hạn chế tối đa thời gian chờ) ===
  // Tuyến 01: 2 xe chạy đối xứng trục QL 86
  const bus1A = createChibiBus(scene, shadows, {
    id: 'bus-01A',
    routeCode: '01A',
    routeName: 'Hoa Mai Express',
    bodyColor: PLAY_TOGETHER_PALETTE.pastels.bananaYellow,
    accentColor: PLAY_TOGETHER_PALETTE.pastels.creamyVanilla,
    ledColor: '#facc15',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route01Waypoints,
    stops: route01Stops,
    initialSegment: 0,
    initialProgress: 0.1,
  }, materials);

  yield;
  const bus1B = createChibiBus(scene, shadows, {
    id: 'bus-01B',
    routeCode: '01B',
    routeName: 'Hoa Mai Express',
    bodyColor: '#fb923c', // Cam mật ong Chibi
    accentColor: PLAY_TOGETHER_PALETTE.pastels.creamyVanilla,
    ledColor: '#fb923c',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route01Waypoints,
    stops: route01Stops,
    initialSegment: 8,
    initialProgress: 0.4,
  }, materials);

  // Tuyến 02: 2 xe chạy đối xứng trục Biển & Làng Nam 406
  yield;
  const bus2A = createChibiBus(scene, shadows, {
    id: 'bus-02A',
    routeCode: '02A',
    routeName: 'Biển Xanh Coastal',
    bodyColor: '#34d399',
    accentColor: PLAY_TOGETHER_PALETTE.pastels.creamyVanilla,
    ledColor: '#34d399',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route02Waypoints,
    stops: route02Stops,
    initialSegment: 0,
    initialProgress: 0.1,
  }, materials);

  yield;
  const bus2B = createChibiBus(scene, shadows, {
    id: 'bus-02B',
    routeCode: '02B',
    routeName: 'Biển Xanh Coastal',
    bodyColor: '#2dd4bf', // Xanh mòng két ngọc bích
    accentColor: PLAY_TOGETHER_PALETTE.pastels.creamyVanilla,
    ledColor: '#2dd4bf',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route02Waypoints,
    stops: route02Stops,
    initialSegment: 7,
    initialProgress: 0.5,
  }, materials);

  // Tuyến 03: 2 xe chạy đối xứng trục Cao Nguyên & Làng Bắc -234
  yield;
  const bus3A = createChibiBus(scene, shadows, {
    id: 'bus-03A',
    routeCode: '03A',
    routeName: 'Cao Nguyên Line',
    bodyColor: '#fb7185',
    accentColor: PLAY_TOGETHER_PALETTE.pastels.creamyVanilla,
    ledColor: '#fb7185',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route03Waypoints,
    stops: route03Stops,
    initialSegment: 0,
    initialProgress: 0.1,
  }, materials);

  yield;
  const bus3B = createChibiBus(scene, shadows, {
    id: 'bus-03B',
    routeCode: '03B',
    routeName: 'Cao Nguyên Line',
    bodyColor: '#a78bfa', // Tím hoa cà Lavender
    accentColor: PLAY_TOGETHER_PALETTE.pastels.creamyVanilla,
    ledColor: '#a78bfa',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route03Waypoints,
    stops: route03Stops,
    initialSegment: 9,
    initialProgress: 0.5,
  }, materials);

  // Tuyến 04A: Xe đưa đón Phố Chợ Phía Tây
  yield;
  const bus4A = createChibiBus(scene, shadows, {
    id: 'bus-04A',
    routeCode: '04A',
    routeName: 'Phố Chợ Tây',
    bodyColor: '#38bdf8',
    accentColor: PLAY_TOGETHER_PALETTE.pastels.creamyVanilla,
    ledColor: '#38bdf8',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route04AWaypoints,
    stops: route04AStops,
    initialSegment: 0,
    initialProgress: 0.1,
  }, materials);

  // Tuyến 04B: Xe đưa đón Hồ Pha Lê & Bến Câu Cá
  yield;
  const bus4B = createChibiBus(scene, shadows, {
    id: 'bus-04B',
    routeCode: '04B',
    routeName: 'Hồ Pha Lê Scenic',
    bodyColor: '#818cf8', // Lam chàm hoàng gia
    accentColor: PLAY_TOGETHER_PALETTE.pastels.creamyVanilla,
    ledColor: '#818cf8',
    cruiseSpeed: CRUISE_SPEED,
    waypoints: route04BWaypoints,
    stops: route04BStops,
    initialSegment: 0,
    initialProgress: 0.1,
  }, materials);

  yield;
  const buses = [bus1A, bus1B, bus2A, bus2B, bus3A, bus3B, bus4A, bus4B];

  // Transit Management State
  let activeRidingBusId = null;

  return {
    buses,

    getNearbyBoardableBus(playerPos, radius = 6.5) {
      if (activeRidingBusId) return null;
      for (const bus of buses) {
        if (bus.isDwelling()) {
          const dist = Vector3.Distance(bus.root.position, playerPos);
          if (dist <= radius) {
            return {
              bus,
              dist,
              station: bus.getCurrentStation(),
              dwellRemaining: bus.getDwellRemaining(),
            };
          }
        }
      }
      return null;
    },

    boardBus(busId, playerRoot) {
      const bus = buses.find(b => b.id === busId);
      if (!bus) return false;
      activeRidingBusId = busId;
      // Snap player into bus cabin
      playerRoot.position.copyFrom(bus.passengerSeatNode.getAbsolutePosition());
      playerRoot.rotation.y = bus.root.rotation.y;
      return true;
    },

    alightBus(playerRoot) {
      if (!activeRidingBusId) return false;
      const bus = buses.find(b => b.id === activeRidingBusId);
      activeRidingBusId = null;
      if (bus && playerRoot) {
        // Drop player safely onto the sidewalk platform beside the bus door
        const forward = bus.root.forward;
        const right = new Vector3(forward.z, 0, -forward.x);
        const exitPos = bus.root.position.add(right.scale(3.4));
        exitPos.y = 0;
        playerRoot.position.copyFrom(exitPos);
      }
      return true;
    },

    getActiveRide() {
      if (!activeRidingBusId) return null;
      const bus = buses.find(b => b.id === activeRidingBusId);
      if (!bus) return null;
      return {
        busId: bus.id,
        routeCode: bus.routeCode,
        routeName: bus.routeName,
        bodyColor: bus.bodyColor,
        speed: Math.round(bus.getCurrentSpeed()),
        isDwelling: bus.isDwelling(),
        dwellRemaining: Math.ceil(bus.getDwellRemaining()),
        currentStation: bus.getCurrentStation()?.name || null,
        nextStation: bus.getNextStation()?.name || null,
        scenicPoi: getScenicPoiDescriptor(bus.root.position),
        busRoot: bus.root,
        passengerSeatNode: bus.passengerSeatNode,
      };
    },

    isPlayerRiding() {
      return Boolean(activeRidingBusId);
    },

    update(delta, playerPos) {
      // Update each bus in the 8-bus fleet
      buses.forEach(b => b.update(delta));

      const activeRide = this.getActiveRide();
      const nearbyBoardable = playerPos ? this.getNearbyBoardableBus(playerPos) : null;

      return {
        activeRide,
        nearbyBoardable: nearbyBoardable ? {
          busId: nearbyBoardable.bus.id,
          routeCode: nearbyBoardable.bus.routeCode,
          routeName: nearbyBoardable.bus.routeName,
          bodyColor: nearbyBoardable.bus.bodyColor,
          stationName: nearbyBoardable.station?.name || 'Trạm xe buýt',
          dwellRemaining: Math.ceil(nearbyBoardable.dwellRemaining),
        } : null,
      };
    },
  };
}
