// Route-length spacing and one snapshot per frame keep traffic independent of
// array update order. Distances include the 7.8m bus body and a following gap.
export function routePlacement(points, fraction) {
  const lengths = points.map((point, i) => {
    const next = points[(i + 1) % points.length];
    return Math.hypot(next.x - point.x, next.z - point.z);
  });
  let distance = lengths.reduce((sum, n) => sum + n, 0) * ((fraction % 1 + 1) % 1);
  for (let i = 0; i < lengths.length; i++) {
    if (distance < lengths[i]) return { initialSegment: i, initialProgress: distance / lengths[i] };
    distance -= lengths[i];
  }
  return { initialSegment: 0, initialProgress: 0 };
}
export function trafficSpeedLimits(buses) {
  const snapshots = buses.map(bus => ({ x: bus.root.position.x, z: bus.root.position.z, yaw: bus.root.rotation.y, speed: bus.getCurrentSpeed() }));
  return snapshots.map((self, i) => {
    const fx = Math.sin(self.yaw), fz = Math.cos(self.yaw);
    let limit = Infinity;
    snapshots.forEach((other, j) => {
      if (i === j || Math.cos(other.yaw - self.yaw) < .7) return;
      const dx = other.x - self.x, dz = other.z - self.z;
      const ahead = dx * fx + dz * fz, lateral = Math.abs(dx * fz - dz * fx);
      if (ahead <= 0 || ahead > 40 || lateral > 1.4) return;
      const gap = ahead - 11;
      limit = Math.min(limit, gap <= 0 ? 0 : Math.min(Math.sqrt(2 * 6 * gap), other.speed + gap / 2));
    });
    return limit;
  });
}
