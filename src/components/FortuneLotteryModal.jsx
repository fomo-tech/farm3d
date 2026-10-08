import React,{useEffect,useState,useRef} from 'react';
import {LOTTERY_CONFIG} from '../../shared/lotteryConfig.js';
import {HudIcon} from './icons3d/HudIcon.jsx';
import './FortuneLotteryModal.css';
export function FortuneLotteryModal({state,coins,connected,pending,onBuy,onClaim,onRefresh,onClose}){
 const panel=useRef(null),close=useRef(onClose),refresh=useRef(onRefresh);close.current=onClose;refresh.current=onRefresh;
 const [tab,setTab]=useState('buy'),[number,setNumber]=useState(''),[tick,setTick]=useState(Date.now());
 useEffect(()=>{
  const previous=document.activeElement;panel.current?.querySelector('button')?.focus();
  const timer=setInterval(()=>setTick(Date.now()),1000);
  const key=e=>{if(document.querySelector('.game-confirm-overlay'))return;if(e.key==='Escape'){e.preventDefault();close.current();}if(e.key==='Tab'){const items=[...panel.current.querySelectorAll('button:not(:disabled),input')];const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
  document.addEventListener('keydown',key);return()=>{clearInterval(timer);document.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus();};
 },[]);
 useEffect(()=>{const timer=setInterval(()=>refresh.current?.(),15000);return()=>clearInterval(timer);},[]);
 const now=state?state.serverNow+(tick-(state.receivedAt||tick)):tick;
 const left=state?Math.max(0,state.drawAt-now):0;
 const countdown=[Math.floor(left/3600000),Math.floor(left/60000)%60,Math.floor(left/1000)%60].map(n=>String(n).padStart(2,'0')).join(':');
 const tickets=state?.tickets||[],used=tickets.filter(t=>t.day===state?.saleDay).length;
 const rewards=tickets.filter(t=>t.prize>0&&!t.claimed).length;
 return <div className="fortune-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}><section ref={panel} className="fortune-panel" role="dialog" aria-modal="true" aria-labelledby="fortune-title">
 <header><div className="fortune-emblem"><HudIcon asset="coin" size={52}/></div><div><small>QUẢNG TRƯỜNG THỊ TRẤN</small><h2 id="fortune-title">Thần Tài</h2></div><button className="fortune-close" onClick={onClose} aria-label="Đóng quầy vé">×</button></header>
 <nav aria-label="Vé may mắn">{[['buy','Mua vé'],['tickets','Vé của tôi'],['results','Kết quả']].map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}{id==='tickets'&&rewards>0&&<b className="fortune-badge">{rewards}</b>}</button>)}</nav>
 <div className="fortune-body">{!state?<p className="fortune-empty">{connected?'Đang lấy kỳ quay…':'Chưa có kết nối'}</p>:<>
 {tab==='buy'&&<><div className="fortune-round"><span>Kỳ {state.saleDay.split('-').reverse().join('/')}</span><b>20:00 · Giờ Việt Nam</b><strong>{countdown}</strong></div><div className="fortune-ticket"><small>VÉ MAY MẮN</small><div className="fortune-ticket-number">{number.padEnd(6,'·').split('').map((digit,i)=><b key={i}>{digit}</b>)}</div><label>Chọn 6 số<input inputMode="numeric" maxLength={6} value={number} placeholder="000000" aria-label="Sáu chữ số trên vé" onChange={e=>setNumber(e.target.value.replace(/\D/g,''))}/></label><span>Để trống để Thần Tài chọn số ngẫu nhiên</span></div><div className="fortune-purchase"><span><HudIcon asset="coin" size={24}/><b>{coins.toLocaleString('vi-VN')}</b><small>xu đang có</small></span><button disabled={!connected||pending||coins<100||(used>=5||state.purchasedToday>=5)||now>=state.closesAt||(number.length>0&&number.length!==6)} onClick={()=>onBuy(number||null)}>{pending?'Đang mua…':'Mua vé · 100 xu'}</button></div><p className="fortune-limit">{state.purchasedToday>=5?'Hôm nay đã mua đủ 5 vé':`${used}/5 vé kỳ này`} · Đóng bán lúc 19:55</p><div className="fortune-prizes">{LOTTERY_CONFIG.prizes.map(p=><div key={p.digits}><small>{p.label}</small><b>{p.coins.toLocaleString('vi-VN')} xu</b></div>)}</div></>}
 {tab==='tickets'&&<div className="fortune-ticket-list">{tickets.length===0?<p className="fortune-empty">Bạn chưa có vé. Ghé mục Mua vé để chọn số.</p>:[...tickets].reverse().map(t=><article key={t.id}><div><small>Kỳ {t.day}</small><b>{t.number}</b></div><span>{t.claimed?'Đã nhận thưởng':t.prize===null?'Chờ quay':t.prize===0?'Chưa may mắn':`+${t.prize.toLocaleString('vi-VN')} xu`}</span>{t.prize>0&&!t.claimed&&<button disabled={pending||!connected} onClick={()=>onClaim(t.id)}>Nhận thưởng</button>}</article>)}</div>}
 {tab==='results'&&<div className="fortune-results">{state.results.map(r=><article key={r.day}><small>Kỳ {r.day} · 20:00</small><strong>{r.winner}</strong><span>Trùng số cuối để nhận giải cao nhất</span></article>)}<p className="fortune-limit">Cả thị trấn cùng chờ số may mắn lúc 20:00 mỗi ngày.</p></div>}
 </>}</div><footer>Chỉ dùng xu trong game · Không đổi thành tiền thật</footer>
 </section></div>;
}
