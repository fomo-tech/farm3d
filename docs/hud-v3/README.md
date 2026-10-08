# HUD v3

Refines the existing production HUD with rounded object silhouettes, brighter studio lighting and consistent raised controls. Backpack has a rectangular body, straps, handle and front pocket; camera and phone have rounded cases; wardrobe uses a chunky shirt silhouette; movement controls use sneakers and directional marks. Currency, quest, profile, map, chat and context controls share a pale, bright palette with restrained shadows and visible pressed states.

Production icons load from `public/assets/hud/v3/` to avoid stale browser caches. The Babylon authoring renderer remains outside the runtime HUD; exported PNGs are used in game.

`desktop.png` shows production HUD components in `/hud-preview.html` over a neutral landscape, not a screenshot of the game world. Desktop appearance was checked this iteration. Previous responsive arrangements remain; this iteration's mobile viewport override did not take effect, so mobile appearance has not been reverified.

Validation: `node scripts/test-hud-runtime.mjs`, `node scripts/test-color-grading.mjs` and `npm run build` pass after the final asset path change. Browser preview reported no errors. Build retains the existing large-chunk warning. Full rendering suite has a previously reported graphics-settings default mismatch (`auto` versus `ultra`).
