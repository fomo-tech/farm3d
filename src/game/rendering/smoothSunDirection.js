/** Smooth one-second clock updates without depending on the render frame rate. */
export function smoothSunDirection(direction, target, dt) {
  const blend = 1 - Math.exp(-8 * Math.max(0, dt));
  direction.x += (target.x - direction.x) * blend;
  direction.y += (target.y - direction.y) * blend;
  direction.z += (target.z - direction.z) * blend;
}
