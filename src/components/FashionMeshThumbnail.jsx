import React, { useEffect, useState } from 'react';

const cache = new Map();
let queue = Promise.resolve();

// One queued capture per browser task, using the already mounted preview engine.
export function FashionMeshThumbnail({ item, field, capture }) {
  const key = `v3_pt:${field}:${item.id}`;
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
      }, 35);
    }));
    return () => { cancelled = true; };
  }, [key, item, field, capture]);
  return src
    ? <img className="fashion-mesh-thumbnail" src={src} alt={item.name || item.label || ''} width="160" height="160" loading="lazy" decoding="async" />
    : <div className="fashion-slot-shimmer" aria-hidden="true" />;
}

