import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';

export function createObjectiveMarker(scene) {
  const root = new TransformNode('objective-marker-root', scene);
  root.position.set(0, 0, 0);

  const goldMat = new StandardMaterial('objective-gold-mat', scene);
  goldMat.diffuseColor = Color3.FromHexString('#fcd34d');
  goldMat.emissiveColor = Color3.FromHexString('#f59e0b');
  goldMat.specularColor = Color3.White();

  const beamMat = new StandardMaterial('objective-beam-mat', scene);
  beamMat.diffuseColor = Color3.FromHexString('#34d399');
  beamMat.emissiveColor = Color3.FromHexString('#10b981');
  beamMat.alpha = 0.35;

  const ringMat = new StandardMaterial('objective-ring-mat', scene);
  ringMat.diffuseColor = Color3.FromHexString('#38bdf8');
  ringMat.emissiveColor = Color3.FromHexString('#0284c7');
  ringMat.alpha = 0.6;

  // 1. Floating Downward Arrow (Cone pointing down)
  const arrowNode = new TransformNode('objective-arrow-node', scene);
  arrowNode.position.y = 3.2;
  arrowNode.parent = root;

  const arrowCone = MeshBuilder.CreateCylinder('objective-arrow-cone', {
    height: 0.9,
    diameterTop: 0.8,
    diameterBottom: 0.05,
    tessellation: 12,
  }, scene);
  arrowCone.position.y = 0;
  arrowCone.material = goldMat;
  arrowCone.parent = arrowNode;

  const arrowStem = MeshBuilder.CreateCylinder('objective-arrow-stem', {
    height: 0.7,
    diameter: 0.3,
    tessellation: 8,
  }, scene);
  arrowStem.position.y = 0.75;
  arrowStem.material = goldMat;
  arrowStem.parent = arrowNode;

  // 2. Translucent vertical light beam
  const beam = MeshBuilder.CreateCylinder('objective-beam', {
    height: 6.0,
    diameter: 0.9,
    tessellation: 12,
  }, scene);
  beam.position.y = 3.0;
  beam.material = beamMat;
  beam.parent = root;

  // 3. Ground Target Ring
  const groundRing = MeshBuilder.CreateCylinder('objective-ground-ring', {
    height: 0.06,
    diameter: 2.8,
    tessellation: 24,
  }, scene);
  groundRing.position.y = 0.08;
  groundRing.material = ringMat;
  groundRing.parent = root;

  let isEnabled = true;
  let currentTarget = new Vector3(0, 0, 0);

  return {
    root,
    currentTarget,
    setTarget(x, y = 0, z) {
      currentTarget.set(x, y, z);
      root.position.set(x, y, z);
    },
    setVisible(visible) {
      isEnabled = visible;
      root.setEnabled(visible);
    },
    update(time) {
      if (!isEnabled) return;
      const bob = Math.sin(time * 0.004) * 0.25;
      arrowNode.position.y = 3.0 + bob;
      arrowNode.rotation.y += 0.03;

      const pulse = 1.0 + Math.sin(time * 0.0035) * 0.14;
      groundRing.scaling.x = pulse;
      groundRing.scaling.z = pulse;
    },
    dispose() {
      root.dispose(false, false);
    },
  };
}
