// Shared outdoor art direction. Decorative variation never changes collisions.
export const LANDSCAPE_ART = Object.freeze({
  grass: '#7EB644', grassMid: '#6FA638', grassLight: '#94CB58',
  leaf: '#68AD30', leafLight: '#8EC242', leafShade: '#387328',
  trunk: '#855329', trunkShade: '#684020', birch: '#DAD8C5',
  path: '#A89C8D', pathLight: '#C2B6A7',
  water: '#359EBE', shallows: '#62C9D5',
});

export function landscapeVariation(x, z, salt = 0) {
  const value = Math.sin(x * 12.9898 + z * 78.233 + salt * 37.719) * 43758.5453;
  return value - Math.floor(value);
}
