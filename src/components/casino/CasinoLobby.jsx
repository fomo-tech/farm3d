import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CASINO_CONFIG, CASINO_GAMES } from '../../../shared/casino/casinoConfig.js';
import { Die, PlayingCard, SymbolArt } from './CasinoArt.jsx';
import { HudIcon } from '../icons3d/HudIcon.jsx';
import './FarmLounge.css';
const META = {
  'tai-xiu':{name:'Tài Xỉu',tag:'Ba xúc xắc',description:'Chọn Tài hoặc Xỉu, theo dõi tổng điểm khi mở kết quả.',theme:'coral'},
  'bau-cua':{name:'Bầu Cua',tag:'Sáu linh vật',description:'Bầu, cua, tôm, cá, gà, nai — chọn cửa trước khi mở kết quả.',theme:'sage'},
  'bai-cao':{name:'Bài Cào',tag:'So nút ba lá',description:'Ba lá so nút với nhà cái hệ thống.',theme:'sand'},
  'tien-len':{name:'Tiến Lên',tag:'Miền Nam · 4 người',description:'Xếp 13 lá, tìm nước đánh và thi đấu tính điểm.',theme:'teal'},
};
function GameArt({ game }) {
  return <div className={`farm-lounge-art ${game}`} aria-hidden="true">{game==='tai-xiu'?<><Die value={5}/><Die value={2}/></>:game==='bau-cua'?<><SymbolArt symbol="bau"/><SymbolArt symbol="cua"/></>:<><PlayingCard id={game==='bai-cao'?44:0} small/><PlayingCard id={47} small/><PlayingCard id={game==='bai-cao'?43:51} small/></>}</div>;
}
export function CasinoLobby({coins=0,rooms=[],connected=true,inside=true,sound=false,onToggleSound,onExit,onJoin,onCreateRoom,onQuickPlay,onSelectGame,defaultGame=null,quickPlaying=false,message=''}) {
  const [selected,setSelected]=useState(META[defaultGame]?defaultGame:'tai-xiu');
  const [view,setView]=useState('intro');
  const [createOpen,setCreateOpen]=useState(false),[joinRoom,setJoinRoom]=useState(null);
  const [name,setName]=useState(''),[stake,setStake]=useState(CASINO_CONFIG.chips[0]),[password,setPassword]=useState(''),[joinPassword,setJoinPassword]=useState('');
  const panel=useRef(null),sub=useRef(null),exit=useRef(onExit);exit.current=onExit;
  const enabled=connected&&inside&&!quickPlaying;
  const filtered=useMemo(()=>rooms.filter(room=>room.game===selected),[rooms,selected]);
  const meta=META[selected], definition=CASINO_GAMES[selected];
  useEffect(()=>{if(META[defaultGame])setSelected(defaultGame);},[defaultGame]);
  useEffect(()=>{
    const previous=document.activeElement;
    panel.current?.querySelector('button')?.focus();
    return ()=>{if(previous?.isConnected)previous.focus();};
  },[]);
  useEffect(()=>{
    if(createOpen||joinRoom)sub.current?.querySelector('input,button')?.focus();
    const keys=event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(joinRoom)setJoinRoom(null);else if(createOpen)setCreateOpen(false);else exit.current?.();}
      if(event.key!=='Tab')return;
      const root=(createOpen||joinRoom)?sub.current:panel.current;
      const controls=[...root.querySelectorAll('button:not(:disabled),input,select')].filter(el=>el.getClientRects().length);
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',keys,true);
    return ()=>document.removeEventListener('keydown',keys,true);
  },[createOpen,joinRoom]);
  const select=key=>{setSelected(key);setView('intro');onSelectGame?.(key);};
  const join=room=>{if(!enabled||!onJoin)return;if(room.private){setJoinRoom(room);setJoinPassword('');}else onJoin(room.id);};
  const create=event=>{event.preventDefault();if(!enabled||!onCreateRoom||!CASINO_CONFIG.chips.includes(Number(stake)))return;onCreateRoom({game:selected,name:name.trim()||definition.name,stake:Number(stake),password:password.trim()});setCreateOpen(false);setPassword('');setName('');};
  return <div className="farm-lounge-overlay"><section className="farm-lounge" ref={panel} role="dialog" aria-modal="true" aria-labelledby="farm-lounge-title">
    <header className="farm-lounge-header"><span className="farm-lounge-emblem"><HudIcon asset="basket" size={45}/></span><div><small>GẶP GỠ · GIAO LƯU · GIẢI TRÍ</small><h2 id="farm-lounge-title">Hội quán dân gian</h2></div><div className="farm-lounge-wallet"><HudIcon asset="coin" size={28}/><span><small>Xu của bạn</small><b>{Number(coins).toLocaleString('vi-VN')}</b></span></div><button className="farm-lounge-audio" role="switch" aria-checked={sound} aria-label="Âm thanh hội quán" onClick={onToggleSound}>{sound?'Âm bật':'Âm tắt'}</button><button className="farm-lounge-close" aria-label="Đóng hội quán" onClick={onExit}>×</button></header>
    <div className="farm-lounge-body"><div className="farm-lounge-games"><div className="farm-lounge-section-title"><h3>Chọn trò chơi</h3><span>4 trò chơi</span></div><div className="farm-lounge-game-grid">{Object.entries(META).map(([key,item])=><button key={key} className={item.theme} aria-pressed={selected===key} onClick={()=>select(key)}><span className="farm-lounge-game-count">{rooms.filter(room=>room.game===key).length} bàn</span><GameArt game={key}/><b>{item.name}</b><small>{item.tag}</small><span className="farm-lounge-selected" aria-hidden="true">{selected===key?'✓':''}</span></button>)}</div><div className="farm-lounge-tip"><HudIcon asset="quest" size={32}/><p>Chọn một trò chơi để xem luật và tìm bàn. Tiến Lên tính điểm, không cược xu.</p></div></div>
    <div className="farm-lounge-detail"><div className={`farm-lounge-spotlight ${meta.theme}`}><GameArt game={selected}/><div><small>{meta.tag}</small><h3>{meta.name}</h3><p>{meta.description}</p></div></div>
      <nav className="farm-lounge-tabs" aria-label="Thông tin trò chơi"><button aria-pressed={view==='intro'} onClick={()=>setView('intro')}>Cách chơi</button><button aria-pressed={view==='rooms'} onClick={()=>setView('rooms')}>Danh sách bàn <small>{filtered.length}</small></button></nav>
      {view==='intro'?<div className="farm-lounge-rules"><small>LUẬT TRÒ CHƠI</small><p>{definition.rules}</p><div><span>Tối đa <b>{definition.seats}</b> người</span><span>Tối thiểu <b>{definition.minPlayers}</b> người</span></div></div>:<div className="farm-lounge-rooms">{filtered.length?filtered.map(room=><article key={room.id}><span className="farm-lounge-room-art"><HudIcon asset="chat" size={29}/></span><div><h4>{room.name}</h4><p>{room.occupied??0}/{room.seats??definition.seats} người · {selected==='tien-len'?'Tính điểm':`${room.stake} xu`}</p><small>{room.private?'Có mật khẩu':'Bàn công khai'}</small></div><button disabled={!enabled||!onJoin} onClick={()=>join(room)}>{(room.occupied??0)>=(room.seats??definition.seats)?'Xem bàn':'Vào bàn'}</button></article>):<div className="farm-lounge-empty"><HudIcon asset="chat" size={52}/><h4>Chưa có bàn cho trò này</h4><p>Tạo bàn riêng hoặc chọn Vào bàn nhanh để bắt đầu.</p></div>}</div>}
      <div className="farm-lounge-actions"><button className="farm-lounge-primary" disabled={!enabled||!onQuickPlay} onClick={()=>onQuickPlay(selected)}>{quickPlaying?'Đang vào bàn…':'Vào bàn nhanh'}</button><button className="farm-lounge-secondary" disabled={!enabled||!onCreateRoom} onClick={()=>{setCreateOpen(true);setPassword('');}}>Tạo bàn riêng</button></div><p className="farm-lounge-status" role="status">{message||(!connected?'Đang kết nối lại…':!inside?'Vào bên trong hội quán để tham gia bàn.':quickPlaying?'Đang tìm chỗ cho bạn…':'Chọn bàn để chơi cùng cư dân thị trấn.')}</p>
    </div></div><footer className="farm-lounge-footer"><span><HudIcon asset="map" size={22}/> Có thể dạo chơi và ghé các bàn trong sảnh 3D</span><button onClick={onExit}>Dạo chơi trong sảnh</button></footer>
    {(createOpen||joinRoom)&&<div className="farm-lounge-sub-overlay" onClick={event=>{if(event.target===event.currentTarget){setCreateOpen(false);setJoinRoom(null);}}}><section className="farm-lounge-sub" ref={sub} role="dialog" aria-modal="true" aria-labelledby="farm-lounge-sub-title"><header><h3 id="farm-lounge-sub-title">{createOpen?'Tạo bàn riêng':'Vào bàn riêng'}</h3><button aria-label="Đóng hộp thoại bàn" onClick={()=>{setCreateOpen(false);setJoinRoom(null);}}>×</button></header>
      {createOpen?<form onSubmit={create}><p>{meta.name} · {selected==='tien-len'?'Chơi tính điểm':'Chọn mức cược được hỗ trợ'}</p><label>Tên bàn<input value={name} onChange={event=>setName(event.target.value)} placeholder={`Bàn ${meta.name}`} maxLength={30}/></label>{selected!=='tien-len'&&<label>Mức cược bàn<select value={stake} onChange={event=>setStake(Number(event.target.value))}>{CASINO_CONFIG.chips.map(value=><option key={value} value={value}>{value} xu</option>)}</select></label>}<label>Mật khẩu (không bắt buộc)<input type="password" value={password} onChange={event=>setPassword(event.target.value)} placeholder="Để trống cho bàn công khai" maxLength={64} autoComplete="new-password"/></label><button className="farm-lounge-primary" disabled={!enabled}>Tạo & vào bàn</button></form>:<form onSubmit={event=>{event.preventDefault();if(!enabled||!joinPassword.trim())return;onJoin?.(joinRoom.id,joinPassword.trim());setJoinRoom(null);setJoinPassword('');}}><p>Bàn “{joinRoom.name}” yêu cầu mật khẩu.</p><label>Mật khẩu bàn<input type="password" value={joinPassword} onChange={event=>setJoinPassword(event.target.value)} maxLength={64} autoComplete="off"/></label><button className="farm-lounge-primary" disabled={!enabled||!joinPassword.trim()}>Vào bàn</button></form>}
    </section></div>}
  </section></div>;
}
