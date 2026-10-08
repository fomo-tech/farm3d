import assert from 'node:assert/strict';
import {livestockTheftPolicy,livestockProductAmount} from '../shared/livestockTheft.js';
import {collectFarmProducts,FARM_CONFIG} from '../shared/farmConfig.js';
const animal={id:'hen',species:'chicken',productReadyAt:100,productYield:4};
const args={animal,owner:false,gateOpen:true,now:100,claimedAt:0};
// Use a clock after the new-farm protection window.
args.now=1e8;
assert.equal(livestockTheftPolicy(args).amount,4);
for(const variant of [{owner:true},{gateOpen:false},{now:99},{animal:{...animal,species:'pig'}},{animal:{...animal,stolenAmount:1}},{playerCount:10},{farmCount:6},{claimedAt:args.now}])assert.ok(livestockTheftPolicy({...args,...variant}).error);
const result=collectFarmProducts([{...animal,stolenAmount:1}],args.now);
assert.equal(result.products.egg,3);assert.equal(livestockProductAmount({...animal,stolenAmount:1}),3);
assert.equal(result.livestock[0].stolenAmount,0);assert.equal(result.livestock[0].productReadyAt,0);
assert.equal(collectFarmProducts(result.livestock,args.now).count,0);
assert.equal(livestockTheftPolicy({...args,animal:{...animal,productYield:1}}).amount,1);
console.log('PASS livestock theft: full batch, legacy batch, gates, limits and collection reset');
