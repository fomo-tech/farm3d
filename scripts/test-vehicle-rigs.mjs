import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { createVehicleRigs } from '../src/game/player/createVehicleRigs.js';
import { VEHICLE_MOTION, approachVehicleSpeed } from '../src/game/player/vehicleMotion.js';
import { VEHICLE_LIST } from '../shared/vehicleConfig.js';

const engine = new NullEngine();
const scene = new Scene(engine);
const parent = new TransformNode('vehicle-test', scene);
const counts = () => [scene.meshes.length, scene.transformNodes.length, scene.materials.length];
const baseline = counts();
for (let cycle = 0; cycle < 3; cycle++) {
  const rigs = createVehicleRigs(scene, parent);
  for (const { id } of VEHICLE_LIST.filter(vehicle => vehicle.id !== 'walk')) {
    rigs.setVehicle(id);
    const before = counts();
    rigs.setVehicle(id);
    assert.deepEqual(counts(), before, 'repeated server state must not rebuild vehicle');
    if (id === 'hoverboard') {
      const hover = scene.getTransformNodeByName('vehicle-hoverboard-root');
      rigs.update(0.1, false, 0);
      assert.notEqual(hover.position.y, 0, 'hoverboard has an idle floating animation');
      rigs.setVehicle('walk');
      continue;
    }
    const wheel = scene.transformNodes.find(node => node.name.includes('wheel') && (node.parent?.name === `vehicle-${id}-root` || node.parent?.parent?.name === `vehicle-${id}-root`));
    assert.ok(wheel);
    rigs.update(1 / 60, true, 10, 0.7);
    assert.ok(wheel.rotation.x > 0, 'wheels spin');
    const vehicle = wheel.parent.name === `vehicle-${id}-root` ? wheel.parent : wheel.parent.parent;
    assert.ok(vehicle.rotation.z < 0, 'vehicle leans into turn');
    const stoppedAngle = wheel.rotation.x;
    rigs.update(1 / 60, false, 0);
    assert.equal(wheel.rotation.x, stoppedAngle, 'stopped wheel stays still');
    assert.ok(vehicle.position.y >= 0, 'contact correction never pushes wheel into ground');
    rigs.setVehicle('walk');
    assert.equal(rigs.hasVehicle(), false);
    assert.equal(scene.meshes.length, baseline[0], 'dismount removes vehicle meshes');
  }
  rigs.dispose();
  assert.deepEqual(counts(), baseline, 'no rig/material leak');
}
for (const profile of Object.values(VEHICLE_MOTION)) {
  let speed = 0;
  for (let frame = 0; frame < 120; frame++) speed = approachVehicleSpeed(speed, 14, 1 / 60, profile);
  assert.equal(speed, 14);
  for (let frame = 0; frame < 120; frame++) speed = approachVehicleSpeed(speed, 0, 1 / 60, profile);
  assert.equal(speed, 0);
}
scene.dispose(); engine.dispose();
console.log('PASS: all seven vehicle rigs, wheel spin, turn lean, hovering, acceleration, repeat state and leak-free dismount');
