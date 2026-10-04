export function initialLivestockState() { return []; }

export function livestockSummary(animals) {
  const now = Date.now();
  const hungry = animals.filter(animal => !animal.productReadyAt).length;
  const ready = animals.filter(animal => !FARM_CONFIG.animals[animal.species]?.saleOnly && animal.productReadyAt > 0 && animal.productReadyAt <= now).length;
  return { hungry, ready };
}
import { FARM_CONFIG } from '../../../shared/farmConfig.js';
