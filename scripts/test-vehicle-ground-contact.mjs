import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { createVehicleRigs } from '../src/game/player/createVehicleRigs.js';
import { VEHICLE_LIST } from '../shared/vehicleConfig.js';
const engine = new NullEngine(), scene = new Scene(engine);
const parent = new TransformNode('ground-test', scene);
const rigs = createVehicleRigs(scene, parent);
const point = new Vector3(), world = new Vector3();
for (const vehicle of VEHICLE_LIST.filter(vehicle => !['walk','hoverboard'].includes(vehicle.id))) {
  rigs.setVehicle(vehicle.id);
  const tires = scene.meshes.filter(mesh => mesh.isEnabled() && /tire|skate-wheel-\d/.test(mesh.name));
  assert.ok(tires.length);
  for (const ground of [0, 2.5, 32]) {
    parent.position.y = ground;
    for (let frame = 0; frame < 180; frame++) {
      rigs.update(1/60, frame < 140, 10, frame < 70 ? 1 : -1);
      parent.computeWorldMatrix(true);
      for (const tire of tires) {
        const matrix = tire.computeWorldMatrix(true);
        const vertices = tire.getVerticesData('position');
        for (let index = 0; index < vertices.length; index += 3) {
          point.set(vertices[index],vertices[index+1],vertices[index+2]);
          Vector3.TransformCoordinatesToRef(point,matrix,world);
          assert.ok(world.y >= ground - 0.00001, `${vehicle.id}/${tire.name} penetrates ground: ${world.y-ground}`);
        }
      }
    }
  }
  rigs.setVehicle('walk');
}
rigs.dispose(); scene.dispose(); engine.dispose();
console.log('PASS: six wheeled vehicles, actual tire vertices above surface through turns, suspension, stop and elevated ground');
