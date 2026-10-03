# Freeze, farm detail and art verification — 2026-10-03

## Reproduced causes

- Browser attribution traced recurring 1.2–3.8 second tasks to `updateWorldClock`. Nested spans reproduced `clock: cinematic preset` at 3716 ms. Babylon 9.29 broadcasts shared image-processing updates to every material; each material scans scene meshes. Runtime grading now uses a separate postprocess configuration, including after quality rebuilds. World material shader settings are not periodically invalidated.
- The old two-neighbour promotion limit allowed older detailed farms to block closer lots. Farm selection now uses a spatial grid, distance priority, a six-neighbour active set, owner pinning and boundary hysteresis. Detail construction remains cooperative, with HLOD visible until completion and cold-cache eviction preserving asset files/state.
- Public farm profiles arriving after terrain promotion did not add buildings. Active public estates now schedule their homes/corrals when that data arrives; distant profiles do not trigger global construction.
- Road-resource checks treated local model coordinates as world coordinates. Flower patches and upgraded homes now pass their parent at spawn; the guard transforms through the full parent matrix. Frozen village-house transforms are recomputed after reparenting, exact house names are selected, and reparented meshes remain tracked for disposal.

## Rendering and loading

- Reduced day/dawn/dusk light intensity, exposure/contrast and sharpening halos; muted meadow/tree greens and dusk sun tint. Native Ultra resolution and hardware MSAA are retained.
- Distant estates have inexpensive gabled silhouettes rather than white debug cubes. Detailed soil/fences/gates replace HLOD nearby.
- Meadow pixel grain runs in a per-scene module Worker using transferred buffers. The worker is terminated on scene disposal. Unsupported workers use small cooperative row batches; base textures stay visible during refinement.
- Chunk/model loading, foliage batching, distance LOD, cold caches, fog and far clipping are existing systems under regression tests. This is not a claim that every static world mesh has been migrated to disk-backed streaming, or that all GLB parsing/GPU work runs in workers. Babylon scene/GPU mutations still run on the rendering thread.
- HUD clocks, bus HUD and world diagnostics update locally rather than forcing the whole App to render at their polling rates. React commit profiling is available in development; normal production React does not provide those commit callbacks. Initial world construction has its own span, so React scheduler attribution does not by itself imply expensive React component rendering.

## Evidence

### Final build acceptance

`docs/streaming-soak-final-2026-10-03.json` is the final 900-second production browser run, including tier-2 homes, model-priority queue, distance-streamed flowers and corrected left-handed HLOD roof faces. The strict verifier passes with no blocking diagnostic entries. There were 151 transitions and 12 complete route cycles, all warm samples visible, Ultra at native 1280×720. Both upgraded homes were observed ready.

- 10th-percentile warm FPS: 41; maximum frame interval: 67 ms.
- No CPU task or frame gap over one second; two CPU tasks over 50 ms (66 and 61 ms).
- Warm mesh range: 13,936–15,039; warm heap range: 377–503 MB, final sample 428 MB.
- Maximum scheduled step: 11.6 ms; zero scheduler overruns.
- Three texture Worker jobs completed, zero pending, longest job 29 ms.
- Final screenshot: `docs/farm-streaming-final-2026-10-03.jpg`.

This verifies the isolated world, not all live online gameplay or every viewport/device. Initial scene construction and the large production bundle remain optimization opportunities.

The final development main-game smoke test entered the existing guest world without creating an account, opened/closed the HUD menu and land panel, and moved from (-7.8, 31.0) to (-4.2, 40.2). At inspection it had 3,774 frames, zero gaps over one second, maximum interval 677.6 ms and maximum CPU task 833 ms (including startup). React profiling recorded 195 commits, maximum 10 ms, with no slow commits; console and blocking diagnostic lists were empty. This short smoke test is not a second 15-minute online soak. Screenshot: `docs/main-game-final-2026-10-03.jpg`.

### Historical runs (not final acceptance)

The frozen production build at port 4188 was used to avoid concurrent Vite hot-refresh restarting the test world.

`docs/streaming-soak-2026-10-03.json` completed the 900-second isolated-world test with 151 transitions and 12 repeat route cycles. The last periodic sample is at 899 seconds; completion is recorded separately after 900 seconds.

- Historical verifier: PASS under the original checks. The stricter verifier now rejects this historical report because the harness omitted its ready signal and emitted a false BOOT TIMEOUT. It is not final acceptance evidence.
- Visible samples throughout warm measurements; the false harness timeout is retained in the raw report, not removed.
- No frame gap or CPU task over one second.
- Maximum frame interval: 167 ms; 10th-percentile FPS: 42.
- Warm mesh range: 13,386–14,576, without unbounded repeat-route growth.
- Maximum scheduled step: 9.3 ms, no step over 50 ms.
- Three CPU tasks over 50 ms: 120, 70 and 51 ms. This is not a claim of zero stutter.
- Heap range: 358–630 MB, ending about 389 MB. A range is not proof that there are no memory leaks.
- Worker completed three texture jobs, no pending jobs, longest worker job 29 ms.

This completed run tested the grading/terrain promotion/late-scope/worker fixes before the subsequent parent-transform and final foliage-palette corrections. Those later changes have separate model-placement unit tests and an additional browser run with upgraded houses; do not silently treat the earlier run as testing later code.

The isolated test does not validate every online feature, React HUD, interiors or multiplayer avatar rendering. A separate eight-client protocol test passed with parallel movement ACKs at 9 ms, using a temporary test database rather than player data. A main-game development run exercised HUD and movement with no recurring phase-change stalls; concurrent hot-refresh interrupted it. A separate earlier production main-game session had no recurring stalls, but was not a scripted full gameplay test.

## Commands

```
npm run test:rendering
npm run test:streaming
npm run test:multiplayer
npm run test:streaming-report -- docs/streaming-soak-final-2026-10-03.json
npm run build
```

Asset validation preserves 57 model files (7.2 MB); farm layout validation preserves 288 lots. No game asset was deleted. The production bundle-size warning remains.
