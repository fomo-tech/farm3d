import { useState } from 'react';

export function LandMarket({ lots, focusFarmId, playerId, ownsLand, coins, pending, onBuy, onVisit }) {
  const [village, setVillage] = useState('');
  const [selected, setSelected] = useState(focusFarmId || null);
  const current = lots.find(lot => lot.farmId === selected);
  return <div className="land-market">
    <p>Giá tăng khi gần trung tâm thị trấn. Mỗi người sở hữu một lô, gồm 12 ô trồng, nhà nhỏ cấp 1, chuồng và hàng rào.</p>
    <label>Làng <select value={village} onChange={event => { setVillage(event.target.value); setSelected(null); }}><option value="">Tất cả làng · giá thấp trước</option>{[...new Map(lots.map(l => [l.villageId, l.villageName]))].map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
    {current && <div className="land-confirm"><b>{current.villageName} · Lô {current.lot}</b><p>{current.distance} m tới trung tâm · {current.price.toLocaleString('vi-VN')} xu</p><p>{current.available ? 'Đang bán' : current.userName ? `Chủ sở hữu: ${current.userName}` : 'Đang giao dịch'}</p>
      <button type="button" onClick={() => onVisit(current)}>Đến cổng làng xem đất</button>{current.available && !ownsLand && <button type="button" disabled={pending || coins < current.price} onClick={() => onBuy(current)}>{pending ? 'Đang xử lý…' : coins < current.price ? 'Không đủ xu' : `Xác nhận mua · ${current.price} xu`}</button>}
    </div>}
    {!lots.length && <p>Đang lấy dữ liệu đất từ server…</p>}
    <div className="item-list land-list">{lots.filter(l => !village || l.villageId === village).sort((a, b) => a.price - b.price).map(l => <button type="button" key={l.farmId} onClick={() => setSelected(l.farmId)} aria-pressed={selected === l.farmId}>
      <span><b>{l.villageName} · Lô {l.lot}</b><small>{l.distance} m · {l.available ? 'Đang bán' : l.ownerId === playerId ? 'Đất của bạn' : l.userName ? `Chủ: ${l.userName}` : 'Đang giao dịch'}</small></span><em>{l.price.toLocaleString('vi-VN')} xu</em>
    </button>)}</div>
  </div>;
}
