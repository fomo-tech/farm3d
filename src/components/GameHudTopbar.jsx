import { DailyRewardBadge } from './DailyRewardBadge.jsx';
import { AvatarPortrait } from './AvatarPortrait.jsx';
import { HudIcon } from './icons3d/HudIcon.jsx';
import { levelFloor, levelCeiling } from '../game/economy/GameProgress.js';
const currency = value => {
  const n = Math.max(0, Number(value) || 0);
  if (n >= 1e9) return `${(n/1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`;
  return String(n);
};
export function GameHudTopbar({ progress, name, notifications, dailyReward = false, onProfile, onShop, onInventory, onFashion, onCamera, onPhone, onMissions }) {
  const xp = Math.min(100,Math.max(0,Math.round(((progress.xp-levelFloor(progress.level))/Math.max(1,levelCeiling(progress.level)-levelFloor(progress.level)))*100)));
  return <header className="topbar pt-topbar">
    <button type="button" className="pt-profile-card" onClick={onProfile} aria-label="Mở hồ sơ cá nhân" title="Hồ sơ của bạn">
      <div className="pt-avatar-ring"><AvatarPortrait customization={progress.customization} avatar={progress.profileAvatar} /><div className="pt-level-star" title={`Cấp ${progress.level}`}><span>{progress.level}</span></div></div>
      <div className="pt-profile-info"><strong className="pt-player-name">{name}</strong><div className="pt-exp-wrap" title={`${progress.xp} XP`}><div className="pt-exp-track"><div className="pt-exp-jelly" style={{width:`${xp}%`}} /></div><span className="pt-exp-val">{xp}%</span></div></div>
    </button>
    <div className="pt-currency-dock" aria-label="Tiền và hạt giống">
      <button type="button" className="pt-candy-pill pt-gold-pill" onClick={onShop} aria-label={`Mở cửa hàng, ${progress.coins} xu`}><span className="pt-pill-icon"><HudIcon mobile asset="coin" /></span><span className="pt-pill-val">{currency(progress.coins)}</span><span className="pt-pill-plus" aria-hidden="true">+</span></button>
      {progress.freeSeeds>0 && <div className="pt-candy-pill pt-seed-pill" title="Hạt giống miễn phí"><span className="pt-pill-icon"><HudIcon mobile asset="seeds" /></span><span className="pt-pill-val">{progress.freeSeeds}</span></div>}
      <button type="button" className="pt-candy-pill pt-gem-pill" onClick={onShop} aria-label={`Mở cửa hàng, ${progress.gems} đá quý`}><span className="pt-pill-icon"><HudIcon mobile asset="gem" /></span><span className="pt-pill-val">{currency(progress.gems)}</span><span className="pt-pill-plus" aria-hidden="true">+</span></button>
      <button type="button" className="pt-candy-btn pt-mobile-missions" aria-label="Mở sổ nhiệm vụ" onClick={onMissions}><HudIcon mobile asset="quest" /></button>
    </div>
    <nav className="pt-menu-dock" aria-label="Chức năng trò chơi">

      {[['backpack','pt-bag-btn','Túi đồ (B)',onInventory],['wardrobe','pt-fashion-btn','Thời trang',onFashion],['camera','pt-cam-btn','Đổi góc nhìn (C)',onCamera],['phone','pt-phone-btn','Menu trò chơi (P)',onPhone]].map(([asset,cls,label,onClick])=><button key={asset} type="button" className={`pt-candy-btn ${cls}`} title={asset === 'phone' && dailyReward ? `${label} · Có quà điểm danh hôm nay` : label} aria-label={label} aria-description={asset === 'phone' && dailyReward ? 'Có quà điểm danh hôm nay' : undefined} onClick={onClick}><HudIcon mobile asset={asset} />{asset==='phone' && (dailyReward ? <DailyRewardBadge/> : notifications && <i className="pt-menu-ping" />)}</button>)}
    </nav>
  </header>;
}
