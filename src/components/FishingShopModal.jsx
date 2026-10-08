import { InventoryItemArt } from './InventoryItemArt.jsx';
import {useInventoryMeshArt} from './useInventoryMeshArt.js';
import {FishingConditionsBoard} from './FishingConditions.jsx';
import React, {useEffect,useRef,useState} from 'react';
import {FISHING_CONFIG,FISHING_GEAR,FISHING_GEAR_ORDER,LAKE_FISH,FISHING_WATER_NAMES,fishingInventoryCount,fishingCapacity} from '../../shared/fishing.js';
import {fishingMissionProgress} from '../../shared/fishingSession.js';
import {Icon3dFishingRodBamboo,Icon3dFishingRodPro,Icon3dBaitWorm,Icon3dBaitLure,Icon3dFishChum,Icon3dCoolerBox} from './icons3d/GameIcons3D.jsx';
import {HudIcon} from './icons3d/HudIcon.jsx';
import './FishingShop.css';
const fishingGearIcons={'rod-bamboo':Icon3dFishingRodBamboo,'rod-pro':Icon3dFishingRodPro,'bait-worm':Icon3dBaitWorm,'bait-lure':Icon3dBaitLure,'fish-chum':Icon3dFishChum,'cooler-box':Icon3dCoolerBox};
const TABS=[['shop','Đồ câu'],['equip','Trang bị'],['fish','Thùng cá'],['collection','Bộ sưu tập']];
const RARITY_NAMES={common:'Phổ biến',uncommon:'Ít gặp',rare:'Hiếm',epic:'Quý hiếm',legendary:'Huyền thoại'};
const FISH_ART_ITEMS=Object.values(FISHING_CONFIG.fish).map(fish=>({id:`fish-${fish.id}`,itemId:fish.id}));
function FishPortrait({fish,images,locked=false}){
 const image=images[`fish-${fish.id}`];
 return <div className={`fish-species-art rarity-${fish.rarity} ${locked?'is-undiscovered':''}`}><span className="fish-species-rarity">{RARITY_NAMES[fish.rarity]}</span>{image&&image!=='unavailable'?<img src={image} alt={locked?'Bóng loài cá chưa khám phá':fish.name}/>:<InventoryItemArt item={{itemId:fish.id,kind:'fish',name:fish.name}} size={64}/>}<span className="fish-species-shadow"/>{locked&&<b className="fish-species-lock">?</b>}</div>;
}
export function FishingShopModal({conditions,progress={},connected=false,fishingWater,fishingTick,onAction,onSellAll,onClose}){
 const [tab,setTab]=useState('shop');const fishImages=useInventoryMeshArt(tab==='fish'||tab==='collection','fish',FISH_ART_ITEMS);const panel=useRef(null),close=useRef(onClose);close.current=onClose;
 useEffect(()=>{const previous=document.activeElement;panel.current?.querySelector('button')?.focus();const keys=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close.current?.();}if(e.key==='Tab'){const buttons=[...panel.current.querySelectorAll('button:not(:disabled)')].filter(b=>b.getClientRects().length);const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};document.addEventListener('keydown',keys,true);return()=>{document.removeEventListener('keydown',keys,true);if(previous?.isConnected)previous.focus();};},[]);
 return <div className="fishing-shop-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose?.();}}><section ref={panel} className="fishing-shop" role="dialog" aria-modal="true" aria-labelledby="fishing-shop-title">
 <header><span className="fishing-shop-emblem"><Icon3dFishingRodPro size={54}/></span><div><small>TIỆM ĐỒ CÂU LÃO NGƯ</small><h2 id="fishing-shop-title">Tiệm đồ câu</h2></div><div className="fishing-shop-wallet"><HudIcon asset="coin" size={27}/><b>{(progress.coins||0).toLocaleString('vi-VN')}</b><small>xu</small></div><button className="fishing-shop-close" aria-label="Đóng tiệm đồ câu" onClick={onClose}>×</button></header>
 <nav aria-label="Danh mục tiệm đồ câu">{TABS.map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}{id==='fish'&&<span>{fishingInventoryCount(progress.fishing)}</span>}</button>)}</nav>
 <div className="fishing-shop-content"><div className="fishing-shop-banner"><HudIcon asset="shop" size={45}/><div><h3>{tab==='shop'?'Chuẩn bị cho mẻ cá mới':tab==='equip'?'Bộ đồ câu của bạn':tab==='fish'?'Mẻ cá hôm nay':'Kỷ lục của tay câu'}</h3><p>{!connected?'Đang kết nối lại.':fishingWater?`Bạn đang ở ${FISHING_WATER_NAMES[fishingWater]}.`:'Ghé bờ hồ, sông hoặc biển để thả câu.'}</p></div></div>
 {tab==='shop'&&<FishingConditionsBoard conditions={conditions}/>}
 <div className={'fishing-shop-items '+(tab==='shop'?'fishing-shop-catalogue':'')}>
{tab==='shop'&&<>
            {FISHING_GEAR_ORDER.map(id => {
              const item = FISHING_GEAR[id];
              const GearIcon = fishingGearIcons[item.icon] || Icon3dFishingRodPro;
              const owned = item.kind === 'rod'
                ? progress.fishing?.ownedRods?.includes(id)
                : item.kind === 'tool'
                  ? Boolean(progress.fishing?.ownedTools?.[id])
                  : false;
              return <button key={`buy-${id}`} type="button" disabled={!connected || progress.coins < item.cost || owned} onClick={() => onAction('fishing_buy', { id })}>
                <i><GearIcon size={item.kind === 'rod' ? 30 : 28} /></i>
                <span><b>{item.name}</b><small>{item.description}</small><small>{item.kind === 'rod' ? `Tầm ném ${item.castDistance}m · sức kéo ${item.reelPower}` : item.kind === 'bait' ? `Gói x${item.quantity} · tốc độ cá cắn ${item.biteSpeed}x` : `Sức chứa cá +${item.capacity}`}</small></span>
                <em>{owned ? 'Đã mua' : `${item.cost} xu`}</em>
              </button>;
            })}
</>}
{tab==='equip'&&<>
            {Object.values(FISHING_CONFIG.rods).map(rod => <button key={`equip-${rod.id}`} type="button" disabled={!connected || !progress.fishing?.ownedRods?.includes(rod.id) || rod.id===progress.fishing?.equippedRod} onClick={() => onAction('fishing_equip', { id: rod.id })}><span><b>{rod.name}</b><small>{rod.id === progress.fishing?.equippedRod ? 'Đang dùng' : progress.fishing?.ownedRods?.includes(rod.id)?'Đã sở hữu':'Chưa sở hữu'}</small></span><em>{rod.id === progress.fishing?.equippedRod ? 'Đang dùng' : 'Trang bị'}</em></button>)}
            <button type="button" disabled={!connected || !progress.fishing?.equippedBait} onClick={() => onAction('fishing_equip', { id: null })}><span><b>Không dùng mồi</b><small>Tiết kiệm mồi cho cá thường</small></span><em>{progress.fishing?.equippedBait ? 'Bỏ mồi' : 'Đang dùng'}</em></button>
            {Object.values(FISHING_CONFIG.baits).map(bait => <button key={`equip-${bait.id}`} type="button" disabled={!connected || !(progress.fishing?.bait?.[bait.id] > 0) || bait.id===progress.fishing?.equippedBait} onClick={() => onAction('fishing_equip', { id: bait.id })}><span><b>{bait.name}</b><small>Còn {progress.fishing?.bait?.[bait.id] || 0} · hiếm +{Math.round(bait.rareBonus * 100)}%</small></span><em>{bait.id === progress.fishing?.equippedBait ? 'Đang dùng' : 'Trang bị'}</em></button>)}
</>}
{tab==='collection'&&<>

            <div className="fish-album-heading"><b>Khám phá {Object.values(FISHING_CONFIG.fish).filter(fish=>progress.fishing?.collection?.[fish.id]?.count>0).length}/{Object.keys(FISHING_CONFIG.fish).length} loài cá</b><small>Mỗi loài là một kỷ niệm bên bờ nước</small></div>
            <div className="fish-species-grid">{Object.values(FISHING_CONFIG.fish).map(fish=>{const record=progress.fishing?.collection?.[fish.id];const known=record?.count>0;return <article className="fish-species-card" key={fish.id}><FishPortrait fish={fish} images={fishImages} locked={!known}/><div className="fish-species-info"><b>{known?fish.name:'Chưa khám phá'}</b><small>{fish.zones.map(id=>FISHING_WATER_NAMES[id]).join(' · ')}</small>{known?<div className="fish-species-record"><span>Đã bắt <strong>{record.count}</strong></span><span>Kỷ lục <strong>{Number(record.maxWeight||0).toFixed(2)} kg</strong></span></div>:<p>Thả câu để mở trang sổ này</p>}</div></article>;})}</div>
<div className="fish-album-missions">            {Object.entries(FISHING_CONFIG.missions).map(([id,mission])=><button key={id} disabled={!connected||progress.fishing?.claimedMissions?.includes(id)||fishingMissionProgress(progress.fishing||{},mission)<mission.goal} onClick={()=>onAction('fishing_claim_mission',{id})}><span><b>{mission.name}</b><small>{Math.min(mission.goal,fishingMissionProgress(progress.fishing||{},mission))}/{mission.goal}</small></span><em>{progress.fishing?.claimedMissions?.includes(id)?'Đã nhận':`${mission.coins} xu · ${mission.xp} XP`}</em></button>)}</div>
</>}
{tab==='fish'&&<>
{!fishingInventoryCount(progress.fishing)&&<div className="fishing-guide">Thùng cá đang trống. Trang bị cần rồi ra bờ nước để bắt đầu.</div>}
            <div className="fishing-guide">Đã bắt {progress.fishing?.stats?.totalCaught || 0} con · cá hiếm {progress.fishing?.stats?.rareCaught || 0} · kỷ lục {Number(progress.fishing?.stats?.largestFish || 0).toFixed(2)} kg</div>
            {Object.entries(LAKE_FISH).map(([id, fish]) => {
              const record = progress.fishing?.fish?.[id];
              const count = typeof record === 'number' ? record : record?.count || 0;
              const averageWeight = typeof record === 'object' && record?.count ? record.totalWeight / record.count : 0;
              return <button className="fish-sale-card" key={`sell-${id}`} type="button" disabled={!connected || !count} onClick={() => onAction('fishing_sell', { id })}><FishPortrait fish={fish} images={fishImages}/><span><b>{fish.name} × {count}</b><small>{{common:'Phổ biến',uncommon:'Ít gặp',rare:'Hiếm',epic:'Quý hiếm',legendary:'Huyền thoại'}[fish.rarity]||fish.rarity} · {averageWeight ? `${averageWeight.toFixed(2)} kg/con` : 'Chưa có cá'} · bán cho Lão Ngư</small></span><em>Bán loài này</em></button>;
            })}
            <button type="button" className="fishing-sell-all" disabled={!connected || !fishingInventoryCount(progress.fishing)} onClick={onSellAll}>Bán toàn bộ cá</button>
</>}
</div></div><footer data-fishing-tick={fishingTick}><div><b>{FISHING_GEAR[progress.fishing?.equippedRod]?.name||'Chưa trang bị cần'}</b><small>Mồi: {FISHING_GEAR[progress.fishing?.equippedBait]?.name||'Không dùng'} · Thùng cá {fishingInventoryCount(progress.fishing)}/{fishingCapacity(progress.fishing)}</small></div><button onClick={onClose}>Tiếp tục khám phá</button></footer></section></div>;
}
