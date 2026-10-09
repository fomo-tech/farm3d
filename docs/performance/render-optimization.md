# Render optimization — 2026-10-08

This change preserves authored geometry, textures and render density. It reduces
mesh traversal and GPU submissions; it does not replace the game's art assets.

- Road markings use identical box vertices/UVs in one mesh per road/material on
  desktop as well as mobile. Curbs, sidewalks and solid lamp parts are batched.
- Bus seats/body details are batched by material in the vehicle coordinate frame.
  Wheels, hazard lights, passenger nodes and transparent glass remain independent.
- Gates and flower-cluster LODs retain their geometry with fewer draw meshes.
- Spatial indexing uses finer leaves. Static river/shore/bridge geometry no longer
  enters the moving-mesh list. Token-based actor names avoid matching `bush` as `bus`.
  Explicit mutable bounds, moving lake geometry and livestock remain dynamic.
- Balanced/Auto use 2x desktop MSAA, Ultra retains 4x. Mobile keeps its existing
  policy. Eco alone requests the low-power GPU; other presets request performance.
- The fountain preview runs at 30 FPS and pauses while hidden.

## Local observations

Use `npm run dev:client`, then open
`/performance.html?profile=1&x=1.9&z=13&quality=balanced&seconds=60`.
Wait for scenery construction to finish. The profiler is opt-in and writes no
telemetry. Test the viewport above 900 CSS pixels for the desktop profile and below
900 for the mobile profile; the latter is **not a real phone hardware benchmark**.

Saved post-change desktop snapshot: 1280x720, 48 FPS, 1,879 draw calls,
9,882 scene meshes, 21.46ms average instrumented scene frame, render scale 1.
A preceding desktop checkpoint before road/gate/lamp batching showed 34 FPS,
3,168 draw calls and 15,369 scene meshes. Buses and the spatial-index change were
already applied at that checkpoint, so it is not the original-build baseline.
Snapshots vary with bus positions, day/night, streamed detail and browser load;
these are local diagnostic observations, not a guaranteed FPS improvement on
another device or a controlled GPU benchmark.

The saved mobile-profile checkpoint (before the final gate/lamp/flower batches)
held its intentional 30 FPS cap at 922x1056 with scale 1, 812 draw calls and
12.84ms average scene frame. Actual phone measurements are still required.

## Verification

- `npm run test:render-performance`: batching transforms, transparency, animated
  parts, shadows, finer culling, gates, pipeline stability and cooperative boot.
- `npm run test:streaming`: streaming lifecycle, all livestock, foliage, fog,
  collision and watchdog checks.
- `node scripts/test-roads-connectivity.mjs`: tests actual curb triangles with
  downward rays; junctions and driveway openings survive merged geometry.
- `node scripts/test-graphics-settings.mjs`,
  `node scripts/test-foliage-buffer-isolation.mjs`,
  `node scripts/test-town-spawn.mjs`.
- `npm run build`.

The broad `test:rendering` script reaches a pre-existing Node loader error for
`CharacterChatBubble.css`; the checks listed above pass separately. Existing test
fixtures for streaming/watchdog needed their missing controls/documentElement
fields restored; gameplay logic was not changed for these fixtures.

A final 60-second desktop route traversed 11 positions with no fatal failures,
no gaps over one second, maximum observed RAF gap 100ms, and one long task.
Visible sampled FPS ranged from 31 to 61 (mean 50). This short traversal covers
transitions, not a full multi-cycle memory soak. See `desktop-route-summary.json`.
