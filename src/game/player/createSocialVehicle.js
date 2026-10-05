import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { VEHICLES } from '../../../shared/vehicleConfig.js';
import { createToyMaterial } from '../rendering/PlayTogetherTheme.js';
import { createVehiclePanel } from './createVehiclePanel.js';

// Rounded toy silhouettes, not licensed assets. Materials are rig-owned.
export function createSocialVehicle(scene, id, container, materials, wheels, steering) {
  const root = new TransformNode(`vehicle-${id}-root`, scene);
  root.parent = container;
  const paint = materials[`${id}Paint`] || createToyMaterial(scene, `vehicle-${id}-paint`, VEHICLES[id].color, { specularPower: 64, specularLevel: 0.25 });
  materials[`${id}Paint`] = paint;
  function box(name, size, position, material = paint) {
    const mesh = MeshBuilder.CreateBox(`${id}-${name}`, { width: size[0], height: size[1], depth: size[2] }, scene);
    mesh.position.set(...position); mesh.material = material; mesh.parent = root; return mesh;
  }
  function round(name, size, position, material = paint) {
    const mesh = MeshBuilder.CreateSphere(`${id}-${name}`, { diameter: 1, segments: 20 }, scene);
    mesh.scaling.set(...size); mesh.position.set(...position); mesh.material = material; mesh.parent = root; return mesh;
  }
  function panel(name, size, position, material = paint) {
    const mesh = createVehiclePanel(scene, `${id}-${name}`, ...size);
    mesh.position.set(...position); mesh.material = material; mesh.parent = root; return mesh;
  }
  if (id === 'hoverboard') {
    panel('deck', [0.78, 0.18, 1.7], [0, 0.50, 0]);
    box('footpad', [0.5, 0.05, 1.05], [0, 0.59, 0], materials.tire);
    for (const z of [-0.55, 0.55]) {
      const ring = MeshBuilder.CreateTorus(`hoverboard-thruster-${z}`, { diameter: 0.46, thickness: 0.09, tessellation: 24 }, scene);
      ring.position.set(0, 0.36, z); ring.material = materials.neonWheel; ring.parent = root;
    }
    box('light-front', [0.50, 0.035, 0.045], [0, 0.50, 0.83], materials.neonWheel);
    return root;
  }
  const car = id === 'convertible';
  const width = car ? 1.8 : 1.45;
  const length = car ? 2.9 : 2.1;
  panel('lower-body', [width, 0.48, length], [0, 0.58, 0]);
  box('cabin', [width * 0.70, 0.24, 1.15], [0, 0.64, -0.34], materials.scooterSeat);
  panel('hood', [width * 0.86, 0.22, car ? 1.1 : 0.68], [0, 0.88, car ? 0.85 : 0.64]);
  panel('rear-deck', [width * 0.9, 0.20, 0.48], [0, 0.83, -length * 0.39]);
  box('seat', [0.62, 0.15, 0.58], [0, 0.77, -0.32], materials.scooterSeat);
  panel('seat-back', [0.62, 0.54, 0.20], [0, 1.02, -0.65], materials.scooterSeat);
  panel('front-splitter', [width*1.02, 0.08, .32], [0,.39,length*.43], materials.tire);
  box('front-grille', [width*.43,.16,.05], [0,.60,length*.50], materials.tire);
  for (const side of [-1,1]) {
    panel(`side-sill-${side}`, [.10,.12,length*.63], [side*width*.49,.40,0], materials.tire);
    box(`hood-stripe-${side}`, [.07,.018,car ? .88 : .48], [side*.22,.999,car ? .85 : .65], materials.rim);
  }
  if (car) {
    const glass = materials.carGlass || createToyMaterial(scene, 'convertible-windshield', '#627e8d', { specularLevel: 0.15 });
    glass.alpha = 0.46; glass.backFaceCulling = false; materials.carGlass = glass;
    const screen = box('windshield', [1.3, 0.47, 0.055], [0, 1.14, 0.36], glass);
    screen.rotation.x = -0.24;
    for (const x of [-0.69, 0.69]) box(`windshield-frame-${x}`, [0.055, 0.54, 0.06], [x, 1.12, 0.36], materials.rim).rotation.x = -0.24;
    box('windshield-top', [1.44, 0.055, 0.07], [0, 1.39, 0.30], materials.rim);
  } else {
    box('race-stripe', [0.17, 0.025, 0.63], [0, 1.00, 0.66], materials.whiteWall);
    box('rear-spoiler', [1.5, 0.09, 0.27], [0, 1.06, -0.96], materials.whiteWall);
  }
  for (const side of [-1, 1]) {
    panel(`headlamp-${side}`, [0.34, 0.09, 0.07], [side * width * 0.30, 0.73, length * 0.49], materials.headlight);
    round(`taillamp-${side}`, [0.22, 0.12, 0.09], [side * width * 0.30, 0.72, -length * 0.46], materials.tractorBody);
    round(`mirror-${side}`, [0.22, 0.14, 0.20], [side * width * 0.51, 1.03, 0.13], materials.rim);
    for (const axle of [-1, 1]) {
      const pivot = new TransformNode(`${id}-steering-${side}-${axle}`, scene);
      pivot.position.set(side * width * 0.48, 0.35, axle * length * 0.30); pivot.parent = root;
      if (axle === 1) steering.push(pivot);
      const wheel = new TransformNode(`${id}-wheel-${side}-${axle}`, scene);
      wheel.parent = pivot; wheel.metadata = { radius: 0.35 };
      const tire = MeshBuilder.CreateCylinder(`${id}-tire-${side}-${axle}`, { diameter: 0.70, height: 0.23, tessellation: 24 }, scene);
      tire.rotation.z = Math.PI / 2; tire.material = materials.tire; tire.parent = wheel;
      const hub = MeshBuilder.CreateCylinder(`${id}-hub-${side}-${axle}`, { diameter: 0.43, height: 0.245, tessellation: 20 }, scene);
      hub.rotation.z = Math.PI / 2; hub.material = materials.rim; hub.parent = wheel;
      for (let spoke = 0; spoke < 3; spoke++) {
        const bar = MeshBuilder.CreateBox(`${id}-spoke-${side}-${axle}-${spoke}`, { width: 0.255, height: 0.035, depth: 0.37 }, scene);
        bar.rotation.x = spoke * Math.PI / 3; bar.material = paint; bar.parent = wheel;
      }
      wheels.push(wheel);
    }
  }
  const steeringWheel = MeshBuilder.CreateTorus(`${id}-driver-wheel`, { diameter: 0.43, thickness: 0.055, tessellation: 24 }, scene);
  steeringWheel.rotation.x = 0.7; steeringWheel.position.set(0, 1.30, 0.18); steeringWheel.material = materials.tire; steeringWheel.parent = root;
  return root;
}
