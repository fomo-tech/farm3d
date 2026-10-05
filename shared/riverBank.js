export const RIVER_WEST_SPLINE_LUT = Object.freeze([
  { z: -56.6, x: 206.10 },
  { z: -46.3, x: 206.96 },
  { z: -36.6, x: 207.75 },
  { z: -27.6, x: 208.45 },
  { z: -19.3, x: 209.03 },
  { z: -12.0, x: 209.57 },
  { z: -5.6,  x: 210.06 },
  { z: 0.1,   x: 210.47 },
  { z: 5.2,   x: 210.78 },
  { z: 10.1,  x: 210.99 },
  { z: 14.8,  x: 211.06 },
  { z: 19.7,  x: 211.00 },
  { z: 24.7,  x: 210.84 },
  { z: 29.6,  x: 210.48 },
  { z: 34.5,  x: 209.99 },
  { z: 39.3,  x: 209.40 },
  { z: 44.2,  x: 208.76 },
  { z: 49.1,  x: 208.13 },
  { z: 53.8,  x: 207.58 },
  { z: 58.0,  x: 206.96 },
  { z: 61.8,  x: 206.23 },
  { z: 65.7,  x: 205.42 },
  { z: 69.9,  x: 204.63 },
]);

/**
 * Tính toán chính xác tọa độ X bờ Tây của Đại Sông Uốn Lượn tại bất kỳ cao độ Z nào.
 * Khớp mộng từng milimet với mesh của dòng sông, triệt tiêu hoàn toàn khe hở và Z-fighting.
 */
export function getRiverWestBankX(z) {
  if (z <= RIVER_WEST_SPLINE_LUT[0].z) return RIVER_WEST_SPLINE_LUT[0].x;
  const last = RIVER_WEST_SPLINE_LUT[RIVER_WEST_SPLINE_LUT.length - 1];
  if (z >= last.z) return last.x;
  for (let i = 0; i < RIVER_WEST_SPLINE_LUT.length - 1; i++) {
    const p0 = RIVER_WEST_SPLINE_LUT[i];
    const p1 = RIVER_WEST_SPLINE_LUT[i + 1];
    if (z >= p0.z && z <= p1.z) {
      const t = (z - p0.z) / (p1.z - p0.z);
      return p0.x + (p1.x - p0.x) * t;
    }
  }
  return 209.5;
}
