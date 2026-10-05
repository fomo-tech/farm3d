/**
 * Single source of truth for the fishing economy and gameplay balance.
 * Edit this file to add rods, bait, tools, zones, fish or animation timings.
 * It is imported by both the browser and the authoritative server.
 */

const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

export const FISHING_CONFIG = deepFreeze({
  version: 2,
  missions: {
    first_fish: {name:'Mẻ cá đầu tiên',kind:'caught',goal:1,coins:20,xp:10},
    lake_angler: {name:'Tay câu chăm chỉ',kind:'caught',goal:10,coins:60,xp:30},
    collector: {name:'Khám phá ba loài cá',kind:'species',goal:3,coins:80,xp:40},
  },
  timePreferences: { carp:['dawn','day'], perch:['day','dusk'], golden_carp:['dawn','dusk'], river_catfish:['night'], river_barb:['day'], sea_mackerel:['dawn'], sea_snapper:['dusk'] },
  defaults: {
    coolerCapacity: 10,
    biteMinMs: 2500,
    biteMaxMs: 6500,
    pendingTimeoutMs: 10000,
    maxCatchLog: 40,
  },

  rods: {
    rod_bamboo: {
      id: 'rod_bamboo',
      kind: 'rod',
      name: 'Cần câu trúc mộc',
      description: 'Cần câu dẻo dai làm thủ công từ tre làng.',
      cost: 150,
      castDistance: 8,
      reelPower: 1,
      durability: 100,
      animation: 'basic_cast',
      icon: 'rod-bamboo',
    },
    rod_carbon: {
      id: 'rod_carbon',
      kind: 'rod',
      name: 'Cần máy Carbon Pro',
      description: 'Cần máy nhẹ, kéo cá lớn ở hồ sâu và ven biển.',
      cost: 650,
      castDistance: 14,
      reelPower: 1.8,
      durability: 180,
      animation: 'pro_cast',
      icon: 'rod-pro',
    },
  },

  baits: {
    bait_worm: {
      id: 'bait_worm',
      kind: 'bait',
      name: 'Mồi trùn quế',
      description: 'Mồi sống thu hút cá chép và cá rô.',
      cost: 50,
      quantity: 10,
      biteSpeed: 1.1,
      rareBonus: 0,
      preferredFish: ['carp', 'perch', 'river_catfish'],
      icon: 'bait-worm',
    },
    bait_lure: {
      id: 'bait_lure',
      kind: 'bait',
      name: 'Mồi ruồi lông vũ',
      description: 'Mồi giả óng ánh tăng cơ hội gặp cá hiếm.',
      cost: 120,
      quantity: 5,
      biteSpeed: 1.3,
      rareBonus: 0.2,
      preferredFish: ['sea_snapper', 'sea_mackerel', 'golden_carp'],
      icon: 'bait-lure',
    },
    fish_chum: {
      id: 'fish_chum',
      kind: 'bait',
      name: 'Thính thơm dụ cá',
      description: 'Thính gom cá thành đàn và tăng cơ hội cá hiếm.',
      cost: 80,
      quantity: 3,
      biteSpeed: 1.45,
      rareBonus: 0.08,
      preferredFish: ['carp', 'river_catfish', 'golden_carp'],
      icon: 'fish-chum',
    },
  },

  tools: {
    cooler_box: {
      id: 'cooler_box',
      kind: 'tool',
      name: 'Thùng ướp lạnh ngư dân',
      description: 'Tăng sức chứa cá sau mỗi chuyến câu.',
      cost: 400,
      capacity: 30,
      icon: 'cooler-box',
    },
  },

  fish: {
    carp: { id: 'carp', name: 'Cá chép hồ', rarity: 'common', price: 24, xp: 5, weight: [0.6, 2.4], zones: ['lake', 'pond'], color: '#f59e0b' },
    perch: { id: 'perch', name: 'Cá rô hồ', rarity: 'common', price: 18, xp: 5, weight: [0.25, 1.1], zones: ['lake', 'pond'], color: '#22c55e' },
    golden_carp: { id: 'golden_carp', name: 'Cá chép vàng', rarity: 'legendary', price: 85, xp: 30, weight: [1.2, 4.8], zones: ['lake', 'pond', 'river', 'sea'], color: '#facc15' },
    river_catfish: { id: 'river_catfish', name: 'Cá trê sông', rarity: 'uncommon', price: 28, xp: 8, weight: [0.8, 3.8], zones: ['river'], color: '#64748b' },
    river_barb: { id: 'river_barb', name: 'Cá mè sông', rarity: 'common', price: 21, xp: 6, weight: [0.7, 2.8], zones: ['river'], color: '#38bdf8' },
    sea_mackerel: { id: 'sea_mackerel', name: 'Cá thu biển', rarity: 'uncommon', price: 38, xp: 10, weight: [1.3, 5.2], zones: ['sea'], color: '#0ea5e9' },
    sea_snapper: { id: 'sea_snapper', name: 'Cá hồng biển', rarity: 'rare', price: 52, xp: 15, weight: [1.1, 4.6], zones: ['sea'], color: '#fb7185' },
  },

  zones: {
    lake: { id: 'lake', name: 'Hồ Pha Lê', fish: ['carp', 'perch', 'golden_carp'], rareChance: 0.06, castDistance: 8 },
    pond: { id: 'pond', name: 'Ao công viên', fish: ['perch', 'carp', 'golden_carp'], rareChance: 0.045, castDistance: 7 },
    river: { id: 'river', name: 'Ven sông', fish: ['river_catfish', 'river_barb', 'golden_carp'], rareChance: 0.05, castDistance: 10 },
    sea: { id: 'sea', name: 'Bờ biển', fish: ['sea_mackerel', 'sea_snapper', 'golden_carp'], rareChance: 0.08, castDistance: 12 },
  },

  animations: {
    basic_cast: { castMs: 950, reelMs: 900, catchMs: 820 },
    pro_cast: { castMs: 780, reelMs: 760, catchMs: 760 },
  },
});

export const FISHING_GEAR = deepFreeze({
  ...FISHING_CONFIG.rods,
  ...FISHING_CONFIG.baits,
  ...FISHING_CONFIG.tools,
});

export const LAKE_FISH = deepFreeze(Object.fromEntries(
  Object.entries(FISHING_CONFIG.fish).map(([id, fish]) => [id, { ...fish, price: fish.price }]),
));

export const FISHING_GEAR_ORDER = Object.freeze([
  ...Object.keys(FISHING_CONFIG.rods),
  ...Object.keys(FISHING_CONFIG.baits),
  ...Object.keys(FISHING_CONFIG.tools),
]);

export function normalizeFishingState(fishing = {}) {
  const rawFish = fishing.fish || {};
  const fish = {};
  Object.entries(rawFish).forEach(([id, value]) => {
    if (typeof value === 'number') {
      fish[id] = { count: Math.max(0, value), totalWeight: Math.max(0, value), maxWeight: 0 };
    } else if (value && typeof value === 'object') {
      fish[id] = {
        count: Math.max(0, Number(value.count) || 0),
        totalWeight: Math.max(0, Number(value.totalWeight) || 0),
        maxWeight: Math.max(0, Number(value.maxWeight) || 0),
      };
    }
  });

  const ownedTools = { ...(fishing.ownedTools || {}) };
  const coolerCapacity = Math.max(
    FISHING_CONFIG.defaults.coolerCapacity,
    Number(fishing.coolerCapacity) || 0,
    ownedTools.cooler_box ? FISHING_CONFIG.tools.cooler_box.capacity : 0,
  );

  return {
    ownedRods: Array.isArray(fishing.ownedRods) ? [...new Set(fishing.ownedRods)] : [],
    equippedRod: fishing.equippedRod || null,
    bait: { ...Object.fromEntries(Object.keys(FISHING_CONFIG.baits).map(id => [id, 0])), ...(fishing.bait || {}) },
    equippedBait: fishing.equippedBait || null,
    equippedTool: fishing.equippedTool || null,
    ownedTools,
    coolerCapacity,
    fish,
    catchLog: Array.isArray(fishing.catchLog) ? fishing.catchLog.slice(-FISHING_CONFIG.defaults.maxCatchLog) : [],
    collection: { ...(fishing.collection || {}) },
    claimedMissions: Array.isArray(fishing.claimedMissions) ? [...new Set(fishing.claimedMissions)] : [],
    pending: fishing.pending?.id ? fishing.pending : null,
    stats: { totalCaught: 0, rareCaught: 0, largestFish: 0, ...(fishing.stats || {}) },
    lastSale: fishing.lastSale || null,
  };
}

export function fishingInventoryCount(fishing = {}) {
  return Object.values(fishing.fish || {}).reduce((total, value) => total + (typeof value === 'number' ? value : Number(value?.count) || 0), 0);
}

export function fishingCapacity(fishing = {}) {
  return Math.max(FISHING_CONFIG.defaults.coolerCapacity, Number(fishing.coolerCapacity) || 0);
}

export function calculateFishSaleValue(fishId, weight = 1) {
  const fish = FISHING_CONFIG.fish[fishId];
  if (!fish) return 0;
  const [minWeight, maxWeight] = fish.weight;
  const normalized = Math.max(0, Math.min(1, (Number(weight) - minWeight) / Math.max(0.01, maxWeight - minWeight)));
  return Math.max(1, Math.round(fish.price * (0.78 + normalized * 0.52)));
}

export function validateFishingConfig(config = FISHING_CONFIG) {
  const errors = [];
  const gearIds = new Set();
  ['rods', 'baits', 'tools'].forEach(group => {
    Object.entries(config[group] || {}).forEach(([id, item]) => {
      if (gearIds.has(id)) errors.push(`Trùng gear id: ${id}`);
      gearIds.add(id);
      if (id !== item.id || !item.name || !Number.isFinite(item.cost) || item.cost < 0) errors.push(`Gear không hợp lệ: ${group}.${id}`);
    });
  });
  Object.entries(config.fish || {}).forEach(([id, fish]) => {
    if (id !== fish.id || !fish.name || !Array.isArray(fish.weight) || fish.weight.length !== 2 || fish.weight[0] <= 0 || fish.weight[1] < fish.weight[0]) errors.push(`Fish không hợp lệ: ${id}`);
    if (!Number.isFinite(fish.price) || fish.price < 0) errors.push(`Fish price không hợp lệ: ${id}`);
  });
  Object.entries(config.zones || {}).forEach(([id, zone]) => {
    if (id !== zone.id || !Array.isArray(zone.fish) || zone.fish.some(fishId => !config.fish[fishId])) errors.push(`Zone không hợp lệ: ${id}`);
  });
  if (errors.length) throw new Error(`Fishing config invalid: ${errors.join('; ')}`);
  return true;
}

validateFishingConfig();
