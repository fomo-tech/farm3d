import { useEffect, useState } from 'react';
import { firstLandPurchasePrice } from '../../shared/landConfig.js';

export function LandMarket({ lots, focusFarmId, playerId, ownsLand, coins, pending, onBuy, onVisit }) {
  const [village, setVillage] = useState('');
  const [affordableOnly, setAffordableOnly] = useState(!ownsLand);
  const [visibleCount, setVisibleCount] = useState(36);
  const [selected, setSelected] = useState(focusFarmId || null);
  useEffect(() => { setSelected(focusFarmId || null); }, [focusFarmId]);
  const current = lots.find(lot => lot.farmId === selected);
  const focused = Boolean(focusFarmId && selected === focusFarmId);
  const priceToPay = lot => ownsLand ? lot.price : firstLandPurchasePrice(lot.price);
  const listedLots = !focused ? lots.filter(lot => (!village || lot.villageId === village) && (!affordableOnly || (lot.available && priceToPay(lot) <= coins))).sort((a, b) => Number(b.available) - Number(a.available) || priceToPay(a) - priceToPay(b)) : [];
  return <div className={`land-market ${focused ? 'land-market-focused' : ''}`}>
    {!focused && <><p>Giá tăng khi gần trung tâm thị trấn. Lần mua đất đầu được hỗ trợ tối đa 350 xu, trừ thẳng vào giá lô; bạn không cần kiếm đủ giá niêm yết. Mỗi người sở hữu một lô gồm 12 ô trồng, nhà nhỏ, chuồng và hàng rào.</p>
    <label>Làng <select value={village} onChange={event => { setVillage(event.target.value); setSelected(null); setVisibleCount(36); }}><option value="">Tất cả làng · giá thấp trước</option>{[...new Map(lots.map(l => [l.villageId, l.villageName]))].map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
    {!ownsLand && <button type="button" aria-pressed={affordableOnly} onClick={() => { setAffordableOnly(value => !value); setVisibleCount(36); }}>{affordableOnly ? '✓ Chỉ hiện lô đủ xu' : 'Hiện tất cả lô đất'}</button>}
    {affordableOnly && lots.length > 0 && listedLots.length === 0 && <p>Chưa có lô đang bán vừa số xu của bạn trong khu vực này. Hãy chọn làng khác hoặc xem tất cả lô.</p>}</>}
    {current && <div className="land-confirm"><b>{current.villageName} · Lô {current.lot}</b><p>{current.distance} m tới trung tâm · Giá niêm yết {current.price.toLocaleString('vi-VN')} xu{!ownsLand ? ` · Bạn trả ${priceToPay(current).toLocaleString('vi-VN')} xu` : ''}</p><p>{current.available ? 'Đang bán' : current.userName ? `Chủ sở hữu: ${current.userName}` : 'Đang giao dịch'}</p>
      {!focused && <button type="button" onClick={() => onVisit(current)}>Đến cổng làng xem đất</button>}{current.available && !ownsLand && <button type="button" disabled={pending || coins < priceToPay(current)} onClick={() => onBuy(current)}>{pending ? 'Đang xử lý…' : coins < priceToPay(current) ? 'Không đủ xu · chọn lô rẻ hơn' : `Xác nhận mua lô đất · ${priceToPay(current).toLocaleString('vi-VN')} xu`}</button>}
    </div>}
    {!lots.length && <p>Đang lấy dữ liệu đất từ server…</p>}
    {focused && !current && lots.length > 0 && <p>Thông tin lô này đang cập nhật. Vui lòng bấm lại bảng cổng.</p>}
    {!focused && <div className="item-list land-list">{listedLots.slice(0, visibleCount).map(l => <button type="button" key={l.farmId} onClick={() => setSelected(l.farmId)} aria-pressed={selected === l.farmId}>
      <span><b>{l.villageName} · Lô {l.lot}</b><small>{l.distance} m · {l.available ? 'Đang bán' : l.ownerId === playerId ? 'Đất của bạn' : l.userName ? `Chủ: ${l.userName}` : 'Đang giao dịch'}</small></span><em>{priceToPay(l).toLocaleString('vi-VN')} xu</em>
    </button>)}{listedLots.length > visibleCount && <button type="button" onClick={() => setVisibleCount(count => count + 36)}>Xem thêm lô đất · {Math.min(visibleCount, listedLots.length)}/{listedLots.length}</button>}</div>}
  </div>;
}
