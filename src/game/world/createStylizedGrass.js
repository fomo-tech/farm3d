import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3, Matrix, Quaternion } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';

/**
 * Tạo thảm cỏ 3D nghệ thuật (Stylized 3D Wind Grass & Wildflowers)
 * Phong cách Ghibli / Animal Crossing:
 * - Hàng ngàn cụm cỏ 3D uốn cong mềm mại đón ánh nắng
 * - Đan xen hoa dại cúc trắng và bồ công anh vàng
 * - Tối ưu 60 FPS tuyệt đối bằng Babylon Thin Instances (chỉ 2-3 draw calls)
 * - Hiệu ứng gió thoảng dập dềnh tự nhiên
 */
export function createStylizedGrass(scene, shadows) {
  const grassRoot = new TransformNode('stylized-grass-root', scene);

  // === 1. TẠO MẪU CỤM CỎ 3D (MASTER GRASS TUFT MESH) ===
  function buildGrassClumpMesh(name, colorHex, highlightHex) {
    const blades = [];

    // Nhánh 1: Cỏ thẳng đứng hơi cong
    const b1 = MeshBuilder.CreatePlane(`${name}-b1`, { width: 0.14, height: 0.72 }, scene);
    b1.position.set(0, 0.36, 0);
    b1.rotation.y = 0.2;
    b1.rotation.x = -0.15;
    blades.push(b1);

    // Nhánh 2: Cỏ uốn cong sang trái
    const b2 = MeshBuilder.CreatePlane(`${name}-b2`, { width: 0.13, height: 0.62 }, scene);
    b2.position.set(-0.08, 0.31, 0.04);
    b2.rotation.y = 1.1;
    b2.rotation.z = 0.25;
    blades.push(b2);

    // Nhánh 3: Cỏ uốn cong sang phải
    const b3 = MeshBuilder.CreatePlane(`${name}-b3`, { width: 0.12, height: 0.66 }, scene);
    b3.position.set(0.09, 0.33, -0.03);
    b3.rotation.y = -0.9;
    b3.rotation.z = -0.22;
    blades.push(b3);

    // Nhánh 4: Cỏ xòe nhẹ phía trước
    const b4 = MeshBuilder.CreatePlane(`${name}-b4`, { width: 0.11, height: 0.52 }, scene);
    b4.position.set(0.03, 0.26, 0.08);
    b4.rotation.y = 2.4;
    b4.rotation.x = 0.28;
    blades.push(b4);

    const merged = Mesh.MergeMeshes(blades, true, true, undefined, false, true);
    merged.name = name;
    merged.parent = grassRoot;

    const mat = new StandardMaterial(`${name}-mat`, scene);
    mat.diffuseColor = Color3.FromHexString(colorHex);
    mat.emissiveColor = Color3.FromHexString(highlightHex).scale(0.08);
    mat.ambientColor = Color3.FromHexString(colorHex).scale(0.25);
    mat.specularColor = new Color3(0.02, 0.02, 0.02);
    mat.backFaceCulling = false; // Nhìn thấy cả 2 mặt lá cỏ
    merged.material = mat;

    return merged;
  }

  // === 2. TẠO MẪU HOA DẠI (WILDFLOWER CLUMP) ===
  function buildWildflowerMesh(name, petalHex, centerHex) {
    const parts = [];

    // Thân hoa mỏng
    const stem = MeshBuilder.CreateCylinder(`${name}-stem`, { height: 0.5, diameter: 0.04 }, scene);
    stem.position.set(0, 0.25, 0);
    parts.push(stem);

    // Cánh hoa tròn
    const petal = MeshBuilder.CreateDisc(`${name}-petal`, { radius: 0.12, tessellation: 8 }, scene);
    petal.position.set(0, 0.5, 0);
    petal.rotation.x = Math.PI / 2;
    parts.push(petal);

    // Nhụy hoa vàng
    const center = MeshBuilder.CreateSphere(`${name}-center`, { diameter: 0.07, segments: 6 }, scene);
    center.position.set(0, 0.51, 0);
    parts.push(center);

    const merged = Mesh.MergeMeshes(parts, true, true, undefined, false, true);
    merged.name = name;
    merged.parent = grassRoot;

    const mat = new StandardMaterial(`${name}-mat`, scene);
    mat.diffuseColor = Color3.FromHexString(petalHex);
    mat.emissiveColor = Color3.FromHexString(petalHex).scale(0.15);
    mat.backFaceCulling = false;
    merged.material = mat;

    return merged;
  }

  const masterGrassLime = buildGrassClumpMesh('master-grass-lime', '#5a9638', '#6fae45');
  const masterGrassEmerald = buildGrassClumpMesh('master-grass-emerald', '#427827', '#2d541a');
  const masterDaisy = buildWildflowerMesh('master-flower-daisy', '#ffffff', '#fde047');
  const masterDandelion = buildWildflowerMesh('master-flower-dandelion', '#fef08a', '#f59e0b');

  // === 3. KIỂM TRA VỊ TRÍ HỢP LỆ ĐỂ TRỒNG CỎ ===
  function isAllowedPosition(x, z) {
    // Không trồng trên đường cái chính giữa (North-South main road)
    if (Math.abs(x) < 4.2 && z > -45 && z < 390) return false;
    // Không trồng trên đường nhánh Đông-Tây (East-West branch road)
    if (Math.abs(z) < 4.2 && x > -175 && x < 175) return false;

    // Không trồng đè lên lưới 4 cột x 6 hàng của 24 lô.
    for (let lot = 0; lot < 24; lot += 1) {
      const farmX = -45 + (lot % 4) * 30;
      const farmZ = 112 + Math.floor(lot / 4) * 28;
      if (Math.abs(x - farmX) < 15 && Math.abs(z - farmZ) < 12) return false;
    }

    // Không trồng trong lòng hồ Pha Lê phía Đông.
    const lakeDist = Math.hypot(x - 165, z - 2);
    if (lakeDist < 36) return false;

    // Không trồng trong quảng trường trung tâm.
    if (Math.abs(x) < 45 && Math.abs(z) < 45) return false;

    return true;
  }

  // === 4. PHÂN PHỐI THẢM CỎ & HOA DẠI (THIN INSTANCES) ===
  const totalClumps = 1600;
  const limeMatrices = [];
  const emeraldMatrices = [];
  const daisyMatrices = [];
  const dandelionMatrices = [];

  const tempPos = new Vector3();
  const tempRot = new Quaternion();
  const tempScale = new Vector3();
  const tempMat = Matrix.Identity();

  let attempts = 0;
  let placed = 0;

  // Thuật toán Pseudo-Random ổn định cố định seed
  let seed = 42;
  function pseudoRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  while (placed < totalClumps && attempts < totalClumps * 4) {
    attempts++;
    // Tập trung quanh bán kính 160 từ tâm thế giới
    const angle = pseudoRandom() * Math.PI * 2;
    const dist = 6 + pseudoRandom() * 155;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;

    if (!isAllowedPosition(x, z)) continue;

    const scaleVal = 0.85 + pseudoRandom() * 0.45;
    tempScale.set(scaleVal, scaleVal, scaleVal);
    const rotY = pseudoRandom() * Math.PI * 2;
    Quaternion.FromEulerAnglesToRef(0, rotY, 0, tempRot);
    tempPos.set(x, 0.02, z);

    Matrix.ComposeToRef(tempScale, tempRot, tempPos, tempMat);

    // Phân loại: 50% cỏ chanh, 35% cỏ ngọc lục bảo, 8% cúc trắng, 7% bồ công anh vàng
    const rType = pseudoRandom();
    if (rType < 0.50) {
      limeMatrices.push(...tempMat.asArray());
    } else if (rType < 0.85) {
      emeraldMatrices.push(...tempMat.asArray());
    } else if (rType < 0.93) {
      daisyMatrices.push(...tempMat.asArray());
    } else {
      dandelionMatrices.push(...tempMat.asArray());
    }

    placed++;
  }

  // Nạp toàn bộ ma trận vào Thin Instances (1 draw call cho mỗi loại!)
  if (limeMatrices.length > 0) {
    masterGrassLime.thinInstanceSetBuffer('matrix', new Float32Array(limeMatrices), 16, true);
  }
  if (emeraldMatrices.length > 0) {
    masterGrassEmerald.thinInstanceSetBuffer('matrix', new Float32Array(emeraldMatrices), 16, true);
  }
  if (daisyMatrices.length > 0) {
    masterDaisy.thinInstanceSetBuffer('matrix', new Float32Array(daisyMatrices), 16, true);
  }
  if (dandelionMatrices.length > 0) {
    masterDandelion.thinInstanceSetBuffer('matrix', new Float32Array(dandelionMatrices), 16, true);
  }

  // === 5. HIỆU ỨNG GIÓ ĐUNG ĐƯA (ORGANIC WIND SWAY) ===
  let windTime = 0;
  const windObserver = scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    windTime += dt * 1.8;

    // Gió thoảng lay động nhẹ toàn bộ thảm cỏ
    const swayAngle = Math.sin(windTime) * 0.06 + Math.cos(windTime * 0.7) * 0.03;
    masterGrassLime.rotation.z = swayAngle;
    masterGrassEmerald.rotation.z = -swayAngle * 0.85;
    masterDaisy.rotation.x = Math.cos(windTime * 1.2) * 0.05;
    masterDandelion.rotation.x = -Math.sin(windTime * 1.1) * 0.05;
  });

  return {
    root: grassRoot,
    dispose: () => {
      scene.onBeforeRenderObservable.remove(windObserver);
      grassRoot.dispose(false, true);
    }
  };
}
