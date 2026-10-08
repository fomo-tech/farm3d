import React, {useEffect,useState} from 'react';
import {FARM_CONFIG, farmBarnCapacity} from '../../shared/farmConfig.js';
import {FarmUpgradeIcon} from './icons3d/FarmUpgradeIcon.jsx';
import {HudIcon} from './icons3d/HudIcon.jsx';
import './LivestockPanel.css';
export function LivestockPanel({progress,animals=[],focus,connected,pending,onAction,ownsLand=true,now=Date.now()}){
 const [species,setSpecies]=useState(focus?.species||'chicken');
 useEffect(()=>{if(focus?.species)setSpecies(focus.species);},[focus?.species,focus?.id]);
 const def=FARM_CONFIG.animals[species],herd=animals.filter(a=>a.species===species);
 const built=progress.animalPens?.[species]||herd.length>0;
 const hungry=herd.filter(a=>!a.productReadyAt),ready=herd.filter(a=>a.productReadyAt>0&&a.productReadyAt<=now);
 const feedCost=hungry.length*def.feedCost,product=FARM_CONFIG.products[def.product];
 const used=Object.values(progress.inventory||{}).reduce((sum,n)=>sum+n,0),capacity=farmBarnCapacity(progress.barnLevel);
 const waiting=!connected||pending||!ownsLand;
 const duration=ms=>{const secs=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;};
 return <div className="livestock-panel-content">
  <div className="livestock-wallet"><span>Kho {used}/{capacity}</span><b><HudIcon asset="coin" size={24}/>{progress.coins.toLocaleString('vi-VN')} xu</b></div>
  <nav className="livestock-species-tabs" aria-label="Chọn vật nuôi">{Object.values(FARM_CONFIG.animals).map(item=>{const count=animals.filter(a=>a.species===item.id).length;const hasReady=animals.some(a=>a.species===item.id&&a.productReadyAt>0&&a.productReadyAt<=now);return <button key={item.id} type="button" aria-pressed={species===item.id} onClick={()=>setSpecies(item.id)}>{item.id==='cow'?'Bò':item.name}<small>{count}/{item.capacity}</small>{hasReady&&<i aria-label="Sẵn sàng thu"/>}</button>;})}</nav>
  <section className="livestock-pen-overview"><FarmUpgradeIcon asset="barn" size={76}/><div><small>CHUỒNG {def.name.toUpperCase()}</small><h3>{built?`${herd.length}/${def.capacity} vật nuôi`:'Chưa xây chuồng'}</h3><p>{def.saleOnly?'Nuôi lớn để bán':`Sản phẩm: ${product.name}`} · {Math.round(def.productMs/60000*10)/10} phút/đợt</p></div></section>
  {!built?<div className="livestock-empty"><h3>Một mái nhà cho đàn {def.name.toLowerCase()}</h3><p>Xây chuồng trước, rồi đón con giống về nuôi.</p><button disabled={waiting||progress.coins<def.penCost} onClick={()=>onAction('build_pen',{species})}>Xây chuồng · {def.penCost.toLocaleString('vi-VN')} xu</button></div>:<>
   <div className="livestock-group-actions"><button disabled={waiting||!hungry.length||progress.coins<feedCost} onClick={()=>onAction('feed_animals',{species})}>Cho nhóm ăn <b>{feedCost.toLocaleString('vi-VN')} xu</b></button><button disabled={waiting||def.saleOnly||!ready.length||used+ready.length>capacity} onClick={()=>onAction('collect_animals',{species})}>{def.saleOnly?'Bán từng heo bên dưới':`Thu cả nhóm (${ready.length})`}</button></div>
   <div className="livestock-animal-list">{herd.map((a,index)=>{const needsFood=!a.productReadyAt,isReady=a.productReadyAt>0&&a.productReadyAt<=now;const state=needsFood?'hungry':isReady?'ready':'growing';const percent=needsFood?0:isReady?100:Math.min(99,Math.max(0,(1-(a.productReadyAt-now)/def.productMs)*100));return <article key={a.id} className={`${state} ${focus?.id===a.id?'focused':''}`}><div className="livestock-animal-heading"><b>{def.name} #{index+1}</b><span>{needsFood?'Đói bụng':isReady?def.saleOnly?'Đã trưởng thành':'Có thể thu':'Đang lớn'}</span></div><div className="livestock-growth-track" role="progressbar" aria-label={`Tiến độ ${def.name} ${index+1}`} aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${percent}%`}}/></div><div className="livestock-animal-action"><small>{needsFood?'Cho ăn để bắt đầu đợt mới':isReady?def.saleOnly?`Giá bán ${product.sellPrice} xu`:product.name:`Còn ${duration(Math.min(def.productMs,a.productReadyAt-now))}`}</small><button disabled={waiting||(!needsFood&&!isReady)||(needsFood&&progress.coins<def.feedCost)||(!needsFood&&isReady&&!def.saleOnly&&used>=capacity)} onClick={()=>onAction(needsFood?'feed_animals':def.saleOnly?'sell_animal':'collect_animals',{id:a.id})}>{needsFood?`Cho ăn · ${def.feedCost} xu`:isReady?def.saleOnly?'Bán heo':'Thu sản phẩm':'Đang nuôi'}</button></div></article>;})}</div>
   {herd.length<def.capacity&&<button className="livestock-buy-animal" disabled={waiting||progress.coins<def.buyCost} onClick={()=>onAction('buy_animal',{species})}>+ Đón {def.name.toLowerCase()} về chuồng <b>{def.buyCost.toLocaleString('vi-VN')} xu</b></button>}
  </>}
  {used>=capacity&&<p className="livestock-warning" role="status">Kho đã đầy. Bán bớt nông sản hoặc nâng kho để thu tiếp.</p>}
  <details className="livestock-products"><summary>Nông sản trong kho</summary>{Object.entries(FARM_CONFIG.products).filter(([id])=>id!=='maturePig').map(([id,p])=><div key={id}><span>{p.name} <b>×{progress.inventory?.[id]||0}</b></span><button disabled={waiting||!progress.inventory?.[id]} onClick={()=>onAction('sell_livestock_product',{id})}>Bán 1 · {p.sellPrice} xu</button></div>)}</details>
  {!ownsLand&&<p role="status">Sở hữu lô đất để xây chuồng và nuôi đàn vật nuôi.</p>}
  {!connected&&<p role="status">Đang chờ kết nối…</p>}{pending&&<p role="status">Đang chăm sóc vật nuôi…</p>}
 </div>;
}
