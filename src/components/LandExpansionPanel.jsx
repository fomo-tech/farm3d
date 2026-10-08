import React, { useEffect, useState } from 'react';
import { landExpansionBudget } from '../../shared/landExpansionBudget.js';
import { LAND_EXPANSION_CONFIG, farmTileKeys, unlockedFarmTiles, landUnlockQuote } from '../../shared/landExpansionConfig.js';
import './LandExpansionPanel.css';
import { FarmUpgradeIcon } from './icons3d/FarmUpgradeIcon.jsx';

export function LandExpansionPanel({ progress, selectedKey, onSelect, onUnlock, connected, pending, animals = [] }) {
  const [acceptedBudget, setAcceptedBudget] = useState(null);
  const config = LAND_EXPANSION_CONFIG;
  const unlocked = unlockedFarmTiles(progress);
  const keys = farmTileKeys();
  const quote = selectedKey ? landUnlockQuote(progress, selectedKey) : null;
  const budget = quote && !quote.error && !quote.unlocked ? landExpansionBudget(progress, quote.cost, animals) : null;
  const budgetKey = budget ? JSON.stringify([selectedKey, quote.cost, progress.coins, budget.cropId, progress.freeSeeds, budget.plotsAfter, budget.seedCoins, budget.feedCoins]) : null;
  useEffect(() => { setAcceptedBudget(null); }, [budgetKey]);
  const lowCapitalAccepted = budgetKey !== null && acceptedBudget === budgetKey;
  const xu = value => value.toLocaleString('vi-VN');
  const tier = config.tiers.find(item => unlocked.length < item.through);
  return <section className="land-expansion" aria-label="Khai hoang nông trại">
    <header><div><FarmUpgradeIcon asset="expand" size={52}/><div><small>ĐẤT TRỒNG</small><strong>Mở rộng khu vườn</strong></div></div><span>{unlocked.length}<small> / {keys.length} ô</small></span></header>
    <p>{unlocked.length ? 'Chọn ô sát đất đã mở để khai hoang.' : 'Bạn cần sở hữu lô đất để mở khu vườn.'}</p>
    <div className="land-expansion-grid" style={{ gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))` }}>
      {keys.map(key => {
        const opened = unlocked.includes(key);
        const item = landUnlockQuote(progress, key);
        const [column, row] = key.split(':').map(Number);
        const adjacent = !opened && unlocked.some(other => { const [x, y] = other.split(':').map(Number); return Math.abs(x-column) + Math.abs(y-row) === 1; });
        return <button key={key} type="button" className={`${opened ? 'opened' : adjacent ? 'locked available' : 'locked distant'} ${selectedKey === key ? 'selected' : ''}`} disabled={opened || pending} aria-pressed={selectedKey === key} aria-label={`Ô hàng ${row + 1}, cột ${column + 1}: ${opened ? 'đã mở' : `${item.cost} xu`}`} title={opened ? 'Đã khai hoang' : item.error || `Mở ô · ${item.cost} xu`} onClick={() => onSelect(key)}>
          <span className="garden-tile-symbol" aria-hidden="true">{opened ? <FarmUpgradeIcon asset="sprout" size={32}/> : adjacent ? '+' : '·'}</span><small>{opened ? 'Đã mở' : adjacent ? 'Mở ô' : 'Chưa mở'}</small>
        </button>;
      })}
    </div>
    <div className="land-expansion-legend"><span><i/>Đã mở</span><span><i/>Có thể mở tiếp</span>{tier && <b>Từ {tier.cost.toLocaleString('vi-VN')} xu</b>}</div>
    {!tier && unlocked.length === keys.length && <p>Đã khai hoang toàn bộ lô đất.</p>}
    {quote && !quote.unlocked && <div className="land-expansion-confirm">
      <p role="status">{quote.error || `Ô hàng ${Number(selectedKey.split(':')[1]) + 1}, cột ${Number(selectedKey.split(':')[0]) + 1} · ${quote.cost.toLocaleString('vi-VN')} xu`}</p>
      {budget && <>
        <details className="land-budget-details"><summary>Chi phí & vốn còn lại</summary>
        <dl className="land-expansion-budget">
          <div><dt>Giá khai hoang</dt><dd>{xu(quote.cost)} xu</dd></div>
          <div><dt>Xu còn lại sau mua</dt><dd>{xu(budget.remainingCoins)} xu</dd></div>
          <div><dt>Hạt {budget.cropName.toLowerCase()} cho {budget.plotsAfter} ô</dt><dd>{xu(budget.seedCoins)} xu</dd></div>
          <div><dt>Đợt cho ăn tiếp theo</dt><dd>{xu(budget.feedCoins)} xu</dd></div>
        </dl>
        <p>Dự tính hạt giống và thức ăn cho một đợt sản xuất.</p></details>
        {budget.needsWarning && <div className="land-expansion-warning" role="alert">
          <strong>Xu dự phòng còn thấp.</strong>
          <p>Còn {xu(budget.remainingCoins)} xu, thấp hơn mức tham khảo {xu(budget.recommendedCoins)} xu. Cần thêm {xu(budget.shortfall)} xu để đủ mức vốn này.</p>
          <label><input type="checkbox" checked={lowCapitalAccepted} disabled={pending} onChange={event => setAcceptedBudget(event.target.checked ? budgetKey : null)} /> Tôi vẫn muốn mở ô này.</label>
        </div>}
      </>}
      <button type="button" disabled={!connected || pending || Boolean(quote.error) || (budget?.needsWarning && !lowCapitalAccepted)} onClick={() => onUnlock(selectedKey)}>{pending ? 'Đang xác nhận…' : !connected ? 'Đang chờ kết nối' : `Mở ô đất · ${quote.cost.toLocaleString('vi-VN')} xu`}</button>
    </div>}
  </section>;
}
