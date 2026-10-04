# Follow-up: reported location -69,122

User reports scenery disappears both when orbiting the camera and after travel.
Placement inspection found 14 woodland trees within 60 metres of this location.
Fresh browser initialization at that location displayed nearby trees.
The precise original main-game failure has not been captured in the controlled
browser; its single root cause remains unproven.

Mitigation: distance-managed foliage in the player's chunk and neighbouring
ring bypasses mesh/submesh frustum rejection. Far batches retain ordinary
frustum culling. Flags update on ring changes and on newly built batches.
No asset removal and no global culling disable.

Regression tests: test:scenery-streaming passes; test-foliage-camera.mjs passes
with real oak geometry at the reported location, 20 reversed camera targets,
correct placement bounds and restoration of normal culling when travelling far.

Fixed-production browser test: 72 seconds, Ultra 1280x720; initial location
-69,122; orbit=1. Completed one route cycle, 13 transitions, automatic movement
4 metres at each point; final position -65,122, same chunk -1:1.
No fatal failures, no frame gaps above 1000 ms; max frame gap 150 ms,
maximum long CPU task 144 ms. Last FPS 22 (not a 60 FPS acceptance).
Final foliage: 4245 placements, 383 enabled detailed meshes, 541 visible LOD
batches, zero missing representations, zero pending foliage chunks.
Maximum startup scheduler step 41.7 ms, zero scheduler overruns.

This supports the bounded mitigation for the reproduced traversal/orbit route;
it does not establish that all main-game scenery failures or the unrelated
long-session freeze are fixed. Full 15-minute acceptance remains outstanding.
Screenshot: scenery-camera-return-2026-10-04.png.
