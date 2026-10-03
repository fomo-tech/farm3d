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
    outfitId: controls.getOutfitId?.() || 'starter',
    outfitColor: controls.getOutfitColor?.() || '#f8fafc',
    skinColor: '#fce7d2',
    hairColor: '#76503b',
    overallsColor: '#2563eb',
    bootsColor: '#f7f0e6',
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
  let autoTargetStuckFrames = 0;
  const diagnostics = { input: false, collided: false, speed: 0, ridingBus: false };
  const movementKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight']);
  const isEditing = target => target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
  const down = event => {
    if (isEditing(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.code === 'Space' && !airborne && !controls.isRidingBus?.()) {
      airborne = true;
      jumpVelocity = 6.8;
      jumpGroundY = root.position.y;
      event.preventDefault();
      return;
    }
    if (movementKeys.has(event.code)) {
      keys.add(event.code);
      if (event.code.startsWith('Arrow')) event.preventDefault();
    }
  };
  const up = event => keys.delete(event.code);
  const clearKeys = () => keys.clear();
  const onVisibilityChange = () => { if (document.hidden) clearKeys(); };
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  window.addEventListener('blur', clearKeys);
  document.addEventListener('visibilitychange', onVisibilityChange);


  return {
    root,
    human,
    getDiagnostics() { return { ...diagnostics }; },
    update(delta) {
      const frameDelta = Math.min(Math.max(Number(delta) || 0, 0), 0.1);
      if (controls.isRidingBus?.()) {
        diagnostics.ridingBus = true;
        autoTarget = null;
        onArrive = null;
        airborne = false;
        human.torsoNode.position.y = 1.1;
        human.leftLeg.rotation.x = -1.2;
        human.rightLeg.rotation.x = -1.2;
        human.leftArm.rotation.x = -0.4;
        human.rightArm.rotation.x = -0.4;
        return;
      }
      const horizontal = (Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'))) + virtualInput.x;
      const vertical = (Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown'))) + virtualInput.y;
      const hasManualInput = horizontal !== 0 || vertical !== 0;
      diagnostics.input = hasManualInput;
      diagnostics.ridingBus = false;
      diagnostics.collided = false;
      diagnostics.speed = 0;
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
        autoTargetStuckFrames = 0;
        isMoving = true;
      } else if (autoTarget) {
        direction.copyFrom(autoTarget).subtractInPlace(root.position);
        direction.y = 0;
        if (direction.length() <= 0.28) {
          const finalStep = controls.resolveMovement?.(
            root.position.x, root.position.z,
            autoTarget.x - root.position.x, autoTarget.z - root.position.z,
          ) || { x: autoTarget.x, z: autoTarget.z };
          const arrived = Math.hypot(finalStep.x - autoTarget.x, finalStep.z - autoTarget.z) < 0.06;
          root.position.x = finalStep.x;
          root.position.z = finalStep.z;
          autoTarget = null;
          const action = onArrive;
          onArrive = null;
          autoTargetStuckFrames = 0;
          if (arrived) action?.();
          human.animate(frameDelta, false, 0);
          return;
        }
        isMoving = true;
      }

      let actualSpeed = 0;
      if (isMoving && direction.lengthSquared() > 0.0001) {
        direction.normalize();
        const moveDist = speed * frameDelta;
        const dx = direction.x * moveDist;
        const dz = direction.z * moveDist;
        const prevX = root.position.x;
        const prevZ = root.position.z;

        if (controls.resolveMovement) {
          const resolved = controls.resolveMovement(prevX, prevZ, dx, dz);
          diagnostics.collided = Boolean(resolved.collided);
          root.position.x = resolved.x;
          root.position.z = resolved.z;

          if (autoTarget) {
            const movedDistSq = (resolved.x - prevX) ** 2 + (resolved.z - prevZ) ** 2;
            if (resolved.collided && movedDistSq < 0.0001) {
              autoTargetStuckFrames++;
              if (autoTargetStuckFrames > 30) {
                autoTarget = null;
                onArrive = null;
                autoTargetStuckFrames = 0;
              }
            } else {
              autoTargetStuckFrames = 0;
            }
          }
        } else {
          root.position.x += dx;
          root.position.z += dz;
        }
        const moved = Math.hypot(root.position.x - prevX, root.position.z - prevZ);
        actualSpeed = frameDelta > 0 ? moved / frameDelta : 0;
        if (moved > 0.0001) root.rotation.y = Math.atan2(direction.x, direction.z);
      }
      const visiblyMoving = actualSpeed > 0.05;
      diagnostics.speed = actualSpeed;

      // Natural 3D terrain height adaptation (smoothly climb knolls without sinking)
      const targetGroundY = controls.getTerrainHeight ? controls.getTerrainHeight(root.position.x, root.position.z) : 0;

      if (airborne) {
        jumpVelocity -= 18 * frameDelta;
        root.position.y += jumpVelocity * frameDelta;
        if (root.position.y <= targetGroundY) {
          root.position.y = targetGroundY;
          jumpVelocity = 0;
          airborne = false;
          jumpGroundY = targetGroundY;
        }
      } else {
        const diff = targetGroundY - root.position.y;
        if (Math.abs(diff) > 0.001) {
          // Responsive 16x frame delta lerp for seamless, stable slope movement
          root.position.y += diff * Math.min(1.0, 16.0 * frameDelta);
        } else {
          root.position.y = targetGroundY;
        }
        jumpGroundY = root.position.y;
      }

      // If driving a vehicle, apply driving posture and rotate wheels
      if (vehicleRigs.hasVehicle()) {
        vehicleRigs.update(frameDelta, visiblyMoving, actualSpeed);
        human.torsoNode.position.y = 1.15;
        human.leftArm.rotation.x = -0.6;
        human.rightArm.rotation.x = -0.6;
        if (visiblyMoving) {
          const pedCycle = (Date.now() * 0.008 * speed) / 4;
          human.leftLeg.rotation.x = Math.sin(pedCycle) * 0.45;
          human.rightLeg.rotation.x = -Math.sin(pedCycle) * 0.45;
        } else {
          human.leftLeg.rotation.x = 0.3;
          human.rightLeg.rotation.x = -0.2;
        }
      } else {
        // Procedural walking / breathing animation
        human.animate(frameDelta, visiblyMoving, actualSpeed);
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
      window.removeEventListener('blur', clearKeys);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    },
  };
}
