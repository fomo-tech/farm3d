import React from 'react';
import { LandExpansionPanel } from './LandExpansionPanel.jsx';
import { HudIcon } from './icons3d/HudIcon.jsx';
import { FarmUpgradeIcon } from './icons3d/FarmUpgradeIcon.jsx';
import { farmBarnUpgradeCost } from '../../shared/farmConfig.js';

export function FarmUpgradePanel({progress, animals=[], selectedKey, onSelect, onUnlock, connected, pending, ownsLand, onUpgradeBarn, onUpgradeHome}) {
 return (<div className="farm-upgrade-content">
          <div className="farm-upgrade-wallet"><span>Đầu tư cho nông trại</span><b><HudIcon asset="coin" size={26}/>{progress.coins.toLocaleString('vi-VN')} <small>xu</small></b></div>
          <LandExpansionPanel progress={progress} animals={animals} selectedKey={selectedKey} onSelect={onSelect} onUnlock={onUnlock} connected={connected} pending={pending} />
          <div className="farm-building-upgrades">
            <article><div className="farm-building-art"><FarmUpgradeIcon asset="barn" size={76}/></div><div><small>KHO NÔNG SẢN · CẤP {progress.barnLevel}</small><h3>Kho rộng hơn</h3><p>Thêm 20 chỗ chứa</p></div><button type="button" disabled={!connected || !ownsLand || progress.coins < farmBarnUpgradeCost(progress.barnLevel)} onClick={onUpgradeBarn}><span>Lên cấp {progress.barnLevel + 1}</span><b>{farmBarnUpgradeCost(progress.barnLevel).toLocaleString('vi-VN')} xu</b></button></article>
            <article><div className="farm-building-art home"><FarmUpgradeIcon asset="home" size={76}/></div><div><small>NHÀ NÔNG TRẠI · CẤP {progress.homeTier || 1}</small><h3>Nhà gỗ ấm cúng</h3><p>{(progress.homeTier || 1) >= 2 ? 'Ngôi nhà đã hoàn thiện' : progress.level < 4 ? 'Mở khi đạt cấp 4' : 'Một diện mạo mới cho tổ ấm'}</p></div><button type="button" disabled={!connected || !ownsLand || (progress.homeTier || 1) >= 2 || progress.level < 4 || progress.coins < 1800} onClick={onUpgradeHome}><span>{(progress.homeTier || 1) >= 2 ? 'Đã nâng cấp' : 'Nâng nhà'}</span>{(progress.homeTier || 1) < 2 && <b>1.800 xu</b>}</button></article>
          </div>
        </div>);
}
