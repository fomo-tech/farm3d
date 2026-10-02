import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
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
import { createFoliageFactory } from './createFoliage.js';
import { createCinematicRenderingPipeline } from '../rendering/CinematicRenderingPipeline.js';
import { createStylizedGrass } from './createStylizedGrass.js';
import { createFarmAnimals } from './createFarmAnimals.js';
import { createPlayTogetherShowcase } from './createPlayTogetherProps.js';

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
  const marker = MeshBuilder.CreateCylinder(`gate-${label}`, { height: 3.2, diameter: 1.1, tessellation: 8 }, scene);
  marker.position = position;
  marker.material = material(scene, `gate-${label}-material`, color);
  marker.metadata = { destination: label };
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
  casino: { entrance: { x: -26, z: -152 }, interior: { x: 210, y: 32, z: -215 }, label: 'Sòng bài May Mắn', color: '#702f3b' },
  fashion: { entrance: { x: 26, z: -129 }, interior: { x: 175, y: 32, z: -215 }, label: 'Thời trang', color: '#e879a2' },
  vehicles: { entrance: { x: 26, z: -152 }, interior: { x: 140, y: 32, z: -215 }, label: 'Đại lý xe', color: '#4f8fa8' },
  supplies: { entrance: { x: -26, z: -129 }, interior: { x: 105, y: 32, z: -215 }, label: 'Vật tư nông nghiệp', color: '#6d9b55' },
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
    this.canvas = canvas;
    this.onStatus = onStatus;
    this.callbacks = callbacks;
    this.isMobile = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;
    this.engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, antialias: !this.isMobile });
    // Bật độ phân giải sắc nét Native Retina trên màn hình High-DPI
    const dpr = Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.25 : 2);
    this.engine.setHardwareScalingLevel(1 / dpr);
    this.remotePlayers = new Map();
    this.currentVenue = VENUES[callbacks.initialLocation?.venue] ? callbacks.initialLocation.venue : null;
    this.lastVenueTransition = 0;
    this.scene = this.createScene();
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
    this.resize = () => {
      if (this.engine && this.canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.25 : 2);
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
        this.callbacks.onFatalError?.(`Lỗi dựng cảnh 3D: ${error?.message || 'WebGL không phản hồi'}`);
      }
    });
    this.engine.onContextLostObservable.add(() => {
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
    scene.clearColor = new Color4(0.48, 0.74, 0.95, 1);
    scene.ambientColor = new Color3(0.24, 0.26, 0.28);
    // Tắt sương mù để thế giới trong vắt, bầu trời trong trẻo sắc nét tuyệt đối, không còn màng trắng đục
    scene.fogEnabled = false;
    scene.skipPointerMovePicking = true;

    // Camera third-person kiểu Play Together: thấp, rộng và ưu tiên cảnh phía trước.
    const camera = new ArcRotateCamera('camera', RENDER_CONFIG.cameraAlpha, RENDER_CONFIG.cameraBeta, RENDER_CONFIG.cameraRadius, Vector3.Zero(), scene);
    camera.lowerRadiusLimit = RENDER_CONFIG.cameraMinRadius;
    camera.upperRadiusLimit = RENDER_CONFIG.cameraMaxRadius;
    camera.lowerBetaLimit = 0.82;
    camera.upperBetaLimit = 1.18;
    camera.wheelPrecision = 42;
    camera.pinchPrecision = 28;
    camera.angularSensibilityX = 1100;
    camera.angularSensibilityY = 1100;
    camera.inertia = 0.82;
    camera.panningSensibility = 0;
    camera.fov = 0.9;
    camera.attachControl(this.canvas, true);
    this.camera = camera;

    // === HỆ THỐNG CHIẾU SÁNG 3 TẦNG CHUẨN ZELDA & GHIBLI ===
    // 1. Skylight (Vòm trời thiên thanh nâng sáng bóng râm) + Ground Bounce (Phản xạ đất cỏ ấm hắt lên gầm cây)
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
    ambient.intensity = 0.88;
    ambient.diffuse = Color3.FromHexString('#8ecbf8'); // Xanh thiên thanh trong trẻo
    ambient.groundColor = Color3.FromHexString('#6ca842'); // Xanh mạ non ấm áp hắt lên, xóa tan mảng đen kịt

    // 2. Key Light: Mặt trời vàng mật ong dịu êm, góc xiên 50 độ chuẩn điện ảnh
    const sun = new DirectionalLight('sun', new Vector3(-0.45, -0.85, -0.32), scene);
    sun.position = new Vector3(30, 50, 25);
    sun.intensity = 1.12; // Ánh sáng êm ái, sắc nét mà không cháy lóa
    sun.diffuse = Color3.FromHexString('#fff2d6'); // Vàng mật ong dịu ngọt

    // 3. Shadow Generator mềm mại chuẩn hoạt hình Play Together (Triệt tiêu 100% Shadow Acne sọc đen)
    const shadows = new ShadowGenerator(this.isMobile ? 1024 : 2048, sun);
    shadows.usePercentageCloserFiltering = true;
    shadows.filteringQuality = this.isMobile ? ShadowGenerator.QUALITY_LOW : ShadowGenerator.QUALITY_MEDIUM;
    shadows.bias = 0.005;
    shadows.normalBias = 0.035; // Triệt tiêu triệt để hiện tượng vệt sọc đen răng cưa trên mặt phẳng nghiêng
    shadows.darkness = 0.24; // Bóng râm pastel dịu êm, trong suốt không bị đen kịt
    this.shadows = shadows;

    // === GIAI ĐOẠN A: PIPELINE ĐỒ HỌA ĐIỆN ẢNH AAA (ULTRA-CRISP) ===
    // Post-process nhiều pass dễ làm WebGL mobile mất shader program và chỉ còn màn hình xanh.
    this.cinematic = this.isMobile
      ? { pipeline: null, ssao: null, updateFocus() {}, setCinematicPreset() {} }
      : createCinematicRenderingPipeline(scene, camera, { lightweight: true });

    this.atmosphere = createAtmosphere(scene, ambient, sun, shadows, this.cinematic);

    const ground = MeshBuilder.CreateGround('world-ground', {
      width: FARM_CONFIG.worldSize,
      height: FARM_CONFIG.worldSize,
    }, scene);
    const groundMat = new StandardMaterial('world-grass-mat', scene);
    groundMat.diffuseColor = Color3.White();
    groundMat.ambientColor = new Color3(0.35, 0.35, 0.35);
    groundMat.specularColor = Color3.Black();
    groundMat.diffuseTexture = createMeadowTexture(scene);
    ground.material = groundMat;
    ground.receiveShadows = true;

    // === GIAI ĐOẠN B: THẢM CỎ MỊN MÀNG TƯƠI SÁNG (Dùng Texture Ghibli chuẩn mịn, bỏ plane cỏ 2D tránh lỗi cỏ bay) ===
    this.stylizedGrass = null;

    // === GIAI ĐOẠN D: HỆ THỐNG ĐỘNG VẬT NÔNG TRẠI CHIBI ===
    this.farmAnimals = createFarmAnimals(scene, shadows);

    this.openWorld = createOpenWorld(scene, shadows);
      Object.entries(VENUES).forEach(([kind, config]) => createInterior(scene, kind, config, shadows));
      // A seamless neighborhood chunk: farms are physical parcels beside a branch road.
      // Multi-parcel Neighborhood: Each player owns their assigned lot (Lot 1, 2, 3, or 4)
      const allTiles = [];
      this.farmGates = [];
      this.playerFarmId = this.callbacks.getPlayerFarmId?.() || 'farm_000001';
      WORLD_LAYOUT.farms.forEach((farm, index) => {
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
        }, shadows);
        allTiles.push(...tiles);

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
        getUnlockedPlots: () => this.callbacks.getUnlockedPlots?.() || 12,
        onAction: action => this.callbacks.onFarmAction?.(action) ?? true,
        openVenue: venue => this.callbacks.onVenue?.(venue),
        enterVenue: venue => this.enterVenue(venue),
        exitVenue: () => this.exitVenue(),
        onNpcInteract: npcId => this.callbacks.onNpcInteract?.(npcId),
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
      // Giai đoạn 1: Trưng bày mẫu Props & Cây Kẹo Bông phong cách Play Together cạnh khuôn viên nhà người chơi
      this.playTogetherShowcase = createPlayTogetherShowcase(scene, { x: -62, y: 0, z: 106 }, shadows);
      this.animalPen = createAnimalPen(scene, WORLD_LAYOUT.animalPen, shadows);
      this.busRoute = createBusRoute(scene, shadows);
      this.villageElder = createVillageElderNPC(scene, shadows, WORLD_LAYOUT.villageElder, () => this.callbacks.onNpcInteract?.('village_elder'));
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
    cameraTarget.position.y = 1.55;
    camera.lockedTarget = cameraTarget;
    this.cameraTarget = cameraTarget;
    this.proceduralWorld = new ProceduralWorld(scene, shadows);
    const initialRegion = this.proceduralWorld.update(player.root.position);
    if (initialRegion) queueMicrotask(() => this.callbacks.onRegionChange?.(initialRegion));

    // Hệ sinh thái Thực vật 3D Đa Dạng (Fluffy Multi-biome Foliage System)
    const foliage = createFoliageFactory(scene, shadows);

    // Hàng cây dọc đại lộ dẫn từ trung tâm xuống thung lũng nông trại kết hợp Cây Kẹo Bông Play Together
    const farmRoadTrees = [
      { x: -10, z: 48, type: 'marshmallow_mint', scale: 1.25 }, { x: 10, z: 48, type: 'marshmallow_sakura', scale: 1.25 },
      { x: -10, z: 62, type: 'oak', scale: 1.25 }, { x: 10, z: 62, type: 'maple', scale: 1.2 },
      { x: -10, z: 74, type: 'sakura', scale: 1.15 }, { x: 10, z: 74, type: 'marshmallow_honey', scale: 1.2 },
      { x: -10, z: 86, type: 'marshmallow_lavender', scale: 1.2 }, { x: 10, z: 86, type: 'oak', scale: 1.2 },
      { x: -10, z: 98, type: 'oak', scale: 1.25 }, { x: 10, z: 98, type: 'sakura', scale: 1.15 },
    ];
    farmRoadTrees.forEach(t => {
      if (t.type === 'marshmallow_mint') foliage.createMarshmallowTree(t.x, t.z, t.scale, 'mint');
      else if (t.type === 'marshmallow_sakura') foliage.createMarshmallowTree(t.x, t.z, t.scale, 'sakura');
      else if (t.type === 'marshmallow_honey') foliage.createMarshmallowTree(t.x, t.z, t.scale, 'honey');
      else if (t.type === 'marshmallow_lavender') foliage.createMarshmallowTree(t.x, t.z, t.scale, 'lavender');
      else if (t.type === 'oak') foliage.createCloudTree(t.x, t.z, t.scale, true);
      else if (t.type === 'maple') foliage.createGoldenMaple(t.x, t.z, t.scale);
      else if (t.type === 'sakura') foliage.createSakuraTree(t.x, t.z, t.scale);
    });

    // Hoa cẩm tú cầu ven đường dẫn vào nông trại
    [60, 72, 84, 96].forEach((fz, i) => {
      foliage.createHydrangeaBush(-7, fz, 1.1, i % 2 === 0 ? 'pink' : 'blue');
      foliage.createHydrangeaBush(7, fz, 1.1, i % 2 === 0 ? 'purple' : 'pink');
    });

    // Bụi hoa kẹo rực rỡ và đá kẹo sỏi Play Together ven đại lộ nông trại
    foliage.createCandyFlowerBush(-8, 52, 1.2);
    foliage.createCandyFlowerBush(8, 52, 1.2);
    foliage.createCandyFlowerBush(-8, 76, 1.15);
    foliage.createCandyFlowerBush(8, 76, 1.15);
    foliage.createCandyPebbleRock(-9, 64, 1.1, '#7dd3fc');
    foliage.createCandyPebbleRock(9, 64, 1.1, '#f472b6');
    foliage.createCandyPebbleRock(-8, 88, 1.0, '#a78bfa');
    foliage.createCandyPebbleRock(8, 88, 1.0, '#fde047');

    // Phủ thêm cây đa dạng & khóm hoa dại ở các vùng phụ cận thế giới mở (Tối ưu hóa 60 FPS mượt mà)
    const vegetationCount = this.isMobile ? Math.min(80, WORLD_LAYOUT.vegetation.count) : Math.min(160, WORLD_LAYOUT.vegetation.count);
    for (let index = 0; index < vegetationCount; index += 1) {
      const x = ((index * 59) % WORLD_LAYOUT.vegetation.width) + WORLD_LAYOUT.vegetation.offsetX;
      const z = ((index * 97) % WORLD_LAYOUT.vegetation.depth) + WORLD_LAYOUT.vegetation.offsetZ;
      const awayFromMainRoad = Math.abs(x) > 10;
      const awayFromCrossRoad = Math.abs(z - 3) > 10;
      // Tránh đè lên toàn bộ 24 lô nông trại.
      const onFarmPlots = WORLD_LAYOUT.farms.some(farm => Math.abs(x - farm.x) < 15 && Math.abs(z - farm.z) < 12);
      // Tránh đè lên mặt hồ nước Pha Lê
      const onLake = (x > 130 && x < 200 && z > -30 && z < 35);
      // Tránh đè lên toàn bộ Siêu Quảng Trường Play Together (Bán kính 48m)
      const onPlaza = (Math.abs(x) < 48 && Math.abs(z) < 48);

      if (awayFromMainRoad && awayFromCrossRoad && !onFarmPlots && !onLake && !onPlaza) {
        const variant = (index % 4);
        const nearPlayer = Math.hypot(x, z) < 65; // Chỉ đổ bóng cho cây gần để duy trì 60 FPS
        if (variant === 0) foliage.createCloudTree(x, z, 1.0 + (index % 5) * 0.08, nearPlayer);
        else if (variant === 1) foliage.createGoldenMaple(x, z, 1.05 + (index % 4) * 0.07, nearPlayer);
        else if (variant === 2) foliage.createSakuraTree(x, z, 1.1 + (index % 3) * 0.1, nearPlayer);
        else foliage.createAlpinePine(x, z, 1.1 + (index % 4) * 0.08, nearPlayer);

        // Khóm hoa dại mọc dưới tán cây tự nhiên
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
      const desiredCameraTarget = player.root.position.add(viewForward.scale(2.4)).add(new Vector3(0, 1.55, 0));
      const followAmount = 1 - Math.pow(0.001, Math.min(dt, 0.05));
      cameraTarget.position.copyFrom(Vector3.Lerp(cameraTarget.position, desiredCameraTarget, followAmount));
      if (this.cinematic && player.mesh) {
        this.cinematic.updateFocus(Vector3.Distance(camera.position, player.mesh.position));
      }
      if (!this.currentVenue) {
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
      this.remotePlayers.forEach(remote => {
        const dx = remote.metadata.target.x - remote.position.x;
        const dz = remote.metadata.target.z - remote.position.z;
        const isMoving = (dx * dx + dz * dz) > 0.005;

        remote.position.x += dx * 0.18;
        remote.position.y += (remote.metadata.target.y - remote.position.y) * 0.18;
        remote.position.z += dz * 0.18;
        remote.rotation.y += (remote.metadata.targetRotation - remote.rotation.y) * 0.18;

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
    this.cinematic?.pipeline?.dispose();
    this.cinematic?.ssao?.dispose();
    this.farming?.dispose();
    this.villageElder?.dispose();
    this.objectiveMarker?.dispose();
    this.proceduralWorld?.dispose();
    this.scene.dispose();
    this.engine.dispose();
  }

  setClock(clock) {
    this.atmosphere?.setTime(clock);
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

  syncRemotePlayers(players) {
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
    });
    this.remotePlayerState = players;
    this.updateFarmSigns(players);
  }

  getPlayerState() {
    const position = this.player?.root.position || Vector3.Zero();
    return { x: position.x, y: position.y, z: position.z, rotation: this.player?.root.rotation.y || 0, venue: this.currentVenue };
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
      this.camera.radius = 13;
      this.camera.alpha = -Math.PI / 2;
      this.camera.beta = 1.0;
    } else {
      this.camera.lowerRadiusLimit = RENDER_CONFIG.cameraMinRadius;
      this.camera.upperRadiusLimit = RENDER_CONFIG.cameraMaxRadius;
      this.camera.radius = RENDER_CONFIG.cameraRadius;
      this.camera.alpha = RENDER_CONFIG.cameraAlpha;
      this.camera.beta = RENDER_CONFIG.cameraBeta;
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
    };
  }

  applyRemoteFarmAction(data) {
    this.farming?.applyRemoteFarmAction(data);
  }

  applyRemoteFarmSync(allFarms) {
    this.farming?.applyRemoteSync(allFarms);
  }

  applyPublicFarmScope(farms, crops) {
    this.publicFarms = farms;
    farms.forEach(farm => this.ensureDetailedFarm(farm.farmId, farm.farmId === this.playerFarmId, farm.name));
    this.updateFarmSigns(this.remotePlayerState || []);
    this.applyRemoteFarmSync(crops);
  }

  setPlayerFarmId(farmId, spawnPoint = null) {
    if (!farmId) return;
    this.playerFarmId = farmId;
    this.farming?.setPlayerFarmId(farmId);
    this.ensureDetailedFarm(farmId);
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

  ensureDetailedFarm(farmId, isOwner = true, ownerName = null) {
    const farm = WORLD_LAYOUT.farms.find(item => item.id === farmId);
    const oldRoot = this.scene.getNodeByName(`farm-estate-${farmId}`);
    if (!farm || oldRoot?.metadata?.detailed) return;
    oldRoot?.dispose();
    const tiles = createFarmPlot(this.scene, {
      ...farm,
      farmId,
      isOwner,
      owner: ownerName || (isOwner ? this.callbacks.getPlayerName?.() : farm.owner) || farm.owner,
      lotNumber: farm.lotNumber,
      interactive: true,
      renderTiles: true,
    }, this.shadows);
    this.farming?.addTiles(tiles);
  }

  ensurePlayerHome() {
    const farm = WORLD_LAYOUT.farms.find(item => item.id === this.playerFarmId);
    if (!farm) return;
    this.playerHome?.dispose?.();
    const position = { x: farm.x - 14, y: 0, z: farm.z };
    this.playerHome = this.homeTier >= 2
      ? createFarmhouse(this.scene, this.shadows, position)
      : createStarterFarmhouse(this.scene, this.shadows, position);
  }

  setPlayerHomeTier(tier) {
    const next = Math.max(1, Math.min(2, Number(tier) || 1));
    if (next === this.homeTier && this.playerHome) return;
    this.homeTier = next;
    this.ensurePlayerHome();
  }

  updateFarmSigns(remotePlayers = []) {
    const myName = this.callbacks.getPlayerName?.() || 'Nông dân';
    this.farmGates?.forEach(gate => {
      const isOwner = gate.farmId === this.playerFarmId;
      const remoteOwner = remotePlayers.find(p => p.farmId === gate.farmId);
      const registeredFarm = this.publicFarms?.find(farm => farm.farmId === gate.farmId);
      const displayName = isOwner ? myName : (remoteOwner?.name || registeredFarm?.name || gate.defaultOwner);
      gate.updateSign(displayName, isOwner);

      // Cập nhật cả Floating 3D Banner trên cao
      const estateRoot = this.scene.getNodeByName(`farm-estate-${gate.farmId}`);
      estateRoot?.metadata?.updateBanner?.(displayName, isOwner);
    });
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
