import { WorldCollisionSystem } from '../src/game/physics/WorldCollisionSystem.js';
import { WORLD_LAYOUT } from '../src/game/world/worldLayout.js';
import assert from 'node:assert/strict';
import { TOWN_SPAWN, recoverTownSpawn } from '../shared/playerSpawn.js';

console.log('--- TESTING WORLD COLLISION SYSTEM ---');

const collision = new WorldCollisionSystem();
for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) {
  assert.equal(collision.isColliding(TOWN_SPAWN.x + dx, TOWN_SPAWN.z + dz), false, 'spawn needs room to walk out');
}
assert.equal(recoverTownSpawn({x:0,y:0,z:0}).z, TOWN_SPAWN.z);
assert.equal(recoverTownSpawn({x:0,y:0,z:18}).z, TOWN_SPAWN.z);
const saved = {x:65,y:0,z:110};
assert.equal(recoverTownSpawn(saved), saved);
const indoor = {x:0,y:32,z:0,venue:'casino'};
assert.equal(recoverTownSpawn(indoor), indoor);

// Southern villages extend beyond z=450; the ocean boundary must not form
// an invisible wall across their roads or any of the 288 farm entrances.
const blockedGates = WORLD_LAYOUT.farms.filter(farm => collision.isColliding(farm.x, farm.z - 9));
if (blockedGates.length) throw new Error(`Blocked farm gates: ${blockedGates.map(farm => farm.id).join(', ')}`);
for (const x of [-300, 300]) {
  for (const z of [470, 560]) {
    if (collision.isColliding(x, z)) throw new Error(`Southern village road blocked at ${x}, ${z}`);
  }
}
if (!collision.isColliding(0, 470)) throw new Error('Central deep-ocean boundary is no longer protected');
console.log(`Southern access OK: all ${WORLD_LAYOUT.farms.length} farm gates open; coastal village roads passable; central sea blocked.`);
for (const [x, z] of [[0, 18], [0, 12], [-24, -20.9], [24, -20.9], [-24, 20.9], [24, 20.9]]) {
  if (collision.isColliding(x, z)) throw new Error(`Town plaza route/venue door blocked at ${x}, ${z}`);
}
for (const [x, z] of [[-14, -14], [14, -14], [-14, 14], [14, 14]]) {
  if (collision.isColliding(x, z)) throw new Error(`Removed flowerbed leaves an invisible wall at ${x}, ${z}`);
}
console.log('Town plaza access OK: spawn and four shop entrances open; removed flowerbed positions remain walkable.');

// Test 1: Spawn point must NOT collide
const spawn = WORLD_LAYOUT.spawn;
const spawnCollides = collision.isColliding(spawn.x, spawn.z);
console.log(`1. Spawn (${spawn.x}, ${spawn.z}) collision: ${spawnCollides} (Expected: false)`);
if (spawnCollides) {
  console.error('FAIL: Spawn point is blocked by a collider!');
  process.exit(1);
}

// Test 2: Solid Landmark Collisions
// Town Hall (-38, -98)
const townHallCenter = collision.isColliding(-38, -98);
console.log(`2. Town Hall center (-38, -98) collision: ${townHallCenter} (Expected: true)`);
if (!townHallCenter) {
  console.error('FAIL: Town Hall did not block player!');
  process.exit(1);
}

// Modern Farmhouse (-38, 62)
const farmhouseCenter = collision.isColliding(-38, 62);
console.log(`3. Farmhouse center (-38, 62) collision: ${farmhouseCenter} (Expected: true)`);
if (!farmhouseCenter) {
  console.error('FAIL: Farmhouse did not block player!');
  process.exit(1);
}

// Red Barn (42, 62)
const barnCenter = collision.isColliding(42, 62);
console.log(`4. Red Barn center (42, 62) collision: ${barnCenter} (Expected: true)`);
if (!barnCenter) {
  console.error('FAIL: Red Barn did not block player!');
  process.exit(1);
}

// Windmill (-92, 108)
const windmillCenter = collision.isColliding(-92, 108);
console.log(`5. Windmill center (-92, 108) collision: ${windmillCenter} (Expected: true)`);
if (!windmillCenter) {
  console.error('FAIL: Windmill did not block player!');
  process.exit(1);
}

// Central Plaza Fountain (0, 0)
const fountainCenter = collision.isColliding(0, 0);
console.log(`5b. Central Fountain center (0, 0) collision: ${fountainCenter} (Expected: true)`);
if (!fountainCenter) {
  console.error('FAIL: Central Fountain did not block player!');
  process.exit(1);
}

// Casino Building Body (-29, -25)
const casinoCenter = collision.isColliding(-29, -25);
console.log(`5c. Casino building body (-29, -25) collision: ${casinoCenter} (Expected: true)`);
if (!casinoCenter) {
  console.error('FAIL: Casino building did not block player!');
  process.exit(1);
}

// Roadside Shop (-11.5, 60)
const shopCenter = collision.isColliding(-11.5, 60);
console.log(`5d. Roadside shop (-11.5, 60) collision: ${shopCenter} (Expected: true)`);
if (!shopCenter) {
  console.error('FAIL: Roadside shop did not block player!');
  process.exit(1);
}

// Test 3: Farm Plot 1 Entrance vs Fence
const farm1 = WORLD_LAYOUT.farms[0];
console.log(`Checking Farm 1 at (${farm1.x}, ${farm1.z}):`);

// Front Gate is at z = farm1.z - 9.0, x = farm1.x (5.5m wide gap)
const gateEntrance = collision.isColliding(farm1.x, farm1.z - 9.0);
console.log(`- Farm 1 Front Gate (${farm1.x}, ${farm1.z - 9.0}) collision: ${gateEntrance} (Expected: false)`);
if (gateEntrance) {
  console.error('FAIL: Farm 1 gate entrance is blocked!');
  process.exit(1);
}

// Left fence is at x = farm1.x - 6.0, z = farm1.z - 9.0
const leftFence = collision.isColliding(farm1.x - 6.0, farm1.z - 9.0);
console.log(`- Farm 1 Left Front Fence (${farm1.x - 6.0}, ${farm1.z - 9.0}) collision: ${leftFence} (Expected: true)`);
if (!leftFence) {
  console.error('FAIL: Farm 1 left fence is not solid!');
  process.exit(1);
}

// Farm Home inside plot
const farmHome = collision.isColliding(farm1.x - 4.8, farm1.z + 5.2);
console.log(`- Farm 1 House (${farm1.x - 4.8}, ${farm1.z + 5.2}) collision: ${farmHome} (Expected: true)`);
if (!farmHome) {
  console.error('FAIL: Farm 1 house is not solid!');
  process.exit(1);
}

// Farm Barn inside plot
const farmBarn = collision.isColliding(farm1.x + 4.8, farm1.z + 5.2);
console.log(`- Farm 1 open corral (${farm1.x + 4.8}, ${farm1.z + 5.2}) collision: ${farmBarn} (Expected: false)`);
if (farmBarn) {
  console.error('FAIL: Farm 1 corral interior is blocked!');
  process.exit(1);
}

// Test 4: Wall-Sliding Physics Resolution
// Approaching Town Hall south wall from ( -38, -91.5 ) moving north (dz = -0.6) and right (dx = 0.5)
const slideRes = collision.resolveMovement(-38, -91.5, 0.5, -0.6);
console.log(`6. Wall Slide resolution moving into wall:`, slideRes);
if (!slideRes.collided) {
  console.error('FAIL: Movement into wall should have collided!');
  process.exit(1);
}
if (slideRes.z < -92.0) {
  console.error('FAIL: Movement penetrated the wall!');
  process.exit(1);
}
if (slideRes.x <= -38) {
  console.error('FAIL: Player should have smoothly slid horizontally along the wall!');
  process.exit(1);
}
console.log(`   Smooth slide confirmed: X moved +0.5 (${slideRes.x}), Z stayed safe (${slideRes.z})`);

// Test 5: Benchmark 50,000 movement queries (simulate 15 minutes of gameplay at 60 FPS)
const startBench = performance.now();
let px = 0, pz = 18;
for (let i = 0; i < 50000; i++) {
  const angle = (i * 0.05);
  const dx = Math.cos(angle) * 0.1;
  const dz = Math.sin(angle) * 0.1;
  const next = collision.resolveMovement(px, pz, dx, dz);
  px = next.x;
  pz = next.z;
}
const elapsed = performance.now() - startBench;
const perQueryMicroseconds = (elapsed / 50000) * 1000;
console.log(`7. Benchmark: 50,000 queries in ${elapsed.toFixed(1)}ms (${perQueryMicroseconds.toFixed(2)}µs per query).`);
if (perQueryMicroseconds > 100) {
  console.warn(`WARNING: Query time is a bit high (${perQueryMicroseconds.toFixed(2)}µs)`);
} else {
  console.log('   PERFECT PERFORMANCE: < 0.1ms per frame budget.');
}

console.log('ALL TESTS PASSED!');

for(const farm of WORLD_LAYOUT.farms){
 for(const dz of [-3.5,-2.8,-1.8,0]) assert.equal(collision.isColliding(farm.x+4.8,farm.z+5.2+dz),false,`Corral gate blocked: ${farm.id}/${dz}`);
 assert.equal(collision.isColliding(farm.x+4.8+3.2,farm.z+5.2),true,`Corral fence missing: ${farm.id}`);
}
console.log('PASS: every corral has an accessible gate and walkable interior, with solid side fences');
const {findWalkingPath}=await import('../src/game/physics/findWalkingPath.js');
const {FARM_CONFIG}=await import('../shared/farmConfig.js');
for(const farm of WORLD_LAYOUT.farms.slice(0,3)){
 const start={x:farm.x+4.8,z:farm.z+5.2-3.8};
 for(const [species,[x,z]] of Object.entries(FARM_CONFIG.livestockVisuals.slots)){
  for(const [dx,dz] of [[-.55,-.38],[.55,-.38],[0,.62]]){
   const target={x:farm.x+4.8+x+dx,z:farm.z+5.2+Math.max(-2.1,z+dz-(species==='cow'?1.2:.9))};
   assert.ok(findWalkingPath(start,target,(x,z)=>collision.isColliding(x,z)),`No care path ${farm.id}/${species}/${dx}`);
  }
 }
}
console.log('PASS: paths through the gate reach all 15 animal care positions');
