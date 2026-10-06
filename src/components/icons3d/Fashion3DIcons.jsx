import React from 'react';

/**
 * PURE VECTOR 3D ICONS - PLAY TOGETHER CASUAL GAME EDITION
 * Rich 3D Gradients, Specular Highlights, Chunky Volumetric Forms & Shadows.
 */

// 1. LOGO NƠ THỜI TRANG 3D HOÀNG GIA (Sophie's Boutique Ribbon & Golden Hanger)
export function Icon3dFashionLogo({ size = 42, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="fash_ribbon" cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#fdf2f8" />
          <stop offset="30%" stopColor="#f472b6" />
          <stop offset="75%" stopColor="#db2777" />
          <stop offset="100%" stopColor="#9d174d" />
        </radialGradient>
        <radialGradient id="fash_gold" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="45%" stopColor="#facc15" />
          <stop offset="85%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#713f12" />
        </radialGradient>
        <radialGradient id="fash_ruby" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fecdd3" />
          <stop offset="40%" stopColor="#f43f5e" />
          <stop offset="90%" stopColor="#9f1239" />
        </radialGradient>
        <filter id="fash_glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#be185d" floodOpacity="0.35" />
        </filter>
      </defs>
      {/* Móc treo quần áo hoàng kim 3D */}
      <path
        d="M 32 8 C 28 8 26 12 28 15 C 30 18 32 18 32 21"
        fill="none"
        stroke="url(#fash_gold)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 12 36 L 32 23 L 52 36 C 46 38 18 38 12 36 Z"
        fill="url(#fash_gold)"
        stroke="#854d0e"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <ellipse cx="32" cy="35" rx="18" ry="2" fill="#713f12" opacity="0.3" />

      {/* Cánh nơ hồng bồng bềnh 3D */}
      <g filter="url(#fash_glow)">
        {/* Dải nơ rủ xuống */}
        <path d="M 27 34 Q 20 48 16 54 Q 24 50 30 44 Z" fill="url(#fash_ribbon)" stroke="#831843" strokeWidth="1.2" />
        <path d="M 37 34 Q 44 48 48 54 Q 40 50 34 44 Z" fill="url(#fash_ribbon)" stroke="#831843" strokeWidth="1.2" />

        {/* Cánh nơ trái & phải */}
        <ellipse cx="20" cy="30" rx="14" ry="10" transform="rotate(-18 20 30)" fill="url(#fash_ribbon)" stroke="#831843" strokeWidth="1.5" />
        <ellipse cx="44" cy="30" rx="14" ry="10" transform="rotate(18 44 30)" fill="url(#fash_ribbon)" stroke="#831843" strokeWidth="1.5" />

        {/* Highlight bóng sáng trên cánh nơ */}
        <ellipse cx="18" cy="27" rx="9" ry="4" transform="rotate(-18 18 27)" fill="#ffffff" opacity="0.55" />
        <ellipse cx="42" cy="27" rx="9" ry="4" transform="rotate(18 42 27)" fill="#ffffff" opacity="0.55" />

        {/* Nếp gấp ruy băng sâu */}
        <path d="M 23 27 Q 28 30 24 33" stroke="#831843" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M 41 27 Q 36 30 40 33" stroke="#831843" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Nút thắt nơ kim cương Ruby đỏ viền vàng */}
        <circle cx="32" cy="31" r="8" fill="url(#fash_gold)" stroke="#713f12" strokeWidth="1.5" />
        <circle cx="32" cy="31" r="5.5" fill="url(#fash_ruby)" />
        <polygon points="32,27 33.5,30 36,31 33.5,32 32,35 30.5,32 28,31 30.5,30" fill="#ffffff" opacity="0.95" />
      </g>
      {/* Sao lấp lánh Play Together */}
      <polygon points="12,18 13.5,21 16,21.5 13.5,23 12,26 10.5,23 8,21.5 10.5,21" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
      <polygon points="52,14 53,16 55,16.5 53,17.5 52,20 51,17.5 49,16.5 51,16" fill="#fef08a" />
    </svg>
  );
}

// 2. TAB: DÁNG & DA 3D (Body Profile & Skin Swatches)
export function Icon3dTabBody({ size = 30, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <radialGradient id="body_head" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="40%" stopColor="#fed7aa" />
          <stop offset="90%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
        <radialGradient id="body_torso" cx="35%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="90%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
      </defs>
      {/* Chân đế bục mannequin */}
      <ellipse cx="24" cy="42" rx="14" ry="4" fill={active ? '#0369a1' : '#cbd5e1'} />
      <ellipse cx="24" cy="41" rx="13" ry="3.2" fill={active ? '#ffffff' : '#f1f5f9'} />

      {/* Thân mannequin 3D bồng bềnh */}
      <path
        d="M 15 39 C 14 26 18 24 24 24 C 30 24 34 26 33 39 Z"
        fill={active ? '#ffffff' : 'url(#body_torso)'}
        stroke={active ? '#0284c7' : '#0369a1'}
        strokeWidth="2"
      />
      {/* Cột cổ */}
      <rect x="22" y="20" width="4" height="6" rx="2" fill={active ? '#ffffff' : '#fb923c'} stroke={active ? '#0284c7' : '#9a3412'} strokeWidth="1.5" />

      {/* Đầu tròn chibi 3D */}
      <circle cx="24" cy="14" r="9" fill={active ? '#ffffff' : 'url(#body_head)'} stroke={active ? '#0284c7' : '#9a3412'} strokeWidth="2" />
      <ellipse cx="21" cy="11" rx="4" ry="2" fill="#ffffff" opacity={active ? 0 : 0.65} />

      {/* Bảng màu da mini bên cạnh */}
      <circle cx="37" cy="12" r="4.5" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
      <circle cx="37" cy="22" r="4" fill="#fb923c" stroke="#c2410c" strokeWidth="1.5" />
    </svg>
  );
}

// 3. TAB: TÓC & SALON 3D (Play Together Bouncy Anime Hair)
export function Icon3dTabHair({ size = 30, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <radialGradient id="hair_main" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fdf2f8" />
          <stop offset="35%" stopColor="#f472b6" />
          <stop offset="85%" stopColor="#db2777" />
          <stop offset="100%" stopColor="#831843" />
        </radialGradient>
        <linearGradient id="hair_twins" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#be185d" />
        </linearGradient>
      </defs>
      {/* 2 Búi tóc / đuôi tóc bồng bềnh sau lưng */}
      <circle cx="10" cy="26" r="7" fill={active ? '#ffffff' : 'url(#hair_twins)'} stroke={active ? '#0284c7' : '#831843'} strokeWidth="2" />
      <circle cx="38" cy="26" r="7" fill={active ? '#ffffff' : 'url(#hair_twins)'} stroke={active ? '#0284c7' : '#831843'} strokeWidth="2" />

      {/* Khối tóc chính tròn bồng bềnh */}
      <path
        d="M 12 24 C 10 10 38 10 36 24 C 36 30 33 34 29 27 C 27 22 21 22 19 27 C 15 34 12 30 12 24 Z"
        fill={active ? '#ffffff' : 'url(#hair_main)'}
        stroke={active ? '#0284c7' : '#831843'}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Vệt bóng sáng trắng phong cách Anime Play Together */}
      <path
        d="M 17 14 Q 24 9 31 14"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
        opacity={active ? 0 : 0.75}
      />

      {/* Kẹp tóc ngôi sao vàng 3D bên tai */}
      <polygon
        points="34,16 36,20 40,20.5 37,23 38,27 34,24.5 30,27 31,23 28,20.5 32,20"
        fill="#facc15"
        stroke="#ca8a04"
        strokeWidth="1.2"
      />
    </svg>
  );
}

// 4. TAB: ÁO THỜI TRANG 3D (Puffy Casual Hoodie Jacket)
export function Icon3dTabTop({ size = 30, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <radialGradient id="top_jacket" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="35%" stopColor="#38bdf8" />
          <stop offset="85%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#075985" />
        </radialGradient>
      </defs>
      {/* 2 Tay áo phồng 3D */}
      <path d="M 14 18 L 6 28 C 5 32 9 35 12 33 L 17 25 Z" fill={active ? '#ffffff' : 'url(#top_jacket)'} stroke={active ? '#0284c7' : '#0369a1'} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 34 18 L 42 28 C 43 32 39 35 36 33 L 31 25 Z" fill={active ? '#ffffff' : 'url(#top_jacket)'} stroke={active ? '#0284c7' : '#0369a1'} strokeWidth="2" strokeLinejoin="round" />

      {/* Thân áo Hoodie tròn phồng */}
      <path
        d="M 14 16 L 34 16 L 36 38 C 36 41 12 41 12 38 Z"
        fill={active ? '#ffffff' : 'url(#top_jacket)'}
        stroke={active ? '#0284c7' : '#0369a1'}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Mũ trùm / Cổ áo tròn bồng bềnh */}
      <ellipse cx="24" cy="16" rx="9" ry="5" fill={active ? '#e0f2fe' : '#e0f2fe'} stroke={active ? '#0284c7' : '#0369a1'} strokeWidth="2" />
      <path d="M 20 18 Q 24 23 28 18" fill="none" stroke={active ? '#0284c7' : '#0369a1'} strokeWidth="2" strokeLinecap="round" />

      {/* Túi Kangaroo trước bụng 3D */}
      <path
        d="M 17 31 L 31 31 L 29 38 L 19 38 Z"
        fill={active ? '#f0f9ff' : '#0284c7'}
        stroke={active ? '#0284c7' : '#0369a1'}
        strokeWidth="1.5"
      />

      {/* Dây rút mũ trắng có nốt tròn */}
      <line x1="21" y1="20" x2="21" y2="28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="21" cy="28" r="1.5" fill="#facc15" />
      <line x1="27" y1="20" x2="27" y2="26" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="27" cy="26" r="1.5" fill="#facc15" />
    </svg>
  );
}

// 5. TAB: QUẦN & VÁY 3D (Chunky Denim Shorts & Tennis Pleats)
export function Icon3dTabBottom({ size = 30, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <radialGradient id="bot_denim" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="35%" stopColor="#a855f7" />
          <stop offset="85%" stopColor="#7e22ce" />
          <stop offset="100%" stopColor="#581c87" />
        </radialGradient>
      </defs>
      {/* Váy xếp ly / Quần shorts thời trang */}
      <path
        d="M 14 12 L 34 12 L 39 36 C 39 39 9 39 9 36 Z"
        fill={active ? '#ffffff' : 'url(#bot_denim)'}
        stroke={active ? '#0284c7' : '#581c87'}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Đai lưng cạp váy */}
      <rect x="13" y="11" width="22" height="6" rx="2" fill={active ? '#f1f5f9' : '#6b21a8'} stroke={active ? '#0284c7' : '#581c87'} strokeWidth="1.8" />
      <circle cx="24" cy="14" r="1.8" fill="#facc15" stroke="#854d0e" strokeWidth="1" />

      {/* Đường nếp gấp xếp ly 3D viền nổi */}
      <line x1="18" y1="17" x2="16" y2="37" stroke={active ? '#a855f7' : '#c084fc'} strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="17" x2="24" y2="37" stroke={active ? '#a855f7' : '#e9d5ff'} strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="17" x2="32" y2="37" stroke={active ? '#a855f7' : '#c084fc'} strokeWidth="2" strokeLinecap="round" />

      {/* Highlight phản chiếu mềm */}
      <path d="M 15 13 L 33 13" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// 6. TAB: GIÀY DÉP 3D (Chunky Platform Marshmallow Sneaker)
export function Icon3dTabShoes({ size = 30, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <radialGradient id="shoe_body" cx="30%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="40%" stopColor="#34d399" />
          <stop offset="85%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064e3b" />
        </radialGradient>
      </defs>
      {/* Thân giày Sneaker thể thao phồng */}
      <path
        d="M 9 24 C 11 16 20 16 24 20 L 37 20 C 41 20 44 24 43 30 L 7 30 C 7 26 8 24 9 24 Z"
        fill={active ? '#ffffff' : 'url(#shoe_body)'}
        stroke={active ? '#0284c7' : '#064e3b'}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Mũi giày cao su trắng có vân phản chiếu */}
      <path d="M 33 21 C 37 21 42 24 42 30 L 32 30 Z" fill="#ffffff" stroke={active ? '#0284c7' : '#064e3b'} strokeWidth="1.5" />

      {/* Cổ giày & lưỡi gà */}
      <ellipse cx="18" cy="18" rx="6" ry="3" fill="#ffffff" stroke={active ? '#0284c7' : '#064e3b'} strokeWidth="1.5" />

      {/* Dây giày chéo màu cam nổi bật */}
      <line x1="20" y1="21" x2="27" y2="21" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
      <line x1="21" y1="25" x2="28" y2="25" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />

      {/* Đế bánh mì Marshmallow Sole siêu dày 3D */}
      <rect x="5" y="30" width="39" height="8" rx="4" fill="#ffffff" stroke={active ? '#0284c7' : '#064e3b'} strokeWidth="2" />
      <ellipse cx="24.5" cy="37" rx="17" ry="1.5" fill="#047857" opacity="0.3" />

      {/* Rãnh đế thể thao thời trang */}
      <line x1="14" y1="34" x2="18" y2="34" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="34" x2="26" y2="34" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="34" x2="34" y2="34" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 7. TAB: TAI THÚ & PHỤ KIỆN (Play Together Fluffy Cat Ears & Halo)
export function Icon3dTabEars({ size = 30, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <radialGradient id="ears_fur" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="40%" stopColor="#fb923c" />
          <stop offset="85%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#9a3412" />
        </radialGradient>
        <radialGradient id="ears_pink" cx="40%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#ffe4e6" />
          <stop offset="70%" stopColor="#fda4af" />
          <stop offset="100%" stopColor="#f43f5e" />
        </radialGradient>
      </defs>
      {/* Gọng cài tóc đen cong 3D */}
      <path d="M 8 36 C 8 16 40 16 40 36" stroke={active ? '#ffffff' : '#334155'} strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Tai mèo trái phồng 3D */}
      <path
        d="M 10 32 C 8 16 12 8 20 18 C 21 27 15 32 10 32 Z"
        fill={active ? '#ffffff' : 'url(#ears_fur)'}
        stroke={active ? '#0284c7' : '#9a3412'}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Lòng tai hồng xinh xắn */}
      <path d="M 12 28 C 11 19 14 14 17 21 C 18 26 14 28 12 28 Z" fill="url(#ears_pink)" />

      {/* Tai mèo phải phồng 3D */}
      <path
        d="M 38 32 C 40 16 36 8 28 18 C 27 27 33 32 38 32 Z"
        fill={active ? '#ffffff' : 'url(#ears_fur)'}
        stroke={active ? '#0284c7' : '#9a3412'}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Lòng tai hồng xinh xắn */}
      <path d="M 36 28 C 37 19 34 14 31 21 C 30 26 34 28 36 28 Z" fill="url(#ears_pink)" />

      {/* Charm chuông vàng leng keng ở giữa */}
      <circle cx="24" cy="20" r="4.5" fill="#facc15" stroke="#a16207" strokeWidth="1.5" />
      <polygon points="24,18 25,19.5 27,20 25,20.5 24,22 23,20.5 21,20 23,19.5" fill="#ffffff" />
    </svg>
  );
}

// 8. TAB: KHUÔN MẶT & BIỂU CẢM (Sparkling Anime Chibi Face)
export function Icon3dTabFace({ size = 30, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <radialGradient id="face_skin" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="45%" stopColor="#fef3c7" />
          <stop offset="85%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
      </defs>
      {/* Khuôn mặt chibi tròn trĩnh 3D */}
      <circle cx="24" cy="24" r="18" fill={active ? '#ffffff' : 'url(#face_skin)'} stroke={active ? '#0284c7' : '#ea580c'} strokeWidth="2.2" />

      {/* Má hồng trái tim siêu dễ thương */}
      <ellipse cx="14" cy="28" rx="3.5" ry="2" fill="#fb7185" opacity="0.85" />
      <ellipse cx="34" cy="28" rx="3.5" ry="2" fill="#fb7185" opacity="0.85" />

      {/* Mắt trái Anime to tròn lấp lánh */}
      <ellipse cx="16" cy="21" rx="4.5" ry="6" fill="#1e1b4b" />
      <circle cx="15" cy="19" r="2" fill="#ffffff" />
      <circle cx="17.5" cy="23.5" r="1" fill="#ffffff" />

      {/* Mắt phải Anime to tròn lấp lánh */}
      <ellipse cx="32" cy="21" rx="4.5" ry="6" fill="#1e1b4b" />
      <circle cx="31" cy="19" r="2" fill="#ffffff" />
      <circle cx="33.5" cy="23.5" r="1" fill="#ffffff" />

      {/* Miệng mèo cười chúm chím :3 */}
      <path
        d="M 21 28 Q 24 31 24 28 Q 24 31 27 28"
        stroke="#be123c"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// 9. TAB: FULL SET TRỌN BỘ 3D (Golden Star Magic Fashion Chest)
export function Icon3dTabSets({ size = 30, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <radialGradient id="set_gold" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="40%" stopColor="#facc15" />
          <stop offset="85%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#854d0e" />
        </radialGradient>
        <radialGradient id="set_ruby" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#9d174d" />
        </radialGradient>
      </defs>
      {/* Hộp quà thời trang vàng kim 3D */}
      <rect x="9" y="17" width="30" height="23" rx="4" fill={active ? '#ffffff' : 'url(#set_gold)'} stroke={active ? '#0284c7' : '#713f12'} strokeWidth="2" />
      {/* Nắp hộp quà viền rộng */}
      <rect x="7" y="13" width="34" height="8" rx="3" fill={active ? '#ffffff' : 'url(#set_gold)'} stroke={active ? '#0284c7' : '#713f12'} strokeWidth="2" />

      {/* Ruy băng hồng tím quấn hộp */}
      <rect x="22" y="13" width="4" height="27" fill={active ? '#0284c7' : 'url(#set_ruby)'} />

      {/* Chiếc nơ 3D trên nắp hộp */}
      <ellipse cx="18" cy="11" rx="5" ry="3.5" transform="rotate(-15 18 11)" fill="url(#set_ruby)" stroke="#831843" strokeWidth="1.2" />
      <ellipse cx="30" cy="11" rx="5" ry="3.5" transform="rotate(15 30 11)" fill="url(#set_ruby)" stroke="#831843" strokeWidth="1.2" />
      <circle cx="24" cy="11" r="2.5" fill="#facc15" stroke="#854d0e" strokeWidth="1" />

      {/* Ngôi sao ma thuật lấp lánh Play Together */}
      <polygon points="38,8 39.5,12 43,12.5 40,15 41,19 38,16.5 35,19 36,15 33,12.5 36.5,12" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
    </svg>
  );
}

// 10. TAB: TỦ ĐỒ CỦA TÔI (Boutique Wardrobe Armoire)
export function Icon3dTabWardrobe({ size = 30, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <radialGradient id="wardrobe_body" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="85%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
      </defs>
      {/* 2 Chân tủ */}
      <rect x="11" y="41" width="5" height="4" rx="2" fill="#78350f" />
      <rect x="32" y="41" width="5" height="4" rx="2" fill="#78350f" />

      {/* Thân tủ quần áo 3D */}
      <rect x="9" y="8" width="30" height="34" rx="4" fill={active ? '#ffffff' : 'url(#wardrobe_body)'} stroke={active ? '#0284c7' : '#451a03'} strokeWidth="2" />

      {/* Mái vòm tủ phong cách hoàng gia */}
      <path d="M 8 9 Q 24 4 40 9" stroke={active ? '#0284c7' : '#451a03'} strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Khe giữa 2 cánh cửa */}
      <line x1="24" y1="8" x2="24" y2="36" stroke={active ? '#0284c7' : '#78350f'} strokeWidth="2" />
      {/* Ngăn kéo dưới */}
      <line x1="9" y1="36" x2="39" y2="36" stroke={active ? '#0284c7' : '#78350f'} strokeWidth="2" />

      {/* 2 Tay nắm tủ mạ vàng tròn bóng */}
      <circle cx="21" cy="22" r="2.2" fill="#facc15" stroke="#854d0e" strokeWidth="1.2" />
      <circle cx="27" cy="22" r="2.2" fill="#facc15" stroke="#854d0e" strokeWidth="1.2" />
      <circle cx="24" cy="38.5" r="1.5" fill="#facc15" stroke="#854d0e" strokeWidth="1" />
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

