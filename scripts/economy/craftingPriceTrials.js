import {FARM_CONFIG} from '../../shared/farmConfig.js';
import {NPC_TRADING_CONFIG} from '../../shared/npcTradingConfig.js';
export const CRAFTING_PRICE_POLICIES=[{id:'current',premium:null},{id:'premium10',premium:.1},{id:'premium20',premium:.2},{id:'premium30',premium:.3}];
export function evaluateCraftingPrices(policy) {
 if(!policy||typeof policy.id!=='string'||(policy.premium!==null&&(!Number.isFinite(policy.premium)||policy.premium<0)))throw new Error('Invalid price policy');
 const config=NPC_TRADING_CONFIG;
 const recipes=Object.entries(config.recipes).map(([id,r])=>{
  const rawValue=Object.entries(r.inputs).reduce((n,[key,qty])=>n+qty*(FARM_CONFIG.crops[key]?.sellPrice??FARM_CONFIG.products[key]?.sellPrice??0),0);
  const sell=policy.premium===null?r.sell:Math.ceil(rawValue*(1+policy.premium));
  const margin=sell-rawValue;
  const purchased=Object.keys(r.inputs).every(key=>config.roadside.offers[key]);
  const npcCost=purchased?Object.entries(r.inputs).reduce((n,[key,qty])=>n+qty*config.roadside.offers[key].price/config.roadside.offers[key].amount,0):null;
  const loops=[];
  // Whole-pack loops, including selling leftovers. The fractional bound additionally
  // covers arbitrarily many packs, rather than relying on this finite sample.
  if(purchased&&Object.keys(r.inputs).length===1){const [key,needed]=Object.entries(r.inputs)[0],offer=config.roadside.offers[key];
   for(let packs=1;packs<=100;packs++){const quantity=packs*offer.amount,crafted=Math.floor(quantity/needed),left=quantity-crafted*needed;loops.push({packs,profit:crafted*sell+left*FARM_CONFIG.crops[key].sellPrice-packs*offer.price});}
  }
  return {id,name:r.name,rawValue,sell,margin,npcCost,npcMargin:npcCost===null?null:sell-npcCost,wholePackMaxProfit:loops.length?Math.max(...loops.map(l=>l.profit)):null,workshopPaybackCrafts:null,safeNpcLoop:npcCost===null?null:sell<npcCost};
 });
 const orderRevenue=Object.values(config.orders).reduce((n,o)=>n+o.coins,0)-config.orderResetCost;
 const orderCost=Object.values(config.orders).reduce((n,o)=>n+Object.entries(o.items).reduce((v,[key,qty])=>{const offer=config.roadside.offers[key];return v+qty*offer.price/offer.amount;},0),0);
 return {policy:policy.id,recipes,orderCycleMargin:orderRevenue-orderCost,verifiedNoNpcProfit:recipes.every(r=>r.safeNpcLoop!==false)&&orderRevenue<orderCost};
}
