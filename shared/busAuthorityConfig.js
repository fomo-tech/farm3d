import { BUS_ROUTES } from './busRoutes.js';

export const BUS_AUTHORITY_ROUTES = Object.fromEntries(Object.entries(BUS_ROUTES).map(([code, route]) => [code, {
  points: [...route.points, route.points[0]],
  speed: route.speed || 48,
  stops: route.stops.map(stop => route.points[stop.waypointIndex]),
}]));
export function busRouteForId(id) {
  const match = /^bus-((?:01|02|03)[ABCD]|04[AB](?:-[12])?|(?:05|06)[AB]|L(?:0[1-9]|1[0-2])A)$/.exec(String(id));
  if (!match) return null;
  const route = /^(04|L)/.test(match[1]) ? match[1].slice(0, 3) : match[1].slice(0, 2);
  return BUS_AUTHORITY_ROUTES[route];
}
export function nearBusRoute(route,x,z,clearance=6) {
  return route.points.some(([ax,az],i)=>{
    if(!i)return false;const [bx,bz]=route.points[i-1];
    const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1)));
    return Math.hypot(x-ax-t*dx,z-az-t*dz)<=clearance;
  });
}
