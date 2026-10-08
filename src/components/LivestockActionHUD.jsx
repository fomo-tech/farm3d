import {livestockLife} from '../../shared/livestockLifecycle.js';
import {Icon3dPig,Icon3dDuck} from './icons3d/FarmAnimalIcons.jsx';
import {Icon3dChicken,Icon3dCow,Icon3dSheep} from './icons3d/GameIcons3D.jsx';
import React,{useEffect,useState} from 'react';
import {FARM_CONFIG} from '../../shared/farmConfig.js';
import './LivestockActionHUD.css';
export function LivestockActionHUD({target,animals,progress,busy,connected,onAction,onClose}){
 busy=busy||Boolean(target.phase);
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t);},[]);
 const guest=target.isOwner===false;
 const animal=guest?target.animal:animals.find(a=>a.id===target.id),species=animal?.species||target.species,def=FARM_CONFIG.animals[species];
 const animalIcons={chicken:Icon3dChicken,cow:Icon3dCow,sheep:Icon3dSheep,pig:Icon3dPig,duck:Icon3dDuck};
 const AnimalIcon=animalIcons[species]||Icon3dChicken;
 const life=animal?livestockLife(animal,now):null;
 const ready=animal?.productReadyAt>0&&animal.productReadyAt<=now;
 const canSteal=guest&&ready&&!def?.saleOnly&&!animal?.stolenAmount;
 const feedCost=def?.feedCost*(def?.saleOnly?1:4);
 const waiting=animal?.productReadyAt>now;
 return <aside className="herd-action-hud" aria-label="Chăm vật nuôi">
 <button className="herd-close" onClick={onClose} aria-label="Đóng">×</button>
 {animal?<><div className="farm-care-icon"><AnimalIcon size={46}/></div><div className="farm-care-copy"><strong>{def.name}</strong><small>{guest?(animal.stolenAmount?'Đợt này đã bị lấy':ready?'Sản phẩm đã sẵn sàng':'Chưa có sản phẩm'):life?.retired?'Đến lúc nghỉ nuôi':ready?'Đã sẵn sàng!':waiting?`${life.stage==='adult'?'Đợt thu tiếp':'Lớn lên'} · ${Math.ceil((animal.productReadyAt-now)/60000)} phút`:'Đang đói'}</small><small>{life.label}{life.remainingLifeMs!==null?` · Còn ${Math.ceil(life.remainingLifeMs/3600000)} giờ nuôi`:''}</small>{life.matureAt>now&&<progress max="1" value={life.growth} aria-label="Tiến độ lớn lên"/>}</div>
 {guest?<button disabled={busy||!connected||!canSteal} onClick={()=>onAction('steal_livestock_start',{id:animal.id,species})}>{target.phase==='theft'?`Đứng yên · ${Math.max(0,Math.ceil((target.theftEndsAt-now)/1000))} giây`:busy?'Đang đi tới…':def.saleOnly?'Vật nuôi của chủ trại':canSteal?'Lấy sản phẩm':animal.stolenAmount?'Đã lấy trong đợt này':!ready?'Chưa có sản phẩm':'Chưa thể lấy'}</button>:<button disabled={busy||!connected||waiting} onClick={()=>onAction(life.retired&&!animal.productReadyAt?'retire_animal':ready?(def.saleOnly?'sell_animal':'collect_animals'):'feed_animals',{id:animal.id,species})}>{busy?(target.phase==='approach'?'Đang đi tới…':'Đang chăm sóc…'):life.retired&&!animal.productReadyAt?'Cho nghỉ nuôi':ready?(def.saleOnly?`Bán · ${FARM_CONFIG.products[def.product].sellPrice} xu`:'Thu sản phẩm'):`Cho ăn · ${feedCost} xu`}</button>}</>:
 guest?<><strong>Chuồng hàng xóm</strong><small>Chạm vật nuôi có sản phẩm để lấy một phần.</small></>:<><strong>Chuồng trại</strong><small>Chạm vào vật nuôi để chăm sóc</small><div className="herd-breeds">{Object.values(FARM_CONFIG.animals).map(d=>{const count=animals.filter(a=>a.species===d.id).length,built=progress.animalPens?.[d.id]||count>0;const cost=built?d.buyCost:d.penCost;const full=count>=d.capacity;const affordable=progress.coins>=cost;const SpeciesIcon=animalIcons[d.id];return <button key={d.id} disabled={busy||!connected||full||!affordable} onClick={()=>onAction(built?'buy_animal':'build_pen',{species:d.id})}><SpeciesIcon size={38}/><b>{d.name}</b><small>{full?'Đã đầy':!affordable?`Cần ${cost} xu`:built?`Đón · ${d.buyCost} xu`:`Xây · ${d.penCost} xu`}</small><span className="herd-slot-count">{count}/{d.capacity}</span></button>;})}</div></>}
 </aside>;
}
