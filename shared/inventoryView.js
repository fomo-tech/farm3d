import { FARM_CONFIG, farmBarnCapacity } from './farmConfig.js';
import { FISHING_CONFIG } from './fishingConfig.js';
import { getFashionItem } from './fashionConfig.js';

const CRAFT_NAMES = { flour: 'Bột mì', cheese: 'Phô mai', jam: 'Mứt' };
const OUTFIT_NAMES = { starter: 'Trang phục cơ bản', farmer: 'Trang phục nông dân', rose: 'Trang phục hoa hồng', lake: 'Trang phục hồ nước', royal: 'Trang phục hoàng gia' };

export function buildInventoryView(progress = {}) {
  const stored = Object.entries(progress.inventory || {})
    .filter(([, count]) => Number.isFinite(Number(count)) && Number(count) > 0)
    .map(([id, count]) => ({ id: `produce:${id}`, itemId: id, category: 'produce',
      name: FARM_CONFIG.crops[id]?.name || FARM_CONFIG.products[id]?.name || CRAFT_NAMES[id] || id,
      count: Number(count), kind: FARM_CONFIG.crops[id] ? 'crop' : 'product' }));
  const gear = [
    ...(progress.fishing?.ownedRods || []).map(id => ({ id: `tool:${id}`, itemId: id, category: 'tools', kind: 'rod', name: FISHING_CONFIG.rods[id]?.name || id, count: 1 })),
    ...Object.entries(progress.fishing?.ownedTools || {}).filter(([, owned]) => owned).map(([id]) => ({ id: `tool:${id}`, itemId: id, category: 'tools', kind: 'gear', name: FISHING_CONFIG.tools[id]?.name || id, count: 1 })),
    ...Object.entries(progress.fishing?.bait || {}).filter(([, count]) => Number(count) > 0).map(([id, count]) => ({ id: `tool:${id}`, itemId: id, category: 'tools', kind: 'bait', name: FISHING_CONFIG.baits[id]?.name || id, count: Number(count) })),
  ];
  const outfits = [
    ...(progress.ownedOutfits || []).map(id => ({ id: `fashion:${id}`, itemId: id, category: 'fashion', kind: 'outfit', name: OUTFIT_NAMES[id] || id, count: 1 })),
    ...(progress.ownedCustomization || []).map(id => ({ id: `customization:${id}`, itemId: id, category: 'fashion', kind: 'outfit', name: getFashionItem(id)?.name || id, count: 1 })),
  ];
  const fish = Object.entries(progress.fishing?.fish || {}).filter(([, entry]) => Number(entry?.count ?? entry) > 0)
    .map(([id, entry]) => ({ id: `fish:${id}`, itemId: id, category: 'fish', kind: 'fish', name: FISHING_CONFIG.fish[id]?.name || id, count: Number(entry?.count ?? entry) }));
  return { entries: [...stored, ...gear, ...outfits, ...fish], used: stored.reduce((sum, item) => sum + item.count, 0), capacity: farmBarnCapacity(progress.barnLevel) };
}
