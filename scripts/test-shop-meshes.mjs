import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { addShopFacade, addTerracottaGableRoof } from '../src/game/world/landmarks/createPlayTogetherPlaza.js';
import { createCafeDeck } from '../src/game/world/landmarks/createPlazaAmenities.js';
import { SHOP_CONFIG } from '../shared/shopConfig.js';
import { VENUE_LAYOUT } from '../shared/venueLayout.js';

const engine = new NullEngine();
const scene = new Scene(engine);
const parent = new TransformNode('shop-test-root', scene);
const mats = Object.fromEntries(['roofTile', 'roofRidge', 'timber', 'timberWarm', 'stonePlinth'].map(name => [name, new StandardMaterial(name, scene)]));
const roof = addTerracottaGableRoof(scene, parent, 16, 12, 8.85, mats, null);
const parts = roof.getChildMeshes();
assert.equal(parts.length, 5, 'two slopes, ridge and two gables');
for (const mesh of parts) {
  mesh.computeWorldMatrix(true);
  const { minimumWorld: min, maximumWorld: max } = mesh.getBoundingInfo().boundingBox;
  assert.ok(min.x > -9.5 && max.x < 9.5, `${mesh.name}: oversized roof x`);
  assert.ok(min.y > 7.9 && max.y < 12.7, `${mesh.name}: oversized roof y`);
  assert.ok(min.z > -7.6 && max.z < 7.6, `${mesh.name}: oversized roof z`);
}
addShopFacade(scene, parent, 'shop-test', '#d7f1f2', '#60b9c3', mats);
const panel = scene.getMeshByName('shop-test-storefront-panel');
assert.ok(panel && panel.material.alpha === 1, 'storefront glass must be opaque');
assert.ok(panel.position.z - .05 > 6, 'storefront must not intersect the wall');
assert.ok(scene.getMeshByName('shop-test-storefront-door'), 'visible front door');
for (const kind of Object.keys(SHOP_CONFIG)) {
  assert.equal(SHOP_CONFIG[kind].layout, VENUE_LAYOUT[kind], 'visual config must preserve authoritative entrances');
  const root = new TransformNode(`style-test-${kind}`, scene);
  addShopFacade(scene, root, kind, '#ffffff', '#ffffff', mats);
  const roof = addTerracottaGableRoof(scene, root, 16, 12, 8.85, mats);
  assert.equal(root.metadata.shopStyle, kind);
  assert.equal(roof.getChildMeshes()[0].material.diffuseColor.toHexString().toLowerCase(), SHOP_CONFIG[kind].roof);
  assert.equal(root.getChildMeshes().filter(mesh => mesh.name.includes('canopy-stripe')).length, 8);
  assert.equal(scene.getMeshByName(`${kind}-storefront-door`).metadata.venue, kind);
  assert.ok(root.getChildMeshes().every(mesh => mesh.material.alpha === 1), 'no alpha glass sorting flicker');
}
const cafe = new TransformNode('cafe-test-root', scene);
const deck = createCafeDeck(scene, cafe, mats.timberWarm);
const deckBottom = deck.position.y - .18 / 2;
const deckTop = deck.position.y + .18 / 2;
assert.ok(deckBottom > .12, 'cafe deck must not share a plane with plaza top');
assert.ok(deckTop >= .30, 'cafe furnishings must sit above the raised deck');
engine.dispose();
console.log('PASS: bounded roof gables, opaque storefront, raised cafe deck.');
