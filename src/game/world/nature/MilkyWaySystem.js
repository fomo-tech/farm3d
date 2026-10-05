import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3, Matrix, Quaternion } from '@babylonjs/core/Maths/math.vector.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';

/**
 * MilkyWaySystem.js - MAGICAL ANIME NIGHT SKY & TWINKLING STARFIELD
 * 
 * 1. Dải Ngân Hà (Milky Way Arch): Vòm cung tinh vân uốn lượn huyền ảo xoay chậm trên bầu trời đêm.
 * 2. 720+ Ngôi sao 3 pha nhấp nháy đa tần (Multi-frequency Twinkling Stars).
 * 3. 16 Chòm sao lớn phát hào quang 4 tia (Cross-sparkle Major Constellation Stars).
 * 4. Vệt sao băng rơi chậm ban đêm (Gentle Shooting Star Trail).
 * 5. Hiệu năng 60 FPS vững vàng, zero allocation per frame.
 */

export function createMilkyWaySystem(scene, parentNode = null) {
  const root = new TransformNode('milkyway-system-root', scene);
  if (parentNode) {
    root.parent = parentNode;
  }

  // =========================================================================
  // 1. DẢI NGÂN HÀ HUYỀN ẢO (MILKY WAY NEBULA ARCH)
  // =========================================================================
  const mwTex = new DynamicTexture('milkyway-nebula-tex', { width: 1024, height: 256 }, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  mwTex.wrapU = Texture.CLAMP_ADDRESSMODE;
  mwTex.wrapV = Texture.CLAMP_ADDRESSMODE;
  const ctx = mwTex.getContext();

  // Vẽ đám mây tinh vân Ngân Hà bằng canvas gradient
  ctx.clearRect(0, 0, 1024, 256);

  // Gradient tỏa sáng dọc sống lưng dải Ngân Hà
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 256);
  bgGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.0)');
  bgGrad.addColorStop(0.25, 'rgba(76, 29, 149, 0.28)');  // Amethyst Purple
  bgGrad.addColorStop(0.45, 'rgba(30, 58, 138, 0.45)');  // Sapphire Blue
  bgGrad.addColorStop(0.50, 'rgba(199, 210, 254, 0.75)'); // Silver-white core
  bgGrad.addColorStop(0.55, 'rgba(14, 116, 144, 0.40)');  // Cyan-teal dust
  bgGrad.addColorStop(0.75, 'rgba(88, 28, 135, 0.25)');  // Deep Violet
  bgGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 256);

  // Vẽ các đám mây bụi khí tinh vân lượn sóng
  for (let puff = 0; puff < 48; puff++) {
    const px = (puff * 22 + (puff % 5) * 11) % 1024;
    const py = 128 + Math.sin(puff * 0.45) * 36;
    const rad = 28 + (puff % 7) * 8;
    const pGrad = ctx.createRadialGradient(px, py, 0, px, py, rad);
    const isTeal = puff % 3 === 0;
    pGrad.addColorStop(0.0, isTeal ? 'rgba(56, 189, 248, 0.35)' : 'rgba(216, 180, 254, 0.35)');
    pGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rải 320 hạt bụi sao li ti dọc dải Ngân Hà
  for (let s = 0; s < 320; s++) {
    const sx = Math.random() * 1024;
    const sy = 128 + (Math.random() - 0.5) * 90;
    const alpha = 0.4 + Math.random() * 0.6;
    const size = Math.random() < 0.2 ? 2.2 : 1.2;
    ctx.fillStyle = `rgba(255, 255, 240, ${alpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fill();
  }
  mwTex.update();

  const mwMat = new StandardMaterial('milkyway-mat', scene);
  mwMat.diffuseTexture = mwTex;
  mwMat.emissiveTexture = mwTex;
  mwMat.opacityTexture = mwTex;
  mwMat.disableLighting = true;
  mwMat.fogEnabled = false;
  mwMat.backFaceCulling = false;
  mwMat.disableDepthWrite = true;
  mwMat.alpha = 0;

  // Tạo dải vòm cung uốn lượn qua vòm trời bằng Ribbon 3D (bán kính 220m)
  const archSteps = 24;
  const pathA = [];
  const pathB = [];
  const archRadius = 220;
  const archWidth = 45;

  for (let i = 0; i <= archSteps; i++) {
    const t = (i / archSteps) * Math.PI; // 0 to PI
    const x = Math.cos(t) * archRadius;
    const y = Math.sin(t) * (archRadius * 0.92);
    const z = Math.sin(t * 0.8) * 55;

    pathA.push(new Vector3(x, y, z - archWidth / 2));
    pathB.push(new Vector3(x, y, z + archWidth / 2));
  }

  const milkyWayRibbon = MeshBuilder.CreateRibbon('milky-way-ribbon', {
    pathArray: [pathA, pathB],
    closeArray: false,
    closePath: false,
  }, scene);
  milkyWayRibbon.parent = root;
  milkyWayRibbon.material = mwMat;
  milkyWayRibbon.rotation.y = 0.55;
  milkyWayRibbon.rotation.z = -0.15;
  milkyWayRibbon.alwaysSelectAsActiveMesh = true;
  milkyWayRibbon.ignoreCameraMaxZ = true;

  // =========================================================================
  // 2. HỆ THỐNG 720+ NGÔI SAO NHẤP NHÁY ĐA TẦN (3-TIER TWINKLING STAR GROUPS)
  // =========================================================================
  function createStarGroup(name, count, colorHex, size, baseFrequency, seedOffset) {
    const starMesh = MeshBuilder.CreateSphere(name, { diameter: size, segments: 4 }, scene);
    starMesh.parent = root;
    starMesh.alwaysSelectAsActiveMesh = true;
    starMesh.ignoreCameraMaxZ = true;

    const mat = new StandardMaterial(`${name}-mat`, scene);
    mat.diffuseColor = Color3.White();
    mat.emissiveColor = Color3.FromHexString(colorHex);
    mat.disableLighting = true;
    mat.disableDepthWrite = true;
    mat.fogEnabled = false;
    mat.alpha = 0;
    starMesh.material = mat;

    const matrices = [];
    const sPos = new Vector3();
    const sMat = Matrix.Identity();

    for (let i = 0; i < count; i++) {
      const idx = i + seedOffset;
      const theta = (idx * 0.6180339887) * (Math.PI * 2);
      // Giữ góc ngẩng từ 12 độ đến 85 độ (trên đường chân trời)
      const phi = 0.22 + ((idx * 1.41421356) % 1) * 0.92;
      const rad = 208 + (idx % 15);

      const sx = Math.sin(phi) * Math.cos(theta) * rad;
      const sy = Math.cos(phi) * rad;
      const sz = Math.sin(phi) * Math.sin(theta) * rad;

      const scale = 0.75 + ((idx * 5) % 10) / 10 * 1.1;
      sPos.set(sx, sy, sz);
      Matrix.ComposeToRef(new Vector3(scale, scale, scale), Quaternion.Identity(), sPos, sMat);
      matrices.push(...sMat.asArray());
    }

    starMesh.thinInstanceSetBuffer('matrix', new Float32Array(matrices), 16, true);

    return {
      mesh: starMesh,
      mat,
      frequency: baseFrequency,
      phaseOffset: seedOffset * 0.35,
    };
  }

  // 3 nhóm sao nhấp nháy lệch pha: vàng ấm, lam ngọc, và trắng bạc (kích cỡ tinh tế 0.65m - 0.45m ở bán kính 210m)
  const starGroups = [
    createStarGroup('stars-twinkle-alpha', 240, '#fef08a', 0.65, 2.1, 0),
    createStarGroup('stars-twinkle-beta', 240, '#bae6fd', 0.55, 1.4, 137),
    createStarGroup('stars-twinkle-gamma', 240, '#ffffff', 0.45, 2.8, 389),
  ];

  // =========================================================================
  // 3. 16 CHÒM SAO LỚN HÀO QUANG 4 TIA (MAJOR CROSS-SPARKLE STARS)
  // =========================================================================
  const sparkleTex = new DynamicTexture('major-star-sparkle-tex', { width: 128, height: 128 }, scene, true);
  const spCtx = sparkleTex.getContext();
  spCtx.clearRect(0, 0, 128, 128);

  // Tâm phát sáng
  const spGrad = spCtx.createRadialGradient(64, 64, 0, 64, 64, 48);
  spGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  spGrad.addColorStop(0.2, 'rgba(254, 240, 138, 0.85)');
  spGrad.addColorStop(0.6, 'rgba(186, 230, 253, 0.35)');
  spGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
  spCtx.fillStyle = spGrad;
  spCtx.beginPath();
  spCtx.arc(64, 64, 48, 0, Math.PI * 2);
  spCtx.fill();

  // 4 tia sáng kim tự tháp mềm
  spCtx.fillStyle = 'rgba(255, 255, 240, 0.85)';
  // Tia dọc
  spCtx.fillRect(62, 12, 4, 104);
  // Tia ngang
  spCtx.fillRect(12, 62, 104, 4);
  sparkleTex.update();

  const majorSparkleMat = new StandardMaterial('major-star-sparkle-mat', scene);
  majorSparkleMat.emissiveTexture = sparkleTex;
  majorSparkleMat.opacityTexture = sparkleTex;
  majorSparkleMat.disableLighting = true;
  majorSparkleMat.disableDepthWrite = true;
  majorSparkleMat.fogEnabled = false;
  majorSparkleMat.alpha = 0;

  const majorStarNodes = [];
  const majorStarCoords = [
    // Chòm Bắc Đẩu (Big Dipper)
    { x: -75, y: 145, z: -160, scale: 2.5 },
    { x: -55, y: 155, z: -168, scale: 2.3 },
    { x: -35, y: 162, z: -172, scale: 2.7 },
    { x: -18, y: 168, z: -165, scale: 2.4 },
    { x: 5, y: 162, z: -168, scale: 2.8 },
    { x: 22, y: 154, z: -175, scale: 2.5 },
    { x: 38, y: 146, z: -180, scale: 2.6 },
    // Các sao định hướng lớn trên đỉnh trời
    { x: -120, y: 180, z: 20, scale: 3.1 }, // Vega (Sao Chức Nữ)
    { x: 95, y: 175, z: 45, scale: 2.8 },  // Altair (Sao Ngưu Lang)
    { x: -15, y: 215, z: -35, scale: 3.4 }, // Polaris (Sao Bắc Cực)
    { x: 65, y: 190, z: -85, scale: 2.7 },  // Deneb (Sao Thiên Tân)
    { x: 135, y: 155, z: -60, scale: 2.4 },
    { x: -90, y: 165, z: 120, scale: 2.6 },
    { x: 80, y: 170, z: 135, scale: 2.7 },
    { x: -45, y: 185, z: 145, scale: 2.8 },
    { x: 15, y: 195, z: 125, scale: 2.9 },
  ];

  majorStarCoords.forEach((coord, i) => {
    const starPlane = MeshBuilder.CreatePlane(`major-sparkle-${i}`, { size: coord.scale }, scene);
    starPlane.position.set(coord.x, coord.y, coord.z);
    starPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;
    starPlane.material = majorSparkleMat;
    starPlane.parent = root;
    starPlane.alwaysSelectAsActiveMesh = true;
    starPlane.ignoreCameraMaxZ = true;
    majorStarNodes.push(starPlane);
  });

  // =========================================================================
  // 4. VỆT SAO BĂNG RƠI CHẬM (GENTLE SHOOTING STARS)
  // =========================================================================
  const shootingStar = MeshBuilder.CreateCylinder('gentle-shooting-star', {
    height: 7,
    diameterTop: 0.05,
    diameterBottom: 0.45,
    tessellation: 6,
  }, scene);
  shootingStar.parent = root;
  shootingStar.alwaysSelectAsActiveMesh = true;
  shootingStar.ignoreCameraMaxZ = true;

  const shootMat = new StandardMaterial('gentle-shooting-star-mat', scene);
  shootMat.emissiveColor = Color3.FromHexString('#fef08a');
  shootMat.disableLighting = true;
  shootMat.disableDepthWrite = true;
  shootMat.fogEnabled = false;
  shootMat.alpha = 0;
  shootingStar.material = shootMat;
  shootingStar.rotation.z = Math.PI / 4;
  shootingStar.rotation.x = Math.PI / 6;

  let shootingStarTimer = 0;
  let shootingStarProgress = -1;
  let shootingStarOrigin = new Vector3();

  // Internal time accumulator for animations
  let animTime = 0;

  return {
    root,

    setVisibility(visibility) {
      const v = Math.max(0, Math.min(1, visibility));

      // Độ trong suốt của dải Ngân Hà
      mwMat.alpha = v * 0.88;

      // Độ sáng của các ngôi sao chính
      majorSparkleMat.alpha = v * 0.95;

      // Các nhóm sao có alpha cơ sở
      starGroups.forEach(grp => {
        grp.mat.alpha = v;
      });
    },

    update(dt = 0.016, camPos = null) {
      animTime += dt;

      // Bám sát camera để luôn nằm ở vô cực
      if (camPos) {
        root.position.x = camPos.x;
        root.position.y = camPos.y;
        root.position.z = camPos.z;
      }

      // Xoay nhẹ nhàng dải Ngân Hà theo thời gian
      milkyWayRibbon.rotation.y += dt * 0.0015;

      // Hiệu ứng sao nhấp nháy đa tần (Multi-frequency twinkle)
      starGroups.forEach(grp => {
        if (grp.mat.alpha > 0.01) {
          const sine = Math.sin(animTime * grp.frequency + grp.phaseOffset);
          // Biến thiên độ phát xạ nhẹ từ 0.70 đến 1.0
          const brightness = 0.78 + sine * 0.22;
          grp.mat.emissiveColor.set(brightness, brightness, brightness * 0.9);
        }
      });

      // Xoay nhẹ tia sáng của các chòm sao lớn
      majorStarNodes.forEach((node, i) => {
        node.rotation.z = animTime * 0.15 * (i % 2 === 0 ? 1 : -1) + i;
      });

      // Sao băng rơi chậm lúc ban đêm (Shooting Star Logic)
      if (mwMat.alpha > 0.3) {
        shootingStarTimer += dt;
        if (shootingStarTimer > 10.0 && shootingStarProgress < 0) {
          shootingStarTimer = 0;
          shootingStarProgress = 0;
          const angle = Math.random() * Math.PI * 2;
          const dist = 180 + Math.random() * 25;
          shootingStarOrigin.set(
            (camPos?.x || 0) + Math.cos(angle) * dist,
            (camPos?.y || 0) + 110 + Math.random() * 35,
            (camPos?.z || 0) + Math.sin(angle) * dist
          );
          shootingStar.position.copyFrom(shootingStarOrigin);
        }

        if (shootingStarProgress >= 0) {
          shootingStarProgress += dt * 0.65;
          const p = shootingStarProgress;
          shootingStar.position.set(
            shootingStarOrigin.x - p * 38,
            shootingStarOrigin.y - p * 22,
            shootingStarOrigin.z + p * 32
          );

          if (p < 0.25) {
            shootMat.alpha = (p / 0.25) * 0.95;
          } else if (p > 0.7) {
            shootMat.alpha = Math.max(0, (1.0 - p) / 0.3) * 0.95;
          } else {
            shootMat.alpha = 0.95;
          }

          if (shootingStarProgress >= 1.0) {
            shootingStarProgress = -1;
            shootMat.alpha = 0;
          }
        }
      } else {
        shootMat.alpha = 0;
        shootingStarProgress = -1;
      }
    },

    dispose() {
      mwTex.dispose();
      sparkleTex.dispose();
      root.dispose(false, true);
    },
  };
}
