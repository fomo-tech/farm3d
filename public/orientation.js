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

  const isMobile = detectIsMobileDevice();
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

  function update() {
    const portrait = window.innerHeight > window.innerWidth;
    doc.classList.toggle('mobile-portrait', portrait);
    doc.classList.toggle('mobile-landscape', !portrait);

    // If rotated to landscape, reset dismissed state so it will trigger next time in portrait if needed
    if (!portrait) {
      document.getElementById('landscape-guard')?.classList.remove('is-dismissed');
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

  async function enterLandscape() {
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      }
    } catch { /* Fullscreen is unavailable in iOS browsers. */ }

    try {
      if (screen.orientation?.lock) {
        await screen.orientation.lock('landscape');
      }
    } catch { /* iOS requires the user to rotate the physical device. */ }

    update();
  }

  addEventListener('resize', update, { passive: true });
  addEventListener('orientationchange', update, { passive: true });

  document.addEventListener('DOMContentLoaded', function () {
    update();
    updateHint();
    document.getElementById('landscape-start')?.addEventListener('click', enterLandscape);
    document.getElementById('landscape-dismiss')?.addEventListener('click', function () {
      document.getElementById('landscape-guard')?.classList.add('is-dismissed');
    });
  });
})();
