# Farm minimap v2

North-up circular map with matte cream frame, green parcels, cream roads and turquoise water. Terrain translates in world coordinates and never clamps to the edge. Player yaw is converted from Babylon's +Z-forward convention; north stays fixed. Shared village/parcel layouts, coastal-road segments, lake outline and venue entrances drive the map. Boulevard dimensions mirror authored road construction; this does not change the world meshes.

Only four nearby ordinary landmarks may appear. Objective pins take priority over the home pin and ordinary landmarks. Distant ordinary POIs are hidden; home and objective pins clamp to the rim. Overlapping offscreen home pins can move along the rim while keeping their true direction arrow. Markers use the new farm WebP icons. Objective distance is straight-line distance, not path length. The location label truncates on narrow screens and keeps its full name in its title/accessibility label. Buttons open the existing large map.

The memoized terrain layer stays static; only its transform moves. Player sampling is capped at 20 Hz and unchanged snapshots do not trigger another render. No radar sweep, looping pulse or rotating compass. Hidden tabs skip repeated samples; unmount cancels the animation frame.

Validation: `npm run test:minimap` covers four headings, unbounded terrain projection, rim navigation and true bearings, collision priorities across villages, invalid targets, venue entrance coordinates, parcel count and shared coastal segments. HUD runtime checks pass. Browser review checks town/lake/beach/village layouts in actual 390×844 iframe viewports. Screenshots use production HUD components over a neutral background, not an in-world gameplay capture. No physical-device performance measurement or multiplayer session was performed.

Review pages: `/hud-preview.html` and `/minimap-review.html`. Screenshot evidence: `desktop.png` and `mobile-regions.png`.

Final build passes (`npm run build`); the existing large-chunk warning remains. Browser verification confirmed the open-map callback, a fixed north label, no radar sweep, and clipped long labels. The preview root is retained during HMR to prevent duplicate-root warnings after edits.
