// Shared world geography: north is negative Z; the original downtown stays at spawn.
export const CITY_WORLD_SCALE=2;
export const CITY_REGION_BOUNDS={minX:-1400,maxX:1400,minZ:-2320,maxZ:760};
export const CITY_COAST=[[-310,300],[-470,220],[-560,70],[-585,-140],[-510,-340],[-550,-540],[-470,-760],[-340,-970],[-160,-1110],[70,-1140],[300,-1040],[440,-880],[520,-650],[500,-430],[575,-200],[555,30],[450,210],[270,310],[40,350]].map(([x,z])=>[x*CITY_WORLD_SCALE,z*CITY_WORLD_SCALE]);
export const CITY_INLAND_LAKE={x:160,z:-1310,rx:246,rz:184};
export const CITY_LAKE_OUTLINE=Array.from({length:80},(_,i)=>{
 const a=i*Math.PI/40,r=.86+.075*Math.sin(a*3+.4)+.045*Math.cos(a*7);
 return [CITY_INLAND_LAKE.x+Math.cos(a)*CITY_INLAND_LAKE.rx*r,CITY_INLAND_LAKE.z+Math.sin(a)*CITY_INLAND_LAKE.rz*r];
});
export const CITY_AIRPORT_RUNWAY={x:-700,z:476,width:340,depth:26};
export const CITY_BIOMES=[
 {id:'hills',color:'#53634c',points:[[-380,-470],[-220,-480],[-80,-400],[40,-260],[-200,-240],[-370,-290]]},
 {id:'desert',color:'#9b8b68',points:[[160,-820],[350,-800],[440,-660],[400,-460],[190,-470],[220,-660]]},
 {id:'north-forest',color:'#3d574b',points:[[-300,-930],[-160,-1050],[40,-1070],[100,-910],[-80,-870]]},
 {id:'north-range',color:'#707568',points:[[-450,-720],[-370,-880],[-200,-850],[-150,-720],[-220,-600],[-370,-550]]},
].map(b=>({...b,points:b.points.map(([x,z])=>[x*CITY_WORLD_SCALE,z*CITY_WORLD_SCALE])}));
export const CITY_REGION_DISTRICTS=[
 {id:'west-coast',label:'Bãi biển West Coast',x:-390,z:-120,color:'#76abb7'},
 {id:'hills',label:'Đồi Vinewood',x:-170,z:-355,color:'#728765'},
 {id:'sandy-town',label:'Thị trấn Sandy',x:265,z:-570,color:'#b49c79'},
 {id:'lake-county',label:'Hồ Inland',x:80,z:-545,color:'#538f9e'},
 {id:'north-town',label:'Thị trấn North Bay',x:-65,z:-950,color:'#829e96'},
 {id:'mountains',label:'Dãy núi phía Bắc',x:-205,z:-760,color:'#8b9387'},
 {id:'east-port',label:'Cảng East Docks',x:385,z:145,color:'#9a9d9f'},
 {id:'south-airport',label:'Sân bay quốc tế',x:-340,z:145,color:'#a0a6b0'},
].map(d=>({...d,x:d.x*CITY_WORLD_SCALE,z:d.z*CITY_WORLD_SCALE}));
const paths=[
 ['coastal-freeway',14,[[-210,130],[-330,85],[-420,-60],[-430,-250],[-390,-425],[-400,-610],[-310,-810],[-170,-960],[-65,-990],[110,-1000],[290,-860],[370,-670],[390,-450],[420,-240],[380,-60],[210,0]]],
 ['county-highway',12,[[0,-210],[-20,-300],[20,-420],[170,-490],[265,-540],[320,-640],[290,-860]]],
 ['lake-west-route',8,[[-20,-300],[-170,-390],[-225,-550],[-205,-720],[-170,-960]]],
 ['north-crossing',9,[[-310,-810],[-180,-850],[-65,-850],[95,-860],[290,-860]]],
 ['airport-link',11,[[-210,130],[-290,130],[-340,145],[-420,145],[-420,-60]]],
 ['port-link',12,[[210,130],[290,160],[385,160],[445,80],[380,-60]]],
 ['vinewood-avenue',9,[[-210,-130],[-310,-210],[-285,-315],[-170,-390],[-20,-300],[130,-210]]],
 ['sandy-main',9,[[170,-490],[265,-490],[355,-530],[390,-450]]],
 ['bay-main',9,[[-170,-960],[-170,-900],[-65,-900],[40,-930],[110,-1000]]],
].map(([id,width,points])=>[id,width*1.3,points.map(([x,z])=>[x*CITY_WORLD_SCALE,z*CITY_WORLD_SCALE])]);
paths.push(
 ['downtown-north',16,[[0,-210],[0,-320],[0,-420]]],
 ['downtown-west',14,[[-210,130],[-290,170],[-420,260]]],
 ['downtown-east',14,[[210,130],[300,185],[420,260]]],
 ['east-express',14,[[210,0],[315,0],[420,0]]],
 ['west-express',14,[[-210,-130],[-315,-170],[-420,-260]]],
 ['south-ring',16,[[-420,260],[-300,355],[-130,420],[130,420],[300,355],[420,260]]],
 ['south-connector',12,[[0,210],[0,320],[0,420]]],
 ['lake-east-drive',10,[[340,-980],[470,-1040],[520,-1170],[570,-1280],[640,-1280]]],
 ['desert-airstrip',8,[[640,-1280],[740,-1340]]],
);
for(const [id,cx,cz] of [['north',0,-420],['west',-420,260],['east',420,260]]){
 const loop=Array.from({length:25},(_,i)=>[cx+42*Math.cos(i*Math.PI/12),cz+42*Math.sin(i*Math.PI/12)]);
 paths.push([`interchange-${id}`,7,loop]);
}
function roadCurve(points){
 const result=[];
 for(let i=0;i<points.length-1;i++){
  const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
  for(let sample=0;sample<3;sample++){
   const t=sample/3,t2=t*t,t3=t2*t;
   result.push([0,1].map(k=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3)));
  }
 }
 result.push(points[points.length-1]);return result;
}
export const CITY_REGION_ROADS=paths.map(([route,width,points])=>[route,width,width>=10&&points.length>2?roadCurve(points):points]).flatMap(([route,width,points])=>points.slice(1).map(([x2,z2],i)=>{
 const [x1,z1]=points[i];return{id:`region-${route}-${i}`,route,width,x1,z1,x2,z2,x:(x1+x2)/2,z:(z1+z2)/2,length:Math.hypot(x2-x1,z2-z1),diagonal:true};
}));
export function insideCityCoast(x,z){let inside=false;for(let i=0,j=CITY_COAST.length-1;i<CITY_COAST.length;j=i++){
 const [a,b]=CITY_COAST[i],[c,d]=CITY_COAST[j];if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)inside=!inside;
}return inside;}
export function insideCityLake(x,z,margin=0){
 let inside=false;
 for(let i=0,j=CITY_LAKE_OUTLINE.length-1;i<CITY_LAKE_OUTLINE.length;j=i++){
  const [a,b]=CITY_LAKE_OUTLINE[i],[c,d]=CITY_LAKE_OUTLINE[j];
  if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)inside=!inside;
  if(margin>0&&distanceToCityRoad(x,z,{x1:a,z1:b,x2:c,z2:d})<margin)return true;
 }
 return inside;
}
export function distanceToCityRoad(x,z,r){const dx=r.x2-r.x1,dz=r.z2-r.z1,t=Math.max(0,Math.min(1,((x-r.x1)*dx+(z-r.z1)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-r.x1-t*dx,z-r.z1-t*dz);}
const settlements=[
 {id:'coast',x:-335,z:-90,nx:7,nz:12,step:22,height:12},
 {id:'vinewood',x:-180,z:-310,nx:13,nz:6,step:23,height:8},
 {id:'sandy',x:285,z:-560,nx:9,nz:9,step:21,height:5},
 {id:'bay',x:-60,z:-955,nx:12,nz:6,step:20,height:7},
 {id:'port',x:365,z:125,nx:7,nz:6,step:23,height:8},
 {id:'airport',x:-350,z:180,nx:6,nz:3,step:24,height:7},
 {id:'eastside',x:330,z:-155,nx:8,nz:12,step:21,height:13},
].map(s=>({...s,x:s.x*CITY_WORLD_SCALE,z:s.z*CITY_WORLD_SCALE,nx:s.nx*2,nz:s.nz*2}));
settlements.push(
 {id:'midtown',x:0,z:-340,nx:22,nz:8,step:23,height:24},
 {id:'west-metro',x:-355,z:-35,nx:10,nz:18,step:23,height:18},
 {id:'east-metro',x:355,z:-80,nx:10,nz:17,step:23,height:16},
 {id:'south-metro',x:0,z:340,nx:25,nz:8,step:23,height:13},
);
const neighborhoodPlans={
 coast:{angle:.17,style:'apartment'},vinewood:{angle:-.26,style:'villa'},
 sandy:{angle:.12,style:'bungalow'},bay:{angle:-.16,style:'bungalow'},
 port:{angle:0,style:'warehouse'},airport:{angle:0,style:'warehouse'},
 eastside:{angle:-.12,style:'apartment'},midtown:{angle:.08,style:'tower'},
 'west-metro':{angle:.12,style:'apartment'},'east-metro':{angle:-.1,style:'apartment'},
 'south-metro':{angle:0,style:'apartment'},
};
for(const s of settlements)Object.assign(s,neighborhoodPlans[s.id]);
const districtPoint=(s,x,z)=>({x:s.x+x*Math.cos(s.angle)-z*Math.sin(s.angle),z:s.z+x*Math.sin(s.angle)+z*Math.cos(s.angle)});
const drySegment=(a,b)=>Array.from({length:61},(_,i)=>({x:a.x+(b.x-a.x)*i/60,z:a.z+(b.z-a.z)*i/60})).every(p=>insideCityCoast(p.x,p.z)&&!insideCityLake(p.x,p.z,6));
function localStreet(s,id,x1,z1,x2,z2,width=5){
 const a=districtPoint(s,x1,z1),b=districtPoint(s,x2,z2);
 if(!drySegment(a,b))return;
 CITY_REGION_ROADS.push({id:`region-${s.id}-local-${id}`,route:s.id,width,x1:a.x,z1:a.z,x2:b.x,z2:b.z,x:(a.x+b.x)/2,z:(a.z+b.z)/2,length:Math.hypot(b.x-a.x,b.z-a.z),diagonal:true});
}
// Local streets run between rows, with matching geometry in 2D and 3D.
for(const s of settlements){
 for(let row=0;row<s.nz-1;row+=2){
  const z=(row-(s.nz-1)/2+.5)*s.step;
  localStreet(s,`street-${row}`,-s.nx*s.step/2,z,s.nx*s.step/2,z,s.style==='warehouse'?8:5);
 }
 for(let column=1;column<s.nx-1;column+=4){
  const x=(column-(s.nx-1)/2+.5)*s.step;
  localStreet(s,`avenue-${column}`,x,-s.nz*s.step/2,x,s.nz*s.step/2);
 }
}
export const CITY_REGION_BUILDINGS=[];
for(const s of settlements)for(let i=0;i<s.nx;i++)for(let j=0;j<s.nz;j++){
 const {x,z}=districtPoint(s,(i-(s.nx-1)/2)*s.step,(j-(s.nz-1)/2)*s.step);
 if(Math.abs(x)<247&&z>-247&&z<247)continue;
 if(!insideCityCoast(x-10,z-10)||!insideCityCoast(x+10,z+10)||insideCityLake(x,z,20))continue;
 if(Math.abs(x-CITY_AIRPORT_RUNWAY.x)<CITY_AIRPORT_RUNWAY.width/2+12&&Math.abs(z-CITY_AIRPORT_RUNWAY.z)<CITY_AIRPORT_RUNWAY.depth/2+12)continue;
 if(CITY_REGION_ROADS.some(r=>distanceToCityRoad(x,z,r)<r.width/2+8))continue;
 if(CITY_REGION_BUILDINGS.some(b=>Math.abs(x-b.x)<(b.width+14)/2+2&&Math.abs(z-b.z)<(b.depth+14)/2+2))continue;
 const residential=s.style==='villa'||s.style==='bungalow';
 CITY_REGION_BUILDINGS.push({id:`region-building-${s.id}-${i}-${j}`,x,z,width:residential?9+i%3:11+i%3,depth:residential?10+j%3:11+j%3,height:s.style==='tower'?30+((i*7+j*3)%6)*10:residential?4+(i+j)%3:s.style==='warehouse'?7+(i+j)%4:s.height+(i*7+j*3)%14,palette:residential?['plaster','sandstone','brick'][(i+j)%3]:s.style==='warehouse'?'concrete':['silver','concrete','sandstone','brick','navy'][(i+j)%5],district:s.id,style:s.style,rotation:-s.angle});
}
export const CITY_REGION_MOUNTAINS=[
 {x:-290,z:-680,radius:77,height:115},{x:-300,z:-540,radius:61,height:75},
 {x:-340,z:-755,radius:58,height:140},{x:-215,z:-800,radius:73,height:175},
 {x:-60,z:-1090,radius:47,height:92},{x:65,z:-1060,radius:52,height:110},
 {x:210,z:-960,radius:47,height:95},{x:440,z:-740,radius:47,height:115},
 {x:445,z:-600,radius:43,height:85},
].map(m=>({...m,x:m.x*CITY_WORLD_SCALE,z:m.z*CITY_WORLD_SCALE,radius:m.radius*1.5,height:m.height*1.7})).filter(m=>!CITY_REGION_ROADS.some(r=>distanceToCityRoad(m.x,m.z,r)<m.radius+r.width/2+5)&&!CITY_REGION_BUILDINGS.some(b=>Math.hypot(m.x-b.x,m.z-b.z)<m.radius+12));
