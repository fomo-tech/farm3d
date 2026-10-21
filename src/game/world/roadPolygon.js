const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
function halfPlane(poly,a,b,inside){
 const result=[];
 for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],dp=cross(a,b,p),dq=cross(a,b,q);
  const pin=inside?dp>=-1e-8:dp<=1e-8,qin=inside?dq>=-1e-8:dq<=1e-8;
  if(pin)result.push(p);
  if(pin!==qin){const t=dp/(dp-dq);result.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}
 }
 return result;
}
export const polygonArea=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0];},0))/2;
export const roadEndpoints=r=>[
 [r.x1??r.x-(r.northSouth?0:r.length/2),r.z1??r.z-(r.northSouth?r.length/2:0)],
 [r.x2??r.x+(r.northSouth?0:r.length/2),r.z2??r.z+(r.northSouth?r.length/2:0)],
];
export function roadFootprint(road,network){
 const [start,end]=roadEndpoints(road),dx=end[0]-start[0],dz=end[1]-start[1],length=Math.hypot(dx,dz),ux=dx/length,uz=dz/length;
 const corners=(p,atStart)=>{
  let nx=-uz,nz=ux,scale=road.width/2,best=-.25;
  if(road.route)for(const other of network){
   if(other===road||other.id===road.id||other.route!==road.route||Math.abs(other.width-road.width)>.01)continue;
   const [a,b]=roadEndpoints(other),remote=Math.hypot(a[0]-p[0],a[1]-p[1])<.01?b:Math.hypot(b[0]-p[0],b[1]-p[1])<.01?a:null;
   if(!remote)continue;
   let vx=remote[0]-p[0],vz=remote[1]-p[1];if(atStart){vx=-vx;vz=-vz;}
   const l=Math.hypot(vx,vz);vx/=l;vz/=l;const alignment=ux*vx+uz*vz;
   if(alignment<best)continue;
   best=alignment;nx=-uz-vz;nz=ux+vx;const n=Math.hypot(nx,nz);nx/=n;nz/=n;
   scale=Math.min(road.width,road.width/2/(nx*-uz+nz*ux));
  }
  return [[p[0]-nx*scale,p[1]-nz*scale],[p[0]+nx*scale,p[1]+nz*scale]];
 };
 const [sr,sl]=corners(start,true),[er,el]=corners(end,false);
 return [sr,er,el,sl];
}
// Partition the subject outside a convex CCW cutter. Pieces never overlap.
export function subtractRoadPolygon(subject,cutter){
 let remaining=subject;const pieces=[];
 for(let i=0;i<cutter.length&&remaining.length>=3;i++){
  const a=cutter[i],b=cutter[(i+1)%cutter.length];
  const outside=halfPlane(remaining,a,b,false);
  if(outside.length>=3&&polygonArea(outside)>1e-6)pieces.push(outside);
  remaining=halfPlane(remaining,a,b,true);
 }
 return pieces;
}
