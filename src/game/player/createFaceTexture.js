import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';

/**
 * Original Bình Minh chibi face, drawn as a transparent texture on the head.
 * Large simple features stay legible from the gameplay camera.
 */
export function createFaceTexture(scene, idPrefix, options = {}) {
  const eyeColor = options.eyeColor || '#3b2b28';
  const irisColor = options.irisColor || '#785242';
  const blushColor = options.blushColor || '#ef9e94';
  const smileColor = options.smileColor || '#8d5450';

  const texture = new DynamicTexture(
    `${idPrefix}-face-deluxe-tex`,
    { width: 1024, height: 1024 },
    scene,
    true,
    Texture.TRILINEAR_SAMPLINGMODE
  );
  texture.hasAlpha = true;
  texture.anisotropicFilteringLevel = 16;

  let currentExpression = 'happy';
  let isBlinking = false;
  let blinkTimer = Math.random() * 2 + 2.0;
  const blinkDuration = 0.14;
  let blinkProgress = 0;

  function renderFace(expression = 'happy') {
    const ctx = texture.getContext();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, 1024, 1024);

    const eyeLeftX = 370;
    const eyeRightX = 654;
    const eyeY = 455;
    const eyeRadiusX = 68;
    const eyeRadiusY = 82;

    // 1. MÁ HỒNG OMBRE PHẤN ĐÀO TỰ NHIÊN (SOFT RADIAL GRADIENT BLUSH)
    const blushY = 575;
    const blushRadius = 95;
    [eyeLeftX - 60, eyeRightX + 60].forEach(bx => {
      const grad = ctx.createRadialGradient(bx, blushY, 6, bx, blushY, blushRadius);
      grad.addColorStop(0, 'rgba(239, 158, 148, 0.52)');
      grad.addColorStop(0.45, 'rgba(239, 158, 148, 0.24)');
      grad.addColorStop(1, 'rgba(251, 113, 133, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx, blushY, blushRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = blushColor;
      ctx.beginPath();
      ctx.ellipse(bx, blushY, 42, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

    });

    // 2. NỐT MŨI CHIBI NHỎ XINH (TINY BUTTON NOSE SHADOW)
    ctx.fillStyle = 'rgba(217, 119, 6, 0.28)';
    ctx.beginPath();
    ctx.ellipse(512, 532, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. VẼ ĐÔI MẮT THEO BIỂU CẢM
    if (expression === 'blink') {
      // Mắt nhắm cười hình vòng cung êm ái (⌒ ⌒)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';

      [eyeLeftX, eyeRightX].forEach(ex => {
        ctx.beginPath();
        ctx.arc(ex, eyeY + 12, 56, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        // Lông mi vểnh nhẹ ở đuôi
        const side = ex < 512 ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(ex + side * 48, eyeY + 14);
        ctx.lineTo(ex + side * 66, eyeY - 4);
        ctx.stroke();
      });
    } else if (expression === 'wink') {
      // Mắt trái nhắm, mắt phải mở to
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(eyeLeftX, eyeY + 12, 56, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(eyeLeftX - 48, eyeY + 14);
      ctx.lineTo(eyeLeftX - 66, eyeY - 4);
      ctx.stroke();

      drawChibiEye(ctx, eyeRightX, eyeY, eyeRadiusX, eyeRadiusY, eyeColor, irisColor);
    } else if (expression === 'excited') {
      // Mắt hình ngôi sao lấp lánh (★ ★)
      [eyeLeftX, eyeRightX].forEach(ex => {
        drawStarEye(ctx, ex, eyeY, 68);
      });
    } else if (expression === 'surprised') {
      // Mắt tròn xoe ngạc nhiên
      [eyeLeftX, eyeRightX].forEach(ex => {
        drawSurprisedEye(ctx, ex, eyeY, 78, eyeColor, irisColor);
      });
    } else {
      // Default eyes: a clear expression without small decorative strokes.
      [eyeLeftX, eyeRightX].forEach((ex, idx) => {
        drawChibiEye(ctx, ex, eyeY, eyeRadiusX, eyeRadiusY, eyeColor, irisColor);
      });
    }

    // 4. LÔNG MÀY THANH TÚ
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    if (expression === 'excited') {
      drawArc(ctx, eyeLeftX, eyeY - 105, 48, -0.22);
      drawArc(ctx, eyeRightX, eyeY - 105, 48, 0.22);
    } else if (expression === 'surprised') {
      drawArc(ctx, eyeLeftX, eyeY - 118, 50, 0);
      drawArc(ctx, eyeRightX, eyeY - 118, 50, 0);
    } else {
      drawArc(ctx, eyeLeftX, eyeY - 90, 46, 0.08);
      drawArc(ctx, eyeRightX, eyeY - 90, 46, -0.08);
    }

    // 5. NỤ CƯỜI HOẠT HÌNH PLAY TOGETHER
    drawMouth(ctx, 512, 608, expression, smileColor);

    texture.update();
  }

  function drawChibiEye(ctx, x, y, rx, ry, darkColor, irisTint) {
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // A single warm lower tint and broad catchlight read at small scale.
    ctx.fillStyle = irisTint;
    ctx.beginPath();
    ctx.ellipse(x, y + ry * 0.38, rx * 0.65, ry * 0.36, 0, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x + rx * 0.22, y - ry * 0.28, 19, 24, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStarEye(ctx, cx, cy, spikes) {
    ctx.fillStyle = '#f59e0b';
    drawStar(ctx, cx, cy, 5, spikes, spikes * 0.45);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    drawStar(ctx, cx, cy, 5, spikes * 0.65, spikes * 0.28);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  function drawSurprisedEye(ctx, x, y, r, darkColor, irisTint) {
    const irisGrad = ctx.createRadialGradient(x, y, 5, x, y, r);
    irisGrad.addColorStop(0, darkColor);
    irisGrad.addColorStop(0.7, irisTint);
    irisGrad.addColorStop(1, '#0284c7');

    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + r * 0.32, y - r * 0.32, r * 0.40, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawArc(ctx, x, y, radius, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.arc(0, 0, radius, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
    ctx.restore();
  }

  function drawMouth(ctx, x, y, expression, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (expression === 'surprised') {
      // Miệng chữ O ngạc nhiên
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.ellipse(x, y + 15, 28, 38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Chiếc răng trắng phía trên
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(x - 14, y - 10, 28, 12, 4);
      ctx.fill();
    } else if (expression === 'excited') {
      // Miệng cười hở răng toe toét (Nụ cười chữ D)
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(x, y - 5, 52, 0.1, Math.PI - 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Răng trắng & lưỡi hồng bên trong
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(x - 18, y, 36, 14, 5);
      ctx.fill();

      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.arc(x, y + 36, 22, Math.PI, Math.PI * 2);
      ctx.fill();
    } else {
      // Nụ cười mỉm nhỏ nhắn chữ w/arc đáng yêu với 2 má lúm nhỏ
      ctx.beginPath();
      ctx.arc(x, y - 8, 40, Math.PI * 0.18, Math.PI * 0.82);
      ctx.stroke();

      // Má lúm 2 bên mép
      ctx.fillStyle = color;
      [-36, 36].forEach(dx => {
        ctx.beginPath();
        ctx.arc(x + dx, y + 10, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  renderFace(currentExpression);

  return {
    texture,
    setExpression(expr) {
      if (currentExpression === expr && !isBlinking) return;
      currentExpression = expr;
      renderFace(isBlinking ? 'blink' : currentExpression);
    },
    getExpression() {
      return currentExpression;
    },
    update(delta) {
      blinkTimer -= delta;
      if (blinkTimer <= 0) {
        if (!isBlinking) {
          isBlinking = true;
          blinkProgress = 0;
          renderFace('blink');
        } else {
          blinkProgress += delta;
          if (blinkProgress >= blinkDuration) {
            isBlinking = false;
            blinkTimer = Math.random() * 3.0 + 2.5;
            renderFace(currentExpression);
          }
        }
      }
    },
    dispose() {
      texture.dispose();
    },
  };
}
