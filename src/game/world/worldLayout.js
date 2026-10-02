const FARM_COLORS = ['#e6ad45', '#e87994', '#5f91c8', '#8a72b8', '#58a66f', '#d97745'];

function farmPosition(lotNumber) {
  const index = Math.max(0, lotNumber - 1);
  return { x: -45 + (index % 4) * 30, z: 112 + Math.floor(index / 4) * 28 };
}

export const MAP_LAYOUT_VERSION = 3;
export const VILLAGE_LOT_COUNT = 24;
export const VILLAGE_FARMS = Object.freeze(Array.from({ length: VILLAGE_LOT_COUNT }, (_, index) => {
  const lotNumber = index + 1;
  return {
    id: `farm_${String(lotNumber).padStart(6, '0')}`,
    ...farmPosition(lotNumber),
    lotNumber,
    owner: `Lô trống ${lotNumber}`,
    color: FARM_COLORS[index % FARM_COLORS.length],
    interactive: true,
  };
}));

export const WORLD_LAYOUT = Object.freeze({
  id: 'binh-minh-003',
  version: MAP_LAYOUT_VERSION,
  spawn: { x: -45, z: 102 },
  zones: {
    city: { id: 'city-center', label: 'Thành phố Bình Minh', x: 0, z: 0, radius: 58 },
    countryside: { id: 'rural-hoa-mai', label: 'Đồng quê Hoa Mai', x: 0, z: 182, radius: 102 },
    village: { id: 'west-village', label: 'Làng Mộc Lan', x: -132, z: 0, radius: 48 },
    lake: { id: 'crystal-lake', label: 'Hồ Pha Lê', x: 165, z: 2, radius: 48 },
    beach: { id: 'sunrise-beach', label: 'Biển Bình Minh', x: 0, z: 340, radius: 64 },
  },
  cityDistricts: Object.freeze([
    { id: 'civic', label: 'Quảng trường', icon: '⭐', x: 0, z: 0, color: '#f5b942' },
    { id: 'shopping', label: 'Phố mua sắm', icon: '🛍️', x: -34, z: -28, color: '#ec7aa8' },
    { id: 'entertainment', label: 'Khu vui chơi', icon: '🎮', x: 34, z: -28, color: '#8b7bd8' },
    { id: 'services', label: 'Dịch vụ', icon: '🚌', x: -34, z: 28, color: '#4da8c7' },
    { id: 'community', label: 'Cộng đồng', icon: '🌻', x: 34, z: 28, color: '#65a85b' },
  ]),
  routes: Object.freeze({
    cityRingRadius: 51,
    mainAvenueHalfWidth: 5.5,
    farmRoadStart: 86,
    farmRoadEnd: 276,
  }),
  farms: VILLAGE_FARMS,
  villageElder: { x: 0, y: 0, z: 82 },
  animalPen: { x: 72, z: 112 },
  destinationSigns: [
    { id: 'city', label: 'Trung tâm thành phố', x: 0, z: 54, color: '#d9a441' },
    { id: 'village', label: 'Làng phía Tây', x: -58, z: 3, color: '#4b8b55' },
    { id: 'lake', label: 'Vùng hồ', x: 62, z: 3, color: '#4b91c8' },
    { id: 'farms', label: 'Khu nông trại', x: 0, z: 74, color: '#65a84b' },
    { id: 'beach', label: 'Bãi biển', x: 0, z: 286, color: '#e6c875' },
  ],
  vegetation: { count: 300, width: 660, depth: 660, offsetX: -330, offsetZ: -300 },
});

export const RENDER_CONFIG = Object.freeze({
  fogStart: 90,
  fogEnd: 240,
  cameraAlpha: -Math.PI / 2,
  cameraBeta: 1.02,
  cameraRadius: 15,
  cameraMinRadius: 10,
  cameraMaxRadius: 22,
  shadowMapSize: 2048,
});

export function zoneAtPosition(x, z) {
  const orderedZones = ['city', 'village', 'lake', 'beach'];
  for (const key of orderedZones) {
    const zone = WORLD_LAYOUT.zones[key];
    if (Math.hypot(x - zone.x, z - zone.z) <= zone.radius) return { key, ...zone };
  }
  if (z >= WORLD_LAYOUT.routes.farmRoadStart && z <= WORLD_LAYOUT.routes.farmRoadEnd) {
    return { key: 'countryside', ...WORLD_LAYOUT.zones.countryside };
  }
  return { key: 'open-world', id: 'open-world', label: 'Vùng ngoại ô', x, z, radius: 0 };
}
