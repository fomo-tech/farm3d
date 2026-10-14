// Coordinates inside a clockwise-rotated canvas, in logical game pixels.
export function logicalPointer(x, y, rect, rotated) {
  return rotated ? { x: y - rect.top, y: rect.right - x }
    : { x: x - rect.left, y: y - rect.top };
}

export function installRotatedPointer(engine, canvas) {
  const original = engine.getInputElementClientRect.bind(engine);
  const rotated = () => document.documentElement.classList.contains('mobile-rotated');
  engine.getInputElementClientRect = () => rotated()
    ? { left: 0, top: 0, right: canvas.clientWidth, bottom: canvas.clientHeight, width: canvas.clientWidth, height: canvas.clientHeight }
    : original();
  const correct = event => {
    if (!rotated()) return;
    const point = logicalPointer(event.clientX, event.clientY, canvas.getBoundingClientRect(), true);
    Object.defineProperties(event, {
      clientX: { configurable: true, value: point.x },
      clientY: { configurable: true, value: point.y },
    });
  };
  const types = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'];
  for (const type of types) canvas.addEventListener(type, correct, true);
  engine.onDisposeObservable.addOnce(() => {
    for (const type of types) canvas.removeEventListener(type, correct, true);
  });
}
