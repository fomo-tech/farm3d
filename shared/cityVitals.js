export const CITY_RESPAWN={x:1.9,y:.08,z:13};
export const CITY_RESPAWN_DELAY=5000;
export function cityVitals(city={}){
 const raw=city.vitals||{},health=Number.isFinite(raw.health)?Math.max(0,Math.min(100,raw.health)):100;
 return {health,downedAt:health===0&&Number.isFinite(raw.downedAt)?raw.downedAt:health===0?0:null,protectedUntil:Number.isFinite(raw.protectedUntil)?raw.protectedUntil:0};
}
export function applyCityInjury(progress,state,damage,context,now){
 const vitals=cityVitals(state);if(!damage||vitals.health===0||now<vitals.protectedUntil)return;
 const wreck=state.garage.health[state.garage.selected]===0;
 vitals.health=wreck?0:Math.max(0,vitals.health-Math.ceil(damage*.5));
 if(vitals.health===0){
  vitals.downedAt=now;state.carPosition={x:context.x,z:context.z};progress.vehicle='walk';
  const id=state.contract?.id||(state.lastResult?.at===now?state.lastResult.id:undefined);
  state.contract=null;state.lastResult={status:'failed',...(id?{id}:{}),at:now,message:'Bị hạ sau tai nạn. Chờ cứu hộ đưa về điểm an toàn.'};
 }
 state.vitals=vitals;
}
export function respawnCityPlayer(progress,state,now){
 const vitals=cityVitals(state);
 if(vitals.health>0)throw Error('Nhân vật chưa bị hạ.');
 if(now-vitals.downedAt<CITY_RESPAWN_DELAY)throw Error('Đang chờ cứu hộ.');
 state.vitals={health:100,downedAt:null,protectedUntil:now+8000};progress.vehicle='walk';
 return {...CITY_RESPAWN};
}
