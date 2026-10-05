import React from 'react';

/**
 * 100% PURE VECTOR 3D GAME ICONS - PLAY TOGETHER STYLE
 * Tuyệt đối không dùng Emoji - Dựng hình khối 3D vector với multi-layer gradients,
 * specular highlights, drop shadows chuẩn thẩm mỹ Play Together / Cozy Farm.
 */

// 1. BÌNH TƯỚI NƯỚC HOA CÚC (Watering Can with Daisy)
export function Icon3dWateringCanDaisy({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="can_body_grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="35%" stopColor="#60a5fa" />
          <stop offset="75%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </radialGradient>
        <linearGradient id="can_handle_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="can_spout_grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
        <radialGradient id="daisy_center" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>
        <filter id="can_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#1e3a8a" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Bóng đổ gầm */}
      <ellipse cx="50" cy="85" rx="30" ry="7" fill="#0f172a" opacity="0.14" />

      <g filter="url(#can_shadow)">
        {/* Quai cầm phía sau bo tròn cong điệu đà */}
        <path
          d="M 68 44 C 84 44, 88 66, 66 73"
          stroke="url(#can_handle_grad)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 68 44 C 81 44, 85 64, 66 71"
          stroke="#dbeafe"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />

        {/* Quai xách trên đỉnh */}
        <path
          d="M 40 34 C 40 20, 60 20, 60 34"
          stroke="url(#can_handle_grad)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 42 32 C 42 22, 58 22, 58 32"
          stroke="#dbeafe"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />

        {/* Vòi phun dài chéo sang trái */}
        <path
          d="M 40 68 L 22 45"
          stroke="url(#can_spout_grad)"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* Nắp phun vòi hoa sen */}
        <ellipse cx="19" cy="42" rx="7" ry="4" transform="rotate(-40 19 42)" fill="#93c5fd" stroke="#1d4ed8" strokeWidth="1.5" />
        <ellipse cx="19" cy="42" rx="5" ry="2.5" transform="rotate(-40 19 42)" fill="#1e40af" />

        {/* Thân bình tưới mập mạp tròn trịa */}
        <path
          d="M 33 40 C 33 35, 67 35, 67 40 L 69 72 C 69 79, 31 79, 31 72 Z"
          fill="url(#can_body_grad)"
        />
        {/* Nắp miệng bình */}
        <ellipse cx="50" cy="39" rx="17" ry="5.5" fill="#93c5fd" stroke="#1e40af" strokeWidth="1.5" />
        <ellipse cx="50" cy="38" rx="14" ry="4" fill="#3b82f6" />

        {/* Viền đế bình */}
        <path d="M 31 72 C 31 80, 69 80, 69 72" stroke="#1e40af" strokeWidth="2.5" fill="none" />

        {/* Vệt phản quang bóng 3D */}
        <ellipse cx="40" cy="50" rx="3.5" ry="7" fill="#ffffff" opacity="0.65" transform="rotate(-20 40 50)" />

        {/* Bông hoa cúc trắng nổi 3D đặc trưng trên thân */}
        <g transform="translate(54, 60)">
          {/* 6 cánh hoa trắng tròn trịa */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <ellipse
              key={i}
              cx="0"
              cy="-6"
              rx="3"
              ry="4.5"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="0.8"
              transform={`rotate(${deg} 0 0)`}
            />
          ))}
          {/* Nhụy hoa vàng cam */}
          <circle cx="0" cy="0" r="4.2" fill="url(#daisy_center)" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="-1" cy="-1" r="1.2" fill="#ffffff" opacity="0.8" />
        </g>
      </g>
    </svg>
  );
}

// 2. CUỐC LÀM ĐẤT 3D (Garden Hoe)
export function Icon3dHoeGarden({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="hoe_shaft" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="40%" stopColor="#d97706" />
          <stop offset="70%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="hoe_metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#cbd5e1" />
          <stop offset="75%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <filter id="hoe_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="50" cy="85" rx="26" ry="6" fill="#0f172a" opacity="0.12" />

      <g filter="url(#hoe_shadow)">
        {/* Cán gỗ sồi dài chéo góc 45 độ */}
        <rect
          x="44"
          y="18"
          width="12"
          height="68"
          rx="6"
          transform="rotate(42 50 52)"
          fill="url(#hoe_shaft)"
          stroke="#451a03"
          strokeWidth="2.2"
        />
        {/* Đuôi cán gỗ bo tròn bọc sắt */}
        <circle cx="26" cy="78" r="6.5" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />

        {/* Khớp kim loại nối lưỡi cuốc */}
        <rect
          x="62"
          y="24"
          width="14"
          height="12"
          rx="3"
          transform="rotate(42 69 30)"
          fill="#334155"
          stroke="#0f172a"
          strokeWidth="1.8"
        />

        {/* Lưỡi cuốc thép cong bản rộng */}
        <path
          d="M 64 20 C 78 20, 88 32, 85 45 C 80 47, 72 40, 68 34 Z"
          fill="url(#hoe_metal)"
          stroke="#0f172a"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Lưỡi chém sáng bóng */}
        <path d="M 85 45 C 80 47, 72 40, 68 34" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// 3. BAO HẠT GIỐNG NÔNG TRẠI (Kraft Seed Bag)
export function Icon3dSeedBagKraft({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="sack_paper" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="50%" stopColor="#fde68a" />
          <stop offset="85%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>
        <linearGradient id="sprout_leaf" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>
        <filter id="sack_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#78350f" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="50" cy="85" rx="28" ry="7" fill="#0f172a" opacity="0.14" />

      <g filter="url(#sack_shadow)">
        {/* Mép bao gập nếp trên cùng */}
        <path
          d="M 33 26 C 42 22, 58 22, 67 26 L 65 33 C 57 30, 43 30, 35 33 Z"
          fill="#b45309"
          stroke="#451a03"
          strokeWidth="1.8"
        />

        {/* Thân bao giấy Kraft phồng tròn đáy */}
        <path
          d="M 34 32 C 34 32, 66 32, 66 32 C 73 34, 78 48, 76 74 C 75 80, 25 80, 24 74 C 22 48, 27 34, 34 32 Z"
          fill="url(#sack_paper)"
          stroke="#451a03"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Nếp gấp nhăn góc bao */}
        <path d="M 28 68 Q 36 74 44 76" stroke="#92400e" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M 72 68 Q 64 74 56 76" stroke="#92400e" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />

        {/* Huy hiệu mầm cây xanh biểu tượng trên thân bao */}
        <g transform="translate(50, 56)">
          <circle cx="0" cy="0" r="14" fill="#ffffff" opacity="0.95" stroke="#f59e0b" strokeWidth="1.5" />
          {/* Mầm lá kép xanh tươi */}
          <path
            d="M 0 6 C -2 -3, -9 -5, -8 1 C -7 5, -1 6, 0 6 Z"
            fill="url(#sprout_leaf)"
            stroke="#14532d"
            strokeWidth="1"
          />
          <path
            d="M 0 6 C 2 -3, 9 -5, 8 1 C 7 5, 1 6, 0 6 Z"
            fill="url(#sprout_leaf)"
            stroke="#14532d"
            strokeWidth="1"
          />
          <path d="M 0 6 L 0 0" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

// 4. BÌNH SỮA BÒ THỦY TINH (Glass Milk Bottle with Cute Cow)
export function Icon3dMilkBottle({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="milk_cap" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </radialGradient>
        <linearGradient id="milk_liquid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <filter id="milk_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#0284c7" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="50" cy="85" rx="22" ry="6" fill="#0f172a" opacity="0.14" />

      <g filter="url(#milk_shadow)">
        {/* Nắp chai xanh biển */}
        <ellipse cx="50" cy="22" rx="10" ry="4" fill="url(#milk_cap)" stroke="#1e40af" strokeWidth="1.5" />
        <rect x="40" y="22" width="20" height="6" fill="url(#milk_cap)" stroke="#1e40af" strokeWidth="1.5" />

        {/* Cổ chai thuôn dài */}
        <path
          d="M 42 27 L 42 36 C 42 44, 30 46, 30 56 L 30 76 C 30 82, 70 82, 70 76 L 70 56 C 70 46, 58 44, 58 36 L 58 27 Z"
          fill="url(#milk_liquid)"
          stroke="#0284c7"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Vệt ánh sáng bóng trên vai chai thủy tinh */}
        <path d="M 34 52 C 34 46, 42 44, 46 38" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
        <line x1="34" y1="58" x2="34" y2="74" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

        {/* Nhãn bò sữa Chibi ngộ nghĩnh */}
        <g transform="translate(50, 64)">
          <rect x="-14" y="-12" width="28" height="22" rx="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
          {/* Khuôn mặt bò con */}
          <ellipse cx="0" cy="-2" rx="9" ry="7.5" fill="#ffffff" stroke="#475569" strokeWidth="1" />
          {/* Mõm hồng */}
          <ellipse cx="0" cy="2" rx="6" ry="3.5" fill="#fbcfe8" stroke="#f472b6" strokeWidth="0.8" />
          <circle cx="-2.5" cy="2" r="0.8" fill="#475569" />
          <circle cx="2.5" cy="2" r="0.8" fill="#475569" />
          {/* 2 mắt tròn xoe */}
          <circle cx="-4" cy="-4" r="1.2" fill="#0f172a" />
          <circle cx="4" cy="-4" r="1.2" fill="#0f172a" />
          {/* Đốm đen bò sữa */}
          <path d="M -9 -4 C -9 -7, -4 -7, -5 -4 Z" fill="#334155" />
          <path d="M 6 -5 C 9 -5, 9 -2, 7 -2 Z" fill="#334155" />
        </g>
      </g>
    </svg>
  );
}

// 5. QUẢ TÁO ĐỎ TƯƠI 3D (Glossy Red Apple)
export function Icon3dRedApple({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="apple_skin" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="35%" stopColor="#ef4444" />
          <stop offset="70%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>
        <linearGradient id="apple_leaf" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>
        <filter id="apple_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#7f1d1d" floodOpacity="0.3" />
        </filter>
      </defs>

      <ellipse cx="50" cy="85" rx="26" ry="6.5" fill="#0f172a" opacity="0.14" />

      <g filter="url(#apple_shadow)">
        {/* Cuống táo nâu cong */}
        <path d="M 50 34 C 49 20, 56 16, 60 14" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" fill="none" />

        {/* Lá xanh mơn mởn */}
        <path
          d="M 52 24 C 64 16, 74 20, 72 28 C 66 32, 56 28, 52 24 Z"
          fill="url(#apple_leaf)"
          stroke="#14532d"
          strokeWidth="1.2"
        />

        {/* Trái táo đỏ mọng hình tim bầu bĩnh */}
        <path
          d="M 50 36 C 42 28, 22 28, 22 48 C 22 72, 38 84, 50 84 C 62 84, 78 72, 78 48 C 78 28, 58 28, 50 36 Z"
          fill="url(#apple_skin)"
          stroke="#450a0a"
          strokeWidth="2.2"
        />

        {/* Vệt phản chiếu bóng sáng cong */}
        <ellipse cx="36" cy="46" rx="5" ry="9" fill="#ffffff" opacity="0.75" transform="rotate(-25 36 46)" />
        <circle cx="30" cy="62" r="3" fill="#ffffff" opacity="0.5" />
      </g>
    </svg>
  );
}

// 6. CÁ XANH CHIBI 3D (Cute Striped Blue Fish)
export function Icon3dBlueFish({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="fish_body" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="40%" stopColor="#60a5fa" />
          <stop offset="85%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e40af" />
        </radialGradient>
        <filter id="fish_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#1e3a8a" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="50" cy="85" rx="28" ry="6" fill="#0f172a" opacity="0.14" />

      <g filter="url(#fish_shadow)">
        {/* Đuôi cá xòe 3 cánh */}
        <path
          d="M 68 50 C 82 34, 88 40, 88 50 C 88 60, 82 66, 68 50 Z"
          fill="#3b82f6"
          stroke="#1e3a8a"
          strokeWidth="2"
        />

        {/* Vây lưng cá */}
        <path d="M 44 32 C 50 20, 62 26, 64 34 Z" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="1.8" />

        {/* Thân cá tròn mập mạp */}
        <ellipse cx="46" cy="50" rx="28" ry="20" fill="url(#fish_body)" stroke="#1e3a8a" strokeWidth="2.4" />

        {/* Vệt sọc lưng cá màu xanh đậm */}
        <path d="M 42 31 Q 40 40 44 48" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M 52 32 Q 50 42 54 50" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M 62 36 Q 60 44 63 52" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Mắt cá to tròn anime đáng yêu */}
        <circle cx="28" cy="46" r="6" fill="#ffffff" stroke="#1e3a8a" strokeWidth="1.2" />
        <circle cx="27" cy="46" r="3.6" fill="#0f172a" />
        <circle cx="25.5" cy="44.5" r="1.5" fill="#ffffff" />

        {/* Má hồng đáng yêu */}
        <ellipse cx="28" cy="55" rx="3.5" ry="2" fill="#f472b6" opacity="0.8" />

        {/* Vây bơi hình quạt */}
        <path d="M 40 54 C 48 54, 52 64, 42 63 Z" fill="#93c5fd" stroke="#1d4ed8" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// 7. GHẾ GỖ COZY NỘI THẤT (Cozy Wooden Chair)
export function Icon3dWoodenChair({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="wood_chair_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#d97706" />
          <stop offset="85%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <filter id="chair_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#451a03" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="50" cy="88" rx="28" ry="6.5" fill="#0f172a" opacity="0.14" />

      <g filter="url(#chair_shadow)">
        {/* Chân ghế sau */}
        <line x1="36" y1="52" x2="36" y2="82" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
        <line x1="64" y1="52" x2="64" y2="82" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />

        {/* Tựa lưng ghế */}
        <rect x="33" y="16" width="34" height="8" rx="4" fill="url(#wood_chair_grad)" stroke="#451a03" strokeWidth="2" />
        <rect x="37" y="24" width="5" height="28" rx="2" fill="url(#wood_chair_grad)" />
        <rect x="47.5" y="24" width="5" height="28" rx="2" fill="url(#wood_chair_grad)" />
        <rect x="58" y="24" width="5" height="28" rx="2" fill="url(#wood_chair_grad)" />

        {/* Mặt ngồi ghế gỗ bo tròn vát 3D */}
        <rect x="28" y="50" width="44" height="12" rx="5" fill="url(#wood_chair_grad)" stroke="#451a03" strokeWidth="2.2" />
        <rect x="30" y="51" width="40" height="4" rx="2" fill="#fef3c7" opacity="0.6" />

        {/* Chân ghế trước */}
        <line x1="33" y1="62" x2="31" y2="86" stroke="#92400e" strokeWidth="7" strokeLinecap="round" />
        <line x1="67" y1="62" x2="69" y2="86" stroke="#92400e" strokeWidth="7" strokeLinecap="round" />
        {/* Khung giằng chân ngang */}
        <line x1="32" y1="76" x2="68" y2="76" stroke="#b45309" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// 8. ĐÈN BÀN ẤM CÚNG (Cozy Table Lamp)
export function Icon3dTableLamp({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="lamp_shade" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#fef3c7" />
          <stop offset="85%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <linearGradient id="lamp_stand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <filter id="lamp_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#78350f" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="50" cy="85" rx="22" ry="6" fill="#0f172a" opacity="0.14" />

      <g filter="url(#lamp_shadow)">
        {/* Chân đế đèn gỗ tròn */}
        <ellipse cx="50" cy="82" rx="16" ry="6" fill="url(#lamp_stand)" stroke="#451a03" strokeWidth="2" />
        <ellipse cx="50" cy="80" rx="13" ry="4" fill="#fef08a" opacity="0.5" />

        {/* Trục thân đèn */}
        <rect x="47" y="52" width="6" height="30" rx="3" fill="url(#lamp_stand)" stroke="#451a03" strokeWidth="1.5" />
        <circle cx="50" cy="62" r="5" fill="#f59e0b" stroke="#78350f" strokeWidth="1.2" />

        {/* Chao đèn nón cụt màu kem */}
        <path
          d="M 38 28 L 62 28 L 74 54 L 26 54 Z"
          fill="url(#lamp_shade)"
          stroke="#b45309"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Đỉnh chao nón */}
        <ellipse cx="50" cy="28" rx="12" ry="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
        <circle cx="50" cy="25" r="3" fill="#d97706" />

        {/* Đáy chao đèn loang ánh vàng ấm */}
        <ellipse cx="50" cy="54" rx="24" ry="6.5" fill="#fef08a" stroke="#d97706" strokeWidth="1.8" />
      </g>
    </svg>
  );
}

// 9. BA LÔ XANH PHIÊU LƯU (Blue Backpack with Star Badge)
export function Icon3dBlueBackpack({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="backpack_blue" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="85%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>
        <radialGradient id="star_yellow" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="60%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </radialGradient>
        <filter id="pack_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#1e3a8a" floodOpacity="0.28" />
        </filter>
      </defs>

      <ellipse cx="50" cy="85" rx="26" ry="6" fill="#0f172a" opacity="0.14" />

      <g filter="url(#pack_shadow)">
        {/* Quai xách trên */}
        <path d="M 40 24 C 40 14, 60 14, 60 24" stroke="#1e3a8a" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 40 24 C 40 14, 60 14, 60 24" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Hai quai đeo hai bên */}
        <path d="M 28 40 C 20 45, 20 65, 26 75" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 72 40 C 80 45, 80 65, 74 75" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* Thân ba lô vòm cong căng tròn */}
        <path
          d="M 28 38 C 28 24, 72 24, 72 38 L 76 75 C 76 81, 24 81, 24 75 Z"
          fill="url(#backpack_blue)"
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Nắp túi trên vát cong */}
        <path
          d="M 30 38 C 30 26, 70 26, 70 38 C 70 48, 30 48, 30 38 Z"
          fill="#3b82f6"
          stroke="#1e3a8a"
          strokeWidth="1.8"
        />

        {/* Ngăn phụ túi trước bo tròn */}
        <rect x="33" y="52" width="34" height="24" rx="8" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="2" />
        {/* Khóa kéo trắng */}
        <path d="M 37 54 L 63 54" stroke="#bfdbfe" strokeWidth="2" strokeDasharray="3 2" />

        {/* Ngôi sao vàng thương hiệu Play Together ở giữa túi */}
        <g transform="translate(50, 65)">
          <polygon
            points="0,-7 2.2,-2.2 7.3,-1.5 3.5,2.1 4.5,7.2 0,4.6 -4.5,7.2 -3.5,2.1 -7.3,-1.5 -2.2,-2.2"
            fill="url(#star_yellow)"
            stroke="#ca8a04"
            strokeWidth="1"
          />
          <circle cx="-1" cy="-1" r="1.5" fill="#ffffff" opacity="0.85" />
        </g>
      </g>
    </svg>
  );
}

// 10. MŨ RƠM NÔNG DÂN (Straw Sunhat with Red Ribbon)
export function Icon3dStrawHat({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="straw_crown" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="45%" stopColor="#fde047" />
          <stop offset="85%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </radialGradient>
        <radialGradient id="straw_brim" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#854d0e" />
        </radialGradient>
        <filter id="hat_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#78350f" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="50" cy="85" rx="34" ry="7" fill="#0f172a" opacity="0.14" />

      <g filter="url(#hat_shadow)">
        {/* Vành mũ tròn rộng lượn sóng */}
        <ellipse cx="50" cy="64" rx="42" ry="17" fill="url(#straw_brim)" stroke="#78350f" strokeWidth="2.2" />

        {/* Chóp mũ tròn nhô cao */}
        <path
          d="M 33 55 C 33 32, 67 32, 67 55 Z"
          fill="url(#straw_crown)"
          stroke="#78350f"
          strokeWidth="2"
        />

        {/* Dải ruy băng đỏ cam thắt quanh vành */}
        <ellipse cx="50" cy="56" rx="18" ry="6.5" fill="#ef4444" stroke="#991b1b" strokeWidth="1.8" />
        <ellipse cx="50" cy="54.5" rx="16" ry="5.5" fill="#f87171" opacity="0.8" />

        {/* Vệt bóng sáng trên đỉnh chóp mũ */}
        <ellipse cx="44" cy="40" rx="5" ry="3" fill="#ffffff" opacity="0.75" transform="rotate(-15 44 40)" />
      </g>
    </svg>
  );
}

// 11. HỘP QUÀ TẶNG ĐỎ NƠ VÀNG (Red Gift Box with Golden Ribbon)
export function Icon3dGiftBox({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="gift_box_body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="35%" stopColor="#ef4444" />
          <stop offset="75%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <radialGradient id="gift_ribbon" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>
        <filter id="gift_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#7f1d1d" floodOpacity="0.3" />
        </filter>
      </defs>

      <ellipse cx="50" cy="85" rx="26" ry="6.5" fill="#0f172a" opacity="0.14" />

      <g filter="url(#gift_shadow)">
        {/* Thân hộp quà vuông vắn */}
        <rect x="25" y="44" width="50" height="38" rx="8" fill="url(#gift_box_body)" stroke="#450a0a" strokeWidth="2.2" />

        {/* Ruy băng dọc thân hộp */}
        <rect x="44" y="44" width="12" height="38" fill="url(#gift_ribbon)" stroke="#a16207" strokeWidth="1" />

        {/* Nắp hộp quà nhô rộng */}
        <rect x="21" y="34" width="58" height="15" rx="5" fill="url(#gift_box_body)" stroke="#450a0a" strokeWidth="2.2" />
        <rect x="44" y="34" width="12" height="15" fill="url(#gift_ribbon)" stroke="#a16207" strokeWidth="1" />

        {/* Nơ hoa vàng xòe 2 cánh bồng bềnh */}
        <ellipse cx="40" cy="27" rx="8" ry="6" transform="rotate(-30 40 27)" fill="url(#gift_ribbon)" stroke="#a16207" strokeWidth="1.5" />
        <ellipse cx="60" cy="27" rx="8" ry="6" transform="rotate(30 60 27)" fill="url(#gift_ribbon)" stroke="#a16207" strokeWidth="1.5" />
        <circle cx="50" cy="29" r="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// 12. GỖ KHÚC THANH GỖ (Wood Lumber Planks)
export function Icon3dWoodPlanks({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="plank_top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="50%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="plank_side" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <filter id="wood_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#451a03" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="50" cy="85" rx="30" ry="7" fill="#0f172a" opacity="0.14" />

      <g filter="url(#wood_shadow)">
        {/* Khối gỗ chữ nhật chéo 3D */}
        {/* Mặt trên */}
        <polygon points="20,44 68,26 84,40 36,60" fill="url(#plank_top)" stroke="#451a03" strokeWidth="2.2" strokeLinejoin="round" />
        {/* Mặt hông phải */}
        <polygon points="36,60 84,40 84,54 36,74" fill="url(#plank_side)" stroke="#451a03" strokeWidth="2.2" strokeLinejoin="round" />
        {/* Mặt trước vát cắt thấy vân gỗ */}
        <polygon points="20,44 36,60 36,74 20,58" fill="#d97706" stroke="#451a03" strokeWidth="2.2" strokeLinejoin="round" />

        {/* Vân vòng năm tăng trưởng thân cây */}
        <ellipse cx="28" cy="59" rx="5" ry="4" stroke="#92400e" strokeWidth="1.2" fill="none" />
        <circle cx="28" cy="59" r="1.5" fill="#451a03" />

        {/* Các đường vân thớ gỗ trên mặt */}
        <line x1="32" y1="44" x2="68" y2="33" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="40" y1="52" x2="74" y2="40" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// 13. CỦ CÀ RỐT TƯƠI MẬP (Plump 3D Carrot)
export function Icon3dCarrotPlump({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="carrot_body" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="45%" stopColor="#fb923c" />
          <stop offset="75%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#9a3412" />
        </radialGradient>
        <linearGradient id="carrot_tops" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>
        <filter id="carrot_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#7c2d12" floodOpacity="0.28" />
        </filter>
      </defs>

      <ellipse cx="50" cy="85" rx="22" ry="6" fill="#0f172a" opacity="0.14" />

      <g filter="url(#carrot_shadow)">
        {/* Chùm lá xanh trên đầu */}
        <path d="M 64 24 C 64 12, 74 10, 76 18 C 76 26, 68 28, 64 24 Z" fill="url(#carrot_tops)" stroke="#14532d" strokeWidth="1.2" />
        <path d="M 58 20 C 58 8, 66 6, 68 14 C 68 22, 60 24, 58 20 Z" fill="url(#carrot_tops)" stroke="#14532d" strokeWidth="1.2" />
        <path d="M 54 26 C 48 16, 54 12, 58 20 Z" fill="url(#carrot_tops)" stroke="#14532d" strokeWidth="1.2" />

        {/* Củ cà rốt hình nón mập mạp nghiêng 35 độ */}
        <path
          d="M 44 26 C 58 18, 72 32, 64 42 L 38 78 C 34 83, 30 81, 30 76 Z"
          fill="url(#carrot_body)"
          stroke="#431407"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Khía rãnh ngang trên củ */}
        <path d="M 48 38 Q 54 36 60 40" stroke="#fef08a" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M 42 50 Q 48 48 54 52" stroke="#fef08a" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M 37 62 Q 42 60 46 64" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />

        {/* Vệt sáng bóng */}
        <ellipse cx="46" cy="34" rx="4" ry="7" fill="#ffffff" opacity="0.7" transform="rotate(-35 46 34)" />
      </g>
    </svg>
  );
}

// 14. KHỐI ĐÁ TỰ NHIÊN (Smooth River Boulder)
export function Icon3dStoneRock({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="rock_grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="35%" stopColor="#cbd5e1" />
          <stop offset="75%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>
        <filter id="rock_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#0f172a" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="50" cy="85" rx="30" ry="7" fill="#0f172a" opacity="0.14" />

      <g filter="url(#rock_shadow)">
        {/* Khối đá phụ nhỏ bên phải */}
        <path
          d="M 64 66 C 64 56, 78 54, 84 64 C 88 72, 80 80, 68 78 Z"
          fill="#64748b"
          stroke="#1e293b"
          strokeWidth="2"
        />

        {/* Khối đá chính hình đa giác bo góc mềm */}
        <path
          d="M 32 46 C 36 34, 58 32, 68 40 C 78 48, 76 74, 64 78 C 50 82, 22 82, 20 72 C 18 60, 26 52, 32 46 Z"
          fill="url(#rock_grad)"
          stroke="#1e293b"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Vết vát góc lồi phản sáng */}
        <path d="M 34 46 L 56 42 L 64 54" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
        <ellipse cx="42" cy="46" rx="6" ry="3" fill="#ffffff" opacity="0.6" transform="rotate(-15 42 46)" />
      </g>
    </svg>
  );
}

// 15. CHẬU HOA CÚC TRẮNG (Potted Daisy Flower)
export function Icon3dPottedFlower({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="pot_clay" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="45%" stopColor="#ea580c" />
          <stop offset="85%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </radialGradient>
        <filter id="pot_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#7c2d12" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="50" cy="86" rx="24" ry="6" fill="#0f172a" opacity="0.14" />

      <g filter="url(#pot_shadow)">
        {/* Thân chậu gốm nung Terracotta */}
        <path
          d="M 33 54 L 38 78 C 39 83, 61 83, 62 78 L 67 54 Z"
          fill="url(#pot_clay)"
          stroke="#431407"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Vành miệng chậu gốm */}
        <rect x="30" y="48" width="40" height="8" rx="4" fill="url(#pot_clay)" stroke="#431407" strokeWidth="2" />
        <ellipse cx="50" cy="48" rx="18" ry="3.5" fill="#5c2411" />

        {/* Đất mùn nâu ẩm trong chậu */}
        <ellipse cx="50" cy="49" rx="16" ry="3" fill="#29140a" />

        {/* Lá xanh xoè hai bên */}
        <path d="M 50 46 C 40 44, 34 38, 36 34 C 42 34, 48 40, 50 46 Z" fill="#22c55e" stroke="#14532d" strokeWidth="1.2" />
        <path d="M 50 46 C 60 44, 66 38, 64 34 C 58 34, 52 40, 50 46 Z" fill="#16a34a" stroke="#14532d" strokeWidth="1.2" />

        {/* Cuống hoa vươn thẳng */}
        <line x1="50" y1="48" x2="50" y2="28" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />

        {/* Bông cúc trắng nở rộ */}
        <g transform="translate(50, 24)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <ellipse
              key={i}
              cx="0"
              cy="-8"
              rx="3"
              ry="5.5"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="0.8"
              transform={`rotate(${deg} 0 0)`}
            />
          ))}
          {/* Nhụy hoa vàng cam */}
          <circle cx="0" cy="0" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
          <circle cx="-1.5" cy="-1.5" r="1.5" fill="#ffffff" opacity="0.8" />
        </g>
      </g>
    </svg>
  );
}

// === ICON DANH MỤC & THANH CÔNG CỤ (TẤT CẢ, CÔNG CỤ, HẠT GIỐNG, NỘI THẤT, TRANG PHỤC, VẬT PHẨM) ===

export function Icon3dCategoryAll({ size = 20, active = false }) {
  const color = active ? '#ffffff' : '#0284c7';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7.5" height="7.5" rx="2.5" fill={color} />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5" fill={color} />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5" fill={color} />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.5" fill={color} />
    </svg>
  );
}

export function Icon3dCategoryTools({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="#475569" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Icon3dCategorySeeds({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M7 20h10" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 20c0-4 1.5-6 2-10" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 10c-3-3-3-7 0-9 3 2 3 6 0 9z" fill="#22c55e" stroke="#15803d" strokeWidth="1.2" />
      <path d="M12 14c4-2 7 0 8 3-2 2-6 1-8-3z" fill="#4ade80" stroke="#15803d" strokeWidth="1.2" />
    </svg>
  );
}

export function Icon3dCategoryFurniture({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5z" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
      <path d="M6 18v3M18 18v3" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Icon3dCategoryClothing({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Icon3dCategoryItems({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" fill="#ea580c" stroke="#9a3412" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" stroke="#fed7aa" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Icon Thùng Rác (BỎ)
export function Icon3dTrashCan({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="11" x2="10" y2="17" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="11" x2="14" y2="17" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Icon Đóng X
export function Icon3dCloseButton({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <defs>
        <radialGradient id="close_btn_grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </radialGradient>
      </defs>
      <circle cx="22" cy="22" r="20" fill="url(#close_btn_grad)" stroke="#ffffff" strokeWidth="2.5" />
      <path d="M15 15L29 29M29 15L15 29" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

// Header 3D Yellow Backpack
export function Icon3dHeaderBackpack({ size = 58 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <radialGradient id="hd_pack_grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#facc15" />
          <stop offset="85%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>
      </defs>
      {/* Thân ba lô vàng */}
      <rect x="12" y="16" width="40" height="42" rx="14" fill="url(#hd_pack_grad)" stroke="#854d0e" strokeWidth="2.5" />
      {/* Quai xách */}
      <path d="M24 16C24 8 40 8 40 16" stroke="#854d0e" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Túi phụ trước có sao */}
      <rect x="18" y="32" width="28" height="22" rx="8" fill="#fde047" stroke="#a16207" strokeWidth="2" />
      {/* Ngôi sao trắng nổi */}
      <polygon points="32,38 33.5,42 38,42.5 34.5,45.5 35.5,50 32,47.5 28.5,50 29.5,45.5 26,42.5 30.5,42" fill="#ffffff" stroke="#eab308" strokeWidth="0.8" />
    </svg>
  );
}

// 21. PHAO VỊT VÀNG 3D (DUCK FLOATIE)
export function Icon3dDuckFloatie({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="duck_yellow_grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>
        <radialGradient id="duck_beak_grad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </radialGradient>
      </defs>
      {/* Vòng phao xuyến */}
      <ellipse cx="50" cy="62" rx="36" ry="22" fill="url(#duck_yellow_grad)" stroke="#854d0e" strokeWidth="3" />
      <ellipse cx="50" cy="62" rx="18" ry="10" fill="#38bdf8" stroke="#854d0e" strokeWidth="2" />
      {/* Cổ và đầu vịt nhô lên */}
      <ellipse cx="50" cy="42" rx="14" ry="14" fill="url(#duck_yellow_grad)" stroke="#854d0e" strokeWidth="2.5" />
      {/* Mỏ cam vịt */}
      <ellipse cx="50" cy="48" rx="8" ry="4" fill="url(#duck_beak_grad)" stroke="#9a3412" strokeWidth="1.5" />
      {/* Mắt vịt to tròn Chibi */}
      <circle cx="43" cy="38" r="3" fill="#0f172a" />
      <circle cx="42" cy="37" r="1.2" fill="#ffffff" />
      <circle cx="57" cy="38" r="3" fill="#0f172a" />
      <circle cx="56" cy="37" r="1.2" fill="#ffffff" />
      {/* Đuôi vịt nhỏ phía sau */}
      <polygon points="50,78 45,86 55,86" fill="url(#duck_yellow_grad)" stroke="#854d0e" strokeWidth="1.5" />
    </svg>
  );
}

// 22. BALO ẾCH XANH MẮT LỒI 3D (FROG BACKPACK)
export function Icon3dFrogBackpack({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="frog_green_grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </radialGradient>
      </defs>
      {/* Thân balo tròn */}
      <rect x="24" y="30" width="52" height="52" rx="20" fill="url(#frog_green_grad)" stroke="#14532d" strokeWidth="3" />
      {/* 2 Mắt ếch lồi trên đỉnh */}
      <circle cx="34" cy="24" r="11" fill="url(#frog_green_grad)" stroke="#14532d" strokeWidth="2.5" />
      <circle cx="34" cy="24" r="7" fill="#ffffff" />
      <circle cx="34" cy="24" r="4" fill="#0f172a" />
      <circle cx="32" cy="22" r="1.5" fill="#ffffff" />
      <circle cx="66" cy="24" r="11" fill="url(#frog_green_grad)" stroke="#14532d" strokeWidth="2.5" />
      <circle cx="66" cy="24" r="7" fill="#ffffff" />
      <circle cx="66" cy="24" r="4" fill="#0f172a" />
      <circle cx="64" cy="22" r="1.5" fill="#ffffff" />
      {/* Miệng ếch cười toe toét */}
      <path d="M38 52 Q50 64 62 52" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* 2 Má hồng xinh */}
      <circle cx="35" cy="54" r="4" fill="#f43f5e" opacity="0.65" />
      <circle cx="65" cy="54" r="4" fill="#f43f5e" opacity="0.65" />
      {/* Túi khóa kéo phía trước */}
      <rect x="32" y="62" width="36" height="15" rx="6" fill="#bbf7d0" stroke="#15803d" strokeWidth="1.8" />
    </svg>
  );
}

// 23. TAI NGHE MÈO RGB 3D (CAT HEADPHONES)
export function Icon3dCatHeadphones({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="cat_pink_rgb" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="70%" stopColor="#db2777" />
          <stop offset="100%" stopColor="#9d174d" />
        </radialGradient>
      </defs>
      {/* Vành tai nghe chụp đầu */}
      <path d="M26 56 C26 26 74 26 74 56" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* 2 Tai mèo phát sáng RGB */}
      <polygon points="30,32 38,12 48,27" fill="url(#cat_pink_rgb)" stroke="#be185d" strokeWidth="2" />
      <polygon points="34,29 38,17 44,26" fill="#fbcfe8" />
      <polygon points="70,32 62,12 52,27" fill="url(#cat_pink_rgb)" stroke="#be185d" strokeWidth="2" />
      <polygon points="66,29 62,17 56,26" fill="#fbcfe8" />
      {/* 2 Chụp tai tròn */}
      <rect x="18" y="50" width="16" height="28" rx="8" fill="url(#cat_pink_rgb)" stroke="#be185d" strokeWidth="2.5" />
      <rect x="66" y="50" width="16" height="28" rx="8" fill="url(#cat_pink_rgb)" stroke="#be185d" strokeWidth="2.5" />
      {/* Vòng LED phát sáng tâm chụp tai */}
      <circle cx="26" cy="64" r="4.5" fill="#38bdf8" />
      <circle cx="74" cy="64" r="4.5" fill="#38bdf8" />
    </svg>
  );
}

// 24. KÍNH CẬN TRÒN NOBITA 3D (ROUND GLASSES)
export function Icon3dRoundGlasses({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="lens_glass" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      {/* 2 Mắt kính tròn xoe */}
      <circle cx="34" cy="50" r="16" fill="url(#lens_glass)" stroke="#334155" strokeWidth="3.5" />
      <circle cx="66" cy="50" r="16" fill="url(#lens_glass)" stroke="#334155" strokeWidth="3.5" />
      {/* Cầu nối giữa 2 tròng */}
      <path d="M48 48 Q50 44 52 48" stroke="#334155" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* 2 Gọng kính 2 bên */}
      <line x1="18" y1="48" x2="10" y2="44" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
      <line x1="82" y1="48" x2="90" y2="44" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
      {/* Vệt bóng kính */}
      <ellipse cx="28" cy="44" rx="4" ry="2" fill="#ffffff" opacity="0.8" transform="rotate(-30 28 44)" />
      <ellipse cx="60" cy="44" rx="4" ry="2" fill="#ffffff" opacity="0.8" transform="rotate(-30 60 44)" />
    </svg>
  );
}

// 25. CÁNH THIÊN THẦN 3D (ANGEL WINGS)
export function Icon3dAngelWings({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="wing_gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
      </defs>
      {/* Cánh trái */}
      <path
        d="M48 50 C40 30, 16 28, 12 46 C10 58, 26 66, 36 62 C30 68, 38 72, 46 60 Z"
        fill="url(#wing_gold)"
        stroke="#ca8a04"
        strokeWidth="2.5"
      />
      {/* Cánh phải */}
      <path
        d="M52 50 C60 30, 84 28, 88 46 C90 58, 74 66, 64 62 C70 68, 62 72, 54 60 Z"
        fill="url(#wing_gold)"
        stroke="#ca8a04"
        strokeWidth="2.5"
      />
      {/* Hào quang ở giữa */}
      <circle cx="50" cy="38" r="6" fill="#facc15" stroke="#b45309" strokeWidth="1.5" />
    </svg>
  );
}

// 26. BỘ VEST QUÝ TỘC TUXEDO 3D (SUIT VEST)
export function Icon3dSuitVest({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="vest_dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="60%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      {/* Thân áo vest */}
      <path d="M 28 22 L 72 22 L 82 82 L 18 82 Z" fill="url(#vest_dark)" stroke="#090d16" strokeWidth="2.5" />
      {/* Cổ sơ mi trắng chữ V */}
      <polygon points="50,62 38,22 62,22" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Nơ đỏ quý phái */}
      <ellipse cx="44" cy="32" rx="7" ry="5" fill="#ef4444" stroke="#991b1b" strokeWidth="1.2" />
      <ellipse cx="56" cy="32" rx="7" ry="5" fill="#ef4444" stroke="#991b1b" strokeWidth="1.2" />
      <circle cx="50" cy="32" r="3.5" fill="#dc2626" />
      {/* Khuy áo vàng hoàng kim */}
      <circle cx="50" cy="68" r="2.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      <circle cx="50" cy="76" r="2.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
    </svg>
  );
}

// 27. HOODIE MÈO ĐEN STREETWEAR 3D (CAT HOODIE)
export function Icon3dCatHoodie({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="hoodie_dark" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="70%" stopColor="#27272a" />
          <stop offset="100%" stopColor="#18181b" />
        </radialGradient>
      </defs>
      {/* Mũ có 2 tai mèo */}
      <path d="M 32 28 L 30 14 L 42 22 Z" fill="#27272a" stroke="#09090b" strokeWidth="1.8" />
      <polygon points="32,26 31,17 39,22" fill="#fda4af" />
      <path d="M 68 28 L 70 14 L 58 22 Z" fill="#27272a" stroke="#09090b" strokeWidth="1.8" />
      <polygon points="68,26 69,17 61,22" fill="#fda4af" />
      {/* Thân hoodie phồng to */}
      <rect x="22" y="26" width="56" height="56" rx="14" fill="url(#hoodie_dark)" stroke="#09090b" strokeWidth="2.5" />
      {/* Túi Kangaroo */}
      <path d="M 30 58 L 70 58 L 66 76 L 34 76 Z" fill="#18181b" stroke="#52525b" strokeWidth="1.5" />
      {/* Dây rút trắng */}
      <line x1="42" y1="36" x2="42" y2="48" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <line x1="58" y1="36" x2="58" y2="48" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 28. ĐUÔI CÁO LẮC LƯ 3D (FOX TAIL)
export function Icon3dFoxTail({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <linearGradient id="fox_grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c2410c" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="85%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      {/* Đường cong đuôi cáo mềm mại */}
      <path
        d="M 28 82 C 16 64, 20 40, 42 26 C 60 14, 76 18, 82 32 C 88 48, 76 68, 62 76 C 50 82, 36 84, 28 82 Z"
        fill="url(#fox_grad)"
        stroke="#9a3412"
        strokeWidth="2.5"
      />
      {/* Chóp đuôi lông trắng muốt */}
      <path
        d="M 72 24 C 78 20, 84 25, 82 34 C 79 38, 74 35, 70 32 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

// 29. BÁNH MÌ NƯỚNG BƠ 3D (TOAST IN MOUTH)
export function Icon3dToastMouth({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={`icon-3d ${className}`}>
      <defs>
        <radialGradient id="toast_gold" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#fde047" />
          <stop offset="90%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
      </defs>
      {/* Lát bánh mì nướng thơm giòn */}
      <g transform="rotate(12 50 50)">
        <rect x="24" y="24" width="52" height="52" rx="10" fill="url(#toast_gold)" stroke="#78350f" strokeWidth="2.8" />
        {/* Miếng bơ tan chảy */}
        <rect x="42" y="42" width="18" height="18" rx="4" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

