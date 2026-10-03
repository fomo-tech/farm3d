import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';

export const LAKE_CENTER = Object.freeze({ x: 167, z: 2 });
const SEGMENTS = 96;

export function lakeEdge(angle, scale = 1) {
  const shape = 1 + 0.055 * Math.sin(3 * angle + 0.35) + 0.025 * Math.cos(5 * angle - 0.6);
  return {
    x: LAKE_CENTER.x + Math.cos(angle) * 36 * shape * scale,
    z: LAKE_CENTER.z + Math.sin(angle) * 22 * shape * scale,
  };
}

function material(scene, name, color, shine = 0.035) {
  const value = new StandardMaterial(name, scene);
  value.diffuseColor = Color3.FromHexString(color);
  value.ambientColor = value.diffuseColor.scale(0.4);
  value.specularColor = new Color3(shine, shine, shine);
  value.specularPower = 72;
  value.backFaceCulling = false;
  return value;
}

function ring(scene, name, inner, outer, y, surface, start = 0, end = Math.PI * 2, segments = SEGMENTS) {
  const paths = [[], []];
  for (let index = 0; index <= segments; index += 1) {
    const angle = start + (end - start) * index / segments;
    const a = lakeEdge(angle, inner);
    const b = lakeEdge(angle, outer);
    paths[0].push(new Vector3(a.x, y, a.z));
    paths[1].push(new Vector3(b.x, y, b.z));
  }
  const mesh = MeshBuilder.CreateRibbon(name, { pathArray: paths, sideOrientation: Mesh.DOUBLESIDE }, scene);
  mesh.material = surface;
  mesh.isPickable = false;
  return mesh;
}

export function createRomanticLake(scene) {
  const deep = material(scene, 'lake-calm-blue', '#419fba', 0.105);
  const shallow = material(scene, 'lake-soft-shallows', '#74c9c1', 0.065);
  const shore = material(scene, 'lake-natural-bank', '#c8b58b');
  const path = material(scene, 'lake-promenade-stone', '#e3d4ba');
  const pathEdge = material(scene, 'lake-promenade-edge', '#b7a88c');
  const glimmer = material(scene, 'lake-subtle-glimmer', '#9edbd3', 0.01);
  glimmer.disableLighting = true;

  // Opaque fan: the grass below cannot bleed through and there is no alpha-sorting flicker.
  const positions = [LAKE_CENTER.x, 0.08, LAKE_CENTER.z];
  const indices = [];
  for (let index = 0; index <= SEGMENTS; index += 1) {
    const point = lakeEdge(index * Math.PI * 2 / SEGMENTS, 0.915);
    positions.push(point.x, 0.08, point.z);
    if (index > 0) indices.push(0, index, index + 1);
  }
  const water = new Mesh('crystal-lake', scene);
  const geometry = new VertexData();
  geometry.positions = positions;
  geometry.indices = indices;
  geometry.normals = [];
  VertexData.ComputeNormals(positions, indices, geometry.normals);
  geometry.applyToMesh(water);
  water.material = deep;
  water.isPickable = false;

  const meshes = [water,
    ring(scene, 'lake-shallow-edge', 0.915, 1, 0.081, shallow),
    ring(scene, 'lake-grass-bank', 1.005, 1.085, 0.037, shore),
    ring(scene, 'lake-walking-loop', 1.09, 1.175, 0.045, path),
    ring(scene, 'lake-path-outer-edge', 1.177, 1.188, 0.046, pathEdge),
  ];

  // Sparse, broken ripples read as calm water rather than a striped texture.
  [
    [-0.15, 0.74, 1.03],
    [1.38, 2.18, 0.77],
    [3.45, 4.12, 0.82],
    [4.7, 5.42, 0.66],
  ].forEach(([start, end, radius], index) => {
    meshes.push(ring(scene, `lake-glimmer-${index}`, radius, radius + 0.007, 0.087, glimmer, start, end, 20));
  });

  const lampMetal = material(scene, 'lake-lamp-metal', '#65736a');
  const lampLight = material(scene, 'lake-lamp-warm-light', '#f5d994', 0.01);
  lampLight.emissiveColor = Color3.FromHexString('#8b6633');
  [0.36, 1.23, 2.64, 3.72, 4.82, 5.61].forEach((angle, index) => {
    const point = lakeEdge(angle, 1.26);
    const post = MeshBuilder.CreateCylinder(`lake-promenade-lamp-${index}`, {
      height: 2.65, diameter: 0.13, tessellation: 8,
    }, scene);
    post.position.set(point.x, 1.33, point.z);
    post.material = lampMetal;
    const glow = MeshBuilder.CreateSphere(`lake-promenade-lantern-${index}`, { diameter: 0.42, segments: 8 }, scene);
    glow.position.set(point.x, 2.68, point.z);
    glow.material = lampLight;
  });

  // An open waterside pavilion gives the promenade a destination without
  // filling the sightline across the lake with another large building.
  const pavilionX = 214;
  const pavilionZ = 7;
  const deckMat = material(scene, 'lake-pavilion-deck', '#d9c19c');
  const columnMat = material(scene, 'lake-pavilion-columns', '#f0e5cc');
  const roofMat = material(scene, 'lake-pavilion-roof', '#ad6958');
  const deck = MeshBuilder.CreateCylinder('lake-pavilion-deck', {
    diameter: 7.2, height: 0.14, tessellation: 8,
  }, scene);
  deck.position.set(pavilionX, 0.07, pavilionZ);
  deck.material = deckMat;
  for (let index = 0; index < 6; index += 1) {
    const angle = index * Math.PI / 3;
    const post = MeshBuilder.CreateCylinder(`lake-pavilion-column-${index}`, {
      height: 2.85, diameter: 0.16, tessellation: 8,
    }, scene);
    post.position.set(pavilionX + Math.cos(angle) * 2.75, 1.5, pavilionZ + Math.sin(angle) * 2.75);
    post.material = columnMat;
  }
  const roof = MeshBuilder.CreateCylinder('lake-pavilion-roof', {
    diameterTop: 0.7, diameterBottom: 7.7, height: 1.25, tessellation: 8,
  }, scene);
  roof.position.set(pavilionX, 3.35, pavilionZ);
  roof.material = roofMat;

  return { water, meshes };
}
