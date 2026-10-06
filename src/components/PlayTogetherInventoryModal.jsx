import React, { useMemo, useState } from 'react';
import { buildInventoryView } from '../../shared/inventoryView.js';
import { Icon3dHeaderBackpack, Icon3dCloseButton, Icon3dBlueFish } from './icons3d/Inventory3DIcons.jsx';
import { Icon3dCarrot, Icon3dFishingRodBamboo } from './icons3d/GameIcons3D.jsx';
import { Icon3dTabTop } from './icons3d/Fashion3DIcons.jsx';
import { useInventoryMeshArt } from './useInventoryMeshArt.js';
import './PlayTogetherInventoryModal.css';

const CATEGORIES = [
  ['produce', 'Nông sản', 'Kho', Icon3dCarrot], ['tools', 'Đồ câu', 'Dụng cụ', Icon3dFishingRodBamboo],
  ['fashion', 'Trang phục', 'Tủ đồ', Icon3dTabTop], ['fish', 'Cá', 'Thùng cá', Icon3dBlueFish],
];

export function PlayTogetherInventoryModal({ isOpen = false, onClose, onOpenFashion, progress, onUseItem, farmAudio }) {
  const [category, setCategory] = useState('produce');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const inventory = useMemo(() => buildInventoryView(progress), [progress]);
  const visible = useMemo(() => inventory.entries.filter(item => item.category === category &&
    item.name.toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN'))), [inventory, category, query]);
  const meshImages = useInventoryMeshArt(isOpen, category, visible);
  const selected = visible.find(item => item.id === selectedId) || visible[0] || null;
  if (!isOpen) return null;
  const action = selected?.kind === 'crop' ? 'Bán 1' : selected?.kind === 'rod' || selected?.kind === 'bait' || selected?.kind === 'gear' ? 'Trang bị' : null;
  const categoryLabel = CATEGORIES.find(([id]) => id === category)?.[1];

  return <div className="pt-inv-overlay" onClick={onClose}>
    <section className={`pt-inv-modal ${visible.length <= 5 ? 'pt-inv-compact' : ''}`} role="dialog" aria-modal="true" aria-label="Túi đồ" onClick={event => event.stopPropagation()}>
      <header className="pt-inv-header">
        <div className="pt-inv-header-title"><Icon3dHeaderBackpack size={34}/><div><h1>Túi đồ</h1><span>Vật phẩm của bạn</span></div></div>
        <div className={`pt-inv-capacity ${inventory.used >= inventory.capacity ? 'full' : ''}`} aria-label={`Kho ${inventory.used} trên ${inventory.capacity}`}>
          <strong>Kho {inventory.used}/{inventory.capacity}</strong><div><i style={{ width: `${Math.min(100, inventory.used / inventory.capacity * 100)}%` }}/></div>
        </div>
        <button type="button" className="pt-inv-close-btn" onClick={onClose} aria-label="Đóng túi đồ"><Icon3dCloseButton size={30}/></button>
      </header>
      <nav className="pt-inv-tabs" aria-label="Danh mục túi đồ">
        {CATEGORIES.map(([id, label, subtitle, Icon]) => <button type="button" key={id} aria-current={category === id ? 'page' : undefined}
          onClick={() => { setCategory(id); setSelectedId(null); setQuery(''); farmAudio?.playPop?.(); }}><Icon size={25}/><span className="pt-inv-tab-label"><strong>{label}</strong><small>{subtitle}</small></span></button>)}
      </nav>
      <div className="pt-inv-search"><strong>{categoryLabel}</strong><small>{visible.length} loại</small><input aria-label="Tìm vật phẩm" placeholder="Tìm vật phẩm" value={query} onChange={event => setQuery(event.target.value)}/></div>
      <div className="pt-inv-body">
        <div className="pt-inv-grid-container">
          {visible.length ? <div className="pt-inv-grid">{visible.map(item => {
            return <button type="button" key={item.id} className={`pt-inv-slot ${selected?.id === item.id ? 'selected' : ''}`}
              onClick={() => { setSelectedId(item.id); farmAudio?.playPop?.(); }} aria-label={`${item.name}, số lượng ${item.count}`}>
              <span className="pt-inv-slot-art">{meshImages[item.id] === 'unavailable' ? <span className="pt-inv-mesh-wait">Chưa có mô hình</span> : meshImages[item.id] ? <img src={meshImages[item.id]} alt={item.name}/> : <span className="pt-inv-mesh-wait">Đang tạo hình…</span>}</span><span className="pt-slot-badge">{item.count}</span><small>{item.name}</small>
            </button>;
          })}</div> : <div className="pt-inv-empty">{query ? 'Không tìm thấy vật phẩm.' : 'Chưa có vật phẩm trong danh mục này.'}</div>}
        </div>
        <aside className="pt-inv-detail-card">
          {selected ? <>
            <div className="pt-detail-preview">{meshImages[selected.id] === 'unavailable' ? <span className="pt-inv-mesh-wait">{selected.name}<br/>Chưa có mô hình 3D</span> : meshImages[selected.id] ? <img src={meshImages[selected.id]} alt={selected.name}/> : <span className="pt-inv-mesh-wait">Đang tạo hình từ mesh…</span>}</div>
            <h2>{selected.name}</h2>
            <p>Số lượng <strong>{selected.count}</strong></p>
            {action && <button type="button" className="pt-btn-use" onClick={() => onUseItem?.(selected)}>{action}</button>}
            {selected.category === 'fashion' && <button type="button" className="pt-btn-use" onClick={() => { onClose?.(); onOpenFashion?.(); }}>Mở tủ đồ</button>}
            {!action && selected.category !== 'fashion' && <small>{selected.category === 'fish' ? 'Bán cá tại quầy câu cá.' : 'Dùng tại nông trại hoặc quầy chế biến.'}</small>}
          </> : <div className="pt-inv-empty">Chọn vật phẩm để xem chi tiết.</div>}
        </aside>
      </div>
    </section>
  </div>;
}
