import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Viewport } from '@babylonjs/core/Maths/math.viewport.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';

import { buildHumanMesh } from '../game/player/buildHumanMesh.js';
import {
  FASHION_RARITY,
  FASHION_CATEGORIES,
  CHARACTER_GENDERS,
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_DYES,
  TOPS,
  BOTTOMS,
  SHOES,
  EYES_OPTIONS,
  EYE_COLORS,
  EARS_OPTIONS,
  NOSE_OPTIONS,
  MOUTH_OPTIONS,
  BLUSH_OPTIONS,
  FULL_SETS,
  getDefaultCustomization,
  normalizeCustomization,
  calculateVerifiedCustomizationCost,
} from '../../shared/fashionConfig.js';
import { Icon3dGoldCoin, Icon3dCheck } from './icons3d/GameIcons3D.jsx';
import {
  Icon3dFashionLogo,
  Icon3dTabBody,
  Icon3dTabHair,
  Icon3dTabTop,
  Icon3dTabBottom,
  Icon3dTabShoes,
  Icon3dTabEars,
  Icon3dTabFace,
  Icon3dTabSets,
  Icon3dTabWardrobe,
  Icon3dCamBody,
  Icon3dCamFace,
  Icon3dRotateTurntable,
  Icon3dPoseSparkle,
  Icon3dPoseWaveHand,
  Icon3dPoseHeart,
  Icon3dPoseIdol,
  Icon3dPoseCheer,
  Icon3dPoseShy,
  Icon3dPoseSpin,
  Icon3dAutoRotate,
  Icon3dAngleFront,
  Icon3dAngleSide,
  Icon3dAngleBack,
  Icon3dAngleQuarter,
} from './icons3d/Fashion3DIcons.jsx';
import { farmAudio } from '../game/audio/FarmAudioSystem.js';
import { FashionMeshThumbnail } from './FashionMeshThumbnail.jsx';
import './FashionBoutiqueRedesign.css';

export function FashionBoutiqueModal({
  currentCustomization,
  ownedItems = [],
  coins = 0,
  onSaveAndEquip,
  onClose,
}) {
  const [boutiqueMode, setBoutiqueMode] = useState('shop'); // 'shop' | 'wardrobe'
  const [activeTab, setActiveTab] = useState('accessories'); // body, hair, top, bottom, shoes, accessories, face, sets, wardrobe
  const [faceSubTab, setFaceSubTab] = useState('eyes'); // eyes, nose, mouth, blush
  const [cameraMode, setCameraMode] = useState('body'); // body, face, accessories

  const [presets, setPresets] = useState(() => {
    try {
      const saved = localStorage.getItem('pt_fashion_presets');
      return saved ? JSON.parse(saved) : [null, null, null];
    } catch {
      return [null, null, null];
    }
  });

  const savePreset = (slotIndex) => {
    const next = [...presets];
    next[slotIndex] = { ...previewCustom, savedAt: Date.now() };
    setPresets(next);
    try {
      localStorage.setItem('pt_fashion_presets', JSON.stringify(next));
    } catch {}
    farmAudio?.playSuccess?.();
  };

  const loadPreset = (slotIndex) => {
    if (!presets[slotIndex]) return;
    setPreviewCustom(presets[slotIndex]);
    farmAudio?.playPop?.();
  };

  // Preview state (what the player is currently trying on)
  const initialEquipped = useMemo(() => normalizeCustomization(currentCustomization), [currentCustomization]);
  const [previewCustom, setPreviewCustom] = useState(initialEquipped);

  const [autoRotate, setAutoRotate] = useState(false);
  const autoRotateRef = useRef(false);
  autoRotateRef.current = autoRotate;

  const [activePose, setActivePose] = useState(null);
  const targetAlphaRef = useRef(null);
  const sparkleRef = useRef(null);
  const isFirstRender = useRef(true);

  const canvasRef = useRef(null);
  const avatarRef = useRef(null);
  const cameraRef = useRef(null);
  const thumbnailRef = useRef(null);
  const customizationRef = useRef(previewCustom);
  customizationRef.current = previewCustom;

  // Initialize Babylon 3D Preview Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio || 1, 2));
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.89, 0.95, 0.97, 1);

    // Warm Boutique Studio Lighting (Calibrated, Glare-Free)
    const hemi = new HemisphericLight('boutique-preview-hemi', new Vector3(0, 1, 0), scene);
    hemi.intensity = 0.58;
    hemi.diffuse = new Color3(1, 0.98, 0.96);
    hemi.groundColor = new Color3(0.85, 0.82, 0.85);

    const dir = new DirectionalLight('boutique-preview-dir', new Vector3(-1, 2.5, -2.2).normalize(), scene);
    dir.intensity = 0.45;
    dir.diffuse = new Color3(1, 0.97, 0.94);

    // Luxury Runway Podium
    const podiumMat = new StandardMaterial('podium-marble', scene);
    podiumMat.diffuseColor = Color3.FromHexString('#e8dfd5');
    podiumMat.specularColor = new Color3(0.3, 0.3, 0.3);

    const goldMat = new StandardMaterial('podium-gold-mat', scene);
    goldMat.diffuseColor = Color3.FromHexString('#a68344');
    goldMat.emissiveColor = Color3.Black();

    const podium = MeshBuilder.CreateCylinder('boutique-podium', { diameter: 1.85, height: 0.12, tessellation: 36 }, scene);
    podium.position.y = -0.06;
    podium.material = podiumMat;

    const podiumRing = MeshBuilder.CreateTorus('boutique-podium-ring', { diameter: 1.87, thickness: 0.038, tessellation: 36 }, scene);
    podiumRing.position.y = -0.01;
    podiumRing.material = goldMat;

    // Vòng tròn sân khấu hồng phấn Play Together (Pastel Runway Center Decal)
    const starPodium = MeshBuilder.CreateDisc('boutique-podium-star', { radius: 0.88, tessellation: 36 }, scene);
    starPodium.rotation.x = Math.PI / 2;
    starPodium.position.y = 0.002;
    const starPodiumMat = new StandardMaterial('boutique-star-mat', scene);
    starPodiumMat.diffuseColor = Color3.FromHexString('#fff1f2');
    starPodiumMat.specularColor = Color3.Black();
    starPodium.material = starPodiumMat;

    // Particle Burst Pool (Hiệu ứng sao lấp lánh khi thay đồ)
    const starsPool = [];
    const starColors = [
      Color3.FromHexString('#facc15'), // gold
      Color3.FromHexString('#f472b6'), // pink
      Color3.FromHexString('#38bdf8'), // sky
      Color3.FromHexString('#c084fc'), // purple
      Color3.FromHexString('#4ade80'), // mint
    ];

    for (let i = 0; i < 14; i++) {
      const star = MeshBuilder.CreatePlane(`sparkle-star-${i}`, { size: 0.15 }, scene);
      star.billboardMode = Mesh.BILLBOARDMODE_ALL;
      const mat = new StandardMaterial(`sparkle-mat-${i}`, scene);
      const col = starColors[i % starColors.length];
      mat.diffuseColor = col;
      mat.emissiveColor = col;
      mat.disableLighting = true;
      mat.backFaceCulling = false;
      star.material = mat;
      star.setEnabled(false);
      starsPool.push({
        mesh: star,
        active: false,
        timer: 0,
        lifetime: 0.6,
        velocity: new Vector3(),
        spin: 0,
      });
    }

    const triggerSparkleVFX = () => {
      starsPool.forEach((p, idx) => {
        const angle = (idx / starsPool.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const speed = 0.7 + Math.random() * 0.8;
        const height = 0.6 + Math.random() * 1.1;
        p.mesh.position.set(Math.cos(angle) * 0.22, height, Math.sin(angle) * 0.22);
        p.velocity.set(Math.cos(angle) * speed, 0.45 + Math.random() * 0.55, Math.sin(angle) * speed);
        p.timer = 0;
        p.lifetime = 0.55 + Math.random() * 0.25;
        p.spin = (Math.random() - 0.5) * 10;
        p.mesh.scaling.set(0.1, 0.1, 0.1);
        p.mesh.setEnabled(true);
        p.active = true;
      });
    };
    sparkleRef.current = triggerSparkleVFX;

    // Camera setup
    const camera = new ArcRotateCamera('boutique-camera', Math.PI / 2, 1.45, 4.5, new Vector3(0, 1.15, 0), scene);
    camera.lowerRadiusLimit = 0.9;
    camera.upperRadiusLimit = 7;
    camera.wheelPrecision = 40;
    camera.attachControl(canvas, true);
    cameraRef.current = camera;

    // Chibi Model
    const avatar = buildHumanMesh(scene, 'boutique-preview-avatar');
    avatar.root.position.set(0, 0, 0);
    avatarRef.current = avatar;

    // Apply current look
    avatar.applyCustomization(previewCustom);
    thumbnailRef.current = (item, field) => {
      const saved = { alpha: camera.alpha, beta: camera.beta, radius: camera.radius, target: camera.target.clone(), viewport: camera.viewport };
      const square = Math.min(canvas.width, canvas.height);
      camera.viewport = new Viewport((canvas.width - square) / (2 * canvas.width), (canvas.height - square) / (2 * canvas.height), square / canvas.width, square / canvas.height);
      const custom = { ...getDefaultCustomization(), gender: field === 'gender' ? item.id : 'male' };
      if (field === 'set') Object.assign(custom, item.customization);
      else custom[field] = item.id;
      if (item.color) custom[({ topId: 'topColor', bottomId: 'bottomColor', shoeId: 'shoeColor' })[field] || 'hairColor'] = item.color;
      const isWaistOrBack = field === 'ears' && ['duck_floatie', 'frog_backpack', 'angel_wings'].includes(item.id);
      const isBackView = field === 'ears' && ['frog_backpack', 'angel_wings'].includes(item.id);
      const closeup = ['hairStyle', 'ears', 'eyeType', 'mouthType', 'noseType', 'blushType'].includes(field);
      camera.alpha = isBackView ? Math.PI * 1.3 : Math.PI / 2;
      camera.beta = 1.45;
      camera.target.set(0, closeup ? (isWaistOrBack ? 1.35 : 1.98) : field === 'topId' ? 1.35 : field === 'shoeId' ? 0.22 : field === 'bottomId' ? 0.65 : 1.15, 0);
      camera.radius = closeup ? (isWaistOrBack ? 2.6 : 1.45) : field === 'topId' ? 2.2 : field === 'shoeId' ? 1.25 : field === 'bottomId' ? 2.5 : 4.5;
      try {
        avatar.applyCustomization(custom);
        scene.render();
        const image = document.createElement('canvas');
        image.width = image.height = 160;
        const size = Math.min(canvas.width, canvas.height);
        image.getContext('2d').drawImage(canvas, (canvas.width - size) / 2, (canvas.height - size) / 2, size, size, 0, 0, 160, 160);
        return image.toDataURL('image/webp', 0.82);
      } finally {
        avatar.applyCustomization(customizationRef.current);
        camera.alpha = saved.alpha; camera.beta = saved.beta; camera.radius = saved.radius; camera.target.copyFrom(saved.target);
        camera.viewport = saved.viewport;
        scene.render();
      }
    };

    let lastTime = performance.now();
    engine.runRenderLoop(() => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      // Smooth camera snap lerp or auto-rotation
      if (targetAlphaRef.current !== null) {
        const diff = targetAlphaRef.current - camera.alpha;
        if (Math.abs(diff) > 0.005) {
          camera.alpha += diff * Math.min(1.0, dt * 9);
        } else {
          camera.alpha = targetAlphaRef.current;
          targetAlphaRef.current = null;
        }
      } else if (autoRotateRef.current) {
        camera.alpha += dt * 0.55;
      }

      // Animate Sparkle Particles
      starsPool.forEach(p => {
        if (!p.active) return;
        p.timer += dt;
        const progress = p.timer / p.lifetime;
        if (progress >= 1.0) {
          p.active = false;
          p.mesh.setEnabled(false);
          return;
        }
        p.mesh.position.addInPlace(p.velocity.scale(dt));
        p.velocity.y -= 0.7 * dt;
        p.mesh.rotation.z += p.spin * dt;
        const s = progress < 0.2 ? (progress / 0.2) * 1.5 : Math.max(0, (1 - (progress - 0.2) / 0.8)) * 1.5;
        p.mesh.scaling.set(s, s, s);
      });

      avatar.animate(dt, false, 1.0);
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas.parentElement);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      thumbnailRef.current = null;
      scene.dispose();
      engine.dispose();
      avatarRef.current = null;
    };
  }, []);

  // Update avatar live on preview change + trigger sparkles
  useEffect(() => {
    if (avatarRef.current) {
      avatarRef.current.applyCustomization(previewCustom);
    }
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      sparkleRef.current?.();
    }
  }, [previewCustom]);

  // Adjust camera target based on view mode
  const setCameraView = mode => {
    setCameraMode(mode);
    const camera = cameraRef.current;
    if (!camera) return;
    if (mode === 'face') {
      camera.target.set(0, 1.98, 0);
      camera.radius = 1.9;
      camera.beta = 1.42;
    } else if (mode === 'accessories') {
      camera.target.set(0, 1.45, 0);
      camera.radius = 3.2;
      camera.beta = 1.40;
    } else {
      camera.target.set(0, 1.15, 0);
      camera.radius = 4.5;
      camera.beta = 1.45;
    }
  };

  const rotateCamera = delta => {
    setAutoRotate(false);
    targetAlphaRef.current = null;
    if (cameraRef.current) {
      cameraRef.current.alpha += delta;
    }
  };

  const snapToAngle = targetRad => {
    setAutoRotate(false);
    const camera = cameraRef.current;
    if (!camera) return;
    const twoPi = Math.PI * 2;
    const current = camera.alpha;
    const diff = (targetRad - (current % twoPi) + Math.PI * 3) % twoPi - Math.PI;
    targetAlphaRef.current = current + diff;
    farmAudio?.playPop?.();
  };

  const toggleAutoRotate = () => {
    targetAlphaRef.current = null;
    setAutoRotate(prev => !prev);
    farmAudio?.playPop?.();
  };

  const resetCamera = () => {
    snapToAngle(Math.PI / 2);
  };

  const playPose = action => {
    if (avatarRef.current) {
      avatarRef.current.playAction(action);
      setActivePose(action);
      sparkleRef.current?.();
      farmAudio?.playPop?.();
      setTimeout(() => {
        setActivePose(prev => (prev === action ? null : prev));
      }, 1500);
    }
  };

  // Safe ownership check
  const isItemOwned = itemId => {
    if (!itemId) return true;
    return ownedItems.includes(itemId);
  };

  // Calculate unowned items and total cost in current preview
  const unownedItems = useMemo(() => {
    const list = [];

    // Hair Style
    if (previewCustom.hairStyle && previewCustom.hairStyle !== initialEquipped.hairStyle) {
      const item = HAIR_STYLES.find(h => h.id === previewCustom.hairStyle);
      if (item && item.cost > 0 && !isItemOwned(item.id)) list.push(item);
    }
    // Hair Dye
    if (previewCustom.hairColor && previewCustom.hairColor !== initialEquipped.hairColor) {
      const dye = HAIR_DYES.find(d => d.hex.toLowerCase() === previewCustom.hairColor.toLowerCase());
      if (dye && dye.cost > 0 && !isItemOwned(dye.id)) list.push(dye);
    }
    // Top
    if (previewCustom.topId && previewCustom.topId !== initialEquipped.topId) {
      const item = TOPS.find(t => t.id === previewCustom.topId);
      if (item && item.cost > 0 && !isItemOwned(item.id)) list.push(item);
    }
    // Bottom
    if (previewCustom.bottomId && previewCustom.bottomId !== initialEquipped.bottomId) {
      const item = BOTTOMS.find(b => b.id === previewCustom.bottomId);
      if (item && item.cost > 0 && !isItemOwned(item.id)) list.push(item);
    }
    // Shoes
    if (previewCustom.shoeId && previewCustom.shoeId !== initialEquipped.shoeId) {
      const item = SHOES.find(s => s.id === previewCustom.shoeId);
      if (item && item.cost > 0 && !isItemOwned(item.id)) list.push(item);
    }
    // Ears
    if (previewCustom.ears && previewCustom.ears !== initialEquipped.ears) {
      const item = EARS_OPTIONS.find(e => e.id === previewCustom.ears);
      if (item && item.cost > 0 && !isItemOwned(item.id)) list.push(item);
    }
    // Eyes
    if (previewCustom.eyeType && previewCustom.eyeType !== initialEquipped.eyeType) {
      const item = EYES_OPTIONS.find(e => e.id === previewCustom.eyeType);
      if (item && item.cost > 0 && !isItemOwned(item.id)) list.push(item);
    }
    // Eye Color
    if (previewCustom.eyeColor && previewCustom.eyeColor !== initialEquipped.eyeColor) {
      const item = EYE_COLORS.find(e => e.hex.toLowerCase() === previewCustom.eyeColor.toLowerCase());
      if (item && item.cost > 0 && !isItemOwned(item.id)) list.push(item);
    }
    // Nose
    if (previewCustom.noseType && previewCustom.noseType !== initialEquipped.noseType) {
      const item = NOSE_OPTIONS.find(n => n.id === previewCustom.noseType);
      if (item && item.cost > 0 && !isItemOwned(item.id)) list.push(item);
    }
    // Mouth
    if (previewCustom.mouthType && previewCustom.mouthType !== initialEquipped.mouthType) {
      const item = MOUTH_OPTIONS.find(m => m.id === previewCustom.mouthType);
      if (item && item.cost > 0 && !isItemOwned(item.id)) list.push(item);
    }
    // Blush
    if (previewCustom.blushType && previewCustom.blushType !== initialEquipped.blushType) {
      const item = BLUSH_OPTIONS.find(b => b.id === previewCustom.blushType);
      if (item && item.cost > 0 && !isItemOwned(item.id)) list.push(item);
    }

    return list;
  }, [previewCustom, initialEquipped, ownedItems]);

  const totalCartCost = useMemo(() => {
    return unownedItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  }, [unownedItems]);

  const isDifferentFromEquipped = useMemo(() => {
    return JSON.stringify(previewCustom) !== JSON.stringify(initialEquipped);
  }, [previewCustom, initialEquipped]);

  const handleCheckout = () => {
    if (totalCartCost > coins) {
      farmAudio?.playPop?.();
      return;
    }
    farmAudio?.playFanfare?.();
    const newOwnedItemIds = unownedItems.map(item => item.id);
    onSaveAndEquip?.(previewCustom, newOwnedItemIds, totalCartCost);
  };

  const handleResetPreview = () => {
    farmAudio?.playPop?.();
    setPreviewCustom(initialEquipped);
  };

  const renderRarity = rarity => {
    const stars = rarity === 'legendary' ? 4 : rarity === 'epic' ? 3 : rarity === 'rare' ? 2 : 1;
    return <span className="fashion-rarity-stars">{'★'.repeat(stars)}</span>;
  };

  return (
    <div className="fashion-modal-backdrop fashion-redesign" onClick={onClose}>
      <section className="fashion-modal-card" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Header Thời Trang Sang Trọng Play Together */}
        <header className="fashion-modal-header">
          <div className="fashion-brand">
            <span className="fashion-brand-icon">
              <Icon3dFashionLogo size={46} />
            </span>
            <div>
              <h2>Sophie's Fashion Boutique</h2>
              <small>Thử phong cách mới · Thời trang & salon tóc cao cấp</small>
            </div>
          </div>

          {/* Chuyển đổi chế độ: Tiệm Thời Trang vs Tủ Đồ Của Tôi */}
          <div className="fashion-mode-switch">
            <button
              type="button"
              className={`fashion-mode-pill ${boutiqueMode === 'shop' ? 'active' : ''}`}
              onClick={() => {
                farmAudio?.playPop?.();
                setBoutiqueMode('shop');
              }}
            >
              <Icon3dTabTop size={16} active={boutiqueMode === 'shop'} />
              <span>Tiệm Thời Trang</span>
            </button>
            <button
              type="button"
              className={`fashion-mode-pill ${boutiqueMode === 'wardrobe' ? 'active' : ''}`}
              onClick={() => {
                farmAudio?.playPop?.();
                setBoutiqueMode('wardrobe');
              }}
            >
              <Icon3dTabWardrobe size={16} active={boutiqueMode === 'wardrobe'} />
              <span>Tủ Đồ Của Tôi</span>
            </button>
          </div>

          <div className="fashion-header-right">
            <div className="fashion-coin-pill">
              <Icon3dGoldCoin size={24} />
              <span>{coins.toLocaleString()} xu</span>
            </div>
            <button className="fashion-close-btn" type="button" onClick={onClose} aria-label="Đóng">
              ×
            </button>
          </div>
        </header>

        {/* Main Body */}
        <div className="fashion-modal-body">
          {/* Left: 3D Live Interactive Runway Viewport */}
          <div className="fashion-preview-column">
            <div className="fashion-viewport-container">
              <canvas ref={canvasRef} className="fashion-viewport-canvas" width={380} height={460} />

              {/* Viewport Control Badges - Trái */}
              <div className="fashion-viewport-tools top-left">
                <button
                  type="button"
                  className={`fashion-tool-pill ${cameraMode === 'body' ? 'active' : ''}`}
                  onClick={() => setCameraView('body')}
                >
                  <Icon3dCamBody size={15} />
                  <span>Toàn thân</span>
                </button>
                <button
                  type="button"
                  className={`fashion-tool-pill ${cameraMode === 'face' ? 'active' : ''}`}
                  onClick={() => setCameraView('face')}
                >
                  <Icon3dCamFace size={15} />
                  <span>Cận cảnh</span>
                </button>
                <button
                  type="button"
                  className={`fashion-tool-pill auto-rotate-pill ${autoRotate ? 'active' : ''}`}
                  onClick={toggleAutoRotate}
                  title="Bật/Tắt tự động xoay 360 độ"
                >
                  <Icon3dAutoRotate size={15} active={autoRotate} />
                  <span>{autoRotate ? 'Đang xoay' : 'Tự xoay'}</span>
                </button>
              </div>

              {/* Viewport Angle Snaps - Phải */}
              <div className="fashion-viewport-tools top-right">
                <button type="button" className="fashion-angle-btn" onClick={() => snapToAngle(Math.PI / 2)} title="Mặt trước">
                  <Icon3dAngleFront size={15} />
                  <span>Trước</span>
                </button>
                <button type="button" className="fashion-angle-btn" onClick={() => snapToAngle(Math.PI * 0.75)} title="Góc nghiêng 3/4">
                  <Icon3dAngleQuarter size={15} />
                  <span>3/4</span>
                </button>
                <button type="button" className="fashion-angle-btn" onClick={() => snapToAngle(Math.PI)} title="Góc nghiêng bên">
                  <Icon3dAngleSide size={15} />
                  <span>Bên</span>
                </button>
                <button type="button" className="fashion-angle-btn" onClick={() => snapToAngle(Math.PI * 1.5)} title="Góc phía sau">
                  <Icon3dAngleBack size={15} />
                  <span>Sau</span>
                </button>
              </div>

              {/* Camera Rotation Buttons - Giữa đáy */}
              <div className="fashion-viewport-tools bottom-center">
                <button type="button" className="fashion-tool-btn" onClick={() => rotateCamera(-0.4)} title="Xoay trái">
                  <Icon3dRotateTurntable direction="left" size={17} />
                </button>
                <button type="button" className="fashion-tool-btn" onClick={resetCamera} title="Về chính diện">
                  <Icon3dPoseSparkle size={17} />
                </button>
                <button type="button" className="fashion-tool-btn" onClick={() => rotateCamera(0.4)} title="Xoay phải">
                  <Icon3dRotateTurntable direction="right" size={17} />
                </button>
              </div>
            </div>

            {/* Thanh Tạo Dáng & Emotes Play Together */}
            <div className="fashion-pose-bar">
              <span className="fashion-pose-label">Tạo dáng:</span>
              <div className="fashion-pose-grid">
                <button
                  type="button"
                  className={`fashion-pose-pill ${activePose === 'wave' ? 'active' : ''}`}
                  onClick={() => playPose('wave')}
                  title="Vẫy tay chào bạn bè"
                >
                  <Icon3dPoseWaveHand size={18} />
                  <span>Vẫy tay</span>
                </button>
                <button
                  type="button"
                  className={`fashion-pose-pill ${activePose === 'fashion_pose' ? 'active' : ''}`}
                  onClick={() => playPose('fashion_pose')}
                  title="Tạo dáng Idol người mẫu"
                >
                  <Icon3dPoseIdol size={18} />
                  <span>Idol</span>
                </button>
                <button
                  type="button"
                  className={`fashion-pose-pill ${activePose === 'heart_pose' ? 'active' : ''}`}
                  onClick={() => playPose('heart_pose')}
                  title="Bắn tim đáng yêu"
                >
                  <Icon3dPoseHeart size={18} />
                  <span>Bắn tim</span>
                </button>
                <button
                  type="button"
                  className={`fashion-pose-pill ${activePose === 'cheer' ? 'active' : ''}`}
                  onClick={() => playPose('cheer')}
                  title="Reo hò ăn mừng"
                >
                  <Icon3dPoseCheer size={18} />
                  <span>Reo hò</span>
                </button>
                <button
                  type="button"
                  className={`fashion-pose-pill ${activePose === 'shy' ? 'active' : ''}`}
                  onClick={() => playPose('shy')}
                  title="E thẹn dễ thương"
                >
                  <Icon3dPoseShy size={18} />
                  <span>E thẹn</span>
                </button>
                <button
                  type="button"
                  className={`fashion-pose-pill ${activePose === 'spin' ? 'active' : ''}`}
                  onClick={() => playPose('spin')}
                  title="Xoay một vòng 360 độ"
                >
                  <Icon3dPoseSpin size={18} />
                  <span>Xoay 360°</span>
                </button>
              </div>
            </div>

            {/* Try-On Cart Summary Status */}
            <div className="fashion-cart-summary">
              {unownedItems.length > 0 ? (
                <div className="fashion-cart-alert shopping">
                  <span>Đang thử <strong>{unownedItems.length}</strong> món đồ mới</span>
                  <div className="fashion-cart-price">
                    <Icon3dGoldCoin size={20} />
                    <strong>{totalCartCost.toLocaleString()} xu</strong>
                  </div>
                </div>
              ) : isDifferentFromEquipped ? (
                <div className="fashion-cart-alert wardrobe">
                  <span>Toàn bộ đồ đang thử đều đã có trong tủ đồ!</span>
                  <strong className="fashion-free-tag">Miễn phí</strong>
                </div>
              ) : (
                <div className="fashion-cart-alert matching">
                  <span>Đang mặc trang phục hiện tại của bạn</span>
                </div>
              )}

              {/* Thanh Quản lý Set Phối Sẵn khi ở chế độ Tủ đồ */}
              {boutiqueMode === 'wardrobe' && (
                <div className="fashion-preset-bar">
                  <span className="fashion-preset-label">Bộ phối sẵn:</span>
                  {[0, 1, 2].map(idx => (
                    <div key={idx} className="fashion-preset-slot">
                      <button
                        type="button"
                        className={`fashion-preset-btn ${presets[idx] ? 'saved' : 'empty'}`}
                        onClick={() => loadPreset(idx)}
                        disabled={!presets[idx]}
                        title={presets[idx] ? `Mặc Set ${idx + 1}` : 'Chưa lưu set'}
                      >
                        Set {idx + 1}
                      </button>
                      <button
                        type="button"
                        className="fashion-preset-save"
                        onClick={() => savePreset(idx)}
                        title={`Lưu outfit hiện tại vào Set ${idx + 1}`}
                      >
                        Lưu
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="fashion-cart-actions">
                {totalCartCost > coins && <small role="status">Bạn còn thiếu {(totalCartCost - coins).toLocaleString()} xu</small>}
                {isDifferentFromEquipped && (
                  <button type="button" className="fashion-btn-secondary" onClick={handleResetPreview}>
                    ↺ Hoàn tác
                  </button>
                )}

                <button
                  type="button"
                  className={`fashion-btn-primary ${totalCartCost > coins ? 'disabled' : ''}`}
                  onClick={handleCheckout}
                  disabled={!isDifferentFromEquipped || totalCartCost > coins}
                >
                  {totalCartCost > 0 ? (
                    <>Mua & Mặc Ngay ({totalCartCost.toLocaleString()} xu)</>
                  ) : isDifferentFromEquipped ? (
                    <>Mặc Ngay</>
                  ) : (
                    <>Đang Mặc</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Wardrobe & Shop Catalog Tabs */}
          <div className="fashion-catalog-column">
            {/* Category Navigation Bar */}
            <nav className="fashion-nav-bar">
              <button
                type="button"
                className={`fashion-nav-tab ${activeTab === 'body' ? 'active' : ''}`}
                onClick={() => { setActiveTab('body'); setCameraView('body'); farmAudio?.playPop?.(); }}
              >
                <Icon3dTabBody active={activeTab === 'body'} />
                <span>Cơ thể</span>
              </button>
              <button
                type="button"
                className={`fashion-nav-tab ${activeTab === 'hair' ? 'active' : ''}`}
                onClick={() => { setActiveTab('hair'); setCameraView('face'); farmAudio?.playPop?.(); }}
              >
                <Icon3dTabHair active={activeTab === 'hair'} />
                <span>Tóc & Nhuộm</span>
              </button>
              <button
                type="button"
                className={`fashion-nav-tab ${activeTab === 'top' ? 'active' : ''}`}
                onClick={() => { setActiveTab('top'); setCameraView('body'); farmAudio?.playPop?.(); }}
              >
                <Icon3dTabTop active={activeTab === 'top'} />
                <span>Áo</span>
              </button>
              <button
                type="button"
                className={`fashion-nav-tab ${activeTab === 'bottom' ? 'active' : ''}`}
                onClick={() => { setActiveTab('bottom'); setCameraView('body'); farmAudio?.playPop?.(); }}
              >
                <Icon3dTabBottom active={activeTab === 'bottom'} />
                <span>Quần & Váy</span>
              </button>
              <button
                type="button"
                className={`fashion-nav-tab ${activeTab === 'shoes' ? 'active' : ''}`}
                onClick={() => { setActiveTab('shoes'); setCameraView('body'); farmAudio?.playPop?.(); }}
              >
                <Icon3dTabShoes active={activeTab === 'shoes'} />
                <span>Giày Dép</span>
              </button>
              <button
                type="button"
                className={`fashion-nav-tab ${activeTab === 'accessories' ? 'active' : ''}`}
                onClick={() => { setActiveTab('accessories'); setCameraView('accessories'); farmAudio?.playPop?.(); }}
              >
                <Icon3dTabEars active={activeTab === 'accessories'} />
                <span>Phụ Kiện</span>
              </button>
              <button
                type="button"
                className={`fashion-nav-tab ${activeTab === 'face' ? 'active' : ''}`}
                onClick={() => { setActiveTab('face'); setCameraView('face'); farmAudio?.playPop?.(); }}
              >
                <Icon3dTabFace active={activeTab === 'face'} />
                <span>Khuôn Mặt</span>
              </button>
              <button
                type="button"
                className={`fashion-nav-tab ${activeTab === 'sets' ? 'active' : ''}`}
                onClick={() => { setActiveTab('sets'); setCameraView('body'); farmAudio?.playPop?.(); }}
              >
                <Icon3dTabSets active={activeTab === 'sets'} />
                <span>Full Sets</span>
              </button>
            </nav>

            {/* Tab Contents */}
            <div className="fashion-tab-content">
              {/* 0. BODY PROFILE & SAFE SKIN TONES */}
              {activeTab === 'body' && (
                <div className="fashion-section-group">
                  <div className="fashion-subheading">
                    <h4>Dáng nhân vật</h4>
                    <small>Chọn nền tảng nam/nữ/trung tính; tóc và thời trang vẫn thay độc lập.</small>
                  </div>
                  <div className="fashion-grid-items">
                    {CHARACTER_GENDERS.map(gender => (
                      <button
                        key={gender.id}
                        type="button"
                        className={`fashion-card ${previewCustom.gender === gender.id ? 'selected' : ''}`}
                        onClick={() => {
                          setPreviewCustom(prev => ({ ...prev, gender: gender.id }));
                          farmAudio?.playPop?.();
                        }}
                      >
                        <div className="fashion-card-thumb set-thumb">
                          <FashionMeshThumbnail item={gender} field="gender" capture={thumbnailRef} />
                          {previewCustom.gender === gender.id && <span className="selection-badge"><Icon3dCheck size={16} /></span>}
                        </div>
                        <div className="fashion-card-info">
                          <strong>Dáng {gender.label}</strong>
                          <small>Form cơ thể mềm mại, cân đối, tối ưu cho animation.</small>
                          <span className="owned-text">Miễn phí</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="fashion-subheading">
                    <h4>Màu da cân sáng</h4>
                    <small>Bảng màu đã cân bằng ambient để không bị đen cháy hoặc trắng bệt khi đổi khu vực.</small>
                  </div>
                  <div className="fashion-grid-items">
                    {SKIN_TONES.map(tone => (
                      <button
                        key={tone.id}
                        type="button"
                        className={`fashion-card ${previewCustom.skinTone === tone.id ? 'selected' : ''}`}
                        onClick={() => {
                          setPreviewCustom(prev => ({ ...prev, skinTone: tone.id, skinColor: tone.hex }));
                          farmAudio?.playPop?.();
                        }}
                      >
                        <div className="fashion-card-thumb" style={{ background: `linear-gradient(135deg, ${tone.hex}, ${tone.shadow})` }}>
                          {previewCustom.skinTone === tone.id && <span className="selection-badge"><Icon3dCheck size={16} /></span>}
                        </div>
                        <div className="fashion-card-info">
                          <strong>{tone.label}</strong>
                          <small>Skin tone {tone.id}</small>
                          <span className="owned-text">Miễn phí</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. TÓC & NHUỘM (HAIR & DYE) */}
              {activeTab === 'hair' && (
                <div className="fashion-section-group">
                  <div className="fashion-subheading">
                    <h4>Kiểu Tóc Salon</h4>
                  </div>
                  <div className="fashion-grid-items">
                    {HAIR_STYLES.filter(hair => boutiqueMode === 'shop' || isItemOwned(hair.id) || hair.cost === 0).map(hair => {
                      const isSelected = previewCustom.hairStyle === hair.id;
                      const isOwned = isItemOwned(hair.id) || hair.cost === 0;
                      return (
                        <button
                          key={hair.id}
                          type="button"
                          className={`fashion-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setPreviewCustom(prev => ({ ...prev, hairStyle: hair.id }));
                            farmAudio?.playPop?.();
                          }}
                        >
                          <div className="fashion-card-thumb hair-thumb">
                            <FashionMeshThumbnail item={hair} field="hairStyle" capture={thumbnailRef} />
                            {hair.tag && <span className={`card-tag-ribbon ${hair.tag.toLowerCase()}`}>{hair.tag}</span>}
                            {isSelected && <span className="selection-badge"><Icon3dCheck size={16} /></span>}
                          </div>
                          <div className="fashion-card-info">
                            <div className="fashion-card-meta">
                              <strong>{hair.name}</strong>
                              {renderRarity(hair.rarity)}
                            </div>
                            <small>{hair.desc}</small>
                            <span className="fashion-price-tag">
                              {isOwned ? (
                                <span className="owned-text">Đã sở hữu</span>
                              ) : (
                                <><Icon3dGoldCoin size={15} /> {hair.cost} xu</>
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="fashion-subheading" style={{ marginTop: '16px' }}>
                    <h4>Bảng Màu Nhuộm Tóc (12 Màu Salon)</h4>
                  </div>
                  <div className="fashion-dye-palette">
                    {HAIR_DYES.map(dye => {
                      const isSelected = (previewCustom.hairColor || '').toLowerCase() === dye.hex.toLowerCase();
                      const isOwned = isItemOwned(dye.id) || dye.cost === 0;
                      return (
                        <button
                          key={dye.id}
                          type="button"
                          className={`fashion-dye-swatch ${isSelected ? 'selected' : ''}`}
                          style={{ backgroundColor: dye.hex }}
                          title={`${dye.name} (${dye.cost ? `${dye.cost} xu` : 'Miễn phí'})`}
                          onClick={() => {
                            setPreviewCustom(prev => ({ ...prev, hairColor: dye.hex }));
                            farmAudio?.playPop?.();
                          }}
                        >
                          {isSelected && <span className="dye-check">✓</span>}
                          {!isOwned && dye.cost > 0 && <span className="dye-lock-dot" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. ÁO THỜI TRANG (TOPS) */}
              {activeTab === 'top' && (
                <div className="fashion-grid-items">
                  {TOPS.filter(top => boutiqueMode === 'shop' || isItemOwned(top.id) || top.cost === 0).map(top => {
                    const isSelected = previewCustom.topId === top.id;
                    const isOwned = isItemOwned(top.id) || top.cost === 0;
                    return (
                      <button
                        key={top.id}
                        type="button"
                        className={`fashion-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setPreviewCustom(prev => ({ ...prev, topId: top.id, topColor: top.color }));
                          farmAudio?.playPop?.();
                        }}
                      >
                        <div
                          className="fashion-card-thumb top-thumb"
                          style={{ background: `linear-gradient(135deg, ${top.color}44, ${top.color}22)` }}
                        >
                          <FashionMeshThumbnail item={top} field="topId" capture={thumbnailRef} />
                          <span className="color-dot" style={{ backgroundColor: top.color }} />
                          {top.tag && <span className={`card-tag-ribbon ${top.tag.toLowerCase()}`}>{top.tag}</span>}
                          {isSelected && <span className="selection-badge"><Icon3dCheck size={16} /></span>}
                        </div>
                        <div className="fashion-card-info">
                          <div className="fashion-card-meta">
                            <strong>{top.name}</strong>
                            {renderRarity(top.rarity)}
                          </div>
                          <small>{top.desc}</small>
                          <span className="fashion-price-tag">
                            {isOwned ? (
                              <span className="owned-text">Đã sở hữu</span>
                            ) : (
                              <><Icon3dGoldCoin size={15} /> {top.cost} xu</>
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. QUẦN & VÁY (BOTTOMS) */}
              {activeTab === 'bottom' && (
                <div className="fashion-grid-items">
                  {BOTTOMS.filter(bottom => boutiqueMode === 'shop' || isItemOwned(bottom.id) || bottom.cost === 0).map(bottom => {
                    const isSelected = previewCustom.bottomId === bottom.id;
                    const isOwned = isItemOwned(bottom.id) || bottom.cost === 0;
                    return (
                      <button
                        key={bottom.id}
                        type="button"
                        className={`fashion-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setPreviewCustom(prev => ({ ...prev, bottomId: bottom.id, bottomColor: bottom.color }));
                          farmAudio?.playPop?.();
                        }}
                      >
                        <div
                          className="fashion-card-thumb bottom-thumb"
                          style={{ background: `linear-gradient(135deg, ${bottom.color}44, ${bottom.color}22)` }}
                        >
                          <FashionMeshThumbnail item={bottom} field="bottomId" capture={thumbnailRef} />
                          <span className="color-dot" style={{ backgroundColor: bottom.color }} />
                          {bottom.tag && <span className={`card-tag-ribbon ${bottom.tag.toLowerCase()}`}>{bottom.tag}</span>}
                          {isSelected && <span className="selection-badge"><Icon3dCheck size={16} /></span>}
                        </div>
                        <div className="fashion-card-info">
                          <div className="fashion-card-meta">
                            <strong>{bottom.name}</strong>
                            {renderRarity(bottom.rarity)}
                          </div>
                          <small>{bottom.desc}</small>
                          <span className="fashion-price-tag">
                            {isOwned ? (
                              <span className="owned-text">Đã sở hữu</span>
                            ) : (
                              <><Icon3dGoldCoin size={15} /> {bottom.cost} xu</>
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 4. GIÀY DÉP (SHOES) */}
              {activeTab === 'shoes' && (
                <div className="fashion-grid-items">
                  {SHOES.filter(shoe => boutiqueMode === 'shop' || isItemOwned(shoe.id) || shoe.cost === 0).map(shoe => {
                    const isSelected = previewCustom.shoeId === shoe.id;
                    const isOwned = isItemOwned(shoe.id) || shoe.cost === 0;
                    return (
                      <button
                        key={shoe.id}
                        type="button"
                        className={`fashion-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setPreviewCustom(prev => ({ ...prev, shoeId: shoe.id, shoeColor: shoe.color }));
                          farmAudio?.playPop?.();
                        }}
                      >
                        <div
                          className="fashion-card-thumb shoe-thumb"
                          style={{ background: `linear-gradient(135deg, ${shoe.color}44, ${shoe.accentColor || '#cbd5e1'}22)` }}
                        >
                          <FashionMeshThumbnail item={shoe} field="shoeId" capture={thumbnailRef} />
                          <span className="color-dot" style={{ backgroundColor: shoe.color }} />
                          {shoe.tag && <span className={`card-tag-ribbon ${shoe.tag.toLowerCase()}`}>{shoe.tag}</span>}
                          {isSelected && <span className="selection-badge"><Icon3dCheck size={16} /></span>}
                        </div>
                        <div className="fashion-card-info">
                          <div className="fashion-card-meta">
                            <strong>{shoe.name}</strong>
                            {renderRarity(shoe.rarity)}
                          </div>
                          <small>{shoe.desc}</small>
                          <span className="fashion-price-tag">
                            {isOwned ? (
                              <span className="owned-text">Đã sở hữu</span>
                            ) : (
                              <><Icon3dGoldCoin size={15} /> {shoe.cost} xu</>
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 5. PHỤ KIỆN & TRANG SỨC (ACCESSORIES) */}
              {activeTab === 'accessories' && (
                <div className="fashion-section-group">
                  <div className="fashion-subheading">
                    <h4>Phụ Kiện & Balo & Phao Bơi Play Together</h4>
                    <small>Trang sức độc lạ: Phao vịt quanh eo, balo ếch đung đưa, tai nghe mèo RGB, cánh thiên thần...</small>
                  </div>
                  <div className="fashion-grid-items">
                    {EARS_OPTIONS.filter(ear => boutiqueMode === 'shop' || isItemOwned(ear.id) || ear.cost === 0).map(ear => {
                      const isSelected = previewCustom.ears === ear.id;
                      const isOwned = isItemOwned(ear.id) || ear.cost === 0;
                      return (
                        <button
                          key={ear.id}
                          type="button"
                          className={`fashion-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setPreviewCustom(prev => ({ ...prev, ears: ear.id }));
                            farmAudio?.playPop?.();
                          }}
                        >
                          <div className="fashion-card-thumb ear-thumb">
                            <FashionMeshThumbnail item={ear} field="ears" capture={thumbnailRef} />
                            {ear.tag && <span className={`card-tag-ribbon ${ear.tag.toLowerCase()}`}>{ear.tag}</span>}
                            {isSelected && <span className="selection-badge"><Icon3dCheck size={16} /></span>}
                          </div>
                          <div className="fashion-card-info">
                            <div className="fashion-card-meta">
                              <strong>{ear.name}</strong>
                              {renderRarity(ear.rarity)}
                            </div>
                            <small>{ear.desc}</small>
                            <span className="fashion-price-tag">
                              {isOwned ? (
                                <span className="owned-text">Đã sở hữu</span>
                              ) : (
                                <><Icon3dGoldCoin size={15} /> {ear.cost} xu</>
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 6. KHUÔN MẶT & BIỂU CẢM (FACE & EXPRESSIONS) */}
              {activeTab === 'face' && (
                <div className="fashion-face-wrapper">
                  {/* Sub-nav for facial features */}
                  <div className="fashion-subtabs">
                    <button
                      type="button"
                      className={`fashion-subtab-btn ${faceSubTab === 'eyes' ? 'active' : ''}`}
                      onClick={() => setFaceSubTab('eyes')}
                    >
                      Đôi Mắt
                    </button>
                    <button
                      type="button"
                      className={`fashion-subtab-btn ${faceSubTab === 'mouth' ? 'active' : ''}`}
                      onClick={() => setFaceSubTab('mouth')}
                    >
                      Miệng Cười
                    </button>
                    <button
                      type="button"
                      className={`fashion-subtab-btn ${faceSubTab === 'blush' ? 'active' : ''}`}
                      onClick={() => setFaceSubTab('blush')}
                    >
                      Má Hồng
                    </button>
                    <button
                      type="button"
                      className={`fashion-subtab-btn ${faceSubTab === 'nose' ? 'active' : ''}`}
                      onClick={() => setFaceSubTab('nose')}
                    >
                      Dáng Mũi
                    </button>
                  </div>

                  {/* Sub-tab 2: EYES */}
                  {faceSubTab === 'eyes' && (
                    <div className="fashion-section-group">
                      <div className="fashion-subheading">
                        <h4>Dáng Mắt Chibi</h4>
                      </div>
                      <div className="fashion-grid-items">
                        {EYES_OPTIONS.filter(eye => boutiqueMode === 'shop' || isItemOwned(eye.id) || eye.cost === 0).map(eye => {
                          const isSelected = previewCustom.eyeType === eye.id;
                          const isOwned = isItemOwned(eye.id) || eye.cost === 0;
                          return (
                            <button
                              key={eye.id}
                              type="button"
                              className={`fashion-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => {
                                setPreviewCustom(prev => ({ ...prev, eyeType: eye.id }));
                                farmAudio?.playPop?.();
                              }}
                            >
                              <div className="fashion-card-thumb eye-thumb">
                                <FashionMeshThumbnail item={eye} field="eyeType" capture={thumbnailRef} />
                                {isSelected && <span className="selection-badge"><Icon3dCheck size={16} /></span>}
                              </div>
                              <div className="fashion-card-info">
                                <strong>{eye.name}</strong>
                                <small>{eye.desc}</small>
                                <span className="fashion-price-tag">
                                  {isOwned ? (
                                    <span className="owned-text">Đã sở hữu</span>
                                  ) : (
                                    <><Icon3dGoldCoin size={15} /> {eye.cost} xu</>
                                  )}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="fashion-subheading" style={{ marginTop: '16px' }}>
                        <h4>Màu Mắt Sâu Thẳm</h4>
                      </div>
                      <div className="fashion-dye-palette">
                        {EYE_COLORS.map(color => {
                          const isSelected = (previewCustom.eyeColor || '').toLowerCase() === color.hex.toLowerCase();
                          const isOwned = isItemOwned(color.id) || color.cost === 0;
                          return (
                            <button
                              key={color.id}
                              type="button"
                              className={`fashion-dye-swatch ${isSelected ? 'selected' : ''}`}
                              style={{ backgroundColor: color.hex }}
                              title={`${color.name} (${color.cost ? `${color.cost} xu` : 'Miễn phí'})`}
                              onClick={() => {
                                setPreviewCustom(prev => ({ ...prev, eyeColor: color.hex }));
                                farmAudio?.playPop?.();
                              }}
                            >
                              {isSelected && <span className="dye-check">✓</span>}
                              {!isOwned && color.cost > 0 && <span className="dye-lock-dot" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sub-tab 3: MOUTH */}
                  {faceSubTab === 'mouth' && (
                    <div className="fashion-grid-items">
                      {MOUTH_OPTIONS.map(m => {
                        const isSelected = previewCustom.mouthType === m.id;
                        const isOwned = isItemOwned(m.id) || m.cost === 0;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            className={`fashion-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setPreviewCustom(prev => ({ ...prev, mouthType: m.id }));
                              farmAudio?.playPop?.();
                            }}
                          >
                            <div className="fashion-card-thumb mouth-thumb">
                              <FashionMeshThumbnail item={m} field="mouthType" capture={thumbnailRef} />
                              {isSelected && <span className="selection-badge"><Icon3dCheck size={16} /></span>}
                            </div>
                            <div className="fashion-card-info">
                              <strong>{m.name}</strong>
                              <span className="fashion-price-tag">
                                {isOwned ? (
                                  <span className="owned-text">Đã sở hữu</span>
                                ) : (
                                  <><Icon3dGoldCoin size={15} /> {m.cost} xu</>
                                )}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Sub-tab 4: BLUSH */}
                  {faceSubTab === 'blush' && (
                    <div className="fashion-grid-items">
                      {BLUSH_OPTIONS.map(b => {
                        const isSelected = previewCustom.blushType === b.id;
                        const isOwned = isItemOwned(b.id) || b.cost === 0;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            className={`fashion-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setPreviewCustom(prev => ({ ...prev, blushType: b.id }));
                              farmAudio?.playPop?.();
                            }}
                          >
                            <div className="fashion-card-thumb blush-thumb">
                              <FashionMeshThumbnail item={b} field="blushType" capture={thumbnailRef} />
                              {isSelected && <span className="selection-badge"><Icon3dCheck size={16} /></span>}
                            </div>
                            <div className="fashion-card-info">
                              <strong>{b.name}</strong>
                              <span className="fashion-price-tag">
                                {isOwned ? (
                                  <span className="owned-text">Đã sở hữu</span>
                                ) : (
                                  <><Icon3dGoldCoin size={15} /> {b.cost} xu</>
                                )}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Sub-tab 5: NOSE */}
                  {faceSubTab === 'nose' && (
                    <div className="fashion-grid-items">
                      {NOSE_OPTIONS.map(n => {
                        const isSelected = previewCustom.noseType === n.id;
                        const isOwned = isItemOwned(n.id) || n.cost === 0;
                        return (
                          <button
                            key={n.id}
                            type="button"
                            className={`fashion-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setPreviewCustom(prev => ({ ...prev, noseType: n.id }));
                              farmAudio?.playPop?.();
                            }}
                          >
                            <div className="fashion-card-thumb nose-thumb">
                              <FashionMeshThumbnail item={n} field="noseType" capture={thumbnailRef} />
                              {isSelected && <span className="selection-badge"><Icon3dCheck size={16} /></span>}
                            </div>
                            <div className="fashion-card-info">
                              <strong>{n.name}</strong>
                              <span className="fashion-price-tag">
                                {isOwned ? (
                                  <span className="owned-text">Đã sở hữu</span>
                                ) : (
                                  <><Icon3dGoldCoin size={15} /> {n.cost} xu</>
                                )}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 6. FULL SETS PHỐI SẴN (PRE-CURATED OUTFITS) */}
              {activeTab === 'sets' && (
                <div className="fashion-grid-items">
                  {FULL_SETS.map(set => {
                    return (
                      <button
                        key={set.id}
                        type="button"
                        className="fashion-card set-card"
                        onClick={() => {
                          setPreviewCustom(prev => ({
                            ...prev,
                            ...set.customization,
                          }));
                          farmAudio?.playPop?.();
                        }}
                      >
                        <div className="fashion-card-thumb set-thumb">
                          <FashionMeshThumbnail item={set} field="set" capture={thumbnailRef} />
                          {set.rarity && <span className={`card-tag-ribbon ${set.rarity.toLowerCase()}`}>{set.rarity}</span>}
                        </div>
                        <div className="fashion-card-info">
                          <div className="fashion-card-meta">
                            <strong>{set.name}</strong>
                            {renderRarity(set.rarity)}
                          </div>
                          <small>{set.desc}</small>
                          <span className="fashion-try-tag">Chạm để thử trọn bộ ➔</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
