import {cityGarageState,applyCityGarage,applyCityImpact} from './cityGarage.js';
import {cityVitals,applyCityInjury,respawnCityPlayer} from './cityVitals.js';
export const CITY_GARAGE=Object.freeze({x:20,z:13});
export const CITY_CONTRACTS=Object.freeze([
 {id:'waterfront-run',name:'Chuyến đầu tiên · Waterfront',description:'Nhận kiện hàng tại garage, qua cầu và giao ở bến phía đông.',target:{x:200,z:45},checkpoints:[{x:20,z:0,label:'Rời garage'},{x:100,z:0,label:'Đại lộ ven sông'},{x:200,z:0,label:'Qua cầu Waterfront'}],timeLimit:180,reward:180,xp:25},
 {id:'south-delivery',name:'Chuyến hàng Southside',description:'Lái xe giao hàng đến đại lộ phía nam.',target:{x:-300,z:355},reward:260,xp:30},
 {id:'docks-delivery',name:'Hợp đồng East Docks',description:'Vận chuyển kiện hàng đến đầu mối cảng.',target:{x:770,z:320},reward:480,xp:55},
 {id:'county-delivery',name:'Đường dài Sandy County',description:'Giao chuyến hàng liên vùng lên phía bắc.',target:{x:530,z:-980},reward:800,xp:90},
]);
export function cityState(progress){
 const s=progress.city||{};
 return {initialized:s.initialized===true,carPosition:s.carPosition&&Number.isFinite(s.carPosition.x)&&Number.isFinite(s.carPosition.z)?s.carPosition:{...CITY_GARAGE},contract:s.contract||null,completed:s.completed||0,lastResult:s.lastResult||null,garage:cityGarageState(s),history:Array.isArray(s.history)?s.history.slice(-20):[],totalEarned:Number.isFinite(s.totalEarned)?s.totalEarned:0,vitals:cityVitals(s)};
}
function commitCityState(progress,state){
 const result=state.lastResult,last=state.history.at(-1);
 if(result?.id&&(!last||last.at!==result.at||last.id!==result.id||last.status!==result.status))state.history=[...state.history,{...result}].slice(-20);
 progress.city=state;
}
export function cityContractObjective(contract){
 const job=CITY_CONTRACTS.find(j=>j.id===contract?.id);
 if(!job)return null;
 const checkpoint=job.checkpoints?.[contract.checkpoint||0];
 return checkpoint?{...checkpoint,label:checkpoint.label,checkpoint:true}:{...job.target,label:`Giao hàng · ${job.name}`,checkpoint:false};
}
export function applyCityAction(progress,action,payload,context,now=Date.now()){
 if(context.worldMode!=='city')throw Error('Tính năng này chỉ dùng tại Vibe City.');
 const state=structuredClone(cityState(progress));
 state.vitals=cityVitals(progress.city);
 if(state.vitals.health===0&&!['city_respawn','city_enter'].includes(action))throw Error('Nhân vật đang bị hạ. Hãy chờ cứu hộ.');
 const near=(point,radius)=>!context.venue&&Number.isFinite(context.x)&&Number.isFinite(context.z)&&Math.hypot(context.x-point.x,context.z-point.z)<=radius;
 let result={cityUpdated:true};
 if(action==='city_enter'){
  state.initialized=true;
  progress.ownedVehicles=[...new Set([...(progress.ownedVehicles||['walk']),'convertible'])];
 }else{
  if(!state.initialized)throw Error('Hãy mở hồ sơ thành phố trước.');
  if(!Number.isFinite(context.x)||!Number.isFinite(context.z))throw Error('Vị trí người chơi không hợp lệ.');
  if(action==='city_respawn'){
   result.cityRespawn=respawnCityPlayer(progress,state,now);
  }else if(action==='city_vehicle_impact'){
   const damage=applyCityImpact(progress,state,context,now);result.cityDamage=damage;applyCityInjury(progress,state,damage,context,now);
  }else if(action.startsWith('city_garage_')){
   const message=applyCityGarage(progress,state,action,payload,context);
   state.lastResult={status:'success',at:now,message};
  }else if(action==='city_vehicle'){
   if(context.venue)throw Error('Hãy ra ngoài trước khi lên xe.');
   if(progress.vehicle==='convertible'){
    state.carPosition={x:context.x,z:context.z};progress.vehicle='walk';
   }else{
    if(!near(state.carPosition,5))throw Error('Hãy đứng gần chiếc Roadster để lên xe.');
    if(state.garage.health[state.garage.selected]<=0)throw Error('Xe đã hỏng. Hãy tới garage để sửa hoặc gọi cứu hộ.');
    progress.vehicle='convertible';
   }
  }else if(action==='city_contract_start'){
   if(state.contract)throw Error('Bạn đang có hợp đồng chưa hoàn thành.');
   const job=CITY_CONTRACTS.find(j=>j.id===payload.id);
   if(!job)throw Error('Hợp đồng không hợp lệ.');
   if(!near(CITY_GARAGE,15))throw Error('Hãy đến garage trung tâm để nhận hàng.');
   if(progress.vehicle!=='convertible')throw Error('Hãy lên xe trước khi nhận hợp đồng.');
   state.contract={id:job.id,startedAt:now,checkpoint:0,lastCheckpointAt:now};state.lastResult=null;
  }else if(action==='city_contract_checkpoint'||action==='city_contract_timeout'){
   const job=CITY_CONTRACTS.find(j=>j.id===state.contract?.id);
   if(!job)throw Error('Bạn chưa nhận hợp đồng.');
   if(job.timeLimit&&now-state.contract.startedAt>=job.timeLimit*1000){
    state.lastResult={status:'failed',id:job.id,at:now,message:'Hết thời gian giao hàng. Quay về garage để thử lại.'};state.contract=null;
   }else if(action==='city_contract_timeout')throw Error('Hợp đồng chưa hết thời gian.');
   else{
    const index=state.contract.checkpoint||0,point=job.checkpoints?.[index];
    if(!point||payload.index!==index)throw Error('Checkpoint không hợp lệ hoặc đã được ghi nhận.');
    if(!near(point,10)||progress.vehicle!=='convertible')throw Error('Hãy lái xe tới checkpoint hiện tại.');
    const previous=index?job.checkpoints[index-1]:CITY_GARAGE;
    if(now-(state.contract.lastCheckpointAt||state.contract.startedAt)<Math.hypot(point.x-previous.x,point.z-previous.z)/24.3*1000)throw Error('Di chuyển tới checkpoint quá nhanh.');
    state.contract.checkpoint=index+1;state.contract.lastCheckpointAt=now;
   }
  }else if(action==='city_contract_finish'){
   const job=CITY_CONTRACTS.find(j=>j.id===state.contract?.id);
   if(!job)throw Error('Bạn chưa nhận hợp đồng.');
   if(job.timeLimit&&now-state.contract.startedAt>=job.timeLimit*1000){
    state.lastResult={status:'failed',id:job.id,at:now,message:'Hết thời gian giao hàng. Quay về garage để thử lại.'};state.contract=null;
    commitCityState(progress,state);return result;
   }
   if((state.contract.checkpoint||0)<(job.checkpoints?.length||0))throw Error('Hãy đi qua đủ checkpoint trước khi giao hàng.');
   if(job.checkpoints?.length){
    const previous=job.checkpoints[job.checkpoints.length-1];
    if(now-state.contract.lastCheckpointAt<Math.hypot(job.target.x-previous.x,job.target.z-previous.z)/24.3*1000)throw Error('Chưa đủ thời gian từ checkpoint cuối tới điểm giao.');
   }
   if(!near(job.target,12)||progress.vehicle!=='convertible')throw Error('Hãy lái xe đến điểm giao hàng.');
   const minimum=Math.hypot(job.target.x-CITY_GARAGE.x,job.target.z-CITY_GARAGE.z)/(18*1.35);
   if(now-state.contract.startedAt<minimum*1000)throw Error('Chuyến đi chưa đủ thời gian hợp lệ.');
   progress.coins+=job.reward;progress.xp+=job.xp;state.completed++;state.totalEarned+=job.reward;state.contract=null;
   state.lastResult={status:'success',id:job.id,at:now,message:`Giao hàng hoàn tất · +$${job.reward} · +${job.xp} XP`};
   result={...result,cityReward:{coins:job.reward,xp:job.xp}};
  }else if(action==='city_contract_cancel'){
   if(!state.contract)throw Error('Bạn chưa nhận hợp đồng.');
   state.lastResult={status:'cancelled',id:state.contract.id,at:now,message:'Đã hủy chuyến hàng. Không mất tiền.'};state.contract=null;
  }
  else throw Error('Thao tác thành phố không hợp lệ.');
 }
 commitCityState(progress,state);return result;
}
