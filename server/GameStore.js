import { starterAppearance } from '../shared/starterAppearance.js';
import { cityActionAllowed } from '../shared/cityOnlyPolicy.js';
import {cityVitals} from '../shared/cityVitals.js';
import { APPLE_ORCHARD } from '../shared/appleOrchard.js';
import { isValidProfileAvatar } from '../shared/profileAvatar.js';
import { missionStats, PRE_LAND_JOURNEY_VERSION } from '../shared/preLandJourney.js';
import { applyCityAction } from '../shared/cityGameplay.js';
import { FishingTelemetry, TELEMETRY_OUTBOX_LIMIT } from './FishingTelemetry.js';
import { ECONOMY_REWARD_CONFIG } from '../shared/economyRewardConfig.js';
import { NPC_TRADING_CONFIG } from '../shared/npcTradingConfig.js';
import { MongoClient } from 'mongodb';
import { VEHICLES as VEHICLE_CATALOG } from '../shared/vehicleConfig.js';
import { FARM_CONFIG, farmBarnCapacity } from '../shared/farmConfig.js';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { normalizeLandProgress, unlockedFarmTiles } from '../shared/landExpansionConfig.js';
import { decodeFarmId } from '../shared/villageLayout.js';
import { FarmSecurity } from './FarmSecurity.js';
import { normalizeFishingState } from '../shared/fishing.js';
import { calculateVerifiedCustomizationCost, getDefaultCustomization } from '../shared/fashionConfig.js';
import { validateEquippedCustomization } from '../shared/fashionValidation.js';
import { normalizeMissions } from '../shared/missions.js';

const mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', {
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 50, minPoolSize: 2, waitQueueTimeoutMS: 15000, socketTimeoutMS: 15000,
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

export async function checkCharacterName(rawName, playerId) {
  if (typeof rawName !== 'string' || rawName.trim().length < 3 || rawName.trim().length > 18) return { available: false, message: 'Tên nhân vật cần từ 3 đến 18 ký tự.' };
  const name = sanitizeName(rawName.normalize('NFC')).replace(/\s+/g, ' ').trim();
  if (name.length < 3 || name.length > 18) return { available: false, message: 'Tên nhân vật cần từ 3 đến 18 ký tự.' };
  const existing = await collections.players.findOne({ playerId: { $ne: playerId }, 'progress.onboarding.characterCreated': true,
    $or: [{ 'progress.nameKey': name.toLocaleLowerCase('vi') }, { name }] }, { collation: { locale: 'vi', strength: 2 }, projection: { _id: 1 } });
  return { available: !existing, message: existing ? 'Tên này đã được sử dụng. Hãy chọn tên khác.' : 'Tên này có thể sử dụng.' };
}

function sanitizeName(name) {
  return String(name || 'Cư dân').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24) || 'Cư dân';
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

export async function authenticate(playerId, token, name = 'Cư dân') {
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
    const candidate = { playerId, googleSub, googleLinkedAt: now, name: 'Cư dân mới', progress: initialProgress(),
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

const pendingPositions = new Map();
let positionFlushRunning = false;
let positionFlushTimer;
async function flushPositions() {
  if (positionFlushRunning) return;
  positionFlushRunning = true;
  try {
    while (pendingPositions.size) {
      const batch = [...pendingPositions.entries()].slice(0, 100);
      for (const [id] of batch) pendingPositions.delete(id);
      try {
        await collections.players.bulkWrite(batch.map(([playerId, item]) => ({ updateOne: {
          filter: { playerId, deletedAt: { $exists: false } },
          update: { $set: { position: item.position, updatedAt: Date.now() } },
        } })), { ordered: false });
        for (const [, item] of batch) for (const waiter of item.waiters) waiter.resolve();
      } catch (error) {
        for (const [, item] of batch) for (const waiter of item.waiters) waiter.reject(error);
      }
    }
  } finally { positionFlushRunning = false; }
}
export function savePosition(playerId, position) {
  return new Promise((resolve, reject) => {
    const item = pendingPositions.get(playerId) || { waiters: [] };
    item.position = position;
    item.waiters.push({ resolve, reject });
    pendingPositions.set(playerId, item);
    if (!positionFlushRunning && !positionFlushTimer) positionFlushTimer = setTimeout(() => {
      positionFlushTimer = null;
      void flushPositions();
    }, 25);
  });
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
  if(!cityActionAllowed(action)&&!(action==='city_vehicle_impact'&&context.trustedCityImpact===true))return {error:'Gameplay cũ không còn được hỗ trợ trong Vibe City.'};
  context = { ...context, telemetrySession: fishingTelemetry?.sessions.get(context.telemetrySessionId) };
  const rawPlayer=await collections.players.findOne({playerId});
  const player = docToPlayer(rawPlayer);
  if (!player) return { error: 'Không tìm thấy người chơi.' };
  const p = player.progress;
  if(cityVitals(p.city).health===0&&!['city_respawn','city_enter'].includes(action))return {error:'Nhân vật đang bị hạ. Hãy chờ cứu hộ.'};
  p.fishing = normalizeFishingState(p.fishing);
  const fail = error => ({ error, player });
  let actionResult = null;
  if(action.startsWith('city_')){
    try{actionResult=applyCityAction(p,action,payload,context);}catch(error){return fail(error.message);}
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
    const starter = starterAppearance(payload.appearance);
    p.customization = starter.customization;
    p.ownedCustomization = [...new Set([...(p.ownedCustomization || []), ...starter.ownedIds])];
    player.customization = p.customization;
    p.outfit = 'starter'; p.onboarding.characterCreated = true; p.onboarding.step = 6;p.onboarding.completed=true;
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
  else return fail('Hành động không được hỗ trợ trong Vibe City.');

  try {
    const telemetryEvents = [];
    if (!(await savePlayer(player, telemetryEvents))) return fail('Xung đột giao dịch, vui lòng thử lại.');
  } catch (error) {
    if (['character_create', 'profile_update'].includes(action) && error.code === 11000) return fail('Tên nhân vật đã được sử dụng. Hãy chọn tên khác.');
    throw error;
  }
  return { player, ...(actionResult ? { result: actionResult } : {}) };
}

export async function farmAction() { return {error:'Gameplay nông trại đã được gỡ.'}; }

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

let joinLeaderboards;
let joinLeaderboardsExpires = 0;
async function readLeaderboards(active, projection) {
  const result = {};
  await Promise.all(['xp','level','home','wealth'].map(async kind => {
    const field = kind === 'home' ? 'homeTier' : kind === 'wealth' ? 'coins' : kind;
    const fallback = kind === 'xp' || kind === 'wealth' ? 0 : 1;
    result[kind] = await collections.players.aggregate([
      { $match: active }, { $project: projection },
      { $set: { [`progress.${field}`]: { $ifNull: [`$progress.${field}`, fallback] } } },
      { $sort: { [`progress.${field}`]: -1, playerId: 1 } }, { $limit: 20 },
    ]).toArray();
  }));
  return result;
}
function sharedJoinLeaderboards(active, projection) {
  if (!joinLeaderboards || Date.now() >= joinLeaderboardsExpires) {
    joinLeaderboardsExpires = Infinity;
    joinLeaderboards = readLeaderboards(active, projection).then(value => {
      joinLeaderboardsExpires = Date.now() + 1000;
      return value;
    }, error => { joinLeaderboards = null; joinLeaderboardsExpires = 0; throw error; });
  }
  return joinLeaderboards;
}
export async function loadSocialState(playerId, { includeRanks = true } = {}) {
  const relations = await collections.friendships.find({ playerId }).toArray();
  const friendIds = relations.map(item => item.friendId);
  const active = { deletedAt: { $exists: false }, name: { $type: 'string' } };
  const projection = { _id: 0, playerId: 1, name: 1, 'progress.level': 1, 'progress.xp': 1, 'progress.homeTier': 1, 'progress.profileAvatar': 1, 'progress.coins': 1 };
  const [friends, me] = await Promise.all([
    friendIds.length ? collections.players.find({ ...active, playerId: { $in: friendIds } }, { projection: { _id: 0, playerId: 1, name: 1, 'progress.level': 1, 'progress.outfit': 1 } }).toArray() : [],
    includeRanks ? collections.players.findOne({ ...active, playerId }, { projection }) : null,
  ]);
  const leaderboards = await (includeRanks ? readLeaderboards(active, projection) : sharedJoinLeaderboards(active, projection));
  const myRanks = {};
  await Promise.all(['xp','level','home','wealth'].map(async kind => {
    const field = kind === 'home' ? 'homeTier' : kind === 'wealth' ? 'coins' : kind;
    const fallback = kind === 'xp' || kind === 'wealth' ? 0 : 1;
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
