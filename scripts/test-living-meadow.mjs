import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { createRuntimeAudit } from '../src/game/rendering/RuntimeAudit.js';
import { createLivingMeadowSteps, livingMeadowPlacements } from '../src/game/world/createLivingMeadow.js';
import { isPointOnRoadCorridor } from '../src/game/world/RoadSafetyZone.js';
import { isPointInsideAnyFarmLot } from '../src/game/world/FarmSafetyZone.js';

const points = [...livingMeadowPlacements()];
assert.deepEqual(points, [...livingMeadowPlacements()]);
assert.ok(points.length > 1000);
for (const point of points) {
  assert.ok(!isPointOnRoadCorridor(point.x,point.z,3));
  assert.ok(!isPointInsideAnyFarmLot(point.x,point.z,2));
  assert.ok(Math.hypot(point.x-167,point.z-2) >= 65);
}
const engine = new NullEngine();
const scene = new Scene(engine);
const build = options => {
  const steps = createLivingMeadowSteps(scene,options);
  let result;
  do { result = steps.next(); } while (!result.done);
  return result.value;
};
const meadow = build({});
assert.equal(meadow.getStats().instances,points.length);
assert.ok(scene.meshes.every(m => m.thinInstanceCount > 0 && !m.checkCollisions && !m.isPickable));
meadow.update(1,points[0]);
assert.ok(meadow.getStats().visibleBatches > 0);
assert.ok(meadow.getStats().visibleBatches < meadow.getStats().batches / 2);
meadow.update(1,{x:10000,z:10000});
assert.equal(meadow.getStats().visibleBatches,0);
meadow.dispose();
assert.equal(scene.meshes.length,0);
const mobile = build({mobile:true});
assert.ok(mobile.getStats().instances < points.length*.6);
mobile.dispose(); scene.dispose(); engine.dispose();
const audit = createRuntimeAudit('test-page');
for (let i=0;i<30;i++) audit.record('world-created');
assert.equal(audit.snapshot().pageId,'test-page');
assert.equal(audit.snapshot().counts['world-created'],30);
assert.equal(audit.snapshot().events.length,8);
console.log(`PASS: ${points.length} deterministic meadow instances, road/parcel/lake clearance, bounded chunks, mobile density, disposal and runtime audit`);
