# Runtime performance QA — 2026-10-03

Verdict: FAIL. Do not describe the freezing issue as fixed.

## Actual browser observations

Tested a fresh local browser tab at http://localhost:4177/?debug=1.
Existing 5181 tab could not be controlled: Emulation.setFocusEmulationEnabled timeout.
Quality: ultra. Viewport initially 1280x720, later 621x818 at DPR 1.2.
Multiple local game tabs and development HMR were present, so these measurements
are not an isolated hardware benchmark. Browser-control timeouts occurred too.

- Initial reproduction: 3 FPS, 27,413 meshes, 5,760 active meshes,
  11,835 dynamic candidates, 909 nearby shadow casters, 2,832ms frame gap.
- After changes: observed 22–30 FPS between stalls. Near the end,
  21,268 meshes, 2,702 active meshes, 1,780 dynamic candidates, 689 shadow casters.
- Still observed: 5–9 FPS snapshots and 2,196–5,440ms frame gaps.
- One startup/reinitialization had a reported 11,139ms long task and boot timeout.
- Successfully clicked Start and opened the phone/menu.
- Travel click failed with a browser focus-emulation timeout; position remained
  0,18. Movement, collision traversal, purchases and a long multiplayer gameplay
  session are NOT verified by this browser test.
- Diagnostics show overlapping measured stages, not definitive CPU flame-chart
  attribution. An "asset instantiation complete" stage can include idle time
  before the next render, so it must not be asserted as the blocking function.

## Changes tested

- Late static meshes now enter the spatial index rather than all remaining dynamic.
- Pending foliage instance creation yields every 16 placements.
- Asset instantiation is scheduled one job per timer turn.
- Models farther than 140m from the camera target defer loading until approached.
- Repeated untinted models use hardware instancing instead of forced cloning.
- receiveShadows is configured on the source of an instanced mesh.

## Automated checks

Build, asset validation, 288-lot layout validation, render-index tests,
nearby-shadow tests and runtime-watchdog tests passed.
Eight-client WebSocket integration test passed (~10ms movement ACK).
These checks do not establish acceptable interactive performance.

## Remaining work

Obtain CPU-task attribution independent of stage wall-clock labels, account for
HMR/reinitialization and concurrent tabs, reduce remaining scene/asset overhead,
and repeat movement/travel testing in a stable production preview. Acceptance
requires stable frame times, responsive controls and no multi-second stalls;
the observed session does not meet that requirement.

## Follow-up live retest (same day)

Additional fixes: the `?debug=1` diagnostics panel no longer opens over the
entire game on load or on a performance warning; it opens automatically only
for fatal errors. Foliage outside the nearby area is deferred and existing
foliage is recycled after moving away, instead of permanently accumulating
mesh instances. The land market renders 36 listings at a time, with a button
to fetch the next 36. Desktop shadow-map size is 1024 rather than 2048.

Using a local browser test tab connected to the WebSocket server, the Start
button opened the game, the phone/menu opened, travel to the town center moved
the character from (0,18) to (0,20), and the land market opened and closed.
The market DOM contained 36 lot buttons and the "show more" button. The
diagnostics badge remained small after performance warnings; it did not block
interaction. An eight-client WebSocket test passed and the production build
passed after the changes.

At 1280x720, sampled in-game FPS ranged roughly 30–50 during this retest.
At 1919x1039, sampled FPS was roughly 24–33. Scene meshes were 13k–17k
while assets streamed in; this test did not run long enough to prove a final
plateau. The debug log still recorded a 3.9-second long task and a 2.6-second
frame gap during the retest. The "asset instantiation complete" stage was
misleading because its timer remained open until a later frame; that label is
now closed at the actual end of each instantiation, but the underlying long
task has not been attributed or eliminated. The original user
tab on port 5181 remained open, so this is not a single-tab GPU benchmark.
Verdict remains PARTIAL: major interaction blockers and a source of unbounded
foliage accumulation are addressed, but smooth 60 FPS at large viewport and
long-session stability are not yet demonstrated. Further work should use a
Chrome CPU/GPU performance trace while the late model queue drains, then
reduce or batch whichever asset constructors actually occupy the long task.
