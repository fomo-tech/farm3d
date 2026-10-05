import { getRiverWestBankX } from './riverBank.js';

export const LAKE_CENTER = Object.freeze({ x: 167, z: 2 });
export const LAKE_CONFIG = Object.freeze({
  segments: 96,
  pier: Object.freeze({ x: 153, z: 2, length: 22, width: 3.6, deckY: .32 }),
  pierHead: Object.freeze({ x: 162, z: 2, width: 4, depth: 10 }),
  approach: Object.freeze({ x: 133, z: 2, width: 24, depth: 4.8, y: .10 }),
  shop: Object.freeze({ x: 123, z: -16, entranceX: 116.9, exitX: 112.5 }),
  rest: Object.freeze({ x: 130, z: 24 }),
  busStop: Object.freeze({ x: 110, z: 5.4, turnX: 114 }),
  detailDistance: 120, keepDetailDistance: 145,
});

export function lakeEdge(angle, scale = 1) {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const shape = 1.0
    + 0.10 * Math.sin(angle)
    - 0.06 * Math.cos(2 * angle)
    + 0.04 * Math.sin(2 * angle + 0.45);

  const rz = 66;
  const outerZ = LAKE_CENTER.z + sinA * rz * shape;
  let outerX;

  if (cosA >= 0) {
    // Phía Đông tiếp giáp Sông Uốn Lượn
    if (outerZ >= -36.0 && outerZ <= 44.0) {
      // Cửa Vịnh Hòa Lưu: Khớp mộng tuyệt đối 100% vào bờ Tây của Sông (Diff: 0.000m)
      outerX = getRiverWestBankX(outerZ);
    } else if (outerZ < -36.0 && outerZ >= -52.0) {
      // Mũi Nam: Chuyển tiếp mượt mà dạng Hermite từ đường bờ sông sang đường cong bờ hồ
      const t = (outerZ - (-52.0)) / (-36.0 - (-52.0));
      const smoothT = t * t * (3 - 2 * t);
      const ellX = LAKE_CENTER.x + cosA * 48 * shape;
      const rivX = getRiverWestBankX(outerZ);
      outerX = ellX + (rivX - ellX) * smoothT;
    } else if (outerZ > 44.0 && outerZ <= 60.0) {
      // Mũi Bắc: Chuyển tiếp mượt mà dạng Hermite từ đường bờ sông sang đường cong bờ hồ
      const t = (60.0 - outerZ) / (60.0 - 44.0);
      const smoothT = t * t * (3 - 2 * t);
      const ellX = LAKE_CENTER.x + cosA * 48 * shape;
      const rivX = getRiverWestBankX(outerZ);
      outerX = ellX + (rivX - ellX) * smoothT;
    } else {
      outerX = LAKE_CENTER.x + cosA * 48 * shape;
    }
  } else {
    // Phía Tây (Bến câu cá & Sandy Shore Promenade)
    outerX = LAKE_CENTER.x + cosA * (48 + 16 * cosA) * shape;
  }

  // Nội suy hướng tâm chuẩn xác cho các vòng đĩa đồng tâm bên trong
  if (scale === 1.0) {
    return { x: outerX, z: outerZ };
  }
  return {
    x: LAKE_CENTER.x + (outerX - LAKE_CENTER.x) * scale,
    z: LAKE_CENTER.z + (outerZ - LAKE_CENTER.z) * scale,
  };
}

export const LAKE_OUTLINE = Object.freeze(Array.from({ length: LAKE_CONFIG.segments }, (_, i) =>
  Object.freeze(lakeEdge(i * Math.PI * 2 / LAKE_CONFIG.segments))));

function inRectangle(x, z, rect, radius = 0) {
  const width = rect.width ?? rect.length;
  const depth = rect.depth ?? rect.width;
  return Math.abs(x - rect.x) <= width / 2 - radius && Math.abs(z - rect.z) <= depth / 2 - radius;
}
export function lakeDeckAt(x, z, radius = 0) {
  const p = LAKE_CONFIG.pier;
  return inRectangle(x,z,{x:p.x,z:p.z,width:p.length,depth:p.width},radius)
    || inRectangle(x,z,LAKE_CONFIG.pierHead,radius);
}
export function lakeWalkwayAt(x, z, radius = 0) {
  return lakeDeckAt(x,z,radius) || inRectangle(x,z,LAKE_CONFIG.approach,radius);
}
export function lakeWaterAt(x, z) {
  if (!Number.isFinite(x) || !Number.isFinite(z) || x < 130 || x > 220 || z < -85 || z > 85) return false;
  let inside = false;
  for (let i = 0, j = LAKE_OUTLINE.length - 1; i < LAKE_OUTLINE.length; j = i++) {
    const a = LAKE_OUTLINE[i], b = LAKE_OUTLINE[j];
    if ((a.z > z) !== (b.z > z) && x < (b.x - a.x) * (z - a.z) / (b.z - a.z) + a.x) inside = !inside;
  }
  return inside;
}
export function lakeShoreDistance(x, z) {
  let squared = Infinity;
  for (let i = 0; i < LAKE_OUTLINE.length; i++) {
    const a = LAKE_OUTLINE[i], b = LAKE_OUTLINE[(i + 1) % LAKE_OUTLINE.length];
    const dx=b.x-a.x, dz=b.z-a.z;
    const t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));
    squared=Math.min(squared,(x-a.x-t*dx)**2+(z-a.z-t*dz)**2);
  }
  return Math.sqrt(squared);
}
export function lakeDeepWaterAt(x,z,radius=.45) {
  if (lakeWalkwayAt(x,z,radius)) return false;
  if (x < 129-radius || x > 221+radius || z < -86-radius || z > 86+radius) return false;
  return lakeWaterAt(x,z) || lakeShoreDistance(x,z) < radius;
}
export function lakeFishingAt(x,z) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
  if (lakeDeckAt(x,z)) return true;
  return x >= 130 && x <= 220 && z >= -85 && z <= 85
    && !lakeWaterAt(x,z) && lakeShoreDistance(x,z) <= 7;
}
export function lakeGroundHeight(x,z) {
  if(lakeDeckAt(x,z)) return LAKE_CONFIG.pier.deckY;
  if(inRectangle(x,z,LAKE_CONFIG.approach)) return LAKE_CONFIG.approach.y;
  return null;
}

export function lakeMovementBlocked(from,to,radius=.45) {
  if(Math.max(from.x,to.x)<129-radius || Math.min(from.x,to.x)>221+radius
    || Math.max(from.z,to.z)<-86-radius || Math.min(from.z,to.z)>86+radius) return false;
  // Clip long requests to the lake's bounding rectangle first. Work stays
  // bounded even if a disconnected client sends a very distant position.
  const dx=to.x-from.x,dz=to.z-from.z;
  let enter=0,leave=1;
  for(const [origin,delta,min,max] of [[from.x,dx,129-radius,221+radius],[from.z,dz,-86-radius,86+radius]]) {
    if(Math.abs(delta)<1e-9) {if(origin<min||origin>max)return false;continue;}
    const a=(min-origin)/delta,b=(max-origin)/delta;
    enter=Math.max(enter,Math.min(a,b));leave=Math.min(leave,Math.max(a,b));
    if(enter>leave)return false;
  }
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)*(leave-enter)/.6));
  for(let i=0;i<=steps;i++) {
    const t=enter+(leave-enter)*i/steps;
    if(lakeDeepWaterAt(from.x+dx*t,from.z+dz*t,radius))return true;
  }
  return false;
}
export function recoverLakePosition(position) {
  if(!position || position.venue || !lakeDeepWaterAt(position.x,position.z)) return position;
  return {...position,x:LAKE_CONFIG.approach.x,y:LAKE_CONFIG.approach.y,z:LAKE_CONFIG.approach.z,rotation:Math.PI/2};
}
