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
import { Icon3dCloseButton } from './icons3d/Inventory3DIcons.jsx';
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
import { InventoryItemArt } from './InventoryItemArt.jsx';
import { FashionMeshThumbnail } from './FashionMeshThumbnail.jsx';
import './FashionBoutiqueRedesign.css';

/* =========================================================================
   PLAY TOGETHER UNIFIED FASHION ITEM TILE (PHASE 1)
   Clean, chunky, rarity-tinted borders, zero AI-slop ribbons or star clutter.
   ========================================================================= */
function FashionItemTile({
  item,
  field,
  isSelected,
  isEquipped,
  isOwned,
  onSelect,
  onInspect,
  thumbnailRef,
  colorDot,
  customThumb,
  showPrice = true,
}) {
  const rarity = (item.rarity || 'common').toLowerCase();
  const rarityObj = FASHION_RARITY[rarity.toUpperCase()] || FASHION_RARITY.COMMON;

  return (
    <button
      type="button"
      className={`fashion-tile rarity-${rarity} ${isSelected ? 'selected' : ''}`}
      onClick={() => {
        onSelect?.();
        onInspect?.(item);
      }}
      onMouseEnter={() => onInspect?.(item)}
      title={item.name || item.label}
    >
      <div className="fashion-tile-thumb" style={{ backgroundColor: rarityObj.bgColor }}>
        {customThumb ? (
          customThumb
        ) : (
          <InventoryItemArt
            item={{ id: item.id, itemId: item.id, ...item, category: 'fashion', field }}
            size={52}
          />
        )}
        {colorDot && <span className="color-dot" style={{ backgroundColor: colorDot }} />}
        {isEquipped && <span className="tile-badge-equipped">Đang mặc</span>}
        {isSelected && (
          <span className="tile-badge-selected">
            <Icon3dCheck size={14} />
          </span>
        )}
      </div>

      <div className="fashion-tile-info">
        <strong className="fashion-tile-name">{item.name || item.label}</strong>
        {showPrice && (
          <div className="fashion-tile-pill">
            {isEquipped ? (
              <span className="status-equipped">Đang mặc</span>
            ) : isOwned ? (
              <span className="status-owned">Đã có</span>
            ) : item.cost === 0 ? (
              <span className="status-free">Miễn phí</span>
            ) : (
              <span className="status-cost">
                <Icon3dGoldCoin size={12} /> {item.cost.toLocaleString()} xu
              </span>
            )}
          </div>
        )}
        {field === 'set' && (
          <div className="fashion-tile-pill">
            <span className="status-set">Thử set ➔</span>
          </div>
        )}
      </div>
    </button>
  );
}

export function FashionBoutiqueModal({
  currentCustomization,
  ownedItems = [],
  coins = 0,
  onSaveAndEquip,
  onClose,
}) {
  const [boutiqueMode, setBoutiqueMode] = useState('shop'); // 'shop' | 'wardrobe'
  const [activeTab, setActiveTab] = useState('accessories'); // body, hair, top, bottom, shoes, accessories, face, sets
  const [faceSubTab, setFaceSubTab] = useState('eyes'); // eyes, nose, mouth, blush
  const [cameraMode, setCameraMode] = useState('body'); // body, face, accessories
  const [filterScope, setFilterScope] = useState('all'); // 'all' | 'unowned' | 'owned'
  const [inspectedItem, setInspectedItem] = useState(null);

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

      const custom = {
        ...getDefaultCustomization(),
        gender: field === 'gender' ? item.id : 'female',
        skinTone: field === 'skinTone' ? item.id : 'peach',
        skinColor: field === 'skinTone' ? (item.hex || '#ffd8c0') : '#ffd8c0',
        hairStyle: field === 'hairStyle' ? item.id : 'hair_classic',
        hairColor: '#5c3a21',
        topId: field === 'topId' ? item.id : 'top_tee_white',
        topColor: field === 'topId' && item.color ? item.color : '#f8fafc',
        bottomId: field === 'bottomId' ? item.id : 'bot_denim_shorts',
        bottomColor: field === 'bottomId' && item.color ? item.color : '#4778b6',
        shoeId: field === 'shoeId' ? item.id : 'shoe_chunky_white',
        shoeColor: field === 'shoeId' && item.color ? item.color : '#ffffff',
        ears: field === 'ears' ? item.id : 'human',
        eyeType: field === 'eyeType' ? item.id : 'classic',
        eyeColor: '#785242',
        mouthType: field === 'mouthType' ? item.id : 'smile',
        noseType: field === 'noseType' ? item.id : 'dot',
        blushType: field === 'blushType' ? item.id : 'peach',
      };

      if (field === 'set') {
        Object.assign(custom, item.customization);
      } else {
        custom[field] = item.id;
      }
      if (item.color) {
        if (field === 'topId') custom.topColor = item.color;
        else if (field === 'bottomId') custom.bottomColor = item.color;
        else if (field === 'shoeId') custom.shoeColor = item.color;
        else if (field === 'hairStyle') custom.hairColor = item.color;
      }

      const isBack = field === 'ears' && ['frog_backpack', 'angel_wings', 'bat_wings'].includes(item.id);
      const isWaist = field === 'ears' && ['duck_floatie'].includes(item.id);

      if (field === 'hairStyle') {
        camera.alpha = Math.PI / 2;
        camera.beta = 1.42;
        camera.target.set(0, 1.58, 0);
        camera.radius = 1.4;
      } else if (field === 'ears') {
        if (isBack) {
          camera.alpha = -Math.PI / 2;
          camera.beta = 1.44;
          camera.target.set(0, 1.25, 0);
          camera.radius = 1.85;
        } else if (isWaist) {
          camera.alpha = Math.PI / 2;
          camera.beta = 1.40;
          camera.target.set(0, 0.85, 0);
          camera.radius = 2.1;
        } else {
          camera.alpha = Math.PI / 2;
          camera.beta = 1.42;
          camera.target.set(0, 1.72, 0);
          camera.radius = 1.35;
        }
      } else if (field === 'topId') {
        camera.alpha = Math.PI / 2;
        camera.beta = 1.44;
        camera.target.set(0, 1.15, 0);
        camera.radius = 1.85;
      } else if (field === 'bottomId') {
        camera.alpha = Math.PI / 2;
        camera.beta = 1.44;
        camera.target.set(0, 0.65, 0);
        camera.radius = 1.75;
      } else if (field === 'shoeId') {
        camera.alpha = Math.PI / 2;
        camera.beta = 1.38;
        camera.target.set(0, 0.20, 0);
        camera.radius = 0.95;
      } else if (field === 'gender' || field === 'set') {
        camera.alpha = Math.PI / 2;
        camera.beta = 1.42;
        camera.target.set(0, 1.05, 0);
        camera.radius = 3.6;
      } else if (['eyeType', 'mouthType', 'noseType', 'blushType'].includes(field)) {
        camera.alpha = Math.PI / 2;
        camera.beta = 1.44;
        camera.target.set(0, 1.54, 0);
        camera.radius = 1.10;
      } else {
        camera.alpha = Math.PI / 2;
        camera.beta = 1.45;
        camera.target.set(0, 1.05, 0);
        camera.radius = 4.0;
      }

      try {
        avatar.applyCustomization(custom);
        scene.render();
        const image = document.createElement('canvas');
        image.width = image.height = 160;
        const size = Math.min(canvas.width, canvas.height);
        image.getContext('2d').drawImage(canvas, (canvas.width - size) / 2, (canvas.height - size) / 2, size, size, 0, 0, 160, 160);
        return image.toDataURL('image/webp', 0.85);
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
      camera.target.set(0, 1.48, 0);
      camera.radius = 1.9;
      camera.beta = 1.42;
    } else if (mode === 'accessories') {
      camera.target.set(0, 1.30, 0);
      camera.radius = 3.0;
      camera.beta = 1.40;
    } else {
      camera.target.set(0, 1.05, 0);
      camera.radius = 4.2;
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

  // All items currently different from equipped (for interactive trial chips)
  const changedItems = useMemo(() => {
    const list = [];
    if (previewCustom.hairStyle !== initialEquipped.hairStyle) {
      const item = HAIR_STYLES.find(h => h.id === previewCustom.hairStyle);
      if (item) list.push({ field: 'hairStyle', name: item.name, cost: item.cost, isOwned: isItemOwned(item.id) || item.cost === 0 });
    }
    if ((previewCustom.hairColor || '').toLowerCase() !== (initialEquipped.hairColor || '').toLowerCase()) {
      const dye = HAIR_DYES.find(d => d.hex.toLowerCase() === (previewCustom.hairColor || '').toLowerCase());
      if (dye) list.push({ field: 'hairColor', name: `Màu: ${dye.name}`, cost: dye.cost, isOwned: isItemOwned(dye.id) || dye.cost === 0 });
    }
    if (previewCustom.topId !== initialEquipped.topId) {
      const item = TOPS.find(t => t.id === previewCustom.topId);
      if (item) list.push({ field: 'topId', name: item.name, cost: item.cost, isOwned: isItemOwned(item.id) || item.cost === 0 });
    }
    if (previewCustom.bottomId !== initialEquipped.bottomId) {
      const item = BOTTOMS.find(b => b.id === previewCustom.bottomId);
      if (item) list.push({ field: 'bottomId', name: item.name, cost: item.cost, isOwned: isItemOwned(item.id) || item.cost === 0 });
    }
    if (previewCustom.shoeId !== initialEquipped.shoeId) {
      const item = SHOES.find(s => s.id === previewCustom.shoeId);
      if (item) list.push({ field: 'shoeId', name: item.name, cost: item.cost, isOwned: isItemOwned(item.id) || item.cost === 0 });
    }
    if (previewCustom.ears !== initialEquipped.ears) {
      const item = EARS_OPTIONS.find(e => e.id === previewCustom.ears);
      if (item) list.push({ field: 'ears', name: item.name, cost: item.cost, isOwned: isItemOwned(item.id) || item.cost === 0 });
    }
    if (previewCustom.eyeType !== initialEquipped.eyeType) {
      const item = EYES_OPTIONS.find(e => e.id === previewCustom.eyeType);
      if (item) list.push({ field: 'eyeType', name: item.name, cost: item.cost, isOwned: isItemOwned(item.id) || item.cost === 0 });
    }
    if ((previewCustom.eyeColor || '').toLowerCase() !== (initialEquipped.eyeColor || '').toLowerCase()) {
      const dye = EYE_COLORS.find(d => d.hex.toLowerCase() === (previewCustom.eyeColor || '').toLowerCase());
      if (dye) list.push({ field: 'eyeColor', name: `Mắt: ${dye.name}`, cost: dye.cost, isOwned: isItemOwned(dye.id) || dye.cost === 0 });
    }
    if (previewCustom.mouthType !== initialEquipped.mouthType) {
      const item = MOUTH_OPTIONS.find(m => m.id === previewCustom.mouthType);
      if (item) list.push({ field: 'mouthType', name: item.name, cost: item.cost, isOwned: isItemOwned(item.id) || item.cost === 0 });
    }
    if (previewCustom.blushType !== initialEquipped.blushType) {
      const item = BLUSH_OPTIONS.find(b => b.id === previewCustom.blushType);
      if (item) list.push({ field: 'blushType', name: item.name, cost: item.cost, isOwned: isItemOwned(item.id) || item.cost === 0 });
    }
    if (previewCustom.noseType !== initialEquipped.noseType) {
      const item = NOSE_OPTIONS.find(n => n.id === previewCustom.noseType);
      if (item) list.push({ field: 'noseType', name: item.name, cost: item.cost, isOwned: isItemOwned(item.id) || item.cost === 0 });
    }
    return list;
  }, [previewCustom, initialEquipped, ownedItems]);

  const revertItem = (field) => {
    setPreviewCustom(prev => ({
      ...prev,
      [field]: initialEquipped[field],
      ...(field === 'topId' ? { topColor: initialEquipped.topColor } : {}),
      ...(field === 'bottomId' ? { bottomColor: initialEquipped.bottomColor } : {}),
      ...(field === 'shoeId' ? { shoeColor: initialEquipped.shoeColor } : {}),
      ...(field === 'hairStyle' ? { hairColor: initialEquipped.hairColor } : {}),
    }));
    farmAudio?.playPop?.();
  };

  const currentTabItems = useMemo(() => {
    switch (activeTab) {
      case 'hair': return HAIR_STYLES;
      case 'top': return TOPS;
      case 'bottom': return BOTTOMS;
      case 'shoes': return SHOES;
      case 'accessories': return EARS_OPTIONS;
      case 'face': {
        if (faceSubTab === 'eyes') return EYES_OPTIONS;
        if (faceSubTab === 'mouth') return MOUTH_OPTIONS;
        if (faceSubTab === 'blush') return BLUSH_OPTIONS;
        if (faceSubTab === 'nose') return NOSE_OPTIONS;
        return [];
      }
      case 'sets': return FULL_SETS;
      default: return [];
    }
  }, [activeTab, faceSubTab]);

  useEffect(() => {
    if (currentTabItems.length > 0) {
      const selectedItem = currentTabItems.find(it => {
        if (activeTab === 'hair') return it.id === previewCustom.hairStyle;
        if (activeTab === 'top') return it.id === previewCustom.topId;
        if (activeTab === 'bottom') return it.id === previewCustom.bottomId;
        if (activeTab === 'shoes') return it.id === previewCustom.shoeId;
        if (activeTab === 'accessories') return it.id === previewCustom.ears;
        if (activeTab === 'face') {
          if (faceSubTab === 'eyes') return it.id === previewCustom.eyeType;
          if (faceSubTab === 'mouth') return it.id === previewCustom.mouthType;
          if (faceSubTab === 'blush') return it.id === previewCustom.blushType;
          if (faceSubTab === 'nose') return it.id === previewCustom.noseType;
        }
        return false;
      });
      setInspectedItem(selectedItem || currentTabItems[0]);
    } else {
      setInspectedItem(null);
    }
  }, [activeTab, faceSubTab, currentTabItems, previewCustom.hairStyle, previewCustom.topId, previewCustom.bottomId, previewCustom.shoeId, previewCustom.ears, previewCustom.eyeType, previewCustom.mouthType, previewCustom.blushType, previewCustom.noseType]);

  const tabCounts = useMemo(() => {
    const all = currentTabItems.length;
    const owned = currentTabItems.filter(it => isItemOwned(it.id) || it.cost === 0).length;
    const unowned = all - owned;
    return { all, owned, unowned };
  }, [currentTabItems, ownedItems]);

  const filterList = (items) => {
    if (boutiqueMode === 'wardrobe') {
      return items.filter(it => isItemOwned(it.id) || it.cost === 0);
    }
    if (filterScope === 'owned') {
      return items.filter(it => isItemOwned(it.id) || it.cost === 0);
    }
    if (filterScope === 'unowned') {
      return items.filter(it => !isItemOwned(it.id) && it.cost > 0);
    }
    return items;
  };

  const renderFilterRow = () => {
    if (currentTabItems.length === 0) return null;
    if (boutiqueMode === 'wardrobe') {
      return (
        <div className="fashion-filter-row wardrobe-filter-banner">
          <span className="wardrobe-count-pill">
            Tủ đồ: Đang hiển thị {tabCounts.owned} món đã sở hữu
          </span>
        </div>
      );
    }
    return (
      <div className="fashion-filter-row">
        <div className="fashion-scope-pills">
          <button
            type="button"
            className={`filter-pill ${filterScope === 'all' ? 'active' : ''}`}
            onClick={() => {
              setFilterScope('all');
              farmAudio?.playPop?.();
            }}
          >
            Tất cả ({tabCounts.all})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterScope === 'unowned' ? 'active' : ''}`}
            onClick={() => {
              setFilterScope('unowned');
              farmAudio?.playPop?.();
            }}
          >
            Chưa có ({tabCounts.unowned})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterScope === 'owned' ? 'active' : ''}`}
            onClick={() => {
              setFilterScope('owned');
              farmAudio?.playPop?.();
            }}
          >
            Đã sở hữu ({tabCounts.owned})
          </button>
        </div>
      </div>
    );
  };

  const renderEmptyState = (message = 'Không có món đồ nào phù hợp bộ lọc.') => (
    <div className="fashion-empty-state">
      <p>{message}</p>
      {filterScope !== 'all' && boutiqueMode !== 'wardrobe' && (
        <button
          type="button"
          className="fashion-empty-reset-btn"
          onClick={() => {
            setFilterScope('all');
            farmAudio?.playPop?.();
          }}
        >
          Xem tất cả ({tabCounts.all})
        </button>
      )}
    </div>
  );

  return (
    <div className="fashion-modal-backdrop fashion-redesign" onClick={onClose}>
      <section className="fashion-modal-card" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Header Thời Trang Play Together */}
        <header className="fashion-modal-header">
          <div className="fashion-brand">
            <span className="fashion-brand-icon">
              <Icon3dFashionLogo size={38} />
            </span>
            <div className="fashion-title-wrap">
              <h2>TIỆM THỜI TRANG</h2>
            </div>
          </div>

          {/* Chuyển đổi chế độ: Cửa Hàng vs Tủ Đồ Của Tôi */}
          <div className="fashion-mode-switch">
            <button
              type="button"
              className={`fashion-mode-pill ${boutiqueMode === 'shop' ? 'active' : ''}`}
              onClick={() => {
                farmAudio?.playPop?.();
                setBoutiqueMode('shop');
                setFilterScope('all');
              }}
            >
              <Icon3dTabTop size={16} active={boutiqueMode === 'shop'} />
              <span>Cửa Hàng</span>
            </button>
            <button
              type="button"
              className={`fashion-mode-pill ${boutiqueMode === 'wardrobe' ? 'active' : ''}`}
              onClick={() => {
                farmAudio?.playPop?.();
                setBoutiqueMode('wardrobe');
                setFilterScope('owned');
              }}
            >
              <Icon3dTabWardrobe size={16} active={boutiqueMode === 'wardrobe'} />
              <span>Tủ Đồ</span>
            </button>
          </div>

          <div className="fashion-header-right">
            <div className="fashion-coin-pill">
              <Icon3dGoldCoin size={22} />
              <span>{coins.toLocaleString()} xu</span>
            </div>
            <button className="fashion-close-btn" type="button" onClick={onClose} aria-label="Đóng cửa hàng">
              <Icon3dCloseButton size={34} />
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

            {/* Floating Game HUD Dock at Bottom of 3D Fitting Room */}
            <div className="fashion-bottom-floating-dock">
              {/* Thanh Tạo Dáng & Emotes Play Together */}
              <div className="fashion-pose-bar">
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

              {/* Try-On Cart Summary Status Capsule */}
              <div className="fashion-cart-summary">
                {unownedItems.length > 0 ? (
                  <div className="fashion-cart-alert shopping">
                    <span>Đang thử <strong>{unownedItems.length}</strong> món đồ mới</span>
                    <div className="fashion-cart-price">
                      <Icon3dGoldCoin size={18} />
                      <strong>{totalCartCost.toLocaleString()} xu</strong>
                    </div>
                  </div>
                ) : isDifferentFromEquipped ? (
                  <div className="fashion-cart-alert wardrobe">
                    <span>Đang thử đồ trong tủ · Miễn phí</span>
                    <strong className="fashion-free-tag">Đã có</strong>
                  </div>
                ) : (
                  <div className="fashion-cart-alert matching">
                    <span>Đang mặc trang phục hiện tại của bạn</span>
                  </div>
                )}

                {/* Active Trial Items Breakdown with Quick-Remove */}
                {changedItems.length > 0 && (
                  <div className="fashion-trial-tags">
                    <div className="fashion-trial-chips">
                      {changedItems.map(trial => (
                        <span
                          key={trial.field}
                          className={`fashion-trial-chip ${trial.isOwned ? 'owned' : 'unowned'}`}
                          title={trial.name}
                        >
                          <span className="chip-name">{trial.name}</span>
                          {!trial.isOwned && trial.cost > 0 && (
                            <span className="chip-cost">+{trial.cost}</span>
                          )}
                          <button
                            type="button"
                            className="chip-remove-btn"
                            onClick={() => revertItem(trial.field)}
                            title={`Bỏ thử ${trial.name}`}
                            aria-label={`Bỏ thử ${trial.name}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
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
                          {presets[idx] ? `★ Set ${idx + 1}` : `Set ${idx + 1}`}
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
          </div>

          {/* Right: Wardrobe & Shop Catalog Container with VERTICAL Icon Rail */}
          <div className="fashion-catalog-layout">
            <div className="fashion-catalog-main">
              {/* Clean Sub-header: Category Title & Filter Scope Pills */}
              <div className="fashion-catalog-top-bar">
                <div className="fashion-tab-heading">
                  <h3>
                    {activeTab === 'hair' ? 'Kiểu Tóc & Màu Nhuộm' :
                     activeTab === 'top' ? 'Áo Thời Trang' :
                     activeTab === 'bottom' ? 'Quần & Váy' :
                     activeTab === 'shoes' ? 'Giày Dép' :
                     activeTab === 'accessories' ? 'Phụ Kiện & Balo' :
                     activeTab === 'face' ? 'Khuôn Mặt & Biểu Cảm' :
                     activeTab === 'sets' ? 'Set Trang Phục' :
                     'Dáng Người & Màu Da'}
                  </h3>
                </div>
                {renderFilterRow()}
              </div>

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
                      <FashionItemTile
                        key={gender.id}
                        item={{ ...gender, name: `Dáng ${gender.label}`, desc: 'Form cơ thể mềm mại, cân đối chuẩn Play Together.', rarity: 'common' }}
                        field="gender"
                        isSelected={previewCustom.gender === gender.id}
                        isEquipped={initialEquipped.gender === gender.id}
                        isOwned={true}
                        onSelect={() => {
                          setPreviewCustom(prev => ({ ...prev, gender: gender.id }));
                          farmAudio?.playPop?.();
                        }}
                        onInspect={setInspectedItem}
                        thumbnailRef={thumbnailRef}
                        showPrice={false}
                      />
                    ))}
                  </div>

                  <div className="fashion-subheading" style={{ marginTop: '16px' }}>
                    <h4>Màu da cân sáng</h4>
                    <small>Bảng màu đã cân bằng ambient để không bị đen cháy hoặc trắng bệt khi đổi khu vực.</small>
                  </div>
                  <div className="fashion-grid-items">
                    {SKIN_TONES.map(tone => (
                      <FashionItemTile
                        key={tone.id}
                        item={{ ...tone, name: tone.label, desc: `Màu da chuẩn ambient sáng ấm ${tone.id}.`, rarity: 'common' }}
                        field="skinTone"
                        isSelected={previewCustom.skinTone === tone.id}
                        isEquipped={initialEquipped.skinTone === tone.id}
                        isOwned={true}
                        onSelect={() => {
                          setPreviewCustom(prev => ({ ...prev, skinTone: tone.id, skinColor: tone.hex }));
                          farmAudio?.playPop?.();
                        }}
                        onInspect={setInspectedItem}
                        customThumb={
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '14px',
                              background: `linear-gradient(135deg, ${tone.hex}, ${tone.shadow})`,
                            }}
                          />
                        }
                        showPrice={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 1. TÓC & NHUỘM (HAIR & DYE) */}
              {activeTab === 'hair' && (
                <div className="fashion-section-group">
                  <div className="fashion-subheading">
                    <h4>Kiểu Tóc</h4>
                  </div>
                  <div className="fashion-grid-items">
                    {filterList(HAIR_STYLES).map(hair => (
                      <FashionItemTile
                        key={hair.id}
                        item={hair}
                        field="hairStyle"
                        isSelected={previewCustom.hairStyle === hair.id}
                        isEquipped={initialEquipped.hairStyle === hair.id}
                        isOwned={isItemOwned(hair.id) || hair.cost === 0}
                        onSelect={() => {
                          setPreviewCustom(prev => ({ ...prev, hairStyle: hair.id }));
                          farmAudio?.playPop?.();
                        }}
                        onInspect={setInspectedItem}
                        thumbnailRef={thumbnailRef}
                      />
                    ))}
                    {filterList(HAIR_STYLES).length === 0 && renderEmptyState('Không có kiểu tóc nào phù hợp.')}
                  </div>

                  <div className="fashion-subheading" style={{ marginTop: '14px' }}>
                    <h4>Bảng Màu Nhuộm (12 Màu)</h4>
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
                            setInspectedItem({ ...dye, rarity: 'rare' });
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
                <div className="fashion-section-group">
                  <div className="fashion-grid-items">
                    {filterList(TOPS).map(top => (
                      <FashionItemTile
                        key={top.id}
                        item={top}
                        field="topId"
                        isSelected={previewCustom.topId === top.id}
                        isEquipped={initialEquipped.topId === top.id}
                        isOwned={isItemOwned(top.id) || top.cost === 0}
                        onSelect={() => {
                          setPreviewCustom(prev => ({ ...prev, topId: top.id, topColor: top.color }));
                          farmAudio?.playPop?.();
                        }}
                        onInspect={setInspectedItem}
                        thumbnailRef={thumbnailRef}
                        colorDot={top.color}
                      />
                    ))}
                    {filterList(TOPS).length === 0 && renderEmptyState('Không có áo nào phù hợp.')}
                  </div>
                </div>
              )}

              {/* 3. QUẦN & VÁY (BOTTOMS) */}
              {activeTab === 'bottom' && (
                <div className="fashion-section-group">
                  <div className="fashion-grid-items">
                    {filterList(BOTTOMS).map(bottom => (
                      <FashionItemTile
                        key={bottom.id}
                        item={bottom}
                        field="bottomId"
                        isSelected={previewCustom.bottomId === bottom.id}
                        isEquipped={initialEquipped.bottomId === bottom.id}
                        isOwned={isItemOwned(bottom.id) || bottom.cost === 0}
                        onSelect={() => {
                          setPreviewCustom(prev => ({ ...prev, bottomId: bottom.id, bottomColor: bottom.color }));
                          farmAudio?.playPop?.();
                        }}
                        onInspect={setInspectedItem}
                        thumbnailRef={thumbnailRef}
                        colorDot={bottom.color}
                      />
                    ))}
                    {filterList(BOTTOMS).length === 0 && renderEmptyState('Không có quần/váy nào phù hợp.')}
                  </div>
                </div>
              )}

              {/* 4. GIÀY DÉP (SHOES) */}
              {activeTab === 'shoes' && (
                <div className="fashion-section-group">
                  <div className="fashion-grid-items">
                    {filterList(SHOES).map(shoe => (
                      <FashionItemTile
                        key={shoe.id}
                        item={shoe}
                        field="shoeId"
                        isSelected={previewCustom.shoeId === shoe.id}
                        isEquipped={initialEquipped.shoeId === shoe.id}
                        isOwned={isItemOwned(shoe.id) || shoe.cost === 0}
                        onSelect={() => {
                          setPreviewCustom(prev => ({ ...prev, shoeId: shoe.id, shoeColor: shoe.color }));
                          farmAudio?.playPop?.();
                        }}
                        onInspect={setInspectedItem}
                        thumbnailRef={thumbnailRef}
                        colorDot={shoe.color}
                      />
                    ))}
                    {filterList(SHOES).length === 0 && renderEmptyState('Không có giày dép nào phù hợp.')}
                  </div>
                </div>
              )}

              {/* 5. PHỤ KIỆN & TRANG SỨC (ACCESSORIES) */}
              {activeTab === 'accessories' && (
                <div className="fashion-section-group">
                  <div className="fashion-grid-items">
                    {filterList(EARS_OPTIONS).map(ear => (
                      <FashionItemTile
                        key={ear.id}
                        item={ear}
                        field="ears"
                        isSelected={previewCustom.ears === ear.id}
                        isEquipped={initialEquipped.ears === ear.id}
                        isOwned={isItemOwned(ear.id) || ear.cost === 0}
                        onSelect={() => {
                          setPreviewCustom(prev => ({ ...prev, ears: ear.id }));
                          farmAudio?.playPop?.();
                        }}
                        onInspect={setInspectedItem}
                        thumbnailRef={thumbnailRef}
                      />
                    ))}
                    {filterList(EARS_OPTIONS).length === 0 && renderEmptyState('Không có phụ kiện nào phù hợp.')}
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
                        {filterList(EYES_OPTIONS).map(eye => (
                          <FashionItemTile
                            key={eye.id}
                            item={eye}
                            field="eyeType"
                            isSelected={previewCustom.eyeType === eye.id}
                            isEquipped={initialEquipped.eyeType === eye.id}
                            isOwned={isItemOwned(eye.id) || eye.cost === 0}
                            onSelect={() => {
                              setPreviewCustom(prev => ({ ...prev, eyeType: eye.id }));
                              farmAudio?.playPop?.();
                            }}
                            onInspect={setInspectedItem}
                            thumbnailRef={thumbnailRef}
                          />
                        ))}
                        {filterList(EYES_OPTIONS).length === 0 && renderEmptyState('Không có dáng mắt nào phù hợp bộ lọc.')}
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
                                setInspectedItem({ ...color, desc: `Màu mắt ${color.name}.`, rarity: 'rare' });
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
                      {filterList(MOUTH_OPTIONS).map(m => (
                        <FashionItemTile
                          key={m.id}
                          item={m}
                          field="mouthType"
                          isSelected={previewCustom.mouthType === m.id}
                          isEquipped={initialEquipped.mouthType === m.id}
                          isOwned={isItemOwned(m.id) || m.cost === 0}
                          onSelect={() => {
                            setPreviewCustom(prev => ({ ...prev, mouthType: m.id }));
                            farmAudio?.playPop?.();
                          }}
                          onInspect={setInspectedItem}
                          thumbnailRef={thumbnailRef}
                        />
                      ))}
                      {filterList(MOUTH_OPTIONS).length === 0 && renderEmptyState('Không có dáng miệng nào phù hợp bộ lọc.')}
                    </div>
                  )}

                  {/* Sub-tab 4: BLUSH */}
                  {faceSubTab === 'blush' && (
                    <div className="fashion-grid-items">
                      {filterList(BLUSH_OPTIONS).map(b => (
                        <FashionItemTile
                          key={b.id}
                          item={b}
                          field="blushType"
                          isSelected={previewCustom.blushType === b.id}
                          isEquipped={initialEquipped.blushType === b.id}
                          isOwned={isItemOwned(b.id) || b.cost === 0}
                          onSelect={() => {
                            setPreviewCustom(prev => ({ ...prev, blushType: b.id }));
                            farmAudio?.playPop?.();
                          }}
                          onInspect={setInspectedItem}
                          thumbnailRef={thumbnailRef}
                        />
                      ))}
                      {filterList(BLUSH_OPTIONS).length === 0 && renderEmptyState('Không có màu má nào phù hợp bộ lọc.')}
                    </div>
                  )}

                  {/* Sub-tab 5: NOSE */}
                  {faceSubTab === 'nose' && (
                    <div className="fashion-grid-items">
                      {filterList(NOSE_OPTIONS).map(n => (
                        <FashionItemTile
                          key={n.id}
                          item={n}
                          field="noseType"
                          isSelected={previewCustom.noseType === n.id}
                          isEquipped={initialEquipped.noseType === n.id}
                          isOwned={isItemOwned(n.id) || n.cost === 0}
                          onSelect={() => {
                            setPreviewCustom(prev => ({ ...prev, noseType: n.id }));
                            farmAudio?.playPop?.();
                          }}
                          onInspect={setInspectedItem}
                          thumbnailRef={thumbnailRef}
                        />
                      ))}
                      {filterList(NOSE_OPTIONS).length === 0 && renderEmptyState('Không có dáng mũi nào phù hợp bộ lọc.')}
                    </div>
                  )}
                </div>
              )}

              {/* 6. FULL SETS PHỐI SẴN (PRE-CURATED OUTFITS) */}
              {activeTab === 'sets' && (
                <div className="fashion-section-group">
                  <div className="fashion-subheading">
                    <h4>Full Sets Trang Phục Phối Sẵn</h4>
                    <small>Thử trọn bộ trang phục thời trang phong cách Play Together</small>
                  </div>
                  <div className="fashion-grid-items">
                    {FULL_SETS.map(set => (
                      <FashionItemTile
                        key={set.id}
                        item={set}
                        field="set"
                        isSelected={false}
                        isEquipped={false}
                        isOwned={false}
                        onSelect={() => {
                          setPreviewCustom(prev => ({
                            ...prev,
                            ...set.customization,
                          }));
                          farmAudio?.playPop?.();
                        }}
                        onInspect={setInspectedItem}
                        thumbnailRef={thumbnailRef}
                        showPrice={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Play Together Style Bottom Inspection Bar (Phase 1 & 2) */}
            {inspectedItem && (
              <footer className="fashion-inspect-bar">
                <div className="inspect-left">
                  <span className={`inspect-rarity-badge rarity-${(inspectedItem.rarity || 'common').toLowerCase()}`}>
                    {FASHION_RARITY[(inspectedItem.rarity || 'common').toUpperCase()]?.label || 'Thường'}
                  </span>
                  <span className="inspect-item-name">{inspectedItem.name || inspectedItem.label}</span>
                  {inspectedItem.desc && <span className="inspect-item-desc">{inspectedItem.desc}</span>}
                </div>
                <div className="inspect-right">
                  {isItemOwned(inspectedItem.id) || inspectedItem.cost === 0 ? (
                    <span className="inspect-status-owned">Đã có</span>
                  ) : inspectedItem.cost ? (
                    <span className="inspect-status-cost">
                      <Icon3dGoldCoin size={14} /> {inspectedItem.cost.toLocaleString()} xu
                    </span>
                  ) : null}
                </div>
              </footer>
            )}
          </div>

          {/* Vertical Category Rail on the far right (Play Together signature style) */}
          <nav className="fashion-vertical-rail" aria-label="Danh mục thời trang">
            <button
              type="button"
              className={`rail-tab-btn ${activeTab === 'hair' ? 'active' : ''}`}
              onClick={() => { setActiveTab('hair'); setCameraView('face'); farmAudio?.playPop?.(); }}
              title="Tóc & Nhuộm"
            >
              <div className="rail-tab-icon"><Icon3dTabHair active={activeTab === 'hair'} /></div>
              <span className="rail-tab-label">Tóc</span>
            </button>
            <button
              type="button"
              className={`rail-tab-btn ${activeTab === 'top' ? 'active' : ''}`}
              onClick={() => { setActiveTab('top'); setCameraView('body'); farmAudio?.playPop?.(); }}
              title="Áo"
            >
              <div className="rail-tab-icon"><Icon3dTabTop active={activeTab === 'top'} /></div>
              <span className="rail-tab-label">Áo</span>
            </button>
            <button
              type="button"
              className={`rail-tab-btn ${activeTab === 'bottom' ? 'active' : ''}`}
              onClick={() => { setActiveTab('bottom'); setCameraView('body'); farmAudio?.playPop?.(); }}
              title="Quần & Váy"
            >
              <div className="rail-tab-icon"><Icon3dTabBottom active={activeTab === 'bottom'} /></div>
              <span className="rail-tab-label">Quần</span>
            </button>
            <button
              type="button"
              className={`rail-tab-btn ${activeTab === 'shoes' ? 'active' : ''}`}
              onClick={() => { setActiveTab('shoes'); setCameraView('body'); farmAudio?.playPop?.(); }}
              title="Giày Dép"
            >
              <div className="rail-tab-icon"><Icon3dTabShoes active={activeTab === 'shoes'} /></div>
              <span className="rail-tab-label">Giày</span>
            </button>
            <button
              type="button"
              className={`rail-tab-btn ${activeTab === 'accessories' ? 'active' : ''}`}
              onClick={() => { setActiveTab('accessories'); setCameraView('accessories'); farmAudio?.playPop?.(); }}
              title="Phụ Kiện"
            >
              <div className="rail-tab-icon"><Icon3dTabEars active={activeTab === 'accessories'} /></div>
              <span className="rail-tab-label">Phụ kiện</span>
            </button>
            <button
              type="button"
              className={`rail-tab-btn ${activeTab === 'face' ? 'active' : ''}`}
              onClick={() => { setActiveTab('face'); setCameraView('face'); farmAudio?.playPop?.(); }}
              title="Khuôn Mặt"
            >
              <div className="rail-tab-icon"><Icon3dTabFace active={activeTab === 'face'} /></div>
              <span className="rail-tab-label">Mặt</span>
            </button>
            <button
              type="button"
              className={`rail-tab-btn ${activeTab === 'sets' ? 'active' : ''}`}
              onClick={() => { setActiveTab('sets'); setCameraView('body'); farmAudio?.playPop?.(); }}
              title="Set Phối Sẵn"
            >
              <div className="rail-tab-icon"><Icon3dTabSets active={activeTab === 'sets'} /></div>
              <span className="rail-tab-label">Sets</span>
            </button>
            <button
              type="button"
              className={`rail-tab-btn ${activeTab === 'body' ? 'active' : ''}`}
              onClick={() => { setActiveTab('body'); setCameraView('body'); farmAudio?.playPop?.(); }}
              title="Dáng & Da"
            >
              <div className="rail-tab-icon"><Icon3dTabBody active={activeTab === 'body'} /></div>
              <span className="rail-tab-label">Dáng & Da</span>
            </button>
          </nav>
        </div>
        </div>
      </section>
    </div>
  );
}
