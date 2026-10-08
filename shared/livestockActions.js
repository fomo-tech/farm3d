import {LIVESTOCK_LIFECYCLE,livestockLife} from './livestockLifecycle.js';
import { FARM_CONFIG, collectFarmProducts, farmBarnCapacity } from './farmConfig.js';

// Runs only against a server-loaded player. Prices and capacity never come from payload.
export function applyLivestockAction(player, action, payload = {}, now = Date.now(), id = () => crypto.randomUUID()) {
  const p = player.progress;
  const animals = player.livestock;
  const definition = Object.hasOwn(FARM_CONFIG.animals, payload.species) ? FARM_CONFIG.animals[payload.species] : null;
  const matches = animal => (payload.id == null || animal.id === payload.id) && (payload.species == null || animal.species === payload.species);
  if (payload.species != null && !definition) throw new Error('Loài vật nuôi không hợp lệ.');
  if (payload.id != null && !animals.some(matches)) throw new Error('Vật nuôi không thuộc đàn của bạn.');
  const pens = { ...p.animalPens };
  // Existing saved herds retain their housing without charging again.
  for (const animal of animals) if (FARM_CONFIG.animals[animal.species]) pens[animal.species] = true;
  const pay = cost => { if (p.coins < cost) throw new Error('Không đủ xu.'); p.coins -= cost; };
  if (action === 'build_pen') {
    if (!definition || pens[payload.species]) throw new Error('Chuồng không hợp lệ hoặc đã xây.');
    pay(definition.penCost); pens[payload.species] = true;
  } else if (action === 'buy_animal') {
    if (!definition || !pens[payload.species]) throw new Error('Hãy xây chuồng trước.');
    if (animals.filter(a => a.species === payload.species).length >= definition.capacity) throw new Error('Chuồng đã đầy.');
    pay(definition.buyCost);
    animals.push({ id: id(), species: payload.species, createdAt: now, lifeVersion: 1, fedAt: 0, productReadyAt: 0 });
  } else if (action === 'feed_animals') {
    const eligible = animals.filter(a => matches(a) && FARM_CONFIG.animals[a.species] && !a.productReadyAt && !livestockLife(a,now).retired);
    if (!eligible.length) throw new Error('Không có vật nuôi cần bắt đầu đợt ăn mới. Hãy thu sản phẩm trước.');
    pay(eligible.reduce((sum, a) => sum + FARM_CONFIG.animals[a.species].feedCost * (FARM_CONFIG.animals[a.species].saleOnly ? 1 : 4), 0));
    for (const a of eligible) { a.fedAt = now; if(a.lifeVersion && !a.matureAt)a.matureAt=now+LIVESTOCK_LIFECYCLE.growthMs[a.species]; a.productYield=FARM_CONFIG.animals[a.species].saleOnly?1:4;a.stolenAmount=0;a.productReadyAt = Math.max(now + FARM_CONFIG.animals[a.species].productMs*a.productYield,a.matureAt||0); }
    p.xp += FARM_CONFIG.care.feedXp; p.stats.animalsFed += eligible.length;
  } else if (action === 'collect_animals') {
    const result = collectFarmProducts(animals.filter(matches), now);
    if (!result.count) throw new Error('Chưa có nông sản sẵn sàng để thu.');
    const used = Object.values(p.inventory).reduce((sum, n) => sum + n, 0);
    if (used + result.count > farmBarnCapacity(p.barnLevel)) throw new Error('Kho đã đầy.');
    for (const [key, count] of Object.entries(result.products)) p.inventory[key] = (p.inventory[key] || 0) + count;
    let selectedIndex = 0;
    player.livestock = animals.map(a => matches(a) ? result.livestock[selectedIndex++] : a); p.xp += result.count * FARM_CONFIG.care.collectXp;
  } else if (action === 'retire_animal') {
    const index=animals.findIndex(a=>a.id===payload.id && matches(a) && livestockLife(a,now).retired);
    if(index<0)throw new Error('Vật nuôi chưa đến lúc nghỉ nuôi.');
    if(animals[index].productReadyAt && !FARM_CONFIG.animals[animals[index].species].saleOnly)throw new Error('Hãy thu sản phẩm cuối trước khi cho nghỉ nuôi.');
    animals.splice(index,1);
  } else if (action === 'sell_animal') {
    const index = animals.findIndex(a => a.id === payload.id && FARM_CONFIG.animals[a.species]?.saleOnly && a.productReadyAt > 0 && a.productReadyAt <= now);
    if (index < 0) throw new Error('Heo chưa trưởng thành hoặc không thuộc đàn của bạn.');
    p.coins += FARM_CONFIG.products[FARM_CONFIG.animals[animals[index].species].product].sellPrice;
    animals.splice(index, 1);
  } else throw new Error('Hành động chăn nuôi không hợp lệ.');
  p.animalPens = pens;
}
