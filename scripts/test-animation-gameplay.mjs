import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {buildHumanMesh} from '../src/game/player/buildHumanMesh.js';
import {ACTION_MOTION_PROFILES, ACTION_CONTACT, actionMotionProgress} from '../src/game/player/ActionMotion.js';
import {createJumpMotion} from '../src/game/player/JumpMotion.js';
import {applyVehiclePose,clearVehiclePose} from '../src/game/player/applyVehiclePose.js';
import {VEHICLE_MOTION} from '../src/game/player/vehicleMotion.js';
import {CHARACTER_ANIMATION_CONFIG,CHARACTER_RENDER_CONFIG} from '../shared/characterConfig.js';
globalThis.OffscreenCanvas ||= class {
  constructor(width,height) { this.width=width;this.height=height; }
  getContext() {return new Proxy({}, {get:(target,key)=> key==='measureText'?()=>({width:100}):key.includes('Gradient')?()=>({addColorStop(){}}):()=>{}});}
};
for(const action of Object.keys(ACTION_MOTION_PROFILES)) {
  let previous=0;
  for(let i=0;i<=1000;i++) {
    const p=actionMotionProgress(action,i/1000);
    assert.ok(p>=previous-1e-10&&p<=1,`${action}: monotonic finite timing`);
    previous=p;
  }
  assert.equal(previous,1);
}
const engine=new NullEngine(),scene=new Scene(engine);
const human=buildHumanMesh(scene,'animation-test',{fixedAppearance:true});
const nodes=[human.leftArm,human.rightArm,human.leftLeg,human.rightLeg,human.headNode,human.torsoNode,...human.joints.elbows,...human.joints.knees];
const meshCount=scene.meshes.length;
for(const rate of [15,30,60,120]) {
  for(const [action,duration] of Object.entries(CHARACTER_ANIMATION_CONFIG.actionDurations)) {
    if(action==='default')continue;
    let hits=0,ends=0;
    human.playAction(action,()=>hits++,()=>ends++);
    for(let i=0;i<Math.ceil((duration+.8)*rate);i++) {
      human.animate(1/rate,false,0);
      for(const node of nodes) assert.ok([...node.rotation.asArray(),...node.position.asArray()].every(Number.isFinite),`${action} ${rate} FPS finite pose`);
    }
    assert.equal(hits,ACTION_CONTACT[action]===undefined?0:1,`${action}: single gameplay contact at ${rate} FPS`);
    assert.equal(ends,1,`${action}: single completion`);
    assert.equal(human.isPerformingAction(),false);
  }
}
let completed=0;
human.playFishingAction('cast',()=>{completed++;human.playFishingAction('reel',()=>completed++);});
for(let i=0;i<180;i++)human.animate(1/60,false,0);
assert.equal(completed,2,'Reentrant fishing completion keeps the new callback');
for(let i=0;i<60;i++)human.animate(1/60,true,9.45,{airborne:true,verticalSpeed:2});
assert.ok(human.joints.knees[0].rotation.x>.2,'Jump bends knees');
for(let i=0;i<120;i++)human.animate(1/60,false,0,{airborne:false});
assert.ok(human.torsoNode.position.y >= CHARACTER_RENDER_CONFIG.proportions.hipHeight && human.torsoNode.position.y < CHARACTER_RENDER_CONFIG.proportions.hipHeight + .25, 'Landing settles with footwear above the support plane');
assert.equal(scene.meshes.length,meshCount,'Animation never creates meshes');
for(const id of Object.keys(VEHICLE_MOTION)) {
  clearVehiclePose(human);
  const before=human.torsoNode.position.y;
  applyVehiclePose(human,id,false,0,{},0);
  assert.equal(human.torsoNode.position.y,before,'Mount at zero dt does not snap');
  for(let i=0;i<120;i++) applyVehiclePose(human,id,false,0,{},1/60);
  assert.ok(Math.abs(human.torsoNode.position.y-VEHICLE_MOTION[id].seat)<1e-6,`${id}: blended seat converges`);
}
const jump=createJumpMotion();
jump.update(1/60,true,4);
assert.ok(jump.update(1/60,false,0).landing>.5,'Ground contact triggers landing response');
for(let i=0;i<120;i++)jump.update(1/60,false,0);
assert.ok(jump.update(0,false,0).landing<1e-9,'Landing settles');
scene.dispose();engine.dispose();
console.log('PASS: all actions at 15/30/60/120 FPS, single contact, callback chaining, jump/landing and zero mesh allocations');
