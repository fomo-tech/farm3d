import React from 'react';

/**
 * 3D STYLIZED GAME OBJECT ICONS (CRISP VECTOR EDITION)
 * Dựng 100% thuần vector hình khối, gradient đa tầng, không dùng SVG feFilters
 * để đảm bảo độ sắc nét vô cực (Ultra-crisp) trên màn hình Retina / 4K.
 */

// 1. Găng tay da 3D (Hand / Interact)
export function Icon3dHand({ size = 46, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="glove_leather" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <radialGradient id="glove_cuff" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </radialGradient>
      </defs>
      {/* Cổ tay găng da */}
      <rect x="18" y="44" width="28" height="13" rx="5" fill="url(#glove_cuff)" stroke="#431407" strokeWidth="2" />
      <circle cx="32" cy="50.5" r="3.2" fill="#fef08a" stroke="#78350f" strokeWidth="1.5" />

      {/* Bàn tay da bò 3D */}
      <path
        d="M 22 45 C 18 36, 17 28, 20 22 C 22 18, 26 19, 27 24 C 28 17, 33 17, 34 23 C 35 15, 41 15, 42 22 C 43 17, 48 18, 48 25 C 49 32, 48 38, 43 45 Z"
        fill="url(#glove_leather)"
        stroke="#451a03"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Ngón cái gập */}
      <path
        d="M 20 33 C 14 30, 11 36, 15 41 C 18 44, 23 42, 23 37 Z"
        fill="url(#glove_leather)"
        stroke="#451a03"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Chỉ thêu viền vàng trang trí */}
      <path d="M 24 35 Q 32 39 40 35" stroke="#fef08a" strokeWidth="2" strokeDasharray="3 2" strokeLinecap="round" />
      {/* Ánh sáng bóng trên ngón tay */}
      <ellipse cx="34" cy="22" rx="2.5" ry="4.5" fill="#ffffff" opacity="0.75" transform="rotate(-5 34 22)" />
      <ellipse cx="27" cy="24" rx="2" ry="3.5" fill="#ffffff" opacity="0.65" transform="rotate(-15 27 24)" />
    </svg>
  );
}

// 2. Cuốc làm đất 3D (Hoe / Till Soil)
export function Icon3dHoe({ size = 46, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="hoe_handle" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="40%" stopColor="#d97706" />
          <stop offset="70%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="hoe_steel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#cbd5e1" />
          <stop offset="75%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      {/* Cán gỗ sồi dài chéo 40 độ */}
      <rect
        x="28.5"
        y="4"
        width="7.5"
        height="54"
        rx="3.75"
        transform="rotate(-40 32 31)"
        fill="url(#hoe_handle)"
        stroke="#451a03"
        strokeWidth="1.8"
      />
      {/* Đai kim loại gắn cổ cuốc */}
      <rect
        x="35"
        y="15"
        width="11"
        height="8.5"
        rx="2"
        transform="rotate(-40 40 19)"
        fill="#facc15"
        stroke="#78350f"
        strokeWidth="1.5"
      />
      {/* Lưỡi cuốc thép rèn 3D */}
      <path
        d="M 44 11 L 55 18 C 56 20, 53 26, 46 31 L 35 22 Z"
        fill="url(#hoe_steel)"
        stroke="#0f172a"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Lưỡi sắc bén chém đất */}
      <path d="M 55 18 L 46 31" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      {/* Ngôi sao ánh kim phản chiếu lấp lánh */}
      <polygon points="51,13 53,18 58,20 53,22 51,27 49,22 44,20 49,18" fill="#ffffff" />
    </svg>
  );
}

// 3. Túi hạt giống 3D (Seeds / Plant)
export function Icon3dSeeds({ size = 46, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="sack_body" cx="40%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>
        <linearGradient id="leaf_grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>
      </defs>
      {/* Mầm lá non đâm chồi từ miệng túi */}
      <path
        d="M 32 18 C 30 10, 22 7, 19 11 C 16 15, 21 22, 32 20 Z"
        fill="url(#leaf_grad)"
        stroke="#14532d"
        strokeWidth="1.8"
      />
      <path
        d="M 32 19 C 35 9, 44 8, 45 13 C 46 19, 39 23, 32 20 Z"
        fill="url(#leaf_grad)"
        stroke="#14532d"
        strokeWidth="1.8"
      />

      {/* Túi vải đay căng tròn */}
      <path
        d="M 23 23 C 25 18, 39 18, 41 23 C 49 24, 54 33, 51 47 C 49 56, 15 56, 13 47 C 10 33, 15 24, 23 23 Z"
        fill="url(#sack_body)"
        stroke="#451a03"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Nơ dây dù đỏ buộc cổ túi */}
      <rect x="21" y="21" width="22" height="6" rx="3" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
      <circle cx="32" cy="24" r="3.5" fill="#f87171" stroke="#7f1d1d" strokeWidth="1.2" />
      <path d="M 29 26 L 24 33" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <path d="M 35 26 L 40 33" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />

      {/* Củ cà rốt nhỏ thêu trên thân túi */}
      <path d="M 32 33 L 27 45 C 29 47, 35 47, 37 45 Z" fill="#ea580c" stroke="#7c2d12" strokeWidth="1.5" />
      <path d="M 29 33 C 29 29, 35 29, 35 33 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
    </svg>
  );
}

// 4. Bình tưới nước 3D (Watering Can / Water)
export function Icon3dWateringCan({ size = 46, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="can_body" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="40%" stopColor="#38bdf8" />
          <stop offset="85%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
        <radialGradient id="water_drop" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#7dd3fc" />
          <stop offset="85%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
      </defs>
      {/* Quai cầm phía sau */}
      <path
        d="M 17 26 C 7 26, 6 46, 17 48"
        stroke="#0369a1"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 17 26 C 7 26, 6 46, 17 48"
        stroke="#7dd3fc"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Thân bình tưới trụ tròn */}
      <rect x="15" y="24" width="28" height="27" rx="9" fill="url(#can_body)" stroke="#0c4a6e" strokeWidth="2.2" />
      {/* Vệt sáng bóng kim loại */}
      <ellipse cx="23" cy="30" rx="3.5" ry="6" fill="#ffffff" opacity="0.75" transform="rotate(-15 23 30)" />

      {/* Vòi phun vươn dài chéo */}
      <path
        d="M 38 40 L 52 21"
        stroke="#0284c7"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 38 40 L 52 21"
        stroke="#bae6fd"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Đầu hoa sen đục lỗ bằng đồng */}
      <polygon points="48,16 57,22 55,27 46,21" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />

      {/* Giọt nước trong vắt lơ lửng */}
      <path
        d="M 54 34 C 54 34, 61 41, 61 44.5 C 61 48, 58 51, 54 51 C 50 51, 47 48, 47 44.5 C 47 41, 54 34, 54 34 Z"
        fill="url(#water_drop)"
        stroke="#0284c7"
        strokeWidth="1.8"
      />
      <ellipse cx="51.5" cy="43" rx="2" ry="3" fill="#ffffff" opacity="0.85" />
    </svg>
  );
}

// 5. Giỏ thu hoạch 3D (Basket / Harvest)
export function Icon3dBasket({ size = 46, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="basket_weave" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>
      </defs>
      {/* Quai giỏ mây vòng lên */}
      <path
        d="M 16 32 C 16 11, 48 11, 48 32"
        stroke="#92400e"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 16 32 C 16 11, 48 11, 48 32"
        stroke="#fde68a"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Quả táo đỏ */}
      <circle cx="25" cy="27" r="7.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
      <ellipse cx="23" cy="24" rx="2.5" ry="2" fill="#ffffff" opacity="0.75" />
      {/* Củ cà rốt ló ngọn */}
      <path d="M 33 18 L 46 30 L 40 34 Z" fill="#ea580c" stroke="#7c2d12" strokeWidth="1.5" />
      <path d="M 32 17 L 29 13" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
      <path d="M 34 17 L 36 12" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />

      {/* Bắp ngô vàng óng */}
      <ellipse cx="38" cy="27" rx="6.5" ry="4.5" transform="rotate(-25 38 27)" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />

      {/* Thân giỏ mây đan 3D */}
      <path
        d="M 12 30 C 14 48, 18 55, 32 55 C 46 55, 50 48, 52 30 Z"
        fill="url(#basket_weave)"
        stroke="#451a03"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Vành giỏ bo tròn */}
      <ellipse cx="32" cy="30" rx="21" ry="5.8" fill="#d97706" stroke="#451a03" strokeWidth="2.2" />
      <ellipse cx="32" cy="30" rx="18.5" ry="3.8" fill="#fef3c7" opacity="0.7" />
    </svg>
  );
}

// 6. Đồng tiền vàng 3D (Gold Coin)
export function Icon3dGoldCoin({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="coin_face" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#facc15" />
          <stop offset="85%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
      </defs>
      {/* Viền dày 3D */}
      <circle cx="24" cy="24" r="21" fill="#a16207" stroke="#451a03" strokeWidth="1.5" />
      {/* Mặt đồng xu */}
      <circle cx="24" cy="22.5" r="19.5" fill="url(#coin_face)" stroke="#fef9c3" strokeWidth="2" />
      {/* Bông lúa mạch */}
      <path
        d="M 24 13 L 24 32 M 20 18 Q 24 21 28 18 M 19 23 Q 24 26 29 23 M 20 28 Q 24 31 28 28"
        stroke="#713f12"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <polygon points="15,10 16.5,13 19.5,14 16.5,15 15,18 13.5,15 10.5,14 13.5,13" fill="#ffffff" />
    </svg>
  );
}

// 7. Đá quý Kim Cương 3D (Gem / Crystal)
export function Icon3dGem({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="gem_top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <polygon points="16,8 32,8 40,18 8,18" fill="url(#gem_top)" stroke="#312e81" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="8,18 24,42 16,18" fill="#6366f1" stroke="#312e81" strokeWidth="1.2" />
      <polygon points="16,18 24,42 32,18" fill="#818cf8" stroke="#312e81" strokeWidth="1.2" />
      <polygon points="32,18 24,42 40,18" fill="#4338ca" stroke="#1e1b4b" strokeWidth="1.2" />
      <polygon points="20,10 28,10 26,14 18,14" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

// 8. Củ cà rốt 3D (Carrot / Free Seed Badge)
export function Icon3dCarrot({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="carrot_skin" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="45%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </radialGradient>
      </defs>
      {/* Cuống lá xanh */}
      <path d="M 24 14 C 23 7, 16 5, 15 8 C 14 11, 20 15, 23 15 Z" fill="#22c55e" stroke="#14532d" strokeWidth="1.2" />
      <path d="M 24 14 C 25 6, 32 4, 33 7 C 34 10, 28 15, 25 15 Z" fill="#4ade80" stroke="#14532d" strokeWidth="1.2" />
      <path d="M 24 14 L 24 5" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />

      {/* Thân củ cà rốt */}
      <path
        d="M 16 15 C 19 14, 29 14, 32 15 C 34 22, 29 36, 24 43 C 19 36, 14 22, 16 15 Z"
        fill="url(#carrot_skin)"
        stroke="#431407"
        strokeWidth="1.8"
      />
      <path d="M 19 22 Q 24 23 28 21" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 20 29 Q 24 30 27 28" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="20" cy="18" rx="2.5" ry="3.5" fill="#ffffff" opacity="0.7" transform="rotate(-15 20 18)" />
    </svg>
  );
}

// 9. Cuộn giấy da & La bàn 3D (Bản đồ / Map)
export function Icon3dMap({ size = 38, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none" className={`icon-3d ${className}`}>
      <rect x="10" y="10" width="34" height="28" rx="4" fill="#fef3c7" stroke="#78350f" strokeWidth="2" transform="rotate(-8 27 24)" />
      <circle cx="8" cy="17" r="5" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
      <circle cx="43" cy="30" r="5" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
      <path d="M 16 26 Q 22 20 28 27 T 38 20" stroke="#b45309" strokeWidth="2" strokeDasharray="2 3" fill="none" />
      <path d="M 36 18 L 40 22 M 40 18 L 36 22" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />

      {/* La bàn đồng 3D */}
      <circle cx="36" cy="36" r="13" fill="#eab308" stroke="#451a03" strokeWidth="2" />
      <circle cx="36" cy="36" r="9.5" fill="#fef08a" stroke="#a16207" strokeWidth="1.2" />
      <polygon points="36,28 39.5,36 36,34 32.5,36" fill="#dc2626" />
      <polygon points="36,44 39.5,36 36,38 32.5,36" fill="#2563eb" />
      <circle cx="36" cy="36" r="2.5" fill="#451a03" />
    </svg>
  );
}

// 10. Balo phiêu lưu da bò 3D (Kho đồ / Backpack / Inventory)
export function Icon3dBackpack({ size = 38, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none" className={`icon-3d ${className}`}>
      {/* Quai xách trên đỉnh */}
      <path d="M 21 14 C 21 7, 33 7, 33 14" stroke="#78350f" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M 21 14 C 21 7, 33 7, 33 14" stroke="#fde68a" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Thân balo bo tròn */}
      <rect x="12" y="14" width="30" height="32" rx="9" fill="#d97706" stroke="#451a03" strokeWidth="2.2" />
      {/* Nắp balo */}
      <path d="M 11 21 C 11 13, 43 13, 43 21 C 37 27, 17 27, 11 21 Z" fill="#92400e" stroke="#451a03" strokeWidth="2" />
      {/* Túi phụ phía trước */}
      <rect x="17" y="27" width="20" height="15" rx="5" fill="#b45309" stroke="#451a03" strokeWidth="1.8" />
      {/* Khóa cài kim loại mạ vàng */}
      <rect x="25" y="23" width="4" height="7.5" rx="1.5" fill="#facc15" stroke="#451a03" strokeWidth="1" />
      <rect x="25" y="32" width="4" height="4.5" rx="1" fill="#facc15" stroke="#451a03" strokeWidth="1" />
    </svg>
  );
}

// 11. Hòm gỗ đóng dấu sáp đỏ 3D (Đơn hàng / Orders)
export function Icon3dOrdersBox({ size = 38, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none" className={`icon-3d ${className}`}>
      <polygon points="27,10 44,19 27,27 10,19" fill="#fde68a" stroke="#451a03" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="10,19 27,27 27,45 10,36" fill="#d97706" stroke="#451a03" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="27,27 44,19 44,36 27,45" fill="#92400e" stroke="#451a03" strokeWidth="2" strokeLinejoin="round" />
      {/* Đai nẹp kim loại vàng */}
      <path d="M 18 15 L 18 41 M 36 15 L 36 41" stroke="#facc15" strokeWidth="3" opacity="0.9" />
      {/* Dấu sáp niêm phong đỏ rực */}
      <circle cx="27" cy="27" r="6.5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1.5" />
      <circle cx="27" cy="27" r="4.2" fill="#ef4444" />
      <path d="M 27 23 L 27 31 M 23 27 L 31 27" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 12. Gian hàng chợ bạt sọc đỏ trắng 3D (Chợ ven đường / Roadside Market)
export function Icon3dMarketStall({ size = 38, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none" className={`icon-3d ${className}`}>
      {/* Quầy gỗ phía dưới */}
      <rect x="12" y="27" width="30" height="19" rx="3" fill="#d97706" stroke="#451a03" strokeWidth="2" />
      <line x1="12" y1="36" x2="42" y2="36" stroke="#78350f" strokeWidth="2" />
      {/* Cột chống */}
      <line x1="14" y1="18" x2="14" y2="28" stroke="#78350f" strokeWidth="2.5" />
      <line x1="40" y1="18" x2="40" y2="28" stroke="#78350f" strokeWidth="2.5" />
      {/* Mái bạt sọc đỏ trắng */}
      <path d="M 10 18 L 12 9 L 42 9 L 44 18 Z" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />
      <polygon points="12,9 18,9 17,18 10,18" fill="#ef4444" />
      <polygon points="24,9 30,9 31,18 25,18" fill="#ef4444" />
      <polygon points="36,9 42,9 44,18 38,18" fill="#ef4444" />
      <circle cx="27" cy="35" r="5" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />
    </svg>
  );
}

// 13. Sổ nhiệm vụ & Ngôi sao vàng 3D (Quests)
export function Icon3dQuestBook({ size = 38, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none" className={`icon-3d ${className}`}>
      <rect x="12" y="11" width="30" height="34" rx="5" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2.2" />
      <path d="M 12 11 L 18 11 L 18 45 L 12 45 Z" fill="#1d4ed8" />
      <polygon points="12,11 19,11 12,18" fill="#facc15" />
      <polygon points="42,11 35,11 42,18" fill="#facc15" />
      <polygon points="42,45 35,45 42,38" fill="#facc15" />
      <path d="M 24 45 L 24 51 L 27 48 L 30 51 L 30 45 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
      {/* Ngôi sao vàng */}
      <polygon
        points="27,19 29.5,25 36,25 31,29 33,35 27,31 21,35 23,29 18,25 24.5,25"
        fill="#facc15"
        stroke="#78350f"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 14. Cối xay gió gỗ 3D (Chế biến / Factory)
export function Icon3dMill({ size = 38, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none" className={`icon-3d ${className}`}>
      <polygon points="20,20 34,20 38,47 16,47" fill="#d97706" stroke="#451a03" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="27,10 38,21 16,21" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.8" />
      <path d="M 24 47 L 24 39 C 24 37, 30 37, 30 39 L 30 47 Z" fill="#451a03" />
      {/* 4 cánh quạt cối xay */}
      <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
        <line x1="27" y1="26" x2="27" y2="12" />
        <line x1="27" y1="26" x2="27" y2="40" />
        <line x1="27" y1="26" x2="13" y2="26" />
        <line x1="27" y1="26" x2="41" y2="26" />
      </g>
      <rect x="28" y="13" width="7" height="10" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" />
      <rect x="19" y="27" width="7" height="10" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" />
      <circle cx="27" cy="26" r="4" fill="#facc15" stroke="#713f12" strokeWidth="1.5" />
    </svg>
  );
}

// 15. Chiếc búa thợ rèn 3D (Nâng cấp / Upgrade)
export function Icon3dHammer({ size = 38, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none" className={`icon-3d ${className}`}>
      {/* Cán búa gỗ */}
      <rect x="24" y="16" width="6.5" height="34" rx="3" transform="rotate(-40 27 33)" fill="#d97706" stroke="#451a03" strokeWidth="1.8" />
      {/* Đầu búa thép đúc */}
      <rect x="25" y="8" width="22" height="13" rx="3" transform="rotate(-40 36 14)" fill="#64748b" stroke="#0f172a" strokeWidth="2.2" />
      <line x1="39" y1="7" x2="47" y2="17" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="44,5 45,7 48,8 45,9 44,11 43,9 40,8 43,7" fill="#facc15" />
    </svg>
  );
}

// 16. Xe kéo chở hàng gỗ 3D (Cửa hàng / Supplies Shop)
export function Icon3dShopCart({ size = 38, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none" className={`icon-3d ${className}`}>
      <polygon points="12,18 42,18 38,36 16,36" fill="#d97706" stroke="#451a03" strokeWidth="2" strokeLinejoin="round" />
      <line x1="22" y1="18" x2="21" y2="36" stroke="#78350f" strokeWidth="1.8" />
      <line x1="32" y1="18" x2="33" y2="36" stroke="#78350f" strokeWidth="1.8" />
      <ellipse cx="27" cy="18" rx="8" ry="5.5" fill="#fef3c7" stroke="#92400e" strokeWidth="1.5" />
      <circle cx="23" cy="16" r="3.5" fill="#22c55e" />
      <circle cx="27" cy="40" r="9.5" fill="#b45309" stroke="#451a03" strokeWidth="2" />
      <circle cx="27" cy="40" r="4.5" fill="#fde68a" stroke="#451a03" strokeWidth="1.5" />
      <line x1="27" y1="31" x2="27" y2="49" stroke="#451a03" strokeWidth="1.5" />
      <line x1="18" y1="40" x2="36" y2="40" stroke="#451a03" strokeWidth="1.5" />
    </svg>
  );
}

// 17. Tủ đồ / Gương soi hoàng gia 3D (Tủ đồ / Wardrobe / Outfits)
export function Icon3dWardrobe({ size = 38, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none" className={`icon-3d ${className}`}>
      <path d="M 18 47 L 36 47 M 27 41 L 27 47" stroke="#eab308" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="27" cy="24" rx="15" ry="18" fill="#facc15" stroke="#713f12" strokeWidth="2.2" />
      <ellipse cx="27" cy="24" rx="12" ry="15" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
      <path d="M 21 14 Q 31 16 30 34" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="27" cy="6" r="4" fill="#f43f5e" stroke="#9f1239" strokeWidth="1.5" />
    </svg>
  );
}

// 18. Xe đạp mini thể thao 3D (Phương tiện / Vehicle)
export function Icon3dBike({ size = 38, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none" className={`icon-3d ${className}`}>
      <circle cx="15" cy="36" r="10" stroke="#1e293b" strokeWidth="3" fill="#f8fafc" />
      <circle cx="15" cy="36" r="3.5" fill="#64748b" />
      <circle cx="39" cy="36" r="10" stroke="#1e293b" strokeWidth="3" fill="#f8fafc" />
      <circle cx="39" cy="36" r="3.5" fill="#64748b" />
      <polyline points="15,36 27,36 34,22 22,22 15,36" stroke="#f59e0b" strokeWidth="3.5" strokeLinejoin="round" fill="none" />
      <line x1="27" y1="36" x2="26" y2="18" stroke="#f59e0b" strokeWidth="3.5" />
      <ellipse cx="26" cy="18" rx="5" ry="2.5" fill="#78350f" />
      <line x1="34" y1="22" x2="36" y2="14" stroke="#64748b" strokeWidth="3" />
      <path d="M 33 14 L 39 14" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// 19. Đôi chim bồ câu / Bàn tay hữu nghị 3D (Bạn bè / Friends)
export function Icon3dFriends({ size = 38, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none" className={`icon-3d ${className}`}>
      <path
        d="M 27 19 C 24 13, 14 13, 14 23 C 14 32, 27 41, 27 41 C 27 41, 40 32, 40 23 C 40 13, 30 13, 27 19 Z"
        fill="#f43f5e"
        stroke="#9f1239"
        strokeWidth="2.2"
      />
      <path d="M 12 28 C 6 22, 11 16, 17 21 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M 42 28 C 48 22, 43 16, 37 21 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
      <ellipse cx="21" cy="20" rx="3.5" ry="4.5" fill="#ffffff" opacity="0.7" transform="rotate(-30 21 20)" />
    </svg>
  );
}

// 20. Cuốn bách khoa toàn thư 3D (Cẩm nang / Guide)
export function Icon3dGuideBook({ size = 38, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none" className={`icon-3d ${className}`}>
      <rect x="13" y="10" width="28" height="34" rx="4" fill="#10b981" stroke="#064e3b" strokeWidth="2" />
      <path d="M 13 10 L 19 10 L 19 44 L 13 44 Z" fill="#059669" />
      <path d="M 41 13 L 44 14 L 44 42 L 41 41 Z" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
      <circle cx="28" cy="26" r="7.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
      <path d="M 28 30 L 28 23 M 28 25 Q 31 23 31 21 M 28 27 Q 25 25 25 23" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// 21. Ổ khóa vàng phong cách RPG 3D (Locked Feature)
export function Icon3dLock({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <path d="M 12 16 L 12 11 C 12 7.7, 14.7 5, 18 5 C 21.3 5, 24 7.7, 24 11 L 24 16" stroke="#64748b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <rect x="8" y="14" width="20" height="17" rx="4" fill="#facc15" stroke="#713f12" strokeWidth="1.8" />
      <circle cx="18" cy="21" r="2.2" fill="#451a03" />
      <polygon points="17.2,21 18.8,21 19.2,26 16.8,26" fill="#451a03" />
    </svg>
  );
}

// 22. Chuông xe đạp 3D (Bicycle Bell)
export function Icon3dBell({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <circle cx="18" cy="18" r="13" fill="#facc15" stroke="#713f12" strokeWidth="1.8" />
      <ellipse cx="14" cy="13" rx="3.5" ry="2.2" fill="#ffffff" opacity="0.8" />
      <circle cx="8" cy="10" r="3.5" fill="#cbd5e1" stroke="#334155" strokeWidth="1.2" />
      <line x1="8" y1="10" x2="13" y2="13" stroke="#64748b" strokeWidth="2.5" />
    </svg>
  );
}

// 23. Gà con 3D múp míp Chibi (Chicken Mascot / Livestock)
export function Icon3dChicken({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="chk_body" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="25%" stopColor="#fef08a" />
          <stop offset="65%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
        <linearGradient id="chk_wing" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="chk_beak" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="40%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <radialGradient id="chk_comb" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="40%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>
        <linearGradient id="chk_feet" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
        <radialGradient id="chk_blush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f472b6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Hai chân tròn múp míp bên dưới */}
      <ellipse cx="24" cy="54" rx="5" ry="3.5" fill="url(#chk_feet)" stroke="#7c2d12" strokeWidth="1.6" />
      <ellipse cx="40" cy="54" rx="5" ry="3.5" fill="url(#chk_feet)" stroke="#7c2d12" strokeWidth="1.6" />

      {/* Mào gà đỏ thạch dẻo 3 múi trên đỉnh đầu */}
      <path
        d="M 27 16 C 24 10, 29 6, 32 10 C 34 5, 41 7, 39 12 C 43 9, 46 13, 42 17 Z"
        fill="url(#chk_comb)"
        stroke="#7f1d1d"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Ánh sáng bóng trên mào gà */}
      <ellipse cx="32" cy="9" rx="1.5" ry="2.2" fill="#ffffff" opacity="0.75" />

      {/* Thân gà tròn xoe mũm mĩm hình quả lê */}
      <path
        d="M 32 14 C 18 14, 11 26, 12 39 C 13 50, 20 54, 32 54 C 44 54, 51 50, 52 39 C 53 26, 46 14, 32 14 Z"
        fill="url(#chk_body)"
        stroke="#78350f"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* Vệt sáng bóng tròn trên trán (Specular Gloss) */}
      <path
        d="M 23 20 C 27 17, 36 17, 39 20 C 37 18, 25 18, 23 20 Z"
        fill="#ffffff"
        opacity="0.8"
      />
      <ellipse cx="25" cy="22" rx="3.5" ry="2" transform="rotate(-15 25 22)" fill="#ffffff" opacity="0.65" />

      {/* Má hồng phấn Kawaii 2 bên */}
      <ellipse cx="20" cy="38" rx="4.5" ry="3" fill="url(#chk_blush)" />
      <ellipse cx="44" cy="38" rx="4.5" ry="3" fill="url(#chk_blush)" />

      {/* Mắt to tròn long lanh Play Together */}
      <g>
        <ellipse cx="24" cy="31" rx="3.5" ry="4.5" fill="#1e1b4b" />
        <ellipse cx="23" cy="29.5" rx="1.4" ry="1.8" fill="#ffffff" />
        <circle cx="25.5" cy="33.5" r="0.8" fill="#ffffff" />
      </g>
      <g>
        <ellipse cx="40" cy="31" rx="3.5" ry="4.5" fill="#1e1b4b" />
        <ellipse cx="39" cy="29.5" rx="1.4" ry="1.8" fill="#ffffff" />
        <circle cx="41.5" cy="33.5" r="0.8" fill="#ffffff" />
      </g>

      {/* Mỏ cam 3D chúm chím bóng bẩy */}
      <path
        d="M 27 34 Q 32 32 37 34 Q 32 42 27 34 Z"
        fill="url(#chk_beak)"
        stroke="#7c2d12"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <ellipse cx="32" cy="34" rx="2" ry="0.8" fill="#ffffff" opacity="0.65" />

      {/* Đôi cánh tròn nhỏ xinh xắn 2 bên sườn */}
      <path
        d="M 12 36 C 8 38, 9 47, 16 46 C 18 43, 16 37, 12 36 Z"
        fill="url(#chk_wing)"
        stroke="#78350f"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <ellipse cx="13" cy="40" rx="1" ry="2.5" transform="rotate(-20 13 40)" fill="#ffffff" opacity="0.6" />

      <path
        d="M 52 36 C 56 38, 55 47, 48 46 C 46 43, 48 37, 52 36 Z"
        fill="url(#chk_wing)"
        stroke="#78350f"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <ellipse cx="51" cy="40" rx="1" ry="2.5" transform="rotate(20 51 40)" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}

// 24. Bò sữa 3D xinh xắn (Cow / Livestock)
export function Icon3dCow({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <ellipse cx="9" cy="16" rx="4" ry="2" transform="rotate(-30 9 16)" fill="#ffffff" stroke="#1e293b" strokeWidth="1.2" />
      <ellipse cx="27" cy="16" rx="4" ry="2" transform="rotate(30 27 16)" fill="#ffffff" stroke="#1e293b" strokeWidth="1.2" />
      <path d="M 12 12 C 10 9, 8 9, 7 11" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 24 12 C 26 9, 28 9, 29 11" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="10" y="11" width="16" height="15" rx="6" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M 11 13 C 13 13, 15 16, 13 18 L 10 17 Z" fill="#0f172a" />
      <rect x="9" y="21" width="18" height="10" rx="5" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.2" />
      <circle cx="15" cy="26" r="1.4" fill="#831843" />
      <circle cx="21" cy="26" r="1.4" fill="#831843" />
      <circle cx="14" cy="17" r="2" fill="#0f172a" />
      <circle cx="22" cy="17" r="2" fill="#0f172a" />
    </svg>
  );
}

// 25. Bắp ngô vàng 3D (Corn / Animal Feed)
export function Icon3dCorn({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <path d="M 11 28 C 9 18, 14 11, 14 11 C 14 11, 13 22, 17 28 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.2" />
      <path d="M 25 28 C 27 18, 22 11, 22 11 C 22 11, 23 22, 19 28 Z" fill="#16a34a" stroke="#14532d" strokeWidth="1.2" />
      <ellipse cx="18" cy="17" rx="5.5" ry="9.5" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />
      <line x1="18" y1="9" x2="18" y2="25" stroke="#ca8a04" strokeWidth="1.2" />
      <line x1="14" y1="14" x2="22" y2="14" stroke="#ca8a04" strokeWidth="1" />
      <line x1="14" y1="19" x2="22" y2="19" stroke="#ca8a04" strokeWidth="1" />
    </svg>
  );
}

// 26. Nón lá Việt Nam 3D Chibi (Non La VN / Farmer Hat)
export function Icon3dNonLa({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="nonla_body" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#fde047" />
          <stop offset="85%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      {/* Vành nón tròn bầu bĩnh múp míp */}
      <ellipse cx="24" cy="38" rx="20" ry="6" fill="#b45309" stroke="#78350f" strokeWidth="1.8" />
      {/* Thân chóp nón lá hình nón cong tròn mềm mại */}
      <path
        d="M 5 37 Q 24 6 24 5 Q 24 6 43 37 Q 24 43 5 37 Z"
        fill="url(#nonla_body)"
        stroke="#78350f"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Các vòng nan nón lá đặc trưng */}
      <path d="M 12 30 Q 24 35 36 30" stroke="#fef9c3" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 17 23 Q 24 27 31 23" stroke="#fef9c3" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M 21 15 Q 24 18 27 15" stroke="#fef9c3" strokeWidth="1.4" strokeLinecap="round" />
      {/* Quai nón lụa hồng cánh sen buông lượn */}
      <path d="M 12 36 Q 16 46 24 46 Q 32 46 36 36" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Ánh sáng bóng trên sống nón */}
      <ellipse cx="20" cy="18" rx="2.5" ry="8" fill="#ffffff" opacity="0.6" transform="rotate(-15 20 18)" />
    </svg>
  );
}

// 26b. Mũ Quản Gia Nông Trang 3D (Farm Manager Hat)
export function Icon3dManager({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="manager_hat_body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="manager_ribbon" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      {/* Vành mũ da bò sang trọng uốn cong */}
      <ellipse cx="24" cy="34" rx="20" ry="7" fill="url(#manager_hat_body)" stroke="#451a03" strokeWidth="2" />
      {/* Thân chóp mũ cao bồi / quản gia trang trại */}
      <path
        d="M 12 33 C 12 20, 16 12, 24 11 C 32 12, 36 20, 36 33 Z"
        fill="url(#manager_hat_body)"
        stroke="#451a03"
        strokeWidth="2.2"
      />
      {/* Dải ruy băng xanh hoàng gia thắt quanh mũ */}
      <path d="M 12.5 30 Q 24 35 35.5 30 L 35.8 33 Q 24 38 12.2 33 Z" fill="url(#manager_ribbon)" stroke="#082f49" strokeWidth="1.2" />
      {/* Huy hiệu Ngôi Sao Vàng Quản Lý ở giữa nơ */}
      <polygon points="24,28 25.5,31.5 29,31.5 26,33.5 27,37 24,35 21,37 22,33.5 19,31.5 22.5,31.5" fill="#facc15" stroke="#78350f" strokeWidth="1" />
      {/* Ánh bóng specular */}
      <ellipse cx="20" cy="18" rx="2.5" ry="6" fill="#ffffff" opacity="0.45" transform="rotate(-15 20 18)" />
    </svg>
  );
}

// 27. Bông Lúa Nước Vàng 3D (Golden Rice Spike)
export function Icon3dRiceSpike({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="rice_grain" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
      </defs>
      {/* Cọng lúa cong uốn duyên dáng */}
      <path d="M 10 44 C 18 36, 26 26, 38 8" stroke="#ca8a04" strokeWidth="3" strokeLinecap="round" />
      {/* Các hạt thóc mẩy vàng tròn xoe */}
      <ellipse cx="38" cy="8" rx="3.5" ry="5.5" transform="rotate(35 38 8)" fill="url(#rice_grain)" stroke="#713f12" strokeWidth="1.2" />
      <ellipse cx="33" cy="14" rx="3.5" ry="5" transform="rotate(15 33 14)" fill="url(#rice_grain)" stroke="#713f12" strokeWidth="1.2" />
      <ellipse cx="38" cy="17" rx="3.5" ry="5" transform="rotate(65 38 17)" fill="url(#rice_grain)" stroke="#713f12" strokeWidth="1.2" />
      <ellipse cx="27" cy="21" rx="3.5" ry="5" transform="rotate(20 27 21)" fill="url(#rice_grain)" stroke="#713f12" strokeWidth="1.2" />
      <ellipse cx="32" cy="24" rx="3.5" ry="5" transform="rotate(60 32 24)" fill="url(#rice_grain)" stroke="#713f12" strokeWidth="1.2" />
      <ellipse cx="21" cy="28" rx="3.5" ry="5" transform="rotate(25 21 28)" fill="url(#rice_grain)" stroke="#713f12" strokeWidth="1.2" />
      <ellipse cx="26" cy="31" rx="3.5" ry="5" transform="rotate(55 26 31)" fill="url(#rice_grain)" stroke="#713f12" strokeWidth="1.2" />
      {/* Lá lúa xanh mạ non */}
      <path d="M 12 40 C 18 30, 24 35, 30 33" stroke="#84cc16" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 28. Cổng Làng Ngói Đỏ Cong 3D (Village Gate / Town Center)
export function Icon3dVillageGate({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="gate_roof" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="40%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      {/* Hai trụ cổng đá gạch đỏ cổ kính */}
      <rect x="11" y="22" width="6.5" height="22" rx="2" fill="#d97706" stroke="#78350f" strokeWidth="1.8" />
      <rect x="30.5" y="22" width="6.5" height="22" rx="2" fill="#d97706" stroke="#78350f" strokeWidth="1.8" />
      {/* Bệ đá đế trụ */}
      <rect x="9" y="40" width="10.5" height="4.5" rx="1.5" fill="#78716c" stroke="#44403c" strokeWidth="1.5" />
      <rect x="28.5" y="40" width="10.5" height="4.5" rx="1.5" fill="#78716c" stroke="#44403c" strokeWidth="1.5" />
      {/* Xà ngang gỗ mộc */}
      <rect x="10" y="20" width="28" height="4" rx="1" fill="#78350f" />
      {/* Mái ngói mũi hài đỏ cong 2 đầu Play Together */}
      <path
        d="M 5 20 Q 8 13 24 13 Q 40 13 43 20 Q 38 23 24 18 Q 10 23 5 20 Z"
        fill="url(#gate_roof)"
        stroke="#7f1d1d"
        strokeWidth="2"
      />
      {/* Tầng mái ngói cổ lầu trên đỉnh */}
      <path
        d="M 12 13 Q 16 6 24 6 Q 32 6 36 13 Q 30 15 24 12 Q 18 15 12 13 Z"
        fill="url(#gate_roof)"
        stroke="#7f1d1d"
        strokeWidth="1.8"
      />
      {/* Bình hồ lô gốm trên đỉnh mái */}
      <circle cx="24" cy="5" r="2.2" fill="#facc15" stroke="#854d0e" strokeWidth="1" />
      {/* Biển làng hoàng gia chữ vàng */}
      <rect x="18" y="24" width="12" height="7" rx="2" fill="#7f1d1d" stroke="#facc15" strokeWidth="1.2" />
      <circle cx="24" cy="27.5" r="1.8" fill="#fef08a" />
    </svg>
  );
}

// 29. Bông Sen Hồng Việt Nam 3D (Pink Lotus / Lake District)
export function Icon3dLotus({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="lotus_petal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="60%" stopColor="#db2777" />
          <stop offset="100%" stopColor="#9d174d" />
        </linearGradient>
      </defs>
      {/* Lá sen tròn ngọc biếc phía dưới */}
      <ellipse cx="24" cy="40" rx="19" ry="5.5" fill="#22c55e" stroke="#15803d" strokeWidth="1.8" />
      <path d="M 24 40 L 32 40" stroke="#15803d" strokeWidth="1.5" />
      {/* Cánh sen xòe ngoài */}
      <path d="M 10 35 C 7 24, 15 17, 21 27 C 16 33, 12 36, 10 35 Z" fill="url(#lotus_petal)" stroke="#831843" strokeWidth="1.4" />
      <path d="M 38 35 C 41 24, 33 17, 27 27 C 32 33, 36 36, 38 35 Z" fill="url(#lotus_petal)" stroke="#831843" strokeWidth="1.4" />
      {/* Cánh sen tầng giữa */}
      <path d="M 14 34 C 12 21, 22 13, 24 24 C 20 31, 16 34, 14 34 Z" fill="#ec4899" stroke="#831843" strokeWidth="1.5" />
      <path d="M 34 34 C 36 21, 26 13, 24 24 C 28 31, 32 34, 34 34 Z" fill="#ec4899" stroke="#831843" strokeWidth="1.5" />
      {/* Búp sen chính tâm căng mọng */}
      <path d="M 24 10 C 29 18, 28 31, 24 33 C 20 31, 19 18, 24 10 Z" fill="#fbcfe8" stroke="#be185d" strokeWidth="1.8" />
      {/* Nhụy sen vàng đượm */}
      <ellipse cx="24" cy="27" rx="3.5" ry="2" fill="#facc15" />
      {/* Giọt sương mai đọng trên lá sen */}
      <circle cx="15" cy="40" r="1.5" fill="#e0f2fe" opacity="0.9" />
    </svg>
  );
}

// 30. Rặng Dừa Bãi Biển Làng Chài 3D (Beach Palms / Coastal Village)
export function Icon3dCoast({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`icon-3d ${className}`}>
      {/* Cồn cát vàng ươm */}
      <ellipse cx="24" cy="42" rx="19" ry="5" fill="#facc15" stroke="#b45309" strokeWidth="1.6" />
      {/* Sóng biển xanh lam */}
      <path d="M 6 44 Q 14 41 24 44 Q 34 47 42 44" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Thân dừa uốn lượn phong trần */}
      <path d="M 18 42 Q 22 28 17 14" stroke="#92400e" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      {/* Tàu dừa xanh mướt chẽ nhánh */}
      <path d="M 17 14 Q 8 13 4 21" stroke="#22c55e" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M 17 14 Q 13 6 8 8" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 17 14 Q 24 6 30 11" stroke="#22c55e" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M 17 14 Q 26 15 28 24" stroke="#15803d" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Chùm dừa xiêm ngọt nước */}
      <circle cx="16" cy="16" r="2.4" fill="#a3e635" stroke="#4d7c0f" strokeWidth="1" />
      <circle cx="19" cy="17" r="2.2" fill="#a3e635" stroke="#4d7c0f" strokeWidth="1" />
      <circle cx="18" cy="14" r="2.2" fill="#a3e635" stroke="#4d7c0f" strokeWidth="1" />
    </svg>
  );
}

// 31. Nút Nhảy Lò Xo Chibi 3D (Jump Action Button)
export function Icon3dJump({ size = 30, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`icon-3d ${className}`}>
      {/* Lò xo trợ lực nảy tưng bừng */}
      <path d="M 16 38 Q 24 42 32 38" stroke="#f59e0b" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M 18 34 Q 24 37 30 34" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 20 30 Q 24 33 28 30" stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      {/* Giày thể thao Chibi Play Together nhấc bổng */}
      <path
        d="M 13 22 C 13 18, 18 14, 23 16 L 27 18 C 33 18, 38 21, 37 25 C 36 28, 30 28, 20 28 C 15 28, 13 25, 13 22 Z"
        fill="#3b82f6"
        stroke="#1e3a8a"
        strokeWidth="2.2"
      />
      {/* Mũi giày cao su trắng bo tròn */}
      <ellipse cx="32" cy="24" rx="4.5" ry="3.5" fill="#f8fafc" stroke="#1e3a8a" strokeWidth="1.5" />
      {/* Đế giày cao su vàng */}
      <rect x="14" y="26" width="22" height="3" rx="1.5" fill="#facc15" stroke="#854d0e" strokeWidth="1.2" />
      {/* Mũi tên nảy lên 3D */}
      <polygon points="24,4 18,11 22,11 22,15 26,15 26,11 30,11" fill="#ec4899" stroke="#831843" strokeWidth="1.5" />
    </svg>
  );
}

// 32. Nút Chạy Gió Lốc 3D (Sprint Action Button)
export function Icon3dSprint({ size = 30, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`icon-3d ${className}`}>
      {/* Vệt gió siêu tốc Chibi lướt nhanh */}
      <path d="M 8 16 C 14 16, 18 19, 23 19" stroke="#67e8f9" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M 4 24 C 12 24, 16 27, 24 27" stroke="#38bdf8" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M 8 32 C 15 32, 19 35, 26 35" stroke="#67e8f9" strokeWidth="3.2" strokeLinecap="round" />
      {/* Ngọn sấm sét năng lượng vàng kim */}
      <polygon
        points="30,6 18,25 27,25 21,42 41,20 31,20"
        fill="#facc15"
        stroke="#78350f"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Vệt sáng chói giữa sấm sét */}
      <polygon points="29,10 22,23 28,23 24,35 37,21 30,21" fill="#fef08a" opacity="0.8" />
    </svg>
  );
}

// 33. Nút Xuống Xe Thong Dong 3D (Dismount Button)
export function Icon3dDismount({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`icon-3d ${className}`}>
      {/* Bàn chân bước xuống mặt cỏ */}
      <ellipse cx="24" cy="40" rx="14" ry="4" fill="#a7f3d0" stroke="#059669" strokeWidth="1.2" />
      {/* Đôi giày bata trắng viền đỏ bước vững chãi */}
      <path
        d="M 17 26 C 17 22, 23 19, 29 23 L 33 25 C 38 27, 39 31, 35 34 C 30 35, 23 35, 19 33 C 17 31, 17 29, 17 26 Z"
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth="2.2"
      />
      <rect x="18" y="32" width="18" height="3" rx="1.5" fill="#ef4444" />
      {/* Mũi tên hướng xuống dưới màu xanh lá */}
      <polygon points="24,20 18,13 22,13 22,7 26,7 26,13 30,13" fill="#10b981" stroke="#064e3b" strokeWidth="1.5" />
    </svg>
  );
}

// 34. Loa Bật Kẹo Ngọt 3D (Audio On)
export function Icon3dAudioOn({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="aud_body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <radialGradient id="aud_cone" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="50%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
        <linearGradient id="aud_wave1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="aud_wave2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>

      {/* Củ loa phía sau */}
      <rect x="8" y="24" width="10" height="16" rx="4" fill="url(#aud_body)" stroke="#78350f" strokeWidth="2" />
      <rect x="10" y="26" width="3" height="12" rx="1.5" fill="#ffffff" opacity="0.6" />

      {/* Phễu loa 3D loe rộng */}
      <path
        d="M 18 24 L 32 14 C 34 12, 36 14, 36 17 L 36 47 C 36 50, 34 52, 32 50 L 18 40 Z"
        fill="url(#aud_cone)"
        stroke="#7c2d12"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Vành loa trước và ánh sáng phản chiếu */}
      <ellipse cx="36" cy="32" rx="2.5" ry="16.5" fill="#ea580c" stroke="#7c2d12" strokeWidth="1.8" />
      <ellipse cx="36" cy="24" rx="1.2" ry="6" fill="#ffffff" opacity="0.75" />

      {/* Sóng âm thanh 3D Cyan sắc nét (Soundwaves) */}
      <path
        d="M 43 23 C 47 28, 47 36, 43 41"
        stroke="url(#aud_wave1)"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M 50 16 C 58 24, 58 40, 50 48"
        stroke="url(#aud_wave2)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Nốt nhạc / ngôi sao âm vang lấp lánh */}
      <polygon points="56,12 57.5,15 60,16 57.5,17 56,20 54.5,17 52,16 54.5,15" fill="#fef08a" />
    </svg>
  );
}

// 35. Loa Tắt Gạch Chéo Kẹo 3D (Audio Off)
export function Icon3dAudioOff({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="aoff_body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <radialGradient id="aoff_cone" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="60%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>
        <linearGradient id="aoff_bar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="45%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>

      {/* Củ loa phía sau muted */}
      <rect x="8" y="24" width="10" height="16" rx="4" fill="url(#aoff_body)" stroke="#1e293b" strokeWidth="2" opacity="0.8" />

      {/* Phễu loa muted */}
      <path
        d="M 18 24 L 32 14 C 34 12, 36 14, 36 17 L 36 47 C 36 50, 34 52, 32 50 L 18 40 Z"
        fill="url(#aoff_cone)"
        stroke="#1e293b"
        strokeWidth="2.2"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <ellipse cx="36" cy="32" rx="2.5" ry="16.5" fill="#64748b" stroke="#1e293b" strokeWidth="1.8" />

      {/* Dấu X cấm âm thanh dạng thanh kẹo 3D nổi bật */}
      <g stroke="#450a0a" strokeWidth="2">
        <line x1="42" y1="20" x2="58" y2="44" stroke="url(#aoff_bar)" strokeWidth="5.5" strokeLinecap="round" />
        <line x1="58" y1="20" x2="42" y2="44" stroke="url(#aoff_bar)" strokeWidth="5.5" strokeLinecap="round" />
      </g>
      {/* Vệt bóng trắng trên thanh X */}
      <line x1="43" y1="21" x2="57" y2="43" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

// 36. Vương Miện Vàng Chủ Nông Trại 3D (Crown / Farm Owner)
export function Icon3dCrown({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <path
        d="M 6 26 L 8 13 L 14 20 L 18 9 L 22 20 L 28 13 L 30 26 Z"
        fill="#facc15"
        stroke="#854d0e"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="12" r="2" fill="#ef4444" stroke="#78350f" strokeWidth="1" />
      <circle cx="18" cy="8" r="2.2" fill="#3b82f6" stroke="#78350f" strokeWidth="1" />
      <circle cx="28" cy="12" r="2" fill="#10b981" stroke="#78350f" strokeWidth="1" />
      <rect x="7" y="25" width="22" height="4" rx="2" fill="#f59e0b" stroke="#854d0e" strokeWidth="1.5" />
    </svg>
  );
}

// 37. Áo Phông / Áo Mộc Mạc 3D (Casual Shirt)
export function Icon3dShirt({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <path
        d="M 12 7 L 15 10 C 16 11, 20 11, 21 10 L 24 7 L 31 11 L 28 17 L 25 15 L 25 29 L 11 29 L 11 15 L 8 17 L 5 11 Z"
        fill="#f8fafc"
        stroke="#334155"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M 15 10 C 16 12, 20 12, 21 10" stroke="#0284c7" strokeWidth="1.5" fill="none" />
      <line x1="18" y1="13" x2="18" y2="22" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  );
}

// 38. Nón Kết / Mũ Lưỡi Trai Chibi 3D (Cap)
export function Icon3dCap({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <path d="M 8 21 C 8 13, 14 8, 22 8 C 28 8, 32 13, 32 21 Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.8" />
      <path d="M 8 21 C 8 25, 2 24, 3 22 Q 10 20 22 20 Q 34 20 33 22 Z" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="1.5" />
      <ellipse cx="28" cy="23" rx="7" ry="2.5" fill="#1e40af" stroke="#1e3a8a" strokeWidth="1.2" />
      <circle cx="20" cy="8" r="1.5" fill="#facc15" />
    </svg>
  );
}

// 39. Bông Hoa Hồng Phấn 3D (Flower / Blossom)
export function Icon3dFlower({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <circle cx="18" cy="11" r="5" fill="#f472b6" stroke="#be185d" strokeWidth="1.2" />
      <circle cx="24" cy="16" r="5" fill="#f472b6" stroke="#be185d" strokeWidth="1.2" />
      <circle cx="21" cy="23" r="5" fill="#f472b6" stroke="#be185d" strokeWidth="1.2" />
      <circle cx="15" cy="23" r="5" fill="#f472b6" stroke="#be185d" strokeWidth="1.2" />
      <circle cx="12" cy="16" r="5" fill="#f472b6" stroke="#be185d" strokeWidth="1.2" />
      <circle cx="18" cy="17" r="4.5" fill="#fef08a" stroke="#d97706" strokeWidth="1.2" />
    </svg>
  );
}

// 40. Đôi Giày Đi Bộ Nông Thôn 3D (Walk)
export function Icon3dWalk({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <path
        d="M 8 20 C 8 16, 12 13, 17 15 L 22 17 C 27 18, 30 21, 29 24 C 28 27, 23 27, 15 27 C 10 27, 8 23, 8 20 Z"
        fill="#f59e0b"
        stroke="#78350f"
        strokeWidth="1.8"
      />
      <rect x="9" y="25" width="20" height="3" rx="1.5" fill="#ffffff" stroke="#78350f" strokeWidth="1" />
      <path d="M 16 16 L 19 21 M 19 16 L 22 21" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 41. Xe Máy Cub 50cc Cổ Điển Chibi 3D (Cub 50cc / Scooter)
export function Icon3dCub50({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={`icon-3d ${className}`}>
      {/* Hai bánh xe nan hoa tròn múp */}
      <circle cx="10" cy="28" r="6.5" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="10" cy="28" r="3" fill="#cbd5e1" />
      <circle cx="30" cy="28" r="6.5" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="30" cy="28" r="3" fill="#cbd5e1" />
      {/* Khung yếm trắng xe Cub 50 */}
      <path d="M 12 25 L 18 19 L 24 19 L 26 25 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
      <path d="M 21 16 Q 26 18 25 26" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Yên xe da nâu sậm */}
      <rect x="13" y="16" width="9" height="3.5" rx="1.5" fill="#78350f" stroke="#451a03" strokeWidth="1" />
      {/* Ghi-đông & Đèn pha tròn Chibi */}
      <circle cx="27" cy="13" r="3" fill="#facc15" stroke="#78350f" strokeWidth="1.2" />
      <line x1="24" y1="14" x2="27" y2="13" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 42. Máy Cày Máy Kéo Đồng Ruộng 3D (Tractor)
export function Icon3dTractor({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={`icon-3d ${className}`}>
      {/* Bánh sau to bánh trước nhỏ */}
      <circle cx="12" cy="26" r="8" fill="#1e293b" stroke="#0f172a" strokeWidth="1.8" />
      <circle cx="12" cy="26" r="4" fill="#facc15" stroke="#78350f" strokeWidth="1.2" />
      <circle cx="31" cy="29" r="5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="31" cy="29" r="2.5" fill="#facc15" stroke="#78350f" strokeWidth="1" />
      {/* Thân máy cày màu đỏ cam rực rỡ */}
      <rect x="10" y="16" width="10" height="9" rx="2" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
      <rect x="20" y="20" width="12" height="7" rx="2" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
      {/* Ống khói bốc khói nhẹ */}
      <rect x="28" y="13" width="2.5" height="7" rx="1" fill="#475569" />
      {/* Mui che nắng vàng chanh */}
      <line x1="8" y1="12" x2="20" y2="12" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
      <line x1="10" y1="12" x2="10" y2="16" stroke="#475569" strokeWidth="1.5" />
    </svg>
  );
}

// 43. Biểu Tượng 4 Buổi trong Ngày 3D
export function Icon3dDawn({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <line x1="4" y1="24" x2="28" y2="24" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 10 24 C 10 17, 22 17, 22 24 Z" fill="#fb923c" stroke="#c2410c" strokeWidth="1.5" />
      <line x1="16" y1="8" x2="16" y2="13" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 41. Ông Mặt Trời 3D Kawaii Tươi Vui (Sun / Weather / Tips)
export function Icon3dSun({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="sun_core" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="30%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
        <linearGradient id="sun_ray_pri" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="sun_ray_sec" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <radialGradient id="sun_blush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fb7185" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 8 tia nắng kẹo dẻo 3D bo tròn xung quanh (Rays) */}
      <g stroke="#9a3412" strokeWidth="1.6" strokeLinejoin="round">
        <rect x="29" y="3" width="6" height="10" rx="3" fill="url(#sun_ray_pri)" />
        <rect x="29" y="51" width="6" height="10" rx="3" fill="url(#sun_ray_pri)" />
        <rect x="3" y="29" width="10" height="6" rx="3" fill="url(#sun_ray_pri)" />
        <rect x="51" y="29" width="10" height="6" rx="3" fill="url(#sun_ray_pri)" />
        <rect x="46" y="11" width="5.5" height="9" rx="2.75" transform="rotate(45 48.75 15.5)" fill="url(#sun_ray_sec)" />
        <rect x="12" y="45" width="5.5" height="9" rx="2.75" transform="rotate(45 14.75 49.5)" fill="url(#sun_ray_sec)" />
        <rect x="12" y="11" width="5.5" height="9" rx="2.75" transform="rotate(-45 14.75 15.5)" fill="url(#sun_ray_sec)" />
        <rect x="46" y="45" width="5.5" height="9" rx="2.75" transform="rotate(-45 48.75 49.5)" fill="url(#sun_ray_sec)" />
      </g>

      {/* Quả cầu mặt trời trung tâm căng tròn */}
      <circle cx="32" cy="32" r="18" fill="url(#sun_core)" stroke="#78350f" strokeWidth="2.2" />

      {/* Vệt bóng kính tròn phía trên (Top highlight) */}
      <path
        d="M 22 20 C 26 16, 38 16, 42 20 C 39 18, 25 18, 22 20 Z"
        fill="#ffffff"
        opacity="0.8"
      />
      <ellipse cx="25" cy="22" rx="3" ry="1.6" transform="rotate(-20 25 22)" fill="#ffffff" opacity="0.7" />

      {/* Đôi má hồng phấn đáng yêu */}
      <ellipse cx="23" cy="36" rx="3.5" ry="2.2" fill="url(#sun_blush)" />
      <ellipse cx="41" cy="36" rx="3.5" ry="2.2" fill="url(#sun_blush)" />

      {/* Đôi mắt cười tít hạt tiêu dễ thương */}
      <path d="M 23 29 Q 26 26 29 29" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M 35 29 Q 38 26 41 29" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" fill="none" />

      {/* Nụ cười tươi rạng rỡ có lưỡi hồng */}
      <path d="M 28 35 Q 32 40 36 35 Z" fill="#991b1b" stroke="#78350f" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M 30 37 Q 32 39 34 37" fill="#f43f5e" />
    </svg>
  );
}

export function Icon3dSunset({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <line x1="4" y1="24" x2="28" y2="24" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 10 24 C 10 18, 22 18, 22 24 Z" fill="#f97316" stroke="#9a3412" strokeWidth="1.5" />
      <path d="M 6 18 Q 16 15 26 18" stroke="#ec4899" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Icon3dMoon({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <path
        d="M 23 8 C 15 8, 10 14, 11 22 C 18 24, 25 18, 24 10 C 23.7 9.3, 23.4 8.6, 23 8 Z"
        fill="#fef08a"
        stroke="#ca8a04"
        strokeWidth="1.8"
      />
      <circle cx="8" cy="9" r="1.5" fill="#fef08a" />
      <circle cx="10" cy="18" r="1.2" fill="#ffffff" />
    </svg>
  );
}

// 44. Biểu Tượng 4 Mùa Nông Vụ 3D
export function Icon3dSpring({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <circle cx="16" cy="16" r="6" fill="#f472b6" stroke="#db2777" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="2.5" fill="#fef08a" />
      <path d="M 10 22 C 6 25, 14 28, 16 22" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Icon3dSummer({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <circle cx="16" cy="16" r="6.5" fill="#facc15" stroke="#ea580c" strokeWidth="1.8" />
      <path d="M 9 9 L 12 12 M 23 9 L 20 12 M 9 23 L 12 20 M 23 23 L 20 20" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Icon3dAutumn({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <path
        d="M 16 6 L 18 13 L 24 11 L 20 17 L 26 21 L 18 21 L 16 27 L 14 21 L 6 21 L 12 17 L 8 11 L 14 13 Z"
        fill="#ea580c"
        stroke="#7c2d12"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function Icon3dWinter({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <line x1="16" y1="5" x2="16" y2="27" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="5" y1="16" x2="27" y2="16" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="8" y1="8" x2="24" y2="24" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="8" y1="24" x2="24" y2="8" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.5" fill="#ffffff" />
    </svg>
  );
}

// 45. Quả Trứng Gà Quê 3D (Egg)
export function Icon3dEgg({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <path
        d="M 16 6 C 11 6, 8 13, 8 20 C 8 25, 11 28, 16 28 C 21 28, 24 25, 24 20 C 24 13, 21 6, 16 6 Z"
        fill="#fed7aa"
        stroke="#9a3412"
        strokeWidth="1.8"
      />
      <ellipse cx="13" cy="16" rx="2" ry="4" fill="#ffffff" opacity="0.6" transform="rotate(-15 13 16)" />
    </svg>
  );
}

// 46. Chai Sữa Tươi Nông Trại 3D (Milk)
export function Icon3dMilk({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <rect x="11" y="14" width="10" height="14" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1.6" />
      <path d="M 13 14 L 14 9 L 18 9 L 19 14 Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
      <rect x="13" y="6" width="6" height="3" rx="1" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
      <ellipse cx="16" cy="20" rx="3" ry="2" fill="#38bdf8" />
    </svg>
  );
}

// 47. Bát Bột Mì / Cốm Làng Vòng 3D (Flour Bowl)
export function Icon3dFlourBowl({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <path d="M 6 15 C 6 24, 26 24, 26 15 Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.8" />
      <ellipse cx="16" cy="14" rx="10" ry="3.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />
      <ellipse cx="16" cy="13.5" rx="7" ry="2" fill="#fef08a" />
    </svg>
  );
}

// 48. Miếng Phô Mai / Đậu Phụ Vàng 3D (Cheese)
export function Icon3dCheese({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <polygon points="6,23 27,23 25,12 6,17" fill="#facc15" stroke="#854d0e" strokeWidth="1.8" strokeLinejoin="round" />
      <polygon points="6,17 25,12 18,7 6,17" fill="#fde047" stroke="#854d0e" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="14" cy="20" r="1.5" fill="#ca8a04" />
      <circle cx="20" cy="18" r="1.8" fill="#ca8a04" />
    </svg>
  );
}

// 49. Hũ Mứt Dâu Tây Sen Đường 3D (Jam Jar)
export function Icon3dJamJar({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <rect x="9" y="13" width="14" height="15" rx="4" fill="#f43f5e" stroke="#881337" strokeWidth="1.6" />
      <rect x="11" y="9" width="10" height="4" rx="1.5" fill="#fecdd3" stroke="#881337" strokeWidth="1.2" />
      <ellipse cx="16" cy="9" rx="6" ry="2" fill="#e11d48" stroke="#881337" strokeWidth="1" />
      <rect x="12" y="17" width="8" height="6" rx="1.5" fill="#ffffff" opacity="0.9" />
      <circle cx="16" cy="20" r="1.5" fill="#e11d48" />
    </svg>
  );
}

// 50. Dấu Tích Hoàn Thành 3D (Checkmark)
export function Icon3dCheck({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <circle cx="16" cy="16" r="13" fill="#10b981" stroke="#064e3b" strokeWidth="1.8" />
      <path d="M 10 16 L 14 20 L 22 12" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 51. Ngôi Sao Thưởng Vàng 3D (Star)
export function Icon3dStar({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <polygon
        points="16,3 19.5,11.5 28.5,12 21.5,18 24,27 16,22 8,27 10.5,18 3.5,12 12.5,11.5"
        fill="#facc15"
        stroke="#854d0e"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <polygon points="16,6 18,12 24,12.5 19,16.5 21,22.5 16,19 11,22.5 13,16.5 8,12.5 14,12" fill="#fef08a" />
    </svg>
  );
}

// 52. Mầm Cây Nông Trại 3D Mọng Nước (Sprout - Open World Badge)
export function Icon3dSprout({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="spr_soil" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#a16207" />
          <stop offset="50%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#451a03" />
        </radialGradient>
        <linearGradient id="spr_stem" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#65a30d" />
        </linearGradient>
        <radialGradient id="spr_leaf_l" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#bef264" />
          <stop offset="50%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </radialGradient>
        <radialGradient id="spr_leaf_r" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#d9f99d" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#166534" />
        </radialGradient>
      </defs>

      {/* Gò đất màu mỡ 3D bên dưới */}
      <ellipse cx="32" cy="53" rx="19" ry="7" fill="url(#spr_soil)" stroke="#291204" strokeWidth="2.2" />
      <ellipse cx="26" cy="51" rx="4" ry="1.8" fill="#ca8a04" opacity="0.6" />
      <ellipse cx="38" cy="53" rx="3.5" ry="1.5" fill="#ca8a04" opacity="0.6" />

      {/* Thân cây non uốn lượn tràn đầy nhựa sống */}
      <path
        d="M 32 52 C 32 40, 31 32, 32 25"
        stroke="url(#spr_stem)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Lá non bên trái (Tròn mọng nước) */}
      <path
        d="M 32 30 C 19 22, 12 30, 16 41 C 24 43, 30 36, 32 30 Z"
        fill="url(#spr_leaf_l)"
        stroke="#14532d"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Vệt gân lá và bóng sáng lá trái */}
      <path d="M 19 38 Q 25 36 30 32" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="20" cy="31" rx="3" ry="1.6" transform="rotate(-30 20 31)" fill="#ffffff" opacity="0.75" />

      {/* Lá non bên phải (Vươn cao đón nắng) */}
      <path
        d="M 32 26 C 35 15, 48 16, 50 27 C 48 37, 37 35, 32 26 Z"
        fill="url(#spr_leaf_r)"
        stroke="#14532d"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Vệt gân lá và bóng sáng lá phải */}
      <path d="M 34 27 Q 40 28 46 25" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="44" cy="22" rx="3" ry="1.6" transform="rotate(30 44 22)" fill="#ffffff" opacity="0.75" />

      {/* Giọt sương pha lê lấp lánh trên chóp lá */}
      <circle cx="48" cy="18" r="2.2" fill="#ffffff" />
      <circle cx="49" cy="17" r="0.9" fill="#38bdf8" />
    </svg>
  );
}

// 53. Kho Lúa Mái Ngói Đỏ 3D (Barn)
export function Icon3dBarn({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <path d="M 6 16 L 18 7 L 30 16 L 27 30 L 9 30 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.8" strokeLinejoin="round" />
      <polygon points="18,7 6,16 30,16" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1.8" />
      <rect x="13" y="20" width="10" height="10" rx="1" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
      <line x1="13" y1="20" x2="23" y2="30" stroke="#facc15" strokeWidth="1.2" />
      <line x1="23" y1="20" x2="13" y2="30" stroke="#facc15" strokeWidth="1.2" />
    </svg>
  );
}

// 54. Nhà Gỗ Mái Tranh Ấm Cúng 3D (House Cabin)
export function Icon3dHouseCabin({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <rect x="8" y="17" width="20" height="14" rx="2" fill="#fed7aa" stroke="#7c2d12" strokeWidth="1.8" />
      <polygon points="18,5 4,18 32,18" fill="#d97706" stroke="#78350f" strokeWidth="2" strokeLinejoin="round" />
      <rect x="15" y="22" width="6" height="9" rx="1.5" fill="#78350f" />
      <circle cx="19.5" cy="26.5" r="0.8" fill="#facc15" />
      <rect x="10" y="20" width="3.5" height="4" rx="1" fill="#67e8f9" stroke="#0284c7" strokeWidth="1" />
      <rect x="22.5" y="20" width="3.5" height="4" rx="1" fill="#67e8f9" stroke="#0284c7" strokeWidth="1" />
    </svg>
  );
}

// 55. Xúc Xắc Dân Gian Đỏ Trắng 3D (Casino Dice)
export function Icon3dDice({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <rect x="6" y="6" width="24" height="24" rx="6" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
      <circle cx="18" cy="18" r="3.2" fill="#ef4444" />
      <circle cx="12" cy="12" r="2.2" fill="#0f172a" />
      <circle cx="24" cy="24" r="2.2" fill="#0f172a" />
      <circle cx="24" cy="12" r="2.2" fill="#0f172a" />
      <circle cx="12" cy="24" r="2.2" fill="#0f172a" />
    </svg>
  );
}

// 56. Tòa Nhà Cao Ốc Đô Thị Hiện Đại 3D (Modern Downtown / City Hall)
export function Icon3dModernCity({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="modern_glass_tower" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="modern_roof_spire" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      {/* Tòa nhà phụ bên trái */}
      <rect x="6" y="18" width="10" height="26" rx="2" fill="#64748b" stroke="#334155" strokeWidth="1.6" />
      <rect x="8.5" y="21" width="5" height="3" rx="0.8" fill="#f8fafc" />
      <rect x="8.5" y="26" width="5" height="3" rx="0.8" fill="#f8fafc" />
      <rect x="8.5" y="31" width="5" height="3" rx="0.8" fill="#f8fafc" />

      {/* Tòa nhà phụ bên phải */}
      <rect x="32" y="14" width="10" height="30" rx="2" fill="#0284c7" stroke="#075985" strokeWidth="1.6" />
      <rect x="34.5" y="17" width="5" height="3" rx="0.8" fill="#e0f2fe" />
      <rect x="34.5" y="22" width="5" height="3" rx="0.8" fill="#e0f2fe" />
      <rect x="34.5" y="27" width="5" height="3" rx="0.8" fill="#e0f2fe" />
      <rect x="34.5" y="32" width="5" height="3" rx="0.8" fill="#e0f2fe" />

      {/* Tòa tháp chính trung tâm kính cong hiện đại */}
      <rect x="14" y="6" width="20" height="38" rx="4" fill="url(#modern_glass_tower)" stroke="#0f172a" strokeWidth="2.2" />
      {/* Các hàng cửa sổ kính phát sáng ban đêm */}
      <rect x="17" y="10" width="6" height="4" rx="1" fill="#fef08a" />
      <rect x="25" y="10" width="6" height="4" rx="1" fill="#fef08a" />
      <rect x="17" y="17" width="6" height="4" rx="1" fill="#e0f2fe" />
      <rect x="25" y="17" width="6" height="4" rx="1" fill="#e0f2fe" />
      <rect x="17" y="24" width="6" height="4" rx="1" fill="#e0f2fe" />
      <rect x="25" y="24" width="6" height="4" rx="1" fill="#fef08a" />
      <rect x="17" y="31" width="6" height="4" rx="1" fill="#e0f2fe" />
      <rect x="25" y="31" width="6" height="4" rx="1" fill="#e0f2fe" />

      {/* Cửa sảnh xoay hiện đại tầng 1 */}
      <rect x="20" y="38" width="8" height="6" rx="1.5" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.2" />

      {/* Tháp ăng-ten kim cương phát quang trên đỉnh */}
      <line x1="24" y1="6" x2="24" y2="2" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="2" r="2" fill="#ef4444" />
    </svg>
  );
}

// 57. Ngôi Sao Lấp Lánh 3D Siêu Nét (Sparkle Star - Ultra HD Preset)
export function Icon3dSparkleStar({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="spk_halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#facc15" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="spk_facet_lt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="spk_facet_rb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="60%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="spk_sub_gem" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>

      {/* Vầng hào quang sáng rực đằng sau */}
      <circle cx="32" cy="32" r="28" fill="url(#spk_halo)" />

      {/* 4 cánh chéo phụ nhỏ (Diagonal sub-points) */}
      <path
        d="M 32 32 L 20 20 L 32 26 L 44 20 L 38 32 L 44 44 L 32 38 L 20 44 Z"
        fill="url(#spk_sub_gem)"
        stroke="#b45309"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Cánh chính 4 hướng: Phân tách diện 3D sáng tối (Faceted 3D Star) */}
      <path
        d="M 32 4 L 32 32 L 6 32 L 24 24 Z"
        fill="url(#spk_facet_lt)"
      />
      <path
        d="M 32 32 L 32 60 L 24 40 L 6 32 Z"
        fill="url(#spk_facet_lt)"
        opacity="0.85"
      />
      <path
        d="M 32 4 L 40 24 L 58 32 L 32 32 Z"
        fill="url(#spk_facet_rb)"
      />
      <path
        d="M 32 32 L 58 32 L 40 40 L 32 60 Z"
        fill="url(#spk_facet_rb)"
      />

      {/* Đường viền khung 3D sắc nét toàn thân sao */}
      <path
        d="M 32 4 L 39 25 L 60 32 L 39 39 L 32 60 L 25 39 L 4 32 L 25 25 Z"
        stroke="#78350f"
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Sống lưng chữ thập trắng phản quang rực rỡ */}
      <path d="M 32 8 L 32 56" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M 8 32 L 56 32" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />

      {/* Viên kim cương tâm sao sáng chói (Center Diamond Gleam) */}
      <polygon points="32,24 37,32 32,40 27,32" fill="#ffffff" />
      <circle cx="32" cy="32" r="2.8" fill="#ffffff" />

      {/* Ngôi sao lấp lánh phụ bay xung quanh */}
      <polygon points="48,12 50,16 54,18 50,20 48,24 46,20 42,18 46,16" fill="#ffffff" opacity="0.95" />
      <polygon points="14,46 15,48 18,49 15,50 14,53 13,50 10,49 13,48" fill="#ffffff" opacity="0.85" />
    </svg>
  );
}

// 58. Tia Sét Năng Lượng 3D Đa Diện (Lightning Bolt - Balanced HD Preset)
export function Icon3dLightningBolt({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="bolt_face_top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="bolt_face_side" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        <radialGradient id="bolt_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde047" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Vầng hào quang điện thế vàng */}
      <ellipse cx="32" cy="32" rx="26" ry="26" fill="url(#bolt_glow)" />

      {/* Mặt đùn 3D bên dưới / cạnh bên (Extruded 3D depth) */}
      <polygon
        points="37,6 15,34 30,34 25,58 49,28 34,28"
        fill="url(#bolt_face_side)"
        stroke="#431407"
        strokeWidth="2.4"
        strokeLinejoin="round"
        transform="translate(2, 3)"
      />

      {/* Mặt trước tia sét chính (Top Face) */}
      <polygon
        points="37,6 15,34 30,34 25,58 49,28 34,28"
        fill="url(#bolt_face_top)"
        stroke="#7c2d12"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Mặt phản quang trắng dọc thân sét */}
      <polygon points="36,10 19,32 29,32 27,48 44,29 33,29" fill="#ffffff" opacity="0.65" />
      <line x1="36" y1="10" x2="21" y2="31" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />

      {/* Đốm sao điện tử lóe sáng */}
      <polygon points="46,14 47.5,17 50,18 47.5,19 46,22 44.5,19 42,18 44.5,17" fill="#ffffff" />
      <polygon points="17,46 18,48 20,49 18,50 17,52 16,50 14,49 16,48" fill="#ffffff" />
    </svg>
  );
}

// 59. Viên Pin Sinh Thái Tiết Kiệm Năng Lượng 3D (Eco Battery - Eco Preset)
export function Icon3dBatteryEco({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="bat_body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="45%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="bat_cap" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="60%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="bat_leaf" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#a7f3d0" />
        </linearGradient>
      </defs>

      {/* Cực dương pin mạ chrome bạc */}
      <rect x="49" y="26" width="6" height="12" rx="3" fill="url(#bat_cap)" stroke="#1e293b" strokeWidth="1.8" />

      {/* Thân pin bo góc ngọc lục bảo (Emerald Battery Body) */}
      <rect x="7" y="16" width="44" height="32" rx="8" fill="url(#bat_body)" stroke="#064e3b" strokeWidth="2.4" />

      {/* Vệt gương kính phản chiếu mặt trên pin */}
      <rect x="11" y="19" width="36" height="4" rx="2" fill="#ffffff" opacity="0.6" />

      {/* 3 vạch năng lượng xanh neon đầy ắp (Full Charge Neon Bars) */}
      <rect x="13" y="26" width="7" height="16" rx="3.5" fill="#f0fdf4" stroke="#166534" strokeWidth="1.2" />
      <rect x="23" y="26" width="7" height="16" rx="3.5" fill="#f0fdf4" stroke="#166534" strokeWidth="1.2" />
      <rect x="33" y="26" width="7" height="16" rx="3.5" fill="#f0fdf4" stroke="#166534" strokeWidth="1.2" />

      {/* Mầm lá cây Eco non vươn lên từ pin */}
      <path
        d="M 23 18 C 17 9, 25 5, 29 8 C 33 11, 28 17, 23 18 Z"
        fill="url(#bat_leaf)"
        stroke="#064e3b"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M 27 17 C 33 10, 42 12, 40 17 C 37 21, 31 18, 27 17 Z"
        fill="url(#bat_leaf)"
        stroke="#064e3b"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Giọt sương sớm lấp lánh trên lá */}
      <circle cx="28" cy="10" r="1.4" fill="#ffffff" />
    </svg>
  );
}

// 60. Cần Câu Trúc Mộc Làng Quê 3D (Bamboo Fishing Rod)
export function Icon3dFishingRodBamboo({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="bamboo_wood" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#84cc16" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      <path d="M 5 31 C 12 28, 20 22, 28 8" stroke="url(#bamboo_wood)" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="12" cy="26" r="2.2" fill="#ef4444" />
      <circle cx="19" cy="19" r="2" fill="#ef4444" />
      <circle cx="25" cy="12" r="1.8" fill="#ef4444" />
      <path d="M 28 8 Q 32 15 29 27" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="2 1" />
      <circle cx="29" cy="27" r="3.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
      <path d="M 26 27 A 3 3 0 0 0 32 27" fill="#ffffff" />
    </svg>
  );
}

// 61. Cần Máy Carbon Chuyên Nghiệp 3D (Carbon Pro Fishing Rod)
export function Icon3dFishingRodPro({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="carbon_rod" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <path d="M 6 32 C 14 26, 22 18, 30 5" stroke="url(#carbon_rod)" strokeWidth="3.4" strokeLinecap="round" />
      <rect x="9" y="24" width="7" height="6" rx="2" fill="#facc15" stroke="#854d0e" strokeWidth="1.2" transform="rotate(-35 12 27)" />
      <circle cx="14" cy="27" r="2" fill="#ca8a04" />
      <circle cx="22" cy="14" r="1.5" stroke="#f8fafc" strokeWidth="1.2" fill="none" />
      <circle cx="28" cy="8" r="1.2" stroke="#f8fafc" strokeWidth="1.2" fill="none" />
      <path d="M 30 5 Q 35 15 32 24 A 3 3 0 0 1 29 27" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

// 62. Mồi Câu Trùn Quế 3D (Worm Bait Cup)
export function Icon3dBaitWorm({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <path d="M 6 15 L 8 28 L 24 28 L 26 15 Z" fill="#b45309" stroke="#451a03" strokeWidth="1.8" />
      <ellipse cx="16" cy="15" rx="10" ry="3.5" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
      <path d="M 12 16 C 10 11, 14 8, 17 12 C 19 15, 23 11, 25 7" stroke="#fb7185" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="25" cy="7" r="1.8" fill="#f43f5e" />
    </svg>
  );
}

// 63. Mồi Ruồi Lông Vũ Óng Ánh 3D (Fly Lure Bait)
export function Icon3dBaitLure({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <ellipse cx="15" cy="16" rx="9" ry="4.5" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.6" />
      <ellipse cx="14" cy="15" rx="6" ry="2" fill="#ffffff" opacity="0.75" />
      <circle cx="8" cy="15" r="2" fill="#facc15" stroke="#713f12" strokeWidth="0.8" />
      <circle cx="8" cy="15" r="1" fill="#0f172a" />
      <path d="M 23 16 L 30 11 L 28 16 L 30 21 Z" fill="#ec4899" stroke="#9d174d" strokeWidth="1.2" />
      <path d="M 16 20 C 16 26, 12 26, 12 23" stroke="#64748b" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// 64. Thùng Ướp Lạnh Ngư Dân 3D (Cooler Box)
export function Icon3dCoolerBox({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="cooler_blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      <rect x="5" y="13" width="22" height="15" rx="3.5" fill="url(#cooler_blue)" stroke="#0369a1" strokeWidth="1.8" />
      <rect x="4" y="9" width="24" height="5.5" rx="2" fill="#ffffff" stroke="#0369a1" strokeWidth="1.8" />
      <rect x="14" y="12" width="4" height="4" rx="1" fill="#facc15" stroke="#78350f" strokeWidth="1" />
      <path d="M 8 13 L 8 6 C 8 4, 24 4, 24 6 L 24 13" stroke="#e2e8f0" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// 65. Túi Thính Dụ Cá Truyền Thống 3D (Fish Chum Bag)
export function Icon3dFishChum({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <path d="M 9 14 C 9 8, 23 8, 23 14 C 25 18, 26 26, 24 28 C 21 30, 11 30, 8 28 C 6 26, 7 18, 9 14 Z" fill="#d97706" stroke="#78350f" strokeWidth="1.8" />
      <ellipse cx="16" cy="13" rx="5" ry="2" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.2" />
      <circle cx="13" cy="20" r="1.5" fill="#fef08a" />
      <circle cx="18" cy="22" r="1.5" fill="#fef08a" />
      <circle cx="15" cy="25" r="1.5" fill="#fef08a" />
    </svg>
  );
}

// 66. Quả Cà Chua Đỏ Mọng 3D (Juicy Tomato)
export function Icon3dTomato({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="tomato_skin" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="40%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="18" r="11" fill="url(#tomato_skin)" stroke="#7f1d1d" strokeWidth="1.8" />
      <ellipse cx="12" cy="14" rx="3.5" ry="2.2" fill="#ffffff" opacity="0.75" transform="rotate(-30 12 14)" />
      <path d="M 16 9 L 16 4 C 16 3, 19 3, 19 5" stroke="#15803d" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M 16 9 L 12 7 L 14 10 L 10 11 L 14 12 L 13 15 L 16 11 L 19 15 L 18 12 L 22 11 L 18 10 L 20 7 Z" fill="#22c55e" stroke="#14532d" strokeWidth="1" />
    </svg>
  );
}

// 67. Quả Dâu Tây Đỏ Ruby 3D (Ruby Strawberry)
export function Icon3dStrawberry({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="strawberry_grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="45%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>
      </defs>
      <path d="M 9 12 C 7 17, 10 26, 16 29 C 22 26, 25 17, 23 12 C 20 8, 12 8, 9 12 Z" fill="url(#strawberry_grad)" stroke="#4c0519" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="15" r="0.9" fill="#facc15" />
      <circle cx="16" cy="16" r="0.9" fill="#facc15" />
      <circle cx="20" cy="15" r="0.9" fill="#facc15" />
      <circle cx="14" cy="20" r="0.9" fill="#facc15" />
      <circle cx="18" cy="20" r="0.9" fill="#facc15" />
      <circle cx="16" cy="24" r="0.9" fill="#facc15" />
      <path d="M 16 8 L 16 4" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
      <path d="M 10 10 L 16 11 L 22 10 L 18 8 L 16 6 L 14 8 Z" fill="#4ade80" stroke="#166534" strokeWidth="1.2" />
    </svg>
  );
}

// 68. Bao Phân Bón Tăng Trưởng Sinh Học 3D (Fertilizer Bag)
export function Icon3dFertilizerBag({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="fert_bag" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <path d="M 8 10 L 24 10 L 26 28 L 6 28 Z" fill="url(#fert_bag)" stroke="#14532d" strokeWidth="1.8" />
      <path d="M 6 10 C 10 8, 22 8, 26 10" stroke="#14532d" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="19" r="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />
      <path d="M 16 22 C 16 17, 18 16, 19 16 C 18 19, 17 21, 16 22 Z" fill="#15803d" />
    </svg>
  );
}

// 69. Chai Thuốc Trừ Sâu Thảo Mộc 3D (Bio Pesticide Bottle)
export function Icon3dPesticideBottle({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <rect x="9" y="14" width="14" height="15" rx="3.5" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
      <rect x="11" y="17" width="10" height="7" rx="1.5" fill="#4ade80" stroke="#166534" strokeWidth="1" />
      <path d="M 14 14 L 14 9 L 18 9 L 18 14 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1.4" />
      <path d="M 12 9 L 24 9 L 24 6 L 16 6 L 12 7 Z" fill="#ea580c" stroke="#7c2d12" strokeWidth="1.4" />
      <path d="M 14 10 L 10 14" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 70. Trái Tim Thạch Hồng Tương Tác 3D (Heart Reaction)
export function Icon3dHeartReaction({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="jelly_heart" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="45%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#be185d" />
        </radialGradient>
      </defs>
      <path
        d="M 16 28 C 16 28, 4 20, 4 12 C 4 7, 8 4, 12 4 C 14 4, 15.5 5, 16 6.5 C 16.5 5, 18 4, 20 4 C 24 4, 28 7, 28 12 C 28 20, 16 28, 16 28 Z"
        fill="url(#jelly_heart)"
        stroke="#831843"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <ellipse cx="11" cy="9" rx="2.5" ry="1.4" fill="#ffffff" opacity="0.8" transform="rotate(-30 11 9)" />
    </svg>
  );
}

// 71. Bàn Tay Vẫy Chào Thân Thiện 3D (Wave Hand)
export function Icon3dWaveHand({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <path
        d="M 10 26 L 8 16 C 8 14, 11 13, 12 15 L 12 10 C 12 8, 15 8, 15 10 L 15 7 C 15 5, 18 5, 18 7 L 18 9 C 18 7, 21 7, 21 9 L 21 17 C 24 16, 26 18, 25 21 C 24 24, 20 28, 16 28 Z"
        fill="#fde047"
        stroke="#854d0e"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M 24 6 C 26 8, 27 11, 26 14" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M 27 4 C 30 7, 31 12, 29 16" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// 72. Ống Pháo Giấy Kim Tuyến Lễ Hội 3D (Party Popper)
export function Icon3dPartyPopper({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="pop_cone1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="pop_cone2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="60%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>
        <radialGradient id="pop_rim" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
      </defs>

      {/* Nón loa pháo giấy 3D có sọc vàng đỏ rực rỡ */}
      <g stroke="#451a03" strokeWidth="2" strokeLinejoin="round">
        <polygon points="10,54 26,45 19,30" fill="url(#pop_cone1)" />
        <polygon points="19,30 26,45 36,33 27,20" fill="url(#pop_cone2)" />
      </g>
      {/* Vành miệng loa nón mở hướng lên trên */}
      <ellipse cx="32" cy="26" rx="9" ry="5.5" transform="rotate(-35 32 26)" fill="url(#pop_rim)" stroke="#0c4a6e" strokeWidth="2" />
      <ellipse cx="32" cy="26" rx="6.5" ry="3.5" transform="rotate(-35 32 26)" fill="#0f172a" />

      {/* Vệt ánh kim trên thân pháo */}
      <line x1="16" y1="46" x2="22" y2="34" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

      {/* Dải ruy băng lượn sóng bay ra (Serpentine Streamers) */}
      <path
        d="M 33 22 Q 38 12 46 16 T 54 8"
        stroke="#f43f5e"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 36 26 Q 44 24 48 31 T 58 28"
        stroke="#38bdf8"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 28 19 Q 32 8 36 6 T 43 2"
        stroke="#facc15"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Pháo hoa chấm tròn & ngôi sao giấy lấp lánh (Confetti) */}
      <circle cx="43" cy="11" r="2.8" fill="#a855f7" stroke="#581c87" strokeWidth="1" />
      <circle cx="56" cy="18" r="2.5" fill="#22c55e" stroke="#14532d" strokeWidth="1" />
      <circle cx="48" cy="24" r="2.2" fill="#fb923c" stroke="#7c2d12" strokeWidth="1" />
      <polygon points="41,4 42.5,7 45,7.5 42.5,8 41,11 39.5,8 37,7.5 39.5,7" fill="#ffffff" />
      <polygon points="58,9 59,11 61,11.5 59,12 58,14 57,12 55,11.5 57,11" fill="#fde047" />
    </svg>
  );
}

// 73. Cúp Vàng Vinh Quang 3D (Trophy Cup)
export function Icon3dTrophyCup({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="gold_cup" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      <path d="M 9 6 L 23 6 C 23 15, 19 19, 16 19 C 13 19, 9 15, 9 6 Z" fill="url(#gold_cup)" stroke="#78350f" strokeWidth="1.8" />
      <path d="M 9 8 C 5 8, 5 14, 9 15" stroke="#ca8a04" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M 23 8 C 27 8, 27 14, 23 15" stroke="#ca8a04" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <rect x="14" y="19" width="4" height="4" fill="#ca8a04" />
      <rect x="10" y="23" width="12" height="5" rx="1.5" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
      <polygon points="16,9 17,12 20,12 18,14 19,17 16,15 13,17 14,14 12,12 15,12" fill="#ffffff" />
    </svg>
  );
}

// 74. Biển Cảnh Báo Tam Giác 3D (Warning Alert)
export function Icon3dWarningAlert({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <polygon points="16,3 29,27 3,27" fill="#facc15" stroke="#78350f" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="16,7 26,25 6,25" fill="#fef08a" />
      <line x1="16" y1="11" x2="16" y2="18" stroke="#78350f" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="16" cy="22" r="1.5" fill="#78350f" />
    </svg>
  );
}

// 75. Ly Nước Dừa Dã Ngoại 3D (Tiki Coconut Drink)
export function Icon3dDrinkCoconut({ size = 26, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <path d="M 7 14 C 7 24, 25 24, 25 14 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.8" />
      <ellipse cx="16" cy="14" rx="9" ry="3.5" fill="#ffffff" stroke="#451a03" strokeWidth="1.4" />
      <ellipse cx="16" cy="14" rx="7" ry="2.2" fill="#67e8f9" />
      <path d="M 14 15 L 12 5 L 8 4" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none" />
      <polygon points="21,14 26,7 20,4 17,9" fill="#f43f5e" stroke="#881337" strokeWidth="1" />
    </svg>
  );
}

// 76. Nút Dấu Cộng Đồ Chơi 3D (Toy Plus Button - Candy Refill)
export function Icon3dPlus({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`icon-3d ${className}`}>
      <circle cx="12" cy="12" r="10.5" fill="#22c55e" stroke="#14532d" strokeWidth="1.6" />
      <circle cx="12" cy="11.5" r="9" fill="#4ade80" />
      <line x1="12" y1="7" x2="12" y2="17" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="7" y1="12" x2="17" y2="12" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

// 77. Điện Thoại Thông Minh Kaia 3D (Kaia Smartphone)
export function Icon3dSmartPhone({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <rect x="8" y="3" width="20" height="30" rx="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
      <rect x="10.5" y="6" width="15" height="22" rx="3.5" fill="#ffffff" />
      <circle cx="18" cy="30.5" r="1.5" fill="#ffffff" />
      <circle cx="14" cy="11" r="2" fill="#ef4444" />
      <circle cx="22" cy="11" r="2" fill="#eab308" />
      <circle cx="14" cy="17" r="2" fill="#22c55e" />
      <circle cx="22" cy="17" r="2" fill="#a855f7" />
    </svg>
  );
}// 78. Bước Chân Dẫn Đường 3D (Footsteps / Navigation)
export function Icon3dFootsteps({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="pt_footstep_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
      </defs>
      {/* Bước chân trái */}
      <ellipse cx="11" cy="18" rx="4.5" ry="7" fill="url(#pt_footstep_grad)" stroke="#15803d" strokeWidth="1.8" transform="rotate(-12 11 18)" />
      <circle cx="8" cy="9" r="1.5" fill="#ffffff" stroke="#15803d" strokeWidth="1.2" />
      <circle cx="11.5" cy="8.5" r="1.6" fill="#ffffff" stroke="#15803d" strokeWidth="1.2" />
      <circle cx="14.8" cy="9.5" r="1.4" fill="#ffffff" stroke="#15803d" strokeWidth="1.2" />

      {/* Bước chân phải */}
      <ellipse cx="22" cy="13" rx="4.5" ry="7" fill="url(#pt_footstep_grad)" stroke="#15803d" strokeWidth="1.8" transform="rotate(12 22 13)" />
      <circle cx="19" cy="4" r="1.5" fill="#ffffff" stroke="#15803d" strokeWidth="1.2" />
      <circle cx="22.5" cy="3.5" r="1.6" fill="#ffffff" stroke="#15803d" strokeWidth="1.2" />
      <circle cx="25.8" cy="4.5" r="1.4" fill="#ffffff" stroke="#15803d" strokeWidth="1.2" />
    </svg>
  );
}

// 79. Con Dấu Mộc Son Tân Thủ 3D (Beginner Stamp Seal)
export function Icon3dStamp({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="stamp_handle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
        <radialGradient id="stamp_base" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#dc2626" />
        </radialGradient>
      </defs>
      {/* Tay cầm gỗ tròn */}
      <circle cx="18" cy="9" r="6" fill="url(#stamp_handle)" stroke="#7c2d12" strokeWidth="1.6" />
      <ellipse cx="16.5" cy="7.5" rx="2" ry="1.2" fill="#ffffff" opacity="0.6" />
      {/* Cổ tay cầm */}
      <path d="M 15 15 L 13 22 L 23 22 L 21 15 Z" fill="url(#stamp_handle)" stroke="#7c2d12" strokeWidth="1.5" />
      {/* Khối đế đồng/gỗ */}
      <rect x="7" y="22" width="22" height="5" rx="2" fill="#facc15" stroke="#854d0e" strokeWidth="1.5" />
      {/* Mặt mộc cao su đỏ */}
      <rect x="8" y="27" width="20" height="4.5" rx="1.5" fill="url(#stamp_base)" stroke="#991b1b" strokeWidth="1.4" />
      <line x1="11" y1="29.2" x2="25" y2="29.2" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

