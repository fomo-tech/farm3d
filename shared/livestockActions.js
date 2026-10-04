import { FARM_CONFIG, collectFarmProducts, farmBarnCapacity } from './farmConfig.js';

// Runs only against a server-loaded player. Prices and capacity never come from payload.
export function applyLivestockAction(player, action, payload = {}, now = Date.now(), id = () => crypto.randomUUID()) {
  const p = player.progress;
  const animals = player.livestock;
  const definition = FARM_CONFIG.animals[payload.species];
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
    animals.push({ id: id(), species: payload.species, createdAt: now, fedAt: 0, productReadyAt: 0 });
  } else if (action === 'feed_animals') {
    const eligible = animals.filter(a => FARM_CONFIG.animals[a.species] && !a.productReadyAt);
    if (!eligible.length) throw new Error('Không có vật nuôi cần bắt đầu đợt ăn mới. Hãy thu sản phẩm trước.');
    pay(eligible.reduce((sum, a) => sum + FARM_CONFIG.animals[a.species].feedCost, 0));
    for (const a of eligible) { a.fedAt = now; a.productReadyAt = now + FARM_CONFIG.animals[a.species].productMs; }
    p.xp += FARM_CONFIG.care.feedXp; p.stats.animalsFed += eligible.length;
  } else if (action === 'collect_animals') {
    const result = collectFarmProducts(animals, now);
    if (!result.count) throw new Error('Chưa có trứng hoặc sữa sẵn sàng.');
    const used = Object.values(p.inventory).reduce((sum, n) => sum + n, 0);
    if (used + result.count > farmBarnCapacity(p.barnLevel)) throw new Error('Kho đã đầy.');
    for (const [key, count] of Object.entries(result.products)) p.inventory[key] = (p.inventory[key] || 0) + count;
    player.livestock = result.livestock; p.xp += result.count * FARM_CONFIG.care.collectXp;
  } else if (action === 'sell_animal') {
    const index = animals.findIndex(a => a.id === payload.id && FARM_CONFIG.animals[a.species]?.saleOnly && a.productReadyAt > 0 && a.productReadyAt <= now);
    if (index < 0) throw new Error('Heo chưa trưởng thành hoặc không thuộc đàn của bạn.');
    p.coins += FARM_CONFIG.products[FARM_CONFIG.animals[animals[index].species].product].sellPrice;
    animals.splice(index, 1);
  } else throw new Error('Hành động chăn nuôi không hợp lệ.');
  p.animalPens = pens;
}
