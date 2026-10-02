import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { MODEL_PATHS, spawnModelSync } from '../rendering/ModelAssetManager.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial } from '../rendering/PlayTogetherTheme.js';

/**
 * Tạo Cổng Nông Trại 3D Tinh Xảo & Biển Tên Sắc Nét và Thùng Thư Giao Lưu Play Together
 */
export function createFarmGateAndSign(scene, farmConfig, shadows = null, onMailboxClick = null) {
  const isSouthSide = farmConfig.z < 35;
  const root = new TransformNode(`farm-gate-root-${farmConfig.id}`, scene);
  root.position.set(farmConfig.x, 0, isSouthSide ? farmConfig.z + 7.0 : farmConfig.z - 7.0);
  if (isSouthSide) {
    root.rotation.y = Math.PI;
  }

  const brassMat = createToyMaterial(scene, 'mat-gate-brass-shiny', '#f59e0b', { specularPower: 96, specularLevel: 0.7 });
  const mailboxRed = createToyMaterial(scene, 'mat-mailbox-cherry-red', '#ef4444', { specularPower: 96, specularLevel: 0.65 });
  const whiteMat = createToyMaterial(scene, 'mat-mailbox-cream-white', PLAY_TOGETHER_PALETTE.farm.fenceWhite, { specularPower: 80 });
  const darkWood = createToyMaterial(scene, 'mat-gate-darkwood-warm', PLAY_TOGETHER_PALETTE.farm.honeyWood);
  const postSpacing = 3.8;

  // 1. Cổng Gỗ 3D & Hàng Rào Nghệ Thuật (3D Fence Gate & Fences)
  const gateScale = 3.2;
  const gate3D = spawnModelSync(scene, MODEL_PATHS.town.fenceGate, {
    position: new Vector3(0, 0, 0),
    scaling: new Vector3(gateScale, gateScale, gateScale),
    shadows,
    name: `fence-gate-3d-${farmConfig.id}`,
  });
  gate3D.parent = root;

  // Hai hàng rào 3D nối dài hai bên cổng
  [-3.2, 3.2].forEach((offset, idx) => {
    const fence = spawnModelSync(scene, MODEL_PATHS.town.fence, {
      position: new Vector3(offset, 0, 0),
      scaling: new Vector3(gateScale, gateScale, gateScale),
      shadows,
      name: `fence-wing-3d-${farmConfig.id}-${idx}`,
    });
    fence.parent = root;
  });

  // Đèn lồng đường phố 3D thắp sáng lối vào cổng
  const gateLantern = spawnModelSync(scene, MODEL_PATHS.town.lantern, {
    position: new Vector3(-2.2, 0, -0.4),
    scaling: new Vector3(1.2, 1.2, 1.2),
    shadows,
    name: `gate-lantern-3d-${farmConfig.id}`,
  });
  gateLantern.parent = root;

  // 3. Biển Gỗ Treo Chữ Nổi (Carved Wooden Signboard)
  const signWidth = 2.6;
  const signHeight = 0.85;
  const signBoard = MeshBuilder.CreateBox('gate-sign-board', {
    width: signWidth,
    height: signHeight,
    depth: 0.08,
  }, scene);
  signBoard.position.set(0, 2.35, 0);
  signBoard.parent = root;
  shadows?.addShadowCaster(signBoard);

  // Vẽ chữ sắc nét lên biển gỗ bằng DynamicTexture
  const textTex = new DynamicTexture(`sign-tex-${farmConfig.id}`, { width: 512, height: 160 }, scene, true);
  const tctx = textTex.getContext();

  // Nền gỗ vân sáng
  tctx.fillStyle = farmConfig.isOwner ? '#fef3c7' : '#f5ebe0';
  tctx.fillRect(0, 0, 512, 160);

  // Viền khung chỉ vàng sang trọng
  tctx.lineWidth = 8;
  tctx.strokeStyle = farmConfig.isOwner ? '#d97706' : '#8d6e63';
  tctx.strokeRect(6, 6, 500, 148);

  // Dòng 1: Tiêu đề lô đất
  tctx.fillStyle = farmConfig.isOwner ? '#92400e' : '#5d4037';
  tctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
  tctx.textAlign = 'center';
  tctx.textBaseline = 'middle';
  tctx.fillText(farmConfig.isOwner ? '🌾 NÔNG TRẠI CỦA BẠN' : `🏡 LÔ ${farmConfig.lotNumber || '1'}`, 256, 48);

  // Dòng 2: Tên chủ sở hữu
  tctx.fillStyle = farmConfig.isOwner ? '#b45309' : '#3e2723';
  tctx.font = '600 32px "Segoe UI", Arial, sans-serif';
  tctx.fillText(farmConfig.owner || 'Nông Dân', 256, 105);

  textTex.update();

  const signMat = new StandardMaterial(`sign-mat-${farmConfig.id}`, scene);
  signMat.diffuseColor = Color3.White();
  signMat.ambientColor = new Color3(0.5, 0.5, 0.5);
  signMat.diffuseTexture = textTex;
  signMat.specularColor = new Color3(0.04, 0.04, 0.04);
  signBoard.material = signMat;

  // 2 Móc xích sắt treo biển vào xà ngang
  [-0.8, 0.8].forEach((cx, idx) => {
    const chain = MeshBuilder.CreateCylinder(`sign-chain-${idx}`, {
      height: 0.28,
      diameter: 0.035,
    }, scene);
    chain.position.set(cx, 2.85, 0);
    chain.material = brassMat;
    chain.parent = root;
  });

  // 4. Thùng Thư Giao Lưu & Quà Tặng (Friendship Mailbox) cắm bên phải cổng
  const mailboxRoot = new TransformNode(`mailbox-root-${farmConfig.id}`, scene);
  mailboxRoot.position.set(postSpacing / 2 + 0.8, 0, -0.4);
  mailboxRoot.parent = root;

  // Cọc gỗ cắm đất
  const mbPost = MeshBuilder.CreateCylinder('mb-post', { height: 1.1, diameter: 0.12, tessellation: 8 }, scene);
  mbPost.position.y = 0.55;
  mbPost.material = darkWood;
  mbPost.parent = mailboxRoot;

  // Thùng thư vòm cong màu đỏ phong cách Châu Âu
  const mbBox = MeshBuilder.CreateCylinder('mb-box', {
    height: 0.55,
    diameter: 0.38,
    tessellation: 12,
  }, scene);
  mbBox.rotation.x = Math.PI / 2;
  mbBox.position.set(0, 1.05, 0);
  mbBox.material = mailboxRed;
  mbBox.parent = mailboxRoot;

  // Nắp hòm thư trắng
  const mbDoor = MeshBuilder.CreateCylinder('mb-door', {
    height: 0.04,
    diameter: 0.36,
    tessellation: 12,
  }, scene);
  mbDoor.rotation.x = Math.PI / 2;
  mbDoor.position.set(0, 1.05, 0.28);
  mbDoor.material = whiteMat;
  mbDoor.parent = mailboxRoot;

  // Lá cờ thư màu vàng dựng đứng (Mailbox Flag) có thể nâng hạ
  const mbFlag = MeshBuilder.CreateBox('mb-flag', {
    width: 0.04,
    height: 0.22,
    depth: 0.14,
  }, scene);
  mbFlag.position.set(0.2, 1.18, -0.05);
  mbFlag.material = brassMat;
  mbFlag.parent = mailboxRoot;

  // Biểu tượng Trái Tim 3D ngọt ngào trên đỉnh thùng thư (3D Heart Emblem)
  const heartMat = createToyMaterial(scene, 'mat-heart-red', '#f43f5e', {
    emissiveHex: '#fb7185',
    specularPower: 80,
    specularLevel: 0.55,
  });
  const heartRoot = new TransformNode('mb-heart-root', scene);
  heartRoot.position.set(0, 1.34, 0);
  heartRoot.parent = mailboxRoot;

  // Ghép hình trái tim 3D từ 2 quả cầu và 1 hình chóp ngược
  [-0.05, 0.05].forEach((hx, i) => {
    const lobe = MeshBuilder.CreateSphere(`heart-lobe-${i}`, { diameter: 0.12, segments: 8 }, scene);
    lobe.position.set(hx, 0.05, 0);
    lobe.material = heartMat;
    lobe.parent = heartRoot;
  });
  const heartBottom = MeshBuilder.CreateCylinder('heart-cone', {
    height: 0.12,
    diameterTop: 0.18,
    diameterBottom: 0.02,
    tessellation: 8,
  }, scene);
  heartBottom.rotation.x = Math.PI;
  heartBottom.position.set(0, -0.01, 0);
  heartBottom.material = heartMat;
  heartBottom.parent = heartRoot;

  // Metadata cho thùng thư để click tương tác
  const tagMailbox = (mesh) => {
    mesh.metadata = {
      type: 'mailbox',
      farmId: farmConfig.id,
      owner: farmConfig.owner,
      isOwner: Boolean(farmConfig.isOwner),
    };
  };
  [mbBox, mbDoor, mbFlag, mbPost, heartBottom].forEach(tagMailbox);

  return {
    root,
    mailbox: mailboxRoot,
    updateSign(newOwner, isOwner = false) {
      tctx.fillStyle = isOwner ? '#fef3c7' : '#f5ebe0';
      tctx.fillRect(0, 0, 512, 160);
      tctx.lineWidth = 8;
      tctx.strokeStyle = isOwner ? '#d97706' : '#8d6e63';
      tctx.strokeRect(6, 6, 500, 148);

      tctx.fillStyle = isOwner ? '#92400e' : '#5d4037';
      tctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
      tctx.textAlign = 'center';
      tctx.textBaseline = 'middle';
      tctx.fillText(isOwner ? '🌾 NÔNG TRẠI CỦA BẠN' : `🏡 LÔ ${farmConfig.lotNumber || '1'}`, 256, 48);

      tctx.fillStyle = isOwner ? '#b45309' : '#3e2723';
      tctx.font = '600 32px "Segoe UI", Arial, sans-serif';
      tctx.fillText(newOwner || 'Nông Dân', 256, 105);
      textTex.update();
    },
    dispose() {
      textTex.dispose();
      root.dispose();
    },
  };
}
