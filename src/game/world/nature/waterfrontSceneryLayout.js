import {NETWORK_LAKES,NETWORK_STREAMS,NETWORK_BRIDGES,networkLakeOutline,networkLakeVisitPoint,networkWaterAt} from '../../../../shared/waterNetwork.js';
import {RIVER_CONTROL_POINTS,sampleRiverSpline} from '../../../../shared/riverLayout.js';
import {LAKE_OUTLINE,LAKE_CENTER,lakeWaterAt,lakeShoreDistance} from '../../../../shared/lakeConfig.js';
import {beachResourceWaterAt} from '../../../../shared/beachConfig.js';
import {farmLotPosition} from '../../../../shared/farmLayout.js';
import {isRoadResourceBlocked} from '../RoadSafetyZone.js';
const main=sampleRiverSpline(RIVER_CONTROL_POINTS,240),farms=Array.from({length:288},(_,i)=>farmLotPosition(i+1));
const arrivals=[{x:126,z:2},...NETWORK_LAKES.map(networkLakeVisitPoint)];
function mainWater(x,z,r){return main.some(p=>Math.hypot(x-p.x,z-p.z)<p.w/2+r);}
export function waterfrontPlacementClear(x,z,r=1){
 return !networkWaterAt(x,z,r)&&!lakeWaterAt(x,z)&&lakeShoreDistance(x,z)>r&&!mainWater(x,z,r)&&!beachResourceWaterAt(x,z)
 &&!isRoadResourceBlocked(x,z,r)&&!farms.some(f=>Math.abs(x-f.x)<12+r&&Math.abs(z-f.z)<12+r)
 &&!arrivals.some(p=>Math.hypot(x-p.x,z-p.z)<6+r)&&!NETWORK_BRIDGES.some(b=>Math.hypot(x-b.cx,z-b.cz)<12+r);
}
export function buildWaterfrontSceneryLayout(){
 const records=[];
 const add=(body,side,kind,x,z,theme,seed,look)=>{
  const radius=kind==='tree'?4.8:kind==='rest'?6:kind==='shrub'?1.3:.9;
  if(!waterfrontPlacementClear(x,z,radius))return;
  if(records.some(p=>Math.hypot(x-p.x,z-p.z)<radius+p.radius+.5))return;
  records.push({id:`${body}-${side}-${kind}-${seed}`,body,side,kind,x,z,radius,theme,scale:.82+(seed%5)*.09,yaw:Math.atan2(x-look.x,z-look.z)});
 };
 const lake=(id,edge,center,theme)=>{
  for(let i=2;i<edge.length;i+=6){
   const p=edge[i],dx=p.x-center.x,dz=p.z-center.z,length=Math.hypot(dx,dz),nx=dx/length,nz=dz/length;
   const side=Math.abs(nx)>Math.abs(nz)?nx<0?'west':'east':nz<0?'north':'south';
   add(id,side,i%18===2?'rest':'tree',p.x+nx*(13+(i%4)*1.4),p.z+nz*(13+(i%4)*1.4),theme,i,center);
   add(id,side,'shrub',p.x+nx*5-nz*2,p.z+nz*5+nx*2,theme,i+1,center);
   add(id,side,'stone',p.x+nx*3+nz*2,p.z+nz*3-nx*2,theme,i+2,center);
  }
 };
 for(const l of NETWORK_LAKES)lake(l.id,networkLakeOutline(l),l,l.id==='pine'?'pine':l.id==='reed'?'reed':l.id==='lotus'?'blossom':l.id==='mist'?'mist':'willow');
 lake('crystal',LAKE_OUTLINE,LAKE_CENTER,'willow');
 const river=(id,samples)=>{
  let last=null,index=0;
  for(let i=2;i<samples.length-2;i++){
   const p=samples[i];if(last&&Math.hypot(p.x-last.x,p.z-last.z)<26+(index%3)*5)continue;
   last=p;index++;
   const a=samples[i-1],b=samples[i+1],dx=b.x-a.x,dz=b.z-a.z,n=Math.hypot(dx,dz)||1;
   for(const side of [-1,1]){
    const nx=-dz/n*side,nz=dx/n*side,d=p.w/2;
    const theme=p.z<-300?'pine':index%4===0?'blossom':'willow';
    add(id,side<0?'left':'right',index%9===0?'rest':'tree',p.x+nx*(d+13+(index%3))+dx/n*Math.sin(index*2.1+side)*4,p.z+nz*(d+13+(index%3))+dz/n*Math.sin(index*2.1+side)*4,theme,index*2+(side+1)/2,p);
    add(id,side<0?'left':'right','shrub',p.x+nx*(d+5)+dx/n*4,p.z+nz*(d+5)+dz/n*4,theme,index*7+(side+1)/2,p);
    add(id,side<0?'left':'right','stone',p.x+nx*(d+3)-dx/n*3,p.z+nz*(d+3)-dz/n*3,theme,index*11+(side+1)/2,p);
   }
  }
 };
 for(const stream of NETWORK_STREAMS)river(stream.id,stream.samples);
 river('grand-river',main);
 return records;
}
