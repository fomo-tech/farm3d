import { isPointOnRoadCorridor } from '../src/game/world/RoadSafetyZone.js';
import { isPointInsideAnyFarmLot } from '../src/game/world/FarmSafetyZone.js';
import { WORLD_VILLAGES } from '../shared/villageLayout.js';

console.log('--- TESTING SCENIC WORLD, ROAD CLEARANCE & FARM PARCEL PURITY ---');

// 1. Check all 12 village gateway commons (wells, gazebos, notice boards, flowerbeds)
let villageViolations = 0;
let farmViolations = 0;

WORLD_VILLAGES.forEach(village => {
  const { offsetX, offsetZ, name } = village;
  const plazaZ = offsetZ + 74;
  const wellX = offsetX - 18.0;
  const gazeboX = offsetX + 18.0;
  const noticeX = offsetX - 12.0;
  const flowerX = offsetX + 12.0;

  const amenities = [
    { name: 'well', x: wellX, z: plazaZ },
    { name: 'gazebo', x: gazeboX, z: plazaZ },
    { name: 'notice', x: noticeX, z: plazaZ },
    { name: 'flower', x: flowerX, z: plazaZ },
  ];

  amenities.forEach(am => {
    if (isPointOnRoadCorridor(am.x, am.z, 3.0)) {
      console.error(`FAIL: Village ${name} ${am.name} at (${am.x}, ${am.z}) is on road corridor!`);
      villageViolations++;
    }
    if (isPointInsideAnyFarmLot(am.x, am.z, 0.5)) {
      console.error(`FAIL: Village ${name} ${am.name} at (${am.x}, ${am.z}) is inside a player farm plot!`);
      farmViolations++;
    }
  });

  // Check cul-de-sac turnaround center
  const culZ = offsetZ + 280;
  if (!isPointOnRoadCorridor(offsetX, culZ, 3.0)) {
    console.error(`FAIL: Cul-de-sac at (${offsetX}, ${culZ}) was not registered as a road zone!`);
    villageViolations++;
  }
});

if (villageViolations === 0 && farmViolations === 0) {
  console.log(`1. All 12 Village Gateway Commons are 100% CLEAR of road corridors AND 100% CLEAR of farm plots.`);
} else {
  console.error(`1. Found ${villageViolations} road violations and ${farmViolations} farm violations.`);
  process.exit(1);
}

// 2. Check Inter-Village Scenic Landmarks
const majorLandmarks = [
  { name: 'West Windmills', x: -450, z: 180 },
  { name: 'East Watermill', x: 428, z: 180 },
  { name: 'North Highlands Pine Forest', x: 70, z: -185 },
  { name: 'North Tea Hills Retreat', x: 80, z: -440 },
  { name: 'South Summer Plains', x: 120, z: 505 },
];

let landmarkViolations = 0;
majorLandmarks.forEach(lm => {
  const onRoad = isPointOnRoadCorridor(lm.x, lm.z, 3.2);
  const onFarm = isPointInsideAnyFarmLot(lm.x, lm.z, 1.0);
  if (onRoad) {
    console.error(`FAIL: Landmark ${lm.name} at (${lm.x}, ${lm.z}) is too close to road!`);
    landmarkViolations++;
  }
  if (onFarm) {
    console.error(`FAIL: Landmark ${lm.name} at (${lm.x}, ${lm.z}) is inside a farm lot!`);
    landmarkViolations++;
  }
});

if (landmarkViolations === 0) {
  console.log(`2. All ${majorLandmarks.length} Major Inter-Village Scenic Buffer Landscapes are 100% CLEAR of road corridors & farm lots.`);
} else {
  console.error(`2. Found ${landmarkViolations} violations in inter-village landmarks.`);
  process.exit(1);
}

// 3. Test dynamic ESM imports of new modules
try {
  await import('../src/game/world/FarmSafetyZone.js');
  await import('../src/game/world/createVillageAmenities.js');
  await import('../src/game/world/createInterVillagePlains.js');
  await import('../src/game/world/createScenicLandscapes.js');
  await import('../src/game/world/createGlobalDenseFlora.js');
  await import('../src/game/world/FoliageInstancingEngine.js');
  console.log('3. All new scenic landscaping & safety modules imported successfully without errors.');
} catch (err) {
  console.error('3. Failed to import scenic modules:', err);
  process.exit(1);
}

// 4. Test Infinite Horizon Configuration
const { FARM_CONFIG } = await import('../src/game/config.js');
const { RENDER_CONFIG } = await import('../src/game/world/worldLayout.js');

if (FARM_CONFIG.worldSize >= 4000 && RENDER_CONFIG.cameraFarClip >= 3000 && RENDER_CONFIG.fogEnd >= 2000) {
  console.log(`4. Infinite Horizon Verified: worldSize=${FARM_CONFIG.worldSize}m, cameraFarClip=${RENDER_CONFIG.cameraFarClip}m, fogEnd=${RENDER_CONFIG.fogEnd}m.`);
} else {
  console.error(`4. FAIL: Infinite horizon configuration is insufficient!`, {
    worldSize: FARM_CONFIG.worldSize,
    cameraFarClip: RENDER_CONFIG.cameraFarClip,
    fogEnd: RENDER_CONFIG.fogEnd,
  });
  process.exit(1);
}

// 5. Test Central Botanical Valley Clearances (Walkways, Fountain, Carts)
const botanicalFeatures = [
  { name: 'Grand Floral Fountain', x: -24, z: 50 },
  { name: 'West Walkway Tree', x: -17.8, z: 48 },
  { name: 'East Walkway Tree', x: 17.8, z: 48 },
  { name: 'West Cart', x: -22, z: 56 },
  { name: 'East Cart', x: 18, z: 70 },
  { name: 'Central Brook End Pond', x: 84, z: 68 },
];

let botanicalViolations = 0;
botanicalFeatures.forEach(bf => {
  if (isPointOnRoadCorridor(bf.x, bf.z, 3.5)) {
    console.error(`FAIL: Botanical feature ${bf.name} at (${bf.x}, ${bf.z}) encroaches road corridor!`);
    botanicalViolations++;
  }
  if (isPointInsideAnyFarmLot(bf.x, bf.z, 1.0)) {
    console.error(`FAIL: Botanical feature ${bf.name} at (${bf.x}, ${bf.z}) encroaches farm parcel!`);
    botanicalViolations++;
  }
});

if (botanicalViolations === 0) {
  console.log('5. Central Grand Botanical Valley features are 100% CLEAR of roads & farm parcels.');
} else {
  console.error(`5. Found ${botanicalViolations} botanical feature violations.`);
  process.exit(1);
}

// 6. Test Village Commons Parklets & Windbreak Safety (Specifically Làng Phú Điền & All 12 Villages)
const phuDienFeatures = [
  { name: 'Phú Điền Bus Shade Tree L', x: -14, z: -406 },
  { name: 'Phú Điền Well Shade Tree R', x: 14, z: -406 },
  { name: 'Phú Điền Farm Cart', x: -10, z: -412 },
  { name: 'Phú Điền Entrance Tree L', x: -9.5, z: -452 },
  { name: 'Phú Điền Entrance Tree R', x: 9.5, z: -452 },
  { name: 'Phú Điền West Windbreak', x: -69, z: -385 },
  { name: 'Phú Điền East Windbreak', x: 69, z: -385 },
];

let villageParkletViolations = 0;
phuDienFeatures.forEach(pf => {
  if (isPointOnRoadCorridor(pf.x, pf.z, 3.5)) {
    console.error(`FAIL: Village feature ${pf.name} at (${pf.x}, ${pf.z}) encroaches road corridor!`);
    villageParkletViolations++;
  }
  if (isPointInsideAnyFarmLot(pf.x, pf.z, 1.0)) {
    console.error(`FAIL: Village feature ${pf.name} at (${pf.x}, ${pf.z}) encroaches farm parcel!`);
    villageParkletViolations++;
  }
});

if (villageParkletViolations === 0) {
  console.log('6. Làng Phú Điền & Village Parklets are 100% CLEAR of roads and farm lots.');
} else {
  console.error(`6. Found ${villageParkletViolations} village parklet violations.`);
  process.exit(1);
}

console.log('ALL SCENIC WORLD & ROAD/FARM SAFETY TESTS PASSED SUCCESSFULLY!');

