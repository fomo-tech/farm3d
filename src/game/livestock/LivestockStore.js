const keyFor = farmId => `farm-online-3d-livestock-v2:${farmId}`;

const initialAnimals = () => [];

export function loadLivestock(farmId) {
  try {
    const saved = JSON.parse(localStorage.getItem(keyFor(farmId)));
    return Array.isArray(saved) && saved.length ? saved : initialAnimals();
  } catch {
    return initialAnimals();
  }
}

export function feedLivestock(farmId, animals) {
  const now = Date.now();
  const next = animals.map(animal => ({
    ...animal,
    fedAt: now,
    productReadyAt: now + (animal.species === 'chicken' ? 90_000 : 180_000),
  }));
  localStorage.setItem(keyFor(farmId), JSON.stringify(next));
  return next;
}

export function livestockSummary(animals) {
  const now = Date.now();
  const hungry = animals.filter(animal => !animal.fedAt || now - animal.fedAt > 6 * 60_000).length;
  const ready = animals.filter(animal => animal.productReadyAt > 0 && animal.productReadyAt <= now).length;
  return { hungry, ready };
}
