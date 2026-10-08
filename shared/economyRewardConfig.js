function freeze(value) {
  for (const child of Object.values(value)) if (child && typeof child === 'object') freeze(child);
  return Object.freeze(value);
}

// Existing rewards, shared by the server, client and offline economy simulator.
export const ECONOMY_REWARD_CONFIG = freeze({
  version: 1,
  initial: { coins: 180, gems: 15 },
  onboarding: {
    seeds: { coins: 50, seeds: 3 },
    completion: { coins: 200, xp: 80, vehicle: 'bike' },
  },
  quests: {
    'plant-3': { title: 'Gieo 3 hạt giống', stat: 'planted', goal: 3, coins: 35, xp: 20 },
    'harvest-3': { title: 'Thu hoạch 3 nông sản', stat: 'harvested', goal: 3, coins: 60, xp: 35 },
    'feed-2': { title: 'Cho vật nuôi ăn 2 lần', stat: 'animalsFed', goal: 2, coins: 50, xp: 30 },
  },

});
