import React,{useEffect,useState} from 'react';
import {CITY_CONTRACTS,CITY_GARAGE,cityState,cityContractObjective} from '../../shared/cityGameplay.js';
import {CITY_CARS} from '../../shared/cityGarage.js';
import './CityPhone.css';
export function CityPhone({progress,connected,onAction,onMap,onClose}){
 const [tab,setTab]=useState('jobs'),[now,setNow]=useState(Date.now()),[pending,setPending]=useState(false),[confirmCancel,setConfirmCancel]=useState(false);
 const state=cityState(progress),job=CITY_CONTRACTS.find(j=>j.id===state.contract?.id),objective=cityContractObjective(state.contract);
 useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id);},[]);
 useEffect(()=>{setPending(false);setConfirmCancel(false);},[progress]);
 useEffect(()=>{if(!pending)return;const id=setTimeout(()=>setPending(false),4000);return()=>clearTimeout(id);},[pending]);
 useEffect(()=>{const close=e=>{if(e.code==='Escape'){e.stopImmediatePropagation();onClose();}};window.addEventListener('keydown',close,true);return()=>window.removeEventListener('keydown',close,true);},[onClose]);
 const seconds=job?.timeLimit?Math.max(0,Math.ceil((state.contract.startedAt+job.timeLimit*1000-now)/1000)):null;
 const act=(action)=>{if(!connected||pending)return;setPending(true);onAction(action,{});};
 return <div className="city-phone-backdrop" onClick={onClose}><section className="city-phone" role="dialog" aria-modal="true" aria-label="Điện thoại Vibe City" data-city-input-lock="true" onClick={e=>e.stopPropagation()}>
  <header><div><small>VIBE CONNECT</small><h2>Điện thoại</h2></div><button autoFocus onClick={onClose} aria-label="Đóng điện thoại">×</button></header>
  {!connected&&<p role="status">Mất kết nối · dữ liệu đang hiển thị là bản lưu gần nhất.</p>}
  <nav aria-label="Ứng dụng thành phố">{[['jobs','Công việc'],['garage','Garage'],['history','Lịch sử']].map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</nav>
  <main>
  {tab==='jobs'&&<>
   {job?<article><small>CHUYẾN ĐANG CHẠY</small><h3>{job.name}</h3><p>{objective.label}</p><p>Checkpoint {state.contract.checkpoint||0}/{job.checkpoints?.length||0} · ${job.reward}</p>{seconds!==null&&<p role="timer">{seconds>0?`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`:'Đã hết thời gian'}</p>}<button onClick={()=>onMap(objective)}>Xem điểm hiện tại trên bản đồ</button>{seconds===0?<button disabled={!connected||pending} onClick={()=>act('city_contract_timeout')}>Xác nhận chuyến hết giờ</button>:confirmCancel?<div><p>Hủy chuyến này? Không có thưởng.</p><button disabled={!connected||pending} onClick={()=>act('city_contract_cancel')}>Xác nhận hủy</button><button onClick={()=>setConfirmCancel(false)}>Giữ chuyến</button></div>:<button onClick={()=>setConfirmCancel(true)}>Hủy chuyến</button>}</article>:<article><h3>Chưa có chuyến hàng</h3><p>Đến garage và lên xe để nhận việc. Không nhận thưởng hay nhận hàng từ xa.</p><button onClick={()=>onMap({...CITY_GARAGE,label:'Garage trung tâm'})}>Tìm garage</button></article>}
   <h3>Bảng công việc</h3>{CITY_CONTRACTS.map(j=><article key={j.id}><h4>{j.name}</h4><p>{j.description}</p><small>${j.reward} · {j.xp} XP{j.timeLimit?` · ${j.timeLimit/60} phút`:''}</small></article>)}
  </>}
  {tab==='garage'&&<><p>Tiền mặt: ${Math.floor(progress.coins||0)}</p>{state.garage.owned.map(id=><article key={id}><h3>{CITY_CARS.find(c=>c.id===id)?.name}{id===state.garage.selected?' · Đang dùng':''}</h3><p>Độ bền {state.garage.health[id]}%</p><p><i className="city-phone-paint" style={{background:state.garage.paints[id]}}/> {state.garage.paints[id]}</p></article>)}<button onClick={()=>onMap({...state.carPosition,label:'Xe cá nhân'})}>Tìm xe đang đỗ</button><button onClick={()=>onMap({...CITY_GARAGE,label:'Garage trung tâm'})}>Tìm garage sửa xe</button><p>Mua, đổi, sơn và sửa xe trực tiếp tại garage.</p></>}
  {tab==='history'&&<><p>{state.completed} chuyến hoàn thành · thu nhập nhiệm vụ từ bản cập nhật này ${state.totalEarned}</p>{state.history.length?[...state.history].reverse().map((entry,i)=><article key={`${entry.at}-${i}`}><small>{entry.status==='success'?'HOÀN THÀNH':entry.status==='failed'?'THẤT BẠI':'ĐÃ HỦY'} · {new Date(entry.at).toLocaleString('vi-VN')}</small><p>{entry.message}</p></article>):<p>Chưa có lịch sử. Các chuyến trước khi cập nhật không được dựng lại từ dữ liệu thiếu.</p>}</>}
  </main><footer>Hồ sơ và lịch sử được lưu trên server · tối đa 20 chuyến gần nhất</footer>
 </section></div>;
}
