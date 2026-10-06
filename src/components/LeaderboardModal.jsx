import React, { useState } from 'react';
import {
  Icon3dTrophyCup,
  Icon3dCrownRibbon,
  Icon3dStar,
  Icon3dSprout,
  Icon3dHouseCabin,
  Icon3dNonLa,
} from './icons3d/GameIcons3D.jsx';

/**
 * BẢNG VINH DANH CƯ DÂN KAIA (LEADERBOARD MODAL)
 * Thiết kế phong cách Play Together Cute-Core cao cấp
 */
export function LeaderboardModal({
  leaderboard = [],
  myPlayer = null,
  onVisitFarm = null,
  onAddFriend = null,
  onClose,
}) {
  const [tab, setTab] = useState('xp'); // 'xp' | 'level' | 'home'

  const displayList = leaderboard || [];

  // Sắp xếp theo tab
  const sortedList = [...displayList].sort((a, b) => {
    if (tab === 'level') return (b.progress?.level || 0) - (a.progress?.level || 0);
    if (tab === 'home') return (b.progress?.homeTier || 0) - (a.progress?.homeTier || 0);
    return (b.progress?.xp || 0) - (a.progress?.xp || 0);
  });

  const getRankBadge = (rank) => {
    if (rank === 0) return { icon: <Icon3dCrownRibbon size={24} />, class: 'rank-gold', title: 'Hạng 1' };
    if (rank === 1) return { icon: <span className="ld-rank-num">2</span>, class: 'rank-silver', title: 'Hạng 2' };
    if (rank === 2) return { icon: <span className="ld-rank-num">3</span>, class: 'rank-bronze', title: 'Hạng 3' };
    return { icon: `${rank + 1}`, class: 'rank-normal', title: `Hạng ${rank + 1}` };
  };

  return (
    <div className="pt-leaderboard-modal-backdrop" onClick={onClose}>
      <section
        className="pt-leaderboard-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Bảng vinh danh cư dân Kaia"
      >
        {/* Header */}
        <header className="pt-modal-header ld-header">
          <div className="ld-title-group">
            <span className="ld-trophy-icon"><Icon3dTrophyCup size={32} /></span>
            <div>
              <h2 className="pt-modal-title ld-title">BẢNG VINH DANH CƯ DÂN KAIA</h2>
              <p className="ld-subtitle">Xếp hạng nông dân và nhà thám hiểm tài ba nhất thị trấn</p>
            </div>
          </div>
          <button className="pt-modal-close" onClick={onClose} aria-label="Đóng bảng xếp hạng">✕</button>
        </header>

        {/* Tab switcher */}
        <div className="ld-tabs">
          <button
            className={`ld-tab-btn ${tab === 'xp' ? 'active' : ''}`}
            onClick={() => setTab('xp')}
          >
            <Icon3dSprout size={16} /> Danh Vọng (XP)
          </button>
          <button
            className={`ld-tab-btn ${tab === 'level' ? 'active' : ''}`}
            onClick={() => setTab('level')}
          >
            <Icon3dStar size={16} /> Cấp Độ (Level)
          </button>
          <button
            className={`ld-tab-btn ${tab === 'home' ? 'active' : ''}`}
            onClick={() => setTab('home')}
          >
            <Icon3dHouseCabin size={16} /> Dinh Thự (Home)
          </button>
        </div>

        {/* Top 3 Podium Cards */}
        <div className="ld-top3-grid">
          {sortedList.slice(0, 3).map((item, idx) => {
            const badge = getRankBadge(idx);
            return (
              <div key={item.playerId || idx} className={`ld-podium-card ${badge.class}`}>
                <div className="ld-podium-crown">{badge.icon}</div>
                <div className="ld-podium-avatar">
                  {idx === 0 ? <Icon3dCrownRibbon size={24} /> : <Icon3dStar size={24} />}
                </div>
                <div className="ld-podium-name" title={item.name}>{item.name}</div>
                <div className="ld-podium-badge">Lv.{item.progress?.level || 1}</div>
                <div className="ld-podium-score">
                  {tab === 'xp' ? `${(item.progress?.xp || 0).toLocaleString()} XP` : tab === 'level' ? `Cấp ${item.progress?.level || 1}` : `Nhà Cấp ${item.progress?.homeTier || 1}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* List Ranks 4 to 20 */}
        <div className="ld-list-scroll">
          {sortedList.length === 0 && <p>Chưa có cư dân nào trên bảng xếp hạng.</p>}
          {sortedList.slice(3).map((item, idx) => {
            const actualRank = idx + 3;
            return (
              <div key={item.playerId || actualRank} className="ld-row-item">
                <div className="ld-row-rank">{actualRank + 1}</div>
                <div className="ld-row-info">
                  <div className="ld-row-name">{item.name}</div>
                  <div className="ld-row-meta">
                    <span className="ld-meta-pill">Lv.{item.progress?.level || 1}</span>
                    <span className="ld-meta-score">
                      {tab === 'xp' ? `${(item.progress?.xp || 0).toLocaleString()} XP` : `Nhà Cấp ${item.progress?.homeTier || 1}`}
                    </span>
                  </div>
                </div>
                <div className="ld-row-actions">
                  {onAddFriend && (
                    <button
                      className="ld-action-btn friend"
                      onClick={() => onAddFriend(item.playerId)}
                      title="Kết bạn"
                    >
                      Kết bạn
                    </button>
                  )}
                  {onVisitFarm && (
                    <button
                      className="ld-action-btn visit"
                      onClick={() => onVisitFarm(item.playerId)}
                      title="Xem hồ sơ"
                    >
                      Hồ sơ
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* My Player Footer */}
        {myPlayer && (
          <footer className="ld-my-card">
            <div className="ld-my-avatar"><Icon3dNonLa size={26} /></div>
            <div className="ld-my-info">
              <div className="ld-my-label">VỊ TRÍ CỦA BẠN</div>
              <div className="ld-my-name">{myPlayer.name || 'Nông Dân Kaia'}</div>
            </div>
            <div className="ld-my-stats">
              <span className="ld-my-level">Lv.{myPlayer.progress?.level || 1}</span>
              <span className="ld-my-xp">{(myPlayer.progress?.xp || 0).toLocaleString()} XP</span>
            </div>
          </footer>
        )}
      </section>
    </div>
  );
}
