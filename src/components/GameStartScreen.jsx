import React, { useState, useEffect, useRef } from 'react';
import {
  Icon3dSparkleStar,
  Icon3dChicken,
  Icon3dSun,
  Icon3dPlayCandy,
  Icon3dMegaphoneGold,
  Icon3dAudioMuted,
  Icon3dCrystalDiamond,
  Icon3dNotificationBell,
  Icon3dHotAirBalloon,
} from './icons3d/GameIcons3D.jsx';
import { GameTitleLogo3D } from './GameTitleLogo3D.jsx';
import { MascotDiorama3D } from './MascotDiorama3D.jsx';

const PLAY_TOGETHER_TIPS = [
  'Bắt xe buýt miễn phí tại trạm trung tâm dạo quanh thị trấn!',
  'Câu cá ven hồ săn các loài cá hiếm theo từng khung giờ!',
  'Thu hoạch đúng giờ để rau củ luôn đạt chất lượng 3 sao!',
  'Ghé Cửa Hàng Thời Trang để thử các bộ đồ thú cưng đáng yêu!',
  'Nhấn phím Cách (Space) để nhảy chân sáo vui vẻ cùng bạn bè!',
  'Gặp Quản Gia Oliver tại nông trại để nhận hạt giống miễn phí!',
  'Giao đơn hàng xe tải để nhận x3 Tiền Vàng và Điểm Kinh Nghiệm!',
];

function getLoadingStatus(percentage) {
  if (percentage < 25) return 'Đang kết nối Vibe City Server...';
  if (percentage < 50) return 'Đang nạp dữ liệu thế giới 3D...';
  if (percentage < 75) return 'Đang dựng cảnh quan thị trấn...';
  if (percentage < 95) return 'Đang kiểm tra tài nguyên...';
  return 'Thế giới 3D đã sẵn sàng!';
}

export function GameStartScreen({
  bootPhase = 'loading',
  bootError = '',
  bootProgress = { phase: 'loading', percentage: 0, message: 'Đang khởi động…', current: 0, total: 40 },
  onStart,
  isMuted = false,
  onToggleMute,
  graphicsQuality = 'ultra',
  onToggleGraphics,
}) {
  const [tipIndex, setTipIndex] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const displayProgressRef = useRef(0);
  const [isExiting, setIsExiting] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const targetProgress = bootPhase === 'ready' ? 100 : Math.max(5, Math.min(100, bootProgress?.percentage || 0));

  // Rotate tips every 3.8s
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % PLAY_TOGETHER_TIPS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

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
    setTimeout(() => {
      onStart?.();
    }, 420);
  };

  const statusMsg = getLoadingStatus(displayProgress);

  return (
    <div
      className={`pt-start-screen-backdrop${isExiting ? ' pt-exiting' : ''}${isReady ? ' is-ready-state' : ''}`}
      onClick={isReady ? handleStartGame : undefined}
    >
      {/* 1. Subtle Radial God-Rays / Sunburst in the Sky */}
      <div className="pt-sunburst-layer" aria-hidden="true" />

      {/* 2. Layered Floating Clouds (Parallax Sky) */}
      <div className="pt-clouds-container" aria-hidden="true">
        <div className="pt-cloud cloud-1" />
        <div className="pt-cloud cloud-2" />
        <div className="pt-cloud cloud-3" />
        <div className="pt-cloud cloud-4" />
      </div>

      {/* 3. Tiny Hot-Air Balloon Drifting in Distant Sky */}
      <div className="pt-distant-balloon" aria-hidden="true">
        <Icon3dHotAirBalloon size={42} />
      </div>

      {/* 4. Ambient Sparkle Stars */}
      <div className="pt-sparkles-container" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6].map(index => (
          <span key={index} className={`pt-star star-${index}`}>
            <Icon3dSparkleStar size={24} />
          </span>
        ))}
      </div>

      {/* 5. Top Mobile Game HUD Bar (Professional Game Architecture) */}
      <header className="pt-start-top-bar" onClick={e => e.stopPropagation()}>
        {/* Left: Server Status & UID */}
        <div className="pt-hud-server-badge">
          <span className="pt-hud-ping-dot" />
          <span className="pt-hud-server-title">Bình Minh 01</span>
          <span className="pt-hud-ping-val">24ms</span>
          <span className="pt-hud-uid-tag">UID: 20261003</span>
        </div>

        {/* Right: Game Utility Squircles (Announcements, Quality, Audio) */}
        <div className="pt-start-top-actions">
          {/* Notice Button */}
          <button
            type="button"
            className="pt-candy-btn pt-notice-btn"
            onClick={() => setShowNoticeModal(prev => !prev)}
            title="Bảng tin sự kiện"
          >
            <Icon3dNotificationBell size={24} hasBadge={true} />
          </button>

          {/* Graphics Quality */}
          {onToggleGraphics && (
            <button
              type="button"
              className={`pt-candy-btn pt-quality-bubble preset-${graphicsQuality}`}
              onClick={onToggleGraphics}
              title={`Đồ họa: ${graphicsQuality.toUpperCase()}`}
            >
              <Icon3dCrystalDiamond size={24} variant={graphicsQuality} />
            </button>
          )}

          {/* Sound Toggle */}
          {onToggleMute && (
            <button
              type="button"
              className="pt-candy-btn pt-audio-btn"
              onClick={onToggleMute}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <Icon3dAudioMuted size={24} /> : <Icon3dMegaphoneGold size={24} />}
            </button>
          )}
        </div>
      </header>

      {/* 6. Center Stage: Master 3D Game Brand Mark + Grounded Mascot Diorama */}
      <main className="pt-start-center-content">
        {/* Master 3D Vector Game Title Mark */}
        <GameTitleLogo3D />

        {/* Grounded Mascot on Floating Cloud Pedestal */}
        <MascotDiorama3D isReady={isReady} statusMsg={statusMsg} />

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
      </main>

      {/* 7. Soft Horizon Silhouette Landscape */}
      <div className="pt-horizon-silhouette" aria-hidden="true" />

      {/* 8. Bottom Game Console: Loading Track OR Touch To Start Banner */}
      <div className="pt-start-bottom-dock">
        {/* State A: Loading Game Console */}
        {bootPhase !== 'error' && !isReady && (
          <div className="pt-loading-console">
            {/* Console Readout */}
            <div className="pt-loading-status-bar">
              <span className="pt-status-msg">{statusMsg}</span>
              <span className="pt-status-pct">{Math.round(displayProgress)}%</span>
            </div>

            {/* Heavy Candy/Glass Progress Bar with Running Mascot */}
            <div className="pt-jelly-track">
              <div
                className="pt-jelly-fill"
                style={{ width: `${Math.min(100, Math.max(5, displayProgress))}%` }}
              >
                <div className="pt-candy-stripes" />
                <div className="pt-candy-sheen" />
                <div className="pt-runner-icon" aria-hidden="true">
                  <Icon3dChicken size={28} />
                </div>
              </div>
            </div>

            {/* In-Game Tip Ticker Pill */}
            <div className="pt-tip-pill">
              <span className="pt-tip-icon-wrap"><Icon3dSun size={18} /></span>
              <p className="pt-tip-content">{PLAY_TOGETHER_TIPS[tipIndex]}</p>
            </div>
          </div>
        )}

        {/* State B: Ready State - Touch To Start Arcade Call To Action */}
        {bootPhase !== 'error' && isReady && (
          <div className="pt-ready-action-stage">
            {/* Animated Pulsing Touch Prompt */}
            <div className="pt-touch-prompt-banner">
              <span className="prompt-chevron">«</span>
              <span className="prompt-text">CHẠM VÀO MÀN HÌNH ĐỂ BẮT ĐẦU</span>
              <span className="prompt-chevron">»</span>
            </div>

            {/* Golden Candy Button CTA */}
            <button
              type="button"
              className="pt-touch-start-btn"
              onClick={e => {
                e.stopPropagation();
                handleStartGame();
              }}
              aria-label="Vào thị trấn"
            >
              <div className="pt-touch-glow-fx" />
              <div className="pt-touch-shine-sweep" />
              <Icon3dPlayCandy size={38} className="btn-play-icon" />
              <span className="pt-touch-text">VÀO THỊ TRẤN</span>
              <Icon3dSparkleStar size={24} className="btn-sparkle right" />
            </button>

            {/* Account & Server Quick Pill */}
            <div className="pt-server-account-bar">
              <span className="pt-account-tag">👤 Khách_8832</span>
              <span className="pt-bar-dot">•</span>
              <span className="pt-server-tag">🟢 Máy chủ: Bình Minh 01 (Khuyên dùng)</span>
            </div>
          </div>
        )}

        {/* Game Footer & Legal Notice */}
        <footer className="pt-start-footer">
          <span>Phiên bản 1.0.4 · © 2026 Vibe City Studio · [12+] Phù hợp cho mọi lứa tuổi</span>
        </footer>
      </div>

      {/* Events / Notice Dialog Modal (When clicking notification bell) */}
      {showNoticeModal && (
        <div
          className="pt-notice-modal-backdrop"
          onClick={() => setShowNoticeModal(false)}
        >
          <div
            className="pt-notice-modal-card"
            onClick={e => e.stopPropagation()}
          >
            <div className="pt-modal-header">
              <span className="pt-modal-title">📢 BẢNG TIN THỊ TRẤN</span>
              <button
                type="button"
                className="pt-modal-close"
                onClick={() => setShowNoticeModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="pt-modal-body">
              <div className="pt-notice-item">
                <span className="pt-notice-tag hot">MỚI</span>
                <b>Khai mở Thị Trấn Bình Minh 3D</b>
                <p>Khám phá nông trại mở rộng, bờ hồ câu cá thư giãn và tuyến xe buýt miễn phí dạo quanh thị trấn!</p>
              </div>
              <div className="pt-notice-item">
                <span className="pt-notice-tag gift">QUÀ TẶNG</span>
                <b>Quà Chào Mừng Tân Thủ</b>
                <p>Nhận ngay 1.000 Tiền Vàng và Hạt Giống Thần Kỳ khi đăng nhập vào thị trấn hôm nay.</p>
              </div>
            </div>
            <button
              type="button"
              className="pt-modal-confirm-btn"
              onClick={() => setShowNoticeModal(false)}
            >
              Đồng ý
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
