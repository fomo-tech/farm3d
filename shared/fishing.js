import { beachFishingAt } from './beachConfig.js';
import { LAKE_CONFIG, lakeFishingAt, lakeWaterAt, lakeDeepWaterAt } from './lakeConfig.js';
export {
  FISHING_CONFIG,
  FISHING_GEAR,
  LAKE_FISH,
  FISHING_GEAR_ORDER,
  normalizeFishingState,
  fishingInventoryCount,
  fishingCapacity,
  calculateFishSaleValue,
  validateFishingConfig,
} from './fishingConfig.js';

export const LAKE_PIER = Object.freeze({ x: LAKE_CONFIG.pier.x, z: LAKE_CONFIG.pier.z, radius: LAKE_CONFIG.pier.length / 2 });

// Keep this shoreline metadata independent of Babylon so client and server use
// exactly the same reachability test. Values follow the rendered water shapes.
const RIVER = [
  [220,-580,15],[215,-480,15],[210,-380,16],[205,-280,16],
  [205,-234,16],[200,-175,16],[190,-90,17],[175,-15,18],
  [175,20,18],[195,52,17],[212,86,17],[218,140,16],
  [214,210,16],[218,270,16],[218,330,17],[220,406,18],
  [220,540,20],[220,650,20],[155,720,24],
];

export function fishingWaterAt(x, z) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return null;
  if (lakeFishingAt(x, z)) return 'lake';
  if (lakeWaterAt(x, z)) return null;
  const pondDistance = Math.hypot(x - 84, z - 68);
  if (pondDistance >= 3.5 && pondDistance <= 8) return 'pond';

  // The narrow park brook is shallow; fish at its pond, not on the walkway.

  if (beachFishingAt(x, z)) return 'sea';

  for (let index = 0; index < RIVER.length - 1; index++) {
    const [ax, az, aw] = RIVER[index];
    const [bx, bz, bw] = RIVER[index + 1];
    const lengthSq = (bx - ax) ** 2 + (bz - az) ** 2;
    const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / lengthSq));
    const distance = Math.hypot(x - ax - (bx - ax) * t, z - az - (bz - az) * t);
    const bank = (aw + (bw - aw) * t) / 2;
    if (distance >= bank - 1.5 && distance <= bank + 6) return 'river';
  }
  return null;
}

export const FISHING_WATER_NAMES = Object.freeze({ lake: 'Hồ Pha Lê', river: 'Ven sông', sea: 'Bờ biển', pond: 'Ao công viên' });

export function fishingCastTarget(x,z,zone,distance) {
  let aim;
  if(zone==='lake')aim={x:167,z:2};
  else if(zone==='pond')aim={x:84,z:68};
  else if(zone==='sea')aim={x,z:z+distance};
  else {
    let best=Infinity;
    for(let i=0;i<RIVER.length-1;i++){
      const [ax,az]=RIVER[i], [bx,bz]=RIVER[i+1];
      const t=Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(z-az)*(bz-az))/((bx-ax)**2+(bz-az)**2)));
      const point={x:ax+(bx-ax)*t,z:az+(bz-az)*t};
      const d=Math.hypot(point.x-x,point.z-z);if(d<best){best=d;aim=point;}
    }
  }
  const length=Math.hypot(aim.x-x,aim.z-z)||1;
  const reach=Math.min(distance,length);
  if(zone==='lake'){
    const angle=Math.atan2(aim.x-x,aim.z-z);
    for(let radius=distance;radius>=2;radius-=1){
      for(let step=0;step<=18;step++)for(const sign of [1,-1]){
        const a=angle+sign*step*Math.PI/18;
        const point={x:x+Math.sin(a)*radius,y:.13,z:z+Math.cos(a)*radius};
        if(lakeDeepWaterAt(point.x,point.z,.5))return point;
      }
    }
    return null;
  }
  return {x:x+(aim.x-x)/length*reach,y:.13,z:z+(aim.z-z)/length*reach};
}
