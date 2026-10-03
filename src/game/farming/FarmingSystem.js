import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents.js';

import { CROPS } from '../economy/GameProgress.js';
import { createCropMesh, spawnHarvestParticles, spawnDirtDigParticles, spawnWaterSplash } from './createCropMesh.js';
import { farmAudio } from '../audio/FarmAudioSystem.js';
import { createSoilTexture } from '../world/createStylizedTextures.js';

function worldPosition(tile) {
  return tile?.getAbsolutePosition?.().clone() || tile?.position?.clone();
}

function makeMaterial(scene, name, hex) {
  const value = new StandardMaterial(name, scene);
  value.diffuseColor = Color3.FromHexString(hex);
  value.specularColor = Color3.Black();
  return value;
}

export class FarmingSystem {
  constructor(scene, tiles, notify, farmId = null, controls = {}) {
    this.scene = scene;
    this.tiles = tiles;
    this.notify = notify;
    this.controls = controls;
    this.farmId = farmId;
    this.playerFarmId = controls.playerFarmId || farmId;
    this.getCrop = controls.getCrop || (() => 'carrot');
    this.getUnlockedPlots = controls.getUnlockedPlots || (() => 12);
    this.onAction = controls.onAction || (() => true);
    this.tool = 'hand';
    this.state = {};
    this.crops = new Map();
    this.pendingActions = new Set();

    const matEmpty = makeMaterial(scene, 'soil-empty', '#ffffff');
    matEmpty.diffuseTexture = createSoilTexture(scene, 512, false);
    matEmpty.ambientColor = new Color3(0.4, 0.4, 0.4);

    const matTilled = makeMaterial(scene, 'soil-tilled', '#ffffff');
    matTilled.diffuseTexture = createSoilTexture(scene, 512, false);
    matTilled.ambientColor = new Color3(0.32, 0.32, 0.32);

    const matWatered = makeMaterial(scene, 'soil-watered', '#ffffff');
    matWatered.diffuseTexture = createSoilTexture(scene, 512, true);
    matWatered.ambientColor = new Color3(0.28, 0.28, 0.28);
    matWatered.specularColor = new Color3(0.2, 0.2, 0.2);

    this.materials = {
      empty: matEmpty,
      tilled: matTilled,
      watered: matWatered,
      locked: makeMaterial(scene, 'soil-locked', '#76bd37'), // Thảm cỏ xanh mạ non
      stem: makeMaterial(scene, 'crop-stem', '#52d638'), // Thân mầm xanh non tươi rói
      ripe: Object.fromEntries(Object.values(CROPS).map(crop => [crop.id, makeMaterial(scene, `crop-${crop.id}`, crop.color)])),
    };
    tiles.forEach(tile => this.restoreTile(tile));
    this.pointerHandler = (_, pick) => {
      const picked = pick?.pickedMesh;
      if (picked?.metadata?.type === 'land-sign') { this.controls.onLandInteract?.(picked.metadata.farmId); return; }
      const npc = picked?.metadata?.npcId || picked?.parent?.metadata?.npcId;
      if (npc) {
        this.controls.onNpcInteract?.(npc);
        return;
      }
      const mailbox = picked?.metadata?.type === 'mailbox' ? picked.metadata : picked?.parent?.metadata?.type === 'mailbox' ? picked.parent.metadata : null;
      if (mailbox) {
        this.controls.onMailboxInteract?.(mailbox);
        return;
      }
      let currentPick = picked;
      let tile = null;
      while (currentPick) {
        if (currentPick.metadata?.type === 'crop' && currentPick.metadata.tile) {
          tile = currentPick.metadata.tile;
          break;
        }
        if (currentPick.metadata?.type === 'farm-tile') {
          tile = currentPick;
          break;
        }
        currentPick = currentPick.parent;
      }
      if (!tile) tile = picked;

      const venue = picked?.metadata?.venue || picked?.parent?.metadata?.venue;
      const cityAction = picked?.metadata?.cityAction;
      if (cityAction === 'exit') this.controls.exitVenue?.();
      else if (cityAction) this.controls.openVenue?.(cityAction);
      else if (venue) this.controls.enterVenue?.(venue);
      else if (tile?.metadata?.interactive) this.controls.interact?.(tile, () => this.applyTool(tile));
      else if (pick?.pickedPoint) this.controls.move?.(pick.pickedPoint);
    };
    // A tap/click interacts; dragging or pinching only changes the camera.
    this.pointerObserver = scene.onPointerObservable.add(info => {
      if (info.type === PointerEventTypes.POINTERTAP && info.event.button === 0) {
        this.pointerHandler(info.event, info.pickInfo);
      }
    });
  }

  key(tile) {
    const farmId = tile?.metadata?.farmId || this.playerFarmId;
    if (farmId === this.playerFarmId) {
      return `${tile.metadata.column}:${tile.metadata.row}`;
    }
    return `${farmId}:${tile.metadata.column}:${tile.metadata.row}`;
  }

  rawTileKey(tile) {
    return `${tile.metadata.column}:${tile.metadata.row}`;
  }

  setTool(tool) {
    this.tool = tool;
    this.notify?.(`Đã chọn ${({ hand: 'tay', hoe: 'cuốc', seed: 'hạt cà rốt', water: 'bình tưới', harvest: 'giỏ thu hoạch' })[tool]}`);
  }

  setPlayerFarmId(farmId) {
    this.playerFarmId = farmId;
    this.farmId = farmId;
    this.state = {};
    this.pendingActions.clear();
    this.tiles.forEach(tile => this.restoreTile(tile));
  }

  addTiles(tiles) {
    tiles.forEach(tile => {
      if (this.tiles.includes(tile)) return;
      this.tiles.push(tile);
      this.restoreTile(tile);
    });
  }

  restoreTile(tile) {
    const isOwner = !tile.metadata?.farmId || tile.metadata.farmId === this.playerFarmId;
    const data = this.state[this.key(tile)] || { state: 'empty' };
    tile.metadata.state = data.state;
    if (isOwner && tile.metadata.index >= this.getUnlockedPlots()) {
      tile.material = this.materials.locked;
    } else {
      tile.material = this.materials[data.state === 'watered' ? 'watered' : data.state === 'empty' ? 'empty' : 'tilled'];
    }
    if (data.plantedAt) this.renderCrop(tile, data);
  }

  renderCrop(tile, data) {
    const key = this.key(tile);
    const old = this.crops.get(key);
    const cropType = CROPS[data.crop] || CROPS.carrot;
    const growMs = data.tutorialFastGrowth ? 8_000 : cropType.growMs;
    const age = data.wateredAt ? Date.now() - data.wateredAt : 0;
    const progress = Math.min(1, age / growMs);
    const stage = progress >= 1 ? 3 : progress >= 0.75 ? 2 : progress >= 0.25 ? 1 : 0;

    if (old?.stage === stage) {
      return;
    }

    if (old?.root) {
      old.root.dispose();
    }

    const cropObj = createCropMesh(this.scene, cropType.id, progress, key);
    const position = worldPosition(tile);
    cropObj.root.position.set(position.x, position.y + 0.1, position.z);
    if (tile.parent) cropObj.root.setParent(tile.parent);

    const tagMesh = (node) => {
      node.metadata = { type: 'crop', tile, mature: progress >= 1, stage, crop: cropType.id };
      if (node.getChildMeshes) {
        node.getChildMeshes().forEach(m => {
          m.metadata = { type: 'crop', tile, mature: progress >= 1, stage, crop: cropType.id };
        });
      }
    };
    tagMesh(cropObj.root);

    this.crops.set(key, {
      root: cropObj.root,
      animate: cropObj.animate,
      stage,
      mature: progress >= 1,
    });
  }

  determineSmartTool(tile) {
    const isOwner = !tile.metadata?.farmId || tile.metadata.farmId === this.playerFarmId;
    const key = this.key(tile);
    const data = this.state[key] || { state: 'empty' };

    if (!isOwner) {
      if (data.state === 'planted') return 'water';
      return null;
    }

    if (data.state === 'empty') return 'hoe';
    if (data.state === 'tilled') return 'seed';
    if (data.state === 'planted') return 'water';
    if (data.state === 'watered') {
      const growMs = data.tutorialFastGrowth ? 8_000 : (CROPS[data.crop]?.growMs || CROPS.carrot.growMs);
      if (Date.now() - data.wateredAt >= growMs) return 'harvest';
      return 'inspect';
    }
    return null;
  }

  applyTool(tile) {
    const isOwner = !tile.metadata?.farmId || tile.metadata.farmId === this.playerFarmId;
    const key = this.key(tile);
    const rawKey = this.rawTileKey(tile);
    const farmId = tile.metadata?.farmId || this.playerFarmId;
    const data = this.state[key] || { state: 'empty' };
    const pendingKey = `${farmId}:${rawKey}`;
    if (this.pendingActions.has(pendingKey)) {
      this.notify?.('Đang chờ server xác nhận thao tác trước…');
      return;
    }

    // Click thông minh: nếu công cụ đang chọn không phù hợp với trạng thái ô,
    // tự chuyển sang thao tác kế tiếp để người chơi có thể tiếp tục chỉ bằng chuột.
    let activeTool = this.tool;
    const expectedTool = data.state === 'empty' ? 'hoe'
      : data.state === 'tilled' ? 'seed'
        : data.state === 'planted' ? 'water'
          : data.state === 'watered' ? 'harvest' : null;
    if (activeTool === 'hand' || (isOwner && expectedTool && activeTool !== expectedTool)) {
      const smart = this.determineSmartTool(tile);
      if (smart === 'inspect') {
        const cropType = CROPS[data.crop] || CROPS.carrot;
        const growMs = data.tutorialFastGrowth ? 8_000 : cropType.growMs;
        const progress = Math.min(100, Math.round(((Date.now() - data.wateredAt) / growMs) * 100));
        this.notify?.(`🌱 ${cropType.name} đang lớn (${progress}%) · hãy chờ cây chín để thu hoạch`);
        return;
      }
      if (smart) {
        activeTool = smart;
      }
    }

    const player = this.controls.getPlayer?.();
    const position = worldPosition(tile);
    if (player && position) {
      player.lookAt(position);
    }

    // 1. Nếu đứng trên đất của Hàng Xóm (Visitor mode)
    if (!isOwner) {
      if (activeTool === 'hoe' || activeTool === 'seed') {
        this.notify?.('⚠️ Đây là đất của hàng xóm · bạn không thể cuốc hoặc gieo hạt!');
        return;
      }
      if (activeTool === 'harvest') {
        this.notify?.('🔒 Chỉ chủ nông trại mới có thể thu hoạch nông sản của họ!');
        return;
      }
      // Khách ghé thăm tưới nước giúp (Water Aid)
      if (data.state === 'planted') {
        const wateredAt = Date.now();
        const doNeighborWater = () => {
          spawnWaterSplash(this.scene, position);
          farmAudio.playWater();
          this.pendingActions.add(pendingKey);
          this.controls.onNetworkAction?.({ farmId, tileKey: rawKey, action: 'water', wateredAt });
          this.notify?.('Đang chờ server xác nhận tưới giúp hàng xóm…');
        };

        if (player) {
          player.playAction('water', () => doNeighborWater());
        } else {
          doNeighborWater();
        }
        return;
      }
      if (data.state === 'watered') {
        this.notify?.('🌱 Vườn của hàng xóm đã được tưới đủ nước và đang lớn nhanh!');
        return;
      }
      this.notify?.('🏡 Đang ghé thăm nông trại hàng xóm · hãy giúp tưới nước khi đất khô!');
      return;
    }

    // 2. Nếu là đất của chính mình (Owner mode)
    if (tile.metadata.index >= this.getUnlockedPlots()) {
      this.notify?.(`Ô đất đang khóa · mở rộng nông trại để sử dụng`);
      return;
    }

    if (activeTool === 'hoe' && data.state === 'empty') {
      const doTill = () => {
        spawnDirtDigParticles(this.scene, position);
        farmAudio.playHoe();
        this.pendingActions.add(pendingKey);
        this.controls.onNetworkAction?.({ farmId, tileKey: rawKey, action: 'till' });
        this.notify?.('Đang chờ server xác nhận cuốc đất…');
      };

      if (player) {
        player.playAction('till', () => doTill());
      } else {
        doTill();
      }
    } else if (activeTool === 'seed' && data.state === 'tilled') {
      const crop = CROPS[this.getCrop()] || CROPS.carrot;
      const freeSeeds = this.controls.getFreeSeeds?.() || 0;
      const cost = freeSeeds > 0 ? 0 : crop.seedCost;
      if (!this.onAction({ type: 'plant', crop: crop.id, cost, usedFreeSeed: freeSeeds > 0 })) {
        this.notify?.(`Không đủ ${crop.seedCost} xu để mua hạt ${crop.name}`);
        return;
      }
      const isTutorial = Boolean(this.controls.isTutorialCrop?.());
      const plantedAt = Date.now();
      const doPlant = () => {
        farmAudio.playPlant();
        this.pendingActions.add(pendingKey);
        this.controls.onNetworkAction?.({ farmId, tileKey: rawKey, action: 'plant', crop: crop.id, plantedAt });
        this.notify?.(`Đang chờ server xác nhận gieo ${crop.name}…`);
      };

      if (player) {
        player.playAction('seed', () => doPlant());
      } else {
        doPlant();
      }
    } else if (activeTool === 'water' && data.state === 'planted') {
      const wateredAt = Date.now();
      const doWater = () => {
        spawnWaterSplash(this.scene, position);
        farmAudio.playWater();
        this.pendingActions.add(pendingKey);
        this.controls.onNetworkAction?.({ farmId, tileKey: rawKey, action: 'water', crop: data.crop, wateredAt });
        this.notify?.(`Đang chờ server xác nhận tưới ${CROPS[data.crop]?.name || 'cây'}…`);
      };

      if (player) {
        player.playAction('water', () => doWater());
      } else {
        doWater();
      }
    } else {
      const growMs = data.tutorialFastGrowth ? 8_000 : (CROPS[data.crop]?.growMs || CROPS.carrot.growMs);
      if ((activeTool === 'hand' || activeTool === 'harvest') && data.state === 'watered' && Date.now() - data.wateredAt >= growMs) {
        if (!this.onAction({ type: 'harvest', crop: data.crop || 'carrot', amount: 1 })) {
          this.notify?.('Kho đã đầy · hãy bán hàng hoặc nâng cấp kho');
          return;
        }
        const doHarvest = () => {
          farmAudio.playHarvest();
          this.pendingActions.add(pendingKey);
          this.controls.onNetworkAction?.({ farmId, tileKey: rawKey, action: 'harvest', crop: data.crop });
          this.notify?.(`Đang chờ server xác nhận thu hoạch ${CROPS[data.crop]?.name || 'cà rốt'}…`);
        };

        if (player) {
          player.playAction('harvest', () => doHarvest());
        } else {
          doHarvest();
        }
      } else {
        this.notify?.('Công cụ này chưa phù hợp với trạng thái ô đất');
      }
    }
  }

  interactNearest(position) {
    let nearest = null;
    let nearestDistance = Infinity;
    for (const tile of this.tiles) {
      const tilePosition = worldPosition(tile);
      const distance = Math.hypot(tilePosition.x - position.x, tilePosition.z - position.z);
      if (distance < nearestDistance) {
        nearest = tile;
        nearestDistance = distance;
      }
    }
    if (nearestDistance > 6) {
      this.notify?.('Hãy đứng gần một ô đất rồi bấm E');
      return;
    }
    this.applyTool(nearest);
  }

  applyRemoteFarmAction({ farmId, tileKey, action, crop, tileData }) {
    this.pendingActions.delete(`${farmId}:${tileKey}`);
    // Server state must outlive mesh residency. A streamed-out tile still
    // receives updates and restores the latest state when its chunk returns.
    const storageKey = farmId === this.playerFarmId ? tileKey : `${farmId}:${tileKey}`;
    if (action === 'till') this.state[storageKey] = tileData || { state: 'tilled' };
    else if (action === 'plant') this.state[storageKey] = tileData || { state: 'planted', crop: crop || 'carrot', plantedAt: Date.now() };
    else if (action === 'water') this.state[storageKey] = tileData || { ...this.state[storageKey], state: 'watered', wateredAt: Date.now() };
    else if (action === 'harvest') this.state[storageKey] = { state: 'tilled' };
    const tile = this.tiles.find(t => {
      const tFarmId = t.metadata?.farmId || this.playerFarmId;
      return tFarmId === farmId && `${t.metadata.column}:${t.metadata.row}` === tileKey;
    });
    if (!tile) return;

    if (action === 'till') {
      this.state[storageKey] = { state: 'tilled' };
      tile.material = this.materials.tilled;
    } else if (action === 'plant') {
      this.state[storageKey] = tileData || { state: 'planted', crop: crop || 'carrot', plantedAt: Date.now() };
      this.renderCrop(tile, this.state[storageKey]);
    } else if (action === 'water') {
      const prev = this.state[storageKey] || {};
      this.state[storageKey] = tileData || { ...prev, state: 'watered', wateredAt: Date.now() };
      tile.material = this.materials.watered;
      this.renderCrop(tile, this.state[storageKey]);
    } else if (action === 'harvest') {
      const cropEntry = this.crops.get(storageKey);
      if (cropEntry?.root) cropEntry.root.dispose();
      this.crops.delete(storageKey);
      this.state[storageKey] = { state: 'tilled' };
      tile.material = this.materials.tilled;
      const cropColors = { carrot: '#ff7043', wheat: '#fbc02d', tomato: '#e53935', strawberry: '#d81b60' };
      spawnHarvestParticles(this.scene, worldPosition(tile), cropColors[crop] || '#ff9800');
    }
  }

  applyRemoteSync(allFarms) {
    if (!allFarms) return;
    this.crops.forEach(entry => entry?.root?.dispose());
    this.crops.clear();
    this.state = {};
    this.pendingActions.clear();
    this.tiles.forEach(tile => this.restoreTile(tile));
    Object.entries(allFarms).forEach(([farmId, farmData]) => {
      Object.entries(farmData).forEach(([tileKey, data]) => {
        this.applyRemoteFarmAction({
          farmId,
          tileKey,
          action: data.state === 'watered' ? 'water' : data.state === 'planted' ? 'plant' : 'till',
          crop: data.crop,
          tileData: data
        });
      });
    });
  }

  update() {
    const now = performance.now();
    for (const [, cropEntry] of this.crops) {
      if (cropEntry?.root?.isEnabled()) cropEntry.animate?.(now);
    }
    for (const tile of this.tiles) {
      const data = this.state[this.key(tile)];
      if (data?.state === 'watered') {
        const cropType = CROPS[data.crop] || CROPS.carrot;
        const growMs = data.tutorialFastGrowth ? 8_000 : cropType.growMs;
        const age = Date.now() - data.wateredAt;
        const progress = Math.min(1, age / growMs);
        const stage = progress >= 1 ? 3 : progress >= 0.75 ? 2 : progress >= 0.25 ? 1 : 0;
        const currentCrop = this.crops.get(this.key(tile));
        if (!currentCrop || currentCrop.stage !== stage) {
          this.renderCrop(tile, data);
        }
      }
    }
  }

  refreshUnlocks() { this.tiles.forEach(tile => this.restoreTile(tile)); }

  clearPendingActions() { this.pendingActions.clear(); }

  removeFarmTiles(farmId, { preserveState = false } = {}) {
    this.tiles.filter(tile => tile.metadata?.farmId === farmId).forEach(tile => {
      const key = this.key(tile);
      this.crops.get(key)?.root?.dispose();
      this.crops.delete(key);
      if (!preserveState) delete this.state[key];
      this.pendingActions.delete(key);
    });
    this.tiles = this.tiles.filter(tile => tile.metadata?.farmId !== farmId);
  }

  dispose() {
    this.scene.onPointerObservable.remove(this.pointerObserver);
    this.crops.forEach(crop => crop.root?.dispose());
    this.crops.clear();
  }
}
