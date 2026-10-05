// Open southern approach, beyond the fountain and plaza entrance structure.
export const TOWN_SPAWN = Object.freeze({ x: 0, y: 0, z: 42 });
export const TOWN_FOUNTAIN = Object.freeze({ x:0,z:0,radius:9.35,clearance:1.15 });
export function insideTownFountain(x,z,radius=.45) {
  return Number.isFinite(x)&&Number.isFinite(z)&&Math.hypot(x-TOWN_FOUNTAIN.x,z-TOWN_FOUNTAIN.z)<TOWN_FOUNTAIN.radius+radius;
}

export function recoverTownSpawn(position, { legacyDefault = true, clearance = TOWN_FOUNTAIN.clearance } = {}) {
  if (!position || position.venue || Math.abs(Number(position.y) || 0) >= 20) return position;
  const x = Number(position.x), z = Number(position.z);
  const insideFountain = insideTownFountain(x,z,clearance);
  const oldDefault = legacyDefault && Math.abs(x) < 0.5 && Math.abs(z - 18) < 0.5;
  return insideFountain || oldDefault ? { ...position, ...TOWN_SPAWN, rotation: Math.PI } : position;
}
