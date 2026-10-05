import React, { useState } from 'react';

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

  // Dữ liệu mẫu phong phú nếu chưa có nhiều người chơi online
  const defaultList = [
    { playerId: 'bot-1', name: 'Đại Phú Hào Kaia', progress: { level: 45, xp: 1250000, homeTier: 4 } },
    { playerId: 'bot-2', name: 'Nông Trại Vui Vẻ', progress: { level: 42, xp: 980000, homeTier: 3 } },
    { playerId: 'bot-3', name: 'Thần Nông Vườn Đào', progress: { level: 39, xp: 820000, homeTier: 3 } },
    { playerId: 'bot-4', name: 'Hải Tặc Hồ Pha Lê', progress: { level: 36, xp: 640000, homeTier: 2 } },
    { playerId: 'bot-5', name: 'Nông Dân Chăm Chỉ', progress: { level: 33, xp: 510000, homeTier: 2 } },
    { playerId: 'bot-6', name: 'Bé Mầm Đáng Yêu', progress: { level: 30, xp: 420000, homeTier: 2 } },
    { playerId: 'bot-7', name: 'Vua Câu Cá Bờ Biển', progress: { level: 28, xp: 350000, homeTier: 1 } },
    { playerId: 'bot-8', name: 'Kẹo Ngọt Marshmallow', progress: { level: 25, xp: 290000, homeTier: 1 } },
    { playerId: 'bot-9', name: 'Gió Mùa Thu', progress: { level: 22, xp: 230000, homeTier: 1 } },
    { playerId: 'bot-10', name: 'Cư Dân Thị Trấn', progress: { level: 20, xp: 180000, homeTier: 1 } },
  ];

  const displayList = leaderboard && leaderboard.length > 0 ? leaderboard : defaultList;

  // Sắp xếp theo tab
  const sortedList = [...displayList].sort((a, b) => {
    if (tab === 'level') return (b.progress?.level || 0) - (a.progress?.level || 0);
    if (tab === 'home') return (b.progress?.homeTier || 0) - (a.progress?.homeTier || 0);
    return (b.progress?.xp || 0) - (a.progress?.xp || 0);
  });

  const getRankBadge = (rank) => {
    if (rank === 0) return { icon: '🥇', class: 'rank-gold', title: 'Hạng 1' };
    if (rank === 1) return { icon: '🥈', class: 'rank-silver', title: 'Hạng 2' };
    if (rank === 2) return { icon: '🥉', class: 'rank-bronze', title: 'Hạng 3' };
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
            <span className="ld-trophy-icon">🏆</span>
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
            🌾 Danh Vọng (XP)
          </button>
          <button
            className={`ld-tab-btn ${tab === 'level' ? 'active' : ''}`}
            onClick={() => setTab('level')}
          >
            ⭐ Cấp Độ (Level)
          </button>
          <button
            className={`ld-tab-btn ${tab === 'home' ? 'active' : ''}`}
            onClick={() => setTab('home')}
          >
            🏡 Dinh Thự (Home)
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
                  {idx === 0 ? '👑' : idx === 1 ? '🌟' : '⭐'}
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
                      title="Thăm vườn"
                    >
                      Thăm vườn
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
            <div className="ld-my-avatar">🧑‍🌾</div>
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
