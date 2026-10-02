// Nguồn sự thật duy nhất cho model 3D. Không import Babylon để Node kiểm tra trước build.
export const MODEL_PATHS = Object.freeze({
  trees: Object.freeze({
    oak: '/models/nature/tree_oak.glb', default: '/models/nature/tree_default.glb', detailed: '/models/nature/tree_detailed.glb',
    pine: '/models/nature/tree_pineDefaultA.glb', pineRound: '/models/nature/tree_pineRoundA.glb', pineTall: '/models/nature/tree_pineTallA.glb',
    palm: '/models/nature/tree_palm.glb', palmBend: '/models/nature/tree_palmBend.glb', fall: '/models/nature/tree_default_fall.glb',
    oakFall: '/models/nature/tree_oak_fall.glb', fat: '/models/nature/tree_fat.glb', small: '/models/nature/tree_small.glb',
  }),
  foliage: Object.freeze({
    bush: '/models/nature/plant_bush.glb', bushDetailed: '/models/nature/plant_bushDetailed.glb', bushLarge: '/models/nature/plant_bushLarge.glb',
    flowerRed: '/models/nature/flower_redA.glb', flowerYellow: '/models/nature/flower_yellowA.glb', flowerPurple: '/models/nature/flower_purpleA.glb',
  }),
  crops: Object.freeze({
    carrot: '/models/nature/crop_carrot.glb', pumpkin: '/models/nature/crop_pumpkin.glb', melon: '/models/nature/crop_melon.glb',
    turnip: '/models/nature/crop_turnip.glb', wheatA: '/models/nature/crops_wheatStageA.glb', wheatB: '/models/nature/crops_wheatStageB.glb',
    leafsA: '/models/nature/crops_leafsStageA.glb', leafsB: '/models/nature/crops_leafsStageB.glb',
  }),
  rocks: Object.freeze({ large: '/models/nature/rock_largeA.glb', small: '/models/nature/rock_smallA.glb', tall: '/models/nature/rock_tallA.glb' }),
  town: Object.freeze({
    windmill: '/models/town/windmill.glb', watermill: '/models/town/watermill.glb', cart: '/models/town/cart.glb', cartHigh: '/models/town/cart-high.glb',
    lantern: '/models/town/lantern.glb', stallRed: '/models/town/stall-red.glb', stallGreen: '/models/town/stall-green.glb',
    fence: '/models/town/fence.glb', fenceGate: '/models/town/fence-gate.glb', fountain: '/models/town/fountain-round.glb', roofHigh: '/models/town/roof-high.glb',
    stairsWood: '/models/town/stairs-wood.glb', stairsStone: '/models/town/stairs-stone.glb', wheel: '/models/town/wheel.glb',
    bridgeWood: '/models/nature/bridge_wood.glb', bridgeStone: '/models/nature/bridge_stone.glb',
  }),
  animals: Object.freeze({
    cow: '/models/animals/cow.gltf', alpaca: '/models/animals/alpaca.gltf', shiba: '/models/animals/shiba.gltf', fox: '/models/animals/fox.glb',
    duck: '/models/animals/duck.glb', horse: '/models/animals/horse.glb', stork: '/models/animals/stork.glb',
  }),
  village: '/models/village.glb',
});

function flattenPaths(value, prefix = '', output = {}) {
  for (const [key, child] of Object.entries(value)) {
    const id = prefix ? `${prefix}.${key}` : key;
    if (typeof child === 'string') output[id] = Object.freeze({ id, url: child });
    else flattenPaths(child, id, output);
  }
  return output;
}

export const ASSET_REGISTRY = Object.freeze(flattenPaths(MODEL_PATHS));
const PATH_TO_ASSET = new Map(Object.values(ASSET_REGISTRY).map((asset) => [asset.url, asset]));

export function resolveModelAsset(idOrUrl) {
  if (typeof idOrUrl !== 'string' || !idOrUrl.trim()) return null;
  return ASSET_REGISTRY[idOrUrl] || PATH_TO_ASSET.get(idOrUrl) || Object.freeze({ id: idOrUrl, url: idOrUrl });
}
