import assert from 'node:assert/strict';
import { createLocomotionGait } from '../src/game/player/LocomotionGait.js';

const gait = createLocomotionGait();
let pose;
for (let frame = 0; frame < 240; frame++) {
  pose = gait.update(1 / 60, true, 7);
  assert.ok(Math.abs(pose.hips[0] + pose.hips[1]) < 1e-9);
  assert.ok(pose.hips[0] * pose.arms[0] <= 0, 'Arms counter-swing against legs');
  assert.ok(pose.knees.every(angle => angle >= 0 && angle < 1.5));
  assert.ok(Math.min(...pose.knees) < 1e-9, 'At least one supporting knee stays straight');
  assert.equal(pose.bob, 0, 'Walking does not lift both feet above the ground');
  assert.ok(pose.bob <= .055, 'No exaggerated cartoon bounce');
}
assert.ok(pose.run < .01, 'Walking keeps its own gait');
const phaseBefore = pose.phase;
pose = gait.update(1 / 60, true, 9.45);
const phaseAdvance = (pose.phase - phaseBefore + Math.PI * 2) % (Math.PI * 2);
assert.ok(phaseAdvance < .25, 'Sprint must not reset or teleport stride phase');
assert.ok(pose.run > 0 && pose.run < .3, 'Run pose blends in');
for (let frame = 0; frame < 120; frame++) pose = gait.update(1 / 60, true, 9.45);
assert.ok(pose.run > .99 && pose.lean > .1);
for (let frame = 0; frame < 120; frame++) pose = gait.update(1 / 60, false, 0);
assert.ok(pose.weight < 1e-9 && Math.abs(pose.hips[0]) < 1e-9, 'Stop settles back to idle');

function phaseAtRate(rate) {
  const instance = createLocomotionGait();
  let sample;
  for (let i = 0; i < rate * 4; i++) sample = instance.update(1 / rate, true, 7);
  return sample.phase;
}
assert.ok(Math.abs(phaseAtRate(30) - phaseAtRate(120)) < .16, 'Cadence is stable across frame rates');
const snapshot = JSON.stringify(pose);
gait.update(0, false, 0);
assert.equal(JSON.stringify(pose), snapshot, 'Zero delta does not advance animation');
console.log('Locomotion gait: walk/run, opposing limbs, continuous phase, stop and frame-rate checks passed.');
