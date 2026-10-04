// Coin prices. Restart the server after editing; clients display server prices.
export function validateLandConfig(config) {
  for (const key of ['minPrice', 'maxPrice', 'roundingStep']) {
    if (!Number.isSafeInteger(config[key]) || config[key] <= 0) throw new Error(`Land config: invalid ${key}`);
  }
  if (config.maxPrice < config.minPrice) throw new Error('Land config: maxPrice must be >= minPrice');
  if (![config.center?.x, config.center?.z].every(Number.isFinite)) throw new Error('Land config: invalid center');
  for (const [id, factor] of Object.entries(config.villageMultipliers)) {
    if (!Number.isFinite(factor) || factor <= 0) throw new Error(`Land config: invalid multiplier ${id}`);
  }
  for (const [id, price] of Object.entries(config.overrides)) {
    if (!/^farm_\d{6}$/.test(id) || !Number.isSafeInteger(price) || price <= 0) throw new Error(`Land config: invalid override ${id}`);
  }
  return config;
}

export const LAND_CONFIG = Object.freeze(validateLandConfig({
  minPrice: 150,
  maxPrice: 2000,
  roundingStep: 50,
  center: Object.freeze({ x: 0, z: 0 }),
  // Village IDs, for example: 'binh-minh': 1.2. Applied after distance pricing.
  villageMultipliers: Object.freeze({}),
  // Exact coin prices; bypass distance, multipliers, rounding and bounds.
  // Example: farm_000001: 1800. Only changes future purchases.
  overrides: Object.freeze({}),
}));

export function landPricingRadius(lots, config = LAND_CONFIG) {
  return Math.max(1, ...lots.map(lot => Math.hypot(lot.x - config.center.x, lot.z - config.center.z)));
}

export function calculateLandPrice(lot, radius, config = LAND_CONFIG) {
  if (!Number.isFinite(lot.x) || !Number.isFinite(lot.z) || !Number.isFinite(radius) || radius <= 0) throw new Error('Land pricing: invalid geometry');
  if (Object.hasOwn(config.overrides, lot.farmId)) return config.overrides[lot.farmId];
  const distance = Math.hypot(lot.x - config.center.x, lot.z - config.center.z);
  const proximity = Math.max(0, Math.min(1, 1 - distance / radius));
  // Preserve legacy rounding of the premium, not the entire base price.
  const base = config.minPrice + Math.round((config.maxPrice - config.minPrice) * proximity / config.roundingStep) * config.roundingStep;
  const multiplier = config.villageMultipliers[lot.villageId] ?? 1;
  const adjusted = multiplier === 1 ? base : Math.round(base * multiplier / config.roundingStep) * config.roundingStep;
  const price = Math.max(config.minPrice, Math.min(config.maxPrice, adjusted));
  if (!Number.isSafeInteger(price)) throw new Error('Land pricing: unsafe price');
  return price;
}
