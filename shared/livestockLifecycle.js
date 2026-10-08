export const LIVESTOCK_LIFECYCLE=Object.freeze({version:1,lifespanMs:7*86400000,growthMs:Object.freeze({chicken:30*60000,duck:45*60000,pig:90*60000,cow:120*60000,sheep:120*60000})});
export function livestockLife(animal,now=Date.now()){
 if(!animal?.lifeVersion)return {stage:'adult',label:'Trưởng thành',scale:1,retired:false,matureAt:null,remainingLifeMs:null,growth:1};
 const bornAt=animal.createdAt,expiresAt=bornAt+LIVESTOCK_LIFECYCLE.lifespanMs;
 const matureAt=animal.matureAt||null;
 const growth=matureAt?Math.max(0,Math.min(1,1-(matureAt-now)/LIVESTOCK_LIFECYCLE.growthMs[animal.species])):0;
 const retired=now>=expiresAt,stage=retired?'retired':growth>=1?'adult':growth>=.5?'growing':'baby';
 return {stage,label:{retired:'Nghỉ nuôi',adult:'Trưởng thành',growing:'Đang lớn',baby:'Con non'}[stage],scale:retired||growth>=1?1:.55+.45*growth,retired,matureAt,remainingLifeMs:Math.max(0,expiresAt-now),growth};
}
