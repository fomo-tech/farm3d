import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { WORLD_LAYOUT } from './worldLayout.js';
import { WORLD_PALETTE } from './worldDesignSystem.js';

function material(scene, name, hex, emissive = null) {
  const result = new StandardMaterial(name, scene);
  result.diffuseColor = Color3.FromHexString(hex);
  result.ambientColor = result.diffuseColor.scale(0.4);
  result.specularColor = new Color3(0.08, 0.08, 0.08);
  if (emissive) result.emissiveColor = Color3.FromHexString(emissive);
  return result;
}

function ground(scene, name, width, depth, x, z, mat, parent, y = 0.035) {
  const mesh = MeshBuilder.CreateGround(name, { width, height: depth, subdivisions: 1 }, scene);
  mesh.position.set(x, y, z);
  mesh.material = mat;
  mesh.receiveShadows = true;
  mesh.isPickable = false;
  mesh.parent = parent;
  return mesh;
}

function districtSign(scene, district, parent) {
  const texture = new DynamicTexture(`district-sign-${district.id}`, { width: 1280, height: 360 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  texture.anisotropicFilteringLevel = 16;
  texture.hasAlpha = true;
  const ctx = texture.getContext();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, 1280, 360);
  ctx.fillStyle = '#fffdf5';
  ctx.beginPath();
  ctx.roundRect(20, 20, 1240, 320, 84);
  ctx.fill();
  ctx.strokeStyle = district.color;
  ctx.lineWidth = 24;
  ctx.stroke();
  texture.drawText(district.label.toUpperCase(), null, 224, '800 92px "Segoe UI", sans-serif', '#273548', null, true, true);

  const signMat = new StandardMaterial(`district-sign-mat-${district.id}`, scene);
  signMat.diffuseTexture = texture;
  signMat.opacityTexture = texture;
  signMat.emissiveColor = Color3.FromHexString(district.color).scale(0.18);
  signMat.disableLighting = true;
  const sign = MeshBuilder.CreatePlane(`district-sign-plane-${district.id}`, { width: 5.7, height: 1.6 }, scene);
  sign.position.set(district.x, 4.7, district.z);
  sign.material = signMat;
  sign.billboardMode = Mesh.BILLBOARDMODE_Y;
  sign.isPickable = false;
  sign.parent = parent;

  const postMat = material(scene, `district-post-mat-${district.id}`, '#76513a');
  const post = MeshBuilder.CreateCylinder(`district-post-${district.id}`, { height: 3.8, diameter: 0.22, tessellation: 10 }, scene);
  post.position.set(district.x, 2.1, district.z);
  post.material = postMat;
  post.parent = parent;
}

function crosswalk(scene, x, z, horizontal, parent, mat) {
  for (let i = -3; i <= 3; i += 1) {
    ground(scene, `city-crosswalk-${x}-${z}-${i}`, horizontal ? 0.75 : 5.4, horizontal ? 5.4 : 0.75,
      horizontal ? x + i * 1.15 : x, horizontal ? z : z + i * 1.15, mat, parent, 0.065);
  }
}

function transitShelter(scene, x, z, rotation, parent, shadows, mats) {
  const shelter = new TransformNode(`city-transit-stop-${x}-${z}`, scene);
  shelter.position.set(x, 0, z);
  shelter.rotation.y = rotation;
  shelter.parent = parent;
  const roof = MeshBuilder.CreateBox('transit-roof', { width: 5.2, height: 0.28, depth: 2.2 }, scene);
  roof.position.set(0, 3.1, 0); roof.material = mats.stop; roof.parent = shelter;
  const bench = MeshBuilder.CreateBox('transit-bench', { width: 3.6, height: 0.55, depth: 0.7 }, scene);
  bench.position.set(0, 0.7, 0.45); bench.material = mats.wood; bench.parent = shelter;
  [-2.25, 2.25].forEach(px => {
    const post = MeshBuilder.CreateCylinder('transit-post', { height: 3, diameter: 0.18, tessellation: 10 }, scene);
    post.position.set(px, 1.5, 0); post.material = mats.wood; post.parent = shelter;
  });
  shelter.getChildMeshes().forEach(mesh => shadows?.addShadowCaster(mesh));
  return shelter;
}

export function createCityMasterplan(scene, shadows) {
  const root = new TransformNode('city-masterplan-v3', scene);
  root.metadata = { zone: 'city', layoutVersion: WORLD_LAYOUT.version };
  const mats = {
    asphalt: material(scene, 'city-ring-road-mat', WORLD_PALETTE.roadStone),
    curb: material(scene, 'city-curb-mat', '#d4b8a8'),
    walk: material(scene, 'city-pedestrian-mat', WORLD_PALETTE.sidewalkCream),
    crossing: material(scene, 'city-crossing-mat', '#ded6c8', '#faf5ee'),
    stop: material(scene, 'city-stop-mat', '#52b8ce'),
    wood: material(scene, 'city-stop-wood-mat', '#76513a'),
    chrome: material(scene, 'city-chrome-mat', '#dbe7ef'),
    glass: material(scene, 'city-glass-mat', '#64d7ed', '#0ea5c6'),
    neonCyan: material(scene, 'city-neon-cyan', '#06b6d4', '#06b6d4'),
    neonPink: material(scene, 'city-neon-pink', '#ec4899', '#ec4899'),
  };
  mats.asphalt.zOffset = -1;
  mats.curb.zOffset = -1;
  mats.walk.zOffset = -2;
  mats.crossing.zOffset = -4;
  mats.glass.alpha = 0.82;

  // Vành đai giúp nhìn một lần là hiểu cấu trúc thành phố, thay cho các đường rời rạc.
  const ring = MeshBuilder.CreateTorus('city-ring-road', {
    diameter: WORLD_LAYOUT.routes.cityRingRadius * 2,
    thickness: 8.5,
    tessellation: 96,
  }, scene);
  ring.position.y = 0.045;
  ring.scaling.y = 0.025;
  ring.material = mats.asphalt;
  ring.receiveShadows = true;
  ring.isPickable = false;
  ring.parent = root;

  [45.9, 56.1].forEach((radius, index) => {
    const curb = MeshBuilder.CreateTorus(`city-ring-curb-${index}`, { diameter: radius * 2, thickness: 0.65, tessellation: 96 }, scene);
    curb.position.y = 0.085;
    curb.scaling.y = 0.06;
    curb.material = mats.curb;
    curb.parent = root;
  });

  const walkRing = MeshBuilder.CreateTorus('city-pedestrian-ring', { diameter: 88, thickness: 3.2, tessellation: 96 }, scene);
  walkRing.position.y = 0.06;
  walkRing.scaling.y = 0.025;
  walkRing.material = mats.walk;
  walkRing.parent = root;

  // Hai dải LED ngầm đổi màu bao quanh quảng trường, hiện rõ từ góc camera thứ ba.
  [41.2, 42.4].forEach((radius, index) => {
    const led = MeshBuilder.CreateTorus(`city-neon-ring-${index}`, { diameter: radius * 2, thickness: 0.3, tessellation: 96 }, scene);
    led.position.y = 0.12; led.scaling.y = 0.08; led.material = index ? mats.neonPink : mats.neonCyan; led.parent = root;
  });

  // Đài phun nước Cyber-Deco thay cho thiết kế bánh kẹo cũ.
  const fountain = new TransformNode('cyber-deco-fountain', scene);
  fountain.parent = root;
  const pool = MeshBuilder.CreateCylinder('cyber-fountain-pool', { diameter: 11.5, height: 0.65, tessellation: 48 }, scene);
  pool.position.y = 0.33; pool.material = mats.chrome; pool.parent = fountain;
  const water = MeshBuilder.CreateCylinder('cyber-fountain-water', { diameter: 10.5, height: 0.12, tessellation: 48 }, scene);
  water.position.y = 0.68; water.material = mats.glass; water.parent = fountain;
  const crystal = MeshBuilder.CreateCylinder('cyber-fountain-crystal', { diameterTop: 0.4, diameterBottom: 2.8, height: 6.8, tessellation: 6 }, scene);
  crystal.position.y = 4.05; crystal.material = mats.glass; crystal.parent = fountain; shadows?.addShadowCaster(crystal);
  [2.1, 3.6].forEach((diameter, index) => {
    const halo = MeshBuilder.CreateTorus(`cyber-fountain-halo-${index}`, { diameter, thickness: 0.18, tessellation: 32 }, scene);
    halo.position.y = 2.2 + index * 1.55; halo.material = index ? mats.neonPink : mats.neonCyan; halo.parent = fountain;
  });

  // Bốn trục đi bộ từ vòng ngoài vào quảng trường.
  ground(scene, 'city-promenade-ns', 6, 91, 0, 0, mats.walk, root, 0.055);
  ground(scene, 'city-promenade-ew', 91, 6, 0, 0, mats.walk, root, 0.055);
  crosswalk(scene, 0, -51, true, root, mats.crossing);
  crosswalk(scene, 0, 51, true, root, mats.crossing);
  crosswalk(scene, -51, 0, false, root, mats.crossing);
  crosswalk(scene, 51, 0, false, root, mats.crossing);

  WORLD_LAYOUT.cityDistricts.filter(district => district.id !== 'civic').forEach(district => districtSign(scene, district, root));
  transitShelter(scene, -58, 13, Math.PI / 2, root, shadows, mats);
  transitShelter(scene, 58, -13, -Math.PI / 2, root, shadows, mats);

  // Trạm sạc EV và đèn đường LED khí động học tại bốn cửa ngõ.
  [[-57, -15], [57, 15]].forEach(([x, z], index) => {
    const charger = MeshBuilder.CreateBox(`ev-charger-${index}`, { width: 1.1, height: 2.4, depth: 0.8 }, scene);
    charger.position.set(x, 1.2, z); charger.material = mats.chrome; charger.parent = root;
    const screen = MeshBuilder.CreateBox(`ev-charger-screen-${index}`, { width: 0.65, height: 0.7, depth: 0.05 }, scene);
    screen.position.set(x, 1.55, z - 0.42); screen.material = mats.neonCyan; screen.parent = root;
  });
  for (let i = 0; i < 8; i += 1) {
    const angle = i * Math.PI / 4;
    const x = Math.cos(angle) * 47;
    const z = Math.sin(angle) * 47;
    const pole = MeshBuilder.CreateCylinder(`smart-led-pole-${i}`, { height: 4.8, diameter: 0.18, tessellation: 10 }, scene);
    pole.position.set(x, 2.4, z); pole.material = mats.chrome; pole.parent = root;
    const lamp = MeshBuilder.CreateSphere(`smart-led-lamp-${i}`, { diameter: 0.62, segments: 10 }, scene);
    lamp.position.set(x, 4.85, z); lamp.material = mats.neonCyan; lamp.parent = root;
  }

  const observer = scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    crystal.rotation.y += dt * 0.45;
  });

  return { root, fountain, districts: WORLD_LAYOUT.cityDistricts, dispose() { scene.onBeforeRenderObservable.remove(observer); root.dispose(false, true); } };
}
