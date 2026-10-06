import React, { useRef, useState } from 'react';
import { WORLD_VILLAGES } from '../../shared/villageLayout.js';

// ============================================================================
// PLAY TOGETHER WORLD MAP - FULL LOCATIONS EDITION (ĐẦY ĐỦ ĐỊA ĐIỂM)
// - Hiển thị ĐẦY ĐỦ: Đô Thị, Hồ Pha Lê, Bãi Biển & TOÀN BỘ 12 LÀNG NÔNG TRẠI
// - Chuẩn 100% tọa độ di chuyển server chấp nhận:
//   * Đô Thị: x: 0, z: 18 (hoặc TOWN_SPAWN)
//   * Hồ Pha Lê: x: 126, z: 2
//   * Bãi Biển: x: 0, z: 320
//   * 12 Làng: x: v.gate.x, z: v.gate.z (server cho phép tuyệt đối)
//   * Nông trại riêng: x: ownFarm.x + 6, z: ownFarm.z - 4
// - Thiết kế thông minh: Mỗi địa điểm có ghim Kim Cương Vàng rực rỡ,
//   thẻ tên hiển thị khi chọn hoặc rê chuột -> TUYỆT ĐỐI KHÔNG CHỒNG CHÉO CHỮ
// ============================================================================

export const ALL_MAP_DESTINATIONS = [
  // 1. 4 ĐỊA ĐIỂM LỚN
  {
    id: 'town',
    label: 'Đô Thị (Trung Tâm)',
    badge: 'Quảng Trường',
    category: 'city',
    color: '#ec4899',
    sub: 'Quảng trường Vibe City, cửa hàng & hội quán',
    destX: 0,
    destZ: 18,
    isMajor: true,
    iconType: 'city',
  },
  {
    id: 'lake',
    label: 'Hồ Pha Lê',
    badge: 'Bến Câu Cá',
    category: 'nature',
    color: '#0284c7',
    sub: 'Tiệm đồ câu Lão Ngư & bến thuyền dã ngoại',
    destX: 126,
    destZ: 2,
    isMajor: true,
    iconType: 'fish',
  },
  {
    id: 'beach',
    label: 'Bãi Biển Bình Minh',
    badge: 'Bờ Cát & Bến Tàu',
    category: 'nature',
    color: '#0d9488',
    sub: 'Ngọn hải đăng, ghế tắm nắng & bến tàu viễn dương',
    destX: 0,
    destZ: 320,
    isMajor: true,
    iconType: 'beach',
  },

  // 2. 12 LÀNG NÔNG TRẠI VỚI ĐÚNG TỌA ĐỘ CỔNG LÀNG SERVER
  ...WORLD_VILLAGES.map(v => {
    let iconType = 'village';
    if (v.id.includes('doi-gio')) iconType = 'windmill';
    else if (v.id.includes('hoa-mai')) iconType = 'flower';
    else if (v.id.includes('huong-duong')) iconType = 'sunflower';
    else if (v.id.includes('thu-phong')) iconType = 'autumn';

    return {
      id: v.id,
      label: v.name,
      badge: 'Làng Nông Trại',
      category: 'village',
      color: '#16a34a',
      sub: 'Cổng làng & 24 lô đất nông trại trù phú',
      destX: v.gate.x,
      destZ: v.gate.z,
      isMajor: v.id === 'binh-minh',
      iconType,
    };
  }),
];

// Coordinate projection between World and SVG
// World: x in [-650, 650] -> SVG: x in [120, 880]
// World: z in [-450, 450] -> SVG: y in [130, 660]
export const toSvgX = wx => 500 + wx * 0.58;
export const toSvgY = wz => 360 + wz * 0.58;
export const toWorldX = svgX => (svgX - 500) / 0.58;
export const toWorldZ = svgY => (svgY - 360) / 0.58;

// Play Together Yellow Diamond Pin Component
function PlayTogetherMapPin({
  cx,
  cy,
  iconType,
  label,
  isMajor,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const pinSize = isMajor ? 32 : 26;
  const showLabel = isSelected || isHovered || isMajor;

  return (
    <g
      transform={`translate(${cx}, ${cy})`}
      style={{ cursor: 'pointer', pointerEvents: 'all' }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Contact Shadow */}
      <ellipse cx="0" cy={pinSize * 0.6} rx={pinSize * 0.45} ry={pinSize * 0.2} fill="#000000" opacity="0.32" />

      {/* Pulsing Selection Aura */}
      {isSelected && (
        <g filter="url(#pt-halo-glow)">
          <circle r={pinSize * 0.9} fill="#facc15" opacity="0.4">
            <animate attributeName="r" values={`${pinSize * 0.8};${pinSize * 1.1};${pinSize * 0.8}`} dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle r={pinSize * 0.8} fill="none" stroke="#facc15" strokeWidth="3" strokeDasharray="5 3" />
        </g>
      )}

      {/* Yellow Diamond Badge */}
      <g
        transform={`translate(0, ${isSelected ? -4 : isHovered ? -2 : 0})`}
        style={{ transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        filter="url(#pt-hud-shadow)"
      >
        <rect
          x={-pinSize / 2}
          y={-pinSize / 2}
          width={pinSize}
          height={pinSize}
          rx={pinSize * 0.18}
          transform="rotate(45)"
          fill="#facc15"
          stroke="#0f172a"
          strokeWidth={isMajor ? 3.2 : 2.4}
        />
        <rect
          x={-pinSize * 0.4}
          y={-pinSize * 0.4}
          width={pinSize * 0.8}
          height={pinSize * 0.8}
          rx={pinSize * 0.14}
          transform="rotate(45)"
          fill="#fde047"
        />

        {/* High-contrast black pictogram */}
        <g fill="#0f172a" stroke="#0f172a" strokeWidth="0.5" strokeLinejoin="round">
          {iconType === 'city' && (
            <g transform="translate(-7, -7) scale(0.7)">
              <polygon points="10,2 2,8 18,8" />
              <rect x="4" y="8" width="12" height="10" rx="1.5" />
              <rect x="8" y="11" width="4" height="7" fill="#facc15" />
            </g>
          )}
          {iconType === 'fish' && (
            <g transform="translate(-7, -7) scale(0.7)">
              <path d="M 2 10 Q 9 3 16 10 Q 9 17 2 10 Z" />
              <polygon points="15,10 20,5 20,15" />
              <circle cx="6" cy="9" r="1.2" fill="#ffffff" />
            </g>
          )}
          {iconType === 'beach' && (
            <g transform="translate(-7, -7) scale(0.7)">
              <path d="M 1 10 C 1 3, 19 3, 19 10 Z" />
              <rect x="9" y="10" width="2" height="9" rx="1" />
              <path d="M 5 19 L 15 19" strokeWidth="2" />
            </g>
          )}
          {iconType === 'windmill' && (
            <g transform="translate(-7, -7) scale(0.7)">
              <polygon points="6,18 12,18 10,7 8,7" />
              <circle cx="9" cy="7" r="1.5" />
              <line x1="9" y1="7" x2="3" y2="2" strokeWidth="2" />
              <line x1="9" y1="7" x2="15" y2="12" strokeWidth="2" />
              <line x1="9" y1="7" x2="15" y2="2" strokeWidth="2" />
              <line x1="9" y1="7" x2="3" y2="12" strokeWidth="2" />
            </g>
          )}
          {iconType === 'flower' && (
            <g transform="translate(-7, -7) scale(0.7)">
              <circle cx="10" cy="10" r="3" fill="#facc15" />
              <circle cx="10" cy="5" r="2.8" />
              <circle cx="10" cy="15" r="2.8" />
              <circle cx="5" cy="10" r="2.8" />
              <circle cx="15" cy="10" r="2.8" />
            </g>
          )}
          {iconType === 'sunflower' && (
            <g transform="translate(-7, -7) scale(0.7)">
              <circle cx="10" cy="10" r="4" fill="#78350f" stroke="#0f172a" />
              <circle cx="10" cy="4" r="2.5" fill="#facc15" />
              <circle cx="10" cy="16" r="2.5" fill="#facc15" />
              <circle cx="4" cy="10" r="2.5" fill="#facc15" />
              <circle cx="16" cy="10" r="2.5" fill="#facc15" />
            </g>
          )}
          {iconType === 'village' && (
            <g transform="translate(-7, -7) scale(0.7)">
              <polygon points="10,3 2,10 18,10" />
              <rect x="4" y="10" width="12" height="7" rx="1" />
              <rect x="8" y="12" width="4" height="5" fill="#facc15" />
            </g>
          )}
        </g>
      </g>

      {/* Floating High-Contrast Nameplate (Appears when active or hovered) */}
      {showLabel && (
        <g transform={`translate(0, ${-pinSize - 8})`} filter="url(#pt-hud-shadow)">
          <rect
            x="-52"
            y="-11"
            width="104"
            height="22"
            rx="11"
            fill={isSelected ? '#0f172a' : 'rgba(255, 255, 255, 0.96)'}
            stroke={isSelected ? '#facc15' : '#0f172a'}
            strokeWidth={isSelected ? 2.5 : 1.5}
          />
          <polygon
            points="-3,11 3,11 0,16"
            fill={isSelected ? '#0f172a' : 'rgba(255, 255, 255, 0.96)'}
            stroke={isSelected ? '#facc15' : '#0f172a'}
            strokeWidth="0.8"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="900"
            fill={isSelected ? '#fde047' : '#0f172a'}
            letterSpacing="0.2px"
          >
            {label.replace('Làng ', '')}
          </text>
        </g>
      )}
    </g>
  );
}

export function WorldMapSurface({
  playerCoord = { x: 0, z: 0 },
  myFarm = null,
  destinations = [],
  selectedId = null,
  selectedDestination = null,
  onSelect = null,
  zoom = 1,
}) {
  const svgRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);

  const playerX = toSvgX(playerCoord.x || 0);
  const playerY = toSvgY(playerCoord.z || 0);

  const activeDest = selectedDestination || destinations.find(d => d.id === selectedId);

  // Focus view calculation
  let focusX = playerX;
  let focusY = playerY;
  if (activeDest) {
    focusX = toSvgX(activeDest.x || 0);
    focusY = toSvgY(activeDest.z || 0);
  }

  const baseW = 1000;
  const baseH = 800;
  const viewW = baseW / zoom;
  const viewH = baseH / zoom;
  const minX = Math.max(0, Math.min(baseW - viewW, focusX - viewW / 2));
  const minY = Math.max(0, Math.min(baseH - viewH, focusY - viewH / 2));

  const handleSvgClick = e => {
    const svg = svgRef.current;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const svgP = pt.matrixTransform(ctm.inverse());
    const svgX = svgP.x;
    const svgY = svgP.y;

    // 1. Check all destinations hitboxes
    for (const d of ALL_MAP_DESTINATIONS) {
      const dx = toSvgX(d.destX);
      const dy = toSvgY(d.destZ);
      if (Math.hypot(svgX - dx, svgY - dy) < 26) {
        const match = destinations.find(dest => dest.id === d.id);
        onSelect?.(match || {
          id: d.id,
          label: d.label,
          badge: d.badge,
          color: d.color,
          sub: d.sub,
          x: d.destX,
          z: d.destZ,
        });
        return;
      }
    }

    // 2. Check player's farm hitbox
    if (myFarm) {
      const hx = toSvgX(myFarm.x);
      const hy = toSvgY(myFarm.z);
      if (Math.hypot(svgX - hx, svgY - hy) < 26) {
        onSelect?.({
          id: 'farm',
          label: `Nông Trại Của Bạn (${myFarm.villageName} - Lô ${myFarm.lotNumber})`,
          badge: `Lô ${myFarm.lotNumber}`,
          color: '#f59e0b',
          sub: 'Cổng trang trại riêng của bạn',
          x: myFarm.x + 6,
          z: myFarm.z - 4,
        });
        return;
      }
    }
  };

  return (
    <svg
      ref={svgRef}
      onClick={handleSvgClick}
      viewBox={`${minX} ${minY} ${viewW} ${viewH}`}
      role="group"
      aria-label="Bản đồ thế giới Vibe City đầy đủ địa điểm chuẩn Play Together"
      className="pt-world-map-svg"
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        background: '#1e9bf0',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <defs>
        {/* Play Together Shadow & Glow Filters */}
        <filter id="pt-hud-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.4" />
        </filter>
        <filter id="pt-halo-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#facc15" floodOpacity="0.95" />
        </filter>

        {/* Gradients */}
        <linearGradient id="pt-ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e9bf0" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="pt-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#92cf3d" />
          <stop offset="100%" stopColor="#7cb92e" />
        </linearGradient>
        <linearGradient id="pt-mountain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#76af32" />
          <stop offset="100%" stopColor="#558821" />
        </linearGradient>
        <linearGradient id="pt-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>
        <linearGradient id="pt-lake-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>

      {/* ==================================================================== */}
      {/* 1. OCEAN & SEASHORE BASE                                              */}
      {/* ==================================================================== */}
      <rect x="0" y="0" width="1000" height="800" fill="url(#pt-ocean)" />
      <path d="M 50 380 Q 250 330 500 370 T 950 360" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.25" strokeDasharray="30 20" />
      <path d="M 80 680 Q 300 640 550 670 T 920 660" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.25" strokeDasharray="40 25" />

      {/* ==================================================================== */}
      {/* 2. THE GRAND ORGANIC KAIA ISLAND MASS                                 */}
      {/* ==================================================================== */}
      {/* Sandy Beach Contour */}
      <path
        d="M 90 280
           C 70 140, 240 70, 480 60
           C 740 50, 920 110, 930 260
           C 940 430, 950 560, 880 660
           C 810 760, 670 780, 500 770
           C 330 760, 180 750, 110 640
           C 60 520, 80 390, 90 280 Z"
        fill="url(#pt-sand)"
        stroke="#eab308"
        strokeWidth="3.5"
        filter="url(#pt-hud-shadow)"
      />

      {/* Lush Green Island Surface */}
      <path
        d="M 105 290
           C 88 155, 250 85, 485 75
           C 730 65, 905 125, 915 270
           C 925 425, 932 545, 868 645
           C 802 740, 665 760, 500 750
           C 345 742, 195 732, 128 625
           C 80 510, 95 395, 105 290 Z"
        fill="url(#pt-grass)"
      />

      {/* ==================================================================== */}
      {/* 3. ROLLING NORTHERN MOUNTAINS (Top boundary)                          */}
      {/* ==================================================================== */}
      <path
        d="M 100 240 Q 200 110 320 170 Q 420 95 540 155 Q 660 90 780 150 Q 870 110 920 240 Z"
        fill="url(#pt-mountain)"
        stroke="#3f6b15"
        strokeWidth="2.5"
      />

      {/* Mountain Pine Trees */}
      {[
        [220, 150], [330, 130], [440, 120], [550, 115], [660, 120], [770, 135],
        [180, 190], [380, 180], [600, 175], [830, 190]
      ].map(([tx, ty], i) => (
        <g key={`tree-${i}`} transform={`translate(${tx}, ${ty}) scale(0.9)`}>
          <polygon points="0,-16 -7,0 7,0" fill="#2d5a12" />
          <polygon points="0,-22 -6,-8 6,-8" fill="#3f7519" />
          <polygon points="0,-27 -5,-15 5,-15" fill="#529323" />
        </g>
      ))}

      {/* ==================================================================== */}
      {/* 4. COMPREHENSIVE ROAD NETWORK (CONNECTING ALL 12 VILLAGES & PLAZA)    */}
      {/* ==================================================================== */}
      {/* White Road Curbs */}
      <g fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
        {/* Plaza Roundabout */}
        <circle cx="500" cy="360" r="52" strokeWidth="36" />
        {/* North Avenue to Phú Điền */}
        <line x1="500" y1="360" x2="500" y2="131" strokeWidth="34" />
        {/* South Avenue through Bình Minh to Sunrise Beach */}
        <line x1="500" y1="360" x2="500" y2="545" strokeWidth="34" />
        {/* Middle Highway 86 (Đồi Gió -> Hoa Mai -> Bình Minh -> Ven Sông -> An Nhiên) */}
        <path d="M 152 410 L 326 410 L 500 410 L 674 410 L 848 410" strokeWidth="34" />
        {/* North Highway (Mộc Lan -> Thanh Hà | Tân Lộc -> Hải Vân) */}
        <path d="M 152 224 L 326 224" strokeWidth="30" />
        <path d="M 674 224 L 848 224" strokeWidth="30" />
        {/* Connecting Loops North-South */}
        <path d="M 326 224 L 326 410 L 326 595" strokeWidth="30" />
        <path d="M 674 224 L 674 410 L 674 595" strokeWidth="30" />
        {/* East Lake Spur */}
        <path d="M 500 360 Q 540 361 573 361" strokeWidth="32" />
      </g>

      {/* Dark Charcoal Asphalt Road */}
      <g fill="none" stroke="#374151" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="500" cy="360" r="52" strokeWidth="26" />
        <line x1="500" y1="360" x2="500" y2="131" strokeWidth="24" />
        <line x1="500" y1="360" x2="500" y2="545" strokeWidth="24" />
        <path d="M 152 410 L 326 410 L 500 410 L 674 410 L 848 410" strokeWidth="24" />
        <path d="M 152 224 L 326 224" strokeWidth="20" />
        <path d="M 674 224 L 848 224" strokeWidth="20" />
        <path d="M 326 224 L 326 410 L 326 595" strokeWidth="20" />
        <path d="M 674 224 L 674 410 L 674 595" strokeWidth="20" />
        <path d="M 500 360 Q 540 361 573 361" strokeWidth="22" />
      </g>

      {/* Dashed Centerlines */}
      <g fill="none" stroke="#f8fafc" strokeWidth="2" strokeDasharray="8 6" opacity="0.85">
        <circle cx="500" cy="360" r="52" />
        <line x1="500" y1="360" x2="500" y2="131" />
        <line x1="500" y1="360" x2="500" y2="545" />
        <path d="M 152 410 L 848 410" />
      </g>

      {/* ==================================================================== */}
      {/* 5. 2.5D ILLUSTRATED ART FOR MAJOR VENUES                             */}
      {/* ==================================================================== */}

      {/* Plaza Fountain */}
      <g transform="translate(500, 360)" filter="url(#pt-hud-shadow)">
        <circle r="38" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
        <circle r="18" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
        <circle r="12" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
        <circle r="6" fill="#0284c7" />
        <circle r="3" fill="#ffffff" opacity="0.9" />
      </g>

      {/* Hồ Pha Lê */}
      <g transform="translate(573, 361)" filter="url(#pt-hud-shadow)">
        <path
          d="M -25 -18 C 12 -28, 35 -20, 44 6 C 52 28, 25 36, -4 32 C -32 28, -44 6, -25 -18 Z"
          fill="url(#pt-lake-water)"
          stroke="#0284c7"
          strokeWidth="2.5"
        />
        <rect x="-30" y="-4" width="22" height="9" rx="1.5" fill="#b45309" />
      </g>

      {/* Bãi Biển Bình Minh */}
      <g transform="translate(500, 545)">
        <path d="M -50 -8 C -16 12, 16 12, 50 -8 C 65 30, -65 30, -50 -8 Z" fill="#fde047" stroke="#eab308" strokeWidth="2" />
        <g transform="translate(42, -4)" filter="url(#pt-hud-shadow)">
          <polygon points="-5,14 5,14 3,-8 -3,-8" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
          <rect x="-4" y="4" width="8" height="4" fill="#dc2626" />
          <rect x="-3.5" y="-3" width="7" height="4" fill="#dc2626" />
        </g>
        <rect x="-5" y="16" width="10" height="24" rx="1.5" fill="#92400e" stroke="#451a03" strokeWidth="1.5" />
      </g>

      {/* 12 Farmland Patches across the island */}
      {WORLD_VILLAGES.map(v => {
        const vx = toSvgX(v.gate.x);
        const vy = toSvgY(v.gate.z);
        return (
          <g key={`farm-patch-${v.id}`} transform={`translate(${vx}, ${vy})`} opacity="0.75">
            <rect x="-18" y="-12" width="36" height="24" rx="4" fill="#a16207" stroke="#713f12" strokeWidth="1" />
            <line x1="-15" y1="-6" x2="15" y2="-6" stroke="#ca8a04" strokeWidth="1.5" />
            <line x1="-15" y1="0" x2="15" y2="0" stroke="#ca8a04" strokeWidth="1.5" />
            <line x1="-15" y1="6" x2="15" y2="6" stroke="#ca8a04" strokeWidth="1.5" />
          </g>
        );
      })}

      {/* ==================================================================== */}
      {/* 6. PLAY TOGETHER YELLOW DIAMOND PINS (ALL LOCATIONS DISPLAYED)       */}
      {/* ==================================================================== */}
      {ALL_MAP_DESTINATIONS.map(d => {
        const isSelected = activeDest?.id === d.id;
        const isHovered = hoveredId === d.id;
        const matchingDest = destinations.find(dest => dest.id === d.id);
        const px = toSvgX(d.destX);
        const py = toSvgY(d.destZ);

        return (
          <PlayTogetherMapPin
            key={d.id}
            cx={px}
            cy={py}
            iconType={d.iconType}
            label={d.label}
            isMajor={d.isMajor}
            isSelected={isSelected}
            isHovered={isHovered}
            onMouseEnter={() => setHoveredId(d.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={e => {
              e.stopPropagation();
              onSelect?.(matchingDest || {
                id: d.id,
                label: d.label,
                badge: d.badge,
                color: d.color,
                sub: d.sub,
                x: d.destX,
                z: d.destZ,
              });
            }}
          />
        );
      })}

      {/* ==================================================================== */}
      {/* 7. SPECIAL PLAYER'S OWN FARM PIN (If player owns a farm)             */}
      {/* ==================================================================== */}
      {myFarm && (
        <g
          transform={`translate(${toSvgX(myFarm.x)}, ${toSvgY(myFarm.z)})`}
          style={{ cursor: 'pointer', pointerEvents: 'all' }}
          onClick={e => {
            e.stopPropagation();
            onSelect?.({
              id: 'farm',
              label: `Nông Trại Của Bạn (${myFarm.villageName} - Lô ${myFarm.lotNumber})`,
              badge: `Lô ${myFarm.lotNumber}`,
              color: '#f59e0b',
              sub: 'Cổng trang trại riêng của bạn',
              x: myFarm.x + 6,
              z: myFarm.z - 4,
            });
          }}
          filter="url(#pt-halo-glow)"
        >
          <circle r="18" fill="#f59e0b" opacity="0.35">
            <animate attributeName="r" values="14;22;14" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle r="12" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
          <polygon points="-5,-1 -4,4 4,4 5,-1 2,1.5 0,-3.5 -2,1.5" fill="#ffffff" />
          <g transform="translate(0, -22)" filter="url(#pt-hud-shadow)">
            <rect x="-38" y="-9" width="76" height="18" rx="9" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.8" />
            <text x="0" y="3.5" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#ffffff">
              NHÀ CỦA BẠN
            </text>
          </g>
        </g>
      )}

      {/* ==================================================================== */}
      {/* 8. REAL-TIME PLAYER CURRENT LOCATION BEACON ("BẠN Ở ĐÂY")            */}
      {/* ==================================================================== */}
      <g transform={`translate(${playerX}, ${playerY})`} filter="url(#pt-hud-shadow)">
        <circle r="22" fill="none" stroke="#0ea5e9" strokeWidth="3" opacity="0.85">
          <animate attributeName="r" values="10;28;10" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <circle r="12" fill="#38bdf8" opacity="0.45" />
        <circle r="8" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
        <circle r="3.5" fill="#ffffff" />

        {/* Floating "BẠN Ở ĐÂY" Badge */}
        <g transform="translate(0, -26)">
          <rect x="-38" y="-9" width="76" height="18" rx="9" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
          <polygon points="-3,9 3,9 0,14" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
          <text x="0" y="3" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#ffffff" letterSpacing="0.3px">
            BẠN Ở ĐÂY
          </text>
        </g>
      </g>
    </svg>
  );
}
