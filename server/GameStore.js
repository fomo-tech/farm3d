import { MongoClient } from 'mongodb';
import { BEACH_CONFIG } from '../shared/beachConfig.js';
import { advanceFishingSession, FISHING_GAME, fishingTimePhase, claimFishingMission } from '../shared/fishingSession.js';
import { applyLivestockAction } from '../shared/livestockActions.js';
import { CROPS, FARM_CONFIG, farmBarnCapacity, farmBarnUpgradeCost } from '../shared/farmConfig.js';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { FARM_TILE_KEY_PATTERN } from '../shared/farmLayout.js';
import { decodeFarmId } from '../shared/villageLayout.js';
import { FarmSecurity, withFarmLock } from './FarmSecurity.js';
import {
  FISHING_CONFIG,
  FISHING_GEAR,
  fishingWaterAt,
  fishingCastTarget,
  normalizeFishingState,
  fishingInventoryCount,
  fishingCapacity,
  calculateFishSaleValue,
} from '../shared/fishing.js';
import { calculateVerifiedCustomizationCost, normalizeCustomization } from '../shared/fashionConfig.js';

const mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', {
  serverSelectionTimeoutMS: 5000,
});
const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;
let collections;
export function getGameStoreDatabase() { return mongo.db(process.env.MONGODB_DB || 'farm_online_3d'); }
export let farmSecurity;
export async function initFarmSecurity() { await farmSecurity.init(); }
export async function loadFarmAssignment(villageId, farmId) {
  const decoded = decodeFarmId(farmId);
  return decoded ? collections.assignments.findOne({ villageId, lot: decoded.lot, status: { $ne: 'pending' } }) : null;
}
export async function initGameStore() {
  await mongo.connect();
  const database = mongo.db(process.env.MONGODB_DB || 'farm_online_3d');
  collections = { players: database.collection('players'), crops: database.collection('crops'), likes: database.collection('farm_likes'), friendships: database.collection('friendships') };
  collections.assignments = database.collection('farm_assignments');
  farmSecurity = new FarmSecurity(collections);
  await Promise.all([
    collections.players.createIndex({ playerId: 1 }, { unique: true }),
    collections.crops.createIndex({ villageId: 1, farmId: 1, tileKey: 1 }, { unique: true }),
    collections.likes.createIndex({ villageId: 1, farmId: 1, playerId: 1 }, { unique: true }),
    collections.friendships.createIndex({ playerId: 1, friendId: 1 }, { unique: true }),
    collections.players.createIndex({ 'progress.xp': -1 }),
  ]);
  const legacyCursor = collections.players.find(
    { sessionToken: { $type: 'string' } },
    { projection: { _id: 1, sessionToken: 1, sessionIssuedAt: 1, updatedAt: 1, createdAt: 1 } },
  );
  for await (const legacy of legacyCursor) {
    await collections.players.updateOne(
      { _id: legacy._id, sessionToken: legacy.sessionToken },
      {
        $set: {
          sessionTokenHash: hashSessionToken(legacy.sessionToken),
          sessionIssuedAt: legacy.sessionIssuedAt || legacy.updatedAt || legacy.createdAt || Date.now(),
        },
        $unset: { sessionToken: '' },
      },
    );
  }
  await collections.players.updateMany({ revision: { $exists: false } }, { $set: { revision: 0 } });
}

const VEHICLES = { walk: 0, bike: 350, scooter: 900, tractor: 2200 };
const OUTFITS = { starter: 0, farmer: 100, rose: 180, lake: 260, royal: 420 };
const ORDERS = {
  starter: { items: { carrot: 1 }, coins: 65, xp: 40 },
  bakery: { items: { wheat: 4 }, coins: 145, xp: 70 },
  market: { items: { carrot: 2, tomato: 3 }, coins: 220, xp: 110 },
};
const RECIPES = {
  flour: { inputs: { wheat: 2 }, xp: 12, sell: 18 },
  cheese: { inputs: { milk: 2 }, xp: 20, sell: 35 },
  jam: { inputs: { strawberry: 2 }, xp: 30, sell: 55 },
};
const QUESTS = {
  'plant-3': { stat: 'planted', goal: 3, coins: 35, xp: 20 },
  'harvest-3': { stat: 'harvested', goal: 3, coins: 60, xp: 35 },
  'feed-2': { stat: 'animalsFed', goal: 2, coins: 50, xp: 30 },
};
const EXPANSIONS = FARM_CONFIG.expansions;

const initialProgress = () => ({
  version: 3, coins: 180, gems: 15, xp: 0, level: 1, selectedCrop: 'carrot', freeSeeds: 0,
  fishing: normalizeFishingState(),
  inventory: {
    carrot: 0, wheat: 0, tomato: 0, strawberry: 0, pumpkin: 0, melon: 0, turnip: 0,
    egg: 0, duckEgg: 0, milk: 0, wool: 0, flour: 0, cheese: 0, jam: 0,
  },
  stats: { planted: 0, watered: 0, harvested: 0, orders: 0, animalsFed: 0, crafted: 0 },
  claimedQuests: [], completedOrders: [], unlockedPlots: 0, barnLevel: 0, toolLevel: 1,
  outfit: 'starter', ownedOutfits: ['starter'], vehicle: 'walk', ownedVehicles: ['walk'],
  homeTier: 0, ownedHomes: [], casinoPlays: 0,
  onboarding: { characterCreated: false, step: 0, freeSeedsReceived: false, completed: false, bicycleAwarded: false },
});
const initialLivestock = () => [];
const levelFromXp = xp => Math.min(20, Math.floor(Math.sqrt(xp / 80)) + 1);
const inventoryCount = p => Object.values(p.inventory).reduce((sum, value) => sum + Number(value || 0), 0);
const barnCapacity = p => farmBarnCapacity(p.barnLevel);

function hashSessionToken(token) {
  return createHash('sha256').update(`farm-online-3d:${token}`).digest('hex');
}

function tokensMatch(provided, expectedHash) {
  if (!provided || typeof expectedHash !== 'string' || !/^[a-f0-9]{64}$/i.test(expectedHash)) return false;
  const providedHash = Buffer.from(hashSessionToken(provided), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return providedHash.length === expected.length && timingSafeEqual(providedHash, expected);
}

function sanitizeName(name) {
  return String(name || 'Nông dân').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24) || 'Nông dân';
}

function docToPlayer(doc, sessionToken = null) {
  if (!doc) return null;
  const progress = { ...initialProgress(), ...(doc.progress || {}) };
  // Merge newly introduced crop/animal product slots into existing saves
  // without overwriting the player's current inventory.
  progress.inventory = { ...initialProgress().inventory, ...(doc.progress?.inventory || {}) };
  progress.stats = { ...initialProgress().stats, ...(doc.progress?.stats || {}) };
  progress.fishing = normalizeFishingState(progress.fishing);
  progress.level = levelFromXp(progress.xp);
  const livestock = (doc.livestock || initialLivestock()).map((a, index) => ({ ...a, id: a.id || `legacy-${a.species}-${index}` }));
  return { playerId: doc.playerId, token: sessionToken, name: doc.name, progress, position: doc.position || null, livestock, revision: doc.revision || 0 };
}

export async function authenticate(playerId, token, name = 'Nông dân') {
  let doc = await collections.players.findOne({ playerId });
  if (!doc) {
    const sessionToken = randomBytes(24).toString('hex');
    const now = Date.now();
    doc = { playerId, sessionTokenHash: hashSessionToken(sessionToken), sessionIssuedAt: now, name: sanitizeName(name), progress: initialProgress(), position: null, livestock: initialLivestock(), revision: 0, createdAt: now, updatedAt: now };
    await collections.players.insertOne(doc);
    return docToPlayer(doc, sessionToken);
  }

  let valid = tokensMatch(token, doc.sessionTokenHash);
  // One-time migration for accounts created before Phase 5 stored plaintext tokens.
  if (!valid && token && doc.sessionToken && token === doc.sessionToken) {
    valid = true;
    await collections.players.updateOne({ _id: doc._id }, { $set: { sessionTokenHash: hashSessionToken(token), sessionIssuedAt: doc.sessionIssuedAt || Date.now() }, $unset: { sessionToken: '' } });
    doc.sessionTokenHash = hashSessionToken(token);
  }
  const issuedAt = Number(doc.sessionIssuedAt || doc.updatedAt || doc.createdAt || 0);
  if (!valid || !issuedAt || Date.now() - issuedAt > SESSION_TTL_MS) {
    return { error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' };
  }
  return docToPlayer(doc, token);
}

export async function savePosition(playerId, position) {
  await collections.players.updateOne({ playerId }, { $set: { position, updatedAt: Date.now() } });
}

export async function loadPlayer(playerId) {
  return docToPlayer(await collections.players.findOne({ playerId }));
}

async function savePlayer(player) {
  player.progress.level = levelFromXp(player.progress.xp);
  const result = await collections.players.updateOne({ playerId: player.playerId, revision: player.revision }, { $set: { name: player.name, progress: player.progress, livestock: player.livestock, updatedAt: Date.now() }, $inc: { revision: 1 } });
  if (!result.modifiedCount) return null;
  player.revision += 1;
  return player;
}

// Casino stakes and payouts use the same revision guard as other purchases.
// A pending stake is persisted so a restart can refund an unfinished round.
export async function casinoPlaceBet(playerId, roundId, game, choice, amount) {
  if (!['tai-xiu', 'bau-cua'].includes(game) || ![10, 50, 100].includes(amount)) return { error: 'Mức cược không hợp lệ.' };
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const player = await loadPlayer(playerId);
    if (!player) return { error: 'Không tìm thấy người chơi.' };
    const pending = { ...(player.progress.casinoPending || {}) };
    if (pending[roundId]) return { error: 'Bạn đã đặt cược trong ván này.' };
    if (player.progress.coins < amount) return { error: 'Không đủ xu.' };
    pending[roundId] = { game, choice, amount, createdAt: Date.now() };
    player.progress.casinoPending = pending;
    player.progress.coins -= amount;
    if (await savePlayer(player)) return { player };
  }
  return { error: 'Giao dịch đang bận, vui lòng thử lại.' };
}

export async function casinoSettleBet(playerId, roundId, reward) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const player = await loadPlayer(playerId);
    const pending = player?.progress.casinoPending?.[roundId];
    if (!pending) return null;
    const next = { ...player.progress.casinoPending };
    delete next[roundId];
    player.progress.casinoPending = next;
    player.progress.coins += reward;
    player.progress.casinoPlays += 1;
    if (await savePlayer(player)) return { player, bet: pending };
  }
  throw new Error(`Casino payout contention: ${playerId}`);
}

export async function casinoRefundStale(playerId, activeRoundIds = []) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const player = await loadPlayer(playerId);
    if (!player) return null;
    const pending = { ...(player.progress.casinoPending || {}) };
    const stale = Object.entries(pending).filter(([id, bet]) => !activeRoundIds.includes(id) || Date.now() - bet.createdAt > 90_000);
    if (!stale.length) return player;
    stale.forEach(([id, bet]) => { player.progress.coins += bet.amount; delete pending[id]; });
    player.progress.casinoPending = pending;
    if (await savePlayer(player)) return player;
  }
  return loadPlayer(playerId);
}

function requireItems(progress, items) { return Object.entries(items).every(([id, count]) => (progress.inventory[id] || 0) >= count); }
function consume(progress, items) { Object.entries(items).forEach(([id, count]) => { progress.inventory[id] -= count; }); }

function pickFishingCatch(zoneId, baitId = null) {
  const zone = FISHING_CONFIG.zones[zoneId];
  if (!zone) return null;
  const pool = zone.fish.map(id => FISHING_CONFIG.fish[id]).filter(Boolean);
  if (!pool.length) return null;
  const bait = baitId ? FISHING_CONFIG.baits[baitId] : null;
  const rareChance = Math.min(0.85, Math.max(0, zone.rareChance + (bait?.rareBonus || 0)));
  const rarePool = pool.filter(fish => fish.rarity !== 'common');
  const normalPool = pool.filter(fish => fish.rarity === 'common');
  const selectedPool = Math.random() < rareChance && rarePool.length ? rarePool : (normalPool.length ? normalPool : pool);
  const preferred = new Set(bait?.preferredFish || []);
  const phase=fishingTimePhase();
  const weighted = selectedPool.flatMap(fish => [fish, ...(preferred.has(fish.id) ? [fish] : []), ...(FISHING_CONFIG.timePreferences[fish.id]?.includes(phase)?[fish]:[])]);
  const fish = weighted[Math.floor(Math.random() * weighted.length)] || selectedPool[0];
  const [minWeight, maxWeight] = fish.weight;
  const weight = Math.round((minWeight + Math.random() * (maxWeight - minWeight)) * 100) / 100;
  return { fishId: fish.id, weight };
}

function fishingEntry(fishing, fishId) {
  const current = fishing.fish[fishId];
  if (current && typeof current === 'object') return current;
  const entry = { count: Math.max(0, Number(current) || 0), totalWeight: Math.max(0, Number(current) || 0), maxWeight: 0 };
  fishing.fish[fishId] = entry;
  return entry;
}

export async function performAction(playerId, action, payload = {}, context = {}) {
  const player = docToPlayer(await collections.players.findOne({ playerId }));
  if (!player) return { error: 'Không tìm thấy người chơi.' };
  const p = player.progress;
  p.fishing = normalizeFishingState(p.fishing);
  const fail = error => ({ error, player });
  let actionResult = null;
  const fishingZone = () => context.venue ? null : fishingWaterAt(context.x, context.z);
  const atFishingShop = () => context.venue === 'fishing' || (!context.venue && Math.hypot(context.x-BEACH_CONFIG.vendor.x,context.z-BEACH_CONFIG.vendor.z)<=BEACH_CONFIG.vendor.interactionDistance);
  if (action === 'character_create') { if (p.onboarding.characterCreated) return fail('Nhân vật đã được tạo.'); player.name = String(payload.name || player.name).slice(0, 24); p.outfit = 'starter'; p.onboarding.characterCreated = true; p.onboarding.step = 1; }
  else if (action === 'select_crop') { if (!CROPS[payload.crop] || p.level < CROPS[payload.crop].level) return fail('Hạt giống chưa mở khóa.'); p.selectedCrop = payload.crop; }
  else if (action === 'sell_item') { const crop = CROPS[payload.id]; const amount = Math.max(1, Math.min(99, Number(payload.amount) || 1)); if (!crop || (p.inventory[payload.id] || 0) < amount) return fail('Không đủ nông sản.'); p.inventory[payload.id] -= amount; p.coins += crop.sellPrice * amount; }
  else if (action === 'deliver_order') { const order = ORDERS[payload.id]; if (!order || p.completedOrders.includes(payload.id) || !requireItems(p, order.items)) return fail('Không thể giao đơn hàng.'); consume(p, order.items); p.coins += order.coins; p.xp += order.xp; p.stats.orders += 1; p.completedOrders.push(payload.id); if (p.onboarding.step === 4) p.onboarding.step = 5; }
  else if (action === 'claim_quest') { const quest = QUESTS[payload.id]; if (!quest || p.claimedQuests.includes(payload.id) || p.stats[quest.stat] < quest.goal) return fail('Nhiệm vụ chưa hoàn thành.'); p.coins += quest.coins; p.xp += quest.xp; p.claimedQuests.push(payload.id); }
  else if (action === 'craft') { const recipe = RECIPES[payload.id]; if (!recipe || !requireItems(p, recipe.inputs)) return fail('Không đủ nguyên liệu.'); consume(p, recipe.inputs); p.inventory[payload.id] += 1; p.xp += recipe.xp; p.stats.crafted += 1; }
  else if (action === 'sell_product') { const recipe = RECIPES[payload.id]; if (!recipe || !p.inventory[payload.id]) return fail('Không có sản phẩm.'); p.inventory[payload.id] -= 1; p.coins += recipe.sell; }
  else if (action === 'upgrade_land') { const item = EXPANSIONS.find(v => v.plots > p.unlockedPlots); if (!item || p.level < item.level || p.coins < item.cost) return fail('Chưa đủ điều kiện mở rộng đất.'); p.coins -= item.cost; p.unlockedPlots = item.plots; }
  else if (action === 'upgrade_barn') { const cost = farmBarnUpgradeCost(p.barnLevel); if (p.coins < cost) return fail('Không đủ xu nâng kho.'); p.coins -= cost; p.barnLevel += 1; }
  else if (action === 'upgrade_home') { if (p.homeTier >= 2 || p.level < 4 || p.coins < 1800) return fail('Chưa đủ điều kiện nâng nhà.'); p.coins -= 1800; p.homeTier = 2; if (!p.ownedHomes.includes('cozy-manor')) p.ownedHomes.push('cozy-manor'); }
  else if (action === 'buy_vehicle') { const cost = VEHICLES[payload.id]; if (cost == null) return fail('Xe không hợp lệ.'); if (!p.ownedVehicles.includes(payload.id)) { if (p.coins < cost) return fail('Không đủ xu mua xe.'); p.coins -= cost; p.ownedVehicles.push(payload.id); } p.vehicle = payload.id; }
  else if (action === 'buy_outfit') { const cost = OUTFITS[payload.id]; if (cost == null) return fail('Trang phục không hợp lệ.'); if (!p.ownedOutfits.includes(payload.id)) { if (p.coins < cost) return fail('Không đủ xu mua trang phục.'); p.coins -= cost; p.ownedOutfits.push(payload.id); } p.outfit = payload.id; }
  else if (action === 'fashion_save_customization') {
    if (!p.ownedCustomization) p.ownedCustomization = [];
    const requestedIds = Array.isArray(payload.newOwnedItemIds) ? payload.newOwnedItemIds : [];
    const { verifiedCost, validNewItemIds } = calculateVerifiedCustomizationCost(p.ownedCustomization, requestedIds);
    if (verifiedCost > 0) {
      if (p.coins < verifiedCost) return fail('Không đủ xu mua trang phục.');
      p.coins -= verifiedCost;
    }
    validNewItemIds.forEach(id => {
      if (!p.ownedCustomization.includes(id)) p.ownedCustomization.push(id);
    });
    const normalized = normalizeCustomization(payload.customization);
    p.customization = normalized;
    player.customization = normalized;
  }
  else if (action === 'fishing_buy') {
    if(!atFishingShop())return fail('Hãy đến tiệm đồ câu hoặc quầy Lão Ngư để mua.');
    const gear = FISHING_GEAR[payload.id];
    if (!gear || p.coins < gear.cost) return fail('Không đủ xu hoặc đồ câu không hợp lệ.');
    if (gear.kind === 'rod') {
      if (p.fishing.ownedRods.includes(payload.id)) return fail('Bạn đã có cần câu này.');
      p.fishing.ownedRods.push(payload.id);
      p.fishing.equippedRod = payload.id;
    } else if (gear.kind === 'bait') {
      p.fishing.bait[payload.id] = (p.fishing.bait[payload.id] || 0) + gear.quantity;
      if (!p.fishing.equippedBait) p.fishing.equippedBait = payload.id;
    } else if (gear.kind === 'tool') {
      if (p.fishing.ownedTools[payload.id]) return fail('Bạn đã có dụng cụ này.');
      p.fishing.ownedTools[payload.id] = true;
      if (gear.capacity) p.fishing.coolerCapacity = Math.max(p.fishing.coolerCapacity, gear.capacity);
    }
    p.coins -= gear.cost;
  }
  else if (action === 'fishing_equip') {
    if (p.fishing.pending && Date.now() < p.fishing.pending.expiresAt) return fail('Hãy thu cần trước khi đổi trang bị.');
    const id = payload.id;
    if (id === null || id === undefined || id === '') {
      p.fishing.equippedBait = null;
    } else {
      const gear = FISHING_GEAR[id];
      if (!gear) return fail('Đồ câu không hợp lệ.');
      if (gear.kind === 'rod') {
        if (!p.fishing.ownedRods.includes(id)) return fail('Bạn chưa có cần câu này.');
        p.fishing.equippedRod = id;
      } else if (gear.kind === 'bait' && (p.fishing.bait[id] || 0) > 0) {
        p.fishing.equippedBait = id;
      } else if (gear.kind === 'tool' && p.fishing.ownedTools[id]) {
        p.fishing.equippedTool = id;
      } else return fail('Bạn chưa sở hữu hoặc đã hết món đồ này.');
    }
  }
  else if (action === 'fishing_cast') {
    const zone = fishingZone();
    if (!zone) return fail('Hãy đứng sát bờ hồ, sông, ao hoặc biển để câu.');
    if (!p.fishing.equippedRod || !p.fishing.ownedRods.includes(p.fishing.equippedRod)) return fail('Hãy trang bị cần câu trước.');
    if (fishingInventoryCount(p.fishing) >= fishingCapacity(p.fishing)) return fail('Thùng cá đã đầy. Hãy bán cá trước khi câu tiếp.');
    if (p.fishing.pending && Date.now() < p.fishing.pending.expiresAt) return fail('Phao vẫn đang ở dưới nước.');
    const baitId = p.fishing.equippedBait;
    const rod = FISHING_CONFIG.rods[p.fishing.equippedRod];
    if(!rod)return fail('Cần câu không hợp lệ.');
    const target = fishingCastTarget(context.x,context.z,zone,Math.min(rod.castDistance,FISHING_CONFIG.zones[zone].castDistance));
    if(!target)return fail('Không tìm thấy mặt nước trong tầm cần câu.');
    const bait = baitId ? FISHING_CONFIG.baits[baitId] : null;
    if (baitId) {
      if (!(p.fishing.bait[baitId] > 0)) return fail('Đã hết mồi câu.');
      p.fishing.bait[baitId] -= 1;
    }
    const catchData = pickFishingCatch(zone, baitId);
    if (!catchData) return fail('Vùng nước này chưa có dữ liệu cá.');
    const now = Date.now();
    const minBite = FISHING_CONFIG.defaults.biteMinMs / Math.max(1, bait?.biteSpeed || 1);
    const maxBite = FISHING_CONFIG.defaults.biteMaxMs / Math.max(1, bait?.biteSpeed || 1);
    const biteAt = now + Math.floor(minBite + Math.random() * Math.max(1, maxBite - minBite));
    p.fishing.pending = {
      id: randomBytes(16).toString('hex'), phase: 'waiting', x: context.x, z: context.z,
      timePhase: fishingTimePhase(),
      target,
      zone,
      rodId: p.fishing.equippedRod,
      baitId,
      castAt: now,
      biteAt,
      expiresAt: biteAt + FISHING_GAME.hookWindowMs,
      fishId: catchData.fishId,
      weight: catchData.weight,
      castDistance: Math.min(rod.castDistance, FISHING_CONFIG.zones[zone]?.castDistance || rod.castDistance),
    };
  }
  else if (['fishing_reel', 'fishing_pull', 'fishing_cancel'].includes(action)) {
    try { actionResult = advanceFishingSession(p.fishing, action, payload, context); }
    catch(error) { return fail(error.message); }
    if (actionResult.fishCaught) p.xp += actionResult.xp;
  }
  else if (action === 'fishing_sell' || action === 'fishing_sell_all') {
    if(!atFishingShop())return fail('Hãy mang cá tới tiệm đồ câu hoặc quầy Lão Ngư để bán.');
    const requestedId = action === 'fishing_sell_all' ? null : payload.id;
    const entries = requestedId ? [[requestedId, p.fishing.fish[requestedId]]] : Object.entries(p.fishing.fish);
    let soldCount = 0;
    let saleTotal = 0;
    for (const [fishId, rawEntry] of entries) {
      const fish = FISHING_CONFIG.fish[fishId];
      if (!fish || !rawEntry) continue;
      const entry = fishingEntry(p.fishing, fishId);
      const amount = action === 'fishing_sell_all' ? entry.count : Math.max(1, Math.min(entry.count, Number(payload.amount) || 1));
      if (!amount) continue;
      const averageWeight = entry.totalWeight / entry.count || fish.weight[0];
      saleTotal += calculateFishSaleValue(fishId, averageWeight) * amount;
      soldCount += amount;
      entry.count -= amount;
      entry.totalWeight = Math.max(0, entry.totalWeight - averageWeight * amount);
      if (entry.count <= 0) delete p.fishing.fish[fishId];
      if (action !== 'fishing_sell_all') break;
    }
    if (!soldCount) return fail('Bạn không có cá để bán.');
    p.coins += saleTotal;
    p.fishing.lastSale = { count: soldCount, coins: saleTotal, at: Date.now() };
    actionResult = { fishSold: { count: soldCount, coins: saleTotal } };
  }
  else if(action==='fishing_claim_mission') {
    try{const reward=claimFishingMission(p.fishing,payload.id);p.coins+=reward.coins;p.xp+=reward.xp;actionResult={fishingMission:payload.id};}
    catch(error){return fail(error.message);}
  }
  else if (action === 'casino') return fail('Hãy tham gia bàn Tài Xỉu hoặc Bầu Cua online.');
  else if (['build_pen', 'buy_animal', 'feed_animals', 'collect_animals', 'sell_animal'].includes(action)) {
    if (!context.farmId || (await loadFarmAssignment(context.villageId, context.farmId))?.playerId !== playerId) return fail('Bạn cần sở hữu nông trại trước.');
    try { applyLivestockAction(player, action, payload); } catch (error) { return fail(error.message); }
  }
  else if (action === 'sell_livestock_product') {
    const product = FARM_CONFIG.products[payload.id];
    if (!product || !(p.inventory[payload.id] > 0)) return fail('Không có sản phẩm để bán.');
    p.inventory[payload.id] -= 1; p.coins += product.sellPrice;
  }
  else if (action === 'claim_seeds') { if (p.onboarding.step !== 1) return fail('Chưa đến bước nhận hạt giống.'); if (!p.onboarding.freeSeedsReceived) { p.freeSeeds += 3; p.coins += 50; p.onboarding.freeSeedsReceived = true; } p.onboarding.step = 2; }
  else if (action === 'advance_onboarding') { const step = Number(payload.step); if (step !== 4 || p.onboarding.step !== 3) return fail('Không thể bỏ qua bước hướng dẫn.'); p.onboarding.step = 4; }
  else if (action === 'complete_onboarding') { if (p.onboarding.step !== 5) return fail('Bạn chưa hoàn thành chuỗi hướng dẫn.'); p.onboarding.completed = true; p.onboarding.step = 6; if (!p.onboarding.bicycleAwarded) { p.coins += 200; p.xp += 80; if (!p.ownedVehicles.includes('bike')) p.ownedVehicles.push('bike'); p.onboarding.bicycleAwarded = true; } p.vehicle = 'bike'; }
  else if (action === 'reset_onboarding') { p.onboarding = { ...p.onboarding, characterCreated: true, step: 1, completed: false }; }
  else if (action === 'help_friend') { const targetId = String(payload.targetId || '').slice(0, 64); const day = new Date().toISOString().slice(0, 10); if (!p.socialRewards) p.socialRewards = {}; const key = `${day}:${targetId}`; if (!targetId || p.socialRewards[key]) return fail('Hôm nay bạn đã giúp người này rồi.'); p.socialRewards[key] = true; p.coins += 15; p.xp += 5; }
  else if (action === 'roadside_buy') { const offers = { carrot: { amount: 5, price: 50 }, wheat: { amount: 4, price: 100 }, tomato: { amount: 3, price: 135 }, strawberry: { amount: 2, price: 210 } }; const offer = offers[payload.crop]; if (!offer || Number(payload.amount) !== offer.amount || Number(payload.price) !== offer.price || p.coins < offer.price || inventoryCount(p) + offer.amount > barnCapacity(p)) return fail('Giao dịch ven đường không hợp lệ.'); p.coins -= offer.price; p.inventory[payload.crop] += offer.amount; }
  else if (action === 'reset_orders') { if (p.completedOrders.length < Object.keys(ORDERS).length || p.coins < 25) return fail('Chưa thể làm mới đơn hàng.'); p.coins -= 25; p.completedOrders = []; }
  else return fail('Hành động không được hỗ trợ.');
  if(action.startsWith('fishing_'))actionResult={...actionResult,fishingUpdated:true};
  if (!(await savePlayer(player))) return fail('Xung đột giao dịch, vui lòng thử lại.');
  return { player, ...(actionResult ? { result: actionResult } : {}) };
}

export async function farmAction(playerId, villageId, ownedFarmId, payload) {
  return withFarmLock(payload.farmId, () => applyFarmAction(playerId, villageId, ownedFarmId, payload));
}
async function applyFarmAction(playerId, villageId, ownedFarmId, payload) {
  const player = docToPlayer(await collections.players.findOne({ playerId }));
  if (!player) return { error: 'Người chơi không tồn tại.' };
  const { farmId, tileKey, action } = payload;
  if (!/^farm_\d{6}$/.test(farmId) || !FARM_TILE_KEY_PATTERN.test(tileKey)) return { error: 'Ô đất không hợp lệ.' };
  const [column, rowIndex] = tileKey.split(':').map(Number);
  if (farmId === ownedFarmId && rowIndex * 4 + column >= player.progress.unlockedPlots) return { error: 'Ô đất này chưa được mở khóa.' };
  const ownerAction = ['till', 'plant', 'harvest'].includes(action);
  if (ownerAction && farmId !== ownedFarmId) return { error: 'Bạn không sở hữu nông trại này.' };
  const storageFarmId = `farm_${String(decodeFarmId(farmId).lot).padStart(6, '0')}`;
  const row = await collections.crops.findOne({ villageId, farmId: storageFarmId, tileKey });
  const current = row || { state: 'empty' };
  if (current.theftClaim) { await farmSecurity.recover(current); return { error: 'Cây đang đồng bộ, hãy thử lại.' }; }
  if (farmId !== ownedFarmId) {
    const assignment = await loadFarmAssignment(villageId, farmId);
    if (!farmSecurity.gateOpen(assignment)) return { error: 'Cổng nông trại đã đóng.' };
  }
  const now = Date.now(); let next;
  if (action === 'till') { if (current.state !== 'empty') return { error: 'Ô đất không thể cuốc.' }; next = { state: 'tilled' }; }
  else if (action === 'plant') { const crop = CROPS[payload.crop]; if (current.state !== 'tilled' || !crop || player.progress.level < crop.level) return { error: 'Không thể gieo hạt.' }; if (player.progress.freeSeeds > 0 && payload.crop === 'carrot') player.progress.freeSeeds -= 1; else { if (player.progress.coins < crop.seedCost) return { error: 'Không đủ xu mua hạt.' }; player.progress.coins -= crop.seedCost; } player.progress.stats.planted += 1; player.progress.xp += 2; const tutorial = player.progress.onboarding.step === 2; next = { state: 'planted', crop: payload.crop, plantedAt: now, tutorialFastGrowth: tutorial, yield: tutorial ? FARM_CONFIG.security.theft.tutorialYield : FARM_CONFIG.security.theft.normalYield, stolenAmount: 0 }; }
  else if (action === 'water') { if (current.state !== 'planted') return { error: 'Cây chưa thể tưới.' }; player.progress.stats.watered += 1; player.progress.xp += farmId === ownedFarmId ? 1 : 5; if (farmId !== ownedFarmId) player.progress.coins += 5; next = { state: 'watered', crop: current.crop, plantedAt: current.plantedAt, wateredAt: now, tutorialFastGrowth: Boolean(current.tutorialFastGrowth), yield: current.yield || 1, stolenAmount: 0 }; }
  else if (action === 'harvest') {
    const crop = CROPS[current.crop]; const growMs = current.tutorialFastGrowth || player.progress.onboarding.step === 2 ? FARM_CONFIG.care.tutorialGrowMs : crop?.growMs;
    if (current.state !== 'watered' || !crop || now - current.wateredAt < growMs) return { error: 'Cây chưa chín.' };
    const amount = (current.yield || 1) - (current.stolenAmount || 0);
    if (inventoryCount(player.progress) + amount > barnCapacity(player.progress)) return { error: 'Kho đã đầy.' };
    player.progress.inventory[current.crop] = (player.progress.inventory[current.crop] || 0) + amount;
    player.progress.stats.harvested += 1; player.progress.xp += 8;
    if (player.progress.onboarding.step === 2) player.progress.onboarding.step = 3;
    next = { state: 'tilled', yield: 0, stolenAmount: 0, tutorialFastGrowth: false };
  }
  else return { error: 'Hành động ruộng không hợp lệ.' };
  await collections.crops.updateOne({ villageId, farmId: storageFarmId, tileKey }, { $set: { ...next, villageId, farmId: storageFarmId, tileKey } }, { upsert: true });
  if (!(await savePlayer(player))) return { error: 'Xung đột giao dịch, vui lòng thử lại.' };
  return { player, tileData: next };
}

export async function loadFarms(villageId, farmIds = null) {
  const farms = {};
  const storageIds = farmIds?.map(id => `farm_${String(decodeFarmId(id)?.lot || 0).padStart(6, '0')}`);
  const query = farmIds ? { villageId, farmId: { $in: storageIds } } : { villageId };
  for (const row of await collections.crops.find(query).toArray()) {
    const id = farmIds?.find(id => decodeFarmId(id)?.lot === Number(row.farmId.slice(-6))) || row.farmId;
    if (!farms[id]) farms[id] = {};
    farms[id][row.tileKey] = { state: row.state, crop: row.crop, plantedAt: row.plantedAt, wateredAt: row.wateredAt, yield: row.yield, stolenAmount: row.stolenAmount, tutorialFastGrowth: row.tutorialFastGrowth };
  }
  return farms;
}

export async function loadPublicFarmProfiles(playerIds) {
  if (!playerIds.length) return [];
  const docs = await collections.players.find(
    { playerId: { $in: playerIds } },
    { projection: {
      _id: 0, playerId: 1, name: 1,
      'progress.level': 1, 'progress.homeTier': 1, 'progress.barnLevel': 1,
      'progress.outfit': 1, livestock: 1,
      'progress.animalPens': 1,
    } },
  ).toArray();
  return docs.map(doc => ({
    playerId: doc.playerId,
    userName: doc.name,
    name: doc.name,
    level: doc.progress?.level || 1,
    homeTier: doc.progress?.homeTier || 1,
    barnLevel: doc.progress?.barnLevel || 1,
    outfit: doc.progress?.outfit || 'starter',
    animalPens: doc.progress?.animalPens || {},
    livestock: (doc.livestock || []).map(a => ({ id: a.id, species: a.species, fedAt: a.fedAt, productReadyAt: a.productReadyAt })),
    animals: (doc.livestock || []).reduce((counts, animal) => {
      counts[animal.species] = (counts[animal.species] || 0) + 1;
      return counts;
    }, {}),
  }));
}

export async function likeFarm(playerId, villageId, farmId) {
  if (!/^farm_\d{6}$/.test(farmId)) return { error: 'Nông trại không hợp lệ.' };
  let added = true;
  try { await collections.likes.insertOne({ villageId, farmId, playerId, createdAt: Date.now() }); } catch (error) { if (error?.code === 11000) added = false; else throw error; }
  const count = await collections.likes.countDocuments({ villageId, farmId });
  return { added, count };
}

export async function updateFriend(playerId, friendId, add = true) {
  friendId = String(friendId || '').slice(0, 64);
  if (!friendId || friendId === playerId || !(await collections.players.findOne({ playerId: friendId }, { projection: { _id: 1 } }))) return { error: 'Người chơi không hợp lệ.' };
  if (add) await collections.friendships.updateOne({ playerId, friendId }, { $setOnInsert: { playerId, friendId, createdAt: Date.now() } }, { upsert: true });
  else await collections.friendships.deleteOne({ playerId, friendId });
  return loadSocialState(playerId);
}

export async function loadSocialState(playerId) {
  const relations = await collections.friendships.find({ playerId }).toArray();
  const friendIds = relations.map(item => item.friendId);
  const [friends, leaderboard] = await Promise.all([
    collections.players.find({ playerId: { $in: friendIds } }, { projection: { _id: 0, playerId: 1, name: 1, 'progress.level': 1, 'progress.outfit': 1 } }).toArray(),
    collections.players.find({}, { projection: { _id: 0, playerId: 1, name: 1, 'progress.level': 1, 'progress.xp': 1, 'progress.homeTier': 1 } }).sort({ 'progress.xp': -1 }).limit(20).toArray(),
  ]);
  return { friends, leaderboard };
}
