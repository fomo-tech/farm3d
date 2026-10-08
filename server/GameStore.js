import {APPLE_ORCHARD,appleTreePosition,harvestApples} from '../shared/appleOrchard.js';
import { isValidProfileAvatar } from '../shared/profileAvatar.js';
import {applyLotteryAction} from './LotteryStore.js';
import {fishingBiteBounds} from '../shared/fishingConditions.js';
import { missionStats, PRE_LAND_JOURNEY_VERSION } from '../shared/preLandJourney.js';
import { claimLegacyQuest } from '../shared/questRewards.js';
import { FishingTelemetry, TELEMETRY_OUTBOX_LIMIT } from './FishingTelemetry.js';
import { ECONOMY_REWARD_CONFIG } from '../shared/economyRewardConfig.js';
import { pickFishingCatch } from '../shared/fishingCatch.js';
import { NPC_TRADING_CONFIG, quoteRoadsidePurchase } from '../shared/npcTradingConfig.js';
import { sellFishingCatch } from '../shared/fishingSales.js';
import { MongoClient } from 'mongodb';
import { VEHICLES as VEHICLE_CATALOG } from '../shared/vehicleConfig.js';
import { BEACH_CONFIG } from '../shared/beachConfig.js';
import { advanceFishingSession, normalizeCastInput, FISHING_GAME, fishingTimePhase, claimFishingMission } from '../shared/fishingSession.js';
import { applyLivestockAction } from '../shared/livestockActions.js';
import { CROPS, FARM_CONFIG, farmBarnCapacity, farmBarnUpgradeCost } from '../shared/farmConfig.js';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { FARM_TILE_KEY_PATTERN } from '../shared/farmLayout.js';
import { normalizeLandProgress, unlockedFarmTiles, unlockFarmTile } from '../shared/landExpansionConfig.js';
import { decodeFarmId } from '../shared/villageLayout.js';
import { FarmSecurity, withFarmLock } from './FarmSecurity.js';
import { cropYield } from '../shared/farmSecurity.js';
import {
  FISHING_CONFIG,
  FISHING_GEAR,
  fishingWaterAt,
  fishingCastTarget,
  normalizeFishingState,
  fishingInventoryCount,
  fishingCapacity,
} from '../shared/fishing.js';
import { calculateVerifiedCustomizationCost, normalizeCustomization, getDefaultCustomization } from '../shared/fashionConfig.js';
import { validateEquippedCustomization } from '../shared/fashionValidation.js';
import { applyCommunityReward } from './CommunityRewards.js';
import { claimMission, freshDailyMissions, normalizeMissions } from '../shared/missions.js';

const mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', {
  serverSelectionTimeoutMS: 5000,
});
const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;
let collections;
export function getGameStoreDatabase() { return mongo.db(process.env.MONGODB_DB || 'farm_online_3d'); }
export let farmSecurity;
export let fishingTelemetry;
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
  fishingTelemetry = new FishingTelemetry(database);
  try { await fishingTelemetry.init(); await fishingTelemetry.flush(); }
  catch (error) { console.error('Fishing telemetry initialization deferred:', error.message); }
  await recoverFarmWrites();
  await Promise.all([
    collections.players.createIndex({ playerId: 1 }, { unique: true }),
    collections.players.createIndex({ googleSub: 1 }, { unique: true, sparse: true }),
    collections.players.createIndex({ 'progress.nameKey': 1 }, { unique: true, sparse: true }),
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

const VEHICLES = Object.fromEntries(Object.values(VEHICLE_CATALOG).map(vehicle => [vehicle.id, vehicle.cost]));
const OUTFITS = { starter: 0, farmer: 100, rose: 180, lake: 260, royal: 420 };
const ORDERS = NPC_TRADING_CONFIG.orders;
const RECIPES = NPC_TRADING_CONFIG.recipes;
const QUESTS = ECONOMY_REWARD_CONFIG.quests;
const EXPANSIONS = FARM_CONFIG.expansions;

const initialProgress = () => ({
  version: 3, coins: ECONOMY_REWARD_CONFIG.initial.coins, gems: ECONOMY_REWARD_CONFIG.initial.gems, xp: 0, level: 1, selectedCrop: 'carrot', freeSeeds: 0,
  fishing: normalizeFishingState(),
  inventory: {
    carrot: 0, wheat: 0, tomato: 0, strawberry: 0, pumpkin: 0, melon: 0, turnip: 0,
    apple: 0, egg: 0, duckEgg: 0, milk: 0, wool: 0, flour: 0, cheese: 0, jam: 0,
  },
  stats: { planted: 0, watered: 0, harvested: 0, orders: 0, animalsFed: 0, crafted: 0 },
  claimedQuests: [], completedOrders: [], unlockedPlots: 0, barnLevel: 0, toolLevel: 1,
  missions: { main: { claimed: [] }, daily: null },
  customization: getDefaultCustomization(),
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
  if (!doc || doc.deletedAt) return null;
  const progress = { ...initialProgress(), ...(doc.progress || {}) };
  // Merge newly introduced crop/animal product slots into existing saves
  // without overwriting the player's current inventory.
  progress.inventory = { ...initialProgress().inventory, ...(doc.progress?.inventory || {}) };
  progress.appleReadyAt = Number.isFinite(doc.progress?.appleReadyAt) ? doc.progress.appleReadyAt : (doc.landPurchase?.purchasedAt || doc.createdAt || Date.now()) + APPLE_ORCHARD.cycleMs;
  progress.stats = { ...initialProgress().stats, ...(doc.progress?.stats || {}) };
  progress.onboarding = { version: 1, preLandVersion: PRE_LAND_JOURNEY_VERSION, ...initialProgress().onboarding, ...(doc.progress?.onboarding || {}) };
  progress.fishing = normalizeFishingState(progress.fishing);
  progress.level = levelFromXp(progress.xp);
  normalizeLandProgress(progress);
  const livestock = (doc.livestock || initialLivestock()).map((a, index) => ({ ...a, id: a.id || `legacy-${a.species}-${index}` }));
  progress.missions = normalizeMissions(doc.progress?.missions, missionStats(progress), Date.now(), {hasLand: progress.unlockedPlots > 0, progress, livestock, seed:doc.playerId});
  return { playerId: doc.playerId, token: sessionToken, name: doc.name, googleLinked: Boolean(doc.googleSub), progress, position: doc.position || null, livestock, revision: doc.revision || 0, fishingTelemetryQueued: doc.fishingTelemetryOutbox?.length || 0 };
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

  if (doc.deletedAt) return { error: 'Tài khoản đã được xoá.' };
  let valid = tokensMatch(token, doc.sessionTokenHash)
    || (doc.sessions || []).some(session => Date.now() - session.issuedAt < SESSION_TTL_MS && tokensMatch(token, session.hash));
  // One-time migration for accounts created before Phase 5 stored plaintext tokens.
  if (!valid && token && doc.sessionToken && token === doc.sessionToken) {
    valid = true;
    await collections.players.updateOne({ _id: doc._id }, { $set: { sessionTokenHash: hashSessionToken(token), sessionIssuedAt: doc.sessionIssuedAt || Date.now() }, $unset: { sessionToken: '' } });
    doc.sessionTokenHash = hashSessionToken(token);
  }
  const issuedAt = Number(doc.sessionIssuedAt || doc.updatedAt || doc.createdAt || 0);
  const modernSession = (doc.sessions || []).some(session => Date.now() - session.issuedAt < SESSION_TTL_MS && tokensMatch(token, session.hash));
  if (!valid || (!modernSession && (!issuedAt || Date.now() - issuedAt > SESSION_TTL_MS))) {
    return { error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' };
  }
  return docToPlayer(doc, token);
}

export async function googleAccountLogin(googleSub) {
  let doc = await collections.players.findOne({ googleSub });
  if (!doc) {
    const now = Date.now();
    const playerId = `player_${randomBytes(16).toString('hex')}`;
    const candidate = { playerId, googleSub, googleLinkedAt: now, name: 'Nông dân mới', progress: initialProgress(),
      position: null, livestock: initialLivestock(), revision: 0, createdAt: now, updatedAt: now, sessions: [] };
    try { await collections.players.insertOne(candidate); doc = candidate; }
    catch (error) {
      if (error.code !== 11000) throw error;
      doc = await collections.players.findOne({ googleSub });
      if (!doc) throw error;
    }
  }
  const token = randomBytes(24).toString('hex');
  const session = { hash: hashSessionToken(token), issuedAt: Date.now() };
  await collections.players.updateOne({ playerId: doc.playerId, googleSub }, {
    $push: { sessions: { $each: [session], $slice: -8 } }, $set: { updatedAt: Date.now() },
  });
  return { ...docToPlayer(doc, token), linked: true };
}

export async function linkGoogleAccount(playerId, googleSub) {
  const existing = await collections.players.findOne({ googleSub }, { projection: { playerId: 1, name: 1, 'progress.xp': 1 } });
  if (existing) return existing.playerId === playerId ? { status: 'already-linked' }
    : { status: 'conflict', name: existing.name, level: levelFromXp(existing.progress?.xp || 0) };
  try {
    const result = await collections.players.updateOne({ playerId, googleSub: { $exists: false } },
      { $set: { googleSub, googleLinkedAt: Date.now(), updatedAt: Date.now() } });
    return result.modifiedCount ? { status: 'linked' } : { status: 'different-google' };
  } catch (error) {
    if (error.code === 11000) return { status: 'conflict' };
    throw error;
  }
}

export async function revokeGameSession(playerId, token) {
  const hash = hashSessionToken(token);
  await collections.players.updateOne({ playerId }, { $pull: { sessions: { hash } } });
  await collections.players.updateOne({ playerId, sessionTokenHash: hash }, { $unset: { sessionTokenHash: '', sessionIssuedAt: '' } });
}

export async function savePosition(playerId, position) {
  await collections.players.updateOne({ playerId, deletedAt: { $exists: false } }, { $set: { position, updatedAt: Date.now() } });
}

export async function loadPlayer(playerId) {
  return docToPlayer(await collections.players.findOne({ playerId }));
}

async function savePlayer(player, telemetryEvents = []) {
  player.progress.level = levelFromXp(player.progress.xp);
  const update = { $set: { name: player.name, progress: player.progress, livestock: player.livestock, updatedAt: Date.now() }, $inc: { revision: 1 } };
  if (telemetryEvents.length) {
    if ((player.fishingTelemetryQueued || 0) + telemetryEvents.length <= TELEMETRY_OUTBOX_LIMIT) update.$push = { fishingTelemetryOutbox: { $each: telemetryEvents } };
    else { update.$inc.fishingTelemetryDropped = telemetryEvents.length; update.$set.fishingTelemetryLossAt = Date.now(); }
  }
  const result = await collections.players.updateOne({ playerId: player.playerId, revision: player.revision }, update);
  if (!result.modifiedCount) return null;
  player.revision += 1;
  return player;
}

export async function chargeTravel(playerId, cost) {
  if (!Number.isSafeInteger(cost) || cost < 0) return { error: 'Phí dịch chuyển không hợp lệ.' };
  for (let attempt = 0; attempt < 4; attempt++) {
    const player = await loadPlayer(playerId);
    if (!player) return { error: 'Không tìm thấy người chơi.' };
    if (player.progress.coins < cost) return { error: `Cần ${cost} xu để dịch chuyển.` };
    player.progress.coins -= cost;
    if (await savePlayer(player)) return { player };
  }
  return { error: 'Giao dịch đang bận, vui lòng thử lại.' };
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

export async function performAction(playerId, action, payload = {}, context = {}) {
  context = { ...context, telemetrySession: fishingTelemetry?.sessions.get(context.telemetrySessionId) };
  const rawPlayer=await collections.players.findOne({playerId});
  if(rawPlayer?.livestockTheftClaim){await farmSecurity.recoverLivestock(rawPlayer);return {error:'Chuồng đang được chăm sóc. Hãy thử lại.'};}
  const player = docToPlayer(rawPlayer);
  if (!player) return { error: 'Không tìm thấy người chơi.' };
  const p = player.progress;
  p.fishing = normalizeFishingState(p.fishing);
  const telemetryBefore = action.startsWith('fishing_') ? { coins: p.coins, pending: p.fishing.pending ? {...p.fishing.pending} : null } : null;
  const fail = error => ({ error, player });
  if (['claim_seeds', 'advance_onboarding', 'complete_onboarding'].includes(action) && !await collections.assignments.findOne({ playerId, status: { $ne: 'pending' } })) return fail('Bạn cần sở hữu đất trước.');
  let actionResult = null;
  const fishingZone = () => context.venue ? null : fishingWaterAt(context.x, context.z);
  const atFishingShop = () => context.venue === 'fishing' || (!context.venue && Math.hypot(context.x-BEACH_CONFIG.vendor.x,context.z-BEACH_CONFIG.vendor.z)<=BEACH_CONFIG.vendor.interactionDistance);
  if (action === 'harvest_apples') {
    const decoded=typeof context.farmId==='string'?decodeFarmId(context.farmId):null;
    const assignment=decoded&&context.villageId?await collections.assignments.findOne({playerId,villageId:context.villageId,lot:decoded.lot,status:{$ne:'pending'}}):null;
    const point=appleTreePosition(context.farmId);
    if(!assignment||context.venue||!point||!Number.isFinite(context.x)||!Number.isFinite(context.z)||Math.hypot(context.x-point.x,context.z-point.z)>APPLE_ORCHARD.interactionDistance)return fail('Hãy đứng gần cây táo trong nông trại của bạn.');
    const result=harvestApples(p,Date.now());
    if(result.error)return fail(result.error);
    actionResult={appleHarvest:result};
  }
  else if (action === 'character_create') {
    if (p.onboarding.characterCreated) return fail('Nhân vật đã được tạo.');
    if (typeof payload.name !== 'string' || !payload.name.trim() || payload.name.trim().length > 18) return fail('Tên nhân vật cần từ 3 đến 18 ký tự.');
    const name = sanitizeName(String(payload.name || '').normalize('NFC')).replace(/\s+/g, ' ').trim();
    if (name.length < 3 || name.length > 18) return fail('Tên nhân vật cần từ 3 đến 18 ký tự.');
    const nameKey = name.toLocaleLowerCase('vi');
    const existing = await collections.players.findOne({ playerId: { $ne: playerId }, 'progress.onboarding.characterCreated': true,
      $or: [{ 'progress.nameKey': nameKey }, { name }] }, { collation: { locale: 'vi', strength: 2 } });
    if (existing) return fail('Tên nhân vật đã được sử dụng. Hãy chọn tên khác.');
    player.name = name; p.nameKey = nameKey;
    p.customization = normalizeCustomization(p.customization || {});
    player.customization = p.customization;
    p.outfit = 'starter'; p.onboarding.characterCreated = true; p.onboarding.step = 1;
  }
  else if (action === 'profile_update') {
    if (!p.onboarding?.characterCreated) return fail('Hãy tạo nhân vật trước khi sửa hồ sơ.');
    const rawName = payload.name;
    const rawBio = payload.bio;
    if (typeof rawName !== 'string' || typeof rawBio !== 'string') return fail('Hồ sơ không hợp lệ.');
    const name = sanitizeName(rawName.normalize('NFC')).replace(/\s+/g, ' ').trim();
    const bio = rawBio.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
    if (name.length < 3 || name.length > 18) return fail('Tên nhân vật cần từ 3 đến 18 ký tự.');
    if (bio.length > 80) return fail('Giới thiệu tối đa 80 ký tự.');
    if (payload.avatar !== undefined && !isValidProfileAvatar(payload.avatar)) return fail('Ảnh đại diện không hợp lệ hoặc quá lớn.');
    if (name !== player.name) {
      const nameKey = name.toLocaleLowerCase('vi');
      const existing = await collections.players.findOne({ playerId: { $ne: playerId }, 'progress.onboarding.characterCreated': true,
        $or: [{ 'progress.nameKey': nameKey }, { name }] }, { collation: { locale: 'vi', strength: 2 } });
      if (existing) return fail('Tên nhân vật đã được sử dụng. Hãy chọn tên khác.');
      player.name = name;
      p.nameKey = nameKey;
    }
    p.profileBio = bio;
    if (payload.avatar !== undefined) p.profileAvatar = payload.avatar;
    actionResult = { profileUpdated: { name, bio } };
  }
  else if (action === 'select_crop') { if (!CROPS[payload.crop] || p.level < CROPS[payload.crop].level) return fail('Hạt giống chưa mở khóa.'); p.selectedCrop = payload.crop; }
  else if (action === 'sell_item') { const crop = Object.hasOwn(CROPS, payload.id) ? CROPS[payload.id] : null; const amount = payload.amount ?? 1; if (!Number.isSafeInteger(amount) || amount < 1 || amount > 99) return fail('Số lượng bán phải là số nguyên từ 1 đến 99.'); if (!crop || (p.inventory[payload.id] || 0) < amount) return fail('Không đủ nông sản.'); p.inventory[payload.id] -= amount; p.coins += crop.sellPrice * amount; }
  else if (action === 'deliver_order') { const order = Object.hasOwn(ORDERS, payload.id) ? ORDERS[payload.id] : null; if (!order || p.completedOrders.includes(payload.id) || !requireItems(p, order.items)) return fail('Không thể giao đơn hàng.'); consume(p, order.items); p.coins += order.coins; p.xp += order.xp; p.stats.orders += 1; p.completedOrders.push(payload.id); if (p.onboarding.step === 4) p.onboarding.step = 5; }
  else if (action === 'claim_quest') { const error = claimLegacyQuest(p, payload.id); if (error) return fail(error); actionResult = { questClaimed: { id: payload.id } }; }
  else if (action === 'claim_mission') { const hasLand = Boolean(await collections.assignments.findOne({ playerId, status: { $ne: 'pending' } })); const error = claimMission(p, payload.kind, payload.id, Date.now(), { hasLand, hasLivestock: player.livestock.length > 0, progress:p, livestock:player.livestock, seed:playerId }); if (error) return fail(error); actionResult = { missionClaimed: { kind: payload.kind, id: payload.id } }; }
  else if (action === 'craft') { const recipe = Object.hasOwn(RECIPES, payload.id) ? RECIPES[payload.id] : null; if (!recipe || !requireItems(p, recipe.inputs)) return fail('Không đủ nguyên liệu.'); consume(p, recipe.inputs); p.inventory[payload.id] += 1; p.xp += recipe.xp; p.stats.crafted += 1; }
  else if (action === 'sell_product') { const recipe = Object.hasOwn(RECIPES, payload.id) ? RECIPES[payload.id] : null; if (!recipe || !p.inventory[payload.id]) return fail('Không có sản phẩm.'); p.inventory[payload.id] -= 1; p.coins += recipe.sell; }
  else if (action === 'unlock_plot' || action === 'upgrade_land') {
    const assignment = context.farmId && await loadFarmAssignment(context.villageId, context.farmId);
    if (!assignment || assignment.playerId !== playerId) return fail('Bạn cần sở hữu lô đất để khai hoang.');
    try { actionResult = { plotUnlocked: unlockFarmTile(p, payload.tileKey) }; }
    catch (error) { return fail(error.message); }
  }
  else if (action === 'upgrade_barn') { const cost = farmBarnUpgradeCost(p.barnLevel); if (p.coins < cost) return fail('Không đủ xu nâng kho.'); p.coins -= cost; p.barnLevel += 1; }
  else if (action === 'upgrade_home') { if (p.homeTier >= 2 || p.level < 4 || p.coins < 1800) return fail('Chưa đủ điều kiện nâng nhà.'); p.coins -= 1800; p.homeTier = 2; if (!p.ownedHomes.includes('cozy-manor')) p.ownedHomes.push('cozy-manor'); }
  else if (action === 'buy_vehicle') { if (!Object.hasOwn(VEHICLES, payload.id)) return fail('Xe không hợp lệ.'); const cost = VEHICLES[payload.id]; if (!p.ownedVehicles.includes(payload.id)) { if (p.coins < cost) return fail('Không đủ xu mua xe.'); p.coins -= cost; p.ownedVehicles.push(payload.id); } p.vehicle = payload.id; }
  else if (action === 'buy_outfit') { const cost = OUTFITS[payload.id]; if (cost == null) return fail('Trang phục không hợp lệ.'); if (!p.ownedOutfits.includes(payload.id)) { if (p.coins < cost) return fail('Không đủ xu mua trang phục.'); p.coins -= cost; p.ownedOutfits.push(payload.id); } p.outfit = payload.id; }
  else if (action === 'fashion_save_customization') {
    if (!p.ownedCustomization) p.ownedCustomization = [];
    const requestedIds = Array.isArray(payload.newOwnedItemIds) ? payload.newOwnedItemIds : [];
    let verifiedCost, validNewItemIds, normalized;
    try {
      ({verifiedCost,validNewItemIds}=calculateVerifiedCustomizationCost(p.ownedCustomization,requestedIds));
      normalized=validateEquippedCustomization(payload.customization,[...p.ownedCustomization,...validNewItemIds]);
    } catch(error) { return fail(error.message); }
    if (verifiedCost > 0) {
      if (p.coins < verifiedCost) return fail('Không đủ xu mua trang phục.');
      p.coins -= verifiedCost;
    }
    validNewItemIds.forEach(id => {
      if (!p.ownedCustomization.includes(id)) p.ownedCustomization.push(id);
    });
    p.customization = normalized;
    player.customization = normalized;
    actionResult={fashionUpdated:true};
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
    let castInput;try{castInput=normalizeCastInput(payload);}catch(error){return fail(error.message);}
    const reach=Math.min(rod.castDistance,FISHING_CONFIG.zones[zone].castDistance)*(.7+.3*castInput.power);
    const target = fishingCastTarget(context.x,context.z,zone,reach,castInput.aim);
    if(!target)return fail('Không tìm thấy mặt nước trong tầm cần câu.');
    const bait = baitId ? FISHING_CONFIG.baits[baitId] : null;
    if (baitId) {
      if (!(p.fishing.bait[baitId] > 0)) return fail('Đã hết mồi câu.');
      p.fishing.bait[baitId] -= 1;
    }
    const catchData = pickFishingCatch(zone, baitId);
    if (!catchData) return fail('Vùng nước này chưa có dữ liệu cá.');
    const now = Date.now();
    const bounds=fishingBiteBounds(zone,baitId,rod.id,now);
    const minBite=bounds.minMs,maxBite=bounds.maxMs;
    const biteAt = now + Math.floor(minBite + Math.random() * Math.max(1, maxBite - minBite));
    p.fishing.pending = {
      id: randomBytes(16).toString('hex'), phase: 'waiting', x: context.x, z: context.z,
      timePhase: fishingTimePhase(now),
      conditionDay:bounds.dayKey,density:bounds.condition,
      target,
      zone,
      rodId: p.fishing.equippedRod,
      baitId,
      castAt: now,
      castPower:castInput.power,aim:castInput.aim,
      castQuality:castInput.power>=.65&&castInput.power<=.85?'accurate':'normal',
      biteAt,
      expiresAt: biteAt + FISHING_GAME.hookWindowMs,
      fishId: catchData.fishId,
      weight: catchData.weight,
      castDistance: Math.hypot(target.x-context.x,target.z-context.z),
    };
  }
  else if (['fishing_reel', 'fishing_pull', 'fishing_cancel'].includes(action)) {
    try { actionResult = advanceFishingSession(p.fishing, action, payload, context); }
    catch(error) { return fail(error.message); }
    if (actionResult.fishCaught) p.xp += actionResult.xp;
  }
  else if (action === 'fishing_sell' || action === 'fishing_sell_all') {
    if(!atFishingShop())return fail('Hãy mang cá tới tiệm đồ câu hoặc quầy Lão Ngư để bán.');
    try {
      const sale = sellFishingCatch(p.fishing, action, payload);
      p.coins += sale.coins;
      actionResult = { fishSold: sale };
    } catch (error) { return fail(error.message); }
  }
  else if(action==='fishing_claim_mission') {
    try{const reward=claimFishingMission(p.fishing,payload.id);p.coins+=reward.coins;p.xp+=reward.xp;actionResult={fishingMission:payload.id};}
    catch(error){return fail(error.message);}
  }
  else if (action === 'casino') return fail('Hãy tham gia bàn Tài Xỉu hoặc Bầu Cua online.');
  else if (['build_pen', 'buy_animal', 'retire_animal', 'feed_animals', 'collect_animals', 'sell_animal'].includes(action)) {
    if (!context.farmId || (await loadFarmAssignment(context.villageId, context.farmId))?.playerId !== playerId) return fail('Bạn cần sở hữu nông trại trước.');
    try { applyLivestockAction(player, action, payload); actionResult = {livestockAction: action}; } catch (error) { return fail(error.message); }
  }
  else if (action === 'sell_livestock_product') {
    const product = Object.hasOwn(FARM_CONFIG.products, payload.id) ? FARM_CONFIG.products[payload.id] : null;
    if (!product || !(p.inventory[payload.id] > 0)) return fail('Không có sản phẩm để bán.');
    p.inventory[payload.id] -= 1; p.coins += product.sellPrice;
    actionResult = {livestockAction: action};
  }
  else if (action === 'claim_seeds') { if (p.onboarding.step !== 1) return fail('Chưa đến bước nhận hạt giống.'); if (!p.onboarding.freeSeedsReceived) { p.freeSeeds += ECONOMY_REWARD_CONFIG.onboarding.seeds.seeds; p.coins += ECONOMY_REWARD_CONFIG.onboarding.seeds.coins; p.onboarding.freeSeedsReceived = true; } p.onboarding.step = 2; }
  else if (action === 'advance_onboarding') { const step = Number(payload.step); if (step !== 4 || p.onboarding.step !== 3) return fail('Không thể bỏ qua bước hướng dẫn.'); p.onboarding.step = 4; }
  else if (action === 'complete_onboarding') { if (p.onboarding.step !== 5) return fail('Bạn chưa hoàn thành chuỗi hướng dẫn.'); p.onboarding.completed = true; p.onboarding.step = 6; /* Keep today's assignment and claims when the farm tutorial completes. */ if (!p.onboarding.bicycleAwarded) { p.coins += ECONOMY_REWARD_CONFIG.onboarding.completion.coins; p.xp += ECONOMY_REWARD_CONFIG.onboarding.completion.xp; if (!p.ownedVehicles.includes(ECONOMY_REWARD_CONFIG.onboarding.completion.vehicle)) p.ownedVehicles.push(ECONOMY_REWARD_CONFIG.onboarding.completion.vehicle); p.onboarding.bicycleAwarded = true; } p.vehicle = 'bike'; }
  else if (action === 'reset_onboarding') { p.onboarding = { ...p.onboarding, characterCreated: true, step: 1, completed: false }; }
  else if (action === 'help_friend') return fail('Hãy tưới cây trong nông trại bạn bè để nhận thưởng qua hành động đã xác thực.');
  else if (['claim_daily_reward','redeem_giftcode'].includes(action)) {
    try { actionResult=applyCommunityReward(p,action,payload); } catch(error) { return fail(error.message); }
  }
  else if (['lottery_buy','lottery_claim'].includes(action)) {
    try { actionResult=await applyLotteryAction(getGameStoreDatabase(),p,action,payload,context); } catch(error) { return fail(error.message); }
  }
  else if (action === 'roadside_buy') {
    try {
      const offer = quoteRoadsidePurchase(p, payload, context);
      p.coins -= offer.price;
      p.inventory[offer.crop] = (p.inventory[offer.crop] || 0) + offer.amount;
      actionResult = { roadsidePurchase: { crop: offer.crop, amount: offer.amount, price: offer.price, version: NPC_TRADING_CONFIG.version } };
    } catch (error) { return fail(error.message); }
  }
  else if (action === 'reset_orders') { if (p.completedOrders.length < Object.keys(ORDERS).length || p.coins < NPC_TRADING_CONFIG.orderResetCost) return fail('Chưa thể làm mới đơn hàng.'); p.coins -= NPC_TRADING_CONFIG.orderResetCost; p.completedOrders = []; }
  else return fail('Hành động không được hỗ trợ.');
  if(action.startsWith('fishing_'))actionResult={...actionResult,fishingUpdated:true};
  try {
    const telemetryEvents = telemetryBefore ? fishingTelemetry.committedEvents(player, telemetryBefore, action, payload, actionResult, context) : [];
    if (!(await savePlayer(player, telemetryEvents))) return fail('Xung đột giao dịch, vui lòng thử lại.');
  } catch (error) {
    if (['character_create', 'profile_update'].includes(action) && error.code === 11000) return fail('Tên nhân vật đã được sử dụng. Hãy chọn tên khác.');
    throw error;
  }
  return { player, ...(actionResult ? { result: actionResult } : {}) };
}

export async function farmAction(playerId, villageId, ownedFarmId, payload) {
  return withFarmLock(`player-farm:${playerId}`, () => withFarmLock(payload.farmId, async () => {
    await recoverFarmWrites({ 'progress.pendingFarmWrite.farmId': payload.farmId });
    return applyFarmAction(playerId, villageId, ownedFarmId, payload);
  }));
}
// Durable outbox: account changes and the intended crop state are committed
// together in one player document. Replay is idempotent after a crash; unlike
// Mongo transactions this also works on a standalone local MongoDB server.
async function recoverFarmWrites(filter = {}) {
  for await (const player of collections.players.find({ ...filter, 'progress.pendingFarmWrite.id': { $exists: true } })) {
    const write = player.progress.pendingFarmWrite;
    await collections.crops.replaceOne({ villageId: write.villageId, farmId: write.storageFarmId, tileKey: write.tileKey },
      { ...write.next, villageId: write.villageId, farmId: write.storageFarmId, tileKey: write.tileKey }, { upsert: true });
    await collections.players.updateOne({ playerId: player.playerId, 'progress.pendingFarmWrite.id': write.id },
      { $unset: { 'progress.pendingFarmWrite': '' }, $inc: { revision: 1 } });
  }
}
async function applyFarmAction(playerId, villageId, ownedFarmId, payload) {
  const player = docToPlayer(await collections.players.findOne({ playerId }));
  if (!player) return { error: 'Người chơi không tồn tại.' };
  const { farmId, tileKey, action } = payload;
  if (!/^farm_\d{6}$/.test(farmId) || !FARM_TILE_KEY_PATTERN.test(tileKey)) return { error: 'Ô đất không hợp lệ.' };
  if (farmId === ownedFarmId && !unlockedFarmTiles(player.progress).includes(tileKey)) return { error: 'Ô đất này chưa được khai hoang.' };
  const ownerAction = ['till', 'plant', 'harvest'].includes(action);
  if (ownerAction && farmId !== ownedFarmId) return { error: 'Bạn không sở hữu nông trại này.' };
  const storageFarmId = `farm_${String(decodeFarmId(farmId).lot).padStart(6, '0')}`;
  const row = await collections.crops.findOne({ villageId, farmId: storageFarmId, tileKey });
  const current = row || { state: 'empty' };
  if (current.theftClaim) { await farmSecurity.recover(current); return { error: 'Cây đang được chăm sóc. Hãy thử lại sau nhé.' }; }
  if (farmId !== ownedFarmId) {
    const assignment = await loadFarmAssignment(villageId, farmId);
    if (!farmSecurity.gateOpen(assignment)) return { error: 'Cổng nông trại đã đóng.' };
    const owner = await collections.players.findOne({ playerId: assignment.playerId });
    if (!unlockedFarmTiles(owner?.progress).includes(tileKey)) return { error: 'Ô đất này chưa được khai hoang.' };
  }
  const now = Date.now(); let next;
  if (action === 'till') { if (current.state !== 'empty') return { error: 'Ô đất không thể cuốc.' }; next = { state: 'tilled' }; }
  else if (action === 'plant') { const crop = CROPS[payload.crop]; if (current.state !== 'tilled' || !crop || player.progress.level < crop.level) return { error: 'Không thể gieo hạt.' }; if (player.progress.freeSeeds > 0 && payload.crop === 'carrot') player.progress.freeSeeds -= 1; else { if (player.progress.coins < crop.seedCost) return { error: 'Không đủ xu mua hạt.' }; player.progress.coins -= crop.seedCost; } player.progress.stats.planted += 1; player.progress.xp += 2; const tutorial = player.progress.onboarding.step === 2; next = { state: 'planted', crop: payload.crop, plantedAt: now, tutorialFastGrowth: tutorial, yield: tutorial ? FARM_CONFIG.security.theft.tutorialYield : FARM_CONFIG.security.theft.normalYield, stolenAmount: 0 }; }
  else if (action === 'water') { if (current.state !== 'planted') return { error: 'Cây chưa thể tưới.' }; player.progress.stats.watered += 1; player.progress.xp += farmId === ownedFarmId ? 1 : 5; if (farmId !== ownedFarmId) player.progress.coins += 5; next = { state: 'watered', crop: current.crop, plantedAt: current.plantedAt, wateredAt: now, tutorialFastGrowth: Boolean(current.tutorialFastGrowth), yield: current.yield || 1, stolenAmount: 0 }; }
  else if (action === 'harvest') {
    const crop = CROPS[current.crop]; const growMs = current.tutorialFastGrowth ? FARM_CONFIG.care.tutorialGrowMs : crop?.growMs;
    if (current.state !== 'watered' || !crop || now - current.wateredAt < growMs) return { error: 'Cây chưa chín.' };
    const amount = cropYield(current) - (current.stolenAmount || 0);
    if (inventoryCount(player.progress) + amount > barnCapacity(player.progress)) return { error: 'Kho đã đầy.' };
    player.progress.inventory[current.crop] = (player.progress.inventory[current.crop] || 0) + amount;
    player.progress.stats.harvested += 1; player.progress.xp += 8;
    if (player.progress.onboarding.step === 2) player.progress.onboarding.step = 3;
    next = { state: 'tilled', yield: 0, stolenAmount: 0, tutorialFastGrowth: false };
  }
  else return { error: 'Hành động ruộng không hợp lệ.' };
  player.progress.pendingFarmWrite = { id: randomBytes(16).toString('hex'), farmId, storageFarmId, villageId, tileKey, next };
  if (!(await savePlayer(player))) return { error: 'Xung đột giao dịch, vui lòng thử lại.' };
  await recoverFarmWrites({ playerId });
  return { player: await loadPlayer(playerId), tileData: next };
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
      'progress.outfit': 1, livestock: 1, createdAt:1, 'landPurchase.purchasedAt':1, 'progress.appleReadyAt':1,
      'progress.animalPens': 1, 'progress.unlockedPlots': 1, 'progress.unlockedTileKeys': 1,
    } },
  ).toArray();
  return docs.map(doc => ({
    playerId: doc.playerId,
    userName: doc.name,
    name: doc.name,
    level: doc.progress?.level || 1,
    homeTier: doc.progress?.homeTier || 1,
    barnLevel: doc.progress?.barnLevel || 1,
    appleReadyAt: Number.isFinite(doc.progress?.appleReadyAt)?doc.progress.appleReadyAt:(doc.landPurchase?.purchasedAt||doc.createdAt||Date.now())+APPLE_ORCHARD.cycleMs,
    outfit: doc.progress?.outfit || 'starter',
    unlockedTileKeys: unlockedFarmTiles(doc.progress),
    animalPens: doc.progress?.animalPens || {},
    livestock: (doc.livestock || []).map(a => ({ id: a.id, species: a.species, createdAt:a.createdAt, lifeVersion:a.lifeVersion, matureAt:a.matureAt, productYield:a.productYield, stolenAmount:a.stolenAmount, fedAt: a.fedAt, productReadyAt: a.productReadyAt })),
    animals: (doc.livestock || []).reduce((counts, animal) => {
      counts[animal.species] = (counts[animal.species] || 0) + 1;
      return counts;
    }, {}),
  }));
}

export async function loadPublicPlayerProfile(playerId) {
  if (typeof playerId !== 'string' || !/^[\w:-]{1,64}$/.test(playerId)) return null;
  const doc = await collections.players.findOne({ playerId }, { projection: {
    _id: 0, playerId: 1, name: 1, createdAt: 1,
    'progress.onboarding.characterCreated': 1, 'progress.profileBio': 1, 'progress.profileAvatar': 1,
    'progress.xp': 1, 'progress.level': 1, 'progress.outfit': 1,
    'progress.homeTier': 1, 'progress.stats.planted': 1,
    'progress.stats.harvested': 1, 'progress.stats.orders': 1,
    'progress.fishing.stats.totalCaught': 1,
  } });
  if (!doc?.progress?.onboarding?.characterCreated) return null;
  const p = doc.progress;
  return {
    playerId: doc.playerId, name: doc.name, bio: p.profileBio || '', avatar: p.profileAvatar || '',
    level: levelFromXp(p.xp || 0), xp: p.xp || 0,
    outfit: p.outfit || 'starter', homeTier: p.homeTier || 0,
    joinedAt: doc.createdAt || null,
    stats: { planted: p.stats?.planted || 0, harvested: p.stats?.harvested || 0, orders: p.stats?.orders || 0, fish: p.fishing?.stats?.totalCaught || 0 },
  };
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
  const active = { deletedAt: { $exists: false }, name: { $type: 'string' } };
  const projection = { _id: 0, playerId: 1, name: 1, 'progress.level': 1, 'progress.xp': 1, 'progress.homeTier': 1, 'progress.profileAvatar': 1, 'progress.coins': 1 };
  const [friends, me] = await Promise.all([
    collections.players.find({ ...active, playerId: { $in: friendIds } }, { projection: { _id: 0, playerId: 1, name: 1, 'progress.level': 1, 'progress.outfit': 1 } }).toArray(),
    collections.players.findOne({ ...active, playerId }, { projection }),
  ]);
  const leaderboards = {}, myRanks = {};
  await Promise.all(['xp','level','home','wealth'].map(async kind => {
    const field = kind === 'home' ? 'homeTier' : kind === 'wealth' ? 'coins' : kind;
    const fallback = kind === 'xp' || kind === 'wealth' ? 0 : 1;
    leaderboards[kind] = await collections.players.aggregate([
      { $match: active }, { $project: projection },
      { $set: { [`progress.${field}`]: { $ifNull: [`$progress.${field}`, fallback] } } },
      { $sort: { [`progress.${field}`]: -1, playerId: 1 } }, { $limit: 20 },
    ]).toArray();
    if (me) {
      const value = me.progress?.[field] ?? fallback;
      const stat = { $ifNull: [`$progress.${field}`, fallback] };
      myRanks[kind] = 1 + await collections.players.countDocuments({ ...active, $expr: { $or: [
        { $gt: [stat, value] }, { $and: [{ $eq: [stat, value] }, { $lt: ['$playerId', playerId] }] },
      ] } });
    }
  }));
  return { friends, leaderboard: leaderboards.xp, leaderboards, myRanks };
}

// Keep an identifier tombstone so a revoked guest token cannot recreate the account.
export async function deleteGameAccount(playerId, token) {
  const existing = await collections.players.findOne({ playerId });
  const retrying = existing?.deletedAt && tokensMatch(token, existing.deletionTokenHash);
  const verified = retrying ? { progress: {} } : await authenticate(playerId, token);
  if (verified.error) return { error: verified.error };
  if (Object.keys(verified.progress.casinoPending || {}).length) return { error: 'Hãy chờ ván chơi kết thúc trước khi xoá tài khoản.' };
  const assignment = await collections.assignments.findOne({ playerId });
  const deletedAt = Date.now();
  await collections.players.replaceOne({ playerId }, { playerId, deletedAt, deletionTokenHash: hashSessionToken(token), revision: -1 });
  if (assignment) {
    const farm = { villageId: assignment.villageId, farmId: `farm_${String(assignment.lot).padStart(6, '0')}` };
    await collections.crops.deleteMany(farm);
    await collections.likes.deleteMany(farm);
  }
  await collections.likes.deleteMany({ playerId });
  await collections.friendships.deleteMany({ $or: [{ playerId }, { friendId: playerId }] });
  const playerKey = createHash('sha256').update(playerId).digest('hex');
  fishingTelemetry.buffer = fishingTelemetry.buffer.filter(event => event.playerKey !== playerKey);
  for (const [id, session] of fishingTelemetry.sessions) if (session.playerKey === playerKey) fishingTelemetry.sessions.delete(id);
  await getGameStoreDatabase().collection('fishing_telemetry').deleteMany({ playerKey });
  await getGameStoreDatabase().collection('casino_ledger').updateMany({ playerId }, { $unset: { playerId: '' } });
  await collections.assignments.deleteMany({ playerId });
  await collections.players.updateOne({ playerId, deletedAt }, { $unset: { deletionTokenHash: '' } });
  return { deleted: true };
}
