export const CHUNK_SIZE = 96;
export const FARMS_PER_VILLAGE = 64;
export const VILLAGES_PER_REALM = 4;
export const PLAYERS_PER_REALM = FARMS_PER_VILLAGE * VILLAGES_PER_REALM;

const VILLAGES = [
  { key: 'hoa-mai', name: 'Làng Hoa Mai', chunkX: -1, chunkZ: 0 },
  { key: 'bo-ho', name: 'Làng Bờ Hồ', chunkX: 1, chunkZ: 0 },
  { key: 'doi-gio', name: 'Làng Đồi Gió', chunkX: 0, chunkZ: -1 },
  { key: 'bien-xanh', name: 'Làng Biển Xanh', chunkX: 0, chunkZ: 1 },
];

export function chunkAt(x, z) {
  return { x: Math.floor(x / CHUNK_SIZE), z: Math.floor(z / CHUNK_SIZE) };
}

export function regionForChunk(x, z) {
  if (x === 0 && z === 0) return 'city';
  if (z > 4) return 'coast';
  if ((Math.abs(x * 7 + z * 13) % 11) === 0) return 'lake';
  return 'countryside';
}

const VILLAGE_PREFIXES = ['Hoa', 'Bình', 'An', 'Phú', 'Tân', 'Minh', 'Thanh', 'Xuân'];
const VILLAGE_SUFFIXES = ['Mai', 'Sơn', 'Hà', 'Lộc', 'Phong', 'Khê', 'Châu', 'Mộc'];

export function villageForChunk(x, z) {
  if (x === 0 && z === 0) return null;
  const value = Math.abs(Math.imul(x, 73856093) ^ Math.imul(z, 19349663));
  if (value % 3 !== 0) return null;
  const prefix = VILLAGE_PREFIXES[value % VILLAGE_PREFIXES.length];
  const suffix = VILLAGE_SUFFIXES[Math.floor(value / 11) % VILLAGE_SUFFIXES.length];
  return { id: `village:${x}:${z}`, name: `Làng ${prefix} ${suffix}`, chunkX: x, chunkZ: z, capacity: 64 };
}

// registrationIndex phải do server cấp tăng dần trong transaction.
// Mỗi 256 người mở một realm mới có thành phố và bốn làng ở cùng khoảng cách.
export function allocateFarmAddress(registrationIndex = 0) {
  const safeIndex = Math.max(0, Math.floor(registrationIndex));
  const realmNumber = Math.floor(safeIndex / PLAYERS_PER_REALM) + 1;
  const indexInRealm = safeIndex % PLAYERS_PER_REALM;
  const villageIndex = Math.floor(indexInRealm / FARMS_PER_VILLAGE);
  const village = VILLAGES[villageIndex];
  const slot = indexInRealm % FARMS_PER_VILLAGE;
  const realmId = `binh-minh-${String(realmNumber).padStart(3, '0')}`;

  return {
    realmId,
    cityId: `${realmId}:city`,
    region: 'countryside',
    villageId: `${realmId}:${village.key}`,
    villageName: village.name,
    chunkId: `${realmId}:rural:${village.chunkX}:${village.chunkZ}`,
    chunkX: village.chunkX,
    chunkZ: village.chunkZ,
    slot,
    tiles: 12,
    capacity: FARMS_PER_VILLAGE,
    transitHub: `${realmId}:station`,
  };
}
