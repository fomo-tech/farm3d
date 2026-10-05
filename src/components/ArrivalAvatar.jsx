import { useEffect, useRef } from 'react';
import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color4 } from '@babylonjs/core/Maths/math.color.js';
import { buildHumanMesh } from '../game/player/buildHumanMesh.js';

export function ArrivalAvatar({ outfit, color }) {
  const canvas = useRef(null);
  const model = useRef(null);
  const latest = useRef({ outfit, color });
  latest.current = { outfit, color };
  useEffect(() => {
    const engine = new Engine(canvas.current, true, { stencil: true, alpha: true });
    engine.setHardwareScalingLevel(1 / Math.min(devicePixelRatio || 1, 1.5));
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 0);
    const camera = new ArcRotateCamera('arrival-camera', Math.PI / 2, 1.42, 3.6, new Vector3(0, 1.15, 0), scene);
    camera.lowerRadiusLimit = camera.upperRadiusLimit = 3.6;
    camera.lowerBetaLimit = camera.upperBetaLimit = 1.42;
    camera.panningSensibility = 0;
    camera.attachControl(canvas.current, true);
    new HemisphericLight('arrival-light', new Vector3(0.3, 1, 1), scene).intensity = 0.95;
    model.current = buildHumanMesh(scene, 'arrival-avatar');
    model.current.setOutfit(latest.current.outfit, latest.current.color);
    const resize = new ResizeObserver(() => engine.resize());
    resize.observe(canvas.current);
    engine.runRenderLoop(() => scene.render());
    return () => { resize.disconnect(); model.current = null; scene.dispose(); engine.dispose(); };
  }, []);
  useEffect(() => { model.current?.setOutfit(outfit, color); }, [outfit, color]);
  return <canvas ref={canvas} className="arrival-avatar-canvas" aria-label="Nhân vật 3D — kéo để xoay" />;
}
