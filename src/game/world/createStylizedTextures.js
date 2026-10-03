import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { WORLD_PALETTE } from './worldDesignSystem.js';

/**
 * 1. THẢM CỎ ĐỒNG QUÊ COZY GHIBLI & ZELDA (HOÀN TOÀN KHÔNG CÒN BÀN CỜ / PIXEL LƯỚI VUÔNG)
 * Nền cỏ chuyển sắc màu nước mọng mượt, khóm cỏ ba lá uốn lượn, ngọn cỏ non và hoa cúc dại li ti
 */
export function createMeadowTexture(scene, size = 1024) {
  const dynamic = new DynamicTexture(
    'meadow-stylized-texture',
    { width: size, height: size },
    scene,
    true,
    Texture.TRILINEAR_SAMPLINGMODE
  );
  dynamic.anisotropicFilteringLevel = 16;
  const ctx = dynamic.getContext();

  // 1. Nền cỏ xanh tươi mát mọng nước ngập tràn ánh nắng (Ghibli Radiant Sunny Meadow)
  const baseGrad = ctx.createLinearGradient(0, 0, size, size);
  baseGrad.addColorStop(0.0, '#4ade80');
  baseGrad.addColorStop(0.35, '#22c55e');
  baseGrad.addColorStop(0.7, '#16a34a');
  baseGrad.addColorStop(1.0, '#4ade80');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  // 2. Các vệt loang màu nước tự nhiên (Watercolor organic patches)
  const patchColors = ['#86efac', '#a7f3d0', '#4ade80', '#bef264'];
  for (let i = 0; i < 54; i++) {
    const px = ((i * 137) % size);
    const py = ((i * 241) % size);
    const rad = 45 + (i % 5) * 25;
    const pGrad = ctx.createRadialGradient(px, py, 0, px, py, rad);
    const c = patchColors[i % patchColors.length];
    pGrad.addColorStop(0, c + '3a');
    pGrad.addColorStop(0.7, c + '20');
    pGrad.addColorStop(1, c + '00');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Khóm cỏ ba lá & hoa cúc li ti điểm xuyết
  for (let i = 0; i < 140; i++) {
    const fx = ((i * 73 + 31) % (size - 20)) + 10;
    const fy = ((i * 109 + 47) % (size - 20)) + 10;
    const isFlower = i % 3 === 0;

    if (isFlower) {
      // Hoa cúc vàng/trắng nhỏ xinh
      ctx.fillStyle = (i % 6 === 0) ? '#fef08a' : (i % 6 === 3 ? '#fed7aa' : '#ffffff');
      ctx.beginPath();
      ctx.arc(fx, fy, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(fx, fy, 1.1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Khóm cỏ non
      ctx.fillStyle = '#bbf7d0';
      ctx.fillRect(fx, fy, 2, 4);
      ctx.fillRect(fx + 2, fy - 1, 2, 5);
    }
  }

  // 4. Vi vân sợi cỏ siêu mịn
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = (x / size) * Math.PI * 2;
      const ny = (y / size) * Math.PI * 2;
      const wave = Math.sin(nx * 4) * Math.cos(ny * 4) + Math.sin(nx * 8 + ny * 8) * 0.4;
      const noise = wave * 3.5;

      data[idx] = Math.min(255, Math.max(0, data[idx] + noise * 0.7));
      data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + noise));
      data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + noise * 0.5));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  dynamic.update();
  dynamic.uScale = 64;
  dynamic.vScale = 64;
  return dynamic;
}

/**
 * Vành đai chân trời chuyển sắc sương mù (Horizon Skirt Gradient Texture)
 * Tâm (trong bán kính thế giới): Cỏ xanh ngọc (#4ade80)
 * Viền ngoài (chân trời 3400m): Hòa tan êm ái vào sương mù viễn cảnh (#bae6fd)
 */
export function createHorizonSkirtTexture(scene, size = 512) {
  const dynamic = new DynamicTexture(
    'horizon-skirt-texture',
    { width: size, height: size },
    scene,
    true,
    Texture.TRILINEAR_SAMPLINGMODE
  );
  dynamic.anisotropicFilteringLevel = 16;
  const ctx = dynamic.getContext();

  const half = size * 0.5;
  const grad = ctx.createRadialGradient(half, half, half * 0.2, half, half, half);
  grad.addColorStop(0.00, '#38c172');
  grad.addColorStop(0.28, '#4ade80');
  grad.addColorStop(0.55, '#86efac');
  grad.addColorStop(0.78, '#bae6fd');
  grad.addColorStop(1.00, '#dbeafe');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  dynamic.update();
  return dynamic;
}

/**
 * 2. ĐƯỜNG ĐẤT NỆN MẬT ONG LÀNG QUÊ (HONEY SOIL TRAIL)
 * Mịn màng, ấm áp, có viền sỏi nhẵn và các phiến đá phẳng tự nhiên
 */
export function createHoneyPathTexture(scene, size = 1024) {
  const dynamic = new DynamicTexture(
    'honey-path-stylized-texture',
    { width: size, height: size },
    scene,
    true,
    Texture.TRILINEAR_SAMPLINGMODE
  );
  dynamic.anisotropicFilteringLevel = 16;
  const ctx = dynamic.getContext();

  // Nền đất vàng mật ong ấm áp
  ctx.fillStyle = WORLD_PALETTE.roadWarm;
  ctx.fillRect(0, 0, size, size);

  // Vệt chuyển sắc đất nện tự nhiên
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, 'rgba(250, 220, 199, 0.36)');
  grad.addColorStop(0.5, 'rgba(214, 166, 146, 0.22)');
  grad.addColorStop(1, 'rgba(188, 134, 116, 0.28)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Các viên đá cuội dẹt bo tròn màu kem bơ nhạt rải tự nhiên
  const stones = [
    { x: 0.15, y: 0.20, rx: 36, ry: 24, rot: 0.2, col: '#fdf3de' },
    { x: 0.45, y: 0.15, rx: 46, ry: 30, rot: -0.15, col: '#f6e4c3' },
    { x: 0.80, y: 0.25, rx: 34, ry: 22, rot: 0.3, col: '#faeed2' },
    { x: 0.30, y: 0.50, rx: 42, ry: 28, rot: 0.1, col: '#fbf0d8' },
    { x: 0.65, y: 0.48, rx: 50, ry: 32, rot: -0.25, col: '#f7e3bf' },
    { x: 0.18, y: 0.78, rx: 36, ry: 24, rot: 0.35, col: '#f8e7c8' },
    { x: 0.52, y: 0.82, rx: 44, ry: 28, rot: -0.1, col: '#fdf4df' },
    { x: 0.85, y: 0.72, rx: 38, ry: 26, rot: 0.2, col: '#f6e4c2' },
  ];

  stones.forEach(st => {
    const px = st.x * size;
    const py = st.y * size;

    // Bóng mềm hổ phách
    ctx.fillStyle = 'rgba(189, 142, 73, 0.35)';
    ctx.beginPath();
    ctx.ellipse(px + 2, py + 3, st.rx, st.ry, st.rot, 0, Math.PI * 2);
    ctx.fill();

    // Thân đá kem bơ
    ctx.fillStyle = st.col;
    ctx.beginPath();
    ctx.ellipse(px, py, st.rx, st.ry, st.rot, 0, Math.PI * 2);
    ctx.fill();

    // Điểm sáng trên đỉnh đá
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(px - st.rx * 0.2, py - st.ry * 0.25, st.rx * 0.45, st.ry * 0.35, st.rot, 0, Math.PI * 2);
    ctx.fill();
  });

  // Hạt cát sỏi nhỏ li ti
  ctx.fillStyle = 'rgba(202, 155, 87, 0.5)';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 123 + 17) % size;
    const sy = (i * 179 + 43) % size;
    ctx.beginPath();
    ctx.arc(sx, sy, (i % 2 === 0 ? 3 : 2), 0, Math.PI * 2);
    ctx.fill();
  }

  dynamic.update();
  dynamic.uScale = 6;
  dynamic.vScale = 6;
  return dynamic;
}

/**
 * 3. MẶT NƯỚC HỒ & SUỐI TRONG VẮT (CRYSTAL WATER)
 */
export function createWaterTexture(scene, size = 512) {
  const dynamic = new DynamicTexture(
    'water-stylized-texture',
    { width: size, height: size },
    scene,
    true,
    Texture.TRILINEAR_SAMPLINGMODE
  );
  dynamic.anisotropicFilteringLevel = 16;
  const ctx = dynamic.getContext();

  // Nền nước ngọc lam trong vắt óng ánh nắng phong cách anime
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0.0, '#67e8f9'); // Cyan ngọc bích sáng
  grad.addColorStop(0.4, '#38bdf8'); // Xanh da trời sâu
  grad.addColorStop(0.8, '#0284c7'); // Lam ngọc
  grad.addColorStop(1.0, '#0369a1'); // Nước hồ sâu thẳm
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Vệt bọt sóng uốn lượn phong cách anime
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  for (let y = 30; y < size; y += 65) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += 28) {
      const dy = Math.sin((x / 36) + (y / 48)) * 12;
      ctx.lineTo(x, y + dy);
    }
    ctx.stroke();
  }

  // Điểm lấp lánh ánh kim cương phản chiếu mặt trời
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 28; i++) {
    const px = (i * 127 + 33) % size;
    const py = (i * 181 + 17) % size;
    const r = (i % 3 === 0) ? 3.5 : 2.0;

    ctx.beginPath();
    ctx.moveTo(px, py - r * 2.2);
    ctx.lineTo(px + r * 1.2, py);
    ctx.lineTo(px, py + r * 2.2);
    ctx.lineTo(px - r * 1.2, py);
    ctx.closePath();
    ctx.fill();
  }

  dynamic.update();
  dynamic.uScale = 4;
  dynamic.vScale = 4;
  return dynamic;
}

/**
 * 4. PHIẾN ĐÁ LÁT ĐƯỜNG CHÂU ÂU BO TRÒN (ORGANIC FLAGSTONES)
 * Xóa bỏ hoàn toàn dạng lưới chữ nhật 10x10, thay bằng phiến đá vôi ấm áp so le mềm mại
 */
export function createCobblestoneTexture(scene, size = 1024) {
  const dynamic = new DynamicTexture(
    'cobble-stylized-texture',
    { width: size, height: size },
    scene,
    true,
    Texture.TRILINEAR_SAMPLINGMODE
  );
  dynamic.anisotropicFilteringLevel = 16;
  const ctx = dynamic.getContext();

  // Nền vữa sa thạch ấm áp
  ctx.fillStyle = '#cdba9e';
  ctx.fillRect(0, 0, size, size);

  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, 'rgba(189, 168, 138, 0.4)');
  grad.addColorStop(1, 'rgba(156, 136, 107, 0.5)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Bảng màu đá vôi Pháp cổ điển
  const stoneTiers = ['#f4ede2', '#eae0cf', '#ded0bc', '#ebdcc6', '#f0e5d1', '#e4d3ba'];

  const rows = 6;
  const rowH = size / rows;
  for (let r = 0; r < rows; r++) {
    const isOdd = r % 2 === 1;
    const cols = isOdd ? 5 : 6;
    const colW = size / cols;
    const offset = isOdd ? colW * 0.45 : 0;

    for (let c = -1; c <= cols; c++) {
      const bx = c * colW + offset;
      const by = r * rowH;
      const padding = 10;
      const sw = colW - padding * 1.4;
      const sh = rowH - padding * 1.3;

      const seed = (r * 13 + c * 37) % stoneTiers.length;
      const col = stoneTiers[Math.abs(seed)];

      // Bóng chìm dưới viên đá
      ctx.fillStyle = 'rgba(112, 94, 73, 0.42)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bx + 4, by + 5, sw, sh, 16);
      } else {
        ctx.rect(bx + 4, by + 5, sw, sh);
      }
      ctx.fill();

      // Thân đá lát đường
      ctx.fillStyle = col;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bx, by, sw, sh, 16);
      } else {
        ctx.rect(bx, by, sw, sh);
      }
      ctx.fill();

      // Vát sáng mềm trên bề mặt đá
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bx + 5, by + 4, sw - 10, sh * 0.4, 10);
      } else {
        ctx.rect(bx + 5, by + 4, sw - 10, sh * 0.4);
      }
      ctx.fill();

      // Đốm rêu nhỏ ở góc kẽ
      if ((r + c) % 3 === 0) {
        ctx.fillStyle = 'rgba(101, 155, 52, 0.6)';
        ctx.beginPath();
        ctx.arc(bx + sw - 6, by + sh - 6, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  dynamic.update();
  dynamic.uScale = 6;
  dynamic.vScale = 6;
  return dynamic;
}

export const createCobblePathTexture = createCobblestoneTexture;

/**
 * 5. BÃI CÁT BIỂN BÌNH MINH (GOLDEN COASTAL SAND)
 */
export function createSandTexture(scene, size = 512) {
  const dynamic = new DynamicTexture(
    'sand-stylized-texture',
    { width: size, height: size },
    scene,
    true,
    Texture.TRILINEAR_SAMPLINGMODE
  );
  dynamic.anisotropicFilteringLevel = 16;
  const ctx = dynamic.getContext();

  ctx.fillStyle = '#f5d89f';
  ctx.fillRect(0, 0, size, size);

  // Vệt sóng cát mềm mại
  ctx.strokeStyle = '#eec780';
  ctx.lineWidth = 4;
  for (let y = 20; y < size; y += 45) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += 40) {
      ctx.lineTo(x, y + Math.sin(x / 30) * 6);
    }
    ctx.stroke();
  }

  // Vỏ sò nhỏ li ti
  const shellColors = ['#fff0ea', '#ffc5b2', '#ffe6a3'];
  for (let i = 0; i < 16; i++) {
    const sx = (i * 97) % size;
    const sy = (i * 139) % size;
    ctx.fillStyle = shellColors[i % shellColors.length];
    ctx.beginPath();
    ctx.arc(sx, sy, 3, 0, Math.PI);
    ctx.fill();
  }

  dynamic.update();
  dynamic.uScale = 6;
  dynamic.vScale = 6;
  return dynamic;
}

/**
 * 6. ĐẤT MÙN NÔNG TRẠI MÀU MỠ (RICH FERTILE TILLED SOIL)
 * Dùng cho các luống ruộng cày xới, triệt tiêu cảm giác khối lập phương thô kệch
 */
export function createSoilTexture(scene, size = 512, isWatered = false) {
  const name = isWatered ? 'soil-watered-texture' : 'soil-dry-texture';
  const dynamic = new DynamicTexture(
    name,
    { width: size, height: size },
    scene,
    true,
    Texture.TRILINEAR_SAMPLINGMODE
  );
  dynamic.anisotropicFilteringLevel = 16;
  const ctx = dynamic.getContext();

  // Nền đất mùn hữu cơ sẫm màu
  const baseColor = isWatered ? '#3b2514' : '#684529';
  const furrowDark = isWatered ? '#261609' : '#4b2f18';
  const crumbLight = isWatered ? '#50321c' : '#885c39';

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Luống cày xới luân phiên
  const furrows = 5;
  const fHeight = size / furrows;
  for (let f = 0; f < furrows; f++) {
    const fy = f * fHeight;
    ctx.fillStyle = furrowDark;
    ctx.fillRect(0, fy + fHeight * 0.65, size, fHeight * 0.35);

    ctx.fillStyle = crumbLight;
    ctx.fillRect(0, fy + 4, size, fHeight * 0.38);
  }

  // Hạt đất xốp li ti
  for (let i = 0; i < 48; i++) {
    const cx = (i * 73) % size;
    const cy = (i * 97) % size;
    const cr = (i % 3 === 0) ? 4 : 2.5;
    ctx.fillStyle = (i % 2 === 0) ? crumbLight : furrowDark;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ánh ẩm ướt lấp lánh nếu được tưới nước
  if (isWatered) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    for (let i = 0; i < 24; i++) {
      const gx = (i * 109 + 31) % size;
      const gy = (i * 61 + 19) % size;
      ctx.beginPath();
      ctx.ellipse(gx, gy, 5, 2.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  dynamic.update();
  return dynamic;
}
