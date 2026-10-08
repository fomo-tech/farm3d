import React,{useEffect,useState} from 'react';
import {Icon3dRedApple} from './icons3d/Inventory3DIcons.jsx';
import {APPLE_ORCHARD} from '../../shared/appleOrchard.js';
import './CropHarvestHUD.css';
export function AppleTreeHUD({target,readyAt,isOwner,busy,connected,onHarvest,onClose}){
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
 const remaining=Math.max(0,(readyAt||Infinity)-now),ready=remaining===0;
 const seconds=Math.ceil(remaining/1000),duration=Number.isFinite(seconds)?`${Math.floor(seconds/3600)}:${String(Math.floor(seconds%3600/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`:'…';
 return <aside className={`crop-harvest-hud${ready?' ready':''}`} aria-label="Cây táo">
 <button className="crop-harvest-close" aria-label="Đóng" onClick={onClose}>×</button>
 <div className="farm-care-icon"><Icon3dRedApple size={44}/></div><div className="farm-care-copy"><strong>Cây táo</strong><span>{busy?'Đang hái táo…':ready?`${APPLE_ORCHARD.yield} quả đã chín!`:`Chín sau ${duration}`}</span><small>{isOwner?`${APPLE_ORCHARD.sellPrice} xu/quả · Mỗi 4 giờ`:'Cây của hàng xóm'}</small>{!ready&&<progress max="1" value={Math.max(0,1-remaining/APPLE_ORCHARD.cycleMs)}/>}</div>
 {isOwner&&<button className="crop-harvest-action" disabled={!ready||busy||!connected} onClick={()=>onHarvest(target.farmId)}>{busy?'Đang hái…':ready?`Hái ${APPLE_ORCHARD.yield} quả`:'Đang ra quả'}</button>}
 </aside>;
}
