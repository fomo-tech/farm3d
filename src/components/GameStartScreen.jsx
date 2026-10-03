import React, { useState, useEffect, useRef } from 'react';
import {
  Icon3dSprout,
  Icon3dSparkleStar,
  Icon3dChicken,
  Icon3dSun,
  Icon3dGoldCoin,
  Icon3dAudioOn,
  Icon3dAudioOff,
  Icon3dLightningBolt,
  Icon3dBatteryEco,
  Icon3dPartyPopper,
  Icon3dVillageGate,
} from './icons3d/GameIcons3D.jsx';

const TIPS = [
  'Bấm phím P hoặc chạm icon Điện Thoại để mở Bản Đồ, Đơn Hàng và Nâng Cấp!',
  'Bắt xe buýt liên làng tại các trạm dừng để ngắm cảnh sông uốn lượn và cối xay gió!',
  'Tưới nước cho cây trồng mỗi ngày để thu hoạch nông sản chất lượng cao.',
  'Gặp Quản Gia Oliver tại đài phun nước trung tâm để nhận hướng dẫn và hạt giống!',
  'Hãy ghé thăm Đầm Sen để ngắm hoa sen nở và thư giãn bên bờ sông!',
  'Bấm phím Cách để Nhảy và giữ phím Shift để Chạy nhanh khắp thung lũng!',
  'Đồ họa Ultra Retina HD mang lại khung cảnh sắc nét tuyệt đối trên mọi màn hình!',
];

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
  const [waitingSeconds, setWaitingSeconds] = useState(0);
  const targetProgress = bootPhase === 'ready' ? 100 : Math.max(5, Math.min(100, bootProgress?.percentage || 0));

  useEffect(() => {
    if (bootPhase === 'ready' || bootPhase === 'error') return undefined;
    const startedAt = Date.now();
    setWaitingSeconds(0);
    const timer = setInterval(() => setWaitingSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [bootPhase, bootProgress?.phase]);

  // Rotate tips every 3.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Smooth & ultra-responsive progress glide
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
    }, 380);
  };

  return (
    <div
      className={`pt-start-screen-backdrop${isExiting ? ' pt-exiting' : ''}${isReady ? ' is-ready-state' : ''}`}
      onClick={isReady ? handleStartGame : undefined}
    >
      {/* Floating Pastel Clouds (Play Together Sky) */}
      <div className="pt-clouds-container" aria-hidden="true">
        <div className="pt-cloud cloud-1" />
        <div className="pt-cloud cloud-2" />
        <div className="pt-cloud cloud-3" />
        <div className="pt-cloud cloud-4" />
      </div>

      {/* Floating Sparkles */}
      <div className="pt-sparkles-container" aria-hidden="true">
        <span className="pt-star star-1">✨</span>
        <span className="pt-star star-2">⭐</span>
        <span className="pt-star star-3">🌟</span>
        <span className="pt-star star-4">✨</span>
      </div>

      {/* Top Controls Bar */}
      <div className="pt-start-top-bar" onClick={e => e.stopPropagation()}>
        <div className="pt-server-pill">
          <span className="pt-server-dot" />
          <Icon3dVillageGate size={16} />
          <b>Máy Chủ Kaia Châu Á</b>
          <small>Kênh #01 · Trực Tuyến 12ms</small>
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
      </div>

      {/* Centerpiece Content */}
      <div className="pt-start-center-content">
        <div className="pt-brand-badge">
          <Icon3dSprout size={28} />
          <span>PHONG CÁCH PLAY TOGETHER · KAIA WORLD</span>
          <Icon3dSparkleStar size={22} />
        </div>

        <h1 className="pt-game-title-3d">
          <span className="pt-title-main">NÔNG TRẠI KAIA</span>
          <span className="pt-title-sub">THUNG LŨNG 3D</span>
        </h1>

        <p className="pt-game-tagline">
          Thế giới nông trại ảo trực tuyến · Trồng trọt, xây nhà và gắn kết bè bạn
        </p>

        {/* Mascot Area */}
        <div className="pt-mascot-stage" aria-hidden="true">
          <div className={`pt-mascot-chibi${isReady ? ' pt-mascot-celebrate' : ''}`}>
            <Icon3dChicken size={isReady ? 68 : 56} />
          </div>
          <div className="pt-mascot-shadow" />
        </div>

        {/* Error Handling */}
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

        {/* Progress & Loading Stage */}
        {bootPhase !== 'error' && !isReady && (
          <div className="pt-loader-card">
            <div className="pt-loader-header">
              <span className="pt-loader-status-text">
                {bootProgress?.message || 'Đang nạp dữ liệu thế giới…'}
              </span>
              {bootProgress?.total > 0 && (
                <span className="pt-loader-counter-badge">
                  {bootProgress.current}/{bootProgress.total}
                </span>
              )}
            </div>

            {/* Candy Striped Jelly Bar */}
            <div className="pt-candy-bar-track">
              <div
                className="pt-candy-bar-fill"
                style={{ width: `${Math.min(100, Math.max(4, displayProgress))}%` }}
              >
                <div className="pt-candy-stripes" />
                <span className="pt-candy-highlight" />
                <span className="pt-candy-tip-glow" />
              </div>
            </div>

            <div className="pt-loader-percentage-row">
              <span className="pt-percentage-label">Tiến trình tải tài nguyên</span>
              <b className="pt-percentage-val">{Math.round(displayProgress)}%</b>
            </div>
            {waitingSeconds >= 8 && (
              <p className="pt-loader-wait-note" role="status">
                Cảnh 3D đang được chuẩn bị. Nếu máy tải chậm, bạn vẫn có thể chờ tại đây; game sẽ tự mở nút Bắt đầu khi sẵn sàng.
              </p>
            )}

            {/* Did you know tip */}
            <div className="pt-tip-capsule">
              <div className="pt-tip-icon">💡</div>
              <p className="pt-tip-text">{TIPS[tipIndex]}</p>
            </div>
          </div>
        )}

        {/* Touch to start when 100% loaded */}
        {bootPhase !== 'error' && isReady && (
          <div className="pt-start-action-wrap">
            <button
              type="button"
              className="pt-big-start-btn"
              onClick={e => {
                e.stopPropagation();
                handleStartGame();
              }}
              aria-label="Chạm để bắt đầu"
            >
              <span className="pt-start-btn-sparkle left">
                <Icon3dSparkleStar size={28} />
              </span>
              <span className="pt-start-btn-text">CHẠM ĐỂ BẮT ĐẦU</span>
              <span className="pt-start-btn-sparkle right">
                <Icon3dPartyPopper size={28} />
              </span>
            </button>
            <span className="pt-start-subhint">Bấm vào bất cứ đâu để bước vào thung lũng</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="pt-start-footer">
        <span>© 2026 Kaia Farm 3D · Động cơ thế giới mở thời gian thực</span>
      </footer>
    </div>
  );
}
