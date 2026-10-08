import assert from 'node:assert/strict';
import {LAND_EXPANSION_CONFIG,landUnlockQuote,unlockFarmTile,farmTileKeys,normalizeLandProgress} from '../shared/landExpansionConfig.js';
assert.equal(LAND_EXPANSION_CONFIG.version,3);
const p={coins:2000000,level:20,unlockedTileKeys:[...LAND_EXPANSION_CONFIG.initialTiles]};
const expected=[2500,6500,7000,8000,...Array(4).fill(20000),...Array(6).fill(60000),...Array(6).fill(120000)];
for(const cost of expected){const key=farmTileKeys().find(k=>!landUnlockQuote(p,k).error);const before=p.coins;assert.equal(landUnlockQuote(p,key).cost,cost);unlockFarmTile(p,key);assert.equal(p.coins,before-cost);}
assert.equal(p.unlockedTileKeys.length,24);
const saved={coins:99,level:1,unlockedTileKeys:['0:0','1:0','2:0','3:0','4:0'],landExpansionVersion:1};
normalizeLandProgress(saved);assert.equal(saved.coins,99);assert.equal(saved.unlockedPlots,5);assert.equal(saved.landExpansionVersion,3);assert.equal(landUnlockQuote({...saved,coins:10000},'5:0').cost,6500);
const v2={coins:99,level:1,unlockedTileKeys:['0:0','1:0','2:0','3:0','4:0'],landExpansionVersion:2};normalizeLandProgress(v2);assert.equal(v2.coins,99);assert.equal(v2.unlockedTileKeys.length,5);assert.equal(v2.landExpansionVersion,3);
assert(landUnlockQuote({coins:2499,level:20,unlockedTileKeys:[...LAND_EXPANSION_CONFIG.initialTiles]},'4:0').error);
console.log('PASS land prices: all 20 purchase quotes, exact charges, preserved old tiles/balances and insufficient funds.');
