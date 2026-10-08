import {FARM_CONFIG} from './farmConfig.js';
import {farmOrigin} from './farmSecurity.js';
import {FARM_LOT_SPEC} from './farmLayout.js';
export function livestockProductAmount(animal){return Math.max(0,(animal.productYield||1)-(animal.stolenAmount||0));}
export function livestockTheftPosition(farmId,animals,id){
 const origin=farmOrigin(farmId),animal=animals.find(a=>a.id===id),slot=FARM_CONFIG.livestockVisuals.slots[animal?.species];
 if(!origin||!slot)return null;
 const index=animals.filter(a=>a.species===animal.species).findIndex(a=>a.id===id);
 const [x,z]=[[-.55,-.38],[.55,-.38],[0,.62]][index%3],anchor=FARM_LOT_SPEC.anchors.corral||FARM_LOT_SPEC.anchors.barn;
 return {x:origin.x+anchor.x+slot[0]+x,z:origin.z+anchor.z+slot[1]+z};
}
export function livestockTheftPolicy({animal,owner,gateOpen,now,claimedAt=0,playerCount=0,farmCount=0}){
 const cfg=FARM_CONFIG.security.theft,def=FARM_CONFIG.animals[animal?.species];
 if(!cfg.enabled||owner)return {error:'Không thể lấy sản phẩm trong chuồng của bạn.'};
 if(!gateOpen)return {error:'Cổng đã đóng. Không thể ăn trộm.'};
 if(now-claimedAt<cfg.newFarmProtectionMs)return {error:'Nông trại mới đang được bảo vệ.'};
 if(cfg.dailyLimitsEnabled&&(playerCount>=cfg.dailyPlayerLimit||farmCount>=cfg.dailyFarmLimit))return {error:'Đã hết lượt ăn trộm hôm nay.'};
 if(!def||def.saleOnly)return {error:'Chỉ có thể lấy trứng, sữa hoặc len; không lấy vật nuôi.'};
 if(!animal.productReadyAt||animal.productReadyAt>now)return {error:'Sản phẩm chăn nuôi chưa sẵn sàng.'};
 if(animal.stolenAmount)return {error:'Đợt sản phẩm này đã bị lấy một lần.'};
 const amount=Math.floor((animal.productYield||1)*(1-cfg.ownerRetainedRatio));
 return amount>0?{amount,product:def.product}:{error:'Đợt sản phẩm này được bảo vệ toàn bộ.'};
}
