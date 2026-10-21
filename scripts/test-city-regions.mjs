import assert from 'node:assert/strict';
import {CITY_REGION_BOUNDS,CITY_REGION_BUILDINGS,CITY_REGION_ROADS,CITY_REGION_DISTRICTS,CITY_REGION_MOUNTAINS,insideCityCoast,insideCityLake,distanceToCityRoad} from '../src/game/world/cityRegionLayout.js';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {createVibeCityMapSteps} from '../src/game/world/createVibeCityMap.js';
import {CITY_BUILDING_FOOTPRINTS,MINIMAP_ROADS} from '../src/game/world/minimapLayout.js';
import {roadEndpoints} from '../src/game/world/roadPolygon.js';
import {toSvgX,toSvgY} from '../src/game/world/worldMapDestinations.js';
import {WorldCollisionSystem} from '../src/game/physics/WorldCollisionSystem.js';
assert.ok(CITY_REGION_BUILDINGS.length>1000);
assert.equal(new Set(MINIMAP_ROADS.map(r=>r.id)).size,MINIMAP_ROADS.length,'Every road must have a unique identity');
assert.equal(new Set(CITY_REGION_BUILDINGS.map(b=>b.style)).size,5,'Districts must have distinct architecture');
assert.equal(CITY_REGION_BOUNDS.maxX-CITY_REGION_BOUNDS.minX,2800);
assert.equal(CITY_REGION_BOUNDS.maxZ-CITY_REGION_BOUNDS.minZ,3080);
// Crossings count as junctions even when they occur between polyline vertices.
const parents=CITY_REGION_ROADS.map((_,i)=>i);
const root=i=>parents[i]===i?i:parents[i]=root(parents[i]);
for(let i=0;i<CITY_REGION_ROADS.length;i++)for(let j=0;j<i;j++){
 const a=CITY_REGION_ROADS[i],b=CITY_REGION_ROADS[j];
 const ax=a.x2-a.x1,az=a.z2-a.z1,bx=b.x2-b.x1,bz=b.z2-b.z1,det=ax*bz-az*bx;
 let meets=false;
 if(Math.abs(det)>1e-6){const t=((b.x1-a.x1)*bz-(b.z1-a.z1)*bx)/det,u=((b.x1-a.x1)*az-(b.z1-a.z1)*ax)/det;meets=t>=-1e-6&&t<=1.000001&&u>=-1e-6&&u<=1.000001;}
 else meets=Math.min(distanceToCityRoad(a.x1,a.z1,b),distanceToCityRoad(a.x2,a.z2,b),distanceToCityRoad(b.x1,b.z1,a),distanceToCityRoad(b.x2,b.z2,a))<1;
 if(meets)parents[root(i)]=root(j);
}
assert.equal(new Set(parents.map((_,i)=>root(i))).size,1,'Regional streets must connect to the highway network');
for(const r of CITY_REGION_ROADS)for(let i=0;i<=40;i++){
 const x=r.x1+(r.x2-r.x1)*i/40,z=r.z1+(r.z2-r.z1)*i/40;
 assert.ok(insideCityCoast(x,z)&&!insideCityLake(x,z),`Road crosses water: ${r.id}`);
}
for(const m of CITY_REGION_MOUNTAINS)assert.ok(CITY_REGION_ROADS.every(r=>distanceToCityRoad(m.x,m.z,r)>m.radius+r.width/2), 'Mountain blocks road');
for(const d of CITY_REGION_DISTRICTS){assert.ok(insideCityCoast(d.x,d.z)&&!insideCityLake(d.x,d.z),`Destination in water: ${d.id}`);assert.ok(toSvgX(d.x)>0&&toSvgX(d.x)<1000&&toSvgY(d.z)>0&&toSvgY(d.z)<900);}
const engine=new NullEngine(),scene=new Scene(engine);
try{
 const steps=createVibeCityMapSteps(scene);
 let state,peakMeshes=0,buildingYields=0;
 do{state=steps.next();peakMeshes=Math.max(peakMeshes,scene.meshes.length);if(typeof state.value==='string'&&state.value.startsWith('city: buildings'))buildingYields++;}while(!state.done);
 const city=state.value;
 const surfaces=scene.meshes.filter(m=>m.metadata?.roadSurface);
 for(const mesh of surfaces){
  const r=MINIMAP_ROADS.find(r=>r.id.replace(/^city-/,'')===mesh.metadata.cityRoad.replace(/^city-/,''));
  assert.ok(r,`Unknown road mesh: ${mesh.name}`);
  const [a,b]=roadEndpoints(r),m=mesh.metadata;
  assert.ok(Math.hypot(a[0]-m.sourceStart[0],a[1]-m.sourceStart[1])<.002&&Math.hypot(b[0]-m.sourceEnd[0],b[1]-m.sourceEnd[1])<.002,`Road geometry differs from map: ${m.cityRoad}`);
 }
 assert.ok(surfaces.some(m=>m.metadata.laneDashes>0),'Multi-lane roads need dashed lane markings');
 assert.ok(surfaces.some(m=>m.metadata.crosswalkApproaches>0),'Junctions need pedestrian crossing approaches');
 assert.ok(city.root.metadata.streetFurnitureParts>100,'Street furniture must be constructed');
 assert.equal(city.collisionBoxes.filter(b=>b.id.startsWith('city-cargo-')).length,16,'Freight containers need solid collision');
 assert.ok(buildingYields>200,'City construction must yield while loading neighborhoods');
 assert.ok(peakMeshes<10000,`Excessive temporary mesh peak during boot: ${peakMeshes}`);
 console.log(`City boot: ${buildingYields} neighborhood slices, peak ${peakMeshes} meshes`);
 const collision=new WorldCollisionSystem({cityMode:true});
 for(const b of city.collisionBoxes)collision.addBox(b.id,b.minX,b.maxX,b.minZ,b.maxZ);
 for(const road of CITY_REGION_ROADS)for(let i=0;i<=40;i++)assert.equal(collision.isColliding(road.x1+(road.x2-road.x1)*i/40,road.z1+(road.z2-road.z1)*i/40,.5),false,`Blocked route: ${road.id}`);
 for(const b of CITY_BUILDING_FOOTPRINTS)assert.ok(city.collisionBoxes.some(r=>r.id===b.id||r.id===`city-collider-${b.id}`),`Missing 3D collider: ${b.id}`);
 const north=city.collisionBoxes.find(r=>r.id==='city-boundary-north');assert.equal((north.minZ+north.maxZ)/2,CITY_REGION_BOUNDS.minZ);
 console.log(`PASS island world: ${CITY_BUILDING_FOOTPRINTS.length} buildings, ${CITY_REGION_ROADS.length} regional road segments, matching 2D/3D and dry routes`);
 city.cityMasterplan.dispose();
}finally{scene.dispose();engine.dispose();}
