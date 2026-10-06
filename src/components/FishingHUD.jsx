import { useEffect, useRef, useState } from 'react';
import { FISHING_CONFIG, fishingCapacity, fishingInventoryCount } from '../../shared/fishingConfig.js';
import { fishResistance } from '../../shared/fishingSession.js';
import { Icon3dFishingRodBamboo } from './icons3d/GameIcons3D.jsx';
import './FishingHUD.css';

function VectorFish({ size = 42, color = '#38bdf8', fishId = 'carp' }) {
  const longBody=['river_catfish','sea_mackerel'].includes(fishId);
  const roundBody=['golden_carp','sea_snapper'].includes(fishId);
  const striped=['perch','sea_mackerel','river_barb'].includes(fishId);
  return (
    <svg width={size} height={size} viewBox="0 0 100 72" fill="none" role="img" aria-label={FISHING_CONFIG.fish[fishId]?.name || 'Cá'}>
      <path d="M73 37 L96 16 Q87 36 96 57 Z" fill={color} stroke="#264252" strokeWidth="3" strokeLinejoin="round" />
      <path d={roundBody?'M12 36 C17 8 62 2 78 35 C64 69 21 65 12 36 Z':longBody?'M7 36 C24 22 63 23 79 35 C61 49 22 50 7 36 Z':'M9 36 C19 17 60 14 79 35 C62 56 21 56 9 36 Z'} fill={color} stroke="#264252" strokeWidth="3" />
      <path d="M21 43 Q45 55 70 40" stroke="#fff5d9" strokeWidth="5" opacity=".75" strokeLinecap="round" />
      <path d="M38 23 L51 10 L58 23" fill={color} stroke="#264252" strokeWidth="2.5" strokeLinejoin="round" />
      {striped&&[43,52,61].map(x=><path key={x} d={`M${x} 25 Q${x-6} 34 ${x} 44`} stroke="#284a55" strokeWidth="3" opacity=".55" />)}
      <path d="M30 33 Q34 37 30 41" stroke="#264252" strokeWidth="2" opacity=".65" />
      <circle cx="21" cy="32" r="5" fill="white" /><circle cx="20" cy="32" r="2.4" fill="#203b4c" />
      {fishId==='river_catfish'&&<><path d="M14 40 Q1 45 2 52 M18 41 Q13 55 22 61" stroke="#264252" strokeWidth="2" strokeLinecap="round" /></>}
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
    return <section className="fish-result" role="dialog" aria-label="Cá vừa bắt"><span className="fish-result-art"><VectorFish size={100} color={fish?.color || '#38bdf8'} fishId={caught.fishCaught} /></span><small>{rarity}</small><h2>{fish?.name}</h2><b>{Number(caught.weight).toFixed(2)} kg</b><p>Nhân vật đang cầm cá · đã vào thùng · giá trị {caught.value} xu</p><button disabled={!canCast} onClick={repeatCast}>Thả câu tiếp · F</button>{!canCast&&<p role="status">{!connected?'Đang chờ kết nối':!water?'Quay lại bờ nước để câu tiếp':!fishing?.equippedRod?'Trang bị cần câu trước':'Thùng cá đầy — hãy bán cá'}</p>}<button className="fish-cancel" onClick={clearCaught}>Cất cá</button></section>;
  }
  if(!pending && !water)return null;
  const fighting=pending?.phase==='fighting', biting=pending && !fighting && now>=pending.biteAt && now<=pending.expiresAt;
  const struggling=fighting&&fishResistance(pending,now);
  const tension=Math.max(0,Math.min(100,Number(pending?.tension)||0));
  const pull=Math.max(0,Math.min(100,Number(pending?.pull)||0));
  const remaining=biting ? Math.max(0,(pending.expiresAt-now)/(pending.expiresAt-pending.biteAt)*100) : 0;
  const title=fighting?'KÉO CÁ':biting?'CÁ ĐÃ CẮN CÂU':pending?'CHỜ CÁ CẮN':'SẴN SÀNG CÂU';
  return <section className={`fish-hud fish-state-${fighting?'fighting':biting?'bite':pending?'waiting':'ready'}`} aria-label="Câu cá">
    <header><span className="fish-hud-icon"><Icon3dFishingRodBamboo size={26} /></span><span className="fish-hud-heading"><b>{title}</b><small>{fighting?'Giữ khi dây êm · thả khi cá vùng':biting?'Giật cần trước khi cá bơi đi':pending?'Nhìn phao · nghe tín hiệu':'Một nút để thả câu'}</small></span><span className="fish-hud-bag">{fishingInventoryCount(fishing)}/{fishingCapacity(fishing)}</span></header>
    {fighting ? <>
      <div className="fish-hud-readout"><span>Đã kéo <b>{Math.round(pull)}%</b></span><div className="fish-progress"><i style={{width:`${pull}%`}}/></div></div>
      <div className="fish-hud-readout"><span>Lực dây <b>{Math.round(tension)}%</b></span><div className="fish-tension-track" role="meter" aria-label="Lực căng dây" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(tension)}><span className="fish-tension-safe"/><i style={{left:`${tension}%`}}/></div></div>
      <p className={`fish-hud-cue ${struggling?'fish-hud-warning':''}`} role="status">{struggling?'Cá vùng mạnh! Thả nút':'Dây êm — giữ nút để kéo'}</p>
      <button className="fish-main-action fish-pull" aria-pressed={pressed} disabled={!connected} onBlur={()=>hold(false)} onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);hold(true);}} onPointerUp={()=>hold(false)} onPointerCancel={()=>hold(false)} onLostPointerCapture={()=>hold(false)} onKeyDown={e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();e.stopPropagation();hold(true);}}} onKeyUp={e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();e.stopPropagation();hold(false);}}}>{pressed?'THẢ ĐỂ GIẢM LỰC':'GIỮ ĐỂ KÉO · F'}</button>
    </> : pending ? <><div className={`fish-bobber ${biting?'fish-bobber-bite':''}`} aria-hidden="true"><span/><i/></div>{biting&&<div className="fish-bite-time" role="progressbar" aria-label="Thời gian giật cần" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(remaining)}><i style={{width:`${remaining}%`}}/></div>}<button className={`fish-main-action ${biting?'fish-bite-action':''}`} disabled={!connected||!biting} onClick={primary}>{biting?'GIẬT CẦN · F':'ĐANG CHỜ PHAO CHÌM'}</button></> : <><p className="fish-rod-name">{FISHING_CONFIG.rods[fishing?.equippedRod]?.name || 'Cần mua và trang bị cần câu'}</p><button className="fish-main-action" disabled={!connected||!fishing?.equippedRod||fishingInventoryCount(fishing)>=fishingCapacity(fishing)} onClick={primary}>THẢ CÂU · F</button>{fishingInventoryCount(fishing)>=fishingCapacity(fishing)&&<p role="status">Thùng cá đầy — hãy bán cá trước.</p>}</>}
    {pending&&<button className="fish-cancel" disabled={!connected} onClick={()=>send('fishing_cancel',{sessionId:pending.id})}>Thu cần</button>}
    {!connected&&<p role="alert">Mất kết nối — không thể xác nhận thao tác.</p>}
  </section>;
}
