import React, { useRef } from 'react';
import { GoogleSignInButton } from './GoogleSignInButton.jsx';
import './StartScreen.css';

// This screen deliberately has its own markup and styles. Old title-screen
// rules must not size or animate it inside the rotated game viewport.
export function GameStartScreen({ bootPhase = 'loading', bootError = '', bootProgress = {},
  onBeginExit, onRequestStart, onStart, onGoogleCredential, authError,
  playerName, playerLevel, googleLinked }) {
  const entering = useRef(false);
  const ready = bootPhase === 'ready';
  const idle = bootPhase === 'idle';
  const failed = bootPhase === 'error';
  const percentage = ready ? 100 : Math.min(100, Math.max(0, Number(bootProgress.percentage) || 0));
  const play = () => {
    if (idle) { onRequestStart?.(); return; }
    if (!ready || entering.current) return;
    entering.current = true;
    onBeginExit?.();
    onStart?.();
  };
  return <section className="start-view" aria-label="Bắt đầu Vibe City">
    <div className="start-view-layout">
      <img className="start-view-logo" src="/assets/loading/vibe-city-logo.webp" alt="Vibe City — 3D Open World" fetchpriority="high" />
      <div className="start-view-content">
        {failed ? <div className="start-view-card" role="alert">
          <h1>Chưa thể mở thế giới</h1><p>{bootError || 'Hãy tải lại để thử lần nữa.'}</p>
          <button type="button" onClick={() => window.location.reload()}>Tải lại trang</button>
        </div> : idle || ready ? <div className="start-view-card">
          <div className="start-view-player"><strong>{playerName || 'Người chơi mới'}</strong><small>Cấp {playerLevel || 1} · {googleLinked ? 'Đã lưu với Google' : 'Lưu trên máy này'}</small></div>
          <button className="start-view-play" type="button" onClick={play} aria-label="Chơi ngay">▶ CHƠI NGAY</button>
          {!googleLinked && <div className="start-view-google"><GoogleSignInButton onCredential={onGoogleCredential}/></div>}
          {authError && <small role="alert">{authError}</small>}
        </div> : <div className="start-view-loading" aria-live="polite">
          <div><strong>Đang mở thế giới</strong><b>{Math.round(percentage)}%</b></div>
          <progress aria-label="Tải thế giới" max="100" value={percentage}/>
          <p>{bootProgress.message || 'Đang chuẩn bị thế giới…'}</p>
        </div>}
      </div>
    </div>
  </section>;
}
