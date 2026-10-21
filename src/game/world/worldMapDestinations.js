import {PUBLIC_TRAVEL_DESTINATIONS} from '../../../shared/travelDestinations.js';
import {WORLD_VILLAGES,decodeFarmId} from '../../../shared/villageLayout.js';
import {farmTilePosition} from '../../../shared/farmLayout.js';
import {validMapPoint} from './minimapLayout.js';
import {IS_CITY_MODE} from './gameMode.js';
import {WORLD_LAYOUT} from './worldLayout.js';
const CITY_MAP_DESTINATIONS=[
 {id:'city-center',label:'Quảng trường trung tâm',category:'city',badge:'Trung tâm Vibe City',asset:'map',x:0,z:0},
 ...WORLD_LAYOUT.cityDistricts.filter(d=>d.id!=='civic').map(d=>({id:`city-${d.id}`,label:d.label,category:'city',badge:'Khu đô thị',asset:d.id==='entertainment'?'emote':d.id==='shopping'?'shop':d.id==='community'?'chat':d.id==='services'?'settings':'map',x:d.x,z:d.z})),
 {id:'city-waterfront',label:'Bến cảng Vibe City',category:'city',badge:'Bến tàu và khu ven nước',asset:'fish',x:146,z:48},
];
export const ALL_MAP_DESTINATIONS=(IS_CITY_MODE?CITY_MAP_DESTINATIONS:PUBLIC_TRAVEL_DESTINATIONS).map(d=>({...d,destX:d.x,destZ:d.z}));
export function worldMapDestinations(farmId,objective){
 const list=ALL_MAP_DESTINATIONS.slice(),decoded=decodeFarmId(farmId);
 if(!IS_CITY_MODE&&decoded&&WORLD_VILLAGES[decoded.order]){
  const target=farmTilePosition(Number(farmId.replace('farm_','')),'0:0');
  if(validMapPoint(target))list.push({id:'farm',label:'Nông trại của bạn',category:'home',badge:WORLD_VILLAGES[decoded.order].name+' · Lô '+decoded.lot,asset:'land',...target});
 }
 if(validMapPoint(objective))list.push({id:'tracked-objective',label:objective.label||'Điểm nhiệm vụ',category:'objective',badge:'Đang theo dõi',asset:'quest',x:objective.x,z:objective.z,canTravel:false});
 return list;
}
// Fit the complete island, from the northern mountains to the southern coast.
export const WORLD_MAP_SCALE=IS_CITY_MODE?.25:.48;
export const WORLD_MAP_ORIGIN_Y=IS_CITY_MODE?650:385;
export const toSvgX=x=>500+x*WORLD_MAP_SCALE;
export const toSvgY=z=>WORLD_MAP_ORIGIN_Y+z*WORLD_MAP_SCALE;
export const toWorldX=x=>(x-500)/WORLD_MAP_SCALE;
export const toWorldZ=y=>(y-WORLD_MAP_ORIGIN_Y)/WORLD_MAP_SCALE;
export function worldMapView(player,destination,zoom=1){
 const safeZoom=Math.max(1,Math.min(IS_CITY_MODE?6:3,Number.isFinite(zoom)?zoom:1));
 const focus=validMapPoint(destination)?destination:validMapPoint(player)?player:{x:0,z:0};
 const width=1000/safeZoom,height=900/safeZoom;
 return {x:Math.max(0,Math.min(1000-width,toSvgX(focus.x)-width/2)),y:Math.max(0,Math.min(900-height,toSvgY(focus.z)-height/2)),width,height};
}
