import { FARM_CONFIG } from './farmConfig.js';
import { unlockedFarmTiles } from './landExpansionConfig.js';

// Planning estimate only: no prices, balances or production rules are changed.
export function landExpansionBudget(progress, cost, animals = []) {
  if (!Number.isSafeInteger(cost) || cost < 0 || !Number.isSafeInteger(progress.coins) || progress.coins < 0) throw new Error('Invalid expansion budget');
  const selected = Object.hasOwn(FARM_CONFIG.crops, progress.selectedCrop) ? FARM_CONFIG.crops[progress.selectedCrop] : null;
  const crop = selected && selected.level <= (progress.level || 1) ? selected : FARM_CONFIG.crops.carrot;
  const plotsAfter = unlockedFarmTiles(progress).length + 1;
  const freeSeeds = crop.id === 'carrot' && Number.isSafeInteger(progress.freeSeeds) ? Math.max(0, progress.freeSeeds) : 0;
  const seedCoins = Math.max(0, plotsAfter - freeSeeds) * crop.seedCost;
  const feedCoins = animals.reduce((sum, animal) => sum + (Object.hasOwn(FARM_CONFIG.animals, animal.species) ? FARM_CONFIG.animals[animal.species].feedCost : 0), 0);
  const remainingCoins = progress.coins - cost;
  const recommendedCoins = seedCoins + feedCoins;
  return { cropId: crop.id, cropName: crop.name, plotsAfter, seedCoins, feedCoins, recommendedCoins, remainingCoins, shortfall: Math.max(0, recommendedCoins - remainingCoins), needsWarning: remainingCoins >= 0 && remainingCoins < recommendedCoins };
}
