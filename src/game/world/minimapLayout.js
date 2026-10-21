import {NETWORK_LAKES,networkLakeVisitPoint} from '../../../shared/waterNetwork.js';
import { RIVER_CONTROL_POINTS, sampleRiverSpline } from '../../../shared/riverLayout.js';
import { ALL_BRIDGES } from '../../../shared/bridgeConfig.js';
import { WORLD_VILLAGES } from '../../../shared/villageLayout.js';
import { FARM_LOT_SPEC, farmLotPosition } from '../../../shared/farmLayout.js';
import { BEACH_CONFIG, beachRoadSegments, beachShoreZ, beachOceanHalfWidth } from '../../../shared/beachConfig.js';
import { LAKE_OUTLINE, LAKE_CONFIG } from '../../../shared/lakeConfig.js';
import { VENUE_LAYOUT } from '../../../shared/venueLayout.js';
import { IS_CITY_MODE } from './gameMode.js';
import { WORLD_LAYOUT } from './worldLayout.js';
import { CITY_LANDMARK_BUILDINGS, CITY_CONNECTOR_ROADS, createCityInfill } from './cityUrbanLayout.js';
import {CITY_REGION_ROADS,CITY_REGION_BUILDINGS} from './cityRegionLayout.js';
export const MINIMAP_SCALE=.30, MINIMAP_RADIUS=36;
export const validMapPoint=p=>p && Number.isFinite(p.x) && Number.isFinite(p.z);
// +Z is south. Babylon yaw zero faces +Z and positive yaw turns east.
export const minimapHeading=yaw=>180-(Number.isFinite(yaw)?yaw:0)*180/Math.PI;
export function projectMapPoint(point,player,clamp=false){
 const dx=(point.x-player.x)*MINIMAP_SCALE,dy=(point.z-player.z)*MINIMAP_SCALE,length=Math.hypot(dx,dy);
 const isClamped=clamp&&length>MINIMAP_RADIUS,ratio=isClamped?MINIMAP_RADIUS/length:1;
 return {x:50+dx*ratio,y:50+dy*ratio,isClamped,bearing:Math.atan2(dy,dx)*180/Math.PI+90,distance:Math.round(length/MINIMAP_SCALE)};
}
const CITY_MINIMAP_POIS=[
 {id:'city-center',label:'Quảng trường trung tâm',x:0,z:0,asset:'map'},
 ...WORLD_LAYOUT.cityDistricts.filter(d=>d.id!=='civic').map(d=>({id:`city-${d.id}`,label:d.label,x:d.x,z:d.z,asset:d.id==='entertainment'?'emote':d.id==='shopping'?'shop':d.id==='community'?'chat':d.id==='services'?'settings':'map'})),
 {id:'city-waterfront',label:'Bến cảng Vibe City',x:146,z:48,asset:'fish'},
 ...Object.entries(VENUE_LAYOUT).map(([id,v])=>({id,label:v.label,...v.entrance,asset:({casino:'emote',fashion:'wardrobe',vehicles:'bike',supplies:'seeds',fishing:'fish'})[id]})),
];
const FARM_MINIMAP_POIS=[
 ...Object.entries(VENUE_LAYOUT).map(([id,v])=>({id,label:v.label,...v.entrance,asset:({casino:'emote',fashion:'wardrobe',vehicles:'bike',supplies:'seeds',fishing:'fish'})[id]})),
 ...NETWORK_LAKES.map(l=>({id:'lake-'+l.id,label:l.label,asset:'fish',...networkLakeVisitPoint(l)})),
 {id:'market',label:'Chợ nông sản',x:-62,z:24,asset:'shop'},
 {id:'elder',label:'Trưởng làng',x:-7.4,z:76,asset:'chat'},
 {id:'beach-fishing',label:'Bến câu biển',x:BEACH_CONFIG.vendor.x,z:BEACH_CONFIG.vendor.z,asset:'fish'},
 ...WORLD_VILLAGES.map(v=>({id:v.id,label:v.name,...v.gate,asset:'gate'})),
];
export const MINIMAP_POIS=IS_CITY_MODE?CITY_MINIMAP_POIS:FARM_MINIMAP_POIS;
export function selectMinimapMarkers(player,home,objective){
 const selected=[];
 const add=(point,kind,asset)=>{
  if(!validMapPoint(point))return;
  const projected=projectMapPoint(point,player,true);
  if(kind==='poi'&&(projected.isClamped||Math.hypot(projected.x-50,projected.y-50)>34))return;
  const node={...point,...projected,kind,asset};
  const overlaps=()=>selected.some(p=>Math.hypot(p.x-node.x,p.y-node.y)<13);
  // Only offscreen home pins shift along the rim; local POIs are never moved.
  if(overlaps()&&node.isClamped&&kind==='home'){
   const angle=Math.atan2(node.y-50,node.x-50);
   for(const offset of [.36,-.36,.72,-.72]){node.x=50+MINIMAP_RADIUS*Math.cos(angle+offset);node.y=50+MINIMAP_RADIUS*Math.sin(angle+offset);if(!overlaps())break;}
  }
  if(overlaps()||(kind==='poi'&&Math.hypot(node.x-50,node.y-50)<11))return;
  selected.push(node);
 };
 add(objective,'objective','quest');add(home,'home','land');
 const nearby=MINIMAP_POIS.slice().sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z));
 for(const poi of nearby){if(selected.filter(p=>p.kind==='poi').length>=4)break;add(poi,'poi',poi.asset);}
 return selected;
}
const segment=(id,x,z,length,width,northSouth)=>({id,x,z,length,width,northSouth});
// Mirrors authored boulevard dimensions; villages, coastal roads and parcels
// derive from shared configs rather than projecting landmarks onto the rim.
const CITY_MINIMAP_ROADS=[
 ...CITY_REGION_ROADS,
 ...CITY_CONNECTOR_ROADS,
 segment('city-north',0,-130,440,12,false),segment('city-north-inner',0,-45,440,10,false),segment('city-south-inner',0,45,440,10,false),segment('city-south',0,130,440,12,false),
 segment('city-west',-130,0,440,12,true),segment('city-west-inner',-45,0,440,10,true),segment('city-east-inner',45,0,440,10,true),segment('city-east',130,0,440,12,true),
 segment('city-outer-north',0,-210,440,10,false),segment('city-outer-south',0,210,440,10,false),segment('city-outer-west',-210,0,440,10,true),segment('city-outer-east',210,0,440,10,true),
 segment('city-central-north',0,0,440,16,true),segment('city-central-west',0,0,440,16,false),
 segment('city-service-finance-west',-80,-90,66,6,true),segment('city-service-finance-east',80,-90,66,6,true),
 segment('city-service-residential',80,102,68,6,false),segment('city-service-port',0,165,320,6,false),segment('city-service-west-edge',-165,0,320,6,true),
 segment('city-waterfront-bridge',169,45,58,10,false),segment('city-waterfront-bridge-central',169,0,58,16,false),segment('city-north-flyover',0,-130,84,9,false),
];
const CITY_GRID=[-240,-210,-130,-45,0,45,130,210,240];
const cityBlockSurfaces=()=>{
 const result=[];
 let index=0;
 for(let xi=0;xi<CITY_GRID.length-1;xi+=1)for(let zi=0;zi<CITY_GRID.length-1;zi+=1){
  const minX=CITY_GRID[xi]+2,maxX=CITY_GRID[xi+1]-2,minZ=CITY_GRID[zi]+2,maxZ=CITY_GRID[zi+1]-2;
  result.push({id:`city-block-${index++}`,x:(minX+maxX)/2,z:(minZ+maxZ)/2,width:maxX-minX,depth:maxZ-minZ});
 }
 return Object.freeze(result);
};
export const CITY_BLOCK_SURFACES=cityBlockSurfaces();
export const CITY_BUILDING_FOOTPRINTS=Object.freeze([...CITY_LANDMARK_BUILDINGS,...createCityInfill(CITY_MINIMAP_ROADS),...CITY_REGION_BUILDINGS].map(b=>({...b,fill:b.height>24?'#8a8e90':b.height>12?'#707678':'#575e60'})));
const FARM_MINIMAP_ROADS=[
 segment('north',0,-350,600,6,true),segment('south',0,162,232,8.5,true),
 segment('west',-84,0,76,8.5,false),segment('east',84,0,76,8.5,false),
 segment('west-link',-122,43,86,8.5,true),segment('east-link',122,43,86,8.5,true),
 segment('beach-link',0,300,44,8.5,true),segment('port',-22,322,40,7.5,false),
 ...[86,-234,-650].map(z=>segment('highway-'+z,0,z,1360,6,false)),
 ...beachRoadSegments().map(s=>segment(s.id,s.x,s.z,s.length,BEACH_CONFIG.road.width,s.isNorthSouth)),
 ...WORLD_VILLAGES.flatMap(v=>[
  ...(v.order?[segment('link-'+v.id,v.offsetX,(v.gate.z-650)/2,v.gate.z+650,5.5,true),segment('spine-'+v.id,v.offsetX,v.offsetZ+182,196,5.5,true)]:[]),
  ...[-60,60].map(dx=>segment(v.id+'-ring-'+dx,v.offsetX+dx,v.offsetZ+176,180,5,true)),
  ...Array.from({length:7},(_,row)=>segment(v.id+'-lane-'+row,v.offsetX,v.offsetZ+98+28*row,120,5,false)),
 ]),
];
export const MINIMAP_ROADS=IS_CITY_MODE?CITY_MINIMAP_ROADS:FARM_MINIMAP_ROADS;
export const MINIMAP_PARCELS=IS_CITY_MODE?[]:WORLD_VILLAGES.flatMap((v,i)=>Array.from({length:24},(_,lot)=>({id:v.id+'-'+lot,...farmLotPosition(i*24+lot+1),width:FARM_LOT_SPEC.estateWidth,depth:FARM_LOT_SPEC.estateDepth})));
export const mapPolygon=points=>points.map(p=>p.x+','+p.z).join(' ');
const shore=Array.from({length:33},(_,i)=>{const x=-BEACH_CONFIG.coast.halfWidth+i*BEACH_CONFIG.coast.halfWidth/16;return{x,z:beachShoreZ(x)};});
const bands=Array.from({length:33},(_,i)=>{const z=BEACH_CONFIG.coast.shoreZ+i*(970-BEACH_CONFIG.coast.shoreZ)/32;return{x:beachOceanHalfWidth(z),z};});
const CITY_WATER_POLYGON=mapPolygon([{x:148,z:-18},{x:180,z:-18},{x:180,z:114},{x:148,z:114}]);
export const MINIMAP_WATER_POLYGON=IS_CITY_MODE?CITY_WATER_POLYGON:mapPolygon([...shore,...bands,...bands.slice().reverse().map(p=>({x:-p.x,z:p.z}))]);
export const MINIMAP_SAND_POLYGON=IS_CITY_MODE?'':mapPolygon([{x:-118,z:318},{x:118,z:318},...shore.slice().reverse()]);
export const MINIMAP_LAKE_POLYGON=IS_CITY_MODE?'':mapPolygon(LAKE_OUTLINE);
export {LAKE_CONFIG};

// Use the scene's exact samples and bank normals, not an approximate straight line.
export const MINIMAP_RIVER_SAMPLES=IS_CITY_MODE?[]:sampleRiverSpline(RIVER_CONTROL_POINTS,110);
const riverBank=side=>MINIMAP_RIVER_SAMPLES.map((cur,i,points)=>{
 const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)];
 const dx=next.x-prev.x,dz=next.z-prev.z,len=Math.hypot(dx,dz)||1;
 return {x:cur.x-side*dz/len*cur.w/2,z:cur.z+side*dx/len*cur.w/2};
});
export const MINIMAP_RIVER_POLYGON=IS_CITY_MODE?'':mapPolygon([...riverBank(1),...riverBank(-1).reverse()]);
export const MINIMAP_BRIDGES=IS_CITY_MODE?[]:ALL_BRIDGES.filter(b=>b.id.startsWith('bridge-highway-')||b.id==='bridge-vensong-pedestrian');
