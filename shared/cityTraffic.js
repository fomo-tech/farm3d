// Fixed, bounded sample-district circuit; all clients and server sample the same clock.
export const CITY_TRAFFIC_ROUTE=[[47,-43],[128,-43],[128,43],[47,43]];
export function trafficPose(time,offset=0){
 const points=CITY_TRAFFIC_ROUTE,lengths=points.map((p,i)=>Math.hypot(points[(i+1)%4][0]-p[0],points[(i+1)%4][1]-p[1]));
 // Stop at every junction for two seconds before entering the next road.
 const cycle=lengths.reduce((sum,l)=>sum+l/6+2,0);let t=((time/1000+offset)%cycle+cycle)%cycle;
 for(let i=0;i<4;i++){
  const duration=lengths[i]/6+2;
  if(t<duration){const a=points[i],b=points[(i+1)%4],f=Math.max(0,t-2)*6/lengths[i];return {x:a[0]+(b[0]-a[0])*f,z:a[1]+(b[1]-a[1])*f,yaw:Math.atan2(b[0]-a[0],b[1]-a[1]),stopped:t<2};}t-=duration;
 }
}
export const CITY_TRAFFIC_OFFSETS=[0,14,28,42];
export function cityPatrolCanSee(from,to,blocked){
 const distance=Math.hypot(to.x-from.x,to.z-from.z);
 if(distance>=45)return false;
 const steps=Math.ceil(distance);
 for(let i=1;i<steps;i++)if(blocked(from.x+(to.x-from.x)*i/steps,from.z+(to.z-from.z)*i/steps))return false;
 return true;
}
export function advanceCityWanted(previous,{now,x,z,vehicle,speed,hit=false,visible=true,patrolPosition}){
 const s={stars:0,phase:'clear',lastSeenAt:now,lastOffenceAt:-Infinity,...previous};
 if(hit&&vehicle==='convertible'&&speed>2&&now-s.lastOffenceAt>5000){s.stars=Math.min(3,s.stars+1);s.phase='pursuit';s.lastSeenAt=now;s.lastOffenceAt=now;s.lastKnown={x,z};}
 if(s.stars){
  const patrol=patrolPosition||trafficPose(now,42),seen=visible&&Math.hypot(x-patrol.x,z-patrol.z)<45;
  if(seen){s.lastSeenAt=now;s.phase='pursuit';s.lastKnown={x,z};}
  else if(now-s.lastSeenAt>=25000){s.stars=0;s.phase='clear';}
  else if(now-s.lastSeenAt>=8000)s.phase='search';
 }
 return s;
}
