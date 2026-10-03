import { FARM_LOT_SPEC, validateFarmLayout } from '../shared/farmLayout.js';

const result = validateFarmLayout(288);
if (!result.valid) {
  console.error(`Farm layout v${FARM_LOT_SPEC.version} invalid:`);
  result.errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Farm layout OK: v${result.version}, ${result.lotCount} lots, ${result.activePlots} starter plots, no overlaps.`);
