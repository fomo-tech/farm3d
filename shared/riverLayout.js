// Shared exact river trajectory and sampling for the scene and both maps.
export const RIVER_CONTROL_POINTS = Object.freeze([
  { x: 220, z: -580, w: 15 }, // 0: Thượng nguồn thác tuyết Bắc
  { x: 215, z: -480, w: 15 }, // 1: Vùng đồi giữa Phú Điền và Tân Lộc
  { x: 210, z: -380, w: 16 }, // 2: Thung lũng đồi thông cao nguyên
  { x: 205, z: -280, w: 16 }, // 3: Tiếp cận QL -234
  { x: 205, z: -234, w: 16 }, // 4: [CẦU 1: QL BẮC -234]
  { x: 206, z: -175, w: 16 }, // 5: Uốn khúc cao nguyên đồi thông
  { x: 212, z: -90,  w: 17 }, // 6: Đồi hoa phong vàng
  { x: 218, z: -20,  w: 18 }, // 7: Vịnh hòa lưu Đông Hồ Pha Lê (North Confluence)
  { x: 220, z: 20,   w: 18 }, // 8: Vịnh hòa lưu Chân Thác Nước Alpine (South Confluence)
  { x: 216, z: 55,   w: 17 }, // 9: Thung lũng tiếp cận QL 86
  { x: 212, z: 86,   w: 17 }, // 10: [CẦU 2: ĐẠI CẦU QL 86]
  { x: 218, z: 140,  w: 16 }, // 11: Meander phía Tây Làng Ven Sông
  { x: 214, z: 210,  w: 16 }, // 12: [CẦU 3: CẦU VÒM GỖ VEN SÔNG]
  { x: 218, z: 270,  w: 16 }, // 13: Vòng cung Nam Làng Ven Sông
  { x: 218, z: 330,  w: 17 }, // Inland side of the coastal promenade
  { x: 220, z: 406,  w: 18 },
  { x: 220, z: 540,  w: 20 },
  { x: 220, z: 650,  w: 20 }, // Mouth begins after the promenade ends
  { x: 155, z: 720,  w: 24 },
]);

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const x = 0.5 * (
    (2 * p1.x) +
    (-p0.x + p2.x) * t +
    (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
    (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
  );
  const z = 0.5 * (
    (2 * p1.z) +
    (-p0.z + p2.z) * t +
    (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
    (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3
  );
  const w = p1.w + (p2.w - p1.w) * t;
  return { x, z, w };
}

/**
 * Evaluates the full smooth river spline at N sample steps.
 */
export function sampleRiverSpline(controlPoints, totalSamples = 120) {
  const pts = controlPoints;
  const samples = [];
  const numSections = pts.length - 1;
  const samplesPerSection = Math.ceil(totalSamples / numSections);

  for (let i = 0; i < numSections; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[0];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

    for (let s = 0; s < samplesPerSection; s++) {
      if (i === numSections - 1 && s === samplesPerSection - 1) {
        samples.push({ x: p2.x, z: p2.z, w: p2.w });
        break;
      }
      const t = s / samplesPerSection;
      samples.push(catmullRom(p0, p1, p2, p3, t));
    }
  }

  return samples;
}

