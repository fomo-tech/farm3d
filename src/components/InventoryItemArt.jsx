import { HudIcon } from './icons3d/HudIcon.jsx';

// A usable fallback also covers mobile lists, which intentionally do not
// create a second WebGL engine just to capture thumbnails.
export function InventoryItemArt({ item, size = 48 }) {
  const asset = item?.category === 'fashion' ? 'wardrobe'
    : item?.category === 'fish' ? 'fish'
    : item?.category === 'tools' ? 'fishing' : 'basket';
  return <HudIcon asset={asset} size={size} alt={item?.name || 'Vật phẩm'} />;
}
