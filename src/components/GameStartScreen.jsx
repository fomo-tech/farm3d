import React, { useState, useEffect, useRef } from 'react';
import {
  Icon3dCrystalDiamond,
  Icon3dHotAirBalloon,
  Icon3dNoticeBoard,
  Icon3dFishingRodGold,
  Icon3dCityBus,
  Icon3dGoldenCarrot,
  Icon3dKittyBeret,
  Icon3dHeartBubble,
  Icon3dDeliveryTruck,
  Icon3dMilestoneGem,
} from './icons3d/GameIcons3D.jsx';

// Cutecore Thematic Tips with Dedicated 3D Icons
const CUTECORE_GAME_TIPS = [
  {
    tag: 'XE BUÝT',
    color: '#f59e0b',
    icon: Icon3dCityBus,
    text: 'Bắt xe buýt miễn phí tại trạm trung tâm dạo quanh thị trấn!',
  },
  {
    tag: 'CÂU CÁ',
    color: '#0284c7',
    icon: Icon3dFishingRodGold,
    text: 'Câu cá ven hồ săn các loài cá hiếm theo từng khung giờ bí ẩn!',
  },
  {
    tag: 'NÔNG TRẠI',
    color: '#16a34a',
    icon: Icon3dGoldenCarrot,
    text: 'Thu hoạch đúng giờ để rau củ luôn đạt phẩm chất 3 sao hoàng kim!',
  },
  {
    tag: 'THỜI TRANG',
    color: '#db2777',
    icon: Icon3dKittyBeret,
    text: 'Ghé Cửa Hàng Thời Trang để thử các bộ đồ thú cưng tai mèo đáng yêu!',
  },
  {
    tag: 'BẠN BÈ',
    color: '#e11d48',
    icon: Icon3dHeartBubble,
    text: 'Nhấn phím Cách (Space) để nhảy chân sáo vui vẻ cùng bạn bè!',
  },
  {
    tag: 'GIAO HÀNG',
    color: '#059669',
    icon: Icon3dDeliveryTruck,
    text: 'Giao đơn hàng xe tải để nhận x3 Tiền Vàng và Điểm Kinh Nghiệm!',
  },
];

function getLoadingStatus(percentage) {
  if (percentage < 30) return 'Đang kết nối Vibe City Server...';
  if (percentage < 65) return 'Đang tải cảnh quan thế giới 3D...';
  if (percentage < 90) return 'Đang nạp dữ liệu nhân vật & nông trại...';
  if (percentage < 99) return 'Đang hoàn tất chuẩn bị thế giới...';
  return 'Thế giới Vibe City đã sẵn sàng!';
}

function StartImageIcon({ asset, className = '', alt = '' }) {
  return (
    <img
      className={`pt-start-img-icon ${className}`.trim()}
      src={`/assets/hud/${asset}.webp`}
      alt={alt}
      loading="eager"
      decoding="async"
      draggable="false"
    />
  );
}

function Cute3DStar({ className = '', style = {} }) {
  return (
    <div className={`pt-logo-star ${className}`} style={style} aria-hidden="true">
      <svg viewBox="0 0 120 120" width="100%" height="100%">
        <defs>
          <linearGradient id="starBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff58a" />
            <stop offset="42%" stopColor="#ffca28" />
            <stop offset="85%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <filter id="starDepthShadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#92400e" floodOpacity="0.45" />
          </filter>
        </defs>
        <path
          d="M60 12 L73 45 L108 48 L81 72 L89 106 L60 88 L31 106 L39 72 L12 48 L47 45 Z"
          fill="url(#starBodyGrad)"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#starDepthShadow)"
        />
        <ellipse cx="54" cy="42" rx="9" ry="4.5" fill="rgba(255,255,255,0.75)" transform="rotate(-20 54 42)" />
        <circle cx="36" cy="52" r="3.5" fill="rgba(255,255,255,0.6)" />
      </svg>
    </div>
  );
}

export function GameStartScreen({
  bootPhase = 'loading',
  bootError = '',
  bootProgress = { phase: 'loading', percentage: 0, message: 'Đang khởi động…', current: 0, total: 40 },
  onBeginExit,
  onStart,
}) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const displayProgressRef = useRef(0);
  const [isExiting, setIsExiting] = useState(false);
  const targetProgress = bootPhase === 'ready' ? 100 : Math.max(5, Math.min(100, bootProgress?.percentage || 0));

  // Smooth responsive progress interpolation
  useEffect(() => {
    let animId;
    const step = () => {
      const previous = displayProgressRef.current;
      const diff = targetProgress - previous;
      if (diff <= 0) return;
      const speed = targetProgress >= 100 ? 0.35 : 0.22;
      const next = diff <= 0.3 ? targetProgress : Math.min(targetProgress, previous + Math.max(1, diff * speed));
      displayProgressRef.current = Math.round(next * 10) / 10;
      setDisplayProgress(displayProgressRef.current);
      if (displayProgressRef.current < targetProgress) animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [targetProgress]);

  const isReady = bootPhase === 'ready' && displayProgress >= 99.5;

  const handleStartGame = () => {
    if (!isReady || isExiting) return;
    setIsExiting(true);
    onBeginExit?.();
    setTimeout(() => {
      onStart?.();
    }, 420);
  };

  const statusMsg = getLoadingStatus(displayProgress);

  return (
    <div
      className={`pt-start-screen-backdrop cutecore-theme${isExiting ? ' pt-exiting' : ''}${isReady ? ' is-ready-state' : ''}`}
      onClick={isReady ? handleStartGame : undefined}
    >
      {/* Center Unified Presentation Block: Matches Reference 1:1 */}
      <main className="pt-start-center-content">
        {/* Brand Logo Lockup with 3D Mascot & Flanking Golden Stars */}
        <div className="pt-generated-logo-lockup">
          <Cute3DStar className="pt-star-left" />
          <img
            className="pt-generated-brand-logo"
            src="/assets/loading/vibe-city-logo.webp"
            alt="Vibe City — 3D Open World"
            fetchpriority="high"
            decoding="async"
          />
          <Cute3DStar className="pt-star-right" />
        </div>

        {/* Error State if WebGL / Asset Loading Failed */}
        {bootPhase === 'error' && (
          <div className="pt-error-card" onClick={e => e.stopPropagation()}>
            <b>Không thể kết nối thế giới 3D</b>
            <p>{bootError || 'Có sự cố khi khởi tạo đồ họa WebGL.'}</p>
            <button
              type="button"
              className="pt-retry-btn"
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </button>
          </div>
        )}

        {/* State A: Loading Game Console (Matching Reference Image) */}
        {bootPhase !== 'error' && !isReady && (
          <div className="pt-loading-console">
            {/* Progress bar capsule with right percentage badge */}
            <div className="pt-jelly-track-wrapper">
              <div className="pt-jelly-track">
                {/* Golden candy fluid fill with animated stripes & sheen */}
                <div
                  className="pt-jelly-fill"
                  style={{ width: `${Math.min(100, Math.max(4, displayProgress))}%` }}
                >
                  <div className="pt-candy-stripes" />
                  <div className="pt-candy-sheen" />
                </div>
              </div>
              <div className="pt-progress-pct-bubble">{Math.round(displayProgress)}%</div>
            </div>

            {/* Console Readout */}
            <div className="pt-loading-status-bar" aria-live="polite">
              <span className="pt-status-msg">{statusMsg}</span>
            </div>
          </div>
        )}

        {/* State B: Ready State - Login Actions (Matching Reference Image 1:1) */}
        {bootPhase !== 'error' && isReady && (
          <div className="pt-ready-action-stage">
            {/* Primary Golden Play Button: CHƠI NGAY with Radiant Cartoon Whiskers */}
            <div className="pt-play-now-wrap">
              <div className="pt-burst-rays-left" aria-hidden="true">
                <span className="ray ray-top" />
                <span className="ray ray-bottom" />
              </div>

              <button
                type="button"
                className="pt-play-now-btn"
                onClick={e => {
                  e.stopPropagation();
                  handleStartGame();
                }}
                aria-label="Chơi ngay"
              >
                <span className="pt-play-now-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                    <path d="M8 5.14v13.72a1.2 1.2 0 0 0 1.83 1.02l11.14-6.86a1.2 1.2 0 0 0 0-2.04L9.83 4.12A1.2 1.2 0 0 0 8 5.14z" />
                  </svg>
                </span>
                <span className="pt-play-now-text">CHƠI NGAY</span>
              </button>

              <div className="pt-burst-rays-right" aria-hidden="true">
                <span className="ray ray-top" />
                <span className="ray ray-bottom" />
              </div>
            </div>

            {/* Secondary Google Login Button: Đăng nhập Google */}
            <button
              type="button"
              className="pt-google-login-btn"
              onClick={e => {
                e.stopPropagation();
                handleStartGame();
              }}
              aria-label="Đăng nhập Google"
            >
              <svg className="pt-google-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.13C3.26 21.3 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.28C.46 8.2 0 10.04 0 12s.46 3.8 1.28 5.42l4-3.13z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.58l4 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
              </svg>
              <span className="pt-google-login-text">Đăng nhập Google</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
