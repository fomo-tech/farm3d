import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { createFishingRig } from '../src/game/player/createPlayer.js';
import { FISHING_CONFIG } from '../shared/fishingConfig.js';

const engine = new NullEngine();
const scene = new Scene(engine);
const root = new TransformNode('test-player', scene);
const torsoNode = new TransformNode('test-torso', scene);
torsoNode.parent = root;
torsoNode.position.y = .6;
const toolGrip = new TransformNode('test-hand', scene);
toolGrip.parent = torsoNode;
toolGrip.position.set(-.16, .06, .32);
const human = {
  torsoNode, toolGrip,
  playFishingAction: (_action, done) => done?.(),
  setFishingPose() {}, setFishingCatchPose() {}, clearFishingPose() {},
};
const rig = createFishingRig(scene, root, human);
rig.startCast(6, 'basic_cast', { x: 0, y: .13, z: 6 }, 'large');
rig.update(1);
rig.setPhase('waiting', 12000);
rig.update(.1);
assert.ok(scene.getMeshByName('fishing-water-ripple-0').isEnabled(), 'Phao chờ có gợn nước');
const ripple=scene.getMeshByName('fishing-water-ripple-0');const radius=ripple.scaling.x;rig.update(.2);assert.notEqual(ripple.scaling.x,radius,'Gợn nước lan rộng theo thời gian');
assert.ok(scene.getMeshByName('fishing-float-tip').isEnabled(),'Đầu phao nổi rõ');
assert.equal(scene.getMeshByName('fishing-fish-shadow').isEnabled(),false,'Chờ cá tìm mồi chưa hiện bóng cá');
rig.setPhase('waiting', 2800);
rig.update(.1);
const shadow = scene.getMeshByName('fishing-fish-shadow');
assert.ok(shadow.isEnabled(), 'Bóng cá xuất hiện trước khi cắn');
const waitingDistance = Math.hypot(shadow.position.x, shadow.position.z - 6);
rig.setPhase('bite', 0);
rig.update(.1);
assert.ok(Math.hypot(shadow.position.x, shadow.position.z - 6) < waitingDistance, 'Bóng cá tiến tới phao');
assert.ok(scene.getMeshByName('fishing-bite-splash').isEnabled(), 'Có hiệu ứng đớp mồi');
assert.ok(scene.getMeshByName('fishing-water-drop-0').isEnabled(),'Cá cắn tạo tia nước');
assert.ok(scene.getMeshByName('fishing-bite-alert').isEnabled(), 'Dấu chấm than xuất hiện trên bóng cá');
assert.ok(shadow.scaling.z > shadow.scaling.x * 2, 'Bóng cá dài, rõ như tham chiếu');
assert.ok(shadow.scaling.z > .7, 'Bóng cá lớn tương ứng hạng kích thước');
const largeLength=shadow.scaling.z;
rig.clear();
assert.ok(!ripple.isEnabled(),'Thu cần tắt gợn nước');
assert.ok(!scene.getMeshByName('fishing-water-drop-0').isEnabled(),'Thu cần tắt tia nước');
rig.startCast(6, 'basic_cast', { x: 0, y: .13, z: 6 }, 'small');
rig.update(1);rig.setPhase('waiting',2800);rig.update(.1);
assert.ok(shadow.scaling.z < largeLength, 'Cá nhỏ tạo bóng nhỏ hơn cá lớn');
rig.setPhase('bite',0);rig.update(.1);
const publicFight={hookedAt:Date.now()-2500,pull:35,tension:70,fightProfile:{restMs:1000,warningMs:1000,rushMs:3000,cruiseMs:1000,direction:1}};
rig.setPhase('reel',null,publicFight);rig.update(.1);
assert.ok(shadow.isEnabled(),'Bóng cá vẫn hiện trong lượt kéo');
assert.ok(scene.getMeshByName('fishing-bite-splash').isEnabled(),'Cá vùng tạo gợn nước trong lượt kéo');
assert.ok(!scene.getMeshByName('fishing-bite-alert').isEnabled(),'Dấu cá cắn được tắt khi đang kéo');


rig.clear();rig.startCast(6,'basic_cast',{x:0,y:.13,z:6});rig.update(1);
rig.setPhase('waiting',2000,{shadowShape:'eel',shadowSize:'huge'});rig.update(.1);const eelRatio=shadow.scaling.z/shadow.scaling.x;
rig.setPhase('waiting',2000,{shadowShape:'flat',shadowSize:'huge'});rig.update(.1);assert.ok(eelRatio>shadow.scaling.z/shadow.scaling.x*4,'Bóng lươn dài, bóng cá đuối rộng');
rig.setPhase('waiting',2000,{shadowShape:'oval',shadowSize:'tiny'});rig.update(.1);const tiny=shadow.scaling.z;
rig.setPhase('waiting',2000,{shadowShape:'oval',shadowSize:'huge'});rig.update(.1);assert.ok(shadow.scaling.z>tiny*3,'Bóng cá lớn và nhỏ khác rõ');

for (const fish of Object.values(FISHING_CONFIG.fish)) {
  rig.finishCatch(true, fish);
  rig.update(1);
  const caught = scene.getTransformNodeByName('caught-fish');
  assert.equal(caught.parent, torsoNode, `${fish.id}: cá nằm trên giá đỡ hai tay`);
  assert.ok(caught.isEnabled(), `${fish.id}: cá vẫn hiện trong tay`);
  assert.equal(scene.getMeshByName('caught-fish-whisker-1').isEnabled(), ['river_catfish','pangasius'].includes(fish.id), `${fish.id}: râu cá trê`);
  assert.equal(scene.getMeshByName('caught-fish-stripe--0.15').isEnabled(), ['perch','river_barb','sea_mackerel','tilapia','clownfish'].includes(fish.id), `${fish.id}: sọc thân`);
  assert.equal(scene.getMeshByName('caught-fish-spot--1--0.23').isEnabled(), ['carp','golden_carp','sea_snapper','koi','puffer'].includes(fish.id), `${fish.id}: hoa văn`);
  assert.ok(scene.getMeshByName('caught-fish-snout').isEnabled(), `${fish.id}: đầu cá`);
  rig.clear();
  assert.ok(!caught.isEnabled(), `${fish.id}: cất cá`);
}
rig.finishCatch(true,{...FISHING_CONFIG.fish.tuna,caughtWeight:4});const smallTuna=scene.getTransformNodeByName('caught-fish').scaling.x;
rig.finishCatch(true,{...FISHING_CONFIG.fish.tuna,caughtWeight:16});assert.ok(scene.getTransformNodeByName('caught-fish').scaling.x>smallTuna,'Cùng loài, cá nặng lớn hơn');
rig.finishCatch(true,FISHING_CONFIG.fish.stingray);assert.ok(scene.getMeshByName('caught-fish-ray-disc').isEnabled(),'Cá đuối có cánh rộng');
rig.finishCatch(true,FISHING_CONFIG.fish.puffer);assert.ok(scene.getMeshByName('caught-fish-puffer-spike-0').isEnabled(),'Cá nóc có gai');
rig.dispose();
scene.dispose();
engine.dispose();
console.log('PASS fishing visuals: bóng cá tiến tới mồi, đớp phao, tất cả loài cá hiện trong tư thế đỡ hai tay và cất đúng');
