export const LOTS_PER_WORLD_VILLAGE = 24;
const seeds = [
  ['binh-minh', 'Bình Minh'], ['hoa-mai', 'Hoa Mai'], ['ven-song', 'Ven Sông'], ['doi-gio', 'Đồi Gió'],
  ['an-nhien-005', 'An Nhiên'], ['moc-lan-006', 'Mộc Lan'], ['thanh-ha-007', 'Thanh Hà'], ['phu-dien-008', 'Phú Điền'],
  ['tan-loc-009', 'Tân Lộc'], ['hai-van-010', 'Hải Vân'], ['thu-phong-011', 'Thu Phong'], ['huong-duong-012', 'Hướng Dương'],
];
// One physical world: preserve the first neighbourhood and place the others
// around the central city, with enough room for six rows of fenced parcels.
const offsets = [[0,0],[-300,0],[300,0],[-600,0],[600,0],[-600,-320],[-300,-320],[0,-480],[300,-320],[600,-320],[-300,320],[300,320]];
export const WORLD_VILLAGES = Object.freeze(seeds.map(([id,name], order) => ({
  id, name: `Làng ${name}`, order, offsetX: offsets[order][0], offsetZ: offsets[order][1],
  x: offsets[order][0], z: 182 + offsets[order][1],
  gate: { x: offsets[order][0], z: 86 + offsets[order][1] },
})));
export function villageGeometry(order = 0) {
  if (WORLD_VILLAGES[order]) return WORLD_VILLAGES[order];
  return { order, offsetX: (order % 4 - 1.5) * 300, offsetZ: 640 + Math.floor((order - 12) / 4) * 320 };
}
export function worldFarmNumber(order, lot) { return order * LOTS_PER_WORLD_VILLAGE + lot; }
export function worldFarmId(order, lot) { return `farm_${String(worldFarmNumber(order, lot)).padStart(6, '0')}`; }
export function decodeFarmId(id) {
  const number = Number(String(id).replace('farm_', ''));
  if (!/^farm_\d{6}$/.test(String(id)) || !Number.isInteger(number) || number < 1) return null;
  return { order: Math.floor((number - 1) / 24), lot: (number - 1) % 24 + 1 };
}
