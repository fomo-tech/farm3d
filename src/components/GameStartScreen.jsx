import React, { useState, useEffect, useRef } from 'react';
import {
  Icon3dSparkleStar,
  Icon3dChicken,
  Icon3dSun,
  Icon3dAudioOn,
  Icon3dAudioOff,
  Icon3dLightningBolt,
  Icon3dBatteryEco,
  Icon3dSprout,
} from './icons3d/GameIcons3D.jsx';

const PLAY_TOGETHER_TIPS = [
  'Mẹo: Bắt xe buýt liên làng miễn phí để ngắm nhìn toàn cảnh thị trấn xinh đẹp!',
  'Mẹo: Thử vận may câu cá ở Bến Cảng để săn các loài cá hiếm khổng lồ!',
  'Mẹo: Thu hoạch cây trồng đúng giờ để nông sản luôn đạt độ tươi ngon xuất sắc!',
  'Mẹo: Ghé Cửa Hàng Thời Trang để phối cho mình bộ cánh ấn tượng nhất!',
  'Mẹo: Tụ tập bạn bè tại Quảng Trường Trung Tâm để mở tiệc khiêu vũ sôi động!',
  'Mẹo: Bấm phím Cách để nhảy chân sáo và giữ Shift để chạy nhanh khắp thị trấn!',
  'Mẹo: Gặp Quản Gia Oliver tại đài phun nước để nhận hướng dẫn và hạt giống!',
  'Mẹo: Dạo bước quanh Hồ Pha Lê và Đầm Sen để thư giãn bên bờ sông thơ mộng!',
];

function getLoadingStatus(percentage) {
  if (percentage < 25) return 'Đang kết nối thế giới Vibe City...';
  if (percentage < 50) return 'Đang chuẩn bị trang phục & nông trại...';
  if (percentage < 75) return 'Đang đón các chuyến xe buýt dạo phố...';
  if (percentage < 95) return 'Đang mở cửa các gian hàng Plaza...';
  return 'Thế giới 3D đã sẵn sàng chào đón bạn!';
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
    }, 400);
  };

  const statusMsg = getLoadingStatus(displayProgress);

  return (
    <div
      className={`pt-start-screen-backdrop${isExiting ? ' pt-exiting' : ''}${isReady ? ' is-ready-state' : ''}`}
      onClick={isReady ? handleStartGame : undefined}
    >
      {/* Floating Stylized Clouds */}
      <div className="pt-clouds-container" aria-hidden="true">
        <div className="pt-cloud cloud-1" />
        <div className="pt-cloud cloud-2" />
        <div className="pt-cloud cloud-3" />
        <div className="pt-cloud cloud-4" />
      </div>

      {/* Floating Sparkles */}
      <div className="pt-sparkles-container" aria-hidden="true">
        {[1, 2, 3, 4, 5].map(index => (
          <span key={index} className={`pt-star star-${index}`}>
            <Icon3dSparkleStar size={24} />
          </span>
        ))}
      </div>

      {/* Top Mobile Game Header Bar */}
      <header className="pt-start-top-bar" onClick={e => e.stopPropagation()}>
        <div className="pt-game-badge">
          <span className="pt-badge-dot" />
          <span className="pt-badge-title">VIBE CITY</span>
          <span className="pt-badge-ver">v1.0</span>
        </div>

        <div className="pt-start-top-actions">
          {onToggleGraphics && (
            <button
              type="button"
              className={`pt-candy-btn pt-quality-bubble preset-${graphicsQuality}`}
              onClick={onToggleGraphics}
              title={`Đồ họa: ${graphicsQuality.toUpperCase()}`}
            >
              {graphicsQuality === 'ultra' && <Icon3dSparkleStar size={20} />}
              {graphicsQuality === 'balanced' && <Icon3dLightningBolt size={20} />}
              {graphicsQuality === 'eco' && <Icon3dBatteryEco size={20} />}
            </button>
          )}

          {onToggleMute && (
            <button
              type="button"
              className="pt-candy-btn pt-audio-btn"
              onClick={onToggleMute}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <Icon3dAudioOff size={22} /> : <Icon3dAudioOn size={22} />}
            </button>
          )}
        </div>
      </header>

      {/* Center 3D Bubble Logo & Mascot */}
      <div className="pt-start-center-content">
        {/* Play Together Signature 3D Bubble Logo */}
        <div className="pt-game-logo-3d">
          <div className="pt-logo-stars" aria-hidden="true">
            <Icon3dSparkleStar size={26} className="logo-sparkle-left" />
            <Icon3dSparkleStar size={20} className="logo-sparkle-right" />
          </div>
          <div className="pt-logo-title-wrap">
            <h1 className="pt-logo-main-text">VIBE CITY</h1>
          </div>
          <div className="pt-logo-sub-badge">
            <Icon3dSprout size={16} />
            <span>3D OPEN WORLD</span>
          </div>
        </div>

        {/* Mascot Chibi Area */}
        <div className="pt-mascot-podium" aria-hidden="true">
          <div className="pt-speech-bubble">
            <span>{isReady ? 'Thị trấn đã mở! Chạm để vào chơi nào! ✨' : 'Chào mừng bạn đến với Vibe City! 🎈'}</span>
            <div className="pt-bubble-arrow" />
          </div>
          <div className={`pt-mascot-chibi-3d${isReady ? ' is-celebrating' : ''}`}>
            <Icon3dChicken size={isReady ? 96 : 82} />
          </div>
          <div className="pt-podium-shadow" />
        </div>

        {/* Error State */}
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
      </div>

      {/* Soft stylized bottom horizon clouds */}
      <div className="pt-horizon-clouds" aria-hidden="true">
        <div className="pt-hcloud hcloud-left" />
        <div className="pt-hcloud hcloud-center" />
        <div className="pt-hcloud hcloud-right" />
      </div>

      {/* Bottom Area: Candy Jelly Loading Bar OR Touch To Start Button */}
      <div className="pt-start-bottom-dock">
        {bootPhase !== 'error' && !isReady && (
          <div className="pt-loading-dock">
            {/* Status Line */}
            <div className="pt-loading-status-bar">
              <span className="pt-status-msg">{statusMsg}</span>
              <span className="pt-status-pct">{Math.round(displayProgress)}%</span>
            </div>

            {/* Candy Striped Jelly Bar with Animated Runner */}
            <div className="pt-jelly-track">
              <div
                className="pt-jelly-fill"
                style={{ width: `${Math.min(100, Math.max(5, displayProgress))}%` }}
              >
                <div className="pt-candy-stripes" />
                <div className="pt-candy-sheen" />
                <div className="pt-runner-icon" aria-hidden="true">
                  <Icon3dChicken size={26} />
                </div>
              </div>
            </div>

            {/* In-game Casual Life Tip Pill */}
            <div className="pt-tip-pill">
              <span className="pt-tip-icon-wrap"><Icon3dSun size={18} /></span>
              <p className="pt-tip-content">{PLAY_TOGETHER_TIPS[tipIndex]}</p>
            </div>
          </div>
        )}

        {/* Touch To Start Button (Play Together Iconic Arcady CTA) */}
        {bootPhase !== 'error' && isReady && (
          <div className="pt-ready-action-stage">
            <button
              type="button"
              className="pt-touch-start-btn"
              onClick={e => {
                e.stopPropagation();
                handleStartGame();
              }}
              aria-label="Chạm để bắt đầu"
            >
              <div className="pt-touch-glow-fx" />
              <div className="pt-touch-shine-sweep" />
              <Icon3dSparkleStar size={24} className="btn-sparkle left" />
              <span className="pt-touch-text">CHẠM ĐỂ BẮT ĐẦU</span>
              <Icon3dSparkleStar size={24} className="btn-sparkle right" />
            </button>
            <span className="pt-touch-hint">CHẠM BẤT KỲ ĐÂU ĐỂ VÀO THỊ TRẤN</span>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-start-footer">
          <span>© 2026 Vibe City</span>
        </footer>
      </div>
    </div>
  );
}
