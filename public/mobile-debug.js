(function mobileDebugBootstrap() {
  const startedAt = Date.now();
  const entries = [];
  const params = new URLSearchParams(location.search);
  const flagEnabled = key => params.has(key) && !['0', 'false', 'off'].includes((params.get(key) || '').toLowerCase());
  const forced = flagEnabled('debug') || flagEnabled('mobileDebug');
  document.documentElement.dataset.debug = String(forced);
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
  let constructionStage = '';
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

  function displayReport() {
    const viewport = window.visualViewport;
    const measure = selector => {
      const element = document.querySelector?.(selector);
      if (!element?.getBoundingClientRect) return null;
      const rect = element.getBoundingClientRect();
      const css = getComputedStyle(element);
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height,
        pixels: element.tagName === 'CANVAS' ? [element.width, element.height] : undefined,
        pixelRatio: element.tagName === 'CANVAS' ? element.width / Math.max(1, rect.width) : undefined,
        padding: css.padding, margin: css.margin, transform: css.transform,
        zoom: css.zoom, position: css.position };
    };
    return { version: 'ios-layout-20261005-v6',
      visualViewport: viewport ? { width: viewport.width, height: viewport.height,
        left: viewport.offsetLeft, top: viewport.offsetTop, scale: viewport.scale } : null,
      root: measure('#root'), shell: measure('.game-shell'), canvas: measure('.game-canvas'),
      quality: runtimeSnapshot.graphicsQuality, renderDpr: runtimeSnapshot.renderDpr };
  }

  // Preserve a small last-known sample even if iOS kills the process without an error event.
  let diagnosticUploadPending = false;
  let diagnosticUploadEnabled = isLan || forced;
  function uploadSample(sample) {
    if (!diagnosticUploadEnabled || diagnosticUploadPending || typeof fetch !== 'function') return;
    diagnosticUploadPending = true;
    fetch('/__mobile-diagnostics', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sample), keepalive: true }).then(response => {
      if (response.status === 404) diagnosticUploadEnabled = false;
    }).catch(() => {}).finally(() => { diagnosticUploadPending = false; });
  }
  try {
    const previous = JSON.parse(localStorage.getItem('farm.mobileCheckpoint') || 'null');
    if (previous) uploadSample({ ...previous, previousSession: true });
  } catch { /* No previous checkpoint. */ }


  function systemReport() {
    return [
      `Display: ${textOf(displayReport())}`,
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
      #farm-debug-badge{position:fixed;z-index:2147483646;left:max(8px,env(safe-area-inset-left,0px));bottom:max(8px,env(safe-area-inset-bottom,0px));border:1px solid #67e8f9;border-radius:9px;padding:6px 9px;background:#07151ee8;color:#a5f3fc;font:700 10px/1 system-ui;box-shadow:0 4px 15px #0008}
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
      catch {
        // Clipboard API is unavailable on the phone's HTTP LAN address.
        let field = panel.querySelector('#farm-debug-export');
        if (!field) {
          field = document.createElement('textarea');
          field.id = 'farm-debug-export';
          field.readOnly = true;
          field.setAttribute('aria-label', 'Báo cáo chẩn đoán — chọn và sao chép');
          field.style.cssText = 'width:100%;min-height:120px;color:#fff;background:#172334;font:12px monospace';
          panel.appendChild(field);
        }
        field.value = report;
        field.focus(); field.select();
        this.textContent = 'Giữ vào báo cáo để sao chép';
      }
    };
    if (!forced) badge.style.display = 'none';
    render();
  }

  function render() {
    if (!body) return;
    body.innerHTML = `<div class="info">${escapeHtml(systemReport())}</div>` + entries.map(item =>
      `<div class="${['DEBUG LOG', 'BOOT'].includes(item.type) ? 'info' : 'error'}"><b>${item.time} · ${item.type}</b>\n${item.message.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])}</div>`
    ).join('');
  }

  function report(type, value, detail) {
    const message = [textOf(value), detail ? textOf(detail) : ''].filter(Boolean).join('\n');
    if (forced) console.info(`[debug:${type}]`, message);
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

  if (forced) console.debug = (...values) => report('DEBUG LOG', values.map(textOf).join(' '));

  window.__farmDebug = {
    enabled: forced,
    log(...values) { if (forced) report('DEBUG LOG', values.map(textOf).join(' ')); },
    mark(stage) {
      if (hasReachedReady) return;
      currentStage = stage;
      if (forced) report('BOOT', stage);
      if (stage === 'Creating Babylon world') {
        const bootStartedAt = Date.now();
        setTimeout(() => {
          if (!hasReachedReady && !worldRunning && sessionMetrics.frames === 0) {
            report('BOOT TIMEOUT', `Game chưa sẵn sàng sau ${Math.round((Date.now() - bootStartedAt) / 1000)} giây tải`);
          }
        }, 45000);
      }
      ensureUi(); render();
    },
    report(error, source) { report(source || 'APP ERROR', error); },
    stage(stage) {
      finishStage(); runtimeStage = stage; stageStartedAt = performance.now();
      if (stage.startsWith('stream job:')) constructionStage = stage;
    },
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
    ready() { if (forced) report('BOOT', 'World ready'); hasReachedReady = true; currentStage = 'World ready'; ensureUi(); if (entries.length === 0) panel?.classList.remove('visible'); render(); },
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

  function saveMobileCheckpoint() {
    if (document.visibilityState !== 'visible') return;
    const display = displayReport(), canvas = display.canvas, viewport = display.visualViewport, root = display.root;
    const streamStats = runtimeSnapshot.streamingScheduler || {};
    const foliageStats = runtimeSnapshot.foliageBatches || {};
    const stage = String(constructionStage || runtimeStage || '');
    const bootStages = [
      ['initial world construction', 1], ['boot: open world', 2], ['boot: countryside', 3],
      ['boot: farm proxy', 4], ['boot: bus route', 5], ['boot: foliage prototypes', 6],
      ['boot: village gate', 7], ['boot: winding river', 8], ['boot: rendering pipeline', 11],
      ['boot: atmosphere', 12], ['boot: meadow texture', 13], ['boot: player model', 14],
      ['boot: farm animals', 15], ['boot: animal pen', 16],
    ];
    const bootStageCode = hasReachedReady ? 10 : bootStages.find(([label]) => stage.includes(label))?.[1] || 0;
    const sample = { buildRevision: 2026100511, time: Date.now(), fps: runtimeSnapshot.fps, meshes: runtimeSnapshot.meshes,
      textures: runtimeSnapshot.textures, materials: runtimeSnapshot.materials, geometries: runtimeSnapshot.geometries,
      activeMeshes: runtimeSnapshot.activeMeshes, bootStageCode, ready: hasReachedReady,
      foliagePlacements: foliageStats.placements, foliageDetailBatches: foliageStats.detailBatches,
      foliageLodBatches: foliageStats.lodBatches, schedulerPending: streamStats.pending,
      renderWidth: runtimeSnapshot.renderWidth, renderHeight: runtimeSnapshot.renderHeight,
      renderDpr: runtimeSnapshot.renderDpr, nativeDpr: devicePixelRatio || 1,
      layoutWidth: innerWidth, layoutHeight: innerHeight,
      rootX: root?.x, rootY: root?.y, rootWidth: root?.width, rootHeight: root?.height,
      canvasX: canvas?.x, canvasY: canvas?.y, canvasWidth: canvas?.width, canvasHeight: canvas?.height,
      viewportWidth: viewport?.width || innerWidth, viewportHeight: viewport?.height || innerHeight,
      viewportLeft: viewport?.left, viewportTop: viewport?.top, viewportScale: viewport?.scale,
      pending: streamStats.pending, maxStepMs: streamStats.maxStepMs,
      contextLost: webglContextLost };
    try { localStorage.setItem('farm.mobileCheckpoint', JSON.stringify(sample)); } catch {}
    uploadSample(sample);
  }
  setInterval(saveMobileCheckpoint, 5000);
  document.addEventListener('DOMContentLoaded', saveMobileCheckpoint);
})();
