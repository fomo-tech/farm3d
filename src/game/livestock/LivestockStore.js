export function initialLivestockState() { return []; }

export function livestockSummary(animals) {
  const now = Date.now();
  const hungry = animals.filter(animal => !animal.fedAt || now - animal.fedAt > 6 * 60_000).length;
  const ready = animals.filter(animal => animal.productReadyAt > 0 && animal.productReadyAt <= now).length;
  return { hungry, ready };
}
