import { farmBarnCapacity } from './farmConfig.js';

function freeze(value) {
  for (const child of Object.values(value)) if (child && typeof child === 'object') freeze(child);
  return Object.freeze(value);
}

// Prices are server-owned. NPC purchases supplement production, not generate coins.
export const NPC_TRADING_CONFIG = freeze({
  version: 2,
  roadside: {
    position: { x: -11.5, z: 60 },
    approach: { x: -6, z: 60 },
    interactionDistance: 8,
    offers: {
      carrot: { id: 'off_1', crop: 'carrot', amount: 5, price: 84 },
      wheat: { id: 'off_2', crop: 'wheat', amount: 4, price: 168 },
      tomato: { id: 'off_3', crop: 'tomato', amount: 3, price: 219 },
      strawberry: { id: 'off_4', crop: 'strawberry', amount: 2, price: 336 },
    },
  },
  orderResetCost: 25,
  orders: {
    starter: { title: 'Bếp nhà Hoa Mai', items: { carrot: 1 }, coins: 65, xp: 40 },
    bakery: { title: 'Tiệm bánh Bình Minh', items: { wheat: 4 }, coins: 145, xp: 70 },
    market: { title: 'Chợ thị trấn', items: { carrot: 2, tomato: 3 }, coins: 220, xp: 110 },
  },
  recipes: {
    flour: { name: 'Bột mì', inputs: { wheat: 2 }, xp: 12, sell: 72 },
    cheese: { name: 'Phô mai', inputs: { milk: 2 }, xp: 20, sell: 96 },
    jam: { name: 'Mứt dâu', inputs: { strawberry: 2 }, xp: 30, sell: 288 },
  },
});

export function isAtRoadsideShop(context = {}) {
  const shop = NPC_TRADING_CONFIG.roadside;
  return !context.venue && Number.isFinite(context.x) && Number.isFinite(context.z)
    && Math.hypot(context.x - shop.position.x, context.z - shop.position.z) <= shop.interactionDistance;
}

export function quoteRoadsidePurchase(progress, payload, context) {
  const offers = NPC_TRADING_CONFIG.roadside.offers;
  if (!isAtRoadsideShop(context)) throw new Error('Hãy đến gian hàng ven đường để mua nông sản.');
  if (!Object.hasOwn(offers, payload.crop)) throw new Error('Gói nông sản không hợp lệ.');
  const offer = offers[payload.crop];
  if (payload.amount !== undefined && (!Number.isSafeInteger(payload.amount) || payload.amount !== offer.amount)) throw new Error('Số lượng gói nông sản không hợp lệ.');
  if (!Number.isSafeInteger(progress.coins) || progress.coins < offer.price) throw new Error('Không đủ xu mua nông sản.');
  const inventory = Object.values(progress.inventory);
  if (inventory.some(n => !Number.isSafeInteger(n) || n < 0)) throw new Error('Tồn kho không hợp lệ.');
  const count = inventory.reduce((sum, n) => sum + n, 0);
  if (!Number.isSafeInteger(count) || count < 0 || count + offer.amount > farmBarnCapacity(progress.barnLevel)) throw new Error('Kho không đủ chỗ cho gói nông sản.');
  // Any client price is deliberately ignored.
  return offer;
}
