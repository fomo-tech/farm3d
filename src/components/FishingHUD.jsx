import { InventoryItemArt } from './InventoryItemArt.jsx';
import {fishingNibbleState} from '../../shared/fishingConditions.js';
import {FishingDensityBadge} from './FishingConditions.jsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FISHING_CONFIG, fishingCapacity, fishingInventoryCount } from '../../shared/fishingConfig.js';
import { fishResistance, fishingFightState } from '../../shared/fishingSession.js';
import './FishingHUD.css';
import {HudIcon} from './icons3d/HudIcon.jsx';
import {useInventoryMeshArt} from './useInventoryMeshArt.js';

export function FishingHUD({ conditions, fishing, connected, water, send, cast, serverOffset = 0, caught, clearCaught }) {
  const [now,setNow]=useState(()=>Date.now()+serverOffset);
  const [pressed,setPressed]=useState(false);
  const [aim,setAim]=useState(0),[charging,setCharging]=useState(false);
  const chargeStart=useRef(null);
  const resetCharge=()=>{chargeStart.current=null;setCharging(false);};
  const actionSent=useRef({key:'',at:0});
  const held=useRef(false), sent=useRef({key:'',at:0}), bite=useRef('');
  const audio=useRef(null),warningCue=useRef('');
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
  const fishItems=useMemo(()=>caught?[{id:`fish:${caught.fishCaught}:${caught.weight}`,itemId:caught.fishCaught,caughtWeight:caught.weight,kind:'fish',name:FISHING_CONFIG.fish[caught.fishCaught]?.name}]:[],[caught?.fishCaught,caught?.weight]);
  const fishImages=useInventoryMeshArt(Boolean(caught),'fish',fishItems);
  const catchImage=fishImages[`fish:${caught?.fishCaught}:${caught?.weight}`];
  const hold = value => { held.current=value;setPressed(value); };
  const canCast=connected&&water&&fishing?.equippedRod&&!pending&&fishingInventoryCount(fishing)<fishingCapacity(fishing);
  const repeatCast=()=>{
    if(!canCast)return;
    const time=Date.now()+serverOffset;
    if(time-actionSent.current.at<1300)return;
    actionSent.current={key:'cast',at:time};
    clearCaught();tone(440);cast({power:.75,aim});
  };
  useEffect(()=>{resetCharge();held.current=false;setPressed(false);sent.current={key:'',at:0};actionSent.current={key:'',at:0};},[pending?.id,pending?.phase,connected]);
  const primary = (power = .75) => {
    if(!connected)return;
    const time=Date.now()+serverOffset;
    if(caught){repeatCast();return;}
    if(pending?.phase==='fighting')return;
    if(pending && (time<pending.biteAt || time>pending.expiresAt))return;
    if(!pending && (!water || !fishing?.equippedRod || fishingInventoryCount(fishing)>=fishingCapacity(fishing)))return;
    const key=pending ? `hook:${pending.id}` : 'cast';
    if(actionSent.current.key===key && time-actionSent.current.at<1300)return;
    actionSent.current={key,at:time};tone(pending?660:440);
    if(pending)send('fishing_reel',{sessionId:pending.id});else cast({power:typeof power==='number'?power:.75,aim});
  };
  const startCharge=()=>{if(!canCast||caught||chargeStart.current!==null)return;chargeStart.current=Date.now()+serverOffset;setNow(Date.now()+serverOffset);setCharging(true);};
  const finishCharge=()=>{if(chargeStart.current===null)return;const elapsed=Date.now()+serverOffset-chargeStart.current;const power=elapsed<180?.75:Math.min(1,.3+elapsed/1400*.7);resetCharge();primary(power);};
  useEffect(()=>{
    const down=event=>{
      if(event.code!=='KeyF'||event.altKey||event.ctrlKey||event.metaKey||event.target?.closest?.('input,textarea,select,[contenteditable="true"],[aria-modal="true"]'))return;
      if(!connected || (!water&&!pending&&!caught))return;
      event.preventDefault();if(event.repeat)return;
      if(pending?.phase==='fighting')hold(true);else if(!pending&&!caught)startCharge();else primary();
    };
    const up=event=>{if(event.code==='KeyF'){finishCharge();hold(false);}};
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);};
  },[pending,connected,water,caught,fishing,serverOffset,cast,send,clearCaught,aim]);
  useEffect(()=>{
    const tick=setInterval(()=>setNow(Date.now()+serverOffset),100);
    const release=()=>{hold(false);resetCharge();};
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
  useEffect(()=>{
    if(!pending||pending.phase!=='fighting'||!connected)return;
    const motion=fishingFightState(pending,now),profile=pending.fightProfile;
    if(motion.phase!=='warning'||!profile)return;
    const cycle=profile.restMs+profile.warningMs+profile.rushMs+profile.cruiseMs;
    const key=`${pending.id}:${Math.floor((now-pending.hookedAt)/cycle)}`;
    if(warningCue.current===key)return;warningCue.current=key;
    navigator.vibrate?.(45);if(audio.current)tone(520);
  },[now,pending,connected]);
  if(caught){
    const fish=FISHING_CONFIG.fish[caught.fishCaught];
    const rarity={common:'Thông thường',uncommon:'Ít gặp',rare:'Hiếm',epic:'Quý hiếm',legendary:'Huyền thoại'}[caught.rarity]||'Cá vừa bắt';
    return <section className={`fish-result fish-rarity-${caught.rarity}`} role="dialog" aria-label="Cá vừa bắt"><header className="fish-result-header"><HudIcon asset="fish" size={27}/><span>MẺ CÁ THÀNH CÔNG</span><button className="fish-result-close" aria-label="Cất cá và đóng kết quả" onClick={clearCaught}>×</button></header><div className="fish-result-art">{catchImage&&catchImage!=='unavailable'?<img src={catchImage} alt={fish?.name||'Cá vừa bắt'}/>:<InventoryItemArt item={{itemId:caught.fishCaught,kind:'fish',name:fish?.name}} size={125}/>}<span>{rarity}</span></div><h2>{fish?.name||'Cá vừa bắt'}</h2><div className="fish-result-stats"><div><small>Cân nặng</small><b>{Number(caught.weight).toFixed(2)} <em>kg</em></b></div><div><small>Giá trị</small><b><HudIcon asset="coin" size={24}/>{caught.value} <em>xu</em></b></div></div><p className="fish-result-stored"><HudIcon asset="basket" size={24}/>Đã cất vào thùng cá · {fishingInventoryCount(fishing)}/{fishingCapacity(fishing)}</p><button disabled={!canCast} onClick={repeatCast}>Thả câu tiếp <kbd>F</kbd></button>{!canCast&&<p role="status">{!connected?'Đang chờ kết nối':!water?'Quay lại bờ nước để câu tiếp':!fishing?.equippedRod?'Trang bị cần câu trước':'Thùng cá đầy — hãy bán cá'}</p>}<button className="fish-cancel" onClick={clearCaught}>Cất cần · tiếp tục khám phá</button></section>;
  }
  if(!pending && !water)return null;
  const fighting=pending?.phase==='fighting', biting=pending && !fighting && now>=pending.biteAt && now<=pending.expiresAt;
  const nibbling=pending&&!fighting&&!biting&&fishingNibbleState(pending.biteAt-now);
  const motion=fighting?fishingFightState(pending,now):null;
  const struggling=fighting&&fishResistance(pending,now);
  const power=charging?Math.min(1,.3+Math.max(0,now-chargeStart.current)/1400*.7):.75;
  const tension=Math.max(0,Math.min(100,Number(pending?.tension)||0));
  const pull=Math.max(0,Math.min(100,Number(pending?.pull)||0));
  const remaining=biting ? Math.max(0,(pending.expiresAt-now)/(pending.expiresAt-pending.biteAt)*100) : 0;
  const title=fighting?'KÉO CÁ':biting?'CÁ ĐÃ CẮN CÂU':nibbling?'CÁ ĐANG RỈA MỒI':pending?'CHỜ CÁ CẮN':'SẴN SÀNG CÂU';
  return <section className={`fish-hud fish-state-${fighting?'fighting':biting?'bite':pending?'waiting':'ready'}`} aria-label="Câu cá">
    <header><span className="fish-hud-icon"><HudIcon asset="fish" size={34}/></span><span className="fish-hud-heading"><b>{title}</b><small>{fighting?'Giữ khi dây êm · thả khi cá vùng':biting?'Bấm một lần hoặc nhấn F để giật':nibbling?'Phao rung nhẹ · chưa giật cần':pending?'Kiên nhẫn chờ · cá đang tìm mồi':'Chạm Thả câu rồi chờ phao chìm'}</small></span><span className="fish-hud-bag" aria-label="Sức chứa thùng cá"><HudIcon asset="basket" size={22}/>{fishingInventoryCount(fishing)}/{fishingCapacity(fishing)}</span></header>
    <div className="fish-session-steps" aria-label="Các bước câu cá">{['Thả câu','Cá cắn','Kéo cá'].map((label,index)=><span key={label} className={(fighting?2:biting?1:0)===index?'is-current':''}><i>{index+1}</i>{label}</span>)}</div>
    <FishingDensityBadge conditions={conditions} water={water||pending?.zone} pending={pending}/>
    {fighting ? <>
      <div className="fish-fight-feedback"><span>{pending.hookQuality==='perfect'?'Giật hoàn hảo':pending.hookQuality==='good'?'Giật đúng nhịp':'Đã móc được cá'}</span><small>Cá đã mệt {Math.round(motion.fatigue*100)}%</small></div>
      <div className="fish-hud-readout"><span>Đã kéo <b>{Math.round(pull)}%</b></span><div className="fish-progress" role="progressbar" aria-label="Tiến độ kéo cá" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pull)}><i style={{width:`${pull}%`}}/></div></div>
      <div className="fish-hud-readout"><span>Lực dây <b>{Math.round(tension)}%</b></span><div className="fish-tension-track" role="meter" aria-label="Lực căng dây" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(tension)}><span className="fish-tension-safe"/><i style={{left:`${tension}%`}}/></div><div className="fish-tension-labels"><small>Chùng</small><small>Vùng an toàn</small><small>Căng</small></div></div>
      <p className={`fish-hud-cue ${struggling||motion?.phase==='warning'||tension>=80||tension<=20?'fish-hud-warning':''}`} role="status">{tension>=80?'Dây quá căng! Thả nút để giảm lực':tension<=20?'Dây sắp chùng! Kéo nhẹ để giữ cá':struggling?'Cá lao '+(motion.direction<0?'trái':'phải')+'! Thả nút':motion?.phase==='warning'?'Cá sắp vùng — chuẩn bị thả nút':motion?.phase==='rest'?'Cá đang nghỉ — giữ nút để kéo':'Cá bơi chậm — kéo nhẹ'}</p>
      <button className="fish-main-action fish-pull" aria-pressed={pressed} disabled={!connected} onBlur={()=>hold(false)} onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);hold(true);}} onPointerUp={()=>hold(false)} onPointerCancel={()=>hold(false)} onLostPointerCapture={()=>hold(false)} onKeyDown={e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();e.stopPropagation();hold(true);}}} onKeyUp={e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();e.stopPropagation();hold(false);}}}><HudIcon asset="hand" size={27}/>{pressed?'Thả để giảm lực':'Giữ để kéo'}<kbd>F</kbd></button>
    </> : pending ? <><div className={`fish-bobber ${biting?'fish-bobber-bite':nibbling?'fish-bobber-nibble':''}`} aria-hidden="true"><span/><i/></div>{biting&&<div className="fish-bite-time" role="progressbar" aria-label="Thời gian giật cần" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(remaining)}><i style={{width:`${remaining}%`}}/></div>}<button className={`fish-main-action ${biting?'fish-bite-action':''}`} disabled={!connected||!biting} onClick={primary}>{biting?`Giật cần · ${Math.ceil((pending.expiresAt-now)/1000)}s`:'Chờ phao chìm rồi giật'}{biting&&<kbd>F</kbd>}</button></> : <><p className="fish-rod-name">{FISHING_CONFIG.rods[fishing?.equippedRod]?.name || 'Cần mua và trang bị cần câu'}</p><div className="fish-cast-aim" role="group" aria-label="Hướng ném">{[[-1,'Trái'],[0,'Thẳng'],[1,'Phải']].map(([id,label])=><button key={id} aria-pressed={aim===id} disabled={charging||!canCast} onClick={()=>setAim(id)}>{label}</button>)}</div><div className="fish-cast-power"><span>Lực ném <b>{Math.round(power*100)}%</b></span><div role="meter" aria-label="Lực ném" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(power*100)}><i style={{width:`${power*100}%`}}/></div><small>Chạm để ném nhanh · giữ để chọn lực</small></div><button className="fish-main-action" disabled={!canCast} onClick={()=>primary()} onBlur={resetCharge} onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);startCharge();}} onPointerUp={finishCharge} onPointerCancel={resetCharge} onLostPointerCapture={resetCharge} onKeyDown={e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();e.stopPropagation();if(!e.repeat)startCharge();}}} onKeyUp={e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();e.stopPropagation();finishCharge();}}}><HudIcon asset="fish" size={26}/>{charging?'Thả để ném':'Thả câu'} <kbd>F</kbd></button>{fishingInventoryCount(fishing)>=fishingCapacity(fishing)&&<p role="status">Thùng cá đầy — hãy bán cá trước.</p>}</>}
    {fishing?.equippedRod&&<div className="fish-equipped-bait">Mồi: {FISHING_CONFIG.baits[fishing?.equippedBait]?.name||'Không dùng'}{fishing?.equippedBait&&` · còn ${fishing.bait?.[fishing.equippedBait]||0}`}</div>}
    {pending?.phase==='waiting'&&<div className="fish-cast-summary">Ném {Number(pending.castDistance||0).toFixed(1)} m{pending.castQuality==='accurate'?' · lực chuẩn':''}</div>}
    {pending&&<button className="fish-cancel" disabled={!connected} onClick={()=>send('fishing_cancel',{sessionId:pending.id})}>Thu cần</button>}
    {!connected&&<p role="alert">Mất kết nối — không thể xác nhận thao tác.</p>}
  </section>;
}
