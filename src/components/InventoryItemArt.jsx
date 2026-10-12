import React from 'react';

// Loading state only: the caller replaces this with a captured 3D mesh image.
// Never substitute a hand-drawn item for a model that has not loaded yet.
export function InventoryItemArt({ item, size = 48 }) {
  return <span className="item-mesh-loading" role="status" aria-label={`Đang tải mô hình ${item?.name || 'vật phẩm'}`} style={{width:size,height:size}}><span className="item-mesh-loading-shadow" aria-hidden="true"/></span>;
}
