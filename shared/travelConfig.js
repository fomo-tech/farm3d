// 10 xu to activate, plus 2 xu for each started 10 metres.
export function travelCost(from, to) {
  const distance = Math.hypot(to.x - from.x, to.z - from.z);
  if (!Number.isFinite(distance)) throw new Error('Vị trí dịch chuyển không hợp lệ.');
  return distance < 1 ? 0 : 10 + Math.ceil(distance / 10) * 2;
}
