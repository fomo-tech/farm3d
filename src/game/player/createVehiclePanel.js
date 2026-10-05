import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';

// Four chamfered rings: 34 vertices, a clean silhouette without dense geometry.
export function createVehiclePanel(scene, name, width, height, depth) {
  const positions = [], indices = [];
  const w = width / 2, d = depth / 2, bevel = Math.min(w, d) * 0.22;
  const outline = [[-w+bevel,-d],[w-bevel,-d],[w,-d+bevel],[w,d-bevel],[w-bevel,d],[-w+bevel,d],[-w,d-bevel],[-w,-d+bevel]];
  const rings = [[-.5,.9],[-.3,1],[.3,1],[.5,.9]];
  rings.forEach(([y, scale]) => outline.forEach(([x,z]) => positions.push(x*scale, y*height, z*scale)));
  for (let ring = 0; ring < 3; ring++) for (let edge = 0; edge < 8; edge++) {
    const a = ring*8+edge, b = ring*8+(edge+1)%8;
    indices.push(a,a+8,b+8,a,b+8,b);
  }
  positions.push(0,-height/2,0,0,height/2,0);
  for (let edge = 0; edge < 8; edge++) {
    indices.push(32,edge,(edge+1)%8,33,24+(edge+1)%8,24+edge);
  }
  // Babylon's left-handed winding is opposite the right-handed cross product.
  for (let index = 0; index < indices.length; index += 3) [indices[index+1], indices[index+2]] = [indices[index+2], indices[index+1]];
  const normals = []; VertexData.ComputeNormals(positions, indices, normals);
  const data = new VertexData(); data.positions = positions; data.indices = indices; data.normals = normals;
  const mesh = new Mesh(name, scene); data.applyToMesh(mesh); return mesh;
}
