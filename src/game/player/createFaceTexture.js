import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { CHARACTER_RENDER_CONFIG } from '../../../shared/characterConfig.js';

/**
 * High-end Play Together style chibi facial feature rendering system.
 * Supports customizable eyes, iris colors, nose styles, mouths, blush shapes, and expressions.
 */
export function createFaceTexture(scene, idPrefix, options = {}) {
  let eyeType = options.eyeType || 'classic';
  let eyeColor = options.eyeColor || '#3b2b28';
  let irisColor = options.irisColor || '#785242';
  let noseType = options.noseType || 'dot';
  let mouthType = options.mouthType || 'smile';
  let blushType = options.blushType || 'peach';
  let blushColor = options.blushColor || '#ef9e94';
  let smileColor = options.smileColor || '#55302b';

  const texture = new DynamicTexture(
    `${idPrefix}-face-deluxe-tex`,
    { width: CHARACTER_RENDER_CONFIG.geometryBudget.faceTextureSize, height: CHARACTER_RENDER_CONFIG.geometryBudget.faceTextureSize },
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
    const drawScale = CHARACTER_RENDER_CONFIG.geometryBudget.faceTextureSize / 1024;
    ctx.setTransform(drawScale, 0, 0, drawScale, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, 1024, 1024);

    const eyeLeftX = 340;
    const eyeRightX = 684;
    const eyeY = 455;
    const eyeRadiusX = 90;
    const eyeRadiusY = 108;

    // 1. MÁ HỒNG CHIBI (BLUSH)
    const blushY = 575;
    const blushRadius = 95;
    if (blushType === 'peach') {
      [eyeLeftX - 60, eyeRightX + 60].forEach(bx => {
        const grad = ctx.createRadialGradient(bx, blushY, 6, bx, blushY, blushRadius);
        grad.addColorStop(0, 'rgba(239, 158, 148, 0.55)');
        grad.addColorStop(0.45, 'rgba(239, 158, 148, 0.25)');
        grad.addColorStop(1, 'rgba(251, 113, 133, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, blushY, blushRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.14;
        ctx.fillStyle = blushColor;
        ctx.beginPath();
        ctx.ellipse(bx, blushY, 42, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    } else if (blushType === 'heart') {
      [eyeLeftX - 60, eyeRightX + 60].forEach(bx => {
        drawHeart(ctx, bx, blushY - 24, 48, '#fb7185');
        drawHeart(ctx, bx + (bx < 512 ? -28 : 28), blushY - 8, 30, '#f43f5e');
      });
    } else if (blushType === 'drunk') {
      // Dải má hồng ngang sống mũi say say đáng yêu
      const grad = ctx.createLinearGradient(eyeLeftX - 70, blushY, eyeRightX + 70, blushY);
      grad.addColorStop(0, 'rgba(244, 63, 94, 0)');
      grad.addColorStop(0.2, 'rgba(244, 63, 94, 0.42)');
      grad.addColorStop(0.5, 'rgba(251, 113, 133, 0.55)');
      grad.addColorStop(0.8, 'rgba(244, 63, 94, 0.42)');
      grad.addColorStop(1, 'rgba(244, 63, 94, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(eyeLeftX - 70, blushY - 28, (eyeRightX - eyeLeftX) + 140, 56, 28);
      ctx.fill();
    }

    // 2. MŨI CHIBI (NOSE)
    if (noseType === 'dot') {
      ctx.fillStyle = 'rgba(217, 119, 6, 0.32)';
      ctx.beginPath();
      ctx.ellipse(512, 532, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (noseType === 'cat_nose') {
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(503, 528);
      ctx.lineTo(521, 528);
      ctx.lineTo(512, 538);
      ctx.closePath();
      ctx.fill();
    }

    // 3. ĐÔI MẮT THEO BIỂU CẢM & LOẠI MẮT
    if (expression === 'blink') {
      // Mắt nhắm vòng cung (⌒ ⌒)
      drawBlinkEyes(ctx, eyeLeftX, eyeRightX, eyeY);
    } else if (expression === 'wink') {
      drawBlinkEye(ctx, eyeLeftX, eyeY, -1);
      drawEyeByType(ctx, eyeRightX, eyeY, eyeRadiusX, eyeRadiusY, eyeType, eyeColor, irisColor, 1);
    } else if (expression === 'excited') {
      [eyeLeftX, eyeRightX].forEach(ex => drawStarEye(ctx, ex, eyeY, 68));
    } else if (expression === 'surprised') {
      [eyeLeftX, eyeRightX].forEach(ex => drawSurprisedEye(ctx, ex, eyeY, 78, eyeColor, irisColor));
    } else {
      // Normal expression: render based on chosen eyeType
      drawEyeByType(ctx, eyeLeftX, eyeY, eyeRadiusX, eyeRadiusY, eyeType, eyeColor, irisColor, -1);
      drawEyeByType(ctx, eyeRightX, eyeY, eyeRadiusX, eyeRadiusY, eyeType, eyeColor, irisColor, 1);
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

    // 5. KHUÔN MIỆNG
    if (expression === 'surprised') {
      drawMouthSurprised(ctx, 512, 608, smileColor);
    } else if (expression === 'excited') {
      drawMouthExcited(ctx, 512, 608, smileColor);
    } else {
      // Normal mouth style
      if (mouthType === 'beaming') {
        drawMouthExcited(ctx, 512, 608, smileColor);
      } else if (mouthType === 'cat_mouth') {
        drawCatMouth(ctx, 512, 604, smileColor);
      } else if (mouthType === 'surprised_o') {
        drawMouthSurprised(ctx, 512, 608, smileColor);
      } else if (mouthType === 'tongue') {
        drawTongueMouth(ctx, 512, 604, smileColor);
      } else {
        // Classic smile
        drawMouthClassic(ctx, 512, 608, smileColor);
      }
    }

    texture.update();
  }

  function drawBlinkEye(ctx, ex, eyeY, side) {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(ex, eyeY + 12, 56, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ex + side * 48, eyeY + 14);
    ctx.lineTo(ex + side * 66, eyeY - 4);
    ctx.stroke();
  }

  function drawBlinkEyes(ctx, leftX, rightX, eyeY) {
    drawBlinkEye(ctx, leftX, eyeY, -1);
    drawBlinkEye(ctx, rightX, eyeY, 1);
  }

  function drawEyeByType(ctx, x, y, rx, ry, type, darkColor, irisTint, side) {
    if (type === 'smile_arc') {
      drawBlinkEye(ctx, x, y, side);
    } else if (type === 'sparkle') {
      drawSparkleEye(ctx, x, y, rx, ry, darkColor, irisTint);
    } else if (type === 'cat_eyes') {
      drawCatEye(ctx, x, y, rx, ry, darkColor, irisTint, side);
    } else if (type === 'surprised') {
      drawSurprisedEye(ctx, x, y, 78, darkColor, irisTint);
    } else {
      // Classic
      drawChibiEye(ctx, x, y, rx, ry, darkColor, irisTint);
    }
  }

  function drawChibiEye(ctx, x, y, rx, ry, darkColor, irisTint) {
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = irisTint;
    ctx.beginPath();
    ctx.ellipse(x, y + ry * 0.38, rx * 0.65, ry * 0.36, 0, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x + rx * 0.22, y - ry * 0.28, 19, 24, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSparkleEye(ctx, x, y, rx, ry, darkColor, irisTint) {
    // Sclera/outer
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vibrant gradient iris
    const grad = ctx.createRadialGradient(x, y + ry * 0.2, 5, x, y, ry);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, irisTint);
    grad.addColorStop(1, darkColor);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y + ry * 0.15, rx * 0.8, ry * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();

    // Diamond / Star highlights
    ctx.fillStyle = '#ffffff';
    drawStar(ctx, x + rx * 0.25, y - ry * 0.25, 4, 22, 9);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - rx * 0.25, y + ry * 0.35, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCatEye(ctx, x, y, rx, ry, darkColor, irisTint, side) {
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = irisTint;
    ctx.beginPath();
    ctx.ellipse(x, y, rx * 0.86, ry * 0.86, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cat slit pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(x, y, rx * 0.32, ry * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x + rx * 0.25, y - ry * 0.3, 16, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyeliner flick
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + side * (rx - 4), y - ry * 0.05);
    ctx.lineTo(x + side * (rx + 24), y - ry * 0.42);
    ctx.stroke();
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

  function drawHeart(ctx, x, y, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    const d = size;
    ctx.moveTo(x, y + d * 0.3);
    ctx.bezierCurveTo(x, y, x - d / 2, y, x - d / 2, y + d * 0.3);
    ctx.bezierCurveTo(x - d / 2, y + d * 0.6, x, y + d * 0.8, x, y + d);
    ctx.bezierCurveTo(x, y + d * 0.8, x + d / 2, y + d * 0.6, x + d / 2, y + d * 0.3);
    ctx.bezierCurveTo(x + d / 2, y, x, y, x, y + d * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
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

  function drawMouthClassic(ctx, x, y, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.arc(x, y - 16, 65, Math.PI * 0.12, Math.PI * 0.88);
    ctx.stroke();

    ctx.fillStyle = color;
    [-60, 60].forEach(dx => {
      ctx.beginPath();
      ctx.arc(x + dx, y + 10, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawMouthExcited(ctx, x, y, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.fillStyle = '#52352f';
    ctx.beginPath();
    ctx.ellipse(x, y - 5, 84, 48, 0, 0.1, Math.PI - 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(x - 65, y - 1, 130, 19, 6);
    ctx.fill();

    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.arc(x, y + 36, 22, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  function drawMouthSurprised(ctx, x, y, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.ellipse(x, y + 15, 28, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(x - 14, y - 10, 28, 12, 4);
    ctx.fill();
  }

  function drawCatMouth(ctx, x, y, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x - 20, y - 4, 20, 0.15 * Math.PI, 0.88 * Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 20, y - 4, 20, 0.12 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();
  }

  function drawTongueMouth(ctx, x, y, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';

    // Base grin
    ctx.beginPath();
    ctx.arc(x, y - 8, 38, Math.PI * 0.18, Math.PI * 0.82);
    ctx.stroke();

    // Cheeky tongue
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(x + 12, y + 16, 16, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  renderFace(currentExpression);

  return {
    texture,
    updateFeatures(features = {}) {
      if (features.eyeType !== undefined) eyeType = features.eyeType;
      if (features.eyeColor !== undefined) {
        eyeColor = features.eyeColor;
        irisColor = features.irisColor || features.eyeColor;
      }
      if (features.noseType !== undefined) noseType = features.noseType;
      if (features.mouthType !== undefined) mouthType = features.mouthType;
      if (features.blushType !== undefined) blushType = features.blushType;
      renderFace(isBlinking ? 'blink' : currentExpression);
    },
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
