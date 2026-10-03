import { FARM_LOT_SPEC, farmLotPosition } from '../../../shared/farmLayout.js';
import { WORLD_VILLAGES } from '../../../shared/villageLayout.js';

const FARM_COLORS = ['#e6ad45', '#e87994', '#5f91c8', '#8a72b8', '#58a66f', '#d97745'];

export const MAP_LAYOUT_VERSION = FARM_LOT_SPEC.version;
export const VILLAGE_LOT_COUNT = 24;
export const VILLAGE_FARMS = Object.freeze(Array.from({ length: VILLAGE_LOT_COUNT * WORLD_VILLAGES.length }, (_, index) => {
  const lotNumber = index + 1;
  return {
    id: `farm_${String(lotNumber).padStart(6, '0')}`,
    ...farmLotPosition(lotNumber),
    lotNumber: index % 24 + 1,
    villageId: WORLD_VILLAGES[Math.floor(index / 24)].id,
    owner: `Lô trống ${lotNumber}`,
    color: FARM_COLORS[index % FARM_COLORS.length],
    interactive: true,
  };
}));

export const WORLD_LAYOUT = Object.freeze({
  id: 'binh-minh-003',
  version: MAP_LAYOUT_VERSION,
  spawn: { x: 0, z: 24 },
  zones: {
    city: { id: 'city-center', label: 'Thành phố Bình Minh', x: 0, z: 0, radius: 58 },
    countryside: { id: 'rural-hoa-mai', label: 'Đồng quê Hoa Mai', x: 0, z: 182, radius: 102 },
    village: { id: 'west-village', label: 'Làng Mộc Lan', x: -132, z: 0, radius: 48 },
    lake: { id: 'crystal-lake', label: 'Hồ Pha Lê', x: 165, z: 2, radius: 48 },
    beach: { id: 'sunrise-beach', label: 'Biển Bình Minh', x: 0, z: 340, radius: 64 },
  },
  cityDistricts: Object.freeze([
    { id: 'civic', label: 'Quảng trường', x: 0, z: 0, color: '#f5b942' },
    { id: 'shopping', label: 'Phố mua sắm', x: -34, z: -28, color: '#ec7aa8' },
    { id: 'entertainment', label: 'Khu vui chơi', x: 34, z: -28, color: '#8b7bd8' },
    { id: 'services', label: 'Dịch vụ', x: -34, z: 28, color: '#4da8c7' },
    { id: 'community', label: 'Cộng đồng', x: 34, z: 28, color: '#65a85b' },
  ]),
  routes: Object.freeze({
    cityRingRadius: 51,
    mainAvenueHalfWidth: 5.5,
    farmRoadStart: 86,
    farmRoadEnd: 276,
  }),
  farms: VILLAGE_FARMS,
  villages: WORLD_VILLAGES,
  villageElder: { x: -7.4, y: 0, z: 76 },
  villageGate: { x: 0, y: 0, z: 64 },
  animalPen: { x: 88, z: 112 },
  destinationSigns: [
    { id: 'city', label: 'Trung tâm thành phố', x: 6.8, z: 54, color: '#d9a441' },
    { id: 'village', label: 'Làng phía Tây', x: -58, z: 8, color: '#4b8b55' },
    { id: 'lake', label: 'Vùng hồ', x: 62, z: 8, color: '#4b91c8' },
    { id: 'farms', label: 'Khu nông trại', x: -6.8, z: 74, color: '#65a84b' },
    { id: 'beach', label: 'Bãi biển', x: 6.8, z: 286, color: '#e6c875' },
  ],
  vegetation: { count: 300, width: 660, depth: 660, offsetX: -330, offsetZ: -300 },
});

export const RENDER_CONFIG = Object.freeze({
  fogStart: 90,
  fogEnd: 240,
  cameraAlpha: -Math.PI / 2,
  cameraBeta: 1.18,
  cameraRadius: 26,
  cameraMinRadius: 12,
  cameraMaxRadius: 48,
  cameraMinBeta: 0.5,
  cameraMaxBeta: 1.35,
  cameraFov: 0.88,
  cameraLookAhead: 5,
  cameraTargetHeight: 1.2,
  cameraFarClip: 2400,
  farmCameraBeta: 0.65,
  farmCameraRadius: 26,
  farmCameraLookAhead: 1.8,
  cameraFollowSpeed: 12,
  interiorCameraBeta: 0.72,
  interiorCameraRadius: 14,
  shadowMapSize: 2048,
});

export function zoneAtPosition(x, z) {
  const village = WORLD_VILLAGES.find(v => Math.abs(x - v.x) < 70 && Math.abs(z - v.z) < 110);
  if (village) return { key: 'countryside', id: village.id, label: village.name, ...village };
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
