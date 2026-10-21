import React,{useEffect,useMemo,useRef,useState} from 'react';
import {CITY_CONTRACTS,CITY_GARAGE,cityState,cityContractObjective} from '../../shared/cityGameplay.js';
import './CityGameplayHUD.css';
import {CityGaragePanel} from './CityGaragePanel.jsx';
import {cityVitals} from '../../shared/cityVitals.js';
import {canExitCityVehicle} from '../../shared/cityVehicleInteraction.js';
export function CityGameplayHUD({progress,connected,worldRef,send,onMap,onObjective,onCamera,onPhone}){
 const [position,setPosition]=useState({x:0,z:0}),[busy,setBusy]=useState(false),[jobsOpen,setJobsOpen]=useState(false),[clock,setClock]=useState(Date.now());
 const initialized=useRef(false),objectiveCallback=useRef(onObjective);objectiveCallback.current=onObjective;
 const state=cityState(progress),driving=progress.vehicle==='convertible',job=CITY_CONTRACTS.find(j=>j.id===state.contract?.id);
 const wanted=worldRef.current?.cityWanted;
 const target=useMemo(()=>job?cityContractObjective(state.contract):driving?{...CITY_GARAGE,label:'Garage · Nhận hợp đồng'}:{...state.carPosition,label:'Roadster · F lên xe'},[job?.id,state.contract?.checkpoint,driving,state.carPosition.x,state.carPosition.z]);
 const remaining=job?.timeLimit?Math.max(0,Math.ceil((state.contract.startedAt+job.timeLimit*1000-clock)/1000)):null;
 const checkpointAction=()=>act(target.checkpoint?'city_contract_checkpoint':'city_contract_finish',target.checkpoint?{index:state.contract.checkpoint||0}:{});
 const act=(action,payload={})=>{if(!connected||busy)return;if(action==='city_vehicle'&&driving&&!canExitCityVehicle(worldRef.current?.getPlayerState?.()?.speed))return;setBusy(true);send(action,payload);};
 useEffect(()=>{setBusy(false);},[progress]);
 useEffect(()=>{if(!busy)return;const id=setTimeout(()=>setBusy(false),4000);return()=>clearTimeout(id);},[busy]);
 useEffect(()=>{if(connected&&!state.initialized&&!initialized.current){initialized.current=true;send('city_enter',{});}},[connected,state.initialized,send]);
 useEffect(()=>{const sample=()=>{const p=worldRef.current?.getPlayerState?.();if(p)setPosition(p);setClock(Date.now());};sample();const id=setInterval(sample,200);return()=>clearInterval(id);},[worldRef]);
 const timeoutSent=useRef(null);
 useEffect(()=>{if(remaining===0&&connected&&!busy&&timeoutSent.current!==state.contract?.startedAt){timeoutSent.current=state.contract.startedAt;act('city_contract_timeout');}},[remaining,connected,busy,state.contract?.startedAt]);
 useEffect(()=>{worldRef.current?.setObjective(target);objectiveCallback.current?.(target);return()=>worldRef.current?.setObjective(null);},[worldRef,target]);
 useEffect(()=>{const car=worldRef.current?.scene?.getTransformNodeByName('city-parked-car-1');if(car){car.position.set(state.carPosition.x,0,state.carPosition.z);car.setEnabled(!driving);}},[worldRef,driving,state.carPosition.x,state.carPosition.z]);
 useEffect(()=>{worldRef.current?.setCityVehicleAppearance?.(state.garage.paints[state.garage.selected],state.garage.selected==='roadster-gt');},[worldRef,state.garage.selected,state.garage.paints[state.garage.selected],driving]);
 const carDistance=Math.hypot(position.x-state.carPosition.x,position.z-state.carPosition.z),distance=Math.round(Math.hypot(position.x-target.x,position.z-target.z));
 const atGarage=Math.hypot(position.x-CITY_GARAGE.x,position.z-CITY_GARAGE.z)<=15;
 useEffect(()=>{setJobsOpen(false);},[job?.id]);
 useEffect(()=>{const key=e=>{if(e.repeat||e.ctrlKey||e.altKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName)||e.target?.isContentEditable)return;if(e.code==='Escape'){setJobsOpen(false);return;}if(document.querySelector('[data-city-input-lock]'))return;if(e.target?.closest?.('[role="dialog"]'))return;if(e.code==='KeyF'&&(driving||carDistance<=5)){e.preventDefault();act('city_vehicle');}if(e.code==='KeyE'){if(job&&distance<=(target.checkpoint?10:12)&&driving){e.preventDefault();checkpointAction();}else if(atGarage&&driving){e.preventDefault();setJobsOpen(true);}}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[connected,busy,driving,carDistance,job?.id,state.contract?.checkpoint,distance,atGarage]);
 return <aside className="city-gameplay" aria-label="Vibe City · Hợp đồng đô thị">
  <div className="city-health" role="meter" aria-label="Máu nhân vật" aria-valuemin={0} aria-valuemax={100} aria-valuenow={cityVitals(progress.city).health}><i style={{width:`${cityVitals(progress.city).health}%`}}/><span>HP {cityVitals(progress.city).health}</span></div>
  <div className="city-wallet"><small>VIBE CITY</small><strong>${Math.floor(progress.coins||0).toLocaleString('en-US')}</strong><span>{connected?'Đã kết nối':'Mất kết nối'}</span></div>
  {wanted?.stars>0&&<div className={`city-wanted ${wanted.phase}`} role="status" aria-label={`Truy nã ${wanted.stars} sao`}><strong>{'★'.repeat(wanted.stars)}{'☆'.repeat(3-wanted.stars)}</strong><small>{wanted.phase==='search'?'ĐANG TÌM KIẾM · RỜI KHỎI KHU VỰC':'ĐÃ BỊ PHÁT HIỆN'}</small></div>}
  <div className="city-objective"><small>{job?`HỢP ĐỒNG · ${Math.min((state.contract.checkpoint||0)+1,(job.checkpoints?.length||0)+1)}/${(job.checkpoints?.length||0)+1}`:'ĐIỂM ĐẾN'}</small><p>{target.label} <span>· {distance} m</span></p>{job&&<><p>{driving?'Đi theo điểm đánh dấu; nhấn E khi tới nơi.':'Quay lại xe để tiếp tục chuyến hàng.'}</p>{remaining!==null&&<p role="timer">{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}</p>}<button className="city-mission-manage" onClick={()=>setJobsOpen(true)}>Chi tiết / Hủy chuyến</button></>}</div>
  {state.lastResult&&clock-state.lastResult.at<9000&&<div className={`city-mission-result ${state.lastResult.status}`} role="status">{state.lastResult.message}</div>}
  {job&&clock-state.contract.startedAt<6500&&<div className="city-mission-result" role="status">Đã nhận chuyến hàng<br/><small>{job.name} · ${job.reward} · Đi theo checkpoint</small></div>}
  {jobsOpen&&<section className="city-contract" role="dialog" aria-modal="true" aria-label="Hợp đồng garage" data-city-input-lock="true"><button autoFocus onClick={()=>setJobsOpen(false)}>Đóng · Esc</button><small>{job?'HỢP ĐỒNG ĐANG CHẠY':'GARAGE TRUNG TÂM'}</small><h2>{job?.name||'Chọn chuyến đi'}</h2><p>{target.label} · {distance} m</p>
   {!state.initialized&&<button disabled={!connected||busy} onClick={()=>act('city_enter')}>Mở hồ sơ thành phố</button>}
   {!job&&<p>Đến Roadster ở garage, nhấn F lên xe rồi nhận hợp đồng.</p>}
   {job?<><p>Giao hàng bằng xe · ${job.reward} · {job.xp} XP</p><button disabled={!connected||busy||distance>(target.checkpoint?10:12)||!driving} onClick={checkpointAction}>E · {target.checkpoint?'Xác nhận checkpoint':'Giao hàng'}</button><button disabled={!connected||busy} onClick={()=>act('city_contract_cancel')}>Hủy hợp đồng</button></>:CITY_CONTRACTS.map(j=><button key={j.id} disabled={!connected||busy||!atGarage||!driving} onClick={()=>act('city_contract_start',{id:j.id})}><span>{j.name}<small>{j.description}{j.timeLimit?` · ${j.timeLimit/60} phút`:''}</small></span><b>${j.reward}</b></button>)}
   <small>Đã hoàn thành {state.completed} hợp đồng</small>
   {!job&&atGarage&&<CityGaragePanel garage={state.garage} coins={progress.coins||0} disabled={!connected||busy||driving||wanted?.stars>0} onAction={act}/>}
  </section>}
  {driving&&<div className="city-speed" aria-label="Tốc độ xe"><strong>{Math.round((position.speed||0)*3.6)}</strong><span>KM/H</span><small>{canExitCityVehicle(position.speed)?'F · Xuống xe':'Dừng xe trước khi xuống · Space phanh'}</small></div>}
  {driving&&<div className="city-car-condition" role="status">Độ bền {state.garage.health[state.garage.selected]}%{state.garage.health[state.garage.selected]===0?' · Xe hỏng — xuống xe để gọi cứu hộ':''}</div>}
  <nav className="city-controls" aria-label="Điều khiển thành phố">{(driving||carDistance<=5)&&<button disabled={!connected||busy} onClick={()=>act('city_vehicle')}>F · {driving?'Xuống xe':'Lên Roadster'}</button>}{atGarage&&!job&&<button onClick={()=>setJobsOpen(true)}>Garage / Hợp đồng</button>}{job&&distance<=(target.checkpoint?10:12)&&<button disabled={!connected||busy||!driving} onClick={checkpointAction}>E · {target.checkpoint?'Checkpoint':'Giao hàng'}</button>}<button onClick={onPhone}>Điện thoại</button><button onClick={onMap}>Bản đồ</button><button onClick={onCamera}>Camera</button></nav>
 </aside>;
}
