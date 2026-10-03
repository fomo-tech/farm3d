export const FISHING_GEAR = Object.freeze({
  rod_bamboo: { name: 'Cần câu trúc mộc', cost: 150, count: 1 },
  rod_carbon: { name: 'Cần máy Carbon Pro', cost: 650, count: 1 },
  bait_worm: { name: 'Mồi trùn quế', cost: 50, count: 10 },
  bait_lure: { name: 'Mồi ruồi lông vũ', cost: 120, count: 5 },
});

export const LAKE_FISH = Object.freeze({
  carp: { name: 'Cá chép hồ', price: 24 },
  perch: { name: 'Cá rô hồ', price: 18 },
  golden_carp: { name: 'Cá chép vàng', price: 85 },
  river_catfish: { name: 'Cá trê sông', price: 28 },
  river_barb: { name: 'Cá mè sông', price: 21 },
  sea_mackerel: { name: 'Cá thu biển', price: 38 },
  sea_snapper: { name: 'Cá hồng biển', price: 52 },
});

export const LAKE_PIER = Object.freeze({ x: 126, z: 2, radius: 19 });

// Keep this shoreline metadata independent of Babylon so client and server use
// exactly the same reachability test. Values follow the rendered water shapes.
const RIVER = [
  [220,-580,15],[215,-480,15],[210,-380,16],[205,-280,16],
  [205,-234,16],[200,-175,16],[190,-90,17],[175,-15,18],
  [175,20,18],[195,52,17],[212,86,17],[218,140,16],
  [214,210,16],[218,270,16],[205,330,17],[180,406,18],
  [165,470,20],[155,540,24],
];

export function fishingWaterAt(x, z) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return null;
  const lakeRadius = Math.hypot((x - 167) / 36, (z - 2) / 22);
  if (Math.abs(x - LAKE_PIER.x) <= LAKE_PIER.radius && Math.abs(z - LAKE_PIER.z) <= 4.5) return 'lake';
  if (lakeRadius >= 0.9 && lakeRadius <= 1.29) return 'lake';
  const pondDistance = Math.hypot(x - 84, z - 68);
  if (pondDistance >= 3.5 && pondDistance <= 8) return 'pond';

  // The narrow park brook is shallow; fish at its pond, not on the walkway.

  const shore = 361 + 2.5 * Math.sin(x * 0.035) + 1.2 * Math.sin(x * 0.083);
  if (Math.abs(x) <= 118 && z >= shore - 9 && z <= shore + 5) return 'sea';

  for (let index = 0; index < RIVER.length - 1; index++) {
    const [ax, az, aw] = RIVER[index];
    const [bx, bz, bw] = RIVER[index + 1];
    const lengthSq = (bx - ax) ** 2 + (bz - az) ** 2;
    const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / lengthSq));
    const distance = Math.hypot(x - ax - (bx - ax) * t, z - az - (bz - az) * t);
    const bank = (aw + (bw - aw) * t) / 2;
    if (distance >= bank - 1.5 && distance <= bank + 6) return 'river';
  }
  return null;
}

export const FISHING_WATER_NAMES = Object.freeze({ lake: 'Hồ Pha Lê', river: 'Ven sông', sea: 'Bờ biển', pond: 'Ao công viên' });
