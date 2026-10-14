import assert from 'node:assert/strict';
import { WorldCollisionSystem } from '../src/game/physics/WorldCollisionSystem.js';
import { BUS_ROUTES, LOCAL_BUS_ROUTES, BACKBONE_BUS_ROUTE } from '../shared/busRoutes.js';
import { BUS_AUTHORITY_ROUTES, nearBusRoute, busRouteForId } from '../shared/busAuthorityConfig.js';
import { WORLD_VILLAGES } from '../shared/villageLayout.js';
import { isPointOnRoadCorridor } from '../src/game/world/RoadSafetyZone.js';
import { beachWaterAt } from '../shared/beachConfig.js';
import { lakeDeepWaterAt } from '../shared/lakeConfig.js';
const collision = new WorldCollisionSystem();
for (let x = -680; x <= 680; x += 5) assert.equal(collision.isColliding(x, -650), false, `northern road stays walkable at ${x}`);
assert.equal(collision.isColliding(-750, -750), true, 'off-road mountain boundary remains solid');
let samples = 0;
for (const [code, route] of Object.entries(BUS_ROUTES)) {
  const approved = BUS_AUTHORITY_ROUTES[code];
  for (let i = 0; i < route.points.length; i++) {
    const [ax, az] = route.points[i], [bx, bz] = route.points[(i + 1) % route.points.length];
    assert.ok(ax === bx || az === bz, `${code}: no diagonal shortcut`);
    const length = Math.hypot(bx - ax, bz - az);
    for (let n = 0; n <= Math.ceil(length); n++) {
      const t = length ? n / Math.ceil(length) : 0, x = ax + (bx - ax) * t, z = az + (bz - az) * t;
      assert.ok(isPointOnRoadCorridor(x, z, 0), `${code}: off road ${x},${z}`);
      assert.equal(beachWaterAt(x, z, 1.8), false, `${code}: ocean ${x},${z}`);
      assert.equal(lakeDeepWaterAt(x, z, 1.8), false, `${code}: lake ${x},${z}`);
      assert.ok(Math.hypot(x, z) >= 49.9, `${code}: pedestrian plaza`);
      assert.ok(nearBusRoute(approved, x, z, .01), `${code}: server mismatch`);
      samples++;
    }
  }
  for (const stop of route.stops) assert.ok(route.points[stop.waypointIndex]);
}
assert.equal(LOCAL_BUS_ROUTES.length, 12);
for (const village of WORLD_VILLAGES) {
  const route = LOCAL_BUS_ROUTES[village.order], approved = BUS_AUTHORITY_ROUTES[route.code];
  assert.ok(busRouteForId(`bus-${route.code}A`));
  for (let row = 0; row <= 6; row++) for (let dx = -60; dx <= 60; dx++) {
    assert.ok(nearBusRoute(approved, village.offsetX + dx, village.offsetZ + 98 + row * 28, .01), `${route.code}: missing crossroad ${row}`);
  }
  for (const dx of [-60, 0, 60]) for (let dz = 86; dz <= 266; dz++) {
    assert.ok(nearBusRoute(approved, village.offsetX + dx, village.offsetZ + dz, .01), `${route.code}: missing ring/spine`);
  }
}
for (let x = -680; x <= 680; x++) assert.ok(nearBusRoute(BUS_AUTHORITY_ROUTES['05'], x, -650, .01));
assert.ok(BACKBONE_BUS_ROUTE.stops.length > 5);
console.log(`PASS: ${Object.keys(BUS_ROUTES).length} routes, ${samples} road samples, all 12 villages / 84 crossroads / rings / spines / northern backbone, shared server corridors, no lake/ocean/plaza shortcuts`);
const { routePlacement, trafficSpeedLimits } = await import('../src/game/transport/busTraffic.js');
const points = [{x:0,z:0},{x:0,z:10},{x:100,z:10},{x:100,z:0}];
assert.deepEqual(routePlacement(points, .25), {initialSegment:1,initialProgress:.45}, 'spacing follows metres rather than waypoint count');
const bus = (x,z,yaw,speed) => ({root:{position:{x,z},rotation:{y:yaw}},getCurrentSpeed:()=>speed});
assert.equal(trafficSpeedLimits([bus(0,0,0,20),bus(0,10,0,0)])[0], 0, 'follower stops before the bus body');
assert.equal(trafficSpeedLimits([bus(0,0,0,20),bus(0,10,Math.PI,20)])[0], Infinity, 'opposite lane does not cause a head-on queue');
assert.equal(trafficSpeedLimits([bus(0,0,0,20),bus(10,10,0,0)])[0], Infinity, 'parallel roads stay independent');
console.log('PASS: metre-based fleet spacing, following clearance and opposite-lane separation');
