import assert from 'node:assert/strict';
import {ALL_MAP_DESTINATIONS,worldMapDestinations,toSvgX,toSvgY,toWorldX,toWorldZ,worldMapView} from '../src/game/world/worldMapDestinations.js';
import {farmTilePosition} from '../shared/farmLayout.js';
import {TOWN_SPAWN} from '../shared/playerSpawn.js';
import {WORLD_VILLAGES} from '../shared/villageLayout.js';
import {NETWORK_LAKES} from '../shared/waterNetwork.js';
import {travelCost} from '../shared/travelConfig.js';
import {existsSync} from 'node:fs';
assert.equal(ALL_MAP_DESTINATIONS.length,3+NETWORK_LAKES.length+WORLD_VILLAGES.length);
assert.equal(ALL_MAP_DESTINATIONS.find(d=>d.id==='town').z,TOWN_SPAWN.z);
for(const v of WORLD_VILLAGES){const d=ALL_MAP_DESTINATIONS.find(d=>d.id===v.id);assert.equal(d.x,v.gate.x);assert.equal(d.z,v.gate.z);}
for(const d of ALL_MAP_DESTINATIONS){assert.ok(toSvgX(d.x)>0&&toSvgX(d.x)<1000);assert.ok(toSvgY(d.z)>0&&toSvgY(d.z)<900);assert.ok(Math.abs(toWorldX(toSvgX(d.x))-d.x)<1e-9);assert.ok(Math.abs(toWorldZ(toSvgY(d.z))-d.z)<1e-9);assert.ok(existsSync(`public/assets/hud/farm-v2/${d.asset}.webp`));}
for(const id of ['farm_000001','farm_000027','farm_000288']){const home=worldMapDestinations(id).find(d=>d.id==='farm');const target=farmTilePosition(Number(id.replace('farm_','')),'0:0');assert.equal(home.x,target.x);assert.equal(home.z,target.z);assert.equal(travelCost({x:0,z:0},home),travelCost({x:0,z:0},target));}
assert.equal(worldMapDestinations('farm_999999').some(d=>d.id==='farm'),false);
assert.equal(worldMapDestinations(null,{x:NaN,z:0}).some(d=>d.category==='objective'),false);
assert.equal(worldMapDestinations(null,{x:116.9,z:-16}).find(d=>d.category==='objective').canTravel,false);
for(const point of [{x:0,z:0},{x:-600,z:-480},{x:0,z:970}])for(const zoom of [1,1.5,2,3]){const v=worldMapView(point,point,zoom);assert.ok(v.x>=0&&v.y>=0&&v.x+v.width<=1000&&v.y+v.height<=900);}
console.log('PASS: popup destinations, shared home/spawn coordinates, travel fee parity, view bounds and WebP assets');
