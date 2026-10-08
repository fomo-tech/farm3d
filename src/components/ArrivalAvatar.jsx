import { useEffect, useRef, useState } from 'react';
import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color4 } from '@babylonjs/core/Maths/math.color.js';
import { buildHumanMesh } from '../game/player/buildHumanMesh.js';

export function ArrivalAvatar({ outfit, color, gender = 'male', hair = 'hair_buzzcut', hairColor = '#76503b', skinTone = 'peach' }) {
  const mobile = useRef(window.matchMedia('(pointer: coarse), (max-width: 900px)').matches).current;
  const [failed, setFailed] = useState(false);
  const canvas = useRef(null);
  const model = useRef(null);
  const latest = useRef({ outfit, color, gender, hair, hairColor, skinTone });
  latest.current = { outfit, color, gender, hair, hairColor, skinTone };
  useEffect(() => {
    if (mobile || failed || !canvas.current) return;
    let engine, scene, resize, stopped = false;
    const cleanup = () => {
      if (stopped) return;
      stopped = true;
      resize?.disconnect();
      model.current = null;
      try { scene?.dispose(); } catch (error) { window.__farmDebug?.report(error, 'PREVIEW CLEANUP'); }
      try { engine?.dispose(); } catch (error) { window.__farmDebug?.report(error, 'PREVIEW CLEANUP'); }
    };
    const fail = error => {
      window.__farmDebug?.report(error, 'AVATAR PREVIEW');
      cleanup();
      setFailed(true);
    };
    try {
      engine = new Engine(canvas.current, false, { stencil: false, alpha: true, preserveDrawingBuffer: false });
      engine.setHardwareScalingLevel(1 / Math.min(devicePixelRatio || 1, 1.5));
      scene = new Scene(engine);
      scene.clearColor = new Color4(0, 0, 0, 0);
      const camera = new ArcRotateCamera('arrival-camera', Math.PI / 2, 1.40, 3.45, new Vector3(0, 0.95, 0), scene);
      camera.lowerRadiusLimit = camera.upperRadiusLimit = 3.45;
      camera.lowerBetaLimit = camera.upperBetaLimit = 1.40;
      camera.panningSensibility = 0;
      camera.attachControl(canvas.current, true);
      new HemisphericLight('arrival-light', new Vector3(0.3, 1, 1), scene).intensity = 0.95;
      model.current = buildHumanMesh(scene, 'arrival-avatar');
      model.current.setOutfit(latest.current.outfit, latest.current.color);
      if (latest.current.gender) model.current.setGender(latest.current.gender);
      if (latest.current.hair || latest.current.hairColor) model.current.setHair(latest.current.hair, latest.current.hairColor);
      if (latest.current.skinTone) model.current.setSkinTone(latest.current.skinTone);
      resize = new ResizeObserver(() => { if (!stopped) engine.resize(); });
      resize.observe(canvas.current);
      let lastTime = performance.now();
      engine.runRenderLoop(() => {
        if (!stopped) {
          try {
            const now = performance.now();
            const delta = Math.min(0.064, (now - lastTime) / 1000);
            lastTime = now;
            model.current?.animate(delta, false, 0);
            scene.render();
          } catch (error) { fail(error); }
        }
      });
      engine.onContextLostObservable.add(() => fail(new Error('Avatar preview context lost')));
    } catch (error) { fail(error); }
    return cleanup;
  }, [mobile, failed]);
  useEffect(() => {
    try {
      model.current?.setOutfit(outfit, color);
      if (gender) model.current?.setGender(gender);
      if (hair || hairColor) model.current?.setHair(hair, hairColor);
      if (skinTone) model.current?.setSkinTone(skinTone);
    } catch (error) {
      window.__farmDebug?.report(error, 'AVATAR OUTFIT');
      setFailed(true);
    }
  }, [outfit, color, gender, hair, hairColor, skinTone]);
  // A vector preview shares no GPU buffers/context with the running world.
  // Outfit selection still applies to the actual 3D player on confirmation.
  if (mobile || failed) return <svg className="arrival-avatar-canvas" viewBox="0 0 220 300" role="img" aria-label="Xem trước nhân vật và màu trang phục">
    <ellipse cx="110" cy="282" rx="55" ry="9" fill="#263d54" opacity=".18" />
    <path d="M88 213v54m44-54v54" stroke="#efd1b0" strokeWidth="17" strokeLinecap="round" />
    <path d="M78 170l-15 42m79-42l15 42" stroke="#efd1b0" strokeWidth="17" strokeLinecap="round" />
    <path d="M78 153q32-18 64 0l7 62H71z" fill={color || '#f8fafc'} stroke="#3c5367" strokeWidth="3" />
    <path d="M76 210h68v22H76z" fill="#38689b" />
    <ellipse cx="110" cy="104" rx="47" ry="50" fill="#f2cfad" stroke="#d6a580" strokeWidth="2" />
    <path d={hair === 'hair_buzzcut' || hair === 'buzzcut'
      ? 'M64 99q0-46 46-46t46 46l-5-13q-41-12-82 0z'
      : 'M64 103q-8-66 51-60 54 0 42 65l-20-31-30 16-29-7z'} fill={hairColor} />
    <ellipse cx="93" cy="109" rx="4" ry="6" fill="#28303c" /><ellipse cx="127" cy="109" rx="4" ry="6" fill="#28303c" />
    <path d="M100 130q10 10 20 0" fill="none" stroke="#9c583c" strokeWidth="3" strokeLinecap="round" />
    <path d="M77 272h24m19 0h24" stroke="#f8fafc" strokeWidth="14" strokeLinecap="round" />
  </svg>;
  return <canvas ref={canvas} className="arrival-avatar-canvas" aria-label="Nhân vật 3D — kéo để xoay" />;
}
