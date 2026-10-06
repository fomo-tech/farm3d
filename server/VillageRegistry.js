import { MongoClient } from 'mongodb';
import { calculateLandPrice, firstLandPurchasePrice, landPricingRadius } from '../shared/landConfig.js';
import { FARM_CONFIG } from '../shared/farmConfig.js';
import { farmGateOpen } from '../shared/farmSecurity.js';
import { decodeFarmId, worldFarmId, worldFarmNumber } from '../shared/villageLayout.js';
import { FARM_ACTIVE_PLOTS, FARM_LOT_SPEC, farmLotPosition, validateFarmLayout } from '../shared/farmLayout.js';

export const LOTS_PER_VILLAGE = 24;
export const FARM_LAYOUT_VERSION = FARM_LOT_SPEC.version;
const INITIAL_VILLAGE_COUNT = 12;
const ICONS = ['sun', 'flower', 'river', 'wind', 'wheat', 'tree', 'blossom', 'mountain', 'clover', 'wave', 'maple', 'sunflower'];
const NAMES = ['Bình Minh', 'Hoa Mai', 'Ven Sông', 'Đồi Gió', 'An Nhiên', 'Mộc Lan', 'Thanh Hà', 'Phú Điền', 'Tân Lộc', 'Hải Vân', 'Thu Phong', 'Hướng Dương'];
const SUFFIXES = ['Thượng', 'Hạ', 'Đông', 'Tây', 'Mới', 'Xanh', 'Bắc', 'Nam'];
const DESCRIPTIONS = ['Đồng cỏ yên bình, phù hợp người mới.', 'Vùng quê nhiều hoa và hàng xóm nhộn nhịp.', 'Khu dân cư cạnh sông, gần tuyến xe buýt.', 'Cao nguyên thoáng đãng cạnh cối xay gió.', 'Miền đất màu mỡ dành cho những mùa vụ lớn.'];
const mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017');
let villages;
let assignments;
let players;

const slugify = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function villageAt(index) {
  const cycle = Math.floor(index / NAMES.length);
  const base = NAMES[index % NAMES.length];
  const label = cycle ? `${base} ${SUFFIXES[(cycle - 1) % SUFFIXES.length]} ${cycle > SUFFIXES.length ? cycle : ''}`.trim() : base;
  const legacyIds = ['binh-minh', 'hoa-mai', 'ven-song', 'doi-gio'];
  return { villageId: legacyIds[index] || `${slugify(label)}-${String(index + 1).padStart(3, '0')}`, name: `Làng ${label}`, icon: ICONS[index % ICONS.length], description: DESCRIPTIONS[index % DESCRIPTIONS.length], order: index, createdAt: Date.now() };
}
export function positionForLot(lot) {
  return farmLotPosition(lot);
}

export async function listVillageAssignments(villageId) {
  const docs = await assignments.find({ ...(villageId ? { villageId } : {}), status: { $ne: 'pending' } }, { projection: { _id: 0, playerId: 1, villageId: 1, lot: 1 } }).toArray();
  const catalog = await villages.find().toArray();
  return docs.map(doc => ({ ...doc, farmId: worldFarmId(catalog.find(v => v.villageId === doc.villageId)?.order || 0, doc.lot) }));
}

export async function isAssignedFarm(villageId, farmId) {
  const decoded = decodeFarmId(farmId);
  if (!decoded) return false;
  const village = await villages.findOne({ order: decoded.order });
  if (!village || village.villageId !== villageId) return false;
  return Boolean(await assignments.findOne({ villageId, lot: decoded.lot, status: { $ne: 'pending' } }, { projection: { _id: 1 } }));
}
export async function villageForFarm(farmId) {
  const decoded = decodeFarmId(farmId);
  return decoded ? villages.findOne({ order: decoded.order }) : null;
}
function assignmentResult(doc, village) {
  const position = positionForLot(worldFarmNumber(village.order, doc.lot));
  return {
    ...doc,
    farmId: worldFarmId(village.order, doc.lot),
    villageName: village.name,
    village: { id: village.villageId, ...village },
    farmConfig: {
      layoutVersion: doc.layoutVersion || FARM_LAYOUT_VERSION,
      activePlots: doc.activePlots || FARM_ACTIVE_PLOTS,
      houseType: doc.houseType || 'starter-house',
      houseTier: doc.houseTier || 1,
      barnType: doc.barnType || 'starter-barn',
      barnTier: doc.barnTier || 1,
      fenceType: doc.fenceType || 'starter-fence',
    },
    spawn: { x: position.x, y: 0, z: position.z - 10 },
  };
}

export async function initVillageRegistry() {
  const layout = validateFarmLayout(INITIAL_VILLAGE_COUNT * LOTS_PER_VILLAGE);
  if (!layout.valid) throw new Error(`Invalid farm layout: ${layout.errors.join('; ')}`);
  await mongo.connect();
  const db = mongo.db(process.env.MONGODB_DB || 'farm_online_3d');
  villages = db.collection('villages'); assignments = db.collection('farm_assignments');
  players = db.collection('players');
  // Recover interrupted purchases. The debit and its receipt are one atomic player write.
  for await (const reserved of assignments.find({ status: 'pending' })) {
    const paid = await players.findOne({ playerId: reserved.playerId, 'landPurchase.purchaseId': reserved.purchaseId });
    if (paid) await assignments.updateOne({ _id: reserved._id }, { $set: { status: 'owned' } });
    else await assignments.deleteOne({ _id: reserved._id, status: 'pending' });
  }
  await Promise.all([
    villages.createIndex({ villageId: 1 }, { unique: true }),
    villages.createIndex({ order: 1 }, { unique: true }),
    assignments.createIndex({ playerId: 1 }, { unique: true }),
    assignments.createIndex({ villageId: 1, lot: 1 }, { unique: true }),
  ]);
  await assignments.updateMany({}, [
    { $set: {
      layoutVersion: FARM_LAYOUT_VERSION,
      activePlots: { $ifNull: ['$activePlots', FARM_ACTIVE_PLOTS] },
      houseType: { $ifNull: ['$houseType', 'starter-house'] },
      houseTier: { $ifNull: ['$houseTier', 1] },
      barnType: { $ifNull: ['$barnType', 'starter-barn'] },
      barnTier: { $ifNull: ['$barnTier', 1] },
      fenceType: { $ifNull: ['$fenceType', 'starter-fence'] },
    } },
  ]);
  for (let index = 0; index < 4; index += 1) {
    const target = villageAt(index);
    const oldId = `${slugify(NAMES[index])}-${String(index + 1).padStart(3, '0')}`;
    if (await villages.findOne({ villageId: oldId }) && !(await villages.findOne({ villageId: target.villageId }))) {
      await assignments.updateMany({ villageId: oldId }, { $set: { villageId: target.villageId } });
      await villages.updateOne({ villageId: oldId }, { $set: { villageId: target.villageId } });
    }
  }
  await ensureSupply();
}

async function ensureSupply() {
  let count = await villages.countDocuments();
  while (count < INITIAL_VILLAGE_COUNT) { const value = villageAt(count); await villages.updateOne({ villageId: value.villageId }, { $setOnInsert: value }, { upsert: true }); count += 1; }
  const villageDocs = await villages.find().toArray();
  const occupancy = await assignments.aggregate([{ $group: { _id: '$villageId', count: { $sum: 1 } } }]).toArray();
  const counts = new Map(occupancy.map(item => [item._id, item.count]));
  let open = villageDocs.filter(v => (counts.get(v.villageId) || 0) < LOTS_PER_VILLAGE).length;
  while (open < 3) { const value = villageAt(count); await villages.insertOne(value); count += 1; open += 1; }
}

export async function listVillages() {
  await ensureSupply();
  const [items, occupancy] = await Promise.all([villages.find().sort({ order: 1 }).toArray(), assignments.aggregate([{ $group: { _id: '$villageId', count: { $sum: 1 } } }]).toArray()]);
  const counts = new Map(occupancy.map(item => [item._id, item.count]));
  return items.map(({ _id, villageId, ...item }) => { const residents = counts.get(villageId) || 0; return { id: villageId, ...item, residents, capacity: LOTS_PER_VILLAGE, available: LOTS_PER_VILLAGE - residents }; });
}

export async function getAssignment(playerId) {
  const doc = await assignments.findOne({ playerId });
  if (!doc) return null;
  if (doc.status === 'pending') {
    const paid = await players.findOne({ playerId, 'landPurchase.purchaseId': doc.purchaseId });
    if (!paid) return null;
    await assignments.updateOne({ _id: doc._id, status: 'pending' }, { $set: { status: 'owned' } });
    doc.status = 'owned';
  }
  const village = await villages.findOne({ villageId: doc.villageId });
  return village ? assignmentResult(doc, village) : null;
}

export async function listLandMarket() {
  const [catalog, occupied] = await Promise.all([villages.find({ order: { $lt: INITIAL_VILLAGE_COUNT } }).sort({ order: 1 }).toArray(), assignments.find().toArray()]);
  const lots = catalog.flatMap(v => Array.from({ length: LOTS_PER_VILLAGE }, (_, i) => {
    const lot = i + 1;
    const position = positionForLot(worldFarmNumber(v.order, lot));
    const owner = occupied.find(a => a.villageId === v.villageId && a.lot === lot);
    return { farmId: worldFarmId(v.order, lot), villageId: v.villageId, villageName: v.name, lot, ...position, distance: Math.round(Math.hypot(position.x, position.z)), ownerId: owner?.status !== 'pending' ? owner?.playerId || null : null, available: !owner, gateOpen: owner ? farmGateOpen(owner) : true, gateUpdatedAt: owner?.gateUpdatedAt || 0 };
  }));
  const farthest = landPricingRadius(lots);
  const names = await players.find({ playerId: { $in: occupied.map(a => a.playerId) } }, { projection: { playerId: 1, name: 1 } }).toArray();
  return lots.map(l => ({ ...l, userName: names.find(p => p.playerId === l.ownerId)?.name || null, price: calculateLandPrice(l, farthest) }));
}

export async function purchaseFarm(playerId, farmId) {
  const existing = await getAssignment(playerId);
  if (existing) return { error: 'Bạn đã sở hữu một lô đất.' };
  const listing = (await listLandMarket()).find(l => l.farmId === farmId);
  if (!listing?.available) return { error: 'Lô đất không hợp lệ hoặc đã có người mua.' };
  const purchasePrice = firstLandPurchasePrice(listing.price);
  const village = await villages.findOne({ villageId: listing.villageId });
  const purchaseId = `${playerId}:${farmId}`;
  const doc = {
    playerId,
    villageId: listing.villageId,
    lot: listing.lot,
    status: 'pending', purchaseId, purchasePrice,
    layoutVersion: FARM_LAYOUT_VERSION,
    activePlots: FARM_ACTIVE_PLOTS,
    houseType: 'starter-house', houseTier: 1,
    barnType: 'starter-barn', barnTier: 1,
    fenceType: 'starter-fence', claimedAt: Date.now(), gateOpen: FARM_CONFIG.security.gate.defaultOpen,
  };
  try { await assignments.insertOne(doc); }
  catch (error) { if (error.code === 11000) return { error: 'Lô đất đang được mua hoặc bạn đã sở hữu đất.' }; throw error; }
  // Unique reservations protect both parcel and buyer. Revision blocks stale economy writes.
  const paid = await players.updateOne({ playerId, 'progress.onboarding.characterCreated': true, 'progress.coins': { $gte: purchasePrice }, landPurchase: { $exists: false } }, {
    $inc: { 'progress.coins': -purchasePrice, revision: 1 },
    $set: { landPurchase: { purchaseId, farmId, price: purchasePrice, listPrice: listing.price, purchasedAt: Date.now() }, 'progress.unlockedPlots': 12, 'progress.homeTier': 1, 'progress.barnLevel': 1, 'progress.ownedHomes': ['starter-cabin'], updatedAt: Date.now() },
  });
  if (!paid.modifiedCount) {
    await assignments.deleteOne({ playerId, purchaseId, status: 'pending' });
    return { error: 'Chưa tạo nhân vật, không đủ xu hoặc bạn đã mua đất.' };
  }
  await assignments.updateOne({ playerId, purchaseId }, { $set: { status: 'owned' } });
  doc.status = 'owned';
  return { assignment: assignmentResult(doc, village) };
}

export const villageChannel = () => 'world:main';
