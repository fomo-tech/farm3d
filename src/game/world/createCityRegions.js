import {Mesh} from '@babylonjs/core/Meshes/mesh.js';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData.js';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder.js';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial.js';
import {Color3} from '@babylonjs/core/Maths/math.color.js';
import {CITY_COAST,CITY_INLAND_LAKE,CITY_LAKE_OUTLINE,CITY_REGION_MOUNTAINS,CITY_REGION_BUILDINGS,CITY_REGION_ROADS,CITY_BIOMES,CITY_WORLD_SCALE,CITY_AIRPORT_RUNWAY,insideCityCoast,insideCityLake,distanceToCityRoad} from './cityRegionLayout.js';

export function createCityRegions(scene,root){
 const material=(name,color)=>{const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(color);m.specularColor=Color3.Black();return m;};
 const land=material('county-land','#697251'),sea=material('county-ocean','#164958'),sand=material('county-beach','#ac9d79'),rock=material('county-mountain','#626951');
 const ocean=MeshBuilder.CreateGround('county-ocean',{width:2400*CITY_WORLD_SCALE,height:2400*CITY_WORLD_SCALE},scene);ocean.position.set(0,-.08,-400*CITY_WORLD_SCALE);ocean.material=sea;ocean.parent=root;ocean.isPickable=false;
 const mesh=new Mesh('county-island',scene),positions=[0,.002,-400*CITY_WORLD_SCALE],indices=[];
 for(const [x,z] of CITY_COAST)positions.push(x,.002,z);
 for(let i=0;i<CITY_COAST.length;i++)indices.push(0,(i+1)%CITY_COAST.length+1,i+1);
 const normals=[];VertexData.ComputeNormals(positions,indices,normals);const data=new VertexData();data.positions=positions;data.indices=indices;data.normals=normals;data.applyToMesh(mesh);mesh.material=land;mesh.parent=root;mesh.receiveShadows=true;mesh.isPickable=false;
 for(const biome of CITY_BIOMES){
  const terrain=new Mesh(`county-biome-${biome.id}`,scene),p=biome.points.flatMap(([x,z])=>[x,.008,z]),idx=[];
  for(let i=1;i<biome.points.length-1;i++)idx.push(0,i+1,i);
  const n=[];VertexData.ComputeNormals(p,idx,n);const v=new VertexData();v.positions=p;v.indices=idx;v.normals=n;v.applyToMesh(terrain);terrain.material=material(`county-biome-${biome.id}`,biome.color);terrain.material.backFaceCulling=false;terrain.parent=root;terrain.isPickable=false;terrain.receiveShadows=true;
 }
 const shoreline=[];
 for(let i=0;i<CITY_COAST.length;i++){
  const [x,z]=CITY_COAST[i],[xx,zz]=CITY_COAST[(i+1)%CITY_COAST.length],length=Math.hypot(xx-x,zz-z);
  const beach=MeshBuilder.CreateBox('county-beach-strip',{width:length+.8,height:.03,depth:12},scene);beach.position.set((x+xx)/2,.02,(z+zz)/2);beach.rotation.y=-Math.atan2(zz-z,xx-x);beach.material=sand;shoreline.push(beach);
 }
 const beaches=Mesh.MergeMeshes(shoreline,true,true);beaches.parent=root;beaches.isPickable=false;
 const lake=new Mesh('county-inland-lake',scene),lp=[CITY_INLAND_LAKE.x,.045,CITY_INLAND_LAKE.z],li=[];
 for(const [x,z] of CITY_LAKE_OUTLINE)lp.push(x,.045,z);
 for(let i=0;i<CITY_LAKE_OUTLINE.length;i++)li.push(0,i+1,(i+1)%CITY_LAKE_OUTLINE.length+1);
 const ln=[];VertexData.ComputeNormals(lp,li,ln);const lv=new VertexData();lv.positions=lp;lv.indices=li;lv.normals=ln;lv.applyToMesh(lake);lake.material=sea;sea.backFaceCulling=false;lake.parent=root;lake.isPickable=false;
 for(const m of CITY_REGION_MOUNTAINS){
  const peak=new Mesh('county-mountain-ridge',scene),p=[],idx=[],steps=22;
  for(let j=0;j<=steps;j++)for(let i=0;i<=steps;i++){
   const u=i/steps*2-1,v=j/steps*2-1,falloff=Math.max(0,1-Math.hypot(u,v));
   const ridge=.62+.23*Math.sin(u*5+v*3)+.15*Math.cos(v*7-u*2);
   p.push(m.x+u*m.radius,.015+Math.pow(falloff,1.1)*m.height*ridge,m.z+v*m.radius);
  }
  for(let j=0;j<steps;j++)for(let i=0;i<steps;i++){const a=j*(steps+1)+i;idx.push(a,a+steps+1,a+1,a+1,a+steps+1,a+steps+2);}
  const n=[];VertexData.ComputeNormals(p,idx,n);const v=new VertexData();v.positions=p;v.indices=idx;v.normals=n;v.applyToMesh(peak);peak.material=rock;peak.parent=root;peak.isPickable=false;peak.receiveShadows=true;
 }
 const crowns=[],trunks=[];
 for(let i=0;i<1800;i++){
  const x=(-450+(i*137.29%920))*CITY_WORLD_SCALE,z=(-1080+(i*83.71%1290))*CITY_WORLD_SCALE;
  if(Math.abs(x)<250&&Math.abs(z)<250||!insideCityCoast(x,z)||insideCityLake(x,z,18))continue;
  if(CITY_REGION_ROADS.some(r=>distanceToCityRoad(x,z,r)<r.width/2+8)||CITY_REGION_BUILDINGS.some(b=>Math.abs(b.x-x)<14&&Math.abs(b.z-z)<14)||CITY_REGION_MOUNTAINS.some(m=>Math.hypot(m.x-x,m.z-z)<m.radius))continue;
  const h=4+i%5,t=MeshBuilder.CreateCylinder('county-tree-trunk',{height:h*.55,diameter:.55,tessellation:5},scene);t.position.set(x,h*.275,z);trunks.push(t);
  const c=MeshBuilder.CreateCylinder('county-tree-crown',{height:h,diameterTop:.2,diameterBottom:3.5+i%3,tessellation:6},scene);c.position.set(x,h*.75,z);crowns.push(c);
 }
 for(const [items,color,name] of [[crowns,'#304d3d','canopy'],[trunks,'#5b4b37','trunks']])if(items.length){const trees=Mesh.MergeMeshes(items,true,true);trees.name=`county-forest-${name}`;trees.material=material(trees.name,color);trees.parent=root;trees.isPickable=false;}
 // The airport and freight yard use open, marked surfaces rather than empty lots.
 const airport=CITY_AIRPORT_RUNWAY;
 const runway=MeshBuilder.CreateBox('county-international-runway',{width:airport.width,height:.08,depth:airport.depth},scene);runway.position.set(airport.x,.07,airport.z);runway.material=material('county-runway','#343b40');runway.parent=root;
 const marks=[];for(let x=airport.x-airport.width/2+12;x<airport.x+airport.width/2-12;x+=20){const m=MeshBuilder.CreateBox('county-runway-mark',{width:10,height:.02,depth:.7},scene);m.position.set(x,.12,airport.z);marks.push(m);}
 const markings=Mesh.MergeMeshes(marks,true,true);markings.material=material('county-road-white','#d0d3cc');markings.parent=root;
 root.metadata.regionBuildingCount=CITY_REGION_BUILDINGS.length;
}
