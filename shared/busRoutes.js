import { COASTAL_BUS_CONFIG } from './beachConfig.js';
import { LAKE_CONFIG } from './lakeConfig.js';
import { WORLD_VILLAGES } from './villageLayout.js';

export const BUS_PASSENGER_OFFSET_Z = 2.8;

// ROUTE 01: Hoa Mai Express - Highway 86 (Bến cuối tại Trạm Cửa Nam z = 54, quay đầu tại z = 50)
const route01Waypoints = [
  [0, 54],    // 0: Trạm Cửa Nam - Quảng Trường
  [0, 50],    // 1: Quay đầu Cửa Nam
  [0, 86],    // 2: Trạm Bình Minh
  [-300, 86], // 3: Trạm Hoa Mai
  [-594, 86], // 4: Trạm Đồi Gió
  [-680, 86], // 5: Turnaround Tây
  [-594, 86], // 6: Trạm Đồi Gió
  [-300, 86], // 7: Trạm Hoa Mai
  [0, 86],    // 8: Trạm Bình Minh
  [300, 86],  // 9: Trạm Ven Sông
  [594, 86],  // 10: Trạm An Nhiên
  [680, 86],  // 11: Turnaround Đông
  [594, 86],  // 12: Trạm An Nhiên
  [300, 86],  // 13: Trạm Ven Sông
  [0, 86],    // 14: Trạm Bình Minh
];
const route01Stops = [
  { id: 'stop-south-gate', name: 'Trạm Cửa Nam - Quảng Trường', waypointIndex: 0 },
  { id: 'stop-bm', name: 'Làng Bình Minh', waypointIndex: 2 },
  { id: 'stop-hm', name: 'Làng Hoa Mai', waypointIndex: 3 },
  { id: 'stop-dg', name: 'Làng Đồi Gió', waypointIndex: 4 },
  { id: 'stop-vs', name: 'Làng Ven Sông', waypointIndex: 9 },
  { id: 'stop-an', name: 'Làng An Nhiên', waypointIndex: 10 },
];

// ROUTE 02: Biển Xanh Coastal - Highway 406 (Bến cuối tại Trạm Cửa Nam z = 54, quay đầu tại z = 50)
const route02Waypoints = COASTAL_BUS_CONFIG.waypoints.map(([x,z]) => [x === -315 ? -620 : x === 315 ? 620 : x, z]);
const route02Stops = [
  { id: 'stop-south-gate', name: 'Trạm Cửa Nam - Quảng Trường', waypointIndex: 0 },
  { id: 'stop-bm', name: 'Làng Bình Minh', waypointIndex: 2 },
  { id: 'stop-beach', name: 'Bãi Biển Bình Minh', waypointIndex: COASTAL_BUS_CONFIG.stops.beach },
  { id: 'stop-tp', name: 'Làng Thu Phong', waypointIndex: COASTAL_BUS_CONFIG.stops.thuPhong },
  { id: 'stop-hd', name: 'Làng Hướng Dương', waypointIndex: COASTAL_BUS_CONFIG.stops.huongDuong },
];

// ROUTE 03: Cao Nguyên Highland - Northern Highway -234 & Phu Dien (Bến cuối tại Trạm Cửa Bắc z = -54, quay đầu tại z = -50)
const route03Waypoints = [
  [0, -54],    // 0: Trạm Cửa Bắc - Tòa Thị Chính
  [0, -50],    // 1: Quay đầu Cửa Bắc
  [0, -90],    // 2: Tòa Thị Chính
  [0, -234],   // 3: Ngã tư QL -234
  [-300, -234],// 4: Trạm Thanh Hà
  [-594, -234],// 5: Trạm Mộc Lan
  [-680, -234],// 6: Turnaround Tây
  [-300, -234],// 7: Trạm Thanh Hà
  [0, -234],   // 8: Ngã tư QL -234
  [0, -394],   // 9: Trạm Phú Điền
  [0, -408],   // 10: Turnaround Phú Điền
  [0, -234],   // 11: Ngã tư QL -234
  [300, -234], // 12: Trạm Tân Lộc
  [594, -234], // 13: Trạm Hải Vân
  [680, -234], // 14: Turnaround Đông
  [300, -234], // 15: Trạm Tân Lộc
  [0, -234],   // 16: Ngã tư QL -234
  [0, -90],    // 17: Tòa Thị Chính
];
const route03Stops = [
  { id: 'stop-north-gate', name: 'Trạm Cửa Bắc - Tòa Thị Chính', waypointIndex: 0 },
  { id: 'stop-th', name: 'Làng Thanh Hà', waypointIndex: 4 },
  { id: 'stop-ml', name: 'Làng Mộc Lan', waypointIndex: 5 },
  { id: 'stop-pd', name: 'Làng Phú Điền', waypointIndex: 9 },
  { id: 'stop-tl', name: 'Làng Tân Lộc', waypointIndex: 12 },
  { id: 'stop-hv', name: 'Làng Hải Vân', waypointIndex: 13 },
];

// ROUTE 04A: Phố Chợ Phía Tây Shuttle (Bến cuối tại Trạm Cửa Tây x = -54, quay đầu tại x = -50)
const route04AWaypoints = [
  [-54,0], [-118,0], [-130,0], [-122,0], [-122,86], [-122,0],
];
const route04AStops = [
  { id: 'stop-west-gate', name: 'Trạm Cửa Tây - Phố Chợ', waypointIndex: 0 },
  { id: 'stop-market', name: 'Phố Chợ Phía Tây', waypointIndex: 1 },
];

// ROUTE 04B: Hồ Pha Lê & Bến Câu Cá Shuttle (Bến cuối tại Trạm Cửa Đông x = 54, quay đầu tại x = 50)
const route04BWaypoints = [
  [54,0], [LAKE_CONFIG.busStop.x,0], [LAKE_CONFIG.busStop.turnX,0],
  [122,0], [122,86], [122,0],
];
const route04BStops = [
  { id: 'stop-east-gate', name: 'Trạm Cửa Đông - Hồ Pha Lê', waypointIndex: 0 },
  { id: 'stop-lake', name: 'Hồ Pha Lê', waypointIndex: 1 },
];


export const BUS_ROUTES = {
  '01': { points: route01Waypoints, stops: route01Stops, speed: 22 },
  '02': { points: route02Waypoints, stops: route02Stops, speed: 22 },
  '03': { points: route03Waypoints, stops: route03Stops, speed: 22 },
  '04A': { points: route04AWaypoints, stops: route04AStops, speed: 14 },
  '04B': { points: route04BWaypoints, stops: route04BStops, speed: 14 },
};

function localRoute(village) {
  const points = [], stops = [];
  const push = (x, z, name) => {
    const last = points.at(-1);
    if (last && last[0] === x && last[1] === z) return;
    const waypointIndex = points.push([x, z]) - 1;
    if (name) stops.push({ id: `local-${village.order}-${waypointIndex}`, name, waypointIndex });
  };
  const x = village.offsetX, z = village.offsetZ;
  push(x, z + 86, `Cổng ${village.name}`);
  push(x, z + 98);
  push(x - 60, z + 98);
  push(x - 60, z + 86);
  push(x - 60, z + 98);
  // Zigzag every farm crossroad; split at the spine for a stop near each row.
  for (let row = 0; row <= 6; row++) {
    const laneZ = z + 98 + row * 28;
    const from = row % 2 ? 60 : -60, to = -from;
    push(x + from, laneZ);
    push(x, laneZ, `${village.name} · Đường nông trại ${row + 1}`);
    push(x + to, laneZ);
  }
  // Complete both rings and the central spine, including the turnaround.
  push(x + 60, z + 86);
  push(x + 60, z + 266);
  push(x - 60, z + 266);
  push(x - 60, z + 98);
  push(x, z + 98);
  push(x, z + 266);
  push(x, z + (village.order === 0 ? 278 : 280), `${village.name} · Cuối làng`);
  push(x, z + 98);
  return { code: `L${String(village.order + 1).padStart(2, '0')}`, name: `Nội làng ${village.name.replace('Làng ', '')}`, points, stops, speed: 14 };
}
export const LOCAL_BUS_ROUTES = WORLD_VILLAGES.map(localRoute);

const backbonePoints = [[0, -54], [0, -650], [-680, -650]];
const backboneStops = [{ id: 'backbone-city', name: 'Trạm Cửa Bắc', waypointIndex: 0 }];
for (const x of [-600, -300, 0, 300, 600]) {
  backbonePoints.push([x, -650]);
  backboneStops.push({ id: `backbone-${x}`, name: `Vành đai Bắc · Nhánh ${x}`, waypointIndex: backbonePoints.length - 1 });
  const villages = WORLD_VILLAGES.filter(v => v.offsetX === x).sort((a,b) => a.gate.z - b.gate.z);
  // The plaza is pedestrian-only: the central branch ends at Cửa Bắc.
  for (const village of villages.filter(v => x !== 0 || v.gate.z < -54)) {
    backbonePoints.push([x, village.gate.z]);
    backboneStops.push({ id: `backbone-gate-${village.id}`, name: `Cổng ${village.name}`, waypointIndex: backbonePoints.length - 1 });
  }
  backbonePoints.push([x, -650]);
}
backbonePoints.push([680, -650], [0, -650]);
export const BACKBONE_BUS_ROUTE = { code: '05', name: 'Vành đai Bắc · Liên làng', points: backbonePoints, stops: backboneStops, speed: 22 };
export const PORT_BUS_ROUTE = {
  code: '06', name: 'Quảng trường · Bến tàu', speed: 14,
  points: [[0,54],[0,310],[0,322],[-42,322],[0,322],[0,310]],
  stops: [
    {id: 'port-city', name: 'Trạm Cửa Nam', waypointIndex: 0},
    {id: 'port-beach', name: 'Bãi Biển Bình Minh', waypointIndex: 1},
    {id: 'port-terminal', name: 'Bến tàu hơi nước', waypointIndex: 3},
  ],
};
for (const route of [...LOCAL_BUS_ROUTES, BACKBONE_BUS_ROUTE, PORT_BUS_ROUTE]) BUS_ROUTES[route.code] = route;
