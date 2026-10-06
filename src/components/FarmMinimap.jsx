import React, { useEffect, useState, useMemo } from 'react';
import { zoneAtPosition } from '../game/world/worldLayout.js';
import { WORLD_VILLAGES } from '../../shared/villageLayout.js';
import { farmAudio } from '../game/audio/FarmAudioSystem.js';
import { Icon3dMap } from './icons3d/GameIcons3D.jsx';
import './FarmMinimap.css';

// Key Landmarks across Vibe City (Play Together Theme)
const POIS = [
  { id: 'plaza', label: 'Quảng Trường', x: 0, z: 18, color: '#f59e0b', symbol: 'P', icon: '🏛️' },
  { id: 'lake', label: 'Hồ Pha Lê', x: 126, z: 2, color: '#0ea5e9', symbol: '🎣', icon: '🎣' },
  { id: 'fashion', label: 'Thời Trang', x: 29, z: -25, color: '#ec4899', symbol: '👗', icon: '👗' },
  { id: 'casino', label: 'Hội Quán', x: -29, z: -25, color: '#8b5cf6', symbol: '🎲', icon: '🎲' },
  { id: 'supplies', label: 'Chợ Nông Sản', x: 29, z: 25, color: '#10b981', symbol: '🛒', icon: '🛒' },
  { id: 'elder', label: 'Trưởng Làng', x: -7.4, z: 76, color: '#14b8a6', symbol: '🏡', icon: '🏡' },
  { id: 'pen', label: 'Khu Nuôi Bò', x: 88, z: 112, color: '#d97706', symbol: '🐮', icon: '🐮' },
  { id: 'beach', label: 'Biển Bình Minh', x: 0, z: 320, color: '#06b6d4', symbol: '🏖️', icon: '🏖️' },
];

export function FarmMinimap({ worldRef, farmTarget, onOpenMap }) {
  const [position, setPosition] = useState({ x: 0, z: 0, yaw: 0 });
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    let animId;
    let frame = 0;
    const update = () => {
      frame++;
      // Sample 20 FPS (every 3 frames) for silky smooth tracking with 0 lag
      if (frame % 3 === 0 && worldRef.current) {
        const state = worldRef.current.getPlayerState?.();
        if (state && Number.isFinite(state.x) && Number.isFinite(state.z)) {
          const yaw = worldRef.current.player?.root?.rotation?.y ?? state.rotation ?? state.yaw ?? 0;
          setPosition({ x: state.x, z: state.z, yaw });
        }
      }
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [worldRef]);

  const px = position.x;
  const pz = position.z;
  const yaw = position.yaw;
  const yawDeg = (yaw * 180) / Math.PI;

  // Scale: 1 meter = 0.22px inside viewBox 0 0 100 100 (center 50,50)
  // Outer glass radius = 43px (covers ~185 meters)
  const SCALE = 0.22;
  const CLAMP_RADIUS = 39;

  const projectPoint = (wx, wz) => {
    const dx = (wx - px) * SCALE;
    const dy = (wz - pz) * SCALE;
    const dist = Math.hypot(dx, dy);
    if (dist <= CLAMP_RADIUS) {
      return { x: 50 + dx, y: 50 + dy, isClamped: false, distWorld: Math.round(Math.hypot(wx - px, wz - pz)) };
    }
    const ratio = CLAMP_RADIUS / dist;
    return { x: 50 + dx * ratio, y: 50 + dy * ratio, isClamped: true, distWorld: Math.round(Math.hypot(wx - px, wz - pz)) };
  };

  const zoneInfo = zoneAtPosition(px, pz);
  const zoneName = typeof zoneInfo === 'string' ? zoneInfo : zoneInfo?.label || 'Thị Trấn Vibe City';

  const zoneIcon = useMemo(() => {
    if (zoneInfo?.key === 'city') return '⛲';
    if (zoneInfo?.key === 'lake') return '🎣';
    if (zoneInfo?.key === 'beach') return '🏖️';
    if (zoneInfo?.key === 'countryside') return '🌾';
    return '🗺️';
  }, [zoneInfo?.key]);

  // Player's Owned Farm Home Blip
  const homeTarget = farmTarget ? {
    id: 'my-farm',
    label: farmTarget.label || 'Vườn Nhà Bạn',
    x: farmTarget.x,
    z: farmTarget.z,
    color: '#22c55e',
    symbol: '⌂',
    icon: '🏡',
    isHome: true,
  } : null;

  // Include 12 Villages dynamically as nearby POIs
  const villagePOIs = useMemo(() => {
    return WORLD_VILLAGES.map(v => ({
      id: v.id,
      label: v.name,
      x: v.gate.x,
      z: v.gate.z,
      color: '#10b981',
      symbol: '🏡',
      icon: '🏡',
      isVillage: true,
    }));
  }, []);

  const allPOIs = useMemo(() => {
    const list = [...POIS, ...villagePOIs];
    if (homeTarget) list.push(homeTarget);
    return list;
  }, [homeTarget, villagePOIs]);

  // Relative terrain feature positions
  const plazaTerrain = projectPoint(0, 0);
  const lakeTerrain = projectPoint(165, 2);
  const beachTerrainY = 50 + (320 - pz) * SCALE;

  const handleOpenMap = (e) => {
    e.stopPropagation();
    try {
      farmAudio.playPop?.();
    } catch {}
    onOpenMap?.();
  };

  return (
    <aside
      className={`pt-chibi-minimap-root ${minimized ? 'is-minimized' : ''}`}
      aria-label="Radar Bản Đồ Nhỏ Play Together"
    >
      {/* 1. Radar Glass Dial Container */}
      <button
        type="button"
        className="pt-minimap-disc"
        onClick={handleOpenMap}
        aria-label="Mở bản đồ thế giới"
        title="Bấm để mở Bản Đồ Thế Giới (Phím M)"
      >
        {/* Candy Bezel Gloss & Specular Sheen */}
        <div className="pt-minimap-candy-bezel">
          <div className="pt-bezel-highlight" />

          {/* SVG Map Projection Viewport */}
          <svg className="pt-radar-svg" viewBox="0 0 100 100">
            <defs>
              <clipPath id="ptRadarClip">
                <circle cx="50" cy="50" r="43" />
              </clipPath>
              {/* Radial Ambient Grass Gradient */}
              <radialGradient id="ptGrassGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#bbf7d0" />
                <stop offset="65%" stopColor="#86efac" />
                <stop offset="100%" stopColor="#4ade80" />
              </radialGradient>
              {/* Lake Water Shimmer Gradient */}
              <radialGradient id="ptLakeGrad" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="70%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </radialGradient>
              {/* Sweeping Radar Radar Beam */}
              <linearGradient id="ptSweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              {/* Vision Cone Field Gradient (Play Together Radar) */}
              <linearGradient id="ptVisionConeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.5" />
                <stop offset="60%" stopColor="#fde047" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Clipped Terrain Landscape Layer */}
            <g clipPath="url(#ptRadarClip)">
              {/* Lush Green Lawn Ground */}
              <circle cx="50" cy="50" r="45" fill="url(#ptGrassGrad)" />

              {/* Ocean & Beach in the South */}
              {beachTerrainY < 95 && (
                <g>
                  <rect x="-10" y={beachTerrainY} width="120" height="70" fill="#0284c7" />
                  <rect x="-10" y={beachTerrainY - 5} width="120" height="7" fill="#fef08a" />
                  <ellipse cx="50" cy={beachTerrainY + 2} rx="40" ry="3" fill="rgba(255,255,255,0.5)" />
                </g>
              )}

              {/* Main Golden Pathway Network */}
              <line
                x1={plazaTerrain.x}
                y1={plazaTerrain.y}
                x2={plazaTerrain.x}
                y2={plazaTerrain.y + 110}
                stroke="#fed7aa"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <line
                x1={plazaTerrain.x - 70}
                y1={plazaTerrain.y}
                x2={plazaTerrain.x + 70}
                y2={plazaTerrain.y}
                stroke="#fed7aa"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Central Plaza Round Pavement */}
              <circle
                cx={plazaTerrain.x}
                cy={plazaTerrain.y}
                r="13"
                fill="#fef08a"
                stroke="#ffffff"
                strokeWidth="1.6"
              />
              <circle
                cx={plazaTerrain.x}
                cy={plazaTerrain.y}
                r="4.5"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="1"
              />

              {/* Crystal Lake Water Body */}
              <ellipse
                cx={lakeTerrain.x}
                cy={lakeTerrain.y}
                rx="15"
                ry="12"
                fill="url(#ptLakeGrad)"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <ellipse
                cx={lakeTerrain.x - 2}
                cy={lakeTerrain.y - 1}
                rx="8"
                ry="5"
                fill="#bae6fd"
                opacity="0.6"
              />

              {/* Concentric GPS Distance Rings */}
              <circle cx="50" cy="50" r="16" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.45" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.35" />

              {/* Rotating Radar Sweep Beam */}
              <g className="pt-radar-sweep-anim">
                <path d="M50 50 L50 6 A44 44 0 0 1 82 22 Z" fill="url(#ptSweepGrad)" />
              </g>

              {/* Landmark POI Icons */}
              {allPOIs.map(poi => {
                const proj = projectPoint(poi.x, poi.z);
                // Filter out non-clamped distant villages to avoid radar clutter
                if (poi.isVillage && proj.distWorld > 240) return null;

                return (
                  <g
                    key={poi.id}
                    className={`pt-poi-node ${poi.isHome ? 'is-home-poi' : ''}`}
                    transform={`translate(${proj.x}, ${proj.y})`}
                  >
                    {/* Pulsing Aura if Home */}
                    {poi.isHome && (
                      <circle cx="0" cy="0" r="8" fill="#22c55e" opacity="0.35" className="pt-home-beacon-pulse" />
                    )}
                    {/* Clamped Edge Arrow Pointer */}
                    {proj.isClamped && (
                      <polygon
                        points="0,-6 4,-1 -4,-1"
                        fill={poi.color}
                        transform={`rotate(${Math.atan2(proj.y - 50, proj.x - 50) * 180 / Math.PI + 90})`}
                      />
                    )}
                    {/* Blip Circle */}
                    <circle cx="0" cy="0" r="5" fill={poi.color} stroke="#ffffff" strokeWidth="1.2" />
                    <text
                      x="0"
                      y="2.4"
                      textAnchor="middle"
                      fontSize="6"
                      fontWeight="900"
                      fill="#ffffff"
                      fontFamily="Baloo 2, sans-serif"
                    >
                      {poi.symbol}
                    </text>
                  </g>
                );
              })}

              {/* Central Player Beacon Ping */}
              <circle cx="50" cy="50" r="7.5" fill="#38bdf8" opacity="0.28" className="pt-player-beacon-ping" />

              {/* Rotating Player Vision Cone & Direction Arrow (Heading) */}
              <g transform={`rotate(${yawDeg} 50 50)`}>
                {/* Vision Cone (Tầm nhìn phía trước chuẩn Game) */}
                <polygon
                  points="50,50 34,14 66,14"
                  fill="url(#ptVisionConeGrad)"
                />
                {/* Heading Arrow (Mũi tên chỉ hướng Play Together) */}
                <polygon
                  points="50,38 56,53 50,49.5 44,53"
                  fill="#ff6b00"
                  stroke="#ffffff"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </g>

              {/* Cardinal Compass Directions on Bezel */}
              <g transform={`rotate(${-yawDeg} 50 50)`} opacity="0.85">
                <g transform="translate(50, 9)">
                  <circle cx="0" cy="0" r="4.2" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                  <text
                    x="0"
                    y="2.2"
                    textAnchor="middle"
                    fontSize="5"
                    fontWeight="900"
                    fill="#ffffff"
                    fontFamily="Nunito, sans-serif"
                  >
                    N
                  </text>
                </g>
                <text x="50" y="93" textAnchor="middle" fontSize="4.8" fontWeight="900" fill="#64748b" fontFamily="Nunito, sans-serif">S</text>
                <text x="91" y="52" textAnchor="middle" fontSize="4.8" fontWeight="900" fill="#64748b" fontFamily="Nunito, sans-serif">E</text>
                <text x="9" y="52" textAnchor="middle" fontSize="4.8" fontWeight="900" fill="#64748b" fontFamily="Nunito, sans-serif">W</text>
              </g>
            </g>
          </svg>
        </div>
      </button>

      {/* 2. Location Pill Badge (Docked Under Radar) */}
      {!minimized && (
        <button
          type="button"
          className="pt-radar-location-pill"
          onClick={handleOpenMap}
          aria-label={`Mở bản đồ: ${zoneName}`}
          title="Bấm để mở Bản Đồ Toàn Cảnh (Phím M)"
        >
          <span className="pt-location-badge-name">{zoneName}</span>
        </button>
      )}
    </aside>
  );
}

export default FarmMinimap;
