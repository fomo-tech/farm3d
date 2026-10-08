import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';

/**
 * ObjectiveMarker.js - Play Together 3D Waypoint & Energy Guiding Trail System
 * - 3D Golden Bouncing Chevron Arrow with smooth bobbing & rotation
 * - Translucent vertical light beacon beam
 * - Concentric expanding sonar ground rings
 * - Real-time animated glowing ground energy trail connecting player to target
 */
export function createObjectiveMarker(scene) {
  const root = new TransformNode('objective-marker-root', scene);
  root.position.set(0, 0, 0);

  // Materials
  const goldMat = new StandardMaterial('objective-gold-mat', scene);
  goldMat.diffuseColor = Color3.FromHexString('#fde047');
  goldMat.emissiveColor = Color3.FromHexString('#f59e0b');
  goldMat.specularColor = Color3.White();
  goldMat.specularPower = 48;

  const whiteTrimMat = new StandardMaterial('objective-trim-mat', scene);
  whiteTrimMat.diffuseColor = Color3.White();
  whiteTrimMat.emissiveColor = Color3.FromHexString('#e2e8f0');

  const beamMat = new StandardMaterial('objective-beam-mat', scene);
  beamMat.diffuseColor = Color3.FromHexString('#fef08a');
  beamMat.emissiveColor = Color3.FromHexString('#f59e0b');
  beamMat.alpha = 0.26;
  beamMat.backFaceCulling = false;

  const ringMat = new StandardMaterial('objective-ring-mat', scene);
  ringMat.diffuseColor = Color3.FromHexString('#facc15');
  ringMat.emissiveColor = Color3.FromHexString('#eab308');
  ringMat.alpha = 0.65;

  const rippleMat = new StandardMaterial('objective-ripple-mat', scene);
  rippleMat.diffuseColor = Color3.FromHexString('#38bdf8');
  rippleMat.emissiveColor = Color3.FromHexString('#0284c7');
  rippleMat.alpha = 0.5;

  const trailMat = new StandardMaterial('objective-trail-mat', scene);
  trailMat.diffuseColor = Color3.FromHexString('#fef08a');
  trailMat.emissiveColor = Color3.FromHexString('#facc15');
  trailMat.disableLighting = true;
  trailMat.alpha = 0.85;

  // 1. Floating 3D Bouncing Chevron Arrow
  const arrowNode = new TransformNode('objective-arrow-node', scene);
  arrowNode.position.y = 3.6;
  arrowNode.parent = root;

  // Arrow Cone (Main downward pointer)
  const arrowCone = MeshBuilder.CreateCylinder('objective-arrow-cone', {
    height: 1.1,
    diameterTop: 0.95,
    diameterBottom: 0.08,
    tessellation: 16,
  }, scene);
  arrowCone.position.y = 0;
  arrowCone.material = goldMat;
  arrowCone.parent = arrowNode;

  // Arrow Cap ring
  const arrowCap = MeshBuilder.CreateTorus('objective-arrow-cap', {
    diameter: 0.96,
    thickness: 0.12,
    tessellation: 20,
  }, scene);
  arrowCap.position.y = 0.55;
  arrowCap.material = whiteTrimMat;
  arrowCap.parent = arrowNode;

  // Upper diamond jewel topper
  const arrowGem = MeshBuilder.CreatePolyhedron('objective-arrow-gem', {
    type: 1, // Octahedron
    size: 0.32,
  }, scene);
  arrowGem.position.y = 1.05;
  arrowGem.material = whiteTrimMat;
  arrowGem.parent = arrowNode;

  // 2. Translucent vertical light beacon beam
  const beam = MeshBuilder.CreateCylinder('objective-beam', {
    height: 9.0,
    diameter: 0.85,
    tessellation: 14,
  }, scene);
  beam.position.y = 4.5;
  beam.material = beamMat;
  beam.parent = root;

  // 3. Ground Target Circles
  // Inner disc
  const innerDisc = MeshBuilder.CreateDisc('objective-inner-disc', {
    radius: 1.0,
    tessellation: 24,
  }, scene);
  innerDisc.rotation.x = Math.PI / 2;
  innerDisc.position.y = 0.06;
  innerDisc.material = ringMat;
  innerDisc.parent = root;

  // Outer expanding sonar ripple ring
  const outerRipple = MeshBuilder.CreateTorus('objective-outer-ripple', {
    diameter: 2.4,
    thickness: 0.1,
    tessellation: 28,
  }, scene);
  outerRipple.position.y = 0.07;
  outerRipple.material = rippleMat;
  outerRipple.parent = root;

  // 4. Energy Guiding Trail (Pool of 16 Ground Discs)
  const TRAIL_COUNT = 16;
  const trailRoot = new TransformNode('objective-trail-root', scene);
  const trailDiscs = [];

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const disc = MeshBuilder.CreateDisc(`objective-trail-disc-${i}`, {
      radius: 0.35,
      tessellation: 14,
    }, scene);
    disc.rotation.x = Math.PI / 2;
    disc.position.y = 0.08;
    disc.material = trailMat;
    disc.parent = trailRoot;
    disc.setEnabled(false);
    trailDiscs.push(disc);
  }

  let isEnabled = true;
  const currentTarget = new Vector3(0, 0, 0);

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
      if (!visible) {
        trailRoot.setEnabled(false);
      }
    },
    update(time, playerPos = null) {
      if (!isEnabled) return;

      // 1. Arrow floating bob & rotation animation
      const bob = Math.sin(time * 0.005) * 0.35;
      arrowNode.position.y = 3.6 + bob;
      arrowNode.rotation.y += 0.024;
      arrowGem.rotation.y -= 0.035;

      // 2. Concentric sonar ground ripple animation
      const ripplePhase = (time * 0.0012) % 1.0; // 0 to 1
      const rippleScale = 0.8 + ripplePhase * 2.2;
      outerRipple.scaling.x = rippleScale;
      outerRipple.scaling.z = rippleScale;
      rippleMat.alpha = Math.max(0, 0.65 * (1.0 - ripplePhase));

      // 3. Dynamic Guiding Footprints / Energy Trail Update
      if (playerPos) {
        const dx = currentTarget.x - playerPos.x;
        const dz = currentTarget.z - playerPos.z;
        const dist = Math.hypot(dx, dz);

        // Only display guiding trail when between 3m and 140m away
        if (dist > 3.2 && dist < 140) {
          trailRoot.setEnabled(true);
          const startOffset = 1.4; // 1.4m ahead of player
          const endOffset = 1.5;   // 1.5m before target

          const activeLength = Math.max(0.1, dist - startOffset - endOffset);
          const ux = dx / dist;
          const uz = dz / dist;

          for (let i = 0; i < TRAIL_COUNT; i++) {
            const fraction = (i + 1) / (TRAIL_COUNT + 1);
            const dotDist = startOffset + fraction * activeLength;

            const px = playerPos.x + ux * dotDist;
            const pz = playerPos.z + uz * dotDist;

            const disc = trailDiscs[i];
            disc.setEnabled(true);
            disc.position.set(px, 0.08, pz);

            // Travelling energy pulse wave
            const wave = ((time * 0.004) - (i * 0.22)) % 1.0;
            const pulse = 0.8 + Math.sin(wave * Math.PI) * 0.35;
            disc.scaling.set(pulse, pulse, pulse);
          }
        } else {
          trailRoot.setEnabled(false);
          for (let i = 0; i < TRAIL_COUNT; i++) {
            trailDiscs[i].setEnabled(false);
          }
        }
      } else {
        trailRoot.setEnabled(false);
      }
    },
    dispose() {
      root.dispose(false, false);
      trailRoot.dispose(false, false);
    },
  };
}
