import { missionStats, preLandJourney } from '../../shared/preLandJourney.js';
import { missionAvailability } from '../../shared/missionEligibility.js';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { MAIN_MISSIONS, MAIN_CHAPTERS, DAILY_MISSIONS, activeMainMission, missionProgress, normalizeMissions, dailyMissionList } from '../../shared/missions.js';
import {
  Icon3dTrophyCup,
  Icon3dSun,
  Icon3dCrownRibbon,
  Icon3dGoldCoin,
  Icon3dSparkleStar,
  Icon3dCheck,
  Icon3dNoticeBoard,
  Icon3dCompass,
  Icon3dGiftBoxRibbon,
  Icon3dCrown,
} from './icons3d/GameIcons3D.jsx';
import { farmAudio } from '../game/audio/FarmAudioSystem.js';
import './MissionBoard.css';
import './MissionJournal.css';
import {HudIcon} from './icons3d/HudIcon.jsx';

const TABS = {
  main: {
    label: 'Chính tuyến',
    Icon: Icon3dTrophyCup,
    title: 'Hành trình Bình Minh',
    hint: 'Hoàn thành từng chặng để mở câu chuyện mới.',
  },
  daily: {
    label: 'Hằng ngày',
    Icon: Icon3dSun,
    title: 'Nhiệm vụ hôm nay',
    hint: 'Làm nhiệm vụ mỗi ngày, nhận thưởng ngay.',
  },
  legacy: {
    label: 'Thành tích',
    Icon: Icon3dCrownRibbon,
    title: 'Thành tích của bạn',
    hint: 'Những cột mốc đáng nhớ trong thị trấn.',
  },
};

export function MissionTracker({ missionContext = {}, progress, legacyQuests = [], trackedMission, onOpen }) {
  if (!progress?.onboarding?.completed) return null;
  const missions = normalizeMissions(progress.missions, missionStats(progress), Date.now(), {...missionContext,hasLand:progress.unlockedPlots > 0, progress});
  const pinnedList = trackedMission?.kind === 'daily' ? dailyMissionList(missions) : trackedMission?.kind === 'legacy' ? legacyQuests : MAIN_MISSIONS;
  const pinned = pinnedList?.find(mission => mission.id === trackedMission?.id);
  const pinnedClaimed = pinned && (trackedMission.kind === 'legacy' ? progress.claimedQuests?.includes(pinned.id) : missions[trackedMission.kind]?.claimed?.includes(pinned.id));
  const active = pinned && !pinnedClaimed && (trackedMission.kind !== 'main' || activeMainMission(missions)?.id === pinned.id)
    ? pinned : activeMainMission(missions) || dailyMissionList(missions).find(mission => !missions.daily.claimed.includes(mission.id));
  if (!active) return <button type="button" className="mission-tracker pt-candy-mission-pill" onClick={() => onOpen('main')} aria-label="Mở sổ nhiệm vụ, đã hoàn thành nhiệm vụ hiện có">
    <div className="pt-tracker-avatar-circle tag-main"><Icon3dTrophyCup size={24} /></div>
    <div className="pt-tracker-body"><div className="pt-tracker-badge-row"><span className="pt-tracker-tag tag-main">NHIỆM VỤ</span><span className="pt-tracker-count">HOÀN TẤT</span></div><strong className="pt-tracker-title">Đã xong nhiệm vụ hiện có</strong></div>
    <span className="pt-tracker-arrow" aria-hidden="true">›</span>
  </button>;

  const kind = pinned && active === pinned ? trackedMission.kind : MAIN_MISSIONS.includes(active) ? 'main' : 'daily';
  const count = kind === 'legacy' ? Math.min(active.goal, progress.stats?.[active.stat] || 0) : missionProgress(active, missionStats(progress), missions, kind);
  const ready = count >= active.goal && (kind === 'legacy' || !missionAvailability(active, progress, missionContext));

  const TrackerIcon = kind === 'daily' ? Icon3dSun : kind === 'legacy' ? Icon3dCrownRibbon : Icon3dTrophyCup;
  const kindLabel = kind === 'daily' ? 'HẰNG NGÀY' : kind === 'legacy' ? 'THÀNH TÍCH' : 'CHÍNH TUYẾN';
  const pct = active.goal ? Math.min(100, (count / active.goal) * 100) : 0;

  return (
    <button
      type="button"
      className={`mission-tracker pt-candy-mission-pill${ready ? ' is-ready' : ''}`}
      onClick={() => onOpen(kind)}
      aria-label={`Mở nhiệm vụ ${kindLabel}: ${active.title}, ${count}/${active.goal}${ready ? ', đã hoàn thành, có thể nhận thưởng' : ''}`}
    >
      <div className={`pt-tracker-avatar-circle tag-${kind}`}>
        <TrackerIcon size={24} />
      </div>
      <div className="pt-tracker-body">
        <div className="pt-tracker-badge-row">
          <span className={`pt-tracker-tag tag-${kind}`}>{kindLabel}</span>
          <span className="pt-tracker-count">{count}/{active.goal}</span>
        </div>
        <strong className="pt-tracker-title">{active.title}</strong>
        <div className="pt-tracker-jelly-track" aria-hidden="true">
          <div className="pt-tracker-jelly-fill" style={{ width: `${pct}%` }}>
            <div className="pt-tracker-jelly-sheen" />
          </div>
        </div>
      </div>
      {ready ? (
        <span className="pt-tracker-claim-bubble">
          <Icon3dGiftBoxRibbon size={18} />
          <small>NHẬN</small>
        </span>
      ) : (
        <span className="pt-tracker-arrow" aria-hidden="true">›</span>
      )}
    </button>
  );
}

export function MissionBoard({ missionContext = {}, progress, legacyQuests = [], onClaim, onClaimLegacy, onNavigate, onTrack, onClose, trackedMission, connected, rewardEvent, initialTab = 'main' }) {
  const [tab, setTab] = useState(TABS[initialTab]?initialTab:'main');
  const panel=useRef(null),close=useRef(onClose);close.current=onClose;
  useEffect(()=>{const previous=document.activeElement;panel.current?.querySelector('button')?.focus();const keys=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close.current?.();}if(e.key==='Tab'){const buttons=[...panel.current.querySelectorAll('button:not(:disabled)')].filter(b=>b.getClientRects().length);const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};document.addEventListener('keydown',keys,true);return()=>{document.removeEventListener('keydown',keys,true);if(previous?.isConnected)previous.focus();};},[]);
  const [chapter, setChapter] = useState(() => {
    const next = MAIN_MISSIONS.findIndex(mission => !progress.missions?.main?.claimed?.includes(mission.id));
    return next < 0 ? MAIN_CHAPTERS.length - 1 : Math.floor(next / 3);
  });
  const [clock, setClock] = useState(Date.now());
  const [celebration, setCelebration] = useState(null);
  const [flyingParticles, setFlyingParticles] = useState([]);
  const seenRewardSequence = useRef(rewardEvent?.sequence ?? 0);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!rewardEvent || rewardEvent.sequence <= seenRewardSequence.current) return undefined;
    seenRewardSequence.current = rewardEvent.sequence;
    setCelebration(rewardEvent);
    farmAudio?.playCoins?.();
    const timer = window.setTimeout(() => setCelebration(null), 1800);
    return () => window.clearTimeout(timer);
  }, [rewardEvent]);

  const stats = useMemo(() => missionStats(progress), [progress]);
  const missions = normalizeMissions(progress.missions, stats, clock, {...missionContext,hasLand:progress.unlockedPlots > 0, progress});
  const locked = tab === 'main' && !progress.onboarding?.completed;
  const list = tab === 'main' ? MAIN_MISSIONS : tab === 'daily' ? dailyMissionList(missions) : legacyQuests;
  const claimedCount = tab === 'legacy' ? legacyQuests.filter(mission => progress.claimedQuests?.includes(mission.id)).length : missions[tab].claimed.length;
  const nextReset = Date.parse(`${missions.daily.dayKey}T17:00:00Z`);
  const remainingMinutes = Math.max(0, Math.ceil((nextReset - clock) / 60_000));
  const resetLabel = `${String(Math.floor(remainingMinutes / 60)).padStart(2, '0')}:${String(remainingMinutes % 60).padStart(2, '0')}`;
  const activeId = activeMainMission(missions)?.id;
  const activeIndex = MAIN_MISSIONS.findIndex(mission => mission.id === activeId);

  useEffect(() => {
    if (activeIndex >= 0) setChapter(Math.floor(activeIndex / 3));
  }, [activeIndex]);

  const readyCount = list.filter(mission => {
    const claimed = tab === 'legacy' ? progress.claimedQuests?.includes(mission.id) : missions[tab].claimed.includes(mission.id);
    return !claimed && (tab === 'legacy' || !missionAvailability(mission, progress, missionContext)) && (tab !== 'main' || activeId === mission.id) &&
      (tab === 'legacy' ? (progress.stats?.[mission.stat] || 0) >= mission.goal : missionProgress(mission, stats, missions, tab) >= mission.goal);
  }).length;

  const rewardCounts = Object.fromEntries(Object.keys(TABS).map(kind=>[kind,(kind==='main'?MAIN_MISSIONS:kind==='daily'?dailyMissionList(missions):legacyQuests).filter(m=>{
    const claimed=kind==='legacy'?progress.claimedQuests?.includes(m.id):missions[kind].claimed.includes(m.id);
    return !claimed && (kind!=='main'||(progress.onboarding?.completed&&activeId===m.id)) && (kind==='legacy'||!missionAvailability(m,progress,missionContext)) && (kind==='legacy'?(progress.stats?.[m.stat]||0):missionProgress(m,stats,missions,kind))>=m.goal;
  }).length]));
  const info = TABS[tab];
  const CurrentTabIcon = info.Icon;

  // Chapter progress statistics for Adventure Stepper
  const chapterMissions = MAIN_MISSIONS.slice(chapter * 3, chapter * 3 + 3);
  const chapterClaimedCount = chapterMissions.filter(m => missions.main.claimed.includes(m.id)).length;
  const chapterIsAllClaimed = chapterClaimedCount === 3;

  // Trigger interactive flying coins & audio on claim
  const handleClaimWithJuice = (mission, isLegacy = false, event = null) => {
    farmAudio?.playCoins?.();

    // Spawn 8 flying reward particles radiating outward
    const clientX = event?.clientX || window.innerWidth / 2;
    const clientY = event?.clientY || window.innerHeight / 2;
    const particles = Array.from({ length: 8 }).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      startX: clientX + (Math.random() * 20 - 10),
      startY: clientY + (Math.random() * 20 - 10),
      driftX: (Math.random() - 0.5) * 140,
      driftY: -80 - Math.random() * 110,
      type: i % 2 === 0 ? 'coin' : 'xp',
      delay: i * 45,
    }));
    setFlyingParticles(prev => [...prev, ...particles]);
    setTimeout(() => {
      setFlyingParticles(prev => prev.filter(p => !particles.some(np => np.id === p.id)));
    }, 1100);

    if (isLegacy) onClaimLegacy(mission);
    else onClaim(tab, mission);
  };

  return (
    <div className="mission-journal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose?.();}}><section ref={panel} className="mission-journal" role="dialog" aria-modal="true" aria-labelledby="mission-journal-title"><header className="mission-journal-header"><span className="mission-journal-logo"><HudIcon asset="quest" size={52}/></span><div><small>HÀNH TRÌNH NÔNG DÂN BÌNH MINH</small><h2 id="mission-journal-title">Sổ nhiệm vụ</h2></div><div className="mission-journal-wallet"><HudIcon asset="coin" size={27}/><b>{(progress.coins||0).toLocaleString('vi-VN')}</b></div><button aria-label="Đóng sổ nhiệm vụ" onClick={onClose}>×</button></header><div className={`mission-board mission-board--${tab}`}>

      {/* Interactive Floating Reward Particles */}
      {flyingParticles.map(p => (
        <div
          key={p.id}
          className={`pt-flying-particle pt-particle-${p.type}`}
          style={{
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            '--drift-x': `${p.driftX}px`,
            '--drift-y': `${p.driftY}px`,
            animationDelay: `${p.delay}ms`,
          }}
        >
          {p.type === 'coin' ? <Icon3dGoldCoin size={20} /> : <Icon3dSparkleStar size={18} />}
        </div>
      ))}

      {/* Main Tabs Navigation */}
      <nav className="mission-tabs" aria-label="Loại nhiệm vụ">
        {Object.entries(TABS).map(([id, item]) => {
          const TabIcon = item.Icon;
          return (
            <button
              key={id}
              type="button"
              className={`mission-tab-btn ${tab === id ? 'is-active' : ''}`}
              aria-current={tab === id ? 'page' : undefined}
              onClick={() => {
                farmAudio?.playPop?.();
                setTab(id);
              }}
            >
              <HudIcon asset={id==='main'?'quest':id==='daily'?'basket':'quest'} size={26} className="mission-tab-icon" />
              <span>{item.label}</span>{rewardCounts[id]>0&&<b className="mission-tab-ready" aria-label={`${rewardCounts[id]} phần thưởng có thể nhận`}>{rewardCounts[id]}</b>}
            </button>
          );
        })}
      </nav>

      <div className="mission-board-body">
        {!connected&&<p className="mission-journal-offline" role="status">Chưa có kết nối. Bạn vẫn có thể xem tiến độ nhiệm vụ.</p>}
        <div className="mission-summary" key={tab}>
            <div className="mission-summary-top">
              <span className="mission-summary-emblem" aria-hidden="true">
                <HudIcon asset="quest" size={37}/>
              </span>
              <div className="mission-summary-copy">
                <strong>{info.title}</strong>
                <span>{info.hint}</span>
              </div>
              <div className={`mission-summary-count${celebration?.kind === tab ? ' is-celebrating' : ''}`}>
                <b>{claimedCount}<i>/{list.length}</i></b>
                <small>ĐÃ NHẬN</small>
              </div>
            </div>
            <div className="mission-summary-progress" role="progressbar" aria-label="Nhiệm vụ đã nhận thưởng" aria-valuemin={0} aria-valuemax={list.length} aria-valuenow={claimedCount}>
              <span style={{ width: `${list.length ? (claimedCount / list.length) * 100 : 0}%` }} />
            </div>
            <div className="mission-summary-bottom">
              <span>{tab === 'daily' ? `Làm mới sau ${resetLabel}` : `${Math.max(0, list.length - claimedCount)} nhiệm vụ còn lại`}</span>
              <span>{tab === 'daily' ? '00:00 giờ Việt Nam' : `${Math.round(list.length ? (claimedCount / list.length) * 100 : 0)}% hoàn thành`}</span>
            </div>
        </div>

        {tab === 'main' && !(progress.unlockedPlots > 0) && <div className="mission-onboarding-gate"><div><strong>{preLandJourney(progress).title}</strong><p>{preLandJourney(progress).description}</p><p>Chuẩn bị cần → câu cá → bán cá → chọn lô đất. Các mốc hướng dẫn không cộng thêm xu.</p><button type="button" onClick={onClose}>Tiếp tục hướng dẫn →</button></div></div>}
        {locked && tab !== 'legacy' && (
          <div className="mission-onboarding-gate">
            <span className="mission-onboarding-gate-mark" aria-hidden="true">
              <HudIcon asset="quest" size={48}/>
            </span>
            <div>
              <span className="mission-onboarding-gate-status">CHƯA MỞ NHIỆM VỤ</span>
              <strong>Tiếp tục hành trình tân thủ</strong>
              <p>Danh sách nhiệm vụ vẫn ở bên dưới. Hoàn thành hướng dẫn để bắt đầu nhận thưởng.</p>
              <button type="button" onClick={onClose}>Quay lại thế giới →</button>
            </div>
          </div>
        )}

        {readyCount > 0 && (!locked || tab === 'legacy') && (
          <p className="mission-ready-note">
            <Icon3dSparkleStar size={16} />
            <span>{readyCount} phần thưởng đang chờ bạn nhận!</span>
          </p>
        )}

        {/* PHASE 3: PLAY TOGETHER CHAPTER ADVENTURE STEPPER & TREASURE CHEST */}
        {tab === 'main' && (
          <section className="pt-chapter-adventure-strip">
            <div className="pt-chapter-stepper-head">
              <span className="pt-stepper-title">Hành Trình Khám Phá Thị Trấn</span>
              <div className="pt-chapter-chest-card">
                <div className={`pt-chest-icon-bubble${chapterIsAllClaimed ? ' is-unlocked' : ''}`}>
                  {chapterIsAllClaimed ? <Icon3dCrown size={22} /> : <Icon3dGiftBoxRibbon size={24} />}
                </div>
                <div className="pt-chest-info">
                  <b>{chapterIsAllClaimed ? 'Đã hoàn tất chương!' : `Tiến độ chương (${chapterClaimedCount}/3)`}</b>
                  <small>{chapterIsAllClaimed ? 'Đã nhận thưởng từng nhiệm vụ' : 'Nhận thưởng của 3 nhiệm vụ trong chương'}</small>
                </div>
              </div>
            </div>

            <nav className="mission-chapter-nav pt-milestone-stepper" aria-label="Chọn chương chính tuyến">
              {MAIN_CHAPTERS.map((name, index) => {
                const subMissions = MAIN_MISSIONS.slice(index * 3, index * 3 + 3);
                const subClaimed = subMissions.filter(m => missions.main.claimed.includes(m.id)).length;
                const completed = subClaimed === 3;
                const isSelected = chapter === index;

                return (
                  <button
                    key={name}
                    type="button"
                    className={`pt-step-node${isSelected ? ' is-selected' : ''}${completed ? ' is-completed' : ''}`}
                    aria-current={isSelected ? 'page' : undefined}
                    onClick={() => {
                      farmAudio?.playPop?.();
                      setChapter(index);
                    }}
                  >
                    <div className="pt-step-marker">
                      {completed ? <Icon3dCheck size={14} /> : <span>{index + 1}</span>}
                    </div>
                    <div className="pt-step-desc">
                      <strong>{name}</strong>
                      <small>{subClaimed}/3</small>
                    </div>
                  </button>
                );
              })}
            </nav>
          </section>
        )}

        <div className="mission-list" aria-label={info.label} key={`${tab}-${chapter}`}>
            {list.map((mission, index) => {
              if (tab === 'main' && Math.floor(index / 3) !== chapter) return null;
              const legacy = tab === 'legacy';
              const current = legacy ? Math.min(mission.goal, progress.stats?.[mission.stat] || 0) : missionProgress(mission, stats, missions, tab);
              const claimed = legacy ? progress.claimedQuests?.includes(mission.id) : missions[tab].claimed.includes(mission.id);
              const gated = tab === 'main' && activeId !== mission.id && !claimed;
              const onboardingGated = locked && !legacy && !claimed;
              const unavailable = legacy ? null : missionAvailability(mission, progress, missionContext);
              const ready = !claimed && !gated && !unavailable && current >= mission.goal && (!locked || legacy);
              const disabled = !connected || Boolean(unavailable) || onboardingGated || claimed || gated || (!ready && !onNavigate);
              const state = claimed ? 'ĐÃ NHẬN' : unavailable ? 'CHƯA MỞ' : onboardingGated ? 'CHƯA MỞ' : gated ? 'CHẶNG TIẾP' : ready ? 'HOÀN THÀNH' : 'ĐANG LÀM';
              const actionLabel = ['planted', 'watered', 'harvested'].includes(mission.stat) ? 'Đến ruộng' : mission.stat === 'landTiles' ? 'Khai hoang đất' : mission.stat === 'fishCaught' ? 'Đến hồ câu' : mission.stat === 'fishSold' ? 'Đến tiệm cá' : mission.stat === 'orders' ? 'Đến đơn hàng' : mission.stat === 'animalsFed' ? 'Đến vật nuôi' : mission.stat === 'crafted' ? 'Đến xưởng' : 'Đi làm';

              return (
                <Fragment key={mission.id}>
                  {tab === 'main' && index % 3 === 0 && (
                    <div className="mission-chapter">
                      <span>CHƯƠNG {chapter + 1}</span>
                      <strong>{MAIN_CHAPTERS[chapter]}</strong>
                    </div>
                  )}
                  <article
                    className={`mission-card${claimed ? ' is-claimed' : ''}${gated || onboardingGated ? ' is-gated' : ''}${ready ? ' is-ready' : ''}${celebration?.id === mission.id ? ' just-claimed' : ''}`}
                    style={{ '--mission-order': index % 3 }}
                  >
                    <div className="mission-card-number" aria-hidden="true">
                      {legacy ? (
                        <Icon3dCrownRibbon size={18} />
                      ) : tab === 'daily' ? (
                        <Icon3dSun size={18} />
                      ) : (
                        <span>{String(index + 1).padStart(2, '0')}</span>
                      )}
                    </div>
                    <div className="mission-card-content">
                      <div className="mission-card-heading">
                        <strong>{mission.title}</strong>
                        <span className={`mission-card-state state-${state.toLowerCase().replace(/\s+/g, '-')}`}>{state}</span>
                        {!claimed && !gated && !onboardingGated && onTrack && (
                          <button
                            type="button"
                            className="mission-pin"
                            aria-label={`${trackedMission?.kind === tab && trackedMission.id === mission.id ? 'Bỏ theo dõi' : 'Theo dõi'} ${mission.title}`}
                            aria-pressed={trackedMission?.kind === tab && trackedMission.id === mission.id}
                            onClick={() => {
                              farmAudio?.playPop?.();
                              onTrack(tab, mission.id);
                            }}
                            title="Theo dõi trên HUD"
                          >
                            <HudIcon asset="map" size={20}/>
                          </button>
                        )}
                      </div>
                      <small>{unavailable || mission.description || 'Hoàn thành mục tiêu để nhận thưởng.'}</small>
                      <div className="mission-progress-line">
                        <div className="mission-progress" role="progressbar" aria-label={mission.title} aria-valuemin={0} aria-valuemax={mission.goal} aria-valuenow={current}>
                          <span style={{ width: `${mission.goal ? Math.min(100, (current / mission.goal) * 100) : 0}%` }} />
                        </div>
                        <b>{current}/{mission.goal}</b>
                      </div>
                    </div>
                    <div className="mission-card-reward">
                      <span className="mission-coin-badge" title={`${mission.coins} xu vàng`}>
                        <HudIcon asset="coin" size={22}/>
                        <b>{mission.coins}</b>
                      </span>
                      <span className="mission-xp-badge" title={`${mission.xp} điểm kinh nghiệm`}>
                        <Icon3dSparkleStar size={16} />
                        <b>{mission.xp} XP</b>
                      </span>
                    </div>
                    <button
                      type="button"
                      className="mission-claim"
                      disabled={disabled}
                      onClick={e => {
                        if (ready) {
                          handleClaimWithJuice(mission, legacy, e);
                        } else {
                          farmAudio?.playPop?.();
                          onNavigate?.(mission);
                        }
                      }}
                    >
                      {claimed ? (
                        <><Icon3dCheck size={16} /> Đã nhận</>
                      ) : onboardingGated || gated ? (
                        'Chưa mở'
                      ) : ready ? (
                        <><HudIcon asset="basket" size={23}/> Nhận thưởng</>
                      ) : (
                        `${actionLabel} →`
                      )}
                    </button>
                  </article>
                </Fragment>
              );
            })}
        </div>
      </div>

      {/* PHASE 4: CELEBRATION MODAL WITH SUNBURST RAYS & SPARKLING CONFETTI */}
      {celebration && (
        <div className="mission-reward-burst" key={celebration.sequence} role="status" aria-live="polite">
          <div className="pt-burst-sunburst" aria-hidden="true" />
          <div className="mission-reward-burst-icon">
            <Icon3dGiftBoxRibbon size={40} />
          </div>
          <strong>Hoàn Thành Xuất Sắc!</strong>
          <span>{celebration.title}</span>
          <div className="mission-reward-burst-items">
            <span className="burst-coin">
              <Icon3dGoldCoin size={20} />
              <b>+{celebration.coins} xu</b>
            </span>
            <span className="burst-xp">
              <Icon3dSparkleStar size={18} />
              <b>+{celebration.xp} XP</b>
            </span>
          </div>
        </div>
      )}
    </div><footer className="mission-journal-footer"><span>{readyCount>0?`${readyCount} phần thưởng đang chờ nhận`:'Theo dõi nhiệm vụ để xem tiến độ trên HUD'}</span><button onClick={onClose}>Tiếp tục khám phá</button></footer></section></div>
  );
}
