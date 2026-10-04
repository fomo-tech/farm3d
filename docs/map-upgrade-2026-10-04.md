# Map upgrade — 2026-10-04

## Current integration blocker

NOT COMPLETE. During this pass another edit replaced the scheduled meadow
construction in FarmWorld.js with `this.livingMeadow = null` and a comment
explicitly removing grass/flower spikes. This change was not made by this
implementation and was preserved rather than overwritten. The latest production
snapshot confirms livingMeadow is null. The earlier visual proof with grass is
not evidence for the current build. Clarify the concurrent edit's intended art
direction before restoring/replacing meadow construction. Tree batches report
enabled but woodland framing is not visually accepted either.

## Implemented in this pass

- Desktop fog: 70–160 m while streaming, 80–180 m when clear; mobile
  55–130 m and 65–145 m. Smoothed FPS and a three-second mode dwell prevent
  brief stalls from repeatedly contracting the horizon. Camera clip follows fog.
- Nearby detailed farms selected spatially: desktop entry 80 m, retention 100 m,
  maximum 16 neighbours; mobile 60/80 m, maximum 12. Far HLOD symbols remain off.
- Runtime audit in DEBUG: page ID, world creation/disposal, development HMR,
  WebGL loss/restoration. Context loss shows a fatal message, not a silent reset.
- Auto preserves one MSAA sample while changing effects; resolution-only and
  repeated quality updates do not rebuild the pipeline. Explicit Ultra still
  uses its own higher MSAA setting.
- Deterministic faceted woodland belts in all 12 villages, road/parcel/lake
  clearances. Growing foliage batches are not indexed with immutable bounds.
- 16,487 public meadow grass/flower placements, chunked GPU thin instances,
  reduced density on mobile, distance culling and no per-instance frame updates.
  No grass decoration is inserted into the 12 cultivation tiles or roads.
  The module and tests remain, but the current integration is disabled as above.
- Static farm fence/path/rim details merged per material, excluding interactive
  soil/crops and existing thin-instance pickets. Absolute bounds and negative
  village coordinates are preserved.
- Fixed undefined `estate` in farm visibility, found by production cold boot.
  Regression test executes the real visibility block with absent/existing roots.

## Verification

Landscape, meadow, decoration batching, pipeline identity, streaming, render,
camera and storefront tests passed. Asset/layout validators and production build
passed. Production preview is at 127.0.0.1:4180 (separate from Vite dev 4177).
Multiple cold boots, onboarding, map travel, walking and camera drag were tested.
The production cold-boot failure found during testing was fixed and retested.

## Acceptance limits

Not a guarantee that the original intermittent green flash is fully eliminated.
The first production traversal recorded one world creation, no HMR/context-loss
events and no frame gaps above one second, but still had 51–96 ms construction
steps and a 478 ms maximum long task. Approximate FPS was 28–36 at DPR 2 with
Auto. Do not claim 60 FPS, zero stalls, a continuous 15-minute final-build run,
real iPhone verification, or an exact visual match to the reference.

Do not reset player data or change ownership/economy for this rendering work.
