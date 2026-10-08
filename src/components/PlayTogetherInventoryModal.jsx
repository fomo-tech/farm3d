import React, { useEffect, useMemo, useRef, useState } from 'react';
import { buildInventoryView } from '../../shared/inventoryView.js';
import { HudIcon } from './icons3d/HudIcon.jsx';
import { InventoryItemArt } from './InventoryItemArt.jsx';
import { FARM_CONFIG } from '../../shared/farmConfig.js';
import { useInventoryMeshArt } from './useInventoryMeshArt.js';
import './PlayTogetherInventoryModal.css';

const CATEGORIES = [
  ['produce', 'Nông sản', 'Kho', 'basket'], ['tools', 'Đồ câu', 'Dụng cụ', 'fish'],
  ['fashion', 'Trang phục', 'Tủ đồ', 'wardrobe'], ['fish', 'Cá', 'Thùng cá', 'fish'],
];

export function PlayTogetherInventoryModal({ isOpen = false, onClose, onOpenFashion, progress, onUseItem, farmAudio, connected = true }) {
  const [category, setCategory] = useState('produce');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.querySelector('[aria-label="Đóng túi đồ"]')?.focus();
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current?.(); }
      if (event.key !== 'Tab') return;
      const nodes = [...dialog.querySelectorAll('button:not(:disabled),input')];
      const first = nodes[0], last = nodes.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previous?.focus?.(); };
  }, [isOpen]);
  const normalize = text => text.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  const inventory = useMemo(() => buildInventoryView(progress), [progress]);
  const visible = useMemo(() => inventory.entries.filter(item => item.category === category &&
    normalize(item.name).includes(normalize(query.trim()))), [inventory, category, query]);
  const meshImages = useInventoryMeshArt(isOpen, category, visible);
  const selected = visible.find(item => item.id === selectedId) || visible[0] || null;
  const equipped = selected && (progress?.fishing?.equippedRod === selected.itemId || progress?.fishing?.equippedBait === selected.itemId);
  const price = selected?.kind === 'crop' ? FARM_CONFIG.crops[selected.itemId]?.sellPrice : selected?.itemId==='apple'?FARM_CONFIG.products.apple.sellPrice:null;
  const art = (item, size) => meshImages[item.id] && meshImages[item.id] !== 'unavailable' ? <img src={meshImages[item.id]} alt={item.name}/> : <InventoryItemArt item={item} size={size}/>;
  if (!isOpen) return null;
  const action = (selected?.kind === 'crop'||selected?.itemId==='apple') ? 'Bán 1' : selected?.kind === 'rod' || selected?.kind === 'bait' || selected?.kind === 'gear' ? 'Trang bị' : null;
  const categoryLabel = CATEGORIES.find(([id]) => id === category)?.[1];

  return <div className="pt-inv-overlay" onClick={onClose}>
    <section ref={dialogRef} className="pt-inv-modal" role="dialog" aria-modal="true" aria-label="Túi đồ" onClick={event => event.stopPropagation()}>
      <header className="pt-inv-header">
        <div className="pt-inv-header-title"><HudIcon asset="backpack" size={46}/><div><h1>Túi đồ</h1><span>Vật phẩm của bạn</span></div></div>
        <div className={`pt-inv-capacity ${inventory.used >= inventory.capacity ? 'full' : ''}`} aria-label={`Kho ${inventory.used} trên ${inventory.capacity}`}>
          <strong>Kho {inventory.used}/{inventory.capacity}</strong><div><i style={{ width: `${Math.min(100, inventory.used / inventory.capacity * 100)}%` }}/></div>
        </div>
        <button type="button" className="pt-inv-close-btn" onClick={onClose} aria-label="Đóng túi đồ"><span aria-hidden="true">×</span></button>
      </header>
      <nav className="pt-inv-tabs" aria-label="Danh mục túi đồ">
        {CATEGORIES.map(([id, label, subtitle, asset]) => <button type="button" key={id} aria-current={category === id ? 'page' : undefined}
          onClick={() => { setCategory(id); setSelectedId(null); setQuery(''); farmAudio?.playPop?.(); }}><HudIcon asset={asset} size={32}/><span className="pt-inv-tab-label"><strong>{label}</strong><small>{inventory.entries.filter(item => item.category === id).length} loại</small></span></button>)}
      </nav>
      <div className="pt-inv-search"><strong>{categoryLabel}</strong><small>{visible.length} loại</small><input aria-label="Tìm vật phẩm" placeholder="Tìm vật phẩm" value={query} onChange={event => setQuery(event.target.value)}/></div>
      <div className="pt-inv-body">
        <div className="pt-inv-grid-container">
          {visible.length ? <div className="pt-inv-grid">{visible.map(item => {
            return <button type="button" key={item.id} className={`pt-inv-slot ${selected?.id === item.id ? 'selected' : ''}`}
              onClick={() => { setSelectedId(item.id); farmAudio?.playPop?.(); }} aria-pressed={selected?.id === item.id} aria-label={`${item.name}, số lượng ${item.count}`}>
              <span className="pt-inv-slot-art">{art(item, 64)}</span><span className="pt-slot-badge">{item.count}</span><small>{item.name}</small>
            </button>;
          })}</div> : <div className="pt-inv-empty">{query ? 'Không tìm thấy vật phẩm.' : 'Chưa có vật phẩm trong danh mục này.'}</div>}
        </div>
        <aside className="pt-inv-detail-card">
          {selected ? <>
            <span className="pt-detail-category">{categoryLabel}</span>
            <div className="pt-detail-preview">{art(selected, 120)}</div>
            <h2>{selected.name}</h2>
            <p>Số lượng <strong>{selected.count}</strong></p>
            {price != null && <p>Giá bán / vật phẩm <strong>{price} xu</strong></p>}
            {equipped && <span className="pt-inv-equipped">Đang trang bị</span>}
            {!connected && action && <small role="status">Kết nối lại để thao tác.</small>}
            {action && <button disabled={!connected || equipped || !onUseItem} type="button" className="pt-btn-use" onClick={() => onUseItem?.(selected)}>{equipped ? 'Đang trang bị' : price != null ? `Bán 1 · ${price} xu` : action}</button>}
            {selected.category === 'fashion' && <button type="button" className="pt-btn-use" onClick={() => { onClose?.(); onOpenFashion?.(); }}>Mở tủ đồ</button>}
            {!action && selected.category !== 'fashion' && <small>{selected.category === 'fish' ? 'Bán cá tại quầy câu cá.' : 'Dùng tại nông trại hoặc quầy chế biến.'}</small>}
          </> : <div className="pt-inv-empty">Chọn vật phẩm để xem chi tiết.</div>}
        </aside>
      </div>
    </section>
  </div>;
}
