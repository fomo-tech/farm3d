import { useEffect, useRef, useState } from 'react';
import { FISHING_CONFIG, fishingCapacity, fishingInventoryCount } from '../../shared/fishingConfig.js';
import { fishResistance } from '../../shared/fishingSession.js';
import { Icon3dFishingRodBamboo } from './icons3d/GameIcons3D.jsx';
import './FishingHUD.css';

function VectorFish({ size = 42, color = '#38bdf8' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ verticalAlign: 'middle' }}>
      <path d="M6 24 C14 12, 32 14, 40 24 C32 34, 14 36, 6 24 Z" fill={color} stroke="#0f172a" strokeWidth="2.5" />
      <path d="M38 24 L46 16 L44 24 L46 32 Z" fill={color} stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="14" cy="22" r="2.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="15" cy="22" r="1.2" fill="#0f172a" />
      <path d="M22 17 C25 21, 25 27, 22 31" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function FishingHUD({ fishing, connected, water, send, cast, serverOffset, caught, clearCaught }) {
  const [now,setNow]=useState(()=>Date.now()+serverOffset);
  const [pressed,setPressed]=useState(false);
  const actionSent=useRef({key:'',at:0});
  const held=useRef(false), sent=useRef({key:'',at:0}), bite=useRef('');
  const audio=useRef(null);
  const tone=(frequency=660)=>{
    try{
      const Context=window.AudioContext||window.webkitAudioContext;
      if(!audio.current&&Context)audio.current=new Context();
      const ctx=audio.current;if(!ctx)return;
      ctx.resume().catch(()=>{});
      const oscillator=ctx.createOscillator(),gain=ctx.createGain();
      oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.07,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.16);
      oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start();oscillator.stop(ctx.currentTime+.18);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    }catch{/* Audio is optional on restricted browsers. */}
  };
  useEffect(()=>()=>{audio.current?.close().catch(()=>{});},[]);
  const pending=fishing?.pending;
  const hold = value => { held.current=value;setPressed(value); };
  const canCast=connected&&water&&fishing?.equippedRod&&!pending&&fishingInventoryCount(fishing)<fishingCapacity(fishing);
  const repeatCast=()=>{
    if(!canCast)return;
    const time=Date.now()+serverOffset;
    if(time-actionSent.current.at<1300)return;
    actionSent.current={key:'cast',at:time};
    clearCaught();tone(440);cast();
  };
  useEffect(()=>{held.current=false;setPressed(false);sent.current={key:'',at:0};actionSent.current={key:'',at:0};},[pending?.id,pending?.phase,connected]);
  const primary = () => {
    if(!connected)return;
    const time=Date.now()+serverOffset;
    if(caught){repeatCast();return;}
    if(pending?.phase==='fighting')return;
    if(pending && (time<pending.biteAt || time>pending.expiresAt))return;
    if(!pending && (!water || !fishing?.equippedRod || fishingInventoryCount(fishing)>=fishingCapacity(fishing)))return;
    const key=pending ? `hook:${pending.id}` : 'cast';
    if(actionSent.current.key===key && time-actionSent.current.at<1300)return;
    actionSent.current={key,at:time};tone(pending?660:440);
    if(pending)send('fishing_reel',{sessionId:pending.id});else cast();
  };
  useEffect(()=>{
    const down=event=>{
      if(event.code!=='KeyF'||event.altKey||event.ctrlKey||event.metaKey||event.target?.closest?.('input,textarea,select,[contenteditable="true"],[aria-modal="true"]'))return;
      if(!connected || (!water&&!pending&&!caught))return;
      event.preventDefault();if(event.repeat)return;
      if(pending?.phase==='fighting')hold(true);else primary();
    };
    const up=event=>{if(event.code==='KeyF')hold(false);};
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);};
  },[pending,connected,water,caught,fishing,serverOffset,cast,send,clearCaught]);
  useEffect(()=>{
    const tick=setInterval(()=>setNow(Date.now()+serverOffset),100);
    const release=()=>hold(false);
    const visibility=()=>{if(document.hidden)release();};
    addEventListener('blur',release); addEventListener('pointerup',release); addEventListener('pointercancel',release);
    document.addEventListener('visibilitychange',visibility);
    return()=>{clearInterval(tick);document.removeEventListener('visibilitychange',visibility);removeEventListener('blur',release);removeEventListener('pointerup',release);removeEventListener('pointercancel',release);};
  },[serverOffset]);
  useEffect(()=>{
    if(!pending || !connected)return;
    if(pending.phase!=='fighting' && now>=pending.biteAt && now<=pending.expiresAt && bite.current!==pending.id){
      bite.current=pending.id;navigator.vibrate?.([90,40,90]);if(audio.current)tone(880);
    }
    if(now>pending.expiresAt){
      const key=`cancel:${pending.id}`;
      if(sent.current.key!==key){sent.current={key,at:now};send('fishing_cancel',{sessionId:pending.id});}return;
    }
    if(pending.phase!=='fighting')return;
    const key=`${pending.id}:${pending.sequence}`;
    if(now-pending.lastPulseAt<400 || (sent.current.key===key && now-sent.current.at<1300))return;
    sent.current={key,at:now};send('fishing_pull',{sessionId:pending.id,sequence:pending.sequence+1,holding:held.current});
  },[now,pending,connected,send]);
  if(caught){
    const fish=FISHING_CONFIG.fish[caught.fishCaught];
    const rarity={common:'Thông thường',uncommon:'Ít gặp',rare:'Hiếm',epic:'Quý hiếm',legendary:'Huyền thoại'}[caught.rarity]||'Cá vừa bắt';
    return <section className="fish-result" role="dialog" aria-label="Cá vừa bắt"><span className="fish-result-art"><VectorFish size={80} color={fish?.color || '#38bdf8'} /></span><small>{rarity}</small><h2>{fish?.name}</h2><b>{Number(caught.weight).toFixed(2)} kg</b><p>Đã vào thùng cá · giá trị {caught.value} xu</p><button disabled={!canCast} onClick={repeatCast}>Thả câu tiếp · F</button>{!canCast&&<p role="status">{!connected?'Đang chờ kết nối':!water?'Quay lại bờ nước để câu tiếp':!fishing?.equippedRod?'Trang bị cần câu trước':'Thùng cá đầy — hãy bán cá'}</p>}<button className="fish-cancel" onClick={clearCaught}>Cất cá</button></section>;
  }
  if(!pending && !water)return null;
  const fighting=pending?.phase==='fighting', biting=pending && !fighting && now>=pending.biteAt && now<=pending.expiresAt;
  const struggling=fighting&&fishResistance(pending,now);
  return <section className={`fish-hud fish-state-${fighting?'fighting':biting?'bite':pending?'waiting':'ready'}`} aria-label="Câu cá">
    <header><b style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Icon3dFishingRodBamboo size={18} /> {fighting?'Kéo cá':biting?'Cá cắn!':'Câu cá'}</b><small>{fishingInventoryCount(fishing)}/{fishingCapacity(fishing)} cá</small></header>
    {fighting ? <>
      <label>Lực căng dây <strong>{Math.round(pending.tension)}%</strong></label>
      <div className="fish-tension-track" role="meter" aria-label="Lực căng dây" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pending.tension)}><span className="fish-tension-safe"/><i style={{left:`${Math.max(0,Math.min(100,pending.tension))}%`}}/></div>
      <div className="fish-tension-labels"><span>Chùng</span><span>An toàn</span><span>Đứt dây</span></div>
      <label>Kéo cá về <strong>{Math.round(pending.pull)}%</strong></label><progress aria-label="Tiến độ kéo cá" max="100" value={pending.pull}/>
      <p>{struggling?'Cá vùng vẫy — thả nút để giảm căng!':'Giữ nút kéo, giữ lực căng trong vùng an toàn.'}</p>
      <button className="fish-pull" aria-pressed={pressed} disabled={!connected} onBlur={()=>hold(false)} onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);hold(true);}} onPointerUp={()=>hold(false)} onPointerCancel={()=>hold(false)} onLostPointerCapture={()=>hold(false)} onKeyDown={e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();e.stopPropagation();hold(true);}}} onKeyUp={e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();e.stopPropagation();hold(false);}}}>{pressed?'Đang kéo… · thả để hạ lực':'Giữ kéo cá · F'}</button>
    </> : pending ? <><p role="status">{biting?'Cá cắn! Bấm ngay để giật cần.':'Chờ phao chìm — chưa bấm kéo.'}</p>{biting&&<progress aria-label="Thời gian giật cần" max={pending.expiresAt-pending.biteAt} value={Math.max(0,pending.expiresAt-now)}/>}<button className={biting?'fish-bite-action':''} disabled={!connected||!biting} onClick={primary}>{biting?'! GIẬT CẦN · F':'Chờ cá cắn…'}</button></> : <><p>{FISHING_CONFIG.rods[fishing?.equippedRod]?.name || 'Mua và trang bị cần tại tiệm đồ câu'}</p><button disabled={!connected||!fishing?.equippedRod||fishingInventoryCount(fishing)>=fishingCapacity(fishing)} onClick={primary}>Thả câu · F</button>{fishingInventoryCount(fishing)>=fishingCapacity(fishing)&&<p role="status">Thùng đầy — bán cá trước khi câu tiếp.</p>}</>}
    {pending&&<button className="fish-cancel" disabled={!connected} onClick={()=>send('fishing_cancel',{sessionId:pending.id})}>Thu cần</button>}
    {!connected&&<p role="alert">Mất kết nối — không thể xác nhận thao tác.</p>}
  </section>;
}
