import { cardRank, cardSuit } from '../../../shared/casino/cards.js';
import { CASINO_SYMBOLS } from '../../../shared/casino/casinoConfig.js';

/* ==========================================================================
   CASINO ARTWORK & VISUAL ASSETS (PRO LUXURY EDITION)
   High-detail SVG illustrations, Royal court cards, Precision dice, Ceramic chips
   ========================================================================== */

/**
 * 6 Linh Vật Bầu Cua Tôm Cá (Folk Art with Modern Luxury Gradient Styling)
 */
export function SymbolArt({ symbol }) {
  if (symbol === 'bau') {
    // Quả Bầu Hồ Lô Vàng Óng — Thắt Lụa Đỏ May Mắn, Cuống Lá Xanh
    return (
      <svg className="cq-symbol cq-symbol-bau" viewBox="0 0 80 80" aria-label="Bầu">
        <defs>
          <linearGradient id="cq-grad-gourd" x1="25%" y1="0%" x2="75%" y2="100%">
            <stop offset="0%" stopColor="#ffe082" />
            <stop offset="45%" stopColor="#ffb300" />
            <stop offset="85%" stopColor="#f57c00" />
            <stop offset="100%" stopColor="#e65100" />
          </linearGradient>
          <linearGradient id="cq-grad-ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff5252" />
            <stop offset="60%" stopColor="#d50000" />
            <stop offset="100%" stopColor="#8b0000" />
          </linearGradient>
          <linearGradient id="cq-grad-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#aed581" />
            <stop offset="100%" stopColor="#33691e" />
          </linearGradient>
          <radialGradient id="cq-shine" cx="35%" cy="30%" r="45%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Cuống và lá xanh */}
        <path d="M40 18 Q37 6 46 6 Q43 14 41 18 Z" fill="url(#cq-grad-leaf)" />
        <path d="M43 12 Q53 10 52 17 Q44 19 41 15 Z" fill="url(#cq-grad-leaf)" />
        {/* Bầu trên (nhỏ) */}
        <ellipse cx="40" cy="27" rx="14" ry="12" fill="url(#cq-grad-gourd)" stroke="#9e5200" strokeWidth="1.5" />
        <ellipse cx="36" cy="24" rx="8" ry="6" fill="url(#cq-shine)" />
        {/* Bầu dưới (to tròn đầy đặn) */}
        <ellipse cx="40" cy="51" rx="23" ry="20" fill="url(#cq-grad-gourd)" stroke="#9e5200" strokeWidth="1.5" />
        <ellipse cx="33" cy="46" rx="13" ry="10" fill="url(#cq-shine)" />
        {/* Thắt eo lụa đỏ may mắn & nơ lụa */}
        <path d="M30 35 Q40 38 50 35 Q48 40 40 40 Q32 40 30 35 Z" fill="url(#cq-grad-ribbon)" stroke="#ffd54f" strokeWidth="1" />
        <circle cx="40" cy="38" r="3.5" fill="#ffd700" stroke="#b78103" strokeWidth="1" />
        <path d="M37 39 Q32 46 30 52 M43 39 Q48 46 50 52" stroke="url(#cq-grad-ribbon)" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  if (symbol === 'cua') {
    // Chú Cua Đồng Mai Đỏ Cam, Càng To Dũng Mãnh
    return (
      <svg className="cq-symbol cq-symbol-cua" viewBox="0 0 80 80" aria-label="Cua">
        <defs>
          <linearGradient id="cq-grad-crab" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff7043" />
            <stop offset="50%" stopColor="#e64a19" />
            <stop offset="100%" stopColor="#bf360c" />
          </linearGradient>
          <radialGradient id="cq-crab-eye" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#263238" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
        </defs>
        {/* Chân cua (6 chân sau) */}
        <g stroke="url(#cq-grad-crab)" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M22 42 Q10 40 8 49 M20 48 Q10 50 10 59 M23 54 Q14 61 16 69" />
          <path d="M58 42 Q70 40 72 49 M60 48 Q70 50 70 59 M57 54 Q66 61 64 69" />
        </g>
        {/* Càng trái to khỏe */}
        <path d="M24 35 Q14 26 12 15 Q24 16 28 26 Z" fill="url(#cq-grad-crab)" stroke="#7f1d00" strokeWidth="1.2" />
        <path d="M12 15 Q8 9 16 7 Q21 12 20 18 Z" fill="#ff8a65" stroke="#7f1d00" strokeWidth="1" />
        {/* Càng phải to khỏe */}
        <path d="M56 35 Q66 26 68 15 Q56 16 52 26 Z" fill="url(#cq-grad-crab)" stroke="#7f1d00" strokeWidth="1.2" />
        <path d="M68 15 Q72 9 64 7 Q59 12 60 18 Z" fill="#ff8a65" stroke="#7f1d00" strokeWidth="1" />
        {/* Mai cua căng bóng */}
        <ellipse cx="40" cy="46" rx="20" ry="15" fill="url(#cq-grad-crab)" stroke="#7f1d00" strokeWidth="1.8" />
        <ellipse cx="36" cy="42" rx="12" ry="7" fill="url(#cq-shine)" />
        {/* Hoa văn trên mai */}
        <path d="M33 46 Q40 51 47 46 M36 50 Q40 54 44 50" stroke="#ffd54f" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
        {/* Cuống mắt & Mắt cua */}
        <circle cx="34" cy="33" r="3.8" fill="url(#cq-crab-eye)" stroke="#fff" strokeWidth="0.8" />
        <circle cx="46" cy="33" r="3.8" fill="url(#cq-crab-eye)" stroke="#fff" strokeWidth="0.8" />
      </svg>
    );
  }

  if (symbol === 'tom') {
    // Chú Tôm Sú Cam Hồng Uốn Mình, Râu Dài Tươi Rói
    return (
      <svg className="cq-symbol cq-symbol-tom" viewBox="0 0 80 80" aria-label="Tôm">
        <defs>
          <linearGradient id="cq-grad-shrimp" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffab91" />
            <stop offset="40%" stopColor="#ff5722" />
            <stop offset="80%" stopColor="#d84315" />
            <stop offset="100%" stopColor="#bf360c" />
          </linearGradient>
        </defs>
        {/* Đôi râu tôm dài thanh tú vươn cao */}
        <path d="M28 26 Q12 18 10 7 M29 27 Q18 24 16 11" stroke="#ff7043" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* Thân tôm uốn cong mềm mại từng đốt */}
        <path d="M30 26 C15 32 18 60 44 65 C62 67 66 50 56 40 C46 30 38 23 30 26 Z" fill="url(#cq-grad-shrimp)" stroke="#871c00" strokeWidth="1.5" />
        {/* Các ngấn đốt vỏ tôm bóng bẩy */}
        <g stroke="#ffd54f" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" fill="none">
          <path d="M31 34 Q38 33 46 37" />
          <path d="M32 43 Q41 42 51 46" />
          <path d="M36 51 Q44 51 52 54" />
        </g>
        {/* Đuôi tôm xòe quạt */}
        <path d="M46 64 Q56 73 63 68 Q53 61 48 59 Z" fill="#ff7043" stroke="#871c00" strokeWidth="1.2" />
        <path d="M48 64 Q57 75 66 74 Q56 65 49 61 Z" fill="#e64a19" stroke="#871c00" strokeWidth="1.2" />
        {/* Chân bơi nhỏ */}
        <path d="M32 58 Q34 66 38 67 M26 53 Q28 62 31 63" stroke="#ff8a65" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Mắt tôm tròn đen láy */}
        <circle cx="28" cy="28" r="2.8" fill="#1a237e" stroke="#ffffff" strokeWidth="0.8" />
      </svg>
    );
  }

  if (symbol === 'ca') {
    // Cá Chép Lam Ngọc Ánh Kim, Vảy Lấp Lánh, Ngậm Đồng Tiền Phúc Lộc
    return (
      <svg className="cq-symbol cq-symbol-ca" viewBox="0 0 80 80" aria-label="Cá">
        <defs>
          <linearGradient id="cq-grad-fish" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#80deea" />
            <stop offset="35%" stopColor="#26c6da" />
            <stop offset="70%" stopColor="#0097a7" />
            <stop offset="100%" stopColor="#006064" />
          </linearGradient>
          <linearGradient id="cq-grad-fin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f7fa" />
            <stop offset="100%" stopColor="#00bcd4" />
          </linearGradient>
        </defs>
        {/* Đuôi cá chép rẽ quạt uốn lượn */}
        <path d="M56 40 Q74 24 74 36 Q64 40 74 46 Q74 58 56 42 Z" fill="url(#cq-grad-fin)" stroke="#004d40" strokeWidth="1.5" />
        {/* Thân cá chép uốn lượn thon mềm */}
        <path d="M16 40 C22 23 48 24 60 40 C48 57 22 58 16 40 Z" fill="url(#cq-grad-fish)" stroke="#004d40" strokeWidth="1.6" />
        {/* Vây lưng cá */}
        <path d="M30 27 Q40 18 50 27 Z" fill="url(#cq-grad-fin)" stroke="#004d40" strokeWidth="1.2" />
        {/* Vây bụng cá */}
        <path d="M28 53 Q36 62 44 53 Z" fill="url(#cq-grad-fin)" stroke="#004d40" strokeWidth="1.2" />
        {/* Vảy cá xếp lớp ngọc bích */}
        <g stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.6">
          <path d="M33 33 Q37 40 33 47 M41 33 Q45 40 41 47 M49 35 Q53 40 49 45" />
        </g>
        {/* Mắt cá sáng ngọc */}
        <circle cx="23" cy="36" r="3.2" fill="#00363a" stroke="#fff" strokeWidth="1" />
        <circle cx="22" cy="35" r="1" fill="#fff" />
        {/* Miệng cá ngậm đồng tiền vàng phúc lộc */}
        <circle cx="12" cy="41" r="5" fill="#ffd700" stroke="#b78103" strokeWidth="1" />
        <rect x="10.5" y="39.5" width="3" height="3" fill="#b78103" />
      </svg>
    );
  }

  if (symbol === 'ga') {
    // Chú Gà Trống Dũng Mãnh, Mào Đỏ Rực, Ức Vàng Kim, Đuôi Kiêu Hãnh
    return (
      <svg className="cq-symbol cq-symbol-ga" viewBox="0 0 80 80" aria-label="Gà">
        <defs>
          <linearGradient id="cq-grad-rooster-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff176" />
            <stop offset="45%" stopColor="#fbc02d" />
            <stop offset="85%" stopColor="#f57c00" />
            <stop offset="100%" stopColor="#e65100" />
          </linearGradient>
          <linearGradient id="cq-grad-comb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff5252" />
            <stop offset="100%" stopColor="#c62828" />
          </linearGradient>
          <linearGradient id="cq-grad-tail" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00897b" />
            <stop offset="60%" stopColor="#1e88e5" />
            <stop offset="100%" stopColor="#0d47a1" />
          </linearGradient>
        </defs>
        {/* Đuôi gà uốn cong vút kiêu hãnh */}
        <path d="M30 46 Q12 36 10 20 Q20 30 26 40 Z" fill="url(#cq-grad-tail)" stroke="#0a2f5c" strokeWidth="1.2" />
        <path d="M28 48 Q10 46 8 30 Q18 40 24 45 Z" fill="#00695c" stroke="#043831" strokeWidth="1.2" />
        {/* Thân và ức gà vàng kim */}
        <path d="M25 46 C25 62 48 64 54 50 C58 40 54 30 46 28 C42 28 32 32 25 46 Z" fill="url(#cq-grad-rooster-body)" stroke="#a33c00" strokeWidth="1.5" />
        {/* Cánh gà sắc nét xếp lớp */}
        <path d="M32 44 Q44 42 46 52 Q37 56 32 44 Z" fill="#d84315" stroke="#871c00" strokeWidth="1.2" />
        {/* Cổ & Đầu gà vươn cao */}
        <path d="M46 32 Q54 26 56 18 Q50 18 44 26 Z" fill="url(#cq-grad-rooster-body)" stroke="#a33c00" strokeWidth="1.2" />
        {/* Mào gà đỏ tươi hình vương miện */}
        <path d="M52 16 Q54 8 58 10 Q61 8 62 13 Q64 12 63 17 Z" fill="url(#cq-grad-comb)" stroke="#8e0000" strokeWidth="1" />
        {/* Yếm gà đỏ dưới mỏ */}
        <path d="M59 23 Q62 26 60 28 Q56 28 58 23 Z" fill="url(#cq-grad-comb)" />
        {/* Mỏ gà vàng nhọn */}
        <path d="M62 18 L70 21 L62 24 Z" fill="#ffd600" stroke="#bf360c" strokeWidth="1" />
        {/* Mắt gà tinh anh */}
        <circle cx="56" cy="19" r="2.2" fill="#000" stroke="#fff" strokeWidth="0.8" />
        {/* Chân gà vàng */}
        <path d="M38 60 L36 71 M44 59 L46 71 M33 71 L38 71 M43 71 L48 71" stroke="#f57f17" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (symbol === 'nai') {
    // Chú Nai Vàng Sừng Nhung Quý Phái, Mắt Hiền Hòa, Đốm Hoa Mai
    return (
      <svg className="cq-symbol cq-symbol-nai" viewBox="0 0 80 80" aria-label="Nai">
        <defs>
          <linearGradient id="cq-grad-deer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffb74d" />
            <stop offset="50%" stopColor="#f57c00" />
            <stop offset="100%" stopColor="#b26a00" />
          </linearGradient>
          <linearGradient id="cq-grad-antler" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff3e0" />
            <stop offset="60%" stopColor="#bcaaa4" />
            <stop offset="100%" stopColor="#6d4c41" />
          </linearGradient>
        </defs>
        {/* Đôi sừng nhung hươu nhiều nhánh vươn cao quý phái */}
        <g stroke="url(#cq-grad-antler)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M34 26 L28 14 L20 8 M28 14 L34 8 M25 18 L20 17" />
          <path d="M46 26 L52 14 L60 8 M52 14 L46 8 M55 18 L60 17" />
        </g>
        {/* Đôi tai vểnh lắng nghe */}
        <path d="M28 27 Q14 24 16 16 Q26 21 28 27 Z" fill="#ffb74d" stroke="#8d4a00" strokeWidth="1.2" />
        <path d="M52 27 Q66 24 64 16 Q54 21 52 27 Z" fill="#ffb74d" stroke="#8d4a00" strokeWidth="1.2" />
        {/* Đầu & Mặt nai thanh tú */}
        <path d="M30 27 C24 38 28 58 40 60 C52 58 56 38 50 27 Z" fill="url(#cq-grad-deer)" stroke="#8d4a00" strokeWidth="1.5" />
        {/* Mũi & Mõm nâu trắng */}
        <ellipse cx="40" cy="54" rx="7" ry="4.5" fill="#fff8e1" />
        <ellipse cx="40" cy="52" rx="3.5" ry="2.2" fill="#3e2723" />
        {/* Đôi mắt to tròn long lanh hiền hòa */}
        <ellipse cx="32" cy="38" rx="3.5" ry="4" fill="#212121" stroke="#fff" strokeWidth="0.8" />
        <circle cx="31" cy="36.5" r="1.2" fill="#fff" />
        <ellipse cx="48" cy="38" rx="3.5" ry="4" fill="#212121" stroke="#fff" strokeWidth="0.8" />
        <circle cx="47" cy="36.5" r="1.2" fill="#fff" />
        {/* Đốm hoa mai trắng trên trán */}
        <circle cx="40" cy="34" r="1.8" fill="#fff" opacity="0.9" />
        <circle cx="37" cy="30" r="1.3" fill="#fff" opacity="0.9" />
        <circle cx="43" cy="30" r="1.3" fill="#fff" opacity="0.9" />
      </svg>
    );
  }

  return null;
}

/**
 * 4 Chất Bài (Spade ♠, Club ♣, Diamond ♦, Heart ♥) với phong cách Casino bóng bẩy
 */
export function Suit({ suit, size = 16, className = '' }) {
  // 0: Bích ♠, 1: Chuồn ♣, 2: Rô ♦, 3: Cơ ♥
  if (suit === 0) {
    // Spade ♠
    return (
      <svg className={`cq-suit cq-suit-spade ${className}`} width={size} height={size} viewBox="0 0 64 64" aria-label="Bích">
        <defs>
          <linearGradient id="cq-grad-spade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#455a64" />
            <stop offset="50%" stopColor="#263238" />
            <stop offset="100%" stopColor="#10171b" />
          </linearGradient>
        </defs>
        <path d="M32 4 C23 20 6 24 10 39 C13 50 25 49 29 44 L24 58 L40 58 L35 44 C39 49 51 50 54 39 C58 24 41 20 32 4 Z" fill="url(#cq-grad-spade)" stroke="#263238" strokeWidth="1" />
      </svg>
    );
  }
  if (suit === 1) {
    // Club ♣
    return (
      <svg className={`cq-suit cq-suit-club ${className}`} width={size} height={size} viewBox="0 0 64 64" aria-label="Chuồn">
        <defs>
          <linearGradient id="cq-grad-club" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#455a64" />
            <stop offset="50%" stopColor="#263238" />
            <stop offset="100%" stopColor="#10171b" />
          </linearGradient>
        </defs>
        <path d="M26 43 C6 54 3 27 23 28 C9 5 55 5 41 28 C61 27 58 54 38 43 L43 58 L21 58 Z" fill="url(#cq-grad-club)" stroke="#263238" strokeWidth="1" />
      </svg>
    );
  }
  if (suit === 2) {
    // Diamond ♦
    return (
      <svg className={`cq-suit cq-suit-diamond ${className}`} width={size} height={size} viewBox="0 0 64 64" aria-label="Rô">
        <defs>
          <linearGradient id="cq-grad-diamond" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff5252" />
            <stop offset="60%" stopColor="#d50000" />
            <stop offset="100%" stopColor="#9b0000" />
          </linearGradient>
        </defs>
        <polygon points="32,4 56,32 32,60 8,32" fill="url(#cq-grad-diamond)" stroke="#b71c1c" strokeWidth="1" />
      </svg>
    );
  }
  // Heart ♥
  return (
    <svg className={`cq-suit cq-suit-heart ${className}`} width={size} height={size} viewBox="0 0 64 64" aria-label="Cơ">
      <defs>
        <linearGradient id="cq-grad-heart" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff5252" />
          <stop offset="60%" stopColor="#d50000" />
          <stop offset="100%" stopColor="#8b0000" />
        </linearGradient>
      </defs>
      <path d="M32 58 C-14 24 16 -4 32 16 C48 -4 78 24 32 58 Z" fill="url(#cq-grad-heart)" stroke="#b71c1c" strokeWidth="1" />
    </svg>
  );
}

/**
 * Minh Họa Quân Bài Hoàng Gia (Court Card Artwork for J, Q, K & Ornate Ace of Spades)
 */
function CourtFigure({ rank, suit }) {
  const isRed = suit >= 2;
  const primaryColor = isRed ? '#d32f2f' : '#1976d2';
  const secondaryColor = '#ffd700';

  if (rank === 11) {
    // JACK (Hiệp Sĩ Hoàng Gia với Kiếm & Giáp Vàng)
    return (
      <svg className="cq-court-figure cq-figure-jack" viewBox="0 0 60 70">
        <defs>
          <linearGradient id="cq-jack-armor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cfd8dc" />
            <stop offset="100%" stopColor="#78909c" />
          </linearGradient>
        </defs>
        {/* Mũ lông vũ hiệp sĩ */}
        <path d="M18 20 Q30 8 42 20 Z" fill={primaryColor} />
        <path d="M22 14 Q32 2 46 8" stroke="#ffd700" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Khuôn mặt tuấn tú */}
        <ellipse cx="30" cy="26" rx="9" ry="8" fill="#ffe0b2" stroke="#bcaaa4" strokeWidth="0.8" />
        <circle cx="27" cy="25" r="1.2" fill="#212121" />
        <circle cx="33" cy="25" r="1.2" fill="#212121" />
        {/* Giáp vai & Khiên ngực */}
        <path d="M14 36 L46 36 L42 64 L18 64 Z" fill="url(#cq-jack-armor)" stroke="#37474f" strokeWidth="1.2" />
        <path d="M18 36 L30 50 L42 36" fill={primaryColor} />
        {/* Thanh bảo kiếm cầm tay */}
        <line x1="48" y1="20" x2="48" y2="60" stroke="#ffd700" strokeWidth="3" strokeLinecap="round" />
        <line x1="43" y1="30" x2="53" y2="30" stroke="#b78103" strokeWidth="2.5" />
      </svg>
    );
  }

  if (rank === 12) {
    // QUEEN (Nữ Hoàng Quý Tộc với Vương Miện & Hoa Hồng)
    return (
      <svg className="cq-court-figure cq-figure-queen" viewBox="0 0 60 70">
        {/* Vương miện nạm ngọc */}
        <path d="M20 18 L24 10 L30 15 L36 10 L40 18 Z" fill={secondaryColor} stroke="#b78103" strokeWidth="1" />
        <circle cx="30" cy="15" r="1.5" fill={primaryColor} />
        {/* Mái tóc quý phái & Khuôn mặt */}
        <path d="M18 24 Q30 18 42 24 Q44 38 16 38 Z" fill="#5d4037" />
        <ellipse cx="30" cy="27" rx="8" ry="7.5" fill="#ffe0b2" />
        <circle cx="28" cy="26" r="1" fill="#212121" />
        <circle cx="32" cy="26" r="1" fill="#212121" />
        <path d="M29 31 Q30 32 31 31" stroke={primaryColor} strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Y phục hoàng gia kiêu sa */}
        <path d="M16 36 C16 36 24 64 30 64 C36 64 44 36 44 36 Z" fill={primaryColor} stroke="#b71c1c" strokeWidth="1" />
        <path d="M25 36 Q30 46 35 36" fill="#fff" />
        {/* Hoa hồng vương giả */}
        <circle cx="16" cy="48" r="4.5" fill="#e91e63" />
        <circle cx="16" cy="48" r="2" fill="#ad1457" />
      </svg>
    );
  }

  if (rank === 13) {
    // KING (Hoàng Đế Uy Nghi với Vương Miện Hoàng Tộc & Quyền Trượng)
    return (
      <svg className="cq-court-figure cq-figure-king" viewBox="0 0 60 70">
        {/* Vương miện vàng chạm trổ thánh giá */}
        <path d="M16 18 L20 8 L30 14 L40 8 L44 18 Z" fill={secondaryColor} stroke="#b78103" strokeWidth="1.2" />
        <path d="M29 5 L31 5 M30 4 L30 8" stroke="#b78103" strokeWidth="1.5" />
        {/* Khuôn mặt oai vệ & Râu rồng */}
        <ellipse cx="30" cy="26" rx="9" ry="8" fill="#ffe0b2" />
        <circle cx="27" cy="24" r="1.2" fill="#212121" />
        <circle cx="33" cy="24" r="1.2" fill="#212121" />
        <path d="M24 28 Q30 36 36 28 Z" fill="#cfd8dc" stroke="#90a4ae" strokeWidth="0.8" />
        {/* Áo choàng lông chồn tuyết viền vàng */}
        <path d="M14 36 L46 36 L44 65 L16 65 Z" fill={primaryColor} stroke="#212121" strokeWidth="1.2" />
        <path d="M14 36 Q22 46 16 65 M46 36 Q38 46 44 65" stroke="#eceff1" strokeWidth="4" fill="none" />
        {/* Quyền trượng hoàng gia */}
        <line x1="48" y1="18" x2="48" y2="58" stroke={secondaryColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="48" cy="18" r="3.5" fill={secondaryColor} stroke="#b78103" strokeWidth="1" />
      </svg>
    );
  }

  // Át Bích Hoa Văn Hoàng Gia Lộng Lẫy (Ornate Master Ace of Spades)
  if (rank === 14 && suit === 0) {
    return (
      <svg className="cq-court-figure cq-ornate-ace" viewBox="0 0 64 64">
        <defs>
          <radialGradient id="cq-ace-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="28" fill="url(#cq-ace-glow)" />
        <path
          d="M32 6 C21 24 5 28 9 44 C12 56 24 54 28 48 L23 60 L41 60 L36 48 C40 54 52 56 55 44 C59 28 43 24 32 6 Z"
          fill="#1c2833"
          stroke="#d4af37"
          strokeWidth="2"
        />
        {/* Hoa văn dập nổi hoa cúc kim tiền bên trong */}
        <circle cx="32" cy="32" r="6" fill="#d4af37" stroke="#997a15" strokeWidth="1" />
        <path d="M32 20 L32 44 M20 32 L44 32" stroke="#d4af37" strokeWidth="1.5" />
      </svg>
    );
  }

  // Lá bài số thông thường: hiển thị Suit lớn ở giữa
  return <Suit suit={suit} size={38} className="cq-card-main-suit" />;
}

/**
 * Lá Bài Tây Cao Cấp (Royal Playing Card Component)
 */
export function PlayingCard({ id, selected = false, onClick, small = false }) {
  const Tag = onClick ? 'button' : 'span';
  const rank = id == null ? null : cardRank(id);
  const suit = id == null ? null : cardSuit(id);
  const label = ({ 11: 'J', 12: 'Q', 13: 'K', 14: 'A', 15: '2' })[rank] || rank;
  const isRed = suit != null && suit >= 2;

  // Mặt úp lá bài: Hoa văn Guilloche hoàng gia viền mạ vàng
  if (id == null) {
    return (
      <Tag
        type={onClick ? 'button' : undefined}
        role={onClick ? undefined : 'img'}
        className={`cq-card cq-card-back ${small ? 'cq-card-small' : ''}`}
        onClick={onClick}
        aria-label="Bài úp"
      >
        <div className="cq-card-back-pattern">
          <div className="cq-card-back-inner">
            <span className="cq-back-crest">✦</span>
          </div>
        </div>
      </Tag>
    );
  }

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      role={onClick ? undefined : 'img'}
      className={`cq-card ${isRed ? 'cq-card-red' : 'cq-card-black'} ${selected ? 'cq-selected' : ''} ${small ? 'cq-card-small' : ''}`}
      onClick={onClick}
      aria-label={`Lá ${label} ${['bích', 'chuồn', 'rô', 'cơ'][suit]}`}
      aria-pressed={onClick ? selected : undefined}
    >
      {/* Góc trên bên trái */}
      <span className="cq-card-corner cq-corner-tl">
        <b>{label}</b>
        <Suit suit={suit} size={small ? 8 : 12} />
      </span>

      {/* Tâm lá bài: Tranh vẽ hoàng gia J, Q, K, Át hoa văn hoặc chất bài */}
      <div className="cq-card-center-art">
        {small ? <Suit suit={suit} size={14} /> : <CourtFigure rank={rank} suit={suit} />}
      </div>

      {/* Góc dưới bên phải (xoay 180 độ đối xứng) */}
      <span className="cq-card-corner cq-corner-br">
        <b>{label}</b>
        <Suit suit={suit} size={small ? 8 : 12} />
      </span>
    </Tag>
  );
}

/**
 * Xúc Xắc 3D Sòng Bạc (Precision Casino Die)
 * Chấm 1 to Đỏ Ruby may mắn, chấm 4 Đỏ, các chấm 2, 3, 5, 6 Đen Onyx bóng loáng
 */
export function Die({ value = 1, symbol, rolling = false }) {
  const adjacent = [1, 2, 3, 4, 5, 6].filter(n => n !== value && n !== 7 - value);
  const right = adjacent[0], top = adjacent.find(n => n !== right && n !== 7 - right);
  const faces = [value, 7 - value, right, 7 - right, top, 7 - top];
  const symbols = [symbol, ...Object.keys(CASINO_SYMBOLS).filter(s => s !== symbol)];

  // Ma trận 3x3 chấm xúc xắc
  const pips = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };

  return (
    <div className={`cq-die-wrap ${rolling ? 'cq-rolling' : ''}`} aria-label={symbol || `Xúc xắc ${value}`}>
      <div className="cq-die">
        {['front', 'back', 'right', 'left', 'top', 'bottom'].map((side, i) => {
          const faceVal = faces[i];
          return (
            <div className={`cq-die-face cq-face-${side}`} key={side}>
              {symbol ? (
                <SymbolArt symbol={symbols[i]} />
              ) : (
                <div className={`cq-pips cq-pips-${faceVal}`}>
                  {Array.from({ length: 9 }, (_, j) => {
                    const isPip = pips[faceVal]?.includes(j);
                    if (!isPip) return <i key={j} className="cq-pip-empty" />;
                    // Điểm 1 hoặc 4: Màu đỏ ruby Á Đông!
                    const isRedPip = faceVal === 1 || faceVal === 4;
                    return <i key={j} className={`cq-pip ${isRedPip ? 'cq-pip-red' : 'cq-pip-black'} ${faceVal === 1 ? 'cq-pip-large' : ''}`} />;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Bóng đổ 3D mềm mại dưới chân viên xúc xắc */}
      <div className="cq-die-shadow" />
    </div>
  );
}

/**
 * Phỉnh Cược Sòng Bạc Cao Cấp (Ceramic Pro Casino Chips)
 * Hoa văn bánh răng xẻ rãnh, viền mạ vàng, dập nổi mệnh giá và hiệu ứng ánh sáng 3D
 */
export function Chip({ value, selected = false, onClick, draggable = false, onDragStart }) {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`cq-chip cq-chip-${value} ${selected ? 'cq-selected' : ''}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      aria-label={`Chip ${value} xu`}
      aria-pressed={onClick ? selected : undefined}
    >
      <div className="cq-chip-rim">
        <div className="cq-chip-core">
          <span className="cq-chip-num">{value >= 1000 ? `${value / 1000}K` : value}</span>
          <span className="cq-chip-label">XU</span>
        </div>
      </div>
      <div className="cq-chip-sheen" />
    </Tag>
  );
}
