// Shared outdoor art direction. Decorative variation never changes collisions.
export const LANDSCAPE_ART = Object.freeze({
  grass: '#92B87A', grassMid: '#789F68', grassLight: '#B1CA96',
  leaf: '#7FA88A', leafLight: '#A7C5A4', leafShade: '#61866F',
  trunk: '#A77B62', trunkShade: '#82634F', birch: '#F4EAD6',
  path: '#C0BDCF', pathLight: '#E4D9C8',
  water: '#70ADBE', shallows: '#ACD0D0',
});

export function landscapeVariation(x, z, salt = 0) {
  const value = Math.sin(x * 12.9898 + z * 78.233 + salt * 37.719) * 43758.5453;
  return value - Math.floor(value);
}
