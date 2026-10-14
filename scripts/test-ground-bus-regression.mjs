import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader.js';
import { AssetContainer } from '@babylonjs/core/assetContainer.js';
import { Scene } from '@babylonjs/core/scene.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { findBusExit } from '../src/game/transport/findBusExit.js';
import { createBusRoute } from '../src/game/transport/createBusRoute.js';
import { createPlayer } from '../src/game/player/createPlayer.js';
import { buildHumanMesh } from '../src/game/player/buildHumanMesh.js';
import { getTerrainHeight } from '../src/game/world/TerrainHeightSystem.js';
import { farmLotPosition, farmTilePosition } from '../shared/farmLayout.js';
import { busRouteForId } from '../shared/busAuthorityConfig.js';
import { MovementAuthority } from '../server/MovementAuthority.js';
import { WorldCollisionSystem } from '../src/game/physics/WorldCollisionSystem.js';
import { getDefaultCustomization, SHOES } from '../shared/fashionConfig.js';
globalThis.OffscreenCanvas ||= class {
  constructor(width, height) { this.width = width; this.height = height; }
  getContext() { return new Proxy({}, { get: (_, key) => key === 'measureText' ? () => ({ width: 100 }) : key.includes('Gradient') ? () => ({ addColorStop() {} }) : () => {} }); }
};
for (let lot = 1; lot <= 288; lot++) {
  const { x, z } = farmLotPosition(lot);
  for (const [dx, dz, top] of [[8, 0, .11], [0, -7.8, .22], [0, -11.2, .13], [0, .8, .19], [-4.8, 2, .21], [4.8, 2, .21]]) {
    assert.ok(getTerrainHeight(x + dx, z + dz) >= top - 1e-9, `lot ${lot}: rendered surface support`);
  }
  const tile = farmTilePosition(lot, '0:0');
  assert.ok(getTerrainHeight(tile.x, tile.z) >= .15 - 1e-9);
}
const collision = new WorldCollisionSystem();
const farm = farmLotPosition(1);
assert.ok(collision.isColliding(farm.x - 7.2, farm.z - 3), 'tree trunk is solid');
const engine = new NullEngine(), scene = new Scene(engine);
const human = buildHumanMesh(scene, 'contact-regression');
for (const gender of ['male', 'female', 'neutral']) for (const shoe of SHOES) {
  human.applyCustomization({ ...getDefaultCustomization(), gender, shoeId: shoe.id });
  const footwear = human.root.getChildMeshes().filter(mesh => mesh.isEnabled() && /sneaker-|boot-sole|slide-sole|flat-sole|skate-wheel|geta-block|duck-shoe|dino-shoe/.test(mesh.name));
  for (const rate of [15, 30, 60]) for (let frame = 0; frame < rate * 2; frame++) {
    human.root.position.set(12, frame % 2 ? .21 : 32, -8);
    human.root.rotation.y = frame * .03;
    human.animate(1 / rate, true, 7, { airborne: false, turn: .8 });
    for (const mesh of footwear) {
      mesh.computeWorldMatrix(true);
      assert.ok(mesh.getBoundingInfo().boundingBox.minimumWorld.y >= human.root.position.y - 1e-6, `${gender}/${shoe.id} ${mesh.name}: ${mesh.getBoundingInfo().boundingBox.minimumWorld.y - human.root.position.y} at ${rate} FPS frame ${frame}`);
    }
  }
}
for (const id of ['bus-01E', 'bus-04A-3', 'bus-99A', 'fake']) assert.equal(busRouteForId(id), null);
globalThis.window ||= { addEventListener() {}, removeEventListener() {} };
globalThis.document ||= { addEventListener() {}, removeEventListener() {}, createElement() { return new OffscreenCanvas(512, 512); }, activeElement: null };
globalThis.Element ||= class {};
let riding = true;
const local = createPlayer(scene, null, { x: 0, z: 54 }, { isRidingBus: () => riding, getVehicle: () => 'scooter', getTerrainHeight: () => .08 });
local.root.position.y = 2.22;
local.update(1 / 60);
assert.equal(local.getVehicleId(), 'scooter', 'boarding preserves the selected vehicle');
const vehicleMeshes = local.root.getChildMeshes().filter(mesh => /scooter/.test(mesh.name));
assert.ok(vehicleMeshes.length && vehicleMeshes.every(mesh => !mesh.isEnabled()), 'personal vehicle stays off the bus deck');
const deckFeet = local.human.root.getChildMeshes().filter(mesh => mesh.isEnabled() && /sneaker-sol/.test(mesh.name));
for (const foot of deckFeet) {
  foot.computeWorldMatrix(true);
  assert.ok(foot.getBoundingInfo().boundingBox.minimumWorld.y >= 2.22 - 1e-5, 'standing passenger stays above the deck');
}
riding = false; local.root.position.y = .08; local.update(1 / 60);
assert.ok(vehicleMeshes.some(mesh => mesh.isEnabled()), 'personal vehicle returns after alighting');
local.dispose();
// Decorative shelter GLBs are outside this headless movement test.
SceneLoader.LoadAssetContainerAsync = async (_root, _file, assetScene) => new AssetContainer(assetScene);
const fleet = createBusRoute(scene, null), player = new TransformNode('passenger', scene);
assert.equal(fleet.buses.length, 32);
const trafficStarts = fleet.buses.map(bus => bus.root.position.clone());
for (let frame = 0; frame < 60 * 120; frame++) {
  const snapshots = fleet.buses.map(bus => ({ position: bus.root.position.clone(), yaw: bus.root.rotation.y, dwell: bus.isDwelling() }));
  fleet.update(1 / 60, null);
  fleet.buses.forEach((bus, i) => {
    assert.ok(bus.root.position.asArray().every(Number.isFinite), 'whole fleet has finite positions');
    const turn = Math.atan2(Math.sin(bus.root.rotation.y - snapshots[i].yaw), Math.cos(bus.root.rotation.y - snapshots[i].yaw));
    assert.ok(Math.abs(turn) <= 2.5 / 60 + 1e-6, `${bus.id}: bounded turn rate`);
    if (snapshots[i].dwell && bus.isDwelling()) {
      assert.ok(Vector3.Distance(snapshots[i].position, bus.root.position) < 1e-6, `${bus.id}: parked bus stays still`);
      assert.equal(turn, 0, `${bus.id}: no spinning during boarding`);
    }
  });
}
fleet.buses.forEach((bus, i) => assert.ok(Vector3.Distance(trafficStarts[i], bus.root.position) > 5, `${bus.id}: traffic controller does not deadlock`));

for (const bus of fleet.buses) {
  const route = busRouteForId(bus.id);
  assert.ok(route, `${bus.id} has server route`);
  while (bus.isDwelling()) bus.update(1 / 60);
  for (let frame = 0; !bus.isDwelling() && frame < 24000; frame++) bus.update(1 / 60);
  assert.ok(bus.isDwelling(), `${bus.id} reaches a station`);
  assert.ok(bus.getDwellRemaining() >= 7.9);
  player.position.copyFrom(bus.root.position); player.position.x += 3.4;
  const authority = new MovementAuthority();
  const client = { x: player.position.x, y: player.position.y, z: player.position.z, vehicle: 'walk', venue: null };
  assert.ok(authority.board(client, bus.id, 0), `${bus.id} server boarding`);
  assert.ok(fleet.boardBus(bus.id, player), `${bus.id} client boarding`);
  assert.ok(authority.accepts(client, player.position, 1), `${bus.id} accepts passenger seat`);
  Object.assign(client, { x: player.position.x, y: player.position.y, z: player.position.z });
  const visitedStops = new Set();
  for (let frame = 1; frame <= 60 * 1200; frame++) {
    const previous = bus.root.position.clone();
    bus.update(1 / 60);
    if (bus.isDwelling()) {
      const [stopX, stopZ] = route.points[bus.getCurrentStation().waypointIndex];
      const key = `${stopX}:${stopZ}`;
      if (!visitedStops.has(key)) {
        visitedStops.add(key);
        for (const radius of [.45, 1.85]) {
          const exit = findBusExit(bus.root, (x,z) => collision.isColliding(x,z,radius));
          assert.ok(exit, `${bus.id}: safe exit for radius ${radius} at ${key}`);
          assert.ok(Math.hypot(exit.x-bus.root.position.x, exit.z-bus.root.position.z) <= 8);
        }
      }
    }
    assert.ok(Math.hypot(previous.x - bus.root.position.x, previous.z - bus.root.position.z) <= 48 / 60 + .001, `${bus.id} does not jump horizontally at corners`);
    bus.root.computeWorldMatrix(true); bus.passengerSeatNode.computeWorldMatrix(true);
    player.position.copyFrom(bus.passengerSeatNode.getAbsolutePosition());
    if (frame % 6 === 0) {
      assert.ok(Math.hypot(player.position.x - client.x, player.position.z - client.z) <= authority.maxStepDistance(client, .1) + 1e-6, `${bus.id}: outer server speed check at ${frame}`);
      assert.ok(authority.accepts(client, player.position, frame * 1000 / 60 + 1), `${bus.id} network movement at frame ${frame}`);
      Object.assign(client, { x: player.position.x, y: player.position.y, z: player.position.z });
    }
    if (frame >= 60 * 90 && route.stops.every(([x,z]) => visitedStops.has(`${x}:${z}`))) break;
  }
  for (const [x,z] of route.stops) assert.ok(visitedStops.has(`${x}:${z}`), `${bus.id}: serves every stop ${x},${z}`);
  for (const rate of [15, 30]) for (let frame = 0; frame < rate * 10; frame++) {
    const previous = bus.root.position.clone();
    bus.update(1 / rate);
    assert.ok(Math.hypot(previous.x - bus.root.position.x, previous.z - bus.root.position.z) <= 48 / rate + .001, `${bus.id}: bounded travel at ${rate} FPS`);
  }
  for (let frame = 0; !bus.isDwelling() && frame < 24000; frame++) bus.update(1 / 60);
  assert.ok(bus.isDwelling(), `${bus.id} reaches an alighting stop`);
  bus.root.computeWorldMatrix(true); bus.passengerSeatNode.computeWorldMatrix(true);
  player.position.copyFrom(bus.passengerSeatNode.getAbsolutePosition());
  assert.ok(fleet.alightBus(player, false, (x,z) => collision.isColliding(x,z)), `${bus.id} ordinary alighting`);
  assert.equal(player.position.y, getTerrainHeight(player.position.x, player.position.z));
  assert.equal(collision.isColliding(player.position.x, player.position.z), false, `${bus.id} exit is clear`);
  const exitClient = { x: bus.root.position.x, y: bus.root.position.y, z: bus.root.position.z, vehicle: 'walk', venue: null };
  const exitAuthority = new MovementAuthority();
  assert.ok(exitAuthority.board(exitClient, bus.id, 0));
  assert.ok(exitAuthority.accepts(exitClient, player.position, 100), `${bus.id} server accepts exit`);
  assert.equal(exitAuthority.maxSpeed(exitClient), 7 * 1.35, 'alighting restores walking speed');
}
scene.dispose(); engine.dispose();
console.log(`PASS: 288 farm supports, solid orchard trunk, every shoe/gender at 15/30/60 FPS, ${fleet.buses.length} buses board and ride without rejected network corrections`);
