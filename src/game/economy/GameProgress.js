export const CROPS = Object.freeze({
  carrot: { id: 'carrot', name: 'Cà rốt', icon: 'carrot', seedCost: 5, sellPrice: 12, growMs: 60_000, level: 1, color: '#ed8b35' },
  wheat: { id: 'wheat', name: 'Lúa mì', icon: 'wheat', seedCost: 12, sellPrice: 30, growMs: 180_000, level: 2, color: '#d9ad45' },
  tomato: { id: 'tomato', name: 'Cà chua', icon: 'tomato', seedCost: 20, sellPrice: 52, growMs: 300_000, level: 3, color: '#d94c3d' },
  strawberry: { id: 'strawberry', name: 'Dâu tây', icon: 'strawberry', seedCost: 45, sellPrice: 120, growMs: 600_000, level: 5, color: '#ca3858' },
});

export const ONBOARDING_STEPS = Object.freeze({
  CHARACTER_CREATION: 0,
  MEET_ELDER: 1,
  FIRST_PLANT: 2,
  EXPLAIN_SYSTEMS: 3,
  DELIVER_ORDER: 4,
  CLAIM_REWARD: 5,
  COMPLETED: 6,
});

export const ORDERS = Object.freeze([
  { id: 'starter', title: 'Bếp nhà Hoa Mai', items: { carrot: 1 }, coins: 65, xp: 40 },
  { id: 'bakery', title: 'Tiệm bánh Bình Minh', items: { wheat: 4 }, coins: 145, xp: 70 },
  { id: 'market', title: 'Chợ thị trấn', items: { carrot: 2, tomato: 3 }, coins: 220, xp: 110 },
]);

export const RECIPES = Object.freeze([
  { id: 'flour', name: 'Bột mì', icon: 'flour', inputs: { wheat: 2 }, coins: 18, xp: 12 },
  { id: 'cheese', name: 'Phô mai', icon: 'cheese', inputs: { milk: 2 }, coins: 35, xp: 20 },
  { id: 'jam', name: 'Mứt dâu', icon: 'jam', inputs: { strawberry: 2 }, coins: 55, xp: 30 },
]);

export const EXPANSIONS = Object.freeze([
  { plots: 24, cost: 500, level: 3 },
  { plots: 36, cost: 1400, level: 6 },
  { plots: 48, cost: 3200, level: 9 },
]);

const initial = {
  version: 2, coins: 180, gems: 15, xp: 0, level: 1,
  selectedCrop: 'carrot', freeSeeds: 0,
  inventory: { carrot: 0, wheat: 0, tomato: 0, strawberry: 0, egg: 0, milk: 0, flour: 0, cheese: 0, jam: 0 },
  stats: { planted: 0, watered: 0, harvested: 0, orders: 0, animalsFed: 0, crafted: 0 },
  claimedQuests: [], completedOrders: [], unlockedPlots: 0, barnLevel: 0, toolLevel: 1,
  outfit: 'starter', ownedOutfits: ['starter'], vehicle: 'walk', ownedVehicles: ['walk'],
  homeTier: 0, ownedHomes: [], casinoPlays: 0,
  fishing: { ownedRods: [], equippedRod: null, bait: { bait_worm: 0, bait_lure: 0 }, equippedBait: null, fish: {}, pending: null },
  onboarding: {
    characterCreated: false,
    step: 0,
    freeSeedsReceived: false,
    completed: false,
    bicycleAwarded: false,
  },
};

export function loadProgress() {
  // Placeholder only. MongoDB's account_state replaces this after authentication.
  return JSON.parse(JSON.stringify(initial));
}

export function isFeatureLocked(progress, featureId) {
  if (!progress?.onboarding) return false;
  if (progress.onboarding.completed) return false;
  const step = progress.onboarding.step;

  switch (featureId) {
    case 'factory':
    case 'upgrade':
    case 'casino':
    case 'vehicles':
      return step < ONBOARDING_STEPS.COMPLETED;
    case 'orders':
      return step < ONBOARDING_STEPS.DELIVER_ORDER;
    default:
      return false;
  }
}

export function levelFromXp(xp) { return Math.min(20, Math.floor(Math.sqrt(xp / 80)) + 1); }
export function levelFloor(level) { return (level - 1) ** 2 * 80; }
export function levelCeiling(level) { return level ** 2 * 80; }

export const QUESTS = Object.freeze([
  { id: 'plant-3', title: 'Gieo 3 hạt giống', stat: 'planted', goal: 3, coins: 35, xp: 20 },
  { id: 'harvest-3', title: 'Thu hoạch 3 nông sản', stat: 'harvested', goal: 3, coins: 60, xp: 35 },
  { id: 'feed-2', title: 'Cho vật nuôi ăn 2 lần', stat: 'animalsFed', goal: 2, coins: 50, xp: 30 },
]);

export function canFillOrder(progress, order) {
  return Object.entries(order.items).every(([item, count]) => (progress.inventory[item] || 0) >= count);
}

export function inventoryCount(progress) {
  return Object.values(progress.inventory).reduce((sum, value) => sum + value, 0);
}

export function barnCapacity(progress) { return 20 + (progress.barnLevel - 1) * 20; }
