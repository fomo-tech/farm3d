import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { PLAY_TOGETHER_PALETTE, createToyMaterial } from '../rendering/PlayTogetherTheme.js';
import { FARM_LOT_SPEC } from '../../../shared/farmLayout.js';

/**
 * Tạo Cổng Nông Trại 3D Tinh Xảo & Biển Tên Sắc Nét và Thùng Thư Giao Lưu Play Together
 */
export function createFarmGateAndSign(scene, farmConfig, shadows = null, onMailboxClick = null) {
  const root = new TransformNode(`farm-gate-root-${farmConfig.id}`, scene);
  root.position.set(
    farmConfig.x + FARM_LOT_SPEC.anchors.gate.x,
    0,
    farmConfig.z + FARM_LOT_SPEC.anchors.gate.z,
  );

  const brassMat = createToyMaterial(scene, 'mat-gate-brass-shiny', '#f59e0b', { specularPower: 96, specularLevel: 0.7 });
  const mailboxRed = createToyMaterial(scene, 'mat-mailbox-cherry-red', '#ef4444', { specularPower: 96, specularLevel: 0.65 });
  const whiteMat = createToyMaterial(scene, 'mat-mailbox-cream-white', PLAY_TOGETHER_PALETTE.farm.fenceWhite, { specularPower: 80 });
  const darkWood = createToyMaterial(scene, 'mat-gate-darkwood-warm', PLAY_TOGETHER_PALETTE.farm.honeyWood);
  const postSpacing = 3.8;

  // The entrance is an open 5.5 m gap. Match the plot's cream fence instead of
  // placing a second, oversized wooden gate model over its posts and path.
  const entranceMat = createToyMaterial(scene, 'mat-farm-entrance-cream', '#f7f0df', { specularLevel: 0.12 });
  [-2.75, 2.75].forEach((x, index) => {
    const post = MeshBuilder.CreateCylinder(`gate-post-${farmConfig.id}-${index}`, { height: 1.12, diameter: 0.22, tessellation: 12 }, scene);
    post.position.set(x, 0.56, -1);
    post.material = entranceMat;
    post.parent = root;
    const cap = MeshBuilder.CreateSphere(`gate-post-cap-${farmConfig.id}-${index}`, { diameter: 0.28, segments: 10 }, scene);
    cap.position.set(x, 1.17, -1);
    cap.material = entranceMat;
    cap.parent = root;
  });

  // One readable sign sits on the left fence wing; the gate opening stays clear.
  const signBoard = MeshBuilder.CreateBox(`gate-sign-board-${farmConfig.id}`, {
    width: 3.2, height: 1.2, depth: 0.12,
  }, scene);
  signBoard.position.set(-4.35, 1.58, 0);
  signBoard.material = createToyMaterial(scene, 'mat-farm-sign-frame', '#79583d', { specularLevel: 0.12 });
  signBoard.parent = root;
  signBoard.metadata = { type: 'land-sign', farmId: farmConfig.id };
  shadows?.addShadowCaster(signBoard);

  const textTex = new DynamicTexture(`sign-tex-${farmConfig.id}`, { width: 1024, height: 384 }, scene, true);
  textTex.anisotropicFilteringLevel = 16;
  const tctx = textTex.getContext();
  tctx.imageSmoothingEnabled = true;
  tctx.imageSmoothingQuality = 'high';
  let lastSignKey = '';
  function drawSign({ owner = '', isOwner = false, available = false, price = null, lotNumber = farmConfig.lotNumber }) {
    const key = `${owner}|${isOwner}|${available}|${price}|${lotNumber}`;
    if (key === lastSignKey) return;
    lastSignKey = key;
    tctx.clearRect(0, 0, 1024, 384);
    tctx.fillStyle = '#fff7e9';
    tctx.fillRect(0, 0, 1024, 384);
    tctx.strokeStyle = '#bb8a52';
    tctx.lineWidth = 15;
    tctx.strokeRect(12, 12, 1000, 360);
    tctx.textAlign = 'center';
    tctx.textBaseline = 'middle';
    tctx.fillStyle = '#684934';
    tctx.font = '800 72px "Segoe UI", Arial, sans-serif';
    tctx.fillText(`LÔ ${lotNumber || '?'}`, 512, 79, 900);
    tctx.fillStyle = '#2f2b27';
    tctx.font = '900 94px "Segoe UI", Arial, sans-serif';
    const headline = available ? (price != null && Number.isFinite(Number(price)) ? `${Number(price).toLocaleString('vi-VN')} XU` : 'ĐANG BÁN') : (owner || 'Đang tải thông tin');
    tctx.fillText(headline, 512, 185, 910);
    tctx.fillStyle = available ? '#277a53' : '#755f4c';
    tctx.font = '800 56px "Segoe UI", Arial, sans-serif';
    tctx.fillText(available ? 'BẤM ĐỂ XEM & MUA' : isOwner ? 'NÔNG TRẠI CỦA BẠN' : owner ? 'ĐÃ CÓ CHỦ' : 'THÔNG TIN LÔ ĐẤT', 512, 303, 900);
    textTex.update();
  }
  drawSign({ owner: farmConfig.isOwner ? farmConfig.owner : '', isOwner: farmConfig.isOwner });

  const signMat = new StandardMaterial(`sign-mat-${farmConfig.id}`, scene);
  signMat.diffuseColor = Color3.Black();
  signMat.emissiveTexture = textTex;
  signMat.specularColor = Color3.Black();
  signMat.disableLighting = true;
  [-0.072, 0.072].forEach((z, index) => {
    const face = MeshBuilder.CreatePlane(`gate-sign-face-${farmConfig.id}-${index}`, { width: 3.10, height: 1.10 }, scene);
    face.position.set(-4.35, 1.58, z);
    face.rotation.y = index ? Math.PI : 0;
    face.material = signMat;
    face.metadata = { type: 'land-sign', farmId: farmConfig.id };
    face.parent = root;
  });
  [-5.45, -3.25].forEach((x, index) => {
    const post = MeshBuilder.CreateCylinder(`gate-sign-post-${farmConfig.id}-${index}`, { height: 1.35, diameter: 0.12, tessellation: 10 }, scene);
    post.position.set(x, 0.68, 0);
    post.material = darkWood;
    post.parent = root;
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
    updateSign(state) {
      drawSign(state);
    },
    dispose() {
      textTex.dispose();
      signMat.dispose();
      root.dispose();
    },
  };
}
