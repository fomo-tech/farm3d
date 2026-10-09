import { useEffect, useState } from 'react';
import { Icon3dFriends } from './icons3d/GameIcons3D.jsx';
import './PlayerProfileModal.css';
import './FriendsPanel.css';
export function FriendsPanel({friends=[],residents=[],playerId,connected,onClose,onProfile,onFriend}) {
  const [tab,setTab]=useState('friends'),[search,setSearch]=useState('');
  useEffect(()=>{const close=e=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[onClose]);
  const ids=new Set(friends.map(p=>p.playerId));
  const list=(tab==='friends'?friends:residents).filter(p=>p.playerId!==playerId&&p.name?.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));
  return <div className="profile-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="profile-card friends-card" role="dialog" aria-modal="true" aria-label="Bạn bè">
    <header className="profile-header"><Icon3dFriends size={42}/><div><small>KẾT NỐI CƯ DÂN</small><h2>Bạn bè · {friends.length}</h2></div><button className="profile-close" onClick={onClose} aria-label="Đóng bạn bè">×</button></header>
    <nav className="friends-tabs"><button aria-pressed={tab==='friends'} onClick={()=>setTab('friends')}>Bạn của tôi</button><button aria-pressed={tab==='discover'} onClick={()=>setTab('discover')}>Tìm cư dân</button></nav>
    <input className="friends-search" aria-label="Tìm theo tên" placeholder="Tìm theo tên…" value={search} onChange={e=>setSearch(e.target.value)}/>
    {!connected&&<p className="profile-message">Đang mất kết nối. Kết nối lại để cập nhật bạn bè.</p>}
    <div className="friends-list">{list.map(p=><article key={p.playerId}><span className="friends-avatar">{p.name?.slice(0,1)}</span><div><b>{p.name}</b><small>Cấp {p.progress?.level||1}</small></div><button disabled={!connected} onClick={()=>onProfile(p.playerId)}>Hồ sơ</button><button disabled={!connected} onClick={()=>onFriend(p.playerId,ids.has(p.playerId)?'remove_friend':'add_friend')}>{ids.has(p.playerId)?'Bỏ kết bạn':'Thêm bạn'}</button></article>)}{!list.length&&<p className="profile-message">{search?'Không có tên phù hợp.':tab==='friends'?'Chưa có bạn. Mở Tìm cư dân hoặc chạm một người chơi trong thế giới để thêm bạn.':'Chưa có cư dân để hiển thị.'}</p>}</div>
  </section></div>;
}
