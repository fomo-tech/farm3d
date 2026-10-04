/**
 * ChibiRadarMinimap.jsx
 * Real-time 360-degree GPS Radar & Compass Widget (Play Together Standard).
 * 
 * Features:
 * - Real-time player yaw orientation & positional tracking (O(1) sampling).
 * - Key landmark POI indicators (Crystal Lake, Fishing Wharf, Plaza, Shops, Farm, Beach).
 * - Smooth rotating needle & north compass cardinal.
 * - Tactile candy circular frame with tap-to-open World Map.
 */

import { useEffect, useRef, useState } from 'react';
import { Icon3dMap } from './icons3d/GameIcons3D.jsx';

const LANDMARKS = [
  { id: 'plaza', name: 'Quảng Trường', x: 0, z: 0, color: '#f59e0b', icon: '⛲' },
  { id: 'lake', name: 'Hồ Pha Lê', x: 167, z: 2, color: '#0ea5e9', icon: '🎣' },
  { id: 'fashion', name: 'Thời Trang', x: 29, z: -25, color: '#ec4899', icon: '👗' },
  { id: 'casino', name: 'Hội Quán', x: -29, z: -25, color: '#8b5cf6', icon: '🎰' },
  { id: 'supplies', name: 'Nông Cụ', x: 29, z: 25, color: '#10b981', icon: '🛒' },
  { id: 'beach', name: 'Bờ Biển', x: 0, z: 360, color: '#06b6d4', icon: '🏖️' },
];

export function ChibiRadarMinimap({ worldRef, playerFarmTarget, onOpenMap }) {
  const [playerCoord, setPlayerCoord] = useState({ x: 0, z: 0, yaw: 0 });
  const [collapsed, setCollapsed] = useState(false);
  const frameRef = useRef(0);

  useEffect(() => {
    let animId;
    const update = () => {
      frameRef.current += 1;
      // Sample at 15 FPS for silky smooth radar with 0 CPU overhead
      if (frameRef.current % 4 === 0 && worldRef.current) {
        const state = worldRef.current.getPlayerState?.();
        if (state && Number.isFinite(state.x) && Number.isFinite(state.z)) {
          setPlayerCoord({
            x: Math.round(state.x),
            z: Math.round(state.z),
            yaw: state.yaw || 0,
          });
        }
      }
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [worldRef]);

  // Radar display radius in world meters
  const radarRange = 180;
  const radarPxRadius = 38; // 76px inner area

  return (
    <div
      className={`pt-radar-minimap ${collapsed ? 'is-collapsed' : ''}`}
      onClick={onOpenMap}
      title="Bấm để mở Bản Đồ Toàn Cảnh (Phím M)"
      role="button"
      tabIndex={0}
      aria-label="Radar bản đồ nhỏ"
    >
      <div className="pt-radar-outer-ring">
        <div className="pt-radar-glass">
          {/* North Indicator */}
          <div
            className="pt-radar-north"
            style={{
              transform: `rotate(${-playerCoord.yaw}rad) translateY(-36px)`,
            }}
          >
            <span>N</span>
          </div>

          {/* Radar Sweep Animation Ring */}
          <div className="pt-radar-sweep" />

          {/* Landmarks within radar radius */}
          {LANDMARKS.map(lm => {
            const dx = lm.x - playerCoord.x;
            const dz = lm.z - playerCoord.z;
            const dist = Math.hypot(dx, dz);
            if (dist > radarRange) return null;

            // Rotate relative to player heading
            const angle = Math.atan2(dx, dz) - playerCoord.yaw;
            const rNorm = Math.min(1.0, dist / radarRange);
            const px = Math.sin(angle) * rNorm * radarPxRadius;
            const py = -Math.cos(angle) * rNorm * radarPxRadius;

            return (
              <div
                key={lm.id}
                className="pt-radar-blip"
                style={{
                  transform: `translate(${px}px, ${py}px)`,
                  backgroundColor: lm.color,
                }}
                title={lm.name}
              >
                <span className="pt-blip-emoji">{lm.icon}</span>
              </div>
            );
          })}

          {/* Player Farm Home Waypoint */}
          {playerFarmTarget && (() => {
            const dx = playerFarmTarget.x - playerCoord.x;
            const dz = playerFarmTarget.z - playerCoord.z;
            const dist = Math.hypot(dx, dz);
            const angle = Math.atan2(dx, dz) - playerCoord.yaw;
            const rNorm = Math.min(1.0, dist / radarRange);
            const px = Math.sin(angle) * rNorm * radarPxRadius;
            const py = -Math.cos(angle) * rNorm * radarPxRadius;

            return (
              <div
                className="pt-radar-blip pt-farm-home-blip"
                style={{ transform: `translate(${px}px, ${py}px)` }}
                title="Vườn Nhà Bạn"
              >
                <span className="pt-blip-emoji">🏡</span>
              </div>
            );
          })()}

          {/* Central Player Heading Arrow */}
          <div className="pt-radar-player-arrow">
            <span className="pt-arrow-cone" />
          </div>
        </div>

        {/* Outer Candy Bezel Details */}
        <div className="pt-radar-bezel-tag">
          <Icon3dMap size={14} />
          <span>BẢN ĐỒ</span>
        </div>
      </div>
    </div>
  );
}

export default ChibiRadarMinimap;
