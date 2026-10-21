import React,{useEffect,useState} from 'react';
import {cityVitals,CITY_RESPAWN_DELAY} from '../../shared/cityVitals.js';
export function CityRecoveryOverlay({progress,connected,onRespawn}){
 const [now,setNow]=useState(Date.now()),[pending,setPending]=useState(false);
 const vitals=cityVitals(progress.city),remaining=Math.max(0,Math.ceil((vitals.downedAt+CITY_RESPAWN_DELAY-now)/1000));
 useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),200);return()=>clearInterval(id);},[]);
 useEffect(()=>{if(!pending)return;const id=setTimeout(()=>setPending(false),4000);return()=>clearTimeout(id);},[pending]);
 return <div className="city-recovery" role="dialog" aria-modal="true" aria-label="Cứu hộ nhân vật" data-city-input-lock="true"><section><small>CỨU HỘ THÀNH PHỐ</small><h1>BẠN ĐÃ BỊ HẠ</h1><p>Tai nạn nghiêm trọng. Chuyến hàng đã kết thúc; xe được giữ tại vị trí tai nạn.</p><p>Trở về quảng trường an toàn, không mất thêm tiền. Độ bền xe không tự hồi phục.</p><button disabled={!connected||pending||remaining>0} onClick={()=>{setPending(true);onRespawn();}}>{!connected?'Đang chờ kết nối':pending?'Đang hồi sinh…':remaining>0?`Cứu hộ tới sau ${remaining}s`:'Hồi sinh tại quảng trường'}</button></section></div>;
}
