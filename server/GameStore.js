import { MongoClient } from 'mongodb';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { FARM_TILE_KEY_PATTERN } from '../shared/farmLayout.js';
import { decodeFarmId } from '../shared/villageLayout.js';

const mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', {
  serverSelectionTimeoutMS: 5000,
});
const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;
let collections;
export async function initGameStore() {
  await mongo.connect();
  const database = mongo.db(process.env.MONGODB_DB || 'farm_online_3d');
  collections = { players: database.collection('players'), crops: database.collection('crops'), likes: database.collection('farm_likes'), friendships: database.collection('friendships') };
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

const CROPS = {
  carrot: { seedCost: 5, sellPrice: 12, growMs: 60_000, level: 1 },
  wheat: { seedCost: 12, sellPrice: 30, growMs: 180_000, level: 2 },
  tomato: { seedCost: 20, sellPrice: 52, growMs: 300_000, level: 3 },
  strawberry: { seedCost: 45, sellPrice: 120, growMs: 600_000, level: 5 },
};
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
const EXPANSIONS = [{ plots: 24, cost: 500, level: 3 }, { plots: 36, cost: 1400, level: 6 }, { plots: 48, cost: 3200, level: 9 }];

const initialProgress = () => ({
  version: 3, coins: 180, gems: 15, xp: 0, level: 1, selectedCrop: 'carrot', freeSeeds: 0,
  inventory: { carrot: 0, wheat: 0, tomato: 0, strawberry: 0, egg: 0, milk: 0, flour: 0, cheese: 0, jam: 0 },
  stats: { planted: 0, watered: 0, harvested: 0, orders: 0, animalsFed: 0, crafted: 0 },
  claimedQuests: [], completedOrders: [], unlockedPlots: 0, barnLevel: 0, toolLevel: 1,
  outfit: 'starter', ownedOutfits: ['starter'], vehicle: 'walk', ownedVehicles: ['walk'],
  homeTier: 0, ownedHomes: [], casinoPlays: 0,
  onboarding: { characterCreated: false, step: 0, freeSeedsReceived: false, completed: false, bicycleAwarded: false },
});
const initialLivestock = () => [];
const levelFromXp = xp => Math.min(20, Math.floor(Math.sqrt(xp / 80)) + 1);
const inventoryCount = p => Object.values(p.inventory).reduce((sum, value) => sum + Number(value || 0), 0);
const barnCapacity = p => 20 + (p.barnLevel - 1) * 20;

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
  progress.level = levelFromXp(progress.xp);
  return { playerId: doc.playerId, token: sessionToken, name: doc.name, progress, position: doc.position || null, livestock: doc.livestock || initialLivestock(), revision: doc.revision || 0 };
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

function requireItems(progress, items) { return Object.entries(items).every(([id, count]) => (progress.inventory[id] || 0) >= count); }
function consume(progress, items) { Object.entries(items).forEach(([id, count]) => { progress.inventory[id] -= count; }); }

export async function performAction(playerId, action, payload = {}) {
  const player = docToPlayer(await collections.players.findOne({ playerId }));
  if (!player) return { error: 'Không tìm thấy người chơi.' };
  const p = player.progress;
  const fail = error => ({ error, player });
  if (action === 'character_create') { if (p.onboarding.characterCreated) return fail('Nhân vật đã được tạo.'); player.name = String(payload.name || player.name).slice(0, 24); p.outfit = 'starter'; p.onboarding.characterCreated = true; p.onboarding.step = 1; }
  else if (action === 'select_crop') { if (!CROPS[payload.crop] || p.level < CROPS[payload.crop].level) return fail('Hạt giống chưa mở khóa.'); p.selectedCrop = payload.crop; }
  else if (action === 'sell_item') { const crop = CROPS[payload.id]; const amount = Math.max(1, Math.min(99, Number(payload.amount) || 1)); if (!crop || (p.inventory[payload.id] || 0) < amount) return fail('Không đủ nông sản.'); p.inventory[payload.id] -= amount; p.coins += crop.sellPrice * amount; }
  else if (action === 'deliver_order') { const order = ORDERS[payload.id]; if (!order || p.completedOrders.includes(payload.id) || !requireItems(p, order.items)) return fail('Không thể giao đơn hàng.'); consume(p, order.items); p.coins += order.coins; p.xp += order.xp; p.stats.orders += 1; p.completedOrders.push(payload.id); if (p.onboarding.step === 4) p.onboarding.step = 5; }
  else if (action === 'claim_quest') { const quest = QUESTS[payload.id]; if (!quest || p.claimedQuests.includes(payload.id) || p.stats[quest.stat] < quest.goal) return fail('Nhiệm vụ chưa hoàn thành.'); p.coins += quest.coins; p.xp += quest.xp; p.claimedQuests.push(payload.id); }
  else if (action === 'craft') { const recipe = RECIPES[payload.id]; if (!recipe || !requireItems(p, recipe.inputs)) return fail('Không đủ nguyên liệu.'); consume(p, recipe.inputs); p.inventory[payload.id] += 1; p.xp += recipe.xp; p.stats.crafted += 1; }
  else if (action === 'sell_product') { const recipe = RECIPES[payload.id]; if (!recipe || !p.inventory[payload.id]) return fail('Không có sản phẩm.'); p.inventory[payload.id] -= 1; p.coins += recipe.sell; }
  else if (action === 'upgrade_land') { const item = EXPANSIONS.find(v => v.plots > p.unlockedPlots); if (!item || p.level < item.level || p.coins < item.cost) return fail('Chưa đủ điều kiện mở rộng đất.'); p.coins -= item.cost; p.unlockedPlots = item.plots; }
  else if (action === 'upgrade_barn') { const cost = p.barnLevel * 350; if (p.coins < cost) return fail('Không đủ xu nâng kho.'); p.coins -= cost; p.barnLevel += 1; }
  else if (action === 'upgrade_home') { if (p.homeTier >= 2 || p.level < 4 || p.coins < 1800) return fail('Chưa đủ điều kiện nâng nhà.'); p.coins -= 1800; p.homeTier = 2; if (!p.ownedHomes.includes('cozy-manor')) p.ownedHomes.push('cozy-manor'); }
  else if (action === 'buy_vehicle') { const cost = VEHICLES[payload.id]; if (cost == null) return fail('Xe không hợp lệ.'); if (!p.ownedVehicles.includes(payload.id)) { if (p.coins < cost) return fail('Không đủ xu mua xe.'); p.coins -= cost; p.ownedVehicles.push(payload.id); } p.vehicle = payload.id; }
  else if (action === 'buy_outfit') { const cost = OUTFITS[payload.id]; if (cost == null) return fail('Trang phục không hợp lệ.'); if (!p.ownedOutfits.includes(payload.id)) { if (p.coins < cost) return fail('Không đủ xu mua trang phục.'); p.coins -= cost; p.ownedOutfits.push(payload.id); } p.outfit = payload.id; }
  else if (action === 'casino') { const bet = [10, 50, 100].includes(Number(payload.bet)) ? Number(payload.bet) : 0; if (!bet || p.coins < bet) return fail('Mức cược không hợp lệ.'); const playerRoll = 1 + Math.floor(Math.random() * 6); const houseRoll = 1 + Math.floor(Math.random() * 6); const reward = playerRoll > houseRoll ? bet * 2 : playerRoll === houseRoll ? bet : 0; p.coins += reward - bet; p.casinoPlays += 1; if (!(await savePlayer(player))) return fail('Xung đột giao dịch, vui lòng thử lại.'); return { player, result: { playerRoll, houseRoll, reward, bet } }; }
  else if (action === 'feed_animals') { if (!player.livestock.length) return fail('Bạn chưa có vật nuôi.'); if (p.coins < 20) return fail('Không đủ xu mua thức ăn.'); const now = Date.now(); p.coins -= 20; p.xp += 5; p.stats.animalsFed += 1; player.livestock = player.livestock.map(a => ({ ...a, fedAt: now, productReadyAt: now + (a.species === 'chicken' ? 90_000 : 180_000) })); }
  else if (action === 'collect_animals') { const now = Date.now(); let eggs = 0; let milk = 0; player.livestock = player.livestock.map(a => { if (!a.productReadyAt || a.productReadyAt > now) return a; a.species === 'chicken' ? eggs++ : milk++; return { ...a, productReadyAt: 0 }; }); if (!eggs && !milk) return fail('Sản phẩm chưa sẵn sàng.'); if (inventoryCount(p) + eggs + milk > barnCapacity(p)) return fail('Kho đã đầy.'); p.inventory.egg += eggs; p.inventory.milk += milk; p.xp += (eggs + milk) * 10; }
  else if (action === 'claim_seeds') { if (p.onboarding.step !== 1) return fail('Chưa đến bước nhận hạt giống.'); if (!p.onboarding.freeSeedsReceived) { p.freeSeeds += 3; p.coins += 50; p.onboarding.freeSeedsReceived = true; } p.onboarding.step = 2; }
  else if (action === 'advance_onboarding') { const step = Number(payload.step); if (step !== 4 || p.onboarding.step !== 3) return fail('Không thể bỏ qua bước hướng dẫn.'); p.onboarding.step = 4; }
  else if (action === 'complete_onboarding') { if (p.onboarding.step !== 5) return fail('Bạn chưa hoàn thành chuỗi hướng dẫn.'); p.onboarding.completed = true; p.onboarding.step = 6; if (!p.onboarding.bicycleAwarded) { p.coins += 200; p.xp += 80; if (!p.ownedVehicles.includes('bike')) p.ownedVehicles.push('bike'); p.onboarding.bicycleAwarded = true; } p.vehicle = 'bike'; }
  else if (action === 'reset_onboarding') { p.onboarding = { ...p.onboarding, characterCreated: true, step: 1, completed: false }; }
  else if (action === 'help_friend') { const targetId = String(payload.targetId || '').slice(0, 64); const day = new Date().toISOString().slice(0, 10); if (!p.socialRewards) p.socialRewards = {}; const key = `${day}:${targetId}`; if (!targetId || p.socialRewards[key]) return fail('Hôm nay bạn đã giúp người này rồi.'); p.socialRewards[key] = true; p.coins += 15; p.xp += 5; }
  else if (action === 'roadside_buy') { const offers = { carrot: { amount: 5, price: 50 }, wheat: { amount: 4, price: 100 }, tomato: { amount: 3, price: 135 }, strawberry: { amount: 2, price: 210 } }; const offer = offers[payload.crop]; if (!offer || Number(payload.amount) !== offer.amount || Number(payload.price) !== offer.price || p.coins < offer.price || inventoryCount(p) + offer.amount > barnCapacity(p)) return fail('Giao dịch ven đường không hợp lệ.'); p.coins -= offer.price; p.inventory[payload.crop] += offer.amount; }
  else if (action === 'reset_orders') { if (p.completedOrders.length < Object.keys(ORDERS).length || p.coins < 25) return fail('Chưa thể làm mới đơn hàng.'); p.coins -= 25; p.completedOrders = []; }
  else return fail('Hành động không được hỗ trợ.');
  if (!(await savePlayer(player))) return fail('Xung đột giao dịch, vui lòng thử lại.');
  return { player };
}

export async function farmAction(playerId, villageId, ownedFarmId, payload) {
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
  const now = Date.now(); let next;
  if (action === 'till') { if (current.state !== 'empty') return { error: 'Ô đất không thể cuốc.' }; next = { state: 'tilled' }; }
  else if (action === 'plant') { const crop = CROPS[payload.crop]; if (current.state !== 'tilled' || !crop || player.progress.level < crop.level) return { error: 'Không thể gieo hạt.' }; if (player.progress.freeSeeds > 0 && payload.crop === 'carrot') player.progress.freeSeeds -= 1; else { if (player.progress.coins < crop.seedCost) return { error: 'Không đủ xu mua hạt.' }; player.progress.coins -= crop.seedCost; } player.progress.stats.planted += 1; player.progress.xp += 2; next = { state: 'planted', crop: payload.crop, plantedAt: now }; }
  else if (action === 'water') { if (current.state !== 'planted') return { error: 'Cây chưa thể tưới.' }; player.progress.stats.watered += 1; player.progress.xp += farmId === ownedFarmId ? 1 : 5; if (farmId !== ownedFarmId) player.progress.coins += 5; next = { state: 'watered', crop: current.crop, plantedAt: current.plantedAt, wateredAt: now }; }
  else if (action === 'harvest') { const crop = CROPS[current.crop]; const growMs = player.progress.onboarding.step === 2 ? 8_000 : crop?.growMs; if (current.state !== 'watered' || !crop || now - current.wateredAt < growMs) return { error: 'Cây chưa chín.' }; if (inventoryCount(player.progress) >= barnCapacity(player.progress)) return { error: 'Kho đã đầy.' }; player.progress.inventory[current.crop] += 1; player.progress.stats.harvested += 1; player.progress.xp += 8; if (player.progress.onboarding.step === 2) player.progress.onboarding.step = 3; next = { state: 'tilled' }; }
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
    farms[id][row.tileKey] = { state: row.state, crop: row.crop, plantedAt: row.plantedAt, wateredAt: row.wateredAt };
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
