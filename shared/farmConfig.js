// Single client/server source of truth. Times are milliseconds; prices are coins.
// Stable IDs preserve saved progress; growth times govern both harvest and theft.
function deepFreeze(value) {
  for (const child of Object.values(value)) if (child && typeof child === 'object') deepFreeze(child);
  return Object.freeze(value);
}

export function validateFarmConfig(config) {
  const positive = (value, path) => {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`Farm config: ${path} must be positive`);
  };
  if (!Number.isInteger(config.version) || config.version < 1) throw new Error('Farm config: invalid version');
  for (const [id, crop] of Object.entries(config.crops)) {
    if (crop.id !== id) throw new Error(`Farm config: crop ID mismatch ${id}`);
    for (const key of ['seedCost', 'sellPrice', 'growMs', 'level']) positive(crop[key], `crops.${id}.${key}`);
    if (!/^#[\da-f]{6}$/i.test(crop.color)) throw new Error(`Farm config: invalid crop color ${id}`);
  }
  for (const [id, animal] of Object.entries(config.animals)) {
    if (animal.id !== id) throw new Error(`Farm config: animal ID mismatch ${id}`);
    positive(animal.productMs, `animals.${id}.productMs`);
    positive(animal.hungerMs, `animals.${id}.hungerMs`);
    for (const key of ['buyCost', 'feedCost', 'penCost', 'capacity']) positive(animal[key], `animals.${id}.${key}`);
    if (!Number.isInteger(animal.capacity)) throw new Error(`Farm config: invalid capacity ${id}`);
    if (!config.products[animal.product]) throw new Error(`Farm config: unknown product ${animal.product}`);
  }
  for (const [id, product] of Object.entries(config.products)) positive(product.sellPrice, `products.${id}.sellPrice`);
  for (const key of ['tutorialGrowMs', 'feedBatchCost', 'feedXp', 'collectXp', 'hungerMs']) positive(config.care[key], `care.${key}`);
  for (const key of ['baseCapacity', 'capacityPerLevel', 'upgradeCostPerLevel']) positive(config.buildings.barn[key], `barn.${key}`);
  positive(config.visuals.cropScale, 'visuals.cropScale');
  for (const key of ['walkRadius', 'walkSpeed', 'segments']) positive(config.livestockVisuals[key], `livestockVisuals.${key}`);
  for (const id of Object.keys(config.animals)) {
    if (config.livestockVisuals.slots[id]?.length !== 2 || !config.livestockVisuals.slots[id].every(Number.isFinite)) throw new Error(`Farm config: invalid pen slot ${id}`);
    if (!/^#[\da-f]{6}$/i.test(config.livestockVisuals.colors[id])) throw new Error(`Farm config: invalid animal color ${id}`);
  }
  const stages = config.visuals.stages;
  if (stages.length !== 4 || stages[0] !== 0 || stages[3] !== 1 || stages.some((v, i) => !Number.isFinite(v) || (i > 0 && v <= stages[i - 1]))) throw new Error('Farm config: invalid growth stages');
  for (const expansion of config.expansions) for (const key of ['plots', 'cost', 'level']) positive(expansion[key], `expansions.${key}`);
  for (const key of ['animationMs', 'interactionDistance']) positive(config.security.gate[key], `security.gate.${key}`);
  for (const key of ['interactionMs', 'interactionDistance', 'dailyPlayerLimit', 'dailyFarmLimit', 'normalYield', 'tutorialYield']) positive(config.security.theft[key], `security.theft.${key}`);
  if (!Number.isFinite(config.security.theft.newFarmProtectionMs) || config.security.theft.newFarmProtectionMs < 0) throw new Error('Farm config: invalid new farm protection time');
  if (typeof config.security.gate.defaultOpen !== 'boolean') throw new Error('Farm config: defaultOpen must be boolean');
  if (config.security.theft.requireOpenGate !== true) throw new Error('Farm config: theft requires an open gate');
  if (!(config.security.theft.ownerRetainedRatio >= 0 && config.security.theft.ownerRetainedRatio < 1)) throw new Error('Farm config: invalid owner retained ratio');
  return config;
}

export const FARM_CONFIG = deepFreeze(validateFarmConfig({
  version: 2,
  crops: {
    carrot: { id: 'carrot', name: 'Cà rốt', icon: 'carrot', seedCost: 5, sellPrice: 12, growMs: 1_800_000, level: 1, color: '#ed8b35' },
    wheat: { id: 'wheat', name: 'Lúa mì', icon: 'wheat', seedCost: 12, sellPrice: 30, growMs: 2_700_000, level: 2, color: '#d9ad45' },
    tomato: { id: 'tomato', name: 'Cà chua', icon: 'tomato', seedCost: 20, sellPrice: 52, growMs: 3_600_000, level: 3, color: '#d94c3d' },
    strawberry: { id: 'strawberry', name: 'Dâu tây', icon: 'strawberry', seedCost: 45, sellPrice: 120, growMs: 7_200_000, level: 5, color: '#ca3858' },
    pumpkin: { id: 'pumpkin', name: 'Bí ngô', icon: 'pumpkin', seedCost: 32, sellPrice: 86, growMs: 5_400_000, level: 4, color: '#f97316' },
    melon: { id: 'melon', name: 'Dưa hấu', icon: 'melon', seedCost: 58, sellPrice: 155, growMs: 10_800_000, level: 6, color: '#22c55e' },
    turnip: { id: 'turnip', name: 'Củ cải', icon: 'turnip', seedCost: 76, sellPrice: 205, growMs: 14_400_000, level: 8, color: '#d8b4fe' },
  },
  products: {
    apple: { name: 'Táo', sellPrice: 9 },
    egg: { name: 'Trứng gà', sellPrice: 18 },
    duckEgg: { name: 'Trứng vịt', sellPrice: 24 },
    milk: { name: 'Sữa', sellPrice: 40 },
    wool: { name: 'Len cừu', sellPrice: 48 },
    maturePig: { name: 'Heo trưởng thành', sellPrice: 240 },
  },
  animals: {
    chicken: { id: 'chicken', name: 'Gà', buyCost: 60, feedCost: 5, penCost: 80, capacity: 3, product: 'egg', productMs: 90_000, hungerMs: 360_000 },
    duck: { id: 'duck', name: 'Vịt', buyCost: 80, feedCost: 6, penCost: 100, capacity: 3, product: 'duckEgg', productMs: 120_000, hungerMs: 360_000 },
    pig: { id: 'pig', name: 'Heo', buyCost: 150, feedCost: 12, penCost: 160, capacity: 3, saleOnly: true, product: 'maturePig', productMs: 600_000, hungerMs: 360_000 },
    cow: { id: 'cow', name: 'Bò sữa', buyCost: 220, feedCost: 15, penCost: 200, capacity: 3, product: 'milk', productMs: 180_000, hungerMs: 360_000 },
    sheep: { id: 'sheep', name: 'Cừu', buyCost: 260, feedCost: 18, penCost: 240, capacity: 3, product: 'wool', productMs: 240_000, hungerMs: 360_000 },
  },
  care: { tutorialGrowMs: 8_000, feedBatchCost: 20, feedXp: 5, collectXp: 10, hungerMs: 360_000 },
  buildings: { barn: { baseCapacity: 20, capacityPerLevel: 20, upgradeCostPerLevel: 350 } },
  expansions: [{ plots: 24, cost: 500, level: 3 }, { plots: 36, cost: 1400, level: 6 }, { plots: 48, cost: 3200, level: 9 }],
  visuals: { stages: [0, 0.25, 0.75, 1], cropScale: .85 },
  livestockVisuals: { walkRadius: .12, walkSpeed: .6, segments: 6,
    slots: { chicken: [-1.2, -1], duck: [1.2, -1], pig: [-1.2, 1], cow: [1.2, 1], sheep: [0, 1.7] },
    colors: { chicken: '#dcb27e', duck: '#f3eee3', pig: '#e9a6aa', cow: '#f3eee3', sheep: '#f8fafc' } },
  security: {
    gate: { defaultOpen: false, animationMs: 700, interactionDistance: 3, allowGuestExit: true },
    theft: { enabled: true, requireOpenGate: true, interactionMs: 3000, interactionDistance: 3,
      dailyPlayerLimit: 10, dailyFarmLimit: 6, dailyLimitsEnabled: true, ownerRetainedRatio: 0,
      newFarmProtectionMs: 1_800_000, normalYield: 4, tutorialYield: 1 },
  },
}));

export const CROPS = FARM_CONFIG.crops;
export function farmGrowthStage(progress) {
  return progress >= FARM_CONFIG.visuals.stages[3] ? 3 : progress >= FARM_CONFIG.visuals.stages[2] ? 2 : progress >= FARM_CONFIG.visuals.stages[1] ? 1 : 0;
}
export function farmBarnUpgradeCost(level) { return level * FARM_CONFIG.buildings.barn.upgradeCostPerLevel; }
export function farmBarnCapacity(level) {
  const effectiveLevel = Number.isInteger(level) ? Math.max(1, level) : 1;
  return FARM_CONFIG.buildings.barn.baseCapacity + (effectiveLevel - 1) * FARM_CONFIG.buildings.barn.capacityPerLevel;
}

export function collectFarmProducts(animals, now = Date.now()) {
  const products = {};
  const livestock = animals.map(animal => {
    const definition = FARM_CONFIG.animals[animal.species];
    if (!definition || definition.saleOnly || !Number.isFinite(animal.productReadyAt) || animal.productReadyAt <= 0 || animal.productReadyAt > now) return animal;
    const amount=Math.max(0,(animal.productYield||1)-(animal.stolenAmount||0));
    products[definition.product] = (products[definition.product] || 0) + amount;
    return { ...animal, productReadyAt: 0, stolenAmount:0 };
  });
  return { livestock, products, count: Object.values(products).reduce((sum, count) => sum + count, 0) };
}
