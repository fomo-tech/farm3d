import {WORLD_LAYOUT} from '../src/game/world/worldLayout.js';
import {insideCityCoast,insideCityLake} from '../src/game/world/cityRegionLayout.js';
import {TOWN_SPAWN,insideTownFountain} from '../shared/playerSpawn.js';
import {WorldCollisionSystem} from '../src/game/physics/WorldCollisionSystem.js';
import {CITY_BUILDING_FOOTPRINTS} from '../src/game/world/minimapLayout.js';
import {CITY_REGION_MOUNTAINS} from '../src/game/world/cityRegionLayout.js';

export function createCityCollision(){
 const collision=new WorldCollisionSystem({cityMode:true});
 for(const b of CITY_BUILDING_FOOTPRINTS){
  const c=Math.abs(Math.cos(b.rotation||0)),s=Math.abs(Math.sin(b.rotation||0)),hw=(c*b.width+s*b.depth+.5)/2,hd=(s*b.width+c*b.depth+.5)/2;
  collision.addBox(b.id,b.x-hw,b.x+hw,b.z-hd,b.z+hd);
 }
 collision.addBox('city-fountain',-5.9,5.9,-5.9,5.9);
 collision.addBox('city-roundabout',-134.75,-125.25,40.25,49.75);
 collision.addBox('city-water-north-edge',148,190,-18,-9);
 collision.addBox('city-water-north',148,190,9,42);
 collision.addBox('city-water-south',148,190,54,114);
 for(const m of CITY_REGION_MOUNTAINS)collision.addBox(`mountain-${m.x}-${m.z}`,m.x-m.radius*.725,m.x+m.radius*.725,m.z-m.radius*.725,m.z+m.radius*.725);
 for(let i=0;i<16;i++){const x=885+i%4*8,z=220+Math.floor(i/4)*14;collision.addBox(`cargo-${i}`,x-2.9,x+2.9,z-5,z+5);}
 return collision;
}

export const cityWorldEnabled=()=>true;
export const cityMovementBlocked=(x,z)=>!insideCityCoast(x,z)||insideCityLake(x,z,.45)||insideTownFountain(x,z);
export function resolveCityTravel(x,z){
 if(!Number.isFinite(x)||!Number.isFinite(z))return null;
 const points=[...WORLD_LAYOUT.cityDistricts,{x:146,z:48}];
 const point=points.find(p=>Math.hypot(x-p.x,z-p.z)<3);
 if(!point)return null;
 const arrival=point.id==='civic'?TOWN_SPAWN:point;
 return cityMovementBlocked(arrival.x,arrival.z)?null:{x:arrival.x,z:arrival.z};
}
