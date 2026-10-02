import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';

function makeMat(scene, name, hex, emissiveHex = null) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(0.35);
  m.specularColor = new Color3(0.12, 0.12, 0.12);
  if (emissiveHex) m.emissiveColor = Color3.FromHexString(emissiveHex);
  return m;
}

/**
 * Creates the Historic 15m Coastal Lighthouse with 360-degree rotating light beam.
 */
export function createLighthouse(scene, shadows, position = { x: 73, y: 0, z: 203 }) {
  const root = new TransformNode('landmark-lighthouse', scene);
  root.position.set(position.x, position.y || 0, position.z);

  const materials = {
    stoneBase: makeMat(scene, 'lighthouse-stone-base', '#64748b'),
    redStripe: makeMat(scene, 'lighthouse-red', '#dc2626'),
    whiteStripe: makeMat(scene, 'lighthouse-white', '#f8fafc'),
    ironRailing: makeMat(scene, 'lighthouse-railing', '#1e293b'),
    lanternGlass: makeMat(scene, 'lighthouse-glass', '#bae6fd', '#38bdf8'),
    beaconGlow: makeMat(scene, 'lighthouse-beacon', '#fef08a', '#facc15'),
    beamLight: makeMat(scene, 'lighthouse-beam', '#fef08a', '#facc15'),
  };
  materials.lanternGlass.alpha = 0.5;
  materials.beamLight.alpha = 0.35;

  // 1. Granite Rock Foundation Base
  const base = MeshBuilder.CreateCylinder('lighthouse-base', {
    height: 1.8,
    diameter: 7.2,
    tessellation: 18,
  }, scene);
  base.position.y = 0.9;
  base.material = materials.stoneBase;
  base.parent = root;

  // 2. Tower Body in 4 Alternating Red & White Tapered Sections
  const sections = [
    { y: 3.2, h: 2.8, dTop: 5.4, dBot: 6.2, mat: materials.whiteStripe },
    { y: 5.8, h: 2.6, dTop: 4.6, dBot: 5.4, mat: materials.redStripe },
    { y: 8.2, h: 2.4, dTop: 4.0, dBot: 4.6, mat: materials.whiteStripe },
    { y: 10.4, h: 2.2, dTop: 3.4, dBot: 4.0, mat: materials.redStripe },
  ];

  sections.forEach((sec, i) => {
    const mesh = MeshBuilder.CreateCylinder(`lighthouse-sec-${i}`, {
      height: sec.h,
      diameterTop: sec.dTop,
      diameterBottom: sec.dBot,
      tessellation: 18,
    }, scene);
    mesh.position.y = sec.y;
    mesh.material = sec.mat;
    mesh.parent = root;
    if (shadows) shadows.addShadowCaster(mesh);
  });

  // 3. Observation Gallery Balcony
  const balcony = MeshBuilder.CreateCylinder('lighthouse-balcony', {
    height: 0.35,
    diameter: 4.8,
    tessellation: 18,
  }, scene);
  balcony.position.y = 11.65;
  balcony.material = materials.ironRailing;
  balcony.parent = root;

  const railing = MeshBuilder.CreateCylinder('lighthouse-railing', {
    height: 0.75,
    diameterTop: 4.8,
    diameterBottom: 4.8,
    tessellation: 18,
  }, scene);
  railing.position.y = 12.05;
  railing.material = materials.ironRailing;
  railing.parent = root;

  // 4. Glass Lantern Room & Cap
  const lantern = MeshBuilder.CreateCylinder('lighthouse-lantern-room', {
    height: 2.2,
    diameter: 3.0,
    tessellation: 16,
  }, scene);
  lantern.position.y = 12.9;
  lantern.material = materials.lanternGlass;
  lantern.parent = root;

  // Dome Roof Cap
  const roofCap = MeshBuilder.CreateSphere('lighthouse-roof-dome', {
    diameter: 3.4,
    segments: 10,
  }, scene);
  roofCap.scaling.y = 0.55;
  roofCap.position.y = 14.1;
  roofCap.material = materials.redStripe;
  roofCap.parent = root;

  // 5. Rotating Light Beacon Node
  const beaconNode = new TransformNode('lighthouse-beacon-node', scene);
  beaconNode.position.set(0, 13.0, 0);
  beaconNode.parent = root;

  const beaconSphere = MeshBuilder.CreateSphere('lighthouse-beacon-sphere', {
    diameter: 1.2,
    segments: 8,
  }, scene);
  beaconSphere.material = materials.beaconGlow;
  beaconSphere.parent = beaconNode;

  // Conical Light Beam extending into sea
  const beam = MeshBuilder.CreateCylinder('lighthouse-beam-cone', {
    height: 38.0,
    diameterTop: 0.8,
    diameterBottom: 16.0,
    tessellation: 16,
  }, scene);
  beam.rotation.x = Math.PI / 2;
  beam.position.set(0, 0, 19.0);
  beam.material = materials.beamLight;
  beam.parent = beaconNode;

  if (shadows) {
    [base, balcony, roofCap].forEach(m => shadows.addShadowCaster(m));
  }

  return {
    root,
    beaconNode,
    update(time, delta = 0.016) {
      // Smooth 360-degree rotation of beacon light
      beaconNode.rotation.y += delta * 1.05;
    },
  };
}
