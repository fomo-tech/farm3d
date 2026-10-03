(function mobileDebugBootstrap() {
  const startedAt = Date.now();
  const entries = [];
  const params = new URLSearchParams(location.search);
  const forced = params.get('debug') === '1' || params.get('mobileDebug') === '1';
  const isLan = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(location.hostname);
  let panel;
  let body;
  let badge;
  let currentStage = 'HTML loaded';

  function textOf(value) {
    if (value instanceof Error) return value.stack || value.message || String(value);
    if (typeof value === 'string') return value;
    try { return JSON.stringify(value); } catch { return String(value); }
  }

  function systemReport() {
    return [
      `URL: ${location.href}`,
      `Stage: ${currentStage}`,
      `Time: ${new Date().toISOString()}`,
      `Viewport: ${innerWidth}x${innerHeight} @ DPR ${devicePixelRatio || 1}`,
      `Online: ${navigator.onLine}`,
      `Memory: ${navigator.deviceMemory || 'unknown'} GB`,
      `CPU: ${navigator.hardwareConcurrency || 'unknown'} cores`,
      `UA: ${navigator.userAgent}`,
    ].join('\n');
  }

  function ensureUi() {
    if (panel || !document.body) return;
    const style = document.createElement('style');
    style.textContent = `
      #farm-debug-badge{position:fixed;z-index:2147483646;left:8px;bottom:8px;border:1px solid #67e8f9;border-radius:9px;padding:6px 9px;background:#07151ee8;color:#a5f3fc;font:700 10px/1 system-ui;box-shadow:0 4px 15px #0008}
      #farm-debug-panel{position:fixed;z-index:2147483647;inset:8px;display:none;flex-direction:column;overflow:hidden;border:2px solid #fb7185;border-radius:14px;background:#100f18f5;color:#fff;box-shadow:0 12px 50px #000d;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}
      #farm-debug-panel.visible{display:flex}#farm-debug-panel header{display:flex;align-items:center;gap:8px;padding:10px;background:#3f1725}#farm-debug-panel header b{flex:1;color:#fecdd3;font:800 13px system-ui}
      #farm-debug-panel button{border:1px solid #ffffff55;border-radius:8px;padding:6px 9px;background:#ffffff14;color:#fff;font:700 11px system-ui}#farm-debug-body{flex:1;overflow:auto;padding:10px;white-space:pre-wrap;word-break:break-word}
      #farm-debug-body .error{margin:8px 0;padding:9px;border-left:3px solid #fb7185;background:#4c1324;color:#ffe4e6}#farm-debug-body .info{color:#bae6fd}
    `;
    document.head.appendChild(style);
    badge = document.createElement('button');
    badge.id = 'farm-debug-badge';
    badge.type = 'button';
    badge.textContent = 'DEBUG';
    badge.onclick = function () { panel.classList.add('visible'); render(); };
    panel = document.createElement('section');
    panel.id = 'farm-debug-panel';
    panel.innerHTML = '<header><b>MOBILE DEBUG · FARM ONLINE 3D</b><button id="farm-debug-copy">Sao chép</button><button id="farm-debug-close">Ẩn</button></header><div id="farm-debug-body"></div>';
    document.body.appendChild(badge);
    document.body.appendChild(panel);
    body = panel.querySelector('#farm-debug-body');
    panel.querySelector('#farm-debug-close').onclick = function () { panel.classList.remove('visible'); };
    panel.querySelector('#farm-debug-copy').onclick = async function () {
      const report = systemReport() + '\n\n' + entries.map(item => `[${item.time}] ${item.type}\n${item.message}`).join('\n\n');
      try { await navigator.clipboard.writeText(report); this.textContent = 'Đã sao chép'; }
      catch { this.textContent = 'Không thể sao chép'; }
    };
    if (forced) panel.classList.add('visible');
    if (!forced && !isLan) badge.style.display = 'none';
    render();
  }

  function render() {
    if (!body) return;
    body.innerHTML = `<div class="info">${systemReport()}</div>` + entries.map(item =>
      `<div class="error"><b>${item.time} · ${item.type}</b>\n${item.message.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])}</div>`
    ).join('');
  }

  function report(type, value, detail) {
    const message = [textOf(value), detail ? textOf(detail) : ''].filter(Boolean).join('\n');
    entries.push({ type, message, time: new Date().toLocaleTimeString('vi-VN') });
    if (entries.length > 30) entries.shift();
    ensureUi();
    panel?.classList.add('visible');
    render();
  }

  window.__farmDebug = {
    mark(stage) { currentStage = stage; ensureUi(); render(); },
    report(error, source) { report(source || 'APP ERROR', error); },
    ready() { currentStage = 'World ready'; ensureUi(); if (!forced) panel?.classList.remove('visible'); render(); },
    getReport() { return { stage: currentStage, entries: entries.slice(), system: systemReport() }; },
  };

  window.addEventListener('error', function (event) {
    if (event.target && event.target !== window) {
      const url = event.target.src || event.target.href || event.target.currentSrc || event.target.tagName;
      report('RESOURCE LOAD ERROR', `Không tải được: ${url}`);
      return;
    }
    report('JAVASCRIPT ERROR', event.error || event.message, `${event.filename || ''}:${event.lineno || 0}:${event.colno || 0}`);
  }, true);
  window.addEventListener('unhandledrejection', function (event) { report('UNHANDLED PROMISE', event.reason); });
  window.addEventListener('offline', function () { report('NETWORK', 'Thiết bị đã mất kết nối mạng'); });
  document.addEventListener('DOMContentLoaded', ensureUi);

  setTimeout(function () {
    if (currentStage !== 'World ready') report('BOOT TIMEOUT', `Game chưa sẵn sàng sau ${Math.round((Date.now() - startedAt) / 1000)} giây`);
  }, 15000);
})();
