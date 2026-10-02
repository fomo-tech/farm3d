import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';

function makeMat(scene, name, hex, emissiveHex = null) {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = Color3.FromHexString(hex);
  mat.specularColor = Color3.Black();
  if (emissiveHex) {
    mat.emissiveColor = Color3.FromHexString(emissiveHex);
  }
  return mat;
}

export function createVillageElderNPC(scene, shadowGenerator, position = { x: -120, y: 0, z: 42 }, onInteract = null) {
  const root = new TransformNode('npc-village-elder', scene);
  root.position.set(position.x, position.y || 0, position.z);

  const materials = {
    skin: makeMat(scene, 'elder-skin', '#e5b98a'),
    beard: makeMat(scene, 'elder-beard', '#f0f3f6'),
    robe: makeMat(scene, 'elder-robe', '#3a4e68'),
    sash: makeMat(scene, 'elder-sash', '#c47849'),
    hat: makeMat(scene, 'elder-hat', '#cba26c'),
    cane: makeMat(scene, 'elder-cane', '#6e4c33'),
    basket: makeMat(scene, 'elder-basket', '#9c7247'),
    carrot: makeMat(scene, 'elder-carrot', '#ed8b35', '#b34714'),
    leaf: makeMat(scene, 'elder-leaf', '#48bb78'),
    questMarker: makeMat(scene, 'elder-quest-marker', '#ffd166', '#ffaa00'),
    ring: makeMat(scene, 'elder-ground-ring', '#ffe699', '#f39c12'),
  };

  materials.ring.alpha = 0.55;

  // 1. Body / Tunic
  const body = MeshBuilder.CreateCapsule('elder-body', { height: 2.1, radius: 0.52 }, scene);
  body.position.y = 1.1;
  body.parent = root;
  body.material = materials.robe;

  // Sash / Belt
  const sash = MeshBuilder.CreateCylinder('elder-sash', { height: 0.35, diameter: 1.1, tessellation: 12 }, scene);
  sash.position.y = 1.05;
  sash.parent = root;
  sash.material = materials.sash;

  // 2. Head
  const head = MeshBuilder.CreateSphere('elder-head', { diameter: 0.9, segments: 10 }, scene);
  head.position.y = 2.45;
  head.parent = root;
  head.material = materials.skin;

  // 3. Elder Beard & Mustache
  const beard = MeshBuilder.CreateCylinder('elder-beard', { height: 0.6, diameterTop: 0.45, diameterBottom: 0.05, tessellation: 8 }, scene);
  beard.position.set(0, 2.05, 0.4);
  beard.rotation.x = Math.PI / 8;
  beard.parent = root;
  beard.material = materials.beard;

  const mustache = MeshBuilder.CreateBox('elder-mustache', { width: 0.55, height: 0.15, depth: 0.2 }, scene);
  mustache.position.set(0, 2.25, 0.44);
  mustache.parent = root;
  mustache.material = materials.beard;

  // 4. Conical Straw Hat
  const hat = MeshBuilder.CreateCylinder('elder-hat', { height: 0.5, diameterTop: 0.1, diameterBottom: 1.85, tessellation: 16 }, scene);
  hat.position.y = 2.95;
  hat.parent = root;
  hat.material = materials.hat;

  // 5. Walking Cane (right side)
  const cane = MeshBuilder.CreateCylinder('elder-cane', { height: 2.2, diameter: 0.09, tessellation: 8 }, scene);
  cane.position.set(0.65, 1.1, 0.3);
  cane.parent = root;
  cane.material = materials.cane;

  const caneKnob = MeshBuilder.CreateSphere('elder-cane-knob', { diameter: 0.22, segments: 6 }, scene);
  caneKnob.position.set(0.65, 2.22, 0.3);
  caneKnob.parent = root;
  caneKnob.material = materials.sash;

  // 6. Basket of Carrots (left side)
  const basket = MeshBuilder.CreateCylinder('elder-basket', { height: 0.7, diameterTop: 0.75, diameterBottom: 0.55, tessellation: 10 }, scene);
  basket.position.set(-0.75, 0.35, 0.15);
  basket.parent = root;
  basket.material = materials.basket;

  for (let i = 0; i < 3; i += 1) {
    const carrot = MeshBuilder.CreateCylinder(`elder-carrot-${i}`, { height: 0.5, diameterTop: 0.15, diameterBottom: 0.02, tessellation: 6 }, scene);
    carrot.position.set(-0.75 + (i - 1) * 0.16, 0.7, 0.15 + (i % 2 === 0 ? 0.05 : -0.05));
    carrot.rotation.z = (i - 1) * 0.2;
    carrot.parent = root;
    carrot.material = materials.carrot;

    const greens = MeshBuilder.CreateBox(`elder-greens-${i}`, { width: 0.08, height: 0.3, depth: 0.08 }, scene);
    greens.position.set(-0.75 + (i - 1) * 0.16, 0.95, 0.15);
    greens.parent = root;
    greens.material = materials.leaf;
  }

  // 7. Ground Pulsing Ring
  const groundRing = MeshBuilder.CreateCylinder('elder-ring', { height: 0.04, diameter: 2.6, tessellation: 24 }, scene);
  groundRing.position.set(0, 0.05, 0);
  groundRing.parent = root;
  groundRing.material = materials.ring;

  // 8. Overhead Quest / Exclamation Marker
  const markerRoot = new TransformNode('elder-marker-root', scene);
  markerRoot.position.set(0, 3.8, 0);
  markerRoot.parent = root;

  // Exclamation point (top bar + bottom dot)
  const exclaimBar = MeshBuilder.CreateCylinder('elder-exclaim-bar', { height: 0.65, diameterTop: 0.28, diameterBottom: 0.14, tessellation: 8 }, scene);
  exclaimBar.position.y = 0.25;
  exclaimBar.parent = markerRoot;
  exclaimBar.material = materials.questMarker;

  const exclaimDot = MeshBuilder.CreateSphere('elder-exclaim-dot', { diameter: 0.22, segments: 8 }, scene);
  exclaimDot.position.y = -0.22;
  exclaimDot.parent = markerRoot;
  exclaimDot.material = materials.questMarker;

  // Setup click metadata & shadows
  const allMeshes = [body, sash, head, beard, mustache, hat, cane, caneKnob, basket, exclaimBar, exclaimDot];
  allMeshes.forEach(mesh => {
    mesh.metadata = {
      type: 'npc',
      npcId: 'village_elder',
      npcName: 'Trưởng Làng Ba',
      interactive: true,
    };
    if (mesh !== exclaimBar && mesh !== exclaimDot) {
      shadowGenerator?.addShadowCaster(mesh);
    }
  });

  groundRing.metadata = {
    type: 'npc',
    npcId: 'village_elder',
    npcName: 'Trưởng Làng Ba',
    interactive: true,
  };

  return {
    root,
    markerRoot,
    groundRing,
    position: new Vector3(position.x, position.y || 0, position.z),
    update(time) {
      const bob = Math.sin(time * 0.0035) * 0.18;
      markerRoot.position.y = 3.8 + bob;
      markerRoot.rotation.y += 0.025;

      const ringPulse = 1 + Math.sin(time * 0.003) * 0.08;
      groundRing.scaling.x = ringPulse;
      groundRing.scaling.z = ringPulse;

      // Cụ Trưởng làng thở nhịp nhàng và rung râu bạc theo gió
      const breath = Math.sin(time * 0.002);
      body.position.y = 1.0 + breath * 0.025;
      head.position.y = 2.15 + breath * 0.035;
      beard.rotation.z = Math.sin(time * 0.003) * 0.06;
      cane.rotation.z = -0.15 + Math.sin(time * 0.0025) * 0.03;
    },
    setMarkerStatus(active) {
      markerRoot.setEnabled(active);
      groundRing.setEnabled(active);
    },
    dispose() {
      root.dispose(false, false);
    },
  };
}
