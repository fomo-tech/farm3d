# Performance implementation — 2026-10-04

## Implemented

- Cooperative generators for base world, countryside, roads, river, landscape,
  village amenities and roadside scenery. Existing synchronous exports retained.
- Interiors constructed on demand, with concurrent request deduplication.
- Serial model loading; instance creation runs inside a measured, priority-aware
  2.5 ms queue. One synchronous callback cannot be preempted.
- Spatial indexing begins before secondary scenery; nearby shadow filtering
  applies during construction as well as after boot.
- Auto defaults to native-resolution balanced effects, then reduces effects,
  then resolution in small steps (floor 85%). Explicit Ultra preserves resolution.
- Reduced ambient/sun/rim brightness and default material specular response.
  Neutral tone mapping remains enabled, bloom and FXAA remain disabled.
- Low-cost sharpening retained in Eco. Added queue and Auto diagnostics/tests.

## Validation and limits

Rendering tests, streaming tests and production build passed. Build still warns
about the large FarmWorld bundle. Browser entered World ready without a fatal
JavaScript error in the first run, at viewport 1280x720, DPR 2, position (0,18).
That run measured maximum frame gap 750.7 ms, zero gaps over one second,
model spawn maximum 20.6 ms, construction maximum step 110.1 ms, and 15–23 FPS.
This is not a controlled comparison with the user's different viewport/location.

Subsequent development HMR rebuilds recorded a glTF import callback around
1076 ms and a frame gap around 1123 ms. Counters accumulate across HMR and
these samples overlapped build/testing activity. They are evidence that the
problem is NOT fully resolved, not a clean performance benchmark.

## Remaining acceptance work

- Split the remaining atomic construction helpers exceeding 50 ms, with named
  helper-level timings, rather than assuming every generator step is bounded.
- Identify the offending glTF import/parse/material initialization and simplify
  or partition that asset offline. Serial loading is not worker-based parsing.
- Profile Babylon render CPU/GPU and reduce visible draw calls/material variants;
  current measured FPS does not meet a smooth-play acceptance target.
- Validate a clean production cold load and a ten-minute traversal on desktop
  and a real iPhone, including interiors, vehicles and reconnects.
- Measure frame-time percentiles and compare daytime white/skin highlights in
  matching scenes. Lower light intensity alone does not prove no clipping.

Do not present this implementation as a guaranteed 60 FPS or zero-stall fix.
