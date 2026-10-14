# Landscape UI audit — 2026-10-14

Tested compiled component fixtures via `/hud-preview.html?bundled=1`, using the CSS order from the production build. Mobile review uses 844×290, 667×375 and 390×700 with clockwise fallback. This is browser geometry and interaction testing; it does not emulate an iPhone GPU or native keyboard.

## Defects found and fixed

- Inventory lists/detail collapsed to roughly 30px despite a correctly bounded dialog. Compressed fixed chrome; made cards nonshrinking, names visible and the action reachable. Pagination now reads logical game dimensions.
- Supplies rows overlapped because explicit grid rows shrank below the card minimum. Natural scrolling rows and compact horizontal cards now show names; selecting seeds is at the top of detail.
- Character identity fields overlapped tabs because flex layout centred overflowing content. Fields now have natural height inside scrolling controls. Hair thumbnails no longer show an endless loading label.
- Inventory art was stuck in loading after mobile thumbnail engines were intentionally disabled. Existing game icons provide fallback art while preserving item names; desktop captures can replace them.
- Phone and land dialogs used physical portrait dimensions while their parent was rotated. Both now use logical game width/height.
- Fishing and riding bus controls conflicted with generic action/joystick controls. Contextual controls take precedence in these states.
- Confirmation opened during initial render could portal to document body before the game viewport existed. It now resolves the target after DOM commit and uses a compact landscape layout. Mobile backdrop blur is disabled.

## Evidence

`audit.json`: 69 default screen/size observations, no measured out-of-viewport dialogs or buttons clipped by a non-scrollable ancestor. Scrollable content deliberately extends beyond its viewport.

`interactions.json`: 32 tab changes and related observations; additionally checked inventory text search, character name/gender/step progression. `confirm.json`: two viewport tests of the alert dialog; cancel removed the popup. These do not prove every gameplay state or every dynamic modal is correct.

Build, App binding, mobile orientation/keyboard and daily attendance tests passed. Existing bundle-size warnings remain. All transactions in the fixture are mock callbacks, not live account changes.

Final regression check also exercised six PC fixture screens at 1366×768 (`pc-audit.json`), with no measured dialog overflow or hard-clipped controls. Profile preview was compacted on mobile so identity information no longer loses the entire body to the avatar. New landscape overrides are scoped to the mobile-device and logical-landscape classes; PC receives none of them.
