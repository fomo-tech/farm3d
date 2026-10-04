# Scenery streaming changes — 2026-10-04

Implemented:
- Preserve pending foliage builds when switching from detail to far LOD.
- Keep proxy enabled until a dirty/new detailed batch is rebuilt.
- Rebuild cached detail when placement count changes.
- Use a common player world position for foliage and model streaming; camera
  fallback resolves locked targets in world coordinates.
- Flower patches keep a small three-mesh proxy while their original GLBs load.
  Failed loads retain the proxy and clean partial instances before retry.
- Debug counters include lodBatches and missingRepresentations (pending startup
  groups legitimately count as missing until the sliced build runs).

Verified: npm run test:scenery-streaming passes four suites. Regression covers
leaving before the first proxy build, appending placements to cached detail,
10 repeated near/far round trips, cache eviction and transformed player parents.
Production build succeeds; all 57 registered models remain validated.

Browser evidence and limits:
- First development harness completed 60 seconds, 11 transitions, no fatal
  failures, no frame gap over one second. Foliage placements remained 4245.
  Final detail batches 951, enabled detail batches 289, visible LOD batches 551;
  19 chunks still pending. This is NOT proof every pending chunk was rendered.
- A later two-minute dev attempt was reloaded during the run and is invalid.
- Fixed-production follow-up could not complete boot: animation cadence was
  ~1 FPS, max frame gap ~1026 ms, zero measured long tasks, BOOT TIMEOUT.
  Cause of that cadence is unresolved; do not declare this a passed test.
- Fifteen-minute acceptance, shop enter/exit and full visual verification of
  every landscape region remain unverified. The general freeze issue is NOT
  claimed fixed by these changes.
