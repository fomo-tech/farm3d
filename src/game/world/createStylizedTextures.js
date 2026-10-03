import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';

/**
 * 1. THẢM CỎ ĐỒNG QUÊ COZY GHIBLI & ZELDA (HOÀN TOÀN KHÔNG CÒN BÀN CỜ / PIXEL LƯỚI VUÔNG)
 * Nền cỏ chuyển sắc êm dịu, khóm cỏ ba lá uốn lượn, ngọn cỏ non và hoa cúc dại li ti
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

  // 1. Nền cỏ chuyển sắc nắng mai êm dịu, ấm áp chuẩn Studio Ghibli
  // Đổ màu gradient bán kính lan tỏa mịn màng, loại bỏ 100% bàn cờ pixel
  const baseGrad = ctx.createRadialGradient(size * 0.5, size * 0.5, 40, size * 0.5, size * 0.5, size * 0.72);
  baseGrad.addColorStop(0, '#92e54d');    // Xanh nõn chuối đón nắng
  baseGrad.addColorStop(0.5, '#7ecd3c');  // Thân cỏ mượt mà
  baseGrad.addColorStop(1, '#70bc33');    // Chân cỏ xanh lục dịu mắt
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  // 2. Những mảng chuyển tông màu hữu cơ tự nhiên (Organic Soft Grass Patches)
  const patchCoords = [
    { x: 0.22, y: 0.28, r: size * 0.26, col: 'rgba(162, 240, 92, 0.45)' },
    { x: 0.75, y: 0.32, r: size * 0.30, col: 'rgba(132, 218, 68, 0.35)' },
    { x: 0.35, y: 0.76, r: size * 0.28, col: 'rgba(155, 235, 84, 0.40)' },
    { x: 0.82, y: 0.82, r: size * 0.24, col: 'rgba(115, 195, 52, 0.32)' },
    { x: 0.50, y: 0.50, r: size * 0.34, col: 'rgba(145, 228, 76, 0.30)' },
  ];
  patchCoords.forEach(p => {
    const radGrad = ctx.createRadialGradient(p.x * size, p.y * size, 12, p.x * size, p.y * size, p.r);
    radGrad.addColorStop(0, p.col);
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(p.x * size, p.y * size, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. Khóm cỏ ba lá (Lucky Clovers) mềm mại, đáng yêu
  const clovers = [
    { x: 0.16, y: 0.16, s: 18, rot: 0.2 },
    { x: 0.34, y: 0.40, s: 16, rot: 1.1 },
    { x: 0.64, y: 0.20, s: 20, rot: -0.5 },
    { x: 0.86, y: 0.42, s: 17, rot: 0.8 },
    { x: 0.14, y: 0.80, s: 19, rot: 2.3 },
    { x: 0.50, y: 0.66, s: 21, rot: -1.2 },
    { x: 0.76, y: 0.86, s: 18, rot: 0.4 },
    { x: 0.92, y: 0.14, s: 15, rot: 1.7 },
  ];

  clovers.forEach(cl => {
    const cx = cl.x * size;
    const cy = cl.y * size;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(cl.rot);

    // Bóng đổ dịu dưới cỏ 3 lá
    ctx.fillStyle = 'rgba(74, 126, 32, 0.32)';
    for (let a = 0; a < 3; a++) {
      const angle = (a * Math.PI * 2) / 3;
      const lx = Math.cos(angle) * (cl.s * 0.8) + 2;
      const ly = Math.sin(angle) * (cl.s * 0.8) + 2;
      ctx.beginPath();
      ctx.arc(lx, ly, cl.s * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3 cánh cỏ hình tròn bo mềm
    ctx.fillStyle = '#5ba826';
    for (let a = 0; a < 3; a++) {
      const angle = (a * Math.PI * 2) / 3;
      const lx = Math.cos(angle) * (cl.s * 0.8);
      const ly = Math.sin(angle) * (cl.s * 0.8);
      ctx.beginPath();
      ctx.arc(lx, ly, cl.s * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }
    // Gân lá sáng
    ctx.strokeStyle = '#8ee244';
    ctx.lineWidth = 2;
    for (let a = 0; a < 3; a++) {
      const angle = (a * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * (cl.s * 0.6), Math.sin(angle) * (cl.s * 0.6));
      ctx.stroke();
    }
    ctx.restore();
  });

  // 4. Những bụi ngọn cỏ mầm uốn lượn (Delicate Curved Blade Tufts)
  const grassTufts = [
    { x: 0.26, y: 0.30, h: 22, rot: -0.1 },
    { x: 0.54, y: 0.16, h: 24, rot: 0.15 },
    { x: 0.70, y: 0.60, h: 20, rot: -0.2 },
    { x: 0.36, y: 0.86, h: 23, rot: 0.25 },
    { x: 0.86, y: 0.70, h: 21, rot: -0.1 },
    { x: 0.08, y: 0.50, h: 25, rot: 0.18 },
  ];
  ctx.lineCap = 'round';
  grassTufts.forEach(t => {
    const tx = t.x * size;
    const ty = t.y * size;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(t.rot);

    // Cánh trái
    ctx.strokeStyle = '#5ba826';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-6, -t.h * 0.6, -10, -t.h);
    ctx.stroke();

    // Cánh giữa
    ctx.strokeStyle = '#6ec532';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(0, -t.h * 0.7, 2, -t.h * 1.15);
    ctx.stroke();

    // Cánh phải
    ctx.strokeStyle = '#529b22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(7, -t.h * 0.5, 12, -t.h * 0.85);
    ctx.stroke();

    ctx.restore();
  });

  // 5. Hoa cúc họa mi dại bé xíu nở rộ trên đồng cỏ (Petite Field Daisies)
  const flowers = [
    { x: 0.24, y: 0.54, petal: '#ffffff', center: '#f59e0b', r: 5 },
    { x: 0.44, y: 0.24, petal: '#fef08a', center: '#ea580c', r: 4.5 },
    { x: 0.68, y: 0.40, petal: '#ffffff', center: '#f59e0b', r: 5.5 },
    { x: 0.82, y: 0.24, petal: '#fbcfe8', center: '#db2777', r: 4 },
    { x: 0.28, y: 0.70, petal: '#ffffff', center: '#f59e0b', r: 4.8 },
    { x: 0.62, y: 0.80, petal: '#bae6fd', center: '#0284c7', r: 4.5 },
    { x: 0.90, y: 0.58, petal: '#ffffff', center: '#f59e0b', r: 5 },
    { x: 0.12, y: 0.34, petal: '#fed7aa', center: '#ea580c', r: 4.2 },
  ];
  flowers.forEach(fl => {
    const fx = fl.x * size;
    const fy = fl.y * size;

    // 5 Cánh hoa nhỏ
    ctx.fillStyle = fl.petal;
    for (let a = 0; a < 5; a++) {
      const angle = (a * Math.PI * 2) / 5;
      const px = fx + Math.cos(angle) * fl.r;
      const py = fy + Math.sin(angle) * fl.r;
      ctx.beginPath();
      ctx.arc(px, py, fl.r * 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
    // Nhụy hoa
    ctx.fillStyle = fl.center;
    ctx.beginPath();
    ctx.arc(fx, fy, fl.r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  });

  dynamic.update();
  dynamic.uScale = 24;
  dynamic.vScale = 24;
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
  ctx.fillStyle = '#ebc784';
  ctx.fillRect(0, 0, size, size);

  // Vệt chuyển sắc đất nện tự nhiên
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, 'rgba(247, 218, 163, 0.45)');
  grad.addColorStop(0.5, 'rgba(226, 185, 114, 0.3)');
  grad.addColorStop(1, 'rgba(215, 172, 102, 0.4)');
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

  // Nền nước ngọc lam trong vắt
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#38bdf8');
  grad.addColorStop(0.5, '#0ea5e9');
  grad.addColorStop(1, '#0284c7');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Vệt bọt sóng uốn lượn phong cách anime
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
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
