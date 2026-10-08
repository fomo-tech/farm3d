import {NETWORK_LAKES,networkLakeVisitPoint} from './waterNetwork.js';
import {WORLD_VILLAGES} from './villageLayout.js';
import {TOWN_SPAWN} from './playerSpawn.js';
import {farmOrigin} from './farmSecurity.js';
import {farmTilePosition} from './farmLayout.js';
// The map and travel authorization use the same outdoor arrival points.
export const PUBLIC_TRAVEL_DESTINATIONS=Object.freeze([
 {id:'town',label:'Thành phố Bình Minh',category:'city',badge:'Quảng trường',asset:'shop',...TOWN_SPAWN},
 {id:'lake',label:'Hồ Pha Lê',category:'nature',badge:'Bến câu cá',asset:'fish',x:126,z:2},
 ...NETWORK_LAKES.map(lake=>({id:'lake-'+lake.id,label:lake.label,category:'nature',badge:'Bờ hồ · Câu cá',asset:'fish',...networkLakeVisitPoint(lake)})),
 {id:'beach',label:'Biển Bình Minh',category:'nature',badge:'Bãi biển',asset:'land',x:0,z:320},
 ...WORLD_VILLAGES.map(v=>({id:v.id,label:v.name,category:'village',badge:'24 lô nông trại',asset:'gate',...v.gate})),
].map(point=>Object.freeze(point)));
export function resolveTravelDestination(x,z,farmId=null){
 if(!Number.isFinite(x)||!Number.isFinite(z))return null;
 const origin=farmId?farmOrigin(farmId):null;
 const candidates=origin?[...PUBLIC_TRAVEL_DESTINATIONS,{id:'farm',...farmTilePosition(Number(farmId.replace('farm_','')),'0:0')}]:PUBLIC_TRAVEL_DESTINATIONS;
 const nearest=candidates.reduce((best,point)=>Math.hypot(point.x-x,point.z-z)<(best?.distance??12)?{...point,distance:Math.hypot(point.x-x,point.z-z)}:best,null);
 if(nearest)return {x:nearest.x,z:nearest.z};
 if(Math.hypot(x,z-18)<12)return {x:TOWN_SPAWN.x,z:TOWN_SPAWN.z};
 return null;
}
