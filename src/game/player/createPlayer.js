import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { FARM_CONFIG } from '../config.js';
import { buildHumanMesh } from './buildHumanMesh.js';
import { createVehicleRigs } from './createVehicleRigs.js';

export function createPlayer(scene, shadowGenerator, spawn = { x: 0, z: 18 }, controls = {}) {
  const root = new TransformNode('local-player', scene);
  root.position.set(spawn.x, 0, spawn.z);

  // High-quality Stylized Chibi Anime Character
  const human = buildHumanMesh(scene, 'local-player', {
    outfitId: controls.getOutfitId?.() || 'farmer',
    outfitColor: controls.getOutfitColor?.() || '#fef3c7',
    skinColor: '#fce7d2',
    hairColor: '#4a2c1d',
    overallsColor: '#2563eb',
    bootsColor: '#78350f',
    hasHat: false,
    shadows: shadowGenerator,
  });
  human.root.parent = root;

  // 3D Vehicle Rigs (Bike, Scooter, Tractor)
  const vehicleRigs = createVehicleRigs(scene, root, shadowGenerator);
  const initialVehicle = controls.getVehicle?.() || 'walk';
  vehicleRigs.setVehicle(initialVehicle);

  const keys = new Set();
  const virtualInput = { x: 0, y: 0 };
  let sprinting = false;
  let jumpVelocity = 0;
  let jumpGroundY = root.position.y;
  let airborne = false;
  let autoTarget = null;
  let onArrive = null;
  const down = event => keys.add(event.code);
  const up = event => keys.delete(event.code);
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);


  return {
    root,
    human,
    update(delta) {
      const horizontal = (Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'))) + virtualInput.x;
      const vertical = (Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown'))) + virtualInput.y;
      const hasManualInput = horizontal !== 0 || vertical !== 0;
      let direction = Vector3.Zero();
      let isMoving = false;
      const baseSpeed = controls.getSpeed?.() || FARM_CONFIG.playerSpeed;
      const speed = baseSpeed * ((sprinting || keys.has('ShiftLeft') || keys.has('ShiftRight')) ? 1.35 : 1);

      if (hasManualInput) {
        const basis = controls.getCameraBasis?.();
        const forward = basis?.forward || new Vector3(0, 0, -1);
        const right = basis?.right || new Vector3(1, 0, 0);
        direction = forward.scale(vertical).add(right.scale(horizontal));
        autoTarget = null;
        onArrive = null;
        isMoving = true;
      } else if (autoTarget) {
        direction.copyFrom(autoTarget).subtractInPlace(root.position);
        direction.y = 0;
        if (direction.length() <= 0.28) {
          root.position.x = autoTarget.x;
          root.position.z = autoTarget.z;
          autoTarget = null;
          const action = onArrive;
          onArrive = null;
          action?.();
          human.animate(delta, false, 0);
          return;
        }
        isMoving = true;
      }

      if (isMoving && direction.lengthSquared() > 0.0001) {
        direction.normalize();
        root.position.addInPlace(direction.scale(speed * delta));
        root.rotation.y = Math.atan2(direction.x, direction.z);
      }

      if (airborne) {
        jumpVelocity -= 18 * delta;
        root.position.y += jumpVelocity * delta;
        if (root.position.y <= jumpGroundY) {
          root.position.y = jumpGroundY;
          jumpVelocity = 0;
          airborne = false;
        }
      }

      // If driving a vehicle, apply driving posture and rotate wheels
      if (vehicleRigs.hasVehicle()) {
        vehicleRigs.update(delta, isMoving, speed);
        human.torsoNode.position.y = 1.15;
        human.leftArm.rotation.x = -0.6;
        human.rightArm.rotation.x = -0.6;
        if (isMoving) {
          const pedCycle = (Date.now() * 0.008 * speed) / 4;
          human.leftLeg.rotation.x = Math.sin(pedCycle) * 0.45;
          human.rightLeg.rotation.x = -Math.sin(pedCycle) * 0.45;
        } else {
          human.leftLeg.rotation.x = 0.3;
          human.rightLeg.rotation.x = -0.2;
        }
      } else {
        // Procedural walking / breathing animation
        human.animate(delta, isMoving, speed);
      }
    },
    moveTo(target, callback) {
      autoTarget = new Vector3(target.x, root.position.y, target.z);
      onArrive = callback || null;
    },
    stop() {
      autoTarget = null;
      onArrive = null;
    },
    setOutfit(idOrColor, color) {
      if (color) {
        human.setOutfit(idOrColor, color);
      } else if (typeof idOrColor === 'string' && idOrColor.startsWith('#')) {
        human.setOutfitColor(idOrColor);
      } else {
        human.setOutfit(idOrColor);
      }
    },
    setVehicle(vehicleId) {
      vehicleRigs.setVehicle(vehicleId);
    },
    setVirtualInput(x = 0, y = 0) {
      virtualInput.x = Math.max(-1, Math.min(1, Number(x) || 0));
      virtualInput.y = Math.max(-1, Math.min(1, Number(y) || 0));
    },
    setSprinting(active) {
      sprinting = Boolean(active);
    },
    jump() {
      if (airborne) return;
      jumpGroundY = root.position.y;
      jumpVelocity = 7.2;
      airborne = true;
    },
    setActiveTool(toolId) {
      human.setActiveTool(toolId);
    },
    playAction(actionType, onHit, onEnd) {
      autoTarget = null;
      human.playAction(actionType, onHit, onEnd);
    },
    lookAt(targetPos) {
      if (!targetPos) return;
      const angle = Math.atan2(targetPos.x - root.position.x, targetPos.z - root.position.z);
      root.rotation.y = angle;
    },
    isBusy() {
      return human.isPerformingAction();
    },
    dispose() {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    },
  };
}
