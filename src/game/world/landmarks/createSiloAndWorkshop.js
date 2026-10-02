import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';

function makeMat(scene, name, hex, emissiveHex = null) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.specularColor = new Color3(0.08, 0.08, 0.08);
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

/**
 * Creates the Farm Grain Silo with metallic dome, iron bands, and grain chute.
 */
export function createGrainSilo(scene, shadows, position = { x: -151, y: 0, z: 71 }) {
  const root = new TransformNode('landmark-grain-silo', scene);
  root.position.set(position.x, position.y || 0, position.z);

  const materials = {
    brick: makeMat(scene, 'silo-brick', '#c49774'),
    metalDome: makeMat(scene, 'silo-dome', '#cbd5e1', '#94a3b8'),
    ironBands: makeMat(scene, 'silo-bands', '#334155'),
    woodChute: makeMat(scene, 'silo-wood', '#78350f'),
    grain: makeMat(scene, 'silo-grain', '#fbbf24', '#f59e0b'),
  };

  // Main Cylindrical Tower
  const tower = MeshBuilder.CreateCylinder('silo-tower', {
    height: 9.8,
    diameter: 5.4,
    tessellation: 18,
  }, scene);
  tower.position.y = 4.9;
  tower.material = materials.brick;
  tower.parent = root;

  // Metal Semi-Sphere Roof Dome
  const dome = MeshBuilder.CreateSphere('silo-dome', {
    diameter: 5.6,
    segments: 14,
  }, scene);
  dome.scaling.y = 0.65;
  dome.position.y = 9.8;
  dome.material = materials.metalDome;
  dome.parent = root;

  // 4 Iron Tension Bands around tower
  [2.2, 4.4, 6.6, 8.8].forEach((by, i) => {
    const band = MeshBuilder.CreateCylinder(`silo-band-${i}`, {
      height: 0.12,
      diameter: 5.46,
      tessellation: 18,
    }, scene);
    band.position.y = by;
    band.material = materials.ironBands;
    band.parent = root;
  });

  // Vertical Service Ladder up the side
  for (let r = 1.0; r <= 9.5; r += 0.65) {
    const rung = MeshBuilder.CreateCylinder(`silo-ladder-${r}`, {
      height: 0.8,
      diameter: 0.08,
    }, scene);
    rung.rotation.z = Math.PI / 2;
    rung.position.set(2.8, r, 0);
    rung.material = materials.ironBands;
    rung.parent = root;
  }

  // Wooden Grain Discharge Chute at base
  const chute = MeshBuilder.CreateBox('silo-chute', {
    width: 1.2,
    height: 1.1,
    depth: 1.6,
  }, scene);
  chute.rotation.x = 0.25;
  chute.position.set(0, 0.7, 2.8);
  chute.material = materials.woodChute;
  chute.parent = root;

  // Golden corn grain pile under chute
  const grainPile = MeshBuilder.CreateSphere('silo-grain-pile', {
    diameter: 1.6,
    segments: 8,
  }, scene);
  grainPile.scaling.set(1.4, 0.45, 1.4);
  grainPile.position.set(0, 0.2, 3.4);
  grainPile.material = materials.grain;
  grainPile.parent = root;

  if (shadows) {
    [tower, dome, chute].forEach(m => shadows.addShadowCaster(m));
  }

  return root;
}

/**
 * Creates the Artisan Workshop (Bakery Brick Oven, Carpentry Bench & Oak Barrels).
 */
export function createArtisanWorkshop(scene, shadows, position = { x: -126, y: 0, z: 32 }) {
  const root = new TransformNode('landmark-artisan-workshop', scene);
  root.position.set(position.x, position.y || 0, position.z);

  const materials = {
    brick: makeMat(scene, 'oven-brick', '#b91c1c'),
    ovenStone: makeMat(scene, 'oven-stone', '#78716c'),
    fireGlow: makeMat(scene, 'oven-fire', '#f97316', '#ea580c'),
    timber: makeMat(scene, 'workshop-wood', '#6a4023'),
    benchTop: makeMat(scene, 'workbench-wood', '#8b5a2b'),
    metal: makeMat(scene, 'workshop-iron', '#475569'),
    barrelWood: makeMat(scene, 'barrel-wood', '#a16207'),
  };

  // 1. Brick Bread Baking Oven (Dome-shaped)
  const ovenBase = MeshBuilder.CreateBox('oven-base', {
    width: 2.2,
    height: 1.2,
    depth: 2.2,
  }, scene);
  ovenBase.position.set(-1.8, 0.6, 0);
  ovenBase.material = materials.ovenStone;
  ovenBase.parent = root;

  const ovenDome = MeshBuilder.CreateSphere('oven-dome', {
    diameter: 2.0,
    segments: 10,
  }, scene);
  ovenDome.scaling.set(1.0, 0.8, 1.0);
  ovenDome.position.set(-1.8, 1.5, 0);
  ovenDome.material = materials.brick;
  ovenDome.parent = root;

  // Oven Chimney
  const ovenChimney = MeshBuilder.CreateCylinder('oven-chimney', {
    height: 1.6,
    diameter: 0.45,
  }, scene);
  ovenChimney.position.set(-1.8, 2.5, -0.6);
  ovenChimney.material = materials.brick;
  ovenChimney.parent = root;

  // Glowing Fire Mouth
  const fireMouth = MeshBuilder.CreateSphere('oven-fire-mouth', {
    diameter: 0.65,
    segments: 8,
  }, scene);
  fireMouth.scaling.z = 0.3;
  fireMouth.position.set(-1.8, 1.2, 0.95);
  fireMouth.material = materials.fireGlow;
  fireMouth.parent = root;

  // 2. Heavy Carpenter's Work Bench
  const bench = MeshBuilder.CreateBox('workbench-top', {
    width: 2.8,
    height: 0.25,
    depth: 1.3,
  }, scene);
  bench.position.set(1.5, 1.1, 0);
  bench.material = materials.benchTop;
  bench.parent = root;

  // 4 Legs
  [[-0.9, -0.4], [0.9, -0.4], [-0.9, 0.4], [0.9, 0.4]].forEach(([lx, lz], i) => {
    const leg = MeshBuilder.CreateBox(`bench-leg-${i}`, {
      width: 0.18,
      height: 1.0,
      depth: 0.18,
    }, scene);
    leg.position.set(1.5 + lx, 0.5, lz);
    leg.material = materials.timber;
    leg.parent = root;
  });

  // Black Iron Anvil on Bench
  const anvil = MeshBuilder.CreateBox('workbench-anvil', {
    width: 0.7,
    height: 0.45,
    depth: 0.4,
  }, scene);
  anvil.position.set(1.2, 1.45, 0);
  anvil.material = materials.metal;
  anvil.parent = root;

  // Hand Saw
  const saw = MeshBuilder.CreateBox('workbench-saw', {
    width: 0.9,
    height: 0.08,
    depth: 0.2,
  }, scene);
  saw.position.set(2.1, 1.26, 0.1);
  saw.rotation.y = 0.3;
  saw.material = materials.metal;
  saw.parent = root;

  // 3. Oak Butter & Cheese Aging Barrels
  [
    { x: 0, z: -1.6, scale: 1.0 },
    { x: 1.2, z: -1.8, scale: 0.85 },
    { x: 0.6, z: -1.5, scale: 0.9 },
  ].forEach((b, idx) => {
    const barrel = MeshBuilder.CreateCylinder(`artisan-barrel-${idx}`, {
      height: 1.2 * b.scale,
      diameterTop: 0.9 * b.scale,
      diameterBottom: 0.9 * b.scale,
      tessellation: 12,
    }, scene);
    barrel.position.set(b.x, 0.6 * b.scale, b.z);
    barrel.material = materials.barrelWood;
    barrel.parent = root;

    // Metal Hoops on barrel
    [-0.35, 0.35].forEach((hy, hi) => {
      const hoop = MeshBuilder.CreateCylinder(`barrel-hoop-${idx}-${hi}`, {
        height: 0.06,
        diameter: 0.93 * b.scale,
        tessellation: 12,
      }, scene);
      hoop.position.set(b.x, (0.6 + hy) * b.scale, b.z);
      hoop.material = materials.metal;
      hoop.parent = root;
    });
  });

  if (shadows) {
    [ovenBase, ovenDome, bench, anvil].forEach(m => shadows.addShadowCaster(m));
  }

  return root;
}
