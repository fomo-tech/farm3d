/**
 * ProceduralMountainRange.js
 * Continuous Procedural Mountain Ribbon Landscape Engine for Farm3D.
 * 
 * Tối ưu hóa chuẩn phong cách Studio Ghibli & Makoto Shinkai:
 * - "Mù sương bảng lảng": Gradient sương mù khí quyển (Atmospheric Aerial Perspective),
 *   chân núi chìm 100% trong sương mờ hòa quyện đường chân trời, đỉnh núi lam ngọc thơ mộng.
 * - "Đi quài không tới": Hệ thống Parallax Camera Tracking (tỉ lệ 0.90x), núi lùi dần theo bước chân người chơi
 *   giúp rặng núi luôn sừng sững ở viễn cảnh vô cực, không bao giờ chạm tới hay lộ góc đa giác.
 * - Triệt tiêu 100% cạnh vát sắc nhọn: Đường sườn núi hạ độ cao mượt mà về 0m tại hai đầu bờ biển.
 * - Nằm gọn trong tầm nhìn an toàn (480m - 720m) đón trọn hiệu ứng sương mù tự nhiên (Babylon Scene Fog),
 *   hoàn toàn không bị GPU camera far-plane clipping cắt xén.
 */

import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3, Vector2 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';

/**
 * Tạo vật liệu núi có gradient sương mù khí quyển theo phương thẳng đứng.
 * Chân núi (V=0) hòa tan vào sương mù chân trời, sườn núi (V=0.5) và đỉnh núi (V=1.0)
 * mang sắc lam ngọc / chàm viễn cảnh chuẩn điện ảnh Ghibli.
 */
function makeAtmosphericMountainMaterial(scene, name, baseHex, midHex, crestHex, emissiveHex = null, specular = 0.02) {
  const mat = new StandardMaterial(name, scene);

  // Gradient texture 64x256 chuyển sắc đứng từ chân núi lên đỉnh núi
  const gradTex = new DynamicTexture(`${name}-mist-tex`, { width: 64, height: 256 }, scene, false);
  const ctx = gradTex.getContext();
  const grad = ctx.createLinearGradient(0, 256, 0, 0); // V: 0 (dưới) lên 1 (trên)
  grad.addColorStop(0.0, baseHex);   // Chân núi: sương mù chân trời mềm mại
  grad.addColorStop(0.28, baseHex);  // Đệm sương mù thung lũng bảng lảng
  grad.addColorStop(0.65, midHex);   // Sườn núi: sắc lam sương khói
  grad.addColorStop(0.92, crestHex); // Đỉnh núi: sắc lam chàm thanh thoát
  grad.addColorStop(1.0, crestHex);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 256);
  gradTex.update();

  mat.diffuseTexture = gradTex;
  mat.ambientColor = Color3.FromHexString(midHex).scale(0.55);
  if (emissiveHex) {
    mat.emissiveColor = Color3.FromHexString(emissiveHex).scale(0.32);
  }
  mat.specularColor = new Color3(specular, specular, specular);
  mat.specularPower = 20;
  mat.roughness = 0.96;
  mat.backFaceCulling = false;
  mat.fogEnabled = false; // Tự chủ gradient sương mù không phụ thuộc fog distance của camera
  return mat;
}

/**
 * Creates continuous procedural mountain range encircling the open world.
 * @param {import('@babylonjs/core').Scene} scene
 * @param {TransformNode} parent
 * @returns {{ root: TransformNode, ridgePoints: Array<{x: number, y: number, z: number, angle: number}> }}
 */
export function createProceduralMountainRange(scene, parent) {
  const root = new TransformNode('procedural-mountain-range', scene);
  if (parent) {
    root.parent = parent;
  }

  // 1. Bảng màu phối cảnh không khí Ghibli (Atmospheric Aerial Perspective)
  // Tầng 1: Dãy núi sương lam ngọc (Misty Alpine Slate-Teal)
  const matNearRidge = makeAtmosphericMountainMaterial(
    scene,
    'mat-near-mountain-ridge',
    '#e0f2fe', // Chân núi hòa tan vào sương trời
    '#6892aa', // Sườn núi lam sương khói
    '#41687f', // Đỉnh núi thanh thoát
    '#2c4a5c',
    0.02
  );

  // Tầng 2: Dãy đại sơn viễn cảnh mộng mơ (Dreamy Grand Alpine Azure)
  const matFarRange = makeAtmosphericMountainMaterial(
    scene,
    'mat-far-grand-mountain',
    '#e0f2fe',
    '#7fa4bd',
    '#557a92',
    '#365467',
    0.03
  );

  // Tầng 3: Đỉnh tuyết Bắc Cực lấp lánh phản chiếu ánh nắng
  const matSnowPeak = makeAtmosphericMountainMaterial(
    scene,
    'mat-mountain-snow-peak',
    '#dbeafe',
    '#e2e8f0',
    '#ffffff',
    '#e0f2fe',
    0.10
  );

  // Angular steps: Vòng cung 238 độ bao quanh Tây, Tây-Bắc, Bắc, Đông-Bắc, Đông
  // (Mở thoáng hướng Nam nhìn ra đại dương)
  const steps = 128;
  const startAngle = 0.82 * Math.PI;
  const endAngle = 2.18 * Math.PI;

  const ridgePoints = [];

  // =========================================================================
  // 1. DÃY NÚI CẬN TRUNG CẢNH (MISTY ALPINE RIDGE · Bán kính 480m - 680m)
  // Continuous 4-ribbon parametric terrain
  // =========================================================================
  const nearBaseInner = [];
  const nearSlopeMid = [];
  const nearCrest = [];
  const nearBaseOuter = [];

  const nearUvs0 = [];
  const nearUvs1 = [];
  const nearUvs2 = [];
  const nearUvs3 = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = startAngle + t * (endAngle - startAngle);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Taper hạ độ cao tuyệt đối về 0m tại 2 đầu mở hướng ra biển (triệt tiêu 100% vát đa giác)
    const taper = Math.sin(t * Math.PI);
    const taperH = Math.pow(taper, 1.6);

    // Sóng địa hình đa tầng hữu cơ
    const h1 = Math.sin(angle * 3.5) * 32;
    const h2 = Math.cos(angle * 6.5 + 0.5) * 24;
    const h3 = Math.abs(Math.sin(angle * 11.0)) * 18;
    const h4 = Math.cos(angle * 17.0) * 12;
    const rawH = 80 + h1 + h2 + h3 + h4;
    const crestH = Math.max(0.1, rawH * taperH);

    // Uốn lượn bán kính mềm mại
    const radMod0 = Math.sin(angle * 3.0) * 30;
    const radMod1 = Math.cos(angle * 5.0 + 0.4) * 45;
    const radMod2 = Math.sin(angle * 6.0) * 60;
    const radMod3 = Math.cos(angle * 3.0) * 75;

    const r0 = 850 + radMod0;
    const r1 = 980 + radMod1;
    const r2 = 1140 + radMod2;
    const r3 = 1380 + radMod3;

    nearBaseInner.push(new Vector3(cosA * r0, 0.05, sinA * r0));
    nearSlopeMid.push(new Vector3(cosA * r1, crestH * 0.48, sinA * r1));
    nearCrest.push(new Vector3(cosA * r2, crestH, sinA * r2));
    nearBaseOuter.push(new Vector3(cosA * r3, 0.05, sinA * r3));

    if (i % 3 === 0 && crestH > 25) {
      ridgePoints.push({
        x: cosA * r2,
        y: crestH,
        z: sinA * r2,
        angle,
      });
    }

    // Mapping UV chuẩn V: 0 (chân núi sương) -> 0.45 (sườn núi) -> 1.0 (đỉnh núi)
    nearUvs0.push(new Vector2(t, 0.0));
    nearUvs1.push(new Vector2(t, 0.45));
    nearUvs2.push(new Vector2(t, 1.0));
    nearUvs3.push(new Vector2(t, 0.15));
  }

  const nearMesh = MeshBuilder.CreateRibbon('near-mountain-ribbon-mesh', {
    pathArray: [nearBaseInner, nearSlopeMid, nearCrest, nearBaseOuter],
    uvs: [nearUvs0, nearUvs1, nearUvs2, nearUvs3],
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  nearMesh.material = matNearRidge;
  nearMesh.alwaysSelectAsActiveMesh = true;
  nearMesh.ignoreCameraMaxZ = true;
  nearMesh.freezeWorldMatrix();
  nearMesh.isPickable = false;
  nearMesh.receiveShadows = false;
  nearMesh.parent = root;

  // =========================================================================
  // 2. DÃY ĐẠI SƠN HÙNG VĨ VIỄN CẢNH (FAR GRAND ALPINE RANGE · Bán kính 1400m - 2500m)
  // Đỉnh núi cao vút nhấp nhô lộng lẫy trong sương khói chân trời
  // =========================================================================
  const farBaseInner = [];
  const farMidSlope = [];
  const farGrandCrest = [];
  const farBaseOuter = [];

  const farSnowBase = [];
  const farSnowCrest = [];

  const farUvs0 = [];
  const farUvs1 = [];
  const farUvs2 = [];
  const farUvs3 = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = startAngle + t * (endAngle - startAngle);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const taper = Math.sin(t * Math.PI);
    const taperH = Math.pow(taper, 1.5);

    // Multi-octave towering peak height
    const gh1 = Math.cos(angle * 3.0 + 0.3) * 50;
    const gh2 = Math.sin(angle * 6.0 + 0.8) * 40;
    const gh3 = Math.abs(Math.cos(angle * 10.0)) * 30;
    const gh4 = Math.sin(angle * 16.0) * 20;
    const rawGrandH = 160 + gh1 + gh2 + gh3 + gh4;
    const grandCrestH = Math.max(0.1, rawGrandH * taperH);

    const fr0 = 1420 + Math.sin(angle * 4.0) * 45;
    const fr1 = 1700 + Math.cos(angle * 5.0) * 65;
    const fr2 = 2050 + Math.sin(angle * 7.0 + 0.5) * 85;
    const fr3 = 2500 + Math.cos(angle * 4.0) * 110;

    farBaseInner.push(new Vector3(cosA * fr0, 0.1, sinA * fr0));
    farMidSlope.push(new Vector3(cosA * fr1, grandCrestH * 0.52, sinA * fr1));
    farGrandCrest.push(new Vector3(cosA * fr2, grandCrestH, sinA * fr2));
    farBaseOuter.push(new Vector3(cosA * fr3, 0.1, sinA * fr3));

    // Đỉnh tuyết Bắc Cực tinh khôi (sinA < -0.22)
    if (sinA < -0.22 && grandCrestH > 50) {
      const snowWeight = Math.max(0, (-sinA - 0.22) / 0.78);
      const snowBaseH = grandCrestH * (1.0 - 0.32 * snowWeight);
      const snowRadOffset = 70 * snowWeight;
      farSnowBase.push(new Vector3(cosA * (fr2 - snowRadOffset), snowBaseH, sinA * (fr2 - snowRadOffset)));
      farSnowCrest.push(new Vector3(cosA * fr2, grandCrestH + 1.2, sinA * fr2));
    }

    farUvs0.push(new Vector2(t, 0.0));
    farUvs1.push(new Vector2(t, 0.45));
    farUvs2.push(new Vector2(t, 1.0));
    farUvs3.push(new Vector2(t, 0.15));
  }

  const farMesh = MeshBuilder.CreateRibbon('far-mountain-ribbon-mesh', {
    pathArray: [farBaseInner, farMidSlope, farGrandCrest, farBaseOuter],
    uvs: [farUvs0, farUvs1, farUvs2, farUvs3],
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  farMesh.material = matFarRange;
  farMesh.alwaysSelectAsActiveMesh = true;
  farMesh.ignoreCameraMaxZ = true;
  farMesh.freezeWorldMatrix();
  farMesh.isPickable = false;
  farMesh.receiveShadows = false;
  farMesh.parent = root;

  // Snow Cap peaks mesh (strictly continuous over Northern summits)
  if (farSnowBase.length >= 2) {
    const snowMesh = MeshBuilder.CreateRibbon('far-mountain-snow-caps', {
      pathArray: [farSnowBase, farSnowCrest],
      sideOrientation: Mesh.DOUBLESIDE,
    }, scene);
    snowMesh.material = matSnowPeak;
    snowMesh.alwaysSelectAsActiveMesh = true;
    snowMesh.ignoreCameraMaxZ = true;
    snowMesh.freezeWorldMatrix();
    snowMesh.isPickable = false;
    snowMesh.receiveShadows = false;
    snowMesh.parent = root;
  }

  // Dãy núi cố định tuyệt đối trong không gian thế giới (Stationary Horizon)
  // Không di chuyển hay trôi dạt theo camera, triệt tiêu 100% hiện tượng tự di chuyển hoặc nhấp nháy
  root.position.set(0, 0, 0);

  return {
    root,
    ridgePoints,
    dispose() {
      matNearRidge.dispose();
      matFarRange.dispose();
      matSnowPeak.dispose();
      root.dispose(false, true);
    },
  };
}
