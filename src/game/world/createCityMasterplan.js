import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { WORLD_LAYOUT } from './worldLayout.js';

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
  const texture = new DynamicTexture(`district-sign-${district.id}`, { width: 640, height: 180 }, scene, true);
  texture.hasAlpha = true;
  const ctx = texture.getContext();
  ctx.clearRect(0, 0, 640, 180);
  ctx.fillStyle = '#fffdf5';
  ctx.beginPath();
  ctx.roundRect(10, 10, 620, 160, 42);
  ctx.fill();
  ctx.strokeStyle = district.color;
  ctx.lineWidth = 12;
  ctx.stroke();
  texture.drawText(`${district.icon} ${district.label}`, null, 112, '800 48px "Segoe UI", sans-serif', '#273548', null, true, true);

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
    asphalt: material(scene, 'city-ring-road-mat', '#cfb993'),
    curb: material(scene, 'city-curb-mat', '#fff3d7'),
    walk: material(scene, 'city-pedestrian-mat', '#f7e7c6'),
    crossing: material(scene, 'city-crossing-mat', '#fffdf5'),
    stop: material(scene, 'city-stop-mat', '#52b8ce'),
    wood: material(scene, 'city-stop-wood-mat', '#76513a'),
  };

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

  return { root, districts: WORLD_LAYOUT.cityDistricts };
}
