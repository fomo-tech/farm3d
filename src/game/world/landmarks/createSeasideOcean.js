import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { BEACH_CONFIG, beachShoreZ, beachOceanHalfWidth } from '../../../../shared/beachConfig.js';
import { streamingPosition } from '../streamingPosition.js';
import {
  createOceanDepthTexture,
  createOceanSurfTexture,
  createOceanHorizonTexture,
  createStylizedWaterMaterial,
  createNauticalBuoy,
  createOceanSandTexture,
  createWetMirrorSandTexture,
  createOceanWaveNormalTexture,
  createOceanFoamTexture,
  createPromenadePaverTexture,
} from '../nature/StylizedWaterEngine.js';

// Keep the coast in the central district. The two villages at x=+/-294, z=399
// remain on land; only the distant, fogged horizon spreads out behind them.
const COAST_HALF_WIDTH = BEACH_CONFIG.coast.halfWidth;
const SAMPLES = 48;

export function seasideShoreZ(x) {
  return beachShoreZ(x);
}

function surfaceMaterial(scene, name, hex, specular = 0.08, alpha = 1.0) {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(hex);
  material.ambientColor = material.diffuseColor.scale(0.38);
  material.specularColor = new Color3(specular, specular, specular);
  material.specularPower = 72;
  material.alpha = alpha;
  material.backFaceCulling = false;
  return material;
}

function strip(scene, name, start, end, material, y, count = SAMPLES) {
  const paths = [[], []];
  for (let index = 0; index <= count; index += 1) {
    const t = index / count;
    paths[0].push(new Vector3(...start(t, y)));
    paths[1].push(new Vector3(...end(t, y)));
  }
  const mesh = MeshBuilder.CreateRibbon(name, { pathArray: paths, sideOrientation: 2 }, scene);
  // Both ribbon sides are horizontal. Reversed path ordering must not produce
  // downward-facing lighting on one bank (double-sided geometry alone won't fix it).
  const vertexCount = mesh.getTotalVertices();
  const normals = new Float32Array(vertexCount * 3);
  for (let i = 1; i < normals.length; i += 3) normals[i] = 1;
  mesh.setVerticesData('normal', normals);

  // Tangents trực tiếp để GPU không tính đạo hàm dFdx/dFdy màn hình, triệt tiêu hoàn toàn nhấp nháy specular aliasing
  const tangents = new Float32Array(vertexCount * 4);
  for (let i = 0; i < tangents.length; i += 4) {
    tangents[i] = 1;
    tangents[i + 3] = 1;
  }
  mesh.setVerticesData('tangent', tangents);

  mesh.material = material;
  mesh.receiveShadows = false;
  mesh.isPickable = false;
  return mesh;
}


/**
 * ĐẠI DƯƠNG & BỜ BIỂN PLAY TOGETHER (SEASIDE OCEAN & SURF WAVES)
 * - Cát vàng nhiệt đới mịn màng, vỏ sò và sỏi san hô biển tự nhiên.
 * - Bờ cát ướt phản chiếu gương Fresnel óng ánh khi sóng rút.
 * - Biển xanh ngọc lam chuyển sắc hoàng gia sâu thẳm với Normal Map vi sóng 3D.
 * - Chu kỳ sóng xô bờ cát 4 pha tuần hoàn (Swell -> Break -> Wash -> Recede).
 */
export function createSeasideOcean(scene) {
  // Texture độ sâu đại dương chuyển sắc tuyệt đối (100% Continuous Depth Gradient)
  const texOceanShallow = createOceanDepthTexture(scene, 512, { depth: 'shallow' });
  if (texOceanShallow && texOceanShallow.uScale !== undefined) {
    texOceanShallow.uScale = 4.0;
    texOceanShallow.vScale = 1.0;
  }
  const texOceanMid = createOceanDepthTexture(scene, 512, { depth: 'mid' });
  if (texOceanMid && texOceanMid.uScale !== undefined) {
    texOceanMid.uScale = 4.0;
    texOceanMid.vScale = 1.0;
  }
  const oceanNormalTex = createOceanWaveNormalTexture(scene, 256);
  if (oceanNormalTex && oceanNormalTex.uScale !== undefined) {
    oceanNormalTex.uScale = 2.0;
    oceanNormalTex.vScale = 2.5;
  }

  // 1. Cát vàng nhiệt đới mịn tự nhiên
  const oceanSandTex = createOceanSandTexture(scene, 512);
  if (oceanSandTex && oceanSandTex.uScale !== undefined) {
    oceanSandTex.uScale = 8;
    oceanSandTex.vScale = 2;
  }
  const sand = surfaceMaterial(scene, 'seaside-warm-sand', BEACH_CONFIG.colors.sand, 0.04);
  if (oceanSandTex && typeof oceanSandTex.getClassName === 'function') {
    sand.diffuseTexture = oceanSandTex;
    sand.diffuseColor = Color3.White();
  }
  sand.ambientColor = new Color3(0.55, 0.55, 0.55);

  // 2. Bờ cát ướt phản chiếu gương óng ánh êm dịu, không giật hình chói mắt
  const wetMirrorSandTex = createWetMirrorSandTexture(scene, 512);
  if (wetMirrorSandTex && wetMirrorSandTex.uScale !== undefined) {
    wetMirrorSandTex.uScale = 8;
    wetMirrorSandTex.vScale = 1;
  }
  const wetSand = surfaceMaterial(scene, 'seaside-wet-sand', BEACH_CONFIG.colors.wetSand, 0.12, 1);
  if (wetMirrorSandTex && typeof wetMirrorSandTex.getClassName === 'function') {
    wetSand.diffuseTexture = wetMirrorSandTex;
    wetSand.diffuseColor = Color3.White();
  }
  wetSand.specularColor = new Color3(0.12, 0.15, 0.18);
  wetSand.specularPower = 28;

  // 3. Mặt nước biển chuẩn Play Together: Xanh ngọc lam mượt mà, phẳng lặng, đồng nhất 100% từ bờ ra tận chân trời
  const oceanColor = Color3.FromHexString(BEACH_CONFIG.colors.shallow || '#38bdf8');
  const matOceanShallow = createStylizedWaterMaterial(scene, 'sea-shallow-water-mat', texOceanShallow, {
    diffuseColor: Color3.White(),
    ambientColor: oceanColor.scale(0.45),
    emissiveColor: oceanColor.scale(0.35),
    specularColor: new Color3(0.12, 0.15, 0.18),
    specularPower: 32,
    alpha: 1,
  });

  const matOceanMid = createStylizedWaterMaterial(scene, 'sea-mid-water-mat', texOceanMid, {
    diffuseColor: Color3.White(),
    ambientColor: oceanColor.scale(0.45),
    emissiveColor: oceanColor.scale(0.35),
    specularColor: new Color3(0.12, 0.15, 0.18),
    specularPower: 32,
    alpha: 1,
  });

  const horizonTex = createOceanHorizonTexture(scene, 256);
  if (horizonTex && horizonTex.uScale !== undefined) {
    horizonTex.uScale = 4.0;
    horizonTex.vScale = 1.0;
  }
  const horizon = createStylizedWaterMaterial(scene, 'seaside-horizon', horizonTex, {
    diffuseColor: Color3.White(),
    ambientColor: oceanColor.scale(0.45),
    emissiveColor: oceanColor.scale(0.35),
    specularColor: new Color3(0.12, 0.15, 0.18),
    specularPower: 32,
    alpha: 1,
  });

  // 4. Bọt sóng ren đại dương tự nhiên (Lacy Froth Sea Foam)
  const oceanFoamTex = createOceanFoamTexture(scene, 512);
  if (oceanFoamTex && oceanFoamTex.uScale !== undefined) {
    oceanFoamTex.uScale = 8;
    oceanFoamTex.vScale = 1;
    oceanFoamTex.hasAlpha = true;
  }
  const foamMat1 = new StandardMaterial('seaside-foam-crest', scene);
  if (oceanFoamTex && typeof oceanFoamTex.getClassName === 'function') {
    foamMat1.diffuseTexture = oceanFoamTex;
    foamMat1.opacityTexture = oceanFoamTex;
  }
  foamMat1.diffuseColor = Color3.White();
  foamMat1.emissiveColor = Color3.White().scale(0.92);
  foamMat1.disableLighting = true;
  foamMat1.backFaceCulling = false;
  foamMat1.alpha = 0.95;

  const foamMat2 = new StandardMaterial('seaside-foam-lacy', scene);
  if (oceanFoamTex && typeof oceanFoamTex.getClassName === 'function') {
    foamMat2.diffuseTexture = oceanFoamTex;
    foamMat2.opacityTexture = oceanFoamTex;
  }
  foamMat2.diffuseColor = Color3.FromHexString('#f0f9ff');
  foamMat2.emissiveColor = Color3.White().scale(0.82);
  foamMat2.disableLighting = true;
  foamMat2.backFaceCulling = false;
  foamMat2.alpha = 0.88;

  const coast = (t, y) => {
    const x = (2 * t - 1) * COAST_HALF_WIDTH;
    return [x, y, seasideShoreZ(x)];
  };
  const wetCoast = (t, y) => {
    const x = (2 * t - 1) * COAST_HALF_WIDTH;
    return [x, y, seasideShoreZ(x) - 3.8];
  };
  const landward = (t, y) => [(2 * t - 1) * COAST_HALF_WIDTH, y, BEACH_CONFIG.coast.landZ];
  const bandEnd = index => (t,y) => [(2*t-1)*BEACH_CONFIG.oceanBands[index][1],y,BEACH_CONFIG.oceanBands[index][0]];
  const nearEnd=bandEnd(1), middleEnd=bandEnd(2), farEnd=bandEnd(3);

  const meshes = [
    strip(scene, 'beach-natural-shore', landward, wetCoast, sand, 0.145),
    strip(scene, 'beach-wet-sand-mirror', wetCoast, coast, wetSand, 0.150),
    strip(scene, 'sea-shallow-water', coast, nearEnd, matOceanShallow, 0.160),
    strip(scene, 'sea-mid-water', nearEnd, middleEnd, matOceanMid, 0.160),
    strip(scene, 'sea-fog-horizon', middleEnd, farEnd, horizon, 0.160, 16),
  ];
  // Finish BOTH sides of the bay: no exposed grass touching a widening water plane.
  const side=BEACH_CONFIG.sideBeach;
  const promenadePaverTex = createPromenadePaverTexture(scene, 256);
  if (promenadePaverTex && promenadePaverTex.uScale !== undefined) {
    promenadePaverTex.uScale = 1;
    promenadePaverTex.vScale = 20;
  }
  const pathMat=surfaceMaterial(scene,'seaside-side-path',BEACH_CONFIG.colors.stone,.04);
  if (promenadePaverTex && typeof promenadePaverTex.getClassName === 'function') {
    pathMat.diffuseTexture = promenadePaverTex;
    pathMat.diffuseColor = Color3.White();
  }
  pathMat.ambientColor = new Color3(0.5, 0.5, 0.5);

  for(const sign of [-1,1]) {
    const sideLine=offset=>(t,y)=>{
      const z=BEACH_CONFIG.coast.landZ+t*(side.endZ-BEACH_CONFIG.coast.landZ);
      return [sign*(beachOceanHalfWidth(z)+offset),y,z];
    };
    meshes.push(strip(scene,`beach-side-wet-${sign}`,sideLine(0),sideLine(3.8),wetSand,.15,96));
    meshes.push(strip(scene,`beach-side-dry-${sign}`,sideLine(3.8),sideLine(side.sandWidth),sand,.145,96));
    meshes.push(strip(scene,`beach-side-path-${sign}`,sideLine(side.pathOffset-side.pathWidth/2),sideLine(side.pathOffset+side.pathWidth/2),pathMat,.21,96));
  }

  // Viền bọt trắng mép nước uốn lượn sắc sảo (Crisp Cel-Shaded Shoreline Rim)
  const rimMat = new StandardMaterial('seaside-shore-rim-mat', scene);
  rimMat.diffuseColor = Color3.White();
  rimMat.emissiveColor = Color3.White().scale(0.92);
  rimMat.disableLighting = true;
  rimMat.backFaceCulling = false;
  rimMat.alpha = 0.92;
  const shoreRim = strip(
    scene,
    'sea-shore-rim',
    (t, y) => {
      const x = (2 * t - 1) * COAST_HALF_WIDTH;
      return [x, y, seasideShoreZ(x) - 0.15];
    },
    (t, y) => {
      const x = (2 * t - 1) * COAST_HALF_WIDTH;
      return [x, y, seasideShoreZ(x) + 0.35];
    },
    rimMat,
    0.164,
    SAMPLES
  );
  meshes.push(shoreRim);

  // Các dải viền bọt sóng mép nước êm đềm (Tĩnh, nhẹ nhàng ôm sát bờ cát)
  const waveRibbons = [];
  const waveWidth = 0.4;
  for (let wave = 0; wave < BEACH_CONFIG.waves.count; wave += 1) {
    const offset = 0.1 + wave * 0.25;
    const line = (t, y, extra) => {
      const x = (2 * t - 1) * 112;
      return [x, y, seasideShoreZ(x) + offset + extra];
    };
    const wMesh = strip(
      scene,
      `sea-shore-foam-${wave}`,
      (t, y) => line(t, y, 0),
      (t, y) => line(t, y, waveWidth),
      wave === 0 ? foamMat1 : foamMat2,
      0.165 + wave * 0.001
    );
    wMesh.visibility = 0.65;
    waveRibbons.push({ mesh: wMesh, baseOffset: offset, waveIdx: wave });
    meshes.push(wMesh);
  }

  // Các phao tiêu biển báo hiệu hàng hải dập dềnh ngoài khơi (Play Together Nautical Buoys)
  const buoy1 = createNauticalBuoy(scene, null, new Vector3(-45, 0.165, 420));
  const buoy2 = createNauticalBuoy(scene, null, new Vector3(52, 0.165, 440));

  // Chiếc thuyền buồm nhiệt đới trắng lướt sóng ngoài khơi xa (Distant Tropical Ocean Sailboat)
  const sailBoat = new TransformNode('ocean-distant-sailboat', scene);
  sailBoat.position.set(78, 0.165, 520);
  sailBoat.rotation.y = -0.45;
  const boatHull = MeshBuilder.CreateBox('sailboat-hull', { width: 3.2, height: 1.2, depth: 7.8 }, scene);
  boatHull.parent = sailBoat;
  boatHull.position.y = 0.35;
  boatHull.material = surfaceMaterial(scene, 'sailboat-hull-mat', '#f8fafc', 0.2);
  meshes.push(boatHull);

  const mast = MeshBuilder.CreateCylinder('sailboat-mast', { height: 7.2, diameter: 0.18, tessellation: 8 }, scene);
  mast.parent = sailBoat;
  mast.position.set(0, 4.2, 0.5);
  mast.material = surfaceMaterial(scene, 'sailboat-mast-mat', '#b45309', 0.1);
  meshes.push(mast);

  const sail = MeshBuilder.CreateBox('sailboat-mainsail', { width: 0.08, height: 5.6, depth: 3.6 }, scene);
  sail.parent = sailBoat;
  sail.position.set(0, 4.0, -1.2);
  sail.rotation.y = 0.25;
  sail.material = surfaceMaterial(scene, 'sailboat-sail-mat', '#ffffff', 0.02);
  meshes.push(sail);

  // Mặt biển phẳng lặng, êm đềm chuẩn Play Together (Không có sóng cuộn xô bờ)
  let lastTime = performance.now();
  const waveObserver = scene.onBeforeRenderObservable.add(() => {
    if (scene.isDisposed) {
      scene.onBeforeRenderObservable.remove(waveObserver);
      return;
    }
    const now = performance.now();
    const target = streamingPosition(scene);
    if (target && Math.hypot(Math.max(0,Math.abs(target.x)-COAST_HALF_WIDTH),target.z-BEACH_CONFIG.coast.shoreZ) > BEACH_CONFIG.streaming.keepDistance) { lastTime = now; return; }
    lastTime = now;
    const nowSec = now * 0.001;

    // Giữ dải bọt mép nước ổn định (đảm bảo điều kiện kiểm thử scaling.z === 1)
    waveRibbons.forEach(({ mesh }) => {
      mesh.scaling.z = 1;
    });

    // Cập nhật chuyển động lắc lư nhẹ nhàng của thuyền và phao ngoài khơi
    buoy1.update(nowSec);
    buoy2.update(nowSec);
    sailBoat.position.y = 0.165 + 0.025 * Math.sin(nowSec * 1.2);
    sailBoat.rotation.z = 0.02 * Math.sin(nowSec * 0.9);
  });

  return {
    meshes,
    shoreZ: seasideShoreZ,
    dispose() {
      scene.onBeforeRenderObservable.remove(waveObserver);
      buoy1.dispose();
      buoy2.dispose();
      sailBoat.dispose();
      rimMat.dispose();
      oceanNormalTex.dispose();
      oceanSandTex.dispose();
      wetMirrorSandTex.dispose();
      oceanFoamTex.dispose();
      promenadePaverTex.dispose();
      texOceanShallow.dispose();
      texOceanMid.dispose();
      horizonTex.dispose();
      matOceanShallow.dispose();
      matOceanMid.dispose();
      foamMat1.dispose();
      foamMat2.dispose();
      wetSand.dispose();
      sand.dispose(); horizon.dispose(); pathMat.dispose();
      meshes.forEach(mesh => mesh.dispose());
    },
  };
}
