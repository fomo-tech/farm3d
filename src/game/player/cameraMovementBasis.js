import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';

// ArcRotateCamera alpha is independent of target-follow lag and beta/zoom.
// In Babylon's left-handed world, screen-right is up × forward.
export function cameraMovementBasis(alpha) {
  const angle = Number.isFinite(alpha) ? alpha : Math.PI / 2;
  return {
    forward: new Vector3(-Math.cos(angle), 0, -Math.sin(angle)),
    right: new Vector3(-Math.sin(angle), 0, Math.cos(angle)),
  };
}
