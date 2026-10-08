import assert from 'node:assert/strict';
import {MINIMAP_RADIUS,MINIMAP_SCALE,MINIMAP_ROADS,MINIMAP_PARCELS,MINIMAP_POIS,minimapHeading,projectMapPoint,selectMinimapMarkers} from '../src/game/world/minimapLayout.js';
import {WORLD_VILLAGES} from '../shared/villageLayout.js';
import {beachRoadSegments} from '../shared/beachConfig.js';
import {VENUE_LAYOUT} from '../shared/venueLayout.js';
const origin={x:0,z:0};
for(const [yaw,heading] of [[0,180],[Math.PI/2,90],[Math.PI,0],[-Math.PI/2,270]])assert.ok(Math.abs(minimapHeading(yaw)-heading)<1e-8);
const far={x:2000,z:-2000};
const terrain=projectMapPoint(far,origin),pin=projectMapPoint(far,origin,true);
assert.ok(terrain.x>100 && terrain.y<0,'terrain never clamps onto visible map');
assert.equal(terrain.isClamped,false);
assert.ok(Math.abs(Math.hypot(pin.x-50,pin.y-50)-MINIMAP_RADIUS)<1e-8);
assert.equal(pin.isClamped,true);
assert.equal(projectMapPoint({x:0,z:10},origin).y,50+10*MINIMAP_SCALE);
for(const player of [origin,{x:0,z:320},{x:145,z:2},...WORLD_VILLAGES.map(v=>({x:v.x,z:v.z}))]){
 const nodes=selectMinimapMarkers(player,{...far,id:'home'},{...far,id:'goal'});
 assert.equal(nodes[0].kind,'objective');
 const home=nodes.find(p=>p.kind==='home');assert.ok(home);
 assert.equal(home.bearing,nodes[0].bearing,'collision offset preserves true destination bearing');
 assert.ok(nodes.filter(p=>p.kind==='poi').length<=4);
 assert.ok(nodes.filter(p=>p.kind==='poi').every(p=>!p.isClamped));
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++)assert.ok(Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y)>=13);
}
assert.equal(selectMinimapMarkers(origin,{x:NaN,z:0},{x:0,z:Infinity}).some(p=>p.kind!=='poi'),false);
assert.equal(MINIMAP_PARCELS.length,24*WORLD_VILLAGES.length);
for(const road of beachRoadSegments())assert.ok(MINIMAP_ROADS.some(r=>r.id===road.id&&r.x===road.x&&r.z===road.z&&r.length===road.length));
for(const [id,venue] of Object.entries(VENUE_LAYOUT))assert.ok(MINIMAP_POIS.some(p=>p.id===id&&p.x===venue.entrance.x&&p.z===venue.entrance.z));
console.log('PASS: north-up headings, unclamped terrain, rim navigation, collision priorities, 12 village layouts and coastal roads');
