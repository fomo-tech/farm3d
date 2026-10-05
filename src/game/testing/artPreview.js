import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import '@babylonjs/core/Meshes/Builders/boxBuilder.js';
import '@babylonjs/core/Meshes/Builders/sphereBuilder.js';
import '@babylonjs/core/Meshes/Builders/cylinderBuilder.js';
import '@babylonjs/core/Meshes/Builders/planeBuilder.js';
import '@babylonjs/core/Meshes/Builders/torusBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { createCasinoLoungeInterior } from '../world/landmarks/createCasinoInterior.js';
import { addShopFacade, addTerracottaGableRoof } from '../world/landmarks/createPlayTogetherPlaza.js';
import { createCozyMaterial, WORLD_PALETTE } from '../world/worldDesignSystem.js';
import { SHOP_CONFIG } from '../../../shared/shopConfig.js';
import { buildHumanMesh } from '../player/buildHumanMesh.js';
import { CasinoTableView } from '../casino/CasinoTableView.js';
import { VENUE_LAYOUT } from '../../../shared/venueLayout.js';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { CasinoTable } from '../../components/casino/CasinoTable.jsx';
import '../../components/casino.css';
import '../../components/casino/lounge.css';
import { VehicleShowroom } from '../../components/VehicleShowroom.jsx';
import { VEHICLE_LIST } from '../../../shared/vehicleConfig.js';

// Actual production builders, isolated from account state and networking.
const canvas = document.querySelector('#view');
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
scene.clearColor = new Color4(.78, .91, .98, 1);
const casino = new URLSearchParams(location.search).get('scene') !== 'shops';
const camera = new ArcRotateCamera('art-camera', casino ? -Math.PI / 2 : Math.PI / 2, casino ? 1.36 : 1.17, casino ? 19 : 38, new Vector3(0, casino ? 3 : 5, casino ? 1 : 0), scene);
camera.attachControl(canvas, true);
camera.lowerRadiusLimit = 4;
const fill = new HemisphericLight('art-fill', new Vector3(.3, 1, -.4), scene);
fill.intensity = .85;
fill.groundColor = Color3.FromHexString('#b5bfd0');
async function buildPreview() {
if (new URLSearchParams(location.search).get('scene') === 'vehicles') {
  canvas.hidden = true;
  document.querySelector('aside').hidden = true;
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;inset:0;overflow:auto;background:#f7f4ec;padding:24px;box-sizing:border-box;font-family:system-ui';
  document.body.appendChild(host);
  const title = document.createElement('h2'); title.textContent = 'Gara 3D · Preview không dùng tài khoản'; host.appendChild(title);
  const mount = document.createElement('div'); mount.style.cssText = 'max-width:1000px;margin:auto'; host.appendChild(mount);
  const root = createRoot(mount);
  root.render(React.createElement(VehicleShowroom, { vehicles: VEHICLE_LIST, owned: VEHICLE_LIST.map(vehicle => vehicle.id), current: 'walk', coins: 0, connected: false, onBuy: () => {} }));
  addEventListener('pagehide', () => root.unmount(), { once: true });
  return;
}
if (casino) {
  const builder = createCasinoLoungeInterior(scene, { interior: { x: 0, y: 0, z: 0 } }, null);
  // Match cooperative production construction, do not block one browser frame.
  for (const step of builder) await new Promise(resolve => requestAnimationFrame(resolve));
  const avatar = buildHumanMesh(scene, 'art-player', { gender: 'male', outfitColor: '#74c9b8' });
  avatar.root.position.set(0, 0, -7);
  if (new URLSearchParams(location.search).has('animation')) {
    avatar.root.setEnabled(false);
    const game = new URLSearchParams(location.search).get('animation') || 'tai-xiu';
    const live = new CasinoTableView(scene);
    const panel = document.querySelector('aside');
    panel.innerHTML = '<b>Kiểm tra animation 3D thật · Không dùng tài khoản</b><p></p>';
    const phases = game === 'bai-cao' || game === 'tien-len' ? ['dealing','playing','result'] : ['open','shaking','reveal','result'];
    const status = document.createElement('p'); status.id = 'status'; panel.appendChild(status);
    let previous = '';
    let changedFrames = 0;
    function showPhase(phase) {
      live.update({ game, round: { phase, hand: game === 'bai-cao' ? [0,5,10] : game === 'tien-len' ? [0,5,10,15,20,25,30,35,40,45,48,49,50] : [], totals: { tai: 40 }, result: phase === 'reveal' || phase === 'result' ? { dice: [2,4,6], symbols: ['bau','cua','ca'] } : null } });
      live.root.position.x -= VENUE_LAYOUT.casino.interior.x;
      live.root.position.y -= VENUE_LAYOUT.casino.interior.y;
      live.root.position.z -= VENUE_LAYOUT.casino.interior.z;
      live.setEnabled(true);
      camera.target.set(live.root.position.x, 1.2, live.root.position.z);
      camera.radius = 7.4; camera.beta = 0.76;
      changedFrames = 0;
    }
    phases.forEach(phase => {
      const button = document.createElement('button'); button.textContent = phase;
      button.onclick = () => showPhase(phase); panel.appendChild(button);
    });
    scene.onAfterRenderObservable.add(() => {
      const bowl = scene.getMeshByName('tx-3d-bowl');
      const signature = JSON.stringify([...live.dice, ...live.cards, ...live.chips, ...(game === 'tai-xiu' && bowl ? [bowl] : [])].filter(mesh => mesh.isEnabled()).map(mesh => [mesh.position.asArray(), mesh.rotation.asArray()]));
      if (signature !== previous) changedFrames++;
      previous = signature;
      status.textContent = `${game} · ${live.phase} · ${changedFrames} khung hình thay đổi · ${live.animationFrames || 0} frames`;
    });
    showPhase(phases[0]);
  }
  if (new URLSearchParams(location.search).get('table') === 'tai-xiu') {
    camera.target.set(-6.5, 1.2, -3.5);
    camera.radius = 7.4;
    camera.beta = 0.76;
    scene.getMeshByName('tx-3d-sign-label')?.setEnabled(false);
    document.querySelector('aside').hidden = true;
    const hud = document.createElement('div');
    hud.className = 'cq-root-wrapper';
    document.body.appendChild(hud);
    const previewRoot = createRoot(hud);
    function PreviewTable() {
      const [seatList, setSeats] = React.useState(Array(8).fill(null));
      return React.createElement(CasinoTable, {
        room: { id: 'preview', name: 'Bàn thử giao diện', game: 'tai-xiu', stake: 10, seatList, round: { phase: 'open', id: 'preview-round', participating: true, bets: {} } },
        state: { viewerId: 'preview' }, coins: 1000, connected: true, inside: true, seconds: 30,
        // Local-only UI fixture: no account, network, or currency writes.
        onAct: action => { if (action.kind === 'seat') setSeats(seatList.map((_, index) => index === action.seat ? { playerId: 'preview', name: 'Bạn thử giao diện', coins: 1000 } : null)); },
        onToggleSound: () => {}, onReturnLobby: () => { location.href = '/art-preview.html?scene=casino'; },
      });
    }
    previewRoot.render(React.createElement(PreviewTable));
    addEventListener('pagehide', () => previewRoot.unmount(), { once: true });
  }
} else {
  const kinds = ['supplies', 'fashion', 'casino'];
  kinds.forEach((kind, index) => {
    const root = new TransformNode(`${kind}-art-building`, scene);
    root.position.x = (index - 1) * 20;
    const style = SHOP_CONFIG[kind];
    const mats = {
      timber: createCozyMaterial(scene, `${kind}-timber`, style.wall),
      timberWarm: createCozyMaterial(scene, `${kind}-trim`, '#fff4e3'),
      roofTile: createCozyMaterial(scene, `${kind}-roof`, style.roof),
      roofRidge: createCozyMaterial(scene, `${kind}-ridge`, style.accent),
    };
    const body = MeshBuilder.CreateBox(`${kind}-body`, { width: 13.6, height: 8, depth: 12 }, scene);
    body.position.y = 4;
    body.parent = root;
    body.material = mats.timber;
    addShopFacade(scene, root, kind, style.glass, style.accent, mats);
    addTerracottaGableRoof(scene, root, 13.6, 12, 8, mats, null);
  });
  const ground = MeshBuilder.CreateBox('art-ground', { width: 100, height: .1, depth: 70 }, scene);
  ground.material = createCozyMaterial(scene, 'art-paving', WORLD_PALETTE.plazaMarbleWhite);
}
document.querySelector('#status').textContent = `${casino ? 'Hội quán' : 'Ba mặt tiền dùng chung'} · ${scene.meshes.length} meshes · Kéo chuột để xem góc khác`;
engine.runRenderLoop(() => scene.render());
}
buildPreview().catch(error => {
  document.querySelector('#status').textContent = `Không dựng được preview: ${error.message}`;
});
addEventListener('resize', () => engine.resize());
addEventListener('pagehide', () => { scene.dispose(); engine.dispose(); }, { once: true });
