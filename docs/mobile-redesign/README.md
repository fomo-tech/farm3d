# Mobile/desktop separation and crash audit — 2026-10-14

The phone screenshot shows Chrome's page failure screen. It does not identify whether the browser process failed from memory pressure, a GPU fault, or another platform error. No physical-device crash diagnosis is claimed.

## Research

- [Apple: Designing for games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games/): adapt game UI to device size, safe areas and touch targets. This web UI uses 44 CSS pixels as the touch baseline; primary action buttons use 52px.
- [Apple: Canvas setup](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/HTML-canvas-guide/SettingUptheCanvas/SettingUptheCanvas.html): larger canvases increase draw cost and memory. No old device-specific numerical limit from that archived guide is treated as a current iPhone limit.
- [Babylon: Optimizing scenes](https://github.com/BabylonJS/Documentation/blob/master/content/features/featuresDeepDive/scene/optimize_your_scene.md): reduce render work and memory overhead, use instances and avoid unnecessary picking.

## Changes

- Start is HTML UI; world allocation begins only after pressing Play. Previously the whole scene constructed behind the title.
- Deleted the obsolete orientation-choice overlay from the production HTML. The actual bundled mobile entry still showed it above the redesigned start. Preview fixtures omitted that overlay and therefore missed this problem.
- Retained native landscape attempts and clockwise fallback when native locking is unavailable.
- Mobile layout overrides require a mobile-device class; a short desktop window no longer receives the added mobile panel layouts. Mobile world detection uses device/coarse-pointer state, not viewport width alone.
- Auto mobile DPR cap 1.5, framebuffer budget 1.2M pixels (Ultra 1.6M); desktop budgets unchanged. FXAA remains enabled. Mobile power preference uses the browser default.
- Mobile omits all-world distant scenic landscapes and village greenbelt decoration batches; primary roads, gates, transport and farm gameplay remain. These scenery layers remain on desktop.
- Mobile HUD: 44px profile/menu/mission/currency targets, 96px joystick, 52px jump/run buttons, spaced edges. Desktop retains its separate HUD.

## Verification scope

Tests cover render budgets, orientation, keyboard, transformed pointer input, name/chat projection, bindings and production build. Browser verification must use `/?bundled=1`, the same output served by the mobile middleware, in addition to development previews. `mobileRenderReview` is a localhost-only switch for geometry checks; it does not emulate iOS GPU behavior. Physical iPhone stability remains unverified until played on the device.

## Bundled cascade defect reproduced

At 390×700 on the actual bundled main entry, DOM bounds showed `#root` at x=-390 with its right edge at 0: the entire rotated game was outside the physical viewport. Its logical size was correct (700×390), but `left` computed to 0. The inline HTML root style overrode the equally-specific external rotation rule in the production stylesheet order. The rotation rule now requires both mobile and rotated classes and explicitly sets all four edges, giving it higher specificity. Development-only component previews had a different HTML style layer and missed this defect.

Additional mobile memory reduction: the character setup uses its existing vector avatar preview; inventory lists use their item artwork without creating another WebGL engine for thumbnails. The playable world remains 3D; PC avatar preview remains 3D.

## Final browser checks

Bundled main entry at 390×700: after the specificity fix, root bounds are x=0, y=0, width=390, height=700 (previously x=-390). Play moves to loading and then character creation. The creation DOM contains one canvas (world) and one SVG avatar preview, with no console errors captured in this run. Bundled desktop entry at 1366×768 has only `is-desktop-device`, root bounds fill that viewport, and its logo/action card are centred vertically. These are desktop browser geometry checks; they do not certify iPhone GPU stability.

Build and tests passed: bindings, boot construction, graphics settings/budgets, mobile orientation/keyboard, rotated pointers, canvas overlay projection and rendering pipeline stability. The standard existing large-chunk warning remains.

## Sharp rendering revision

Following the reported 10–18 FPS and blur, Auto now keeps its render scale at 1 and mobile DPR at up to 2 (Balanced 1.75), bounded by a 1.6M pixel framebuffer. Only explicit Eco scales pixels. A prior WebGL recovery marker no longer forces Eco resolution; it starts with lighter effects instead. Sustained load can reduce atmosphere particles and disable real-time shadows at level 2, preserving image density.

Mobile proximity scans and waterfront audio distance checks run at 10Hz instead of every render frame; direct interaction calls retain immediate checks. Town NPCs beyond 55m do not animate while out of the nearby play area. Mobile far clipping decreases from 270m to 190m in clear mode and to 130m under pressure; desktop distances are unchanged. These reduce work independently of resolution. Tests verify fixed density even after simulated 10–18 FPS pressure; they do not assert measured iPhone FPS.
