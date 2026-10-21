import {CITY_TRAFFIC_ROUTE} from './cityTraffic.js';
const lengths=CITY_TRAFFIC_ROUTE.map((a,i)=>{const b=CITY_TRAFFIC_ROUTE[(i+1)%4];return Math.hypot(b[0]-a[0],b[1]-a[1]);});
const perimeter=lengths.reduce((a,b)=>a+b,0);
export function projectCityPatrolTarget(point){
 if(!Number.isFinite(point?.x)||!Number.isFinite(point?.z))return null;
 let best=null,start=0;
 for(let i=0;i<4;i++){
  const a=CITY_TRAFFIC_ROUTE[i],b=CITY_TRAFFIC_ROUTE[(i+1)%4],dx=b[0]-a[0],dz=b[1]-a[1];
  const f=Math.max(0,Math.min(1,((point.x-a[0])*dx+(point.z-a[1])*dz)/(lengths[i]**2)));
  const x=a[0]+dx*f,z=a[1]+dz*f,error=Math.hypot(x-point.x,z-point.z);
  if(!best||error<best.error)best={distance:(start+f*lengths[i])%perimeter,error,x,z};
  start+=lengths[i];
 }
 return best;
}
export function citySignalPhase(time){
 const phase=((time/1000)%32+32)%32;
 return {eastWest:phase<12?'green':phase<15?'amber':'red',northSouth:phase>=16&&phase<28?'green':phase>=28&&phase<31?'amber':'red'};
}
function locate(distance){
 let d=((distance%perimeter)+perimeter)%perimeter;
 for(let i=0;i<4;i++){if(d<lengths[i])return {segment:i,along:d};d-=lengths[i];}
 return {segment:0,along:0};
}
export function fleetVehiclePose(car){
 const {segment,along}=locate(car.distance),a=CITY_TRAFFIC_ROUTE[segment],b=CITY_TRAFFIC_ROUTE[(segment+1)%4],f=along/lengths[segment];
 return {id:car.id,x:a[0]+(b[0]-a[0])*f,z:a[1]+(b[1]-a[1])*f,yaw:Math.atan2(b[0]-a[0],b[1]-a[1]),speed:car.speed,police:car.police,mode:car.mode||'patrol',siren:car.police&&car.mode==='pursuit'};
}
export function createCityTrafficFleet(){
 return Array.from({length:4},(_,id)=>({id,distance:id*perimeter/4,speed:0,police:id===3}));
}
export function stepCityTrafficFleet(fleet,now,delta,obstacles=[],policeOrder=null){
 const dt=Math.min(.05,Math.max(0,delta)),signals=citySignalPhase(now),snapshot=fleet.map(c=>({...c}));
 for(const car of fleet){
  const {segment,along}=locate(car.distance),pose=fleetVehiclePose(car);
  const goal=car.police?projectCityPatrolTarget(policeOrder?.target):null;
  car.mode=goal?(policeOrder.phase==='search'?'search':'pursuit'):'patrol';
  let available=Infinity;
  for(const other of snapshot)if(other.id!==car.id){const gap=((other.distance-car.distance)%perimeter+perimeter)%perimeter;available=Math.min(available,Math.max(0,gap-5));}
  // The next segment's signal governs entering the corner. Stop before the junction.
  const next=(segment+1)%4,light=next%2===0?signals.eastWest:signals.northSouth;
  if(light!=='green'&&car.mode!=='pursuit')available=Math.min(available,Math.max(0,lengths[segment]-along-2));
  if(goal){
   const gap=((goal.distance-car.distance)%perimeter+perimeter)%perimeter;
   // Stop at the last observed road position, never cut through a city block.
   if(gap<perimeter/2)available=Math.min(available,Math.max(0,gap-4));
  }
  const forward={x:Math.sin(pose.yaw),z:Math.cos(pose.yaw)};
  for(const o of obstacles){const dx=o.x-pose.x,dz=o.z-pose.z,ahead=dx*forward.x+dz*forward.z,lateral=Math.abs(dx*forward.z-dz*forward.x);if(ahead>0&&lateral<2.4)available=Math.min(available,Math.max(0,ahead-5));}
  const target=Math.min(car.mode==='pursuit'?11:car.mode==='search'?4:6,Math.sqrt(2*7*available)),rate=target<car.speed?12:3;
  car.speed+=Math.sign(target-car.speed)*Math.min(Math.abs(target-car.speed),rate*dt);
  car.distance=(car.distance+Math.min(available,car.speed*dt))%perimeter;
 }
 return fleet;
}
