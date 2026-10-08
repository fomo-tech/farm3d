import {sampleRiverSpline} from './riverLayout.js';
export const NETWORK_LAKES = Object.freeze([
 {id:'pine',label:'Hồ Thông Xanh',x:120,z:-540,rx:64,rz:45,phase:.3,angle:-.18},
 {id:'mist',label:'Hồ Sương Mai',x:445,z:-455,rx:72,rz:57,phase:1.1,angle:.16},
 {id:'reed',label:'Hồ Lau Trắng',x:-450,z:-455,rx:72,rz:55,phase:2,angle:-.08},
 {id:'lotus',label:'Hồ Sen',x:-450,z:10,rx:72,rz:48,phase:2.7,angle:.08},
]);
export const NETWORK_BRANCHES = Object.freeze([
 {id:'pine-stream',points:[{x:219,z:-545,w:18},{x:194,z:-525,w:19},{x:166,z:-530,w:26},{x:135,z:-540,w:34}]},
 {id:'mist-stream',points:[{x:215,z:-480,w:17},{x:251,z:-488,w:16},{x:300,z:-470,w:18},{x:353,z:-465,w:24},{x:410,z:-455,w:38}]},
 {id:'north-tributary',points:[{x:-425,z:-468,w:32},{x:-380,z:-485,w:23},{x:-300,z:-495,w:18},{x:-210,z:-520,w:20},{x:-105,z:-510,w:22},{x:0,z:-520,w:20},{x:85,z:-540,w:34}]},
 {id:'western-river',points:[{x:-450,z:-430,w:34},{x:-468,z:-355,w:21},{x:-450,z:-234,w:20},{x:-430,z:-130,w:24},{x:-443,z:-60,w:25},{x:-450,z:0,w:36}]},
 {id:'crystal-tributary',points:[{x:115,z:-520,w:30},{x:105,z:-430,w:18},{x:140,z:-320,w:19},{x:140,z:-234,w:20},{x:155,z:-140,w:24},{x:167,z:-42,w:34}]},
]);
export const NETWORK_BRIDGES=Object.freeze([
 {id:'network-east-bridge',cx:300,cz:-470,width:8,span:40,deckY:.18},
 {id:'network-northwest-bridge',cx:-300,cz:-495,width:8,span:40,deckY:.18},
 {id:'network-north-bridge',cx:0,cz:-520,width:9,span:44,deckY:.18},
 {id:'network-west-bridge',cx:-450,cz:-234,width:9,span:44,deckY:.18,axis:'x'},
 {id:'network-crystal-bridge',cx:140,cz:-234,width:9,span:44,deckY:.18,axis:'x'},
]);
export const networkBridgeAt=(x,z,margin=0)=>NETWORK_BRIDGES.find(b=>Math.abs(x-b.cx)<=(b.axis==='x'?b.span:b.width)/2+margin&&Math.abs(z-b.cz)<=(b.axis==='x'?b.width:b.span)/2+margin)||null;
export function streamBanks(samples,extra=0){
 const bank=side=>samples.map((p,i)=>{const a=samples[Math.max(0,i-1)],b=samples[Math.min(samples.length-1,i+1)],dx=b.x-a.x,dz=b.z-a.z,n=Math.hypot(dx,dz)||1;return{x:p.x-side*dz/n*(p.w/2+extra),z:p.z+side*dx/n*(p.w/2+extra)};});
 return [bank(1),bank(-1)];
}
export const NETWORK_STREAMS=NETWORK_BRANCHES.map(b=>{const samples=sampleRiverSpline(b.points,Math.max(48,b.points.length*14)),banks=streamBanks(samples);return{...b,samples,banks,outline:[...banks[0],...banks[1].slice().reverse()]};});
export function networkLakeOutline(lake,extra=0){return Array.from({length:96},(_,i)=>{
 const a=i*Math.PI/48,r=1+.16*Math.sin(3*a+lake.phase)+.09*Math.cos(2*a-lake.phase)+.035*Math.sin(5*a+.5);
 const x=Math.cos(a)*(lake.rx+extra)*r,z=Math.sin(a)*(lake.rz+extra)*r,c=Math.cos(lake.angle||0),s=Math.sin(lake.angle||0);
 return{x:lake.x+x*c-z*s,z:lake.z+x*s+z*c};
});}
export const NETWORK_WATER_SHAPES=[...NETWORK_LAKES.map(l=>({...l,kind:'lake',outline:networkLakeOutline(l)})),...NETWORK_STREAMS.map(s=>({...s,kind:'river'}))].map(s=>({...s,bounds:{minX:Math.min(...s.outline.map(p=>p.x)),maxX:Math.max(...s.outline.map(p=>p.x)),minZ:Math.min(...s.outline.map(p=>p.z)),maxZ:Math.max(...s.outline.map(p=>p.z))}}));
export function pointInWaterPolygon(x,z,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)inside=!inside;}return inside;}
export function networkWaterAt(x,z,margin=0){
 for(const shape of NETWORK_WATER_SHAPES){const b=shape.bounds;if(x<b.minX-margin||x>b.maxX+margin||z<b.minZ-margin||z>b.maxZ+margin)continue;const pts=shape.outline;if(pointInWaterPolygon(x,z,pts))return shape.kind;
 if(margin>0)for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1)));if(Math.hypot(x-a.x-t*dx,z-a.z-t*dz)<=margin)return shape.kind;}}
 return null;
}
// Four-metre cells follow the actual shoreline, rather than blocking the whole lake bounding box.
export function networkCollisionBoxes(){
 const cells=new Set(),boxes=[];
 for(const shape of NETWORK_WATER_SHAPES){const b=shape.bounds;
  for(let x=Math.floor(b.minX/4)*4;x<b.maxX;x+=4)for(let z=Math.floor(b.minZ/4)*4;z<b.maxZ;z+=4){
   const key=`${x}:${z}`;if(cells.has(key)||!networkWaterAt(x+2,z+2)||networkBridgeAt(x+2,z+2,2))continue;
   cells.add(key);boxes.push({id:`water-network-${x}-${z}`,minX:x,maxX:x+4,minZ:z,maxZ:z+4});
  }
 }
 // Merge adjacent cells along each row without enlarging the blocked footprint.
 const rows=new Map();for(const box of boxes){if(!rows.has(box.minZ))rows.set(box.minZ,[]);rows.get(box.minZ).push(box);}
 const merged=[];for(const row of rows.values()){row.sort((a,b)=>a.minX-b.minX);let run;for(const box of row){if(run&&run.maxX===box.minX)run.maxX=box.maxX;else{run={...box};merged.push(run);}}}
 return merged;
}

export function networkLakeVisitPoint(lake){const edge=networkLakeOutline(lake).reduce((a,b)=>b.x<a.x?b:a);return{x:edge.x-6,z:edge.z};}
