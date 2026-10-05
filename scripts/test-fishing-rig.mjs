import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode.js';
import {createFishingRig} from '../src/game/player/createPlayer.js';
const engine=new NullEngine(),scene=new Scene(engine),root=new TransformNode('angler',scene),hand=new TransformNode('grip',scene);
root.position.set(162,.3,2);hand.position.set(162,1.5,2);
const human={toolGrip:hand,playFishingAction(){},setFishingPose(){},clearFishingPose(){}};
const before={meshes:scene.meshes.length,materials:scene.materials.length,nodes:scene.transformNodes.length};
for(let i=0;i<10;i++){
 const rig=createFishingRig(scene,root,human);
 rig.startCast(8,'basic_cast',{x:167,y:.13,z:2});rig.update(.5);
 assert.equal(root.rotation.y,Math.PI/2);
 rig.setPhase('bite');rig.update(.4);rig.playReel();rig.update(.1);rig.finishCatch(true,{color:'#ffcc66'});rig.update(.1);
 assert.equal(scene.getTransformNodeByName('caught-fish').isEnabled(),true);
 rig.dispose();
 assert.deepEqual({meshes:scene.meshes.length,materials:scene.materials.length,nodes:scene.transformNodes.length},before);
}
scene.dispose();engine.dispose();console.log('PASS fishing rig: cast/reel/catch, server target aim, 10 create/dispose cycles without leaked meshes/materials/nodes');
