export function createRuntimeAudit(id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`) {
  const events = [];
  const counts = {};
  return {
    record(type, detail = '') {
      counts[type] = (counts[type] || 0) + 1;
      events.push({ type, detail, at: Date.now() });
      if (events.length > 24) events.shift();
    },
    snapshot() { return { pageId: id, counts: { ...counts }, events: events.slice(-8) }; },
  };
}

if (typeof window !== 'undefined') {
  window.__farmRuntimeAudit ||= createRuntimeAudit();
  window.__farmRuntimeAudit.record('entry', performance.getEntriesByType('navigation')[0]?.type || 'unknown');
  if (import.meta.hot) {
    import.meta.hot.on('vite:beforeUpdate', () => window.__farmRuntimeAudit.record('hmr-update'));
    import.meta.hot.on('vite:beforeFullReload', () => {
      window.__farmRuntimeAudit.record('hmr-reload');
      window.__farmDebug?.report('Vite yêu cầu tải lại trang; không phải server game.', 'PAGE RELOAD');
    });
  }
}
