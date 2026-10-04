import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../styles.css';
import { FashionBoutiqueModal } from '../../components/FashionBoutiqueModal.jsx';
import { getDefaultCustomization } from '../../../shared/fashionConfig.js';

function Preview() {
  const [custom, setCustom] = useState(getDefaultCustomization());
  const [owned, setOwned] = useState([]);
  const [coins, setCoins] = useState(180);
  const [open, setOpen] = useState(true);
  const [audit, setAudit] = useState('Đang đo');
  useEffect(() => {
    let previous = performance.now(), maxGap = 0, frame = 0, longTasks = 0, maxTask = 0;
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) { longTasks++; maxTask = Math.max(maxTask, entry.duration); }
    });
    observer.observe({ type: 'longtask', buffered: true });
    const measure = now => { if (document.visibilityState === 'visible') maxGap = Math.max(maxGap, now - previous); previous = now; frame = requestAnimationFrame(measure); };
    frame = requestAnimationFrame(measure);
    const timer = setInterval(() => setAudit(`Max gap: ${Math.round(maxGap)}ms · Long tasks: ${longTasks} · Max task: ${Math.round(maxTask)}ms`), 1000);
    return () => { cancelAnimationFrame(frame); clearInterval(timer); observer.disconnect(); };
  }, []);
  return <><button onClick={() => setOpen(true)}>Mở cửa hàng thử nghiệm</button><output>Xu thử nghiệm: {coins} · {audit}</output>
    {open && <FashionBoutiqueModal currentCustomization={custom} ownedItems={owned} coins={coins} onClose={() => setOpen(false)}
      onSaveAndEquip={(next, ids, cost) => { setCustom(next); setOwned(prev => [...prev, ...ids]); setCoins(prev => prev - cost); setOpen(false); }} />}</>;
}
const root = import.meta.hot?.data.root || createRoot(document.getElementById('root'));
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<Preview />);
