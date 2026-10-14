import { installRotatedPointer } from '../game/input/rotatedPointer.js';
import { useEffect, useRef, useState } from 'react';
import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { getSkinTone } from '../../shared/characterConfig.js';
import { buildHumanMesh } from '../game/player/buildHumanMesh.js';

export function ArrivalAvatar({ outfit, color, gender = 'male', hair = 'hair_buzzcut', hairColor = '#76503b', skinTone = 'peach' }) {
  const mobile = useRef(document.documentElement.classList.contains('is-mobile-device') || window.matchMedia('(pointer: coarse)').matches).current;
  const [failed, setFailed] = useState(mobile);
  const canvas = useRef(null);
  const model = useRef(null);
  const latest = useRef({ outfit, color, gender, hair, hairColor, skinTone });
  latest.current = { outfit, color, gender, hair, hairColor, skinTone };
  useEffect(() => {
    if (failed || !canvas.current) return;
    let engine, scene, resize, antialiasing, stopped = false;
    const cleanup = () => {
      if (stopped) return;
      stopped = true;
      resize?.disconnect();
      model.current = null;
      try { antialiasing?.dispose(); scene?.dispose(); } catch (error) { window.__farmDebug?.report(error, 'PREVIEW CLEANUP'); }
      try { engine?.dispose(); } catch (error) { window.__farmDebug?.report(error, 'PREVIEW CLEANUP'); }
    };
    const fail = error => {
      window.__farmDebug?.report(error, 'AVATAR PREVIEW');
      cleanup();
      setFailed(true);
    };
    try {
      engine = new Engine(canvas.current, true, { antialias: true, stencil: false, alpha: true, preserveDrawingBuffer: false });
      installRotatedPointer(engine, canvas.current);
      // The small studio canvas can supersample at 1.5× on standard screens;
      // cap Retina rendering at 2× rather than scaling the entire game.
      const updateResolution = () => {
        if (stopped) return;
        engine.setHardwareScalingLevel(1 / Math.min(mobile ? 1.5 : 2, Math.max(mobile ? 1 : 1.5, window.devicePixelRatio || 1)));
        engine.resize();
      };
      updateResolution();
      scene = new Scene(engine);
      scene.clearColor = new Color4(0, 0, 0, 0);
      const camera = new ArcRotateCamera('arrival-camera', Math.PI / 2, 1.40, 3.45, new Vector3(0, 0.9, 0), scene);
      camera.lowerRadiusLimit = camera.upperRadiusLimit = 3.45;
      camera.lowerBetaLimit = camera.upperBetaLimit = 1.40;
      camera.panningSensibility = 0;
      camera.attachControl(canvas.current, true);
      antialiasing = new DefaultRenderingPipeline('arrival-antialiasing', false, scene, [camera]);
      antialiasing.imageProcessingEnabled = false;
      antialiasing.samples = engine.webGLVersion >= 2 ? Math.min(mobile ? 2 : 4, engine.getCaps().maxMSAASamples || 1) : 1;
      antialiasing.fxaaEnabled = antialiasing.samples < 2;
      new HemisphericLight('arrival-light', new Vector3(0.3, 1, 1), scene).intensity = 0.95;
      const platform = MeshBuilder.CreateCylinder('arrival-platform', { diameter: 1.7, height: 0.12, tessellation: 64 }, scene);
      platform.position.y = -0.065;
      const platformMaterial = new StandardMaterial('arrival-platform-material', scene);
      platformMaterial.diffuseColor = Color3.FromHexString('#e4f5dc');
      platformMaterial.emissiveColor = Color3.FromHexString('#e4f5dc').scale(0.25);
      platformMaterial.specularColor = new Color3(0.12, 0.12, 0.12);
      platform.material = platformMaterial;
      const contact = MeshBuilder.CreateDisc('arrival-contact-shadow', {radius: 0.32, tessellation:64}, scene);
      contact.rotation.x = Math.PI / 2;
      contact.position.y = 0.002;
      const contactMaterial = new StandardMaterial('arrival-contact-material', scene);
      contactMaterial.diffuseColor = Color3.FromHexString('#729d83');
      contactMaterial.alpha = 0.22;
      contactMaterial.backFaceCulling = false;
      contactMaterial.disableLighting = true;
      contact.material = contactMaterial;
      model.current = buildHumanMesh(scene, 'arrival-avatar');
      if (mobile) model.current.setLOD(1);
      model.current.setOutfit(latest.current.outfit, latest.current.color);
      if (latest.current.gender) model.current.setGender(latest.current.gender);
      if (latest.current.hair || latest.current.hairColor) model.current.setHair(latest.current.hair, latest.current.hairColor);
      if (latest.current.skinTone) model.current.setSkinTone(latest.current.skinTone);
      resize = new ResizeObserver(updateResolution);
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
  const skin = getSkinTone(skinTone);
  const hairShape = {
    hair_buzzcut: 'M64 99q0-46 46-46t46 46l-5-13q-41-12-82 0z',
    buzzcut: 'M64 99q0-46 46-46t46 46l-5-13q-41-12-82 0z',
    hair_high_ponytail: 'M65 93q-3-44 46-44 42-5 46 44l-20-22-26 14-27-10z',
    twintails: 'M64 103q-8-66 51-60 54 0 42 65l-20-31-30 16-29-7z',
    bob: 'M58 128V92q0-52 52-52t52 52v36l-20 18V82l-32-10-32 20v54z',
    wavy: 'M59 122q-18-15-8-34-8-18 12-28 12-26 47-19 35-7 47 19 20 10 12 28 10 19-8 34l-24-44-30 17-29-9z',
  };
  // A vector preview shares no GPU buffers/context with the running world.
  // Outfit selection still applies to the actual 3D player on confirmation.
  if (failed) return <svg className="arrival-avatar-canvas" viewBox="0 0 220 300" role="img" aria-label="Xem trước nhân vật và màu trang phục">
    <ellipse cx="110" cy="282" rx="55" ry="9" fill="#263d54" opacity=".18" />
    <path d="M88 213v54m44-54v54" stroke={skin.hex} strokeWidth="17" strokeLinecap="round" />
    <path d="M78 170l-15 42m79-42l15 42" stroke={skin.hex} strokeWidth="17" strokeLinecap="round" />
    <path d="M78 153q32-18 64 0l7 62H71z" fill={color || '#f8fafc'} stroke="#3c5367" strokeWidth="3" />
    <path d="M76 210h68v22H76z" fill="#38689b" />
    <ellipse cx="110" cy="104" rx="47" ry="50" fill={skin.hex} stroke={skin.shadow} strokeWidth="2" />
    {hair === 'hair_high_ponytail' && <path d="M117 54q-16-36 16-40 35 0 39 35l-24 45-13-40z" fill={hairColor} />}
    {(hair === 'twintails' || hair === 'hair_twintails') && <g fill={hairColor}><path d="M66 77q-38-6-29 76l30-16 7-52z" /><path d="M154 77q38-6 29 76l-30-16-7-52z" /></g>}
    <path d={hairShape[hair] || hairShape[hair.replace(/^hair_/, '')] || (gender === 'female' ? hairShape.bob : 'M64 103q-8-66 51-60 54 0 42 65l-20-31-30 16-29-7z')} fill={hairColor} />
    <ellipse cx="93" cy="109" rx="4" ry="6" fill="#28303c" /><ellipse cx="127" cy="109" rx="4" ry="6" fill="#28303c" />
    <path d="M100 130q10 10 20 0" fill="none" stroke="#9c583c" strokeWidth="3" strokeLinecap="round" />
    <path d="M77 272h24m19 0h24" stroke="#f8fafc" strokeWidth="14" strokeLinecap="round" />
  </svg>;
  return <canvas ref={canvas} className="arrival-avatar-canvas" aria-label="Nhân vật 3D — kéo để xoay" />;
}
