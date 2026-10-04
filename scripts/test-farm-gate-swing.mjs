import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { FARM_LOT_SPEC } from '../shared/farmLayout.js';

const source = await readFile(new URL('../src/game/farming/createFarmGateAndMailbox.js', import.meta.url), 'utf8');
assert.match(source, /hinge\.rotation\.y = side \* target/);
assert.match(source, /\(side \* gateAnimation\.target - gateAnimation\.from\[i\]\)/);
assert.doesNotMatch(source, /-side \* (?:target|gateAnimation\.target)/);
const width = FARM_LOT_SPEC.fenceGap / 2;
for (const side of [-1, 1]) {
  const freeEnd = new Vector3(-side * width, 0, 0);
  for (const opening of [0, .25, .5, .75, 1, .75, .5, .25, 0]) {
    const transformed = Vector3.TransformCoordinates(freeEnd, Matrix.RotationY(side * Math.PI / 2 * opening));
    assert.ok(transformed.z >= -1e-8, 'leaf must stay on the farm side throughout opening and closing');
    if (opening === 1) {
      assert.ok(Math.abs(transformed.x) < 1e-8, 'fully open leaf is perpendicular to the fence');
      assert.ok(Math.abs(transformed.z - width) < 1e-8, 'free end points into the farm, not the road');
    }
    if (opening === 0) assert.ok(Math.abs(transformed.z) < 1e-8, 'closed leaf aligns with the fence');
  }
}
console.log('PASS: both leaves swing inward through opening/closing and streamed-state restoration.');
