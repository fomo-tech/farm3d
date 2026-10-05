import React from 'react';

/**
 * PURE VECTOR 3D ICONS - PLAY TOGETHER FASHION & BOUTIQUE EDITION
 * 100% Thuần Vector & Gradient 3D, Tuyệt đối không dùng Emoji.
 */

// 1. LOGO NƠ THỜI TRANG 3D (Sophie's Boutique Ribbon Bow)
export function Icon3dFashionLogo({ size = 42, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="bow_pink" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="40%" stopColor="#f472b6" />
          <stop offset="85%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#be185d" />
        </radialGradient>
        <radialGradient id="gem_gold" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>
      </defs>
      {/* 2 Cánh nơ bồng bềnh */}
      <ellipse cx="19" cy="30" rx="14" ry="11" transform="rotate(-15 19 30)" fill="url(#bow_pink)" stroke="#9d174d" strokeWidth="2" />
      <ellipse cx="45" cy="30" rx="14" ry="11" transform="rotate(15 45 30)" fill="url(#bow_pink)" stroke="#9d174d" strokeWidth="2" />
      {/* Nếp gấp ruy băng trong cánh nơ */}
      <ellipse cx="20" cy="30" rx="6" ry="4" fill="#9d174d" opacity="0.6" transform="rotate(-15 20 30)" />
      <ellipse cx="44" cy="30" rx="6" ry="4" fill="#9d174d" opacity="0.6" transform="rotate(15 44 30)" />
      {/* 2 Dải đuôi ruy băng rủ xuống */}
      <path d="M 26 36 L 16 54 L 26 48 L 32 38 Z" fill="url(#bow_pink)" stroke="#9d174d" strokeWidth="1.5" />
      <path d="M 38 36 L 48 54 L 38 48 L 32 38 Z" fill="url(#bow_pink)" stroke="#9d174d" strokeWidth="1.5" />
      {/* Viên ngọc hoàng kim ở tâm nơ */}
      <circle cx="32" cy="32" r="7.5" fill="url(#gem_gold)" stroke="#854d0e" strokeWidth="1.8" />
      <polygon points="32,27 34,31 38,32 34,33 32,37 30,33 26,32 30,31" fill="#ffffff" />
    </svg>
  );
}

// 2. TAB: DÁNG CƠ THỂ 3D (Body Profile)
export function Icon3dTabBody({ size = 22, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <radialGradient id="body_skin" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="70%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
      </defs>
      {/* Đầu tròn chibi */}
      <circle cx="16" cy="9" r="6" fill={active ? '#ffffff' : 'url(#body_skin)'} stroke={active ? '#0284c7' : '#9a3412'} strokeWidth="1.5" />
      {/* Thân & vai */}
      <path
        d="M 9 27 C 9 18, 23 18, 23 27 Z"
        fill={active ? '#ffffff' : '#38bdf8'}
        stroke={active ? '#0284c7' : '#0369a1'}
        strokeWidth="1.5"
      />
    </svg>
  );
}

// 3. TAB: TÓC & SALON 3D (Hair & Salon)
export function Icon3dTabHair({ size = 22, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="hair_tab_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
      </defs>
      {/* Kiểu tóc đuôi ngựa / bồng bềnh */}
      <path
        d="M 16 5 C 9 5, 6 12, 6 18 C 6 22, 10 21, 10 18 C 10 14, 12 12, 16 12 C 20 12, 22 14, 22 18 C 22 21, 26 22, 26 18 C 26 12, 23 5, 16 5 Z"
        fill={active ? '#ffffff' : 'url(#hair_tab_grad)'}
        stroke={active ? '#be185d' : '#831843'}
        strokeWidth="1.5"
      />
      {/* Kẹp tóc ngôi sao vàng */}
      <circle cx="21" cy="9" r="2" fill="#facc15" />
    </svg>
  );
}

// 4. TAB: ÁO THỜI TRANG 3D (Tops)
export function Icon3dTabTop({ size = 22, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M 12 5 L 20 5 L 27 10 L 23 14 L 21 12 L 21 27 L 11 27 L 11 12 L 9 14 L 5 10 Z"
        fill={active ? '#ffffff' : '#3b82f6'}
        stroke={active ? '#1d4ed8' : '#1e3a8a'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Cổ áo chữ V */}
      <path d="M 13 5 Q 16 10 19 5" stroke={active ? '#1d4ed8' : '#ffffff'} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// 5. TAB: QUẦN & VÁY 3D (Bottoms)
export function Icon3dTabBottom({ size = 22, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Váy tennis xếp ly / quần shorts */}
      <path
        d="M 9 8 L 23 8 L 26 24 L 6 24 Z"
        fill={active ? '#ffffff' : '#a855f7'}
        stroke={active ? '#7e22ce' : '#581c87'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Đường ly xếp nếp */}
      <line x1="12" y1="9" x2="11" y2="24" stroke={active ? '#7e22ce' : '#c084fc'} strokeWidth="1.2" />
      <line x1="16" y1="9" x2="16" y2="24" stroke={active ? '#7e22ce' : '#c084fc'} strokeWidth="1.2" />
      <line x1="20" y1="9" x2="21" y2="24" stroke={active ? '#7e22ce' : '#c084fc'} strokeWidth="1.2" />
    </svg>
  );
}

// 6. TAB: GIÀY DÉP 3D (Shoes / Sneakers)
export function Icon3dTabShoes({ size = 22, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Sneaker đế bánh mì Chunky */}
      <path
        d="M 6 17 C 8 11, 14 11, 16 15 L 25 15 C 27 15, 29 18, 28 22 L 4 22 C 4 19, 5 17, 6 17 Z"
        fill={active ? '#ffffff' : '#10b981'}
        stroke={active ? '#047857' : '#064e3b'}
        strokeWidth="1.5"
      />
      {/* Đế giày cao su dày */}
      <rect x="3" y="22" width="26" height="5" rx="2.5" fill={active ? '#e2e8f0' : '#ffffff'} stroke={active ? '#047857' : '#064e3b'} strokeWidth="1.2" />
    </svg>
  );
}

// 7. TAB: TAI THÚ & PHỤ KIỆN (Animal Ears / Hats)
export function Icon3dTabEars({ size = 22, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* 2 Tai mèo nhọn xinh xắn */}
      <polygon points="6,24 10,7 18,17" fill={active ? '#ffffff' : '#f43f5e'} stroke={active ? '#be123c' : '#881337'} strokeWidth="1.5" />
      <polygon points="9,21 11,11 16,17" fill={active ? '#fecdd3' : '#fecdd3'} />
      <polygon points="26,24 22,7 14,17" fill={active ? '#ffffff' : '#f43f5e'} stroke={active ? '#be123c' : '#881337'} strokeWidth="1.5" />
      <polygon points="23,21 21,11 16,17" fill={active ? '#fecdd3' : '#fecdd3'} />
    </svg>
  );
}

// 8. TAB: KHUÔN MẶT & BIỂU CẢM (Face / Expressions)
export function Icon3dTabFace({ size = 22, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" fill={active ? '#ffffff' : '#fef08a'} stroke={active ? '#ca8a04' : '#854d0e'} strokeWidth="1.5" />
      {/* 2 Mắt anime cười cong tít */}
      <path d="M 10 14 Q 13 11 15 14" stroke={active ? '#ca8a04' : '#713f12'} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M 17 14 Q 19 11 22 14" stroke={active ? '#ca8a04' : '#713f12'} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Miệng cười xinh */}
      <path d="M 13 20 Q 16 24 19 20" stroke={active ? '#ca8a04' : '#713f12'} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* 2 Má hồng */}
      <circle cx="9" cy="18" r="2" fill="#f43f5e" opacity="0.75" />
      <circle cx="23" cy="18" r="2" fill="#f43f5e" opacity="0.75" />
    </svg>
  );
}

// 9. TAB: FULL SET TRỌN BỘ 3D (Full Sets)
export function Icon3dTabSets({ size = 22, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Hộp quà màu vàng óng */}
      <rect x="6" y="11" width="20" height="15" rx="3" fill={active ? '#ffffff' : '#f59e0b'} stroke={active ? '#b45309' : '#78350f'} strokeWidth="1.5" />
      <rect x="4" y="8" width="24" height="5" rx="2" fill={active ? '#ffffff' : '#fbbf24'} stroke={active ? '#b45309' : '#78350f'} strokeWidth="1.5" />
      {/* Ruy băng đỏ */}
      <line x1="16" y1="8" x2="16" y2="26" stroke="#ef4444" strokeWidth="2.5" />
      {/* Nơ trên đỉnh */}
      <circle cx="16" cy="6" r="3" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
    </svg>
  );
}

// 10. TAB: TỦ ĐỒ CỦA TÔI (My Wardrobe)
export function Icon3dTabWardrobe({ size = 22, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Tủ đồ gỗ 2 cánh */}
      <rect x="5" y="4" width="22" height="24" rx="3" fill={active ? '#ffffff' : '#d97706'} stroke={active ? '#92400e' : '#451a03'} strokeWidth="1.5" />
      <line x1="16" y1="4" x2="16" y2="28" stroke={active ? '#92400e' : '#78350f'} strokeWidth="1.5" />
      {/* 2 Tay nắm tủ */}
      <circle cx="14" cy="16" r="1.5" fill="#fef08a" stroke="#854d0e" strokeWidth="0.8" />
      <circle cx="18" cy="16" r="1.5" fill="#fef08a" stroke="#854d0e" strokeWidth="0.8" />
    </svg>
  );
}

// CAMERA TOOLS
export function Icon3dCamBody({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

export function Icon3dCamFace({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function Icon3dRotateTurntable({ size = 18, direction = 'left' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {direction === 'left' ? (
        <>
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </>
      ) : (
        <>
          <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
        </>
      )}
    </svg>
  );
}

export function Icon3dPoseSparkle({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
    </svg>
  );
}

export function Icon3dPoseWaveHand({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 9V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 9V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 13a4 4 0 0 0 4 4h4a6 6 0 0 0 6-6V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3" fill="#fed7aa" stroke="#f97316" strokeWidth="1.5" />
    </svg>
  );
}

// CÁC TƯ THẾ THỜI TRANG ĐÁNG YÊU (PLAY TOGETHER POSES)
export function Icon3dPoseHeart({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="pose_heart_grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="60%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#be123c" />
        </radialGradient>
      </defs>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="url(#pose_heart_grad)"
        stroke="#9f1239"
        strokeWidth="1.2"
      />
      <circle cx="8" cy="7.5" r="1.5" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}

export function Icon3dPoseIdol({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="pose_star_grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </radialGradient>
      </defs>
      <polygon
        points="12,2 15,8.5 22,9.3 17,14.1 18.5,21 12,17.3 5.5,21 7,14.1 2,9.3 9,8.5"
        fill="url(#pose_star_grad)"
        stroke="#713f12"
        strokeWidth="1.2"
      />
      <circle cx="12" cy="11" r="2.2" fill="#ffffff" />
    </svg>
  );
}

export function Icon3dPoseCheer({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="cheer_cone" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="70%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
      </defs>
      <path d="M4 19L11 6L16 11L9 24Z" fill="url(#cheer_cone)" stroke="#9a3412" strokeWidth="1.2" />
      <circle cx="17" cy="4" r="2" fill="#38bdf8" />
      <circle cx="21" cy="8" r="1.6" fill="#f43f5e" />
      <circle cx="19" cy="14" r="2.2" fill="#eab308" />
      <path d="M13 3L14 5M16 2L17 4M19 5L21 6" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Icon3dPoseShy({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="#fce7f3" stroke="#db2777" strokeWidth="1.4" />
      {/* Mắt nhắm e thẹn (⌒ ⌒) */}
      <path d="M7.5 11C8.2 9.8 9.8 9.8 10.5 11" stroke="#9d174d" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.5 11C14.2 9.8 15.8 9.8 16.5 11" stroke="#9d174d" strokeWidth="1.5" strokeLinecap="round" />
      {/* 2 Vết má hồng xinh */}
      <ellipse cx="7" cy="14.5" rx="2.5" ry="1.4" fill="#f43f5e" opacity="0.75" />
      <ellipse cx="17" cy="14.5" rx="2.5" ry="1.4" fill="#f43f5e" opacity="0.75" />
      {/* Miệng chúm chím */}
      <circle cx="12" cy="15" r="1.3" fill="#be185d" />
    </svg>
  );
}

export function Icon3dPoseSpin({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 2" />
      <polygon points="12,1 15,5 12,5" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1" />
      <circle cx="12" cy="12" r="4" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1.5" />
    </svg>
  );
}

// BỘ ĐIỀU KHIỂN BÀN XOAY (TURNTABLE CONTROLS)
export function Icon3dAutoRotate({ size = 18, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="15" rx="9" ry="4" stroke={active ? '#38bdf8' : '#94a3b8'} strokeWidth="2" strokeDasharray="4 2" />
      <line x1="12" y1="4" x2="12" y2="15" stroke={active ? '#0284c7' : '#64748b'} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 13.5L21 15L18 16.5Z" fill={active ? '#0284c7' : '#64748b'} />
      <circle cx="12" cy="4" r="2.5" fill={active ? '#38bdf8' : '#94a3b8'} />
    </svg>
  );
}

export function Icon3dAngleFront({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="6" r="3.2" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.2" />
      <path d="M5.5 16C5.5 12.5 14.5 12.5 14.5 16Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.2" />
    </svg>
  );
}

export function Icon3dAngleSide({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="6" r="3.2" fill="#a78bfa" stroke="#6d28d9" strokeWidth="1.2" />
      <path d="M6 16C6 13 12 13 13 16Z" fill="#a78bfa" stroke="#6d28d9" strokeWidth="1.2" />
    </svg>
  );
}

export function Icon3dAngleBack({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="6" r="3.2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.2" />
      <path d="M5.5 16C5.5 12.5 14.5 12.5 14.5 16Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.2" />
    </svg>
  );
}

export function Icon3dAngleQuarter({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="9.5" cy="6" r="3.2" fill="#f472b6" stroke="#db2777" strokeWidth="1.2" />
      <path d="M5.5 16C6 12.8 13.5 12.8 14 16Z" fill="#f472b6" stroke="#db2777" strokeWidth="1.2" />
    </svg>
  );
}

