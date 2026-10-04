import { MongoClient } from 'mongodb';
import { farmOrigin } from '../shared/farmSecurity.js';
const name = process.argv[2];
if (!/^farm_gate_ui_test_livestock_[a-z0-9_]+$/.test(name || '')) throw new Error('Isolated livestock UI database required');
const mongo=new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'); await mongo.connect();
try {
  const db=mongo.db(name); const p=await db.collection('players').findOne({}, {sort:{createdAt:-1}});
  if (!p) throw new Error('Open isolated UI first');
  const o=farmOrigin('farm_000002');
  await db.collection('players').updateOne({_id:p._id},{$set:{name:'Kiểm thử chăn nuôi',position:{x:o.x,y:0,z:o.z,rotation:0,villageId:'binh-minh',layoutVersion:7},'progress.coins':5000,'progress.barnLevel':2,'progress.homeTier':1,'progress.unlockedPlots':12,'progress.onboarding':{characterCreated:true,completed:true,step:6}},$inc:{revision:1}});
  await db.collection('farm_assignments').updateOne({playerId:p.playerId},{$set:{villageId:'binh-minh',lot:2,status:'owned',gateOpen:false,claimedAt:0,activePlots:12,layoutVersion:7}},{upsert:true});
  console.log('Prepared latest isolated account at lot 2.');
} finally {await mongo.close();}
