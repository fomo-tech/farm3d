import { useEffect, useState } from 'react';

// Only the open livestock panel refreshes its timers, not the entire game HUD.
export function LivestockRefresh({ children }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => { if (!document.hidden) setNow(Date.now()); }, 1000);
    return () => clearInterval(timer);
  }, []);
  return children(now);
}
