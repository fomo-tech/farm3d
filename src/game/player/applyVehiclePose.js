import { VEHICLE_MOTION } from './vehicleMotion.js';

export function applyVehiclePose(human, id, moving, pedalPhase = 0, offset = {}) {
  const profile = VEHICLE_MOTION[id];
  if (!profile) return;
  const standing = id === 'skateboard' || id === 'hoverboard';
  human.torsoNode.position.y = profile.seat + (offset.height || 0);
  human.root.rotation.z = offset.lean || 0;
  human.torsoNode.position.z = profile.offsetZ;
  human.leftArm.rotation.x = standing ? -0.15 : -0.85;
  human.rightArm.rotation.x = standing ? -0.15 : -0.85;
  human.leftArm.rotation.z = standing ? -0.22 : 0;
  human.rightArm.rotation.z = standing ? 0.22 : 0;
  const pedal = moving && id === 'bike' ? Math.sin(pedalPhase) * 0.35 : 0;
  human.leftLeg.rotation.x = standing ? -0.12 : -0.85 + pedal;
  human.rightLeg.rotation.x = standing ? 0.12 : -0.85 - pedal;
  human.joints?.knees?.forEach((joint, index) => { joint.rotation.x = standing ? 0.18 : 1.1 + (index ? -pedal : pedal); });
  human.joints?.elbows?.forEach(joint => { joint.rotation.x = standing ? -0.15 : -0.55; });
}
