import { useEffect, useState } from 'react';
import { ArrivalAvatar } from './ArrivalAvatar.jsx';
import './PlayerProfileModal.css';

const metric = (label, value) => <div className="profile-metric" key={label}><strong>{Number(value || 0).toLocaleString('vi-VN')}</strong><span>{label}</span></div>;

export function PlayerProfileModal({ profile, loading, own, friend, connected, onClose, onSave, onFriend }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  useEffect(() => { setName(profile?.name || ''); setBio(profile?.bio || ''); setEditing(false); }, [profile?.playerId, profile?.name, profile?.bio]);
  useEffect(() => {
    const keydown = event => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [onClose]);
  const joined = profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('vi-VN') : '—';
  const xpFloor = 80 * Math.max(0, (profile?.level || 1) - 1) ** 2;
  const xpCeiling = 80 * (profile?.level || 1) ** 2;
  return <div className="profile-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="profile-card" role="dialog" aria-modal="true" aria-label="Hồ sơ người chơi">
      <header className="profile-header"><div><small>THÔNG TIN CƯ DÂN</small><h2>Hồ sơ người chơi</h2></div><button type="button" className="profile-close" onClick={onClose} aria-label="Đóng hồ sơ">×</button></header>
      {loading && connected ? <p className="profile-message">Đang lấy hồ sơ từ máy chủ…</p> : !profile ? <p className="profile-message">{connected ? 'Không tìm thấy hồ sơ người chơi.' : 'Chưa kết nối máy chủ. Hãy thử lại sau.'}</p> : <>
        <div className="profile-body">
          <div className="profile-avatar"><ArrivalAvatar outfit={profile.outfit} color="#f8fafc" /><span>CẤP {profile.level}</span></div>
          <div className="profile-info">
            {editing ? <form onSubmit={event => { event.preventDefault(); onSave({ name: name.trim(), bio: bio.trim() }); }}>
              <label>Tên nhân vật<input maxLength={18} minLength={3} value={name} onChange={event => setName(event.target.value)} required /></label>
              <label>Giới thiệu<textarea maxLength={80} rows={2} value={bio} onChange={event => setBio(event.target.value)} placeholder="Viết một câu về bạn…" /></label>
              <div className="profile-actions"><button type="button" onClick={() => setEditing(false)}>Hủy</button><button type="submit" className="primary" disabled={!connected}>Lưu hồ sơ</button></div>
            </form> : <>
              <div className="profile-name-row"><div><h3>{profile.name}</h3><span>Tham gia {joined}</span></div>{own && <button type="button" onClick={() => setEditing(true)}>Chỉnh sửa</button>}</div>
              <p className="profile-bio">{profile.bio || (own ? 'Thêm lời giới thiệu để bạn bè biết về bạn.' : 'Người chơi chưa viết lời giới thiệu.')}</p>
              <div className="profile-level"><div><span>Cấp {profile.level}</span><b>{Number(profile.xp || 0).toLocaleString('vi-VN')} XP</b></div><div className="profile-level-track"><i style={{ width: `${Math.min(100, Math.max(4, ((profile.xp || 0) - xpFloor) / Math.max(1, xpCeiling - xpFloor) * 100))}%` }} /></div></div>
              <div className="profile-metrics">{metric('Đã trồng', profile.stats?.planted)}{metric('Thu hoạch', profile.stats?.harvested)}{metric('Đơn hàng', profile.stats?.orders)}{metric('Cá câu', profile.stats?.fish)}</div>
            </>}
          </div>
        </div>
        {!own && <footer className="profile-footer"><button type="button" className={friend ? '' : 'primary'} disabled={!connected || friend} onClick={onFriend}>{friend ? 'Đã thêm bạn' : 'Thêm bạn'}</button></footer>}
      </>}
    </section>
  </div>;
}
