// Shared outdoor art direction. Decorative variation never changes collisions.
export const LANDSCAPE_ART = Object.freeze({
  grass: '#91C94B', grassMid: '#78B83D', grassLight: '#AACF63',
  leaf: '#73B638', leafLight: '#98CD4A', leafShade: '#3F812F',
  trunk: '#855329', trunkShade: '#684020', birch: '#DAD8C5',
  path: '#DDB473', pathLight: '#EAC68B',
  water: '#359EBE', shallows: '#62C9D5',
});

export function landscapeVariation(x, z, salt = 0) {
  const value = Math.sin(x * 12.9898 + z * 78.233 + salt * 37.719) * 43758.5453;
  return value - Math.floor(value);
}
