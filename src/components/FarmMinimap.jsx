import { useEffect, useState } from 'react';
import { WORLD_LAYOUT, zoneAtPosition } from '../game/world/worldLayout.js';
import './FarmMinimap.css';

export function FarmMinimap({worldRef,farmTarget,onOpenMap}) {
  const [position,setPosition]=useState(null);
  useEffect(()=>{
    const sample=()=>{const p=worldRef.current?.getPlayerState?.();if(p&&Number.isFinite(p.x)&&Number.isFinite(p.z))setPosition({x:p.x,z:p.z,yaw:p.yaw||0});};
    sample();const timer=setInterval(sample,250);return()=>clearInterval(timer);
  },[worldRef]);
  const p=position||{x:0,z:0,yaw:0};
  const project=(x,z)=>[60+(x-p.x)*.28,60-(z-p.z)*.28];
  const visible=([x,y])=>x>=7&&x<=113&&y>=7&&y<=113;
  const landmarks=[...Object.values(WORLD_LAYOUT.zones).map(z=>({...z,color:z.id==='crystal-lake'?'#66bdd6':'#dfb35b',symbol:z.id==='crystal-lake'?'≈':z.id==='city-center'?'★':'●'})),...(farmTarget?[{...farmTarget,label:'Nông trại của bạn',color:'#6ee0b0',symbol:'⌂'}]:[])];
  const zone=zoneAtPosition(p.x,p.z);
  return <button type="button" className="farm-minimap" onClick={onOpenMap} aria-label="Mở bản đồ · vị trí hiện tại" title="Mở bản đồ · M">
    <svg viewBox="0 0 120 120" role="img" aria-label="Bản đồ nhỏ, bạn ở giữa">
      <defs><clipPath id="farm-map-clip"><rect x="4" y="4" width="112" height="112" rx="8"/></clipPath></defs>
      <g clipPath="url(#farm-map-clip)"><rect width="120" height="120" fill="#31483c"/>
      {WORLD_LAYOUT.villages.map(v=>{const [x,y]=project(v.gate.x,v.gate.z);const [,endY]=project(v.gate.x,v.gate.z+190);return <path key={v.id} d={`M${x} ${y}V${endY}`} stroke="#bac4ae" strokeWidth="3"/>;})}
      <circle cx={project(0,0)[0]} cy={project(0,0)[1]} r="14" fill="#c4b58c" stroke="#e5d9b7" strokeWidth="2"/>
      <ellipse cx={project(165,2)[0]} cy={project(165,2)[1]} rx="13" ry="9" fill="#4e9eb2"/>
      {WORLD_LAYOUT.farms.map(farm=>{const [x,y]=project(farm.x,farm.z);return visible([x,y])?<rect key={farm.id} x={x-3} y={y-3} width="6" height="6" rx="1" fill="#7d9871"/>:null;})}
      {landmarks.map(l=>{const [x,y]=project(l.x,l.z);return visible([x,y])?<g key={l.label}><title>{l.label}</title><circle cx={x} cy={y} r="7" fill="#172e3b" stroke={l.color} strokeWidth="1"/><text x={x} y={y+3} textAnchor="middle" fontSize="10" fill={l.color}>{l.symbol}</text></g>:null;})}
      <circle cx="60" cy="60" r="11" fill="#70d7ee" opacity=".18"/><path d="M60 52 L65 66 L60 63 L55 66 Z" fill="#fff" stroke="#152632" strokeWidth="1.5" transform={`rotate(${p.yaw*180/Math.PI} 60 60)`}/></g>
      <text x="60" y="14" textAnchor="middle" fill="#fff" fontSize="9">B</text><text x="108" y="63" fill="#fff" fontSize="8">Đ</text><text x="8" y="63" fill="#fff" fontSize="8">T</text><text x="60" y="111" fill="#fff" fontSize="8">N</text>
    </svg>
    <span className="farm-map-zone">{position?(typeof zone==='string'?zone:zone?.label||'Thế giới'):'Đang định vị'}</span>
    <small>{position?`${Math.round(p.x)}, ${Math.round(p.z)} · M`:'Bản đồ · M'}</small>
    <span className="farm-map-legend">▲ Bạn · ⌂ Nông trại</span>
  </button>;
}
