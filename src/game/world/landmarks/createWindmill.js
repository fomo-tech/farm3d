import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { MODEL_PATHS, spawnModelSync } from '../../rendering/ModelAssetManager.js';

/**
 * Creates a charming 3D Windmill with rotating sails.
 */
export function createWindmill(scene, shadows, position = { x: -156, y: 0, z: 49 }) {
  const root = new TransformNode('landmark-windmill', scene);
  root.position.set(position.x, position.y || 0, position.z);

  const hubNode = new TransformNode('windmill-hub', scene);
  hubNode.position.set(0, 8.5, 2.5);
  hubNode.parent = root;

  // Spawn 3D Windmill Model
  const s = 4.5;
  const windmillMesh = spawnModelSync(scene, MODEL_PATHS.town.windmill, {
    position: new Vector3(0, 0, 0),
    scaling: new Vector3(s, s, s),
    shadows,
    name: 'windmill-3d',
    onLoaded: ({ childMeshes }) => {
      // Tìm cánh cối xay gió để xoay theo gió
      childMeshes.forEach(mesh => {
        if (mesh.name.toLowerCase().includes('blade') || mesh.name.toLowerCase().includes('sail') || mesh.name.toLowerCase().includes('fan')) {
          mesh.parent = hubNode;
        }
      });
    },
  });
  windmillMesh.parent = root;

  return {
    root,
    hubNode,
    update(time, delta = 0.016) {
      hubNode.rotation.z += delta * 0.85;
    },
  };
}
