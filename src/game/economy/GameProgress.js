import { getDefaultCustomization } from '../../../shared/fashionConfig.js';
import { ECONOMY_REWARD_CONFIG } from '../../../shared/economyRewardConfig.js';
import { NPC_TRADING_CONFIG } from '../../../shared/npcTradingConfig.js';
import { FARM_CONFIG, farmBarnCapacity } from '../../../shared/farmConfig.js';
import { normalizeFishingState } from '../../../shared/fishingConfig.js';
export { CROPS } from '../../../shared/farmConfig.js';

export const ONBOARDING_STEPS = Object.freeze({
  CHARACTER_CREATION: 0,
  MEET_ELDER: 1,
  FIRST_PLANT: 2,
  EXPLAIN_SYSTEMS: 3,
  DELIVER_ORDER: 4,
  CLAIM_REWARD: 5,
  COMPLETED: 6,
});

export const ORDERS = Object.freeze(Object.entries(NPC_TRADING_CONFIG.orders).map(([id, order]) => ({ id, ...order })));
export const RECIPES = Object.freeze(Object.entries(NPC_TRADING_CONFIG.recipes).map(([id, recipe]) => ({ id, ...recipe, icon: id, coins: recipe.sell })));

export const EXPANSIONS = FARM_CONFIG.expansions;

const initial = {
  version: 2, coins: ECONOMY_REWARD_CONFIG.initial.coins, gems: ECONOMY_REWARD_CONFIG.initial.gems, xp: 0, level: 1,
  selectedCrop: 'carrot', freeSeeds: 0,
  inventory: {
    carrot: 0, wheat: 0, tomato: 0, strawberry: 0, pumpkin: 0, melon: 0, turnip: 0,
    egg: 0, duckEgg: 0, milk: 0, wool: 0, flour: 0, cheese: 0, jam: 0,
  },
  stats: { planted: 0, watered: 0, harvested: 0, orders: 0, animalsFed: 0, crafted: 0 },
  claimedQuests: [], completedOrders: [], unlockedPlots: 0, barnLevel: 0, toolLevel: 1,
  missions: { main: { claimed: [] }, daily: null },
  customization: getDefaultCustomization(),
  outfit: 'starter', ownedOutfits: ['starter'], vehicle: 'walk', ownedVehicles: ['walk'],
  homeTier: 0, ownedHomes: [], casinoPlays: 0,
  fishing: normalizeFishingState(),
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

export const QUESTS = Object.freeze(Object.entries(ECONOMY_REWARD_CONFIG.quests).map(([id, quest]) => ({ id, ...quest })));

export function canFillOrder(progress, order) {
  return Object.entries(order.items).every(([item, count]) => (progress.inventory[item] || 0) >= count);
}

export function inventoryCount(progress) {
  return Object.values(progress.inventory).reduce((sum, value) => sum + value, 0);
}

export function barnCapacity(progress) { return farmBarnCapacity(progress.barnLevel); }
