import React, { useEffect, useState } from 'react';

const cache = new Map();
let queue = Promise.resolve();

// One queued capture per browser task, using the already mounted preview engine.
export function FashionMeshThumbnail({ item, field, capture }) {
  const key = `${field}:${item.id}`;
  const [src, setSrc] = useState(() => cache.get(key));
  useEffect(() => {
    let cancelled = false;
    if (cache.has(key)) { setSrc(cache.get(key)); return; }
    queue = queue.catch(() => {}).then(() => new Promise(resolve => {
      setTimeout(() => {
        if (!cancelled && capture.current) {
          const result = capture.current(item, field);
          if (result) { cache.set(key, result); setSrc(result); }
        }
        resolve();
      }, 50);
    }));
    return () => { cancelled = true; };
  }, [key, item, field, capture]);
  return src
    ? <img className="fashion-mesh-thumbnail" src={src} alt={item.name} width="160" height="160" />
    : <span className="fashion-thumbnail-loading">Đang tạo ảnh…</span>;
}
