import {HudIcon} from './icons3d/HudIcon.jsx';
import React,{useEffect,useState} from 'react';
import './CropHarvestHUD.css';
export function CropHarvestHUD({worldRef}){
 const [info,setInfo]=useState(null);
 useEffect(()=>{const update=()=>setInfo(worldRef.current?.farming?.getSelectedCropInfo()||null);update();const t=setInterval(update,500);return()=>clearInterval(t);},[worldRef]);
 if(!info)return null;
 const seconds=Math.ceil((info.remainingMs||0)/1000),hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60);
 const duration=`${hours?`${hours}:`:''}${String(minutes).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
 const harvestTime=info.readyAt?new Date(info.readyAt).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}):'';
 return <aside className={`crop-harvest-hud${info.ready?' ready':''}`} aria-label="Thời gian thu hoạch">
 <button className="crop-harvest-close" aria-label="Đóng" onClick={()=>{if(worldRef.current?.farming)worldRef.current.farming.selectedCropTile=null;setInfo(null);}}>×</button>
 <div className="farm-care-icon"><HudIcon asset={info.ready?'basket':'seeds'} size={44}/></div><div className="farm-care-copy"><strong>{info.name}</strong><span>{info.needsWater?'Cần tưới nước':info.ready?'Có thể thu hoạch':`Thu hoạch sau ${duration}`}</span>
 {!info.needsWater&&<><progress value={info.progress} max="1" aria-label="Tiến độ cây trồng"/>{!info.ready&&<small>Thu hoạch lúc {harvestTime}</small>}</>}</div>
 {(info.needsWater||(info.ready&&(info.isOwner||!info.stolen)))&&<button className="crop-harvest-action" onClick={()=>worldRef.current?.farming?.interactTile(info.tile)}>{info.needsWater?'Tưới nước':info.isOwner?'Thu hoạch':'Hái nông sản'}</button>}
 </aside>;
}
