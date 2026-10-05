import { COASTAL_BUS_CONFIG } from './beachConfig.js';
import { LAKE_CONFIG } from './lakeConfig.js';
// Server-approved route corridors and boarding stops. No client coordinates
// can create a new route or authorize an express-speed trip outside it.
export const BUS_AUTHORITY_ROUTES={
  '01':{points:[[0,54],[0,50],[0,86],[-612,86],[612,86],[0,86]],stops:[[0,54],[0,86],[-300,86],[-594,86],[300,86],[594,86]]},
  '02':{points:COASTAL_BUS_CONFIG.waypoints,stops:[0,2,...Object.values(COASTAL_BUS_CONFIG.stops)].map(i=>COASTAL_BUS_CONFIG.waypoints[i])},
  '03':{points:[[0,-54],[0,-50],[0,-234],[-612,-234],[612,-234],[0,-234],[0,-408]],stops:[[0,-54],[-300,-234],[-594,-234],[0,-394],[300,-234],[594,-234]]},
  '04A':{points:[[-54,0],[-50,0],[-130,0]],stops:[[-54,0],[-118,0]]},
  '04B':{points:[[54,0],[50,0],[LAKE_CONFIG.busStop.turnX,0]],stops:[[54,0],[LAKE_CONFIG.busStop.x,0]]},
};
export function busRouteForId(id) {
  if (!/^bus-(01[AB]|02[AB]|03[AB]|04[AB])$/.test(String(id))) return null;
  return BUS_AUTHORITY_ROUTES[String(id).slice(4,6)==='04'?String(id).slice(4):String(id).slice(4,6)];
}
export function nearBusRoute(route,x,z,clearance=6) {
  return route.points.some(([ax,az],i)=>{
    if(!i)return false;const [bx,bz]=route.points[i-1];
    const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1)));
    return Math.hypot(x-ax-t*dx,z-az-t*dz)<=clearance;
  });
}
