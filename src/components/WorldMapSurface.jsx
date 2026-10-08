import React from 'react';
import {FarmMapTerrain} from './FarmMapTerrain.jsx';
import {minimapHeading,validMapPoint} from '../game/world/minimapLayout.js';
import {ALL_MAP_DESTINATIONS,WORLD_MAP_SCALE,toSvgX,toSvgY,toWorldX,toWorldZ,worldMapView} from '../game/world/worldMapDestinations.js';
export {ALL_MAP_DESTINATIONS,toSvgX,toSvgY,toWorldX,toWorldZ};
export function WorldMapSurface({playerCoord={x:0,z:0},destinations=[],selectedId=null,selectedDestination=null,onSelect,zoom=1}){
 const view=worldMapView(playerCoord,selectedDestination||destinations.find(d=>d.id===selectedId),zoom);
 const pinRadius=24/zoom;
 const player=validMapPoint(playerCoord)?playerCoord:{x:0,z:0};
 return <svg viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`} className="farm-world-surface" role="group" aria-label="Bản đồ Bình Minh, hướng Bắc cố định">
  <rect x="0" y="0" width="1000" height="900" fill="#b4d99b"/>
  <g transform={`translate(500 385) scale(${WORLD_MAP_SCALE})`}><FarmMapTerrain/></g>
  {destinations.map(d=>{
   const selected=d.id===selectedId;
   return <g key={d.id} transform={`translate(${toSvgX(d.x)} ${toSvgY(d.z)})`} role="button" tabIndex="0" aria-label={`Chọn ${d.label}`} aria-pressed={selected} className="farm-world-pin" onClick={()=>onSelect?.(d)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect?.(d);}}}>
    <title>{d.label}</title>
    <circle r={pinRadius+6/zoom} fill="transparent"/>
    <circle r={pinRadius} fill="#fff9ed" stroke={selected||d.category==='objective'?'#f58a50':d.category==='home'?'#49b7c6':'#bad0bb'} strokeWidth={(selected?5:2)/zoom}/>
    <image href={`/assets/hud/farm-v2/${d.asset}.webp`} x={-pinRadius*.8} y={-pinRadius*.8} width={pinRadius*1.6} height={pinRadius*1.6}/>
    {selected&&<g transform={`translate(0 ${pinRadius+18/zoom})`}><rect x={-110/zoom} y={-16/zoom} width={220/zoom} height={28/zoom} rx={8/zoom} fill="#fff9ed"/><text textAnchor="middle" fontSize={18/zoom} fill="#25475b" fontWeight="800">{d.label.length>23?d.label.slice(0,21)+'…':d.label}</text></g>}
   </g>;
  })}
  <g transform={`translate(${toSvgX(player.x)} ${toSvgY(player.z)})`} aria-label="Vị trí của bạn"><circle r={14/zoom} fill="#fff9ed"/><g transform={`rotate(${minimapHeading(player.rotation??player.yaw??0)})`}><path d={`M0 ${-12/zoom} L${9/zoom} ${10/zoom} L0 ${5/zoom} L${-9/zoom} ${10/zoom} Z`} fill="#f58a50" stroke="#fff" strokeWidth={2/zoom}/></g></g>
 </svg>;
}
