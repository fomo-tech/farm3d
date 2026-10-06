/**
 * ProceduralMountainRange.js
 * Continuous Procedural Mountain Ribbon Landscape Engine for Farm3D.
 * 
 * Phong cách Studio Ghibli & Makoto Shinkai:
 * - "Mờ sương bảng lảng": Gradient sương mù khí quyển 2 chiều (2D Atmospheric Aerial Perspective),
 *   chân núi hòa tan 100% vào sương mờ đường chân trời (alpha = 0), đỉnh núi lam ngọc viễn cảnh mộng mơ.
 * - "Đi quài không đến": Hệ thống Parallax Horizon Tracking (tỉ lệ 0.94x), dãy núi lùi dần theo bước chân
 *   người chơi giúp rặng núi luôn sừng sững ở chân trời vô tận, không bao giờ chạm tới hay lộ đa giác gần.
 * - Triệt tiêu 100% cạnh vát sắc nhọn: Hai đầu cung rặng núi chìm sâu -40m dưới đại dương và thu hẹp bề rộng về 0,
 *   kết hợp alpha fade ngang mượt mà.
 * - Biển mây thung lũng (Horizon Mist Belt): Dải sương mây bồng bềnh che phủ chân núi, tạo cảm giác
 *   núi non trùng điệp mọc lên từ biển sương huyền ảo.
 */

import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3, Vector2 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';

/**
 * Tạo vật liệu núi có gradient sương mù khí quyển 2 chiều:
 * - Theo phương đứng (V): Chân núi (V=0) hoàn toàn trong suốt (alpha=0) tan vào sương mù chân trời;
 *   sườn núi mờ sương xanh lơ pastel; đỉnh núi sắc lam chàm thanh thoát.
 * - Theo phương ngang (U): Hai đầu mép núi (U=0 và U=1) fade dần về alpha=0 để triệt tiêu mọi cạnh vát.
 */
function makeAtmosphericMountainMaterial(scene, name, stops) {
  const mat = new StandardMaterial(name, scene);

  const width = 256;
  const height = 512;
  const gradTex = new DynamicTexture(`${name}-mist-tex`, { width, height }, scene, false);
  gradTex.hasAlpha = true;
  const ctx = gradTex.getContext();

  // 1. Vẽ vertical gradient (từ chân núi lên đỉnh núi)
  // Với Babylon.js invertY=true (mặc định): canvas y=height là UV v=0 (chân), canvas y=0 là UV v=1 (đỉnh)
  ctx.clearRect(0, 0, width, height);
  const vGrad = ctx.createLinearGradient(0, height, 0, 0);
  for (const s of stops) {
    vGrad.addColorStop(s.offset, s.color);
  }
  ctx.fillStyle = vGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Nhân thêm horizontal alpha fade tại hai đầu mép núi (U=0 và U=1)
  // Triệt tiêu 100% cạnh vát sắc nhọn ở hai đầu sườn núi
  ctx.globalCompositeOperation = 'destination-in';
  const hGrad = ctx.createLinearGradient(0, 0, width, 0);
  hGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
  hGrad.addColorStop(0.12, 'rgba(0, 0, 0, 1)');
  hGrad.addColorStop(0.88, 'rgba(0, 0, 0, 1)');
  hGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, 0, width, height);

  // Khôi phục composite operation
  ctx.globalCompositeOperation = 'source-over';
  gradTex.update();

  mat.diffuseTexture = gradTex;
  mat.useAlphaFromDiffuseTexture = true;
  mat.emissiveTexture = gradTex;
  mat.disableLighting = true; // Aerial perspective tự phát sáng phối cảnh khí quyển
  mat.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
  mat.alpha = 1.0;
  mat.backFaceCulling = false;
  mat.specularColor = new Color3(0, 0, 0);
  mat.fogEnabled = false; // Tự chủ gradient sương mù khí quyển, không phụ thuộc camera clip

  return mat;
}

/**
 * Creates continuous procedural mountain range encircling the open world.
 * @param {import('@babylonjs/core').Scene} scene
 * @param {TransformNode} parent
 * @returns {{ root: TransformNode, ridgePoints: Array<{x: number, y: number, z: number, angle: number}>, dispose: Function }}
 */
export function createProceduralMountainRange(scene, parent) {
  const root = new TransformNode('procedural-mountain-range', scene);
  // Giữ root ở world space độc lập để hệ thống Parallax Horizon Tracking bám sát camera chính xác 100%

  // =========================================================================
  // 1. BẢNG MÀU PHỐI CẢNH KHÍ QUYỂN GHIBLI (ATMOSPHERIC AERIAL PERSPECTIVE)
  // =========================================================================

  // Tầng 1: Đồi núi cận trung cảnh (Misty Alpine Slate-Azure)
  const matNearRidge = makeAtmosphericMountainMaterial(scene, 'mat-near-mountain-ridge', [
    { offset: 0.0, color: 'rgba(224, 242, 254, 0.0)' },   // Chân núi: 100% trong suốt tan vào sương
    { offset: 0.20, color: 'rgba(220, 238, 252, 0.20)' }, // Lớp sương thung lũng bảng lảng
    { offset: 0.45, color: 'rgba(182, 212, 234, 0.52)' }, // Sườn núi: sắc lam sương khói ngọc bích
    { offset: 0.72, color: 'rgba(136, 176, 202, 0.72)' }, // Thân núi: sắc lam thanh thoát
    { offset: 0.92, color: 'rgba(102, 146, 176, 0.85)' }, // Đỉnh núi: sắc lam chàm viễn cảnh
    { offset: 1.0, color: 'rgba(118, 160, 188, 0.82)' },  // Chóp đỉnh dịu mắt hòa vào mây
  ]);

  // Tầng 2: Dãy đại sơn viễn cảnh mộng mơ (Dreamy Grand Celestial Peaks)
  const matFarRange = makeAtmosphericMountainMaterial(scene, 'mat-far-grand-mountain', [
    { offset: 0.0, color: 'rgba(224, 242, 254, 0.0)' },   // Chân núi trong suốt
    { offset: 0.25, color: 'rgba(215, 235, 250, 0.18)' }, // Sương mù viễn cảnh dày dặn
    { offset: 0.52, color: 'rgba(165, 198, 222, 0.54)' }, // Sườn núi lam ngọc mộng mơ
    { offset: 0.82, color: 'rgba(122, 162, 190, 0.78)' }, // Đỉnh đại sơn uy nghi
    { offset: 1.0, color: 'rgba(142, 178, 204, 0.75)' },  // Đỉnh chóp mờ sương
  ]);

  // Tầng 3: Đỉnh tuyết Bắc Cực lấp lánh (Northern Glacial Snow Summits)
  const matSnowPeak = makeAtmosphericMountainMaterial(scene, 'mat-mountain-snow-peak', [
    { offset: 0.0, color: 'rgba(224, 242, 254, 0.0)' },
    { offset: 0.30, color: 'rgba(230, 242, 252, 0.32)' },
    { offset: 0.65, color: 'rgba(242, 248, 255, 0.78)' },
    { offset: 1.0, color: 'rgba(255, 255, 255, 0.92)' },  // Tuyết trắng ngọc tinh khôi
  ]);

  // Tầng 4: Biển mây thung lũng bồng bềnh (Valley Mist & Cloud Belt)
  const matMistBelt = makeAtmosphericMountainMaterial(scene, 'mat-mountain-mist-belt', [
    { offset: 0.0, color: 'rgba(240, 249, 255, 0.0)' },
    { offset: 0.45, color: 'rgba(248, 252, 255, 0.36)' },
    { offset: 0.55, color: 'rgba(248, 252, 255, 0.36)' },
    { offset: 1.0, color: 'rgba(240, 249, 255, 0.0)' },
  ]);

  // Angular steps: Vòng cung rộng 250 độ bao quanh Tây, Tây-Bắc, Bắc, Đông-Bắc, Đông
  // Mở thoáng về hướng Nam nhìn ra đại dương bao la
  const steps = 144;
  const startAngle = 0.80 * Math.PI;
  const endAngle = 2.20 * Math.PI;

  const ridgePoints = [];

  // =========================================================================
  // 1. DÃY NÚI CẬN TRUNG CẢNH (MISTY ALPINE RIDGE · Bán kính 750m - 1100m)
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

    // Taper hạ độ cao tuyệt đối về dưới mặt nước tại 2 đầu mở hướng ra biển
    const taper = Math.sin(t * Math.PI);
    const taperH = Math.pow(taper, 1.8);
    const taperW = Math.pow(taper, 0.5); // Bề rộng thu nhỏ về 0 tại 2 đầu

    // Chìm sâu xuống lòng đất tại 2 đầu để triệt tiêu hoàn toàn góc cạnh
    const baseSink = -40 * (1 - taper);

    // Sóng địa hình đa tầng hữu cơ
    const h1 = Math.sin(angle * 3.5) * 32;
    const h2 = Math.cos(angle * 6.5 + 0.5) * 24;
    const h3 = Math.abs(Math.sin(angle * 11.0)) * 18;
    const h4 = Math.cos(angle * 17.0) * 12;
    const rawH = 88 + h1 + h2 + h3 + h4;
    const crestH = Math.max(0.1, rawH * taperH);

    // Uốn lượn bán kính mềm mại
    const radMod0 = Math.sin(angle * 3.0) * 30;
    const radMod1 = Math.cos(angle * 5.0 + 0.4) * 45;
    const radMod2 = Math.sin(angle * 6.0) * 60;
    const radMod3 = Math.cos(angle * 3.0) * 75;

    const rCenter = 1050;
    const r0 = rCenter - 220 * taperW + radMod0;
    const r1 = rCenter - 70 * taperW + radMod1;
    const r2 = rCenter + 90 * taperW + radMod2;
    const r3 = rCenter + 260 * taperW + radMod3;

    nearBaseInner.push(new Vector3(cosA * r0, baseSink - 5, sinA * r0));
    nearSlopeMid.push(new Vector3(cosA * r1, baseSink + crestH * 0.48, sinA * r1));
    nearCrest.push(new Vector3(cosA * r2, baseSink + crestH, sinA * r2));
    nearBaseOuter.push(new Vector3(cosA * r3, baseSink - 5, sinA * r3));

    if (i % 3 === 0 && crestH > 25) {
      ridgePoints.push({
        x: cosA * r2,
        y: crestH,
        z: sinA * r2,
        angle,
      });
    }

    // Mapping UV chuẩn V: 0 (chân núi trong suốt) -> 0.48 (sườn núi) -> 1.0 (đỉnh núi) -> 0.0 (chân sau)
    nearUvs0.push(new Vector2(t, 0.0));
    nearUvs1.push(new Vector2(t, 0.48));
    nearUvs2.push(new Vector2(t, 1.0));
    nearUvs3.push(new Vector2(t, 0.0));
  }

  const nearMesh = MeshBuilder.CreateRibbon('near-mountain-ribbon-mesh', {
    pathArray: [nearBaseInner, nearSlopeMid, nearCrest, nearBaseOuter],
    uvs: [nearUvs0, nearUvs1, nearUvs2, nearUvs3],
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  nearMesh.material = matNearRidge;
  nearMesh.alwaysSelectAsActiveMesh = true;
  nearMesh.ignoreCameraMaxZ = true;
  nearMesh.isPickable = false;
  nearMesh.receiveShadows = false;
  nearMesh.parent = root;

  // =========================================================================
  // 2. DÃY ĐẠI SƠN HÙNG VĨ VIỄN CẢNH (FAR GRAND ALPINE RANGE · Bán kính 1400m - 2300m)
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

  const snowUvs0 = [];
  const snowUvs1 = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = startAngle + t * (endAngle - startAngle);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const taper = Math.sin(t * Math.PI);
    const taperH = Math.pow(taper, 1.7);
    const taperW = Math.pow(taper, 0.5);

    const baseSink = -50 * (1 - taper);

    // Multi-octave towering peak height
    const gh1 = Math.cos(angle * 3.0 + 0.3) * 55;
    const gh2 = Math.sin(angle * 6.0 + 0.8) * 42;
    const gh3 = Math.abs(Math.cos(angle * 10.0)) * 32;
    const gh4 = Math.sin(angle * 16.0) * 22;
    const rawGrandH = 175 + gh1 + gh2 + gh3 + gh4;
    const grandCrestH = Math.max(0.1, rawGrandH * taperH);

    const frCenter = 1850;
    const fr0 = frCenter - 380 * taperW + Math.sin(angle * 4.0) * 45;
    const fr1 = frCenter - 140 * taperW + Math.cos(angle * 5.0) * 65;
    const fr2 = frCenter + 160 * taperW + Math.sin(angle * 7.0 + 0.5) * 85;
    const fr3 = frCenter + 460 * taperW + Math.cos(angle * 4.0) * 110;

    farBaseInner.push(new Vector3(cosA * fr0, baseSink - 10, sinA * fr0));
    farMidSlope.push(new Vector3(cosA * fr1, baseSink + grandCrestH * 0.52, sinA * fr1));
    farGrandCrest.push(new Vector3(cosA * fr2, baseSink + grandCrestH, sinA * fr2));
    farBaseOuter.push(new Vector3(cosA * fr3, baseSink - 10, sinA * fr3));

    // Đỉnh tuyết Bắc Cực tinh khôi (sinA < -0.18)
    if (sinA < -0.18 && grandCrestH > 45) {
      const snowWeight = Math.max(0, (-sinA - 0.18) / 0.82);
      const snowBaseH = baseSink + grandCrestH * (1.0 - 0.34 * snowWeight);
      const snowRadOffset = 75 * snowWeight;
      farSnowBase.push(new Vector3(cosA * (fr2 - snowRadOffset), snowBaseH, sinA * (fr2 - snowRadOffset)));
      farSnowCrest.push(new Vector3(cosA * fr2, baseSink + grandCrestH + 1.2, sinA * fr2));
      snowUvs0.push(new Vector2(t, 0.0));
      snowUvs1.push(new Vector2(t, 1.0));
    }

    farUvs0.push(new Vector2(t, 0.0));
    farUvs1.push(new Vector2(t, 0.50));
    farUvs2.push(new Vector2(t, 1.0));
    farUvs3.push(new Vector2(t, 0.0));
  }

  const farMesh = MeshBuilder.CreateRibbon('far-mountain-ribbon-mesh', {
    pathArray: [farBaseInner, farMidSlope, farGrandCrest, farBaseOuter],
    uvs: [farUvs0, farUvs1, farUvs2, farUvs3],
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  farMesh.material = matFarRange;
  farMesh.alwaysSelectAsActiveMesh = true;
  farMesh.ignoreCameraMaxZ = true;
  farMesh.isPickable = false;
  farMesh.receiveShadows = false;
  farMesh.parent = root;

  // Snow Cap peaks mesh (strictly continuous over Northern summits)
  let snowMesh = null;
  if (farSnowBase.length >= 2) {
    snowMesh = MeshBuilder.CreateRibbon('far-mountain-snow-caps', {
      pathArray: [farSnowBase, farSnowCrest],
      uvs: [snowUvs0, snowUvs1],
      sideOrientation: Mesh.DOUBLESIDE,
    }, scene);
    snowMesh.material = matSnowPeak;
    snowMesh.alwaysSelectAsActiveMesh = true;
    snowMesh.ignoreCameraMaxZ = true;
    snowMesh.isPickable = false;
    snowMesh.receiveShadows = false;
    snowMesh.parent = root;
  }

  // =========================================================================
  // 3. BIỂN MÂY THUNG LŨNG (VALLEY MIST & HORIZON CLOUD BELT)
  // Dải sương mù bồng bềnh lượn quanh chân núi ở độ cao y = 8m - 36m
  // =========================================================================
  const mistBaseInner = [];
  const mistCrest = [];
  const mistBaseOuter = [];

  const mistUvs0 = [];
  const mistUvs1 = [];
  const mistUvs2 = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = startAngle + t * (endAngle - startAngle);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const taper = Math.sin(t * Math.PI);
    const taperH = Math.pow(taper, 1.5);
    const taperW = Math.pow(taper, 0.5);

    const mistR = 860 + Math.sin(angle * 5.0) * 35;
    const mistH = (18 + Math.sin(angle * 8.0) * 8) * taperH;

    mistBaseInner.push(new Vector3(cosA * (mistR - 70 * taperW), 4, sinA * (mistR - 70 * taperW)));
    mistCrest.push(new Vector3(cosA * mistR, 4 + mistH, sinA * mistR));
    mistBaseOuter.push(new Vector3(cosA * (mistR + 90 * taperW), 4, sinA * (mistR + 90 * taperW)));

    mistUvs0.push(new Vector2(t, 0.0));
    mistUvs1.push(new Vector2(t, 0.5));
    mistUvs2.push(new Vector2(t, 1.0));
  }

  const mistBeltMesh = MeshBuilder.CreateRibbon('horizon-mountain-mist-belt', {
    pathArray: [mistBaseInner, mistCrest, mistBaseOuter],
    uvs: [mistUvs0, mistUvs1, mistUvs2],
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);
  mistBeltMesh.material = matMistBelt;
  mistBeltMesh.alwaysSelectAsActiveMesh = true;
  mistBeltMesh.ignoreCameraMaxZ = true;
  mistBeltMesh.isPickable = false;
  mistBeltMesh.receiveShadows = false;
  mistBeltMesh.parent = root;

  // =========================================================================
  // 4. PARALLAX HORIZON TRACKING ("ĐI QUÀI KHÔNG ĐẾN")
  // =========================================================================
  // Dãy núi bám theo tọa độ X, Z của camera với hệ số 0.94.
  // Khi người chơi di chuyển về bất kỳ hướng nào, rặng núi cũng lùi dần về phía chân trời,
  // giữ khoảng cách viễn cảnh vô tận hùng vĩ. Người chơi đi mãi mà không bao giờ chạm tới!
  let lastCamX = 0;
  let lastCamZ = 0;

  const parallaxObserver = scene.onBeforeRenderObservable.add(() => {
    const cam = scene.activeCamera;
    if (!cam) return;

    const targetX = cam.position.x * 0.94;
    const targetZ = cam.position.z * 0.94;

    // Smooth lerp follow
    root.position.x += (targetX - root.position.x) * 0.18;
    root.position.z += (targetZ - root.position.z) * 0.18;

    // Độ cao Y tương đối dịu nhẹ (không giật khi nhảy)
    root.position.y = Math.min(16, Math.max(-6, (cam.position.y - 4) * 0.12));

    lastCamX = root.position.x;
    lastCamZ = root.position.z;
  });

  return {
    root,
    ridgePoints,
    dispose() {
      if (parallaxObserver) {
        scene.onBeforeRenderObservable.remove(parallaxObserver);
      }
      matNearRidge.dispose();
      matFarRange.dispose();
      matSnowPeak.dispose();
      matMistBelt.dispose();
      root.dispose(false, true);
    },
  };
}
