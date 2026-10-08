import React,{useEffect,useRef,useState} from 'react';
import {HudIcon} from './icons3d/HudIcon.jsx';
import './LeaderboardModal.css';
const TABS=[['wealth','Độ giàu','coin'],['xp','Kinh nghiệm','seeds'],['level','Cấp độ','gem'],['home','Nhà đẹp','land']];
const score=(item,tab)=>Number(item?.progress?.[tab==='home'?'homeTier':tab==='wealth'?'coins':tab]||(tab==='xp'||tab==='wealth'?0:1));
const scoreText=(item,tab)=>tab==='wealth'?`${score(item,tab).toLocaleString('vi-VN')} Xu`:tab==='xp'?`${score(item,tab).toLocaleString('vi-VN')} XP`:tab==='level'?`Cấp ${score(item,tab)}`:`Nhà cấp ${score(item,tab)}`;
function Portrait({ player }) {
 const avatar = player?.progress?.profileAvatar || player?.avatar;
 const [failedAvatar,setFailedAvatar] = useState(null);
 const photo = avatar && failedAvatar !== avatar;
 return <img className={`ranking-portrait${photo?' ranking-user-photo':''}`} src={photo?avatar:'/assets/hud/farmer-avatar.webp'} alt="" draggable="false" onError={photo?()=>setFailedAvatar(avatar):undefined}/>;
}
export function LeaderboardModal({leaderboard=[],leaderboards,myRanks,myPlayer=null,onVisitFarm,onAddFriend,onClose}){
 const [tab,setTab]=useState('wealth'),root=useRef(null),close=useRef(onClose);close.current=onClose;
 useEffect(()=>{const previous=document.activeElement;root.current?.querySelector('button')?.focus();const key=e=>{if(document.querySelector('.game-confirm-overlay'))return;if(e.key==='Escape'){e.preventDefault();close.current();}if(e.key==='Tab'){const buttons=[...root.current.querySelectorAll('button:not(:disabled)')];const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus();};},[]);
 const list=leaderboards?.[tab]||[...leaderboard].sort((a,b)=>score(b,tab)-score(a,tab)||String(a.playerId).localeCompare(String(b.playerId)));
 const myIndex=list.findIndex(p=>p.playerId===myPlayer?.playerId),myRank=myRanks?.[tab]??(myIndex>=0?myIndex+1:null);
 const podium=list.slice(0,3).map((item,index)=>({item,rank:index+1})).sort((a,b)=>[2,1,3].indexOf(a.rank)-[2,1,3].indexOf(b.rank));
 return <div className="ranking-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}><section className="ranking-panel" ref={root} role="dialog" aria-modal="true" aria-labelledby="ranking-title">
 <header className="ranking-header"><span className="ranking-emblem"><HudIcon asset="coin" size={52}/></span><div><small>VINH DANH THỊ TRẤN</small><h2 id="ranking-title">Bảng xếp hạng</h2></div><button className="ranking-close" onClick={onClose} aria-label="Đóng bảng xếp hạng">×</button></header>
 <nav className="ranking-tabs" aria-label="Tiêu chí xếp hạng">{TABS.map(([id,label,icon])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}><HudIcon asset={icon} size={24}/>{label}</button>)}</nav>
 <div className="ranking-body">
 {list.length===0?<div className="ranking-empty"><HudIcon asset="seeds" size={64}/><b>Thị trấn đang chờ những ngôi sao mới</b><span>Chơi và tích luỹ kinh nghiệm để lên bảng.</span></div>:<>
 <div className="ranking-podium">{podium.map(({item,rank})=><button key={item.playerId} className={`ranking-winner winner-${rank}${item.playerId===myPlayer?.playerId?' is-me':''}`} onClick={()=>onVisitFarm?.(item.playerId)} disabled={!onVisitFarm} aria-label={`Hạng ${rank}, ${item.name}, ${scoreText(item,tab)}, xem hồ sơ`}><span className="ranking-medal">{rank}</span><Portrait player={item}/><b className="ranking-winner-name" title={item.name}>{item.name}</b><small>Cấp {item.progress?.level||1}</small><strong>{scoreText(item,tab)}</strong><span className="ranking-podium-step">{rank===1?'QUÁN QUÂN':`HẠNG ${rank}`}</span></button>)}</div>
 <div className="ranking-list-caption"><span>TOP {list.length} CƯ DÂN</span><span>{TABS.find(t=>t[0]===tab)[1]}</span></div>
 <div className="ranking-list">{list.slice(3).map((item,i)=><article key={item.playerId} className={`ranking-row${item.playerId===myPlayer?.playerId?' is-me':''}`}><span className="ranking-row-number">{i+4}</span><Portrait player={item}/><div className="ranking-row-name"><b>{item.name}{item.playerId===myPlayer?.playerId&&<small>Bạn</small>}</b><span>Cấp {item.progress?.level||1}</span></div><strong>{scoreText(item,tab)}</strong><div className="ranking-row-actions">{onVisitFarm&&<button onClick={()=>onVisitFarm(item.playerId)} aria-label={`Hồ sơ ${item.name}`} title="Xem hồ sơ"><HudIcon asset="hand" size={23}/></button>}{onAddFriend&&item.playerId!==myPlayer?.playerId&&<button onClick={()=>onAddFriend(item.playerId)} aria-label={`Kết bạn với ${item.name}`} title="Kết bạn"><HudIcon asset="chat" size={23}/></button>}</div></article>)}</div>
 </>}
 </div>
 {myPlayer&&<footer className="ranking-mine"><span className="ranking-my-rank">{myRank?`#${myRank}`:'—'}</span><Portrait player={myPlayer}/><div><small>THỨ HẠNG CỦA BẠN</small><b>{myPlayer.name||'Nông dân mới'}</b>{!myRank&&<span>Chưa có thứ hạng</span>}</div><strong>{scoreText(myPlayer,tab)}</strong></footer>}
 </section></div>;
}
