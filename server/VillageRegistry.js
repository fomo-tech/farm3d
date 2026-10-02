import { MongoClient } from 'mongodb';

export const LOTS_PER_VILLAGE = 24;
const INITIAL_VILLAGE_COUNT = 12;
const ICONS = ['🌅', '🌼', '🏞️', '🌬️', '🌾', '🌳', '🌸', '⛰️', '🍀', '🌊', '🍁', '🌻'];
const NAMES = ['Bình Minh', 'Hoa Mai', 'Ven Sông', 'Đồi Gió', 'An Nhiên', 'Mộc Lan', 'Thanh Hà', 'Phú Điền', 'Tân Lộc', 'Hải Vân', 'Thu Phong', 'Hướng Dương'];
const SUFFIXES = ['Thượng', 'Hạ', 'Đông', 'Tây', 'Mới', 'Xanh', 'Bắc', 'Nam'];
const DESCRIPTIONS = ['Đồng cỏ yên bình, phù hợp người mới.', 'Vùng quê nhiều hoa và hàng xóm nhộn nhịp.', 'Khu dân cư cạnh sông, gần tuyến xe buýt.', 'Cao nguyên thoáng đãng cạnh cối xay gió.', 'Miền đất màu mỡ dành cho những mùa vụ lớn.'];
const mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017');
let villages;
let assignments;

const slugify = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function villageAt(index) {
  const cycle = Math.floor(index / NAMES.length);
  const base = NAMES[index % NAMES.length];
  const label = cycle ? `${base} ${SUFFIXES[(cycle - 1) % SUFFIXES.length]} ${cycle > SUFFIXES.length ? cycle : ''}`.trim() : base;
  const legacyIds = ['binh-minh', 'hoa-mai', 'ven-song', 'doi-gio'];
  return { villageId: legacyIds[index] || `${slugify(label)}-${String(index + 1).padStart(3, '0')}`, name: `Làng ${label}`, icon: ICONS[index % ICONS.length], description: DESCRIPTIONS[index % DESCRIPTIONS.length], order: index, createdAt: Date.now() };
}
export function positionForLot(lot) {
  const index = Math.max(0, lot - 1);
  return { x: -45 + (index % 4) * 30, z: 112 + Math.floor(index / 4) * 28 };
}

export async function listVillageAssignments(villageId) {
  return assignments.find({ villageId }, { projection: { _id: 0, playerId: 1, villageId: 1, lot: 1 } }).toArray();
}
function assignmentResult(doc, village) {
  const position = positionForLot(doc.lot);
  return { ...doc, farmId: `farm_${String(doc.lot).padStart(6, '0')}`, villageName: village.name, village: { id: village.villageId, ...village }, spawn: { x: position.x, y: 0, z: position.z - 10 } };
}

export async function initVillageRegistry() {
  await mongo.connect();
  const db = mongo.db(process.env.MONGODB_DB || 'farm_online_3d');
  villages = db.collection('villages'); assignments = db.collection('farm_assignments');
  await Promise.all([
    villages.createIndex({ villageId: 1 }, { unique: true }),
    villages.createIndex({ order: 1 }, { unique: true }),
    assignments.createIndex({ playerId: 1 }, { unique: true }),
    assignments.createIndex({ villageId: 1, lot: 1 }, { unique: true }),
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
  const village = await villages.findOne({ villageId: doc.villageId });
  return village ? assignmentResult(doc, village) : null;
}

export async function claimFarm(playerId, requestedVillageId) {
  const existing = await getAssignment(playerId);
  if (existing) return existing;
  const village = await villages.findOne({ villageId: requestedVillageId });
  if (!village) return { error: 'Vui lòng chọn một làng hợp lệ.' };
  for (let lot = 1; lot <= LOTS_PER_VILLAGE; lot += 1) {
    try {
      const doc = { playerId, villageId: requestedVillageId, lot, claimedAt: Date.now() };
      await assignments.insertOne(doc);
      await ensureSupply();
      return assignmentResult(doc, village);
    } catch (error) { if (error?.code !== 11000) throw error; const won = await getAssignment(playerId); if (won) return won; }
  }
  return { error: `${village.name} đã hết lô trống. Hãy chọn làng khác.` };
}

export const villageChannel = villageId => `village:${villageId}`;
