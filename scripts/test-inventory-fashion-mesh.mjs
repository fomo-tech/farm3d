import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { buildHumanMesh } from '../src/game/player/buildHumanMesh.js';
import { applyFashionInventoryItem, selectFashionObjectMeshes, snapshotFashionMeshVisibility, restoreFashionMeshVisibility } from '../src/components/fashionInventoryMesh.js';
import { ALL_FASHION_ITEMS_MAP, getDefaultCustomization } from '../shared/fashionConfig.js';

globalThis.OffscreenCanvas ||= class {
  constructor(width, height) { this.width = width; this.height = height; }
  getContext() {
    return new Proxy({}, { get: (_, key) => key === 'measureText' ? () => ({ width: 100 })
      : key === 'createRadialGradient' || key === 'createLinearGradient' ? () => ({ addColorStop() {} }) : () => {} });
  }
};

const engine = new NullEngine();
const scene = new Scene(engine);
const avatar = buildHumanMesh(scene, 'inventory-test');
for (const item of [
  { id: 'fashion:starter', itemId: 'starter' },
  { id: 'customization:top_hoodie_cozy', itemId: 'top_hoodie_cozy' },
  { id: 'customization:bot_denim_shorts', itemId: 'bot_denim_shorts' },
  { id: 'customization:shoe_chunky_white', itemId: 'shoe_chunky_white' },
  { id: 'customization:hair_classic', itemId: 'hair_classic' },
  { id: 'customization:cat_ears', itemId: 'cat_ears' },
]) {
  avatar.applyCustomization(getDefaultCustomization());
  const baseline = new Set(avatar.root.getChildMeshes().filter(mesh => mesh.isEnabled()).map(mesh => mesh.name));
  const type = applyFashionInventoryItem(avatar, item);
  const meshes = selectFashionObjectMeshes(avatar, type, item.itemId, baseline);
  assert.ok(meshes.length, `${item.itemId} must have real 3D object meshes`);
  if (type === 'top') assert.ok(meshes.every(mesh => !/sneaker|snk-lace/.test(mesh.name)), 'top icon must not include shoe meshes');
  if (type === 'bottom') assert.ok(meshes.every(mesh => !/sleeve/.test(mesh.name)), 'bottom icon must not include sleeve meshes');
  if (type === 'accessory') assert.ok(meshes.every(mesh => !mesh.name.endsWith('-head')), 'accessory icon must not include the avatar head');
}
// Reproduce thumbnail capture on the reused fitting-room avatar.
avatar.applyCustomization(getDefaultCustomization());
for (const id of Object.keys(ALL_FASHION_ITEMS_MAP)) {
 const snapshot=snapshotFashionMeshVisibility(scene);
 const type=applyFashionInventoryItem(avatar,{id:`customization:${id}`,itemId:id});
 const selected=new Set(selectFashionObjectMeshes(avatar,type,id));
 scene.meshes.forEach(mesh=>{if(mesh.getTotalVertices()>0&&!selected.has(mesh))mesh.setEnabled(false);});
 restoreFashionMeshVisibility(snapshot);
 avatar.applyCustomization(getDefaultCustomization());
}
for (const id of Object.keys(ALL_FASHION_ITEMS_MAP).filter(id=>id.startsWith('top_'))) {
 avatar.setTop(id);
 for(const lod of [0,1,2]){
  avatar.setLOD(lod);
  assert.ok(avatar.root.getChildMeshes().some(mesh=>/-body$/.test(mesh.name)&&mesh.isEnabled()&&!mesh.material.name.includes('skin')),`${id}: clothing torso survives captures at LOD ${lod}`);
 }
 avatar.setLOD(0);
}
const unmapped = [];
for (const id of Object.keys(ALL_FASHION_ITEMS_MAP)) {
  avatar.applyCustomization(getDefaultCustomization());
  const baseline = new Set(avatar.root.getChildMeshes().filter(mesh => mesh.isEnabled()).map(mesh => mesh.name));
  const type = applyFashionInventoryItem(avatar, { id: `customization:${id}`, itemId: id });
  const meshes = selectFashionObjectMeshes(avatar, type, id, baseline);
  if (!meshes.length) unmapped.push(id);
}
assert.deepEqual(unmapped, [], `Fashion items without a 3D icon mesh: ${unmapped.join(', ')}`);
scene.dispose();
engine.dispose();
console.log('PASS inventory clothing icons map to real avatar meshes');
