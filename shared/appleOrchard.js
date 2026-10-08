import {farmOrigin} from './farmSecurity.js';
import {farmBarnCapacity} from './farmConfig.js';
export const APPLE_ORCHARD = Object.freeze({cycleMs:4*60*60*1000,yield:10,sellPrice:9,x:-7.2,z:-3,interactionDistance:3});
export function appleTreePosition(farmId){const origin=farmOrigin(farmId);return origin?{x:origin.x+APPLE_ORCHARD.x,z:origin.z+APPLE_ORCHARD.z}:null;}
export function harvestApples(progress,now){
 if(!Number.isFinite(progress.appleReadyAt)||now<progress.appleReadyAt)return {error:'Táo chưa chín. Hãy chờ thêm một chút.'};
 const used=Object.values(progress.inventory||{}).reduce((sum,n)=>sum+Number(n||0),0);
 if(used+APPLE_ORCHARD.yield>farmBarnCapacity(progress.barnLevel))return {error:`Kho cần trống ${APPLE_ORCHARD.yield} chỗ để thu táo.`};
 progress.inventory.apple=(progress.inventory.apple||0)+APPLE_ORCHARD.yield;
 progress.appleReadyAt=now+APPLE_ORCHARD.cycleMs;
 return {amount:APPLE_ORCHARD.yield,readyAt:progress.appleReadyAt};
}
