import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CROPS } from '../game/economy/GameProgress.js';
import { HudIcon } from './icons3d/HudIcon.jsx';
import { useInventoryMeshArt } from './useInventoryMeshArt.js';
import './FarmSupplies.css';
const CATALOGUE=Object.values(CROPS).sort((a,b)=>a.level-b.level);
export function FarmSuppliesModal({progress={},connected=false,onChooseCrop,onClose}) {
  const [selected,setSelected]=useState(progress.selectedCrop||'carrot'),[filter,setFilter]=useState('all');
  const panel=useRef(null),close=useRef(onClose);close.current=onClose;
  const level=progress.level||1,coins=progress.coins||0;
  const visible=CATALOGUE.filter(crop=>filter==='all'||level>=crop.level);
  const crop=visible.find(item=>item.id===selected)||visible[0];
  const items=useMemo(()=>CATALOGUE.map(item=>({id:`produce:${item.id}`,itemId:item.id,kind:'crop',category:'produce',name:item.name,count:1})),[]);
  const images=useInventoryMeshArt(true,'produce',items);
  const art=item=>images[`produce:${item.id}`]&&images[`produce:${item.id}`]!=='unavailable'?<img src={images[`produce:${item.id}`]} alt={item.name}/>:<HudIcon asset="seeds" size={70}/>;
  const locked=level<crop.level,active=progress.selectedCrop===crop.id,free=crop.id==='carrot'?(progress.freeSeeds||0):0;
  useEffect(()=>{
    const previous=document.activeElement;panel.current?.querySelector('button')?.focus();
    const keys=event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close.current?.();}
      if(event.key!=='Tab')return;
      const controls=[...panel.current.querySelectorAll('button:not(:disabled)')].filter(el=>el.getClientRects().length);
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };document.addEventListener('keydown',keys,true);
    return()=>{document.removeEventListener('keydown',keys,true);if(previous?.isConnected)previous.focus();};
  },[]);
  return <div className="farm-supplies-overlay" onClick={event=>{if(event.target===event.currentTarget)onClose?.();}}><section className="farm-supplies" ref={panel} role="dialog" aria-modal="true" aria-labelledby="farm-supplies-title">
    <header className="farm-supplies-header"><span className="farm-supplies-logo"><HudIcon asset="seeds" size={49}/></span><div><small>TIỆM VẬT TƯ BÌNH MINH</small><h2 id="farm-supplies-title">Hạt giống & vật tư</h2></div><div className="farm-supplies-wallet"><HudIcon asset="coin" size={28}/><span><small>Xu của bạn</small><b>{coins.toLocaleString('vi-VN')}</b></span></div><button className="farm-supplies-close" aria-label="Đóng cửa hàng vật tư" onClick={onClose}>×</button></header>
    <div className="farm-supplies-toolbar"><div role="group" aria-label="Lọc hạt giống"><button aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>Tất cả <small>{CATALOGUE.length}</small></button><button aria-pressed={filter==='unlocked'} onClick={()=>setFilter('unlocked')}>Đã mở <small>{CATALOGUE.filter(item=>level>=item.level).length}</small></button></div><span>Cấp nhân vật <b>{level}</b></span></div>
    <div className="farm-supplies-body"><div className="farm-supplies-catalogue"><div className="farm-supplies-banner"><HudIcon asset="shop" size={43}/><div><h3>Chọn hạt cho vụ mùa mới</h3><p>Chọn tại đây, gieo tại ruộng. Xu chỉ trừ khi gieo hạt.</p></div></div><div className="farm-supplies-grid">{visible.map(item=><button key={item.id} className={level<item.level?'locked':''} aria-pressed={crop.id===item.id} aria-label={`Xem hạt ${item.name}, mở cấp ${item.level}`} onClick={()=>setSelected(item.id)}><span className="farm-supplies-level">Cấp {item.level}</span><span className="farm-supplies-slot-art">{art(item)}</span><b>{item.name}</b><small>{item.seedCost} xu / ô</small><span className={`farm-supplies-slot-status ${progress.selectedCrop===item.id?'active':''}`}>{level<item.level?'Chưa mở':progress.selectedCrop===item.id?'Đang chọn':'Đã mở'}</span></button>)}</div><p className="farm-supplies-tip">Hạt giống mở theo cấp nhân vật. Không cần mua gói hạt trước khi gieo.</p></div>
    <aside className="farm-supplies-detail" aria-live="polite"><div className="farm-supplies-preview">{art(crop)}<span>HẠT GIỐNG · CẤP {crop.level}</span></div><div className="farm-supplies-detail-copy"><small>VỤ MÙA CỦA BẠN</small><h3>{crop.name}</h3><p>{locked?`Mở khóa khi nhân vật đạt cấp ${crop.level}.`:`Đã mở ở cấp ${crop.level}. Chọn hạt rồi về ruộng để gieo.`}</p><dl><div><dt>Thời gian lớn</dt><dd>{Math.ceil(crop.growMs/60000)} phút</dd></div><div><dt>Giá bán / sản phẩm</dt><dd>{crop.sellPrice} xu</dd></div><div><dt>Nông sản trong kho</dt><dd>{progress.inventory?.[crop.id]||0}</dd></div></dl>{free>0&&<div className="farm-supplies-free"><HudIcon asset="seeds" size={23}/><span>Còn {free} hạt cà rốt miễn phí</span></div>}<div className="farm-supplies-price"><span>Chi phí gieo / ô</span><strong>{free>0?'Miễn phí':`${crop.seedCost} xu`}</strong></div><button className="farm-supplies-primary" disabled={!connected||locked||active||!onChooseCrop} onClick={()=>onChooseCrop(crop)}>{!connected?'Chờ kết nối':locked?`Cần cấp ${crop.level}`:active?'Đang chọn để gieo':'Chọn để gieo'}</button><p className="farm-supplies-notice" role="status">{!connected?'Kết nối lại để đổi hạt giống.':locked?'Bạn vẫn có thể xem thông tin cây chưa mở.':free>0?'Gieo cà rốt dùng hạt miễn phí trước.':coins<crop.seedCost?`Có thể chọn hạt; cần thêm ${(crop.seedCost-coins).toLocaleString('vi-VN')} xu để gieo một ô.`:'Mỗi lần gieo hạt sẽ dùng số xu tương ứng.'}</p></div></aside></div>
    <footer className="farm-supplies-footer"><span><HudIcon asset="quest" size={23}/> Xới đất → gieo hạt → tưới nước → thu hoạch</span><button onClick={onClose}>Tiếp tục khám phá</button></footer>
  </section></div>;
}
