import { FrameSafeResize } from '../rendering/FrameSafeResize.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { sampleMovement } from '../network/sampleMovement.js';
import { cameraMovementBasis } from '../player/cameraMovementBasis.js';
import { createVehicleRigs } from '../player/createVehicleRigs.js';
import { applyVehiclePose } from '../player/applyVehiclePose.js';
import { CasinoTableView } from '../casino/CasinoTableView.js';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { Engine } from '@babylonjs/core/Engines/engine.js';
import { installWorldRenderIndex } from '../rendering/WorldRenderIndex.js';
import { installMaterialDirtyIndex } from '../rendering/MaterialDirtyIndex.js';
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
import { createPlayer, createFishingRig } from '../player/createPlayer.js';
import { recoverTownSpawn } from '../../../shared/playerSpawn.js';
import { normalizeVenuePosition } from '../../../shared/venuePosition.js';
import { createPlayerNameplate } from '../player/createPlayerNameplate.js';
import { createOpenWorldSteps, createOpenWorld } from './createOpenWorld.js';
import { createAnimalPen } from '../livestock/createAnimalPen.js';
import { OwnedHerd } from '../livestock/OwnedHerd.js';
import { createBusRouteSteps } from '../transport/createBusRoute.js';
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
import { avatarAppearance } from '../../../shared/avatarAppearance.js';
import { createAtmosphere } from './createAtmosphere.js';
import { createFarmGateAndSign } from '../farming/createFarmGateAndMailbox.js';
import { createFarmhouse, createStarterFarmhouse } from './createFarmhouse.js';
import { createOpenAirCorral } from '../farming/createOpenAirCorral.js';
import { createClassicRedBarn } from './landmarks/createSocialFarmstead.js';
import { createVillageGate } from './landmarks/createVillageGate.js';
import { createFashionBoutiqueInterior } from './landmarks/createFashionInterior.js';
import { createCasinoLoungeInterior } from './landmarks/createCasinoInterior.js';
import { createCinematicRenderingPipeline } from '../rendering/CinematicRenderingPipeline.js';
import { showCharacterChatBubble } from '../player/CharacterChatBubble.js';
import { createFoliageFactory } from './createFoliage.js';
import { createStylizedGrass } from './createStylizedGrass.js';
import { createFarmAnimalsSteps } from './createFarmAnimals.js';
import { createVietnameseCountrysideSteps, createVietnameseCountryside } from './createVietnameseCountryside.js';
import { FARM_LOT_SPEC } from '../../../shared/farmLayout.js';
import { SHOP_CONFIG } from '../../../shared/shopConfig.js';
import { VenueVisibility } from '../rendering/VenueVisibility.js';
import { FARM_CONFIG as SHARED_FARM_CONFIG } from '../../../shared/farmConfig.js';
import { farmGatePosition } from '../../../shared/farmSecurity.js';
import { isPointOnRoadCorridor, isRoadFootprintBlocked } from './RoadSafetyZone.js';
import { isPointInsideAnyFarmLot } from './FarmSafetyZone.js';
import { isPointInLakeOrRiver } from './WaterSafetyZone.js';
import { WorldCollisionSystem } from '../physics/WorldCollisionSystem.js';
import { vehicleCollisionRadius } from '../../../shared/vehicleCollision.js';
import { CASINO_TABLE_ANCHORS } from '../../../shared/casinoTableAnchors.js';
import { createScenicLandscapesSteps, createScenicLandscapes } from './createScenicLandscapes.js';
import { createVillageAmenitiesAndGreenbeltsSteps, createVillageAmenitiesAndGreenbelts } from './createVillageAmenities.js';
import { getTerrainHeight, MEADOW_KNOLLS } from './TerrainHeightSystem.js';
import { createInterVillagePlainsSteps, createInterVillagePlains } from './createInterVillagePlains.js';
import { createRoadsideMeadowsSteps, createRoadsideMeadows } from './createRoadsideMeadows.js';
import { createVillageWoodlandsSteps } from './createVillageWoodlands.js';
import { createLivingMeadowSteps } from './createLivingMeadow.js';
import { FoliageInstancingEngine } from './FoliageInstancingEngine.js';
import { getWorldChunkStreamer } from './WorldChunkStreamer.js';
import { BEACH_CONFIG, beachRoadSegments } from '../../../shared/beachConfig.js';
import { FogStreamingController } from './FogStreamingController.js';
import { createGrandWindingRiverSteps, createGrandWindingRiver, RIVER_CONTROL_POINTS } from './nature/GrandWindingRiver.js';
import { CHARACTER_LOD_CONFIG } from '../../../shared/characterConfig.js';

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

function createRemoteAvatar(scene, id, name, appearance, shadows) {
  const root = new TransformNode(`remote-player-${id}`, scene);
  const human = buildHumanMesh(scene, `remote-${id}`, {
    ...appearance,
    shadows,
  });
  human.root.parent = root;
  const nameplate = createPlayerNameplate(scene, root, id, name);
  root.metadata = { playerId: id, playerName: name, nameplate, target: new Vector3(), targetRotation: 0, human };
  return root;
}


const VENUES = VENUE_LAYOUT;

function getClampedInteriorRadius(camera, target, bounds, desiredRadius) {
  const sinB = Math.sin(camera.beta);
  const cosB = Math.cos(camera.beta);
  const cosA = Math.cos(camera.alpha);
  const sinA = Math.sin(camera.alpha);

  const dirX = cosA * sinB;
  const dirY = cosB;
  const dirZ = sinA * sinB;

  let maxR = desiredRadius;
  const margin = 0.7; // keep camera at least 0.7m away from interior walls

  if (dirX > 0.001) maxR = Math.min(maxR, (bounds.maxX - margin - target.x) / dirX);
  else if (dirX < -0.001) maxR = Math.min(maxR, (bounds.minX + margin - target.x) / dirX);

  if (dirZ > 0.001) maxR = Math.min(maxR, (bounds.maxZ - margin - target.z) / dirZ);
  else if (dirZ < -0.001) maxR = Math.min(maxR, (bounds.minZ + margin - target.z) / dirZ);

  if (dirY > 0.001) maxR = Math.min(maxR, (bounds.maxY - margin - target.y) / dirY);
  else if (dirY < -0.001) maxR = Math.min(maxR, (bounds.minY + margin - target.y) / dirY);

  return Math.max(2.4, Math.min(desiredRadius, maxR));
}

function* createInteriorSteps(scene, kind, config, shadows) {
  const shopStyle = SHOP_CONFIG[kind];
  if (kind === 'fashion') {
    const firstMeshIndex = scene.meshes.length;
    yield* createFashionBoutiqueInterior(scene, config, shadows);
    const venueMeshes = scene.meshes.slice(firstMeshIndex);
    venueMeshes.forEach(mesh => {
      mesh.metadata = { ...(mesh.metadata || {}), interiorVenue: kind };
      mesh.setEnabled(false);
    });
    return venueMeshes;
  }
  if (kind === 'casino') {
    const firstMeshIndex = scene.meshes.length;
    yield* createCasinoLoungeInterior(scene, config, shadows);
    const venueMeshes = scene.meshes.slice(firstMeshIndex);
    for (let index = 0; index < venueMeshes.length; index++) {
      const mesh = venueMeshes[index];
      mesh.metadata = { ...(mesh.metadata || {}), interiorVenue: kind };
      mesh.setEnabled(false);
      if ((index + 1) % 24 === 0) yield;
    }
    return venueMeshes;
  }
  const firstMeshIndex = scene.meshes.length;
  yield;
  const { x, y, z } = config.interior;
  yield;
  const outerMat = material(scene, `${kind}-outer-occlusion-mat`, '#120d18');
  outerMat.backFaceCulling = false;
  outerMat.disableLighting = true;
  const outerOcclusion = MeshBuilder.CreateBox(`${kind}-outer-occlusion-box`, { width: 90, height: 42, depth: 90 }, scene);
  outerOcclusion.position.set(x, y + 10, z - 4);
  outerOcclusion.material = outerMat;
  outerOcclusion.isPickable = false;
  yield;
  const floor = material(scene, `interior-floor-${kind}`, shopStyle.floor);
  floor.backFaceCulling = false;
  yield;
  const wall = material(scene, `interior-wall-${kind}`, shopStyle.wall);
  wall.backFaceCulling = false;
  yield;
  const accent = material(scene, `interior-accent-${kind}`, shopStyle.accent);
  yield;
  const wood = material(scene, `interior-wood-${kind}`, shopStyle.wood);
  yield;
  const pieces = [
    ['floor', { width: 25.2, height: .6, depth: 29.2 }, new Vector3(x, y - .3, z - 4), floor],
    ['ceiling', { width: 25.2, height: .6, depth: 29.2 }, new Vector3(x, y + 7.2, z - 4), wall],
    ['back', { width: 25.2, height: 7.4, depth: .8 }, new Vector3(x, y + 3.6, z + 9), wall],
    ['left', { width: .8, height: 7.4, depth: 29.2 }, new Vector3(x - 12.2, y + 3.6, z - 4), wall],
    ['right', { width: .8, height: 7.4, depth: 29.2 }, new Vector3(x + 12.2, y + 3.6, z - 4), wall],
    ['front-l', { width: 10.2, height: 7.4, depth: .8 }, new Vector3(x - 7.3, y + 3.6, z - 17.8), wall],
    ['front-r', { width: 10.2, height: 7.4, depth: .8 }, new Vector3(x + 7.3, y + 3.6, z - 17.8), wall],
    ['front-top', { width: 5.4, height: 2.6, depth: .8 }, new Vector3(x, y + 6.0, z - 17.8), wall],
    ['foyer-backing', { width: 14.0, height: 7.4, depth: .6 }, new Vector3(x, y + 3.6, z - 18.4), wall],
  ];
  yield;
  pieces.forEach(([name, size, position, mat]) => {
    const mesh = MeshBuilder.CreateBox(`${kind}-interior-${name}`, size, scene);
    mesh.position.copyFrom(position); mesh.material = mat; mesh.receiveShadows = true;
  });
  yield;
  const exitPad = MeshBuilder.CreateCylinder(`${kind}-exit-pad`, { diameter: 3.2, height: 0.05, tessellation: 24 }, scene);
  exitPad.position.set(x, y + 0.04, z - 16.5);
  exitPad.material = accent;
  exitPad.metadata = { cityAction: 'exit' };
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
    this.canvas = canvas;
    this.onStatus = onStatus;
    this.callbacks = callbacks;
    this.callbacks.initialLocation = recoverTownSpawn(normalizeVenuePosition(callbacks.initialLocation));
    this.isMobile = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;
    this.graphicsQuality = ['auto', 'ultra', 'balanced', 'eco'].includes(callbacks.graphicsQuality)
      ? callbacks.graphicsQuality : readGraphicsQuality();
    // 16x Anisotropic filtering trên Desktop giúp bề mặt đường, hoa văn cỏ và cảnh vật ở xa nét căng 100%
    this.textureAnisotropy = this.isMobile ? 4 : 16;
    Texture.DEFAULT_ANISOTROPIC_FILTERING_LEVEL = this.textureAnisotropy;
    this.resolutionController = new RenderResolutionController();
    this.autoGraphics = new AutoGraphicsController(this.isMobile);
    this.engine = new Engine(canvas, false, {
      preserveDrawingBuffer: false,
      stencil: !this.isMobile,
      // The rendering pipeline owns the MSAA resolve. Keeping the engine's
      // default framebuffer MSAA enabled as well duplicates raster/resolve
      // work on the full-size canvas.
      antialias: false,
      powerPreference: 'high-performance',
    });

    this.getQualityDpr = () => {
      return calculateRenderDpr({ quality: this.graphicsQuality,
        nativeDpr: window.devicePixelRatio || 1,
        width: this.canvas.clientWidth || window.innerWidth,
        height: this.canvas.clientHeight || window.innerHeight,
        mobile: this.isMobile,
        scale: this.isMobile ? this.autoGraphics.scale : 1,
        allowBelowNative: false });
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
    this.currentVenue = VENUES[this.callbacks.initialLocation?.venue] ? this.callbacks.initialLocation.venue : null;
    this.lastVenueTransition = 0;
    const construction = this.createSceneSteps();
    construction.next();
    this.worldBuilt = this.scheduleConstruction(construction, 'initial world construction', 100);
    if (new URLSearchParams(window.location.search).has('debug')) window.__farmDebugScene = this.scene;
    window.__farmDebug?.mark('Babylon scene created');
    this.keydown = event => {
      if (!this.player || !this.bootReady) return;
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
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
          this.boardBus(nearby.bus.id);
          return;
        }
      }
      if (event.code === 'KeyV' && this.busRoute?.isPlayerRiding()) {
        const active = this.toggleCinematicTour();
        this.onStatus?.(active ? 'Chế độ Điện Ảnh 360° Đang Bật' : 'Đã tắt Chế độ Điện Ảnh');
        return;
      }
      if (event.code === 'KeyE') {
        if (this.busRoute?.isPlayerRiding()) {
          if (!this.alightBus()) this.onStatus?.('Chỉ có thể xuống xe khi xe dừng tại trạm.');
          return;
        }
        if (event.code === 'KeyE' && this.currentVenue && this.interactContext()) return;
        if (event.code === 'KeyE' && !this.currentVenue && this.player) {
          const p = this.player.root.position;
          // Tương tác Bảng Vinh Danh Cổng Chào Khải Hoàn Môn Đại Lộ Bắc (mặt Nam z=24.5)
          if (Math.hypot(p.x, p.z - 24.5) <= 6.5 && p.z <= 25.5) {
            this.callbacks.onLeaderboard?.();
            return;
          }
          const v = BEACH_CONFIG.vendor;
          if (Math.hypot(p.x - v.x, p.z - v.z) <= v.interactionDistance) { this.callbacks.onNpcInteract?.('beach_fisher'); return; }
        }
        if (event.code === 'KeyE' && this.interactFarmGate()) return;
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
      this.resize();
      if (this.cinematic?.setQuality) {
        // An explicit preset switch may change AA once. Subsequent Auto
        // adjustments keep it stable, rather than retaining Ultra's 4x cost.
        this.cinematic.setQuality(preset === 'auto' ? this.autoGraphics.effects : preset, false);
      }
      if (this.shadows) {
        // Medium PCF is visually equivalent for this stylized low-poly scene
        // at the close shadow distance, but avoids the high-quality kernel's
        // extra shadow-map samples when the world is busy.
        this.shadows.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
        const targetMapSize = preset === 'ultra' && !this.isMobile ? 2048 : (preset === 'eco' ? 512 : 1024);
        if (this.shadows.mapSize !== targetMapSize) {
          this.shadows.mapSize = targetMapSize;
        }
      }
      this.callbacks.onQualityChange?.(preset);
    };

    this.boardBus = (busId) => {
      if (this.busRoute && this.player) {
        const nearby=this.busRoute.getNearbyBoardableBus(this.player.root.position);
        if(!nearby || nearby.bus.id!==busId || this.callbacks.onBusBoard?.(busId)===false)return false;
        const res = this.busRoute.boardBus(busId, this.player.root);
        if (res) this.onStatus?.('Đã lên xe buýt mui trần ngắm cảnh');
        return res;
      }
      return false;
    };

    this.alightBus = (force = false) => {
      if (this.busRoute && this.player) {
        const res = this.busRoute.alightBus(this.player.root, force);
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

    this.frameResize = new FrameSafeResize(this.engine, this.canvas, this.getQualityDpr);
    this.resize = () => {
      if (this.disposed || this.contextLost) return;
      this.frameResize.request();
    };
    this.handleOrientationOrResize = () => {
      this.resize();
      if (typeof window.scrollTo === 'function' && (window.scrollX !== 0 || window.scrollY !== 0)) {
        window.scrollTo(0, 0);
      }
      this.resizeTimers?.forEach(clearTimeout);
      this.resizeTimers = [
        setTimeout(() => {
          this.resize();
          if (typeof window.scrollTo === 'function' && (window.scrollX !== 0 || window.scrollY !== 0)) {
            window.scrollTo(0, 0);
          }
        }, 150),
        setTimeout(() => {
          this.resize();
          if (typeof window.scrollTo === 'function' && (window.scrollX !== 0 || window.scrollY !== 0)) {
            window.scrollTo(0, 0);
          }
        }, 450),
      ];
    };
    this.canvasResizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(this.resize) : null;
    this.canvasResizeObserver?.observe(this.canvas);
    window.addEventListener('resize', this.handleOrientationOrResize);
    window.addEventListener('orientationchange', this.handleOrientationOrResize);
    window.addEventListener('keydown', this.keydown);

    // Xử lý chạm/click trực tiếp vào Bảng Xếp Hạng, Cửa tiệm 3D, Bàn chơi Casino, Cửa thoát
    if (this.scene?.onPointerObservable) {
      this.pointerObserver = this.scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === 1 /* POINTERDOWN */ && pointerInfo.pickInfo?.hit) {
          let node = pointerInfo.pickInfo.pickedMesh;
          while (node) {
            if (node.metadata?.remotePlayerId) {
              this.callbacks.onPlayerProfile?.(node.metadata.remotePlayerId);
              break;
            }
            if (node.metadata?.interactive === 'leaderboard') {
              this.callbacks.onLeaderboard?.();
              break;
            }
            if (node.metadata?.cityAction === 'exit') {
              this.exitVenue();
              break;
            }
            if (node.metadata?.casinoTable) {
              this.callbacks.onCasinoTable?.(node.metadata.casinoTable);
              break;
            }
            if (node.metadata?.cityAction && node.metadata.cityAction !== 'exit') {
              this.callbacks.onVenue?.(node.metadata.cityAction);
              break;
            }
            if (node.metadata?.venue) {
              this.enterVenue(node.metadata.venue);
              break;
            }
            node = node.parent;
          }
        }
      });
    }

    // Gọi resize ngay lập tức và sau khi DOM ổn định để xóa bỏ hoàn toàn hiện tượng vỡ hạt pixel
    this.resize();
    this.resizeTimers = [60, 300].map(delay => setTimeout(() => this.resize(), delay));
    let renderFailed = false;
    this.engine.renderEvenInBackground = false;
    this.engine.runRenderLoop(() => {
      if (renderFailed || this.disposed || this.contextLost || document.hidden) return;
      try {
        if (!this.scene.activeCamera) throw new Error('Cảnh 3D không có camera hoạt động.');
        window.__farmDebug?.stage('scheduler.update');
        this.scheduler.update(this.isMobile ? (this.bootReady ? 1 : 3) : (this.bootReady ? 2.5 : 6));
        // The opaque start screen covers this canvas. Rendering thousands of
        // half-built meshes here starves construction and keeps boot at 7fps.
        // Only draw once the pipeline explicitly requests its first frame.
        if (!this.bootReady && !this.bootFrameRequested) {
          if (performance.now() - (this.lastDiagnosticsAt || 0) > 1000) {
            this.lastDiagnosticsAt = performance.now();
            window.__farmDebug?.snapshot(this.getDebugState());
          }
          return;
        }
        window.__farmDebug?.stage('scene.render');
        this.frameResize.flush();
        this.scene.render();
        if (this.bootReady && (this.graphicsQuality === 'auto' || this.graphicsQuality === 'ultra' || (this.isMobile && this.graphicsQuality !== 'eco')) &&
          !document.hidden && this.autoGraphics.sample(this.engine.getDeltaTime())) {
          if (this.graphicsQuality === 'auto') this.cinematic?.setQuality(this.autoGraphics.effects, true);
          if (this.graphicsQuality === 'ultra' && !this.isMobile && this.cinematic?.pipeline) {
            // Preserve native pixels. Under sustained load, reduce full-screen
            // multisampling before compromising image resolution.
            const supported = Math.max(1, this.engine.getCaps().maxMSAASamples || 1);
            const samples = Math.min(this.autoGraphics.level > 0 ? 2 : 4, supported);
            if (this.cinematic.pipeline.samples !== samples) this.cinematic.pipeline.samples = samples;
          }
          // Apply the mobile safety scale even for a manually selected preset;
          // sustained low frame rate on iOS must lower GPU memory pressure.
          if (this.isMobile) this.resize();
          if (this.shadows && (this.isMobile || this.graphicsQuality === 'ultra')) {
            const targetSize = this.isMobile
              ? (this.autoGraphics.level > 0 ? 512 : 1024)
              : (this.autoGraphics.level > 0 ? 1024 : 2048);
            if (this.shadows.mapSize !== targetSize) this.shadows.mapSize = targetSize;
            if (this.shadows.filteringQuality !== ShadowGenerator.QUALITY_MEDIUM) this.shadows.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
          }
        }
        if (this.bootReady && this.graphicsQuality === 'eco' && !document.hidden && this.resolutionController.sample(this.engine.getDeltaTime())) this.resize();
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
      this.contextLost = true;
      window.__farmRuntimeAudit?.record('context-lost');
      window.__farmDebug?.stopFrames();
      window.__farmDebug?.report(new Error('WebGL context lost'), 'WEBGL');
      this.callbacks.onFatalError?.('WebGL đã mất kết nối đồ họa. Hãy đóng các tab nặng rồi tải lại game.');
    });
    this.engine.onContextRestoredObservable.add(() => {
      this.contextLost = false;
      window.__farmRuntimeAudit?.record('context-restored');
      this.callbacks.onFatalError?.('Đồ họa đã phục hồi. Hãy tải lại game để đồng bộ cảnh; vị trí được server lưu giữ.');
    });
    this.startWorldBootPipeline();
    window.__farmRuntimeAudit?.record('world-created');
    onStatus('Kênh công cộng #01 · 24 online');
  }

  async startWorldBootPipeline() {
    const bootStartedAt = performance.now();
    try {
      const report = (phase, percentage, message, current) => this.callbacks.onBootProgress?.({ phase, percentage, message, current, total: 4 });
      const waitForRenderedFrame = () => new Promise((resolve, reject) => {
        if (this.renderFailure) { reject(this.renderFailure); return; }
        this.bootFrameRequested = true;
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
      report('index', 70, 'Đang chuẩn bị vùng hiển thị…', 2);
      if (this.currentVenue) {
        await this.ensureVenueBuilt(this.currentVenue);
        this.setVenueView(this.currentVenue);
        this.callbacks.onVenueState?.(this.currentVenue, VENUES[this.currentVenue].label);
      }
      this.renderIndex = installWorldRenderIndex(this.scene);
      await this.renderIndex.ready;
      if (this.scene.isDisposed) return;
      report('first-frame', 90, 'Đang xác nhận khung hình đầu tiên…', 3);
      this.resize();
      await waitForRenderedFrame();
      if (this.scene.isDisposed) return;
      this.bootReady = true;
      this.bootTimings = { playableMs: Math.round(performance.now() - bootStartedAt), sceneryComplete: false };
      report('ready', 100, 'Thế giới đã sẵn sàng!', 4);
      this.callbacks.onReady?.();
      // Decoration is not a prerequisite for movement, collisions or farming.
      // The same bounded scheduler fills it in after the first playable frame.
      await waitForRenderedFrame();
      if (this.scene.isDisposed) return;
      await this.populateBackgroundScenery();
      this.bootTimings.sceneryComplete = true;
      this.bootTimings.sceneryMs = Math.round(performance.now() - bootStartedAt);
    } catch (err) {
      if (this.disposed) return;
      console.error('[FarmWorld] Lỗi trong pipeline khởi động thế giới:', err);
      if (!this.renderFailure && !this.scene.isDisposed) {
        if (this.bootReady) window.__farmDebug?.report(err, 'BACKGROUND SCENERY');
        else this.callbacks.onFatalError?.(`Lỗi khởi động thế giới: ${err?.message || err}`);
      }
    }
  }

  async populateBackgroundScenery() {
      await new Promise(resolve => setTimeout(resolve, 0));
      await this.scheduleConstruction(createScenicLandscapesSteps(this.scene, this.foliage, this.shadows, this.foliageInstancing), 'scenic landscape');
      window.__farmDebug?.mark(`Scenic landscapes: ${this.scene.meshes.length} meshes`);
      await new Promise(resolve => setTimeout(resolve, 0));
      await this.scheduleConstruction(createVillageAmenitiesAndGreenbeltsSteps(this.scene, this.foliage, this.shadows, this.foliageInstancing), 'village amenities');
      window.__farmDebug?.mark(`Village amenities: ${this.scene.meshes.length} meshes`);
      if (this.isMobile) {
        // Keep authored town landmarks and the playable district; these broad
        // far-field layers add many more foliage batches after the first frame.
        this.roadsideMeadows = null;
      } else {
        await new Promise(resolve => setTimeout(resolve, 0));
        await this.scheduleConstruction(createInterVillagePlainsSteps(this.scene, this.foliage, this.shadows), 'distant scenery');
        this.roadsideMeadows = await this.scheduleConstruction(createRoadsideMeadowsSteps(this.scene, this.foliageInstancing), 'roadside meadow');
        await this.scheduleConstruction(createVillageWoodlandsSteps(this.foliageInstancing), 'village woodland');
      }
      // Đã loại bỏ hoàn toàn các tài nguyên rải vụn trên đất trống (cỏ/hoa diamond spikes), chỉ giữ cây cối và bụi rậm
      this.livingMeadow = null;
      window.__farmDebug?.mark(`Distance scenery: ${this.scene.meshes.length} meshes`);
      await new Promise(resolve => requestAnimationFrame(resolve));
      if (this.scene.isDisposed) return;
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
    scene.metadata = { ...(scene.metadata || {}), textureAnisotropy: this.textureAnisotropy, mobile: this.isMobile };
    installMaterialDirtyIndex(scene);
    // Several setup helpers (player home/corral) run before createScene()
    // returns. Publish the scene immediately so those helpers never receive
    // undefined through this.scene during a synchronized owned-farm boot.
    this.scene = scene;
    this.collisionSystem.attachSceneObstacles(scene);
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

    // Keep texture filtering bounded for the streamed world.
    scene.onNewTextureAddedObservable.add(tex => {
      tex.anisotropicFilteringLevel = this.textureAnisotropy;
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

    // === HỆ THỐNG CHIẾU SÁNG 4 TẦNG CHUẨN COZY GHIBLI & PLAY TOGETHER ===
    // 1. Tầng 1: Skylight vòm trời thiên thanh dịu nhẹ + Ground Bounce xanh ngọc cỏ nâng sáng vùng khuất (êm dịu, không cháy sáng)
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
    yield;
    ambient.intensity = 0.40;
    yield;
    ambient.diffuse = Color3.FromHexString('#dbeafe');
    yield;
    ambient.groundColor = Color3.FromHexString('#76a36c');
    yield;
    this.ambient = ambient;
    yield;

    // 2. Tầng 2: Key Sunlight vàng mật ong tự nhiên (Góc xiên 55 độ, sắc nét tươi sáng)
    const sun = new DirectionalLight('sun', new Vector3(-0.45, -0.85, -0.32), scene);
    yield;
    sun.position = new Vector3(35, 55, 25);
    yield;
    sun.intensity = 0.58;
    yield;
    sun.diffuse = Color3.FromHexString('#fff6e5');
    yield;
    // Frustum bóng đổ cố định 56m bám theo người chơi: 36.5 texels/m với 2048px map (chuẩn sắc nét Cozy Farmy)
    sun.shadowFrustumSize = this.isMobile ? 40 : 56;
    yield;
    sun.shadowMinZ = 1;
    yield;
    sun.shadowMaxZ = 130;
    yield;
    this.sun = sun;
    yield;

    // 3. Tầng 3: Rim Backlight phụ trợ tạo viền sáng khối Chibi đồ chơi Vinyl sắc nét
    const rimLight = new DirectionalLight('rim-light', new Vector3(0.45, -0.65, 0.45), scene);
    yield;
    rimLight.intensity = 0.10;
    yield;
    rimLight.diffuse = Color3.FromHexString('#fdf2e9');
    yield; // Viền sáng ngọc trai bồng bềnh
    rimLight.specular = Color3.FromHexString('#fef08a');
    yield;
    this.rimLight = rimLight;
    yield;

    // 4. Tầng 4: Shadow Generator mờ 30% mềm mại (PCF High/Medium)
    const shadowMapResolution = this.graphicsQuality === 'ultra' && !this.isMobile
      ? 2048
      : (this.graphicsQuality === 'eco' ? 512 : 1024);
    yield;
    const shadows = new ShadowGenerator(shadowMapResolution, sun);
    yield;
    shadows.usePercentageCloserFiltering = true;
    yield;
    shadows.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
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
      radius: this.isMobile ? 24 : 36,
      maxCasters: this.isMobile ? 24 : 48,
    });
    yield;
    this.rimLight = rimLight;
    yield;


    // === GIAI ĐOẠN A: PIPELINE ĐỒ HỌA ĐIỆN ẢNH AAA (ULTRA-CRISP) ===
    yield 'boot: rendering pipeline';
    this.cinematic = createCinematicRenderingPipeline(scene, camera, {
      quality: this.graphicsQuality === 'auto' ? this.autoGraphics.effects : this.graphicsQuality,
      lightweight: this.isMobile,
      stableSamples: this.graphicsQuality === 'auto',
    });
    yield;

    yield 'boot: atmosphere';
    this.atmosphere = createAtmosphere(scene, ambient, sun, shadows, this.cinematic);
    yield;
    this.chunkStreamer = getWorldChunkStreamer(scene);
    yield;
    this.fogStreaming = new FogStreamingController(scene, camera, {
      mobile: this.isMobile,
      getStreamingStats: () => this.chunkStreamer?.getStats?.(),
      getFps: () => this.engine.getFps(),
      presets: {
        performance: { start: this.isMobile ? 120 : 180, end: this.isMobile ? 320 : 480, clip: this.isMobile ? 360 : 520 },
        streaming: { start: this.isMobile ? 140 : 220, end: this.isMobile ? 380 : 560, clip: this.isMobile ? 420 : 600 },
        recovering: { start: this.isMobile ? 160 : 250, end: this.isMobile ? 420 : 620, clip: this.isMobile ? 460 : 660 },
        clear: { start: this.isMobile ? 180 : 280, end: this.isMobile ? 480 : 720, clip: this.isMobile ? 520 : 760 },
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
    yield 'boot: meadow texture';
    const meadowTex = createMeadowTexture(scene);
    yield;
    meadowTex.anisotropicFilteringLevel = this.textureAnisotropy;
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
    yield 'boot: player model';
    const player = createPlayer(scene, shadows, initialLocation || WORLD_LAYOUT.spawn, {
      getSpeed: () => this.callbacks.getPlayerSpeed?.() || FARM_CONFIG.playerSpeed,
      getVehicle: () => this.callbacks.getVehicle?.() || 'walk',
      getOutfitId: () => this.callbacks.getOutfitId?.() || 'starter',
      getOutfitColor: () => this.callbacks.getOutfitColor?.() || '#f8fafc',
      getCustomization: () => this.callbacks.getCustomization?.() || null,
      isRidingBus: () => this.busRoute?.isPlayerRiding() || false,
      getTerrainHeight: (x, z) => (this.currentVenue ? VENUES[this.currentVenue].interior.y : getTerrainHeight(x, z)),
      resolveMovement: (cx, cz, dx, dz) => {
        const vehicle = this.player?.getVehicleId?.() || 'walk';
        this.collisionSystem.playerRadius = vehicleCollisionRadius(vehicle);
        return this.collisionSystem.resolveMovement(cx, cz, dx, dz, this.currentVenue);
      },
      getCameraBasis: () => cameraMovementBasis(camera.alpha),
    });
    yield;
    this.player = player;
    scene.metadata = { ...scene.metadata, streamingPlayer: player.root };
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
    yield 'boot: farm animals';
    this.farmAnimals = yield* createFarmAnimalsSteps(scene, shadows);
    yield;

    yield 'boot: open world';
    this.openWorld = (yield* createOpenWorldSteps(scene, shadows, this.scheduler));
    yield;
      yield 'boot: countryside';
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

        yield `boot: farm proxy ${farm.id}`;
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
          const security = this.farmGateStates?.get(farm.id);
          if (security) gate.setOpen(security.open, security.owned, true);
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
        getGateState: id => this.farmGateStates?.get(id),
        onTheftProgress: state => this.callbacks.onTheftProgress?.(state),
        onFarmGateInteract: id => {
          if (id !== this.playerFarmId) this.onStatus?.('Chỉ chủ đất được đóng/mở cổng.');
          else if (!this.interactFarmGate()) this.onStatus?.('Hãy đứng gần cổng để đóng/mở.');
        },
        onHelpNeighbor: neighborFarmId => this.callbacks.onHelpNeighbor?.(neighborFarmId),
        onMailboxInteract: mailbox => {
          if (mailbox.isOwner) {
            this.onStatus?.('Hòm thư nông trại của bạn · Đang có 3 lời nhắn chúc mừng từ bạn bè!');
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
          if (approach.lengthSquared() <= 9) {
            action();
            return;
          }
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
      yield 'boot: animal pen';
      this.animalPen = createAnimalPen(scene, WORLD_LAYOUT.animalPen, shadows);
    yield;
      yield 'boot: bus route';
      this.busRoute = yield* createBusRouteSteps(scene, shadows);
    yield;
      this.villageElder = createVillageElderNPC(scene, shadows, WORLD_LAYOUT.villageElder, () => this.callbacks.onNpcInteract?.('village_elder'));
    yield;
      yield 'boot: foliage prototypes';
      this.foliageInstancing = new FoliageInstancingEngine(scene, shadows);
    yield;
      const foliage = createFoliageFactory(scene, shadows, this.foliageInstancing);
    yield;
      this.foliage = foliage;
    yield;
      this.villageGates = [];
      for (const village of WORLD_LAYOUT.villages) {
        yield `boot: village gate ${village.id}`;
        this.villageGates.push({ villageId: village.id, ...createVillageGate(scene, village.gate, village.name, shadows, village.id, foliage) });
        yield;
      }
    yield;

      // === ĐẠI THỐNG SÔNG UỐN LƯỢN HOÀN VŨ & HỆ THỐNG CẦU VƯỢT GIAO THÔNG ===
      yield 'boot: winding river';
      this.grandRiver = yield* createGrandWindingRiverSteps(scene, null, shadows);
    yield;
      this.collisionSystem.initRiverColliders(this.grandRiver.getCollisionBoxes());
    yield;
      // === HỆ THỐNG GIAO THÔNG LIÊN LÀNG & NÔNG TRẠI ĐỒNG BỘ 100% CHUẨN GHIBLI X PLAY TOGETHER ===
      // 1. Tuyến quốc lộ liên làng Đông - Tây (z = 86) nối trực tiếp 5 cổng làng hàng giữa & 2 trục vành đai Bình Minh
      (yield* createCountryRoadSteps(scene, {
        id: 'regional-highway-86',
        x: 0,
        z: 86,
        length: 1360,
        width: 6.0,
        isNorthSouth: false,
        shadows,
        hasCenterDashes: true,
        hasEdgeCurbs: true,
        hasStreetLamps: !this.isMobile,
        lampInterval: 64,
        intersections: [
          { pos: -660, width: 5.5, side: -1 }, // Nối Vành Đai Tây Làng Đồi Gió
          { pos: -600, width: 6.5, side: 0 },  // Cổng & Trục Giữa Làng Đồi Gió
          { pos: -540, width: 5.5, side: -1 }, // Nối Vành Đai Đông Làng Đồi Gió
          { pos: -360, width: 5.5, side: -1 }, // Nối Vành Đai Tây Làng Hoa Mai
          { pos: -300, width: 6.5, side: 0 },  // Cổng & Trục Giữa Làng Hoa Mai
          { pos: -240, width: 5.5, side: -1 }, // Nối Vành Đai Đông Làng Hoa Mai
          { pos: -122, width: 7.5, side: 1 },  // Nối Trục Cửa Tây Đô Thị Trung Tâm
          { pos: -60, width: 7.5, side: -1 },  // Nối thẳng Trục Tây Nông trại Bình Minh
          { pos: 0, width: 9.0, side: 0 },     // Nối Đại lộ Nam x = 0
          { pos: 60, width: 7.5, side: -1 },   // Nối thẳng Trục Đông Nông trại Bình Minh
          { pos: 122, width: 7.5, side: 1 },   // Nối Trục Cửa Đông Đô Thị Trung Tâm
          { pos: 212, width: 34, side: 0 },    // Vượt Đại Sông Hoàn Vũ (Đại Cầu Bình Minh - Bridge 86)
          { pos: 240, width: 5.5, side: -1 },  // Nối Vành Đai Tây Làng Ven Sông
          { pos: 300, width: 6.5, side: 0 },   // Cổng & Trục Giữa Làng Ven Sông
          { pos: 360, width: 5.5, side: -1 },  // Nối Vành Đai Đông Làng Ven Sông
          { pos: 540, width: 5.5, side: -1 },  // Nối Vành Đai Tây Làng An Nhiên
          { pos: 600, width: 6.5, side: 0 },   // Cổng & Trục Giữa Làng An Nhiên
          { pos: 660, width: 5.5, side: -1 },  // Nối Vành Đai Đông Làng An Nhiên
        ],
      }));
      // Bùng binh quay đầu xe 2 đầu Quốc Lộ 86 (không để đường cụt)
      createCulDeSac(scene, { id: 'cul-highway-86-west', x: -680, z: 86, radius: 6.5, shadows });
      createCulDeSac(scene, { id: 'cul-highway-86-east', x: 680, z: 86, radius: 6.5, shadows });
    yield;

      // 2. Tuyến quốc lộ liên làng phía Bắc (z = -234) nối 4 cổng làng hàng Bắc & vành đai khép kín
      (yield* createCountryRoadSteps(scene, {
        id: 'regional-highway-north',
        x: 0,
        z: -234,
        length: 1360,
        width: 6.0,
        isNorthSouth: false,
        shadows,
        hasCenterDashes: true,
        hasEdgeCurbs: true,
        hasStreetLamps: !this.isMobile,
        lampInterval: 64,
        intersections: [
          { pos: -660, width: 5.5, side: -1 }, // Nối Vành Đai Tây Làng Mộc Lan
          { pos: -600, width: 6.5, side: 0 },  // Cổng & Trục Giữa Làng Mộc Lan
          { pos: -540, width: 5.5, side: -1 }, // Nối Vành Đai Đông Làng Mộc Lan
          { pos: -360, width: 5.5, side: -1 }, // Nối Vành Đai Tây Làng Thanh Hà
          { pos: -300, width: 6.5, side: 0 },  // Cổng & Trục Giữa Làng Thanh Hà
          { pos: -240, width: 5.5, side: -1 }, // Nối Vành Đai Đông Làng Thanh Hà
          { pos: 0, width: 6.5, side: 0 },     // Giao cắt Trục Đô thị - Làng xã x = 0
          { pos: 205, width: 34, side: 0 },    // Vượt Đại Sông Hoàn Vũ (Cầu Bắc Tân Lộc - Bridge -234)
          { pos: 240, width: 5.5, side: -1 },  // Nối Vành Đai Tây Làng Tân Lộc
          { pos: 300, width: 6.5, side: 0 },   // Cổng & Trục Giữa Làng Tân Lộc
          { pos: 360, width: 5.5, side: -1 },  // Nối Vành Đai Đông Làng Tân Lộc
          { pos: 540, width: 5.5, side: -1 },  // Nối Vành Đai Tây Làng Hải Vân
          { pos: 600, width: 6.5, side: 0 },   // Cổng & Trục Giữa Làng Hải Vân
          { pos: 660, width: 5.5, side: -1 },  // Nối Vành Đai Đông Làng Hải Vân
        ],
      }));
      // Bùng binh quay đầu xe 2 đầu Quốc Lộ Bắc
      createCulDeSac(scene, { id: 'cul-highway-north-west', x: -680, z: -234, radius: 6.5, shadows });
      createCulDeSac(scene, { id: 'cul-highway-north-east', x: 680, z: -234, radius: 6.5, shadows });
    yield;

      // 3. Tuyến quốc lộ liên làng phía Nam ven biển (z = 406) nối Làng Thu Phong - Biển - Làng Hướng Dương
      for (const segment of beachRoadSegments()) {
        const segIntersections = [];
        if (segment.id === 'coast-west') {
          segIntersections.push(
            { pos: -360, width: 5.5, side: -1 }, // Vành đai Tây Thu Phong
            { pos: -300, width: 6.5, side: 0 },  // Cổng & Trục Thu Phong
            { pos: -240, width: 5.5, side: -1 }, // Vành đai Đông Thu Phong
          );
        } else if (segment.id === 'coast-east') {
          segIntersections.push(
            { pos: 218, width: 34, side: 0 },   // Vượt Đại Sông Hoàn Vũ (Cầu Nam Hướng Dương - Bridge 406)
            { pos: 240, width: 5.5, side: -1 },  // Vành đai Tây Hướng Dương
            { pos: 300, width: 6.5, side: 0 },   // Cổng & Trục Hướng Dương
            { pos: 360, width: 5.5, side: -1 },  // Vành đai Đông Hướng Dương
          );
        } else if (segment.id === 'coast-landward') {
          segIntersections.push({ pos: 0, width: 9.0, side: 0 });
        }
        (yield* createCountryRoadSteps(scene, {
          ...segment,
          width: 6.0,
          isNorthSouth: segment.isNorthSouth,
          shadows,
          hasCenterDashes: true,
          hasEdgeCurbs: true,
          hasStreetLamps: !this.isMobile,
          lampInterval: 64,
          intersections: segIntersections,
        }));
      }
    yield;

      // 4. Đường vành đai xương sống cực Bắc (z = -650)
      (yield* createCountryRoadSteps(scene, {
        id: 'world-backbone',
        x: 0,
        z: -650,
        length: 1360,
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
      createCulDeSac(scene, { id: 'cul-world-backbone-west', x: -680, z: -650, radius: 6.5, shadows });
      createCulDeSac(scene, { id: 'cul-world-backbone-east', x: 680, z: -650, radius: 6.5, shadows });
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
        lampInterval: 64,
        intersections: [
          { pos: -650, width: 7.0 },
          { pos: -394, width: 7.0 }, // Cổng Làng Phú Điền
          { pos: -234, width: 7.0 },
        ],
      }));
    yield;

      // 6. Mạng lưới đường nhánh, trục làng có vỉa hè, vành đai khép kín & bùng binh cho các làng nông trại
      for (const [_index, village] of (WORLD_LAYOUT.villages).entries()) {
        // Làng Bình Minh đã được khởi tạo bằng hệ thống đại lộ 8.5m & vành đai khép kín chuẩn Ghibli trong createOpenWorld.js.
        // Tuyệt đối không sinh đè trục spine 5.5m, cul-de-sac z=280 và lane 5.0m để tránh xung đột hình học và ngắt gờ.
        if (village.id === 'binh-minh') {
          continue;
        }

        const linkLength = village.gate.z + 650;
        // Trục nhánh từ vành đai cực Bắc vào cổng làng (ngắt gờ tại cổng làng để kết nối liền mạch)
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
          curbEndOffset: 3.0,
          intersections: [
            { pos: -650, width: 6.5 },
            { pos: -234, width: 6.5 },
            { pos: 86, width: 6.5 },
            { pos: 406, width: 6.5 },
          ],
        }));

        // Trục đường chính xuyên tâm làng (kèm vỉa hè người đi bộ và ngắt gờ tại 7 ngã tư)
        const spineLaneCrossings = [0, 1, 2, 3, 4, 5, 6].map(row => ({
          pos: village.offsetZ + 98 + row * 28,
          width: 5.5,
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
          curbStartOffset: 3.0,
          hasSidewalk: true,
          sidewalkWidth: 1.6,
          sidewalkStartOffset: 3.0,
          hasStreetLamps: !this.isMobile,
          lampInterval: 68,
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

        // Vạch sang đường đá ngà chuẩn Ghibli tại cổng làng (đồng bộ 100% với Làng Bình Minh)
        createZebraCrosswalk(scene, {
          id: `crosswalk-gate-${village.id}`,
          x: village.gate.x,
          z: village.gate.z,
          width: 7.5,
          depth: 2.8,
          isNorthSouth: !village.id.startsWith('phu-dien'),
        });

        // 7 tuyến đường ngang phân ô nội bộ mỗi làng (nối khép kín giữa Vành Đai Tây x - 60, Trục Giữa x và Vành Đai Đông x + 60)
        for (let row = 0; row <= 6; row += 1) {
          const laneZ = village.offsetZ + 98 + row * 28;
          // Mở gờ đá cho lối vào cổng của 4 lô trang trại trong hàng
          const driveways = [-45, -15, 15, 45].map(dx => ({
            pos: village.offsetX + dx,
            width: 5.5,
            side: row === 0 ? -1 : (row === 6 ? 1 : 0),
          }));

          (yield* createCountryRoadSteps(scene, {
            id: `lane-${village.id}-${row}`,
            x: village.offsetX,
            z: laneZ,
            length: 120,
            width: 5.0,
            isNorthSouth: false,
            shadows,
            hasCenterDashes: false,
            hasEdgeCurbs: true,
            curbStartOffset: 2.5,
            curbEndOffset: 2.5,
            hasStreetLamps: false,
            intersections: [
              { pos: village.offsetX - 60, width: 5.2 },
              { pos: village.offsetX, width: 6.0 },
              { pos: village.offsetX + 60, width: 5.2 },
              ...driveways,
            ],
          }));

          yield;
        }

        // Tuyến vành đai Tây và Đông bao bọc 2 bên làng: chạy từ Quốc Lộ cổng làng đến đường ngang số 7 (z=266)
        // Chiều dài 180m: bắt đầu từ v.gate.z và kết thúc khép kín tại mép ngoài lane-6, không để đầu đường cụt ra cỏ
        (yield* createCountryRoadSteps(scene, {
          id: `ring-west-${village.id}`,
          x: village.offsetX - 60,
          z: village.offsetZ + 176,
          length: 180,
          width: 5.0,
          isNorthSouth: true,
          shadows,
          hasCenterDashes: false,
          hasEdgeCurbs: true,
          curbStartOffset: 3.0,
          curbEndOffset: 0,
          hasStreetLamps: false,
          intersections: spineLaneCrossings.map(item => ({ ...item, side: 1 })),
        }));

        (yield* createCountryRoadSteps(scene, {
          id: `ring-east-${village.id}`,
          x: village.offsetX + 60,
          z: village.offsetZ + 176,
          length: 180,
          width: 5.0,
          isNorthSouth: true,
          shadows,
          hasCenterDashes: false,
          hasEdgeCurbs: true,
          curbStartOffset: 3.0,
          curbEndOffset: 0,
          hasStreetLamps: false,
          intersections: spineLaneCrossings.map(item => ({ ...item, side: -1 })),
        }));

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
      if (isRoadFootprintBlocked(t.x, t.z, 2.4 * t.scale, 2.4 * t.scale, 0.6)) continue;
      if (t.type === 'oak') foliage.createCloudTree(t.x, t.z, t.scale, true);
      else if (t.type === 'maple') foliage.createGoldenMaple(t.x, t.z, t.scale);
      else if (t.type === 'sakura') foliage.createSakuraTree(t.x, t.z, t.scale);

      yield;
    }
    yield;

    // Bụi cây cảnh cắt tỉa gọn gàng ven đường dẫn vào nông trại (đặt lùi ra ngoài vỉa hè)
    for (const [_index, fz] of ([54, 66, 78]).entries()) {
      if (!isRoadFootprintBlocked(-9.6, fz, 1.3, 1.3, 0.4)) foliage.createHydrangeaBush(-9.6, fz, 1.1, '#10b981');
      if (!isRoadFootprintBlocked(9.6, fz, 1.3, 1.3, 0.4)) foliage.createHydrangeaBush(9.6, fz, 1.1, '#10b981');

      yield;
    }
    yield;

    // Hiên nghỉ chân & ghế băng cho Bác Trưởng Làng tại vỉa hè phía Tây (x: -6.8, z: 76)
    if (!isRoadFootprintBlocked(-7.4, 76.8, 1.3, 0.8, 0.4)) {
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
    }
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
        const inWater = isPointInLakeOrRiver(x, z, 3.5);
        const onPlaza = Math.hypot(x, z) < 38;

        if (!onRoad && !onFarmPlots && !inWater && !onPlaza) {
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
      const nightFactor = this.atmosphere?.getNightFactor?.() ?? (this.atmosphere?.isNight?.() ? 0.85 : 0);
      player.setNightLighting?.(nightFactor);
      window.__farmDebug?.stage('atmosphere / water / bus');
      this.atmosphere?.update(dt);
      if (!this.currentVenue) this.fogStreaming?.update(dt);
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
        // Góc nhìn du ngoạn điện ảnh chuẩn game Play Together: cận cảnh người chơi đứng ngắm cảnh
        camera.radius += (11.5 - camera.radius) * Math.min(1, dt * 2.0);
        camera.beta += (1.20 - camera.beta) * Math.min(1, dt * 2.0);

        // Chế độ Điện Ảnh 360 độ tự động xoay nhẹ nhàng lướt ngắm cảnh
        if (this.cinematicTourActive) {
          camera.alpha += dt * 0.18;
        }
      }

      _TMP_VIEW_FORWARD.set(-Math.cos(camera.alpha), 0, -Math.sin(camera.alpha));
      const lookAhead = isRiding ? 4.0 : (this.currentVenue ? 0 : (this.cameraViewMode === 'farm' ? RENDER_CONFIG.farmCameraLookAhead : RENDER_CONFIG.cameraLookAhead));
      const targetPos = player.root.position;
      const targetYOffset = isRiding ? (RENDER_CONFIG.cameraTargetHeight + 0.8) : (this.currentVenue ? 1.05 : RENDER_CONFIG.cameraTargetHeight);

      if (this.currentVenue === 'casino' && this.focusedCasinoTable) {
        const vInt = VENUES.casino.interior;
        const tableCoords = CASINO_TABLE_ANCHORS;
        const tbl = tableCoords[this.focusedCasinoTable];
        if (tbl) {
          _TMP_DESIRED_TARGET.set(vInt.x + tbl.x, vInt.y + tbl.y, vInt.z + tbl.z);
        } else {
          _TMP_DESIRED_TARGET.copyFrom(targetPos);
          _TMP_DESIRED_TARGET.x += _TMP_VIEW_FORWARD.x * lookAhead;
          _TMP_DESIRED_TARGET.y += targetYOffset;
          _TMP_DESIRED_TARGET.z += _TMP_VIEW_FORWARD.z * lookAhead;
        }
      } else {
        _TMP_DESIRED_TARGET.copyFrom(targetPos);
        _TMP_DESIRED_TARGET.x += _TMP_VIEW_FORWARD.x * lookAhead;
        _TMP_DESIRED_TARGET.y += targetYOffset;
        _TMP_DESIRED_TARGET.z += _TMP_VIEW_FORWARD.z * lookAhead;
      }

      const followAmount = 1 - Math.exp(-RENDER_CONFIG.cameraFollowSpeed * Math.min(dt, 0.05));
      // Teleports should not leave the camera flying across the whole map.
      if (Vector3.DistanceSquared(cameraTarget.position, _TMP_DESIRED_TARGET) > 100) {
        cameraTarget.position.copyFrom(_TMP_DESIRED_TARGET);
      } else {
        Vector3.LerpToRef(cameraTarget.position, _TMP_DESIRED_TARGET, followAmount, cameraTarget.position);
      }

      if (this.currentVenue && VENUES[this.currentVenue]) {
        const vInt = VENUES[this.currentVenue].interior;
        const bounds = {
          minX: vInt.x - 11.2,
          maxX: vInt.x + 11.2,
          minZ: vInt.z - 17.0,
          maxZ: vInt.z + 8.2,
          minY: vInt.y + 0.8,
          maxY: vInt.y + 6.4,
        };
        const maxAllowedRadius = getClampedInteriorRadius(camera, cameraTarget.position, bounds, 5.4);
        if (camera.radius > maxAllowedRadius) {
          camera.radius = maxAllowedRadius;
        }
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
          const cached = [...this.farmChunks.values()].filter(chunk => (chunk.detailReady || chunk.buildingInProgress) && !chunk.evicting && chunk.farmId !== this.playerFarmId);
          const cacheLimit = this.isMobile ? selected.size + 2 : 8;
          if (cached.length > cacheLimit) {
            const victim = cached.filter(chunk => !chunk.wantsDetail && !chunk.evicting &&
              (this.isMobile || Math.hypot(chunk.farm.x - player.root.position.x, chunk.farm.z - player.root.position.z) > 260))
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
        // Preserve interpolation while hidden, but don't animate invisible rigs.
        if (!remote.isEnabled()) return;

        // Character LOD keeps the readable face and silhouette nearby while
        // removing only high-detail fringe ribbons for distant avatars.
        const distance = Math.hypot(remote.position.x - player.root.position.x, remote.position.z - player.root.position.z);
        const lod = distance > CHARACTER_LOD_CONFIG.lowDistance
          ? 2
          : distance > CHARACTER_LOD_CONFIG.mediumDistance ? 1 : 0;
        if (remote.metadata.characterLod !== lod) {
          remote.metadata.characterLod = lod;
          remote.metadata.human?.setLOD?.(lod);
        }
        const rigs = remote.metadata.vehicleRigs;
        if (rigs?.hasVehicle()) {
          const speed = dt > 0 ? Math.hypot(dx, dz) * follow / dt : 0;
          remote.metadata.pedalPhase = (remote.metadata.pedalPhase || 0) + speed * dt * 2.4;
          remote.metadata.human?.animate(dt, false, 0);
          rigs.update(dt, isMoving, speed, rotationDelta);
          applyVehiclePose(remote.metadata.human, rigs.getVehicleId(), isMoving, remote.metadata.pedalPhase, rigs.getRiderOffset());
        } else {
          if (remote.metadata.human) { remote.metadata.human.torsoNode.position.z = 0; remote.metadata.human.root.rotation.z = 0; }
          remote.metadata.human?.animate(dt, isMoving, 4.0);
        }
        remote.metadata.fishingRig?.update(dt);
      });
      window.__farmDebug?.stage('Babylon draw / shadows / postprocess');
    });
    yield;

    scene.blockMaterialDirtyMechanism = false;
    yield;
    return scene;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.engine.stopRenderLoop();
    this.resizeTimers?.forEach(clearTimeout);
    this.rejectPendingRender?.(new Error('World disposed'));
    this.rejectPendingRender = null;
    window.__farmRuntimeAudit?.record('world-disposed');
    this.scheduler?.clear();
    window.__farmDebug?.stopFrames();
    this.canvasResizeObserver?.disconnect();
    window.removeEventListener('resize', this.handleOrientationOrResize);
    window.removeEventListener('orientationchange', this.handleOrientationOrResize);
    window.removeEventListener('keydown', this.keydown);
    if (this.pointerObserver && this.scene?.onPointerObservable) {
      this.scene.onPointerObservable.remove(this.pointerObserver);
    }
    this.player?.dispose();
    this.renderIndex?.dispose();
    this.localNameplate?.dispose();
    this.remotePlayers?.forEach(remote => {remote.metadata?.nameplate?.dispose();remote.metadata?.fishingRig?.dispose();remote.metadata?.vehicleRigs?.dispose();});
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
    this.casinoTable?.dispose();
    this.scene.dispose();
    this.engine.dispose();
  }

  setClock(clock) {
    this.atmosphere?.setTime(clock);
  }

  resetCameraView() {
    if (!this.camera) return;
    this.camera.alpha = RENDER_CONFIG.cameraAlpha;
    this.camera.beta = this.cameraViewMode === 'farm' ? RENDER_CONFIG.farmCameraBeta : RENDER_CONFIG.cameraBeta;
    const baseRadius = this.cameraViewMode === 'farm' ? RENDER_CONFIG.farmCameraRadius : RENDER_CONFIG.cameraRadius;
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

  startFishingCast(options = {}) {
    if(this.camera && !this.fishingCamera){
      this.fishingCamera={radius:this.camera.radius,beta:this.camera.beta};
      this.camera.radius=Math.min(this.camera.radius,26);this.camera.beta=.95;
    }
    this.player?.startFishingCast?.(options);
  }

  setFishingPhase(phase, timeUntilBiteMs = null) {
    this.player?.setFishingPhase?.(phase, timeUntilBiteMs);
  }

  playFishingReel() {
    this.player?.playFishingReel?.();
  }

  finishFishingCatch(success = true, fish = null) {
    this.player?.finishFishingCatch?.(success,fish);
    this.restoreFishingCamera();
  }

  clearFishing() {
    this.player?.clearFishing?.();
    this.restoreFishingCamera();
  }

  restoreFishingCamera() {
    if(this.fishingCamera && this.camera){this.camera.radius=this.fishingCamera.radius;this.camera.beta=this.fishingCamera.beta;}
    this.fishingCamera=null;
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
        remote.metadata?.fishingRig?.dispose();
        remote.metadata?.vehicleRigs?.dispose();
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
        remote = createRemoteAvatar(this.scene, player.playerId, player.name, avatarAppearance(player.outfit, player.customization), this.shadows);
        remote.metadata ||= {};
        remote.metadata.remotePlayerId = player.playerId;
        remote.position.set(player.x, effectiveY, player.z);
        this.remotePlayers.set(player.playerId, remote);
      }
      if (remote.metadata.playerName !== player.name) {
        remote.metadata.playerName = player.name;
        remote.metadata.nameplate?.setName(player.name);
      }
      if (!player.customization && remote.metadata.lastOutfit !== (player.outfit || 'starter')) {
        const appearance = avatarAppearance(player.outfit);
        remote.metadata.human?.setOutfit?.(appearance.outfitId, appearance.outfitColor);
        remote.metadata.lastOutfit = appearance.outfitId;
      }
      if (player.customization && remote.metadata.lastCustomization !== JSON.stringify(player.customization)) {
        remote.metadata.lastCustomization = JSON.stringify(player.customization);
        remote.metadata.human?.applyCustomization?.(player.customization);
      }
      remote.metadata.venue = player.venue || null;
      const vehicle = player.vehicle || 'walk';
      if (vehicle !== 'walk' && !remote.metadata.vehicleRigs) remote.metadata.vehicleRigs = createVehicleRigs(this.scene, remote, this.shadows);
      remote.metadata.vehicleRigs?.setVehicle(vehicle);
      if(player.fishing && remote.metadata.fishingId!==player.fishing.id) {
        remote.metadata.fishingRig ||= createFishingRig(this.scene,remote,remote.metadata.human);
        remote.metadata.fishingId=player.fishing.id;
        remote.metadata.fishingRig.startCast(player.fishing.castDistance,'basic_cast',player.fishing.target);
      }
      if(player.fishing) remote.metadata.fishingRig.setPhase(player.fishing.phase==='fighting'?'reel':serverTime>=player.fishing.biteAt?'bite':'waiting');
      else if(remote.metadata.fishingId){remote.metadata.fishingId=null;remote.metadata.fishingRig.dispose();remote.metadata.fishingRig=null;}
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
    authoritative = recoverTownSpawn(normalizeVenuePosition(authoritative),{legacyDefault:false,clearance:.45});
    // An accepted move echoes an older position; applying it would pull the
    // locally moving player backwards on every network round trip.
    if (authoritative?.accepted === true) return;
    if (!this.player || !Number.isFinite(authoritative?.x) || !Number.isFinite(authoritative?.z)) return;
    // A rejected doorway move/fast-travel reply changes space as well as
    // coordinates. Never keep the interior UI/culling on an outdoor position.
    if (Object.hasOwn(authoritative, 'venue') && (authoritative.venue || null) !== this.currentVenue) {
      this.player.stop();
      this.player.root.position.set(authoritative.x, authoritative.y || 0, authoritative.z);
      this.syncVenueFromPosition(authoritative);
      return;
    }
    const dx = authoritative.x - this.player.root.position.x;
    const dz = authoritative.z - this.player.root.position.z;
    const error = Math.hypot(dx, dz);
    // A rejection must return to a valid starting point even for centimetre
    // errors. Partial correction repeatedly resubmitted an invalid endpoint.
    const rejected = authoritative.accepted === false;
    if (error <= (rejected ? 0.001 : 0.35)) return;
    const targetY = (Number.isFinite(authoritative.y) && authoritative.y !== 0) ? authoritative.y : (VENUES[this.currentVenue]?.interior.y ?? getTerrainHeight(authoritative.x, authoritative.z));
    if (performance.now() - (this.lastCorrectionReportAt || 0) > 15000) {
      this.lastCorrectionReportAt = performance.now();
      window.__farmDebug?.report(`Server từ chối/correct bước di chuyển, lệch ${error.toFixed(2)}m; lý do: ${authoritative.reason || 'server không cung cấp'}. Vị trí: ${authoritative.x}, ${authoritative.z}.`, 'SERVER MOVEMENT CORRECTION');
    }
    if (rejected || error > 4) {
      this.player.root.position.set(authoritative.x, targetY, authoritative.z);
    } else {
      this.player.root.position.x += dx * 0.35;
      this.player.root.position.y += (targetY - this.player.root.position.y) * 0.35;
      this.player.root.position.z += dz * 0.35;
    }
    if (Number.isFinite(authoritative.rotation)) this.player.root.rotation.y = authoritative.rotation;
  }

  setPlayerOutfit(idOrColor, color) { this.player?.setOutfit(idOrColor, color); }
  setPlayerCustomization(customization) { this.player?.applyCustomization?.(customization); }

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

  enterVenue(kind, immediate = false) {
    const venue = VENUES[kind];
    if (!venue || !this.player) return;
    const target = new Vector3(venue.entrance.x, 0, venue.entrance.z);
    this.onStatus?.(`Đang đi tới cửa ${venue.label}…`);
    if (immediate || this.getDistanceTo(venue.entrance.x, venue.entrance.z) <= 5.0) {
      this.completeVenueEntry(kind);
    } else {
      this.player.moveTo(target, () => this.completeVenueEntry(kind));
    }
  }

  completeVenueEntry(kind) {
    const venue = VENUES[kind];
    if (!venue || !this.player || this.currentVenue) return;
    if (!this.venueMeshesMap.has(kind)) {
      this.onStatus?.(`Đang dựng nội thất ${venue.label}…`);
      this.ensureVenueBuilt(kind).then(() => {
        if (!this.scene.isDisposed) this.completeVenueEntry(kind);
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
      const exitDistance = Math.min(
        Math.hypot(position.x - venue.interior.x, position.z - (venue.interior.z - 16.2)),
        Math.hypot(position.x - (venue.interior.x - 9), position.z - (venue.interior.z - 8.8))
      );
      if (exitDistance <= 3.2) {
        this.exitVenue();
        return;
      }
      if (this.currentVenue === 'casino') {
        const tables = [
          { kind: 'tai-xiu', label: 'Bàn Tài Xỉu Sic Bo', x: venue.interior.x - 6.5, z: venue.interior.z - 3.5 },
          { kind: 'bau-cua', label: 'Bàn Bầu Cua Tôm Cá', x: venue.interior.x + 6.5, z: venue.interior.z - 3.5 },
          { kind: 'bai-cao', label: 'Bàn Bài Cào 3 Lá', x: venue.interior.x - 6.5, z: venue.interior.z + 4.5 },
          { kind: 'tien-len', label: 'Bàn Tiến Lên Miền Nam', x: venue.interior.x + 6.5, z: venue.interior.z + 4.5 },
        ];
        let foundTable = null;
        for (const t of tables) {
          if (Math.hypot(position.x - t.x, position.z - t.z) <= 3.5) {
            foundTable = t;
            break;
          }
        }
        if (foundTable?.kind !== this.nearbyCasinoTable?.kind) {
          this.nearbyCasinoTable = foundTable;
          this.callbacks.onNearbyCasinoTable?.(foundTable ? foundTable.kind : null, foundTable ? foundTable.label : null);
        }
      }
      return;
    }
    for (const [kind, venue] of Object.entries(VENUES)) {
      if (Math.hypot(position.x - venue.entrance.x, position.z - venue.entrance.z) <= 3.8) {
        this.completeVenueEntry(kind);
        return;
      }
    }
  }

  updateFarmZoneProximity() {
    if (!this.player) return;
    const nearbyGate = this.getNearbyFarmGate();
    const gateKey = nearbyGate ? `${nearbyGate.farmId}:${nearbyGate.open}` : '';
    if (gateKey !== this.lastNearbyGateKey) { this.lastNearbyGateKey = gateKey; this.callbacks.onNearbyFarmGate?.(nearbyGate); }
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
  getNearbyFarmGate() {
    if (!this.player || this.currentVenue || !this.playerFarmId) return null;
    const p = farmGatePosition(this.playerFarmId);
    if (!p || Math.hypot(this.player.root.position.x - p.x, this.player.root.position.z - p.z) > SHARED_FARM_CONFIG.security.gate.interactionDistance) return null;
    const state = this.farmGateStates?.get(this.playerFarmId);
    return state ? { farmId: this.playerFarmId, open: state.open } : null;
  }
  interactFarmGate() {
    const gate = this.getNearbyFarmGate();
    if (!gate) return false;
    this.callbacks.onFarmGateAction?.({ farmId: gate.farmId, open: !gate.open });
    return true;
  }
  applyFarmGate({ farmId, open, owned = true, updatedAt = 0 }, refresh = true) {
    this.farmGateStates ||= new Map();
    const previous = this.farmGateStates.get(farmId);
    if (previous && previous.updatedAt > updatedAt) return;
    this.farmGateStates.set(farmId, { open, owned, updatedAt });
    this.collisionSystem.setFarmGate(farmId, open, owned);
    this.farmGates?.find(g => g.farmId === farmId)?.setOpen(open, owned);
    if (this.farming) { this.farming.gateStates ||= new Map(); this.farming.gateStates.set(farmId, { open, owned }); }
    if (refresh) this.updateFarmZoneProximity();
  }

  setOutdoorWorldEnabled(enabled) {
    const next = Boolean(enabled);
    if (this._outdoorWorldVisible === next) return;
    this._outdoorWorldVisible = next;
    this.venueVisibility ||= new VenueVisibility(this.scene, () => [this.player?.root, ...this.remotePlayers.values()]);
    const changeVisibility = () => next ? this.venueVisibility.show() : this.venueVisibility.hide();
    if (window.__farmDebug) window.__farmDebug.measure('venue: outdoor hierarchy visibility', changeVisibility);
    else changeVisibility();
    // Root visibility keeps each child's existing streaming/LOD state intact.
    // Foliage work pauses without rewriting thousands of local mesh flags.
    if (this.foliageInstancing) { this.foliageInstancing._enabled = next; if (next) this.foliageInstancing.lastChunkUpdate = -1000; }
  }

  focusCasinoTable(gameKind = null, preview = false) {
    const changed = this.focusedCasinoTable !== gameKind || (this.casinoTablePreview && !preview);
    this.casinoTablePreview = preview;
    this.focusedCasinoTable = gameKind;
    if (!this.player || !this.currentVenue || this.currentVenue !== 'casino') return;
    const vInt = VENUES.casino.interior;
    const tableCoords = CASINO_TABLE_ANCHORS;
    const table = tableCoords[gameKind];
    // In table mode show only the selected game's furniture. Restore the
    // complete hall when returning to exploration.
    for (const game of Object.keys(CASINO_TABLE_ANCHORS)) {
      this.scene?.getTransformNodeByName(`casino-table-3d-${game}`)?.setEnabled(!table || !this.casinoScreenActive || game === gameKind);
    }
    // First-person table view: the avatar must not clip through the felt.
    this.player.root.setEnabled(!(table && this.casinoScreenActive));
    if (table) {
      if (changed && !preview) {
        this.player.stop();
        this.player.root.position.set(vInt.x + table.seatX, vInt.y, vInt.z + table.seatZ);
      }
      this.player.root.rotation.y = table.seatYaw;
      this.camera.radius = 9.6;
      this.camera.beta = 0.88;
      this.camera.alpha = -Math.PI / 2;
      this.camera.lowerBetaLimit = 0.78;
      this.camera.upperBetaLimit = 1.0;
    } else {
      this.camera.radius = 7.2;
      this.camera.beta = 1.12;
      this.camera.alpha = -Math.PI / 2;
    }
  }

  setCasinoRoom(room) {
    this.casinoRoom = room;
    if (this.casinoVisible && room && !this.casinoTable) this.casinoTable = new CasinoTableView(this.scene);
    this.casinoTable?.update(room);
    this.casinoTable?.setEnabled(this.casinoVisible && !!room);
    if (this.casinoVisible && this.casinoScreenActive) {
      this.focusCasinoTable(room?.game || null);
    }
  }

  setCasinoScreenActive(active) {
    this.casinoScreenActive = !!active;
    this.player?.setVirtualInput(0, 0);
    if (!active) {
      this.player?.root.setEnabled(true);
      this.focusCasinoTable(null);
      if (this.currentVenue === 'casino' && this.camera) {
        this.camera.lowerBetaLimit = 0.60;
        this.camera.upperBetaLimit = 1.35;
      }
    } else if (this.casinoRoom) {
      this.focusCasinoTable(this.casinoRoom.game);
    }
  }

  setVenueView(kind = null) {
    if (kind && !this.outdoorCameraView) {
      this.outdoorCameraView = {
        alpha: this.camera.alpha,
        beta: this.camera.beta,
        radius: this.camera.radius,
      };
    }
    this.casinoVisible = kind === 'casino';
    this.setCasinoRoom(this.casinoRoom);
    // Interior point lights are scene-level objects rather than meshes, so
    // toggle them explicitly with the venue. This keeps the new game-lounge
    // lighting isolated from the outdoor world and other interiors.
    this.scene.lights
      .filter(light => light.metadata?.interiorVenue)
      .forEach(light => light.setEnabled(light.metadata.interiorVenue === kind));
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
      // 1. Cull outdoor world 100%
      this.setOutdoorWorldEnabled(false);

      // Keep the player's outside orientation. The per-frame wall clamp only
      // shortens camera distance when a wall would otherwise hide the room.
      this.camera.lowerRadiusLimit = 2.4;
      this.camera.upperRadiusLimit = RENDER_CONFIG.cameraMaxRadius;
      this.camera.lowerBetaLimit = RENDER_CONFIG.cameraMinBeta;
      this.camera.upperBetaLimit = RENDER_CONFIG.cameraMaxBeta;

      if (!this._outdoorClearColor && this.scene.clearColor) {
        this._outdoorClearColor = this.scene.clearColor.clone();
      }
      if (this._outdoorFogEnabled === undefined) {
        this._outdoorFogEnabled = this.scene.fogEnabled;
        this._outdoorFogStart = this.scene.fogStart;
        this._outdoorFogEnd = this.scene.fogEnd;
      }
      // Keep the same shader feature set indoors: switching fogEnabled marks
      // every material dirty and compiles a new shader variant on entry.
      // Distance uniforms remove interior fog without that global invalidation.
      this.scene.fogStart = 100000;
      this.scene.fogEnd = 100001;
      this.scene.clearColor = new Color4(0.07, 0.05, 0.10, 1.0);

      // 3. Isolated interior lighting - prevent blinding outdoor sun from burning out room
      if (this.sun) {
        if (this._outdoorSunIntensity === undefined) {
          this._outdoorSunIntensity = this.sun.intensity;
        }
        this.sun.intensity = 0.08;
      }
      if (this.rimLight) {
        if (this._outdoorRimIntensity === undefined) {
          this._outdoorRimIntensity = this.rimLight.intensity;
        }
        this.rimLight.intensity = 0.02;
      }
      if (this.ambient) {
        if (this._outdoorAmbientIntensity === undefined) {
          this._outdoorAmbientIntensity = this.ambient.intensity;
          this._outdoorAmbientDiffuse = this.ambient.diffuse.clone();
          this._outdoorAmbientGround = this.ambient.groundColor.clone();
        }
        this.ambient.intensity = kind === 'casino' ? 0.85 : 0.68;
        this.ambient.diffuse = Color3.FromHexString('#fdf6ed');
        this.ambient.groundColor = Color3.FromHexString('#b5bfd0');
      }
    } else {
      // 1. Restore outdoor world
      this.setOutdoorWorldEnabled(true);

      // 2. Restore the exact view from before entering, not the default angle.
      this.camera.lowerRadiusLimit = RENDER_CONFIG.cameraMinRadius;
      this.camera.upperRadiusLimit = RENDER_CONFIG.cameraMaxRadius;
      this.camera.lowerBetaLimit = RENDER_CONFIG.cameraMinBeta;
      this.camera.upperBetaLimit = RENDER_CONFIG.cameraMaxBeta;
      if (this.outdoorCameraView) {
        this.camera.alpha = this.outdoorCameraView.alpha;
        this.camera.beta = this.outdoorCameraView.beta;
        this.camera.radius = this.outdoorCameraView.radius;
        this.camera.inertialAlphaOffset = 0;
        this.camera.inertialBetaOffset = 0;
        this.camera.inertialRadiusOffset = 0;
        this.outdoorCameraView = null;
      }
      if (this._outdoorClearColor) {
        this.scene.clearColor = this._outdoorClearColor;
      }
      if (this._outdoorFogEnabled !== undefined) {
        this.scene.fogStart = this._outdoorFogStart;
        this.scene.fogEnd = this._outdoorFogEnd;
      }
      // 3. Restore outdoor lighting
      if (this.sun && this._outdoorSunIntensity !== undefined) {
        this.sun.intensity = this._outdoorSunIntensity;
      }
      if (this.rimLight && this._outdoorRimIntensity !== undefined) {
        this.rimLight.intensity = this._outdoorRimIntensity;
      }
      if (this.ambient && this._outdoorAmbientIntensity !== undefined) {
        this.ambient.intensity = this._outdoorAmbientIntensity;
        if (this._outdoorAmbientDiffuse) this.ambient.diffuse = this._outdoorAmbientDiffuse;
        if (this._outdoorAmbientGround) this.ambient.groundColor = this._outdoorAmbientGround;
      }
    }
  }

  interactContext() {
    if (!this.player) return false;
    const position = this.player.root.position;
    if (this.currentVenue) {
      const venue = VENUES[this.currentVenue];
      if (this.currentVenue === 'casino' && this.nearbyCasinoTable) {
        this.callbacks.onCasinoTable?.(this.nearbyCasinoTable.kind);
        return true;
      }
      const counterZ = this.currentVenue === 'casino' ? 9.5 : 4.8;
      const distanceToCounter = Math.hypot(position.x - venue.interior.x, position.z - (venue.interior.z + counterZ));
      const distanceToExit = Math.min(
        Math.hypot(position.x - venue.interior.x, position.z - (venue.interior.z - 16.2)),
        Math.hypot(position.x - (venue.interior.x - 9), position.z - (venue.interior.z - 8.8))
      );
      if (distanceToCounter <= 5.5) { this.callbacks.onVenue?.(this.currentVenue); return true; }
      if (distanceToExit <= 4.5) { this.exitVenue(); return true; }
      this.onStatus?.(this.currentVenue === 'casino' ? 'Đi tới bàn chơi, quầy Chú Lộc hoặc cửa ra rồi bấm E' : 'Đi tới quầy giao dịch hoặc cửa ra rồi bấm E');
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
    this.focusCasinoTable(null);
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
      casino: {
        venue: this.currentVenue,
        screenActive: !!this.casinoScreenActive,
        joined: !!this.casinoRoom,
        game: this.casinoRoom?.game || null,
        phase: this.casinoRoom?.round?.phase || null,
        deadline: this.casinoRoom?.round?.deadline || null,
        participating: this.casinoRoom?.round?.participating || false,
        occupied: this.casinoRoom?.seatList?.filter(Boolean).length || 0,
        ready: this.casinoRoom?.seatList?.filter(seat => seat?.ready).length || 0,
        propsEnabled: this.casinoTable?.root?.isEnabled() || false,
        lastStateAgeMs: this.casinoStateReceivedAt ? Date.now() - this.casinoStateReceivedAt : null,
        lastAction: this.casinoLastAction || null,
        lastError: this.casinoLastError || null,
      },
      bootTimings: this.bootTimings || null,
      fps: Math.round(this.engine.getFps()),
      graphicsQuality: this.graphicsQuality,
      renderWidth: this.engine.getRenderWidth(),
      renderHeight: this.engine.getRenderHeight(),
      nativeDpr: window.devicePixelRatio || 1,
      renderDpr: this.engine.getRenderWidth() / Math.max(1, this.canvas.clientWidth),
      antialiasSamples: this.cinematic?.pipeline?.samples ?? 1,
      fxaa: this.cinematic?.pipeline?.fxaaEnabled ?? false,
      sharpen: this.cinematic?.pipeline?.sharpenEnabled ?? false,
      resolutionScale: (this.graphicsQuality === 'auto' ? this.autoGraphics.scale : this.resolutionController.scale).toFixed(2),
      x: position.x.toFixed(1),
      z: position.z.toFixed(1),
      chunk: `${chunk.x}:${chunk.z}`,
      meshes: this.scene.meshes.length,
      textures: this.scene.textures.length,
      materials: this.scene.materials.length,
      geometries: this.scene.geometries.length,
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
      lakeRendering: {
        shore: this.openWorld?.romanticLake?.root.metadata ?? null,
        district: this.openWorld?.lakeDistrict?.root.metadata ?? null,
      },
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
    for (const profile of farms) this.farmBuildings?.get(profile.farmId)?.herd?.sync(profile.livestock || [], profile.animalPens);
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
    spawnPoint = recoverTownSpawn(normalizeVenuePosition(spawnPoint));
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
    if (nextVenue && !this.venueMeshesMap.has(nextVenue)) {
      this.ensureVenueBuilt(nextVenue).then(() => {
        if (!this.scene.isDisposed && this.currentVenue === nextVenue) this.setVenueView(nextVenue);
      }).catch(error => this.callbacks.onFatalError?.(`Không thể khôi phục nội thất: ${error.message}`));
    } else this.setVenueView(nextVenue);
    this.callbacks.onVenueState?.(nextVenue, nextVenue ? VENUES[nextVenue].label : null);
  }

  restorePlayerPosition(position) {
    position = recoverTownSpawn(normalizeVenuePosition(position));
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
        const security = this.farmGateStates?.get(farmId);
        if (security) gate.setOpen(security.open, security.owned, true);
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
    // Stop obsolete construction before disposing its partially built meshes.
    this.scheduler.cancel(`farm-build-${chunk.farmId}`);
    this.scheduler.cancel(`farm-gate-${chunk.farmId}`);
    this.scheduler.cancel(`farm-buildings-${chunk.farmId}`);
    chunk.gatePending = false;
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
    })(), this.isMobile ? 20 : -1, `farm-evict-${chunk.farmId}`);
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
      showDecorativeAnimal: false,
      animalType: (farm.lotNumber || 1) % 2 === 0 ? 'alpaca' : 'cow',
      width: corralAnchor.width,
      depth: corralAnchor.depth,
    });

    const herd = new OwnedHerd(scene, corral.root);
    const herdProfile = world.publicFarms?.find(profile => profile.farmId === farmId);
    herd.sync(herdProfile?.livestock || [], herdProfile?.animalPens);
    world.farmBuildings.set(farmId, {
      herd,
      home,
      barn: corral,
      homeTier,
      barnLevel,
      ownerName,
      dispose() { herd.dispose(); home?.dispose?.(); corral?.dispose?.(); },
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
    for (const lot of lots) this.applyFarmGate({ farmId: lot.farmId, open: lot.gateOpen === true, owned: Boolean(lot.ownerId), updatedAt: lot.gateUpdatedAt || 0 }, false);
    this.updateFarmZoneProximity();
    this.updateFarmSigns(this.remotePlayerState || []);
  }

  showChatBubble(playerId, text = '', emoteChar = null) {
    let targetRoot = null;
    const myId = this.callbacks.getPlayerId?.() || this.player?.id;
    const isMe = (!playerId || (myId && playerId === myId) || (this.player && playerId === this.player.id));
    const lower = (text || '').toLowerCase();
    const isWave = emoteChar === 'wave' || emoteChar === 'hello' || lower.includes('chào') || lower.includes('hello') || lower.includes('hi ');
    const isCheer = ['party', 'celebrate', 'heart', 'sparkle', 'trophy'].includes(emoteChar) || lower.includes('vui') || lower.includes('tuyệt') || lower.includes('haha');

    if (isMe) {
      targetRoot = this.player?.root;
      if (isWave) {
        this.player?.playAction('wave');
      } else if (isCheer) {
        this.player?.playAction('harvest');
      }
    } else {
      targetRoot = this.remotePlayers.get(playerId);
      if (!targetRoot) {
        for (const [rId, remote] of this.remotePlayers) {
          if (rId === playerId || remote.metadata?.playerId === playerId || remote.name === `remote-player-${playerId}`) {
            targetRoot = remote;
            break;
          }
        }
      }
      if (targetRoot?.metadata?.human) {
        if (isWave) {
          targetRoot.metadata.human.playAction('wave');
        } else if (isCheer) {
          targetRoot.metadata.human.playAction('harvest');
        }
      }
    }
    if (!targetRoot) {
      if (isMe) targetRoot = this.player?.root;
      else return;
    }
    if (!targetRoot) return;

    const senderName = isMe ? 'Bạn' : (targetRoot.metadata?.playerName || 'Người chơi');
    showCharacterChatBubble(this.scene, targetRoot, {
      text,
      emote: emoteChar,
      isLocal: isMe || targetRoot === this.player?.root,
      senderName,
    });
  }

  showEmote(playerId, emoteChar) {
    this.showChatBubble(playerId, '', emoteChar);
  }
}
