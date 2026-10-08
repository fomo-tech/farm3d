import { useEffect, useState } from 'react';
import { normalizeCustomization } from '../../shared/fashionConfig.js';
const cache = new Map();
let queue = Promise.resolve();
export function AvatarPortrait({ customization, avatar }) {
  const key = JSON.stringify(normalizeCustomization(customization || {}));
  const [failedAvatar, setFailedAvatar] = useState(null);
  const photo = avatar && failedAvatar !== avatar;
  const [image, setImage] = useState(null);
  useEffect(() => {
    if (photo) return;
    let alive = true;
    setImage(cache.get(key) || null);
    if (!cache.has(key)) {
      queue = queue.catch(() => {}).then(async () => {
        if (!alive) return;
        const { renderAvatarPortrait } = await import('../game/art/renderAvatarPortrait.js');
        const src = await renderAvatarPortrait(JSON.parse(key));
        if (cache.size >= 16) cache.delete(cache.keys().next().value);
        cache.set(key, src);
        if (alive) setImage(src);
      }).catch(error => window.__farmDebug?.report(error, 'HUD PORTRAIT'));
    }
    return () => { alive = false; };
  }, [key, photo]);
  if (photo) return <img className="pt-avatar-img pt-user-photo" src={avatar} alt="" draggable="false" onError={() => setFailedAvatar(avatar)} />;
  return image ? <img className="pt-avatar-img" src={image} alt="" draggable="false" /> : <span className="hud-portrait-placeholder" aria-hidden="true">●</span>;
}
