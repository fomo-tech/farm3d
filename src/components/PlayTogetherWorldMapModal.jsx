import React,{useEffect,useMemo,useRef,useState} from 'react';
import {WorldMapSurface} from './WorldMapSurface.jsx';
import {worldMapDestinations} from '../game/world/worldMapDestinations.js';
import {validMapPoint} from '../game/world/minimapLayout.js';
import {zoneAtPosition} from '../game/world/worldLayout.js';
import {travelCost} from '../../shared/travelConfig.js';
import {HudIcon} from './icons3d/HudIcon.jsx';
import './FarmWorldMap.css';
export default function PlayTogetherWorldMapModal({isOpen,onClose,onTravel,session,playerCoord={x:0,z:0},currentZone,objectiveTarget,worldRef,coins=Infinity,connected=true}){
 const [tab,setTab]=useState('all'),[search,setSearch]=useState(''),[selectedId,setSelectedId]=useState(null),[zoom,setZoom]=useState(1),[liveCoord,setLiveCoord]=useState(null);
 const dialog=useRef(null),close=useRef(null),onCloseRef=useRef(onClose);onCloseRef.current=onClose;
 useEffect(()=>{
  if(!isOpen)return;
  setSelectedId(objectiveTarget?'tracked-objective':null);setZoom(1);setTab('all');setSearch('');
  const previous=document.activeElement;close.current?.focus();
  const keyboard=e=>{
   if(e.key==='Escape'){e.preventDefault();onCloseRef.current?.();}
   if(e.key==='Tab'){
    const nodes=Array.from(dialog.current?.querySelectorAll('button:not(:disabled),input,[tabindex="0"]')||[]).filter(el=>el.getClientRects().length);
    const first=nodes[0],last=nodes[nodes.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
   }
  };
  document.addEventListener('keydown',keyboard);
  return()=>{document.removeEventListener('keydown',keyboard);if(previous?.isConnected)previous.focus?.();};
 },[isOpen]);
 useEffect(()=>{
  if(!isOpen||!worldRef)return;
  const sample=()=>{const p=worldRef.current?.getPlayerState?.();if(validMapPoint(p)){const yaw=p.rotation??p.yaw??0;setLiveCoord(prev=>prev&&Math.hypot(prev.x-p.x,prev.z-p.z)<.02&&prev.rotation===yaw?prev:{x:p.x,z:p.z,rotation:yaw});}};
  sample();const timer=setInterval(sample,125);return()=>{clearInterval(timer);setLiveCoord(null);};
 },[isOpen,worldRef]);
 const player=validMapPoint(liveCoord)?liveCoord:validMapPoint(playerCoord)?playerCoord:{x:0,z:0};
 const destinations=useMemo(()=>worldMapDestinations(session?.farmId,objectiveTarget),[session?.farmId,objectiveTarget]);
 const selected=destinations.find(d=>d.id===selectedId),home=destinations.find(d=>d.id==='farm');
 const query=search.trim().toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
 const visible=destinations.filter(d=>(tab==='all'||tab==='villages'&&d.category==='village'||tab==='nature'&&d.category==='nature'||tab==='home'&&d.category==='home')&&(!query||(d.label+' '+d.badge).toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').includes(query)));
 const distance=d=>Math.round(Math.hypot(d.x-player.x,d.z-player.z));
 const cost=selected?travelCost(player,selected):0;
 const zone=worldRef?zoneAtPosition(player.x,player.z):currentZone;
 if(!isOpen)return null;
 return <div className="farm-map-backdrop" onClick={onClose}>
  <section ref={dialog} className="farm-map-dialog" role="dialog" aria-modal="true" aria-labelledby="farm-map-title" onClick={e=>e.stopPropagation()}>
   <header className="farm-map-header"><HudIcon asset="map" size={44}/><div><h2 id="farm-map-title">Bản đồ Bình Minh</h2><p>{zone?.label||'Thế giới nông trại'} · Bắc ở phía trên</p></div><button ref={close} type="button" className="farm-map-close" aria-label="Đóng bản đồ" onClick={onClose}>×</button></header>
   <div className="farm-map-toolbar"><nav aria-label="Lọc điểm đến">{[['all','Tất cả'],['villages','12 làng'],['nature','Biển & hồ'],['home','Nhà của bạn']].map(([id,label])=><button key={id} type="button" aria-pressed={tab===id} onClick={()=>{setTab(id);setSelectedId(null);setZoom(1);}}>{label}</button>)}</nav><input aria-label="Tìm điểm đến" placeholder="Tìm điểm đến…" value={search} onChange={e=>{setSearch(e.target.value);setSelectedId(null);setZoom(1);}}/></div>
   <div className="farm-map-workspace">
    <div className="farm-map-canvas"><WorldMapSurface playerCoord={player} destinations={visible} selectedId={selectedId} selectedDestination={selected} onSelect={d=>setSelectedId(d.id)} zoom={zoom}/>
     <div className="farm-map-north" aria-label="Hướng Bắc">N ↑</div>
     <div className="farm-map-zoom"><button type="button" aria-label="Thu nhỏ bản đồ" disabled={zoom<=1} onClick={()=>setZoom(z=>Math.max(1,z-.5))}>−</button><button type="button" aria-label="Đặt lại toàn cảnh" onClick={()=>{setZoom(1);setSelectedId(null);}}>{Math.round(zoom*100)}%</button><button type="button" aria-label="Phóng to bản đồ" disabled={zoom>=3} onClick={()=>setZoom(z=>Math.min(3,z+.5))}>+</button></div>
     <div className="farm-map-key"><span><i className="player"/>Bạn</span><span><i className="goal"/>Nhiệm vụ</span><span><i className="home"/>Nhà</span></div>
    </div>
    <aside className="farm-map-list" aria-label="Danh sách điểm đến">{visible.length?visible.map(d=><button key={d.id} type="button" aria-pressed={d.id===selectedId} onClick={()=>setSelectedId(d.id)}><HudIcon asset={d.asset} size={36}/><span><b>{d.label}</b><small>{d.badge}</small></span><em>{distance(d)} m</em></button>):<p className="farm-map-empty">{tab==='home'&&!home?'Bạn chưa có nông trại.':'Không tìm thấy điểm đến.'}</p>}</aside>
   </div>
   <footer className="farm-map-footer">{selected?<><HudIcon asset={selected.asset} size={40}/><div className="farm-map-selected"><b>{selected.label}</b><small>{distance(selected)} m · {selected.canTravel===false?'Đi theo ghim nhiệm vụ':`Phí dự kiến ${cost} xu`}</small></div><button type="button" className="farm-map-travel" disabled={!connected||selected.canTravel===false||coins<cost} onClick={()=>onTravel?.(selected)}>{selected.canTravel===false?'Đang theo dõi':!connected?'Chưa kết nối':coins<cost?'Chưa đủ xu':`Dịch chuyển · ${cost} xu`}</button></>:<><span className="farm-map-hint">Chọn ghim hoặc tên địa điểm để xem thông tin.</span>{home&&<button type="button" className="farm-map-home" onClick={()=>{setSelectedId('farm');setTab('all');setSearch('');}}><HudIcon asset="land" size={24}/>Nhà của bạn</button>}</>}</footer>
  </section>
 </div>;
}
