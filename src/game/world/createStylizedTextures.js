import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { addTextureGrain } from './TextureWorkerPool.js';

/**
 * 1. THẢM CỎ ĐỒNG QUÊ COZY GHIBLI & ZELDA (HOÀN TOÀN KHÔNG CÒN BÀN CỜ / PIXEL LƯỚI VUÔNG)
 * Nền cỏ chuyển sắc màu nước mọng mượt, khóm cỏ ba lá uốn lượn, ngọn cỏ non và hoa cúc dại li ti
 */
export function createMeadowTexture(scene, size = 512) {
  // Grain generation reads every pixel. Request a CPU-backed canvas before
  // Babylon opens its context to avoid a synchronous GPU readback at boot.
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (canvas) {
    canvas.width = size;
    canvas.height = size;
    canvas.getContext('2d', { willReadFrequently: true });
  }
  const dynamic = new DynamicTexture(
    'meadow-stylized-texture',
    canvas || { width: size, height: size },
    scene,
    true,
    Texture.TRILINEAR_SAMPLINGMODE
  );
  dynamic.anisotropicFilteringLevel = 16;
  const ctx = dynamic.getContext();

  // 1. Nền cỏ painted low-poly: màu nền sạch, hơi olive và không có gradient
  // theo trục. Một gradient chéo sẽ lộ đường biên mỗi lần texture lặp lại.
  ctx.fillStyle = '#83b861';
  ctx.fillRect(0, 0, size, size);

  // A deterministic random stream keeps the art identical between sessions,
  // while avoiding the visibly mechanical x/y multiplication pattern.
  let seed = 8127;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const rgbaHex = (hex, alpha) => `${hex}${Math.max(0, Math.min(255, Math.round(alpha))).toString(16).padStart(2, '0')}`;

  // A wrapped mark has identical geometry at every tile edge, so the grass
  // stays organic without producing seams or a checkerboard pattern.
  const drawWrappedMark = (x, y, rx, ry, rotation, color, alpha) => {
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const px = x + ox;
        const py = y + oy;
        if (px + rx < 0 || px - rx > size || py + ry < 0 || py - ry > size) continue;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rotation);
        ctx.fillStyle = rgbaHex(color, alpha);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  };

  // 2. Mảng cỏ lớn kiểu hand-painted: tương phản thấp, hình bầu dục mềm và
  // đủ lớn để tạo chiều sâu khi camera kéo xa mà không thành noise.
  const patchColors = ['#659b4c', '#7eb356', '#b4d37d', '#d0e59a'];
  const drawWrappedBlob = (x, y, radius, color, alpha) => {
    const ellipseX = radius * (0.72 + random() * 0.26);
    const ellipseY = radius * (0.58 + random() * 0.3);
    const rotation = random() * Math.PI;
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const px = x + ox;
        const py = y + oy;
        if (px + radius < 0 || px - radius > size || py + radius < 0 || py - radius > size) continue;
        const gradient = ctx.createRadialGradient(px, py, radius * 0.08, px, py, radius);
        gradient.addColorStop(0, rgbaHex(color, alpha));
        gradient.addColorStop(0.62, rgbaHex(color, alpha * 0.52));
        gradient.addColorStop(1, `${color}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(px, py, ellipseX, ellipseY, rotation, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };
  for (let i = 0; i < 28; i++) {
    drawWrappedBlob(
      random() * size,
      random() * size,
      76 + random() * 122,
      patchColors[i % patchColors.length],
      36 + Math.floor(random() * 20)
    );
  }

  // 3. Chi tiết cỏ cực nhỏ, sáng và mềm. Không dùng nét dark stroke vì khi
  // phóng xa chúng biến thành các vệt đen lặp lại, làm nền trông bẩn.
  for (let i = 0; i < 150; i++) {
    const fx = random() * size;
    const fy = random() * size;
    const length = 1.4 + random() * 2.8;
    drawWrappedMark(fx, fy, 0.65 + random() * 0.6, length, -0.7 + random() * 1.4, '#c5df8c', 30 + random() * 18);
  }

  // 4. Cụm lá ba chấm rất thưa để mặt cỏ có điểm nhận diện mà vẫn sạch.
  for (let i = 0; i < 42; i++) {
    const fx = random() * size;
    const fy = random() * size;
    const radius = 1.2 + random() * 1.5;
    for (let leaf = 0; leaf < 3; leaf++) {
      const angle = leaf * (Math.PI * 2 / 3) + random() * 0.24;
      drawWrappedMark(
        fx + Math.cos(angle) * radius * 1.15,
        fy + Math.sin(angle) * radius * 0.8,
        radius * 0.72,
        radius,
        angle,
        leaf === 1 ? '#b9d783' : '#91be61',
        36
      );
    }
  }

  // 5. Vi vân sợi cỏ siêu mịn
  const imgData = ctx.getImageData(0, 0, size, size);
  dynamic.update();
  addTextureGrain(scene, imgData.data, size, size, pixels => {
    if (scene.isDisposed || !dynamic.getInternalTexture()) return;
    ctx.putImageData(new ImageData(pixels, size, size), 0, 0);
    dynamic.update();
  });
  dynamic.wrapU = Texture.WRAP_ADDRESSMODE;
  dynamic.wrapV = Texture.WRAP_ADDRESSMODE;
  dynamic.uScale = 1;
  dynamic.vScale = 1;
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

  // Nền đất vàng mật ong cát mịn ấm áp (Cozy Farmy Sandy Peach Dirt Path)
  ctx.fillStyle = '#f5cb8a';
  ctx.fillRect(0, 0, size, size);

  // Vệt chuyển sắc đất nện tự nhiên
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, 'rgba(254, 237, 213, 0.45)');
  grad.addColorStop(0.5, 'rgba(246, 203, 138, 0.35)');
  grad.addColorStop(1, 'rgba(234, 179, 108, 0.40)');
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
