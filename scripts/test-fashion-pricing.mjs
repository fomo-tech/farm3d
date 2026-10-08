import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as catalog from '../shared/fashionConfig.js';
const previous=JSON.parse(readFileSync(new URL('../docs/fashion-pricing-v2.json',import.meta.url)));
for(const row of previous){
 const item=catalog.ALL_FASHION_ITEMS_MAP[row.id];
 assert.equal(item.cost,row.after);
 if(!row.before) assert.equal(item.cost,0,'starter choices stay free');
 else assert.ok(item.cost>row.before,'paid fashion gets an actual increase');
}
for(const group of ['TOPS','BOTTOMS','SHOES','HAIR_STYLES','EARS_OPTIONS']){
 const tiers=['common','rare','epic','legendary'].map(r=>catalog[group].filter(x=>x.rarity===r&&x.cost>0).map(x=>x.cost)).filter(x=>x.length);
 for(let i=1;i<tiers.length;i++)assert.ok(Math.min(...tiers[i])>Math.max(...tiers[i-1]),`${group} rarity prices are ordered`);
}
const hoodie=catalog.getFashionItem('top_hoodie_cozy');
assert.equal(catalog.calculateVerifiedCustomizationCost([], [hoodie.id,hoodie.id]).verifiedCost,hoodie.cost,'duplicate requests charged once');
assert.equal(catalog.calculateVerifiedCustomizationCost([hoodie.id],[hoodie.id]).verifiedCost,0,'existing ownership stays free to equip');
for(const set of catalog.FULL_SETS)assert.ok(set.cost>=['topId','bottomId','shoeId'].reduce((sum,key)=>sum+(catalog.getFashionItem(set.customization[key])?.cost||0),0),'set price reflects component prices');
console.log('PASS: paid-price increases, free starters, ordered rarities, set pricing and owned-item billing');
