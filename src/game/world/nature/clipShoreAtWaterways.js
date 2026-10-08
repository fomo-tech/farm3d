import {beachWaterAt} from '../../../../shared/beachConfig.js';
import {NETWORK_WATER_SHAPES,streamBanks,pointInWaterPolygon} from '../../../../shared/waterNetwork.js';
import {RIVER_CONTROL_POINTS,sampleRiverSpline} from '../../../../shared/riverLayout.js';
import {LAKE_OUTLINE} from '../../../../shared/lakeConfig.js';
const banks=streamBanks(sampleRiverSpline(RIVER_CONTROL_POINTS,110));
const shapes=[...NETWORK_WATER_SHAPES,{id:'main-river',outline:[...banks[0],...banks[1].slice().reverse()]},{id:'crystal-lake',outline:LAKE_OUTLINE}].map(s=>({...s,minX:Math.min(...s.outline.map(p=>p.x)),maxX:Math.max(...s.outline.map(p=>p.x)),minZ:Math.min(...s.outline.map(p=>p.z)),maxZ:Math.max(...s.outline.map(p=>p.z))}));
export function otherWaterAt(x,z,ownId){return (ownId!=='ocean'&&beachWaterAt(x,z))||shapes.some(s=>s.id!==ownId&&x>=s.minX&&x<=s.maxX&&z>=s.minZ&&z<=s.maxZ&&pointInWaterPolygon(x,z,s.outline));}
// Remove bank triangles at confluences instead of drawing a sand/stone dam over water.
export function clipShoreAtWaterways(mesh,ownId){
 const p=mesh.getVerticesData('position'),indices=mesh.getIndices(),kept=[];
 if(!p||!indices)return;
 for(let i=0;i<indices.length;i+=3){const a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3;
  const cut=otherWaterAt(p[a],p[a+2],ownId)||otherWaterAt(p[b],p[b+2],ownId)||otherWaterAt(p[c],p[c+2],ownId)||otherWaterAt((p[a]+p[b]+p[c])/3,(p[a+2]+p[b+2]+p[c+2])/3,ownId);
  if(!cut)kept.push(indices[i],indices[i+1],indices[i+2]);
 }
 mesh.setIndices(kept);mesh.metadata={...mesh.metadata,shoreWaterId:ownId};
}
