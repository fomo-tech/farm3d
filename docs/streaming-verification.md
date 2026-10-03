# Streaming verification

## Changes under test

- Farm detail is built cooperatively by `FrameBudgetScheduler`, retaining HLOD until completion.
- Returning to a recently visited farm reuses its detail roots. Cold, unoccupied detail over the eight-farm budget is evicted in scheduler steps, retaining placement and crop data.
- Farm gates/buildings preserve world coordinates when parented to their chunk. Parent tier visibility, not per-child overrides, controls cached buildings.
- House and corral eviction does not dispose scene-shared materials. Hidden corral/crop animation is skipped.
- Foliage thin-instance detail is cached, with a 32-cell cold-cache target and gradual eviction beyond five cells. Tree placement records and asset files are retained.
- Spatial-index insertion is sliced; pending meshes remain visible and removed meshes are removed from the index.
- Network callback duration and Long Animation Frame script attribution supplement render-stage measurements. Missing attribution is explicitly unknown, not guessed to be GC.

The scheduler is cooperative, not a worker thread: a single generator step can exceed its 2.5 ms batch target. Its actual maximum and steps exceeding 50 ms are reported. Asset I/O is asynchronous; Babylon scene/GPU mutation still runs on the main thread. This is not a claim that every world asset has been converted to worker-based streaming.

## Reproduce

1. Run `npm run test:streaming`, `npm run test:multiplayer`, and `npm run build`.
2. With Vite running, open `/performance.html?debug=1` and press **Start 15-minute test**.
3. Keep the test document visible; do not edit runtime modules during the run (HMR restarts the scene).
4. The test revisits twelve route positions, every six seconds, using the production world, full farm buildings/animals, scheduler, fog, collision and model loaders. It uses local fake farm profiles, not account writes.
5. Export the report and run `npm run test:streaming-report -- <report.json>`.

The verifier requires completion, at least ten route cycles, visible measurements, zero gaps/tasks over one second, no fatal failures, no scheduled step over 50 ms, 10th-percentile FPS at least 30 and bounded repeat-route mesh growth. Heap range is reported, not treated as proof of no memory leak.

## Scope limits

The isolated-world soak does not validate React HUD work, real network message handling, multiplayer avatar rendering, interiors, bus travel or every device/GPU. An eight-client protocol test separately verifies concurrent presence, movement and disconnect. A successful isolated soak alone is not sufficient to declare all game freezes fixed.

Browser observation/disconnection problems are recorded separately. An interrupted or background-throttled test must not be called a pass.

## Observed on 2026-10-03

- Seven streaming/lifecycle/safety regression scripts passed, including shared corral materials, cached building visibility and unloaded tile state.
- Eight-client isolated server protocol test passed: parallel movement acknowledgements took 8 ms. The temporary test database was removed by its guarded cleanup; no player database was deleted.
- Asset validation: 57 models, 7.2 MB; farm layout validation: 288 lots, no overlap. Production build passed (bundle-size warning remains).
- Full-farm browser test reached 287 seconds and 48 transitions before interruption: instantaneous FPS 31, 13,578 meshes, 9 cached farms including the owner, maximum scheduled step 13.8 ms, maximum observed frame interval 150 ms, no gaps over 1 second, nine tasks over 50 ms.
- The run did NOT complete 15 minutes. `GraphicsSettings.js` was modified outside this change set at 20:26:24 local time; HMR reset the test. These partial readings are not a final pass and do not prove all online-game freezes resolved.
- Browser control also timed out on older tabs. The debug panel obscured report controls until hidden. Neither issue has been attributed to GC or network failure without evidence.
- After the concurrent graphics change, `test-graphics-settings.mjs` failed at line 16: actual scale 1, expected 0.95. The changed graphics policy was preserved rather than silently reverted or weakening the assertion.
