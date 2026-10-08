# Farm HUD WebP family

Art direction: simple rounded game props, matte shading, coral orange, turquoise and warm ivory. Avoid metallic frames, realistic textures and fine decorative details. The bright backpack from the previous revision is the style reference.

The built-in image_gen tool generates each asset separately with a transparent background. The exact shared prompt and subjects are recorded in `prompts.json`; selected original images are retained in `originals/`. cwebp exports each runtime image to 256×256 at quality 90 while preserving alpha.

Runtime destination: `public/assets/hud/farm-v2/`. Includes the 18 HUD objects and additional map, market and settings icons for the phone menu. Authoring review page: `/hud-webp-preview.html`, with light and dark backgrounds and 40px previews. Existing HUD callbacks remain in place.

Validation: all 21 runtime assets are 256×256 RGBA WebP with transparent pixels, total 201,942 bytes. Browser contact sheet loaded all 42 image instances (large and small) without failures. Production HUD preview loaded all visible HUD icons from the new path and reported no browser errors. `node scripts/test-hud-runtime.mjs`, `node scripts/test-color-grading.mjs`, `git diff --check` and `npm run build` pass. Build retains the existing large-chunk warning. Phone app-grid icons were integrated and compiled; a full in-world multiplayer session and mobile appearance were not reverified.

`icons.png` shows the complete family on light and dark backgrounds; `desktop.png` shows the production HUD components over a neutral preview background, not the in-world game.
