import assert from 'node:assert/strict';
import {taiXiuResult,taiXiuPayout} from '../shared/casino/taiXiuRules.js';
import {bauCuaResult,bauCuaPayout} from '../shared/casino/bauCuaRules.js';
import {baiCaoScore,baiCaoPayout} from '../shared/casino/baiCaoRules.js';
import {classifyPlay,validateTienLenPlay,suggestTienLenPlay} from '../shared/casino/tienLenRules.js';
let triples=0;
for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=1;c<=6;c++) {const r=taiXiuResult([a,b,c]);if(r.triple){triples++;assert.equal(taiXiuPayout(r,{tai:10,xiu:10}),0);}else assert.equal(taiXiuPayout(r,{tai:10,xiu:10}),20);}
assert.equal(triples,6);assert.throws(()=>taiXiuResult([0,1,1]));
for(const s of ['bau','cua','tom','ca','ga','nai'])assert.equal(bauCuaPayout(bauCuaResult([s,s,s]),{[s]:10}),40);
assert.equal(baiCaoScore([32,36,40]).faces,true);
assert.equal(baiCaoPayout([32,36,40],[0,4,8],10).reward,20);
assert.equal(baiCaoPayout([0,4,8],[1,5,9],10).reward,10);
assert.throws(()=>baiCaoScore([0,0,1]));
assert.equal(classifyPlay([0,4,8]).type,'straight');assert.equal(classifyPlay([44,48,40]),null);
assert.ok(validateTienLenPlay([0,1],[2],null).error);
assert.deepEqual(suggestTienLenPlay([0,4,8],null,0),[0]);
console.log('Casino rules: 216 dice outcomes, six symbols, banker win/tie and card validation passed.');
