import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NPC_TRADING_CONFIG } from '../../shared/npcTradingConfig.js';
import { CROPS, barnCapacity, inventoryCount } from '../game/economy/GameProgress.js';
import { HudIcon } from './icons3d/HudIcon.jsx';
import { useInventoryMeshArt } from './useInventoryMeshArt.js';
import './FarmMarket.css';
const OFFERS = Object.values(NPC_TRADING_CONFIG.roadside.offers);
export function RoadsideShopModal({ progress = {}, onBuyOffer, onVisitShop, onOpenInventory, onClose, pending = false, connected }) {
  const [tab,setTab] = useState('offers');
  const panel = useRef(null), close = useRef(onClose); close.current = onClose;
  const capacity = barnCapacity(progress), used = inventoryCount({...progress,inventory:progress.inventory||{}});
  const coins = progress.coins || 0, free = Math.max(0,capacity-used);
  const stock = Object.entries(progress.inventory||{}).filter(([id,count]) => count>0 && CROPS[id]);
  const items = useMemo(() => Object.keys(CROPS).map(id => ({id:`produce:${id}`,itemId:id,kind:'crop',category:'produce',name:CROPS[id].name,count:1})),[]);
  const images = useInventoryMeshArt(true,'produce',items);
  const art = id => images[`produce:${id}`] && images[`produce:${id}`] !== 'unavailable' ? <img src={images[`produce:${id}`]} alt={CROPS[id].name}/> : <HudIcon asset="basket" size={65}/>;
  useEffect(() => {
    const previous = document.activeElement;
    panel.current?.querySelector('button')?.focus();
    const keys = event => {
      if (event.key==='Escape') { event.preventDefault(); event.stopPropagation(); close.current?.(); }
      if (event.key!=='Tab') return;
      const controls = [...panel.current.querySelectorAll('button:not(:disabled)')].filter(el=>el.getClientRects().length);
      const first=controls[0],last=controls[controls.length-1];
      if (event.shiftKey&&document.activeElement===first) { event.preventDefault();last?.focus(); }
      else if (!event.shiftKey&&document.activeElement===last) { event.preventDefault();first?.focus(); }
    };
    document.addEventListener('keydown',keys,true);
    return ()=>{document.removeEventListener('keydown',keys,true);if(previous?.isConnected)previous.focus();};
  },[]);
  const buy = offer => { if (!connected||pending||coins<offer.price||free<offer.amount) return;onBuyOffer?.(offer); };
  return <div className="farm-market-overlay" onClick={event=>{if(event.target===event.currentTarget)onClose?.();}}>
    <section className="farm-market" ref={panel} role="dialog" aria-modal="true" aria-labelledby="farm-market-title">
      <div className="farm-market-canopy" aria-hidden="true"/>
      <header className="farm-market-header"><span className="farm-market-logo"><HudIcon asset="shop" size={51}/></span><div><small>GIAN HÀNG VEN ĐƯỜNG · HOA MAI</small><h2 id="farm-market-title">Cửa hàng dân gian</h2></div><div className="farm-market-wallet"><HudIcon asset="coin" size={28}/><span><small>Xu của bạn</small><b>{coins.toLocaleString('vi-VN')}</b></span></div><button className="farm-market-close" aria-label="Đóng cửa hàng dân gian" onClick={onClose}>×</button></header>
      <nav className="farm-market-tabs" aria-label="Danh mục cửa hàng"><button aria-pressed={tab==='offers'} onClick={()=>setTab('offers')}><HudIcon asset="basket" size={29}/><span>Nông sản bổ sung</span><small>{OFFERS.length}</small></button><button aria-pressed={tab==='stock'} onClick={()=>setTab('stock')}><HudIcon asset="backpack" size={29}/><span>Hàng trong kho</span><small>{stock.length}</small></button><div className={`farm-market-capacity ${free===0?'full':''}`}><span>Kho <b>{used}/{capacity}</b></span><div><i style={{width:`${Math.min(100,used/capacity*100)}%`}}/></div></div></nav>
      <div className="farm-market-content">
        {tab==='offers'?<><section className="farm-market-banner"><HudIcon asset="shop" size={61}/><div><small>THÊM MỘT CHÚT CHO ĐƠN HÀNG</small><h3>Ghé quầy, chọn nông sản</h3><p>Mua thêm khi cần đủ nguyên liệu. Giá mua cao hơn giá bán lại; mỗi nút mua là một gói hàng.</p></div><button disabled={pending||!onVisitShop} onClick={onVisitShop}><HudIcon asset="map" size={23}/> Đến gian hàng</button></section>
          <div className="farm-market-offers">{OFFERS.map(offer=>{const missing=Math.max(0,offer.price-coins);const noSpace=free<offer.amount;const disabled=!connected||pending||missing>0||noSpace||!onBuyOffer;return <article key={offer.id} className="farm-market-offer"><div className="farm-market-product-art">{art(offer.crop)}<span>Gói {offer.amount}</span></div><div className="farm-market-product-copy"><small>NÔNG SẢN</small><h3>{CROPS[offer.crop].name}</h3><p>{offer.amount} sản phẩm / gói</p><div className="farm-market-price"><HudIcon asset="coin" size={24}/><strong>{offer.price.toLocaleString('vi-VN')}</strong><small>xu / gói</small></div><button disabled={disabled} onClick={()=>buy(offer)} aria-label={`Mua gói ${offer.amount} ${CROPS[offer.crop].name}, ${offer.price} xu`}>{pending?'Đang xác nhận…':!connected?'Chờ kết nối':noSpace?'Kho không đủ chỗ':missing?'Thiếu xu':'Mua tại quầy'}</button><small className="farm-market-buy-hint">{!connected?'Kết nối lại để mua hàng.':noSpace?`Cần ${offer.amount} chỗ trống; kho còn ${free}.`:missing?`Cần thêm ${missing.toLocaleString('vi-VN')} xu.`:`Trong kho: ${progress.inventory?.[offer.crop]||0} sản phẩm`}</small></div></article>;})}</div>
          <p className="farm-market-footnote">Mua hàng tại quầy ven đường. Nếu đang ở xa, chọn “Đến gian hàng” để được dẫn đường.</p>
        </>:<><div className="farm-market-stock-heading"><div><small>NÔNG SẢN CỦA BẠN</small><h3>Vụ mùa đang cất trong kho</h3><p>Giá thu mua dưới đây tính cho một sản phẩm.</p></div><button disabled={!onOpenInventory||pending} onClick={onOpenInventory}><HudIcon asset="backpack" size={24}/> Mở Túi đồ</button></div>
          {stock.length?<div className="farm-market-stock">{stock.map(([id,count])=><article key={id}><div className="farm-market-stock-art">{art(id)}</div><div><h4>{CROPS[id].name}</h4><p>Đang có <b>{count}</b> sản phẩm</p><small>Giá thu mua <b>{CROPS[id].sellPrice} xu</b> / sản phẩm</small></div><span>×{count}</span></article>)}</div>:<div className="farm-market-empty"><HudIcon asset="basket" size={83}/><h3>Kho chưa có nông sản</h3><p>Thu hoạch ở nông trại hoặc mua một gói hàng tại quầy để bổ sung.</p><button onClick={()=>setTab('offers')}>Xem nông sản</button></div>}
          <div className="farm-market-stock-tip"><HudIcon asset="quest" size={34}/><p>Mở Túi đồ để bán nông sản hoặc dùng chúng để giao đơn hàng. Giá gói mua tại quầy và giá thu mua là hai mức khác nhau.</p></div>
        </>}
      </div><footer className="farm-market-footer"><span role="status">{pending?'Vui lòng chờ một chút…':!connected?'Chưa có kết nối':`Kho còn ${free} chỗ trống`}</span><button onClick={onClose}>Tiếp tục khám phá</button></footer>
    </section>
  </div>;
}
