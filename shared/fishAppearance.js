import { FISHING_CONFIG } from './fishingConfig.js';
const LEGACY = {carp:'oval',perch:'deep',golden_carp:'deep',river_catfish:'catfish',river_barb:'slender',sea_mackerel:'long',sea_snapper:'deep'};
export const FISH_FORMS = Object.freeze({
 oval:[.54,.24,.18], deep:[.44,.32,.15], slender:[.64,.15,.13],
 long:[.80,.18,.16], catfish:[.70,.19,.22], eel:[1.0,.09,.09],
 round:[.38,.35,.30], flat:[.53,.09,.48],
});
export const fishForm = fish => fish?.form || LEGACY[fish?.id] || 'oval';
export function fishLengthClass(weight) { return weight<.3?'tiny':weight<1?'small':weight<3?'medium':weight<7?'large':'huge'; }
// Exaggerated silhouette sizes stay distinguishable from the game camera.
export const FISH_SIZE_SCALE = Object.freeze({tiny:.65,small:1,medium:1.65,large:2.6,huge:3.9});
export function publicFishAppearance(fishId, weight) {
 return {shadowSize:fishLengthClass(weight),shadowShape:fishForm(FISHING_CONFIG.fish[fishId])};
}
export function caughtFishScale(fish) {
 const range=fish?.weight||[.5,2],weight=Number.isFinite(fish?.caughtWeight)?fish.caughtWeight:(range[0]+range[1])/2;
 return Math.min(1.65,Math.max(.5,.55+Math.sqrt(Math.max(0,weight))*.28));
}
