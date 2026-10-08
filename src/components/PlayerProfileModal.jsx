import { useEffect, useRef, useState } from 'react';
import { PROFILE_AVATAR_MAX_LENGTH } from '../../shared/profileAvatar.js';
import { ArrivalAvatar } from './ArrivalAvatar.jsx';
import './PlayerProfileModal.css';

const metric = (label, value) => <div className="profile-metric" key={label}><strong>{Number(value || 0).toLocaleString('vi-VN')}</strong><span>{label}</span></div>;

export function PlayerProfileModal({ profile, loading, own, friend, connected, onClose, onSave, onFriend }) {
  const fileInput = useRef(null);
  const [avatar, setAvatar] = useState(profile?.avatar || '');
  const [imageError, setImageError] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  useEffect(() => { setName(profile?.name || ''); setBio(profile?.bio || ''); setAvatar(profile?.avatar || ''); setImageError(''); setEditing(false); }, [profile?.playerId, profile?.name, profile?.bio, profile?.avatar]);
  useEffect(() => {
    const keydown = event => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [onClose]);
  const chooseAvatar = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImageError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setImageError('Chọn ảnh JPG, PNG hoặc WebP tối đa 10 MB.');
      return;
    }
    setImageLoading(true);
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 128;
      const context = canvas.getContext('2d');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, 128, 128);
      const side = Math.min(image.naturalWidth, image.naturalHeight);
      context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, 128, 128);
      let result;
      for (const quality of [0.85, 0.7, 0.5, 0.3]) {
        result = canvas.toDataURL('image/jpeg', quality);
        if (result.length <= PROFILE_AVATAR_MAX_LENGTH) break;
      }
      if (result.length > PROFILE_AVATAR_MAX_LENGTH) throw new Error('large');
      setAvatar(result);
    } catch {
      setImageError('Không đọc được ảnh. Hãy chọn ảnh khác.');
    } finally {
      URL.revokeObjectURL(url);
      setImageLoading(false);
    }
  };
  const joined = profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('vi-VN') : '—';
  const xpFloor = 80 * Math.max(0, (profile?.level || 1) - 1) ** 2;
  const xpCeiling = 80 * (profile?.level || 1) ** 2;
  return <div className="profile-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="profile-card" role="dialog" aria-modal="true" aria-label="Hồ sơ người chơi">
      <header className="profile-header"><div><small>THÔNG TIN CƯ DÂN</small><h2>Hồ sơ người chơi</h2></div><button type="button" className="profile-close" onClick={onClose} aria-label="Đóng hồ sơ">×</button></header>
      {loading && connected ? <p className="profile-message">Đang mở hồ sơ…</p> : !profile ? <p className="profile-message">{connected ? 'Không tìm thấy hồ sơ người chơi.' : 'Chưa có kết nối. Hãy thử lại sau.'}</p> : <>
        <div className="profile-body">
          <aside className="profile-identity"><div className="profile-avatar">{(editing ? avatar : profile.avatar) ? <img className="profile-photo" src={editing ? avatar : profile.avatar} alt={`Ảnh đại diện của ${profile.name}`} /> : <ArrivalAvatar outfit={profile.outfit} color="#f8fafc" />}<span>CẤP {profile.level}</span></div>
            <span className="profile-identity-label">{editing ? 'ẢNH ĐẠI DIỆN CỦA BẠN' : 'CƯ DÂN THỊ TRẤN'}</span>
            {own && <button type="button" className="profile-change-photo" disabled={imageLoading || !connected} onClick={() => { setEditing(true); fileInput.current?.click(); }}>{imageLoading ? 'Đang xử lý…' : 'Đổi ảnh đại diện'}</button>}
            {editing && <><small className="profile-photo-hint">JPG, PNG, WebP · tối đa 10 MB<br />Ảnh tự cắt vuông ở giữa</small>{avatar && <button type="button" className="profile-reset-photo" disabled={imageLoading} onClick={() => setAvatar('')}>Dùng nhân vật 3D</button>}</>}
            <input ref={fileInput} className="profile-file-input" type="file" accept="image/jpeg,image/png,image/webp" disabled={imageLoading} onChange={chooseAvatar} aria-label="Chọn ảnh đại diện" />
          </aside>
          <div className="profile-info">
            {editing ? <form onSubmit={event => { event.preventDefault(); if (!imageLoading) onSave({ name: name.trim(), bio: bio.trim(), avatar }); }}>
              <div className="profile-form-heading"><small>THỂ HIỆN CÁ TÍNH</small><h3>Chỉnh sửa hồ sơ</h3><p>Thêm một chút dấu ấn của riêng bạn.</p></div>
              {imageError && <p className="profile-image-error" role="alert">{imageError}</p>}
              <label>Tên nhân vật<input maxLength={18} minLength={3} value={name} onChange={event => setName(event.target.value)} required /></label>
              <label>Giới thiệu<textarea maxLength={80} rows={2} value={bio} onChange={event => setBio(event.target.value)} placeholder="Viết một câu về bạn…" /><span className="profile-field-count">{bio.length}/80</span></label>
              <div className="profile-actions"><button type="button" onClick={() => { setAvatar(profile.avatar || ''); setName(profile.name); setBio(profile.bio || ''); setImageError(''); setEditing(false); }} disabled={imageLoading}>Hủy</button><button type="submit" className="primary" disabled={!connected || imageLoading}>Lưu hồ sơ</button></div>
            </form> : <>
              <div className="profile-name-row"><div><h3>{profile.name}</h3><span>Tham gia {joined}</span></div>{own && <button type="button" onClick={() => setEditing(true)}>Chỉnh sửa</button>}</div>
              <p className="profile-bio">{profile.bio || (own ? 'Thêm lời giới thiệu để bạn bè biết về bạn.' : 'Người chơi chưa viết lời giới thiệu.')}</p>
              <div className="profile-level"><div><span>Cấp {profile.level}</span><b>{Number(profile.xp || 0).toLocaleString('vi-VN')} XP</b></div><div className="profile-level-track"><i style={{ width: `${Math.min(100, Math.max(4, ((profile.xp || 0) - xpFloor) / Math.max(1, xpCeiling - xpFloor) * 100))}%` }} /></div></div>
              <div className="profile-stats-heading">DẤU ẤN NÔNG TRẠI</div><div className="profile-metrics">{metric('Đã trồng', profile.stats?.planted)}{metric('Thu hoạch', profile.stats?.harvested)}{metric('Đơn hàng', profile.stats?.orders)}{metric('Cá câu', profile.stats?.fish)}</div>
            </>}
          </div>
        </div>
        {!own && <footer className="profile-footer"><button type="button" className={friend ? '' : 'primary'} disabled={!connected || friend} onClick={onFriend}>{friend ? 'Đã thêm bạn' : 'Thêm bạn'}</button></footer>}
      </>}
    </section>
  </div>;
}
