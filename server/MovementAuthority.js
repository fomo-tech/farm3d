import { WorldCollisionSystem } from '../src/game/physics/WorldCollisionSystem.js';
import { vehicleCollisionRadius } from '../shared/vehicleCollision.js';
import { busRouteForId, nearBusRoute } from '../shared/busAuthorityConfig.js';
import { VEHICLES } from '../shared/vehicleConfig.js';

// The collision implementation has no WebGL/DOM dependencies. Reuse the same
// static geometry and swept sliding rules as the client instead of endpoints only.
export class MovementAuthority {
  constructor() { this.collision = new WorldCollisionSystem();this.budgets=new WeakMap();this.rides=new WeakMap(); }
  reset(client, now=Date.now()) { this.budgets.set(client,{at:now,credit:1.5});this.rides.delete(client); }
  board(client,id,now=Date.now()) {
    const route=busRouteForId(id);
    if(client.venue||!route||!route.stops.some(([x,z])=>Math.hypot(x-client.x,z-client.z)<=15))return false;
    this.reset(client,now);this.rides.set(client,{route,expiresAt:now+600000});
    this.budgets.get(client).credit=6;return true;
  }
  maxSpeed(client) { return this.rides.has(client)?48:(Object.hasOwn(VEHICLES,client.vehicle)?VEHICLES[client.vehicle].speed:7)*1.35; }
  accepts(client, target, now=Date.now()) {
    let budget=this.budgets.get(client);
    if(!budget){this.reset(client,now);budget=this.budgets.get(client);}
    const ride=this.rides.get(client);
    if(ride && now>ride.expiresAt)this.rides.delete(client);
    const speed=this.maxSpeed(client);
    budget.credit=Math.min(speed*2,budget.credit+Math.max(0,now-budget.at)/1000*speed);budget.at=now;
    const distance=Math.hypot(target.x-client.x,target.z-client.z);
    if(distance>budget.credit+.001)return false;
    if(ride && now<=ride.expiresAt) {
      const count=Math.max(1,Math.ceil(distance/.5));
      for(let step=1;step<=count;step++)if(!nearBusRoute(ride.route,client.x+(target.x-client.x)*step/count,client.z+(target.z-client.z)*step/count))return false;
      budget.credit=Math.max(0,budget.credit-distance);
      ride.expiresAt=now+600000;
      if(target.y<.2)this.rides.delete(client);
      return true;
    }
    this.collision.playerRadius=vehicleCollisionRadius(client.vehicle);
    const count=Math.max(1,Math.ceil(distance/4));
    const dx=(target.x-client.x)/count,dz=(target.z-client.z)/count;
    let x=client.x,z=client.z;
    for(let step=0;step<count;step++) {
      const next=this.collision.resolveMovement(x,z,dx,dz,client.venue);
      x=next.x;z=next.z;
    }
    if(Math.hypot(target.x-x,target.z-z)>.02)return false;
    budget.credit=Math.max(0,budget.credit-distance);
    return true;
  }
}
