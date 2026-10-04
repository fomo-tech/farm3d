import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { COASTAL_BUS_CONFIG as config, beachWaterAt, beachRoadAt } from '../shared/beachConfig.js';
let samples=0;
for(let i=0;i<config.waypoints.length;i++) {
  const [ax,az]=config.waypoints[i], [bx,bz]=config.waypoints[(i+1)%config.waypoints.length];
  const count=Math.ceil(Math.hypot(bx-ax,bz-az));
  for(let k=0;k<=count;k++) {
    const t=count?k/count:0,x=ax+(bx-ax)*t,z=az+(bz-az)*t;
    assert.equal(beachWaterAt(x,z,6),false,`Bus footprint enters ocean at ${x},${z}`);
    if(z>=278) assert.equal(beachRoadAt(x,z),true,`Bus leaves road at ${x},${z}`);
    samples++;
  }
}
assert.equal(beachWaterAt(config.shelter.x,config.shelter.z,4),false);
for(const index of Object.values(config.stops)) assert.ok(config.waypoints[index]);
const source=await readFile(new URL('../src/game/transport/createBusRoute.js',import.meta.url),'utf8');
assert.match(source,/COASTAL_BUS_CONFIG.waypoints.map/);
console.log(`PASS: ${samples} coastal bus route samples, full bus footprint outside sea, stops match new route`);
