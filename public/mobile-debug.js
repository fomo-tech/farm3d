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
  let hasReachedReady = false;
  let lastFrameAt = 0;
  let lastFrameWarningAt = 0;
  let worldRunning = false;
  let runtimeStage = 'not started';
  let runtimeSnapshot = {};
  let lastTickAt = Date.now();
  let lastPerformanceWarningAt = 0;
  let lastLongTaskWarningAt = 0;
  let blockedSince = 0;
  let stageStartedAt = null;
  // Reuse a fixed ring buffer. The old push/shift implementation allocated
  // several objects per rendered frame and eventually caused multi-second GC.
  const stageTimings = Array.from({ length: 96 }, () => ({ stage: '', start: 0, end: 0, duration: 0 }));
  let stageTimingCursor = 0;
  let stageTimingCount = 0;
  const slowCallbacks = [];
  const animationFrames = [];
  const sessionMetrics = { revision: 'streaming-audit-v2', frames: 0, maxFrameGapMs: 0, frameGapsOver1000: 0, longTasks: 0, maxLongTaskMs: 0 };
  let lastFramePerformanceAt = 0;
  let lastVisibilityChangeAt = Date.now();
  let webglContextLost = false;
  document.addEventListener('visibilitychange', () => {
    lastVisibilityChangeAt = Date.now();
    // Background render suspension is intentional, not a foreground frame gap.
    lastFrameAt = Date.now();
    lastFramePerformanceAt = 0;
    lastTickAt = Date.now();
    blockedSince = 0;
  });
  document.addEventListener('webglcontextlost', () => { webglContextLost = true; }, true);
  document.addEventListener('webglcontextrestored', () => { webglContextLost = false; }, true);
  function recordCallback(stage, start, end) {
    if (end - start < 4) return;
    slowCallbacks.push({ stage, start, end, duration: end - start });
    if (slowCallbacks.length > 80) slowCallbacks.shift();
  }
  function finishStage() {
    if (stageStartedAt === null) return;
    const end = performance.now();
    const slot = stageTimings[stageTimingCursor];
    slot.stage = runtimeStage;
    slot.start = stageStartedAt;
    slot.end = end;
    slot.duration = end - stageStartedAt;
    recordCallback(runtimeStage, stageStartedAt, end);
    stageTimingCursor = (stageTimingCursor + 1) % stageTimings.length;
    stageTimingCount = Math.min(stageTimingCount + 1, stageTimings.length);
    stageStartedAt = null;
  }
  const escapeHtml = value => String(value).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

  function textOf(value) {
    if (value instanceof Error) return value.stack || value.message || String(value);
    if (typeof value === 'string') return value;
    try { return JSON.stringify(value); } catch { return String(value); }
  }

  function systemReport() {
    return [
      `URL: ${location.href}`,
      `Stage: ${currentStage}`,
      `Runtime stage: ${runtimeStage}`,
      `Last runtime snapshot: ${textOf(runtimeSnapshot)}`,
      `Runtime counters: ${textOf(sessionMetrics)}`,
      `React profile: ${textOf(window.__farmReactMetrics || null)}`,
      `Time: ${new Date().toISOString()}`,
      `Viewport: ${innerWidth}x${innerHeight} @ DPR ${devicePixelRatio || 1}`,
      `Online: ${navigator.onLine}`,
      `Render lifecycle: ${textOf({ visibility: document.visibilityState, focused: document.hasFocus(), lastVisibilityChangeAt, webglContextLost })}`,
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
    if (!forced && !isLan) badge.style.display = 'none';
    render();
  }

  function render() {
    if (!body) return;
    body.innerHTML = `<div class="info">${escapeHtml(systemReport())}</div>` + entries.map(item =>
      `<div class="error"><b>${item.time} · ${item.type}</b>\n${item.message.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])}</div>`
    ).join('');
  }

  function report(type, value, detail) {
    const message = [textOf(value), detail ? textOf(detail) : ''].filter(Boolean).join('\n');
    entries.push({ type, message, time: new Date().toLocaleTimeString('vi-VN') });
    if (entries.length > 30) entries.shift();
    try { localStorage.setItem('farm.lastDiagnostic', JSON.stringify({ stage: runtimeStage, snapshot: runtimeSnapshot, entries, time: Date.now() })); } catch { /* Storage may be disabled. */ }
    ensureUi();
    const blocking = ['JAVASCRIPT ERROR', 'UNHANDLED PROMISE', 'WORLD RENDER', 'WEBGL', 'FATAL GAME ERROR', 'WORLD INITIALIZATION', 'BOOT TIMEOUT'];
    if (blocking.includes(type)) panel?.classList.add('visible');
    else if (badge) {
      badge.style.display = '';
      badge.textContent = 'DEBUG · ' + entries.length;
    }
    render();
  }

  window.__farmDebug = {
    mark(stage) { if (hasReachedReady) return; currentStage = stage; ensureUi(); render(); },
    report(error, source) { report(source || 'APP ERROR', error); },
    stage(stage) { finishStage(); runtimeStage = stage; stageStartedAt = performance.now(); },
    endStage() { finishStage(); runtimeStage = 'outside measured render work'; },
    snapshot(value) { runtimeSnapshot = value; },
    measure(name, callback) {
      const start = performance.now();
      try { return callback(); }
      finally { recordCallback(name, start, performance.now()); }
    },
    frame() {
      finishStage();
      const now = Date.now();
      const frameNow = performance.now();
      if (worldRunning && document.visibilityState === 'visible' && lastFramePerformanceAt) {
        const gap = frameNow - lastFramePerformanceAt;
        sessionMetrics.frames++;
        sessionMetrics.maxFrameGapMs = Math.max(sessionMetrics.maxFrameGapMs, gap);
        if (gap > 1000) sessionMetrics.frameGapsOver1000++;
      }
      lastFramePerformanceAt = frameNow;
      if (worldRunning && document.visibilityState === 'visible' && now - lastFrameAt > 2000 && now - lastPerformanceWarningAt > 15000) {
        lastPerformanceWarningAt = now;
        const recentStages = stageTimings.slice(0, stageTimingCount).filter(item => item.end > performance.now() - (now - lastFrameAt)).sort((a, b) => b.duration - a.duration).slice(0, 4);
        const costs = recentStages.map(item => `${item.stage}: ${Math.round(item.duration)}ms`).join('; ');
        report('FRAME GAP', `Khung hình bị gián đoạn ${now - lastFrameAt}ms. Công đoạn đo được: ${costs || 'không có tác vụ render trong khoảng ngắt; cần xem LONG MAIN THREAD TASK'}. FPS ${runtimeSnapshot.fps ?? '?'}, mesh ${runtimeSnapshot.meshes ?? '?'}, độ phân giải ${runtimeSnapshot.renderWidth ?? '?'}x${runtimeSnapshot.renderHeight ?? '?'}. Chưa kết luận nguồn gây ngắt ngoài render.`);
      }
      worldRunning = true;
      lastFrameAt = now;
    },
    stopFrames() { worldRunning = false; },
    ready() { hasReachedReady = true; currentStage = 'World ready'; ensureUi(); if (entries.length === 0) panel?.classList.remove('visible'); render(); },
    getReport() { return { stage: currentStage, runtimeStage, snapshot: runtimeSnapshot, metrics: { ...sessionMetrics }, react: window.__farmReactMetrics || null, slowCallbacks: slowCallbacks.slice(), animationFrames: animationFrames.slice(), entries: entries.slice(), system: systemReport() }; },
  };

  setInterval(function () {
    const now = Date.now();
    const tickGap = now - lastTickAt;
    lastTickAt = now;
    if (!worldRunning || document.visibilityState !== 'visible') return;
    if (tickGap > 5000 && now - lastPerformanceWarningAt > 15000) {
      lastPerformanceWarningAt = now;
      report('MAIN THREAD STALL', `Luồng giao diện bị chặn khoảng ${tickGap - 2000}ms. Công đoạn cuối: ${runtimeStage}. Báo cáo được hiển thị khi trình duyệt phản hồi trở lại.`);
    }
    const movement = runtimeSnapshot.movement;
    if (movement?.input && movement.speed < 0.01 && !movement.ridingBus) {
      blockedSince ||= now;
      if (now - blockedSince > 4000 && now - lastFrameWarningAt > 20000) {
        lastFrameWarningAt = now;
        report('MOVEMENT BLOCKED', movement.collided
          ? `Nhân vật đang bị collider chặn tại ${runtimeSnapshot.x}, ${runtimeSnapshot.z}; cảnh vẫn dựng khung hình. Kiểm tra tường/rào tại vị trí này.`
          : `Có input di chuyển nhưng vị trí không đổi tại ${runtimeSnapshot.x}, ${runtimeSnapshot.z}. FPS: ${runtimeSnapshot.fps}.`);
      }
    } else blockedSince = 0;
    if (now - lastFrameAt >= 8000 && now - lastFrameWarningAt >= 20000) {
      lastFrameWarningAt = now;
      report('RENDER STALL', `Không có khung hình mới trong ${Math.round((now - lastFrameAt) / 1000)} giây. Giai đoạn: ${currentStage}. Tab: ${document.visibilityState}; focus: ${document.hasFocus()}; WebGL context lost: ${webglContextLost}. Nếu trang bị khóa hoàn toàn, cảnh báo chỉ hiện khi luồng giao diện hoạt động trở lại.`);
    }
  }, 2000);

  // Long-task entries survive a main-thread pause and identify the last instrumented stage.
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      const observer = new PerformanceObserver(list => {
        const task = list.getEntries().reduce((result, entry) => !result || entry.duration > result.duration ? entry : result, null);
        const longest = task?.duration || 0;
        if (worldRunning && document.visibilityState === 'visible' && longest > 50) {
          sessionMetrics.longTasks++;
          sessionMetrics.maxLongTaskMs = Math.max(sessionMetrics.maxLongTaskMs, longest);
        }
        // A FRAME GAP must not suppress the CPU attribution for that same freeze.
        if (worldRunning && document.visibilityState === 'visible' && longest > 1000 && Date.now() - lastLongTaskWarningAt > 15000) {
          lastLongTaskWarningAt = Date.now();
          const matches = slowCallbacks.filter(item => item.start < task.startTime + task.duration && item.end > task.startTime);
          const slowest = matches.sort((a, b) => b.duration - a.duration).slice(0, 4);
          const detail = slowest.length ? slowest.map(item => `${item.stage}: ${Math.round(item.duration)}ms`).join('; ') : 'Tác vụ ngoài render được đo; chưa xác định nguồn (tải asset, xử lý mạng hoặc GC).';
          report('LONG MAIN THREAD TASK', `JavaScript chiếm ${Math.round(longest)}ms. Các công đoạn đo được trong cùng tác vụ: ${detail}. Đây là thời gian CPU, không phải lỗi mất kết nối.`);
        }
      });
      observer.observe({ type: 'longtask', buffered: true });
    } catch { /* Not supported in every browser. */ }
  }

  if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame')) {
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (!worldRunning || entry.duration < 100) continue;
        const scripts = entry.scripts.map(script => ({
          duration: Math.round(script.duration), invoker: script.invoker,
          sourceURL: script.sourceURL, sourceFunctionName: script.sourceFunctionName,
          sourceCharPosition: script.sourceCharPosition, forcedLayoutMs: Math.round(script.forcedStyleAndLayoutDuration || 0),
        })).sort((a, b) => b.duration - a.duration).slice(0, 5);
        animationFrames.push({ start: entry.startTime, duration: Math.round(entry.duration), scripts });
        if (animationFrames.length > 30) animationFrames.shift();
        if (entry.duration > 1000 && scripts.length) {
          report('SLOW FRAME SOURCE', JSON.stringify({ duration: Math.round(entry.duration), scripts }));
        }
      }
    });
    observer.observe({ type: 'long-animation-frame', buffered: false });
  }

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
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') { lastFrameAt = Date.now(); lastTickAt = Date.now(); blockedSince = 0; lastFramePerformanceAt = 0; }
  });
  document.addEventListener('DOMContentLoaded', ensureUi);

  setTimeout(function () {
    if (!hasReachedReady && currentStage !== 'World ready' && !worldRunning && sessionMetrics.frames === 0) {
      report('BOOT TIMEOUT', `Game chưa sẵn sàng sau ${Math.round((Date.now() - startedAt) / 1000)} giây`);
    }
  }, 45000);
})();
