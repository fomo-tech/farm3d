import {otherWaterAt} from '../src/game/world/nature/clipShoreAtWaterways.js';
import {createGrandWindingRiverSteps} from '../src/game/world/nature/GrandWindingRiver.js';
import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode.js';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial.js';
import {createWaterNetwork} from '../src/game/world/nature/createWaterNetwork.js';
import {createWaterfrontScenery} from '../src/game/world/nature/createWaterfrontScenery.js';
globalThis.OffscreenCanvas=class {constructor(w,h){this.width=w;this.height=h;}getContext(){return new Proxy({},{get:()=>()=>{},set:()=>true});}};
const engine=new NullEngine(),scene=new Scene(engine),root=new TransformNode('test-network',scene),water=new StandardMaterial('test-water',scene),bank=new StandardMaterial('test-bank',scene);
const boxes=createWaterNetwork(scene,root,water,bank);
createWaterfrontScenery(scene,root,null,{stream:false});
const surfaces=scene.meshes.filter(m=>m.name.endsWith('-water'));
assert.equal(surfaces.length,9);
for(const mesh of surfaces){
 const count=mesh.getTotalVertices(),colors=mesh.getVerticesData('color');
 assert.equal(colors.length,count*4,`${mesh.name}: every closed and double-sided vertex needs a color`);
 for(const c of colors)assert.ok(Number.isFinite(c)&&c>=0&&c<=1);
 assert.ok(mesh.getVerticesData('position').every(Number.isFinite));
}
for(const mesh of scene.meshes.filter(m=>m.metadata?.shoreWaterId)){
 const p=mesh.getVerticesData('position'),indices=mesh.getIndices();
 for(let i=0;i<indices.length;i+=3){const a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3;assert.equal(otherWaterAt((p[a]+p[b]+p[c])/3,(p[a+2]+p[b+2]+p[c+2])/3,mesh.metadata.shoreWaterId),false,'bank must not dam a water junction');}
}
assert.ok(surfaces.length===9);
assert.ok(boxes.length<500,'collision cells remain merged for mobile');
root.dispose(false,true);water.dispose();bank.dispose();
const steps=createGrandWindingRiverSteps(scene);let main;for(let i=0;i<30&&!main;i++){steps.next();main=scene.getMeshByName('grand-river-surface');}assert.ok(main);assert.equal(main.material.metadata.landscapeWater,true);assert.equal(main.getVerticesData('color').length,main.getTotalVertices()*4);steps.return();scene.getTransformNodeByName('grand-winding-river-system').dispose(false,true);engine.dispose();
console.log('PASS: nine water surfaces, full vertex color buffers, finite landscape geometry, merged mobile collision and disposal');
