import assert from 'node:assert/strict';
import {applyLivestockAction as act} from '../shared/livestockActions.js';
import {livestockLife,LIVESTOCK_LIFECYCLE as cfg} from '../shared/livestockLifecycle.js';
import {FARM_CONFIG} from '../shared/farmConfig.js';
for(const species of Object.keys(FARM_CONFIG.animals)){
 const p={progress:{coins:10000,xp:0,stats:{animalsFed:0},inventory:{},barnLevel:10,animalPens:{[species]:true}},livestock:[]};
 act(p,'buy_animal',{species},1000,()=>species);const a=p.livestock[0];
 assert.equal(livestockLife(a,1000).stage,'baby');assert.equal(livestockLife(a,1000).scale,.55);
 act(p,'feed_animals',{id:species},2000);
 assert.equal(a.matureAt,2000+cfg.growthMs[species]);
 assert.equal(livestockLife(a,2000+cfg.growthMs[species]/2).stage,'growing');
 assert.equal(livestockLife(a,a.matureAt).stage,'adult');
 assert.throws(()=>act(p,FARM_CONFIG.animals[species].saleOnly?'sell_animal':'collect_animals',{id:species},a.matureAt-1));
 assert.throws(()=>act(p,'retire_animal',{id:species},a.matureAt));
 const expiry=a.createdAt+cfg.lifespanMs;
 assert.equal(livestockLife(a,expiry).retired,true);
 if(!FARM_CONFIG.animals[species].saleOnly){
  assert.throws(()=>act(p,'retire_animal',{id:species},expiry),/cuối/);
  act(p,'collect_animals',{id:species},expiry);
  assert.throws(()=>act(p,'feed_animals',{id:species},expiry));
 }
 act(p,'retire_animal',{id:species},expiry);assert.equal(p.livestock.length,0);
}
assert.equal(livestockLife({species:'cow',createdAt:1},Date.now()).stage,'adult','Legacy herd never expires retroactively');
console.log('PASS livestock lifecycle: baby/growing/adult, first meal maturation, early yield blocked, 7-day retirement, final harvest and legacy compatibility');
