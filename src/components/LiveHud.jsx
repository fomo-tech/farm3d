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
const clockText = clock => `${String(Math.floor((clock % 240) / 10) + 6).padStart(2, '0')}:${String((clock % 10) * 6).padStart(2, '0')}`;

export const GameClock = memo(function GameClock({ compact = false }) {
  const clock = useClock();
  const season = Math.floor(clock / 240) % 4;
  if (compact) return <>{clockText(clock)} · {seasons[season]}</>;
  const TimeIcon = timeIcons[Math.floor((clock % 240) / 60)];
  const SeasonIcon = seasonIcons[season];
  return <div className="pt-clock-strip">
    <span className="pt-clock-icon"><TimeIcon size={24} /></span>
    <span className="pt-clock-time">{clockText(clock)}</span>
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
  useEffect(() => {
    const timer = setInterval(() => setDebug(worldRef.current?.getDebugState() || null), 1000);
    return () => clearInterval(timer);
  }, [worldRef]);
  if (!debug) return null;
  return <aside className="debug-panel"><b>WORLD DEBUG · F3</b><span>FPS {debug.fps}</span>
    <span>POS {debug.x}, {debug.z}</span><span>CHUNK {debug.chunk}</span>
    <span>MESHES {debug.meshes}</span><span>{debug.worldId}</span></aside>;
}
