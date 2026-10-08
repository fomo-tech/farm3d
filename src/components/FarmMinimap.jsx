import React, {useEffect,useId,useState} from 'react';
import {zoneAtPosition} from '../game/world/worldLayout.js';
import {farmAudio} from '../game/audio/FarmAudioSystem.js';
import {MINIMAP_SCALE,minimapHeading,selectMinimapMarkers,validMapPoint,projectMapPoint} from '../game/world/minimapLayout.js';
import './FarmMinimap.css';
import {FarmMapTerrain} from './FarmMapTerrain.jsx';
export function FarmMinimap({worldRef,farmTarget,objectiveTarget,onOpenMap}){
 const [position,setPosition]=useState({x:0,z:0,yaw:0});
 const clipId='minimap-'+useId().replace(/:/g,'');
 useEffect(()=>{
  let frame,sampled=-Infinity;
  const initial=worldRef.current?.getPlayerState?.();
  if(validMapPoint(initial))setPosition({x:initial.x,z:initial.z,yaw:Number.isFinite(initial.rotation)?initial.rotation:Number.isFinite(initial.yaw)?initial.yaw:0});
  const update=time=>{
   if(time-sampled>=50&&!document.hidden){sampled=time;const state=worldRef.current?.getPlayerState?.();
    if(validMapPoint(state)){const yaw=Number.isFinite(state.rotation)?state.rotation:Number.isFinite(state.yaw)?state.yaw:0;
     setPosition(prev=>Math.hypot(prev.x-state.x,prev.z-state.z)<.02&&Math.abs(Math.atan2(Math.sin(prev.yaw-yaw),Math.cos(prev.yaw-yaw)))<.002?prev:{x:state.x,z:state.z,yaw});
    }
   }
   frame=requestAnimationFrame(update);
  };
  frame=requestAnimationFrame(update);return()=>cancelAnimationFrame(frame);
 },[worldRef]);
 const zone=zoneAtPosition(position.x,position.z),zoneName=typeof zone==='string'?zone:zone?.label||'Thị trấn';
 const markers=selectMinimapMarkers(position,farmTarget,objectiveTarget);
 const distance=validMapPoint(objectiveTarget)?projectMapPoint(objectiveTarget,position).distance:null;
 const open=e=>{e.stopPropagation();try{farmAudio.playPop?.();}catch{}onOpenMap?.();};
 return <aside className="pt-chibi-minimap-root farm-minimap" aria-label="Bản đồ nhỏ">
  <button type="button" className="pt-minimap-disc" onClick={open} aria-label="Mở bản đồ thế giới" title="Mở bản đồ (M)">
   <svg className="farm-minimap-surface" viewBox="0 0 100 100" aria-hidden="true">
    <defs><clipPath id={clipId}><circle cx="50" cy="50" r="44"/></clipPath></defs>
    <circle cx="50" cy="50" r="49" fill="#e0eee5"/>
    <circle cx="50" cy="50" r="47" fill="#fffaf0" stroke="#fff" strokeWidth="1.5"/>
    <g clipPath={`url(#${clipId})`}><circle cx="50" cy="50" r="44" fill="#b4d99b"/>
     <g transform={`translate(${50-position.x*MINIMAP_SCALE} ${50-position.z*MINIMAP_SCALE}) scale(${MINIMAP_SCALE})`}><FarmMapTerrain/></g>
    </g>
    {markers.map(p=><g key={`${p.kind}-${p.id||'target'}`} transform={`translate(${p.x} ${p.y})`} data-map-marker={p.kind}>
     {p.isClamped&&<path d="M-3 -5 L0 -9 L3 -5 Z" transform={`rotate(${p.bearing})`} fill={p.kind==='objective'?'#ed874e':'#49b7c6'} stroke="#fff7e5" strokeWidth="1"/>}
     <circle r={p.kind==='poi'?5.4:6.3} fill="#fff9ed" stroke={p.kind==='objective'?'#ed874e':p.kind==='home'?'#49b7c6':'#c0d6bb'} strokeWidth={p.kind==='poi'?.7:1.5}/>
     <image href={`/assets/hud/farm-v2/${p.asset}.webp`} x="-5" y="-5" width="10" height="10"/>
    </g>)}
    <circle cx="50" cy="50" r="9" fill="#276779" opacity=".12"/>
    <circle cx="50" cy="50" r="6.8" fill="#fff9ed"/>
    <g transform={`rotate(${minimapHeading(position.yaw)} 50 50)`} data-player-heading={minimapHeading(position.yaw)}><path d="M50 41 L55.5 55 L50 52.5 L44.5 55 Z" fill="#f58243" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round"/></g>
    <circle cx="50" cy="50" r="44" fill="none" stroke="#6e9c842e" strokeWidth="1"/>
    <g className="farm-minimap-north"><rect x="44" y="1" width="12" height="11" rx="5" fill="#fff7e5"/><text x="50" y="9" textAnchor="middle" fill="#395765" fontSize="7" fontWeight="900">N</text></g>
   </svg>
  </button>
  <button type="button" className="pt-radar-location-pill" onClick={open} title={zoneName} aria-label={`Mở bản đồ: ${zoneName}`}><span className="pt-location-badge-name">{zoneName}</span></button>
  {distance!==null&&<button type="button" className="farm-minimap-destination" onClick={open} title={objectiveTarget.label||'Điểm nhiệm vụ'} aria-label={`Điểm nhiệm vụ: ${distance} mét`}><span aria-hidden="true">◆</span>{distance<=5?'Đã đến':`${distance} m`}</button>}
 </aside>;
}
export default FarmMinimap;
