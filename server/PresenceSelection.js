export function presenceLimit(value) {
  return Number.isInteger(value) ? Math.max(8, Math.min(64, value)) : null;
}
export function selectPresenceIndices(channel, viewer, radius, limit, previous = new Map()) {
  const candidates = [];
  for (let i = 0; i < channel.length; i++) {
    const other = channel[i];
    if (other.roomId !== viewer.roomId) continue;
    const distance = Math.hypot(other.x - viewer.x, other.z - viewer.z);
    if (other !== viewer && distance > radius) continue;
    candidates.push({ i, score: other === viewer ? -Infinity : distance - (previous.has(other.playerId) ? 4 : 0) });
  }
  if (limit && candidates.length > limit) {
    candidates.sort((a,b) => a.score - b.score || a.i - b.i);
    candidates.length = limit;
  }
  return candidates.map(c => c.i).sort((a,b) => a-b);
}
