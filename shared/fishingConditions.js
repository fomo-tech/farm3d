import {FISHING_CONFIG} from './fishingConfig.js';
const DAY_MS=86400000,VIETNAM_OFFSET_MS=7*3600000;
const DENSITIES=Object.freeze({high:Object.freeze({density:'high',label:'Nhiều cá',biteMultiplier:.72}),normal:Object.freeze({density:'normal',label:'Bình thường',biteMultiplier:1}),low:Object.freeze({density:'low',label:'Ít cá',biteMultiplier:1.65})});
let cached;
// Derived from the Vietnam calendar date: same day/world across restarts and hosts.
// Clients display server data; the cast handler never accepts a client day/density.
export function getFishingConditions(now=Date.now()){
 if(!Number.isFinite(now))throw new Error('Thời gian bản tin cá không hợp lệ.');
 const dayKey=new Date(now+VIETNAM_OFFSET_MS).toISOString().slice(0,10);
 if(cached?.dayKey===dayKey)return cached;
 const ids=Object.keys(FISHING_CONFIG.zones);
 let seed=2166136261;for(const char of `fishing-density-v1:${dayKey}`)seed=Math.imul(seed^char.charCodeAt(0),16777619)>>>0;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
 for(let index=ids.length-1;index>0;index--){const other=Math.floor(random()*(index+1));[ids[index],ids[other]]=[ids[other],ids[index]];}
 const zones=Object.fromEntries(ids.map((id,index)=>[id,Object.freeze({id,name:FISHING_CONFIG.zones[id].name,...DENSITIES[index===0?'high':index===ids.length-1?'low':'normal']})]));
 cached=Object.freeze({version:1,dayKey,resetAt:Date.parse(`${dayKey}T00:00:00+07:00`)+DAY_MS,zones:Object.freeze(zones)});
 return cached;
}
export function fishingBiteBounds(zoneId,baitId,rodId,now=Date.now()){
 const conditions=getFishingConditions(now),zone=conditions.zones[zoneId];
 if(!zone)throw new Error('Vùng câu không hợp lệ.');
 const speed=Math.min(1.45,Math.max(1,FISHING_CONFIG.baits[baitId]?.biteSpeed||1));
 const [waitMin,waitMax]={high:[4000,8000],normal:[8000,15000],low:[15000,25000]}[zone.density];
 const animation=FISHING_CONFIG.animations[FISHING_CONFIG.rods[rodId]?.animation];
 const castMs=animation?.castMs||950;
 const minMs=castMs+2000+waitMin/speed;
 const maxMs=castMs+2000+waitMax/speed;
 return {minMs,maxMs,dayKey:conditions.dayKey,condition:zone};
}

// Two light nibbles before the real bite; they never open the hook window.
export function fishingNibbleState(timeUntilBiteMs){
 return Number.isFinite(timeUntilBiteMs)&&((timeUntilBiteMs>1400&&timeUntilBiteMs<=1800)||(timeUntilBiteMs>400&&timeUntilBiteMs<=800));
}
