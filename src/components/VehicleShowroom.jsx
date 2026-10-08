import React from 'react';
import { HudIcon } from './icons3d/HudIcon.jsx';
import { useEffect, useRef, useState } from 'react';
import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { createVehicleRigs } from '../game/player/createVehicleRigs.js';
import { buildHumanMesh } from '../game/player/buildHumanMesh.js';
import { applyVehiclePose } from '../game/player/applyVehiclePose.js';
import { PreviewFrameGate } from '../game/rendering/PreviewFrameGate.js';
import './VehicleShowroom.css';

const catalogueArt = new Map();
let captureQueue = Promise.resolve();
function captureCatalogue(items, receive, isCancelled) {
  captureQueue = captureQueue.catch(() => {}).then(async () => {
    const missing = items.filter(item => !catalogueArt.has(item.id));
    if (!missing.length || isCancelled()) { if (!isCancelled()) receive(Object.fromEntries(catalogueArt)); return; }
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 192;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true });
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0,0,0,0);
    const camera = new ArcRotateCamera('catalogue-camera', .85, 1.1, 5, new Vector3(0,.6,0), scene);
    const light = new HemisphericLight('catalogue-light', new Vector3(-.4,1,.5), scene);
    light.intensity = .95;
    const root = new TransformNode('catalogue-root', scene);
    const rigs = createVehicleRigs(scene,root);
    try {
      for (const item of missing) {
        if (isCancelled()) break;
        rigs.setVehicle(item.id);
        await scene.whenReadyAsync();
        let min = new Vector3(Infinity,Infinity,Infinity), max = new Vector3(-Infinity,-Infinity,-Infinity);
        for (const mesh of scene.meshes.filter(mesh => mesh.isEnabled())) {
          mesh.computeWorldMatrix(true);
          const bounds = mesh.getBoundingInfo().boundingBox;
          min = Vector3.Minimize(min,bounds.minimumWorld); max = Vector3.Maximize(max,bounds.maximumWorld);
        }
        camera.target = min.add(max).scale(.5);
        const size = max.subtract(min);
        camera.radius = Math.max(1.8, Math.max(size.x,size.y,size.z)*1.8);
        scene.render();
        catalogueArt.set(item.id,canvas.toDataURL('image/webp',.85));
        if (!isCancelled()) receive(Object.fromEntries(catalogueArt));
      }
    } finally { rigs.dispose(); scene.dispose(); engine.dispose(); }
  });
  return captureQueue;
}

export function VehiclePreview({ id }) {

  const canvas = useRef(null);
  const rig = useRef(null);
  const selection = useRef(id);
  const driving = useRef(true);
  const dirty = useRef(true);
  const [playing, setPlaying] = useState(true);
  useEffect(() => { selection.current = id; rig.current?.setVehicle(id); dirty.current = true; }, [id]);
  useEffect(() => {
    const engine = new Engine(canvas.current, true, { preserveDrawingBuffer: true });
    engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio || 1, 1.5));
    const scene = new Scene(engine);
    scene.clearColor = Color4.FromHexString('#edf2e4ff');
    const camera = new ArcRotateCamera('garage-camera', 0.85, 1.1, 5.8, new Vector3(0, 0.9, 0), scene);
    camera.attachControl(canvas.current, true);
    camera.lowerRadiusLimit = 4; camera.upperRadiusLimit = 8;
    camera.lowerBetaLimit = 0.45; camera.upperBetaLimit = 1.45;
    camera.inputs.removeByType('ArcRotateCameraKeyboardMoveInput'); camera.panningSensibility = 0;
    const light = new HemisphericLight('garage-light', new Vector3(-0.4, 1, 0.5), scene);
    light.intensity = 0.85; light.groundColor = Color3.FromHexString('#bcc6ac');
    const parent = new TransformNode('garage-rider', scene);
    const human = buildHumanMesh(scene, 'garage-avatar', { outfitColor: '#53758a' }); human.root.parent = parent;
    const vehicles = createVehicleRigs(scene, parent); rig.current = vehicles;
    vehicles.setVehicle(selection.current);
    const stage = MeshBuilder.CreateCylinder('garage-platform', { diameter: 4.2, height: 0.12, tessellation: 64 }, scene);
    stage.position.y = -0.07;
    const stageMaterial = new StandardMaterial('garage-platform-material', scene);
    stageMaterial.diffuseColor = Color3.FromHexString('#c9cfb7'); stageMaterial.specularColor = Color3.Black(); stage.material = stageMaterial;
    let elapsed = 0;
    let visible = true;
    let frames = 0;
    let animationFrames = 0;
    const frameGate = new PreviewFrameGate(30);
    engine.runRenderLoop(() => {
      const cameraMoving = Math.abs(camera.inertialAlphaOffset) + Math.abs(camera.inertialBetaOffset) + Math.abs(camera.inertialRadiusOffset) > 0.0001;
      const step = frameGate.tick(performance.now(), { visible: visible && !document.hidden, animate: driving.current, dirty: dirty.current, cameraMoving });
      if (!step) return;
      const dt = step.delta; elapsed += dt;
      const speed = driving.current ? 6 : 0;
      if (step.animate || dirty.current) {
        human.animate(dt, false, 0);
        vehicles.update(dt, driving.current, speed, driving.current ? Math.sin(elapsed * 1.2) * 0.3 : 0);
        if (selection.current === 'walk') { human.torsoNode.position.z = 0; human.root.rotation.z = 0; }
        else applyVehiclePose(human, selection.current, driving.current, elapsed * speed * 2.4, vehicles.getRiderOffset());
      }
      scene.render();
      dirty.current = false;
      canvas.current.dataset.renderFrames = String(++frames);
      if (step.animate) animationFrames++;
      canvas.current.dataset.animationFrames = String(animationFrames);
    });
    const resize = new ResizeObserver(() => { engine.resize(); dirty.current = true; }); resize.observe(canvas.current);
    const intersection = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting !== false; if (visible) dirty.current = true; }); intersection.observe(canvas.current);
    const visibility = () => { if (!document.hidden) dirty.current = true; };
    document.addEventListener('visibilitychange', visibility);
    return () => { resize.disconnect(); intersection.disconnect(); document.removeEventListener('visibilitychange', visibility); rig.current = null; vehicles.dispose(); scene.dispose(); engine.dispose(); };
  }, []);
  return <div className="vehicle-preview"><canvas ref={canvas} aria-label="Xem xe · kéo để xoay" /><span className="vehicle-preview-badge">XEM THỬ</span><div className="vehicle-preview-controls"><button type="button" aria-pressed={playing} onClick={() => { driving.current = !driving.current; dirty.current = true; setPlaying(driving.current); }}>{playing ? 'Tạm dừng' : 'Chạy thử'}</button><small>Kéo để xoay · cuộn để phóng to</small></div></div>;
}

export function VehicleShowroom({ vehicles = [], owned = [], current = 'walk', coins = 0, connected, onBuy, onClose }) {
  const [selected, setSelected] = useState(current === 'walk' ? 'bike' : current);
  const [filter, setFilter] = useState('all');
  const [images, setImages] = useState({});
  useEffect(() => {
    let cancelled = false;
    captureCatalogue(vehicles.filter(item => item.id !== 'walk'), setImages, () => cancelled).catch(() => {});
    return () => { cancelled = true; };
  }, [vehicles]);
  const panel = useRef(null), close = useRef(onClose); close.current = onClose;
  const catalogue = vehicles.filter(item => item.id !== 'walk');
  const available = filter === 'owned' ? catalogue.filter(item => owned.includes(item.id)) : catalogue;
  const vehicle = available.find(item => item.id === selected) || available[0];
  const previewVehicle = vehicle || catalogue.find(item => item.id === selected) || catalogue[0];
  const ownedCount = catalogue.filter(item => owned.includes(item.id)).length;
  useEffect(() => {
    const previous = document.activeElement;
    panel.current?.querySelector('button')?.focus();
    const keyboard = event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close.current?.(); }
      if (event.key !== 'Tab') return;
      const controls = [...panel.current.querySelectorAll('button:not(:disabled),canvas')].filter(el => el.getClientRects().length && el.tabIndex >= 0);
      const first = controls[0], last = controls[controls.length-1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keyboard, true);
    return () => { document.removeEventListener('keydown', keyboard, true); if (previous?.isConnected) previous.focus(); };
  }, []);
  const isOwned = vehicle && owned.includes(vehicle.id);
  const isEquipped = vehicle && current === vehicle.id;
  const missingCoins = vehicle ? Math.max(0, vehicle.cost - coins) : 0;
  return <div className="farm-dealer-overlay" onClick={event => { if (event.target === event.currentTarget) onClose?.(); }}>
    <section className="farm-dealer" ref={panel} role="dialog" aria-modal="true" aria-labelledby="farm-dealer-title">
      <header className="farm-dealer-header"><span className="farm-dealer-logo"><HudIcon asset="bike" size={49}/></span><div><small>ĐẠI LÝ BÌNH MINH</small><h2 id="farm-dealer-title">Chọn xe, lên đường</h2></div><div className="farm-dealer-wallet"><HudIcon asset="coin" size={29}/><span><small>Xu của bạn</small><b>{Number(coins).toLocaleString('vi-VN')}</b></span></div><button className="farm-dealer-close" aria-label="Đóng đại lý xe" onClick={onClose}>×</button></header>
      <div className="farm-dealer-body">
        <aside className="farm-dealer-catalogue"><div className="farm-dealer-filters" role="group" aria-label="Danh mục xe"><button aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>Tất cả <small>{catalogue.length}</small></button><button aria-pressed={filter==='owned'} onClick={()=>setFilter('owned')}>Xe của tôi <small>{ownedCount}</small></button></div>
          <nav className="farm-dealer-list" aria-label="Chọn phương tiện">{available.map(item=><button key={item.id} aria-pressed={item.id===vehicle?.id} onClick={()=>setSelected(item.id)}><span className="farm-dealer-thumb">{images[item.id]?<img src={images[item.id]} alt=""/>:<HudIcon asset="bike" size={42}/>}</span><span className="farm-dealer-item-copy"><b>{item.name}</b><small>{item.category} · {item.speed} m/s</small><strong>{current===item.id?'Đang dùng':owned.includes(item.id)?'Đã sở hữu':`${item.cost.toLocaleString('vi-VN')} xu`}</strong></span><i aria-hidden="true">{item.id===vehicle?.id?'✓':'›'}</i></button>)}</nav>
          {!available.length && <div className="farm-dealer-empty"><HudIcon asset="bike" size={65}/><h3>Gara đang trống</h3><p>Chọn Tất cả để tìm chiếc xe đầu tiên của bạn.</p><button onClick={()=>setFilter('all')}>Xem mẫu xe</button></div>}
        </aside>
        <div className="farm-dealer-detail">{previewVehicle ? <VehiclePreview id={previewVehicle.id}/> : <p>Chưa có mẫu xe để trưng bày.</p>}
          {vehicle && <section className="farm-dealer-info" aria-live="polite"><div className="farm-dealer-title-row"><div><small>{vehicle.category}</small><h3>{vehicle.name}</h3></div><span className={`farm-dealer-ownership ${isOwned?'owned':''}`}>{isEquipped?'Đang sử dụng':isOwned?'Đã sở hữu':'Chưa sở hữu'}</span></div>
            <div className="farm-dealer-specs"><div><HudIcon asset="sprint" size={30}/><span><small>Tốc độ</small><b>{vehicle.speed} <em>m/s</em></b></span></div><div><HudIcon asset="bike" size={30}/><span><small>Loại xe</small><b>{vehicle.category}</b></span></div></div>
            <div className="farm-dealer-buy-row"><div><small>{isOwned?'Xe trong gara':'Giá bán'}</small><strong>{isOwned?'Đã mở khóa':`${vehicle.cost.toLocaleString('vi-VN')} xu`}</strong></div><button disabled={!connected||!onBuy||isEquipped||(!isOwned&&missingCoins>0)} onClick={()=>onBuy(vehicle)}>{isEquipped?'Đang sử dụng':isOwned?'Lên xe':'Mua xe'}</button></div>
            <p className="farm-dealer-notice" role="status">{!connected?'Đang kết nối lại…':!isOwned&&missingCoins>0?`Cần thêm ${missingCoins.toLocaleString('vi-VN')} xu để mua mẫu xe này.`:isEquipped?'Bạn đang sử dụng phương tiện này.':isOwned?'Xe đã sẵn sàng. Chọn Lên xe để sử dụng.':'Mua xe bằng xu để khám phá thị trấn.'}</p>
          </section>}
        </div>
      </div><footer className="farm-dealer-footer"><span><HudIcon asset="camera" size={22}/> Chọn chiếc xe cho chuyến đi tiếp theo</span><button onClick={onClose}>Tiếp tục khám phá</button></footer>
    </section>
  </div>;
}
