import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { createCountryRoad, createModernBoulevard, createZebraCrosswalk } from '../src/game/world/createModernRoadSystem.js';

const engine = new NullEngine();
function geometry(meshes) {
  return meshes.flatMap(mesh => {
    const matrix = mesh.computeWorldMatrix(true);
    const positions = mesh.getVerticesData('position');
    const result = [];
    for (let i = 0; i < positions.length; i += 3) {
      const point = Vector3.TransformCoordinates(new Vector3(...positions.slice(i, i + 3)), matrix);
      result.push([point.x, point.y, point.z]);
    }
    return result;
  }).sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
}
for (const builder of [createCountryRoad, createModernBoulevard, createZebraCrosswalk]) {
  const desktop = new Scene(engine), mobile = new Scene(engine);
  mobile.metadata = { mobile: true };
  const options = { id: 'parity', x: 35, z: 70, length: 1360, width: 8.5, isNorthSouth: false,
    hasStreetLamps: false, intersections: [{ pos: 100, width: 20 }, { pos: -100, width: 15 }] };
  builder(desktop, options); builder(mobile, options);
  const prefix = builder === createZebraCrosswalk ? 'cross-stone-' : 'dash-';
  const originals = desktop.meshes.filter(mesh => mesh.name.startsWith(prefix));
  const batches = mobile.meshes.filter(mesh => mesh.name.startsWith(prefix));
  assert.ok(originals.length > 1);
  assert.equal(batches.length, 1, 'mobile markings must allocate just one mesh per road');
  const actual = geometry(batches), expected = geometry(originals);
  assert.equal(actual.length, expected.length);
  actual.forEach((point, i) => point.forEach((value, axis) =>
    assert.ok(Math.abs(value - expected[i][axis]) < 0.0001, 'batch must preserve geometry within GPU float precision')));
  assert.equal(batches[0].getTotalIndices(), originals.reduce((sum, mesh) => sum + mesh.getTotalIndices(), 0));
  if (builder !== createZebraCrosswalk) {
    const oldBorders = desktop.meshes.filter(m => /^(curb-|sidewalk-|outer-trim-|walk-trim-)/.test(m.name));
    const newBorders = mobile.meshes.filter(m => m.name.startsWith('road-border-batch-') || /^(curb-|sidewalk-|outer-trim-|walk-trim-)/.test(m.name));
    assert.ok(newBorders.length < oldBorders.length, 'road borders must release redundant mesh objects');
    const before = geometry(oldBorders), after = geometry(newBorders);
    assert.equal(after.length, before.length, 'curbs and pavements retain their vertices');
    assert.equal(newBorders.reduce((sum,m)=>sum+m.getTotalIndices(),0), oldBorders.reduce((sum,m)=>sum+m.getTotalIndices(),0));
    // Quantized ordering prevents equivalent float32 positions swapping order.
    const order = points => points.sort((a,b) => {
      for (let axis=0;axis<3;axis++) { const diff=Math.round(a[axis]*1000)-Math.round(b[axis]*1000); if(diff) return diff; }
      return 0;
    });
    order(before); order(after);
    after.forEach((point,i) => point.forEach((value,axis) => assert.ok(Math.abs(value-before[i][axis]) < 0.0001)));
  }
  desktop.dispose(); mobile.dispose();
}
engine.dispose();
console.log('PASS: mobile road/crosswalk batches preserve all vertices, triangles, transforms and intersection gaps');
