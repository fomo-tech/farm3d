import {Mesh} from '@babylonjs/core/Meshes/mesh.js';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData.js';
import {roadFootprint,subtractRoadPolygon} from './roadPolygon.js';

// The city block is pavement; only the road corridors are asphalt.
export function createCityBlockGround(scene,root,materials,roads){
 const grid=[-240,-210,-130,-45,0,45,130,210,240],positions=[],indices=[],normals=[];
 const cutters=roads.filter(r=>r.id!=='city-north-flyover'&&r.id!=='city-waterfront-bridge').map(r=>roadFootprint({...r,width:r.width+5},roads));
 for(let x=0;x<grid.length-1;x++)for(let z=0;z<grid.length-1;z++){
  let pieces=[[[grid[x],grid[z]],[grid[x+1],grid[z]],[grid[x+1],grid[z+1]],[grid[x],grid[z+1]]]];
  for(const c of cutters){
   if(Math.max(...c.map(p=>p[0]))<grid[x]||Math.min(...c.map(p=>p[0]))>grid[x+1]||Math.max(...c.map(p=>p[1]))<grid[z]||Math.min(...c.map(p=>p[1]))>grid[z+1])continue;
   pieces=pieces.flatMap(p=>subtractRoadPolygon(p,c));
  }
  for(const p of pieces){const offset=positions.length/3;for(const [px,pz] of p){positions.push(px,.018,pz);normals.push(0,1,0);}for(let i=1;i<p.length-1;i++)indices.push(offset,offset+i,offset+i+1);}
 }
 const mesh=new Mesh('city-block-pavement',scene),data=new VertexData();data.positions=positions;data.indices=indices;data.normals=normals;data.applyToMesh(mesh);mesh.material=materials.walk;mesh.parent=root;mesh.isPickable=false;mesh.receiveShadows=true;
 return mesh;
}
