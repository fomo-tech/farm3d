import {randomInt,randomBytes,createHash} from 'node:crypto';
import {LOTTERY_CONFIG,lotteryDay,lotterySaleDay,lotteryDrawAt,lotteryPrize} from '../shared/lotteryConfig.js';
const indexes=new WeakMap();
export async function lotteryDraw(db,day){
 const collection=db.collection('lottery_draws');
 if(!indexes.has(db))indexes.set(db,collection.createIndex({day:1},{unique:true}).catch(error=>{indexes.delete(db);throw error;}));
 await indexes.get(db);
 const winner=String(randomInt(1000000)).padStart(6,'0'),salt=randomBytes(24).toString('hex');
 const candidate={day,drawAt:lotteryDrawAt(day),winner,salt,commitment:createHash('sha256').update(`${day}:${winner}:${salt}`).digest('hex')};
 try{await collection.updateOne({day},{$setOnInsert:candidate},{upsert:true});}catch(e){if(e.code!==11000)throw e;}
 return collection.findOne({day});
}
export async function lotterySnapshot(db,progress={},now=Date.now()){
 const saleDay=lotterySaleDay(now),draw=await lotteryDraw(db,saleDay);
 const tickets=progress.lottery?.tickets||[];
 const days=[...new Set([lotteryDay(now-86400000),lotteryDay(now),...tickets.map(t=>t.day)])];
 const results=[];
 for(const day of days){if(lotteryDrawAt(day)>now)continue;const d=await lotteryDraw(db,day);results.push({day,winner:d.winner,salt:d.salt,commitment:d.commitment});}
 return {serverNow:now,purchasedToday:tickets.filter(t=>Number.isFinite(t.boughtAt)&&lotteryDay(t.boughtAt)===lotteryDay(now)).length,saleDay,drawAt:draw.drawAt,closesAt:draw.drawAt-300000,commitment:draw.commitment,results:results.sort((a,b)=>b.day.localeCompare(a.day)),tickets:tickets.map(t=>({...t,prize:results.find(d=>d.day===t.day)?lotteryPrize(t.number,results.find(d=>d.day===t.day).winner):null}))};
}
export async function applyLotteryAction(db,progress,action,payload,context,now=Date.now()){
 const state=progress.lottery||{tickets:[]};state.tickets||=[];
 if(action==='lottery_buy'){
  const npc=LOTTERY_CONFIG.npc;
  if(context.venue||!Number.isFinite(context.x)||!Number.isFinite(context.z)||Math.hypot(context.x-npc.x,context.z-npc.z)>npc.radius)throw new Error('Hãy đến quầy Thần Tài ở quảng trường.');
  const day=lotterySaleDay(now),draw=await lotteryDraw(db,day);
  if(now>=draw.drawAt-300000)throw new Error('Đã đóng bán. Hãy chờ kỳ quay lúc 20:00.');
  if(state.tickets.filter(t=>Number.isFinite(t.boughtAt)&&lotteryDay(t.boughtAt)===lotteryDay(now)).length>=LOTTERY_CONFIG.dailyLimit)throw new Error('Hôm nay đã mua đủ 5 vé.');
  if(state.tickets.filter(t=>t.day===day).length>=LOTTERY_CONFIG.dailyLimit)throw new Error('Mỗi kỳ chỉ mua tối đa 5 vé.');
  if(progress.coins<LOTTERY_CONFIG.price)throw new Error('Không đủ 100 xu để mua vé.');
  if(payload.number!=null&&(typeof payload.number!=='string'||!/^\d{6}$/.test(payload.number)))throw new Error('Vé cần đúng 6 chữ số.');
  const number=payload.number??String(randomInt(1000000)).padStart(6,'0');
  const ticket={id:randomBytes(12).toString('hex'),day,number,boughtAt:now,claimed:false};
  progress.coins-=LOTTERY_CONFIG.price;state.tickets.push(ticket);progress.lottery=state;
  return {lotteryPurchase:ticket};
 }
 if(action==='lottery_claim'){
  const ticket=state.tickets.find(t=>t.id===payload.ticketId);
  if(!ticket||ticket.claimed)throw new Error('Vé không tồn tại hoặc đã nhận thưởng.');
  if(now<lotteryDrawAt(ticket.day))throw new Error('Chưa đến giờ quay thưởng.');
  const draw=await lotteryDraw(db,ticket.day),prize=lotteryPrize(ticket.number,draw.winner);
  if(!prize)throw new Error('Vé này không trúng thưởng.');
  progress.coins+=prize;ticket.claimed=true;ticket.claimedAt=now;progress.lottery=state;
  return {lotteryReward:prize};
 }
 throw new Error('Thao tác vé không hợp lệ.');
}
