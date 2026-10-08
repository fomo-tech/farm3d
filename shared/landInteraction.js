import {FARM_LOT_SPEC} from './farmLayout.js';
// Estate footprint only: service lanes between parcels remain walkable.
export function clickedLandAt(point,lots){
 if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.z))return null;
 return lots.find(lot=>Math.abs(point.x-lot.x)<=FARM_LOT_SPEC.estateWidth/2&&Math.abs(point.z-lot.z)<=FARM_LOT_SPEC.estateDepth/2)||null;
}
