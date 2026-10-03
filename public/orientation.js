(function landscapeMode() {
  const isTouchDevice = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) return;

  function update() {
    const portrait = innerHeight > innerWidth;
    document.documentElement.classList.toggle('mobile-portrait', portrait);
    document.documentElement.classList.toggle('mobile-landscape', !portrait);
  }

  async function enterLandscape() {
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      }
    } catch { /* Fullscreen is unavailable in iOS browsers. */ }

    try {
      if (screen.orientation?.lock) await screen.orientation.lock('landscape');
    } catch { /* iOS requires the user to rotate the physical device. */ }

    update();
  }

  addEventListener('resize', update, { passive: true });
  addEventListener('orientationchange', update, { passive: true });
  document.addEventListener('DOMContentLoaded', function () {
    update();
    document.getElementById('landscape-start')?.addEventListener('click', enterLandscape);
  });
})();
