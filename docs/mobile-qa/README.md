# Mobile UI review — 2026-10-13

Reviewed 23 component screens at 844×290, 667×375 and 390×667 using the in-app browser. The preview and main game now share `src/gameStyles.js` so their CSS import order is identical. Preview fixtures do not change a real player's inventory or attendance.

`layout-audit.json` contains 69 DOM observations: no dialog outside the viewport, no buttons clipped by a non-scrollable ancestor, and no overflow inside attendance reward cards or phone app grids. Scrollable content intentionally extends beyond its container and remains reachable. These observations do not prove every subtab or gameplay state is correct.

Fixed short-landscape layouts for inventory, vehicle showroom, farm market, supplies, ranking, lounge, character creation, fashion, world map and attendance. Kept headers and footer actions stable while allowing content to scroll. Corrected keyboard viewport sizing without changing portrait orientation during text entry.

Interaction checks in preview: mounting an owned bicycle changes its action to “Đang sử dụng”; attendance claim changes the reward to claimed and disables duplicate claim; entering a name, changing gender and advancing to hair selection works at 844×290.

Validation passed: production build, mobile orientation/viewport tests (including keyboard), App binding test, daily attendance rules and existing popup containment assertions. Build retains the existing large-chunk warning.

Scope: browser viewport simulation and component fixtures. Physical iOS/Android touch input, native orientation locks, safe-area hardware behavior and sustained device FPS still require device testing. No claim is made that all gameplay or network states have been exercised.

![Attendance at 844×290](attendance-844x290.png)

## Portrait lock fallback — 2026-10-14

When native landscape locking is unavailable, portrait phones render the logical game viewport clockwise. Joystick axes and Babylon canvas pointer/picking coordinates are mapped into that viewport. Focusing a text input temporarily returns to the normal portrait layout for the native keyboard. Native landscape removes the transform.

Browser checks at 390×844: attendance claim and owned vehicle mount succeed; map and inventory dialogs remain within the physical viewport. `test-rotated-pointer.mjs` verifies corners, centre, original orientation and listener cleanup; viewport tests exercise fallback sizing and keyboard.

GPU pressure mitigations: live showroom/boutique previews stop preserving their drawing buffers; boutique DPR is capped at 1.25 on coarse-pointer devices; mobile facial textures use 512 pixels for local/arrival faces and 256 for others. A detected world WebGL context loss enables Eco on subsequent world construction during the same tab session. These are mitigations, not a confirmed diagnosis of the reported physical-device crash. Abrupt OS process termination may not produce a WebGL context-loss event.
