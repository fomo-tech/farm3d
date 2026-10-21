import assert from 'node:assert/strict';
import {resolveCityTravel,cityMovementBlocked,cityWorldEnabled,createCityCollision} from '../server/CityWorldPolicy.js';
import {MINIMAP_ROADS} from '../src/game/world/minimapLayout.js';
import {WORLD_LAYOUT} from '../src/game/world/worldLayout.js';
import {CITY_REGION_ROADS} from '../src/game/world/cityRegionLayout.js';
assert.equal(cityWorldEnabled({}),true);
assert.equal(cityWorldEnabled({VITE_WORLD_MODE:'farm'}),true);
for(const d of WORLD_LAYOUT.cityDistricts){const p=resolveCityTravel(d.x,d.z);assert.ok(p,d.id);assert.equal(cityMovementBlocked(p.x,p.z),false,d.id);}
assert.equal(resolveCityTravel(99999,99999),null);
assert.equal(cityMovementBlocked(160,-1310),true);
for(const r of CITY_REGION_ROADS)for(let i=0;i<=40;i++)assert.equal(cityMovementBlocked(r.x1+(r.x2-r.x1)*i/40,r.z1+(r.z2-r.z1)*i/40),false,r.id);
console.log('PASS city server: all destinations safe, every regional road accepted, ocean/lake rejected and farm fallback removed');
const collision=createCityCollision();
assert.equal(collision.venueWalls.length,0,'Legacy shop walls must not block the city');
for(const r of MINIMAP_ROADS.filter(r=>!r.diagonal))for(let i=0;i<=200;i++){
 const x=r.x+(r.northSouth?0:(i/200-.5)*r.length),z=r.z+(r.northSouth?(i/200-.5)*r.length:0);
 for(const b of collision.staticBoxes){
  if(['city-roundabout','city-fountain','city-water-north','city-water-south'].includes(b.id))continue;
  assert.equal(collision.circleHitsBox(x,z,.45,b),false,`Building blocks street: ${r.id} / ${b.id}`);
 }
}
console.log('PASS city street access: no legacy exterior walls and no buildings across street centerlines');
