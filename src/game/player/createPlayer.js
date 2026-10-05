import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { FARM_CONFIG } from '../config.js';
import { FISHING_CONFIG } from '../../../shared/fishingConfig.js';
import { buildHumanMesh } from './buildHumanMesh.js';
import { createVehicleRigs } from './createVehicleRigs.js';
import { VEHICLE_MOTION, approachVehicleSpeed } from './vehicleMotion.js';
import { applyVehiclePose } from './applyVehiclePose.js';

export function createFishingRig(scene, root, human) {
  const bobberMaterial = new StandardMaterial('local-fishing-bobber-material', scene);
  bobberMaterial.diffuseColor = Color3.FromHexString('#ef4444');
  bobberMaterial.emissiveColor = Color3.FromHexString('#fb7185').scale(0.22);
  bobberMaterial.specularColor = Color3.White();
  const bobber = MeshBuilder.CreateSphere('local-fishing-bobber', { diameter: 0.18, segments: 8 }, scene);
  bobber.material = bobberMaterial;
  bobber.setEnabled(false);

  const caughtMaterial = new StandardMaterial('caught-fish-material',scene);
  caughtMaterial.diffuseColor=Color3.FromHexString('#e9a63a');
  const caughtRoot = new TransformNode('caught-fish',scene);
  const body=MeshBuilder.CreateSphere('caught-fish-body',{diameter:1,segments:8},scene);
  body.scaling.set(.65,.28,.22);body.material=caughtMaterial;body.parent=caughtRoot;
  const tail=MeshBuilder.CreateCylinder('caught-fish-tail',{height:.25,diameterTop:0,diameterBottom:.35,tessellation:3},scene);
  tail.rotation.z=-Math.PI/2;tail.position.x=-.4;tail.scaling.z=.3;tail.material=caughtMaterial;tail.parent=caughtRoot;
  caughtRoot.setEnabled(false);

  const linePoints = [new Vector3(), new Vector3(), new Vector3()];
  const line = MeshBuilder.CreateLines('local-fishing-line', { points: linePoints, updatable: true }, scene);
  line.color = Color3.FromHexString('#f8fafc');
  line.alpha = 0.86;
  line.setEnabled(false);

  const target = new Vector3();
  const baseTarget = new Vector3();
  let phase = 'idle';
  let elapsed = 0;
  let castDistance = 8;
  let animationId = 'basic_cast';

  const animationDuration = (action, id = animationId) => {
    const animation = FISHING_CONFIG.animations[id] || FISHING_CONFIG.animations.basic_cast;
    const key = action === 'cast' ? 'castMs' : action === 'reel' ? 'reelMs' : 'catchMs';
    return (animation[key] || 900) / 1000;
  };

  const hide = () => {
    phase = 'idle';
    elapsed = 0;
    bobber.setEnabled(false);
    line.setEnabled(false);
    human.clearFishingPose?.();
    caughtRoot.setEnabled(false);
  };

  const updateLine = () => {
    const hand = (human.toolGrip || human.rightArm).getAbsolutePosition();
    if(phase==='catch'){caughtRoot.position.copyFrom(hand);caughtRoot.position.y+=.3; caughtRoot.rotation.y=root.rotation.y;}
    linePoints[0].copyFrom(hand);
    linePoints[1].set(
      (hand.x + bobber.position.x) * 0.5,
      Math.max(hand.y, bobber.position.y) + 0.22,
      (hand.z + bobber.position.z) * 0.5,
    );
    linePoints[2].copyFrom(bobber.position);
    MeshBuilder.CreateLines(null, { points: linePoints, instance: line });
  };

  const update = delta => {
    if (phase === 'idle') return;
    elapsed += delta;
    const hand = (human.toolGrip || human.rightArm).getAbsolutePosition();
    if (phase === 'cast') {
      const progress = Math.min(1, elapsed / animationDuration('cast'));
      Vector3.LerpToRef(hand, baseTarget, progress, bobber.position);
      bobber.position.y += Math.sin(progress*Math.PI)*1.2;
    } else {
      bobber.position.copyFrom(target);
      bobber.position.y += Math.sin(elapsed * (phase === 'bite' ? 16 : 3.4)) * (phase === 'bite' ? 0.075 : 0.025);
      if (phase === 'bite') bobber.position.x += Math.sin(elapsed * 20) * 0.045;
      if (phase === 'bite') bobber.position.y -= .12;
      if (phase === 'reel') {
        const progress=Math.min(.75,elapsed/12);
        Vector3.LerpToRef(target,hand,progress,bobber.position);
        bobber.position.y=target.y+Math.sin(elapsed*12)*.035;
      }
    }
    updateLine();
  };

  return {
    update,
    isActive() { return phase !== 'idle'; },
    startCast(distance = 8, nextAnimationId = 'basic_cast', waterTarget = null) {
      castDistance = Math.max(3, Number(distance) || 8);
      animationId = nextAnimationId || 'basic_cast';
      const position = root.getAbsolutePosition();
      const forward = new Vector3(Math.sin(root.rotation.y), 0, Math.cos(root.rotation.y));
      baseTarget.copyFrom(position).addInPlace(forward.scale(castDistance));
      baseTarget.y = position.y + 0.13;
      if(waterTarget && [waterTarget.x,waterTarget.z].every(Number.isFinite)) {
        baseTarget.set(waterTarget.x,waterTarget.y ?? .13,waterTarget.z);
        root.rotation.y=Math.atan2(baseTarget.x-position.x,baseTarget.z-position.z);
      }
      target.copyFrom(baseTarget);
      phase = 'cast';
      elapsed = 0;
      bobber.position.copyFrom(position);
      bobber.position.y += 0.9;
      bobber.setEnabled(true);
      line.setEnabled(true);
      human.playFishingAction?.('cast', () => {
        phase = 'waiting';
        elapsed = 0;
        human.setFishingPose?.(true);
      }, animationDuration('cast'));
    },
    setPhase(nextPhase) {
      if (phase === 'idle') return;
      if (phase === 'cast') return;
      if(nextPhase==='reel' && phase!=='reel') human.playFishingAction?.('reel',()=>human.setFishingPose?.(true),animationDuration('reel'));
      if (nextPhase === 'waiting' || nextPhase === 'bite' || nextPhase === 'reel') phase = nextPhase;
    },
    playReel() {
      if (phase === 'idle') return;
      phase = 'reel';
      elapsed = 0;
      human.playFishingAction?.('reel', () => human.setFishingPose?.(true), animationDuration('reel'));
    },
    finishCatch(success = true, fish = null) {
      if (!success) { hide(); return; }
      phase = 'catch';
      elapsed = 0;
      if(fish?.color)caughtMaterial.diffuseColor=Color3.FromHexString(fish.color);
      caughtRoot.setEnabled(true);
      bobber.setEnabled(false);line.setEnabled(false);
      human.playFishingAction?.('catch', hide, animationDuration('catch'));
    },
    clear: hide,
    dispose() {
      hide();
      bobberMaterial.dispose();
      bobber.dispose();
      line.dispose();
      caughtRoot.dispose();caughtMaterial.dispose();
    },
  };
}

export function createPlayer(scene, shadowGenerator, spawn = { x: 0, z: 18 }, controls = {}) {
  const root = new TransformNode('local-player', scene);
  root.position.set(spawn.x, 0, spawn.z);

  // High-quality Stylized Chibi Anime Character
  const human = buildHumanMesh(scene, 'local-player', {
    outfitId: controls.getOutfitId?.() || 'starter',
    outfitColor: controls.getOutfitColor?.() || '#f8fafc',
    customization: controls.getCustomization?.() || null,
    skinColor: controls.getCustomization?.()?.skinColor || '#e6b08f',
    hairColor: controls.getCustomization?.()?.hairColor || '#76503b',
    overallsColor: '#2563eb',
    bootsColor: '#f7f0e6',
    hasHat: false,
    shadows: shadowGenerator,
  });
  human.root.parent = root;
  const fishingRig = createFishingRig(scene, root, human);

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
  let vehicleSpeed = 0;
  let pedalPhase = 0;
  const diagnostics = { input: false, collided: false, speed: 0, ridingBus: false };
  const movementKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight']);
  const isEditing = target => target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
  const down = event => {
    if (isEditing(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target instanceof Element && event.target.closest('[role="dialog"], [aria-modal="true"]')) return;
    // Space on a HUD button belongs to that button, not the jump action.
    if (event.code === 'Space' && event.target instanceof Element && event.target.closest('button')) return;
    if (event.code === 'Space' && !event.repeat && !airborne && !fishingRig.isActive() && !controls.isRidingBus?.()) {
      airborne = true;
      jumpVelocity = 6.8;
      jumpGroundY = root.position.y;
      event.preventDefault();
      return;
    }
    if (movementKeys.has(event.code)) {
      keys.add(event.code);
      event.preventDefault();
    }
  };
  const up = event => keys.delete(event.code);
  const clearKeys = () => keys.clear();
  const onVisibilityChange = () => { if (document.hidden) clearKeys(); };
  const onFocusIn = event => { if (isEditing(event.target) || (event.target instanceof Element && event.target.closest('[role="dialog"], [aria-modal="true"]'))) clearKeys(); };
  window.addEventListener('keydown', down, true);
  window.addEventListener('keyup', up, true);
  window.addEventListener('blur', clearKeys);
  document.addEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('focusin', onFocusIn);


  return {
    root,
    human,
    getDiagnostics() { return { ...diagnostics }; },
    getVehicleId() { return vehicleRigs.getVehicleId(); },
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
      if (fishingRig.isActive() || human.isFishingBusy?.()) {
        diagnostics.input = false;
        diagnostics.speed = 0;
        autoTarget = null;
        onArrive = null;
        human.animate(frameDelta, false, 0);
        fishingRig.update(frameDelta);
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
      let turn = 0;
      const vehicleProfile = VEHICLE_MOTION[vehicleRigs.getVehicleId()];
      vehicleSpeed = vehicleProfile ? approachVehicleSpeed(vehicleSpeed, isMoving ? speed : 0, frameDelta, vehicleProfile) : 0;
      if (isMoving && direction.lengthSquared() > 0.0001) {
        direction.normalize();
        const moveDist = (vehicleProfile ? vehicleSpeed : speed) * frameDelta;
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
        if (moved > 0.0001) {
          const desiredYaw = Math.atan2(direction.x, direction.z);
          const difference = Math.atan2(Math.sin(desiredYaw - root.rotation.y), Math.cos(desiredYaw - root.rotation.y));
          turn = difference;
          root.rotation.y += vehicleProfile ? difference * (1 - Math.exp(-18 * frameDelta)) : difference;
        }
        if (diagnostics.collided && moved < 0.0001) vehicleSpeed = 0;
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
        // Keep face/accessory animation alive while overriding riding joints.
        human.animate(frameDelta, false, 0);
        vehicleRigs.update(frameDelta, visiblyMoving, actualSpeed, turn);
        pedalPhase += actualSpeed * frameDelta * 2.4;
        applyVehiclePose(human, vehicleRigs.getVehicleId(), visiblyMoving, pedalPhase, vehicleRigs.getRiderOffset());
      } else {
        human.torsoNode.position.z = 0;
        human.root.rotation.z = 0;
        // Procedural walking / breathing animation
        human.animate(frameDelta, visiblyMoving, actualSpeed);
      }
      fishingRig.update(frameDelta);
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
    applyCustomization(customization) {
      human.applyCustomization?.(customization);
    },
    setGender(gender) {
      human.setGender?.(gender);
    },
    setSkinTone(skinTone) {
      human.setSkinTone?.(skinTone);
    },
    setLOD(level) {
      human.setLOD?.(level);
    },
    setVehicle(vehicleId) {
      if (vehicleRigs.getVehicleId() === vehicleId) return;
      vehicleSpeed = 0;
      pedalPhase = 0;
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
    startFishingCast(options = {}) {
      autoTarget = null;
      onArrive = null;
      fishingRig.startCast(options.distance || 8, options.animation || 'basic_cast', options.target);
    },
    setFishingPhase(phase) {
      fishingRig.setPhase(phase);
    },
    playFishingReel() {
      fishingRig.playReel();
    },
    finishFishingCatch(success = true, fish = null) {
      fishingRig.finishCatch(success, fish);
    },
    clearFishing() {
      fishingRig.clear();
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
      window.removeEventListener('keydown', down, true);
      window.removeEventListener('keyup', up, true);
      window.removeEventListener('blur', clearKeys);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('focusin', onFocusIn);
      fishingRig.dispose();
      vehicleRigs.dispose();
    },
  };
}
