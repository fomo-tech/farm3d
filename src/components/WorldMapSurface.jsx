import React from 'react';
import { WORLD_VILLAGES } from '../../shared/villageLayout.js';

// Dedicated pure vector SVG emblems for all 12 villages & key landmarks (100% NO EMOJI)
const VILLAGE_EMBLEMS = {
  'binh-minh': {
    name: 'Bình Minh',
    color: '#f59e0b',
    bg: '#fef3c7',
    iconBg: '#f59e0b',
    icon: (
      // Golden Sun / Wheat Spike Emblem
      <g>
        <circle cx="0" cy="0" r="4.5" fill="#ffffff" />
        <path d="M-6 0 L-8 0 M6 0 L8 0 M0 -6 L0 -8 M0 6 L0 8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    ),
  },
  'hoa-mai': {
    name: 'Hoa Mai',
    color: '#ec4899',
    bg: '#fce7f3',
    iconBg: '#ec4899',
    icon: (
      // 5-Petal Apricot / Cherry Blossom Emblem
      <g>
        <circle cx="0" cy="-3.5" r="2.8" fill="#ffffff" />
        <circle cx="3.3" cy="-1.1" r="2.8" fill="#ffffff" />
        <circle cx="2.1" cy="3" r="2.8" fill="#ffffff" />
        <circle cx="-2.1" cy="3" r="2.8" fill="#ffffff" />
        <circle cx="-3.3" cy="-1.1" r="2.8" fill="#ffffff" />
        <circle cx="0" cy="0" r="2.2" fill="#fbbf24" />
      </g>
    ),
  },
  'ven-song': {
    name: 'Ven Sông',
    color: '#06b6d4',
    bg: '#cffafe',
    iconBg: '#06b6d4',
    icon: (
      // River Wave & Boat Emblem
      <g>
        <path d="M-5 1 L5 1 L3 4.5 L-3 4.5 Z" fill="#ffffff" />
        <path d="M0 -4 L0 1" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
        <polygon points="0,-4 4,-1 0,-1" fill="#ffffff" />
        <path d="M-6 6 Q0 4.5 6 6" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  'doi-gio': {
    name: 'Đồi Gió',
    color: '#8b5cf6',
    bg: '#ede9fe',
    iconBg: '#8b5cf6',
    icon: (
      // Dutch Windmill Cross Blades Emblem
      <g>
        <circle cx="0" cy="0" r="2" fill="#ffffff" />
        <line x1="-5.5" y1="0" x2="5.5" y2="0" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="0" y1="-5.5" x2="0" y2="5.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    ),
  },
  'an-nhien-005': {
    name: 'An Nhiên',
    color: '#10b981',
    bg: '#d1fae5',
    iconBg: '#10b981',
    icon: (
      // Zen Bamboo Stalks Emblem
      <g>
        <rect x="-4" y="-5" width="2" height="10" rx="0.8" fill="#ffffff" />
        <rect x="1" y="-6" width="2.2" height="12" rx="0.8" fill="#ffffff" />
        <line x1="-5" y1="-1" x2="-1" y2="-1" stroke="#10b981" strokeWidth="0.8" />
        <line x1="0.5" y1="0" x2="3.5" y2="0" stroke="#10b981" strokeWidth="0.8" />
      </g>
    ),
  },
  'moc-lan-006': {
    name: 'Mộc Lan',
    color: '#f97316',
    bg: '#ffedd5',
    iconBg: '#f97316',
    icon: (
      // Magnolia Blossom / Torii Gate Emblem
      <g>
        <path d="M-5 -2 Q0 -6 5 -2" stroke="#ffffff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <line x1="-3" y1="-2" x2="-3" y2="5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="3" y1="-2" x2="3" y2="5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="0" cy="0" r="1.8" fill="#fef08a" />
      </g>
    ),
  },
  'thanh-ha-007': {
    name: 'Thanh Hà',
    color: '#eab308',
    bg: '#fef9c3',
    iconBg: '#eab308',
    icon: (
      // Terracotta Clay Vase / Artisan Emblem
      <g>
        <ellipse cx="0" cy="1" rx="4.5" ry="4" fill="#ffffff" />
        <rect x="-2" y="-5" width="4" height="3" rx="0.8" fill="#ffffff" />
        <ellipse cx="0" cy="-5" rx="2.5" ry="0.8" fill="#ffffff" />
        <line x1="-3" y1="1" x2="3" y2="1" stroke="#eab308" strokeWidth="0.8" />
      </g>
    ),
  },
  'phu-dien-008': {
    name: 'Phú Điền',
    color: '#16a34a',
    bg: '#dcfce7',
    iconBg: '#16a34a',
    icon: (
      // Red Barn / Tractor Wheel Emblem
      <g>
        <polygon points="-5,4 5,4 4,-1 -4,-1" fill="#ffffff" />
        <polygon points="-6,-1 0,-6 6,-1" fill="#ffffff" />
        <rect x="-1.5" y="1" width="3" height="3" fill="#16a34a" />
      </g>
    ),
  },
  'tan-loc-009': {
    name: 'Tân Lộc',
    color: '#0284c7',
    bg: '#e0f2fe',
    iconBg: '#0284c7',
    icon: (
      // Sparkling Blue Gemstone Emblem
      <g>
        <polygon points="-5,-2 0,-6 5,-2 0,6" fill="#ffffff" />
        <line x1="-5" y1="-2" x2="5" y2="-2" stroke="#0284c7" strokeWidth="0.8" />
        <line x1="0" y1="-6" x2="0" y2="6" stroke="#0284c7" strokeWidth="0.8" />
      </g>
    ),
  },
  'hai-van-010': {
    name: 'Hải Vân',
    color: '#6366f1',
    bg: '#e0e7ff',
    iconBg: '#6366f1',
    icon: (
      // Fluffy Cloud Mountain Pass Emblem
      <g>
        <polygon points="-5,5 0,-4 5,5" fill="#ffffff" opacity="0.6" />
        <ellipse cx="0" cy="2" rx="4.5" ry="2.8" fill="#ffffff" />
        <ellipse cx="-2.5" cy="0.5" rx="2.8" ry="2.2" fill="#ffffff" />
        <ellipse cx="2.5" cy="0.5" rx="2.8" ry="2.2" fill="#ffffff" />
      </g>
    ),
  },
  'thu-phong-011': {
    name: 'Thu Phong',
    color: '#ea580c',
    bg: '#ffedd5',
    iconBg: '#ea580c',
    icon: (
      // Maple Leaf Emblem
      <g>
        <path
          d="M0 -6 L1.5 -2.5 L5 -4 L3.5 0 L6 2.5 L2 2 L0 6 L-2 2 L-6 2.5 L-3.5 0 L-5 -4 L-1.5 -2.5 Z"
          fill="#ffffff"
        />
      </g>
    ),
  },
  'huong-duong-012': {
    name: 'Hướng Dương',
    color: '#f59e0b',
    bg: '#fef3c7',
    iconBg: '#f59e0b',
    icon: (
      // Radiant Sunflower Emblem
      <g>
        <circle cx="0" cy="0" r="5.5" fill="#ffffff" />
        <circle cx="0" cy="0" r="3" fill="#b45309" />
        <circle cx="0" cy="0" r="1.8" fill="#78350f" />
      </g>
    ),
  },
};

// Aliases for fallback IDs
VILLAGE_EMBLEMS['an-nhien'] = VILLAGE_EMBLEMS['an-nhien-005'];
VILLAGE_EMBLEMS['moc-lan'] = VILLAGE_EMBLEMS['moc-lan-006'];
VILLAGE_EMBLEMS['thanh-ha'] = VILLAGE_EMBLEMS['thanh-ha-007'];
VILLAGE_EMBLEMS['phu-dien'] = VILLAGE_EMBLEMS['phu-dien-008'];
VILLAGE_EMBLEMS['tan-loc'] = VILLAGE_EMBLEMS['tan-loc-009'];
VILLAGE_EMBLEMS['hai-van'] = VILLAGE_EMBLEMS['hai-van-010'];
VILLAGE_EMBLEMS['thu-phong'] = VILLAGE_EMBLEMS['thu-phong-011'];
VILLAGE_EMBLEMS['huong-duong'] = VILLAGE_EMBLEMS['huong-duong-012'];

export function WorldMapSurface({
  playerCoord = { x: 0, z: 0 },
  myFarm,
  destinations = [],
  onSelect,
  selectedId,
  zoom = 1,
}) {
  // Accurate projection from 3D world meters (wx, wz) to SVG canvas (1000 x 640)
  // X: -660..+660 -> 120..880 (Center Plaza at 500)
  // Z: -360..+540 -> 110..550 (Center Plaza at 270)
  const x = wx => 500 + (wx / 720) * 410;
  const y = wz => 270 + (wz / 560) * 250;

  const playerX = x(playerCoord.x || 0);
  const playerY = y(playerCoord.z || 0);

  // Focus view on selected destination or player when zoomed
  const selectedDest = destinations.find(d => d.id === selectedId);
  const focusX = selectedDest ? x(selectedDest.x) : playerX;
  const focusY = selectedDest ? y(selectedDest.z) : playerY;

  // ViewBox bounds with zoom clamping
  const viewW = 1000 / zoom;
  const viewH = 640 / zoom;
  const minX = Math.max(0, Math.min(1000 - viewW, focusX - viewW / 2));
  const minY = Math.max(0, Math.min(640 - viewH, focusY - viewH / 2));

  return (
    <svg
      viewBox={`${minX} ${minY} ${viewW} ${viewH}`}
      role="group"
      aria-label="Bản đồ thế giới Vibe Resort 3D chuẩn game Play Together"
      className="pt-world-map-svg"
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        background: '#38bdf8',
        overflow: 'hidden',
      }}
    >
      <defs>
        {/* Ocean Depth Gradient */}
        <linearGradient id="ocean-water" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Tropical Shallow Lagoon Gradient */}
        <linearGradient id="lagoon-shallow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.4" />
        </linearGradient>

        {/* Golden Beach Sand Gradient */}
        <linearGradient id="beach-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>

        {/* Play Together Lush Valley Grass Gradient (Lowland) */}
        <linearGradient id="valley-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="30%" stopColor="#86efac" />
          <stop offset="80%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>

        {/* Highland Plateau Gradient (Elevated Terrain) */}
        <linearGradient id="highland-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d1fae5" />
          <stop offset="40%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>

        {/* Vibe River Gradient */}
        <linearGradient id="river-water" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Sandstone Road Material */}
        <linearGradient id="road-sandstone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9a8f82" />
          <stop offset="50%" stopColor="#8e8375" />
          <stop offset="100%" stopColor="#82776a" />
        </linearGradient>

        {/* Candy Pin Gloss Highlight */}
        <linearGradient id="pin-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Tactile Game Drop Shadow */}
        <filter id="candy-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="3.5" stdDeviation="3.2" floodColor="#064e3b" floodOpacity="0.28" />
        </filter>

        {/* Selected Beacon Glow */}
        <filter id="beacon-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.95" />
        </filter>
      </defs>

      {/* 1. TROPICAL OCEAN & CORAL REEF WATER */}
      <rect width="1000" height="640" fill="url(#ocean-water)" />

      {/* Ocean Wavelets & Foam Ripples */}
      <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.45" fill="none">
        <path d="M 60 70 Q 85 62 110 70" />
        <path d="M 870 80 Q 895 72 920 80" />
        <path d="M 70 570 Q 95 562 120 570" />
        <path d="M 880 570 Q 905 562 930 570" />
        <path d="M 480 35 Q 505 27 530 35" />
        <path d="M 320 595 Q 345 588 370 595" />
        <path d="M 620 595 Q 645 588 670 595" />
      </g>

      {/* Shallow Coral Reef Lagoon (Outline Surrounding Island) */}
      <path
        d="M 90 230 C 60 110, 200 35, 500 35 C 800 35, 940 110, 910 230 C 940 370, 910 500, 790 570 C 680 615, 320 615, 210 570 C 90 500, 60 370, 90 230 Z"
        fill="url(#lagoon-shallow)"
      />

      {/* 2. THE MAIN RESORT ISLAND (ORGANIC 2.5D TERRAIN) */}
      {/* Sandy Coastline Beach Rim */}
      <path
        d="M 115 240 C 90 125, 220 52, 500 52 C 780 52, 910 125, 885 240 C 915 365, 880 490, 775 550 C 665 595, 335 595, 225 550 C 120 490, 85 365, 115 240 Z"
        fill="url(#beach-sand)"
        stroke="#eab308"
        strokeWidth="3.5"
        filter="url(#candy-shadow)"
      />

      {/* Tier 1: Main Valley Grass Plateau */}
      <path
        d="M 130 238 C 110 135, 235 70, 500 70 C 765 70, 890 135, 870 238 C 898 350, 860 472, 755 530 C 650 572, 350 572, 245 530 C 140 472, 102 350, 130 238 Z"
        fill="url(#valley-grass)"
        stroke="#16a34a"
        strokeWidth="3"
      />

      {/* Tier 2: Highland Elevated Grass Knolls (Isometric 3D Elevation Shading) */}
      {/* Northwest Highland (Mộc Lan & Thanh Hà) */}
      <path
        d="M 160 210 C 160 120, 260 85, 420 90 C 420 150, 380 230, 280 250 C 200 250, 160 230, 160 210 Z"
        fill="url(#highland-grass)"
        stroke="#15803d"
        strokeWidth="2"
        opacity="0.9"
      />
      {/* Northeast Highland (Tân Lộc & Hải Vân) */}
      <path
        d="M 580 90 C 740 85, 840 120, 840 210 C 840 230, 800 250, 720 250 C 620 230, 580 150, 580 90 Z"
        fill="url(#highland-grass)"
        stroke="#15803d"
        strokeWidth="2"
        opacity="0.9"
      />
      {/* Far West Hill (Đồi Gió Ridge) */}
      <path
        d="M 135 340 C 135 280, 210 270, 260 300 C 260 380, 210 420, 150 410 C 135 385, 135 360, 135 340 Z"
        fill="url(#highland-grass)"
        stroke="#15803d"
        strokeWidth="2"
        opacity="0.85"
      />

      {/* Southern Sandy Beach Lagoon (Sunrise Beach Shoreline) */}
      <path
        d="M 230 515 C 340 550, 660 550, 770 515 C 725 565, 630 580, 500 580 C 370 580, 275 565, 230 515 Z"
        fill="#fde047"
        stroke="#facc15"
        strokeWidth="2"
      />

      {/* 3. VIBE RIVER & WATERWAYS */}
      {/* River Basin (Connecting West to Crystal Lake to East Ocean) */}
      <path
        d="M 105 210 Q 240 198 370 238 T 500 270 T 670 265 T 780 250 T 895 215"
        fill="none"
        stroke="#0284c7"
        strokeWidth="22"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M 105 210 Q 240 198 370 238 T 500 270 T 670 265 T 780 250 T 895 215"
        fill="none"
        stroke="url(#river-water)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* River Shimmer Highlights */}
      <path
        d="M 120 210 Q 240 200 370 238 T 500 270 T 670 265 T 780 250 T 880 215"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeDasharray="14 12"
        opacity="0.65"
      />

      {/* 4. REAL MODERN ROAD SYSTEM (COBBLESTONE BOULEVARDS & HIGHWAYS) */}
      {/* Central Roundabout around Plaza */}
      <circle cx={x(0)} cy={y(0)} r="54" fill="none" stroke="#ded7ca" strokeWidth="17" />
      <circle cx={x(0)} cy={y(0)} r="54" fill="none" stroke="url(#road-sandstone)" strokeWidth="13" />

      {/* North-South Boulevard (Trục Đại Lộ Đô Thị) */}
      <line x1={x(0)} y1="90" x2={x(0)} y2="525" stroke="#ded7ca" strokeWidth="17" strokeLinecap="round" />
      <line x1={x(0)} y1="90" x2={x(0)} y2="525" stroke="url(#road-sandstone)" strokeWidth="13" strokeLinecap="round" />
      <line x1={x(0)} y1="90" x2={x(0)} y2="525" stroke="#ded7ca" strokeWidth="1.8" strokeDasharray="6 6" />

      {/* East-West Highway (Quốc Lộ 86) */}
      <line x1="150" y1={y(182)} x2="850" y2={y(182)} stroke="#ded7ca" strokeWidth="15" strokeLinecap="round" />
      <line x1="150" y1={y(182)} x2="850" y2={y(182)} stroke="url(#road-sandstone)" strokeWidth="11" strokeLinecap="round" />

      {/* Northern Ring Road (Connecting Northwest to Northeast) */}
      <line x1="165" y1={y(-138)} x2="835" y2={y(-138)} stroke="#ded7ca" strokeWidth="13" strokeLinecap="round" />
      <line x1="165" y1={y(-138)} x2="835" y2={y(-138)} stroke="url(#road-sandstone)" strokeWidth="9" strokeLinecap="round" />

      {/* Southern Coastal Road (Connecting Thu Phong & Hướng Dương) */}
      <line x1="210" y1={y(502)} x2="790" y2={y(502)} stroke="#ded7ca" strokeWidth="13" strokeLinecap="round" />
      <line x1="210" y1={y(502)} x2="790" y2={y(502)} stroke="url(#road-sandstone)" strokeWidth="9" strokeLinecap="round" />

      {/* Wooden / Stone Arched Bridges over Vibe River */}
      <g transform={`translate(${x(0)}, ${y(0) + 8})`}>
        <rect x="-11" y="-15" width="22" height="30" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="1.6" />
        <line x1="-11" y1="-7" x2="11" y2="-7" stroke="#fde68a" strokeWidth="1.2" />
        <line x1="-11" y1="7" x2="11" y2="7" stroke="#fde68a" strokeWidth="1.2" />
      </g>

      {/* 5. CRYSTAL LAKE & FISHING PIER (HỒ PHA LÊ & BẾN CÂU CÁ) */}
      <g transform={`translate(${x(135)}, ${y(-2)})`}>
        <ellipse cx="0" cy="0" rx="52" ry="36" fill="#0284c7" opacity="0.3" />
        <ellipse cx="0" cy="-2" rx="50" ry="34" fill="#38bdf8" stroke="#ffffff" strokeWidth="2.5" />
        <ellipse cx="6" cy="-4" rx="34" ry="22" fill="#0284c7" opacity="0.4" />

        {/* Floating Lilypads & Lotus Flower */}
        <circle cx="-18" cy="-8" r="5.5" fill="#22c55e" opacity="0.9" />
        <circle cx="16" cy="10" r="5" fill="#22c55e" opacity="0.9" />
        <circle cx="2" cy="14" r="4" fill="#22c55e" opacity="0.9" />
        <circle cx="-16" cy="-8" r="2.2" fill="#ec4899" />

        {/* Wooden Fishing Pier & Shack */}
        <rect x="-42" y="-6" width="26" height="10" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1.2" />
        <circle cx="-14" cy="-1" r="2.5" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />

        {/* Lake 3D Candy Pin */}
        <g
          transform="translate(0, -32)"
          filter="url(#candy-shadow)"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelect?.(destinations.find(d => d.id === 'lake') || { id: 'lake', label: 'Hồ Pha Lê', x: 128, z: -2 })}
        >
          <rect x="-48" y="-11" width="96" height="22" rx="11" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
          <rect x="-48" y="-11" width="96" height="11" rx="5" fill="url(#pin-gloss)" />
          {/* Fishing Hook Emblem */}
          <circle cx="-34" cy="0" r="7" fill="#ffffff" />
          <path d="M-36 -3 L-33 -3 L-33 2 A 2 2 0 0 1 -37 2" fill="none" stroke="#0284c7" strokeWidth="1.4" strokeLinecap="round" />
          <text x="6" y="3.5" textAnchor="middle" fontSize="10" fontWeight="900" fill="#ffffff" letterSpacing="0.2px">
            HỒ PHA LÊ
          </text>
        </g>
      </g>

      {/* 6. CENTRAL TOWN PLAZA (QUẢNG TRƯỜNG TRUNG TÂM) */}
      <g transform={`translate(${x(0)}, ${y(0)})`}>
        {/* Cobblestone Circular Plaza Disc */}
        <circle r="48" fill="#ffffff" stroke="#fcd34d" strokeWidth="3.5" filter="url(#candy-shadow)" />
        <circle r="38" fill="#fef9c3" stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="5 3" />

        {/* Geometric Star Plaza Inlay */}
        <polygon
          points="0,-36 8,-12 34,-12 14,3 22,28 0,14 -22,28 -14,3 -34,-12 -8,-12"
          fill="#fde68a"
          opacity="0.6"
        />

        {/* 4 Themed Play Together Boutique Storefronts (Casino, Fashion, Auto, Mart) */}
        {/* Game Center / Casino (Top-Left) */}
        <g transform="translate(-21, -19)">
          <rect x="-7" y="-7" width="14" height="14" rx="3.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
          <polygon points="0,-4 3,-1 0,2 -3,-1" fill="#ffffff" />
        </g>
        {/* Fashion Boutique (Top-Right) */}
        <g transform="translate(21, -19)">
          <rect x="-7" y="-7" width="14" height="14" rx="3.5" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
          <path d="M-4 3 L4 3 L2 -3 L-2 -3 Z" fill="#ffffff" />
        </g>
        {/* Auto Showroom (Bottom-Left) */}
        <g transform="translate(-21, 19)">
          <rect x="-7" y="-7" width="14" height="14" rx="3.5" fill="#0ea5e9" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="-4" y="-1" width="8" height="4" rx="1.5" fill="#ffffff" />
        </g>
        {/* 24/7 Mart / Supplies (Bottom-Right) */}
        <g transform="translate(21, 19)">
          <rect x="-7" y="-7" width="14" height="14" rx="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
          <path d="M-3 2 L3 2 L4 -2 L-4 -2 Z" fill="#ffffff" />
        </g>

        {/* Grand 3-Tier Marble Fountain */}
        <circle r="19" fill="#38bdf8" stroke="#ffffff" strokeWidth="2.5" />
        <circle r="11" fill="#0284c7" stroke="#ffffff" strokeWidth="1.8" />
        <circle cx="0" cy="0" r="3.5" fill="#ffffff" />

        {/* Plaza 3D Candy Pin */}
        <g
          transform="translate(0, -48)"
          filter="url(#candy-shadow)"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelect?.(destinations.find(d => d.id === 'town') || { id: 'town', label: 'Quảng Trường', x: 0, z: 0 })}
        >
          <rect x="-56" y="-12" width="112" height="24" rx="12" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
          <rect x="-56" y="-12" width="112" height="12" rx="6" fill="url(#pin-gloss)" />
          {/* Fountain Emblem */}
          <circle cx="-42" cy="0" r="8" fill="#ffffff" />
          <circle cx="-42" cy="0" r="3" fill="#f59e0b" />
          <path d="M-42 -4 L-42 -6 M-44 -3 L-46 -5 M-40 -3 L-38 -5" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
          <text x="6" y="3.5" textAnchor="middle" fontSize="10.5" fontWeight="900" fill="#ffffff" letterSpacing="0.4px">
            QUẢNG TRƯỜNG
          </text>
        </g>
      </g>

      {/* 7. SUNRISE BEACH & MARINA (BÃI BIỂN BÌNH MINH) */}
      <g transform={`translate(${x(0)}, ${y(335)})`}>
        {/* Coconut Palm Trees */}
        <path d="M -36 8 Q -30 -8 -32 -20" fill="none" stroke="#a16207" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="-32" cy="-20" rx="12" ry="3.5" fill="#15803d" transform="rotate(-25 -32 -20)" />
        <ellipse cx="-32" cy="-20" rx="12" ry="3.5" fill="#16a34a" transform="rotate(30 -32 -20)" />
        <circle cx="-31" cy="-18" r="2.2" fill="#a3e635" />

        {/* Striped Beach Parasol */}
        <circle cx="34" cy="2" r="9" fill="#f43f5e" />
        <path d="M 34 2 L 43 2 A 9 9 0 0 1 34 11 Z" fill="#ffffff" />
        <line x1="34" y1="2" x2="34" y2="15" stroke="#a16207" strokeWidth="1.5" />

        {/* Beach 3D Candy Pin */}
        <g
          transform="translate(0, 0)"
          filter="url(#candy-shadow)"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelect?.(destinations.find(d => d.id === 'beach') || { id: 'beach', label: 'Bãi Biển', x: 0, z: 300 })}
        >
          <rect x="-52" y="-11" width="104" height="22" rx="11" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
          <rect x="-52" y="-11" width="104" height="11" rx="5" fill="url(#pin-gloss)" />
          {/* Palm / Coast Emblem */}
          <circle cx="-38" cy="0" r="7.5" fill="#ffffff" />
          <path d="M-40 4 Q-38 -1 -39 -3" stroke="#0d9488" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M-39 -3 Q-42 -4 -44 -1 M-39 -3 Q-36 -4 -34 -1" stroke="#0d9488" strokeWidth="1.2" fill="none" />
          <text x="6" y="3.5" textAnchor="middle" fontSize="10" fontWeight="900" fill="#ffffff" letterSpacing="0.2px">
            BÃI BIỂN
          </text>
        </g>
      </g>

      {/* 8. THE 12 CHIBI VILLAGES (BEAUTIFUL MINIATURE ARCHITECTURE & PURE VECTOR PINS) */}
      {WORLD_VILLAGES.map(v => {
        const vx = x(v.x);
        const vy = y(v.z);
        const meta = VILLAGE_EMBLEMS[v.id] || VILLAGE_EMBLEMS['binh-minh'];
        const isSelected = selectedId === v.id;
        const isMyVillage = myFarm && myFarm.villageId === v.id;
        const matchingDest = destinations.find(d => d.id === v.id);

        return (
          <g
            key={v.id}
            transform={`translate(${vx}, ${vy})`}
            className="pt-village-landmark"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect?.(matchingDest || { id: v.id, label: v.name, x: v.gate.x, z: v.gate.z })}
          >
            {/* Soft Grass Mound */}
            <ellipse cx="0" cy="8" rx="38" ry="22" fill={meta.bg} stroke={meta.color} strokeWidth="1.8" opacity="0.92" />

            {/* Custom Chibi Landmark Miniature Graphic */}
            {/* Đồi Gió: 3D Dutch Windmill */}
            {v.id === 'doi-gio' && (
              <g transform="translate(0, -6)">
                <polygon points="-7,14 7,14 5,-7 -5,-7" fill="#f8fafc" stroke="#475569" strokeWidth="1.2" />
                <circle cx="0" cy="-7" r="3.5" fill="#cbd5e1" />
                <line x1="-14" y1="-7" x2="14" y2="-7" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="0" y1="-21" x2="0" y2="7" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
              </g>
            )}

            {/* Hoa Mai: Asian Blossom Pagoda */}
            {v.id === 'hoa-mai' && (
              <g transform="translate(0, -4)">
                <rect x="-8" y="0" width="16" height="12" rx="2" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.2" />
                <path d="M-12 1 Q0 -7 12 1" stroke="#ea580c" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                <circle cx="-14" cy="-2" r="5.5" fill="#f472b6" />
                <circle cx="14" cy="-2" r="5.5" fill="#f472b6" />
              </g>
            )}

            {/* Phú Điền: Red Barn & Tractor */}
            {v.id === 'phu-dien-008' && (
              <g transform="translate(0, -4)">
                <rect x="-10" y="0" width="20" height="13" rx="2" fill="#ef4444" stroke="#991b1b" strokeWidth="1.2" />
                <polygon points="-12,1 0,-8 12,1" fill="#ffffff" stroke="#991b1b" strokeWidth="1.2" />
                <circle cx="14" cy="7" r="3.5" fill="#16a34a" />
              </g>
            )}

            {/* Ven Sông: Riverfront Pier & Boat */}
            {v.id === 'ven-song' && (
              <g transform="translate(0, -2)">
                <rect x="-9" y="2" width="18" height="7" rx="1.5" fill="#a16207" />
                <path d="M -7 7 L 7 7 L 5 12 L -5 12 Z" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
              </g>
            )}

            {/* An Nhiên: Bamboo Shrub & Stepping Stones */}
            {v.id === 'an-nhien-005' && (
              <g transform="translate(0, -4)">
                <rect x="-5" y="-5" width="2.5" height="14" rx="1" fill="#10b981" />
                <rect x="2" y="-7" width="2.5" height="16" rx="1" fill="#10b981" />
                <ellipse cx="-10" cy="8" rx="3.5" ry="2" fill="#cbd5e1" />
                <ellipse cx="10" cy="8" rx="3.5" ry="2" fill="#cbd5e1" />
              </g>
            )}

            {/* Mộc Lan: Traditional Gate */}
            {v.id === 'moc-lan-006' && (
              <g transform="translate(0, -3)">
                <path d="M -11 -2 Q 0 -6 11 -2" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <rect x="-7" y="-2" width="3" height="12" rx="1" fill="#c2410c" />
                <rect x="4" y="-2" width="3" height="12" rx="1" fill="#c2410c" />
                <circle cx="-11" cy="-3" r="3" fill="#fed7aa" />
                <circle cx="11" cy="-3" r="3" fill="#fed7aa" />
              </g>
            )}

            {/* Thanh Hà: Terracotta Cottage & Kiln */}
            {v.id === 'thanh-ha-007' && (
              <g transform="translate(0, -3)">
                <rect x="-8" y="0" width="16" height="11" rx="1.5" fill="#eab308" stroke="#a16207" strokeWidth="1" />
                <polygon points="-10,1 0,-6 10,1" fill="#c2410c" />
                <rect x="4" y="-8" width="3" height="5" fill="#78350f" />
              </g>
            )}

            {/* Tân Lộc: Crystal Spire Manor */}
            {v.id === 'tan-loc-009' && (
              <g transform="translate(0, -4)">
                <rect x="-7" y="0" width="14" height="11" rx="1.5" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" />
                <polygon points="-5,-1 0,-9 5,-1" fill="#0284c7" />
                <circle cx="0" cy="-9" r="2.5" fill="#38bdf8" />
              </g>
            )}

            {/* Hải Vân: Mountain Peak & Pine Tree */}
            {v.id === 'hai-van-010' && (
              <g transform="translate(0, -4)">
                <polygon points="-9,9 0,-8 9,9" fill="#818cf8" stroke="#4338ca" strokeWidth="1" />
                <polygon points="-4,-2 0,-8 4,-2" fill="#ffffff" />
                <polygon points="6,9 11,1 16,9" fill="#15803d" />
              </g>
            )}

            {/* Thu Phong: Red Maple Cottage */}
            {v.id === 'thu-phong-011' && (
              <g transform="translate(0, -3)">
                <rect x="-7" y="1" width="14" height="10" rx="1.5" fill="#ffedd5" stroke="#ea580c" strokeWidth="1" />
                <polygon points="-9,1 0,-6 9,1" fill="#ea580c" />
                <circle cx="-12" cy="0" r="4.5" fill="#c2410c" />
              </g>
            )}

            {/* Hướng Dương: Sunflower Field Cottage */}
            {v.id === 'huong-duong-012' && (
              <g transform="translate(0, -3)">
                <rect x="-7" y="1" width="14" height="10" rx="1.5" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
                <polygon points="-9,1 0,-6 9,1" fill="#f59e0b" />
                <circle cx="12" cy="1" r="4" fill="#fde047" stroke="#b45309" strokeWidth="0.8" />
              </g>
            )}

            {/* Bình Minh: Capital Farmhouse */}
            {v.id === 'binh-minh' && (
              <g transform="translate(0, -3)">
                <rect x="-8" y="1" width="16" height="11" rx="1.5" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.2" />
                <polygon points="-10,1 0,-7 10,1" fill="#f59e0b" />
                <circle cx="0" cy="5" r="2" fill="#f59e0b" />
              </g>
            )}

            {/* Selected Golden Halo Aura */}
            {isSelected && (
              <g filter="url(#beacon-glow)">
                <circle r="24" fill="#f59e0b" opacity="0.35">
                  <animate attributeName="r" values="18;26;18" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle r="18" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
              </g>
            )}

            {/* 3D CANDY GAME PIN (100% PURE VECTOR, NO EMOJI) */}
            <g transform="translate(0, -22)" filter="url(#candy-shadow)">
              {/* Capsule Body */}
              <rect
                x="-44"
                y="-11"
                width="88"
                height="22"
                rx="11"
                fill={isSelected ? '#0f172a' : '#ffffff'}
                stroke={isSelected ? '#fbbf24' : isMyVillage ? '#f59e0b' : meta.color}
                strokeWidth={isSelected ? 2.5 : isMyVillage ? 2.5 : 1.8}
              />
              <rect x="-44" y="-11" width="88" height="11" rx="5" fill="url(#pin-gloss)" />

              {/* Pure Vector Icon Disc on Left */}
              <circle cx="-32" cy="0" r="7.5" fill={meta.iconBg} />
              <g transform="translate(-32, 0) scale(0.75)">
                {meta.icon}
              </g>

              {/* Bold Clean Village Name */}
              <text
                x="6"
                y="3.5"
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="900"
                fill={isSelected ? '#ffffff' : '#1e293b'}
                letterSpacing="0.2px"
              >
                {meta.name}
              </text>
            </g>

            {/* Special Floating Crown if Player Owns Farm Here (100% Pure Vector) */}
            {isMyVillage && (
              <g transform="translate(28, -32)" filter="url(#beacon-glow)">
                <circle r="8.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.8" />
                {/* Pure Vector Crown */}
                <polygon points="-4.5,-2 -3.5,3 3.5,3 4.5,-2 2,0.5 0,-3.5 -2,0.5" fill="#ffffff" />
              </g>
            )}
          </g>
        );
      })}

      {/* 9. REAL-TIME PLAYER CURRENT LOCATION (BẠN Ở ĐÂY - 100% VECTOR CHIBI MARKER) */}
      <g transform={`translate(${playerX}, ${playerY})`} filter="url(#candy-shadow)">
        {/* Pulsing Radar Ring */}
        <circle r="20" fill="none" stroke="#0ea5e9" strokeWidth="2.5" opacity="0.8">
          <animate attributeName="r" values="8;26;8" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0;0.9" dur="1.8s" repeatCount="indefinite" />
        </circle>

        {/* 3D Character Marker Pin */}
        <path d="M 0 8 L -8 -7 C -10 -15, 10 -15, 8 -7 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="2.4" />
        <circle cx="0" cy="-7" r="5.5" fill="#ffffff" />
        <circle cx="0" cy="-7" r="3.5" fill="#0284c7" />

        {/* Speech Balloon Bubble Tag (100% NO EMOJI) */}
        <g transform="translate(0, -30)">
          <rect x="-42" y="-11" width="84" height="22" rx="11" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
          <polygon points="-5,11 5,11 0,15" fill="#0284c7" />
          <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="900" letterSpacing="0.4px">
            BẠN Ở ĐÂY
          </text>
        </g>
      </g>

      {/* 10. CARTOON NAUTICAL COMPASS */}
      <g transform="translate(930, 65)" filter="url(#candy-shadow)">
        <circle r="22" fill="#ffffff" stroke="#f59e0b" strokeWidth="3" />
        <circle r="18" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
        <polygon points="0,-14 4,-2 0,-4 -4,-2" fill="#ef4444" />
        <polygon points="0,14 4,2 0,4 -4,2" fill="#3b82f6" />
        <circle r="2.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
        <text y="-25" textAnchor="middle" fontSize="10" fontWeight="900" fill="#ef4444" letterSpacing="0.5px">
          BẮC
        </text>
      </g>
    </svg>
  );
}
