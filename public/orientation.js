(function landscapeMode() {
  function detectIsMobileDevice() {
    const ua = navigator.userAgent || '';
    const isMobileUA = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isMobileClientHint = navigator.userAgentData?.mobile === true;
    const isTouch = (matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);
    // iPadOS Safari reports MacIntel with touch points
    const isIPadOS = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1 && screen.width <= 1366;
    // Real mobile devices typically have min dimension under 900px
    const minDim = Math.min(window.screen.width, window.screen.height);
    const isMobileFormFactor = minDim <= 900;

    return (isMobileUA || isMobileClientHint || isIPadOS) && isTouch && isMobileFormFactor;
  }

  const reviewMobile = typeof location !== 'undefined' && location.hostname === 'localhost' && new URLSearchParams(location.search).has('mobileRenderReview');
  const isMobile = reviewMobile || detectIsMobileDevice();
  const doc = document.documentElement;

  if (!isMobile) {
    // Pure Desktop Device: Ensure guard is never shown
    doc.classList.add('is-desktop-device');
    doc.classList.remove('is-mobile-device', 'mobile-portrait');
    const guard = document.getElementById('landscape-guard');
    if (guard) guard.style.display = 'none';
    return;
  }

  doc.classList.add('is-mobile-device');
  // Chrome's iOS embedding can retain native content insets with cover after
  // rotation. Let it own those insets rather than adding the same safe area
  // again inside the page. Safari keeps its edge-to-edge viewport.
  const standalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches;
  const chromeIOS = /CriOS/i.test(navigator.userAgent) && !standalone;
  if (chromeIOS) {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) viewportMeta.setAttribute('content',
      'width=device-width, initial-scale=1.0, viewport-fit=contain');
    doc.classList.add('chrome-ios-contained');
  }


  let viewportFrame = null;
  function isGuardDismissed() {
    try {
      return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('vibe_city_portrait_opt_in_v2') === 'true';
    } catch {
      return false;
    }
  }

  let lastW = '';
  let lastH = '';
  function update() {
    const viewport = window.visualViewport;
    // Pinch zoom belongs to the browser; never resize the game underneath it.
    if (viewport && Math.abs(viewport.scale - 1) > 0.01) return;
    const layoutPortrait = (window.innerHeight || 0) > (window.innerWidth || 0);
    const viewportPortrait = Boolean(viewport && viewport.height > viewport.width);
    const editing = document.activeElement?.matches?.('input, textarea, [contenteditable="true"]') === true;
    const keyboardOpen = Boolean(viewport && editing && Math.abs(viewport.width - window.innerWidth) < 30
      && viewport.height < window.innerHeight * .8);
    const useVisualViewport = Boolean(keyboardOpen || (!standalone && viewport && (layoutPortrait === viewportPortrait || !window.innerWidth)));
    let width = useVisualViewport ? (viewport?.width || window.innerWidth) : (window.innerWidth || viewport?.width);
    const height = useVisualViewport ? (viewport?.height || window.innerHeight) : (window.innerHeight || viewport?.height);

    if (chromeIOS) {
      // Chrome can keep a wider layout viewport behind its landscape controls.
      // Only use measurements in the current orientation while metrics settle.
      const landscape = width >= height;
      const clientWidth = doc.clientWidth;
      const portraitWidth = Math.min(window.screen.width, window.screen.height);
      const candidates = [width, window.innerWidth, clientWidth].filter((value, index) =>
        Number.isFinite(value) && value > 0 &&
        (index === 0 || !landscape || value > Math.max(height, portraitWidth)));
      width = Math.min(...candidates);
    }

    const rotate = layoutPortrait && !editing;
    doc.classList.toggle('mobile-rotated', rotate);
    const roundedW = `${Math.round(rotate ? height : width)}px`;
    const roundedH = `${Math.round(rotate ? width : height)}px`;
    if (lastW !== roundedW) {
      lastW = roundedW;
      doc.style.setProperty('--game-viewport-width', roundedW);
    }
    if (lastH !== roundedH) {
      lastH = roundedH;
      doc.style.setProperty('--game-viewport-height', roundedH);
    }

    const portrait = keyboardOpen ? layoutPortrait : height > width;
    doc.classList.toggle('mobile-portrait', portrait);
    doc.classList.toggle('mobile-landscape', rotate || !portrait);

    if (isGuardDismissed()) {
      doc.classList.add('guard-dismissed');
      document.getElementById('landscape-guard')?.classList.add('is-dismissed');
    }
  }

  function updateHint() {
    const hintEl = document.querySelector('#landscape-device-hint .hint-text');
    if (!hintEl) return;
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    if (isIOS) {
      hintEl.textContent = 'Mở khóa xoay màn hình (Trung tâm điều khiển) rồi xoay ngang máy';
    } else {
      hintEl.textContent = 'Bật tự động xoay màn hình rồi xoay ngang máy để bắt đầu';
    }
  }

  let locking = false;
  let enteringFullscreen = false;
  async function lockLandscape() {
    if (locking || isGuardDismissed() || !screen.orientation?.lock) return;
    locking = true;
    try {
      await screen.orientation.lock('landscape');
    } catch { /* Unsupported browsers retain the physical-rotation hint. */ }
    finally { locking = false; update(); }
  }

  async function enterLandscape() {
    if (enteringFullscreen || isGuardDismissed()) return;
    enteringFullscreen = true;
    try {
      if (doc.requestFullscreen && !document.fullscreenElement) {
        try { await doc.requestFullscreen({ navigationUI: 'hide' }); }
        catch { /* Native landscape locking can still work in an installed app. */ }
      }
      await lockLandscape();
    } finally { enteringFullscreen = false; update(); }
  }

  // Installed apps may allow locking immediately. Browser tabs typically need
  // a gesture to enter fullscreen, so retry on the first touch without a menu.
  void lockLandscape();
  document.addEventListener('pointerdown', event => {
    if (event.target?.closest?.('#landscape-dismiss, input, textarea, select, [contenteditable="true"]')) return;
    void enterLandscape();
  }, { once: true, passive: true });
  document.addEventListener('fullscreenchange', () => { void lockLandscape(); queueUpdate(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) void lockLandscape(); });

  function queueUpdate() {
    if (viewportFrame !== null) return;
    viewportFrame = requestAnimationFrame(() => { viewportFrame = null; update(); });
  }

  let settlingTimers = [];
  function handleOrientationShift() {
    settlingTimers.forEach(clearTimeout);
    queueUpdate();
    if (typeof window.scrollTo === 'function' && (window.scrollX !== 0 || window.scrollY !== 0)) {
      window.scrollTo(0, 0);
    }
    if (typeof setTimeout === 'function') {
      // WebKit may publish portrait or intermediate metrics first, then settle
      // without another resize event. Re-read the layout viewport smoothly.
      settlingTimers = [150, 450, 900].map(delay => setTimeout(() => {
        if (typeof window.scrollTo === 'function' && (window.scrollX !== 0 || window.scrollY !== 0)) {
          window.scrollTo(0, 0);
        }
        queueUpdate();
      }, delay));
    }
  }

  document.addEventListener('focusin', queueUpdate);
  document.addEventListener('focusout', queueUpdate);
  addEventListener('resize', queueUpdate, { passive: true });
  addEventListener('orientationchange', handleOrientationShift, { passive: true });
  window.visualViewport?.addEventListener('resize', queueUpdate, { passive: true });
  window.visualViewport?.addEventListener('scroll', () => {
    // Viewport offsets belong to fixed positioning; do not resize or shift variables on scroll.
  }, { passive: true });
  addEventListener('pageshow', handleOrientationShift, { passive: true });
  update();

  document.addEventListener('DOMContentLoaded', function () {
    if (isGuardDismissed()) {
      doc.classList.add('guard-dismissed');
      document.getElementById('landscape-guard')?.classList.add('is-dismissed');
    }
    update();
    updateHint();

    document.getElementById('landscape-start')?.addEventListener('click', async function () {
      await enterLandscape();
      const hintText = document.querySelector('#landscape-device-hint .hint-text');
      if (hintText) {
        hintText.textContent = 'Hãy lật ngang điện thoại để thưởng thức góc nhìn toàn cảnh!';
      }
    });

    document.getElementById('landscape-dismiss')?.addEventListener('click', function () {
      doc.classList.add('guard-dismissed');
      const guard = document.getElementById('landscape-guard');
      if (guard) {
        guard.classList.add('is-dismissed');
      }
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('vibe_city_portrait_opt_in_v2', 'true');
        }
      } catch { /* storage restricted */ }
    });
  });
})();
