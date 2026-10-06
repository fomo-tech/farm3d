import React, { useState, useEffect, useRef } from 'react';
import { GoogleSignInButton } from './GoogleSignInButton.jsx';
import { StartAccountBadge } from './GameAccountUI.jsx';
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
  onRequestStart,
  onStart,
  onGoogleCredential,
  authError,
  playerName,
  playerLevel,
  googleLinked,
}) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const displayProgressRef = useRef(0);
  const [isExiting, setIsExiting] = useState(false);
  const targetProgress = bootPhase === 'idle' ? 0 : bootPhase === 'ready' ? 100 : Math.max(5, Math.min(100, bootProgress?.percentage || 0));

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
    if (bootPhase === 'idle') { onRequestStart?.(); return; }
    if (!isReady || isExiting) return;
    setIsExiting(true);
    onBeginExit?.();
    setTimeout(() => {
      onStart?.();
    }, 420);
  };

  const statusMsg = bootProgress?.message || getLoadingStatus(displayProgress);

  return (
    <div
      className={`pt-start-screen-backdrop cutecore-theme${isExiting ? ' pt-exiting' : ''}${isReady ? ' is-ready-state' : ''}`}
      onClick={isReady ? handleStartGame : undefined}
    >
      {/* Center Unified Presentation Block: Matches Reference 1:1 */}
      <main className="pt-start-center-content">
        {/* Brand Logo Lockup with 3D Mascot & Flanking Golden Stars */}
        <div className="pt-generated-logo-lockup">
          <img
            className="pt-generated-brand-logo"
            src="/assets/loading/vibe-city-logo.webp"
            alt="Vibe City — 3D Open World"
            fetchpriority="high"
            decoding="async"
          />
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
        {bootPhase !== 'error' && bootPhase !== 'idle' && !isReady && (
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
        {(bootPhase === 'idle' || isReady) && (
          <div className="pt-ready-action-stage">
            <StartAccountBadge name={playerName} level={playerLevel} googleLinked={googleLinked} />
            {/* One primary action; account and sign-in stay secondary. */}
            <div className="pt-play-now-wrap">

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
                <span className="pt-play-now-text">VÀO THẾ GIỚI</span>
              </button>

            </div>

            {/* Secondary Google Login Button: Đăng nhập Google */}
            <div className="pt-google-login-btn" onClick={event => event.stopPropagation()}>
              <GoogleSignInButton onCredential={onGoogleCredential} />
            </div>
            {authError && <small role="alert" className="pt-google-config-note">{authError}</small>}
          </div>
        )}
      </main>
    </div>
  );
}
