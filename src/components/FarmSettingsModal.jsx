import React, { useEffect, useRef } from 'react';
import { GameAccountSettings } from './GameAccountUI.jsx';
import { HudIcon } from './icons3d/HudIcon.jsx';
import './FarmSettings.css';

const QUALITY = [
  ['auto', 'Tự động', 'Điều chỉnh theo thiết bị'],
  ['ultra', 'Siêu nét', 'Ưu tiên chất lượng hình ảnh'],
  ['balanced', 'Cân bằng', 'Hình đẹp, chơi mượt'],
  ['eco', 'Tiết kiệm', 'Chơi nhẹ, tiết kiệm pin'],
];
export function FarmSettingsModal({ name, level, googleLinked, onCredential, onLogout, onDelete, error,
  isMuted, onToggleAudio, graphicsQuality, onGraphicsChange, cameraViewMode, onCameraChange, onGuide, onClose }) {
  const panel = useRef(null);
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    panel.current?.querySelector('button')?.focus();
    const keyboard = event => {
      if (document.querySelector('.game-confirm-overlay')) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close.current(); }
      if (event.key !== 'Tab') return;
      const buttons = [...panel.current.querySelectorAll('button:not(:disabled), [tabindex="0"], input, a[href]')].filter(el => el.getClientRects().length);
      if (!buttons.length) return;
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keyboard, true);
    return () => { document.removeEventListener('keydown', keyboard, true); if (previous?.isConnected) previous.focus(); };
  }, []);
  return <div className="farm-settings-overlay" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="farm-settings" ref={panel} role="dialog" aria-modal="true" aria-labelledby="farm-settings-title">
      <header className="farm-settings-header"><span className="farm-settings-emblem"><HudIcon asset="settings" size={48}/></span>
        <div><small>NÔNG TRẠI BÌNH MINH</small><h2 id="farm-settings-title">Thiết lập</h2></div>
        <button className="farm-settings-close" onClick={onClose} aria-label="Đóng thiết lập">×</button>
      </header>
      <div className="farm-settings-body">
        <aside className="farm-settings-account"><h3>Tài khoản</h3><GameAccountSettings name={name} level={level} googleLinked={googleLinked} onCredential={onCredential} onLogout={onLogout} onDelete={onDelete} error={error}/>
          <button className="farm-settings-guide" onClick={onGuide}><HudIcon asset="quest" size={40}/><span><b>Sổ tay nông dân</b><small>Hướng dẫn chơi & khám phá</small></span><span aria-hidden="true">›</span></button>
        </aside>
        <div className="farm-settings-options">
          <section className="farm-settings-card"><div className="farm-settings-row"><div><h3>Âm thanh</h3><p>Âm thanh trong trò chơi</p></div><button className="farm-settings-switch" role="switch" aria-checked={!isMuted} aria-label="Âm thanh trò chơi" onClick={onToggleAudio}><span>{isMuted ? 'Tắt' : 'Bật'}</span><i aria-hidden="true"/></button></div></section>
          <section className="farm-settings-card"><div className="farm-settings-section-title"><HudIcon asset="camera" size={36}/><div><h3>Chất lượng hình ảnh</h3><p>Chọn chế độ phù hợp với thiết bị</p></div></div>
            <div className="farm-settings-quality" role="group" aria-label="Chất lượng đồ họa">{QUALITY.map(([value, label, hint]) => <button key={value} aria-pressed={graphicsQuality === value} onClick={() => onGraphicsChange(value)}><b>{label}</b><small>{hint}</small><span aria-hidden="true">{graphicsQuality === value ? '✓' : ''}</span></button>)}</div>
          </section>
          <section className="farm-settings-card"><div className="farm-settings-section-title"><HudIcon asset="map" size={36}/><div><h3>Góc nhìn</h3><p>Đổi cách quan sát nhân vật</p></div></div><div className="farm-settings-camera" role="group" aria-label="Góc nhìn">{[['explore', 'Khám phá'], ['farm', 'Canh tác']].map(([value, label]) => <button key={value} aria-pressed={(value === 'explore') === (cameraViewMode === 'explore')} onClick={() => { if ((value === 'explore') !== (cameraViewMode === 'explore')) onCameraChange(); }}>{label}</button>)}</div></section>
        </div>
      </div>
      <footer className="farm-settings-footer"><span>Thay đổi được áp dụng ngay</span><button onClick={onClose}>Xong</button></footer>
    </section>
  </div>;
}
