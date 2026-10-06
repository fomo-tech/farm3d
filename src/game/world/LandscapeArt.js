// Shared outdoor art direction. Decorative variation never changes collisions.
export const LANDSCAPE_ART = Object.freeze({
  grass: '#8BC56B', grassMid: '#66A651', grassLight: '#B1DD8C',
  leaf: '#63AA73', leafLight: '#94CD8A', leafShade: '#40835B',
  trunk: '#A97349', trunkShade: '#80563D', birch: '#F4EAD6',
  path: '#aba192', pathLight: '#c2b8a7',
  water: '#3EBBCD', shallows: '#95DDD9',
});

export function landscapeVariation(x, z, salt = 0) {
  const value = Math.sin(x * 12.9898 + z * 78.233 + salt * 37.719) * 43758.5453;
  return value - Math.floor(value);
}
