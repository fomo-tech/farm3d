export function sampleMovement(frames, time) {
  if (!frames.length) return null;
  if (time <= frames[0].at || frames.length === 1) return frames[0];
  let before = frames[frames.length - 2];
  let after = frames[frames.length - 1];
  for (let i = 1; i < frames.length; i += 1) {
    if (frames[i].at >= time) { before = frames[i - 1]; after = frames[i]; break; }
  }
  const duration = Math.max(1, after.at - before.at);
  // Bridge small gaps; stop prediction after 100ms during a network stall.
  const amount = Math.max(0, Math.min(1 + 100 / duration, (time - before.at) / duration));
  const angle = Math.atan2(Math.sin(after.rotation - before.rotation), Math.cos(after.rotation - before.rotation));
  return {
    x: before.x + (after.x - before.x) * amount,
    y: before.y + (after.y - before.y) * Math.min(1, amount),
    z: before.z + (after.z - before.z) * amount,
    rotation: before.rotation + angle * Math.min(1, amount),
  };
}
