# Boot streaming investigation — 2026-10-04

## Acceptance: FAILED, not complete

Browser test: production preview localhost:4179, performance.html?debug=1&tier2=1&seconds=300&quality=ultra.
Loaded build: FarmWorld-27d577f3.js. Render resolution 1918 x 1039.
User confirmed keeping the window and test tab foreground. That does NOT prove
the browser never throttled its animation frames; attribution remains unresolved.

Completed 300 seconds, 4 route cycles, 51 transitions, 298 samples.
Median sampled FPS: 7. Frame gaps over 1000 ms: 153; largest: 1601 ms.
Longest main-thread task: 1551 ms. No fatal initialization failures.
An animation-frame attribution recorded a 1552 ms IMG[blob URL].onload callback.
The local Babylon loader implementation calls its texture continuation inside
that callback. This establishes the image/texture loading path, NOT whether
decode, GPU upload, glTF completion or garbage collection dominates it.
Many other ~1001 ms frame gaps had only ~30–60 ms of measured script work.
Do not conflate those with the measured 1551 ms CPU task or dismiss either.

Startup scheduler maximum: 60.4 ms, one overrun labelled market landscaping.
Inspection found the label persisted into the subsequent six-citizen batch.
Those citizens are now yielded individually with explicit phase labels.
That final source change passed test:boot, but has NOT had a fresh browser soak.

## Changes made

- Cooperative road, market, plaza, bus, animal and river bridge construction.
- Explicit boot phase labels and slowest-step statistics; warning threshold unchanged.
- Individual town citizen construction steps.
- Tighter distant foliage detail range, bounded foliage batch work.
- Far clip follows the fog boundary, preserving nearby full assets.
- Explicit graphics quality override for the isolated testing harness.
- Geometry-parity and boot-wiring regression test: npm run test:boot.

No game asset deletion was performed. These changes are partial improvements,
not evidence of a complete fix. Previous October 3 passing soak results must
not be presented as acceptance of this October 4 build.

## Follow-up required

1. Instrument Babylon image-load continuations with asset identity and separate
   decode, upload and loader-completion timing before selecting a fix.
2. Investigate the recurring 1 Hz animation cadence independently of CPU tasks.
3. Rebuild and repeat the same full-resolution route test after the final citizen split.
4. Verify the real React/online game separately; this harness has no account writes
   and does not cover the complete online HUD/network lifecycle.

Screenshot: boot-soak-failed-2026-10-04.png. Completed report remains visible
in the test browser tab. Download was requested, but no new file was confirmed
in the user's Downloads directory; no raw-report file is claimed saved here.
