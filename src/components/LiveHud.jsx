import { memo, useEffect, useState } from 'react';
import BusTransitHUD from './BusTransitHUD.jsx';
import { CasinoGames } from './CasinoGames.jsx';
import { sameTransitHud } from '../game/rendering/HudRuntime.js';
import { Icon3dDawn, Icon3dSun, Icon3dSunset, Icon3dMoon,
  Icon3dSpring, Icon3dSummer, Icon3dAutumn, Icon3dWinter } from './icons3d/GameIcons3D.jsx';

function useClock() {
  const [clock, setClock] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const timer = setInterval(() => setClock(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);
  return clock;
}
const timeIcons = [Icon3dDawn, Icon3dSun, Icon3dSunset, Icon3dMoon];
const seasonIcons = [Icon3dSpring, Icon3dSummer, Icon3dAutumn, Icon3dWinter];
const seasons = ['Xuân', 'Hạ', 'Thu', 'Đông'];
const clockText = clock => {
  const cycleSeconds = Math.floor(Math.max(0, Number(clock) || 0)) % 240;
  const hour = (Math.floor(cycleSeconds / 10) + 6) % 24;
  const minute = (cycleSeconds % 10) * 6;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

export const GameClock = memo(function GameClock({ compact = false, timeMode = 'auto', onToggleTime = null, currentClock = null }) {
  const internalClock = useClock();
  const clock = currentClock !== null ? currentClock : internalClock;
  const season = Math.floor(clock / 240) % 4;
  if (compact) return <>{clockText(clock)} · {seasons[season]}</>;
  const TimeIcon = timeIcons[Math.floor((clock % 240) / 60)];
  const SeasonIcon = seasonIcons[season];

  const modeBadge = timeMode === 'night' ? <span className="pt-time-tag pt-time-night"><Icon3dMoon size={14} /> Đêm</span>
    : timeMode === 'dusk' ? <span className="pt-time-tag pt-time-dusk"><Icon3dSunset size={14} /> Chiều</span>
    : timeMode === 'day' ? <span className="pt-time-tag pt-time-day"><Icon3dSun size={14} /> Ngày</span>
    : timeMode === 'dawn' ? <span className="pt-time-tag pt-time-dawn"><Icon3dDawn size={14} /> Sáng</span>
    : null;

  return <div
    className={`pt-clock-strip${onToggleTime ? ' is-clickable' : ''}`}
    onClick={onToggleTime || undefined}
    title={onToggleTime ? "Bấm để đổi thời gian" : undefined}
  >
    <span className="pt-clock-icon"><TimeIcon size={24} /></span>
    <span className="pt-clock-time">{clockText(clock)}</span>
    {modeBadge}
    <span className="pt-capsule-dot">·</span>
    <span className="pt-season-icon"><SeasonIcon size={20} /></span>
    <span className="pt-season-name">{seasons[season]}</span>
  </div>;
});

export function LiveCasinoGames(props) {
  return <CasinoGames {...props} now={useClock()} />;
}

export function LiveBusHud({ statusRef, ...props }) {
  const [status, setStatus] = useState(statusRef.current);
  useEffect(() => {
    const timer = setInterval(() => setStatus(previous =>
      sameTransitHud(previous, statusRef.current) ? previous : statusRef.current), 200);
    return () => clearInterval(timer);
  }, [statusRef]);
  return <BusTransitHUD {...props} busTransit={status} cinematicTourActive={status?.cinematicTourActive} />;
}

export function LiveWorldDebug({ worldRef }) {
  const [debug, setDebug] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setDebug(worldRef.current?.getDebugState() || null), 1000);
    return () => clearInterval(timer);
  }, [worldRef]);
  if (!debug || dismissed) return null;
  return (
    <aside className="debug-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <b>WORLD DEBUG · F3</b>
        <button type="button" onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', color: '#8df4a1', cursor: 'pointer', fontSize: 11, padding: '0 2px' }}>✕</button>
      </div>
      <span>FPS {debug.fps}</span>
      <span>POS {debug.x}, {debug.z}</span>
      <span>CHUNK {debug.chunk}</span>
      <span>MESHES {debug.meshes}</span>
      <span>{debug.worldId}</span>
    </aside>
  );
}
