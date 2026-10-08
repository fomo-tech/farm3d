import {randomUUID} from 'node:crypto';
import {FARM_CONFIG,farmBarnCapacity} from '../shared/farmConfig.js';
import {insideFarm} from '../shared/farmSecurity.js';
import {livestockTheftPolicy,livestockTheftPosition} from '../shared/livestockTheft.js';
export async function recoverLivestockClaim(service,owner){
 const claim=owner.livestockTheftClaim;if(!claim)return;
 const paid=await service.players.findOne({playerId:claim.playerId,farmTheftReceipts:claim.id});
 if(paid){
  await service.assignments.updateOne({_id:claim.assignmentId,theftReceipts:{$ne:claim.id}},{
   $inc:{[`theftCounts.${claim.day}`]:1},$addToSet:{theftReceipts:claim.id},
   $push:{theftLog:{$each:[{id:claim.id,playerId:claim.playerId,product:claim.product,amount:claim.amount,at:claim.at}],$slice:-50}}});
  await service.players.updateOne({playerId:owner.playerId,'livestockTheftClaim.id':claim.id},{
   $set:{'livestock.$[animal].stolenAmount':0,'livestock.$[animal].productReadyAt':0},$unset:{livestockTheftClaim:''},$inc:{revision:1}},
   {arrayFilters:[{'animal.id':claim.animalId,'animal.productReadyAt':claim.cycle}]});
 }else await service.players.updateOne({playerId:owner.playerId,'livestockTheftClaim.id':claim.id},{$unset:{livestockTheftClaim:''},$inc:{revision:1}});
}
export async function stealLivestock(service,{assignment,farmId,animalId,playerId,position,phase,token}){
 const now=service.now(),day=new Date(now).toISOString().slice(0,10);
 const farm=await service.assignments.findOne({_id:assignment._id});
 if(!farm)return {error:'Nông trại không tồn tại.'};
 const owner=await service.players.findOne({playerId:farm.playerId}),player=await service.players.findOne({playerId});
 if(owner?.livestockTheftClaim){await recoverLivestockClaim(service,owner);return {error:'Chuồng đang được chăm sóc. Hãy thử lại.'};}
 const animal=owner?.livestock?.find(a=>a.id===animalId),point=livestockTheftPosition(farmId,owner?.livestock||[],animalId);
 if(!player||!point||position.venue||!insideFarm(farmId,position)||Math.hypot(position.x-point.x,position.z-point.z)>FARM_CONFIG.security.theft.interactionDistance)return {error:'Hãy đứng sát vật nuôi trong chuồng.'};
 const policy=livestockTheftPolicy({animal,owner:playerId===farm.playerId,gateOpen:service.gateOpen(farm),now,claimedAt:farm.claimedAt||0,playerCount:player.farmTheftCounts?.[day]||0,farmCount:farm.theftCounts?.[day]||0});
 if(policy.error)return policy;
 if(phase==='start'){
  const pending={kind:'livestock',token:randomUUID(),farmId,animalId,cycle:animal.productReadyAt,targetPosition:point,x:position.x,z:position.z,readyAt:now+FARM_CONFIG.security.theft.interactionMs,expiresAt:now+FARM_CONFIG.security.theft.interactionMs+5000};
  service.pending.set(playerId,pending);return {pending};
 }
 const pending=service.pending.get(playerId);service.pending.delete(playerId);
 if(phase!=='finish'||!pending||pending.kind!=='livestock'||pending.token!==token||pending.farmId!==farmId||pending.animalId!==animalId||pending.cycle!==animal.productReadyAt||now<pending.readyAt||now>pending.expiresAt||Math.hypot(position.x-pending.x,position.z-pending.z)>.2)return {error:'Lượt lấy đã hủy hoặc chưa đủ thời gian.'};
 const total=Object.values(player.progress.inventory||{}).reduce((sum,n)=>sum+Number(n||0),0);
 if(total+policy.amount>farmBarnCapacity(player.progress.barnLevel))return {error:'Kho đã đầy.'};
 const claim={id:randomUUID(),assignmentId:farm._id,animalId,cycle:animal.productReadyAt,playerId,day,product:policy.product,amount:policy.amount,at:now};
 const reserved=await service.players.updateOne({playerId:owner.playerId,revision:owner.revision||0,livestockTheftClaim:{$exists:false}},{$set:{livestockTheftClaim:claim},$inc:{revision:1}});
 if(!reserved.modifiedCount)return {error:'Chuồng vừa thay đổi. Hãy thử lại.'};
 const paid=await service.players.updateOne({playerId,revision:player.revision||0,...(FARM_CONFIG.security.theft.dailyLimitsEnabled?{[`farmTheftCounts.${day}`]:{$not:{$gte:FARM_CONFIG.security.theft.dailyPlayerLimit}}}:{})},{$inc:{[`progress.inventory.${policy.product}`]:policy.amount,[`farmTheftCounts.${day}`]:1,revision:1},$addToSet:{farmTheftReceipts:claim.id}});
 await recoverLivestockClaim(service,{...owner,livestockTheftClaim:claim});
 return paid.modifiedCount?{amount:policy.amount,ownerId:owner.playerId,product:policy.product}:{error:'Dữ liệu vừa thay đổi, lượt lấy chưa được tính.'};
}
