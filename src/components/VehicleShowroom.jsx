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

export function VehiclePreview({ id }) {
  const canvas = useRef(null);
  const rig = useRef(null);
  const selection = useRef(id);
  const driving = useRef(true);
  const dirty = useRef(true);
  const [playing, setPlaying] = useState(true);
  useEffect(() => { selection.current = id; rig.current?.setVehicle(id); dirty.current = true; }, [id]);
  useEffect(() => {
    const engine = new Engine(canvas.current, true, { preserveDrawingBuffer: false });
    engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio || 1, 1.5));
    const scene = new Scene(engine);
    scene.clearColor = Color4.FromHexString('#e5e9edff');
    const camera = new ArcRotateCamera('garage-camera', 0.85, 1.1, 5.8, new Vector3(0, 0.9, 0), scene);
    camera.attachControl(canvas.current, true);
    camera.lowerRadiusLimit = 4; camera.upperRadiusLimit = 8;
    camera.lowerBetaLimit = 0.45; camera.upperBetaLimit = 1.45;
    camera.inputs.removeByType('ArcRotateCameraKeyboardMoveInput'); camera.panningSensibility = 0;
    const light = new HemisphericLight('garage-light', new Vector3(-0.4, 1, 0.5), scene);
    light.intensity = 0.85; light.groundColor = Color3.FromHexString('#aab8c6');
    const parent = new TransformNode('garage-rider', scene);
    const human = buildHumanMesh(scene, 'garage-avatar', { outfitColor: '#53758a' }); human.root.parent = parent;
    const vehicles = createVehicleRigs(scene, parent); rig.current = vehicles;
    vehicles.setVehicle(selection.current);
    const stage = MeshBuilder.CreateCylinder('garage-platform', { diameter: 4.2, height: 0.12, tessellation: 64 }, scene);
    stage.position.y = -0.07;
    const stageMaterial = new StandardMaterial('garage-platform-material', scene);
    stageMaterial.diffuseColor = Color3.FromHexString('#a8b5bf'); stageMaterial.specularColor = Color3.Black(); stage.material = stageMaterial;
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
  return <div className="vehicle-preview"><canvas ref={canvas} aria-label="Xem xe 3D · kéo để xoay" /><span className="vehicle-preview-badge">XEM THỬ 3D</span><div className="vehicle-preview-controls"><button type="button" aria-pressed={playing} onClick={() => { driving.current = !driving.current; dirty.current = true; setPlaying(driving.current); }}>{playing ? 'Tạm dừng' : 'Chạy thử'}</button><small>Kéo để xoay · cuộn để phóng to</small></div></div>;
}

export function VehicleShowroom({ vehicles, owned, current, coins, connected, onBuy }) {
  const [selected, setSelected] = useState(current === 'walk' ? 'bike' : current);
  const vehicle = vehicles.find(item => item.id === selected) || vehicles[0];
  if (!vehicle) return <p>Chưa có phương tiện để trưng bày.</p>;
  const isOwned = owned.includes(vehicle.id);
  const isEquipped = current === vehicle.id;
  const missingCoins = Math.max(0, vehicle.cost - coins);
  return <div className="vehicle-showroom">
    <header className="vehicle-showroom-heading"><div><span>ĐẠI LÝ PHƯƠNG TIỆN</span><h2>Chọn xe, xem thử rồi lên đường</h2></div><div className="vehicle-wallet">Xu của bạn <strong>{Number(coins || 0).toLocaleString('vi-VN')}</strong></div></header>
    <VehiclePreview id={vehicle.id} />
    <section className="vehicle-showroom-info" aria-live="polite">
      <span className="vehicle-category">{vehicle.category}</span>
      <h3>{vehicle.name}</h3>
      <div className="vehicle-spec"><span>Tốc độ</span><strong>{vehicle.speed} m/giây</strong></div>
      <div className="vehicle-spec"><span>Trạng thái</span><strong>{isEquipped ? 'Đang sử dụng' : isOwned ? 'Đã sở hữu' : 'Chưa sở hữu'}</strong></div>
      <div className="vehicle-price"><span>{isOwned ? 'Xe của bạn' : 'Giá bán'}</span><strong>{isOwned ? 'Đã mở khóa' : `${vehicle.cost.toLocaleString('vi-VN')} xu`}</strong></div>
      <button type="button" disabled={!connected || isEquipped || (!isOwned && missingCoins > 0)} onClick={() => onBuy(vehicle)}>{isEquipped ? 'Đang sử dụng' : isOwned ? 'Lên xe' : 'Mua xe'}</button>
      {!connected && <p className="vehicle-notice">Đang chờ kết nối máy chủ…</p>}
      {connected && !isOwned && missingCoins > 0 && <p className="vehicle-notice">Cần thêm {missingCoins.toLocaleString('vi-VN')} xu để mua xe này.</p>}
    </section>
    <nav aria-label="Chọn phương tiện"><div className="vehicle-list-heading"><strong>Các mẫu xe</strong><small>{vehicles.length} phương tiện</small></div><div className="vehicle-list-track">{vehicles.map(item => <button type="button" key={item.id} aria-pressed={item.id === vehicle.id} onClick={() => setSelected(item.id)}><i aria-hidden="true">{item.icon}</i><b>{item.name}</b><small>{current === item.id ? 'Đang dùng' : owned.includes(item.id) ? 'Đã có' : `${item.cost.toLocaleString('vi-VN')} xu`}</small></button>)}</div></nav>
  </div>;
}
