import {PUBLIC_TRAVEL_DESTINATIONS} from '../../../shared/travelDestinations.js';
import {WORLD_VILLAGES,decodeFarmId} from '../../../shared/villageLayout.js';
import {farmTilePosition} from '../../../shared/farmLayout.js';
import {validMapPoint} from './minimapLayout.js';
export const ALL_MAP_DESTINATIONS=PUBLIC_TRAVEL_DESTINATIONS.map(d=>({...d,destX:d.x,destZ:d.z}));
export function worldMapDestinations(farmId,objective){
 const list=ALL_MAP_DESTINATIONS.slice(),decoded=decodeFarmId(farmId);
 if(decoded&&WORLD_VILLAGES[decoded.order]){
  const target=farmTilePosition(Number(farmId.replace('farm_','')),'0:0');
  if(validMapPoint(target))list.push({id:'farm',label:'Nông trại của bạn',category:'home',badge:WORLD_VILLAGES[decoded.order].name+' · Lô '+decoded.lot,asset:'land',...target});
 }
 if(validMapPoint(objective))list.push({id:'tracked-objective',label:objective.label||'Điểm nhiệm vụ',category:'objective',badge:'Đang theo dõi',asset:'quest',x:objective.x,z:objective.z,canTravel:false});
 return list;
}
export const WORLD_MAP_SCALE=.48;
export const toSvgX=x=>500+x*WORLD_MAP_SCALE;
export const toSvgY=z=>385+z*WORLD_MAP_SCALE;
export const toWorldX=x=>(x-500)/WORLD_MAP_SCALE;
export const toWorldZ=y=>(y-385)/WORLD_MAP_SCALE;
export function worldMapView(player,destination,zoom=1){
 const safeZoom=Math.max(1,Math.min(3,Number.isFinite(zoom)?zoom:1));
 const focus=validMapPoint(destination)?destination:validMapPoint(player)?player:{x:0,z:0};
 const width=1000/safeZoom,height=900/safeZoom;
 return {x:Math.max(0,Math.min(1000-width,toSvgX(focus.x)-width/2)),y:Math.max(0,Math.min(900-height,toSvgY(focus.z)-height/2)),width,height};
}
