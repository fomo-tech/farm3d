import assert from 'node:assert/strict';

// Polyfill minimal OffscreenCanvas for Babylon DynamicTexture under Node.js NullEngine
if (typeof globalThis.OffscreenCanvas === 'undefined') {
  globalThis.OffscreenCanvas = class OffscreenCanvas {
    constructor(width, height) {
      this.width = width || 1024;
      this.height = height || 1024;
    }
    getContext() {
      const gradMock = { addColorStop() {} };
      return new Proxy({}, {
        get(target, prop) {
          if (prop === 'createRadialGradient' || prop === 'createLinearGradient') {
            return () => gradMock;
          }
          if (prop === 'measureText') {
            return () => ({ width: 100 });
          }
          if (typeof target[prop] === 'function') {
            return target[prop];
          }
          return () => {};
        },
        set(target, prop, val) {
          target[prop] = val;
          return true;
        },
      });
    }
  };
}

import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { createFashionBoutiqueInterior } from '../src/game/world/landmarks/createFashionInterior.js';
import { buildHumanMesh } from '../src/game/player/buildHumanMesh.js';
import { createFaceTexture } from '../src/game/player/createFaceTexture.js';
import {
  HAIR_STYLES,
  HAIR_DYES,
  TOPS,
  BOTTOMS,
  SHOES,
  EARS_OPTIONS,
  EYES_OPTIONS,
  FULL_SETS,
  CHARACTER_GENDERS,
  SKIN_TONES,
  CHARACTER_ANIMATION_CONFIG,
  CHARACTER_LOD_CONFIG,
  CHARACTER_RENDER_CONFIG,
  safeCharacterHex,
  getDefaultCustomization,
  normalizeCustomization,
  calculateVerifiedCustomizationCost,
} from '../src/game/data/fashionCatalog.js';

// 1. Verify Fashion Catalog Consistency
assert.ok(HAIR_STYLES.length >= 6, 'Should have at least 6 hairstyles');
assert.ok(HAIR_DYES.length >= 12, 'Should keep at least 12 salon hair dyes');
assert.ok(TOPS.length >= 6, 'Should have at least 6 tops');
assert.ok(BOTTOMS.length >= 5, 'Should have at least 5 bottoms');
assert.ok(SHOES.length >= 5, 'Should have at least 5 shoe options');
assert.ok(EARS_OPTIONS.length >= 5, 'Should have human, cat, rabbit, bear, and elf ears');
assert.ok(EYES_OPTIONS.length >= 5, 'Should have 5 eye options');
assert.ok(FULL_SETS.length >= 4, 'Should have curated full sets');
assert.equal(CHARACTER_GENDERS.length, 3, 'Should expose female, male and neutral body profiles');
assert.ok(SKIN_TONES.length >= 5, 'Should expose the calibrated multi-tone skin palette');
assert.equal(safeCharacterHex('#000000'), '#0a0a0a', 'Black is lifted to a readable render-safe value');
assert.equal(safeCharacterHex('#ffffff'), '#f5f5f5', 'White is capped to avoid blown highlights');
assert.equal(CHARACTER_ANIMATION_CONFIG.walkCycleSpeed, 10.5);
assert.equal(CHARACTER_LOD_CONFIG.lowDistance, 60);
assert.equal(CHARACTER_RENDER_CONFIG.style, 'stylized-social-avatar');
assert.equal(CHARACTER_RENDER_CONFIG.geometryBudget.faceTextureSize, 512);

const defCustom = getDefaultCustomization();
assert.equal(defCustom.gender, 'male');
assert.equal(defCustom.skinTone, 'peach');
assert.equal(defCustom.hairStyle, 'hair_buzzcut');
assert.equal(defCustom.ears, 'human');
const normalized = normalizeCustomization({});
assert.equal(normalized.hairStyle, 'hair_buzzcut');
assert.equal(normalized.gender, 'male');
assert.equal(normalizeCustomization({ gender: 'female', hairStyle: 'hair_chic_bob' }).hairStyle, 'hair_chic_bob');
assert.equal(normalizeCustomization({ gender: 'female' }).gender, 'female');

// Verify Server Anti-Cheat Cost Calculation
const costResult = calculateVerifiedCustomizationCost(['hair_classic'], ['hair_twintails', 'hair_classic']);
assert.equal(costResult.verifiedCost, HAIR_STYLES.find(item => item.id === 'hair_twintails').cost, 'Server uses the shared current hairstyle price');
assert.deepEqual(costResult.validNewItemIds, ['hair_twintails'], 'Only unowned item is charged');

// 2. Babylon.js NullEngine Tests
const engine = new NullEngine();
const scene = new Scene(engine);

// 3. Test Sophie's Fashion Interior Generation
const fakeConfig = {
  interior: { x: 175, y: 32, z: -215 },
};
const interiorGen = createFashionBoutiqueInterior(scene, fakeConfig, null);
let step = interiorGen.next();
while (!step.done) {
  step = interiorGen.next();
}

// Verify key 3D Boutique Landmark Meshes exist in scene
const meshNames = scene.meshes.map(m => m.name);
assert.ok(meshNames.includes('fashion-floor'), 'Floor exists');
assert.ok(meshNames.includes('fashion-runway-base'), 'Runway platform exists');
assert.ok(meshNames.includes('fashion-runway-glass'), 'Catwalk runway glass exists');
assert.ok(meshNames.includes('fashion-mirror-frame'), 'Hollywood vanity mirror frame exists');
assert.ok(meshNames.includes('fashion-service-counter'), 'Marble cashier counter exists');
assert.ok(meshNames.includes('fashion-curtain-0'), 'Fitting booth curtains exist');
assert.ok(meshNames.includes('fashion-rack-bar'), 'Gold designer clothes rack exists');
assert.ok(meshNames.includes('fashion-mannequin-head-0'), 'Posed fashion mannequins exist');
assert.ok(meshNames.includes('fashion-sofa-seat'), 'VIP plush circular sofa lounge exists');
assert.ok(meshNames.includes('fashion-neon-sign-plane'), 'Neon signboard exists');
assert.ok(meshNames.includes('fashion-sophie-body'), 'Sophie NPC exists');

// Verify Enclosed Room & Total Occlusion Shell
assert.ok(meshNames.includes('fashion-outer-occlusion-box'), 'Outer occlusion box shell exists');
assert.ok(meshNames.includes('fashion-exit-foyer-backing'), 'Vestibule foyer backing wall exists');
assert.ok(meshNames.includes('fashion-ceiling'), 'Ceiling exists');
assert.ok(meshNames.includes('fashion-wall-front-l'), 'Front left wall exists');
assert.ok(meshNames.includes('fashion-wall-front-r'), 'Front right wall exists');
assert.ok(meshNames.includes('fashion-wall-front-top'), 'Front top header wall exists');
assert.ok(meshNames.includes('fashion-downlight-0'), 'Recessed ceiling downlights exist');

// Verify Play Together Grand Exit Portal
assert.ok(meshNames.includes('fashion-exit-arch-top'), 'Gold door arch exists');
assert.ok(meshNames.includes('fashion-exit-door-l'), 'Double glass exit door exists');
assert.ok(meshNames.includes('fashion-exit-sign-plane'), 'Neon EXIT sign exists');
assert.ok(meshNames.includes('fashion-exit-pad'), 'Luminous exit pad exists');

// 4. Test Avatar Modular Customization API
const human = buildHumanMesh(scene, 'test-human');
const faceMaterial = scene.getMaterialByName('test-human-face-mat');
assert.equal(faceMaterial.opacityTexture, null, 'Face must not derive opacity from dark eye RGB');
assert.equal(faceMaterial.useAlphaFromDiffuseTexture, true, 'Opaque dark pupils retain the canvas alpha');
assert.equal(faceMaterial.diffuseTexture, human.faceSystem.texture);
assert.equal(typeof human.applyCustomization, 'function', 'human has applyCustomization');
assert.equal(typeof human.setHair, 'function', 'human has setHair');
assert.equal(typeof human.setEars, 'function', 'human has setEars');
assert.equal(typeof human.setTop, 'function', 'human has setTop');
assert.equal(typeof human.setBottom, 'function', 'human has setBottom');
assert.equal(typeof human.setShoes, 'function', 'human has setShoes');
assert.equal(typeof human.setGender, 'function', 'human has setGender');
assert.equal(typeof human.setSkinTone, 'function', 'human has setSkinTone');
assert.equal(typeof human.setLOD, 'function', 'human has setLOD');
assert.equal(typeof human.getAppearance, 'function', 'human has getAppearance');

for (const gender of ['female', 'male', 'neutral']) {
  for (const tone of SKIN_TONES) {
    human.setGender(gender);
    human.setSkinTone(tone.id);
    human.setLOD(2);
    assert.equal(human.getAppearance().gender, gender);
    assert.equal(human.getAppearance().skinTone, tone.id);
    assert.equal(human.getAppearance().lod, 2);
  }
}
human.setLOD(0);
assert.equal(typeof human.setFaceFeatures, 'function', 'human has setFaceFeatures');

// Test applying cat girl set
human.applyCustomization({
  hairStyle: 'hair_twintails',
  hairColor: '#f472b6',
  topId: 'top_croptop_sport',
  topColor: '#f43f5e',
  bottomId: 'bot_tennis_skirt',
  bottomColor: '#ffffff',
  shoeId: 'shoe_chunky_white',
  shoeColor: '#ffffff',
  ears: 'cat_ears',
  eyeType: 'cat_eyes',
  eyeColor: '#0284c7',
  noseType: 'cat_nose',
  mouthType: 'cat_mouth',
  blushType: 'heart',
});
assert.equal(human.getAppearance().hairStyle, 'twintails');
assert.equal(human.getAppearance().topId, 'croptop_summer');
assert.equal(human.getAppearance().bottomId, 'skirt_pleated');
assert.equal(human.getAppearance().shoeId, 'sneaker_chunky');
assert.equal(human.getAppearance().renderStyle, CHARACTER_RENDER_CONFIG.style);

// Exercise every newly modelled fashion silhouette and the distant LOD path.
human.applyCustomization({
  topId: 'top_bomber_varsity',
  bottomId: 'bot_cargo_wide',
  shoeId: 'shoe_running_neon',
});
assert.equal(human.getAppearance().topId, 'bomber');
assert.equal(human.getAppearance().bottomId, 'cargo_pants');
assert.equal(human.getAppearance().shoeId, 'runner_neon');
human.applyCustomization({ topId: 'top_polo_preppy', bottomId: 'bot_jogger_sport', shoeId: 'shoe_vintage_boots' });
assert.equal(human.getAppearance().topId, 'polo');
assert.equal(human.getAppearance().bottomId, 'joggers_cozy');
assert.equal(human.getAppearance().shoeId, 'boots_vintage');
human.setLOD(2);
assert.equal(human.getAppearance().lod, 2);
human.setLOD(0);

// Run animation step
human.animate(0.016, false, 1.0);
human.animate(0.016, true, 4.0);

// Action transitions must keep the longer rig finite and must not accumulate
// the hip offset over repeated frames (including wave and fishing early returns).
for (const action of ['wave', 'hoe', 'water', 'seed', 'harvest', 'celebrate']) {
  human.playAction(action);
  for (let frame = 0; frame < 120; frame++) human.animate(1 / 60, false, 0);
  assert.ok(Math.abs(human.torsoNode.position.y - CHARACTER_RENDER_CONFIG.proportions.hipHeight) < 0.03, action);
}
for (const action of ['cast', 'reel', 'catch']) {
  human.playFishingAction(action);
  for (let frame = 0; frame < 120; frame++) human.animate(1 / 60, false, 0);
  assert.ok(Math.abs(human.torsoNode.position.y - CHARACTER_RENDER_CONFIG.proportions.hipHeight) < 0.03, action);
}
assert.equal(human.joints.elbows.length, 2);
assert.equal(human.joints.knees.length, 2);
for (const side of [1, -1]) {
  const shoulder = scene.getMeshByName(`test-human-shoulder-bridge-${side}`);
  assert.equal(shoulder.parent, human.torsoNode);
  assert.equal(shoulder.scaling.y, 1, 'Articulated shoulder must not inherit clothing stretch');
  assert.equal(shoulder.getTotalVertices(), 17 * 21, 'Shoulder and sleeve are a single surface');
  assert.equal(scene.getMeshByName(`test-human-shoulder-${side}`).isEnabled(), false, 'No separate shoulder ball');
  assert.equal(scene.getMeshByName(`test-human-knee-surface-${side}`).isEnabled(), false, 'No knee ball seam');
  assert.ok(scene.getMeshByName(`test-human-continuous-leg-${side}`).isEnabled());
}
assert.equal(scene.getMeshByName('test-human-cuff-l'), null, 'No sleeve joint trim');
assert.equal(scene.getMeshByName('test-human-pant-cuff-l'), null, 'No knee trim');
human.setBottom('bot_cargo_wide');
for (let frame = 0; frame < 120; frame++) {
  human.animate(1 / 60, true, 4);
  for (const side of [1, -1]) {
    const pants = scene.getMeshByName(`test-human-continuous-pants-${side}`);
    assert.ok(pants.isEnabled(), 'Long trousers use one unbroken surface');
    assert.ok(Array.from(pants.getVerticesData('position')).every(Number.isFinite));
  }
}
// Seam-free arms must remain a single connected, finite vertex surface in
// idle, locomotion and strongly bent gestures, including distant LOD.
for (const action of ['wave', 'water', 'celebrate']) {
  human.playAction(action);
  for (let frame = 0; frame < 90; frame++) {
    human.animate(1 / 60, false, 0);
    for (const side of [1, -1]) {
      const surface = scene.getMeshByName(`test-human-continuous-arm-${side}`);
      assert.ok(surface?.isEnabled(), 'Continuous arm skin must remain visible');
      assert.ok(Array.from(surface.getVerticesData('position')).every(Number.isFinite), `${action}: arm vertices`);
      assert.equal(surface.getTotalVertices(), 9 * 21);
      assert.equal(surface.getIndices().length, 8 * 20 * 6);
    }
  }
}
for (const shoe of SHOES) {
  human.setShoes(shoe.id);
  human.setLOD(2);
  assert.ok(scene.getMeshByName('test-human-sneaker-sol-l').isEnabled(), 'Distant avatar must keep visible shoes');
}
human.setLOD(0);

// Test face texture updateFeatures
const faceSys = createFaceTexture(scene, 'test-face');
faceSys.updateFeatures({
  eyeType: 'sparkle',
  eyeColor: '#7c3aed',
  mouthType: 'tongue',
  blushType: 'drunk',
});
faceSys.setExpression('wink');
faceSys.update(0.016);

scene.dispose();
engine.dispose();

console.log('PASS: Sophie Fashion Boutique interior and Play Together modular avatar customization fully verified!');
