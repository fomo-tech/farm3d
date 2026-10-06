import { useEffect, useState } from 'react';
import { MAIN_MISSIONS, DAILY_MISSIONS, activeMainMission, missionProgress, normalizeMissions } from '../../shared/missions.js';
import './MissionBoard.css';

export function MissionTracker({ progress, onOpen }) {
  if (!progress?.onboarding?.completed) return null;
  const missions = normalizeMissions(progress.missions, progress.stats);
  const active = activeMainMission(missions);
  if (!active) return null;
  const count = missionProgress(active, progress.stats, missions);
  return <button type="button" className="mission-tracker" onClick={onOpen} aria-label={`Mở nhiệm vụ chính tuyến: ${active.title}, ${count}/${active.goal}`}>
    <span className="mission-tracker-icon">★</span><span><small>CHÍNH TUYẾN</small><strong>{active.title}</strong></span><em>{count}/{active.goal}</em>
  </button>;
}

export function MissionBoard({ progress, legacyQuests, onClaim, onClaimLegacy, connected }) {
  const [tab, setTab] = useState('main');
  const [clock, setClock] = useState(Date.now());
  useEffect(() => { const timer = window.setInterval(() => setClock(Date.now()), 60_000); return () => window.clearInterval(timer); }, []);
  const missions = normalizeMissions(progress.missions, progress.stats);
  const locked = !progress.onboarding?.completed;
  const list = tab === 'main' ? MAIN_MISSIONS : tab === 'daily' ? DAILY_MISSIONS : legacyQuests;
  const claimedCount = tab === 'legacy' ? legacyQuests.filter(mission => progress.claimedQuests?.includes(mission.id)).length : missions[tab].claimed.length;
  const nextReset = Date.parse(`${missions.daily.dayKey}T17:00:00Z`);
  const remainingMinutes = Math.max(0, Math.ceil((nextReset - clock) / 60_000));
  const resetLabel = `${String(Math.floor(remainingMinutes / 60)).padStart(2, '0')}:${String(remainingMinutes % 60).padStart(2, '0')}`;
  const readyCount = list.filter(mission => {
    const claimed = tab === 'legacy' ? progress.claimedQuests?.includes(mission.id) : missions[tab].claimed.includes(mission.id);
    return !claimed && (tab !== 'main' || activeMainMission(missions)?.id === mission.id) &&
      (tab === 'legacy' ? (progress.stats?.[mission.stat] || 0) >= mission.goal : missionProgress(mission, progress.stats, missions, tab) >= mission.goal);
  }).length;
  return <div className={`mission-board mission-board--${tab}`}>
    <nav className="mission-tabs" aria-label="Loại nhiệm vụ">
      {[['main', 'Chính tuyến', '◆'], ['daily', 'Hằng ngày', '◉'], ['legacy', 'Thành tích', '★']].map(([id, label, symbol]) => <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}><span aria-hidden="true">{symbol}</span>{label}</button>)}
    </nav>
    <div className="mission-board-body">
      <div className="mission-summary">
        <div className="mission-summary-mark" aria-hidden="true">{tab === 'main' ? '◆' : tab === 'daily' ? '◉' : '★'}</div>
        <div className="mission-summary-copy">
          <small>{tab === 'main' ? 'HÀNH TRÌNH CỦA BẠN' : tab === 'daily' ? 'MỖI NGÀY MỘT CHÚT' : 'DẤU MỐC ĐÃ ĐẠT'}</small>
          <strong>{tab === 'main' ? 'Chuyện ở Bình Minh' : tab === 'daily' ? 'Việc hôm nay' : 'Bộ sưu tập thành tích'}</strong>
          <span>{tab === 'main' ? 'Hoàn thành từng chặng để khám phá nông trại.' : tab === 'daily' ? `Làm mới sau ${resetLabel} · 00:00 giờ Việt Nam` : 'Thử thách một lần, không đặt lại.'}</span>
        </div>
        <div className="mission-summary-count"><b>{claimedCount}/{list.length}</b><small>ĐÃ NHẬN</small></div>
      </div>
      {locked && tab !== 'legacy' && <p className="mission-locked-note">Hoàn thành hướng dẫn tân thủ để mở phần này.</p>}
      {readyCount > 0 && !locked && <p className="mission-ready-note">{readyCount} phần thưởng đã sẵn sàng — bấm “Nhận” ở nhiệm vụ hoàn thành.</p>}
      <div className="mission-list">
      {list.map((mission, index) => {
        const legacy = tab === 'legacy';
        const current = legacy ? Math.min(mission.goal, progress.stats?.[mission.stat] || 0) : missionProgress(mission, progress.stats, missions, tab);
        const claimed = legacy ? progress.claimedQuests?.includes(mission.id) : missions[tab].claimed.includes(mission.id);
        const gated = tab === 'main' && activeMainMission(missions)?.id !== mission.id && !claimed;
        const ready = !claimed && !gated && current >= mission.goal && (!locked || legacy);
        return <article className={`mission-card${claimed ? ' is-claimed' : ''}${gated ? ' is-gated' : ''}${ready ? ' is-ready' : ''}`} key={mission.id}>
          <div className="mission-card-title"><span className="mission-card-number" aria-hidden="true">{legacy ? '★' : tab === 'main' ? String(index + 1).padStart(2, '0') : '◉'}</span><div><span className="mission-card-state">{claimed ? 'ĐÃ NHẬN THƯỞNG' : gated ? 'CHẶNG TIẾP THEO' : ready ? 'ĐÃ HOÀN THÀNH' : 'ĐANG THỰC HIỆN'}</span><strong>{mission.title}</strong><small>{mission.description || 'Hoàn thành mục tiêu để nhận thưởng.'}</small></div></div>
          <div className="mission-progress-line"><div className="mission-progress" role="progressbar" aria-label={mission.title} aria-valuemin={0} aria-valuemax={mission.goal} aria-valuenow={current}><span style={{ width: `${current / mission.goal * 100}%` }} /></div><b>{current}/{mission.goal}</b></div>
          <div className="mission-card-footer"><div className="mission-rewards"><span className="mission-coin">● <b>{mission.coins}</b> xu</span><span className="mission-xp">✦ <b>{mission.xp}</b> XP</span></div><button type="button" disabled={!connected || locked && !legacy || claimed || gated || current < mission.goal} onClick={() => legacy ? onClaimLegacy(mission) : onClaim(tab, mission)}>{claimed ? 'Đã nhận ✓' : gated ? 'Chưa mở' : current < mission.goal ? 'Đang làm' : 'Nhận thưởng →'}</button></div>
        </article>;
      })}
      </div>
    </div>
  </div>;
}
