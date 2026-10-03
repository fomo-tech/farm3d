import { useState } from 'react';
import { Icon3dNonLa } from './icons3d/GameIcons3D.jsx';

export function CharacterCreationModal({ defaultName = 'Nông dân mới', onSubmit }) {
  const [name, setName] = useState(defaultName);
  return <div className="onboarding-backdrop"><section className="character-creator-card" role="dialog" aria-modal="true" aria-label="Tạo nhân vật">
    <div className="creator-header"><Icon3dNonLa size={42} /><h2>Khởi tạo nhân vật</h2><p>Bạn bắt đầu tại thị trấn với 180 xu, chưa có đất hoặc nhà. Khám phá các làng và tự chọn mua lô đất của mình.</p></div>
    <form className="creator-body" onSubmit={event => { event.preventDefault(); if (name.trim()) onSubmit({ name: name.trim(), avatarIcon: 'farmer', outfit: 'starter', outfitColor: '#f8fafc' }); }}>
      <div className="creator-controls"><div className="input-group"><label htmlFor="farmer-name-input">Tên người chơi</label><input id="farmer-name-input" required maxLength={24} value={name} onChange={event => setName(event.target.value)} /></div>
      <p>Trang phục khởi đầu đơn giản. Đất càng gần trung tâm thị trấn, giá càng cao. Sau khi mua, bảng tên trước lô đất sẽ hiển thị tên bạn.</p>
      <button className="creator-submit-btn" disabled={!name.trim()} type="submit">Vào thị trấn</button></div>
    </form>
  </section></div>;
}
