import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { getTerrainHeight } from '../world/TerrainHeightSystem.js';

export function findBusExit(busRoot, isBlocked = () => false) {
  busRoot.computeWorldMatrix(true);
  const forward = busRoot.forward;
  const right = new Vector3(forward.z, 0, -forward.x);
  // Narrow village lanes need an alternative to stepping into a parcel fence.
  for (const [direction, distance] of [[right, 3.4], [right, 2.6], [right, -3.4], [forward, 5.6], [forward, -5.6]]) {
    const position = busRoot.position.add(direction.scale(distance));
    position.y = getTerrainHeight(position.x, position.z);
    if (!isBlocked(position.x, position.z)) return position;
  }
  return null;
}
