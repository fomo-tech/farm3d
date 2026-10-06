import React from 'react';
import { GoogleSignInButton } from './GoogleSignInButton.jsx';
import './GameAccountUI.css';

function CharacterPortrait({ name, variant = 'guest' }) {
  return <span className={`game-auth-portrait ${variant}`} aria-hidden="true">
    <img className="game-auth-portrait-face" src="/assets/hud/farmer-avatar.webp" alt="" />
  </span>;
}

export function StartAccountBadge({ name, level, googleLinked }) {
  return <div className="game-auth-start-player" aria-label={`Nhân vật ${name || 'Nông dân mới'}, cấp ${level || 1}`}>
    <CharacterPortrait name={name} variant={googleLinked ? 'google' : 'guest'} />
    <span className="game-auth-start-copy"><small>TIẾP TỤC VỚI NHÂN VẬT</small><b>{name || 'Nông dân mới'}</b><span>Cấp {level || 1}<i aria-hidden="true">·</i>{googleLinked ? 'Đã lưu với Google' : 'Lưu trên máy này'}</span></span>
  </div>;
}

export function GameAccountSettings({ name, level, googleLinked, onCredential, onLogout, error }) {
  return <section className="game-auth-settings" aria-label="Tài khoản nhân vật">
    <div className="game-auth-settings-heading"><span>NHÂN VẬT</span><b>{googleLinked ? 'ĐÃ LIÊN KẾT' : 'TRÊN MÁY NÀY'}</b></div>
    <div className="game-auth-settings-player"><CharacterPortrait name={name} variant={googleLinked ? 'google' : 'guest'} />
      <span><strong>{name || 'Nông dân mới'}</strong><small>Cấp {level || 1} · {googleLinked ? 'Đã liên kết Google' : 'Đang chơi trên máy này'}</small></span>
    </div>
    {googleLinked ? <>
      <p>Nhân vật được lưu cùng tài khoản Google. Bạn có thể chơi trên thiết bị khác.</p>
      <button type="button" className="game-auth-logout" onClick={onLogout}>Đổi sang chơi khách</button>
    </> : <>
      <p>Đang lưu trên thiết bị này. Liên kết Google để chơi tiếp khi đổi máy.</p>
      <div className="game-auth-settings-google"><GoogleSignInButton text="continue_with" fallbackLabel="Liên kết Google" onCredential={onCredential} /></div>
    </>}
    {error && <small className="game-auth-inline-error" role="alert">{error}</small>}
  </section>;
}

export function GoogleAccountConflictDialog({ current, saved, onSwitch, onStay }) {
  return <div className="game-auth-conflict-backdrop" role="presentation">
    <section className="game-auth-conflict-panel" role="dialog" aria-modal="true" aria-labelledby="game-auth-conflict-title">
      <header><span className="game-auth-conflict-icon" aria-hidden="true">!</span><div>
        <small>ĐÃ CÓ NHÂN VẬT</small><h2 id="game-auth-conflict-title">Chọn nhân vật để tiếp tục</h2>
      </div></header>
      <div className="game-auth-conflict-body">
        <p>Google này đã lưu một nhân vật khác. Hai nhân vật <strong>không gộp dữ liệu</strong>.</p>
        <div className="game-auth-character-pair">
          <div className="game-auth-character-option"><CharacterPortrait name={current.name} /><small>ĐANG CHƠI</small><b>{current.name}</b><span>Cấp {current.level || 1}</span></div>
          <div className="game-auth-character-option saved"><CharacterPortrait name={saved.name} variant="google" /><small>TRÊN GOOGLE</small><b>{saved.name}</b><span>Cấp {saved.level || 1}</span></div>
        </div>
        <div className="game-auth-conflict-actions">
          <button type="button" className="stay" onClick={onStay}>Ở lại nhân vật này</button>
          <button type="button" className="switch" onClick={onSwitch}>Vào nhân vật Google</button>
        </div>
        <small className="game-auth-conflict-note">Chuyển nhân vật không xóa tiến trình khách trên thiết bị này.</small>
      </div>
    </section>
  </div>;
}
