import {Mesh} from '@babylonjs/core/Meshes/mesh.js';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData.js';
import {Vector3} from '@babylonjs/core/Maths/math.vector.js';
import {subtractRoadPolygon,polygonArea,roadFootprint} from './roadPolygon.js';
const footprintCache=new WeakMap();

// Geometry is accumulated in buffers: lane dashes do not become separate meshes.
export function createCityRoadSurface(scene,parent,materials,spec,network){
 if(!footprintCache.has(network))footprintCache.set(network,new Map());
 const footprints=footprintCache.get(network);
 const footprint=r=>{if(!footprints.has(r))footprints.set(r,roadFootprint(r,network));return footprints.get(r);};
 const horizontal=spec.axis==='x',length=spec.length||320,width=spec.width||10;
 const cx=spec.centerX??(horizontal?0:spec.coordinate),cz=spec.centerZ??(horizontal?spec.coordinate:0);
 const freeway=spec.roadClass==='freeway';
 const pavement=freeway?0:width>=12?2.4:1.8,groups=new Map();
 const toLocal=(u,v,y)=>horizontal?[cx+u,y,cz+v]:[cx-v,y,cz+u];
 const quad=(material,u1,u2,v1,v2,y,shade=1)=>{
  if(u2-u1<.01||v2-v1<.01)return;
  if(!groups.has(material))groups.set(material,{positions:[],indices:[],normals:[],colors:[]});
  const g=groups.get(material),index=g.positions.length/3;
  for(const [u,v] of [[u1,v1],[u1,v2],[u2,v2],[u2,v1]]){g.positions.push(...toLocal(u,v,y));g.normals.push(0,1,0);g.colors.push(shade,shade,shade,1);}
  g.indices.push(index,index+2,index+1,index,index+3,index+2);
 };
 const curbFace=(u1,u2,v,side)=>{
  const g=groups.get(materials.curb),index=g.positions.length/3,points=[[u1,.08],[u2,.08],[u2,.185],[u1,.185]];
  if(side>0)points.reverse();
  for(const [u,y] of points){g.positions.push(...toLocal(u,v,y));g.normals.push(horizontal?0:side,0,horizontal?-side:0);g.colors.push(.78,.78,.78,1);}
  g.indices.push(index,index+1,index+2,index,index+2,index+3);
 };
 parent.computeWorldMatrix(true);
 const matrix=parent.getWorldMatrix(),origin=Vector3.TransformCoordinates(new Vector3(cx,0,cz),matrix);
 const forward=Vector3.TransformNormal(new Vector3(horizontal?1:0,0,horizontal?0:1),matrix).normalize();
 const junctions=[];
 const normalize=id=>id.replace(/^city-/,'');
 const ownIndex=network.findIndex(r=>normalize(r.id)===normalize(spec.id));
 const surfaceCutters=[];
 const inverse=matrix.clone().invert();
 const toUV=(x,z)=>{const p=Vector3.TransformCoordinates(new Vector3(x,0,z),inverse);return horizontal?[p.x-cx,p.z-cz]:[p.z-cz,cx-p.x];};
 for(const r of network){
  if(r.id==='city-north-flyover')continue;
  const ax=r.x1??r.x-(r.northSouth?0:r.length/2),az=r.z1??r.z-(r.northSouth?r.length/2:0);
  const bx=r.x2??r.x+(r.northSouth?0:r.length/2),bz=r.z2??r.z+(r.northSouth?r.length/2:0);
  const dx=bx-ax,dz=bz-az,otherLength=Math.hypot(dx,dz),det=forward.x*dz-forward.z*dx;
  if(ownIndex>=0&&(network.indexOf(r)<ownIndex||r.id.startsWith('city-waterfront-bridge'))&&otherLength>0){
   const polygon=footprint(r).map(([x,z])=>toUV(x,z));
   const minU=Math.min(...polygon.map(p=>p[0])),maxU=Math.max(...polygon.map(p=>p[0])),minV=Math.min(...polygon.map(p=>p[1])),maxV=Math.max(...polygon.map(p=>p[1]));
   if(maxU>-length/2&&minU<length/2&&maxV>-width/2&&minV<width/2)surfaceCutters.push(polygon);
  }
  if(Math.abs(det)<otherLength*.35)continue;
  const t=((ax-origin.x)*dz-(az-origin.z)*dx)/det,s=((ax-origin.x)*forward.z-(az-origin.z)*forward.x)/det;
  if(s<-.005||s>1.005||Math.abs(t)>length/2+1)continue;
  const half=(r.width/2+pavement+.7)/(Math.abs(det)/otherLength);
  if(!junctions.some(j=>Math.abs(j.t-t)<1))junctions.push({t,half,otherWidth:r.width});
 }
 // The spawn plaza owns this surface, so markings must not paint through it.
 if(Math.abs(origin.x)<24&&Math.abs(origin.z)<24)junctions.push({t:0,half:25,plaza:true});
 const spans=padding=>{
  const cuts=junctions.map(j=>[Math.max(-length/2,j.t-j.half-padding),Math.min(length/2,j.t+j.half+padding)]).sort((a,b)=>a[0]-b[0]);
  let cursor=-length/2;const result=[];
  for(const [a,b] of cuts){if(b<=cursor)continue;if(a>cursor)result.push([cursor,a]);cursor=Math.max(cursor,b);}
  if(cursor<length/2)result.push([cursor,length/2]);return result;
 };
 // Each crossing owns its asphalt once; clip later surfaces instead of stacking
 // coplanar rectangles, which flicker and expose seams as the camera rotates.
 let roadPolygons=[ownIndex>=0?footprint(network[ownIndex]).map(([x,z])=>toUV(x,z)):[[-length/2,-width/2],[length/2,-width/2],[length/2,width/2],[-length/2,width/2]]];
 for(const cutter of surfaceCutters)roadPolygons=roadPolygons.flatMap(p=>subtractRoadPolygon(p,cutter));
 groups.set(materials.road,{positions:[],indices:[],normals:[],colors:[]});
 const asphalt=groups.get(materials.road);
 for(const polygon of roadPolygons){
  if(polygonArea(polygon)<1e-6)continue;
  const offset=asphalt.positions.length/3;
  for(const [u,v] of polygon){asphalt.positions.push(...toLocal(u,v,.08));asphalt.normals.push(0,1,0);asphalt.colors.push(1,1,1,1);}
  for(let i=1;i<polygon.length-1;i++)asphalt.indices.push(offset,offset+i,offset+i+1);
 }
 for(const [a,b] of spans(0))for(const side of [-1,1]){
  const v=side*width/2;
  if(pavement){
   quad(materials.walk,a,b,Math.min(v,v+side*pavement),Math.max(v,v+side*pavement),.16);
   for(let u=a;u<b;u+=3)quad(materials.curb,u,Math.min(b,u+.035),Math.min(v,v+side*pavement),Math.max(v,v+side*pavement),.162);
  }
  quad(materials.curb,a,b,Math.min(v,v+side*.18),Math.max(v,v+side*.18),.185);
  curbFace(a,b,v,side);
 }
 let dashes=0;
 for(const [a,b] of spans(pavement?5:0)){
  if(width>=7)for(const offset of [-.17,.17])quad(materials.lane,a,b,offset-.055,offset+.055,.091);
  for(const side of [-1,1]){
   const edge=side*(width/2-.3);quad(materials.crosswalk,a,b,edge-.055,edge+.055,.092);
   if(width>=12){
    const lane=side*width/4;
    for(let u=Math.ceil(a/8)*8;u<b;u+=8){quad(materials.crosswalk,u,Math.min(b,u+3),lane-.055,lane+.055,.094);dashes++;}
   }
  }
 }
 let crossings=0;
 if(pavement)for(const j of junctions){
  if(j.plaza)continue;
  for(const side of [-1,1]){
   const edge=j.t+side*(j.half+.5);
   if(Math.abs(edge)+5>length/2)continue;
   for(let n=0;n<5;n++){const u=edge+side*n*.8;quad(materials.crosswalk,u-.23,u+.23,-width/2+.5,width/2-.5,.1);}
   const stop=edge+side*4.8;quad(materials.crosswalk,stop-.12,stop+.12,side>0?0:-width/2+.4,side>0?width/2-.4:0,.102);crossings++;
  }
 }
 let roadMesh;
 for(const [material,g] of groups){
  if(!g.indices.length)continue;
  const mesh=new Mesh(`city-road-detail-${spec.id}-${material.name}`,scene),data=new VertexData();
  data.positions=g.positions;data.normals=g.normals;data.indices=g.indices;data.colors=g.colors;data.applyToMesh(mesh);
  mesh.material=material;mesh.parent=parent;mesh.isPickable=false;mesh.receiveShadows=true;
  mesh.metadata={cityRoad:spec.id,roadSurface:true,roadClass:freeway?'freeway':'street',sidewalkWidth:pavement,laneDashes:dashes,crosswalkApproaches:crossings,sourceStart:[origin.x-forward.x*length/2,origin.z-forward.z*length/2],sourceEnd:[origin.x+forward.x*length/2,origin.z+forward.z*length/2]};
  if(material===materials.road)roadMesh=mesh;
 }
 return roadMesh;
}
