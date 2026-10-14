import { VEHICLE_MOTION } from './vehicleMotion.js';
const poseHistory = new WeakMap();
export function clearVehiclePose(human) { if (human) poseHistory.delete(human); }

export function applyVehiclePose(human, id, moving, pedalPhase = 0, offset = {}, delta = null) {
  const profile = VEHICLE_MOTION[id];
  if (!profile) return;
  let history=poseHistory.get(human);
  if (delta!==null && !history) {
    const fields=[];
    for (const node of [human.leftArm,human.rightArm,human.leftLeg,human.rightLeg,...(human.joints?.knees||[]),...(human.joints?.elbows||[])]) {
      for (const axis of ['x','y','z']) fields.push({vector:node.rotation,axis,value:node.rotation[axis]});
    }
    fields.push({vector:human.torsoNode.position,axis:'y',value:human.torsoNode.position.y},{vector:human.torsoNode.position,axis:'z',value:human.torsoNode.position.z});
    history={fields}; poseHistory.set(human,history);
  }
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
  if (delta!==null) {
    const blend=1-Math.exp(-Math.max(0,delta)*18);
    for (const field of history.fields) {
      field.value+=(field.vector[field.axis]-field.value)*blend;
      field.vector[field.axis]=field.value;
    }
  }
}
