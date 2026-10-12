// A grounded root may ease downward, but must never interpolate below its support.
export function resolveGroundedHeight(currentY, surfaceY, deltaSeconds) {
  if (!Number.isFinite(surfaceY)) return Number.isFinite(currentY) ? currentY : 0;
  if (!Number.isFinite(currentY) || currentY <= surfaceY) return surfaceY;
  const delta = Number.isFinite(deltaSeconds) ? Math.max(0, deltaSeconds) : 0;
  if (currentY - surfaceY <= .001) return surfaceY;
  return Math.max(surfaceY, currentY + (surfaceY - currentY) * Math.min(1, 16 * delta));
}
