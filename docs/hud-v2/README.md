# HUD v2

HUD uses one set of 18 transparent 256px PNGs rendered from simple Babylon geometry. All use the same orthographic camera, directional key, hemisphere fill and six material colors. The art source is `src/game/art/renderHudIcons.js`; `/hud-icon-preview.html` rerenders the contact sheet for inspection. Shipped icons are in `public/assets/hud/v2` (292 KB on disk). The game loads image files; the icon authoring renderer is not imported into the game.

## Changes

- `GameHudTopbar` separates currency and function buttons; buttons retain their original callbacks. Shared with the preview so layout tests use the production markup.
- `AvatarPortrait` renders the actual normalized avatar once per appearance change, caches at most 16 snapshots and disposes its temporary engine. No persistent HUD render loop.
- 13–15px key text, consistent Nunito type, 44–48px menu buttons, restrained borders and shadows. Profile shows true XP including 0%.
- Quest tracker shows one short instruction and retains the full instruction in its tooltip; keyboard activation supports Enter/Space. Step badge no longer stretches across the icon.
- Minimap name and disc are one visual group; small POI markers use colored dots instead of emoji.
- Context action retains its existing action selector and handler, uses the same rendered icon family and no glow loop.
- Chat launcher and expression launcher use rendered objects; in-chat emoji remain available.
- Separate arrangements for desktop, short landscape and narrow portrait. Safe-area offsets remain. Reduced-motion preference disables decorative transitions.

## Validation

`node scripts/test-hud-runtime.mjs` and `node scripts/test-color-grading.mjs` pass. `npm run build` passes. `npm run test:rendering` reaches an existing graphics-settings assertion: expected `auto`, current config `ultra`; HUD work does not change that default.

Browser preview `/hud-preview.html` uses production components with local callbacks over a neutral landscape; it does not create accounts or send server actions. Checked at 1280×720, 844×390 and 390×844. Menu clipping and quest badge stretching found in preview were fixed. Backpack, menu, land action and chat callbacks verified. No browser error logs during preview. Real-device FPS and a complete multiplayer session were not measured.

`desktop.png` is the component preview, not an in-world screenshot. `icons.png` is the rendered object contact sheet.
