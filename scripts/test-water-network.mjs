import {getBridgeSurfaceHeight} from '../shared/bridgeConfig.js';
import assert from 'node:assert/strict';
import {NETWORK_LAKES,NETWORK_STREAMS,NETWORK_WATER_SHAPES,networkWaterAt,networkCollisionBoxes,networkBridgeAt,NETWORK_BRIDGES} from '../shared/waterNetwork.js';
import {MINIMAP_ROADS,MINIMAP_PARCELS} from '../src/game/world/minimapLayout.js';
import {fishingCastTarget,fishingWaterAt} from '../shared/fishing.js';
assert.equal(NETWORK_LAKES.filter(l=>l.x<0).length,2);assert.equal(NETWORK_LAKES.filter(l=>l.x>0).length,2);for(const l of NETWORK_LAKES)assert.ok(l.rx>=60&&l.rz>=35);
assert.equal(NETWORK_LAKES.length,4);assert.equal(NETWORK_STREAMS.length,5);
for(const l of NETWORK_LAKES){assert.equal(networkWaterAt(l.x,l.z),'lake');assert.equal(fishingWaterAt(l.x,l.z),null);}
for(const s of NETWORK_WATER_SHAPES)for(const p of s.outline){
 assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.z));
 for(const lot of MINIMAP_PARCELS)assert.ok(Math.abs(p.x-lot.x)>lot.width/2+3||Math.abs(p.z-lot.z)>lot.depth/2+3,`${s.id} overlaps farmland`);
 for(const r of MINIMAP_ROADS){const dx=Math.max(0,Math.abs(p.x-r.x)-(r.northSouth?r.width:r.length)/2),dz=Math.max(0,Math.abs(p.z-r.z)-(r.northSouth?r.length:r.width)/2);assert.ok(Math.hypot(dx,dz)>2||networkBridgeAt(p.x,p.z,2),`${s.id} overlaps road ${r.id}`);}
}
for(const l of NETWORK_LAKES){let shore;for(let x=l.x+l.rx*.6;x<l.x+l.rx*1.5;x+=.5)if(!networkWaterAt(x,l.z)&&fishingWaterAt(x,l.z)==='lake'){shore={x,z:l.z};break;}assert.ok(shore);const cast=fishingCastTarget(shore.x,shore.z,'lake',10);assert.ok(cast&&networkWaterAt(cast.x,cast.z),'cast must land in new lake');}
const boxes=networkCollisionBoxes();assert.ok(boxes.length>100);
for(const l of NETWORK_LAKES)assert.ok(boxes.some(b=>l.x>=b.minX&&l.x<=b.maxX&&l.z>=b.minZ&&l.z<=b.maxZ));
for(const bridge of NETWORK_BRIDGES){const {cx:x,cz:z}=bridge;assert.equal(getBridgeSurfaceHeight(x,z),.18);assert.ok(!boxes.some(b=>x>b.minX&&x<b.maxX&&z>b.minZ&&z<b.maxZ),'bridge corridor must stay walkable');}
assert.equal(networkWaterAt(NaN,0),null);
console.log('PASS: four lakes, five branches, shoreline collision, farm and road clearance, shared fishing water checks');
