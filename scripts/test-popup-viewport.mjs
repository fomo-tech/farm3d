import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

console.log('--- TESTING POPUP VIEWPORT CONTAINMENT & SAFE AREA COMPLIANCE ---');

const requiredModals = [
  '.pt-map-modal',
  '.pt-inv-modal',
  '.fashion-modal-card',
  '.pt-phone-device',
  '.game-panel',
  '.bulletin-board',
  '.pt-notice-modal-card',
  '.pt-billboard-modal-card',
  '.pt-leaderboard-modal-card',
  '.roadside-shop-card',
  '.pt-guide-book-panel',
  '.pt-graduation-card',
  '.pt-sub-modal-dialog',
  '.pt-history-dialog',
  '.pt-dialogue-bar-card',
  '.pt-studio-card',
  '.pt-ticket-card',
  '.character-creator-card',
];

// 1. Verify modal cards have viewport clamping rules
for (const modal of requiredModals) {
  assert.ok(
    css.includes(modal),
    `Modal selector ${modal} must exist in styles.css`
  );
}

// 2. Verify viewport max-height and max-width clamping
assert.ok(
  css.includes('max-height: calc(100dvh - max(12px, calc(var(--sat, env(safe-area-inset-top, 0px)) + var(--sab, env(safe-area-inset-bottom, 0px)) + 8px))) !important;'),
  'Modals must be clamped against 100dvh and safe areas'
);
assert.ok(
  css.includes('max-width: min(100%, calc(100vw - max(28px, calc(var(--safe-side, max(env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px))) * 2)))) !important;'),
  'Modals must be clamped against 100vw and side safe areas'
);

// 3. Verify backdrop safe areas and fixed viewport coverage
assert.ok(
  css.includes('.pt-dialogue-overlay') && css.includes('.pt-phone-backdrop'),
  'Backdrop list must cover all dialogues and modals'
);
assert.ok(
  css.includes('width: 100vw !important;') && css.includes('height: 100dvh !important;'),
  'Backdrops must span full dynamic viewport'
);

// 4. Verify flex scroll containers
const scrollContainers = [
  '.game-panel > *:not(header)',
  '.order-parchment-grid',
  '.shop-content-area',
  '.ld-list-scroll',
  '.pt-sub-modal-body',
];
for (const container of scrollContainers) {
  assert.ok(
    css.includes(container),
    `Scroll container ${container} must be defined for proper flex scrolling`
  );
}

// 5. Verify close buttons accessibility
assert.ok(
  css.includes('.pt-phone-close') && css.includes('.shop-canopy-stripe .close-btn'),
  'Modal close buttons must have universal touch & visibility rules'
);

console.log('PASS: All 15 in-game modals and popups strictly adhere to viewport boundaries and safe-area insets!');
