export const CITY_CARS=Object.freeze([
 {id:'roadster',name:'Roadster',price:0,color:'#406f96',description:'Xe khởi đầu · 2 chỗ · mui trần'},
 {id:'roadster-gt',name:'Roadster GT',price:900,color:'#a64636',description:'Bản GT cùng khung xe · cánh gió sau'},
]);
export const CITY_PAINTS=Object.freeze(['#406f96','#a64636','#d1c8b5','#283238','#768567']);
export const CITY_PAINT_PRICE=60;
export const cityRepairCost=health=>Math.ceil((100-Math.max(0,Math.min(100,health)))*2);
export function cityRecoveryQuote(g,coins){const emergency=g.health[g.selected]===0&&coins<275;return {emergency,cost:emergency?Math.min(75,Math.max(0,coins)):75};}
export function cityVehicleHealth(progress){const g=cityGarageState(progress.city);return g.health[g.selected];}
export function cityGarageState(city={}){
 const raw=city.garage||{},known=new Set(CITY_CARS.map(c=>c.id));
 const owned=[...new Set(['roadster',...(Array.isArray(raw.owned)?raw.owned.filter(id=>known.has(id)):[])])];
 const selected=owned.includes(raw.selected)?raw.selected:'roadster';
 const paints=Object.fromEntries(owned.map(id=>[id,CITY_PAINTS.includes(raw.paints?.[id])?raw.paints[id]:CITY_CARS.find(c=>c.id===id).color]));
 const health=Object.fromEntries(owned.map(id=>[id,Number.isFinite(raw.health?.[id])?Math.max(0,Math.min(100,raw.health[id])):100]));
 return {owned,selected,paints,health,lastImpactAt:Number.isFinite(raw.lastImpactAt)?raw.lastImpactAt:0};
}
export function applyCityImpact(progress,state,context,now){
 if(!context.trustedCityImpact||progress.vehicle!=='convertible'||context.venue)throw Error('Va chạm không hợp lệ.');
 const speed=context.impactSpeed,g=cityGarageState(state);
 if(!Number.isFinite(speed)||speed<3||now-g.lastImpactAt<2500)return 0;
 const damage=Math.min(35,Math.max(5,Math.round(speed*1.5)));
 g.health[g.selected]=Math.max(0,g.health[g.selected]-damage);g.lastImpactAt=now;state.garage=g;
 if(g.health[g.selected]===0&&state.contract){const id=state.contract.id;state.contract=null;state.lastResult={status:'failed',id,at:now,message:'Xe đã hỏng. Chuyến hàng thất bại; xuống xe và tới garage gọi cứu hộ.'};}
 return damage;
}
export function applyCityGarage(progress,state,action,payload,context){
 if(context.venue||Math.hypot(context.x-20,context.z-13)>15)throw Error('Hãy tới garage trung tâm.');
 if(context.wantedStars>0)throw Error('Garage tạm đóng khi bạn đang bị truy nã.');
 if(state.contract)throw Error('Hoàn thành hoặc hủy chuyến hàng trước khi đổi xe.');
 if(progress.vehicle!=='walk')throw Error('Hãy đỗ xe và xuống xe trước khi dùng garage.');
 const g=cityGarageState(state),car=CITY_CARS.find(c=>c.id===payload.id);
 const spend=amount=>{if(!Number.isFinite(progress.coins)||progress.coins<amount)throw Error('Không đủ tiền.');progress.coins-=amount;};
 let message;
 if(action==='city_garage_buy'){
  if(!car||car.price<=0)throw Error('Xe không hợp lệ.');
  if(g.owned.includes(car.id))throw Error('Bạn đã sở hữu xe này.');
  spend(car.price);g.owned.push(car.id);g.paints[car.id]=car.color;message=`Đã mua ${car.name} · -$${car.price}`;
 }else if(action==='city_garage_select'){
  if(!car||!g.owned.includes(car.id))throw Error('Bạn chưa sở hữu xe này.');
  if(Math.hypot(state.carPosition.x-20,state.carPosition.z-13)>5)throw Error('Hãy đưa xe đang dùng về garage trước, hoặc gọi cứu hộ.');
  g.selected=car.id;state.carPosition={x:20,z:13};message=`Đã đưa ${car.name} ra ô đỗ garage`;
 }else if(action==='city_garage_paint'){
  if(!CITY_PAINTS.includes(payload.color))throw Error('Màu sơn không hợp lệ.');
  if(g.paints[g.selected]===payload.color)throw Error('Xe đang dùng màu này.');
  spend(CITY_PAINT_PRICE);g.paints[g.selected]=payload.color;message=`Đã sơn xe · -$${CITY_PAINT_PRICE}`;
 }else if(action==='city_garage_repair'){
  if(Math.hypot(state.carPosition.x-20,state.carPosition.z-13)>5)throw Error('Đưa xe về garage trước khi sửa.');
  const cost=cityRepairCost(g.health[g.selected]);if(!cost)throw Error('Xe không cần sửa.');
  spend(cost);g.health[g.selected]=100;message=`Đã sửa xe · -$${cost}`;
 }else if(action==='city_garage_recover'){
  const quote=cityRecoveryQuote(g,progress.coins);
  if(Math.hypot(state.carPosition.x-20,state.carPosition.z-13)<5&&!quote.emergency)throw Error('Xe đã ở garage.');
  spend(quote.cost);state.carPosition={x:20,z:13};
  if(quote.emergency)g.health[g.selected]=20;
  message=quote.emergency?`Cứu hộ khẩn cấp · -$${quote.cost} · xe chạy tạm ở độ bền 20%`:`Đã đưa xe về garage · -$${quote.cost}`;
 }else throw Error('Thao tác garage không hợp lệ.');
 state.garage=g;return message;
}
