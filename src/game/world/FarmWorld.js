import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { sampleMovement } from '../network/sampleMovement.js';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { Engine } from '@babylonjs/core/Engines/engine.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import '@babylonjs/core/Culling/ray.js';
import { FARM_CONFIG } from '../config.js';
import { createFarmPlot } from '../farming/createFarmPlot.js';
import { createPlayer } from '../player/createPlayer.js';
import { createOpenWorld } from './createOpenWorld.js';
import { createAnimalPen } from '../livestock/createAnimalPen.js';
import { createBusRoute } from '../transport/createBusRoute.js';
import { FarmingSystem } from '../farming/FarmingSystem.js';
import { createVillageElderNPC } from '../npc/VillageElderNPC.js';
import { createObjectiveMarker } from './ObjectiveMarker.js';
import { createMeadowTexture } from './createStylizedTextures.js';
import { chunkAt } from './WorldPartition.js';
import { RENDER_CONFIG, WORLD_LAYOUT } from './worldLayout.js';
import { ProceduralWorld } from './ProceduralWorld.js';
import { buildHumanMesh } from '../player/buildHumanMesh.js';
import { createAtmosphere } from './createAtmosphere.js';
import { createFarmGateAndSign } from '../farming/createFarmGateAndMailbox.js';
import { createFarmhouse, createStarterFarmhouse } from './createFarmhouse.js';
import { createOpenAirCorral } from '../farming/createOpenAirCorral.js';
import { createClassicRedBarn } from './landmarks/createSocialFarmstead.js';
import { createVillageGate } from './landmarks/createVillageGate.js';
import { createFoliageFactory } from './createFoliage.js';
import { createCinematicRenderingPipeline } from '../rendering/CinematicRenderingPipeline.js';
import { createStylizedGrass } from './createStylizedGrass.js';
import { createFarmAnimals } from './createFarmAnimals.js';
import { createVietnameseCountryside } from './createVietnameseCountryside.js';
import { FARM_LOT_SPEC } from '../../../shared/farmLayout.js';

function material(scene, name, color) {
  const value = new StandardMaterial(name, scene);
  value.diffuseColor = Color3.FromHexString(color);
  value.ambientColor = value.diffuseColor.scale(0.4);
  value.specularColor = new Color3(0.08, 0.08, 0.08);
  return value;
}

function createTree(scene, x, z, treeMaterials, shadowGenerator) {
  const trunk = MeshBuilder.CreateCylinder('tree-trunk', { height: 2.8, diameter: 0.65, tessellation: 8 }, scene);
  trunk.position.set(x, 1.4, z);
  trunk.material = treeMaterials.trunk;
  const crown = MeshBuilder.CreateSphere('tree-crown', { diameter: 3.1, segments: 8 }, scene);
  crown.scaling.y = 0.8;
  crown.position.set(x, 3.35, z);
  crown.material = treeMaterials.leaf;
  shadowGenerator.addShadowCaster(trunk);
  shadowGenerator.addShadowCaster(crown);
}

function createSign(scene, label, position, color) {
  const root = new TransformNode(`dest-sign-${label}`, scene);
  root.position = new Vector3(position.x, 0, position.z);

  // Cột trụ biển chỉ dẫn thanh mảnh
  const post = MeshBuilder.CreateCylinder(`sign-post-${label}`, { height: 2.8, diameter: 0.14, tessellation: 12 }, scene);
  post.position.y = 1.4;
  post.material = material(scene, 'dest-sign-post-mat', '#475569');
  post.parent = root;

  // Bảng chỉ dẫn 3D bo góc phong cách Play Together
  const board = MeshBuilder.CreateBox(`sign-board-${label}`, { width: 2.2, height: 0.7, depth: 0.12 }, scene);
  board.position.set(0, 2.45, 0);
  board.material = material(scene, `gate-${label}-material`, color);
  board.parent = root;
  board.metadata = { destination: label };
}

function createRemoteAvatar(scene, id, name, color, shadows) {
  const root = new TransformNode(`remote-player-${id}`, scene);
  const human = buildHumanMesh(scene, `remote-${id}`, {
    outfitColor: color,
    skinColor: '#fcd5b5',
    hairColor: '#3a2618',
    pantsColor: '#2b4162',
    bootsColor: '#5c381e',
    hatRibbonColor: color,
    shadows,
  });
  human.root.parent = root;
  root.metadata = { playerId: id, playerName: name, target: new Vector3(), targetRotation: 0, human };
  return root;
}


const REMOTE_COLORS = ['#5f91c8', '#e87994', '#8a72b8', '#58a66a', '#d98248', '#3f9d98'];
const VENUES = {
  casino: { entrance: { x: -26.0, z: -24.0 }, interior: { x: 210, y: 32, z: -215 }, label: 'Grand Neon Arcade & Casino Lounge', color: '#7c3aed' },
  fashion: { entrance: { x: 26.0, z: -24.0 }, interior: { x: 175, y: 32, z: -215 }, label: 'Trendy Fashion Mall', color: '#f43f5e' },
  vehicles: { entrance: { x: -26.0, z: 24.0 }, interior: { x: 140, y: 32, z: -215 }, label: 'Motors & Mobility Showroom', color: '#0284c7' },
  supplies: { entrance: { x: 26.0, z: 24.0 }, interior: { x: 105, y: 32, z: -215 }, label: 'Super Agri-Mart & Green Center', color: '#16a34a' },
  fishing: { entrance: { x: 0.0, z: 26.0 }, interior: { x: 70, y: 32, z: -215 }, label: 'Marina Pro Fishing Tackle & Aquarium', color: '#0ea5e9' },
};

function createInterior(scene, kind, config, shadows) {
  const firstMeshIndex = scene.meshes.length;
  const { x, y, z } = config.interior;
  const floor = material(scene, `interior-floor-${kind}`, '#dfc99d');
  const wall = material(scene, `interior-wall-${kind}`, '#fff0ce');
  const accent = material(scene, `interior-accent-${kind}`, config.color);
  const wood = material(scene, `interior-wood-${kind}`, '#825a3f');
  const pieces = [
    ['floor', { width: 24, height: .3, depth: 28 }, new Vector3(x, y - .15, z - 4), floor],
    ['back', { width: 24, height: 7, depth: .4 }, new Vector3(x, y + 3.5, z + 9), wall],
    ['left', { width: .4, height: 7, depth: 28 }, new Vector3(x - 12, y + 3.5, z - 4), wall],
    ['right', { width: .4, height: 7, depth: 28 }, new Vector3(x + 12, y + 3.5, z - 4), wall],
  ];
  pieces.forEach(([name, size, position, mat]) => {
    const mesh = MeshBuilder.CreateBox(`${kind}-interior-${name}`, size, scene);
    mesh.position.copyFrom(position); mesh.material = mat; mesh.receiveShadows = true;
  });
  const counter = MeshBuilder.CreateBox(`${kind}-service-counter`, { width: 10, height: 2, depth: 2.4 }, scene);
  counter.position.set(x, y + 1, z + 4.8); counter.material = wood;
  counter.metadata = { cityAction: kind }; shadows.addShadowCaster(counter);
  const service = MeshBuilder.CreateBox(`${kind}-service-sign`, { width: 6, height: 1.4, depth: .3 }, scene);
  service.position.set(x, y + 4.3, z + 8.7); service.material = accent; service.metadata = { cityAction: kind };
  const exit = MeshBuilder.CreateBox(`${kind}-exit-door`, { width: 3, height: 4.2, depth: .4 }, scene);
  exit.position.set(x - 9, y + 2.1, z - 8.8); exit.material = accent; exit.metadata = { cityAction: 'exit' };
  [-8, 8].forEach(offset => {
    const shelf = MeshBuilder.CreateBox(`${kind}-shelf`, { width: 3.2, height: 3.5, depth: 1.4 }, scene);
    shelf.position.set(x + offset, y + 1.75, z + 2); shelf.material = wood; shelf.metadata = { cityAction: kind };
  });
  scene.meshes.slice(firstMeshIndex).forEach(mesh => {
    mesh.metadata = { ...(mesh.metadata || {}), interiorVenue: kind };
    mesh.setEnabled(false);
  });
}

function belongsToPlayer(mesh, playerRoot) {
  let node = mesh.parent;
  while (node) {
    if (node === playerRoot) return true;
    node = node.parent;
  }
  return false;
}

function remoteRootFor(mesh) {
  let node = mesh.parent;
  while (node) {
    if (node.name?.startsWith('remote-player-')) return node;
    node = node.parent;
  }
  return null;
}

export class FarmWorld {
  constructor(canvas, onStatus, callbacks = {}) {
    window.__farmDebug?.mark('Creating WebGL engine');
    this.canvas = canvas;
    this.onStatus = onStatus;
    this.callbacks = callbacks;
    this.isMobile = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;
    this.graphicsQuality = 'ultra'; // 'ultra' | 'balanced' | 'eco'
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: false,
      stencil: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    this.getQualityDpr = () => {
      const nativeDpr = window.devicePixelRatio || 1;
      if (this.graphicsQuality === 'ultra') {
        return Math.min(nativeDpr, 2.0);
      } else if (this.graphicsQuality === 'balanced') {
        return Math.min(nativeDpr, 1.5);
      }
      return 1.0;
    };

    // Bật độ phân giải sắc nét Native Retina 1:1 trên màn hình High-DPI
    const dpr = this.getQualityDpr();
    this.engine.setHardwareScalingLevel(1 / dpr);
    this.remotePlayers = new Map();
    this.farmBuildings = new Map();
    this.currentVenue = VENUES[callbacks.initialLocation?.venue] ? callbacks.initialLocation.venue : null;
    this.lastVenueTransition = 0;
    this.scene = this.createScene();
    window.__farmDebug?.mark('Babylon scene created');
    if (this.currentVenue) {
      this.setVenueView(this.currentVenue);
      this.callbacks.onVenueState?.(this.currentVenue, VENUES[this.currentVenue].label);
      this.onStatus?.(`Đã trở lại ${VENUES[this.currentVenue].label}`);
    }
    this.keydown = event => {
      // Bỏ qua nếu người dùng đang nhập văn bản trong modal/input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      const tools = { Digit1: 'hand', Digit2: 'hoe', Digit3: 'seed', Digit4: 'water', Digit5: 'harvest' };
      if (tools[event.code]) this.setTool(tools[event.code]);
      if (event.code === 'KeyE' || event.code === 'Space') {
        if (event.code === 'Space') event.preventDefault();
        if (this.villageElder && this.player) {
          const elderPos = this.villageElder.position;
          const playerPos = this.player.root.position;
          const dist = Math.hypot(playerPos.x - elderPos.x, playerPos.z - elderPos.z);
          if (dist <= 4.5) {
            this.callbacks.onNpcInteract?.('village_elder');
            return;
          }
        }
        this.farming?.interactNearest(this.player.root.position);
      }
    };
    this.setGraphicsQuality = (preset = 'ultra') => {
      this.graphicsQuality = preset;
      const dpr = this.getQualityDpr();
      this.engine.setHardwareScalingLevel(1 / dpr);
      this.engine.resize();
      if (this.cinematic?.setQuality) {
        this.cinematic.setQuality(preset);
      }
      if (this.shadows) {
        this.shadows.filteringQuality = preset === 'ultra' ? ShadowGenerator.QUALITY_MEDIUM : ShadowGenerator.QUALITY_LOW;
      }
      this.callbacks.onQualityChange?.(preset);
    };

    this.resize = () => {
      if (this.engine && this.canvas) {
        const dpr = this.getQualityDpr();
        this.engine.setHardwareScalingLevel(1 / dpr);
        this.engine.resize();
      }
    };
    window.addEventListener('resize', this.resize);
    window.addEventListener('keydown', this.keydown);
    // Gọi resize ngay lập tức và sau khi DOM ổn định để xóa bỏ hoàn toàn hiện tượng vỡ hạt pixel
    this.resize();
    setTimeout(() => this.resize(), 60);
    setTimeout(() => this.resize(), 300);
    let renderFailed = false;
    this.engine.runRenderLoop(() => {
      if (renderFailed) return;
      try {
        this.scene.render();
      } catch (error) {
        renderFailed = true;
        console.error('World render failed', error);
        window.__farmDebug?.report(error, 'WORLD RENDER');
        this.callbacks.onFatalError?.(`Lỗi dựng cảnh 3D: ${error?.message || 'WebGL không phản hồi'}`);
      }
    });
    this.engine.onContextLostObservable.add(() => {
      window.__farmDebug?.report(new Error('WebGL context lost'), 'WEBGL');
      this.callbacks.onFatalError?.('WebGL đã mất kết nối đồ họa. Hãy đóng các tab nặng rồi tải lại game.');
    });
    this.scene.onAfterRenderObservable.addOnce(() => {
      this.resize();
      this.callbacks.onReady?.();
    });
    onStatus('Kênh công cộng #01 · 24 online');
  }

  createScene() {
    const scene = new Scene(this.engine);
    this.scene = scene;
    scene.clearColor = new Color4(0.48, 0.74, 0.95, 1);
    scene.ambientColor = new Color3(0.24, 0.26, 0.28);
    // Tắt sương mù để thế giới trong vắt, bầu trời trong trẻo sắc nét tuyệt đối, không còn màng trắng đục
    scene.fogEnabled = false;
    scene.skipPointerMovePicking = true;

    // Exploration view includes the horizon; farming has a separate overhead preset.
    const camera = new ArcRotateCamera('camera', RENDER_CONFIG.cameraAlpha, RENDER_CONFIG.cameraBeta, RENDER_CONFIG.cameraRadius, Vector3.Zero(), scene);
    camera.lowerRadiusLimit = RENDER_CONFIG.cameraMinRadius;
    camera.upperRadiusLimit = RENDER_CONFIG.cameraMaxRadius;
    camera.lowerBetaLimit = RENDER_CONFIG.cameraMinBeta;
    camera.upperBetaLimit = RENDER_CONFIG.cameraMaxBeta;
    camera.wheelPrecision = 42;
    camera.pinchPrecision = 28;
    camera.angularSensibilityX = 1100;
    camera.angularSensibilityY = 1100;
    camera.wheelDeltaPercentage = 0.015;
    camera.inertia = 0.5;
    camera.panningSensibility = 0;
    camera.fov = RENDER_CONFIG.cameraFov;
    camera.maxZ = RENDER_CONFIG.cameraFarClip;
    // Disable Babylon's default right-button pan binding: panning is locked
    // to the player, so that binding would consume a drag without rotating.
    camera.attachControl(this.canvas, false, false, -1);
    camera.movement?.input?.addEntry({ source: 'pointer', button: 2, interaction: 'rotate' });
    camera.inputs.removeByType('ArcRotateCameraKeyboardMoveInput');
    const pointerInput = camera.inputs.attached.pointers;
    if (pointerInput) {
      pointerInput.buttons = [0, 2];
      pointerInput.useNaturalPinchZoom = true;
      pointerInput.multiTouchPanning = false;
    }
    this.camera = camera;

    // === HỆ THỐNG CHIẾU SÁNG 4 TẦNG CHUẨN PLAY TOGETHER (HIGH-KEY RADIANCY) ===
    // 1. Tầng 1: Skylight vòm trời thiên thanh nâng sáng toàn cảnh + Ground Bounce xanh mint hắt lên gầm
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
    ambient.intensity = 0.98;
    ambient.diffuse = Color3.FromHexString('#bae6fd'); // Xanh Baby Pastel trong vắt Play Together
    ambient.groundColor = Color3.FromHexString('#a7f3d0'); // Xanh mint tươi sáng hắt lên, xóa sạch 100% mảng tối

    // 2. Tầng 2: Key Sunlight vàng kem mật ong ấm áp rạng rỡ (Góc xiên 55 độ)
    const sun = new DirectionalLight('sun', new Vector3(-0.45, -0.85, -0.32), scene);
    sun.position = new Vector3(35, 55, 25);
    sun.intensity = 1.18; // Ánh sáng rực rỡ no màu chuẩn hoạt hình
    sun.diffuse = Color3.FromHexString('#fffbeb'); // Vàng kem mật ong nhiệt đới

    // 3. Tầng 3: Rim Backlight phụ trợ tạo viền sáng khối Chibi đồ chơi Vinyl
    const rimLight = new DirectionalLight('rim-light', new Vector3(0.45, -0.65, 0.45), scene);
    rimLight.intensity = 0.32;
    rimLight.diffuse = Color3.FromHexString('#f8fafc'); // Viền sáng ngọc trai bồng bềnh
    rimLight.specular = Color3.FromHexString('#fef08a');

    // 4. Tầng 4: Shadow Generator mờ 20% trong suốt mềm mại (Triệt tiêu 100% Shadow Acne)
    const shadows = new ShadowGenerator(this.isMobile ? 1024 : 2048, sun);
    shadows.usePercentageCloserFiltering = true;
    shadows.filteringQuality = this.isMobile ? ShadowGenerator.QUALITY_LOW : ShadowGenerator.QUALITY_MEDIUM;
    shadows.bias = 0.005;
    shadows.normalBias = 0.035; // Triệt tiêu răng cưa và sọc rách trên mặt nghiêng
    shadows.darkness = 0.20; // Bóng râm trong suốt, mờ nhẹ 20% nhìn xuyên qua sàn đá và cỏ
    this.shadows = shadows;
    this.rimLight = rimLight;


    // === GIAI ĐOẠN A: PIPELINE ĐỒ HỌA ĐIỆN ẢNH AAA (ULTRA-CRISP) ===
    this.cinematic = createCinematicRenderingPipeline(scene, camera, {
      quality: this.graphicsQuality,
      lightweight: false,
    });

    this.atmosphere = createAtmosphere(scene, ambient, sun, shadows, this.cinematic);

    const ground = MeshBuilder.CreateGround('world-ground', {
      width: FARM_CONFIG.worldSize,
      height: FARM_CONFIG.worldSize,
    }, scene);
    const groundMat = new StandardMaterial('world-grass-mat', scene);
    groundMat.diffuseColor = Color3.White();
    groundMat.ambientColor = new Color3(0.35, 0.35, 0.35);
    groundMat.specularColor = Color3.Black();
    const meadowTex = createMeadowTexture(scene);
    meadowTex.anisotropicFilteringLevel = 16;
    groundMat.diffuseTexture = meadowTex;
    ground.material = groundMat;
    ground.receiveShadows = true;

    // === GIAI ĐOẠN B: THẢM CỎ MỊN MÀNG TƯƠI SÁNG (Dùng Texture Ghibli chuẩn mịn, bỏ plane cỏ 2D tránh lỗi cỏ bay) ===
    this.stylizedGrass = null;

    // === GIAI ĐOẠN D: HỆ THỐNG ĐỘNG VẬT NÔNG TRẠI CHIBI ===
    this.farmAnimals = createFarmAnimals(scene, shadows);

    this.openWorld = createOpenWorld(scene, shadows);
      this.vietnameseCountryside = createVietnameseCountryside(scene, shadows);
      Object.entries(VENUES).forEach(([kind, config]) => createInterior(scene, kind, config, shadows));
      // A seamless neighborhood chunk: farms are physical parcels beside a branch road.
      // Multi-parcel Neighborhood: Each player owns their assigned lot (Lot 1, 2, 3, or 4)
      const allTiles = [];
      this.farmGates = [];
      this.playerFarmId = this.callbacks.getPlayerFarmId?.() || null;
      WORLD_LAYOUT.farms.forEach((farm, index) => {
        const initial = this.callbacks.initialLocation || WORLD_LAYOUT.spawn;
        const lightweight = farm.id !== this.playerFarmId && Math.hypot(farm.x - initial.x, farm.z - initial.z) > 130;
        const isOwner = farm.id === this.playerFarmId;
        const ownerName = isOwner ? (this.callbacks.getPlayerName?.() || farm.owner) : farm.owner;
        const tiles = createFarmPlot(scene, {
          ...farm,
          farmId: farm.id,
          isOwner,
          owner: ownerName,
          lotNumber: index + 1,
          interactive: true,
          renderTiles: isOwner,
          lightweight,
        }, shadows);
        allTiles.push(...tiles);
        if (lightweight) return;

        const gate = createFarmGateAndSign(scene, {
          id: farm.id,
          x: farm.x,
          z: farm.z,
          lotNumber: index + 1,
          owner: ownerName,
          isOwner,
        }, shadows, () => this.callbacks.onMailbox?.(farm));
        this.farmGates.push({ ...gate, farmId: farm.id, lotNumber: index + 1, defaultOwner: farm.owner });
      });

      this.farming = new FarmingSystem(scene, allTiles, this.onStatus, this.playerFarmId, {
        playerFarmId: this.playerFarmId,
        getPlayer: () => this.player,
        onNetworkAction: data => this.callbacks.onNetworkAction?.(data),
        onHelpNeighbor: neighborFarmId => this.callbacks.onHelpNeighbor?.(neighborFarmId),
        onMailboxInteract: mailbox => {
          if (mailbox.isOwner) {
            this.onStatus?.('📬 Hòm thư nông trại của bạn · Đang có 3 lời nhắn chúc mừng từ bạn bè!');
          } else {
            this.callbacks.onMailbox?.(mailbox);
          }
        },
        getCrop: () => this.callbacks.getCrop?.() || 'carrot',
        getUnlockedPlots: () => this.callbacks.getUnlockedPlots?.() ?? 0,
        onAction: action => this.callbacks.onFarmAction?.(action) ?? true,
        openVenue: venue => this.callbacks.onVenue?.(venue),
        enterVenue: venue => this.enterVenue(venue),
        exitVenue: () => this.exitVenue(),
        onNpcInteract: npcId => this.callbacks.onNpcInteract?.(npcId),
        onLandInteract: farmId => this.callbacks.onLandInteract?.(farmId),
        isTutorialCrop: () => this.callbacks.isTutorialCrop?.() ?? false,
        getFreeSeeds: () => this.callbacks.getFreeSeeds?.() || 0,
        move: point => this.player?.moveTo(point),
        interact: (tile, action) => {
          if (!this.player) return;
          const tilePosition = tile.getAbsolutePosition?.().clone() || tile.position.clone();
          const approach = tilePosition.subtract(this.player.root.position);
          approach.y = 0;
          if (approach.lengthSquared() > 0) approach.normalize();
          const target = tilePosition.subtract(approach.scale(1.7));
          target.y = 0;
          this.onStatus?.('Đang đi tới ô đất…');
          this.player.moveTo(target, action);
        },
      });
      this.homeTier = this.callbacks.getHomeTier?.() || 1;
      this.ensurePlayerHome();
      this.animalPen = createAnimalPen(scene, WORLD_LAYOUT.animalPen, shadows);
      this.busRoute = createBusRoute(scene, shadows);
      this.villageElder = createVillageElderNPC(scene, shadows, WORLD_LAYOUT.villageElder, () => this.callbacks.onNpcInteract?.('village_elder'));
      this.villageGates = WORLD_LAYOUT.villages.map(village => ({
        villageId: village.id,
        ...createVillageGate(scene, village.gate, village.name, shadows),
      }));
      const villageRoadMat = material(scene, 'world-village-lanes', '#d8c49a');
      const trunk = MeshBuilder.CreateGround('village-world-backbone', { width: 1210, height: 6 }, scene);
      trunk.position.set(0, 0.025, -650);
      trunk.material = villageRoadMat;
      const cityLink = MeshBuilder.CreateGround('city-village-link', { width: 6, height: 600 }, scene);
      cityLink.position.set(0, 0.025, -350);
      cityLink.material = villageRoadMat;
      WORLD_LAYOUT.villages.forEach(village => {
        const linkLength = village.gate.z + 650;
        const link = MeshBuilder.CreateGround(`village-link-${village.id}`, { width: 5.5, height: linkLength }, scene);
        link.position.set(village.offsetX, 0.026, -650 + linkLength / 2);
        link.material = villageRoadMat;
        // Cross streets run between the parcel rows; main village lane is
        // the central gap between columns, never through a fenced estate.
        for (let row = 0; row <= 6; row += 1) {
          const road = MeshBuilder.CreateGround(`village-lane-${village.id}-${row}`, { width: 124, height: 5.5 }, scene);
          road.position.set(village.offsetX, 0.025, village.offsetZ + 98 + row * 28);
          road.material = villageRoadMat;
        }
        const spine = MeshBuilder.CreateGround(`village-spine-${village.id}`, { width: 5.5, height: 196 }, scene);
        spine.position.set(village.offsetX, 0.03, village.offsetZ + 182);
        spine.material = villageRoadMat;
      });
      this.objectiveMarker = createObjectiveMarker(scene);
    const initialLocation = this.callbacks.initialLocation;
    const player = createPlayer(scene, shadows, initialLocation || WORLD_LAYOUT.spawn, {
      getSpeed: () => this.callbacks.getPlayerSpeed?.() || FARM_CONFIG.playerSpeed,
      getVehicle: () => this.callbacks.getVehicle?.() || 'walk',
      getOutfitId: () => this.callbacks.getOutfitId?.() || 'starter',
      getOutfitColor: () => this.callbacks.getOutfitColor?.() || '#f8fafc',
      getCameraBasis: () => {
        const forward = camera.getForwardRay().direction.clone();
        forward.y = 0;
        if (forward.lengthSquared() < .001) forward.set(0, 0, -1);
        forward.normalize();
        const right = Vector3.Cross(Vector3.Up(), forward).normalize();
        return { forward, right };
      },
    });
    this.player = player;
    if (initialLocation) {
      player.root.position.y = initialLocation.y || 0;
      player.root.rotation.y = initialLocation.rotation || 0;
    }
    const cameraTarget = new TransformNode('camera-target', scene);
    cameraTarget.position.copyFrom(player.root.position);
    cameraTarget.position.y += RENDER_CONFIG.cameraTargetHeight;
    camera.lockedTarget = cameraTarget;
    this.cameraTarget = cameraTarget;
    this.proceduralWorld = new ProceduralWorld(scene, shadows);
    const initialRegion = this.proceduralWorld.update(player.root.position);
    if (initialRegion) queueMicrotask(() => this.callbacks.onRegionChange?.(initialRegion));

    // Hệ sinh thái Thực vật 3D Đa Dạng (Fluffy Multi-biome Foliage System)
    const foliage = createFoliageFactory(scene, shadows);

    // Hàng cây xanh mát dọc đại lộ dẫn từ trung tâm xuống thung lũng nông trại (tránh xa 100% các ngã tư)
    const farmRoadTrees = [
      { x: -11.5, z: 48, type: 'oak', scale: 1.25 }, { x: 11.5, z: 48, type: 'maple', scale: 1.25 },
      { x: -11.5, z: 62, type: 'oak', scale: 1.25 }, { x: 11.5, z: 62, type: 'maple', scale: 1.2 },
      { x: -11.5, z: 74, type: 'sakura', scale: 1.15 }, { x: 11.5, z: 74, type: 'oak', scale: 1.2 },
      { x: -11.5, z: 86, type: 'maple', scale: 1.2 }, { x: 11.5, z: 86, type: 'oak', scale: 1.2 },
    ];
    farmRoadTrees.forEach(t => {
      if (t.type === 'oak') foliage.createCloudTree(t.x, t.z, t.scale, true);
      else if (t.type === 'maple') foliage.createGoldenMaple(t.x, t.z, t.scale);
      else if (t.type === 'sakura') foliage.createSakuraTree(t.x, t.z, t.scale);
    });

    // Bụi cây cảnh cắt tỉa gọn gàng ven đường dẫn vào nông trại (đặt lùi ra ngoài vỉa hè)
    [54, 66, 78].forEach((fz) => {
      foliage.createHydrangeaBush(-9.6, fz, 1.1, '#10b981');
      foliage.createHydrangeaBush(9.6, fz, 1.1, '#10b981');
    });

    // Hiên nghỉ chân & ghế băng cho Bác Trưởng Làng tại vỉa hè phía Tây (x: -6.8, z: 76)
    const elderBench = MeshBuilder.CreateBox('elder-rest-bench', { width: 2.2, height: 0.45, depth: 0.9 }, scene);
    elderBench.position.set(-7.4, 0.23, 76.8);
    elderBench.material = material(scene, 'elder-bench-wood', '#b45309');
    const elderAwning = MeshBuilder.CreateBox('elder-rest-awning', { width: 2.6, height: 0.15, depth: 1.4 }, scene);
    elderAwning.position.set(-7.4, 2.7, 76.8);
    elderAwning.material = material(scene, 'elder-awning-fabric', '#f59e0b');

    // Phủ thêm cây đa dạng & khóm hoa dại ở các vùng phụ cận (Tuyệt đối không mọc lên bất kỳ con đường nào)
    const vegetationCount = this.isMobile ? Math.min(80, WORLD_LAYOUT.vegetation.count) : Math.min(160, WORLD_LAYOUT.vegetation.count);
    for (let index = 0; index < vegetationCount; index += 1) {
      const x = ((index * 59) % WORLD_LAYOUT.vegetation.width) + WORLD_LAYOUT.vegetation.offsetX;
      const z = ((index * 97) % WORLD_LAYOUT.vegetation.depth) + WORLD_LAYOUT.vegetation.offsetZ;

      // Kiểm tra an toàn: Không đè lên bất kỳ trục đường nào
      const nearMainRoad = Math.abs(x) < 10.5;
      const nearCrossroads = [98, 126, 154, 182, 210, 238, 266].some(rz => Math.abs(z - rz) < 7.5);
      const nearSpineRoads = Math.abs(x - 60) < 7.5 || Math.abs(x + 60) < 7.5;
      const nearEastWestBlvd = Math.abs(z) < 8.5 && Math.abs(x) < 150;
      const nearBeachRoad = Math.abs(x) < 10.5 && z > 270;

      // Tránh đè lên 24 lô nông trại
      const onFarmPlots = WORLD_LAYOUT.farms.some(farm => Math.abs(x - farm.x) < 15 && Math.abs(z - farm.z) < 12);
      // Tránh đè lên mặt hồ nước Pha Lê
      const onLake = (x > 130 && x < 200 && z > -30 && z < 35);
      // Tránh đè lên toàn bộ Siêu Quảng Trường Play Together (Bán kính 48m)
      const onPlaza = (Math.abs(x) < 48 && Math.abs(z) < 48);

      if (!nearMainRoad && !nearCrossroads && !nearSpineRoads && !nearEastWestBlvd && !nearBeachRoad && !onFarmPlots && !onLake && !onPlaza) {
        const variant = (index % 4);
        const nearPlayer = Math.hypot(x, z) < 65;
        if (variant === 0) foliage.createCloudTree(x, z, 1.0 + (index % 5) * 0.08, nearPlayer);
        else if (variant === 1) foliage.createGoldenMaple(x, z, 1.05 + (index % 4) * 0.07, nearPlayer);
        else if (variant === 2) foliage.createSakuraTree(x, z, 1.1 + (index % 3) * 0.1, nearPlayer);
        else foliage.createAlpinePine(x, z, 1.1 + (index % 4) * 0.08, nearPlayer);

        if (index % 3 === 0) {
          foliage.createFlowerPatch(x + 1.2, z, 6, 1.4);
        }
      }
    }

    WORLD_LAYOUT.destinationSigns.forEach(sign => createSign(scene, sign.label, new Vector3(sign.x, 1.6, sign.z), sign.color));

    scene.onBeforeRenderObservable.add(() => {
      const dt = this.engine.getDeltaTime() / 1000;
      player.update(dt);
      const viewForward = new Vector3(-Math.cos(camera.alpha), 0, -Math.sin(camera.alpha));
      const lookAhead = this.currentVenue || this.cameraViewMode === 'farm' ? RENDER_CONFIG.farmCameraLookAhead : RENDER_CONFIG.cameraLookAhead;
      const desiredCameraTarget = player.root.position.add(viewForward.scale(lookAhead)).add(new Vector3(0, RENDER_CONFIG.cameraTargetHeight, 0));
      const followAmount = 1 - Math.exp(-RENDER_CONFIG.cameraFollowSpeed * Math.min(dt, 0.1));
      // Teleports should not leave the camera flying across the whole map.
      if (Vector3.DistanceSquared(cameraTarget.position, desiredCameraTarget) > 100) cameraTarget.position.copyFrom(desiredCameraTarget);
      cameraTarget.position.copyFrom(Vector3.Lerp(cameraTarget.position, desiredCameraTarget, followAmount));
      if (this.cinematic && player.mesh) {
        this.cinematic.updateFocus(Vector3.Distance(camera.position, player.mesh.position));
      }
      if (!this.currentVenue) {
        if (performance.now() - (this.lastVillageDetailAt || 0) > 1000) {
          this.lastVillageDetailAt = performance.now();
          WORLD_LAYOUT.farms.forEach(farm => {
            const distance = Math.hypot(farm.x - player.root.position.x, farm.z - player.root.position.z);
            const estate = this.scene.getNodeByName(`farm-estate-${farm.id}`);
            if (distance > 180 && farm.id !== this.playerFarmId && estate && !estate.metadata?.lightweight) {
              this.farming?.removeFarmTiles(farm.id);
              estate.dispose();
              this.farmBuildings.get(farm.id)?.dispose();
              this.farmBuildings.delete(farm.id);
              this.farmGates.filter(g => g.farmId === farm.id).forEach(g => g.dispose());
              this.farmGates = this.farmGates.filter(g => g.farmId !== farm.id);
              createFarmPlot(scene, { ...farm, farmId: farm.id, lightweight: true }, shadows);
            }
            if (distance < 100 && this.scene.getNodeByName(`farm-estate-${farm.id}`)?.metadata?.lightweight) {
              const profile = this.publicFarms?.find(item => item.farmId === farm.id);
              this.ensureDetailedFarm(farm.id, farm.id === this.playerFarmId, profile?.userName || farm.owner);
            }
          });
        }
        const regionUpdate = this.proceduralWorld?.update(player.root.position);
        if (regionUpdate) this.callbacks.onRegionChange?.(regionUpdate);
      }
      this.animalPen?.update(performance.now());
      this.busRoute?.update(this.engine.getDeltaTime() / 1000);
      this.farming?.update();
      this.villageElder?.update(performance.now());
      this.objectiveMarker?.update(performance.now());
      this.updateVenueProximity();
      this.updateFarmZoneProximity();
      this.atmosphere?.update?.(dt);
      this.openWorld?.update(performance.now(), dt);
      const renderAt = performance.now() + (this.remoteClockOffset || 0) - 180;
      this.remotePlayers.forEach(remote => {
        const snapshots = remote.metadata.snapshots || [];
        let sample = remote.metadata.target;
        if (snapshots.length) sample = sampleMovement(snapshots, renderAt);
        const dx = sample.x - remote.position.x;
        const dz = sample.z - remote.position.z;
        const isMoving = (dx * dx + dz * dz) > 0.005;

        const follow = 1 - Math.pow(0.001, Math.min(dt, 0.05));
        remote.position.x += dx * follow;
        remote.position.y += (sample.y - remote.position.y) * follow;
        remote.position.z += dz * follow;
        const targetRotation = sample.rotation ?? remote.metadata.targetRotation;
        let rotationDelta = targetRotation - remote.rotation.y;
        while (rotationDelta > Math.PI) rotationDelta -= Math.PI * 2;
        while (rotationDelta < -Math.PI) rotationDelta += Math.PI * 2;
        remote.rotation.y += rotationDelta * follow;

        remote.metadata.human?.animate(dt, isMoving, 4.0);
      });
    });

    return scene;
  }

  dispose() {
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('keydown', this.keydown);
    this.player?.dispose();
    this.atmosphere?.dispose();
    this.stylizedGrass?.dispose();
    this.farmAnimals?.dispose();
    this.vietnameseCountryside?.dispose();
    this.cinematic?.pipeline?.dispose();
    this.cinematic?.ssao?.dispose();
    this.farming?.dispose();
    this.farmBuildings.forEach(buildings => buildings.dispose?.());
    this.farmBuildings.clear();
    this.villageElder?.dispose();
    this.villageGates?.forEach(gate => gate.dispose());
    this.objectiveMarker?.dispose();
    this.proceduralWorld?.dispose();
    this.scene.dispose();
    this.engine.dispose();
  }

  setClock(clock) {
    this.atmosphere?.setTime(clock);
  }

  resetCameraView() {
    if (!this.camera) return;
    this.camera.alpha = RENDER_CONFIG.cameraAlpha;
    this.camera.beta = this.currentVenue ? RENDER_CONFIG.interiorCameraBeta : this.cameraViewMode === 'farm' ? RENDER_CONFIG.farmCameraBeta : RENDER_CONFIG.cameraBeta;
    this.camera.radius = this.currentVenue ? RENDER_CONFIG.interiorCameraRadius : this.cameraViewMode === 'farm' ? RENDER_CONFIG.farmCameraRadius : RENDER_CONFIG.cameraRadius;
    this.camera.inertialAlphaOffset = 0;
    this.camera.inertialBetaOffset = 0;
    this.camera.inertialRadiusOffset = 0;
  }

  toggleCameraView() {
    this.cameraViewMode = this.cameraViewMode === 'farm' ? 'explore' : 'farm';
    this.resetCameraView();
    this.onStatus?.(this.cameraViewMode === 'farm' ? 'Góc canh tác: nhìn rõ ô đất từ trên cao.' : 'Góc khám phá: nhìn về phía chân trời.');
    return this.cameraViewMode;
  }

  setVillageName(name) {
    // Physical gates keep their own village names when the player travels.
    this.homeVillageName = name;
  }

  setPlayerVehicle(vehicleId) {
    this.player?.setVehicle(vehicleId);
  }

  setVirtualInput(x, y) {
    this.player?.setVirtualInput(x, y);
  }

  setSprinting(active) {
    this.player?.setSprinting(active);
  }

  jumpPlayer() {
    this.player?.jump();
  }

  setObjective(target) {
    if (!target) {
      this.objectiveMarker?.setVisible(false);
      return;
    }
    this.objectiveMarker?.setTarget(target.x, target.y || 0, target.z);
    this.objectiveMarker?.setVisible(true);
  }

  moveToTarget(target, callback) {
    if (!this.player || !target) return;
    this.player.moveTo(target, callback);
  }

  getDistanceTo(x, z) {
    if (!this.player) return 0;
    const pos = this.player.root.position;
    return Math.hypot(pos.x - x, pos.z - z);
  }

  setTool(tool) {
    this.farming?.setTool(tool);
    this.player?.setActiveTool(tool);
  }

  refreshFarm() { this.farming?.refreshUnlocks(); }

  syncRemotePlayers(players, serverTime = Date.now()) {
    const receivedAt = performance.now();
    const offset = serverTime - receivedAt;
    // Use server timestamps instead of uneven packet arrival times.
    this.remoteClockOffset = this.remoteClockOffset == null ? offset : this.remoteClockOffset + (offset - this.remoteClockOffset) * 0.02;
    const active = new Set(players.map(player => player.playerId));
    for (const [id, remote] of this.remotePlayers) {
      if (!active.has(id)) { remote.dispose(false, false); this.remotePlayers.delete(id); }
    }
    players.forEach((player, index) => {
      let remote = this.remotePlayers.get(player.playerId);
      if (!remote) {
        remote = createRemoteAvatar(this.scene, player.playerId, player.name, REMOTE_COLORS[index % REMOTE_COLORS.length], this.shadows);
        remote.position.set(player.x, player.y || 0, player.z);
        this.remotePlayers.set(player.playerId, remote);
      }
      remote.metadata.venue = player.venue || null;
      remote.setEnabled(this.currentVenue ? remote.metadata.venue === this.currentVenue : !remote.metadata.venue);
      remote.metadata.target.set(player.x, player.y || 0, player.z);
      remote.metadata.targetRotation = player.rotation || 0;
      if (!remote.metadata.snapshots) remote.metadata.snapshots = [];
      const frames = remote.metadata.snapshots;
      const last = frames[frames.length - 1];
      if (last && serverTime <= last.at) return;
      if (last && (last.venue !== player.venue || Math.hypot(player.x - last.x, player.z - last.z) > 8)) {
        frames.length = 0;
        remote.position.set(player.x, player.y || 0, player.z);
        remote.rotation.y = player.rotation || 0;
      }
      frames.push({ at: serverTime, x: player.x, y: player.y || 0, z: player.z, rotation: player.rotation || 0, venue: player.venue });
      if (frames.length > 20) frames.shift();
    });
    this.remotePlayerState = players;
    this.updateFarmSigns(players);
  }

  getPlayerState() {
    const position = this.player?.root.position || Vector3.Zero();
    return { x: position.x, y: position.y, z: position.z, rotation: this.player?.root.rotation.y || 0, venue: this.currentVenue };
  }

  correctPlayerPosition(authoritative) {
    // An accepted move echoes an older position; applying it would pull the
    // locally moving player backwards on every network round trip.
    if (authoritative?.accepted === true) return;
    if (!this.player || !Number.isFinite(authoritative?.x) || !Number.isFinite(authoritative?.z)) return;
    const dx = authoritative.x - this.player.root.position.x;
    const dz = authoritative.z - this.player.root.position.z;
    const error = Math.hypot(dx, dz);
    if (error <= 0.35) return;
    if (error > 4) {
      this.player.root.position.set(authoritative.x, authoritative.y || 0, authoritative.z);
    } else {
      this.player.root.position.x += dx * 0.35;
      this.player.root.position.z += dz * 0.35;
    }
    if (Number.isFinite(authoritative.rotation)) this.player.root.rotation.y = authoritative.rotation;
  }

  setPlayerOutfit(idOrColor, color) { this.player?.setOutfit(idOrColor, color); }

  travelTo(position) {
    if (!this.player || !position) return;
    if (this.currentVenue) {
      this.currentVenue = null;
      this.setVenueView(null);
      this.callbacks.onVenueState?.(null, null);
    }
    this.player.stop();
    this.player.root.position.set(position.x, 0, position.z);
    this.onStatus?.(`Đã đến ${position.label || 'điểm đến'}`);
  }

  enterVenue(kind) {
    const venue = VENUES[kind];
    if (!venue || !this.player) return;
    const target = new Vector3(venue.entrance.x, 0, venue.entrance.z);
    this.onStatus?.(`Đang đi tới cửa ${venue.label}…`);
    this.player.moveTo(target, () => this.completeVenueEntry(kind));
  }

  completeVenueEntry(kind) {
    const venue = VENUES[kind];
    if (!venue || !this.player || this.currentVenue) return;
    this.lastVenueTransition = performance.now();
    this.currentVenue = kind;
    this.player.stop();
    this.player.root.position.set(venue.interior.x, venue.interior.y, venue.interior.z - 5.5);
    this.setVenueView(kind);
    this.callbacks.onVenueState?.(kind, venue.label);
    this.onStatus?.(`Đã vào ${venue.label} · bấm quầy để giao dịch`);
  }

  updateVenueProximity() {
    if (!this.player || performance.now() - this.lastVenueTransition < 1200) return;
    const position = this.player.root.position;
    if (this.currentVenue) {
      const venue = VENUES[this.currentVenue];
      const exitDistance = Math.hypot(position.x - (venue.interior.x - 9), position.z - (venue.interior.z - 8.8));
      if (exitDistance <= 2.4) this.exitVenue();
      return;
    }
    for (const [kind, venue] of Object.entries(VENUES)) {
      if (Math.hypot(position.x - venue.entrance.x, position.z - venue.entrance.z) <= 2.4) {
        this.completeVenueEntry(kind);
        return;
      }
    }
  }

  updateFarmZoneProximity() {
    if (!this.player || this.currentVenue) return;
    const pos = this.player.root.position;
    let activeFarm = null;
    for (const farm of WORLD_LAYOUT.farms) {
      if (Math.abs(pos.x - farm.x) <= 9.0 && Math.abs(pos.z - farm.z) <= 7.5) {
        activeFarm = farm;
        break;
      }
    }
    const currentId = activeFarm ? activeFarm.id : null;
    if (this.lastActiveFarmId !== currentId) {
      this.lastActiveFarmId = currentId;
      if (activeFarm) {
        const isOwner = activeFarm.id === this.playerFarmId;
        const myName = this.callbacks.getPlayerName?.() || 'Bạn';
        const gate = this.farmGates?.find(g => g.farmId === activeFarm.id);
        const ownerName = isOwner ? myName : (gate?.defaultOwner || activeFarm.owner);
        this.callbacks.onFarmZoneChange?.({
          farmId: activeFarm.id,
          lotNumber: activeFarm.lotNumber || 1,
          isOwner,
          ownerName,
        });
      } else {
        this.callbacks.onFarmZoneChange?.(null);
      }
    }
  }

  setVenueView(kind = null) {
    this.scene.meshes.forEach(mesh => {
      if (belongsToPlayer(mesh, this.player?.root)) { mesh.setEnabled(true); return; }
      if (remoteRootFor(mesh)) { mesh.setEnabled(true); return; }
      const interiorVenue = mesh.metadata?.interiorVenue;
      mesh.setEnabled(interiorVenue ? interiorVenue === kind : !kind);
    });
    this.remotePlayers.forEach(remote => remote.setEnabled(kind ? remote.metadata.venue === kind : !remote.metadata.venue));
    if (kind) {
      this.camera.lowerRadiusLimit = 10;
      this.camera.upperRadiusLimit = 19;
      this.camera.radius = RENDER_CONFIG.interiorCameraRadius;
      this.camera.alpha = -Math.PI / 2;
      this.camera.beta = RENDER_CONFIG.interiorCameraBeta;
    } else {
      this.camera.lowerRadiusLimit = RENDER_CONFIG.cameraMinRadius;
      this.camera.upperRadiusLimit = RENDER_CONFIG.cameraMaxRadius;
      this.resetCameraView();
    }
  }

  interactContext() {
    if (!this.player) return false;
    const position = this.player.root.position;
    if (this.currentVenue) {
      const venue = VENUES[this.currentVenue];
      const distanceToCounter = Math.hypot(position.x - venue.interior.x, position.z - (venue.interior.z + 4.8));
      const distanceToExit = Math.hypot(position.x - (venue.interior.x - 9), position.z - (venue.interior.z - 8.8));
      if (distanceToCounter <= 5.5) { this.callbacks.onVenue?.(this.currentVenue); return true; }
      if (distanceToExit <= 4.5) { this.exitVenue(); return true; }
      this.onStatus?.('Đi tới quầy giao dịch hoặc cửa ra rồi bấm E');
      return true;
    }
    const nearest = Object.entries(VENUES)
      .map(([kind, venue]) => ({ kind, venue, distance: Math.hypot(position.x - venue.entrance.x, position.z - venue.entrance.z) }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (nearest?.distance <= 11) { this.enterVenue(nearest.kind); return true; }
    return false;
  }

  exitVenue() {
    const venue = VENUES[this.currentVenue];
    if (!venue || !this.player) return;
    this.lastVenueTransition = performance.now();
    this.player.stop();
    this.player.root.position.set(venue.entrance.x, 0, venue.entrance.z - 5);
    this.currentVenue = null;
    this.setVenueView(null);
    this.callbacks.onVenueState?.(null, null);
    this.onStatus?.(`Đã ra khỏi ${venue.label}`);
  }

  getDebugState() {
    const position = this.player?.root.position || Vector3.Zero();
    const chunk = chunkAt(position.x, position.z);
    return {
      fps: Math.round(this.engine.getFps()),
      x: position.x.toFixed(1),
      z: position.z.toFixed(1),
      chunk: `${chunk.x}:${chunk.z}`,
      meshes: this.scene.meshes.length,
      worldId: WORLD_LAYOUT.id,
      farmLayoutVersion: FARM_LOT_SPEC.version,
      farmLayoutSynced: this.serverFarmLayout ? this.serverFarmLayout.version === FARM_LOT_SPEC.version : null,
    };
  }

  setServerFarmLayout(layout) {
    if (!layout || !Number.isFinite(Number(layout.version))) return;
    this.serverFarmLayout = layout;
    if (Number(layout.version) !== FARM_LOT_SPEC.version || Number(layout.activePlots) !== FARM_CONFIG.activePlots) {
      this.onStatus?.('Bản đồ nông trại đang chờ phiên bản đồng bộ từ server.');
    }
  }

  applyRemoteFarmAction(data) {
    this.farming?.applyRemoteFarmAction(data);
  }

  applyRemoteFarmSync(allFarms) {
    this.farming?.applyRemoteSync(allFarms);
  }

  applyPublicFarmScope(farms, crops) {
    this.publicFarms = farms;
    farms.forEach(farm => this.ensureDetailedFarm(
      farm.farmId,
      farm.farmId === this.playerFarmId,
      farm.userName || farm.name,
      farm.homeTier || 1,
      farm.barnLevel || 1,
    ));
    this.updateFarmSigns(this.remotePlayerState || []);
    this.applyRemoteFarmSync(crops);
  }

  setPlayerFarmId(farmId, spawnPoint = null) {
    if (spawnPoint) this.callbacks.initialLocation = spawnPoint;
    this.playerFarmId = farmId;
    this.farming?.setPlayerFarmId(farmId);
    if (farmId) this.ensureDetailedFarm(farmId);
    this.ensurePlayerHome();
    this.updateFarmSigns();

    // Nếu có spawnPoint hoặc người chơi mới vào, đặt vị trí về cổng nông trại của mình
    if (spawnPoint && this.player) {
      this.player.stop();
      this.player.root.position.set(spawnPoint.x, spawnPoint.y || 0, spawnPoint.z);
    }
  }

  restorePlayerPosition(position) {
    if (!this.player || !position || ![position.x, position.y, position.z].every(Number.isFinite)) return;
    this.player.stop();
    this.player.root.position.set(position.x, position.y || 0, position.z);
    this.player.root.rotation.y = Number(position.rotation) || 0;
  }

  ensureDetailedFarm(farmId, isOwner = true, ownerName = null, homeTier = 1, barnLevel = 1) {
    const farm = WORLD_LAYOUT.farms.find(item => item.id === farmId);
    const oldRoot = this.scene.getNodeByName(`farm-estate-${farmId}`);
    if (!farm) return;
    const displayName = ownerName || (isOwner ? this.callbacks.getPlayerName?.() : farm.owner) || farm.owner;
    if (!oldRoot?.metadata?.detailed) {
      oldRoot?.dispose();
      const tiles = createFarmPlot(this.scene, {
        ...farm,
        farmId,
        isOwner,
        owner: displayName,
        lotNumber: farm.lotNumber,
        interactive: true,
        renderTiles: true,
      }, this.shadows);
      this.farming?.addTiles(tiles);
    }
    if (!this.farmGates.some(gate => gate.farmId === farmId)) {
      const gate = createFarmGateAndSign(this.scene, { ...farm, owner: displayName, isOwner }, this.shadows);
      this.farmGates.push({ ...gate, farmId, lotNumber: farm.lotNumber, defaultOwner: farm.owner });
    }
    if (isOwner || this.publicFarms?.some(item => item.farmId === farmId)) this.ensureFarmBuildings(farmId, homeTier, barnLevel, displayName);
  }

  ensurePlayerHome() {
    const farm = WORLD_LAYOUT.farms.find(item => item.id === this.playerFarmId);
    if (!farm) return;
    this.ensureFarmBuildings(this.playerFarmId, this.homeTier, 1, this.callbacks.getPlayerName?.() || 'Nông dân');
  }

  ensureFarmBuildings(farmId, homeTier = 1, barnLevel = 1, ownerName = 'Nông dân') {
    const farm = WORLD_LAYOUT.farms.find(item => item.id === farmId);
    if (!farm) return;
    const existing = this.farmBuildings.get(farmId);
    if (existing && existing.homeTier === homeTier && existing.barnLevel === barnLevel && existing.ownerName === ownerName) return;
    this.farmBuildings.get(farmId)?.dispose?.();
    const homePosition = {
      x: farm.x + FARM_LOT_SPEC.anchors.home.x,
      y: 0,
      z: farm.z + FARM_LOT_SPEC.anchors.home.z,
    };
    const home = homeTier >= 2
      ? createFarmhouse(this.scene, this.shadows, homePosition)
      : createStarterFarmhouse(this.scene, this.shadows, homePosition);
    home.root.metadata = { ...(home.root.metadata || {}), farmId, ownerName, type: 'farm-home' };

    const corralAnchor = FARM_LOT_SPEC.anchors.corral || FARM_LOT_SPEC.anchors.barn;
    const corral = createOpenAirCorral(this.scene, this.shadows, {
      x: farm.x + corralAnchor.x,
      y: 0,
      z: farm.z + corralAnchor.z,
    }, {
      farmId,
      ownerName,
      tier: barnLevel,
      animalType: (farm.lotNumber || 1) % 2 === 0 ? 'alpaca' : 'cow',
      width: corralAnchor.width,
      depth: corralAnchor.depth,
    });

    this.farmBuildings.set(farmId, {
      home,
      barn: corral,
      homeTier,
      barnLevel,
      ownerName,
      dispose() { home.dispose?.(); corral.dispose?.(); },
    });
  }

  setPlayerHomeTier(tier) {
    const next = Math.max(1, Math.min(2, Number(tier) || 1));
    if (next === this.homeTier && this.farmBuildings.has(this.playerFarmId)) return;
    this.homeTier = next;
    this.ensurePlayerHome();
  }

  updateFarmSigns(remotePlayers = []) {
    const myName = this.callbacks.getPlayerName?.() || 'Nông dân';
    this.farmGates?.forEach(gate => {
      const isOwner = gate.farmId === this.playerFarmId;
      const remoteOwner = remotePlayers.find(p => p.farmId === gate.farmId);
      const registeredFarm = this.publicFarms?.find(farm => farm.farmId === gate.farmId);
      const listing = this.landListings?.find(l => l.farmId === gate.farmId);
      const displayName = isOwner ? myName : (remoteOwner?.name || registeredFarm?.userName || registeredFarm?.name || listing?.userName || (listing ? listing.available ? `Đang bán · ${listing.price} xu` : 'Đang giao dịch' : gate.defaultOwner));
      gate.updateSign(displayName, isOwner);

      // Cập nhật cả Floating 3D Banner trên cao
      const estateRoot = this.scene.getNodeByName(`farm-estate-${gate.farmId}`);
      estateRoot?.metadata?.updateBanner?.(displayName, isOwner);
    });
  }

  setLandListings(lots) {
    this.landListings = lots;
    this.updateFarmSigns(this.remotePlayerState || []);
  }

    showEmote(playerId, emoteChar) {
    let targetRoot = null;
    const myId = this.callbacks.getPlayerId?.();
    const isMe = (playerId === myId || !playerId);
    if (isMe) {
      targetRoot = this.player?.root;
      if (emoteChar === '👋') {
        this.player?.playAction('wave');
      } else if (['🎉', '💖', '✨', '🏆'].includes(emoteChar)) {
        this.player?.playAction('harvest');
      }
    } else {
      targetRoot = this.remotePlayers.get(playerId);
      if (targetRoot?.metadata?.human) {
        if (emoteChar === '👋') {
          targetRoot.metadata.human.playAction('wave');
        } else if (['🎉', '💖', '✨', '🏆'].includes(emoteChar)) {
          targetRoot.metadata.human.playAction('harvest');
        }
      }
    }
    if (!targetRoot) return;

    // Hủy bong bóng cũ nếu có
    const existingBubble = targetRoot.getChildren().find(c => c.name === 'emote-bubble');
    if (existingBubble) existingBubble.dispose();

    const bubblePlane = MeshBuilder.CreatePlane('emote-bubble', { width: 1.4, height: 1.4 }, this.scene);
    bubblePlane.position.set(0, 2.5, 0);
    bubblePlane.billboardMode = Mesh.BILLBOARDMODE_ALL;
    bubblePlane.parent = targetRoot;

    const texture = new DynamicTexture(`bubble-tex-${Date.now()}`, { width: 256, height: 256 }, this.scene, true);
    texture.hasAlpha = true;
    const ctx = texture.getContext();
    ctx.clearRect(0, 0, 256, 256);

    // Bo tròn bong bóng chat
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(16, 16, 224, 190, 48);
    ctx.fill();

    // Viền pastel dễ thương
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Mũi nhọn đuôi bong bóng chỉ xuống đầu
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.moveTo(112, 206);
    ctx.lineTo(128, 238);
    ctx.lineTo(144, 206);
    ctx.closePath();
    ctx.fill();

    // Vẽ Emoji lớn ở giữa
    ctx.font = '96px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoteChar, 128, 110);
    texture.update();

    const bubbleMat = new StandardMaterial(`bubble-mat-${Date.now()}`, this.scene);
    bubbleMat.diffuseTexture = texture;
    bubbleMat.opacityTexture = texture;
    bubbleMat.specularColor = Color3.Black();
    bubbleMat.disableLighting = true;
    bubblePlane.material = bubbleMat;

    // Animation pop up & bay bổng
    let frame = 0;
    const obs = this.scene.onBeforeRenderObservable.add(() => {
      frame += 1;
      if (frame < 12) {
        const s = 0.4 + (frame / 12) * 0.6;
        bubblePlane.scaling.set(s, s, s);
      }
      bubblePlane.position.y = 2.5 + Math.sin(frame * 0.08) * 0.08;

      if (frame > 150) { // ~ 2.5s
        const fade = Math.max(0, 1 - (frame - 150) / 30);
        bubbleMat.alpha = fade;
        if (frame >= 180) {
          this.scene.onBeforeRenderObservable.remove(obs);
          bubblePlane.dispose();
          texture.dispose();
          bubbleMat.dispose();
        }
      }
    });
  }
}
