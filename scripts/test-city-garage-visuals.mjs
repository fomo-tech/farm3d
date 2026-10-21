import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode.js';
import {createVehicleRigs} from '../src/game/player/createVehicleRigs.js';
const engine=new NullEngine(),scene=new Scene(engine);
try{
 const root=new TransformNode('garage-visual-test',scene),rig=createVehicleRigs(scene,root);
 rig.setVehicle('convertible');rig.setCityAppearance('#d1c8b5',true);
 const paint=scene.getMeshByName('convertible-lower-body').material;
 assert.equal(paint.diffuseColor.toHexString().toLowerCase(),'#d1c8b5');
 assert.equal(scene.getMeshByName('city-gt-spoiler').isEnabled(),true);
 rig.setCityAppearance('#283238',false);assert.equal(scene.getMeshByName('city-gt-spoiler').isEnabled(),false);
 rig.setVehicle('walk');rig.setVehicle('convertible');rig.setCityAppearance('#d1c8b5',true);
 assert.equal(scene.getMeshByName('city-gt-spoiler').isEnabled(),true,'Appearance survives rig recreation');
 rig.dispose();console.log('PASS garage visual geometry: paint applied, GT spoiler toggle and leave/re-enter recreation');
}finally{scene.dispose();engine.dispose();}
