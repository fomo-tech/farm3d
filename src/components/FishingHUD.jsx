import { useEffect, useRef, useState } from 'react';
import { FISHING_CONFIG, fishingCapacity, fishingInventoryCount } from '../../shared/fishingConfig.js';
import { fishResistance } from '../../shared/fishingSession.js';
import './FishingHUD.css';

export function FishingHUD({ fishing, connected, water, send, cast, serverOffset, caught, clearCaught }) {
  const [now,setNow]=useState(Date.now());
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
  useEffect(()=>{held.current=false;sent.current={key:'',at:0};},[pending?.id]);
  useEffect(()=>{
    const tick=setInterval(()=>setNow(Date.now()+serverOffset),100);
    const release=()=>{held.current=false;};
    addEventListener('blur',release); addEventListener('pointerup',release); addEventListener('pointercancel',release);
    return()=>{clearInterval(tick);removeEventListener('blur',release);removeEventListener('pointerup',release);removeEventListener('pointercancel',release);};
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
    return <section className="fish-result" role="dialog" aria-label="Cá vừa bắt"><span className="fish-result-art" style={{color:fish?.color}}>🐟</span><small>{caught.rarity} · {caught.zone}</small><h2>{fish?.name}</h2><b>{Number(caught.weight).toFixed(2)} kg</b><p>Đã vào thùng cá · giá trị {caught.value} xu</p><button onClick={clearCaught}>Câu tiếp</button></section>;
  }
  if(!pending && !water)return null;
  const fighting=pending?.phase==='fighting', biting=pending && !fighting && now>=pending.biteAt && now<=pending.expiresAt;
  const struggling=fighting&&fishResistance(pending,now);
  return <section className="fish-hud" aria-label="Câu cá">
    <header><b>🎣 {fighting?'Kéo cá':biting?'Cá cắn!':'Câu cá'}</b><small>{fishingInventoryCount(fishing)}/{fishingCapacity(fishing)} cá</small></header>
    {fighting ? <>
      <label>Lực căng dây <strong>{Math.round(pending.tension)}%</strong></label>
      <meter aria-label="Lực căng dây" min="0" max="100" low="20" high="80" optimum="45" value={pending.tension}/>
      <label>Kéo cá về <strong>{Math.round(pending.pull)}%</strong></label><progress aria-label="Tiến độ kéo cá" max="100" value={pending.pull}/>
      <p>{struggling?'Cá vùng vẫy — thả nút để giảm căng!':'Giữ nút kéo, giữ lực căng trong vùng an toàn.'}</p>
      <button className="fish-pull" aria-pressed={held.current} disabled={!connected} onBlur={()=>held.current=false} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);held.current=true;}} onPointerUp={()=>held.current=false} onPointerCancel={()=>held.current=false} onKeyDown={e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();e.stopPropagation();held.current=true;}}} onKeyUp={e=>{e.stopPropagation();held.current=false;}}>Giữ để kéo cá</button>
    </> : pending ? <><p>{biting?'Giật cần ngay trước khi cá bỏ mồi!':'Phao đã thả · chờ cá cắn…'}</p><button disabled={!connected||!biting} onClick={()=>{tone();send('fishing_reel',{sessionId:pending.id});}}>{biting?'Giật cần!':'Đợi phao rung'}</button></> : <><p>{FISHING_CONFIG.rods[fishing?.equippedRod]?.name || 'Mua và trang bị cần tại tiệm đồ câu'}</p><button disabled={!connected||!fishing?.equippedRod||fishingInventoryCount(fishing)>=fishingCapacity(fishing)} onClick={()=>{tone(440);cast();}}>Thả câu</button></>}
    {pending&&<button className="fish-cancel" disabled={!connected} onClick={()=>send('fishing_cancel',{sessionId:pending.id})}>Thu cần</button>}
    {!connected&&<p role="alert">Mất kết nối — không thể xác nhận thao tác.</p>}
  </section>;
}
