/** Snap the shadow camera in light space so sub-texel camera motion cannot crawl
 * across flat farm surfaces. Recompute the texel size after quality changes. */
export function stabilizeSunShadow(light, center, shadowMapSize = 1024, distance = 65) {
  const d=light.direction;
  const length=Math.hypot(d.x,d.y,d.z)||1;
  const dx=d.x/length,dy=d.y/length,dz=d.z/length;
  // Same world-up basis as Babylon's directional light view matrix.
  const horizontal=Math.hypot(dx,dz);
  const rx=horizontal>1e-6?dz/horizontal:1,rz=horizontal>1e-6?-dx/horizontal:0;
  const ux=dy*rz,uy=dz*rx-dx*rz,uz=-dy*rx;
  const texel=(light.shadowFrustumSize||56)/Math.max(1,shadowMapSize);
  const right=center.x*rx+center.z*rz;
  const up=center.x*ux+center.y*uy+center.z*uz;
  const shiftR=Math.round(right/texel)*texel-right;
  const shiftU=Math.round(up/texel)*texel-up;
  light.position.set(center.x+rx*shiftR+ux*shiftU-dx*distance,
    center.y+uy*shiftU-dy*distance,center.z+rz*shiftR+uz*shiftU-dz*distance);
}
