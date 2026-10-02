import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { spawnVillageHouse } from '../../rendering/ModelAssetManager.js';

/**
 * European Rural House Archetypes using authentic 3D Village Models (Triệt tiêu 100% dạng khối)
 */
export function createRuralHousesFactory(scene, shadows) {
  return {
    createSwissChalet(x, z, scale = 1.0) {
      const s = scale * 3.8;
      return spawnVillageHouse(scene, 1, {
        position: new Vector3(x, 0, z),
        scaling: new Vector3(s, s, s),
        rotation: new Vector3(0, Math.PI / 2, 0),
        shadows,
        name: 'chalet-house-3d',
      });
    },

    createCottageHouse(x, z, scale = 1.0) {
      const s = scale * 3.6;
      return spawnVillageHouse(scene, 2, {
        position: new Vector3(x, 0, z),
        scaling: new Vector3(s, s, s),
        rotation: new Vector3(0, -Math.PI / 2, 0),
        shadows,
        name: 'cottage-house-3d',
      });
    },

    createRedBarnHouse(x, z, scale = 1.0) {
      const s = scale * 4.0;
      return spawnVillageHouse(scene, 3, {
        position: new Vector3(x, 0, z),
        scaling: new Vector3(s, s, s),
        shadows,
        name: 'barn-house-3d',
      });
    },
  };
}
