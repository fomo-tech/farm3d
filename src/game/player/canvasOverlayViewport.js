// HTML overlays share the canvas parent's logical coordinate system. A rotated
// getBoundingClientRect() is in physical screen axes and cannot be projected here.
export function canvasOverlayViewport(canvas) {
  return { left: canvas.offsetLeft || 0, top: canvas.offsetTop || 0,
    width: canvas.clientWidth, height: canvas.clientHeight };
}
