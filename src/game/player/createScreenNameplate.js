import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector.js';

const canvasRects = new WeakMap();
function cachedCanvasRect(canvas, now) {
  let entry = canvasRects.get(canvas);
  if (!entry || now - entry.at > 100) {
    entry = { at: now, rect: canvas.getBoundingClientRect() };
    canvasRects.set(canvas, entry);
  }
  return entry.rect;
}

export function createScreenNameplate(scene, parent, initialName, { local = true } = {}) {
  const canvas = scene.getEngine().getRenderingCanvas();
  const label = document.createElement('span');
  label.className = `player-name-label player-name-label--${local ? 'local' : 'remote'}`;
  label.style.cssText = 'position:fixed;z-index:5;pointer-events:none;white-space:nowrap;max-width:220px;overflow:hidden;text-overflow:ellipsis;font:700 14px/20px "Segoe UI",system-ui,sans-serif;background:transparent;padding:2px;border:0;text-shadow:-1px -1px 0 #34434e,1px -1px 0 #34434e,-1px 1px 0 #34434e,1px 1px 0 #34434e,0 1px 0 #34434e;';
  label.style.transform = 'translate(-50%, -100%)';
  label.style.willChange = 'transform';
  label.style.color = local ? '#ffe58a' : '#ffffff';
  canvas.parentElement.appendChild(label);
  const anchor = new Vector3(0, 2.52, 0);
  let disposed = false;
  const setName = value => {
    const name = String(value || 'Nông dân').trim().slice(0, 24) || 'Nông dân';
    label.textContent = name;
    label.title = `${local ? 'Bạn' : 'Người chơi khác'}: ${name}`;
  };
  setName(initialName);
  let lastUpdate = -Infinity;
  let previousFont, previousLeft, previousTop;
  const observer = scene.onBeforeRenderObservable.add(() => {
    const now = performance.now();
    if (now - lastUpdate < (local ? 33 : 66)) return;
    lastUpdate = now;
    const camera = scene.activeCamera;
    if (!camera || !parent.isEnabled()) { label.hidden = true; return; }
    const rect = cachedCanvasRect(canvas, now);
    const world = Vector3.TransformCoordinates(anchor, parent.computeWorldMatrix(true));
    // Keep distant players from filling the screen with full-size labels.
    if (!local && Vector3.DistanceSquared(camera.globalPosition, world) > 45 * 45) {
      label.hidden = true;
      return;
    }
    const point = Vector3.Project(world, Matrix.Identity(), scene.getTransformMatrix(), camera.viewport.toGlobal(rect.width, rect.height));
    label.hidden = !Number.isFinite(point.x) || point.z < 0 || point.z > 1
      || point.x < 0 || point.x > rect.width || point.y < 0 || point.y > rect.height;
    if (label.hidden) return;
    // Match world-space size without scaling a rasterized CSS text layer.
    const depth = Math.abs(Vector3.TransformCoordinates(world, camera.getViewMatrix()).z);
    const projectedSize = 0.26 * rect.height * Math.abs(camera.getProjectionMatrix().m[5]) / (2 * Math.max(0.01, depth));
    if (projectedSize < 6) { label.hidden = true; return; }
    const fontSize = Math.min(16, Math.round(projectedSize));
    if (fontSize !== previousFont) {
      label.style.fontSize = `${fontSize}px`;
      label.style.lineHeight = `${fontSize + 4}px`;
      previousFont = fontSize;
    }
    // Integer CSS coordinates keep text out of a fractional transform layer.
    const left = Math.round(rect.left + point.x), top = Math.round(rect.top + point.y - 3);
    if (left !== previousLeft) { label.style.left = `${left}px`; previousLeft = left; }
    if (top !== previousTop) { label.style.top = `${top}px`; previousTop = top; }
  });
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    scene.onBeforeRenderObservable.remove(observer);
    label.remove();
  };
  scene.onDisposeObservable.addOnce(dispose);
  return { mesh: null, setName, dispose };
}
