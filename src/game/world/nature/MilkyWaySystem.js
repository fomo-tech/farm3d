import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3, Matrix, Quaternion } from '@babylonjs/core/Maths/math.vector.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';

/**
 * MilkyWaySystem.js - MAGICAL ANIME NIGHT SKY & TWINKLING STARFIELD
 * 
 * 1. Dải Ngân Hà & Tinh Vân: Được tính toán 100% bằng GPU Shader trong ProceduralSkyDome (không còn ribbon mesh thô kệch).
 * 2. 720+ Ngôi sao 3 pha nhấp nháy đa tần (Multi-frequency Twinkling Thin-Instance Stars).
 * 3. 16 Chòm sao lớn phát hào quang 4 tia (Cross-sparkle Major Constellation Stars).
 * 4. Vệt sao băng rơi chậm ban đêm (Gentle Shooting Star Trail).
 * 5. Bán kính định vị 120m-135m hoàn hảo trong camera frustum, không bao giờ bị cắt xén (Zero Far-plane Clipping).
 */

export function createMilkyWaySystem(scene, parentNode = null) {
  const root = new TransformNode('milkyway-system-root', scene);
  if (parentNode) {
    root.parent = parentNode;
  }

  // =========================================================================
  // 1. HỆ THỐNG 720+ NGÔI SAO NHẤP NHÁY ĐA TẦN (3-TIER TWINKLING STAR GROUPS)
  // Bán kính an toàn 120m-132m bên trong camera frustum
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
      // Giữ góc ngẩng từ 15 độ đến 85 độ (trên đường chân trời)
      const phi = 0.25 + ((idx * 1.41421356) % 1) * 0.88;
      const rad = 120 + (idx % 12);

      const sx = Math.sin(phi) * Math.cos(theta) * rad;
      const sy = Math.cos(phi) * rad;
      const sz = Math.sin(phi) * Math.sin(theta) * rad;

      const scale = 0.85 + ((idx * 5) % 10) / 10 * 0.9;
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

  // 3 nhóm sao nhấp nháy lệch pha: vàng ấm, lam ngọc, và trắng bạc
  const starGroups = [
    createStarGroup('stars-twinkle-alpha', 240, '#fef08a', 0.52, 2.1, 0),
    createStarGroup('stars-twinkle-beta', 240, '#bae6fd', 0.44, 1.4, 137),
    createStarGroup('stars-twinkle-gamma', 240, '#ffffff', 0.38, 2.8, 389),
  ];

  // =========================================================================
  // 2. 16 CHÒM SAO LỚN HÀO QUANG 4 TIA (MAJOR CROSS-SPARKLE STARS)
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

  // 4 Tia hào quang chéo rực rỡ
  spCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  // Ngang
  spCtx.fillRect(16, 62, 96, 4);
  // Dọc
  spCtx.fillRect(62, 16, 4, 96);
  // Vệt mờ
  spCtx.fillStyle = 'rgba(254, 240, 138, 0.45)';
  spCtx.fillRect(4, 63, 120, 2);
  spCtx.fillRect(63, 4, 2, 120);

  sparkleTex.update();

  const majorSparkleMat = new StandardMaterial('major-sparkle-mat', scene);
  majorSparkleMat.emissiveTexture = sparkleTex;
  majorSparkleMat.opacityTexture = sparkleTex;
  majorSparkleMat.disableLighting = true;
  majorSparkleMat.disableDepthWrite = true;
  majorSparkleMat.fogEnabled = false;
  majorSparkleMat.alpha = 0;

  const majorStarNodes = [];
  const sScale = 0.58; // Tỉ lệ an toàn để luôn nằm gọn trong bán kính 130m
  const majorStarCoords = [
    // Chòm Bắc Đẩu (Big Dipper)
    { x: -75 * sScale, y: 145 * sScale, z: -160 * sScale, scale: 2.2 },
    { x: -55 * sScale, y: 155 * sScale, z: -168 * sScale, scale: 2.0 },
    { x: -35 * sScale, y: 162 * sScale, z: -172 * sScale, scale: 2.3 },
    { x: -18 * sScale, y: 168 * sScale, z: -165 * sScale, scale: 2.1 },
    { x: 5 * sScale, y: 162 * sScale, z: -168 * sScale, scale: 2.4 },
    { x: 22 * sScale, y: 154 * sScale, z: -175 * sScale, scale: 2.1 },
    { x: 38 * sScale, y: 146 * sScale, z: -180 * sScale, scale: 2.2 },
    // Các sao định hướng lớn trên đỉnh trời
    { x: -120 * sScale, y: 180 * sScale, z: 20 * sScale, scale: 2.6 }, // Vega (Sao Chức Nữ)
    { x: 95 * sScale, y: 175 * sScale, z: 45 * sScale, scale: 2.4 },  // Altair (Sao Ngưu Lang)
    { x: -15 * sScale, y: 215 * sScale, z: -35 * sScale, scale: 2.8 }, // Polaris (Sao Bắc Cực)
    { x: 65 * sScale, y: 190 * sScale, z: -85 * sScale, scale: 2.3 },  // Deneb (Sao Thiên Tân)
    { x: 135 * sScale, y: 155 * sScale, z: -60 * sScale, scale: 2.1 },
    { x: -90 * sScale, y: 165 * sScale, z: 120 * sScale, scale: 2.2 },
    { x: 80 * sScale, y: 170 * sScale, z: 135 * sScale, scale: 2.3 },
    { x: -45 * sScale, y: 185 * sScale, z: 145 * sScale, scale: 2.4 },
    { x: 15 * sScale, y: 195 * sScale, z: 125 * sScale, scale: 2.5 },
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
  // 3. VỆT SAO BĂNG RƠI CHẬM (GENTLE SHOOTING STARS)
  // =========================================================================
  const shootingStar = MeshBuilder.CreateCylinder('gentle-shooting-star', {
    height: 5.5,
    diameterTop: 0.04,
    diameterBottom: 0.35,
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
      if (majorSparkleMat.alpha > 0.3) {
        shootingStarTimer += dt;
        if (shootingStarTimer > 10.0 && shootingStarProgress < 0) {
          shootingStarTimer = 0;
          shootingStarProgress = 0;
          const angle = Math.random() * Math.PI * 2;
          const dist = 105 + Math.random() * 20;
          shootingStarOrigin.set(
            (camPos?.x || 0) + Math.cos(angle) * dist,
            (camPos?.y || 0) + 70 + Math.random() * 25,
            (camPos?.z || 0) + Math.sin(angle) * dist
          );
          shootingStar.position.copyFrom(shootingStarOrigin);
        }

        if (shootingStarProgress >= 0) {
          shootingStarProgress += dt * 0.65;
          const p = shootingStarProgress;
          shootingStar.position.set(
            shootingStarOrigin.x - p * 32,
            shootingStarOrigin.y - p * 18,
            shootingStarOrigin.z + p * 26
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
      sparkleTex.dispose();
      root.dispose(false, true);
    },
  };
}
