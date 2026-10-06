import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { MongoClient } from 'mongodb';
import { randomUUID } from 'node:crypto';
import { calculateVerifiedCustomizationCost, getDefaultCustomization, FULL_SETS } from '../shared/fashionConfig.js';
import { validateEquippedCustomization } from '../shared/fashionValidation.js';
import { applyCommunityReward } from '../server/CommunityRewards.js';
import { MovementAuthority } from '../server/MovementAuthority.js';
import { TOWN_SPAWN } from '../shared/playerSpawn.js';

assert.equal(calculateVerifiedCustomizationCost([],['top_hoodie_cozy','top_hoodie_cozy']).verifiedCost,220);
assert.throws(()=>calculateVerifiedCustomizationCost([],['__proto__']));
assert.throws(()=>validateEquippedCustomization({topId:'top_hoodie_cozy'},[]));
assert.throws(()=>validateEquippedCustomization({topId:'unknown'},[]));
assert.equal(validateEquippedCustomization({topId:'top_hoodie_cozy'},['top_hoodie_cozy']).topId,'top_hoodie_cozy');
for (const set of FULL_SETS) {
  const custom=set.customization||{hairStyle:set.hair,hairColor:set.hairColor,topId:set.top,bottomId:set.bottom,shoeId:set.shoes,ears:set.ears};
  validateEquippedCustomization(custom,[set.id]);
}
const rewards={coins:0};
applyCommunityReward(rewards,'claim_daily_reward',{},100000);
assert.throws(()=>applyCommunityReward(rewards,'claim_daily_reward',{},100000));
applyCommunityReward(rewards,'claim_daily_reward',{},100000+86400000);
applyCommunityReward(rewards,'redeem_giftcode',{code:'kaiafarm',coins:999999});
assert.equal(rewards.coins,900);
assert.throws(()=>applyCommunityReward(rewards,'redeem_giftcode',{code:'KAIAFARM'}));
assert.throws(()=>applyCommunityReward(rewards,'redeem_giftcode',{code:'constructor'}));
assert.throws(()=>applyCommunityReward(rewards,'redeem_giftcode',{code:'OLD'},100,{OLD:{coins:1,enabled:true,expiresAt:99}}));
assert.throws(()=>applyCommunityReward(rewards,'redeem_giftcode',{code:'OFF'},100,{OFF:{coins:1,enabled:false,expiresAt:null}}));

const authority=new MovementAuthority(), client={...TOWN_SPAWN,vehicle:'walk',venue:null};
assert.equal(authority.maxSpeed(client),7*1.35,'speed is derived from server-equipped vehicle');
const rider={x:0,z:54,y:0,venue:null,vehicle:'walk'};
assert.equal(authority.board({...rider,x:900},'bus-01A',0),false);
assert.equal(authority.board({...rider,x:10},'bus-01A',0),false,'boarding requires the same close-range stop as the client');
assert.equal(authority.board(rider,'fake-bus',0),false);
assert.equal(authority.board(rider,'bus-01A',0),true);
assert.equal(authority.board(rider,'bus-02A',0),false,'cannot switch buses mid-ride');
assert.equal(authority.isBoarding(rider),true);
assert.equal(authority.maxSpeed(rider),48);
assert.equal(authority.accepts(rider,{x:0,z:58,y:1.35},100),true);
assert.equal(authority.isBoarding(rider),false);
Object.assign(rider,{x:0,z:58,y:1.35});
assert.equal(authority.accepts(rider,{x:0,z:67,y:0.08},1000),false,'cannot jump off between stops');
assert.equal(authority.accepts(rider,{x:20,z:54,y:1.35},1000),false,'bus cannot leave its approved route');
assert.equal(authority.accepts(rider,{x:0,z:54,y:0.08},2000),true,'can alight on the platform');
assert.equal(authority.maxSpeed(rider),7*1.35,'normal speed resumes after alighting');
authority.reset(client,0);
for(let tick=1;tick<=120;tick++) {
  const next={x:client.x+.1,z:client.z};
  assert.ok(authority.accepts(client,next,tick*16));Object.assign(client,next);
}
const spam={...TOWN_SPAWN,vehicle:'walk',venue:null};authority.reset(spam,0);
let accepted=0;
for(let i=0;i<40;i++) { const next={x:spam.x+.2,z:spam.z};if(authority.accepts(spam,next,0)){accepted++;Object.assign(spam,next);} }
assert.ok(accepted<=7,'packet frequency cannot multiply speed');
const wall={x:900,z:900,vehicle:'walk',venue:null};authority.reset(wall,0);
authority.collision.addBox('test-wall',902,903,898,902);
// Isolate the swept-path check from the world perimeter for this fixture.
authority.collision.isColliding=(x,z,r)=>authority.collision.circleHitsBox(x,z,r,{minX:902,maxX:903,minZ:898,maxZ:902});
assert.equal(authority.accepts(wall,{x:905,z:900},1000),false,'cannot tunnel across wall into clear endpoint');

const app=await readFile(new URL('../src/App.jsx',import.meta.url),'utf8');
assert.ok(!/setProgress\(prev => \(\{ \.\.\.prev, coins: prev\.coins [+-]/.test(app),'client must not grant coins');
assert.ok(!app.includes('const updatedCoins = Math.max(0, prev.coins - totalCost)'));
const databaseName=`farm_authority_test_${randomUUID().replaceAll('-','')}`;
process.env.MONGODB_DB=databaseName;
const mongo=new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017',{serverSelectionTimeoutMS:5000});
let failed=false;
try {
  await mongo.connect();const store=await import('../server/GameStore.js');await store.initGameStore();
  await store.authenticate('authority-test',null);
  const players=mongo.db(databaseName).collection('players');
  await players.updateOne({playerId:'authority-test'},{$set:{'progress.coins':5000}});
  const call=(action,payload={})=>store.performAction('authority-test',action,payload,{});
  assert.ok((await call('fashion_save_customization',{customization:{topId:'top_hoodie_cozy'},newOwnedItemIds:[],totalCost:0})).error);
  assert.equal((await store.loadPlayer('authority-test')).progress.coins,5000);
  const bought=await call('fashion_save_customization',{customization:{...getDefaultCustomization(),topId:'top_hoodie_cozy'},newOwnedItemIds:['top_hoodie_cozy','top_hoodie_cozy'],totalCost:0});
  assert.ok(!bought.error,bought.error);assert.equal(bought.player.progress.coins,4780);
  const equipped=await call('fashion_save_customization',{customization:{topId:'top_hoodie_cozy'}});
  assert.ok(!equipped.error);assert.equal(equipped.player.progress.coins,4780);
  const daily=await Promise.all([call('claim_daily_reward'),call('claim_daily_reward')]);
  assert.equal(daily.filter(r=>!r.error).length,1);
  const gift=await Promise.all([call('redeem_giftcode',{code:'KAIAFARM'}),call('redeem_giftcode',{code:'KAIAFARM'})]);
  assert.equal(gift.filter(r=>!r.error).length,1);
  assert.equal((await store.loadPlayer('authority-test')).progress.coins,5480);
  assert.ok((await call('help_friend',{targetId:'fake-target'})).error);
  assert.ok((await call('redeem_giftcode',{code:'unknown',coins:999999})).error);
  const saved=await store.loadPlayer('authority-test');assert.equal(saved.progress.communityRewards.codes.length,1);
  assert.equal(saved.progress.coins,5480);
  console.log('PASS authority: verified ownership/pricing/sets, server rewards, concurrent replay rejection, persistence, fake-help rejection, swept collisions and packet speed budget');
} catch(error) {failed=true;console.error(error);} finally {if(mongo.topology?.isConnected())await mongo.db(databaseName).dropDatabase();await mongo.close();}
process.exit(failed?1:0);
