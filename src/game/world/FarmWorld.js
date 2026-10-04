import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { sampleMovement } from '../network/sampleMovement.js';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { Engine } from '@babylonjs/core/Engines/engine.js';
import { installWorldRenderIndex } from '../rendering/WorldRenderIndex.js';
import { installNearbyShadows } from '../rendering/NearbyShadowCasters.js';
import { GRAPHICS_PRESETS, readGraphicsQuality, saveGraphicsQuality, calculateRenderDpr, RenderResolutionController, AutoGraphicsController } from '../rendering/GraphicsSettings.js';
import { getModelWorkStats } from '../rendering/ModelAssetManager.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import '@babylonjs/core/Culling/ray.js';
import { FARM_CONFIG } from '../config.js';
import { VENUE_LAYOUT } from '../../../shared/venueLayout.js';
import { createFarmPlot } from '../farming/createFarmPlot.js';
import { FrameBudgetScheduler } from '../engine/FrameBudgetScheduler.js';
import { FarmChunk } from '../farming/FarmChunk.js';
import { FarmStreamingGrid } from './FarmStreamingGrid.js';
import { getTextureWorkerStats } from './TextureWorkerPool.js';
import { createPlayer } from '../player/createPlayer.js';
import { createPlayerNameplate } from '../player/createPlayerNameplate.js';
import { createOpenWorldSteps, createOpenWorld } from './createOpenWorld.js';
import { createAnimalPen } from '../livestock/createAnimalPen.js';
import { createBusRoute } from '../transport/createBusRoute.js';
import { FarmingSystem } from '../farming/FarmingSystem.js';
import { createVillageElderNPC } from '../npc/VillageElderNPC.js';
import { createObjectiveMarker } from './ObjectiveMarker.js';
import { createMeadowTexture, createHoneyPathTexture, createHorizonSkirtTexture } from './createStylizedTextures.js';
import { WORLD_PALETTE } from './worldDesignSystem.js';
import { createCountryRoadSteps, createCountryRoad, createCulDeSac, createZebraCrosswalk } from './createModernRoadSystem.js';
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
import { createVietnameseCountrysideSteps, createVietnameseCountryside } from './createVietnameseCountryside.js';
import { FARM_LOT_SPEC } from '../../../shared/farmLayout.js';
import { isPointOnRoadCorridor } from './RoadSafetyZone.js';
import { isPointInsideAnyFarmLot } from './FarmSafetyZone.js';
import { WorldCollisionSystem } from '../physics/WorldCollisionSystem.js';
import { createScenicLandscapesSteps, createScenicLandscapes } from './createScenicLandscapes.js';
import { createVillageAmenitiesAndGreenbeltsSteps, createVillageAmenitiesAndGreenbelts } from './createVillageAmenities.js';
import { getTerrainHeight, MEADOW_KNOLLS } from './TerrainHeightSystem.js';
import { createInterVillagePlainsSteps, createInterVillagePlains } from './createInterVillagePlains.js';
import { createRoadsideMeadowsSteps, createRoadsideMeadows } from './createRoadsideMeadows.js';
import { createVillageWoodlandsSteps } from './createVillageWoodlands.js';
import { createLivingMeadowSteps } from './createLivingMeadow.js';
import { FoliageInstancingEngine } from './FoliageInstancingEngine.js';
import { getWorldChunkStreamer } from './WorldChunkStreamer.js';
import { FogStreamingController } from './FogStreamingController.js';
import { createGrandWindingRiverSteps, createGrandWindingRiver, RIVER_CONTROL_POINTS } from './nature/GrandWindingRiver.js';

// Reusable static vector pool to eliminate GC allocations in 60 FPS render loop
const _TMP_VIEW_FORWARD = new Vector3();
const _TMP_DESIRED_TARGET = new Vector3();

function isNearGrandRiver(x, z, margin = 12) {
  if (!RIVER_CONTROL_POINTS || RIVER_CONTROL_POINTS.length < 2) return false;
  for (let i = 0; i < RIVER_CONTROL_POINTS.length - 1; i++) {
    const p1 = RIVER_CONTROL_POINTS[i];
    const p2 = RIVER_CONTROL_POINTS[i + 1];
    const minX = Math.min(p1.x, p2.x) - margin - 15;
    const maxX = Math.max(p1.x, p2.x) + margin + 15;
    const minZ = Math.min(p1.z, p2.z) - margin - 15;
    const maxZ = Math.max(p1.z, p2.z) + margin + 15;
    if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const lenSq = dx * dx + dz * dz;
      const t = Math.max(0, Math.min(1, ((x - p1.x) * dx + (z - p1.z) * dz) / lenSq));
      const projX = p1.x + t * dx;
      const projZ = p1.z + t * dz;
      const halfW = (p1.w + (p2.w - p1.w) * t) * 0.5 + margin;
      if (Math.hypot(x - projX, z - projZ) < halfW) return true;
    }
  }
  return false;
}

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
  const board = MeshBuilder.CreateBox(`sign-board-${label}`, { width: 3.2, height: 0.86, depth: 0.12 }, scene);
  board.position.set(0, 2.45, 0);
  board.material = material(scene, `gate-${label}-material`, color);
  board.parent = root;
  board.metadata = { destination: label };

  const textTexture = new DynamicTexture(`dest-sign-text-${label}`, { width: 1024, height: 320 }, scene, true);
  const ctx = textTexture.getContext();
  ctx.fillStyle = '#fff7e8';
  ctx.fillRect(0, 0, 1024, 320);
  ctx.strokeStyle = '#715849';
  ctx.lineWidth = 12;
  ctx.strokeRect(12, 12, 1000, 296);
  ctx.fillStyle = '#302a25';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const words = label.split(' ');
  const lines = [];
  let line = '';
  words.forEach(word => {
    if ((line + ' ' + word).trim().length > 19 && line) {
      lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  });
  if (line) lines.push(line);
  ctx.font = lines.length > 1 ? '800 94px "Segoe UI", Arial, sans-serif' : '800 112px "Segoe UI", Arial, sans-serif';
  lines.slice(0, 2).forEach((text, index) => ctx.fillText(text, 512, lines.length > 1 ? 105 + index * 112 : 164, 900));
  textTexture.update();

  const textMaterial = new StandardMaterial(`dest-sign-text-mat-${label}`, scene);
  textMaterial.diffuseTexture = textTexture;
  textMaterial.emissiveColor = Color3.FromHexString('#ffffff').scale(0.08);
  textMaterial.specularColor = Color3.Black();
  [0.067, -0.067].forEach((z, index) => {
    const face = MeshBuilder.CreatePlane(`dest-sign-face-${label}-${index}`, { width: 3.02, height: 0.68 }, scene);
    face.position.set(0, 2.45, z);
    face.rotation.y = index ? Math.PI : 0;
    face.material = textMaterial;
    face.parent = root;
  });
}

function createRemoteAvatar(scene, id, name, color, shadows) {
  const root = new TransformNode(`remote-player-${id}`, scene);
  const human = buildHumanMesh(scene, `remote-${id}`, {
    outfitColor: color,
    skinColor: '#fcd5b5',
    hairColor: '#76503b',
    pantsColor: '#2b4162',
    bootsColor: '#5c381e',
    hatRibbonColor: color,
    shadows,
  });
  human.root.parent = root;
  const nameplate = createPlayerNameplate(scene, root, id, name);
  root.metadata = { playerId: id, playerName: name, nameplate, target: new Vector3(), targetRotation: 0, human };
  return root;
}


const REMOTE_COLORS = ['#5f91c8', '#e87994', '#8a72b8', '#58a66a', '#d98248', '#3f9d98'];
const VENUES = VENUE_LAYOUT;

function* createInteriorSteps(scene, kind, config, shadows) {
  const firstMeshIndex = scene.meshes.length;
  yield;
  const { x, y, z } = config.interior;
  yield;
  const floor = material(scene, `interior-floor-${kind}`, '#dfc99d');
  yield;
  const wall = material(scene, `interior-wall-${kind}`, '#fff0ce');
  yield;
  const accent = material(scene, `interior-accent-${kind}`, config.color);
  yield;
  const wood = material(scene, `interior-wood-${kind}`, '#825a3f');
  yield;
  const pieces = [
    ['floor', { width: 24, height: .3, depth: 28 }, new Vector3(x, y - .15, z - 4), floor],
    ['back', { width: 24, height: 7, depth: .4 }, new Vector3(x, y + 3.5, z + 9), wall],
    ['left', { width: .4, height: 7, depth: 28 }, new Vector3(x - 12, y + 3.5, z - 4), wall],
    ['right', { width: .4, height: 7, depth: 28 }, new Vector3(x + 12, y + 3.5, z - 4), wall],
  ];
  yield;
  pieces.forEach(([name, size, position, mat]) => {
    const mesh = MeshBuilder.CreateBox(`${kind}-interior-${name}`, size, scene);
    mesh.position.copyFrom(position); mesh.material = mat; mesh.receiveShadows = true;
  });
  yield;
  const counter = MeshBuilder.CreateBox(`${kind}-service-counter`, { width: 10, height: 2, depth: 2.4 }, scene);
  yield;
  counter.position.set(x, y + 1, z + 4.8);
  yield; counter.material = wood;
  yield;
  counter.metadata = { cityAction: kind };
  yield; shadows.addShadowCaster(counter);
  yield;
  const service = MeshBuilder.CreateBox(`${kind}-service-sign`, { width: 6, height: 1.4, depth: .3 }, scene);
  yield;
  service.position.set(x, y + 4.3, z + 8.7);
  yield; service.material = accent;
  yield; service.metadata = { cityAction: kind };
  yield;
  const shopkeepers = { supplies: 'CHỊ MẦM · VẬT TƯ', fashion: 'CÔ SOPHIE · THỜI TRANG', vehicles: 'ANH BẢO · ĐẠI LÝ XE', fishing: 'LÃO NGƯ · ĐỒ CÂU', casino: 'CHÚ LỘC · HỘI QUÁN' };
  yield;
  const nameTexture = new DynamicTexture(`${kind}-keeper-name`, { width: 1024, height: 224 }, scene, true);
  yield;
  const nameContext = nameTexture.getContext();
  yield;
  nameContext.fillStyle = '#fff9e8';
  yield; nameContext.fillRect(0, 0, 1024, 224);
  yield;
  nameContext.fillStyle = '#4b3650';
  yield; nameContext.textAlign = 'center';
  yield; nameContext.textBaseline = 'middle';
  yield;
  nameContext.font = 'bold 66px Segoe UI, Arial, sans-serif';
  yield; nameContext.fillText(shopkeepers[kind], 512, 112, 950);
  yield;
  nameTexture.update();
  yield;
  const nameMaterial = new StandardMaterial(`${kind}-keeper-name-material`, scene);
  yield;
  nameMaterial.diffuseColor = Color3.Black();
  yield; nameMaterial.emissiveTexture = nameTexture;
  yield; nameMaterial.disableLighting = true;
  yield;
  const namePlane = MeshBuilder.CreatePlane(`${kind}-keeper-name`, { width: 5.8, height: 1.26 }, scene);
  yield;
  namePlane.position.set(x, y + 4.3, z + 8.47);
  yield; namePlane.rotation.y = Math.PI;
  yield;
  namePlane.material = nameMaterial;
  yield; namePlane.metadata = { cityAction: kind };
  yield;
  const exit = MeshBuilder.CreateBox(`${kind}-exit-door`, { width: 3, height: 4.2, depth: .4 }, scene);
  yield;
  exit.position.set(x - 9, y + 2.1, z - 8.8);
  yield; exit.material = accent;
  yield; exit.metadata = { cityAction: 'exit' };
  yield;
  [-8, 8].forEach(offset => {
    const shelf = MeshBuilder.CreateBox(`${kind}-shelf`, { width: 3.2, height: 3.5, depth: 1.4 }, scene);
    shelf.position.set(x + offset, y + 1.75, z + 2); shelf.material = wood; shelf.metadata = { cityAction: kind };
  });
  yield;
  const skin = material(scene, `interior-skin-${kind}`, '#f3c9a7');
  yield;
  const hair = material(scene, `interior-hair-${kind}`, '#543c35');
  yield;
  const shirt = material(scene, `interior-shirt-${kind}`, config.color);
  yield;
  const cream = material(scene, `interior-cream-${kind}`, '#fff9ed');
  yield;
  const ink = material(scene, `interior-ink-${kind}`, '#353138');
  yield;
  function prop(name, shape, size, px, py, pz, mat, action = null) {
    const mesh = MeshBuilder[shape](`${kind}-${name}`, size, scene);
    mesh.position.set(x + px, y + py, z + pz);
    mesh.material = mat;
    if (action) mesh.metadata = { cityAction: action };
    return mesh;
  }
  yield;
  // A recognizable shopkeeper, kept behind the service counter and inside the room.
  prop('keeper-body', 'CreateCylinder', { height: 1.4, diameterTop: .65, diameterBottom: .85, tessellation: 12 }, 0, 1.7, 6.6, shirt, kind);
  yield;
  prop('keeper-head', 'CreateSphere', { diameter: .85, segments: 12 }, 0, 2.75, 6.6, skin, kind);
  yield;
  prop('keeper-hair', 'CreateSphere', { diameter: .88, segments: 12 }, 0, 3.02, 6.64, hair, kind);
  yield;
  [-.17, .17].forEach((offset, index) => {
    prop(`keeper-eye-${index}`, 'CreateSphere', { diameter: .085, segments: 8 }, offset, 2.78, 6.15, ink, kind);
  });
  yield;
  const display = {
    supplies: { mat: material(scene, 'shop-prop-seed', '#89bd6b'), name: 'seed-bag' },
    fashion: { mat: material(scene, 'shop-prop-fabric', '#eb8ba9'), name: 'folded-fabric' },
    vehicles: { mat: material(scene, 'shop-prop-wheel', '#547b91'), name: 'helmet' },
    fishing: { mat: material(scene, 'shop-prop-tackle', '#5baab5'), name: 'tackle-box' },
    casino: { mat: material(scene, 'shop-prop-dice', '#f0d37d'), name: 'dice-table' },
  }[kind];
  yield;
  [-8, 8].forEach((side, index) => {
    for (let row = 0; row < 2; row += 1) {
      prop(`${display.name}-${index}-${row}`, 'CreateBox', { width: 1.25, height: .65, depth: .9 }, side, .9 + row * 1.4, 1.5, display.mat, kind);
    }
  });
  yield;
  if (kind === 'casino') {
    [-4, 4].forEach((side, index) => {
      prop(`game-table-${index}`, 'CreateCylinder', { diameter: 3, height: .34, tessellation: 16 }, side, .85, -.5, display.mat, kind);
      prop(`game-table-leg-${index}`, 'CreateCylinder', { diameter: .35, height: .8, tessellation: 12 }, side, .4, -.5, wood);
      [-.35, .35].forEach((offset, die) => prop(`game-die-${index}-${die}`, 'CreateBox', { size: .45 }, side + offset, 1.27, -.5, cream, kind));
    });
  } else {
    [-4.5, 4.5].forEach((side, index) => {
      prop(`display-island-${index}`, 'CreateBox', { width: 2.4, height: .72, depth: 1.3 }, side, .5, -.2, cream, kind);
      prop(`display-item-${index}`, 'CreateBox', { width: 1.25, height: .6, depth: .75 }, side, 1.18, -.2, display.mat, kind);
    });
    if (kind === 'fashion') {
      [-4.5, 4.5].forEach((side, index) => {
        prop(`mannequin-neck-${index}`, 'CreateCylinder', { diameter: .18, height: .55 }, side, 1.7, -.2, skin);
        prop(`mannequin-head-${index}`, 'CreateSphere', { diameter: .52 }, side, 2.2, -.2, cream);
        prop(`mannequin-dress-${index}`, 'CreateCylinder', { diameterTop: .6, diameterBottom: 1.25, height: 1.1, tessellation: 12 }, side, .95, -.2, display.mat, kind);
      });
    } else if (kind === 'vehicles') {
      [-4.5, 4.5].forEach((side, index) => {
        [-.65, .65].forEach((offset, wheel) => {
          const tire = prop(`wheel-${index}-${wheel}`, 'CreateCylinder', { diameter: .65, height: .24, tessellation: 16 }, side + offset, 1.18, -.68, ink, kind);
          tire.rotation.z = Math.PI / 2;
        });
      });
    } else if (kind === 'fishing') {
      [-4.5, 4.5].forEach((side, index) => {
        [-.3, .3].forEach((offset, rod) => {
          const pole = prop(`rod-${index}-${rod}`, 'CreateCylinder', { diameter: .07, height: 2.6, tessellation: 8 }, side + offset, 2.2, -.2, wood, kind);
          pole.rotation.z = .22;
        });
      });
    } else if (kind === 'supplies') {
      [-4.5, 4.5].forEach((side, index) => {
        [-.4, .4].forEach((offset, sack) => prop(`seed-sack-${index}-${sack}`, 'CreateCylinder', { diameterTop: .45, diameterBottom: .8, height: .85, tessellation: 12 }, side + offset, 1.25, -.2, display.mat, kind));
      });
    }
  }
  yield;
  const venueMeshes = scene.meshes.slice(firstMeshIndex);
  yield;
  venueMeshes.forEach(mesh => {
    mesh.metadata = { ...(mesh.metadata || {}), interiorVenue: kind };
    mesh.setEnabled(false);
  });
  yield;
  return venueMeshes;
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
    Texture.DEFAULT_ANISOTROPIC_FILTERING_LEVEL = 16;
    this.canvas = canvas;
    this.onStatus = onStatus;
    this.callbacks = callbacks;
    this.isMobile = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;
    this.graphicsQuality = readGraphicsQuality();
    this.resolutionController = new RenderResolutionController();
    this.autoGraphics = new AutoGraphicsController(this.isMobile);
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: false,
      stencil: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    this.getQualityDpr = () => {
      return calculateRenderDpr({ quality: this.graphicsQuality,
        nativeDpr: window.devicePixelRatio || 1,
        width: this.canvas.clientWidth || window.innerWidth,
        height: this.canvas.clientHeight || window.innerHeight,
        mobile: this.isMobile, scale: this.graphicsQuality === 'auto' ? this.autoGraphics.scale : this.resolutionController.scale });
    };

    // Bật độ phân giải sắc nét Native Retina 1:1 trên màn hình High-DPI
    const dpr = this.getQualityDpr();
    this.engine.setHardwareScalingLevel(1 / dpr);
    this.remotePlayers = new Map();
    this.farmBuildings = new Map();
    this.farmEstateRoots = new Map();
    this.farmChunks = new Map();
    this.farmStreamingGrid = new FarmStreamingGrid(WORLD_LAYOUT.farms, 64, { mobile: this.isMobile });
    this.venueMeshesMap = new Map();
    this.currentVenueMeshes = null;
    this.scheduler = new FrameBudgetScheduler(2.5);
    this.collisionSystem = new WorldCollisionSystem();
    this.cinematicTourActive = false;
    this.toggleCinematicTour = () => {
      this.cinematicTourActive = !this.cinematicTourActive;
      return this.cinematicTourActive;
    };
    this.currentVenue = VENUES[callbacks.initialLocation?.venue] ? callbacks.initialLocation.venue : null;
    this.lastVenueTransition = 0;
    const construction = this.createSceneSteps();
    construction.next();
    this.worldBuilt = this.scheduleConstruction(construction, 'initial world construction', 100);
    if (new URLSearchParams(window.location.search).has('debug')) window.__farmDebugScene = this.scene;
    window.__farmDebug?.mark('Babylon scene created');
    this.keydown = event => {
      if (!this.player || !this.bootReady) return;
      // Bỏ qua nếu người dùng đang nhập văn bản trong modal/input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      const tools = { Digit1: 'hand', Digit2: 'hoe', Digit3: 'seed', Digit4: 'water', Digit5: 'harvest' };
      if (tools[event.code] && (tools[event.code] === 'hand' || this.canUseFarmTools())) {
        this.setTool(tools[event.code]);
        this.callbacks.onToolChange?.(tools[event.code]);
      }
      if (event.code === 'KeyF') {
        const nearby = this.busRoute?.getNearbyBoardableBus(this.player?.root?.position);
        if (nearby) {
          this.busRoute.boardBus(nearby.bus.id, this.player.root);
          this.onStatus?.(`Đã lên ${nearby.bus.routeName}!`);
          return;
        }
      }
      if (event.code === 'KeyV' && this.busRoute?.isPlayerRiding()) {
        const active = this.toggleCinematicTour();
        this.onStatus?.(active ? 'Chế độ Điện Ảnh 360° Đang Bật' : 'Đã tắt Chế độ Điện Ảnh');
        return;
      }
      if (event.code === 'KeyE' || event.code === 'Space') {
        if (event.code === 'KeyE' && this.busRoute?.isPlayerRiding()) {
          this.busRoute.alightBus(this.player.root);
          this.onStatus?.('Đã xuống xe buýt');
          return;
        }
        if (event.code === 'Space') event.preventDefault();
        if (event.code === 'KeyE' && this.currentVenue && this.interactContext()) return;
        if (event.code === 'KeyE' && this.openNearbyLand()) return;
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
      if (!GRAPHICS_PRESETS[preset]) return;
      this.graphicsQuality = preset;
      saveGraphicsQuality(preset);
      this.resolutionController = new RenderResolutionController();
      this.autoGraphics = new AutoGraphicsController(this.isMobile);
      const dpr = this.getQualityDpr();
      this.engine.setHardwareScalingLevel(1 / dpr);
      this.engine.resize();
      if (this.cinematic?.setQuality) {
        this.cinematic.setQuality(preset === 'auto' ? this.autoGraphics.effects : preset, preset === 'auto');
      }
      if (this.shadows) {
        this.shadows.filteringQuality = preset === 'ultra' ? ShadowGenerator.QUALITY_HIGH : ShadowGenerator.QUALITY_MEDIUM;
        const targetMapSize = preset === 'ultra' && !this.isMobile ? 2048 : (this.isMobile || preset === 'eco' ? 512 : 1024);
        if (this.shadows.mapSize !== targetMapSize) {
          this.shadows.mapSize = targetMapSize;
        }
      }
      this.callbacks.onQualityChange?.(preset);
    };

    this.boardBus = (busId) => {
      if (this.busRoute && this.player) {
        const res = this.busRoute.boardBus(busId, this.player.root);
        if (res) this.onStatus?.('Đã lên xe buýt');
        return res;
      }
      return false;
    };

    this.alightBus = () => {
      if (this.busRoute && this.player) {
        const res = this.busRoute.alightBus(this.player.root);
        if (res) this.onStatus?.('Đã xuống xe buýt');
        return res;
      }
      return false;
    };

    this.playStartCinematic = () => {
      this.isGameStarted = true;
      if (!this.camera || !this.scene) return;
      const targetRadius = this.cameraViewMode === 'farm' ? (RENDER_CONFIG.farmCameraRadius || 26) : (RENDER_CONFIG.cameraRadius || 22);
      const startRadius = this.camera.radius || (targetRadius + 8);
      const startTime = performance.now();
      const duration = 1000;
      const animObserver = this.scene.onBeforeRenderObservable.add(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        this.camera.radius = startRadius + (targetRadius - startRadius) * ease;
        if (progress >= 1) {
          this.scene.onBeforeRenderObservable.remove(animObserver);
        }
      });
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
    this.engine.renderEvenInBackground = false;
    this.engine.runRenderLoop(() => {
      if (renderFailed) return;
      try {
        if (!this.scene.activeCamera) throw new Error('Cảnh 3D không có camera hoạt động.');
        window.__farmDebug?.stage('scheduler.update');
        this.scheduler.update();
        window.__farmDebug?.stage('scene.render');
        this.scene.render();
        if (this.bootReady && this.graphicsQuality === 'auto' && !document.hidden && this.autoGraphics.sample(this.engine.getDeltaTime())) {
          this.cinematic?.setQuality(this.autoGraphics.effects, true);
          if (this.shadows) {
            const targetSize = this.autoGraphics.level > 0 ? 512 : (this.isMobile ? 512 : 1024);
            if (this.shadows.mapSize !== targetSize) this.shadows.mapSize = targetSize;
            if (this.shadows.filteringQuality !== ShadowGenerator.QUALITY_MEDIUM) this.shadows.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
          }
        }
        if (this.bootReady && !['auto', 'ultra'].includes(this.graphicsQuality) && !document.hidden && this.resolutionController.sample(this.engine.getDeltaTime())) this.resize();
        if (performance.now() - (this.lastDiagnosticsAt || 0) > 1000) {
          this.lastDiagnosticsAt = performance.now();
          window.__farmDebug?.snapshot({ ...this.getDebugState(), movement: this.player?.getDiagnostics?.() });
        }
        window.__farmDebug?.frame();
      } catch (error) {
        renderFailed = true;
        window.__farmDebug?.stopFrames();
        this.renderFailure = error;
        this.rejectPendingRender?.(error);
        this.rejectPendingRender = null;
        console.error('World render failed', error);
        window.__farmDebug?.report(error, 'WORLD RENDER');
        this.callbacks.onFatalError?.(`Lỗi dựng cảnh 3D: ${error?.message || 'WebGL không phản hồi'}`);
      }
    });
    this.engine.onContextLostObservable.add(() => {
      window.__farmRuntimeAudit?.record('context-lost');
      window.__farmDebug?.stopFrames();
      window.__farmDebug?.report(new Error('WebGL context lost'), 'WEBGL');
      this.callbacks.onFatalError?.('WebGL đã mất kết nối đồ họa. Hãy đóng các tab nặng rồi tải lại game.');
    });
    this.engine.onContextRestoredObservable.add(() => {
      window.__farmRuntimeAudit?.record('context-restored');
      this.callbacks.onFatalError?.('Đồ họa đã phục hồi. Hãy tải lại game để đồng bộ cảnh; vị trí được server lưu giữ.');
    });
    this.startWorldBootPipeline();
    window.__farmRuntimeAudit?.record('world-created');
    onStatus('Kênh công cộng #01 · 24 online');
  }

  async startWorldBootPipeline() {
    try {
      const report = (phase, percentage, message, current) => this.callbacks.onBootProgress?.({ phase, percentage, message, current, total: 4 });
      const waitForRenderedFrame = () => new Promise((resolve, reject) => {
        if (this.renderFailure) { reject(this.renderFailure); return; }
        const observer = this.scene.onAfterRenderObservable.addOnce(() => {
          clearTimeout(timer);
          this.rejectPendingRender = null;
          resolve();
        });
        this.rejectPendingRender = error => {
          clearTimeout(timer);
          this.scene.onAfterRenderObservable.remove(observer);
          reject(error);
        };
        const timer = setTimeout(() => {
          this.scene.onAfterRenderObservable.remove(observer);
          this.rejectPendingRender = null;
          reject(new Error('WebGL không vẽ được khung hình đầu tiên sau 45 giây.'));
        }, 45000);
      });
      report('terrain', 18, 'Đang dựng khu vực xuất phát…', 0);
      await this.worldBuilt;
      if (this.scene.isDisposed) return;
      if (this.currentVenue) {
        await this.ensureVenueBuilt(this.currentVenue);
        this.setVenueView(this.currentVenue);
        this.callbacks.onVenueState?.(this.currentVenue, VENUES[this.currentVenue].label);
      }
      this.renderIndex = installWorldRenderIndex(this.scene);
      await waitForRenderedFrame();
      if (this.scene.isDisposed) return;
      report('landscape', 45, 'Đã vẽ nhân vật · đang bổ sung cảnh quan…', 1);
      await new Promise(resolve => setTimeout(resolve, 0));
      await this.scheduleConstruction(createScenicLandscapesSteps(this.scene, this.foliage, this.shadows, this.foliageInstancing), 'scenic landscape');
      window.__farmDebug?.mark(`Scenic landscapes: ${this.scene.meshes.length} meshes`);
      report('villages', 66, 'Đang hoàn thiện đường phố và làng mạc…', 2);
      await new Promise(resolve => setTimeout(resolve, 0));
      await this.scheduleConstruction(createVillageAmenitiesAndGreenbeltsSteps(this.scene, this.foliage, this.shadows, this.foliageInstancing), 'village amenities');
      window.__farmDebug?.mark(`Village amenities: ${this.scene.meshes.length} meshes`);
      report('distance', 84, 'Đang hoàn thiện cảnh xa…', 3);
      await new Promise(resolve => setTimeout(resolve, 0));
      await this.scheduleConstruction(createInterVillagePlainsSteps(this.scene, this.foliage, this.shadows), 'distant scenery');
      this.roadsideMeadows = await this.scheduleConstruction(createRoadsideMeadowsSteps(this.scene, this.foliageInstancing), 'roadside meadow');
      await this.scheduleConstruction(createVillageWoodlandsSteps(this.foliageInstancing), 'village woodland');
      // Đã loại bỏ hoàn toàn các tài nguyên rải vụn trên đất trống (cỏ/hoa diamond spikes), chỉ giữ cây cối và bụi rậm
      this.livingMeadow = null;
      window.__farmDebug?.mark(`Distance scenery: ${this.scene.meshes.length} meshes`);
      report('first-frame', 95, 'Sắp vào game · model chi tiết sẽ hiện dần…', 4);
      await new Promise(resolve => requestAnimationFrame(resolve));
      if (this.scene.isDisposed) return;
      this.resize();
      window.__farmDebug?.stage('build world spatial render index');
      await this.renderIndex.ready;
      this.getNearbyShadowCount = installNearbyShadows(this.shadows, () => this.player?.root.position, {
        radius: this.isMobile ? 28 : 36,
        maxCasters: this.isMobile ? 16 : (this.graphicsQuality === 'ultra' ? 32 : 24),
      });
      this.callbacks.onBootProgress?.({
        phase: 'ready',
        percentage: 100,
        message: 'Thế giới đã sẵn sàng!',
        current: 4,
        total: 4,
      });

      // Kích hoạt onReady lên App.jsx
      this.bootReady = true;
      this.callbacks.onReady?.();
    } catch (err) {
      console.error('[FarmWorld] Lỗi trong pipeline khởi động thế giới:', err);
      if (!this.renderFailure && !this.scene.isDisposed) {
        this.callbacks.onFatalError?.(`Lỗi khởi động thế giới: ${err?.message || err}`);
      }
    }
  }

  scheduleConstruction(iterator, label, priority = 10) {
    return new Promise((resolve, reject) => {
      this.scheduler.enqueue({
        next: () => {
          if (this.scene.isDisposed) { iterator.return?.(); resolve(null); return { done: true }; }
          try { const result = iterator.next(); if (result.done) resolve(result.value); return result; }
          catch (error) { reject(error); throw error; }
        },
        return: () => { iterator.return?.(); resolve(null); },
      }, priority, label);
    });
  }

  ensureVenueBuilt(kind) {
    if (this.venueMeshesMap.has(kind)) return Promise.resolve();
    this.venueBuilds ||= new Map();
    if (!this.venueBuilds.has(kind)) {
      const work = this.scheduleConstruction(createInteriorSteps(this.scene, kind, VENUES[kind], this.shadows), `interior ${kind}`, 110)
        .then(meshes => { if (meshes) this.venueMeshesMap.set(kind, meshes); })
        .finally(() => this.venueBuilds.delete(kind));
      this.venueBuilds.set(kind, work);
    }
    return this.venueBuilds.get(kind);
  }

  createScene() {
    if (this.scene) return this.scene;
    const steps = this.createSceneSteps();
    let res = steps.next();
    while (!res.done) {
      res = steps.next();
    }
    return this.scene || res.value;
  }

  *createSceneSteps() {
    const scene = new Scene(this.engine);
    // Several setup helpers (player home/corral) run before createScene()
    // returns. Publish the scene immediately so those helpers never receive
    // undefined through this.scene during a synchronized owned-farm boot.
    this.scene = scene;
    // Tăng tốc độ khởi tạo: Khóa cờ kiểm tra material dirty khi tạo hàng ngàn mesh ban đầu
    scene.clearColor = new Color4(0.85, 0.93, 0.99, 1);
    scene.ambientColor = new Color3(0.24, 0.26, 0.28);
    // Keep nearby villages crystal clear; use distance fog to blend gently into far horizon
    scene.fogEnabled = true;
    scene.fogMode = Scene.FOGMODE_LINEAR;
    scene.fogStart = 120;
    scene.fogEnd = 420;
    scene.fogColor = Color3.FromHexString('#dbeafe');
    scene.skipPointerMovePicking = true;

    // Kích hoạt Anisotropic Filtering 16x toàn diện cho 100% Textures tải về hoặc tạo mới
    scene.onNewTextureAddedObservable.add(tex => {
      tex.anisotropicFilteringLevel = 16;
    });

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
    camera.minZ = 0.8;
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
    yield;

    // === HỆ THỐNG CHIẾU SÁNG 4 TẦNG CHUẨN HIGH-KEY COZY FARMY ===
    // 1. Tầng 1: Skylight vòm trời thiên thanh nâng sáng toàn cảnh + Ground Bounce xanh mint hắt lên gầm
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
    yield;
    ambient.intensity = 0.64;
    yield;
    ambient.diffuse = Color3.FromHexString('#e6f4ff');
    yield;
    ambient.groundColor = Color3.FromHexString('#b1bea5');
    yield;
    this.ambient = ambient;
    yield;

    // 2. Tầng 2: Key Sunlight vàng kem mật ong ấm áp rạng rỡ (Góc xiên 55 độ)
    const sun = new DirectionalLight('sun', new Vector3(-0.45, -0.85, -0.32), scene);
    yield;
    sun.position = new Vector3(35, 55, 25);
    yield;
    sun.intensity = 0.88;
    yield;
    sun.diffuse = Color3.FromHexString('#fff0db');
    yield;
    // Frustum bóng đổ cố định 56m bám theo người chơi: 36.5 texels/m với 2048px map (chuẩn sắc nét Cozy Farmy)
    sun.shadowFrustumSize = 56;
    yield;
    sun.shadowMinZ = 1;
    yield;
    sun.shadowMaxZ = 130;
    yield;
    this.sun = sun;
    yield;

    // 3. Tầng 3: Rim Backlight phụ trợ tạo viền sáng khối Chibi đồ chơi Vinyl
    const rimLight = new DirectionalLight('rim-light', new Vector3(0.45, -0.65, 0.45), scene);
    yield;
    rimLight.intensity = 0.08;
    yield;
    rimLight.diffuse = Color3.FromHexString('#f8fafc');
    yield; // Viền sáng ngọc trai bồng bềnh
    rimLight.specular = Color3.FromHexString('#fef08a');
    yield;

    // 4. Tầng 4: Shadow Generator mờ 30% mềm mại (PCF High/Medium)
    const shadowMapResolution = this.graphicsQuality === 'ultra' && !this.isMobile
      ? 2048
      : (this.isMobile || this.graphicsQuality === 'eco' ? 512 : 1024);
    yield;
    const shadows = new ShadowGenerator(shadowMapResolution, sun);
    yield;
    shadows.usePercentageCloserFiltering = true;
    yield;
    shadows.filteringQuality = this.graphicsQuality === 'ultra' ? ShadowGenerator.QUALITY_HIGH : ShadowGenerator.QUALITY_MEDIUM;
    yield;
    shadows.bias = 0.0005;
    yield;
    shadows.normalBias = 0.02;
    yield; // Triệt tiêu răng cưa và sọc rách trên mặt nghiêng
    shadows.autoCalcDepthBounds = false;
    yield; // Frustum đã cố định theo shadowFrustumSize
    shadows.darkness = 0.30;
    yield; // Khớp preset ban ngày tươi sáng
    this.shadows = shadows;
    // Limit shadow draw calls during construction too, not only after boot.
    this.getNearbyShadowCount = installNearbyShadows(shadows, () => this.player?.root.position, {
      radius: this.isMobile ? 28 : 36,
      maxCasters: this.isMobile ? 16 : (this.graphicsQuality === 'ultra' ? 32 : 24),
    });
    yield;
    this.rimLight = rimLight;
    yield;


    // === GIAI ĐOẠN A: PIPELINE ĐỒ HỌA ĐIỆN ẢNH AAA (ULTRA-CRISP) ===
    this.cinematic = createCinematicRenderingPipeline(scene, camera, {
      quality: this.graphicsQuality === 'auto' ? this.autoGraphics.effects : this.graphicsQuality,
      lightweight: this.isMobile,
      stableSamples: this.graphicsQuality === 'auto',
    });
    yield;

    this.atmosphere = createAtmosphere(scene, ambient, sun, shadows, this.cinematic);
    yield;
    this.chunkStreamer = getWorldChunkStreamer(scene);
    yield;
    this.fogStreaming = new FogStreamingController(scene, camera, {
      mobile: this.isMobile,
      getStreamingStats: () => this.chunkStreamer?.getStats?.(),
      getFps: () => this.engine.getFps(),
      presets: {
        performance: { start: this.isMobile ? 120 : 180, end: this.isMobile ? 320 : 480, clip: this.isMobile ? 550 : 900 },
        streaming: { start: this.isMobile ? 140 : 220, end: this.isMobile ? 380 : 560, clip: this.isMobile ? 650 : 1100 },
        recovering: { start: this.isMobile ? 160 : 250, end: this.isMobile ? 420 : 620, clip: this.isMobile ? 750 : 1250 },
        clear: { start: this.isMobile ? 180 : 280, end: this.isMobile ? 480 : 720, clip: this.isMobile ? 850 : 1500 },
      },
    });
    yield;

    const ground = MeshBuilder.CreateGround('world-ground', {
      width: FARM_CONFIG.worldSize,
      height: FARM_CONFIG.worldSize,
    }, scene);
    yield;
    const groundMat = new StandardMaterial('world-grass-mat', scene);
    yield;
    groundMat.diffuseColor = Color3.White();
    yield;
    groundMat.specularColor = new Color3(0.012, 0.012, 0.012);
    yield;
    groundMat.specularPower = 16;
    yield;
    const meadowTex = createMeadowTexture(scene);
    yield;
    meadowTex.anisotropicFilteringLevel = 16;
    yield;
    const worldRepeat = Math.round(FARM_CONFIG.worldSize / 12);
    yield; // ~350 lần lặp (12m/lần lặp chuẩn Cozy Farmy)
    meadowTex.uScale = worldRepeat;
    yield;
    meadowTex.vScale = worldRepeat;
    yield;
    meadowTex.wrapU = Texture.WRAP_ADDRESSMODE;
    yield;
    meadowTex.wrapV = Texture.WRAP_ADDRESSMODE;
    yield;
    groundMat.diffuseTexture = meadowTex;
    yield;
    ground.material = groundMat;
    yield;
    ground.receiveShadows = true;
    yield;
    const initialLocation = this.callbacks.initialLocation;
    yield;
    const player = createPlayer(scene, shadows, initialLocation || WORLD_LAYOUT.spawn, {
      getSpeed: () => this.callbacks.getPlayerSpeed?.() || FARM_CONFIG.playerSpeed,
      getVehicle: () => this.callbacks.getVehicle?.() || 'walk',
      getOutfitId: () => this.callbacks.getOutfitId?.() || 'starter',
      getOutfitColor: () => this.callbacks.getOutfitColor?.() || '#f8fafc',
      isRidingBus: () => this.busRoute?.isPlayerRiding() || false,
      getTerrainHeight: (x, z) => (this.currentVenue ? VENUES[this.currentVenue].interior.y : getTerrainHeight(x, z)),
      resolveMovement: (cx, cz, dx, dz) => this.collisionSystem.resolveMovement(cx, cz, dx, dz, this.currentVenue),
      getCameraBasis: () => {
        const forward = camera.getForwardRay().direction.clone();
        forward.y = 0;
        if (forward.lengthSquared() < .001) forward.set(0, 0, -1);
        forward.normalize();
        const right = Vector3.Cross(Vector3.Up(), forward).normalize();
        return { forward, right };
      },
    });
    yield;
    this.player = player;
    yield;
    this.localNameplate = createPlayerNameplate(scene, player.root, 'local', this.callbacks.getPlayerName?.());
    yield;
    if (initialLocation) {
      player.root.position.y = initialLocation.y ?? (this.currentVenue ? 0 : getTerrainHeight(player.root.position.x, player.root.position.z));
      player.root.rotation.y = initialLocation.rotation || 0;
    } else {
      player.root.position.y = getTerrainHeight(player.root.position.x, player.root.position.z);
    }
    yield;
    const cameraTarget = new TransformNode('camera-target', scene);
    yield;
    cameraTarget.position.copyFrom(player.root.position);
    yield;
    cameraTarget.position.y += RENDER_CONFIG.cameraTargetHeight;
    yield;
    camera.lockedTarget = cameraTarget;
    yield;
    this.cameraTarget = cameraTarget;
    yield;
    this.proceduralWorld = new ProceduralWorld(scene, shadows);
    yield;
    const initialRegion = this.proceduralWorld.update(player.root.position);
    yield;
    if (initialRegion) queueMicrotask(() => this.callbacks.onRegionChange?.(initialRegion));
    yield;

    // Hệ sinh thái Thực vật 3D Đa Dạng (Fluffy Multi-biome Foliage System)
    // Hàng cây xanh mát dọc đại lộ dẫn từ trung tâm xuống thung lũng nông trại (tránh xa 100% các ngã tư & QL 86)

    // === VÀNH ĐAI CHÂN TRỜI VÔ TẬN (SEAMLESS INFINITE HORIZON SKIRT) ===
    // Đĩa khổng lồ đường kính 6800m chuyển sắc êm ái từ cỏ xanh hòa tan vào sương mù chân trời
    const skirtDisc = MeshBuilder.CreateDisc('world-ground-skirt', {
      radius: 3400,
      tessellation: 64,
    }, scene);
    yield;
    skirtDisc.rotation.x = Math.PI / 2;
    yield;
    skirtDisc.position.set(0, -0.4, 0);
    yield;
    const skirtMat = new StandardMaterial('world-ground-skirt-mat', scene);
    yield;
    skirtMat.diffuseTexture = createHorizonSkirtTexture(scene);
    yield;
    skirtMat.specularColor = Color3.Black();
    yield;
    skirtMat.fogEnabled = true;
    yield;
    skirtMat.disableLighting = true;
    yield;
    skirtDisc.material = skirtMat;
    yield;
    skirtDisc.receiveShadows = false;
    yield;

    // === GIAI ĐOẠN B: THẢM CỎ MỊN MÀNG TƯƠI SÁNG (Dùng Texture Ghibli chuẩn mịn, bỏ plane cỏ 2D tránh lỗi cỏ bay) ===
    this.stylizedGrass = null;
    yield;

    // === GIAI ĐOẠN D: HỆ THỐNG ĐỘNG VẬT NÔNG TRẠI CHIBI ===
    this.farmAnimals = createFarmAnimals(scene, shadows);
    yield;

    this.openWorld = (yield* createOpenWorldSteps(scene, shadows));
    yield;
      this.vietnameseCountryside = (yield* createVietnameseCountrysideSteps(scene, shadows));
    yield;
      // Multi-parcel Neighborhood: Each player owns their assigned lot (Lot 1, 2, 3, or 4)
      const allTiles = [];
    yield;
      this.farmGates = [];
    yield;
      this.playerFarmId = this.callbacks.getPlayerFarmId?.() || null;
    yield;
      for (const [index, farm] of (WORLD_LAYOUT.farms).entries()) {
        const initial = this.callbacks.initialLocation || WORLD_LAYOUT.spawn;
        const isOwner = farm.id === this.playerFarmId;
        const ownerName = isOwner ? (this.callbacks.getPlayerName?.() || farm.owner) : farm.owner;
        const distance = Math.hypot(farm.x - initial.x, farm.z - initial.z);
        const shouldBeDetailed = isOwner;

        const farmChunk = new FarmChunk(scene, { ...farm, lotNumber: index + 1 }, shadows, {
          isOwner,
          ownerName,
        });
        this.farmChunks.set(farm.id, farmChunk);
        this.farmEstateRoots.set(farm.id, farmChunk.root);

        if (shouldBeDetailed) {
          farmChunk.showDetail(this.scheduler, (tiles) => {
            this.farming?.addTiles(tiles);
          });

          const gate = createFarmGateAndSign(scene, {
            id: farm.id,
            x: farm.x,
            z: farm.z,
            lotNumber: index + 1,
            owner: ownerName,
            isOwner,
          }, shadows, () => this.callbacks.onMailbox?.(farm));
          this.farmGates.push({ ...gate, farmId: farm.id, lotNumber: index + 1, defaultOwner: farm.owner });
          farmChunk.setGate(gate);
        } else {
          farmChunk.showHLOD();
        }

      yield;
    }
    yield;

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
    yield;
      this.homeTier = this.callbacks.getHomeTier?.() || 1;
    yield;
      this.ensurePlayerHome();
    yield;
      this.animalPen = createAnimalPen(scene, WORLD_LAYOUT.animalPen, shadows);
    yield;
      this.busRoute = createBusRoute(scene, shadows);
    yield;
      this.villageElder = createVillageElderNPC(scene, shadows, WORLD_LAYOUT.villageElder, () => this.callbacks.onNpcInteract?.('village_elder'));
    yield;
      this.foliageInstancing = new FoliageInstancingEngine(scene, shadows);
    yield;
      const foliage = createFoliageFactory(scene, shadows, this.foliageInstancing);
    yield;
      this.foliage = foliage;
    yield;
      this.villageGates = [];
      for (const village of WORLD_LAYOUT.villages) {
        this.villageGates.push({ villageId: village.id, ...createVillageGate(scene, village.gate, village.name, shadows, village.id, foliage) });
        yield;
      }
    yield;

      // === ĐẠI THỐNG SÔNG UỐN LƯỢN HOÀN VŨ & HỆ THỐNG CẦU VƯỢT GIAO THÔNG ===
      this.grandRiver = createGrandWindingRiver(scene, null, shadows);
    yield;
      this.collisionSystem.initRiverColliders(this.grandRiver.getCollisionBoxes());
    yield;
      // === HỆ THỐNG GIAO THÔNG LIÊN LÀNG & NÔNG TRẠI ĐỒNG BỘ 100% CHUẨN GHIBLI X PLAY TOGETHER ===
      // 1. Tuyến quốc lộ liên làng Đông - Tây (z = 86) nối trực tiếp 5 cổng làng hàng giữa
      (yield* createCountryRoadSteps(scene, {
        id: 'regional-highway-86',
        x: 0,
        z: 86,
        length: 1240,
        width: 6.0,
        isNorthSouth: false,
        shadows,
        hasCenterDashes: true,
        hasEdgeCurbs: true,
        hasStreetLamps: !this.isMobile,
        lampInterval: 64,
        intersections: [
          { pos: -600, width: 6.5 },
          { pos: -300, width: 6.5 },
          { pos: 0, width: 9.0 },
          { pos: 300, width: 6.5 },
          { pos: 600, width: 6.5 },
        ],
      }));
    yield;

      // 2. Tuyến quốc lộ liên làng phía Bắc (z = -234) nối 4 cổng làng hàng Bắc
      (yield* createCountryRoadSteps(scene, {
        id: 'regional-highway-north',
        x: 0,
        z: -234,
        length: 1240,
        width: 6.0,
        isNorthSouth: false,
        shadows,
        hasCenterDashes: true,
        hasEdgeCurbs: true,
        hasStreetLamps: !this.isMobile,
        lampInterval: 64,
        intersections: [
          { pos: -600, width: 6.5 },
          { pos: -300, width: 6.5 },
          { pos: 0, width: 6.5 },
          { pos: 300, width: 6.5 },
          { pos: 600, width: 6.5 },
        ],
      }));
    yield;

      // 3. Tuyến quốc lộ liên làng phía Nam ven biển (z = 406) nối Làng Thu Phong - Biển - Làng Hướng Dương
      (yield* createCountryRoadSteps(scene, {
        id: 'regional-highway-south',
        x: 0,
        z: 406,
        length: 1240,
        width: 6.0,
        isNorthSouth: false,
        shadows,
        hasCenterDashes: true,
        hasEdgeCurbs: true,
        hasStreetLamps: !this.isMobile,
        lampInterval: 64,
        intersections: [
          { pos: -300, width: 6.5 },
          { pos: 0, width: 9.0 },
          { pos: 300, width: 6.5 },
        ],
      }));
    yield;

      // 4. Đường vành đai xương sống cực Bắc (z = -650)
      (yield* createCountryRoadSteps(scene, {
        id: 'world-backbone',
        x: 0,
        z: -650,
        length: 1210,
        width: 6.0,
        isNorthSouth: false,
        shadows,
        hasCenterDashes: true,
        hasEdgeCurbs: true,
        hasStreetLamps: false,
        intersections: [
          { pos: -600, width: 6.5 },
          { pos: -300, width: 6.5 },
          { pos: 0, width: 6.5 },
          { pos: 300, width: 6.5 },
          { pos: 600, width: 6.5 },
        ],
      }));
    yield;

      // 5. Trục nối Đô thị - Làng xã (x = 0)
      (yield* createCountryRoadSteps(scene, {
        id: 'city-village-link',
        x: 0,
        z: -350,
        length: 600,
        width: 6.0,
        isNorthSouth: true,
        shadows,
        hasCenterDashes: true,
        hasEdgeCurbs: true,
        hasStreetLamps: !this.isMobile,
        lampInterval: 48,
        intersections: [
          { pos: -650, width: 7.0 },
          { pos: -234, width: 7.0 },
        ],
      }));
    yield;

      // 6. Mạng lưới đường nhánh, trục làng có vỉa hè & bùng binh cho 12 làng nông trại
      for (const [_index, village] of (WORLD_LAYOUT.villages).entries()) {
        const linkLength = village.gate.z + 650;
        // Trục nhánh từ vành đai vào cổng làng (làng Bình Minh dùng đại lộ trung tâm nên không vẽ đè)
        if (village.id !== 'binh-minh') {
          (yield* createCountryRoadSteps(scene, {
            id: `link-${village.id}`,
            x: village.offsetX,
            z: -650 + linkLength / 2,
            length: linkLength,
            width: 5.5,
            isNorthSouth: true,
            shadows,
            hasCenterDashes: true,
            hasEdgeCurbs: true,
            hasStreetLamps: false,
            intersections: [
              { pos: -650, width: 6.5 },
              { pos: -234, width: 6.5 },
              { pos: 86, width: 6.5 },
              { pos: 406, width: 6.5 },
            ],
          }));
        }

        // Trục đường chính xuyên tâm làng (kèm vỉa hè người đi bộ và ngắt gờ tại 7 ngã tư)
        const spineLaneCrossings = [0, 1, 2, 3, 4, 5, 6].map(row => ({
          pos: village.offsetZ + 98 + row * 28,
          width: 5.2,
        }));
        (yield* createCountryRoadSteps(scene, {
          id: `spine-${village.id}`,
          x: village.offsetX,
          z: village.offsetZ + 182,
          length: 196,
          width: 5.5,
          isNorthSouth: true,
          shadows,
          hasCenterDashes: true,
          hasEdgeCurbs: true,
          hasSidewalk: true,
          sidewalkWidth: 1.6,
          hasStreetLamps: !this.isMobile,
          lampInterval: 42,
          intersections: [
            { pos: village.gate.z, width: 7.5 },
            ...spineLaneCrossings,
          ],
        }));

        // Bùng binh quay đầu xe hình tròn cul-de-sac tại cuối trục chính mỗi làng
        createCulDeSac(scene, {
          id: `cul-${village.id}`,
          x: village.offsetX,
          z: village.offsetZ + 280,
          radius: 6.8,
          shadows,
        });

        // Vạch sang đường đá ngà chuẩn Ghibli tại cổng làng
        createZebraCrosswalk(scene, {
          id: `crosswalk-gate-${village.id}`,
          x: village.gate.x,
          z: village.gate.z,
          width: 7.5,
          depth: 2.8,
          isNorthSouth: false,
        });

        // 7 tuyến đường ngang phân lô nội bộ mỗi làng (ngắt gờ tại điểm giao với trục chính)
        for (let row = 0; row <= 6; row += 1) {
          const laneZ = village.offsetZ + 98 + row * 28;
          (yield* createCountryRoadSteps(scene, {
            id: `lane-${village.id}-${row}`,
            x: village.offsetX,
            z: laneZ,
            length: 124,
            width: 5.0,
            isNorthSouth: false,
            shadows,
            hasCenterDashes: false,
            hasEdgeCurbs: true,
            hasStreetLamps: false,
            intersections: [
              { pos: village.offsetX, width: 6.5 },
            ],
          }));

      yield;
}

      yield;
    }
    yield;
      this.objectiveMarker = createObjectiveMarker(scene);
    yield;
    const farmRoadTrees = [
      { x: -11.5, z: 48, type: 'oak', scale: 1.25 }, { x: 11.5, z: 48, type: 'maple', scale: 1.25 },
      { x: -11.5, z: 62, type: 'oak', scale: 1.25 }, { x: 11.5, z: 62, type: 'maple', scale: 1.2 },
      { x: -11.5, z: 74, type: 'sakura', scale: 1.15 }, { x: 11.5, z: 74, type: 'oak', scale: 1.2 },
    ];
    yield;
    for (const [_index, t] of (farmRoadTrees).entries()) {
      if (t.type === 'oak') foliage.createCloudTree(t.x, t.z, t.scale, true);
      else if (t.type === 'maple') foliage.createGoldenMaple(t.x, t.z, t.scale);
      else if (t.type === 'sakura') foliage.createSakuraTree(t.x, t.z, t.scale);

      yield;
    }
    yield;

    // Bụi cây cảnh cắt tỉa gọn gàng ven đường dẫn vào nông trại (đặt lùi ra ngoài vỉa hè)
    for (const [_index, fz] of ([54, 66, 78]).entries()) {
      foliage.createHydrangeaBush(-9.6, fz, 1.1, '#10b981');
      foliage.createHydrangeaBush(9.6, fz, 1.1, '#10b981');

      yield;
    }
    yield;

    // Hiên nghỉ chân & ghế băng cho Bác Trưởng Làng tại vỉa hè phía Tây (x: -6.8, z: 76)
    const elderBench = MeshBuilder.CreateBox('elder-rest-bench', { width: 2.2, height: 0.45, depth: 0.9 }, scene);
    yield;
    elderBench.position.set(-7.4, 0.23, 76.8);
    yield;
    elderBench.material = material(scene, 'elder-bench-wood', '#b45309');
    yield;
    const elderAwning = MeshBuilder.CreateBox('elder-rest-awning', { width: 2.6, height: 0.15, depth: 1.4 }, scene);
    yield;
    elderAwning.position.set(-7.4, 2.7, 76.8);
    yield;
    elderAwning.material = material(scene, 'elder-awning-fabric', '#f59e0b');
    yield;

    // Phủ thêm cây đại thụ đa dạng & khóm hoa dại ở các vùng phụ cận theo lưới phân bổ đều, nhịp nhàng
    const step = this.isMobile ? 36 : 24;
    yield;
    let nodeIndex = 0;
    yield;
    for (let gx = -330; gx <= 330; gx += step) {
      for (let gz = -300; gz <= 360; gz += step) {
        nodeIndex += 1;
        // Jitter tự nhiên theo hàm sin/cos (phân bổ sinh động, không tạo khoảng trống hoang vắng)
        const jx = Math.sin(gx * 0.08 + gz * 0.04) * 5.2;
        const jz = Math.cos(gx * 0.04 - gz * 0.08) * 5.2;
        const x = gx + jx;
        const z = gz + jz;

        // Tuyệt đối không lấn đường giao thông, nông trại, hồ nước, sông uốn lượn hay quảng trường
        const onRoad = isPointOnRoadCorridor(x, z, 5.8);
        const onFarmPlots = isPointInsideAnyFarmLot(x, z, 2.0) || WORLD_LAYOUT.farms.some(farm => Math.abs(x - farm.x) < 18 && Math.abs(z - farm.z) < 16);
        const onLake = (x > 120 && x < 210 && z > -40 && z < 45);
        const onPlaza = Math.hypot(x, z) < 38;
        const onRiver = isNearGrandRiver(x, z, 10);

        if (!onRoad && !onFarmPlots && !onLake && !onPlaza && !onRiver) {
          const variant = (nodeIndex % 4);
          const nearPlayer = Math.hypot(x, z) < 65;
          const scaleMod = 1.0 + (nodeIndex % 5) * 0.06;

          if (this.foliageInstancing) {
            // Tận dụng GPU Hardware Instancing để duy trì 60 FPS mượt mà
            if (variant === 0) this.foliageInstancing.spawnOak(x, z, { scale: scaleMod, withShadow: nearPlayer });
            else if (variant === 1) this.foliageInstancing.spawnMaple(x, z, { scale: scaleMod, withShadow: nearPlayer });
            else if (variant === 2) this.foliageInstancing.spawnSakura(x, z, { scale: scaleMod, withShadow: nearPlayer });
            else this.foliageInstancing.spawnPine(x, z, { scale: scaleMod, withShadow: nearPlayer });
          } else {
            if (variant === 0) foliage.createCloudTree(x, z, scaleMod, nearPlayer);
            else if (variant === 1) foliage.createGoldenMaple(x, z, scaleMod, nearPlayer);
            else if (variant === 2) foliage.createSakuraTree(x, z, scaleMod, nearPlayer);
            else foliage.createAlpinePine(x, z, scaleMod, nearPlayer);
          }

          if (nodeIndex % 3 === 0) {
            foliage.createFlowerPatch(x + 1.4, z, 6, 1.6);
            if (this.foliageInstancing) {
              this.foliageInstancing.spawnBush(x - 1.2, z + 0.8, 1.35);
            }
          }
        }

      yield;
}

      yield;
}
    yield;

    for (const [_index, sign] of (WORLD_LAYOUT.destinationSigns).entries()) { createSign(scene, sign.label, new Vector3(sign.x, 1.6, sign.z), sign.color); yield; }
    yield;

    let busStatusElapsed = 0;
    yield;
    scene.onBeforeRenderObservable.add(() => {
      const dt = Math.min(0.1, Math.max(0, this.engine.getDeltaTime() / 1000));
      window.__farmDebug?.stage('player.update / collision');
      player.update(dt);
      window.__farmDebug?.stage('atmosphere / water / bus');
      this.atmosphere?.update(dt);
      this.fogStreaming?.update(dt);
      this.livingMeadow?.update(dt, player.root.position);
      this.grandRiver?.update(dt);

      const isRiding = this.busRoute?.isPlayerRiding();
      const busTransitStatus = this.busRoute?.update(dt, player.root.position);
      if (isRiding && busTransitStatus?.activeRide) {
        const ride = busTransitStatus.activeRide;
        player.root.position.copyFrom(ride.passengerSeatNode.getAbsolutePosition());
        player.root.rotation.y = ride.busRoot.rotation.y;
      }
      if (busTransitStatus) {
        busTransitStatus.cinematicTourActive = this.cinematicTourActive;
      }
      busStatusElapsed += Math.min(dt, 0.1);
      if (busStatusElapsed >= 0.2) {
        busStatusElapsed = 0;
        this.callbacks.onBusTransitChange?.(busTransitStatus);
      }

      if (isRiding) {
        // Nới rộng góc nhìn điện ảnh khi ngồi trên xe buýt
        camera.radius += (16.5 - camera.radius) * Math.min(1, dt * 2.0);
        camera.beta += (1.18 - camera.beta) * Math.min(1, dt * 2.0);

        // Chế độ Điện Ảnh 360 độ tự động xoay nhẹ nhàng lướt ngắm cảnh
        if (this.cinematicTourActive) {
          camera.alpha += dt * 0.18;
        }
      }

      _TMP_VIEW_FORWARD.set(-Math.cos(camera.alpha), 0, -Math.sin(camera.alpha));
      const lookAhead = isRiding ? 8.0 : (this.currentVenue || this.cameraViewMode === 'farm' ? RENDER_CONFIG.farmCameraLookAhead : RENDER_CONFIG.cameraLookAhead);
      const targetPos = isRiding && busTransitStatus?.activeRide ? busTransitStatus.activeRide.busRoot.position : player.root.position;
      const targetYOffset = isRiding ? (RENDER_CONFIG.cameraTargetHeight + 1.2) : RENDER_CONFIG.cameraTargetHeight;

      _TMP_DESIRED_TARGET.copyFrom(targetPos);
      _TMP_DESIRED_TARGET.x += _TMP_VIEW_FORWARD.x * lookAhead;
      _TMP_DESIRED_TARGET.y += targetYOffset;
      _TMP_DESIRED_TARGET.z += _TMP_VIEW_FORWARD.z * lookAhead;

      const followAmount = 1 - Math.exp(-RENDER_CONFIG.cameraFollowSpeed * Math.min(dt, 0.05));
      // Teleports should not leave the camera flying across the whole map.
      if (Vector3.DistanceSquared(cameraTarget.position, _TMP_DESIRED_TARGET) > 100) {
        cameraTarget.position.copyFrom(_TMP_DESIRED_TARGET);
      } else {
        Vector3.LerpToRef(cameraTarget.position, _TMP_DESIRED_TARGET, followAmount, cameraTarget.position);
      }

      // Khóa vị trí nguồn sáng Directional Sun bám sát theo vị trí mục tiêu (chuẩn Cozy Farmy 56m)
      if (this.sun) {
        const dir = this.sun.direction;
        this.sun.position.set(
          targetPos.x - dir.x * 60,
          targetPos.y - dir.y * 60,
          targetPos.z - dir.z * 60
        );
      }

      if (this.cinematic && player.mesh) {
        this.cinematic.updateFocus(Vector3.Distance(camera.position, player.mesh.position));
      }
      if (!this.currentVenue) {
        if (performance.now() - (this.lastVillageDetailAt || 0) > 250) {
          this.lastVillageDetailAt = performance.now();
          const selected = this.farmStreamingGrid.select(player.root.position, this.farmChunks, this.playerFarmId);
          this.lastFarmDetailSelection = selected;
          window.__farmDebug?.stage('farm visibility');
          WORLD_LAYOUT.farms.forEach(farm => {
            const estate = this.farmEstateRoots.get(farm.id);
            const distance = Math.hypot(farm.x - player.root.position.x, farm.z - player.root.position.z);
            // Tối ưu triệt để: Giữ nông trại hiển thị trong tầm nhìn, chỉ ẩn khi nằm sâu trong sương mù chân trời (>240m)
            const estateMaxDist = this.isMobile ? 180 : 250;
            const isPlayerFarm = farm.id === this.playerFarmId;
            if (estate) {
              if (!isPlayerFarm && distance > (estateMaxDist + 30) && estate.isEnabled()) {
                estate.setEnabled(false);
              } else if ((isPlayerFarm || distance <= estateMaxDist) && !estate.isEnabled()) {
                estate.setEnabled(true);
              }
            }
            const chunk = this.farmChunks.get(farm.id);
            if (selected.has(farm.id) && chunk && !chunk.wantsDetail) {
              const profile = this.publicFarms?.find(item => item.farmId === farm.id);
              this.ensureDetailedFarm(farm.id, farm.id === this.playerFarmId,
                profile?.userName || farm.owner, profile?.homeTier || 1, profile?.barnLevel || 1);
            } else if (!selected.has(farm.id) && chunk?.wantsDetail) {
              this.demoteUnoccupiedFarm(farm.id);
            }
          });
          // Active selection follows distance, not the number of old detailed
          // roots. Keep a bounded cold LRU cache and the player's own estate.
          const cached = [...this.farmChunks.values()].filter(chunk => chunk.detailReady && chunk.farmId !== this.playerFarmId);
          if (cached.length > 8) {
            const victim = cached.filter(chunk => !chunk.wantsDetail && !chunk.evicting &&
              Math.hypot(chunk.farm.x - player.root.position.x, chunk.farm.z - player.root.position.z) > 260)
              .sort((a, b) => a.lastUsed - b.lastUsed)[0];
            if (victim) this.evictFarmCache(victim);
          }
        }
        window.__farmDebug?.stage('world partition');
        const regionUpdate = this.proceduralWorld?.update(player.root.position);
        if (regionUpdate) this.callbacks.onRegionChange?.(regionUpdate);
      }
      window.__farmDebug?.stage('farming / NPC / world animation');
      this.animalPen?.update(performance.now());
      this.farming?.update();
      this.villageElder?.update(performance.now());
      this.objectiveMarker?.update(performance.now());
      this.updateVenueProximity();
      this.updateFarmZoneProximity();
      this.openWorld?.update(performance.now(), dt);
      const renderAt = performance.now() + (this.remoteClockOffset || 0) - 180;
      window.__farmDebug?.stage('remote player interpolation');
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
        const angle = targetRotation - remote.rotation.y;
        const rotationDelta = Math.atan2(Math.sin(angle), Math.cos(angle));
        remote.rotation.y += rotationDelta * follow;

        remote.metadata.human?.animate(dt, isMoving, 4.0);
      });
      window.__farmDebug?.stage('Babylon draw / shadows / postprocess');
    });
    yield;

    scene.blockMaterialDirtyMechanism = false;
    yield;
    return scene;
  }

  dispose() {
    window.__farmRuntimeAudit?.record('world-disposed');
    this.scheduler?.clear();
    window.__farmDebug?.stopFrames();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('keydown', this.keydown);
    this.player?.dispose();
    this.renderIndex?.dispose();
    this.localNameplate?.dispose();
    this.remotePlayers?.forEach(remote => remote.metadata?.nameplate?.dispose());
    this.atmosphere?.dispose();
    this.fogStreaming?.dispose();
    this.livingMeadow?.dispose();
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
    const baseRadius = this.currentVenue ? RENDER_CONFIG.interiorCameraRadius : this.cameraViewMode === 'farm' ? RENDER_CONFIG.farmCameraRadius : RENDER_CONFIG.cameraRadius;
    this.camera.radius = (!this.isGameStarted && !this.currentVenue) ? (baseRadius + 8) : baseRadius;
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

  setLocalPlayerName(name) {
    this.localNameplate?.setName(name);
  }

  refreshFarm() { this.farming?.refreshUnlocks(); }

  syncRemotePlayers(players, serverTime = Date.now()) {
    const receivedAt = performance.now();
    const offset = serverTime - receivedAt;
    // Use server timestamps instead of uneven packet arrival times.
    this.remoteClockOffset = this.remoteClockOffset == null ? offset : this.remoteClockOffset + (offset - this.remoteClockOffset) * 0.02;
    const active = new Set(players.map(player => player.playerId));
    for (const [id, remote] of this.remotePlayers) {
      if (!active.has(id)) {
        remote.metadata?.nameplate?.dispose();
        remote.dispose(false, false);
        this.remotePlayers.delete(id);
      }
    }
    players.forEach((player, index) => {
      if (![player.x, player.z, player.rotation ?? 0].every(Number.isFinite)) {
        window.__farmDebug?.report(`Bỏ qua tọa độ/góc xoay không hợp lệ của ${player.playerId}`, 'INVALID REMOTE POSITION');
        return;
      }
      let remote = this.remotePlayers.get(player.playerId);
      const effectiveY = Number.isFinite(player.y) && player.y !== 0 ? player.y : (VENUES[player.venue]?.interior.y ?? getTerrainHeight(player.x, player.z));
      if (!remote) {
        remote = createRemoteAvatar(this.scene, player.playerId, player.name, REMOTE_COLORS[index % REMOTE_COLORS.length], this.shadows);
        remote.position.set(player.x, effectiveY, player.z);
        this.remotePlayers.set(player.playerId, remote);
      }
      if (remote.metadata.playerName !== player.name) {
        remote.metadata.playerName = player.name;
        remote.metadata.nameplate?.setName(player.name);
      }
      remote.metadata.venue = player.venue || null;
      remote.setEnabled(this.currentVenue ? remote.metadata.venue === this.currentVenue : !remote.metadata.venue);
      remote.metadata.target.set(player.x, effectiveY, player.z);
      remote.metadata.targetRotation = player.rotation || 0;
      if (!remote.metadata.snapshots) remote.metadata.snapshots = [];
      const frames = remote.metadata.snapshots;
      const last = frames[frames.length - 1];
      if (last && serverTime <= last.at) return;
      if (last && (last.venue !== player.venue || Math.hypot(player.x - last.x, player.z - last.z) > 8)) {
        frames.length = 0;
        remote.position.set(player.x, effectiveY, player.z);
        remote.rotation.y = player.rotation || 0;
      }
      frames.push({ at: serverTime, x: player.x, y: effectiveY, z: player.z, rotation: player.rotation || 0, venue: player.venue });
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
    const targetY = (Number.isFinite(authoritative.y) && authoritative.y !== 0) ? authoritative.y : (VENUES[this.currentVenue]?.interior.y ?? getTerrainHeight(authoritative.x, authoritative.z));
    if (performance.now() - (this.lastCorrectionReportAt || 0) > 15000) {
      this.lastCorrectionReportAt = performance.now();
      window.__farmDebug?.report(`Server từ chối/correct bước di chuyển, lệch ${error.toFixed(2)}m; lý do: ${authoritative.reason || 'server không cung cấp'}. Vị trí: ${authoritative.x}, ${authoritative.z}.`, 'SERVER MOVEMENT CORRECTION');
    }
    if (error > 4) {
      this.player.root.position.set(authoritative.x, targetY, authoritative.z);
    } else {
      this.player.root.position.x += dx * 0.35;
      this.player.root.position.y += (targetY - this.player.root.position.y) * 0.35;
      this.player.root.position.z += dz * 0.35;
    }
    if (Number.isFinite(authoritative.rotation)) this.player.root.rotation.y = authoritative.rotation;
  }

  setPlayerOutfit(idOrColor, color) { this.player?.setOutfit(idOrColor, color); }

  travelTo(position) {
    if (!this.player || !position) return false;
    if (this.collisionSystem.isColliding(position.x, position.z)) {
      this.onStatus?.('Điểm đến đang bị công trình chắn. Hãy chọn lối vào khác.');
      return false;
    }
    if (this.currentVenue) {
      this.currentVenue = null;
      this.setVenueView(null);
      this.callbacks.onVenueState?.(null, null);
    }
    this.player.stop();
    this.player.root.position.set(position.x, 0, position.z);
    this.onStatus?.(`Đã đến ${position.label || 'điểm đến'}`);
    return true;
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
    if (!this.venueMeshesMap.has(kind)) {
      this.onStatus?.(`Đang dựng nội thất ${venue.label}…`);
      this.ensureVenueBuilt(kind).then(() => {
        if (!this.scene.isDisposed && this.getDistanceTo(venue.entrance.x, venue.entrance.z) <= 4) this.completeVenueEntry(kind);
      }).catch(error => this.callbacks.onFatalError?.(`Không thể dựng cửa hàng: ${error.message}`));
      return;
    }
    this.lastVenueTransition = performance.now();
    this.currentVenue = kind;
    this.updateFarmZoneProximity();
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
    if (!this.player) return;
    const pos = this.player.root.position;
    let activeFarm = null;
    if (!this.currentVenue) {
      for (const farm of WORLD_LAYOUT.farms) {
        if (Math.abs(pos.x - farm.x) <= 9.0 && Math.abs(pos.z - farm.z) <= 7.5) {
          activeFarm = farm;
          break;
        }
      }
    }
    const currentId = activeFarm ? activeFarm.id : null;
    if (this.lastActiveFarmId !== currentId) {
      this.lastActiveFarmId = currentId;
      if (currentId !== this.playerFarmId) {
        this.setTool('hand');
        this.callbacks.onToolChange?.('hand');
      }
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

  canUseFarmTools() {
    return Boolean(this.playerFarmId && !this.currentVenue && this.lastActiveFarmId === this.playerFarmId);
  }

  setVenueView(kind = null) {
    if (this.currentVenueMeshes) {
      this.currentVenueMeshes.forEach(mesh => mesh.setEnabled(false));
      this.currentVenueMeshes = null;
    }
    if (kind && this.venueMeshesMap?.has(kind)) {
      const venueMeshes = this.venueMeshesMap.get(kind);
      venueMeshes.forEach(mesh => mesh.setEnabled(true));
      this.currentVenueMeshes = venueMeshes;
    }
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
    this.player.root.position.set(venue.exit.x, 0, venue.exit.z);
    this.currentVenue = null;
    this.updateFarmZoneProximity();
    this.setVenueView(null);
    this.callbacks.onVenueState?.(null, null);
    this.onStatus?.(`Đã ra khỏi ${venue.label}`);
  }

  getDebugState() {
    const position = this.player?.root.position || Vector3.Zero();
    const chunk = chunkAt(position.x, position.z);
    return {
      runtimeAudit: window.__farmRuntimeAudit?.snapshot(),
      fps: Math.round(this.engine.getFps()),
      graphicsQuality: this.graphicsQuality,
      renderWidth: this.engine.getRenderWidth(),
      renderHeight: this.engine.getRenderHeight(),
      resolutionScale: (this.graphicsQuality === 'auto' ? this.autoGraphics.scale : this.graphicsQuality === 'ultra' ? 1 : this.resolutionController.scale).toFixed(2),
      x: position.x.toFixed(1),
      z: position.z.toFixed(1),
      chunk: `${chunk.x}:${chunk.z}`,
      meshes: this.scene.meshes.length,
      activeMeshes: this.scene.getActiveMeshes().length,
      nearbyShadowCasters: this.getNearbyShadowCount?.() ?? null,
      streamingScheduler: this.scheduler?.getStats(),
      modelWork: getModelWorkStats(this.scene),
      autoGraphics: { effects: this.autoGraphics.effects, scale: this.autoGraphics.scale },
      farmCache: { built: [...this.farmChunks.values()].filter(farm => farm.detailReady).length,
        building: [...this.farmChunks.values()].filter(farm => farm.buildingInProgress).length,
        selected: this.lastFarmDetailSelection?.size || 0,
        active: [...this.farmChunks.values()].filter(farm => farm.state === 'detail').length },
      textureWorker: getTextureWorkerStats(this.scene),
      upgradedHomesReady: [...this.farmBuildings.values()].filter(building => building.homeTier >= 2 &&
        building.home?.root?.getChildTransformNodes().some(node =>
          String(node.metadata?.asset || '').includes('village') && node.metadata?.assetStatus === 'ready')).length,
      fogStreaming: this.fogStreaming?.getState?.() ?? null,
      livingMeadow: this.livingMeadow?.getStats?.() ?? null,
      foliageBatches: this.foliageInstancing?.getStats?.() ?? null,
      // Full mesh-name grouping is intentionally excluded from the hot path.
      // It allocated thousands of temporary regex strings while chunks streamed.
      topMeshGroups: [],
      ...this.renderIndex?.getStats(),
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
    // Network scope is data visibility, not permission to synchronously construct
    // every estate in a single WebSocket callback. Nearby non-owned estates are
    // promoted one per second by the render scheduler.
    const ownedFarm = farms.find(farm => farm.farmId === this.playerFarmId);
    if (ownedFarm) this.ensureDetailedFarm(ownedFarm.farmId, true,
      ownedFarm.userName || ownedFarm.name, ownedFarm.homeTier || 1, ownedFarm.barnLevel || 1);
    // Scope can arrive after an estate was already promoted. Its active terrain
    // must still receive the public home/corral instead of staying empty forever.
    for (const profile of farms) {
      if (profile.farmId === ownedFarm?.farmId || !this.farmChunks.get(profile.farmId)?.wantsDetail) continue;
      this.ensureFarmBuildings(profile.farmId, profile.homeTier || 1, profile.barnLevel || 1,
        profile.userName || profile.name || 'Nông dân');
    }
    this.updateFarmSigns(this.remotePlayerState || []);
    this.applyRemoteFarmSync(crops);
  }

  setPlayerFarmId(farmId, spawnPoint = null) {
    if (spawnPoint) this.callbacks.initialLocation = spawnPoint;
    this.playerFarmId = farmId;
    this.lastActiveFarmId = undefined;
    this.farming?.setPlayerFarmId(farmId);
    if (farmId) this.ensureDetailedFarm(farmId);
    this.ensurePlayerHome();
    this.updateFarmSigns();

    // Nếu có spawnPoint hoặc người chơi mới vào, đặt vị trí về cổng nông trại của mình
    if (spawnPoint && this.player) {
      this.player.stop();
      this.player.root.position.set(spawnPoint.x, spawnPoint.y || 0, spawnPoint.z);
      this.player.root.rotation.y = Number(spawnPoint.rotation) || 0;
      this.syncVenueFromPosition(spawnPoint);
    }
    this.updateFarmZoneProximity();
  }

  syncVenueFromPosition(position) {
    const venue = VENUES[position.venue];
    const isInside = venue && Math.hypot(position.x - venue.interior.x, position.z - venue.interior.z) <= 22 && position.y >= 20;
    const nextVenue = isInside ? position.venue : null;
    if (this.currentVenue === nextVenue) return;
    this.currentVenue = nextVenue;
    this.updateFarmZoneProximity();
    this.setVenueView(nextVenue);
    this.callbacks.onVenueState?.(nextVenue, nextVenue ? VENUES[nextVenue].label : null);
  }

  restorePlayerPosition(position) {
    if (!this.player || !position || ![position.x, position.y, position.z].every(Number.isFinite)) return;
    this.player.stop();
    this.player.root.position.set(position.x, position.y || 0, position.z);
    this.player.root.rotation.y = Number(position.rotation) || 0;
    this.syncVenueFromPosition(position);
  }

  ensureDetailedFarm(farmId, isOwner = true, ownerName = null, homeTier = 1, barnLevel = 1) {
    const farm = WORLD_LAYOUT.farms.find(item => item.id === farmId);
    if (!farm) return;
    const farmChunk = this.farmChunks.get(farmId);
    if (!farmChunk) return;
    const displayName = ownerName || (isOwner ? this.callbacks.getPlayerName?.() : farm.owner) || farm.owner;
    farmChunk.isOwner = isOwner;
    farmChunk.ownerName = displayName;

    farmChunk.showDetail(this.scheduler, (tiles) => {
      this.farming?.addTiles(tiles);
    });

    if (!this.farmGates.some(gate => gate.farmId === farmId) && !farmChunk.gatePending) {
      farmChunk.gatePending = true;
      this.scheduler.enqueue(() => {
        farmChunk.gatePending = false;
        if (farmChunk.evicting) return;
        const gate = createFarmGateAndSign(this.scene, { ...farm, owner: displayName, isOwner }, this.shadows, () => this.callbacks.onMailbox?.(farm));
        this.farmGates.push({ ...gate, farmId, lotNumber: farm.lotNumber, defaultOwner: farm.owner });
        farmChunk.setGate(gate);
      }, 5, `farm-gate-${farmId}`);
    }
    if (isOwner || this.publicFarms?.some(item => item.farmId === farmId)) {
      this.ensureFarmBuildings(farmId, homeTier, barnLevel, displayName);
    }
  }

  demoteUnoccupiedFarm(farmId) {
    const farm = WORLD_LAYOUT.farms.find(item => item.id === farmId);
    const farmChunk = this.farmChunks.get(farmId);
    if (!farm || !farmChunk || farmId === this.playerFarmId) return;

    farmChunk.showHLOD();
  }

  evictFarmCache(chunk) {
    chunk.evicting = true;
    const world = this;
    this.scheduler.enqueue((function* () {
      world.farming?.removeFarmTiles(chunk.farmId, { preserveState: true });
      yield;
      world.farmBuildings.get(chunk.farmId)?.dispose?.();
      world.farmBuildings.delete(chunk.farmId);
      yield;
      const gateIndex = world.farmGates.findIndex(gate => gate.farmId === chunk.farmId);
      if (gateIndex >= 0) world.farmGates.splice(gateIndex, 1)[0].dispose?.();
      yield;
      yield* chunk.evictDetail();
    })(), -1, `farm-evict-${chunk.farmId}`);
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
    const chunk = this.farmChunks.get(farmId);
    const signature = `${homeTier}:${barnLevel}:${ownerName}`;
    if (chunk?.pendingBuildingSignature === signature) return;
    if (chunk) chunk.pendingBuildingSignature = signature;
    const world = this;
    this.scheduler.enqueue((function* () {
    let home = null;
    let corral = null;
    let committed = false;
    try {
    const scene = world.scene;
    if (scene.isDisposed || chunk?.evicting) return;
    world.farmBuildings.get(farmId)?.dispose?.();
    world.farmBuildings.delete(farmId);
    yield;
    const homePosition = {
      x: farm.x + FARM_LOT_SPEC.anchors.home.x,
      y: 0,
      z: farm.z + FARM_LOT_SPEC.anchors.home.z,
    };
    home = homeTier >= 2
      ? createFarmhouse(scene, world.shadows, homePosition)
      : createStarterFarmhouse(scene, world.shadows, homePosition);
    home.root.metadata = { ...(home.root.metadata || {}), farmId, ownerName, type: 'farm-home' };
    if (chunk) home.root.setParent(chunk.buildingRoot);
    yield;

    const corralAnchor = FARM_LOT_SPEC.anchors.corral || FARM_LOT_SPEC.anchors.barn;
    corral = createOpenAirCorral(scene, world.shadows, {
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

    world.farmBuildings.set(farmId, {
      home,
      barn: corral,
      homeTier,
      barnLevel,
      ownerName,
      dispose() { home?.dispose?.(); corral?.dispose?.(); },
    });
    const farmChunk = world.farmChunks.get(farmId);
    if (farmChunk) {
      farmChunk.setBuildings(home, corral);
      farmChunk.pendingBuildingSignature = null;
    }
    committed = true;
    } finally {
      if (!committed) { home?.dispose?.(); corral?.dispose?.(); }
      if (chunk?.pendingBuildingSignature === signature) chunk.pendingBuildingSignature = null;
    }
    })(), 4, `farm-buildings-${farmId}`);
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
      const available = Boolean(listing?.available && !isOwner);
      const owner = isOwner ? myName : available ? '' : (remoteOwner?.name || registeredFarm?.userName || registeredFarm?.name || listing?.userName || (listing ? 'Đang giao dịch' : ''));
      gate.updateSign({ owner, isOwner, available, price: available ? listing.price : null, lotNumber: gate.lotNumber });
    });
  }

  openNearbyLand() {
    if (!this.player || this.currentVenue) return false;
    const pos = this.player.root.position;
    let nearest = null;
    let minDistance = 4.8;
    this.farmGates?.forEach(gate => {
      if (gate.farmId === this.playerFarmId) return;
      const gatePos = gate.root.getAbsolutePosition();
      const distance = Math.hypot(pos.x - gatePos.x, pos.z - gatePos.z);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = gate;
      }
    });
    if (!nearest) return false;
    this.callbacks.onLandInteract?.(nearest.farmId);
    return true;
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
