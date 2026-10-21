import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { WORLD_LAYOUT } from './worldLayout.js';
import { MINIMAP_ROADS } from './minimapLayout.js';
import { CITY_LANDMARK_BUILDINGS, CITY_CONNECTOR_ROADS, createCityInfill } from './cityUrbanLayout.js';
import {CITY_REGION_ROADS,CITY_REGION_BUILDINGS,CITY_REGION_MOUNTAINS} from './cityRegionLayout.js';
import {createCityRegions} from './createCityRegions.js';
import {createCityRoadSurface} from './cityRoadSurface.js';
import {createCityBlockGround} from './cityBlockGround.js';
import {createCityStreetFurnitureSteps} from './cityStreetFurniture.js';
import {createCitySampleDistrict} from './citySampleDistrict.js';
import {createCityAmbientLife} from './cityAmbientLife.js';

const CITY_BOUNDS = WORLD_LAYOUT.cityMap.bounds;

function mat(scene, name, hex, emissive = null, specular = 0.1) {
  const result = new StandardMaterial(name, scene);
  result.diffuseColor = Color3.FromHexString(hex);
  result.ambientColor = result.diffuseColor.scale(0.32);
  result.specularColor = new Color3(specular, specular, specular);
  result.specularPower = 64;
  if (emissive) result.emissiveColor = Color3.FromHexString(emissive);
  return result;
}

function box(scene, name, size, position, material, parent, shadows = null) {
  const mesh = MeshBuilder.CreateBox(name, size, scene);
  mesh.position.set(position.x, position.y, position.z);
  mesh.material = material;
  mesh.parent = parent;
  mesh.receiveShadows = true;
  mesh.isPickable = false;
  if (shadows && position.y > 0.7) shadows.addShadowCaster(mesh);
  return mesh;
}

function addCollider(colliders, id, x, z, width, depth) {
  colliders.push({ id, minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2 });
}

function road(scene,root,materials,spec){return createCityRoadSurface(scene,root,materials,spec,MINIMAP_ROADS);}

function runway(scene, root, materials, x, z, length, width, id) {
  box(scene, `city-runway-${id}`, { width: length, height: 0.06, depth: width }, { x, y: 0.07, z }, materials.road, root);
  box(scene, `city-runway-${id}-center`, { width: length - 10, height: 0.018, depth: 0.18 }, { x, y: 0.105, z }, materials.crosswalk, root);
  for (const offset of [-length / 2 + 5, length / 2 - 5]) {
    box(scene, `city-runway-${id}-threshold-${offset}`, { width: 0.75, height: 0.02, depth: width - 2 }, { x: x + offset, y: 0.11, z }, materials.crosswalk, root);
  }
}

function crosswalk(scene, root, materials, x, z, horizontal = true) {
  for (let index = -3; index <= 3; index += 1) {
    box(scene, `city-crosswalk-${x}-${z}-${index}`, {
      width: horizontal ? 0.8 : 5.4,
      height: 0.022,
      depth: horizontal ? 5.4 : 0.8,
    }, {
      x: horizontal ? x + index * 1.1 : x,
      y: 0.1,
      z: horizontal ? z : z + index * 1.1,
    }, materials.crosswalk, root);
  }
}

function districtSign(scene, root, district, materials) {
  // NullEngine has no DOM/OffscreenCanvas. Keep headless map construction
  // deterministic with a small geometry sign while browsers get the label.
  if (typeof document === 'undefined' && typeof OffscreenCanvas === 'undefined') {
    const fallback = box(scene, `city-sign-${district.id}-fallback`, { width: 7.4, height: 1.85, depth: 0.08 },
      { x: district.x, y: 5.4, z: district.z }, materials.cyan, root);
    fallback.metadata = { cityDistrict: district.id, label: district.label };
    return;
  }
  const texture = new DynamicTexture(`city-sign-${district.id}`, { width: 1024, height: 256 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  texture.hasAlpha = true;
  const context = texture.getContext();
  context.clearRect(0, 0, 1024, 256);
  context.fillStyle = '#111a24';
  context.roundRect(8, 8, 1008, 240, 42);
  context.fill();
  context.strokeStyle = district.color;
  context.lineWidth = 18;
  context.stroke();
  texture.drawText(district.label.toUpperCase(), null, 164, '800 62px Segoe UI', '#f5f7fa', null, true, true);

  const signMaterial = new StandardMaterial(`city-sign-material-${district.id}`, scene);
  signMaterial.diffuseTexture = texture;
  signMaterial.opacityTexture = texture;
  signMaterial.emissiveColor = Color3.FromHexString(district.color).scale(0.26);
  signMaterial.disableLighting = true;
  const sign = MeshBuilder.CreatePlane(`city-sign-${district.id}`, { width: 7.4, height: 1.85 }, scene);
  sign.position.set(district.x, 5.4, district.z);
  sign.billboardMode = Mesh.BILLBOARDMODE_Y;
  sign.material = signMaterial;
  sign.parent = root;
  sign.isPickable = false;
}

function building(scene, root, materials, shadows, colliders, spec) {
  const buildingRoot = new TransformNode(`city-building-${spec.id}`, scene);
  buildingRoot.position.set(spec.x, 0, spec.z);
  buildingRoot.parent = root;

  box(scene, `${spec.id}-body`, { width: spec.width, height: spec.height, depth: spec.depth },
    { x: 0, y: spec.height / 2, z: 0 }, materials[spec.palette], buildingRoot, shadows);
  box(scene, `${spec.id}-roof`, { width: spec.width + 0.35, height: 0.28, depth: spec.depth + 0.35 },
    { x: 0, y: spec.height + 0.14, z: 0 }, materials.roof, buildingRoot, shadows);
  const tower=spec.height>=25;
  // A recessed ground floor and framed openings give the street-facing volume scale.
  box(scene,`${spec.id}-base-course`,{width:spec.width+.15,height:.55,depth:spec.depth+.15},{x:0,y:.28,z:0},materials.concrete,buildingRoot);
  box(scene,`${spec.id}-entrance`,{width:3,height:3,depth:.1},{x:0,y:1.5,z:-spec.depth/2-.1},materials.glass,buildingRoot);
  box(scene,`${spec.id}-entry-canopy`,{width:6,height:.22,depth:2.1},{x:0,y:3.35,z:-spec.depth/2-.65},materials.concrete,buildingRoot);
  for(const side of [-1,1])box(scene,`${spec.id}-entry-column-${side}`,{width:.32,height:3.4,depth:.45},{x:side*2.6,y:1.7,z:-spec.depth/2-.3},materials.silver,buildingRoot);
  if(tower){
    box(scene,`${spec.id}-penthouse`,{width:spec.width*.68,height:4,depth:spec.depth*.7},{x:0,y:spec.height+2,z:0},materials.glass,buildingRoot,shadows);
    for(const side of [-1,1])box(scene,`${spec.id}-vertical-fin-${side}`,{width:.55,height:spec.height,depth:.3},{x:side*spec.width*.36,y:spec.height/2,z:-spec.depth/2-.13},materials.concrete,buildingRoot);
  }else{
    box(scene,`${spec.id}-parapet`,{width:spec.width+.4,height:.65,depth:.3},{x:0,y:spec.height+.45,z:-spec.depth/2},materials.concrete,buildingRoot);
  }

  const columns = Math.min(5, Math.max(2, Math.floor(spec.width / 2.4)));
  const rows = Math.min(6, Math.max(2, Math.floor(spec.height / 2.6)));
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = -spec.width / 2 + 1.2 + column * ((spec.width - 2.4) / Math.max(1, columns - 1));
      const y = 1.8 + row * 2.35;
      box(scene, `${spec.id}-window-${row}-${column}`, { width: 0.92, height: 0.62, depth: 0.045 },
        { x, y, z: -spec.depth / 2 - 0.03 }, row % 3 === 0 ? materials.windowWarm : materials.window, buildingRoot);
      box(scene,`${spec.id}-rear-window-${row}-${column}`,{width:1.1,height:1,depth:.05},{x,y,z:spec.depth/2+.04},materials.window,buildingRoot);
      for(const side of [-1,1])box(scene,`${spec.id}-facade-side-${side}-${row}-${column}`,{width:.05,height:1,depth:1.1},{x:side*(spec.width/2+.04),y,z:-spec.depth/2+1.3+column*(spec.depth-2.6)/Math.max(1,columns-1)},materials.window,buildingRoot);
      if (spec.sideWindows && column === 0) {
        box(scene, `${spec.id}-side-window-${row}`, { width: 0.045, height: 0.62, depth: 0.92 },
          { x: -spec.width / 2 - 0.03, y, z: -spec.depth / 2 + 1.2 + row * 0.12 }, materials.window, buildingRoot);
      }
    }
  }

  const sign = box(scene, `${spec.id}-front-sign`, { width: Math.min(spec.width * 0.7, 6.2), height: 0.65, depth: 0.08 },
    { x: 0, y: Math.min(spec.height - 0.85, 5.8), z: -spec.depth / 2 - 0.08 }, materials[spec.sign], buildingRoot, shadows);
  sign.metadata = { cityAction: spec.action, district: spec.district };
  if (spec.roofAccent) {
    box(scene, `${spec.id}-roof-accent`, { width: 0.22, height: 2.2, depth: 0.22 },
      { x: spec.width * 0.28, y: spec.height + 1.25, z: spec.depth * 0.16 }, materials[spec.roofAccent], buildingRoot, shadows);
  }
  addCollider(colliders, `city-collider-${spec.id}`, spec.x, spec.z, spec.width + 0.5, spec.depth + 0.5);
  // Merge repeated facade pieces in world space, then attach them to the map root.
  const facadeBatches=new Map();
  for(const mesh of buildingRoot.getChildMeshes())if(/window|facade-side/.test(mesh.name)){
    if(!facadeBatches.has(mesh.material))facadeBatches.set(mesh.material,[]);
    facadeBatches.get(mesh.material).push(mesh);
  }
  for(const [material,meshes] of facadeBatches){
    const merged=Mesh.MergeMeshes(meshes,true,true);
    if(merged){merged.name=`${spec.id}-facade-batch-${material.name}`;merged.parent=root;merged.isPickable=false;merged.receiveShadows=true;}
  }
  return buildingRoot;
}

function streetLight(scene, root, materials, shadows, x, z, rotation = 0) {
  const pole = MeshBuilder.CreateCylinder(`city-streetlight-pole-${x}-${z}`, { height: 4.8, diameter: 0.16, tessellation: 10 }, scene);
  pole.position.set(x, 2.4, z);
  pole.rotation.y = rotation;
  pole.material = materials.metal;
  pole.parent = root;
  const arm = box(scene, `city-streetlight-arm-${x}-${z}`, { width: 0.16, height: 0.16, depth: 1.2 }, { x, y: 4.65, z: z + 0.45 }, materials.metal, root, shadows);
  arm.rotation.y = rotation;
  const lamp = MeshBuilder.CreateSphere(`city-streetlight-lamp-${x}-${z}`, { diameter: 0.48, segments: 10 }, scene);
  lamp.position.set(x, 4.7, z + 0.92);
  lamp.material = materials.lamp;
  lamp.parent = root;
}

function parkedCar(scene, root, materials, shadows, x, z, rotation, paint, index) {
  const car = new TransformNode(`city-parked-car-${index}`, scene);
  car.position.set(x, 0, z);
  car.rotation.y = rotation;
  car.parent = root;
  box(scene, `city-car-body-${index}`, { width: 1.7, height: 0.48, depth: 3.2 }, { x: 0, y: 0.42, z: 0 }, materials[paint], car, shadows);
  box(scene, `city-car-cabin-${index}`, { width: 1.25, height: 0.42, depth: 1.5 }, { x: 0, y: 0.82, z: -0.16 }, materials.glass, car, shadows);
  for (const wheelZ of [-1.05, 1.05]) {
    for (const wheelX of [-0.78, 0.78]) {
      const wheel = MeshBuilder.CreateCylinder(`city-car-wheel-${index}-${wheelX}-${wheelZ}`, { diameter: 0.42, height: 0.16, tessellation: 10 }, scene);
      wheel.position.set(wheelX, 0.27, wheelZ);
      wheel.rotation.z = Math.PI / 2;
      wheel.material = materials.tire;
      wheel.parent = car;
    }
  }
}

function tree(scene, root, materials, shadows, x, z, scale = 1) {
  const treeRoot = new TransformNode(`city-tree-${x}-${z}`, scene);
  treeRoot.position.set(x, 0, z);
  treeRoot.scaling.set(scale, scale, scale);
  treeRoot.parent = root;
  const trunk = MeshBuilder.CreateCylinder(`city-tree-trunk-${x}-${z}`, { height: 2.2, diameter: 0.42, tessellation: 8 }, scene);
  trunk.position.y = 1.1;
  trunk.material = materials.trunk;
  trunk.parent = treeRoot;
  const crown = MeshBuilder.CreateSphere(`city-tree-crown-${x}-${z}`, { diameter: 3.2, segments: 8 }, scene);
  crown.position.y = 3.1;
  crown.scaling.y = 0.82;
  crown.material = materials.leaf;
  crown.parent = treeRoot;
  shadows?.addShadowCaster(crown);
}

function park(scene, root, materials, shadows, x, z, width, depth, name) {
  box(scene, `${name}-ground`, { width, height: 0.08, depth }, { x, y: 0.045, z }, materials.park, root);
  box(scene, `${name}-walk-x`, { width: width - 4, height: 0.035, depth: 1.7 }, { x, y: 0.11, z }, materials.walk, root);
  box(scene, `${name}-walk-z`, { width: 1.7, height: 0.035, depth: depth - 4 }, { x, y: 0.115, z }, materials.walk, root);
  const points = [[x - width / 2 + 3, z - depth / 2 + 3], [x + width / 2 - 3, z - depth / 2 + 3], [x - width / 2 + 3, z + depth / 2 - 3], [x + width / 2 - 3, z + depth / 2 - 3]];
  points.forEach(([px, pz]) => tree(scene, root, materials, shadows, px, pz, 0.8));
}

function neonStrip(scene, root, materials, id, x, y, z, width, materialName, rotation = 0) {
  const strip = box(scene, `city-neon-${id}`, { width, height: 0.16, depth: 0.08 }, { x, y, z }, materials[materialName], root);
  strip.rotation.y = rotation;
  strip.metadata = { cityTheme: 'crime-city', prop: 'neon-sign' };
  return strip;
}

function waterfront(scene, root, materials, shadows, colliders) {
  box(scene, 'city-waterfront-water', { width: 42, height: 0.06, depth: 132 }, { x: 169, y: 0.03, z: 48 }, materials.water, root);
  // Keep the bridge approach flush: no raised quay across its carriageway.
  box(scene, 'city-waterfront-quay-north-edge', { width: 6, height: 0.32, depth: 9 }, { x: 146, y: 0.16, z: -13.5 }, materials.quay, root);
  box(scene, 'city-waterfront-quay-north', { width: 6, height: 0.32, depth: 30 }, { x: 146, y: 0.16, z: 24 }, materials.quay, root);
  box(scene, 'city-waterfront-quay-south', { width: 6, height: 0.32, depth: 63 }, { x: 146, y: 0.16, z: 82.5 }, materials.quay, root);
  for (const z of [-6, 28, 62, 96]) {
    box(scene, `city-dock-${z}`, { width: 18, height: 0.22, depth: 2.2 }, { x: 158, y: 0.28, z }, materials.wood, root, shadows);
    for (const x of [151, 165]) {
      const post = MeshBuilder.CreateCylinder(`city-dock-post-${x}-${z}`, { height: 1.5, diameter: 0.18, tessellation: 8 }, scene);
      post.position.set(x, 0.72, z);
      post.material = materials.wood;
      post.parent = root;
    }
  }
  // Leave a narrow opening at z=45 for the waterfront bridge. The water mesh
  // stays continuous, but the player can cross on the bridge deck.
  addCollider(colliders, 'city-waterfront-water-north-edge', 169, -13.5, 42, 9);
  addCollider(colliders, 'city-waterfront-water-north', 169, 25.5, 42, 33);
  addCollider(colliders, 'city-waterfront-water-south', 169, 84, 42, 60);
}

function bridge(scene, root, materials, shadows, spec) {
  const horizontal = spec.axis === 'x';
  const length = spec.length || 40;
  const width = spec.width || 9;
  const height = spec.height ?? 0.22;
  const x = spec.x ?? 0;
  const z = spec.z ?? 0;
  const deck = box(scene, `city-bridge-${spec.id}-deck`, {
    width: horizontal ? length : width,
    height,
    depth: horizontal ? width : length,
  }, { x, y: spec.y ?? height / 2, z }, materials.road, root, shadows);

  const railHeight = spec.railHeight ?? 0.72;
  for (const side of [-1, 1]) {
    box(scene, `city-bridge-${spec.id}-rail-${side}`, {
      width: horizontal ? length : 0.14,
      height: railHeight,
      depth: horizontal ? 0.14 : length,
    }, {
      x: horizontal ? x : x + side * (width / 2 - 0.34),
      y: (spec.y ?? height / 2) + height / 2 + railHeight / 2,
      z: horizontal ? z + side * (width / 2 - 0.34) : z,
    }, materials.metal, root, shadows);
  }

  const supportPositions = spec.supports || [];
  supportPositions.forEach((offset, index) => {
    const support = box(scene, `city-bridge-${spec.id}-support-${index}`, {
      width: horizontal ? 0.75 : width - 1.5,
      height: Math.max(0.4, (spec.y ?? height / 2) - 0.1),
      depth: horizontal ? width - 1.5 : 0.75,
    }, {
      x: horizontal ? x + offset : x,
      y: Math.max(0.2, (spec.y ?? height / 2) / 2 - 0.05),
      z: horizontal ? z : z + offset,
    }, materials.quay, root, shadows);
    support.metadata = { cityStructure: 'bridge-support', bridgeId: spec.id };
  });
  return deck;
}

function roundabout(scene, root, materials, colliders, x, z, id) {
  const ring = MeshBuilder.CreateTorus(`city-roundabout-${id}-ring`, { diameter: 15, thickness: 1.15, tessellation: 32 }, scene);
  ring.position.set(x, 0.13, z);
  ring.material = materials.road;
  ring.parent = root;
  ring.isPickable = false;
  const island = MeshBuilder.CreateCylinder(`city-roundabout-${id}-island`, { diameter: 9, height: 0.22, tessellation: 24 }, scene);
  island.position.set(x, 0.16, z);
  island.material = materials.park;
  island.parent = root;
  island.isPickable = false;
  tree(scene, root, materials, null, x, z, 0.52);
  addCollider(colliders, `city-roundabout-${id}`, x, z, 9.5, 9.5);
}

function cityBoundary(colliders) {
  const width = CITY_BOUNDS.maxX - CITY_BOUNDS.minX;
  const depth = CITY_BOUNDS.maxZ - CITY_BOUNDS.minZ;
  const cx=(CITY_BOUNDS.minX+CITY_BOUNDS.maxX)/2,cz=(CITY_BOUNDS.minZ+CITY_BOUNDS.maxZ)/2;
  addCollider(colliders, 'city-boundary-west', CITY_BOUNDS.minX, cz, 1, depth);
  addCollider(colliders, 'city-boundary-east', CITY_BOUNDS.maxX, cz, 1, depth);
  addCollider(colliders, 'city-boundary-north', cx, CITY_BOUNDS.minZ, width, 1);
  addCollider(colliders, 'city-boundary-south', cx, CITY_BOUNDS.maxZ, width, 1);
}

function* fillCityBlocksSteps(scene, root, materials, colliders) {
  const batches = new Map();
  let partRotation=0,partOrigin=null;
  const add = (name, size, position, material) => {
    const mesh = box(scene, name, size, position, material, root);
    if(partOrigin){const dx=position.x-partOrigin.x,dz=position.z-partOrigin.z,c=Math.cos(partRotation),s=Math.sin(partRotation);mesh.position.x=partOrigin.x+dx*c+dz*s;mesh.position.z=partOrigin.z-dx*s+dz*c;mesh.rotation.y=partRotation;}
    const key=`${Math.floor(mesh.position.x/256)}:${Math.floor(mesh.position.z/256)}:${material.uniqueId}`;
    if (!batches.has(key)) batches.set(key, []);
    batches.get(key).push(mesh);
    return mesh;
  };
  const infill = [...createCityInfill(MINIMAP_ROADS),...CITY_REGION_BUILDINGS].sort((a,b)=>Math.floor(a.x/256)-Math.floor(b.x/256)||Math.floor(a.z/256)-Math.floor(b.z/256));
  let built=0,batchCount=0,currentTile=null;
  function* flushBatches(){
    for(const [key,meshes] of batches){
      const merged=Mesh.MergeMeshes(meshes,true,true);
      if(merged){
        merged.name=`city-infill-batch-${key}-${batchCount}`;merged.parent=root;
        merged.isPickable=false;merged.receiveShadows=true;merged.freezeWorldMatrix();batchCount++;
      }
      yield `city: buildings ${built}/${infill.length}`;
    }
    batches.clear();
  }
  for (const {id, x, z, width, depth, height, palette,style='apartment',rotation=0} of infill) {
    const tile=`${Math.floor(x/256)}:${Math.floor(z/256)}`;
    if(tile!==currentTile){yield* flushBatches();currentTile=tile;}
    partOrigin={x,z};partRotation=rotation;
    const tower=style==='tower',home=style==='villa'||style==='bungalow';
    add(`${id}-body`, { width, height:tower?height*.72:height, depth }, { x, y: tower?height*.36:height/2, z }, materials[palette]);
    if(tower)add(`${id}-upper`,{width:width*.72,height:height*.28,depth:depth*.75},{x,y:height*.86,z},materials.glass);
    if(home){
      for(const side of [-1,1]){const roof=add(`${id}-pitched-roof-${side}`,{width:width/2+.6,height:.35,depth:depth+1},{x:x+side*width/4,y:height+.85,z},materials.tile);roof.rotation.z=-side*.32;}
      add(`${id}-door`,{width:1.2,height:2.1,depth:.08},{x,y:1.05,z:z-depth/2-.06},materials.wood);
      add(`${id}-chimney`,{width:.7,height:1.9,depth:.8},{x:x+width*.25,y:height+1.8,z:z+depth*.2},materials.brick);
    }else{
      add(`${id}-roof`, { width: tower?width*.76:width+.3, height: .3, depth: tower?depth*.8:depth+.3 }, { x, y: height + .15, z }, materials.roof);
      add(`${id}-hvac`,{width:2.1,height:1.1,depth:1.5},{x:x+width*.12,y:height+.85,z:z+depth*.1},materials.concrete);
      add(`${id}-hvac-grille`,{width:1.8,height:.06,depth:1.2},{x:x+width*.12,y:height+1.42,z:z+depth*.1},materials.metal);
      add(`${id}-plinth`,{width:width+.12,height:.45,depth:depth+.12},{x,y:.24,z},materials.concrete);
      if(style!=='warehouse'){
        add(`${id}-entrance`,{width:2.1,height:2.6,depth:.08},{x,y:1.3,z:z-depth/2-.05},materials.glass);
        for(const side of [-1,1])add(`${id}-entry-pier-${side}`,{width:.25,height:3,depth:.35},{x:x+side*1.2,y:1.5,z:z-depth/2-.12},materials.silver);
        add(`${id}-canopy`,{width:width*.6,height:.16,depth:1.3},{x,y:3.1,z:z-depth/2-.25},materials.concrete);
      }
    }
    for (let y = 2; y < height - 1; y += 3) {
      if(tower&&y>height*.71)continue;
      add(`${id}-front-${y}`, { width: home?2:width-2, height: home?1:.65, depth: .05 }, { x:home?x-width*.25:x, y, z: z - depth / 2 - .04 }, materials.window);
      add(`${id}-side-${y}`, { width: .05, height: .65, depth: depth - 2 }, { x: x + width / 2 + .04, y, z }, materials.windowWarm);
      if(!home){
        add(`${id}-rear-${y}`,{width:width-2,height:.65,depth:.05},{x,y,z:z+depth/2+.04},materials.window);
        add(`${id}-left-${y}`,{width:.05,height:.65,depth:depth-2},{x:x-width/2-.04,y,z},materials.window);
        for(const offset of [-width*.25,width*.25])add(`${id}-mullion-${y}-${offset}`,{width:.13,height:.8,depth:.09},{x:x+offset,y,z:z-depth/2-.06},materials.concrete);
      }
      if(style==='apartment'&&y>2)add(`${id}-balcony-${y}`,{width:width*.65,height:.18,depth:.9},{x,y:y-.55,z:z-depth/2-.35},materials.silver);
    }
    if(style==='warehouse')add(`${id}-loading-door`,{width:width*.6,height:3.5,depth:.1},{x,y:1.75,z:z-depth/2-.08},materials.metal);
    addCollider(colliders,id,x,z,Math.abs(Math.cos(rotation))*width+Math.abs(Math.sin(rotation))*depth+.5,Math.abs(Math.sin(rotation))*width+Math.abs(Math.cos(rotation))*depth+.5);
    if(++built%8===0)yield `city: buildings ${built}/${infill.length}`;
    if(built%16===0)yield* flushBatches();
  }
  yield* flushBatches();
  root.metadata.infillBuildingCount = infill.length;
  root.metadata.buildingBatchCount = batchCount;
}

/**
 * Vibe City island: a southern urban core connected to coastal suburbs,
 * county towns, an inland lake and northern mountain scenery.
 */
export function* createVibeCityMapSteps(scene, shadows) {
  scene.metadata={...scene.metadata,cityLighting:true};
  const root = new TransformNode('vibe-city-island-v4', scene);
  root.metadata = { zone: 'city', mapId: WORLD_LAYOUT.cityMap.id, theme: WORLD_LAYOUT.cityMap.theme, layoutVersion: WORLD_LAYOUT.version };
  const colliders = [];
  const materials = {
    asphalt: mat(scene, 'city-map-asphalt', '#85867e', '#0c0e10'),
    road: mat(scene, 'city-map-road', '#343a3d', '#0b0d0e'),
    curb: mat(scene, 'city-map-curb', '#59636e'),
    lane: mat(scene, 'city-map-lane', '#d7a952', '#6e4b17'),
    crosswalk: mat(scene, 'city-map-crosswalk', '#cbd2d8'),
    walk: mat(scene, 'city-map-walk', '#a5a497'),
    park: mat(scene, 'city-map-park', '#263c32'),
    water: mat(scene, 'city-map-water', '#0e5365', '#062b3c'),
    quay: mat(scene, 'city-map-quay', '#424b55'),
    wood: mat(scene, 'city-map-wood', '#4c3429'),
    metal: mat(scene, 'city-map-metal', '#121a22'),
    lamp: mat(scene, 'city-map-lamp', '#ffd56d', '#e79d24', 0.5),
    roof: mat(scene, 'city-map-roof', '#101720'),
    glass: mat(scene, 'city-map-glass', '#2d95a9', '#0a3442'),
    window: mat(scene, 'city-map-window', '#536b76', '#090f13', .3),
    windowWarm: mat(scene, 'city-map-window-warm', '#9a927c', '#17150f', .2),
    trunk: mat(scene, 'city-map-trunk', '#6e4b35'),
    leaf: mat(scene, 'city-map-leaf', '#4d8b62'),
    white: mat(scene, 'city-map-white', '#eef2f5'),
    pink: mat(scene, 'city-map-pink', '#aa9588'),
    cyan: mat(scene, 'city-map-cyan', '#21c4dc', '#0b728a'),
    gold: mat(scene, 'city-map-gold', '#ab9c7e'),
    green: mat(scene, 'city-map-green', '#798479'),
    blue: mat(scene, 'city-map-blue', '#74818a'),
    red: mat(scene, 'city-map-red', '#886e63'),
    navy: mat(scene, 'city-map-navy', '#4d5965'),
    silver: mat(scene, 'city-map-silver', '#9aa6af'),
    plaster: mat(scene,'city-map-plaster','#c6c0aa'),
    sandstone: mat(scene,'city-map-sandstone','#a7977e'),
    brick: mat(scene,'city-map-brick','#795b4e'),
    concrete: mat(scene,'city-map-concrete','#777d7b'),
    tile: mat(scene,'city-map-tile','#765047'),
    tire: mat(scene, 'city-map-tire', '#1e2630'),
  };

  createCityRegions(scene,root);
  const citySize = 480;
  const base = MeshBuilder.CreateGround('city-map-base', { width: citySize, height: citySize, subdivisions: 4 }, scene);
  base.position.y = 0.006;
  base.material = materials.asphalt;
  base.receiveShadows = true;
  base.parent = root;
  createCityBlockGround(scene,root,materials,MINIMAP_ROADS);
  yield 'city: urban base';

  const roads = [
    ['north', 'x', -130, 12], ['north-inner', 'x', -45, 10], ['south-inner', 'x', 45, 10], ['south', 'x', 130, 12],
    ['outer-north', 'x', -210, 10], ['outer-south', 'x', 210, 10],
    ['west', 'z', -130, 12], ['west-inner', 'z', -45, 10], ['east-inner', 'z', 45, 10], ['east', 'z', 130, 12],
    ['outer-west', 'z', -210, 10], ['outer-east', 'z', 210, 10],
    ['central-north', 'z', 0, 16], ['central-west', 'x', 0, 16],
  ];
  roads.forEach(([id, axis, coordinate, width]) => road(scene, root, materials, { id, axis, coordinate, width, length: 440 }));
  // Short service streets make the blocks feel occupied without turning the
  // whole map into another full-width road grid.
  [
    { id: 'service-finance-west', axis: 'z', coordinate: -80, centerZ: -90, length: 66, width: 6 },
    { id: 'service-finance-east', axis: 'z', coordinate: 80, centerZ: -90, length: 66, width: 6 },
    { id: 'service-residential', axis: 'x', coordinate: 102, centerX: 80, length: 68, width: 6 },
    { id: 'service-port', axis: 'x', coordinate: 165, centerX: 0, length: 320, width: 6 },
    { id: 'service-west-edge', axis: 'z', coordinate: -165, centerZ: 0, length: 320, width: 6 },
  ].forEach(spec => road(scene, root, materials, spec));
  yield 'city: road grid';
  let roadCount=0;
  for (const route of [...CITY_CONNECTOR_ROADS,...CITY_REGION_ROADS]) {
    const routeRoot = new TransformNode(route.id, scene);
    routeRoot.parent = root;
    routeRoot.position.set(route.x, 0, route.z);
    routeRoot.rotation.y = -Math.atan2(route.z2-route.z1, route.x2-route.x1);
    road(scene, routeRoot, materials, {id: route.id, axis:'x', coordinate:0, length:route.length, width:route.width,roadClass:/freeway|express|interchange|highway|south-ring/.test(route.route||'')?'freeway':'street'});
    if(++roadCount%12===0)yield 'city: regional roads';
  }

  [[0, -45, true], [0, 45, true], [-45, 0, false], [45, 0, false], [130, 45, false], [130, 130, true]].forEach(([x, z, horizontal]) => {
    crosswalk(scene, root, materials, x, z, horizontal);
  });
  for (const [x, z] of [[-28, -28], [28, -28], [-28, 28], [28, 28], [-122, -122], [122, -122], [-122, 122], [122, 122]]) {
    streetLight(scene, root, materials, shadows, x, z, x === 0 ? 0 : Math.PI / 2);
  }
  yield 'city: street furniture';
  yield* createCityStreetFurnitureSteps(scene,root,materials,colliders);

  // Civic center: a clean square around the existing spawn and social loop.
  // Keep both central carriageways exposed; the old full square hid all lane paint.
  for(const sx of [-1,1])for(const sz of [-1,1])
    box(scene, `city-civic-plaza-${sx}-${sz}`, { width: 14, height: 0.08, depth: 14 }, { x: sx*16, y: 0.095, z: sz*16 }, materials.walk, root);
  const plazaFountain = new TransformNode('city-civic-fountain', scene);
  plazaFountain.parent = root;
  const fountainPool = MeshBuilder.CreateCylinder('city-civic-fountain-pool', { diameter: 11, height: 0.55, tessellation: 40 }, scene);
  fountainPool.position.y = 0.32;
  fountainPool.material = materials.silver;
  fountainPool.parent = plazaFountain;
  const fountainWater = MeshBuilder.CreateCylinder('city-civic-fountain-water', { diameter: 9.9, height: 0.08, tessellation: 40 }, scene);
  fountainWater.position.y = 0.64;
  fountainWater.material = materials.water;
  fountainWater.parent = plazaFountain;
  const fountainCore = MeshBuilder.CreateCylinder('city-civic-fountain-core', { diameterTop: 0.35, diameterBottom: 1.8, height: 3.8, tessellation: 6 }, scene);
  fountainCore.position.y = 2.45;
  fountainCore.material = materials.cyan;
  fountainCore.parent = plazaFountain;
  addCollider(colliders, 'city-civic-fountain', 0, 0, 11.8, 11.8);
  yield 'city: civic core';

  for (const district of WORLD_LAYOUT.cityDistricts) {
    if (district.id !== 'civic') districtSign(scene, root, district, materials);
  }

  const buildings = CITY_LANDMARK_BUILDINGS;
  for(let i=0;i<buildings.length;i++){
    building(scene, root, materials, shadows, colliders, buildings[i]);
    if(i%4===3)yield 'city: landmarks';
  }
  neonStrip(scene, root, materials, 'nightclub-front', -185, 5.4, -35.2, 7.5, 'pink');
  neonStrip(scene, root, materials, 'nightclub-side', -197.2, 3.2, -25, 4.5, 'cyan', Math.PI / 2);
  neonStrip(scene, root, materials, 'pawnshop-front', -65, 4.5, 13.6, 5.8, 'gold');
  neonStrip(scene, root, materials, 'industrial-garage-front', -148, 4.2, 215.7, 7, 'pink');
  yield 'city: district buildings';
  createCitySampleDistrict(scene,root,materials);
  yield 'city: authored sample street';

  park(scene, root, materials, shadows, -112, 76, 28, 28, 'city-west-park');
  park(scene, root, materials, shadows, 44, 78, 28, 28, 'city-east-park');
  park(scene, root, materials, shadows, -190, 20, 28, 28, 'city-old-town-square');
  roundabout(scene, root, materials, colliders, -130, 45, 'west-gateway');
  waterfront(scene, root, materials, shadows, colliders);
  runway(scene, root, materials, 150, 218, 140, 18, 'vibe-city-east');
  bridge(scene, root, materials, shadows, {
    id: 'waterfront', axis: 'x', x: 169, z: 45, length: 58, width: 10, height: 0.08,
    y: 0.04, supports: [], railHeight: 0.66,
  });
  bridge(scene, root, materials, shadows, {
    id:'waterfront-central',axis:'x',x:169,z:0,length:58,width:16,height:.08,
    y:.04,supports:[],railHeight:.66,
  });
  bridge(scene, root, materials, shadows, {
    id: 'north-flyover', axis: 'x', x: 0, z: -130, length: 84, width: 9, height: 0.5,
    y: 3.1, supports: [ -30, 30 ], railHeight: 0.82,
  });
  yield 'city: parks and waterfront';

  yield* fillCityBlocksSteps(scene, root, materials, colliders);
  yield 'city: occupied neighborhood blocks';

  const parkedCars = [
    [-20, -13, 0, 'red'], [20, 13, Math.PI, 'blue'], [-51, -68, Math.PI / 2, 'gold'], [51, -68, -Math.PI / 2, 'pink'],
    [-18, 68, 0, 'navy'], [18, 68, Math.PI, 'green'], [111, 43, Math.PI / 2, 'blue'], [111, 112, -Math.PI / 2, 'red'],
  ];
  parkedCars.forEach(([x, z, rotation, paint], index) => parkedCar(scene, root, materials, shadows, x, z, rotation, paint, index));
  cityBoundary(colliders);
  for(const m of CITY_REGION_MOUNTAINS)addCollider(colliders,`county-mountain-${m.x}-${m.z}`,m.x,m.z,m.radius*1.45,m.radius*1.45);

  const ambientLife=createCityAmbientLife(scene,root,materials);
  const observer = scene.onBeforeRenderObservable.add(() => {
    fountainCore.rotation.y += scene.getEngine().getDeltaTime() / 1000 * 0.35;
  });
  const cityMasterplan = {
    root,
    fountain: plazaFountain,
    districts: WORLD_LAYOUT.cityDistricts,
    dispose() { scene.onBeforeRenderObservable.remove(observer); root.dispose(false, true); },
  };
  return {
    root,
    cityMasterplan,
    cityDistrict: cityMasterplan,
    collisionBoxes: colliders,
    fountain: plazaFountain,
    romanticLake: null,
    lakeDistrict: null,
    playTogetherPlaza: null,
    townHall: null,
    lighthouse: null,
    steamboatPort: null,
    townCitizens: [],
    update(now,dt,player) {ambientLife.update(Date.now(),player);},
  };
}

export function createVibeCityMap(scene, shadows) {
  const steps = createVibeCityMapSteps(scene, shadows);
  let result;
  do { result = steps.next(); } while (!result.done);
  return result.value;
}
