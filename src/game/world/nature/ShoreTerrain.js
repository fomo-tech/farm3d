import {NETWORK_LAKES,NETWORK_STREAMS,networkLakeOutline,streamBanks} from '../../../../shared/waterNetwork.js';
import {LAKE_CENTER,LAKE_OUTLINE,lakeGroundHeight} from '../../../../shared/lakeConfig.js';
import {RIVER_CONTROL_POINTS,sampleRiverSpline} from '../../../../shared/riverLayout.js';
import {getBridgeSurfaceHeight} from '../../../../shared/bridgeConfig.js';
import {beachGroundHeight} from '../../../../shared/beachConfig.js';
import {otherWaterAt} from './clipShoreAtWaterways.js';
import {isRoadResourceBlocked} from '../RoadSafetyZone.js';
import {isPointInsideAnyFarmLot} from '../FarmSafetyZone.js';
let layout,grid;
export function shoreTerrainLayout(){
 if(layout)return layout;
 layout=[];
 const strip=(id,edge,normal,closed)=>{
  const positions=[],colors=[],indices=[],count=edge.length;
  for(let row=0;row<6;row++)for(let i=0;i<count;i++){
   const p=edge[i],n=normal[i],noise=(Math.sin(p.x*.07+p.z*.04)+Math.cos(p.z*.09-p.x*.03))*.5,w=2.8+noise*.65;
   const d=[.035,.08,.12,.72,w*.62,w][row];
   positions.push(p.x+n.x*d,[.10,.24+noise*.04,.73+noise*.08,.74+noise*.08,.42,.02][row],p.z+n.z*d);
   colors.push(...[[.38,.44,.43],[.57,.63,.60],[.70,.74,.66],[.68,.72,.63],[.43,.59,.25],[.43,.6,.25]][row],row===5?0:row===4?.75:1);
  }
  const clear=(x,z)=>getBridgeSurfaceHeight(x,z)===null&&beachGroundHeight(x,z)===null&&lakeGroundHeight(x,z)===null&&!otherWaterAt(x,z,id)&&!isRoadResourceBlocked(x,z,.4)&&!isPointInsideAnyFarmLot(x,z);
  for(let row=0;row<5;row++)for(let i=0;i<(closed?count:count-1);i++){
   const j=(i+1)%count,a=row*count+i,b=row*count+j,c=(row+1)*count+i,d=(row+1)*count+j;
   for(const tri of [[a,c,b],[b,c,d]]){
    const x=tri.reduce((s,k)=>s+positions[k*3],0)/3,z=tri.reduce((s,k)=>s+positions[k*3+2],0)/3;
    if(clear(x,z)&&tri.every(k=>clear(positions[k*3],positions[k*3+2])))indices.push(...tri);
   }
  }
  layout.push({id,positions,colors,indices,edge,normal});
 };
 for(const lake of [...NETWORK_LAKES,{id:'crystal-lake',...LAKE_CENTER,outline:LAKE_OUTLINE}]){
  const edge=lake.outline||networkLakeOutline(lake);strip(lake.id,edge,edge.map(p=>{const x=p.x-lake.x,z=p.z-lake.z,d=Math.hypot(x,z);return{x:x/d,z:z/d};}),true);
 }
 for(const river of [...NETWORK_STREAMS,{id:'main-river',samples:sampleRiverSpline(RIVER_CONTROL_POINTS,240)}])for(const edge of river.banks||streamBanks(river.samples)){
  strip(river.id,edge,edge.map((p,i)=>{const x=p.x-river.samples[i].x,z=p.z-river.samples[i].z,d=Math.hypot(x,z);return{x:x/d,z:z/d};}),false);
 }
 return layout;
}
export function shoreTerrainHeight(x,z){
 if(!Number.isFinite(x)||!Number.isFinite(z))return null;
 if(!grid){grid=new Map();for(const {positions:p,indices} of shoreTerrainLayout())for(let i=0;i<indices.length;i+=3){
  const t=indices.slice(i,i+3).map(k=>({x:p[k*3],y:p[k*3+1],z:p[k*3+2]}));
  for(let gx=Math.floor(Math.min(...t.map(v=>v.x))/16);gx<=Math.floor(Math.max(...t.map(v=>v.x))/16);gx++)for(let gz=Math.floor(Math.min(...t.map(v=>v.z))/16);gz<=Math.floor(Math.max(...t.map(v=>v.z))/16);gz++){const key=gx+':'+gz;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(t);}
 }}
 let h=null;
 for(const [a,b,c] of grid.get(Math.floor(x/16)+':'+Math.floor(z/16))||[]){
  const den=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);if(Math.abs(den)<1e-9)continue;
  const u=((b.z-c.z)*(x-c.x)+(c.x-b.x)*(z-c.z))/den,v=((c.z-a.z)*(x-c.x)+(a.x-c.x)*(z-c.z))/den,w=1-u-v;
  if(u>=-1e-7&&v>=-1e-7&&w>=-1e-7)h=Math.max(h??0,u*a.y+v*b.y+w*c.y);
 }return h;
}
