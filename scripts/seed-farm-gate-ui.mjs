import { MongoClient } from 'mongodb';
const databaseName = process.argv[2];
if (!/^farm_gate_ui_test_[a-z0-9_]+$/.test(databaseName || '')) throw new Error('Only named, isolated UI test databases are permitted');
const mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017');
await mongo.connect();
try {
  const db = mongo.db(databaseName);
  const player = await db.collection('players').findOne({});
  if (!player) throw new Error('Open the isolated test UI first to create its account');
  await db.collection('players').updateOne({ _id: player._id }, { $set: {
    name: 'Kiểm thử cổng', position: { x: -45, y: 0, z: 100, rotation: 0, villageId: 'binh-minh', layoutVersion: 7 },
    'progress.coins': 5000, 'progress.barnLevel': 2, 'progress.homeTier': 1, 'progress.unlockedPlots': 12,
    'progress.onboarding': { characterCreated: true, completed: true, step: 6 }, 'progress.ownedHomes': ['starter-cabin'],
  }, $inc: { revision: 1 } });
  await db.collection('farm_assignments').updateOne({ playerId: player.playerId }, { $set: {
    villageId: 'binh-minh', lot: 1, status: 'owned', gateOpen: false, claimedAt: 0, activePlots: 12, layoutVersion: 7,
  } }, { upsert: true });
  console.log('Seeded isolated gate UI fixture; reload the test page.');
} finally { await mongo.close(); }
