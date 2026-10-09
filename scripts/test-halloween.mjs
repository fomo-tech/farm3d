import assert from 'node:assert/strict';
import {worldEvent} from '../server/SeasonConfig.js';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {SeasonDecorations,seasonalSites} from '../src/game/world/SeasonDecorations.js';
import {TOWN_FOUNTAIN,TOWN_SPAWN} from '../shared/playerSpawn.js';
const t=s=>Date.parse(s);
assert.equal(worldEvent(t('2026-10-19T23:59:59+07:00'),{EVENT:'auto'}).active,false);
assert.equal(worldEvent(t('2026-10-20T00:00:00+07:00'),{EVENT:'auto'}).active,true);
assert.equal(worldEvent(t('2026-11-03T00:00:00+07:00'),{EVENT:'auto'}).active,false);
assert.equal(worldEvent(t('2026-10-25T12:00:00+07:00'),{EVENT:'none'}).active,false);
assert.equal(worldEvent(t('2026-04-01'),{EVENT:'halloween'}).active,true);
assert.equal(worldEvent(t('2026-10-25'),{EVENT:'auto',EVENT_START:'invalid'}).active,false);
assert.equal(worldEvent(t('2026-10-25'),{EVENT:'invalid'}).active,false);
assert.equal(worldEvent(Date.now(),{}).active,false);
assert.equal(worldEvent(Date.now(),{EVENT:'christmas'}).active,false);
assert.equal(worldEvent(Date.now(),{EVENT:'halloween'}).id,'halloween');
const engine=new NullEngine(),scene=new Scene(engine);let position={x:23,z:20};
const baseline={meshes:scene.meshes.length,materials:scene.materials.length};
const decor=new SeasonDecorations(scene,()=>position,{mobile:true});
for(let i=0;i<20;i++){decor.last=-Infinity;decor.update();}
assert.ok(decor.roots.size>0&&decor.roots.size<=14);
const plaza=seasonalSites().filter(site=>site.kind==='plaza');
assert.equal(plaza.length,12,'central square has twelve decoration clusters');
assert.ok(plaza.every(site=>decor.roots.has(site.id)),'all central clusters fit the mobile streaming budget');
for(const site of plaza){
 assert.ok(Math.hypot(site.x,site.z)>TOWN_FOUNTAIN.radius+3.5,'cluster footprint stays outside fountain');
 assert.ok(Math.hypot(site.x-TOWN_SPAWN.x,site.z-TOWN_SPAWN.z)>4,'arrival point remains clear');
}
assert.ok(scene.meshes.every(m=>m.isPickable===false),'decorations cannot intercept gameplay clicks');
assert.ok(scene.meshes.every(m=>m.metadata?.seasonDecoration));
assert.ok(scene.meshes.length<=decor.roots.size*5,'decorations must be batched by shared material');
position={x:5000,z:5000};decor.last=-Infinity;decor.update();assert.equal(decor.roots.size,0,'leaving area unloads decorations');
assert.equal(scene.meshes.length,baseline.meshes);
decor.dispose();assert.equal(scene.materials.length,baseline.materials);
assert.deepEqual(new Set(seasonalSites().map(s=>s.kind)),new Set(['plaza','gate','farm']));
scene.dispose();engine.dispose();console.log('PASS: Halloween schedule boundaries, overrides, mobile cap, batching, unload and disposal');
